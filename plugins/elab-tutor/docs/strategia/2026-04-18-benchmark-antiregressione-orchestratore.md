# Benchmark oggettivo + Anti-regressione 7-layer + Orchestratore adattivo
## 18 aprile 2026 — specifica tecnica dettagliata

> Documento di supporto ai PDR #1 e #2. Dettaglia implementazione del benchmark
> multidimensionale, del shield anti-regressione a 7 layer, e dell'architettura
> orchestratore adattivo "Agent Mesh v1".

---

## 1. Benchmark oggettivo — 10 metriche pesate

### 1.1 Principio

L'unico score valido per ELAB è quello calcolato automaticamente da `scripts/benchmark.cjs`. Self-reported scores sono **vietati** (tendenza a inflazione dimostrata nelle sessioni passate).

### 1.2 Metriche

| # | Metrica | Weight | Target | Come misurare | Score formula |
|---|---|---|---|---|---|
| 1 | `test_count` | 0.15 | 13000 | `vitest run` count passed | `min(10, value/target * 10)` |
| 2 | `build_size_kib` | 0.05 | 4000 (lower) | parse `npm run build` precache | inverse formula |
| 3 | `e2e_playwright_pass_rate` | 0.15 | 0.95 | `playwright test --reporter=json` pass/total | `min(10, value/target * 10)` |
| 4 | `unlim_live_response_p95_ms` | 0.10 | 3000 (lower) | HTTP POST live × 20 measurements | inverse formula |
| 5 | `volume_ref_coverage` | 0.15 | 92 | grep count in `volume-references.js` | `min(10, value/target * 10)` |
| 6 | `accessibility_wcag_aa` | 0.10 | 0.98 | `@axe-core/cli` violations ratio | `min(10, value/target * 10)` |
| 7 | `dashboard_live_data` | 0.05 | 1 | Supabase ping + rows > 0 | boolean → 10 or 0 |
| 8 | `sketch_parity_with_book` | 0.10 | 25 | legge audit doc `docs/audit/2026-04-18-vol3-sketch-parity-audit.md` | `min(10, value/target * 10)` |
| 9 | `git_discipline` | 0.05 | 0.95 | % commit con "Test: N/M PASS" msg (ultimi 50) | `min(10, value/target * 10)` |
| 10 | `documentation_coverage` | 0.10 | 1.0 | presenza 4 file obbligatori | `min(10, value/target * 10)` |

### 1.3 Formula finale

```
overall_score = sum(metric_score × weight) / sum(weights)
```

Output in `automa/benchmark.json`:

```json
{
  "timestamp": "2026-04-18T10:30:00Z",
  "git_head": "91c6793",
  "overall_score": "7.3",
  "metrics": {
    "test_count": {"value": 12056, "score": "9.27", "weight": 0.15},
    "build_size_kib": {"value": 4794, "score": "4.72", "weight": 0.05},
    "e2e_playwright_pass_rate": {"value": 0.0, "score": "0.00", "weight": 0.15, "note": "no spec yet"},
    "unlim_live_response_p95_ms": {"value": 2800, "score": "6.86", "weight": 0.10},
    "volume_ref_coverage": {"value": 92, "score": "10.00", "weight": 0.15},
    "accessibility_wcag_aa": {"value": 0.92, "score": "9.39", "weight": 0.10},
    "dashboard_live_data": {"value": 0, "score": "0.00", "weight": 0.05, "note": "not implemented"},
    "sketch_parity_with_book": {"value": 17, "score": "6.80", "weight": 0.10},
    "git_discipline": {"value": 0.84, "score": "8.84", "weight": 0.05},
    "documentation_coverage": {"value": 0.75, "score": "7.50", "weight": 0.10}
  },
  "regressions": [],
  "improvements_vs_previous": {"test_count": "+17"}
}
```

### 1.4 Storia e trend

Salvare ogni run in `automa/evals/benchmark-history/<sha>-<timestamp>.json`. Script secondario `scripts/benchmark-trend.cjs` genera grafico trend:

- asse X = git_head
- asse Y = overall_score
- linea rossa orizzontale a target minimo 8.0

### 1.5 Rule: benchmark non può scendere

In CI GitHub Actions job `benchmark-gate`:

- Su PR: esegue `benchmark.cjs`
- Confronta con `automa/benchmark.json` di `main`
- Se `overall_score` scende >0.2 → **BLOCCA merge** con commento su PR
- Se metrica specifica scende >10% → warning (non blocca)

### 1.6 Security nota per `scripts/benchmark.cjs`

Lo script esegue **solo comandi hard-coded**, mai input utente:

- `npx vitest run --reporter=dot` (fisso)
- `npm run build` (fisso)
- `npx playwright test --reporter=json` (fisso)
- `git log --format=%s -50` (fisso)
- `git rev-parse --short HEAD` (fisso)

Nessun pattern `exec(userInput)`. Implementazione consigliata: utility sicura con array args (no shell string interpolation). Verifica se esiste `src/utils/execFileNoThrow.ts` nel repo e riusa, altrimenti implementa wrapper analogo.

---

## 2. Anti-regressione 7-layer shield

Ogni layer copre un diverso modo in cui una regressione può infilarsi.

### Layer 1 — Pre-edit (documentato in CLAUDE.md)

- Pattern vietati: `git push --force`, `git reset --hard` su main, `rm -rf` su src/, `--no-verify`
- Applicazione: responsabilità Agent/Claude. Non blocco automatico.

### Layer 2 — Pre-commit hook

File `.git/hooks/pre-commit` (già esistente, potenziare):

```
#!/bin/bash
# Baseline gate hard floor
OUTPUT=$(npx vitest run --reporter=dot 2>&1 | tail -5)
COUNT=$(echo "$OUTPUT" | grep -oE 'Tests[[:space:]]+[0-9]+ passed' | grep -oE '[0-9]+')

# Retry una volta se vuoto (flakiness)
if [ -z "$COUNT" ]; then
  OUTPUT=$(npx vitest run --reporter=dot 2>&1 | tail -5)
  COUNT=$(echo "$OUTPUT" | grep -oE 'Tests[[:space:]]+[0-9]+ passed' | grep -oE '[0-9]+')
fi

BASELINE=11983
if [ -z "$COUNT" ] || [ "$COUNT" -lt "$BASELINE" ]; then
  echo "❌ BLOCKED: test count $COUNT < baseline $BASELINE"
  exit 1
fi
echo "✅ Pre-commit: $COUNT tests PASS"
exit 0
```

Hard floor 11983 (baseline storica).

### Layer 3 — Pre-push hook

File `.git/hooks/pre-push`:

```
#!/bin/bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" = "main" ]; then
  echo "[pre-push] main branch full build check"
  npm run build 2>&1 | tail -5 | grep -q "built in" || {
    echo "❌ BLOCKED: build fail on main"
    exit 1
  }
fi
exit 0
```

### Layer 4 — Guard critical files

File `.githooks/guard-critical.sh`, chiamato da pre-commit:

```
#!/bin/bash
CRITICAL=(
  "src/components/simulator/engine/CircuitSolver.js"
  "src/components/simulator/engine/AVRBridge.js"
  "src/components/simulator/engine/PlacementEngine.js"
  "src/components/simulator/canvas/SimulatorCanvas.jsx"
  "src/components/simulator/NewElabSimulator.jsx"
)

CHANGED=$(git diff --cached --name-only)

for f in "${CRITICAL[@]}"; do
  if echo "$CHANGED" | grep -q "^$f$"; then
    if ! git log -1 --pretty=%B 2>/dev/null | grep -qi "authorized-engine-change"; then
      echo "❌ BLOCKED: critical file $f without authorized-engine-change in commit body"
      exit 1
    fi
  fi
done
exit 0
```

### Layer 5 — Snapshot auto (launchd macOS)

File `~/Library/LaunchAgents/com.elab.snapshot.plist`:

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.elab.snapshot</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>-c</string>
    <string>cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" &amp;&amp; git tag auto-snapshot-$(date +%Y%m%d-%H%M) 2&gt;/dev/null</string>
  </array>
  <key>StartInterval</key><integer>7200</integer>
  <key>StandardOutPath</key><string>/tmp/elab-snapshot.log</string>
  <key>StandardErrorPath</key><string>/tmp/elab-snapshot.err</string>
</dict>
</plist>
```

Attivazione:

```
launchctl load ~/Library/LaunchAgents/com.elab.snapshot.plist
launchctl start com.elab.snapshot   # primo run immediato
```

Rollback a snapshot:

```
git reset --hard auto-snapshot-20260418-1030   # o qualsiasi tag
```

### Layer 6 — CI GitHub Actions

File `.github/workflows/elab-regression-shield.yml`:

```
name: ELAB Regression Shield
on:
  pull_request:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - name: Vitest full suite
        run: npx vitest run --reporter=verbose
      - name: Build
        run: npm run build
      - name: Playwright install
        run: npx playwright install chromium --with-deps
      - name: Playwright E2E
        run: npx playwright test --project=chromium
      - name: Benchmark compare
        run: |
          node scripts/benchmark.cjs
          node scripts/benchmark-compare.cjs main HEAD
```

### Layer 7 — Session-level auto-revert (in CLAUDE.md)

In `CLAUDE.md` sezione "Protocollo sessione":

> Se durante sessione interactive o Agent SDK, test count scende sotto baseline:
> 1. IMMEDIATO: `git reset --hard HEAD` dell'ultimo commit
> 2. Se ripete (2° volta stesso file): `git tag broken-<timestamp>` + `git revert HEAD`
> 3. Nessun lavoro "riparazione" sulla stessa linea: nuovo branch
> 4. Write entry in `CHANGELOG.md` con "failed approach"

---

## 3. Architettura Orchestratore "Agent Mesh v1"

### 3.1 Overview

```
Andrea (async supervisor)
    ↑
    │ review PRs, check benchmark trend
    │
Benchmark Gate (automated)
    ↑
    │ score enforcement
    │
Planner (opus) ──→ automa/tasks/pending/*.md
                        ↓
                   (agent pick)
                        ↓
       ┌────────────────┼────────────────┐
       ↓                ↓                ↓
Generator-app    Generator-infra   Generator-test
  (sonnet)         (sonnet)         (sonnet)
       │                │                │
       └────────────────┴────────────────┘
                        ↓
                   atomic commit
                        ↓
                   Evaluator (haiku)
                        ↓
               APPROVED / REVERT / FOLLOWUP
                        ↓
                      Git push
                        ↓
                   CI GH Actions
                        ↓
                   Andrea review PR
```

### 3.2 File di comunicazione (fonti di verità)

#### `automa/tasks/pending/*.md`

Format task spec:

```
---
id: TASK-20260418-1030-dashboard-teacher-shell
priority: P1
estimated_minutes: 90
deliverable: "DashboardShell.jsx renders mock data; 15 behavioral tests pass; WCAG AA"
scope_files:
  - src/components/dashboard/DashboardShell.jsx
  - src/components/dashboard/DashboardCharts.jsx
  - tests/integration/dashboard.test.jsx
non_goals:
  - "don't touch api.js"
  - "don't modify simulator engine"
success_criteria:
  - "npx vitest run → test count >= current + 15"
  - "npm run build → PASS"
  - "axe-core on /dashboard → 0 violations serious"
karpathy_check: "Surgical Changes (dashboard isolated)"
---

# Task description

[Dettagli tecnici implementazione]
```

#### `automa/evals/verdicts/<sha>.json`

```json
{
  "commit_sha": "abc1234",
  "verdict": "APPROVED",
  "verdict_confidence": "high",
  "criteria_met": [
    {"criterion": "test count +15", "verified": true, "evidence": "12056 → 12071"},
    {"criterion": "build PASS", "verified": true, "evidence": "precache 4810 KiB"}
  ],
  "build_delta": {"size_kib_before": 4794, "after": 4810, "pct": "+0.33%"},
  "test_delta": {"before": 12056, "after": 12071, "new_count": 15, "regressions": 0},
  "three_things_that_could_go_wrong": [
    "Mock Supabase doesn't catch real auth flow",
    "CSV export may break on 1000+ rows (not tested)",
    "No keyboard shortcut for CSV download"
  ],
  "rubber_stamp_streak": 0,
  "timestamp": "2026-04-18T11:45:00Z"
}
```

#### `automa/memory/sessions/latest.json`

```json
{
  "session_id": "2026-04-18-bootstrap",
  "started_at": "2026-04-18T10:00:00Z",
  "ended_at": "2026-04-18T18:00:00Z",
  "commits": ["91c6793", "abc1234", "def5678"],
  "files_touched": ["src/components/dashboard/*", "tests/integration/*"],
  "key_decisions": [
    "Dashboard uses recharts not chart.js (already in deps)",
    "CSV export via browser Blob API",
    "Fallback placeholder data when Supabase fails"
  ],
  "failed_approaches": [
    "Tried chart.js import — too big bundle +200KB, rejected"
  ],
  "next_session_pointers": [
    "Dashboard shell done, needs real Supabase schema review",
    "Stress test 50 scenarios pending"
  ]
}
```

### 3.3 Interface per orchestratori esterni

Il mesh è **standalone** (funziona senza orchestratore esterno) ma espone API file-based per integrarsi:

```
# Read pending tasks
cat automa/tasks/pending/*.md

# Submit new task
cp my-new-task.md automa/tasks/pending/

# Read verdicts
ls automa/evals/verdicts/*.json

# Read current benchmark
cat automa/benchmark.json

# Read session memory
cat automa/memory/sessions/latest.json
```

Un orchestratore esterno (es. tuo tool custom o agent SDK) può:

1. **Push**: creare file in `automa/tasks/pending/` via SSH/git push
2. **Monitor**: fetch/pull periodico di `automa/evals/` e `automa/benchmark.json`
3. **Escalate**: se benchmark regressione >0.2 → alert via webhook/Slack/Telegram

Niente API HTTP proprietaria. Niente vendor lock-in. Solo file + git.

### 3.4 Perché questa architettura funziona dove Ralph Loop non ha funzionato

| Pattern problematico (passato) | Pattern corretto (Agent Mesh) |
|---|---|
| Scheduled tasks MCP che silenziosamente non girano | Planner invocato on-demand via Task tool, committed to git |
| File di stato `.md` come unica verità | Git commit come fonte di verità atomica |
| Evaluator self-eval (rubber stamp) | Evaluator haiku (modello diverso, forced pessimism) |
| "Budget iterazioni" interno | Budget enforced da cron launchd + CI, non self-reported |
| "Honest score" auto-dichiarato | Score calcolato da metriche oggettive |
| Auditor che non gira mai davvero | Evaluator eseguito after-every-commit |

### 3.5 Come invocare questo mesh in sessione Claude

**Caso 1**: Claude Code interactive.

- Incolla prompt del PDR #1
- Claude legge `automa/tasks/pending/` se esiste, altrimenti Planner compone dalle issues/roadmap
- Generator prende 1 task alla volta
- Evaluator verifica ogni commit
- PR auto-create alla fine

**Caso 2**: Claude CLI headless da terminal.

```
claude -p "Leggi CLAUDE.md + docs/plans/2026-04-18-PDR-session-long-running.md. Esegui Fase 0-5. Commit + PR. Segnala blocchi in automa/state/."
```

**Caso 3**: loop long-running (risk alto, solo se branch isolato).

In tmux:

```
tmux new -s elab-mesh
claude --dangerously-skip-permissions -p "..."
Ctrl-b d   # detach
```

Monitora via:

```
tail -f ~/.claude/logs/session-*.log
git log --oneline main..HEAD
cat automa/benchmark.json
```

---

## 4. Stack di tooling consigliato per Andrea (verificato)

### 4.1 Must-have (gratis o già paghi)

- Claude Code CLI
- Claude Max subscription (Opus 4.6 + Sonnet 4.5)
- GitHub (free tier OK)
- Vercel (free tier OK per ELAB attuale)
- Supabase (free 500MB OK)
- Playwright (gratis)

### 4.2 Nice-to-have

- Pinecone free tier (session memory v2)
- Sentry free (error tracking)
- PostHog free (analytics anonime)
- GitHub Copilot ($10/mo per autocomplete)
- axe DevTools (extension)

### 4.3 Skip-able

- Anthropic Managed Agents (pricing non disclosed, skip per ora)
- Secondo account Claude Max ($200/mo — solo se saturo 3gg di fila)
- AutoClaw GLM5.1 (maturità incerta al 18/04/2026)
- Voicebox (roadmap Q3 se Kokoro inadeguato)
- claude-mem direct integration (AGPL-3 incompatibile con commerciale)

### 4.4 Confronto costi stack a scala (100 classi)

| Item | Costo/mese |
|---|---|
| Vercel Pro | €20 |
| Supabase Pro | €25 |
| Pinecone starter | €0 |
| VPS Hostinger (Kokoro + Edge TTS + Brain) | €15 |
| n8n Hostinger (compilatore) | €8 |
| Claude Max sub | €200 |
| Claude API pay-per-use | €30-50 |
| Sentry Team | €0 |
| Dominio + CDN | €2 |
| **TOTALE** | **~€300/mese** |

Ricavi target: €500/anno × 30 scuole = €15K/anno = €1250/mese → margine ~76%.

Se 2° account Claude Max aggiunto → €200 extra → margine ~60%. Non vale prima che 1° sia saturo.

---

## 5. Risposta a "sistema che lavori più veloce, creativo, proattivo"

Velocità = parallelismo × qualità work × anti-regression rigor.

### 5.1 Parallelismo

3 generator paralleli (scope disjoint: simulatore / UNLIM / dashboard) → 3× throughput.

Costo: 3× token ma task paralleli.

### 5.2 Qualità work

TDD + principi Karpathy + evaluator indipendente → rework da 30-40% a <10%.

Questa sessione ha dimostrato: TASK 4/5 revertati erano proprio rework da assunzioni non verificate → 2h perse. Con Karpathy "Think Before Coding" prevenuto.

### 5.3 Anti-regression rigor

Zero tempo perso in debug regressioni. Layer 2-3 beccano in 1 min; se arriva in prod, 2h + reputazione.

### 5.4 Creativo/Proattivo/Adattivo

- **Proattivo**: agent propone task non richiesti ma allineati al goal
- **Creativo**: agent trova soluzioni pattern-diverse quando ovvia fallisce
- **Adattivo**: agent modifica strategia in base a feedback reale

Richiede:

1. Memoria cross-session → session memory v2
2. Metrics fresh → benchmark.json che cambia
3. Context goal chiaro → CLAUDE.md + CHANGELOG.md
4. Libertà proporre task fuori spec → Planner può aggiungere a `automa/tasks/pending/`

Nel PDR #1 Fase 3 il Planner può esplicitamente aggiungere task non nel PDR se scopre gap reali. Questo è agentic vero.

---

## 6. Conclusione onesta

**Tu (Andrea) oggi hai**:
- 1 agent secondario silenzioso (progettibelli-go) da 7 giorni
- 1 PR di Tea aperta da 5 giorni non chiusa
- Un "Ralph Loop avversariale" fantasma
- Un prodotto LIVE funzionante (elabtutor.school 200, UNLIM LIVE, Kokoro LIVE)
- Baseline test solida (12056)
- Infrastruttura VPS stabile

**La priorità non è "aggiungere più loop"**. È **rendere affidabile quello che hai**:

1. PDR #1 → infrastruttura mancante (benchmark + 7-layer shield + Session Memory + agent mesh)
2. PDR #2 → risveglia progettibelli-go con 1 macro-obiettivo
3. Chiudi Tea PR #73 con credit
4. Revoca Gemini key leaked
5. Deploy Vercel

**Poi, e solo poi**, valuta:
- Secondo account Claude Max (se 1° saturo)
- Managed Agents Anthropic (se pricing ragionevole)
- Orchestratore esterno custom (se Mesh v1 non basta)

**Non confondere velocità con caos**. I tuoi 12 commit del 17/04 sono stati più efficaci delle 131 commit di progettibelli-go di marzo proprio perché focalizzati, verificati, atomici.

Quello che proponi (sistema adattivo, agentic, orchestrato) è fattibile, ma si costruisce **sopra** base solida. PDR #1 e #2 sono quella base.

---

*Documento self-contained. Accompagna PDR #1 e PDR #2.*
