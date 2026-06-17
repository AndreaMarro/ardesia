#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# ELAB Guard: Critical Files Protection
# Blocks commits that modify engine files without explicit authorization.
# Invoke from pre-commit hook OR Claude Code PreToolUse Bash hook.
# Exit 0 = safe, 1 = blocked
# ═══════════════════════════════════════════════════════════════

set -e

CRITICAL_FILES=(
  "src/components/simulator/engine/CircuitSolver.js"
  "src/components/simulator/engine/AVRBridge.js"
  "src/components/simulator/engine/PlacementEngine.js"
  "src/components/simulator/canvas/SimulatorCanvas.jsx"
  "package.json"
  "vite.config.js"
)

AUTHORIZATION_TOKEN="authorized-engine-change"

if [ -t 1 ]; then
  R='\033[0;31m'; G='\033[0;32m'; Y='\033[0;33m'; N='\033[0m'
else
  R=''; G=''; Y=''; N=''
fi

# Get staged files (or files modified in the latest commit if not staged context)
STAGED=$(git diff --cached --name-only 2>/dev/null || git log -1 --name-only --pretty=format: 2>/dev/null || echo "")

if [ -z "$STAGED" ]; then
  exit 0  # nothing staged, nothing to guard
fi

CRITICAL_HIT=""
for cf in "${CRITICAL_FILES[@]}"; do
  if echo "$STAGED" | grep -qx "$cf"; then
    CRITICAL_HIT="$CRITICAL_HIT $cf"
  fi
done

if [ -z "$CRITICAL_HIT" ]; then
  exit 0  # no critical file touched
fi

# Critical file touched — check authorization token in commit message template
COMMIT_MSG_FILE="${1:-.git/COMMIT_EDITMSG}"
COMMIT_MSG=""
if [ -f "$COMMIT_MSG_FILE" ]; then
  COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")
fi

# Also check the most recent commit message (for post-commit validation)
RECENT_MSG=$(git log -1 --pretty=%B 2>/dev/null || echo "")

if echo "$COMMIT_MSG" | grep -qi "$AUTHORIZATION_TOKEN" || echo "$RECENT_MSG" | grep -qi "$AUTHORIZATION_TOKEN"; then
  echo -e "${Y}[guard] critical file(s) touched WITH authorization:${N}$CRITICAL_HIT"
  exit 0
fi

echo -e "${R}❌ BLOCKED:${N} critical file(s) modified without authorization:"
for f in $CRITICAL_HIT; do
  echo "  - $f"
done
echo ""
echo "To authorize this change, include in the commit message body:"
echo "  $AUTHORIZATION_TOKEN: <reason>"
echo ""
echo "Example:"
echo "  git commit -m \"fix(engine): patch MNA solver"
echo ""
echo "  $AUTHORIZATION_TOKEN: fixes #123 ground-node detection"
echo ""
echo "  Test: 12056/12056 PASS\""
exit 1
