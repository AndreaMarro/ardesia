#!/usr/bin/env bash
# metrics.sh — raccoglie metriche del codebase e le scrive in automa/state/metrics-YYYYMMDD.json

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
STATE_DIR="$PROJECT_ROOT/automa/state"
DATE_TAG="$(date +%Y%m%d)"
OUTPUT="$STATE_DIR/metrics-$DATE_TAG.json"
TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

echo "[$TIMESTAMP] Raccolta metriche codebase..."

cd "$PROJECT_ROOT"

# Conta file JS/JSX in src/
FILE_COUNT=$(find src -type f \( -name "*.js" -o -name "*.jsx" \) | wc -l | tr -d ' ')

# Conta righe totali
TOTAL_LINES=$(find src -type f \( -name "*.js" -o -name "*.jsx" \) | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')

# Esegui vitest e leggi test count
echo "[$TIMESTAMP] Esecuzione vitest (potrebbe richiedere qualche minuto)..."
VITEST_OUTPUT=$(npx vitest run 2>&1 | grep "Tests " | tail -1 || echo "N/A")
VITEST_CLEAN=$(echo "$VITEST_OUTPUT" | tr -d '\n' | sed 's/[[:space:]]\+/ /g' | xargs)

echo "  File JS/JSX: $FILE_COUNT"
echo "  Righe totali: $TOTAL_LINES"
echo "  Vitest: $VITEST_CLEAN"

mkdir -p "$STATE_DIR"
cat > "$OUTPUT" << EOF
{
  "timestamp": "$TIMESTAMP",
  "date": "$DATE_TAG",
  "codebase": {
    "js_jsx_file_count": $FILE_COUNT,
    "total_lines": $TOTAL_LINES
  },
  "tests": {
    "vitest_summary": "$VITEST_CLEAN"
  }
}
EOF

echo "[$TIMESTAMP] Metriche scritte in $OUTPUT"
