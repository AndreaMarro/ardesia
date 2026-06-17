# Agent Team CLI Orchestration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended).

**Goal:** Orchestrare un team di 6-8 agent in Claude CLI (estensione triade Planner/Generator/Evaluator già attiva) ispirato a progetti GitHub documentati (wshobson/agents 54k⭐, autogen 52k⭐, crewAI 30k⭐), con ruoli, handoff, e telemetria, rispettando disciplina loop autonomo ELAB.

**Architecture:** role-based multi-agent con stretto file-ownership + message passing via file drop (`automa/tasks/`), una triade core + 3 specialist extra (architect, security-auditor, performance-engineer) + 2 observer (evaluator-haiku, scribe-sonnet), tutto governato da planner-opus.

**Tech Stack:** Claude Code CLI, `.claude/agents/*.md` spec, file-based task queue, pre/post-commit hook per telemetria, claude-mem per memoria.

---

## Ispirazione e riferimenti

| Progetto                   | Lezione                                                              | Repo                                         |
|----------------------------|----------------------------------------------------------------------|----------------------------------------------|
| **wshobson/agents**        | 100+ specialist agent spec, ben categorizzati per dominio             | github.com/wshobson/agents                   |
| **microsoft/autogen**      | Multi-agent conversation pattern, structured hand-off                 | github.com/microsoft/autogen                 |
| **crewAI**                 | Role-based agent con tools + task queue                               | github.com/joaomdmoura/crewAI                |
| **langchain-ai/langgraph** | State machine per multi-agent workflow                                | github.com/langchain-ai/langgraph            |
| **anthropic/skills-demo**  | Skill-as-capability (superpowers plugin modello)                      | github.com/anthropics/skills-demo            |
| **forrestchang/karpathy-skills** | Think/Simple/Surgical/Goal-driven mental model                  | github.com/forrestchang/andrej-karpathy-skills |
| **open-webui/open-webui**  | Pipeline modularity for multi-provider LLM routing                    | github.com/open-webui/open-webui             |
| **huggingface/smol-agents**| Lightweight agent runtime                                             | github.com/huggingface/smolagents            |

**Lezione chiave:** la struttura che scala meglio è **role ownership + message drops + evaluator indipendente**. Non serve un orchestratore complesso, bastano file e convenzioni.

---

## File Structure

**Modify:**
- `.claude/agents/planner.md` — enrich con role-specific prompting
- `.claude/agents/generator-app.md` — file-ownership boundaries
- `.claude/agents/generator-test.md` — TDD enforcement
- `.claude/agents/evaluator.md` — haiku skeptical calibration

**Create:**
- `.claude/agents/architect.md` — high-level design agent (opus, read-only)
- `.claude/agents/security-auditor.md` — OWASP + GDPR review (opus)
- `.claude/agents/performance-engineer.md` — profile + optimize (sonnet)
- `.claude/agents/scribe.md` — documentation + retrospective (sonnet)
- `automa/team-charter.md` — team contract + file-ownership matrix
- `automa/hand-off-protocol.md` — JSON contract tra agent
- `scripts/team-dashboard.mjs` — tabella stato real-time
- `docs/architectures/team-orchestration-v2.md` — architettura

---

## Task 1: Team Charter + File-Ownership Matrix

**Files:**
- Create: `automa/team-charter.md`

- [ ] **Step 1: Write charter**

```markdown
# ELAB Team Charter — Agent Orchestration

Guiding principle: ogni agent lavora solo su file di sua proprieta. Mai write cross-boundary. Handoff via message drop in automa/tasks/.

## Role matrix

| Agent                | Model  | Read                    | Write                                    | Purpose                                   |
|----------------------|--------|-------------------------|------------------------------------------|-------------------------------------------|
| planner              | opus   | tutto                   | automa/tasks/pending/                    | Decompose epic in task atomici            |
| architect            | opus   | tutto                   | docs/architectures/, docs/adrs/          | ADR + system design, zero implementation  |
| generator-app        | sonnet | tutto                   | src/, supabase/functions/, public/       | UI + services implementation              |
| generator-test       | sonnet | tutto                   | tests/, scripts/openclaw/*.test.ts       | Vitest + Playwright                       |
| security-auditor     | opus   | tutto                   | docs/audits/security-*.md                | OWASP + GDPR + threat model               |
| performance-engineer | sonnet | tutto                   | docs/audits/performance-*.md             | Profile + optimize                        |
| evaluator            | haiku  | diff HEAD + tests       | automa/evals/*.json                      | Skeptical PASS/WARN/FAIL                  |
| scribe               | sonnet | sessions logs           | docs/sunti/, docs/retrospectives/        | Documentation                             |

## Conflict resolution

Due agent claimano stesso file → planner decide. Planner incerto → evaluator veto. Evaluator FAIL 2x di fila → human review (Andrea).

## Lifecycle task

1. planner drops task in automa/tasks/pending/ATOM-NNN.md
2. generator-* claims via git mv to automa/tasks/in_progress/
3. generator-* commits changes
4. evaluator reads diff HEAD, writes automa/evals/ATOM-NNN.json
5. evaluator PASS → planner mv to automa/tasks/done/
   evaluator FAIL → planner spawns retry with feedback

## File lock (soft)

Ogni task dichiara owned_files + will_modify. Pre-commit hook (scripts/guard-file-ownership.sh) verifica che commit non violi boundary.
```

- [ ] **Step 2: Commit**

```bash
git add automa/team-charter.md
git commit -m "docs(team): charter + file-ownership matrix 8 agent"
```

---

## Task 2: Hand-off Protocol Spec

**Files:**
- Create: `automa/hand-off-protocol.md`

- [ ] **Step 1: Write protocol**

```markdown
# Agent Hand-off Protocol v1

Ogni task file e' markdown con YAML front-matter + body.

## Task spec format

---
id: ATOM-042
title: "Add dispatcher PZ v3 pairing"
created_by: planner
created_at: 2026-04-23T10:00Z
status: pending | in_progress | done | failed
assigned_to: generator-app
owned_files:
  - src/services/openclaw/dispatcher.js
  - src/services/openclaw/composite-dispatcher.js
will_modify: []
prerequisite_tasks: [ATOM-038, ATOM-040]
exit_criteria:
  - tests/unit/openclaw-dispatcher.test.js passes
  - coverage >= 80% on dispatcher.js
estimated_minutes: 45
---

Body in markdown, cosa fare, perche, come.

## Eval spec format (JSON)

{
  "task_id": "ATOM-042",
  "evaluator": "evaluator",
  "at": "2026-04-23T10:45Z",
  "verdict": "PASS" | "WARN" | "FAIL",
  "confidence": 0.85,
  "reasons": ["All 5 tests pass locally", "Coverage 84% > 80%"],
  "concerns": ["pairing_window_ms hardcoded 500 — consider env var"],
  "recommend_next_task": "ATOM-043"
}

## Message drop conventions

- Directory lifecycle: automa/tasks/pending/ → in_progress/ → done/ / failed/
- File naming: ATOM-NNN-short-slug.md (NNN monotonic zero-padded)
- Claim atomic: `git mv pending/ATOM-042 in_progress/ATOM-042` — first to mv wins
- No deletions: task done-files archived, not deleted (audit trail)

## Telemetria hook

Post-commit hook invia summary a claude-mem/pending/ payload JSON con {at, agent, task, files_changed, test_count_delta, verdict_predicted}.
```

- [ ] **Step 2: Commit**

```bash
git add automa/hand-off-protocol.md
git commit -m "docs(team): hand-off protocol v1 (task + eval spec format)"
```

---

## Task 3: Extend Existing Agents (planner/generator/evaluator)

**Files:**
- Modify: `.claude/agents/planner.md`
- Modify: `.claude/agents/generator-app.md`
- Modify: `.claude/agents/generator-test.md`
- Modify: `.claude/agents/evaluator.md`

- [ ] **Step 1: Harden planner with charter reference**

Append a `.claude/agents/planner.md`:

```markdown
## Conformità team charter

Prima di produrre un task, verifica:

1. owned_files non sovrappone con task pending/in_progress di altri agent (check automa/tasks/in_progress/)
2. prerequisite_tasks elencati esistono e sono done
3. exit_criteria sono misurabili (test count, file exists, command exits 0)
4. Non esistono task duplicati in automa/tasks/done/ ultime 10

Se conflitti → segnala in automa/issues/NNN-conflict.md e non creare il task.
```

- [ ] **Step 2: Add file-ownership check in generator-app**

Append a `.claude/agents/generator-app.md`:

```markdown
## File-ownership discipline

- Leggi il task da automa/tasks/in_progress/ATOM-*.md
- Modifica SOLO i file dentro owned_files
- Se serve modificare un file non di tua proprietà: crea issue task per il giusto agent, NON toccarlo
- Pre-commit: verifica `git diff --name-only` subset di owned_files
```

- [ ] **Step 3: Harden generator-test TDD**

Append a `.claude/agents/generator-test.md`:

```markdown
## TDD strict mode

- Scrivi test PRIMA di toccare src code
- Se devi modificare src per testabilità, CREA task per generator-app — non fare tu
- Usa sempre `npx vitest run <specific-file>` per isolation
- Un test file = un concetto testato (no kitchen sink)
- Almeno 1 edge case + 1 happy path + 1 error path per funzione
```

- [ ] **Step 4: Calibrate evaluator skepticism**

Append a `.claude/agents/evaluator.md`:

```markdown
## Skeptical calibration

- Self-claim del generator NON conta
- Tutti i numeri verifica via command:
  - `npx vitest run | tail -5`
  - `node scripts/benchmark.cjs --fast`
  - `git diff --stat HEAD~1`
- Confidence in {0.5, 0.7, 0.85, 0.95}:
  - 0.5 → FAIL (broken)
  - 0.7 → WARN (needs follow-up)
  - 0.85 → PASS (standard)
  - 0.95 → PASS + ottimo
- Se confidence < 0.85 su PASS, declassifica a WARN
```

- [ ] **Step 5: Commit**

```bash
git add .claude/agents/
git commit -m "feat(agents): harden triad with charter + TDD + skeptical calibration"
```

---

## Task 4: New Agent — Architect (opus, read-only)

**Files:**
- Create: `.claude/agents/architect.md`

- [ ] **Step 1: Write architect spec**

```markdown
---
name: architect
description: Senior architect produces ADR + system design. Read-only sul codice, scrive solo in docs/architectures/ e docs/adrs/. Usa per decisioni high-impact (>3 file toccati, nuovo pattern, dependency nuova).
model: opus
tools: Read, Glob, Grep, WebSearch, WebFetch
---

# Architect Agent — ELAB Tutor

## When to use

- Nuovo modulo che tocca >=3 file esistenti
- Decisione su pattern (es. Zustand vs Jotai, pgvector vs Weaviate)
- Dipendenza npm nuova (anche se piccola)
- Migrazione tecnica (Vite 6 -> 7, React 18 -> 19)
- Security architecture (threat model, auth flow)
- Ispirazione da altri progetti (search GitHub, WebFetch paper)

## What NOT to do

- NON scrivere codice (e read-only)
- NON modificare file fuori docs/architectures/ + docs/adrs/
- NON fare handoff diretto — planner decide quando tua ADR diventa task

## Output format

ADR in formato standard:
- Status: Proposed | Accepted | Superseded
- Context: 2-3 paragrafi sul problema
- Decision: una singola frase principale + dettagli
- Consequences: positive + negative + neutrali
- Alternatives considered: min 2, max 4
- Prior art: link a >=2 repo/paper

Segui pattern ADR-001 .. ADR-008 esistenti in docs/architectures/.

## Karpathy principles (obbligo)

1. Think before writing (1 min > 10 min refactor)
2. Simple (YAGNI, no premature abstraction)
3. Surgical (min N file toccati)
4. Goal-driven (ogni decisione -> goal esplicito)

## GDPR rigor

- Se ADR tocca dati utente -> explicit section "GDPR impact"
- EU-only runtime required -> documenta perche
- Together AI / US provider -> documenta compartmentalization

## Example invocation

@architect produci ADR per scelta BGE-M3 vs E5-large-v2 per embedding tool-memory. Criteri: latenza, accuracy, costo, disponibilita self-hosted, supporto multilingue.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/agents/architect.md
git commit -m "feat(agents): add architect agent (opus, read-only ADR producer)"
```

---

## Task 5: New Agent — Security Auditor

**Files:**
- Create: `.claude/agents/security-auditor.md`

- [ ] **Step 1: Write spec**

```markdown
---
name: security-auditor
description: Audit security del codice ELAB (OWASP top 10 + GDPR + auth). Invocato post-feature su PR critici (auth, storage, API). Scrive solo in docs/audits/security-*.md.
model: opus
tools: Read, Glob, Grep, Bash
---

# Security Auditor — ELAB Tutor

## Scope immutabile

1. OWASP Top 10 (2023): injection, broken auth, sensitive data exposure, XXE, broken access, misconfig, XSS, deserialization, known-vuln deps, insufficient logging
2. GDPR Art. 5-35: minimization, accuracy, integrity, accountability, DPO, breach notification, DPIA for high-risk
3. Italia specific: trattamento dati minori (Art. 8 GDPR + Codice Privacy Art. 2-quinquies)
4. ELAB specific: EU-only runtime obbligo, Together AI only batch+teacher+emergency, Principio Zero v3 audit trail

## Process

1. Read PR diff + tutti i file toccati
2. Check each change contro checklist OWASP + GDPR
3. Verify env vars + secrets non committati
4. Verify CSP headers + input sanitization
5. Write docs/audits/security-YYYY-MM-DD-<pr-id>.md con:
   - Executive summary (3 righe)
   - Findings P0/P1/P2/P3 con CVE-style ID
   - Remediation plan (ordine priorità)
   - Sign-off raccomandato: APPROVE / REQUEST_CHANGES / BLOCK

## Thresholds

- P0 CRITICAL = block merge
- P1 HIGH = request changes
- P2 MEDIUM = approve with follow-up task
- P3 LOW = comment for future hardening

## Example invocation

@security-auditor review PR #25 (OpenClaw Sprint 5). Focus: Together AI gate, pgvector migration SQL injection risk, dispatcher arbitrary code execution.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/agents/security-auditor.md
git commit -m "feat(agents): add security-auditor (opus, OWASP+GDPR+minor-data)"
```

---

## Task 6: New Agent — Performance Engineer + Scribe

**Files:**
- Create: `.claude/agents/performance-engineer.md`
- Create: `.claude/agents/scribe.md`

- [ ] **Step 1: performance-engineer spec**

```markdown
---
name: performance-engineer
description: Profile + optimize ELAB. Misurazione prima di ottimizzazione. Scrive solo docs/audits/performance-*.md + scripts/bench/.
model: sonnet
tools: Read, Glob, Grep, Bash, Edit
---

# Performance Engineer — ELAB Tutor

## Principle zero

"Premature optimization is the root of all evil" — Knuth. Prima MISURA, poi ottimizza. Se non puoi misurare, non hai un problema di performance.

## Scope

- Frontend: Lighthouse, CWV (LCP, FID, CLS), bundle size
- Backend: Edge Function latency, Gemini p95, Supabase queries
- Simulator: SVG render FPS, circuit solver ms/iteration
- LLM: token/sec, cost per session, cache hit rate

## Process

1. Baseline prima di modificare nulla
2. Identify hot path (profiler, not gut feeling)
3. Write benchmark script in scripts/bench/
4. Propose min change that moves the needle
5. Hand off a generator-app per implement (non implementare tu)
6. Re-baseline e verifica

## Output format

docs/audits/performance-YYYY-MM-DD-<area>.md:
- Baseline metrics (snapshot)
- Hot path analysis (call tree + % time)
- Proposed changes (with delta projection)
- Validation plan

## Example invocation

@performance-engineer audit simulator SVG render FPS. Goal: mantenere 60 FPS con 20+ componenti su MacBook Air M1. Measure first, propose later.
```

- [ ] **Step 2: scribe spec**

```markdown
---
name: scribe
description: Documentation + retrospective + sunti settimanali. Trasforma attivita di team in prose leggibile, ordinato, senza hype. Scrive solo docs/sunti/, docs/retrospectives/.
model: sonnet
tools: Read, Glob, Grep, Bash
---

# Scribe — ELAB Tutor

## Principi

- Chronology > speculation: scrivi cosa e successo, non cosa poteva succedere
- Commits sono la verita: git log e la fonte primaria
- Zero hype: numeri reali, zero "enormously", "drastically", "revolutionary"
- Italian business-formal: sii professionale senza essere rigido
- Karpathy Think: 3 paragrafi di contenuto > 10 di filler

## Output

### Weekly sunto (Sunday)

File: docs/sunti/YYYY-Www-sunto.md

- Cosa fatto (commit + stat)
- Cosa NON fatto (e perche)
- Decisioni prese (con rationale + link ADR)
- Prossime 3 azioni (ordine priorita)

### Sprint retrospective (end-sprint)

File: docs/retrospectives/sprint-N-retrospective.md

- Continua a fare (what worked)
- Smetti di fare (what failed)
- Inizia a fare (new experiments)
- Metrics: baseline test, benchmark score, test delta, commit count

## Example invocation

@scribe scrivi sunto settimana 2026-W17 (Sprint 6 Day 36-42). Base: git log + automa/tasks/done/ + automa/evals/.
```

- [ ] **Step 3: Commit both**

```bash
git add .claude/agents/performance-engineer.md .claude/agents/scribe.md
git commit -m "feat(agents): add performance-engineer + scribe"
```

---

## Task 7: Team Dashboard Script

**Files:**
- Create: `scripts/team-dashboard.mjs`

- [ ] **Step 1: Write dashboard (using execFileSync, no shell)**

```js
// scripts/team-dashboard.mjs
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

function parseYaml(body) {
  const match = body.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const out = {};
  for (const line of match[1].split('\n')) {
    const sep = line.indexOf(':');
    if (sep > 0) out[line.slice(0, sep).trim()] = line.slice(sep + 1).trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

function listTasks(dir) {
  const path = `automa/tasks/${dir}`;
  if (!existsSync(path)) return [];
  try {
    return readdirSync(path)
      .filter(f => f.endsWith('.md'))
      .map(f => ({ file: f, ...parseYaml(readFileSync(`${path}/${f}`, 'utf8')) }));
  } catch {
    return [];
  }
}

function latestCommits() {
  try {
    return execFileSync('git', ['log', '--oneline', '-n', '10'], { encoding: 'utf8' })
      .split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function testCount() {
  try {
    const out = execFileSync('cat', ['automa/baseline-tests.txt'], { encoding: 'utf8' }).trim();
    return parseInt(out, 10) || 0;
  } catch {
    return 0;
  }
}

function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  ELAB TEAM DASHBOARD — ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════\n');

  const pending = listTasks('pending');
  const inProgress = listTasks('in_progress');
  const done = listTasks('done');
  const failed = listTasks('failed');

  console.log(`Tasks:  pending=${pending.length}  in_progress=${inProgress.length}  done=${done.length}  failed=${failed.length}\n`);

  if (inProgress.length) {
    console.log('▶ IN PROGRESS:');
    for (const t of inProgress) {
      console.log(`  - ${t.id || t.file} → @${t.assigned_to || '?'}: ${t.title || '(no title)'}`);
    }
    console.log('');
  }

  if (pending.length) {
    console.log('⏳ PENDING (next 5):');
    for (const t of pending.slice(0, 5)) {
      console.log(`  - ${t.id || t.file}: ${t.title || '(no title)'}`);
    }
    console.log('');
  }

  console.log('📜 LAST 5 COMMITS:');
  for (const c of latestCommits().slice(0, 5)) console.log(`  ${c}`);
  console.log('');

  console.log(`🧪 Test baseline: ${testCount()}`);
}

main();
```

- [ ] **Step 2: Test run**

Prima crea le dir:
```bash
mkdir -p automa/tasks/pending automa/tasks/in_progress automa/tasks/done automa/tasks/failed automa/evals automa/issues
```

Poi run:
```bash
node scripts/team-dashboard.mjs
```
Expected: stampa dashboard corrente con tasks=0.

- [ ] **Step 3: Add npm script**

Edit `package.json`, aggiungi in `"scripts"`:
```json
"team:dashboard": "node scripts/team-dashboard.mjs"
```

- [ ] **Step 4: Commit**

```bash
git add scripts/team-dashboard.mjs package.json
git commit -m "feat(team): dashboard CLI (task status + commits + test baseline)"
```

---

## Task 8: Architecture Document + PDR Alignment

**Files:**
- Create: `docs/architectures/team-orchestration-v2.md`

- [ ] **Step 1: Write doc**

```markdown
# Team Orchestration v2 — ELAB Agent Architecture

## Principi

1. Role ownership strict: ogni agent = un dominio ristretto, non-overlapping
2. Message passing via files: no runtime state, tutto ispezionabile
3. Evaluator indipendente: verdict non-self via model diverso (haiku)
4. Planner unico punto decisionale: resolve conflicts
5. Archeology-friendly: git log + task dir = storia completa

## Mappa ruoli

                        ┌─────────┐
                        │ planner │ (opus, unique)
                        └────┬────┘
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
         ┌──────────┐   ┌──────────┐   ┌──────────┐
         │ architect│   │ generator│   │ security │
         │  (opus)  │   │ -app/test│   │ -auditor │
         │ read-only│   │ (sonnet) │   │  (opus)  │
         └──────────┘   └──────────┘   └──────────┘
              │              │              │
              └──────────────┼──────────────┘
                             ▼
                        ┌──────────┐
                        │ evaluator│ (haiku)
                        └────┬─────┘
                             ▼
                        ┌──────────┐
                        │  scribe  │ (sonnet)
                        └──────────┘

## Workflow tipico

1. Human Andrea → seed al planner con high-level epic (es. "Sprint 6 OpenClaw L1 live")
2. Planner → decompone in task atomici, drop in pending/
3. Architect (opzionale) → produce ADR se c'e design decision
4. Security-auditor (opzionale) → review pre-impl se touch auth/data
5. Generator-app / generator-test → claim task, implementa
6. Evaluator → verdict PASS/WARN/FAIL
7. Performance-engineer (opzionale) → audit post-impl se hot path
8. Scribe → sunto settimanale, retro sprint

## Anti-pattern da evitare

- Agent che chiama altro agent direttamente → sempre via planner
- Agent che modifica file fuori ownership → pre-commit hook blocca
- Evaluator che usa stesso model del generator → bias conferma
- Human che interrompe loop a meta task → completa o fallisci pulito
- Commit senza task associato → audit trail spezzato

## Scaling path

- Oggi (1 dev, 8 agent): human decide epic, planner decompone
- Stage 2a (1 dev, 8 agent + 2 collaboratori): human review PR, team agent fa 90% work
- Stage 3 (team 3): planner → 3 team parallel (feature teams), shared evaluator
- Stage 4 (team 5+): federate planner, scope-specific evaluators
```

- [ ] **Step 2: Commit**

```bash
git add docs/architectures/team-orchestration-v2.md
git commit -m "docs(arch): team orchestration v2 (8 agent, role-ownership, scaling path)"
```

---

## Task 9: Integration Test — Team Handoff Flow

- [ ] **Step 1: Create test epic in pending**

```bash
cat > automa/tasks/pending/ATOM-TEAM-TEST-001.md <<'EOF'
---
id: ATOM-TEAM-TEST-001
title: "Test team handoff — add one-liner to CLAUDE.md"
created_by: planner
created_at: 2026-04-23T12:00Z
status: pending
assigned_to: generator-app
owned_files:
  - CLAUDE.md
will_modify: []
prerequisite_tasks: []
exit_criteria:
  - grep "Team orchestration v2" CLAUDE.md returns 1 line
estimated_minutes: 5
---

## Description

Add one-liner in CLAUDE.md pointing to new team architecture doc:
"Team orchestration v2: see docs/architectures/team-orchestration-v2.md"

## Acceptance

- [ ] CLAUDE.md has the new reference
- [ ] Test: `grep -q "Team orchestration v2" CLAUDE.md && echo OK`
EOF
```

- [ ] **Step 2: Simulate claim + execute**

```bash
git mv automa/tasks/pending/ATOM-TEAM-TEST-001.md automa/tasks/in_progress/

printf "\n## Team orchestration v2\n\nSee docs/architectures/team-orchestration-v2.md for agent roles + handoff protocol.\n" >> CLAUDE.md

grep -q "Team orchestration v2" CLAUDE.md && echo "Exit criterion PASS"
```

- [ ] **Step 3: Simulate evaluator verdict**

```bash
cat > automa/evals/ATOM-TEAM-TEST-001.json <<'EOF'
{
  "task_id": "ATOM-TEAM-TEST-001",
  "evaluator": "evaluator",
  "at": "2026-04-23T12:05Z",
  "verdict": "PASS",
  "confidence": 0.95,
  "reasons": ["Exit criterion grep PASS", "Diff minimal 2 lines CLAUDE.md only"],
  "concerns": [],
  "recommend_next_task": null
}
EOF

git mv automa/tasks/in_progress/ATOM-TEAM-TEST-001.md automa/tasks/done/
```

- [ ] **Step 4: Run dashboard**

```bash
node scripts/team-dashboard.mjs
```
Expected: shows 1 task in done, baseline test unchanged.

- [ ] **Step 5: Commit test artifact**

```bash
git add automa/tasks/ automa/evals/ CLAUDE.md
git commit -m "test(team): handoff flow integration — ATOM-TEAM-TEST-001 PASS"
```

---

## Self-Review

1. Spec coverage: ogni role del charter ha una Task di setup? Sì (Task 1 + 3 + 4 + 5 + 6).
2. Placeholder scan: zero "TBD", "implement later".
3. Type consistency: evaluator verdict in {PASS, WARN, FAIL} coerente tra Task 2 + Task 9.
4. GDPR: nessun agent tocca dati utente senza charter check. Security-auditor review obbligatorio su auth/data.
5. Principio Zero v3: nessun agent scrive in `src/services/openclaw/pz-v3-middleware.js` senza passarci per planner.

## Execution Handoff

**Plan saved to `docs/superpowers/plans/2026-04-30-agent-team-cli-orchestration.md`.**

Raccomando **Inline Execution** per questo piano (non richiede molte iterazioni LLM, e soprattutto file-drops):

Use superpowers:executing-plans to execute docs/superpowers/plans/2026-04-30-agent-team-cli-orchestration.md

Quando Sprint 6 chiude (sett-gate), ripartiamo con questo.
