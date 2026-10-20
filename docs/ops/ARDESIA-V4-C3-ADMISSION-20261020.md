# C3 admission, discovery and portable-source review

Synthetic isolated candidate only. Core/API tree tested at `b65e8637b5ac81a5813ccf8102eef45928ba06d8`; documentation changes do not change that tested tree. Main PR remains267, directly based on main. No merge, cloud deployment, billing change or production operation.

## Executed evidence

- Shared Study plus Study HTTP: **384 passed,0skipped**,22.55s, one existing TestClient deprecation. `ARDESIA_SUPABASE_ENV_FILE` explicitly enabled the owned loopback PostgreSQL/Auth/RLS/Storage. This count includes unit and adapter contracts; it is not384 independent live journeys. Log SHA256 `bc40b2ab845ba0a7cdb78b5e5d19266c570ecceefa6873ace1b3665dc8dbd941`.
- Independent root review with actual local Auth and PostgreSQL: **2 passed**,1.86s. Budget1 login recovers from an invalid cookie; valid logout clears the cookie and replay of the signed token returns401. Invalid-cookie logout recovers. A deliberately failed provider logout clears the cookie, reports `UNCONFIRMED`, and the still-valid token remains usable: no false revocation claim. Log SHA256 `94b60304ea37e3181ae56ad2264b60d2fd2e81a9120723e282acb1a424d3b12b`; probe source SHA256 `26006186a27c24582a11f26f2c477e0537b297a8fbcf3b9139322f7a2108f3f6`.
- Previous exact `170ceedbd0fdefca11b6c7230abe1ce38a78e9fd` discovery/portable live suite: **360 passed,0skipped**,19.67s. Log SHA256 `2e5aafa5ebb2a7347c560263d6e570f518a3457c73492fedf4b47eebfe8f9c0f`.

The384 run includes authenticated course discovery scoped in SQL before JSON decoding, exact historical export references, immutable course-pack binding, original-byte storage, authorization and admission/cancellation regressions. It does not certify the unmerged multicourse frontend or Calendar/MCP implementation.

## Capacity and change boundaries

Store admission is per application process, default16 active scopes with0.5second bounded acquisition. It precedes remote Auth/DB open and holds ownership through worker disposal. Counter and route scopes are sequential. Excess requests receive503/Retry-After; health remains responsive. This is a connection-ownership bound, not a measured production throughput or memory bound. Request body queues, multi-process configuration, pooling and deployment capacity still need measurement.

One Core remains authoritative. Edition-to-pack binding and bounded authenticated discovery let another course use the same submission, source, review and diary lifecycle. Portable exports retain exact referenced revisions and explicitly omit unreferenced history. Neither unsigned artifact integrity nor a local preview confers canonical authenticity or server permissions.

## Restore probe remains partial

A custom PostgreSQL dump was restored into a separately named, owned database in the same local PostgreSQL instance. Authorized projections for four synthetic actors matched the source database. Auth and Storage APIs still used their original services; this was not a rebuilt independent stack.

The private Storage archive extracted15objects, each matching the corresponding15Storage-backed Core assets by bytes and SHA256. Another15active Core asset records had no matching Storage object. All had generated test-edition/student names; source review found a live Storage contract that removes bytes in teardown while retaining metadata and a submission reference. Temporary local-blob fixtures may also contribute. This evidence supports a fixture-cleanup diagnosis, not deletion by name, restoration of missing bytes or full restore certification. No original data was overwritten and no readiness gate was changed.

## Pending

The frontend consumer review found a75MiB client import cap below a valid Core export and malformed imported submissions that could crash rendering. Corrections and the multicourse/Taylor interaction flow are being validated separately. A possible export/inspect encoded-size policy mismatch is under active review. Calendar mock/DST/ICS and MCP are not certified here. Six final REA mission receipts, global G0, human pilot, scientific/date approval and launch remain unevaluated or pending.
