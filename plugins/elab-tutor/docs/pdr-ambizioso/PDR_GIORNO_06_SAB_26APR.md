# PDR Giorno 6 — Sabato 26/04/2026

**Sett**: 1 (STABILIZE)
**Owner**: Andrea + Team Opus (Tea opzionale)
**Capacity**: Andrea 6h (sabato light) + Tea opzionale BOM call

## 0. Goal del giorno

**Buffer giornata: completa task slittati + score benchmark ≥6.0 verify + BOM call (opzionale Tea + Omaric).**

## 1. Pre-flight (10:00 sabato)

```bash
git status
git pull
npx vitest run --reporter=dot | tail -3  # ≥12150
node scripts/benchmark.cjs --write
cat automa/state/benchmark.json | jq '.score'  # target ≥6.0
```

## 2. Task del giorno

### Task 1 (P0) — Buffer task slittati lun-ven (3h)
- **Owner**: Andrea + Team
- **Acceptance**: tutti task P0 sett 1 chiusi (6/6 bug T1, Vol3 cap 6-8, Tea autoflow, foto)

### Task 2 (P0) — Score benchmark verify (1h)
- **Owner**: AUDITOR agente
- **Files**: `automa/state/benchmark.json`, `docs/audits/2026-04-26-score-onesto-fine-sett1.md`
- **Acceptance**: score ≥6.0 verified onestamente, no inflation

### Task 3 (P1) — CoV 3x vitest stabile (PTC) (1h)
- **Owner**: TESTER PTC use case 3
- **Acceptance**: 3/3 run consistent ≥12150 PASS

### Task 4 (P1, opzionale) — BOM kit ELAB call Andrea + Tea + Omaric (1h)
- **Owner**: Andrea
- **Topics**: lista componenti finale kit fisico, quote Omaric, deadline ordine
- **Output**: `docs/business/bom-kit-elab-v1-meeting-notes.md`

### Task 5 (P2) — Documentazione settimana 1 polish (1h)
- **Owner**: TPM agente + Andrea
- **Files**: `docs/handoff/2026-04-26-end-day.md` (preparazione handoff sett)

## 3. Multi-agent dispatch

### Mattina 11:00 — parallel
```
@team-auditor "Live verify FINE SETTIMANA 1.
Check tutti DoD sett 1 (vedi PDR_SETT_1_STABILIZE.md sezione Definition of Done).
Output: docs/audits/2026-04-26-score-onesto-fine-sett1.md.
NESSUNA inflation. Real evidence."

@team-tester "PTC CoV 3x vitest run.
Verifica consistency 12150+ PASS in 3 run."

@team-tpm "Verifica tasks-board.json finale sett 1.
Tutti task in 'merged'? Se carry-over open → flag in blockers.md.
Prepara backlog sett 2 (read PDR_SETT_2_INFRA.md)."
```

### Pomeriggio 15:00 (opzionale)
- BOM call Andrea + Omaric + Tea (1h)

### Sera 17:00
- Andrea handoff (anticipato sabato)

## 4. Programmatic Tool Calling

**Use case**: CoV 3x vitest (use case 3)

```python
import asyncio
import subprocess
import re

def run_vitest():
    res = subprocess.run("cd '/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder' && npx vitest run --reporter=dot 2>&1 | tail -5",
                         shell=True, capture_output=True, text=True, timeout=600)
    pm = re.search(r'Tests\s+(\d+)\s+passed', res.stdout)
    return int(pm.group(1)) if pm else 0

async def main():
    runs = await asyncio.gather(*[asyncio.to_thread(run_vitest) for _ in range(3)])
    return {
        "runs": runs,
        "pass_min_12150": all(r >= 12150 for r in runs),
        "consistent": len(set(runs)) == 1
    }

print(asyncio.run(main()))
```

## 5. Comunicazione
- BOM call (opzionale 15:00, 1h)

## 6. Definition of Done giorno 6
- [ ] Tutti task P0 sett 1 chiusi
- [ ] Score benchmark verified ≥6.0 onestamente
- [ ] CoV 3x vitest 3/3 PASS consistent
- [ ] BOM call fatta (se schedulato)
- [ ] tasks-board sett 2 backlog ready
- [ ] Handoff doc

## 7. Rischi
- Score <6.0 → onesto OK ≥5.5 (vedi PDR_SETT_1 self-critica)
- BOM call cancellata → reschedule sett 2
- Carry-over molti P0 → indaga blocker, slittare sett 2

## 8. Skills + MCP
- `superpowers:writing-plans` (handoff prep)
- AUDITOR pattern Anthropic Mar 2026

## 9. Self-critica
[Compilare]

## 10. Handoff
`docs/handoff/2026-04-26-end-day.md` (anticipato per sabato)

---
**Forza ELAB. Sabato buffer + score verify.**
