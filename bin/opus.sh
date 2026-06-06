#!/bin/bash
# LessonOS worker — delega coding a Opus 4.8 via Claude Code (login Max OAuth, headless).
# Usage: ./bin/opus.sh "task prompt"
# NB: env -u ANTHROPIC_API_KEY = usa la login Max OAuth (NON auth API-key, che da' "Not logged in").
exec env -u ANTHROPIC_API_KEY claude -p --dangerously-skip-permissions --model claude-opus-4-8 "$@"
