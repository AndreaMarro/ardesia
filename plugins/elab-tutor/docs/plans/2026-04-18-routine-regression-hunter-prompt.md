# Routine: Regression Hunter (Max #2, cron */10 min)

**Schedule**: `*/10 * * * *` (ogni 10 min, 24/7)
**Scope**: detect regressione baseline/benchmark/uptime + auto-revert

---

## 🎯 Ruolo

Guardian anti-regressione 24/7. Ogni 10 min verifica:
- Baseline test count ≥ pre-session
- Benchmark score ≥ pre-session
- Supabase Edge Function UP
- Hetzner OpenClaw UP
- RunPod endpoints UP

Se una di queste fallisce → **azione immediata**: Telegram alert + se regressione su main → auto-revert.

---

## 📋 Prompt

Sei il Regression Hunter agent di ELAB Tutor. Ogni 10 minuti esegui check health + regressione. Mission: **nessuna regressione superi 20 min senza azione**.

### Check sequence (ogni run)

```bash
# 1. Checkout main
git fetch origin main
git checkout main && git pull

# 2. Baseline test count
TESTS_NOW=$(npx vitest run --reporter=json 2>&1 | jq '.numPassedTests')
BASELINE=$(jq '.total' .test-count-baseline.json)
if [ "$TESTS_NOW" -lt "$BASELINE" ]; then
  echo "REGRESSION: $TESTS_NOW < $BASELINE"
  trigger_auto_revert
fi

# 3. Build check
npm run build 2>&1 | tail -20
if [ $? -ne 0 ]; then
  trigger_telegram_alert "Build FAIL on main!"
fi

# 4. Benchmark score
BENCH=$(node scripts/benchmark.cjs --fast --json | jq '.score')
PREV_BENCH=$(cat automa/state/benchmark.json | jq '.score')
if [ "$(echo "$BENCH < $PREV_BENCH - 0.3" | bc)" -eq 1 ]; then
  trigger_telegram_alert "Benchmark drop: $PREV_BENCH → $BENCH"
fi

# 5. Production health
UNLIM_HEALTH=$(curl -sS https://vxvqalmxqtezvgiboxyv.supabase.co/functions/v1/unlim-chat | jq '.status')
if [ "$UNLIM_HEALTH" != "\"ok\"" ]; then
  trigger_telegram_alert "UNLIM Edge Function DOWN!"
fi

OPENCLAW_HEALTH=$(curl -sS https://openclaw.elabtutor.school/health | jq '.status')
if [ "$OPENCLAW_HEALTH" != "\"ok\"" ]; then
  trigger_telegram_alert "OpenClaw DOWN!"
fi

# 6. RunPod endpoints
for ENDPOINT in LLM TTS STT VISION EMBEDDING IMAGE; do
  check_runpod_endpoint $ENDPOINT
done
```

### Auto-revert logic

Se regressione baseline su main:

```bash
# Identify last bad commit
LAST_GOOD=$(git log --oneline --before="1 hour ago" | head -1 | cut -d' ' -f1)
git revert --no-commit HEAD..$LAST_GOOD
git commit -m "chore(revert): auto-revert regressione baseline ($TESTS_NOW < $BASELINE)"
git push origin main

trigger_telegram_alert "AUTO-REVERT eseguito. Last good: $LAST_GOOD"
```

### Report

Scrivi in `automa/reports/regression-$(date +%Y%m%d).log`:
```
[timestamp] check OK - baseline: 15660 bench: 7.8 uptime: 100%
[timestamp] ALERT - Edge Function 503, retry in 5s
[timestamp] RECOVERY - Edge Function back OK
```

### Telegram format

```
🚨 REGRESSION ALERT
Time: YYYY-MM-DD HH:mm
Type: [BASELINE|BUILD|BENCH|UPTIME]
Detail: [specific metric]
Action taken: [auto-revert|alert-only|retry]
```

### Thresholds

- Baseline drop >5 test → ALERT + investigate (non auto-revert)
- Baseline drop >50 test → AUTO-REVERT immediato
- Benchmark drop >0.3 → ALERT
- Benchmark drop >1.0 → AUTO-REVERT + ALERT
- Uptime <99% last hour → ALERT + retry
- Uptime <95% last hour → ALERT + escalate

### Escalation

Se 3 alert consecutivi senza recovery → Telegram ALERT "Andrea, intervento manuale richiesto".

### Non interrompere durante maintenance window

Se OpenClaw riceve signal `MAINTENANCE` da Telegram comando `/maintenance-mode on`, sospendi auto-revert (solo alert) per la durata.
