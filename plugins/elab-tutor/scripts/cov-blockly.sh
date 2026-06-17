#!/usr/bin/env bash
# CoV (Chain of Verification) script for Blockly cross-compiler tests
# Runs vitest 3x on Blockly-related test files, asserts identical output,
# aborts with exit 1 if any of the 3 runs differs from the first.
#
# Manual atomic-commit gate for the Blockly cross-compiler Wave 1+ work.
# Reference: docs/prompts/PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md Sez 18
# Plan: docs/plans/2026-05-25-blockly-crosscompiler-definitivo.md

set -euo pipefail

cd "$(dirname "$0")/.."

# Default pattern covers current + forward-looking Blockly test locations.
# Vitest uses substring matching on file paths, so non-existent dirs are
# silently skipped without failing the run.
PATTERN="${1:-tests/unit/components/simulator/panels/scratch tests/unit/services/compiler tests/unit/i18n tests/unit/features/elabBlocks tests/unit/components/simulator/utils/compileCache}"

echo "=== Blockly CoV 3x ==="
echo "Pattern: $PATTERN"
echo

for i in 1 2 3; do
  echo "--- Run $i ---"
  output_file="/tmp/blockly-cov-run-$i.txt"
  # shellcheck disable=SC2086  # intentional word splitting: PATTERN is multi-path
  npx vitest run $PATTERN 2>&1 | tee "$output_file" | tail -5
  # Extract test count summary line, strip ANSI escapes for stable diff
  grep -E "Tests +[0-9]+" "$output_file" | head -1 | sed 's/\x1B\[[0-9;]*m//g' > "/tmp/blockly-cov-run-$i.summary"
done

echo
echo "=== Diff check ==="
if diff /tmp/blockly-cov-run-1.summary /tmp/blockly-cov-run-2.summary \
   && diff /tmp/blockly-cov-run-2.summary /tmp/blockly-cov-run-3.summary; then
  echo "CoV 3x IDENTICAL"
  exit 0
else
  echo "CoV FAILED - non-deterministic"
  exit 1
fi
