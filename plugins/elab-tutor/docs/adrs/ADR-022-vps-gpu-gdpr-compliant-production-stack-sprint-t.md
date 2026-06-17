---
id: ADR-022
title: VPS GPU GDPR-compliant production stack — Sprint T iter 17+ ripristino full open-weights stack (SUPERSEDES ADR-020)
status: ACCEPTED
date: 2026-04-28
deciders:
  - architect-opus (Sprint S iter 16 PHASE 1, Pattern S 5-agent OPUS)
  - Andrea Marro (final approver — explicit ratify ACCEPTED iter 15 Q2=Y, 2026-04-28)
context-tags:
  - sprint-s-iter-16
  - sprint-t-iter-17
  - vps-gpu-fundamental
  - gdpr-compliance
  - open-weights-stack
  - data-residency-eu
  - principio-zero-v3
  - morfismo-sense-2
  - cost-predictable
  - vendor-lock-in-rejection
supersedes:
  - ADR-020 (REJECTED 2026-04-28 — VPS GPU strategic decommission rejected by Andrea iter 15 Q2=Y)
related:
  - docs/pdr/PDR-SPRINT-S-CLOSE-AND-T-BEGIN-2026-04-28.md §1.1 box 1 (0.4) + §6 Sprint T iter 17+ ripristino full stack
  - ADR-002 (browser fallback ceiling — RIDIMENSIONATO da fallback permanente a fallback emergenza temporaneo solo)
  - ADR-008 (buildCapitoloPromptFragment — Vol/pag verbatim citazioni preserved)
  - ADR-010 (Together AI fallback gated — RETIRED student-runtime per GDPR, RETAINED solo teacher-context con consenso esplicito)
  - ADR-015 (Hybrid RAG retriever — embedding migration Voyage AI cloud → BGE-M3 self-hosted)
  - ADR-016 (TTS Isabella WebSocket Deno — SUPERSEDED da Voxtral 4B / XTTS-v2 self-hosted)
  - CLAUDE.md DUE PAROLE D'ORDINE (Principio Zero V3 + Morfismo Sense 1+1.5+2 GDPR data residency)
input-files:
  - docs/adrs/ADR-020-box-1-vps-gpu-strategic-decommission-prep.md (REJECTED, this ADR supersedes)
  - docs/pdr/PDR-SPRINT-S-CLOSE-AND-T-BEGIN-2026-04-28.md (master PDR Sprint T scope §6)
  - memory mercato-pnrr-mepa.md (deadline PNRR 30/06/2026 + MePA listing GDPR mandatory)
  - memory unlim-subscription-idea.md (UNLIM €20/classe/mese pricing model, margine 59% target)
  - memory mac-mini-autonomous-design.md (Mac Mini orchestration layer complement)
output-files:
  - docs/adrs/ADR-022-vps-gpu-gdpr-compliant-production-stack-sprint-t.md (THIS file, NEW)
  - Future iter 17+ post-procurement: docs/audits/2026-05-XX-sprint-t-iter17-vps-gpu-procurement-evidence.md
  - Future iter 22 post-cutover: docs/audits/2026-06-XX-sprint-t-iter22-production-cutover-canary-100.md
---

# ADR-022 — VPS GPU GDPR-compliant production stack ripristino Sprint T iter 17+

> Ripristinare **VPS GPU dedicato come stack production fondamentale ELAB Tutor** per Sprint T iter 17+, **superseding ADR-020 REJECTED**. Decision Andrea iter 15 Q2=Y 2026-04-28: VPS GPU = FONDAMENTALE per GDPR compliance scuole pubbliche italiane minori 8-14 anni (target ELAB), controllo totale stack, costi fissi prevedibili a scala, differenziatore vs Tinkercad/Wokwi. Cloud API (Gemini/Anthropic) RETIRED da student-runtime (vendor lock-in + privacy concerns + data USA transfer + rate limits + costo variabile). Open-weights stack self-hosted EU-only = unica via compatibile Art. 8 GDPR consenso minori + MePA listing + PNRR procurement. Costo target ~€730/mese fissi vs cloud API stimato €1200-2500/mese variabile a scala 100 scuole. Break-even 50+ scuole attive. Migration path 6 iter (17-22) Sprint T post Fiera Trieste 06/05/2026.

---

## 1. Status

**ACCEPTED** — Andrea Marro decision iter 15 2026-04-28 Q2=Y (VPS GPU fondamentale).

Sign-off chain:
- architect-opus iter 14 prep ADR-020 PROPOSED decommission path → REJECTED
- architect-opus iter 16 prep ADR-022 NEW production stack ripristino → **ACCEPTED**
- Andrea Marro iter 15 binary ratify Q1+Q2 acquisiti: Q2=Y → ADR-020 REJECTED, ADR-022 ACCEPTED

## 2. Supersedes

**ADR-020 — Box 1 VPS GPU strategic decommission prep (PROPOSED → REJECTED 2026-04-28)**.

ADR-020 proposeva decommission VPS GPU + browser fallback ceiling permanente + cost saving 95% vs target Sprint Q €200+/mese.

**Reason rejection** (Andrea iter 15 Q2=Y rationale):
1. **GDPR critico minori 8-14**: cloud API (Gemini, Anthropic) trasferisce dati fuori EU → fail Art. 8 GDPR consenso minori + impossibile MePA listing + impossibile vendita PNRR scuole pubbliche.
2. **Modelli migliori self-hosted**: Llama 3.3 70B + Qwen 2.5-VL + Voxtral 4B + FLUX.1 = qualità superiore per use case ELAB educativo italiano vs constraint cloud free-tier.
3. **Controllo totale**: stack open-weights = no vendor cambia algoritmi mid-deploy (vedi ADR-016 Edge TTS Sec-MS-GEC failure Microsoft algoritmo silenzioso 2025-fine).
4. **Costi prevedibili a scala scuole italiane**: Hetzner GPU dedicato €430/mese fisso copre 100+ scuole vs cloud API variable €1200-2500/mese a scala (rate limit + token cost).
5. **Differenziatore competitivo**: software morfico runtime + GDPR EU-only + open-weights = barriera d'ingresso doppia tecnica + materiale (Sense 2 morfismo CLAUDE.md DUE PAROLE D'ORDINE).

ADR-020 frontmatter aggiornata `status: REJECTED` + `superseded_by: ADR-022` + sezione finale "Rejection Rationale 2026-04-28" Andrea decision Q2=Y rationale.

---

## 3. Context

### 3.1 GDPR critico per scuole pubbliche italiane minori 8-14 (target ELAB)

ELAB Tutor target = scuole pubbliche italiane primaria + secondaria primo grado, studenti 8-14 anni. Quadro normativo:

**GDPR Art. 8 consenso minori**:
- Bambini <14 anni: consenso genitore/tutore obbligatorio per processing dati personali.
- 14-16 anni: minore può consentire ma con verifiche aggiuntive.
- ELAB target 8-14 → 100% richiede consenso genitore esplicito documentato.

**Data residency EU-only**:
- Schrems II (CJEU 2020): trasferimento dati USA invalida senza Standard Contractual Clauses (SCC) + Transfer Impact Assessment (TIA) per cloud provider USA.
- Cloud API Gemini (Google USA), Anthropic (USA), OpenAI (USA), Together AI (USA) = trasferimento USA inevitabile per chiamate.
- ELAB student-runtime processing voce + foto + chat minori → fail Schrems II senza SCC pesante + TIA per ogni call.

**MePA + PNRR procurement requirements**:
- MePA (Mercato Elettronico PA gestito da Davide Fagherazzi team ELAB): bandi richiedono GDPR compliance attestata.
- PNRR (Piano Nazionale Ripresa Resilienza, deadline 30/06/2026 memory mercato-pnrr-mepa.md): scuole acquirenti devono dimostrare data residency EU + DPA con provider.

**Tinkercad/Wokwi limitations**: competitor cloud-based USA stack = stesso problema GDPR per scuole italiane → ELAB GDPR-compliant = differenziatore decisivo PNRR + MePA.

### 3.2 Andrea decision iter 15 Q2=Y rationale (2026-04-28)

PDR Sprint S close iter 13-15 path 9.30 → 10/10 prevedeva 2 binary decisions Andrea:
- Q1 (iter 13): Box 3 RAG redefine count→coverage criterion (ADR-021 prep)
- Q2 (iter 15): Box 1 VPS GPU decommission OR ripristino fundamental

Andrea iter 15 PM (2026-04-28) ratify Q2=Y rationale 5-min review:
> "VPS GPU FONDAMENTALE. GDPR + modelli migliori + controllo totale + costi a scala scuole italiane. Reject ADR-020 decommission. Sprint T iter 17+ ripristino full open-weights stack EU-only. Cost €730/mese fisso accettabile vs €0 ADR-020 — il valore è preservare dati minori + scaling future."

Decision conseguenze:
- ADR-020 status PROPOSED → REJECTED (this ADR supersedes)
- Box 1 score Sprint S close mantenuto 0.4 (decommission rifiutato, ripristino schedulato Sprint T)
- Sprint S close score onesto 9.65/10 (vs 10/10 hypothetical full ripristino impossibile in 8 giorni)
- Sprint T iter 17+ scope ENLARGED: 6 iter dedicati ripristino full stack

### 3.3 Cloud API problemi documentati ELAB

**Gemini Flash-Lite (current production fallback unlim-chat)**:
- Vendor lock-in: Google API key + free tier 50 RPM constraint scaling.
- Privacy: tutti prompt + response tracciati Google USA, no data residency EU enforce.
- Rate limits scaling 100 scuole × 1000 student/giorno: free tier saturated <10 scuole.
- Cost variable: paid tier $0.00001875/1k input tokens + $0.000075/1k output. Stima 100 scuole = €1200-1800/mese.
- Algorithm change risk: documentato ADR-016 Edge TTS Sec-MS-GEC silent break 2025-fine.

**Anthropic Claude (current Mac Mini autonomous Max subscription)**:
- USA-only data processing, no EU residency option.
- NO student-runtime acceptable: Claude API call dati minore italiano = fail Schrems II.
- Retained Mac Mini orchestration layer (developer Andrea + scribe + planner agents) NON student data.

**Together AI (current ADR-010 fallback gated teacher-context)**:
- USA-based cloud Llama 3.3 70B serving.
- Already gated NO student-runtime (ADR-010 §4 truth-table).
- Sprint T migration path: replace Together cloud → Hetzner GPU self-hosted Llama 3.3 70B = stesso modello MA EU residency + zero rate limits.

**Voyage AI embeddings (current ADR-015 RAG production)**:
- USA cloud embedding free 50M tokens/mo.
- Sprint T migration: Voyage cloud → BGE-M3 multilingual self-hosted (1024-dim parità Voyage, model size 568M params M4 MPS feasible OR GPU).

### 3.4 Open-weights stack vantaggi documentati

**Controllo totale algoritmico**:
- Modelli locali GGUF/safetensors immutabili = no silent break vendor.
- Versioning hash-pinned = reproducibility audit.

**Costi fissi prevedibili a scala**:
- Hetzner GPU dedicato A100 80GB ~€430/mese fisso unlimited inference.
- Break-even vs cloud variabile: 50+ scuole attive (calcolo §7).

**Performance migliori use case ELAB**:
- Llama 3.3 70B Q5_K_M = qualità ≥ Gemini Flash-Lite per italiano didattico (R5 91.45% measured iter 5 con Llama via Together).
- Qwen 2.5-VL 7B = vision specializzato circuiti meglio di Gemini Vision generalista.
- Voxtral 4B = TTS italiano voice-clone Andrea/Tea custom impossibile cloud.
- FLUX.1-schnell = image generation didattica licenza Apache 2.0 commerciale.

**GDPR compliance built-in**:
- Tutti dati processati on-premise EU (Hetzner Falkenstein DE / Helsinki FI).
- Audit trail Postgres locale retention 30gg.
- Right-to-forget SQL DELETE student_id cascading.
- DPA Hetzner GDPR-ready signed (no SCC complexity).

---

## 4. Decision

**Ripristino VPS GPU GDPR-compliant production stack come obiettivo Sprint T iter 17+ post Fiera Trieste 06/05/2026 (8 giorni dalla decision iter 15)**.

Stack target production:
1. GPU compute Hetzner dedicato A100 80GB EU (Falkenstein OR Helsinki) OR RunPod RTX A6000 always-on EU
2. LLM chat: Llama 3.3 70B Q5_K_M (Ollama runtime)
3. Vision/VLM: Qwen 2.5-VL 7B (immagini circuiti studenti via webcam/upload)
4. TTS Italian: Voxtral 4B / XTTS-v2 (Isabella voice clone Andrea sample audio)
5. STT: Whisper Turbo Italian (multilingual, Italian fine-tuned)
6. Image generation: FLUX.1-schnell Apache 2.0 (immagini didattiche capitoli)
7. Embeddings: BGE-M3 multilingual 1024-dim (parità Voyage)
8. Reranker: BGE-reranker-v2-m3 OR Cohere rerank-multilingual-v3 (cloud OR self-hosted decision iter 19)
9. ClawBot tool dispatcher: Llama 3.3 70B function calling JSON mode

Cloud API retired student-runtime, retained ONLY teacher-context con consenso GDPR esplicito + emergency fallback timeout VPS GPU primary down.

---

## 5. Architecture (target stack production)

### 5.1 Hardware procurement Sprint T iter 17

**Option A — Hetzner GPU dedicato EX130-S NVME** (raccomandato):
- GPU: NVIDIA A100 80GB OR L40S 48GB (Hetzner Cloud GPU offering)
- CPU: AMD EPYC 9354P 32 cores
- RAM: 256GB DDR5
- Storage: 2× 1.92TB NVMe SSD RAID1
- Network: 1 Gbit dedicated, EU traffic free
- Location: Falkenstein DE OR Helsinki FI (entrambi EU GDPR)
- Cost: ~€430/mese (12-month commit) OR ~€470/mese month-by-month
- DPA GDPR: signed Hetzner GDPR-ready DPA (no SCC complexity per EU residency)
- Pros: dedicato 24/7 unlimited inference, costi fissi, EU data residency
- Cons: single SPOF (mitigato secondary backup §10.2)

**Option B — OVH Cloud GPU EU (alternativa primaria)**:
- GPU: NVIDIA A100 80GB OR H100 80GB (OVH Cloud GPU instance)
- Location: Roubaix FR OR Strasbourg FR (EU GDPR primario)
- Cost: ~€450-500/mese A100 always-on
- DPA GDPR: signed OVH GDPR-ready (French Sovereignty Cloud)
- Pros: French data sovereignty + Schrems II native + EU jurisdiction strong
- Cons: meno container-friendly Hetzner, supporto IT secondario

**Option C — Scaleway GPU EU**:
- GPU: NVIDIA H100 80GB
- Location: Paris FR OR Amsterdam NL
- Cost: ~€550/mese H100 always-on
- DPA GDPR: Scaleway French GDPR-ready
- Pros: H100 più potente, EU sovereignty
- Cons: cost più alto

**Option D — IONOS Cloud GPU DE**:
- GPU: NVIDIA A100 80GB
- Location: Frankfurt DE OR Berlin DE
- Cost: ~€400/mese A100 always-on
- DPA GDPR: IONOS German GDPR-ready (Bundesdatenschutzgesetz)
- Pros: cost most competitive, German enterprise
- Cons: maturity GPU offering minore Hetzner

**Option E — RunPod RTX A6000 (EMERGENCY FALLBACK ONLY, NOT primary)**:
- GPU: NVIDIA RTX A6000 48GB OR RTX 6000 Ada 48GB
- Mode: on-demand $0.74/h OR always-on €530/mese
- Location: EU pod (Frankfurt OR Stockholm) — disponibilità non garantita
- Pros: spin-up rapido, marketplace flessibile dev/test
- Cons gravi (history ELAB iter 1-5):
  - "host saturo / no GPU available" failures iter 2-5 (8/32 attempts pod resume FAIL)
  - Cold start ~18s perceived = scarso UX LIM real-time docente
  - Container disk 30GB tight (Coqui TTS recovery iter 1 non shipped)
  - Volume cancellato dopo TERMINATE (iter 5 P3 storia ELAB) = re-download modelli 50GB ogni resume = ops debole
  - US Delaware Inc. parent company → DPA negoziabile MA non native EU sovereignty
  - Marketplace dynamic = production reliability instabile (vs dedicated bare-metal)
- Verdict iter 17+ ELAB: **RunPod NOT primary production**. Solo emergency burst (24-72h max) se Hetzner/OVH/Scaleway/IONOS down.
- Storia ELAB iter 1-5 documentata: pods `felby5z84fk3ly` + `5ren6xbrprhkl5` entrambi TERMINATED iter 5 P3 Path A. Iter 17+: 0 pods attivi (verified API call 2026-04-28).

**Decision finale §5.1**:
- **Primary** (raccomandato Sprint T iter 17): **Hetzner Option A** — A100 80GB Falkenstein DE €430/mese, 12-month commit, DPA convenience, EU sovereignty, dedicated 24/7 bare-metal.
- **Secondary** (fallback se Hetzner GPU shortage iter 17 procurement window): IONOS Option D €400/mese OR OVH Option B €450/mese — entrambi EU GDPR-ready, simile capability.
- **Tertiary** (HA cluster Sprint T iter 21+ multi-region): secondary GPU OVH Option B €450/mese su region diversa Hetzner per failover automatico.
- **Emergency burst (24-72h max only)**: RunPod Option E spin-up rapido se ALL EU primary down.
- **REJECTED come primary**: RunPod (history ELAB iter 1-5 reliability instabile + US Delaware DPA convenience reduced + cost always-on €530 vs €430 Hetzner).

**Andrea ratify queue iter 16-17 close**: Hetzner Option A binary OK per procurement Sprint T iter 17 entrance (~5 min review §13.1). Backup IONOS/OVH Option D/B se Hetzner unavailable.

### 5.2 LLM chat — Llama 3.3 70B Q5_K_M (Ollama runtime)

- Model: meta-llama/Llama-3.3-70B-Instruct (Apache 2.0 license commercial OK)
- Quantization: Q5_K_M (~50GB GGUF, fits A100 80GB headroom)
- Runtime: Ollama 0.4+ (HTTP API + streaming + JSON mode)
- Endpoint: `http://vps-gpu-internal:11434/api/chat`
- Use case: UNLIM chat student + teacher, ClawBot tool dispatcher function calling JSON
- Quality benchmark: R5 ≥90% target (parità con measured iter 5 91.45% via Together cloud)
- Latency target: p95 ≤4500ms (parità Edge Function via Together iter 5)
- Throughput: ~30 tokens/sec single inference, batching 4-8 concurrent on A100

### 5.3 Vision/VLM — Qwen 2.5-VL 7B (immagini circuiti)

- Model: Qwen/Qwen2.5-VL-7B-Instruct (Apache 2.0)
- Runtime: vLLM 0.6+ (vision-language model server, OpenAI API compatible)
- Endpoint: `http://vps-gpu-internal:8000/v1/chat/completions`
- Use case: studenti caricano foto webcam/screenshot circuito breadboard kit fisico → UNLIM diagnosi via Qwen-VL
- Specializzazione: Qwen-VL trained su immagini schemi tecnici + circuiti elettronici (vs Gemini Vision generalista)
- Quality target: 80%+ topology recognition accuracy (gold-set 30 immagini circuiti standard ELAB)
- Sostituisce: Gemini Vision (current production iter 12 trial), retire student-runtime iter 22 cutover

### 5.4 TTS Italian — Voxtral 4B / XTTS-v2 (Isabella voice clone)

- Primary: Voxtral 4B (Mistral, memory voxtral-tts-opensource.md "batte ElevenLabs, voice cloning 3s")
- Fallback: Coqui XTTS-v2 (multilingual, voice clone 6s sample)
- Runtime: FastAPI WebSocket streaming
- Endpoint: `wss://vps-gpu.elabtutor.school/tts`
- Voice clone: sample audio Andrea (deferred iter 5 Sprint S, ripristino path Sprint T iter 17+)
  - Sample: ~3 minuti narratore registrato (Andrea OR Tea voice)
  - Format: WAV 24kHz mono (Voxtral) OR MP3 (XTTS-v2 lower quality)
- Quality target: voice clone naturalezza ≥4/5 (subjective Andrea + Tea + Giovanni Fagherazzi review)
- Sostituisce: Edge TTS Microsoft Sec-MS-GEC (DOWN ADR-016 ceiling tecnico) + browser SpeechSynthesis fallback
- Latency target: p95 ≤2000ms first audio chunk streaming

### 5.5 STT — Whisper Turbo Italian

- Model: openai/whisper-large-v3-turbo (MIT license, multilingual + Italian fine-tuning available)
- Runtime: faster-whisper 1.0+ (CTranslate2 optimized)
- Endpoint: `http://vps-gpu-internal:9000/v1/audio/transcriptions` (OpenAI compatible)
- Use case: voice command UNLIM "Ehi UNLIM" wake word + 36 comandi vocali (memory CLAUDE.md UNLIM AI)
- Quality target: WER (Word Error Rate) ≤8% Italian conversational
- Latency target: p95 ≤500ms 5-second audio chunk
- Sostituisce: browser Web Speech API (current production, browser-dependent quality variable)
- Pros: privacy (no cloud STT), accuracy migliore browser native, custom wake-word fine-tuning future

### 5.6 Image generation — FLUX.1-schnell

- Model: black-forest-labs/FLUX.1-schnell (Apache 2.0 commercial)
- Runtime: ComfyUI OR diffusers FastAPI
- Endpoint: `http://vps-gpu-internal:7860/generate`
- Use case: immagini didattiche capitoli volumi (es. analogia "elettrone come pallina che rimbalza"), illustrazioni custom Tea volumi v2 update
- Quality target: 1024×1024 4-step inference ≤3 sec
- Cost vs cloud: $0 self-hosted vs DALL-E 3 ~$0.04/image (1000 images/month = $40 cloud vs $0 VPS)

### 5.7 Embeddings — BGE-M3 multilingual

- Model: BAAI/bge-m3 (MIT license)
- Output dim: 1024 (parità Voyage)
- Runtime: sentence-transformers FastAPI
- Endpoint: `http://vps-gpu-internal:8001/v1/embeddings` (OpenAI compatible)
- Use case: RAG embedding 1881 chunks current + 6000 target Sprint T iter 19 expansion + query embedding student/teacher
- Quality target: recall@5 ≥0.55 hybrid retrieval (lift current 0.384 measured iter 11)
- Sostituisce: Voyage AI cloud (current production ADR-015) → BGE-M3 self-hosted iter 19 migration
- Re-embedding effort: 1881 chunks × 1024-dim ~30 minuti M4 MPS OR ~5 minuti A100

### 5.8 Reranker — BGE-reranker-v2-m3 OR Cohere multilingual

- Option A self-hosted: BAAI/bge-reranker-v2-m3 (MIT, multilingual including Italian)
- Option B cloud: Cohere rerank-multilingual-v3 (~$0.001/1k tokens, USA cloud → fail GDPR student-runtime)
- Decision: Option A self-hosted iter 19 (consistent EU residency)
- Runtime: sentence-transformers reranker FastAPI
- Endpoint: `http://vps-gpu-internal:8002/v1/rerank`
- Use case: hybrid retrieval BM25+dense+RRF k=60 → rerank top-60 → final top-5 RAG injection (ADR-015 §retrieval-augmented architecture)
- Latency target: p95 ≤200ms top-60 rerank

### 5.9 ClawBot tool dispatcher — Llama 3.3 70B function calling

- Modello: Llama 3.3 70B (same as §5.2, JSON mode + function calling)
- Runtime: Ollama JSON mode + structured outputs
- Use case: 80-tool dispatcher OpenClaw Onnipotenza Morfica v4 (ADR-013 composite handler L1 + L2 templates + L3 flag DEV)
- Quality target: tool selection accuracy ≥85% gold-set 50 prompts
- Sostituisce: current iter 6+ composite-handler stub + Together AI cloud function calling

### 5.10 Network architecture

```
Browser student/teacher
      ↓ HTTPS
www.elabtutor.school (Vercel frontend, EU edge)
      ↓ HTTPS
euqpdueopmlllqjmqnyb.supabase.co (Edge Functions, EU pgvector)
      ↓ HTTPS internal
vps-gpu.elabtutor.school (Hetzner Falkenstein/Helsinki)
      ↓ localhost
Ollama 11434 / vLLM 8000 / TTS WSS / STT 9000 / FLUX 7860 / Embed 8001 / Rerank 8002
```

Tutti dati student-runtime processati on-premise EU. Nessun cloud USA student-runtime.

---

## 6. GDPR compliance

### 6.1 Data residency EU-only

- VPS GPU location: Hetzner Falkenstein DE OR Helsinki FI (entrambi EU member states GDPR primary jurisdiction).
- Network: traffico studenti → Vercel EU edge → Supabase EU → VPS GPU EU. ZERO transfer USA.
- DPA: signed Hetzner GDPR-ready DPA template (Standard data processor agreement EU).

### 6.2 No transfer USA

- Cloud API USA (Anthropic, OpenAI, Together, Voyage, Gemini, Cohere) RETIRED student-runtime iter 22 cutover.
- Retained ONLY teacher-context con consenso esplicito Andrea/Tea/docente specifico (§9.1 fallback strategy).
- Mac Mini autonomous loop (developer Andrea + scribe + planner) USA-OK (NOT student data, only metacontext sviluppo).

### 6.3 Audit trail

- Logging local Postgres VPS GPU + sync Supabase EU.
- Schema: `audit_log` (request_id UUID, user_role student|teacher|admin, action_type, payload_anonymized JSON, timestamp, ttl_30gg).
- Retention policy: 30 giorni rolling delete via cron daily 03:00 Hetzner.
- Anonymization: PII strip (nome → student_id_uuid, foto → hash, voce → metadata only, no audio raw retention >30gg).

### 6.4 Right-to-forget GDPR Art. 17

- Endpoint: `DELETE /api/v1/student/{student_id}` admin-only.
- Cascade: DELETE FROM `unlim_sessions` + `audit_log` + `rag_chunks_personal` + Supabase auth user + S3 bucket attachments.
- SLA: 30 giorni response (GDPR Art. 12.3 standard).
- Audit: log deletion event con admin operator + timestamp + scope record count.

### 6.5 DPA signed con provider GPU

- Hetzner: DPA template "Hetzner Online GmbH — GDPR-ready DPA" disponibile pubblico.
- Sub-processors disclosed: Hetzner internal only (no third-party data sharing).
- TIA (Transfer Impact Assessment): N/A (EU-internal residency, no Schrems II requirement).
- Andrea action item iter 17: review + sign DPA Hetzner (~30 min legal review + signature).

### 6.6 Consenso minori GDPR Art. 8

- Onboarding flusso scuola: docente registra classe → invia consent form genitori (PDF generato auto).
- Format consent: Italian standard "consenso informato trattamento dati minori scolastici" template (memory feedback unlim-vision-core.md compliance).
- Documentation: PDF firmato digitalmente OR cartaceo scansionato → upload S3 EU bucket retention 5 anni post-school-leaver.
- Data minimization: ELAB processa SOLO dati strettamente necessari (no foto identificative obbligatoria, voce opt-in, chat history opt-in).
- Privacy by design: default opt-out su dati sensibili (foto facciale, voce identificabile), opt-in esplicito genitore richiesto.

### 6.7 EU AI Act compliance (Reg. UE 2024/1689)

- ELAB classification: "AI system con uso su minori in contesto educativo" → Annex III high-risk system per "education and vocational training" + minori protezione speciale.
- Required: documentation tecnica + risk assessment + human oversight (docente sempre in-the-loop, Principio Zero V3 compliance) + transparency (UNLIM disclosable AI to student).
- Andrea action item iter 17+: AI Act risk assessment doc draft (~8h consulenza legale).

---

## 7. Cost analysis (scala 100 scuole, 1000 studenti attivi/giorno)

### 7.1 Stima usage scaling

Assumptions:
- 100 scuole italiane subscription UNLIM (memory unlim-subscription-idea.md €20/classe/mese pricing).
- 1000 studenti attivi/giorno (10 student/scuola media).
- 50 chat call/student/giorno = 50.000 chat call/giorno = 1.5M call/mese.
- 5 vision call/student/giorno = 5000/giorno = 150k/mese.
- 30 TTS sec/student/giorno = 30k sec/giorno = 900k sec/mese.
- 10 STT sec/student/giorno = 10k sec/giorno = 300k sec/mese.

### 7.2 Cost VPS GPU stack (target Sprint T iter 22)

| Voce | Provider | Cost/mese |
|------|----------|-----------|
| Hetzner GPU dedicato A100 80GB primary | Hetzner Falkenstein DE | €430 |
| Hetzner backup secondary (HA failover) | Hetzner Helsinki FI | €200 |
| Monitoring (Grafana + Prometheus + Loki) | Hetzner CX31 | €15 |
| Backup S3-compatible (Hetzner Storage Box 5TB) | Hetzner | €15 |
| DPA legali + AI Act risk assessment (amortized) | Studio legale freelance | €70 |
| **TOTALE FISSO** | | **€730/mese** |

Variable cost: €0 (unlimited inference su GPU dedicato).

### 7.3 Cost cloud API stack alternativa (rejected)

Stima cloud API equivalent stack (rejected per GDPR):

| Voce | Provider | Cost/mese stima |
|------|----------|-----------------|
| Gemini Flash chat 1.5M call (avg 200 tokens in + 100 out) | Google USA | €280-€450 |
| Gemini Vision 150k call | Google USA | €120-€180 |
| ElevenLabs TTS 900k sec | USA | €450-€750 |
| Whisper API STT 300k sec | OpenAI USA | €60-€90 |
| Voyage embeddings (1.5M call) | USA cloud | €30-€50 |
| Cohere rerank | USA | €15-€25 |
| Anthropic Claude Sonnet (composite handler) | USA | €280-€450 |
| **TOTALE VARIABILE** | | **€1235-€1995/mese** |

Plus rate limit handling overhead + GDPR compliance complexity SCC + TIA per provider USA ~€500/mese legal/compliance overhead = **stima totale €1735-€2495/mese**.

### 7.4 Break-even analysis

VPS GPU fisso €730/mese vs cloud API variabile mediana €2115/mese:
- Saving 100 scuole scala = €1385/mese = €16.620/anno saved.
- Break-even minore scala: VPS GPU €730 fisso = cloud API equivalent ~50 scuole attive.
- Sotto 50 scuole: cloud API più economico ma GDPR fail (NON opzione comunque).
- Oltre 50 scuole: VPS GPU obbligatorio + economico.

ELAB target Sprint T-U: 100+ scuole entro fine 2026. VPS GPU = unica opzione tecnico-economica + GDPR.

### 7.5 Margine UNLIM subscription model (memory unlim-subscription-idea.md)

- UNLIM €20/classe/mese × 100 scuole × 5 classi/scuola media = 500 classi × €20 = €10.000/mese revenue.
- Cost VPS GPU stack = €730/mese.
- Costo Mac Mini orchestration (memory mac-mini-autonomous-design.md) = €200/mese Claude Max.
- Vercel + Supabase free tier + paid scaling = €100/mese stima.
- Total cost ~€1030/mese.
- Margine = (€10.000 - €1.030) / €10.000 = **89.7% margine** (vs 59% target memory pre-VPS-GPU).

---

## 8. Migration path Sprint T iter 17+

Sprint T scope: 6 iterazioni (iter 17-22) post Fiera Trieste 06/05/2026 (~6 settimane).

### 8.1 Iter 17 — Hetzner GPU procurement + DPA + Ollama deploy Llama 3.3 70B

Timeline: ~5 giorni post Fiera (08/05-13/05/2026).
Deliverables:
- Hetzner GPU dedicato A100 80GB EX130-S NVME procurement (Andrea signup + Hetzner DPA review/sign ~2h)
- VPS bootstrap: Ubuntu 24.04 LTS + nvidia-driver-550 + CUDA 12.4 + Docker 27 + ufw firewall
- Ollama 0.4+ install + Llama 3.3 70B Q5_K_M download (~50GB GGUF)
- DNS: vps-gpu.elabtutor.school A record Hetzner IP
- TLS: Let's Encrypt cert via certbot
- Smoke test: HTTP curl Ollama /api/chat localhost OK + remote HTTPS OK
- Audit: docs/audits/2026-05-XX-sprint-t-iter17-vps-gpu-procurement-evidence.md

### 8.2 Iter 18 — Qwen-VL + Voxtral TTS deploy + ClawBot wire-up

Timeline: ~5 giorni.
Deliverables:
- Qwen 2.5-VL 7B vLLM server install + smoke test vision request
- Voxtral 4B TTS install + voice clone Andrea sample audio (Andrea record 3-min sample iter 18 entrance)
- XTTS-v2 fallback install (in case Voxtral quality issues Italian)
- FastAPI WebSocket TTS streaming endpoint
- ClawBot composite handler wire-up Llama 3.3 70B function calling JSON mode
- Smoke test 5 use cases (chat + vision + TTS + composite + STT placeholder iter 19)

### 8.3 Iter 19 — Hybrid RAG migration BGE-M3 + production switch

Timeline: ~5 giorni.
Deliverables:
- BGE-M3 multilingual embeddings install + sentence-transformers FastAPI
- BGE-reranker-v2-m3 install + rerank FastAPI
- Whisper Turbo Italian install + faster-whisper FastAPI
- FLUX.1-schnell install + ComfyUI/diffusers FastAPI
- RAG re-embedding 1881 chunks Voyage → BGE-M3 (~5 min A100)
- Update Edge Function `unlim-chat` env: VPS_GPU_URL + auth key
- Migration toggle: feature flag `VPS_GPU_PRODUCTION_ENABLED` env var per-tenant
- Bench R5 stress su VPS GPU stack: target ≥90% parità Edge Function via Together cloud baseline

### 8.4 Iter 20 — Gemini fallback orchestrator (teacher-context only, gated GDPR consent)

Timeline: ~5 giorni.
Deliverables:
- Edge Function fallback chain restructure: VPS GPU primary → emergency timeout 60s → Gemini Flash teacher-context only
- Gate truth-table teacher-context Gemini fallback: NO student data forward, only teacher prompt + meta-context.
- GDPR consent enforcement: docente UI explicit toggle "consento fallback Gemini USA (servizio degradato)" default OFF.
- Audit log per Gemini fallback call (request_id + reason emergency + GDPR consent flag).
- Anthropic permanent block student-runtime (already gated ADR-010, formal enforcement update).

### 8.5 Iter 21 — Production canary 5% traffic 1 settimana monitoring

Timeline: ~7 giorni.
Deliverables:
- Feature flag `VPS_GPU_PRODUCTION_ENABLED` 5% per-tenant rollout (5/100 scuole pilot).
- Monitoring: Grafana dashboard latency p50/p95/p99 + error rate + cost daily.
- Alerts: PagerDuty/Telegram bot threshold breach (latency p95 >5s, error rate >2%, GPU temp >80°C).
- Comparison metrics: VPS GPU vs Gemini Flash baseline 7 giorni A/B.
- Decision gate iter 22: cutover 100% IF metrics ≥parità 7-day moving average.

### 8.6 Iter 22 — Production cutover 100% VPS GPU, Gemini retire student-runtime

Timeline: ~3 giorni.
Deliverables:
- Feature flag 5% → 100% gradual ramp (25% day 1, 50% day 2, 75% day 3, 100% day 4).
- Gemini Flash student-runtime retire (Edge Function code path remove + audit log evidence).
- DNS update + Cloudflare cache purge + Vercel redeploy + Supabase Edge Functions redeploy.
- Audit final: docs/audits/2026-06-XX-sprint-t-iter22-production-cutover-canary-100.md
- ADR-022 status update sign-off section: post-cutover production verified.

---

## 9. Fallback strategy

### 9.1 Tier hierarchy production

```
1. PRIMARY: VPS GPU stack (Llama + Qwen-VL + Voxtral + Whisper + BGE + FLUX)
2. SECONDARY (teacher-context only, GDPR consent explicit): Gemini Flash EU
3. TERTIARY (NO student-runtime): Anthropic Claude (developer Mac Mini orchestration ONLY)
4. EMERGENCY: browser fallback ADR-002 (SpeechSynthesis Italian) — last resort speech-only
```

### 9.2 Health check + auto-failover

- Health check 60s interval: `GET /health` Ollama + vLLM + TTS + STT
- 3-strikes failure threshold → auto-failover Gemini fallback
- Telemetry: latency p50/p95/p99, error rate, cost variable Gemini fallback usage
- Recovery auto: VPS GPU healthy 5 consecutive checks → cutback primary
- Alert: Telegram bot Andrea + Tea + Giovanni Fagherazzi notification failover/recovery events

### 9.3 Anthropic NO student-runtime hard block

- Edge Function code path: zero references to anthropic.com api endpoints in unlim-chat/index.ts
- Together AI USA cloud retired from student-runtime fallback chain post iter 22 cutover.
- Anthropic Mac Mini orchestration retained: developer-context only (Andrea + scribe + planner agents NOT student data).

### 9.4 GDPR consent explicit flow Gemini fallback

- Docente onboarding step 4: "Accetti uso emergency fallback Gemini Google USA in caso degrado servizio?" (default NO).
- If YES: signed digital consent form genitori via PDF + retention.
- If NO: emergency fallback to browser SpeechSynthesis only (text-only chat unavailable iter degraded).
- Audit log per fallback call: request_id + tenant_id + consent_flag + timestamp.

---

## 10. Consequences

### 10.1 Positive

1. **GDPR compliance built-in**: scuole pubbliche italiane minori 8-14 = unica via tecnico-legale viable. PNRR + MePA listing unlocked.
2. **Controllo totale stack**: zero vendor algoritmo silent break risk (vs ADR-016 Sec-MS-GEC failure).
3. **Costi prevedibili scala**: €730/mese fisso copre 100+ scuole vs cloud variabile €1735-2495/mese stima.
4. **Differenziatore competitivo dual-moat**: software morfico runtime (Sense 1) + GDPR EU + open-weights = barriera tecnica + materiale (Sense 2 morfismo CLAUDE.md).
5. **No vendor lock-in**: modelli open-weights GGUF/safetensors swappable (Llama → Mistral → Qwen scaling future).
6. **Margine UNLIM subscription 89.7%** (vs 59% pre-VPS-GPU memory unlim-subscription-idea.md).
7. **Voice clone custom Andrea/Tea**: impossibile cloud, possibile self-hosted Voxtral/XTTS-v2.
8. **Privacy enforcement**: zero foto/voce/chat minore italiano transit USA.
9. **Mac Mini autonomous orchestration retained**: developer layer USA-OK con Anthropic, NON student data → no GDPR conflict.
10. **Sprint T scope chiaro 6-iter**: timeline definita iter 17-22 post Fiera, milestone PNRR deadline 30/06/2026 compatible.

### 10.2 Negative

1. **Complessità ops ~5h/settimana**: monitoring + patching + GPU driver updates + DPA review annual + AI Act risk assessment.
2. **Single GPU SPOF**: VPS GPU primary down = cascade failure stack. Mitigazione: Hetzner secondary backup €200/mese HA + auto-failover Gemini emergency.
3. **Manutenzione modelli upgrade**: Llama 3.4 release future = swap GGUF + benchmark + redeploy ~4h effort per upgrade.
4. **Cost €730/mese fisso**: vs €0 ADR-020 decommission path. Trade-off accettato per GDPR + scaling.
5. **Voice clone setup effort**: Andrea record 3-min sample audio (~2h studio quality) + Voxtral training validation (~1h).
6. **GPU shortage market risk**: NVIDIA H100/A100 supply chain constrained 2026. Mitigazione: Hetzner long-term commit + RunPod fallback + secondary backup.
7. **DPA legal review effort iter 17**: ~30 min Hetzner DPA + ~8h AI Act risk assessment first-time + €70/mese amortized legal ongoing.
8. **Migration testing 6-iter**: parallel cloud + VPS A/B testing iter 21 canary 5% = doppia complessità ops temporanea.
9. **Browser fallback ADR-002 ridimensionato**: NON più ceiling permanente accettabile (ADR-020 thesis), ora ONLY emergency last-resort speech-only.
10. **Sprint S close 9.65/10 not 10/10**: Box 1 ratchet 0.4 stuck Sprint S close (ripristino path Sprint T). Mitigazione: 9.65 onesto + 10/10 path defined Sprint T iter 22 cutover.

### 10.3 Risks

1. **GPU shortage Hetzner**: A100 80GB out-of-stock iter 17 procurement window. MITIGATION: prenotazione anticipata iter 16 close + RunPod fallback option B + L40S 48GB alternative.
2. **Cost spike scala oltre 200 scuole**: VPS GPU saturation single-node A100. MITIGATION: auto-scale secondary GPU node trigger + cap 200 scuole/node + load balancer Hetzner.
3. **Voxtral quality Italian inadeguata**: voice clone naturalezza <4/5. MITIGATION: XTTS-v2 fallback iter 18 + iter 19 evaluation user-test + Tea/Andrea/Giovanni review.
4. **EU AI Act enforcement uncertain 2026**: Annex III high-risk system requirements evolve. MITIGATION: AI Act risk assessment ongoing + €70/mese legal monitor + iter 17 baseline + quarterly review.
5. **DPA Hetzner SCC change**: GDPR adequacy decisions evolve EU-USA. MITIGATION: EU-only no SCC needed default, SCC only if scale require redundant non-EU backup.
6. **Andrea voice sample quality insufficient**: 3-min record studio quality. MITIGATION: Tea voice sample alternative + Italian voice actor freelance €200 one-shot if needed.
7. **Iter 17-22 timeline slip Fiera Trieste post-event commitments**: Fiera 06/05 → contatti scuole pilot post-event possibili distrazione. MITIGATION: iter 17 procurement priority gating + Andrea focus dedicato 1 settimana post-Fiera.

---

## 11. Alternatives rejected

### 11.1 Cloud API only (ADR-020 path REJECTED)

ADR-020 thesis: VPS GPU strategic decommission, browser fallback ceiling permanente, cloud API Gemini Flash student-runtime, cost €0/mese.

**Why rejected** (Andrea iter 15 Q2=Y rationale):
- GDPR fail: Gemini USA student-runtime data minore italiano = Schrems II violation + MePA listing impossibile + PNRR procurement blocco.
- Vendor lock-in: Google API key + free tier rate limit + algorithm silent change risk.
- Cost scala: €1735-2495/mese estimated 100 scuole vs €730 VPS GPU fisso.
- Quality ceiling: browser SpeechSynthesis Italian voice scarsa robotica vs Voxtral neural premium.
- No differenziatore: Tinkercad/Wokwi USA cloud stack = stessa GDPR fail, ELAB perde dual-moat Sense 2 morfismo.

### 11.2 On-premise classroom hardware

Setup mini-PC + GPU per classe scolastica (Jetson Nano OR mini-ITX RTX 4060):
- Cost: €800-€1500 per classe one-shot + setup 4h tecnico per scuola.
- Pros: zero data transit (locale ROUTER scolastico).
- Cons: setup tecnico docente impossibile (memory CLAUDE.md DUE PAROLE D'ORDINE Principio Zero "chiunque deve poter usare senza conoscenze pregresse"). Manutenzione hardware fail per scuola = nightmare scaling. Aggiornamenti modelli 100 nodi distribuiti = impossibile.

**Why rejected**: scaling impossibile + setup docente impossible + Andrea unico developer non può fare assistenza tecnica 100 scuole.

### 11.3 Edge browser inference (WebGPU + ONNX runtime)

Modelli quantizzati eseguiti browser nativo WebGPU (Llama 3.2 1B Q4 + Whisper-tiny + simple TTS):
- Pros: zero infrastructure cost, max privacy (no transit).
- Cons: modelli troppo piccoli per qualità ELAB (R5 ≤70% measured M4 MPS local Llama 3.2 1B vs 91.45% Llama 3.3 70B). LIM iPad student device variable spec = quality unpredictable. Battery drain LIM tablet inferenza heavy.

**Why rejected**: quality gap inaccettabile per use case educativo italiano + device variability + battery LIM tablet.

### 11.4 Hybrid cloud-burst pattern

VPS GPU primary 80% + cloud burst Gemini per spike >GPU capacity:
- Pros: cost optimization spike handling.
- Cons: GDPR mixed routing complessità + audit doppio + Andrea cognitive load monitoring 2 stack.

**Why rejected**: GDPR mixed routing = legal grey area + Andrea unico developer cognitive load. VPS GPU dedicato A100 80GB capacity sufficient 100 scuole calcolo §7.

### 11.5 RunPod always-on Option B (vs Hetzner Option A primary)

- RunPod RTX A6000 always-on €530/mese (vs Hetzner A100 €430).
- Pros: spin-up flexibility GPU shortage hedge.
- Cons: more expensive + DPA convenience reduced + control gradient lower vs dedicated.

**Why rejected primary** (recommendation Hetzner Option A): cost + DPA + dedicato 24/7 control. RunPod retained as fallback option B Andrea ratify queue §13.1 if Hetzner GPU unavailable.

### 11.6 Defer ripristino Sprint U (iter 23+)

Lasciare cloud API fallback fino Sprint U, focus Sprint T solo Vendita PNRR scuole pilot via Gemini Flash.

**Why rejected**: PNRR deadline 30/06/2026 (memory mercato-pnrr-mepa.md) richiede GDPR compliance ATTESTATA prima vendita. Cloud Gemini Flash student-runtime = fail attestazione → nessuna vendita scuole pubbliche. Sprint T iter 17-22 = unica timeline compatibile PNRR deadline.

---

## 12. References

- **ADR-020 — Box 1 VPS GPU strategic decommission prep (REJECTED + SUPERSEDED 2026-04-28)** — questo ADR supersedes
- ADR-002 — browser fallback ceiling (RIDIMENSIONATO da fallback permanente a emergency last-resort speech-only)
- ADR-008 — buildCapitoloPromptFragment (Vol/pag verbatim citazioni preserved post-migration)
- ADR-010 — Together AI fallback gated (RETIRED student-runtime, RETAINED teacher-context con consenso GDPR)
- ADR-015 — Hybrid RAG retriever BM25+dense+RRF+rerank (embedding migration Voyage cloud → BGE-M3 self-hosted iter 19)
- ADR-016 — TTS Isabella WebSocket Deno migration (SUPERSEDED da Voxtral 4B / XTTS-v2 self-hosted iter 18)
- docs/pdr/PDR-SPRINT-S-CLOSE-AND-T-BEGIN-2026-04-28.md — master PDR §1.1 box 1 (0.4) + §6 Sprint T iter 17+ ripristino full stack scope
- CLAUDE.md DUE PAROLE D'ORDINE — Principio Zero V3 + Morfismo Sense 1+1.5+2 (GDPR data residency triplet coerenza)
- memory mercato-pnrr-mepa.md — deadline PNRR 30/06/2026 + MePA listing GDPR mandatory
- memory unlim-subscription-idea.md — UNLIM €20/classe/mese + margine 89.7% post-VPS-GPU
- memory mac-mini-autonomous-design.md — Mac Mini orchestration developer-layer USA-OK retained
- memory voxtral-tts-opensource.md — Voxtral 4B Mistral batte ElevenLabs voice cloning 3s
- GDPR Reg. UE 2016/679 Art. 8 (consenso minori) + Art. 17 (right-to-forget) + Art. 12.3 (SLA response 30gg)
- EU AI Act Reg. UE 2024/1689 Annex III (high-risk education + minors)
- Schrems II CJEU C-311/18 (transfer USA invalida senza SCC + TIA)
- Hetzner GDPR-ready DPA template (https://www.hetzner.com/legal/data-processing-agreement)
- Llama 3.3 license Apache 2.0 + Qwen 2.5-VL Apache 2.0 + FLUX.1-schnell Apache 2.0 + BGE-M3 MIT + Whisper MIT + Voxtral Mistral

---

## 13. Open questions Andrea ratify queue

### 13.1 Hetzner Option A vs RunPod Option B (cost vs convenience)

- **Recommendation architect-opus**: Hetzner Option A A100 80GB EX130-S NVME Falkenstein €430/mese + Hetzner secondary backup €200/mese.
- **Trade-off**: Hetzner dedicato cheaper + DPA convenience EU + control 24/7. RunPod flexible spin-up GPU shortage hedge but more expensive always-on.
- **Andrea decision iter 16 close** (~5 min review): A vs B binary. Default A if no override.

### 13.2 Voice clone Andrea sample audio mp4 (deferred iter 5, ripristino path Sprint T iter 17+)

- Sample needed: 3 minuti narratore Italian studio quality WAV 24kHz mono.
- Alternative: Tea voice sample OR Italian voice actor freelance €200 one-shot.
- **Andrea decision iter 16 close** (~3 min): record self iter 18 entrance OR delegate Tea OR freelance.

### 13.3 Budget cap €730/mese accettabile (vs €0 cloud-only ADR-020)

- ADR-020 path: €0/mese (rejected).
- ADR-022 path: €730/mese fisso (this ADR).
- **Andrea decision iter 16 close** (~2 min review): conferma accettazione budget Sprint T iter 17+ procurement window + Hetzner long-term commit 12-month per discount.
- **Confirmation expected**: YES per Andrea iter 15 rationale "il valore è preservare dati minori + scaling future".

### 13.4 Iter 18 Voxtral vs XTTS-v2 primary TTS

- **Recommendation architect-opus**: Voxtral 4B primary (memory voxtral-tts-opensource.md "batte ElevenLabs"), XTTS-v2 fallback iter 18 evaluation A/B test 5 sample sentences Italian narratore.
- **Andrea decision iter 18 entrance**: subjective review post A/B + Tea + Giovanni feedback ≤3 min.

### 13.5 Iter 22 cutover canary 5% pilot scuole selection

- 5/100 scuole pilot iter 21 canary 5% traffic.
- **Recommendation**: scuole già contatti Giovanni Fagherazzi (ex Arduino Global Sales Director) + Strambino Omaric filiera + Davide Fagherazzi MePA contatti.
- **Andrea decision iter 21 entrance** (~5 min): seleziona 5 scuole pilot da contatti team.

---

## 14. Sign-off

- architect-opus iter 16 PHASE 1: ACCEPTED ✅ (post Andrea iter 15 Q2=Y ratify)
- Andrea Marro final approver: **ACCEPTED iter 15 Q2=Y 2026-04-28** (binary ratify completed, 5 min review)
- Box 1 VPS GPU score path: 0.4 Sprint S close stuck → 1.0 Sprint T iter 22 cutover
- Cost evidence projection: €730/mese fisso target Sprint T iter 22, vs €1735-2495/mese cloud API alternative rejected
- Action items iter 16 close: Andrea ratify queue 13.1+13.2+13.3 ~10 min review
- Action items iter 17 entrance: Hetzner GPU procurement + DPA sign + Ollama Llama 3.3 70B deploy
- Action items Sprint T close iter 22: production cutover 100% VPS GPU + Gemini retire student-runtime + audit final
- Migration milestone PNRR: deadline 30/06/2026 compatible (Sprint T iter 22 ~2026-06-XX cutover)
- Quality target post-cutover: R5 ≥90% maintain + recall@5 ≥0.55 + voice clone ≥4/5 + vision ≥80% topology

— architect-opus iter 16, 2026-04-28. CAVEMAN MODE. ONESTÀ MASSIMA. NO inflation. SUPERSEDES ADR-020 REJECTED. GDPR FONDAMENTALE.
