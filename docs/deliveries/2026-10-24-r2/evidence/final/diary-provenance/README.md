# P2 diario — provenienza esatta del recupero guidato

Due file: Diary.tsx e nuovo test diary-activity-provenance.test.tsx. Work, Core e Studio non modificati.

Il Core diary.propose_error salva già originalExerciseId dalla activity_id della consegna originale e lo riproietta nel thread. La UI ora usa quel campo esatto, compatibile con la capability dell’edizione attiva e con thread.editionId; non interpreta conceptId, nome del corso o categorie per scegliere il modello. Hydro, provenienza assente/nulla, transfer personalizzato e mismatch restano manuali, con fonte/storico e archiviazione disponibili. Non si crea una nuova capacità di assegnazione Hydro.

RED prima del fix:6 FAIL/2 PASS. GREEN:21 PASS (8 nuovi;4 course-review-boundary;9 workflows), typecheck PASS. Le due prove positive conservano il comando conferma e la famiglia di parametri Poiseuille/Taylor. La regressione Work usa Hydro e Poiseuille nella stessa edizione Fluidi e con lo stesso conceptId.

Log red.log, green.log, typecheck.log; hash dei due file in result.json. Component tests con API controllata, non nuova attestazione della beta/API o browser finale. C è stato invitato alla review indipendente sui sorgenti congelati. Nessun commit/push/deploy.

Review indipendente C: nessun finding o blocco sul delta. Confermata la catena canonica submission.activity_id → originalExerciseId → proiezione → guard edizione/capability, senza inferenza da concept/corso. Il codice rimane immutato dopo GREEN; il coordinatore possiede build unico e controprova browser finale.
