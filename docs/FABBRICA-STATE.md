# FABBRICA-STATE — Autonomous Factory (Mac mini loop)

**Date:** 2026-06-26 · **Host:** Mac mini (`Mac.homenet.telecomitalia.it`, user `progettibelli`, up 8d) · **Scope:** read-only state snapshot.

> **TL;DR — the factory is QUIESCED.** A `STOP` sentinel is present (`supervisor: grind (3 non-pass) 2026-06-26T12:52:23Z`), so the driver loop is halted. The served binary is healthy at `git_sha=98ac0f4` (== local & GitHub `auto/main`, no lineage trap), auth-strict armed (junk Bearer → 401), gate green (`passed=3760, failed=0, exit=0`), AgentMemory:3111 reachable (localhost-only), vault SoT synced (Syncthing + GitHub remote). Dead-man's-switch is alive.

---

## 1. State at a glance

| Component | State (2026-06-26) | Evidence |
|---|---|---|
| **STOP sentinel** | PRESENT — loop halted | `~/lessonos/STOP` = `supervisor: grind (3 non-pass) 2026-06-26T12:52:23Z` |
| **Driver loop** (`driver-orch.sh`) | quiesced (honors STOP, breaks before any builder) | `driver-orch.sh:18` `[ -f STOP ] && break` |
| **Served API** :8200 | UP, `git_sha=98ac0f4`, corpus.segments=1224 | `curl /health` |
| **Auth-strict** | ARMED — junk Bearer → `401` | `curl -H "Authorization: Bearer junk…" /v1/saved-lessons` → 401 |
| **Gate (CI/ratchet)** | GREEN `passed=3760 failed=0 exit=0` | `bash eval/gate.sh` @ HEAD 98ac0f4 |
| **served-SHA gate** | armed flag-gated (`SERVED_SHA_GATE`), served==HEAD | `bin/served_sha_gate.sh` |
| **Lineage** | local `auto/main`=98ac0f4 == GitHub `auto/main`=98ac0f4 == served | `gh api …/refs/heads/auto/main` |
| **AgentMemory** :3111 | UP, localhost-only, recall via `/agentmemory/memories` | `lsof -iTCP:3111`; `curl /agentmemory/memories` |
| **Dead-man's-switch** | ALIVE — `deadman ok (liveness age=100s)` @ 14:41Z | `~/maestro-logs/deadman.log` |
| **Vault SoT** | synced — Syncthing running + GitHub remote (HEAD f0145f6) | `pgrep syncthing`; `git -C ~/ardesia-vault remote -v` |
| **Opus spend (proxy)** | build-iters=0 today (loop stopped) | `opus-meter.sh` |

---

## 2. Driver loop (`claude -p` builder)

`~/lessonos/driver-orch.sh` (HEAD-frozen evaluator authority; "ratchet Karpathy"). One iteration = **ORIENT → PLAN → PLAN-CHECK (fable) → BUILD → REVIEW → pytest VERDE → COMMIT → push `auto/main`**.

Key mechanics:
- **STOP check first** every iter: `driver-orch.sh:18` `[ -f STOP ] && { echo "[orch] STOP — halt."; break; }` — with STOP present the loop never reaches a builder.
- **Clean baseline** each iter: `git reset --hard HEAD; git clean -fd` (`:19`); work journaled OUTSIDE repo (`~/maestro-logs/RESEARCH-lessonos.md`).
- **Builder default = `claude-opus-4-8` ultracode** (not Hermes/DeepSeek). DeepSeek only for `[GRIND]`/`[DEEPSEEK]`/`[HERMES]` pins or rate-limit fallback (`:55–73`). `claude -p` auths from per-account `.credentials.json` via `acct.sh pick`.
- **Daily cap** `CAP_MAX=${LESSONOS_DAILY_CAP:-12}` (`:13`).
- **Keep/revert** (`:106–135`): keep only if `exit==0 AND passed>=baseline`; else reset + stash. On keep: `git push origin HEAD:auto/main`.
- **PIN-DONE** only on real delta; served-SHA-gated when `SERVED_SHA_GATE=1`.

Last iterations (`RESEARCH-lessonos.md`, 2026-06-24) show normal pass/revert cadence (3674→3745 green run); none since STOP.

---

## 3. ardesia-tools daemons (`~/maestro-tools`, repo `github.com/AndreaMarro/ardesia-tools`, HEAD 5a22842)

launchd-scheduled; confirmed loaded via `launchctl list`:

| launchd label | Script | Schedule | Role | STOP-aware |
|---|---|---|---|---|
| `com.maestro.strategos` | `strategos.sh` | 06:30/14:30/22:30 | **STRATEGOS** — fable-5 chief-engineer; *proposes* pins, does NOT decide (Claude ratifies) | proposes only |
| `com.ardesia.deadman` | `deadman.sh` | 600s, RunAtLoad | **dead-man's-switch** — proof-of-work monitor INDEPENDENT of loop (liveness/durability/productivity) | yes (suppresses productivity alert) |
| `com.ardesia.pr-preparer` | `pr-preparer.sh` | 3600s (throttle 21600s) | **PR-preparer** (`PRPREP_ENABLED=1`) | — |
| `com.ardesia.budget-guard` | `litellm/budget-guard.sh` | 1800s, RunAtLoad | **budget-guard** — cost ceiling | — |
| `com.ardesia.curate` | curate_roadmap | ~1200s | roadmap value-gate | yes |
| `com.ardesia.replenish` | `replenish.sh` | — | backlog replenish (`:12` skips under STOP) | yes |
| `com.ardesia.audit`/`audit-adv` | `ardesia-audit.sh` | — | self-audit (`:10` skips under STOP) | yes |
| `com.ardesia.api` | uvicorn (PID 13313) | KeepAlive | **served API** :8200 | n/a |
| `com.ardesia.litellm` | litellm (PID 66963) | KeepAlive | LLM proxy | n/a |
| `com.maestro.tg-bridge` | `tg-bridge.py` (PID 1139) | KeepAlive | Telegram supervisor; can write/clear STOP | writes STOP |

**STOP writers:** Telegram bridge (`tg-bridge.py:495` `stop di Andrea`) or supervisor grind-guard (current STOP = `grind (3 non-pass)`, halts after 3 non-pass iters). Resume = `rm -f ~/lessonos/STOP` / Telegram `riprendi`.

---

## 4. Gates (CI / served-SHA / ratchet)

1. **CI / ratchet** — `eval/gate.sh` is the **FROZEN** evaluator. Runs `uv run pytest -q`, emits `{"passed":N,"failed":N,"exit":code}`. Green = `exit==0 AND passed>=1 AND passed not-regressed` (monotonic floor = previous passed). **Current:** `{"passed":3760,"failed":0,"exit":0}` @ 98ac0f4 (live run).
2. **served-SHA done-gate** — `bin/served_sha_gate.sh` (ZERO-LLM, fail-CLOSED). Exit 0 only when `/health git_sha` == HEAD; blocks PIN-DONE on stale served. Driver `:150–157`, flag `SERVED_SHA_GATE`. **Current:** served 98ac0f4 == HEAD → passes.
3. **Durability** (deadman) — alerts if local `auto/main` ahead of `github/auto/main`. **Current:** both 98ac0f4 → in sync.

---

## 5. STOP active (quiesced)

`~/lessonos/STOP = supervisor: grind (3 non-pass) 2026-06-26T12:52:23Z`. Every loop entrypoint short-circuits (`driver-orch.sh`, `driver-studio.sh`, `driver.sh`, `replenish.sh`, `ardesia-audit.sh`, `hourly-tick.sh` digest-only). Serving stack (api/litellm/AgentMemory/tg-bridge) is STOP-independent and keeps running. Halt = cost-protection (3 non-pass), not a crash. **Resume:** `rm -f ~/lessonos/STOP`.

---

## 6. Served binary (98ac0f4)

`{"status":"ok","version":"0.1.0","corpus":{"name":"served","segments":1224},"git_sha":"98ac0f4"}`. `git_sha` is frozen-at-import (matches HEAD → fresh). Binds `*:8200` (tailnet, auth-gated); junk Bearer → 401. Lineage clean: served == local == GitHub auto/main.

---

## 7. AgentMemory :3111

`iii` (PID 49315) binds `127.0.0.1:3111` only (localhost — not tailnet-exposed). Recall under `/agentmemory/*`; `/agentmemory/memories` returns real records (e.g. served-SHA staleness-closed note). Bare POST `/agentmemory/recall` returned empty this probe; recall read via `/agentmemory/memories`. Builders `recall` before re-diagnosing (driver TRIG/BUILD_PROMPT).

---

## 8. Vault SoT (Syncthing)

`~/ardesia-vault` = Source of Truth (Obsidian). Syncthing running (PIDs 1145/1243) for MacBook↔Mac-mini replication; GitHub remote `ardesia-vault.git` (HEAD f0145f6) for durable backup. ⚠️ MacBook: never `git add -A` blindly (Syncthing-synced).

---

## 9. Health summary

| Check | Result |
|---|---|
| Loop running? | **No — STOP active** |
| Serving healthy? | Yes (98ac0f4, 1224 seg, auth 401) |
| Lineage trap? | No (served==local==GitHub) |
| Gate green? | Yes (3760/0/0) |
| Dead-man alive? | Yes (14:41Z) |
| Mirror in sync? | Yes |
| Memory reachable? | Yes (:3111 localhost) |
| Vault synced? | Yes |

**Resume:** `ssh macmini 'rm -f ~/lessonos/STOP'` (or Telegram `riprendi`).