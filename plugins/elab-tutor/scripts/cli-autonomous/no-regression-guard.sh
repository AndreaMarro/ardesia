#!/usr/bin/env bash
# no-regression-guard.sh — Regression guard per ogni azione critica
# Input: $1 = action (commit|push|merge|deploy|post-deploy)
# Output: stdout verdict
# Exit: 0 = via libera, 1 = ABORT + detail why
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

if [[ "${1:-}" == "--help" ]]; then
  echo "Usage: no-regression-guard.sh <action> [--dry-run]"
  echo ""
  echo "Regression guard for critical actions."
  echo "Actions: commit, push, merge, deploy, post-deploy"
  echo "Exit: 0 = via libera, 1 = ABORT."
  echo ""
  echo "Reads baseline from automa/state/baseline.json."
  echo "Compares current test count against baseline."
  exit 0
fi

ACTION="${1:-commit}"
DRY_RUN=false
if [[ "${2:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

# Read baseline
BASELINE_COUNT=12131
if [[ -f automa/state/baseline.json ]]; then
  BASELINE_COUNT=$(python3 -c "import json; print(json.load(open('automa/state/baseline.json')).get('test_count', 12131))" 2>/dev/null || echo 12131)
fi

echo "=== No-Regression Guard ==="
echo "Action: $ACTION"
echo "Baseline: $BASELINE_COUNT tests"
echo ""

ABORT=false
REASON=""

case "$ACTION" in
  commit)
    if [[ "$DRY_RUN" == "true" ]]; then
      echo "[DRY-RUN] Would run vitest + build check"
      exit 0
    fi
    # Quick vitest run
    echo "Running vitest..."
    VITEST_OUT=$(npx vitest run --reporter=dot 2>&1 || true)
    CURRENT_COUNT=$(echo "$VITEST_OUT" | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' || echo 0)
    echo "Current: $CURRENT_COUNT tests"

    if [[ "$CURRENT_COUNT" -lt "$BASELINE_COUNT" ]]; then
      ABORT=true
      REASON="Test regression: $CURRENT_COUNT < $BASELINE_COUNT (lost $((BASELINE_COUNT - CURRENT_COUNT)) tests)"
    fi

    # Build check
    if ! npm run build >/dev/null 2>&1; then
      ABORT=true
      REASON="${REASON:+$REASON; }Build failed"
    fi
    ;;

  push)
    if [[ "$DRY_RUN" == "true" ]]; then
      echo "[DRY-RUN] Would run CoV 3x vitest"
      exit 0
    fi
    # CoV 3x
    for i in 1 2 3; do
      echo "CoV run $i/3..."
      VITEST_OUT=$(npx vitest run --reporter=dot 2>&1 || true)
      CURRENT_COUNT=$(echo "$VITEST_OUT" | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' || echo 0)
      FAILED=$(echo "$VITEST_OUT" | grep -oE '[0-9]+ failed' | grep -oE '[0-9]+' || echo 0)
      echo "  Run $i: $CURRENT_COUNT passed, $FAILED failed"

      if [[ "$CURRENT_COUNT" -lt "$BASELINE_COUNT" ]]; then
        ABORT=true
        REASON="CoV run $i failed: $CURRENT_COUNT < $BASELINE_COUNT"
        break
      fi
    done
    ;;

  merge)
    if [[ "$DRY_RUN" == "true" ]]; then
      echo "[DRY-RUN] Would verify CI + test count"
      exit 0
    fi
    # Check CI status
    CI_CONCLUSION=$(gh run list --branch "$(git branch --show-current)" --limit 1 --json conclusion -q '.[0].conclusion' 2>/dev/null || echo "unknown")
    if [[ "$CI_CONCLUSION" != "success" ]]; then
      ABORT=true
      REASON="CI not green: $CI_CONCLUSION"
    fi
    ;;

  deploy)
    if [[ "$DRY_RUN" == "true" ]]; then
      echo "[DRY-RUN] Would verify build + baseline"
      exit 0
    fi
    if ! npm run build >/dev/null 2>&1; then
      ABORT=true
      REASON="Build failed"
    fi
    ;;

  post-deploy)
    if [[ "$DRY_RUN" == "true" ]]; then
      echo "[DRY-RUN] Would verify prod URL HTTP 200"
      exit 0
    fi
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://www.elabtutor.school" || echo "000")
    if [[ "$HTTP_STATUS" != "200" ]]; then
      ABORT=true
      REASON="Prod not responding: HTTP $HTTP_STATUS"
    fi
    ;;

  *)
    echo "ERROR: Unknown action '$ACTION'"
    echo "Valid actions: commit, push, merge, deploy, post-deploy"
    exit 1
    ;;
esac

if [[ "$ABORT" == "true" ]]; then
  echo ""
  echo "ABORT: $REASON"
  echo "Action '$ACTION' blocked by regression guard."
  exit 1
else
  echo ""
  echo "PASS: No regression detected. Action '$ACTION' approved."
  exit 0
fi
