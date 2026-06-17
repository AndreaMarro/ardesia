---
id: ADR-009
title: validatePrincipioZero — middleware post-LLM per UNLIM (Sprint R1)
status: proposed
date: 2026-04-26
deciders:
  - architect-opus (Sprint S iter 2 ralph loop)
  - Andrea Marro (final approver per severity-gate behavior)
context-tags:
  - sprint-s-iter-2
  - principio-zero
  - validation-middleware
  - unlim-quality
  - edge-function-unlim-chat
  - audit-log
related:
  - ADR-008 (buildCapitoloPromptFragment) — sibling, stesso PR Sprint R1
  - docs/strategy/2026-04-26-master-plan-v2-comprehensive.md §4.3 (validator middleware)
  - scripts/openclaw/pz-v3-validator.ts (esistente, OpenClaw Sett-5 — design reference, NON dependency)
  - scripts/bench/score-unlim-quality.mjs (12 RULES bench — fonte regole)
  - automa/team-state/messages/architect-opus-to-orchestrator-*.md (output)
input-files:
  - scripts/bench/score-unlim-quality.mjs (~306 LOC, 12 RULES)
  - scripts/openclaw/pz-v3-validator.ts (~120+ LOC, IT/EN/ES/FR/DE locale rules)
  - supabase/functions/unlim-chat/index.ts (call site post-LLM)
  - supabase/functions/_shared/types.ts (StudentContext interface)
output-files:
  - supabase/functions/_shared/principio-zero-validator.ts (NEW — generator-app-opus)
  - supabase/functions/unlim-chat/index.ts (modified — wrap response with validator)
  - supabase/migrations/YYYYMMDDHHMMSS_unlim_pz_violations.sql (NEW se D3 = nuova tabella)
---

# ADR-009 — `validatePrincipioZero` middleware post-LLM

> Iniettare un validator middleware **fra la risposta LLM e il return al client** in `unlim-chat`, per enforcement runtime (subset) delle 12 rule di PRINCIPIO ZERO definite in `scripts/bench/score-unlim-quality.mjs`. Comportamento: log violations + (opzionale) gate critical.

---

## 1. Contesto operativo

### 1.1 Stato attuale

In produzione (`supabase/functions/unlim-chat/index.ts`), la response del LLM viene tornata al client **as-is**, senza nessun controllo PRINCIPIO ZERO. La validazione esiste solo:
- **A bench time** in `scripts/bench/score-unlim-quality.mjs` (Sprint R0 deliverable, sesta esecuzione manuale)
- **Per OpenClaw speakTTS** in `scripts/openclaw/pz-v3-validator.ts` (Sett-5 branch, NON in produzione, NON wired in chat)

Risultato: studenti possono ricevere risposte con preamboli chatbot ("Sono UNLIM, posso aiutarti?"), imperativi al docente ("Distribuisci ai ragazzi"), risposte fuori budget 60 parole, citazioni copiate verbatim 3+ frasi. Nessuna telemetria su quanto frequentemente succede.

### 1.2 Le 12 rule disponibili (fonte: `score-unlim-quality.mjs:24-160`)

| ID | Rule | Severity | Weight | Tipo check |
|----|------|----------|--------|------------|
| R1 | `plurale_ragazzi` | HIGH | 1.0 | Regex positiva (Ragazzi/vediamo/...) |
| R2 | `no_imperativo_docente` | **CRITICAL** | 1.0 | Regex anti-pattern (Distribuisci/Spiega ai ragazzi/...) |
| R3 | `max_words` | HIGH | 0.7 | Word count ≤ 60 (escludendo `[AZIONE:...]`) |
| R4 | `citation_vol_pag` | MEDIUM | 1.0 | `/Vol\.\s*[1-3]\s*pag\.\s*\d+/i` (requireWhenFlag) |
| R5 | `analogia` | MEDIUM | 0.6 | Keyword pattern (porta/strada/tubo/squadra/...) (requireWhenFlag) |
| R6 | `no_verbatim_3plus_frasi` | HIGH | 0.7 | Detect `«...»` blocks 3+ frasi |
| R7 | `linguaggio_bambino` | LOW | 0.5 | Anti-pattern academic (estrapolare/coefficiente/asintot/...) |
| R8 | `action_tags_when_expected` | HIGH | 0.8 | Fixture-driven (require `[AZIONE:...]` se expected) |
| R9 | `synthesis_not_verbatim` | **CRITICAL** | 1.0 | RAG overlap % (measured-live-only) |
| R10 | `off_topic_recognition` | HIGH | 1.0 | Fixture-driven (scenario === 'off-topic') |
| R11 | `humble_admission` | MEDIUM | 0.5 | Heuristica deep-question (humble pattern OR len > 100) |
| R12 | `no_chatbot_preamble` | HIGH | 0.6 | Anti-pattern preamble (Ciao/Sono UNLIM/Posso aiutarti...) |

### 1.3 Risorse esistenti riutilizzabili

- `scripts/openclaw/pz-v3-validator.ts` ha già implementato R1, R2 (con varianti locale), R3 (max_words=80), R4 (concept-triggered citation). **Design ideas riusabili senza dependency**: pattern multilingue, sistema `LocaleRules`, return shape `{valid, reason, suggestions, locale, wordCount}`.

- `together_audit_log` table (Sprint S iter 1, scaffold in `scripts/together-ai-fallback-wireup.ts`) — schema noto: `(id, ts, request_hash, model, latency_ms, gate_reason, blocked)`.

---

## 2. Decisioni

### 2.1 Decisione D1 — Subset di rule a runtime: 6 su 12

**Scelta**: a runtime applichiamo solo 6 rule, le restanti 6 restano bench-only.

**Runtime (≤50ms budget totale)**:
| Rule | Ragione runtime |
|------|-----------------|
| R2 `no_imperativo_docente` | CRITICAL, regex barata, <2ms |
| R3 `max_words` | HIGH, word count, <1ms |
| R6 `no_verbatim_3plus_frasi` | HIGH, regex su `«...»` blocks, <3ms |
| R7 `linguaggio_bambino` | LOW ma utile (anti-academic), <2ms |
| R12 `no_chatbot_preamble` | HIGH, regex anchor inizio risposta, <1ms |
| R1 `plurale_ragazzi` | HIGH, regex barata, <2ms |

**Bench-only (skip runtime)**:
| Rule | Ragione skip |
|------|--------------|
| R4 `citation_vol_pag` | requireWhenFlag — runtime non sa se la domanda voleva citazione esplicita. Falso positivo alto. |
| R5 `analogia` | requireWhenFlag — stessa ragione + analogie variano nel tempo, hardcoded keyword set diventa stale |
| R8 `action_tags_when_expected` | Fixture-driven — runtime non sa l'expected outcome |
| R9 `synthesis_not_verbatim` | Costoso (richiede RAG corpus + similarity computation, ~200-500ms) — viola budget 50ms |
| R10 `off_topic_recognition` | Fixture-driven — runtime non sa se la domanda era off-topic |
| R11 `humble_admission` | Fixture-driven (scenario `deep-question`) — runtime non classifica intent |

**Razionale**: il principio è "regola corre runtime se: (a) check è cheap, (b) verdict deterministico senza fixture, (c) violazione è actionable (loggable o gateable)". Le requireWhenFlag e fixture-driven non hanno informazione runtime sufficiente — applicarle senza il flag = false positive flood.

**Downside onesto**: R9 (synthesis) è CRITICAL per Andrea ("non copia incollare libro") e però lo skippiamo runtime. Mitigazione partial: R6 (no verbatim 3+ frasi quoted) prende il caso peggiore (block letterale citato). R9 full coverage rimane bench R5 stress test.

### 2.2 Decisione D2 — Severity gate: append warning + log, NON re-call LLM

**Scelta**: per **TUTTE** le rule a runtime, comportamento default = log audit + return response inalterata. **Nessuna re-call LLM**, **nessun blocco** della risposta.

Eccezione opzionale via env flag: `ELAB_PZ_GATE_CRITICAL=true` abilita gate per R2 only (CRITICAL + alto signal-to-noise). Comportamento gate: response sostituita da fallback message hardcoded `"Un attimo, lasciami riformulare. Ragazzi, vediamo insieme."` + tag `[AZIONE:none]` + audit log con severity=BLOCKED. NON re-chiamare LLM (spreco di costo + rischio loop).

**Alternative considerate**:

| Strategia | Pro | Contro | Decisione |
|-----------|-----|--------|-----------|
| Re-call LLM su CRITICAL fail | Risposta corretta | +800-2000ms latenza, +costo, potenziale loop | Scartato |
| Block + fallback message generico | Veloce, costo zero | UX scadente (utente vede fallback bizzarro), perdi info utile della response | Default OFF, opt-in via flag |
| **Log only + return inalterata (SCELTO default)** | Zero impatto UX, telemetria piena | Violazioni passano in produzione | **DEFAULT** |
| Log + post-process fix (es. truncate a 60 parole automatico) | Ibrido | Comportamento sorprendente per utente, debugging difficile | Scartato |

**Razionale UX**: ELAB è in early production con docenti reali. Bloccare risposte (anche con fallback) = brutta esperienza visibile. Telemetria onesta su 1-2 settimane → decisione informata se accendere gate. Andrea può flippare la flag in qualunque momento senza redeploy (env var Vercel).

**[ANDREA-DECIDE]**: vuoi gate ON di default per R2 (CRITICAL imperativo docente) anche prima della telemetria? Il rischio downside è sostituire 5-10% di risposte con fallback generico. Mio default: OFF + telemetria 2 settimane → review. Se Andrea preferisce safety-first → ON.

### 2.3 Decisione D3 — Audit log: nuova tabella `unlim_pz_violations`, NON riuso `together_audit_log`

**Scelta**: nuova tabella Supabase `unlim_pz_violations` con schema dedicato.

Schema proposto (migration SQL incluso in PR generator-app-opus):

```sql
CREATE TABLE IF NOT EXISTS unlim_pz_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id TEXT,                    -- studentContext session if any
  experiment_id TEXT,                 -- safeExperimentId from chat call
  model TEXT NOT NULL,                -- gemini-2.5-flash | together-llama | brain
  user_message_hash TEXT NOT NULL,    -- sha256 first 16 char (no PII)
  response_word_count INT NOT NULL,
  response_excerpt TEXT,              -- first 200 char (NO full PII risk)
  violations JSONB NOT NULL,          -- [{rule, severity, snippet?}]
  gated BOOLEAN NOT NULL DEFAULT false, -- true se gate ha sostituito response
  gate_fallback_used TEXT,            -- nullable
  validator_version TEXT NOT NULL DEFAULT 'v1.0'
);

CREATE INDEX idx_unlim_pz_ts ON unlim_pz_violations (ts DESC);
CREATE INDEX idx_unlim_pz_severity ON unlim_pz_violations USING GIN (violations);
```

**Alternative considerate**:

| Approccio | Pro | Contro | Decisione |
|-----------|-----|--------|-----------|
| Riusare `together_audit_log` | Una tabella sola | Schema mismatch (audit Together = gate-block focused, qui = quality violations) → confonde semantic | Scartato |
| Nuova tabella dedicata `unlim_pz_violations` | Schema purpose-fit, indici dedicati, query semplice | +1 tabella manutenzione | **SCELTO** |
| Solo log su `console.warn` (no DB) | Zero deploy, zero costo storage | Niente analytics, niente trend, niente alert | Scartato |
| PostHog event ingest | Bel dashboard out-of-the-box | Dependency esterna, latenza extra, GDPR doppio gate | Scartato per ora |

**Razionale GDPR**: response_excerpt è 200 char dell'OUTPUT UNLIM (non input studente) — basso rischio PII. user_message_hash è SHA-256 (non reversibile). Studenti minori 8-14 anni: NO `student_name`, NO `class_id`, NO IP. Compliance OK con data minimization principle.

**Retention**: TTL 90 giorni via cron (per ora manuale, automation futura). Per analytics aggregati basta conservare counts.

### 2.4 Decisione D4 — Performance budget e per-rule timing

**Scelta**: budget totale **<50ms** (target <20ms p95) per validazione. Misurato ed enforced via wrapper time.

Per-rule budget stimato (tutte regex su string ≤2000 char):

| Rule | Budget | Note |
|------|--------|------|
| R1 plurale_ragazzi | <2ms | Regex `\b(ragazzi|...)/i` semplice |
| R2 no_imperativo_docente | <2ms | Regex con `.*` controllata |
| R3 max_words | <1ms | Split + filter |
| R6 no_verbatim_3plus_frasi | <3ms | Match `«...»` block + split sentences (peggiore con quote multiple) |
| R7 linguaggio_bambino | <2ms | Regex anchor academic terms |
| R12 no_chatbot_preamble | <1ms | Regex anchor `^...` |
| **Total** | **<11ms typical** | DB write async (no blocking) |

Hot-path skipping: se response ≤ 10 parole ("ok", "Sì ragazzi!"), skippa R6 (no quote possible) e R7 (no academic word possible) — save 5ms.

DB write fire-and-forget: `supabase.from('unlim_pz_violations').insert(...).then()` non awaited → non blocca return chat.

**Downside onesto**: fire-and-forget significa che se DB write fallisce, log perso silenziosamente. Mitigazione: 1 retry con timeout 200ms, poi `console.error` con payload completo (Vercel logs catch).

### 2.5 Decisione D5 — Heuristics, non ML

**Scelta**: tutte le rule sono **regex/word-count euristiche**. NO modelli ML, NO classification model, NO LLM-judge.

**Razionale**:
- Latenza: ML model in-process = +50-200ms, viola budget.
- Costo: LLM-judge = doppia call, doppio costo, doppia latenza.
- Determinismo: regex sono deterministiche, debug e regression test triviali.
- "Imperativo docente" detection — un modello NER catturerebbe forse 5-10% in più di pattern, a costo 100x. Falso positive rate stimato 3-5% per regex (es. "fai vedere" in contesto innocuo) — accettabile per log+gate-opt-in.

**Downside onesto**: stiamo confessando di tollerare 3-5% false positive su R2 (CRITICAL). Mitigazione: log includes snippet del match → revisione manuale telemetria settimanale → tuning regex se pattern emergono. NON proporre ML model finchè bench R5 non mostra che il bottleneck è recall (per ora è precision).

### 2.6 Decisione D6 — Locale: IT only Sprint R1, struttura ready per multilingue

**Scelta**: Sprint R1 implementa solo `it`. Struttura del modulo predispone `LocaleRules` map (come `pz-v3-validator.ts:37`), ma altre lingue restano stub `null` con `TODO` esplicito.

**Razionale**: ELAB è IT-only oggi (volumi cartacei IT, classi scolastiche IT). Multilingue è roadmap H2 2026. Predisporre struttura ora = zero costo, attivazione futura = drop-in.

**Anti-pattern evitato**: NON copiare blindly le regex EN/ES/FR/DE da `pz-v3-validator.ts` perchè non sono tarate per chat (sono per speakTTS) e non sono validate da bench. Aspettare bench multilingue per attivarle.

### 2.7 Decisione D7 — Telemetria: aggregati Supabase function, NO esterno

**Scelta**: telemetria emessa via INSERT su `unlim_pz_violations`. Aggregazione lato analitica = SQL query on-demand (no daemon, no dashboard live Sprint R1).

Query template proposte (per ops):

```sql
-- Violation rate ultimi 7 giorni per rule
SELECT
  jsonb_array_elements(violations)->>'rule' AS rule,
  COUNT(*) AS hits,
  COUNT(DISTINCT session_id) AS unique_sessions
FROM unlim_pz_violations
WHERE ts > now() - interval '7 days'
GROUP BY rule
ORDER BY hits DESC;

-- % response gated (se gate ON)
SELECT
  date_trunc('day', ts) AS day,
  COUNT(*) FILTER (WHERE gated = true) AS gated_count,
  COUNT(*) AS total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE gated = true) / COUNT(*), 2) AS gate_pct
FROM unlim_pz_violations
WHERE ts > now() - interval '14 days'
GROUP BY day ORDER BY day;
```

**Alternative scartate**:
- Datadog/Sentry custom event: dependency esterna, costo, GDPR double-gate.
- PostHog event: stessa ragione D3.
- Stdout structured log + Vercel log search: OK per debug ad-hoc, ma niente trend analitica long-term.

**Downside onesto**: NO alerting automatico. Se violation rate sale al 30%, Andrea lo scopre solo facendo query manuale. Mitigazione futura: cron Supabase function settimanale → email Andrea con aggregati. Non Sprint R1.

---

## 3. Signature TypeScript proposta

```ts
// supabase/functions/_shared/principio-zero-validator.ts

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Violation {
  rule: string;          // "no_imperativo_docente"
  severity: Severity;
  snippet?: string;      // first 80 char del match (per debug)
  message: string;       // human-readable, IT
}

export interface ValidationContext {
  /** Hash SHA-256 short del user message (per audit log, no PII). */
  userMessageHash?: string;
  experimentId?: string;
  sessionId?: string;
  model?: string;
  /** Se true, applica gate per CRITICAL violations. Default: false. */
  gateCriticalEnabled?: boolean;
  /** Locale, default 'it'. */
  locale?: "it" | "en" | "es" | "fr" | "de";
}

export interface ValidationResult {
  /** True se nessuna violazione CRITICAL (o gate disabled). */
  valid: boolean;
  /** Lista violazioni rilevate (può contenere LOW/MEDIUM anche se valid=true). */
  violations: Violation[];
  /** Word count della response (escluse [AZIONE:...]). */
  wordCount: number;
  /** Response finale: originale OR fallback se gateCriticalEnabled e CRITICAL hit. */
  responseText: string;
  /** True se response è stata sostituita da fallback. */
  gated: boolean;
  /** Tempo speso in ms (per telemetry e SLO check). */
  elapsedMs: number;
}

/**
 * Valida response post-LLM contro PRINCIPIO ZERO rule (subset runtime).
 * Side effect: scrive audit log su unlim_pz_violations (fire-and-forget).
 *
 * @param response Testo response LLM (già extracted dal payload Gemini/Together)
 * @param context Contesto opzionale (sessionId, model, experimentId)
 * @param supabaseClient Client per audit log (opzionale; se null skip log)
 */
export function validatePrincipioZero(
  response: string,
  context?: ValidationContext,
  supabaseClient?: SupabaseClient,
): ValidationResult;
```

---

## 4. Esempio output JSON (3 scenari)

### Scenario A — Risposta clean (nessuna violazione)

Input response: `"Ragazzi, accendiamo il LED! E' come una porta a senso unico per la corrente. Vediamo insieme... [AZIONE:highlight:led1]"`

Output:
```json
{
  "valid": true,
  "violations": [],
  "wordCount": 18,
  "responseText": "Ragazzi, accendiamo il LED! E' come una porta a senso unico per la corrente. Vediamo insieme... [AZIONE:highlight:led1]",
  "gated": false,
  "elapsedMs": 4
}
```

### Scenario B — Violazioni HIGH ma non gateable (gate OFF default)

Input response: `"Sono UNLIM, posso aiutarti? Distribuisci ai ragazzi i resistori da 220 ohm e poi spiega ai ragazzi che il coefficiente di resistenza..."`

Output:
```json
{
  "valid": true,
  "violations": [
    {
      "rule": "no_chatbot_preamble",
      "severity": "HIGH",
      "snippet": "Sono UNLIM, posso aiutarti?",
      "message": "Risposta inizia con preambolo chatbot. UNLIM non si presenta — è gia' lì."
    },
    {
      "rule": "no_imperativo_docente",
      "severity": "CRITICAL",
      "snippet": "Distribuisci ai ragazzi i resistori",
      "message": "Imperativo rivolto al docente rilevato. Riscrivere in plurale inclusivo (Ragazzi, ...)."
    },
    {
      "rule": "linguaggio_bambino",
      "severity": "LOW",
      "snippet": "coefficiente",
      "message": "Termine accademico rilevato. Preferire linguaggio 10-14 anni."
    },
    {
      "rule": "max_words",
      "severity": "HIGH",
      "snippet": null,
      "message": "Risposta supera 60 parole (count: 24)."
    }
  ],
  "wordCount": 24,
  "responseText": "Sono UNLIM, posso aiutarti? Distribuisci ai ragazzi i resistori da 220 ohm e poi spiega ai ragazzi che il coefficiente di resistenza...",
  "gated": false,
  "elapsedMs": 8
}
```

Nota: `valid: true` perchè gate OFF — la response passa al client comunque, ma audit log catturerà tutte le 4 violations.

### Scenario C — Violazione CRITICAL con gate ON

Input response uguale a B, ma `context.gateCriticalEnabled === true`.

Output:
```json
{
  "valid": false,
  "violations": [ /* same as B */ ],
  "wordCount": 24,
  "responseText": "Un attimo, lasciami riformulare. Ragazzi, vediamo insieme. [AZIONE:none]",
  "gated": true,
  "elapsedMs": 9
}
```

---

## 5. Sequence diagram (text-only) — integrazione `unlim-chat`

```
┌─────────┐            ┌──────────────┐            ┌──────┐         ┌─────────────────────┐         ┌──────────┐
│ Client  │            │ unlim-chat   │            │ LLM  │         │ validatePrincipio   │         │ Supabase │
│ (LIM)   │            │ Edge Func    │            │      │         │ Zero (NEW)          │         │ DB       │
└────┬────┘            └──────┬───────┘            └──┬───┘         └──────────┬──────────┘         └────┬─────┘
     │  POST /unlim-chat      │                       │                        │                          │
     │  {message, expId,..}   │                       │                        │                          │
     ├───────────────────────>│                       │                        │                          │
     │                        │ buildSystemPrompt(...) │                        │                          │
     │                        │ + ADR-008 fragment    │                        │                          │
     │                        │                       │                        │                          │
     │                        │  callLLM(systemPrompt, message)                │                          │
     │                        ├──────────────────────>│                        │                          │
     │                        │                       │                        │                          │
     │                        │  responseText         │                        │                          │
     │                        │<──────────────────────┤                        │                          │
     │                        │                       │                        │                          │
     │                        │  validatePrincipioZero(responseText, context, supabaseClient)             │
     │                        ├──────────────────────────────────────────────>│                          │
     │                        │                       │                        │                          │
     │                        │                       │   /* run R1, R2, R3, R6, R7, R12 (≤11ms) */     │
     │                        │                       │                        │                          │
     │                        │                       │                        │ INSERT INTO unlim_pz_   │
     │                        │                       │                        │ violations (fire&forget)│
     │                        │                       │                        ├─────────────────────────>│
     │                        │                       │                        │ (no await, no block)    │
     │                        │                       │                        │                          │
     │                        │                       │                        │                          │
     │                        │  ValidationResult     │                        │                          │
     │                        │  {responseText, gated, violations, ...}        │                          │
     │                        │<───────────────────────────────────────────────┤                          │
     │                        │                       │                        │                          │
     │                        │  if (gated) {                                  │                          │
     │                        │    return result.responseText (= fallback)     │                          │
     │                        │  } else {                                      │                          │
     │                        │    return responseText (= original)            │                          │
     │                        │  }                                             │                          │
     │  200 OK {response,...} │                       │                        │                          │
     │<───────────────────────┤                       │                        │                          │
     │                        │                       │                        │                          │
```

Note diagrama:
- Validator chiamata **dopo** LLM, **prima** del return al client. Latenza budget <50ms = trascurabile rispetto LLM ~800-2000ms.
- DB INSERT è fire-and-forget: il return al client NON aspetta il commit DB.
- Se gate OFF (default): `responseText` = original. Se gate ON e CRITICAL hit: `responseText` = fallback hardcoded.

---

## 6. Wire-up code in `unlim-chat/index.ts`

```ts
// PRIMA (oggi):
const result = await callLLM({ model, systemPrompt, message, ... });
return new Response(JSON.stringify({ response: result.text, ... }), { ... });

// DOPO (proposto ADR-009):
import { validatePrincipioZero } from "../_shared/principio-zero-validator.ts";
import { createHash } from "https://deno.land/std/crypto/mod.ts";

const result = await callLLM({ model, systemPrompt, message, ... });

const userMessageHash = createHash("sha256").update(safeMessage).toString("hex").slice(0, 16);
const validation = validatePrincipioZero(
  result.text,
  {
    userMessageHash,
    experimentId: safeExperimentId,
    sessionId: studentContext?.sessionId,
    model,
    gateCriticalEnabled: Deno.env.get("ELAB_PZ_GATE_CRITICAL") === "true",
    locale: "it",
  },
  supabaseClient,  // already initialized at top of handler
);

// Telemetria leggera anche su Vercel log (per debug rapido)
if (validation.violations.length > 0) {
  console.log(`[pz-validator] violations=${validation.violations.length} gated=${validation.gated} elapsed=${validation.elapsedMs}ms`);
}

return new Response(JSON.stringify({
  response: validation.responseText,  // gated = fallback, NOT gated = original
  // Optional: includere violations in dev mode per debug
  ...(Deno.env.get("ELAB_DEBUG_PZ") === "true" && { _pz_debug: validation.violations }),
}), { ... });
```

---

## 7. Test scenarios (per generator-test-opus)

File proposto: `tests/unit/supabase/principio-zero-validator.test.ts`. Tutti tests pure-function (mockare supabaseClient con `null` per skip log).

| ID | Scenario | Input | Assert |
|----|----------|-------|--------|
| V1 | Clean response | "Ragazzi, vediamo il LED! E' come una porta. [AZIONE:highlight:led1]" | violations.length === 0, valid === true, gated === false |
| V2 | Imperativo docente CRITICAL, gate OFF | "Distribuisci ai ragazzi i LED" | violations[0].rule === 'no_imperativo_docente', valid === true (gate off), gated === false |
| V3 | Imperativo docente CRITICAL, gate ON | stesso V2 + gateCriticalEnabled=true | valid === false, gated === true, responseText !== originale |
| V4 | Preamble chatbot | "Ciao! Sono UNLIM, posso aiutarti?" | violations include 'no_chatbot_preamble' severity HIGH |
| V5 | Word count >60 | response 80 parole | violations include 'max_words', wordCount === 80 |
| V6 | Word count escluso `[AZIONE:...]` | "Ragazzi vediamo [AZIONE:play] [AZIONE:highlight:led1,r1]" | wordCount === 2, no violation |
| V7 | Verbatim 3+ frasi quoted | "«Frase 1. Frase 2. Frase 3. Frase 4 tutte lunghe.»" 200+ char | violations include 'no_verbatim_3plus_frasi' |
| V8 | Linguaggio accademico | "Il coefficiente asintot della funzione..." | violations include 'linguaggio_bambino' severity LOW |
| V9 | Plurale absent | "Vedo il LED acceso." | violations include 'plurale_ragazzi' (no Ragazzi/vediamo/...) |
| V10 | Gate ON ma solo HIGH (no CRITICAL) | response con preamble + max_words violation | gated === false (gate solo CRITICAL) |
| V11 | Latency budget | response 1500 char tipica | elapsedMs < 50 |
| V12 | Locale fallback | locale='zz' (invalido) | usa rules 'it' default, no throw |
| V13 | Fire-and-forget DB success | mock supabase returns success | nessun await blocking, return immediato |
| V14 | Fire-and-forget DB failure | mock supabase throws | nessun throw propaga, console.error chiamato |
| V15 | Empty response | "" | wordCount === 0, violations include 'plurale_ragazzi', no crash |

---

## 8. Open questions per Andrea

1. **[ANDREA-DECIDE] Gate CRITICAL on/off default**: mio default OFF (telemetria 2 settimane → review). Andrea può preferire ON per safety-first. Trade-off: 5-10% risposte sostituite con fallback generico vs zero risposte con imperativi al docente. La flag è env var, può essere flippata senza redeploy.

2. **[ANDREA-DECIDE] Fallback message wording**: ho proposto `"Un attimo, lasciami riformulare. Ragazzi, vediamo insieme."` Vorresti tono diverso (più scusa, più asciutto, con suggerimento "riprova")? Andrea decide il copy.

3. **Schema `unlim_pz_violations` campi opzionali**: ho incluso `response_excerpt` (200 char). Privacy-pedante: potremmo escludere e tenere solo word count + violations metadata. Mio default include excerpt (utile per debug regex tuning). Andrea decide.

4. **Retention 90 giorni audit log**: per analytics aggregati basterebbero counts. 90gg = compromise debug + storage. Andrea può chiedere 30 o 365.

5. **Multilingue activation timing**: locale stub ready ma vuoti — quando attivare EN/ES/FR/DE? Mia raccomandazione: dopo bench R5 multilingue dedicato (Sprint H2 2026), non prima.

---

## 9. Trade-off summary onesto

**Pro**:
- Telemetria di violations runtime → primo dato real su frequency PRINCIPIO ZERO breach in produzione (oggi: zero data)
- Gate opt-in (R2 CRITICAL) disponibile senza redeploy via env flag
- Latency budget <50ms = trascurabile vs LLM call (~800-2000ms)
- Heuristics regex = deterministiche, debug semplice, regression test triviali
- Schema audit dedicato → query analytics one-shot, no infra extra
- Riusa design ideas da `pz-v3-validator.ts` Sett-5 senza coupling

**Contro / debt**:
- 6 rule su 12 a runtime → 50% bench coverage solo. Le 6 skipped sono fixture-driven (acceptable) ma R9 synthesis (CRITICAL) skipped per costo → mitigato parzialmente da R6.
- Regex heuristics = 3-5% false positive su R2 atteso (es. "fai vedere" innocuo) → log clutter, da tunare iterativamente.
- Gate fallback message generico = UX scadente nei <10% casi gate ON. Andrea può sostituire copy.
- Nuova tabella DB = 1 migration + RLS policy da scrivere → +30min implementazione.
- Telemetria senza alert automation → Andrea deve fare query manuale o subire violation invisibili. Roadmap: cron settimanale.
- Multilingue stub → debt deferred. Quando arriva, va testata da bench dedicato.

**Alternative rejected**:
- "LLM-judge per validation" → costo + latenza inaccettabili.
- "Riusare `together_audit_log`" → semantic mismatch (gate-block vs quality-violation).
- "Block & re-call LLM su CRITICAL" → loop risk + costo + UX peggiore di fallback.
- "Solo console.warn, no DB" → niente analytics, decisione gate-on/off resterebbe blind.

---

## 10. Acceptance criteria implementazione

Per `generator-app-opus` quando implementa:

- [ ] File creato: `supabase/functions/_shared/principio-zero-validator.ts`
- [ ] Export `validatePrincipioZero(response, context, supabaseClient)` con signature ADR §3
- [ ] 6 rule runtime implementate (R1, R2, R3, R6, R7, R12) con regex da `score-unlim-quality.mjs`
- [ ] Word count escluse `[AZIONE:...]` e `[INTENT:{...}]` (consistent con R3 bench)
- [ ] Fire-and-forget DB write (no await blocking return)
- [ ] Gate CRITICAL solo per R2, attivato via env `ELAB_PZ_GATE_CRITICAL=true`
- [ ] Fallback message hardcoded `"Un attimo, lasciami riformulare. Ragazzi, vediamo insieme."` + tag `[AZIONE:none]`
- [ ] Migration SQL `unlim_pz_violations` + RLS policy (service-role-only insert, admin select)
- [ ] Wire-up in `unlim-chat/index.ts` come da §6
- [ ] 15 test pass (§7) in `tests/unit/supabase/principio-zero-validator.test.ts`
- [ ] No regressione test baseline (12291 PASS preservato)
- [ ] Build Deno function passa: `npx supabase functions deploy unlim-chat --dry-run`
- [ ] Latency p95 misurata < 20ms su 100 sample casuali (test perf incluso)

---

## 11. Riferimenti

- **Master plan**: `docs/strategy/2026-04-26-master-plan-v2-comprehensive.md` §4.3 (validator middleware nel diagramma synthesis stack)
- **Sprint S iter 2 PDR**: `docs/pdr/PDR-SPRINT-S-ITER-2-RALPH-LOOP-5-AGENT-2026-04-26.md`
- **Source rules**: `scripts/bench/score-unlim-quality.mjs` (12 RULES)
- **Design reference (NO dependency)**: `scripts/openclaw/pz-v3-validator.ts` (locale pattern, return shape)
- **Call site target**: `supabase/functions/unlim-chat/index.ts:234` (post-LLM)
- **Audit log sibling**: `together_audit_log` (Sprint S iter 1, NON riusato — vedi D3)
- **Sibling ADR**: ADR-008 (buildCapitoloPromptFragment) — implementato nello stesso PR Sprint R1
- **PRINCIPIO ZERO**: `CLAUDE.md` sezione apertura
