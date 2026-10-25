#!/usr/bin/env bash
# Teacher physics-pathway browser proof against the real Study API on disposable
# SQLite. Reuses the existing synthetic fixture, Vite proxy and Playwright spec.
#
# Security boundary: this runner only creates new, uniquely named directories.
# It never deletes or chmods a caller-provided container, and it preserves the
# per-run artifact directory for diagnosis (including after failure/interrupt).
set -euo pipefail

SELF_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

API_PORT=5321
WEB_PORT=5320
DEFAULT_ARTIFACT_CONTAINER="$ROOT/apps/web/test-results"
ARTIFACT_CONTAINER="${ARDESIA_E2E_ARTIFACTS:-$DEFAULT_ARTIFACT_CONTAINER}"
DATA_CONTAINER="${ARDESIA_E2E_DATA_DIR:-${TMPDIR:-/tmp}}"
RUN_ARTIFACTS=""
QA_DIR=""
CREATED_QA=0
API_PID=""
WEB_PID=""
SELFTEST_SANDBOX=""

log_block() { printf 'BLOCCO  %s\n' "$*" >&2; }
log_warn() { printf 'ATTENZIONE  %s\n' "$*" >&2; }

mode_of() {
  stat -c '%a' "$1" 2>/dev/null || stat -f '%Lp' "$1"
}

path_inside() {
  case "$2" in "$1"/*) return 0 ;; *) return 1 ;; esac
}

require_container_dir() {
  local path="$1" label="$2"
  [ -d "$path" ] || { log_block "$label non e' una directory: $path"; return 1; }
  [ ! -L "$path" ] || { log_block "$label e' un link simbolico: $path"; return 1; }
  if [ ! -O "$path" ] && [ ! -k "$path" ]; then
    log_block "$label non appartiene all'utente e non e' sticky: $path"
    return 1
  fi
  [ -w "$path" ] && [ -x "$path" ] ||
    { log_block "$label non e' scrivibile/eseguibile: $path"; return 1; }
  (cd "$path" && pwd -P)
}

assert_not_in_pr() {
  local path="$1" label="$2"
  if path_inside "$ROOT" "$path"; then
    git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1 ||
      { log_block "repo git non leggibile: $ROOT"; return 1; }
    git -C "$ROOT" check-ignore -q -- "$path" ||
      { log_block "$label dentro il repo ma non ignorati da git: $path"; return 1; }
  fi
}

assert_new_owned_dir() {
  local path="$1" container="$2" prefix="$3"
  [ -d "$path" ] && [ ! -L "$path" ] && [ -O "$path" ] || return 1
  [ "$(dirname "$path")" = "$container" ] || return 1
  case "$(basename "$path")" in "$prefix"*) ;; *) return 1 ;; esac
}

prepare_artifacts() {
  local container
  if [ -z "${ARDESIA_E2E_ARTIFACTS:-}" ]; then
    assert_not_in_pr "$ARTIFACT_CONTAINER/physics-pathways.probe" "artifact" || return 1
    mkdir -p -- "$ARTIFACT_CONTAINER" ||
      { log_block "impossibile creare il contenitore artifact di default"; return 1; }
  fi
  container="$(require_container_dir "$ARTIFACT_CONTAINER" "contenitore artifact")" || return 1
  assert_not_in_pr "$container/physics-pathways.probe" "artifact" || return 1
  RUN_ARTIFACTS="$(mktemp -d "$container/physics-pathways.XXXXXX")" ||
    { log_block "impossibile creare una nuova directory artifact in $container"; return 1; }
  if ! assert_new_owned_dir "$RUN_ARTIFACTS" "$container" "physics-pathways."; then
    rmdir -- "$RUN_ARTIFACTS" 2>/dev/null || true
    RUN_ARTIFACTS=""
    log_block "directory artifact non isolata"
    return 1
  fi
  if ! assert_not_in_pr "$RUN_ARTIFACTS" "artifact"; then
    rmdir -- "$RUN_ARTIFACTS" 2>/dev/null || true
    RUN_ARTIFACTS=""
    return 1
  fi
  ARTIFACT_CONTAINER="$container"
}

prepare_data() {
  local container
  container="$(require_container_dir "$DATA_CONTAINER" "contenitore dati")" || return 1
  assert_not_in_pr "$container/ardesia-physics-pathways.probe" "dati" || return 1
  QA_DIR="$(mktemp -d "$container/ardesia-physics-pathways.XXXXXX")" ||
    { log_block "impossibile creare una nuova directory dati in $container"; return 1; }
  if ! assert_new_owned_dir "$QA_DIR" "$container" "ardesia-physics-pathways."; then
    rmdir -- "$QA_DIR" 2>/dev/null || true
    QA_DIR=""
    log_block "directory dati non isolata"
    return 1
  fi
  if [ -n "$(find "$QA_DIR" -mindepth 1 -maxdepth 1 -print -quit 2>/dev/null || true)" ]; then
    rmdir -- "$QA_DIR" 2>/dev/null || true
    QA_DIR=""
    log_block "la directory dati nuova non e' vuota"
    return 1
  fi
  if ! assert_not_in_pr "$QA_DIR" "dati"; then
    rmdir -- "$QA_DIR" 2>/dev/null || true
    QA_DIR=""
    return 1
  fi
  DATA_CONTAINER="$container"
  CREATED_QA=1
}

safe_remove_qa() {
  [ -n "$QA_DIR" ] || return 0
  [ "$CREATED_QA" -eq 1 ] || return 0
  if [ ! -e "$QA_DIR" ]; then
    QA_DIR=""
    CREATED_QA=0
    return 0
  fi
  if [ ! -d "$QA_DIR" ] || [ -L "$QA_DIR" ] || [ ! -O "$QA_DIR" ] ||
    [ "$(dirname "$QA_DIR")" != "$DATA_CONTAINER" ] ||
    [ "$(basename "$QA_DIR")" = "" ]; then
    log_warn "directory dati non rimossa: identita' non verificata ($QA_DIR)"
    return 0
  fi
  case "$(basename "$QA_DIR")" in
    ardesia-physics-pathways.*) ;;
    *)
      log_warn "directory dati non rimossa: nome inatteso ($QA_DIR)"
      return 0
      ;;
  esac
  rm -rf -- "$QA_DIR"
  QA_DIR=""
  CREATED_QA=0
}

stop_pid() {
  local pid="$1"
  [ -n "$pid" ] || return 0
  kill -0 "$pid" 2>/dev/null || return 0
  kill "$pid" 2>/dev/null || true
  for _ in $(seq 1 50); do
    kill -0 "$pid" 2>/dev/null || return 0
    sleep 0.1
  done
  kill -9 "$pid" 2>/dev/null || true
}

cleanup() {
  local rc=$?
  trap - EXIT INT TERM
  stop_pid "$WEB_PID"
  stop_pid "$API_PID"
  safe_remove_qa
  exit "$rc"
}

check_python() {
  local python="${ARDESIA_STUDY_PYTHON:-$ROOT/services/study-api/.venv/bin/python}"
  if [ ! -x "$python" ]; then
    python="$(command -v python3 || true)"
  fi
  if [ -z "$python" ] || ! "$python" -c 'import pypdf, uvicorn' >/dev/null 2>&1; then
    log_block "serve un Python con pypdf e uvicorn (ARDESIA_STUDY_PYTHON)."
    return 1
  fi
  PYTHON="$python"
}

check_ports() {
  "$PYTHON" - "$API_PORT" "$WEB_PORT" <<'PY'
import socket, sys
for port in sys.argv[1:]:
    with socket.socket() as probe:
        probe.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        probe.bind(("127.0.0.1", int(port)))
PY
}

wait_for_api() {
  for _ in $(seq 1 100); do
    if curl -fsS "http://127.0.0.1:$API_PORT/study/health" \
      -o "$RUN_ARTIFACTS/health-api.json" 2>/dev/null &&
      "$PYTHON" -c 'import json,sys; h=json.load(open(sys.argv[1])); sys.exit(0 if h.get("ok") is True and h.get("synthetic") is True and h.get("persistence")=="sqlite" and h.get("authentication")=="synthetic_session" and h.get("processId")==int(sys.argv[2]) else 1)' \
        "$RUN_ARTIFACTS/health-api.json" "$API_PID"; then
      return 0
    fi
    if ! kill -0 "$API_PID" 2>/dev/null; then
      log_block "il servizio Study API e' uscito durante l'avvio."
      return 1
    fi
    sleep 0.2
  done
  log_block "Study API non pronto su 127.0.0.1:$API_PORT."
  return 1
}

wait_for_web() {
  for _ in $(seq 1 100); do
    if curl -fsS "http://127.0.0.1:$WEB_PORT/" -o /dev/null 2>/dev/null &&
      curl -fsS "http://127.0.0.1:$WEB_PORT/study/health" \
        -o "$RUN_ARTIFACTS/health-web.json" 2>/dev/null &&
      "$PYTHON" -c 'import json,sys; h=json.load(open(sys.argv[1])); sys.exit(0 if h.get("processId")==int(sys.argv[2]) else 1)' \
        "$RUN_ARTIFACTS/health-web.json" "$API_PID"; then
      return 0
    fi
    if ! kill -0 "$WEB_PID" 2>/dev/null; then
      log_block "Vite e' uscito durante l'avvio."
      return 1
    fi
    sleep 0.2
  done
  log_block "anteprima Web non pronta su 127.0.0.1:$WEB_PORT."
  return 1
}

main() {
  check_python || exit 2
  trap cleanup EXIT
  trap 'exit 130' INT
  trap 'exit 143' TERM

  prepare_artifacts || exit 2
  prepare_data || exit 2

  local api_log="$RUN_ARTIFACTS/api.log"
  local web_log="$RUN_ARTIFACTS/web.log"
  local seed_log="$RUN_ARTIFACTS/seed.log"

  if ! check_ports; then
    log_block "porta $API_PORT o $WEB_PORT gia' occupata."
    exit 2
  fi

  export PYTHONPATH="$ROOT/packages/engine:$ROOT/services/study-api${PYTHONPATH:+:$PYTHONPATH}"
  export PYTHONUNBUFFERED=1

  "$PYTHON" "$ROOT/bin/study-demo/seed_course_capabilities.py" \
    --data-dir "$QA_DIR" >"$seed_log" 2>&1
  if [ ! -s "$QA_DIR/study.sqlite" ] || [ ! -s "$QA_DIR/demo-access.json" ]; then
    log_block "fixture sintetica incompleta."
    exit 1
  fi

  "$PYTHON" "$ROOT/bin/study-demo/serve.py" \
    --data-dir "$QA_DIR" --no-seed --no-frontend --port "$API_PORT" \
    >"$api_log" 2>&1 &
  API_PID=$!
  disown "$API_PID" 2>/dev/null || true

  wait_for_api || exit 1

  node "$ROOT/node_modules/vite/bin/vite.js" "$ROOT/apps/web" \
    --host 127.0.0.1 --port "$WEB_PORT" --strictPort >"$web_log" 2>&1 &
  WEB_PID=$!
  disown "$WEB_PID" 2>/dev/null || true

  wait_for_web || exit 1

  set +e
  (
    cd "$ROOT"
    ARDESIA_WEB_URL="http://127.0.0.1:$WEB_PORT" \
    ARDESIA_DEMO_ACCESS="$QA_DIR/demo-access.json" \
    node node_modules/playwright/cli.js test \
      --config apps/web/playwright.config.ts \
      apps/web/e2e/physics-pathways.spec.ts \
      --reporter=line --workers=1 --output "$RUN_ARTIFACTS/playwright"
  )
  local rc=$?
  set -e

  if [ "$rc" -ne 0 ]; then
    printf 'ROSSO  physics-pathways.spec.ts (exit %s). Evidenze: %s\n' "$rc" "$RUN_ARTIFACTS" >&2
    tail -n 40 "$api_log" >&2 || true
    tail -n 40 "$web_log" >&2 || true
  else
    printf 'VERDE  physics-pathways.spec.ts contro API reale e SQLite temporaneo. Evidenze: %s\n' "$RUN_ARTIFACTS"
  fi
  exit "$rc"
}

self_test() {
  local failures=0 sandbox
  sandbox="$(mktemp -d "${TMPDIR:-/tmp}/ardesia-runner-selftest.XXXXXX")"
  SELFTEST_SANDBOX="$sandbox"
  trap 'rm -rf -- "${SELFTEST_SANDBOX:-/nonexistent}"' EXIT

  pass() { printf 'VERDE  %s\n' "$*"; }
  fail() { printf 'ROSSO  %s\n' "$*" >&2; failures=$((failures + 1)); }
  sentinel() {
    mkdir -p -- "$1"
    printf 'sentinel-%s\n' "$(basename "$1")" >"$1/keep.txt"
    chmod 0751 "$1"
  }
  assert_sentinel() {
    [ -f "$1/keep.txt" ] && [ "$(cat "$1/keep.txt")" = "sentinel-$(basename "$1")" ] ||
      fail "sentinella alterata: $1"
    [ "$(mode_of "$1")" = "751" ] || fail "permessi sentinella alterati: $1"
  }

  local art="$sandbox/artifacts"
  local art_real
  sentinel "$art"
  art_real="$(cd "$art" && pwd -P)"
  ARTIFACT_CONTAINER="$art"
  ARDESIA_E2E_ARTIFACTS="$art"
  if prepare_artifacts; then
    assert_sentinel "$art"
    [ "$RUN_ARTIFACTS" != "$art" ] || fail "artifact creati nel contenitore stesso"
    [ "$(dirname "$RUN_ARTIFACTS")" = "$art_real" ] || fail "artifact fuori dal contenitore indicato"
    [ -d "$RUN_ARTIFACTS" ] || fail "directory artifact assente"
    printf 'marker\n' >"$RUN_ARTIFACTS/marker.txt"
    pass "contenitore artifact preesistente intatto, nuova sottodirectory univoca"
  else
    fail "prepare_artifacts ha rifiutato un contenitore valido"
  fi
  local first_artifacts="$RUN_ARTIFACTS"
  if prepare_artifacts; then
    [ "$RUN_ARTIFACTS" != "$first_artifacts" ] || fail "artifact non univoci"
    [ -f "$first_artifacts/marker.txt" ] || fail "artifact precedenti cancellati"
    pass "secondo run artifact distinto, primo run preservato"
  else
    fail "secondo prepare_artifacts fallito"
  fi

  local data="$sandbox/data"
  local data_real
  sentinel "$data"
  data_real="$(cd "$data" && pwd -P)"
  DATA_CONTAINER="$data"
  ARDESIA_E2E_DATA_DIR="$data"
  if prepare_data; then
    assert_sentinel "$data"
    [ "$QA_DIR" != "$data" ] || fail "database creato nel contenitore stesso"
    [ "$(dirname "$QA_DIR")" = "$data_real" ] || fail "database fuori dal contenitore indicato"
    [ -z "$(find "$QA_DIR" -mindepth 1 -maxdepth 1 -print -quit 2>/dev/null || true)" ] ||
      fail "directory dati non vuota prima del seed"
    local first_qa="$QA_DIR"
    safe_remove_qa
    [ ! -e "$first_qa" ] || fail "teardown non ha rimosso la directory dati creata"
    assert_sentinel "$data"
    [ -f "$first_artifacts/marker.txt" ] || fail "teardown ha toccato gli artifact"
    pass "database in directory nuova, sentinelle intatte, teardown isolato"
  else
    fail "prepare_data ha rifiutato un contenitore valido"
  fi

  local missing="$sandbox/missing"
  DATA_CONTAINER="$missing"
  ARDESIA_E2E_DATA_DIR="$missing"
  if prepare_data; then
    fail "contenitore dati mancante accettato"
  else
    [ ! -e "$missing" ] || fail "contenitore dati mancante creato/modificato"
    pass "contenitore dati mancante rifiutato senza crearlo"
  fi

  DATA_CONTAINER="$ROOT/apps/web/e2e"
  ARDESIA_E2E_DATA_DIR="$ROOT/apps/web/e2e"
  if prepare_data; then
    fail "directory tracciata nel repo accettata per i dati"
  else
    [ -z "$(find "$ROOT/apps/web/e2e" -maxdepth 1 -type d -name 'ardesia-physics-pathways.*' -print -quit)" ] ||
      fail "probe dati creata in directory tracciata"
    pass "directory tracciata non ignorata rifiutata senza scriverci"
  fi

  ARTIFACT_CONTAINER="$ROOT/apps/web/e2e"
  ARDESIA_E2E_ARTIFACTS="$ROOT/apps/web/e2e"
  if prepare_artifacts; then
    fail "directory tracciata nel repo accettata per gli artifact"
  else
    [ -z "$(find "$ROOT/apps/web/e2e" -maxdepth 1 -type d -name 'physics-pathways.*' -print -quit)" ] ||
      fail "probe artifact creata in directory tracciata"
    pass "artifact in directory tracciata rifiutati senza scriverci"
  fi

  local fail_art="$sandbox/fail-artifacts" fail_data="$sandbox/fail-data"
  sentinel "$fail_art"
  sentinel "$fail_data"
  (
    # shellcheck disable=SC1090
    source "$SELF_PATH"
    ARTIFACT_CONTAINER="$fail_art"
    ARDESIA_E2E_ARTIFACTS="$fail_art"
    DATA_CONTAINER="$fail_data"
    ARDESIA_E2E_DATA_DIR="$fail_data"
    trap cleanup EXIT
    prepare_artifacts
    prepare_data
    printf 'marker\n' >"$RUN_ARTIFACTS/marker.txt"
    printf '%s\n%s\n' "$QA_DIR" "$RUN_ARTIFACTS" >"$sandbox/failure-paths.txt"
    exit 1
  ) >/dev/null 2>&1 || true
  local fail_qa fail_run
  fail_qa="$(sed -n '1p' "$sandbox/failure-paths.txt")"
  fail_run="$(sed -n '2p' "$sandbox/failure-paths.txt")"
  [ -n "$fail_qa" ] && [ ! -e "$fail_qa" ] || fail "teardown dopo failure non ha rimosso i dati"
  [ -f "$fail_run/marker.txt" ] || fail "teardown dopo failure ha cancellato gli artifact"
  assert_sentinel "$fail_art"
  assert_sentinel "$fail_data"
  pass "teardown dopo failure: dati rimossi, artifact e sentinelle preservati"

  local int_art="$sandbox/int-artifacts" int_data="$sandbox/int-data"
  sentinel "$int_art"
  sentinel "$int_data"
  (
    # shellcheck disable=SC1090
    source "$SELF_PATH"
    ARTIFACT_CONTAINER="$int_art"
    ARDESIA_E2E_ARTIFACTS="$int_art"
    DATA_CONTAINER="$int_data"
    ARDESIA_E2E_DATA_DIR="$int_data"
    trap cleanup EXIT
    trap 'exit 143' TERM
    prepare_artifacts
    prepare_data
    printf 'marker\n' >"$RUN_ARTIFACTS/marker.txt"
    printf '%s\n%s\n' "$QA_DIR" "$RUN_ARTIFACTS" >"$sandbox/interrupt-paths.txt"
    printf 'ready\n' >"$sandbox/interrupt-ready"
    while :; do sleep 0.1; done
  ) >/dev/null 2>&1 &
  local child=$!
  for _ in $(seq 1 100); do
    [ -f "$sandbox/interrupt-ready" ] && break
    sleep 0.05
  done
  if [ ! -f "$sandbox/interrupt-ready" ]; then
    fail "processo di interruzione non pronto"
    kill -9 "$child" 2>/dev/null || true
  else
    kill -TERM "$child" 2>/dev/null || true
    wait "$child" 2>/dev/null || true
    local int_qa int_run
    int_qa="$(sed -n '1p' "$sandbox/interrupt-paths.txt")"
    int_run="$(sed -n '2p' "$sandbox/interrupt-paths.txt")"
    [ -n "$int_qa" ] && [ ! -e "$int_qa" ] || fail "teardown dopo interruzione non ha rimosso i dati"
    [ -f "$int_run/marker.txt" ] || fail "teardown dopo interruzione ha cancellato gli artifact"
    assert_sentinel "$int_art"
    assert_sentinel "$int_data"
    pass "teardown dopo SIGTERM: dati rimossi, artifact e sentinelle preservati"
  fi

  local unrelated="$sandbox/unrelated"
  sentinel "$unrelated"
  assert_sentinel "$unrelated"
  pass "file estranei ai contenitori intatti"

  if [ "$failures" -ne 0 ]; then
    printf 'ROSSO  self-test runner: %s controlli falliti\n' "$failures" >&2
    exit 1
  fi
  printf 'VERDE  self-test runner: contenitori, sentinelle, failure e interruzione\n'
}

if [ "${BASH_SOURCE[0]}" = "$0" ]; then
  case "${1:-}" in
    --self-test) self_test ;;
    "") main ;;
    *)
      printf 'uso: %s [--self-test]\n' "$0" >&2
      exit 2
      ;;
  esac
fi
