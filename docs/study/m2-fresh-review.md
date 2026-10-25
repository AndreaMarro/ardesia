# M2 — fresh-context review and repair adjudication

Independent read-only review of da0beb94..ef0f45d7 by study_m2_review. 21 focused domain/API tests independently passed; reviewer also reproduced the following four failures in disposable temp directories. No independent full-suite/build/browser claim.

| Finding | Effect and ruling | Repair proof |
| --- | --- | --- |
| P1 legacy-only erasure | Confirmed destructive scope violation; material | Guard legacy enrollment/student before absent-Study early return. RED reproduces; GREEN preserves legacy and records no intent. |
| P1 truncated database initialized by health/backup | Confirmed false healthy/empty backup; material | Read-only non-migrating DB inspection requires SQLite header/current complete Study schema, integrity and foreign keys. Operational source remains unchanged when rejected; Store also refuses existing truncated file. Two RED cases (health/backup) → GREEN. |
| P1 blob-directory symlink | Confirmed outside-file deletion; material | Validate blob root/entries before intent or row mutation; reject symlinks and out-of-root paths. RED → GREEN with unrelated external UUID file preserved. |
| P2 tutor source-linked hint receipt survives | Material incomplete derivative cleanup, generic hint did not expose original text | Recursive structured source/submission/review link matching; remove receipt/event, retain unrelated peer/tutor data. RED → GREEN. |

Repair-pass scoped suite: 81 passed. All final full checks and build-browser acceptance are recorded separately at the final SHA, after this repair commit; this document does not predict their result.

Declined-to-judge adjudications:
- Production identity/deploy/real payment/live AI/legal compliance/human launch: prohibited or human decisions pending. Retain synthetic-only boundary and explicit NOT_RUN; do not infer permission from a document.
- Scientific approval/effectiveness/full syllabus: numeric original draft is not human approval; packet retains null reviewer and hash.
- Screen reader/Pencil/human accessibility: emulated Chromium does not prove these; preserve human checklist.
- Power loss/SSD/cross-machine recovery/external writers: not measured; cooperative same-host and logical SQLite/blob guarantees only.
- CoursePack submission wiring: new RF/TR IDs and three additional models are preview/editorial material; submitted attempts/reviews currently track poiseuille-v1 in Lezione. Explicitly documented; no release claim for a complete multi-activity assessment engine.
- Previously accepted M1 beyond M2 interactions: prior receipt remains historical; final M2 acceptance repeats the actual ten-context journey and cold reopen on the new build.

No second independent review of the repair pass was performed. The author reproduces each finding RED→GREEN, reads the repair diff and runs final gates. No deferred style/minor findings were reported. Human gates remain open.

Author follow-through found a request-budget compatibility regression: 20k-character Unicode notes exceeded the new 64 KiB envelope; notebooks with 12 MiB decoded attachments exceeded the 16 MiB base64 envelope. Both observed RED (413), then GREEN with bounded 256 KiB ordinary/96 MiB notebook bodies, preserving the existing 50 MiB decoded attachment limit. Oversize-request test still requires 413 at the explicit new boundary; no business validation relaxed. The scoped suite now has 82 passed. This is author verification, not another independent review.
