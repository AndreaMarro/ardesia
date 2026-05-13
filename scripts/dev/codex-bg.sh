#!/bin/bash
# ════════════════════════════════════════════════════════════════
# Codex bg wrapper — parallel offline code analysis layer
#
# Usage:
#   scripts/dev/codex-bg.sh <task-name> "<task description>"
#
# Outputs: /tmp/codex-<task-name>.txt (raw output)
#
# Best for:
#   ✓ "find function X in dir Y"
#   ✓ "verify regex pattern matches example inputs"
#   ✓ "list files touching symbol Z"
#   ✓ "check if function Q has dead code path"
#   ✓ "compile-check TypeScript file W"
#
# Anti-pattern (returns source dumps, not analysis):
#   ✗ "write comprehensive report on..."
#   ✗ "analyze architecture..."
#   ✗ "synthesize findings..."
#
# Workflow:
#   1. Claude main thread executes core task
#   2. Codex bg verifies independently (parallel)
#   3. Claude reads /tmp/codex-<task>.txt
#   4. Cross-check + synth manuale
#   5. Commit + push only if both agree
#
# Reference: docs/dev/CODEX-WORKFLOW.md
# ════════════════════════════════════════════════════════════════

set -e

TASK_NAME="${1:-default}"
TASK_DESC="${2:-}"
PROJECT_DIR="${PROJECT_DIR:-/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder}"
OUTPUT_FILE="/tmp/codex-${TASK_NAME}.txt"

if [ -z "$TASK_DESC" ]; then
  echo "Usage: $0 <task-name> '<task description>'"
  echo "Example: $0 verify-vertex 'find isVertexEUEnabled callers in supabase/functions'"
  exit 1
fi

if [ ! -x "$HOME/.npm-global/bin/codex" ]; then
  echo "[codex-bg] FATAL: ~/.npm-global/bin/codex not installed"
  exit 1
fi

echo "[codex-bg] Task: $TASK_NAME"
echo "[codex-bg] Output: $OUTPUT_FILE"
echo "[codex-bg] Started at: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Run codex bg, capture stdout+stderr, no DNS (sandbox-mode workspace-write)
"$HOME/.npm-global/bin/codex" exec \
  --skip-git-repo-check \
  --sandbox workspace-write \
  --cd "$PROJECT_DIR" \
  "$TASK_DESC" \
  > "$OUTPUT_FILE" 2>&1

EXIT_CODE=$?
echo "[codex-bg] Completed at: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "[codex-bg] Exit code: $EXIT_CODE"
echo "[codex-bg] Output size: $(wc -l < "$OUTPUT_FILE") lines"

exit $EXIT_CODE
