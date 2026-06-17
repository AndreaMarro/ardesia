#!/bin/bash
# MAESTRO — notifica Telegram (bot). Usato da supervisor-tick (alert) e utilizzabile a mano.
# Config: ~/.maestro-telegram con DUE righe:  TG_TOKEN=123:abc   TG_CHAT=123456789
# (chmod 600; MAI in chat/commit). Senza config: esce zitto (mai bloccante).
CONF="$HOME/.maestro-telegram"
[ -f "$CONF" ] || exit 0
. "$CONF"
[ -n "${TG_TOKEN:-}" ] && [ -n "${TG_CHAT:-}" ] || exit 0
curl -s -m 10 "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
  -d chat_id="${TG_CHAT}" --data-urlencode text="Ardesia: $*" >/dev/null 2>&1 || true
