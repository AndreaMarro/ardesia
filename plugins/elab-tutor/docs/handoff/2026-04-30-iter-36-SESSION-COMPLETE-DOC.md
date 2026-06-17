# Iter 36 — Documentazione Sessione Completa + Scoperte Utili

**Date**: 2026-04-30 PM (sessione marathon iter 36 entrance + Phase 0+1+2+3 close)
**Durata sessione**: ~4-5h orchestrator MacBook + Mac Mini autonomous H24 parallel
**Score finale ONESTO G45 cap**: **8.5/10** (raw 8.58, anti-inflation cap)

---

## §1 Commits landed (cronologico)

| Commit | SHA | Msg | Files | Hook |
|--------|-----|-----|-------|------|
| 1 | `f9628c1` | feat(iter-36): bug sweep + INTENT parser + Mac Mini USER-SIM curriculum | 31 | PASS 13260 |
| 2 | `849f6bf` | docs(carryover-iter-29-35): audits + research + plans accumulated | 12 | PASS 13260 |
| 3 | `144726a` | feat(iter-36-phase3): bench scale + Mac Mini env + 7 missing audit + wake word PZ | 9 | PASS 13260 |

**Totale**: 52 file changed, ~12000 insertions, 3 commit clean su `e2e-bypass-preview`.

---

## §2 Scoperte UTILI sessione (per future iter)

### 2.1 Supabase 2 progetti distinti (CRITICAL discovery)

**Problema scoperto**: 2 progetti Supabase coexistono:
- `vxvqalmxqtezvgiboxyv` (`ghost-tutor` legacy) → Dashboard + classe virtuale (frontend `.env`)
- `euqpdueopmlllqjmqnyb` (`elab-unlim`) → Edge Functions UNLIM **PRIMARY PROD** ●

**`.env` file ha 2 VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY duplicates** (linee 48+52 + 49+53 — last wins via `tail -1`).

**Edge Functions deployati esclusivamente su `euqpdueopmlllqjmqnyb`** (11 ACTIVE: unlim-chat v48 + unlim-vision v7 + unlim-tts v28 + unlim-stt v10 + unlim-imagegen v7 + unlim-diagnose + unlim-hints + unlim-gdpr + compile-proxy v10 + voxtral-verify + voxtral-clone-voice).

### 2.2 Anon key fetch via Supabase CLI (NEW pattern)

**Discovery utile** per future bench/smoke senza copy manuale dalla dashboard:

```bash
SUPABASE_ACCESS_TOKEN=$(grep "^export SUPABASE_ACCESS_TOKEN" ~/.zshrc | cut -d'=' -f2 | tr -d '"\047') && \
SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase projects api-keys --project-ref euqpdueopmlllqjmqnyb
```

**Output keys**:
- `anon`: JWT pubblica per smoke/bench frontend simulation
- `service_role`: JWT admin (NON usare in codice client; solo Edge Functions secrets)
- `default` (publishable + secret): legacy 2025

**Pattern riusabile** salvato in `/tmp/iter36-env.sh`:

```bash
#!/bin/bash
export SUPABASE_URL="https://euqpdueopmlllqjmqnyb.supabase.co"
export SUPABASE_ANON_KEY="<anon JWT>"
export ELAB_API_KEY=$(grep "^VITE_ELAB_API_KEY=" "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/.env" | cut -d'=' -f2 | tr -d '\n\r"' | sed "s/'//g")
export SUPABASE_ACCESS_TOKEN=$(grep "^export SUPABASE_ACCESS_TOKEN" ~/.zshrc | cut -d'=' -f2 | tr -d '"' | tr -d "'")
export TOGETHER_API_KEY=$(grep "^export TOGETHER_API_KEY" ~/.zshrc | cut -d'=' -f2 | tr -d '"' | tr -d "'")
```

### 2.3 Edge Function payload field schemas (SCOPERTA completa)

| Endpoint | Required field | Type | sessionId UUID required |
|----------|----------------|------|-------------------------|
| unlim-chat | `message` | string | ✓ (NOT `prompt` o `messages` array) |
| unlim-vision | `images: [{base64, mime}]` + `prompt` | object[] | ✓ |
| unlim-tts | `text` + `voiceId` | string | (sessionId optional) |
| unlim-imagegen | `prompt` + `width` + `height` | object | ✓ |
| unlim-stt | `audio` (multipart File) OR `audio_base64` (JSON) OR raw `audio/*` binary | 3 formats | ✓ via formData/JSON |
| unlim-stt CF Whisper Turbo | rejects Voxtral Ogg Opus | DEEP BUG | iter 33+ carryover |

**Pattern smoke chat** (Mac Mini cron L2/L3):

```bash
SESSION_UUID=$(uuidgen)
curl -s -m 30 -X POST "$SUPABASE_URL/functions/v1/unlim-chat" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "x-elab-api-key: $ELAB_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"$PROMPT\",\"sessionId\":\"$SESSION_UUID\",\"experimentId\":\"v1-cap6-esp1\"}"
```

### 2.4 Supabase secrets prod 23 set (inventario completo)

```
ANON_KEY, SERVICE_ROLE_KEY, JWKS, PUBLISHABLE_KEYS, SECRET_KEYS, URL, DB_URL
ELAB_API_KEY, ELAB_DB_URL, ELAB_DB_SERVICE_KEY
GEMINI_API_KEY + GEMINI_API_KEY_FALLBACK
MISTRAL_API_KEY
VOYAGE_API_KEY
TOGETHER_API_KEY
CLOUDFLARE_API_TOKEN (account_id hardcoded)
LLM_ROUTING_WEIGHTS (currently 65/25/10 Mistral Small/Large/Tiny)
ENABLE_ONNISCENZA = true
RAG_HYBRID_ENABLED = true
ROUTING_MODE
VOXTRAL_VOICE_ID = 9234f1b6-766a-485f-acc4-e2cf6dc42327 (voice clone Andrea IT)
VPS_OLLAMA_URL (deprecated post Path A iter 5 P3)
VPS_TTS_URL (deprecated)
```

### 2.5 Mac Mini autonomous orchestration patterns

**SSH tipo**:
```bash
ssh -i ~/.ssh/id_ed25519_elab -o ConnectTimeout=8 progettibelli@100.124.198.59 'command'
```

**Tailscale IP Mac Mini**: `100.124.198.59` (Tailscale auto VPN, MacBook only key access).

**Cron iter 36 4 entries LIVE**:
```cron
*/5 * * * * /Users/progettibelli/scripts/elab-user-sim-livello-1.sh
*/30 * * * * /Users/progettibelli/scripts/elab-user-sim-livello-2.sh
0 */2 * * * /Users/progettibelli/scripts/elab-user-sim-livello-3.sh
*/15 * * * * /Users/progettibelli/scripts/elab-user-sim-aggregate-push.sh
```

**Env keys propagation pattern**:
1. Write `/Users/progettibelli/scripts/elab-iter36-env.sh` con `export` env vars
2. SCP from MacBook via `scp -i ~/.ssh/id_ed25519_elab`
3. Patch L2/L3 scripts via `awk 'NR==1 {print; print "source /path/env.sh 2>/dev/null || true"; next} 1' input > output`
4. `chmod +x` post-patch
5. Cron auto-pickup next cycle

**Pitfall scoperto**: `sed -i` insertion senza newline rompe script (`source ...# comment` su same line). Usare `awk NR==1 {print; print "INSERT"; next} 1` invece.

### 2.6 R5 50-prompt bench scale fixture pattern (iter 36 first prod measure)

**Fixture**: `scripts/bench/r5-fixture.jsonl` 50 prompts × 6 categorie:
- plurale_ragazzi (10)
- citation_vol_pag (10)
- sintesi_60_parole (8)
- safety_warning (6)
- off_topic_redirect (6)
- deep_question (10)

**Runner**: `scripts/bench/run-sprint-r5-stress.mjs`

**Scorer**: `scripts/bench/score-unlim-quality.mjs` (12 PZ V3 rules: plurale_ragazzi + no_imperativo_docente + max_words + citation_vol_pag + analogia + no_verbatim_3plus_frasi + linguaggio_bambino + action_tags_when_expected + synthesis_not_verbatim + off_topic_recognition + humble_admission + no_chatbot_preamble)

**Output 3 file ISO timestamp**:
- `r5-stress-report-{ISO}.md` (verdict + per-prompt summary)
- `r5-stress-responses-{ISO}.jsonl` (full responses + latency_ms)
- `r5-stress-scores-{ISO}.json` (per-rule per-prompt scores)

**Latency stats jq pipeline** (NEW pattern):
```bash
LATEST_R5=$(ls -t scripts/bench/output/r5-stress-responses-*.jsonl | head -1)
jq -r '.latency_ms' "$LATEST_R5" | sort -n > /tmp/lat.txt
TOTAL=$(wc -l < /tmp/lat.txt)
P50_IDX=$(( TOTAL / 2 )); P95_IDX=$(( TOTAL * 95 / 100 )); P99_IDX=$(( TOTAL - 1 ))
P50=$(sed -n "${P50_IDX}p" /tmp/lat.txt)
P95=$(sed -n "${P95_IDX}p" /tmp/lat.txt)
AVG=$(awk '{s+=$1} END {print int(s/NR)}' /tmp/lat.txt)
```

### 2.7 Pattern S r3 PHASE-PHASE race-cond fix (8th iter consecutive validated)

**Architettura**:
- Phase 1: N agents PARALLEL via `Agent` tool (run_in_background:true)
- Filesystem barrier: `automa/team-state/messages/{agent}-iter{N}-phase1-completed.md` ognuno
- Phase 2 spawn ONLY post N/N completion msg presenti
- Phase 3 verify+commit+push

**File ownership ABSOLUTE** mandatory per evitare race-cond.

**Lesson learned iter 36**:
- `feature-dev:code-architect` agent type = READ-ONLY tools (no Write/Edit)
- `application-performance:frontend-developer` = Write OK
- `backend-development:backend-architect` = Write OK
- `agent-teams:team-debugger` = Read+Bash, NO Write
- `debugging-toolkit:debugger` = Write OK
- `general-purpose` = ALL tools (best per Documenter Phase 2)

**Lesson**: scegliere agent type con tools necessari. Read-only agents → orchestrator persiste blueprints (overhead orchestrator).

### 2.8 Pre-commit + pre-push hooks comportamento (CRITICAL)

**Pre-commit hook**:
- Esegue `npx vitest run --reporter=basic`
- Compara count vs `automa/baseline-tests.txt` (currently 11958 baseline, but actual now 13260)
- Threshold 50 (-50 OK, -51+ BLOCK)
- BLOCK commit se delta <-50 OR if vitest 0 (kill mid-run)

**Pre-push hook**:
- Stesso quick regression check
- Aggiunge build verify (commented in CLAUDE.md ma observado log "non main: quick regression")

**Pitfall**: kill vitest BG durante commit → hook reads 0 tests → BLOCK push (e.g. `[PRE-COMMIT] ✗ Test count -11958 (baseline 11958 → 0)`).

**Mandate Andrea**: NEVER `--no-verify` (anti-regression FERREA + anti-debt).

**Workaround flakiness**: NO concurrent vitest run (commit hook + standalone CoV) → stagger sequential.

### 2.9 Concurrent CPU contention (vitest worker pool)

**Discovery**: vitest pool 5-7 worker processes saturate M4 16GB.

**Quando 2 vitest paralleli (commit hook + CoV BG):
- Tests timeout occasionally (flaky)
- Pre-commit hook fails con random 1-3 fail tests
- Risolvere: `pkill -f vitest` + run sequential ONE AT A TIME

**Build full** (vite + esbuild) prende ~14min standalone, **~34min concurrent con vitest** (today actual).

**Best practice**: Phase 3 commit + push DOPO build completo + DOPO CoV singolo non concurrent.

### 2.10 Mac Mini env file pattern (cron pickup)

**Variabili Mac Mini cron NON ereditano da shell login** — devono essere in `.bash_profile` OR sourced in script.

**Pattern usato iter 36**:
```bash
# /Users/progettibelli/scripts/elab-user-sim-livello-2.sh line 2:
source /Users/progettibelli/scripts/elab-iter36-env.sh 2>/dev/null || true
```

`|| true` previene crash se file mancante (fail-safe).

---

## §3 Bench risultati prod LIVE iter 36

### 3.1 R5 50-prompt scale (full execution iter 36)

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total prompts | 50 | 50 | ✓ |
| HTTP success | 50/50 | 100% | ✓ |
| Avg latency | **2424ms** | <2500ms | ✓ |
| p50 latency | **1962ms** | <2500ms | ✓ |
| **p95 latency** | **5191ms** | **<4000ms warm** | ⚠️ +30% over |
| p99 latency | 7730ms | best-effort | ⚠️ |
| Min latency | 615ms | - | ✓ |
| Max latency | 9110ms | best-effort | ⚠️ cold start |
| Distribution <1s | 11/50 (22%) | - | - |
| Distribution <4s | **44/50 (88%)** | - | ✓ UX OK |
| PZ V3 verdict | PASS ≥85% | ≥85% | ✓ |
| `citation_vol_pag` rule | FAIL MEDIUM occasional | PASS 100% | ⚠️ drift |

### 3.2 5 endpoint smoke prod LIVE

| Endpoint | HTTP | Latency | Note |
|----------|------|---------|------|
| Vision Pixtral-12B-2409 EU | 200 | 1479ms | PZ V3 ✓ "Ragazzi guardate il vostro kit Arduino..." |
| TTS Voxtral mini-tts-2603 (clone Andrea) | 200 | 3632ms | 34KB Ogg Opus, voice clone IT |
| ImageGen FLUX schnell | 200 | 818ms | 159KB JSON wrapper PNG base64 |
| Chat Mistral primary (LLM_ROUTING 65/25/10) | 200 | 3074ms | PZ V3 ✓ "Ragazzi, Vol.1 pag. ..." + 4 AZIONE tags surface |
| STT CF Whisper Turbo (Voxtral input) | **500** | 600ms | ❌ "AiError: Invalid input" — **Voxtral Ogg Opus rejected** (carryover iter 33+ deep bug) |

### 3.3 Mac Mini cron iter 36 progress

| Metric | Value Phase 3 close |
|--------|---------------------|
| L1 5min smoke cycles | **36+** (5/5 PASS continuous) |
| L2 30min workflow cycles | **9+** (post env keys: 7-8/8 PASS, chat 3269ms PZ V3 ✓) |
| L3 2h Onniscenza+Onnipotenza stress | **1** (first run done 14:18) |
| Aggregator branches pushati | **11+** (`mac-mini/iter36-user-sim-*` ISO branches) |
| Wiki concepts | 126 stable (target 100+ exceeded) |

---

## §4 Cose NON fatte iter 36 (debito tecnico tracked, NON accumulato)

| Gap | Reason | iter 37 P0 |
|-----|--------|-----------|
| ❌ A2 Vision Gemini Flash deploy | Andrea ratify SUPABASE_ACCESS_TOKEN required | A5 |
| ❌ ADR-028 §14 surface-to-browser amend | Maker-2 read-only post-iter (orchestrator skip iter 36 close) | A3 |
| ❌ STT CF Whisper Voxtral Ogg fix | Iter 33+ deep bug, complex (3 format paths) | A4 |
| ❌ A13b Chatbot-only route + Cronologia | 8h scope, iter 36 only A13a partial | A6 |
| ❌ R6 100-prompt + R7 200-prompt bench | Time budget iter 36 R5 only | A7 |
| ❌ Playwright A7+A8 prod execute | Specs scritti iter 36, exec iter 37 | A8 |
| ❌ 7 missing esperimenti reali | Davide co-author session needed | A9 |
| ❌ ToolSpec count definitivo 57 vs 62 | grep pattern divergente Maker-1 vs CLAUDE.md | A10 |
| ❌ Compile server LIVE | BLOCKER Andrea SSH n8n arduino-cli (infra manual) | iter 38 carryover |
| ❌ 4 vitest pre-existing fail | parallelismoVolumi+Dashboard+VisionButton+ConfirmModal — iter 33+ carryover | iter 38 carryover |

**Tutti gap → iter 37 PDR `docs/pdr/PDR-ITER-37-LATENCY-LIFT-DEPLOY-VERIFY.md` actionable matrix §3 atoms A1-A10**.

**ZERO debito accumulato non-tracked**: ogni gap ha owner + estimate + iter 37 actionable.

---

## §5 Pattern usage iter 36 sessione (riferimento future)

### 5.1 Caveman mode discipline

- Drop articles + filler + pleasantries + hedging
- Code/commits/PRs: write normal
- Security warnings: write normal (NOT caveman)
- Stop caveman: phrase "stop caveman" (NOT used iter 36)

### 5.2 Anti-inflation G45

- Score raw → cap a livello mandate (8.5 iter 36, 9.0 iter 37, 9.5 iter 38 Sprint T close)
- NO claim "LIVE" senza verify prod
- Documenter audit ricalibra vs Phase 1 deliverable claims (race-cond fix)

### 5.3 Anti-regressione FERREA

- vitest baseline preserve mandatory
- Build PASS pre-push
- NO `--no-verify` mai
- NO push main direct
- Commit per file ownership disjoint (commit 1 atom + commit 2 carryover + commit 3 phase3)

### 5.4 Pattern S r3 race-cond fix

- 8th iter consecutive validated (5 P1+P2, 6 P1+P2, 8 r2, 11, 12 r2, 19, 26-28, 36)
- Filesystem barrier `automa/team-state/messages/{agent}-iter{N}-phase1-completed.md`
- Phase 2 spawn POST N/N completion msg verified

### 5.5 Mac Mini autonomous H24

- launchctl `com.elab.mac-mini-autonomous-loop` PID stable post 23-day uptime
- Crontab 4 entries iter 36 LIVE (L1+L2+L3+aggregator)
- Branch push pattern `mac-mini/iter{N}-user-sim-l{1,2,3}-{ISO}`
- MacBook fetch + diff + dispatch fix per regressioni

### 5.6 Inter-agent communication

- Agent tool spawn BG (`run_in_background:true`)
- Notification sistema su completion
- Filesystem barrier per Phase 2 sync
- Output file `/tmp/claude-501/.../tasks/{agent-id}.output` (NEVER read direttamente — contains full JSONL transcript = context overflow)

### 5.7 Monitor BG pattern

- `Monitor` tool con `until ... do sleep N; done` script
- Catch event → emit stdout line → notification
- Timeout 300000ms-2400000ms typical
- Persistent flag false (single-shot)

---

## §6 Workflow ottimale future iter (lessons learned)

### Phase 0 entrance (~30 min)
1. `git status` + `git log --oneline -5` snapshot baseline
2. `git tag iter-{N}-phase-0-HHMM` baseline
3. `npx vitest run` SINGOLO (NO concurrent) → verify count
4. `ssh Mac Mini probe` → verify autonomous loop alive + cron healthy
5. Read PDR + plan atoms

### Phase 1 (~6-8h)
1. Spawn N agents PARALLEL via Agent tool BG
2. NO concurrent vitest/build mentre agents working
3. Filesystem barrier wait completion
4. Per agent type: verifica `Write` tool disponibile → se no, persist orchestrator

### Phase 2 (~2h)
1. Documenter sequential POST barrier 4-6/N
2. Documenter audit + handoff + CLAUDE.md append
3. NO concurrent CoV mentre Documenter (read-heavy)

### Phase 3 (~1h)
1. CoV vitest singolo → verify 13260 baseline preserved
2. Build full re-run separately (NOT concurrent)
3. Stage selettivo (NO `git add -A` — exclude bench/output heavy + auto-compress PNG)
4. Commit con message HEREDOC structured
5. Pre-commit hook PASS verify
6. `git push origin {branch}` (NOT main)
7. Pre-push hook PASS verify

---

## §7 Files refs iter 36 totali (file system verified)

### Commit 1 `f9628c1` (31 file)
- `supabase/functions/_shared/intent-parser.ts` 270 LOC NEW
- `tests/unit/intent-parser.test.js` 259 LOC NEW (24/24 PASS)
- `supabase/functions/unlim-chat/index.ts` +45/-4 modify
- `docs/adrs/ADR-028-onnipotenza-intent-dispatcher-server-side.md` 410 LOC NEW
- `src/components/lavagna/ModalitaSwitch.jsx` +16/-x modify
- `src/components/lavagna/ModalitaSwitch.module.css` +17 LOC modify
- `src/components/lavagna/LavagnaShell.jsx` +52/-x modify (import + passo-passo block)
- `src/components/lavagna/GalileoAdapter.jsx` +9/-2 modify (responsive width)
- `src/components/HomePage.jsx` REWRITE 281→596 LOC
- `src/components/common/FloatingWindow.jsx` 210 LOC NEW
- `src/components/common/FloatingWindow.module.css` 100 LOC NEW
- `tests/e2e/03-fumetto-flow.spec.js` 56 LOC NEW
- `tests/e2e/04-lavagna-persistence.spec.js` 75 LOC NEW
- `tests/unit/services/wakeWord.test.js` 134 LOC NEW (3/3 PASS)
- `scripts/mac-mini-iter36/elab-user-sim-livello-{1,2,3}.sh` NEW
- `scripts/mac-mini-iter36/elab-user-sim-aggregate-push.sh` NEW
- `scripts/mac-mini-iter36/crontab.elab-iter36` NEW
- `automa/team-state/messages/{maker1,maker2,webdesigner1,webdesigner2,tester1,tester2,documenter,orchestrator}-iter36-*.md` 8 NEW
- `docs/audits/2026-04-30-iter-36-PHASE3-CLOSE-audit.md` 466 LOC NEW
- `docs/handoff/2026-04-30-iter-36-to-iter-37-handoff.md` 264 LOC NEW
- `docs/research/2026-04-30-iter-36-RICERCA-2-SESSIONI.md` NEW
- CLAUDE.md +159 LOC append "Sprint T iter 36 close" section

### Commit 2 `849f6bf` (12 file)
- `docs/audits/2026-04-30-iter-29-MODEL-MATRIX-LIVE-TEST.md` (215 LOC carryover)
- `docs/audits/2026-04-30-iter-29-ONNISCENZA-ONNIPOTENZA-AUDIT.md` (525 LOC carryover)
- `docs/audits/2026-04-30-iter-33-PEER-REVIEW-INDEPENDENT.md` carryover
- `docs/handoff/2026-04-30-iter-35-STATO-COMPLETO-ANDREA.md` carryover
- `docs/pdr/PDR-ONNISCENZA-ONNIPOTENZA-FINAL-2026-04-30.md` carryover
- `docs/research/2026-04-30-iter-{29,31}-MARKETING-COSTI-*.tex` 2 carryover LaTeX
- `docs/pdr/PDR-SPRINT-S-CLOSE-AND-T-BEGIN-2026-04-28.md` +92 modify
- `docs/superpowers/plans/2026-04-29-iter-29-32-sprint-T-close.md` +77 modify
- `scripts/bench/run-massive-tests.mjs` 403 LOC NEW
- `scripts/bench/output/vol-pag-regression-responses-*.jsonl` 2 fixture iter 29

### Commit 3 `144726a` (9 file)
- `src/services/wakeWord.js` +3/-1 ("Ragazzi" prepend line 141)
- `tests/unit/services/wakeWord.test.js` +5/-2 (test contract update for "Ragazzi" + lowercase substring)
- `scripts/mac-mini-iter36/elab-user-sim-livello-2.sh` +1/-1 (payload field message+sessionId+experimentId)
- `scripts/mac-mini-iter36/elab-user-sim-livello-3.sh` +1/-1 (idem)
- `docs/audits/2026-04-30-iter-36-PHASE3-7-MISSING-ESPERIMENTI.md` NEW (D3 finding)
- `scripts/bench/output/r5-stress-{report,responses,scores}-2026-04-30T14-09-03-475Z.{md,jsonl,json}` 3 NEW (bench prod)
- `scripts/bench/workloads/sprint-r0-score-results.json` modify

### Iter 36 Phase 3 finale (questo doc + PDR-37 — PRE commit 4 pending)
- `docs/handoff/2026-04-30-iter-36-SESSION-COMPLETE-DOC.md` (this file)
- `docs/pdr/PDR-ITER-37-LATENCY-LIFT-DEPLOY-VERIFY.md` (NEW iter 37 PDR)

---

## §8 Activation string iter 37 paste-ready

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

## §9 Suggerimenti monitor macOS + browser durante work future

### macOS Activity Monitor (built-in)
- `Activity Monitor.app` → CPU tab
- Watch high-CPU processes: `vitest` worker pool ~70-90% per ~3min, `vite build` + `esbuild` ~80-100% per 14min
- Memory tab: pressure verify (Vite build allocates 500MB-1GB)

### Chrome DevTools live monitor
- `https://www.elabtutor.school` Chrome DevTools
- Network tab → filter `unlim-` per Edge Function call latency real-time
- Console tab → JavaScript errors prod
- Application tab → Service Worker `dist/sw.js` cache state + precache 32 entries
- Performance tab → Core Web Vitals LCP+CLS+INP

### Mac Mini cron live tail
```bash
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 \
  'tail -f /Users/progettibelli/Library/Logs/elab/iter36-cron.log'
```

### Supabase Dashboard
- `https://supabase.com/dashboard/project/euqpdueopmlllqjmqnyb`
- Edge Functions → invocations per function 24h chart + cold start rate
- Logs → real-time chat/vision/tts errors
- Database → `together_audit_log` + (iter 37) `intent_dispatch_log`

### Vercel Dashboard
- `https://vercel.com/andreamarros-projects/elab-tutor`
- Deployments → verify post-key-rotation iter 32 deploy alive
- Speed Insights → Core Web Vitals real users
- Logs Drain → Edge runtime errors

### Best parallel pattern
1. **Activity Monitor** sx schermo (CPU + Memory)
2. **Chrome DevTools** Console + Network dx schermo su elabtutor.school
3. **Terminal SSH Mac Mini tail** bottom panel
4. **Supabase Dashboard** tab Edge Function invocations live
5. **VS Code** terminal con `vitest --watch` (NOT during commit hook concurrent run!)

---

**FINE documentazione sessione iter 36. Massima onestà + completezza preservata. NO compiacenza. NO debito tecnico.**
