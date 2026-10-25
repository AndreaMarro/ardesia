# R2 — review indipendente dei due fix privati

Esito: **nessun finding aperto nel delta esaminato**. Sola lettura del prodotto, nessun commit, browser o suite avviati. Base: `bec05cc8172393b153b7d8ea56ae48f1afa95ef0`; checkout `/private/tmp/ardesia-r2-20261024`. Questi sono hash di file prima del commit integratore, non un binding all’artefatto finale.

| File congelato | SHA-256 |
|---|---|
| `apps/studio/src/ReplayView.tsx` | `668412d9ae790f1b4c68a04f0939d52fe41b231b821511fa87742ac40ef72950` |
| `apps/studio/src/__tests__/ReplayView.test.tsx` | `76994eb03f5f6016334f99e366fa4cbadda7b6e0ca2e1cbfcfc5830d951f5f22` |
| `apps/web/src/features/Diary.tsx` | `9638184f98cb82280487de3b57c2d125d580d22a2313bb52c57b6e108748bac9` |
| `apps/web/src/__tests__/diary-activity-provenance.test.tsx` | `8f4c5749d817249adcebf5b0c6d37775f95e79d81fa39ea8b9b72c1ba76dcbe8` |

## Replay

`ReplayView.tsx:110–150` osserva il contenitore effettivo, accorpa i resize e attende due frame prima del fit. L’effetto dipende da `apiReady` e `timeline`; scrub, pan/zoom e riproduzione non lo riavviano. La closure del fit legge tramite ref la scena corrente. `timeline` resta legata a store+room (`:40`), quindi la nuova lezione rimuove immediatamente il contenuto precedente e la pulizia cancella entrambi i frame, disconnette l’observer e rimuove il fallback.

Durante questa review autore e revisore hanno individuato indipendentemente lo stesso bordo: resize390→primo frame→0 lasciava il secondo frame attivo; tornando a390, la cache dei bounds poteva impedire il riarmo. L’autore ha conservato il RED reale `../private-final/replay-zero-red.log` e applicato il guard minimo: a0 cancella i due RAF e invalida width/height (`:124–127`). La controprova indipendente sul codice finale conferma cancellazione e riarmo 390→0→390. Rimuovendo soltanto cancel/reset dal guard finale, l’oracolo fallisce: è un controfattuale controllato, non una nuova riproduzione del browser originario.

Il diff non cambia caricamento audio, avvio esplicito della riproduzione, autorità delle registrazioni né percorso journal. Il fit usa solamente `scrollToContent` e non introduce write/saveScene. Il test dell’autore verifica anche l’assenza di tali scritture. Non dichiaro da questo solo probe decodifica audio o geometria nativa Excalidraw.

## Diario

`Diary.tsx:189–193` passa la capability al form solo se coincidono edizione attiva e `thread.originalExerciseId`. La provenienza è canonica: `packages/engine/lessonos/study/diary.py:265` congela `submission['activity_id']` nel thread proposto; la proiezione conserva quel thread. Non viene dedotta da conceptId, corso o nuovo esercizio assegnato. Hydro, origine assente/null/ignota, trasferimento, altra capability e altra edizione restano manuali; Poiseuille/Taylor con identità esatta mantengono i propri parametri.

Work e Core non cambiano. La pratica studente usa già l’esercizio assegnato esatto; questa capability governa solamente la preparazione tutor. L’avviso manuale non promuove un candidato a verifica umana né crea ricevute o ledger. L’origine del passaggio e i controlli di autorizzazione/source correnti restano autorità del Core.

## Prove e limiti

Comando indipendente, eseguito con Node26.5.1:

```sh
/opt/homebrew/bin/node work/r2/qa/final-fixes-review/probe-final-fixes.cjs
```

`probe-result.json` e `probe.log`: **20/20 PASS**, dieci casi Replay e dieci casi Diary. Il runner estrae con TypeScript AST le closure/espressioni di produzione ed esegue la prima con un scheduler RAF/ResizeObserver controllato; non ricopia la logica. La matrice Diary applicata alla vera espressione della base bec produce sette negative errate; sul fix sono tutte respinte. I due positivi e la capability nulla restano corretti.

Il primo lancio del solo harness non ha raggiunto il prodotto: la direttiva TypeScript `use strict` era rimasta dentro l’espressione VM. Log conservato in `probe-harness-error.log`; corretto il wrapper del runner e rieseguito. Non è un RED del prodotto.

Letti, senza rieseguire durante il gate coordinato, i log degli autori: Replay quattro file33PASS (`../private-final/replay-viewport-green-final3.log`), Diary tre file21PASS (`../diary-provenance/green.log`) e i rispettivi RED. Typecheck e gate completo sono responsabilità del coordinatore/autori; non li attribuisco al presente runner. La prova nativa sulla candidate built finale rimane separata e non è sostituita da questa review. Le precedenti prove pubbliche restano legate fisicamente a bec05cc; i due fix qui esaminati sono privati.
