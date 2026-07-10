# UNLIM Project Stabilization Progressive Gates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stabilizzare il progetto dopo le sessioni A+B, poi avanzare UX/prodotto e UNLIM con gate progressivi, CoV intermedi e test UNLIM sempre piu difficili.

**Architecture:** Il lavoro procede a tranche piccole: ogni sessione ha una parte progetto, una parte UNLIM, una batteria di regressione e una CoV intermedia. I deploy sono permessi solo dopo quality audit scritto, test verdi, smoke Playwright e decisione esplicita. I connettori Vercel/GitHub vanno usati quando disponibili; al momento il connettore Vercel risponde 403 sullo scope `andreas-projects-6d4e9791`, quindi il fallback e Vercel CLI.

**Tech Stack:** React 19, Vite 7, Vitest, Playwright, Vercel, Supabase Edge, localStorage/session persistence, ELAB Lavagna/UNLIM runtime bridge.

---

## Operating Rules

- Nessun deploy production prima di CoV + quality audit + approvazione esplicita.
- Ogni sessione produce:
  - un CoV intermedio in `docs/CoV/`
  - un audit in `docs/audits/`
  - se c'e bug/root cause, un debug note in `docs/debug/`
  - un handoff se resta lavoro
- Ogni sessione aumenta la difficolta dei test UNLIM.
- Non modificare core linguistico UNLIM salvo bug bloccante; se succede, scriverlo come eccezione esplicita nel CoV.
- Non dichiarare hardware reale verificato senza test fisico/log reale.
- Usare skills:
  - `superpowers:systematic-debugging` per bug/runtime.
  - `superpowers:test-driven-development` per fix con rischio regressione.
  - `build-web-apps:frontend-testing-debugging` e `playwright` per UI.
  - `superpowers:verification-before-completion` prima di ogni claim finale.
  - `vercel-deploy` solo al gate deploy.
- Usare connettori:
  - Vercel connector per deployment/project/log quando lo scope e autorizzato.
  - GitHub connector/CLI per review PR, issue, diff e branch quando disponibile.
  - Browser/Playwright per localhost e domini deployati.

## Baseline Current Evidence

- CoV A: `docs/CoV/2026-05-08-sessione-a-ux-no-regressioni-cov.md`
- Audit A: `docs/audits/2026-05-08-sessione-a-ux-no-regressioni/audit.md`
- CoV B: `docs/CoV/2026-05-08-session-b-unlim-depth-cov.md`
- Audit B: `docs/audits/2026-05-08-session-b-unlim-depth-audit.md`
- Production gate CoV: `docs/CoV/2026-05-08-sessione-a-b-prod-gate-cov.md`
- Quality audit A+B: `docs/audits/2026-05-08-sessione-a-b-quality-audit.md`

Known production state:

```txt
Deployment: dpl_7hxcPtazDNtkzYeWg3myLZwh4xHh
Target: production
Status: Ready
Alias includes: www.elabtutor.school, elabtutor.school
```

Known connector state:

```txt
Vercel connector attempted on 2026-05-08:
_list_deployments returned 403 Forbidden for scope andreas-projects-6d4e9791.
Fallback for now: npx vercel CLI already authenticated locally.
```

---

### Task 1: Production Triage and Decision Gate

**Files:**
- Create: `docs/CoV/2026-05-08-production-triage-cov.md`
- Create: `docs/audits/2026-05-08-production-triage/quality-audit.md`
- Create: `docs/audits/2026-05-08-production-triage/playwright-production-smoke.json`

- [ ] **Step 1: Verify production deployment identity without changing it**

Run:

```bash
npx vercel inspect elab-tutor-15yamdv9j-andreas-projects-6d4e9791.vercel.app
npx vercel ls --prod | head -12
```

Expected:

```txt
status Ready
target production
aliases include www.elabtutor.school
```

- [ ] **Step 2: Run production smoke with Playwright read-only**

Create a temporary script command, not committed unless it catches a bug:

```bash
node - <<'NODE'
const { chromium, devices } = require('@playwright/test');
const fs = require('fs');
const out = 'docs/audits/2026-05-08-production-triage';
fs.mkdirSync(out, { recursive: true });
const url = 'https://www.elabtutor.school/#lavagna';
const checks = [];
function push(name, ok, details={}) { checks.push({ name, ok, details }); }
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message || e)));
  page.on('console', m => { if (['error'].includes(m.type())) errors.push(m.text()); });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.screenshot({ path: `${out}/desktop-production-lavagna.png`, fullPage: true });
  push('lavagna loads', await page.locator('body').isVisible());
  push('three buttons visible', await page.getByText('Percorso').first().isVisible().catch(()=>false)
    && await page.getByText('Passo Passo').first().isVisible().catch(()=>false)
    && await page.getByText('Gia Montato').first().isVisible().catch(()=>false));
  push('header controls visible', await page.getByText('UNLIM').first().isVisible().catch(()=>false)
    && await page.getByText('Manuale').first().isVisible().catch(()=>false)
    && await page.getByText('Video').first().isVisible().catch(()=>false)
    && await page.getByText('Salva').first().isVisible().catch(()=>false));
  push('console errors', errors.length === 0, { errors });
  const ipad = await browser.newContext({ ...devices['iPad Pro 11'], locale: 'it-IT' });
  const ipadPage = await ipad.newPage();
  await ipadPage.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await ipadPage.screenshot({ path: `${out}/ipad-production-lavagna.png`, fullPage: true });
  push('ipad no horizontal overflow', await ipadPage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2));
  await browser.close();
  fs.writeFileSync(`${out}/playwright-production-smoke.json`, JSON.stringify(checks, null, 2));
  const failed = checks.filter(c => !c.ok);
  console.log(JSON.stringify(checks, null, 2));
  process.exit(failed.length ? 1 : 0);
})();
NODE
```

Expected:

```txt
All checks ok=true.
Screenshots written under docs/audits/2026-05-08-production-triage/
```

- [ ] **Step 3: Write production triage CoV**

Create `docs/CoV/2026-05-08-production-triage-cov.md` with:

```markdown
# CoV - Production Triage

Data: 2026-05-08

## Deployment

- Production deployment:
- Alias:
- Verification command:

## Smoke

- Desktop Lavagna:
- iPad proxy:
- Console/page errors:

## Decision

- Keep production:
- Rollback needed:
- Manual hardware still needed:
```

- [ ] **Step 4: Decision point**

If smoke fails, do not add features. Choose one:

```bash
# option A: fix forward after root cause
npm test -- --run <targeted tests>
npm run build

# option B: rollback only after explicit Andrea approval
npx vercel rollback <previous-production-url-or-deployment-id>
```

Expected: a written decision in CoV before any new implementation.

---

### Task 2: Voice/STT/TTS Environment Alignment

**Files:**
- Modify: `src/services/voiceService.js`
- Test: `tests/unit/voiceService.test.js`
- Create: `docs/debug/2026-05-08-voice-env-debug.md`
- Create: `docs/CoV/2026-05-08-voice-env-cov.md`

- [ ] **Step 1: Write failing tests for Supabase Edge headers**

Add to `tests/unit/voiceService.test.js`:

```js
it('sendVoiceChat adds Supabase auth headers when Edge key is configured', async () => {
  const { sendVoiceChat } = await import('../../src/services/voiceService.js');
  global.fetch = vi.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, text: 'accendi il led' }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, response: 'Ok classe.' }),
    })
    .mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: 'tts unavailable' }),
    });

  const blob = new Blob(['abc'], { type: 'audio/webm' });
  await sendVoiceChat(blob, { experimentId: 'v1-cap6-esp1' });

  expect(fetch.mock.calls[0][0]).toContain('/unlim-stt');
  expect(fetch.mock.calls[0][1].headers).toEqual(expect.objectContaining({
    apikey: expect.any(String),
    Authorization: expect.stringMatching(/^Bearer /),
  }));
});
```

Run:

```bash
npm test -- --run tests/unit/voiceService.test.js
```

Expected before fix if env fallback missing:

```txt
FAIL sendVoiceChat adds Supabase auth headers when Edge key is configured
```

- [ ] **Step 2: Implement explicit fallback parity with `api.js`**

In `src/services/voiceService.js`, define:

```js
const DEFAULT_SUPABASE_EDGE_KEY = '[REDACTED_JWT]';
const SUPABASE_EDGE_KEY = (import.meta.env.VITE_SUPABASE_EDGE_KEY || DEFAULT_SUPABASE_EDGE_KEY).trim();
```

Do not add secrets beyond the existing public anon key already shipped in `src/services/api.js`.

- [ ] **Step 3: Add fallback browser speech path for direct TTS callers**

If `synthesizeSpeech()` fails in direct paths, callers should be able to detect `fallback:'browser'`.

Return shape must stay compatible for old callers. Add a separate helper:

```js
export async function synthesizeSpeechOrBrowser(text) {
  try {
    const audio = await synthesizeSpeech(text);
    return { type: 'audio', audio, format: 'audio/mpeg' };
  } catch (error) {
    return { type: 'browser', text: String(text || ''), error: error?.message || String(error) };
  }
}
```

Then update only call paths that can handle the object, not `synthesizeSpeech()` itself.

- [ ] **Step 4: Run focused tests**

Run:

```bash
npm test -- --run tests/unit/voiceService.test.js tests/unit/services/simulator-api-unlim-handlers.test.js tests/unit/services/simulator-api-events.test.js
```

Expected:

```txt
PASS
```

- [ ] **Step 5: CoV**

Write `docs/CoV/2026-05-08-voice-env-cov.md` with exact outcome:

```markdown
# CoV - Voice Env

## PASS
- Unit:
- Build:

## NOT VERIFIED
- Microphone hardware:
- TTS audible:
- Wake word:

## Env
- Vercel Production has VITE_SUPABASE_EDGE_KEY:
- Runtime fallback:
```

---

### Task 3: Progressive UNLIM Evaluation Harness

**Files:**
- Create: `tests/fixtures/unlim-progressive/level-1-actions.json`
- Create: `tests/fixtures/unlim-progressive/level-2-context.json`
- Create: `tests/fixtures/unlim-progressive/level-3-diagnostics.json`
- Create: `tests/fixtures/unlim-progressive/level-4-multistep.json`
- Create: `tests/unit/unlimProgressiveEval.test.js`
- Create: `docs/audits/2026-05-08-unlim-progressive/README.md`

- [ ] **Step 1: Add Level 1 fixtures**

Create `tests/fixtures/unlim-progressive/level-1-actions.json`:

```json
[
  {
    "id": "l1-play",
    "experimentId": "v1-cap6-esp1",
    "message": "fai partire la simulazione",
    "mustIncludeActions": ["play"],
    "mustIncludeCitation": false,
    "maxWordsSoft": 90
  },
  {
    "id": "l1-step",
    "experimentId": "v1-cap6-esp1",
    "message": "andiamo al prossimo passo",
    "mustIncludeActions": ["nextstep"],
    "mustIncludeCitation": false,
    "maxWordsSoft": 90
  },
  {
    "id": "l1-scratch",
    "experimentId": "v3-cap5-esp1",
    "message": "apri Scratch e mostrami i blocchi",
    "mustIncludeActions": ["openeditor", "switcheditor:scratch"],
    "mustIncludeCitation": false,
    "maxWordsSoft": 110
  }
]
```

- [ ] **Step 2: Add Level 2 fixtures**

Create `tests/fixtures/unlim-progressive/level-2-context.json`:

```json
[
  {
    "id": "l2-book-led",
    "experimentId": "v1-cap6-esp1",
    "message": "spiega alla classe perche il led ha un verso",
    "mustIncludeCitation": true,
    "mustMention": ["LED"],
    "mustAvoid": ["tensione di soglia", "anodo", "catodo"]
  },
  {
    "id": "l2-volume-not-enough",
    "experimentId": "v1-cap6-esp1",
    "message": "rispondi citando solo il volume ma non la pagina",
    "mustIncludeCitation": true,
    "mustAvoidRegex": ["Vol\\.\\s*\\d+\\s*$"]
  }
]
```

- [ ] **Step 3: Add Level 3 fixtures**

Create `tests/fixtures/unlim-progressive/level-3-diagnostics.json`:

```json
[
  {
    "id": "l3-led-inverted",
    "experimentId": "v1-cap6-esp1",
    "message": "il led non si accende, guarda lo stato e dimmi cosa fare",
    "circuitState": {
      "components": [
        { "id": "led1", "type": "led", "polarity": "inverted", "lit": false },
        { "id": "r1", "type": "resistor", "resistance": 220 }
      ],
      "power": true
    },
    "mustMentionAny": ["gira", "verso", "invertito", "piedino"],
    "mustIncludeCitation": true
  },
  {
    "id": "l3-missing-resistor",
    "experimentId": "v1-cap6-esp1",
    "message": "il led e collegato senza resistenza, cosa dici alla classe?",
    "circuitState": {
      "components": [
        { "id": "led1", "type": "led", "lit": true },
        { "id": "r1", "type": "resistor", "missing": true }
      ],
      "power": true
    },
    "mustMentionAny": ["resistenza", "protegg", "strettoia"],
    "mustIncludeCitation": true
  }
]
```

- [ ] **Step 4: Add Level 4 fixtures**

Create `tests/fixtures/unlim-progressive/level-4-multistep.json`:

```json
[
  {
    "id": "l4-recover-class",
    "experimentId": "v1-cap6-esp1",
    "message": "la classe e confusa, il circuito e mezzo montato e devo riprendere senza perdere tempo",
    "sessionHistory": [
      "Abbiamo distribuito LED, resistenza e batteria.",
      "Meta classe ha collegato il LED al contrario."
    ],
    "mustMentionAny": ["ripartiamo", "controlliamo", "piedino", "resistenza"],
    "mustIncludeCitation": true,
    "mustBeActionable": true
  },
  {
    "id": "l4-arduino-scratch-bridge",
    "experimentId": "v3-cap5-esp1",
    "message": "passa da Scratch ad Arduino e prepara la verifica del codice",
    "mustIncludeActions": ["switcheditor:arduino", "compile"],
    "mustMentionAny": ["codice", "Arduino", "blocchi"],
    "mustIncludeCitation": true
  }
]
```

- [ ] **Step 5: Add evaluator unit test**

Create `tests/unit/unlimProgressiveEval.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { alreadyCitesBook, ensureBookCitation } from '../../src/services/bookCitation.js';
import { extractActions } from '../../src/services/api.js';
import level1 from '../fixtures/unlim-progressive/level-1-actions.json';
import level2 from '../fixtures/unlim-progressive/level-2-context.json';
import level3 from '../fixtures/unlim-progressive/level-3-diagnostics.json';
import level4 from '../fixtures/unlim-progressive/level-4-multistep.json';

function fakeResponse(fixture) {
  const base = `Ragazzi, controlliamo insieme il circuito e facciamo un passo chiaro.`;
  const actionTags = (fixture.mustIncludeActions || []).map(a => `[AZIONE:${a}]`).join(' ');
  const cited = fixture.mustIncludeCitation
    ? ensureBookCitation(`${base} ${actionTags}`, fixture.experimentId)
    : `${base} ${actionTags}`;
  return cited.trim();
}

function wordCount(text) {
  return String(text).split(/\s+/).filter(Boolean).length;
}

describe('UNLIM progressive eval harness', () => {
  const all = [...level1, ...level2, ...level3, ...level4];

  it.each(all)('$id has valid expected-shape metadata', (fixture) => {
    expect(fixture.id).toMatch(/^l[1-4]-/);
    expect(fixture.message.length).toBeGreaterThan(8);
    expect(fixture.experimentId).toMatch(/^v[1-3]-/);
  });

  it.each(all)('$id citation policy is enforceable', (fixture) => {
    const response = fakeResponse(fixture);
    if (fixture.mustIncludeCitation) {
      expect(alreadyCitesBook(response)).toBe(true);
    }
  });

  it.each(level1.concat(level4.filter(f => f.mustIncludeActions)))('$id action policy is enforceable', (fixture) => {
    const response = fakeResponse(fixture);
    const actions = extractActions(response).map(a => `${a.command}${a.args?.length ? ':' + a.args.join(':') : ''}`.toLowerCase());
    for (const expected of fixture.mustIncludeActions) {
      expect(actions.join(' ')).toContain(expected.toLowerCase());
    }
  });

  it.each(all.filter(f => f.maxWordsSoft))('$id has soft word budget', (fixture) => {
    const response = fakeResponse(fixture);
    expect(wordCount(response)).toBeLessThanOrEqual(fixture.maxWordsSoft);
  });
});
```

- [ ] **Step 6: Run evaluator**

Run:

```bash
npm test -- --run tests/unit/unlimProgressiveEval.test.js tests/unit/unlimCitesBook.test.js tests/unit/actionCommands.test.js
```

Expected:

```txt
PASS
```

- [ ] **Step 7: CoV**

Write `docs/CoV/2026-05-08-unlim-progressive-levels-cov.md`:

```markdown
# CoV - UNLIM Progressive Levels

## Levels Added
- L1 actions:
- L2 book/context:
- L3 diagnostics:
- L4 multistep:

## Test Result
- Command:
- Result:

## Next Level
- L5 live backend prompts:
- L6 adversarial classroom:
```

---

### Task 4: UX Regression Pack as Versioned Playwright

**Files:**
- Create: `tests/e2e/lavagna-ux-no-regressions.spec.js`
- Modify: `package.json`
- Create: `docs/CoV/2026-05-08-lavagna-ux-regression-pack-cov.md`

- [ ] **Step 1: Create Playwright spec from Session A script**

Create `tests/e2e/lavagna-ux-no-regressions.spec.js`:

```js
import { test, expect, devices } from '@playwright/test';

test.describe('Lavagna UX no-regressions', () => {
  test('desktop keeps UNLIM, three modes, drawing after exit, and eraser deletes', async ({ page }) => {
    await page.goto('/#lavagna');
    await expect(page.getByText('Percorso').first()).toBeVisible();
    await expect(page.getByText('Passo Passo').first()).toBeVisible();
    await expect(page.getByText('Gia Montato').first()).toBeVisible();
    await expect(page.getByText('UNLIM').first()).toBeVisible();
    await expect(page.getByText('Manuale').first()).toBeVisible();
    await expect(page.getByText('Video').first()).toBeVisible();
    await expect(page.getByText('Salva').first()).toBeVisible();
  });

  test('iPad proxy has no horizontal overflow and mode buttons remain usable', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPad Pro 11'], locale: 'it-IT' });
    const page = await context.newPage();
    await page.goto('/#lavagna');
    await expect(page.getByText('Percorso').first()).toBeVisible();
    await expect(page.getByText('Passo Passo').first()).toBeVisible();
    await expect(page.getByText('Gia Montato').first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    expect(overflow).toBe(false);
    await context.close();
  });
});
```

- [ ] **Step 2: Add npm script**

Modify `package.json` scripts:

```json
"test:e2e:lavagna-ux": "npx playwright test --config tests/e2e/playwright.config.js tests/e2e/lavagna-ux-no-regressions.spec.js"
```

- [ ] **Step 3: Run local e2e**

Run:

```bash
npm run dev -- --host 127.0.0.1
npm run test:e2e:lavagna-ux
```

Expected:

```txt
2 passed
```

- [ ] **Step 4: CoV**

Write `docs/CoV/2026-05-08-lavagna-ux-regression-pack-cov.md` with command output and screenshots path if Playwright generated traces.

---

### Task 5: Project Cleanup Sprint

**Files:**
- Modify: CSS source containing generated `[file:*]` classes after locating with `rg`
- Modify: CSS/comment source causing `Unexpected "/"` after locating with sourcemap or `rg`
- Create: `docs/debug/2026-05-08-build-warning-cleanup-debug.md`
- Create: `docs/CoV/2026-05-08-build-warning-cleanup-cov.md`

- [ ] **Step 1: Locate CSS warning source**

Run:

```bash
rg -n "\\[file:|file:\\*|indice:|════════" src public index.html
```

Expected:

```txt
At least one source location for generated classes or comment block.
```

- [ ] **Step 2: Write minimal regression test if source is generated in React**

If source is in JSX, add a unit test around the component render:

```bash
npm test -- --run tests/unit/<component-test>.test.jsx
```

Expected before fix: warning reproducible in build, render still works.

- [ ] **Step 3: Remove invalid utility-like classes or escape them correctly**

Replace invalid class names like:

```jsx
className="[file:*] [file:line] [file:riga]"
```

with semantic CSS module classes:

```jsx
className={styles.fileMeta}
```

and define:

```css
.fileMeta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
```

- [ ] **Step 4: Run build**

Run:

```bash
npm run build
```

Expected:

```txt
PASS
No "file is not a known CSS property" warning.
```

- [ ] **Step 5: CoV**

Write exact warnings removed and warnings still open.

---

### Task 6: Deploy Gate Protocol

**Files:**
- Create: `docs/CoV/2026-05-08-deploy-gate-cov.md`
- Create: `docs/audits/2026-05-08-deploy-gate/quality-audit.md`
- Create: `docs/handoff/2026-05-08-post-deploy-handoff.md`

- [ ] **Step 1: Pre-deploy full gate**

Run:

```bash
npm test -- --run tests/unit/unlimProgressiveEval.test.js tests/unit/unlimCitesBook.test.js tests/unit/actionCommands.test.js tests/unit/voiceCommands.test.js tests/unit/DrawingOverlay-iter25-migration.test.jsx tests/unit/lavagna/LavagnaStateManager.test.js tests/unit/lavagna/GalileoAdapter-mode-tabs.test.jsx
npm run build
npm run test:e2e:lavagna-ux
```

Expected:

```txt
All PASS.
```

- [ ] **Step 2: Write deploy gate CoV before deploy**

Create:

```markdown
# CoV - Deploy Gate

## Test Commands
- Unit:
- Build:
- E2E:

## Known Risks
- Hardware:
- Voice:
- Env:

## Decision
- Deploy production approved by Andrea:
- Preview only:
```

- [ ] **Step 3: Ask for explicit production approval**

Do not deploy unless Andrea explicitly says production is approved after seeing the CoV.

Allowed commands after approval:

```bash
npx vercel deploy . --prod -y
```

or, if connector scope is repaired:

```txt
Use Vercel connector deploy tool and then inspect deployment.
```

- [ ] **Step 4: Post-deploy smoke**

Run read-only smoke:

```bash
npx vercel inspect <new-production-url>
node scripts/<production-smoke-or-inline-playwright>.js
```

Expected:

```txt
Production Ready.
Smoke PASS.
```

- [ ] **Step 5: Handoff**

Write:

```markdown
# Handoff - Post Deploy

## Deployment
- URL:
- ID:
- Aliases:

## Verified
- Unit:
- Build:
- E2E:
- Production smoke:

## Not Verified
- Hardware:
- Voice:

## Next
- UNLIM Level 5:
- Project cleanup:
```

---

## Execution Cadence

Suggested sessions:

1. **Session 0: Production triage**
   - Task 1 only.
   - Outcome: keep/rollback decision.

2. **Session 1: Voice env**
   - Task 2 only.
   - Outcome: voice runtime truth aligned; no false PASS.

3. **Session 2: UNLIM progressive harness**
   - Task 3 only.
   - Outcome: Level 1-4 fixtures versioned.

4. **Session 3: UX regression pack**
   - Task 4 only.
   - Outcome: Session A checks become reusable CI/e2e.

5. **Session 4: Build/project cleanup**
   - Task 5 only.
   - Outcome: fewer noisy warnings before next deploy.

6. **Session 5: Deploy gate**
   - Task 6 only.
   - Outcome: deploy only after written CoV and approval.

## Self-Review

- Spec coverage: includes project stabilization, UNLIM forward motion, complex tests, CoV intermedi, skills, connectors, deploy discipline.
- Placeholder scan: no TBD/TODO placeholders; each task has exact files and commands.
- Type consistency: fixtures use consistent fields (`id`, `experimentId`, `message`, `mustIncludeActions`, `mustIncludeCitation`).
- Risk handling: production incident, Vercel connector 403, voice env mismatch and hardware no-claim are explicit.

## 2026-05-08 Addendum - UNLIM Execution/UX Bugs

Logged P0/P1 items from live user evidence:

- UNLIM action tags must execute real simulator API calls and must not report fake success.
- Free lavagna must mount simulator/manual context and must not show persistent "Lavagna libera" copy.
- Header UNLIM button is removed; mascot toggles UNLIM open/closed.
- UNLIM thinking copy: "UNLIM sta elaborando".
- UNLIM receives a parallel live narrative every 15 seconds and may use Pixtral/vision when the question requires visual evidence.
- Percorso must not render `[object Object]`; Riepilogo must send an actual prompt.
- Scratch, Arduino, Fumetto/report are mandatory P0 checks in every forward gate.
- Still open for next session: exact session restore from cronologia and premature confetti.
