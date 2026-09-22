# Risultati — postlesson export integrity, 2026-09-22

Base `1c3f546a709d1004e291d5938073d6a5b7ecf8db`, branch
`muse/postlesson-export-integrity-20260922`. Modello/effort
`inherited/unknown`, unico writer. Dati solo sintetici. Nessuna chiamata
LLM prodotto, nessun pilot reale, nessun vault/memoria esterna.

Ambiente: Node v22.14.0 + npm 10.9.2 (`/usr/local/bin`, parità CI);
Node v26.5.1 (`/opt/homebrew/bin`) per `apps/studio/eval/gate.sh` con
`NODE_OPTIONS=--no-experimental-webstorage` (opzione documentata nei
receipt R-03b); Python 3.13.14 (venv Engine via `uv sync --locked`);
Chromium Playwright (`~/Library/Caches/ms-playwright`); pandoc 3.9.0.2,
poppler 26.04.0; macOS arm64.

## Unità A — export Materiali rigoroso come Recap: CONFIRMED_FIXED

Ipotesi confermata: `SavedLessonsView` riusava l'handle del mount
(`createEventLogStore`, fallback in-memory silenzioso) e un backend
indisponibile diventava un bundle vuoto presentato come successo
(7 RED iniziali sul nuovo test, 2 GREEN sui percorsi sani).
Fix: `handleExport` acquisisce `IndexedDbEventLog` fresco per click
(open/close), come R-03b; factory e import/recovery intoccati.
Mutazione (comportamento precedente ripristinato): 7 fail / 2 pass.
Verde: `apps/studio/src/__tests__/SavedLessonsExport.test.tsx` 9/9 + `apps/studio/src/__tests__/RecapLiveExport.test.tsx`
(parità esistente) 9/9. Due test preesistenti in
`apps/studio/src/__tests__/SavedLessonsView.test.tsx` aggiornati al nuovo contratto motivato
(l'export non riusa più l'handle iniettata; import/recovery sì).

## Unità B — riserva unassigned al confine prodotto: CONFIRMED_FIXED

Ipotesi confermata: `validateRoomId("unassigned")` accettava; letture per
uguaglianza attribuivano i fatti di recovery a una lezione di prodotto
(export risolveva invece di rigettare; sessione si apriva; Room montava).
Fix: `validateProductRoomId` in
`apps/studio/src/store/roomPaths.ts`, applicato a hash Room, selezione
Materiali/Continuity, export/import/preview/destinazione/identità embedded/
manifest, apertura sessione, costruttore recorder. Strato storage
(`validateRoomId`, `roomPaths`), envelope e letture legacy intoccati:
byte esistenti e recovery funzionano ancora.
Mutazione: 3 RED comportamentali / 3 GREEN guardie. Verde: 6/6 nuovi +
108 con JournalRecorder/LessonBundle esistenti.
Decisione prodotto documentata: creare/selezionare/importare "unassigned"
fallisce chiuso con errore `Reserved room identifier`; nessun dato
migrato, rinominato o cancellato.

## Unità C — attesa append accettati prima della chiusura: CONFIRMED_FIXED

Finestra nota PARTIAL confermata e chiusa per il path Simulation:
`emitLessonEvent` era fire-and-forget; `flushLiveLesson` drenava solo
scena + journal. Confine semantico: operazioni accettate prima della
richiesta. Fix: Room traccia gli esiti degli append plugin e li drena in
`flushLiveLesson` (cambio lezione/superficie) e best-effort nel cleanup
unmount prima di `runtime.close()`; rigetto → navigazione annullata con
errore visibile. Niente sleep/polling/coordinatore globale; timeout 10s
esistente come errore recuperabile.
Mutazione (solo tracking disattivato): 2 RED genuini. Verde jsdom 4/4 +
prova browser nativa 10/10 (anche in senso negativo: senza drain la
navigazione corre).
Difetto adiacente emerso e corretto (stessa sessione, prova propria):
crash del recorder su testi canvas reali (`customData: undefined`;
structuredClone non sanifica in browser/jsdom) — RED/GREEN/mutazione in
`apps/studio/src/__tests__/CanvasTextJournal.test.ts` 3/3; i 2 test NaN preesistenti restano verdi.

## Verifica integrata

| Controllo | Risultato |
|---|---|
| Suite Studio deterministica (Node 22) | exit 0; 2204 pass, 0 fail, 5 skip preesistenti |
| `npm run typecheck`, `npm run build` | exit 0 (warning chunk preesistenti) |
| `apps/studio/eval/gate.sh` (Node 26 + opzione Web Storage) | exit 0; 2205 pass (2204 vitest + 1 replay), 0 fail |
| Engine `pytest -q -rs` completo | 2221 pass; 2 FAIL live-Kimi (HTTP 404 provider, debito noto, zero file Engine toccati) |
| Engine bundle/ingest/compose/summarizer mirati | 141 pass |
| Gate repo (claims default, workflow, boundary, NUL, secrets, diff --check) | exit 0 |
| D2 esistente | regressione verde in suite (producer + gate bundle) |
| Prova sintetica nuovo percorso → Engine → PDF | EVIDENCE-OK (dettagli in handoff) |

Non rieseguito localmente: CI remota della nuova PR (verificare run/SHA
dal tab Checks); pilot reale (mai autorizzato).
