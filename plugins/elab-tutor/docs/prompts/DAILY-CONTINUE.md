# DAILY CONTINUE — CLI loop CONSECUTIVE days (same session)

**Paradigma**: NO cron. CLI gira **consecutive**: day N → day N+1 → day N+2 fino a:
- Fine settimana (day 7/14/21/28/35/42/49/56) → gate check → auto-merge → continua N+1 sett
- Quota Max esaurita → save state + STOP natural
- Blocker 5 retry fail → blocker file + STOP
- Context auto-compact triggered 3+ volte consecutive → save state + STOP

Andrea re-launcha `cc` mattina dopo → CLI legge state → RIPRENDE da punto esatto.

---

## INCOLLA DA QUI ⬇️

Sono Andrea Marro. LOOP CONSECUTIVE days PDR Ambizioso ELAB 8 settimane. Paradigma Harness 2.0 + PTC + MCP mandatory + claude-mem persistence + massima onestà brutale.

## ⚠️ REGOLA HEADLESS MODE (--print --max-turns 200)

Stai girando in **headless mode** via loop-forever.sh. Claude CLI flag: `--continue --print --max-turns 200`. 

**Comportamento obbligatorio**:
1. **MAI dispatch Agent con `run_in_background: true`** — forza sync (foreground). Agent Task blocca turn corrente finche completion.
2. **MAI "end turn, waiting notifications"** — resta in turn fino work atomic done.
3. **Sfrutta max-turns 200** — fai MOLTO work in single invocation (agent + verify + commit + push + dispatch next). Termina natural solo quando:
   - Day complete + handoff scritto + pushed
   - Fine sett gate complete
   - Quota 429 hit
   - Context auto-compact triggered 3x
   - Blocker hard 5 retry fail

**Pattern corretto dispatch**:
```
Agent({ subagent_type: "team-dev", run_in_background: false, prompt: "..." })
// Attendi completion sync
// Usa output
// Dispatch prossimo
```

**Pattern SBAGLIATO**:
```
Agent({ ..., run_in_background: true })
// "Awaiting notification, end turn" ❌
```

Rationale: in headless --print, end turn = process exit. Background agents lost. Sync = resource-intensive ma completes work.

## REGOLE SUPREME (violazione = ABORT)

0. **MAI FERMARSI tra day e day stessa sessione**. Fine day N → SUBITO day N+1 senza pause. Stop SOLO per: sett gate end / quota 429 persistente / blocker hard 5 retry fail / context auto-compact >3 volte consecutive.

1. **HARNESS 2.0 pattern obbligatorio** (Anthropic Apr 2026):
   - **Sprint Contract pre-implementation**: team-architect + team-auditor negoziano acceptance criteria PRIMA di code. File `automa/team-state/sprint-contracts/TN-XXX.md`
   - **State recovery persist**: `automa/state/claude-progress.txt` update ogni 5 min + ogni commit + ogni step end
   - **4 grading criteria subjective** (ogni team output): design quality (1-10) + originality (1-10) + craft (1-10) + functionality (1-10). Media = score agent
   - **Brain/Hands decoupling**: Edge Function = Brain (logica), container = Hands (exec). Design tools accordingly.
   - **Iterative simplification**: dopo ogni commit, audit "posso rimuovere component?" + verifica load-bearing

2. **PTC (Programmatic Tool Calling) MANDATORY batch ops**:
   - `code_execution` container per:
     * CoV 3x vitest parallel (3 worker concurrent invece di sequential)
     * 20+ prompt PZ v3 verify batch
     * Lighthouse multi-page audit simultaneo
     * Playwright E2E parallel shard
     * RAG embedding batch
     * Image process foto TRES JOLIE (92 immagini)
   - Output solo summary in context (risparmio ~-37% token vs 50K+ tool calls individuali)
   - Setup `.claude/tools-config.json` code_execution_enabled: true

3. **MCP MANDATORY ogni step** (log chiamate in report):
   - `mcp__plugin_claude-mem_mcp-search__*` → search + save observation OGNI decisione
   - `mcp__plugin_serena_serena__*` → find_symbol + search_for_pattern + find_referencing (codebase semantic)
   - `mcp__plugin_playwright_playwright__*` → browser_navigate + browser_snapshot + browser_evaluate (E2E live)
   - `mcp__Claude_Preview__*` → preview_start + preview_navigate + preview_screenshot (dev server)
   - `mcp__Control_Chrome__*` → open_url + execute_javascript + get_page_content (UI prod live verify)
   - `mcp__supabase__*` → list_tables + execute_sql + deploy_edge_function + get_logs + get_advisors
   - `mcp__57ae1081-*__*` Vercel MCP → deploy + runtime_logs + list_deployments
   - `mcp__792083c5-*__*` Sentry → search_issues + analyze_issue_with_seer post-deploy
   - `mcp__plugin_context7_context7__*` → query-docs (docs aggiornate Playwright, Vercel, Supabase, React 19)
   - `mcp__ToolUniverse__*` (opzionale se utile)

4. **CLAUDE-MEM save observation** (skill `claude-mem:mem-search` + MCP tools):
   - Ogni commit → save observation con sha + scope + metrics
   - Ogni decisione architetturale → save con rationale
   - Ogni blocker → save con severity
   - Ogni audit onesto → save con score
   - Usa `mcp__plugin_claude-mem_mcp-search__search` inizio day per context recovery

5. **ANTI-REGRESSIONE 5 gate hard** (script `no-regression-guard.sh`):
   - GATE-1 pre-commit: test count ≥ baseline
   - GATE-2 pre-push: CoV 3x vitest consistente
   - GATE-3 pre-merge: CI green + E2E smoke
   - GATE-4 pre-deploy: bundle delta ≤10%
   - GATE-5 post-deploy: curl 200 + Sentry error <5 + PZ v3 prod

6. **AUDIT AUMENTA day per day** (progressivo):
   - Day N vitest target: baseline + (day * 15) minimo
   - Day N E2E spec target: 12 + (day * 1.5) minimo
   - Day N benchmark target: 4.06 + (day * 0.08) minimo (sett 1 → 4.9 dom 27/04)
   - Day N MCP calls target: >= 15 log
   - Day N audit lines: 100 + (day * 20)

7. **ONESTÀ BRUTALE**:
   - Zero inflation (numeri freschi <30s)
   - Zero "quasi pronto" (= 0%)
   - Auto-critica obbligatoria ogni step (>=3 gap enumerated)
   - Score quantitativo giustificato
   - Caveat onesti in handoff

8. **CAVEMAN PLUGIN** (token efficiency + compression):
   - Inizio sessione: `/caveman full` (drop articles, fragments OK, compressione -70%)
   - Memory file lunghi: skill `caveman:compress` su CLAUDE.md, automa/handoff.md, ecc
   - Code review: skill `caveman:caveman-review` per commenti PR compressi
   - Commit message: skill `caveman:caveman-commit` per message brief
   - Comunicazione interna agenti peer: caveman mode ATTIVO
   - Disattiva per: PR description publica, code comments, security warnings

9. **WEB RESEARCH OBBLIGATORIA** prima ogni step complesso:
   Pre-implementation ricerca con `WebSearch` + `WebFetch` + `mcp__plugin_context7_context7__query-docs`:
   - Harness 2.0 Anthropic docs ultimo (docs.anthropic.com search "Sprint Contract")
   - Programmatic Tool Calling examples (search "Claude PTC code_execution container batch")
   - Playwright patterns latest (context7 resolve-library-id playwright → query-docs)
   - Vercel deployment best practices (context7 vercel)
   - Supabase Edge Function patterns (context7 supabase)
   - React 19 + Vite 7 gotchas (context7 react, vite)
   - Multi-agent orchestration (WebSearch "peer agent team coordination 2026")
   Log research findings in `docs/research/day-$SPRINT_DAY-research.md` (max 200 righe, bullet).
   Apply findings in implementation. Zero "proceed without research" salvo task banale.

10. **WORKFLOW POTENTI da invocare via Skill tool** (preferire sempre skill pronte vs ad-hoc):

    **Planning + execution** (Harness 2.0 core):
    - `/claude-mem:make-plan` — phased implementation plan con documentation, ideale per task PDR >2h
    - `/claude-mem:do` — execute phased plan via subagents automatico
    - `/superpowers:writing-plans` — multi-step implementation plan con acceptance criteria
    - `/superpowers:execute-plan` (= superpowers:executing-plans) — run piano pre-scritto
    - `/superpowers:brainstorming` — prima ogni nuova feature o decisione ambigua
    - `/superpowers:subagent-driven-development` — esecuzione task paralleli indipendenti
    - `/superpowers:dispatching-parallel-agents` — 2+ independent tasks simultanei

    **Code review + quality** (pre-merge mandatory):
    - `/pr-review-toolkit:review-pr` — comprehensive PR review con silent failures + type design + comments accuracy + security
    - `/coderabbit:code-review` — AI code review + `/coderabbit:autofix` auto-fix
    - `/feature-dev:code-review` (agent feature-dev:code-reviewer)
    - `/pr-review-toolkit:silent-failure-hunter` — error handling audit
    - `/pr-review-toolkit:type-design-analyzer` — type invariants review

    **Feature development**:
    - `/feature-dev:feature-dev` — guided feature development con codebase understanding
    - `/frontend-design:frontend-design` — UI distintiva prod-grade
    - `/impeccable:critique` + `/impeccable:polish` + `/impeccable:audit` — design quality
    - `/engineering:code-review` + `/engineering:architecture` + `/engineering:debug`

    **Commit + deploy**:
    - `/commit-commands:commit-push-pr` — atomic commit + push + PR open
    - `/commit-commands:commit` — commit ben strutturato
    - `/vercel:deploy` — deploy Vercel
    - `/vercel:verification` — full-story post-deploy verification
    - `/vercel:status` — status deploy + recent
    - `/supabase:supabase` — Supabase tasks

    **Testing**:
    - `/superpowers:test-driven-development` — TDD RED-GREEN-REFACTOR strict
    - `/superpowers:verification-before-completion` — pre-claim check

    **Debugging + incident**:
    - `/superpowers:systematic-debugging` — root cause obbligatorio
    - `/sentry:seer` — natural language query Sentry
    - `/engineering:incident-response` — triage + communicate + fix
    - `/posthog:errors` — PostHog error tracking

    **Memory + context** (Harness 2.0 state recovery):
    - `/claude-mem:mem-search` — search cross-session memory
    - `/claude-mem:smart-explore` — token-optimized structural search tree-sitter
    - `/claude-mem:smart-search` — semantic search corpus
    - `/claude-mem:knowledge-agent` — AI-powered knowledge base
    - `/claude-mem:timeline-report` — narrative progress analysis

    **Continuous loop**:
    - `/ralph-loop:ralph-loop` — continuous loop pattern (considerare per day consecutive)
    - `/automa-loop` (se presente) — ELAB-specific loop

    **Multi-specialist** (task complessi cross-domain):
    - `/ultrathink:ultrathink` — multi-specialist coordination 5+ esperti

    **Content + research**:
    - `/firecrawl:firecrawl` — web scraping + skill-gen
    - `/anthropic-skills:pdf` — extract volumi PDF Vol1/2/3
    - `/anthropic-skills:docx` — extract docx Tea 10 idee
    - `/anthropic-skills:xlsx` — BOM kit Excel

    **Token efficiency**:
    - `/caveman:compress` — comprime memory files (CLAUDE.md, handoff)
    - `/caveman:caveman` — mode comunicazione interna
    - `/caveman:caveman-review` — review compresso
    - `/caveman:caveman-commit` — commit message compresso

    **Specifici ELAB** (skill locali già presenti):
    - `/elab-benchmark` — 30 metriche oggettive
    - `/elab-quality-gate` — gate pre/post sessione
    - `/elab-rag-builder` — costruisce RAG da volumi
    - `/quality-audit` — end-to-end audit
    - `/volume-replication` — verify parallelism volumi
    - `/analisi-simulatore` — audit simulator
    - `/elab-cost-monitor` — monitor costi API
    - `/ricerca-orchestrator` — orchestratore ricerca ELAB

11. **SKILLS ATTIVE da usare opportunisticamente** (già installate, invoca con `Skill` tool):
    - `superpowers:test-driven-development` (TDD RED-GREEN-REFACTOR)
    - `superpowers:systematic-debugging` (root cause)
    - `superpowers:verification-before-completion` (pre-claim check)
    - `superpowers:dispatching-parallel-agents` (2+ independent tasks)
    - `superpowers:writing-plans` (multi-step implementation)
    - `claude-mem:make-plan` (phased implementation plan con documentation)
    - `claude-mem:do` (execute phased plan via subagents)
    - `claude-mem:mem-search` (search cross-session memory)
    - `claude-mem:smart-explore` (token-optimized structural code search tree-sitter)
    - `claude-mem:knowledge-agent` (AI-powered knowledge base query)
    - `claude-mem:timeline-report` (narrative progress report)
    - `feature-dev:feature-dev` (guided feature development with codebase understanding)
    - `pr-review-toolkit:review-pr` (comprehensive PR review)
    - `pr-review-toolkit:silent-failure-hunter` (error handling audit)
    - `pr-review-toolkit:type-design-analyzer` (type invariants review)
    - `coderabbit:code-review` + `coderabbit:autofix` (AI review + auto-fix)
    - `vercel:deploy` + `vercel:env` + `vercel:verification` (Vercel ops)
    - `supabase:supabase` (ogni task Supabase)
    - `sentry:seer` (natural language query Sentry)
    - `frontend-design:frontend-design` (UI distintiva prod-grade)
    - `anthropic-skills:pdf` + `anthropic-skills:docx` (extract volumi PDF + docx Tea)
    - `ralph-loop:ralph-loop` (continuous loop pattern se utile)
    - `ultrathink:ultrathink` (multi-specialist coordination se 5+ esperti)

---

## 🏗️ METODOLOGIA AGILE SCRUM — enforcement (riferimento completo in `docs/workflows/AGILE-METHODOLOGY-ELAB.md`)

Ogni sprint = 7 giorni (lun→dom). Ogni day 1 = Sprint Planning. Ogni day 7 = Sprint Review + Retrospective.

### Cerimonie obbligatorie nel loop

| Day | Cerimonia | Output file |
|-----|-----------|-------------|
| Day 1 sprint (lun) | **Sprint Planning** | `automa/team-state/sprint-contracts/sett-N-contract.md` |
| Day 1-7 tutti | **Daily Standup** (asincrono, team-tpm) | `automa/team-state/daily-standup.md` append entry |
| Day 7 (dom sera) | **Sprint Review** (demo deploy prod + 4 grading) | `docs/reviews/sprint-N-review.md` |
| Day 7 (dom sera) | **Sprint Retrospective** (start-stop-continue + 3 action) | `docs/retrospectives/sprint-N-retrospective.md` |

### Definition of Done enforcement (per task, story, sprint)

- **Task DoD** (11 check) — ogni commit
- **Story DoD** (7 check) — ogni PR
- **Sprint DoD** (13 check hard) — `scripts/cli-autonomous/end-week-gate.sh`

Dettaglio in AGILE-METHODOLOGY-ELAB.md sez 10.

### Velocity tracking

File `automa/state/velocity-tracking.json` aggiornato fine sett (TPM):
```json
{
  "sprints": [{
    "number": N,
    "period": "YYYY-MM-DD_to_YYYY-MM-DD",
    "committed_points": X,
    "completed_points": Y,
    "velocity": Y,
    "spillover": X-Y,
    "retrospective_actions_completed": N,
    "retrospective_actions_total": N
  }],
  "rolling_avg_last_3": avg,
  "trend": "up|stable|down"
}
```

### Product Backlog gerarchico

File `automa/team-state/product-backlog.md`:
```
Epic (8 totali = 8 settimane PDR)
  └── Story (3-7 per epic)
        └── Task (2-8 per story, con story point Fibonacci 1-21)
              └── Acceptance Criteria (3-15 per task)
```

DoR (Definition of Ready) 8 check prima di entrare Sprint Backlog (sez 3.4 AGILE-METHODOLOGY).

### 3 Pilastri Scrum enforce

- **Trasparenza**: tutti file `automa/team-state/*`, `docs/audit/*`, `docs/handoff/*` pubblici
- **Ispezione**: team-auditor audit brutale onesto ogni day + ogni sprint end
- **Adattamento**: retrospective → 3 action concrete → tracciate sprint N+1

### Anti-pattern Scrum (ZERO tolleranza)

- ❌ Scope creep mid-sprint (no story add senza remove altrettante)
- ❌ Self-approval (agent approve proprio lavoro)
- ❌ Velocity as target (gaming inflation)
- ❌ Skip CoV (1 run vs 3x)
- ❌ Retrospective theater (lista senza enforcement)
- ❌ Hero syndrome (Andrea fa tutto, agenti sotto-utilizzati)

## LOOP PRINCIPALE (infinite fino stop naturale)

```
LOOP:
  STEP 0 → state recovery + determina SPRINT_DAY
  STEP 1 → TPM standup
  STEP 2 → fix minor issues day precedente (carry-over blockers)
  STEP 3 → dispatch team per task P0 day N (Sprint Contract + TDD + CoV)
  STEP 4 → audit incrementale + MCP usage log
  STEP 5 → end-day handoff + state persist + claude-mem save
  STEP 6 → check stop conditions:
    - Sett end day (7/14/21/28...) → GATE HARD → auto-merge + deploy prod + test post-deployed → SE PASS → continua loop day N+1, SE FAIL → STOP
    - Quota 429 persistente → STOP
    - Context compact >3x → STOP
    - Blocker hard 5 retry fail → STOP
    - Altrimenti → loop back STEP 0 con SPRINT_DAY++
```

## STEP 0 — State recovery (ogni day inizio)

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
source ~/.zshrc

# State persistente
cat automa/state/claude-progress.txt
```

Parse variabili da file state.

### 0.1 — Claude-mem context fetch

Usa MCP:
- `mcp__plugin_claude-mem_mcp-search__smart_search` query "ELAB PDR sett $WEEK_N decisions last 5 days"
- `mcp__plugin_claude-mem_mcp-search__timeline` period "2 days ago to now"
- `mcp__plugin_claude-mem_mcp-search__get_observations` filter type blocker

### 0.2 — Baseline snapshot

```bash
bash scripts/cli-autonomous/baseline-snapshot.sh > /tmp/baseline-day-$SPRINT_DAY.json
```

### 0.3 — Pre-flight gates

```bash
gh run list --branch feature/pdr-ambizioso-8-settimane --limit 1 --json conclusion -q '.[0].conclusion' | grep -q success || { echo "CI last FAIL — investigate"; exit 1; }

# Token verify
[ -n "$TOGETHER_API_KEY" ] && [ -n "$SUPABASE_ACCESS_TOKEN" ] && [ -n "$GITHUB_TOKEN" ] || exit 1

# Dual Supabase resolve (fix blocker Day 01)
for proj in euqpdueopmlllqjmqnyb vxvqalmxqtezvgiboxyv; do
  RESP=$(curl -s -o /dev/null -w "%{http_code}" "https://$proj.supabase.co/functions/v1/unlim-chat" -X POST -H "apikey: $SUPABASE_ANON_KEY" -d '{"message":"test"}')
  echo "$proj: HTTP $RESP"
done
# Documenta canonical in state
```

## STEP 1 — TPM standup Harness 2.0 style

```
Agent({ subagent_type: "team-tpm",
  prompt: "Standup sprint day $SPRINT_DAY. HARNESS 2.0 pattern:

1. Sprint Contract: pre-implementation pre-negotiate acceptance criteria 3 task P0 con team-auditor (il contratto prima del code). Scrivi automa/team-state/sprint-contracts/day-$SPRINT_DAY-contract.md con: goal atomic, acceptance criteria, test strategy, rollback plan, success metrics 4 grading (design/originality/craft/functionality).

2. State recovery: leggi automa/state/claude-progress.txt + mcp__plugin_claude-mem_mcp-search__smart_search query 'day $SPRINT_DAY blockers decisions' → fetch ultimi 5 context.

3. Priorita task:
- Se blocker carry-over Day N-1 → FIX PRIMA di nuove feature
- Se sett gate day (7/14/21...) → end-week-gate scope only
- Altrimenti → PDR_GIORNO_$(printf %02d $SPRINT_DAY)_*.md task

4. Output: tabella 3 task P0 + Sprint Contract path + assigned_to (architect/dev/tester/reviewer).

5. Save observation: mcp__plugin_claude-mem_mcp-search__* save 'Day $SPRINT_DAY standup: [3 task + owner]'.

NO codice. Solo coordinazione + contracts." })
```

## STEP 2 — Fix carry-over blockers + gap Day 01 (sempre prima task nuovi)

### 2.1 Gap onesti Day 01 audit (lista chiudere in ordine)

Leggi `docs/audit/foundations-brutal-audit-2026-04-21.md` sezione "RED FLAGS".
Gap residui da Day 01 (priorità P0→P3):

| # | Gap | Severity | Fix stima | Script/action |
|---|-----|----------|-----------|---------------|
| 1 | **Dual Supabase project ref** (euqpdueopmlllqjmqnyb vs vxvqalmxqtezvgiboxyv) | 🔴 P0 | 10 min | curl entrambi + nota canonical in ADR-003 |
| 2 | **JWT 401 Edge Function CLI curl** | 🟠 P1 | 15 min | usa SUPABASE_ANON_KEY in test script |
| 3 | **benchmark.json persistito ma non trackato velocity** | 🟠 P1 | 10 min | crea `automa/state/velocity-tracking.json` |
| 4 | **152 dirty files carry-over** | 🟡 P2 | 30 min OR ignora | `git status --short` categorize + commit selettivo OR doc rationale |
| 5 | **no-regression-guard.sh no --dry-run** | 🟢 P3 | 10 min | aggiungi flag parsing + exit 0 in dry-run |
| 6 | **Reviewer 5 minor issues** | 🟡 P2 | 1h batch | hardcoded anon key → env, blueprint names reconcile, vi.resetModules() in ES tests, E2E weak assertions tighten, withGeminiProvider type explicit |
| 7 | **Sprint Contract Sprint 1 non formalizzato** | 🟠 P1 | 30 min | scrivi `automa/team-state/sprint-contracts/sett-1-contract.md` retrospettivo |
| 8 | **Daily Standup Day 01 non scritto formal** | 🟢 P3 | 10 min | scrivi retrospettivo `daily-standup-2026-04-21.md` |
| 9 | **Product Backlog gerarchico non formal** | 🟡 P2 | 1h | scrivi `automa/team-state/product-backlog.md` con Epic→Story→Task |

### 2.2 Ogni blocker in automa/team-state/blockers.md OPEN list

Dispatch team-dev fix (max 3 retry con auto-fix).
Update blockers.md → CLOSED se risolto.
Commit atomic `fix(scope): blocker BK-XXX resolved + [evidence path]`.

## STEP 3 — Task P0 day N (core work)

Pattern per ogni task:
- Se >2h blueprint_needed → team-architect → docs/architectures/
- TDD RED-GREEN-REFACTOR → team-dev → commit atomic
- CoV 3x + E2E + MCP Playwright live → team-tester → docs/audit/
- Verdict APPROVE/CHANGES → team-reviewer → docs/audit/
- Audit brutale → team-auditor → docs/audit/

### 3.1 — PTC BATCH usage mandatory

Usa code_execution container per:

```python
# Esempio PTC: CoV 3x vitest parallel
import subprocess, json, concurrent.futures

def run_vitest():
    r = subprocess.run(['npx','vitest','run','--reporter=json'], capture_output=True, text=True, cwd='/path')
    return json.loads(r.stdout.split('\n')[-1])

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:
    results = list(ex.map(lambda i: run_vitest(), range(3)))

counts = [r['numPassedTests'] for r in results]
print(f"CoV 3x: {counts} — consistent={len(set(counts))==1}")
```

Stessa tecnica per:
- 20 prompt PZ v3 verify batch
- Lighthouse multi-page audit
- Playwright shard E2E
- Image TRES JOLIE batch convert
- RAG embedding bulk

## STEP 3.5 — STRESS TEST POST-DEPLOY (aumento qualità Day 04+)

Post deploy preview/prod ogni day → lancia `scripts/cli-autonomous/stress-test.sh`:

### 3.5.1 — Load test homepage
```bash
# 100 curl paralleli
seq 100 | xargs -P 20 -I{} curl -s -o /dev/null -w "%{http_code} %{time_total}\n" https://www.elabtutor.school/
# Verifica: 100/100 = 200, nessun 500/502/503, p95 time < 3s
```

### 3.5.2 — LLM stress 50 prompt PZ v3
```bash
# 50 prompt italiani bambini batch
for i in {1..50}; do
  curl -s -X POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat \
    -H "Content-Type: application/json" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -d "{\"message\":\"Ragazzi spiegate LED scenario $i\"}" &
done
wait
# Verifica: 50/50 response contiene "Ragazzi", 0 contiene "Docente,?\s*leggi"
# Verifica: latenza p50 < 2s, p95 < 5s, p99 < 10s
```

### 3.5.3 — Playwright shard parallel 5 workers
```bash
BASE_URL=https://www.elabtutor.school \
  npx playwright test --workers=5 --shard=1/5 tests/e2e/ &
BASE_URL=https://www.elabtutor.school \
  npx playwright test --workers=5 --shard=2/5 tests/e2e/ &
# ... 5 shard
wait
# Verifica: tutti shard PASS, aggregate 31/31
```

### 3.5.4 — Cold start Render warmup verify
```bash
# Forzare cold start + misurare
curl -X POST https://elab-galileo.onrender.com/wake -w "cold start %{time_total}s\n"
# Verifica: post T1-003 warmup cron → cold start < 3s (vs 18s baseline pre-fix)
```

### 3.5.5 — Lighthouse multi-page
```bash
for page in / /lezioni /simulator /dashboard; do
  npx lighthouse "https://www.elabtutor.school$page" \
    --output=json --output-path="/tmp/lh-$page.json" --quiet
done
# Verifica: performance >= 80, accessibility >= 90, best-practices >= 85
```

### 3.5.6 — Sentry error rate
Via MCP `mcp__792083c5-*__search_events`:
- Query: errors last 10 min post-deploy
- Verifica: delta errors vs pre-deploy baseline <= 0
- Se nuovi errori > 5 → **ROLLBACK IMMEDIATO**

### 3.5.7 — Security scan npm audit
```bash
npm audit --audit-level=high --json | tee docs/audit/npm-audit-day-$SPRINT_DAY.json
# Verifica: 0 high/critical vulnerabilities
```

Output stress test: `docs/audit/stress-test-day-$SPRINT_DAY.md` (max 100 righe, evidence per check).

## STEP 4 — Audit incrementale crescente (AUMENTATO Day 04+)

### 4.1 CoV 5x vitest (aumentato da 3x)

```bash
for i in 1 2 3 4 5; do
  npx vitest run --reporter=dot 2>&1 | tail -3
done
# Verifica: 5/5 run identico PASS count
```

### 4.2 Audit matrix 20 dimensioni (espansa)

Genera `docs/audit/day-$SPRINT_DAY-audit.md` con tabella 20 metriche:

| # | Metrica | Valore | Delta vs baseline | Target |
|---|---------|--------|-------------------|--------|
| 1 | Vitest PASS | [fresh] | +N | +15/day |
| 2 | Build time sec | [fresh] | -/+ | <60 |
| 3 | Bundle size KB | [fresh] | % | <5000 |
| 4 | Benchmark score 0-10 | [fresh --write] | +0.08/day | 6.0+ sett 1 |
| 5 | E2E pass rate | [playwright] | +spec | 31+2/day |
| 6 | PZ v3 grep source | 0 | = | 0 sempre |
| 7 | PZ v3 curl prod live | [20 sample] | 0 | 0 always |
| 8 | Sentry errors 24h | [MCP query] | <=0 delta | baseline |
| 9 | Deploy preview status | curl 200 | ok | 200 |
| 10 | Deploy prod status | curl 200 | ok | 200 |
| 11 | Git unpushed | [rev-list] | 0 | 0 |
| 12 | Git dirty count | [status] | -/+ | <=carry-over |
| 13 | CI last run | [gh] | success | success |
| 14 | Coverage % | [vitest --coverage] | +% | >80% sett 8 |
| 15 | npm audit high/crit | [fresh] | 0 | 0 |
| 16 | Lighthouse perf | [lh home] | +/- | >=80 |
| 17 | Lighthouse a11y | [lh home] | +/- | >=90 |
| 18 | LLM latency p95 | [50 prompt] | ms | <5000 |
| 19 | Cold start Render | [curl wake] | ms | <3000 |
| 20 | Cost daily Together | [dashboard] | $ | <$1 |

### 4.3 Fix budget minimo 3/day

Day N deve chiudere ALMENO 3 gap:
- Carry-over blockers (da day N-1)
- Reviewer minor issues
- Audit matrix red flag
- TODO/FIXME residui

Se zero fix → audit segnala **Fix Budget Deficit** (red flag).

### 4.4 Auto-critica mandatory (>=5 gap enumerated)

Ogni team output DEVE includere `## COSA NON FUNZIONA / GAP / DEBITO TECNICO`:
- Minimum 5 gap onesti
- Severity (P0/P1/P2/P3)
- Owner suggerito
- Estimate fix

### 4.5 MCP calls log (minimo 20/day)

Tabella in audit:
| MCP | Calls | Purpose |
|-----|-------|---------|
| claude-mem | N | search + save |
| supabase | N | list_edge + deploy |
| Vercel | N | deploy + logs |
| Sentry | N | search_events |
| Playwright | N | browser live E2E |
| Control_Chrome | N | UI verify prod |
| Claude_Preview | N | dev server |
| serena | N | codebase semantic |
| context7 | N | docs lookup |

### 4.6 Score 4 grading Harness 2.0

- Design Quality 1-10
- Originality 1-10
- Craft 1-10
- Functionality 1-10
- Media = day score

## STEP 5 — End-day + state persist + claude-mem

```bash
bash scripts/cli-autonomous/end-day-handoff.sh
bash scripts/cli-autonomous/state-update.sh
```

Claude-mem save observation:
- Dispatch `mcp__plugin_claude-mem_mcp-search__*` SAVE_OBS con:
  - title: "Day $SPRINT_DAY completed"
  - content: task done + commits + test_count + benchmark + blockers
  - tags: day-$SPRINT_DAY, sett-$WEEK_N, pdr-ambizioso

Push:
```bash
bash scripts/cli-autonomous/push-safe.sh
```

Deploy preview:
```bash
bash scripts/cli-autonomous/deploy-preview.sh
```

Test on deployed:
```bash
bash scripts/cli-autonomous/test-on-deployed.sh
```

## STEP 6 — Check stop conditions + auto next day

```bash
# A) Sett end gate
if (( SPRINT_DAY % 7 == 0 )); then
  bash scripts/cli-autonomous/end-week-gate.sh || {
    echo "SETT $WEEK_N GATE FAIL — blocker" > automa/state/WEEK-$WEEK_N-BLOCKER.md
    exit 1
  }
  # Auto-merge + deploy prod
  gh pr create --base main --head feature/pdr-ambizioso-8-settimane --title "Sprint sett $WEEK_N complete"
  PR=$(gh pr list --head feature/pdr-ambizioso-8-settimane --json number -q '.[0].number')
  gh pr checks $PR --watch --fail-fast
  gh pr merge $PR --merge
  git checkout main && git pull
  bash scripts/cli-autonomous/deploy-prod.sh
  bash scripts/cli-autonomous/test-on-deployed.sh production
  # Se PASS → continua sett $((WEEK_N+1)) day 1
  # Se FAIL → rollback + stop
fi

# B) Quota 429 check
# (auto-retry sleep 60s max 3, poi STOP)

# C) Context auto-compact check
# (se "conversation compacted" in output 3x → stop naturale dopo save state)

# D) Blocker hard
# (se 5 retry fail → stop)

# E) Default → loop back STEP 0 con SPRINT_DAY++
SPRINT_DAY=$((SPRINT_DAY + 1))
# Jump STEP 0
```

## STOP condition finale output handoff

Quando stop naturale (sett end OR quota OR context OR blocker):
1. Scrivi `docs/handoff/YYYY-MM-DD-session-end-day-N.md` dettaglio (audit-firm style):
   - Executive Summary
   - Evidence Inventory (path lista)
   - Risks Identified
   - Debt Residual
   - Recommendations
   - Next Actions Andrea
   - Score finale 0-10 giustificato
2. Update `automa/state/claude-progress.txt` con:
   ```
   last_sprint_day=$SPRINT_DAY
   last_phase=[END_DAY|SETT_GATE_PASS|SETT_GATE_FAIL|QUOTA|CONTEXT|BLOCKER]
   next_action=DAY_$((SPRINT_DAY+1))
   blockers_open=$(grep -c "^## OPEN" automa/team-state/blockers.md || echo 0)
   timestamp=$(date -Iseconds)
   ```
3. Claude-mem save final observation session
4. Output stdout summary 30 righe massimo

Andrea re-launcha `cc` → legge state → riprende.

## FINE PROMPT ⬆️
