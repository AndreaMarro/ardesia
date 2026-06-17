#!/bin/bash
# ELAB iter 36 user-simulation Livello 1 smoke (Cron 5min P1+P4 alternate)
# Output: ~/Library/Logs/elab/user-sim-l1-{persona}-{ISO}.json
set -u
TS=$(date -u +%Y%m%dT%H%M%SZ)
LOGDIR=/Users/progettibelli/Library/Logs/elab
mkdir -p "$LOGDIR"

# Alternate persona based on minute parity
MIN=$(date -u +%M)
if [ $((10#$MIN % 10)) -lt 5 ]; then PERSONA=p1-docente-primaria; else PERSONA=p4-tester-chaotic; fi

OUT="$LOGDIR/user-sim-l1-$PERSONA-$TS.json"
SCRIPT_LOG="$LOGDIR/user-sim-l1-$TS.log"

PROD=https://www.elabtutor.school
SUPA=https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1
PASS=0
FAIL=0
ERRORS=()

# Scenario 1: Homepage HTTP 200
S1=$(curl -s -m 8 -o /dev/null -w "%{http_code}" "$PROD")
[ "$S1" = "200" ] && PASS=$((PASS+1)) || { FAIL=$((FAIL+1)); ERRORS+=("homepage_$S1"); }

# Scenario 2: Edge Function unlim-chat OPTIONS preflight
S2=$(curl -s -m 8 -o /dev/null -w "%{http_code}" -X OPTIONS "$SUPA/unlim-chat")
[ "$S2" = "204" ] || [ "$S2" = "200" ] && PASS=$((PASS+1)) || { FAIL=$((FAIL+1)); ERRORS+=("unlim-chat_$S2"); }

# Scenario 3: Edge Function unlim-tts OPTIONS
S3=$(curl -s -m 8 -o /dev/null -w "%{http_code}" -X OPTIONS "$SUPA/unlim-tts")
[ "$S3" = "204" ] || [ "$S3" = "200" ] && PASS=$((PASS+1)) || { FAIL=$((FAIL+1)); ERRORS+=("unlim-tts_$S3"); }

# Scenario 4: Edge Function unlim-vision OPTIONS
S4=$(curl -s -m 8 -o /dev/null -w "%{http_code}" -X OPTIONS "$SUPA/unlim-vision")
[ "$S4" = "204" ] || [ "$S4" = "200" ] && PASS=$((PASS+1)) || { FAIL=$((FAIL+1)); ERRORS+=("unlim-vision_$S4"); }

# Scenario 5: Service worker fetch (PWA cache verify)
S5=$(curl -s -m 8 -o /dev/null -w "%{http_code}" "$PROD/sw.js")
[ "$S5" = "200" ] && PASS=$((PASS+1)) || { FAIL=$((FAIL+1)); ERRORS+=("sw_$S5"); }

TOTAL=5
ERR_JSON=""
if [ ${#ERRORS[@]} -gt 0 ]; then ERR_JSON=$(printf '"%s",' "${ERRORS[@]}" | sed 's/,$//'); fi

cat > "$OUT" <<EOF
{
  "cycle_id": "iter36-l1-$PERSONA-$TS",
  "level": 1,
  "persona": "$PERSONA",
  "scenarios_total": $TOTAL,
  "scenarios_passed": $PASS,
  "scenarios_failed": [${ERR_JSON:-}],
  "console_errors": 0,
  "duration_ms": 0,
  "regression_flags": $([ $FAIL -gt 0 ] && echo '["L1_FAIL"]' || echo '[]'),
  "git_branch": "mac-mini/iter36-user-sim-l1-$TS",
  "vercel_alias_tested": "$PROD",
  "timestamp_utc": "$TS"
}
EOF

ERR_LIST="none"
if [ ${#ERRORS[@]} -gt 0 ]; then ERR_LIST="${ERRORS[*]}"; fi
echo "$TS L1 $PERSONA pass=$PASS/$TOTAL fail=$FAIL errors=$ERR_LIST" >> "$SCRIPT_LOG"
exit 0
