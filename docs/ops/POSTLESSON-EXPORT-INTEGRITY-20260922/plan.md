# Piano — postlesson export integrity, 2026-09-22

Base reale: `1c3f546a709d1004e291d5938073d6a5b7ecf8db` (PR #257 head),
branch `muse/postlesson-export-integrity-20260922`, worktree isolato
`ardesia-postlesson-integrity-20260922`. Main remoto `b124eee0` confermato.
PR #256 head `705284ac` (base main), PR #257 base `integration/d2-lesson-material-20260920`.
Stato dichiarato: USER_ACTION_TO_MATERIAL=PARTIAL, FULL_POST_LESSON_WORKFLOW_READY=NO.

Ambiente: Node v22.14.0 + npm 10.9.2 (`/usr/local/bin`), `npm ci` da workflow,
`packages/engine/.venv` via `uv sync --locked`, Chromium Playwright in
`~/Library/Caches/ms-playwright`. Dati solo sintetici. Modello/effort
`inherited/unknown`, unico writer.

## A — stessa affidabilità export in Recap e Materiali

Ipotesi: `SavedLessonsView` monta il log via `createEventLogStore` (fallback
in-memory silenzioso) e lo riusa in `handleExport`; l'esportatore considera
autorevole un live canonico vuoto → falso successo senza memoria. Recap è già
rigoroso (R-03b: `new IndexedDbEventLog()` + open/close al click).

- File: `apps/studio/src/design/SavedLessonsView.tsx` (solo `handleExport`).
- Fix: stessa acquisizione rigorosa del Recap al click; mai l'handle montata.
  Factory generale intoccata (serve ad altri consumer); import/recovery invariati.
- Test nuovo `apps/studio/src/__tests__/SavedLessonsExport.test.tsx`, reale
  factory/log/store/ZIP: sano, vuoto reale, IDB assente/lancia/richiesta
  fallita, open rifiutata, lettura fallita dopo open, retry, lezione estranea
  esclusa, snapshot non resuscitato, handle chiuse, pulsanti recuperabili.
- Chiusura: RED iniziale sul falso successo, GREEN dopo, parity Recap
  esistente invariata.

## B — separare unassigned dalle identità ordinarie

Ipotesi: `validateRoomId("unassigned")` accetta; letture filtrano per
uguaglianza → il contenitore recovery coincide con una lezione di prodotto.
JournalRecorder riserva già il nome; il confine room/export/recap no.

- Repro con proiezione legacy reale: eventi non attribuibili + stanza
  "unassigned" → selezione/recap/export. Se smentita: controprova e stop.
- Fix minima: riserva al confine prodotto (nuova validazione per room
  UI/export/import/recorder), strato storage/envelope intoccato così
  recovery/import restano espliciti; nessun dato migrato/rinominato.
- Chiusura: nessun evento non attribuibile in fatti ordinari; A/B isolate;
  byte legacy conservati; recovery/import con esiti espliciti.

## C — ultima azione, chiusura ed export senza falso salvataggio

Catena reale: `emitLessonEvent` (Room ~1080) fa append fire-and-forget sul
runtime store; `flushLiveLesson` drena scena + journal FILE ma non gli append
LessonOS pendenti; `flush()` del log è no-op (riga 687). Finestra nota PARTIAL.

- Confine semantico: operazioni accettate prima della richiesta di
  chiusura/navigazione. Punto proprietario: Room (tiene i writer).
- Fix minima: traccia gli esiti degli append plugin in Room; attendili in
  `flushLiveLesson` (navigazione: cambio lezione/superficie → recap/export) e
  best-effort nel cleanup unmount prima di `runtime.close()`; rigetto →
  errore esplicito, navigazione annullata, niente download completo. Timeout
  10s esistente come errore recuperabile. Niente sleep/polling/coordinatore
  globale; niente garanzia multi-tab rivendicata.
- Test: scrittura ritardata deterministicamente, append rifiutata, chiusura
  immediata, doppio click, cambio lezione/unmount, retry, esclusione B;
  asserzioni sui byte del bundle; ≥1 prova Playwright nativa.
- Chiusura: GREEN + limiti residui documentati, oppure blocco dimostrato.

## Verifica integrata finale

Test focalizzati durante A/B/C; dopo l'ultimo cambio applicativo: suite
Studio completa + typecheck + build + gate + percorso D2; Engine e
cross-language dove si toccano contratti/producer/bundle; gate documentale
sui documenti toccati + default; prova sintetica bundle→Engine→PDF con hash
e manifest/identità/ultimo-evento/assenza estranei verificati. D2 esistente
come regressione. Niente riesecuzione integrale dopo ritocchi documentali.
Niente pilot reale, niente chiamate LLM prodotto.
