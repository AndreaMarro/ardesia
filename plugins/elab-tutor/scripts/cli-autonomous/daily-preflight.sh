#!/usr/bin/env bash
# daily-preflight.sh — Pre-flight check per sessione giornaliera
# Output: JSON stdout con stato progetto
# Exit: 0 = ready, 1 = not ready
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]] || [[ "${1:-}" == "--help" ]]; then
  if [[ "${1:-}" == "--help" ]]; then
    echo "Usage: daily-preflight.sh [--dry-run]"
    echo ""
    echo "Pre-flight check for daily CLI session."
    echo "Output: JSON to stdout with project state."
    echo "Exit: 0 = ready, 1 = not ready."
    echo ""
    echo "Options:"
    echo "  --dry-run   Skip vitest/build execution, use cached state"
    echo "  --help      Show this help"
    exit 0
  fi
  DRY_RUN=true
fi

BRANCH=$(git branch --show-current)
HEAD_SHA=$(git rev-parse --short HEAD)
DIRTY_COUNT=$(git status --short | wc -l | tr -d ' ')
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Last handoff
LAST_HANDOFF="null"
if ls docs/handoff/*-end-day.md 1>/dev/null 2>&1; then
  LAST_HANDOFF=$(ls -t docs/handoff/*-end-day.md 2>/dev/null | head -1)
  LAST_HANDOFF="\"$LAST_HANDOFF\""
fi

READY=true
ISSUES=""

if [[ "$DRY_RUN" == "true" ]]; then
  # Dry run: read cached state
  TEST_COUNT=0
  if [[ -f automa/state/baseline.json ]]; then
    TEST_COUNT=$(python3 -c "import json; d=json.load(open('automa/state/baseline.json')); print(d.get('test_count', 0))" 2>/dev/null || echo 0)
  fi
  BUILD_STATUS="skipped-dry-run"
else
  # Real run: execute vitest and build
  echo "Running vitest..." >&2
  VITEST_OUTPUT=$(npx vitest run --reporter=dot 2>&1 || true)
  TEST_COUNT=$(echo "$VITEST_OUTPUT" | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' || echo 0)

  echo "Running build..." >&2
  if npm run build >/dev/null 2>&1; then
    BUILD_STATUS="pass"
  else
    BUILD_STATUS="fail"
    READY=false
    ISSUES="${ISSUES}build_fail,"
  fi
fi

if [[ "$DIRTY_COUNT" -gt 200 ]]; then
  ISSUES="${ISSUES}high_dirty_count($DIRTY_COUNT),"
fi

# Output JSON
cat <<EOF
{
  "branch": "$BRANCH",
  "head_sha": "$HEAD_SHA",
  "test_count": $TEST_COUNT,
  "build_status": "$BUILD_STATUS",
  "dirty_count": $DIRTY_COUNT,
  "last_handoff": $LAST_HANDOFF,
  "timestamp": "$TIMESTAMP",
  "ready": $READY,
  "issues": "${ISSUES%,}"
}
EOF

if [[ "$READY" == "false" ]]; then
  echo "NOT READY: $ISSUES" >&2
  exit 1
fi
exit 0
