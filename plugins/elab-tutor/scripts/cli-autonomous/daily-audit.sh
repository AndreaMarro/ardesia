#!/usr/bin/env bash
# daily-audit.sh — Audit giornaliero automatico
# Output: docs/audit/daily-YYYY-MM-DD.md
# Exit: 0 = all pass, 1 = any issue
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

if [[ "${1:-}" == "--help" ]]; then
  echo "Usage: daily-audit.sh [--dry-run]"
  echo ""
  echo "Run daily audit: test count, build, PZ v3 check, git state, benchmark."
  echo "Output: docs/audit/daily-YYYY-MM-DD.md"
  echo "Exit: 0 = all pass, 1 = any issue."
  exit 0
fi

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

TODAY=$(date +"%Y-%m-%d")
AUDIT_FILE="docs/audit/daily-${TODAY}.md"
mkdir -p docs/audit

ISSUES=0

echo "# Daily Audit - $TODAY" > "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"
echo "Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"

# 1. Test Count
echo "## Test Count" >> "$AUDIT_FILE"
if [[ "$DRY_RUN" == "true" ]]; then
  echo "Skipped (dry-run mode)" >> "$AUDIT_FILE"
else
  echo "Running vitest..." >&2
  VITEST_OUT=$(npx vitest run --reporter=dot 2>&1 || true)
  TEST_LINE=$(echo "$VITEST_OUT" | grep -E 'Tests.*passed' || echo "unknown")
  echo "\`\`\`" >> "$AUDIT_FILE"
  echo "$TEST_LINE" >> "$AUDIT_FILE"
  echo "\`\`\`" >> "$AUDIT_FILE"
  if echo "$TEST_LINE" | grep -q "failed"; then
    ISSUES=$((ISSUES + 1))
    echo "WARNING: Some tests failed" >> "$AUDIT_FILE"
  fi
fi
echo "" >> "$AUDIT_FILE"

# 2. Build Status
echo "## Build Status" >> "$AUDIT_FILE"
if [[ "$DRY_RUN" == "true" ]]; then
  echo "Skipped (dry-run mode)" >> "$AUDIT_FILE"
else
  echo "Running build..." >&2
  BUILD_START=$(date +%s)
  if npm run build >/dev/null 2>&1; then
    BUILD_END=$(date +%s)
    BUILD_TIME=$((BUILD_END - BUILD_START))
    echo "PASS (${BUILD_TIME}s)" >> "$AUDIT_FILE"
  else
    echo "FAIL" >> "$AUDIT_FILE"
    ISSUES=$((ISSUES + 1))
  fi
fi
echo "" >> "$AUDIT_FILE"

# 3. PZ v3 Check
echo "## Principio Zero v3 Check" >> "$AUDIT_FILE"
PZ_VIOLATIONS=$(grep -rn "Docente,\?\s*leggi\|Insegnante,\?\s*leggi" src/ 2>/dev/null | wc -l | tr -d ' ')
echo "Violations found: $PZ_VIOLATIONS" >> "$AUDIT_FILE"
if [[ "$PZ_VIOLATIONS" -gt 0 ]]; then
  ISSUES=$((ISSUES + 1))
  grep -rn "Docente,\?\s*leggi\|Insegnante,\?\s*leggi" src/ 2>/dev/null >> "$AUDIT_FILE" || true
fi
echo "" >> "$AUDIT_FILE"

# 4. Git State
echo "## Git State" >> "$AUDIT_FILE"
echo "Branch: $(git branch --show-current)" >> "$AUDIT_FILE"
echo "HEAD: $(git rev-parse --short HEAD)" >> "$AUDIT_FILE"
echo "Dirty files: $(git status --short | wc -l | tr -d ' ')" >> "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"
echo "### Recent commits" >> "$AUDIT_FILE"
echo "\`\`\`" >> "$AUDIT_FILE"
git log --oneline -5 >> "$AUDIT_FILE"
echo "\`\`\`" >> "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"

# 5. Benchmark Score
echo "## Benchmark Score" >> "$AUDIT_FILE"
if [[ -f automa/state/benchmark.json ]]; then
  cat automa/state/benchmark.json >> "$AUDIT_FILE"
else
  echo "No benchmark.json found" >> "$AUDIT_FILE"
fi
echo "" >> "$AUDIT_FILE"

# Summary
echo "## Summary" >> "$AUDIT_FILE"
if [[ "$ISSUES" -eq 0 ]]; then
  echo "ALL CHECKS PASS" >> "$AUDIT_FILE"
else
  echo "ISSUES FOUND: $ISSUES" >> "$AUDIT_FILE"
fi

echo "Audit written to $AUDIT_FILE" >&2
exit $( [[ "$ISSUES" -eq 0 ]] && echo 0 || echo 1 )
