#!/bin/zsh
cd -- "$(dirname -- "$0")" || exit 1
officina_port="${ASTRA_PORT:-8843}"
officina_url="http://127.0.0.1:$officina_port"
officina_pronta() {
  curl -fsS --max-time 1 "$officina_url/api/health" 2>/dev/null | grep -q '"product":"officina-di-fisica"'
}
if officina_pronta; then
  exec python3 app.py autore --port "$officina_port"
fi

python3 app.py serve --port "$officina_port" &
officina_pid=$!
trap 'kill "$officina_pid" 2>/dev/null || true' EXIT
trap 'exit 130' HUP INT TERM
for i in {1..50}; do
  officina_pronta && break
  kill -0 "$officina_pid" 2>/dev/null || exit 1
  sleep 0.3
done
python3 app.py autore --port "$officina_port" || exit 1
echo "Tieni aperta questa finestra mentre usi l’Officina. Per fermarla premi Ctrl+C."
wait "$officina_pid"
