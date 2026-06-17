#!/bin/bash
# ELAB Automa Dispatch — Controlla il loop SENZA interromperlo
# Usage: bash automa/dispatch.sh [command]
#
# Commands:
#   status   — Mostra stato loop + budget
#   score    — Mostra composite score attuale
#   queue    — Mostra coda task
#   results  — Mostra results.tsv
#   log      — Mostra ultimi 30 righe del log
#   add P2 "titolo" "descrizione"  — Aggiungi task alla coda
#   pause    — Metti in pausa il loop
#   resume   — Riprendi il loop
#   halt     — Ferma il loop

cd "$(dirname "$0")/.."
AUTOMA="$(dirname "$0")"

case "${1:-status}" in
  status)
    echo "=== LOOP ==="
    ps aux | grep "orchestrator.py" | grep -v grep | head -1 || echo "❌ NOT RUNNING"
    echo ""
    python3 -c "import json; s=json.load(open('$AUTOMA/state/state.json')); print(json.dumps({k:s.get(k) for k in ['loop','budget']}, indent=2))" 2>/dev/null
    echo ""
    echo "=== SCORE ==="
    python3 -c "import json; d=json.load(open('$AUTOMA/state/last-eval.json')); print(f'composite={d[\"composite\"]:.4f} (cycle {d[\"cycle\"]})')" 2>/dev/null
    echo ""
    echo "=== QUEUE ==="
    echo "pending: $(ls $AUTOMA/queue/pending/*.yaml 2>/dev/null | wc -l | tr -d ' ') | active: $(ls $AUTOMA/queue/active/*.yaml 2>/dev/null | wc -l | tr -d ' ') | done: $(ls $AUTOMA/queue/done/*.yaml 2>/dev/null | wc -l | tr -d ' ')"
    ;;
  score)
    python3 -c "import json; d=json.load(open('$AUTOMA/state/last-eval.json')); print(json.dumps(d, indent=2))" 2>/dev/null
    ;;
  queue)
    echo "=== PENDING ==="
    for f in $AUTOMA/queue/pending/*.yaml; do
      python3 -c "import yaml; d=yaml.safe_load(open('$f')); print(f'  [{d.get(\"priority\",\"?\")}] {d.get(\"title\",\"?\")[:60]}')" 2>/dev/null
    done
    echo ""
    echo "=== ACTIVE ==="
    ls $AUTOMA/queue/active/*.yaml 2>/dev/null || echo "  (none)"
    ;;
  results)
    cat "$AUTOMA/results.tsv"
    ;;
  log)
    tail -${2:-30} "$AUTOMA/logs/orchestrator-$(date +%Y%m%d).log" 2>/dev/null
    ;;
  add)
    echo "$2" > "$AUTOMA/DISPATCH"
    echo "Dispatched: $2"
    ;;
  pause)
    echo "pause" > "$AUTOMA/DISPATCH"
    echo "Loop will pause after current cycle"
    ;;
  halt)
    touch "$AUTOMA/HALT"
    echo "HALT signal sent"
    ;;
  *)
    echo "Usage: bash automa/dispatch.sh [status|score|queue|results|log|add|pause|halt]"
    ;;
esac
