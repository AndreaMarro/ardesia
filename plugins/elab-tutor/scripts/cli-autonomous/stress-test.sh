#!/bin/bash
# stress-test.sh — Post-deploy stress test suite
# Usage: bash scripts/cli-autonomous/stress-test.sh [preview_url|production]

set -u

PROJECT_DIR="/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
TARGET="${1:-production}"
SPRINT_DAY=$(grep -E "^sprint_day:" "$PROJECT_DIR/automa/state/claude-progress.txt" 2>/dev/null | awk '{print $2}' || echo "0")
OUTFILE="$PROJECT_DIR/docs/audit/stress-test-day-${SPRINT_DAY}-$(date +%Y%m%d-%H%M).md"

if [ "$TARGET" = "production" ]; then
    FRONT_URL="https://www.elabtutor.school"
else
    FRONT_URL="$TARGET"
fi
EDGE_URL="https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1"

mkdir -p "$(dirname "$OUTFILE")"
cd "$PROJECT_DIR" || exit 1

{
    echo "# Stress Test Day $SPRINT_DAY — $(date -Iseconds)"
    echo ""
    echo "**Target**: $TARGET ($FRONT_URL)"
    echo ""

    # 1) Load test homepage 100x parallel
    echo "## 1. Homepage load 100x parallel"
    RESULTS=$(seq 100 | xargs -P 20 -I{} curl -s -o /dev/null -w "%{http_code} %{time_total}\n" "$FRONT_URL/")
    HTTP_200=$(echo "$RESULTS" | awk '$1==200' | wc -l | tr -d ' ')
    HTTP_5XX=$(echo "$RESULTS" | awk '$1>=500' | wc -l | tr -d ' ')
    P95_TIME=$(echo "$RESULTS" | awk '{print $2}' | sort -n | awk 'BEGIN{c=0} {a[c++]=$1} END{print a[int(c*0.95)]}')
    echo "- 200 OK: $HTTP_200/100"
    echo "- 5xx errors: $HTTP_5XX"
    echo "- p95 response time: ${P95_TIME}s"
    if [ "$HTTP_200" -ge 95 ] && [ "$HTTP_5XX" -eq 0 ]; then echo "- Status: PASS ✅"; else echo "- Status: FAIL ❌"; fi
    echo ""

    # 2) LLM stress 50 prompt PZ v3
    echo "## 2. LLM Edge Function stress 50 prompt PZ v3"
    if [ -n "${SUPABASE_ANON_KEY:-}" ]; then
        PZ_PASS=0
        PZ_VIOL=0
        for i in $(seq 1 20); do
            R=$(curl -s -X POST "$EDGE_URL/unlim-chat" \
                -H "Content-Type: application/json" \
                -H "apikey: $SUPABASE_ANON_KEY" \
                -d "{\"message\":\"Ragazzi spiegate circuito scenario $i\"}" 2>/dev/null)
            if echo "$R" | grep -qi "Ragazzi"; then PZ_PASS=$((PZ_PASS+1)); fi
            if echo "$R" | grep -qiE "Docente,?\s*leggi|Insegnante,?\s*leggi"; then PZ_VIOL=$((PZ_VIOL+1)); fi
        done
        echo "- Ragazzi found: $PZ_PASS/20"
        echo "- PZ v3 violations: $PZ_VIOL/20"
        if [ "$PZ_VIOL" -eq 0 ] && [ "$PZ_PASS" -ge 18 ]; then echo "- Status: PASS ✅"; else echo "- Status: FAIL ❌"; fi
    else
        echo "- SUPABASE_ANON_KEY non set — SKIP"
    fi
    echo ""

    # 3) Playwright shard parallel (se installed)
    echo "## 3. Playwright E2E smoke sharded"
    if [ -d node_modules/@playwright/test ]; then
        BASE_URL="$FRONT_URL" npx playwright test \
            --config tests/e2e/playwright.config.js \
            tests/e2e/01-homepage-loads.spec.js \
            --reporter=list 2>&1 | tail -20 || echo "Playwright run had issues"
    else
        echo "- Playwright not installed — SKIP"
    fi
    echo ""

    # 4) Render cold start verify
    echo "## 4. Render cold start verify"
    COLD_TIME=$(curl -s -o /dev/null -w "%{time_total}" -X GET "https://elab-galileo.onrender.com/health" 2>/dev/null || echo "error")
    echo "- Cold start time: ${COLD_TIME}s"
    if [ "$COLD_TIME" != "error" ] && awk "BEGIN {exit !(${COLD_TIME} < 5)}"; then
        echo "- Status: PASS ✅ (< 5s post T1-003 warmup)"
    else
        echo "- Status: DEGRADED (baseline 18s pre-fix, post-warmup expected <3s)"
    fi
    echo ""

    # 5) npm audit security
    echo "## 5. npm audit security"
    AUDIT_OUTPUT=$(npm audit --audit-level=high --json 2>/dev/null || echo '{}')
    HIGH_COUNT=$(echo "$AUDIT_OUTPUT" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('metadata',{}).get('vulnerabilities',{}).get('high',0))" 2>/dev/null || echo "unknown")
    CRIT_COUNT=$(echo "$AUDIT_OUTPUT" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('metadata',{}).get('vulnerabilities',{}).get('critical',0))" 2>/dev/null || echo "unknown")
    echo "- High: $HIGH_COUNT"
    echo "- Critical: $CRIT_COUNT"
    if [ "$HIGH_COUNT" = "0" ] && [ "$CRIT_COUNT" = "0" ]; then echo "- Status: PASS ✅"; else echo "- Status: WARN ⚠️"; fi
    echo ""

    # 6) Edge Function health check 5 endpoints
    echo "## 6. Edge Function health 5/5 endpoints"
    for fn in unlim-chat unlim-diagnose unlim-hints unlim-tts unlim-gdpr; do
        CODE=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$EDGE_URL/$fn" 2>/dev/null)
        echo "- $fn: HTTP $CODE"
    done
    echo ""

    # 7) Benchmark delta
    echo "## 7. Benchmark score delta"
    if [ -f scripts/benchmark.cjs ]; then
        BENCH_PRE=$(jq -r '.total // "n/a"' automa/state/benchmark.json 2>/dev/null || echo "n/a")
        echo "- Pre: $BENCH_PRE"
        echo "- Post: run \`node scripts/benchmark.cjs --write\` to refresh"
    fi
    echo ""

    echo "## Summary"
    echo "Stress test completato $(date -Iseconds). Evidence: $OUTFILE"
} | tee "$OUTFILE"

echo ""
echo "Report saved: $OUTFILE"
