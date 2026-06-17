# Fallback Orchestration Architecture — ELAB Tutor Sprint T iter 17

**Date:** 2026-04-28
**Iteration:** Sprint T iter 17 (research-opus)
**Scope:** Detailed architecture for 3-tier LLM fallback chain with health-check, routing, telemetry, and chaos-test plan
**Companion to:** 01-api-alternatives-comprehensive-2026.md

---

## 1. Architecture Overview — 3-Tier Fallback Chain

```
                                     ┌──────────────────────────┐
                                     │  ELAB Frontend (Vercel)  │
                                     │  Chat UI + Audio +       │
                                     │  Lavagna + Simulatore    │
                                     └─────────────┬────────────┘
                                                   │ HTTPS POST /api/galileo/chat
                                                   ▼
                          ┌──────────────────────────────────────────┐
                          │  Supabase Edge Function: galileo-router  │
                          │  (Deno runtime, 50ms cold start)         │
                          │                                          │
                          │  - Auth check (class_key + UUID)         │
                          │  - GDPR consent gate                     │
                          │  - PII scrubbing pre-prompt              │
                          │  - Provider selection (state-snapshot-   │
                          │    aggregator decision)                  │
                          │  - Audit trail INSERT (Postgres)         │
                          └──────────┬─────────────┬──────────┬──────┘
                                     │             │          │
                          ┌──────────▼──┐  ┌──────▼─────┐  ┌─▼────────────┐
                          │   TIER 1    │  │   TIER 2   │  │   TIER 3     │
                          │  Scaleway   │  │  Mistral   │  │  Vertex AI   │
                          │  H100 PAR2  │  │  La Plate- │  │  Gemini 3.1  │
                          │  self-host  │  │  forme FR  │  │  europe-west4│
                          │  (primary)  │  │  (EU API)  │  │  (last resort│
                          │             │  │            │  │   gated)     │
                          └─────────────┘  └────────────┘  └──────────────┘
                                     ▲             ▲          ▲
                                     │             │          │
                          ┌──────────┴─────────────┴──────────┴──────┐
                          │     Health-check daemon (every 30s)      │
                          │     /healthz polling, latency p95,        │
                          │     error rate window 5min                │
                          └───────────────────────────────────────────┘
```

---

## 2. Tier Definitions (recap from Deliverable 1)

### Tier 1 — Scaleway H100 PAR2 self-hosted (PRIMARY student-runtime)

- **Model**: Mistral Large 3 weights (or fine-tuned ELAB-Galileo-V14)
- **Hardware**: 1× H100-1-80GB always-on, €2.73/hr × 24 × 30 = €1,966/mo
- **Endpoint**: `https://galileo-elab.scw-paris-2.elab-tutor.eu:8443/v1/chat/completions`
- **Sovereignty**: 100% EU jurisdiction, no CLOUD Act, full data control
- **Throughput**: 2,000-5,000 tokens/sec on Llama 70B Q5 = ~100-500 concurrent sessions
- **Use case**: All student-runtime requests by default

### Tier 2 — Mistral La Plateforme EU (overflow + emergency teacher-context)

- **Model**: Mistral Large 3 (chat) + Codestral (Arduino code completion)
- **Endpoint**: `https://api.mistral.ai/v1/chat/completions` (Paris FR datacenter)
- **Pricing**: $2 in / $6 out per 1M tokens — $0.022/session blended
- **Use case**: (a) Tier 1 down/unhealthy, (b) Tier 1 latency spike >10s, (c) burst overflow >500 concurrent

### Tier 3 — Vertex AI Gemini 3.1 Flash europe-west4 (last resort, gated)

- **Model**: Gemini 3.1 Flash (replacement for retiring Flash-Lite 1 June 2026)
- **Endpoint**: `https://europe-west4-aiplatform.googleapis.com/v1/...`
- **Pricing**: ~$0.50-1/M blended (regional +10-25% premium)
- **Gate**: Requires `student_consent.allow_us_processing == true` flag
- **Default**: OPT-IN OFF for K-12 minors per parental consent flow
- **Use case**: Tier 1 + Tier 2 BOTH unhealthy AND consent flag set

---

## 3. Failure Detection — Health-check System

### 3.1 Endpoints monitored

```typescript
// supabase/functions/galileo-health/index.ts
const TIERS = [
  { id: 'tier1-scw', url: 'https://galileo-elab.scw-paris-2.elab-tutor.eu:8443/healthz', timeout_ms: 3000 },
  { id: 'tier2-mistral', url: 'https://api.mistral.ai/v1/models', timeout_ms: 5000, auth: 'Bearer ...' },
  { id: 'tier3-vertex', url: 'https://europe-west4-aiplatform.googleapis.com/v1/healthz', timeout_ms: 5000, auth: 'oauth' }
]
```

### 3.2 Health check loop

- **Frequency**: every 30s (Cron triggered Supabase Edge Function)
- **Probe**: HTTP GET `/healthz` (Tier 1 custom) or model-list endpoint (Tier 2/3)
- **Success criteria**: HTTP 200 response within timeout_ms
- **Latency tracking**: rolling window 5min, compute p50/p95/p99
- **State storage**: Postgres table `provider_health` (provider_id, status, p95_latency_ms, error_rate, last_check_at)

### 3.3 Failure thresholds (declare unhealthy)

A tier is marked **UNHEALTHY** when ANY of:
- 3 consecutive failed health checks (90s window)
- p95 latency > 10,000ms over rolling 5min
- Error rate > 5% over rolling 5min (failed requests / total requests)
- HTTP 5xx burst: 5 errors within 60s

A tier RECOVERS when:
- 5 consecutive successful health checks (150s window)
- p95 < 5,000ms
- Error rate < 1% sustained 5min

### 3.4 State machine

```
       healthy ───error_burst──▶ degraded ───3_failures──▶ unhealthy
          ▲                          │                         │
          │                          │                         │
          └─────5_successes──────────┴─────5_successes─────────┘
```

---

## 4. Routing Logic — Per-request gate

### 4.1 Decision tree (galileo-router Edge Function)

```typescript
async function selectProvider(req: ChatRequest): Promise<Provider> {
  const health = await getProviderHealth();           // cached 10s
  const consent = await getConsentFlags(req.uuid);    // RLS-protected
  const requestType = classifyRequest(req);            // 'student' | 'teacher'

  // Student-runtime path
  if (requestType === 'student') {
    if (health.tier1.status === 'healthy') return Provider.SCALEWAY_H100;
    if (health.tier2.status === 'healthy') return Provider.MISTRAL_PLATEFORME;
    if (health.tier3.status === 'healthy' && consent.allow_us_processing)
      return Provider.VERTEX_GEMINI;

    // ALL TIERS DOWN → graceful degradation
    return Provider.OFFLINE_FALLBACK;  // canned responses + retry banner
  }

  // Teacher-context path (no student PII, more permissive)
  if (requestType === 'teacher') {
    if (health.tier2.status === 'healthy') return Provider.MISTRAL_PLATEFORME;
    if (health.tier1.status === 'healthy') return Provider.SCALEWAY_H100;
    return Provider.VERTEX_GEMINI;  // teacher-context not gated by student consent
  }
}
```

### 4.2 Latency budget per tier

| Tier | Target p95 | Hard timeout | Action on timeout |
|---|---|---|---|
| Tier 1 (Scaleway) | 2000ms | 8000ms | retry once Tier 2 |
| Tier 2 (Mistral) | 3000ms | 10000ms | retry once Tier 3 (if consent) |
| Tier 3 (Vertex) | 4000ms | 12000ms | return offline-fallback |

### 4.3 GDPR consent flag schema

```sql
CREATE TABLE student_consent (
  uuid TEXT PRIMARY KEY,
  class_key TEXT NOT NULL,
  parent_email TEXT,
  allow_us_processing BOOLEAN DEFAULT FALSE,
  allow_eu_processing BOOLEAN DEFAULT TRUE,
  consent_signed_at TIMESTAMPTZ,
  consent_revoked_at TIMESTAMPTZ,
  parental_signature_doc_url TEXT,
  audit_trail JSONB
);

CREATE INDEX student_consent_class_key_idx ON student_consent(class_key);

ALTER TABLE student_consent ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_self_read ON student_consent FOR SELECT USING (uuid = current_setting('app.uuid', true));
CREATE POLICY teacher_class_read ON student_consent FOR SELECT TO teacher
  USING (class_key IN (SELECT class_key FROM teacher_classes WHERE teacher_id = auth.uid()));
```

---

## 5. State-Snapshot-Aggregator Integration (orchestratore parallelo, iter 6)

The state-snapshot-aggregator (designed iter 6) provides parallel orchestration: multiple worker agents process the same student question simultaneously, results aggregated by snapshot consensus.

### 5.1 Integration with fallback chain

```
                   Student question
                         │
                         ▼
            ┌───────────────────────────┐
            │  state-snapshot-aggregator │
            │  splits into N=3 workers   │
            └─────┬──────────┬──────────┬┘
                  │          │          │
                  ▼          ▼          ▼
              Worker A   Worker B   Worker C
              (Tier 1)   (Tier 2)   (Tier 1)
              Mistral    Mistral    Codestral
              Large 3    Large 3    (code-spec)
                  │          │          │
                  └──────┬───┴──────────┘
                         ▼
              ┌──────────────────────┐
              │  Snapshot aggregator │
              │  semantic consensus  │
              │  + voting / quality  │
              └──────────┬───────────┘
                         ▼
                   Best response →
                   to student UI
```

### 5.2 Aggregator decision criteria (consensus rules)

- **Identical answer (>80% semantic similarity)**: trust majority, return fastest
- **Divergent answers**: route to Tier 1 highest-quality (Mistral Large 3) tiebreaker
- **All workers failed**: degrade to offline-fallback canned response
- **One worker timed out**: continue with surviving workers, log incident

### 5.3 Cost optimization within aggregator

- Default N=1 (single worker, Tier 1 only) for >90% of student-runtime requests
- Bump N=2 (Tier 1 + Tier 2 parallel) for HIGH-VALUE moments: end-of-lesson exam, debugging Arduino circuit failure (Tea + Andrea define triggers)
- Bump N=3 (full parallel) for critical UNLIM diagnose + hint where wrong answer = student frustration loop

**Cost math** N=2 mode:
- 1 student session normal (N=1) Mistral Large = $0.022
- 1 student session HIGH-VALUE (N=2) = $0.044 per session
- If 10% of sessions are HIGH-VALUE: blended cost = $0.0242/session (+10%)
- At 1.25M sessions/month: extra cost = $2,750/month — acceptable for quality lift

---

## 6. Telemetry — Provider success rate, cost tracking, fallback hit rate

### 6.1 Schema — `galileo_telemetry` Postgres table

```sql
CREATE TABLE galileo_telemetry (
  id BIGSERIAL PRIMARY KEY,
  request_id UUID NOT NULL,
  uuid TEXT NOT NULL,                  -- student anon UUID
  class_key TEXT NOT NULL,
  request_type TEXT NOT NULL,          -- 'student' | 'teacher'
  provider TEXT NOT NULL,              -- 'tier1-scw' | 'tier2-mistral' | 'tier3-vertex'
  model TEXT NOT NULL,                 -- 'mistral-large-3' | 'gemini-3.1-flash'
  tokens_input INT NOT NULL,
  tokens_output INT NOT NULL,
  latency_ms INT NOT NULL,
  status TEXT NOT NULL,                -- 'success' | 'timeout' | 'error_5xx' | 'error_4xx'
  fallback_chain TEXT[],               -- e.g., ['tier1-scw_fail', 'tier2-mistral_success']
  cost_usd NUMERIC(10,6),
  consent_us_processing BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  retention_until TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

CREATE INDEX galileo_tel_created_at_idx ON galileo_telemetry(created_at);
CREATE INDEX galileo_tel_provider_status_idx ON galileo_telemetry(provider, status);
CREATE INDEX galileo_tel_class_idx ON galileo_telemetry(class_key, created_at);
```

### 6.2 Dashboard queries (Andrea operations)

**Fallback hit rate (last 24h)**:
```sql
SELECT provider,
       COUNT(*) AS requests,
       SUM(CASE WHEN status='success' THEN 1 ELSE 0 END)::FLOAT / COUNT(*) AS success_rate,
       AVG(latency_ms) AS avg_latency,
       PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) AS p95_latency,
       SUM(cost_usd) AS total_cost_usd
FROM galileo_telemetry
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY provider
ORDER BY requests DESC;
```

**Per-class cost (monthly billing rollup)**:
```sql
SELECT class_key,
       DATE_TRUNC('month', created_at) AS month,
       COUNT(*) AS sessions,
       SUM(cost_usd) AS month_cost_usd,
       SUM(cost_usd) / COUNT(DISTINCT uuid) AS cost_per_student
FROM galileo_telemetry
WHERE request_type = 'student'
GROUP BY class_key, DATE_TRUNC('month', created_at)
ORDER BY month DESC, sessions DESC;
```

**Tier 1 health degradation detector**:
```sql
SELECT DATE_TRUNC('hour', created_at) AS hour,
       COUNT(*) AS reqs,
       SUM(CASE WHEN status='success' THEN 1 ELSE 0 END)::FLOAT / COUNT(*) AS success_rate
FROM galileo_telemetry
WHERE provider = 'tier1-scw' AND created_at > NOW() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour DESC;
```

### 6.3 Alerting rules

- Alert if Tier 1 success_rate < 95% over 1h → Telegram OpenClaw to Andrea
- Alert if Tier 2 fallback_hit > 30% over 1h → suggests Tier 1 degraded
- Alert if Tier 3 fallback_hit > 5% over 24h → suggests Tier 1+Tier 2 simultaneous failure
- Alert if total daily cost > $200 → cost spike investigation

---

## 7. Cost Optimization — Prefer cheapest healthy provider when quality equal

### 7.1 Quality gating

For routing decisions where Tier 1 is healthy, NEVER fall through to Tier 2 just for cost (Tier 1 is already the lowest marginal cost — fixed €2k/mo includes ~80% of monthly capacity).

For Tier 2 vs Tier 3 (both API-priced):
- If Tier 2 healthy: ALWAYS prefer Tier 2 (Mistral Large 3 EU sovereignty + cheaper)
- Tier 3 only when Tier 2 unavailable AND consent flag enabled

### 7.2 Quality-score blending (future phase, post Sprint T)

If/when ELAB internal quality benchmarks become available (Tea + Andrea Italian K-12 blind eval):
```python
score = (1 - quality_normalized) * weight_quality + cost_per_session * weight_cost
# minimize score → choose provider
```

Initial weights: quality_weight=0.7, cost_weight=0.3 (favor quality for K-12 trust).

---

## 8. Audit Trail — Postgres + 30-day retention

### 8.1 Compliance mandate

GDPR Art. 30 (records of processing activities) + EU AI Act Art. 12 (logging requirements for high-risk systems) require:
- Per-request audit: timestamp, user pseudo-id, provider used, prompt-hash (NOT raw prompt for student PII), output tokens, error if any
- Retention 30 days minimum for incident forensics
- Export-on-demand for parental data subject requests (GDPR Art. 15)

### 8.2 Implementation

```sql
CREATE TABLE galileo_audit_trail (
  id BIGSERIAL PRIMARY KEY,
  request_id UUID UNIQUE NOT NULL,
  uuid TEXT NOT NULL,
  class_key TEXT NOT NULL,
  prompt_sha256 TEXT NOT NULL,         -- HASH only, not raw
  prompt_token_count INT NOT NULL,
  response_token_count INT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  pii_redacted BOOLEAN NOT NULL,       -- TRUE if PII scrubbing pre-prompt fired
  consent_snapshot JSONB,              -- snapshot of consent flags at request time
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- 30-day automatic deletion (pg_cron)
  retention_until TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

-- Cron job: daily delete expired records
SELECT cron.schedule('delete-expired-audit', '0 2 * * *', $$
  DELETE FROM galileo_audit_trail WHERE retention_until < NOW();
$$);
```

### 8.3 PII scrubbing pre-prompt

Before sending prompt to ANY provider, scrub:
- Email addresses (regex `[\w.-]+@[\w.-]+`)
- Phone numbers (Italian format `\+39\s?\d{3}[\s-]?\d{3,7}`)
- Italian fiscal code (regex `[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]`)
- Full names (NER-based, allowlist of school first names is fine)
- Addresses (multi-line capitalized blocks)

**Replacement**: `[REDACTED:email]`, `[REDACTED:phone]`, etc.

### 8.4 Data subject access request (GDPR Art. 15) export

```sql
-- For parent of student with uuid X, export all interactions in last 30 days
SELECT request_id, created_at, provider, prompt_token_count, response_token_count, status, consent_snapshot
FROM galileo_audit_trail
WHERE uuid = $1 AND created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;
```

---

## 9. Test Plan — Chaos Engineering (provider-down simulation)

### 9.1 Test scenarios (8 mandatory)

| # | Scenario | Method | Expected behavior | Pass criteria |
|---|---|---|---|---|
| 1 | Tier 1 hard down | iptables drop traffic to Scaleway | Auto-failover to Tier 2 | <30s detection, no user-visible error |
| 2 | Tier 1 latency spike | inject 15s sleep in inference | Timeout-and-retry to Tier 2 | <12s total user-visible latency |
| 3 | Tier 2 down (Mistral 503) | mock 503 response | Auto-failover to Tier 3 (if consent) OR offline | offline banner if no consent |
| 4 | Tier 1 + Tier 2 both down | iptables both | Tier 3 if consent, else offline | offline graceful, no crash |
| 5 | All 3 tiers down | iptables all | Offline-fallback canned | UI shows reconnecting banner |
| 6 | Recovery transition | bring Tier 1 back after 5min outage | Health check detects, traffic resumes | <150s full recovery |
| 7 | Burst spike (6,250 concurrent) | k6 load test | Tier 1 saturates, overflow to Tier 2 | p95 < 5s, no errors |
| 8 | Consent flag denied | set allow_us_processing=false, kill T1+T2 | Offline-fallback (no T3) | NO request to Vertex, audit trail confirms |

### 9.2 Tooling

- **k6** for load generation (up to 10k VUs)
- **toxiproxy** for fault injection (latency, packet drops, bandwidth limit)
- **Supabase functions test harness** (deno test) for unit-level routing logic
- **Run cadence**: full chaos suite on every Sprint T release-candidate, monthly drills in production-like staging

### 9.3 Chaos drill schedule (production-staging)

- **Weekly**: scenario 1 (Tier 1 hard down) — auto-recovery confirmation
- **Bi-weekly**: scenarios 1+2+6 sequence — failure + recovery
- **Monthly**: full suite 1-8 — release confidence
- **Quarterly**: blind game-day (one engineer kills random tier without notice) — operational readiness

---

## 10. Implementation Roadmap — 4 weeks (May 2026)

| Week | Deliverable | Owner |
|---|---|---|
| W1 (1-7 May) | Provision Scaleway H100 PAR2, deploy Mistral Large 3 weights, /healthz endpoint | Andrea + Mac Mini factotum |
| W2 (8-14 May) | Mistral La Plateforme integration, galileo-router rewrite, audit trail tables | Andrea |
| W3 (15-21 May) | Vertex Gemini 3.1 Flash europe-west4 integration + consent flag UI flow | Andrea + Tea (UI) |
| W4 (22-28 May) | Chaos test scenarios 1-8, alerting, dashboard queries, ADR-022 final | Andrea |
| **31 May DEADLINE** | Migration off Gemini 2.0 Flash-Lite COMPLETE before 1 June retirement | hard cutover |

---

## 11. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Scaleway H100 supply shortage | Medium | High | Pre-reserve 2 instances, fallback to Hetzner GPU EU |
| Mistral Large 3 weights license restriction (commercial use of self-hosted) | Low | High | Verify license; use Mixtral 8×7B or Llama 3.3 70B as alternative weights |
| Gemini 2.0 cutoff missed (ELAB breaks 1 June) | High if delay | Critical | Hard deadline 31 May, weekly stand-up checkpoint with Tea |
| Cost overrun >€10k/mo at scale | Medium | High | Monthly cost dashboard alert >$200/day, kill-switch UI for non-essential UNLIM features |
| EU AI Act FRIA not ready by 2 Aug 2026 | High | Regulatory | Engage Davide (MePA expert) + legal counsel by 15 May 2026 |
| Chaos test reveals hidden coupling | Medium | Medium | Buffer 1 week in W4 for unexpected fixes |

---

## 12. Sources Cited

1. https://www.scaleway.com/en/h100/
2. https://www.scaleway.com/en/pricing/gpu/
3. https://mistral.ai/pricing
4. https://api.mistral.ai/ (La Plateforme docs)
5. https://cloud.google.com/vertex-ai/generative-ai/pricing
6. https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/locations
7. https://artificialintelligenceact.eu/article/12/ (EU AI Act logging requirements)
8. https://gdpr-info.eu/art-30-gdpr/ (records of processing)
9. https://gdpr-info.eu/art-15-gdpr/ (data subject access)
10. https://k6.io/docs/ (load testing)
11. https://github.com/Shopify/toxiproxy (fault injection)
12. https://supabase.com/docs/guides/functions (Edge Functions runtime)
13. https://www.postgresql.org/docs/current/pgcron.html (cron job for retention)
14. https://lyceum.technology/magazine/eu-data-residency-ai-infrastructure/ (EU residency 2026)

**END Deliverable 2.**
