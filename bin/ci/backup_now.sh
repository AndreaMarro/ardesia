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

# Un backup che salta qualcosa e non lo dice e' peggio di un backup assente:
# l'assenza si vede, il buco no. Ogni cosa che non si riesce a mettere al sicuro
# finisce qui, e alla fine lo script esce != 0 comunque abbia scritto.
ERRORI=()

nome_libero() { # $1 = path desiderato -> stampa un path che NON esiste
  local base="$1" n=2
  [ -e "$base" ] || { echo "$base"; return 0; }
  local radice="${base%.*}" est="${base##*.}"
  while [ -e "${radice}-$n.${est}" ]; do n=$((n + 1)); done
  echo "${radice}-$n.${est}"
}

segnala() { ERRORI+=("$1"); echo "  MANCATO  $1" >&2; }

chiudi() { # $1 = exit code se non ci sono errori
  if [ "${#ERRORI[@]}" -ne 0 ]; then
    echo >&2
    echo "INCOMPLETO  ${#ERRORI[@]} cosa/e non messa/e al sicuro:" >&2
    for e in "${ERRORI[@]}"; do echo "  - $e" >&2; done
    echo "Gli artefatti scritti restano validi per cio' che contengono." >&2
    exit 5
  fi
  exit "$1"
}

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
        # L'exit di update-ref va letto. `check-ref-format` valida la SINTASSI,
        # non la scrivibilita': se esiste gia' un ramo `backup`, creare
        # `backup/wt/...` e' un conflitto directory/file e update-ref fallisce.
        # La versione precedente contava l'orfano come nominato e usciva 0,
        # dichiarando salvo un commit che nel clone non ha nessun ref.
        if git -C "$ROOT" update-ref "refs/heads/$ramo" "$WT_HEAD" 2>/dev/null; then
          echo "  orfano  $short  ->  $ramo"
          ORFANI=$((ORFANI + 1))
        else
          # ripiego: un ref piatto non puo' collidere con una directory
          if git -C "$ROOT" update-ref "refs/heads/backup-wt-$short" "$WT_HEAD" 2>/dev/null; then
            echo "  orfano  $short  ->  backup-wt-$short  (ripiego: '$ramo' in conflitto)"
            ORFANI=$((ORFANI + 1))
          else
            segnala "tip orfano $short ($WT_PATH): update-ref fallito sia su '$ramo' sia sul ripiego piatto — nel bundle l'oggetto c'e', ma nessun ref lo nomina"
          fi
        fi
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
  # Lo staging va sul filesystem dell'USCITA, non su TMPDIR: il margine di
  # disco e' misurato su OUT, e uno staging altrove puo' riempire un volume
  # che nessuno ha controllato.
  tardir="$(mktemp -d "$OUT/.staging.XXXXXX")"
  while IFS= read -r wt; do
    if [ ! -d "$wt" ]; then
      # un worktree registrato ma sparito e' gia' perso: il registro lo dice.
      segnala "worktree registrato ma assente su disco: $wt"
      continue
    fi
    # `-uall` NON e' cosmetico, ed e' due difetti in una bandiera:
    #  - senza, `git status --porcelain` comprime un albero mai visto da git in
    #    UNA riga che finisce con '/', e uno script che copia solo i path che
    #    superano `-f` lo scarta INTERO. Misurato sul repo vero il 2026-07-30:
    #    12 directory cosi', **166 file e 14 MB**, fra cui apps/studio/src/
    #    stories/ (26 file) e docs/product/ (8).
    #  - e la bandiera sulla riga di comando vince su `status.showUntrackedFiles`,
    #    che se impostata a `no` renderebbe l'archivio vuoto con exit 0.
    if ! git -C "$wt" status --porcelain -uall > "$tardir/.st" 2>/dev/null; then
      # Saltare in silenzio un worktree che non si legge e' proprio il caso in
      # cui non sai cosa stai perdendo.
      segnala "worktree non interrogabile (git status fallito): $wt"
      continue
    fi
    [ -s "$tardir/.st" ] || continue
    local slug dest impronta
    # Il basename NON identifica un worktree: /a/omonimo e /b/omonimo darebbero
    # la stessa directory di staging e il secondo sovrascriverebbe il primo,
    # mentre il contatore ne dichiarerebbe due. L'impronta del path INTERO
    # rende il nome unico e resta leggibile.
    impronta="$(printf '%s' "$wt" | shasum | cut -c1-6)"
    slug="$(basename "$wt" | tr -c 'A-Za-z0-9._-' '-')-$impronta"
    dest="$tardir/$slug"
    mkdir -p "$dest"
    cp "$tardir/.st" "$dest/STATUS.txt"
    git -C "$wt" rev-parse HEAD > "$dest/HEAD.txt" 2>/dev/null || true
    echo "$wt" > "$dest/PATH.txt"
    git -C "$wt" diff HEAD --diff-filter=d > "$dest/tracked.patch" 2>/dev/null || true
    # Lo stato `MD` — messo nell'indice, poi tolto dal worktree — non sta in
    # nessun ref, quindi NON e' nel bundle; e il file non esiste piu', quindi
    # non viene copiato. `git diff HEAD --diff-filter=d` lo omette per
    # costruzione. Questa patch e' l'unico posto in cui quel contenuto esiste.
    git -C "$wt" diff --cached HEAD --binary > "$dest/staged.patch" 2>/dev/null || true
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
      # `cp ... 2>/dev/null && contatore++` scarta l'errore: il contatore dice
      # quanti file sono stati copiati, non quanti andavano copiati. Un file
      # illeggibile spariva dall'archivio con exit 0.
      if cp "$wt/$f" "$dest/files/$f" 2>/dev/null; then
        dirty_file=$((dirty_file + 1))
      else
        segnala "file non copiabile nell'archivio: $wt/$f"
      fi
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

# «Coperto» e' un'affermazione sul RIPRISTINO, non sui ref. La firma dice che
# non e' cambiato niente da bundlare; non dice che il bundle di allora sia
# ancora leggibile. Un file troncato dopo la scrittura lascia il sidecar
# intatto — e `git bundle verify` torna 0 lo stesso, quindi non e' un oracolo
# utilizzabile qui. L'unica cosa che risponde alla domanda giusta e' il
# contenuto del file: sha256 registrato alla scrittura e riconfrontato adesso.
INTATTO=0
if [ -n "$ULTIMO" ] && [ "$FIRMA" = "$ULTIMA_FIRMA" ] && [ -f "${ULTIMO%.bundle}.bundle.sha256" ]; then
  ATTESA="$(cat "${ULTIMO%.bundle}.bundle.sha256")"
  CORRENTE="$(shasum -a 256 "$ULTIMO" | cut -d' ' -f1)"
  if [ "$ATTESA" = "$CORRENTE" ]; then
    INTATTO=1
  else
    echo "  ATTENZIONE  il bundle precedente non ha piu' il suo sha256:"
    echo "              $ULTIMO"
    echo "              atteso   $ATTESA"
    echo "              corrente $CORRENTE"
    echo "              non e' piu' una copia: se ne scrive una nuova."
  fi
fi

if [ "$INTATTO" -eq 1 ]; then
  echo "BUNDLE GIA' COPERTO  ref invariati e sha256 confermato:"
  echo "                     $ULTIMO  (firma ref $FIRMA)"
  echo "                     il non committato viene archiviato lo stesso."
  echo
  archivia_non_committato "$(nome_libero "$OUT/dirty-$STAMP.tar.gz")" || exit $?
  chiudi 0
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
# Il nome porta un timestamp al SECONDO. Due esecuzioni nello stesso secondo
# producevano lo stesso path, e la seconda **sovrascriveva la prima**: un backup
# che cancella un backup. Non e' teorico — e' come si e' scoperto: il control
# run rieseguiva lo script due volte di fila e lo scenario del bundle corrotto
# diventava rosso o verde a seconda di dove cadeva il secondo.
HEADSHA="$(git -C "$ROOT" rev-parse --short=8 HEAD 2>/dev/null || echo nohead)"
BUNDLE="$(nome_libero "$OUT/ardesia-$STAMP-$HEADSHA.bundle")"

git -C "$ROOT" bundle create "$BUNDLE" --all
RC=$?
if [ "$RC" -ne 0 ]; then
  echo "BLOCCATO  git bundle create exit=$RC" >&2
  rm -f "$BUNDLE"
  exit "$RC"
fi

# `-C "$ROOT"`: senza, `git bundle verify` interroga la DIRECTORY CORRENTE, e
# lanciato da fuori da un repo cancellava il bundle appena creato uscendo 1.
# Il test non lo vedeva perche' faceva `cd` nel repo per conto suo: la
# precondizione era stabilita dal test, non dallo script.
git -C "$ROOT" bundle verify "$BUNDLE" > /dev/null 2>&1
RC=$?
if [ "$RC" -ne 0 ]; then
  echo "BLOCCATO  git bundle verify exit=$RC — bundle NON valido, rimosso." >&2
  rm -f "$BUNDLE"
  exit "$RC"
fi

echo "$FIRMA" > "${BUNDLE%.bundle}.refs.sha"
shasum -a 256 "$BUNDLE" | cut -d' ' -f1 > "${BUNDLE%.bundle}.bundle.sha256"
git -C "$ROOT" for-each-ref --format='%(refname) %(objectname)' | sort \
  > "${BUNDLE%.bundle}.refs.txt"

archivia_non_committato "$(nome_libero "$OUT/dirty-$STAMP.tar.gz")" || exit $?

echo
echo "OK  $BUNDLE"
echo "    $(du -h "$BUNDLE" | cut -f1)  ·  $N_REF ref  ·  $NON_BACKUPPATI commit su nessun remoto"
# `--mirror`, non `--bare`. `git clone --bare` trasferisce solo `refs/heads/*`
# e `refs/tags/*`: misurato sul repo vero, dei 127 commit su nessun remoto
# **124 sono raggiungibili nel ripristino e 3 solo presenti** — e quei 3 sono
# uno stash del 2026-07-20. Ci sono anche 19 ref sotto refs/audit/ e 14 sotto
# refs/ardesia-recovery/. Un oggetto presente e irraggiungibile e' esattamente
# cio' che `git gc` pota: documentare il comando sbagliato rende il bundle
# corretto e il ripristino incompleto.
echo "    ripristino:  git clone --mirror $BUNDLE ripristino.git"
chiudi 0
