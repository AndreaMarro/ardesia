# PDR Giorno 7 — Domenica 27/04/2026

**Sett**: 1 (STABILIZE) — END OF WEEK
**Owner**: Andrea solo (Tea OFF domenica)
**Capacity**: Andrea 4h (domenica light, recovery)

## 0. Goal del giorno

**Handoff settimana 1 + retro brutale onesta + claude-mem rebuild + prep sett 2.**

## 1. Pre-flight (10:00 dom)

```bash
git status
git log --oneline | head -30  # commit fatti settimana
node scripts/benchmark.cjs --fast  # final score
```

## 2. Task del giorno

### Task 1 (P0) — Handoff settimana 1 (1.5h)
- **Owner**: Andrea + TPM agente
- **Files**: `docs/handoff/2026-04-27-end-sett1.md`
- **Acceptance**: handoff settimana completo (template standard)

### Task 2 (P0) — Retro brutale onesta (1h)
- **Owner**: Andrea + AUDITOR agente
- **Files**: `docs/retro/2026-04-27-retro-sett1.md`
- **Topics**:
  - Cosa funzionato (concrete examples)
  - Cosa NON funzionato (concrete examples)
  - Score real vs target (delta)
  - Tea integration health (capacity, blocker)
  - Team agenti dispatch effectiveness (count, rework rate)
  - Lezioni per sett 2

### Task 3 (P1) — claude-mem rebuild corpus (30 min)
- **Owner**: Andrea
- **Acceptance**: `mcp__plugin_claude-mem_mcp-search__rebuild_corpus pdr-ambizioso` OK + query test

### Task 4 (P1) — Update PDR_SETT_2 con learnings (30 min)
- **Owner**: Andrea
- **Files**: `docs/pdr-ambizioso/PDR_SETT_2_INFRA.md` (refine se needed)
- **Acceptance**: refine date, scope, risk basato su sett 1 reali

### Task 5 (P2) — RECOVERY day (no work post-15:00)
- **Owner**: Andrea
- **Acceptance**: stop dopo 15:00, recovery prep sett 2

## 3. Multi-agent dispatch

### Mattina 10:30 — minimal dispatch
```
@team-auditor "Retro brutale settimana 1.
Read: docs/handoff/* sett 1 + automa/state/benchmark.json + tasks-board.json.
Confronta target vs reality.
Identifica gap onesti.
Output: docs/retro/2026-04-27-retro-sett1.md.
NO inflation. Real numbers."

@team-tpm "Update tasks-board.json: spostare tutti task sett 1 da merged a archived.
Inizializza backlog sett 2 (read PDR_SETT_2_INFRA.md)."
```

### Pomeriggio 14:00
- Andrea legge retro AUDITOR
- Andrea aggiorna PDR_SETT_2 con learnings

### 15:00 STOP
- Recovery + nessun lavoro fino lun 28/04

## 4. Programmatic Tool Calling
- Solo claude-mem rebuild (non strict PTC, ma batch op)

## 5. Comunicazione
- Andrea solo. Tea OFF domenica.

## 6. Definition of Done giorno 7 (END SETT 1)
- [ ] Handoff settimana 1 scritto
- [ ] Retro brutale onesta scritta
- [ ] claude-mem rebuilt + query OK
- [ ] PDR_SETT_2 refined con learnings
- [ ] Andrea STOP 15:00 (recovery)

## 7. Definition of Done settimana 1 — VERIFICA FINALE

Vedi `PDR_SETT_1_STABILIZE.md` sezione "Definition of Done settimana 1":

**MUST HAVE** (blocking):
- [ ] 12056+ test PASS (CoV 3x)
- [ ] Build CI green
- [ ] Deploy prod green
- [ ] 6/6 bug T1 chiusi con E2E test
- [ ] Tea autoflow attivo + Tea PR ≥1 auto-merged green
- [ ] Vol 3 cap 6-8 bookText 100%
- [ ] 92 foto TRES JOLIE in `/public/tres-jolie/`
- [ ] Handoff doc settimana 1 scritto
- [ ] Score benchmark ≥6.0/10
- [ ] claude-mem corpus pdr-ambizioso buildato
- [ ] Team agenti Opus dispatch ≥5 volte loggato

Se ≥10/11 → settimana GREEN. Se <8/11 → RED, retro obbligatoria.

## 8. Rischi
- Retro inflated (auto-bias) → AUDITOR independent obbligatorio
- claude-mem rebuild lento → background task
- Andrea continua oltre 15:00 → DISCIPLINE: stop

## 9. Skills + MCP
- `plugin_claude-mem_mcp-search__rebuild_corpus`
- `superpowers:writing-plans` (handoff)
- AUDITOR Anthropic Mar 2026 pattern

## 10. Handoff settimana → sett 2
`docs/handoff/2026-04-27-end-sett1.md` template:

```markdown
# Handoff End-of-Sett 1 — 2026-04-27

## Stato finale settimana
- Branch: feature/pdr-ambizioso-8-settimane
- Commits sett: N
- PR merged sett: N
- Test count finale: N
- Build status: PASS
- Score benchmark: X.X/10
- Score growth: 2.77 → X.X (+Y.Y)
- DoD coverage: N/11 ✅

## Cosa fatto sett 1
[Lista PR, fix, feature]

## Cosa NON fatto (carry-over sett 2)
[Lista carry-over con priority]

## Decisioni prese
[ADR scritti, link]

## Anomalie + warning
[Sentry alert, side effects]

## Tea integration health
- Capacity utilizzata: Xh / 8h target
- PR merged Tea: N
- Auto-merge success rate: %
- Blocker Tea aperti: N

## Team agenti dispatch effectiveness
- Total dispatch: N
- Per agente breakdown: TPM, Architect, Dev, Tester, Reviewer, Auditor
- Rework rate (Reviewer REJECT): %
- Quota Max usata sett: %

## Sett 2 starts lun 28/04 con
1. [Task 1 priority]
2. [Task 2 priority]
3. ...

## Andrea stato (auto-evaluation)
- Energia: 1-10
- Burnout risk: low/med/high
- Decisione recovery extra se needed
```

---
**Forza ELAB. Sett 1 CHIUSA. Recovery domenica. Sett 2 lun 28/04.**
