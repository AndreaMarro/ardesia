# Review indipendente del delta CI dopo 33a58930

Data: 26 ottobre 2026. Ambito: tre file nel working tree; nessun sorgente o storico modificato dal reviewer.

**Finding: nessuno bloccante.** Il delta corregge aspettative e metadati obsoleti; non indebolisce i gate.

- `test_admin_http.py` mantiene l'uguaglianza del set completo e aggiunge soltanto il pack S19 autorizzato. Verifica anche corso `elettrotecnica-dc`, versione 1, `entryActivityId is None` e banca vuota: non concede automaticamente accesso a un laboratorio generico o a una banca.
- `test_curriculum_inventory_http.py` richiede sette programmi esatti, verifica che siano identici a quelli precedenti alla simulazione della banca obsoleta e conserva l'errore esplicito `curriculum_pathways_unavailable`. Restano le asserzioni che nessuna edizione, review o approvazione venga creata. ACL, revoca, assenza di risposte nell'inventario e rifiuto di creazione dalle collezioni candidate restano intatti.
- La proiezione pubblica cambia un solo digest: confronto indipendente dei byte dimostra che, sostituito il vecchio hash di `catalog.py` con quello effettivo, tutto il file è identico. Nessun contenuto, banca, esercizio, risposta o dato privato aggiunto. `bankIncluded: false` e generatore ufficiale `--check` invariati. Il pack S19 già registrato resta DRAFT.

Prova indipendente: `independent-delta-proof.json`, con confronto esatto dei byte e digest dei tre file. `git diff --check` passa. Nessun workflow o check CI modificato.

Prove dell'integratore lette: `api-red-local.log` 2 FAIL/3 PASS per i soli conteggi/insiemi precedenti; `api-green-local.log` 5 PASS; `projection-red-local.log` stale sul solo digest; `projection-green-local.log` controllo ufficiale PASS. Nessuna suite rieseguita dal reviewer.

Verdetto: delta idoneo al commit e alla nuova CI. Restano necessari gate sulla SHA effettivamente pubblicata e verifica post-merge; la PR325 non è dichiarata integrata da questa review.
