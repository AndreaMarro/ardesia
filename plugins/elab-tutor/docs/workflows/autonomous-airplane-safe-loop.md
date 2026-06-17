# Autonomous Loop — Airplane-Safe Workflow

**Goal:** loop Sprint 6+ procede autonomo **mentre Andrea è in aereo / fuori** con massimi controlli di ordine e coerenza, zero rischio main/prod.

---

## 0. Principi immutabili (non negoziabili)

1. **NEVER push to main** — solo feature branch + PR
2. **NEVER deploy production** — nessun `vercel --prod`, nessun `supabase deploy`
3. **NEVER merge PR** — human-only decision
4. **NEVER skip pre-push hook** — test delta verify obbligatorio
5. **NEVER modify vincoli immutabili** (CLAUDE.md regole 1-17)
6. **PZ v3 enforcement** su ogni testo generato per UNLIM
7. **GDPR runtime EU-only** — Together AI gate inviolato
8. **Commit atomici** con test count nel message

Se ANY condizione violata → loop HARD-STOP + notifica Andrea.

---

## 1. Opzioni runtime (pick 1 o combinate)

### Opzione A — Mac Mini local loop (esistente, raccomandato)

Pro:
- Già configurato (`scripts/cli-autonomous/loop-forever.sh`)
- Claude Code CLI con account Andrea
- `caffeinate -i` previene sleep
- Mac Mini always-on strambino
- Zero costo extra

Contro:
- Richiede Mac Mini acceso (già è)
- Se corrente salta a Strambino → loop muore
- Serve monitoraggio remoto (Telegram bot esistente?)

Setup:
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
caffeinate -i bash scripts/cli-autonomous/loop-forever.sh > /tmp/elab-loop.log 2>&1 &
echo $! > /tmp/elab-loop.pid
```

Monitor:
```bash
tail -f /tmp/elab-loop.log
ps -p $(cat /tmp/elab-loop.pid) && echo "alive" || echo "dead"
```

### Opzione B — Claude Code GitHub Action cron

Pro:
- GitHub-native, no Mac Mini dipendente
- Cron schedule (ogni 6h)
- Log in Actions UI
- Telegram notifica via webhook

Contro:
- Costo Claude API per run (Claude Code GitHub App)
- Serve GitHub App installed
- Ogni run parte fresh (no memoria tra run senza claude-mem)
- Timeout 6h max per job

Setup `.github/workflows/autonomous-sprint-6.yml`:
```yaml
name: Sprint 6 Autonomous Loop
on:
  schedule:
    - cron: '0 */6 * * *'  # ogni 6 ore
  workflow_dispatch:

jobs:
  loop:
    runs-on: ubuntu-latest
    timeout-minutes: 120
    concurrency:
      group: sprint-6-loop
      cancel-in-progress: false
    steps:
      - uses: actions/checkout@v4
        with:
          ref: feature/pdr-sett5-openclaw-onnipotenza-morfica-v4
          fetch-depth: 0
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Install
        run: npm ci
      - name: Run Claude Code next task
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          npx @anthropic-ai/claude-code \
            --agent planner \
            --task "read automa/tasks/pending/, execute next task per Sprint 6 plan" \
            --max-turns 50 \
            --no-push-main
      - name: Safety — verify no main push
        run: |
          git log origin/main..HEAD --oneline
          git remote show origin | grep main
      - name: Test baseline verify
        run: |
          npx vitest run --reporter=dot 2>&1 | tee /tmp/test-out.log
          baseline=$(cat automa/baseline-tests.txt)
          current=$(grep -oE "[0-9]+ passed" /tmp/test-out.log | grep -oE "[0-9]+" | head -1)
          [ "$current" -ge "$baseline" ] || exit 1
      - name: Push branch
        run: git push origin HEAD
      - name: Notify Telegram on fail
        if: failure()
        uses: appleboy/telegram-action@master
        with:
          to: ${{ secrets.TELEGRAM_CHAT_ID }}
          token: ${{ secrets.TELEGRAM_TOKEN }}
          message: "Sprint 6 loop FAILED at $(date). Check Actions: ${{ github.run_id }}"
```

### Opzione C — Claude Code Web (claude.ai)

Pro:
- Browser-based, Andrea può monitorare da telefono
- Sessione persistente

Contro:
- Richiede browser aperto (non vero "autonomo")
- Sessione scade
- Non scala

Uso: **solo per monitoring manuale**, non autonomo aereo.

### Raccomandazione combinata

**Primary: Opzione A (Mac Mini local)**
**Backup: Opzione B (GitHub Actions cron ogni 6h)** — si attiva solo se Mac Mini loop heartbeat missing
**Monitor: Opzione C (Claude Web) on-demand per Andrea da telefono**

---

## 2. Controlli di ORDINE (guardrails pre-commit)

### Hook esistenti (verificare attivi)

```
.husky/pre-commit         → vitest baseline delta
.husky/pre-push           → vitest + baseline verify
.git/hooks/post-commit    → claude-mem observation (gia' presente)
```

### Hook da aggiungere (Sprint 6 Day 36.5)

```
.husky/commit-msg         → format check "tipo(area): descrizione [TEST N]"
.husky/pre-push           → rebase check vs origin/main (blocca if diverge >10 commit)
.husky/pre-push           → GDPR lint (niente secret in diff)
```

### Pre-commit hook completo (proposta)

`scripts/git-hooks/pre-commit-full.sh`:
```bash
#!/bin/bash
set -e

# 1. Baseline test delta
baseline=$(cat automa/baseline-tests.txt)
current=$(npx vitest run --reporter=dot 2>&1 | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+" | head -1)
if [ "$current" -lt "$baseline" ]; then
  if ! git log -1 --format=%B | grep -q "\[TEST DELETION OK\]"; then
    echo "ABORT: test count $current < baseline $baseline"
    exit 1
  fi
fi

# 2. No secrets in diff
if git diff --cached | grep -iE "(sk-ant-|ANTHROPIC_API_KEY|SUPABASE_SERVICE_ROLE|TOGETHER_API_KEY)" | grep -v "placeholder\|example"; then
  echo "ABORT: potential secret in diff"
  exit 1
fi

# 3. No direct main push attempt
branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$branch" = "main" ]; then
  echo "ABORT: cannot commit directly to main"
  exit 1
fi

# 4. File ownership check (agent team)
if [ -f "automa/team-charter.md" ]; then
  # TBD Sprint 6 Day 41 — verify commit respects owned_files
  :
fi

# 5. PZ v3 lint on UNLIM strings (if touched)
if git diff --cached --name-only | grep -q "src/services/.*unlim\|supabase/functions/unlim"; then
  # TBD Sprint 6 Day 40 — run PZ v3 validator on new speakTTS strings
  :
fi

echo "PRE-COMMIT OK: $current tests, baseline $baseline"
exit 0
```

### Coerenza

`scripts/coherence-check.sh` (Sprint 6 Day 42):
```bash
# Run nightly via cron on Mac Mini:
# - Verify CLAUDE.md baseline ref matches automa/baseline-tests.txt
# - Verify docs/unlim-wiki/index.md lists all files in concepts/ experiments/ lessons/
# - Verify automa/tasks/done/ eval file exists for each done task
# - Verify openclaw_tool_memory cross-reference
```

---

## 3. Safeguard per aereo Andrea

### Prima di partire — checklist 5 min

```bash
# 1. Verifica loop alive
ps aux | grep loop-forever.sh | grep -v grep

# 2. Verifica ultimo commit non stale (<4h)
git log -1 --format="%ar %s"

# 3. Verifica baseline corrente
cat automa/baseline-tests.txt

# 4. Verifica branch corrente corrisponde a feature
git branch --show-current

# 5. Verifica disk space
df -h .
```

### Durante volo (Andrea offline)

Loop procede autonomo. Solo azioni:
- generator-test scrive test
- generator-app implementa
- evaluator verdict
- commit + push (NEVER main)

**Cosa il loop non può fare:**
- Merge PR
- Deploy prod
- Rispondere a Andrea
- Prendere decisione strategica nuova

### Al ritorno (2-8h dopo)

```bash
# Review ultimo N commit
git log --oneline origin/main..HEAD

# Review quali task done
ls automa/tasks/done/

# Review evaluator verdicts
ls automa/evals/

# Pick up dal punto giusto
```

---

## 4. Budget sicurezza

- **API cost cap**: Anthropic API max $10/giorno durante loop (monitorato via telegram)
- **Test timeout**: vitest max 5 min total (fail veloce)
- **Commit frequency**: max 12 commit/ora (rate-limit)
- **Disk cap**: `/tmp` max 500 MB, rotate se supera

---

## 5. Emergency kill-switch

```bash
# Hard stop loop
kill $(cat /tmp/elab-loop.pid)

# Hard stop GitHub Actions (dalla UI)
# oppure:
gh workflow disable "Sprint 6 Autonomous Loop"

# Revert ultimo N commit (se pazzato)
git reset --hard HEAD~N && git push --force-with-lease

# Disable loop permanente
chmod -x scripts/cli-autonomous/loop-forever.sh
```

---

## 6. Principio rispetto visione

| Visione Andrea                  | Come il loop rispetta                                       |
|---------------------------------|-------------------------------------------------------------|
| Architettura prima              | Sprint 6 è architettura (dispatcher + PZ v3), non sales     |
| Onnipotenza                     | Day 37 espande handler da 31 → 42 live + 11 todo implementati |
| Onniscenza                      | Day 41 tool-memory vector retrieval + wiki sync             |
| Morficità controllata           | L1 + L2 only in prod, L3 DEV-FLAG                           |
| Economico solo-dev              | Zero deploy, zero costi nuovi fino a loop fine             |
| GDPR                            | Together AI gate testato 20 volte, student BLOCK          |
| PZ v3                           | Validator middleware in dispatcher Day 39                   |

---

## 7. Onestà finale

- Loop autonomo è **amplificatore** di discipline umana, non sostituto
- Se Andrea non definisce bene il Task, generator produce schifezze rapide
- Se evaluator è troppo lassista, tecnica debt esplode
- Se pre-commit hook salta, regression silenti
- Ogni weekend (airplane o meno): Andrea review 10 min ultimo giorno loop output

**Il loop vale solo quanto la disciplina dei guardrails + qualità dei Task.**

Non lasciarlo auto-pilota 30 giorni. Massimo 5 giorni consecutivi, poi human checkpoint.
