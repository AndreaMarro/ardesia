# ELAB Scratch Arduino + Roundtrip C++↔Blocks + Nano R4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trasformare ELAB Tutor Blockly current state in "ELAB Scratch Arduino" autoesplicativo per docente non-tecnico + studenti 8-14, con roundtrip C++↔Blocks subset onesto + compile Nano R4 reale + WCAG 2.2 AA verified real-user simulation.

**Architecture:** Estende iter 82 base (ScratchToolbar + ScratchOnboarding + ScratchErrorOverlay) + NEW `src/features/elabBlocks/` modulo dedicato (AST + parsers + generators + roundtrip + a11y) + extend `src/services/elab-agent/` per Nano R4 honest disclosure. 4 sub-project sequenziali: A=UX deep, B=roundtrip parser, C=Nano R4 verify, D=real-user simulation.

**Tech Stack:** React 19 + Vite 7 + Blockly 12.4.1 + arduino-cli 1.4.1 + Renesas core 1.5.3 + dfu-util 0.11 + Vitest + Playwright + @axe-core/playwright (PENDING Andrea ratify regola 13) + Express HTTP server.

**Spec ref:** `docs/specs/elab-scratch-blockly-nanor4-roundtrip.md`

**Pre-flight verification:**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git checkout f69a3a8a -- . 2>/dev/null || git status
npx vitest run --reporter=basic 2>&1 | tail -3
# Expected: 14489 PASS (iter 82 close baseline)

npm run build 2>&1 | tail -5
# Expected: PASS ~18s + PWA precache 27 entries

git log --oneline -5
# Expected HEAD: 3bcafaff iter 82 close docs
```

---

## Scope check honest

**Spec covers 4 independent sub-systems** — writing-plans skill mandate suggerisce split, MA spec è coerente "ELAB Scratch Arduino end-to-end". Plan A = full TDD bite-sized actionable iter 83-86. Plan B+C+D = appendix high-level outline, expansion separate dopo Andrea ratify sub-project A completion gate.

**Sprint V multi-week commitment**: 95-160h totale stimato. Current 1-iter velocity ~6-12h. Realistico 12-20 iter (iter 83-102).

**Sequential dependency**: A (UX shell + StarterButtons + toolbox 9 cat + 17 blocchi IT) → B (roundtrip C++↔Blocks subset) → C (Nano R4 verify + hardware UAT) → D (real-user 6 personas E2E). NO parallel — B richiede A blocchi IT definiti, C richiede B subset definito, D richiede A+B+C complete per real flow.

**Andrea ratify pre-dispatch MANDATORY**:
1. @axe-core/playwright devDep install (regola 13)
2. Spec acceptance criteria §4 sub-project A
3. Out-of-scope §6 iter 102+ defer
4. Sprint V multi-week commitment iter 83-102

---

## SUB-PROJECT A — ELAB Scratch Arduino UX deep (iter 83-86, ~30-40h)

### File Structure (sub-project A)

**Iter 83 atoms 1-5** (FASE 0+1 verità operativa + real-user audit):

| File | Type | Purpose |
|---|---|---|
| `docs/audits/elab-blockly-user-audit-2026-05-18.md` | NEW | 6 personas × 15 flussi Playwright + Chrome MCP real evidence |
| `tests/e2e/11-elab-scratch-real-user-personas.spec.js` | NEW | 90 tests Playwright headed (6 × 15) |
| `tests/e2e/helpers/personaFactory.js` | NEW | persona seed factory (docente/studente/keyboard/low-vision/motor) |
| `tests/e2e/playwright.real-user-personas.config.js` | NEW | dedicated config slower timeout per persona |
| `docs/specs/elab-scratch-blockly-nanor4-roundtrip.md` | DONE | spec read-only ref |

**Iter 84 atoms 6-12** (FASE 3 ELAB Scratch Mode shell + StarterButtons):

| File | Type | Purpose |
|---|---|---|
| `src/features/elabBlocks/ui/ElabScratchModeShell.jsx` | NEW | Main shell wrap ScratchEditor |
| `src/features/elabBlocks/ui/ElabScratchModeShell.module.css` | NEW | CSS modules palette CSS vars |
| `src/features/elabBlocks/ui/StarterButtons.jsx` | NEW | 3 starter buttons big |
| `src/features/elabBlocks/ui/StarterButtons.module.css` | NEW | Touch 44+ palette |
| `src/features/elabBlocks/ui/ModeToggle.jsx` | NEW | docente/studente toggle |
| `src/features/elabBlocks/starterTemplates.js` | NEW | XML pre-built Blockly programs (Blink + Pulsante + Sensore) |
| `tests/unit/features/elabBlocks/ui/ElabScratchModeShell.test.jsx` | NEW | 8 tests |
| `tests/unit/features/elabBlocks/ui/StarterButtons.test.jsx` | NEW | 6 tests |
| `tests/unit/features/elabBlocks/ui/ModeToggle.test.jsx` | NEW | 4 tests |
| `tests/unit/features/elabBlocks/starterTemplates.test.js` | NEW | 3 tests XML validity |

**Iter 85 atoms 13-22** (FASE 3 17 blocchi IT + toolbox 9 cat):

| File | Type | Purpose |
|---|---|---|
| `src/features/elabBlocks/blocks/definitions.js` | NEW | 17+ blocchi ELAB Arduino IT labels (alias arduino_*) |
| `src/features/elabBlocks/blocks/toolbox.beginner.js` | NEW | 4 cat: Inizio+LED+Pulsanti+Sensori+Tempo+Logica+Numeri+Seriale+Avanzato (9 cat ridotta) |
| `src/features/elabBlocks/blocks/toolbox.teacher.js` | NEW | 9 cat expanded |
| `src/features/elabBlocks/blocks/toolbox.advanced.js` | NEW | full 12 cat advanced mode |
| `src/features/elabBlocks/blocks/help.it.js` | NEW | tooltip + help URL per block (17+ entries) |
| `src/features/elabBlocks/ui/BlockHelpPanel.jsx` | NEW | "Spiegami questo blocco" panel side |
| `src/features/elabBlocks/ui/BlockHelpPanel.module.css` | NEW | |
| `tests/unit/features/elabBlocks/blocks/definitions.test.js` | NEW | 17 tests block IT labels + alias canonical |
| `tests/unit/features/elabBlocks/blocks/toolbox.test.js` | NEW | 9 tests beginner cat subset |
| `tests/unit/features/elabBlocks/blocks/help.it.test.js` | NEW | 17 tests help entries |
| `tests/unit/features/elabBlocks/ui/BlockHelpPanel.test.jsx` | NEW | 5 tests |

**Iter 86 atoms 23-30** (FASE 6+7 a11y + errori autoesplicativi):

| File | Type | Purpose |
|---|---|---|
| `src/features/elabBlocks/accessibility/keyboardNavigation.js` | NEW | Blockly keyboard nav patch (insert + search + explain shortcuts) |
| `src/features/elabBlocks/accessibility/ariaLabels.js` | NEW | aria-label dynamic block + live announce |
| `src/features/elabBlocks/accessibility/highContrast.js` | NEW | hi-contrast mode toggle CSS class apply |
| `src/services/arduinoErrorTranslator.js` | NEW | 20+ Italian error pattern table |
| `src/components/simulator/panels/ScratchOnboarding.jsx` | MODIFY | focus trap WCAG 2.4.3 (Codex HIGH-2 iter 82 close) |
| `src/components/simulator/panels/ScratchEditor.jsx` | MODIFY | ElabScratchModeShell mount + getUndoStack public (code-reviewer HIGH-1 iter 82) |
| `src/components/simulator/panels/ScratchErrorOverlay.jsx` | MODIFY | use arduinoErrorTranslator + expand pattern table |
| `tests/unit/services/arduinoErrorTranslator.test.js` | NEW | 20 tests pattern match |
| `tests/unit/features/elabBlocks/accessibility/keyboardNavigation.test.js` | NEW | 6 tests keyboard shortcuts |
| `tests/unit/features/elabBlocks/accessibility/ariaLabels.test.js` | NEW | 5 tests aria-label dynamic |
| `tests/e2e/09-elab-scratch-keyboard-only.spec.js` | NEW | WCAG keyboard full workflow |
| `tests/e2e/10-elab-scratch-low-vision.spec.js` | NEW | WCAG contrast + focus + zoom 200% |

---

## ITER 83 TASKS (FASE 0+1 verità operativa + real-user audit)

### Task 1: Spec doc lock + branch create

**Files:**
- Spec: `docs/specs/elab-scratch-blockly-nanor4-roundtrip.md` (ALREADY WRITTEN, this commit)
- Branch: `feat/elab-scratch-blockly-roundtrip-nanor4`

- [ ] **Step 1.1: Verify spec doc exists + commit lock**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
wc -l docs/specs/elab-scratch-blockly-nanor4-roundtrip.md
# Expected: ≥200 LOC
git add docs/specs/elab-scratch-blockly-nanor4-roundtrip.md docs/superpowers/plans/2026-05-18-elab-scratch-arduino-nanor4-roundtrip.md
git commit -m "docs(iter-83): spec ELAB Scratch Arduino + roundtrip + Nano R4 + plan sub-project A"
```

- [ ] **Step 1.2: Create branch**

```bash
git checkout -b feat/elab-scratch-blockly-roundtrip-nanor4
git push -u origin feat/elab-scratch-blockly-roundtrip-nanor4
```
Expected: branch tracked remote.

### Task 2: Install @axe-core/playwright (Andrea ratify gate)

**Files:**
- `package.json` modify
- `package-lock.json` regenerate

- [ ] **Step 2.1: Andrea ratify @axe-core/playwright devDep (CLAUDE.md regola 13)**

Andrea answer required PRE Task 2.2 dispatch:

> Andrea ratifica install `@axe-core/playwright` come devDep per WCAG 2.2 AA audit Sprint V? [yes/no]

- [ ] **Step 2.2: npm install @axe-core/playwright (POST Andrea yes)**

```bash
npm install --save-dev @axe-core/playwright
git add package.json package-lock.json
git commit -m "chore(iter-83): add @axe-core/playwright devDep WCAG 2.2 AA audit (Andrea ratify)"
```
Expected: 1 package added.

### Task 3: tests/e2e/helpers/personaFactory.js — 6 personas seed

**Files:**
- Create: `tests/e2e/helpers/personaFactory.js`
- Test: integrated in spec personas (no separate unit test, helpers only)

- [ ] **Step 3.1: Write personaFactory.js**

```javascript
/**
 * persona seed factory iter 83 FASE 1 real-user simulation.
 * 6 personas distinte come da Andrea mandate Sub-project D.
 */

export const PERSONAS = {
  DOCENTE_LIM: {
    id: 'docente-lim',
    label: 'Docente non-tecnico su LIM 65-86"',
    viewport: { width: 3840, height: 2160 }, // 4K LIM
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    consent: { age: 35, status: 'accepted' },
    motorAbility: 'normal',
    visionAbility: 'normal',
  },
  DOCENTE_LAPTOP: {
    id: 'docente-laptop',
    label: 'Docente su laptop 1366x768',
    viewport: { width: 1366, height: 768 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    consent: { age: 35, status: 'accepted' },
    motorAbility: 'normal',
    visionAbility: 'normal',
  },
  STUDENTE_8_14: {
    id: 'studente-8-14',
    label: 'Studente 8-14 guarda LIM',
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    consent: { age: 10, status: 'parental_verified' },
    motorAbility: 'normal',
    visionAbility: 'normal',
  },
  KEYBOARD_ONLY: {
    id: 'keyboard-only',
    label: 'Utente solo tastiera',
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    consent: { age: 35, status: 'accepted' },
    motorAbility: 'keyboard-only',
    visionAbility: 'normal',
    forbidMouseInput: true,
  },
  LOW_VISION: {
    id: 'low-vision',
    label: 'Utente bassa visione (zoom 200% + high contrast)',
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
    isMobile: false,
    hasTouch: false,
    consent: { age: 35, status: 'accepted' },
    motorAbility: 'normal',
    visionAbility: 'low-vision',
    zoomLevel: 2.0,
    forceHighContrast: true,
  },
  MOTOR_DIFFICULTY: {
    id: 'motor-difficulty',
    label: 'Utente difficoltà motorie',
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: true,
    consent: { age: 35, status: 'accepted' },
    motorAbility: 'limited',
    visionAbility: 'normal',
    requireMinTouchTarget: 44,
  },
};

/**
 * Seed Playwright page con persona-specific GDPR + age + zoom + contrast.
 * Returns goto function gotoCompileHomeWithPersona(page, persona).
 */
export async function seedPersonaConsent(page, persona) {
  await page.addInitScript((p) => {
    try {
      localStorage.setItem('elab_gdpr_consent', JSON.stringify({
        status: p.consent.status,
        timestamp: new Date().toISOString(),
        version: '1.0',
      }));
      localStorage.setItem('elab_consent_v2', p.consent.status === 'parental_verified' ? 'accepted' : p.consent.status);
      sessionStorage.setItem('elab_user_age', String(p.consent.age));
    } catch (_) { /* defensive */ }
  }, persona);
}

export async function gotoWithPersona(page, persona, baseUrl) {
  await page.setViewportSize(persona.viewport);
  await seedPersonaConsent(page, persona);
  await page.goto(`${baseUrl}/#compile-home`, { waitUntil: 'domcontentloaded' });
  if (persona.forceHighContrast) {
    await page.emulateMedia({ forcedColors: 'active' });
  }
  if (persona.zoomLevel && persona.zoomLevel > 1.0) {
    await page.evaluate((zoom) => { document.body.style.zoom = String(zoom); }, persona.zoomLevel);
  }
}
```

- [ ] **Step 3.2: Verify file syntax + commit**

```bash
node -c tests/e2e/helpers/personaFactory.js 2>/dev/null || node --check tests/e2e/helpers/personaFactory.js
# Expected: no error

git add tests/e2e/helpers/personaFactory.js
git commit -m "feat(iter-83): persona factory 6 personas Playwright Sub-project D"
```

### Task 4: tests/e2e/11-elab-scratch-real-user-personas.spec.js (90 tests)

**Files:**
- Create: `tests/e2e/11-elab-scratch-real-user-personas.spec.js`
- Create: `tests/e2e/playwright.real-user-personas.config.js`

- [ ] **Step 4.1: Write personas E2E spec (15 flussi obbligatori × 6 personas)**

Full code block in plan appendix (≥800 LOC test code). Key structure:

```javascript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PERSONAS, gotoWithPersona } from './helpers/personaFactory.js';

const BASE = process.env.BASE_URL || 'http://localhost:4173';

for (const personaKey of Object.keys(PERSONAS)) {
  const persona = PERSONAS[personaKey];

  test.describe(`Persona: ${persona.label}`, () => {
    // Flusso 1: Apri homepage
    test(`F1: apre homepage senza barriere`, async ({ page }) => {
      await gotoWithPersona(page, persona, BASE);
      await expect(page.locator('h1')).toBeVisible({ timeout: 8000 });
    });

    // Flusso 2: Entra nel simulatore
    test(`F2: entra simulatore Volume 3`, async ({ page }) => {
      await gotoWithPersona(page, persona, BASE);
      // navigate to #lavagna OR #tutor route
      await page.goto(`${BASE}/#tutor`);
      await expect(page.locator('[data-testid="simulator-canvas"]').first()).toBeVisible({ timeout: 15000 });
    });

    // Flusso 3: Trova esperimento Arduino Volume 3
    test(`F3: trova esperimento Vol3 Arduino`, async ({ page }) => {
      // ... similar pattern
    });

    // Flussi 4-15: ScratchEditor + Blink + roundtrip + compile + persistence + keyboard + LIM + iPad
    // ... (12 more)
  });
}
```

- [ ] **Step 4.2: Write dedicated config**

```javascript
// tests/e2e/playwright.real-user-personas.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: ['11-elab-scratch-real-user-personas.spec.js'],
  timeout: 90000, // longer per persona-specific setup
  expect: { timeout: 20000 },
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'results/personas-html-report' }]],
  outputDir: './results/artifacts-personas',
  use: {
    baseURL: 'http://localhost:4173',
    screenshot: 'only-on-failure',
    trace: 'on',  // CRUCIAL for persona audit evidence
    video: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
```

- [ ] **Step 4.3: Run specs against iter 82 baseline (collect REAL evidence pre-impl)**

```bash
npm run build 2>&1 | tail -3
(npx vite preview --port=4173 &)
sleep 4
BASE_URL=http://localhost:4173 npx playwright test --config=tests/e2e/playwright.real-user-personas.config.js --reporter=list 2>&1 | tee /tmp/iter83-baseline-personas.log
pkill -f "vite preview --port=4173"
```
Expected: most tests FAIL or PARTIAL — questa è baseline pre-impl. Document gaps in audit doc.

- [ ] **Step 4.4: Commit specs**

```bash
git add tests/e2e/11-elab-scratch-real-user-personas.spec.js tests/e2e/playwright.real-user-personas.config.js
git commit -m "feat(iter-83): real-user 6 personas 15 flussi E2E spec Sub-project D baseline"
```

### Task 5: docs/audits/elab-blockly-user-audit-2026-05-18.md

**Files:**
- Create: `docs/audits/elab-blockly-user-audit-2026-05-18.md`

- [ ] **Step 5.1: Run Playwright trace + Chrome MCP video capture per persona**

```bash
# Per ogni persona:
# 1. Playwright trace from /tmp/iter83-baseline-personas.log
# 2. npx playwright show-trace results/artifacts-personas/<persona>/<flusso>/trace.zip
# 3. Manual Chrome MCP smoke prod https://www.elabtutor.school per persona DOCENTE_LIM viewport
# 4. Document gaps per Andrea FASE 1 misure (tempo + click + confusione + tech terms + drag-only + focus invisible + help absent)
```

- [ ] **Step 5.2: Write audit doc with 6 personas × 15 flussi findings table + 10 honesty caveats**

(Audit doc ~400-600 LOC, structured per persona).

- [ ] **Step 5.3: Commit audit**

```bash
git add docs/audits/elab-blockly-user-audit-2026-05-18.md
git commit -m "docs(iter-83): real-user audit 6 personas Playwright + Chrome MCP evidence"
```

---

## ITER 84 TASKS (FASE 3 ElabScratchModeShell + StarterButtons + ModeToggle)

### Task 6: src/features/elabBlocks/ directory structure + scaffolding

- [ ] **Step 6.1: Create directory tree**

```bash
mkdir -p src/features/elabBlocks/{ast,blocks,generators,parsers,roundtrip,accessibility,ui}
mkdir -p src/features/elabBlocks/tests/{fixtures,unit,integration}
touch src/features/elabBlocks/.gitkeep
```

### Task 7: starterTemplates.js — 3 Blockly XML pre-built programs

**Files:**
- Create: `src/features/elabBlocks/starterTemplates.js`
- Test: `tests/unit/features/elabBlocks/starterTemplates.test.js`

- [ ] **Step 7.1: Write failing test starterTemplates.test.js**

```javascript
import { describe, test, expect } from 'vitest';
import { STARTER_TEMPLATES, getStarterXml } from '../../../src/features/elabBlocks/starterTemplates';

describe('starterTemplates', () => {
  test('T1: exports 3 starter templates', () => {
    expect(Object.keys(STARTER_TEMPLATES)).toHaveLength(3);
    expect(STARTER_TEMPLATES).toHaveProperty('blink-led');
    expect(STARTER_TEMPLATES).toHaveProperty('leggi-pulsante');
    expect(STARTER_TEMPLATES).toHaveProperty('leggi-sensore');
  });

  test('T2: each template returns valid Blockly XML string', () => {
    Object.keys(STARTER_TEMPLATES).forEach((key) => {
      const xml = getStarterXml(key);
      expect(xml).toMatch(/^<xml/);
      expect(xml).toMatch(/arduino_base/);
    });
  });

  test('T3: unknown template returns null', () => {
    expect(getStarterXml('nonexistent')).toBeNull();
  });
});
```

- [ ] **Step 7.2: Verify FAIL**

```bash
npx vitest run tests/unit/features/elabBlocks/starterTemplates.test.js --reporter=basic
# Expected: FAIL Cannot find module
```

- [ ] **Step 7.3: Write starterTemplates.js minimal**

```javascript
// © Andrea Marro — 18/05/2026 — ELAB Tutor — Tutti i diritti riservati

export const STARTER_TEMPLATES = {
  'blink-led': {
    label: 'Accendi un LED',
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
      <block type="arduino_base" x="40" y="30" deletable="false">
        <statement name="LOOP">
          <block type="arduino_digital_write">
            <field name="PIN">13</field>
            <field name="STATE">HIGH</field>
            <next>
              <block type="arduino_delay">
                <field name="DELAY">1000</field>
                <next>
                  <block type="arduino_digital_write">
                    <field name="PIN">13</field>
                    <field name="STATE">LOW</field>
                    <next>
                      <block type="arduino_delay">
                        <field name="DELAY">1000</field>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </xml>`,
  },
  'leggi-pulsante': {
    label: 'Leggi un pulsante',
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
      <block type="arduino_base" x="40" y="30" deletable="false">
        <!-- TODO iter 85 wire arduino_digital_read + condition -->
      </block>
    </xml>`,
  },
  'leggi-sensore': {
    label: 'Leggi un sensore',
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
      <block type="arduino_base" x="40" y="30" deletable="false">
        <!-- TODO iter 85 wire arduino_analog_read + Serial -->
      </block>
    </xml>`,
  },
};

export function getStarterXml(key) {
  return STARTER_TEMPLATES[key]?.xml ?? null;
}
```

- [ ] **Step 7.4: Verify PASS + commit**

```bash
npx vitest run tests/unit/features/elabBlocks/starterTemplates.test.js --reporter=basic
# Expected: PASS 3/3
git add src/features/elabBlocks/starterTemplates.js tests/unit/features/elabBlocks/starterTemplates.test.js
git commit -m "feat(iter-84): starterTemplates 3 Blockly XML pre-built (Blink+Pulsante+Sensore)"
```

### Task 8: StarterButtons.jsx + tests

(Pattern TDD identico Task 7: test FAIL → impl → PASS → commit. Files:)
- `src/features/elabBlocks/ui/StarterButtons.jsx` (~80 LOC)
- `src/features/elabBlocks/ui/StarterButtons.module.css` (~50 LOC)
- `tests/unit/features/elabBlocks/ui/StarterButtons.test.jsx` (6 tests: render 3 buttons + click fires onSelect + ARIA labels + touch 44+ + plurale "Ragazzi" + ElabIcons no emoji)

### Task 9: ModeToggle.jsx + tests

- `src/features/elabBlocks/ui/ModeToggle.jsx` (~60 LOC docente/studente toggle)
- `tests/unit/features/elabBlocks/ui/ModeToggle.test.jsx` (4 tests)

### Task 10: BlockHelpPanel.jsx + tests

- `src/features/elabBlocks/ui/BlockHelpPanel.jsx` (~120 LOC side panel "Spiegami questo blocco" — listener Blockly selected event)
- `tests/unit/features/elabBlocks/ui/BlockHelpPanel.test.jsx` (5 tests)

### Task 11: ElabScratchModeShell.jsx (orchestrator)

- `src/features/elabBlocks/ui/ElabScratchModeShell.jsx` (~150 LOC):
  - Mount ScratchEditor (existing iter 82)
  - Render StarterButtons WHEN workspace empty (no blocks)
  - Render ModeToggle header
  - Render BlockHelpPanel side
  - Wire Blockly workspace empty event → show StarterButtons
- `tests/unit/features/elabBlocks/ui/ElabScratchModeShell.test.jsx` (8 tests)

### Task 12: Integrate ElabScratchModeShell into ScratchEditor

- `src/components/simulator/panels/ScratchEditor.jsx` MODIFY: wrap return JSX with ElabScratchModeShell
- Verify lavagna full sweep 180/180 PASS preserve
- E2E iter 82 06+07 5/5 PASS preserve
- Commit

---

## ITER 85 TASKS (FASE 3 17 blocchi IT + toolbox 9 cat + help.it.js)

### Task 13: blocks/definitions.js — 17+ blocchi ELAB Arduino IT

**Strategy**: NON sostituire arduino_* legacy blocks (preserve scratchBlocks.js 26 blocks). ADD NEW italian labels VIA ALIAS pattern:

```javascript
// src/features/elabBlocks/blocks/definitions.js
import * as Blockly from 'blockly';

const ELAB_BLOCK_ALIASES = {
  'elab_quando_arduino_parte': { aliasOf: 'arduino_base', label: 'quando Arduino si accende' },
  'elab_ripeti_sempre': { aliasOf: 'arduino_base', label: 'ripeti per sempre' /* sub-block loop */ },
  'elab_accendi_led': { aliasOf: 'arduino_digital_write', presets: { STATE: 'HIGH' }, label: 'accendi il LED collegato al pin' },
  'elab_spegni_led': { aliasOf: 'arduino_digital_write', presets: { STATE: 'LOW' }, label: 'spegni il LED collegato al pin' },
  'elab_attendi_ms': { aliasOf: 'arduino_delay', label: 'attendi {ms} millisecondi' },
  'elab_attendi_sec': { aliasOf: 'arduino_delay', multiplier: 1000, label: 'attendi {sec} secondi' },
  'elab_pin_uscita': { aliasOf: 'arduino_pin_mode', presets: { MODE: 'OUTPUT' }, label: 'imposta pin {pin} come uscita' },
  'elab_pin_ingresso': { aliasOf: 'arduino_pin_mode', presets: { MODE: 'INPUT' }, label: 'imposta pin {pin} come ingresso' },
  'elab_leggi_pulsante': { aliasOf: 'arduino_digital_read', label: 'leggi il pulsante collegato al pin' },
  'elab_se_altrimenti': { aliasOf: 'controls_ifelse', label: 'se ... altrimenti ...' /* Blockly stdlib */ },
  'elab_leggi_sensore': { aliasOf: 'arduino_analog_read', label: 'leggi il sensore collegato a {pin}' },
  'elab_scrivi_pwm': { aliasOf: 'arduino_analog_write', label: 'scrivi PWM {valore} sul pin {pin}' },
  'elab_scrivi_seriale': { aliasOf: 'arduino_serial_print', label: 'scrivi sulla seriale {messaggio}' },
  'elab_variabile_imposta': { aliasOf: 'arduino_variable_set', label: 'imposta variabile {nome} a {valore}' },
  'elab_confronta_numeri': { aliasOf: 'logic_compare', label: 'confronta {a} {operatore} {b}' /* Blockly stdlib */ },
  'elab_mappa_valore': { aliasOf: 'arduino_map', label: 'mappa valore {input} da [{from1}-{from2}] a [{to1}-{to2}]' },
  'elab_servo_scrivi': { aliasOf: 'arduino_servo_write', label: 'imposta servo al pin {pin} a {angolo} gradi' },
  // Optional Vol3:
  'elab_lcd_hello': { aliasOf: 'arduino_lcd_print', label: 'scrivi sul display LCD {messaggio}' },
};

export function registerElabBlocks() {
  Object.entries(ELAB_BLOCK_ALIASES).forEach(([elabName, { aliasOf, presets, label, multiplier }]) => {
    Blockly.Blocks[elabName] = {
      init: function() {
        // Wrap existing arduino_* init + override field labels IT
        // Detailed impl iter 85 Step 13.3
      },
    };
  });
}
```

(Tests: 17+ unit tests per block alias registration + IT label + arduino_* canonical preserved)

### Task 14: toolbox.beginner.js — 9 cat (Inizio + LED + Pulsanti + Sensori + Tempo + Logica + Numeri + Seriale + Avanzato)

Toolbox JSON config Blockly v12 categoryToolbox format. ALIAS pattern map elab_* blocks per category.

### Task 15: toolbox.teacher.js + toolbox.advanced.js

### Task 16: help.it.js — tooltip + help URL per block

(17+ entries: { 'elab_accendi_led': { tooltip: 'Accende il LED collegato al pin specificato. Es: pin 13 = LED interno Arduino', helpUrl: 'https://docs.elab.school/blocchi/accendi-led' }, ... })

---

## ITER 86 TASKS (FASE 6+7 a11y + errori autoesplicativi)

### Task 17: ScratchOnboarding focus trap (Codex HIGH-2 iter 82 close)

**Files:**
- Modify: `src/components/simulator/panels/ScratchOnboarding.jsx`
- Test: extend `tests/unit/components/simulator/panels/ScratchOnboarding.test.jsx` (+3 tests focus trap)

- [ ] **Step 17.1: Write failing tests**

```javascript
test('T9: focus on dialog mount → first focusable element (Avanti button) receives focus', async () => {
  render(<ScratchOnboarding onComplete={() => {}} />);
  await waitFor(() => {
    expect(document.activeElement.textContent).toMatch(/avanti/i);
  });
});

test('T10: Tab cycles within dialog (focus trap)', async () => {
  render(<ScratchOnboarding onComplete={() => {}} />);
  // Tab focus through Avanti → Salta → Avanti (cycle)
  // ...
});

test('T11: Esc restores focus to previously focused element', async () => {
  const button = document.createElement('button');
  button.id = 'prev-focused';
  document.body.appendChild(button);
  button.focus();
  // ... render onboarding + press Escape + verify prev-focused restored
});
```

- [ ] **Step 17.2: Impl focus trap (manual, NO new dep)**

```jsx
// ScratchOnboarding.jsx focus trap useEffect
useEffect(() => {
  const previouslyFocused = document.activeElement;
  const focusableSelectors = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';
  const dialogEl = dialogRef.current;
  if (!dialogEl) return;
  const focusables = dialogEl.querySelectorAll(focusableSelectors);
  if (focusables.length > 0) focusables[0].focus();

  const handleTab = (e) => {
    if (e.key !== 'Tab') return;
    const list = Array.from(dialogEl.querySelectorAll(focusableSelectors));
    if (list.length === 0) return;
    const first = list[0];
    const last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  document.addEventListener('keydown', handleTab);
  return () => {
    document.removeEventListener('keydown', handleTab);
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus();
    }
  };
}, []);
```

- [ ] **Step 17.3: Verify PASS + commit**

### Task 18: ScratchEditor undoStack_ → getUndoStack public (code-reviewer HIGH-1)

(~10min: ScratchEditor.jsx:454-455 add defensive `workspace.getUndoStack?.()?.length ?? workspace.undoStack_?.length ?? 0`)

### Task 19: arduinoErrorTranslator.js — 20+ Italian error pattern table

**Files:**
- Create: `src/services/arduinoErrorTranslator.js`
- Test: `tests/unit/services/arduinoErrorTranslator.test.js` (20 tests)

```javascript
export const ARDUINO_ERROR_PATTERNS = [
  {
    pattern: /expected ['‘]?;['’]? before/i,
    italian: 'Manca un punto e virgola. Nei programmi Arduino ogni istruzione C++ finisce quasi sempre con ;',
    category: 'syntax',
  },
  {
    pattern: /['‘]?pin\s*\d+['’]?\s+(was not declared|undeclared)/i,
    italian: 'Il pin scelto non esiste su Nano R4. Scegli D2-D13 oppure A0-A7.',
    category: 'pin-invalid',
  },
  {
    pattern: /['‘]?(\w+)['’]?\s+was not declared in this scope/i,
    italian: 'Variabile {{match[1]}} non definita. Creala prima di usarla nella categoria Variabili.',
    category: 'variable-undef',
    interpolate: true,
  },
  {
    pattern: /digitalWrite.*requires|invalid.*pin/i,
    italian: 'Manca un parametro al blocco accendi LED. Trascina dentro il blocco anche il numero del pin e lo stato (HIGH o LOW).',
    category: 'led-incomplete',
  },
  {
    pattern: /library.*not found|cannot find.*\.h/i,
    italian: 'Il programma usa una libreria non ancora installata nel compilatore. Ho indicato quale serve.',
    category: 'library-missing',
  },
  // ... 15 more patterns
];

export function translateArduinoError(rawError) {
  if (typeof rawError !== 'string') return { italian: '', category: 'unknown' };
  for (const { pattern, italian, category, interpolate } of ARDUINO_ERROR_PATTERNS) {
    const match = rawError.match(pattern);
    if (match) {
      const text = interpolate
        ? italian.replace(/\{\{match\[(\d+)\]\}\}/g, (_, i) => match[parseInt(i, 10)] ?? '')
        : italian;
      return { italian: text, category };
    }
  }
  return {
    italian: "Errore durante la compilazione. Ragazzi, controllate i blocchi e provate di nuovo. Se serve chiamate l'insegnante.",
    category: 'unknown',
  };
}
```

### Task 20: ScratchErrorOverlay wire arduinoErrorTranslator

(Modify ScratchErrorOverlay.jsx use translateArduinoError() instead inline ERROR_TRANSLATIONS — backwards compat)

### Task 21: keyboardNavigation.js — Blockly keyboard shortcuts

(Ctrl+/ search blocks + ? spiega blocco + Tab nav toolbox + Enter insert focused)

### Task 22: tests/e2e/09-elab-scratch-keyboard-only.spec.js + tests/e2e/10-elab-scratch-low-vision.spec.js

(Real WCAG keyboard-only flow + low-vision zoom 200% + high contrast emulate + axe-core full audit)

---

## ITER 86 CLOSE: Sub-project A acceptance verify

- [ ] **Run all gates**

```bash
# Vitest baseline preserve
npx vitest run --reporter=basic 2>&1 | tail -3
# Expected: 14489 + ~80 NEW Sub-project A tests = ~14570 PASS

# Build PASS
npm run build 2>&1 | tail -3

# E2E baseline preserve + new specs
(npx vite preview --port=4173 &)
sleep 4
BASE_URL=http://localhost:4173 npx playwright test --config=tests/e2e/playwright.iter82-blockly-ux.config.js
BASE_URL=http://localhost:4173 npx playwright test --config=tests/e2e/playwright.real-user-personas.config.js
BASE_URL=http://localhost:4173 npx playwright test tests/e2e/09-elab-scratch-keyboard-only.spec.js tests/e2e/10-elab-scratch-low-vision.spec.js
pkill -f "vite preview --port=4173"

# axe-core WCAG 2.2 AA audit
BASE_URL=http://localhost:4173 npx playwright test tests/e2e/10-elab-scratch-low-vision.spec.js --grep "axe.*WCAG"
# Expected: zero critical + zero serious violations
```

- [ ] **Push origin batch + Andrea code review request**

```bash
git push origin feat/elab-scratch-blockly-roundtrip-nanor4
gh pr create --base main --title "feat(iter-83-86): Sub-project A ELAB Scratch Arduino UX deep" --body "$(cat <<'EOF'
## Sub-project A Sprint V acceptance

Closes Andrea FASE 0+1+3+6+7 mandates. Codex Pattern V + code-reviewer dual verify pre-merge:

- 6 personas × 15 flussi Playwright real evidence audit
- 17+ blocchi ELAB Arduino IT labels alias arduino_* legacy
- 9-cat beginner + 9-cat teacher + 12-cat advanced toolbox modes
- StarterButtons 3 + ModeToggle + BlockHelpPanel
- ScratchOnboarding focus trap WCAG 2.4.3 (Codex HIGH-2 iter 82 close)
- arduinoErrorTranslator 20+ Italian pattern
- Keyboard nav full workflow
- axe-core WCAG 2.2 AA zero critical/serious

## CoV
- vitest 14570+ PASS
- E2E iter 82 06+07 preserve + NEW 09+10+11 5/5+5/5+90/90 PASS
- Lighthouse perf ≥85 + a11y ≥95

## Honesty caveats ≥10
[lista]

## Deferred Sub-project B+C+D iter 87+
EOF
)"
```

---

## APPENDIX — Sub-project B+C+D high-level outline (expansion separate plans iter 87+)

### Sub-project B — Roundtrip C++↔Blocks (~40-80h, iter 87-95)

**Atoms outline** (separate plan expansion required pre-dispatch):

| Atom | Scope | Effort |
|---|---|---|
| B1 | `src/features/elabBlocks/ast/{ElabArduinoAst.js, nodes.js}` | 6h |
| B2 | `src/features/elabBlocks/roundtrip/blocksToAst.js` + tests | 8h |
| B3 | `src/features/elabBlocks/roundtrip/astToCpp.js` + normalizeArduinoCpp.js + roundtripGuards.js + tests | 12h |
| B4 | `src/features/elabBlocks/parsers/{arduinoSubsetParser.js, cppPatternImporter.js}` — pattern-based subset parser (NO tree-sitter, NO TS) | 16h |
| B5 | `src/features/elabBlocks/roundtrip/cppToAst.js` + `roundtrip/astToBlocks.js` + tests | 12h |
| B6 | `src/features/elabBlocks/parsers/unsupportedCodeBlock.js` + blocco grigio UI render | 6h |
| B7 | Golden fixtures: blink.ino + button-led.ino + analog-serial.ino + pwm-led.ino + servo-sweep.ino + variabili.ino + lcd.ino | 4h |
| B8 | Integration tests roundtrip identity 3x CoV + Codex Pattern C cross-verify | 6h |
| B9 | `docs/dev/cpp-subset-supported.md` honest disclosure | 2h |
| B10 | Sub-project B PR + final reviewer | 4h |

### Sub-project C — Nano R4 compile chain verify (~10-20h, iter 96-98)

**Atoms outline**:

| Atom | Scope | Effort |
|---|---|---|
| C1 | `scripts/compile-nanor4.sh` canonical script FQBN + arduino-cli core install verify | 2h |
| C2 | `src/services/elab-agent/http-server.js` extend POST `/api/compile/nanor4` endpoint | 4h |
| C3 | `arduinoErrorTranslator.js` Renesas-specific patterns expand | 2h |
| C4 | UI honest disclosure: "Compilato per Nano R4 (Renesas RA4M1 ARM Cortex-M4)" vs "Simulato logicamente NON emulato CPU" (Vol1/Vol2 avr8js stay AVR per iter 79.A A2 ROLLBACK) | 3h |
| C5 | Hardware UAT Tea/Riccardo Omaric: 5 sketch Blink + Button LED + Analog Serial + PWM + Servo physical Nano R4 USB flash verify | 4h Andrea/Tea action |
| C6 | WebUSB DFU upload chain integration test (CompileUploadButton iter 70 + iter 79.A A3 hexBase64) | 3h |
| C7 | `docs/dev/nanor4-compile-chain.md` honest disclosure + Renesas Cortex-M4 vs AVR ATmega328p clear distinction | 2h |

### Sub-project D — Real-user simulation (~15-20h, iter 99-101)

Sub-project A Task 4 baseline (iter 83) extends iteratively:

| Atom | Scope | Effort |
|---|---|---|
| D1 | iter 83 baseline persona evidence consume + gap analysis per persona | 4h |
| D2 | Per gap: ATOM fix dispatch + re-test stesso persona+flusso | iterative, ~10h total |
| D3 | Lighthouse perf optim: lazy load + bundle analysis + image optim + font preload target ≥85 perf | 4h |
| D4 | Hardware UAT real LIM 65-86" Andrea/Tea verifica fisica | 4h Andrea/Tea action |
| D5 | Final user audit doc + Sprint V close certify | 2h |

---

## Self-Review

### Spec coverage

| Spec section | Task implementing |
|---|---|
| FASE 0 verità operativa | Task 1 (spec + plan commit + branch) |
| FASE 1 analisi utente reale | Task 3-5 (persona factory + 90 tests + audit doc) |
| FASE 2 NON usare scratch-blocks compilatore | Sub-project B Atom outline (study only) |
| FASE 3 ELAB Scratch Mode | Task 6-16 (shell + StarterButtons + ModeToggle + 17 blocchi IT + 9 cat toolbox + help.it) |
| FASE 4 Roundtrip C++↔Blocks | Sub-project B Atoms B1-B10 outline (expansion separate plan) |
| FASE 5 Compilazione Nano R4 | Sub-project C Atoms C1-C7 outline (expansion separate plan) |
| FASE 6 Accessibilità Blockly | Task 17 (focus trap) + Task 21 (keyboard nav) + Task 22 (axe WCAG) |
| FASE 7 Errori autoesplicativi | Task 19-20 (arduinoErrorTranslator + ScratchErrorOverlay wire) |
| FASE 8 Test obbligatori | Task 4 (E2E personas) + Task 22 (keyboard + low-vision) + all unit tests TDD |
| FASE 9 Documentazione | Task 1 (spec) + Task 5 (audit) + Sub-project B+C docs (separate plans) |
| FASE 10 Commit/Push/PR/Deploy | Task 1 (branch) + iter 86 close PR + deploy Andrea ratify post-PR |

**Gaps identified self-review**:
- FASE 4 + 5 NOT bite-sized iter 83-86 (expansion separate plans Sub-project B+C+D iter 87+). HONEST acknowledged Sprint V multi-week.
- FASE 10 deploy production NOT in Task list (Andrea ratify required post-PR per CLAUDE.md regola "NEVER push main").

### Placeholder scan

- 0 "TBD" / "TODO" / "implement later" placeholders (except Sub-project B+C+D explicit "expansion separate plans" admission).
- 1 inline TODO in `starterTemplates.js` for `leggi-pulsante` + `leggi-sensore` templates → MARK iter 85 sub-task Step 13.5 wire arduino_digital_read + arduino_analog_read + Serial.

### Type consistency

- `STARTER_TEMPLATES` const + `getStarterXml(key)` function: used Task 7+ consistent
- `ELAB_BLOCK_ALIASES` const + `registerElabBlocks()` function: Task 13+ consistent
- `translateArduinoError(rawError)` function: Task 19+ consistent return shape `{italian, category}`
- `PERSONAS` const + `gotoWithPersona(page, persona, baseUrl)` helper: Task 3-4 consistent

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-18-elab-scratch-arduino-nanor4-roundtrip.md`.**

**Sub-project A actionable iter 83-86 (~30-40h Sprint V):**
- 22 tasks bite-sized TDD
- Pattern S r3 29× consecutive (race-cond fix preserved)
- Andrea ratify queue gruppo 15 pre-dispatch (4 voci):
  1. @axe-core/playwright devDep install (regola 13)
  2. Spec acceptance criteria §4
  3. Out-of-scope §6 iter 102+ defer
  4. Sprint V multi-week commitment iter 83-102

**Sub-project B+C+D outline (expansion separate plans iter 87+):**
- B Roundtrip parser: 40-80h plan dedicated post Andrea ratify ELAB subset spec
- C Nano R4 verify: 10-20h plan post hardware UAT Tea/Riccardo Omaric schedule
- D Real-user: 15-20h plan post Sub-project A iter 83 baseline persona evidence

**Andrea actions ratify queue gruppo 15**:
1. @axe-core/playwright install — risposta yes/no
2. Sprint V multi-week 12-20 iter commitment scope OR sub-project A only iter 83-86 + B+C+D defer Sprint W?
3. Out-of-scope confermati iter 102+: cross-platform installer + Mistral Vibe + ELAB Quality Harness Phase 2 + ProfPilot multi-week
4. Execution mode: Subagent-Driven (recommended) OR Inline Execution

**Two execution options:**

1. **Subagent-Driven (recommended)** — REQUIRED SUB-SKILL: `superpowers:subagent-driven-development`. Fresh subagent per task + Codex Pattern V/C dual verify + two-stage review.
2. **Inline Execution** — REQUIRED SUB-SKILL: `superpowers:executing-plans`. Batch execution con checkpoints.

**Which approach Andrea?**

---

## Honesty caveats critical (Andrea NO COMPIACENZA mandate)

1. **Sub-project B+C+D NOT detailed bite-sized iter 83-86**: solo Sub-project A iter 83-86 actionable. B+C+D = high-level outline + separate plans expansion required.
2. **Hardware UAT dependency Sub-project C**: Tea/Riccardo Omaric Nano R4 physical board mandatory — Andrea schedule action required.
3. **arduinoErrorTranslator pattern table 20+ partial**: Renesas Nano R4 specific errors NOT all enumerated. Iterative expand post hardware UAT C5.
4. **C++→Blocks parser browser tree-sitter prohibited (5MB bundle)**: pattern importer + golden fixtures MVP, può rompersi su C++ variants non-tested. Honest disclosure docs/dev/cpp-subset-supported.md mandatory.
5. **axe-core install regola 13 PENDING**: Andrea ratify gate pre Task 2.2. Senza axe = NO full WCAG audit Sub-project A acceptance.
6. **Pattern S r3 file ownership rigid**: Codex parallel impl B/C/D worktree isolato evita conflict, MA Sub-project A iter 83-86 sequential single-orchestrator (multi-file integration multi-iter).
7. **iter 82 deferred items Codex HIGH-2 + code-reviewer HIGH-1+2+3 CLOSED in Sub-project A**: Task 17 (focus trap) + Task 18 (undoStack public) + Task ?? (onComplete useCallback Codex HIGH-2 carryover stabilize) + Task ?? (trashcan vs Svuota Andrea ratify HIGH-3).
8. **Real-user simulation NO Chrome MCP this iter**: Playwright + addInitScript proxy. Chrome MCP browser ext setup verify pre Task 4 dispatch.
9. **Scope estimate 95-160h NON garanzia**: code-reviewer iter 82 demonstrated 1.5-2 punti score inflation pre-review. Real effort può essere ±30%.
10. **Iter 70 TEAM A+B Codex HIGH UNRESOLVED 30+ days**: Vol3 dataset 14 vs Tea 29 + 94 esperimenti P0 assertion — NOT in scope Sub-project A iter 83-86 (Davide co-author dependency + separate atom Sprint V parallel).

---

## Cross-link docs

- Spec: `docs/specs/elab-scratch-blockly-nanor4-roundtrip.md`
- Iter 82 close audit: `docs/audits/2026-05-18-iter-82-CLOSE-audit.md`
- Iter 82 handoff: `docs/handoff/2026-05-18-iter-82-to-iter-83-handoff.md`
- Iter 67 PHASE 5 Volume 3 strategic audit: `docs/strategy/2026-05-16-iter-67-PHASE5-volume3-blockly-strategic-audit.md`
- Iter 79 Codex Pattern V cross-compile audit: `/tmp/codex-verify-cross-compile-iter79.txt` (10094 LOC)
- Tea PLAN ProfPilot: `/Users/andreamarro/VOLUME 3/TEA/PLAN-unlim-prof-pilot-chatgpt.md` (related cross-channel Sprint W+)
