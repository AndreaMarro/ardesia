#!/bin/bash
# LessonOS — DRIVER ORCHESTRATORE (Hermes-Kimi guida+scrive; gate frozen = autorita; ratchet Karpathy).
# Hermes-Kimi: orienta/ricerca/pianifica/SCRIVE-codice/auto-rivede/committa. Il driver giudica col gate FROZEN
# e fa REVERT se rosso/regredisce (Hermes non puo barare). Costi contenuti: brain Kimi + CAP giornaliero + STOP.
# Uso: ~/lessonos/driver-orch.sh [N]   (default 1)   |   pausa: touch ~/lessonos/STOP
set -uo pipefail
export PATH="$HOME/.local/bin:$HOME/node-local/bin:/opt/homebrew/bin:$PATH"
# BLIND OpenAI/Codex dal subprocess Hermes -> 100% Kimi, nessun failover 429 (auth.py legge ~/.codex/auth.json via CODEX_HOME + OPENAI_API_KEY/OPENROUTER_API_KEY env)
export CODEX_HOME="$HOME/lessonos/.no-codex"; mkdir -p "$CODEX_HOME"; [ -f "$CODEX_HOME/auth.json" ] || echo '{}' > "$CODEX_HOME/auth.json"
unset OPENAI_API_KEY OPENROUTER_API_KEY 2>/dev/null || true
cd "$HOME/lessonos" || { echo "no ~/lessonos"; exit 1; }
N="${1:-1}"; LOG="$HOME/lessonos/driver.log"; mkdir -p "$HOME/maestro-logs"; RES="$HOME/maestro-logs/RESEARCH-lessonos.md"   # FUORI dal repo: fix journal-loss (reset --hard cancellava gli append non committati)
CAP_FILE="$HOME/lessonos/.iters_today"; CAP_MAX="${LESSONOS_DAILY_CAP:-12}"   # cap costi: max iterazioni/giorno
TRIG='Sei Hermes, ORCHESTRATORE di LessonOS (brain DeepSeek) nella dir corrente. Leggi AGENTS.md (ladder sez.1+pipeline sez.3+debug sez.11+retro sez.12+coord sez.13+autoresearch sez.9), COORDINATION.md (gli ORDINI di Claude in § CLAUDE-SAYS = ESEGUILI; se ti serve qualcosa scrivi in § NEEDS-CLAUDE), project-wiki/index.md, MILESTONES.md, STATUS.md e la CODA di RESEARCH.md. Esegui ESATTAMENTE UNA iterazione come da pipeline sez.3: ORIENT -> (RESEARCH se utile, economico) -> PLAN una task -> PLAN-CHECK OBBLIGATORIO (Claude = il tuo cervello strategico indiretto): bash $HOME/lessonos/bin/fable.sh "PLAN-CHECK <task>: piano=<3-6 righe>; file=<elenco>; test=<cosa dimostrano>; rischi=<...>" e APPLICA il verdetto — se Claude corregge, segui la correzione; se fable.sh fallisce (rate-limit), procedi col tuo piano e annotalo in STATUS.md -> BUILD (scrivi TU codice+test con DeepSeek) -> REVIEW (esegui ./bin/review.sh = Claude Code rivede il diff adversarialmente, carica AUTOMATICAMENTE le skill in skills/, applica i fix VERI) -> SELF-REVIEW senza compiacenza -> "uv run pytest -q" VERDE -> COMMIT locale + appendi STATUS.md + aggiorna project-wiki (cita file:line) + appendi log.jsonl. UNA task/ipotesi. NON toccare eval/gate.sh ne indebolire i test per far passare il gate. A ogni RETRO: gli attriti ricorrenti (>=2 RETRO) vanno CHIUSI creando una skill in skills/ o un guard (test/hook), non solo loggati; esegui bin/check-frictions.sh per rilevare attriti scoperti. PROATTIVITA FABLE (nuovo): se la task tocca architettura, schema dati, invarianti o contratti tra moduli, consulta fable.sh PRIMA di scrivere codice (non solo quando sei bloccato) — una domanda secca con contesto, applichi la risposta. STRUMENTI DA PROTAGONISTA (usali TU, senza aspettare Claude): decisione architetturale dura o 2 tentativi falliti -> chiama "bash $HOME/lessonos/bin/fable.sh <domanda con contesto: file:line, cosa hai provato, output gate>" (Claude fable-5, fallback opus) e APPLICA la risposta; ricerca web profonda -> "bash $HOME/maestro-tools/research.sh <domanda> <nome-breve>" (Claude fable-5 con ricerca web reale; report in ~/maestro-logs/research/ — leggilo e applicalo); immagini/pagine manoscritte -> la tua vision kimi-k2.6. Se neanche fable.sh sblocca -> scrivi il blocker in COORDINATION.md sez NEEDS-CLAUDE e COMMITTALO, poi fermati. Onesta sopra velocita: "fatto" = pytest verde, non dichiarato. Costo contenuto: mock test gratis, ricerca focalizzata, iterazioni strette.'
jget(){ printf '%s' "$1" | grep -oE "\"$2\":[0-9]+" | grep -oE '[0-9]+'; }
day=$(date -u +%F); [ "$(head -1 "$CAP_FILE" 2>/dev/null)" = "$day" ] || printf '%s\n0\n' "$day" > "$CAP_FILE"
for i in $(seq 1 "$N"); do
  [ -f STOP ] && { echo "[orch] STOP — halt." | tee -a "$LOG"; break; }
  git reset --hard HEAD >/dev/null 2>&1; git clean -fd >/dev/null 2>&1   # baseline PULITA: zero debris da iter precedenti (es. lavoro non-committato per 429) -> integrità ratchet
  dt=$(sed -n 2p "$CAP_FILE" 2>/dev/null); dt=${dt:-0}
  if [ "$dt" -ge "$CAP_MAX" ]; then echo "[orch] CAP giornaliero $CAP_MAX raggiunto — stop (costi contenuti)." | tee -a "$LOG"; break; fi
  ts=$(date -u +%FT%TZ); bh=$(git rev-parse HEAD)
  bm=$(bash eval/gate.sh 2>/dev/null | tail -1); bp=$(jget "$bm" passed); bp=${bp:-0}
  echo "[orch] === iter $i/$N $ts | baseline passed=$bp | brain=DeepSeek(orch)+ClaudeCode(build) | oggi $dt/$CAP_MAX ===" | tee -a "$LOG"
  t0=$(date +%s)
  # FABLE-BUILD (ordine Andrea 10/06): se il pin di questo repo è marcato [FABLE-BUILD],
  # costruisce Claude fable-5 ULTRACODE al posto di Hermes. Gate e ratchet INVARIATI.
  PIN_LINE=$(sed -n '/## ➡️ PROSSIMA TASK/,/## NEEDS-CLAUDE/p' "$HOME/lessonos/COORDINATION.md" 2>/dev/null | grep -m1 -- '- \*\*lessonos\*\*')
  if printf '%s' "$PIN_LINE" | grep -q 'FABLE-BUILD'; then
    echo "[driver] BUILDER=fable-5-ultracode (pin FABLE-BUILD)" | tee -a "$LOG"
    eval "$(grep -E '^[[:space:]]*export[[:space:]]+CLAUDE_CODE_OAUTH_TOKEN=' "$HOME/.zshenv" 2>/dev/null | tail -1)"
    timeout 2400 env -u ANTHROPIC_API_KEY claude -p --dangerously-skip-permissions --model claude-fable-5 'ultracode — Sei il BUILDER fable del progetto MAESTRO, nella directory corrente del repo. Esegui ESATTAMENTE UNA task: quella marcata [FABLE-BUILD] per QUESTO repo nel blocco PROSSIMA TASK di ~/lessonos/COORDINATION.md (leggila per intera, criteri di accettazione compresi). Prima leggi AGENTS.md e STATUS.md del repo. Scrivi codice e test di qualita massima (orchestra subagenti per le parti indipendenti e per la verifica avversaria del tuo stesso lavoro), esegui bash eval/gate.sh e consegna VERDE, poi git add dei file pertinenti e commit con messaggio chiaro, e appendi a STATUS.md (separando VERIFICATO da atteso, con i criteri di accettazione punto per punto) e a log.jsonl. Vincoli identici a Hermes: NON toccare eval/gate.sh, nessuna dipendenza nuova ingiustificata, MAI contenuto del corpus nei commit (path si, contenuto no), UNA task sola, onesta brutale: fatto = gate verde eseguito. Se la task non e fattibile scrivi il blocker in NEEDS-CLAUDE di COORDINATION e fermati.' 2>&1 | tee -a "$LOG"
  else
    timeout 2400 hermes --yolo -z "$TRIG" 2>&1 | tee -a "$LOG"
  fi
  t1=$(date +%s); dur=$((t1-t0))
  ah=$(git rev-parse HEAD); am=$(bash eval/gate.sh 2>/dev/null | tail -1)
  ap=$(jget "$am" passed); ap=${ap:-0}; ae=$(jget "$am" exit); ae=${ae:-1}
  if [ "$ah" = "$bh" ]; then status="blocked/noop"; note="HEAD invariato (${dur}s) — vedi STATUS.md"
  elif [ "$ae" = 0 ] && [ "$ap" -ge 1 ] && [ "$ap" -ge "$bp" ]; then
    status="pass"; note="kept; gate verde (passed=$ap; ${dur}s)"; git push -q origin HEAD:auto/main 2>/dev/null || true
  else
    status="REVERT"; note="gate rosso/regresso (exit=$ae passed $bp->$ap; ${dur}s) -> reset"; git reset --hard "$bh" >/dev/null 2>&1 || true
  fi
  printf '%s\n%s\n' "$day" "$((dt+1))" > "$CAP_FILE"
  printf '| %s | %s | %s | %s | %s | %s | orch:%s |\n' "$ts" "$i" "$(git rev-parse --short HEAD)" "$ap" "$([ "${ae:-1}" = 0 ] && echo y || echo n)" "$status" "$note" >> "$RES"
  echo "[orch] --- iter $i: $status ($note) ---" | tee -a "$LOG"
done
echo "[orch] done $(date -u +%FT%TZ)." | tee -a "$LOG"
