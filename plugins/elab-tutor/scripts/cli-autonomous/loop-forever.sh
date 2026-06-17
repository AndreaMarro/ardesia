#!/bin/bash
# loop-forever.sh — Auto-restart Claude CLI con smart delay detect
# Uso: caffeinate -i bash scripts/cli-autonomous/loop-forever.sh
# Stop: Ctrl+C nel Terminale OR crea automa/state/HARD-BLOCKER.md

set -u

PROJECT_DIR="/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
LOG_DIR="$PROJECT_DIR/automa/state/daily-logs"
PROMPT_FILE="$PROJECT_DIR/docs/prompts/DAILY-CONTINUE.md"
BLOCKER_FILE="$PROJECT_DIR/automa/state/HARD-BLOCKER.md"
MAX_RETRIES=30

mkdir -p "$LOG_DIR"
cd "$PROJECT_DIR" || exit 1

# shellcheck source=/dev/null
source ~/.zshrc 2>/dev/null || true

RETRY=0
while [ $RETRY -lt $MAX_RETRIES ]; do
    RETRY=$((RETRY + 1))
    TS=$(date +%Y-%m-%dT%H-%M-%S)
    LOG="$LOG_DIR/cli-$TS.log"

    echo "======================================"
    echo "Launch $TS | Retry $RETRY / $MAX_RETRIES"
    echo "======================================"

    # Hard blocker check (stop permanente)
    if [ -f "$BLOCKER_FILE" ]; then
        echo "HARD BLOCKER present at $BLOCKER_FILE — STOP permanente"
        echo "Fix manuale + remove file + re-launch"
        exit 2
    fi

    # Token verify
    if [ -z "${GITHUB_TOKEN:-}" ] || [ -z "${TOGETHER_API_KEY:-}" ] || [ -z "${SUPABASE_ACCESS_TOKEN:-}" ]; then
        echo "ERROR: env token mancanti. source ~/.zshrc"
        exit 3
    fi

    # Extract prompt + launch
    PROMPT_BODY=$(sed -n '/^## INCOLLA DA QUI ⬇️$/,/^## FINE PROMPT ⬆️$/p' "$PROMPT_FILE")

    if [ -z "$PROMPT_BODY" ]; then
        echo "ERROR: empty prompt body in $PROMPT_FILE"
        exit 4
    fi

    # Launch Claude CLI — --print headless + --max-turns 200 fresh session (state recovery via claude-progress.txt in prompt)
    echo "$PROMPT_BODY" | claude --print --max-turns 200 --dangerously-skip-permissions 2>&1 | tee -a "$LOG"
    EXIT_CODE=$?

    echo "--- Claude exit code: $EXIT_CODE at $(date) ---" | tee -a "$LOG"

    # Detect reason (last 300 lines)
    LAST=$(tail -300 "$LOG" 2>/dev/null || echo "")

    if echo "$LAST" | grep -qiE "429|rate.limit|quota.exceed|too.many.requests"; then
        DELAY=3600
        REASON="Quota 429 — wait 1h"
    elif echo "$LAST" | grep -qiE "context.full|compact.*conversation|too.long"; then
        DELAY=30
        REASON="Context full — immediate 30s resume"
    elif echo "$LAST" | grep -qiE "APPROVE.DEPLOY.PROD|APPROVE.MERGE.MAIN|week-ready-for-review"; then
        echo "Approval gate — STOP, Andrea review needed"
        break
    elif echo "$LAST" | grep -qiE "authentication.failed|401.*auth|invalid.token"; then
        echo "Auth failed — STOP, fix token"
        exit 5
    elif echo "$LAST" | grep -qiE "session.end|day.*complete|sprint.*gate"; then
        DELAY=10
        REASON="Natural end-day — immediate resume 10s"
    else
        DELAY=300
        REASON="Unknown stop — 5 min delay"
    fi

    echo "$REASON — sleeping ${DELAY}s" | tee -a "$LOG"
    sleep "$DELAY"
done

echo "===== Loop ended: RETRY=$RETRY MAX=$MAX_RETRIES ====="
exit 0
