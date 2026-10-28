#!/usr/bin/env bash
# LocalChecks — l'oracolo a costo zero di token, DAVANTI al revisore.
#
# Architettura:  Worker -> LocalChecks -> Verifier
#
# Il revisore avversariale (Hermes, sul Mac mini) e' la risorsa piu' costosa del
# loop: 20-40 minuti per round. Il 2026-07-30 la classificazione di venti finding
# confermati su sei round ha dato **16 su 20 meccanicamente controllabili**: l'80%
# del budget del revisore andava su difetti che uno script trova in due secondi.
#
# Regola operativa, senza eccezioni: se questo script esce != 0, lo stato
# terminale dell'unita' e' BLOCKED_BEFORE_REVIEW e **Hermes non parte**.
#
# Tre invarianti, ognuna da un errore gia' pagato:
#
#  1. Ogni exit code e' letto SUBITO e SENZA pipe. `cmd | tail; echo $?` riporta
#     l'exit di `tail`: la misura risponde a un'altra domanda.
#  2. Il log resta GREZZO. Un riassunto «solo-fallimenti» rende indistinguibili
#     *zero test raccolti*, *cartella vuota* e *2040 test verdi* — e questo
#     registro contiene quella classe di bug due volte.
#  3. L'assert sta sul NUMERO DI TEST ATTESI, non sull'assenza di fallimenti.
#     Una suite che non raccoglie nulla esce 0. Il pavimento sta in
#     bin/ci/local_checks.floor e sale, non scende.
#
# Uso:
#   bin/ci/local_checks.sh            # tutto: gate python + typecheck + vitest + build
#   bin/ci/local_checks.sh --fast     # solo i gate python (secondi)
#   bin/ci/local_checks.sh --self-test
set -u -o pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STUDIO="$ROOT/apps/studio"
FLOOR_FILE="$ROOT/bin/ci/local_checks.floor"
LOGDIR="${ARDESIA_LOCALCHECKS_LOGDIR:-$ROOT/artifacts/localchecks}"

MODE="full"
case "${1:-}" in
  --fast) MODE="fast" ;;
  --self-test) MODE="self-test" ;;
  "") ;;
  *) echo "uso: $0 [--fast|--self-test]" >&2; exit 2 ;;
esac

mkdir -p "$LOGDIR"

# nome | exit | log
RESULTS=()
FAILED=0

run_check() {
  local name="$1" cwd="$2"; shift 2
  local log="$LOGDIR/${name}.log"
  # niente pipe: l'exit letto e' quello del comando, non di un filtro.
  # `cwd` viene catturato PRIMA dello shift: la prima versione usava `$2` dopo
  # uno `shift`, quindi `cd` riceveva il nome del comando e tutti e dodici i
  # gate uscivano 1. Ha fallito chiuso, non aperto — ma il self-test copriva il
  # parser e non il runner, che e' la parte che decide se Hermes parte.
  ( cd "$cwd" && exec "$@" ) > "$log" 2>&1
  local rc=$?
  RESULTS+=("$name|$rc|$log")
  if [ "$rc" -ne 0 ]; then FAILED=1; fi
  printf '  %-28s exit=%s  %s\n' "$name" "$rc" "$log"
  return 0
}

read_floor() {
  local key="$1"
  if [ ! -f "$FLOOR_FILE" ]; then echo ""; return 0; fi
  # formato: chiave=valore, una per riga
  local v
  v=$(grep -E "^${key}=" "$FLOOR_FILE" 2>/dev/null | tail -1)
  echo "${v#*=}"
}

# Conta i test VERAMENTE eseguiti leggendo la riga di riepilogo di vitest.
# Falsificatore: se la riga non c'e', il conteggio e' vuoto e l'assert fallisce
# invece di passare — un parser rotto NON deve fallire aperto.
count_vitest_tests() {
  local log="$1"
  grep -Eo '^[[:space:]]*Tests[[:space:]]+.*' "$log" 2>/dev/null \
    | tail -1 \
    | grep -Eo '[0-9]+ passed' \
    | grep -Eo '[0-9]+' \
    | tail -1
}

self_test() {
  local tmp fails=0
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' RETURN

  # 1. una suite con zero test raccolti non deve superare il pavimento
  printf ' Test Files  no test files found\n' > "$tmp/vuoto.log"
  local n; n="$(count_vitest_tests "$tmp/vuoto.log")"
  if [ -n "$n" ]; then
    echo "ROSSO  suite vuota conta '$n' invece di niente"; fails=$((fails+1))
  fi

  # 2. una riga di riepilogo reale viene letta
  printf '\n Test Files  183 passed (183)\n      Tests  2088 passed (2088)\n' > "$tmp/pieno.log"
  n="$(count_vitest_tests "$tmp/pieno.log")"
  if [ "$n" != "2088" ]; then
    echo "ROSSO  riepilogo reale letto come '$n', atteso 2088"; fails=$((fails+1))
  fi

  # 3. log troncato a meta' -> nessun numero, non un numero sbagliato
  printf ' Tests  12 pas' > "$tmp/tronco.log"
  n="$(count_vitest_tests "$tmp/tronco.log")"
  if [ -n "$n" ]; then
    echo "ROSSO  log troncato conta '$n' invece di niente"; fails=$((fails+1))
  fi

  # 4. il file di pavimento esiste ed e' leggibile
  if [ ! -f "$FLOOR_FILE" ]; then
    echo "ROSSO  pavimento assente: $FLOOR_FILE"; fails=$((fails+1))
  fi

  # 5. il RUNNER stesso. La prima versione mandava dodici gate su dodici a
  #    exit=1 perche' `cd` riceveva l'argomento sbagliato; nessun controllo lo
  #    vedeva. Qui il runner viene esercitato su due comandi di esito noto.
  local saved_logdir="$LOGDIR" saved_failed="$FAILED"
  local saved_results=("${RESULTS[@]:-}")
  LOGDIR="$tmp"; FAILED=0; RESULTS=()
  run_check "runner_ok" "$tmp" true      > /dev/null
  run_check "runner_ko" "$tmp" false     > /dev/null
  local ok_rc ko_rc
  ok_rc="$(printf '%s\n' "${RESULTS[@]}" | grep '^runner_ok|' | cut -d'|' -f2)"
  ko_rc="$(printf '%s\n' "${RESULTS[@]}" | grep '^runner_ko|' | cut -d'|' -f2)"
  LOGDIR="$saved_logdir"; RESULTS=("${saved_results[@]:-}"); FAILED="$saved_failed"
  if [ "$ok_rc" != "0" ]; then
    echo "ROSSO  runner: un comando che riesce riporta exit=$ok_rc"; fails=$((fails+1))
  fi
  if [ "$ko_rc" != "1" ]; then
    echo "ROSSO  runner: un comando che fallisce riporta exit=$ko_rc"; fails=$((fails+1))
  fi

  if [ "$fails" -ne 0 ]; then
    echo "self-test: $fails falliti"; return 1
  fi
  echo "self-test: 6 controlli, tutti verdi"
  return 0
}

if [ "$MODE" = "self-test" ]; then
  self_test
  exit $?
fi

echo "LocalChecks — modo: $MODE — log grezzi in $LOGDIR"
echo

# --- gate python: secondi, nessuna dipendenza da node ---------------------
run_check "nul_scan"            "$ROOT" python3 bin/ci/nul_scan.py
run_check "secret_scan"         "$ROOT" python3 bin/ci/secret_scan.py
run_check "secret_scan_tests"   "$ROOT" python3 bin/ci/test_secret_scan.py
run_check "elab_boundary"       "$ROOT" python3 bin/ci/elab_boundary_gate.py
run_check "removed_boundary_tests" "$ROOT" python3 bin/ci/test_elab_boundary_gate.py
run_check "workflow_trigger"    "$ROOT" python3 bin/ci/workflow_trigger_gate.py
run_check "workflow_trigger_st" "$ROOT" python3 bin/ci/workflow_trigger_gate.py --self-test
run_check "doc_claims"          "$ROOT" python3 bin/ci/doc_claims_gate.py
run_check "doc_claims_st"       "$ROOT" python3 bin/ci/doc_claims_gate.py --self-test
run_check "project_state_st"    "$ROOT" python3 bin/state/project_state.py --self-test
run_check "project_state_tests" "$ROOT" python3 bin/state/test_project_state.py
run_check "project_state_verify" "$ROOT" python3 bin/state/project_state.py --verify
run_check "local_checks_st"     "$ROOT" bash bin/ci/local_checks.sh --self-test
run_check "backup_now_tests"    "$ROOT" bash bin/ci/test_backup_now.sh

if [ "$MODE" = "full" ]; then
  if [ ! -d "$STUDIO/node_modules" ]; then
    echo
    echo "BLOCCATO  $STUDIO/node_modules assente: esegui 'npm ci' prima, oppure usa --fast."
    echo "          (un oracolo che salta in silenzio i tre check piu' importanti"
    echo "           e' indistinguibile da un oracolo verde: qui fallisce, di proposito)"
    exit 3
  fi
  export NODE_OPTIONS="${NODE_OPTIONS:---no-experimental-webstorage}"
  # profilo deterministico identico a quello della CI: pool diverso = risultato
  # diverso, e `npm run verify` NON e' il comando della CI.
  run_check "typecheck" "$STUDIO" npm run typecheck
  run_check "vitest"    "$STUDIO" npx vitest run \
      --pool=threads --maxWorkers=1 --no-file-parallelism \
      --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
  run_check "build"     "$STUDIO" npm run build

  # --- assert sul NUMERO di test, non sull'assenza di fallimenti -----------
  VLOG="$LOGDIR/vitest.log"
  FLOOR="$(read_floor studio_tests_min)"
  COUNT="$(count_vitest_tests "$VLOG")"
  echo
  if [ -z "$FLOOR" ]; then
    echo "  test_count                  BLOCCATO: pavimento 'studio_tests_min' assente in $FLOOR_FILE"
    FAILED=1
  elif [ -z "$COUNT" ]; then
    echo "  test_count                  BLOCCATO: nessuna riga di riepilogo in $VLOG"
    echo "                              (zero test raccolti e' indistinguibile da 2040 verdi:"
    echo "                               senza il numero, l'exit 0 non e' evidenza)"
    FAILED=1
  elif [ "$COUNT" -lt "$FLOOR" ]; then
    echo "  test_count                  ROSSO: $COUNT test < pavimento $FLOOR"
    FAILED=1
  else
    printf '  %-28s VERDE: %s test >= pavimento %s\n' "test_count" "$COUNT" "$FLOOR"
  fi
fi

echo
echo "----------------------------------------------------------------"
for r in "${RESULTS[@]}"; do
  IFS='|' read -r n rc lg <<< "$r"
  [ "$rc" -ne 0 ] && printf 'FALLITO  %-28s exit=%s  %s\n' "$n" "$rc" "$lg"
done

if [ "$FAILED" -ne 0 ]; then
  echo
  echo "STATO TERMINALE: BLOCKED_BEFORE_REVIEW"
  echo "Hermes NON parte. Correggi, rilancia, e solo allora chiedi la revisione."
  exit 1
fi

echo
echo "STATO TERMINALE: READY_FOR_REVIEW  (modo: $MODE)"
[ "$MODE" = "fast" ] && echo "ATTENZIONE: --fast NON ha eseguito typecheck, vitest e build."
exit 0
