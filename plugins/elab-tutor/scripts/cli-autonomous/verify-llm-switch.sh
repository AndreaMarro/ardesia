#!/usr/bin/env bash
# verify-llm-switch.sh — 20-prompt Italian verification for LLM provider switch
# Tests Together AI (or current LLM_PROVIDER) via unlim-chat Edge Function.
# Verifies Principio Zero v3 compliance + response quality.
# Exit 0 if PASS >= 18/20, exit 1 otherwise.
# (c) Andrea Marro — 20/04/2026

set -euo pipefail

EDGE_URL="${EDGE_FUNCTION_URL:-https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat}"
# Reviewer issue #1 (Day 01): require SUPABASE_ANON_KEY from env, no hardcoded default.
# Set via: export SUPABASE_ANON_KEY=<key>  (scope local only, never commit)
ANON_KEY="${SUPABASE_ANON_KEY:?SUPABASE_ANON_KEY must be set in env before running verify-llm-switch.sh}"
SESSION_ID="verify-llm-switch-$(date +%s)"
DATE=$(date +%Y-%m-%d)
AUDIT_DIR="docs/audit"
AUDIT_FILE="$AUDIT_DIR/llm-switch-verify-$DATE.md"

mkdir -p "$AUDIT_DIR"

# 20 Italian prompts typical for kids 8-14
PROMPTS=(
  "Ciao UNLIM!"
  "Come funziona un LED?"
  "non va"
  "Spiega la resistenza"
  "Il circuito non funziona"
  "Compila il codice"
  "Che differenza c'e' tra serie e parallelo?"
  "Cos'e' un condensatore?"
  "Chi sei?"
  "Parlami di politica"
  "fallo partire"
  "mostrami il LED"
  "Ragazzi, proviamo a collegare il LED"
  "Dove sbaglio?"
  "Prossimo esperimento"
  "Spiega il codice"
  "Mi dai un suggerimento?"
  "A che pagina del libro?"
  "Come funziona Arduino?"
  "Boh non capisco niente"
)

PASS_COUNT=0
FAIL_COUNT=0
TOTAL=${#PROMPTS[@]}

# Fail patterns (must NOT appear)
# Note: grep -iP for case-insensitive Perl regex
FAIL_REGEX='(gemini|google|llama|meta ai|together ai|intelligenza artificiale|AI model|Docente,?\s+(leggi|fai|mostra)|Insegnante,?\s+(leggi|fai|mostra))'

echo "# LLM Switch Verification — $DATE" > "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"
echo "**Endpoint**: $EDGE_URL" >> "$AUDIT_FILE"
echo "**Session**: $SESSION_ID" >> "$AUDIT_FILE"
echo "**Prompts**: $TOTAL" >> "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"
echo "| # | Prompt | HTTP | Words | PZ Check | Result |" >> "$AUDIT_FILE"
echo "|---|--------|------|-------|----------|--------|" >> "$AUDIT_FILE"

for i in "${!PROMPTS[@]}"; do
  NUM=$((i + 1))
  PROMPT="${PROMPTS[$i]}"

  # Send request (requires Supabase anon key for auth)
  RESPONSE=$(curl -s -w "\n%{http_code}" --max-time 30 \
    -X POST "$EDGE_URL" \
    -H "Content-Type: application/json" \
    -H "apikey: $ANON_KEY" \
    -H "Authorization: Bearer $ANON_KEY" \
    -d "{\"message\":\"$PROMPT\",\"sessionId\":\"$SESSION_ID\"}" 2>/dev/null || echo -e "\n000")

  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  # Extract response text
  RESP_TEXT=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('response',''))" 2>/dev/null || echo "")

  # Word count
  WORD_COUNT=$(echo "$RESP_TEXT" | wc -w | tr -d ' ')

  # PZ check: no fail patterns
  PZ_OK="PASS"
  if echo "$RESP_TEXT" | grep -iPq "$FAIL_REGEX" 2>/dev/null; then
    PZ_OK="FAIL"
  fi

  # Check conditions
  RESULT="PASS"
  if [ "$HTTP_CODE" != "200" ]; then
    RESULT="FAIL (HTTP $HTTP_CODE)"
  elif [ -z "$RESP_TEXT" ]; then
    RESULT="FAIL (empty)"
  elif [ "$WORD_COUNT" -gt 100 ]; then
    RESULT="FAIL (too long: $WORD_COUNT words)"
  elif [ "$PZ_OK" = "FAIL" ]; then
    RESULT="FAIL (PZ violation)"
  fi

  if [ "$RESULT" = "PASS" ]; then
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi

  # Truncate prompt and response for table
  SHORT_PROMPT=$(echo "$PROMPT" | cut -c1-30)
  echo "| $NUM | $SHORT_PROMPT | $HTTP_CODE | $WORD_COUNT | $PZ_OK | $RESULT |" >> "$AUDIT_FILE"

  # Rate limit protection: small delay between requests
  sleep 1
done

echo "" >> "$AUDIT_FILE"
echo "## Summary" >> "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"
echo "- **PASS**: $PASS_COUNT / $TOTAL" >> "$AUDIT_FILE"
echo "- **FAIL**: $FAIL_COUNT / $TOTAL" >> "$AUDIT_FILE"
echo "- **Threshold**: >= 18/20 for PASS" >> "$AUDIT_FILE"

if [ "$PASS_COUNT" -ge 18 ]; then
  echo "- **Decision**: KEEP Together AI" >> "$AUDIT_FILE"
  echo ""
  echo "PASS: $PASS_COUNT/$TOTAL (>= 18). LLM switch verified."
  exit 0
else
  echo "- **Decision**: ROLLBACK to Gemini (supabase secrets set LLM_PROVIDER=gemini)" >> "$AUDIT_FILE"
  echo ""
  echo "FAIL: $PASS_COUNT/$TOTAL (< 18). Rollback recommended."
  exit 1
fi
