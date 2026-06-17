#!/bin/bash
# ELAB iter 36 user-simulation Livello 3 Onniscenza+Onnipotenza stress (Cron 2h P3 primary)
# Output: ~/Library/Logs/elab/user-sim-l3-p3-{ISO}.json
set -u
TS=$(date -u +%Y%m%dT%H%M%SZ)
LOGDIR=/Users/progettibelli/Library/Logs/elab
mkdir -p "$LOGDIR"

PERSONA=p3-studente-curiosa
OUT="$LOGDIR/user-sim-l3-$PERSONA-$TS.json"
SCRIPT_LOG="$LOGDIR/user-sim-l3-$TS.log"

PROD=https://www.elabtutor.school
SUPA=https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1
PASS=0
FAIL=0
ERRORS=()

ANON_KEY="${SUPABASE_ANON_KEY:-}"
ELAB_KEY="${ELAB_API_KEY:-}"

START=$(date +%s%N)

if [ -z "$ANON_KEY" ] || [ -z "$ELAB_KEY" ]; then
  echo "$TS L3 SKIPPED env keys missing" >> "$SCRIPT_LOG"
  cat > "$OUT" <<EOF
{
  "cycle_id": "iter36-l3-$PERSONA-$TS",
  "level": 3,
  "persona": "$PERSONA",
  "status": "SKIPPED_ENV_KEYS_MISSING",
  "regression_flags": ["L3_BLOCKED_ENV"],
  "timestamp_utc": "$TS"
}
EOF
  exit 0
fi

SESS="l3-stress-$TS"

# Cross-pollination: 5 turn history Ragazzi + catodo + anodo + LED + Vol.6
PROMPTS=(
  "Spiegami catodo e anodo del LED"
  "Quale Vol e pag descrive questa cosa?"
  "Aggiungi una analogia col rubinetto"
  "Mostra LED + resistore in lavagna"
  "Diagnostica errore catodo invertito"
  "Ricorda cosa abbiamo detto su anodo"
)

LAYERS_HIT=0
INTENT_EXEC=0
TOTAL_LATENCY=0
TOTAL_TURNS=${#PROMPTS[@]}

for i in "${!PROMPTS[@]}"; do
  P="${PROMPTS[$i]}"
  T0=$(date +%s%N)
  RESP=$(curl -s -m 25 -X POST "$SUPA/unlim-chat" \
    -H "Authorization: Bearer $ANON_KEY" \
    -H "x-elab-api-key: $ELAB_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"message\":\"$P\",\"sessionId\":\"$SESS\",\"experimentId\":\"v1-cap6-esp1\"}")
  T1=$(date +%s%N)
  L=$(( (T1 - T0) / 1000000 ))
  TOTAL_LATENCY=$((TOTAL_LATENCY + L))

  # PZ V3 markers
  if echo "$RESP" | grep -q "Ragazzi"; then PASS=$((PASS+1)); else FAIL=$((FAIL+1)); ERRORS+=("turn${i}_no_ragazzi"); fi
  # Onnipotenza INTENT detect
  if echo "$RESP" | grep -q "INTENT"; then INTENT_EXEC=$((INTENT_EXEC+1)); fi
  # Onniscenza layers approximate via context_used array if exposed
  if echo "$RESP" | grep -qE "rag_chunks|layer|context_used"; then LAYERS_HIT=$((LAYERS_HIT+1)); fi
done

END=$(date +%s%N)
DURATION_MS=$(( (END - START) / 1000000 ))
AVG_LATENCY=$((TOTAL_LATENCY / TOTAL_TURNS))

INTENT_RATE=$(( INTENT_EXEC * 100 / TOTAL_TURNS ))
ERR_JSON=""
if [ ${#ERRORS[@]} -gt 0 ]; then ERR_JSON=$(printf '"%s",' "${ERRORS[@]}" | sed 's/,$//'); fi

REGRESSION=$([ $FAIL -gt 2 ] || [ "$INTENT_RATE" -lt 30 ] && echo '["L3_CRITICAL_REGRESSION"]' || echo '[]')

cat > "$OUT" <<EOF
{
  "cycle_id": "iter36-l3-$PERSONA-$TS",
  "level": 3,
  "persona": "$PERSONA",
  "scenarios_total": $TOTAL_TURNS,
  "scenarios_passed": $PASS,
  "scenarios_failed": [${ERR_JSON:-}],
  "onniscenza_layer_hits_approx": $LAYERS_HIT,
  "onnipotenza_intent_exec": $INTENT_EXEC,
  "onnipotenza_intent_rate_pct": $INTENT_RATE,
  "avg_latency_ms": $AVG_LATENCY,
  "duration_ms": $DURATION_MS,
  "regression_flags": $REGRESSION,
  "git_branch": "mac-mini/iter36-user-sim-l3-$TS",
  "timestamp_utc": "$TS"
}
EOF

echo "$TS L3 P3 pass=$PASS/$TOTAL_TURNS layers=$LAYERS_HIT intent=$INTENT_EXEC/$TOTAL_TURNS avg_lat=${AVG_LATENCY}ms" >> "$SCRIPT_LOG"
exit 0
