# Handoff iter 37 → iter 38 — Sprint T close finale projection 9.5/10 ONESTO

**Date**: 2026-04-30 PM (post Phase 1 4/4 barrier reached + Documenter Phase 2 sequential)
**Branch**: `e2e-bypass-preview`
**HEAD pre-Phase-3**: TBD (Phase 3 orchestrator commit + push)
**Iter 37 score ONESTO**: **8.0/10** (G45 cap PDR §4 R5 latency mechanical rule enforced)
**Iter 38 target Sprint T close**: **9.5/10 ONESTO** conditional Opus indipendente review
**Pattern**: Pattern S r3 4-agent OPUS PHASE-PHASE r2 (race-cond fix VALIDATED 9th iter consecutive)

---

## §1 ACTIVATION STRING iter 38 paste-ready

```
Esegui PDR-B iter 38 in `docs/pdr/PDR-ITER-38-*.md` (creare prossima sessione).
Spawn Pattern S r3 4-agent OPUS PHASE-PHASE (Maker-1 + Maker-2 + WebDesigner-1 + Tester-1) + Documenter Phase 2 sequential post 4/4 completion barrier.
Pre-flight CoV iter 38 entrance: vitest 13338+ baseline preserve + build PASS + Edge Function unlim-chat v50 LIVE verify + Mac Mini cron mapping log delta.
Andrea ratify queue iter 38 entrance (12+2 voci dedup): Vision Gemini Flash deploy + 5 missing lesson-paths + harness STT live smoke env + R6/R7 runners build + Onniscenza Deno port 62-tool + canary 5%→25%→100% rollout per ADR-028 §7.
Anti-inflation G45 cap 9.5 (Sprint T close target ONESTO Opus indipendente review). Anti-regressione vitest 13338+ NEVER scendere. NO --no-verify mai. NO push main. NO debito tecnico.
P0 atoms iter 38: Onnipotenza Deno port 62-tool subset (highlight + mountExperiment + captureScreenshot server-safe) + R6+R7 runners author + R5 stable v50 re-run + 92 esperimenti audit completion + linguaggio codemod 200 violations + Vol3 narrative refactor (ADR-027 Davide co-author) + WelcomePage gate Playwright spec refactor + Lighthouse ChatbotOnly + EasterModal verify.
Bench mandatory: R5 stable v50 avg <2424ms re-baseline + R6 recall@5 ≥0.55 + R7 INTENT exec ≥80%.
Activation iter 39 in audit close §7. Sprint T close iter 38 target 9.5/10 ONESTO Opus indipendente review.
```

---

## §2 Setup steps Andrea (5-10 min)

### Ratify queue iter 38 entrance (in ordine):

1. **Vision Gemini Flash deploy ratify** (~5 min):
   - SUPABASE_ACCESS_TOKEN env required
   - Comando: `SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy unlim-vision --project-ref euqpdueopmlllqjmqnyb`
   - Verify: Pixtral 12B Italian K-12 evaluation framework live + Gemini Flash fallback chain

2. **R5 stable v50 re-run** (~5 min Andrea trigger):
   - Comando: `node scripts/bench/run-sprint-r5-stress.mjs --fixture-path scripts/bench/r5-fixture.jsonl`
   - Env required: SUPABASE_ANON_KEY + ELAB_API_KEY + VITE_SUPABASE_EDGE_KEY
   - Output: clean R5 measurement post v50 stabilize (no v49 mix)
   - Expected delta: lift -25% vs iter 32 6800ms p95 baseline = ~3000-3500ms

3. **Migration apply iter 31 carryover** (~3 min):
   - Comando: `npx supabase migration list --linked`
   - Verify: 4/4 applied (`001`, `20260426152944`, `20260426152945`, `20260426160000`)
   - Iter 31 status: SYNC complete (CLAUDE.md iter 31-32 close confirms)

4. **Vercel deploy verify post key rotation iter 32** (~3 min):
   - Apri https://www.elabtutor.school in browser
   - Hard refresh CMD+Shift+R per bypass PWA SW cache
   - Verifica HomePage A13b ChatbotOnly route accessibile via `#chatbot-only` hash
   - Verifica EasterModal route accessibile via `#about-easter` hash

5. **Mac Mini cron LIVE verify iter 38 entrance** (~2 min):
   - Comando: `ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'crontab -l | grep iter36-cron.log | wc -l'`
   - Expected: 4 entries
   - Verify L1 cycles ≥98% PASS, L2 cycles ≥90% PASS, L3 cycles ≥80% PASS post iter 37 deploy refresh keys

---

## §3 Iter 38 priorities P0 (cascade target Sprint T close 9.5/10)

| # | Priorità | Owner | Time est. | Score impact |
|---|----------|-------|-----------|--------------|
| **P0.1** | **R6 + R7 runners build (Tester-1 NEW iter 38)** | Tester-1 | 4-5h totale (R6 2-3h + R7 1.5h) | +0.10 quality gates (recall@5 ≥0.55 + INTENT exec ≥80%) |
| **P0.2** | **Onnipotenza Deno port 62-tool subset** (highlight + mountExperiment + captureScreenshot server-safe) | Maker-1 | 6-8h | +0.15 Box 14 INTENT exec end-to-end ceiling 1.0 |
| **P0.3** | **Canary 5%→25%→100% rollout per ADR-028 §7** | Andrea + Maker-1 phased | 1-2h orchestration | +0.10 Box 11 Onniscenza 0.8→0.9 |
| **P0.4** | **92 esperimenti audit completion** (Andrea iter 21+ carryover, Sprint T close gate, broken Playwright UNO PER UNO sweep kit fisico mismatch + componenti mal disposti + non-funzionanti) | Maker-1+Tester-1+Andrea coordination | 8-12h | +0.20 quality (Sprint T close mandate) |
| **P0.5** | **Linguaggio codemod 200 violations singolare→plurale** (Andrea iter 21 mandate, imperative singolare → plurale "Ragazzi", codemod) | Maker-1 | 3-4h | +0.10 PRINCIPIO ZERO compliance |
| **P0.6** | **Vol3 narrative refactor** (ADR-027 Davide co-author iter 33+ deferred, Andrea ODT sostituto Vol3 disponibile `/tmp/manuale-vol3-iter37.txt` 4389 righe) | Maker-1+Davide co-author session | 4-5h | +0.10 narrative coherence |
| **P0.7** | **A9 2/7 deferred experiments-vol3.js companion** (`v3-cap7-mini, v3-cap8-serial`) | Maker-1 sub-task | ~2h | +0.05 esperimenti completion 92→94 |
| **P0.8** | **Playwright specs WelcomePage gate refactor** (Tester-1 4/4 timeout iter 37 — `03-fumetto-flow` + `04-lavagna-persistence`) | Maker-1 spec rewrite | ~1h | +0.05 E2E gate close |
| **P0.9** | **Build pre-flight CoV iter 38 entrance + post-iter-37 verify** | Orchestrator | ~14min build + 5 min verify | gate, 0 (mandatory iter 38 entrance) |
| **P0.10** | **Lighthouse score ChatbotOnly + EasterModal** (defer iter 37 acceptance gate ≥90 perf + ≥95 a11y + ≥100 SEO) | WebDesigner-1 + Tester-1 verify | 1h | +0.05 A6 acceptance gate close |

**Subtotal P0 iter 38 lift potential**: +0.95 ONESTO → iter 37 8.0 + 0.95 lift = **8.95/10 raw** → target 9.5/10 ONESTO conditional Opus indipendente review G45 mandate (NOT auto-claim).

**Sprint T close iter 38 mandate G45**: NO claim 9.5/10 senza Opus indipendente review. Score raw projection 8.95-9.5 conditional execution all 10 lift items + cap re-evaluation post bench R5 stable v50 + R6 + R7 measured.

---

## §4 Pre-flight CoV iter 38 entrance gate

Andrea + orchestrator MUST verify iter 38 entrance:

```bash
# 1. Vitest baseline preserve
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npx vitest run --reporter=basic | tail -5
# Expected: Tests 13338+ passed | 15 skipped | 8 todo

# 2. Build PASS (mandatory iter 38 entrance, deferred iter 37 Phase 1)
npm run build
# Expected: ✓ dist/sw.js + workbox-* + 32+ precache entries
# Time est: ~14min heavy (obfuscation + esbuild CSS warnings non-fatal)

# 3. Edge Function unlim-chat v50 LIVE verify
SUPABASE_ACCESS_TOKEN=$(grep "^export SUPABASE_ACCESS_TOKEN" ~/.zshrc | cut -d'=' -f2 | tr -d '"\047')
SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase functions list --project-ref euqpdueopmlllqjmqnyb | grep unlim-chat
# Expected: unlim-chat v50 ACTIVE (deployed iter 37 Maker-1)

# 4. LLM_ROUTING_WEIGHTS env verify 70/20/10 active
SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase secrets list --project-ref euqpdueopmlllqjmqnyb | grep LLM_ROUTING_WEIGHTS
# Expected: LLM_ROUTING_WEIGHTS exists (Andrea Phase 0 ratify ADR-029 ACCEPTED active prod)

# 5. Mac Mini cron LIVE
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'crontab -l | grep iter36-cron.log | wc -l'
# Expected: 4 entries

# 6. Andrea ratify queue verify
cat docs/handoff/2026-04-30-iter-37-to-iter-38-handoff.md | grep -A20 "ratify queue"
# Expected: Vision Gemini deploy + 5 missing lesson-paths + harness STT + R6/R7 + canary

# 7. Branch + uncommitted state
git status --short | head -30
git log --oneline -10
# Expected: e2e-bypass-preview branch + iter 37 batch commit Phase 3 orchestrator pending
```

Se ANY fail → REVERT iter 38 spawn → diagnose + fix → re-entrance.

---

## §5 Andrea ratify queue updated iter 38 (12+2 voci dedup)

| # | Voce | Iter origin | Deadline | Time | Note |
|---|------|-------------|----------|------|------|
| 1 | ADR-025 Modalità 4 simplification | iter 19 PROPOSED | iter 22 (carryover) | ~3 min | iter 26 implementato canonical, ratify formale pending |
| 2 | ADR-026 content-safety-guard runtime | iter 19 PROPOSED | iter 22 (carryover) | ~3 min | 10 rules runtime, ENABLE_CONTENT_SAFETY_GUARD env flag |
| 3 | ADR-027 volumi narrative refactor schema | iter 19 PROPOSED | iter 25 (carryover) | ~5 min | Davide co-author + ratify, Andrea ODT sostituto disponibile iter 37 |
| 4 | ADR-028 INTENT dispatcher | iter 36 NEW | iter 37 entrance | DONE | **iter 37 PATH 1 ratify ACCEPTED + §14 surface-to-browser amend** |
| 5 | ADR-029 LLM_ROUTING 70/20/10 | iter 37 NEW | iter 37 entrance | DONE | **iter 37 ACCEPTED active prod env-only** |
| 6 | Vision Gemini Flash deploy | iter 36 carryover | iter 37 → iter 38 | ~5 min | Atom A2 iter 37 deferred Andrea SUPABASE_ACCESS_TOKEN env |
| 7 | 5 missing lesson-paths reali audit | iter 36 (Mac Mini D3) | iter 37 → iter 38 | 2-3h | iter 37 PARTIAL — 5/7 mapped + 2/7 deferred (Maker-1 §4 caveat) |
| 8 | HomePage A13b chatbot-only route | iter 36 P0.7 | iter 37 → iter 38 Lighthouse only | DONE iter 37 | **1749 LOC + 26/26 PASS shipped** + Lighthouse defer iter 38 P0.10 |
| 9 | Wake word "Ragazzi" plurale prepend | iter 36 carryover | iter 37 entrance | 5 min | Maker-1 deferred iter 37 P0.6 — iter 38 fix |
| 10 | Marketing PDF compile + PowerPoint Giovanni Fagherazzi | iter 31 PM mandate | DEADLINE 30/04 manuale Andrea | n/a | Andrea-only action, status pending |
| 11 | Vercel frontend deploy verify post key rotation | iter 32 carryover | iter 33+ | 5 min | iter 37 NOT verified, ongoing |
| 12 | PWA SW Workbox prompt-update pattern | iter 36 carryover | iter 37 → iter 38 | 2h | autoUpdate vs prompt decision required |
| 13 | 92 esperimenti audit completion | iter 21+ Andrea mandate | Sprint T close gate iter 38 | 8-12h coordination | Maker-1+Tester-1+Andrea broken Playwright UNO PER UNO sweep |
| **14 NEW iter 37** | **Harness STT live smoke + R6/R7 runners build** | **iter 37 PARTIAL deferred** | **iter 38 P0** | **3-4h totale** | **A4 live verify env + R6 author 2-3h + R7 author 1.5h** |
| **15 NEW iter 37** | **A9 2/7 deferred experiments-vol3.js companion** | **iter 37 PARTIAL deferred** | **iter 38 P0 sub-task** | **~2h** | **v3-cap7-mini + v3-cap8-serial drafts ready Maker-1 §6** |
| **16 NEW iter 37** | **ADR-028 §3 Context "62-tool registry" sync to 57-tool** | **iter 37 ToolSpec count definitive resolution** | **iter 38** | **~5 min** | **Documenter audit §3 resolved 57 entries definitive vs 62 doc claim drift** |
| **17 NEW iter 37** | **Canary 5%→25%→100% rollout per ADR-028 §7** | **iter 37 ratify ACCEPTED** | **iter 38 P0.3** | **1-2h orchestration phased** | **Andrea + Maker-1 phased rollout post Onnipotenza Deno port** |

**Subtotal pending iter 38 entrance**: 13 voci to clear iter 38 P0/P1 (1+2+3+6+7+9+10+11+12+13+14+15+16+17 = 14 active items, 2 DONE iter 37 marked).

---

## §6 Cross-link docs iter 37

### ADR amendments

- `docs/adrs/ADR-028-onnipotenza-intent-dispatcher-server-side.md` — §14 surface-to-browser amend +60 LOC + status PROPOSED→ACCEPTED iter 37 (Maker-2 + orchestrator inline apply post BG agent return blueprint)
- `docs/adrs/ADR-029-llm-routing-weights-conservative-tune.md` — NEW 207 LOC ACCEPTED active prod env-only (Andrea Phase 0 ratify Question 2)

### Audit docs

- `docs/audits/2026-04-30-iter-37-PHASE3-CLOSE-audit.md` — this iter 37 close audit (~520 LOC, 13 sezioni)
- `docs/audits/iter-37-stt-fix-rationale.md` — Maker-1 A4 STT 3-shape decision doc + risks (116 LOC)
- `docs/audits/iter-37-evidence/` — Tester-1 Playwright 4 specs evidence dir (4 sub-dirs, screenshots + traces + error-context)

### Handoff docs

- `docs/handoff/2026-04-30-iter-36-to-iter-37-handoff.md` — iter 36 close handoff (264 LOC, ratify queue + P0 priorities)
- `docs/handoff/2026-04-30-iter-37-to-iter-38-handoff.md` — this handoff (~250 LOC)

### Phase 1 completion msgs (filesystem barrier)

- `automa/team-state/messages/maker1-iter37-phase1-completed.md` (240 LOC)
- `automa/team-state/messages/maker2-iter37-phase1-completed.md` (42 LOC)
- `automa/team-state/messages/tester1-iter37-phase1-completed.md` (206 LOC)
- `automa/team-state/messages/webdesigner1-iter37-phase1-completed.md` (184 LOC)

### Andrea ratify confirms

- `automa/team-state/messages/andrea-ratify-adr028-CONFIRMED.md` — Andrea ratify PATH 1 + LLM_ROUTING 70/20/10 ACTIVE prod
- `automa/team-state/messages/orchestrator-iter37-START.md` — orchestrator iter 37 task assignments

### Documenter Phase 2 completion

- `automa/team-state/messages/documenter-iter37-phase2-completed.md` — this completion msg (post audit + handoff + CLAUDE.md APPEND)

### CLAUDE.md APPEND

- `CLAUDE.md` — Sprint T iter 37 close section APPEND ~150 LOC (post iter 36 close section, before next sprint)

---

## §7 Sprint T close projection iter 38 (9.5/10 ONESTO target)

**Target Sprint T close iter 38**: 9.5/10 ONESTO conditional Opus indipendente review G45 mandate. NOT auto-claim.

**10 lift items P0 iter 38** (cascade execution chain):

1. R6 + R7 runners build + exec → +0.10 quality gates
2. Onnipotenza Deno port 62-tool subset → +0.15 Box 14 ceiling 1.0
3. Vision Gemini Flash deploy → +0.10 Box 7 0.75→0.85
4. R5 stable v50 re-run → +0.05 G45 R5 cap re-baseline
5. 92 esperimenti audit completion → +0.20 quality Sprint T close mandate
6. Linguaggio codemod 200 violations → +0.10 PRINCIPIO ZERO compliance
7. Vol3 narrative refactor (ADR-027 Davide co-author) → +0.10 narrative coherence
8. Canary 5%→25%→100% rollout per ADR-028 §7 → +0.10 Box 11 Onniscenza 0.8→0.9
9. WelcomePage gate Playwright spec refactor → +0.05 E2E gate close
10. Lighthouse ChatbotOnly + EasterModal verify → +0.05 A6 acceptance gate close

**Subtotal lift iter 38**: +0.95 ONESTO → iter 37 8.0 + 0.95 lift = **8.95-9.5/10 raw** → target Sprint T close 9.5/10 ONESTO conditional Opus indipendente review G45 mandate.

**Anti-regressione mandate iter 38+ enforced**:
- vitest 13338 NEVER scendere (post Phase 1 baseline iter 37)
- Build NEVER skip pre-commit (iter 38 P0 mandatory build PASS verify)
- Pre-push NEVER bypass `--no-verify` (anti-debt mandate)
- NO claim 9.5/10 senza Opus indipendente review

---

## §8 Plugin + connettori critici iter 38 (continuità iter 37)

| Categoria | Tool primario | Uso atoms iter 38 |
|-----------|---------------|--------------------|
| Browser | `mcp__Claude_in_Chrome__*` + `mcp__Control_Chrome__*` | P0.8 Playwright spec refactor + P0.10 Lighthouse verify |
| Testing | `mcp__plugin_playwright_playwright__*` | P0.4 92 esperimenti audit + P0.10 Lighthouse |
| Deploy | `mcp__57ae1081-...__deploy_to_vercel` Vercel MCP | P0.9 build verify + post-build deploy |
| Supabase | `npx supabase functions deploy` + `secrets set` CLI | P0.2 Onnipotenza Deno port + P0.3 canary rollout |
| Debug | `/superpowers:systematic-debugging` `/agent-teams:team-debug` `/parallel-debugging` | P0.4 92 esperimenti broken sweep |
| Memory | `/claude-mem:mem-search` `/claude-mem:timeline` | Documenter Phase 2 historical context |
| Web research | `/firecrawl` `WebSearch` | P0.5 linguaggio codemod patterns |
| Architecture | `/feature-dev:code-architect` `/superpowers:writing-plans` | P0.2 Onnipotenza Deno port + P0.6 Vol3 refactor schema |
| Anti-inflation | `/superpowers:verification-before-completion` `node scripts/benchmark.cjs --write` | Phase 3 score cap G45 + Opus indipendente review |
| GitHub | `mcp__plugin_engineering_github__*` `gh` CLI | iter close commit + PR + push origin |
| Mac Mini | SSH `progettibelli@100.124.198.59` + `~/.ssh/id_ed25519_elab` + `elab-macmini-controller` skill | L1+L2+L3 cron continue + D2+D3 retries |
| Bench scoring | `scripts/bench/score-unlim-quality.mjs` 12 PZ rules | P0.1 R6+R7 runners + P0.4 92 esperimenti |
| Telemetry | `mcp__plugin_posthog_*` `mcp__plugin_sentry_*` | Edge Function metrics dashboard canary rollout |

---

## §9 Output finale iter 38 (target Sprint T close)

A fine sessione iter 38 `docs/handoff/2026-04-XX-iter-38-to-NEXT-SPRINT-handoff.md` DEVE contenere:

1. ✅ Score G45 ricalibrato (9.5 target ONESTO post Opus indipendente review)
2. ✅ 10 P0 atoms delivery matrix (file system verified)
3. ✅ ≤2 honesty caveats critical (residui post Sprint T close)
4. ✅ SPRINT_T_COMPLETE 14 boxes status delta vs iter 37 (target 13/14 box ≥0.9)
5. ✅ Mac Mini mapping log delta + L3 cycles count post-deploy
6. ✅ Iter 39+ priorities (next sprint preview, post Sprint T close)
7. ✅ ACTIVATION STRING iter 39+ paste-ready
8. ✅ Andrea ratify queue updated (residui post Sprint T close <5 voci)

**NO inflation. NO compiacenza. G45 cap 9.5 enforced. Anti-regressione FERREA. NO debito tecnico.**

---

**Status**: PROPOSED iter 38 ready spawn post Andrea ratify queue clearance + pre-flight CoV gate. Cascade target Sprint T close 9.5/10 ONESTO conditional Opus indipendente review (G45 mandate).
