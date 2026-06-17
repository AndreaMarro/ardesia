# REFERENCES MASTER — Documenti e materiale completo ELAB Tutor

**Scopo**: elenco unico di TUTTI i file, cartelle, URL, credenziali e risorse del progetto ELAB Tutor v1.0. CLI e Tea leggono questo documento per sapere dove trovare qualsiasi cosa.

**Ultimo aggiornamento**: 2026-04-21 (post Sprint 1 close)

---

## 1. CONTESTO PROGETTO (leggere prima Sprint 2)

### Regole + visione
- **`CLAUDE.md`** (root) — regole ferree progetto, Principio Zero v3, stack, file critici lockati, bug prioritari
- **`README.md`** (root) — overview progetto
- **`docs/GOVERNANCE.md`** — regole governance (Rule 0-5 CI)
- **`CHANGELOG.md`** — storia release

### Piano ambizioso 8 settimane
- **`docs/pdr-ambizioso/PDR_GENERALE.md`** — architettura completa 8 settimane (path costi, stack, rischi)
- **`docs/pdr-ambizioso/AUDIT_FINALE_PDR.md`** — caveat onesti + gap riconosciuti
- **`docs/pdr-ambizioso/MULTI_AGENT_ORCHESTRATION.md`** — paradigma 6 team agent peer
- **`docs/pdr-ambizioso/HARNESS_DESIGN.md`** — pattern Anthropic Harness 2.0 (Sprint Contract, state recovery, 4-grading)
- **`docs/pdr-ambizioso/PROGRAMMATIC_TOOL_CALLING.md`** — PTC usage (non ancora in Claude Code CLI, reference API)
- **`docs/pdr-ambizioso/DAILY_TEMPLATE.md`** — template daily file
- **`docs/pdr-ambizioso/GIORNI_INDEX.md`** — indice 56 giorni
- **`docs/pdr-ambizioso/PDR_SETT_{1..8}_*.md`** — 8 PDR settimanali

### Metodologia
- **`docs/workflows/AGILE-METHODOLOGY-ELAB.md`** — Agile Scrum adattato ELAB (35 pagine)

---

## 2. SPRINT 1 CLOSURE ARTIFACTS (retrospettiva + lezioni)

### Daily Sprint 1
- **`docs/standup/2026-04-{20..26}-day-0{1..7}-standup.md`** — 7 daily standup
- **`docs/audit/day-0{4..7}-audit-2026-04-{23..26}.md`** — daily audit (Day 04-07 completi via loop headless)
- **`docs/audit/foundations-brutal-audit-2026-04-21.md`** — auditor brutal Sprint 1 setup
- **`docs/audit/foundations-reviewer-verdict.md`** — reviewer APPROVE
- **`docs/audit/foundations-tester-report.md`** — tester report
- **`docs/audit/stress-test-day-7-20260421-0844.md`** — stress test post-deploy Sprint 1

### Sprint end
- **`docs/reviews/sprint-1-review-prep.md`** — Sprint Review Day 06 prep
- **`docs/reviews/sprint-1-retrospective.md`** — Retrospective Day 07 (lessons learned, anti-pattern)
- **`docs/handoff/2026-04-26-sprint-end.md`** — handoff Sprint 1 close
- **`docs/architectures/PR-BODY-DRAFT-sett-1.md`** — PR body Sprint 1 (già usato PR #16)

### Architecture + ADR Sprint 1
- **`docs/architectures/cli-autonomous-foundations.md`** — blueprint fondazioni autonomia
- **`docs/adr/ADR-001-supabase-ref-canonicalization.md`** — canonical `euqpdueopmlllqjmqnyb`
- **`docs/adr/ADR-002-gemini-to-together-switch.md`** — switch LLM provider
- **`docs/adr/ADR-003-jwt-401-edge-function-auth.md`** — pattern SUPABASE_ANON_KEY

### State snapshot Sprint 1 end
- **`automa/state/claude-progress.txt`** — state recovery cross-session
- **`automa/state/benchmark.json`** — benchmark 3.95/10
- **`automa/state/step-0-context-analysis.md`** — Sprint 1 Day 01 context analysis

---

## 3. PROMPT CLI (letti ogni sessione)

- **`docs/prompts/SPRINT-2-INFRA-PROMPT.md`** — Sprint 2 scope + DoD + lessons learned (30+ pagine)
- **`docs/prompts/DAILY-CONTINUE.md`** — loop headless rules (20-step daily)
- **`docs/prompts/SESSION-HELPER-ANDREA.md`** — helper ogni sessione (pattern + 14 lessons)
- **`docs/prompts/SETUP-FONDAZIONI-CLI.md`** — setup fondazioni (Sprint 1 kickoff, storico)
- **`docs/pdr-ambizioso/giorni/SPRINT-2-ADDENDUM.md`** — aggiornamenti Sprint 2 (strategia Together, lessons, auto-verify)

---

## 4. TEA BABBALEA (collaboratrice volontaria)

### Onboarding
- **`docs/tea/ONBOARDING-TEA-COMPLETO.md`** — onboarding completo 35 pagine

### Documenti Tea 13/04/2026 (fonte originale)
- **`/VOLUME 3/TEA/analisi_complessita_esperimenti.pdf`** — 92 esperimenti analizzati, 4 capstone, MOSFET problematico
- **`/VOLUME 3/TEA/riepilogo_correzioni_github.pdf`** — PR #73 mergiata (chunk error + icone + Scratch)
- **`/VOLUME 3/TEA/schema_ux_semplificato.docx`** — 3 zone, Guida Docente, toolbar 4 comandi
- **`/VOLUME 3/TEA/10_idee_miglioramento.docx`** — Dashboard, Proietta in Classe, Quaderno, Glossario, ecc

### Path safe Tea (CODEOWNERS auto-merge)
```
src/data/glossary*
src/data/experiments-vol*
src/data/achievements.js
src/data/challenges-bonus.js
src/data/welcome-messages.js
src/data/celebration-messages.js
src/data/lesson-paths/**
src/data/rag-analogie.json
src/data/errori-comuni.json
src/data/quiz/**
public/glossario/**
public/fumetto/svg/**
public/icons/badges/**
docs/tea/**
tests/unit/components/tutor/**
src/components/tutor/**
src/components/teacher-app/**
```

---

## 5. MATERIALE ELAB FISICO + CONTENUTI

### Volumi PDF (source of truth 92 esperimenti)
- **`/VOLUME 3/CONTENUTI/volumi-pdf/Vol1.pdf`** — 38 esperimenti, 27 MB
- **`/VOLUME 3/CONTENUTI/volumi-pdf/Vol2.pdf`** — 27 esperimenti, 17 MB
- **`/VOLUME 3/CONTENUTI/volumi-pdf/Vol3.pdf`** — 27 esperimenti, 18 MB

Estrazione testo: `pdftotext "percorso.pdf" /tmp/volN.txt`

### TRES JOLIE materiale (branding + foto)
- **`/VOLUME 3/TRES JOLIE/`** — cartella materiale ELAB completo
  - Foto reali kit fisico + bambini + docenti
  - Branding assets (logo, palette)
  - Obbligo: parità visiva kit+volumi+software (unico prodotto coerente)
  - Memory ref: `~/.claude/.../memory/elab-tres-jolie.md`

### Dati sorgente (src/data/)
- **`src/data/experiments-vol1.js`** — 38 esperimenti Vol 1
- **`src/data/experiments-vol2.js`** — 27 esperimenti Vol 2
- **`src/data/experiments-vol3.js`** — 27 esperimenti Vol 3
- **`src/data/volume-references.js`** — 92 mapping pagine volumi + bookText (1221 righe, 92/92 enriched)
- **`src/data/rag-chunks.json`** — 549 chunk RAG (target 1000+ sett 2, 6000+ sett 4)
- **`src/data/unlim-knowledge-base.js`** — KB helper `searchKnowledgeBase()` + `searchRAGChunks()`
- **`src/data/lesson-groups.js`** — 27 Lezioni raggruppate per concetto
- **`src/data/lesson-paths/*.json`** — percorsi lezione strutturati

### Context UNLIM
- **`src/services/unlimContextCollector.js`** — `collectFullContext()` (circuit, code, step, pin states)
- **`src/components/lavagna/useGalileoChat.js`** — chat hook (nome legacy, contenuto UNLIM)

---

## 6. INFRASTRUTTURA + URL

### Production + dashboard
| Servizio | URL | Stato |
|----------|-----|-------|
| **Sito live** | https://www.elabtutor.school | ✅ OK (Vercel) |
| **Supabase** | https://supabase.com/dashboard/project/euqpdueopmlllqjmqnyb | ✅ OK (canonical) |
| **Vercel** | https://vercel.com/andreas-projects-6d4e9791/elab-tutor | ✅ OK |
| **GitHub repo** | https://github.com/AndreaMarro/elab-tutor | ✅ OK (trattino) |
| **Together AI** | https://api.together.ai/settings/api-keys | ✅ configurato |
| **Nanobot legacy** | https://elab-galileo.onrender.com | ⚠️ Render (18s cold start, warmup aggiunto T1-003) |
| **Compilatore** | https://n8n.srv1022317.hstgr.cloud/compile | ✅ OK |
| **Edge TTS VPS** | http://72.60.129.50:8880 | ✅ OK |
| **Kokoro TTS** | localhost:8881 | 🟡 SOLO locale |
| **Brain V13** | http://72.60.129.50:11434 | 🟡 NON verificato |

### Edge Functions Supabase
- https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat
- https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-diagnose
- https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-hints
- https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-tts
- https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-gdpr

### Repo GitHub duplicati (attenzione)
- ✅ **`AndreaMarro/elab-tutor`** (CON trattino) — **PRODUCTION ATTIVO** (Vercel connesso)
- ⚠️ **`AndreaMarro/elabtutor`** (SENZA trattino) — stale dal 14/04, duplicato abbandonato (archiviare Sprint 2)
- Legacy: `AndreaMarro/elab-galileo-nanobot` (remote `render`, vecchio Render deploy)

---

## 7. CREDENZIALI (file privato + env)

### File privato Andrea
- **`~/.elab-credentials.md`** (chmod 600) — riferimenti dove salvate tutte le chiavi

### Env var in `~/.zshrc`
```bash
export GITHUB_TOKEN="ghp_..."                # GitHub PAT (scope repo)
export GH_TOKEN="$GITHUB_TOKEN"
export TOGETHER_API_KEY="tgp_v1_..."         # Together AI
export SUPABASE_ACCESS_TOKEN="sbp_..."       # Supabase management
export SUPABASE_ANON_KEY="eyJ..."            # Supabase public client-safe (sett 2)
# Vercel: login `npx vercel login` (andreamarro)
```

### Credenziali non ancora create (Fase 2 post-revenue, NON sett 2)
- ❌ Hetzner Cloud API token
- ❌ RunPod API key
- ❌ OpenAI (DALL-E)
- ❌ Telegram BotFather

---

## 8. SKILL + PLUGIN + AGENT

### Team agent (6 Opus peer)
- **`.claude/agents/team-tpm.md`** — Project Manager
- **`.claude/agents/team-architect.md`** — Software Architect
- **`.claude/agents/team-dev.md`** — Senior Developer
- **`.claude/agents/team-tester.md`** — QA Engineer
- **`.claude/agents/team-reviewer.md`** — Code Reviewer
- **`.claude/agents/team-auditor.md`** — Honest Auditor

### Agent legacy (pre Sprint 1)
- `.claude/agents/planner.md`, `generator-app.md`, `generator-test.md`, `evaluator.md`

### Settings
- **`.claude/settings.local.json`** — permission allowlist + hook safety + env `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` + model `opus`
- **`.claude/tools-config.json`** — PTC config (preparato, non attivo CLI)

### Skill custom ELAB
- `/elab-benchmark` — 30 metriche oggettive
- `/elab-quality-gate` — gate pre/post sessione
- `/elab-rag-builder` — costruisce RAG da volumi
- `/quality-audit` — end-to-end audit
- `/volume-replication` — verify parallelism volumi
- `/analisi-simulatore` — audit simulator
- `/elab-cost-monitor` — monitor costi API
- `/ricerca-orchestrator` — orchestratore ricerca ELAB

### Plugin installati
- `claude-mem` (memoria persistente cross-session)
- `superpowers` (TDD, debugging, verification, writing-plans, dispatching)
- `caveman` (compressione)
- `vercel` + `supabase` + `sentry` + `posthog` + `coderabbit` + `pr-review-toolkit` + `feature-dev` + `firecrawl` + `anthropic-skills` + `impeccable` + `frontend-design` + `ralph-loop` + `ultrathink`

### Plugin NON installati (considerare Sprint 2+)
- `wshobson/agents` (184 agenti specialisti, 78 plugin)
- `oh-my-claudecode` (32 agents orchestration)
- `ccswarm` (multi-agent worktree)
- `ship` (PR automation)
- `test-writer-fixer` (auto test generation)
- `Local-Review` (multi-agent parallel review)

---

## 9. MCP CONNECTORS attivi

### Usati daily (target >=8 calls/day)
- `mcp__plugin_claude-mem_mcp-search__*` — memoria cross-session
- `mcp__plugin_serena_serena__*` — codebase semantic (trova simboli, pattern)
- `mcp__plugin_playwright_playwright__*` — browser E2E live
- `mcp__Claude_Preview__*` — dev server verify
- `mcp__Control_Chrome__*` — UI prod live
- `mcp__supabase__*` — DB + Edge Function deploy + logs
- `mcp__57ae1081-*__*` — Vercel deploy + runtime logs
- `mcp__792083c5-*__*` — Sentry errors tracking
- `mcp__plugin_context7_context7__*` — docs aggiornate librerie

### Altri disponibili (on-demand)
- `mcp__a3761d95-*__*` (Notion)
- `mcp__426774f8-*__*` (Fireflies meeting notes)
- `mcp__Macos__*` (macOS system)
- `mcp__Figma__*`, `mcp__c00be6b6-*__*` (Figma design)
- `mcp__ac54a37f-*__*` (query-docs library)
- `mcp__b527a193-*__*` (n8n workflows)

---

## 10. SCRIPTS AUTOMATION

### CLI autonomous loop
- **`scripts/cli-autonomous/loop-forever.sh`** — auto-restart wrapper
- **`scripts/cli-autonomous/baseline-snapshot.sh`** — baseline snapshot pre-day
- **`scripts/cli-autonomous/daily-preflight.sh`** — pre-flight check
- **`scripts/cli-autonomous/daily-audit.sh`** — audit daily output
- **`scripts/cli-autonomous/end-day-handoff.sh`** — handoff generate
- **`scripts/cli-autonomous/end-week-gate.sh`** — 16 check gate Day 7/14/21/...
- **`scripts/cli-autonomous/push-safe.sh`** — push + CI watch
- **`scripts/cli-autonomous/deploy-preview.sh`** — Vercel preview
- **`scripts/cli-autonomous/deploy-prod.sh`** — Vercel prod (require approval)
- **`scripts/cli-autonomous/rollback.sh`** — rollback Vercel + Edge Function
- **`scripts/cli-autonomous/stress-test.sh`** — 7 check post-deploy
- **`scripts/cli-autonomous/no-regression-guard.sh`** — 5 gate hard
- **`scripts/cli-autonomous/verify-edge-function.sh`** — JWT pattern test
- **`scripts/cli-autonomous/verify-llm-switch.sh`** — 20 prompt PZ v3
- **`scripts/cli-autonomous/state-update.sh`** — state persist LIVE
- **`scripts/cli-autonomous/auto-fix-blockers.sh`** — auto-fix retry
- **`scripts/cli-autonomous/test-on-deployed.sh`** — test prod E2E

### Benchmark + anti-regression
- **`scripts/benchmark.cjs`** — 10 metriche pesate, score 0-10
- **`scripts/anti-regression-gate.sh`** — baseline test count guard
- **`scripts/guard-critical-files.sh`** — blocca modifiche engine senza authorization

### Provisioning (Sprint 2 Day 08-09 OR Fase 2 post-revenue)
- **`scripts/provision-hetzner.sh`** (da creare, Fase 2 se migra EU)
- **`scripts/deploy-openclaw.sh`** (da creare, Fase 2)
- **`scripts/runpod-deploy-mistral.sh`** (da creare, Fase 2)

---

## 11. TEST

### Unit vitest (baseline 12164 post-Sprint 1)
- **`tests/unit/**`** — unit tests
- **`tests/integration/**`** — integration tests
- **`tests/e2e/**`** — Playwright E2E (12 spec post-Sprint 1, target 14 Sprint 2)

### Config
- **`tests/e2e/playwright.config.js`** — Playwright config Sprint 1 scaffold
- **`vitest.config.js`** (root) — vitest config

### Baseline guard
- **`.test-count-baseline.json`** — baseline ratcheting 11958 → 12164

---

## 12. API + SERVIZI BACKEND

### Edge Function structure
- **`supabase/functions/_shared/llm-client.ts`** — dispatcher Together/Gemini (Sprint 1 switch)
- **`supabase/functions/_shared/system-prompt.ts`** — BASE_PROMPT Principio Zero v3 IMMUTABILE
- **`supabase/functions/_shared/memory.ts`** — cross-session context loader
- **`supabase/functions/_shared/types.ts`** — TypeScript types
- **`supabase/functions/unlim-chat/index.ts`** — chat entrypoint
- **`supabase/functions/unlim-diagnose/index.ts`** — diagnose circuit
- **`supabase/functions/unlim-hints/index.ts`** — hints generator
- **`supabase/functions/unlim-tts/index.ts`** — TTS passthrough
- **`supabase/functions/unlim-gdpr/index.ts`** — GDPR consent

### Migration SQL
- **`supabase/migrations/20260420_lesson_contexts_cross_session.sql`** — tabella cross-session memory

---

## 13. AUTOMA STATE + TEAM

### State files (LIVE updated)
- **`automa/state/claude-progress.txt`** — state recovery cross-session
- **`automa/state/benchmark.json`** — benchmark current
- **`automa/state/velocity-tracking.json`** — velocity rolling avg (LIVE, no backfill)
- **`automa/state/daily-logs/`** — CLI loop-forever logs
- **`automa/state/heartbeat`** — watchdog heartbeat (cron)
- **`automa/state/step-0-context-analysis.md`** — Sprint 1 day 01 analysis
- **`automa/state/HARD-BLOCKER.md`** (se presente → stop permanente loop)
- **`automa/state/PROD-ALERT-*.md`** (se presente → regression rilevata)
- **`automa/state/WEEK-N-READY-FOR-REVIEW.md`** (fine sett gate PASS)

### Team state (shared coord)
- **`automa/team-state/tasks-board.json`** — Kanban + story points
- **`automa/team-state/daily-standup.md`** — append-only standup log
- **`automa/team-state/decisions-log.md`** — ADR log
- **`automa/team-state/blockers.md`** — impediments open
- **`automa/team-state/team-roster.md`** — 6 agent descriptions
- **`automa/team-state/sprint-contracts/sett-N-contract.md`** — Harness 2.0 contract per sprint

### Automa legacy (knowledge + PDR)
- **`automa/handoff.md`** — legacy handoff
- **`automa/PDR.md`** — legacy PDR
- **`automa/knowledge/INDEX.md`** — 110+ docs indexed
- **`automa/ORDERS/`** — order queue (se presente)

---

## 14. FEEDBACK + DECISIONI ANDREA (memoria)

### Memory files persistent (auto-claude)
- **`~/.claude/projects/.../memory/MEMORY.md`** — index memoria principale
- Key memory entries (vedi MEMORY.md):
  - `architecture.md` — paths + deploy commands
  - `supabase-credentials.md` — 2 Supabase progetti, routing
  - `scores.md` — quality scores per area
  - `feedback_production_safety.md` — MAI auto-modify prod config
  - `feedback_no_demo.md` — ZERO DEMO, ZERO DATI FINTI
  - `feedback_priorities_09apr2026.md` — priorità prodotto Andrea
  - `feedback_context_persistence.md` — context loss = biggest blocker
  - `feedback_no_overlay.md` — pannelli manipolabili
  - `elab-tres-jolie.md` — materiale completo ELAB
  - `unlim-vision-core.md` — visione UNLIM guida invisibile
  - `long-session-best-practices.md` — 10 tecniche sessioni lunghe
  - E altre 30+ memory entries

---

## 15. COMMIT MESSAGE CONVENTION

```
tipo(scope): descrizione [TEST N]

body spiega WHY + HOW + evidence path

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

Tipi: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `build`, `style`

Scope esempi: `lavagna`, `unlim`, `tutor`, `dashboard`, `content`, `glossary`, `sprint-N-day-NN`, `edge`, `foundations`

**[TEST N]** marker obbligatorio PR >100 LoC (Sprint 1 lesson #5).

---

## 16. CI/CD PIPELINES

- **`.github/workflows/e2e.yml`** — E2E Tests workflow
- **`.github/workflows/quality-gate.yml`** — Quality rating
- **`.github/workflows/governance.yml`** — Governance Rules 0-5 (Rule 5 = CHANGELOG update mandatory)
- **`.github/workflows/cicd-pipeline.yml`** — test + build + deploy
- **`.github/workflows/tea-automerge.yml`** — Tea PR auto-merge path safe
- **`.github/workflows/watchdog.yml`** — watchdog 24/7 cron
- **`.github/workflows/render-warmup.yml`** — T1-003 Render warmup cron 10min

---

## 17. LOG + DIAGNOSTIC

- **`automa/state/daily-logs/cli-*.log`** — CLI headless log per session
- **`/tmp/baseline-*.json`** — baseline snapshot pre-change
- **`/tmp/deploy-url.txt`** — ultimo deploy URL
- **`docs/audit/day-NN-*.md`** — daily audit file
- **`docs/audit/stress-test-day-*.md`** — stress test output

---

## 18. OFFLINE STUDIO (quando servono dati non accessibili)

Quando CLI girando senza internet OR servizio down:
- RAG chunks `src/data/rag-chunks.json` offline-ready
- Glossary `src/data/glossary.js` offline-ready
- Tutti `src/data/*` offline-ready
- Tests vitest offline
- Build offline (eccetto fetch npm pacchetti iniziali)
- Playwright offline contro preview locale `npm run dev`

---

## 19. Per Tea Babbalea workflow

1. **Clone fresh**: `git clone https://github.com/AndreaMarro/elab-tutor.git`
2. **Setup**: `cd elab-tutor && npm install`
3. **Read obbligatorio**:
   - `docs/tea/ONBOARDING-TEA-COMPLETO.md` (35 pagine, intero)
   - `CLAUDE.md` sezioni "Principio Zero" + "Aree liberamente"
4. **Branch naming**: `tea/<task-slug>`
5. **PR title**: `feat(content): <task>` OR `feat(copy): <task>`
6. **Auto-merge conditions**: path safe + CI green + <500 LoC + zero npm dep
7. **Blocker?** commenta PR `@AndreaMarro`

---

## 20. QUICK REFERENCE PATHS

```
/Users/andreamarro/VOLUME 3/
├── CONTENUTI/
│   └── volumi-pdf/               # PDF Vol1/2/3 (source of truth)
├── TEA/                          # 4 doc Tea 13/04/2026
├── TRES JOLIE/                   # Branding + foto kit + bambini
└── PRODOTTO/
    └── elab-builder/             # REPO PRINCIPALE
        ├── src/                  # Codice applicazione
        │   ├── components/       # React components
        │   ├── data/             # Data files (experiments, glossary, rag)
        │   ├── services/         # API, context, routing
        │   └── styles/           # CSS globali
        ├── supabase/             # Edge Functions + migrations
        ├── public/               # Static assets
        ├── tests/                # Vitest + Playwright
        ├── scripts/              # Automation scripts
        │   └── cli-autonomous/   # Loop + gate + audit scripts
        ├── docs/                 # Documentation
        │   ├── pdr-ambizioso/    # 8-week plan + 56 daily PDR
        │   │   └── giorni/       # Daily PDR files
        │   ├── workflows/        # Agile + governance
        │   ├── prompts/          # CLI prompts (DAILY-CONTINUE, SPRINT-2, HELPER)
        │   ├── reviews/          # Sprint reviews
        │   ├── retrospectives/   # Sprint retrospectives
        │   ├── handoff/          # Daily + sprint handoff
        │   ├── audit/            # Daily + stress test audit
        │   ├── architectures/    # Blueprint architetture
        │   ├── adr/              # Architecture Decision Records
        │   ├── standup/          # Daily standup files
        │   ├── decisions/        # Decisions log
        │   ├── evidence/         # Screenshot + proof
        │   ├── tea/              # Tea onboarding + tasks
        │   └── archive/          # Archive pre-Sprint N
        ├── automa/               # State + team coord
        │   ├── state/            # Cross-session state
        │   └── team-state/       # Shared team data
        ├── .claude/              # Agent + settings
        │   ├── agents/           # 6 team agent definitions
        │   └── settings.local.json
        └── .github/workflows/    # CI/CD pipelines
```

---

## Firma + manutenzione

**Autore**: Andrea Marro + Claude Opus 4.7
**Data creazione**: 2026-04-21
**Prossima revisione**: fine Sprint 2 (dom 04/05/2026)
**Obiettivo**: fonte unica verità per TUTTI i documenti e risorse progetto ELAB Tutor v1.0
**Aggiornamenti**: append-only (nuovi file/risorse), mai rimuovere (storico)
