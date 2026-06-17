#!/usr/bin/env bash
# push-safe.sh — Push sicuro con verifica CI
# Input: $1 = branch name (default: current branch)
# Exit: 0 = push + CI success, 1 = push fail or CI fail
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

if [[ "${1:-}" == "--help" ]]; then
  echo "Usage: push-safe.sh [branch-name] [--dry-run]"
  echo ""
  echo "Push branch to origin and verify CI passes."
  echo "Retries up to 3 times on CI failure (30s wait between)."
  echo "Exit: 0 = push + CI success, 1 = push fail or CI fail."
  exit 0
fi

DRY_RUN=false
BRANCH="${1:-$(git branch --show-current)}"
if [[ "$BRANCH" == "--dry-run" ]]; then
  DRY_RUN=true
  BRANCH=$(git branch --show-current)
fi
if [[ "${2:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

if [[ "$BRANCH" == "main" ]] || [[ "$BRANCH" == "master" ]]; then
  echo "ERROR: Cannot push directly to $BRANCH. Use a feature branch + PR."
  exit 1
fi

echo "Pushing branch: $BRANCH"

if [[ "$DRY_RUN" == "true" ]]; then
  echo "[DRY-RUN] Would push $BRANCH to origin"
  echo "[DRY-RUN] Would wait 15s then check CI"
  exit 0
fi

# Push
if ! git push origin "$BRANCH"; then
  echo "ERROR: git push failed"
  exit 1
fi

echo "Push successful. Waiting 15s for CI to start..."
sleep 15

# CI check with retry
MAX_RETRIES=3
for i in $(seq 1 $MAX_RETRIES); do
  echo "CI check attempt $i/$MAX_RETRIES..."

  # Get latest workflow run
  CI_RESULT=$(gh run list --branch "$BRANCH" --limit 1 --json conclusion,status -q '.[0]' 2>/dev/null || echo '{}')
  CI_STATUS=$(echo "$CI_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status','unknown'))" 2>/dev/null || echo "unknown")
  CI_CONCLUSION=$(echo "$CI_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('conclusion',''))" 2>/dev/null || echo "")

  if [[ "$CI_STATUS" == "completed" ]]; then
    if [[ "$CI_CONCLUSION" == "success" ]]; then
      echo "CI PASSED"
      exit 0
    else
      echo "CI FAILED (conclusion: $CI_CONCLUSION)"
      if [[ "$i" -lt "$MAX_RETRIES" ]]; then
        echo "Waiting 30s before retry..."
        sleep 30
      fi
    fi
  elif [[ "$CI_STATUS" == "in_progress" ]] || [[ "$CI_STATUS" == "queued" ]]; then
    echo "CI still running ($CI_STATUS), waiting 30s..."
    sleep 30
    # Re-check after wait
    CI_RESULT=$(gh run list --branch "$BRANCH" --limit 1 --json conclusion,status -q '.[0]' 2>/dev/null || echo '{}')
    CI_CONCLUSION=$(echo "$CI_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('conclusion',''))" 2>/dev/null || echo "")
    if [[ "$CI_CONCLUSION" == "success" ]]; then
      echo "CI PASSED"
      exit 0
    fi
    if [[ "$i" -lt "$MAX_RETRIES" ]]; then
      echo "Waiting 30s before retry..."
      sleep 30
    fi
  else
    echo "CI status unknown: $CI_STATUS"
    if [[ "$i" -lt "$MAX_RETRIES" ]]; then
      echo "Waiting 30s before retry..."
      sleep 30
    fi
  fi
done

echo "CI did not pass after $MAX_RETRIES attempts"
exit 1
