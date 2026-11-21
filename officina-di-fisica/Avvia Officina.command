#!/bin/zsh
cd -- "$(dirname -- "$0")" || exit 1
officina_port="${ASTRA_PORT:-8843}"
officina_url="http://127.0.0.1:$officina_port"
if curl -fsS --max-time 1 "$officina_url/api/health" 2>/dev/null | grep -q '"product":"officina-di-fisica"'; then
  open "$officina_url/"
else
  exec python3 app.py serve --port "$officina_port" --open
fi
