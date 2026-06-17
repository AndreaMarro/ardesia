# commit-per-sottotask

Lavoro gate-verde NON committato = lavoro che NON esiste: tool-limit, timeout o il
reset+clean del tick successivo lo distruggono in silenzio. Il 2026-06-11 sono andate
perse TRE build verdi in un giorno per questa classe. Regola del supervisore (vincolante,
COORDINATION.md 17:40): **COMMIT A OGNI SOTTO-TASK VERDE, mai commit unico a fine build.**

## When-to-apply

- Ogni build con più di un sotto-task o stimata oltre ~30 minuti.
- Ogni volta che il gate passa e il working tree è sporco.
- In review: se il diff è un mega-commit unico di una build multi-parte, segnalalo —
  la prossima volta il tool-limit ruba tutto.

## Checklist/Procedura

- [ ] **Decomponi PRIMA di buildare**: spezza la task in sotto-task indipendenti, ognuno
  con un gate verde e un commit proprio. Esempio VERO: M1-5 redo eseguito come 5 commit
  piccoli (83adbff purge_lesson → 289b936 _lesson_ids_from_path → fe5065e negation-repair
  → 8e84978 run_ingest → f3775ab test determinismo) dopo che il tentativo 17:11 monolitico
  era stato perso QUASI INTERO a tool-limit senza commit.
- [ ] **Gate verde → commit SUBITO**: appena il gate passa su un sotto-task,
  `git add <file specifici> && git commit` PRIMA di docs, review, o sotto-task successivo.
  Esempio VERO: DUE build M1-1c consecutive (Hermes 10:19 finita ma non committata;
  fable 10:59 killed a timeout 2400s) prodotte gate-verdi e distrutte dal reset+clean
  del tick dopo ("noop HEAD invariato") — salvata solo la terza copia via stash del
  supervisore, poi e4f1563 (gate 1503/0).
- [ ] **Mai working tree verde e sporco in attesa**: se il gate è passato e stai per fare
  qualunque cosa lunga (review.sh, run LIVE, doc), committa prima. Il commit parziale
  onesto batte il commit perfetto che non arriva mai.
- [ ] **Docs possono aspettare, il codice no**: STATUS/observations/log.jsonl possono
  andare in un commit docs finale; codice+test committati appena verdi.
- [ ] **Build interrotta? Cerca il rescue prima del redo**: controlla `git stash list` e
  `~/maestro-logs/rescue-*` (es. rescue-test_pipeline_ingest.py salvato dal supervisore
  per il redo M1-5) prima di rifare da zero — il driver fa rescue-stash su tree sporco
  (fix 4320827 e c957539), ma il rescue è la rete di sicurezza, NON il processo.

## Origine-RETRO

- COORDINATION.md 2026-06-11 12:00: due build M1-1c perse per lavoro gate-verde senza
  commit, distrutte da reset+clean del tick; recupero via stash → e4f1563.
- COORDINATION.md 2026-06-11 ~17:40: M1-5 quasi completa persa a tool-limit SENZA commit
  → regola nuova "COMMIT A OGNI SOTTO-TASK VERDE"; redo riuscito in 5 commit piccoli.
- Classe "lavoro-senza-commit" segnalata dal coach come ricorrente del giorno (3 perdite
  in 24h) — la regola viveva solo nei pin effimeri di COORDINATION, ora è skill auto-caricata.
