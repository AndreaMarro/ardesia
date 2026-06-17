---
id: ADR-012
title: Vision flow E2E Playwright spec — Box 7 lift 0 → 0.7 via Gemini Vision via unlim-chat images param
status: proposed
date: 2026-04-26
deciders:
  - architect-opus (Sprint S iter 6 Phase 1, Pattern S 5-agent OPUS)
  - Andrea Marro (final approver per VITE_ENABLE_VISION_FLOW flip + cost cap)
context-tags:
  - sprint-s-iter-6
  - vision-flow-e2e
  - playwright-spec
  - box-7-lift
  - gemini-vision-eu
  - principio-zero-runtime
related:
  - ADR-007 (wiki module extraction pattern)
  - ADR-009 (validatePrincipioZero middleware) — runtime PZ validator post-LLM
  - ADR-010 (Together AI fallback gated) — chain provider for Vision uses Gemini primary
  - ADR-011 (R5 stress fixture 50 prompts) — scoring pattern reference
  - ADR-013 (ClawBot composite handler L1 morphic) — sibling iter 6
  - docs/architectures/STACK-V3-DEFINITIVE-2026-04-26.md §Vision
  - SETUP-NEXT-SESSION/ARCHITETTURA-FINALE-SESSIONE-2026-04-26.md §6 P1 5
input-files:
  - supabase/functions/unlim-diagnose/index.ts (existing Vision endpoint baseline ~218 LOC)
  - supabase/functions/_shared/gemini.ts (callGemini con images array support)
  - src/services/multimodalRouter.js (routeVision stub iter 4)
  - src/services/simulator-api.js (captureScreenshot flat method base64 PNG)
  - scripts/openclaw/tools-registry.ts (analyzeImage composite spec L457-469)
output-files:
  - tests/e2e/02-vision-flow.spec.js (NEW — Playwright spec, ~250 LOC)
  - tests/e2e/fixtures/vision-states.json (NEW — 5 circuit fixture states)
  - .github/workflows/sprint-vision-e2e.yml (NEW — workflow_dispatch)
  - docs/audits/2026-04-26-vision-e2e-fixture-design.md (optional iter 7)
---

# ADR-012 — Vision flow E2E Playwright spec (Gemini Vision via unlim-chat images, no GPU)

> Definire test E2E Playwright che verifica il flusso Vision live in produzione `https://www.elabtutor.school` end-to-end: capture screenshot canvas → POST a Edge Function `unlim-chat` con array `images` → assert risposta italiano PZ-compliant + AZIONE tags + latenza <10s. 5 fixture circuit states (LED OK, LED no resistance, LED reverse polarity, wire missing, power off) per coverage diagnostic categories. Box 7 lift da 0 → 0.7. Feature flag `VITE_ENABLE_VISION_FLOW` per rollback. CI manual_dispatch (NO block PR per cost + latency).

---

## 1. Contesto

### 1.1 Box 7 Vision flow stato attuale (iter 5 close 0.0)

Sprint S iter 5 close score 6.55/10 ha Box 7 = 0.0 (Vision flow live). Iter 1+iter 2+iter 3+iter 4+iter 5 NON hanno wirato test E2E end-to-end nemmeno PoC. Gap critico:

- `supabase/functions/unlim-diagnose/index.ts` esiste come PoC iter 5 returned diagnostic ITALIAN PZ-compliant con `circuitState` JSON parsing.
- `supabase/functions/_shared/gemini.ts` ha già `callGemini` con support `images` array (multimodal native Gemini 2.5 Flash via `inline_data` payload `{mime_type, data}`).
- `src/services/simulator-api.js` espone `captureScreenshot()` ritorna base64 PNG da canvas SVG simulatore.
- `src/services/multimodalRouter.js` ha stub `routeVision` iter 4 ma NO E2E test.
- `tools-registry.ts:457-469` definisce `analyzeImage` come composite `[captureScreenshot, postToVisionEndpoint]` ma `postToVisionEndpoint` NON è handler real iter 5.

Conclusione: Vision flow ha tutti i mattoncini disposti ma manca assemblaggio E2E + verifica live + scoring. Senza E2E test, claim "Vision live" è vacuo.

### 1.2 Decisione architetturale fondamentale: unlim-chat con images, NON unlim-diagnose

Iter 5 close note dicono "Edge Function `unlim-diagnose` returned diagnostic ITALIAN PZ-compliant". MA verifica codice `_shared/gemini.ts` mostra `callGemini` accetta `images` array nativamente. BASE_PROMPT v3 (iter 2) ha già regole vision built-in ("se ricevi immagine, descrivi cosa vedi al docente in plurale Ragazzi, identifica componenti, cita Vol+pag se applicabile").

Decisione: **Vision flow USA `unlim-chat` con parametro `images` nel body**, NON `unlim-diagnose` separato. Vantaggi:
- Single endpoint = single PZ validator + single audit log
- `unlim-chat` gia LIVE post deploy iter 5 PM Andrea (14 file deployed, callLLMWithFallback chain wired)
- BASE_PROMPT v3 unico = no drift fra prompts diagnostic vs chat
- `validatePrincipioZero` runtime middleware ADR-009 si applica uniformemente

`unlim-diagnose` resta come endpoint legacy/PoC, deprecabile iter 7+ se E2E test conferma `unlim-chat` sufficiente.

### 1.3 Perché Gemini Vision (no GPU)

Stack iter 6 post Andrea Path A RunPod TERMINATE (pod 5ren6xbrprhkl5 EXITED→TERMINATED tick 50): NO GPU running. Vision options:
- **Gemini 2.5 Flash Vision** (free tier 60 RPM, multimodal native, EU pinning): SCELTO
- Qwen-VL local: NO GPU
- Together AI Vision (Llama 3.2 90B Vision): US, gated per ADR-010 student_runtime block
- Claude Vision (Anthropic): budget Andrea Max sub limited per dev runtime

Gemini Vision 2.5 Flash latency p50 1.5-3s + cost $0.10/M tokens input image (~$0.0001 per screenshot 768x768). Compatibile budget Andrea €50/mese. Gemini EU pinning preserva GDPR student-runtime safety (ADR-010 §1.2 EU-only requirement).

### 1.4 Perché Playwright E2E (NON unit/integration)

Vision flow tocca livelli multipli:
1. Browser canvas SVG render (React 19 + Vite 7)
2. `__ELAB_API.captureScreenshot()` riprende base64 (libreria html2canvas o native canvas.toDataURL)
3. POST cross-origin a Supabase Edge Function `unlim-chat` con auth `X-Elab-Api-Key` + `Authorization: Bearer ${SUPABASE_ANON_KEY}`
4. Edge Function processa images via Gemini Vision call
5. Response parsing UI mostra diagnostic in chat overlay

Unit test stub-only verificherebbe solo (3) e (4) isolatamente — perde regressioni reali (canvas rendering, base64 size limits Gemini 4MB, CORS headers production). Integration test con Edge Function locale richiede Deno serve + mock browser canvas → fragile + lento. Playwright E2E in produzione live `https://www.elabtutor.school` = ground truth + zero false positive.

---

## 2. Decisione

### 2.1 Decisione D1 — Test target endpoint LIVE production (NOT staging, NOT mock)

**Scelta**: `tests/e2e/02-vision-flow.spec.js` chiama `https://www.elabtutor.school` produzione + Edge Function `https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat` deployed iter 5 PM.

```js
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://www.elabtutor.school';
const EDGE_URL = process.env.EDGE_URL || 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat';
const ELAB_API_KEY = process.env.ELAB_API_KEY?.trim();
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY?.trim();
```

**Razionale**:
- Production = path che vede docente reale = ground truth UX
- Staging non esiste iter 6 (single-env Vercel + Supabase)
- Mock Edge Function locale duplica costo manutenzione + drift rischio

**Alternative considerate**:

| Approach | Pro | Contro | Decisione |
|----------|-----|--------|-----------|
| **Production E2E (SCELTO)** | Ground truth, zero drift | Latency variabile, costo Gemini real | Scelto |
| Staging mirror env | Isolato | Non esiste, +1 deploy pipeline | Scartato |
| Mock Edge Function Deno locale | Veloce, deterministic | Drift mock vs real, no CORS test | Scartato |
| Local dev server `npm run dev` | Cheap | No production CDN, no service worker | Scartato |

**Downside onesto**: production test richiede Gemini Vision call live → costo per run ~$0.0005 per fixture × 5 = $0.0025 per esecuzione. Trascurabile budget. Ma se eseguito in CI on every PR = 10 PR/giorno × $0.0025 = $0.025/giorno = $0.75/mese. Per evitare cost creep: **manual_dispatch only** (D6).

### 2.2 Decisione D2 — Login flow via class_key fixture (NOT real student session)

**Scelta**: test fixture login con `class_key` test predefinito (es. `TEST-VISION-E2E`) creato via Supabase admin SQL pre-CI. Bypass real student onboarding flow.

```js
test.beforeAll(async () => {
  // Pre-condition: class_key TEST-VISION-E2E exists in classes table (manual SQL setup)
  // Skip if env not set
});

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  // Inject class_key into localStorage to bypass onboarding
  await page.evaluate(() => {
    localStorage.setItem('elab_class_key', 'TEST-VISION-E2E');
    localStorage.setItem('elab_anon_uuid', 'e2e-test-vision-' + Date.now());
  });
  await page.reload();
});
```

**Razionale**:
- Real student session richiede docente click onboarding → non riproducibile in CI
- `class_key` localStorage pattern già esistente (vedi memory.md S1-supabase)
- `elab_anon_uuid` stabile per session_id Edge Function
- Cleanup post-test: `localStorage.clear()` (no DB pollution)

**Alternative scartate**:

- "Real Supabase Auth login" → richiede credentials reali in CI = security risk
- "E2E senza login" → app non monta simulatore senza class_key → no canvas capture
- "Skip onboarding via URL param" → non implementato in app

**Downside onesto**: class_key test fixture deve essere preservato in DB (`DELETE FROM classes WHERE id='TEST-VISION-E2E'` accidentale rompe CI). Mitigazione: setup SQL idempotent in `tests/e2e/fixtures/setup-vision-class.sql` documented per Andrea.

### 2.3 Decisione D3 — 5 fixture circuit states copertura diagnostic categories

**Scelta**: 5 stati circuit pre-mounted via `__ELAB_API.mountExperiment` + manipolazione manuale via `__ELAB_API.removeWire` / `setComponentValue` etc. Coverage diagnostico:

| # | Fixture state | Mount + manipulation | Expected diagnostic | AZIONE expected |
|---|---------------|----------------------|---------------------|-----------------|
| 1 | LED OK funzionante | `mountExperiment('v1-cap6-esp1')` only | "Ragazzi, il LED si accende correttamente. La resistenza limita la corrente come spiegato a Vol.1 pag.27" | `[AZIONE:highlight ids=led1,r1]` |
| 2 | LED no resistance (cortocircuito) | mount + `removeComponent('r1')` | "Ragazzi, attenzione! Manca la resistenza, il LED si potrebbe bruciare. Aggiungete una resistenza da 220Ω come Vol.1 pag.34" | `[AZIONE:warning][AZIONE:highlight ids=led1]` |
| 3 | LED reverse polarity | mount + `setComponentValue('led1', 'rotation', 180)` | "Ragazzi, il LED è collegato al contrario. L'anodo va al lato +, il catodo al -. Vedi Vol.1 pag.29 schema polarità" | `[AZIONE:highlight ids=led1]` |
| 4 | Wire missing (open circuit) | mount + `removeWire('w1')` | "Ragazzi, manca un filo per chiudere il circuito. Senza il filo non passa corrente. Cercate il filo che collega il - della pila al GND" | `[AZIONE:highlight pins=nano:GND]` |
| 5 | Power off (battery disconnected) | mount + `removeComponent('bat1')` | "Ragazzi, il circuito non ha alimentazione. Senza la pila non c'è corrente. Aggiungete la pila 9V come Vol.1 pag.18" | `[AZIONE:highlight pins=nano:VIN]` |

Fixture file `tests/e2e/fixtures/vision-states.json`:

```json
[
  {
    "id": "vision-001-led-ok",
    "experiment": "v1-cap6-esp1",
    "manipulation": [],
    "expectedDiagnosticPattern": ["LED.*accende", "resistenza", "Vol\\.1.*pag\\.\\d+"],
    "expectedAzioneTags": ["highlight"],
    "expectedPlurale": ["Ragazzi"],
    "expectedMaxWords": 60,
    "expectedNoChatbotPreamble": true
  }
]
```

**Razionale 5 stati**:
- Coverage 5 categorie diagnostic comuni (functional + 4 errori comuni)
- N=5 < 10 = costo Gemini contenuto ($0.0005 × 5 = $0.0025/run)
- Estendibile a 20+ stati iter 7+ se baseline 5 PASS

**Alternative scartate**:

- "10 stati immediati" → costo 2x + manutenzione fixture pesante
- "1 stato solo LED OK" → no coverage errori = test inutile
- "Stati randomizzati" → flaky, no reproducibility

### 2.4 Decisione D4 — Test assertion criteria PZ-compliance

**Scelta**: per ogni fixture, asserire 5 invarianti dalla response Vision:

```js
async function assertVisionResponse(response, fixture) {
  // Invariante 1: HTTP 200 + success: true
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body.success).toBe(true);

  // Invariante 2: latency < 10s
  expect(body.metadata.latency_ms).toBeLessThan(10000);

  // Invariante 3: plurale "Ragazzi" presente (PZ R1)
  expect(body.response).toMatch(/^Ragazzi[,!]/i);

  // Invariante 4: NO chatbot preamble (PZ R12)
  expect(body.response).not.toMatch(/^(Ciao|Salve|Certo|Ecco|Perfetto)/i);

  // Invariante 5: pattern fixture-specific (diagnostic category)
  for (const pattern of fixture.expectedDiagnosticPattern) {
    expect(body.response).toMatch(new RegExp(pattern, 'i'));
  }

  // Invariante 6: AZIONE tags expected
  for (const tag of fixture.expectedAzioneTags) {
    expect(body.response).toContain(`[AZIONE:${tag}`);
  }

  // Invariante 7: max 60 parole (esclusi AZIONE tags)
  const wordCountClean = body.response.replace(/\[AZIONE:[^\]]+\]/g, '').split(/\s+/).filter(Boolean).length;
  expect(wordCountClean).toBeLessThanOrEqual(60);
}
```

**Razionale**:
- 7 invarianti coprono PZ rules R1, R3 (max_words), R8 (action_tags), R12 (no_chatbot_preamble)
- Pattern regex per diagnostic ammette varianza Gemini stochastic (no exact match)
- Latency cap 10s = SLO docente UX

**Alternative scartate**:

- "Solo HTTP 200" → vacuo, no quality control
- "LLM-judge GPT-4 assert" → costo + latency + dependency Anthropic budget
- "Exact text match" → flaky con LLM stocastico

**Downside onesto**: pattern regex permissivo può false-PASS se Gemini output minimal (1 frase generica). Mitigazione: `expectedMaxWords` minimum check (es. ≥10 parole) per evitare empty PASS. Iter 7+ aggiunge LLM-judge se baseline 5/5 PASS.

### 2.5 Decisione D5 — Architecture Vision flow E2E

**Scelta**: flusso 7-step con assertion intermedie:

```
Step 1: page.goto(BASE_URL)
        ↓
Step 2: page.evaluate inject class_key + uuid → page.reload()
        ↓
Step 3: await __ELAB_API ready → mountExperiment(fixture.experiment)
        ↓
Step 4: apply fixture.manipulation (removeComponent, setComponentValue, etc.)
        ↓
Step 5: const screenshot = await __ELAB_API.captureScreenshot()
        assert: screenshot starts with 'data:image/png;base64,'
        assert: screenshot.length > 1000 (not empty canvas)
        ↓
Step 6: POST EDGE_URL with body:
        {
          message: 'Guarda il circuito e dimmi cosa vedi',
          sessionId: makeSessionId(),
          experimentId: fixture.experiment,
          studentContext: null,
          circuitState: await __ELAB_API.getCircuitState(),
          images: [{ data: screenshot.split(',')[1], mime_type: 'image/png' }]
        }
        headers: {
          'X-Elab-Api-Key': ELAB_API_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        }
        ↓
Step 7: assertVisionResponse(response, fixture) — 7 invarianti D4
```

**Razionale**:
- Step 5 captureScreenshot pre-POST = isolation test capture vs network
- Step 6 includes `circuitState` + `images` = redundant signal (LLM può cross-check JSON con immagine)
- Step 7 invarianti = PZ-compliance gate

**Alternative considerate**:

- "Skip captureScreenshot, mock base64 image fixture" → perde regressione canvas render
- "POST direct senza circuitState" → meno signal Gemini, peggiora diagnostic quality
- "Test only response.status 200" → non valida quality

### 2.6 Decisione D6 — CI integration manual_dispatch (NOT block PR)

**Scelta**: workflow `.github/workflows/sprint-vision-e2e.yml` con `workflow_dispatch` trigger. NO automatic on PR.

**Rationale**:
- 5 fixture × ~5s p50 latency = 25s minimum + setup ~30s = 1 minuto run total
- Costo $0.0025/run × 10 PR/giorno = $0.025/giorno + Gemini rate-limit risk
- Flaky network/CDN può false-FAIL block PR ingiustamente
- Vision flow non è blocker per merge tipico (UX feature, not critical-path)

**Workflow shape**:

```yaml
name: Sprint Vision Flow E2E (manual)

on:
  workflow_dispatch:
    inputs:
      base_url:
        description: 'Base URL target'
        required: false
        default: 'https://www.elabtutor.school'
      gate:
        description: 'Apply pass gate (5/5 fixtures must PASS)'
        required: false
        default: 'true'

jobs:
  vision-e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install chromium
      - name: Run Vision E2E
        env:
          PLAYWRIGHT_BASE_URL: ${{ inputs.base_url }}
          ELAB_API_KEY: ${{ secrets.ELAB_API_KEY }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          EDGE_URL: 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat'
        run: npx playwright test tests/e2e/02-vision-flow.spec.js
      - name: Upload artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: vision-e2e-${{ github.run_id }}
          path: |
            test-results/
            playwright-report/
```

**Alternative scartate**:

- "Block PR automatic" → flaky network risk, latency 1+ min
- "Cron daily" → noise + cost, no signal value
- "Solo local Andrea trigger" → no CI history audit

### 2.7 Decisione D7 — Rollback plan via feature flag

**Scelta**: introdurre `VITE_ENABLE_VISION_FLOW` feature flag (default `false` until E2E PASS 5/5 baseline).

**Per-environment policy**:
- **Dev/local**: `true` (testing iter 6)
- **Production**: `false` initially, flip a `true` SOLO dopo:
  1. E2E baseline 5/5 PASS verificato
  2. Cost monitoring iter 6 1 settimana <$5
  3. Andrea sign-off UX review (response quality docente live)

Frontend gate (`src/services/multimodalRouter.js`):

```js
export function routeVision(...) {
  const enabled = import.meta.env.VITE_ENABLE_VISION_FLOW === 'true';
  if (!enabled) {
    return { ok: false, reason: 'vision_flow_disabled_flag' };
  }
  // ... existing logic
}
```

**Rollback steps** se issue post-flip:
1. Andrea sets `VITE_ENABLE_VISION_FLOW=false` su Vercel env (5 min effective)
2. UI fallback: chat normale (no images param) → standard text-only response
3. Edge Function `unlim-chat` continua a accettare images se inviati (no breaking change)
4. NO Gemini Vision call → cost zero
5. Audit `together_audit_log` (ADR-010) preserva storico se Vision routed via Together fallback

**Test rollback** (incluso acceptance):
- Flip flag false during integration test → assert routeVision returns disabled
- Flip flag true → assert E2E spec PASS 5/5

### 2.8 Decisione D8 — Cost monitoring + SLO

**Scelta**: cost cap esplicito + monitoring SLO Vision-specific.

| Metric | Target | Hard Cap |
|--------|--------|----------|
| Gemini Vision latency p50 | 2s | 5s timeout |
| Gemini Vision latency p99 | 4s | 10s timeout |
| Cost per fixture | $0.0005 | $0.001 |
| Cost per E2E run (5 fixtures) | $0.0025 | $0.005 |
| Cost mensile (10 manual runs/week) | $0.10 | $5 |
| 5/5 PASS rate baseline | 5/5 | 4/5 minimum |
| Cold start primo fixture | 2s | 8s |

**Cost SQL monitoring** (riusa pattern ADR-010):

```sql
SELECT
  DATE_TRUNC('day', ts) AS day,
  COUNT(*) AS vision_calls,
  SUM(cost_usd_estimated) AS spend_usd,
  AVG(latency_ms) AS avg_latency,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms) AS p99_latency
FROM together_audit_log  -- Vision fallback se Gemini down (raro)
WHERE ts > now() - interval '7 days'
  AND request_kind = 'student_runtime'
  AND anonymized_payload->>'has_images' = 'true'
GROUP BY day
ORDER BY day DESC;
```

Per cost monitoring Gemini diretto: log custom in `unlim-chat/index.ts` quando `images.length > 0`:

```ts
console.info(JSON.stringify({
  level: 'info',
  event: 'vision_call',
  fixture_id: experimentId,
  latency_ms: latency,
  tokens_in: usage.input,
  cost_usd: estimateGeminiVisionCost(usage),
}));
```

**Alternative scartate**:

- "Tabella `vision_audit_log` separata" → over-engineered, riusa together_audit_log con flag has_images
- "Posthog event ingest" → +dependency, GDPR re-eval
- "Solo console.log Vercel" → no aggregation

### 2.9 Decisione D9 — Test execution + reporting

**Scelta**: locale `npx playwright test tests/e2e/02-vision-flow.spec.js` produce HTML report standard Playwright + JSON results.

```bash
# Setup
export ELAB_API_KEY="..."
export SUPABASE_ANON_KEY="..."

# Run
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npx playwright test tests/e2e/02-vision-flow.spec.js

# Report
npx playwright show-report
```

**Output structure**:

```
test-results/
├── 02-vision-flow-Vision-001-led-ok/
│   ├── trace.zip
│   ├── video.webm
│   └── error-context.md
├── 02-vision-flow-Vision-002-led-no-resistance/
│   ...
└── results.json  # machine-readable

playwright-report/
└── index.html  # human dashboard
```

**Razionale**:
- Playwright HTML report = visual debugging (trace timeline + video replay)
- JSON results = machine-parsable per Sprint S 10-box scoring orchestrator
- Trace/video upload solo on FAIL = artifact storage budget

**Alternative scartate**:

- "Custom reporter Markdown" → reinvent wheel, Playwright HTML eccellente
- "Vitest E2E plugin" → no canvas/CDN/cross-origin support

### 2.10 Decisione D10 — Versioning + roadmap futura

**Scelta**:

- Spec v1.0 (iter 6) = 5 fixtures, manual_dispatch only
- Spec v1.1 (iter 7) = +5 fixtures (advanced: Arduino code error visual, multi-component SOS pattern, Scratch block visual, breadboard wiring topology error)
- Spec v2.0 (iter 8) = LLM-judge GPT-4 Vision assert (no rule-only check)
- Spec v3.0 (iter 9+) = stress test 50 fixtures continuous + cost cap auto-throttle

iter 6 SCOPE: SOLO v1.0 con 5 fixtures + Box 7 lift 0 → 0.7. Resto è roadmap.

---

## 3. Implementation contract per generator-test-opus

```js
// File: tests/e2e/02-vision-flow.spec.js (NEW, ~250 LOC)
import { test, expect } from '@playwright/test';
import fixtures from './fixtures/vision-states.json' assert { type: 'json' };

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://www.elabtutor.school';
const EDGE_URL = process.env.EDGE_URL || 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat';
const ELAB_API_KEY = process.env.ELAB_API_KEY?.trim() || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY?.trim() || '';

test.describe('Vision flow E2E — Box 7 lift', () => {
  test.beforeEach(async ({ page }) => {
    if (!ELAB_API_KEY || !SUPABASE_ANON_KEY) {
      test.skip();
    }
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('elab_class_key', 'TEST-VISION-E2E');
      localStorage.setItem('elab_anon_uuid', 'e2e-vision-' + Date.now());
    });
    await page.reload();
    // Wait __ELAB_API ready
    await page.waitForFunction(() => typeof window.__ELAB_API?.captureScreenshot === 'function', { timeout: 15000 });
  });

  for (const fixture of fixtures) {
    test(`${fixture.id} → Vision diagnostic PZ-compliant`, async ({ page, request }) => {
      // Step 3: mount experiment
      await page.evaluate((expId) => window.__ELAB_API.mountExperiment(expId), fixture.experiment);
      await page.waitForTimeout(1500);

      // Step 4: apply manipulation
      for (const op of fixture.manipulation || []) {
        await page.evaluate((op) => {
          const api = window.__ELAB_API;
          if (op.action === 'removeComponent') api.removeComponent(op.id);
          if (op.action === 'removeWire') api.removeWire(op.id);
          if (op.action === 'setComponentValue') api.setComponentValue(op.id, op.param, op.value);
        }, op);
      }
      await page.waitForTimeout(500);

      // Step 5: capture screenshot
      const screenshot = await page.evaluate(() => window.__ELAB_API.captureScreenshot());
      expect(screenshot).toMatch(/^data:image\/png;base64,/);
      expect(screenshot.length).toBeGreaterThan(1000);

      // Step 5b: get circuit state
      const circuitState = await page.evaluate(() => window.__ELAB_API.unlim.getCircuitState());

      // Step 6: POST to Edge Function
      const start = Date.now();
      const response = await request.post(EDGE_URL, {
        headers: {
          'X-Elab-Api-Key': ELAB_API_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        data: {
          message: 'Guarda il circuito e dimmi cosa vedi, se c\'è un problema spiegalo ai ragazzi',
          sessionId: `e2e-vision-${fixture.id}-${Date.now()}`,
          experimentId: fixture.experiment,
          studentContext: null,
          circuitState,
          images: [{ data: screenshot.split(',')[1], mime_type: 'image/png' }],
        },
        timeout: 15000,
      });
      const latency = Date.now() - start;

      // Step 7: assert invariants
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(latency).toBeLessThan(10000);

      const text = body.response || '';
      // PZ R1: plurale "Ragazzi"
      expect(text).toMatch(/^Ragazzi[,!]/i);
      // PZ R12: no chatbot preamble
      expect(text).not.toMatch(/^(Ciao|Salve|Certo|Ecco|Perfetto)/i);
      // Diagnostic patterns
      for (const pattern of fixture.expectedDiagnosticPattern) {
        expect(text).toMatch(new RegExp(pattern, 'i'));
      }
      // AZIONE tags
      for (const tag of fixture.expectedAzioneTags) {
        expect(text).toContain(`[AZIONE:${tag}`);
      }
      // Max 60 parole
      const cleaned = text.replace(/\[AZIONE:[^\]]+\]/g, '').split(/\s+/).filter(Boolean).length;
      expect(cleaned).toBeLessThanOrEqual(60);
    });
  }
});
```

```json
// File: tests/e2e/fixtures/vision-states.json (NEW)
[
  { "id": "vision-001-led-ok", "experiment": "v1-cap6-esp1", "manipulation": [], ... },
  { "id": "vision-002-led-no-resistance", "experiment": "v1-cap6-esp1", "manipulation": [{ "action": "removeComponent", "id": "r1" }], ... },
  { "id": "vision-003-led-reverse-polarity", "experiment": "v1-cap6-esp1", "manipulation": [{ "action": "setComponentValue", "id": "led1", "param": "rotation", "value": 180 }], ... },
  { "id": "vision-004-wire-missing", "experiment": "v1-cap6-esp1", "manipulation": [{ "action": "removeWire", "id": "w1" }], ... },
  { "id": "vision-005-power-off", "experiment": "v1-cap6-esp1", "manipulation": [{ "action": "removeComponent", "id": "bat1" }], ... }
]
```

```yaml
# File: .github/workflows/sprint-vision-e2e.yml (NEW)
# manual_dispatch workflow with secrets injection + artifacts upload (vedi D6)
```

---

## 4. Acceptance criteria per implementation

Per `generator-test-opus` quando implementa:

- [ ] File creato: `tests/e2e/02-vision-flow.spec.js` con 5 test (uno per fixture)
- [ ] File creato: `tests/e2e/fixtures/vision-states.json` con 5 fixture entries schema D3
- [ ] File creato: `.github/workflows/sprint-vision-e2e.yml` con workflow_dispatch
- [ ] Skip se `ELAB_API_KEY` o `SUPABASE_ANON_KEY` env mancanti (no false FAIL CI)
- [ ] Login fixture via class_key `TEST-VISION-E2E` localStorage
- [ ] Step 5 captureScreenshot assert base64 PNG length >1000
- [ ] Step 6 POST headers: X-Elab-Api-Key + Bearer + apikey + Content-Type
- [ ] Step 6 body: message, sessionId, experimentId, circuitState, images (Gemini format)
- [ ] Step 7 invarianti: HTTP 200 + plurale + no preamble + pattern + AZIONE + max 60 parole
- [ ] Latency assert <10s per fixture
- [ ] Setup SQL `tests/e2e/fixtures/setup-vision-class.sql` documented per Andrea
- [ ] Manual run `npx playwright test tests/e2e/02-vision-flow.spec.js` PASS 5/5 baseline
- [ ] HTML report `playwright-report/index.html` accessible post-run
- [ ] Cost log osservato <$0.005 per run (Gemini Vision)
- [ ] No regressione test baseline (12574+ PASS preservato)
- [ ] No modifica src/ o supabase/ (test-only changes)
- [ ] Feature flag `VITE_ENABLE_VISION_FLOW` documented in `.env.example`

---

## 5. Trade-off summary onesto

**Pro**:
- Box 7 lift 0 → 0.7 measurable (5/5 PASS = 0.7, 4/5 = 0.5, <4 = 0.3)
- Production E2E = ground truth UX, zero drift mock-vs-real
- Gemini Vision EU GDPR-safe, no GPU dependency post Path A pod TERMINATE
- Cost negligible $0.0025/run, scalable iter 7+
- Feature flag rollback <5min senza redeploy
- Manual_dispatch CI = no PR block, no cost creep automation
- Riuso `unlim-chat` endpoint single = no drift unlim-diagnose deprecabile iter 7
- Coverage 5 categorie diagnostic comuni (functional + 4 errori)

**Contro / debt**:
- Class_key fixture `TEST-VISION-E2E` deve essere preservato in DB Supabase manualmente
- Pattern regex permissivo può false-PASS edge case (mitigato word count min)
- Production test costo Gemini real (trascurabile $0.0025/run ma cumulativo)
- Manual_dispatch = no automatic regression detection (Andrea deve trigger periodicamente)
- 5 fixture sub-statisticamente robuste (CI ±20pp con n=5)
- LLM-judge automatic deferito iter 8+
- Setup SQL `TEST-VISION-E2E` non automatizzato (manual Andrea)
- Cold start primo fixture può sforare 5s SLO p50 (Edge Function spin-up)

**Alternative rejected**:
- "Mock Edge Function locale" → drift mock-vs-real
- "Block PR automatic" → flaky network rischio
- "Endpoint unlim-diagnose separato" → drift PZ validator + audit dual
- "Solo HTTP 200 assert" → vacuo, no quality gate
- "Real student session login" → security risk credentials in CI
- "10 fixtures iter 6" → cost 2x + manutenzione fixture pesante

---

## 6. Open questions per Andrea/orchestrator

1. **[ANDREA-DECIDE] Class_key test fixture creation timing**: SQL setup `TEST-VISION-E2E` in DB Supabase pre-iter 6 manuale Andrea, o orchestrator iter 7+ scriver setup-vision-class.sql idempotent + apply via `supabase db push`?

2. **[ANDREA-DECIDE] Feature flag flip timing**: ADR-012 propone flip `VITE_ENABLE_VISION_FLOW=true` post baseline 5/5 PASS + 1 settimana cost monitoring. Andrea conferma sequence o vuole flip subito iter 6 con monitoring?

3. **[ANDREA-DECIDE] Vision endpoint scelta**: ADR propone riuso `unlim-chat` con images param (single endpoint). Andrea preferisce mantenere `unlim-diagnose` separato per separation of concerns? Mio default: riuso unlim-chat (deprecate unlim-diagnose iter 7+).

4. **[ORCHESTRATOR] CI workflow secrets**: ELAB_API_KEY + SUPABASE_ANON_KEY già disponibili in GH Actions secrets? Se no, Andrea action richiesta pre-iter 7 prima run automation.

5. **[ORCHESTRATOR] Fixture image fidelity**: 5 fixture si basano su mountExperiment + manipulation programmatic. Garantito che canvas SVG render visibile dopo mount + 1500ms timeout? Mio default: yes verified iter 4 stress smoke prod.

6. **Pattern regex permissivo**: ADR usa pattern come `LED.*accende` per diagnostic-001. Andrea preferisce pattern più strict (es. richiede mention "Vol.1" specifico) o più lasco (parole chiave keyword set)? Mio default: balanced (3-5 parole chiave per fixture).

---

## 7. Riferimenti

- **Master plan**: `docs/strategy/2026-04-26-master-plan-v2-comprehensive.md` §Vision flow
- **PDR Sprint S iter 6**: derivato `SETUP-NEXT-SESSION/ARCHITETTURA-FINALE-SESSIONE-2026-04-26.md` §6 P1 5
- **Existing PoC**: `supabase/functions/unlim-diagnose/index.ts` (~218 LOC iter 5 PoC)
- **Multimodal Gemini**: `supabase/functions/_shared/gemini.ts` callGemini con images array native
- **Capture API**: `src/services/simulator-api.js` captureScreenshot flat method base64 PNG
- **Composite spec**: `scripts/openclaw/tools-registry.ts:457-469` analyzeImage L1 morphic
- **Sibling iter 6**: ADR-013 ClawBot composite handler (analyzeImage L1 real exec wire-up)
- **Sibling iter 6**: ADR-014 R6 stress fixture extension (post-RAG ingest)
- **Sibling iter 3**: ADR-007 module extraction pattern (Wiki retriever isomorfic)
- **Sibling iter 3**: ADR-009 validatePrincipioZero middleware (post-LLM PZ runtime gate)
- **Sibling iter 3**: ADR-010 Together AI fallback gated (chain provider Gemini primary EU)
- **Sibling iter 3**: ADR-011 R5 stress fixture (50 prompts pattern reference)
- **PRINCIPIO ZERO**: `CLAUDE.md` apertura (UNLIM mai parla con student direttamente, plurale Ragazzi obbligatorio)
- **GDPR + Gemini EU pinning**: ADR-010 §1.2 (Schrems II + DPA Andrea Google EU)
- **R5 91.80% PASS production baseline**: CLAUDE.md Sprint S iter 5 close §R5 ufficiale
