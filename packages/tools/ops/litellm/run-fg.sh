#!/bin/bash
export PATH="$HOME/litellm/venv/bin:$HOME/.local/bin:/opt/homebrew/bin:/opt/homebrew/opt/postgresql@16/bin:$PATH"
export DEEPSEEK_API_KEY=$(grep -E '^DEEPSEEK_API_KEY=' "$HOME/lessonos/.env" | head -1 | cut -d= -f2- | tr -d '"'"'"' ')
export MOONSHOT_API_KEY=$(awk '/moonshot/{f=1} f&&/api_key:/{sub(/.*api_key:[ ]*/,""); gsub(/["'"'"' ]/,""); print; exit}' "$HOME/.hermes/config.yaml")
export LITELLM_MASTER_KEY="REDACTED-LOCAL-MASTER-KEY-set-at-deploy"
export DATABASE_URL="postgresql://progettibelli@localhost:5432/litellm"
exec "$HOME/litellm/venv/bin/litellm" --config "$HOME/litellm/config.yaml" --host 127.0.0.1 --port 4000
