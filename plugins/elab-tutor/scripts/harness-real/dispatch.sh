#!/usr/bin/env bash
# scripts/harness-real/dispatch.sh — Mac Mini cron 12h regression dispatch
# Sprint T iter 21
#
# USAGE (Mac Mini autonomous loop):
#   bash scripts/harness-real/dispatch.sh
#
# CRON (Mac Mini, every 12h at 02:00 + 14:00):
#   0 2,14 * * *  /bin/bash /Users/progettibelli/elab/scripts/harness-real/dispatch.sh \
#                 >> /tmp/harness-real-dispatch.log 2>&1
#
# OUTPUT:
#   - automa/state/iter-21-harness-real/results-<UTC>.jsonl
#   - automa/state/iter-21-harness-real/playwright-report-<UTC>.json
#   - tests/e2e/snapshots/iter-21-real-harness/*.png (overwritten each run)
#   - alert via stdout if >20% experiments fail (caller redirects to log)
#
# EXIT CODES:
#   0 = run completed (regardless of test failures — failures are data, not infra fail)
#   1 = playwright/setup error (infra failure, alertable)

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

UTC_TS="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_DIR="$REPO_ROOT/automa/state/iter-21-harness-real"
mkdir -p "$OUT_DIR"

RESULTS_OVERRIDE="$OUT_DIR"
JSONL_TARGET="$OUT_DIR/results-$UTC_TS.jsonl"

echo "[$UTC_TS] harness-real dispatch start" >&2
echo "[$UTC_TS] PROD_URL=${ELAB_PROD_URL:-https://www.elabtutor.school}" >&2

# Run full 87 esperimenti. NO --grep — full coverage.
# ELAB_HARNESS_REAL_DIR override results dir to keep the run-scoped path.
ELAB_PROD_URL="${ELAB_PROD_URL:-https://www.elabtutor.school}" \
ELAB_HARNESS_REAL_DIR="$RESULTS_OVERRIDE" \
  npx playwright test \
    --config tests/e2e/playwright.harness-real.config.js \
    2>&1 | tee "$OUT_DIR/dispatch-$UTC_TS.log"
PW_EXIT=${PIPESTATUS[0]}

# Move the JSONL aside under timestamped name (spec writes to results.jsonl)
if [ -f "$OUT_DIR/results.jsonl" ]; then
  mv "$OUT_DIR/results.jsonl" "$JSONL_TARGET"
fi

# Move playwright JSON report aside under timestamp
if [ -f "$OUT_DIR/playwright-report.json" ]; then
  mv "$OUT_DIR/playwright-report.json" "$OUT_DIR/playwright-report-$UTC_TS.json"
fi

# Quick pass/fail tally for cron alert (skip _meta line)
if [ -f "$JSONL_TARGET" ]; then
  TOTAL=$(grep -c '"experiment_id"' "$JSONL_TARGET" || true)
  PASS=$(grep -c '"pass":true' "$JSONL_TARGET" || true)
  FAIL=$(( TOTAL - PASS ))
  echo "[$UTC_TS] tally total=$TOTAL pass=$PASS fail=$FAIL" >&2
  # Alert if >20% fail (production health signal)
  if [ "$TOTAL" -gt 0 ]; then
    FAIL_PCT=$(( FAIL * 100 / TOTAL ))
    if [ "$FAIL_PCT" -gt 20 ]; then
      echo "[$UTC_TS] ALERT: ${FAIL_PCT}% experiments failing on prod" >&2
    fi
  fi
fi

# Playwright nonzero is OK (test failures != infra fail).
# We only surface infra exit codes (e.g. 130 SIGINT, 2 config err).
case "$PW_EXIT" in
  0|1) exit 0 ;;  # 0 = all pass; 1 = some test failed (still data)
  *)   echo "[$UTC_TS] INFRA EXIT $PW_EXIT" >&2 ; exit 1 ;;
esac
