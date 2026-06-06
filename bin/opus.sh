#!/bin/bash
# LessonOS worker — Opus 4.8 via Claude Code (login Max OAuth, headless), con RETRY su flakiness auth.
# Usage: ./bin/opus.sh "task prompt"
# env -u ANTHROPIC_API_KEY = forza la login Max OAuth (NON auth API-key => "Not logged in").
out=""
for try in 1 2 3; do
  out=$(env -u ANTHROPIC_API_KEY claude -p --dangerously-skip-permissions --model claude-opus-4-8 "$@" 2>&1)
  if printf '%s' "$out" | grep -qiE "not logged in|please run /login|unauthorized|invalid api key"; then
    sleep $((try*5)); continue
  fi
  printf '%s\n' "$out"; exit 0
done
printf '%s\n' "$out"
exit 1
