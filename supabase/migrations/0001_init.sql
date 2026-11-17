-- videoia schema (Supabase Postgres). Credits are a ledger: every change is a row,
-- the balance is maintained in the same transaction, and money-like operations
-- are SQL functions so the rules (no overdraft, no double refund) live in one place.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(display_name) between 1 and 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name) values (new.id, left(coalesce(nullif(new.raw_user_meta_data->>'name',''), split_part(new.email,'@',1), 'Creador'), 60));
  insert into public.credit_balances (user_id, balance) values (new.id, 0);
  return new;
end $$;

create table public.credit_balances (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance integer not null check (balance >= 0),          -- never negative: enforced by the database
  updated_at timestamptz not null default now()
);

create table public.uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  width integer, height integer, bytes integer not null check (bytes > 0 and bytes <= 20 * 1024 * 1024),
  created_at timestamptz not null default now()
);
create index on public.uploads (user_id, created_at desc);

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('video','image')),
  status text not null default 'queued' check (status in ('queued','running','succeeded','failed','cancelled')),
  prompt text not null default '' check (length(prompt) <= 2000),
  input_upload_id uuid references public.uploads(id) on delete set null,
  model text not null,
  motion_preset text,
  aspect text not null check (aspect in ('9:16','16:9','1:1')),
  duration_s smallint not null check (duration_s between 1 and 20),
  seed bigint,
  cost_credits integer not null check (cost_credits > 0),
  provider text not null,
  provider_job_id text,
  output_path text, thumb_path text,
  error text,
  attempts smallint not null default 0,
  favourite boolean not null default false,
  created_at timestamptz not null default now(),
  started_at timestamptz, finished_at timestamptz,
  unique (provider, provider_job_id)
);
create index on public.generations (user_id, created_at desc);
create index generations_open on public.generations (status, created_at) where status in ('queued','running');

create table public.credit_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  delta integer not null check (delta <> 0),
  reason text not null check (reason in ('plan_grant','purchase','generation','refund','adjustment')),
  generation_id uuid references public.generations(id) on delete set null,
  idempotency_key text not null unique,                   -- a retried charge/refund/grant is a no-op
  balance_after integer not null check (balance_after >= 0),
  created_at timestamptz not null default now()
);
create index on public.credit_ledger (user_id, created_at desc);

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.subscriptions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  stripe_customer_id text not null unique,
  stripe_subscription_id text unique,
  plan text not null default 'none' check (plan in ('none','creator','studio')),
  status text not null default 'active' check (status in ('active','trialing','past_due','canceled','incomplete','unpaid')),
  cancel_at_period_end boolean not null default false,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);
create table public.stripe_events (id text primary key, type text not null, received_at timestamptz not null default now());

-- ───── money logic ─────
-- Internal helper: apply a delta once (idempotency key), lock the balance row, keep it >= 0.
create function public._apply_credits(p_user uuid, p_delta integer, p_reason text, p_key text, p_gen uuid default null)
returns integer language plpgsql security definer set search_path = public as $$
declare b integer;
begin
  if exists (select 1 from credit_ledger where idempotency_key = p_key) then
    select balance into b from credit_balances where user_id = p_user; return b;   -- already applied
  end if;
  select balance into b from credit_balances where user_id = p_user for update;
  if b is null then raise exception 'no balance for user' using errcode = 'P0002'; end if;
  if b + p_delta < 0 then raise exception 'insufficient_credits' using errcode = 'P0001', detail = format('balance %s, needed %s', b, -p_delta); end if;
  update credit_balances set balance = b + p_delta, updated_at = now() where user_id = p_user;
  insert into credit_ledger (user_id, delta, reason, generation_id, idempotency_key, balance_after) values (p_user, p_delta, p_reason, p_gen, p_key, b + p_delta);
  return b + p_delta;
end $$;
revoke all on function public._apply_credits(uuid, integer, text, text, uuid) from public, anon, authenticated;

-- Called by the user (RLS context): create a generation and charge it in ONE transaction.
create function public.start_generation(p_kind text, p_prompt text, p_model text, p_preset text, p_aspect text, p_duration smallint,
  p_cost integer, p_provider text, p_upload uuid default null) returns uuid
language plpgsql security definer set search_path = public as $$
declare gid uuid; uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not signed in' using errcode = '42501'; end if;
  if p_upload is not null and not exists (select 1 from uploads where id = p_upload and user_id = uid) then
    raise exception 'upload not yours' using errcode = '42501'; end if;
  insert into generations (user_id, kind, prompt, input_upload_id, model, motion_preset, aspect, duration_s, cost_credits, provider)
    values (uid, p_kind, p_prompt, p_upload, p_model, p_preset, p_aspect, p_duration, p_cost, p_provider) returning id into gid;
  perform _apply_credits(uid, -p_cost, 'generation', 'charge:' || gid, gid);
  return gid;
end $$;
revoke all on function public.start_generation(text, text, text, text, text, smallint, integer, text, uuid) from public, anon;
grant execute on function public.start_generation(text, text, text, text, text, smallint, integer, text, uuid) to authenticated;

-- Called by the server (service role) when a job fails or times out: mark failed and refund once.
create function public.fail_generation(p_gen uuid, p_error text) returns void
language plpgsql security definer set search_path = public as $$
declare g generations;
begin
  select * into g from generations where id = p_gen for update;
  if g is null or g.status in ('succeeded','failed','cancelled') then return; end if;
  update generations set status = 'failed', error = left(p_error, 500), finished_at = coalesce(finished_at, now()) where id = p_gen;
  perform _apply_credits(g.user_id, g.cost_credits, 'refund', 'refund:' || p_gen, p_gen);
end $$;
revoke all on function public.fail_generation(uuid, text) from public, anon, authenticated;

create function public.grant_credits(p_user uuid, p_amount integer, p_reason text, p_key text) returns integer
language sql security definer set search_path = public as $$ select _apply_credits(p_user, p_amount, p_reason, p_key) $$;
revoke all on function public.grant_credits(uuid, integer, text, text) from public, anon, authenticated;

-- ───── RLS ─────
alter table public.profiles enable row level security;
alter table public.credit_balances enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.uploads enable row level security;
alter table public.generations enable row level security;
alter table public.subscriptions enable row level security;
alter table public.stripe_events enable row level security;
create policy own on public.profiles for select to authenticated using (id = auth.uid());
create policy own on public.credit_balances for select to authenticated using (user_id = auth.uid());   -- read only: writes via functions
create policy own on public.credit_ledger for select to authenticated using (user_id = auth.uid());
create policy own_read on public.uploads for select to authenticated using (user_id = auth.uid());
create policy own_insert on public.uploads for insert to authenticated with check (user_id = auth.uid());
create policy own_delete on public.uploads for delete to authenticated using (user_id = auth.uid());
create policy own_read on public.generations for select to authenticated using (user_id = auth.uid());   -- insert only via start_generation
create policy own_fav on public.generations for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_delete on public.generations for delete to authenticated using (user_id = auth.uid() and status not in ('queued','running'));
create policy own on public.subscriptions for select to authenticated using (user_id = auth.uid());
-- users may only flip `favourite`: everything else is server-owned
revoke update on public.generations from authenticated;
grant update (favourite) on public.generations to authenticated;
-- Writes only through the functions above (shim/default privileges grant table writes).
revoke insert, update, delete on public.credit_balances, public.credit_ledger, public.subscriptions, public.stripe_events from authenticated, anon;
revoke insert on public.generations from authenticated, anon;
