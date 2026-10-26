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
