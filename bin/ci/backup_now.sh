#!/usr/bin/env bash
# ORDINE ZERO del loop ARDESIA: mettere al sicuro cio' che sta su nessun remoto.
#
# Misurato il 2026-07-30 su questo repo: **127 commit raggiungibili da ref
# locali e presenti su nessun remoto**, 77 worktree registrati, disco al 99%.
# Fra quei commit ce n'e' almeno uno, `f4f7c56e`, che sta in **zero branch**:
# lo tiene vivo solo l'HEAD staccato del worktree `ardesia-pr15-review.8G6cpw`.
#
# Perche' non basta `git bundle create --all`:
#   `--all` esamina anche gli HEAD degli altri worktree (git >= 2.15), quindi
#   gli OGGETTI di un HEAD staccato finiscono nel bundle. Ma un HEAD staccato
#   non ha un nome di ref: nel bundle non compare fra le teste, un clone non lo
#   ritrova, e nel repo di partenza `git gc` lo pota lo stesso. Un backup che
#   contiene il commit ma non sa piu' nominarlo non e' un backup.
# Percio' il passo 1 MATERIALIZZA un ref per ogni tip orfano, prima di bundlare.
#
# Uso:
#   bash bin/ci/backup_now.sh            # bundle in ~/ardesia-backups
#   ARDESIA_BACKUP_DIR=... bash bin/ci/backup_now.sh
#   bash bin/ci/backup_now.sh --dry-run  # misura e stampa, non scrive il bundle
#
# Il test sta in bin/ci/test_backup_now.sh e non fa `grep` sull'elenco delle
# teste: clona dal bundle e chiede a git se il commit e' RAGGIUNGIBILE.
set -u -o pipefail

DRY=0
case "${1:-}" in
  --dry-run) DRY=1 ;;
  "") ;;
  *) echo "uso: $0 [--dry-run]" >&2; exit 2 ;;
esac

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="${ARDESIA_BACKUP_REPO:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
OUT="${ARDESIA_BACKUP_DIR:-$HOME/ardesia-backups}"

git -C "$ROOT" rev-parse --git-dir > /dev/null 2>&1 || {
  echo "BLOCCATO  $ROOT non e' un repo git" >&2; exit 2; }

GITDIR="$(git -C "$ROOT" rev-parse --git-common-dir)"
case "$GITDIR" in /*) ;; *) GITDIR="$ROOT/$GITDIR" ;; esac

echo "backup_now — repo: $ROOT"
echo "            gitdir: $GITDIR"
echo "            uscita: $OUT"
echo

# --- 1. materializza un RAMO per ogni tip che sta in ZERO branch ------------
# `git branch --contains` risponde «in quali branch sta»; vuoto = orfano.
#
# Il ref va sotto `refs/heads/`, non sotto un `refs/backup/` privato: `git
# clone` — il comando con cui si ripristina davvero — trasferisce solo
# `refs/heads/*` e `refs/tags/*`. Un ref fuori da li' entra nel bundle e sparisce
# al ripristino. Il test lo ha misurato: bundle valido, `verify` a 0, e il
# commit orfano NON raggiungibile da nessun ref nel clone.
# Effetto collaterale voluto: l'orfano diventa un ramo, quindi `git gc` non lo
# pota piu' nemmeno nel repo di partenza.
ORFANI=0
while IFS= read -r line; do
  case "$line" in
    "worktree "*) WT_PATH="${line#worktree }" ;;
    "HEAD "*)     WT_HEAD="${line#HEAD }" ;;
    "")
      [ -n "${WT_HEAD:-}" ] || { WT_PATH=""; continue; }
      if [ -z "$(git -C "$ROOT" branch -a --contains "$WT_HEAD" 2>/dev/null)" ]; then
        short="$(echo "$WT_HEAD" | cut -c1-8)"
        slug="$(basename "${WT_PATH:-senza-nome}" \
                | tr -c 'A-Za-z0-9._-' '-' | tr -s '-' | sed 's/^[-.]*//; s/[-.]*$//')"
        ramo="backup/wt/${slug:-anonimo}-$short"
        # un nome di ramo invalido farebbe fallire update-ref e perderebbe il
        # tip in silenzio: qui si degrada allo sha, che e' sempre valido.
        git check-ref-format --branch "$ramo" > /dev/null 2>&1 || ramo="backup/wt/$short"
        git -C "$ROOT" update-ref "refs/heads/$ramo" "$WT_HEAD"
        echo "  orfano  $short  ->  $ramo"
        ORFANI=$((ORFANI + 1))
      fi
      WT_PATH=""; WT_HEAD=""
      ;;
  esac
done < <(git -C "$ROOT" worktree list --porcelain; echo)

GIA_NOMINATI="$(git -C "$ROOT" for-each-ref --format='%(refname)' 'refs/heads/backup/**' | wc -l | tr -d ' ')"
echo "  tip orfani nominati ora: $ORFANI   (rami di backup totali: $GIA_NOMINATI)"

# --- 2. misure che il bundle deve poter dimostrare -------------------------
NON_BACKUPPATI="$(git -C "$ROOT" rev-list --count --all --not --remotes 2>/dev/null || echo '?')"
N_REF="$(git -C "$ROOT" for-each-ref --format='%(refname)' | wc -l | tr -d ' ')"
echo "  commit su nessun remoto: $NON_BACKUPPATI"
echo "  ref totali da bundlare:  $N_REF"
echo

# --- 3. il lavoro NON committato -------------------------------------------
# Un bundle e' fatto di oggetti git: per costruzione non contiene una riga che
# non sia mai stata committata. Misurato il 2026-07-30 su questo repo: **54
# worktree sporchi su 77, 189 voci non-cancellazione, 3,4 MB di contenuto**.
# Sono la parte del lavoro che nessun `git` puo' recuperare.
#
# Artefatto SEPARATO dal bundle, e scritto SEMPRE: i ref cambiano di rado, i
# worktree sporchi cambiano a ogni comando. Legarlo al bundle significherebbe
# non aggiornarlo mai piu' dopo il primo giro.
#
# Vengono copiati i file PRESENTI (modificati o untracked). I cancellati no: il
# loro contenuto sta gia' nel bundle, ed e' da li' che si ripristinano —
# `STATUS.txt` conserva il fatto che erano cancellati.
#
# `--diff-filter=d` NON e' un dettaglio. La prima versione salvava `git diff
# HEAD` intero: **2,3 GB di patch contro 3,4 MB di file veri**, perche' ~40
# worktree replicano lo stesso insieme di 5884 cancellazioni di binari e ognuna
# pesava 52 MB. Su un disco con 3,9 GB liberi, un backup che occupa 2,3 GB per
# ridire cio' che il bundle contiene gia' e' esso stesso un rischio. Misurato
# dopo il filtro: 53680 KB -> 0 KB su due worktree indipendenti.
archivia_non_committato() {
  local out="$1" tardir dirty_wt=0 dirty_file=0
  tardir="$(mktemp -d)"
  while IFS= read -r wt; do
    [ -d "$wt" ] || continue
    git -C "$wt" status --porcelain > "$tardir/.st" 2>/dev/null || continue
    [ -s "$tardir/.st" ] || continue
    local slug dest
    slug="$(basename "$wt" | tr -c 'A-Za-z0-9._-' '-')"
    dest="$tardir/$slug"
    mkdir -p "$dest"
    cp "$tardir/.st" "$dest/STATUS.txt"
    git -C "$wt" rev-parse HEAD > "$dest/HEAD.txt" 2>/dev/null || true
    echo "$wt" > "$dest/PATH.txt"
    git -C "$wt" diff HEAD --diff-filter=d > "$dest/tracked.patch" 2>/dev/null || true
    dirty_wt=$((dirty_wt + 1))
    while IFS= read -r line; do
      local stato f
      stato="${line:0:2}"; f="${line:3}"
      case "$stato" in " D"|"D "|"DD") continue ;; esac
      # i rename hanno forma "vecchio -> nuovo": conta il nuovo.
      case "$f" in *" -> "*) f="${f##* -> }" ;; esac
      f="${f%\"}"; f="${f#\"}"
      [ -f "$wt/$f" ] || continue
      mkdir -p "$dest/files/$(dirname "$f")"
      cp "$wt/$f" "$dest/files/$f" 2>/dev/null && dirty_file=$((dirty_file + 1))
    done < "$dest/STATUS.txt"
  done < <(git -C "$ROOT" worktree list --porcelain | sed -n 's/^worktree //p')

  rm -f "$tardir/.st"
  tar czf "$out" -C "$tardir" .
  local rc=$?
  rm -rf "$tardir"
  if [ "$rc" -ne 0 ]; then
    echo "BLOCCATO  tar del lavoro non committato exit=$rc" >&2
    return "$rc"
  fi
  echo "  non committato: $dirty_wt worktree, $dirty_file file  ->  $out ($(du -h "$out" | cut -f1))"
  return 0
}

# --- 4. se il contenuto e' identico all'ultimo bundle, non ri-bundlare -------
# Cancellare i bundle vecchi non e' un'opzione (sono dati). Evitare di
# duplicarli lo e'. La firma e' l'insieme (ref, sha) di tutto cio' che finira'
# nel bundle: se non e' cambiato, il bundle precedente e' ancora la copia.
FIRMA="$(git -C "$ROOT" for-each-ref --format='%(refname) %(objectname)' | sort | shasum | cut -d' ' -f1)"
mkdir -p "$OUT"
ULTIMA_FIRMA=""
ULTIMO="$(ls -1t "$OUT"/*.bundle 2>/dev/null | head -1 || true)"
[ -n "$ULTIMO" ] && [ -f "${ULTIMO%.bundle}.refs.sha" ] && \
  ULTIMA_FIRMA="$(cat "${ULTIMO%.bundle}.refs.sha")"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"

if [ "$DRY" -eq 1 ]; then
  echo "DRY-RUN  nessun artefatto scritto. Firma dei ref: $FIRMA"
  exit 0
fi

if [ -n "$ULTIMO" ] && [ "$FIRMA" = "$ULTIMA_FIRMA" ]; then
  echo "BUNDLE GIA' COPERTO  nessun ref e' cambiato dall'ultimo bundle:"
  echo "                     $ULTIMO  (firma $FIRMA)"
  echo "                     il non committato viene archiviato lo stesso."
  echo
  archivia_non_committato "$OUT/dirty-$STAMP.tar.gz" || exit $?
  exit 0
fi

# --- 5. margine di disco: un bundle che riempie il disco perde il repo ------
LIBERI_KB="$(df -k "$OUT" | tail -1 | awk '{print $4}')"
GITDIR_KB="$(du -sk "$GITDIR" | awk '{print $1}')"
if [ "$LIBERI_KB" -lt "$GITDIR_KB" ]; then
  echo "BLOCCATO  spazio libero $((LIBERI_KB / 1024)) MB < dimensione gitdir $((GITDIR_KB / 1024)) MB." >&2
  echo "          Un bundle troncato e' peggio di nessun bundle: fallisce chiuso." >&2
  exit 4
fi

# --- 6. il bundle ----------------------------------------------------------
HEADSHA="$(git -C "$ROOT" rev-parse --short=8 HEAD 2>/dev/null || echo nohead)"
BUNDLE="$OUT/ardesia-$STAMP-$HEADSHA.bundle"

git -C "$ROOT" bundle create "$BUNDLE" --all
RC=$?
if [ "$RC" -ne 0 ]; then
  echo "BLOCCATO  git bundle create exit=$RC" >&2
  rm -f "$BUNDLE"
  exit "$RC"
fi

git bundle verify "$BUNDLE" > /dev/null 2>&1
RC=$?
if [ "$RC" -ne 0 ]; then
  echo "BLOCCATO  git bundle verify exit=$RC — bundle NON valido, rimosso." >&2
  rm -f "$BUNDLE"
  exit "$RC"
fi

echo "$FIRMA" > "${BUNDLE%.bundle}.refs.sha"
git -C "$ROOT" for-each-ref --format='%(refname) %(objectname)' | sort \
  > "${BUNDLE%.bundle}.refs.txt"

archivia_non_committato "$OUT/dirty-$STAMP.tar.gz" || exit $?

echo
echo "OK  $BUNDLE"
echo "    $(du -h "$BUNDLE" | cut -f1)  ·  $N_REF ref  ·  $NON_BACKUPPATI commit su nessun remoto"
echo "    ripristino:  git clone --bare $BUNDLE ripristino.git"
exit 0
