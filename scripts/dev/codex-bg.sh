#!/bin/bash
# ════════════════════════════════════════════════════════════════
# Codex bg wrapper v2.0 — parallel implementer + verifier + reviewer
#
# Usage:
#   scripts/dev/codex-bg.sh <task-name> [options] "<4-element prompt>"
#
# Options:
#   --profile <name>   codex profile: verify | review | implement | research
#                      (defined in ~/.codex/config.toml — see CODEX-WORKFLOW.md)
#   --cd <dir>         working dir (use a git worktree for Pattern I implement)
#   -c <key=value>     codex config override (repeatable), e.g. -c model_reasoning_effort=xhigh
#
# Output: /tmp/codex-<task-name>.txt (raw stdout+stderr)
#
# The prompt MUST have 4 elements (single-line prompts return file dumps):
#   GOAL:        one sentence — what must be true at the end
#   CONTEXT:     @file mentions + "conventions in .codex/AGENTS.md"
#   CONSTRAINTS: sandbox / file ownership / vitest >= baseline / build pass
#   DONE:        concrete verifiable completion criterion
#
# Patterns (full doc: docs/dev/CODEX-WORKFLOW.md):
#   V — verify   : --profile verify   (read-only, parallel to Claude main thread)
#   R — review   : use `codex exec review` directly, not this wrapper
#   I — implement: --profile implement --cd <worktree>  (isolated, no collision)
#
# Workflow: Claude executes core task → Codex runs in parallel → Claude reads
# /tmp/codex-<task>.txt → cross-check → commit only if both agree.
# ════════════════════════════════════════════════════════════════

# NOTE: `set -u` omitted deliberately — macOS ships bash 3.2, where expanding an
# empty array (`"${CONFIG_OVERRIDES[@]}"`) under `set -u` errors with "unbound
# variable". `set -eo pipefail` gives the safety we need without that footgun.
set -eo pipefail

CODEX_BIN="$HOME/.npm-global/bin/codex"
PROJECT_DIR="${PROJECT_DIR:-/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder}"

TASK_NAME="${1:-}"
shift || true

PROFILE=""
CD_DIR="$PROJECT_DIR"
CONFIG_OVERRIDES=()
TASK_DESC=""

while [ $# -gt 0 ]; do
  case "$1" in
    --profile) PROFILE="$2"; shift 2 ;;
    --cd)      CD_DIR="$2"; shift 2 ;;
    -c)        CONFIG_OVERRIDES+=(-c "$2"); shift 2 ;;
    *)         TASK_DESC="$1"; shift ;;
  esac
done

if [ -z "$TASK_NAME" ] || [ -z "$TASK_DESC" ]; then
  echo "Usage: $0 <task-name> [--profile P] [--cd DIR] [-c k=v] '<4-element prompt>'"
  echo "Example: $0 verify-routing --profile verify \\"
  echo "  'GOAL: list dead callers of X. CONTEXT: @file. CONSTRAINTS: read-only, cite file:line. DONE: caller list or none.'"
  exit 1
fi

if [ ! -x "$CODEX_BIN" ]; then
  echo "[codex-bg] FATAL: $CODEX_BIN not installed"
  exit 1
fi

# Soft check: warn if prompt looks unstructured (missing the 4 elements)
if ! echo "$TASK_DESC" | grep -qiE 'goal:' || ! echo "$TASK_DESC" | grep -qiE 'done:'; then
  echo "[codex-bg] WARN: prompt missing GOAL:/DONE: markers — unstructured prompts return file dumps."
  echo "[codex-bg]       see docs/dev/CODEX-WORKFLOW.md 'Prompt structure'. Continuing anyway."
fi

OUTPUT_FILE="/tmp/codex-${TASK_NAME}.txt"

PROFILE_ARGS=()
[ -n "$PROFILE" ] && PROFILE_ARGS=(-p "$PROFILE")

echo "[codex-bg] Task:     $TASK_NAME"
echo "[codex-bg] Profile:  ${PROFILE:-<default>}"
echo "[codex-bg] Dir:      $CD_DIR"
echo "[codex-bg] Output:   $OUTPUT_FILE"
echo "[codex-bg] Started:  $(date -u +%Y-%m-%dT%H:%M:%SZ)"

EXIT_CODE=0
"$CODEX_BIN" exec \
  --skip-git-repo-check \
  "${PROFILE_ARGS[@]}" \
  "${CONFIG_OVERRIDES[@]}" \
  --cd "$CD_DIR" \
  "$TASK_DESC" \
  > "$OUTPUT_FILE" 2>&1 || EXIT_CODE=$?

echo "[codex-bg] Finished: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "[codex-bg] Exit:     $EXIT_CODE"
echo "[codex-bg] Size:     $(wc -l < "$OUTPUT_FILE") lines"

exit $EXIT_CODE
