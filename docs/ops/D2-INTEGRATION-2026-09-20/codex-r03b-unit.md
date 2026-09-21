# R-03b — acquisizione persistente per export, 2026-09-21

Scheda precedente alla patch. Il “vai” autorizza la correzione del finding
REQUEST_CHANGES della review R-03, non integrazione o pubblicazione.
Base pulita `b76611be7bcfd738d31c9b845a6be1acd95ded74`, branch
`codex/restart-review-postlesson-20260921`; modello/effort `inherited/unknown`.

- Obiettivo: il recap scarica .lesson soltanto dopo aver aperto e letto il log
  persistente. Un backend assente o non apribile produce errore locale, nessun
  download e possibilità di riprovare; il riepilogo resta visibile.
- Sintomo misurato dalla review: la factory generale maschera indisponibilità
  con log in-memory vuoto; l'exporter omette così la memoria archiviata.
- Oracolo: snapshot archiviato presente + backend indisponibile → errore visibile,
  zero download e zero chiamate all'exporter; backend ripristinato → export dei
  fatti correnti. Vero database persistente vuoto → omissione autorevole invariata.
- Implementazione minima prevista: RecapView usa direttamente l'adapter esistente
  IndexedDbEventLog e la sua open(), già priva di fallback, dentro try/finally
  con close(). Nessuna nuova factory/API. Il descrittore openIndexedDbEventLog
  aggiungerebbe un'ispezione globale e una politica d'integrità oltre il finding;
  qui rimangono immutati validazione e scope dell'exporter canonico.
- File: `apps/studio/src/RecapView.tsx`, test integrati
  `apps/studio/src/__tests__/RecapLiveExport.test.tsx` e predisposizione IndexedDB
  nei test UI `apps/studio/src/__tests__/RecapView.test.tsx`.
- RED: fault reali al confine IDB dopo l'anteprima, factory mancante, open che
  lancia e richiesta di apertura rifiutata. Dati prodotti dal recorder/log e ZIP
  reali. Rifiuto di apertura/parziale apertura deve comunque rilasciare la handle.
- GREEN: nuova controprova corretta per attendere errore o download (il probe
  congelato attendeva sempre un download); nessun indebolimento dei cinque
  invarianti R-03 già committati. Rimangono byte-identici i receipt della review.
- Controllo negativo: reintrodurre soltanto la factory con fallback nel click;
  le nuove prove devono fallire. Ripristino esatto prima delle regressioni.
- Verifiche: regressioni mirate, suite Studio deterministica, typecheck/build,
  gate congelato con opzione ambientale Web Storage già documentata. Browser:
  recap con dati → indisponibilità IDB → alert senza download → ripristino → ZIP
  con memoria corrente. Anche il confronto export A/B già disponibile.
- Non-goal: factory/preview/Materiali/Continuità, politiche nuove di corruzione
  o recovery, flush globale, export storico esplicito, Engine, R-04, Kirchhoff,
  pilot reale, provider a pagamento, installazioni, push/merge/deploy.

Riusate le skill persistent-capability-evolution e frontend-testing-debugging
già applicate. Browser plugin non disponibile; Playwright installato, dati
sintetici e screenshot fuori repository. Solo receipt locali append-only;
nessun vault/Basic Memory/AgentMemory, `INDEX_SYNC_DEFERRED`.
`PATCH_INDEPENDENT_REVIEW=PENDING`; nessuna delega implementativa.
