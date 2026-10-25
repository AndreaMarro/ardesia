# Edition registers

One verified owner controls two separate manual test registers in the existing Core. Neither register enrolls a person, changes a seat or indicative price, verifies a provider payment, or writes a pedagogical journal event. No organization/admin-commercial capability is implied by the global teacher role.

The API prefix is `/study/admin/editions/{editionId}`:

- `GET/POST /attendance`: four canonical session IDs, confirmed roster, current heads in one batch of at most forty cells. No record means `UNRECORDED`; the server supplies clock and `canRecord`. An unconfigured draft returns `calendarReady:false` and empty sessions/cells.
- `GET /attendance/history`: required sessionId/studentId, revision descending, limit20/max50, opaque edition/person/session-scoped cursor.
- `GET/POST /manual-payments`: member-only manual annotations, EUR integer cents1..1000000, opaque externalReference1..128. NFC+trim deduplication is scoped to the owner across editions; case is preserved. Pages default20/max50, ordered by stable entry ID. Summary counts only each entry's latest revision and zero for voided entries; it is not a verified cash balance.
- `POST /manual-payments/{entryId}/revisions` and `GET .../history`: append a correction or void with a nonempty reason. Preserve subject, reference and original offer snapshot. This is no refund/bank operation.

Every command requires Idempotency-Key1..256. Same actor/operation/key/payload returns the original minimal ACK; changed payload conflicts. Attendance corrections require exact targetRecordId/expectedRevision and the historical managementRevision. Payment corrections require the exact target and revision. Record IDs are32hex; reasons are bounded1000 characters. All DTOs forbid actor/clock/snapshot/extra fields. Cookie/session authentication remains the single API authority.

Attendance's first declaration requires a current member, current managementRevision and an already-started session according to server time. Corrections preserve their historical session snapshot. A changed calendar produces an explicit conflict and does not relabel old attendance as attendance on a new date. The read model exposes separately interest, live holds, membership and waiting counts; none means paid or present.

Schema5 adds two tables, indexed revision chains and deferred receipt references. PostgreSQL migration12 grants the backend role only SELECT/INSERT on the new tables, with owner-specific RLS; browser roles receive no new grants. Admin receipt policies replace, rather than supplement, the former broad permissive policy for those operations. Live PostgreSQL contracts require explicit opt-in after backup/migration by an operator; skipped tests do not verify RLS.

HTTP uses `StudyStore(...,initialize=False)`: an existing current schema only, no SQLite DDL, creation or repair. Missing/old/partial schemas return503. An explicit operator `StudyStore(path)` can bootstrap/upgrade SQLite. Startup erasure replay also opens without initialization; an old schema blocks private requests until an operator upgrades/replays and restarts. Liveness is independent. PostgreSQL initialization/migration remains an explicit operator action.

Whole-database backups include the new tables. Student erasure removes their attendance/payment chains and the related tutor ACKs; restoring an older SQLite backup replays the current erasure ledger. Ordinary record APIs cannot delete history. Administrative facts are omitted explicitly from learning notebooks, context and diary. Real-user legal/fiscal retention, delegated organization roles, running/completed states, withdrawals/reconciliation/refunds and provider payments remain separate work.
