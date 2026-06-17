#!/bin/bash
# LessonOS — DIGEST ORARIO (zero-LLM, costo ~0). Mostra ad Andrea il lavoro di Hermes via Telegram.
# 'hermes send' usa il bot-token Telegram (nessun LLM, nessun agent loop).
export PATH="$HOME/.local/bin:$HOME/node-local/bin:/opt/homebrew/bin:$PATH"
cd "$HOME/lessonos" || exit 0
D="$HOME/lessonos/DIGEST-latest.md"
g=$(bash eval/gate.sh 2>/dev/null | tail -1)
today=$(date -u +%F)
cost=$(grep "\"ts\":\"$today" log.jsonl 2>/dev/null | grep -oE '"cost_usd":[0-9.]+' | grep -oE '[0-9.]+' | awk '{s+=$1} END{printf "%.3f", (s?s:0)}')
iters=$(sed -n 2p .iters_today 2>/dev/null); iters=${iters:-0}
{
  echo "🤖 LessonOS — $(date '+%a %d/%m %H:%M')"
  echo "gate: ${g:-?}  |  auto/main: $(git rev-parse --short auto/main 2>/dev/null)  main(rev): $(git rev-parse --short main 2>/dev/null)"
  echo "costo stimato oggi: \$${cost}  |  iter oggi: ${iters}/${LESSONOS_DAILY_CAP:-12}"
  echo "opus oggi: build=$(sed -n 2p .builds_today 2>/dev/null || echo 0) architect=$(cat $HOME/maestro-logs/architect/.cap_$today 2>/dev/null || echo 0) aggiudica=$(cat $HOME/maestro-logs/hermes2-adjudicate/.cap_$today 2>/dev/null || echo 0)  (cap ${LESSONOS_DAILY_CAP:-96}; hard-stop=quota.sh)"
  [ -f STOP ] && echo "⏸ STOP attivo (loop in pausa)"
  echo ""
  echo "— ultime 3 iterazioni —"
  grep '^|' RESEARCH.md 2>/dev/null | tail -3 | sed 's/|/ /g'
  echo ""
  echo "— ultimo STATUS —"
  tail -4 STATUS.md 2>/dev/null
} > "$D"
# invio non-bloccante (se Telegram non configurato, fallisce in silenzio: il file resta per il supervisore)
hermes send -t telegram -f "$D" 2>/dev/null || hermes send -f "$D" 2>/dev/null || true
echo "[digest] scritto $D $(date -u +%FT%TZ)"
