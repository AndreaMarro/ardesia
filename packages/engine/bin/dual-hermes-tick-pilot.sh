#!/usr/bin/env bash
# ARDESIA — limited automatic pilot for the dual-Hermes lanes.
# This is intentionally read-only by default. It is armed for N launchd ticks and
# then disables itself by decrementing a small counter file.
set -euo pipefail

CMD="${1:-hook}"
COUNT_FILE="${ARDESIA_DUAL_TICKS_FILE:-$HOME/lessonos/.dual_hermes_ticks_remaining}"
MODE_FILE="${ARDESIA_DUAL_TICKS_MODE_FILE:-$HOME/lessonos/.dual_hermes_ticks_mode}"
SEQ_FILE="${ARDESIA_DUAL_TICKS_SEQ_FILE:-$HOME/lessonos/.dual_hermes_ticks_seq}"
LOG_DIR="${ARDESIA_DUAL_TICKS_LOG_DIR:-$HOME/maestro-logs/hermes-dual-ticks}"
ENGINE_BIN="${ARDESIA_ENGINE_BIN:-$HOME/lessonos/bin}"
ORCH="${ARDESIA_DUAL_ORCH:-$ENGINE_BIN/hermes-dual-orchestrator.sh}"
DEFAULT_REPO="${ARDESIA_DUAL_DEFAULT_REPO:-$HOME/lessonos}"
TASK="${ARDESIA_DUAL_TICK_TASK:-Automatic read-only dual-Hermes review: inspect the latest kept factory work for regressions, weak gates, churn, overclaim, and product risk. Do not edit files.}"

usage() {
  cat <<'USAGE'
Usage:
  bash dual-hermes-tick-pilot.sh arm <N> [balanced|dual|codex|minimax]
  bash dual-hermes-tick-pilot.sh disarm
  bash dual-hermes-tick-pilot.sh status
  bash dual-hermes-tick-pilot.sh hook

Modes:
  balanced  alternate MiniMax and Codex across ticks; default and cheapest sane pilot.
  dual      run both lanes sequentially in read-only mode every tick.
  codex     run only Codex/OpenAI read-only review.
  minimax   run only Hermes/MiniMax read-only review.

This pilot never runs repair/build. It only invokes read-only review commands.
USAGE
}

read_count() {
  local n
  n="$(cat "$COUNT_FILE" 2>/dev/null || echo 0)"
  case "$n" in ''|*[!0-9]*) n=0 ;; esac
  printf '%s' "$n"
}

write_count() {
  mkdir -p "$(dirname "$COUNT_FILE")"
  printf '%s\n' "$1" > "$COUNT_FILE"
}

read_mode() {
  local m
  m="$(cat "$MODE_FILE" 2>/dev/null || echo balanced)"
  case "$m" in balanced|dual|codex|minimax) printf '%s' "$m" ;; *) printf 'balanced' ;; esac
}

write_mode() {
  mkdir -p "$(dirname "$MODE_FILE")"
  printf '%s\n' "$1" > "$MODE_FILE"
}

next_seq() {
  local s
  s="$(cat "$SEQ_FILE" 2>/dev/null || echo 0)"
  case "$s" in ''|*[!0-9]*) s=0 ;; esac
  s=$((s+1))
  mkdir -p "$(dirname "$SEQ_FILE")"
  printf '%s\n' "$s" > "$SEQ_FILE"
  printf '%s' "$s"
}

log_line() {
  mkdir -p "$LOG_DIR"
  printf '%s %s\n' "$(date -u +%FT%TZ)" "$*" | tee -a "$LOG_DIR/pilot-$(date -u +%F).log"
}

run_codex_review() {
  bash "$ORCH" codex-review "$TASK" "$DEFAULT_REPO"
}

run_minimax_review() {
  bash "$ORCH" minimax-review "$TASK" "$DEFAULT_REPO"
}

hook() {
  local n mode seq lane next rc
  n="$(read_count)"
  [ "$n" -gt 0 ] || exit 0
  mode="$(read_mode)"
  seq="$(next_seq)"
  next=$((n-1))
  write_count "$next"
  log_line "start mode=$mode seq=$seq remaining_before=$n remaining_after=$next repo=$DEFAULT_REPO"

  rc=0
  case "$mode" in
    balanced)
      if [ $((seq % 2)) -eq 1 ]; then lane=minimax; else lane=codex; fi
      log_line "balanced lane=$lane"
      if [ "$lane" = minimax ]; then run_minimax_review || rc=$?; else run_codex_review || rc=$?; fi
      ;;
    dual)
      run_minimax_review || rc=$?
      run_codex_review || rc=$?
      ;;
    codex)
      run_codex_review || rc=$?
      ;;
    minimax)
      run_minimax_review || rc=$?
      ;;
  esac

  log_line "done mode=$mode seq=$seq exit=$rc remaining=$next"
  exit 0
}

case "$CMD" in
  arm)
    N="${2:-}"
    MODE="${3:-balanced}"
    case "${N:-}" in ''|*[!0-9]*) echo "arm requires a positive integer tick count" >&2; exit 2 ;; esac
    [ "$N" -gt 0 ] || { echo "tick count must be > 0" >&2; exit 2; }
    case "$MODE" in balanced|dual|codex|minimax) ;; *) echo "invalid mode: $MODE" >&2; exit 2 ;; esac
    write_count "$N"
    write_mode "$MODE"
    log_line "armed ticks=$N mode=$MODE"
    ;;
  disarm)
    write_count 0
    log_line "disarmed"
    ;;
  status)
    printf 'remaining=%s mode=%s seq=%s\n' "$(read_count)" "$(read_mode)" "$(cat "$SEQ_FILE" 2>/dev/null || echo 0)"
    ;;
  hook)
    hook
    ;;
  -h|--help|help)
    usage
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac
