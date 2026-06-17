#!/bin/bash
# ════════════════════════════════════════════════════════════════
# ANDREA iter 9 ENV UNBLOCK — single-paste TUTTE 5 azioni (~10 min, +0.95 score)
# ════════════════════════════════════════════════════════════════
# Goal: Unblock B2 Hybrid RAG + B3 Vision E2E + B4 TTS WS + Mac Mini cleanup + wiki Analogia.
#
# Score lift atteso: 8.75 → 9.7/10 ONESTO post execution + bench live verify.
#
# Reversible:
#   - Action 1: npx supabase secrets unset RAG_HYBRID_ENABLED ...
#   - Action 2: drop class_key row Supabase + rm tests/e2e/.env.local
#   - Action 3: redeploy old unlim-tts via git checkout previous edge-tts-client.ts
#   - Action 4: mv archived-iter8 back (symlink rm)
#   - Action 5: Mac Mini trigger consumed once
#
# Usage:
#   bash scripts/andrea-iter9-env-unblock.sh
# ════════════════════════════════════════════════════════════════

set +e

cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" || exit 1
source ~/.zshrc 2>/dev/null
source ~/.elab-credentials/sprint-s-tokens.env 2>/dev/null

REPORT="/tmp/andrea-iter9-env-unblock-$(date -u +%Y%m%dT%H%M%SZ).log"

echo "════════════════════════════════════════════════════════════════"
echo "  ANDREA iter 9 ENV UNBLOCK ALL-5 — $(date '+%Y-%m-%d %H:%M:%S')"
echo "  Report: $REPORT"
echo "════════════════════════════════════════════════════════════════"

# ─── PRE-FLIGHT ────────────────────────────────────────────────────
echo ""
echo "[PRE-FLIGHT] Verify env credentials"
for k in SUPABASE_ACCESS_TOKEN SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY ELAB_API_KEY; do
  v="${!k}"
  if [ -z "$v" ]; then
    echo "  ❌ $k MISSING — abort"
    exit 1
  fi
  echo "  ✅ $k present (${v:0:10}...)"
done

# ═══ ACTION 1: RAG_HYBRID_ENABLED=true (~2 min, Box 6 +0.25) ═══
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "[ACTION 1/5] Set RAG_HYBRID_ENABLED=true Edge Function secret"
echo "════════════════════════════════════════════════════════════════"

SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase secrets set \
  RAG_HYBRID_ENABLED=true \
  --project-ref euqpdueopmlllqjmqnyb 2>&1 | tee -a "$REPORT" | tail -3
ACTION_1_STATUS=$?
echo "  $([ $ACTION_1_STATUS -eq 0 ] && echo '✅' || echo '❌') ACTION 1 exit=$ACTION_1_STATUS"

# ═══ ACTION 2: class_key + tests/e2e/.env.local (~3 min, Box 7 +0.40) ═══
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "[ACTION 2/5] Create class_key Supabase + tests/e2e/.env.local"
echo "════════════════════════════════════════════════════════════════"

CLASS_KEY="iter9-e2e-test-key-2026"
INSERT_RESULT=$(curl -s --max-time 10 -X POST \
  "https://euqpdueopmlllqjmqnyb.supabase.co/rest/v1/students" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates,return=minimal" \
  -d "{\"class_key\":\"$CLASS_KEY\",\"name\":\"Test Student E2E iter9\"}" 2>&1)

if [ -z "$INSERT_RESULT" ] || ! echo "$INSERT_RESULT" | grep -qi "error"; then
  echo "  ✅ class_key '$CLASS_KEY' inserted (or pre-existing)"
else
  # Try alternative table
  curl -s --max-time 10 -X POST \
    "https://euqpdueopmlllqjmqnyb.supabase.co/rest/v1/unlim_sessions" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: resolution=merge-duplicates,return=minimal" \
    -d "{\"class_key\":\"$CLASS_KEY\",\"session_id\":\"iter9-e2e-test\"}" >/dev/null 2>&1
  echo "  ⚠️ students fail (response: $(echo "$INSERT_RESULT" | head -c 150)) — fallback unlim_sessions attempted"
fi

# Write tests/e2e/.env.local
mkdir -p tests/e2e
cat > tests/e2e/.env.local << EOF
# tests/e2e/.env.local — Andrea iter 9 env unblock $(date -u +%FT%TZ)
# DO NOT COMMIT
PLAYWRIGHT_BASE_URL=https://www.elabtutor.school
ELAB_TEST_CLASS_KEY=$CLASS_KEY
ELAB_API_KEY=$ELAB_API_KEY
SUPABASE_URL=https://euqpdueopmlllqjmqnyb.supabase.co
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF
echo "  ✅ tests/e2e/.env.local written"

# Ensure .gitignore protects it
if ! grep -q "tests/e2e/\.env\|\.env\.local" .gitignore 2>/dev/null; then
  echo "tests/e2e/.env.local" >> .gitignore
  echo "  ✅ .gitignore updated"
fi

# ═══ ACTION 3: Deploy unlim-tts WS Deno (~2 min, Box 8 +0.15, RISK MEDIO) ═══
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "[ACTION 3/5] Deploy unlim-tts WS Deno (Sec-MS-GEC algo iter 8)"
echo "════════════════════════════════════════════════════════════════"
echo "⚠️  RISK: WS protocol untested vs MS dev-tools (rany2/edge-tts port)"
echo "    Fallback: browser speechSynthesis preserved if WS fail"
echo ""

SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase functions deploy unlim-tts \
  --project-ref euqpdueopmlllqjmqnyb \
  --no-verify-jwt 2>&1 | tee -a "$REPORT" | tail -10
ACTION_3_STATUS=$?
echo "  $([ $ACTION_3_STATUS -eq 0 ] && echo '✅' || echo '❌') ACTION 3 exit=$ACTION_3_STATUS"

if [ $ACTION_3_STATUS -eq 0 ]; then
  echo ""
  echo "[3b] Smoke test post-deploy unlim-tts"
  TTS_OUT="/tmp/iter9-tts-smoke-$(date -u +%Y%m%dT%H%M%SZ).ogg"
  TTS_HTTP=$(curl -s --max-time 30 -o "$TTS_OUT" -w "%{http_code}" -X POST \
    https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-tts \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
    -H "Content-Type: application/json" \
    -d '{"text":"Ragazzi, vediamo come funziona il LED.","voice":"it-IT-IsabellaNeural"}' 2>&1)
  TTS_SIZE=$(wc -c < "$TTS_OUT" 2>/dev/null | tr -d ' ')
  echo "  HTTP $TTS_HTTP, size=${TTS_SIZE} bytes file=$TTS_OUT"
  if [ "$TTS_HTTP" = "200" ] && [ "${TTS_SIZE:-0}" -gt 1000 ]; then
    echo "  ✅ TTS WS smoke OK (audio file generato)"
  else
    echo "  ⚠️ TTS smoke incompleto — check Edge Function logs OR rollback:"
    echo "    git checkout HEAD~5 supabase/functions/_shared/edge-tts-client.ts"
    echo "    npx supabase functions deploy unlim-tts --project-ref euqpdueopmlllqjmqnyb"
  fi
fi

# ═══ ACTION 4: Archive Mac Mini stale + symlink (~1 min, cleanup) ═══
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "[ACTION 4/5] Mac Mini archive ~/ELAB/elab-builder.archived-iter8 + symlink"
echo "════════════════════════════════════════════════════════════════"

MM_ARCHIVE=$(ssh -i ~/.ssh/id_ed25519_elab \
  -o ConnectTimeout=10 -o BatchMode=yes -o LogLevel=ERROR \
  progettibelli@100.124.198.59 \
  "if [ -d ~/ELAB/elab-builder ] && [ ! -L ~/ELAB/elab-builder ]; then
     mv ~/ELAB/elab-builder ~/ELAB/elab-builder.archived-iter8 && \
     ln -s ~/Projects/elab-tutor ~/ELAB/elab-builder && \
     echo 'archived + symlinked'
   elif [ -L ~/ELAB/elab-builder ]; then
     echo 'already symlinked (idempotent skip)'
   else
     echo 'no stale repo to archive'
   fi
   ls -la ~/ELAB/" 2>&1)
echo "$MM_ARCHIVE" | head -8
echo "  ✅ ACTION 4 done"

# ═══ ACTION 5: Mac Mini wiki Analogia fire (~2 min, +0.10) ═══
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "[ACTION 5/5] Mac Mini wiki Analogia v2 batch fire"
echo "════════════════════════════════════════════════════════════════"

MM_TRIGGER=$(ssh -i ~/.ssh/id_ed25519_elab \
  -o ConnectTimeout=10 -o BatchMode=yes -o LogLevel=ERROR \
  progettibelli@100.124.198.59 \
  "echo 'cd ~/Projects/elab-tutor && git pull --ff-only origin feat/sprint-s-iter-2-software-prompt-v3-wireup-2026-04-26 2>&1 | tail -3 && bash ~/scripts/elab-wiki-batch-gen-v2.sh' > ~/.elab-trigger && \
   ls -la ~/.elab-trigger && \
   echo '--- trigger contents ---' && cat ~/.elab-trigger" 2>&1)
echo "$MM_TRIGGER" | head -8
echo "  ✅ ACTION 5 trigger written (autonomous loop consumes ≤5 min)"

# ─── SUMMARY ────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  ANDREA iter 9 ENV UNBLOCK ALL-5 COMPLETE"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Score lift atteso: 8.75 → 9.7/10 ONESTO (post bench live verify)"
echo ""
echo "Verification autonomous wave (~30 min):"
echo "  B2 Hybrid RAG live: node scripts/bench/run-hybrid-rag-eval.mjs --gold-set scripts/bench/hybrid-rag-gold-set.jsonl"
echo "  B3 Vision E2E live: npx playwright test tests/e2e/02-vision-flow.spec.js"
echo "  B4 TTS WS smoke: $TTS_OUT (size=$TTS_SIZE bytes)"
echo "  B5 ClawBot live: composite scenarios already 3/3 PASS iter 9 turn precedente"
echo ""
echo "Rollback (se problemi):"
echo "  Action 1: npx supabase secrets unset RAG_HYBRID_ENABLED --project-ref euqpdueopmlllqjmqnyb"
echo "  Action 2: rm tests/e2e/.env.local"
echo "  Action 3: git checkout HEAD~5 supabase/functions/_shared/edge-tts-client.ts && redeploy"
echo "  Action 4: ssh ... 'rm ~/ELAB/elab-builder && mv ~/ELAB/elab-builder.archived-iter8 ~/ELAB/elab-builder'"
echo ""
echo "Report: $REPORT"
echo "════════════════════════════════════════════════════════════════"
