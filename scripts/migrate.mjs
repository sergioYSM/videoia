// Runs supabase/migrations/*.sql in order, once each, in a transaction.
// Usage: DATABASE_URL=... node scripts/migrate.mjs [--local-shim]
// --local-shim adds the auth stand-in for plain Postgres (tests only).
import { readFileSync, readdirSync } from 'node:fs';
import pg from 'pg';
const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL is not set'); process.exit(1); }
const c = new pg.Client({ connectionString: url });
await c.connect();
if (process.argv.includes('--local-shim')) await c.query(readFileSync('supabase/test/auth-shim.sql', 'utf8'));
await c.query('create table if not exists public._migrations (name text primary key, run_at timestamptz not null default now())');
const done = new Set((await c.query('select name from public._migrations')).rows.map((r) => r.name));
for (const f of readdirSync('supabase/migrations').filter((f) => f.endsWith('.sql')).sort()) {
  if (done.has(f)) continue;
  try {
    await c.query('begin');
    await c.query(readFileSync(`supabase/migrations/${f}`, 'utf8'));
    await c.query('insert into public._migrations (name) values ($1)', [f]);
    await c.query('commit');
    console.log('applied', f);
  } catch (e) { await c.query('rollback'); console.error('failed', f, e.message); process.exit(1); }
}
await c.end();
