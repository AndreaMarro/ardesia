#!/usr/bin/env bash
# pre-commit-watermark-filter.sh
#
# BLOCKER-003 mitigation (Day 11 sett-2 P0-3).
#
# Detects staged (or working-tree) files whose ONLY changes vs HEAD are
# copyright date-bump watermarks of the form:
#   © Andrea Marro — DD/MM/YYYY
# ...and restores them via `git checkout HEAD -- <file>` so the commit
# stays semantic-pure.
#
# Modes:
#   --dry-run   : report candidates, no-op
#   --staged    : scan index (git diff --cached); default
#   --working   : scan working tree (git diff)
#   --help      : usage
#
# Exit codes:
#   0  : success (0 or more files restored)
#   1  : usage error
#   2  : git command error
#
# Author: Claude Code headless loop — Andrea Marro — 21/04/2026

set -euo pipefail

MODE="staged"
DRY_RUN=0
VERBOSE=0

usage() {
  cat <<USAGE
Usage: $0 [--dry-run] [--staged|--working] [--verbose]

Detects files with watermark-only (copyright date-bump) diffs and restores
them to HEAD to prevent copyright-noise commits (BLOCKER-003 pattern).

Options:
  --dry-run   List candidates without restoring
  --staged    Scan 'git diff --cached' (default)
  --working   Scan 'git diff' (unstaged)
  --verbose   Show per-file diff analysis
  --help      Show this message

Examples:
  $0 --dry-run --working
  $0 --staged
USAGE
}

while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=1 ;;
    --staged) MODE="staged" ;;
    --working) MODE="working" ;;
    --verbose) VERBOSE=1 ;;
    --help|-h) usage; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; usage; exit 1 ;;
  esac
  shift
done

if [ "$MODE" = "staged" ]; then
  DIFF_CMD="git diff --cached"
  FILES_CMD="git diff --cached --name-only --diff-filter=M"
else
  DIFF_CMD="git diff"
  FILES_CMD="git diff --name-only --diff-filter=M"
fi

CANDIDATES=()
SKIPPED=0

# Watermark signature: line contains "Andrea Marro" AND a dd/mm/yyyy date.
# We check for BOTH substrings to avoid false positives on any "Andrea"
# or any date alone.
is_watermark_line() {
  local line="$1"
  if echo "$line" | grep -qE 'Andrea[[:space:]]+Marro' \
     && echo "$line" | grep -qE '[0-9]{2}/[0-9]{2}/[0-9]{4}'; then
    return 0
  fi
  return 1
}

while IFS= read -r file; do
  [ -z "$file" ] && continue
  [ ! -f "$file" ] && continue

  # Extract diff +/- lines only (skip file headers ++ / --)
  DIFF_LINES=$($DIFF_CMD -- "$file" 2>/dev/null | grep -E '^[+-]' | grep -Ev '^(\+\+\+|---)' || true)
  if [ -z "$DIFF_LINES" ]; then
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  TOTAL_LINES=$(printf '%s\n' "$DIFF_LINES" | wc -l | tr -d ' ')
  WATERMARK_LINES=0

  while IFS= read -r diffline; do
    [ -z "$diffline" ] && continue
    if is_watermark_line "$diffline"; then
      WATERMARK_LINES=$((WATERMARK_LINES + 1))
    fi
  done <<< "$DIFF_LINES"

  if [ "$VERBOSE" -eq 1 ]; then
    echo "FILE: $file | total_diff=$TOTAL_LINES | watermark=$WATERMARK_LINES"
  fi

  # Watermark-only if ALL diff lines are watermark
  if [ "$TOTAL_LINES" -gt 0 ] && [ "$WATERMARK_LINES" -eq "$TOTAL_LINES" ]; then
    CANDIDATES+=("$file")
  fi
done < <($FILES_CMD)

COUNT=${#CANDIDATES[@]}

if [ "$COUNT" -eq 0 ]; then
  echo "[watermark-filter] no watermark-only diffs detected (mode=$MODE)"
  exit 0
fi

echo "[watermark-filter] $COUNT file(s) with watermark-only diff (mode=$MODE)"
for f in "${CANDIDATES[@]}"; do
  echo "  - $f"
done

if [ "$DRY_RUN" -eq 1 ]; then
  echo "[watermark-filter] DRY-RUN: no files restored"
  exit 0
fi

# Restore mode
for f in "${CANDIDATES[@]}"; do
  if [ "$MODE" = "staged" ]; then
    git restore --staged -- "$f" 2>/dev/null || true
  fi
  git checkout HEAD -- "$f" 2>/dev/null || {
    echo "[watermark-filter] WARN: cannot restore $f" >&2
  }
done

echo "[watermark-filter] restored $COUNT file(s) to HEAD"
exit 0
