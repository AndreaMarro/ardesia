#!/bin/bash
# ELAB AUTOMA — Watchdog
# Controllato da launchd ogni 10 minuti.
# Se il dispatcher e' morto, lo riavvia.
# Se HALT esiste, non fa nulla.

DIR="$(cd "$(dirname "$0")" && pwd)"
HEARTBEAT="$DIR/state/heartbeat"
LOG="$DIR/logs/watchdog-$(date +%Y%m%d).log"

# PATH per npm/node/gemini
export PATH="/opt/homebrew/bin:/usr/local/bin:/Users/andreamarro/.npm-global/bin:$PATH"

log() { echo "[$(date +%H:%M:%S)] $1" >> "$LOG"; }

# HALT check
if [ -f "$DIR/HALT" ]; then
    log "HALT active. Skipping."
    exit 0
fi

# Check heartbeat freshness
NOW=$(date +%s)
if [ -f "$HEARTBEAT" ]; then
    LAST=$(stat -f %m "$HEARTBEAT" 2>/dev/null || echo 0)
    DIFF=$((NOW - LAST))
else
    DIFF=99999
fi

# If heartbeat older than 30 min (1800s), restart
if [ "$DIFF" -gt 1800 ]; then
    log "Dispatcher stale (${DIFF}s since heartbeat). Restarting..."

    # Kill old orchestrator
    pkill -f "orchestrator.py" 2>/dev/null
    sleep 2

    # Restart — separate stdout and stderr for debugging
    cd "$DIR/.."
    PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 nohup python3 -Bu automa/orchestrator.py --loop \
        >> "$DIR/logs/orchestrator-$(date +%Y%m%d).log" \
        2>> "$DIR/logs/orchestrator-$(date +%Y%m%d)-err.log" &
    NEW_PID=$!
    log "Orchestrator restarted (PID: $NEW_PID)"

    # Verify it's actually running after 5 seconds
    sleep 5
    if kill -0 $NEW_PID 2>/dev/null; then
        log "  Confirmed alive (PID $NEW_PID)"
    else
        log "  DEAD ON ARRIVAL (PID $NEW_PID) — check err log"
    fi
else
    log "Orchestrator alive (heartbeat ${DIFF}s ago)"
fi

# Caffeinate renewal
if ! pgrep -q caffeinate; then
    caffeinate -dims -t 86400 &
    log "Renewed caffeinate"
fi
