#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Quick Regression Check — veloce (~60s)
# Usato da: pre-commit git hook (test + lint, NO build, NO site)
# Exit 0 = OK, 1 = regression
# ═══════════════════════════════════════════════════════════════

set -e
cd "$(dirname "$0")/.."

if [ -t 1 ]; then R='\033[0;31m'; G='\033[0;32m'; Y='\033[0;33m'; N='\033[0m';
else R=''; G=''; Y=''; N=''; fi

BASELINE_CI=".test-count-baseline.json"
BASELINE=$(python3 -c "import json; print(json.load(open('$BASELINE_CI')).get('total', 0))" 2>/dev/null || echo "0")
THRESHOLD_ABS=$(python3 -c "import json; print(json.load(open('$BASELINE_CI')).get('regression_threshold_absolute', 50))" 2>/dev/null || echo "50")

echo -e "${Y}[PRE-COMMIT]${N} Quick regression check (baseline: $BASELINE)"

# Only test; skip build for speed
TEST_OUTPUT=$(npx vitest run 2>&1 | tail -8)
# Output vitest ha 2 righe "N passed": "Test Files X passed" e "Tests Y passed"
# Prendi la riga "Tests  Y passed" (tests count, non files count)
TEST_COUNT=$(echo "$TEST_OUTPUT" | grep -E '^[[:space:]]*Tests[[:space:]]' | grep -oE '[0-9]+ passed' | head -1 | grep -oE '[0-9]+' || echo "0")
TEST_FAIL=$(echo "$TEST_OUTPUT" | grep -E '^[[:space:]]*Tests[[:space:]]' | grep -oE '[0-9]+ failed' | head -1 | grep -oE '[0-9]+' || echo "0")
[ -z "$TEST_COUNT" ] && TEST_COUNT=0
[ -z "$TEST_FAIL" ] && TEST_FAIL=0

# Fail if any test red
if [ "$TEST_FAIL" -gt 0 ]; then
  echo -e "${R}[PRE-COMMIT] ✗${N} $TEST_FAIL test FALLITI — commit BLOCCATO"
  echo "$TEST_OUTPUT" | tail -15
  echo -e "${Y}Per fixare:${N} vedi failures sopra. Per bypass (non farlo): git commit --no-verify"
  exit 1
fi

# Fail if drop > threshold_abs
if [ "$BASELINE" -gt 0 ] && [ "$TEST_COUNT" -lt "$BASELINE" ]; then
  DROP=$((BASELINE - TEST_COUNT))
  if [ "$DROP" -gt "$THRESHOLD_ABS" ]; then
    echo -e "${R}[PRE-COMMIT] ✗${N} Test count -$DROP (baseline $BASELINE → $TEST_COUNT, threshold $THRESHOLD_ABS)"
    echo -e "${Y}Qualcosa ha cancellato test. Investiga prima di committare.${N}"
    exit 1
  fi
fi

echo -e "${G}[PRE-COMMIT] ✓${N} $TEST_COUNT test PASS (baseline $BASELINE)"
exit 0
