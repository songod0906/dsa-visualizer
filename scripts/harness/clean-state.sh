#!/usr/bin/env bash
set -euo pipefail

echo "== Clean state check =="

echo "Checking for debugger statements..."
if grep -R "debugger;" src --include='*.ts' --include='*.tsx'; then
  echo "ERROR: debugger statement found."
  exit 1
fi

echo "Checking for broad TODO/FIXME markers..."
if grep -R "TODO\\|FIXME" src --include='*.ts' --include='*.tsx'; then
  echo "WARNING: TODO/FIXME markers found. Confirm they are intentional."
fi

echo "Checking feature list..."
node scripts/harness/check-feature-list.mjs

echo "Checking build/test/lint..."
npm test
npm run build
npm run lint

echo "Clean state check complete."
