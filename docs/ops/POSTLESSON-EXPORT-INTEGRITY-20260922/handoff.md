# Handoff — postlesson export integrity, 2026-09-22

Sessione implementativa builder (Muse/OpenCode, `inherited/unknown`).
Branch `muse/postlesson-export-integrity-20260922`, base reale
`1c3f546a709d1004e291d5938073d6a5b7ecf8db` (head PR #257, verificato:
PR #256 head `705284ac…`, main remoto `b124eee0…`, worktree pulito).
PR da aprire: draft su base `codex/restart-review-postlesson-20260921`,
collegata a #257/#256. Stato dichiarato invariato:
USER_ACTION_TO_MATERIAL=PARTIAL (finestra chiusa solo per il path
Simulation; ElabLab standalone resta limite), FULL_POST_LESSON_WORKFLOW_READY=NO,
REAL_PILOT=NOT_RUN.

## Riepilogo del diff

| Commit | Contenuto |
|---|---|
| `549d9ca0` | A: export Materiali con acquisizione persistente rigorosa + 9 test |
| `4fef0af8` | B: riserva `unassigned` al confine prodotto + 6 test |
| `653f056c` | C: attesa append LessonOS prima della chiusura + 4 test jsdom |
| `8df5d9ba` | C-adj: sanificazione `undefined` canvas nel journal + 3 test |
| (+ test miraculato) | 2 test `apps/studio/src/__tests__/SavedLessonsView.test.tsx` aggiornati al contratto A |
| (da pubblicare) | Area sessione: piano, risultati, handoff, probe browser, consumer Engine, artefatto sintetico |

File prodotto toccati: `apps/studio/src/design/SavedLessonsView.tsx`,
`apps/studio/src/Room.tsx`, `apps/studio/src/store/roomPaths.ts`,
`apps/studio/src/store/WorkspaceStore.ts`, `apps/studio/src/store/lessonBundle.ts`,
`apps/studio/src/store/lessonBundleManifest.ts`,
`apps/studio/src/store/JournalRecorder.ts`,
`apps/studio/src/store/continuityView.ts`,
`apps/studio/src/lessonos/bootstrap.ts`. Nessun gate/snapshot/test
congelato indebolito; nessuna dipendenza/lockfile/runtime cambiato;
Kirchhoff, MCP, OAuth, plugin, sito intoccati.

## Stato unità

- A: CONFIRMED_FIXED — indisponibilità backend non è più vuoto verificato
  su nessuna delle due superfici; vuoto reale distinto e lecito.
- B: CONFIRMED_FIXED — nessun evento non attribuibile diventa fatto di
  lezione ordinaria; A/B isolate; byte legacy e recovery con esiti espliciti.
- C: CONFIRMED_FIXED — navigazione/chiusura attendono gli append Simulation
  accettati; rigetto → errore visibile, niente download completo.
- C-adj (testo canvas): CONFIRMED_FIXED — batch onChange non abortisce più
  su `customData: undefined`; NaN/non-JSON restano errori.
- Problemi smentiti: nessuna cancellazione originale in A (i file restano);
  nessuna regressione D2 (regressione verde).

## Test discriminanti (BUILDER_TESTS)

`apps/studio/src/__tests__/SavedLessonsExport.test.tsx` (9),
`apps/studio/src/__tests__/UnassignedRoomBoundary.test.tsx` (4), `apps/studio/src/__tests__/UnassignedRoomUi.test.tsx` (2),
`apps/studio/src/__tests__/RoomLessonOsClose.test.tsx` (4), `apps/studio/src/__tests__/CanvasTextJournal.test.ts` (3).
Ognuno con RED iniziale sul comportamento + mutazione che lo rivede
fallire + GREEN finale. Profilo:
`node node_modules/vitest/vitest.mjs run --pool=threads --maxWorkers=1
--no-file-parallelism --testTimeout=30000 --hookTimeout=30000
--teardownTimeout=30000` (Node 22).

## Prove sintetiche (SYNTHETIC_WORKFLOW_EVIDENCE)

`docs/ops/POSTLESSON-EXPORT-INTEGRITY-20260922/browser-close-proof.mjs`
(Chromium reale, dev server :5291, dati sintetici): azione Simulation →
attesa navigazione → export recap con click reale → bundle
`docs/ops/POSTLESSON-EXPORT-INTEGRITY-20260922/synthetic/bw-room-a.lesson`
(sha256 `adbf51ef87f331f1fc4152a9e778c8e349aeb6b7b3dd5665596787edfd1abe5e`).
`docs/ops/POSTLESSON-EXPORT-INTEGRITY-20260922/synthetic/consume-new-path.py` (venv Engine, MockProvider solo-modello):
manifest bw-room-a, 2 righe LessonOS con last=solved(synth-exp-bw, seq 2),
1 segmento journal, digest presente, PDF 1 pagina leggibile
(`docs/ops/POSTLESSON-EXPORT-INTEGRITY-20260922/synthetic/out/`, `docs/ops/POSTLESSON-EXPORT-INTEGRITY-20260922/synthetic/out/runtime-evidence.json`, PDF rigenerabile e non
committato). Il solved è verificato a livello bundle, non proiettato nel
testo: nessun fatto inventato nel materiale.
D2EvidenceProducer da solo NON è prova di cattura UI (dichiarato).

## Review e CI

## Addendum REMOTE_CI — 22 settembre 2026

PR #258 (draft, base `codex/restart-review-postlesson-20260921`, head
`765026f67b818c8f254e7d9f5ca18fcadc0a16f4`): run 35728385672, tutti i
check pass (studio typecheck+test+build, engine pytest, hygiene,
d2-integration-evidence, e2e golden path advisory, no-deploy-check;
CodeRabbit skipped draft, Vercel Ready = preview deployment, non collaudo).
Distinzione head/merge: i metadati del run riportano head
`765026f6`, ma il checkout effettivo nei log è il merge sintetico
`1af4b38` (Merge 765026f6 into 1c3f546a = punto di fork, nessun altro
delta). Nota: engine passa in CI (senza chiave provider i 2 test
live-Kimi si comportano da skip/debt noto, non 404). INDEPENDENT_REVIEW
resta PENDING; nessun merge richiesto né eseguito.
- Receipt R-01/R-02/R-03/R-03b/R-04b preservati e invariati.

## Self-review del diff

Cercati soprattutto fallback, identità, lifecycle, errori silenziosi, test
che bypassano il codice: l'export Materiali apre/chiude per click
(finally); la riserva non tocca letture legacy (verificato: righe
unassigned ancora leggibili, mixed A/B isolati); il drain conserva gli
esiti (allSettled + rilancio, non attesa della coda ingoiante); la
sanificazione non tocca NaN/funzioni; i test usano factory/log/store/ZIP
reali senza mockare la decisione sotto esame (unico mock: produzione
evento nel tempo — differita, mai sostituita).

## Limiti residui e unica prossima decisione

- ElabLab standalone ha log proprio: l'ack evita false conferme al mark,
  ma mark→navigazione-immediata→export può mancare il fatto (nessun
  coordinatore cross-instance per scelta).
- Nessuna garanzia multi-tab/tutti-i-plugin rivendicata; unmount
  best-effort; stanze storiche "unassigned" bloccate con errore esplicito.
- Kimi live 404 preesistente; qualità scientifica non certificata (mock).

**Unica prossima decisione utile:** review indipendente Codex sullo SHA
candidato + decisione owner su merge della catena e su provider/spesa del
pilot (REAL_PILOT=NOT_RUN). R-04-non-autorizza-rilascio resta valido.
