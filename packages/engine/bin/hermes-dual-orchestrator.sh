#!/usr/bin/env bash
# ARDESIA — dual Hermes resource orchestrator.
# Goal: use two subscriptions/resources intelligently without blending secrets:
#   H1 = Hermes-Codex/OpenAI lane: invokes Codex with gpt-5.5 + medium reasoning.
#   H2 = Hermes-MiniMax lane: native Hermes Agent configured with MiniMax-M3.
# This script is conservative: it routes, logs, and can fan out reviews; it does
# not modify the existing autonomous factory drivers by itself.
set -euo pipefail

ACTION="${1:-route}"
if [ "$#" -gt 0 ]; then shift || true; fi
TASK="${1:-}"
REPO="${2:-${ARDESIA_DUAL_REPO:-$PWD}}"

ROOT="${ARDESIA_ENGINE_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
CODEX_WORKER="${ARDESIA_CODEX_WORKER:-$ROOT/bin/codex-openai-worker.sh}"
LOG_DIR="${ARDESIA_DUAL_LOG_DIR:-$HOME/maestro-logs/hermes-dual}"
LOCK_DIR="${ARDESIA_DUAL_LOCK_DIR:-$HOME/.maestro-locks/hermes-dual}"
MINIMAX_LOG_DIR="${ARDESIA_MINIMAX_LOG_DIR:-$HOME/maestro-logs/hermes-minimax}"
MINIMAX_TIMEOUT="${ARDESIA_MINIMAX_TIMEOUT:-4800}"
CODEX_TIMEOUT="${ARDESIA_CODEX_TIMEOUT:-4800}"
CODEX_POST_REVIEW="${ARDESIA_CODEX_POST_REVIEW:-1}"
MINIMAX_POST_REVIEW="${ARDESIA_MINIMAX_POST_REVIEW:-1}"

usage() {
  cat <<'USAGE'
Usage:
  bash packages/engine/bin/hermes-dual-orchestrator.sh route "task..." [repo]
  bash packages/engine/bin/hermes-dual-orchestrator.sh fanout-review "task..." [repo]
  bash packages/engine/bin/hermes-dual-orchestrator.sh codex-review "task..." [repo]
  bash packages/engine/bin/hermes-dual-orchestrator.sh minimax-review "task..." [repo]
  bash packages/engine/bin/hermes-dual-orchestrator.sh codex-repair "task..." [repo]
  bash packages/engine/bin/hermes-dual-orchestrator.sh minimax-build "task..." [repo]

Routing policy:
  - complex/high-risk/code/security/architecture -> Codex GPT-5.5 medium first;
  - long-context/docs/churn triage/cheap review -> MiniMax-M3 first;
  - risky changes -> one builder, the other reviewer, never both writing at once.

Required manual setup:
  - Codex authenticated for OpenAI, or CODEX_API_KEY supplied inline to codex-openai-worker.sh.
  - Hermes Agent configured once with MiniMax-M3 via `hermes model`.
USAGE
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "missing command: $1" >&2; exit 127; }
}

json_escape() {
  python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'
}

log_event() {
  mkdir -p "$LOG_DIR"
  local ts event data file
  ts="$(date -u +%FT%TZ)"
  event="$1"
  data="${2:-{}}"
  file="$LOG_DIR/events-$(date -u +%F).jsonl"
  printf '{"ts":"%s","event":"%s","repo":%s,"task":%s,"data":%s}\n' \
    "$ts" "$event" "$(printf '%s' "$REPO" | json_escape)" "$(printf '%s' "$TASK" | json_escape)" "$data" >> "$file"
}

with_lock() {
  mkdir -p "$(dirname "$LOCK_DIR")"
  if ! mkdir "$LOCK_DIR" 2>/dev/null; then
    echo "dual orchestrator already running: $LOCK_DIR" >&2
    exit 75
  fi
  trap 'rm -rf "$LOCK_DIR"' EXIT
}

classify_lane() {
  local t
  t="$(printf '%s' "$TASK" | tr '[:upper:]' '[:lower:]')"
  if printf '%s' "$t" | grep -Eq 'security|secret|token|api.?key|auth|gdpr|race|concurrency|architecture|schema|contract|driver|gate|eval|unsafe|regression|critical|p0|deploy|ci|failing|repair|bug'; then
    printf 'codex'
  elif printf '%s' "$t" | grep -Eq 'docs|audit|inventory|map|triage|summar|research|long.?context|catalog|read.?only|churn'; then
    printf 'minimax'
  else
    printf 'minimax'
  fi
}

codex_review() {
  need_cmd bash
  timeout -k 60 -s INT "$CODEX_TIMEOUT" bash "$CODEX_WORKER" review "$REPO"
}

codex_repair() {
  need_cmd bash
  timeout -k 60 -s INT "$CODEX_TIMEOUT" bash "$CODEX_WORKER" repair "$TASK" "$REPO"
}

minimax_review() {
  need_cmd hermes
  mkdir -p "$MINIMAX_LOG_DIR"
  local prompt out
  out="$MINIMAX_LOG_DIR/hermes-minimax-review-$(date -u +%Y%m%dT%H%M%SZ).log"
  prompt="$(cat <<PROMPT
You are Hermes-MiniMax, the MiniMax-M3 lane in ARDESIA's dual-Hermes factory.

Role:
- Cheap, long-context, high-throughput reviewer/planner.
- Do not act as main builder unless explicitly asked.
- Do not read, print, infer, or request secrets.
- Review repo/task for concrete risks, stale assumptions, overclaim, missing gates, churn, and next safe action.

Repository: $REPO
Task/context: $TASK

Output P0/P1/P2 findings and one smallest next action. Do not edit files.
PROMPT
)"
  (cd "$REPO" && timeout -k 60 -s INT "$MINIMAX_TIMEOUT" hermes --yolo -z "$prompt") 2>&1 | tee -a "$out"
  printf 'hermes-minimax-review log=%s\n' "$out"
}

minimax_build() {
  need_cmd hermes
  mkdir -p "$MINIMAX_LOG_DIR"
  local prompt out
  out="$MINIMAX_LOG_DIR/hermes-minimax-build-$(date -u +%Y%m%dT%H%M%SZ).log"
  prompt="$(cat <<PROMPT
You are Hermes-MiniMax, the MiniMax-M3 lane in ARDESIA's dual-Hermes factory.

Task:
$TASK

Rules:
- Make the smallest safe patch.
- Do not touch eval/gate.sh.
- Do not weaken tests.
- Do not read, print, infer, or request secrets.
- Commit only if the relevant gate/check is green; otherwise leave a clear blocker.
- State exactly what changed and what validation passed/failed.
PROMPT
)"
  (cd "$REPO" && timeout -k 60 -s INT "$MINIMAX_TIMEOUT" hermes --yolo -z "$prompt") 2>&1 | tee -a "$out"
  printf 'hermes-minimax-build log=%s\n' "$out"
}

fanout_review() {
  log_event "fanout.start" '{}'
  codex_review > "$LOG_DIR/codex-review-$(date -u +%Y%m%dT%H%M%SZ).log" 2>&1 &
  local p1=$!
  minimax_review > "$LOG_DIR/minimax-review-$(date -u +%Y%m%dT%H%M%SZ).log" 2>&1 &
  local p2=$!
  wait "$p1"; local s1=$?
  wait "$p2"; local s2=$?
  log_event "fanout.done" "{\"codex_exit\":$s1,\"minimax_exit\":$s2}"
  [ "$s1" -eq 0 ] && [ "$s2" -eq 0 ]
}

route() {
  local lane
  lane="$(classify_lane)"
  log_event "route" "{\"lane\":\"$lane\"}"
  case "$lane" in
    codex)
      codex_repair
      if [ "$MINIMAX_POST_REVIEW" = "1" ]; then minimax_review || true; fi
      ;;
    minimax)
      minimax_build
      if [ "$CODEX_POST_REVIEW" = "1" ]; then codex_review || true; fi
      ;;
    *) echo "unknown lane: $lane" >&2; exit 2 ;;
  esac
}

[ "$ACTION" = "help" ] || [ "$ACTION" = "--help" ] || [ "$ACTION" = "-h" ] && { usage; exit 0; }
[ -n "$TASK" ] || { usage >&2; exit 2; }
with_lock
mkdir -p "$LOG_DIR"

case "$ACTION" in
  route) route ;;
  fanout-review) fanout_review ;;
  codex-review) codex_review ;;
  minimax-review) minimax_review ;;
  codex-repair) codex_repair ;;
  minimax-build) minimax_build ;;
  *) usage >&2; exit 2 ;;
esac
