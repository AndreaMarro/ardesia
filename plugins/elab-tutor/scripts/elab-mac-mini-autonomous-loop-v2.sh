#!/bin/bash
# ELAB Mac Mini autonomous loop V2 — task queue dispatcher iter 22+
# Promotes from heartbeat-only stub to PROACTIVE task gen + retry + result sync
# Sprint T iter 22 ralph loop — 2026-04-28 caveman mode
#
# Andrea mandate iter 18 PM: "Mac Mini come secondo cervello + servo bravissimo, ma sii critico"
#
# Replaces v1 heartbeat-only loop with:
# - JSONL task queue read (~/.elab-task-queue.jsonl)
# - Per task: command exec + timeout + retry + log + result write
# - Heartbeat ogni 5min (mantenuto)
# - Health check Tailscale + repo HEAD + disk every 30min
# - Auto-pull repo every 1h (sync iter+1 state)

set -uo pipefail
eval "$(/opt/homebrew/bin/brew shellenv)" 2>/dev/null || true

LOG_DIR="$HOME/Library/Logs/elab"
RESULTS_DIR="$HOME/.elab-results"
QUEUE_FILE="$HOME/.elab-task-queue.jsonl"
PROGRESS_FILE="$HOME/.elab-task-progress.jsonl"
HEALTH_FILE="$HOME/.elab-health.json"
mkdir -p "$LOG_DIR" "$RESULTS_DIR"
touch "$QUEUE_FILE" "$PROGRESS_FILE"

REPO_PATH="$HOME/Projects/elab-tutor"
LOG_FILE="$LOG_DIR/autonomous-loop-v2-$(date +%Y%m%d).log"

cd "$REPO_PATH" 2>/dev/null || { echo "FATAL: repo $REPO_PATH not found"; exit 1; }

log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" >> "$LOG_FILE"
}

log "LOOP_V2_START pid=$$"

# Health snapshot
write_health() {
  local repo_head=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
  local disk_pct=$(df -h / | tail -1 | awk '{print $5}' | tr -d '%')
  local tailscale_ok=$(/Applications/Tailscale.app/Contents/MacOS/Tailscale status >/dev/null 2>&1 && echo true || echo false)
  cat > "$HEALTH_FILE" <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "repo_head": "$repo_head",
  "disk_used_pct": $disk_pct,
  "tailscale_alive": $tailscale_ok,
  "queue_size": $(wc -l < "$QUEUE_FILE" | tr -d ' '),
  "completed_count": $(grep -c '"status":"completed"' "$PROGRESS_FILE" 2>/dev/null || echo 0),
  "failed_count": $(grep -c '"status":"failed"' "$PROGRESS_FILE" 2>/dev/null || echo 0)
}
EOF
}

# Process single task from queue
process_task() {
  local task_json="$1"
  local task_id=$(echo "$task_json" | jq -r '.id')
  local cmd=$(echo "$task_json" | jq -r '.command')
  local timeout=$(echo "$task_json" | jq -r '.timeout // 1800')
  local max_retry=$(echo "$task_json" | jq -r '.max_retry // 1')
  local task_log_name=$(echo "$task_json" | jq -r '.log // .id')

  local task_log="$LOG_DIR/task-${task_log_name}-$(date +%Y%m%d-%H%M%S).log"
  local result_file="$RESULTS_DIR/${task_id}-$(date +%Y%m%d-%H%M%S).json"

  log "TASK_START id=$task_id cmd_preview=${cmd:0:80}"

  local attempt=0
  local exit_code=999
  while [ $attempt -le $max_retry ]; do
    attempt=$((attempt + 1))
    log "  ATTEMPT $attempt/$((max_retry + 1)) timeout=${timeout}s"

    # macOS-compatible timeout (no GNU coreutils dependency)
    bash -c "$cmd" > "$task_log" 2>&1 &
    cmd_pid=$!
    ( sleep "$timeout" && kill -TERM "$cmd_pid" 2>/dev/null ) &
    timer_pid=$!
    wait "$cmd_pid" 2>/dev/null
    exit_code=$?
    kill -TERM "$timer_pid" 2>/dev/null
    wait "$timer_pid" 2>/dev/null || true

    if [ $exit_code -eq 0 ]; then
      log "  TASK_SUCCESS id=$task_id attempt=$attempt"
      cat > "$result_file" <<EOF
{
  "task_id": "$task_id",
  "status": "completed",
  "exit_code": 0,
  "attempt": $attempt,
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "log": "$task_log"
}
EOF
      echo "{\"id\":\"$task_id\",\"status\":\"completed\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" >> "$PROGRESS_FILE"
      return 0
    fi

    if [ $exit_code -eq 124 ]; then
      log "  TASK_TIMEOUT id=$task_id attempt=$attempt"
    else
      log "  TASK_FAIL id=$task_id attempt=$attempt exit=$exit_code"
    fi
  done

  log "TASK_GIVE_UP id=$task_id total_attempts=$attempt last_exit=$exit_code"
  cat > "$result_file" <<EOF
{
  "task_id": "$task_id",
  "status": "failed",
  "exit_code": $exit_code,
  "attempts": $attempt,
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "log": "$task_log"
}
EOF
  echo "{\"id\":\"$task_id\",\"status\":\"failed\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" >> "$PROGRESS_FILE"
  return 1
}

# Drain queue (process all + clear)
drain_queue() {
  if [ ! -s "$QUEUE_FILE" ]; then
    return 0
  fi

  log "QUEUE_DRAIN_START tasks=$(wc -l < "$QUEUE_FILE" | tr -d ' ')"

  local tmp_queue="${QUEUE_FILE}.processing.$$"
  mv "$QUEUE_FILE" "$tmp_queue"
  touch "$QUEUE_FILE"

  while IFS= read -r task_line; do
    [ -z "$task_line" ] && continue
    process_task "$task_line"
  done < "$tmp_queue"

  rm -f "$tmp_queue"
  log "QUEUE_DRAIN_END"
}

# Main loop
HEARTBEAT_INTERVAL=300       # 5min
HEALTH_INTERVAL=1800         # 30min
PULL_INTERVAL=3600           # 1h
QUEUE_POLL=60                # 1min poll queue

last_heartbeat=$(date +%s)
last_health=$(date +%s)
last_pull=$(date +%s)

write_health
log "LOOP_V2_READY queue=$QUEUE_FILE health=$HEALTH_FILE"

while true; do
  now=$(date +%s)

  # Heartbeat
  if [ $((now - last_heartbeat)) -ge $HEARTBEAT_INTERVAL ]; then
    log "HEARTBEAT"
    last_heartbeat=$now
  fi

  # Health snapshot
  if [ $((now - last_health)) -ge $HEALTH_INTERVAL ]; then
    write_health
    log "HEALTH_SNAPSHOT"
    last_health=$now
  fi

  # Auto git pull
  if [ $((now - last_pull)) -ge $PULL_INTERVAL ]; then
    git fetch origin >/dev/null 2>&1 || true
    if git status -sb 2>/dev/null | grep -q "behind"; then
      log "GIT_PULL_NEEDED branch_behind"
      git pull --ff-only 2>&1 | tail -3 >> "$LOG_FILE" || log "GIT_PULL_FAIL"
    fi
    last_pull=$now
  fi

  # Drain task queue
  drain_queue

  # Sleep
  sleep $QUEUE_POLL
done
