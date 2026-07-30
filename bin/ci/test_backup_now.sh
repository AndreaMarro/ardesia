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
  # L'exit code dei VERIFICATORI va letto. Senza, un `tar` che fallisce ma
  # lascia output parziale rende questo test verde mentre i suoi stessi
  # strumenti segnalano errore: il test misurerebbe il grep, non il tar.
  tar tzf "$TAR" > "$TMP/tar.txt" 2>&1
  RC_TZF=$?
  [ "$RC_TZF" -eq 0 ] || fail "tar tzf exit=$RC_TZF: l'elenco non e' affidabile"
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
  RC_XZF=$?
  [ "$RC_XZF" -eq 0 ] || fail "tar xzf exit=$RC_XZF: l'estrazione non e' affidabile"
  if grep -rq 'contenuto mai visto da git' "$EXTRACT" 2>/dev/null; then
    ok "contenuto del file untracked ripristinabile dall'archivio"
  else
    fail "il path e' nell'archivio ma il CONTENUTO non si rilegge"
  fi
fi

# =============================================================================
# SCENARI DI GUASTO — uno per finding confermato dal revisore avversariale.
# Ognuno costruisce un repo suo: sono modi diversi di rompere lo stesso script,
# e condividerne lo stato li renderebbe dipendenti dall'ordine.
# =============================================================================

nuovo_repo() { # $1 = dir
  git init -q --bare "$1/remote.git"
  git init -q -b main "$1/repo"
  git -C "$1/repo" remote add origin "$1/remote.git"
  echo base > "$1/repo/base.txt"
  git -C "$1/repo" add base.txt
  git -C "$1/repo" commit -qm base
  git -C "$1/repo" push -q origin main
}

esegui_backup() { # $1 = repo dir, $2 = out dir  -> stampa exit su stdout
  # `mkdir -p` PRIMA del redirect. Senza, la redirezione falliva perche' la
  # directory non esiste ancora (la crea lo script, piu' tardi) e la funzione
  # restituiva l'exit della REDIREZIONE: due scenari risultavano verdi senza
  # che lo script fosse mai stato eseguito. Il test misurava se stesso.
  mkdir -p "$2"
  ( ARDESIA_BACKUP_REPO="$1" ARDESIA_BACKUP_DIR="$2" bash "$BACKUP_SH" > "$2/run.log" 2>&1
    echo $? )
}

# --- S1: una DIRECTORY untracked -------------------------------------------
# `git status --porcelain` comprime un albero mai visto da git in UNA riga che
# finisce con '/'. Uno script che copia solo i path che superano `-f` la scarta
# INTERA. Misurato sul repo vero il 2026-07-30: 12 directory cosi', **166 file
# e 14 MB**, fra cui apps/studio/src/stories/ (26 file) e docs/product/ (8).
S1="$(mktemp -d)"
nuovo_repo "$S1"
mkdir -p "$S1/repo/albero-mai-visto/dentro"
echo "foglia profonda" > "$S1/repo/albero-mai-visto/dentro/foglia.txt"
RC="$(esegui_backup "$S1/repo" "$S1/out")"
S1TAR="$(ls -1t "$S1/out"/dirty-*.tar.gz 2>/dev/null | head -1 || true)"
if [ "$RC" -eq 0 ] && [ -n "$S1TAR" ] && tar tzf "$S1TAR" 2>/dev/null | grep -q 'foglia\.txt'; then
  ok "S1 directory untracked: il file dentro l'albero e' nell'archivio"
else
  fail "S1 directory untracked: foglia.txt NON archiviata (status la comprime in 'albero-mai-visto/')"
fi
rm -rf "$S1"

# --- S2: status.showUntrackedFiles=no --------------------------------------
# Con questa configurazione `git status --porcelain` non emette materia e
# l'archivio esce vuoto restando exit 0: il backup fallisce APERTO, in silenzio.
S2="$(mktemp -d)"
nuovo_repo "$S2"
git -C "$S2/repo" config status.showUntrackedFiles no
echo "invisibile alla configurazione" > "$S2/repo/invisibile.txt"
RC="$(esegui_backup "$S2/repo" "$S2/out")"
S2TAR="$(ls -1t "$S2/out"/dirty-*.tar.gz 2>/dev/null | head -1 || true)"
if [ "$RC" -eq 0 ] && [ -n "$S2TAR" ] && tar tzf "$S2TAR" 2>/dev/null | grep -q 'invisibile\.txt'; then
  ok "S2 showUntrackedFiles=no: l'untracked e' archiviato lo stesso"
else
  fail "S2 showUntrackedFiles=no: invisibile.txt NON archiviato (la config del repo detta cosa vede il backup)"
fi
rm -rf "$S2"

# --- S3: update-ref che fallisce per conflitto di namespace ----------------
# Se esiste gia' un ramo `backup`, creare `backup/wt/...` e' un conflitto
# directory/file: update-ref fallisce. Lo script contava l'orfano come nominato
# e usciva 0, quindi dichiarava salvo un commit che nel clone non ha ref.
# `check-ref-format` non protegge: valida la sintassi, non la scrivibilita'.
#
# L'assert sta sulla RAGGIUNGIBILITA' nel clone, non sull'exit code. La prima
# versione pretendeva che lo script fallisse: ma fallire non e' il requisito —
# il requisito e' che l'orfano resti nominato. Uno script che ripiega su un
# nome piatto e ci riesce soddisfa l'invariante ed e' meglio di uno che si
# arrende. Un test che pretende l'exit sbagliato boccia la riparazione giusta.
S3="$(mktemp -d)"
nuovo_repo "$S3"
git -C "$S3/repo" branch backup main
git -C "$S3/repo" worktree add -q --detach "$S3/wt" HEAD
( cd "$S3/wt" && echo o > o.txt && git add o.txt && git commit -qm orfano )
S3ORF="$(git -C "$S3/wt" rev-parse HEAD)"
# precondizione stabilita, non assunta: dev'essere in zero branch.
if [ -n "$(git -C "$S3/repo" branch -a --contains "$S3ORF" 2>/dev/null)" ]; then
  fail "S3 precondizione: l'orfano risulta gia' in un branch"
fi
RC="$(esegui_backup "$S3/repo" "$S3/out")"
S3B="$(ls -1t "$S3/out"/*.bundle 2>/dev/null | head -1 || true)"
if [ -n "$S3B" ] && git clone -q --bare "$S3B" "$S3/rest.git" 2>/dev/null \
   && [ -n "$(git --git-dir="$S3/rest.git" for-each-ref --contains "$S3ORF" --format='%(refname)' 2>/dev/null)" ]; then
  ok "S3 update-ref in conflitto: l'orfano resta raggiungibile nel clone ($(git --git-dir="$S3/rest.git" for-each-ref --contains "$S3ORF" --format='%(refname)' | head -1))"
else
  fail "S3 update-ref in conflitto (exit $RC): l'orfano NON e' raggiungibile da nessun ref nel clone"
fi
rm -rf "$S3"

# --- S4: bundle precedente corrotto, sidecar intatto ------------------------
# Il ramo «GIA' COPERTO» si fidava del solo sidecar della firma dei ref. Un
# bundle troncato lascia la firma valida: la seconda esecuzione dichiara coperto
# cio' che non e' piu' ripristinabile. `git bundle verify` non basta: torna 0
# anche su un file troncato.
S4="$(mktemp -d)"
nuovo_repo "$S4"
RC="$(esegui_backup "$S4/repo" "$S4/out")"
S4B="$(ls -1t "$S4/out"/*.bundle 2>/dev/null | head -1 || true)"
if [ "$RC" -eq 0 ] && [ -n "$S4B" ]; then
  SZ=$(stat -f%z "$S4B" 2>/dev/null || stat -c%s "$S4B")
  dd if="$S4B" of="$S4B.tmp" bs=1 count=$((SZ / 2)) 2>/dev/null
  mv "$S4B.tmp" "$S4B"
  RC2="$(esegui_backup "$S4/repo" "$S4/out")"
  NUOVI=$(ls -1 "$S4/out"/*.bundle 2>/dev/null | wc -l | tr -d ' ')
  if [ "$RC2" -ne 0 ] || [ "$NUOVI" -gt 1 ]; then
    ok "S4 bundle corrotto: lo script non lo dichiara coperto (exit $RC2, bundle presenti $NUOVI)"
  else
    fail "S4 bundle corrotto: 'GIA' COPERTO' su un bundle che non si clona piu'"
  fi
else
  fail "S4 preparazione fallita: primo backup exit=$RC"
fi
rm -rf "$S4"

# --- S5: cwd non-git --------------------------------------------------------
# `git bundle verify` senza `-C` interroga la directory corrente. Invocato da
# fuori da un repo lo script cancellava il bundle appena creato e usciva 1.
# Il test originale non lo vedeva perche' faceva `cd` nel repo per conto suo.
S5="$(mktemp -d)"
nuovo_repo "$S5"
NONGIT="$(mktemp -d)"
RC=$( cd "$NONGIT" && ARDESIA_BACKUP_REPO="$S5/repo" ARDESIA_BACKUP_DIR="$S5/out" \
        bash "$BACKUP_SH" > "$S5/nongit.log" 2>&1; echo $? )
if [ "$RC" -eq 0 ] && ls "$S5/out"/*.bundle > /dev/null 2>&1; then
  ok "S5 cwd non-git: il backup riesce lo stesso (exit 0)"
else
  fail "S5 cwd non-git: exit=$RC — lo script dipende dalla directory da cui lo lanci"
fi
rm -rf "$S5" "$NONGIT"

# --- S6: worktree registrato ma non interrogabile ---------------------------
# `git status || continue` toglieva dalla raccolta un worktree rotto SENZA
# rendere fallito il backup: l'archivio usciva vuoto ed exit 0. Un worktree che
# non si legge e' esattamente quello di cui non sai cosa stai perdendo.
S6="$(mktemp -d)"
nuovo_repo "$S6"
git -C "$S6/repo" worktree add -q "$S6/wt-rotto" -b ramo-rotto
echo "lavoro nel worktree rotto" > "$S6/wt-rotto/lavoro.txt"
echo "non un gitfile" > "$S6/wt-rotto/.git"
RC="$(esegui_backup "$S6/repo" "$S6/out")"
if [ "$RC" -ne 0 ]; then
  ok "S6 worktree illeggibile: lo script FALLISCE invece di saltarlo in silenzio (exit $RC)"
else
  fail "S6 worktree illeggibile: exit 0 — saltato senza dirlo"
fi
rm -rf "$S6"

# --- S7: commit tenuto vivo solo da un ref fuori da refs/heads e refs/tags ---
# `git clone --bare` trasferisce solo `refs/heads/*` e `refs/tags/*`. Nel repo
# vero questo NON e' ipotetico: dei 127 commit su nessun remoto, **124 sono
# raggiungibili nel ripristino e 3 solo presenti**, e quei 3 sono uno stash del
# 2026-07-20 ("codex discarded combined O01-O09 experiment"). Ci sono anche 19
# ref sotto refs/audit/ e 14 sotto refs/ardesia-recovery/.
# Un oggetto presente ma irraggiungibile e' esattamente cio' che `git gc` pota:
# il comando di ripristino DOCUMENTATO deve recuperarlo.
S7="$(mktemp -d)"
nuovo_repo "$S7"
git -C "$S7/repo" checkout -q -b effimero
echo "solo in un ref non standard" > "$S7/repo/audit.txt"
git -C "$S7/repo" add audit.txt
git -C "$S7/repo" commit -qm "raggiungibile solo da refs/audit"
S7SHA="$(git -C "$S7/repo" rev-parse HEAD)"
git -C "$S7/repo" update-ref refs/audit/solo "$S7SHA"
git -C "$S7/repo" checkout -q main
git -C "$S7/repo" branch -qD effimero
# precondizione stabilita: nessun branch e nessun tag lo raggiunge
if [ -n "$(git -C "$S7/repo" for-each-ref --contains "$S7SHA" --format='%(refname)' 'refs/heads/**' 'refs/tags/**' 2>/dev/null)" ]; then
  fail "S7 precondizione: il commit risulta raggiungibile da heads o tags"
fi
RC="$(esegui_backup "$S7/repo" "$S7/out")"
S7B="$(ls -1t "$S7/out"/*.bundle 2>/dev/null | head -1 || true)"
# il ripristino provato e' quello che lo script STAMPA: se stampa --bare, si
# prova --bare. Un test che usa un comando piu' potente di quello documentato
# renderebbe verde una documentazione sbagliata.
CMD="$(grep -oE 'git clone --[a-z]+' "$S7/out/run.log" | head -1 || true)"
[ -n "$CMD" ] && ok "S7 comando di ripristino documentato: $CMD" || fail "S7 lo script non documenta un comando di ripristino"
if [ -n "$S7B" ] && $CMD "$S7B" "$S7/rest.git" > /dev/null 2>&1 \
   && [ -n "$(git --git-dir="$S7/rest.git" for-each-ref --contains "$S7SHA" --format='%(refname)' 2>/dev/null)" ]; then
  ok "S7 ref non standard: il commit e' raggiungibile dopo il ripristino documentato"
else
  fail "S7 ref non standard: dopo '$CMD' il commit NON e' raggiungibile da nessun ref (e' cio' che git gc pota)"
fi
rm -rf "$S7"

# --- S8: staged, poi cancellato dal worktree (stato 'MD') -------------------
# Il contenuto messo nell'indice e poi tolto dal worktree non sta in nessun
# ref, quindi NON e' nel bundle; e il file non esiste piu', quindi non viene
# copiato. `git diff HEAD --diff-filter=d` lo omette per costruzione.
S8="$(mktemp -d)"
nuovo_repo "$S8"
echo "contenuto messo nell indice e mai committato" > "$S8/repo/base.txt"
git -C "$S8/repo" add base.txt
rm "$S8/repo/base.txt"
RC="$(esegui_backup "$S8/repo" "$S8/out")"
S8TAR="$(ls -1t "$S8/out"/dirty-*.tar.gz 2>/dev/null | head -1 || true)"
S8X="$S8/estratto"; mkdir -p "$S8X"
[ -n "$S8TAR" ] && tar xzf "$S8TAR" -C "$S8X" 2>/dev/null
if grep -rq 'contenuto messo nell indice e mai committato' "$S8X" 2>/dev/null; then
  ok "S8 staged-then-deleted: il contenuto dell'indice e' recuperabile dall'archivio"
else
  fail "S8 staged-then-deleted: il contenuto sta solo nell'indice e non e' ne' nel bundle ne' nell'archivio"
fi
rm -rf "$S8"

# --- S9: due worktree con lo STESSO basename --------------------------------
# Lo staging usa `basename` sanitizzato come nome di directory: due worktree in
# parent diversi collidono e il secondo sovrascrive il primo, mentre il
# contatore ne dichiara due. Nel repo vero oggi non ci sono omonimi, ma il
# nome dei worktree lo sceglie chi lavora, non lo script.
S9="$(mktemp -d)"
nuovo_repo "$S9"
mkdir -p "$S9/a" "$S9/b"
git -C "$S9/repo" worktree add -q "$S9/a/omonimo" -b ramo-a
git -C "$S9/repo" worktree add -q "$S9/b/omonimo" -b ramo-b
echo "sono il worktree A" > "$S9/a/omonimo/chi-sono.txt"
echo "sono il worktree B" > "$S9/b/omonimo/chi-sono.txt"
RC="$(esegui_backup "$S9/repo" "$S9/out")"
S9TAR="$(ls -1t "$S9/out"/dirty-*.tar.gz 2>/dev/null | head -1 || true)"
S9X="$S9/estratto"; mkdir -p "$S9X"
[ -n "$S9TAR" ] && tar xzf "$S9TAR" -C "$S9X" 2>/dev/null
A_OK=0; B_OK=0
grep -rq 'sono il worktree A' "$S9X" 2>/dev/null && A_OK=1
grep -rq 'sono il worktree B' "$S9X" 2>/dev/null && B_OK=1
if [ "$A_OK" -eq 1 ] && [ "$B_OK" -eq 1 ]; then
  ok "S9 worktree omonimi: entrambi i contenuti sono nell'archivio"
else
  fail "S9 worktree omonimi: A=$A_OK B=$B_OK — uno ha sovrascritto l'altro"
fi
rm -rf "$S9"

# --- S10: un file che non si riesce a copiare -------------------------------
# `cp ... 2>/dev/null && contatore++` scarta l'errore: un file illeggibile
# sparisce dall'archivio e lo script esce 0. Il contatore dice quanti ne ha
# copiati, non quanti avrebbe dovuto.
S10="$(mktemp -d)"
nuovo_repo "$S10"
echo "segreto illeggibile" > "$S10/repo/illeggibile.txt"
chmod 000 "$S10/repo/illeggibile.txt"
RC="$(esegui_backup "$S10/repo" "$S10/out")"
chmod 644 "$S10/repo/illeggibile.txt" 2>/dev/null || true
if [ "$RC" -ne 0 ]; then
  ok "S10 file non copiabile: lo script lo dichiara e fallisce (exit $RC)"
else
  fail "S10 file non copiabile: exit 0 — un file perso senza dirlo"
fi
rm -rf "$S10"

echo
if [ "$FAILS" -ne 0 ]; then
  echo "test_backup_now: $FAILS falliti"
  exit 1
fi
echo "test_backup_now: tutti verdi"
exit 0
