#!/bin/bash
# MAESTRO-Studio — DRIVER (gemello di driver-orch.sh; repo ~/maestro-studio, gate frozen = tsc+vitest).
# Hermes scrive TS/React; il driver giudica col gate e fa REVERT se rosso/regredisce. Journal in ~/maestro-logs/
# (FUORI dai repo: il reset --hard non lo cancella — fix del journal-loss bug noto di driver-orch).
# Uso: ~/lessonos/driver-studio.sh [N]   (default 1)   |   pausa: touch ~/lessonos/STOP (kill-switch unico)
set -uo pipefail
# homebrew PRIMA di node-local: node-local è v22.10 (< 22.12 richiesto da vitest 4 → discovery test rotta, bug attempt-2)
export PATH="/opt/homebrew/bin:$HOME/.local/bin:$HOME/node-local/bin:$PATH"
# BLIND OpenAI/Codex dal subprocess Hermes (stesso pattern di driver-orch.sh)
export CODEX_HOME="$HOME/lessonos/.no-codex"; mkdir -p "$CODEX_HOME"; [ -f "$CODEX_HOME/auth.json" ] || echo '{}' > "$CODEX_HOME/auth.json"
unset OPENAI_API_KEY OPENROUTER_API_KEY 2>/dev/null || true
REPO="$HOME/maestro-studio"
cd "$REPO" || { echo "no $REPO"; exit 1; }
N="${1:-1}"; LOG="$HOME/lessonos/driver-studio.log"
mkdir -p "$HOME/maestro-logs"; RES="$HOME/maestro-logs/RESEARCH-studio.md"
CAP_FILE="$HOME/lessonos/.iters_today"; CAP_MAX="${LESSONOS_DAILY_CAP:-12}"   # cap CONDIVISO con lessonos (un Mini, un budget)
TRIG='Sei Hermes, ORCHESTRATORE di MAESTRO-Studio (superficie di cattura: TypeScript/React/Vite, lavagna Excalidraw) nella dir corrente ~/maestro-studio. Leggi AGENTS.md (TUTTO), ~/lessonos/COORDINATION.md (§ CLAUDE-SAYS = gli ORDINI, ESEGUILI in ordine; ti serve qualcosa -> scrivi in § NEEDS-CLAUDE), STATUS.md e README.md. Esegui ESATTAMENTE UNA iterazione: ORIENT -> PLAN la PRIMA task M0 non completata dagli ORDINI (T0 -> T1 -> T2 -> T3, criteri di accettazione vincolanti) -> PLAN-CHECK OBBLIGATORIO (Claude = il tuo cervello strategico indiretto): bash $HOME/lessonos/bin/fable.sh "PLAN-CHECK <task>: piano=<3-6 righe>; file=<elenco>; test=<cosa dimostrano>; rischi=<...>" e APPLICA il verdetto — se Claude corregge, segui la correzione; se fable.sh fallisce (rate-limit), procedi col tuo piano e annotalo in STATUS.md -> BUILD (scrivi TU codice+test vitest NON tautologici; jsdom se serve DOM) -> REVIEW (esegui ./bin/review.sh = reviewer decorrelato, applica i fix VERI) -> "bash eval/gate.sh" VERDE (tsc+vitest) -> COMMIT locale + appendi STATUS.md + appendi log.jsonl. UNA task/ipotesi per iterazione. NON toccare eval/gate.sh ne indebolire i test. PROATTIVITA FABLE (nuovo): se la task tocca architettura, schema dati, invarianti o contratti tra moduli, consulta fable.sh PRIMA di scrivere codice (non solo quando sei bloccato) — una domanda secca con contesto, applichi la risposta. STRUMENTI DA PROTAGONISTA (usali TU, senza aspettare Claude): (1) decisione architetturale dura o 2 tentativi falliti -> chiama "bash $HOME/lessonos/bin/fable.sh <domanda con contesto: file:line, cosa hai provato, output gate>" (Claude fable-5 risponde, fallback opus) e APPLICA la risposta; (2) ricerca web profonda -> "bash $HOME/maestro-tools/research.sh <domanda> <nome-breve>" (Claude fable-5 con ricerca web reale; report in ~/maestro-logs/research/ — leggilo e applicalo); (3) immagini/pagine manoscritte -> la tua vision kimi-k2.6. Se anche fable.sh non sblocca -> scrivi il blocker in ~/lessonos/COORDINATION.md § NEEDS-CLAUDE E COMMITTALO NEL REPO LESSONOS (sopravvive al revert), poi fermati. Onesta sopra velocita: "fatto" = gate verde eseguito, non dichiarato.'
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
  timeout 2400 hermes --yolo -z "$TRIG" 2>&1 | tee -a "$LOG"
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
