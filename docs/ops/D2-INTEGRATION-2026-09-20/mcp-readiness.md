# MCP readiness (research only — NO runtime implemented)

Observed 2026-09-20. Official sources checked (URL + date + fact in ledger
appendix below; full table elicited via read-only web verification).

## Protocol / SDK ground truth

- MCP spec latest: **2026-07-28** (stateless core, opt-in Tasks/Skills/Apps
  extensions). No newer dated revision found.
- Python SDK current line: **v2.x** (v2.0.0 Jul 28 → v2.1.x Aug → v2.2.0 Sep);
  1.x maintenance. **Tasks extension NOT shipped** (v2.2.0 known gaps:
  tasks SEP-2663, DPoP, jwt-bearer unimplemented; Tasks deferred as
  wire-incompatible with earlier in-core design).
- Conformance: `npx @modelcontextprotocol/conformance client|server`,
  per-revision frozen requirements, wire-schema + tier checks.
- ChatGPT connection: Streamable-HTTP MCP server + developer mode; public
  submission needs stable public HTTPS (typically `/mcp`); Tunnel +
  `tunnel_id` for private testing; Refresh after tool changes.
- MCP Apps UI linkage: `_meta.ui.resourceUri` → `ui://` resource
  (`text/html;profile=mcp-app`); `ui/*` JSON-RPC over postMessage;
  decoupled pattern (structuredContent-only data tools; render tools attach
  template); official `ext-apps` spec + SDK packages.
- Auth: OAuth 2.1 per MCP authorization spec (CIMD preferred, DCR
  fallback, PKCE S256, per-tool securitySchemes, runtime www_authenticate).
- Secure MCP Tunnel: documented and EXISTS for **private** dev/testing
  (outbound-only tunnel-client → private stdio/HTTP server); does NOT
  support public plugin submission/distribution.
- NOT verified: v2.2.0 release year print, full spec-version index,
  tunnel-client version pin, this workspace's developer-mode eligibility.

## Product MCP vs DevOS MCP (separation)

| SURFACE | OWNER | PURPOSE | TRUST | STATUS |
|---|---|---|---|---|
| Product MCP (didactic tools) | future thin adapter | lesson recall/proof for ChatGPT | read-only, auth-derived principal | NOT IMPLEMENTED (this doc is the spec seed) |
| DevOS/control-plane MCP (#215, OPEN) | control plane | Mac-mini directives, Codex App Server, anti-drift | broad read/fetch, not full write | NOT IMPLEMENTED; separate system, do not conflate |
| GitHub connector | future session | reconstruct work from GitHub | read issues/PRs/CI | assumed available |
| Native ToolHost | studio | plugin capabilities | host-signed | exists, not MCP |
| Future Kirchhoff capability | separate repo | scientific verification | adapter only | read-only note |

## Existing reusable application logic

- `lessonos/mcp/grounded_memory.py`: `GroundedMemoryServer` (in-process
  JSON-RPC 2.0, PROTOCOL_VERSION 2026-06-18 — predates current spec).
  Reusable: `verify_citation`/`is_verified_excerpt` re-verification on
  every emission; `dropped_ungrounded` declarations; recall/progression/
  prerequisites query shapes over `Store` + teacher book.
- Legacy shell to replace: JSON-RPC method dispatch, `teacher_id` as
  required caller-supplied input (identity gap), transport assumptions.

## Auth/authz gap

Caller-supplied `teacher_id` != authentication. Future: authenticated
principal → server-side account/teacher scope + tenant binding; model must
not select tenant via parameter. Refusal/error paths must not leak other
users' data.

## First tool draft: lesson_recall (headless-first, no UI prerequisite)

Input (model-visible): `{query: string, top_k: 1..50 default 5,
lesson_id?: authorized scope}`. NOT model-visible as authority:
`teacher_id`/`tenant_id`/`account_id` (server-derived).
Output: `items[{seg_id, lesson_id, text, snippet, grounding}],
dropped_ungrounded, source_revision` + draft outputSchema with
`structuredContent`. UI later: evidence/proof card (excerpt, source,
lesson, grounding status, limits, Open in Ardesia) — never all of Ardesia
in an iframe as the first app.

## Threat matrix (each: current guard → missing guard → future layer/test)

- caller tries another teacher → store scoping exists → server principal missing → auth binding + cross-teacher test
- foreign lesson id → lessonId filter exists → scope auth missing → authorized-scope test
- forged seg_id → verify_citation exists → transport same → unit (exists in engine)
- purged segment → dropped+declared exists → revision proof → source_revision test
- cross-lesson citation → same-lesson guard exists → same
- stale source revision → NOT present → source_revision field + test
- unknown principal → NOT present → auth layer + test
- empty store → empty result (verify behavior) → test
- oversized top_k → _MAX_TOP_K=50 clamp exists → test boundary
- malformed query → NOT present → validation + test
- resource leak → bounded top_k; no pagination audit → test
- tool claims read-only but mutates → read paths only (audit) → mutation test

## Explicit non-goals (this session)

No MCP HTTP server, endpoint, OAuth, tunnel activation, submission, App UI,
FastAPI gateway, or any runtime. Product `graph_search`-style tools from the
old product doc stay unimplemented until gateway contracts freeze AND this
integration lands.
