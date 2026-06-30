#!/usr/bin/env bash
set -euo pipefail
CMD="${1:-status}"
shift 2>/dev/null || true
LOG_DIR="${ARDESIA_MEMORY_LOG_DIR:-$HOME/maestro-logs/agentmemory-bridge}"
FALLBACK="$LOG_DIR/fallback.jsonl"
TIMEOUT="${ARDESIA_MEMORY_TIMEOUT:-18}"

find_runner() {
  if [ -n "${AGENTMEMORY_BIN:-}" ] && command -v "$AGENTMEMORY_BIN" >/dev/null 2>&1; then printf '%s' "$AGENTMEMORY_BIN"; return 0; fi
  if command -v agentmemory >/dev/null 2>&1; then printf 'agentmemory'; return 0; fi
  if [ -x "$HOME/node-local/bin/agentmemory" ]; then printf '%s' "$HOME/node-local/bin/agentmemory"; return 0; fi
  return 1
}

json_escape() { python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'; }
log_json() {
  mkdir -p "$LOG_DIR"
  printf '{"ts":"%s","event":"%s","payload":%s}\n' "$(date -u +%FT%TZ)" "$1" "$(printf '%s' "$2" | json_escape)" >> "$FALLBACK"
}

run_try() {
  local runner subcmd text
  runner="$1"; subcmd="$2"; text="$3"
  timeout -k 3 "$TIMEOUT" "$runner" "$subcmd" "$text" 2>/dev/null || return 1
}

recall() {
  local q runner out
  q="${1:-}"
  [ -n "$q" ] || q="ARDESIA factory current task"
  if runner="$(find_runner)"; then
    for sub in recall search find query; do
      out="$(run_try "$runner" "$sub" "$q" 2>/dev/null || true)"
      if [ -n "$out" ]; then
        printf '%s\n' "$out"
        log_json "recall.ok" "$sub $q"
        return 0
      fi
    done
  fi
  log_json "recall.fallback" "$q"
  return 0
}

remember() {
  local text runner out
  if [ "$#" -gt 0 ]; then text="$*"; else text="$(cat)"; fi
  [ -n "$text" ] || return 0
  if runner="$(find_runner)"; then
    for sub in remember add save store; do
      out="$(run_try "$runner" "$sub" "$text" 2>/dev/null || true)"
      if [ -n "$out" ] || timeout -k 3 "$TIMEOUT" "$runner" "$sub" "$text" >/dev/null 2>&1; then
        log_json "remember.ok" "$sub $text"
        return 0
      fi
    done
  fi
  log_json "remember.fallback" "$text"
}

case "$CMD" in
  recall) recall "$@" ;;
  remember) remember "$@" ;;
  status)
    if runner="$(find_runner)"; then echo "agentmemory=available runner=$runner"; else echo "agentmemory=unavailable fallback=$FALLBACK"; fi
    ;;
  *) echo "usage: $0 recall <query> | remember <text> | status" >&2; exit 2 ;;
esac
