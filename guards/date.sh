# Guard: placeholder dates (M2-6)
# SINGLE SOURCE OF TRUTH — sourced by check-frictions.sh and fix-date-placeholders.py.
#
# Scansiona STATUS.md, log.jsonl, COORDINATION.md per placeholder (current)/(executed)
# e date allucinate (mesi >=13). Definisce _guard_date_check() che popola PLACEHOLDER_COUNT.

_guard_date_check() {
  PLACEHOLDER_COUNT=0
  for _f in "$PROJECT_ROOT/STATUS.md" "$PROJECT_ROOT/log.jsonl" "$PROJECT_ROOT/COORDINATION.md"; do
    if [ -f "$_f" ]; then
      _c=$(grep -c '(current)' "$_f" 2>/dev/null || true)
      if [ "${_c:-0}" -gt 0 ]; then
        echo "  ⚠ PLACEHOLDER DATE: $_f ha ${_c:-0} occorrenze di '(current)'"
        PLACEHOLDER_COUNT=$((PLACEHOLDER_COUNT + _c))
      fi
      _c2=$(grep -c '(executed)' "$_f" 2>/dev/null || true)
      if [ "${_c2:-0}" -gt 0 ]; then
        echo "  ⚠ PLACEHOLDER DATE: $_f ha ${_c2:-0} occorrenze di '(executed)'"
        PLACEHOLDER_COUNT=$((PLACEHOLDER_COUNT + _c2))
      fi
      # Hallucinated dates: months 13-99 (e.g., 2026-42, 2026-99)
      _now_year="$(date +%Y)"
      _c3=$(grep -cE "${_now_year}-(1[3-9]|[2-9][0-9])" "$_f" 2>/dev/null || true)
      if [ "${_c3:-0}" -gt 0 ]; then
        echo "  ⚠ HALLUCINATED DATE: $_f ha ${_c3:-0} date con mese >=13 (impossibili)"
        PLACEHOLDER_COUNT=$((PLACEHOLDER_COUNT + _c3))
      fi
    fi
  done
  if [ "$PLACEHOLDER_COUNT" -gt 0 ]; then
    echo "  ⚠ TOTALE: $PLACEHOLDER_COUNT placeholder/hallucinated dates — bonifica con bin/fix-date-placeholders.py"
  fi
}
