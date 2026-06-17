#!/bin/bash
# LessonOS worker = Claude Code (claude -p) — il BUILDER del ladder.
# Hermes-DeepSeek ORCHESTRA e delega il BUILD qui: questo script chiama Claude Code.
# Hermes sanitizza l'env del subprocess -> CLAUDE_CODE_OAUTH_TOKEN (in ~/.zshenv) non arriva
# a claude -p => "Not logged in". Quindi lo RE-INIETTIAMO da .zshenv se manca.
# Usage: ./bin/worker.sh <tier> "task"   (tier: haiku|sonnet|opus)
tier="${1:-sonnet}"; shift
case "$tier" in
  haiku) m="claude-haiku-4-5";;
  opus)  m="claude-opus-4-8";;
  *)     m="claude-sonnet-4-5";;
esac
if [ -z "${CLAUDE_CODE_OAUTH_TOKEN:-}" ]; then
  eval "$(grep -E '^[[:space:]]*export[[:space:]]+CLAUDE_CODE_OAUTH_TOKEN=' "$HOME/.zshenv" 2>/dev/null | tail -1)"
fi
exec env -u ANTHROPIC_API_KEY claude -p --dangerously-skip-permissions --model "$m" "$@"
