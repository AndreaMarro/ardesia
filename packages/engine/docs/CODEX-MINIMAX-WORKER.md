# Codex + MiniMax-M3 worker lane

This adds a conservative ARDESIA worker lane that runs `codex exec` with MiniMax-M3 through a dedicated Codex home. It does **not** remove the existing Hermes blind:

- Hermes remains isolated from `OPENAI_API_KEY` / `OPENROUTER_API_KEY`.
- Codex runs as an explicit worker, not as a secret leaked into Hermes.
- MiniMax-M3 is configured as the Codex model provider.
- Provider auth is pulled from macOS Keychain through a command-backed token helper.
- Codex runs log JSONL events to `~/maestro-logs/codex-minimax/`.

## Why this shape

OpenAI Codex supports non-interactive automation through `codex exec`. The safe default is read-only; write access is opt-in through `--sandbox workspace-write`.

Provider configuration belongs in user-level `CODEX_HOME/config.toml`, not in a project-local `.codex/config.toml`. Codex also supports custom providers with `model_provider`, `model_providers.<id>.base_url`, command-backed `auth`, and `wire_api = "responses"`.

## Files

- `packages/engine/bin/codex-minimax-worker.sh`

## One-time setup on the Mac mini

Do not paste the MiniMax key into repo files, issues, PRs, logs, or chat.

Recommended setup:

```bash
cd ~/lessonos  # or the current ARDESIA checkout containing packages/engine
read -rsp 'MiniMax key: ' MINIMAX_API_KEY; echo
export MINIMAX_API_KEY
bash packages/engine/bin/codex-minimax-worker.sh setup-key
unset MINIMAX_API_KEY
```

This stores the key in macOS Keychain as:

```text
service: ardesia-minimax-api-key
account: $USER
```

You can override names if needed:

```bash
MINIMAX_KEYCHAIN_SERVICE=my-minimax-key \
MINIMAX_KEYCHAIN_ACCOUNT="$USER" \
bash packages/engine/bin/codex-minimax-worker.sh setup-key
```

## Run modes

### Read-only review

Use this first. It cannot edit files.

```bash
cd ~/lessonos
bash packages/engine/bin/codex-minimax-worker.sh review
```

For another repo:

```bash
bash packages/engine/bin/codex-minimax-worker.sh review ~/maestro-studio
```

### Read-only plan

```bash
bash packages/engine/bin/codex-minimax-worker.sh plan ~/lessonos
```

### Minimal repair

Use only for bounded tasks with clear acceptance criteria.

```bash
bash packages/engine/bin/codex-minimax-worker.sh repair \
  "Fix the failing unit test without touching eval/gate.sh or weakening tests." \
  ~/lessonos
```

### Custom task

```bash
bash packages/engine/bin/codex-minimax-worker.sh custom \
  "Inspect the plugin manifest loader and propose one safe refactor. If you edit, keep the diff minimal." \
  ~/maestro-studio
```

## Generated Codex config

The script creates this under `~/.codex-minimax-m3/config.toml`:

```toml
model = "MiniMax-M3"
model_provider = "minimax"
model_reasoning_effort = "medium"
model_reasoning_summary = "concise"

[model_providers.minimax]
name = "MiniMax"
base_url = "https://api.minimax.io/v1"
wire_api = "responses"
request_max_retries = 2
stream_max_retries = 2
stream_idle_timeout_ms = 600000

[model_providers.minimax.auth]
command = "/Users/<you>/.codex-minimax-m3/bin/minimax-token"
timeout_ms = 5000
refresh_interval_ms = 0
```

If MiniMax changes the exact API URL or model identifier, override without editing the repo:

```bash
MINIMAX_CODEX_MODEL="MiniMax-M3" \
MINIMAX_CODEX_BASE_URL="https://api.minimax.io/v1" \
bash packages/engine/bin/codex-minimax-worker.sh review
```

## Safety rules

The worker deliberately unsets these for the Codex process:

```bash
OPENAI_API_KEY
OPENROUTER_API_KEY
MINIMAX_API_KEY
```

MiniMax auth is obtained by Codex via the Keychain token helper instead. This prevents ordinary shell commands run by the agent from inheriting the key as a broad environment variable.

Default roles:

| Mode | Sandbox | Use |
|---|---|---|
| `review` | read-only | adversarial review |
| `plan` | read-only | next-task planning |
| `repair` | workspace-write | bounded patch |
| `custom` | workspace-write | explicit one-off task |

## Integration recommendation

Do **not** immediately wire this into `driver-orch.sh` as a default builder. Use it for 20-30 runs first and measure:

- real bugs found;
- regressions introduced;
- cost per run;
- average wall time;
- overlap with Claude Opus 4.8 reviews;
- whether it catches classes Hermes/Claude miss.

Only after that, add an opt-in post-keep hook such as:

```bash
if [ "${ARDESIA_CODEX_MINIMAX_POST_REVIEW:-0}" = "1" ]; then
  nohup bash packages/engine/bin/codex-minimax-worker.sh review "$REPO" \
    >> "$HOME/lessonos/hourly.log" 2>&1 &
fi
```

The correct architecture is:

```text
Claude Opus 4.8 = main builder
Hermes-DeepSeek = low-cost / fallback worker
Codex + MiniMax-M3 = balanced explicit worker / adversarial reviewer / bounded repair lane
```
