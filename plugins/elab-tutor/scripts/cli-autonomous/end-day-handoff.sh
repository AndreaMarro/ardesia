#!/usr/bin/env bash
# end-day-handoff.sh — Generate end-of-day handoff document
# Output: docs/handoff/YYYY-MM-DD-end-day.md pre-filled template
# Exit: 0 always
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

if [[ "${1:-}" == "--help" ]]; then
  echo "Usage: end-day-handoff.sh [--dry-run]"
  echo ""
  echo "Generate end-of-day handoff document with auto-populated fields."
  echo "Output: docs/handoff/YYYY-MM-DD-end-day.md"
  echo "Exit: 0 always."
  exit 0
fi

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

TODAY=$(date +"%Y-%m-%d")
HANDOFF_FILE="docs/handoff/${TODAY}-end-day.md"
mkdir -p docs/handoff

BRANCH=$(git branch --show-current)
HEAD_SHA=$(git rev-parse --short HEAD)
DIRTY_COUNT=$(git status --short | wc -l | tr -d ' ')

# Recent commits today
COMMITS_TODAY=$(git log --oneline --since="$(date +%Y-%m-%d)T00:00:00" 2>/dev/null || echo "none")

# Test count from baseline
TEST_COUNT="unknown"
if [[ -f automa/state/baseline.json ]]; then
  TEST_COUNT=$(python3 -c "import json; print(json.load(open('automa/state/baseline.json')).get('test_count', 'unknown'))" 2>/dev/null || echo "unknown")
fi

# Benchmark
BENCH_SCORE="n/a"
if [[ -f automa/state/benchmark.json ]]; then
  BENCH_SCORE=$(python3 -c "import json; print(json.load(open('automa/state/benchmark.json')).get('score', 'n/a'))" 2>/dev/null || echo "n/a")
fi

# Tasks status
TASKS_SUMMARY="no tasks-board.json found"
if [[ -f automa/team-state/tasks-board.json ]]; then
  TASKS_SUMMARY=$(python3 -c "
import json
with open('automa/team-state/tasks-board.json') as f:
    data = json.load(f)
tasks = data if isinstance(data, list) else data.get('tasks', [])
statuses = {}
for t in tasks:
    s = t.get('status', 'unknown')
    statuses[s] = statuses.get(s, 0) + 1
print(', '.join(f'{k}: {v}' for k, v in sorted(statuses.items())))
" 2>/dev/null || echo "parse error")
fi

# Blockers
BLOCKERS="none"
if [[ -f automa/team-state/blockers.md ]]; then
  OPEN_BLOCKERS=$(grep -c "OPEN" automa/team-state/blockers.md 2>/dev/null || echo 0)
  BLOCKERS="${OPEN_BLOCKERS} open blockers"
fi

cat > "$HANDOFF_FILE" <<EOF
# End-of-Day Handoff - $TODAY

## State
- Branch: $BRANCH
- HEAD: $HEAD_SHA
- Dirty files: $DIRTY_COUNT
- Test count: $TEST_COUNT (from baseline.json)
- Build: [VERIFY - run npm run build]
- Benchmark: $BENCH_SCORE

## Commits Today
\`\`\`
$COMMITS_TODAY
\`\`\`

## Tasks Status
$TASKS_SUMMARY

## Completed Today
<!-- Fill in: list tasks completed with commit SHAs -->

## Not Completed
<!-- Fill in: list tasks not completed with reason -->

## Decisions Made
<!-- Fill in: any architectural or process decisions -->

## Anomalies / Warnings
<!-- Fill in: anything unexpected -->

## Blockers
$BLOCKERS

## Next Session Plan
<!-- Fill in: what should the next session prioritize -->

## Files Modified
\`\`\`
$(git diff --name-only HEAD~5..HEAD 2>/dev/null | head -20 || echo "unable to determine")
\`\`\`
EOF

echo "Handoff written to $HANDOFF_FILE" >&2
exit 0
