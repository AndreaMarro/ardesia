#!/bin/bash
export PATH="$HOME/.local/bin:/opt/homebrew/opt/postgresql@16/bin:$PATH"
export DATABASE_URL="postgresql://progettibelli@localhost:5432/litellm"
SCHEMA=$(find "$HOME/litellm/venv" -path '*proxy/schema.prisma' 2>/dev/null | head -1)
echo "SCHEMA=$SCHEMA"
[ -f "$SCHEMA" ] || { echo "NO-SCHEMA-FOUND"; exit 1; }
echo "=== PRISMA GENERATE ==="
timeout 200 "$HOME/litellm/venv/bin/prisma" generate --schema="$SCHEMA" 2>&1 | tail -5
echo "=== PRISMA DB PUSH ==="
timeout 120 "$HOME/litellm/venv/bin/prisma" db push --schema="$SCHEMA" --skip-generate 2>&1 | tail -8
echo "=== TABLES NOW ==="
psql -d litellm -c '\dt' 2>&1 | grep -ciE "LiteLLM|table" 
psql -d litellm -c '\dt' 2>&1 | head -8
