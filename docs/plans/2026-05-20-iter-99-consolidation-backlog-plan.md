# ELAB iter-99 — Piano consolidamento + backlog triage

**Data:** 2026-05-20
**Stato:** APPROVATO da Andrea. Partenza: Fase 2.

## Contesto

Il Ralph Loop iter-99 (mBlock C++-first Arduino Nano R4) è andato in runaway:
`iteration 93`, `max_iterations: 0` = infinito, non si sarebbe mai fermato da solo.
Andrea ha scelto "Ferma e consolida". Loop cancellato (rimosso `.claude/ralph-loop.local.md`).
Questo piano riporta ELAB a uno stato pulito prima di riprendere la mission.

## Doc-sync — drift rilevato (evidenza diretta)

- **D1** CLAUDE.md gonfio: ~2000 righe di log iter 1-82 caricate ogni sessione; le parti
  evergreen (Principio Zero, Morfismo, stack, file critici, regole) sono sepolte.
- **D2** Inflazione score sistemica: decine di iterazioni auto-assegnate 8.0-9.55
  "ONESTO G45 cap" — contro il mandato G45 (score reale 5.8 vs self 8.6; vietato
  auto-score >7 senza agenti indipendenti).
- **D3** CLAUDE.md auto-contraddittorio: "Mac Mini DEAD" (5 righe) vs iter 62
  "Mac Mini ALIVE / claim DEAD STALE".
- **D4** "Bug/gap aperti" stale: dice "Playwright E2E 0 spec" ma esistono spec E2E
  + la skill elab-harness-real-runner.
- **D5** baseline-tests.txt drift: pre-push legge 13118; vitest reale 14755.

## Automation — capping, non aggiunta

- **A1** Ralph-loop futuro: `max_iterations` finito (10-15), MAI `0`.
- **A2** Ispeziona 3 scheduled-task `ralph-*` in `~/.claude/scheduled-tasks/`.
- **A3** ~25 file `.in_use` stale nel cache del plugin ralph-loop — cleanup minore.

## Piano — 4 fasi

**Regola ferrea: backlog PRIMA di nuovi atomi.**

### Fase 0 — Discovery (FATTA)
Macchina del loop, stato PR, stato doc verificati.

### Fase 1 — Atterra iter-99 (azione Andrea)
- PR #127 (R2 consolidato, vitest 14755) → review + merge.
- PR #126 (fix CI hardcoded path) → review + merge.
- Verifica: CI main verde, vitest 14755 tiene.

### Fase 2 — Triage backlog PR (IN CORSO) ← blocco vero
- 13 PR aperte oltre iter-99: iter 94-98 (#118 #120 #121 #122 #123)
  + mega-PR #60 (263 commit) + draft vecchie (#59 #61 #71 #76 #78 #86 #92).
- Per ognuna: scheda triage (cosa fa, rilevanza, conflitti, merge/close). Decisione = Andrea.
- Verifica: PR aperte → ~0-2, main unica fonte di verità.

### Fase 3 — Riconciliazione doc onesta
- CLAUDE.md: archivia log iter 1-82 in docs/HISTORY.md, tieni evergreen, risolvi
  contraddizioni, stop al rituale score.
- Fix "Bug/gap aperti". Sync automa/baseline-tests.txt → 14755.
- Verifica: CLAUDE.md < ~400 righe, zero contraddizioni.

### Fase 4 — Riprendi mission mBlock controllata
- Leggi docs/prompts/RALPH-LOOP-mBlock-elab-nanor4-mission.md per intero.
- R3→R14: 1 atom = 1 branch da main = 1 PR pulita. NO stacking, NO auto-merge,
  NO loop infinito. R1 (deploy Render) = azione Andrea non bloccante.
- Verifica per atom: vitest ≥ baseline, build PASS.

## Anti-pattern vietati (tutta la durata)

PR impilate su PR non mergiate · auto-merge nel repo · loop infiniti ·
score auto-assegnati >7 · "ONESTO" come decorazione.
