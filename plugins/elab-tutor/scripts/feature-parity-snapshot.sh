#!/bin/bash
# ════════════════════════════════════════════════════════════════
# FEATURE PARITY SNAPSHOT — anti-regressione retroattiva
#
# Cattura stato critico features in JSON snapshot. Confronta con
# snapshot precedente per detect regressioni (es. card HomePage,
# componenti Lavagna, modalita, vitest count, ToolSpec count).
#
# Output: automa/state/feature-parity-snapshot.json
# Diff con snapshot precedente: stdout + exit 1 se regressione
#
# Uso:
#   bash scripts/feature-parity-snapshot.sh [--write]
#   --write: salva snapshot corrente (altrimenti dry-run)
#
# Andrea Marro — Sprint V iter 1 anti-regression mechanism 2026-05-05
# ════════════════════════════════════════════════════════════════

set -e
cd "$(dirname "$0")/.."

WRITE=0
[ "$1" = "--write" ] && WRITE=1

if [ -t 1 ]; then R='\033[0;31m'; G='\033[0;32m'; Y='\033[0;33m'; B='\033[0;34m'; N='\033[0m';
else R=''; G=''; Y=''; B=''; N=''; fi

OUT="automa/state/feature-parity-snapshot.json"
PREV="automa/state/feature-parity-snapshot.prev.json"
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "no-git")
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "no-git")

mkdir -p "$(dirname "$OUT")"

# ─── 1. HomePage card count ───
HOMEPAGE_CARDS=$(grep -cE "^\s+id:\s*'[a-z-]+'," src/components/HomePage.jsx 2>/dev/null || echo "0")

# ─── 2. HomePage Cronologia render ───
HOMEPAGE_CRONOLOGIA=0
grep -q "HomeCronologia\s*onResume" src/components/HomePage.jsx 2>/dev/null && HOMEPAGE_CRONOLOGIA=1

# ─── 3. ModalitaSwitch modes count ───
MODALITA_COUNT=$(grep -E "^export const MODALITA" src/components/lavagna/ModalitaSwitch.jsx 2>/dev/null | grep -oE "'[a-z-]+'" | wc -l | tr -d ' ' || echo "0")

# ─── 4. Lavagna components in src/components/lavagna/ ───
LAVAGNA_COMPONENTS=$(ls src/components/lavagna/*.jsx 2>/dev/null | wc -l | tr -d ' ' || echo "0")

# ─── 5. ToolSpec count canonical ───
TOOLSPEC_COUNT=$(grep -cE "^\s+name:\s*['\"]" scripts/openclaw/tools-registry.ts 2>/dev/null || echo "0")

# ─── 6. RAG chunks count ───
RAG_CHUNKS=$(node -e "console.log(require('./src/data/rag-chunks.json').length)" 2>/dev/null || echo "0")

# ─── 7. Wiki concepts count ───
WIKI_CONCEPTS=$(ls docs/unlim-wiki/concepts/*.md 2>/dev/null | wc -l | tr -d ' ' || echo "0")

# ─── 8. Lesson paths count ───
LESSON_PATHS=$(ls ../../packs/elab-tutor/data/lesson-paths/*.json 2>/dev/null | wc -l | tr -d ' ' || echo "0")

# ─── 9. Vitest baseline ───
VITEST_BASELINE=$(cat automa/baseline-tests.txt 2>/dev/null | tr -d ' ' || echo "0")

# ─── 10. Edge Functions count ───
EDGE_FUNCTIONS=$(ls -d supabase/functions/*/ 2>/dev/null | grep -v _shared | wc -l | tr -d ' ' || echo "0")

# ─── 11. ADR count ───
ADR_COUNT=$(ls docs/adrs/ADR-*.md 2>/dev/null | wc -l | tr -d ' ' || echo "0")

# ─── 12. Feedback files count ───
FEEDBACK_COUNT=$(ls /Users/andreamarro/.claude/projects/-Users-andreamarro-VOLUME-3/memory/feedback_*.md 2>/dev/null | wc -l | tr -d ' ' || echo "0")

# ─── Build JSON ───
JSON=$(cat <<EOF
{
  "timestamp": "$TS",
  "commit": "$COMMIT",
  "branch": "$BRANCH",
  "snapshot": {
    "homepage_cards": $HOMEPAGE_CARDS,
    "homepage_cronologia_rendered": $HOMEPAGE_CRONOLOGIA,
    "modalita_count": $MODALITA_COUNT,
    "lavagna_components": $LAVAGNA_COMPONENTS,
    "toolspec_count": $TOOLSPEC_COUNT,
    "rag_chunks": $RAG_CHUNKS,
    "wiki_concepts": $WIKI_CONCEPTS,
    "lesson_paths": $LESSON_PATHS,
    "vitest_baseline": $VITEST_BASELINE,
    "edge_functions": $EDGE_FUNCTIONS,
    "adr_count": $ADR_COUNT,
    "feedback_files": $FEEDBACK_COUNT
  }
}
EOF
)

echo -e "${B}══════════════════════════════════════════════════════════${N}"
echo -e "${B}FEATURE PARITY SNAPSHOT — $TS${N}"
echo -e "${B}Commit: $COMMIT  Branch: $BRANCH${N}"
echo -e "${B}══════════════════════════════════════════════════════════${N}"
echo ""
echo "$JSON" | python3 -m json.tool 2>/dev/null || echo "$JSON"
echo ""

# ─── Diff vs previous ───
REGRESSIONS=()
if [ -f "$OUT" ]; then
  echo -e "${Y}── Diff vs previous snapshot ──${N}"
  for KEY in homepage_cards homepage_cronologia_rendered modalita_count lavagna_components toolspec_count rag_chunks wiki_concepts lesson_paths vitest_baseline edge_functions adr_count feedback_files; do
    PREV_VAL=$(python3 -c "import json; print(json.load(open('$OUT'))['snapshot'].get('$KEY', 0))" 2>/dev/null || echo "0")
    NEW_VAL=$(echo "$JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['snapshot'].get('$KEY', 0))" 2>/dev/null || echo "0")

    # Some metrics SHOULD only grow; others just need to not drop
    ALLOW_DROP_KEYS=("vitest_baseline")
    SHOULD_GROW=1
    for ALLOW_KEY in "${ALLOW_DROP_KEYS[@]}"; do
      [ "$KEY" = "$ALLOW_KEY" ] && SHOULD_GROW=0
    done

    if [ "$NEW_VAL" -lt "$PREV_VAL" ]; then
      DELTA=$((NEW_VAL - PREV_VAL))
      echo -e "  ${R}✗ $KEY: $PREV_VAL → $NEW_VAL ($DELTA) REGRESSION${N}"
      REGRESSIONS+=("$KEY: $PREV_VAL → $NEW_VAL")
    elif [ "$NEW_VAL" -gt "$PREV_VAL" ]; then
      DELTA=$((NEW_VAL - PREV_VAL))
      echo -e "  ${G}✓ $KEY: $PREV_VAL → $NEW_VAL (+$DELTA)${N}"
    else
      echo -e "  ${B}= $KEY: $NEW_VAL${N}"
    fi
  done
else
  echo -e "${Y}── First snapshot (no previous to diff) ──${N}"
fi

echo ""

# ─── Write or dry-run ───
if [ "$WRITE" = "1" ]; then
  [ -f "$OUT" ] && cp "$OUT" "$PREV"
  echo "$JSON" > "$OUT"
  echo -e "${G}✓ Snapshot written: $OUT${N}"
  [ -f "$PREV" ] && echo -e "${G}✓ Previous backup: $PREV${N}"
else
  echo -e "${Y}(dry-run, --write to save)${N}"
fi

# ─── Exit code ───
if [ ${#REGRESSIONS[@]} -gt 0 ]; then
  echo ""
  echo -e "${R}══════════════════════════════════════════════════════════${N}"
  echo -e "${R}REGRESSIONS DETECTED (${#REGRESSIONS[@]})${N}"
  for REG in "${REGRESSIONS[@]}"; do
    echo -e "${R}  • $REG${N}"
  done
  echo -e "${R}══════════════════════════════════════════════════════════${N}"
  exit 1
fi

echo -e "${G}✓ No regressions${N}"
exit 0
