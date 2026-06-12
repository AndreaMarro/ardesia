#!/usr/bin/env bash
# MAESTRO coord-lint: ripara SOLO la corruzione nota di COORDINATION (prefissi | / NN| dell'editor).
# Trasformazioni content-preserving (mai cancella righe non vuote). Heading duplicati = WARN, mai auto-fix.
set -euo pipefail
cd "$HOME/lessonos"
F=COORDINATION.md
if grep -qE '^(\|+|([0-9]+\|)+)' "$F"; then
  /usr/bin/sed -i '' -E \
    -e 's/^([0-9]+\|)+//' \
    -e 's/^\|+[[:space:]]*$//' \
    -e 's/^\|+(-|\*|#)/\1/' \
    -e 's/^\|+([A-Za-z])/\1/' "$F"
  git add "$F" && git commit -q -m "lint(coord): rimossi prefissi corrotti [coord-lint]" || true
  echo "[coord-lint] prefissi corrotti rimossi"
fi
HN=$(grep -c '^## NEEDS-CLAUDE' "$F" || true)
[ "$HN" -le 1 ] || echo "[coord-lint] WARN: heading NEEDS-CLAUDE duplicato ($HN) — pulizia manuale supervisore"
