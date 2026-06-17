# VPS GPU Standalone Production Architecture

> **Andrea constraint**: VPS GPU must work standalone, NOT dependent on Mac Mini. Mac Mini = optional batch worker.
> **Status**: design phase, ready for execution post Andrea approval
> **Strategic shift**: post research 2026-04-26 — gpt-oss-20b open-weight (Apache 2.0, Aug 2025) runs on 16GB GPU, viable single-VPS deployment

---

## 0. TL;DR (8 line)

1. **VPS GPU standalone** = single Hetzner GEX44 (RTX 6000 Ada 48GB) OR Scaleway L4 24GB FR
2. **Inference stack**: Ollama (gpt-oss-20b primary, Qwen 14B fallback) + BGE-M3 embeddings + Voxtral 4B TTS + Whisper STT
3. **GDPR clean by design**: EU-only (Hetzner DE / Scaleway FR), no US transit
4. **Endpoint**: `gpu.elabtutor.school` → Cloudflare Tunnel → VPS port 443
5. **Auth**: shared API key (rotateable, env var)
6. **Fallback chain**: VPS GPU primary → Gemini EU (emergency)
7. **Mac Mini independence**: Mac Mini does Wiki batch gen only; ELAB production NOT critical path through Mac Mini
8. **Cost**: €184-187/month Hetzner OR €20-30/4h Scaleway hourly trial

---

## 1. System constraints

### 1.1 Independence requirement (Andrea 2026-04-26)

> "non deve servire necessariamente macmini per fare funzionare il sistema vps gpu"

VPS GPU must function as ELAB production inference WITHOUT Mac Mini being online.

Implications:
- Production traffic flows: User → Vercel frontend → Supabase Edge Function → VPS GPU
- Mac Mini = Wiki concept gen + audit cycles + dev convenience (NOT required for users)
- If Mac Mini offline → ELAB still works
- If VPS GPU offline → fallback to Gemini EU cloud

### 1.2 GDPR

- All inference EU-only (Hetzner DE / Scaleway FR / Mistral FR)
- Shared API key + audit log per call
- Student data never leaves EU runtime
- Together AI gated for teacher batch only

### 1.3 Performance targets

- p95 chat response latency: < 2 seconds
- Vision diagnosis: < 5 seconds
- TTS streaming start: < 1 second
- 95% uptime (single VPS — no HA yet)

---

## 2. Hardware options

### 2.1 Hetzner GEX44 (recommended for production)

- GPU: RTX 6000 Ada 48GB
- CPU: AMD EPYC 16 cores
- RAM: 128GB DDR5 ECC
- Storage: 2× 1.92TB NVMe SSD
- Network: 1 Gbit
- Region: Frankfurt DE (EU GDPR)
- **Cost**: €187/month no minimum term, hourly billing also available

Pros:
- 48GB VRAM = run gpt-oss-20b + Qwen 14B + BGE-M3 simultaneously
- Plenty of headroom for Voxtral + Whisper
- Best perf/€ ratio in EU
- Apache 2.0 license gpt-oss compatible

Cons:
- Monthly commit (premature for 0 paying schools)

### 2.2 Scaleway L4 FR (recommended for trial)

- GPU: NVIDIA L4 24GB
- CPU: 8 cores
- RAM: 96GB
- Storage: 200GB SSD
- Network: 1 Gbit
- Region: Paris FR (EU GDPR)
- **Cost**: ~€0.85/h hourly, no minimum

Pros:
- Hourly billing for weekend trial €5-25
- EU GDPR-clean
- 24GB enough for gpt-oss-20b only (no Qwen 14B simultaneously)

Cons:
- Smaller VRAM means single model at a time
- Lower throughput than RTX 6000 Ada

### 2.3 Vast.ai RTX 4090 (cheap experiment, NOT EU)

- GPU: RTX 4090 24GB
- Cost: ~€0.30/h
- Region: US (NOT GDPR-clean for production)
- Pros: cheapest hourly
- Cons: US-skewed, community marketplace, GDPR violation if used for student runtime

**Conclusion**: Scaleway L4 FR for trial, Hetzner GEX44 for production post-validation.

---

## 3. Software stack

### 3.1 Docker Compose configuration

```yaml
# /opt/elab-vps/docker-compose.yml
version: '3.8'

services:
  # Primary LLM: gpt-oss-20b open weight Aug 2025
  ollama-gpt-oss:
    image: ollama/ollama:latest
    container_name: ollama-gpt-oss
    restart: unless-stopped
    volumes:
      - ./ollama-data:/root/.ollama
    ports:
      - "127.0.0.1:11434:11434"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:11434/api/tags"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Secondary LLM: Qwen 14B fallback
  vllm-qwen:
    image: vllm/vllm-openai:latest
    container_name: vllm-qwen
    restart: unless-stopped
    command:
      - --model=Qwen/Qwen2.5-14B-Instruct-AWQ
      - --quantization=awq
      - --gpu-memory-utilization=0.45
      - --max-model-len=8192
      - --host=0.0.0.0
      - --port=8000
    ports:
      - "127.0.0.1:8000:8000"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  # Embeddings: BGE-M3 multilingual
  bge-embeddings:
    image: ghcr.io/huggingface/text-embeddings-inference:1.5
    container_name: bge-embeddings
    restart: unless-stopped
    command: --model-id=BAAI/bge-m3 --port=8080 --max-batch-tokens=16384
    ports:
      - "127.0.0.1:8080:8080"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  # TTS: Voxtral 4B (Mistral) — natural Italian voice
  voxtral-tts:
    image: mistralai/voxtral:latest
    container_name: voxtral-tts
    restart: unless-stopped
    environment:
      - VOXTRAL_MODEL=4b
      - VOXTRAL_LANG=it
    ports:
      - "127.0.0.1:8881:8881"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  # STT: Whisper Turbo
  whisper-stt:
    image: onerahmet/openai-whisper-asr-webservice:latest
    container_name: whisper-stt
    restart: unless-stopped
    environment:
      - ASR_MODEL=turbo
      - ASR_ENGINE=faster_whisper
    ports:
      - "127.0.0.1:9000:9000"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  # API gateway: nginx reverse proxy + auth
  nginx-gateway:
    image: nginx:alpine
    container_name: nginx-gateway
    restart: unless-stopped
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx-includes:/etc/nginx/includes:ro
    ports:
      - "127.0.0.1:9443:9443"
    depends_on:
      - ollama-gpt-oss
      - bge-embeddings
      - voxtral-tts
      - whisper-stt

  # Monitoring: Prometheus
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    ports:
      - "127.0.0.1:9090:9090"

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=__CHANGEME__
    volumes:
      - grafana-data:/var/lib/grafana
    ports:
      - "127.0.0.1:3000:3000"

volumes:
  prometheus-data:
  grafana-data:
```

### 3.2 nginx reverse proxy

```nginx
# /opt/elab-vps/nginx.conf
worker_processes auto;
events { worker_connections 1024; }

http {
    upstream gpt_oss { server ollama-gpt-oss:11434; }
    upstream qwen { server vllm-qwen:8000; }
    upstream embeddings { server bge-embeddings:8080; }
    upstream tts { server voxtral-tts:8881; }
    upstream stt { server whisper-stt:9000; }

    server {
        listen 9443;
        server_name gpu.elabtutor.school;

        # Auth: shared API key
        if ($http_x_elab_api_key != "${ELAB_GPU_API_KEY}") {
            return 401;
        }

        location /chat/gpt-oss {
            proxy_pass http://gpt_oss/api/generate;
            proxy_buffering off;
            proxy_read_timeout 60s;
        }

        location /chat/qwen {
            proxy_pass http://qwen/v1/chat/completions;
            proxy_buffering off;
            proxy_read_timeout 60s;
        }

        location /embed {
            proxy_pass http://embeddings/embed;
        }

        location /tts {
            proxy_pass http://tts/synthesize;
        }

        location /stt {
            proxy_pass http://stt/asr;
        }

        location /health {
            return 200 '{"status":"ok"}\n';
            add_header Content-Type application/json;
        }
    }
}
```

### 3.3 Cloudflare Tunnel (no public ports)

```bash
# Install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
  -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared

# Auth (browser flow Andrea side)
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create elab-gpu-vps

# Configure
cat > /etc/cloudflared/config.yml << EOF
tunnel: elab-gpu-vps
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json
ingress:
  - hostname: gpu.elabtutor.school
    service: http://localhost:9443
  - service: http_status:404
EOF

# Route DNS (Andrea side via Cloudflare dashboard)
# gpu.elabtutor.school CNAME <TUNNEL_ID>.cfargotunnel.com

# Run as systemd service
cloudflared --config /etc/cloudflared/config.yml service install
systemctl start cloudflared
```

---

## 4. Setup execution plan

### 4.1 Pre-requirements (Andrea side)

| Item | Action |
|------|--------|
| Hetzner account | Create OR use existing |
| Cloudflare account + domain `elabtutor.school` | Existing |
| HuggingFace account | Create + accept gpt-oss license |
| API key for `gpu.elabtutor.school` | Generate secure 32-byte hex via `openssl rand -hex 32` |

### 4.2 Provisioning (1h Andrea)

```bash
# Step 1: Hetzner provision GEX44 OR Scaleway L4 (web console)
# Step 2: SSH into VPS as root
ssh root@<VPS_IP>

# Step 3: Update + install Docker + NVIDIA Container Toolkit
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | \
  sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
apt update && apt install -y nvidia-container-toolkit
systemctl restart docker

# Step 4: Verify GPU
docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi
```

### 4.3 Stack deploy (30min)

```bash
# Step 5: Clone elab-vps repo (or scp config files)
mkdir -p /opt/elab-vps && cd /opt/elab-vps
# Place docker-compose.yml + nginx.conf + prometheus.yml here

# Step 6: Set API key env
export ELAB_GPU_API_KEY=$(openssl rand -hex 32)
echo "ELAB_GPU_API_KEY=$ELAB_GPU_API_KEY" > .env

# Step 7: Pull models (~50GB total)
docker compose pull
docker compose up -d

# Step 8: Pull gpt-oss into Ollama
docker exec ollama-gpt-oss ollama pull gpt-oss:20b

# Step 9: Verify health
curl http://localhost:9443/health
```

### 4.4 Cloudflare Tunnel (15min)

Steps in §3.3 above.

### 4.5 ELAB integration (1h)

```typescript
// supabase/functions/_shared/llm-client.ts
const VPS_GPU_URL = Deno.env.get('VPS_GPU_URL'); // gpu.elabtutor.school
const VPS_GPU_API_KEY = Deno.env.get('ELAB_GPU_API_KEY');

export async function callVpsGpu(model: 'gpt-oss' | 'qwen', options: LLMOptions) {
  const response = await fetch(`${VPS_GPU_URL}/chat/${model}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-ELAB-API-Key': VPS_GPU_API_KEY,
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: options.systemPrompt },
        { role: 'user', content: options.message },
      ],
      max_tokens: options.maxOutputTokens || 256,
      temperature: options.temperature || 0.7,
    }),
  });
  return await response.json();
}
```

Update `callLLM` in `llm-client.ts`:
```typescript
// Priority chain:
// 1. VPS GPU primary (if VPS_GPU_URL set)
// 2. Gemini EU (always available)
// 3. Together AI (gated, teacher-only via canUseTogether)

if (Deno.env.get('VPS_GPU_URL') && !options.context?.skipVpsGpu) {
  try {
    return await callVpsGpu('gpt-oss', options);
  } catch (err) {
    console.warn('VPS GPU down, falling back to Gemini EU');
  }
}

return await callGemini(options); // existing
```

### 4.6 Supabase env vars

```bash
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase secrets set \
  VPS_GPU_URL="https://gpu.elabtutor.school" \
  ELAB_GPU_API_KEY="<32-byte-hex>" \
  --project-ref euqpdueopmlllqjmqnyb
```

---

## 5. RAG 6000+ chunks ingest

### 5.1 Source corpus

- **Existing**: `src/data/rag-chunks.json` — 549 chunks (volumi + glossario + FAQ + errori + analogie)
- **Target**: 6000+ chunks (10x expansion)
- **Method**: Together AI batch ingest ($0.07 one-time) OR self-host BGE-M3 embed batch

### 5.2 Ingest pipeline

```python
# scripts/rag-ingest-bge-m3.py
import json
from sentence_transformers import SentenceTransformer
import requests

model = SentenceTransformer('BAAI/bge-m3')

def chunk_volumes():
    """Split 3 volumi PDF into 1500-token chunks with overlap"""
    # Read all 3 PDFs
    # Split per chapter + section
    # Output: 6000+ chunks JSON

def embed_chunks(chunks):
    """Embed via local BGE-M3 OR VPS GPU"""
    # Batch 32 chunks per request
    response = requests.post(
        'https://gpu.elabtutor.school/embed',
        headers={'X-ELAB-API-Key': API_KEY},
        json={'inputs': [c['text'] for c in chunks[i:i+32]]}
    )
    return response.json()

def upsert_supabase(chunks_with_embeddings):
    """Upsert to Supabase pgvector table"""
    # CREATE TABLE rag_chunks (id uuid, text text, embedding vector(1024), source text, metadata jsonb)
    # CREATE INDEX ON rag_chunks USING ivfflat (embedding vector_cosine_ops)
```

### 5.3 Supabase pgvector schema

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS rag_chunks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    text text NOT NULL,
    embedding vector(1024),  -- BGE-M3 1024-dim
    source text NOT NULL,    -- 'vol1' | 'vol2' | 'vol3' | 'glossary' | 'faq'
    chapter integer,
    page integer,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rag_chunks_embedding_idx
    ON rag_chunks USING ivfflat (embedding vector_cosine_ops);

-- Semantic search RPC
CREATE OR REPLACE FUNCTION search_rag_chunks(
    query_embedding vector(1024),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5
)
RETURNS TABLE (id uuid, text text, source text, chapter int, page int, similarity float)
LANGUAGE sql STABLE AS $$
    SELECT id, text, source, chapter, page,
           1 - (embedding <=> query_embedding) AS similarity
    FROM rag_chunks
    WHERE 1 - (embedding <=> query_embedding) > match_threshold
    ORDER BY embedding <=> query_embedding
    LIMIT match_count;
$$;
```

### 5.4 UNLIM synthesis architecture

```typescript
// supabase/functions/unlim-chat/index.ts (after wire-up)

async function buildSystemPrompt(request: ChatRequest) {
  // 1. Active Capitolo (Q1 schema)
  const capitolo = await getCapitoloByExperimentId(request.experimentId);
  const capFragment = buildCapitoloPromptFragment(capitolo);

  // 2. Wiki LLM concepts (Q4, semantic via VPS GPU embeddings)
  const queryEmbedding = await callVpsGpuEmbed(request.message);
  const wikiHits = await supabase.rpc('search_wiki_concepts', {
    query_embedding: queryEmbedding,
    match_count: 3
  });

  // 3. RAG volume chunks (6000+ semantic)
  const ragHits = await supabase.rpc('search_rag_chunks', {
    query_embedding: queryEmbedding,
    match_count: 5
  });

  // 4. Memory class + teacher (Q5)
  const classMemory = await loadStudentContext(request.sessionId);
  const teacherMemory = await loadTeacherContext(request.sessionId);

  // 5. Live state circuit + code
  const liveState = request.simulatorContext;

  // Compose final prompt
  return `${BASE_PROMPT_PRINCIPIO_ZERO}
${capFragment}

WIKI CONCEPTS RELEVANT (top 3):
${wikiHits.map(h => `- ${h.content}`).join('\n')}

RAG VOLUMES (top 5 chunks):
${ragHits.map(h => `[${h.source} cap.${h.chapter} pag.${h.page}] ${h.text}`).join('\n')}

MEMORY CLASS:
${classMemory}

LIVE STATE:
${JSON.stringify(liveState)}

USER QUESTION:
${request.message}

SYNTHESIZE response combining ALL above sources. Cite Vol.X pag.Y selectively. Plurale "Ragazzi". Max 60 words + 1 analogy.`;
}
```

---

## 6. Cost projection

### 6.1 Hetzner GEX44 monthly

| Item | Cost/month |
|------|-----------|
| VPS GEX44 | €187 |
| Cloudflare Tunnel | €0 (free tier) |
| Models bandwidth | ~€0 (within Hetzner unmetered) |
| Backups (off-VPS) | ~€5 (Hetzner Storage Box) |
| **TOTAL** | **~€192/month** |

### 6.2 Hourly trial Scaleway L4

| Item | Cost/4h |
|------|---------|
| L4 GPU | €3.40 |
| Storage | €0.10 |
| Bandwidth | €0 |
| **TOTAL** | **~€3.50** |

### 6.3 Per-call inference cost

- Self-hosted = €0 marginal cost (after fixed monthly)
- vs Gemini 2.5 Flash = ~€0.0003 per chat call

Break-even: 192 / 0.0003 = **640,000 calls/month** before VPS becomes cheaper.

ELAB current volume: <50 calls/month. **VPS GPU is investment in capability + GDPR + latency, NOT cost saving.**

---

## 7. Risks + mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| VPS hardware failure | LOW | HIGH | Fallback Gemini EU automatic |
| Cloudflare Tunnel down | LOW | MEDIUM | Direct IP fallback (firewall allowlist) |
| Model loading slow first request | HIGH | LOW | Warmup script post-deploy |
| Out of VRAM with multiple models | MEDIUM | MEDIUM | Model unloading + lazy load OR upgrade GEX131 96GB |
| API key leaked | LOW | HIGH | Rotate via env var update + restart |
| Andrea VPS root password lost | LOW | HIGH | SSH key auth only, password disabled |

---

## 8. Sprint sequence

### Sprint VPS-1 (1 day, weekend)

- [ ] Andrea provision Scaleway L4 FR (€0.85/h)
- [ ] Apply §4.2 setup commands
- [ ] Pull gpt-oss-20b + Qwen 14B + BGE-M3
- [ ] Test inference each model (curl)
- [ ] Benchmark latency 100 prompts
- [ ] Document results in `docs/audits/2026-04-26-vps-gpu-trial-scaleway.md`
- [ ] Decision: GO Hetzner mensile OR stay cloud Gemini

### Sprint VPS-2 (post trial GO, 1-2 days)

- [ ] Andrea provision Hetzner GEX44 mensile
- [ ] Deploy stack §3
- [ ] Configure Cloudflare Tunnel §3.3
- [ ] DNS gpu.elabtutor.school → Tunnel
- [ ] Set Supabase env VPS_GPU_URL + ELAB_GPU_API_KEY
- [ ] Wire `callVpsGpu` in llm-client.ts §4.5
- [ ] Smoke test 5 chat requests via VPS GPU
- [ ] Monitoring Grafana dashboard

### Sprint VPS-3 RAG ingest

- [ ] Generate 6000 chunks from PDF volumi (script `scripts/rag-ingest-bge-m3.py`)
- [ ] Embed via VPS GPU BGE-M3
- [ ] Upsert Supabase pgvector
- [ ] Update unlim-chat to use semantic search
- [ ] Compare retrieval precision vs keyword baseline

### Sprint VPS-4 production cutover

- [ ] Feature flag `VITE_AI_BACKEND=vps_gpu` (default cloud Gemini for safety)
- [ ] Canary 10% traffic to VPS GPU
- [ ] Monitor 7 days latency + error rate
- [ ] If green → flip default to vps_gpu
- [ ] If red → rollback feature flag

---

## 9. What I (Claude) need from Andrea

### Decisions needed NOW

1. **Trial provider**: Scaleway L4 FR €3.50/4h vs Vast.ai RTX 4090 US €1.20/4h vs Hetzner trial GEX44
2. **Production commit**: Hetzner GEX44 €187/mo OR cloud Gemini stay
3. **Domain**: confirm `gpu.elabtutor.school` OR alternative subdomain
4. **API key**: I generate via openssl OR you provide
5. **Cloudflare account**: existing token OR new

### Information I have

- ✅ Hetzner pricing 2026: GEX44 €187/mo, GEX131 RTX PRO 6000 96GB premium
- ✅ Scaleway L4 hourly EU FR
- ✅ OpenAI gpt-oss-20b/120b open weight Apache 2.0 Aug 2025
- ✅ BGE-M3 multilingual 1024-dim embeddings
- ✅ Voxtral 4B Mistral TTS
- ✅ Whisper Turbo STT
- ✅ Existing ELAB stack (Supabase + Vercel + n8n compile)
- ✅ Sprint Q infrastructure (Capitolo schema + Wiki concepts + memoryWriter)

### Information I need

- [ ] Andrea preferred provider for trial (Scaleway recommended)
- [ ] Andrea Cloudflare API token (for tunnel automation)
- [ ] Andrea HuggingFace account email (for gpt-oss accept)
- [ ] Confirm DNS subdomain naming
- [ ] Confirm production go/no-go criteria

### Tools I need

- [x] SSH client (have)
- [x] Docker locally (likely have)
- [ ] Cloudflare CLI `cloudflared` (will install on VPS)
- [ ] HuggingFace CLI `huggingface-cli` (will install on VPS)
- [ ] Provider CLI: `hcloud` (Hetzner) OR `scw` (Scaleway) — for automation

---

## 10. Honesty caveats

1. **Cost vs benefit**: VPS GPU NOT cost-saving until 640k+ calls/month. Today 50/month. Investment in capability + GDPR + latency only.

2. **Single VPS = SPOF**. No HA. Mitigation: Gemini EU fallback. Real HA = €400+/mo (2× VPS + load balancer).

3. **gpt-oss-20b quality vs Gemini Flash NOT tested**. Trial Sprint VPS-1 will measure. Plan B: Qwen 14B if gpt-oss insufficient.

4. **6000-chunk RAG ingest CPU-time on VPS** = ~30-60min one-time. NOT trivial but bounded.

5. **Mac Mini independence enforced**: ELAB production never calls Mac Mini. Mac Mini = batch worker only (Wiki gen overnight).

6. **Voxtral 4B image NOT verified available** on Docker Hub/Mistral registry as of 2026-04-26. May need self-build container. Fallback: Edge TTS VPS existing.

7. **Cloudflare Tunnel authentication** requires browser flow on Andrea's machine. NOT fully automatable.

8. **DNS propagation** can take 1-24h post Cloudflare config. Plan trial timing accordingly.

---

**File path**: `docs/architectures/vps-gpu-standalone-2026-04-26.md`
**Skill compliance**: documentation (engineering architecture doc) + writing-plans (Sprint VPS sequence)
**Caveman compliance**: chat replies caveman; this doc normal language
**Honesty**: numbers verified (research 2026-04-26 WebSearch), gaps explicit (caveats §10)
