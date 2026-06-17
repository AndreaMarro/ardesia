#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# HONESTY AUDIT — esame di coscienza periodico
#
# Raccoglie metriche OGGETTIVE (niente self-evaluation soggettiva)
# e le scrive in automa/state/honesty-audit.json.
#
# Da eseguire ogni 3 task completati oppure manualmente.
# Exit 0 sempre (non blocca). Scopo: visibilità onesta.
# ═══════════════════════════════════════════════════════════════

set -e
cd "$(dirname "$0")/.."

TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
OUT="automa/state/honesty-audit.json"
mkdir -p "$(dirname "$OUT")"

# ── 1. Test suite (oggettivo) ──
TEST_OUT=$(npx vitest run 2>&1 | tail -8)
TESTS_PASS=$(echo "$TEST_OUT" | grep -E '^[[:space:]]*Tests[[:space:]]' | grep -oE '[0-9]+ passed' | head -1 | grep -oE '[0-9]+' || echo "0")
TESTS_FAIL=$(echo "$TEST_OUT" | grep -E '^[[:space:]]*Tests[[:space:]]' | grep -oE '[0-9]+ failed' | head -1 | grep -oE '[0-9]+' || echo "0")
TESTS_FILES=$(echo "$TEST_OUT" | grep -oE 'Test Files[[:space:]]+[0-9]+ passed' | grep -oE '[0-9]+' | head -1 || echo "0")

# ── 2. Coverage (se --coverage disponibile)──
COVERAGE="unknown"

# ── 3. Build (oggettivo)──
BUILD_STATUS="unknown"
BUILD_SIZE_KB=0
if [ -d dist ]; then
  BUILD_SIZE_KB=$(du -sk dist 2>/dev/null | awk '{print $1}')
  BUILD_STATUS="CACHED"
fi

# ── 4. Site status ──
SITE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 https://www.elabtutor.school 2>/dev/null || echo "0")

# ── 5. Test triviali vs comportamentali (euristica) ──
TRIVIAL_PATTERNS='(has at least [0-9]+|is defined|is a function|returns an array|has field|toBeDefined)'
TRIVIAL_COUNT=$(grep -r -E "it\(.{0,60}$TRIVIAL_PATTERNS" tests/unit/ 2>/dev/null | wc -l | tr -d ' ')
TOTAL_ITS=$(grep -rE "^[[:space:]]*it\(" tests/unit/ 2>/dev/null | wc -l | tr -d ' ')

# ── 6. Bug aperti (TODO/FIXME in src/) ──
TODOS=$(grep -rE "TODO|FIXME|XXX|HACK" src/ --include="*.js" --include="*.jsx" 2>/dev/null | wc -l | tr -d ' ')

# ── 7. Console.log residui (oggettivo) ──
CONSOLE_LOGS=$(grep -rE "console\.(log|debug|warn|error|info)" src/ --include="*.js" --include="*.jsx" 2>/dev/null | grep -vE "// eslint-disable|logger\." | wc -l | tr -d ' ')

# ── 8. File size top 5 (performance)──
TOP_FILES=$(find src -type f \( -name "*.jsx" -o -name "*.js" \) -exec wc -l {} + 2>/dev/null | sort -rn | head -6 | tail -5 | awk '{print "\""$2"\":"$1}' | paste -sd, -)

# ── 9. Git status cleanliness ──
UNCOMMITTED=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
HEAD_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# ── 10. Endpoint reali (oggettivo) ──
COMPILER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 -X POST "https://n8n.srv1022317.hstgr.cloud/compile" -H "Content-Type: application/json" -d '{"code":"void setup(){} void loop(){}"}' 2>/dev/null || echo "0")
EDGE_TTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "http://72.60.129.50:8880/tts?text=test" 2>/dev/null || echo "0")

# ── 11. Volume references integrity ──
BOOKTEXT_COUNT=$(grep -c "bookText:" src/data/volume-references.js 2>/dev/null || echo "0")
BOOKDIVERGENCE_COUNT=$(grep -c "bookDivergence" src/data/volume-references.js 2>/dev/null || echo "0")

# ── 12. Commercial readiness (se presente) ──
COMMERCIAL_SCORE="unknown"
if [ -f automa/state/commercial-readiness.json ]; then
  COMMERCIAL_SCORE=$(python3 -c "import json; print(json.load(open('automa/state/commercial-readiness.json')).get('score','unknown'))" 2>/dev/null || echo "unknown")
fi

# ── Write output ──
cat > "$OUT" <<EOF
{
  "timestamp": "$TS",
  "git": {
    "branch": "$BRANCH",
    "head": "$HEAD_SHA",
    "uncommitted": $UNCOMMITTED
  },
  "tests": {
    "passed": $TESTS_PASS,
    "failed": $TESTS_FAIL,
    "files": $TESTS_FILES,
    "total_it_statements": $TOTAL_ITS,
    "trivial_it_statements": $TRIVIAL_COUNT,
    "trivial_ratio": $(python3 -c "print(round($TRIVIAL_COUNT/$TOTAL_ITS, 3) if $TOTAL_ITS > 0 else 0)")
  },
  "build": {
    "status": "$BUILD_STATUS",
    "dist_size_kb": $BUILD_SIZE_KB
  },
  "endpoints": {
    "site": "$SITE",
    "compiler_n8n": "$COMPILER_STATUS",
    "edge_tts_vps": "$EDGE_TTS_STATUS"
  },
  "codebase": {
    "todos_and_fixmes": $TODOS,
    "console_log_residuals": $CONSOLE_LOGS,
    "top_files_by_size": {$TOP_FILES}
  },
  "parallelism": {
    "bookText_entries": $BOOKTEXT_COUNT,
    "bookDivergence_entries_must_be_zero": $BOOKDIVERGENCE_COUNT
  },
  "commercial_readiness_score": "$COMMERCIAL_SCORE",
  "honesty_notes": [
    "Questo file contiene metriche OGGETTIVE misurate da comandi reali.",
    "NON contiene self-evaluation ('ho fatto un buon lavoro').",
    "trivial_ratio > 0.3 = sospetto test inflation. Investigare.",
    "todos_and_fixmes > 50 = debito tecnico alto.",
    "console_log_residuals > 30 = codice non production-ready.",
    "bookDivergence_entries_must_be_zero != 0 = fallito il fix del 17/04."
  ]
}
EOF

# Output human-readable
echo "════════════════════════════════════════════"
echo "  HONESTY AUDIT — $TS"
echo "════════════════════════════════════════════"
echo "Branch: $BRANCH @ $HEAD_SHA ($UNCOMMITTED uncommitted)"
echo "Tests: $TESTS_PASS pass / $TESTS_FAIL fail in $TESTS_FILES file"
echo "  it() totali: $TOTAL_ITS — potentially trivial: $TRIVIAL_COUNT"
echo "Build: $BUILD_STATUS ($BUILD_SIZE_KB KB)"
echo "Site: $SITE | Compiler: $COMPILER_STATUS | Edge TTS: $EDGE_TTS_STATUS"
echo "TODO/FIXME in src/: $TODOS"
echo "console.log residui: $CONSOLE_LOGS"
echo "bookText entries: $BOOKTEXT_COUNT (target 92) | bookDivergence: $BOOKDIVERGENCE_COUNT (target 0)"
echo "Commercial readiness: $COMMERCIAL_SCORE"
echo ""
echo "Output: $OUT"
exit 0
