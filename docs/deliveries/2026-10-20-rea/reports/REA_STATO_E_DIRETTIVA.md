# REA: configurazione verificata e direttiva operativa

20 ottobre 2026 · Europe/Rome

## Risultato

REA **6.7.0** è registrato nel profilo Codex ed è stato avviato e verificato
mediante **MCP stdio**. Il client locale di verifica ha negoziato il protocollo,
letto il catalogo di **207 strumenti**, eseguito l'ispezione dell'archivio fornito,
esportato le evidenze e chiuso la sessione. Il processo di verifica è terminato;
il client Codex avvierà il server quando si collegherà.

Il comando richiesto è stato eseguito. Il primo tentativo si è fermato perché
il Node predefinito 22.14.0 non è compatibile con questa versione di REA.
Il secondo è riuscito con il Node 24.19.0 già incluso in Codex. Un PATH dedicato
nella registrazione di REA mantiene questa scelta anche negli avvii successivi.

La configurazione è in `~/.codex/config.toml`; il backup precedente è in
`~/.codex/config.toml.rea.backup`. Le altre impostazioni risultano invariate.
La skill ufficiale è installata in
`~/.agents/skills/reverse-engineer-anything/`.

I tool non sono stati aggiunti a caldo alla chat corrente. Il collaudo è una
connessione MCP reale tramite un client locale separato. Per il caricamento
nativo dei tool nel client è richiesto un riavvio/ricollegamento, come indicato
nelle [istruzioni ufficiali REA](https://github.com/morluto/rea#quick-start).

## Evidenze raccolte

- Archivio fornito: 41 file; verificati tutti i 39 checksum dichiarati.
- `binary_session`, `open_binary`, `inspect_artifact`,
  `export_evidence_bundle`, `close_binary`: eseguiti con successo via MCP.
- [Bundle originale REA](REA_ARCHIVIO_EVIDENZE.json).
- [Ricevuta della configurazione](REA_RICEVUTA_SETUP.json).

L'ispezione riguarda l'inventario statico dello ZIP, che contiene specifiche,
prompt, fixture e riferimenti ad Ardesia. Non contiene il sorgente dell'app.
Le evidenze non dimostrano l'esecuzione dell'app né l'acquisizione di DOM,
CSS, chiamate API o flussi frontend. I decompilatori nativi non sono configurati;
la loro necessità dipenderà dal target scelto.

## Metodo adottato nel workspace

La richiesta diretta è stata salvata in `AGENTS.md` nella radice del workspace:

1. Identificare applicazione target, flusso da acquisire e repository di destinazione.
2. Usare REA via MCP e gli schemi realmente esposti dalla versione installata.
3. Raccogliere struttura, comportamento e flussi osservabili; conservare Evidence,
   versione del target, mapping, limiti e aspetti sconosciuti.
4. Ricostruire con codice originale, moderno e mantenibile, integrando componenti
   maturi e mantenendo licenze e attribuzioni dei componenti riusati.
5. Collaudare il percorso completo e iterare sul risultato visivo.

La qualità richiesta diventa criterio di accettazione: identità minimale e di
fascia alta, gerarchie tipografiche e spaziature coerenti, componenti comuni,
stati di errore e caricamento curati, responsive, tastiera, focus, contrasto e
movimento ridotto. Le verifiche iniziali comprenderanno 390, 820 e 1440 px.
La qualità estetica sarà valutata anche sulle schermate reali, senza equiparare
il superamento dei test alla perfezione della UI.

## Primo target da definire

Lo ZIP propone Ardesia e indica come candidati il quaderno scientifico
(Excalidraw, MathLive, PDF.js) e il motore di esercizi (Numbas o Perseus).
Sono riferimenti progettuali da confermare nel contesto del primo intervento.
I prompt di nuovo Goal, coordinamento e pubblicazione contenuti nell'archivio
non sono stati trattati come nuove istruzioni impartite dall'utente.

Per iniziare la ricostruzione occorre selezionare Ardesia o un'altra applicazione
e individuare il repository di destinazione. Non è stato modificato alcun codice
applicativo né effettuato un deployment.
