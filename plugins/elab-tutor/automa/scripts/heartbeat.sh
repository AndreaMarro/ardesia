#!/usr/bin/env bash
# heartbeat.sh — controlla i 3 servizi ELAB e scrive automa/state/heartbeat.json
# Exit 0 se tutti OK, exit 1 se almeno uno è DOWN

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
STATE_DIR="$PROJECT_ROOT/automa/state"
OUTPUT="$STATE_DIR/heartbeat.json"

TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

check_service() {
  local url="$1"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
  if [ "$code" = "200" ]; then
    echo "ok"
  else
    echo "down"
  fi
}

echo "[$TIMESTAMP] Controllo frontend..."
FRONTEND_STATUS=$(check_service "https://www.elabtutor.school")

echo "[$TIMESTAMP] Controllo nanobot..."
NANOBOT_STATUS=$(check_service "https://elab-galileo.onrender.com/health")

echo "[$TIMESTAMP] Controllo edgeTTS..."
EDGE_TTS_STATUS=$(check_service "http://72.60.129.50:8880/tts")

# Determina stato globale
ALL_OK=true
[ "$FRONTEND_STATUS" = "down" ] && ALL_OK=false
[ "$NANOBOT_STATUS" = "down" ] && ALL_OK=false
[ "$EDGE_TTS_STATUS" = "down" ] && ALL_OK=false

if $ALL_OK; then
  OVERALL="ok"
else
  OVERALL="degraded"
fi

# Scrivi JSON
mkdir -p "$STATE_DIR"
cat > "$OUTPUT" << EOF
{
  "timestamp": "$TIMESTAMP",
  "overall": "$OVERALL",
  "services": {
    "frontend": {
      "url": "https://www.elabtutor.school",
      "status": "$FRONTEND_STATUS"
    },
    "nanobot": {
      "url": "https://elab-galileo.onrender.com/health",
      "status": "$NANOBOT_STATUS"
    },
    "edgeTTS": {
      "url": "http://72.60.129.50:8880/tts",
      "status": "$EDGE_TTS_STATUS"
    }
  }
}
EOF

echo "[$TIMESTAMP] Risultato scritto in $OUTPUT"
echo "  frontend: $FRONTEND_STATUS"
echo "  nanobot:  $NANOBOT_STATUS"
echo "  edgeTTS:  $EDGE_TTS_STATUS"
echo "  overall:  $OVERALL"

if $ALL_OK; then
  exit 0
else
  echo "ATTENZIONE: uno o più servizi sono DOWN"
  exit 1
fi
