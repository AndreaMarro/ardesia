# Bundle Optimization — Vercel OOM SIGKILL Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the main entry chunk (currently ~2.2MB) into route-level lazy chunks so Vercel remote build succeeds without the `--prebuilt` workaround, restoring single-command `npx vercel --prod --yes` deploy flow.

**Architecture:** Bundle visualizer generates ground-truth contributor map for main entry. Top contributors extracted via three orthogonal techniques: (1) `vite.config.js manualChunks(id)` extension to pull additional vendor libraries (lucide-react icons, framer-motion, etc.) into named chunks; (2) source-level `React.lazy()` boundaries on top-of-tree route components that aren't on the critical render path (Login flow, PrivacyPolicy, Admin routes, OAuth handlers); (3) tighter `chunkSizeWarningLimit` to catch future regressions. Hard target: `dist/assets/index-*.js` < 1MB after build, all chunks < 2.5MB (PWA precache hard ceiling).

**Tech Stack:** Vite 7, Rollup 4 (bundled in Vite), `rollup-plugin-visualizer` (dev-only, Step 1 verifies presence), JavaScript Obfuscator 4.x (existing), Vitest with `fs` direct reads for size assertions (no child_process).

---

## Honesty Caveats

1. **Scope of this plan**: reduce main entry chunk size to fit Vercel default build memory. Does NOT solve obfuscation latency on huge chunks beyond memory pressure (separate concern).

2. **Why this is enough for now**: the `--prebuilt` workaround works but breaks Vercel's preview deploy automation per branch. Restoring the standard pipeline unblocks all future PR preview URLs without local pre-build dance. That's the real velocity loss being solved.

3. **What this plan WON'T do**:
   - Add new npm dependencies (CLAUDE.md immutable rule 13). Uses tools already in `package.json` if present; if not present, plan flags decision point and asks Andrea before adding `rollup-plugin-visualizer` (dev-only).
   - Disable obfuscation (security feature, intentional).
   - Upgrade to Vercel Pro plan (paid, requires Andrea decision).
   - Refactor file structure of `src/` (out of scope, follows existing patterns).

4. **Confidence level**: HIGH on identifying main entry bloat (already verified: 2.2MB observed). MEDIUM on size delta achievable per split (depends on import graph specifics — exact contributors visible only after Step 3 visualizer report).

5. **Honest fallback**: if visualizer report shows main entry is mostly first-paint critical code that genuinely cannot be lazy-loaded, plan pivots to Task 11 alternative: increase Vercel build memory via `vercel.json` `functions.memory` setting OR negotiate Vercel Pro upgrade with Andrea. This pivot is a known branch, not a failure.

6. **Bundle analyzer is read-only diagnostic**: nothing the visualizer does affects production build output. It runs at dev time only.

---

## File Structure

**Create:**
- `scripts/check-bundle-size.mjs` — exports a `checkBundleSize()` function plus CLI wrapper. Used by tests AND command-line.
- `tests/integration/bundle-size-budget.test.js` — asserts main entry chunk size < 1MB plus other thresholds. Uses `fs` directly, no child_process.
- `docs/audits/2026-04-26-bundle-optimization-audit.md` — pre/post measurements + decisions.

**Modify:**
- `vite.config.js:1-4` — add `import { visualizer } from 'rollup-plugin-visualizer'`
- `vite.config.js:69-228` — add ANALYZE-mode visualizer plugin entry
- `vite.config.js:240-300` — extend `manualChunks(id)` with new vendor splits
- `vite.config.js:121-136` — extend `globIgnores` with newly created lazy chunks
- `vite.config.js:10-16` — extend `SKIP_PATTERNS` for new vendor chunks (no obfuscation needed)
- `vite.config.js:303` — lower `chunkSizeWarningLimit` from 1000 to 700 (catches future regressions earlier)
- `src/App.jsx` (or main entry router) — add `React.lazy()` boundaries on PrivacyPolicy + Login + Auth pages if not already lazy
- `package.json` — add `bundle:check` and `build:analyze` npm scripts (NO new runtime deps; possibly 1 dev dep `rollup-plugin-visualizer` with Andrea OK)
- `automa/baseline-tests.txt` — automatic via pre-commit hook

**Branch:** `perf/bundle-optimization-vercel-oom-2026-04-26`

**PR target:** main (DRAFT initially; ready when remote Vercel build verifies green).

---

## Task 1: Branch + Pre-Optimization Baseline Capture

**Files:**
- Snapshot: read-only inspection of `dist/`

- [ ] **Step 1: Verify clean working tree on main**

Run:
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git fetch --all
git checkout main
git pull origin main --quiet
git status --short
```
Expected: empty output (or only `automa/state/heartbeat` from watchdog, which is fine).

- [ ] **Step 2: Create feature branch**

Run:
```bash
git checkout -b perf/bundle-optimization-vercel-oom-2026-04-26
```
Expected: `Switched to a new branch 'perf/bundle-optimization-vercel-oom-2026-04-26'`.

- [ ] **Step 3: Fresh production build**

Run:
```bash
rm -rf dist/
npm run build 2>&1 | tee /tmp/build-pre.log
```
Expected: build completes (eventually). Note final summary line `dist/assets/index-XXXXXX.js  N kB`.

- [ ] **Step 4: Capture baseline chunk sizes**

Run:
```bash
ls -la dist/assets/*.js | awk '{print $5, $NF}' | sort -rn | head -15 | tee /tmp/baseline-chunks-pre.txt
```
Save the output. Expected: `index-*.js` is largest at ~2.2MB.

- [ ] **Step 5: Capture build log indicators**

Run:
```bash
grep -iE "(warning|exceed|chunk size)" /tmp/build-pre.log | head -10
```
Expected: a `chunk size larger than recommended` warning OR explicit chunkSizeWarningLimit hit. Save for audit doc.

- [ ] **Step 6: Verify rollup-plugin-visualizer availability**

Run:
```bash
node -e "try{import('rollup-plugin-visualizer').then(()=>console.log('OK present')).catch(()=>console.log('MISSING'))}catch(e){console.log('MISSING')}"
```
- If `OK present` → skip Step 7.
- If `MISSING` → STOP. The plan tries to use this dev dep; Andrea must approve adding it. Notify Andrea: `npm install -D rollup-plugin-visualizer` is a single dev dep with no runtime impact. Wait for explicit "OK install" before proceeding.

- [ ] **Step 7 (only if Step 6 said MISSING): Install dev dep with Andrea OK**

```bash
npm install -D rollup-plugin-visualizer@^5.12.0
```
Then commit:
```bash
git add package.json package-lock.json
git commit -m "chore(bundle): add rollup-plugin-visualizer for bundle analysis (dev only)"
```

- [ ] **Step 8: No code commit yet (only dep commit if needed)**

---

## Task 2: Bundle Visualizer Integration

**Files:**
- Modify: `vite.config.js` (top imports + plugins array)
- Modify: `package.json` (npm scripts only)

- [ ] **Step 1: Add visualizer plugin import to vite.config.js**

Modify `vite.config.js`. Replace the import block at lines 1-4:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
```
With:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'
```

- [ ] **Step 2: Add visualizer to plugins array conditionally**

Locate the plugins array (line 69 onwards). Find the obfuscator conditional (line 186 `...(mode === 'production' ? [...] : [])`). Add a separate analyze-mode conditional just before it:

```js
        // Bundle analyzer — runs only when ANALYZE=1 env set, never in normal builds
        ...(process.env.ANALYZE === '1' ? [visualizer({
            filename: 'dist/bundle-stats.html',
            template: 'treemap',
            gzipSize: true,
            brotliSize: true,
            sourcemap: false,
            open: false,
        })] : []),
```

Place this directly before the obfuscator block (line 186 in original). The new block goes between `}),` (closing `VitePWA`) and `...(mode === 'production' ? ...)`.

- [ ] **Step 3: Add npm scripts**

Modify `package.json`. In the `scripts` section, add (preserve existing scripts; insert alphabetically near `build`):

```json
    "build:analyze": "ANALYZE=1 npm run build",
    "bundle:check": "node scripts/check-bundle-size.mjs",
```

Verify by running:
```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('package.json')).scripts['build:analyze'])"
```
Expected: `ANALYZE=1 npm run build`.

- [ ] **Step 4: Test analyzer integration**

Run:
```bash
npm run build:analyze 2>&1 | tail -5
```
Expected: build succeeds, stats file written.

```bash
test -f dist/bundle-stats.html && echo "OK stats present"
```
Expected: `OK stats present`. File is ~500KB-2MB depending on bundle size.

- [ ] **Step 5: Commit**

Run:
```bash
git add vite.config.js package.json
git commit -m "chore(bundle): add bundle:analyze script and visualizer plugin"
```

---

## Task 3: Bundle Size Budget Script + Test (TDD RED)

**Files:**
- Create: `scripts/check-bundle-size.mjs` (exports function + CLI wrapper)
- Create: `tests/integration/bundle-size-budget.test.js` (imports function, no child_process)

- [ ] **Step 1: Write the size budget script (function + CLI)**

Create `scripts/check-bundle-size.mjs`:
```javascript
#!/usr/bin/env node
/**
 * Bundle size budget guard.
 * Exports a `checkBundleSize()` function for tests and a CLI wrapper.
 *
 * Budgets (uncompressed bytes):
 *   index-*.js (main entry)        : 1_000_000  (1 MB)
 *   ElabTutorV4-*.js (tutor shell) : 2_000_000  (2 MB)
 *   NewElabSimulator-*.js          : 1_500_000  (1.5 MB)
 *   ScratchEditor-*.js             : 1_500_000  (Blockly)
 *   react-pdf-*.js                 : 2_500_000  (PDF.js — vendor, hard to split)
 *   *  (any other chunk)           :   700_000  (700 KB default)
 */
import { readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

export const DEFAULT_ASSETS_DIR = 'dist/assets';
export const DEFAULT_BUDGET = 700_000;
export const HARD_PRECACHE_CEILING = 2_500_000;

export const DEFAULT_BUDGETS = [
  { pattern: /^index-[^.]+\.js$/, budget: 1_000_000, label: 'main entry' },
  { pattern: /^ElabTutorV4-[^.]+\.js$/, budget: 2_000_000, label: 'tutor shell' },
  { pattern: /^NewElabSimulator-[^.]+\.js$/, budget: 1_500_000, label: 'simulator core' },
  { pattern: /^ScratchEditor-[^.]+\.js$/, budget: 1_500_000, label: 'scratch (Blockly)' },
  { pattern: /^react-pdf-[^.]+\.js$/, budget: 2_500_000, label: 'react-pdf (vendor)' },
];

function findBudget(filename, budgets = DEFAULT_BUDGETS) {
  for (const b of budgets) {
    if (b.pattern.test(filename)) return b;
  }
  return { pattern: /.*/, budget: DEFAULT_BUDGET, label: 'default' };
}

/**
 * Check bundle sizes against budgets.
 * @param {object} opts
 * @param {string} [opts.assetsDir=DEFAULT_ASSETS_DIR]
 * @param {Array} [opts.budgets=DEFAULT_BUDGETS]
 * @returns {{violations: Array, reports: Array, exists: boolean}}
 */
export function checkBundleSize(opts = {}) {
  const assetsDir = opts.assetsDir ?? DEFAULT_ASSETS_DIR;
  const budgets = opts.budgets ?? DEFAULT_BUDGETS;

  if (!existsSync(assetsDir)) {
    return { violations: [], reports: [], exists: false };
  }

  const files = readdirSync(assetsDir).filter(f => f.endsWith('.js'));
  const reports = [];
  const violations = [];

  for (const f of files) {
    const size = statSync(join(assetsDir, f)).size;
    const { budget, label } = findBudget(f, budgets);
    const ok = size <= budget;
    reports.push({ file: f, size, budget, label, ok });
    if (!ok) violations.push({ file: f, size, budget, label });
  }

  reports.sort((a, b) => b.size - a.size);
  return { violations, reports, exists: true };
}

// CLI wrapper — only runs when script invoked directly, not when imported
const isMain = (() => {
  try {
    return process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
  } catch {
    return false;
  }
})();

if (isMain) {
  const result = checkBundleSize();
  if (!result.exists) {
    console.error(`ERR: ${DEFAULT_ASSETS_DIR} not found. Run 'npm run build' first.`);
    process.exit(2);
  }

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ violations: result.violations, reports: result.reports }, null, 2));
  } else {
    console.log('Bundle size budget report:');
    console.log('');
    for (const r of result.reports.slice(0, 20)) {
      const sizeKb = (r.size / 1024).toFixed(0);
      const budgetKb = (r.budget / 1024).toFixed(0);
      const mark = r.ok ? 'OK ' : 'XX ';
      console.log(`  ${mark} ${sizeKb.padStart(6)} KB / ${budgetKb.padStart(6)} KB  [${r.label}]  ${r.file}`);
    }
    console.log('');
    if (result.violations.length > 0) {
      console.log(`FAIL: ${result.violations.length} chunk(s) over budget.`);
      for (const v of result.violations) {
        const overKb = ((v.size - v.budget) / 1024).toFixed(0);
        console.log(`  - ${v.file}: ${overKb} KB over (${v.label})`);
      }
      process.exit(1);
    }
    console.log(`PASS: all ${result.reports.length} chunks within budget.`);
  }
}
```

- [ ] **Step 2: Make script executable**

Run:
```bash
chmod +x scripts/check-bundle-size.mjs
```

- [ ] **Step 3: Run script against current build to confirm RED**

Run:
```bash
npm run bundle:check
```
Expected: exits 1 (or 2 if no `dist/`). At least one violation on `index-*.js` since it's currently ~2.2MB > 1MB budget.

- [ ] **Step 4: Write failing test importing the function (NO child_process)**

Create `tests/integration/bundle-size-budget.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { checkBundleSize, HARD_PRECACHE_CEILING } from '../../scripts/check-bundle-size.mjs';

describe('Bundle size budget — Vercel OOM remediation', () => {
  it('produces a dist/assets/ directory after build', () => {
    expect(existsSync('dist/assets')).toBe(true);
  });

  it('main entry chunk is < 1MB (post-optimization target)', () => {
    const files = readdirSync('dist/assets').filter(f => /^index-[^.]+\.js$/.test(f));
    expect(files.length).toBeGreaterThanOrEqual(1);
    for (const f of files) {
      const size = statSync(join('dist/assets', f)).size;
      // INTENTIONALLY RED until Tasks 5-9 splits land. Pre-optimization size ~2.2MB.
      expect(size, `${f} should be < 1MB`).toBeLessThan(1_000_000);
    }
  });

  it('all chunks within their respective budgets', () => {
    const result = checkBundleSize();
    if (result.violations.length > 0) {
      // Pretty-print violations for debugging when this test fails
      for (const v of result.violations) {
        const overKb = ((v.size - v.budget) / 1024).toFixed(0);
        console.error(`Violation: ${v.file} is ${overKb} KB over budget (${v.label})`);
      }
    }
    expect(result.violations).toEqual([]);
  });

  it('no chunk exceeds 2.5MB (PWA precache hard ceiling)', () => {
    const files = readdirSync('dist/assets').filter(f => f.endsWith('.js'));
    const oversized = files.filter(f => statSync(join('dist/assets', f)).size > HARD_PRECACHE_CEILING);
    expect(oversized).toEqual([]);
  });

  it('checkBundleSize returns expected shape', () => {
    const result = checkBundleSize();
    expect(result).toHaveProperty('violations');
    expect(result).toHaveProperty('reports');
    expect(result).toHaveProperty('exists');
    expect(Array.isArray(result.violations)).toBe(true);
    expect(Array.isArray(result.reports)).toBe(true);
  });
});
```

- [ ] **Step 5: Run test to verify RED**

Run:
```bash
npx vitest run tests/integration/bundle-size-budget.test.js
```
Expected: 3 PASS (existence, shape, ceiling), 2 FAIL (main entry > 1MB, violations not empty). The RED state is intentional — Tasks 5-9 will turn it GREEN.

- [ ] **Step 6: Commit RED test + script**

Run:
```bash
git add scripts/check-bundle-size.mjs tests/integration/bundle-size-budget.test.js
git commit -m "test(bundle): RED size budget assertion + check-bundle-size script"
```

---

## Task 4: Read Visualizer Report — Identify Top Main Entry Contributors

**Files:**
- Read-only: `dist/bundle-stats.html` (visualizer treemap, parse via grep)

- [ ] **Step 1: Re-run analyze build to ensure stats fresh**

Run:
```bash
rm -rf dist/
npm run build:analyze
```
Expected: success. `dist/bundle-stats.html` exists.

- [ ] **Step 2: Extract top contributors via grep on stats HTML**

The visualizer embeds JSON data inside the HTML. Run:
```bash
grep -oE '"name":"[^"]+","statSize":[0-9]+' dist/bundle-stats.html \
  | sed 's/"name":"//' | sed 's/","statSize":/ /' \
  | sort -k2 -rn | head -30
```
Expected: list of top 30 modules by raw size, e.g.:
```
src/components/lavagna/LavagnaShell.jsx 350123
node_modules/lucide-react/dist/icons.js 240567
node_modules/framer-motion/dist/index.js 180000
```

If the regex doesn't match (visualizer format varies by version), fallback: open `dist/bundle-stats.html` in browser to read treemap directly. Save top 10 contributors to `/tmp/top-contributors.txt` manually.

- [ ] **Step 3: Map contributors to chunks**

Note which top contributors are in the `index-*.js` main entry vs already in named chunks (codemirror, react-pdf, etc.).

Run:
```bash
node -e "
import('fs').then(fs => {
  const indexFiles = fs.readdirSync('dist/assets').filter(f => /^index-[^.]+\.js$/.test(f));
  for (const f of indexFiles) {
    const content = fs.readFileSync('dist/assets/' + f, 'utf-8');
    const candidates = ['lucide-react', 'framer-motion', 'tabler-icons', 'react-icons', '@radix-ui', 'date-fns'];
    for (const c of candidates) {
      if (content.includes(c)) console.log(f, 'includes', c);
    }
  }
});
"
```
This identifies which vendor libraries are in the main entry awaiting extraction.

- [ ] **Step 4: Document findings in audit doc draft**

Create scaffold `docs/audits/2026-04-26-bundle-optimization-audit.md`:
```markdown
# Bundle Optimization Audit

## Pre-optimization baseline

(paste from /tmp/baseline-chunks-pre.txt)

## Top main entry contributors (visualizer)

(paste from Step 2 grep output, top 10)

## Identified extraction targets

1. lucide-react (estimated savings: XX KB, confirmed in main entry)
2. framer-motion (estimated savings: XX KB, confirmed in main entry)
3. ...

## Decisions

(filled in Task 5+)
```

- [ ] **Step 5: No commit (audit doc finalized in Task 12)**

---

## Task 5: Extract Top Vendor Library 1 (TDD GREEN incremental)

**Files:**
- Modify: `vite.config.js` `manualChunks(id)` (line 240-300)

This task assumes Step 2-3 of Task 4 identified `lucide-react` as #1 extraction target. If your visualizer named a different library, substitute that name in the rule below. Pattern is the same.

- [ ] **Step 1: Verify lucide-react is in package.json**

Run:
```bash
node -e "const p=require('./package.json'); console.log(p.dependencies['lucide-react'] || p.devDependencies['lucide-react'] || 'NOT PRESENT')"
```
Expected: a version string. If `NOT PRESENT`, the library wasn't actually a contributor — skip to Task 6 with the next-largest contributor.

- [ ] **Step 2: Add manualChunks rule for lucide-react**

Modify `vite.config.js`. In the `manualChunks(id)` function (around line 240-300), find the `// --- App data splits` comment (~line 288). Just BEFORE that comment, insert:

```javascript
                    // Lucide-react icons (large icon set, used across UI)
                    if (id.includes('node_modules/lucide-react/')) {
                        return 'lucide-icons';
                    }
```

- [ ] **Step 3: Add new chunk to PWA globIgnores (lazy precache)**

Modify `vite.config.js` `globIgnores` array (lines 121-136). Add to the array:
```javascript
                    'assets/lucide-icons*',
```

- [ ] **Step 4: Add to obfuscator SKIP_PATTERNS (vendor, no obfuscation)**

Modify `vite.config.js` `SKIP_PATTERNS` array (lines 10-16). Add `'lucide-icons'`:
```javascript
    const SKIP_PATTERNS = [
        'react-vendor', 'mammoth', 'codemirror', 'avr-',
        'html2canvas', 'react-pdf', 'DashboardGestionale',
        'ElabTutorV4',
        'ScratchEditor',
        'recharts', 'd3-vendor', 'supabase', 'experiments-vol',
        'lucide-icons',  // 2026-04-26: vendor icons, no need to obfuscate
    ];
```

- [ ] **Step 5: Rebuild and measure delta**

Run:
```bash
rm -rf dist/
npm run build 2>&1 | tail -3
npm run bundle:check 2>&1 | head -25
```
Expected: `dist/assets/lucide-icons-*.js` now exists. `index-*.js` size dropped by the lucide-react contribution. Note new sizes.

- [ ] **Step 6: Verify dev server still works**

Run:
```bash
timeout 15 npm run dev 2>&1 | head -20
```
Expected: dev server starts, prints local URL, no module resolution errors. Kill after verification.

- [ ] **Step 7: Commit**

Run:
```bash
git add vite.config.js
git commit -m "perf(bundle): extract lucide-react into separate chunk"
```

---

## Task 6: Extract Top Vendor Library 2

**Files:**
- Modify: `vite.config.js` `manualChunks(id)`

This task targets the #2 contributor identified in Task 4. Substitute the actual library name from your audit. Below shows the pattern with `framer-motion` as example.

- [ ] **Step 1: Verify library in deps**

Run:
```bash
node -e "const p=require('./package.json'); console.log(p.dependencies['framer-motion'] || p.devDependencies['framer-motion'] || 'NOT PRESENT')"
```
If NOT PRESENT, substitute the next contributor.

- [ ] **Step 2: Add manualChunks rule**

Modify `vite.config.js`. After the `lucide-icons` block from Task 5, add:
```javascript
                    // framer-motion (animation library)
                    if (id.includes('node_modules/framer-motion/')) {
                        return 'framer-motion';
                    }
```

- [ ] **Step 3: Add to globIgnores + SKIP_PATTERNS**

Same pattern as Task 5. Append `'assets/framer-motion*'` to globIgnores, `'framer-motion'` to SKIP_PATTERNS.

- [ ] **Step 4: Rebuild + measure**

Run:
```bash
rm -rf dist/
npm run build 2>&1 | tail -3
npm run bundle:check 2>&1 | head -25
```
Note new `index-*.js` size. Should be lower than after Task 5.

- [ ] **Step 5: Commit**

Run:
```bash
git add vite.config.js
git commit -m "perf(bundle): extract framer-motion into separate chunk"
```

---

## Task 7: Extract Top Vendor Library 3

**Files:**
- Modify: `vite.config.js` `manualChunks(id)`

Substitute actual #3 contributor from Task 4 visualizer report. Same exact pattern as Task 5/6.

- [ ] **Step 1: Verify in deps**

Run (substitute actual library name from Task 4):
```bash
node -e "const p=require('./package.json'); const libname='LIBNAME_FROM_AUDIT'; console.log(p.dependencies[libname] || p.devDependencies[libname] || 'NOT PRESENT')"
```
Replace `LIBNAME_FROM_AUDIT` with the audit-identified candidate. If 0 results, skip to next candidate from Task 4 list.

- [ ] **Step 2: Add manualChunks rule**

Pattern (substitute LIBNAME and CHUNK_NAME from audit):
```javascript
                    // LIBNAME — purpose: <one-line from audit>
                    if (id.includes('node_modules/LIBNAME/')) {
                        return 'CHUNK_NAME';
                    }
```

- [ ] **Step 3: Update globIgnores + SKIP_PATTERNS**

Pattern same as Task 5/6. Add `'assets/CHUNK_NAME*'` to globIgnores, `'CHUNK_NAME'` to SKIP_PATTERNS.

- [ ] **Step 4: Rebuild + measure**

Run:
```bash
rm -rf dist/
npm run build 2>&1 | tail -3
npm run bundle:check 2>&1 | head -25
```

- [ ] **Step 5: Commit (skip if size delta < 50KB — not worth a chunk)**

Run only if delta significant:
```bash
git add vite.config.js
git commit -m "perf(bundle): extract LIBNAME into separate chunk"
```

If delta < 50KB, revert this task's vite.config.js changes:
```bash
git checkout vite.config.js
```
And move to Task 8.

---

## Task 8: Lazy-Load PrivacyPolicy + Login Routes (TDD)

**Files:**
- Read+Modify: `src/App.jsx` (or main router)
- Test: `tests/unit/lazy-routes.smoke.test.js` (new)

PrivacyPolicy + Login + Auth-flow components are NOT on the critical first-paint path for most users (students go directly to lavagna, login is a second-step). Lazy-loading them removes them from the main entry chunk.

- [ ] **Step 1: Locate router/route registry**

Run:
```bash
grep -n "PrivacyPolicy\|<Login\|<Auth" src/App.jsx src/main.jsx 2>/dev/null | head -10
```
Expected: at least one match showing where these components are imported. Note file path and line numbers.

- [ ] **Step 2: Read the file to identify import block**

Read: the file from Step 1 (e.g., `src/App.jsx`), focusing on top-of-file imports.

Identify:
- `import PrivacyPolicy from '...'` (eager) — to convert to lazy
- `import Login from '...'` (eager) — to convert to lazy
- Any other auth/admin route eager imports

- [ ] **Step 3: Write smoke test asserting lazy boundaries exist**

Create `tests/unit/lazy-routes.smoke.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';

describe('Lazy route boundaries — bundle optimization', () => {
  it('PrivacyPolicy is lazy-imported, not eager', () => {
    const appCode = readFileSync('src/App.jsx', 'utf-8');
    const hasEagerImport = /^import\s+PrivacyPolicy\s+from/m.test(appCode);
    const hasLazyImport = /lazy\(\s*\(\)\s*=>\s*import\(['"][^'"]*PrivacyPolicy/m.test(appCode);
    expect(hasEagerImport, 'PrivacyPolicy should NOT be statically imported').toBe(false);
    expect(hasLazyImport, 'PrivacyPolicy must be inside lazy(() => import(...))').toBe(true);
  });

  it('Login is lazy-imported, not eager in App.jsx', () => {
    const appCode = readFileSync('src/App.jsx', 'utf-8');
    const hasEagerImport = /^import\s+Login\s+from/m.test(appCode);
    expect(hasEagerImport, 'Login should NOT be statically imported in App.jsx').toBe(false);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run:
```bash
npx vitest run tests/unit/lazy-routes.smoke.test.js
```
Expected: at least 1 FAIL. The eager import is currently present.

- [ ] **Step 5: Convert eager imports to React.lazy**

Modify `src/App.jsx` (or whichever router file Step 1 identified). Replace eager:
```jsx
import PrivacyPolicy from './components/common/PrivacyPolicy';
import Login from './components/auth/Login';
```
With lazy:
```jsx
import { lazy, Suspense } from 'react';

const PrivacyPolicy = lazy(() => import('./components/common/PrivacyPolicy'));
const Login = lazy(() => import('./components/auth/Login'));
```

If `lazy` and `Suspense` are already imported elsewhere in the file, just remove the eager import lines and add the `lazy()` declarations near other lazy declarations.

Wherever `<PrivacyPolicy />` or `<Login />` is rendered, ensure it's wrapped in `<Suspense fallback={...}>`. If the parent doesn't have one, add:
```jsx
<Suspense fallback={<div className="loading-fallback">Caricamento...</div>}>
  <PrivacyPolicy />
</Suspense>
```

- [ ] **Step 6: Re-run test to verify GREEN**

Run:
```bash
npx vitest run tests/unit/lazy-routes.smoke.test.js
```
Expected: PASS (2/2).

- [ ] **Step 7: Rebuild + measure**

Run:
```bash
rm -rf dist/
npm run build 2>&1 | tail -3
npm run bundle:check 2>&1 | head -15
```
Expected: new chunks `dist/assets/PrivacyPolicy-*.js` and `dist/assets/Login-*.js`. Main entry size dropped further.

- [ ] **Step 8: Verify dev server still loads correctly**

Run:
```bash
timeout 20 npm run dev > /tmp/dev-server.log 2>&1 &
sleep 8
curl -sI http://localhost:5173/ | head -3
pkill -f "npm run dev" 2>/dev/null || true
```
Expected: HTTP 200 from dev server. Process killed cleanly.

- [ ] **Step 9: Commit**

Run:
```bash
git add src/App.jsx tests/unit/lazy-routes.smoke.test.js
git commit -m "perf(bundle): lazy-load PrivacyPolicy + Login routes"
```

---

## Task 9: Lower chunkSizeWarningLimit + Verify Size Budget GREEN

**Files:**
- Modify: `vite.config.js:303`

- [ ] **Step 1: Lower chunkSizeWarningLimit**

Modify `vite.config.js` line 303. Replace:
```javascript
        chunkSizeWarningLimit: 1000,
```
With:
```javascript
        chunkSizeWarningLimit: 700,
```

- [ ] **Step 2: Run full vitest suite**

Run:
```bash
npx vitest run 2>&1 | tail -5
```
Expected: PASS count = baseline + new tests (Tasks 3, 8). NO regression.

- [ ] **Step 3: Run bundle:check**

Run:
```bash
rm -rf dist/
npm run build 2>&1 | tail -10
npm run bundle:check
```

- IF exit 0 (all GREEN): proceed to Task 10
- IF still FAIL on `index-*.js`: continue with Step 3b iteration

- [ ] **Step 3b (only if still RED): Iterative additional split**

Run analyze build:
```bash
rm -rf dist/
npm run build:analyze
```

Repeat Task 4 Steps 1-2 to find the new top contributor in `index-*.js`. Apply Task 5 pattern with the new target. Loop until budget GREEN or until contributors are all < 100KB each (point of diminishing returns).

If after 3 iterations main entry still > 1MB AND remaining contributors are all small (no single library > 100KB), the bottleneck is genuine first-paint code (not lazy-loadable). Pivot to Task 11 alternative path (Vercel build memory increase).

- [ ] **Step 4: Verify pre-commit hook still passes**

Run a no-op commit dry-run:
```bash
git status
echo "Bundle optimization checkpoint" > /tmp/checkpoint-note.txt
head -5 automa/baseline-tests.txt
```
Expected: baseline file readable, current count visible.

- [ ] **Step 5: Commit warning limit change**

Run:
```bash
git add vite.config.js
git commit -m "chore(bundle): lower chunkSizeWarningLimit 1000 to 700"
```

---

## Task 10: Vercel Remote Build Verification

**Files:** none (deploy infrastructure verification)

This task verifies the actual Vercel build (no `--prebuilt`) succeeds with the new bundle. This is the WHOLE POINT of the optimization plan. Do NOT skip.

- [ ] **Step 1: Push branch to remote**

Run:
```bash
git push -u origin perf/bundle-optimization-vercel-oom-2026-04-26
```
Expected: branch published, PR creation hint URL printed.

- [ ] **Step 2: Trigger Vercel preview build (without --prebuilt)**

Run:
```bash
npx vercel --yes 2>&1 | tee /tmp/vercel-deploy.log
```

NOTE: this is a PREVIEW deploy (not `--prod`). It tests the build pipeline against Vercel's remote infrastructure. The same memory limits apply. If build succeeds here, the OOM is resolved.

Expected outcome A (success): build completes, preview URL printed.
Expected outcome B (still OOM): SIGKILL message in log → optimization insufficient, pivot to Task 11.

- [ ] **Step 3: Inspect log for memory or signal indicators**

Run:
```bash
grep -iE "(killed|sigkill|out of memory|heap|memory|exceeded)" /tmp/vercel-deploy.log | head -10
```
- If empty: build did NOT hit memory issue → SUCCESS path.
- If matches present: build hit memory issue → Task 11 alternative.

- [ ] **Step 4 (success path): Verify preview URL**

Extract preview URL from `/tmp/vercel-deploy.log`. Run:
```bash
PREVIEW_URL=$(grep -oE 'https://[a-z0-9-]+\.vercel\.app' /tmp/vercel-deploy.log | tail -1)
echo "Preview URL: $PREVIEW_URL"
curl -sI "$PREVIEW_URL" | head -3
```
Expected: HTTP 200 from preview URL. App loads.

- [ ] **Step 5: Manual smoke test of preview**

In a browser (Andrea's), open `$PREVIEW_URL`. Verify:
- Lavagna page renders
- No console errors related to chunk loading
- Lazy chunks load on navigation (PrivacyPolicy, Login)

- [ ] **Step 6: Document SUCCESS in audit doc**

Append to `docs/audits/2026-04-26-bundle-optimization-audit.md`:
```markdown
## Vercel remote build verification

- Branch: perf/bundle-optimization-vercel-oom-2026-04-26
- Preview URL: <paste>
- Build duration: <paste from log>
- Build memory: NO OOM observed
- HTTP 200: confirmed
- Smoke test: golden path passed (Andrea/manual)
```

- [ ] **Step 7: No commit (audit doc finalizes in Task 12)**

---

## Task 11: ALTERNATIVE PATH — Vercel Memory Increase (only if Task 10 still OOM)

**Files:**
- Modify (or create): `vercel.json`

Skip this task if Task 10 succeeded. This is a known fallback branch.

- [ ] **Step 1: Read existing vercel.json**

Run:
```bash
cat vercel.json 2>/dev/null || echo "no vercel.json present"
```
Note current configuration.

- [ ] **Step 2: Discuss with Andrea**

If `vercel.json` exists and has no `build.memory` setting, propose adding:
```json
{
  "build": {
    "memory": 8192
  }
}
```

This requires Vercel Pro plan ($20/mo Andrea side). Costs vs benefits:
- Pro plan: paid; unblocks bigger build memory + advanced analytics
- Stay on Hobby + keep `--prebuilt` workaround: free; builds locally always

Andrea decides. STOP HERE waiting for explicit decision.

- [ ] **Step 3 (if Andrea OKs Pro upgrade): Apply config change**

Run:
```bash
node -e "
const fs = require('fs');
let cfg = {};
try { cfg = JSON.parse(fs.readFileSync('vercel.json','utf-8')); } catch {}
cfg.build = cfg.build || {};
cfg.build.memory = 8192;
fs.writeFileSync('vercel.json', JSON.stringify(cfg, null, 2) + '\n');
console.log('vercel.json updated');
"
git add vercel.json
git commit -m "infra(vercel): increase build memory to 8GB (Pro plan)"
git push
```

Re-run Task 10 Step 2 to verify.

- [ ] **Step 4 (if Andrea declines Pro): Document decision + close branch**

Append to audit doc:
```markdown
## Pivot decision

Bundle optimization landed N MB savings (X% main entry reduction).
Vercel Hobby plan still hits memory limit at remote build time.
Andrea decision: keep --prebuilt workaround for now.
Re-evaluate when 1st paying school justifies Vercel Pro upgrade.
```

Convert PR to ready or close, per Andrea instruction.

---

## Task 12: Audit Doc + Pre-commit Sanity

**Files:**
- Finalize: `docs/audits/2026-04-26-bundle-optimization-audit.md`

- [ ] **Step 1: Capture post-optimization state**

Run:
```bash
ls -la dist/assets/*.js | awk '{print $5, $NF}' | sort -rn | head -15 > /tmp/baseline-chunks-post.txt
diff /tmp/baseline-chunks-pre.txt /tmp/baseline-chunks-post.txt | head -40
```

- [ ] **Step 2: Finalize audit doc**

Edit `docs/audits/2026-04-26-bundle-optimization-audit.md` to include the FINAL form:
```markdown
# Bundle Optimization Audit

**Date:** 2026-04-26
**Branch:** perf/bundle-optimization-vercel-oom-2026-04-26
**Status:** [SUCCESS | PIVOT | DEFERRED] (fill in based on Task 10 outcome)

## Problem statement

Vercel remote `npm run build` SIGKILL OOM observed during deploy. Workaround:
local `npm run build` + `npx vercel --prod --prebuilt --yes`. Velocity loss:
preview deploys per branch broken; CI/CD requires custom flag.

## Pre-optimization

(paste /tmp/baseline-chunks-pre.txt)

## Top contributors identified (visualizer)

(paste from Task 4 Step 2)

## Splits applied

1. lucide-react → lucide-icons chunk (Task 5, savings: XX KB)
2. framer-motion → framer-motion chunk (Task 6, savings: XX KB)
3. <other> → <chunk> (Task 7, savings: XX KB)
4. PrivacyPolicy + Login → lazy routes (Task 8, savings: XX KB)
5. chunkSizeWarningLimit 1000 → 700 (Task 9, future regression catch)

## Post-optimization

(paste /tmp/baseline-chunks-post.txt)

## Vercel remote build outcome

(from Task 10 Step 6)

## Test coverage

- `tests/integration/bundle-size-budget.test.js` (5 tests)
- `tests/unit/lazy-routes.smoke.test.js` (2 tests)
- `scripts/check-bundle-size.mjs` (CLI guard, exports `checkBundleSize()`)

## Honesty caveats

1. Savings are uncompressed bytes; Vercel/CDN serves gzip+brotli (~70% reduction).
   Real network impact is the gzip number, but build memory impact uses raw size.
2. Lazy routes incur first-load delay on PrivacyPolicy/Login navigation
   (one-time chunk fetch ~30-50KB after routing). Acceptable for non-critical-path UI.
3. Future regression risk: any new large dep added to a lazy-loaded page
   inflates main entry until added to manualChunks. Mitigation: bundle:check
   in pre-push hook (left for Sprint 7 enforcement).

## Next steps

- Add `npm run bundle:check` to pre-push hook (Sprint 7 separate change)
- Vercel preview deploys re-enabled per branch (no --prebuilt)
- CI workflow simplified (remove --prebuilt fallback)
```

- [ ] **Step 3: Commit audit doc**

Run:
```bash
git add docs/audits/2026-04-26-bundle-optimization-audit.md
git commit -m "docs(audit): bundle optimization audit doc with measurements"
```

- [ ] **Step 4: Push final commits**

Run:
```bash
git push origin perf/bundle-optimization-vercel-oom-2026-04-26
```

---

## Task 13: Create Draft PR + Andrea Review Gate

**Files:** none (PR creation)

- [ ] **Step 1: Create draft PR**

Run:
```bash
gh pr create --draft --title "perf(bundle): split main entry to fix Vercel OOM" --body "$(cat <<'EOF'
## Summary

Vercel remote build hit SIGKILL OOM on main entry chunk (~2.2 MB)
during obfuscation pass. This PR splits main entry into route-level
lazy chunks so remote build fits within Vercel Hobby memory limits,
restoring single-command deploy flow.

## Changes

- `vite.config.js`: extended `manualChunks(id)` with vendor splits
  (lucide-icons, framer-motion, plus identified visualizer top contributors)
- `vite.config.js`: extended `globIgnores` + `SKIP_PATTERNS` for new chunks
- `vite.config.js`: lowered `chunkSizeWarningLimit` 1000 to 700
- `src/App.jsx`: lazy-loaded PrivacyPolicy + Login routes
- `package.json`: added `bundle:check` and `build:analyze` npm scripts (no new runtime deps)
- `scripts/check-bundle-size.mjs`: bundle size budget exports + CLI guard
- `tests/integration/bundle-size-budget.test.js`: budget assertions (no child_process)
- `tests/unit/lazy-routes.smoke.test.js`: lazy boundary assertions

## Test plan

- [ ] vitest baseline +7 tests, no regression
- [ ] `npm run bundle:check` PASS (all chunks within budget)
- [ ] Manual: open Vercel preview URL, verify HTTP 200 + lavagna renders
- [ ] Manual: navigate to /privacy → PrivacyPolicy chunk loads on demand (network tab)
- [ ] Manual: dev server `npm run dev` HMR unchanged
- [ ] Andrea explicit OK before merge to main

## Honesty caveats

1. Savings measured in uncompressed bytes; gzip/brotli reduces by ~70%
2. Lazy routes add first-navigation delay (~30-50ms chunk fetch)
3. Pre-push bundle:check hook NOT included in this PR (Sprint 7)

## References

- Audit: `docs/audits/2026-04-26-bundle-optimization-audit.md`
- Vercel OOM observation: handoff session 2026-04-25 "VERCEL DEPLOY NOTA"
- Sprint Q comp doc Sprint 7 candidate: "bundle optimization (manualChunks split)"

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
Expected: PR URL returned. Note PR number for tracking.

- [ ] **Step 2: Verify PR draft state**

Run:
```bash
gh pr view --json number,state,isDraft
```
Expected: `"isDraft": true`, `"state": "OPEN"`.

- [ ] **Step 3: Notify Andrea**

Send Andrea:
- PR URL
- Vercel preview URL (from Task 10)
- Audit doc summary
- Smoke test plan

WAIT for Andrea explicit OK before any further action.

- [ ] **Step 4: After Andrea OK, convert to ready**

Run:
```bash
gh pr ready
```

Andrea performs squash merge via GitHub UI. NEVER merge from CLI.

- [ ] **Step 5: After merge, cleanup local branch**

Wait for Andrea confirmation. Then:
```bash
git checkout main
git pull origin main --quiet
git branch -d perf/bundle-optimization-vercel-oom-2026-04-26
```

- [ ] **Step 6: Production deploy verification (Andrea explicit OK)**

After merge, Vercel auto-deploys main. Verify:
```bash
curl -sI https://www.elabtutor.school | head -3
```
Expected: HTTP 200.

Run smoke test on production:
```bash
PROD_HEAD=$(curl -s https://www.elabtutor.school | grep -oE 'index-[A-Za-z0-9_-]+\.js' | head -1)
echo "Production main chunk: $PROD_HEAD"
curl -sI "https://www.elabtutor.school/assets/$PROD_HEAD" | head -3
```
Expected: HTTP 200 on the production main chunk URL.

- [ ] **Step 7: No commit (closing op)**

---

## Self-Review Checklist

**1. Spec coverage:**
- Identify main entry contributors? Tasks 2-4 ✓
- Extract vendor libraries? Tasks 5-7 ✓
- Lazy-load non-critical routes? Task 8 ✓
- Verify size budget? Tasks 3, 9 ✓
- Verify Vercel remote build no longer OOM? Task 10 ✓
- Alternative if optimization insufficient? Task 11 ✓
- Audit doc + measurements? Tasks 4 (scaffold), 12 (final) ✓
- PR + Andrea gate? Task 13 ✓

**2. Placeholder scan:** searched plan for "TBD", "TODO", "implement later", "fill in details", "add appropriate", "similar to Task N" → 0 hits in actionable steps. (Tasks 5-7 use the words "substitute" but with explicit instruction tied to audit findings — the substitute target is ALWAYS pinned to Task 4 visualizer report output, never invented.)

**3. Type consistency:**
- `manualChunks(id)` Vite signature in Task 5/6/7 matches existing pattern at line 240-300 ✓
- `lazy(() => import(...))` syntax in Task 8 matches React lazy contract (Suspense fallback required) ✓
- `dist/assets/*.js` glob pattern in scripts/check-bundle-size.mjs matches Vite output convention ✓
- `BUDGETS` array regex patterns in script match actual chunk filename format ✓
- `checkBundleSize()` function signature in Task 3 matches test import in Task 3 Step 4 ✓
- `HARD_PRECACHE_CEILING` constant exported from script and imported by test (no magic number drift) ✓
- PR title pattern `perf(bundle): ...` matches CONTRIBUTING.md commit format ✓

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-26-bundle-optimization-vercel-oom-fix.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task, two-stage review, ~150-200K tokens. Catches visualizer report mismatches early via per-task review.

**2. Inline Execution** — tasks in this session via executing-plans, batch checkpoints at Tasks 4 (audit findings), 9 (budget gate), 10 (Vercel verify). ~200-250K tokens single session.

Andrea: which approach? Or wait for explicit "parti 13" gate alongside Sprint Q merge cascade?
