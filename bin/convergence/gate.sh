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
# Nota: license_inventory esce 1 finche' manca la LICENSE root (D-2 umana). E'
# incluso come report non bloccante nel runner, cosi' il gate strutturale resta
# verde mentre la decisione legale resta visibile. Usa --strict per bloccare.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"

STRICT="${1:-}"
fail=0
run() {  # run "descrizione" comando...
  local desc="$1"; shift
  if "$@" >/tmp/conv_gate.out 2>&1; then
    echo "  PASS  $desc"
  else
    echo "  FAIL  $desc"
    sed 's/^/        /' /tmp/conv_gate.out | tail -8
    fail=1
  fi
}

# La base e' origin/main. In CI serve un checkout con fetch-depth: 0, altrimenti
# refs/remotes/origin/main non esiste e state.py fallisce esplicitamente: meglio
# un errore leggibile qui che un gate che gira su una base che non e' quella.
base_ref="$(git rev-parse --short=8 origin/main 2>/dev/null || echo 'origin/main ASSENTE')"
echo "== convergence gates (base ${base_ref}) =="
run "control-plane negative controls" python3 bin/convergence/test_state.py
run "control-plane state self-validates" python3 bin/convergence/state.py --out /tmp/conv_state.json
run "boundary negative controls"        python3 bin/convergence/test_boundary.py
run "boundary gate (no new violations)" python3 bin/convergence/boundary_check.py
run "ratchet/evidence negative controls" python3 bin/convergence/test_gates.py
run "evidence self-reference guard"     python3 bin/convergence/evidence_guard.py
run "license inventory negative controls" python3 bin/convergence/test_inventory.py
# Il manifest si EMETTE solo dove esiste un dist (job di build / release umano);
# qui giro i controlli negativi, che non hanno bisogno di artefatti reali.
run "release manifest negative controls" python3 bin/convergence/test_release.py
run "plugin trust negative controls"    python3 bin/convergence/test_plugin_trust.py
run "plugin trust source invariants"    python3 bin/convergence/plugin_trust.py --check-source
run "guest dependency negative controls" python3 bin/convergence/test_guest_deps.py
run "guest dependency ratchet (ELAB)" python3 bin/convergence/guest_deps.py

# ratchet: il conteggio lint lo fornisce la CI; senza, controlla solo i tetti LOC.
run "ratchet (monolith LOC ceilings)"   python3 bin/convergence/ratchet.py

# inventario licenze: bloccante solo in --strict (la LICENSE e' D-2 umana).
if [[ "$STRICT" == "--strict" ]]; then
  run "license inventory (blocking)"    python3 bin/convergence/license_inventory.py
else
  python3 bin/convergence/license_inventory.py --report-only >/dev/null 2>&1
  echo "  INFO  license inventory: report-only (LICENSE root e' D-2 umana)"
fi

echo "== $([ $fail -eq 0 ] && echo 'ALL PASS' || echo 'FAILURES') =="
exit $fail
