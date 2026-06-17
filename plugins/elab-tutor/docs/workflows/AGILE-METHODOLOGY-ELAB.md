# Metodologia Agile — ELAB Tutor PDR Ambizioso 8 Settimane

**Versione**: 1.0
**Data**: 2026-04-21
**Owner**: Andrea Marro (Product Owner + Scrum Master + Lead Developer)
**Team**: 6 agenti Opus peer (team-tpm, team-architect, team-dev, team-tester, team-reviewer, team-auditor) + Andrea + Tea Lea Babbalea (volunteer da mer 23/04)
**Framework**: Scrum adattato + XP (Extreme Programming) practices + Kanban visualization
**Durata sprint**: 7 giorni (lunedì → domenica)
**Numero sprint totali**: 8 (sett 1-8, lun 21/04/2026 → dom 15/06/2026)

---

## 1. Principi guida (Manifesto Agile applicato a ELAB)

### 1.1 I 4 valori Agile

1. **Individui e interazioni** > processi e strumenti
   - Pair programming Andrea + Tea (da mer 23/04)
   - Team agenti peer coordinazione diretta via mailbox (Agent Teams)
   - Daily standup asincrono via `automa/team-state/daily-standup.md`

2. **Software funzionante** > documentazione esaustiva
   - Deploy preview ogni commit significativo
   - Deploy prod ogni fine settimana (dopo gate DoD)
   - Demo incrementale sett end (Sprint Review)
   - **MAI** doc senza codice funzionante a supporto

3. **Collaborazione con l'utente** > negoziazione contrattuale
   - Andrea è Product Owner (decisioni prodotto)
   - Giovanni Fagherazzi + Davide (stakeholder vendita) consultati fine sett
   - Tea Babbalea co-designer pedagogico bambini 8-14 anni

4. **Rispondere al cambiamento** > seguire un piano
   - PDR è guida, non contratto rigido
   - Scope adjustment fine sett se necessario (Sprint Review)
   - Retrospettiva fine sett identifica improvement actions

### 1.2 I 3 pilastri Scrum

- **Trasparenza**: `automa/team-state/tasks-board.json` visible, handoff giornalieri pubblici, metrics in `docs/audit/`
- **Ispezione**: audit brutale onesto fine day + fine sett (team-auditor)
- **Adattamento**: retrospective ogni sett produce 3 improvement actions concrete

---

## 2. Ruoli

### 2.1 Product Owner — Andrea Marro

- Mantiene **Product Backlog** prioritizzato (`automa/team-state/product-backlog.md`)
- Definisce **Sprint Goal** ogni settimana (matching `PDR_SETT_N_*.md`)
- Accetta o rifiuta deliverable a fine sprint
- Decide scope adjustment se necessario
- Unico autorizzato a merge a `main` + deploy prod autonomo via CLI DoD gate

### 2.2 Scrum Master — Andrea + team-tpm

- **team-tpm** agent rimuove impedimenti tecnici (blocker carry-over, dispatch coordination)
- Andrea risolve impedimenti strategici (decisioni prodotto ambigue, scope)
- Facilitatore cerimonie Scrum (standup, review, retrospective)
- Garantisce adesione DoD ogni task

### 2.3 Development Team — 6 agenti Opus + Tea

| Ruolo | Agente | Responsabilità |
|-------|--------|----------------|
| **Architect** | team-architect | Blueprint, ADR, data flow diagrams |
| **Developer** | team-dev | Implementation TDD, commit atomici |
| **Tester** | team-tester | Vitest + Playwright E2E + CoV |
| **Reviewer** | team-reviewer | Code review pre-merge, verdict APPROVE/CHANGES |
| **Auditor** | team-auditor | Audit brutale onesto + score quantitativo |
| **TPM** | team-tpm | Coordinazione, standup, board management |
| **Co-dev** | Tea Babbalea | Glossario, UX schema, path safe via CODEOWNERS |

Paradigma **Agent Teams** (non subagent): teammates comunicano direttamente via mailbox, shared task list, self-claim.

---

## 3. Product Backlog

### 3.1 Struttura gerarchica

```
Epic (8 epic totali = 8 settimane PDR)
  └── Story (3-7 story per epic)
        └── Task (2-8 task per story)
              └── Acceptance Criteria (3-15 AC per task)
```

**Esempio**:
- **Epic SETT-1**: "Stabilize + Tea autoflow + 6 prod bugs T1"
  - **Story S1-1**: "Lavagna bug fix (T1-001 + T1-002)"
    - **Task T1-001**: "Fix stale closure toggleDrawing"
      - AC: `useRef + useEffect([])` pattern, no gap 200ms, CoV 3x PASS
    - **Task T1-002**: "Fix whiteboard persistenza sandbox"
      - AC: fallback key `elab_wb_sandbox`, auto-save 5s, stroke preserve post-Esci

### 3.2 Story Point Estimation (Fibonacci)

| Point | Durata stimata | Complessità |
|-------|---------------|-------------|
| **1** | 30 min | Trivial (typo, naming) |
| **2** | 1h | Semplice (config, script shell) |
| **3** | 2h | Moderata (bug fix con test) |
| **5** | 4h | Complessa (feature multi-file) |
| **8** | 1 day | Epic-level (blueprint + impl + test) |
| **13** | 2 day | Grande (architecture change) |
| **21** | 3+ day | **SPLIT obbligatorio** (task troppo grande) |

Estimation via **Planning Poker** asincrono: Architect + Dev + Tester votano indipendenti, media = point finale.

### 3.3 Priorità (MoSCoW)

- **M (Must Have)** — P0: release bloccante, sprint current
- **S (Should Have)** — P1: importante, sprint current o successivo
- **C (Could Have)** — P2: nice-to-have, sprint opzionale
- **W (Won't Have)** — P3: fuori scope PDR 8 settimane, Fase 2

### 3.4 Definition of Ready (DoR)

Un task entra nello Sprint Backlog SOLO se rispetta TUTTI:

- [ ] Descrizione chiara (user story format: "Come X voglio Y per Z")
- [ ] Acceptance Criteria enumerate (min 3)
- [ ] Story point estimato (<13, altrimenti split)
- [ ] Dipendenze identificate (blocker upstream risolto)
- [ ] File impattati elencati (se >3 file → blueprint Architect richiesto)
- [ ] Test strategy definita (unit + integration + E2E se user-facing)
- [ ] Owner assegnato (architect/dev/tester/reviewer)
- [ ] No conflict file critici lockati (CircuitSolver, AVRBridge, api.js, simulator-api.js)

Se 1 criterio fail → task resta in **Refinement** column tasks-board.

---

## 4. Sprint Planning (lunedì mattina ogni sett)

### 4.1 Input

- Product Backlog prioritizzato
- `PDR_SETT_N_*.md` goal settimana
- Velocity sprint precedenti (media story points completati)
- Team capacity (Andrea 40h/sett + Tea 5h/sett + agenti quota Max)
- Retrospective action items sprint precedente

### 4.2 Output

- **Sprint Goal** (1 frase SMART)
- **Sprint Backlog** (story points totali ≤ velocity * 1.1)
- **Sprint Contract** (Harness 2.0 pattern, file `automa/team-state/sprint-contracts/sett-N-contract.md`)

### 4.3 Esempio Sprint Goal sett 1

> "Entro dom 27/04/2026, ELAB Tutor v1.0 avrà baseline vitest ≥12200, benchmark ≥6.0/10, 6 bug T1 prod fixed, Tea Babbalea operativa con CODEOWNERS autoflow, parità Vol 3 P0 (92 foto TRES JOLIE integrate), deploy prod verified live."

### 4.4 Sprint Contract (formato)

```markdown
# Sprint Contract — Sett N (settimana DD-DD/MM/2026)

## Sprint Goal
[1 frase SMART]

## Commitment (story points)
- Velocity baseline: X points
- Capacity sett: Y points
- Committed: Z ≤ 1.1 * X

## Deliverable
1. [Story A] — N point — owner
2. [Story B] — N point — owner
...

## Acceptance Criteria (grouped)
- Funzionalità: [lista]
- Qualità: [lista]
- Performance: [lista]
- Documentation: [lista]
- Test coverage: [baseline + delta atteso]

## Test Strategy
- Unit: vitest +N test
- Integration: M scenari
- E2E: P spec Playwright
- CoV 3x obbligatorio

## Rollback Plan
[descrizione rollback se deploy prod fallisce]

## Success Metrics (4 grading Harness 2.0)
- Design Quality (1-10): target
- Originality (1-10): target
- Craft (1-10): target
- Functionality (1-10): target

## Negotiator
- Generator: team-architect
- Evaluator: team-auditor
- Approval: Andrea (Product Owner)
```

---

## 5. Daily Scrum (standup asincrono, 9:00 ogni giorno)

### 5.1 Formato (3 domande)

team-tpm dispatch automatic genera file `automa/team-state/daily-standup.md` con:

```markdown
## Standup YYYY-MM-DD

### Ieri (day N-1) done
- [task done con hash commit]

### Oggi (day N) plan
- Architect: [task assegnato]
- Dev: [task assegnato]
- Tester: [task assegnato]
- Reviewer: [task assegnato]
- Auditor: [task assegnato se user-facing merge]

### Blocker aperti
- [BLOCKER-ID] description + severity + owner
```

### 5.2 Regole

- Max 15 min equivalente tempo (standup asincrono tramite file, no meeting)
- No problem-solving in standup (→ spostare in ticket dedicato)
- Focus status, non dettagli tecnici
- Blocker flagged → intervento Scrum Master immediato

---

## 6. Sprint Execution (lun-sab)

### 6.1 Ciclo giornaliero

```
09:00 — Daily Standup (team-tpm)
09:15 — Sprint Contract refresh (se necessario)
09:30 — Task execution loop
          ├── team-architect blueprint (se >2h task)
          ├── team-dev TDD RED-GREEN-REFACTOR
          ├── team-tester CoV 3x + E2E
          └── team-reviewer verdict pre-merge
13:00 — Pausa pranzo
14:00 — Continue task P0 + integrazione PR
17:00 — team-auditor live verify tasks user-facing done
17:30 — team-tpm end-day handoff + state persist + claude-mem save
18:00 — Push origin + CI watch + deploy preview + test-on-deployed
```

### 6.2 Kanban Board (in `automa/team-state/tasks-board.json`)

Colonne:

1. **Refinement** — task non ancora DoR
2. **Ready** — DoR soddisfatto, pronto sprint
3. **Todo** — selezionato sprint corrente
4. **In Progress** — active work (WIP limit: 3 task totali team)
5. **In Review** — reviewer verdict pending
6. **Done** — merged + deployed
7. **Blocked** — impedimento esterno

**WIP Limits** (Work In Progress):
- In Progress: max 3 task team (1 per ruolo principale: architect/dev/tester)
- In Review: max 2 PR pending reviewer
- Blocked: max 2 blocker attivi (se supera → escalation Andrea)

### 6.3 Pair Programming

**Due modalità**:

1. **Human-Agent pair**: Andrea guida, team-dev implementa (o viceversa)
2. **Agent-Agent pair**: due teammates lavorano stesso task concurrently (no stesso file!)

Trigger pair:
- Task alto rischio regressione (file critici)
- Task nuova area codebase (architect + dev insieme)
- Debugging complesso (dev + tester debug session)

---

## 7. Sprint Review (domenica sera ogni sett)

### 7.1 Scope

- Demo incrementale live (deploy prod verified post end-week-gate)
- Revisione 4 grading criteria (Design/Originality/Craft/Functionality)
- Benchmark delta (`node scripts/benchmark.cjs --write` fresh)
- Test count delta + coverage report
- Sprint Backlog completion (story points committed vs done)

### 7.2 Output

File `docs/reviews/sprint-N-review.md`:

```markdown
# Sprint N Review — domenica DD/MM/2026

## Sprint Goal — achieved YES/NO
[motivazione onesta]

## Deliverable status
| Story | Points committed | Points done | Status |
|-------|------------------|-------------|--------|
| S-N-1 | 5 | 5 | ✅ DONE |
| S-N-2 | 3 | 0 | ❌ SPILLOVER → sett N+1 |

## Velocity
- Committed: X points
- Completed: Y points
- Velocity this sprint: Y
- Velocity rolling avg (3 sprint): Z

## Metrics
- Vitest count: pre → post (+delta)
- Benchmark score: pre → post (+delta)
- Build time: pre → post
- Bundle size: pre → post (%delta)
- Test coverage %: pre → post
- Sentry errors/day avg: pre → post
- Lighthouse perf: pre → post

## Demo live (link preview deploy)
[URL vercel preview]
[screenshot key features]

## 4 Grading Criteria (Harness 2.0)
- Design Quality: N/10 (giustificazione)
- Originality: N/10
- Craft: N/10
- Functionality: N/10
- Media: N/10

## Stakeholder feedback (se applicabile)
- Andrea PO: [feedback]
- Giovanni (vendita): [feedback]
- Tea (pedagogia): [feedback]

## Decisioni prodotto
- Accept: [deliverable accettati]
- Reject: [deliverable rifiutati, motivo]
- Spillover sett N+1: [story points]
```

---

## 8. Sprint Retrospective (domenica sera subito dopo Review)

### 8.1 Formato Start-Stop-Continue

File `docs/retrospectives/sprint-N-retrospective.md`:

```markdown
# Retrospective Sprint N — DD/MM/2026

## START (cose nuove da iniziare)
1. [azione concreta, misurabile, owner, deadline]
2. ...
3. ...

## STOP (cose da smettere)
1. [cosa non funziona, perché, sostituire con]
2. ...
3. ...

## CONTINUE (cose che funzionano, keep doing)
1. [pratica positiva confermata]
2. ...
3. ...

## 3 Improvement Actions concrete (applicare sett N+1)
- [ ] ACTION-N-1: descrizione + owner + deadline + success metric
- [ ] ACTION-N-2: ...
- [ ] ACTION-N-3: ...

## Team Mood (self-assessment)
- Andrea energy: N/10
- team-auditor honest call: N/10
- Burnout risk: LOW/MED/HIGH

## Velocity trend (3 sprint rolling)
- Sprint N-2: X
- Sprint N-1: Y
- Sprint N: Z
- Trend: ↑ / → / ↓
- Commitment sett N+1: suggested Z * 1.0 (conservative) OR Z * 1.1 (stretch)

## Key learning
[1-2 righe insight principali]
```

### 8.2 Enforcement

3 improvement actions settimana precedente **tracciate in tasks-board sprint corrente**:
- Se action non completata → diventa blocker in retrospective sett N+1
- Action ripetute 2 sprint consecutivi senza chiusura → escalation Andrea

---

## 9. Continuous Improvement & Metrics

### 9.1 Velocity tracking

File `automa/state/velocity-tracking.json`:

```json
{
  "sprints": [
    {
      "number": 1,
      "period": "2026-04-21_to_2026-04-27",
      "goal": "Stabilize...",
      "committed_points": 21,
      "completed_points": 19,
      "velocity": 19,
      "spillover": 2,
      "retrospective_actions_completed": 3,
      "retrospective_actions_total": 3
    }
  ],
  "rolling_avg_last_3": 19.0,
  "trend": "stable"
}
```

### 9.2 Burndown (intra-sprint)

Aggiornato daily da team-tpm:
- Asse X: giorno sprint (1-7)
- Asse Y: remaining story points
- Ideal line: linear decrescente
- Actual line: reale

Se actual >20% sopra ideal a day 5 → **Scope adjustment alert** team-tpm dispatch.

### 9.3 DORA Metrics (mensili)

- **Deployment Frequency**: target 1/sett (prod fine sett gate)
- **Lead Time for Changes**: commit → prod target <24h
- **Change Failure Rate**: target <15%
- **Mean Time to Recovery**: rollback auto <5 min

### 9.4 Metrics per ogni sprint

Obbligatori in Sprint Review:

| Metrica | Baseline sett 1 | Target fine PDR (sett 8) |
|---------|-----------------|--------------------------|
| Vitest PASS | 12103 | 14000+ |
| Benchmark score (0-10) | 2.77 | 8.0+ |
| E2E spec count | 0 | 50+ |
| Bundle size KB | TBD | <5000 |
| Build time sec | 55 | <60 |
| Lighthouse perf | TBD | >85 |
| Principio Zero v3 violations | 0 | 0 |
| Sentry errors/day | TBD | <10 |
| Test coverage % | TBD | >80% |

---

## 10. Definition of Done (DoD)

### 10.1 DoD Task (a commit level)

Task considered "done" SOLO se tutti:

- [ ] Codice implementato matches blueprint/spec
- [ ] Test RED-GREEN-REFACTOR (TDD strict)
- [ ] Vitest new test >= 1 per scenario principale
- [ ] CoV 3x consistent (3 run identici)
- [ ] Lint zero warning new
- [ ] Type check zero error new (TypeScript)
- [ ] Principio Zero v3 preserved (grep source zero match forbidden)
- [ ] Commit atomico con message convention `tipo(area): descrizione`
- [ ] Co-Author tag: `Claude Opus 4.7`
- [ ] Acceptance Criteria 100% PASS
- [ ] Reviewer APPROVE (team-reviewer verdict)

### 10.2 DoD Story (a PR level)

- [ ] Tutti task della story DONE
- [ ] PR description completa (goal + evidence + test plan + rollback plan + risks + screenshots)
- [ ] CI GitHub Actions green
- [ ] No regressione test count
- [ ] Playwright E2E smoke (5 spec minimi) PASS
- [ ] Documentation aggiornata (se applicabile)
- [ ] CHANGELOG.md entry

### 10.3 DoD Sprint (a release level, fine sett)

13 check hard gate (`scripts/cli-autonomous/end-week-gate.sh`):

1. [ ] Tutti TN-XXX task tasks-board.json status=done OR spillover esplicitamente accettato
2. [ ] git log count commits >= story count done
3. [ ] git rev-list origin/feature/.. HEAD == 0 (tutto pushato)
4. [ ] gh run list ultimo CI success
5. [ ] Vitest baseline +delta >= target settimana
6. [ ] npm run build PASS exit 0
7. [ ] Deploy preview ultima success (curl 200)
8. [ ] Deploy prod success (via auto-merge main + vercel --prod)
9. [ ] Principio Zero v3 live prod: grep response zero match
10. [ ] Playwright E2E smoke suite PASS (5 spec minimi)
11. [ ] Benchmark delta registrato `docs/benchmarks/sett-N.json`
12. [ ] Sprint Review + Retrospective scritti
13. [ ] Zero blocker aperti (`automa/team-state/blockers.md` OPEN list vuota)

Se TUTTI PASS → sett N+1 inizia lun mattina.
Se qualsiasi FAIL → team-auditor investigate + Andrea decision STOP/ADJUST.

---

## 11. Pratiche XP (Extreme Programming) integrate

### 11.1 Test-Driven Development (TDD)

- **RED**: scrivi test che fallisce
- **GREEN**: minimo codice per passare test
- **REFACTOR**: migliora codice senza rompere test

Enforcement: skill `superpowers:test-driven-development` dispatch mandatory.

### 11.2 Continuous Integration

- Ogni push → CI GitHub Actions "E2E Tests" workflow
- CI verde mandatory prima merge
- CI rosso → blocker immediato, fix entro 2h OR rollback

### 11.3 Continuous Deployment

- Ogni merge main → deploy prod vercel auto (via `scripts/cli-autonomous/deploy-prod.sh`)
- Post-deploy test-on-deployed.sh mandatory
- Rollback auto se test fail

### 11.4 Pair Programming

- Andrea + Tea (da mer 23/04) formal pair session settimanale 2h
- Agent pair: architect + dev su task >8 point

### 11.5 Collective Code Ownership

- Tutti team agent possono editare file non-critical (tramite CODEOWNERS Tea path safe)
- File critici LOCKED require coordinazione Andrea

### 11.6 Sustainable Pace

- Andrea max 40h/sett, weekend riposo obbligatorio
- Team agent quota Max monitor daily, se <20% → pace down
- Burnout alert in retrospective se team_mood <6/10

### 11.7 Small Releases

- Deploy preview ogni commit user-facing
- Deploy prod ogni fine sett (1 per sprint)
- Hotfix consentiti solo P0 critico prod down

---

## 12. Anti-pattern (evitare assolutamente)

- ❌ **Scope creep mid-sprint** (aggiungere story senza toglierne altrettante)
- ❌ **Gold plating** (feature non richieste "perché bello")
- ❌ **Big bang deploy** (attesa fine sprint per deploy, no incremental)
- ❌ **Hero syndrome** (Andrea fa tutto, team agent sotto-utilizzati)
- ❌ **Feature factory** (output senza outcome measurabile)
- ❌ **Retrospective theater** (lista senza enforcement)
- ❌ **Velocity as target** (gaming system, inflation point)
- ❌ **Skip CoV** (un run vitest invece di 3)
- ❌ **Merge senza review** (violazione DoD task)
- ❌ **Commit non atomici** (mix unrelated changes)
- ❌ **Self-approval** (agent approve proprio lavoro, bias leniency)

---

## 13. Integrazione con Harness 2.0 + Agent Teams

### 13.1 Sprint Contract = Harness 2.0 contract

Lo Sprint Contract Agile è esattamente il pattern Sprint Contract descritto in [Anthropic Harness Design](https://www.anthropic.com/engineering/harness-design-long-running-apps): team-architect (generator) + team-auditor (evaluator) negoziano acceptance criteria PRIMA implementation.

### 13.2 Agent Teams = Scrum Team

Paradigma **Agent Teams** (CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1) implementa Scrum Team:
- **Team lead** = team-tpm (coordinazione)
- **Teammates** = architect + dev + tester + reviewer + auditor (parallel, own context)
- **Shared task list** = tasks-board.json + mailbox Agent Teams built-in
- **Hooks enforcement DoD**: `TeammateIdle`, `TaskCreated`, `TaskCompleted` con exit code 2 se criteri non rispettati

### 13.3 4 Grading Criteria = Sprint Review metrics

- Design Quality / Originality / Craft / Functionality valutati ogni Sprint Review
- Media = Sprint score 0-10
- Trend across sprint in `docs/reviews/sprint-scores-trend.md`

---

## 14. Cerimonie Scrum calendario 8 settimane

| Data | Cerimonia | Output |
|------|-----------|--------|
| **Lun 21/04** | Sprint 1 Planning | Sprint Contract sett 1 |
| **Mar-Sab** | Daily Standup × 6 | `automa/team-state/daily-standup.md` |
| **Dom 27/04** | Sprint 1 Review + Retrospective | `docs/reviews/sprint-1-review.md` + `docs/retrospectives/sprint-1-retrospective.md` |
| **Lun 28/04** | Sprint 2 Planning | Sprint Contract sett 2 |
| ... | ... | ... |
| **Dom 15/06** | Sprint 8 Review + Retrospective | **v1.0 Release Retrospective** + post-mortem completo |

---

## 15. Tools & Artifacts

### 15.1 File system

```
automa/team-state/
├── tasks-board.json              # Kanban board
├── daily-standup.md              # Daily Scrum output
├── decisions-log.md              # ADR
├── blockers.md                   # Impediment log
├── product-backlog.md            # Epic + Story + Task gerarchico
├── sprint-contracts/
│   ├── sett-1-contract.md
│   ├── sett-2-contract.md
│   └── ...
docs/
├── reviews/
│   ├── sprint-1-review.md
│   └── ...
├── retrospectives/
│   ├── sprint-1-retrospective.md
│   └── ...
├── benchmarks/
│   ├── sett-1.json
│   └── ...
└── audit/
    ├── day-NN-audit.md
    └── sett-N-gate.md

automa/state/
├── velocity-tracking.json        # Velocity rolling avg
├── burndown-sett-N.json          # Intra-sprint burndown
└── claude-progress.txt           # Cross-session state recovery
```

### 15.2 Skill invocation pattern

Tutte cerimonie Scrum invocate via Skill tool:

- **Sprint Planning**: `/superpowers:writing-plans` + `/claude-mem:make-plan`
- **Daily Standup**: team-tpm dispatch (no skill diretta, comando dedicato)
- **Sprint Review**: script custom `scripts/cli-autonomous/sprint-review.sh`
- **Sprint Retrospective**: script custom `scripts/cli-autonomous/sprint-retrospective.sh`
- **Refinement**: team-architect + team-auditor pair

---

## 16. Success criteria metodologia Agile ELAB

A fine PDR 8 settimane, considereremo Agile adoption riuscito se:

- [ ] 8/8 Sprint Planning eseguiti con Sprint Contract documentato
- [ ] 56/56 Daily Standup generati (100% copertura)
- [ ] 8/8 Sprint Review completi con demo deploy prod
- [ ] 8/8 Sprint Retrospective con 3 improvement actions ciascuno
- [ ] Velocity trend stabile o crescente (rolling avg ≥ baseline)
- [ ] Change Failure Rate <15% (rollback <1/8 sprint)
- [ ] Mean Time to Recovery <5 min (rollback auto funzionante)
- [ ] 0 blocker aperti più di 3 giorni consecutivi
- [ ] Team mood medio ≥7/10 in retrospective
- [ ] DoD enforce 100% (no merge senza tutti check PASS)

---

## 17. Riferimenti

- [Agile Manifesto](https://agilemanifesto.org/)
- [Scrum Guide 2020](https://scrumguides.org/scrum-guide.html)
- [Anthropic Harness Design for Long-Running Applications](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- [Claude Code Agent Teams Documentation](https://code.claude.com/docs/en/agent-teams)
- [XP Practices (Extreme Programming)](http://www.extremeprogramming.org/)
- PDR Ambizioso ELAB: `docs/pdr-ambizioso/PDR_GENERALE.md`

---

**Firma**: Andrea Marro (PO) — Claude Opus 4.7 team (6 agents) — Tea Babbalea (co-developer)
**Data approvazione**: 2026-04-21
**Revisione prossima**: fine Sprint 1 (dom 27/04/2026) con retrospective
