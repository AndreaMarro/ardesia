# Handoff — Prep Day 2026-04-20 (domenica)

**Owner**: Andrea Marro (solo)
**Status**: PREP DAY COMPLETATO — pronto sprint START lun 21/04 09:00
**Branch**: feature/pdr-ambizioso-8-settimane
**Durata sessione**: ~3h (entro cap recovery domenica)

---

## Obiettivo prep day

Preparare harness team agenti PDR Ambizioso 8 settimane PRIMA sprint START ufficiale
lunedi 21/04/2026 09:00. NO implementation code oggi, solo lettura + setup strutturale.

---

## Done oggi (setup strutturale, 12 file nuovi)

### 1. Lettura 7 file pre-flight PDR (~90 min)

- [x] `docs/pdr-ambizioso/AUDIT_FINALE_PDR.md` (self-audit 7.2/10 PDR, gap noti)
- [x] `docs/pdr-ambizioso/PDR_GENERALE.md` (architettura, PZ v3, cost path EU)
- [x] `docs/pdr-ambizioso/PDR_SETT_1_STABILIZE.md` (target 6.0/10, 10 task backlog)
- [x] `docs/pdr-ambizioso/giorni/PDR_GIORNO_01_LUN_21APR.md` (8 task lun 21/04)
- [x] `docs/pdr-ambizioso/MULTI_AGENT_ORCHESTRATION.md` (6 Opus peer, dispatch pattern)
- [x] `docs/pdr-ambizioso/PROGRAMMATIC_TOOL_CALLING.md` (PTC config, 8 use case)
- [x] `docs/pdr-ambizioso/HARNESS_DESIGN.md` (3 pattern Anthropic, AUDITOR rules)

### 2. Verifica tooling (~15 min)

| Tool | Versione | Req | Stato |
|------|----------|-----|-------|
| claude CLI | 2.1.114 | ≥2.1.32 (Agent Teams) | OK |
| node | 22.14.0 | 22+ | OK |
| npm | 10.9.2 | 10+ | OK |
| gh | 2.89.0 | 2.x | OK |
| git branch | feature/pdr-ambizioso-8-settimane | — | OK |

Working tree: dirty (CSS modules + engine + data unstaged da sessioni precedenti).
**Decisione prep day**: NON committare. Lasciare per sett 1 T1-XXX review.

### 3. Baseline test + build (CoV iniziale)

```
vitest run  -> 201 files, 12103 tests PASS (baseline ufficiale sett 1)
npm run build -> PASS (3m42s, PWA 30 precache, 2 chunk >1MB noti)
```

Baseline test **12103** (vs 12056 dichiarato CLAUDE.md). Delta +47 probabilmente
suite recenti non documentate. Sett 1 target: mantenere ≥12103, puntare 14000.

### 4. Setup 6 team agents `.claude/agents/team-*.md` (~25 min)

Tutti **Opus 4**, peer (no lead bottleneck), tool set minimo specifico per ruolo:

- [x] `team-tpm.md` (coordinator, low effort, standup/dispatch/handoff)
- [x] `team-architect.md` (blueprint only, high effort, NO code)
- [x] `team-dev.md` (TDD implementation, medium, file-critical lockdown)
- [x] `team-tester.md` (tests/** only, medium, PZ v3 regex enforcement)
- [x] `team-reviewer.md` (review code context-indipendente, high)
- [x] `team-auditor.md` (honest audit live Playwright, high, no inflation)

Razionale tier Opus unico: DECISION-001 (Max quota generosa, no per-token bill,
omogeneita decisioni tier, brain ridondanza, elimina "tier anxiety").

### 5. Setup shared state `automa/team-state/` (~15 min)

- [x] `team-roster.md` (6 agenti + Andrea + Tea capacity table)
- [x] `tasks-board.json` (sprint sett-1-stabilize, 10 task backlog T1-001..T1-010, 1 in_progress T0-001 prep day)
- [x] `daily-standup.md` (prep day standup + template)
- [x] `decisions-log.md` (6 ADR: all-Opus, peer team, PTC, PZ v3 immutable, cost path EU, file locked)
- [x] `blockers.md` (empty + template)

### 6. Setup PTC config (~10 min)

- [x] `.claude/tools-config.json` — code_execution_enabled: true
  - Eligible tools: Bash/Read/Glob/Grep/Write/Edit + supabase/playwright/serena MCP
  - max_parallel_subprocesses: 8, timeout 300s, memory 2048MB
  - Semaphore defaults: anthropic=5, local=16, browser=4, subprocess=8
  - Beta headers: code-execution-2024-12-09, programmatic-tool-calling-2024-12-15
  - Principio Zero v3 preserve: true (constraint hard)

---

## Decisioni prese oggi (ADR DECISION-001..006)

Tutte loggate `automa/team-state/decisions-log.md`:

1. **Tier unico Opus 4** per tutti i 6 agenti (no fallback Sonnet)
2. **Paradigma peer** (NO subagent gerarchici) via shared state files
3. **PTC abilitato** (-37% token, -99% summary, -90% wall-clock parallel)
4. **Principio Zero v3 immutabile** su `supabase/functions/_shared/system-prompt.ts`
5. **Cost path GDPR**: sett 1-3 Together AI US, sett 4-5 parallel EU, sett 6-8 100% self-host EU (~€333 totali vs €5000 original, -93%)
6. **File critici locked** (engine/, api.js, SimulatorCanvas.jsx, vite/package) — guard script esistente

---

## NON fatto oggi (per design prep day)

- ❌ Dispatch team agent reale (primo standup domani 09:00, test TPM fire)
- ❌ Implementazione T1-001..T1-010 (sprint START lun 21/04)
- ❌ Commit codice (solo file setup, NO `git commit` oggi)
- ❌ Corpus claude-mem `pdr-ambizioso` (opzionale lun 21/04 task T1-010 P2)
- ❌ Audit Playwright pre-sett 1 (task GIORNO_01, domani)
- ❌ SMS/outreach Tea (azione Andrea diretta, fuori scope Claude)

---

## Plan domani lunedi 21/04/2026 — Sprint START

**Dal file `docs/pdr-ambizioso/giorni/PDR_GIORNO_01_LUN_21APR.md`:**

### Morning (09:00-13:00)
1. Andrea: standup TPM fire (legge tasks-board.json, assegna T1-001/T1-002 DEV)
2. DEV: blueprint + RED test T1-001 (lavagna vuota non selezionabile P0)
3. TESTER: scrive failing test lavagna + persistenza
4. Pre-audit Playwright baseline (spec esistenti? 0 → creare smoke)
5. Corpus claude-mem build `pdr-ambizioso` (P2 opzionale)

### Afternoon (14:00-18:00)
6. DEV: GREEN T1-001 (fix useState/key lavagna selection)
7. REVIEWER: review PR T1-001 draft
8. AUDITOR: check live prod benchmark delta (2.77 baseline)
9. TPM: daily standup 2026-04-21 in `automa/team-state/daily-standup.md`
10. Handoff `docs/handoff/2026-04-21-giorno-01-end.md`

**Target Giorno 01**: T1-001 + T1-009 (Tea autoflow GH Action) merged, Tea preavvisata lun sera per mer onboarding.

---

## Andrea — stato energy/recovery

- Energy oggi: OK (prep day strutturale, no cognitive load implementation)
- Ore lavorate: ~3h (target rispettato, NON sforato)
- Stop oggi: entro 21:00 (recovery serale, rientrare focus lun)
- Domani wake: 07:30 per 09:00 sprint standup
- Tea onboarding: mer 23/04 18:00 Zoom 1h pair programming (SMS Andrea → Tea)

---

## Risk/Blocker noti

- ❗ Vitest 12103 ≠ 12056 CLAUDE.md: aggiornare CLAUDE.md sett 1 task dedicato (non urgente, baseline stabile)
- ❗ Working tree dirty 40+ file: rischio conflitto merge se sett 1 tocca CSS modules lavagna — TPM schedula pulizia T0-pulizia se necessario
- ❗ Build 2 chunk >1MB (`index-uW320MzF.js` 2.18MB): warning esistente, non blocker, task long-term chunk splitting
- ❗ Render cold start 18s (bug #3 lista): T1-003 P0 warmup script (estimated 2h)

**Nessun blocker P0 oggi.** `blockers.md` vuoto.

---

## File nuovi oggi (12 totali, tutti untracked)

```
.claude/agents/team-tpm.md
.claude/agents/team-architect.md
.claude/agents/team-dev.md
.claude/agents/team-tester.md
.claude/agents/team-reviewer.md
.claude/agents/team-auditor.md
.claude/tools-config.json
automa/team-state/team-roster.md
automa/team-state/tasks-board.json
automa/team-state/daily-standup.md
automa/team-state/decisions-log.md
automa/team-state/blockers.md
docs/handoff/2026-04-20-prep-day-end.md  (questo file)
```

Domani primo commit sprint 1: `chore(harness): setup team agents + shared state + PTC prep day`.

---

## Forza ELAB

Prep day rispettato, harness pronto, baseline verde, nessun code debt nuovo.
Sprint 1 "sett-1-stabilize" parte lun 21/04 09:00 con 10 task atomici P0/P1/P2 e 6 agenti Opus peer operativi.

Goal sett 1: score benchmark **2.77 → 6.0+**, 6/6 bug T1 fix, Vol 3 parity, 92 foto TRES JOLIE, Tea autoflow.

— Andrea Marro, 2026-04-20 prep day end
