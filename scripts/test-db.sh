#!/usr/bin/env bash
set -euo pipefail
BASE=${PG_BASE_URL:-postgresql://postgres@127.0.0.1:54329}
DB=videoia_test
psql "$BASE/postgres" -qc "drop database if exists $DB" -qc "create database $DB"
export DATABASE_URL="$BASE/$DB"
node scripts/migrate.mjs --local-shim
node --no-warnings --test supabase/test/*.test.ts
