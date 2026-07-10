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
  preview:studio:check
                     Run the no-deploy Studio preview readiness gate.
  preview:studio:preflight
                     Check Vercel readiness plus the no-deploy Studio gate.
  smoke:studio:production
                     Run browser smoke against ARDESIA Studio production URL.
  smoke:studio:production:scenario
                     Run golden-path browser scenario against production URL.
  smoke:studio:production:p30-audit
                     Run P30 ToolHost audit e2e against production URL.
  verify             Run core tests plus builds.
  verify:elab        Run ELABTutor tests plus build.
  factory:readonly   Print remote factory health without mutation.
EOF
}

has_cmd() {
  command -v "$1" >/dev/null 2>&1
}

require_file() {
  local path="$1"

  if [[ ! -f "$ROOT/$path" ]]; then
    echo "miss  $path" >&2
    return 1
  fi
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
  npm --prefix plugins/elab-tutor --ignore-scripts run build
}

require_studio_deps() {
  if [[ ! -x "$ROOT/apps/studio/node_modules/.bin/tsc" || ! -x "$ROOT/apps/studio/node_modules/.bin/vite" || ! -x "$ROOT/apps/studio/node_modules/.bin/vitest" ]]; then
    echo "miss  apps/studio dependencies (run npm --prefix apps/studio ci, or npm run bootstrap, first)"
    return 1
  fi
}

require_studio_playwright() {
  if [[ ! -d "$ROOT/apps/studio/node_modules/@playwright/test" ]]; then
    echo "miss  apps/studio Playwright dependency (run npm --prefix apps/studio ci, or npm run bootstrap, first)"
    return 1
  fi
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

preview_studio_check() {
  cd "$ROOT"

  echo "== studio preview readiness =="
  require_file "apps/studio/package.json"
  require_file "apps/studio/package-lock.json"
  require_file "apps/studio/vite.config.ts"
  require_studio_deps

  npm --prefix apps/studio run typecheck
  npm --prefix apps/studio test -- --run
  npm --prefix apps/studio run build
  require_file "apps/studio/dist/index.html"
}

preview_studio_preflight() {
  cd "$ROOT"

  echo "== studio preview preflight =="
  echo "This command is read-only against Vercel and never runs a deploy."
  require_file "apps/studio/package.json"
  require_file "apps/studio/package-lock.json"
  require_file "apps/studio/vite.config.ts"

  local blocked=0

  echo
  echo "== vercel =="
  if has_cmd vercel; then
    printf "ok    vercel %s\n" "$(vercel --version 2>&1 | tail -n 1 | sed 's/^Vercel CLI //')"
  else
    echo "miss  vercel CLI"
    blocked=1
  fi

  if has_cmd vercel && vercel whoami >/dev/null 2>&1; then
    echo "ok    vercel auth"
  else
    echo "miss  vercel auth"
    blocked=1
  fi

  if [[ -f "$ROOT/.vercel/project.json" ]]; then
    echo "ok    root .vercel/project.json"
  elif [[ -f "$ROOT/apps/studio/.vercel/project.json" ]]; then
    echo "warn  apps/studio .vercel/project.json exists; monorepo root link still missing"
    blocked=1
  else
    echo "miss  .vercel/project.json (do not run vercel link without Andrea's target-project approval)"
    blocked=1
  fi

  echo
  echo "== local build =="
  preview_studio_check

  if [[ "$blocked" -ne 0 ]]; then
    echo
    echo "blocked: local build passed, but preview deploy is not ready."
    return 1
  fi

  echo
  echo "ready: local build and Vercel preflight passed. Preview deploy still requires GATE-Andrea."
}

smoke_studio_production() {
  cd "$ROOT"

  echo "== studio production smoke =="
  require_file "apps/studio/package.json"
  require_studio_playwright

  node apps/studio/scripts/productionSmoke.mjs
}

smoke_studio_production_scenario() {
  cd "$ROOT"

  echo "== studio production scenario smoke =="
  require_file "apps/studio/package.json"
  require_studio_playwright

  node apps/studio/scripts/productionScenarioSmoke.mjs
}

smoke_studio_production_p30_audit() {
  cd "$ROOT"

  echo "== studio production P30 audit smoke =="
  require_file "apps/studio/package.json"
  require_studio_playwright

  ARDESIA_STUDIO_E2E_BASE_URL="${ARDESIA_STUDIO_SMOKE_URL:-https://ardesia-lavagna.vercel.app}" \
    npm --prefix apps/studio run e2e -- e2e/p30-free-manipulation.spec.ts --workers=1 --reporter=line
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
    status=0;
    echo "== headroom ==";
    if curl -sf --max-time 3 http://127.0.0.1:8787/health 2>/dev/null; then
      echo;
    else
      echo "miss  headroom health";
      status=1;
    fi;
    echo;
    echo "== agentmemory livez ==";
    if curl -sf --max-time 3 http://127.0.0.1:3111/agentmemory/livez 2>/dev/null; then
      echo;
    else
      echo "miss  agentmemory livez";
      status=1;
    fi;
    echo;
    echo "== launchd (lessonos/agentmemory) ==";
    launchctl list | grep -iE "lessonos|agentmemory" || true;
    echo "== processi fabbrica (atteso: nessuno con STOP attivo) ==";
    forbidden_pattern="[h]ourly-tick|[d]river-orch|[e]val/gate|[u]v run pytest|[p]ytest -q";
    forbidden_processes="$(ps ax -o pid=,command= | grep -iE "$forbidden_pattern" || true)";
    if [[ -n "$forbidden_processes" ]]; then
      printf "%s\n" "$forbidden_processes";
      status=1;
    else
      echo "ok    no forbidden factory processes";
    fi;
    exit "$status"'
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
    preview-studio-check) preview_studio_check ;;
    preview-studio-preflight) preview_studio_preflight ;;
    smoke-studio-production) smoke_studio_production ;;
    smoke-studio-production-scenario) smoke_studio_production_scenario ;;
    smoke-studio-production-p30-audit) smoke_studio_production_p30_audit ;;
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
