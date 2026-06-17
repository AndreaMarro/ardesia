#!/bin/bash
# ELAB iter 36 user-simulation Livello 2 workflow (Cron 30min P1+P2+P3 rotate)
# Output: ~/Library/Logs/elab/user-sim-l2-{persona}-{ISO}.json
set -u
TS=$(date -u +%Y%m%dT%H%M%SZ)
LOGDIR=/Users/progettibelli/Library/Logs/elab
mkdir -p "$LOGDIR"

# Rotate persona based on hour parity
H=$(date -u +%H)
case $((10#$H % 3)) in
  0) PERSONA=p1-docente-primaria; PROMPT="Spiegami il LED ai miei alunni di prima elementare" ;;
  1) PERSONA=p2-docente-secondaria; PROMPT="Differenza MOSFET vs BJT in termini didattici" ;;
  2) PERSONA=p3-studente-curiosa; PROMPT="Spiegami con una storia il circuito LED" ;;
esac

OUT="$LOGDIR/user-sim-l2-$PERSONA-$TS.json"
SCRIPT_LOG="$LOGDIR/user-sim-l2-$TS.log"

PROD=https://www.elabtutor.school
SUPA=https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1
PASS=0
FAIL=0
ERRORS=()

# Read keys from env if available
ANON_KEY="${SUPABASE_ANON_KEY:-}"
ELAB_KEY="${ELAB_API_KEY:-}"

START=$(date +%s%N)

# S1: Homepage 200
S1=$(curl -s -m 8 -o /dev/null -w "%{http_code}" "$PROD")
[ "$S1" = "200" ] && PASS=$((PASS+1)) || { FAIL=$((FAIL+1)); ERRORS+=("homepage_$S1"); }

# S2-7: 5 Edge Function preflight
for ep in unlim-chat unlim-tts unlim-vision unlim-stt unlim-imagegen; do
  C=$(curl -s -m 6 -o /dev/null -w "%{http_code}" -X OPTIONS "$SUPA/$ep")
  if [ "$C" = "204" ] || [ "$C" = "200" ]; then PASS=$((PASS+1)); else FAIL=$((FAIL+1)); ERRORS+=("${ep}_$C"); fi
done

# S8: Real chat smoke (only if keys available)
CHAT_LATENCY="N/A"
CHAT_PZ="N/A"
if [ -n "$ANON_KEY" ] && [ -n "$ELAB_KEY" ]; then
  T0=$(date +%s%N)
  RESP=$(curl -s -m 30 -X POST "$SUPA/unlim-chat" \
    -H "Authorization: Bearer $ANON_KEY" \
    -H "x-elab-api-key: $ELAB_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"message\":\"$PROMPT\",\"sessionId\":\"$(uuidgen)\",\"experimentId\":\"v1-cap6-esp1\"}")
  T1=$(date +%s%N)
  CHAT_LATENCY=$(( (T1 - T0) / 1000000 ))
  if echo "$RESP" | grep -q "Ragazzi"; then PZ_R=1; else PZ_R=0; fi
  if echo "$RESP" | grep -qE "Vol\.[0-9]+|pag\.[0-9]+"; then PZ_V=1; else PZ_V=0; fi
  CHAT_PZ="ragazzi=$PZ_R vol_pag=$PZ_V"
  if [ "$PZ_R" = "1" ]; then PASS=$((PASS+1)); else FAIL=$((FAIL+1)); ERRORS+=("pz_no_ragazzi"); fi
fi

END=$(date +%s%N)
DURATION_MS=$(( (END - START) / 1000000 ))

TOTAL=8
ERR_JSON=""
if [ ${#ERRORS[@]} -gt 0 ]; then ERR_JSON=$(printf '"%s",' "${ERRORS[@]}" | sed 's/,$//'); fi

cat > "$OUT" <<EOF
{
  "cycle_id": "iter36-l2-$PERSONA-$TS",
  "level": 2,
  "persona": "$PERSONA",
  "scenarios_total": $TOTAL,
  "scenarios_passed": $PASS,
  "scenarios_failed": [${ERR_JSON:-}],
  "chat_latency_ms": "$CHAT_LATENCY",
  "chat_pz_v3": "$CHAT_PZ",
  "duration_ms": $DURATION_MS,
  "regression_flags": $([ $FAIL -gt 1 ] && echo '["L2_DEGRADED"]' || echo '[]'),
  "git_branch": "mac-mini/iter36-user-sim-l2-$TS",
  "timestamp_utc": "$TS"
}
EOF

echo "$TS L2 $PERSONA pass=$PASS/$TOTAL fail=$FAIL latency=${CHAT_LATENCY}ms pz=$CHAT_PZ" >> "$SCRIPT_LOG"
exit 0
