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
| New course edition | Immutable edition/pack/version/hash binding; authenticated bounded course discovery | Shared lifecycle, wrong-pack rejection, own/enrolled SQL scope and migration contracts |
| Storage provider | `BlobRepository` implementation | Exact bytes/hash, private access, compensation and recovery |
| Database provider | Persistence adapter and additive migration | Shared Core contracts, races and authority tests on that provider |
| Authentication provider | Runtime identity/session boundary | Forgery, revocation, login/logout and role isolation |
| Context/diary projection | Shared Core projection, canonical events retained | Exact source/revision, stale/revoked policy, authorized replay |

These boundaries reduce the cost of change; they do not certify unlimited scale. The local runtime opens a synchronous PostgreSQL connection per request and uses synchronous provider transport. Those operations run in FastAPI/AnyIO workers, including dependency setup/teardown, abuse counters and original uploads; they must not occupy the ASGI event loop. One connection belongs to one logical request, even if setup, command and teardown use different workers. SQLite permits that explicit request handoff without permitting concurrent commands on the same connection; direct Core callers retain the default thread check.

The worker pool bounds concurrently executing synchronous calls, not the total number of open connections or queued requests. A separate per-application admission budget now precedes remote Auth and database opening: default16 active store scopes, at most0.5seconds waiting, then503 `server_busy` with `Retry-After`. A permit remains owned through command completion and worker cleanup, including cancellation. The abuse-counter scope ends before the login scope begins; login, logout and revoke-all reuse one authenticated store. Health bypasses store admission. Causal tests hold open, command, close and counter workers, cancel active and queued requests, and require health to complete before release. This verifies bounded store ownership and event-loop progress, not production throughput.

This limit is per application process. With W processes, budget the database for up to W times the configured active store limit plus explicitly counted administrative/background connections. It does not bound all incoming request bodies, network queues or external infrastructure. Connection pooling, deployment worker counts and load targets require measurement before a capacity claim. Event projection is scoped and indexed but still replays the authorized history. Incremental checkpoints may be added only with rebuild/reconciliation tests.

Portable notebooks retain exact `(resourceId, revisionId)` references alongside current resources. Unreferenced history is explicitly omitted. A hash verifies internal consistency of this unsigned artifact; it does not establish canonical authenticity, import authority or permission to fetch a newer private head. Read-only consumers must resolve the exact pair and report unsupported or missing fields without silently substituting current state.

## Current limitations

The isolated runtime deliberately requires loopback addresses and synthetic identities. Supabase invitation codes are disabled until the real adapter is implemented. Operational health refuses PostgreSQL backup readiness until restore evidence exists. Durable upload intent, bounded operator recovery and actor-scoped idempotent receipts now cover interrupted or failed cleanup; the operator must respect the provider timeout/grace. This is not a distributed atomic transaction or a claim of physical erasure. Migration checksums, complete G0 acceptance, final REA receipts, remote staging and human scientific/date approvals are pending. The existing Vercel workspace is Pro; no deployment was made without a verified guarantee of zero additional cost.

No required gate or evaluator was weakened. No production services, billing settings or existing cloud resources were changed.
