#!/usr/bin/env bash
# Smoke test for watchdog ops scripts.
# Validates: bash syntax, JSON config schema, workflow YAML structure,
# and that orchestrator can invoke checks without crashing.
# Run: bash tests/ops/watchdog-smoke.test.sh
# Exit 0 on PASS, 1 on FAIL.

set -uo pipefail

PASS=0
FAIL=0

assert() {
  local name="$1"
  local cmd="$2"
  if eval "$cmd" >/dev/null 2>&1; then
    echo "  ✅ $name"
    PASS=$((PASS + 1))
  else
    echo "  ❌ $name"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== Watchdog smoke tests ==="

echo ""
echo "Group 1: Bash syntax validation"
assert "watchdog-run.sh syntax" "bash -n scripts/watchdog-run.sh"
assert "watchdog-checks.sh syntax" "bash -n scripts/watchdog-checks.sh"
assert "setup-labels.sh syntax" "bash -n scripts/setup-labels.sh"

echo ""
echo "Group 2: JSON config schema"
assert "config parseable" "jq . .watchdog-config.json"
assert "config has prod_url" "jq -e '.prod_url' .watchdog-config.json"
assert "config has supabase_edge_base" "jq -e '.supabase_edge_base' .watchdog-config.json"
assert "config has edge_functions array" "jq -e '.edge_functions | type == \"array\"' .watchdog-config.json"
assert "config has principio_zero_v3_patterns" "jq -e '.principio_zero_v3_patterns' .watchdog-config.json"
assert "config has thresholds" "jq -e '.thresholds' .watchdog-config.json"
assert "config has github_repo" "jq -e '.github_repo' .watchdog-config.json"

echo ""
echo "Group 3: PZ v3 patterns content"
REQUIRED_COUNT=$(jq -r '.principio_zero_v3_patterns.required_any_of | length' .watchdog-config.json)
FORBIDDEN_COUNT=$(jq -r '.principio_zero_v3_patterns.forbidden | length' .watchdog-config.json)
assert "PZ v3 has required_any_of patterns" "[ $REQUIRED_COUNT -gt 0 ]"
assert "PZ v3 has forbidden patterns" "[ $FORBIDDEN_COUNT -gt 0 ]"
assert "PZ v3 'Ragazzi' in required" "jq -r '.principio_zero_v3_patterns.required_any_of[]' .watchdog-config.json | grep -q 'Ragazzi'"
assert "PZ v3 'Docente, leggi' in forbidden" "jq -r '.principio_zero_v3_patterns.forbidden[]' .watchdog-config.json | grep -q 'Docente'"

echo ""
echo "Group 4: Workflow YAML structure"
assert "workflow file exists" "[ -f .github/workflows/watchdog.yml ]"
assert "workflow has cron schedule" "grep -q 'cron:' .github/workflows/watchdog.yml"
assert "workflow has workflow_dispatch" "grep -q 'workflow_dispatch:' .github/workflows/watchdog.yml"
assert "workflow has permissions block" "grep -q 'permissions:' .github/workflows/watchdog.yml"
assert "workflow has concurrency group" "grep -q 'concurrency:' .github/workflows/watchdog.yml"

echo ""
echo "Group 5: Scripts executable bit"
assert "watchdog-run.sh executable" "[ -x scripts/watchdog-run.sh ]"
assert "watchdog-checks.sh executable" "[ -x scripts/watchdog-checks.sh ]"
assert "setup-labels.sh executable" "[ -x scripts/setup-labels.sh ]"

echo ""
echo "Group 6: Required helpers in run.sh"
assert "log_anomaly defined" "grep -q '^log_anomaly()' scripts/watchdog-run.sh"
assert "log_ok defined" "grep -q '^log_ok()' scripts/watchdog-run.sh"
assert "exports helpers" "grep -q 'export -f log_anomaly log_ok' scripts/watchdog-run.sh"
assert "always exit 0" "grep -q 'exit 0$' scripts/watchdog-run.sh"

echo ""
echo "Group 7: Required checks in checks.sh"
assert "production HTTP check" "grep -q 'CHECK 1: production' scripts/watchdog-checks.sh"
assert "Edge Functions CORS check" "grep -q 'CHECK 2: Edge Functions' scripts/watchdog-checks.sh"
assert "PR draft stuck check" "grep -q 'CHECK 3: PR draft stuck' scripts/watchdog-checks.sh"
assert "CI failures lookback" "grep -q 'CHECK 4: CI failures' scripts/watchdog-checks.sh"

echo ""
echo "=== Result: $PASS PASS / $FAIL FAIL ==="

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
exit 0
