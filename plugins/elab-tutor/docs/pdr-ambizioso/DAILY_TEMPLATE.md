# Daily PDR Template — Giorno N (Giorno_settimana DD/MM)

**Sett**: N (NOME_SETT)
**Date**: DD/MM/2026
**Owner**: Andrea Marro (lead) + Tea Lea Babbalea + Team Opus
**Capacity**: Andrea 8h + Tea Xh + Team agenti dispatch

---

## 0. Goal del giorno (1 sentence)

[Es. "Setup Together AI account + integrate first test query Llama 70B."]

---

## 1. Pre-flight (9:00 mattina)

### Verifica stato
```bash
# CoV start-of-day
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git status                              # Expected: clean
git log -1 --oneline                    # Last commit SHA
npx vitest run --reporter=dot | tail -3 # Test count baseline
npm run build 2>&1 | tail -10           # Build status
cat automa/state/benchmark.json | jq '.score'  # Current score
```

### Lettura handoff giorno precedente
- File: `docs/handoff/<ieri>-end-day.md`
- Verifica: 4 check √ stato verificato
- Carry-over task identificati

### Dispatch TPM standup (9:00)
```
@team-tpm "Standup giorno N. Leggi handoff ieri.
Aggiorna automa/team-state/daily-standup.md.
Identifica priorità giornata + assegnazione team."
```

---

## 2. Task del giorno (concrete, time-boxed)

### Task 1 (P0) — [Titolo task]
- **Stima**: 2h
- **Owner**: DEV agente / Andrea / Tea
- **Files impacted**: `[lista file]`
- **Acceptance**: [criteri concreti]
- **Test**: [test obbligatori inline]

### Task 2 (P1) — [Titolo task]
- **Stima**: 1h
- **Owner**: TESTER agente
- **Files impacted**: `tests/...`
- **Acceptance**: [criteri]

### Task 3 (P2) — [Titolo task]
- **Stima**: 30 min
- **Owner**: Andrea
- **Files impacted**: `docs/...`

[continua per task del giorno]

---

## 3. Multi-agent dispatch pianificato

### Mattina (10:00-12:00)
Single message parallel dispatch:
```
@team-architect "[task design]"
@team-dev "[task implement]"
@team-tester "[task test]"
```

### Pomeriggio (14:00-17:00)
- Andrea integration + merge
- @team-reviewer pre-merge ogni PR
- @team-auditor live verify se task completed

### Sera (17:00-18:00)
- @team-tpm verifica board fine giornata
- @team-auditor quick audit: build PASS? test count? score?

---

## 4. Programmatic Tool Calling — se applicabile

**Use case oggi**: [es. CoV 3x vitest, batch operation, etc.]

**Container Python**:
```python
# [snippet PTC pertinente]
```

**Output atteso**: summary ~200 token in context.

---

## 5. Comunicazione team

### Andrea ↔ Tea
- Async: GH PR comments
- Sync: [se call schedulata]

### Andrea ↔ Team agenti
- Dispatch via Claude CLI
- Verifica output ogni 2h

---

## 6. Definition of Done giorno N

- [ ] Task 1 P0 completed (test PASS)
- [ ] Task 2 P1 completed
- [ ] Task 3 P2 completed (se time)
- [ ] PR merged: ≥N
- [ ] Test count: ≥N (no regressioni)
- [ ] Build CI green
- [ ] Score benchmark non scende
- [ ] Handoff doc scritto

---

## 7. Rischi giornata

| Rischio | Mitigazione |
|---------|-------------|
| [Rischio 1] | [Mitigazione] |
| [Rischio 2] | [Mitigazione] |

---

## 8. Self-critica fine giornata (sera)

[Compilare a fine giornata]
- Cosa funzionato
- Cosa NO
- Lezioni
- Modifica per domani

---

## 9. Handoff (18:00)

Compilare `docs/handoff/<oggi>-end-day.md` con template standard.

---

## 10. Skills + MCP usati oggi

[Lista skills + MCP attivi durante la giornata]

---

**Forza ELAB.**
