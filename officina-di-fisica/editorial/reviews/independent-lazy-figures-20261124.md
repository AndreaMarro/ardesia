# Riesame indipendente del caricamento delle figure lazy

Ambito tecnico: sola modifica a tests/corpus/browser-drafts.mjs, senza modifica a prodotto, CSS o candidati. Letti diff completo e percorso del runner fino al report e alle asserzioni finali. Una lezione lunga può mantenere fuori schermo un’immagine loading=lazy; attendere direttamente decode() non garantiva l’avvio del caricamento. Il log precedente /private/tmp/cric-054-diagnose.log arriva a STEP images per C1-L002 a 320 px senza raggiungere STEP axe; il processo è stato successivamente interrotto. Quel run non è una prova conclusa e non è PASS.

La correzione chiama scrollIntoViewIfNeeded() per ogni immagine prima di decode(). Promise.race con rifiuto dopo 15000 ms limita l’attesa di decodifica; finally elimina il timer tanto nel successo quanto nell’errore. Il rifiuto non viene assorbito: un’immagine non decodificabile o scaduta continua a rendere il comando fallito. Il conteggio minimo delle figure, le misure delle formule, axe, l’overflow, la protezione guest degli asset e l’asserzione finale restano presenti. Non rilevati difetti residui nello scope di questa modifica. Questo riesame non certifica la fisica del contenuto né il caricamento di ogni lezione del corpus.

Rieseguito indipendentemente dal revisore:

    PATH=/private/tmp/cric-recovery-venv/bin:$PATH PYTHONPYCACHEPREFIX=/private/tmp/cric-recovery-pycache ASTRA_RESULTS=/private/tmp/cric-author-a-lazy-054 node tests/corpus/browser-drafts.mjs lessons-foundations-revisions-054

Uscita 0: sei casi (C1-L002 e C1-L003 a 1440, 768 e 320 px), due immagini in ciascun caso, nessuna violazione axe, overflow pagina 0, nessun overflow delle formule. Tutti e quattro gli asset del pacchetto rifiutati alla sessione guest. Browser 158.0.8127.37. Report privato separato: /private/tmp/cric-author-a-lazy-054/report.json. Confrontati i suoi digest con i byte locali dopo il run.

SHA256 del runner riletto ed eseguito: b77d90368c3fa4d7fee43db65b402804615e0ba353f6514d699864e2cbd46372.
SHA256 del file di pacchetto eseguito: 8dd275a9a8ed52f695877cfd3bce8e0bc636c5fad9feaaaafe7099d9e3a954fc.

Nessun riuso dei report precedenti. La campagna completa di root ha ambito e risultati separati; questo documento non ne anticipa l’esito. Human NOT_RUN, publicationAction NONE; preview privata su SQLite temporaneo.
