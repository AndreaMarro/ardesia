#!/bin/bash
# Ardesia — autoheal.sh <repo>  (13/06)
# Previene il GRIDLOCK pin-stale (task gia fatta ma pin mai ruotato -> NOOP infinito -> STOP).
# Chiamato dal driver SU NOOP. Conta gli NOOP consecutivi; a >=2 marca il pin esaurito,
# promuove dalla coda (o avvisa Telegram se vuota). Reset su 'pass' (lo fa il driver).
repo="$1"; [ -n "$repo" ] || exit 0
cd "$HOME/lessonos" || exit 0
SF="$HOME/.noop_streak_$repo"
n=$(cat "$SF" 2>/dev/null || echo 0); n=$((n+1)); echo "$n" > "$SF"
[ "$n" -lt 2 ] && { echo "[autoheal] $repo: NOOP streak $n (<2), attendo"; exit 0; }

echo "[autoheal] $repo: NOOP streak $n >=2 -> marco pin esaurito + promuovo"
python3 "$HOME/lessonos/bin/mark_pin_done.py" "$repo" "NOOP x$n" || { echo "[autoheal] mark fallito"; exit 0; }
if python3 "$HOME/lessonos/bin/promote_pin.py" "$repo"; then
  echo "[autoheal] $repo: pin stale -> promossa task dalla coda"
else
  bash "$HOME/maestro-tools/notify-telegram.sh" "Ardesia: coda $repo vuota e pin esaurito (auto-heal dopo $n NOOP, nessun grind). In attesa di un ordine. Da qui: scrivi  pin $repo <descrizione task>  per assegnarne uno, oppure  coda  per vedere lo stato." 2>/dev/null || true
  echo "[autoheal] $repo: coda vuota -> avvisato Telegram"
fi
rm -f "$SF"
