#!/bin/bash
# MAESTRO — FABLE-CATCHUP: burst di corteccia fable a ogni riapertura quota.
# Chiamato SINCRONO dal tick (sotto lock: skill-coach SCRIVE nel repo) quando
# ~/.fable_catchup_pending esiste e quota.sh check passa.
# Catena: (1) SKILL-COACH — fable migliora UNA skill di Hermes dagli errori veri
#         (2) RETRO-REVIEW — fable rivede i commit accumulati nella finestra quota-out
#         (3) STRATEGOS — audit ultracode proattivo (async, read-only)
# Ordine Andrea 11/06: "autosviluppo e automiglioramento delle skill degli hermes tramite fable".
export PATH="/opt/homebrew/bin:$HOME/.local/bin:$PATH"
eval "$(grep -E '^[[:space:]]*export[[:space:]]+CLAUDE_CODE_OAUTH_TOKEN=' "$HOME/.zshenv" 2>/dev/null | tail -1)"
# MULTI-ACCOUNT: se A1 e' in finestra quota-out ma A2 e' libero, il burst usa A2.
CACC=$(bash "$HOME/lessonos/bin/acct.sh" pick 2>/dev/null || true)
if [ -n "$CACC" ] && [ "$CACC" != "A1" ]; then
  export CLAUDE_CODE_OAUTH_TOKEN="$(bash "$HOME/lessonos/bin/acct.sh" token "$CACC")"
fi
echo "[catchup] account: ${CACC:-A1}"
REPO="$HOME/lessonos"
LOGDIR="$HOME/maestro-logs/catchup"; mkdir -p "$LOGDIR"
TS=$(date -u +%Y%m%d-%H%M)
LOG="$LOGDIR/$TS-catchup.log"
cd "$REPO" || exit 0
echo "[catchup] === $TS ===" | tee -a "$LOG"

# --- (1) SKILL-COACH: fable single, bounded, scrive in skills/ e committa ---
timeout 900 env -u ANTHROPIC_API_KEY claude -p --dangerously-skip-permissions \
  --model claude-opus-4-8 "Sei il COACH delle skill di Hermes (builder DeepSeek) nel repo corrente.
Leggi: skills/*.md (le skill attuali, auto-iniettate in ogni review), gli ultimi 3 retro in STATUS.md,
gli ultimi 2 report in ~/maestro-logs/adversarial/*.md, ~/maestro-logs/evolution.jsonl (ledger).
Identifica L'ERRORE RICORRENTE più costoso NON ancora coperto bene da una skill (classi viste oggi:
lavoro-senza-commit, test-che-non-possono-fallire, severità-mal-calibrata, liste-duplicate).
Migliora UNA skill esistente O creane UNA nuova in skills/ (max 60 righe, operativa, con gli esempi
VERI presi dagli errori — file:line e commit). Poi: git add skills/ && git commit -m '[skills] coach: <cosa>'.
Se le skill coprono già tutto: NON committare, stampa solo NOOP-COACH e il perché.
Vincoli: tocchi SOLO skills/, mai eval/gate.sh, mai test, mai codice." >> "$LOG" 2>&1
echo "[catchup] skill-coach rc=$?" | tee -a "$LOG"

# --- (2) RETRO-REVIEW: i commit della finestra quota-out, rivisti da fable (report-only) ---
MARK="$HOME/maestro-logs/.last_fable_review"
LAST=$(cat "$MARK" 2>/dev/null || git rev-parse 'HEAD~10' 2>/dev/null || echo '')
HEADSHA=$(git rev-parse HEAD)
if [ -n "$LAST" ] && [ "$LAST" != "$HEADSHA" ]; then
  RR="$LOGDIR/$TS-retro-review.md"
  { echo "# RETRO-REVIEW $LAST..$HEADSHA ($TS)"; git log --oneline "$LAST..$HEADSHA"; } > "$RR"
  git diff "$LAST..$HEADSHA" -- . ':(exclude)COORDINATION.md' ':(exclude)STATUS.md' ':(exclude)DIGEST-latest.md' \
    | head -c 180000 > "$LOGDIR/$TS-range.diff"
  timeout 900 env -u ANTHROPIC_API_KEY claude -p --dangerously-skip-permissions \
    --model claude-opus-4-8 "Review avversaria del diff in $LOGDIR/$TS-range.diff (commit della finestra
quota-out, costruiti SENZA review fable — è il loro recupero). Leggi anche skills/error-lessons.md e
skills/invariant-thinking.md. Cerca SOLO problemi VERI: bug con input realistici, invarianti violate
(groundedness, GDPR Mode A, raw-immutabile), test tautologici. Scrivi il report in $RR (append).
Se trovi un CRITICO vero: aggiungilo anche a COORDINATION.md sezione NEEDS-CLAUDE con prefisso
[RETRO-REVIEW] e committa SOLO quel file. Verdetto-first, max 400 parole, niente stile." >> "$LOG" 2>&1
  echo "[catchup] retro-review rc=$? ($RR)" | tee -a "$LOG"
fi
echo "$HEADSHA" > "$MARK"

# --- (2-bis) MEMORIA FRESCA: import incrementale dei transcript builder in
# agentmemory (idempotente; il corpus episodico resta al passo col loop) ---
timeout 120 agentmemory import-jsonl "$HOME/.claude/projects/-Users-progettibelli-lessonos" --max-files=400 >> "$LOG" 2>&1 || true
timeout 120 agentmemory import-jsonl "$HOME/.claude/projects/-Users-progettibelli-maestro-studio" --max-files=400 >> "$LOG" 2>&1 || true
echo "[catchup] agentmemory import incrementale ok" | tee -a "$LOG"

# --- (3) STRATEGOS: audit proattivo ultracode (read-only, async) ---
nohup "$HOME/maestro-tools/strategos.sh" "8 hours ago" >> "$HOME/maestro-logs/strategos/launchd.log" 2>&1 &
echo "[catchup] strategos lanciato async" | tee -a "$LOG"
bash "$HOME/maestro-tools/notify-telegram.sh" "🧠 fable-catchup eseguito: skill-coach + retro-review della finestra quota-out + strategos. Log: $LOG" 2>/dev/null || true
