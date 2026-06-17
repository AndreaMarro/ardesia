# PDR Giorno 1 — Lunedì 21/04/2026

**Sett**: 1 (STABILIZE)
**Owner**: Andrea (lead) + Team Opus setup
**Capacity**: Andrea 8h (Tea NO oggi, onboard mer 23/04)

---

## 0. Goal del giorno

**Setup harness completo + pre-audit produzione + branch ready per sett 1.**

---

## 1. Pre-flight (9:00)

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git status                               # Expected: clean (verificare)
git pull origin main                     # Sync ultimo
npx vitest run --reporter=dot | tail -3  # Baseline 12056+ PASS
npm run build 2>&1 | tail -10            # Build PASS verify
claude --version                         # Required ≥2.1.32
ls .claude/agents/                       # Existing agent check
```

**Expected output**:
- `git status`: nothing to commit, working tree clean
- `vitest`: `Tests 12056 passed`
- `build`: PASS no errors
- `claude --version`: ≥2.1.32

**Se anomalia**: STOP, indagare prima di procedere.

---

## 2. Task del giorno

### Task 1 (P0) — Setup `.claude/agents/team-*.md` (6 file Opus)
- **Stima**: 2h
- **Owner**: Andrea
- **Files**: `.claude/agents/team-tpm.md`, `.claude/agents/team-architect.md`, `.claude/agents/team-dev.md`, `.claude/agents/team-tester.md`, `.claude/agents/team-reviewer.md`, `.claude/agents/team-auditor.md`
- **Acceptance**: 6 file YAML+MD con `model: opus`, tools restrittivi, ruolo chiaro
- **Test**: dispatch test ogni agente single message → verifica risponde

### Task 2 (P0) — Setup `automa/team-state/` directory + 5 file
- **Stima**: 30 min
- **Owner**: Andrea
- **Files**: `automa/team-state/tasks-board.json`, `daily-standup.md`, `decisions-log.md`, `blockers.md`, `team-roster.md`
- **Acceptance**: file inizializzati con schema corretto

### Task 3 (P0) — Setup `.claude/tools-config.json` (PTC enable)
- **Stima**: 30 min
- **Owner**: Andrea
- **Files**: `.claude/tools-config.json`
- **Acceptance**: `code_execution_enabled: true`, eligible tools list

### Task 4 (P0) — Branch `feature/pdr-ambizioso-8-settimane`
- **Stima**: 15 min
- **Owner**: Andrea
- **Acceptance**: branch creato, push origin, da PDR_GENERALE.md

### Task 5 (P0) — Pre-audit live produzione (Playwright MCP)
- **Stima**: 2h
- **Owner**: AUDITOR agente dispatch
- **Files output**: `docs/audits/2026-04-21-pre-audit-prod-onesto.md`
- **Acceptance**: 6 bug T1 confermati live (no skip, real evidence)

### Task 6 (P1) — claude-mem corpus build su `docs/pdr-ambizioso/`
- **Stima**: 30 min
- **Owner**: Andrea
- **Acceptance**: `list_corpora` mostra `pdr-ambizioso`, query test OK

### Task 7 (P1) — TPM dispatch primo standup test
- **Stima**: 30 min
- **Owner**: Andrea + TPM agente
- **Acceptance**: TPM scrive `daily-standup.md` con backlog sett 1

### Task 8 (P2) — Documentazione setup harness
- **Stima**: 1h
- **Owner**: Andrea
- **Files**: `docs/handoff/2026-04-21-end-day.md`
- **Acceptance**: handoff completo template standard

---

## 3. Multi-agent dispatch (Lunedì 21/04)

### Mattina 10:00 — primo dispatch parallel test

```
@team-tpm "Leggi PDR_SETT_1_STABILIZE.md.
Popola automa/team-state/tasks-board.json con backlog sett 1 completo.
Output JSON formato definito."

@team-auditor "Pre-audit produzione live. Use Playwright MCP.
URLs:
- https://www.elabtutor.school/#tutor (lavagna empty test)
- https://www.elabtutor.school/#dashboard (verify Supabase data)
- https://www.elabtutor.school/ (homepage perf)

Test 6 bug T1:
1. Lavagna vuota non selezionabile
2. Persistenza Esci (scritti spariscono)
3. Render cold start 18s
4. Vision non testata live
5. Dashboard pochi dati reali
6. Voice E2E completion

Output docs/audits/2026-04-21-pre-audit-prod-onesto.md.
NESSUNA inflation, evidence per ogni claim."
```

### Pomeriggio 14:00 — verifica output
- Andrea legge audit AUDITOR
- Andrea legge tasks-board TPM
- Andrea decide eventuali correzioni

### Sera 17:00 — handoff scrittura
- @team-tpm finalizza standup di domani
- Andrea scrive handoff doc

---

## 4. Programmatic Tool Calling — primo test

**Use case**: CoV 3x vitest run + aggregation

```python
import asyncio
import subprocess
import re

def run_vitest():
    res = subprocess.run(
        "cd '/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder' && npx vitest run --reporter=dot 2>&1 | tail -5",
        shell=True, capture_output=True, text=True, timeout=600
    )
    pm = re.search(r'Tests\s+(\d+)\s+passed', res.stdout)
    return {"passed": int(pm.group(1)) if pm else 0}

async def main():
    runs = await asyncio.gather(
        asyncio.to_thread(run_vitest),
        asyncio.to_thread(run_vitest),
        asyncio.to_thread(run_vitest)
    )
    return {
        "runs": runs,
        "cov_3x_pass": all(r["passed"] >= 12056 for r in runs),
        "consistent": len(set(r["passed"] for r in runs)) == 1
    }

print(asyncio.run(main()))
```

**Output atteso**: `{"runs": [{"passed": 12056}, ...], "cov_3x_pass": true, "consistent": true}` (~150 token in context)

---

## 5. Comunicazione

- Andrea solo (Tea onboarding mer 23/04)
- Async commit + push branch

---

## 6. Definition of Done giorno 1

- [ ] 6 team agenti `.claude/agents/team-*.md` creati
- [ ] `automa/team-state/` 5 file inizializzati
- [ ] `.claude/tools-config.json` PTC enabled
- [ ] Branch `feature/pdr-ambizioso-8-settimane` creato + pushed
- [ ] Pre-audit produzione: 6 bug T1 confermati con evidence
- [ ] claude-mem corpus `pdr-ambizioso` buildato
- [ ] TPM standup test OK
- [ ] PTC test (CoV 3x) OK
- [ ] Handoff doc scritto

---

## 7. Rischi giornata

| Rischio | Mitigazione |
|---------|-------------|
| Claude version <2.1.32 | `npm install -g @anthropic-ai/claude-code@latest` |
| Pre-audit Playwright lentissimo (>2h) | Limit to 6 bug T1 only, skip altre URL |
| TPM dispatch crash | Verifica YAML frontmatter syntax, retry |
| claude-mem hook conflict | Disable altri hook temporaneamente |
| Setup time esplodi >8h | Prioritize T1-T4, slip T5-T8 a martedì |

---

## 8. Skills + MCP usati

**Skills**:
- `superpowers:using-superpowers`
- `superpowers:writing-plans`
- `claude-code-guide` (claude-mem hook setup)

**MCP**:
- `playwright` (pre-audit prod)
- `plugin_claude-mem_mcp-search` (corpus build)

---

## 9. Self-critica (sera)

[Compilare fine giornata - cosa funzionato, cosa no, lezioni]

---

## 10. Handoff sera

Compilare `docs/handoff/2026-04-21-end-day.md`:
- Stato sistema (test count, build, score)
- Setup harness COMPLETED/PARTIAL
- Pre-audit findings sintesi
- Carry-over T6-T8 se necessario
- Domani task priority

---

**Forza ELAB. Lunedì 21/04 — sprint sett 1 START.**
