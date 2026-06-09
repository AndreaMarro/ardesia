#!/bin/bash
# MAESTRO-Studio — DRIVER (gemello di driver-orch.sh; repo ~/maestro-studio, gate frozen = tsc+vitest).
# Hermes scrive TS/React; il driver giudica col gate e fa REVERT se rosso/regredisce. Journal in ~/maestro-logs/
# (FUORI dai repo: il reset --hard non lo cancella — fix del journal-loss bug noto di driver-orch).
# Uso: ~/lessonos/driver-studio.sh [N]   (default 1)   |   pausa: touch ~/lessonos/STOP (kill-switch unico)
set -uo pipefail
export PATH="$HOME/.local/bin:$HOME/node-local/bin:/opt/homebrew/bin:$PATH"
# BLIND OpenAI/Codex dal subprocess Hermes (stesso pattern di driver-orch.sh)
export CODEX_HOME="$HOME/lessonos/.no-codex"; mkdir -p "$CODEX_HOME"; [ -f "$CODEX_HOME/auth.json" ] || echo '{}' > "$CODEX_HOME/auth.json"
unset OPENAI_API_KEY OPENROUTER_API_KEY 2>/dev/null || true
REPO="$HOME/maestro-studio"
cd "$REPO" || { echo "no $REPO"; exit 1; }
N="${1:-1}"; LOG="$HOME/lessonos/driver-studio.log"
mkdir -p "$HOME/maestro-logs"; RES="$HOME/maestro-logs/RESEARCH-studio.md"
CAP_FILE="$HOME/lessonos/.iters_today"; CAP_MAX="${LESSONOS_DAILY_CAP:-12}"   # cap CONDIVISO con lessonos (un Mini, un budget)
TRIG='Sei Hermes, ORCHESTRATORE di MAESTRO-Studio (superficie di cattura: TypeScript/React/Vite, lavagna Excalidraw) nella dir corrente ~/maestro-studio. Leggi AGENTS.md (TUTTO), ~/lessonos/COORDINATION.md (§ CLAUDE-SAYS = gli ORDINI, ESEGUILI in ordine; ti serve qualcosa -> scrivi in § NEEDS-CLAUDE), STATUS.md e README.md. Esegui ESATTAMENTE UNA iterazione: ORIENT -> PLAN la PRIMA task M0 non completata dagli ORDINI (T0 -> T1 -> T2 -> T3, criteri di accettazione vincolanti) -> BUILD (scrivi TU codice+test vitest NON tautologici; jsdom se serve DOM) -> REVIEW (esegui ./bin/review.sh = reviewer decorrelato, applica i fix VERI) -> "bash eval/gate.sh" VERDE (tsc+vitest) -> COMMIT locale + appendi STATUS.md + appendi log.jsonl. UNA task/ipotesi per iterazione. NON toccare eval/gate.sh ne indebolire i test. Bloccato o 2 tentativi falliti -> scrivi il blocker in STATUS.md + NEEDS-CLAUDE e fermati. Onesta sopra velocita: "fatto" = gate verde eseguito, non dichiarato.'
jget(){ printf '%s' "$1" | grep -oE "\"$2\":[0-9]+" | grep -oE '[0-9]+'; }
day=$(date -u +%F); [ "$(head -1 "$CAP_FILE" 2>/dev/null)" = "$day" ] || printf '%s\n0\n' "$day" > "$CAP_FILE"
for i in $(seq 1 "$N"); do
  [ -f "$HOME/lessonos/STOP" ] && { echo "[studio] STOP — halt." | tee -a "$LOG"; break; }
  git reset --hard HEAD >/dev/null 2>&1; git clean -fd >/dev/null 2>&1   # baseline pulita (node_modules/dist sono gitignorati -> restano)
  dt=$(sed -n 2p "$CAP_FILE" 2>/dev/null); dt=${dt:-0}
  if [ "$dt" -ge "$CAP_MAX" ]; then echo "[studio] CAP giornaliero $CAP_MAX raggiunto." | tee -a "$LOG"; break; fi
  ts=$(date -u +%FT%TZ); bh=$(git rev-parse HEAD)
  bm=$(bash eval/gate.sh 2>/dev/null | tail -1); bp=$(jget "$bm" passed); bp=${bp:-0}
  echo "[studio] === iter $i/$N $ts | baseline passed=$bp | oggi $dt/$CAP_MAX ===" | tee -a "$LOG"
  t0=$(date +%s)
  timeout 1800 hermes --yolo -z "$TRIG" 2>&1 | tee -a "$LOG"
  t1=$(date +%s); dur=$((t1-t0))
  ah=$(git rev-parse HEAD); am=$(bash eval/gate.sh 2>/dev/null | tail -1)
  ap=$(jget "$am" passed); ap=${ap:-0}; ae=$(jget "$am" exit); ae=${ae:-1}
  if [ "$ah" = "$bh" ]; then status="blocked/noop"; note="HEAD invariato (${dur}s) — vedi STATUS.md"
  elif [ "$ae" = 0 ] && [ "$ap" -ge "$bp" ]; then
    status="pass"; note="kept; gate verde (passed=$ap; ${dur}s)"; git push -q origin HEAD:auto/main 2>/dev/null || true
  else
    status="REVERT"; note="gate rosso/regresso (exit=$ae passed $bp->$ap; ${dur}s) -> reset"; git reset --hard "$bh" >/dev/null 2>&1 || true
  fi
  printf '%s\n%s\n' "$day" "$((dt+1))" > "$CAP_FILE"
  printf '| %s | %s | %s | %s | %s | %s | studio:%s |\n' "$ts" "$i" "$(git rev-parse --short HEAD)" "$ap" "$([ "${ae:-1}" = 0 ] && echo y || echo n)" "$status" "$note" >> "$RES"
  echo "[studio] --- iter $i: $status ($note) ---" | tee -a "$LOG"
done
echo "[studio] done $(date -u +%FT%TZ)." | tee -a "$LOG"
