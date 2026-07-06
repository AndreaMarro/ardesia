#!/usr/bin/env bash
# pr-merge-verify — il ciclo di merge sicuro di ARDESIA, in un comando.
#
# Pattern (usato >20 volte firsthand nelle sessioni del 05-06 lug):
#   1. gate: TUTTI i check CI pass + mergeable MERGEABLE/CLEAN
#   2. merge con merge-commit (come da storia repo; MAI force-push)
#   3. fetch + suite studio su origin/main aggiornato (worktree indicata)
#   4. esito onesto: conteggio test o FERMATI (un rosso post-merge
#      = conflitto semantico tra PR entrambe verdi, vedi #67x#71/#80)
#
# Uso:  bin/pr-merge-verify.sh <numero-pr> [worktree-di-verifica]
#   worktree default: la repo corrente (deve essere pulita).
# NON cancella mai branch. NON gestisce stacked-retarget: i figli vanno
# retargettati su main PRIMA di ogni cancellazione del base (manuale).
set -euo pipefail

PR="${1:?uso: pr-merge-verify.sh <numero-pr> [worktree]}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WT="${2:-$ROOT}"

if [[ ! -d "$WT/apps/studio" ]]; then
  echo "ERRORE: worktree '$WT' senza apps/studio" >&2
  exit 2
fi

echo "== gate CI PR #$PR =="
CHECKS="$(gh pr checks "$PR" 2>&1 || true)"
echo "$CHECKS"
NOT_PASS="$(printf '%s\n' "$CHECKS" | cut -f2 | grep -cv '^pass$' || true)"
if [[ "$NOT_PASS" != "0" ]]; then
  echo "STOP: check non tutti pass ($NOT_PASS non-pass)" >&2
  exit 1
fi

STATE="$(gh pr view "$PR" --json mergeable,mergeStateStatus \
  --jq '[.mergeable,.mergeStateStatus]|join("/")')"
echo "stato merge: $STATE"
if [[ "$STATE" != "MERGEABLE/CLEAN" ]]; then
  echo "STOP: stato '$STATE' != MERGEABLE/CLEAN (UNKNOWN = riprova tra pochi secondi)" >&2
  exit 1
fi

echo "== merge #$PR (merge-commit) =="
gh pr merge "$PR" --merge

echo "== verifica main =="
git -C "$WT" fetch origin --prune
if [[ -n "$(git -C "$WT" status --porcelain)" ]]; then
  echo "STOP: worktree di verifica sporca — suite non attendibile" >&2
  exit 1
fi
git -C "$WT" checkout --detach origin/main
git -C "$WT" log --oneline -1 HEAD

cd "$WT/apps/studio"
# Regole repo: vitest SEMPRE da apps/studio, pool threads deterministico.
npx vitest run --pool=threads --maxWorkers=1 2>&1 | tail -4
