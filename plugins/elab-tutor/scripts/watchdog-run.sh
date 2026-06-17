#!/usr/bin/env bash
# Watchdog orchestrator (portable). Reads .watchdog-config.json,
# delegates project-specific checks to scripts/watchdog-checks.sh.
# Exports log_anomaly() + log_ok() helpers for checks.
# Always exits 0 (non-blocking).

set -uo pipefail

RUN_TYPE="${1:-regular}"
CONFIG_FILE=".watchdog-config.json"
MONTH=$(date -u +%Y-%m)
LOG_FILE="docs/audits/errors-log-${MONTH}.md"
REPORT_FILE="/tmp/watchdog-report.md"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Required tools
for cmd in jq curl git gh; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "WARN: missing required command: $cmd"
  fi
done

if [ ! -f "$CONFIG_FILE" ]; then
  echo "ERROR: $CONFIG_FILE not found. Skipping watchdog."
  exit 0
fi

PROJECT=$(jq -r '.project // "unknown"' "$CONFIG_FILE")
SOURCE=$(jq -r '.source // "watchdog"' "$CONFIG_FILE")

# Ensure log file exists
mkdir -p "$(dirname "$LOG_FILE")"
if [ ! -f "$LOG_FILE" ]; then
  cat > "$LOG_FILE" <<EOF
# Errors log $MONTH

**Project**: $PROJECT
**Source**: $SOURCE

## Entries

EOF
fi

# Reset report
: > "$REPORT_FILE"

ANOMALY_COUNT=0
OK_COUNT=0

log_anomaly() {
  local type="$1"
  local detail="$2"
  local pattern_hint="${3:-}"
  ANOMALY_COUNT=$((ANOMALY_COUNT + 1))

  {
    echo ""
    echo "### $TIMESTAMP — $type"
    echo ""
    echo "**Detail**: $detail"
    if [ -n "$pattern_hint" ]; then
      echo ""
      echo "**Pattern hint**: $pattern_hint"
    fi
    echo ""
    echo "**Run**: ${RUN_TYPE:-unknown} | **Source**: ${SOURCE:-watchdog}"
  } >> "$LOG_FILE"

  echo "- ⚠️ **$type**: $detail" >> "$REPORT_FILE"

  # Optionally open GH issue (rate-limited: skip if similar open issue exists)
  if command -v gh >/dev/null 2>&1; then
    SAFE_TITLE="[watchdog] ${type}: ${detail:0:80}"
    EXISTING=$(gh issue list --label watchdog-alert --state open --json title --limit 50 2>/dev/null \
      | jq -r --arg t "$type" '.[] | select(.title | contains($t)) | .title' | head -1)
    if [ -z "$EXISTING" ]; then
      gh issue create \
        --title "$SAFE_TITLE" \
        --label watchdog-alert \
        --body "Detected $TIMESTAMP by ELAB Watchdog ($RUN_TYPE run).

**Type**: $type
**Detail**: $detail
**Pattern hint**: ${pattern_hint:-N/A}

See \`${LOG_FILE:-docs/audits/errors-log.md}\` for full log." 2>/dev/null || echo "Issue creation failed (non-blocking)."
    else
      echo "Skipping issue (similar exists): $EXISTING"
    fi
  fi
}

log_ok() {
  local check="$1"
  local detail="${2:-OK}"
  OK_COUNT=$((OK_COUNT + 1))
  echo "- ✅ **$check**: $detail" >> "$REPORT_FILE"
}

export -f log_anomaly log_ok
export RUN_TYPE TIMESTAMP LOG_FILE REPORT_FILE ANOMALY_COUNT OK_COUNT PROJECT SOURCE

# Header for report
{
  echo "## Watchdog run $TIMESTAMP ($RUN_TYPE)"
  echo ""
  echo "**Project**: $PROJECT"
  echo ""
} > "$REPORT_FILE"

# Delegate to project-specific checks
if [ -x scripts/watchdog-checks.sh ]; then
  bash scripts/watchdog-checks.sh "$RUN_TYPE"
else
  echo "ERROR: scripts/watchdog-checks.sh not executable or missing."
fi

# Count from report (subshell counter fix)
OK_COUNT=$(grep -c '^- ✅' "$REPORT_FILE" 2>/dev/null || echo 0)
ANOMALY_COUNT=$(grep -c '^- ⚠️' "$REPORT_FILE" 2>/dev/null || echo 0)

# Footer
{
  echo ""
  echo "**Summary**: $OK_COUNT OK, $ANOMALY_COUNT anomaly"
} >> "$REPORT_FILE"

echo ""
echo "Watchdog run complete. OK=$OK_COUNT Anomaly=$ANOMALY_COUNT"
exit 0
