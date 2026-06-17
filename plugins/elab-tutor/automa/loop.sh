#!/bin/bash
# ELAB Automa — Loop minimo che GIRA
# Manda 10 messaggi al nanobot, giudica le risposte, produce report
# Uso: bash automa/loop.sh

set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
REPORT_DIR="$DIR/reports/nightly"
mkdir -p "$REPORT_DIR"
DATE=$(date +%Y-%m-%d_%H%M)
REPORT="$REPORT_DIR/$DATE.json"
NANOBOT="https://elab-galileo.onrender.com"

echo "=== ELAB AUTOMA LOOP — $DATE ==="
echo ""

# 1. Health check
echo -n "Health check nanobot... "
HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$NANOBOT/health" --max-time 10)
if [ "$HTTP" != "200" ]; then
    echo "FAIL ($HTTP)"
    echo "{\"date\":\"$DATE\",\"health\":\"FAIL\",\"code\":$HTTP}" > "$REPORT"
    exit 1
fi
echo "OK (200)"

# 2. Manda 10 messaggi e raccogli risposte
echo ""
echo "Testing Galileo (10 messaggi)..."
python3 "$DIR/agents/quick-test.py" "$NANOBOT" "$REPORT"

echo ""
echo "Report salvato: $REPORT"
echo "=== LOOP COMPLETATO ==="
