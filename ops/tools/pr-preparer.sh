#!/bin/bash
# ARDESIA — pr-preparer.sh : tiene `main` SEMPRE FRESCO senza auto-merge.
# Per ogni repo, se auto/main e' avanti di main:
#   - nessuna PR auto->main aperta -> ne apre UNA (CI-gated; il body elenca i commit da ratificare).
#   - PR gia' aperta -> notifica Andrea SOLO su stato azionabile: PRONTA (CI verde+mergeable),
#     BLOCCATA (CI rossa su auto/main), CONFLITTO (main divergente). Throttle 6h.
# NON MERGA MAI (merge auto/main->main = Claude+Andrea, protocollo). Solo apre PR + notifica.
# Fault-isolato (ogni errore -> continue/exit 0, mai blocca nulla). Disattiva: PRPREP_ENABLED=0.
set -u
export PATH="/opt/homebrew/bin:$HOME/.local/bin:/usr/bin:/bin:$PATH"
[ "${PRPREP_ENABLED:-1}" = "1" ] || { echo "[pr-prep] disabilitato"; exit 0; }
LOGD="$HOME/maestro-logs/pr-preparer"; mkdir -p "$LOGD"
NOW=$(date +%s); THROTTLE="${PRPREP_THROTTLE:-21600}"
notify(){ bash "$HOME/maestro-tools/notify-telegram.sh" "$1" >/dev/null 2>&1 || true; }
cannotify(){ local l; l=$(cat "$LOGD/.ln_$1" 2>/dev/null || echo 0); case "$l" in ''|*[!0-9]*) l=0;; esac; [ $((NOW-l)) -ge "$THROTTLE" ]; }
marknotify(){ echo "$NOW" > "$LOGD/.ln_$1"; }

for pair in "lessonos:$HOME/lessonos" "ardesia-studio:$HOME/maestro-studio"; do
  repo="${pair%%:*}"; dir="${pair#*:}"
  [ -d "$dir/.git" ] || { echo "[pr-prep] $repo: no dir"; continue; }
  git -C "$dir" fetch github --quiet 2>/dev/null || { echo "[pr-prep] $repo: fetch github FAIL (rete?)"; continue; }
  ahead=$(git -C "$dir" rev-list --count github/main..github/auto/main 2>/dev/null || echo 0)
  case "$ahead" in ''|*[!0-9]*) ahead=0;; esac
  if [ "$ahead" -eq 0 ]; then echo "[pr-prep] $repo: main fresco (0 avanti)"; continue; fi
  prnum=$(gh pr list -R "AndreaMarro/$repo" --base main --head auto/main --state open --json number --jq '.[0].number // empty' 2>/dev/null)
  if [ -z "$prnum" ]; then
    BODY="PR auto-preparata (pr-preparer): accumula il lavoro VALIDATO del loop su auto/main verso main (ratificato). CI-gated, main protetto. MERGE = umano (Claude/Andrea), NON auto-merge — mergi quando vuoi.

## Commit da ratificare ($ahead):
$(git -C "$dir" log --oneline github/main..github/auto/main 2>/dev/null | head -25)"
    url=$(gh pr create -R "AndreaMarro/$repo" --base main --head auto/main \
       --title "Ratifica auto/main -> main ($ahead commit)" --body "$BODY" 2>&1 | grep -oE 'https://github.com/[^ ]+' | head -1)
    echo "[pr-prep] $repo: APERTA PR ($ahead commit) ${url:-?}"
    notify "Ratifica $repo: PR auto/main->main aperta ($ahead commit), CI in corso. Mergi quando vuoi: ${url:-vedi GitHub}"
    marknotify "$repo"
  else
    mer=$(gh pr view "$prnum" -R "AndreaMarro/$repo" --json mergeable --jq .mergeable 2>/dev/null)
    chk=$(gh pr view "$prnum" -R "AndreaMarro/$repo" --json statusCheckRollup --jq '[.statusCheckRollup[]?|.conclusion//.status]|join(",")' 2>/dev/null)
    echo "[pr-prep] $repo: PR#$prnum ($ahead commit) mer=$mer chk=$chk"
    cannotify "$repo" || continue
    if printf '%s' "$chk" | grep -q FAILURE; then
      notify "Ratifica $repo BLOCCATA: PR#$prnum CI ROSSA su auto/main — il loop deve fixare prima di ratificare."; marknotify "$repo"
    elif [ "$mer" = CONFLICTING ]; then
      notify "Ratifica $repo CONFLITTO: PR#$prnum — main divergente, serve risoluzione manuale."; marknotify "$repo"
    elif [ "$mer" = MERGEABLE ] && printf '%s' "$chk" | grep -q SUCCESS && ! printf '%s' "$chk" | grep -qiE 'PENDING|PROGRESS|QUEUED|WAITING'; then
      notify "Ratifica $repo PRONTA: PR#$prnum ($ahead commit), CI verde+mergeable. Mergi: gh pr merge $prnum -R AndreaMarro/$repo --merge"; marknotify "$repo"
    fi
  fi
done
echo "[pr-prep] done $(date -u +%FT%TZ)"
