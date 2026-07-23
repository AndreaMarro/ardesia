#!/usr/bin/env bash
# ARDESIA Convergence — runner unico dei gate T1.
#
# Esegue tutti i gate e tutti i controlli negativi del control plane, dei
# confini architetturali, del ratchet e dell'inventario. Standard library
# Python: nessuna dipendenza. Sola lettura sul prodotto.
#
# NON e' cablato in .github/workflows/ci.yml: aggiungere un required check e'
# un gate umano (design §10, decisione GitHub required-checks). Questo runner
# esiste perche' la CI, quando l'umano lo decide, chiami UNA cosa.
#
# L'inventario resta report-only nel profilo di adozione e diventa bloccante
# con --strict. La CI canary deve usare --strict.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"

usage() {
  cat <<'EOF'
Usage: bash bin/convergence/gate.sh [--strict]

  --strict  rende bloccante anche l'inventario licenze
EOF
}

STRICT=0
case "${1:-}" in
  "")
    ;;
  --strict)
    STRICT=1
    ;;
  -h|--help)
    usage
    exit 0
    ;;
  *)
    echo "gate: unknown argument: $1" >&2
    usage >&2
    exit 2
    ;;
esac
if [[ "$#" -gt 1 ]]; then
  echo "gate: unknown argument: $2" >&2
  usage >&2
  exit 2
fi

GATE_TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/ardesia-convergence.XXXXXX")"
trap 'find "$GATE_TMP_DIR" -depth -delete' EXIT
fail=0
run() {  # run "descrizione" comando...
  local desc="$1"; shift
  if "$@" >"$GATE_TMP_DIR/run.out" 2>&1; then
    echo "  PASS  $desc"
  else
    echo "  FAIL  $desc"
    sed 's/^/        /' "$GATE_TMP_DIR/run.out" | tail -8
    fail=1
  fi
}

echo "== convergence gates (base $(git rev-parse --short=8 origin/main)) =="
run "control-plane negative controls" python3 bin/convergence/test_state.py
run "control-plane state self-validates" python3 bin/convergence/state.py --out "$GATE_TMP_DIR/state.json"
run "boundary negative controls"        python3 bin/convergence/test_boundary.py
run "boundary gate (no new violations)" python3 bin/convergence/boundary_check.py
run "ratchet/evidence negative controls" python3 bin/convergence/test_gates.py
run "evidence self-reference guard"     python3 bin/convergence/evidence_guard.py
run "license inventory negative controls" python3 bin/convergence/test_inventory.py

# ratchet: il conteggio lint lo fornisce la CI; senza, controlla solo i tetti LOC.
run "ratchet (monolith LOC ceilings)"   python3 bin/convergence/ratchet.py

# Inventario licenze: bloccante nel profilo CI strict.
if [[ "$STRICT" -eq 1 ]]; then
  run "license inventory (blocking)"    python3 bin/convergence/license_inventory.py
else
  python3 bin/convergence/license_inventory.py --report-only >/dev/null 2>&1
  echo "  INFO  license inventory: report-only (usa --strict in CI)"
fi

echo "== $([ $fail -eq 0 ] && echo 'ALL PASS' || echo 'FAILURES') =="
exit $fail
