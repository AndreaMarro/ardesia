#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# ELAB Anti-Regression Gate — v2 (hardened 2026-04-17)
# Run BEFORE and AFTER any code change.
# Exit 0 = safe, 1 = regression detected
# Writes: automa/state/gate-result.json
# Used by: pre-commit hook, .claude/settings.local.json Stop hook, CI manual
# ═══════════════════════════════════════════════════════════════

set -e

# Colors (disable if not TTY)
if [ -t 1 ]; then
  R='\033[0;31m'; G='\033[0;32m'; Y='\033[0;33m'; C='\033[0;36m'; N='\033[0m'
else
  R=''; G=''; Y=''; C=''; N=''
fi

cd "$(dirname "$0")/.."

GATE_FILE="automa/state/gate-result.json"
BASELINE_JSON="automa/state/baseline.json"
BASELINE_CI=".test-count-baseline.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Defaults
SKIP_BUILD="${SKIP_BUILD:-0}"
SKIP_SITE="${SKIP_SITE:-0}"
SITE_TIMEOUT="${SITE_TIMEOUT:-5}"

echo -e "${C}[GATE]${N} Anti-regression check — $TIMESTAMP"

# ─────────────────────────────────────────
# 1. READ BASELINE (prefer .test-count-baseline.json as source of truth)
# ─────────────────────────────────────────
BASELINE_TESTS=0
BASELINE_SOURCE="none"
REGRESSION_THRESHOLD_PCT=0.005
REGRESSION_THRESHOLD_ABS=50

if [ -f "$BASELINE_CI" ]; then
  BASELINE_TESTS=$(python3 -c "import json; d=json.load(open('$BASELINE_CI')); print(d.get('total', 0))" 2>/dev/null || echo "0")
  REGRESSION_THRESHOLD_PCT=$(python3 -c "import json; d=json.load(open('$BASELINE_CI')); print(d.get('regression_threshold', 0.005))" 2>/dev/null || echo "0.005")
  REGRESSION_THRESHOLD_ABS=$(python3 -c "import json; d=json.load(open('$BASELINE_CI')); print(d.get('regression_threshold_absolute', 50))" 2>/dev/null || echo "50")
  BASELINE_SOURCE="$BASELINE_CI"
elif [ -f "$BASELINE_JSON" ]; then
  BASELINE_TESTS=$(python3 -c "import json; d=json.load(open('$BASELINE_JSON')); t=d.get('tests', 0); print(t if isinstance(t,int) else 0)" 2>/dev/null || echo "0")
  BASELINE_SOURCE="$BASELINE_JSON"
fi

echo -e "${C}[GATE]${N} Baseline: ${BASELINE_TESTS} test (source: $BASELINE_SOURCE)"

# ─────────────────────────────────────────
# 2. RUN TESTS
# ─────────────────────────────────────────
echo -e "${C}[GATE]${N} Running tests (npx vitest run)..."
TEST_OUTPUT=$(npx vitest run 2>&1 | tail -10)
# "Tests  X passed" (test count) vs "Test Files X passed" (files count)
TEST_COUNT=$(echo "$TEST_OUTPUT" | grep -E '^[[:space:]]*Tests[[:space:]]' | grep -oE '[0-9]+ passed' | head -1 | grep -oE '[0-9]+' || echo "0")
TEST_FAIL=$(echo "$TEST_OUTPUT" | grep -E '^[[:space:]]*Tests[[:space:]]' | grep -oE '[0-9]+ failed' | head -1 | grep -oE '[0-9]+' || echo "0")
TEST_FILES=$(echo "$TEST_OUTPUT" | grep -oE 'Test Files[[:space:]]+[0-9]+ passed' | grep -oE '[0-9]+' | head -1 || echo "0")

[ -z "$TEST_COUNT" ] && TEST_COUNT=0
[ -z "$TEST_FAIL" ] && TEST_FAIL=0
[ -z "$TEST_FILES" ] && TEST_FILES=0

if [ "$TEST_COUNT" -gt 0 ]; then
  echo -e "${G}[GATE]${N} Tests: ${TEST_COUNT} passed, ${TEST_FAIL} failed, ${TEST_FILES} files"
else
  echo -e "${R}[GATE]${N} WARNING: could not parse test count from output"
  echo "$TEST_OUTPUT" | head -5
fi

# ─────────────────────────────────────────
# 3. EVALUATE REGRESSION
# ─────────────────────────────────────────
REGRESSION=false
REASONS=()

# 3a. Any test failures → BLOCK
if [ "$TEST_FAIL" -gt 0 ]; then
  REGRESSION=true
  REASONS+=("${TEST_FAIL} test FALLITI")
fi

# 3b. Absolute test count drop > threshold_abs
if [ "$BASELINE_TESTS" -gt 0 ] && [ "$TEST_COUNT" -lt "$BASELINE_TESTS" ]; then
  DROP=$((BASELINE_TESTS - TEST_COUNT))
  if [ "$DROP" -gt "$REGRESSION_THRESHOLD_ABS" ]; then
    REGRESSION=true
    REASONS+=("Test count -${DROP} (baseline ${BASELINE_TESTS} → ${TEST_COUNT}, threshold abs ${REGRESSION_THRESHOLD_ABS})")
  else
    # Percentage check (soft)
    DROP_PCT=$(python3 -c "print($DROP / $BASELINE_TESTS)" 2>/dev/null || echo "0")
    PCT_EXCEEDED=$(python3 -c "print(1 if $DROP_PCT > $REGRESSION_THRESHOLD_PCT else 0)" 2>/dev/null || echo "0")
    if [ "$PCT_EXCEEDED" = "1" ]; then
      REGRESSION=true
      REASONS+=("Test count -${DROP} (${DROP_PCT} > ${REGRESSION_THRESHOLD_PCT})")
    fi
  fi
fi

# ─────────────────────────────────────────
# 4. BUILD CHECK (skip if tests already regressed or SKIP_BUILD=1)
# ─────────────────────────────────────────
BUILD_STATUS="SKIP"
if [ "$REGRESSION" = false ] && [ "$SKIP_BUILD" != "1" ]; then
  echo -e "${C}[GATE]${N} Running build (npm run build)..."
  if npm run build > /tmp/elab-build.log 2>&1; then
    BUILD_STATUS="PASS"
    echo -e "${G}[GATE]${N} Build PASS"
  else
    BUILD_STATUS="FAIL"
    REGRESSION=true
    REASONS+=("Build FAILED — check /tmp/elab-build.log")
    echo -e "${R}[GATE]${N} Build FAILED"
    tail -10 /tmp/elab-build.log
  fi
fi

# ─────────────────────────────────────────
# 5. SITE CHECK (optional, skippable)
# ─────────────────────────────────────────
SITE_STATUS="SKIP"
if [ "$SKIP_SITE" != "1" ]; then
  SITE_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$SITE_TIMEOUT" https://www.elabtutor.school 2>/dev/null || echo "0")
  SITE_STATUS="$SITE_CODE"
  if [ "$SITE_CODE" = "200" ]; then
    echo -e "${G}[GATE]${N} Site: 200 OK"
  else
    echo -e "${Y}[GATE]${N} Site: $SITE_CODE (warning, not blocking)"
  fi
fi

# ─────────────────────────────────────────
# 6. WRITE RESULT
# ─────────────────────────────────────────
REASON_STR=$(IFS="; "; echo "${REASONS[*]}")
VERDICT=$([ "$REGRESSION" = true ] && echo "BLOCKED" || echo "PASS")

mkdir -p "$(dirname "$GATE_FILE")"
cat > "$GATE_FILE" <<EOF
{
  "timestamp": "$TIMESTAMP",
  "tests": $TEST_COUNT,
  "testsFailed": $TEST_FAIL,
  "testFiles": $TEST_FILES,
  "baseline": $BASELINE_TESTS,
  "baselineSource": "$BASELINE_SOURCE",
  "buildStatus": "$BUILD_STATUS",
  "siteStatus": "$SITE_STATUS",
  "regression": $REGRESSION,
  "reason": "$REASON_STR",
  "verdict": "$VERDICT",
  "thresholds": {
    "regressionPct": $REGRESSION_THRESHOLD_PCT,
    "regressionAbs": $REGRESSION_THRESHOLD_ABS
  }
}
EOF

# ─────────────────────────────────────────
# 7. UPDATE BASELINE ratchet (only if grew)
# ─────────────────────────────────────────
if [ "$REGRESSION" = false ] && [ "$TEST_COUNT" -gt "$BASELINE_TESTS" ]; then
  COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
  python3 <<PYEOF
import json
try:
    with open("$BASELINE_CI", "r") as f:
        d = json.load(f)
except Exception:
    d = {}
d["total"] = $TEST_COUNT
d["date"] = "$(date -u +%Y-%m-%d)"
d["commit"] = "$COMMIT"
d["test_files"] = $TEST_FILES
with open("$BASELINE_CI", "w") as f:
    json.dump(d, f, indent=2, ensure_ascii=False)
PYEOF
  echo -e "${G}[GATE]${N} Baseline RATCHET: $BASELINE_TESTS → $TEST_COUNT (commit $COMMIT)"
fi

# ─────────────────────────────────────────
# 8. EXIT
# ─────────────────────────────────────────
if [ "$REGRESSION" = true ]; then
  echo -e "${R}[GATE] ✗ BLOCKED${N} — $REASON_STR"
  echo -e "${Y}[GATE]${N} ACTION: 'git stash' per isolare, 'git checkout -- <file>' per revert"
  exit 1
fi

echo -e "${G}[GATE] ✓ PASS${N} — ${TEST_COUNT} tests, build ${BUILD_STATUS}, site ${SITE_STATUS}"
exit 0
