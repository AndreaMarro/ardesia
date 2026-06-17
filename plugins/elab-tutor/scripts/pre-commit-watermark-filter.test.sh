#!/usr/bin/env bash
# Smoke test for pre-commit-watermark-filter.sh
# Creates a throwaway git repo, stages watermark-only + mixed-diff files,
# runs the filter in --dry-run, asserts candidate count.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FILTER="$SCRIPT_DIR/pre-commit-watermark-filter.sh"

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

cd "$TMP"
git init -q
git config user.email test@test.local
git config user.name test

# File 1: watermark-only diff (detected)
cat > wm-only.js <<'EOF'
// © Andrea Marro — 17/04/2026
function foo() { return 1; }
EOF
git add wm-only.js
git commit -qm 'initial wm-only'
cat > wm-only.js <<'EOF'
// © Andrea Marro — 21/04/2026
function foo() { return 1; }
EOF

# File 2: mixed diff (NOT detected)
cat > mixed.js <<'EOF'
// © Andrea Marro — 17/04/2026
function bar() { return 2; }
EOF
git add mixed.js
git commit -qm 'initial mixed'
cat > mixed.js <<'EOF'
// © Andrea Marro — 21/04/2026
function bar() { return 99; }
EOF

# File 3: no watermark, real change (NOT detected)
cat > real.js <<'EOF'
function baz() { return 3; }
EOF
git add real.js
git commit -qm 'initial real'
cat > real.js <<'EOF'
function baz() { return 30; }
EOF

OUT=$(bash "$FILTER" --dry-run --working 2>&1)
COUNT=$(echo "$OUT" | grep -c '^  - ' || true)

echo "--- OUTPUT ---"
echo "$OUT"
echo "--- ASSERTIONS ---"

if [ "$COUNT" -ne 1 ]; then
  echo "FAIL: expected 1 candidate, got $COUNT"
  exit 1
fi

if ! echo "$OUT" | grep -q 'wm-only.js'; then
  echo "FAIL: wm-only.js not detected"
  exit 1
fi

if echo "$OUT" | grep -q '  - mixed.js'; then
  echo "FAIL: mixed.js falsely detected"
  exit 1
fi

if echo "$OUT" | grep -q '  - real.js'; then
  echo "FAIL: real.js falsely detected"
  exit 1
fi

echo "PASS: filter correctly isolates watermark-only diffs"
exit 0
