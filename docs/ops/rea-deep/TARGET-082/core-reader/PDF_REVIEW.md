# Revisione indipendente del lettore PDF

20 ottobre 2026, worktree `/tmp/ardesia-public-rea-20261020`.
Scope: integrazione `notebook`, `AssetPreview`, plugin degli asset statici,
configurazione Vite, package/lock, test PDF e correzione descrittore legacy.

**Nessun nuovo difetto concreto rilevato nello scope esaminato.**

Il precedente P2 sul limite di `editionId` è corretto: il client ora ammette fino
a 8192 caratteri e i test verificano accettazione a 8192 e rifiuto a 8193.

## Evidenza eseguita

- 25 test superati nei file `original-asset.test.ts` e `pdf-reader.test.tsx`.
- Tre probe indipendenti in `pdf-lifecycle-review.test.tsx`, tutti superati:
  1. una loading task restituita dopo l'unmount viene distrutta e non pubblicata;
  2. un fallimento tardivo del documento precedente non sovrascrive la nuova fonte;
  3. il cambio sessione rimuove originale e testo, revoca l'object URL e distrugge
     la loading task aperta.
- `git diff --check` senza errori.

Lettura diretta dei percorsi async: i risultati tardivi di getPage/render/testo
sono invalidati prima di pubblicare; i canvas appartengono alle singole richieste;
un vecchio cleanup sospeso non viene atteso per aprire la fonte successiva.
Nel PDF.js 6.4.299 installato, `PDFDocumentLoadingTask.destroy()` osserva anche la
promise della loading task, evitando una rejection non gestita per la sola
chiusura durante l'avvio.

Ispezionati il calcolo viewport/rotazione e il budget raster, il caricamento
lazy di PDF.js e worker, la corrispondenza versione package/plugin, le directory
statiche e le licenze distribuite. Non sono emerse incompatibilità concrete da
questa ispezione.

## Limiti

I probe usano React/jsdom e task PDF simulate. Non verificano rendering PDF reale,
decoder, qualità raster, font, CMap, WASM, ICC, browser mobili, proxy o CSP di
produzione. Il budget del canvas non è un limite globale alla memoria dei decoder
o del worker. Non sono stati eseguiti test di esaurimento memoria.

Typecheck, build e verifica browser reale restano al builder. Nessuna
certificazione SYS-01, G0/G1, UI perfetta o disponibilità produttiva. Nessuna
modifica ai file di prodotto e nessun push.
