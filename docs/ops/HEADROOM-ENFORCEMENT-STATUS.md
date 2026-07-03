# HEADROOM-ENFORCEMENT-STATUS

Date: 2026-07-01 13:55 CEST  
Status: live but port ownership ambiguous.

## Verified Facts

- Health check:

```bash
ssh macmini 'curl -sS http://127.0.0.1:8787/health'
```

returned `service=headroom-proxy`, `status=healthy`, `ready=true`, `version=0.27.0`, upstream Anthropic healthy.

- Process:

```text
PID 35007 /Users/progettibelli/headroom-venv/bin/headroom proxy --port 8787
```

- Codex config references:

```text
~/.codex/config.toml: model = "gpt-5.5"
~/.codex/config.toml: model_provider = "headroom"
~/.codex/config.toml: openai_base_url = "http://127.0.0.1:8787/v1"
~/.codex/config.toml: [mcp_servers.headroom]
```

- Claude account wrapper references Headroom/Anthropic routing, with API material redacted during inspection.

## Risk

`lsof -i :8787` shows two listeners:

- Headroom on `127.0.0.1:8787`.
- Broker on `*:8787` from `com.broker`.

Local `127.0.0.1` probes hit Headroom, but wildcard broker on the same port family is still an operational ambiguity. Do not assume all clients hit Headroom unless their target host is known.

## Enforcement Decision

- Keep Headroom running.
- Do not change port or launchd in this session.
- Next maintenance should choose one owner for `8787` or move broker/Headroom with backup and rollback.
- Do not call Codex/gpt-5.5 the active Hermes brain until live factory logs prove that lane is actually used.

## COV

Commands used:

- `curl -sS http://127.0.0.1:8787/health`
- `lsof -nP -i :8787`
- redacted grep over `~/lessonos/bin/claude-acct.sh` and `~/.codex/config.toml`

No secret values were printed intentionally.
