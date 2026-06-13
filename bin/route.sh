#!/bin/bash
# Ardesia — route.sh <ruolo>  (13/06)
# Echoes the model ladder for a role, applying dynamic override (Telegram/malfunzione).
# Fonte: ~/lessonos/routes.env  +  ~/.ardesia-routes.override (vince).
# Ruoli: brain|builder|builder_fable|research|review|adversarial|audit
ROLE="$(printf '%s' "${1:-}" | tr '[:lower:]' '[:upper:]')"
[ -n "$ROLE" ] || { echo "uso: route.sh <brain|builder|research|review|adversarial|audit>" >&2; exit 2; }
RC="$HOME/lessonos/routes.env"
OV="$HOME/.ardesia-routes.override"
[ -f "$RC" ] && . "$RC"
[ -f "$OV" ] && . "$OV"   # override vince
var="ROUTE_${ROLE}"
printf '%s\n' "${!var}"
