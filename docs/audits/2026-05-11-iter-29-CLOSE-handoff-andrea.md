# Iter 29 Close + Andrea Master URGENT Action List

**Data**: 2026-05-11
**Cumulative iter 24-29**: 6 commits pushed origin, vitest 14179 PASS preserved, ZERO regression.
**Verdict ONESTO G45 finale**: **8.8/10 code shipped** + **3.5/10 LIVE prod** (iter 27 W brutal evidence collapse documented).

---

## 1. RECAP iter 24-28 commits pushed origin `feat/unlim-parallel-agent-deploy-2026-05-10`

| Commit | Iter | Focus |
|---|---|---|
| `83f8239a` | 24 | Mac Mini autonomous user_intent_seed + Promise.race 100ms |
| `95fb7d58` | 24 | Phase 0 4-doc + Vol1 cap.9-14 6× pages + Ralph 4-dim audits |
| `51e83de0` | 24 | dim-1 LIVE BAIL brutal evidence audit |
| `e919b829` | 25 | 3 P0 architectural (memoria timeline + 503 retry + off-topic classifier) |
| `6e2e185d` | 26 | saveMessageHistory 4 paths + Pixtral migrate + Lighthouse modulePreload |
| `ee4eaa45` | 27 | 4-agent parallel + P0 surgical 94/94 esperimenti + PZ V3 12/12 + safety wrap + W LIVE BAIL |
| `267e7d9a` | 28 | hashchange + L2 +5 + 5 inline code-review fixes H1/H3/H6/M5/L4 |

---

## 2. ITER 29 WEAKNESS ANALYSIS DELIVERABLES

### Agent T tech-debt comprehensive audit (`docs/audits/2026-05-11-iter-29-tech-debt-comprehensive-audit.md` 591 LOC)

**Top 5 P0/P1**:
1. **4 GB disk leakage** — 2.3 GB `.claude/worktrees/` (5 stale agent dirs) + 1.7 GB orphan `../elab-builder-{final,fumetto,watchdog,wireup}` per CLAUDE.md "Merged, rimuovere"
2. **4 npm deps unused** zero imports: `ai`, `uuid`, `fast-xml-parser`, `mobile-drag-drop` — 30-min quick win
3. **`getExpFromHash` duplicated** App.jsx:83 + LavagnaShell.jsx:917 (iter 27 intentional, flag mitigate)
4. **OFFTOPIC regex duplication safety-critical** unlim-chat:278 inline (iter 22) + classifier OFFTOPIC_RE (iter 25) — confirma code-review iter 28 H2
5. **Audit dir bloat** 183 entries 80 MB no archive structure

**Other notable**:
- 6 orphan service files (zero prod import)
- 45 Galileo→UNLIM rename incomplete 17 files (GalileoAdapter.jsx 932 LOC + useGalileoChat.js 1379 LOC)
- 4 ADR directories duplicate numbering
- 21/30 shared TS modules NO tests (incl `llm-client.ts` + `guards.ts` runtime-critical)
- 2010 inline `style={{` + 47 CSS modules + 9 raw CSS + Tailwind = 4 paradigms coexist
- 5 monolith files >1700 LOC (TeacherDashboard 3484 / SimulatorCanvas 3173 / ElabTutorV4 2747 / LavagnaShell 1719 / useGalileoChat 1379)
- 50/80 exported TS missing return types
- Hardcoded JWT anon role api.js:23 + voiceService.js:12 (RLS-protected MA voiceService no env fallback)

**17 quick wins (~14h)** + **9 major refactors (>1 week each)**.

### Agent A API design + OpenAPI 3.1 (`docs/api/openapi.yaml` 1028 LOC + `docs/api/2026-05-11-iter-29-api-design-review.md` 406 LOC)

**11 paths + 31 schemas + 2 securitySchemes**.

**3 P0**:
1. Error envelope drift `{success:false,error}` vs `{...,details}` vs compile-proxy
2. Auth gap: solo `unlim-chat` enforces `X-Elab-Api-Key`, 10 altri solo anon JWT browser-bundle-visible
3. No public OpenAPI + schema drift inline (VisionRequest 9 runtime vs 4 declared)

**2 P1**: no rate-limit headers / no version header (v49+v50 mid-bench drift confirmed iter 37).

**5 P2**: STT+ImageGen no GDPR Art.8 consent + duplicate CORS + 25K token cold-start + dashboard stub + 200-on-injection hides security events.

### Agent D docs-architect system architecture (BG ancora running ~30 min budget)

**Outputs pending**: 3 NEW docs (system-architecture-comprehensive + component-map + data-flow).

### Iter 29 inline applied:
- `.env.example` patch: 3 missing vars (VITE_SUPABASE_EDGE_KEY + VITE_COMPILE_WEBHOOK_URL + VITE_ELAB_API_KEY)

---

## 3. ANDREA P0 URGENT MASTER ACTION LIST iter 30 entrance

### 🚨 EMERGENCY (LIVE prod collapse iter 27 W: HTTP 503 77.8% Mistral primary down)

**Step 1 — Flip routing weights (~2 min)**:
```bash
# Verifica current weights:
npx supabase secrets list --project-ref euqpdueopmlllqjmqnyb | grep LLM_ROUTING

# Option A — Gemini primary 20/70/10 (Mistral demoted backup):
npx supabase secrets set LLM_ROUTING_WEIGHTS="20,70,10" --project-ref euqpdueopmlllqjmqnyb

# Option B — Emergency Gemini-only 100/0/0:
npx supabase secrets set LLM_ROUTING_WEIGHTS="0,100,0" --project-ref euqpdueopmlllqjmqnyb
```

**Step 2 — Apply 4 migrations (~5 min)**:
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
SUPABASE_ACCESS_TOKEN=sbp_xxx npx supabase db push --linked
# Applies:
# 20260511060000_unlim_session_memory (iter 18.5)
# 20260511080000_unlim_session_memory_user_intent (iter 24 user_intent_seed col + RPC)
# 20260511120000_unlim_message_history (iter 25 timeline + RPC)
# 20260511180000_unlim_message_history_rpc_race_fix (iter 28 H3 FOR UPDATE lock)
# 20260430220000_unlim_chat_warmup_cron (iter 38 sub-minute warm-up)
```

**Step 3 — Deploy Edge Function `unlim-chat` v53+ (~3 min)**:
```bash
SUPABASE_ACCESS_TOKEN=sbp_xxx npx supabase functions deploy unlim-chat _shared --project-ref euqpdueopmlllqjmqnyb
# Carries: iter 24 directive + Vol1 pages + iter 25 retry+saveHistory+classifier + iter 26 + iter 27 P0 surgical+PZ+safety + iter 28 H1+H6+M5+L4 fixes
```

**Step 4 — Verify recovery (~10 min)**:
```bash
# Smoke 5q:
for q in "Spiegami LED Vol.1 cap.6" "Posso usare 220V?" "Hai visto Inter Juventus?" "Come funziona il fotoresistore Vol.1 cap.10?" "Riepilogo esperimenti"; do
  curl -s -X POST "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
    -H "X-Elab-Api-Key: $ELAB_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"message\":\"$q\",\"sessionId\":\"iter30-smoke-$(date +%s%N)\"}" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('HTTP_OK:', d.get('success'), '| source:', d.get('source'), '| len:', len(d.get('response','')))"
done
```

**Step 5 — Re-run W LIVE 50q post-deploy** (deferred audit run):
```bash
# Use Agent W spec iter 27 — re-run identico fresh sessionIds 'iter30-postdeploy-*'
# Expected: HTTP 503 < 2% (vs iter 27 W 77.8%)
# Expected: Cat D off-topic ≥ 85% (vs iter 27 37.5%)
# Expected: Cat A Vol/pag verbatim ≥ 85% (vs iter 24 60%)
```

**Step 6 — Cat B marathon 5×5 FIRST priority post-deploy** (iter 27 unmeasured + Doc-4 hypothesis verify):
- Verifica msg4 universal "Blink Vol.3 pag.23" collapse RISOLTO (Doc-4 #1 timeline architettura iter 25/28 H3 race fix)
- Verifica verbatim recall ≥ 4/5 (vs iter 22 marathon 4/5 ma con hallucination)

**Step 7 — Re-run Agent X Playwright 94/94 esperimenti sweep**:
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
SWEEP_BASE_URL="https://www.elabtutor.school" npx playwright test tests/e2e/iter-27-92-esperimenti-sweep.spec.js --config=tests/e2e/sprint-u.config.js --workers=1
# Pre-fix iter 27: 0/94 PASS (route bug)
# Post-fix iter 28: expect ≥ 80/94 PASS (P0 surgical fix LavagnaShell deep-link mount)
```

**Step 8 — Lighthouse perf verify build (iter 26 modulePreload + iter 28 L4)**:
```bash
npm run build
ls -la dist/index.html
grep "modulepreload.*react-pdf\|modulepreload.*mammoth" dist/index.html
# Expected: NO modulepreload tag per react-pdf / mammoth (Vite filter iter 26 applies)
npx vercel --prod --yes
npx lighthouse https://www.elabtutor.school/#chatbot-only --output=json --output-path=./lighthouse-chatbot-iter30.json --chrome-flags="--headless" --only-categories=performance
# Expected: perf 65-75 (vs pre-fix 26)
```

---

## 4. ANDREA P1 IT 30 RATIFY QUEUE

1. Iter 27 PZ V3 MAJOR severity hard-enforce env flag `PZ_HARD_ENFORCE_MAJOR=true` ratify
2. Iter 26 Pixtral 12B migration: verify mistral-small-2506 accuracy delta 5 sample images (Andrea: upload reali kit Omaric foto)
3. Iter 28 Voice clone Andrea/Davide IT 6s audio (Morfismo Sense 2 narratore volumi)

---

## 5. DEFER iter 30+ tech debt sprint

**Quick wins (~14h totale, Agent T iter 29)**:
1. 4 GB disk cleanup `.claude/worktrees/` + 4 orphan worktree
2. 4 npm deps unused remove (verify dynamic imports first via `depcheck`)
3. 6 orphan service files delete
4. ADR consolidation 4 dirs → 1 canonical `docs/adrs/`
5. Audit dir archive structure `docs/audits/archive/sprint-S/`

**Major refactors deferred Sprint V+ (~3-4 settimane Davide co-author)**:
- L2 templates expand 25→94 (Davide content gold standard)
- Galileo→UNLIM rename completion 17 files
- 5 monolith file splits (TeacherDashboard 3484 → 4 file ≤900 LOC each)
- Inline-styles migration → CSS modules unified
- OFFTOPIC consolidation single source-of-truth (H2 carryover code-review)
- Test coverage 21/30 shared TS untested critical (llm-client + guards)
- API harmonize error envelope + add rate-limit + version headers (Agent A iter 29)

---

## 6. ANTI-G45 RECAP iter 24-29

- Code shipped 8.8/10 EXPLICITLY DECOUPLED from LIVE prod 3.5/10 brutal
- NO claim "Andrea actions COMPLETED" senza commit log evidence
- NO claim "94/94 LIVE PASS" senza Playwright sweep post-deploy
- NO claim "Memoria timeline LIVE" senza migration apply + marathon re-bench
- NO claim "Lighthouse +50 LIVE" senza npm build + Vercel deploy + CLI run
- ZERO compiacenza Andrea mandate
- ZERO inflation
- ZERO regression vitest 14179 PASS preserved 6 commits

---

## 7. ARTIFACTS iter 29 inventory

**Audit docs NEW (4 + 1 close)**:
- `docs/audits/2026-05-11-iter-29-tech-debt-comprehensive-audit.md` (591 LOC Agent T)
- `docs/api/openapi.yaml` (1028 LOC Agent A OpenAPI 3.1)
- `docs/api/2026-05-11-iter-29-api-design-review.md` (406 LOC Agent A review)
- `docs/architecture/2026-05-11-iter-29-system-architecture-comprehensive.md` (pending Agent D BG)
- `docs/audits/2026-05-11-iter-29-CLOSE-handoff-andrea.md` (this file)

**Inline edits**:
- `.env.example` (+12 LOC 3 missing vars iter 29 Agent T fix)

---

*Co-Authored-By: Claude Opus 4.7 (1M context) — iter 29 close handoff Andrea*
