# Bootstrap Contract

## Repo
Root: `/Users/sonhoangnguyen/Documents/New project 2`

## Tech Stack
- React 19
- Vite 8
- TypeScript strict
- Vitest 4
- Playwright
- ESLint flat config
- Blockly 12
- lucide-react

## Standard Commands
Install:
```bash
npm install
```

Test:
```bash
npm test
```

Build:
```bash
npm run build
```

Lint:
```bash
npm run lint
```

Full verification:
```bash
bash scripts/harness/verify.sh
```

## High-Risk Files
Do not edit unless required:
- `src/App.tsx`
- `src/dsa/types.ts`
- `src/dsa/engine.ts`
- `src/dsa/blockly.ts`
- `package.json`
- `package-lock.json`

## Project Truth
Read in this order:
1. `AGENTS.md`
2. `docs/PRODUCT_VISION.md`
3. `docs/ARCHITECTURE.md`
4. `docs/QA_GATE.md`
5. `docs/harness/FEATURE_LIST.json`
6. `docs/harness/PROGRESS.md`

## Scope Rules
- No package installs unless explicitly approved.
- No arbitrary user code execution.
- No LeetCode import or broad problem parsing in the current MVP.
- No fake support, fake highlights, fake explanations, or stale teaching text.
- Preserve existing Puzzle and Sandbox behavior unless the active feature says otherwise.
