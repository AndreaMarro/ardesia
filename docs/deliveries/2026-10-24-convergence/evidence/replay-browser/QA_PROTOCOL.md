# Studio — protocollo browser per replay isolato per lezione

24 ottobre 2026. Dati sintetici in profilo Chromium isolato. Nessun accesso a dati personali, cartelle FSA o backend reale.

## Flusso sotto test

Room A → rettangolo e testo disegnati con mouse/tastiera → flush del journal v2 reale → replay A → room B con ellisse e testo diversi → replay B → riapertura a freddo del replay A → replay di stanza vuota → replay A in viewport mobile. Le navigazioni dalla modalità lavagna alla query replay ricaricano la pagina; dove cambia solo l'hash, lo script ricarica esplicitamente il documento, come fa `Room.navigateToLesson`.

## Riferimenti effettivi

- `apps/studio/src/Room.tsx`: harness DEV `__MAESTRO_TEST__`, `recorder`, `store`, `apiRef`, `flushPersist`, `PATHS` per stanza.
- `apps/studio/src/store/JournalRecorder.ts`: journal canonico emesso dai cambiamenti della UI, senza fabbricare envelope v2.
- `apps/studio/src/store/ReplayEngine.ts`: `serializeEvents` per il distrattore legacy v1 dichiarato, come nel test esistente.
- `apps/studio/src/__tests__/replayTimelineRoom.test.ts`: contratto di riferimento per due stanze e file globale legacy.
- `apps/studio/src/ReplayView.tsx`: slider accessibile `linea del tempo della lezione`, range temporale della fonte e schermata vuota.

Il distrattore è `raw/events.jsonl`, con tempi 1000 e 2000 e ID `unassigned-legacy-distractor`. Le stanze reali hanno journal `raw/audit-replay-a/events.jsonl` e `raw/audit-replay-b/events.jsonl`, prodotti dalle interazioni e con tempi epoch effettivi. Il replay deve mostrare esattamente min/max del journal della stanza richiesta; una stanza vuota non deve mostrare alcuno slider nonostante il file legacy presente.

## Esecuzione

Server di lavoro: `http://127.0.0.1:5197/`, Vite avviato dal coordinatore. Script temporaneo: `research/studio-replay-browser.cjs`.

```bash
node /workspace/scratch/6f2994042c33/research/studio-replay-browser.cjs
```

Variabili opzionali: `ARDESIA_STUDIO_QA_URL` e `ARDESIA_STUDIO_QA_OUT`. Il modulo Playwright proviene da `apps/studio/node_modules`; Chromium 153 è già stato predisposto per il laboratorio REA. Lo script non installa pacchetti e non modifica sorgenti o gate.

Browser plugin: invocazione precedente del coordinatore fallita con `Browser access requires originating browser context`. Il mandato consente Playwright; la cloud CUA non raggiunge localhost. Il primo avvio Chromium nel sandbox dell'executor è fallito con `sandbox_host_linux.cc: shutdown: Operation not permitted`; l'avvio con escalation auto-review è riuscito.

## Prove e assert

Identità pagina, testo non vuoto, nessun overlay Vite, eventi v2 della stanza corretta, elementi disgiunti fra A e B, range temporale renderizzato corretto, seek alla fine, riapertura, assenza di fallback legacy per stanza vuota, screenshot desktop 1440×900 e mobile 390×844, nessun overflow orizzontale dell'intero documento. Errori console e richieste fallite sono registrati.

Il range corretto è un assert della UI, non un'importazione diretta del loader per simulare il rendering. Gli screenshot della scena finale vanno anche ispezionati per verificare che il canvas mostri il disegno atteso. Le fixture usano il browser cache fallback: questo non attesta salvataggio durevole FSA o remoto.

## Prima evidenza RED

`first-run-drawing-crash.json` e `first-run-drawing-crash.png` conservano il primo run: durante i gesti di disegno/testo, il confine Excalidraw→journal genera `EventEnvelope v2: payload.element.customData contains a non-JSON value of type undefined`; segue errore React in `<_App>`. Il test non raggiunge il replay. È un blocco applicativo distinto dal problema di scope del replay.

`second-run-endpoint-failure.json` e `.png` conservano il secondo run: il testo è scritto e il journal v2 salvato, ma lo slider con passo 100 ms raggiunge `1792831577960` mentre l'ultimo aggiornamento è a `1792831577965`. Il canvas finale resta vuoto perché è escluso l'update che riempie il testo. Il primo tentativo di shortcut rettangolo era privo di focus e non aveva creato la forma; il testo era invece reale. Lo script successivo aggiunge focus esplicito e assert della forma, così anche il distrattore legacy deriva da una forma effettiva. Queste sono correzioni del protocollo, separate dal fix applicativo dello step dello slider.

`third-run-hash-navigation-limit.json` e `.png` conservano il terzo run: A e B sono disegnate, salvate e riprodotte correttamente fino all'ultimo millisecondo. Il ritorno con solo hash non rimonta Room, che legge l'identità solo al mount per scelta esplicita; la UI rimane quindi B. La funzione di navigazione dell'app cambia hash **e ricarica**. Lo script finale segue quel comportamento e non rivendica una navigazione SPA basata sul solo hash. Non è stato modificato il router per far passare il test.

Nello stesso ambiente le risorse font CDN riportano `ERR_CERT_AUTHORITY_INVALID`, e MathLive segnala font non caricati. Il protocollo successivo li conserva e li classifica separatamente: un eventuale flow riuscito sarà `PASS_WITH_EXTERNAL_FONT_ERRORS`, non un'affermazione di console pulita. Ogni `pageerror` e ogni errore applicativo non spiegato restano bloccanti.

## Limiti

Non prova audio, trascrizione, sincronizzazione audio/canvas, interpretazione semantica, autenticazione, accessi remoti, interoperabilità MCP o durabilità FSA. Il replay è aperto mediante deep link: non prova che il comando sia scopribile da un utente nella navigazione. La viewport mobile verifica layout e controlli del player; non certifica comportamento Apple Pencil o Safari iOS.
