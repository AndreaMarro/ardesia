# SPRINT 2 ADDENDUM — Aggiornamenti post Sprint 1 (21/04/2026)

Applicabile a tutti i giorni Sprint 2: Day 08-14 (lun 28/04 → dom 04/05/2026).

Questo documento integra i PDR giornalieri esistenti con decisioni + lessons learned Sprint 1.

---

## 1. STRATEGIA STACK (decisa 21/04)

**Together AI START, scale self-host EU POST-REVENUE**.

Stack Sprint 2-5 invariato:
- **LLM**: Together AI API (Llama 3.3 70B Turbo default, Qwen 72B fallback)
- **Embeddings**: Together AI
- **Vision**: Gemini Vision API (fallback esistente)
- **TTS Voice**: Kokoro localhost + Edge TTS VPS `72.60.129.50:8880`
- **STT Voice**: Cloudflare Whisper (gratis)
- **Orchestrator**: Supabase Edge Function + Vercel AI SDK (multi-step agentic built-in)
- **RAG**: Supabase pgvector (549 chunk → target 1000+)

**ZERO infra nuova Sprint 2**:
- ❌ Hetzner Cloud VPS (Fase 2 post-revenue)
- ❌ RunPod GPU serverless (Fase 2 post-revenue)
- ❌ OpenClaw orchestrator self-hosted (Fase 2 post-revenue)

Motivazione: per beta 5 classi pilot Andrea-solo, Together AI DPA GDPR sufficient. Migration EU self-host = Fase 2 quando revenue ≥€500/mese sostenuto (PDR_GENERALE sez 173).

---

## 2. LESSONS LEARNED Sprint 1 (MUST APPLY Sprint 2)

### Anti-pattern PROCESS da correggere

1. **Velocity tracking backfill** → Sprint 2 LIVE update `automa/state/velocity-tracking.json` ogni day end, MAI catch-up sabato
2. **MCP calls deficit** (1-2 vs target 8+/day) → Sprint 2 log esplicito ogni chiamata in audit file
3. **Dispatch cap violato** Day 01 (7 vs 5 max) → Sprint 2 strict <=5 parallel agents
4. **Sprint planning vago Day 01** → Sprint 2 allocare 2h Day 08 mattina per Sprint Contract formal

### Anti-pattern TECHNICAL da correggere

5. **Git hygiene "Test N" marker missing** → PR >100 LoC require body con "Test plan" checklist
6. **Vision E2E CoV 1x** → Sprint 2 CoV 3x live su PROD, non 1x single
7. **Build not re-run Day 06** → `npm run build` explicit ogni day end, non proxy vitest
8. **CHANGELOG missing** → Governance Rule 5 fail Sprint 1. Sprint 2 CHANGELOG update ogni commit src/supabase

### Anti-pattern CI/DEPLOY da correggere

9. **Vercel OOM** deploy fail → `--prebuilt --archive=tgz` ALWAYS
10. **SUPABASE_ANON_KEY env missing** → aggiunto 21/04 zshrc (JWT legacy anon)
11. **zsh `read -p`** = ERROR → usa `read "?Prompt: "` zsh-safe
12. **Comment `#` paste multiline** → shell esegue. Paste senza commenti
13. **CI Routines Orchestrator spam** fail email → `gh workflow disable`

### Repo hygiene DEBT da Sprint 1

14. **152 dirty files** mai puliti → Sprint 2 Day 08-09 cleanup dedicato
15. **Branches `auto/*` 50+** accumulo → delete stale
16. **Docs 100+ file sparsi** → Sprint 2 archive `docs/archive/pre-sprint-2/`
17. **PDF volumi 60+ MB** in repo → Sprint 2 move Supabase storage

### Gap tecnici residui Sprint 1 (fix Sprint 2 week)

18. **Playwright stress-test path** → `npx playwright test --config tests/e2e/playwright.config.js` explicit
19. **npm audit jq parse** → fix stress-test.sh
20. **Benchmark post-deploy** → `--write` persist ogni day end
21. **ADR-003 Proposed → Accepted** (SUPABASE_ANON_KEY ora disponibile)
22. **BLOCKER-007** render-warmup.yml first cron run verify live
23. **BLOCKER-008** grep canonical Supabase ref invariant on main

---

## 3. AUTO-VERIFY PRODUCTION HEALTH (mandatorio ogni day end)

Zero intervento Andrea durante settimana. CLI esegue automatic:

### 7 Check daily

| # | Check | Target | Action se fail |
|---|-------|--------|----------------|
| **A** | Curl prod homepage | `https://www.elabtutor.school/` HTTP 200 <5s | Rollback immediate |
| **B** | Edge Function 5/5 OPTIONS | tutti HTTP 204 | STOP + HARD-BLOCKER.md |
| **C** | PZ v3 live 5 prompt | grep "Ragazzi" present + zero FORBIDDEN | STOP + HARD-BLOCKER.md |
| **D** | Sentry errors last 24h | delta <= 0 vs baseline (via MCP `search_events`) | Alert + investigate |
| **E** | Benchmark delta | score ≥ previous day (no regression) | Alert + investigate |
| **F** | CI last run | success (gh run list) | Re-trigger OR fix |
| **G** | Git hygiene | 0 unpushed commits | Push immediate |

### Alert system

- 7/7 ✅ → day OK, procedi Day N+1 (loop continua)
- ≥1 ❌ → crea `automa/state/PROD-ALERT-$(date).md` + claude-mem save observation severity critical
- Curl 200 fail → `bash scripts/cli-autonomous/rollback.sh` immediate
- PZ v3 violation prod → STOP loop + HARD-BLOCKER.md + handoff

### Outcome file

Genera `docs/audit/day-NN-health.md` con tabella 7 check + evidence.

---

## 4. PLAYWRIGHT E2E su PROD LIVE (non solo preview)

### Daily CoV 3x su PROD

```bash
for i in 1 2 3; do
  BASE_URL=https://www.elabtutor.school \
    npx playwright test --config tests/e2e/playwright.config.js \
    tests/e2e/01-homepage-load.spec.js \
    tests/e2e/02-simulator-open.spec.js \
    tests/e2e/03-lavagna-persist.spec.js \
    tests/e2e/05-pz-v3-watchdog.spec.js \
    tests/e2e/10-deploy-verify.spec.js \
    --reporter=list 2>&1 | tail -10
done
```

**Expected**: 3/3 run PASS identical 5/5 spec.

### Day 14 gate full suite

14 spec E2E post-Sprint 2 (include PWA + Dashboard + Vercel AI SDK nuovi).

### Motivazione PROD vs solo Preview

- **Preview** è effimero (URL cambia ogni deploy)
- **PROD** è invariante, user-facing
- Regressioni PROD = user-facing critiche, priorità massima
- Preview può PASS ma PROD FAIL per CDN cache, DNS, CORS, ecc

---

## 5. RIFERIMENTI OBBLIGATORI

Ogni day Sprint 2 CLI deve leggere (STEP 0):

- `docs/prompts/SPRINT-2-INFRA-PROMPT.md` — scope Sprint 2 + 8 stories + DoD
- `docs/prompts/DAILY-CONTINUE.md` — loop headless rules + 20-step
- `docs/prompts/SESSION-HELPER-ANDREA.md` — helper pattern + 14 lessons
- `docs/workflows/AGILE-METHODOLOGY-ELAB.md` — metodologia Agile
- `docs/reviews/sprint-1-retrospective.md` — lessons Sprint 1
- `automa/team-state/sprint-contracts/sett-2-contract.md` — Sprint Contract Day 08
- `CLAUDE.md` — regole ferree + Principio Zero v3
- Questo addendum: `docs/pdr-ambizioso/giorni/SPRINT-2-ADDENDUM.md`

---

## 6. TASK MAPPING Sprint 2 → Giorni

| Day | Data | Focus principale | Stories |
|-----|------|------------------|---------|
| **08** | lun 28/04 | Kickoff + cleanup repo part 1 | S2-1 |
| **09** | mar 29/04 | Cleanup repo part 2 + parity enforcement | S2-1, S2-2 |
| **10** | mer 30/04 | Gap Sprint 1 fix + Tea onboarding call 18:00 | S2-3, S2-5 |
| **11** | gio 01/05 | Vercel AI SDK tool calling integration | S2-4 |
| **12** | ven 02/05 | Tea primo PR + PWA Teacher scaffold | S2-5, S2-6 |
| **13** | sab 03/05 | RAG chunks extend + Dashboard routing | S2-7, S2-8 |
| **14** | dom 04/05 | End-week-gate + Sprint Review + Retrospective | tutti gate |

---

## 7. DOD giornaliero (base, aggiunge a PDR specifico)

Ogni day Sprint 2 deve chiudere con:

- [ ] Daily Standup formal `docs/standup/day-NN-standup.md`
- [ ] Daily audit `docs/audit/day-NN-audit.md` (20 metriche matrix)
- [ ] Daily health `docs/audit/day-NN-health.md` (7 check PROD live)
- [ ] CoV 3x vitest 12164+ PASS
- [ ] Build PASS
- [ ] Playwright E2E PROD CoV 3x PASS
- [ ] 7-check auto-verify prod ALL PASS
- [ ] MCP calls >=8 logged
- [ ] Benchmark fresh `--write`
- [ ] Commit atomic "tipo(scope): descrizione [TEST N]" + CHANGELOG entry
- [ ] Push + CI verde
- [ ] State persist + velocity LIVE append
- [ ] Handoff `docs/handoff/YYYY-MM-DD-end-day.md` (max 10 righe)

---

## 8. DOD FINE SETTIMANA (Day 14)

- [ ] 16 check `scripts/cli-autonomous/end-week-gate.sh` ALL PASS
- [ ] Sprint Review `docs/reviews/sprint-2-review.md`
- [ ] Sprint Retrospective `docs/retrospectives/sprint-2-retrospective.md`
- [ ] PR body draft `docs/architectures/PR-BODY-DRAFT-sett-2.md`
- [ ] Handoff `docs/handoff/2026-05-04-sprint-2-end.md`
- [ ] CHANGELOG entry Sprint 2
- [ ] State: sprint-end-gate TRIGGERED, attendi Andrea merge + deploy

---

## 9. CREDENZIALI (tutte in `~/.zshrc`)

```bash
export GITHUB_TOKEN="ghp_..."          # Sprint 1 day 01
export TOGETHER_API_KEY="tgp_v1_..."    # Sprint 1 day 01
export SUPABASE_ACCESS_TOKEN="sbp_..."  # Sprint 1 day 01
export SUPABASE_ANON_KEY="eyJ..."       # Sprint 2 day 08 (aggiunta 21/04)
# Vercel: login via `npx vercel whoami` (andreamarro)
```

**Non necessarie Sprint 2**: Hetzner, RunPod, OpenAI, Telegram.

---

## 10. LAUNCH lun 28/04 09:00

Stringa unica kickoff:

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && source ~/.zshrc && git checkout main && git pull origin main && git checkout -b feature/sett-2-stabilize-v2 && git push -u origin feature/sett-2-stabilize-v2 && caffeinate -i bash scripts/cli-autonomous/loop-forever.sh
```

Loop autonomo Day 08-14. Zero intervento Andrea (eccetto Tea call mer 30/04 18:00 + merge PR dom 04/05 sera).

---

## Firma

**Autore**: Andrea Marro + Claude Opus 4.7
**Data creazione**: 2026-04-21
**Applicabile**: Sprint 2 Day 08-14 (lun 28/04 → dom 04/05/2026)
**Versione**: 1.0
