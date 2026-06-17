#!/bin/bash
# ELAB AUTOMA — Dispatcher continuo
# Il cuore del loop. Gira per sempre. Ogni ciclo:
# 1. Heartbeat (watchdog sa che siamo vivi)
# 2. Health check (servizi up?)
# 3. Prende il prossimo task dalla coda
# 4. Lo esegue con timeout
# 5. Scrive risultato
# 6. CoV: verifica che il risultato sia valido
# 7. Aspetta e ripete
#
# Avvio: nohup bash automa/dispatcher.sh &
# Stop: touch automa/HALT

set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
QUEUE="$DIR/queue/pending"
ACTIVE="$DIR/queue/active"
DONE="$DIR/queue/done"
FAILED="$DIR/queue/failed"
STATE="$DIR/state.json"
HEARTBEAT="$DIR/heartbeat"
LOG="$DIR/logs/dispatcher-$(date +%Y%m%d).log"
BUDGET_FILE="$DIR/state/tokens-$(date +%Y%m%d)"

# Crea directories
mkdir -p "$QUEUE" "$ACTIVE" "$DONE" "$FAILED" "$DIR/logs" "$DIR/state" "$DIR/reports/nightly"

log() { echo "[$(date +%H:%M:%S)] $1" | tee -a "$LOG"; }

# === CoV: Chain of Verification ===
cov_check() {
    local DESCRIPTION="$1"
    local CHECK_CMD="$2"
    local EXPECTED="$3"

    RESULT=$(eval "$CHECK_CMD" 2>&1)
    if echo "$RESULT" | grep -q "$EXPECTED"; then
        log "  CoV PASS: $DESCRIPTION"
        return 0
    else
        log "  CoV FAIL: $DESCRIPTION (got: ${RESULT:0:100})"
        return 1
    fi
}

# === Budget check ===
check_budget() {
    local SPENT=$(cat "$BUDGET_FILE" 2>/dev/null || echo 0)
    local LIMIT=50000  # tokens/day
    if [ "$SPENT" -ge "$LIMIT" ]; then
        log "BUDGET EXHAUSTED ($SPENT/$LIMIT tokens). Only free tasks."
        return 1
    fi
    return 0
}

# === Memory check ===
check_memory() {
    local FREE_MB=$(vm_stat 2>/dev/null | awk '/Pages free/ {gsub(/\./,"",$3); print int($3*4096/1048576)}')
    if [ "${FREE_MB:-0}" -lt 300 ]; then
        log "LOW MEMORY (${FREE_MB}MB free). Skipping heavy tasks."
        return 1
    fi
    return 0
}

# === Health checks ===
health_check() {
    log "--- Health Check ---"

    # Nanobot
    local NANO_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "https://elab-galileo.onrender.com/health" --max-time 15 2>/dev/null || echo "000")
    if [ "$NANO_HTTP" = "200" ]; then
        log "  Nanobot: OK (200)"
    else
        log "  Nanobot: FAIL ($NANO_HTTP)"
        echo "NANOBOT DOWN ($NANO_HTTP)" >> "$DIR/alerts/$(date +%Y%m%d_%H%M).txt"
    fi

    # Vercel
    local VERCEL_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "https://www.elabtutor.school" --max-time 10 2>/dev/null || echo "000")
    if [ "$VERCEL_HTTP" = "200" ] || [ "$VERCEL_HTTP" = "301" ] || [ "$VERCEL_HTTP" = "302" ]; then
        log "  Vercel: OK ($VERCEL_HTTP)"
    else
        log "  Vercel: FAIL ($VERCEL_HTTP)"
    fi

    # Build
    cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
    if timeout 120 npm run build > /dev/null 2>&1; then
        log "  Build: PASS"
    else
        log "  Build: FAIL"
        echo "BUILD FAILED" >> "$DIR/alerts/$(date +%Y%m%d_%H%M).txt"
    fi
}

# === Run quick Galileo test (10 messages) ===
galileo_quick_test() {
    log "--- Galileo Quick Test ---"
    local REPORT="$DIR/reports/nightly/$(date +%Y-%m-%d_%H%M).json"

    cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
    timeout 120 python3 automa/agents/quick-test.py "https://elab-galileo.onrender.com" "$REPORT" 2>&1 | tee -a "$LOG"

    # CoV: verify report was created and has results
    if [ -f "$REPORT" ]; then
        local PASS_COUNT=$(python3 -c "import json; d=json.load(open('$REPORT')); print(d.get('pass_count',0))" 2>/dev/null || echo 0)
        log "  CoV: Report created, $PASS_COUNT/10 PASS"

        if [ "$PASS_COUNT" -lt 7 ]; then
            log "  ALERT: Score below threshold ($PASS_COUNT/10)"
            echo "GALILEO SCORE LOW: $PASS_COUNT/10" >> "$DIR/alerts/$(date +%Y%m%d_%H%M).txt"
        fi
    else
        log "  CoV FAIL: Report not created"
    fi
}

# === Process task from queue ===
process_task() {
    local TASK_FILE="$1"
    local TASK_NAME=$(basename "$TASK_FILE")

    log "--- Processing: $TASK_NAME ---"

    # Move to active
    mv "$TASK_FILE" "$ACTIVE/$TASK_NAME"

    # Read task (simple format: first line = command, rest = description)
    local CMD=$(head -1 "$ACTIVE/$TASK_NAME")

    # Execute with timeout
    local START=$(date +%s)
    if timeout 600 bash -c "$CMD" >> "$LOG" 2>&1; then
        local DURATION=$(( $(date +%s) - START ))
        log "  DONE in ${DURATION}s"
        echo -e "\n# COMPLETED $(date) in ${DURATION}s" >> "$ACTIVE/$TASK_NAME"
        mv "$ACTIVE/$TASK_NAME" "$DONE/$(date +%Y%m%d)_$TASK_NAME"
    else
        local EXIT=$?
        local DURATION=$(( $(date +%s) - START ))
        if [ $EXIT -eq 124 ]; then
            log "  TIMEOUT after ${DURATION}s"
        else
            log "  FAILED (exit $EXIT) after ${DURATION}s"
        fi
        echo -e "\n# FAILED $(date) exit=$EXIT duration=${DURATION}s" >> "$ACTIVE/$TASK_NAME"
        mv "$ACTIVE/$TASK_NAME" "$FAILED/$(date +%Y%m%d)_$TASK_NAME"
    fi
}

# === MAIN LOOP ===
log "=========================================="
log "ELAB AUTOMA DISPATCHER STARTED"
log "PID: $$"
log "=========================================="

CYCLE=0
while true; do
    # Check HALT
    if [ -f "$DIR/HALT" ]; then
        log "HALT file detected. Stopping."
        exit 0
    fi

    CYCLE=$((CYCLE + 1))
    touch "$HEARTBEAT"
    log ""
    log "=== CYCLE $CYCLE ($(date +%H:%M)) ==="

    # Every cycle: health check
    health_check

    # Every cycle: quick Galileo test
    galileo_quick_test

    # Process queue
    TASK=$(ls "$QUEUE"/*.task 2>/dev/null | sort | head -1)
    if [ -n "$TASK" ]; then
        if check_memory && check_budget; then
            process_task "$TASK"
        else
            log "  Skipping task (resource limit)"
        fi
    else
        log "  Queue empty."
    fi

    # CoV: verify this cycle produced results
    cov_check "Heartbeat updated" "test -f '$HEARTBEAT' && echo ok" "ok"
    cov_check "Log written" "tail -1 '$LOG' | grep -c 'CYCLE'" "1"

    # Update state
    cat > "$STATE" << EOF
{
    "status": "running",
    "pid": $$,
    "cycle": $CYCLE,
    "last_cycle": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "uptime_hours": $(echo "scale=1; $CYCLE * 2 / 1" | bc 2>/dev/null || echo $CYCLE)
}
EOF

    # Wait 2 hours before next cycle
    log "Sleeping 2 hours until next cycle..."
    sleep 7200
done
