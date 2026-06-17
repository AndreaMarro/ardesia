#!/usr/bin/env bash
# end-week-gate.sh — Weekly Definition of Done 13 check
# Input: $1 = week number (1-8)
# Output: docs/audit/week-N-gate-YYYY-MM-DD.md + JSON stdout
# Exit: 0 = ALL 13 pass, 1 = any fail
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

if [[ "${1:-}" == "--help" ]]; then
  echo "Usage: end-week-gate.sh <week-number> [--dry-run]"
  echo ""
  echo "Run 13-check weekly Definition of Done gate."
  echo "Output: docs/audit/week-N-gate-YYYY-MM-DD.md + JSON stdout"
  echo "Exit: 0 = ALL 13 pass, 1 = any fail."
  echo ""
  echo "Checks:"
  echo "  1. Tasks done count"
  echo "  2. Git synced"
  echo "  3. CI success"
  echo "  4. Vitest count >= baseline"
  echo "  5. Build pass"
  echo "  6. Deploy preview exists"
  echo "  7. PZ v3 grep zero"
  echo "  8. E2E smoke count"
  echo "  9. Benchmark score"
  echo "  10. Handoff exists"
  echo "  11. Zero open blockers P0"
  echo "  12. Evidence inventory"
  echo "  13. Changelog exists"
  exit 0
fi

WEEK="${1:-1}"
DRY_RUN=false
if [[ "${2:-}" == "--dry-run" ]] || [[ "$WEEK" == "--dry-run" ]]; then
  DRY_RUN=true
  if [[ "$WEEK" == "--dry-run" ]]; then
    WEEK=1
  fi
fi

TODAY=$(date +"%Y-%m-%d")
GATE_FILE="docs/audit/week-${WEEK}-gate-${TODAY}.md"
mkdir -p docs/audit

PASS_COUNT=0
FAIL_LIST=""

check() {
  local num="$1"
  local name="$2"
  local result="$3" # "true" or "false"
  local detail="$4"

  if [[ "$result" == "true" ]]; then
    PASS_COUNT=$((PASS_COUNT + 1))
    echo "  [PASS] #$num $name: $detail" >> "$GATE_FILE"
  else
    FAIL_LIST="${FAIL_LIST}#${num}($name),"
    echo "  [FAIL] #$num $name: $detail" >> "$GATE_FILE"
  fi
}

echo "# Week $WEEK Gate - $TODAY" > "$GATE_FILE"
echo "" >> "$GATE_FILE"
echo "## Checks" >> "$GATE_FILE"

# 1. Tasks done count
TASKS_DONE=0
if [[ -f automa/team-state/tasks-board.json ]]; then
  TASKS_DONE=$(python3 -c "
import json
with open('automa/team-state/tasks-board.json') as f:
    data = json.load(f)
tasks = data if isinstance(data, list) else data.get('tasks', [])
print(sum(1 for t in tasks if t.get('status') == 'done'))
" 2>/dev/null || echo 0)
fi
check 1 "tasks_done" "$( [[ "$TASKS_DONE" -gt 0 ]] && echo true || echo false )" "${TASKS_DONE} tasks done"

# 2. Git synced
UNPUSHED=$(git log --oneline origin/$(git branch --show-current)..HEAD 2>/dev/null | wc -l | tr -d ' ' || echo "999")
check 2 "git_synced" "$( [[ "$UNPUSHED" -eq 0 ]] && echo true || echo false )" "${UNPUSHED} unpushed commits"

# 3. CI success
CI_CONCLUSION=$(gh run list --branch "$(git branch --show-current)" --limit 1 --json conclusion -q '.[0].conclusion' 2>/dev/null || echo "unknown")
check 3 "ci_success" "$( [[ "$CI_CONCLUSION" == "success" ]] && echo true || echo false )" "$CI_CONCLUSION"

# 4. Vitest count >= baseline
if [[ "$DRY_RUN" == "true" ]]; then
  check 4 "vitest_baseline" "true" "dry-run skipped"
else
  VITEST_OUT=$(npx vitest run --reporter=dot 2>&1 || true)
  TEST_COUNT=$(echo "$VITEST_OUT" | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' || echo 0)
  BASELINE_COUNT=12131
  if [[ -f automa/state/baseline.json ]]; then
    BASELINE_COUNT=$(python3 -c "import json; print(json.load(open('automa/state/baseline.json')).get('test_count', 12131))" 2>/dev/null || echo 12131)
  fi
  check 4 "vitest_baseline" "$( [[ "$TEST_COUNT" -ge "$BASELINE_COUNT" ]] && echo true || echo false )" "${TEST_COUNT} >= ${BASELINE_COUNT}"
fi

# 5. Build pass
if [[ "$DRY_RUN" == "true" ]]; then
  check 5 "build_pass" "true" "dry-run skipped"
else
  if npm run build >/dev/null 2>&1; then
    check 5 "build_pass" "true" "exit 0"
  else
    check 5 "build_pass" "false" "build failed"
  fi
fi

# 6. Deploy preview exists
PREVIEW_EXISTS=false
if ls docs/deploy/preview-*.md 1>/dev/null 2>&1; then
  PREVIEW_EXISTS=true
fi
check 6 "deploy_preview" "$PREVIEW_EXISTS" "$(ls docs/deploy/preview-*.md 2>/dev/null | tail -1 || echo 'none')"

# 7. PZ v3 grep zero
PZ_COUNT=$( (grep -rn "Docente,\?\s*leggi\|Insegnante,\?\s*leggi" src/ 2>/dev/null || true) | wc -l | tr -d ' ')
check 7 "pz_v3_clean" "$( [[ "$PZ_COUNT" -eq 0 ]] && echo true || echo false )" "${PZ_COUNT} violations"

# 8. E2E smoke count
E2E_COUNT=$(ls tests/e2e/*.spec.js 2>/dev/null | wc -l | tr -d ' ')
check 8 "e2e_smoke" "$( [[ "$E2E_COUNT" -ge 5 ]] && echo true || echo false )" "${E2E_COUNT} spec files"

# 9. Benchmark score
BENCH_SCORE="n/a"
if [[ -f automa/state/benchmark.json ]]; then
  BENCH_SCORE=$(python3 -c "import json; print(json.load(open('automa/state/benchmark.json')).get('score', 'n/a'))" 2>/dev/null || echo "n/a")
fi
check 9 "benchmark" "$( [[ "$BENCH_SCORE" != "n/a" ]] && echo true || echo false )" "score: $BENCH_SCORE"

# 10. Handoff exists
HANDOFF_EXISTS=false
if ls docs/handoff/*-end-day.md 1>/dev/null 2>&1; then
  HANDOFF_EXISTS=true
fi
check 10 "handoff_exists" "$HANDOFF_EXISTS" "$(ls -t docs/handoff/*-end-day.md 2>/dev/null | head -1 || echo 'none')"

# 11. Zero open blockers P0
P0_BLOCKERS=0
if [[ -f automa/team-state/blockers.md ]]; then
  P0_BLOCKERS=$( (grep -c "OPEN.*P0\|P0.*OPEN" automa/team-state/blockers.md 2>/dev/null || true) | tail -1)
  P0_BLOCKERS=${P0_BLOCKERS:-0}
fi
check 11 "zero_p0_blockers" "$( [[ "$P0_BLOCKERS" -eq 0 ]] && echo true || echo false )" "${P0_BLOCKERS} P0 open"

# 12. Evidence inventory
EVIDENCE_EXISTS=false
if ls docs/evidence/*.md 1>/dev/null 2>&1 || [[ -f CHANGELOG.md ]]; then
  EVIDENCE_EXISTS=true
fi
check 12 "evidence_inventory" "$EVIDENCE_EXISTS" "$(ls docs/evidence/*.md 2>/dev/null | wc -l | tr -d ' ') evidence files"

# 13. Changelog exists
CHANGELOG_EXISTS=false
if [[ -f CHANGELOG.md ]]; then
  CHANGELOG_EXISTS=true
fi
check 13 "changelog_exists" "$CHANGELOG_EXISTS" "CHANGELOG.md"

echo "" >> "$GATE_FILE"
echo "## Summary" >> "$GATE_FILE"
echo "Passed: $PASS_COUNT / 13" >> "$GATE_FILE"
if [[ -n "$FAIL_LIST" ]]; then
  echo "Failed: ${FAIL_LIST%,}" >> "$GATE_FILE"
fi

# JSON output
cat <<EOF
{
  "week": $WEEK,
  "date": "$TODAY",
  "passed": $PASS_COUNT,
  "total": 13,
  "all_pass": $( [[ "$PASS_COUNT" -eq 13 ]] && echo true || echo false ),
  "failed": "${FAIL_LIST%,}"
}
EOF

echo "Gate report: $GATE_FILE" >&2
exit $( [[ "$PASS_COUNT" -eq 13 ]] && echo 0 || echo 1 )
