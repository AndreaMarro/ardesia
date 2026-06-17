# PDR ITER 37 — Latency Lift + Deploy Verify + Iter 36 Carryover

**Data**: 2026-04-30 PM finale (post iter 36 close commits f9628c1+849f6bf+commit-3-pending)
**Branch**: `e2e-bypass-preview`
**Pattern**: Pattern S r3 4-agent OPUS PHASE-PHASE (ridotto da 7 iter 36 — atom A13b chatbot-only solo + latency tune + Andrea ratify queue)
**Anti-inflation G45**: score cap 9.0/10 (cascade target post iter 36 8.5)
**Anti-regressione**: vitest 13260 PASS NEVER scendere, build PASS NEVER skip, pre-push hook NEVER bypass `--no-verify`
**Mandate Andrea**: NO debito tecnico accumulato — ogni atom DEVE chiudere gap o flag iter 38

---

## §0 — PRINCIPIO ZERO + MORFISMO compliance gate (invariato iter 36)

Reference: CLAUDE.md "DUE PAROLE D'ORDINE" §1+§2.

Gate compliance check ogni atom (PDR iter 36 §0):
1. ✅ Linguaggio plurale "Ragazzi," + Vol/pag verbatim ≤60 parole + analogia
2. ✅ Kit fisico mention ogni response/tooltip/empty state
3. ✅ Palette tokens Navy/Lime/Orange/Red (NO hard-coded hex)
4. ✅ Iconografia ElabIcons (NO material-design generic)
5. ✅ Morphic runtime (NO static config)
6. ✅ Cross-pollination Onniscenza L1+L4+L7 minimum
7. ✅ Triplet coerenza kit Omaric SVG identico
8. ✅ Multimodale Voxtral voice clone Andrea + Vision Pixtral EU + STT (FIX iter 37 P0.X)

Anti-inflation G45 + Anti-pattern rejection automatica (Test Morfismo `.impeccable.md`).

---

## §1 — Goal imperativo iter 37

A fine sessione TUTTI questi DEVONO essere VERIFIED LIVE prod:

1. ✅ ADR-028 Andrea ratify YES + Edge Function `unlim-chat` redeploy con Atom A1 INTENT parser (post-LLM `intents_parsed` surface to browser)
2. ✅ ADR-028 §14 amend (Maker-2): server-side dispatch → surface-to-browser pivot documentation correction
3. ✅ Vision deploy verify Gemini Flash fallback chain (Pixtral primary preserved, Gemini ELAB key as fallback)
4. ✅ Latency p95 chat <4s warm (iter 36 measured 5191ms → target <3000ms post tune)
5. ✅ STT CF Whisper format fix (Voxtral Ogg Opus → CF Whisper Turbo input pipeline iter 33+ deep bug)
6. ✅ HomePage Atom A13b (Chatbot-only route + Cronologia ChatGPT-style + Easter modal full)
7. ✅ Wake word "Ehi UNLIM" mic permission auto-warm-up (iter 36 partial fix Ragazzi prepend, iter 37 UX flow)
8. ✅ 5+2=7 missing esperimenti REAL Vol3 (D3 finding) Davide co-author session 1h + Maker-1 gen-app
9. ✅ ToolSpec count definitivo 57 vs 62 verify (file-system grep correct pattern + sync docs)
10. ✅ R5+R6+R7 bench scale post-tune (R5 2424ms→target ~1500ms avg + R7 200-prompt INTENT exec ≥80%)

**Score iter 37 target ONESTO G45 cap 9.0/10** (cascade iter 36 8.5 + 0.5 lift).

---

## §2 — Team 4-agent OPUS orchestrato (ridotto da 7 iter 36)

| Ruolo | Agent type | File ownership | Tools/skills |
|-------|------------|----------------|--------------|
| **Maker-1 (gen-app)** | `backend-development:backend-architect` | `supabase/functions/**`, `src/services/**` | latency tune + STT fix + Edge deploy |
| **Maker-2 (architect)** | `feature-dev:code-architect` (READ + Write per ADR amend) | `docs/adrs/**`, READ-ONLY src/ | ADR-028 §14 amend + ADR-029 latency tune doc |
| **WebDesigner-1 (UI/UX)** | `application-performance:frontend-developer` | `src/components/HomePage.jsx`, `src/components/chatbot/**` NEW | A13b Chatbot-only + Cronologia + Easter modal |
| **Tester-1 (E2E + bench)** | `agent-teams:team-debugger` | `tests/e2e/**`, `tests/integration/**`, `scripts/bench/**` | R5+R6+R7 bench prod exec + Playwright A7+A8 verify |

**Documenter Phase 2 sequential**: `general-purpose` agent (Write+Bash tools confermato necessario) → audit + handoff + activation iter 38 + CLAUDE.md append.

**Inter-agent**: filesystem barrier `automa/team-state/messages/{agent}-iter37-phase1-completed.md`. Phase 2 spawn POST 4/4 completion verified.

**Mac Mini autonomous H24** (continua iter 36): cron L1+L2+L3+aggregator LIVE 4 entries. Iter 37 entrance: refresh env keys post Andrea ratify deploy.

---

## §3 — Atomi imperativi (10 ATOM-S37)

### Atom A1 — Maker-1 — LLM_ROUTING_WEIGHTS tune 80/15/5 (P0 latency)

**File**: Supabase secret `LLM_ROUTING_WEIGHTS` env update (NO code change)

**Spec**:
```bash
SUPABASE_ACCESS_TOKEN=$(grep "^export SUPABASE_ACCESS_TOKEN" ~/.zshrc | cut -d'=' -f2 | tr -d '"\047') && \
echo '{"mistral_small":0.80,"mistral_large":0.15,"mistral_tiny":0.05}' | \
SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase secrets set LLM_ROUTING_WEIGHTS=- --project-ref euqpdueopmlllqjmqnyb
```

**Acceptance**: R5 50-prompt latency avg 2424ms → ~1500ms (-37%) target post tune. Mistral Small dominante = ~1s vs Large ~3s.

**Risk**: Mistral Small quality drop su deep_question + safety_warning. Mitigation: test post-tune bench R5 → se quality <85% PZ V3 rollback 65/25/10.

**Time**: 30 min (env set + R5 bench + verify quality preserve).

---

### Atom A2 — Maker-1 — ENABLE_ONNISCENZA conditional (P0 latency)

**File**: `supabase/functions/_shared/onniscenza-bridge.ts` + `unlim-chat/index.ts`

**Spec**: ENABLE_ONNISCENZA env flag → conditional logic:
- IF prompt classification = `chit_chat` (greeting + off-topic short) → skip onniscenza inject (save ~500-1000ms)
- IF prompt classification = `deep_question` + `safety_warning` → keep onniscenza top-3 RRF
- IF prompt classification = `citation_vol_pag` + `plurale_ragazzi` → onniscenza top-2 (reduce vs top-3)

**Detection**: simple regex pre-LLM (NO LLM call): word count <8 + greeting tokens ("ciao", "salve", "grazie") = chit_chat.

**Acceptance**: R5 chit_chat latency 1825ms → ~800ms (-56%); deep_question 3256ms preserve.

**Time**: 1h Maker-1.

---

### Atom A3 — Maker-2 — ADR-028 §14 surface-to-browser amend (P0)

**File**: `docs/adrs/ADR-028-onnipotenza-intent-dispatcher-server-side.md` MODIFY

**Spec**: Update §14 implementation block reflect iter 36 Maker-1 pivot (server-side parse + surface `intents_parsed: IntentTag[]` to browser, NOT server-side dispatchTool execution).

```typescript
// AMEND §14 (replace existing):
// Server-side INTENT parser shipped iter 36 (intent-parser.ts 270 LOC).
// Server-side dispatchTool execution DEFERRED iter 38 (62-tool registry
// resolves __ELAB_API browser context only — Deno port heavy work).
// Iter 36 compromise: parser surfaces intents_parsed array to browser.
// Browser useGalileoChat.js iterates + dispatches via __ELAB_API.
```

**Time**: 30 min.

---

### Atom A4 — Maker-1 — STT CF Whisper format fix (P0 carryover iter 33+)

**File**: `supabase/functions/_shared/cloudflare-client.ts` `cfWhisperSTT`

**Spec**: Voxtral output Ogg Opus codec rejected by CF Whisper Turbo 2026 (`AiError: Invalid input`). Need:
1. Investigate CF Whisper accepted formats current (curl docs API)
2. Convert Voxtral Ogg Opus → WAV/PCM 16kHz before forward CF
3. OR detect format + reject Voxtral output STT (unlikely user case — typically mic input WebM/PCM)
4. OR replace CF Whisper Turbo with Mistral Voxtral STT (if Voxtral has STT capability iter 37 verify)

**Acceptance**: STT smoke 200 OK with Voxtral output round-trip.

**Time**: 2-3h Maker-1.

---

### Atom A5 — Maker-1 — Edge Function `unlim-chat` redeploy iter 36 A1 parser

**Pre-flight**: Andrea ratify ADR-028 YES.

**Spec**:
```bash
SUPABASE_ACCESS_TOKEN=$(grep "^export SUPABASE_ACCESS_TOKEN" ~/.zshrc | cut -d'=' -f2 | tr -d '"\047') && \
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && \
SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb
```

**Acceptance**:
- unlim-chat version v48 → v49 deployed
- Smoke 1 chat call con [INTENT:{...}] LLM response → verify `intents_parsed` array surface in JSON response
- Browser frontend `useGalileoChat.js` consume `intents_parsed` + dispatch via `__ELAB_API` (iter 37 frontend wire-up Atom B-NEW)

**Time**: 5 min deploy + 30 min smoke verify.

---

### Atom A6 — WebDesigner-1 — HomePage Atom A13b (Chatbot-only route + Cronologia + Easter)

**File**: 
- NEW `src/components/chatbot/ChatbotOnly.jsx` ~600 LOC (per PDR iter 36 §3 A13 spec)
- NEW `src/components/easter/EasterModal.jsx` ~150 LOC (4 GIF rotation + banana mode CSS)
- MODIFY `src/components/HomePage.jsx` (#chatbot-only + #about-easter route hooks)

**Spec scope iter 37** (8h heavy):
- Sidebar Cronologia ChatGPT-style: sezioni Oggi/Ieri/Settimana/Più vecchie + per sessione UNLIM-generated description (existing `unlim-session-description` Edge Function iter 35) + badge stato (sospesa/cap/vecchia)
- Main chat panel: `useGalileoChat` hook + Onniscenza wired + chatbot UI (no Lavagna actions per `?ui=chatbot` flag)
- Tools palette right 5 button: 📷 Vision + ⚙️ Compile + 📔 Fumetto + 🎨 Lavagna mini + 🔄 Reset
- Easter modal: 4 random scimpanzè memes rotation `public/easter/scimpanze-{1,2,3,4}.gif` + 5-click banana mode unlock

**Andrea action**: 4 scimpanzè GIF placeholder in `public/easter/` (download Andrea-curated o use generic memes).

**Acceptance**: Lighthouse score ≥90 perf + ≥95 a11y + ≥100 SEO.

**Time**: 6-8h WebDesigner-1.

---

### Atom A7 — Tester-1 — R5+R6+R7 bench scale post-tune

**File**: `scripts/bench/run-sprint-r{5,6,7}-stress.mjs` (existing)

**Spec**:
- R5 50-prompt re-run post LLM_ROUTING tune → measure delta vs iter 36 (avg 2424ms → target <1500ms)
- R6 100-prompt RAG-aware bench (existing fixture iter 8) → measure recall@5 + Hybrid RAG quality
- R7 200-prompt INTENT bench → verify ≥80% executed correctly post Edge deploy iter 37

**Acceptance**:
- R5 PASS verdict ≥85% PZ V3 score post tune
- R6 recall@5 ≥0.55 baseline
- R7 INTENT exec rate ≥80%

**Time**: 30 min bench R5 + 1h R6 + 1.5h R7 = 3h Tester-1.

---

### Atom A8 — Tester-1 — Playwright E2E A7+A8 prod execute (iter 36 carryover)

**File**: `tests/e2e/03-fumetto-flow.spec.js` + `tests/e2e/04-lavagna-persistence.spec.js` (NEW iter 36, NOT executed)

**Spec**:
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && \
npx playwright install chromium && \
npx playwright test tests/e2e/03-fumetto-flow.spec.js tests/e2e/04-lavagna-persistence.spec.js \
  --reporter=line --output-dir=docs/audits/iter-37-evidence/
```

**Acceptance**:
- 4/4 specs PASS prod
- Screenshots evidence in `docs/audits/iter-37-evidence/`
- Bug 2 Lavagna persistence verified live + Atom A7 Fumetto regression verified

**Time**: 30 min Tester-1.

---

### Atom A9 — Maker-1 (Davide co-author) — 7 missing esperimenti reali

**File**:
- NEW `src/data/lesson-paths/v3-cap6-{morse,semaforo}.json` + `v3-cap7-mini.json` + `v3-cap8-serial.json` + `v3-extra-{lcd-hello,servo-sweep,simon}.json`
- MODIFY `src/data/volume-references.js` (+7 entries con bookText verbatim Davide-sourced)
- MODIFY `docs/data/volume-structure.json` (+7 specialty/extra catalog)

**Andrea coordination**: Davide co-author session 1h fornisce bookText Vol3 cap6+7+8 + extras (specialty MAX7219 morse/semaforo/serial + bonus capstone LCD/servo/simon).

**Acceptance**:
- 87+7=94 esperimenti con lesson-path + volume-reference + structure entry
- harness 87 → 94 entries (regex update `v[0-9]-cap[0-9]+-(esp|specialty|extra)-[a-z0-9-]+`)
- CLAUDE.md "92 esperimenti" → "94 esperimenti (87 core + 7 extra/specialty Vol3)" sync

**Time**: 1h Davide bookText + 2.5h Maker-1 JSON impl = 3.5h.

---

### Atom A10 — Documenter — ToolSpec count definitivo + iter 37 audit + handoff iter 38

**File**:
- `docs/audits/2026-04-30-iter-37-PHASE3-CLOSE-audit.md` NEW ~400 LOC
- `docs/handoff/2026-04-30-iter-37-to-iter-38-handoff.md` NEW ~250 LOC
- CLAUDE.md APPEND iter 37 section ~150 LOC

**Spec**:
- Definitive ToolSpec count: `grep -cE '^\s+(name|id):' scripts/openclaw/tools-registry.ts`
- Sync docs CLAUDE.md + ADR-028 + Maker-1 completion msg per ToolSpec count finale (57/62/altro)
- Iter 38 priorities preview (Sprint T close target 9.5/10)
- Activation string iter 38 paste-ready

**Time**: 2h Documenter (post 4/4 Phase 1 barrier).

---

## §4 — Anti-inflation benchmark obbligatorio (G45)

| Metrica | Pre iter 37 (iter 36 close) | Target iter 37 ONESTO | Misurazione |
|---------|----------------------------|----------------------|-------------|
| vitest PASS | 13260 | ≥13270 (+10 NEW STT fix tests + chatbot route tests) | `npx vitest run` |
| Build | PASS dist/sw.js + 32 precache | PASS <14min | `npm run build` |
| R5 50-prompt PZ V3 avg latency | 2424ms | <1500ms post tune | bench R5 |
| R5 50-prompt p95 latency | 5191ms | <3000ms post tune | bench R5 |
| R5 PZ V3 verdict | PASS ≥85% | PASS ≥85% (preserve) | scorer 12 rules |
| R6 100-prompt recall@5 | not measured iter 36 | ≥0.55 baseline | bench R6 |
| R7 200-prompt INTENT exec | 0% (parser shipped, dispatch deferred) | ≥80% (post Edge deploy + browser wire-up) | bench R7 |
| Vision Pixtral latency | 1479ms | preserve | curl smoke |
| TTS Voxtral latency | 3632ms | preserve | curl smoke |
| ImageGen FLUX latency | 818ms | preserve | curl smoke |
| STT CF Whisper | HTTP 500 (iter 33+ deep bug) | HTTP 200 PASS | smoke + bench |
| Bug Andrea ≤2 unresolved | 5 carryover | ≤2 (STT + Compile server unresolved expected) | audit |
| ToolSpec count | 57 vs 62 drift | definitive verified | grep |

**Score formula** iter 37 (10 atoms × 1.0 = 10.0 max, G45 cap 9.0):
```
score = (atoms_passed / 10) * 8.0 + (boxes_lifted / 13) * 1.5 + bonus_anti_inflation_max_0.5
```

**Cap conditions**:
- vitest <13260 → cap 7.5 (regression block)
- Build FAIL → cap 6.0
- 4+ atoms blocked → cap 7.0
- R5 latency >2424ms post-tune → cap 8.0 (regression latency)
- Score raw >9.0 → G45 cap 9.0 (Opus indipendente review needed)

---

## §5 — Anti-regressione FERREA (invariata)

1. **vitest baseline 13260** PASS — pre-commit hook ENFORCES delta. `git commit --no-verify` PROIBITO iter 37 (anti-debt mandate).
2. **Pre-push hook**: build PASS — bypass vietato.
3. **Branch protection**: NO push `main`. Solo `e2e-bypass-preview` + PR.
4. **Snapshot baseline**: `git tag iter-37-phase-{0,1,2,3}-HHMM`.
5. **Stash + verify**: se test scendono `git stash && npx vitest run` — se passa, bug iter 37, REVERT.
6. **Critical files lock**: `scripts/guard-critical-files.sh` blocca CircuitSolver/AVRBridge/PlacementEngine senza marker.
7. **Score guardrail**: `node scripts/benchmark.cjs --write` post-Phase 3.

---

## §6 — Phase coordination

| Phase | Time | Agents | Sync gate |
|-------|------|--------|-----------|
| Phase 0 entrance | 30min | Tester-1 | vitest 13260 + build GREEN tag iter-37-phase-0 + Andrea ratify ADR-028 |
| Phase 1 atomi parallel | 6-8h | Maker-1 + Maker-2 + WebDesigner-1 + Tester-1 (4 parallel) | 4/4 completion msg filesystem barrier |
| Phase 2 Documenter | 2h | Documenter ONLY | 1/1 completion msg + Mac Mini cron LIVE |
| Phase 3 verify+commit+push | 1h | All idle, MacBook orchestrator | bench R5+R6+R7 + Playwright + commit + push origin |

**Total**: ~10-12h (1 sessione lunga OR 2 sessioni 5-6h each).

---

## §7 — ACTIVATION STRING iter 37 paste-ready

```
Esegui PDR-B iter 37 in `docs/pdr/PDR-ITER-37-LATENCY-LIFT-DEPLOY-VERIFY.md`.
Spawn Pattern S r3 4-agent OPUS PHASE-PHASE (Maker-1 + Maker-2 + WebDesigner-1 + Tester-1) + Documenter Phase 2 sequential post 4/4 completion barrier.
Andrea ratify queue Phase 0 entrance: ADR-028 YES + LLM_ROUTING_WEIGHTS 80/15/5 + 7 missing Davide co-author session.
Pre-flight CoV: vitest 13260 baseline preserve + build PASS + Mac Mini cron mapping log delta + Edge Function unlim-chat v48 LIVE.
Anti-inflation G45 cap 9.0. Anti-regressione vitest 13260+ NEVER scendere. NO --no-verify mai. NO push main. NO debito tecnico.
P0 atoms: A1 LLM_ROUTING tune (-1500ms p95) + A2 Onniscenza conditional + A4 STT CF Whisper fix + A5 unlim-chat redeploy A1 parser + A6 HomePage A13b Chatbot-only + A9 7 missing esperimenti.
Bench mandatory: R5 post-tune avg <1500ms + R6 recall@5 ≥0.55 + R7 INTENT exec ≥80%.
Activation iter 38 in audit close §7. Sprint T close iter 38 target 9.5/10 ONESTO Opus indipendente review.
```

---

## §8 — Plugin + connettori critici iter 37

| Categoria | Tool primario | Uso atoms |
|-----------|---------------|-----------|
| Browser | `mcp__Claude_in_Chrome__*` + `mcp__Control_Chrome__*` | A8 Playwright E2E + A6 HomePage live verify |
| Testing | `mcp__plugin_playwright_playwright__*` | A8 E2E + A6 chatbot route smoke |
| Deploy | `mcp__57ae1081-...__deploy_to_vercel` Vercel MCP | A6 frontend deploy post Andrea verify |
| Supabase | `npx supabase functions deploy` + `secrets set` CLI | A1 routing tune + A4 STT fix + A5 redeploy |
| Debug | `/superpowers:systematic-debugging` `/agent-teams:team-debug` `/parallel-debugging` | A4 STT format pipeline debug |
| Memory | `/claude-mem:mem-search` `/claude-mem:timeline` | Atom A10 historical context |
| Web research | `/firecrawl` `WebSearch` `/atlassian:search-company-knowledge` | A4 CF Whisper API docs 2026 |
| Architecture | `/feature-dev:code-architect` `/superpowers:writing-plans` | A3 ADR-028 amend |
| Anti-inflation | `/superpowers:verification-before-completion` `node scripts/benchmark.cjs --write` | Phase 3 score cap G45 |
| GitHub | `mcp__plugin_engineering_github__*` `gh` CLI | iter close commit + PR + push |
| Mac Mini | SSH `progettibelli@100.124.198.59` + `~/.ssh/id_ed25519_elab` + `elab-macmini-controller` skill | L2/L3 cron continue |
| Bench scoring | `scripts/bench/score-unlim-quality.mjs` 12 PZ rules | A7 R5+R6+R7 |
| Telemetry | `mcp__plugin_posthog_*` `mcp__plugin_sentry_*` | Edge Function metrics dashboard |

---

## §9 — Comunicazione inter-agent (Pattern S r3)

**Filesystem barrier OBBLIGATORIO**:
- Pre-Phase 1: orchestrator `automa/team-state/messages/orchestrator-iter37-START.md` con 4 task assignments
- Phase 1: ogni agent `automa/team-state/messages/{agent}-iter37-phase1-{STATUS}.md` (in_progress|completed|blocked)
- Phase 2 gate: 4/4 `*-completed.md` PRIMA Documenter spawn
- Phase 3 gate: Documenter completion msg PRIMA commit+push

**MacBook ↔ Mac Mini**:
- SSH ad-hoc trigger: `bash ~/scripts/elab-user-sim-livello-{1,2,3}.sh`
- Branch push pattern: `mac-mini/iter37-user-sim-l{1,2,3}-{ISO}` + MacBook fetch + diff
- Latency: cron 5min L1 + cron 30min L2 + cron 2h L3 + cron 15min aggregator (already LIVE iter 36)

---

## §10 — Output finale iter 37

A fine sessione `docs/handoff/2026-04-30-iter-37-to-iter-38-handoff.md` DEVE contenere:

1. ✅ Score G45 ricalibrato (9.0 target ONESTO o cap inferiore con razionale)
2. ✅ 10 atoms delivery matrix (file system verified)
3. ✅ ≤2 honesty caveats critical (STT + Compile server expected)
4. ✅ SPRINT_T_COMPLETE 13 boxes status delta vs iter 36
5. ✅ Mac Mini mapping log delta + L3 cycles count post-deploy refresh keys
6. ✅ Iter 38 priorities P0 preview (Sprint T close 9.5/10 target)
7. ✅ ACTIVATION STRING iter 38 paste-ready
8. ✅ Andrea ratify queue updated (decisioni pending iter 38: ADR-025/026/027 + Davide bookText)

**NO inflation. NO compiacenza. G45 cap 9.0 enforced. Anti-regressione FERREA. NO debito tecnico.**

---

## §11 — Iter 37 Pre-flight CoV checklist (entrance)

Andrea + orchestrator MUST verify Phase 0 entrance:

```bash
# 1. Vitest baseline
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npx vitest run --reporter=basic | tail -5
# Expected: Tests 13260+ passed | 15 skipped | 8 todo

# 2. Build PASS
npm run build
# Expected: ✓ dist/sw.js + workbox-* + 32 precache entries

# 3. Edge Function status
SUPABASE_ACCESS_TOKEN=$(grep "^export SUPABASE_ACCESS_TOKEN" ~/.zshrc | cut -d'=' -f2 | tr -d '"\047')
SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase functions list --project-ref euqpdueopmlllqjmqnyb
# Expected: 11 ACTIVE incluso unlim-chat v48 + unlim-vision v7 + unlim-tts v28

# 4. Mac Mini cron LIVE
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'crontab -l | grep iter36-cron.log | wc -l'
# Expected: 4 entries

# 5. Andrea ratify queue verify
cat docs/handoff/2026-04-30-iter-36-to-iter-37-handoff.md | grep -A20 "ratify queue"
# Expected: ADR-028 YES + LLM_ROUTING tune YES + Davide bookText scheduled
```

Se ANY fail → REVERT iter 37 spawn → diagnose + fix → re-entrance.

---

**Status**: PROPOSED iter 37 ready spawn. Cascade target Sprint T close 9.5/10 iter 38 ONESTO conditional Opus indipendente review (G45 mandate).
