#!/usr/bin/env bash
#
# test-claude-mem-save.sh — Smoke test for claude-mem-save.sh
#
# Exits 0 on PASS, 1 on FAIL.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SCRIPT="$ROOT_DIR/scripts/cli-autonomous/claude-mem-save.sh"
PENDING_DIR="$ROOT_DIR/automa/state/claude-mem-pending"

FAILS=0

check() {
  local name="$1"; shift
  if "$@" >/dev/null 2>&1; then
    echo "PASS: $name"
  else
    echo "FAIL: $name"
    FAILS=$((FAILS + 1))
  fi
}

# 1. Script exists + executable
check "script exists" test -f "$SCRIPT"
check "script executable" test -x "$SCRIPT"

# 2. Invalid event rejected
check "invalid event rejected" bash -c "! $SCRIPT frobnicate 2>/dev/null"

# 3. Missing event rejected
check "missing event rejected" bash -c "! $SCRIPT 2>/dev/null"

# 4. Valid events write payload
for ev in commit end-day end-week decision blocker audit; do
  OUT="$("$SCRIPT" "$ev" test-tag-$ev 2>&1)"
  PAYLOAD_PATH="$(echo "$OUT" | sed -n 's/^Payload written: //p' | head -1)"
  if [ -n "$PAYLOAD_PATH" ] && [ -f "$PAYLOAD_PATH" ]; then
    if grep -q "\"event\": \"$ev\"" "$PAYLOAD_PATH" 2>/dev/null; then
      echo "PASS: event=$ev payload written + valid"
    else
      echo "FAIL: event=$ev payload malformed"
      FAILS=$((FAILS + 1))
    fi
    if grep -q "test-tag-$ev" "$PAYLOAD_PATH" 2>/dev/null; then
      echo "PASS: event=$ev extra-tag included"
    else
      echo "FAIL: event=$ev extra-tag missing"
      FAILS=$((FAILS + 1))
    fi
    rm -f "$PAYLOAD_PATH"
  else
    echo "FAIL: event=$ev no payload path emitted"
    FAILS=$((FAILS + 1))
  fi
done

# 5. Pending dir exists
check "pending dir exists" test -d "$PENDING_DIR"

# 6. Cleanup stale test payloads (if any)
find "$PENDING_DIR" -name "*.json" -newer "$SCRIPT" -mmin -10 2>/dev/null | while read -r f; do
  if grep -q 'test-tag' "$f" 2>/dev/null; then
    rm -f "$f"
  fi
done

echo ""
if [ "$FAILS" -eq 0 ]; then
  echo "ALL PASS"
  exit 0
else
  echo "FAILS: $FAILS"
  exit 1
fi
