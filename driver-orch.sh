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
TRIG='Sei Hermes, ORCHESTRATORE di LessonOS (brain DeepSeek) nella dir corrente. Leggi AGENTS.md (ladder sez.1+pipeline sez.3+debug sez.11+retro sez.12+coord sez.13+autoresearch sez.9), COORDINATION.md (gli ORDINI di Claude in § CLAUDE-SAYS = ESEGUILI; se ti serve qualcosa scrivi in § NEEDS-CLAUDE), project-wiki/index.md, MILESTONES.md, STATUS.md e la CODA di RESEARCH.md. Esegui ESATTAMENTE UNA iterazione come da pipeline sez.3: ORIENT -> (RESEARCH se utile, economico) -> PLAN una task -> PLAN-CHECK OBBLIGATORIO (Claude = il tuo cervello strategico indiretto): bash $HOME/lessonos/bin/fable.sh "PLAN-CHECK <task>: piano=<3-6 righe>; file=<elenco>; test=<cosa dimostrano>; rischi=<...>" e APPLICA il verdetto — se Claude corregge, segui la correzione; se fable.sh fallisce (rate-limit), procedi col tuo piano e annotalo in STATUS.md -> BUILD (scrivi TU codice+test con DeepSeek) -> REVIEW (esegui ./bin/review.sh = Claude Code rivede il diff adversarialmente, carica AUTOMATICAMENTE le skill in skills/, applica i fix VERI) -> SELF-REVIEW senza compiacenza -> "uv run pytest -q" VERDE -> COMMIT locale + appendi STATUS.md + aggiorna project-wiki (cita file:line) + appendi log.jsonl. UNA task/ipotesi. NON toccare eval/gate.sh ne indebolire i test per far passare il gate. A ogni RETRO: gli attriti ricorrenti (>=2 RETRO) vanno CHIUSI creando una skill in skills/ o un guard (test/hook), non solo loggati; esegui bin/check-frictions.sh per rilevare attriti scoperti. PROATTIVITA FABLE (nuovo): se la task tocca architettura, schema dati, invarianti o contratti tra moduli, consulta fable.sh PRIMA di scrivere codice (non solo quando sei bloccato) — una domanda secca con contesto, applichi la risposta. STRUMENTI DA PROTAGONISTA (usali TU, senza aspettare Claude): decisione architetturale dura o 2 tentativi falliti -> chiama "bash $HOME/lessonos/bin/fable.sh <domanda con contesto: file:line, cosa hai provato, output gate>" (Claude fable-5, fallback opus) e APPLICA la risposta; ricerca web profonda -> "bash $HOME/maestro-tools/research.sh <domanda> <nome-breve>" (Claude fable-5 con ricerca web reale; report in ~/maestro-logs/research/ — leggilo e applicalo); immagini/pagine manoscritte -> la tua vision kimi-k2.6. Se neanche fable.sh sblocca -> scrivi il blocker in COORDINATION.md sez NEEDS-CLAUDE e COMMITTALO, poi fermati. PRIMA DI INIZIARE: esegui git stash list e cerca stash con messaggio rescue: se uno riguarda la TUA task (pin attuale), ISPEZIONALO con git stash show -p e RIUSA il lavoro valido invece di rifare da zero (mai apply alla cieca: leggi il diff). Se un errore ti sembra gia visto, interroga i tool agentmemory (recall) PRIMA di ri-diagnosticare. Onesta sopra velocita: "fatto" = pytest verde, non dichiarato. Costo contenuto: mock test gratis, ricerca focalizzata, iterazioni strette.'
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
  # BUILDER DEFAULT = fable-5 ULTRACODE (ordine Andrea 11/06: "fable per la maggior
  # parte dei processi su macmini"). Hermes-DeepSeek SOLO se il pin e' marcato
  # [GRIND] (esecuzione di script-dati a basso costo, niente codice creativo) o
  # come FALLBACK quando fable e' rate-limited. Gate e ratchet INVARIATI.
  PIN_LINE=$(sed -n '/## ➡️ PROSSIMA TASK/,/## NEEDS-CLAUDE/p' "$HOME/lessonos/COORDINATION.md" 2>/dev/null | grep -m1 -- '- \*\*lessonos\*\*')
  # W1-M2: timeout adattivo — pin [LUNGA] = finestra doppia (il kill a 2400/3600s
  # esatti ha gia ucciso 2 build gate-verdi; -s INT -k 60 = morte pulita, non KILL secco)
  FT=7200; HT=4800   # maratona 12/06: sessione multi-task, preambolo pagato 1 volta
  if printf '%s' "$PIN_LINE" | grep -q '\[LUNGA\]'; then FT=14400; HT=9600; fi
  # W2-M3 fast-skip: pin esaurito/assente = niente builder, niente quota, niente commit-rumore
  if [ -z "$PIN_LINE" ] || printf '%s' "$PIN_LINE" | grep -qiE 'PIN ESAURITO|\[PIN-DONE'; then
    # M18-light: pin esaurito -> prova a promuovere una task PRE-APPROVATA dalla ROADMAP-AUTO
    if python3 "$HOME/lessonos/bin/promote_pin.py" lessonos >> "$LOG" 2>&1; then
      PIN_LINE=$(sed -n '/## ➡️ PROSSIMA TASK/,/## NEEDS-CLAUDE/p' "$HOME/lessonos/COORDINATION.md" 2>/dev/null | grep -m1 -- '- \*\*lessonos\*\*')
      FT=3600; HT=2400
      if printf '%s' "$PIN_LINE" | grep -q '\[LUNGA\]'; then FT=7200; HT=4800; fi
      echo "[orch] AUTO-PIN promosso dalla roadmap, procedo nella stessa iterazione" | tee -a "$LOG"
    else
    printf '| %s | %s | %s | %s | y | noop-fast | orch:pin esaurito (W2-M3, 0 builder) |\n' "$ts" "$i" "$(git rev-parse --short HEAD)" "$bp" >> "$RES"
    echo "[orch] --- iter $i: noop-fast (pin esaurito, W2-M3) ---" | tee -a "$LOG"
    continue
    fi
  fi
  if printf '%s' "$PIN_LINE" | grep -qE '\[GRIND\]|\[DEEPSEEK\]|\[HERMES\]' && [ "${MAESTRO_KIMI_STATE:-ok}" != exhausted ]; then
    echo "[driver] BUILDER=Hermes-DeepSeek (pin GRIND, basso costo)" | tee -a "$LOG"
    timeout -k 60 -s INT "$HT" hermes --yolo -z "$TRIG" 2>&1 | tee -a "$LOG"
  else
    echo "[driver] BUILDER=fable-5-ultracode (default)" | tee -a "$LOG"
    eval "$(grep -E '^[[:space:]]*export[[:space:]]+CLAUDE_CODE_OAUTH_TOKEN=' "$HOME/.zshenv" 2>/dev/null | tail -1)"
    FACC=$(bash "$HOME/lessonos/bin/acct.sh" pick 2>/dev/null || true)
    if [ -z "$FACC" ]; then
      if [ "${MAESTRO_KIMI_STATE:-ok}" = exhausted ]; then
        echo "[driver] zero account claude E kimi esausto -> skip build (W1-M3)" | tee -a "$LOG"
      else
      echo "[driver] quota-out su TUTTI gli account Claude -> salto fable, Hermes diretto" | tee -a "$LOG"
      timeout -k 60 -s INT "$HT" hermes --yolo -z "$TRIG" 2>&1 | tee -a "$LOG"
      fi
    else
      FABTOK=$(bash "$HOME/lessonos/bin/acct.sh" token "$FACC" 2>/dev/null || true)
      echo "[driver] BUILDER=fable (account $FACC)" | tee -a "$LOG"
      fable_out=$(timeout -k 60 -s INT "$FT" env -u ANTHROPIC_API_KEY CLAUDE_CODE_OAUTH_TOKEN="$FABTOK" claude -p --dangerously-skip-permissions --model claude-fable-5 'ultracode — Sei il BUILDER fable del progetto MAESTRO, nella directory corrente del repo. Esegui ESATTAMENTE UNA task: quella pinnata per QUESTO repo nel blocco PROSSIMA TASK di ~/lessonos/COORDINATION.md (leggila per intera, criteri di accettazione compresi); se e NOOP non costruire, fermati. Prima leggi AGENTS.md e STATUS.md del repo, e le skill in skills/. Scrivi codice e test di qualita massima (orchestra subagenti per le parti indipendenti e per la verifica avversaria del tuo stesso lavoro), esegui bash eval/gate.sh e consegna VERDE, poi IMMEDIATAMENTE git add dei file pertinenti e commit con messaggio chiaro — COMMITTA APPENA IL GATE E VERDE, prima di STATUS/log: il driver SCARTA il lavoro non committato quando scade il timeout, e appendi a STATUS.md (separando VERIFICATO da atteso, con i criteri di accettazione punto per punto) e a log.jsonl. PRIMA DI INIZIARE: esegui git stash list e cerca stash con messaggio rescue: se uno riguarda la TUA task (pin attuale), ISPEZIONALO con git stash show -p e RIUSA il lavoro valido invece di rifare da zero (mai apply alla cieca: leggi il diff). Se un errore ti sembra gia visto, interroga i tool agentmemory (recall) PRIMA di ri-diagnosticare. Prima del commit di OGNI sotto-task lancia un subagente AVVERSARIO sul tuo diff (input reali, invarianti MAESTRO, test che possono fallire); applica i fix VERI e scrivi in STATUS.md una riga "SELF-ADV: trovati N, fixati M". Vincoli: NON toccare eval/gate.sh, nessuna dipendenza nuova ingiustificata, MAI contenuto del corpus nei commit (path si, contenuto no), UNA task sola, onesta brutale: fatto = gate verde eseguito. Verifica il VALORE sui dati, non solo il gate verde. Se la task non e fattibile scrivi il blocker in NEEDS-CLAUDE di COORDINATION e fermati. MARATONA (12/06): quando chiudi la task pinnata (gate verde + commit + STATUS), esegui python3 $HOME/lessonos/bin/promote_pin.py lessonos — se promuove un nuovo pin, PROSEGUI nella STESSA sessione con la nuova task (stesso rigore: gate verde, commit per sotto-task, STATUS, SELF-ADV); massimo 3 promozioni per sessione, poi fermati. Se non promuove, fermati.' 2>&1)
      printf '%s\n' "$fable_out" | tee -a "$LOG"
      if printf '%s' "$fable_out" | grep -qiE "out of extra usage|usage limit|rate.?limit|overloaded|not logged in|unauthorized"; then
        printf '%s' "$fable_out" | bash "$HOME/lessonos/bin/quota.sh" mark "$FACC" 2>&1 | tee -a "$LOG" || true
        echo "[driver] fable indisponibile -> fallback Hermes-DeepSeek (stessa iterazione)" | tee -a "$LOG"
        timeout -k 60 -s INT "$HT" hermes --yolo -z "$TRIG" 2>&1 | tee -a "$LOG"
      fi
    fi
  fi
  t1=$(date +%s); dur=$((t1-t0))
  ah=$(git rev-parse HEAD); am=$(bash eval/gate.sh 2>/dev/null | tail -1)
  ap=$(jget "$am" passed); ap=${ap:-0}; ae=$(jget "$am" exit); ae=${ae:-1}
  if [ "$ah" = "$bh" ]; then
    status="blocked/noop"; note="HEAD invariato (${dur}s) — vedi STATUS.md"
    # RESCUE lavoro orfano (bug 11/06: builder killed/uscito SENZA commit -> il
    # reset+clean del tick successivo distruggeva tutto; perse 2 build M1-1c).
    # Tree sporco + HEAD fermo = stash -u; il supervisore decide cosa farne.
    if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
      git stash push -u -m "rescue iter $ts (no-commit, gate misurato passed=$ap)" >/dev/null 2>&1 || true
      note="HEAD invariato (${dur}s) — LAVORO ORFANO STASHATO (passed=$ap) — vedi STATUS.md"
    fi
  elif [ "$ae" = 0 ] && [ "$ap" -ge 1 ] && [ "$ap" -ge "$bp" ]; then
    status="pass"; note="kept; gate verde (passed=$ap; ${dur}s)"; git push -q origin HEAD:auto/main 2>/dev/null || true
  else
    # RESCUE anche sul ramo REVERT (11/06 sera: M1-5 quasi-intera persa qui —
    # il rescue 4320827 copriva solo il ramo noop): il tree sporco va in stash
    # PRIMA del reset; un eventuale commit revertito resta comunque nel reflog.
    if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
      git stash push -u -m "rescue REVERT iter $ts (gate rosso, passed=$ap)" >/dev/null 2>&1 || true
      note="gate rosso/regresso (exit=$ae passed $bp->$ap; ${dur}s) -> reset + LAVORO STASHATO"
    else
      note="gate rosso/regresso (exit=$ae passed $bp->$ap; ${dur}s) -> reset"
    fi
    status="REVERT"; git reset --hard "$bh" >/dev/null 2>&1 || true
  fi
  printf '%s\n%s\n' "$day" "$((dt+1))" > "$CAP_FILE"
  printf '| %s | %s | %s | %s | %s | %s | orch:%s |\n' "$ts" "$i" "$(git rev-parse --short HEAD)" "$ap" "$([ "${ae:-1}" = 0 ] && echo y || echo n)" "$status" "$note" >> "$RES"
  echo "[orch] --- iter $i: $status ($note) ---" | tee -a "$LOG"
done
echo "[orch] done $(date -u +%FT%TZ)." | tee -a "$LOG"
