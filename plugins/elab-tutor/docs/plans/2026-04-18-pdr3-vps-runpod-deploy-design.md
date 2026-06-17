# PDR #3 — VPS RunPod Deploy (CRITICAL PATH)

**Agent target**: Claude Opus 4.7 via Managed Agent (Max #1)
**Durata stimata**: 40-60h autonome
**Branch**: `feature/vps-runpod-deploy-v1`
**Dipendenze**: nessuna (CRITICAL PATH di ingresso per tutto UNLIM produzione)

---

## 🎯 Obiettivo

Deployare su **RunPod Amsterdam (EU, GDPR)** i 6 modelli self-host che compongono UNLIM, con serving serverless flex workers (pay-per-second, idle=0). Stack 100% open-source, zero API ricorrenti.

## 📚 Contesto riferimento

- `CLAUDE.md` sezioni: Stack, Bug aperti, UNLIM AI
- `src/services/api.js` linea 23: `NANOBOT_URL` che puntera a OpenClaw (via Edge Function)
- `supabase/functions/unlim-chat/index.ts`: Edge Function attuale con Gemini
- `supabase/functions/_shared/system-prompt.ts`: BASE_PROMPT con Principio Zero (preservare)
- `docs/decisions/` per ADR (se esistono; altrimenti creali)
- `docs/GOVERNANCE.md`: le 5 regole da rispettare

## 🧱 Task suddivisione (8 sub-task)

### 3.1 — RunPod account setup + network volume
- Crea account RunPod Amsterdam region (https://runpod.io/)
- API key generata (storage in `/secrets/runpod.key` su OpenClaw VM, NON in git)
- Crea network volume 50GB per storage modelli (€0.07/GB/mese = €3.5/mese)
- Deliverable: `docs/infra/runpod-account.md` con procedure signup + region EU confermato
- Audit: test deploy container vuoto, verifica region Amsterdam
- CoV: 3× deploy + destroy test

### 3.2 — Deploy vLLM LLM primary (Llama 3.3 70B Q4)
- Template: `vLLM OpenAI-compatible endpoint` RunPod official
- Model: `meta-llama/Llama-3.3-70B-Instruct` Q4_K_M (~40GB)
- GPU: A100 80GB (margin ~50%)
- Endpoint: `POST /v1/chat/completions` (OpenAI schema)
- Config:
  - Max tokens: 2048
  - Temperature: 0.7
  - Top-p: 0.9
  - Stop sequences: tag Edge Function existing
- Deliverable: `docs/models/llm-endpoint.md` con URL endpoint + auth token
- Audit:
  - Latency p50 < 2s, p95 < 4s
  - Italiano quality test (10 paragrafi UNLIM-style)
  - Multilingue test (IT/EN/FR/DE/ES)
- CoV: 3× query standard, 3/3 coerenti

### 3.3 — Deploy F5-TTS endpoint
- Template: custom FastAPI wrapper (Docker)
- Model: `SWivid/F5-TTS` (HuggingFace)
- GPU: shared A100 (solo 2GB VRAM)
- Endpoint: `POST /tts` → {text, voice_sample, lang} → audio WAV
- Fallback voice sample: voce UNLIM 10s (registrata da Andrea una tantum)
- Deliverable: `docs/models/tts-f5-endpoint.md`
- **⚠️ Audit CRITICO**: test italiano live (10 paragrafi del libro ELAB Vol 1 Cap 6)
  - Se italiano quality < 7/10 (blind listening test) → fallback Kokoro 82M
- CoV: 3× generazioni, 3/3 coerenti

### 3.4 — Deploy Whisper V3 Turbo STT (Faster-Whisper)
- Template: custom FastAPI con `faster-whisper`
- Model: `openai/whisper-large-v3-turbo` (1.5GB)
- GPU: shared A100
- Endpoint: `POST /stt` → audio → testo
- Config: lingua auto-detect, Italian primary
- Deliverable: `docs/models/stt-whisper-endpoint.md`
- Audit: WER < 5% su 10 audio test italiano bambini 8-14 anni
- CoV: 3× trascrizioni, 3/3 coerenti

### 3.5 — Deploy Qwen 2.5 VL 7B Vision (on-demand)
- Template: vLLM vision serving
- Model: `Qwen/Qwen2.5-VL-7B-Instruct` Q4 (~6GB)
- GPU: shared A100 (on-demand solo per richieste vision)
- Endpoint: `POST /v1/chat/completions` con image input
- Deliverable: `docs/models/vision-endpoint.md`
- Audit: 20 screenshot circuit ELAB test → accuracy diagnosi > 85%
- CoV: 3× vision analysis per ogni tipo circuito (LED, resistore, pulsante, etc)

### 3.6 — Deploy BGE-M3 Embedding
- Template: custom FastAPI con `sentence-transformers`
- Model: `BAAI/bge-m3` (~1GB)
- GPU: shared A100
- Endpoint: `POST /embed` → [texts] → [vectors 1024d]
- Deliverable: `docs/models/embedding-endpoint.md`
- Audit: similarity test vs OpenAI text-embedding-3-large (baseline)
- CoV: 3× embedding batch, 3/3 coerenti

### 3.7 — Deploy Stable Diffusion XL per fumetto
- Template: ComfyUI + SDXL base model
- Model: `stabilityai/stable-diffusion-xl-base-1.0` Q8
- GPU: shared A100
- Endpoint: `POST /generate` → prompt → immagine PNG 1024×1024
- LoRA opzionale: `LoRA stile cartone italiano anni '80` da HuggingFace
- Deliverable: `docs/models/image-gen-endpoint.md`
- Audit: 6 vignette test per esperimento v1-cap6-esp1, coerenza stile
- CoV: 3× generazioni, 3/3 coerenti

### 3.8 — Load balancer + health checks
- OpenClaw (Hetzner CX52) fa da router: chiamate a RunPod endpoints con fallback
- Healthcheck ogni 60s su ogni endpoint
- Se endpoint non risponde 3× consecutive → mark DOWN, route a Brain V13 fallback
- Auto-recovery: quando endpoint torna UP, re-include in rotation
- Deliverable: `docs/architecture/runpod-router.md`
- Audit: kill endpoint manuale, verifica fallback in <30s
- CoV: 3× kill+recovery test

---

## 🔬 Exit criteria (gate per merge PR)

- [ ] Tutti i 6 endpoint live e raggiungibili da OpenClaw (Hetzner CX52)
- [ ] Latency p50 < 2s per chat, < 3s per TTS, < 1s per STT, < 2s per vision, < 500ms per embedding, < 15s per image gen
- [ ] Costo test totale < €30 (PoC 24h)
- [ ] Tutti audit 3.2 → 3.8 **APPROVE** dall'Auditor
- [ ] Tutti CoV 3/3 PASS
- [ ] Documentation completa in `docs/models/`, `docs/infra/`, `docs/architecture/`
- [ ] Baseline test non regredito (12056 stays)
- [ ] `CHANGELOG.md` entry: `feat(infra): deploy UNLIM models self-host RunPod EU`

## 🚨 Rischi & mitigation

| Rischio | Probabilità | Mitigation |
|---------|-------------|------------|
| F5-TTS italiano quality insufficient | Alta | Fallback Kokoro 82M pre-testato su stessi 10 paragrafi |
| RunPod cold start troppo lungo | Media | Pre-warming flex workers quando studente apre simulatore |
| GPU out-of-memory con Llama 70B + altri | Bassa | Llama 70B dedicated GPU, altri modelli separate GPU shared |
| Network volume storage lento | Bassa | Modelli loaded in RAM dopo primo startup |
| Costo test sforato | Bassa | Cost cap €30 hard, auto-kill se superato |

## 📤 Handoff a PDR #4 UNLIM Core

Dopo merge PDR #3, gli endpoint URL sono disponibili su Supabase Vault:
- `RUNPOD_LLM_ENDPOINT`
- `RUNPOD_TTS_ENDPOINT`
- `RUNPOD_STT_ENDPOINT`
- `RUNPOD_VISION_ENDPOINT`
- `RUNPOD_EMBEDDING_ENDPOINT`
- `RUNPOD_IMAGE_ENDPOINT`

PDR #4 UNLIM Core userà questi endpoint tramite OpenClaw router.

---

**Governance compliance**: questo PDR segue il pattern 8-step di `docs/GOVERNANCE.md`. Ogni sub-task ha pre-audit/TDD/implement/CoV/audit/doc/post-audit/merge.
