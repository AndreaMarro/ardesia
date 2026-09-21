# R-03 — export del riepilogo con log corrente, 2026-09-21

Scheda prima della modifica prodotto. Il “vai” dell'owner autorizza R-03 dopo
la review positiva di R-02. Base locale pulita:
`c54fa42c1bb34ac37374a5bb228d838b2b4409ec`, branch
`codex/restart-review-postlesson-20260921`. Modello/effort `inherited/unknown`.

- Obiettivo: il download .lesson dal riepilogo usa la stessa autorità live
  dell'export Materiali/lezioni salvate, limitata all'identità selezionata.
- Sintomo: RecapView omette il log nel chiamare exportLesson, quindi esporta
  memoria archiviata o nessuna memoria anche quando il log contiene fatti nuovi.
- Invariante: acquisire un log corrente per l'azione, passarlo all'exporter
  canonico, attendere il risultato e chiudere la handle anche al fallimento.
  Log vuoto autorevole non recupera snapshot vecchi; lettura rifiutata produce
  errore locale e nessun download. Il digest già proiettato non è fonte di export.
- Prodotto previsto: solo `apps/studio/src/RecapView.tsx`. Riutilizzo di
  createEventLogStore e WorkspaceStore.exportLesson; nessuna nuova API o pipeline.
- RED: nuovo test dei due pulsanti reali con recorder, WorkspaceStore, log
  IndexedDB su backend di test e ZIP effettivamente creato; A/B sovrapposte,
  fatto aggiunto dopo il rendering, snapshot archiviato obsoleto, log vuoto,
  factory/read/export rifiutati. Verificare pulizia e possibilità di riprovare.
- GREEN: stessa memoria canonica nei due export, nessun fatto B in A; errori
  visibili senza archivio scaricato; handle chiusa e pulsante nuovamente attivo.
- Controllo negativo: omettere soltanto l'argomento live e rilevare il fallimento
  delle prove; ripristino byte-identico prima delle verifiche finali.
- Browser: registrare fatti con la superficie reale, scaricare .lesson da entrambe
  le viste e confrontare contenuti e identità, senza dati reali o provider.
- Verifica: regressioni pertinenti, suite Studio deterministica Node 22,
  typecheck/build, gate congelato con opzione Web Storage già documentata.
- Non-goal: global flush, ridefinizione della factory/fallback di persistenza,
  snapshot storico esplicitamente esportato senza log, R-04, UI nuova, Engine,
  Kirchhoff, pilot reale, pubblicazione. Il comportamento di fallback in-memory
  della factory esistente è distinto da un errore effettivamente rifiutato.

`PATCH_INDEPENDENT_REVIEW=PENDING`. Receipt locali append-only secondo la skill
persistent-capability-evolution già applicata; nessun vault, Basic Memory o
AgentMemory; `INDEX_SYNC_DEFERRED`. Nessuna delega implementativa o nuova spesa.
