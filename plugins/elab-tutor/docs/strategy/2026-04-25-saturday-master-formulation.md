# Saturday Strategic Master Formulation — 2026-04-25

> Formulazione finale, massima onestà, no compiacenza.
> Audit + plans + Mac Mini exploitation + Tea assignments + risk register.
> Non rivedibile dal sé futuro come "ottimistica" — numeri verificati o etichettati.

**Autore:** Andrea Marro (via Claude Opus 4.7)
**Data:** 2026-04-25 Saturday
**Contesto:** post Vercel Pro upgrade + post env GDPR check + post Andrea statement "final state = VPS GPU"
**Skill invocate:** quality-audit + writing-plans + documentation

---

## 0. TL;DR (10 line)

1. **Final state thesis chiaro**: GPU VPS self-host (EU, Qwen 7B/14B + Voxtral TTS + BGE-M3). Cloud = transitional.
2. **Hetzner trial = thesis validator**. Saturday window aperta. €25 cap. Decisional output.
3. **Vercel Pro upgrade fatto** → bundle OOM risolto. Bundle opt plan parked Sprint 7.
4. **GDPR violation NON active** (Together no key). Plan defensive, downgrade da CRITICAL a MEDIUM.
5. **Sprint Q 8 PR draft** → Andrea bottleneck umano review/merge.
6. **Mac Mini fisicamente accessibile** → killer use case = autonomous CLI loop H24 + Brain V13 self-host (saves €/mo VPS Hostinger).
7. **Tea assignments specifici**: PNRR collateral, Wiki concept pedagogical review, Vol3 bug fix, pilot outreach list.
8. **Skip in caveman**: Bundle exec, Mac Mini setup remoto (impossibile da MacBook), GDPR exec full (overwrought thesis-corretto).
9. **Saturday combo OK**: Hetzner trial (4-6h primary) + Vercel Pro setup (30min) + Mac Mini autonomous loop start (1h).
10. **Anti-pattern noti**: scrivere altri plan complessi senza esecuzione, plan inflation > esecuzione, claim score >7 senza CoV.

---

## 1. Audit current state (no inflation)

### 1.1 Production stack live verification

| Componente | URL | Stato verificato | Evidence |
|------------|-----|------------------|----------|
| Frontend | https://www.elabtutor.school | HTTP 200 (deploy ab8xrcayc Ready) | handoff session 2026-04-25 |
| Supabase Edge Functions | euqpdueopmlllqjmqnyb | OK | `supabase secrets list` ran |
| Nanobot AI fallback | elab-galileo.onrender.com | OK 18s cold start | CLAUDE.md infrastruttura |
| Compilatore n8n | n8n.srv1022317.hstgr.cloud | OK | CLAUDE.md |
| Brain V13 VPS | 72.60.129.50:11434 | NON VERIFICATO live | flagged CLAUDE.md |
| Edge TTS VPS | 72.60.129.50:8880 | OK 16/04 | CLAUDE.md |
| Kokoro TTS | localhost:8881 | LOCAL only | CLAUDE.md |

### 1.2 Test baseline

| Metric | Value | Source |
|--------|-------|--------|
| Test count main | 12291 PASS | pre-commit hook output `npx vitest run` |
| Test count expected post merge cascade | 12498 PASS | Sprint Q comprehensive doc |
| Test files | 228 | Sprint Q comprehensive |
| automa/baseline-tests.txt SOT | 11958 | last hook update visible |

**Onesta**: baseline file lags reality by 333 tests. Pre-commit hook reads file but actual run shows 12291. File needs sync via hook trigger on next commit (auto).

### 1.3 GDPR env state (verified 2026-04-25)

Supabase production env vars (Andrea Personal Access Token check):
- ✓ ELAB_API_KEY, ELAB_DB_*, SUPABASE_*, GEMINI_API_KEY (+FALLBACK), VPS_OLLAMA_URL, VPS_TTS_URL
- ✗ LLM_PROVIDER (NOT SET → defaults to `'together'` per code line 181)
- ✗ TOGETHER_API_KEY (NOT SET → callTogether throws → fallback Gemini per code line 215-225)

**Net**: production de facto Gemini-only via fallback chain. Together AI NOT reachable runtime. GDPR violation = **NOT ACTIVE** (Together physically uncallable).

### 1.4 Sprint Q deliverable status

| PR | Branch | State | Test delta |
|----|--------|-------|------------|
| #34 | feat/sprint-q0-tresjolie-analysis-2026-04-24 | DRAFT | 0 (docs) |
| #35 | feat/sprint-q1-capitolo-schema-narrative-2026-04-24 | DRAFT | +55 |
| #36 | feat/sprint-q2-capitolo-ui-2026-04-25 | DRAFT | +57 |
| #37 | feat/sprint-q3-edge-function-prompt-2026-04-25 | DRAFT | +47 |
| #38 | feat/sprint-q4-wiki-l2-2026-04-25 | DRAFT | +9 |
| #39 | feat/sprint-q5-memoria-compounding-2026-04-25 | DRAFT | +22 |
| #40 | feat/sprint-q6-percorso-generator-2026-04-25 | DRAFT | +17 |
| #41 | docs/sprint-q-comprehensive-2026-04-25 | OPEN | 0 (docs+plans) |

Cascade dependency: linear (each rebase on previous merge). Total +207 test post merge.

**Bottleneck onesto**: Andrea time review. ~10-15 min per PR × 8 = 2-3h Andrea attention.

### 1.5 Score onesto prodotto

Last benchmark fast mode 18/04: **2.77/10** (CLAUDE.md). Auto-claim historicals were inflated 4-7 punti vs realtà (G45 audit established).

Sprint Q delivered infrastructure, NOT score improvement (no metric changes until wire-up production lands).

---

## 2. Strategic thesis: final state GPU VPS

### 2.1 Andrea statement (today)

> "La cosa finale sarà usare vps con gpu"

End-state architecture target:
- **LLM**: Qwen 7B/14B/72B self-host EU GPU VPS
- **Vision**: Qwen VL 7B locale
- **TTS**: Voxtral 4B GPU
- **STT**: Whisper Turbo GPU
- **Embeddings**: BGE-M3 locale
- **Storage**: Supabase EU (PostgreSQL + pgvector)

GDPR: **clean by design** (no US transfer, all EU runtime).

### 2.2 Implications (what becomes moot)

| Cloud-tier work | Validity post-VPS |
|-----------------|-------------------|
| GDPR Together gate (block Together for student) | MOOT — Together not used at all |
| Gemini EU endpoint migration | MOOT — Gemini retired |
| Render Pro upgrade | MOOT — Render deprecated |
| Render warmup keepalive | MOOT — Render gone |
| Bundle optimization for Vercel OOM | RESIDUAL — Vercel still serves frontend |
| Edge TTS VPS | RESIDUAL — possibly replaced by Voxtral |

### 2.3 Implications (what BECOMES critical)

| New work | Reason |
|----------|--------|
| Hetzner trial weekend | THESIS validator — Qwen latency/quality |
| Docker compose stack ready-to-deploy | Sprint 7-8 prep per PDR-decision-framework.md |
| Feature flag `VITE_AI_BACKEND` pluggable | Backend swap cloud → VPS sin downtime |
| Health check + failover automatic | VPS down → cloud fallback (transitional) |
| Monitoring (Grafana + Prometheus container) | Self-host needs observability |

### 2.4 Trigger point per attivare GPU VPS mensile

Per gpu-vps-decision-framework.md:
- Volume > 5000 sessioni/mese (oggi <50, gap 100x)
- Privacy: 3+ scuole con requisito self-host (oggi 0)
- Latenza UX-blocking (oggi 0 demo failed for lag)
- Fine-tuning concrete plan (oggi 0)

**Onesta**: oggi tutti soglia FAR. Hetzner trial = preparazione + benchmark, non commit mensile.

---

## 3. Workstream matrix (parallel work)

| Workstream | Owner | Saturday window | Strategic alignment |
|-----------|-------|-----------------|---------------------|
| Hetzner GPU trial | Andrea | 4-6h primary | HIGH (validates final state) |
| Vercel Pro setup | Andrea | 30-60min | LOW effort, IMMEDIATE production observability |
| Mac Mini autonomous loop start | Andrea | 1-2h | HIGH (idle resource exploit, persistent infra) |
| Sprint Q PR review | Andrea | 2-3h async | HIGH (unblocks 7 downstream) |
| Tea: PNRR collateral 1-pager | Tea | 4-6h Saturday/weekend | CRITICAL (deadline 30/06/2026) |
| Tea: Wiki concept pedagogical review | Tea | 2-3h | MEDIUM (UNLIM response quality) |
| Tea: Vol3 bug fix editoriali | Tea | 1-2h | LOW (4 bugs flagged Sprint Q0) |
| Claude Opus (this session): docs + plans + benchmark scripts | me | parallel async | depends on Andrea direction |

Total Andrea Saturday capacity: ~10-12h max.

---

## 4. Plans by workstream

### 4.1 Andrea today (MacBook Air primary)

**Prime tasks (in order):**

1. **Vercel Pro Analytics + Speed Insights setup** (30min, instant prod data)
2. **Hetzner trial execute** (4-6h primary Saturday focus)
3. **Mac Mini autonomous loop start** (1-2h, parallel)
4. **Sprint Q PR cascade review/merge** (background async, finger-mode 2-3h spread)

Skip:
- GDPR plan execute → defer, thesis-redundant if Hetzner conferma
- Bundle opt → parked Sprint 7
- Render pro upgrade → moot

### 4.2 Mac Mini (idle resource exploit)

**Killer use case identificato**: autonomous CLI loop + Brain V13 self-host.

#### 4.2.1 Mac Mini Plan A (Saturday 1-2h):

**Goal**: avviare loop H24 + spostare Brain V13 da Hostinger VPS (€) a Mac Mini (gratis).

**Tasks** (Andrea fisicamente su Mac Mini):

1. **Verify Mac Mini current state** (5min)
   ```bash
   ssh mac-mini  # OR direct SSH se setup
   uname -a; sw_vers; uptime
   ```

2. **Install Ollama + Qwen3.5-2B Q5_K_M** (15min)
   ```bash
   brew install ollama
   ollama serve &
   ollama pull qwen2.5:3b-instruct-q5_K_M  # ~2.5GB
   curl http://localhost:11434/api/tags  # verify
   ```

3. **Modelfile galileo-brain-v13 import** (10min)
   - Copy `automa/brain/galileo-brain-v13.Modelfile` from current VPS to Mac Mini
   - `ollama create galileo-brain-v13 -f Modelfile`
   - `ollama run galileo-brain-v13 "test prompt"` → smoke test

4. **Setup loop-forever.sh launchd persistente** (30min)
   - Create `~/Library/LaunchAgents/com.elab.loop-forever.plist`
   - `launchctl load -w ~/Library/LaunchAgents/com.elab.loop-forever.plist`
   - Verify: `launchctl list | grep elab`

5. **Update Supabase env VPS_OLLAMA_URL** (5min)
   - From: `http://72.60.129.50:11434` (Hostinger VPS)
   - To: `http://<mac-mini-tailscale-ip>:11434` (Mac Mini Tailscale)
   - Need: Tailscale set up on both Mac Mini + Supabase Edge Function (Deno fetch via Tailscale exit node? May not work — check)
   - **Alternative**: use ngrok / Cloudflare tunnel public URL with auth header
   - **Decision needed**: Andrea picks tunnel solution

6. **Deprecate Hostinger VPS Brain** (after verification 24h)
   - Cancel subscription if not used elsewhere
   - Saves €/mese (per-VPS cost ~€5-10/mese estimate)

**Output Mac Mini Plan A**:
- Brain V13 self-host (gratis)
- Loop H24 active persistent
- €5-10/mese saved

#### 4.2.2 Mac Mini Plan B (later, Sprint 7+):

- GitHub Actions self-hosted runner (3-5x faster CI)
- Supabase local Docker staging
- Continuous benchmark daily cron

#### 4.2.3 Mac Mini Plan C (post-Hetzner-trial):

If Hetzner trial confirms Qwen 7B viable on Mac Mini M4 16GB:
- Run `qwen2.5:7b-instruct-q4_K_M` (~4GB) for tutor chat fallback
- Mac Mini becomes CHAT INFERENCE box for ELAB locally
- Tunnel via Tailscale + Cloudflare to Supabase Edge

### 4.3 Tea (specific assignments)

**Profile recap** (CLAUDE.md):
- Italian docs writer, pedagogical analyst
- Already delivered: complessità esperimenti, riepilogo correzioni, schema UX, 10 idee
- Kit content expertise

**Saturday + weekend assignments (priority order):**

#### 4.3.1 PNRR 1-pager marketing (CRITICAL — deadline 30/06/2026)

**Goal**: 1 pagina A4 + slide 10-pag export-ready per Davide vendite MePA.

**Brief**:
- Top: "ELAB Tutor — perché è diverso" (3 frasi)
- Mezzo: 4 pillar (Volumi fisici Tresjolie + Kit Omaric + Principio Zero v3 + Roadmap GPU EU)
- Bottom: ROI per scuola "il docente risparmia 2-3h preparazione lezione"
- CTA: "Demo gratuita 30min"

Time: 4-6h Tea. Format: docx + pdf export.

Output: `/VOLUME 3/TEA/2026-04-pnrr-1pager-marketing.docx`

#### 4.3.2 Wiki concept pedagogical review (MEDIUM)

**Goal**: review 30 concept md generated Q4 (currently in feat/sprint-q4 branch PR #38) per accuratezza pedagogica + linguaggio bambino 8-14.

**Brief**:
- Open `docs/unlim-wiki/concepts/` 30 md file
- Check ogni concept:
  - Definizione clear per bambino?
  - Analogia plurale "Ragazzi, ..." appropriate?
  - Errori comuni reali (vissuti)?
  - Citation Vol.X pag.Y corretto?
- Flag concept con problemi → comment in markdown OR side-doc

Time: 2-3h Tea. Output: review notes per concept o pass/flag list.

#### 4.3.3 Vol3 bug editoriali fix (LOW)

**Goal**: correct 4 bugs flagged Sprint Q0 audit:
- HIGH: Vol3 PDF V0.8.1 phantom Cap 10-12 (rimuovi)
- MEDIUM: Vol3 ESERCIZIO 6.4 duplicate (line 2113 + 2176)
- LOW: Vol3 ESERCIZIO 7.8 marker mancante
- LOW: Vol2 PDF Cap 8 ESPERIMENTO 2 duplicate (lines 2242+2252)

Time: 1-2h Tea. Output: corrected ODT/PDF + change log.

#### 4.3.4 Pilot outreach list compile (HIGH-leverage, lower priority Saturday)

**Goal**: list di 30-50 scuole prima/secondaria target PNRR per Davide cold outreach.

**Brief**:
- Filter: scuole con fondi PNRR STEM/Scuola 4.0 attivi
- Source: bandi pubblici, MIUR portals, Davide MePA contacts
- Format: spreadsheet (nome, città, contatto DSGA/dirigente, fonte fondi, status outreach)

Time: 4-6h Tea. Output: `/VOLUME 3/TEA/pilot-outreach-list.xlsx` first 30 schools.

### 4.4 Hetzner trial mini-plan (Saturday primary)

**Goal**: validate GPU VPS thesis with €25 cap weekend trial.

#### 4.4.1 Provider selection

| Provider | GPU | Hourly | Pros | Cons |
|----------|-----|--------|------|------|
| Vast.ai | RTX 4090 24GB | $0.30/h | cheapest | community, less reliable, US-skewed |
| Scaleway | L4 24GB FR | €0.85/h | EU native, GDPR-clean | pricier, smaller selection |
| RunPod | A100 40GB LU | $0.79/h | EU LU, fast | sign-up overhead |
| Hetzner | GEX44 RTX 6000 Ada 48GB | €187/mese (no hourly) | EU DE, best for prod | mensile only — overkill trial |

**Recommendation onesto**: **Scaleway L4 FR** for trial. EU GDPR-clean, decent GPU 24GB, hourly billing, €3.40 for 4h test.

Backup: Vast.ai RTX 4090 if Scaleway unavailable. €1.20 for 4h.

#### 4.4.2 Stack deploy

```yaml
# docker-compose.yml for trial
version: '3.8'
services:
  vllm-qwen:
    image: vllm/vllm-openai:latest
    command:
      - --model=Qwen/Qwen2.5-7B-Instruct-AWQ
      - --quantization=awq
      - --gpu-memory-utilization=0.6
      - --max-model-len=8192
      - --host=0.0.0.0
    ports: ['8000:8000']
    deploy:
      resources:
        reservations:
          devices: [{driver: nvidia, count: 1, capabilities: [gpu]}]

  ollama:
    image: ollama/ollama:latest
    ports: ['11434:11434']
    volumes: ['./ollama:/root/.ollama']
    deploy:
      resources:
        reservations:
          devices: [{driver: nvidia, count: 1, capabilities: [gpu]}]

  bge-embed:
    image: ghcr.io/huggingface/text-embeddings-inference:1.5
    command: --model-id=BAAI/bge-m3 --port=8080
    ports: ['8080:8080']
    deploy:
      resources:
        reservations:
          devices: [{driver: nvidia, count: 1, capabilities: [gpu]}]
```

#### 4.4.3 Benchmarks (4 priorità ordinate)

**B1 — Qwen 7B chat latency vs Gemini Flash** (1h)

```bash
# 100 prompt da scripts/bench/workloads/tutor-q3-fixtures.jsonl
# Misura: p50/p95/p99 latency, output tokens/sec
node scripts/bench/run-llm-bench.mjs \
  --provider=vllm --endpoint=http://gpu-vps:8000 \
  --workload=tutor-q3-fixtures.jsonl \
  --output=/tmp/bench-qwen7b.json
```

Decision: IF p95 < 800ms → viable Stage 2a candidate.

**B2 — BGE-M3 embeddings vs keyword retriever Sett-4** (30min)

```bash
# Indicizza 549 chunk RAG con BGE-M3
# Test 50 query reali → confronta top-3 hits con keyword retriever
node scripts/bench/embed-vs-keyword.mjs \
  --bge-endpoint=http://gpu-vps:8080 \
  --rag-chunks=src/data/rag-chunks.json \
  --queries=scripts/bench/workloads/wiki-queries.jsonl \
  --output=/tmp/bench-bge.json
```

Decision: IF precision@3 > keyword + 20% → migrate Wiki retriever Sprint 7.

**B3 — Voxtral 4B TTS quality vs Edge TTS** (30min)

```bash
# Sintetizza 10 frasi tipiche UNLIM in IT
# Compara: speed, naturalezza, prosody
ollama run mistral-voxtral-4b "Ragazzi, vediamo insieme come funziona il LED"
# Save WAV, manual A/B vs Edge TTS samples
```

Decision: subjective IT pronunciation + speed feedback.

**B4 — Qwen 14B latency stretch test** (30min)

If GPU has headroom (24GB+):
```bash
ollama pull qwen2.5:14b-instruct-q4_K_M  # ~8GB
# Re-run B1 workload with 14B
```

Decision: IF 14B latency < 1500ms → premium tier viable.

#### 4.4.4 Decision matrix output

| Result combo | Decision |
|--------------|----------|
| Qwen 7B p95 <800ms + BGE-M3 wins + Voxtral OK | **GO Stage 2a** — Hetzner GEX44 mensile post 1st paying school |
| Qwen 7B p95 800-1500ms + BGE-M3 wins | **GO partial** — BGE-M3 only Sprint 7 |
| Qwen 7B fail + BGE-M3 fail | **NO-GO** — stay cloud Gemini, GDPR plan diventa CRITICAL |
| Voxtral fail | keep Edge TTS (no migration) |

#### 4.4.5 Document + audit doc

`docs/audits/2026-04-25-hetzner-trial-results.md`:
- Provider chosen + cost actual
- Benchmark numbers raw
- Decision per matrix
- Action items (Stage 2a or no-go)

### 4.5 Vercel Pro setup (quick wins NOW)

#### 4.5.1 Web Analytics (15min)

```bash
npm install @vercel/analytics
```

In `src/main.jsx` (or root):
```jsx
import { Analytics } from '@vercel/analytics/react';

// Inside root render:
<>
  <App />
  <Analytics />
</>
```

Deploy → Vercel dashboard "Analytics" tab populates within 30min.

#### 4.5.2 Speed Insights (15min)

```bash
npm install @vercel/speed-insights
```

In `src/main.jsx`:
```jsx
import { SpeedInsights } from '@vercel/speed-insights/react';

<>
  <App />
  <SpeedInsights />
</>
```

Deploy → Core Web Vitals (LCP, FID, CLS, TTFB) tracked automatically.

#### 4.5.3 Vercel Cron warmup (1h)

Create `api/cron/warmup.js`:
```javascript
// Vercel cron pings Supabase Edge Function every 5 min to keep warm.
// Vercel Pro plan unlocks scheduled functions.
export const config = { runtime: 'edge' };

export default async function handler() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const apiKey = process.env.ELAB_API_KEY;

  const targets = [
    `${supabaseUrl}/functions/v1/unlim-chat`,
    `${supabaseUrl}/functions/v1/unlim-diagnose`,
    `${supabaseUrl}/functions/v1/unlim-hints`,
  ];

  const results = await Promise.all(
    targets.map(url =>
      fetch(url, { method: 'GET', headers: { 'X-Elab-Api-Key': apiKey } })
        .then(r => ({ url, status: r.status }))
        .catch(e => ({ url, error: e.message }))
    )
  );

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

Add `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/warmup", "schedule": "*/5 * * * *" }
  ]
}
```

Replaces `src/services/renderWarmup.js` client-side keepalive (server-side better, no user load impact).

---

## 5. Plan critique (self-audit per /quality-audit)

### 5.1 GDPR plan critique (file 2026-04-26-gdpr-block-together-student-runtime.md)

**Strengths:**
- TDD strict 13 task with red/green discipline
- Clear file paths + line numbers (verified line 181 llm-client.ts)
- Backward compat clause preserves legacy callers
- Pure helpers (`decideProvider`, `resolveUserRole`) extracted for testability — Edge Function code can't be tested directly in vitest

**Weaknesses (onesto):**
- **Overwrought given thesis-corrected severity**. 13 task per MEDIUM defensive issue = inefficient. Could be 4-5 task slim plan: (1) add userRole to ChatRequest (2) gate in callLLM (3) default in handler (4) audit doc + PR.
- **Backward compat clause weakens enforcement**. Legacy callers without `context` bypass gate → defensive but defensive-against-self.
- **Production deploy gate ungainly**. 24h staging smoke + manual verification = 1 day delay. For MEDIUM severity, overhead-heavy.
- **Test boundary onestamente weak on Edge Function actual code**. Pure helpers tested but `callLLM` Deno code not directly verified. E2E spec missing.

**Verdict /quality-audit**: plan è solid TDD ma over-engineered post-thesis. Slim 5-task version equivalente safety.

### 5.2 Bundle opt plan critique (file 2026-04-26-bundle-optimization-vercel-oom-fix.md)

**Strengths:**
- TDD via size assertions (clean)
- Vercel remote build verification = real outcome test
- Audit doc + measurements pre/post
- Alternative path (Task 11) for Vercel Pro upgrade

**Weaknesses (onesto):**
- **Now MOOT post Vercel Pro upgrade**. 8GB build memory unlocks → OOM no longer occurs.
- **Plan still valuable but Sprint 7 polish, NOT urgent**.
- **Resource cost estimate (~150-200K tokens) high for non-urgent**.

**Verdict**: park Sprint 7. Reuse skeleton when bundle becomes UX issue (currently isn't).

### 5.3 Sprint Q PRs review status

8 PR draft. Andrea bottleneck humano. No way around. PR review prep packets potentially redundant given Sprint Q comprehensive doc covers same info.

**Onesto**: Andrea reads comprehensive doc + reviews diffs directly via GitHub UI. Minimal Claude leverage available here.

**Possible Claude help**: per-PR `gh pr diff N --name-only` summaries → quick scoping. 30min, marginal value.

---

## 6. Decision criteria (Hetzner go/no-go)

### 6.1 Hard-pass criteria (any fail → NO-GO Stage 2a)

| Criterion | Threshold | Why |
|-----------|-----------|-----|
| Qwen 7B p95 latency | < 1500ms | UX acceptable for student chat |
| Qwen 7B output IT quality | subjective ≥ Gemini Flash baseline | Tutor must be coherent in Italian |
| Stack deploy time | < 2h docker compose up | Operability post-trigger Stage 2a |
| GPU memory headroom | > 4GB free with 7B running | Future scaling |

### 6.2 Soft criteria (boost confidence)

| Criterion | Threshold | Boost |
|-----------|-----------|-------|
| Qwen 14B p95 latency | < 2000ms | premium tier viable |
| BGE-M3 precision@3 | > keyword + 20% | retriever migration |
| Voxtral 4B IT pronunciation | natural-enough subjective | TTS migration |
| Latency stability | <10% p95-p50 spread | reliability |

### 6.3 Decision tree

```
Hard-pass all 4?
├── YES → Stage 2a CONFIRMED, plan Hetzner GEX44 mensile post 1st paying school
│   └── Soft criteria all 4? → premium tier roadmap
│       └── 0-2 soft? → basic tier only
└── NO → Cloud-only path
    ├── Failure mode "latency"? → Gemini stays, GDPR plan EXEC critical
    ├── Failure mode "quality"? → re-evaluate Qwen 14B / 72B Sprint 8
    └── Failure mode "ops"? → defer infra, keep cloud
```

---

## 7. Risk register

| Rischio | Prob | Impatto | Mitigazione |
|---------|------|---------|-------------|
| Hetzner trial inconclusive (latency edge cases) | MEDIUM | MEDIUM | Decision tree explicit, soft criteria fallback |
| Mac Mini Brain self-host tunnel complexity | MEDIUM | LOW | Cloudflare tunnel +auth header pattern, fallback Hostinger VPS keep |
| Sprint Q merge conflict cascade | LOW | MEDIUM | rebase incrementale, CI catches |
| Vercel Pro Analytics data lag (cold start) | LOW | LOW | wait 30min post-deploy first read |
| Tea PNRR collateral late vs deadline | MEDIUM | HIGH | Davide need by 15/05/2026 for outreach window |
| GDPR violation surfaces unexpectedly (TOGETHER_API_KEY added) | LOW | HIGH | code-level gate (GDPR plan) prevents regardless of env |
| Andrea burnout (12h Saturday) | MEDIUM | HIGH | aggressive prioritization, drop nice-to-haves |

---

## 8. Anti-patterns (what NOT to do)

1. **Plan inflation > esecuzione**. 2 plans written today not yet executed. Stop writing more plans for tasks <4h scope.
2. **Score auto-claim >7 senza CoV**. G45 audit established self-score inflated 3 punti vs reality. Always benchmark.cjs --write before claim.
3. **Bundle opt execute oggi**. Vercel Pro solves OOM. Sprint 7 candidate, NOT today.
4. **GDPR plan full execute oggi**. Thesis-corrected severity MEDIUM. Slim version sufficient. Defer to weekday post-thesis-validation.
5. **Mac Mini setup remoto da MacBook**. Andrea fisicamente accessibile, but commands need physical Mac Mini. Plans help, execution requires presence.
6. **Render upgrade**. Free fallback OK. €€/mese for marginal benefit. Better: deprecate post-Mac-Mini-Brain self-host.
7. **Together AI ATTIVE without gate**. Production now safe (no key). Adding key without gate first = active GDPR violation creation.
8. **Acquistare Hetzner GEX44 mensile pre-1st-paying-school**. €187/mo × 12 = €2244/anno = 100x current AI cost. Premature.
9. **Multi-PR scope creep**. Each PR should have SINGLE concern. Sprint Q showed clean cascade — maintain pattern.
10. **Reading Sprint Q feature branches sequentially**. Comprehensive doc covers all Q0-Q6. Re-reading audit docs = redundant.

---

## 9. Execution sequence (Saturday optimized)

### Time budget Andrea: 8-10h Saturday

**Block 1 (0-30min): instant wins**
- Vercel Analytics setup: 15min
- Vercel Speed Insights setup: 15min

**Block 2 (30-90min): Mac Mini autonomous loop start**
- SSH/local Mac Mini access
- Ollama install + Qwen3.5-2B import
- launchd plist setup
- Verify loop active

**Block 3 (90min - 6h): Hetzner trial PRIMARY**
- Provision Scaleway L4 FR
- Deploy docker-compose stack
- Run B1-B4 benchmarks
- Document results
- Decision per matrix

**Block 4 (background async): Sprint Q PR review**
- 2-3h spread across day, 10-15min per PR
- Squash merge sequential post Andrea OK each

**Block 5 (Saturday evening 30min): wrap-up**
- Audit doc Hetzner results
- Tomorrow plan if Hetzner inconclusive

**Tea parallel (Saturday + Sunday)**:
- Block T1 (4-6h): PNRR 1-pager
- Block T2 (2-3h Sunday): Wiki concept review
- Block T3 (1-2h Sunday): Vol3 bug fix

**Claude Opus parallel (this session, async)**:
- This document (DONE)
- Hetzner runner script `scripts/bench/run-llm-bench.mjs` (next, optional)
- BGE-M3 vs keyword script `scripts/bench/embed-vs-keyword.mjs` (next, optional)
- Mac Mini launchd plist template (next, optional)

### What I (Claude) deliver NOW (post this doc)

If Andrea OKs proceed:
1. Hetzner benchmark runner script (~60 lines Node)
2. Mac Mini launchd plist template
3. Vercel Cron warmup endpoint code
4. Tea brief docs (PNRR + Wiki review + Vol3 bugs)

---

## 10. Success metrics (today end-of-day)

### Saturday end-of-day check (Andrea self-rate, no inflation)

| Metric | Target | Verify |
|--------|--------|--------|
| Vercel Analytics live | Real user data visible | Vercel dashboard |
| Vercel Speed Insights live | Core Web Vitals tracked | Vercel dashboard |
| Mac Mini autonomous loop | Process running, log file growing | `launchctl list \| grep elab` |
| Hetzner trial result | Decision matrix output | audit doc |
| Sprint Q PR merged | At least 1 PR cascaded | gh pr list |
| Tea PNRR draft | First version received | TEA folder |

### Weekly check (next Saturday 2026-05-02)

| Metric | Target | Source |
|--------|--------|--------|
| 7-day Speed Insights p75 LCP | < 2.5s | Vercel dashboard |
| Mac Mini Brain V13 uptime | > 95% | logs |
| Sprint Q PR cascade | All 8 merged | gh pr list |
| Tea PNRR final | docx + pdf delivered | TEA folder |
| Hetzner decision committed | go/no-go documented | audit doc |
| First-paying-school | At minimum 1 demo done | sales notes |

---

## 11. Final verdict

**Onesta**: today is THESIS VALIDATION DAY, not feature delivery day. Hetzner trial is the pivot point per "final state GPU VPS" statement.

**Anti-flatter check**:
- Saved 4-6h not executing GDPR plan (thesis-corrected severity).
- Saved 4-6h not executing Bundle opt (Vercel Pro solved OOM).
- Saved redundant PR review prep (comprehensive doc already exists).
- Refused Mac Mini setup remoto (physical access required, prep only).
- Refused Render upgrade (deprecate path better via Mac Mini Brain self-host).

**Honest gap**: this doc is itself a plan. Plan inflation risk acknowledged. Execution > more docs from now.

**Next claude action** (if Andrea OK): write the 3-4 helper scripts (Hetzner runner, BGE benchmark, Mac Mini plist, Vercel Cron). Then stop writing, start executing where applicable.

**Ultima onesta riga**: nessun progetto raggiunge stato definitivo senza esecuzione. 7 giorni di plan writing senza esecuzione = 0 valore prodotto. Saturday execution gate.

---

**File path**: `docs/strategy/2026-04-25-saturday-master-formulation.md`
**Skill compliance**: quality-audit (audit current + plans + critique) + writing-plans (4 sub-plans inline) + documentation (engineering doc structure)
**Caveman compliance**: chat replies caveman; this doc normal language per skill rules.
