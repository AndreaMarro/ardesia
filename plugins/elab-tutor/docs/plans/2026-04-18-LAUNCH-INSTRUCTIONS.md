# 🚀 LAUNCH INSTRUCTIONS v3 — Claude Code Web Routines (winner)

**Data**: 18/04/2026
**Per**: Andrea Marro
**Stima tempo tuo attivo**: ~20 min, poi Mac chiuso
**Costo extra**: €0 (incluso Max ×2)

---

## 🎯 Perché Claude Code Web Routines vince

Verifica live sul tuo browser: **Routines** è accessibile nella sidebar di claude.ai/code. Significa:
- ✅ Gira in cloud Anthropic (Mac chiuso OK)
- ✅ Incluso Max (€0 extra vs GitHub Actions €60-150/mese API key)
- ✅ Stesso Opus 4.7 del CLI
- ✅ 15 routines/giorno × 2 Max = **30 fire/giorno totali**
- ✅ GitHub integration nativa

GitHub Actions `routines-orchestrator.yml` resta **committato** come **backup** se servirà più throughput o un task cade.

---

## ⏱ Step 1 — Apri Claude Code Web (1 min)

1. Vai su **https://claude.ai/code**
2. Login Max #1 se richiesto
3. Sidebar → click **Routines** (icona ⚡)

---

## ⏱ Step 2 — Crea 6 Routines su Max #1 (10 min)

Per ognuna click **New Routine** (o `+`) e compila i campi. Usa schedule e prompt sotto.

**Nota**: molti UI Routines permettono di **linkare file dal repo** come prompt invece di copy-paste. Se vedi questa opzione, linka direttamente il file md.

### Routine 1: `pdr1-unlim-core`

```
Name: pdr1-unlim-core
Schedule: Every 4 hours (at :00)
Repository: AndreaMarro/elab-tutor
Branch: feature/unlim-core-v1
Prompt file: docs/plans/2026-04-18-pdr1-unlim-core-design.md
Allowed tools: Bash, Edit, Read, Write, Glob, Grep, WebSearch
Max turns: 30
```

### Routine 2: `pdr2-openclaw-infra`

```
Name: pdr2-openclaw-infra
Schedule: Every 6 hours (at :30)
Repository: AndreaMarro/elab-tutor
Branch: feature/openclaw-infra-v1
Prompt file: docs/plans/2026-04-18-pdr2-openclaw-infra-design.md
Allowed tools: Bash, Edit, Read, Write, Glob, Grep, WebSearch
Max turns: 30
```

### Routine 3: `pdr3-vps-runpod-deploy` (CRITICAL path)

```
Name: pdr3-vps-runpod-deploy
Schedule: Every 12 hours (at 06:15 and 18:15)
Repository: AndreaMarro/elab-tutor
Branch: feature/vps-runpod-deploy-v1
Prompt file: docs/plans/2026-04-18-pdr3-vps-runpod-deploy-design.md
Allowed tools: Bash, Edit, Read, Write, Glob, Grep, WebSearch
Max turns: 30
```

### Routine 4: `pdr4-lesson-reader`

```
Name: pdr4-lesson-reader
Schedule: Every 12 hours (at 08:45 and 20:45)
Repository: AndreaMarro/elab-tutor
Branch: feature/lesson-reader-v1
Prompt file: docs/plans/2026-04-18-pdr4-lesson-reader-design.md
Allowed tools: Bash, Edit, Read, Write, Glob, Grep, WebSearch
Max turns: 30
```

### Routine 5: `regression-hunter`

```
Name: regression-hunter
Schedule: Every 6 hours (at :07)
Repository: AndreaMarro/elab-tutor
Branch: main (read-only, only auto-revert se regressione)
Prompt file: docs/plans/2026-04-18-routine-regression-hunter-prompt.md
Allowed tools: Bash, Read, Grep
Max turns: 10
```

### Routine 6: `pdr-stress-chaos` (scheduled venerdì)

```
Name: pdr-stress-chaos
Schedule: Fridays at 18:00
Repository: AndreaMarro/elab-tutor
Branch: test/stress-chaos-62h
Prompt file: docs/plans/2026-04-18-pdr-stress-chaos-design.md
Allowed tools: Bash, Edit, Read, Write, Glob, Grep, WebSearch, WebFetch
Max turns: 60
```

**Total Max #1**: 14 fire/giorno (sotto il cap 15) ✅

---

## ⏱ Step 3 — Switch Max #2 e crea 5 altre Routines (7 min)

**Logout** (click avatar → logout), poi **login con Max #2**.

### Routine 7: `pdr-test-multiplier` (+3604 test)

```
Name: pdr-test-multiplier
Schedule: Every 4 hours (at :00)
Repository: AndreaMarro/elab-tutor
Branch: feature/test-multiplier-v1
Prompt file: docs/plans/2026-04-18-pdr-test-multiplier-design.md
Max turns: 30
```

### Routine 8: `pdr-commercial`

```
Name: pdr-commercial
Schedule: Every 12 hours (at 10:00 and 22:00)
Repository: AndreaMarro/elab-tutor
Branch: feature/commercial-v1
Prompt file: docs/plans/2026-04-18-pdr-commercial-pacchetti-design.md
Max turns: 30
```

### Routine 9: `auditor` (review PR quando aperte)

```
Name: auditor
Schedule: Every 3 hours (at :15)
Repository: AndreaMarro/elab-tutor
Branch: main (read-only, aggiunge audit report alle PR aperte)
Prompt file: docs/plans/2026-04-18-routine-auditor-prompt.md
Allowed tools: Bash, Read, Edit, Grep
Max turns: 20
```

### Routine 10: `cost-tracker`

```
Name: cost-tracker
Schedule: Every 24 hours (at 23:00)
Repository: AndreaMarro/elab-tutor
Branch: main
Prompt file: docs/plans/2026-04-18-routine-cost-tracker-prompt.md
Max turns: 10
```

### Routine 11: `pdr-feedback` (FASE 15)

```
Name: pdr-feedback
Schedule: Every 24 hours (at 11:00)
Repository: AndreaMarro/elab-tutor
Branch: feature/feedback-research-v1
Prompt file: docs/plans/2026-04-18-pdr-feedback-research-design.md
Max turns: 30
```

**Total Max #2**: 13 fire/giorno (sotto cap 15) ✅

---

## ⏱ Step 4 — Configura GitHub connector (2 min)

Su Claude Code Web:
1. Sidebar → **Customize** o **Connectors** o **Settings**
2. Trova sezione **GitHub** 
3. Click **Connect** (se non già connesso)
4. Autorizza accesso a `AndreaMarro/elab-tutor`
5. Verifica: nella creazione routine, dropdown **Repository** mostra elab-tutor

Se GitHub non è connettibile via Routines UI, le routines useranno la Claude session per fare `git clone/push` via Bash tool (funzionerà comunque ma più lento).

---

## ⏱ Step 5 — Notifica Telegram (5 min opzionale)

Claude Code Routines potrebbe avere **Channels Telegram nativo**. Verifica:
- Sidebar → **Customize** → **Channels** o **Integrations**
- Se vedi **Telegram** → connect (BotFather token + chat_id)
- Se non vedi → **fallback webhook**:

Crea `.github/workflows/routine-notify.yml` (workflow che triggera su push a branch feature/* e manda Telegram):

```yaml
name: Telegram Notify on Routine Push
on:
  push:
    branches:
      - 'feature/**'
      - 'test/**'
jobs:
  notify:
    runs-on: ubuntu-latest
    env:
      TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
      CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
      BRANCH: ${{ github.ref_name }}
      SHA: ${{ github.sha }}
    steps:
      - name: Send
        run: |
          curl -sS -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
            -d "chat_id=${CHAT_ID}" \
            -d "text=Routine push on ${BRANCH}: ${SHA}"
```

(devi settare i 2 secrets come già nel piano LAUNCH v2)

---

## ⏱ Step 6 — Test manuale prima routine (3 min)

Nel menu Routines, trova `pdr1-unlim-core` e click **Run now** (icona play).

Attesa: vedi un session link che apri per monitorare live. Dopo pochi minuti dovresti vedere:
- Routine session running
- Commits incrementali su `feature/unlim-core-v1`
- Completion → commit finale o PR draft

Verifica su GitHub:
- https://github.com/AndreaMarro/elab-tutor/branches → `feature/unlim-core-v1` esiste con nuovi commit
- https://github.com/AndreaMarro/elab-tutor/pulls → PR se sub-task completato

Se vedi movimento → **sistema operativo**. Chiudi Mac.

---

## 🆘 Se qualcosa non funziona

| Problema | Soluzione |
|----------|-----------|
| "Routines" non visibile sidebar | Beta rollout progressivo, richiedi accesso a support@anthropic.com |
| Max cap 15/giorno superato | Riduce frequenza routines (already calibrato sotto) |
| GitHub push fails | Verifica GitHub connector permissions |
| Routine fallisce su PDR troppo lungo | Spezza in sub-PDR con solo 1 task per routine |
| Telegram non arriva | Fallback webhook GitHub Actions (secret già settati) |

---

## 💰 Budget reale

**Claude Code Web Routines**: €0 extra (incluso Max ×2 €400/mese)

**Eventuali costi extra**:
- Supabase Pro: €25 (già attivo)
- Vercel Pro: €20 (già attivo)
- Hostinger VPS: €15 (già attivo)
- Totale ops invariato: **€60/mese** già attivo

**Se migri a Hetzner CX52 OpenClaw** (quando PDR2 completato): +€32/mese.

**Se usi RunPod EU per UNLIM inference** (post PDR3 deploy): +€30-100/mese variabile.

---

## 🎯 KPI weekend atteso

Mac chiuso da ora a lunedì mattina (~48h):
- ✅ 20-40 fire totali routines (14/giorno × 2 Max × 2 giorni = ~56)
- ✅ 2-5 PR aperte per review (PDR1, PDR2, PDR4, Test Multiplier)
- ✅ Baseline test crescente verso 15660
- ✅ Zero regressioni (regression-hunter every 6h)
- ✅ Telegram notifiche ricevute

Al tuo rientro: apri GitHub Mobile, review PR, merge ok.

---

## 📝 Backup attivi

Tutti già committati, disponibili se Claude Code Web Routines ha problemi:

1. **GitHub Actions** `routines-orchestrator.yml` — con ANTHROPIC_API_KEY (costa ma illimitato)
2. **GitHub Actions** `governance-gate.yml` — CI bloccante per PR (sempre attivo)
3. **.githooks/pre-commit** e **pre-push** — regression guard locale (sempre attivo)

---

**Pronto? Apri claude.ai/code → Routines → inizia dal Step 2.**

Se qualcosa è diverso nell'UI Web Routines (i nomi dei campi possono variare), **fammi uno screenshot** e adatto le istruzioni in tempo reale.
