# Study MCP, read only

This optional local stdio service forwards three reads to the existing Study HTTP API. It has no database access, service key, factory, shell, SQL, arbitrary URL tool, mutation, calendar write or second identity store. Every valid call reaches Study HTTP with one operator-supplied private user session; Core decides authority again on each invocation. `clientInfo`, tool arguments, source text and document artifacts cannot supply an actor or role.

## Contract

| Tool | Inputs | Authorized Core read |
| --- | --- | --- |
| `course.list_mine` | `limit` integer 1–50, default 20; optional opaque `cursor` up to 8192 characters | `GET /study/editions?limit=…&after=…` |
| `lesson.get_context` | **all** `contextId`, `resourceId`, `revisionId`; optional `query` up to 500 characters | `GET /study/context/{contextId}?resourceId=…&revisionId=…&query=…` |
| `submission.get_receipt` | `receiptId` | `GET /study/receipts/{receiptId}` |

Unexpected arguments are forbidden. IDs in paths are restricted and encoded. A listing returns one page, not an unbounded automatic traversal. The returned cursor is opaque; legacy cursors are not restricted to the 128-character limit for creating new editions. No invented `/courses/mine` endpoint is used. Teacher ownership and student confirmed membership come from Core's existing `/editions` contract, not from client metadata. The listing does not certify payment or a confirmed timetable. Core supplies no schedule version; `sourceVersion.scheduleVersion` is null.

Both `structuredContent` and the single JSON text fallback contain the same `ardesia.mcp.read/1` envelope: status, allowlisted data, truthful source version, evidence references, capabilities, losses, and a safe error code when unavailable. The selected context must match all three returned identities. Each review retains its own evidence refs. Receipt versions contain the actual `receiptId`, `submissionId` and integer `revision`; a missing source hash is declared, never synthesized. `received` means received, not correct. Historical sources remain explicitly `HISTORICAL`; no head fallback occurs.

Assigned diary transfer receipts preserve Core's `activityContext`, including the object-shaped rubric `{criterion, procedureRequired: true}`. The criterion is preserved without rewriting; no list conversion, inferred rubric or automatic procedure approval is introduced. New Core fields are allowlisted rather than exposed implicitly.

There are no MCP Apps resources, `ui://` URLs or HTML. `interactiveUI` is false. Canvas placement, original media playback and editing are unsupported. Source, prompt, rubric and review strings are inert untrusted data. An MCP consumer must not treat quoted source instructions as tool or identity authority.

## Run locally

Use a separate Python environment. The version freeze in `requirements.lock` was taken from the verified official SDK environment on Python 3.13/macOS arm64. It pins versions, not wheel hashes or all-platform reproducibility. Do not install it into the Study API environment: `httpx2` and SDK v2 are isolated here.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.lock
export ARDESIA_STUDY_ORIGIN=http://127.0.0.1:5323
# Provision ARDESIA_STUDY_SESSION privately in the process environment.
# Never paste it into a shared command, tool argument, trace or repository file.
PYTHONPATH=. .venv/bin/python -m study_mcp
```

Run from this directory. The session is a user cookie value accepted by Study's `study_session`, not a service key. No session is loaded from an MCP client or a file automatically. Configuration permits only HTTP loopback with an explicit port and no path, query, credentials or fragment; `localhost` is pinned to `127.0.0.1`. Changing endpoint or user requires a separately configured process. Logout/revocation is enforced on the next Core request. Local environment/process access remains a trusted operator boundary; this service is not a multi-user network server.

Stdout is reserved for SDK protocol frames. Fixed generic diagnostics go to stderr; dependency request/error logging is disabled. No private error body is read or returned. HTTP redirects and environment proxies are disabled. Four HTTP requests can be active per process, queue wait is 250 ms, each request deadline is 8 seconds after admission, HTTP stage timeouts are 5 seconds, and each decoded response is capped at 512 KiB. There is no silent truncation; an oversized authorized result is unavailable with `RESULT_TOO_LARGE`. The text-plus-structured MCP frame can be larger than the HTTP body. These bounds do not certify unlimited host throughput or bound the SDK's incoming stdio frame parser. Run only under a trusted local MCP host.

Safe failures: `INVALID_ARGUMENTS`, `NOT_SUPPORTED`, `AUTH_REQUIRED`, `NOT_AVAILABLE` (same for 403/404), `CORE_UNAVAILABLE`, `INTEGRITY_MISMATCH`, `RESULT_TOO_LARGE`, `BUSY`. No private error body or token appears in a failure packet. Cancellation propagates, releases the HTTP slot and closes response streams; client EOF closes the SDK server lifespan and HTTP client.

## Verification

Unit boundary tests explicitly use HTTP MockTransport. They are separate from transport acceptance:

```sh
PYTHONPATH=. .venv/bin/python -m unittest discover -s tests -p test_boundaries.py -v
```

Actual transport tests use the **official `mcp.Client`**, spawning this module through the **official stdio transport**, forced to protocol `2026-07-28`. They start an actual loopback Study HTTP process from this checkout in a **separate API Python environment**, and create only a disposable SQLite fixture. No shared PostgreSQL/Auth account is modified. The fixture and private 0600 session file are deleted and its HTTP process is reaped on exit.

```sh
ARDESIA_MCP_TEST_API_PYTHON=/absolute/path/to/study-api/.venv/bin/python \
  PYTHONPATH=. .venv/bin/python -m unittest discover -s tests -v
```

Coverage includes bounded own-edition pagination; exact submitted historical revision vs private head/unsubmitted revision; peer/unrelated-tutor isolation even with a claimed admin `clientInfo`; authorized receipt pins; isolated session revocation; no UI capability; forbidden factory/URL/actor arguments; proxy and redirect denial; streaming byte caps; timeouts/cancellation; saturation; JSON error redaction; stdout framing and EOF/config-failure cleanup. A missing API Python environment fails integration setup, rather than silently reporting acceptance.

This is not evidence of Supabase Auth/PostgreSQL, a remote deployment, scientific approval, or compatibility with ChatGPT, Claude or Codex hosts. Those host states remain **UNKNOWN** until separately replayed with a supported host and the final candidate. A real PG/Auth bridge must use the same read-only tools and existing authorized session, without revoking shared G0 identities.

## Primary sources and licenses

Original adapter code; no third-party app bundle or proprietary bytes are copied. Public API usage was checked against installed official SDK **2.3.0**, the archived R5 primary-source package, the pinned [SDK source](https://github.com/modelcontextprotocol/python-sdk/tree/2118f14f8a19bc158d8a1cf90af58d85d187f849), and [MCP 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28). The public constructor-based `mcp.server.Server` API is used to publish explicit schemas and enforce strict Pydantic inputs; no v1/FastMCP API is assumed. The official SDK handles protocol dispatch and stateless-era framing.

Direct dependencies: `mcp` MIT, `pydantic` MIT, `httpx2` BSD-3-Clause. SDK and httpx2 notices are preserved under `licenses/`. Transitive versions are pinned in the service-local freeze. The research blueprint's older proposed `/courses/mine` path and optional reference pair are superseded by the actual Core contract above; archival research evidence is left unchanged.
