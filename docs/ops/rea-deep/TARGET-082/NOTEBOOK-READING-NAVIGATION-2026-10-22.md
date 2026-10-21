# Quaderno in lettura: dalle annotazioni alla pagina originale

Incremento del 22 ottobre 2026, base `eee007d265f89f55b1ba0d08b092f2de1d3603c8`
(PR #277). Stato: **IMPLEMENTATO E VERIFICATO nei test di componente**.

## Problema e riuso

`NotebookReading` mostrava la pagina di ogni annotazione, ma non consentiva di
raggiungerla dall'elenco. Il lettore PDF aveva già paginazione, overlay, limiti,
cancellazione e protezione dai risultati tardivi. La modifica collega queste
due parti esistenti; non crea un lettore, un formato o un archivio aggiuntivo.

La motivazione deriva dalle evidenze storiche di
[TARGET-082](RESEARCH.md) e dal relativo
[contratto di assimilazione](ASSIMILATION-CONTRACT.json): un riferimento di pagina
rimane associato alla fonte e alla revisione esatte. I dati già conservati nello
snapshot (`Annotation.page`) sono sufficienti.

## Comportamento

- Ogni annotazione valida offre «Apri pagina N» quando il PDF è disponibile.
- L'attivazione usa il medesimo `PdfReader`, sposta il focus sulla regione PDF e
  lascia allo stato del lettore l'annuncio della pagina raggiunta.
- Una nuova richiesta viene creata a ogni attivazione: la stessa annotazione
  funziona anche dopo uno spostamento manuale su un'altra pagina.
- Le richieste sono legate all'input binario esatto. Il cambio di revisione
  smonta il vecchio lettore; la richiesta precedente non viene riapplicata.
- Pagine non intere, non finite o fuori dal documento vengono ignorate. Senza
  originale rimangono consultabili testo e formule, senza comando di navigazione.

Nessun cambiamento a digest, coordinate, revisioni, proprietari, autorizzazioni,
export o ispezione Core. Nessuna ricerca della head, richiesta HTTP aggiuntiva,
pubblicazione editoriale o dipendenza introdotta. La UI è condivisa dalle letture
canoniche e portabili che già usano `NotebookReading`.

## Verifica eseguita

Prima della modifica, il file di test esteso ha prodotto **3 falliti e 10 passati**:
due casi non trovavano il comando; la richiesta programmatica di pagina 2 restava
su pagina 1. Dopo la modifica, **18 test passati in 2 file**.

```sh
npm --workspace @ardesia/web run test -- --maxWorkers=1 --no-file-parallelism src/__tests__/pdf-reader.test.tsx src/__tests__/notebook-portable-reader.test.tsx
npm run typecheck:web
npm run build:web
```

I tre comandi hanno terminato con exit code 0. `git diff --check` è passato.
La build conserva l'avviso già presente sul chunk MathLive oltre 500 kB.

Le regressioni coprono riattivazione dopo navigazione manuale, cambio della
revisione sullo stesso PDF mentre la vecchia pagina è pendente, input malformati,
richiesta per un altro originale, assenza di nuove chiamate `fetch`, destinazione
del focus e consultazione senza PDF. I test preesistenti verificano inoltre
cleanup, errori tardivi, integrità e selezione delle revisioni portabili.

Delta del codice applicativo: **26 righe aggiunte, 7 rimosse**, in due componenti.
Delta dei test: **82 righe aggiunte**; quattro nuovi casi. Zero contratti di
persistenza modificati e zero nuovi sottosistemi.

## Limiti e distinzione delle evidenze

Questa esecuzione usa jsdom, il vero componente del lettore e il suo adattatore
di rendering con un documento PDF controllato. `openPdf` e `FormulaPreview`
sono sostituiti nel test: non è una nuova prova del worker o del motore MathLive,
né un roundtrip browser reale. Browser, penna/touch e accessibilità completa:
**NOT_RUN** per questo incremento. Core/API/PostgreSQL non modificati né ritestati.

REA live: **BLOCKED**. `remote_desktop_commander_list_devices` non trova dispositivi
collegati. Sono state riusate le evidenze conservate di REA 6.7.0; non sono state
eseguite nuove catture né reinstallazioni. AFFiNE rimane osservato solo per nota
guest, persistenza e menu Export: il ciclo PDF/export/reimport non è verificato.
Nessun codice o asset AFFiNE è stato copiato. Licenze e versioni delle dipendenze
esistenti sono in `apps/web/THIRD_PARTY_NOTICES.md`.
