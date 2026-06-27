# ADR — Model & Inference-Runtime Strategy: FACTORY models ≠ PRODUCT models, provider-abstraction first — 2026-06-26

> Status: **ACCEPTED** (Andrea 2026-06-27: "per queste prendi le migliori scelte in termini di qualità e beneficio" → gates resolved below). Choices A2-verified by a 12-agent research+adversarial-verify swarm (`wf_0b994830-3e1`, all 6 dimensions REVISE-not-REJECT). Physical install steps remain to be executed (offered, not yet run). The **RESOLVED DECISIONS** section supersedes any conflicting cell in Principles 3–5 above.
> Sibling of [[ADR-MEMORY-DUAL-ARCHITECTURE-2026-06-26]] — same two-plane fork (FACTORY vs PRODUCT), applied to *which model runs where*.
> Sources read firsthand this session: ds4 README (raw.githubusercontent, re-fetched), [[PRD-ARDESIA-v17-2026-06-26]] §1/§5/§6b/§7, [[TOOLS-MASTER-2026-06-26]]. Hardware probed firsthand. Model-class claims not verifiable from a file are tagged **(knowledge)**; wiring claims are **(spec)**.
> ID: D-MODEL-STRATEGY-TWO-PLANE. Append-only ledger entry.

---

## Context

Andrea's question (verbatim intent): *consider runtimes other than Ollama; distinguish models optimal for the FACTORY from models optimal for ARDESIA the product; leave room for API choice and per-device choice (iPad / PC / LIM); cover multimodality and coding; evaluate the new repo `antirez/ds4`.*

### Firsthand hardware (the constraint that forks everything)
- **MacBook (this machine): Apple M1, 8 GB** unified memory (`hw.memsize` = 8589934592).
- **mini (`ssh macmini`): Apple M4-class (T8132), 16 GB** unified memory (17179869184); `uname` darwin 24.6.0 arm64.
- **mini: `ollama` ABSENT, `mineru` ABSENT** (confirmed `which` → not found). Matches [[PRD-ARDESIA-v17-2026-06-26]] §2 blocco.
- **iPad / LIM**: iPadOS and whiteboard panels **cannot run Ollama, MLX-server, or llama.cpp-server as a daemon** — on-device inference there means an embedded runtime (Core ML / MLX-Swift / llama.cpp-iOS / WebGPU) or a remote API.

The fleet is **memory-poor and all-Apple-Silicon**. 8 GB and 16 GB cap local-model size hard: a 7–8B model Q4 ≈ 5–6 GB resident; a 2–4B model is the comfortable interactive size; anything ≥30B is SSD-streamed (slow) or cloud.

### `antirez/ds4` (DwarfStar) — firsthand README
- C, self-contained inference engine, "developed with strong assistance from GPT 5.5". MIT (retains GGML notices). Built on the llama.cpp/GGML path.
- **Runs DeepSeek V4 Flash / PRO only** — not a generic runner.
- Backends: **Metal (macOS primary)**, CUDA, ROCm. KV-cache in RAM **and SSD**; **SSD streaming to run models larger than RAM**; distributed inference over TCP; speculative decoding (MTP).
- Ships an **integrated coding agent** + **HTTP server API** explicitly compatible with *"opencode, Pi, Codex CLI, Claude Code"* clients; tool-calling in DeepSeek DSML.
- Stated target: **"high-end personal computers and Mac Studios."**

The decisive read: ds4 is a *factory-plane coding backend for a high-end box*. On a 16 GB mini it can only SSD-stream DeepSeek-V4 — too slow for interactive tutoring, marginal even for batch. It carries **no value for the product plane** and **no value on the current fleet**; it becomes interesting only if a Mac-Studio-class machine is acquired.

### Why the existing PRD makes this ADR necessary
PRD v17 already (a) forks memory FACTORY vs PRODUCT, (b) names **Qwen3.5 + Ollama** for product on-device, (c) names **elab-galileo-nanobot** (multi-LLM router + cache + racing + quality) as P0#2/#4 "leva massima". But it conflates "install Ollama on the mini" with "the product runs on-device" — the iPad/LIM targets **cannot** use Ollama. And it has no explicit *model-selection* contract. This ADR supplies it.

---

## Decision

### Principle 1 — Two model planes, never one model for both
FACTORY models and PRODUCT models are selected on **opposite** objective functions, exactly mirroring [[ADR-MEMORY-DUAL-ARCHITECTURE-2026-06-26]]:

| | FACTORY plane | PRODUCT (ARDESIA) plane |
|---|---|---|
| Optimize for | coding, agentic tool-use, long-context reasoning | pedagogy, Italian, multimodal STEM, low latency |
| Privacy | no end-user PII → **cloud API allowed** | PII by construction → **local/on-device, egress-deny** |
| Cost shape | bursty, token-heavy → compress + cheap finders | many concurrent students → cheap/free per-call |
| Latency | tolerant (background loop) | interactive (kid waiting) |
| Quality bar | apex (correctness of code) | "good + safe + grounded", not apex |

### Principle 2 — Provider abstraction is the keystone, not a runtime
Adopt **elab-galileo-nanobot as the single inference gateway** for BOTH planes (PRD P0#2/#4). It is an OpenAI-compatible router (multi-LLM, cache, racing, quality-scoring). Every model — cloud or local — sits **behind** it. This is what delivers Andrea's "leave room for API choice + per-device choice": selection becomes a routing policy keyed on `(plane × device × privacy-tier × modality)`, not a hard-coded model. **Galileo Brain (Qwen3.5-2B fine-tune)** is the routing/dispatch model that already exists — keep it as the policy head.

Consequence: the "Ollama vs X" question stops being load-bearing. Ollama becomes *one swappable backend*, not the architecture.

### Principle 3 — FACTORY model roster (cloud-first, no PII)
- **Builder (A1/A2): keep Claude Opus** (`claude-opus-4-8`) — apex code quality; do NOT downgrade. **(knowledge)**
- **Finders (high-volume, FP-tolerant): cheap reasoning models** — DeepSeek-V4 / Kimi / GLM / Haiku class via API behind nanobot. Apply **headroom input-compression on the Hermes finders first** (PRD P0#3 / [[TOOLS-MASTER-2026-06-26]] §3: −60–95% input tokens, low risk) — this is the real cost lever, not a model swap.
- **ds4 / DeepSeek-V4-local: WATCH / DEFER.** Revisit only if a Mac-Studio-class box is acquired; then ds4 is a strong **cheap-local coding finder/builder** (OpenAI-compatible → drops straight behind nanobot, MIT, Metal-native). On the 8/16 GB fleet it is not runnable usefully. No work now.

### Principle 4 — PRODUCT model roster, by device (PII, local/egress-deny)
| Device | Runtime | Model class | Notes |
|---|---|---|---|
| **mini** (classroom server) | **MLX (`mlx_lm.server`) preferred; Ollama acceptable** | Qwen3.5 4–8B Q4 + Galileo-Brain router | 16 GB → one 7–8B Q4 *or* a VLM, not both hot. Serves a room over LAN. |
| **PC / Mac (teacher)** | MLX or Ollama | Qwen3.5 4–8B | same as mini |
| **iPad** | **Core ML / MLX-Swift / llama.cpp-iOS embedded** (NOT Ollama) | Qwen3.5 ~3B Q4 on-device, else API-when-online | iPad cannot host a server daemon — embedded or remote only. **(spec)** |
| **LIM** (whiteboard panel/browser) | **WebGPU (WebLLM)** or remote API | small Qwen3.5 or API | depends on panel OS; browser path = WebLLM. **(spec)** |

**On Ollama vs alternatives** — recommendation for the all-Apple, RAM-poor fleet: prefer **MLX** for local serving (faster + lower memory than Ollama's llama.cpp-Metal on Apple Silicon, which matters at 8–16 GB) **(knowledge)**. But Ollama is the lower-friction fast-path and is what TencentDB-Agent-Memory / PRD already assume — so **Ollama is an acceptable unblock for P0#1**; the runtime is not the moat and is swappable behind nanobot. Other runtimes ranked: `llama.cpp/llama-server` (portable, OpenAI-compat, GGUF) = solid fallback; `vLLM` = SKIP (needs real GPU); `WebLLM` = the only browser/LIM path; `ds4` = factory-only/high-end-only.

### Principle 5 — Multimodality
- **Document multimodality (book PDFs → circuits/Fritzing/formulas/IT)** is already solved offline by **MinerU** on the mini-CPU ([[TOOLS-MASTER-2026-06-26]] §2) — this is the 813-volume pipeline, not a chat-VLM job. Keep.
- **Interactive multimodality (kid photographs a circuit / handwriting on the LIM)** needs a **VLM**. On 16 GB a quantized Qwen3-VL ~3–7B is feasible but competes with the text model for memory **(knowledge)**. Policy: route image turns to a **local VLM when resident**; fall back to **cloud vision (Claude/Gemini) only through the egress-gate AND only for non-PII frames** (a bare circuit photo may pass; anything with a child's face/name/voice must not leave device). This routing lives in nanobot + the egress posture of [[ADR-EGRESS-SANDBOX-2026-06-25]].

### Principle 6 — Coding
Coding is a **FACTORY** capability, not a product feature for 8–12-year-olds. Product "coding" = the Arduino/block simulator (deterministic, already in ELAB), which does **not** need an LLM in the hot path. So coding-model quality is purely a factory concern → Principle 3.

---

## Consequences

### Positive
- One routing contract (nanobot) absorbs every future model/runtime change — no re-architecture when a better model ships.
- Privacy bar is structural: product models are local/on-device by selection, not by hope.
- Cost lever (headroom on finders) and quality apex (Opus builder) are both preserved.
- The fleet's memory poverty is faced honestly: model sizes are chosen to fit 8/16 GB, not aspirationally.

### Negative / risks
- **Memory contention on 16 GB mini**: text model + VLM can't both stay hot → routing must evict/reload (latency spikes). Mitigation: prefer one general model; load VLM on demand; consider a dedicated VLM box later.
- **iPad/LIM on-device is `(spec)`, not built** — embedded runtimes (Core ML/MLX-Swift/WebLLM) are real work, not a flag flip. The "install Ollama" P0 does **not** deliver iPad inference.
- **MLX-vs-Ollama** adds a small ops choice; mitigated by both sitting behind nanobot (swap is config).
- **ds4 WATCH** means we ignore a genuinely interesting tool; acceptable because it needs hardware we don't have.

### RESOLVED DECISIONS (2026-06-27, A2-verified — supersede conflicting cells above)

Each carries the post-adversarial-verify correction (the verifier's truth, not the first-pass reco).

**D1 — mini runtime = MLX (NOT Ollama). DEFAULT product model = Qwen3.5-4B-4bit.**
- Install `mlx-lm` (brew python@3.11+ → venv → `pip install "mlx-lm[server]"`), serve `mlx_lm.server` bound to **127.0.0.1** behind galileo-nanobot, inside the egress sandbox. If the tutor needs tool/function-calling → `mlx-openai-server --tool-call-parser qwen3_5` on the same weights (config swap, same family).
- **Why not Ollama:** its MLX backend requires **32GB+** unified memory; on the 16GB mini it silently falls back to llama.cpp/Metal (zero MLX benefit + extra daemon), and currently only accelerates Qwen3.5-35B-A3B anyway. MLX = ~15–30% faster + ~10% less memory at equal quant on Apple Silicon (load-bearing at 16GB). llama.cpp/llama-server = documented fallback engine + the portable LIM/browser path.
- **Correction applied:** default is **4B-4bit** (~3GB), not 9B — the mini is a multi-session *classroom* server; usable budget ~9–12GB after OS+nanobot, and continuous-batch KV grows per concurrent student. Promote to 8B/9B only after a passing concurrency load-test.
- Pre-ship gates: (a) verify the chosen MLX repo serves text (some Qwen3.5 repos are mlx-vlm-converted); (b) confirm `sandbox-exec` composes with launchd KeepAlive; (c) no student PII in server logs/KV dumps; (d) port stays loopback behind nanobot — never raw on LAN for the LIM.

**D2 — Mac Studio / ds4 = NO / DEFER.** Keep DeepSeek-V4 **cloud** behind nanobot: V4-Pro for hard coding, V4-Flash + prompt-caching for cheap finders, Opus stays primary builder. Factory plane has no end-user PII → cloud is allowed by our own rules.
- **Corrections:** Flash Q4 ≈ **95GB** (not 172), ~**35–37 t/s** on Apple Silicon (not 25); not "physically impossible" — the 512GB M3 Ultra ran it, but Apple **discontinued all >96GB Studio configs** (Mar–May 2026 DRAM squeeze); the only buyable box is 96GB → forces a ~Q2 quant of the *smaller* V4 model on **beta** ds4 ("exists only a few days"). Cloud wins quality+benefit.
- Sensitive ELAB source → route V4 via a **Western-hosted** endpoint (Together/Fireworks/Bedrock/Azure/OpenRouter-EU), not DeepSeek-direct.
- Revisit trigger (ALL three): M5 Ultra ≥256GB ≤~$8k **AND** a stable non-fork V4 loader **AND** sustained factory V4 spend ~$300–400/mo.

**D3 — local VLM = UNIFY with the tutor: ONE Qwen3.5-4B (MLX, via `mlx-vlm`, 4bit) = text tutor AND VLM.**
- Qwen3.5 (Feb–Mar 2026) is **natively multimodal at every size** and beats prior-gen Qwen3-VL on vision → dissolves the separate-VLM + JIT-load/LRU-evict/idle-TTL/session-pin machinery the first pass invented. Aligns with Galileo-Brain (already a Qwen3.5-2B fine-tune): same family for router head + product model.
- Keep a **Qwen3.5-8bit / 9B-4bit** tier **on disk** as quality-escalation (dense diagram cases), not co-resident. Cap image long side ~**1280px** to bound vision tokens/KV; raise `iogpu.wired_limit_mb`≈13312 keeping OS headroom.
- **Prereq (firsthand):** MLX + `mlx-vlm` NOT yet on the mini; egress profiles + `egress-verify.sh` NOT yet on the mini (`sandbox-exec` is present → portable). Deploy + run egress selftest BEFORE any image/PII. Validate handwriting on real Italian LIM ink before locking 4B.

**D4 — image egress = LOCAL-ONLY v1. No cloud-vision broker.**
- The only justification for a cloud broker was hard person-free document accuracy — closed by running **Qwen3.5/Qwen3-VL-8B locally** (matches/exceeds Gemini-2.5-Pro on vision, 2026). So cloud egress for kids' frames goes from "narrow/hard/risky" to **unnecessary** = safest + highest benefit.
- Keep: **deny-default** network sandbox for the product process, nanobot as the single chokepoint, **Apple Vision** deterministic face/text detectors (presence only, fail-closed, NEVER affect/emotion → AI-Act Art.5(1)(f)), local records-of-processing.
- **Legal framing corrected:** basis for local-default = GDPR **data-minimisation (Art.5(1)(c)) + minors + fragile school consent**, NOT a blanket Art.5 emotion ban (that bites only if you *build* emotion-inference). Annex-III high-risk-education obligations postponed to **2 Dec 2027**; Art.5 prohibitions live since Feb 2025. `sandbox-exec` is deprecated → track pf-anchor/App-Sandbox fallback. Cloud broker = documented FUTURE option, gated on an independently-audited **0-false-allow** red-team.

**D5 — iPad/LIM embedded track: MLX-Swift (iPad primary) + LiteRT-LM (cross-device) + WebLLM (kiosk last-resort); AFM opportunistic-only.**
- **AFM (Apple Foundation Models) is EU-dark** on in-region iPads (Apple WWDC 2026: Apple Intelligence not in EU under DMA, "no timeline") → demote to opportunistic, never on the critical path. MLX-Swift = controllable, EU-clean, no-daemon iPad primary (pre-built **Qwen3.5-2B-MLX-4bit** exists; 4B only on M-class iPads, measure first).
- **LiteRT-LM** (Google AI Edge, open-sourced Apr 2026; iOS+Android+Web, Metal/GPU/NPU, multimodal, runs Qwen) = the cross-device unifier → **LIM primary** (Android/Windows panels). WebLLM/WebGPU on Android is still experimental/desktop-first mid-2026 → demote to browser-kiosk last-resort. llama.cpp = optional hedge. Model name fix: **Qwen3.5-2B** (a "1.5B" does not exist).
- **Load-bearing privacy correction:** `sandbox-exec` is **macOS-only** — the A2-PASS egress control does **NOT** transfer to iPadOS/Android. Per-platform enforcement required: **NEFilter on MDM-supervised iPads**, withhold network entitlement + app-level deny, Android/browser own controls. On BYOD/unsupervised iPads the bar is not system-enforceable → embedded-only + withheld network + documented weaker guarantee. **This is the gate, not a footnote.** Own build track: M1 interface+MLX-iPad · M2 llama.cpp/LiteRT fallback + memory hardening · M3 LIM (LiteRT/WebLLM) + warm-cache · M4 AFM opportunistic · M5 per-platform egress integration tests.

**D6 — headroom: ADOPT `headroom-ai==0.27.0` (Apache-2.0), input-compression broad + output-shaper finders-only. Detailed rollout → [[HEADROOM-ROLLOUT-2026-06-27]].**
- A1/A2 Opus builders: **YES input compression**, but **`--mode cache`** (frozen prior turns — DEFAULT token-mode rewrites prior history incl. served-SHA/gate/mutation-kill blocks) + a **no-compress allowlist for SHA/gate/mutation-kill lines** (GATE, not open-question) + **output-shaper HARD OFF**. Hermes finders = input + shaper OK (short-label output). Codex/desktop = input cache-mode, shaper off.
- Host the proxy **on the mini** (M4 10-GPU, `HEADROOM_EMBEDDER_RUNTIME=pytorch_mps`, ModernBERT ~600MB), NOT the 8GB MacBook. Open bug #1025: ONNX kompress runs synchronously 5–13.5s/call → 503 under concurrency → done-detection must treat 503 as hard-stop, verify fail-open near timeout. Losslessness gate (byte-identical recovery + served-SHA passthrough + gate-count parity + anti-inflation canary) in **cache mode** before any done-path trusts it. Kill switch: `unset ANTHROPIC_BASE_URL`.

### NET PRODUCT MODEL STACK (decided)
mini: **Qwen3.5-4B-4bit (MLX/mlx-vlm)** = text+vision tutor [hot] · **Qwen3.5-8B/9B-4bit** on-disk escalation · **Galileo-Brain-2B** router head — all behind nanobot, loopback-only, egress-denied, local-only image. iPad: Qwen3.5-2B-MLX-4bit embedded. LIM: Qwen3.5-2B via LiteRT-LM/WebLLM. Factory: Opus builder + DeepSeek-V4-cloud finders + headroom input-compression.

---

### EXECUTION STATUS (2026-06-27, firsthand on the mini `progettibelli@macmini`)

**P0#1 — product runtime: DONE + verified live.**
- Installed: brew `python@3.13.14` → venv `~/mlx-venv` → `mlx 0.31.2` (device=**gpu/Metal**), `mlx_lm`, `mlx_vlm`. (`mlx-lm[server]` extra is gone in 0.31 — server is built-in.)
- **Model firsthand-validated:** `mlx-community/Qwen3.5-4B-MLX-4bit` is genuinely multimodal (`Qwen3_5ForConditionalGeneration`, `vision_config`+image/video tokens) → confirms D3 (one model = text+vision). **Correction to D1:** it must be served via **`mlx_vlm.server`**, NOT `mlx_lm.server` (the latter can't load a conditional-generation VLM).
- **Measured on the base M4/16GB:** Italian text tutoring (water-pipe analogy for a 10-yo) **~38 tok/s, 3.6 GB peak**; vision (read a synthetic circuit PNG → identified 9V source +/− and R1 resistor in Italian) ~38 tok/s, 110 tok/s prefill, 3.6 GB. Comfortable headroom on 16 GB.
- **Egress-gated serving proven:** deployed `network-localonly.sb`/`network-deny.sb`/`egress-verify.sh` → `~/maestro-tools/sandbox/`; `egress-verify.sh selftest` = **PASS** (baseline reachable, deny blocks); ran `mlx_vlm.server --host 127.0.0.1 --port 8081 --vision-cache-size 4` **under `sandbox-exec -f network-localonly.sb`** → `/v1/models` + `/v1/chat/completions` both **200**, up in 4s, process confirmed wrapped. Smoke daemon then stopped (unmanaged).
- **Productionized (option a, 2026-06-27):** **`com.ardesia.tutor`** launchd daemon = `mlx_vlm.server` Qwen3.5-4B on `127.0.0.1:8081` under `sandbox-exec network-localonly.sb` (HF_HUB_OFFLINE=1). **KeepAlive restart PROVEN** (killed worker → respawned + serving in 4s → `sandbox-exec` composes with launchd). **Live egress check:** only `127.0.0.1:8081 LISTEN`, zero external sockets (sealed).
- **nanobot fronting DONE + end-to-end verified.** Deployed nanobot ("UNLIM") to the mini (`~/nanobot`, `~/nanobot-venv`), **`com.ardesia.nanobot`** launchd daemon on `127.0.0.1:8090`, sealed. Wired to the local tutor via `AI_PROVIDER1=openai` + `AI_BASE_URL=http://127.0.0.1:8081/v1` + `AI_MODEL1=Qwen3.5-4B` (the `openai` provider path also carries vision → multimodal served locally). `/chat` returns the full Italian UNLIM tutor answer through the local MLX, fully local/egress-denied. nanobot MUST run on the mini (loopback to the sealed tutor) — the Render/cloud nanobot is the factory plane, never the product one.
- **Fixed a real latency bug (canonical `~/swarm1-isolated/nanobot/server.py`, 3 env-izations, cloud defaults unchanged):** `call_openai_compatible` had a hardcoded `timeout=30.0` → local 4B (37 t/s) exceeded it → ReadTimeout; now `PROVIDER_POST_TIMEOUT` (set 120 on mini) + env `MAX_TOKENS` (400) + `VISION_MAX_TOKENS` (512). ⚠️ uncommitted on disk — commit to repo when ready.
- **Remaining:** response latency ~35s is **prefill-dominated** by the huge UNLIM system prompt (not generation) → levers: prompt-cache reuse / trim system prompt / route short turns to a 2B; `brain.py` galileo-brain router wants **Ollama** (absent → degrades gracefully, big-model path used) — later serve galileo-brain via MLX; concurrency load-test before a real class; no-PII-to-disk-logs audit; `iogpu.wired_limit_mb` still 0.

**P0#3 — headroom: INSTALLED + boot-verified; deep gate pending.**
- Installed `headroom-ai==0.27.0` (Apache-2.0, py3.13) in `~/headroom-venv` with extras **`[proxy,pytorch-mps,code]`** (leaner than `[all]`'s 94 deps). CLI healthy; **`--mode cache` confirmed** (tool itself documents default `token` mode = "prior turns may be rewritten" — the hazard, verbatim). Proxy boots in 2s, `/health` ok.
- **Two material firsthand findings (refine [[HEADROOM-ROLLOUT-2026-06-27]]):** (1) default `compress()` **protects user messages** (`router:protected:user_message`, 0% saved, SHA preserved verbatim); (2) **tool-result interception is OFF by default + experimental** (`--intercept-tool-results`) — so the headline input-win on tool outputs is opt-in/experimental, must be gated+tested, not assumed.
- **Remaining gate:** the served-SHA-passthrough + gate-count-parity proof needs an upstream key + the lessonos driver harness → run before any done-detection trusts the proxy. Not wired into builders yet.

### RESEARCH 2026-06-27 — ARDESIA-general ≠ ELAB-tutor; honest adequacy + routing (truthfulness-enforced)
> 13-agent web-grounded research + adversarial verify (`wf_5db75cb7` + 3 follow-ups). Corrects earlier optimism.

**Memory reality (decisive, corrected):** macOS gives <64GB Macs **~66%** of RAM to Metal (not 75%) → ~10.5GB raw, **~8–9GB practical** after OS on the 16GB mini. ~0.55GB per 1B @ Q4. This tightens every local-model choice.

**Q1 — is Qwen3.5-4B the general ARDESIA brain? HONEST NO.** It is a good **grounded-pack floor** (ELAB electronics, RAG-grounded, narrow) but NOT the open multi-subject ARDESIA brain: it fails on **factual breadth/hallucination** (ungrounded open questions), **multi-step math/long reasoning**, and **Italian-native open quality** (2026 Italian shortlists start at 8B; best is Mistral-Small-3.2 ~24B, doesn't fit). Best that *fits* ~8–9GB = **Qwen3-8B / Qwen3.5-9B** (~5.5–7GB, ~22–35 t/s) = "floor-acceptable", still hallucinates, tight KV. 14B "fits" (~9.5GB) but 10–14 t/s = not viable primary; 30B-A3B (18GB) doesn't fit. **No ~8GB local model is simultaneously general-good AND fast → architecture is forced: small local floor + cloud routing for hard/open/ungrounded turns. The router is the brain, not a bigger local model.** (ELAB tutor stays fine on the 4B — don't conflate.)

**The 35s latency = prefill of the huge UNLIM system prompt, NOT the model** (gen is 38 t/s, model healthy at 3.6GB; MLX does full prefill before first token, TTFT grows linearly with prompt). Fix (do NOT swap models): **persisted prompt-cache** of the static prefix (~80–85% TTFT cut → ~5–7s) + **trim the mega-prompt into RAG** + route trivial turns to the **2B** (Galileo-Brain) + session KV reuse.

**Q2 — factory local model:** 16GB cannot host a model that *replaces* cloud agentic finders (Cline/AMD: 30B-A3B Q4 needs 32GB; below it "consistently fails" autonomous loops). Two-tier: **Qwen3-8B dense** (~5–6GB, hot) for finders/ingest/single-shot tool calls; **on-demand gpt-oss-20b via llama.cpp** (~13GB, ~26 t/s — MLX OOMs at 16GB, use llama.cpp `--n-cpu-moe`) or Qwen3-Coder-30B-A3B (Q4 18.6GB → mmap/time-share only); **escalate multi-step agentic loops to `claude -p`/OpenRouter**. Product model + heavy factory model can NOT both be hot on 16GB.

**Q3 — routing (use what's already running):**
- **PRODUCT → nanobot** (BYO-key, GDPR-EU gate, MCP). Hard **privacy gate** first: PII / **LIM-classroom** = local-only, never cloud. Difficulty = soft (local model self-classifies easy/hard). Device sets default only. User keys injected **per-tenant at runtime** (never shared file). Local MLX = slot-0 default; cloud opt-in for hard+non-PII.
- **FACTORY → litellm** (already live `:4000`, **v1.89.1 = SAFE**, not the malware 1.82.7/8). **CRITICAL:** `claude -p` **cannot be a litellm backend** — it's a subscription CLI; Anthropic **blocked third-party subscription proxying (Apr 2026)** and `claude -p` OAuth **mis-bills as per-token API**. So **`claude -p` stays the TOP-LEVEL driver and CALLS DOWN into litellm** for finders/sub-tasks (remap `haiku`→gateway, or run finders as a separate `ANTHROPIC_BASE_URL=:4000` process). **OpenRouter + local MLX plug INTO litellm** (`model_list` entries) with `latency-based-routing` + fallbacks. Rule: **"OpenRouter is a provider, not a router"** → behind litellm (factory) / nanobot (product).

**Q4 — headroom on A1/A2 builders? CORRECTION to earlier reco.** Technically works (`headroom wrap claude`, **`--mode cache` REQUIRED** — default token-mode rewrites prior turns & breaks Anthropic prompt-cache). BUT if A1/A2 run on the **Max subscription (OAuth)**, routing them through ANY proxy is fragile (401 class, issue #3998) + hits Anthropic's third-party-proxy block + risks mis-billing → **you'd lose the €0 subscription**. Also: **1M context is silently dropped behind a custom base_url** (use `[1m]` suffix / `--1m`); tool_use+streaming "probably fine, smoke-test" (issue #626 ANSI-in-stream). **→ headroom's clean, safe win is on the FINDERS (API-key path via litellm/local), NOT the subscription Opus builders.** Put it on builders only if you move them to a paid `ANTHROPIC_API_KEY` — usually not worth it.

**NET REVISION:** PRODUCT(ARDESIA-general) = local floor (4B grounded / optional 8B) + 2B trivial, behind nanobot, hard turns → user-key cloud (PII stays local); fix prefill via prompt-cache. ELAB-tutor = 4B is fine (narrow grounded). FACTORY = `claude -p` Opus top-driver + litellm routing finders to local Qwen3-8B / OpenRouter (gpt-oss-20b on-demand); **headroom on finders, not on subscription builders.**

## Related
- [[ADR-MEMORY-DUAL-ARCHITECTURE-2026-06-26]] (same two-plane split, memory side)
- [[PRD-ARDESIA-v17-2026-06-26]] (§1 stack, §5 device reqs, §7 P0)
- [[TOOLS-MASTER-2026-06-26]] (MinerU, book-to-skill, headroom)
- [[ADR-EGRESS-SANDBOX-2026-06-25]] (egress bar that gates cloud-vision fallback)

## References
- ds4 / DwarfStar — github.com/antirez/ds4 (README fetched firsthand 2026-06-26)
- Hardware: MacBook M1/8GB (firsthand), mini M4-T8132/16GB (firsthand via `ssh macmini`)
