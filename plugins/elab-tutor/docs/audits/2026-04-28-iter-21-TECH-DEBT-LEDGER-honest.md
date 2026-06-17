# ITER 21 ENTRANCE — TECH DEBT LEDGER (massima onestà G45 NO compiacenza)

**Date**: 2026-04-28 21:00 CEST  
**HEAD**: `09d47a50` branch `feat/sprint-s-iter-2-software-prompt-v3-wireup-2026-04-26`  
**Vitest baseline last verified**: 12794 PASS (iter 20 close)  
**Author**: Claude orchestrator iter 21 entrance, caveman mode, NO inflation

---

## 0. Sommario brutale

Iter 18-20 docs claim **8.5-8.8/10**. Iter 21 entrance reality check rivela:

- ✅ Vercel env compile-proxy DONE (57m ago Production) — Andrea ratify queue voce 8 SILENZIOSAMENTE COMPLETED
- ✅ Mac Mini SSH WORKING via Tailscale `progettibelli@100.124.198.59` — iter 20 close "SSH .local fail" era ERRORE USER (`progettidigetto` ≠ `progettibelli`)
- 🔴 RunPod pod `elab-iter18-a6000` ALIVE 6h ZERO work, GPU 0% util, bootstrap MAI eseguito → ~$2.40 sprecati (balance $11.15 NON $13.63 claim iter 18)
- 🔴 Harness 2.0 iter 19 = **FALSE POSITIVE** confermato. 94/94 "pass" sono check static JSON (`components_count`, `wires_count`) NON real browser interaction. Andrea ripete 3x "esperimenti non funzionano" — harness NON valida funzionamento.
- 🔴 Mac Mini autonomous loop = solo HEARTBEAT log ogni 5min, NESSUN trigger work eseguito 6h+
- 🔴 Volumi narrative MINUTA mapping cap-by-cap NON eseguito iter 12-20 (deferred 5 volte)
- 🔴 Linguaggio audit imperative singolare NON eseguito iter 12-20
- 🔴 Esperimenti REAL Playwright UNO PER UNO NON eseguito iter 12-20 (5 volte deferred)
- 🔴 Tech debt accumulato 8+ iter (Andrea call out diretto)

**Score onesto iter 21 entrance**: **7.8/10** — declassato da 8.5-8.7 claim post discovery harness 2.0 false positive + 6h pod waste + Mac Mini loop stub.

---

## 1. Pre-flight CoV iter 21 entrance — risultati verificati

| Check | Atteso | Reale | Status |
|-------|--------|-------|--------|
| Git HEAD | 09d47a5 | 09d47a5 | ✅ |
| Branch sync origin | clean | clean | ✅ |
| Modified runtime | 0 | 2 (heartbeat + iter-19-harness-2.0-results.json) | 🟡 automa state OK |
| Vercel prod | 200 | 200 | ✅ |
| Edge Fn compile-proxy | 200 OPTIONS | 204 OPTIONS | ✅ |
| Edge Fn unlim-chat | 200 OPTIONS | 204 OPTIONS | ✅ |
| Vercel env `VITE_COMPILE_WEBHOOK_URL` | NOT set (claim iter 20) | **SET 57m ago Production** | ✅ Andrea ratify voce 8 DONE silently |
| Mac Mini SSH | progettibelli@100.124.198.59 OK | OK 22d uptime arm64 M4 | ✅ |
| Mac Mini repo HEAD | 09d47a5 | 592ea3a → 09d47a5 (post pull) | ✅ synced |
| Mac Mini autonomous loop | productive | HEARTBEAT-only 5min cycle, 0 trigger work | 🔴 stub |
| RunPod pod | dispatched iter 18 | ALIVE 6h, GPU 0% util, no model loaded | 🔴 wasted |
| RunPod balance | $13.63 claim iter 18 | **$11.15** (–$2.48 sprecati) | 🔴 Andrea "non sprechiamo 13" violato |
| Tea 3 PDF Glossario | located | `~/VOLUME 3/TEA/GLOSSARIO TEA 28 APRILE/Glossario_Vol{1,2,3}.pdf` | ✅ |

---

## 2. Credentials inventory — RECOVERED tutti i token disponibili

**Andrea call out**: "i token li hai tutti, recupera da scorse sessioni". Confermato.

| Token | Source | Live verify | Use case |
|-------|--------|-------------|----------|
| `GITHUB_TOKEN` (ghp_...) | `~/.zshrc` + `gh auth token` | ✅ logged in AndreaMarro | git ops, gh CLI |
| `SUPABASE_ACCESS_TOKEN` (sbp_...) | `~/.zshrc` | ✅ valid | Edge Fn deploy, supabase CLI |
| `TOGETHER_API_KEY` (tgp_v1_...) | `~/.zshrc` | ✅ valid | Llama 70B inference |
| Vercel API token (vca_...) | `~/Library/Application Support/com.vercel.cli/auth.json` | ✅ andreamarro logged in | env switch, redeploy |
| `RUNPOD_API_KEY` | `~/.elab-credentials/sprint-s-tokens.env` | ✅ balance query OK | pod create/stop/exec |
| `CLOUDFLARE_API_TOKEN` | `~/.elab-credentials/sprint-s-tokens.env` | not tested | Workers, R2, KV |
| `HUGGINGFACE_TOKEN` | `~/.elab-credentials/sprint-s-tokens.env` | not tested | model downloads |
| `ELAB_API_KEY` | `~/.elab-credentials/sprint-s-tokens.env` | not tested | unlim-chat header |
| `ANTHROPIC_API_KEY` | `automa/.env` | not tested | Claude API |
| `DEEPSEEK_API_KEY` | `automa/.env` | not tested | DeepSeek inference |
| `GEMINI_API_KEY` | `automa/.env` | not tested | Gemini routing |
| `KIMI_API_KEY` | `automa/.env` | not tested | Kimi inference |
| `NETLIFY_AUTH_TOKEN` | `automa/.env` | not tested | Netlify deploy |
| `VITE_SUPABASE_ANON_KEY` | `.env` | ✅ used PROD | client Supabase |
| `VITE_SUPABASE_EDGE_KEY` | `.env` | ✅ used PROD | Edge Fn header |

**Missing (Andrea action queue)**:
- `MISTRAL_API_KEY` — Andrea PAYG signup PENDING (ratify queue voce 9)
- `VOYAGE_API_KEY` — embeddings paid tier (alt: BGE-M3 self-hosted via RunPod bootstrap NOW)
- Supabase **service_role** key (separate da access token sbp_) — needed per Edge Fn migrations apply

---

## 3. RunPod state honest — POD ALIVE BUT IDLE

Pod dettagli verificati 21:00 CEST:
```
ID: tgrdfmwscoo991
Name: elab-iter18-a6000
GPU: NVIDIA RTX A6000 48GB
Status: RUNNING uptime 21439s (6h)
Cost: $0.40/hr
Image: runpod/pytorch:2.4.0-py3.11-cuda12.4.1-devel-ubuntu22.04
GPU memory used: 1 MiB / 49140 MiB
GPU util: 0%
Processes: SOLO nginx (RunPod proxy), NO vLLM/Ollama/Python servers
Bootstrap: NEVER run before iter 21 entrance
```

**Diagnosi**: pod creato iter 18 close MA `runpod-bootstrap.sh` MAI uploadato/eseguito. Pod = container vuoto burning $0.40/hr.

**Action iter 21 entrance** (Andrea explicit "sfruttalo al meglio"):
1. ✅ SCP `runpod-bootstrap.sh` to `/workspace/bootstrap.sh` — DONE 21:02
2. ✅ Install tmux + start bootstrap in detached session — DONE 21:03
3. ⏳ Bootstrap loading models ~10-20 min (Ollama Qwen2.5-VL + BGE-M3 + Coqui + Whisper + FLUX + ClawBot)
4. ⏳ Post-bootstrap: run benchmark gold-set v4 + RAG quality test + Voxtral test
5. ⏳ Sync results JSON back to repo
6. ⏳ Auto-stop pod when benchmarks complete (frugale Andrea mandate "non sprechiamo 13")

**Cost estimate iter 21**: ~$1.50-2.00 productive use (3-5h post-bootstrap). Reserve $9 balance per iter 22+ vision/voice clone.

---

## 4. Mac Mini autonomous state — HONEST

```
SSH: progettibelli@100.124.198.59 (Tailscale 100.124.198.59)
Hardware: arm64 M4 16GB
Uptime: 22 days 5h
Repo path canonical: /Users/progettibelli/Projects/elab-tutor (NOT ~/elab-mac-mini-workspace)
Repo HEAD: 09d47a5 (synced this session)
Cron alive: 4 (stress 6h + wiki 22:30 daily + volumi-diff Sun 03:00 + heartbeat 30min)
Launchctl: com.elab.mac-mini-autonomous-loop ACTIVE pid=23944
Loop script: /Users/progettibelli/scripts/elab-mac-mini-autonomous-loop.sh
Loop logic: HEARTBEAT 5min + watch ~/.elab-trigger file for manual dispatch
```

**Diagnosi**: loop ALIVE MA passive. Solo riceve heartbeat + esegue trigger SE Andrea/orchestrator scrive `~/.elab-trigger`. NO autonomous proactive task generation.

**Tech debt**: Mac Mini = "secondo cervello" Andrea wants → loop NEEDS proactive task generation logic (current = stub).

**Action iter 21**: dispatch trigger files via SSH per:
- D3 Volumi PDF audit (`~/.elab-trigger` ← bash script)
- D2 Wiki Analogia ingest pipeline
- D6 Quality audit cron 12h
- D8 harness regression run

---

## 5. Harness 2.0 iter 19 — FALSE POSITIVE confermato

File: `automa/state/iter-19-harness-2.0-results.json`

```json
{ "iter": 19, "n": 94, "pass": 94, "fail": 0,
  "results": [{
    "experiment_id": "v1-cap10-esp1",
    "interaction_checks": {
      "mounted_components_count": true,
      "description_non_empty": true,
      "description_cita_titolo": true,
      "state_capturable": true,
      "components_match_expected": true
    }
  }, ...]
}
```

**Cosa fa effettivamente**: legge JSON `lesson-paths/v*-cap*-esp*.json`, conta `components.length`, verifica `description.length > 0`, verifica `description` cita `titolo`, verifica state JSON serializzabile, verifica components match expected schema.

**Cosa NON fa**:
- ❌ NO browser launch
- ❌ NO React component mount
- ❌ NO simulator interaction
- ❌ NO Arduino compile real
- ❌ NO user click/drag
- ❌ NO screenshot capture
- ❌ NO Vol/pag verbatim citation verify
- ❌ NO "esperimento funziona" verification

**Risultato**: 94/94 "pass" = JSON ben formattato. NIENTE about funzionamento UI esperimento. **Andrea mandate "esperimenti UNO PER UNO Playwright real browser" NON soddisfatto**.

**Action iter 21**: scrivere REAL Playwright UNO PER UNO test:
- Loop su 92 lesson-paths
- Per ogni: browser navigate `https://www.elabtutor.school` + select lesson + mount + interact + screenshot + verify HEX compile + assertion sui criteri PRINCIPIO ZERO V3 (linguaggio plurale, Vol/pag verbatim, ≤60 parole, Italian Flesch)
- Output broken count REALE + screenshot diff per esperimento

---

## 6. Volumi narrative MINUTA — DEFERRED 5 iter

ADR-027 PROPOSED iter 19. Mapping cap-by-cap PDF Vol1/Vol2/Vol3 vs lesson-paths flat 92 NON eseguito.

Tea 3 PDF disponibili NEW iter 21:
- `/Users/andreamarro/VOLUME 3/TEA/GLOSSARIO TEA 28 APRILE/Glossario_Vol1_ELAB_2026-04-27.pdf`
- `/Users/andreamarro/VOLUME 3/TEA/GLOSSARIO TEA 28 APRILE/Glossario_Vol2_ELAB_2026-04-27.pdf`
- `/Users/andreamarro/VOLUME 3/TEA/GLOSSARIO TEA 28 APRILE/Glossario_Vol3_ELAB_2026-04-27.pdf`

**Action iter 21**: spawn agent Volumi narrative MINUTA → output `automa/state/VOLUMI-EXPERIMENT-ALIGNMENT.md` + ingest Glossario PDF → wiki concepts table Supabase.

---

## 7. Andrea ratify queue iter 21 entrance — VERIFICATO

| # | Voce | Status iter 18 close docs | Status iter 21 entrance verify |
|---|------|---------------------------|--------------------------------|
| 1 | Modalità 4 simplification (ADR-025) | PROPOSED | PROPOSED, Andrea ratify still pending |
| 2 | Libero auto-Percorso UX | PROPOSED | PROPOSED |
| 3 | Già Montato implementation | PROPOSED | PROPOSED |
| 4 | ClawBot consapevolezza onniscenza-bridge | PROPOSED | PROPOSED |
| 5 | Content safety guard 10 rules (ADR-026) | PROPOSED | PROPOSED |
| 6 | Volumi narrative refactor (ADR-027) | PROPOSED | PROPOSED |
| 7 | RunPod $13 stessi modelli production Scaleway | Andrea OK iter 18 mandate | ✅ **EXECUTING NOW** bootstrap pod |
| 8 | Vercel env compile-proxy URL switch | PENDING | ✅ **DONE silenziosamente Andrea 57m ago** |
| 9 | Mistral PAYG signup | PENDING | PENDING (Andrea action) |
| 10 | Tea co-founder equity 25% | PENDING | PENDING (Andrea action) |

**Ratify chiusi iter 21 entrance**: voce 7 (executing) + voce 8 (done). 8 voci pending.

---

## 8. Tech debt accumulato — Andrea call out giustificato

Iter 12-20 deferred:
1. ❌ Volumi narrative MINUTA (5 iter deferred)
2. ❌ Esperimenti REAL Playwright UNO PER UNO (5 iter deferred, harness 2.0 = false positive)
3. ❌ Linguaggio audit imperative singolare (5 iter deferred)
4. ❌ Mac Mini productive autonomous loop (heartbeat-only, NEVER promoted to task gen)
5. ❌ Mac Mini SSH troubleshooting (iter 18-20 docs lied — `progettidigetto` user wrong, real = `progettibelli`)
6. ❌ RunPod bootstrap (pod created iter 18, NEVER run, 6h $2.40 wasted)
7. ❌ Persona simulation 5+ utenti psicologie (mandate iter 18, deferred)
8. ❌ Grafica overhaul `/impeccable` + `/frontend-design` + `/design-critique` (mandate iter 18, deferred)
9. ❌ Tea Glossario ingest pipeline (PDF disponibili iter 21, NON ingested ancora)
10. ❌ ADR-025/026/027 ratify Andrea + implementation (PROPOSED iter 19, NEVER reviewed)

---

## 9. Iter 21 execution plan — concrete

Parallel work iter 21 entrance:

### A. Background long-running (kicked off NOW)
- ⏳ RunPod pod bootstrap full stack (Ollama Qwen2.5-VL + BGE-M3 + Coqui + Whisper + FLUX + ClawBot dispatcher) — tmux session `boot` running
- ⏳ Bootstrap ~10-20min, then auto-benchmark gold-set v4 + RAG quality + Voxtral

### B. Parallel agents (general-purpose subagent_type)
- Agent 1: **Fotografia PROD** Playwright readonly audit elabtutor.school (mascotte UNLIM + ChatOverlay + Lavagna + Modalità switch + Compila button real)
- Agent 2: **Volumi narrative MINUTA** read Tea Vol1/Vol2/Vol3 Glossario PDF + grep `src/data/lesson-paths/v*.json` cap-by-cap mapping → output `automa/state/VOLUMI-EXPERIMENT-ALIGNMENT.md`
- Agent 3: **Linguaggio audit** grep `src/` for imperative singolare ("fai", "devi", "tuo" senza "Ragazzi,") + Vol/pag NON VERBATIM + missing analogia → file-by-file report
- Agent 4: **Esperimenti REAL Playwright UNO PER UNO** — write E2E spec ALL 92 lesson-paths, real browser mount + interact + screenshot + assert PRINCIPIO ZERO V3 → output broken count REALE

### C. Mac Mini delegation (trigger via SSH)
- D2 Wiki Analogia + Glossario Tea ingest pipeline (3 PDF → 360 chunks BGE-M3 once pod live OR Voyage)
- D3 Volumi PDF narrative continuum step 1 mapping (parallel agent 2 above, run on Mac Mini idle CPU)
- D4 R5+R6 stress prod regression cron 6h (already alive)
- D8 harness 2.0 92 esperimenti regression continuous

### D. Sequential post-agents
- Aggregate findings → score recalibrate
- Commit findings docs (NO production code change yet, audit only)
- Activate ralph-loop max 100 iterations Sprint T iter 21+ with concrete task list
- Andrea ratify gate iter 22 entrance

---

## 10. NO compiacenza — claims verificati

Iter 18 close claim "compile-proxy Edge Fn deployed live + Vercel prod 200" → **VERO** ma incompleto. Vercel env switch silenziosamente fatto Andrea 57m ago. Chiusura voce ratify queue 8.

Iter 18 close claim "Mac Mini SSH unlocked id_ed25519_elab + 4 cron alive" → **VERO ma user sbagliato** in docs successivi (`progettidigetto` ≠ `progettibelli`).

Iter 19 claim "harness 2.0 systematic 92 esperimenti EXECUTED + report broken count" → **FALSO** sui 92 (è 94 file count) + FALSO sul broken count (zero broken claim = static JSON pass, NON browser real).

Iter 20 claim "RunPod $13.63 balance preserved" → **FALSO** ($11.15 reale, $2.48 wasted pod idle 6h).

Iter 20 claim "Mac Mini D1-D8 trigger autonomous" → **FALSO** (loop = heartbeat-only, NO trigger executed iter 18-20).

---

**FINE LEDGER**. Aggiornare ogni 4 iter con discoveries nuove + close items.
