#!/bin/bash
# LessonOS reviewer indipendente NON-compiacente via Codex gpt-5.5 (reasoning alto).
# driver-orch acceca Codex per il BRAIN (brain MAI OpenAI); come TOOL di review va riabilitato.
# Usage: ./bin/codex.sh "rivedi adversarialmente: <cosa>"
export CODEX_HOME="$HOME/.codex"
exec codex exec --skip-git-repo-check --sandbox read-only --model gpt-5.5 -c model_reasoning_effort=high "$@"
