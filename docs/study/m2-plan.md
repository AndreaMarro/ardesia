# M2 — preparazione locale del pilot

Spec: i quattro file del dossier indicati dall’utente e `marketing/pilot-checklist.md`.
Mandato diretto 2026-10-19: completare autonomamente il lavoro locale possibile verso M2; riesame dei quattro file ogni 60 minuti. Nessun merge, deploy pubblico, spesa API o dato reale.
Base provata: da0beb9430af05a8656b96b629082509a422fe51 (M1). La ricevuta M1 resta immutata.

## Vincoli e decisioni
M2 umana/commerciale non si può certificare con attori sintetici. Il risultato di questo piano sarà PREPARAZIONE_LOCALE, con gate umani aperti. Non abilita produzione. Si riusano store, renderer e servizio M1. Nessun provider live.
Ruling: si conserva il blocco di avvio fuori dalla modalità sintetica: implementare inviti/sicurezza in locale non equivale ad approvare un deployment.
Ruling: cancellazione fisica dei record applicativi riguarda soltanto studenti sintetici senza dati legacy estranei; una procedura dichiarata tratta separatamente backup, export già scaricati e copie del filesystem. Non rivendicare cancellazione forense su SSD.

### Task 1: accessi e confini HTTP
Interfacce: schema additivo, inviti monouso con scadenza e revoca, sessioni revocabili; limiti di richieste/payload. Test invito usato due volte, concorrenza, scadenza, ACL tutor, logout globale, cookie HTTPS, abuso e origin. Nessuna credenziale nel Git. Expected: suite domain/API verde; demo M1 compatibile. Commit locale.

### Task 2: operazioni dati e ripristino
Consuma store Task1. Produce lock condiviso per transazioni/blob, backup consistente con hash verificati, restore atomico in nuova directory con sessioni rimosse, erasure ledger riapplicato anche a backup vecchi, health che verifica DB/blob senza contenuti. Test corruzione, revoche dopo restore, impossibilità di resurrezione, isolamento peer e proiezioni, ripresa di cancellazione interrotta. Expected: prove su dati sintetici + suite regressione. Commit locale.

### Task 3: CoursePack originale e revisione editoriale
Consuma API fisica già presente. Produce 24 esercizi DRAFT con soluzioni e rubrica, 4 attività manipolabili/varianti, 2 prove di trasferimento con riferimenti distinti; validatore numerico deterministico e manifest hash per revisione. Nessuna firma umana generata; UI di anteprima locale con stato esplicito. Test domini fisici e cambio input/risultato. Expected: contenuti accessibili nel build, nessuna promessa di syllabus completo. Commit locale.

### Task 4: dossier operativo e collaudo finale
Consuma Task1–3. Produce comandi operatore, template decisioni/supporto/diritti/conservazione con campi non approvati; gate locale fail-closed se mancano prove umane; pacchetto per prova tutor/accessibilità/scientifica. Review da un contesto fresco dell’intero delta M2, un passaggio di correzioni materiali. Build, suite previste, E2E M1 e nuova anteprima; restore con cold start su stesso SHA pulito. Ricevuta in artifacts/study-m2. Nessun publish. Expected: lavoro locale dimostrato; M2 umana NOT_RUN, lancio BLOCCATO.

## Pre-flight
Task1→2: nuove tabelle inviti/limiti devono essere eliminate o revocate da erasure/restore; nessun token nel manifest.
Task2→3: contenuto originale versionato nel Git non contiene dati utente; cancellazione non deve eliminarlo.
Task3→4: hash editoriale identifica esattamente il contenuto da revisionare, non sostituisce approvazione.

## Review focus
Inviti concorrenti e revocati; auth alternativa demo; perdita di aggiornamenti DB/blob durante backup; backup precedente a cancellazione; testo in receipt/eventi/cache/proiezioni; peer preservati; file corrotti/path traversal; contenuto scientifico con vincoli impliciti; UI che mostra vecchi risultati; claim M2 o compliance non provati.
