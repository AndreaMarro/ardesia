---
sprint: S
iter: 2 → 3 transition
date: 2026-04-26 close
author: orchestrator (Sprint S iter 2 ralph loop)
status: handoff session-next con simple setup guide + activation string
---

# Sprint S iter 2 → iter 3 Handoff

> Handoff doc per Andrea: simple step-by-step setup + verifica state + activation string ralph loop iter 3.
> Pairs with: `docs/pdr/PDR-SPRINT-S-ITER-3-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md` (master PDR iter 3).

---

## 0. TL;DR (5 line)

1. Sprint S iter 2 ralph loop ha shipped 6 commits su branch `feat/sprint-s-iter-2-software-prompt-v3-wireup-2026-04-26` (✅ pushed origin)
2. UNLIM v3 prompt **DEPLOYED prod** (Edge Function elab-unlim) — Box 5 ✅ TRUE
3. Pod RTX A6000 `5ren6xbrprhkl5` EXITED (cost discipline) — modelli persisteno volume
4. Wiki count 50 → **59 concepts** (+9 iter 2, target 100+)
5. Score onesto **2.5/10** (NON 5/10 inflated). Sprint S iter 3 deve continuare.

---

## 1. State at iter 2 close (verificato CoV)

### 1.1 Test baseline + build

- ✅ `npx vitest run`: **12532 PASS + 8 todo** (231 test files, +34 vs Sprint S iter 1 baseline 12498)
- ✅ `npm run build`: PASS exit 0 in 13m54s (PWA precache 36 entries 9285 KiB)
- ✅ Pre-commit hook + pre-push hook validati su tutti 6 commit

### 1.2 Branch state

```bash
git log --oneline -6
# 4695c88 fix(wiki): Mac Mini v2 script — checkout feature branch
# 611d25f feat(wiki): Mac Mini batch iter 16 — +4 (fade-led, semaforo, allarme, cronometro)
# f89b893 feat(wiki): Mac Mini batch v2 volumi-anchored — extract Vol1+Vol2+Vol3 text + script v2
# 8edb9d2 feat(wiki): Mac Mini batch iter 9 — +3 nuovi (blink-led, ground-massa, voltmetro)
# b00ef28 feat(sprint-s): iter 2 Task B — Modalità citazioni inline UI wire-up LavagnaShell + AppHeader
# a22b24d feat(sprint-s): iter 2 SOFTWARE-only — UNLIM synthesis prompt v3 wire-up + Mac Mini wiki +2 + R0 baseline 75.81% WARN
```

### 1.3 Pod RunPod state

- **Pod corrente**: `5ren6xbrprhkl5` RTX A6000 48GB
- **Stato**: EXITED (cost discipline, modelli persisteno volume 130GB)
- **Cost**: $0.49/h running, $13/mo storage
- **SSH endpoint**: cambia ogni resume (era 21041 last work)
- **Modelli installati**: Ollama + Qwen2.5:7b + Qwen2.5-VL:7b + Whisper Turbo (port 9000) + pip stack (TTS, FlagEmbedding, faster-whisper)
- **Resume**: `bash scripts/runpod-resume.sh 5ren6xbrprhkl5` (~2min)

### 1.4 Mac Mini autonomous

- ✅ launchctl `com.elab.mac-mini-autonomous-loop` PID 23944 LIVE H24
- ✅ SSH `progettibelli@100.124.198.59` via `~/.ssh/id_ed25519_elab`
- ✅ Script v2 volumi-anchored deployato `~/scripts/elab-wiki-batch-gen-v2.sh`
- ✅ Wiki count **59 concepts** local (PDR claim 33 obsoleto)

### 1.5 Production deploy

- ✅ Frontend Vercel: `https://www.elabtutor.school` (HTTP 200, 0 console errors stress smoke iter 4)
- ✅ Edge Function elab-unlim: `unlim-chat` deployed con UNLIM v3 prompt
- ✅ Render nanobot V2: `https://elab-galileo.onrender.com` (R0 baseline 75.81% WARN measured)

### 1.6 SPRINT_S_COMPLETE 10 boxes

| # | Box | Status | Note |
|---|-----|--------|------|
| 1 | VPS GPU deployed | ✅ | Pod EXITED storage paid |
| 2 | 7-component stack live | ⚠️ 2/7 | Ollama+Qwen+Whisper installed, BGE-M3+Coqui+ClawBot iter 3 |
| 3 | 6000 RAG chunks | ❌ | Depend GPU + migration apply |
| 4 | 100+ Wiki concepts | ⚠️ 59/100 | Mac Mini batches continue |
| 5 | UNLIM v3 wired prod | ✅ DEPLOYED | Re-run R0 measure delta iter 3 |
| 6 | Hybrid RAG live | ❌ | Depend BGE-M3 + migration |
| 7 | Vision flow live | ❌ | Depend Qwen-VL deploy + integration |
| 8 | TTS+STT IT | ⚠️ STT OK | Coqui TODO + voice clone Andrea |
| 9 | R5 stress 50 prompts ≥90% | ⚠️ R0 75.81% | R5 expanded fixture iter 5+ |
| 10 | ClawBot 80-tool | ❌ | Sprint 6 Day 39 post R5 PASS |

**Score iter 2 close: 2.5/10** (1.5 → 2.5, +1.0).

---

## 2. SIMPLE SETUP GUIDE per Andrea (next session start)

### 2.1 STEP 1 — Apri terminal MacBook

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
```

### 2.2 STEP 2 — Verifica Mac Mini autonomous attivo

```bash
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'launchctl list | grep elab'
# Atteso: <PID> 0 com.elab.mac-mini-autonomous-loop
```

Se PID changed dopo reboot → loop auto-restarted (KeepAlive=true, OK).

### 2.3 STEP 3 — Carica credentials

```bash
source ~/.elab-credentials/sprint-s-tokens.env
# Verifica presenza:
echo "RUNPOD: ${RUNPOD_API_KEY:0:10}..."
echo "CF: ${CLOUDFLARE_API_TOKEN:0:10}..."
echo "HF: ${HUGGINGFACE_TOKEN:0:10}..."
```

### 2.4 STEP 4 — Voice clone CRITICAL (sblocca box 8)

```bash
# IF voice file in Downloads (sandbox block):
cp ~/Downloads/"Senza nome 2.m4a" /tmp/voice-andrea.m4a
chmod 644 /tmp/voice-andrea.m4a
ls -la /tmp/voice-andrea.m4a  # verify presence
```

Senza voice clone: Coqui usa fallback Tammy Grit (XTTS-v2 built-in). Box 8 resta ⚠️ fino voice fornito.

### 2.5 STEP 5 — Pod state check

```bash
bash scripts/runpod-status.sh 5ren6xbrprhkl5
# Atteso JSON con desiredStatus: EXITED OR RUNNING
```

### 2.6 STEP 6 — Resume pod IF stack work needed

```bash
# Solo se devi lavorare su box 2,3,6,7,8:
bash scripts/runpod-resume.sh 5ren6xbrprhkl5
# ~2min boot

# Get new SSH port (cambia ogni resume):
bash scripts/runpod-status.sh 5ren6xbrprhkl5 | python3 -c "
import json, sys
d = json.load(sys.stdin)
for p in d['data']['pod']['runtime']['ports']:
  if p['privatePort'] == 22:
    print(f'SSH port: {p[\"publicPort\"]}'); break"
```

### 2.7 STEP 7 — Conferma a Claude

Type in chat: `Pronto Sprint S iter 3 ralph loop. Activate?`

### 2.8 STEP 8 — Paste activation string §3 sotto

---

## 3. ACTIVATION STRING (paste in chat dopo conferma Andrea)

```
/ralph-loop /caveman Sprint S iter 3 onniscenza onnipotenza definitiva. 5-agent team OPUS Pattern S (planner-opus + architect-opus + generator-app-opus + generator-test-opus + scribe-opus) communicanti via automa/team-state/messages/<from>-to-<to>-<TS>.md. CoV per ogni agente prima ogni claim fatto (vitest 12532+ PASS, npm run build PASS, baseline preserved). /quality-audit orchestratore fine ogni iter. Stress test ogni 4 iter Playwright + Control Chrome MCP su https://www.elabtutor.school production (iter 4=smoke prod URL+console errors, iter 8=E2E flow login+Capitolo+exp+UNLIM, iter 12=RAG retrieval verify Vol/pag accuracy, iter 16=TTS+STT live Coqui+Whisper round-trip, iter 20=80-tool dispatcher 10 sequential). Mac Mini autonomous H24 PID 23944 launchctl continua wiki batch v2 volumi-anchored (current 59/100 toward 100+ kebab-case lowercase). VPS GPU RunPod RTX A6000 48GB pod 5ren6xbrprhkl5 $0.49/h SMART ON/OFF discipline (resume ~2min boot, stop IMMEDIATO post-task, $13/mo storage 130GB modelli persisti). Hetzner GEX130 €838/mo commit SOLO quando 3+ paying schools. RAG 6000 chunks Anthropic Contextual Retrieval ingest via RunPod GPU embedding ~$2 one-time. Hybrid RAG BM25 + BGE-M3 + RRF k=60 + bge-reranker-large + top-5 to LLM. Together AI fallback gated emergency_anonymized canUseTogether NOT student_mode + 2 EU providers down audit log together_audit_log. Together API key già in Supabase secrets wired supabase/functions/_shared/llm-client.ts (wire callLLMWithFallback chain iter 3). UNLIM synthesis prompt v3 GIÀ DEPLOYED prod elab-unlim Edge Function (iter 2 commit a22b24d). R0 baseline 75.81% WARN misurato iter 2 — re-run R0 iter 3 priority misura delta post-deploy v3 (atteso lift dramatic plurale_ragazzi 0/10→7+/10). UNLIM voice profile Tammy Grit XTTS-v2 built-in default — auto-switch a voice clone quando /workspace/speaker_default.wav esiste >10KB (Andrea cp /tmp/voice-andrea.m4a sandbox pre-step). ClawBot 80-tool dispatcher Sprint 6 Day 39 post Sprint R5 PASS gate ≥90% scheletro UNLIM. SSH key id_ed25519_elab SOLO MacBook locale MAI GitHub MAI archive. SSH key id_ed25519_runpod dedicated RunPod. NO main push diretto. NO merge senza Andrea. Auto-deploy permission GRANTED IF R5 stress test ≥90% PASS. Pattern S 5-agent file ownership rigid: planner-opus owns automa/tasks+sprint-contracts+messages, architect-opus owns docs/architectures+adrs+strategy, generator-app-opus owns src+supabase+scripts/openclaw, generator-test-opus owns tests+scripts/openclaw/*.test.ts+scripts/bench, scribe-opus owns docs/audits+sunti+handoff+unlim-wiki+CLAUDE.md. Promise check SPRINT_S_COMPLETE 10 boxes ogni iter (1.VPS GPU deployed ✅ 2.7-component stack live ⚠️ 2/7 3.6000 RAG chunks ❌ 4.59/100 wiki ⚠️ 5.UNLIM v3 wired prod ✅ 6.Hybrid RAG ❌ 7.Vision flow ❌ 8.TTS+STT IT ⚠️ STT OK 9.R5 ≥90% ⚠️ R0 75.81% 10.ClawBot 80-tool ❌). Iter 2 close 2.5/10 box. Bug noti workaround: NO dockerArgs sleep infinity (kill SSHD), apt install zstd PRE Ollama, pip --ignore-installed transformers==4.46.3 + blinker (FlagEmbedding compat), 80GB+ container disk (Coqui safety). Output <promise>SPRINT_S_COMPLETE</promise> SOLO quando 10/10 TRUE verificati. Mai falso promise per uscire loop. Caveman mode ON chat replies caveman, code/commits normal language. Massima onesta zero compiacenza zero inflation score. --max-iterations 100 --completion-promise SPRINT_S_COMPLETE
```

---

## 4. Cosa serve da Andrea per sbloccare boxes

### 4.1 Voice clone (sblocca box 8)

```bash
cp ~/Downloads/"Senza nome 2.m4a" /tmp/voice-andrea.m4a
```

**SE non disponibile**: usa fallback Tammy Grit. Box 8 ⚠️ resta.

### 4.2 PR cascade merge (sblocca progressione su main)

Branch `feat/sprint-s-iter-2-software-prompt-v3-wireup-2026-04-26` ha 6 commits validi. Andrea decide:
- A) Merge in main via PR (apre PR + review + squash)
- B) Continue branch as-is per iter 3 (rebase main come needed)

### 4.3 Budget cap iter 3

5-agent OPUS dispatch: stima $30-100 per iter sostanzioso × 100 iter cap = $3-10k worst case.
Andrea conferma cap (es. "$50 weekend max" / "$200 monthly") OPPURE proceed senza cap.

### 4.4 RunPod credit refill

Saldo iter 2 close $14.21 — sufficient per 25-30h pod RTX A6000. Refill quando vicino $5 reside.

---

## 5. Iter 3 priorities (planner-opus prima dispatch)

### 5.1 P0 (do first)

1. **Resume pod** + bootstrap completion (BGE-M3 fix transformers + Coqui server start + ClawBot stub)
2. **Re-run R0 baseline** post deploy v3 → measure delta (verifica deploy a22b24d quality lift)
3. **Together AI fallback wire-up** `_shared/llm-client.ts` callLLMWithFallback chain
4. **Mac Mini batch v2 dispatch** continuo (5 concept × 4 batch = 80 concept toward 100+)
5. **Voice clone upload** se Andrea cp /tmp/voice-andrea.m4a (Coqui auto-switch)

### 5.2 P1 (after P0)

6. **Hybrid RAG migration apply** Supabase `2026-04-26_rag_chunks_hybrid_anthropic.sql`
7. **6000 RAG chunks ingest** via `scripts/rag-contextual-ingest.mjs` (depend BGE-M3 server)
8. **Vision flow E2E** (Qwen2.5-VL screenshot test)
9. **PR cascade merge** main (Andrea action)

### 5.3 P2 (defer iter 5+)

10. ClawBot 80-tool dispatcher (Sprint 6 Day 39 gate Sprint R5 PASS)
11. R5 stress 50 prompts ≥90% (iter 5+ expand fixture)
12. Hetzner GEX130 commit (3+ paying schools trigger)

---

## 6. Mac Mini overnight loop (background work autonomous)

While Andrea sleeps / iter 3 runs:

```bash
# Dispatch overnight 3 batch × 5 concept = 15 concept progress
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 \
  'rm -f ~/.elab-batch-result && nohup bash -c "
~/scripts/elab-wiki-batch-gen-v2.sh \"if-condizionali while-loop for-loop array funzioni-arduino\"
sleep 30
~/scripts/elab-wiki-batch-gen-v2.sh \"watt-potenza frequenza periodo onda-quadra onda-sinusoidale\"
sleep 30
~/scripts/elab-wiki-batch-gen-v2.sh \"misurare-tensione misurare-corrente misurare-resistenza isolamento sicurezza-elettrica\"
" > /tmp/overnight-batch.log 2>&1 & disown'

# Mattino: pull risultati
for c in if-condizionali while-loop for-loop array funzioni-arduino \
         watt-potenza frequenza periodo onda-quadra onda-sinusoidale \
         misurare-tensione misurare-corrente misurare-resistenza isolamento sicurezza-elettrica; do
  scp -i ~/.ssh/id_ed25519_elab \
    "progettibelli@100.124.198.59:~/Projects/elab-tutor/docs/unlim-wiki/concepts/$c.md" \
    "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/unlim-wiki/concepts/" 2>&1
done
```

Target overnight: 59 → 74+ concepts (75% verso 100+).

---

## 7. Files Sprint S iter 2 — riferimento completo

### 7.1 PDR + handoff + audit

- `docs/pdr/PDR-SPRINT-S-ITER-3-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md` ← MASTER iter 3 (THIS REFERENCES)
- `docs/pdr/PDR-SPRINT-S-ITER-2-RALPH-LOOP-5-AGENT-2026-04-26.md` ← iter 2 PDR
- `docs/handoff/2026-04-26-sprint-s-iter-3-handoff.md` ← QUESTO doc
- `docs/handoff/2026-04-26-sprint-s-iter2-handoff.md` ← iter 2 handoff (precedente)
- `docs/audits/2026-04-26-sprint-s-iter2-audit.md` ← iter 2 audit FINAL (12 honesty caveats, 246 righe)
- `docs/audits/2026-04-26-sprint-s-iter4-stress-smoke.md` ← iter 4 stress smoke (HTTP 200 + 0 errors)
- `docs/audits/iter4-smoke-prod-2026-04-26.png` ← Playwright screenshot evidence

### 7.2 ADR

- `docs/adrs/ADR-008-buildCapitoloPromptFragment-design.md` (architect-opus, 424 righe)
- `docs/adrs/ADR-009-principio-zero-validator-middleware.md` (architect-opus, 563 righe)

### 7.3 Code (gen-app-opus)

- `supabase/functions/_shared/capitoli-loader.ts` (+131 buildCapitoloPromptFragment)
- `supabase/functions/_shared/principio-zero-validator.ts` NEW (6 PZ rules runtime)
- `supabase/functions/_shared/system-prompt.ts` (BASE_PROMPT v3 sintesi+plurale)
- `supabase/functions/unlim-chat/index.ts` (wire-up Capitolo + post-LLM PZ)
- `src/components/lavagna/LavagnaShell.jsx` (+117 CapitoloPicker + handleCitationClick)
- `src/components/lavagna/AppHeader.jsx` (+19 Capitoli button)

### 7.4 Tests (gen-test-opus)

- `tests/unit/buildCapitoloPromptFragment.test.js` (9 PASS)
- `tests/unit/principioZeroValidator.test.js` (19 PASS + 8 todo)
- `tests/integration/unlim-chat-prompt-v3.test.js` (6 PASS)

### 7.5 Bench (gen-test-opus)

- `scripts/bench/run-sprint-r0-render.mjs` (R0 runner Render endpoint)
- `scripts/bench/output/r0-render-{report,responses,scores}-2026-04-26T09-35-59-692Z.{md,jsonl,json}` (R0 baseline 75.81% WARN)

### 7.6 Wiki context (Mac Mini volumi-anchored)

- `automa/wiki-context/elab-wiki-batch-gen-v2.sh` (script v2 + checkout feature branch fix)
- `automa/wiki-context/volumi-text/vol1.txt` (2355 righe Vol1 ITA Completo V0.1 GP)
- `automa/wiki-context/volumi-text/vol2.txt` (3058 righe Vol2 ITA Completo GP V0.1)
- `automa/wiki-context/volumi-text/vol3.txt` (2777 righe Manuale VOLUME 3 V0.8.1)

### 7.7 Wiki concepts (+9 iter 2)

- Iter 9: `analog-read.md` `digital-write.md` `pin-mode.md` (update) + `ohm.md` `amperometro.md` (NEW)
- Iter 16: `fade-led.md` `semaforo.md` `allarme.md` `cronometro.md` (4 NEW)
- Total local: 50 → 59 (+9)

### 7.8 Sprint contract + atomic tasks + messages

- `automa/team-state/sprint-contracts/sprint-S-iter-2-contract.md`
- `automa/tasks/pending/ATOM-S2-A-{01..07}.md` + `ATOM-S2-B-{01..05}.md`
- `automa/team-state/messages/{planner,architect,gen-test,gen-app,scribe}-opus-to-*-2026-04-26*.md` (7 messaggi)

---

## 8. Skills mappa Sprint S iter 3

### 8.1 Always-on (load first)

- `superpowers:using-superpowers` (entry, MANDATORY skill discovery)
- `ralph-loop:ralph-loop` (loop framework)
- `superpowers:writing-plans` (PDR generation)
- `agent-orchestration:multi-agent-optimize` (5-agent core orchestration)
- `quality-audit` (orchestrator fine ogni iter)

### 8.2 Per agente OPUS (load on demand)

| Agent | Skills |
|-------|--------|
| planner-opus | superpowers:writing-plans, superpowers:brainstorming, agent-orchestration:multi-agent-optimize, agent-teams:team-delegate |
| architect-opus | engineering:architecture, engineering:system-design, design:design-system, agent-orchestration:improve-agent |
| generator-app-opus | superpowers:test-driven-development, backend-development:feature-development, agent-teams:team-feature |
| generator-test-opus | superpowers:test-driven-development, full-stack-orchestration:test-automator, agent-teams:team-review |
| scribe-opus | engineering:documentation, claude-md-management:revise-claude-md, claude-md-management:claude-md-improver |

### 8.3 Per stress test iter 4, 8, 12, 16, 20

Load via ToolSearch each iter:
- `mcp__plugin_playwright_playwright__browser_navigate`
- `mcp__plugin_playwright_playwright__browser_snapshot`
- `mcp__plugin_playwright_playwright__browser_click`
- `mcp__plugin_playwright_playwright__browser_evaluate`
- `mcp__plugin_playwright_playwright__browser_take_screenshot`
- `mcp__plugin_playwright_playwright__browser_console_messages`
- `mcp__plugin_playwright_playwright__browser_select_option`
- `mcp__plugin_playwright_playwright__browser_fill_form`

Plus `engineering:testing-strategy` skill orchestratore stress test.

### 8.4 Verification + audit

- `superpowers:verification-before-completion` (pre-claim CoV)
- `claude-md-management:claude-md-improver` (CLAUDE.md audit)

### 8.5 NEW skill ideas (Andrea may create iter 3+)

5 skill candidates per accelerare iter futuri:
1. **`elab-pod-recreate`** — bake-in tutti bug fixes (no dockerArgs + zstd + transformers compat + 80GB disk)
2. **`elab-r0-rerun-render`** — re-run R0 baseline + delta vs previous
3. **`elab-mac-mini-batch-v2`** — wrapper su `~/scripts/elab-wiki-batch-gen-v2.sh`
4. **`elab-stack-bootstrap`** — bootstrap stack v3 in pod con tutti workarounds
5. **`elab-tres-jolie-curate`** — Tea-driven curation Tres Jolie material

Vedi PDR §11.5 per template YAML completi.

---

## 9. Honesty caveats (10 esplicit)

1. **Box 5 ✅ ma R0 NON verificato delta**: deploy success ≠ quality lift. Re-run R0 iter 3 OBBLIGATORIO.
2. **Voice clone Andrea sandbox block**: 3 iter consecutivi (1, 2, 3 incoming). Risolvibile SOLO Andrea cp manuale.
3. **5-agent OPUS cost**: stima $30-100/iter sostanzioso. Andrea cap budget consigliato.
4. **Box 4 wiki 59/100**: target 100 distante, Mac Mini overnight ridurre 41 concept.
5. **Box 6,7 hybrid RAG + vision**: dipendono BGE-M3 server fix + Qwen-VL prompt engineering iter 3+.
6. **Box 10 ClawBot 80-tool**: blocked Sprint 6 Day 39 post Sprint R5 ≥90% PASS gate.
7. **Tres Jolie material non pedagogico**: corporate + foto + LOGO. Wiki concept usa SOLO volumi-text.
8. **Together AI fallback wire-up NOT done**: scaffold ready iter 1, callLLMWithFallback chain pending iter 3 gen-app-opus task.
9. **Pod recreate bug fixes manuali**: 3 fix critici (no dockerArgs + zstd + transformers) ancora manuali. Skill `elab-pod-recreate` defer.
10. **Iter 4 stress test smoke + iter 8 E2E partial**: login gate richiede chiave univoca, fixture auth mancante. Iter 12 RAG retrieval test gate.

---

## 10. Cost projection iter 3

| Item | Cost stima |
|------|-----------|
| RunPod RTX A6000 ~6h work session | ~$3 |
| RunPod storage continuo | $13/mo (ammortizzato) |
| Anthropic 5-agent OPUS dispatch ~iter 3-10 | $100-300 |
| Supabase free tier | $0 |
| Vercel Pro paid | already paid |
| Render free tier | $0 |
| Mac Mini overnight | $0 marginal |
| **Total iter 3 stima** | **$100-320** |

---

## 11. Final notes

### 11.1 Pattern S 5-agent advantages

- Parallelism: 5 agenti in parallel = 5x throughput vs single agent
- File ownership rigid = no merge conflicts intra-iter
- CoV per agente = anti-regression discipline
- /quality-audit orchestratore = oggettivo, non self-claim

### 11.2 Ralph loop advantages

- Auto-iteration toward goal (SPRINT_S_COMPLETE 10 boxes)
- Promise check oggettivo (no false claim)
- Stop hook fire = forced reflection per iter
- Max iter cap = budget protection

### 11.3 Caveman mode

- Token efficient (drop articoli + fluff)
- Brief replies, code normal
- Andrea preferenza esplicita

### 11.4 Smart on/off

- Pod stop IMMEDIATO post-task (cost discipline)
- Mac Mini autonomous H24 = no marginal
- Anthropic spend per iter solo quando work sostanziale

---

**File path**: `docs/handoff/2026-04-26-sprint-s-iter-3-handoff.md`
**Pairs with**: `docs/pdr/PDR-SPRINT-S-ITER-3-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md` (master PDR)
**Activation**: §3 above (paste-ready string)
**Setup**: §2 step-by-step Andrea
**Honesty**: 10 caveats explicit
