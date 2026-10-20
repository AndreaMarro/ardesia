# Riesame indipendente: Worker nativo posseduto dall'adattatore

20 ottobre 2026. Revisione in sola lettura dei delta in `pdfDocument.ts`
(mtime 15:23:35) e `PdfReader.tsx` (mtime 15:23:10), oltre ai piccoli delta del
limite Unicode del descrittore e della paginazione accessibile.

**Nessun nuovo difetto concreto riprodotto.**

Il codice usa una nuova porta nativa per ogni tentativo e passa il wrapper
`PDFWorker` esplicitamente a `getDocument`. Nel codice PDF.js 6.4.299 installato
questo percorso evita la creazione automatica del worker e il fallback fake.
La porta rimane responsabilità dell'adattatore; il cleanup elimina i listener,
condivide la stessa promise per richieste duplicate e termina la porta dopo
la conclusione del cleanup o dopo un secondo.

## Probe eseguiti

**11 test indipendenti superati**, solo nella cartella temporanea di review:

- abort prima che gli import asincroni riprendano: nessuna porta creata;
- successo con porta esplicita e distruzione ripetuta idempotente;
- fallimento iniziale, cleanup sospeso, nuova porta indipendente e terminazione
  forzata della precedente dopo un secondo;
- abort durante caricamento pendente: promise rigettata e cleanup limitato;
- errore della porta dopo apertura: failure osservabile;
- errore sincrono di `getDocument`: wrapper e porta distrutti;
- task restituita dopo unmount: distrutta e non pubblicata;
- errore tardivo del precedente caricamento: nuova fonte preservata;
- cambio sessione: contenuti e link rimossi, URL revocato, task distrutta;
- errore worker dopo apertura: contenuto nascosto, retry con nuova task;
- errore di worker abbandonato: fonte sostitutiva preservata.

File: `pdf-worker-review.test.ts`, `pdf-lifecycle-review.test.tsx`,
`vitest.config.mjs`. Esecuzione finale: 2 file, 11 test passati, durata 46,26 s.

Una prima esecuzione aveva esaurito il limite Testing Library di un secondo
aspettando il testo iniziale, prima dell'iniezione dell'errore. Con timeout locale
di dieci secondi, senza modifiche di prodotto, la suite completa passa. Il caso
non viene trattato come difetto del prodotto.

`git diff --check` passa. Il limite ID ora conta code point Unicode, coerente con
`len` Python; i pulsanti con `aria-disabled` mantengono il clamp funzionale.

## Limiti

Questi probe simulano `PDFWorker`, Worker nativo e task PDF.js; controllano il
contratto e le transizioni, non sostituiscono la prova Chrome del 503, della CSP,
del raster o delle risorse statiche. Non sono stati provocati esaurimenti reali
di memoria o CPU. Nessuna certificazione SYS-01, G0/G1 o ambiente produttivo.
Nessuna modifica ai file di prodotto, nessuna CLI LLM esterna, nessun push.
