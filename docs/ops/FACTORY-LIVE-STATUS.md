# FACTORY-LIVE-STATUS

## Update 2026-07-02 01:40 CEST - Codex ARDESIA sprint gate-first COV

Mode: bounded operational verification plus docs/context-packet patch. No production deploy, no Vercel deploy, no launchd change, no process kill, no gate edit, no push, no merge, no reset/clean.

### LessonOS Gate

Verified facts:

- Mini reachable via `ssh macmini`; sampled time `2026-07-02 01:26:51 CEST`.
- `~/lessonos` is on `auto/main` and remains dirty with factory-owned work: `.no-codex/.tmp/plugins`, `lessonos/api/app.py`, `lessonos/api/schemas.py`, `uv.lock`, `.coord.lock`, sqlite shm/wal files, and untracked `tests/test_api_unlocked_path_package_review_spaced_due_anki.py`.
- The previously reported adversarial Kimi harness failure is not currently reproducible: `uv run pytest -q tests/test_adversarial_kimi.py -x --no-header` returned `2 passed in 0.05s`.
- The Anki spaced-due package test path exists and passed in this checkout: `uv run pytest -q tests/test_api_unlocked_path_package_review_spaced_due_anki.py -x --no-header` returned `10 passed, 1 warning in 0.57s`.
- `uv run pytest -q --lf -x --no-header` was started manually at 01:20 CEST as the bounded post-gate check and exited green: `4587 passed, 4 skipped, 20 warnings in 1023.49s (0:17:03)`.
- Latest factory log tail still shows the post-fix green sequence on 2026-07-01: kept passes at `08:54:47Z`, `10:54:33Z`, `13:23:42Z`, and `16:01:45Z`; the earlier red/revert/noop window is historical and was followed by green kept ticks.

### Scheduler / Factory

Verified facts:

- The local Codex app automation `ardesia-factory-audit-and-concrete-progress` is still `status = "PAUSED"` in `/Users/andreamarro/.codex/automations/.../automation.toml`.
- Sampled Mini `launchctl list` no longer showed `com.elab.lessonos-hourly` in the filtered ARDESIA/LessonOS list. The only LessonOS pytest process observed during the pass was the manual `--lf` check launched by this Codex session; it exited green before closeout.
- Core services still present in the sampled filtered list include `com.ardesia.api`, `com.ardesia.litellm`, `com.ardesia.tutor`, `com.ardesia.nanobot`, `com.elab.ardesia-ipad`, `com.maestro.tg-bridge`, `com.headroom.proxy`, `com.broker`, and `com.elab.agentmemory`.
- No scheduler was deleted, booted out, restarted, or re-enabled by this pass.

### AgentMemory / Headroom / Hermes

Verified facts:

- AgentMemory MCP tools were not exposed to this Codex session. REST fallback on `127.0.0.1:3111` timed out locally and on the Mini with `curl --max-time 3 .../agentmemory/livez`.
- Mini AgentMemory process is alive but unhealthy/hot in the sampled process list: PID `31324`, high CPU, about 2.6 GB RSS, launchd label `com.elab.agentmemory` sampled with status `-9`.
- Headroom is healthy on the Mini at `127.0.0.1:8787/health`: `service=headroom-proxy`, `status=healthy`, `ready=true`, version `0.27.0`, upstream Anthropic healthy.
- Latest sampled Hermes lines in `hourly.log` report no substantive criticals for the recent reports: LessonOS `20260701-1049-lessonos-6775f70.md` and Studio reports including `20260701-1759-studio-15c8fdc.md`.

### Vercel / Demo

Verified facts:

- Vercel CLI is authenticated as `andreamarro`; `vercel project ls` did not return a useful body in this pass, so this run used direct read-only HTTP probes.
- `https://ardesia-lavagna.vercel.app/` returned HTTP `200`.
- `https://ardesia-api-vercel.vercel.app/health` returned HTTP `200`.
- `https://www.elabtutor.school/` returned HTTP `401`, consistent with gated ELAB production.
- No deploy or alias change was run.

### Sprint Output

Tangible outputs from this pass are docs/status/context packet updates plus a completed LessonOS last-failed gate check. No product code was changed because the repo already contains a dirty product slice from previous work.

AgentMemory fallback payload, not saved because `/agentmemory/livez` timed out:

```text
ARDESIA sprint 2026-07-02: adversarial Kimi targeted test passed (2), Anki spaced-due test passed (10), LessonOS --lf check passed (4587 passed, 4 skipped), Codex automation paused, Headroom healthy 0.27.0, AgentMemory degraded/timeouts, Vercel demo surfaces ardesia-lavagna and api health reachable read-only.
```

Files patched in this pass:

- `docs/ops/FACTORY-LIVE-STATUS.md`
- `docs/ops/SCHEDULED-PROCESSES-INVENTORY.md`
- `docs/ops/VERCEL-MAP.md`
- `docs/ops/CONTEXT-PACKETS.md`
- `docs/ops/NEXT-SESSION-PROMPT.md`

### COV

Commands used:

- `git status -sb`, `git log --oneline -8`, `git diff --stat`, `git diff --check`
- `ssh macmini 'hostname; date; uptime; whoami'`
- `ssh macmini 'cd ~/lessonos && git status -sb && git log --oneline -8 && git diff --stat'`
- `ssh macmini 'cd ~/lessonos && /Users/progettibelli/.local/bin/uv run pytest -q tests/test_adversarial_kimi.py -x --no-header'`
- `ssh macmini 'cd ~/lessonos && /Users/progettibelli/.local/bin/uv run pytest -q tests/test_api_unlocked_path_package_review_spaced_due_anki.py -x --no-header'`
- `ssh macmini 'cd ~/lessonos && /Users/progettibelli/.local/bin/uv run pytest -q --lf -x --no-header'`
- `ssh macmini 'launchctl list | grep -iE "lessonos|ardesia|agentmemory|headroom|broker|maestro|hermes|litellm|tutor|nanobot|replenish|strategos|deadman" || true'`
- `ssh macmini 'ps aux | grep -iE "hourly-tick|driver-orch|eval/gate|uv run pytest|pytest -q|agentmemory|headroom|hermes|broker|litellm" | grep -v grep || true'`
- `ssh macmini 'tail -80 "$HOME/lessonos/hourly.log"; tail -80 "$HOME/lessonos/driver.log"'`
- `curl --max-time 3 -fsS http://127.0.0.1:3111/agentmemory/livez || true`
- `ssh macmini 'curl --max-time 3 -fsS http://127.0.0.1:8787/health || true; curl --max-time 3 -fsS http://127.0.0.1:3111/agentmemory/livez || true'`
- `curl -L -s -o /dev/null -w ... https://ardesia-lavagna.vercel.app`
- `curl -L -s -o /dev/null -w ... https://ardesia-api-vercel.vercel.app/health`
- `curl -L -s -o /dev/null -w ... https://www.elabtutor.school`

## Update 2026-07-01 18:31 CEST - Codex ToolCanvas slice CoV

Mode: local monorepo patch and verification only. No production deploy, no Vercel deploy, no launchd change, no process kill, no push, no merge, no reset/clean.

### Product Slice

Verified facts:

- Studio now accepts `maestro-tool://` embeddables through Excalidraw `validateEmbeddable` and `renderEmbeddable`.
- Added first neutral on-canvas Simulation Plugin object: `maestro-tool://io.maestro.sim-reference-blink/reference-blink-led-1`.
- The object renders inside the board, is movable/resizable as an Excalidraw embeddable, and runs deterministic Blink logic from the existing reference Arduino runtime.
- Browser CoV verified the standard Excalidraw interaction path: click `sim`, activate the embeddable center, click `Step 1000 ms`, and observe `HIGH` at `1000`.
- Screenshot artifact: `/tmp/ardesia-toolcanvas.png`.
- ELABTutor-specific contract was kept downstream in `plugins/elab-tutor/docs/specs/ardesia-canvas-plugin-contract.md`; Studio core does not import ELAB/UNLIM code.
- Verified ELAB Blink reference from local ELAB data is `v3-cap5-esp1`, `Vol. 3 pag. 30`; physical/manual crop remains a blocker for any "book-identical" claim.

### Local CoV

Commands and results:

- `npm --prefix apps/studio test -- ToolCanvasEmbeddable.test.tsx`: `1 passed`, `3 passed`.
- `npm --prefix apps/studio run typecheck`: passed.
- `npm --prefix apps/studio run build`: passed.
- `git diff --check`: passed.
- `npm run verify`: engine `2044 passed, 7 skipped`; Studio Vitest `583 passed, 5 skipped`; Studio build passed.
- `bash apps/studio/eval/gate.sh`: `{"passed":584,"failed":0,"exit":0}`.
- `bash apps/studio/eval/replay-check.sh`: Playwright replay `1 passed`.

### AgentMemory

Direct local recall attempts against `127.0.0.1:3111` failed twice with connection reset. Treat AgentMemory as degraded cache for this slice; primary sources and local gates were used instead.

## Update 2026-07-01 17:59 CEST - Codex factory/core-monorepo CoV

Mode: read-only Mini poll plus local monorepo verification. No production deploy, no Vercel deploy, no launchd bootout/disable, no process kill, no push/merge.

### Factory State

Factory state: live, currently idle in the sampled process filter, still degraded by AgentMemory.

Verified facts:

- Mini reachable via `ssh macmini`; host time sampled as `Wed Jul 1 17:59:20 CEST 2026`.
- Latest classified LessonOS tick: `2026-07-01T13:23:41Z`, `pass (kept; gate verde (passed=4584; 1127s))`, done at `2026-07-01T15:10:42Z`.
- Post-pass digest completed: `DIGEST-latest.md` mtime `Jul 1 17:55:29 2026`, log line `digest scritto ... 2026-07-01T15:55:30Z`.
- Latest sampled Hermes line: `HERMES-2: report .../20260701-1556-studio-6260507.md — CRITICI raw=0 substantive=0`.
- Final filtered `pgrep` for `hourly-tick|hourly-digest|eval/gate.sh|uv run pytest -q --no-header|pytest -q --no-header` returned no process rows.
- `~/lessonos` remains dirty with factory-owned in-flight work: `.no-codex/.tmp/plugins`, `DIGEST-latest.md`, `lessonos/api/app.py`, `lessonos/api/schemas.py`, `uv.lock`, sqlite shm/wal files, and untracked `tests/test_api_unlocked_path_package_review_spaced_due_liascript.py`.
- Headroom remains healthy on `127.0.0.1:8787`, version `0.27.0`, upstream healthy.
- AgentMemory is down through the expected REST route: `curl --max-time 3 -fsS http://localhost:3111/agentmemory/livez` failed to connect.

### Local Monorepo Core

Verified facts:

- Added root command surface: `npm run status`, `npm run bootstrap`, `npm run test`, `npm run build`, `npm run verify`, `npm run factory:readonly`, with ELAB plugin commands split into explicit `*:elab` scripts.
- Core verify target is `packages/engine` + `apps/studio`; ELAB plugin remains explicit lineage work and was not bootstraped.
- `npm run verify` passed:
  - Engine hermetic pytest with live keys unset: `2044 passed, 7 skipped`.
  - Studio Vitest: `580 passed, 5 skipped`.
  - Studio production build: passed.
- Studio frozen gate passed separately: `bash apps/studio/eval/gate.sh` -> `{"passed":581,"failed":0,"exit":0}`.
- Replay gate dependency installed locally via `npm --prefix apps/studio exec playwright install chromium`; `bash apps/studio/eval/replay-check.sh` passed `1 passed`.

### Scheduler Decision

- Keep Codex app automation paused until AgentMemory is repaired or explicitly treated as non-critical cache.
- Keep Mini launchd jobs unchanged in this pass.
- Do not merge ARDESIA PR #6 as-is; remote read-only triage found it touches tick/orchestration despite body safety language.
- Do not ratify LessonOS PR #3 blindly; remote read-only triage found GitHub Actions blocked by budget and noisy `.no-codex`/sqlite/jsonl/session content in the PR.

### COV Commands

- `npm run status`
- `npm run verify`
- `bash apps/studio/eval/gate.sh`
- `bash apps/studio/eval/replay-check.sh`
- `env -u KIMI_API_KEY -u DEEPSEEK_API_KEY uv --directory packages/engine run pytest -q --no-header`
- `npm --prefix apps/studio test -- --run`
- `npm --prefix apps/studio run build`
- `npm run factory:readonly`
- `ssh macmini 'date; tail -80 "$HOME/lessonos/hourly.log"; stat -f "%Sm %N" "$HOME/lessonos/hourly.log" "$HOME/lessonos/DIGEST-latest.md"; pgrep -fl "hourly-tick|hourly-digest|eval/gate.sh|uv run pytest -q --no-header|pytest -q --no-header" || true'`

## Update 2026-07-01 15:17 CEST - Codex active-gate poll

Mode: read-only poll. No production deploy, no launchd bootout/disable, no process kill, no manual full gate, no patch in `~/lessonos`.

### Status

Factory state: live but degraded; current post-pass digest/gate outcome is still pending.

Verified facts:

- Mini reachable via `ssh macmini`; host time sampled as `Wed Jul 1 15:15:25 CEST 2026`.
- ARDESIA local repo is on branch `codex/ardesia-ops-headroom-20260701`; worktree remains dirty from pre-existing ops/product docs. `git diff --check` passed locally.
- Latest classified LessonOS product tick remains `2026-07-01T10:54:33Z`: `pass (kept; gate verde (passed=4588; 951s))`, done at `2026-07-01T12:23:31Z`.
- `hourly.log` and `driver.log` still have mtime `Jul 1 14:23:31 2026` and no later classified product outcome in the sampled tail.
- A post-pass digest/gate process tree is still active under the same hourly tick:
  - PID `56669` `/bin/bash /Users/progettibelli/lessonos/bin/hourly-tick.sh`, elapsed about `02:21`.
  - PID `70505`/`70506` `/bin/bash /Users/progettibelli/lessonos/bin/hourly-digest.sh`, elapsed about `52m`.
  - PID `70507`/`70509` `bash eval/gate.sh`, elapsed about `52m`.
  - PID `70510` `uv run pytest -q --no-header`, PID `70511` `.venv/bin/pytest -q --no-header`, elapsed about `52m`; sampled CPU fluctuated from high CPU to brief sleeping and back to high CPU.
- Do not start a manual `bash eval/gate.sh` while the above process tree is live.
- Current `~/lessonos` branch remains `auto/main`. Latest sampled commits are coordination/auto-replenish entries, headed by `b2a8752 coord: AUTO-REPLENISH backlog (+2, strategist deepseek-v4-pro)`.
- Current `~/lessonos` worktree remains dirty and factory-owned: `.no-codex/.tmp/plugins`, `lessonos/api/app.py`, `lessonos/api/schemas.py`, `uv.lock`, untracked `.coord.lock`, sqlite shm/wal files, and `tests/test_api_unlocked_path_package_review_spaced_due_moodle.py`.
- Headroom remains healthy on `127.0.0.1:8787`, version `0.27.0`, ready true, upstream Anthropic healthy.
- AgentMemory is not healthy through the expected REST liveness route: `curl --max-time 3 -fsS http://localhost:3111/agentmemory/livez` returned HTTP 404. Observed processes include stale/high-risk recall PID `68734`, main `node .../agentmemory` PID `73302`, and `iii` PID `73310`; launchd lists `com.elab.agentmemory` as PID `73302` with status `-9`. No AgentMemory process was changed.

### Scheduler decision

- Keep Codex app automation paused.
- Keep Mini launchd jobs unchanged in this pass.
- `com.elab.lessonos-hourly` remains `KEEP-WATCH`, now stronger `PAUSE-CANDIDATE` evidence if this post-pass digest gate continues to run long or overlap future ticks.
- Do not change Headroom/broker port ownership in this pass.
- Do not restart AgentMemory yet; write exact backup/rollback commands first.

### Next action

1. Continue polling PID tree `56669 -> 70505/70506 -> 70507/70509 -> 70510/70511` until it exits.
2. Then tail `hourly.log`/`driver.log` and classify the digest/gate outcome.
3. Only after the active gate exits, inspect the Moodle/XML dirty slice and its untracked test to decide whether it is ready for a small factory commit/PR or should remain factory-owned.
4. If the digest/gate is stuck or exits red/revert/noop, record the blocker and keep automations paused.

### COV

Commands used:

- `git status -sb`
- `git diff --check`
- `ssh macmini date`
- `ssh macmini 'pgrep -fl "eval/gate.sh|uv run pytest -q --no-header|pytest -q --no-header|hourly-tick"'`
- `ssh macmini 'ps -o pid,ppid,etime,pcpu,pmem,stat,command -p 56669,70507,70509,70510,70511'`
- `ssh macmini 'ps -ax -o pid,ppid,etime,stat,pcpu,pmem,command | egrep "PID|56669|70506|70507|70509|70510|70511"'`
- `ssh macmini 'tail -120 "$HOME/lessonos/hourly.log"'`
- `ssh macmini 'tail -100 "$HOME/lessonos/driver.log"'`
- `ssh macmini 'git -C "$HOME/lessonos" status -sb'`
- `ssh macmini 'git -C "$HOME/lessonos" log --oneline -5'`
- `ssh macmini 'curl --max-time 3 -fsS http://127.0.0.1:8787/health'`
- `ssh macmini 'curl --max-time 3 -fsS http://localhost:3111/agentmemory/livez'`
- `ssh macmini 'pgrep -fl agentmemory'`
- `ssh macmini 'launchctl list | grep -i agentmemory'`

## Update 2026-07-01 14:58 CEST - Codex COV poll

Mode: read-only poll and operational status update. No production deploy, no launchd bootout/disable, no process kill, no gate edit, no manual full gate started.

### Status

Factory state: live but still degraded.

Verified facts:

- Mini reachable via `ssh macmini`; host time sampled as `Wed Jul 1 14:58:04 CEST 2026`.
- The previously open LessonOS tick `2026-07-01T10:54:33Z` is now classified in `hourly.log`: `pass (kept; gate verde (passed=4588; 951s))`, done at `2026-07-01T12:23:31Z`.
- The tick baseline line was `baseline passed=4577`; the kept gate reported `passed=4588`.
- A full gate is still active after that kept tick, under the same `hourly-tick.sh` process: `bash eval/gate.sh` PID `70509`, `uv run pytest -q --no-header` PID `70510`, pytest PID `70511`. At 14:58 CEST pytest had about 35 minutes elapsed and high CPU. Do not start another full gate while this is live.
- Latest sampled `~/lessonos` HEAD is `b2a8752 coord: AUTO-REPLENISH backlog (+2, strategist deepseek-v4-pro)`. The latest sampled log after the pass shows coordination/autoheal commits; no new product commit beyond the already known `6775f70 test(adversarial): inject re into isolated kimi harness` is claimed from this pass.
- Current `~/lessonos` worktree is dirty with in-flight Moodle/XML work: `.no-codex/.tmp/plugins`, `lessonos/api/app.py`, `lessonos/api/schemas.py`, `uv.lock`, plus untracked `.coord.lock`, sqlite shm/wal files, and `tests/test_api_unlocked_path_package_review_spaced_due_moodle.py`.
- Sampled dirty diff adds a ZERO-LLM Moodle XML spaced-due endpoint and schemas (`.../review/spaced/due/moodle`) built on the same spaced due quiz helper. Treat this as factory-owned in-flight work; Codex did not patch or commit it.
- Headroom remains healthy on `127.0.0.1:8787`, version `0.27.0`, with upstream Anthropic healthy.
- AgentMemory worsened since the prior COV: `curl --max-time 3 http://localhost:3111/agentmemory/livez` failed to connect. `lsof` shows PID `68734` listening on `127.0.0.1:3114`, command `agentmemory recall ...`; launchd main `com.elab.agentmemory` shows PID `69586` with status `-9`, and both observed AgentMemory node processes are hot/high-memory. No AgentMemory process was changed by this pass.

### Scheduler decision

- Keep Codex app automation paused.
- Keep Mini launchd jobs unchanged for now.
- `com.elab.lessonos-hourly` remains `KEEP-WATCH`, but the pause-candidate evidence is stronger because a post-pass full gate is still running under the hourly tick.
- Do not change Headroom/broker port ownership in this pass.
- Do not restart AgentMemory yet; write a backup/rollback maintenance packet first.

### Next action

1. Poll the active `eval/gate.sh` / pytest process until it exits.
2. Then tail `hourly.log` and classify the post-pass gate/digest outcome.
3. If the gate exits green and the Moodle/XML slice is still dirty, inspect the untracked test and decide whether the slice is ready for factory commit/PR or should remain factory-owned.
4. If the gate exits red/revert/noop, record the blocker and keep automations paused.

### COV

Commands used:

- `git status -sb`
- `git diff --check`
- `ssh macmini 'date; pgrep -fl "uv run pytest -q --no-header|pytest -q --no-header|hourly-tick|driver-orch" || true'`
- `ssh macmini 'cd ~/lessonos && tail -120 hourly.log && git status -sb && git log --oneline -5'`
- `ssh macmini 'curl --max-time 3 -fsS http://localhost:3111/agentmemory/livez || true'`
- `ssh macmini 'curl --max-time 3 -fsS http://127.0.0.1:8787/health || true'`
- `ssh macmini 'ps -o pid,ppid,lstart,etime,pcpu,pmem,command -p ...'`
- `ssh macmini 'cd ~/lessonos && git diff --stat && git diff --name-only'`
- `ssh macmini 'cd ~/lessonos && git diff -- lessonos/api/app.py lessonos/api/schemas.py tests/test_api_unlocked_path_package_review_spaced_due_moodle.py | sed -n "1,260p"'`
- `ssh macmini 'cd ~/lessonos && git log --oneline --decorate -12'`
- `ssh macmini 'ps aux | grep -i agentmemory | grep -v grep || true'`
- `ssh macmini 'launchctl list | grep -i agentmemory || true'`
- `ssh macmini 'lsof -nP -i :3111 -i :3114 2>/dev/null || true'`

## Update 2026-07-01 13:55 CEST - Codex operational pass

Mode: verification and inventory. No production deploy, no gate edit, no launchd disable, no scheduler deletion. One diagnostic process created by this session (`node ... agentmemory stats`, PID 68528) was killed after it failed to return and consumed high CPU; the main AgentMemory launchd service was not killed.

### Status

Factory state: live but degraded.

Verified facts:

- Mini reachable: `ssh macmini 'hostname; date; uptime; whoami; pwd'` returned `Mac.homenet.telecomitalia.it`, 2026-07-01 13:51 CEST, up 3 days 21:07, user `progettibelli`.
- LessonOS test harness fix is present and committed: `6775f70 test(adversarial): inject re into isolated kimi harness`.
- The specific `NameError: re is not defined` is fixed: `uv run pytest -q tests/test_adversarial_kimi.py -x --no-header` returned `2 passed in 0.05s`.
- Production imports `re`; test harness now imports and injects it: `bin/adversarial.py:11`, `_THINK_RE` at `bin/adversarial.py:174`, `tests/test_adversarial_kimi.py:5`, `tests/test_adversarial_kimi.py:31`.
- A full gate after the fix passed in the previous verified run: `{"passed":4577,"failed":0,"exit":0}`.
- Factory log later shows a kept pass after the commit: `gate verde (passed=4587; 728s)` for tick `2026-07-01T08:54:47Z`.
- Current tick `2026-07-01T10:54:33Z` is still in progress with `uv run pytest -q --no-header` under PID 67879/67880.
- Current LessonOS worktree is dirty with in-flight builder work: `lessonos/api/app.py`, `lessonos/api/schemas.py`, `uv.lock`, and untracked `tests/test_api_unlocked_path_package_review_spaced_due_moodle.py`.
- The user-requested old Anki spaced-due test path no longer exists in the current tree; tracked Anki tests are `test_anki_exporter.py`, `test_api_teacher_review_queue_anki.py`, `test_api_unlocked_path_package_review_anki.py`, `test_export_unlocked_path_anki.py`.
- The current Moodle spaced-due in-flight test exists and passes alone: `11 passed, 1 warning in 0.69s`.
- Headroom is healthy on `127.0.0.1:8787`, version `0.27.0`.
- Port/routing ambiguity remains: Headroom listens on `127.0.0.1:8787`; broker listens on `*:8787`.
- AgentMemory REST `/agentmemory/livez` returned `{"service":"agentmemory","status":"ok","viewerPort":3114,"viewerSkipped":false}` after the runaway diagnostic was killed.
- AgentMemory main process is alive but hot: PID 59334, high CPU, RSS grew from about 846 MB at 13:54 CEST to about 2.49 GB at 13:56 CEST in the sampled process check.
- AgentMemory endpoints `/agentmemory/stats` and `/agentmemory/status` returned 404; `/agentmemory/health` timed out in the sampled pass.
- AgentMemory remember attempt with a short verified payload timed out after 5 seconds; no memory save is claimed.
- GitHub: PR #6 remains draft and dirty-looking; PR #8 remains draft planning-only.
- Vercel CLI works read-only as user `andreamarro`; projects and deployments list returned data. No deploy was run.
- Codex app cron automation `ardesia-factory-audit-and-concrete-progress` is PAUSED in `/Users/andreamarro/.codex/automations/.../automation.toml`.

### Inferences

- The original gate red cause from `tests/test_adversarial_kimi.py` is closed.
- The factory is not healthy because active full-gate tests and AgentMemory CPU load overlap, and the live tick result after 10:54 CEST is not yet classified.
- The scheduler should not be deleted. `com.elab.lessonos-hourly` should be reviewed as a pause-candidate only if overlapping long pytest jobs continue.
- AgentMemory needs a maintenance pass, not blind restart: CLI `agentmemory stats` can hang and consume CPU.

### Current blockers / watch items

1. Current LessonOS tick still running: do not classify it until PID 67880 exits and `hourly.log` records pass/revert/noop.
2. AgentMemory high CPU and partial endpoint health: avoid bulk recall/import and avoid `agentmemory stats` until maintenance plan is written.
3. `8787` dual listener: Headroom and broker need a port ownership decision.
4. `~/lessonos` has in-flight dirty work; do not patch or commit there until the current builder tick finishes.

### Next action

Read `docs/ops/NEXT-SESSION-PROMPT.md`, then:

1. poll the current LessonOS tick;
2. update `SCHEDULED-PROCESSES-INVENTORY.md` if any launchd state changed;
3. decide whether `com.elab.lessonos-hourly` stays KEEP-WATCH or becomes PAUSE-CANDIDATE;
4. do not reactivate Codex app automation until current tick and AgentMemory are stable.

Audit window: 2026-07-01 03:50-10:24 CEST
Operator: Codex on Andrea MacBook, via `ssh macmini`
Mode: read-only diagnostics; no deploy, no gate edits, no destructive commands.
Last poll: Mini reachable; LessonOS tick `2026-07-01T07:22:50Z` still running its anti-flaky pytest rerun under PID `35632`, high CPU, started 2026-07-01 10:14 CEST.

## Errata 2026-07-01 10:18 CEST

Andrea corrected the quota model:

- A3 does not exist.
- A1 has no quota until Friday, 2026-07-03.
- Previous `quota.sh check A3 rc=0` observations were false positives. The script returns success when the quota marker file for an account suffix is absent; that proves only "no local quota-out marker", not "account exists" or "account is usable".
- Current operational routing should treat A2 as the only actionable Opus account until A1 quota is restored on 2026-07-03.

## Executive Status

The Mac mini factory is alive, reachable, and running the main services. It is not healthy enough to call it "productive" right now.

Current evidence:

- SSH/Tailscale access works: `ssh macmini`.
- Host observed: `Mac.homenet.telecomitalia.it`.
- macOS observed: 15.6 build 24G84, arm64.
- Tailscale mini node: `100.124.198.59 mac-mini-di-progettibelli`.
- Active repo selector: `~/.maestro_active_repo = both`.
- Main tick is running: `com.elab.lessonos-hourly`.
- A current `uv run pytest -q --no-header` is active under `~/lessonos` and consuming CPU. Latest observed process: PID `35632`, about 52 CPU-minutes accumulated at 10:24 CEST.
- Last completed builder attempts show Opus 4.8 account quota-out on A1/A2, fallback Hermes-DeepSeek, then `hermes -z: no final response was produced`.
- Corrected quota model: A1 unavailable until Friday 2026-07-03; A2 is the only actionable Opus account for now; A3 does not exist.
- AgentMemory is live but critical.
- Local MLX model serving is live on `127.0.0.1:8081`.

Latest 10:24 CEST diagnosis update:

- The LessonOS main tick `2026-07-01T07:22:50Z` / 09:22 CEST is not yet classified. Its log reached `gate exit=1 passed=4584>=4575 -> re-run anti-flaky`, and the anti-flaky pytest rerun is still active under PID `35632`.
- Concrete reproduced gate-red cause: `uv run pytest -q --lf -x --no-header` fails immediately in `tests/test_adversarial_kimi.py::test_thinking_disabled_and_temp_06` with `NameError: name 're' is not defined`.
- Mechanism: `tests/test_adversarial_kimi.py` extracts `bin/adversarial.py` from `def _kimi(` through the first `try:` after that block. Since commit `cbe961e` added MiniMax `_THINK_RE = re.compile(...)` before that `try:`, the extracted block now references `re`; the test injects `urllib`, `json`, `key`, `_AV_MODEL`, `_AV_MOONSHOT`, and `_AV_ENDPOINT`, but not `re`.
- Production `bin/adversarial.py` imports `re` at module top, so this evidence proves a broken test harness/extraction fixture, not a proven production Hermes runtime break.
- The current Anki pin work is not the isolated failing slice: `tests/test_api_unlocked_path_package_review_spaced_due_anki.py` passes alone (`9 passed`), and the full `review_spaced_due*` family passes (`43 passed`).
- Do not patch `~/lessonos` while the live tick has staged/untracked builder work: `lessonos/api/app.py`, `lessonos/api/schemas.py`, and `tests/test_api_unlocked_path_package_review_spaced_due_anki.py` are currently in-flight.

Latest 09:05 CEST update:

- Host time/uptime: 2026-07-01 09:01 CEST, up 3 days 16:16, load around 3.4.
- The first completed LessonOS main tick after the 07:28 CEST `REVERT` is now classified: tick `2026-07-01T05:52:04Z` / 07:52 CEST completed at 09:00 CEST as `blocked/noop`, not kept product work.
- Evidence: `gate exit=1 passed=4588>=4575`, anti-flaky rerun, `HEAD invariato`, `LAVORO ORFANO STASHATO`, and `[orch] done 2026-07-01T07:00:17Z`.
- Current 09:01 CEST process activity is post-run digest/gate, not a new kept product tick: `hourly-digest.sh` plus `uv run pytest -q --no-header` / pytest PID `25642`.
- `~/lessonos` latest commit remains `754ec1a` at 06:06 CEST, `coord: AUTO-REPLENISH backlog...`; still housekeeping, not product-task landing.
- `~/maestro-studio` latest observed product-side commits remain `cdab696` / `208e5c7` for `ReviewSpacedCalendarIcalTile` iCalendar download; no newer sampled studio commit in this pass.
- The earlier 09:01 CEST A1/A2/A3 quota check was over-interpreted. Corrected reading: A3 nonexistent; A1 unavailable until 2026-07-03; only A2 should be treated as actionable unless a fresh A2 check says quota-out.
- AgentMemory is connected but degraded: 1,637 sessions, 1,546,830 observations, 278 memories, graph 4,846 nodes / 11,680 edges, heap about 1,428 MB. `curl /livez` returned 404 in this pass, while `agentmemory status` worked; uptime was about 90 seconds, so a restart or recycle happened outside this run.
- Headroom is healthy on `127.0.0.1:8787`, version `0.27.0`; MLX is healthy on `127.0.0.1:8081` with `mlx-community/Qwen3.5-4B-MLX-4bit`; LiteLLM process remains live on `127.0.0.1:4000` but the unauthenticated health probe produced no useful body.
- Routing current-vs-target is unchanged: MiniMax-M3 is the implemented Hermes finder/audit backend via `ADVERSARIAL_BACKEND=minimax`; Codex/gpt-5.5 is configured through Headroom and has wrapper scripts, but `bin/build.sh` still explicitly warns that inferring `builder=codex gpt-5.5` is false.
- Latest Hermes quality evidence in the sampled log: `HERMES-2` report for studio commit `cdab696` had `CRITICI raw=0 substantive=0`. The latest no-final-response evidence remains the older 00:08Z/01:26Z fallback path, not this 07:52 CEST tick.

Latest 07:32 CEST update:

- Host time/uptime: 2026-07-01 07:31 CEST, up 3 days 14:46, load around 4.6.
- The previously open 06:01 CEST activity is now classified as non-product catchup/digest work: the post-reset tick completed at 05:51 CEST as `blocked/noop`, then catchup ran `skill-coach rc=0`, `retro-review rc=0`, AgentMemory incremental import OK, and digest wrote at 06:11 CEST. No kept LessonOS product commit is evidenced for that activity.
- The next main tick started at `2026-07-01T04:17:00Z` / 06:17 CEST and completed at 07:28 CEST as `REVERT`, not kept product work: `gate exit=1 passed=4585>=4575`, anti-flaky rerun, `gate rosso/regresso`, reset plus work stashed.
- Current process activity at 07:31 CEST is digest/gate, not a completed new product tick: `hourly-digest.sh` plus `uv run pytest -q --no-header` / pytest PID `11585`.
- `~/lessonos` latest commit is `754ec1a` at 06:06 CEST, `coord: AUTO-REPLENISH backlog...`; treat it as coordination/replenish housekeeping, not proof of landed product code.
- `~/maestro-studio` did land product-side work before this run: `cdab696` feature and `208e5c7` docs/status for `ReviewSpacedCalendarIcalTile` iCalendar download. This is studio lane progress, separate from LessonOS tick classification.
- A1, A2, and A3 quota checks all returned `rc=0` with empty body at 07:31 CEST. A1/A2 are available; A3 remains availability-by-check, not proven by observed builder use.
- AgentMemory is connected but degraded: 1,637 sessions, 1,546,830 observations, 277 memories, graph 4,846 nodes / 11,680 edges, heap about 1,473 MB, circuit closed.
- Headroom is healthy on `127.0.0.1:8787`, version `0.27.0`; MLX is healthy on `127.0.0.1:8081` with `mlx-community/Qwen3.5-4B-MLX-4bit`; LiteLLM process is live on `127.0.0.1:4000` but unauthenticated health probe returned no useful body.
- Routing evidence remains current-vs-target: MiniMax-M3 is implemented as `ADVERSARIAL_BACKEND=minimax` finder path in `bin/adversarial.py`; Codex/gpt-5.5 is configured via Headroom in `~/.codex/config.toml`, but `bin/build.sh` explicitly warns that inferring `builder=codex gpt-5.5` is false. Do not call Codex the active Hermes brain yet.

Latest 06:02 CEST update:

- Host time/uptime: 2026-07-01 06:01 CEST, up 3 days 13:16, load around 5.1.
- First completed main tick after the A1/A2 quota reset window is classified as `blocked/noop`, not a kept product commit: tick `2026-07-01T02:43:10Z` / 04:43 CEST finished at 05:51 CEST with `HEAD invariato`, gate exit `1`, `passed=4585>=4575`, and orphaned work stashed.
- That tick did not show the earlier A1/A2 quota-out failure path, so Opus was no longer blocked by quota, but it still did not keep a useful build.
- Post-tick autoheal/catchup did make coordination/coach commits in `~/lessonos`: `77ae52b` autoheal pin exhausted, `3f0dc08` promoted next pin, and `2faac9f` skill-coach at 05:53 CEST. Treat these as factory housekeeping/coach progress, not proof that the main pinned product task landed.
- A1, A2, and A3 quota checks all returned `rc=0` with empty body at 06:01 CEST. Operational reading: available, though A3 still has no proven builder use in the observed log window.
- A current pytest/gate process is active: PID `95123`, started 05:54 CEST, consuming high CPU. Do not classify the next tick until it exits.
- AgentMemory status remains `critical`: 1,637 sessions, 1,546,830 observations, 276 memories, graph 4,846 nodes / 11,680 edges, heap about 1,649 MB, circuit closed.
- Headroom is healthy on `127.0.0.1:8787`, version `0.27.0`; MLX is healthy on `127.0.0.1:8081` with `mlx-community/Qwen3.5-4B-MLX-4bit`.
- Launchd still lists the main factory surfaces: `com.elab.lessonos-hourly`, `com.elab.agentmemory`, `com.ardesia.litellm`, `com.headroom.proxy`, `com.ardesia.api`, `com.ardesia.tutor`, `com.ardesia.nanobot`, and support jobs.

Latest 04:31 CEST update:

- Host time/uptime: 2026-07-01 04:31 CEST, up 3 days 11:46, load around 4.7. Final quota/process poll: 04:34 CEST.
- Launchd observed: `com.elab.agentmemory`, `com.ardesia.litellm`, `com.headroom.proxy`, `com.maestro.tg-bridge`, `com.ardesia.api`, `com.ardesia.tutor`, `com.ardesia.nanobot` running/listed. No restart attempted.
- Headroom health: healthy, version `0.27.0`.
- MLX health: healthy, model `mlx-community/Qwen3.5-4B-MLX-4bit`.
- LiteLLM process is running on `127.0.0.1:4000`, but unauthenticated `/health` and `/v1/models` probes returned no useful body in this pass.
- GitHub read-only check: `AndreaMarro/ardesia` still has draft PR #8 (`demo/vertical-slice`) and draft PR #6 (`codex/add-codex-minimax-worker`); `AndreaMarro/ardesia-lavagna` still has open PR #1.
- Vercel CLI auth is active as `andreamarro`; project listing returned no body in this pass, while direct HTTP probes still returned 200 for `ardesia-lavagna` and `ardesia-api-vercel/health`.

## Launchd Jobs Observed

Relevant running/listed jobs included:

| Job | Observed state | Meaning |
|---|---:|---|
| `com.elab.lessonos-hourly` | running | Main LessonOS/Ardesia factory tick |
| `com.elab.agentmemory` | running | AgentMemory node service |
| `com.ardesia.litellm` | running | LiteLLM gateway on localhost |
| `com.headroom.proxy` | running | Headroom proxy |
| `com.maestro.tg-bridge` | running | Telegram bridge |
| `com.ardesia.api` | running | LessonOS/FastAPI surface |
| `com.ardesia.tutor` | running | Local MLX/VLM tutor model surface |
| `com.ardesia.nanobot` | running | Nanobot service |
| `com.maestro.stall-watchdog` | listed | Stall/deadman monitoring |

Some launchd entries show exit status `1` or `-`. Those are not automatically bugs, but they need a separate launchd health pass before being trusted.

## Processes And Ports

| Surface | Port | Evidence | Status |
|---|---:|---|---|
| AgentMemory REST/engine | `127.0.0.1:3111` | livez OK | Live, degraded |
| AgentMemory viewer | `127.0.0.1:3113` | listed by status | Live |
| iii engine | `127.0.0.1:3111/3112`, `*:49134` | process/lsof | Live |
| LessonOS API | `*:8200` | uvicorn process | Live |
| LiteLLM | `127.0.0.1:4000` | process/lsof | Live |
| Headroom proxy | `127.0.0.1:8787` | process/lsof | Live |
| Broker app | `*:8787` | uvicorn process | Risk: port ambiguity |
| MLX-VLM server | `127.0.0.1:8081` | `/health` OK | Live |
| Chroma MCP | local processes | uvx/chroma-mcp | Live |

Risk: two processes are bound around port `8787`: Headroom on localhost and a broker on wildcard. Local probes hit Headroom, but the dual listener is a routing ambiguity and should be resolved/documented.

## Current Tick

Observed active process chain:

- `/bin/bash /Users/progettibelli/lessonos/bin/hourly-tick.sh`
- `uv run pytest -q --no-header`
- `pytest -q --no-header`, high CPU. Final 06:01 CEST poll showed PID `95123`, started 05:54 CEST, about 33 CPU-minutes accumulated.

Last visible completed log segment:

- Builder: `claude-opus-4-8 ultracode`.
- The 04:43 CEST tick completed at 05:51 CEST as `blocked/noop`, with `HEAD invariato`, gate exit `1`, and `passed=4585>=4575`.
- No A1/A2 quota-out message appeared in that tick segment.
- Autoheal then marked the lessonos pin exhausted and promoted the next ROADMAP-AUTO task.
- Catchup ran after quota reopened: skill-coach `rc=0`, retro-review `rc=0`, AgentMemory incremental import OK, strategos launched async.

09:05 conclusion: the factory loop is not dead and quota is currently open, but three post-reset LessonOS main outcomes in this audit trail are still not useful product landings: `blocked/noop`, `REVERT`, then `blocked/noop`. The later digest/gate pytest process is still running and should not be mistaken for a kept product commit.

## Repos On Mini

| Local repo | Branch | Last observed commit | Dirty state |
|---|---|---|---|
| `~/lessonos` | `auto/main` | `754ec1a` 2026-07-01 06:06 CEST, `coord: AUTO-REPLENISH backlog...` | dirty: `.no-codex/.tmp/plugins`, `uv.lock`, db shm/wal files |
| `~/maestro-studio` | `auto/main` | `208e5c7` 2026-07-01 06:21 CEST, docs/status for iCalendar tile | no dirty output in sampled status |
| `~/maestro-tools` | `main` | `5a22842` 2026-06-18 | dirty and many untracked orchestration files |
| `~/ardesia` | `session/long-2026-06-25` | `b6de5673` 2026-06-25 | not inspected deeply in this pass |
| `~/ardesia-monorepo` | `main` | `83b2852` 2026-06-17 | not inspected deeply in this pass |

Do not auto-clean any of these. `maestro-tools` needs a dedicated preservation pass because it contains live orchestration files.

## Model Status

| Model/system | Verified status | Scientific conclusion |
|---|---|---|
| Opus 4.8 / Claude Code | Configured as main builder; latest logs show A1/A2 quota-out; Andrea confirms A1 unavailable until 2026-07-03 | Works historically/configurationally, but current actionable Opus lane is A2 only |
| A3 account | Andrea correction plus `quota.sh` behavior inspection | A3 does not exist; prior `rc=0` checks were false positives |
| Hermes | Configured fallback/adversarial system; latest no-final-response remains the 00:08Z/01:26Z quota fallback path; latest completed tick was Opus/gate revert, not Hermes no-final-response | Finder lane exists; fallback quality still degraded by last no-final-response evidence |
| MiniMax-M3 | Code/config shows default adversarial finder backend is `minimax` | Yes: M3 is a Hermes finder/audit brain in current design |
| Codex/OpenAI | Mini Codex config uses `gpt-5.5` via Headroom; `bin/build.sh` warns `builder=codex gpt-5.5` inference is false | Configured and available; not proven to be the production Hermes brain |
| Headroom | Proxy running on `127.0.0.1:8787`; Codex/Claude config routes through it | Live, but port ambiguity must be cleaned |
| LiteLLM | Process and port live | Gateway live; latest model-list probe returned no useful body, config pass still needed |
| Local MLX | `/health` OK, loaded `mlx-community/Qwen3.5-4B-MLX-4bit` | Real local model surface is live |

Answer to the specific "M3 and Codex are the brain of Hermes?" question:

- MiniMax-M3: yes, for the Hermes adversarial/finder lane according to `adversarial.sh`/`adversarial.py`.
- Codex: no evidence that Codex is currently the active Hermes brain in the live factory loop. It is configured through Headroom and is proposed/usable for high-headroom review/driver work, but current loop evidence still shows Opus builder + Hermes fallback/finder lanes.

## AgentMemory Status

AgentMemory is live but degraded.

Observed:

- `agentmemory status`: connected.
- Version: `v0.9.26`.
- Sessions: `1637`.
- Observations: `1,546,830`.
- Memories: `277`.
- Graph: `4,846 nodes`, `11,680 edges`.
- Heap: about `1473 MB` during latest status.
- Storage: `~/.agentmemory` about `221M`; `~/.claude-mem` about `822M`; Chroma about `129M`.
- Flags enabled: graph extraction, consolidation, auto-compress, inject-context.
- Circuit: closed.

Conclusion: use it as recall/cache, not source of truth. Because status is critical/degraded, reduce payloads and save short facts only. Do not bulk import or restart without an explicit maintenance decision.

## Local Models

Verified MLX server:

- Process: `python -m mlx_vlm.server --model mlx-community/Qwen3.5-4B-MLX-4bit --host 127.0.0.1 --port 8081 --vision-cache-size 4`.
- `/health`: healthy.
- Loaded model: `mlx-community/Qwen3.5-4B-MLX-4bit`.
- Context reported: `262144`.
- `/v1/models` listed local MLX candidates including Qwen and Gemma variants.
- Hugging Face cache: about `45G`.
- Ollama was not available in the latest probe.

## Immediate Risks

1. Quota is open, but two post-reset LessonOS main outcomes were still not useful: one `blocked/noop`, then one `REVERT`.
2. Hermes fallback recently returned no final response; latest tick did not exercise that path, so quality is not newly improved.
3. AgentMemory is degraded under high heap.
4. Port `8787` has a routing ambiguity.
5. `~/maestro-tools` is dirty and contains important untracked factory files.
6. `DIGEST-latest.md` has shown stale/contradictory information in prior checks; logs/processes/git are more reliable.
7. Current tick/test activity was still running; final kept/revert/noop result was not observed in this audit window.

## Recommended Next Action

Freeze observation, do not restart services yet. Wait for the current digest/gate pytest to finish and capture the next main tick result:

1. `tail -200 ~/lessonos/hourly.log`.
2. `tail -200 ~/lessonos/driver.log`.
3. `git -C ~/lessonos status --short`.
4. `cd ~/lessonos && bash bin/quota.sh check A2`.
5. AgentMemory health.

Only after one more completed tick should we decide whether to prepare a bounded Codex/gpt-5.5 pilot packet or adjust routing. Do not restart AgentMemory or change services without explicit maintenance approval.

## COV

- Sources: `ssh macmini`, `launchctl`, `ps`, `curl`, `agentmemory status`, `git status/log`, `hourly.log`, `driver.log`, MLX endpoints, `gh pr list`, Vercel CLI auth, direct Vercel HTTP probes.
- No production deploy.
- No gate changes.
- No repo cleanup.
- No secrets printed intentionally; env contents were not read except a failed redaction attempt that printed no env values.
