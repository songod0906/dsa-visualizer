#!/usr/bin/env bash
set -euo pipefail

echo "== Repo =="
pwd

echo "== Git status =="
git status --short

echo "== Package scripts =="
node -e "const p=require('./package.json'); console.log(JSON.stringify(p.scripts, null, 2))"

echo "== Active feature =="
node - <<'NODE'
const fs = require('node:fs');
const path = 'docs/harness/FEATURE_LIST.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));
const active = data.features.filter((feature) => feature.state === 'active');
console.log(JSON.stringify(active, null, 2));
if (active.length > 1) {
  console.error('ERROR: More than one active feature. WIP=1 violated.');
  process.exit(1);
}
NODE
