#!/bin/bash
# elab-demo-guardrails: PreToolUse/Bash
# Block destructive ops on feat/demo-25may branch.

input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)
cwd=$(echo "$input" | jq -r '.tool_input.cwd // empty' 2>/dev/null)

# Determine current branch
if [[ -n "$cwd" && -d "$cwd/.git" ]] || [[ -n "$cwd" && -e "$cwd/.git" ]]; then
  branch=$(cd "$cwd" 2>/dev/null && git branch --show-current 2>/dev/null)
else
  branch=$(git branch --show-current 2>/dev/null || echo "unknown")
fi

if [[ "$branch" == "feat/demo-25may" ]] || [[ "$branch" == feat/demo-25may-* ]]; then
  # Block destructive patterns
  if echo "$command" | grep -qE "git reset --hard|git clean -fd|git push --force|git push -f|git checkout --|git restore --|rm -rf src/|rm -rf node_modules|rm -rf \.git"; then
    echo "BLOCKED: destructive op on demo branch '$branch': $command" >&2
    exit 2
  fi
  # Block --no-verify
  if echo "$command" | grep -qE "git commit.*--no-verify|git push.*--no-verify"; then
    echo "BLOCKED: --no-verify forbidden on demo branch" >&2
    exit 2
  fi
fi
exit 0
