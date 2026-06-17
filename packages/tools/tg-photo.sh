#!/bin/bash
# MAESTRO — manda una FOTO su Telegram. Uso: tg-photo.sh <file.png> [caption...]
CONF="$HOME/.maestro-telegram"
[ -f "$CONF" ] || exit 0
. "$CONF"
[ -n "${TG_TOKEN:-}" ] && [ -n "${TG_CHAT:-}" ] || exit 0
F="$1"; shift
[ -f "$F" ] || { echo "tg-photo: file assente: $F" >&2; exit 1; }
curl -s -m 30 "https://api.telegram.org/bot${TG_TOKEN}/sendPhoto" \
  -F chat_id="${TG_CHAT}" -F photo=@"$F" -F caption="Ardesia: $*" >/dev/null 2>&1 || true
