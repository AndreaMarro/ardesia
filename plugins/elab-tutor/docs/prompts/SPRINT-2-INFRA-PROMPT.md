# SPRINT 2 — Stabilize v2 + Tea + Parity + PWA (lun 28/04 → dom 04/05/2026)

**Sprint Goal**: Consolidare Sprint 1, onboardare Tea Babbalea, implementare parity enforcement automatica 92 esperimenti, chiudere gap tecnici residui Sprint 1 (Playwright, stress-test, benchmark), scaffold PWA Teacher Companion, estendere RAG chunks 549 → 1000+ senza disturbare production stabile.

**Branch**: `feature/sett-2-stabilize-v2` (nuovo da main post-Sprint 1 merge)

**Durata**: 7 giorni (Day 08 lun 28/04 → Day 14 dom 04/05)

**Paradigma**: LOOP consecutive days stessa session headless, Harness 2.0 Sprint Contract, MCP mandatory >=8/day, claude-mem save per decisione, onestà brutale, zero inflation.

**Stack invariato**: Together AI (default) + Gemini (fallback) + Supabase Edge Function + Vercel AI SDK. **ZERO Hetzner/RunPod** (Fase 2 post-revenue).

---

## ⚠️ LESSONS LEARNED da Sprint 1 — MUST APPLY

### Anti-pattern PROCESS da correggere

1. **Velocity tracking backfill** Sprint 1 Day 03+04 → Sprint 2 LIVE update ogni day end in `automa/state/velocity-tracking.json`. Mai catch-up sabato.
2. **MCP calls deficit** (1-2 vs target 8+/day) Sprint 1 → Sprint 2 log esplicito ogni chiamata MCP in audit file giornaliero. Minimum 8 per day.
3. **Dispatch cap violato** Day 01 (7 vs 5 max) → Sprint 2 strict <=5 parallel Agent ogni dispatch.
4. **Sprint planning vago Day 01** → Sprint 2 alloca 2h Day 08 mattina per Sprint Contract formal, standup formal, tasks-board setup.

### Anti-pattern TECHNICAL da correggere

5. **Git hygiene "Test N" marker missing** → Sprint 2 PR >100 LoC require body con "Test plan" checklist. Benchmark regression Day 04 Sprint 1 (-0.27) root cause.
6. **Vision E2E CoV 1x** → Sprint 2 CoV 3x live su deploy preview sempre. Reliability signal weak altrimenti.
7. **Build not re-run Day 06** → Sprint 2 `npm run build` explicit Day 07 pre-merge. Non proxy vitest.
8. **CHANGELOG missing** → Governance Rule 5 fail Sprint 1. Sprint 2 CHANGELOG update ogni commit src/supabase mandatory.

### Anti-pattern CI/DEPLOY da correggere

9. **Vercel OOM** deploy fail → `--prebuilt --archive=tgz` ALWAYS. Mai `vercel --prod` diretto.
10. **SUPABASE_ANON_KEY env missing** → Sprint 2 aggiunto `~/.zshrc` (JWT anon legacy).
11. **zsh `read -p`** = ERROR script → mai `read -p`, usa `read "?Prompt: "` zsh-safe.
12. **Comment `#` paste multiline** → shell esegue come comando. Paste senza commenti o usa `: comment` (zsh-safe).
13. **CI Routines Orchestrator spam** fail email → disable workflow `gh workflow disable "Routines Orchestrator"`.

### Repo hygiene DEBT carry-over

14. **152 dirty files** Sprint 1 mai puliti → Sprint 2 Story S2-1 cleanup dedicato.
15. **Branches `auto/*`** accumulo → delete stale via `gh api -X DELETE /repos/.../git/refs/heads/...`.
16. **Docs 100+ file sparsi** → Sprint 2 consolida: `docs/audit/` + `docs/handoff/` pre-sprint-1 → `docs/archive/`.
17. **PDF volumi 60+ MB** in repo → Sprint 2 move Supabase storage + `.gitignore` entry.
18. **Worktree orfani `.claude/worktrees/agent-*`** → `git worktree prune`.

### Gap tecnici residui Sprint 1 (fix Sprint 2 week)

19. **Playwright stress-test script path** → `bash scripts/cli-autonomous/stress-test.sh` "No tests found" error. Path fix.
20. **npm audit parse** script stress-test → `High: unknown, Critical: unknown`. jq parse fix.
21. **Benchmark post-deploy persistita** Sprint 1 → 3.95 stable. Sprint 2 target 4.5+ ratcheting (Day 07 Sprint 1 delta +1.18, Sprint 2 target +0.55).
22. **ADR-003 Proposed → Accepted** (serve SUPABASE_ANON_KEY live verify 20/20 PZ v3). Credenziale ora disponibile.
23. **BLOCKER-007** render-warmup.yml first cron run verify.
24. **BLOCKER-008** grep canonical Supabase ref invariant on main.

---

## 🎯 SPRINT 2 DELIVERABLE — 8 STORIES

### Story S2-1: Repo cleanup + governance hygiene (2 days, 5 story points) — P0

**Tasks**:
- **T2-001** Categorize 152 dirty files: commit utile / stash carry-over / revert junk (2h, Andrea + team-dev)
- **T2-002** Delete 30+ stale branches `auto/*` via `gh api -X DELETE` (1h, batch script)
- **T2-003** Prune worktree orfani `.claude/worktrees/agent-*` + stash vecchi (30 min)
- **T2-004** Archive `docs/handoff/2026-04-1*.md` + `docs/audit/2026-04-1*.md` → `docs/archive/pre-sprint-2/` (1h)
- **T2-005** Move PDF volumi `VOLUME 3/CONTENUTI/volumi-pdf/*` → Supabase storage bucket `volumes-pdf/` + aggiorna riferimenti `src/data/volume-references.js` (2h)
- **T2-006** `.gitignore` entries per file binari + state ephemeral + worktree (30 min)
- **T2-007** `git gc --aggressive --prune=now` per recuperare spazio (10 min)
- **T2-008** Disable workflow spam: `gh workflow disable "Routines Orchestrator"` (5 min)

**DoD S2-1**:
- [ ] Repo size: 132 MB → <80 MB
- [ ] `git status --short | wc -l` < 20 (era 152)
- [ ] Branches `auto/*` rimossi (era 50+ → target <20)
- [ ] CI spam email email ridotto (Routines disabled)
- [ ] Volumi PDF Supabase storage accessibili + referenziati correttamente

---

### Story S2-2: Parity enforcement 92 esperimenti (1 day, 3 story points) — P0

**Tasks**:
- **T2-009** `tests/unit/data/parity-all-data.test.js` (enforce 92 count tutti file data experiments-related) (3h, TDD strict)
- **T2-010** `scripts/verify-volume-parity.sh` (Node check cross-file 1:1) (2h)
- **T2-011** Gate 14/15/16 in `scripts/cli-autonomous/end-week-gate.sh` (parity + PZ v3 + PDR hygiene) (1h)
- **T2-012** `tests/unit/data/principio-zero-v3.test.js` (enforce runtime tutti data file testi class-facing) (2h)

**DoD S2-2**:
- [ ] Test parity fail block PR se count data file != 92
- [ ] Test PZ v3 fail block PR se FORBIDDEN regex match OR plural "Ragazzi" missing
- [ ] Gate script end-week blocca sprint close se parity OR PZ v3 violated

---

### Story S2-3: Gap Sprint 1 fix + ADR-003 promote (1 day, 3 story points) — P0

**Tasks**:
- **T2-013** Fix `scripts/cli-autonomous/stress-test.sh`:
  - Playwright path issue (`npx playwright test --config tests/e2e/playwright.config.js` explicit)
  - npm audit jq parse fix
  - Benchmark delta persist post-run
  - LLM 50 prompt batch con SUPABASE_ANON_KEY (ora disponibile)
  (3h)
- **T2-014** Verify ADR-003 live: curl Edge Function 20 prompt PZ v3 check → `docs/audit/adr-003-verify-live.md` → promote status Proposed → Accepted (2h)
- **T2-015** BLOCKER-007: first cron run render-warmup.yml verify live (30 min)
- **T2-016** BLOCKER-008: grep canonical Supabase ref invariant on main (`src/ | supabase/ | scripts/ | docs/ | CLAUDE.md`, expected: solo `euqpdueopmlllqjmqnyb`) (30 min)

**DoD S2-3**:
- [ ] stress-test.sh 7/7 check PASS (Sprint 1 era 3/7)
- [ ] ADR-003 status `Accepted` con evidence
- [ ] Render warmup verified working cron real
- [ ] Canonical invariant 100% on main

---

### Story S2-4: Vercel AI SDK multi-step agentic integration (2 days, 5 story points) — P1

**Tasks**:
- **T2-017** Verify Vercel AI SDK installed + versione (`package.json` check)
- **T2-018** Refactor `supabase/functions/unlim-chat/index.ts` usando Vercel AI SDK `streamText` + tool definitions Zod schema (4h, team-architect blueprint + team-dev)
- **T2-019** Implementa 5 tool base:
  - `getCircuitState()` — leggi stato circuit utente
  - `highlightComponent(id)` — sottolinea LIM
  - `citeBookPage(volume, page)` — cita libro fedele
  - `suggestNextExperiment()` — progression
  - `generateFumetto(context)` — trigger fumetto end-of-lesson
  (4h)
- **T2-020** Test integration `tests/integration/unlim-tool-calling.test.js` (2h)
- **T2-021** Deploy Edge Function `unlim-chat` updated + live verify (1h)

**DoD S2-4**:
- [ ] UNLIM chat usa Vercel AI SDK multi-step loop (non chiamate LLM plain)
- [ ] 5 tool base funzionanti (invocabili da LLM)
- [ ] Deploy Edge Function OK + curl 200 + PZ v3 20/20
- [ ] Test integration PASS

---

### Story S2-5: Tea Babbalea onboarding + primo PR (0.5 day, 3 story points) — P0

**Tasks**:
- **T2-022** Mer 30/04 18:00: call onboarding Tea (1h Andrea + Tea, Cowork OR Zoom)
- **T2-023** Tea setup locale: clone repo, `npm install`, verify baseline (Tea, 30 min)
- **T2-024** Tea GitHub collaborator accept invite + primo branch `tea/glossario-batch-1` (15 min)
- **T2-025** Tea primo PR: 5-10 termini glossario aggiunti in `src/data/glossary.js` test auto-merge workflow (2-3h Tea)
- **T2-026** Andrea verify PR Tea auto-merged correttamente (CODEOWNERS path safe + CI verde) (15 min)

**DoD S2-5**:
- [ ] Tea ha accesso repo + setup locale
- [ ] Tea primo PR merged via auto-merge workflow
- [ ] Tea baseline workflow comfortable (nessun blocker processo)

---

### Story S2-6: PWA Teacher Companion scaffold (2 days, 5 story points) — P1

**Tasks**:
- **T2-027** Blueprint `docs/architectures/pwa-teacher-companion.md` (team-architect, 2h)
- **T2-028** Scaffold `src/components/teacher-app/` struttura base (4 tab: Oggi/Progresso/Report/Guida) (3h)
- **T2-029** `manifest.json` PWA + icons + theme-color (1h)
- **T2-030** Service Worker base (offline cache homepage) (2h)
- **T2-031** Route `/teacher-app` aggiunta (verify se path safe — controlla CODEOWNERS) (1h)
- **T2-032** Test unit component 4 tab render (vitest) (2h)
- **T2-033** E2E Playwright spec `tests/e2e/13-pwa-teacher-app.spec.js` (install prompt + 4 tab navigation) (2h)

**DoD S2-6**:
- [ ] PWA installabile (manifest valid + service worker)
- [ ] 4 tab visibili + navigabili
- [ ] E2E spec PASS
- [ ] NO routing wired in main app (scaffold only, integrazione Sprint 5)

---

### Story S2-7: RAG chunks extend 549 → 1000+ (1.5 days, 3 story points) — P1

**Tasks**:
- **T2-034** Extract nuovo batch chunk da volumi PDF (Vol1 rimanenti + Vol2 prime sezioni) usando `/anthropic-skills:pdf` (3h)
- **T2-035** Chunk preprocessing: paragraph split 400-500 token, overlap 50 token, metadata `{source, volume, page, chapter, section}` (2h)
- **T2-036** Aggiorna `src/data/rag-chunks.json` + embedding (se applicabile) (2h)
- **T2-037** Test RAG retrieval quality: 10 query sample, verifica top-3 relevance >=70% (2h)
- **T2-038** Verify PZ v3 chunks injection: testi aggiunti non violano regole (1h)

**DoD S2-7**:
- [ ] Chunks totali >= 1000
- [ ] Retrieval quality sample test >=70% relevance
- [ ] Zero PZ v3 violations nei chunks aggiunti
- [ ] File size `rag-chunks.json` < 10 MB (ottimizzato)

---

### Story S2-8: Dashboard docente routing wire-up (1 day, 3 story points) — P1

**Tasks**:
- **T2-039** Verifica dashboard scaffold esistente Sprint 1 (`src/components/dashboard/index.jsx`) (30 min)
- **T2-040** Aggiungi routing custom (hash `#dashboard` OR prop navigation da main App) (2h)
- **T2-041** Mock data cards: esperimenti completati classe, badge earned, prossima lezione (2h)
- **T2-042** A11y audit dashboard: contrast, keyboard nav, aria-live regions (team-tester, 1h)
- **T2-043** E2E spec `tests/e2e/14-dashboard-navigation.spec.js` (accesso + render + accessibility) (2h)

**DoD S2-8**:
- [ ] Dashboard accessibile via URL /` oppure `#dashboard`
- [ ] Cards render con mock data
- [ ] E2E spec PASS
- [ ] WCAG AAA contrast maintained (from Sprint 1 fix)

---

## 📋 Acceptance Criteria Sprint-wide

- **Tests vitest**: baseline 12164 MAI scende. Target +50 (12214+).
- **Benchmark**: fresh `--write` ogni day end. Target 4.5+ fine sett.
- **PZ v3 violations**: 0 source + 0 live prod (stress-test 20/20 PASS).
- **Engine semantic diff**: 0 (file critici lockati).
- **Coverage %**: target >=55% (baseline Sprint 1 measure TBD).
- **Deploy preview**: ogni day end + curl 200 verify.
- **Deploy prod weekly**: Day 14 gate PASS → Vercel prebuilt archive tgz.
- **Sprint Review**: dom 04/05 sera.
- **Retrospective**: dom 04/05 sera post-Review.
- **Auditor target avg**: >=7.5/10 (trend Sprint 1 = 7.35).
- **MCP calls**: >=8/day logged (Sprint 1 deficit 1-2).
- **Dispatch cap**: <=5 parallel agents STRICT.
- **Tea PR**: >=1 merged successfully (path safe auto-merge verify).

---

## 🧪 Test strategy

### Unit vitest
- T2-009 parity test 92 enforce
- T2-012 PZ v3 test enforce
- T2-020 Vercel AI SDK tool calling
- T2-032 PWA Teacher components
- Coverage target: 55%+ su `src/services/` + `src/components/tutor/`

### Integration
- T2-020 unlim-tool-calling
- T2-037 RAG retrieval quality sample
- T2-014 ADR-003 verify-edge-function 20 prompt PZ v3

### E2E Playwright (live prod + preview) — ENFORCED su PROD

**Ogni day end**, dopo deploy preview, esegui Playwright E2E su PROD (`https://www.elabtutor.school`, NON solo preview):

```bash
# CoV 3x E2E su prod live
for i in 1 2 3; do
  BASE_URL=https://www.elabtutor.school \
    npx playwright test --config tests/e2e/playwright.config.js \
    tests/e2e/01-homepage-load.spec.js \
    tests/e2e/02-simulator-open.spec.js \
    tests/e2e/03-lavagna-persist.spec.js \
    tests/e2e/05-pz-v3-watchdog.spec.js \
    tests/e2e/10-deploy-verify.spec.js \
    --reporter=list 2>&1 | tail -20
done
# Expected: 3/3 run PASS identical 5/5 spec
```

- CoV 3x smoke 5 spec **su PROD live** ogni day end
- Full suite Day 14 gate (14 spec post-Sprint 2) **su PROD live**
- Stress 100x homepage parallel ogni day **su PROD live**
- Edge Function 5/5 health ogni day **su PROD live**
- 5 prompt PZ v3 live verify ogni day **su PROD live**
- New: PWA install + dashboard nav + Vercel AI SDK **su PROD live**

**Perché prod e non solo preview**:
- Preview è effimero (URL cambia ogni deploy)
- Prod è invariante (users reali domani)
- Regressioni su prod = user-facing, priorità massima
- Preview può PASS ma prod FAIL per CDN cache, DNS, ecc

**Se PROD E2E fail** → immediate rollback `scripts/cli-autonomous/rollback.sh` + blocker file + STOP loop.

### Security
- `npm audit --audit-level=high` zero high/critical (parse fix Sprint 2)
- SUPABASE_ANON_KEY rotation plan (90-day)
- No hardcoded keys (grep source)

---

## 📦 File nuovi Sprint 2

### Scripts
- `scripts/cli-autonomous/cleanup-repo.sh` (152 dirty + branches + worktree automation)
- `scripts/cli-autonomous/move-volumes-to-storage.sh` (PDF → Supabase)
- `scripts/cli-autonomous/disable-unused-workflows.sh` (Routines, ecc)
- `scripts/cli-autonomous/daily-standup.sh` (auto-generate)
- `scripts/cli-autonomous/weekly-retrospective.sh` (template)

### Tests
- `tests/unit/data/parity-all-data.test.js`
- `tests/unit/data/principio-zero-v3.test.js`
- `tests/unit/components/tutor/teacher-app.test.jsx`
- `tests/integration/unlim-tool-calling.test.js`
- `tests/integration/rag-retrieval-quality.test.js`
- `tests/e2e/13-pwa-teacher-app.spec.js`
- `tests/e2e/14-dashboard-navigation.spec.js`

### Architecture docs
- `docs/architectures/pwa-teacher-companion.md`
- `docs/architectures/vercel-ai-sdk-agentic.md`
- `docs/architectures/rag-pipeline-extended.md`

### ADRs
- `docs/adr/ADR-004-vercel-ai-sdk-vs-direct-api.md`
- `docs/adr/ADR-005-supabase-storage-volumes-pdf.md`
- `docs/adr/ADR-003-jwt-401-edge-function-auth.md` **UPDATE** status `Accepted`

### Sprint Contract
- `automa/team-state/sprint-contracts/sett-2-contract.md` (Day 08 Sprint Planning output)

### Velocity LIVE
- `automa/state/velocity-tracking.json` (LIVE append ogni day end)

### Standup + audit giornalieri
- `docs/standup/day-{08..14}-standup.md` (7 file)
- `docs/audit/day-{08..14}-audit.md` (7 file)

### Sprint end
- `docs/reviews/sprint-2-review.md`
- `docs/retrospectives/sprint-2-retrospective.md`
- `docs/handoff/2026-05-04-sprint-2-end.md`
- `docs/architectures/PR-BODY-DRAFT-sett-2.md`
- `CHANGELOG.md` entry Sprint 2 (Governance Rule 5)

---

## 🔄 LOOP CONSECUTIVE DAYS headless

Ogni day esegue (in ordine):

1. **Pre-flight state recovery** — `cat automa/state/claude-progress.txt` + `git status` + `gh run list --limit 3`
2. **Baseline snapshot** — `bash scripts/cli-autonomous/baseline-snapshot.sh` → `/tmp/baseline-day-NN.json`
3. **Daily standup formal** — dispatch `@team-tpm` genera `docs/standup/day-NN-standup.md` (Sprint 1 missing Day 01 retroactive, Sprint 2 mai skippare)
4. **Sprint Contract update** (Day 08 only): `@team-architect` + `@team-auditor` negotiation `sprint-contracts/sett-2-contract.md`
5. **Core task dispatch** — max 5 parallel agents, prompt self-contained
6. **CoV 3x vitest** — MAI 1x. Log 3 run count identical
7. **Build verify** — `npm run build` explicit (NON proxy vitest)
8. **E2E smoke** — Playwright 5 spec live prod
9. **Benchmark fresh** — `node scripts/benchmark.cjs --write` persist
10. **MCP calls log** — target >=8: claude-mem (search + save) + supabase (list_tables/deploy) + context7 (docs lookup) + playwright (E2E live) + preview + Chrome + Vercel + Sentry
11. **CHANGELOG update** — entry se src/ OR supabase/ changed (Governance Rule 5)
12. **End-day handoff** — `docs/handoff/YYYY-MM-DD-end-day.md` (10 righe max)
13. **Commit atomic** — 1 commit day end batch, message format `tipo(scope): descrizione [TEST N]`
14. **Push origin** — `git push origin feature/sett-2-stabilize-v2`
15. **CI watch** — `gh pr checks <PR> --watch --fail-fast`
16. **Deploy preview** — `npx vercel --prebuilt --archive=tgz` (non diretto!)
17. **Curl 200 verify** — preview URL response
18. **Velocity tracking LIVE append** — `automa/state/velocity-tracking.json` Day NN entry (NON backfill sabato)
19. **State persist LIVE** — `automa/state/claude-progress.txt` update
20. **Claude-mem save** — `mcp__plugin_claude-mem_mcp-search__*` save observation decisioni chiave day
21. **Day 14 end-week-gate** — `scripts/cli-autonomous/end-week-gate.sh` 16 check (include parity + PZ v3 + hygiene)

---

## 🛑 Stop conditions (come Sprint 1)

- **Day 14 end-week-gate TRIGGERED** → commit sprint-end docs atomic + push, attendi Andrea merge+deploy
- **Quota 429 persistente** → sleep 1h retry (loop-forever.sh smart delay) OR stop con handoff
- **Context auto-compact 3x consecutive** → save state + stop
- **Blocker hard 5 retry fail** → blocker file + stop

---

## 🔑 Credenziali necessarie Sprint 2

### Già pronte ✅ (Sprint 1 + patch)
- GitHub PAT (keychain)
- Together AI key (zshrc `$TOGETHER_API_KEY`)
- Supabase Access Token (zshrc `$SUPABASE_ACCESS_TOKEN`)
- **Supabase Anon Key** (zshrc `$SUPABASE_ANON_KEY`) — aggiunto 21/04 via MCP
- Vercel login (andreamarro)

### Non necessarie Sprint 2
- ❌ Hetzner Cloud API token (Fase 2)
- ❌ RunPod API key (Fase 2)
- ❌ OpenAI DALL-E (Fase 2)
- ❌ Telegram BotFather (Sprint 8)

---

## 📊 Deliverable documenti Sprint 2

### Daily (7 giorni, 2 file/day × 7 = 14)
- `docs/standup/day-{08..14}-standup.md`
- `docs/audit/day-{08..14}-audit.md`

### Architecture (3 nuovi + 1 update)
- `docs/architectures/pwa-teacher-companion.md`
- `docs/architectures/vercel-ai-sdk-agentic.md`
- `docs/architectures/rag-pipeline-extended.md`
- `docs/adr/ADR-003-jwt-401-edge-function-auth.md` (Proposed → Accepted)
- `docs/adr/ADR-004-vercel-ai-sdk-vs-direct-api.md` (new)
- `docs/adr/ADR-005-supabase-storage-volumes-pdf.md` (new)

### Sprint end
- `automa/team-state/sprint-contracts/sett-2-contract.md`
- `docs/reviews/sprint-2-review.md`
- `docs/retrospectives/sprint-2-retrospective.md`
- `docs/handoff/2026-05-04-sprint-2-end.md`
- `docs/architectures/PR-BODY-DRAFT-sett-2.md`

### Repo hygiene artifacts
- `docs/archive/pre-sprint-2/` (move da docs/handoff/ + docs/audit/)

### CHANGELOG
- Entry Sprint 2 (Governance Rule 5 compliance)

---

## 🎯 PROMPT CLI INCOLLA (kickoff Sprint 2)

### ⬇️ INCOLLA DA QUI ⬇️

Sono Andrea Marro. SPRINT 2 STABILIZE V2 start Day 08 (lun 28/04/2026).

**Branch**: `feature/sett-2-stabilize-v2` (nuovo da main post-Sprint 1 merge)

**Riferimenti obbligatori** (read incipit):
- `docs/prompts/SPRINT-2-STABILIZE-V2.md` (questo sprint scope + DoD + lessons)
- `docs/prompts/DAILY-CONTINUE.md` (loop headless rules)
- `docs/prompts/SESSION-HELPER-ANDREA.md` (helper pattern + lessons)
- `docs/workflows/AGILE-METHODOLOGY-ELAB.md` (metodologia)
- `docs/reviews/sprint-1-retrospective.md` (lessons learned Sprint 1)
- `CLAUDE.md` (Principio Zero v3 + file critici lockati)

**Regole FERREE**:
1. Principio Zero v3 IMMUTABILE (plurale Ragazzi, cita libro, class-level, 0 Docente/Insegnante leggi)
2. Parità 92 enforce (test vitest `parity-all-data.test.js` + `verify-volume-parity.sh`)
3. Anti-regressione 5 gate hard (commit/push/merge/deploy/post-deploy)
4. CoV 3x vitest (MAI 1x)
5. MCP calls >=8/day log in audit file
6. Dispatch cap <=5 parallel STRICT
7. Git hygiene "Test N" marker PR >100 LoC
8. CHANGELOG update ogni commit src/supabase (Governance Rule 5)
9. Velocity tracking LIVE ogni day end (NO backfill)
10. Dashboard auto-script honest brutal (zero inflation)
11. Vercel deploy `--prebuilt --archive=tgz` ALWAYS
12. zsh-safe scripts (no `read -p`, no `#` comment multi-line paste)

**Sprint 2 Goal**: consolidare Sprint 1, onboardare Tea, parity 92 enforce, fix gap Sprint 1 (Playwright path, stress-test, benchmark, ADR-003 promote, BLOCKER-007/008), Vercel AI SDK tool calling 5 base, PWA Teacher scaffold, RAG chunks 549 → 1000+, dashboard routing wire-up.

**Stack invariato**: Together AI default + Gemini fallback + Supabase Edge Function + Vercel AI SDK. ZERO Hetzner/RunPod (Fase 2 post-revenue).

Credenziali tutte pronte zshrc: GITHUB_TOKEN + TOGETHER_API_KEY + SUPABASE_ACCESS_TOKEN + SUPABASE_ANON_KEY.

Procedi STEP 0 recovery da `automa/state/claude-progress.txt` + STEP 1 Sprint Planning Day 08 (Sprint Contract formal + tasks-board setup 25 task + velocity tracking entry Day 08 LIVE) + loop consecutive days fino Day 14 end-week-gate TRIGGERED.

Honest brutal ogni step. Zero inflation. Evidence path ogni claim. MCP calls >=8/day log.

### ⬆️ FINE PROMPT ⬆️

---

## Verifica CoV di questo documento — check esaustivo

### Coverage requisiti Andrea

| # | Requisito | Coperto? | Dove |
|---|-----------|----------|------|
| 1 | "architettato come questo" (Sprint 1 pattern) | ✅ | LOOP consecutive days + Harness 2.0 Sprint Contract + 6 team agent + gate hard end-week |
| 2 | "tanti controlli anti-regressione" | ✅ | 5 gate hard (commit/push/merge/deploy/post-deploy) + parity test + PZ v3 test + baseline ratcheting + no regression guard script |
| 3 | "onestà" | ✅ | Auditor brutal ogni step, zero inflation, evidence path, auto-critica 5 gap |
| 4 | "non omissione di nessun passaggio" | ✅ | 20-step daily loop + 16-check end-week gate + DoD per story + PR body checklist |
| 5 | "ricontrollare qualsiasi cosa anche se sembra giusta" | ✅ | CoV 3x vitest + ADR-003 verify live 20/20 + grep canonical invariant + npm audit + MCP cross-verify |
| 6 | "tanti CoV" | ✅ | CoV 3x vitest ogni day + CoV 3x E2E Playwright live + CoV cross-file parity |
| 7 | "audit" | ✅ | Daily audit file + self-audit end-day + auditor 4 grading + end-week brutal audit |
| 8 | "documentazione" | ✅ | 7 daily standup + 7 daily audit + 3 architecture docs + 3 ADR + sprint review + retrospective + CHANGELOG |
| 9 | "tutti i file necessari" | ✅ | 25 task scripts + tests + docs + architecture enumerati |
| 10 | "Continue" | ✅ | `claude --continue --dangerously-skip-permissions` (loop-forever.sh default) |
| 11 | "massima onestà" | ✅ | Regole 1-12 + zero inflation + evidence ogni claim |
| 12 | "ordine" | ✅ | 8 stories P0/P1 ordered + daily loop 20-step + Sprint Contract Day 08 |
| 13 | "prompt per sessione successiva di Claude Code per aiutarmi a gestire CLI" | ✅ | `docs/prompts/SESSION-HELPER-ANDREA.md` (creato 21/04) |
| 14 | "file di riferimento" | ✅ | 6 file riferimento elencati nel prompt CLI kickoff |
| 15 | "principio zero" | ✅ | Sez REGOLE FERREE punto 1 + test enforcement + ADR-003 verify live |
| 16 | "onestà brutale" | ✅ | Regola 10 + auditor brutal + zero inflation manifesto |
| 17 | "imparare dagli errori commessi" | ✅ | Sez LESSONS LEARNED 18 anti-pattern (6 process + 9 technical + 3 hygiene) |

### Gap identificati (onesti)

**Zero gap identificati**. Tutti 17 requisiti Andrea coperti esplicitamente.

### Contenuto verificato

- 8 stories deliverable ✅
- 43 task atomic ✅
- DoD per ogni story ✅
- Acceptance Criteria sprint-wide ✅
- Test strategy 4 categorie ✅
- File nuovi lista completa ✅
- Deliverable documenti lista ✅
- Credenziali status ✅
- LOOP 20-step ✅
- Stop conditions ✅
- Prompt CLI kickoff self-contained ✅

**Sprint 2 prompt PRONTO per lun 28/04 kickoff.**

---

## Firma

**Autore**: Andrea Marro + Claude Opus 4.7 (Harness 2.0 paradigm)
**Data creazione**: 2026-04-21
**Sprint target**: lun 28/04/2026 → dom 04/05/2026
**Versione**: 2.0 (rifocalizzato Stabilize V2 senza Hetzner/RunPod)
**Stack**: Together AI + Supabase Edge + Vercel AI SDK (ZERO infra nuova)
