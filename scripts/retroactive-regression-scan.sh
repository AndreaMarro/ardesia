#!/bin/bash
# ════════════════════════════════════════════════════════════════
# RETROACTIVE REGRESSION SCAN — scan ultimi N commit, detect drift
#
# Per ogni commit ultimi N (default 20), checkout ephemeral, run
# feature-parity-snapshot, registra metric. Se drift detected (es.
# homepage_cards drops 4→3), alert + suggested commit revert.
#
# Output: docs/audits/retroactive-regression-scan-<TS>.md
#
# Uso:
#   bash scripts/retroactive-regression-scan.sh [N]
#   N: commit count to scan (default 20)
#
# CAUTELA: scan è read-only, NO modifiche storia git.
# Usa git stash + checkout per esplorare commit, restore HEAD finale.
#
# Andrea Marro — Sprint V iter 1 anti-regression mechanism 2026-05-05
# ════════════════════════════════════════════════════════════════

set -e
cd "$(dirname "$0")/.."

N="${1:-20}"
TS=$(date -u +"%Y%m%dT%H%M%SZ")
OUT="docs/audits/retroactive-regression-scan-$TS.md"

if [ -t 1 ]; then R='\033[0;31m'; G='\033[0;32m'; Y='\033[0;33m'; B='\033[0;34m'; N_CLR='\033[0m';
else R=''; G=''; Y=''; B=''; N_CLR=''; fi

ORIG_HEAD=$(git rev-parse HEAD)
ORIG_BRANCH=$(git rev-parse --abbrev-ref HEAD)
STASHED=0

if ! git diff-index --quiet HEAD --; then
  git stash push -m "retroactive-scan-stash-$TS" >/dev/null
  STASHED=1
  echo -e "${Y}Stashed working tree changes${N_CLR}"
fi

mkdir -p docs/audits

cat > "$OUT" <<EOF
# Retroactive Regression Scan — $TS

**Original HEAD**: \`$ORIG_HEAD\`
**Original branch**: \`$ORIG_BRANCH\`
**Scan depth**: last $N commits

| commit | timestamp | homepage_cards | cronologia | modalita | lavagna_comp | toolspec | rag | wiki | lesson | vitest | edge | adr |
|--------|-----------|---------------:|-----------:|---------:|-------------:|---------:|----:|-----:|-------:|-------:|-----:|----:|
EOF

COMMITS=$(git log --format=%H -n "$N" 2>/dev/null)

PREV_CARDS=""
PREV_CRONO=""
DRIFT_LOG=()

for COMMIT in $COMMITS; do
  git checkout -q "$COMMIT" 2>/dev/null

  CTS=$(git log -1 --format=%cI 2>/dev/null | cut -dT -f1)

  CARDS=$(grep -cE "^\s+id:\s*'[a-z-]+'," src/components/HomePage.jsx 2>/dev/null || echo "0")
  CRONO=0
  grep -q "HomeCronologia\s*onResume" src/components/HomePage.jsx 2>/dev/null && CRONO=1
  MODES=$(grep -E "^export const MODALITA" src/components/lavagna/ModalitaSwitch.jsx 2>/dev/null | grep -oE "'[a-z-]+'" | wc -l | tr -d ' ' || echo "0")
  LAVAGNA=$(ls src/components/lavagna/*.jsx 2>/dev/null | wc -l | tr -d ' ' || echo "0")
  TOOLS=$(grep -cE "^\s+name:\s*['\"]" scripts/openclaw/tools-registry.ts 2>/dev/null || echo "0")
  RAG=$(node -e "console.log(require('./src/data/rag-chunks.json').length)" 2>/dev/null || echo "0")
  WIKI=$(ls docs/unlim-wiki/concepts/*.md 2>/dev/null | wc -l | tr -d ' ' || echo "0")
  LESSON=$(ls src/data/lesson-paths/*.json 2>/dev/null | wc -l | tr -d ' ' || echo "0")
  VITEST=$(cat automa/baseline-tests.txt 2>/dev/null | tr -d ' ' || echo "0")
  EDGE=$(ls -d supabase/functions/*/ 2>/dev/null | grep -v _shared | wc -l | tr -d ' ' || echo "0")
  ADR=$(ls docs/adrs/ADR-*.md 2>/dev/null | wc -l | tr -d ' ' || echo "0")

  SHORT=${COMMIT:0:7}
  echo "| \`$SHORT\` | $CTS | $CARDS | $CRONO | $MODES | $LAVAGNA | $TOOLS | $RAG | $WIKI | $LESSON | $VITEST | $EDGE | $ADR |" >> "$OUT"

  # Detect drift
  if [ -n "$PREV_CARDS" ] && [ "$CARDS" -gt "$PREV_CARDS" ]; then
    # Newer commit (this one in iter list, NEXT in chronology = older)
    # Actually git log is HEAD→older, so PREV (loop-prev) = NEWER commit
    # If NEWER commit had MORE cards than current = regression occurred between
    DRIFT_LOG+=("homepage_cards drop $PREV_CARDS → $CARDS at $SHORT $CTS")
  fi
  if [ -n "$PREV_CRONO" ] && [ "$CRONO" -lt "$PREV_CRONO" ]; then
    DRIFT_LOG+=("cronologia drop 1→0 at $SHORT $CTS")
  fi

  PREV_CARDS=$CARDS
  PREV_CRONO=$CRONO
done

# Restore HEAD
git checkout -q "$ORIG_HEAD" 2>/dev/null
[ "$STASHED" = "1" ] && git stash pop >/dev/null 2>&1 || true

# Drift summary
cat >> "$OUT" <<EOF

## Drift detected

EOF

if [ ${#DRIFT_LOG[@]} -eq 0 ]; then
  echo "Nessun drift detected nei $N commit scanned." >> "$OUT"
else
  echo "**${#DRIFT_LOG[@]} drift events**:" >> "$OUT"
  echo "" >> "$OUT"
  for D in "${DRIFT_LOG[@]}"; do
    echo "- $D" >> "$OUT"
  done
fi

cat >> "$OUT" <<EOF

## Note

- Drift "homepage_cards drop" = commit più recente ha MENO card del precedente (regressione probabile).
- Lettura tabella: prima riga = HEAD (più recente), ultima riga = N commit fa (più vecchio).
- Per ogni regressione: \`git show <commit>\` per vedere diff + ratify Andrea revert necessità.
EOF

echo -e "${G}✓ Scan complete: $OUT${N_CLR}"
[ ${#DRIFT_LOG[@]} -gt 0 ] && echo -e "${R}✗ ${#DRIFT_LOG[@]} drift events detected (vedi audit)${N_CLR}"
echo -e "${B}HEAD restored to $ORIG_HEAD${N_CLR}"

exit 0
