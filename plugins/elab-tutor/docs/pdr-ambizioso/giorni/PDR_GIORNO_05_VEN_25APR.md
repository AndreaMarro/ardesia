# PDR Giorno 5 — Venerdì 25/04/2026

**Sett**: 1 (STABILIZE)
**Owner**: Andrea + Tea + Team Opus
**Capacity**: Andrea 8h + Tea 4h

## 0. Goal del giorno

**Bug T1 #5 (Dashboard pochi dati reali) + Bug T1 #6 (Voice E2E) + CODEOWNERS finale + call settimanale.**

## 1. Pre-flight (9:00)

```bash
git status
git pull
npx vitest run --reporter=dot | tail -3  # ≥12090
node scripts/benchmark.cjs --fast        # check score current
```

## 2. Task del giorno

### Task 1 (P0) — Bug T1 #5: Dashboard dati reali (3h)
- **Owner**: ARCHITECT + DEV + TESTER
- **Files**: `src/services/teacherDataService.js`, `src/components/dashboard/DashboardShell.jsx` (NEW se assente)
- **Acceptance**: Supabase resume + verify 51+ sessioni reali load + display
- **Test**: integration test query Supabase + render dashboard

### Task 2 (P0) — Bug T1 #6: Voice E2E completion (3h)
- **Owner**: DEV + TESTER PTC
- **Files**: `tests/e2e/voice-36-commands.spec.js`
- **Acceptance**: 36 voice command E2E PASS (PTC use case 8)
- **Test**: PTC parallel 36 command run

### Task 3 (P0) — CODEOWNERS finale + size limit guard (1h)
- **Owner**: DEV
- **Files**: `.github/CODEOWNERS` finalize + `.github/workflows/auto-merge-tea.yml` enhance
- **Acceptance**: size limit 500 LoC enforced, deny if violated

### Task 4 (P1) — Call settimanale Andrea + Tea (1h, 18:00)
- **Owner**: Andrea + Tea (Telegram voice o Zoom)
- **Agenda**:
  1. Review settimana (Andrea: 6 bug T1 status, Tea: PR fatti, blocker)
  2. Roadmap sett 2 (Together AI, Hetzner, RunPod)
  3. Tea capacity sett 2 (target 12h)
  4. Decisioni roadmap

### Task 5 (P2) — Tea PR #2 esperimenti vol1 cap 1-3 (Tea autonomous)
- **Owner**: Tea
- **Files**: `src/data/experiments-vol1.js` (refine descrizioni)
- **Acceptance**: PR auto-merged

## 3. Multi-agent dispatch

### Mattina 10:00 — parallel
```
@team-architect "Design Dashboard MVP shell.
Read: src/services/saveSession.js + supabase tables (sessions, students, classes).
Output: docs/architectures/dashboard-mvp-shell.md."

@team-dev "Bug T1 #5 fix: implement Dashboard MVP.
Files: src/services/teacherDataService.js (NEW) + src/components/dashboard/DashboardShell.jsx (NEW se assente).
Read 51+ sessions reali from Supabase, render basic stats."

@team-tester "PTC use case 8: 36 voice command E2E parallel.
File: tests/e2e/voice-36-commands.spec.js.
Use Semaphore(6) per browser load.
Acceptance: 36/36 PASS, 0 violations Principio Zero v3."
```

### Pomeriggio 14:00
- @team-reviewer review PR aperti
- Andrea integra + merge

### Sera 18:00
- Call Tea Telegram voice (1h)

### Tardo 19:00
- Andrea handoff

## 4. Programmatic Tool Calling

**Use case**: PTC 8 (36 voice command parallel)

Vedi PROGRAMMATIC_TOOL_CALLING.md sezione 3 use case 8 per codice completo.

## 5. Comunicazione
- Call Tea 18:00 (1h Telegram voice)

## 6. Definition of Done giorno 5
- [ ] Bug T1 #5 fix Dashboard real data merged
- [ ] Bug T1 #6 fix Voice 36/36 E2E PASS
- [ ] CODEOWNERS + size guard finalize
- [ ] Call Tea fatta + Tea PR #2 auto-merged
- [ ] Test count ≥12150
- [ ] Handoff doc

## 7. Rischi
- Supabase project paused (401) → resume manual mandatory
- Voice 36 E2E lento (>30 min) → split in 6 batch da 6 parallel
- CODEOWNERS edge case (Tea modifica path safe + critical mix) → reject + manual review

## 8. Skills + MCP
- `supabase` MCP (resume + list tables)
- `playwright` MCP (voice E2E)
- `superpowers:debugging` (Dashboard data flow)

## 9. Self-critica
[Compilare]

## 10. Handoff
`docs/handoff/2026-04-25-end-day.md`

---
**Forza ELAB. Bug T1 #5 + #6 down. Call Tea sera.**
