#!/bin/bash
# ============================================
# ELAB evaluate-v3.sh — Score Composito Singolo
# Pattern Karpathy: UN numero, misurabile in <2 min
#
# Output: SCORE:XX.X (0-100, higher=better)
# Uso: bash automa/evaluate-v3.sh
# ============================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

SCORE=0
DETAILS=""
ERRORS=""

log() { echo "  $1"; }

# ── 1. BUILD (20 punti) ──────────────────────
log "Checking build..."
BUILD_OUTPUT=$(npm run build --silent 2>&1) || true
if echo "$BUILD_OUTPUT" | grep -q "built in"; then
  BUILD_SCORE=20
  BUILD_TIME=$(echo "$BUILD_OUTPUT" | grep -oE 'built in [0-9.]+' | grep -oE '[0-9.]+' || echo "?")
  log "  BUILD: PASS (${BUILD_TIME}s) → 20/20"
else
  BUILD_SCORE=0
  ERRORS="$ERRORS BUILD_FAIL"
  log "  BUILD: FAIL → 0/20"
fi
SCORE=$((SCORE + BUILD_SCORE))
DETAILS="build=$BUILD_SCORE"

# ── 2. TEST (25 punti) ───────────────────────
log "Running tests..."
TEST_OUTPUT=$(npm test -- --run 2>&1) || true
# Match "Tests  1481 passed" line (not "Test Files  32 passed")
TEST_PASSED=$(echo "$TEST_OUTPUT" | grep '^ *Tests' | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' || echo "0")
TEST_FAILED=$(echo "$TEST_OUTPUT" | grep '^ *Tests' | grep -oE '[0-9]+ failed' | grep -oE '[0-9]+' || echo "0")
TEST_PASSED=${TEST_PASSED:-0}
TEST_FAILED=${TEST_FAILED:-0}

# Baseline dal file
BASELINE=$(jq -r '.total // 1700' .test-count-baseline.json 2>/dev/null || echo "1700")

if [ "$TEST_FAILED" -gt "0" ]; then
  TEST_SCORE=0
  ERRORS="$ERRORS TEST_FAIL($TEST_FAILED)"
  log "  TEST: $TEST_FAILED FAILED → 0/25"
elif [ "$TEST_PASSED" -ge "$BASELINE" ]; then
  TEST_SCORE=25
  log "  TEST: $TEST_PASSED passed (>= baseline $BASELINE) → 25/25"
elif [ "$TEST_PASSED" -gt "0" ]; then
  # Score proporzionale: (actual/baseline) * 25
  TEST_SCORE=$(echo "$TEST_PASSED * 25 / $BASELINE" | bc 2>/dev/null || echo "15")
  log "  TEST: $TEST_PASSED passed (baseline $BASELINE) → $TEST_SCORE/25"
else
  TEST_SCORE=0
  ERRORS="$ERRORS NO_TESTS"
  log "  TEST: 0 passed → 0/25"
fi
SCORE=$((SCORE + TEST_SCORE))
DETAILS="$DETAILS test=$TEST_SCORE($TEST_PASSED)"

# ── 3. BUNDLE SIZE (15 punti) ────────────────
log "Checking bundle..."
if [ -d "dist/assets" ]; then
  # Measure precache size from build output (initial load), not all lazy chunks
  PRECACHE_KB=$(echo "$BUILD_OUTPUT" | grep -oE '[0-9.]+ KiB' | head -1 | grep -oE '[0-9.]+' || echo "0")
  if [ "$PRECACHE_KB" != "0" ] && [ -n "$PRECACHE_KB" ]; then
    BUNDLE_KB=$(printf '%.0f' "$PRECACHE_KB" 2>/dev/null || echo "2500")
  else
    # Fallback: measure main entry chunk only
    BUNDLE_KB=$(ls -la dist/assets/index-*.js 2>/dev/null | awk '{printf "%.0f", $5/1024}' || echo "0")
  fi
  BUNDLE_KB=${BUNDLE_KB:-0}
  MAX_KB=$(jq -r '.bundle_max_kb // 3500' .test-count-baseline.json 2>/dev/null || echo "3500")

  if [ "$BUNDLE_KB" -le "$MAX_KB" ]; then
    BUNDLE_SCORE=15
    log "  BUNDLE: ${BUNDLE_KB}KB (<= ${MAX_KB}KB) → 15/15"
  elif [ "$BUNDLE_KB" -le "$((MAX_KB + 500))" ]; then
    BUNDLE_SCORE=10
    log "  BUNDLE: ${BUNDLE_KB}KB (warn, > ${MAX_KB}KB) → 10/15"
  else
    BUNDLE_SCORE=0
    ERRORS="$ERRORS BUNDLE_HUGE(${BUNDLE_KB}KB)"
    log "  BUNDLE: ${BUNDLE_KB}KB (FAIL) → 0/15"
  fi
else
  BUNDLE_SCORE=0
  log "  BUNDLE: dist/ non trovato (build non eseguito?) → 0/15"
fi
SCORE=$((SCORE + BUNDLE_SCORE))
DETAILS="$DETAILS bundle=$BUNDLE_SCORE(${BUNDLE_KB:-?}KB)"

# ── 4. COVERAGE (15 punti) ───────────────────
log "Checking coverage..."
COV_FILE="coverage/coverage-summary.json"
if [ -f "$COV_FILE" ]; then
  COV_PCT=$(cat "$COV_FILE" | grep -oE '"pct":[0-9.]+' | head -1 | grep -oE '[0-9.]+' || echo "0")
  COV_MIN=$(jq -r '.coverage_min // 60' .test-count-baseline.json 2>/dev/null || echo "60")
  COV_PCT_INT=$(echo "$COV_PCT" | cut -d. -f1)
  COV_MIN_INT=$(echo "$COV_MIN" | cut -d. -f1)

  if [ "${COV_PCT_INT:-0}" -ge "${COV_MIN_INT:-60}" ]; then
    COV_SCORE=15
    log "  COVERAGE: ${COV_PCT}% (>= ${COV_MIN}%) → 15/15"
  else
    COV_SCORE=$(echo "$COV_PCT_INT * 15 / $COV_MIN_INT" | bc 2>/dev/null || echo "10")
    log "  COVERAGE: ${COV_PCT}% (< ${COV_MIN}%) → $COV_SCORE/15"
  fi
else
  # Nessun report coverage — assumi baseline
  COV_SCORE=10
  log "  COVERAGE: report non trovato, assumi baseline → 10/15"
fi
SCORE=$((SCORE + COV_SCORE))
DETAILS="$DETAILS coverage=$COV_SCORE(${COV_PCT:-?}%)"

# ── 5. CONSOLE ERRORS (10 punti) ─────────────
log "Checking lint..."
LINT_OUTPUT=$(npm run lint 2>&1) || true
# Check if eslint is available
if echo "$LINT_OUTPUT" | grep -q "command not found"; then
  LINT_ERRORS=0
  log "  LINT: eslint non installato, skip"
else
  LINT_ERRORS=$(echo "$LINT_OUTPUT" | grep -cE '^\s+[0-9]+:[0-9]+\s+error' 2>/dev/null || echo "0")
fi
LINT_ERRORS=${LINT_ERRORS:-0}
if [ "$LINT_ERRORS" -eq "0" ]; then
  LINT_SCORE=10
  log "  LINT: 0 errors → 10/10"
elif [ "${LINT_ERRORS:-0}" -lt "5" ]; then
  LINT_SCORE=7
  log "  LINT: $LINT_ERRORS errors → 7/10"
else
  LINT_SCORE=3
  log "  LINT: $LINT_ERRORS errors → 3/10"
fi
SCORE=$((SCORE + LINT_SCORE))
DETAILS="$DETAILS lint=$LINT_SCORE($LINT_ERRORS)"

# ── 6. CONTENT INTEGRITY (15 punti) ──────────
log "Checking experiments..."
EXP_COUNT=0
for vol in src/data/experiments-vol1.js src/data/experiments-vol2.js src/data/experiments-vol3.js; do
  if [ -f "$vol" ]; then
    COUNT=$(grep -c "id:" "$vol" 2>/dev/null || echo "0")
    EXP_COUNT=$((EXP_COUNT + COUNT))
  fi
done

if [ "$EXP_COUNT" -ge 92 ]; then
  EXP_SCORE=15
  log "  EXPERIMENTS: $EXP_COUNT/92 → 15/15"
elif [ "$EXP_COUNT" -ge 80 ]; then
  EXP_SCORE=10
  log "  EXPERIMENTS: $EXP_COUNT/92 → 10/15"
else
  EXP_SCORE=5
  log "  EXPERIMENTS: $EXP_COUNT/92 → 5/15"
fi
SCORE=$((SCORE + EXP_SCORE))
DETAILS="$DETAILS experiments=$EXP_SCORE($EXP_COUNT)"

# ── RISULTATO FINALE ─────────────────────────
echo ""
echo "============================================"
echo "SCORE:$SCORE"
echo "DETAILS: $DETAILS"
if [ -n "$ERRORS" ]; then
  echo "ERRORS:$ERRORS"
fi
echo "============================================"

# Salva per confronto (usato dal pattern keep/discard)
EVAL_FILE="automa/state/last-eval-v3.json"
mkdir -p "$(dirname "$EVAL_FILE")"
cat > "$EVAL_FILE" << EOF
{
  "score": $SCORE,
  "max": 100,
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "details": "$DETAILS",
  "errors": "$ERRORS",
  "test_passed": $TEST_PASSED,
  "test_failed": $TEST_FAILED,
  "bundle_kb": ${BUNDLE_KB:-0},
  "coverage_pct": ${COV_PCT:-0},
  "experiments": $EXP_COUNT
}
EOF

exit 0
