#!/bin/bash
# Ardesia — route.sh <ruolo>  (13/06)
# Echoes the model ladder for a role, applying dynamic override (Telegram/malfunzione).
# Fonte: ~/lessonos/routes.env  +  ~/.ardesia-routes.override (vince).
# Ruoli: brain|builder|builder_fable|research|review|adversarial|audit
#
# SECURITY (H2 ee9c76c CRITICO): i file NON vengono `source`-ati. L'override e'
# Telegram-writable = input NON fidato: un `. "$OV"` eseguirebbe bash arbitrario.
# Qui si parsano SOLO assegnamenti `ROUTE_<NOME>="<valore>"` con NOME [A-Z_]+ e
# valore su whitelist [A-Za-z0-9 ._-]; ogni altra riga (codice, $(...), backtick,
# ;, |, redirect) viene IGNORATA. Nessun codice del file viene mai eseguito.
# Portabile a bash 3.2 (macOS): niente array associativi.
set -u

ROLE="$(printf '%s' "${1:-}" | tr '[:lower:]' '[:upper:]')"
[ -n "$ROLE" ] || { echo "uso: route.sh <brain|builder|research|review|adversarial|audit>" >&2; exit 2; }
case "$ROLE" in
  *[!A-Z_]*) echo "route.sh: ruolo non valido: $1" >&2; exit 2 ;;
esac

RC="$HOME/lessonos/routes.env"
OV="$HOME/.ardesia-routes.override"

_assign_re='^ROUTE_([A-Z_]+)="([A-Za-z0-9 ._-]*)"[[:space:]]*$'

_load_routes() {
  local f="$1" line
  [ -f "$f" ] || return 0
  while IFS= read -r line || [ -n "$line" ]; do
    [[ "$line" =~ $_assign_re ]] || continue
    # nome gia' validato da regex ([A-Z_]+) -> assegnamento indiretto sicuro
    printf -v "_ROUTE_${BASH_REMATCH[1]}" '%s' "${BASH_REMATCH[2]}"
  done < "$f"
}

_load_routes "$RC"
_load_routes "$OV"   # override vince (riscrive le stesse variabili)

_var="_ROUTE_${ROLE}"   # ROLE validato [A-Z_]+ sopra
printf '%s\n' "${!_var:-}"
