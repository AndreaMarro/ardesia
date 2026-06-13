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
TRIG='Sei Hermes, ORCHESTRATORE di MAESTRO-Studio (superficie di cattura: TypeScript/React/Vite, lavagna Excalidraw) nella dir corrente ~/maestro-studio. Leggi AGENTS.md (TUTTO), ~/lessonos/COORDINATION.md (§ CLAUDE-SAYS = gli ORDINI, ESEGUILI in ordine; ti serve qualcosa -> scrivi in § NEEDS-CLAUDE), STATUS.md e README.md. Esegui ESATTAMENTE UNA iterazione: ORIENT -> PLAN la PRIMA task M0 non completata dagli ORDINI (T0 -> T1 -> T2 -> T3, criteri di accettazione vincolanti) -> PLAN-CHECK OBBLIGATORIO (Claude = il tuo cervello strategico indiretto): bash $HOME/lessonos/bin/fable.sh "PLAN-CHECK <task>: piano=<3-6 righe>; file=<elenco>; test=<cosa dimostrano>; rischi=<...>" e APPLICA il verdetto — se Claude corregge, segui la correzione; se fable.sh fallisce (rate-limit), procedi col tuo piano e annotalo in STATUS.md -> BUILD (scrivi TU codice+test vitest NON tautologici; jsdom se serve DOM) -> REVIEW (esegui ./bin/review.sh = reviewer decorrelato, applica i fix VERI) -> "bash eval/gate.sh" VERDE (tsc+vitest) -> COMMIT locale + appendi STATUS.md + appendi log.jsonl. UNA task/ipotesi per iterazione. NON toccare eval/gate.sh ne indebolire i test. PROATTIVITA FABLE (nuovo): se la task tocca architettura, schema dati, invarianti o contratti tra moduli, consulta fable.sh PRIMA di scrivere codice (non solo quando sei bloccato) — una domanda secca con contesto, applichi la risposta. STRUMENTI DA PROTAGONISTA (usali TU, senza aspettare Claude): (1) decisione architetturale dura o 2 tentativi falliti -> chiama "bash $HOME/lessonos/bin/fable.sh <domanda con contesto: file:line, cosa hai provato, output gate>" (Claude fable-5 risponde, fallback opus) e APPLICA la risposta; (2) ricerca web profonda -> "bash $HOME/maestro-tools/research.sh <domanda> <nome-breve>" (Claude fable-5 con ricerca web reale; report in ~/maestro-logs/research/ — leggilo e applicalo); (3) immagini/pagine manoscritte -> la tua vision kimi-k2.6. Se anche fable.sh non sblocca -> scrivi il blocker in ~/lessonos/COORDINATION.md § NEEDS-CLAUDE E COMMITTALO NEL REPO LESSONOS (sopravvive al revert), poi fermati. PRIMA DI INIZIARE: esegui git stash list e cerca stash con messaggio rescue: se uno riguarda la TUA task (pin attuale), ISPEZIONALO con git stash show -p e RIUSA il lavoro valido invece di rifare da zero (mai apply alla cieca: leggi il diff). Se un errore ti sembra gia visto, interroga i tool agentmemory (recall) PRIMA di ri-diagnosticare. Onesta sopra velocita: "fatto" = gate verde eseguito, non dichiarato. MARATONA (12/06): quando chiudi la task pinnata (gate verde + commit + STATUS), esegui python3 $HOME/lessonos/bin/promote_pin.py studio — se promuove un nuovo pin, PROSEGUI nella STESSA sessione con la nuova task (stesso rigore: gate verde, commit per sotto-task, STATUS, SELF-ADV); massimo 6 promozioni per sessione, poi fermati. Se non promuove, fermati.'
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
  # BUILDER DEFAULT = fable-5 ULTRACODE (ordine Andrea 11/06). Hermes-DeepSeek
  # SOLO se il pin e' [GRIND] (script-dati a basso costo) o fallback rate-limit.
  PIN_LINE=$(sed -n '/## ➡️ PROSSIMA TASK/,/## NEEDS-CLAUDE/p' "$HOME/lessonos/COORDINATION.md" 2>/dev/null | grep -m1 -- '- \*\*studio\*\*')
  # W1-M2: timeout adattivo — pin [LUNGA] = finestra doppia (il kill a 2400/3600s
  # esatti ha gia ucciso 2 build gate-verdi; -s INT -k 60 = morte pulita, non KILL secco)
  FT=7200; HT=4800   # maratona 12/06: sessione multi-task
  if printf '%s' "$PIN_LINE" | grep -q '\[LUNGA\]'; then FT=14400; HT=9600; fi
  # maratona-coda 12/06: coda piena = la sessione concatena -> tetto largo
  if grep -q '\[AUTO-OK\] studio' "$HOME/lessonos/COORDINATION.md"; then FT=14400; HT=9600; fi
  # W2-M3 fast-skip: pin esaurito/assente = niente builder, niente quota, niente commit-rumore
  if [ -z "$PIN_LINE" ] || printf '%s' "$PIN_LINE" | grep -qiE 'PIN ESAURITO|\[PIN-DONE'; then
    # M18-light: pin esaurito -> prova a promuovere una task PRE-APPROVATA dalla ROADMAP-AUTO
    if python3 "$HOME/lessonos/bin/promote_pin.py" studio >> "$LOG" 2>&1; then
      PIN_LINE=$(sed -n '/## ➡️ PROSSIMA TASK/,/## NEEDS-CLAUDE/p' "$HOME/lessonos/COORDINATION.md" 2>/dev/null | grep -m1 -- '- \*\*studio\*\*')
      FT=7200; HT=4800
      if printf '%s' "$PIN_LINE" | grep -q '\[LUNGA\]'; then FT=14400; HT=9600; fi
      echo "[studio] AUTO-PIN promosso dalla roadmap, procedo nella stessa iterazione" | tee -a "$LOG"
    else
    printf '| %s | %s | %s | %s | y | noop-fast | studio:pin esaurito (W2-M3, 0 builder) |\n' "$ts" "$i" "$(git rev-parse --short HEAD)" "$bp" >> "$RES"
    echo "[studio] --- iter $i: noop-fast (pin esaurito, W2-M3) ---" | tee -a "$LOG"
    MKQ="$HOME/.coda_vuota_alert_studio"; NW=$(date +%s); LQ=$(cat "$MKQ" 2>/dev/null || echo 0)
    if [ $((NW-LQ)) -ge 21600 ]; then bash "$HOME/maestro-tools/notify-telegram.sh" "Ardesia: coda studio vuota e pin esaurito, il loop e in attesa di un ordine. Da Telegram: pin studio <task> per assegnarne uno, oppure coda per lo stato." >/dev/null 2>&1 || true; echo "$NW" > "$MKQ"; fi
    continue
    fi
  fi
  if printf '%s' "$PIN_LINE" | grep -qE '\[GRIND\]|\[DEEPSEEK\]|\[HERMES\]' && [ "${MAESTRO_KIMI_STATE:-ok}" != exhausted ]; then
    echo "[driver] BUILDER=Hermes-DeepSeek (pin GRIND)" | tee -a "$LOG"
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
      BUILDMODEL=$(bash "$HOME/lessonos/bin/pick-build-model.sh" "$FABTOK" 2>/dev/null)
      if [ -z "$BUILDMODEL" ]; then echo "[driver] nessun modello Claude accessibile -> Hermes-DeepSeek" | tee -a "$LOG"; timeout -k 60 -s INT "$HT" hermes --yolo -z "$TRIG" 2>&1 | tee -a "$LOG"; BUILDMODEL=__SKIP__; fi
      [ "$BUILDMODEL" != "claude-fable-5" ] && [ "$BUILDMODEL" != "__SKIP__" ] && echo "[driver] fable-5 inaccessibile -> builder su $BUILDMODEL" | tee -a "$LOG"
      echo "[driver] BUILDER=fable (account $FACC)" | tee -a "$LOG"
      [ "$BUILDMODEL" = "__SKIP__" ] || fable_out=$(timeout -k 60 -s INT "$FT" env -u ANTHROPIC_API_KEY CLAUDE_CODE_OAUTH_TOKEN="$FABTOK" claude -p --dangerously-skip-permissions --model "$BUILDMODEL" 'ultracode — Sei il BUILDER fable di MAESTRO-Studio (TypeScript/React/Vite, lavagna Excalidraw), nella dir corrente ~/maestro-studio. Esegui ESATTAMENTE UNA task: quella pinnata per studio nel blocco PROSSIMA TASK di ~/lessonos/COORDINATION.md (leggila per intera, criteri compresi); se e NOOP non costruire, fermati. Prima leggi AGENTS.md e STATUS.md e le skill in skills/. Scrivi codice e test vitest di qualita massima (orchestra subagenti per parti indipendenti e verifica avversaria), esegui bash eval/gate.sh (tsc+vitest) e consegna VERDE, poi git add dei file pertinenti e commit chiaro IMMEDIATO — COMMITTA APPENA IL GATE E VERDE, prima di STATUS/log: il driver SCARTA il lavoro non committato a timeout — poi appendi STATUS.md e log.jsonl. PRIMA DI INIZIARE: esegui git stash list e cerca stash con messaggio rescue: se uno riguarda la TUA task (pin attuale), ISPEZIONALO con git stash show -p e RIUSA il lavoro valido invece di rifare da zero (mai apply alla cieca: leggi il diff). Se un errore ti sembra gia visto, interroga i tool agentmemory (recall) PRIMA di ri-diagnosticare. Prima del commit di OGNI sotto-task lancia un subagente AVVERSARIO sul tuo diff (input reali, invarianti MAESTRO, test che possono fallire); applica i fix VERI e scrivi in STATUS.md una riga "SELF-ADV: trovati N, fixati M". Vincoli: NON toccare eval/gate.sh, niente dipendenze ingiustificate, UNA task sola, onesta brutale: fatto = gate verde eseguito. Se non fattibile scrivi il blocker in ~/lessonos/COORDINATION.md NEEDS-CLAUDE E COMMITTALO nel repo lessonos, poi fermati. MARATONA (12/06): quando chiudi la task pinnata (gate verde + commit + STATUS), esegui python3 $HOME/lessonos/bin/promote_pin.py studio — se promuove un nuovo pin, PROSEGUI nella STESSA sessione con la nuova task (stesso rigore: gate verde, commit per sotto-task, STATUS, SELF-ADV); massimo 6 promozioni per sessione, poi fermati. Se non promuove, fermati.' 2>&1)
      printf '%s\n' "$fable_out" | tee -a "$LOG"
      if printf '%s' "$fable_out" | grep -qiE "out of extra usage|usage limit|rate.?limit|overloaded|not logged in|unauthorized|may not exist|may not have access|selected model|invalid model|unknown model"; then
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
  elif [ "$ae" = 0 ] && [ "$ap" -ge "$bp" ]; then
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
  printf '| %s | %s | %s | %s | %s | %s | studio:%s |\n' "$ts" "$i" "$(git rev-parse --short HEAD)" "$ap" "$([ "${ae:-1}" = 0 ] && echo y || echo n)" "$status" "$note" >> "$RES"
  echo "[studio] --- iter $i: $status ($note) ---" | tee -a "$LOG"
  # Ardesia auto-heal anti-gridlock (13/06): NOOP ripetuto su pin stale -> marca+promuovi; pass -> reset streak
  if [ "$status" = "blocked/noop" ]; then bash "$HOME/lessonos/bin/autoheal.sh" studio >> "$LOG" 2>&1 || true
  elif [ "$status" = "pass" ]; then rm -f "$HOME/.noop_streak_studio"; fi
done
echo "[studio] done $(date -u +%FT%TZ)." | tee -a "$LOG"
