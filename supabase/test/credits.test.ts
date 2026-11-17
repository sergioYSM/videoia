// Credits ledger on a real Postgres: no overdraft under concurrency, refunds once, RLS.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';

const url = process.env.DATABASE_URL!;
const admin = new pg.Client({ connectionString: url });
let A = '', B = '';
async function as<T>(c: pg.Client, uid: string, fn: () => Promise<T>): Promise<T> {
  await c.query('begin');
  try { await c.query('set local role authenticated'); await c.query(`select set_config('request.jwt.claim.sub', $1, true)`, [uid]); const r = await fn(); await c.query('commit'); return r; }
  catch (e) { await c.query('rollback'); throw e; }
}
const bal = async (u: string) => (await admin.query('select balance from credit_balances where user_id = $1', [u])).rows[0].balance as number;
const start = (c: pg.Client, uid: string, cost: number) => as(c, uid, async () => (await c.query(`select start_generation('video','a cat','mock-1','dolly-in','9:16',5::smallint,$1,'mock') as id`, [cost])).rows[0].id as string);

before(async () => {
  await admin.connect();
  await admin.query(`delete from auth.users where email like '%@credits.invalid'`);
  A = (await admin.query(`insert into auth.users (email) values ('a@credits.invalid') returning id`)).rows[0].id;
  B = (await admin.query(`insert into auth.users (email) values ('b@credits.invalid') returning id`)).rows[0].id;
});
after(async () => { await admin.query(`delete from auth.users where email like '%@credits.invalid'`); await admin.end(); });

test('a new user starts at 0; a grant is applied once even if retried', async () => {
  assert.equal(await bal(A), 0);
  await admin.query(`select grant_credits($1, 100, 'purchase', 'stripe:evt_1')`, [A]);
  await admin.query(`select grant_credits($1, 100, 'purchase', 'stripe:evt_1')`, [A]);
  assert.equal(await bal(A), 100);
});

test('starting a generation charges in the same transaction; not enough credits = nothing created', async () => {
  const c = new pg.Client({ connectionString: url }); await c.connect();
  try {
  const id = await start(c, A, 30);
  assert.equal(await bal(A), 70);
  assert.equal((await admin.query('select status, cost_credits from generations where id = $1', [id])).rows[0].status, 'queued');
  const before = (await admin.query('select count(*)::int n from generations where user_id = $1', [A])).rows[0].n;
  await assert.rejects(start(c, A, 500), /insufficient_credits/);
  assert.equal((await admin.query('select count(*)::int n from generations where user_id = $1', [A])).rows[0].n, before, 'no generation without payment');
  assert.equal(await bal(A), 70);
  } finally { await c.end(); }
});

test('20 simultaneous generations of 10 credits with a balance of 70: exactly 7 succeed, never negative', async () => {
  const clients = await Promise.all(Array.from({ length: 20 }, async () => { const c = new pg.Client({ connectionString: url }); await c.connect(); return c; }));
  const results = await Promise.allSettled(clients.map((c) => start(c, A, 10)));
  await Promise.all(clients.map((c) => c.end()));
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 7);
  assert.ok(results.filter((r) => r.status === 'rejected').every((r) => /insufficient_credits/.test(String((r as PromiseRejectedResult).reason))));
  assert.equal(await bal(A), 0);
  const sum = (await admin.query('select coalesce(sum(delta),0)::int s from credit_ledger where user_id = $1', [A])).rows[0].s;
  assert.equal(sum, 0, 'ledger and balance agree');
});

test('a failed generation is refunded exactly once, even if the failure is reported twice', async () => {
  const g = (await admin.query(`select id from generations where user_id = $1 and cost_credits = 10 limit 1`, [A])).rows[0].id;
  await admin.query(`select fail_generation($1, 'provider timeout')`, [g]);
  await admin.query(`select fail_generation($1, 'provider timeout again')`, [g]);
  assert.equal(await bal(A), 10);
  const row = (await admin.query('select status, error from generations where id = $1', [g])).rows[0];
  assert.deepEqual([row.status, row.error], ['failed', 'provider timeout']);
});

test('a succeeded generation is never refunded', async () => {
  const g = (await admin.query(`select id from generations where user_id = $1 and status = 'queued' limit 1`, [A])).rows[0].id;
  await admin.query(`update generations set status = 'succeeded' where id = $1`, [g]);
  await admin.query(`select fail_generation($1, 'late failure')`, [g]);
  assert.equal(await bal(A), 10);
});

test('RLS: users see only their own generations and ledger, cannot edit balances or costs', async () => {
  const c = new pg.Client({ connectionString: url }); await c.connect();
  try {
  assert.equal((await as(c, B, async () => (await c.query('select * from generations')).rows)).length, 0);
  assert.equal((await as(c, B, async () => (await c.query('select * from credit_ledger')).rows)).length, 0);
  await assert.rejects(as(c, A, async () => c.query(`update credit_balances set balance = 9999 where user_id = $1`, [A])), /permission denied/);
  await assert.rejects(as(c, A, async () => c.query(`update generations set cost_credits = 1 where user_id = $1`, [A])), /permission denied/);
  await assert.rejects(as(c, A, async () => c.query(`select grant_credits($1, 1000, 'purchase', 'self')`, [A])), /permission denied/);
  await assert.rejects(as(c, A, async () => c.query(`select fail_generation(id, 'x') from generations limit 1`)), /permission denied/);
  const fav = await as(c, A, async () => (await c.query(`update generations set favourite = true where user_id = $1 returning id`, [A])).rows);
  assert.ok(fav.length > 0, 'favourite is allowed');
  } finally { await c.end(); }
});
