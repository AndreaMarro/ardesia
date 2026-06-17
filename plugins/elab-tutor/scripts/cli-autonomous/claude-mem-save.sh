#!/usr/bin/env bash
#
# claude-mem-save.sh — Generate structured observation payload for claude-mem
#                     MCP save operations at lifecycle points.
#
# Usage:
#   ./scripts/cli-autonomous/claude-mem-save.sh <event> [extra_tags...]
#
# Events:
#   commit          — post-commit observation (sha, scope, test_count)
#   end-day         — end-of-day rollup (day, bench, blockers, 4-grading)
#   end-week        — sprint end review (sprint, metrics, retrospective)
#   decision        — architectural decision (rationale from ADR)
#   blocker         — new blocker detected (severity, impacted tasks)
#   audit           — honest audit snapshot (score, red flags)
#
# Output:
#   Writes JSON payload to automa/state/claude-mem-pending/<event>-<ts>.json
#   Prints human-readable instructions to stdout for Claude CLI to dispatch
#   the actual MCP save observation via
#   mcp__plugin_claude-mem_mcp-search__* save_observation.
#
# Note: this script does NOT call MCP directly (MCP calls are client-side
#       tools invoked by Claude CLI). Script prepares canonical payload so
#       the MCP save operation is a one-step dispatch in the next turn.
#
# Exit codes:
#   0 success
#   1 invalid event
#   2 missing git state
#   3 payload write fail

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PENDING_DIR="$ROOT_DIR/automa/state/claude-mem-pending"
mkdir -p "$PENDING_DIR"

EVENT="${1:-}"
shift || true
EXTRA_TAGS=("$@")

if [ -z "$EVENT" ]; then
  echo "ERROR: missing event arg" >&2
  echo "Usage: $0 <commit|end-day|end-week|decision|blocker|audit> [extra_tags...]" >&2
  exit 1
fi

case "$EVENT" in
  commit|end-day|end-week|decision|blocker|audit) ;;
  *)
    echo "ERROR: invalid event '$EVENT'" >&2
    exit 1
    ;;
esac

TS="$(date -Iseconds)"
TS_SAFE="$(date +%Y%m%dT%H%M%S)"
OUT_FILE="$PENDING_DIR/${EVENT}-${TS_SAFE}.json"

cd "$ROOT_DIR"

SHA="$(git rev-parse HEAD 2>/dev/null || echo unknown)"
BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
LAST_MSG="$(git log -1 --pretty=%s 2>/dev/null || echo unknown)"

if [ "$SHA" = "unknown" ]; then
  echo "ERROR: not in a git repo or no commits" >&2
  exit 2
fi

TEST_COUNT_LAST=""
SPRINT_DAY=""
SPRINT=""
STATE_FILE="$ROOT_DIR/automa/state/claude-progress.txt"
if [ -f "$STATE_FILE" ]; then
  TEST_COUNT_LAST="$(grep -E '^baseline_tests' "$STATE_FILE" | tail -1 | awk -F'[:=]' '{gsub(/^ +| +$/,"",$2); print $2}' || echo unknown)"
  SPRINT_DAY="$(grep -E '^sprint_day_cumulative' "$STATE_FILE" | tail -1 | awk -F'[:=]' '{gsub(/^ +| +$/,"",$2); print $2}' || echo unknown)"
  SPRINT="$(grep -E '^sprint:' "$STATE_FILE" | tail -1 | awk -F':' '{gsub(/^ +| +$/,"",$2); print $2}' || echo unknown)"
fi
[ -z "$TEST_COUNT_LAST" ] && TEST_COUNT_LAST="unknown"
[ -z "$SPRINT_DAY" ] && SPRINT_DAY="unknown"
[ -z "$SPRINT" ] && SPRINT="unknown"

TITLE=""
CONTENT=""
TAGS=""

case "$EVENT" in
  commit)
    TITLE="Commit ${SHA:0:7} on $BRANCH"
    CONTENT="Commit SHA: $SHA\nBranch: $BRANCH\nMessage: $LAST_MSG\nTest count baseline: $TEST_COUNT_LAST\nSprint: $SPRINT day $SPRINT_DAY"
    TAGS="commit,sprint-$SPRINT,day-$SPRINT_DAY"
    ;;
  end-day)
    TITLE="Day $SPRINT_DAY end — $SPRINT"
    CONTENT="End-of-day rollup.\nLast SHA: $SHA\nBranch: $BRANCH\nTest baseline: $TEST_COUNT_LAST\nRead docs/handoff/ for full day report."
    TAGS="end-day,day-$SPRINT_DAY,sprint-$SPRINT"
    ;;
  end-week)
    TITLE="Sprint $SPRINT week end"
    CONTENT="Sprint review + retrospective.\nLast SHA: $SHA\nBranch: $BRANCH\nRead docs/reviews/ and docs/retrospectives/ for full sprint report."
    TAGS="end-week,sprint-$SPRINT"
    ;;
  decision)
    TITLE="Decision ${SHA:0:7}"
    CONTENT="Architectural decision captured at $SHA.\nBranch: $BRANCH\nRead docs/architectures/ADR-*.md for rationale."
    TAGS="decision,architecture,sprint-$SPRINT"
    ;;
  blocker)
    TITLE="Blocker detected at ${SHA:0:7}"
    CONTENT="Blocker snapshot.\nSHA: $SHA\nBranch: $BRANCH\nRead automa/team-state/blockers.md for details."
    TAGS="blocker,open,sprint-$SPRINT"
    ;;
  audit)
    TITLE="Audit snapshot Day $SPRINT_DAY"
    CONTENT="Honest audit snapshot.\nSHA: $SHA\nBranch: $BRANCH\nRead docs/audit/day-$SPRINT_DAY-audit.md for full report."
    TAGS="audit,day-$SPRINT_DAY,sprint-$SPRINT"
    ;;
esac

if [ "${#EXTRA_TAGS[@]}" -gt 0 ]; then
  for tag in "${EXTRA_TAGS[@]}"; do
    TAGS="$TAGS,$tag"
  done
fi

cat > "$OUT_FILE" <<EOF
{
  "event": "$EVENT",
  "timestamp": "$TS",
  "title": "$TITLE",
  "content": "$CONTENT",
  "tags": "$TAGS",
  "sha": "$SHA",
  "branch": "$BRANCH",
  "sprint": "$SPRINT",
  "sprint_day": "$SPRINT_DAY",
  "test_count_baseline": "$TEST_COUNT_LAST"
}
EOF

if [ ! -f "$OUT_FILE" ]; then
  echo "ERROR: failed to write $OUT_FILE" >&2
  exit 3
fi

echo "Payload written: $OUT_FILE"
echo ""
echo "NEXT STEP (Claude CLI turn):"
echo "Dispatch MCP save observation using one of:"
echo "  - mcp__plugin_claude-mem_mcp-search__search (to verify cross-session context)"
echo "  - Save via the memory system (write memory file + MEMORY.md pointer)"
echo ""
echo "Payload summary:"
echo "  event: $EVENT"
echo "  title: $TITLE"
echo "  tags:  $TAGS"
