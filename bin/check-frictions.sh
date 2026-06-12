#!/bin/bash
# LessonOS — GUARD ANTI-RICORRENZA. Scansiona i RETRO in PROCESS-LOG.md, individua gli
# attriti che ricorrono (>=2 volte: marker "pattern Nx", "cronico", "stessi RETRO",
# "ricorr...") e per ognuno verifica che esista una skill in skills/ o un guard.
# Se un attrito ricorrente non è coperto -> WARNING (la ricorrenza viene RILEVATA).
# Convenzione (skills/README.md): nessun attrito ricorrente può restare solo loggato.
# Uso: bin/check-frictions.sh [--strict]   (--strict: exit non-zero se ci sono WARNING)
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
LOG="PROCESS-LOG.md"
strict=0; [ "${1:-}" = "--strict" ] && strict=1
[ -f "$LOG" ] || { echo "check-frictions: $LOG mancante"; exit 1; }

# Mappa keyword-attrito -> copertura (skill in skills/ oppure 'accepted' come decisione).
# Ogni riga: <regex-keyword>::<copertura>  (copertura = path skill OPPURE la parola accepted)
mappings=(
  "grounding|seg_id|excerpt|citazion|docstring|claim non|case-insensitive::skills/lessonos-grounding-check.md"
  "SHA|hex|>=|determinist::skills/test-determinism.md"
  "non caricat|autoload|carico esplicito|skill .* esist::skills/review-autoload.md"
  "JSON fenced|extract_json|fence markdown::lessonos/capsule/parsing.py"
  "auth-loop|Keychain::accepted"
  "observations saltat|obs .* saltat|Observations saltat::accepted"
  "NOOP loop|stewardship mode|stewardship::accepted"
)

# Estrai le righe-attrito che segnalano ricorrenza.
recurring="$(grep -nEi 'pattern [0-9]+x|pattern cronico|cronico|stessi RETRO|ricorr|emergente \(2 iter|2x\)' "$LOG" || true)"
[ -z "$recurring" ] && { echo "check-frictions: nessun attrito ricorrente rilevato nei RETRO."; exit 0; }

warnings=0; covered=0
echo "check-frictions: attriti ricorrenti rilevati in $LOG ->"
while IFS= read -r line; do
  [ -z "$line" ] && continue
  lineno="${line%%:*}"
  hit=""
  for m in "${mappings[@]}"; do
    kw="${m%%::*}"; cov="${m##*::}"
    if printf '%s' "$line" | grep -qEi "$kw"; then hit="$cov"; break; fi
  done
  snippet="$(printf '%s' "$line" | sed -E 's/^[0-9]+://; s/^[[:space:]]*//' | cut -c1-90)"
  if [ -z "$hit" ]; then
    echo "  [WARN] L$lineno attrito ricorrente NON mappato a skill/guard: $snippet..."
    warnings=$((warnings+1))
  elif [ "$hit" = "accepted" ]; then
    echo "  [OK/accepted] L$lineno vincolo architetturale accettato: $snippet..."
    covered=$((covered+1))
  elif [ -f "$hit" ]; then
    echo "  [OK] L$lineno coperto da $hit"
    covered=$((covered+1))
  else
    echo "  [WARN] L$lineno attrito mappato a $hit MA il file MANCA: $snippet..."
    warnings=$((warnings+1))
  fi
done <<< "$recurring"

echo "check-frictions: coperti=$covered warning=$warnings"
if [ "$warnings" -gt 0 ]; then
  echo "check-frictions: $warnings attrito/i ricorrente/i SENZA skill o guard — crea una skill in skills/ o un guard."

### GUARD: placeholder date (M2-6)
PLACEHOLDER_COUNT=0
for _f in "$PROJECT_ROOT/STATUS.md" "$PROJECT_ROOT/log.jsonl" "$PROJECT_ROOT/COORDINATION.md"; do
  if [ -f "$_f" ]; then
    _c=$(grep -c '(current)' "$_f" 2>/dev/null || echo 0)
    if [ "$_c" -gt 0 ]; then
      echo "  ⚠ PLACEHOLDER DATE: $_f ha $_c occorrenze di '(current)'"
      PLACEHOLDER_COUNT=$((PLACEHOLDER_COUNT + _c))
    fi
    _c2=$(grep -c '(executed)' "$_f" 2>/dev/null || echo 0)
    if [ "$_c2" -gt 0 ]; then
      echo "  ⚠ PLACEHOLDER DATE: $_f ha $_c2 occorrenze di '(executed)'"
      PLACEHOLDER_COUNT=$((PLACEHOLDER_COUNT + _c2))
    fi
    # Also check for hallucinated dates (months ahead)
    _now_month=$(date +%m)
    _now_year=$(date +%Y)
    # Use a broad pattern that catches dates anywhere in the line, not anchored
    _c3=$(grep -cE "$(_now_year)-(1[3-9]|2[0-9]|0[0-9])" "$_f" 2>/dev/null || echo 0)
    if [ "$_c3" -gt 0 ]; then
      echo "  ⚠ HALLUCINATED DATE: $_f ha date in mesi >=13 (impossibili)"
      PLACEHOLDER_COUNT=$((PLACEHOLDER_COUNT + _c3))
    fi
  fi
done
if [ "$PLACEHOLDER_COUNT" -gt 0 ]; then
  echo "  ⚠ TOTALE: $PLACEHOLDER_COUNT placeholder/hallucinated dates — bonifica con bin/fix-date-placeholders.py"
fi

  [ "$strict" = 1 ] && exit 2
fi
exit 0
