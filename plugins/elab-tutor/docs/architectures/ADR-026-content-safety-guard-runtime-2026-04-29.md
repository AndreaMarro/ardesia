---
id: ADR-026
title: Content Safety Guard runtime — 10 rules pre-emit + post-LLM enforcement Principio Zero V3 + GDPR Art.8 + EU AI Act audit (Sprint T iter 22 mandatory)
status: PROPOSED
date: 2026-04-29
deciders:
  - architect-opus (Sprint T iter 19 caveman mode, ralph loop /caveman dispatch ANDREA-MANDATES-ITER-18-PM-ADDENDUM §3)
  - Andrea Marro (final ratify iter 22 entrance — content safety 10 rules + telemetry alert thresholds approve)
context-tags:
  - sprint-t-iter-22
  - content-safety-guard-runtime
  - 10-rules-pre-emit-post-llm
  - principio-zero-v3-enforcement
  - volgari-blacklist-italian
  - off-topic-redirect
  - linguaggio-appropriato-minori-8-14
  - imperative-rewrite-docente
  - hallucination-detect-vol-pag-verbatim
  - privacy-minori-anonymize
  - gdpr-art-8-parental-consent
  - eu-ai-act-high-risk-education-audit
  - telemetry-block-rate-retry-success
  - alert-block-rate-5-percent
related:
  - CLAUDE.md §0 DUE PAROLE D'ORDINE Principio Zero V3 plurale Ragazzi + Vol/pag canonical + ≤60 parole
  - ADR-009 (Principio Zero validator middleware V3 — base 6 PZ rules iter 2, extension a 10 rules iter 22 questa ADR)
  - ADR-008 (buildCapitoloPromptFragment Vol/pag verbatim citazioni — Vol/pag VERBATIM cross-check Layer 1 RAG)
  - ADR-019 (Sense 1.5 Morfismo runtime docente + classe — linguaggio adattivo per età studenti)
  - ADR-023 (Onniscenza completa 7-layer — Layer 1 RAG cross-check Vol/pag VERBATIM rule 6)
  - ADR-025 (Modalità ELAB 4 simplification — content safety cross-mode INVARIANT)
  - docs/pdr/2026-04-29-sprint-T-iter-18+/ANDREA-MANDATES-ITER-18-PM-ADDENDUM.md §3 (mandate iter 18 PM Andrea verbatim "previeni qualunque messaggio volgare o sbagliato")
input-files:
  - supabase/functions/_shared/principio-zero-validator.ts (ADR-009 iter 2, base 6 PZ rules iter 2, extension a 10 rules questa ADR)
  - supabase/functions/_shared/system-prompt.ts (BASE_PROMPT v3 iter 2, integration safety guard pre-emit)
  - supabase/functions/_shared/llm-client.ts (callLLMWithFallback chain iter 3, integration safety guard post-LLM)
  - supabase/functions/unlim-chat/index.ts (host endpoint, wire-up content safety guard)
  - src/data/rag-chunks.json (1881 chunks, cross-check Vol/pag VERBATIM rule 6)
output-files:
  - docs/architectures/ADR-026-content-safety-guard-runtime-2026-04-29.md (THIS file, NEW)
  - Future iter 22+: supabase/functions/_shared/content-safety-guard.ts (NEW Deno ~150 LOC)
  - Future iter 22+: supabase/migrations/2026-05-XX_safety_guard_audit_log.sql (NEW table EU AI Act audit)
  - Future iter 22+: supabase/migrations/2026-05-XX_volgari_blacklist_italian.sql (NEW table 50+ termini)
  - Future iter 23+: tests/unit/content-safety-guard-10-rules.test.js (NEW unit test 10 rules + telemetry)
  - Future iter 23+: tests/integration/content-safety-guard-e2e.test.js (NEW E2E flow pre-emit + post-LLM)
  - Future iter 24+: scripts/bench/content-safety-guard-regression-suite.mjs (NEW gen-test-opus regression bench)
---

# ADR-026 — Content Safety Guard runtime 10 rules Sprint T iter 22

> Codificare **Content Safety Guard** runtime layer ELAB Tutor: 10 rules pre-emit + post-LLM enforcement (volgari blacklist + off-topic redirect + linguaggio appropriato minori + imperative rewrite + plurale obbligatorio + Vol/pag VERBATIM + hallucination detect + privacy minori anonymize + GDPR Art.8 parental consent + EU AI Act high-risk education audit). Layer NEW `supabase/functions/_shared/content-safety-guard.ts` ~150 LOC Deno integrato `unlim-chat/index.ts` + estensione ADR-009 base 6 PZ rules iter 2 → 10 rules iter 22. Telemetry `safety_guard_fires` + `safety_guard_block_rate` + `safety_guard_retry_success`. Alert if block_rate >5% (suggests prompt engineering issue). Andrea iter 18 PM mandate "previeni qualunque messaggio volgare o sbagliato".

---

## 1. Status

**PROPOSED** — architect-opus iter 19 caveman mode 2026-04-29 propone Content Safety Guard canonical 10-rule architecture per Sprint T iter 22 mandatory. Andrea ratify iter 22 entrance.

Sign-off chain previsto:
- architect-opus iter 19 caveman dispatch ADR-026 PROPOSED 10-rule canonical
- gen-app-opus iter 22 implement `content-safety-guard.ts` ~150 LOC Deno + wire-up `unlim-chat/index.ts`
- gen-test-opus iter 22-23 verify regression suite 10 rules + telemetry block_rate measure live
- Andrea Marro iter 22 ratify post-procurement VPS GPU + safety guard prod activation + alert thresholds

---

## 2. Context

### 2.1 Andrea mandate iter 18 PM verbatim

ANDREA-MANDATES-ITER-18-PM-ADDENDUM §3 codifica mandato Sprint T iter 22:

> "previeni qualunque messaggio volgare o sbagliato"

Razionale Andrea (paraphrase iter 18 PM cumulative messages):
- Target user minori 8-14 anni → linguaggio appropriato MANDATORY (NO volgari, NO complessità lessicale Flesch-Kincaid >8th grade Italian).
- Hallucination Vol/pag = rischio reputazionale + viola Principio Zero V3 (ADR-009 base 6 rules iter 2 insufficient — extension a 10 rules iter 22).
- GDPR Art.8 + EU AI Act high-risk education compliance MANDATORY (audit log every safety guard fire).
- Privacy minori anonymize (NEVER cite student name + class name in response).

### 2.2 Stato attuale Principio Zero validator iter 18 (HEAD `e02eabb`)

Componenti shipped iter 2-12:
- **ADR-009 Principio Zero validator middleware V3** iter 2 base 6 rules:
  1. Plurale "Ragazzi," obbligatorio (instant retry se NOT contain)
  2. ≤60 parole MAX
  3. Vol/pag citation presente (regex `Vol\.\d|pag\.\d`)
  4. NO imperative verso docente ("fai questo / devi fare" → rewrite)
  5. Analogia real-world presente (1 minimum heuristic check)
  6. Sintesi default (NO parafrasi verbose)
- **ADR-008 buildCapitoloPromptFragment** iter 2: Vol/pag VERBATIM injection prompt (BASE_PROMPT v3 system prompt).
- **R5 stress 91.80% PASS** iter 5 P3: 6/6 categories rules (plurale 100% + citation 100% + sintesi 100% + safety 100% + off-topic 100% + deep 90%).

Componenti NON live (gap iter 22 mandatory):
- **Volgari blacklist Italian 50+ termini**: NOT implemented current
- **Off-topic detect** specifico STEM-K12: NOT implemented (R5 generic safety category 100% MA non specifico off-topic redirect)
- **Linguaggio appropriato minori 8-14** Flesch-Kincaid Italian check: NOT implemented
- **Privacy minori anonymize student/class name**: NOT implemented (current responses can echo class_key)
- **GDPR Art.8 parental consent flag check**: NOT implemented (no `parental_consent_flag` column class_memory ADR-023)
- **EU AI Act high-risk education audit log**: NOT implemented (no `safety_guard_audit_log` table)
- **Hallucination detect numerico/factual senza source**: NOT implemented (current relies LLM citation generation)
- **Telemetry safety_guard_fires + block_rate + retry_success**: NOT implemented

### 2.3 Perché ADR adesso (iter 19 caveman)

Tre motivi cogenti:
1. **Sprint T iter 22 mandatory implementation richiede architettura codificata prima di scrivere `content-safety-guard.ts`**: gen-app+gen-test iter 22 partono da spec canonical 10 rules, NO ad-hoc decisioni rule logic.
2. **Andrea mandate explicit iter 18 PM addendum §3**: senza ADR esplicita, scope ambiguo + risk regression Principio Zero V3 (ADR-009 base 6 rules insufficient per minori 8-14).
3. **EU AI Act compliance MANDATORY pre Sprint T iter 25 close**: audit log every safety guard fire = legal requirement education high-risk system.

### 2.4 Rischio non-codifica

Se ADR-026 non shipped iter 19 caveman:
- Implementazione iter 22 rischia divergenza rule logic (chi decide threshold Flesch-Kincaid? Quanti volgari blacklist?)
- Risk regression Principio Zero V3 (sovrapposizione ADR-009 base 6 rules + 10 rules questa ADR senza spec coerente)
- Risk legal exposure GDPR Art.8 + EU AI Act (audit log missing → rischio reputazionale + multa)
- Risk regression R5 91.80% PASS baseline (estensione 6→10 rules può alzare false-positive block_rate >5% = degrada UX)

---

## 3. Decision

**Content Safety Guard runtime = 10 rules pre-emit + post-LLM enforcement integrato `unlim-chat/index.ts` via NEW layer `supabase/functions/_shared/content-safety-guard.ts` ~150 LOC Deno + estensione ADR-009 base 6 rules iter 2 → 10 rules iter 22 + telemetry table `safety_guard_audit_log` + alert thresholds.**

Architettura runtime Edge Function `unlim-chat`:
1. **Pre-emit pass** (input prompt user): rule 2 off-topic detect + rule 9 GDPR Art.8 parental consent flag check (early reject prima di LLM call).
2. **LLM call** (callLLMWithFallback ADR-010 chain RunPod → Gemini → Together gated).
3. **Post-LLM pass** (response LLM): rules 1+3+4+5+6+7+8 enforcement (volgari + linguaggio + imperative rewrite + plurale + Vol/pag VERBATIM + hallucination + privacy anonymize).
4. **Retry chain** (rule violation): retry LLM with stricter prompt (max 2 retry per request).
5. **Audit log** (rule 10 EU AI Act): insert `safety_guard_audit_log` table every fire (rule_id + violation_type + retry_count + final_block).
6. **Telemetry emit** (`safety_guard_fires` counter per rule + `safety_guard_block_rate` ratio + `safety_guard_retry_success` ratio).
7. **Alert** (block_rate >5% threshold): notify dev channel via Slack/Telegram (suggests prompt engineering issue NOT user issue).

Non-goal:
- Rule classifier ML fine-tuned (resta regex + heuristic + Flesch-Kincaid library, NO LLM classifier per rule pre-emit — latency too high)
- Multi-language support (resta Italian primary iter 22-25, EN/ES/FR/DE stub future iter 30+)
- Real-time block override admin UI (resta defer iter 30+ admin panel)

---

## 4. 10 Rules canonical specification

### 4.1 Rule 1 — Volgari blacklist Italian 50+ termini

| Aspetto | Spec |
|---------|------|
| **Trigger** | Post-LLM response contains termini blacklist (regex word boundary case-insensitive) |
| **Source** | Supabase table `volgari_blacklist_italian` 50+ termini (managed via admin migration) |
| **Action** | Instant reject + retry LLM with stricter prompt ("usa linguaggio appropriato per minori 8-14 anni, NO termini volgari") |
| **Max retry** | 2 retry per request, then fallback template "Ehm, riproviamo con altre parole — Ragazzi..." |
| **Severity** | HIGH (legal exposure minori) |
| **Audit log** | `rule_id=1` + `termine_matched` + `retry_count` |

### 4.2 Rule 2 — Off-topic detect STEM-K12 redirect

| Aspetto | Spec |
|---------|------|
| **Trigger** | Pre-emit input prompt user → keyword match domini NON-STEM-K12 (es. politica, religione, sport, gossip, finanza adulta) |
| **Source** | Heuristic regex + class_memory.capitolo_corrente context (STEM-K12 = elettronica + Arduino + matematica base + scienze 8-14 anni) |
| **Action** | Redirect polite "Ragazzi, restiamo su elettronica e il vostro kit ELAB — facciamo questo: [suggest next variazione capitolo_corrente]" |
| **Max retry** | 0 (early reject pre-LLM, NO retry) |
| **Severity** | LOW (UX redirect, NO legal exposure) |
| **Audit log** | `rule_id=2` + `intent_off_topic_detected` + `redirect_suggestion` |

### 4.3 Rule 3 — Linguaggio appropriato minori 8-14 (Flesch-Kincaid Italian)

| Aspetto | Spec |
|---------|------|
| **Trigger** | Post-LLM response Flesch-Kincaid Italian score >8th grade (complessità lessicale eccessiva minori) |
| **Source** | Library `flesch-kincaid-italian` Deno port (Vacca-Franchina formula Italian) — NEW dependency iter 22 |
| **Action** | Retry LLM with stricter prompt "usa linguaggio per minori 8-14 anni, frasi brevi, parole semplici" |
| **Max retry** | 2 retry per request, then fallback simplification template |
| **Severity** | MEDIUM (UX degrada comprensione classe) |
| **Audit log** | `rule_id=3` + `flesch_kincaid_score` + `retry_count` |

### 4.4 Rule 4 — Imperative rewrite verso docente

| Aspetto | Spec |
|---------|------|
| **Trigger** | Post-LLM response contains imperative verso docente ("fai questo", "devi fare", "tu ora", "usa il...", regex check) |
| **Source** | Regex pattern `(fai|devi fare|tu ora|usa il|prendi il)` + Principio Zero V3 INVARIANT (docente è tramite, NON imperative target) |
| **Action** | Auto-rewrite "ai ragazzi vediamo / ragazzi proviamo / chiediamo ai ragazzi di..." (LLM rewrite call con prompt specifico) |
| **Max retry** | 1 retry (LLM rewrite), then fallback template |
| **Severity** | HIGH (viola Principio Zero V3 ADR-009) |
| **Audit log** | `rule_id=4` + `imperative_phrase_matched` + `rewrite_success` |

### 4.5 Rule 5 — Plurale "Ragazzi" obbligatorio

| Aspetto | Spec |
|---------|------|
| **Trigger** | Post-LLM response NOT contains "Ragazzi," (case-sensitive virgola obbligatoria) |
| **Source** | ADR-009 base 6 rules iter 2 rule 1 (R5 91.80% PASS plurale 100% baseline) |
| **Action** | Instant retry LLM with prompt "DEVI iniziare con 'Ragazzi,' plurale obbligatorio Italian scuola pubblica registro" |
| **Max retry** | 2 retry per request, then fallback prefix injection "Ragazzi, " + LLM response |
| **Severity** | HIGH (viola Principio Zero V3 INVARIANT cross-mode ADR-025) |
| **Audit log** | `rule_id=5` + `plurale_missing` + `prefix_injection_used` |

### 4.6 Rule 6 — Vol/pag VERBATIM cross-check Layer 1 RAG

| Aspetto | Spec |
|---------|------|
| **Trigger** | Post-LLM response claims `Vol.X pag.Y` (regex match) MUST cross-check Layer 1 RAG chunk source `volume_id=X AND page_number=Y` exists (canonical citation INVARIANT ADR-008) |
| **Source** | ADR-023 Layer 1 RAG `rag_chunks` Supabase pgvector + `volume_references.js` 92/92 enriched bookText volumi |
| **Action** | If no match → instant block + retry LLM with prompt "DEVI citare SOLO Vol/pag esistenti reali nei volumi cartacei, NO hallucination" |
| **Max retry** | 2 retry per request, then fallback response "Ragazzi, qui dobbiamo controllare il volume per essere sicuri" + omit specific Vol/pag |
| **Severity** | CRITICAL (viola Principio Zero V3 + Morfismo Sense 2 triplet coerenza esterna) |
| **Audit log** | `rule_id=6` + `vol_pag_claimed` + `match_rag_found` + `retry_count` |

### 4.7 Rule 7 — Hallucination detect numerico/factual senza source

| Aspetto | Spec |
|---------|------|
| **Trigger** | Post-LLM response contains claim numerico (es. "tensione 5V", "resistenza 220Ω", "frequenza 16MHz") OR factual (es. "Arduino Nano R4 ha 30 pin") senza Vol/pag citation source nearby (regex 100 char window) |
| **Source** | Heuristic regex numerico + factual pattern + Layer 1 RAG cross-check chunk source |
| **Action** | Block + retry LLM with prompt "se citi numeri o fatti tecnici, DEVI riferire Vol/pag specifico fonte" |
| **Max retry** | 2 retry per request, then fallback omit numerico/factual claim |
| **Severity** | HIGH (rischio reputazionale + viola Sense 2 triplet coerenza) |
| **Audit log** | `rule_id=7` + `claim_unsourced` + `retry_count` |

### 4.8 Rule 8 — Privacy minori anonymize student/class name

| Aspetto | Spec |
|---------|------|
| **Trigger** | Post-LLM response contains student name (Layer 4 student_memory.nome) OR class name (Layer 4 class_memory.classe_nome) |
| **Source** | Cross-check Layer 4 ADR-023 + GDPR Art.8 minori 8-14 INVARIANT |
| **Action** | Auto-anonymize replace student name → "uno di voi" + class name → "la classe" (regex + replace) |
| **Max retry** | 0 (deterministic replace, NO LLM retry) |
| **Severity** | CRITICAL (viola GDPR Art.8 minori + legal exposure) |
| **Audit log** | `rule_id=8` + `pii_replaced_count` + `pii_types` |

### 4.9 Rule 9 — GDPR Art.8 parental consent flag check

| Aspetto | Spec |
|---------|------|
| **Trigger** | Pre-emit input prompt user → check Layer 4 `class_memory.parental_consent_flag` (NEW column iter 22 migration) |
| **Source** | Supabase `class_memory.parental_consent_flag` BOOLEAN DEFAULT FALSE + admin UI toggle (docente confirm consent) |
| **Action** | If FALSE → block personalization (NO student-specific Layer 4 retrieval) + response generic mode "Ragazzi, lavoriamo insieme su..." (NO student name) |
| **Max retry** | 0 (deterministic block, NO LLM retry) |
| **Severity** | CRITICAL (viola GDPR Art.8 minori 8-14 + legal exposure) |
| **Audit log** | `rule_id=9` + `consent_flag_status` + `personalization_blocked` |

### 4.10 Rule 10 — EU AI Act high-risk education audit log

| Aspetto | Spec |
|---------|------|
| **Trigger** | Every safety guard fire (rules 1-9) → insert audit log Supabase table `safety_guard_audit_log` |
| **Source** | EU AI Act 2024 High-Risk Education AI System compliance MANDATORY (Annex III §3) |
| **Action** | Insert row table `safety_guard_audit_log(audit_id, ts, rule_id, classe_key_anonymized, prompt_hash, response_hash, violation_type, retry_count, final_block, telemetry_metadata)` |
| **Max retry** | N/A (audit log fire-and-forget, NO blocking) |
| **Severity** | CRITICAL (legal compliance EU AI Act) |
| **Audit log** | `rule_id=10` (meta-rule, audit log itself) |

---

## 5. Architecture content-safety-guard.ts

NEW file `supabase/functions/_shared/content-safety-guard.ts` ~150 LOC Deno.

### 5.1 Module signature

```typescript
import { runRule1Volgari, runRule2OffTopic, runRule3FleschKincaid,
         runRule4Imperative, runRule5Plurale, runRule6VolPagVerbatim,
         runRule7Hallucination, runRule8PrivacyAnonymize,
         runRule9GdprConsent, runRule10AuditLog } from './rules/index.ts'

export interface SafetyGuardInput {
  prompt: string
  response?: string  // post-LLM only
  classeKey: string
  capitoloCorrente: string
  layerData: { rag, wiki, glossario, session, vision, llm, on_the_fly }
  pass: 'pre-emit' | 'post-llm'
}

export interface SafetyGuardOutput {
  passed: boolean
  blocked: boolean
  rules_fired: number[]
  rules_passed: number[]
  retry_recommended: boolean
  retry_prompt_addendum?: string
  fallback_response?: string
  audit_log_entries: AuditLogEntry[]
  telemetry: { fires: number, block: boolean, retry_count: number }
}

export async function runContentSafetyGuard(input: SafetyGuardInput): Promise<SafetyGuardOutput> {
  // dispatch rules sequential (rule order matters: 9 GDPR consent BLOCKS first if false)
  // collect fire results + audit log entries
  // emit telemetry
  // return aggregate
}
```

### 5.2 Rule dispatch order

Order matters (early reject preserves latency):
1. **Rule 9 GDPR consent** (pre-emit, blocks all if false)
2. **Rule 2 Off-topic** (pre-emit, blocks STEM-K12 violation)
3. → LLM call (callLLMWithFallback ADR-010 chain)
4. **Rule 1 Volgari** (post-LLM, instant block + retry)
5. **Rule 5 Plurale** (post-LLM, retry + fallback prefix injection)
6. **Rule 4 Imperative rewrite** (post-LLM, LLM rewrite retry)
7. **Rule 6 Vol/pag VERBATIM** (post-LLM, cross-check Layer 1 RAG block)
8. **Rule 7 Hallucination** (post-LLM, numerico/factual unsourced block)
9. **Rule 3 Flesch-Kincaid** (post-LLM, complessità eccessiva retry)
10. **Rule 8 Privacy anonymize** (post-LLM, deterministic replace)
11. **Rule 10 Audit log** (post-pass, fire-and-forget audit insert)

### 5.3 Wire-up `unlim-chat/index.ts`

Diff iter 22:
```typescript
// PRE-EMIT pass
const safetyPre = await runContentSafetyGuard({ prompt, classeKey, capitoloCorrente, layerData, pass: 'pre-emit' })
if (safetyPre.blocked) {
  return new Response(safetyPre.fallback_response, { status: 200 })
}

// LLM call (existing iter 3 callLLMWithFallback)
let response = await callLLMWithFallback(...)

// POST-LLM pass (with retry chain)
let retryCount = 0
while (retryCount < 2) {
  const safetyPost = await runContentSafetyGuard({ prompt, response, classeKey, capitoloCorrente, layerData, pass: 'post-llm' })
  if (safetyPost.passed) break
  if (safetyPost.retry_recommended) {
    response = await callLLMWithFallback({ ...input, promptAddendum: safetyPost.retry_prompt_addendum })
    retryCount++
  } else {
    response = safetyPost.fallback_response || response
    break
  }
}

return new Response(response, { status: 200 })
```

---

## 6. Telemetry + alert thresholds

### 6.1 Counters

- `safety_guard_fires_total` (counter per rule_id 1-10)
- `safety_guard_block_rate` (ratio: blocked_requests / total_requests, sliding window 1h)
- `safety_guard_retry_success_rate` (ratio: requests_passed_after_retry / requests_with_retry, sliding window 1h)
- `safety_guard_latency_ms_p50_p95` (histogram, p50 target <200ms p95 <500ms)

### 6.2 Alert thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| `block_rate` | >3% | >5% | Notify dev channel Slack/Telegram (suggests prompt engineering issue) |
| `retry_success_rate` | <70% | <50% | Notify dev channel (LLM provider degrade?) |
| `latency_p95_ms` | >500ms | >1500ms | Notify dev channel (regex perf issue?) |
| `rule_6_vol_pag_fires/h` | >50 | >200 | Notify dev channel (Vol/pag hallucination spike) |
| `rule_9_gdpr_blocks/h` | N/A | >0 | Notify legal (parental consent missing class) |

### 6.3 Dashboard

Grafana dashboard NEW iter 23 `safety-guard-dashboard.json`:
- Panel 1: fires per rule (timeseries last 24h)
- Panel 2: block_rate sliding window
- Panel 3: retry_success_rate sliding window
- Panel 4: latency histogram p50/p95/p99
- Panel 5: top 10 prompts che hanno fatto fire rule 6 (debugging hallucination)

---

## 7. Postgres schema migration iter 22+

### 7.1 `safety_guard_audit_log` (iter 22+ EU AI Act compliance)

```sql
CREATE TABLE safety_guard_audit_log (
  audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ts TIMESTAMPTZ DEFAULT NOW(),
  rule_id INT NOT NULL CHECK (rule_id BETWEEN 1 AND 10),
  classe_key_anonymized TEXT,  -- SHA-256 hash classe_key (privacy-preserving)
  prompt_hash TEXT,  -- SHA-256 hash prompt (privacy-preserving)
  response_hash TEXT,  -- SHA-256 hash response (privacy-preserving)
  violation_type TEXT,  -- es. 'volgare_matched', 'plurale_missing', 'vol_pag_unmatched'
  retry_count INT DEFAULT 0,
  final_block BOOLEAN DEFAULT FALSE,
  telemetry_metadata JSONB DEFAULT '{}'::jsonb
);
CREATE INDEX idx_safety_audit_ts ON safety_guard_audit_log(ts DESC);
CREATE INDEX idx_safety_audit_rule_id ON safety_guard_audit_log(rule_id);
CREATE INDEX idx_safety_audit_classe ON safety_guard_audit_log(classe_key_anonymized);
ALTER TABLE safety_guard_audit_log ENABLE ROW LEVEL SECURITY;
```

RLS policy: `current_setting('role')='admin'` only (audit data sensitive).

### 7.2 `volgari_blacklist_italian` (iter 22+ rule 1 source)

```sql
CREATE TABLE volgari_blacklist_italian (
  termine TEXT PRIMARY KEY,
  severity TEXT DEFAULT 'high',  -- 'high'|'medium'|'low'
  added_ts TIMESTAMPTZ DEFAULT NOW(),
  added_by TEXT DEFAULT 'admin'
);
-- Seed 50+ termini iter 22 admin migration data file
INSERT INTO volgari_blacklist_italian (termine) VALUES
  ('cazzo'), ('merda'), ('stronzo'), ...; -- 50+ termini full list iter 22 seed file
```

### 7.3 Estensione `class_memory` rule 9 (iter 22+ GDPR Art.8)

```sql
ALTER TABLE class_memory
  ADD COLUMN parental_consent_flag BOOLEAN DEFAULT FALSE,
  ADD COLUMN parental_consent_ts TIMESTAMPTZ,
  ADD COLUMN parental_consent_signer TEXT;  -- docente nome che ha confermato
```

---

## 8. Test plan + regression suite gen-test-opus

### 8.1 Unit test (`tests/unit/content-safety-guard-10-rules.test.js`)

- Test ogni rule 1-10 isolato (regex match + edge cases)
- Test rule order dispatch (rule 9 GDPR FIRST, rule 10 audit LAST)
- Test telemetry counter increment per rule fire
- Test fallback templates (rule 1 + rule 5 + rule 6 + rule 7)
- Test edge cases (response empty, response very long, rule 6 multi Vol/pag claims)
- Target: 50+ test PASS

### 8.2 Integration test (`tests/integration/content-safety-guard-e2e.test.js`)

- E2E flow pre-emit + post-LLM with mock LLM responses
- Test retry chain (max 2 retry → fallback)
- Test audit log insertion Supabase test instance
- Test GDPR consent flag false → block personalization
- Target: 20+ test PASS

### 8.3 Regression suite bench (`scripts/bench/content-safety-guard-regression-suite.mjs`)

- Suite NEW iter 24 — 100 prompt fixtures (50 expected pass + 30 expected block + 20 expected retry-then-pass)
- Fixture categories: volgari (10) + off-topic (10) + linguaggio complesso (10) + imperative (10) + plurale missing (10) + Vol/pag fake (10) + hallucination numerica (10) + privacy student name (10) + GDPR consent false (10) + audit verification (10)
- Live run Edge Function + measure block_rate + retry_success_rate
- Target Sprint T iter 25 close: block_rate <3% + retry_success_rate >80% + audit log 100% fires

### 8.4 R5 91.80% baseline preserved

ADR-026 estensione 6→10 rules MUST NOT regress R5 91.80% PASS baseline iter 5 P3.
- Pre-iter-22: misurare R5 baseline → target 91.80% PASS
- Post-iter-22 deploy ADR-026: re-misurare R5 → target ≥91.80% PASS (no regression)
- Se R5 <91.80% → revert ADR-026 + tune false-positive thresholds rule 3+4+7

---

## 9. Cross-reference

### 9.1 ADR-009 Principio Zero validator middleware V3

Estensione ADR-009 base 6 rules iter 2 → 10 rules iter 22 (questa ADR-026):
- ADR-009 rule 1 plurale → ADR-026 rule 5 (mantenuto + retry chain estesa)
- ADR-009 rule 2 ≤60 parole → mantenuto invariato (NO numero rule ADR-026, costante BASE_PROMPT)
- ADR-009 rule 3 Vol/pag presente → ADR-026 rule 6 estesa (cross-check Layer 1 RAG VERBATIM, NON solo regex presence)
- ADR-009 rule 4 imperative → ADR-026 rule 4 (mantenuto + LLM rewrite retry)
- ADR-009 rule 5 analogia → mantenuto invariato (NO numero ADR-026, BASE_PROMPT system instruction)
- ADR-009 rule 6 sintesi → mantenuto invariato (NO numero ADR-026, BASE_PROMPT system instruction)
- ADR-026 rule 1 volgari + 2 off-topic + 3 Flesch-Kincaid + 7 hallucination + 8 privacy + 9 GDPR + 10 audit = 7 rules NEW iter 22

### 9.2 ADR-008 buildCapitoloPromptFragment Vol/pag VERBATIM

Rule 6 Vol/pag VERBATIM cross-check Layer 1 RAG depende ADR-008 buildCapitoloPromptFragment iter 2 (BASE_PROMPT v3 inject Vol/pag verbatim from `volume_references.js` 92/92 enriched). Cross-check post-LLM verifica response claims match Vol/pag iniettati pre-LLM (closed loop validation).

### 9.3 ADR-019 Sense 1.5 Morfismo runtime + ADR-023 Layer 4

Rule 3 Flesch-Kincaid threshold + rule 8 privacy anonymize + rule 9 GDPR consent dipendono Layer 4 ADR-023 (class_memory.eta_studenti + class_memory.parental_consent_flag + student_memory.nome).

Morfismo runtime tuning: rule 3 threshold adattivo per età (8 anni → grade 4 max, 14 anni → grade 8 max).

### 9.4 ADR-025 Modalità 4 simplification

Content safety guard cross-mode INVARIANT (Percorso + Passo-Passo + Già Montato + Libero). Rule enforcement identico ogni mode (Principio Zero V3 INVARIANT cross-mode ADR-025 §6.1).

### 9.5 ADR-023 Onniscenza completa 7-layer

Rule 6 Vol/pag VERBATIM cross-check Layer 1 RAG (`fetchRAG` retriever ADR-015). Rule 9 GDPR consent Layer 4 (class_memory). Rule 10 audit log telemetry parallel layer-by-layer ADR-023 §5.3.

### 9.6 CLAUDE.md DUE PAROLE D'ORDINE

Principio Zero V3 plurale "Ragazzi" + Vol/pag canonical + ≤60 parole = rule 5 + rule 6 + rule 4 (questa ADR). Morfismo Sense 2 triplet coerenza esterna = rule 6 cross-check Vol/pag VERBATIM (citation MUST match volumi cartacei reali).

---

## 10. Failure modes + graceful degradation

| Failure | Comportamento | Recovery |
|---------|---------------|----------|
| Rule 1 volgari blacklist DB down | Fallback regex hardcoded 20 termini core (commit-time embedded) | Migration apply post-recovery |
| Rule 3 Flesch-Kincaid library exception | Skip rule 3 + log warning (NO block) | Fix library import iter 23 |
| Rule 6 Layer 1 RAG cross-check timeout >2s | Skip rule 6 + log warning (NO block, soft degradation) | Optimize pgvector query iter 23 |
| Rule 9 GDPR consent column missing migration | Default FALSE (block personalization) + alert critical | Apply migration iter 22 ratify |
| Rule 10 audit log insert fail | Fire-and-forget retry async + log error (NO block response) | Investigate Supabase Edge Function db conn iter 23 |
| `content-safety-guard.ts` itself exception | Defensive: skip safety pass + log critical + emit telemetry `safety_guard_skipped=1` (response goes through unprotected) | Investigate immediately + rollback if persistent |

**Test plan failure modes iter 24**: chaos engineering script `scripts/chaos/safety-guard-fail.mjs` simula rule 1+3+6+10 layer down + verifica response non-blocking + audit log fail-safe.

---

## 11. Andrea ratify queue iter 22 entrance

Andrea ratify queue iter 22 (~10 min decision):

1. **Content safety guard 10 rules Y/N** (this ADR §3 decision)
2. **Telemetry alert thresholds Y/N** (this ADR §6.2 decision — block_rate >5% critical?)
3. **Apply 3 migrations Postgres Supabase Y/N** (this ADR §7 — `safety_guard_audit_log` + `volgari_blacklist_italian` + `class_memory` extension)
4. **Volgari blacklist 50+ termini seed list review Y/N** (Andrea co-review iter 22 seed migration data file)
5. **GDPR Art.8 parental consent UI flow Y/N** (admin UI docente confirm consent — defer iter 23 P1 implementation)

Cross-ref ANDREA-MANDATES-ITER-18-PM-ADDENDUM §6 voci 5 ratify queue iter 22.

---

## 12. Activation iter 22 (final)

Andrea iter 22 entrance ratify (~10 min):
1. Approve ADR-026 status PROPOSED → ACCEPTED via comment commit message.
2. Apply 3 migrations Postgres Supabase (`supabase db push --linked`).
3. Provision env vars: nessuno NEW (riutilizza SUPABASE_SERVICE_ROLE_KEY + LLM env iter 3).
4. Approve gen-app-opus iter 22 ATOM-S22-A6 spawn (`content-safety-guard.ts` impl + wire-up `unlim-chat/index.ts`).
5. Approve gen-test-opus iter 22 ATOM-S22-A7 spawn (regression suite 10 rules + R5 baseline preserved verify).

**Iter 22 score target**: Content Safety Box NEW = 0.5 (parziale, full coverage iter 25 close post regression suite live + 30-day audit log review).

**Sprint T iter 25 close target ONESTO**: 9.95/10 (Content Safety Box 1.0 + Onniscenza Box 1.0 ADR-023 + Onnipotenza Box 1.0 ADR-024 + Modalità Box 1.0 ADR-025 + Volumi Narrative Box 1.0 ADR-027).

**End ADR-026**.
