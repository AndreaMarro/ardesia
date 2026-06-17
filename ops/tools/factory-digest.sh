#!/bin/bash
# Ardesia — invia il digest fabbrica a Telegram (READ-ONLY, no hot-path). launchd com.ardesia.factory-digest (giornaliero).
MSG="$(python3 "$HOME/maestro-tools/factory-metrics.py" --digest 2>/dev/null)"
[ -n "$MSG" ] && bash "$HOME/maestro-tools/notify-telegram.sh" "$MSG"
