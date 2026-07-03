#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  cat <<'EOF'
Usage: npm run <script>

Root scripts:
  status             Print repository/workspace readiness.
  bootstrap          Install core workspace dependencies.
  bootstrap:all      Install core plus ELAB plugin dependencies.
  dev:studio         Start ARDESIA Studio dev server.
  dev:elab           Start ELABTutor plugin dev server.
  test               Run core tests.
  test:elab          Run ELABTutor plugin tests.
  typecheck          Run core TypeScript checks.
  build              Build core workspaces.
  build:elab         Build ELABTutor plugin.
  verify             Run core tests plus builds.
  verify:elab        Run ELABTutor tests plus build.
  factory:readonly   Print remote factory health without mutation.
EOF
}

has_cmd() {
  command -v "$1" >/dev/null 2>&1
}

print_workspace() {
  local label="$1"
  local path="$2"
  local marker="$3"

  if [[ -e "$ROOT/$path/$marker" ]]; then
    printf "ok    %s (%s)\n" "$label" "$path"
  elif [[ -d "$ROOT/$path" ]]; then
    printf "warn  %s exists but %s is missing\n" "$label" "$marker"
  else
    printf "miss  %s (%s)\n" "$label" "$path"
  fi
}

status() {
  cd "$ROOT"

  echo "== git =="
  git status -sb

  echo
  echo "== workspaces =="
  print_workspace "engine" "packages/engine" "pyproject.toml"
  print_workspace "studio" "apps/studio" "package.json"
  print_workspace "elab tutor" "plugins/elab-tutor" "package.json"
  print_workspace "ops tools" "ops/tools" "package.json"

  echo
  echo "== tools =="
  if has_cmd uv; then
    printf "ok    uv %s\n" "$(uv --version)"
  else
    echo "miss  uv"
  fi
  if has_cmd npm; then
    printf "ok    npm %s\n" "$(npm --version)"
  else
    echo "miss  npm"
  fi

  echo
  echo "== root scripts =="
  npm run --silent || true
}

bootstrap_core() {
  cd "$ROOT"
  uv --directory packages/engine sync
  npm --prefix apps/studio ci
}

bootstrap_all() {
  cd "$ROOT"
  bootstrap_core
  npm --prefix plugins/elab-tutor ci
  if [[ -f ops/tools/package-lock.json ]]; then
    npm --prefix ops/tools ci
  fi
}

test_core() {
  cd "$ROOT"
  env -u KIMI_API_KEY -u DEEPSEEK_API_KEY uv --directory packages/engine run pytest -q --no-header
  npm --prefix apps/studio test -- --run
}

test_elab() {
  cd "$ROOT"
  npm --prefix plugins/elab-tutor test -- --run
}

typecheck_core() {
  cd "$ROOT"
  npm --prefix apps/studio run typecheck
}

build_core() {
  cd "$ROOT"
  npm --prefix apps/studio run build
}

build_elab() {
  cd "$ROOT"
  npm --prefix plugins/elab-tutor run build
}

verify_core() {
  test_core
  typecheck_core
  build_core
}

verify_elab() {
  test_elab
  build_elab
}

# STOP-safe: probe di stato process-only. Non esegue MAI script del repo
# lessonos (niente eval/gate.sh, niente pytest): solo curl di health endpoint
# e ispezione launchctl/ps. Se compare una riga hourly/gate/pytest, va
# documentata e segnalata — mai killata da qui.
factory_readonly() {
  if ! has_cmd ssh; then
    echo "ssh not available"
    return 1
  fi

  ssh macmini 'set -u
    echo "== headroom ==";
    curl -sf --max-time 3 http://127.0.0.1:8787/health 2>/dev/null || true;
    echo;
    echo "== agentmemory livez ==";
    curl -sf --max-time 3 http://127.0.0.1:3111/agentmemory/livez 2>/dev/null || true;
    echo;
    echo "== launchd (lessonos/agentmemory) ==";
    launchctl list | grep -iE "lessonos|agentmemory" || true;
    echo "== processi fabbrica (atteso: nessuno con STOP attivo) ==";
    ps aux | grep -iE "hourly-tick|driver-orch|eval/gate|uv run pytest|pytest -q" | grep -v grep || true'
}

main() {
  local command="${1:-}"

  case "$command" in
    status) status ;;
    bootstrap-core) bootstrap_core ;;
    bootstrap-all) bootstrap_all ;;
    test-core) test_core ;;
    test-elab) test_elab ;;
    typecheck-core) typecheck_core ;;
    build-core) build_core ;;
    build-elab) build_elab ;;
    verify-core) verify_core ;;
    verify-elab) verify_elab ;;
    factory-readonly) factory_readonly ;;
    "" | -h | --help | help) usage ;;
    *)
      echo "Unknown command: $command" >&2
      usage >&2
      return 64
      ;;
  esac
}

main "$@"
