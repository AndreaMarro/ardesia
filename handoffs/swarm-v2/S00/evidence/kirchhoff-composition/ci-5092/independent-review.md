# Review indipendente delta dopo 5092b143

26 ottobre 2026. Sorgenti letti soltanto; nessun browser, build, suite o modifica di sorgenti/storico effettuati dal reviewer.

**Verdetto sul delta: nessun finding bloccante.** `apps/web/e2e/physics-pathways.spec.ts:47-53` cambia esattamente tre aspettative da sei a sette programmi e aggiunge la presenza del titolo S19. Il conteggio resta esatto: non diventa `>=`, non dipende dal risultato restituito e non ignora elementi inattesi. Nessun timeout, retry, selector meno specifico, skip o codice applicativo aggiunto.

Restano intatti il rifiuto «Riferimento non disponibile» prima dell'apertura dei programmi, le sole due edizioni seedate, la selezione persistita dopo reload e tutte le verifiche a 390/820/1440, focus, tastiera, storia, edizione, versione e digest del catalogo. `git diff --check` passa. Il log remoto `ci-5092-web.log` mostra il fallimento nell'attesa del vecchio nome «Programmi configurati (6)»; il reviewer non attribuisce alcun GREEN al run locale ancora gestito da S00.

## Ricerca delle aspettative residue

Ricerca con `rg` nei test/E2E Web, API, Engine e runner per programmi/coursepack/inventario e numeri sei: nessun'altra aspettativa di sei programmi reali individuata. `apps/web/src/__tests__/curriculum-catalog.test.tsx:12` mantiene correttamente `solutionCount: 6`: è il conteggio soluzioni del singolo Taylor in una fixture fetch locale, non la cardinalità del registro. Altri `toHaveLength(6)` trovati in Studio riguardano ordine eventi, diagnostica e token grafici, non CoursePack.

**P2 preesistente, fuori da questo delta:** `apps/web/e2e/catalog-course-capabilities.spec.ts:35,38` richiede ancora soltanto Fluidi/Taylor e «Programmi configurati (2)». Questo non è un test con catalogo mock: esegue una richiesta all'API reale. Il seed documentato `bin/study-demo/seed_course_capabilities.py:64-91` crea due edizioni e membership sintetiche ma non restringe il registro. Con la factory corrente il test generale riceve sette programmi e fallirebbe quella asserzione; è una conclusione statica, non un browser eseguito ora. Già obsoleto prima di questo delta; non risulta invocato dal job CI pathways corrente. Le due edizioni sono una condizione distinta e vanno mantenute. Segnalato a S00 per allineamento del vecchio E2E, senza indebolire il gate.

## Associazione alla prova

Unico file di codice/test modificato rispetto a `5092b143`: `apps/web/e2e/physics-pathways.spec.ts`.
SHA-256 dei byte riletti: `751628a34b15825d3de4438a261a769c3c41200d712e0509b03cef9c65f90c7a`.
Durante la lettura S00 ha aggiunto aggiornamenti a RUNLOG, NEXT e handoff; restano fuori da questa review e non sono stati modificati dal reviewer.
La validazione finale resta il run E2E originale e la nuova CI sulla SHA effettiva, seguiti dalla verifica post-merge. Nessuna conclusione di integrazione/produzione.
