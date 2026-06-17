#!/bin/bash
export PATH="$HOME/node-local/bin:/opt/homebrew/bin:/usr/bin:/bin"
export OPENAI_API_KEY="$(cat "$HOME/litellm/.consumer-key" 2>/dev/null)"
export OPENAI_BASE_URL="http://127.0.0.1:4000/v1"
export OPENAI_MODEL="deepseek-chat"
export AGENTMEMORY_AUTO_COMPRESS=true
exec "$HOME/node-local/bin/agentmemory"
