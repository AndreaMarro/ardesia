# severita-verificata

Un CRITICO falso costa un tick intero di verifica a builder+supervisore e erode la
fiducia nei report (il 2026-06-11 il report 20:17 su fbb96ff era 3/3 falsi positivi:
un NOOP-tick bruciato solo a smontarlo — triage 9d87534). Regola: la severità si
assegna DOPO aver verificato la raggiungibilità sul codice, mai su uno scenario ipotizzato.

## When-to-apply

- In review/adversarial: prima di scrivere "CRITICO" su qualunque finding.
- In triage: quando un report assegna CRITICO a un finding non ancora verificato sul codice.
- Quando un finding contiene "se...", "potrebbe", "verificare che": è un'ipotesi, non un finding.

## Checklist/Procedura

- [ ] **CRITICO solo se lo scenario è RAGGIUNGIBILE**: prima di emettere CRITICO, dimostra
  con grep/lettura che l'input incriminato può esistere nel codebase. Esempio VERO (report
  20:17 su fbb96ff, finding 1): "CRITICO `tests/test_dispensa.py:102` getattr su dict →
  purge silente" — ma `_StoreStub._segments` è tipato `dict[str, _SegStub]`, tutte le 7
  popolazioni usano oggetti (test_dispensa.py:365,415,436-440,693) e `purge_lesson` non è
  invocato da NESSUN test. Scenario inesistente = falso positivo (triage 9d87534).
- [ ] **"Verificare che X" non è un finding**: se il codice è leggibile, LEGGILO prima di
  emettere. Esempio VERO (stesso report, finding 2): "verificare che run_ingest chiami
  davvero delete_capsule+delete_graph" — pipeline.py:805-816 esegue esattamente i 3 step
  della docstring. Un grep avrebbe evitato il finding.
- [ ] **Garanzie delle dipendenze ≠ CRITICO nostro**: non assegnare CRITICO a contratti
  garantiti dalla dipendenza matura. Esempio VERO (triage COORDINATION 2026-06-10 10:35
  su f2a99d1): "test atomicità non copre crash OS" DECLASSATO — il rollback su SIGKILL
  è del journal SQLite, non nostro codice.
- [ ] **Scala vincolante**: CRITICO = perdita/corruzione dati o claim falso con input
  reale DIMOSTRATO raggiungibile; MAJOR = bug reale ma raggiungibilità non dimostrata o
  impatto contenuto; NOTA = difensivo/stile/dipendenze-browser. Nel dubbio, scala in giù
  e dichiara cosa manca per salire.
- [ ] **Il formato del CRITICO vero**: il retro-review 21:10 (purge_lesson incompleta,
  store/sqlite.py:355 vs spec BUGHUNT #7) era un CRITICO legittimo perché citava la spec,
  le righe lette, e verificava via grep che i test mancassero (gate invariato 1580) →
  fix reale 3151dc5. Quel formato (spec + righe + prova di assenza) è lo standard minimo.
- [ ] **Triage builder: niente fix difensivi per scenari impossibili**: se il finding è
  falso positivo, documenta PERCHÉ (file:line della prova) e NON aggiungere validazione
  per input irraggiungibili — "fix per scenario impossibile = rumore" (STATUS 20:17).

## Origine-RETRO

- STATUS.md 2026-06-11 LESSONOS-NOOP+TRIAGE-INPUT (commit 9d87534): adversarial 20:17 su
  fbb96ff = 3/3 falsi positivi (1 CRITICO su scenario inesistente), un tick intero speso.
- COORDINATION.md 2026-06-10 10:35: CRITICO su f2a99d1 declassato (garanzia SQLite).
- Ledger evolution.jsonl 2026-06-11: 9-13 report con criticals/24h — il rapporto
  segnale/rumore dei CRITICI è il collo di bottiglia del triage.
- Classe "severità-mal-calibrata" segnalata dal coach come ricorrente del giorno —
  unica delle 4 classi senza skill dedicata (le altre: commit-per-sottotask,
  test-falsificabili, e liste-duplicate già fixate puntualmente in 33f38ff/9369536).
