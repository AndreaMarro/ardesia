# ADR-0004 — Study Core, provider boundaries and the course-first client

Status: accepted for the isolated G0 candidate, 2026-10-20. Production readiness remains unapproved.

## Decision

Use a modular monolith with one canonical database. The same Study commands implement enrollments, sources, immutable submission receipts, reviewed feedback and the error diary on SQLite and PostgreSQL. The new `apps/web` client consumes the Study API; it does not maintain another authority, memory, solver or copy of a student's career. Legacy LessonOS records and Study records share that database. Derived context and diary views remain projections.

`BlobRepository` is the small port for immutable original bytes. `LocalBlobs` and `SupabaseBlobs` implement it. `SupabaseRuntime` contains provider authentication and private Storage transport; verified Auth identity is resolved to a persisted Core role, with session existence checked by PostgreSQL. Browser-supplied actor IDs and metadata are never role assignments. Database migrations are administrative operations, outside HTTP requests.

`PostgresStudyStore` is a compatibility adapter for the existing Core SQL. Its translator supports only the spellings used by the Core, with executable contracts. This avoids two implementations of domain policy. A future repository interface can replace individual SQL operations as a measured need emerges; arbitrary SQL translation is not an exposed capability.

Concurrency belongs to the invariant: edition row locks protect capacity, per-command locks protect idempotency, aggregate locks protect competing diary/submission/review operations, and a compare-and-swap update protects source revision heads. Distinct editions and aggregates need no global request lock. Event indexes bound diary replay to the authorized learner or tutor scope before decoding payloads.

## How changes stay local

| Change | Intended boundary | Evidence required |
| --- | --- | --- |
| Course UI or navigation | `apps/web` and typed API client | Typecheck, interaction test, actual API journey |
| New original model | Activity evaluator and course-pack registry | Domain/unit goldens, invalid domain, actual submission |
| Storage provider | `BlobRepository` implementation | Exact bytes/hash, private access, compensation and recovery |
| Database provider | Persistence adapter and additive migration | Shared Core contracts, races and authority tests on that provider |
| Authentication provider | Runtime identity/session boundary | Forgery, revocation, login/logout and role isolation |
| Context/diary projection | Shared Core projection, canonical events retained | Exact source/revision, stale/revoked policy, authorized replay |

These boundaries reduce the cost of change; they do not certify unlimited scale. Current local runtime opens a synchronous PostgreSQL connection per request and uses synchronous provider transport. Connection pooling, worker configuration and load targets require measurement before a capacity claim. Event projection is scoped and indexed but still replays the authorized history. Incremental checkpoints may be added only with rebuild/reconciliation tests.

## Current limitations

The isolated runtime deliberately requires loopback addresses and synthetic identities. Supabase invitation codes are disabled until the real adapter is implemented. Operational health refuses PostgreSQL backup readiness until restore evidence exists. Durable recovery for a crash or failed cleanup between Storage upload and metadata commit is an open review finding. Migration checksums, complete G0 acceptance, final REA receipts, remote staging and human scientific/date approvals are pending. The existing Vercel workspace is Pro; no deployment was made without a verified guarantee of zero additional cost.

No required gate or evaluator was weakened. No production services, billing settings or existing cloud resources were changed.
