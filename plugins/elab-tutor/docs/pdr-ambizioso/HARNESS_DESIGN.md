# Harness Design — 3 Pattern Anthropic per Long-Running Agents

**Versione**: 1.0
**Data**: 2026-04-20
**Owner**: Andrea Marro
**Goal**: Applicare wisdom Anthropic harness design (Mar 2026 + Nov 2025) al progetto ELAB

---

## 0. TL;DR

Anthropic ha pubblicato 2 articoli chiave su harness design per agenti long-running:
- "Effective harnesses for long-running agents" (Nov 2025)
- "Harness design for long-running apps" (Mar 2026)

**3 pattern fondamentali**:
1. **Multi-Agent Specialization** (Planner / Generator / Evaluator GAN-like)
2. **Context Management** (file-based handoffs + reset)
3. **Objective Grading Criteria** (subjective → measurable)

**Trade-off**: harness 20x più costoso ma quality-superior. Per ELAB: investiamo upfront in harness design per gain qualità finali.

---

## 1. Pattern 1: Multi-Agent Specialization (GAN-like)

### Concept

Architettura 3-tier ispirata a GAN (Generative Adversarial Networks):
- **Planner**: espande prompt vago → spec dettagliato
- **Generator**: implementa spec
- **Evaluator**: testa contro criteria, fornisce feedback

L'iterazione Planner → Generator → Evaluator → (loop se fail) raffina output fino a quality threshold.

### Setup ELAB

ELAB già ha `.claude/agents/` con triade base:
- `planner.md` (opus, decide task)
- `generator-app.md` (sonnet, implementa code)
- `generator-test.md` (sonnet, scrive test)
- `evaluator.md` (haiku, verdetto PASS/WARN/FAIL)

**Upgrade direttiva user 20/04**: tutti Opus, team peer non gerarchici.

Nuovo team 6 agenti Opus (vedi `MULTI_AGENT_ORCHESTRATION.md`):
- TPM (planner-equivalent + scheduling)
- ARCHITECT (planner-equivalent + design)
- DEV (generator-app)
- TESTER (generator-test)
- REVIEWER (evaluator + quality gate)
- AUDITOR (evaluator + onestà brutale)

### Quando dispatch triade

**Task complesso (>2h)**:
1. ARCHITECT design blueprint
2. DEV implementa da blueprint (parallel TESTER scrive spec)
3. REVIEWER verdetto
4. Se REJECT → DEV rework (loop max 3 iterazioni)
5. Se 3 iterazioni fail → AUDITOR audit + decision human-in-the-loop

### Anti-pattern

❌ **Skip Architect su task >2h**: Dev finisce wrong direction, rework massivo
❌ **Reviewer = Dev stesso agente**: bias positivo, no quality gate vero
❌ **Loop infinito Generator-Evaluator**: cap 3 iterazioni, escalate ad Andrea
❌ **Evaluator vede prompt Generator**: bias, evaluator deve solo vedere code change

---

## 2. Pattern 2: Context Management

### Problema: "context anxiety"

Modello conclude **prematuramente** quando si avvicina al token limit del context window. Sintomi:
- Risposte abbreviate verso fine sessione
- Skipping verification step
- "Looks good, ship it" senza CoV
- Hallucinazioni ricostruzione decisioni passate

### Soluzione: file-based handoffs + reset

**Struttura ELAB**:
```
docs/handoff/
├── 2026-04-21-end-day.md       # Ogni sera Andrea scrive
├── 2026-04-22-start-day.md     # Ogni mattina Andrea legge
├── 2026-04-22-end-day.md
└── ...

automa/state/
├── benchmark.json              # Score corrente
├── test-baseline.txt           # Pass count corrente
└── deploy-state.json           # Last deploy SHA + URL

automa/team-state/
├── tasks-board.json            # Kanban team
├── daily-standup.md            # Standup automatico
├── decisions-log.md            # ADR cumulative
└── blockers.md                 # Open impediments
```

### Template handoff giornaliero

```markdown
# Handoff Day N — YYYY-MM-DD

## Stato attuale
- Branch: `feature/pdr-ambizioso-8-settimane`
- Last commit SHA: `abc1234`
- Test count last vitest: 12056 PASS / 0 FAIL
- Build status: PASS
- Benchmark score: 6.3/10
- Deploy URL prod: https://www.elabtutor.school
- Quota Max usata settimana: 45%

## Cosa fatto oggi
- PR #N1 merged: <descrizione + SHA>
- PR #N2 merged: <descrizione + SHA>
- Bug T1-005 fixed: <descrizione>

## Cosa NON fatto (carry over domani)
- T2-003: Hetzner setup → blocker DNS propagation
- T2-008: Vol3 cap 8-9 bookText → metà fatto, completare

## Decisioni prese
- DECISION-007: adottare BGE-M3 invece di OpenAI embed (cost saving + EU)
- DECISION-008: skip OpenClaw fino sett 8 (focus core UNLIM prima)

## Anomalie + warning
- Sentry alert: 3 errori NPE su `useGalileoChat.js:142` → indagare domani
- Render cold start tornato 18s → warmup ping non scattato 2 volte

## Prossima sessione comincia da
1. Fix Sentry NPE useGalileoChat.js:142
2. Completare T2-008 vol3 cap 8-9
3. Indagine warmup ping miss
4. Continuare T2-003 Hetzner

## Files modificati oggi (per Reviewer pre-merge)
- src/components/dashboard/DashboardShell.jsx (+120 lines)
- src/services/teacherDataService.js (+85 lines)
- tests/integration/dashboard-shell.test.jsx (+45 lines)
```

### Template start-day

```markdown
# Start Day N+1 — YYYY-MM-DD

## Lettura handoff ieri
Read: docs/handoff/<ieri>-end-day.md

## Stato verificato (CoV pre-work)
- [ ] git status clean? Y/N
- [ ] last commit pulled? Y/N
- [ ] vitest run PASS count == handoff? Y/N
- [ ] build local PASS? Y/N

## Plan giornata
1. Carry-over da ieri (priorità)
2. Nuovi task da tasks-board.json
3. Buffer 1h imprevisti

## Dispatch team agenti pianificato
- TPM 9:00 (standup)
- ARCHITECT solo se task >2h
- DEV/TESTER per ogni task ready
- REVIEWER pre-merge ogni PR
- AUDITOR fine giornata (audit)

## Comunicazione Tea
- Async via GH PR comments
- Sync se: blocker > 30 min OR decisione cross-team
```

### Reset pattern

Quando context window > 70% pieno, **proattivamente**:
1. Scrivi handoff intermedio (not solo end-day)
2. `/clear` o nuova sessione Claude CLI
3. Nuova sessione legge handoff intermedio
4. Continua lavoro con context fresco

**Trigger reset**:
- Context > 100K tokens usato
- > 4h sessione attiva
- Cambiamento topic radicale (es. da bug fix a feature design)
- Dopo task complesso completed (clean slate per next)

### Anti-pattern context anxiety

❌ Stipare context con file letti "preventivamente"
❌ Tool output verbose se basta summary
❌ Conversation history come "memoria" (usa file)
❌ Scrivere "stato corrente" in chat (scrivi in file)
❌ Lasciare claude-mem unused (build corpus regolarmente)

✅ Subagent per indagini lunghe (loro context fresco)
✅ File handoff structured ogni transizione
✅ claude-mem capture + query passato decisioni
✅ State file `automa/state/` per stato runtime

---

## 3. Pattern 3: Objective Grading Criteria

### Problema: subjective quality claims

Modello tende a self-rate troppo alto:
- "Implementation complete!"
- "All tests pass!" (senza CoV 3x verifica)
- "Looks great!" (no objective metric)
- "Score: 9/10" (no benchmark)

### Soluzione: metriche oggettive misurabili

**ELAB benchmark.cjs** — 10 metriche pesate, score 0-10:

```javascript
// scripts/benchmark.cjs
const metrics = [
  { name: "test_coverage", weight: 1.5, source: "vitest --coverage" },
  { name: "build_success", weight: 1.5, source: "npm run build" },
  { name: "lighthouse_perf", weight: 1.0, source: "lighthouse --only-categories=performance" },
  { name: "lighthouse_a11y", weight: 1.0, source: "lighthouse --only-categories=accessibility" },
  { name: "bundle_size", weight: 0.8, source: "vite build --report" },
  { name: "eslint_warnings", weight: 0.7, source: "eslint . --format=json" },
  { name: "typescript_errors", weight: 0.7, source: "tsc --noEmit" },
  { name: "security_audit", weight: 1.0, source: "npm audit --json" },
  { name: "test_count_growth", weight: 0.8, source: "vitest --json" },
  { name: "documentation_completeness", weight: 1.0, source: "custom doc-coverage script" }
];

// Score 0-10, weighted average
const score = computeWeightedScore(metrics);
```

**Output**: `automa/state/benchmark.json` con commit SHA + delta vs run precedente.

### Regola FERREA

Nessuna feature dichiarata "done" senza:
1. `node scripts/benchmark.cjs --write` eseguito
2. Score salvato + commit SHA
3. Delta vs precedente documentato in PR
4. Se delta < 0 (regressione) → blocked merge

### Subjective → Measurable conversion table

| Claim subjective | Metric oggettiva |
|------------------|------------------|
| "Funziona bene" | E2E Playwright spec PASS |
| "Performante" | Lighthouse perf ≥80 |
| "Accessibile" | Lighthouse a11y ≥90 |
| "Sicuro" | npm audit 0 high/critical |
| "Pulito" | ESLint 0 warnings |
| "Tipo-safe" | TypeScript 0 errors |
| "Testato" | Coverage ≥80% per file modified |
| "Documentato" | Doc-coverage ≥70% per nuovo modulo |
| "Bello" | Lighthouse PWA ≥90 + screenshot review umano |
| "Onnipotente" | 30+ tool calls integrate (count func defs) |
| "Onnisciente" | RAG corpus ≥6000 chunk + retrieval recall ≥0.85 |

### AUDITOR agente con grading rigoroso

```yaml
# .claude/agents/team-auditor.md
---
name: team-auditor
description: Audit brutalmente onesto stato sistema. Mai inflation, mai self-claim accept. Live verify tutto.
model: opus
tools: Read, Glob, Grep, Bash, WebFetch, mcp__playwright__*, mcp__Claude_Preview__*
---

# Team AUDITOR — Honest Auditor

## Tue regole (immutabili)

1. **Mai accettare claim senza verifica**
   - Dev dice "test passano" → tu run vitest 3x
   - Dev dice "funziona" → tu live verify Playwright
   - Dev dice "score 8/10" → tu run benchmark.cjs

2. **Mai inflation**
   - Confronta self-claim vs oggettivo
   - Calcola delta inflation
   - Documenta in `docs/audits/YYYY-MM-DD-onesto.md`

3. **Live verify obbligatorio**
   - Per ogni feature user-facing → Playwright headless test
   - Per ogni endpoint → curl response check
   - Per ogni claim "deploy OK" → URL live curl 200

4. **Independent context**
   - Non leggere PR description (bias)
   - Non leggere commit messages (bias)
   - Solo: code diff + actual behavior

## Output finale

File `docs/audits/YYYY-MM-DD-<topic>-onesto.md`:

```
# Audit YYYY-MM-DD — Topic

## Self-claim vs Reality
| Claim | Reality | Delta |
|-------|---------|-------|
| "Score 9/10" | Benchmark 6.3/10 | -2.7 inflation |
| "All tests pass" | 12054/12056 PASS (2 fail intermittent) | flakiness detected |
| "Deploy OK" | URL 200 OK, but TTFB 4.2s (target <2s) | partial |

## Verdetto onesto
- Status: PARTIAL / DONE / NOT DONE / BROKEN
- Score reale: X.X/10
- Gap: [...]
- Action items: [...]
```
```

### Anti-pattern grading

❌ Self-rate senza benchmark.cjs
❌ "Test passano" senza CoV 3x
❌ "Funziona" senza E2E live test
❌ Score >7 senza score real
❌ Inflation pattern recurrente (vedi G45 audit story)

✅ Benchmark script eseguito ogni feature
✅ Auditor agente independent
✅ Onesto > velocità ("score 5.5 onesto" > "score 8 inflato")
✅ Documentazione gap honest in audit doc

---

## 4. Trade-off harness costo vs qualità

Anthropic articolo: "Retro game maker harness cost **20x più** ma deliver measurably superior quality."

### Per ELAB

**Cost upfront harness setup**:
- Settimana 1: 8h setup team agenti + state files + auditor + benchmark
- Cost per Andrea: 8h × 50% capacity = ~16h equivalent
- Beneficio: 8 settimane × ~30h saved/sett = 240h cumulativi
- **ROI**: 16h invest → 240h saved = 15x ROI

**Cost runtime harness**:
- Token consumption: +30-50% vs single agent (ma Max subscription assorbe)
- Wall-clock time: +20% per task (overhead coordination)
- **Beneficio**: -50% rework rate (REVIEWER catch issue prima di merge)

**Net trade-off ELAB**:
- Upfront: pay ~16h equivalent
- Runtime: +30% token (Max OK), +20% time
- Quality gain: -50% rework, +90% confidence (Auditor)
- **VALE LA PENA** investire upfront harness setup

---

## 5. Skills attive per harness ELAB

| Skill | Scope | Use case ELAB |
|-------|-------|---------------|
| `superpowers:using-superpowers` | Workflow base | Ogni sessione |
| `superpowers:test-driven-development` | TDD strict | Ogni feature |
| `superpowers:debugging` | Root cause | Bug T1, regressioni |
| `superpowers:writing-plans` | PDR + handoff doc | Sett 1-8 planning |
| `superpowers:brainstorming` | Tea schema UX | Pre-design feature |
| `superpowers:code-reviewer` | Major step review | Pre-merge ogni PR |
| `claude-code-guide` | Claude Code Q&A | Setup team agenti, hook config |
| `feature-dev:code-architect` | Architecture design | Feature complesse |
| `feature-dev:code-explorer` | Codebase exploration | Indagini ampie |
| `feature-dev:code-reviewer` | Bug + security review | Pre-merge security-critical |
| `pr-review-toolkit:silent-failure-hunter` | Hunt silent failures | Pre-merge ogni PR |
| `pr-review-toolkit:type-design-analyzer` | Type design quality | Pre-merge new types |
| `pr-review-toolkit:comment-analyzer` | Doc accuracy | Post-doc generation |
| `pr-review-toolkit:pr-test-analyzer` | Test coverage gaps | Post-PR creation |
| `code-simplifier:code-simplifier` | Code clarity | Post-implementation |
| `agent-sdk-dev:agent-sdk-verifier-py` | Validate Python agent SDK | Settimana 5-8 |
| `vercel:performance-optimizer` | Vercel perf | Sett 5+ optimization |

---

## 6. Connettori MCP attivi

| MCP | Use case ELAB |
|-----|---------------|
| `plugin_claude-mem_mcp-search` | Build/query corpus passato |
| `plugin_serena_serena` | Semantic codebase exploration |
| `supabase` | DB query, edge function deploy, logs |
| `Claude_Preview` | Live verify UI changes |
| `playwright` | E2E test automation |
| `context7` | Docs aggiornate React 19, Vite 7 |
| `cloudflare` | KV, R2, D1, Workers (sett 6+) |
| `sentry` | Error monitoring + analyze |
| `vercel` | Deploy management |
| `notion` | Tea documentation cross-platform |
| `figma` | Design assets (Tea schema UX) |
| `acrobat` | PDF Vol 1+2+3 manipulation |
| `huggingface-skills:AGENTS` | HF model exploration |

---

## 7. Setup pratico harness — Lunedì 21/04

### Step 1: Verifica Claude Code version
```bash
claude --version  # Required: ≥2.1.32
```

### Step 2: Crea team agenti
```bash
mkdir -p ~/.claude/agents
# Crea 6 file team-*.md (vedi MULTI_AGENT_ORCHESTRATION.md)
```

### Step 3: Setup state files
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
mkdir -p automa/team-state
mkdir -p docs/handoff
mkdir -p docs/audits
mkdir -p docs/architectures
mkdir -p docs/decisions
```

### Step 4: Configura PTC
File `.claude/tools-config.json` con `code_execution_enabled: true` (vedi PROGRAMMATIC_TOOL_CALLING.md).

### Step 5: Configura skills attive
File `.claude/settings.local.json` enable skills ELAB-relevant.

### Step 6: Test dispatch primo agente
```
@team-tpm "Leggi PDR_SETT_1_STABILIZE.md e popola automa/team-state/tasks-board.json con backlog completo settimana 1."
```

### Step 7: Test dispatch parallelo
Single message:
```
@team-architect "Design blueprint Dashboard MVP."
@team-tester "Smoke test E2E homepage."
@team-auditor "Audit live produzione: 6 bug T1 reali confermati?"
```

### Step 8: Documenta in handoff
```markdown
# Handoff Day 1 — 2026-04-21

## Stato setup harness
- [x] Claude Code v2.1.32+ verificato
- [x] 6 team agenti Opus creati
- [x] State files inizializzati
- [x] PTC config OK
- [x] Skills attive
- [x] Test dispatch single OK
- [x] Test dispatch parallelo OK

## Sett 1 può iniziare martedì 22/04 con harness operativo.
```

---

## 8. Misurazione efficacia harness

### KPI settimanali

| KPI | Target sett 1 | Target sett 8 |
|-----|---------------|---------------|
| Dispatch team giornalieri | ≥5 | ≥15 |
| % task completati via team (vs Andrea solo) | ≥30% | ≥70% |
| Rework rate (REVIEWER REJECT) | ≤30% | ≤10% |
| Test scritti da TESTER (vs Andrea) | ≥40% | ≥80% |
| Audit AUDITOR onestà gap (vs claim) | ≤1.0 | ≤0.3 |
| Team capacity utilization | ≥40% | ≥75% |
| Decision documented (decisions-log.md) | ≥10 | ≥80 cumulative |
| Handoff doc completi (no missing fields) | ≥6/7 days | ≥7/7 days |
| Context anxiety incidents (chat troncata) | ≤2/sett | ≤0/sett |
| Score benchmark.cjs growth | +1.0/sett | +0.3/sett (asymptote) |

---

## 9. Sources

- [Effective harnesses for long-running agents — Anthropic Nov 2025](https://www.anthropic.com/engineering/effective-harnesses-long-running-agents)
- [Harness design for long-running apps — Anthropic Mar 2026](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- [Building effective agents — Anthropic Dec 2024](https://www.anthropic.com/engineering/building-effective-agents)
- [Effective context engineering — Anthropic Sep 2025](https://www.anthropic.com/engineering/effective-context-engineering)
- [How we built our multi-agent research system — Anthropic Jun 2025](https://www.anthropic.com/engineering/multi-agent-research-system)
- [The "think" tool — Anthropic Mar 2025](https://www.anthropic.com/engineering/think-tool)
- [Equipping agents with Skills — Anthropic Oct 2025](https://www.anthropic.com/engineering/equipping-agents-with-skills)

---

## 10. **HARNESS 2.0 — Anthropic Apr 2026 (ULTIMI ARTICOLI)**

### Fonti
- [Harness design for long-running application development — Anthropic Apr 2026](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- [Scaling Managed Agents — Anthropic Apr 2026](https://www.anthropic.com/engineering/managed-agents)
- [Anthropic Three-Agent Harness — InfoQ 04/2026](https://www.infoq.com/news/2026/04/anthropic-three-agent-harness-ai/)
- [GAN-Style Agent Loop — Epsilla Blog](https://www.epsilla.com/blogs/anthropic-harness-engineering-multi-agent-gan-architecture)
- [Anthropic Harness Engineering Two Agents Zero Context Overflow — Rick Hightower Mar 2026](https://medium.com/@richardhightower/anthropics-harness-engineering-two-agents-one-feature-list-zero-context-overflow-7c26eb02c807)
- [5 Harness Layers Managed Agent — Han HELOIR Apr 2026](https://medium.com/data-science-collective/anthropic-just-shipped-three-of-the-five-harness-layers-for-managed-agent-and-the-other-two-are-on-14979cb4cf00)
- [2025 Was Agents. 2026 Is Agent Harnesses — Aakash Gupta](https://aakashgupta.medium.com/2025-was-agents-2026-is-agent-harnesses-heres-why-that-changes-everything-073e9877655e)

### Tre-Agent Harness (Planner + Generator + Evaluator) — GAN-style

**Architettura**:
- **Planner**: espande prompt → spec dettagliata, scope + direzione tecnica (NO granular implementation)
- **Generator**: implementa feature iterativo dentro **sprint contracts**
- **Evaluator**: testa via **Playwright MCP**, valida contro contracts, fornisce feedback

**Key insight Anthropic**: "Every component in a harness encodes an assumption about what the model can't do on its own. Worth stress testing — remove components one at a time, identify load-bearing."

### Sprint Contract Pattern (NUOVO)

**Pre-implementation**, Generator + Evaluator **negoziano acceptance criteria**:
- Feature definitions specifiche
- Test conditions (esempio Anthropic: **27+ criteri per sprint**)
- API endpoint specs
- Edge case handling

**ELAB application**:
- Ogni task >2h sett 1-8 = sprint contract scritto in `automa/team-state/sprint-contracts/<task-id>.md`
- DEV + TESTER + REVIEWER firmano contract PRIMA di code
- AUDITOR finale verifica tutti criteri met (no skip)

### Context Resets > Compaction (Sonnet 4.5 era)

**Statement Anthropic**: "Context resets — clearing the context window entirely + structured handoff carrying previous agent state — addresses both context anxiety and coherence loss."

**Opus 4.5+** (e successivi): "largely eliminated context anxiety natively" → reset meno critico ma handoff strutturato sempre obbligatorio.

**ELAB rule**:
- Sett 1-8: handoff doc + claude-progress.txt obbligatori
- Reset preventivo se context >70% (vedi sezione 2 sopra)
- Opus 4.7 (current Andrea) = context anxiety ridotto ma harness pattern still apply

### claude-progress.txt — state recovery file

**Pattern Anthropic**: file `claude-progress.txt` + git history = stato runtime recoverable da agente fresco con context vuoto.

**Template ELAB** (`automa/state/claude-progress.txt`):
```
# Claude Progress — Last Updated: 2026-04-21T17:30:00Z

## Current Sprint
- Sprint: sett-1-stabilize
- Day: 1
- Last commit: <SHA>
- Branch: feature/pdr-ambizioso-8-settimane

## Completed Tasks (this session)
- T1-001: bug T1 #1 lavagna empty fix (PR #N merged)
- T1-002: ...

## In-Progress Tasks
- T1-003: ... (DEV started, blueprint at docs/architectures/...)

## Carry-Over Tomorrow
- T1-004: ...

## Critical State
- Test count: 12056 PASS
- Build: PASS
- Score: 5.4/10
- Quota Max usage: 12% week

## Next Action
- Read PDR_GIORNO_02_MAR_22APR.md
- Dispatch @team-tpm standup 9:00
- Continue T1-003 ARCHITECT blueprint review
```

### 4 Grading Criteria Subjective (NUOVO)

Per task **subjective** (no metric oggettiva immediata):
1. **Design quality** (coherent visual identity)
2. **Originality** (custom decisions vs templates)
3. **Craft** (typography, spacing, color harmony)
4. **Functionality** (usability, task completion)

**ELAB application**:
- UNLIM response evaluation: 4 criteri (Principio Zero compliance + linguaggio bambini + analogia quality + brevity)
- Lavagna UX evaluation: 4 criteri (clarity + originality + craft + usability)
- Report fumetto evaluation: 4 criteri (visual coherence + originality + craft + readability)

**Evaluator tuning**: "must be tuned to be skeptical" — modelli tendono lenient self-assessment. ELAB AUDITOR già è "brutalmente onesto" pattern.

### Brain/Hands Decoupling (Managed Agents Apr 2026)

**3 componenti virtualizzati** (NON 5 layer come articolo Han HELOIR):
1. **Session**: append-only log everything happened
2. **Harness**: loop calls Claude + routes tool calls
3. **Sandbox**: execution environment Claude runs code + edits files

**Brain (Claude + Harness)** ≠ **Hands (Sandbox + Tools)**:
- Harness stateless → sopravvive container failures
- `wake(sessionId)` + `getSession(id)` per resume
- Sandbox interchangeable via `execute(name, input)` interface
- Failed container → tool-call error → Claude retry fresh provisioning
- **Credentials NEVER reach sandboxes** (security boundary)

**Performance impact decoupling**: TTFT **-60% p50, -90% p95** (eliminata container init delay).

### Cosa Anthropic SHIPS vs USER IMPLEMENTS

**Anthropic provides**:
- Durable session logging
- Resilient harness orchestration
- Standardized tool/MCP integration interfaces
- Credential isolation mechanisms

**User implements** (= ELAB Andrea responsibility):
- Task-specific harnesses (Claude Code agents)
- Custom tools (33 tool ELAB sett 5)
- Domain-specific context engineering (Principio Zero v3, RAG ELAB-specific)

### Cost vs Quality Trade-off — numbers Anthropic

**Retro Game Maker comparison**:
| Approach | Time | Cost | Output |
|----------|------|------|--------|
| Solo run | 20 min | $9 | **Broken core functionality** |
| Full harness | 6 h | $200 | **Complete, playable application** |

**Multiplier**: 20x time + 22x cost → infinitely better quality.

**DAW (Digital Audio Workstation) example**:
- Total: 3h 50min, $124.70
- Planner phase: 4.7 min, $0.46
- 3 build/QA cycles, decreasing iterations

**ELAB takeaway**: investire upfront in harness setup paga in qualità finale. Andrea's €333/8sett vs €5000 originale = già conservative per qualità target.

### Iterative Simplification (NUOVO principio)

**Anthropic guidance**: "Removing components one at a time to identify which remain load-bearing."

**ELAB application sett 8 retro**:
- Lista 6 team agenti
- Per ognuno chiedi: "se rimuovo, cosa break?"
- Se nothing break → remove (overhead non giustificato)
- Se break → keep, document criticality

### Aggiornamenti immediati ELAB Harness 2.0

**Priorità ALTA (sett 1)**:
1. ✅ Adottare `automa/state/claude-progress.txt` (NUOVO file)
2. ✅ Adottare Sprint Contract pattern per task >2h
3. ✅ AUDITOR usa 4 grading criteria (calibrato skeptical)
4. ✅ Playwright MCP per Evaluator (già pianificato sett 1 audit)

**Priorità MEDIA (sett 2-4)**:
5. Brain/Hands decoupling: Edge Function = Brain, Cloudflare Worker/Hetzner container = Hands
6. Session log persistente (Supabase tabella `agent_sessions`)
7. Credential vault separato (Supabase secrets, NON in code)

**Priorità BASSA (sett 5-8)**:
8. Wake/getSession resume API
9. Sandbox interchangeable interface
10. Iterative simplification retro sett 8

---

## 11. Forza ELAB. Harness 2.0 operativo da sett 1.

3 pattern originali + Harness 2.0 Apr 2026 + 6 team agenti Opus + Sprint Contract + claude-progress.txt + 4 grading criteria + Brain/Hands decoupling = production-grade harness 2.0 per ELAB v1.0.

**Mantra Anthropic**: *"It wasn't a smarter model but a smarter environment around the model."*

**Mantra ELAB**: *"Andrea + Tea + 6 Opus agenti + harness 2.0 = team production-grade. No solo developer."*
