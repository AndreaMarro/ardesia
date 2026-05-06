#!/bin/bash
# ════════════════════════════════════════════════════════════════
# ANTI-INFLATION GATE — score >7 require Opus indipendente review
#
# G45 mandate (CLAUDE.md sprint history): "MAI PIU auto-assegnare
# score >7 senza verifica con agenti indipendenti."
#
# Questo gate scansiona file in 'docs/audits/' che claim score
# (regex /score.*[0-9]\.[0-9]?\/10/). Se score ≥7.0 + audit doc
# NON contiene "Opus indipendente review" + verify file
# 'docs/audits/<iter>-opus-independent-review.md' presente, FAIL.
#
# Output: stdout report + exit 1 se inflation detected.
#
# Uso:
#   bash scripts/anti-inflation-gate.sh [audit-glob]
#   audit-glob: default "docs/audits/*sprint*close*.md"
#
# Andrea Marro — Sprint V iter 1 anti-inflation mechanism 2026-05-05
# ════════════════════════════════════════════════════════════════

set -e
cd "$(dirname "$0")/.."

GLOB="${1:-docs/audits/*close*audit*.md}"

if [ -t 1 ]; then R='\033[0;31m'; G='\033[0;32m'; Y='\033[0;33m'; B='\033[0;34m'; N='\033[0m';
else R=''; G=''; Y=''; B=''; N=''; fi

echo -e "${B}══════════════════════════════════════════════════════════${N}"
echo -e "${B}ANTI-INFLATION GATE — G45 mandate enforcement${N}"
echo -e "${B}══════════════════════════════════════════════════════════${N}"

INFLATIONS=()
SCANNED=0

# Loop matching audit files
for AUDIT in $(ls $GLOB 2>/dev/null); do
  SCANNED=$((SCANNED+1))

  # Extract score claim (first match: NNN.N/10 or NNN.NN/10 or N.N/10)
  SCORE=$(grep -oE "[0-9]+\.[0-9]+/10" "$AUDIT" 2>/dev/null | head -1 | cut -d/ -f1)
  [ -z "$SCORE" ] && continue

  # Compare score >= 7.0 (bash float compare via awk)
  IS_HIGH=$(awk -v s="$SCORE" 'BEGIN{print (s>=7.0)?1:0}')
  [ "$IS_HIGH" = "0" ] && continue

  # Check for "Opus indipendente review" or "external review" mention
  HAS_REVIEW=0
  grep -qE "Opus indipendente|external review|3rd-party review|independent review" "$AUDIT" 2>/dev/null && HAS_REVIEW=1

  # Check for sibling review file
  ITER=$(basename "$AUDIT" | grep -oE "iter[0-9]+|iter-[0-9]+" | head -1)
  REVIEW_FILE_FOUND=0
  if [ -n "$ITER" ]; then
    REVIEW_FILE=$(ls docs/audits/*${ITER}*opus*review*.md 2>/dev/null | head -1)
    [ -n "$REVIEW_FILE" ] && REVIEW_FILE_FOUND=1
  fi

  # Verdict
  if [ "$HAS_REVIEW" = "0" ] && [ "$REVIEW_FILE_FOUND" = "0" ]; then
    echo -e "${R}✗ INFLATION: $AUDIT score=$SCORE/10 (≥7.0) NO Opus indipendente review${N}"
    INFLATIONS+=("$AUDIT score=$SCORE")
  elif [ "$HAS_REVIEW" = "1" ]; then
    echo -e "${G}✓ $AUDIT score=$SCORE/10 mention review keyword${N}"
  elif [ "$REVIEW_FILE_FOUND" = "1" ]; then
    echo -e "${G}✓ $AUDIT score=$SCORE/10 has sibling review file: $REVIEW_FILE${N}"
  fi
done

echo ""
echo -e "${B}Scanned: $SCANNED audit files${N}"

if [ ${#INFLATIONS[@]} -gt 0 ]; then
  echo ""
  echo -e "${R}══════════════════════════════════════════════════════════${N}"
  echo -e "${R}INFLATION DETECTED (${#INFLATIONS[@]})${N}"
  echo -e "${R}══════════════════════════════════════════════════════════${N}"
  for INF in "${INFLATIONS[@]}"; do
    echo -e "${R}  • $INF${N}"
  done
  echo ""
  echo -e "${Y}Action: ogni audit con score ≥7.0 RICHIEDE${N}"
  echo -e "${Y}  (a) menzione 'Opus indipendente review' nel body, OR${N}"
  echo -e "${Y}  (b) file sibling 'docs/audits/<iter>-opus-independent-review.md'${N}"
  exit 1
fi

echo -e "${G}✓ No inflation detected${N}"
exit 0
