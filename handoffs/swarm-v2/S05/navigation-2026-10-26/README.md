# S05 · raccordo App autorizzato · 26 ottobre 2026

Addendum successivo alla consegna b6cba73. I rapporti precedenti rimangono
fotografie dei rispettivi checkpoint, incluso il raccordo allora NON APPLICATO.

L'utente ha risposto **«Sì, applica il raccordo e verifica»** alla domanda sul
solo `enabledViews={views}` in App nella315, lasciando merge e rilascio aS00.
La delega è stata pubblicata nel rendez-vous306, commento6411303896.

Il solo cambiamento di prodotto aggiunge quella prop alla ShellS02. La lista
`views` è già quella delle route montate dall'App: include memory e le route
legacy; il renderer S02 mantiene i filtri di ruolo. Nessun cambio a shell,
autenticazione, API, schema, lockfile o installazioni condivise. Menu e ricerca
ricevono lo stesso elenco, senza diventare un'autorità di accesso.

Due nuove controprove App verificano docente e studente senza edizioni,
menu→memoria e ricerca→memoria. Prima della prop:2FAIL/10PASS, destinazione
assente. Dopo:35PASS nel namespace memoria+shell (20S05+15S02). Log raw
conservati lossless in gzip e SHA256; nessun gate o aspettativa indeboliti.

La prova browser viene preparata sul codice reale App/Shell e StudyAPI con
cookie/SQLite e fixture sintetiche. `navigation_server.py` compone il server
S05 già presente e aggiunge soltanto un docente senza corso alla fixture
privata; nessun endpoint nuovo. `navigation_browser.mjs` usa il Chromium già
installato da Playwright, senza download, verifica entrambi i ruoli con/senza
corso, menu, ricerca con Enter, focus, cold reload e390px con touch emulato.
L'esito non è anticipato: consultare l'addendum finale quando disponibile.

Riproduzione dalla root, dopo aver impostato un demo dir nuovo e privato:

```sh
ARDESIA_S05_DEMO_DIR=PRIVATE_DIR PYTHONPATH=packages/engine:services/study-api python -m uvicorn navigation_server:app --app-dir handoffs/swarm-v2/S05/navigation-2026-10-26 --host 127.0.0.1 --port 5426
node node_modules/vite/bin/vite.js --config handoffs/swarm-v2/S05/vite.config.mts
ARDESIA_S05_DEMO_DIR=PRIVATE_DIR node handoffs/swarm-v2/S05/navigation-2026-10-26/navigation_browser.mjs
```

Il vecchio checkout sotto work/ardesia-s05 è stato preservato: .git/index e
sorgenti risultavano `compressed,dataless`, con gitstatus bloccato. Fermato
solo il processo di questa sessione; richiesto download di file propri senza
cambiare account o impostazioni iCloud. Nuova copia isolata e sparse della
stessa b6cba73 in work/ardesia-s05-recovery, dipendenze Web dal cache npm offline;
nuovo venv per il solo server di prova. Nessuna riscrittura o recupero presunto
di modifiche eventualmente non ancora leggibili nel vecchio checkout.

CI e marketing di b6cba73 risultano tutti SUCCESS; non trasferiti alla nuova
head. S00 conserva merge316/315, verifica del merge tree, ambiente remoto e
rilascio. Il raccordo locale non è distribuzione, approvazione scientifica o
completamento dei quattro microcorsi.

Prossimi passi per S00, in ordine:

1. Leggere CI/prove della nuova head e verificare il diff App di una sola riga;
   dipendenza316, accettazione menu+ricerca per ruoli autorizzati senza corso.
2. Integrare316→315 con check sul merge tree/postmerge e percorso utente;
   nessuna chiusura per sola ancestry, prova SHA/main/CI effettive.
3. Ripetere isolamento/revoca/cold nel backend remoto autorizzatoS10;
   dipendenze Auth/Storage/backup reali, nessun locale dichiarato remoto.
4. Proseguire scala/portabilità del notebook e registry Cytoscape senza nuovo
   archivio; primo passo misure sintetiche realistiche, prova tempi/backup e
   aggiornamento S12/S15 con pin/licenze. Le vecchie priorità rimangono storiche.
