#!/usr/bin/env bash
# Test di bin/ci/backup_now.sh contro un repo sintetico di esito noto.
#
# La domanda CoV #2 applicata a questo test: cosa mostrerebbe se il backup NON
# funzionasse? Un bundle puo' esistere, pesare 300 MB, superare `git bundle
# verify` e **non contenere** il commit che rischia davvero di sparire. Un HEAD
# staccato in un worktree non ha un nome di ref: finisce negli oggetti del
# bundle ma non fra le sue teste, quindi nessun `list-heads` lo trova e un
# `git gc` lo porta via lo stesso. Il caso 3 qui sotto e' costruito esattamente
# su quello: e' il caso di `f4f7c56e`, misurato il 2026-07-30 in zero branch.
#
# Il test clona dal bundle e chiede a git se il commit e' RAGGIUNGIBILE, non se
# la stringa compare da qualche parte: `grep` su un elenco di teste risponde a
# un'altra domanda.
set -u -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SH="$SCRIPT_DIR/backup_now.sh"

FAILS=0
fail() { echo "ROSSO  $*"; FAILS=$((FAILS + 1)); }
ok()   { echo "verde  $*"; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# --- repo sintetico -------------------------------------------------------
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null
export GIT_AUTHOR_NAME=t GIT_AUTHOR_EMAIL=t@t
export GIT_COMMITTER_NAME=t GIT_COMMITTER_EMAIL=t@t

git init -q --bare "$TMP/remote.git"
git init -q -b main "$TMP/repo"
cd "$TMP/repo"
git remote add origin "$TMP/remote.git"
echo a > a.txt; git add a.txt; git commit -qm "su remoto"
git push -q origin main
SHA_REMOTO="$(git rev-parse HEAD)"

# 1. un ramo locale che non e' su nessun remoto
git checkout -q -b solo-locale
echo b > b.txt; git add b.txt; git commit -qm "solo locale"
SHA_LOCALE="$(git rev-parse HEAD)"

# 2. un commit in ZERO branch, tenuto vivo solo dall'HEAD staccato di un
#    worktree: la classe di `f4f7c56e`.
git checkout -q main
git worktree add -q --detach "$TMP/wt-staccato" HEAD
cd "$TMP/wt-staccato"
echo c > c.txt; git add c.txt; git commit -qm "orfano in worktree staccato"
SHA_ORFANO="$(git rev-parse HEAD)"

# 3. lavoro NON committato: un bundle e' fatto di oggetti git, quindi per
#    costruzione non contiene niente di questo. Misurato il 2026-07-30 sul repo
#    vero: 54 worktree sporchi su 77, **189 voci non-cancellazione**, 1,7 MB in
#    tutto. Un backup che le lascia fuori e' verde sulla domanda sbagliata.
echo "modifica non committata" >> c.txt
echo "contenuto mai visto da git" > mai-aggiunto.txt
cd "$TMP/repo"

# precondizione del test stesso: l'orfano deve essere in zero branch, altrimenti
# il test passerebbe per il motivo sbagliato.
if [ "$(git branch -a --contains "$SHA_ORFANO" | wc -l | tr -d ' ')" != "0" ]; then
  fail "precondizione: l'orfano $SHA_ORFANO risulta in qualche branch"
fi

# --- esecuzione -----------------------------------------------------------
OUT="$TMP/backups"
if [ ! -x "$BACKUP_SH" ]; then
  fail "bin/ci/backup_now.sh assente o non eseguibile"
  echo "test_backup_now: $FAILS falliti"
  exit 1
fi

ARDESIA_BACKUP_REPO="$TMP/repo" ARDESIA_BACKUP_DIR="$OUT" \
  bash "$BACKUP_SH" > "$TMP/run.log" 2>&1
RC=$?
[ "$RC" -eq 0 ] || fail "backup_now.sh exit=$RC (log: $(tail -3 "$TMP/run.log" | tr '\n' ' '))"

BUNDLE="$(ls -1 "$OUT"/*.bundle 2>/dev/null | tail -1)"
if [ -z "${BUNDLE:-}" ]; then
  fail "nessun .bundle prodotto in $OUT"
  echo "test_backup_now: $FAILS falliti"
  exit 1
fi
ok "bundle prodotto: $(basename "$BUNDLE")"

git bundle verify "$BUNDLE" > /dev/null 2>&1
[ $? -eq 0 ] && ok "git bundle verify: exit 0" || fail "git bundle verify != 0"

# --- l'assert che conta: RAGGIUNGIBILITA' dopo un clone dal bundle ---------
# Non `grep` sull'elenco delle teste: un oggetto presente ma senza ref e' cio'
# che `git gc` cancella, quindi la domanda giusta e' se un clone lo ritrova.
git clone -q --bare "$BUNDLE" "$TMP/restore.git" 2>/dev/null
if [ ! -d "$TMP/restore.git" ]; then
  fail "clone dal bundle fallito"
  echo "test_backup_now: $FAILS falliti"
  exit 1
fi

raggiungibile() { # sha
  git --git-dir="$TMP/restore.git" merge-base --is-ancestor "$1" \
    "$(git --git-dir="$TMP/restore.git" rev-parse "$1" 2>/dev/null)" 2>/dev/null \
    && git --git-dir="$TMP/restore.git" for-each-ref --contains "$1" \
      --format='%(refname)' | grep -q .
}

for caso in "ramo locale:$SHA_LOCALE" "orfano staccato:$SHA_ORFANO" "su remoto:$SHA_REMOTO"; do
  nome="${caso%%:*}"; sha="${caso##*:}"
  if raggiungibile "$sha"; then
    ok "$nome ($(echo "$sha" | cut -c1-8)) raggiungibile da un ref nel restore"
  else
    fail "$nome ($(echo "$sha" | cut -c1-8)) NON raggiungibile da nessun ref nel restore"
  fi
done

# --- il lavoro non committato -----------------------------------------------
# Artefatto SEPARATO dal bundle di proposito: i ref cambiano di rado (e allora il
# bundle da 280 MB si salta), i worktree sporchi cambiano a ogni comando.
TAR="$(ls -1t "$OUT"/dirty-*.tar.gz 2>/dev/null | head -1 || true)"
if [ -z "${TAR:-}" ] || [ ! -f "$TAR" ]; then
  fail "nessun archivio del lavoro non committato in $OUT (atteso dirty-*.tar.gz)"
else
  ok "archivio non committato prodotto: $(basename "$TAR")"
  tar tzf "$TAR" > "$TMP/tar.txt" 2>&1
  # la modifica a un file TRACCIATO
  if grep -q 'c\.txt' "$TMP/tar.txt"; then
    ok "modifica non committata a un file tracciato: nell'archivio"
  else
    fail "modifica non committata a c.txt NON nell'archivio"
  fi
  # il file MAI aggiunto a git: e' quello che nessun oggetto git contiene
  if grep -q 'mai-aggiunto\.txt' "$TMP/tar.txt"; then
    ok "file untracked: nell'archivio"
  else
    fail "file untracked mai-aggiunto.txt NON nell'archivio"
  fi
  # e il contenuto, non solo il nome: un tar con il path giusto e il byte
  # sbagliato passerebbe un test che guarda solo l'elenco.
  #
  # L'estrazione va in una directory SUA. La prima versione estraeva in "$TMP" e
  # ci faceva `grep -r`: ma in "$TMP" c'e' ancora il worktree SORGENTE con lo
  # stesso file, quindi l'assert leggeva l'originale e restava verde anche con
  # l'archivio vuoto. Lo ha rivelato il control run, non il ragionamento.
  EXTRACT="$TMP/estratto"
  rm -rf "$EXTRACT"; mkdir -p "$EXTRACT"
  tar xzf "$TAR" -C "$EXTRACT" 2>/dev/null
  if grep -rq 'contenuto mai visto da git' "$EXTRACT" 2>/dev/null; then
    ok "contenuto del file untracked ripristinabile dall'archivio"
  else
    fail "il path e' nell'archivio ma il CONTENUTO non si rilegge"
  fi
fi

echo
if [ "$FAILS" -ne 0 ]; then
  echo "test_backup_now: $FAILS falliti"
  exit 1
fi
echo "test_backup_now: tutti verdi"
exit 0
