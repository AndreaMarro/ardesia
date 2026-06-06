#!/bin/bash
# LessonOS worker/implementatore — Codex gpt-5.5 full-access (scrive codice + test).
# Auth file-based (~/.codex) = stabile anche lanciato dal processo Hermes (a differenza di claude/Opus, auth Keychain).
# Usage: ./bin/build.sh "implementa X con i suoi test"
exec codex exec --dangerously-bypass-approvals-and-sandbox --model gpt-5.5 -c model_reasoning_effort=medium "$@"
