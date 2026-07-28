# ARDESIA MCP control-plane activation receipt

Run `DEVOS-MCP-BOOTSTRAP-001`, goal `DEVOS-CONTROL-PLANE`.

## Frozen sources

- Product: `36e6753cc55c114cb1c0815a7e2f8911a0b71dc7`, clean `main`.
- Knowledge: `5a8c50d7cf6b67db652b6fd769034e5d7a317091`, clean `sync/current`.
- Bootstrap SHA-256: `205eaef0ec05542c5445a2a1eea90d4b3e0af1da55cf4f552be06f50637478bf`.
- Context digest: `ed3ce7abd22b5c5d73a964c3a822183ce6d2d4978826aac2bc9da53d480b6125`.
- Acceptance digest: `40988f5a5da713d60a7c4fa76e0a6415f03fe589f55e5253951e8626e91bbceb`.

## Installed services

| LaunchAgent | Evidence |
|---|---|
| `com.ardesia.mcp.controller` | continuous `KeepAlive`; failure injection recovered from runs 1 to 2 |
| `com.ardesia.mcp.mailbox` | 300 seconds; timer execution observed from runs 1 to 2, exit 0 |
| `com.ardesia.mcp.watchdog` | 900 seconds; foreground exact-process recovery PASS |
| `com.ardesia.mcp.review` | hourly at minute 02; calendar execution observed from runs 1 to 2, exit 0 |
| `com.ardesia.mcp.backup` | daily at 03:17; launchd canary completed and both Git bundles verified |

The five stderr logs were zero bytes after scheduled execution and failure injection. No traceback, error or exception marker was found in the stdout logs. Prior V3 controller/watchdog plists were preserved in the runtime for rollback.

## Adapter and memory evidence

- Claude Code OAuth renewed for the operator account.
- `writer-claude` canary used `--dangerously-skip-permissions` only inside an isolated leased Git fixture.
- Exact writer output SHA-256: `ad1d675270cedbb207849728430b0333c49e22be69478f62987521281233e7cf`; no other changed file.
- Codex App Server stdio lifecycle: initialize, thread start, turn start, interrupt, interrupted completion and resume all PASS.
- Read-only MCP stdio initialize, tools/list and tools/call PASS. No write tool is exposed.
- WikiLLM indexed 552 Markdown notes (6,297,156 bytes) from the frozen Knowledge SHA into a derived SQLite FTS5 database. Canonical write is false.
- TencentDB is `SHADOW` / `DEFERRED_NO_CREDENTIAL_REFERENCE`; capture-only outbox is enabled, while recall injection, offload, persona, auto-skill and canonical write are false.
- AgentMemory was not probed, read or written.

## Verification

- Deterministic controller suite: 10/10 PASS locally and on the Mac mini.
- Real hourly review completed at `2026-07-28T04:02:02.033707Z`.
- Review manifest digest: `e4842ff128e787e2baed086587ba86f4c9318ebcc29961ce9fd93c3d8b85a76a`.
- Real mailbox interval poll completed at `2026-07-28T04:06:45.291614Z`.
- GitHub status: https://github.com/AndreaMarro/ardesia/issues/215#issuecomment-5099831461

Runtime report SHA-256 values:

```text
95997e7d993f4c3a3633bd54f8c832dadeccdfe3c5b460f9145175f36f8d1e87  CODEX_CONTROL_REPORT.md
df2656b5043ad52d23c9f2d65a3ab817cf9e7eb9dc320a7bb3173830741aa09f  FAILURE_INJECTION_REPORT.md
5fef6f79441870344a474d015c25976b4dd493a0edaa89c0d0c5fe5723324912  MCP_AUTHZ_MATRIX.json
f28a4345a142a302808cdec84e4d77d5069ce4363fec6f90aff891edfab11e2c  MCP_CONTROL_PLANE_REPORT.md
4c05eea49a496907567a8ac406272bcc84a2b3fb21235a660eeb720479424cc8  MCP_TOOL_INVENTORY.json
bc211e4884bd4f9770e6bb293159858a17fdc41b5849cad03435ac19ec8da450  ROLLBACK.md
e3138ed346dae066604ee446bf401990d4547cf4a21664d9423e06f7fde76fdb  SCHEDULED_TASKS_REPORT.md
```

Final state: `READY_FOR_HUMAN_REVIEW`. Merge and deploy remained disabled.
