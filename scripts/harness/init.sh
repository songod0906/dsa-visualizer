#!/usr/bin/env bash
set -euo pipefail

echo "== Harness init =="
echo "Repo: $(pwd)"

if [ ! -f package.json ]; then
  echo "ERROR: package.json not found. Run this from the repo root."
  exit 1
fi

echo "== Node =="
node --version

echo "== npm =="
npm --version

echo "== Harness status =="
bash scripts/harness/status.sh

echo "Harness init complete."
