#!/usr/bin/env bash
# Applies the auth shim, every migration and the seed to a scratch database,
# then runs the SQL integration tests. Works on any local Postgres 16+ with
# pgcrypto; no Docker or Supabase needed.
#
# Usage: DATABASE_URL=postgres://postgres@localhost:5432/postgres tests/db/run.sh
set -euo pipefail
cd "$(dirname "$0")/../.."

DATABASE_URL="${DATABASE_URL:-postgres://postgres@localhost:5432/postgres}"
DB="mibbi_test_$$"

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -c "drop database if exists $DB" -c "create database $DB"
TEST_URL="${DATABASE_URL%/*}/$DB"
trap 'psql "$DATABASE_URL" -q -c "drop database if exists $DB" >/dev/null' EXIT

echo "→ auth shim"
psql "$TEST_URL" -v ON_ERROR_STOP=1 -q -f tests/db/00_auth_shim.sql

for f in supabase/migrations/*.sql; do
  echo "→ migration $(basename "$f")"
  psql "$TEST_URL" -v ON_ERROR_STOP=1 -q -f "$f"
done

echo "→ seed"
psql "$TEST_URL" -v ON_ERROR_STOP=1 -q -f supabase/seed.sql

for f in tests/db/[1-9]*.sql; do
  echo "→ test $(basename "$f")"
  psql "$TEST_URL" -v ON_ERROR_STOP=1 -q -f "$f"
done

echo "✓ all database tests passed"
