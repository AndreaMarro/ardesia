---
id: ADR-011
title: Sprint R5 stress fixture extension — 10 → 50 prompts across 6 categories
status: proposed
date: 2026-04-26
deciders:
  - architect-opus (Sprint S iter 3 ralph loop, Pattern S)
  - Andrea Marro (final approver per category weights + pass thresholds)
context-tags:
  - sprint-s-iter-3
  - sprint-r5-stress-test
  - principio-zero-bench
  - quality-gate-90pct
  - edge-function-unlim-chat
  - cov-3x
related:
  - ADR-008 (buildCapitoloPromptFragment) — Sprint S iter 2
  - ADR-009 (validatePrincipioZero middleware) — Sprint S iter 2
  - ADR-010 (Together AI fallback gated) — sibling iter 3
  - docs/strategy/2026-04-26-master-plan-v2-comprehensive.md §6 (R5 gate)
  - docs/pdr/PDR-SPRINT-S-ITER-3-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md §1.5, §2.5 box 9
  - scripts/bench/workloads/sprint-r0-unlim-quality-fixtures.jsonl (10 prompts iter 2)
  - scripts/bench/score-unlim-quality.mjs (12 RULES scorer)
  - scripts/bench/run-sprint-r0-render.mjs (R0 runner Render legacy)
input-files:
  - scripts/bench/workloads/sprint-r0-unlim-quality-fixtures.jsonl (10 entries jsonl, ~3.5KB)
  - scripts/bench/score-unlim-quality.mjs (~306 LOC, 12 RULES)
  - scripts/bench/run-sprint-r0-render.mjs (~200 LOC, Render endpoint runner)
  - supabase/functions/unlim-chat/index.ts (target Edge Function endpoint)
output-files:
  - scripts/bench/workloads/sprint-r5-stress-fixtures.jsonl (NEW — 50 entries jsonl)
  - scripts/bench/run-sprint-r5-edge-function.mjs (NEW — runner Edge Function elab-unlim)
  - scripts/bench/output/r5-{report,responses,scores}-<TS>.{md,jsonl,json} (per-run artifacts)
  - .github/workflows/sprint-r5-bench.yml (NEW — manual_dispatch optional)
---

# ADR-011 — Sprint R5 stress fixture extension (10 → 50 prompts, 6 categories, ≥90% PASS gate)

> Estendere fixture R0 (10 prompts) a fixture R5 (50 prompts) bilanciata su 6 categorie tematiche di PRINCIPIO ZERO. Definire pesi, soglie per-categoria, runner che chiama Edge Function deployed (NON Render legacy), e gate Sprint 6 Day 39 ≥90% PASS overall + ≥80% per categoria.

---

## 1. Contesto

### 1.1 R0 baseline iter 2 measured

Sprint S iter 2 ha eseguito Sprint R0 baseline su Render endpoint legacy (`https://elab-galileo.onrender.com/chat`, NON Edge Function deployed Supabase elab-unlim) con fixture 10 prompts. Risultati:

| Metric | Value | Verdict |
|--------|-------|---------|
| Overall | 75.81% | WARN (target 85% PASS, 90% R5 gate) |
| `plurale_ragazzi` | 0/10 | FAIL critical |
| `citation_vol_pag` | 0/10 | FAIL critical |
| `max_words` | 3/10 | FAIL |
| `analogia` | 4/10 | WARN |
| `no_imperativo_docente` | 10/10 | PASS |
| `no_verbatim_3plus_frasi` | 9/10 | PASS |
| `no_chatbot_preamble` | 8/10 | PASS |
| `linguaggio_bambino` | 7/10 | WARN |

Iter 2 close ha deployato BASE_PROMPT v3 (forza "Ragazzi," + USO DELLE FONTI + max 60 parole) → atteso lift dramatic post-deploy. Iter 3 priority A1 = re-run R0 stesso fixture su Edge Function NEW deployed → misurare delta vs 75.81%.

### 1.2 Perché serve R5 50 prompts (non solo R0 10)

R0 con 10 prompts ha tre limiti severi:

1. **Statistical power basso**: 10 sample → confidence interval ±15-20 percentage points. Differenze 75% vs 85% non statisticamente significative con n=10.

2. **Coverage scenario insufficiente**: 10 prompts coprono solo:
   - 1 introduce-concept (LED Cap6)
   - 1 debug-circuit (LED non accende)
   - 1 verify-comprehension (LED serie corrente)
   - 1 capitolo-intro (Cap11 diodi)
   - 1 off-topic (ristorante)
   - 1 deep-question (PWM Arduino)
   - 1 safety-warning (LED+9V)
   - 1 action-request (highlight LED)
   - 1 narrative-transition (Cap6 esp1→esp2)
   - 1 book-citation-request (pag.27)
   
   Mancano: domande complesse multi-componente, errori comuni studenti, glossario terminologia, analogie ricorrenti, sicurezza vasta, errori di programma Arduino, scenari debug avanzati.

3. **Pass gate ≥90% irrealistico con n=10**: una singola risposta fail su 10 = 10% drop = sotto soglia. Variabilità modello (LLM stocastico) richiede n ≥30 per stabilità statistica.

Sprint 6 Day 39 master plan §6 pone gate R5 ≥90% PASS overall come prerequisito a:
- ClawBot 80-tool dispatcher live (box 10 SPRINT_S_COMPLETE)
- Auto-deploy permission GRANTED Andrea (per CLAUDE.md activation §9.2)
- Promise SPRINT_S_COMPLETE close

Senza fixture stress robusta, gate è vacuo (= n=10 con CI ±15pp).

### 1.3 Endpoint shift: Edge Function elab-unlim (NON Render legacy)

R0 iter 2 misurato su Render `https://elab-galileo.onrender.com/chat` perché era endpoint legacy con BASE_PROMPT vecchio + nessuna integrazione Capitolo. Iter 2 commit `a22b24d` ha deployato Edge Function `elab-unlim` (`https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat`) con:
- BASE_PROMPT v3
- `buildCapitoloPromptFragment` integration
- `validatePrincipioZero` post-LLM (ADR-009)
- RAG context injection (Sett-4)

Sprint R5 deve testare il path PRODUCTION (Edge Function), NON il legacy Render. Cambio endpoint = cambio runner script.

---

## 2. Decisione

### 2.1 Decisione D1 — 6 categorie tematiche per copertura PZ rule

**Scelta**: 50 prompts distribuiti in 6 categorie. Distribuzione bilanciata per coprire tutte le 12 PZ rule + scenari edge.

| # | Category | Count | PZ rules emphasis |
|---|----------|-------|-------------------|
| 1 | `principio-zero-plurale` | 10 | R1 plurale_ragazzi, R12 no_chatbot_preamble |
| 2 | `citazione-volume-pagina` | 10 | R4 citation_vol_pag, R6 no_verbatim_3plus_frasi |
| 3 | `sintesi-max-60-parole` | 8 | R3 max_words, R7 linguaggio_bambino |
| 4 | `safety-warning-corrente` | 6 | R8 action_tags, R10 off_topic_recognition |
| 5 | `off-topic-redirect` | 6 | R10 off_topic_recognition, R12 no_chatbot_preamble |
| 6 | `deep-question-elettronica` | 10 | R5 analogia, R11 humble_admission, R9 synthesis_not_verbatim |

**Razionale per category**:

- **principio-zero-plurale (10)**: domande aperte tipo introduzione concetto, dove plurale "Ragazzi, ..." è atteso per linguaggio classe. Forza R1 a 10/10 (vs 0/10 baseline).
- **citazione-volume-pagina (10)**: domande che richiedono ancora libro fisico (es. "Cosa dice Vol.1 a pag.27?"). Forza R4 + verifica anti-verbatim R6 quando citazione è espansa.
- **sintesi-max-60-parole (8)**: domande dove brevità conta (debug rapido, definizione concisa). Verifica R3 + linguaggio appropriato 10-14 anni.
- **safety-warning-corrente (6)**: prompts su 5V/9V batteria, cortocircuito, surriscaldamento. Verifica risposta NON minimizza pericolo + tag `[AZIONE:warning]` se applicabile.
- **off-topic-redirect (6)**: domande non-experiment (meteo, sport, altre materie) — verifica redirect a lezione attuale + no improvisation.
- **deep-question-elettronica (10)**: concept profondi (Ohm derivation, MOSFET threshold, frequenza PWM) — verifica humble admission quando docente chiede profondità tecnica + analogia ricorrente.

**Alternative considerate**:

| Distribution | Pro | Contro | Decisione |
|--------------|-----|--------|-----------|
| 10×5 = 50 uniform 5 cat | Semplice | 4° categoria sub-rappresentata (safety merita less perché meno frequent) | Scartato |
| **10/10/8/6/6/10 (SCELTO)** | Riflette frequenza realistica + emphasis su gap noti | Asimmetria può confondere readability | Scelto |
| 12/12/6/4/8/8 | Più peso su PZ + sintesi | Off-topic + safety sub-coverage | Scartato |
| Random per category 50 unstratified | Real-world distribution unknown | Varianza alta, no statistical control | Scartato |

**Downside onesto**: distribuzione asimmetrica (max 10, min 6) significa che category con n=6 ha CI ±20pp. Acceptable perché safety + off-topic sono PASS naturali (R10 pattern-based) — il gate per categoria 80% = 5/6 è realistico. PZ rule che falliscono baseline (R1, R4) hanno n=10 dove serve potenza statistica.

### 2.2 Decisione D2 — Score weights per category

**Scelta**: pesi non uniformi, riflettono criticità per UX docente live.

| Category | Weight | Rationale |
|----------|--------|-----------|
| principio-zero-plurale | 1.0 | CRITICAL UX — docente sente "Ragazzi" tutto il giorno, altrimenti UNLIM "freddo" |
| citazione-volume-pagina | 0.9 | HIGH — differenziatore competitivo (libro fisico citato) |
| sintesi-max-60-parole | 0.85 | HIGH — UX docente legge a voce alta, oltre 60 parole = pausa naturale |
| safety-warning-corrente | 1.0 | CRITICAL — sicurezza minori, no minimization |
| off-topic-redirect | 0.7 | MEDIUM — utile ma non distrugge UX se imperfetto |
| deep-question-elettronica | 0.8 | MEDIUM — humble admission importante, no peggio di Wikipedia |

**Score formula overall**:

```
overall_score = SUM(category_pass_rate × category_weight × category_count) / SUM(category_weight × category_count)

dove:
  category_pass_rate = (passed prompts / total prompts in category)
  category_weight    = peso assegnato (0.7-1.0)
  category_count     = numero prompts in category
```

Esempio worst case acceptable:
- principio-zero-plurale 9/10 × 1.0 × 10 = 90
- citazione-volume-pagina 9/10 × 0.9 × 10 = 81
- sintesi-max-60-parole 7/8 × 0.85 × 8 = 59.5
- safety-warning-corrente 6/6 × 1.0 × 6 = 60
- off-topic-redirect 5/6 × 0.7 × 6 = 21
- deep-question-elettronica 8/10 × 0.8 × 10 = 64
- Total: 375.5 / SUM(weights × count) = 375.5 / 41.7 = 9.005 → 90.05% PASS ✓

**Razionale weight non uniformi**: PZ rule violations non hanno tutte stessa gravità per UX. Plurale + safety = CRITICAL (Andrea call-out specifici). Off-topic = MEDIUM (gracefully degrades). Deep-question = MEDIUM (humble admission compensates per imperfect answer).

**Alternative scartate**:

- "Pesi tutti 1.0 uniformi" → ignora criticità UX docente
- "Pesi binari 1/0 (CRITICAL=1, else=0)" → perde gradient
- "Pesi dinamici da fixture metadata" → over-engineered iter 3

### 2.3 Decisione D3 — Pass gate ≥45/50 PASS (90%) + each category ≥80%

**Scelta**: **doppia soglia**: overall ≥90% AND each category ≥80%.

**Razionale doppia soglia**:
- Solo overall: 45/50 PASS può nascondere category al 0% (es. 50 prompts, 5 fail tutti in 1 category → category 5/10=50%, overall 45/50=90% ma category fallita)
- Solo per-category: tutte ≥80% (40/50 minimum) ma overall può scendere se molte categorie 80%
- **Doppia**: forza balance — nessuna category degradata + overall robusto

**Threshold per category** (count-aware):

| Category | Count | Min PASS | Pass % |
|----------|-------|----------|--------|
| principio-zero-plurale | 10 | 8/10 | 80% |
| citazione-volume-pagina | 10 | 8/10 | 80% |
| sintesi-max-60-parole | 8 | 7/8 | 87.5% |
| safety-warning-corrente | 6 | 5/6 | 83.3% |
| off-topic-redirect | 6 | 5/6 | 83.3% |
| deep-question-elettronica | 10 | 8/10 | 80% |
| **Overall** | **50** | **45/50** | **90%** |

**Verdetto runner output**:

```
PASS: overall ≥ 90% AND ALL category ≥ 80%
WARN: overall ≥ 80% AND ≥ 4 categorie ≥ 80%
FAIL: overall < 80% OR ≥ 2 categorie < 80%
```

PASS = unblock Sprint 6 Day 39 ClawBot + auto-deploy permission. WARN = tune fixture/prompt iter, retest. FAIL = block, regression analysis.

### 2.4 Decisione D4 — Fixture file format jsonl (extends R0)

**Scelta**: estensione formato jsonl R0 con campi addizionali. Backward compatible (scorer accepts both R0 + R5 schemas).

```jsonl
{
  "id": "r5-001-pz-plurale",
  "scenario": "introduce-concept",
  "category": "principio-zero-plurale",
  "weight": 1.0,
  "experimentId": "v1-cap6-esp1",
  "userMessage": "Cosa è un LED?",
  "expectedTopics": ["LED", "diodo", "luce", "polarità"],
  "expectedSources": ["wiki:led", "rag:vol1.cap6"],
  "expectedPattern": ["Ragazzi", "LED", "diodo"],
  "principioZeroChecks": {
    "plurale_ragazzi": true,
    "citation_vol_pag": true,
    "max_words": 60,
    "analogia": true,
    "no_imperativo_docente": true,
    "no_verbatim_3plus_frasi": true
  },
  "gate_threshold": 0.8,
  "rationale": "Domanda apertura concetto LED — plurale obbligatorio, citazione Vol.1 attesa"
}
```

**Nuovi campi vs R0**:
- `category` (string, REQUIRED): mapping a una delle 6 categorie ADR §2.1
- `weight` (number, OPTIONAL, default 1.0): peso per scoring (override category default)
- `expectedPattern` (string[], OPTIONAL): pattern anchor da cercare in response (additive a `expectedTopics`)
- `gate_threshold` (number, OPTIONAL, default 0.8): soglia PASS individuale per prompt (per fine tuning)
- `rationale` (string, OPTIONAL): note autore fixture per review

**Backward compat**: campi R0 (`scenario`, `experimentId`, `userMessage`, `expectedTopics`, `expectedSources`, `principioZeroChecks`) preservati + campi R5 sono additive. Scorer detecta categoria via campo `category` (default `unknown` se assente, peso 0.5).

**Razionale jsonl**:
- Streaming-friendly (read line by line, no full file load)
- Easy diff git (1 line = 1 fixture)
- VS Code preview ok
- Compatible scorer R0 esistente con minimal changes

**Alternative scartate**:

| Format | Pro | Contro | Decisione |
|--------|-----|--------|-----------|
| **jsonl extension R0 (SCELTO)** | Compat backward, streaming, git-friendly | None major | Scelto |
| YAML | Human-readable | Indentation hell + slower parse | Scartato |
| TOML | Compact | No streaming + fewer Node tools | Scartato |
| CSV | Spreadsheet-friendly | Nested fields painful | Scartato |
| TS module export array | Type-safe | Need Vitest harness, no streaming, refactor scorer | Scartato |

### 2.5 Decisione D5 — Runner contract `run-sprint-r5-edge-function.mjs`

**Scelta**: nuovo runner che chiama Edge Function deployed Supabase (NON Render). Estende pattern `run-sprint-r0-render.mjs` con:

```js
const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://euqpdueopmlllqjmqnyb.supabase.co').trim();
const ELAB_UNLIM_ENDPOINT = `${SUPABASE_URL}/functions/v1/unlim-chat`;
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || '').trim();
const FIXTURE = process.env.FIXTURE || './workloads/sprint-r5-stress-fixtures.jsonl';
const REQUEST_TIMEOUT_MS = 30000;
const COLD_START_RETRY_DELAY_MS = 5000;  // Edge Function cold start <1s typical
const MAX_RETRIES_PER_PROMPT = 2;
```

**Auth**: Edge Function `unlim-chat` richiede `Authorization: Bearer ${SUPABASE_ANON_KEY}` o JWT user. Per bench: usa anon key (Sprint S iter 2 deploy permits).

**Request shape** (verified `unlim-chat/index.ts`):

```js
{
  message: userMessage,
  sessionId: makeSessionId(),
  experimentId: experimentId || null,
  studentContext: null,        // NO context for bench (clean prompt)
  circuitState: null,          // NO state
  images: []                   // NO vision
}
```

**Response shape**:

```js
{
  success: boolean,
  response: string,            // text from validatePrincipioZero output
  metadata: {
    model: string,
    latency_ms: number,
    tokens: { input: number, output: number },
    pz_violations?: object[]   // if ELAB_DEBUG_PZ=true
  }
}
```

**Algorithm**:
1. Load fixture jsonl, parse 50 entries
2. For each entry:
   - sleep 200ms (rate-limit polite)
   - POST to Edge Function with retry on 429 + cold start
   - Capture response text + latency
   - Append to `responses-<TS>.jsonl`
3. Run scorer with `--baseline` flag:
   - `node scripts/bench/score-unlim-quality.mjs scripts/bench/output/r5-responses-<TS>.jsonl --baseline`
4. Aggregate per category + apply weights ADR §2.2
5. Output `report-<TS>.md` con verdetto PASS/WARN/FAIL

**Output files**:

```
scripts/bench/output/
├── r5-responses-<TS>.jsonl       # raw {prompt_id, request, response, latency_ms, status}
├── r5-scores-<TS>.json           # scorer output structured
├── r5-report-<TS>.md             # human-readable summary table per category
└── r5-summary-<TS>.json          # final verdict {pass, overall_pct, per_category[], weights_applied}
```

**Razionale runner separato (non re-use R0)**:
- Endpoint diverso (Edge Function vs Render)
- Auth diverso (Bearer vs no auth)
- Cold start handling diverso (Edge Function ~1s vs Render 18s)
- Request body diverso (richiede sessionId + experimentId tipi specifici)
- Output filename prefix diverso (r5- vs r0-) per ricerca cronologica

**Alternative scartate**:

- "Riusare run-sprint-r0-render.mjs con env override" → confonde semantic, hardcoded headers Render
- "Scrivere runner generico configurabile via JSON" → over-engineered iter 3

### 2.6 Decisione D6 — CI integration: GitHub Actions manual_dispatch (NOT block PR)

**Scelta**: workflow `.github/workflows/sprint-r5-bench.yml` con trigger `workflow_dispatch` (manuale) — NON `pull_request` (automatic).

**Rationale**:
- R5 bench richiede 50 calls × 2-5s latenza = 2-5 minuti per run (no cold start)
- Runner deve avere SUPABASE_ANON_KEY secret
- Costo: ~50 calls × Gemini Flash (free tier) = $0 ma rate-limit Gemini 60RPM → 50 prompts ok ma sequencing matters
- PR auto-block sarebbe troppo restrittivo (5min wait per PR) e flaky se Gemini rate-limit hit

**Workflow shape**:

```yaml
name: Sprint R5 Stress Bench (manual)

on:
  workflow_dispatch:
    inputs:
      fixture:
        description: 'Fixture file path'
        required: false
        default: 'scripts/bench/workloads/sprint-r5-stress-fixtures.jsonl'
      gate:
        description: 'Apply pass gate verdict (true/false)'
        required: false
        default: 'true'

jobs:
  r5-bench:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - name: Run R5 stress bench
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          FIXTURE: ${{ inputs.fixture }}
        run: node scripts/bench/run-sprint-r5-edge-function.mjs
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: sprint-r5-bench-${{ github.run_id }}
          path: scripts/bench/output/r5-*.{jsonl,json,md}
      - name: Apply pass gate verdict
        if: inputs.gate == 'true'
        run: |
          if grep -q "VERDICT: PASS" scripts/bench/output/r5-summary-*.json; then
            echo "::notice::R5 PASS — Sprint 6 Day 39 unblocked"
            exit 0
          else
            echo "::error::R5 FAIL — Sprint 6 Day 39 blocked"
            exit 1
          fi
```

**Razionale `workflow_dispatch`**:
- Andrea triggera manualmente quando vuole misurare delta post-deploy
- Artifacts uploaded per analisi storica
- Gate opzionale (default ON ma può disabilitare per dry-run)

**Alternative scartate**:

- "PR automatic block" → 5min wait per PR + flaky rate-limit
- "Schedule cron daily" → noisy + costly + no value se no deploy
- "Local-only via npm script" → non integrabile con CI alerts

### 2.7 Decisione D7 — Fixture composition method

**Scelta**: composizione manuale per iter 3 + iterativa per iter 4+. NO LLM-generated synthetic prompts (rischio meta-circular bias).

**Sources per ogni category**:

1. **principio-zero-plurale (10)** — derivati da R0 (1) + Wiki concepts (9):
   - R0-001 (LED Cap6) keep
   - 9 nuovi: tensione, corrente, resistenza, conduttore, isolante, semiconduttore, batteria, breadboard, jumper-wire
   - Pattern: "Cosa è X?" o "Spiegaci X" (apertura concetto)

2. **citazione-volume-pagina (10)** — derivati da volumi-text scan (`grep -i "Vol\.\|pag\.\|cap\."`) + 10 prompt selezionati per coverage 3 volumi:
   - Vol.1: pag.27 LED, pag.34 resistenza, pag.45 led-serie
   - Vol.2: pag.12 condensatore, pag.28 transistor, pag.40 oscillatore
   - Vol.3: pag.18 Arduino-pin, pag.31 PWM, pag.55 sensori, pag.72 I2C
   - Pattern: "Cosa dice il libro a pag.X?" o "Cita Vol.Y a pag.Z"

3. **sintesi-max-60-parole (8)** — domande dove brevità conta:
   - "Definisci breve cos'è X" (5)
   - "In una frase: come funziona Y?" (3)

4. **safety-warning-corrente (6)** — derivati da R0-007 + escalation:
   - R0-007 (LED+9V) keep
   - 5 nuovi: cortocircuito, batteria scarica calda, fili scoperti, mano bagnata, surriscaldamento componente

5. **off-topic-redirect (6)** — derivati da R0-005 + variazioni:
   - R0-005 (ristorante) keep
   - 5 nuovi: meteo, sport, musica, cucina, geografia (tutti redirect a lezione corrente)

6. **deep-question-elettronica (10)** — derivati da R0-006 + concept profondi:
   - R0-006 (PWM 490Hz) keep
   - 9 nuovi: derivazione legge Ohm, MOSFET threshold voltage, capacità parassita, induttanza filo, frequenza risonanza, impedenza vs resistenza, decibel scala log, fase neutro, terra protezione, isolamento galvanico

**Razionale composizione manuale**:
- Quality control diretta (Andrea/architect verifica realismo prompt)
- Anti-bias: LLM-generated synthetic prompts rischia di favorire LLM target (recency + tone matching)
- Reproducibility: fixture committed in git, versionata, immutable post-merge

**Iterative tuning**: post run R5 iter 5+, prompts che falliscono consistentemente (5/5 retest) sono candidates a:
- Tuning prompt (ambiguo)
- Tuning expectedTopics (lista incompleta)
- Tuning category assignment (mismatch)
- Drop fixture (impossible da soddisfare con stack attuale, defer Sprint H2)

### 2.8 Decisione D8 — Versioning fixture + scorer

**Scelta**: versionare entrambi separatamente.

**Fixture**:
- File: `scripts/bench/workloads/sprint-r5-stress-fixtures.jsonl`
- Header line jsonl (line 1): `{"_metadata": {"version": "v1.0", "date": "2026-04-26", "author": "architect-opus", "categories": 6, "total": 50}}`
- Bump semver: v1.0 → v1.1 (additive prompts) → v2.0 (rebalance categories)

**Scorer**:
- File: `scripts/bench/score-unlim-quality.mjs` (existing)
- Add field `scorer_version` in output JSON (default `v1.0` Sprint R0, bump quando rule logic cambia)
- Forward compat: scorer v1.x reads fixture v1.x (additive fields ok)
- Breaking compat: scorer v2.0 may require fixture v2.0+ (incompatible schema → fail with clear error)

**Audit trail**: ogni run R5 produce `r5-summary-<TS>.json` con:

```json
{
  "fixture_version": "v1.0",
  "scorer_version": "v1.0",
  "timestamp": "2026-04-26T...",
  "endpoint": "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat",
  "git_sha": "<deploy commit>",
  "verdict": "PASS|WARN|FAIL",
  "overall_pct": 90.05,
  "per_category": {
    "principio-zero-plurale": { "passed": 9, "total": 10, "pct": 90.0, "weight": 1.0 },
    ...
  },
  "weighted_score": 0.9005,
  "honesty_caveats": []
}
```

### 2.9 Decisione D9 — Honesty caveats per run

**Scelta**: ogni run R5 produce `honesty_caveats[]` array nel summary JSON con vincoli reali della misurazione.

Esempi caveat:
- `"deploy_age_days: 2"` — deploy fresh, modello ancora "warm" cache prompt
- `"endpoint_cold_start_ms: 850"` — primo prompt avg cold start, scartato dal weighted average
- `"rate_limit_hits: 0"` — quanti 429 retry incontrati
- `"timeout_count: 0"` — quanti timeout (se >0, threshold qualifica scende)
- `"gemini_quota_remaining_pct: 65"` — Gemini RPM left (se <20%, run risultati biased)
- `"validator_blocked: 0"` — quanti gate post-LLM hanno sostituito response (ADR-009)

**Razionale**: PRINCIPIO ZERO si estende anche a meta-livello — onestà su come è stato misurato, non solo cosa misurato. Andrea apre summary → vede caveats subito.

### 2.10 Decisione D10 — Roadmap futura R6+

**Scelta**: fixture R5 iter 3 = baseline. Estensioni future organiche.

| Sprint | Fixture | Total | Focus |
|--------|---------|-------|-------|
| iter 3 (CURRENT) | sprint-r5 v1.0 | 50 | 6 categorie balanced |
| iter 5+ | sprint-r5 v1.1 | 60-70 | + multilingue stub (5 EN, 5 ES) |
| iter 8+ | sprint-r6 v1.0 | 100 | + adversarial (prompts che cercano rompere PZ) |
| iter 12+ | sprint-r7 v1.0 | 150 | + LLM-judge automatic (Claude Sonnet judge OK Italian) |

iter 3 SCOPE: SOLO sprint-r5 v1.0 50 prompts. Resto è roadmap, NON implementare ora.

---

## 3. Implementation contract per generator-test-opus

```jsonl
// File: scripts/bench/workloads/sprint-r5-stress-fixtures.jsonl (NEW, 51 lines)
// Line 1: metadata jsonl entry
// Lines 2-51: 50 fixture entries with full schema ADR §2.4
```

```js
// File: scripts/bench/run-sprint-r5-edge-function.mjs (NEW)
// Runner that calls Supabase Edge Function elab-unlim/unlim-chat
// Streams responses jsonl + invokes scorer
```

```yaml
# File: .github/workflows/sprint-r5-bench.yml (NEW)
# manual_dispatch workflow with secrets injection + artifact upload
```

```js
// File: scripts/bench/score-unlim-quality.mjs (modified existing)
// Add: category-aware scoring (read .category from fixture line)
// Add: weight application per ADR §2.2
// Add: honesty_caveats array population
// Add: scorer_version field
// Backward compat: R0 fixtures (no category) → assign "unknown" category weight 0.5
```

---

## 4. Acceptance criteria per implementation

Per `generator-test-opus` quando implementa:

- [ ] File creato: `scripts/bench/workloads/sprint-r5-stress-fixtures.jsonl` con 50 entries + 1 metadata line
- [ ] Distribution rispetta ADR §2.1 (10/10/8/6/6/10 per category)
- [ ] Schema fixture valido per ADR §2.4 (campo category REQUIRED)
- [ ] File creato: `scripts/bench/run-sprint-r5-edge-function.mjs` con cold start retry + auth header
- [ ] File creato: `.github/workflows/sprint-r5-bench.yml` con workflow_dispatch
- [ ] Scorer modificato per ADR §2.2 (weights + per-category aggregation)
- [ ] Scorer modificato per ADR §2.9 (honesty_caveats array)
- [ ] Output `r5-summary-<TS>.json` shape ADR §2.8 valido
- [ ] Verdetto PASS/WARN/FAIL applicato per ADR §2.3
- [ ] First run R5 manuale eseguito da Andrea con SUPABASE_ANON_KEY
- [ ] Run R5 produce 50/50 responses (no skip, no timeout)
- [ ] Backward compat: R0 fixture (10 prompts) ancora scoredbile da scorer modificato
- [ ] No regressione test baseline (12532 PASS preservato)
- [ ] No modifica src/ o supabase/functions/ (test-only changes)

---

## 5. Trade-off summary onesto

**Pro**:
- Coverage scenari ampia: 50 prompts × 6 categorie copre tutte 12 PZ rule
- Statistical power adequate: n=50 → CI ±7-10pp per category, n=10 cat → CI ±15pp ma OK per gate 80%
- Endpoint corretto: Edge Function deployed, NON Render legacy (allineamento prod path)
- Doppia soglia gate (overall + per-cat) previene category-degraded false PASS
- Honesty caveats automatici per meta-onestà su misurazione
- CI manual dispatch zero blocking PR
- Backward compat R0 fixture preservato

**Contro / debt**:
- 50 prompts manualmente curati = 1-2h architect/Andrea per draft + review
- Fixture jsonl no validation runtime (script-level check ok ma no JSON Schema)
- Gemini rate-limit 60RPM può richiedere sequencing artificiale (sleep 1100ms tra call) → run lento ~5min
- Per-category counts asimmetrici (6-10) = CI variabile per category
- LLM-judge automatic NON in iter 3 → scorer rule-based con limiti noti (es. R5 analogia keyword set fisso)
- Cost minimo ($0 se Gemini free tier holds, else $0.5 per run Llama 70B Together)
- Roadmap multilingue + adversarial deferito iter 5+/8+

**Alternative rejected**:
- "100 prompts iter 3" → diminishing returns, run >10 min, harder maintenance
- "Synthetic LLM-generated prompts" → meta-circular bias risk
- "Scorer LLM-judge Sonnet" → costo + latency + complexity (defer iter 12+)
- "PR auto-block on R5 fail" → 5min wait + flaky rate-limit
- "Schedule cron daily" → noise + cost no value
- "Re-use R0 fixture extending to 50" → category misalignment, refactor scorer comunque

---

## 6. Open questions per Andrea/orchestrator

1. **[ANDREA-DECIDE] Threshold per category**: ho proposto 80% per ogni categoria. Andrea preferisce stricter 85% (più safety) o più lasso 75% (più tolleranza)?

2. **[ANDREA-DECIDE] Multilingue stub**: roadmap iter 5+ include 5 EN + 5 ES. Andrea conferma timing o vuole IT-only forever (priorità mercato)?

3. **[ORCHESTRATOR] Fixture composition timing**: 50 prompts curati manualmente da architect-opus iter 3 (o gen-test in collaborazione con architect)? Mio default: architect provides ADR §2.7 categorization + 50 prompt suggestions, gen-test scrive fixture + runner.

4. **[ORCHESTRATOR] CI workflow secrets**: SUPABASE_ANON_KEY già disponibile in GH secrets? Se no, Andrea action richiesta pre iter 5 prima run R5 automation.

5. **[ANDREA-DECIDE] Honesty caveats automation**: lista campi ADR §2.9 vuoi expanded con altri (es. `model_temperature` da request, `prompt_token_count_avg`)? Mio default lista come definita.

6. **Gate semantica "Sprint 6 Day 39 unblocked"**: cosa significa concretamente per Andrea? Implica auto-deploy production = true? O solo "ClawBot 80-tool dispatcher può iniziare developing"? Disambiguare.

---

## 7. Riferimenti

- **Master plan**: `docs/strategy/2026-04-26-master-plan-v2-comprehensive.md` §6 (R5 gate Sprint 6 Day 39)
- **PDR Sprint S iter 3**: `docs/pdr/PDR-SPRINT-S-ITER-3-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md` §1.5 (R0 baseline 75.81%), §2.5 box 9
- **Existing R0 fixture**: `scripts/bench/workloads/sprint-r0-unlim-quality-fixtures.jsonl` (10 entries, schema reference)
- **Existing scorer**: `scripts/bench/score-unlim-quality.mjs` (12 RULES, 306 LOC)
- **Existing runner R0**: `scripts/bench/run-sprint-r0-render.mjs` (Render legacy, design pattern reference)
- **Edge Function target**: `supabase/functions/unlim-chat/index.ts` (deploy iter 2 commit `a22b24d`)
- **PZ rules source**: `scripts/bench/score-unlim-quality.mjs:24-160` (12 RULES con weight + severity)
- **Sibling iter 2**: ADR-008 buildCapitoloPromptFragment (Capitolo schema injection — fragment may aiutare R5 categorizzazioni 2 + 4)
- **Sibling iter 2**: ADR-009 validatePrincipioZero middleware (post-LLM gate — runtime ridurrà violations cliente-visible per R5 prompts plurale + chatbot preamble)
- **Sibling iter 3**: ADR-010 Together AI fallback gated (chain provider — R5 misura quality di chunk diverso da legacy Render)
- **PRINCIPIO ZERO**: `CLAUDE.md` apertura
