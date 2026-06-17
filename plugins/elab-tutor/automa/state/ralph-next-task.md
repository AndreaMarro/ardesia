# Ralph Loop — Next Task Consensus

**Status:** ASSIGNED: TASK 11a
**Updated by:** interactive-session (Andrea + Claude pilot) — sync post run-1 + TASK 3 + flaky fix
**Updated at:** 2026-04-17T19:35Z

## Note per il prossimo fire builder (22:12 locale)

- **Baseline aggiornata a 12056** (non più 12039). Il flaky che aveva bloccato run-1 è stato fixato in commit `f38aacb`. Se il pre-commit hook del progetto usa ancora 11983 come baseline interna ignora — è il minimo storico. `tests_min_required` in metrics.json è ora 12056.
- **TASK 3 è già stato chiuso** in sessione interactive (commit `8837e32`). Il builder NON deve rifarlo — deve fare TASK 11a come assegnato.
- Se leggi questo file e vedi Status `ASSIGNED: TASK 11a`, procedi con quello. È SAFE (solo documentazione, no modifiche a file critici).

## Istruzioni pilot (da Andrea)

Il builder deve fare TASK 11a (OpenClaw/clawbot valutazione) perche' TASK 3-5 (allineamento Vol3) li faccio io in sessione interactive (richiedono lettura PDF libro + match circuit specifico che e' piu' veloce sincrono).

Builder puo' dopo: se TASK 11a completato → Status tornera' PENDING e prendera' il prossimo `[ ]`.

## TASK 11a — Criteri "fatto" espliciti (misurabili)

Output: `docs/strategia/2026-04-18-openclaw-valutazione.md`

Criteri OBBLIGATORI (tutti devono essere soddisfatti):

1. **Ricerca WebSearch real-time** — il doc DEVE contenere almeno 5 URL fonte 2026 con `[titolo](url)` markdown
2. **3+ use case ELAB concreti** valutati individualmente:
   - A) Dev ops: Ralph Loop alert Andrea Telegram
   - B) Docente: report fine lezione su Telegram
   - C) Commerciale: alert Fagherazzi/Omaric quando sessione fallita
3. **Per ogni use case**: fattibilita' tecnica + costo mese + alternative (email, Slack, Discord, push PWA) + raccomandazione **SI/NO con motivo**
4. **Valutazione come architettura sistema** (richiesto da Andrea): OpenClaw puo' essere la spina dorsale dell'orchestrazione automi ELAB? Decisione motivata.
5. **Honest tradeoffs section**: almeno 3 rischi/limiti espliciti

Deliverable PDR: D8 (da `automa/state/ralph-mission.md`).

## File critici — intoccabili senza ESCALATE

(invariato — vedi mission.md)

## Completati

- [x] TASK 1 — Drawing persistence per experimentId → commit 59e8fce
- [x] TASK 2 — FloatingToolbar drag fix → commit 62c9702
- [x] TASK 3 — Allinea v3-cap6-esp1 libro p.56 (+ esp2 p.57) → commit 8837e32
- [x] TASK 6 — useUnlimNudge integration → commit 62c9702
- [x] TASK 7 — ensureBookCitation → commit 8293e3f
- [x] TASK 10 — Vercel /api/tts proxy → commit 927cdbd
- [x] TASK 11b — Ricerca web validata 2026 → commit 59e8fce
- [x] Fix flaky parallelismoVolumiReale → commit f38aacb

## Rimanenti (priorità top-down)

- [ ] TASK 11a — OpenClaw valutazione ← ASSIGNED qui al builder automatico (prossimo fire 22:12)
- [ ] TASK 4 — Allinea v3-cap7-esp1 libro p.65 ← INTERACTIVE (Claude) prossimo
- [ ] TASK 5 — Allinea v3-cap7-esp5 libro p.77 ← INTERACTIVE (Claude) dopo TASK 4
- [ ] TASK 12 — Handoff doc
- [ ] TASK 11 — Dashboard docente Supabase (richiede schema review Andrea)
- [ ] TASK 8 — E2E Vision Playwright MCP (richiede approval)
- [ ] TASK 9 — E2E Voice Playwright MCP (richiede approval)

## Status machine

(invariato)

## Storico Status (append-only)

- 2026-04-18T08:55Z: PENDING (seed interactive)
- 2026-04-17T11:32Z: PENDING + flaky_known (run-1 no commit — comportamento corretto)
- 2026-04-17T11:43Z: flaky_fixed (commit f38aacb, baseline stabile 12039)
- 2026-04-17T11:55Z: ASSIGNED: TASK 11a (pilot da Andrea — builder fa doc mentre Claude interactive allinea Vol3)
- 2026-04-17T19:24Z: TASK 3 completato (commit 8837e32) — baseline 12056
- 2026-04-17T19:35Z: sync metrics + next-task (ASSIGNED: TASK 11a confermato per prossimo fire 22:12)
