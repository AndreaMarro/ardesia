#!/usr/bin/env bash
# Smart on/off pod RunPod — iter 4 P1 B1 per SPEC §2
# Routes task by type → Edge Function (no GPU) OR pod boot+exec+auto-stop
#
# Usage:
#   scripts/runpod-smart-onoff.sh <task_type> [<task_args>...]
#
# Task types:
#   test_quality    — R0/R5 fixture, Edge Function direct, NO GPU consumption
#   test_edge       — alias test_quality
#   test_inference_local — Qwen/Whisper local, requires pod RUNNING
#   rag_ingest      — Anthropic Contextual batch, requires pod RUNNING
#   bench_vision    — Qwen-VL screenshot, requires pod RUNNING
#
# Exit codes:
#   0 — task type Edge Function direct (caller invoke directly)
#   1 — unknown task type
#   2 — pod boot failed
#   3 — pod exec failed
#
# Env:
#   ELAB_RUNPOD_POD_ID       (default: 5ren6xbrprhkl5)
#   GRACE_IDLE_MIN           (default: 5)
#   COST_CAP_WEEKLY_USD      (default: 50)
#   DRY_RUN                  (default: 0; 1 = no actual pod ops)

set -euo pipefail

POD_ID="${ELAB_RUNPOD_POD_ID:-5ren6xbrprhkl5}"
GRACE_IDLE_MIN="${GRACE_IDLE_MIN:-5}"
COST_CAP_WEEKLY_USD="${COST_CAP_WEEKLY_USD:-50}"
DRY_RUN="${DRY_RUN:-0}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log() { echo "[smart-onoff $(date -u +%H:%M:%SZ)] $*"; }
err() { echo "[smart-onoff ERROR] $*" >&2; }

if [ $# -lt 1 ]; then
  err "missing task_type. usage: $0 <task_type> [<args>...]"
  exit 1
fi

task_type="$1"; shift

case "$task_type" in
  test_quality|test_edge)
    log "task=$task_type → Edge Function direct, NO GPU consumption, cost \$0"
    log "caller should invoke: https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat"
    exit 0
    ;;
  test_inference_local|rag_ingest|bench_vision)
    log "task=$task_type → requires pod RUNNING (GPU consumption)"
    if [ "$DRY_RUN" = "1" ]; then
      log "DRY_RUN=1 — skip pod ops, simulate RUNNING ready"
      exit 0
    fi
    state="$(bash "$SCRIPT_DIR/runpod-status.sh" "$POD_ID" 2>/dev/null | grep -oE 'EXITED|RUNNING|BOOTING' | head -1 || echo UNKNOWN)"
    log "current pod state: $state"
    if [ "$state" = "EXITED" ]; then
      log "BOOT pod=$POD_ID (~2min)"
      bash "$SCRIPT_DIR/runpod-resume.sh" "$POD_ID" || { err "boot failed"; exit 2; }
      attempts=0
      until [ "$(bash "$SCRIPT_DIR/runpod-status.sh" "$POD_ID" 2>/dev/null | grep -oE RUNNING | head -1)" = "RUNNING" ]; do
        attempts=$((attempts+1))
        if [ $attempts -ge 24 ]; then
          err "pod boot timeout after 240s"
          exit 2
        fi
        sleep 10
      done
      log "pod RUNNING ready (boot took ~$((attempts*10))s)"
    elif [ "$state" = "BOOTING" ]; then
      log "pod already booting, wait..."
      until [ "$(bash "$SCRIPT_DIR/runpod-status.sh" "$POD_ID" 2>/dev/null | grep -oE RUNNING | head -1)" = "RUNNING" ]; do
        sleep 10
      done
    elif [ "$state" = "RUNNING" ]; then
      log "pod RUNNING already, exec immediately"
    else
      err "unexpected pod state: $state"
      exit 2
    fi
    # auto-stop watcher: existing script polls marker /workspace/.task-done over SSH
    # caller MUST write marker upon completion: ssh root@$POD_HOST 'touch /workspace/.task-done'
    if [ -n "${POD_SSH_HOST:-}" ]; then
      log "schedule auto-stop watcher (existing event-driven via marker /workspace/.task-done)"
      nohup bash "$SCRIPT_DIR/runpod-auto-stop-after.sh" "$POD_ID" "/workspace/.task-done" >/dev/null 2>&1 &
    else
      log "WARN POD_SSH_HOST unset — auto-stop watcher SKIPPED (caller must stop manually via runpod-stop.sh)"
    fi
    log "task=$task_type pod ready — caller should SSH exec now"
    exit 0
    ;;
  *)
    err "unknown task_type='$task_type'"
    err "valid: test_quality, test_edge, test_inference_local, rag_ingest, bench_vision"
    exit 1
    ;;
esac
