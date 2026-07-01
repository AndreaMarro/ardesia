# SCHEDULED-PROCESSES-INVENTORY

## Update 2026-07-02 01:40 CEST

Mode: inventory/update only. No job deleted, disabled, booted out, restarted, or re-enabled.

### Current Scheduler Decision

- Keep Codex app automation paused. Verified local file: `/Users/andreamarro/.codex/automations/ardesia-factory-audit-and-concrete-progress/automation.toml` has `status = "PAUSED"`.
- Keep Mini factory launchd state unchanged. The sampled filtered `launchctl list` did not show `com.elab.lessonos-hourly`; do not recreate or re-enable it without Andrea's explicit OK.
- Treat the LessonOS `--lf` run from this session as manual COV, not a scheduler-owned tick: PID `31601`, command `pytest -q --lf -x --no-header`, started 01:20 CEST and exited green with `4587 passed, 4 skipped`.
- Keep AgentMemory as a degraded cache only. REST liveness timed out and the process was hot/high-memory. Do not run broad recall, stats, compaction, restart, or import without a maintenance packet and explicit operator decision.
- Keep Headroom running. It is healthy on `127.0.0.1:8787`, but the `com.broker` wildcard listener on port `8787` remains a port-ownership ambiguity.

### Sampled Mini Jobs

Filtered `launchctl list` at 2026-07-02 01:27 CEST:

| ID/job | Sampled state | Decision |
|---|---|---|
| `com.elab.lessonos-hourly` | not present in filtered list | KEEP PAUSED / do not re-enable |
| `com.elab.agentmemory` | listed with PID `31324`, status `-9`; process hot/high-memory | KEEP-WATCH, maintenance needed |
| `com.elab.agentmemory-consolidate` | listed, no PID | KEEP-WATCH |
| `com.elab.agentmemory-mini-capture` | listed, no PID | KEEP-WATCH |
| `com.elab.agentmemory-restart` | listed, no PID | PAUSE-CANDIDATE after review |
| `com.headroom.proxy` | running PID `35007` | KEEP |
| `com.broker` | running PID `1007` | KEEP-WATCH; resolve port plan later |
| `com.ardesia.api` | listed PID `5249` | KEEP |
| `com.ardesia.litellm` | running PID `71965` | KEEP |
| `com.ardesia.tutor` | listed PID `59690`, status `-9` | KEEP-WATCH |
| `com.ardesia.nanobot` | running PID `1014` | KEEP-WATCH |
| `com.elab.ardesia-ipad` | running PID `999` | KEEP |
| `com.maestro.tg-bridge` | listed PID `31261` | KEEP |

### Updated Stop Rules

- Do not resume Codex app automation until AgentMemory has a bounded health story.
- Do not start another LessonOS full gate unless a new code change actually requires it; the manual `--lf` check already exited green.
- Do not patch `~/lessonos` while its worktree contains factory-owned dirty app/schema/lock/test files unless the patch is a dedicated gate unblock with ownership recorded.
- Do not deploy Vercel from scheduler automation; preview deploy requires Andrea's explicit OK.

### COV

- Local automation TOML read confirmed `status = "PAUSED"`.
- `ssh macmini launchctl list | grep -iE ...`
- `ssh macmini ps aux | grep -iE ...`
- Headroom health curl returned healthy.
- AgentMemory liveness curl timed out.

Date: 2026-07-01 13:55 CEST
Mode: inventory only. No job deleted, disabled, booted out, or restarted.

## Summary

The Mini has many launchd jobs. The main risk is not a single malicious job; it is overlapping automation: `com.elab.lessonos-hourly` launches every 300 seconds while full pytest/gate can run much longer, and AgentMemory can consume high CPU. The correct action is not deletion. The correct next step is a controlled pause/backup plan if overlap repeats.

## Codex App Automation

| ID/job | Type | File | Frequency | Command | Status | Owner | Risk | Action |
|---|---|---|---|---|---|---|---|---|
| ardesia-factory-audit-and-concrete-progress | Codex cron | `/Users/andreamarro/.codex/automations/ardesia-factory-audit-and-concrete-progress/automation.toml` | 90 min | Codex ARDESIA audit/progress prompt | PAUSED | Andrea/Codex | Low while paused | KEEP PAUSED |

## Mini Launchd Jobs

| ID/job | Type | File | Frequency | Command | Status | Owner | Risk | Action |
|---|---|---|---|---|---|---|---|---|
| com.elab.lessonos-hourly | launchd | `~/Library/LaunchAgents/com.elab.lessonos-hourly.plist` | StartInterval 300s, RunAtLoad | `~/lessonos/bin/hourly-tick.sh` | running | factory | High: can overlap long pytest/gate; current tick active | KEEP-WATCH; PAUSE-CANDIDATE if overlap persists |
| com.ardesia.api | launchd | `~/Library/LaunchAgents/com.ardesia.api.plist` | RunAtLoad, KeepAlive | uvicorn `lessonos.api.app:app` port 8200 | running | product/api | Medium: user-facing local API | KEEP |
| com.elab.agentmemory | launchd | `~/Library/LaunchAgents/com.elab.agentmemory.plist` | RunAtLoad, KeepAlive | `agentmemory-run.sh` | running | memory | High CPU; partial endpoint health | KEEP-WATCH; maintenance needed |
| com.elab.agentmemory-consolidate | launchd | `~/Library/LaunchAgents/com.elab.agentmemory-consolidate.plist` | 3600s, RunAtLoad | `agentmemory-consolidate.sh` | listed | memory | Could worsen high heap/CPU | UNKNOWN; review before changing |
| com.elab.agentmemory-mini-capture | launchd | `~/Library/LaunchAgents/com.elab.agentmemory-mini-capture.plist` | 10800s | `am-mini-capture.sh` | listed | memory | Unknown payload | UNKNOWN |
| com.elab.agentmemory-restart | launchd | `~/Library/LaunchAgents/com.elab.agentmemory-restart.plist` | 7200s | `am-restart.sh` | listed | memory | Restart policy may hide root cause | PAUSE-CANDIDATE after backup/review |
| com.headroom.proxy | launchd | `~/Library/LaunchAgents/com.headroom.proxy.plist` | RunAtLoad, KeepAlive | `headroom proxy --port 8787` | running | model routing | Port conflict with broker | KEEP-WATCH |
| com.headroom.shaper-guard | launchd | `~/Library/LaunchAgents/com.headroom.shaper-guard.plist` | 1200s, RunAtLoad | `headroom-shaper-guard.sh` | listed | model routing | Unknown guard effects | KEEP-WATCH |
| com.broker | launchd | `~/Library/LaunchAgents/com.broker.plist` | RunAtLoad, KeepAlive | uvicorn broker on `0.0.0.0:8787` | running | broker | Conflicts conceptually with Headroom port | PAUSE-CANDIDATE only after port plan |
| com.mini-worker / b / c | launchd | `~/Library/LaunchAgents/com.mini-worker*.plist` | RunAtLoad, KeepAlive | broker mini workers | running/listed | broker | Duplicated workers may amplify load | UNKNOWN; inventory only |
| com.ardesia.litellm | launchd | `~/Library/LaunchAgents/com.ardesia.litellm.plist` | RunAtLoad, KeepAlive | LiteLLM proxy 4000 | running | model routing | Medium; required fallback | KEEP |
| com.ardesia.tutor | launchd | `~/Library/LaunchAgents/com.ardesia.tutor.plist` | RunAtLoad, KeepAlive | MLX VLM server 8081 | running | local model | Medium resource use | KEEP |
| com.ardesia.nanobot | launchd | `~/Library/LaunchAgents/com.ardesia.nanobot.plist` | RunAtLoad, KeepAlive | uvicorn nanobot 8090 | running | local service | Unknown current value | KEEP-WATCH |
| com.maestro.tg-bridge | launchd | `~/Library/LaunchAgents/com.maestro.tg-bridge.plist` | RunAtLoad, KeepAlive | `tg-bridge.py` | running | notification | Low/medium | KEEP |
| com.maestro.stall-watchdog | launchd | `~/Library/LaunchAgents/com.maestro.stall-watchdog.plist` | 300s, RunAtLoad | `stall-watchdog.sh` | listed | factory safety | Could interact with long tests | KEEP-WATCH |
| com.maestro.strategos | launchd | `~/Library/LaunchAgents/com.maestro.strategos.plist` | 06:30, 14:30, 22:30 | `strategos.sh` | listed exit 1 | strategy | Non-critical, may add work | UNKNOWN |
| com.ardesia.audit / audit-adv | launchd | `~/Library/LaunchAgents/com.ardesia.audit*.plist` | daily/twice daily | `ardesia-audit.sh` | listed | audit | May add load | KEEP-WATCH |
| com.ardesia.replenish | launchd | `~/Library/LaunchAgents/com.ardesia.replenish.plist` | 1800s | `replenish.sh` | listed | backlog | Can feed more work into loop | KEEP-WATCH |
| com.ardesia.curate | launchd | `~/Library/LaunchAgents/com.ardesia.curate.plist` | 1200s, RunAtLoad | `curate_roadmap.py --apply` | listed | backlog | Mutating roadmap automatically | KEEP-WATCH |
| com.ardesia.pr-preparer | launchd | `~/Library/LaunchAgents/com.ardesia.pr-preparer.plist` | 3600s | `pr-preparer.sh` | listed | PR automation | Could touch GitHub/worktrees | UNKNOWN |
| com.ardesia.deadman | launchd | `~/Library/LaunchAgents/com.ardesia.deadman.plist` | 600s, RunAtLoad | `deadman.sh` | listed | safety | Unknown side effects | KEEP-WATCH |
| com.ardesia.budget-guard | launchd | `~/Library/LaunchAgents/com.ardesia.budget-guard.plist` | 1800s, RunAtLoad | LiteLLM budget guard | listed | cost safety | Likely useful | KEEP |
| com.elab.skill-coach | launchd | `~/Library/LaunchAgents/com.elab.skill-coach.plist` | 28800s | touch `.fable_catchup_pending` | listed | factory learning | Adds catchup work | KEEP-WATCH |
| com.elab.ardesia-ipad | launchd | `~/Library/LaunchAgents/com.elab.ardesia-ipad.plist` | RunAtLoad, KeepAlive | Python http server 8190 | running | demo/local | Low | KEEP |
| com.ardesia.wiki-sync | launchd | `~/Library/LaunchAgents/com.ardesia.wiki-sync.plist` | 21600s | `wiki-sync.sh` | listed | docs/wiki | Unknown | KEEP-WATCH |
| com.elab.mac-mini-autonomous-loop | launchd plist | `~/Library/LaunchAgents/com.elab.mac-mini-autonomous-loop.plist` plus disabled backup | RunAtLoad, KeepAlive | old ELAB autonomous loop | not in filtered launchctl list | legacy | DELETE-CANDIDATE only after backup/review |

## Other schedulers

- `crontab -l` contains only commented legacy curriculum references in this pass.
- `atq` returned no jobs.
- `pmset -g sched` returned no scheduled wake/power events.
- `brew services list`: `postgresql@16` and `syncthing` started; `cloudflared`, `tailscale`, `unbound` none.

## Proposed reversible disable plan, not executed

Decision candidate:

- job: `com.elab.lessonos-hourly`
- motive: overlapping full pytest/gate jobs, high load, current in-flight dirty builder work.
- evidence: active `hourly-tick.sh`, two `driver-orch.sh` chains, active `pytest -q --no-header`; launchd StartInterval is 300s.
- backup command: `cp ~/Library/LaunchAgents/com.elab.lessonos-hourly.plist ~/Library/LaunchAgents/com.elab.lessonos-hourly.plist.bak-$(date +%Y%m%d-%H%M%S)`
- disable command: `launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.elab.lessonos-hourly.plist`
- rollback command: `launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.elab.lessonos-hourly.plist`

Not executed in this session.

## COV

Commands used:

- `launchctl list | grep -iE ...`
- `ls -la ~/Library/LaunchAgents`
- plist parsing via Python `plistlib` for relevant jobs only.
- `crontab -l`, `atq`, `pmset -g sched`, `brew services list`.
- local Codex automation file inspection under `/Users/andreamarro/.codex/automations`.

No job was deleted, disabled, or restarted.
