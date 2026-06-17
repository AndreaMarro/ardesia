---
id: ADR-010
title: Together AI fallback gated — chain RunPod EU → Hetzner EU → Gemini EU → Together (emergency_anonymized only)
status: proposed
date: 2026-04-26
deciders:
  - architect-opus (Sprint S iter 3 ralph loop, Pattern S)
  - Andrea Marro (final approver per gate semantics + GDPR sign-off)
context-tags:
  - sprint-s-iter-3
  - llm-fallback-chain
  - gdpr-eu-only-student-runtime
  - audit-log
  - cost-discipline
  - principio-zero
related:
  - ADR-007 (Wiki module extraction pattern)
  - ADR-008 (buildCapitoloPromptFragment) — Sprint S iter 2
  - ADR-009 (validatePrincipioZero middleware) — Sprint S iter 2
  - ADR-011 (R5 stress fixture extension) — sibling iter 3
  - docs/strategy/2026-04-26-master-plan-v2-comprehensive.md §4.5 (fallback chain)
  - docs/pdr/PDR-SPRINT-S-ITER-3-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md §5
  - scripts/together-ai-fallback-wireup.ts (existing scaffold, Sprint S iter 1)
  - supabase/functions/_shared/llm-client.ts (existing callLLM, Sprint Day 01)
input-files:
  - scripts/together-ai-fallback-wireup.ts (217 LOC, Node-style scaffold non-Deno)
  - supabase/functions/_shared/llm-client.ts (227 LOC, Deno runtime, callLLM dispatcher)
  - supabase/functions/_shared/gemini.ts (callGemini + callBrainFallback + GeminiError)
  - supabase/functions/unlim-chat/index.ts (call site + supabase service-role client)
output-files:
  - supabase/functions/_shared/llm-client.ts (modified — add canUseTogether gate + audit)
  - supabase/functions/_shared/anonymize.ts (NEW — heuristic PII strip IT)
  - supabase/migrations/YYYYMMDDHHMMSS_together_audit_log.sql (NEW table + RLS policy)
  - tests/unit/supabase/together-fallback-gate.test.ts (gen-test-opus)
---

# ADR-010 — Together AI fallback gated (chain + audit + GDPR)

> Definire chain di fallback EU-first (RunPod → Hetzner → Gemini) con Together AI come emergency-only path, gated da `canUseTogether(context)` predicate, anonimizzazione PII obbligatoria pre-call, audit log immutabile su Supabase. Student runtime SEMPRE bloccato. Teacher batch + emergency_anonymized ammessi con consent.

---

## 1. Contesto

### 1.1 Perché un fallback necessario

Sprint S iter 1+iter 2 hanno mostrato due failure mode reali in produzione/dev:

1. **RunPod pod outages**: pod `felby5z84fk3ly` + `5ren6xbrprhkl5` durante iter 1 e iter 2 hanno avuto periodi multi-ora EXITED per "host saturo" (no GPU available datacenter US-WA-1, RTX A6000/6000 Ada). Resume ha richiesto 30+ retry over 4h iter 2. Mac Mini autonomous + Anthropic Claude Code chat dipendono da pod GPU per Wiki batch e bench R0/R5 che richiedano embedding live (BGE-M3 server) o vision (Qwen-VL). Se pod down, intero stack synthesis degrada.

2. **Gemini EU rate-limit / regional outage**: Gemini `gemini-2.5-flash` ha rate limit free tier (~60 req/min) e ha avuto regional outage EU una volta nel Sprint 4 (15 minuti). UNLIM chat live durante quel periodo ha mostrato errori 503 a docenti reali — UX inaccettabile.

Conclusione: senza fallback chain, MTTR (mean time to recover) per UNLIM live è dipendente da uptime singolo provider. Gli SLO informali per chat docente live (target p99 risposta <8s, error rate <0.5% giornaliero) richiedono ridondanza.

### 1.2 GDPR + dati minori vincolo

Studenti ELAB sono minori 8-14 anni. La filiera dati passa attraverso:
- Domande/risposte chat (testo, può contenere errori comuni con nome, classe, scuola)
- Screenshot circuit (potenziali nomi su lavagna fisica, raro)
- Voce STT (Whisper Turbo locale RunPod) e TTS (Coqui XTTS-v2) — già locali EU, no concern terzi

Together AI è US-based (datacenter Virginia/Oregon). Trasferimento dati minori verso US richiede:
- Privacy Shield → invalidato (Schrems II 2020)
- SCC (Standard Contractual Clauses) → richiede DPIA + supplementary measures
- Consenso esplicito genitore → unfeasible per ogni call live

Conclusione: dati student-runtime NON possono andare a Together AI. EU-only è hard requirement. Together accettabile SOLO per:
- Batch ingest one-time (es. embedding Wiki LLM concept, no PII)
- Teacher-context con consent (docente firma DPA, no PII studenti)
- Emergency anonymized (PII strip + 2+ EU providers down)

### 1.3 Audit requirements per dati minori

Garante Privacy IT (allineato GDPR Art. 30) richiede:
- Registry of processing activities (ROPA) con: scope, finalità, base giuridica, retention, recipient
- Per minori: data minimization stricter + parental consent tracking
- Per emergency cross-border transit: log immutabile con motivo + duration + dato processato

Conclusione: ogni call Together AI DEVE essere loggata in tabella append-only, con metadata esplicito (kind, anonymization payload, user_role, consent_id se applicabile, latency, status).

---

## 2. Decisione

### 2.1 Decisione D1 — Chain di fallback EU-first 4 livelli

**Scelta**: chain ordinata per (a) GDPR safety (EU→US ultimo), (b) latenza attesa, (c) costo. Implementata in `callLLM(messages, opts)` Deno runtime in `_shared/llm-client.ts`.

```
Livello 1 — RunPod EU (preferito quando RUNNING)
  endpoint:   ${RUNPOD_VPS_URL || https://gpu.elabtutor.school}
  model:      qwen2.5vl:7b (Ollama) | qwen2.5:7b
  region:     EU (datacenter mapping target Sprint H2; iter 3+ US-WA acceptable trans)
  latency:    ~800-1500ms p50
  gdpr:       SAFE (self-hosted)
  cost:       $0.49/h running (smart on/off)

Livello 2 — Hetzner EU (futuro Sprint H2 quando 3+ paying schools)
  endpoint:   ${HETZNER_GPU_URL}
  region:     EU (Germania/Finlandia)
  latency:    ~600-1200ms p50
  gdpr:       SAFE
  cost:       €838/mo committed
  iter 3:     N/A (commit gate non raggiunto, levello SKIP)

Livello 3 — Gemini EU (existing, default fallback)
  endpoint:   generativelanguage.googleapis.com (region-pinned EU via Vercel)
  model:      gemini-2.5-flash | gemini-2.5-flash-lite
  latency:    ~1500-3000ms p50
  gdpr:       SAFE (Google EU pinning + DPA firmato Andrea)
  cost:       free tier 60 RPM, then $0.075/1M tokens

Livello 4 — Together AI (emergency_anonymized only, GATED)
  endpoint:   api.together.xyz
  model:      meta-llama/Llama-3.3-70B-Instruct-Turbo
  region:     US (Virginia/Oregon)
  latency:    ~1000-2000ms p50
  gdpr:       UNSAFE per student data → richiede gate + anonymization
  cost:       $0.07/M tokens batch | $0.88/M tokens runtime
```

**Razionale ordering**: EU prima per GDPR. Self-hosted prima di Gemini per latenza (LAN call vs internet round-trip), costo (no per-call), e indipendenza terzi. Gemini terza perché managed service stabile ma rate-limit. Together ultima perché US + cost + GDPR risk.

**Alternative scartate**:

| Alternative | Pro | Contro | Decisione |
|-------------|-----|--------|-----------|
| Solo Gemini, no fallback | Semplice | Rate-limit visible | Scartato |
| Together come primary (cost) | Cheaper batch | GDPR violation student | Scartato |
| OpenAI GPT-4 fallback aggiuntivo | Strong reasoning | US + cost + key not in budget | Scartato |
| Anthropic Claude API fallback | Best quality | Andrea Max sub limited per dev, no production key | Scartato |
| Local Ollama Mac Mini fallback | Zero costo | Mac Mini M4 16GB <Qwen-VL 7B IO bound, latency ~5-15s, Andrea Max budget | Defer iter 5+ |

**Downside onesto**: chain di 4 livelli può sommare timeout. Mitigazione: `AbortSignal.timeout(3000)` per livello (max chain = 12s worst case, ma livello 1+2 dovrebbero rispondere <2s). Se tutti i 4 falliscono entro budget: throw `AllProvidersFailedError` → UI show offline message a docente con CTA "Riprova".

### 2.2 Decisione D2 — `canUseTogether(context)` predicate gate

**Scelta**: predicate puro, deterministico, no side effects. Block sempre student runtime. Allow batch-ingest one-time + teacher-context con consent + emergency_anonymized se 2+ EU providers down.

```ts
export type RequestKind =
  | "student_runtime"       // chat live LIM con classe — MAI Together
  | "teacher_lesson_prep"   // docente prepara lezione async — OK con consent
  | "batch_ingest"          // one-time wiki embedding, RAG chunk — OK no PII
  | "emergency_anonymized"; // 2+ EU providers down + PII stripped — OK gated

export interface CanUseTogetherContext {
  kind: RequestKind;
  euProvidersDownCount: number;      // 0..3
  consentId?: string;                 // DPA reference per teacher kind
  payloadAnonymized?: boolean;        // true se passed through anonymize()
  featureFlag: boolean;               // VITE_ENABLE_TOGETHER_FALLBACK
}

export function canUseTogether(ctx: CanUseTogetherContext): boolean {
  // Hard kill switch
  if (!ctx.featureFlag) return false;

  // Student runtime BLOCKED ALWAYS
  if (ctx.kind === "student_runtime") return false;

  // Teacher lesson prep require consent + anonymization
  if (ctx.kind === "teacher_lesson_prep") {
    return Boolean(ctx.consentId) && Boolean(ctx.payloadAnonymized);
  }

  // Batch ingest OK if no PII (caller responsibility verified upstream)
  if (ctx.kind === "batch_ingest") {
    return ctx.payloadAnonymized === true;
  }

  // Emergency requires 2+ EU providers down + anonymization
  if (ctx.kind === "emergency_anonymized") {
    return ctx.euProvidersDownCount >= 2 && ctx.payloadAnonymized === true;
  }

  return false;
}
```

**Razionale**:
- Pure function: testabile senza Supabase/Deno runtime. Genera test fixture exhaustive (15 combinazioni).
- Default false: ogni branch sconosciuto fail-safe.
- Feature flag `VITE_ENABLE_TOGETHER_FALLBACK` (default false) permette kill switch immediato senza redeploy code (env var Vercel + Supabase secret).
- Consent ID per teacher kind: stored in `teacher_consent` table (existing or future), uuid reference to DPA accepted by docente. NO PII stored, just reference.

**Alternative considerate**:

| Approach | Pro | Contro | Decisione |
|----------|-----|--------|-----------|
| Side-effectful gate (DB lookup consent live) | Sempre fresh | +50ms latency per call, DB pressure | Scartato (consent_id pre-loaded in session) |
| Class-based gate (extends BaseGate) | OO clean | Verbose Deno, no real benefit | Scartato |
| **Pure predicate function (SCELTO)** | Testable, fast, deterministic | Caller deve passare ctx full | Scelto |
| Feature flag globale on/off (no per-kind) | Semplice | Loss of granularity batch vs runtime | Scartato |

**Downside onesto**: il predicate non valida che `payloadAnonymized` è veritiero — caller può lying. Mitigazione: anonymization è applicata da `_shared/anonymize.ts` che è l'unico path verso Together via `callTogetherSafe()` wrapper. Se caller bypassa wrapper e chiama Together direttamente, audit log catturerà payload non-anonimizzato → review code → fix.

### 2.3 Decisione D3 — Audit log schema `together_audit_log` Supabase

**Scelta**: tabella append-only Supabase con RLS service-role-only. Schema dedicato (no riuso `unlim_pz_violations` che è quality-focused).

```sql
CREATE TABLE IF NOT EXISTS together_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_kind TEXT NOT NULL CHECK (request_kind IN
    ('student_runtime', 'teacher_lesson_prep', 'batch_ingest', 'emergency_anonymized')),
  anonymized_payload JSONB NOT NULL,    -- {messages_redacted, original_size_bytes, redactions_applied[]}
  user_role TEXT NOT NULL CHECK (user_role IN ('student', 'teacher', 'admin', 'system')),
  consent_id UUID,                      -- nullable, FK to teacher_consent (futuro)
  eu_providers_down JSONB NOT NULL,     -- {runpod: true, hetzner: false, gemini: true, evidence: '...'}
  latency_ms INT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'blocked', 'failed', 'timeout')),
  block_reason TEXT,                    -- nullable, populated when status='blocked'
  model TEXT NOT NULL DEFAULT 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  tokens_in INT,
  tokens_out INT,
  cost_usd_estimated NUMERIC(10, 6),
  validator_version TEXT NOT NULL DEFAULT 'v1.0'
);

CREATE INDEX idx_together_audit_ts ON together_audit_log (ts DESC);
CREATE INDEX idx_together_audit_kind ON together_audit_log (request_kind, ts DESC);
CREATE INDEX idx_together_audit_status ON together_audit_log (status) WHERE status != 'success';

-- RLS: service-role only insert+select. Admin role select via separate grant.
ALTER TABLE together_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full_access"
  ON together_audit_log
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- No public read. Andrea (admin) reads via Supabase dashboard SQL editor.
```

**Razionale**:
- `request_kind` enum allinea a `RequestKind` TS type (SQL CHECK + TS literal union mantengono sync).
- `anonymized_payload` JSONB stores redacted messages + diff size + redactions_applied list per audit (es. `["email_redacted_3", "phone_redacted_1"]`). NON stores raw original → GDPR compliant.
- `eu_providers_down` JSONB documenta lo stato dei 3 provider EU al momento del fallback. Richiesto per giustificare emergency.
- `consent_id` UUID FK opzionale a futura `teacher_consent` table (Sprint H2).
- `cost_usd_estimated` per cost monitoring + Andrea cap budget.
- RLS service-role-only: nessun client può leggere o inserire. Solo Edge Function autenticata via service role JWT.

**Alternative scartate**:

| Approach | Pro | Contro | Decisione |
|----------|-----|--------|-----------|
| Riusare `unlim_pz_violations` | Una tabella sola | Schema mismatch (quality vs gate-block) | Scartato |
| Solo console.log Vercel | Zero infra | Niente analytics, niente compliance ROPA | Scartato |
| PostHog event ingest | Dashboard out-of-the-box | GDPR doppio gate, +dependency | Scartato |
| **Tabella dedicata Supabase (SCELTO)** | Schema purpose-fit, query SQL semplice, RLS dedicate | +1 migration | Scelto |
| BigQuery export | Analytics potente | Overkill per <10k call/mese | Scartato |

**Downside onesto**: tabella accumula righe nel tempo. Retention plan: cron Supabase function settimanale → archive righe >90gg in `together_audit_log_archive` tabella separata + truncate originale. Per ora manuale (Andrea esegue SQL `DELETE WHERE ts < now() - interval '90 days'` ogni 3 mesi). Automation defer Sprint H2.

### 2.4 Decisione D4 — Implementation contract `callLLM(messages, opts)`

**Scelta**: estendere signature esistente di `callLLM` in `_shared/llm-client.ts` con parametro opzionale `opts.fallback`. Internal chain logic + post-call audit insert. Nessun breaking change per chiamanti esistenti (default `fallback: false` = comportamento legacy Together→Gemini).

```ts
// Existing signature (Sprint Day 01):
export async function callLLM(options: LLMOptions): Promise<LLMResult>

// Extended signature (ADR-010):
export interface LLMOptions {
  // ... existing fields ...
  fallback?: {
    enabled: boolean;                     // master switch
    requestKind: RequestKind;             // controls gate
    consentId?: string;
    sessionId?: string;
    userRole: "student" | "teacher" | "admin" | "system";
  };
}

// Internal chain:
// 1. Try RunPod EU (if RUNPOD_VPS_URL env set + Livello 1 healthy)
// 2. Try Hetzner EU (if HETZNER_GPU_URL env set — Sprint H2 NOT iter 3)
// 3. Try Gemini EU (existing)
// 4. Try Together IF canUseTogether(buildCtx(options, errorsTracking))
// 5. Audit insert post-call (fire-and-forget)
// 6. Return result OR throw AllProvidersFailedError
```

**Pseudocode chain**:

```ts
export async function callLLM(options: LLMOptions): Promise<LLMResult> {
  const fallback = options.fallback;
  const errors: { provider: string; message: string; latencyMs: number }[] = [];

  // Livello 1: RunPod
  if (Deno.env.get("RUNPOD_VPS_URL")) {
    try {
      return await callRunPod(options);
    } catch (e) {
      errors.push({ provider: "runpod", message: extractMsg(e), latencyMs: 0 });
    }
  }

  // Livello 2: Hetzner (Sprint H2 — skip iter 3)
  // Reserved.

  // Livello 3: Gemini EU (existing, default)
  try {
    return await callGemini(options);
  } catch (geminiError) {
    errors.push({ provider: "gemini-eu", message: extractMsg(geminiError), latencyMs: 0 });

    // Livello 4: Together gated
    if (!fallback?.enabled) {
      throw geminiError;  // legacy behavior — no fallback opt-in
    }

    const euProvidersDownCount = errors.length;
    const ctx: CanUseTogetherContext = {
      kind: fallback.requestKind,
      euProvidersDownCount,
      consentId: fallback.consentId,
      payloadAnonymized: false,    // will be true after anonymize()
      featureFlag: Deno.env.get("VITE_ENABLE_TOGETHER_FALLBACK") === "true",
    };

    if (!canUseTogether(ctx)) {
      // Audit log blocked
      auditTogetherCall({
        requestKind: ctx.kind,
        userRole: fallback.userRole,
        status: "blocked",
        blockReason: ctx.kind === "student_runtime"
          ? "student_runtime_never_together"
          : `gate_failed:flag=${ctx.featureFlag},down=${euProvidersDownCount}`,
        euProvidersDown: errorsToProviderMap(errors),
        anonymizedPayload: { messages_redacted: 0, original_size_bytes: 0, redactions_applied: [] },
        latencyMs: 0,
      });
      throw new AllProvidersFailedError(errors);
    }

    // Anonymize and call Together
    const safeMessages = anonymize(buildMessages(options));
    ctx.payloadAnonymized = true;

    try {
      const start = Date.now();
      const result = await callTogetherSafe(safeMessages, options);
      const latencyMs = Date.now() - start;

      // Audit log success
      auditTogetherCall({
        requestKind: ctx.kind,
        userRole: fallback.userRole,
        status: "success",
        anonymizedPayload: anonymizationDiff(options.message, safeMessages),
        euProvidersDown: errorsToProviderMap(errors),
        latencyMs,
        tokensIn: result.tokensUsed.input,
        tokensOut: result.tokensUsed.output,
        costUsdEstimated: estimateCost(result.tokensUsed),
        consentId: fallback.consentId,
      });

      return result;
    } catch (togetherError) {
      // Audit log failed
      auditTogetherCall({
        requestKind: ctx.kind,
        userRole: fallback.userRole,
        status: "failed",
        blockReason: extractMsg(togetherError),
        euProvidersDown: errorsToProviderMap(errors),
        anonymizedPayload: anonymizationDiff(options.message, safeMessages),
        latencyMs: 0,
      });
      throw new AllProvidersFailedError([...errors, { provider: "together", message: extractMsg(togetherError), latencyMs: 0 }]);
    }
  }
}
```

**Note implementation**:
- `auditTogetherCall` è fire-and-forget come ADR-009 PZ validator (non blocca return).
- `AllProvidersFailedError` extends Error con `errors[]` per debug. UI catches → mostra offline UX.
- `RUNPOD_VPS_URL` env var presence determina se Livello 1 attivo. Se assente, salta direttamente a Livello 3.
- Backward compat: `options.fallback = undefined` → comportamento legacy 100% (try Together → fallback Gemini). NO breaking changes deploy.

### 2.5 Decisione D5 — PII anonymization heuristic IT-first

**Scelta**: heuristic regex IT-tuned in `_shared/anonymize.ts` (NEW). Strip:

- Email: `/\b[\w.-]+@[\w.-]+\.[a-z]{2,}\b/gi` → `[EMAIL_REDACTED]`
- Phone IT: `/\+?39?\s*\d{2,4}[\s-]?\d{6,8}/g` (mobile + landline) → `[PHONE_IT_REDACTED]`
- Codice fiscale: `/\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b/g` → `[CF_REDACTED]`
- Nome studente pattern (form `nome: ...`, `studente: ...`, `alunno: ...`): regex catch field-style + first 1-2 words after.
- Class key: `/\bclass[_-]?key\s*[:=]\s*[A-Z0-9]{6,}\b/gi` → `[CLASS_KEY_REDACTED]`
- Student ID UUID: `/\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b/g` (uuid v4) → `[STUDENT_ID_REDACTED]`
- Italian name patterns common (defer NER to Sprint H2): list of 200 frequent names IT non-redacted (false positive accepted, mitigato da audit log review).

**Razionale**:
- Heuristic = deterministic + fast (<5ms) + auditable.
- IT-first perché Italian è target ELAB.
- NER (Named Entity Recognition) corretta richiederebbe modello (es. spaCy `it_core_news_lg` 540MB) — unfeasible Edge Function Deno (size limit ~50MB). Defer Sprint H2 con server dedicato.
- False positive (es. "Marco compra una resistenza" → "Marco" non strip) accettato per ora — audit log review permette tuning settimanale.

**Output `AnonymizationDiff`**:

```ts
export interface AnonymizationDiff {
  messages_redacted: number;        // count messages modified
  original_size_bytes: number;       // size original
  redactions_applied: string[];     // ["email_redacted_2", "phone_redacted_1", "cf_redacted_1"]
}
```

Returned per audit log per ROPA compliance.

**Downside onesto**: 5-10% false negative atteso (nomi italiani non in lista catch tramite contesto, es. "ho parlato con Federico ieri"). Acceptable per emergency-only path. Per teacher_lesson_prep, anonymization NON sostituisce DPA firmato (consent layer separato).

### 2.6 Decisione D6 — Cost discipline + budget

**Scelta**: Together AI usage strettamente regolato:

| Use case | Frequency | Budget cap | Approval |
|----------|-----------|------------|----------|
| Batch ingest Wiki | One-time per batch (~100 concept) | $5 max una-tantum | Andrea OK |
| Batch ingest RAG | One-time 6000 chunk Anthropic Contextual | $50 max una-tantum | Andrea OK |
| Teacher lesson prep | Async, on-demand by docente | $0.50/lesson, $20/mese cap | DPA + consent_id |
| Emergency anonymized | <1% calls (only when EU all down) | $5/mese cap monitoring | Auto-throttle |
| Student runtime | NEVER | $0 | Hard block |

Pricing Together AI 2026:
- Llama-3.3-70B Turbo: $0.88/M input, $0.88/M output → ~$0.07/M for batch (off-peak)
- Stima 6000 chunks × 500 token avg = 3M token input + 1.5M token output = ~$4 una-tantum

**Throttle**: Edge Function counter Redis-style via Supabase `together_quota_daily` (futuro) per non sforare cap mensile. Per ora cap manuale (Andrea checks audit log SQL settimanale).

**Cost monitoring SQL**:

```sql
SELECT
  date_trunc('day', ts) AS day,
  request_kind,
  COUNT(*) AS calls,
  SUM(cost_usd_estimated) AS spend_usd,
  AVG(latency_ms) AS avg_latency_ms
FROM together_audit_log
WHERE ts > now() - interval '30 days' AND status = 'success'
GROUP BY day, request_kind
ORDER BY day DESC, request_kind;
```

### 2.7 Decisione D7 — Rollback plan

**Scelta**: feature flag `VITE_ENABLE_TOGETHER_FALLBACK=false` default. Per-environment toggle:

- **Dev**: `true` per testing
- **Staging**: `true` con audit log review settimanale
- **Production**: `false` initial, flip a `true` SOLO dopo:
  1. ADR-010 implementation merged + tested
  2. Migration `together_audit_log` applicata
  3. Andrea DPO sign-off review anonymization
  4. Canary 1% traffic 7gg, error rate <1%

Rollback steps se issue post-canary:
1. Andrea sets `VITE_ENABLE_TOGETHER_FALLBACK=false` su Vercel/Supabase env (5 min effective).
2. UNLIM chat fallback chain torna a legacy: Together (existing fallback Gemini) o Gemini direct.
3. NO Together call più, audit log preserva storico per RCA.
4. Code rollback opzionale via revert PR — non necessario se kill switch funziona.

**Test rollback** (incluso acceptance criteria):
- Flip flag false during integration test → assert no Together call attempt
- Flip flag true → assert chain works
- Flip flag false mid-call (race condition) → assert in-flight call completes, next call respects new flag

### 2.8 Decisione D8 — Test strategy 3 layer

**Scelta**: unit + integration + manual canary.

**Layer 1 — Unit tests (`tests/unit/supabase/together-fallback-gate.test.ts`)**:

| ID | Scenario | Assert |
|----|----------|--------|
| G1 | canUseTogether student_runtime | false sempre |
| G2 | canUseTogether teacher_lesson_prep no consent | false |
| G3 | canUseTogether teacher_lesson_prep with consent + anonymized | true |
| G4 | canUseTogether batch_ingest anonymized | true |
| G5 | canUseTogether batch_ingest NOT anonymized | false |
| G6 | canUseTogether emergency_anonymized 0 down | false |
| G7 | canUseTogether emergency_anonymized 1 down | false |
| G8 | canUseTogether emergency_anonymized 2 down + anonymized | true |
| G9 | canUseTogether feature flag false | false sempre |
| G10 | canUseTogether kind unknown | false (fail-safe) |
| G11 | anonymize email IT | redact "marco@test.it" → "[EMAIL_REDACTED]" |
| G12 | anonymize phone IT | redact "+39 333 1234567" → "[PHONE_IT_REDACTED]" |
| G13 | anonymize codice fiscale | redact "RSSMRA85M01H501Z" → "[CF_REDACTED]" |
| G14 | anonymize class_key | redact "class_key=ABCDEF" → "[CLASS_KEY_REDACTED]" |
| G15 | anonymize uuid student_id | redact uuid → "[STUDENT_ID_REDACTED]" |

**Layer 2 — Integration tests (`tests/integration/supabase/together-audit-log.test.ts`)**:

| ID | Scenario | Assert |
|----|----------|--------|
| I1 | Mock Gemini fail + Together success | audit row inserted with status='success' + anonymized_payload |
| I2 | Mock Gemini fail + gate blocked | audit row inserted with status='blocked' + block_reason |
| I3 | Mock RunPod success | NO audit row (Together not called) |
| I4 | Mock all providers fail | audit row inserted with status='failed' |
| I5 | Audit log RLS service-role only | INSERT ok via service-role, SELECT blocked anon |
| I6 | Anonymization diff captured | redactions_applied list contains expected entries |

**Layer 3 — Manual canary (post-merge)**:

- Andrea creates teacher_lesson_prep test fixture con consent_id reale
- Trigger fallback chain con stub RunPod 503 + Gemini 503
- Verify Together call OK + audit row visible Supabase dashboard
- Verify anonymization payload in DB has no PII (manual eyeball + diff)

### 2.9 Decisione D9 — Latency budget + SLO

**Scelta**: chain latency target SLO:

| Metric | Target | Hard Cap |
|--------|--------|----------|
| RunPod call | p50 1.5s, p99 3s | 5s timeout |
| Gemini call | p50 2s, p99 4s | 8s timeout |
| Together call | p50 2.5s, p99 5s | 10s timeout |
| Anonymization | p50 5ms | 50ms |
| Audit insert | fire-and-forget | N/A |
| **Chain worst case (4 attempt)** | <12s | <23s timeout total |
| **User-visible response** | p50 <3s, p99 <8s | <10s show error |

**Rationale**: docente live UX richiede risposta <8s. Se chain richiede più, abort + show offline message immediato. Audit log catches anomaly per debug.

### 2.10 Decisione D10 — Versioning + observability

**Scelta**: 

- `validator_version` field in audit log default `v1.0`. Bump quando logica gate cambia (es. v1.1 = added Hetzner provider).
- Structured log Vercel/Deno con `level` + `event` + correlation ID per trace cross-call:

```ts
console.info(JSON.stringify({
  level: 'info',
  event: 'together_fallback_attempt',
  correlation_id: crypto.randomUUID(),
  request_kind: ctx.kind,
  eu_providers_down: euProvidersDownCount,
  feature_flag: ctx.featureFlag,
  timestamp: new Date().toISOString(),
}));
```

- Dashboard Supabase aggregate query (op-only, no UI Sprint H2):

```sql
SELECT
  request_kind,
  status,
  COUNT(*) AS hits,
  ROUND(AVG(latency_ms)::numeric, 0) AS avg_latency_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms) AS p50_latency,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms) AS p99_latency,
  SUM(cost_usd_estimated) AS total_spend_usd
FROM together_audit_log
WHERE ts > now() - interval '7 days'
GROUP BY request_kind, status
ORDER BY hits DESC;
```

---

## 3. Implementation contract per generator-app-opus

```ts
// File: supabase/functions/_shared/anonymize.ts (NEW)
export function anonymize(messages: ChatMessage[]): {
  redacted: ChatMessage[];
  diff: AnonymizationDiff;
};

// File: supabase/functions/_shared/llm-client.ts (modified)
export interface LLMOptions {
  // ... existing fields ...
  fallback?: FallbackOptions;
}

export type RequestKind =
  | "student_runtime"
  | "teacher_lesson_prep"
  | "batch_ingest"
  | "emergency_anonymized";

export interface FallbackOptions {
  enabled: boolean;
  requestKind: RequestKind;
  consentId?: string;
  sessionId?: string;
  userRole: "student" | "teacher" | "admin" | "system";
}

export function canUseTogether(ctx: CanUseTogetherContext): boolean;

export class AllProvidersFailedError extends Error {
  constructor(public errors: { provider: string; message: string; latencyMs: number }[]);
}

// File: supabase/migrations/YYYYMMDDHHMMSS_together_audit_log.sql (NEW)
// CREATE TABLE + INDEX + RLS as ADR §2.3
```

---

## 4. Acceptance criteria per implementation

Per `generator-app-opus` quando implementa:

- [ ] File creato: `supabase/functions/_shared/anonymize.ts`
- [ ] File modificato: `supabase/functions/_shared/llm-client.ts` con extended signature
- [ ] Migration SQL `together_audit_log` + RLS service-role
- [ ] `canUseTogether(ctx)` predicate puro implementato per ADR §2.2
- [ ] Anonymization regex IT-first per ADR §2.5
- [ ] Audit log fire-and-forget (no await) per ADR §2.4
- [ ] Feature flag `VITE_ENABLE_TOGETHER_FALLBACK` default false
- [ ] Backward compat: `fallback: undefined` = legacy behavior preservato
- [ ] 15 unit test pass (gate logic + anonymization)
- [ ] 6 integration test pass (audit log insert + RLS)
- [ ] Build Deno function passa: `npx supabase functions deploy unlim-chat --dry-run`
- [ ] No regressione test baseline (12532 PASS preservato)
- [ ] Latency unit < 5ms anonymization, < 50ms gate decision
- [ ] Manual canary checklist eseguita Andrea (ADR §2.8 Layer 3)

---

## 5. Trade-off summary onesto

**Pro**:
- Resilience UNLIM chat: 4-livello chain riduce MTTR < 1s in failover EU→EU, < 10s per emergency US
- GDPR compliant: student_runtime mai US, anonymization heuristic + audit log per ROPA
- Cost discipline: budget cap esplicito per use case + monitoring SQL
- Backward compat: chiamanti esistenti zero modifiche
- Auditability: ogni Together call tracciata immutabile per Garante Privacy
- Feature flag rollback < 5min senza redeploy

**Contro / debt**:
- Anonymization regex 5-10% false negative atteso (Italian NER deferred Sprint H2)
- Audit log table cresce nel tempo (cron retention manuale 90gg)
- 4 livelli chain peggior caso 23s timeout total (ma early-abort intermedi tipici <8s)
- Together API US trans richiede DPO Andrea sign-off pre flip prod
- Hetzner Livello 2 stub vuoto fino Sprint H2 (3+ paying schools commit gate)
- Cost throttle quota_daily NON implementato iter 3 (manuale Andrea SQL review)

**Alternative rejected**:
- "Solo Together come primary cost saver" → GDPR violation studenti minori
- "OpenAI fallback aggiuntivo" → key non in budget + ridondanza overkill
- "DPA universale per tutti i docenti pre-onboard" → friction onboarding, defer per opt-in
- "Block ALL Together calls fino DPO + canary" → no fallback batch ingest ⇒ Wiki LLM concept blocco
- "Anonymization ML-based runtime" → latency budget violato + Edge Function size limit

---

## 6. Open questions per Andrea/orchestrator

1. **[ANDREA-DECIDE] DPO sign-off timing**: ADR-010 propone implementare code + flag false default in iter 3, flip true in iter 5+ post-DPO review. Andrea conferma sequence o vuole DPO PRIMA di merge code?

2. **[ANDREA-DECIDE] Retention audit log**: 90gg default proposta. Garante Privacy non specifica per dati minori — può chiedere 30gg o 365gg. Andrea decide.

3. **[ANDREA-DECIDE] Together model selection**: Llama-3.3-70B Turbo proposto (qualità + costo). Alternative: Mixtral 8x7B (cheaper $0.5/M ma quality lower IT). Andrea preferenza?

4. **[ORCHESTRATOR] Migration timing**: applicare migration `together_audit_log` SUBITO iter 3 (anche se code non flippato live)? Mio default: yes, schema apply sicuro + early canary in dev.

5. **[ORCHESTRATOR] Hetzner Livello 2 stub**: includere endpoint placeholder + flag `HETZNER_GPU_URL` env empty default, o skip totalmente fino commit reale? Mio default: stub + flag env empty (zero behavior change ora).

6. **Heuristic anonymization vs spaCy NER**: defer Sprint H2 con server dedicato è proposto. Andrea conferma o vuole NER subito (richiede infra Mac Mini server stand-alone)?

---

## 7. Riferimenti

- **Master plan**: `docs/strategy/2026-04-26-master-plan-v2-comprehensive.md` §4.5 (fallback chain), §11 (cost discipline)
- **PDR Sprint S iter 3**: `docs/pdr/PDR-SPRINT-S-ITER-3-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md` §5 (Together AI fallback)
- **Existing scaffold**: `scripts/together-ai-fallback-wireup.ts` (Sprint S iter 1, Node-style — NOT Deno, design reference only)
- **Existing callLLM**: `supabase/functions/_shared/llm-client.ts` (Sprint Day 01, Together→Gemini auto fallback)
- **Sibling ADR**: ADR-008 buildCapitoloPromptFragment (Sprint S iter 2 module pattern)
- **Sibling ADR**: ADR-009 validatePrincipioZero (Sprint S iter 2 audit log pattern reference for `together_audit_log`)
- **Sibling iter 3**: ADR-011 R5 stress fixture extension (validate fallback con prompts diversificati)
- **GDPR Garante**: Provv. n. 9 del 11/01/2024 — minori online + data minimization
- **PRINCIPIO ZERO**: `CLAUDE.md` apertura (UNLIM mai parla con student direttamente)
