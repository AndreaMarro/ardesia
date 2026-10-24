# Studio: prova browser di journal e replay per lezione

## Esito

**`PASS_WITH_EXTERNAL_FONT_ERRORS` per il flusso funzionale osservato.** Ultimo run: 24 ottobre 2026, 08:50:57–08:51:04 UTC, Chromium 153.0.8010.0. Sono state registrate 13 verifiche nel risultato JSON e otto screenshot del percorso finale. Le verifiche non sono 13 test unitari indipendenti.

La cattura tramite mouse e tastiera produce journal v2 canonici; il replay legge la lezione richiesta, raggiunge l'ultimo evento, distingue le due lezioni e lascia vuota una lezione senza journal anche se esiste un file legacy globale. Gli screenshot desktop sono stati ispezionati: A mostra rettangolo e testo su Poiseuille a pressione fissata; B mostra ellisse e testo a portata fissata. Non è comparso alcun overlay Vite. Nel run finale: **zero `pageerror`, zero warning, 155 errori console relativi ai font esterni** e 148 richieste fallite. Non è una console pulita.

**Su mobile il contenuto non è automaticamente inquadrato.** A 390×844 la prima apertura mostra la tela fuori campo e il pulsante «Scorri indietro fino al contenuto». Un tap su quel controllo porta il testo in vista. Il rettangolo resta tagliato a destra: il recupero sposta la vista, senza adattare l'intera scena alla larghezza. Il documento non ha overflow orizzontale (`scrollWidth=innerWidth=390`), ma questo dato non equivale alla visibilità completa degli oggetti del canvas.

## Cosa è stato provato

| Passaggio | Risultato osservato |
|---|---|
| Room A, disegno e testo dalla UI reale | Due elementi, 23 eventi v2, `raw/audit-replay-a/events.jsonl`; nessun envelope v2 fabbricato dal runner. |
| Room B, disegno e testo diversi | Due elementi con ID disgiunti da A, 23 eventi v2, `raw/audit-replay-b/events.jsonl`. |
| Replay A e B | Min/max dello slider uguali ai timestamp dei rispettivi journal; seek con End raggiunge esattamente max; scene finali distinte e leggibili su desktop. |
| Riapertura a freddo A | Stessi estremi e contenuto di A, dopo aver visitato B. |
| File legacy globale | Distrattore v1 valido derivato dalla forma di A, scritto solo in `raw/events.jsonl`, timestamp 1000/2000. Non diventa la fonte del replay delle room. |
| Room vuota | Messaggio di assenza della lezione e nessuno slider, pur essendo presente il distrattore globale. |
| Replay mobile | Timeline della room A, nessun overflow dell'intero documento, controllo touch di recupero funzionante; frizione e ritaglio residui descritti sopra. |

I dati sono interamente sintetici. Il testo di Poiseuille serve a distinguere le scene: non è stata eseguita la simulazione fisica né una verifica pedagogica del laboratorio.

## Difetti trovati e prove preservate

1. **Confine lavagna→journal:** il primo run falliva con `payload.element.customData ... undefined`, seguito da errore React. Il fix del producer è stato seguito da nuova esecuzione con gesti reali. File `first-run-drawing-crash.*`.
2. **Ultimo evento irraggiungibile:** con step 100 ms, End arrivava a `1792831577960` mentre l'ultimo update del testo era a `1792831577965`. Lo screenshot era vuoto perché escludeva il testo aggiornato. Dopo step 1 il test raggiunge l'ultimo millisecondo. File `second-run-endpoint-failure.*`.
3. **Correzione del protocollo di navigazione:** una sola variazione dell'hash non rimonta Room, che legge l'identità al mount. Il terzo run mostra B dopo il solo cambio URL ad A. La funzione dell'app `navigateToLesson` cambia hash e ricarica; il runner finale segue questo comportamento. Non è stato cambiato il router per il test e non viene rivendicata navigazione SPA con solo hash. File `third-run-hash-navigation-limit.*`.

Nel primo protocollo la shortcut per il rettangolo non aveva focus sul canvas: era stato creato il testo, ma non la forma. Il runner finale aggiunge focus esplicito e controlla la presenza della forma prima di scrivere il distrattore. Le correzioni del runner sono distinte dai due fix applicativi. Non è stata eseguita una build baseline isolata per dimostrare il fallimento browser del loader prima della correzione room-scoped; la prova RED browser riguarda i due blocchi incontrati durante il percorso reale.

## Errori dei font esterni

Il browser ha registrato `net::ERR_CERT_AUTHORITY_INVALID` per font da `unpkg.com` (MathLive/KaTeX) e `esm.sh` (Excalidraw), oltre ai messaggi MathLive di mancato caricamento. I 155 errori sono conservati integralmente con location nel risultato JSON; le 148 richieste fallite riportano URL e motivo. Il test non ha disabilitato la verifica TLS né nascosto questi log. I font di fallback rendono il testo del campione leggibile, ma la qualità della tipografia e delle formule con i font previsti non è attestata da questo run.

## Ripetere la prova

Il server Studio deve essere già avviato. Il runner non installa dipendenze, non avvia server e non modifica sorgenti. Usa un profilo browser isolato con storage locale sintetico.

`runner-original.cjs` è la copia byte per byte dello script effettivamente eseguito, con i percorsi della sessione; il suo SHA-256 è conservato. `runner.cjs` è l'adattamento portabile della stessa logica, con percorsi configurabili; è stato verificato con `node --check`, senza attribuire alla copia adattata un secondo run browser non eseguito.

```bash
ARDESIA_STUDIO_QA_URL=http://127.0.0.1:5197 \
ARDESIA_STUDIO_QA_BROWSER=/absolute/path/to/chromium \
ARDESIA_STUDIO_QA_PLAYWRIGHT=/absolute/path/to/ardesia/apps/studio/node_modules/@playwright/test \
ARDESIA_STUDIO_QA_OUT=/tmp/ardesia-replay-qa \
ARDESIA_STUDIO_QA_BASELINE='SHA e stato della working tree verificati per questa prova' \
node docs/deliveries/2026-10-24-convergence/evidence/replay-browser/runner.cjs
```

Se il percorso del browser viene omesso, Playwright usa il proprio Chromium installato. Se il modulo Playwright viene omesso, è cercato negli `apps/studio/node_modules` del repository. L'output predefinito è la sottocartella `run-output` accanto al runner; usare un percorso temporaneo per non confondere nuove prove con gli artefatti storici.

L'uso di Playwright era stato autorizzato nel mandato come fallback. Il Browser plugin aveva restituito `Browser access requires originating browser context`; la CUA cloud non raggiungeva localhost. Il processo Chromium richiedeva l'autorizzazione dell'executor dopo un fallimento di avvio nel sandbox. Queste condizioni ambientali sono registrate senza presentare la prova come collaudo di un host remoto.

## Artefatti e limiti

`replay-browser-result.json` contiene esito, controlli, range, ID, errori, richieste fallite e limiti; i due JSONL sono l'output del producer reale. `replay-browser-trace.zip` conserva la traccia Playwright. `provenance.json` registra hash delle sorgenti osservate e dettagli di esecuzione; `SHA256SUMS` verifica i file consegnati. Le path assolute dentro il JSON storico descrivono l'ambiente dell'esecuzione: i corrispondenti file sono conservati qui per nome.

Questa prova **non attesta** cattura audio, microfono, trascrizione, sincronizzazione audio/canvas, associazione semantica, durabilità FSA, persistenza remota, autenticazione, isolamento multiutente server, compatibilità MCP, Safari iOS o Apple Pencil. Il replay è raggiunto tramite deep link: la scopribilità del comando nella navigazione non è stata provata. La copia dello storage sintetico nel contesto mobile è una fixture, non sincronizzazione fra dispositivi.

Per il gate commerciale restano visibili due limiti di questa superficie: recupero manuale e ritaglio su mobile; dipendenza dai font esterni non riuscita nell'ambiente di prova. Il successo del replay dei dati non chiude questi aspetti di esperienza e distribuzione.
