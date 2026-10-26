# S14 focused library review

Status: COMPLETE

Scope: `apps/studio/src/whiteboard-library/libraryScene.ts` and `handoffs/swarm-v2/S14/room-library.patch` only. No tests or broader reads performed. Target Room line numbers below are from the patch's new-file hunk coordinates.

## Findings

1. **[P1] Fence library callbacks and async completions to their Room generation.** `room-library.patch:113–118` (target `Room.tsx:1211–1216`) reads `lessonLibrary.current` and `apiRef.current` when an SDK callback eventually runs; reset at patch lines 24–25 replaces that state without invalidating the callback. The rollback completion at patch line 125 likewise changes the current generation's restore flag. Repro: leave a queued `updateLibrary` operation unresolved in lesson A, switch the existing Room component to lesson B so its reset/load runs, then resolve A's operation. A's callback can replace B's library snapshot with A's items, using B's current API scene for persistence; a subsequent B save stores A's collection. Capture the generation/state/API owner and reject callbacks/completions whose generation no longer matches. This matters whenever a Room lifecycle changes without remounting the Room hook instance.

2. **[P2] Rejected-change rollback can discard an already queued valid library edit.** `room-library.patch:114,121–125` (target `Room.tsx:1212,1219–1223`) sets one global restoring flag before enqueueing `merge: false` rollback, and drops every intervening callback. Repro with the stated native SDK queue behavior: start with library A; queue an invalid import B (e.g. containing `ardesiaInkV1`) and then valid import C before B completes. B's callback enqueues rollback A behind C and sets the flag. C's callback is ignored, then rollback replaces the SDK library with A. C is lost from both SDK and persisted snapshot. Handle callbacks by operation/generation, or rebase rollback/validation so an unrelated queued valid operation survives; a global suppression interval cannot distinguish the restore's own callback from valid user updates.

No additional concrete data-loss or projection-marker persistence issue found in `libraryScene.ts`; cloning/freezing and recursive serialized-marker rejection are consistent with the stated scope. Native E2E/typecheck remain outside this review.

## Follow-up — 2026-10-26

Status: RESOLVED BY INSPECTION for both findings above, against the revised `room-library.patch`. Tests remain parent-owned; this follow-up ran none.

- **P1:** The generation token is retired synchronously on cleanup; callbacks reject a retired generation. Flush/import capture API and library ownership and recheck after their new async boundaries. The repair updater and its rejection handler also check captured ownership. These changes address the identified cross-generation library/restore mutations.
- **P2:** The global suppression flag is removed. Repair now validates the SDK state at execution time and preserves a valid current state, falling back to the latest accepted owner snapshot only when current SDK data is invalid. Intervening valid callbacks can update that snapshot. This addresses the host-boundary loss demonstrated by the parent's regression.
- **Evidence correction:** The original P2 reproduction's claim that native notifications occur between already queued B and C was too strong. The parent reports that native `notifyListeners` runs after the SDK update queue drains. The RED regression demonstrates a valid notification during repair completion at the host boundary; it does **not** establish the originally stated native SDK timing sequence.

No additional actionable data-loss, lifecycle-library, or projection-persistence residual found in the revised patch within the requested read-only scope.


## Correzione successiva del confine S07 — 26 ottobre 2026

Dopo la segnalazione6421291933 e il nuovo «continua!» umano, riaperto soltanto il namespace S14 della stessa319; base pubblicata62e1747d, senza writer concorrente osservato. Il marker proprio annidato ardesiaInkV1:undefined veniva eliminato da JSON.stringify prima dell'ispezione ricorsiva. False/null e il caso diretto erano già rifiutati. Non è una dimostrazione di fuga remota o bypass di file JSON: undefined appartiene al confine JavaScript prima della serializzazione.

La regressione reale Vitest fallisce sulla fonte precedente:1FAIL/5PASS in boundary-preclone-red.log. Il controllo visita ora l'originale prima di JSON senza congelarlo; la copia resta ispezionata e profondamente congelata. Dopo la modifica:8PASS nei due file utility/bundle, inclusa la mutabilità dell'input SDK e il roundtrip canonico; typecheck della consegna EXIT0 senza diagnostici. Hash Git/SHA256 e limiti in boundary-fix.json. Queste prove non sono una nuova controprova Room/native: i14check nativi precedenti restano legati alle vecchie fonti. Composizione311+318+319+S17/main/postmerge NOT_RUN.

Vecchio checkout sotto Documents ancora non leggibile entro5s: creato un checkout temporaneo pulito della stessa head sotto /tmp, ramo e PR conservati. Il primo comando Vitest non è partito per redirezione log con un parent di troppo; poi il Node24 incluso nell'app ha rifiutato il binding nativo esistente per TeamID. Log distinti conservati, nessun falso RED prodotto. Il Node26.5.1 già installato ha eseguito RED/GREEN; dipendenze lette da cache a lock byte-identico, cache/build-info propri, nessuna installazione o firma alterata. Warning sperimentale Node26 localStorage mantenuto nel log, non nascosto né confuso con errore browser.

Prossimi raccordi, in ordine: (1) S00 compone room-library.patch dopo311 nella stessa319, mantenendo legacyBoardScene/baseline/undo; (2) sulla SHA combinata esegue regressioni S07/audio/isolamento e i due runner nativi, quindi CI/postmerge; (3) verifica inserimento tile solo da tastiera e picker OS prima di attestare quei percorsi; (4) S13 assegna consumer/autorità numerica e verifica dei3GLB. Registry139, RUNLOG/NEXT comuni e Room restano ai writer assegnati; questa appendice è consegnata a S00. Nessuna adozione nuova S15 o simulazione S16 implicita.
