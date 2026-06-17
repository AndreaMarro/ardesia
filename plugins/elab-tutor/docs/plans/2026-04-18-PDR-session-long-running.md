# PDR #1 — Sessione Claude CLI "Agent Mesh v1 Bootstrap"
## 18 aprile 2026 — Da eseguire in sessione lunga 8-12h

> **Come eseguire**: apri terminale, `cd` in `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`, lancia `claude --dangerously-skip-permissions` (o `claude --auto` se vuoi provare auto-mode; vedi Fase 0), e incolla il prompt finale di questo documento.
>
> **Sub-skill richiesta**: `superpowers:executing-plans`
>
> **Obiettivo misurabile**: ELAB passa da stato attuale (baseline 12056 test PASS) a **score benchmark oggettivo ≥ 8.5/10** con deliverable specifici sotto, **senza regressioni**.

---

## Metadati sessione

| Campo | Valore |
|---|---|
| Data target | 18-19 aprile 2026 |
| Branch lavoro | `feature/agent-mesh-v1-bootstrap` |
| Base branch | `session/2026-04-17-pdr-v3-prep` |
| Baseline test | 12056/12056 PASS |
| Baseline build | precache 4794 KiB |
| Sito | https://www.elabtutor.school → 200 |
| UNLIM live | verificato 17/04 via Playwright |
| Kokoro VPS | LIVE porta 8881 |

## Stato pre-sessione (aggiornato 18/04 h01:30)

Infrastruttura **già bootstrappata** su branch `session/2026-04-17-pdr-v3-prep`, commit da verificare con `git log --oneline -10`:

| File | Stato | Nota |
|------|-------|------|
| `.claude/agents/planner.md` | ✅ pronto | opus, produce 1 task atomico |
| `.claude/agents/generator-app.md` | ✅ pronto | sonnet, codice UI/services |
| `.claude/agents/generator-test.md` | ✅ pronto | sonnet, vitest + playwright |
| `.claude/agents/evaluator.md` | ✅ pronto | haiku, verdetto oggettivo |
| `scripts/guard-critical-files.sh` | ✅ eseguibile + smoke-tested | blocca engine-files senza token |
| `scripts/benchmark.cjs` | ✅ funzionante, 10 metriche | fast mode 2.77/10, full mode TBD |
| `automa/baseline-tests.txt` | ✅ 12056 | baseline hard floor |
| `automa/state/README.md` | ✅ | protocollo file state |
| `CLAUDE.md` | ✅ aggiornato | Karpathy principles + anti-inflation + triade + benchmark |

**Tea PR #73**: chiusa 18/04 h00:37 con credit message (commit 60884c6 già integra il lavoro).

**Cosa NON fare in sessione**: rifare questi pezzi. Sono già pronti e testati.

**Cosa fare in sessione**: usare gli agent esistenti per produrre lavoro reale (dashboard, playwright spec, e2e stress test, fix bug, miglioramenti benchmark).

## Regola zero ASSOLUTA

**`npx vitest run` prima e dopo OGNI modifica al codice sorgente**. Se count scende sotto `12056` → **REVERT IMMEDIATO**. Non negoziabile.

## Regole ferree

1. `npm run build` dopo ogni modifica a `.js/.jsx/.json` sorgente
2. MAI `git add -A` → solo file specifici
3. MAI `git commit --no-verify`
4. MAI push diretto su `main` → solo PR via `gh pr create`
5. MAI modifica a `src/components/simulator/engine/**` (CircuitSolver, AVRBridge, PlacementEngine) né `canvas/SimulatorCanvas.jsx`, `NewElabSimulator.jsx` senza `authorized-engine-change` nel commit body E 3 test prima/3 test dopo
6. MAI dipendenze npm nuove senza esplicita autorizzazione Andrea
7. MAI inflazionare numeri — ogni claim verificato con comando fresh
8. Commit format: `tipo(area): descrizione — Test: NNNN/NNNN PASS`
9. Snapshot tag ogni 2h (vedi Fase 6)
10. Chain-of-verification: ogni claim ripetuto con fonte codice o comando

## Guard rail tecnici già attivi

- `tests/setup.js` mocka localStorage → test che usa storage deve usare mock pattern
- `vitest.config.js` pool=`forks`, testTimeout 15000 (commit 6b0cacd — fix flakiness sotto carico)
- `.git/hooks/pre-commit` esegue vitest dot reporter e blocca se count < 11983 (hard floor storico)
- Auto-copyright hook aggiorna date: non revertare

---

## Fase 0 — Preparazione (30 min)

### 0.1 Verifica ambiente

Comandi da eseguire (tutti output verificati a terminale):

1. `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"`
2. `git status --short` → attesa: solo file auto-edit non importanti
3. `npx vitest run --reporter=dot 2>&1 | tail -3` → attesa: `Tests  12056 passed (12056)`
4. `npm run build 2>&1 | tail -3` → attesa: precache ~4794 KiB
5. `curl -sw "\nHTTP:%{http_code}" https://www.elabtutor.school -o /dev/null` → attesa: HTTP:200

### 0.2 Crea branch lavoro

- `git checkout -b feature/agent-mesh-v1-bootstrap`
- `git tag baseline-bootstrap-$(date +%Y%m%d-%H%M)`

### 0.3 Decidi modalità

- **Opzione A — conservativo** (raccomandato primo run): `claude` default. Approvazioni manuali. Lento ma sicuro.
- **Opzione B — auto-mode**: prima `claude auto-mode defaults` per ispezionare le 20 block rules. Se OK → `claude --auto`. Combina con baseline-gate come guardia secondaria (17% false-negative rate documentato).
- **Opzione C — skip-permissions**: SOLO in script/cron headless. MAI interattivo.

Per questa sessione: **Opzione A**.

### 0.4 Incolla prompt finale (a fondo documento)

---

## Fase 1 — Integrazione principi Karpathy in CLAUDE.md (45 min)

### 1.1 Aggiungi sezione a CLAUDE.md

Leggi `CLAUDE.md` attuale. Aggiungi prima di `## Regole immutabili` questo blocco:

```markdown
## Principi anti-pitfall LLM (Karpathy, adattati)

Obbligatori per ogni modifica di codice in questa sessione e future:

### 1. Pensa prima di scrivere
- Non assumere silenziosamente. Se ambiguità: ask o presenta 2 interpretazioni.
- Surface tradeoff (es. "questa soluzione aggiunge 50ms latenza; OK?")
- Se confuso: fermati, non inventare. Scrivi "BLOCKED: <motivo>" e cerca chiarimenti.

### 2. Semplicità prima di tutto
- Scrivi il minimo codice che risolva il problema. Niente di speculativo.
- No abstraction per codice single-use.
- No error handling per scenari impossibili.
- Se 200 linee possono essere 50 → riscrivi 50.
- Test: un senior engineer direbbe che è over-complicated?

### 3. Modifica chirurgica
- Tocca SOLO quello che serve per la task.
- NON "migliorare" codice adiacente (comments, formatting, refactor) non richiesto.
- Match style esistente anche se tu lo faresti diverso.
- Se noti dead code non correlato → menzionalo, non cancellare.
- Quando la tua change rende un import/variable unused: PULISCI solo quelli tuoi.
- Test: ogni riga cambiata deve tracciarsi al task originale.

### 4. Esecuzione goal-driven
- Prima di scrivere codice: definisci success criteria verificabili.
  - Es. "Questo commit è fatto quando 3 test nuovi passano + build PASS + Playwright /tutor mostra badge".
- Loop fino a verifica reale (non "sembra fatto, procedo").
- Max 1 task per commit. Se >1 → spezza.

**Controllo pre-commit**: prima di ogni `git commit`, rileggi diff e chiediti:
- Ho toccato SOLO ciò che serviva? (principio 3)
- Il test verifica comportamento REALE o solo che la funzione esista? (principio 4)
- Ho aggiunto over-engineering? (principio 2)
- C'è assunzione implicita non verificata? (principio 1)

Se anche una sola risposta è dubbia → fermati, correggi, re-test.
```

Commit: `docs: integrate Karpathy 4 principles in CLAUDE.md — Test: 12056/12056 PASS`

### 1.2 Crea CHANGELOG.md con pattern Anthropic long-running-Claude

Nuovo file `CHANGELOG.md` alla root con ogni entry:

- **Approach tentato**
- **Perché sembrava buono**
- **Perché non ha funzionato**
- **Cosa imparare**

Seed 3 entry iniziali:

1. TASK 4/5 PDR v3 basati su testo libro vs sketch ufficiali (17/04)
2. Ralph Loop con 2 scheduled-tasks avversari (17/04)
3. Vitest pool default sotto carico Mac (17/04)

Testi completi nel doc `docs/strategia/2026-04-18-stato-reale-e-architettura-agentica.md` sezione "1.5 Cosa NON ha funzionato".

Commit: `docs: add CHANGELOG.md (Anthropic long-running memory pattern) — Test: 12056/12056 PASS`

---

## Fase 2 — Chiudi Tea PR #73 (15 min)

Comando `gh pr close 73 --repo AndreaMarro/elabtutor --comment "Grazie Tea — contenuti integrati in 60884c6 sul repo principale. PR chiusa per evitare conflitti merge (main avanzato 50+ commit)."`

Verifica esistenza file integrati su `elab-tutor`: `ls src/utils/importWithRetry.js` ecc. Se mancano, cherry-pick mirato.

---

## Fase 3 — Scaffold Agent Mesh v1 (2h)

### 3.1 Crea struttura directory

```
mkdir -p .claude/agents
mkdir -p automa/tasks/{pending,in-progress,completed,blocked}
mkdir -p automa/evals/{verdicts,benchmark-history,failures,stress-tests}
mkdir -p automa/memory/{sessions,embeddings}
```

### 3.2 Scrivi 3 agent files

**`.claude/agents/planner.md`** (frontmatter + ruolo):
- Tools allowed: Read, Grep, Glob, Write (solo `automa/tasks/pending/*`), WebFetch, Bash (solo `gh api`, `git log`)
- Model: opus
- Ruolo: legge CLAUDE.md + CHANGELOG.md + git log + `gh pr list`, scrive specs atomiche 30-90min each in `automa/tasks/pending/`
- Non scrive codice sorgente. Non invoca altri agent.
- Formato task spec: ID, Priority P0-P3, Deliverable verificabile, Scope files espliciti, Non-goals, Success criteria misurabili, Estimated minutes, Karpathy-check

**`.claude/agents/generator-app.md`**:
- Tools: Read, Grep, Glob, Edit, Write (`src/components/*`, `src/services/*`, `src/data/*`, `src/hooks/*`, `src/utils/*`, `tests/unit/*`), Bash (`npm run build`, `npx vitest run`, `git status`, `git diff`, `git add`, `git commit`)
- Model: sonnet
- Ruolo: esegue UNA task da `in-progress/`. TDD obbligatorio (test RED → implement → GREEN). Commit atomico + move task file.
- MAI tocca `src/components/simulator/engine/**`.
- MAI skip `vitest run` o `npm run build`.

**`.claude/agents/evaluator.md`**:
- Tools: Read, Grep, Bash (`npx vitest run`, `npm run build`, `npx playwright test`, `git show`, `git log`, `gh run`), Write (`automa/evals/verdicts/*`)
- Model: haiku
- Ruolo: verifica indipendente. No self-eval bias.
- Per ogni commit completato:
  - `git show <sha> --stat` — verifica scope
  - `npx vitest run --reporter=dot` — verifica count
  - `npm run build` — verifica PASS + precache delta <10%
  - Playwright spec o screenshot per UI changes
  - Read task spec success criteria — verifica OGNI singolo
  - Produce verdict JSON: verdict (APPROVED/REVERT/NEEDS_FOLLOWUP), criteria_met, build_delta, test_delta, `three_things_that_could_go_wrong` (FORZATO — pessimismo anti-compiacimento)
  - Se 3 APPROVED consecutivi → forza NEEDS_FOLLOWUP con 1 improvement request (anti-rubber-stamp)

### 3.3 Test manuale triade

Usa il tool `Task` (disponibile in Claude Code) con `subagent_type: planner` per smoke test.

Commit: `feat(mesh): scaffold 3 agent files (planner/generator/evaluator) — Test: 12056/12056 PASS`

---

## Fase 4 — Session Memory v2 (2h)

### 4.1 Crea `src/services/sessionMemory.js`

Esposta API (tutti funzioni pure o async-awaitable):

- `saveSessionSummary({sessionId, summary, files_touched, commits, date})`
- `retrieveRelevantSessions(query, limit=3)` → usa plugin Pinecone se disponibile, fallback Supabase `elab_session_memory` table, fallback RAG locale
- `compressCurrentSession(conversationHistory)` → estrazione strutturata (first/last/key actions). NO chiamata LLM ora (troppo lento). Compression via extractive.
- `clearOldSessions(olderThanDays=30)` → cleanup

### 4.2 Test comportamentali (min 8)

In `tests/unit/sessionMemory.test.js`:
- saveSessionSummary valid input → returns success
- saveSessionSummary missing fields → throws
- retrieveRelevantSessions returns array len ≤ limit
- retrieveRelevantSessions empty when no data
- compressCurrentSession with 100-msg history → returns string ≤ 1000 char
- compressCurrentSession preserves first+last messages
- clearOldSessions removes only older than threshold
- Roundtrip: save → retrieve → summary matches

### 4.3 Integrare in CLAUDE.md startup

Sezione nuova "## All'avvio di ogni sessione Claude Code":
1. Leggi CHANGELOG.md (ultime 5 entry)
2. `git log --oneline -10`
3. `npx vitest run --reporter=dot | tail -3` (baseline corrente)
4. Leggi `automa/memory/sessions/latest.json` se esiste
5. Se serve contesto specifico: invoca `sessionMemory.retrieveRelevantSessions(query)`

Commit: `feat(memory): session memory v2 with Pinecone retrieval — Test: NNNN/NNNN PASS`

---

## Fase 5 — Benchmark oggettivo (1.5h)

### 5.1 Crea `scripts/benchmark.cjs` (non user input, comandi fissi)

Script Node locale (security note: usa funzione wrapper che esegue solo comandi hardcoded, mai user input. Vedi `src/utils/execFileNoThrow.ts` come referenza di pattern sicuro se esiste, altrimenti `child_process.spawnSync` con array args).

10 metriche pesate:

| Metrica | Weight | Target | Come misurare |
|---|---|---|---|
| test_count | 0.15 | 13000 | `vitest run` → parse `Tests N passed` |
| build_size_kib | 0.05 | 4000 lower | `npm run build` → parse precache |
| e2e_playwright_pass_rate | 0.15 | 0.95 | `playwright test --reporter=json` |
| unlim_live_response_time_ms | 0.10 | 3000 lower | HTTP POST a endpoint prod |
| volume_ref_coverage | 0.15 | 92 | grep count in volume-references.js |
| accessibility_wcag_aa | 0.10 | 0.98 | axe-core CLI |
| dashboard_live_data | 0.05 | 1 | Supabase query conta |
| sketch_parity_with_book | 0.10 | 25 | da audit doc `docs/audit/2026-04-18-vol3-sketch-parity-audit.md` |
| git_discipline | 0.05 | 0.95 | % commit con "Test: N/M PASS" nel msg |
| documentation_coverage | 0.10 | 1.0 | presenza dei 4 file obbligatori |

Output:
- `automa/benchmark.json` (latest)
- `automa/evals/benchmark-history/<sha>-<timestamp>.json` (storico)

**Regola**: questo è l'UNICO score valido. Ogni PDR successivo confronta con questo.

### 5.2 Esegui primo baseline

- `node scripts/benchmark.cjs`
- Salva output. Questo è il punto zero per confronti futuri.

Commit: `feat(benchmark): objective 10-metric benchmark system — Test: NNNN/NNNN PASS`

---

## Fase 6 — Anti-regressione 7 layer (1h)

### Layer 1: Pre-edit (documentato in CLAUDE.md, non automatico)

Lista pattern vietati:
- `git push --force` (mai)
- `git reset --hard` (solo su branch feature isolato, mai su main)
- `rm -rf` su `src/`
- `git commit --no-verify`

### Layer 2: Pre-commit hook (potenziare esistente)

File `.git/hooks/pre-commit` (shell script, hard-floor test count):
- Estrae count via `npx vitest run --reporter=dot`
- Se < 11983 → blocca con exit 1
- Retry una volta se output empty (flakiness)

### Layer 3: Pre-push hook

File `.git/hooks/pre-push`:
- Se branch = `main` → esegue `npm run build`, blocca se fail
- Altrimenti: solo baseline check (già in pre-commit)

### Layer 4: Guard critical files

Script `.githooks/guard-critical.sh` eseguito da pre-commit:
- Lista file critici (CircuitSolver, AVRBridge, PlacementEngine, SimulatorCanvas, NewElabSimulator)
- Per ogni file in `git diff --cached --name-only`:
  - Se critico + commit msg NON contiene "authorized-engine-change" → blocca

### Layer 5: Snapshot auto (launchd macOS)

File `~/Library/LaunchAgents/com.elab.snapshot.plist`:
- Interval: 7200s (2h)
- Comando: `cd <repo> && git tag auto-snapshot-$(date +%Y%m%d-%H%M)`
- Log: `/tmp/elab-snapshot.log`
- Attivazione: `launchctl load ~/Library/LaunchAgents/com.elab.snapshot.plist`

Questo è cron vero (non MCP scheduled-tasks). Gira indipendente.

### Layer 6: CI GitHub Actions

File `.github/workflows/e2e-strict.yml`:
- Trigger: `pull_request` su main
- Steps:
  - `npm ci`
  - `npx vitest run --reporter=verbose`
  - `npm run build`
  - `npx playwright install chromium --with-deps`
  - `npx playwright test --project=chromium`

### Layer 7: Revert automatico in-session

In CLAUDE.md sezione "Se test scendono durante sessione":
- IMMEDIATO `git reset --hard HEAD` dell'ultimo commit
- Se ripete → `git tag` come `broken-<timestamp>` + `git revert`
- Nessun lavoro "riparazione" sulla stessa linea: crea nuovo branch

Commit: `feat(infra): 7-layer anti-regression shield (pre-edit, pre-commit, pre-push, guard, snapshot, CI, auto-revert) — Test: NNNN/NNNN PASS`

---

## Fase 7 — Playwright E2E reali (1.5h)

### 7.1 Struttura `tests/e2e/`

Creare almeno:

- `00-smoke.spec.ts` — homepage loads, no real console errors
- `01-simulator-mount.spec.ts` — entra `#lavagna`, verifica breadboard + nano + LED
- `02-unlim-chat-live.spec.ts` — apri UNLIM, invia "Ciao", verifica risposta <10s (replica Playwright test 17/04 notte)
- `03-drawing-persistence.spec.ts` — disegna, esci, rientra, verifica ink persistente
- `04-toolbar-drag.spec.ts` — drag FloatingToolbar, verifica no jump con/senza panel aperto

### 7.2 Config `playwright.config.ts`

Se manca: crea. Base URL `https://www.elabtutor.school`. Reporters `html` + `json`. Browser `chromium` (primary).

### 7.3 Run locale

`npx playwright test --project=chromium`

Commit: `test(e2e): 5 Playwright spec reali (smoke, simulator, unlim-live, drawing, toolbar) — Test: NNNN/NNNN PASS`

---

## Fase 8 — Dashboard dati reali Supabase (1.5h, opzionale se tempo)

### 8.1 Shell React

File `src/components/dashboard/DashboardShell.jsx`:
- Import supabase client
- useEffect fetch `student_sessions` ultime 20 (con join su experiments_log se utile)
- Tabella: nome, classe, esperimenti completati, tempo, ultimo accesso
- Grafico progressi con recharts (già in deps)
- Export CSV funzionante (componente `CSVDownloadButton`)

### 8.2 Routing

In `App.jsx`: hash `#/dashboard` → render `DashboardShell`

### 8.3 Fallback

Se Supabase non raggiungibile: banner "Connetti Supabase per dati reali" + localStorage placeholder data.

### 8.4 Test

`tests/integration/dashboard.test.jsx` con mock Supabase client. Verifica render + CSV export.

Commit: `feat(dashboard): docente dashboard with Supabase live data + CSV export — Test: NNNN/NNNN PASS`

---

## Fase 9 — Commit + PR + handoff (30 min)

### 9.1 Esegui benchmark finale

- `node scripts/benchmark.cjs`
- Leggi `automa/benchmark.json`
- Confronta con baseline bootstrap

### 9.2 Stress test 50 teacher scenarios

Se hai tempo: simula via Playwright 50 scenari utente diversi. Lista in `docs/strategia/2026-04-18-stress-test-50-scenarios.md` (da creare a parte se serve). Scenari:

- 1-10: navigazione base (click toolbar, open exp, close, nav back)
- 11-20: zoom 100/200/300%, screen reader, mobile portrait/landscape
- 21-30: offline mode, network flaky, cold cache
- 31-40: UNLIM stress (100 msg in 10min, rapid-click, interrupt)
- 41-50: edge case (0 students CSV, exp 999 not exists, race conditions)

Report in `automa/evals/stress-tests/50-teachers-<timestamp>.md` con pass/fail.

### 9.3 PR

`gh pr create --base main --title "Agent Mesh v1 Bootstrap + Anti-regression 7-layer + Benchmark system" --body-file docs/plans/2026-04-18-PR-result.md`

### 9.4 Aggiorna docs/HISTORY.md

Numeri VERIFICATI, formato compatto:

```markdown
## 2026-04-18 — Agent Mesh v1 Bootstrap

Commits: <range>
Tests: 12056 → <new>
Build: 4794 KiB → <new> KiB
Benchmark: <baseline>/10 → <final>/10

Deliverable: CLAUDE.md+Karpathy, CHANGELOG.md, 3 agents, session memory v2 Pinecone,
benchmark 10-metric, 7-layer anti-regression, N Playwright spec, dashboard shell,
Tea PR #73 chiusa.
```

---

## Prompt finale da incollare in Claude CLI

```
SESSIONE ELAB AGENT MESH v1 BOOTSTRAP — 18/04/2026

SUB-SKILL REQUIRED: superpowers:executing-plans

Segui il piano in docs/plans/2026-04-18-PDR-session-long-running.md da Fase 0 a Fase 9.

BASELINE VERIFICATA:
- Test: 12056/12056 PASS (vitest pool=forks, commit 6b0cacd)
- Build: PASS precache 4794 KiB
- Sito: elabtutor.school HTTP 200
- UNLIM live: verificato 17/04 via Playwright
- Kokoro: VPS 72.60.129.50:8881 LIVE
- SSH VPS: chiave ~/.ssh/id_ed25519_elab attiva

REGOLA ZERO (INVIOLABILE):
1. npx vitest run PRIMA e DOPO ogni modifica. Se count < 12056 → REVERT.
2. npm run build dopo ogni modifica .js/.jsx/.json.
3. MAI git add -A. MAI --no-verify. MAI push su main.
4. File critici (CircuitSolver, AVRBridge, PlacementEngine, SimulatorCanvas, NewElabSimulator) SOLO con "authorized-engine-change" nel commit body E 3 test prima/3 dopo.
5. Commit format: "tipo(area): descrizione — Test: NNNN/NNNN PASS".
6. MAI dipendenze npm nuove senza autorizzazione Andrea.

PRINCIPI KARPATHY (obbligatori):
- Think Before Coding
- Simplicity First
- Surgical Changes
- Goal-Driven Execution

ORDINE:
Fase 0 Preparazione (30 min)
Fase 1 CLAUDE.md + CHANGELOG.md (45 min)
Fase 2 Tea PR #73 close (15 min)
Fase 3 3 agent files (2h)
Fase 4 Session Memory v2 (2h)
Fase 5 Benchmark system (1.5h)
Fase 6 Anti-regressione 7 layer (1h)
Fase 7 Playwright E2E (1.5h)
Fase 8 Dashboard Supabase (1.5h IF TIME)
Fase 9 PR + handoff (30 min) + stress 50 teacher IF TIME

OUTPUT ATTESO:
- Branch feature/agent-mesh-v1-bootstrap con 10+ commit atomici
- PR aperta via gh pr create
- Benchmark automa/benchmark.json con score >= baseline
- docs/HISTORY.md aggiornato (numeri VERIFICATI)
- 3+ Playwright spec reali
- 7-layer anti-regression attivo
- Zero regressioni

SE BLOCCI: scrivi automa/state/blocked-<area>.md con diagnosi. NON mascherare. NON marcare completato ciò che non è.

ONESTÀ RIGOROSA. NO INFLAZIONE. CLAIM SOLO CON FONTE.

VAI. Inizia da Fase 0.
```

---

## Output atteso misurabile fine sessione

| Metrica | Prima | Dopo |
|---|---|---|
| Test count | 12056 | ≥12150 |
| Commit atomici nuovi | 0 | ≥10 |
| Playwright E2E | 0 | ≥3 spec |
| Agent files `.claude/agents/` | 0 | 3 |
| Benchmark oggettivo | inesistente | `automa/benchmark.json` pubblicato |
| Anti-regression layer | 2 | 7 |
| CHANGELOG.md | mancante | presente ≥3 entry |
| Tea PR #73 | aperta 5gg | chiusa con credit |
| Session memory | localStorage only | Pinecone + fallback |
| CLAUDE.md Karpathy | no | presente |

**Regola finale**: se dopo 10h non hai completato tutto, FERMA, commit quello che hai, scrivi handoff, apri PR. Meglio 70% verificato che 100% fumo.

---

*Documento self-contained. Inclusi esempi comandi e plist per macOS. Non serve altro input per iniziare.*
