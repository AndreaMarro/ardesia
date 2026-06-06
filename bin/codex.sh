#!/bin/bash
# LessonOS reviewer — review indipendente NON-compiacente via Codex gpt-5.5 (max reasoning).
# Usage: ./bin/codex.sh "rivedi adversarialmente: <cosa>"
exec codex exec --model gpt-5.5 -c model_reasoning_effort=high "$@"
