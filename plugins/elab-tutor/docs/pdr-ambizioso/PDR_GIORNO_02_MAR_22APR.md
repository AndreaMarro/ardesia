# PDR Giorno 2 — Martedì 22/04/2026

**Sett**: 1 (STABILIZE)
**Owner**: Andrea + Team Opus
**Capacity**: Andrea 8h (Tea no, onboard mer)

## 0. Goal del giorno

**Bug T1 #1 (lavagna vuota non selezionabile) + Bug T1 #2 (persistenza Esci) fix + test E2E + Tea schema UX call.**

## 1. Pre-flight (9:00)

```bash
git status                              # clean
git pull origin feature/pdr-ambizioso-8-settimane
npx vitest run --reporter=dot | tail -3 # baseline ≥12056
cat docs/handoff/2026-04-21-end-day.md  # carry-over read
```

## 2. Task del giorno

### Task 1 (P0) — Bug T1 #1 fix: lavagna vuota non selezionabile (3h)
- **Owner**: ARCHITECT design + DEV implement + TESTER test (parallel dispatch)
- **Files**: `src/components/lavagna/LavagnaShell.jsx`, `tests/unit/lavagna/LavagnaShell-empty.test.jsx`, `tests/e2e/lavagna-empty-state.spec.js`
- **Acceptance**: lavagna vuota cliccabile → entra modalità draw, no crash, E2E PASS
- **Test**: vitest + Playwright E2E

### Task 2 (P0) — Bug T1 #2 fix: persistenza Esci (3h)
- **Owner**: DEV + TESTER (parallel)
- **Files**: `src/components/lavagna/LavagnaShell.jsx`, `src/services/lavagnaPersistence.js` (NEW), `tests/integration/lavagna-persistence.test.js`
- **Acceptance**: scritti lavagna persistono su Esci → Riapri, localStorage `lavagna_state`, E2E PASS
- **Test**: vitest integration + Playwright E2E

### Task 3 (P1) — Tea schema UX 3-zone call (1h)
- **Owner**: Andrea + Tea (Zoom)
- **Output**: `docs/architectures/tea-schema-ux-3-zone.md` (ARCHITECT formalizza post-call)
- **Acceptance**: schema 3-zone definito (Lavagna principale / UNLIM / Toolbar)

### Task 4 (P2) — Aggiornamento tasks-board.json (1h)
- **Owner**: TPM agente
- **Acceptance**: T1-001 + T1-002 mossi a `merged`, nuovi task per mer 23/04 in `todo`

## 3. Multi-agent dispatch

### Mattina 10:00 — parallel 4 agenti

```
@team-architect "Design fix bug T1 #1 + #2.
Read: src/components/lavagna/LavagnaShell.jsx attuale.
Identifica root cause empty state non cliccabile + persistenza Esci.
Output: docs/architectures/lavagna-fixes-t1.md (1 file, both bugs)."

@team-tester "Scrivi E2E spec per bug T1 #1 (vuota click) e #2 (persistenza).
File: tests/e2e/lavagna-empty-state.spec.js + tests/e2e/lavagna-persistence.spec.js.
Spec deve fallire su current main (verifica RED)."

@team-dev "ASPETTA blueprint Architect.
Quando ready, implementa fix entrambi bug.
TDD: assicurati spec Tester RED → tu fai GREEN.
PR singola con 2 fix (entrambi LavagnaShell, same task)."

@team-auditor "Live verify bug T1 #1 e #2 esistono ANCORA produzione (pre-fix).
Use Playwright MCP. Output evidence in docs/audits/2026-04-22-bug-t1-confirm-pre-fix.md."
```

### Pomeriggio 14:00 — Tea call (Zoom 1h)
Schema UX 3-zone discussione. Andrea + Tea brainstorm. Output ad ARCHITECT post-call.

### Tardo pomeriggio 16:00
- @team-reviewer "Review PR T1-001+T1-002 fix"
- Andrea merge se APPROVE

### Sera 17:30
- @team-tpm verifica board
- @team-auditor live verify post-fix (entrambi bug FIXED)
- Andrea handoff doc

## 4. Programmatic Tool Calling

**Use case**: post-fix CoV 3x vitest + E2E aggregation

```python
import asyncio
import subprocess

def run_vitest():
    res = subprocess.run("cd '/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder' && npx vitest run --reporter=dot 2>&1 | tail -5",
                         shell=True, capture_output=True, text=True, timeout=600)
    return {"output": res.stdout[-500:]}

def run_e2e():
    res = subprocess.run("cd '/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder' && npx playwright test tests/e2e/lavagna-*.spec.js 2>&1 | tail -10",
                         shell=True, capture_output=True, text=True, timeout=600)
    return {"output": res.stdout[-500:]}

async def main():
    vitest_runs = await asyncio.gather(*[asyncio.to_thread(run_vitest) for _ in range(3)])
    e2e_run = await asyncio.to_thread(run_e2e)
    return {"vitest_3x": vitest_runs, "e2e": e2e_run}

print(asyncio.run(main()))
```

## 5. Comunicazione
- Tea call Zoom 14:00 (1h) — schema UX
- Andrea + Tea async PR comments

## 6. Definition of Done giorno 2
- [ ] Bug T1 #1 fix merged + E2E PASS
- [ ] Bug T1 #2 fix merged + E2E PASS
- [ ] Tea schema UX 3-zone documentato
- [ ] tasks-board updated
- [ ] CoV 3x vitest PASS
- [ ] Build CI green
- [ ] Handoff doc scritto

## 7. Rischi
- Bug T1 #2 root cause profondo (BroadcastChannel vs localStorage) → time-box 3h, slip mer
- Tea call cancellata → reschedule mer mattina
- ARCHITECT blueprint vago → Andrea iterate

## 8. Skills + MCP
- `superpowers:test-driven-development`, `superpowers:debugging`, `playwright` MCP, `Claude_Preview` MCP

## 9. Self-critica (sera)
[Compilare]

## 10. Handoff sera
`docs/handoff/2026-04-22-end-day.md`

---
**Forza ELAB. Bug T1 #1 + #2 down today.**
