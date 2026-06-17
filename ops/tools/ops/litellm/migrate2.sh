#!/bin/bash
export PATH="$HOME/litellm/venv/bin:$HOME/.local/bin:/opt/homebrew/opt/postgresql@16/bin:$PATH"
export DATABASE_URL="postgresql://progettibelli@localhost:5432/litellm"
SCHEMA=$(find "$HOME/litellm/venv" -path '*proxy/schema.prisma' 2>/dev/null | head -1)
echo "=== GENERATE (venv/bin on PATH) ==="
timeout 220 prisma generate --schema="$SCHEMA" 2>&1 | tail -6
echo "=== CLIENT IMPORT TEST ==="
"$HOME/litellm/venv/bin/python" -c "from prisma import Prisma; print('PRISMA-CLIENT-OK')" 2>&1 | tail -3
