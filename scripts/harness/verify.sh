#!/usr/bin/env bash
set -euo pipefail

echo "== Harness verification =="

echo "== Git status =="
git status --short

echo "== Tests =="
npm test

echo "== Build =="
npm run build

echo "== Lint =="
npm run lint

echo "== Feature list sanity =="
node scripts/harness/check-feature-list.mjs

echo "== Verification complete =="
