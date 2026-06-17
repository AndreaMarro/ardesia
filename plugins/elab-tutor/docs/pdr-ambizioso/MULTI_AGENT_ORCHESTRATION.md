# Multi-Agent Orchestration — Team Agenti Opus (peer)

**Versione**: 1.0
**Data**: 2026-04-20
**Owner**: Andrea Marro
**Paradigma**: TEAM peer-to-peer di agenti Opus, NON subagent gerarchici

---

## 0. Cambio paradigma — TEAM non subagent

### Vecchio modello (subagent gerarchico) — RIFIUTATO

```
        Lead Agent (Opus)
              │
        ┌─────┼─────┐
        ▼     ▼     ▼
    Subagent Subagent Subagent
    (Sonnet) (Sonnet) (Haiku)
```

**Limiti**:
- Subagent context = scratch (no memoria persistente)
- Lead = collo di bottiglia (sintesi seriale)
- Subagent = "esecutori" non "decisori"
- Tier inferiore (Sonnet/Haiku) = decisioni meno robuste

### Nuovo modello (TEAM peer Opus) — ADOTTATO

```
        ┌──────────────────────────────────────┐
        │  SHARED STATE (automa/team-state/)   │
        │  Kanban + decisions + standup        │
        └──────────────────────────────────────┘
               ▲ peer read/write ▲
        ┌──────┼──────┬──────┬───┴──┬─────────┐
        │      │      │      │      │         │
       TPM  ARCHITECT DEV  TESTER REVIEWER  AUDITOR
       Opus    Opus  Opus   Opus    Opus     Opus
        │      │      │      │      │         │
        └──────┴──────┴──────┴──────┴─────────┘
                      Peer coordination
```

**Vantaggi**:
- Tutti Opus = decisioni omogeneamente robuste
- Coordinazione peer-to-peer = no collo di bottiglia
- Stato persistente in file = memoria team cross-session
- Ruoli specializzati ma simmetrici (no gerarchia)
- Andrea = facilitator/integrator (non lead-bottleneck)

**Ispirazione articoli Anthropic**:
- "Multi-agent research system" (Jun 2025) — +90.2% perf vs single
- "Managed Agents scaling" — brain/hands decoupling
- "Effective harnesses long-running agents" (Nov 2025) — context resets via file handoffs
- "Building effective agents" (Dec 2024) — foundational pattern

---

## 1. Composizione team (6 agenti Opus)

### Agente 1: TPM — Technical Project Manager

**Modello**: Opus 4
**File**: `.claude/agents/team-tpm.md`
**Tools**: Read, Write, Edit, Glob, Grep, Bash, TodoWrite, mcp__plugin_claude-mem_mcp-search__*

**Ruolo**:
- Pianifica sprint settimanali (legge `PDR_SETT_N.md`)
- Daily standup mattina (genera `daily-standup.md`)
- Scrive task in `tasks-board.json` colonna `todo` con priorità
- Verifica completion criteria di ogni task `done`
- Aggiorna `decisions-log.md` decisioni team
- Identifica blocker → flagga in `blockers.md`
- **Mai scrive codice applicativo o test**

**Deliverables**:
- `automa/team-state/tasks-board.json` aggiornato
- `automa/team-state/daily-standup.md` aggiornato
- `automa/team-state/decisions-log.md` aggiornato
- `automa/team-state/blockers.md` aggiornato

**Quando dispatch**:
- Lunedì 9:00 mattina (sprint planning)
- Ogni mattina 9:00 (daily standup)
- Ogni sera 18:00 (verifica done)

---

### Agente 2: ARCHITECT — Software Architect

**Modello**: Opus 4
**File**: `.claude/agents/team-architect.md`
**Tools**: Read, Glob, Grep, NotebookRead, mcp__plugin_serena_serena__*, mcp__context7__*, WebFetch

**Ruolo**:
- Disegna architettura feature complessa (>3 file impatto)
- Decide pattern (state machine, observer, factory, etc.)
- Produce blueprint in `docs/architectures/<feature>.md`
- Diagrammi mermaid per data flow
- Review architectural impact PR (verdetto NEEDS_REDESIGN/APPROVED)
- Identifica tech debt + propone refactor
- **Scrive solo specs/diagram/blueprint** (no implementation)

**Deliverables**:
- `docs/architectures/<feature>.md` blueprint
- Diagrammi mermaid embedded
- Decisions ADR-style in `docs/decisions/ADR-NNN-<topic>.md`

**Quando dispatch**:
- Pre-Dev su feature >2h stimate
- Pre-merge PR architectural-impact
- Refactor planning sessions

---

### Agente 3: DEV — Senior Developer

**Modello**: Opus 4
**File**: `.claude/agents/team-dev.md`
**Tools**: Read, Write, Edit, Glob, Grep, Bash, mcp__plugin_serena_serena__*, mcp__supabase__*

**Ruolo**:
- Implementa feature da blueprint Architect
- TDD strict (RED-GREEN-REFACTOR)
- Test minimi inline (smoke + happy path)
- Commit atomici con `tipo(area): descrizione`
- Apre PR con `gh pr create`
- **Mai self-merge** (sempre PR review)
- Risponde rework feedback Reviewer

**Deliverables**:
- File modificati `src/`, `supabase/`, `scripts/`
- Test inline `tests/unit/<feature>.test.js`
- PR aperta con descrizione completa

**Quando dispatch**:
- Task `tasks-board.json` con `assigned_to: dev`
- Implementazione blueprint Architect

---

### Agente 4: TESTER — QA Engineer

**Modello**: Opus 4
**File**: `.claude/agents/team-tester.md`
**Tools**: Read, Write, Edit, Glob, Grep, Bash, mcp__playwright__*, mcp__Claude_Preview__*

**Ruolo**:
- Scrive test vitest unit + integration esaustivi (oltre minimi inline Dev)
- Scrive test E2E Playwright per ogni feature user-facing
- CoV 3x esecuzione + report flakiness
- Test edge case + error path
- A11y test (WCAG AA)
- Performance test (Lighthouse)
- **Mai scrive codice applicativo** (solo `tests/**`)

**Deliverables**:
- `tests/integration/<feature>.test.js`
- `tests/e2e/<feature>.spec.js`
- `tests/a11y/<feature>.test.js`
- Report CoV in PR comment

**Quando dispatch**:
- Post-Dev (sempre, task `ready_for_test`)
- Pre-merge (sempre, gate quality)

---

### Agente 5: REVIEWER — Code Reviewer

**Modello**: Opus 4
**File**: `.claude/agents/team-reviewer.md`
**Tools**: Read, Glob, Grep, NotebookRead, Bash, WebFetch

**Ruolo**:
- Code review pre-merge
- Verifica governance compliance (CoV, test count, build PASS)
- Hunt silent failures, type issues, security vulnerabilities
- Comment accuracy verification
- Verdetto APPROVE/REJECT/REQUEST_CHANGES
- Scrive review in PR comment strutturato
- **Mai scrive codice** (solo critique)

**Deliverables**:
- PR review comment
- Verdetto in `tasks-board.json` (`status: approved` o `rework`)
- Eventuale `docs/reviews/<pr>-review.md` per review profonde

**Quando dispatch**:
- Pre-merge ogni PR (mandatory)
- Periodic refactor audit

---

### Agente 6: AUDITOR — Honest Auditor

**Modello**: Opus 4
**File**: `.claude/agents/team-auditor.md`
**Tools**: Read, Glob, Grep, Bash, WebFetch, mcp__playwright__*, mcp__Claude_Preview__*

**Ruolo**:
- Audit **brutalmente onesto** stato sistema
- Verifica live (no claim non testati)
- Genera score benchmark.cjs
- Confronta self-claim vs realtà
- Identifica inflation pattern
- Audit retro fine settimana
- **Independent: non vede output Dev/Tester** (no bias)

**Deliverables**:
- `docs/audits/YYYY-MM-DD-<topic>-onesto.md`
- Score benchmark verificato (no inflation)
- Lista gap honest vs claim

**Quando dispatch**:
- Fine settimana (sabato/domenica)
- Pre-release v1.0
- Quando sospetto inflation score

---

## 2. Shared state — `automa/team-state/`

### File 1: `tasks-board.json` (Kanban)

```json
{
  "sprint": "sett-1-stabilize",
  "updated_at": "2026-04-21T09:00:00Z",
  "columns": {
    "backlog": [
      {
        "id": "T1-001",
        "title": "Bug T1 #1: lavagna vuota non selezionabile",
        "priority": "P0",
        "estimated_hours": 3,
        "files_impacted": ["src/components/lavagna/LavagnaShell.jsx"],
        "depends_on": []
      }
    ],
    "todo": [
      {
        "id": "T1-002",
        "title": "Bug T1 #2: scritti spariscono su Esci",
        "priority": "P0",
        "assigned_to": "architect",
        "started_at": null
      }
    ],
    "in_progress": [
      {
        "id": "T1-003",
        "title": "Foto TRES JOLIE batch import",
        "priority": "P1",
        "assigned_to": "dev",
        "started_at": "2026-04-21T10:30:00Z",
        "blueprint": "docs/architectures/photo-batch-import.md"
      }
    ],
    "ready_for_test": [],
    "ready_for_review": [],
    "approved": [],
    "merged": [],
    "rework": []
  }
}
```

### File 2: `daily-standup.md`

```markdown
# Daily Standup — 2026-04-21

## Ieri
- (sett start, no ieri)

## Oggi
- TPM: sprint planning sett 1, dispatch task
- ARCHITECT: blueprint Dashboard MVP layout
- DEV: T1-001 bug lavagna vuota
- TESTER: scrivi spec E2E lavagna empty state
- REVIEWER: stand-by (no PR aperte)
- AUDITOR: pre-audit live produzione (Playwright)

## Blocker
- Nessuno (sprint start)

## Note
- Tea onboarding mer 23/04
```

### File 3: `decisions-log.md`

```markdown
# Decisions Log — Team ELAB

## 2026-04-21 — DECISION-001 — Tier modello agenti
**Decisore**: Andrea + TPM
**Contesto**: User direttiva "team agenti Opus"
**Decisione**: Tutti 6 agenti Opus 4. No fallback Sonnet/Haiku salvo rate limit Anthropic.
**Razionale**: massima qualità decisioni, omogeneità tier, ridondanza brain
**Conseguenze**: cost potenziale alto, monitor usage settimanale

## 2026-04-21 — DECISION-002 — Programmatic tool calling primo use case
**Decisore**: Andrea + ARCHITECT
**Contesto**: 92 foto TRES JOLIE da convertire
**Decisione**: code_execution sandbox con asyncio gather, NO 92 tool call separate
**Razionale**: -200K token context, scalabilità futura batch ops
**Conseguenze**: setup `.claude/tools-config.json` necessario
```

### File 4: `blockers.md`

```markdown
# Blockers — Open

## BLOCKER-001 (closed 2026-04-22)
- Issue: Render cold start 18s blocca test E2E voice
- Impacted: T1-006 voice testing
- Owner: DEV
- Resolution: warmup ping ogni 10 min via cron Cloudflare Worker
- Closed: 2026-04-22 14:30
```

### File 5: `team-roster.md`

```markdown
# Team Roster

| Ruolo | Agente file | Modello | Capacity giornaliera |
|-------|-------------|---------|----------------------|
| TPM | team-tpm.md | Opus 4 | 2h coordination |
| ARCHITECT | team-architect.md | Opus 4 | 4h design |
| DEV | team-dev.md | Opus 4 | 6h implementation |
| TESTER | team-tester.md | Opus 4 | 4h test writing |
| REVIEWER | team-reviewer.md | Opus 4 | 2h review |
| AUDITOR | team-auditor.md | Opus 4 | on-demand audit |

Totale capacity: ~18h/giorno potenziale (vs 8h Andrea solo).
Ratio multiplier: ~2.25x (con overhead coordination).
```

---

## 3. Workflow team — daily flow

### Mattina 9:00 (Andrea avvia sessione)

```bash
# Andrea launch
claude --permission-mode bypassPermissions --model opus

# Prima azione: dispatch TPM
@team-tpm "Leggi tasks-board.json, scrivi daily-standup.md per oggi.
Sprint corrente: sett-1-stabilize.
Andrea capacity: 8h.
Tea capacity: oggi (mer 23/04) 4h."
```

TPM scrive standup + aggiorna board.

### Daily work (parallel dispatch)

Andrea legge standup, decide dispatch parallelo:

```
[single message, 3 paralleli]
@team-architect "Design blueprint feature X. Output docs/architectures/feature-x.md"
@team-dev "Take task T1-001 from tasks-board.json, implement TDD strict"
@team-tester "Write E2E spec for bug T1 #1, ready by 14:00"
```

Andrea integra output, gestisce conflict git, push commit.

### Pre-merge (sempre)

Per ogni PR aperta da DEV:

```
@team-reviewer "Review PR #N. Check: governance compliance, silent failures,
type design, comment accuracy, security. Verdetto APPROVE/REJECT/REQUEST_CHANGES.
Output: PR comment + tasks-board.json status update."
```

Se APPROVE → Andrea merge.
Se REJECT → DEV rework (TPM aggiorna board).

### Sera 18:00 (Andrea chiude sessione)

```
@team-tpm "Verifica board fine giornata. Chiudi task done.
Aggiorna decisions-log.md con decisioni di oggi.
Prepara standup di domani in daily-standup.md."

@team-auditor "Quick audit: build PASS? test count? score benchmark?
Output 3 righe sintesi."
```

Andrea scrive handoff doc + git push + chiude sessione.

---

## 4. Pattern dispatch parallelo (Anthropic +90.2%)

### Esempio reale: Bug T1 batch (martedì 22/04)

**Single message Andrea, 6 agenti dispatch parallelo**:

```
[Agent block 1] @team-architect
"Design blueprint per fix bug T1 #1 e #2 (lavagna empty state + persistenza Esci).
Identifica root cause LavagnaShell.jsx + localStorage pattern.
Output: docs/architectures/lavagna-fixes-t1.md"

[Agent block 2] @team-dev  
"PARALLEL TO ARCHITECT - inizia leggere LavagnaShell.jsx + state mgmt.
Aspetta blueprint Architect prima di modificare.
Output: ack ricezione + analisi current state."

[Agent block 3] @team-tester
"Scrivi E2E Playwright spec per bug T1 #1 (lavagna vuota click).
Spec deve fallire su current main (verifica RED).
Output: tests/e2e/lavagna-empty-state.spec.js"

[Agent block 4] @team-tester (2nd dispatch)
"Scrivi E2E Playwright spec per bug T1 #2 (persistenza Esci).
Spec deve fallire su current main.
Output: tests/e2e/lavagna-persistence.spec.js"

[Agent block 5] @team-reviewer
"Stand-by. Aspetta apertura PR T1-001 e T1-002.
Quando ready, review profondo."

[Agent block 6] @team-auditor
"Live verify produzione bug T1 #1 e #2 esistono.
Use Playwright MCP. Output: docs/audits/2026-04-22-bug-t1-confirm.md"
```

Andrea aspetta tutti completion (background runs OK), poi:
1. Legge blueprint Architect
2. Forward blueprint a DEV per implementation
3. DEV apre PR
4. Reviewer dispatch
5. Merge

**Tempo totale**: ~4h con team vs ~10h Andrea solo. Multiplier ~2.5x.

---

## 5. Anti-pattern (da evitare)

### ❌ Anti-pattern 1: Dispatch senza prompt self-contained

WRONG:
```
@team-dev "fai la feature"
```

RIGHT:
```
@team-dev "Implement task T1-005 (Dashboard MVP shell).
Blueprint: docs/architectures/dashboard-mvp.md (ARCHITECT done).
Files to modify: src/components/dashboard/DashboardShell.jsx (NEW).
Tests inline: tests/unit/dashboard/DashboardShell.test.jsx.
Acceptance: render senza crash + 3 tab visibili (Sessioni/Studenti/Esperimenti).
Constraints: zero npm dep, zero file critici modificati."
```

### ❌ Anti-pattern 2: 2 agenti stesso file

WRONG:
```
@team-dev "modifica LavagnaShell.jsx fix bug 1"
@team-dev "modifica LavagnaShell.jsx fix bug 2" (stesso file, race condition)
```

RIGHT:
```
@team-dev "modifica LavagnaShell.jsx fix bug 1 + 2 (entrambi LavagnaShell, same task)"
```

### ❌ Anti-pattern 3: Skip TPM coordination

WRONG: Andrea dispatch DEV direttamente senza task in board → caos
RIGHT: Sempre TPM aggiunge task in board PRIMA di DEV dispatch

### ❌ Anti-pattern 4: REVIEWER bias

WRONG: REVIEWER vede commit DEV mentre review (bias positive)
RIGHT: REVIEWER prompt esplicito "ignore commit messages, focus on code change diff"

### ❌ Anti-pattern 5: AUDITOR co-dipendente

WRONG: AUDITOR usa stesso prompt context Andrea (bias)
RIGHT: AUDITOR sempre fresh dispatch + tools indipendenti (Playwright vs claim)

---

## 6. Capacity planning team (settimanale)

### Capacity teorica vs reale

| Settimana | Andrea (h) | Tea (h) | Team agenti (h) | Totale capacity (h) |
|-----------|------------|---------|-----------------|---------------------|
| Sett 1 | 50 | 8 | 90 (6 agenti × 15h) | **148h teorica** |
| Sett 2 | 50 | 12 | 90 | **152h teorica** |
| Sett 3 | 50 | 12 | 90 | **152h teorica** |
| Sett 4 | 50 | 12 | 90 | **152h teorica** |
| Sett 5 | 50 | 12 | 90 | **152h teorica** |
| Sett 6 | 50 | 12 | 90 | **152h teorica** |
| Sett 7 | 50 | 12 | 90 | **152h teorica** |
| Sett 8 | 50 | 16 | 90 | **156h teorica** |
| **TOTALE 8 sett** | **400** | **96** | **720** | **1216h teorica** |

**Realistic discount** (overhead coordination, errori, rework):
- Multiplier reale: ~0.4 capacity teorica = **~486h utili**

vs Andrea solo: 50h × 8 sett = **400h**

**Net gain con team**: +86h utili (~22% extra) = +130h cumulativi se anche Tea (~108% extra).

### Cost monitoring Opus tier

Andrea Claude Code Max include Opus quota generosa, ma team 6 agenti × dispatch giornaliero = monitor mandatory:

```bash
# Daily check usage (Andrea ogni mattina)
claude usage --period today

# Settimanale check (TPM dispatch)
@team-tpm "Verifica usage Opus settimana. Output token spent + costo stimato."
```

**Soft limit**: se Opus usage >80% Max plan a metà settimana → fallback Sonnet su task non-critici (Tester scrittura test routinari, Reviewer PR docs-only).

---

## 7. Escalation pattern (quando team non basta)

### Livello 1: Team interno
- 6 agenti gestiscono autonomamente

### Livello 2: Specialized subagent (raro)
Dispatch agent SDK pre-built per task specifici:
- `feature-dev:code-explorer` per indagini codebase massive
- `pr-review-toolkit:silent-failure-hunter` per security audit profondo
- `superpowers:code-reviewer` per major step review

### Livello 3: Andrea + Tea sync call
Se 2 livelli sopra non bastano:
- Call Telegram voice 30 min
- Decisione human-in-the-loop
- Aggiorna `decisions-log.md`

### Livello 4: External expert
Casi estremi (sicurezza, legal, GDPR avvocato):
- Andrea contatta esperto esterno
- Pagamento ad-hoc (budget riserva €200/mese)

---

## 8. Setup pratico — Lunedì 21/04 mattina

### Step 1: Crea `.claude/agents/team-*.md` (6 file)

Andrea crea file YAML+markdown ogni agente (template forniti sopra).

### Step 2: Crea `automa/team-state/` directory

```bash
mkdir -p "automa/team-state"
cd "automa/team-state"
```

Crea 5 file iniziali:
- `tasks-board.json` (con backlog sett 1)
- `daily-standup.md` (template)
- `decisions-log.md` (vuoto + intestazione)
- `blockers.md` (vuoto + intestazione)
- `team-roster.md` (statico)

### Step 3: Test dispatch primo agente

```
@team-tpm "Leggi PDR_SETT_1_STABILIZE.md e popola tasks-board.json con backlog completo settimana 1.
Output: tasks-board.json aggiornato + ack scritto."
```

Verifica TPM scrive correttamente. Se OK → procedi con altri 5.

### Step 4: Test dispatch parallelo

Single message:
```
@team-architect "Design blueprint Dashboard MVP. Read CLAUDE.md per stack."
@team-tester "Scrivi smoke test E2E homepage carica."
@team-auditor "Audit live produzione: lista 6 bug T1 reali."
```

3 agenti in parallelo. Andrea verifica nessuno crashed.

### Step 5: Documenta in handoff

Andrea scrive `docs/handoff/2026-04-21-end-day.md`:
- Team setup OK
- Dispatch test OK
- Sett 1 work può iniziare martedì 22/04 con team operativo

---

## 9. KPI team — misurazione settimanale

| KPI | Target sett 1 | Target sett 8 |
|-----|---------------|---------------|
| Dispatch giornalieri team | ≥5 | ≥15 |
| % task completati via team (vs Andrea solo) | ≥30% | ≥70% |
| Rework rate (REVIEWER REJECT) | ≤30% | ≤10% |
| Test scritti da TESTER (vs Andrea) | ≥40% | ≥80% |
| Audit AUDITOR onestà score (vs claim) | gap ≤1.0 | gap ≤0.3 |
| Team capacity utilization | ≥40% | ≥75% |
| Decision documented (decisions-log.md) | ≥10 | ≥80 cumulative |

---

## 10. Riferimenti articoli Anthropic

| Articolo | Insight chiave applicato |
|----------|--------------------------|
| Multi-agent research system (Jun 2025) | +90.2% perf con multi-agent. Ispirazione team peer. |
| Effective harnesses long-running agents (Nov 2025) | File-based handoffs. Context resets evitati. |
| Building effective agents (Dec 2024) | Foundational: chains, routing, parallelization, orchestrator. |
| Equipping agents with Skills (Oct 2025) | Skills attive per ogni agente (TDD, debugging, brainstorming). |
| Effective context engineering (Sep 2025) | claude-mem persistence + handoff doc strutturati. |
| Managed Agents scaling (no date) | Brain (Architect/TPM/Reviewer) / Hands (Dev/Tester) decoupling. |
| Advanced tool use programmatic (Nov 2025) | -37% token batch ops via code execution. |
| Harness design long-running apps (Mar 2026) | 3 pattern (multi-agent + context mgmt + objective grading). |
| The "think" tool (Mar 2025) | Architect e Reviewer hanno think prima di output. |

---

## 11. Web Research findings (2026-04-20) — best practices community + Anthropic

### Distinzione UFFICIALE Anthropic: Agent Teams vs Subagents

Fonte: [Claude Code Docs — Agent Teams](https://code.claude.com/docs/en/agent-teams) + [Sub-Agent vs Agent Team — Medium](https://medium.com/data-science-collective/sub-agent-vs-agent-team-in-claude-code-pick-the-right-pattern-in-60-seconds-e856e5b4e5cc)

| Pattern | Subagents (legacy) | Agent Teams (NUOVO v2.1.32+) |
|---------|--------------------|-----------------------------|
| Comunicazione | Solo verso lead (return result) | Peer-to-peer diretta |
| Context | Singola sessione (scratch) | Ognuno suo context window persistente |
| Coordinazione | Lead = collo di bottiglia | Self-coordinated via shared state |
| Use case | Quick focused worker | Teammates condividono findings, challenge each other |
| Setup | `.claude/agents/` markdown | Stessa cartella + Claude Code ≥2.1.32 |

**Direttiva user (20/04)**: "team agenti, non sub agents" → adottiamo **Agent Teams** ufficiale.

**Requisito mandatory**: verifica `claude --version` ≥ 2.1.32. Se inferiore: `npm install -g @anthropic-ai/claude-code@latest`.

### Pattern ufficiale Anthropic Multi-Agent Research System (Jun 2025)

Fonte: [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)

**Architettura concreta**:
- Lead = **Opus 4** (planning, synthesis, decision)
- Subagents = **Sonnet 4** (execution, parallel exploration)
- Performance: +**90.2%** vs single-agent Opus 4
- Token usage = **80% della varianza performance** (più importante di qualunque altra cosa)

**Parallelization strategy chiave**:
1. Lead spawns **3-5 subagents in parallelo** (NON serial, NON 50)
2. Ogni subagent usa **3+ tools in parallel** (asyncio gather)
3. Reduced research time fino a -90% per query complesse

**Errori early Anthropic** (da NON ripetere):
- Spawn 50 subagent per query semplice
- Subagent search web infinito per source inesistenti
- Subagent distratti da update reciproci eccessivi

**Mitigazione adottata ELAB**:
- Cap 5 subagent dispatch per task
- Time-box 30 min per subagent (auto-kill se overrun)
- Subagent prompt self-contained no chat reciproca durante esecuzione

### Best practices community (30 Tips John Kim + addyosmani.com)

Fonte: [30 Tips for Claude Code Agent Teams](https://getpushtoprod.substack.com/p/30-tips-for-claude-code-agent-teams) + [Code Agent Orchestra — addyosmani](https://addyosmani.com/blog/code-agent-orchestra/)

**Top 10 tips applicate ELAB**:

1. **Plan-mode mandatory PRIMA di execution**
   "If you like to use Claude Code without plan mode and just straight execution, agent teams is probably not for you."
   → ELAB: TPM dispatch SEMPRE inizia con `EnterPlanMode` per task >2h

2. **Quality bar passata esplicita a ogni agente**
   "Make sure you have a very high quality bar for all of the code, tell all the subagents to maintain this standard."
   → ELAB: ogni dispatch include `QUALITY_BAR: TDD strict, CoV 3x, no inflation, score ≥6.0`

3. **Cost optimization per ruolo**
   "Debugger Opus, UI perf Sonnet, UX quality Haiku."
   → ELAB rebalance: Architect/Reviewer/Auditor/TPM = Opus; Dev/Tester = Sonnet (cost cut 60%)

4. **Independent context obbligatorio**
   "Subagents operate in parallel and maintain their own context."
   → ELAB: ogni team agent ha file `.claude/agents/team-X.md` separato, no shared in-memory

5. **3-5 subagent cap**
   "Lead spawns 3-5 subagents in parallel rather than serially."
   → ELAB: regola hard cap, mai >5 dispatch single message

6. **Token usage monitoring weekly**
   "Token usage by itself explains 80% of the variance in performance."
   → ELAB: TPM weekly dispatch `claude usage --period week` + commit a `team-state/`

7. **Agent teams aggiungono overhead**
   "Agent teams add coordination overhead and use significantly more tokens than a single session."
   → ELAB: usare team SOLO per task >2h, sotto Andrea solo

8. **Non per same-file edits**
   "For sequential tasks, same-file edits, or work with many dependencies, a single session or subagents are more effective."
   → ELAB: stesso file = single session Andrea (CircuitSolver, AVRBridge, etc.)

9. **Interleaved thinking dopo tool result**
   "Subagents also plan, then use interleaved thinking after tool results to evaluate quality, identify gaps, and refine their next query."
   → ELAB: ogni team agent template include `<thinking>` block dopo ogni tool use

10. **Separation of concerns radicale**
    "Each subagent provides separation of concerns—distinct tools, prompts, and exploration trajectories."
    → ELAB: tools list per agente è restrittiva (Architect: read-only; Dev: Read+Write+Edit; Tester: Bash+Playwright; Reviewer: read-only)

### Best practices wshobson/agents (184 agents production-ready)

Fonte: [wshobson/agents GitHub](https://github.com/wshobson/agents) (184 agents + 16 orchestrators + 150 skills + 98 commands)

**Cosa adottare ELAB**:

1. **Setup standard `~/.claude/agents/`**
   ```bash
   cd ~/.claude
   git clone https://github.com/wshobson/agents.git wshobson-agents
   ```

2. **Agent specializzati pre-built da usare**:
   - `backend-architect` — Architettura API/Edge Functions
   - `database-architect` — Schema Supabase + migrations
   - `frontend-developer` — React 19 components
   - `test-automator` — Vitest + Playwright spec
   - `security-auditor` — RLS, GDPR, secret scanning
   - `deployment-engineer` — CI/CD GH Actions
   - `observability-engineer` — Sentry + monitoring

3. **Pattern coordination flow**:
   ```
   User Request → backend-architect → frontend-developer → test-automator → security-auditor → Result
   ```

4. **Model assignment per complexity**:
   - **High** (Opus): security audit, architecture review, incident response, AI/ML
   - **Medium** (Sonnet): implementation, refactoring, test writing
   - **Low** (Haiku): documentation, formatting, simple bug fixes

### Programmatic Tool Calling — implementazione ufficiale

Fonti:
- [Programmatic tool calling — Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling)
- [Code execution tool — Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool)
- [Cookbook PTC](https://platform.claude.com/cookbook/tool-use-programmatic-tool-calling-ptc)
- [ikangai dev guide](https://www.ikangai.com/programmatic-tool-calling-with-claude-code-the-developers-guide-to-agent-scale-automation/)

**Numeri ufficiali Anthropic**:
- Token reduction: **43,588 → 27,297** = -**37%** complex research tasks
- Tool Search beta: -**85%** token, Opus 4 accuracy **49% → 74%**
- Tool use examples: accuracy **72% → 90%** complex parameter handling
- Effort parameter `medium`: -**76%** token mantenendo Sonnet 4.5 accuracy

**Setup ELAB programmatic tool calling**:

1. Mark tools `allowed_callers: ["code_execution"]`:
   ```json
   // .claude/tools-config.json
   {
     "code_execution_enabled": true,
     "code_execution_eligible_tools": [
       "Bash", "Read", "Glob", "Grep",
       "mcp__supabase__execute_sql",
       "mcp__playwright__browser_*"
     ],
     "max_parallel_subprocesses": 8,
     "timeout_seconds": 300,
     "container_image": "anthropic/claude-code-execution:latest"
   }
   ```

2. Use case ELAB ottimali per PTC:
   - **Batch UNLIM narrations** 92 esperimenti (parallel Gemini calls)
   - **TRES JOLIE photo batch** 92 foto convert (parallel sips)
   - **Test multiplication** 3604 generate (parallel test-writer)
   - **549+6000 RAG chunk** re-embed batch
   - **CoV 3x vitest** parallel run + aggregation
   - **Vol 1+2+3 PDF text** parallel grep extraction
   - **Lighthouse audit** 27 lezioni parallel run
   - **Playwright E2E** 36 voice command parallel test

3. Best practice PTC:
   - Output finale **solo summary** in Claude context (non risultati intermedi)
   - **Idempotent operations** only (retry-safe)
   - **Clear return format** docs in tool description
   - **Error handling** robusto (try/except per ogni async)

**Esempio PTC produzione ELAB** (batch UNLIM narrations):

```python
import asyncio
import os
from anthropic import AsyncAnthropic

client = AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

async def generate_narration(exp_id, book_text):
    response = await client.messages.create(
        model="claude-opus-4-20250514",
        max_tokens=200,
        messages=[{
            "role": "user",
            "content": f"""Genera narrazione UNLIM per esperimento {exp_id}.
            Testo libro: {book_text[:1500]}
            
            REGOLE PRINCIPIO ZERO v3:
            - Linguaggio plurale "Ragazzi,"
            - Max 3 frasi + 1 analogia
            - Max 60 parole
            - FORBIDDEN: "Docente, leggi"
            """
        }]
    )
    return exp_id, response.content[0].text

async def main():
    exp_data = load_92_experiments()
    # Cap 5 parallel (rate limit Anthropic)
    semaphore = asyncio.Semaphore(5)
    
    async def bounded_gen(exp_id, text):
        async with semaphore:
            return await generate_narration(exp_id, text)
    
    results = await asyncio.gather(*[
        bounded_gen(eid, txt) for eid, txt in exp_data.items()
    ])
    
    # Solo summary entra context Claude
    return {
        "generated": len(results),
        "avg_length_words": sum(len(r[1].split()) for r in results) / len(results),
        "violations_principio_zero": [
            r[0] for r in results 
            if "Docente, leggi" in r[1] or "Insegnante" in r[1]
        ]
    }

result = asyncio.run(main())
print(result)  # Solo dict ~150 token entra context
```

**Risparmio stimato ELAB**: 92 narrations sequenziali = ~92K token I/O. Con PTC = ~27K token (-71%). Gain reale > 37% perché ELAB caso = molti tool result intermedi.

### Composizione team ELAB FINALE (post-direttiva user 20/04 "only opus")

**Direttiva user**: tutti agenti **Opus 4 only**, via **Claude Code Max subscription** Andrea (no per-token API billing concern).

| Agente | Modello | Razionale |
|--------|---------|-----------|
| TPM | **Opus 4** | Decision-making strategico, planning settimanale |
| ARCHITECT | **Opus 4** | Architettura complessa, ADR, blueprint |
| DEV | **Opus 4** | Implementation senior-grade, no compromise |
| TESTER | **Opus 4** | Test writing massima qualità + edge case |
| REVIEWER | **Opus 4** | Quality gate critico |
| AUDITOR | **Opus 4** | Audit onesto, decision-grade |

**Razionale all-Opus**:
- Max subscription Andrea include quota Opus generosa (no $ per token)
- Decisioni omogeneamente robuste (no quality drop su Sonnet/Haiku)
- Brain ridondanza (6 cervelli pari grado)
- Eliminazione "tier anxiety" (mai chiedersi se modello è abbastanza forte)

**Costo reale**:
- Andrea Max plan = già pagato (~$200/mese flat)
- 6 agenti × dispatch = consumo quota, NON $ extra
- Watch metric: % quota Max usata weekly (target ≤70%)

**Quota monitoring weekly** (TPM dispatch):
```bash
claude usage --period week
```
Output atteso: token usage, % quota Max, days remaining at current rate.

**Strategia se quota >80% a metà settimana**:
1. Ridurre dispatch giornalieri (cap 5 → cap 3)
2. Spread task lungo settimana (no spike giornaliero)
3. Andrea solo per task <30 min (no team overhead)
4. PTC obbligatorio per batch ops (riduce quota -99%)
5. NO fallback Sonnet (mantenere Opus tier)

**Effort parameter come quality knob (non cost optimization)**:

| Agente | Effort | Razionale |
|--------|--------|-----------|
| TPM | `low` | Coordination semplice |
| ARCHITECT | `high` | Decisioni critiche |
| DEV | `medium` | Implementation routinaria |
| TESTER | `medium` | Test routinari |
| REVIEWER | `high` | Quality gate |
| AUDITOR | `high` | Massima onestà |

Effort `low/medium` riduce token consumption Opus mantenendo qualità Opus-tier (-76% token Sonnet 4.5 default mantenendo accuracy).

### Verifica setup pre-sett-1

Lunedì 21/04 mattina checklist:
- [ ] `claude --version` ≥ 2.1.32 (se no: `npm install -g @anthropic-ai/claude-code@latest`)
- [ ] `~/.claude/agents/` esiste
- [ ] `wshobson-agents` clonato (se decido di usarlo)
- [ ] 6 file `team-*.md` creati con model corretto (Opus/Sonnet mix)
- [ ] `automa/team-state/` 5 file inizializzati
- [ ] `.claude/tools-config.json` con `code_execution_enabled: true`
- [ ] Test dispatch parallelo 3 agenti single message → verifica no crash

---

## 12. Sources research

- [Orchestrate teams of Claude Code sessions — Claude Code Docs](https://code.claude.com/docs/en/agent-teams)
- [Claude Code Agent Teams Setup & Usage Guide 2026](https://claudefa.st/blog/guide/agents/agent-teams)
- [Shipyard — Multi-agent orchestration for Claude Code in 2026](https://shipyard.build/blog/claude-code-multi-agent/)
- [AddyOsmani — The Code Agent Orchestra](https://addyosmani.com/blog/code-agent-orchestra/)
- [wshobson/agents GitHub (184 agents production)](https://github.com/wshobson/agents)
- [30 Tips for Claude Code Agent Teams — John Kim](https://getpushtoprod.substack.com/p/30-tips-for-claude-code-agent-teams)
- [Sub-agent vs Agent Team — MindStudio](https://www.mindstudio.ai/blog/claude-code-agent-teams-vs-sub-agents)
- [Sub-agent vs Agent Team Pattern — Medium Han HELOIR](https://medium.com/data-science-collective/sub-agent-vs-agent-team-in-claude-code-pick-the-right-pattern-in-60-seconds-e856e5b4e5cc)
- [Claude Code Subagents Main-Agent Coordination — Rick Hightower](https://medium.com/@richardhightower/claude-code-subagents-and-main-agent-coordination-a-complete-guide-to-ai-agent-delegation-patterns-a4f88ae8f46c)
- [How we built our multi-agent research system — Anthropic](https://www.anthropic.com/engineering/multi-agent-research-system)
- [How Anthropic Built a Multi-Agent Research System — ByteByteGo](https://blog.bytebytego.com/p/how-anthropic-built-a-multi-agent)
- [The Art of Multi-Agent Collaboration — LLM Multi Agent](https://llmmultiagents.com/en/blogs/anthropic-multi-agent-system-reflection)
- [Multi-Agent or Not? Context-First Insights — AgenticSpace](https://agenticspace.dev/multi-agent-or-not-context-first-insights-from-anthropic-and-cognition/)
- [Programmatic tool calling — Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling)
- [Code execution tool — Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool)
- [Programmatic tool calling Cookbook PTC](https://platform.claude.com/cookbook/tool-use-programmatic-tool-calling-ptc)
- [Introducing advanced tool use — Anthropic Engineering](https://www.anthropic.com/engineering/advanced-tool-use)
- [Programmatic Tool Calling with Claude Code — ikangai](https://www.ikangai.com/programmatic-tool-calling-with-claude-code-the-developers-guide-to-agent-scale-automation/)
- [Anthropic Programmatic Tool Calling — liteLLM](https://docs.litellm.ai/docs/providers/anthropic_programmatic_tool_calling)

---

## 13. Forza ELAB. Team-up.

Andrea + Tea + 6 agenti (4 Opus + 2 Sonnet) = squadra reale, non un developer solo.

Lunedì 21/04 ore 9:00: setup. Sera: team operativo.

**Mantra team**:
- Plan PRIMA di execute
- Quality bar esplicita ogni dispatch
- 3-5 cap parallel (mai 50)
- Token monitoring weekly (80% perf variance)
- Stesso file = no team (single session)
- Onesto > veloce
