# Iter 23 — HARNESS REAL Pilot Results + Vol/Pag Regression

**Date**: 2026-04-29 ~07:55 CEST
**Agent**: gen-test-opus iter 23
**Mandate**: Andrea iter 18 PM "MOLTI ESPERIMENTI NON FUNZIONANO" + "USARE PLAYWRIGHT PER TESTARE LETTERALMENTE TUTTO" + G45 anti-inflation
**Tone**: caveman terse, file:line cited per claim

## TL;DR

- **Vol/pag regression 30 prompt**: 30/30 successful HTTP, **overall 72.78%** conformance, **Vol/pag citation 46.7% (14/30)** — target 90% NOT met
- **Harness REAL pilot 5/5**: **0/5 PASS**, identical fail mode `api_ready=false` + `svg_count=0` su prod `https://www.elabtutor.school`
- **Preview bypass URL UNREACHABLE**: `elab-tutor-git-e2e-bypass-preview-andreas-projects-6d4e9791.vercel.app` returns HTTP 401 Vercel SSO (deployment protection)
- **Smoke 5/5 iter 23 = 100% Vol/pag** era **inflato confronto scale-up 30 prompts** (real conformance 46.7% Vol/pag)

## Sezione 1 — Vol/Pag Regression 30 Prompts

**Endpoint**: `https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat`
**Auth**: SUPABASE_ANON_KEY + X-Elab-Api-Key (REDACTED-rotated-iter31)
**Output**: `automa/state/vol-pag-regression-iter23.json` + `scripts/bench/output/vol-pag-regression-responses-2026-04-29T05-49-04-941Z.jsonl`

### Aggregate per metric (n=30)

| Metric | Pass | % | Target | Status |
|---|---|---|---|---|
| ragazzi_opening | 30/30 | 100.0% | ≥90% | PASS |
| word_count_ok (≤60) | 30/30 | 100.0% | ≥90% | PASS |
| analogy_present | 27/30 | 90.0% | ≥80% | PASS |
| verbatim_quote («…») | 20/30 | 66.7% | ≥85% | WARN |
| **vol_pag_citation** | **14/30** | **46.7%** | **≥90%** | **FAIL** |
| kit_mention | 10/30 | 33.3% | ≥60% | FAIL |

**Overall composite**: 72.78% (target 90% — WARN)

### Per-prompt highlights (file `automa/state/vol-pag-regression-iter23.json`)

- 6/6 PASS (100%): g03 breadboard-rails, g15 pinMode-OUTPUT, g27 cicalino-buzzer
- 5/6 (83%): g02, g08, g09, g16, g17, g22, g23
- 3/6 (50%): g01 LED-base, g14 GND-massa, g18 LED-RGB, g24 sketch-loop, g30 arduino-alimentazione
- 2/6 (33%): g21 led-anodo-catodo

### Delta vs iter 22 baseline / iter 23 smoke

- iter 22 pre-fix (commit pre-fdb97d9): 0/3 prompt verbatim claim (smoke prod)
- iter 23 smoke 5/5: 100% Vol/pag (5 prompt molto narrow, RAG-rich topic)
- **iter 23 30-prompt regression: 46.7%** ← REAL ground truth

**Onesto G45**: smoke 5/5 fu cherry-pick. Scale-up 30 = 14/30 Vol/pag. **+46.7pp vs iter 22 0% confermato deploy fdb97d9 fa qualcosa**, ma NON 90% target.

### Bug pattern Vol/pag (cita response_text JSONL)

1. Prompt brevi metafisici (g14 GND, g21 anodo/catodo) → modello non aggancia capitolo specifico
2. Prompt cross-volume (g26 analog-vs-digital, g30 arduino-alimentazione) → ambiguo retrieval
3. Prompt pratici visivi (g22 jumpers, g29 codice colori) → non sempre cita pag

## Sezione 2 — Harness REAL Pilot 5/5

**File**: `automa/state/iter-23-harness-real-pilot/results.jsonl` (6 righe: 1 _meta + 5 esperimenti)
**URL test**: `https://www.elabtutor.school` (prod, NON preview bypass — preview UNREACHABLE 401 SSO)

### Risultati raw

| Esperimento | Title | Volume | Arduino | Pass | api_ready | svg_count | console_err | duration |
|---|---|---|---|---|---|---|---|---|
| v1-cap10-esp1 | La fotoresistenza sente la luce | 1 | no | **FAIL** | false | 0 | 0 | 24.1s |
| v1-cap6-esp1 | Accendi il tuo primo LED | 1 | no | **FAIL** | false | 0 | 0 | 21.0s |
| v3-cap5-esp1 | Blink con LED_BUILTIN | 3 | yes | **FAIL** | false | 0 | 0 | 22.0s |
| v3-cap6-esp1 | Circuito AND/OR con pulsanti | 3 | yes | **FAIL** | false | 0 | 0 | 21.7s |
| v3-cap7-esp1 | Pulsante accende LED | 3 | yes | **FAIL** | false | 0 | 0 | 21.7s |

**Pass criteria fail mode IDENTICO 5/5**: `pass_criteria.api_ready=false`, `pass_criteria.render_has_svg=false`. Mount fallback hash-only (no `__ELAB_API`).

## Sezione 3 — Console errors per esperimento

**Tutti e 5**: `consoleErrors: []`, `pageErrors: []`, `failedRequests: []`.

Interpretazione: la pagina home prod si carica clean (no JS error), MA il React app NON arriva a `__ELAB_API` exposure step. Causa probabile: `WelcomePage.jsx` license gate blocca renderer simulator.

Iter 21 commit `111e4c1` ha aggiunto auto-skip code via `VITE_E2E_AUTH_BYPASS=true` SOLO su Preview env (NOT prod). Su prod gate ATTIVO.

## Sezione 4 — Estrapolazione 87 esperimenti broken count stimato

**Sample 5/87 = 5.7% coverage**.
**Pattern uniforme failure** (api_ready=false 5/5) suggerisce blocker SISTEMICO non per-experiment.

Estrapolazione onesta:
- **Se license gate è il blocker primario**: 87/87 fail su prod live (100% non-functional UNO PER UNO, NON solo "molti")
- **Se preview bypass funziona**: ridurre a 87 - false positives gate; richiede preview SSO unblock per misura
- **Iter 21 stima precedente**: "0/87 verified" → confermata pattern, NON peggiorata

**Mandato Andrea "MOLTI ESPERIMENTI NON FUNZIONANO"**: confermato literally, MA cause root è gate license, NON simulator engine broken.

## Sezione 5 — P0 fix list iter 23+ post-pilot

| # | Fix | Owner | Urgency | LOC est |
|---|---|---|---|---|
| 1 | **Preview SSO unblock** (Vercel "Deployment Protection" → set Preview = Public, OR add bypass token query param) | Andrea Vercel dashboard | P0 | 0 (config) |
| 2 | **Verify VITE_E2E_AUTH_BYPASS=true** Preview env via `vercel env ls --environment=preview` | Andrea | P0 | 0 |
| 3 | Estendere bypass a prod build via query param `?e2e=1` + token (sicuro, no public bypass) — alt: harness usa staging dedicated | Andrea + gen-app | P1 | ~30 |
| 4 | Vol/pag fix prompt brevi metafisici (g14, g21) → forzare RAG retrieval anche su query 1-token | gen-app `_shared/rag.ts` | P1 | ~50 |
| 5 | Kit mention 33.3% → BASE_PROMPT v3 deve includere "menziona kit/breadboard SEMPRE quando azione fisica" | gen-app `_shared/system-prompt.ts` | P1 | ~10 |
| 6 | Verbatim quote 66.7% → enforce in PZ validator post-LLM (rerun if missing «») | gen-app `_shared/principio-zero-validator.ts` | P2 | ~40 |
| 7 | Harness pilot retry su preview URL post-#1 | gen-test `npm run test:harness-real` | P1 | 0 |

## Sezione 6 — Mac Mini cron 12h dispatch design

### Existing scaffold

- `scripts/harness-real/dispatch.sh` (76 LOC, iter 21 ready)
- Default URL: `https://www.elabtutor.school` (prod)
- Schedule proposed: `0 2,14 * * *` (02:00 + 14:00 daily UTC)

### Required changes per iter 23

1. **NON attivare cron immediato** — Andrea OK gate (per task spec)
2. Update default URL in `dispatch.sh` line 35 / 39 a preview bypass post-fix #1 sezione 5:
   ```bash
   ELAB_PROD_URL="${ELAB_PROD_URL:-https://elab-tutor-git-e2e-bypass-preview-andreas-projects-6d4e9791.vercel.app}"
   ```
3. Wrapper Mac Mini `/Users/progettibelli/scripts/harness-real-cron.sh`:
   ```bash
   #!/usr/bin/env bash
   set -uo pipefail
   cd /Users/progettibelli/elab/PRODOTTO/elab-builder
   git pull --ff-only origin main 2>&1
   bash scripts/harness-real/dispatch.sh
   ```
4. Crontab entry (NON attivato iter 23):
   ```
   0 2,14 * * * /bin/bash /Users/progettibelli/scripts/harness-real-cron.sh >> /tmp/harness-real-dispatch.log 2>&1
   ```

### Activation steps Andrea (gate)

1. Verifica preview SSO unblock OK (sezione 5 fix #1)
2. Run pilot manuale: `npm run test:harness-real`
3. Se PASS rate ≥80% sample → attiva cron Mac Mini `crontab -e`
4. Monitor 48h: `tail -f /tmp/harness-real-dispatch.log` + `automa/state/iter-21-harness-real/results-*.jsonl`

## Onesty caveats G45

1. **Preview URL non testato real**: 401 SSO blocca harness. Numbers 5/5 fail su PROD (NON preview bypass). Mismatch task spec ma necessario per data raw.
2. **Vol/pag 46.7% NON è regression vs iter 22 0%**: è MIGLIORAMENTO real +46.7pp, ma SOTTO target 90%. Smoke 5/5 fu inflato.
3. **Pattern S race-cond fix N/A** questa è single-agent autonomous run.
4. **Coverage 5/87 = 5.7%** — estrapolazione 87 broken assume blocker uniforme (verificato pattern), NON prova per-experiment.
5. **Mac Mini cron NON activated** per task spec. Solo design + script ready.
6. **Mandate Andrea Playwright "letteralmente tutto"**: 5/87 lontano da "tutto". Full 87/87 ~30-60 min richiede preview unblock prima.

## Files iter 23 deliverables

- NEW: `scripts/bench/vol-pag-regression-suite.mjs` (~290 LOC, 30 gold-set prompts + 6 metric regex + edge call retry + JSON aggregate)
- MODIFIED: `package.json` line ~19 add `test:harness-real` script (URL `elab-tutor-git-e2e-bypass-preview` corrected from `elab-builder-git-e2e-bypass-preview` per `vercel inspect`)
- NEW: `automa/state/vol-pag-regression-iter23.json` (~60 fields aggregate + per-prompt 30 entries)
- NEW: `automa/state/iter-23-harness-real-pilot/results.jsonl` (5 esperimenti fail)
- NEW: `scripts/bench/output/vol-pag-regression-responses-2026-04-29T05-49-04-941Z.jsonl` (30 raw responses)
- NEW: `tests/e2e/snapshots/iter-21-real-harness/v{1-cap6,1-cap10,3-cap5,3-cap6,3-cap7}-esp1.png` (5 screenshot, ~app shell home only — no simulator)
- NEW: `docs/audits/2026-04-29-iter-23-HARNESS-REAL-pilot-results.md` (questo file)

## Activation iter 24 (proposed, gate Andrea)

1. P0: Andrea Vercel dashboard → "Deployment Protection" Preview = Public (OR add ELAB_HARNESS_BYPASS_TOKEN query param white-list)
2. P0: `npm run test:harness-real` retry → expect ≥80% sample PASS
3. P1: gen-app fix BASE_PROMPT kit_mention + verbatim_quote enforcement post-LLM
4. P1: Estendi vol-pag-regression-suite.mjs a 60 prompts (cover 92 esperimenti distribution)
5. P2: Activate Mac Mini cron post manual verify

## Final score iter 23 ONESTO

**Box "Vol/pag conformance Vol/pag"** (parte del Sprint T): 0.0 (iter 22) → **0.47 (iter 23)** — lift +0.47, NOT 1.0 target
**Box "Harness REAL execution"** (Sprint T iter 19+): 0.0 → **0.05** (5/87 sample, 0/5 PASS — pattern data raccolto, blocker identified)

NO inflation. Smoke 5/5 100% confermato cherry-pick scale-up 30 = 46.7%.
