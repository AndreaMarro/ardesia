/**
 * Together AI — GDPR-Gated Fallback Client
 *
 * Together AI is a US-based provider. GDPR classifies it as an international
 * transfer with Standard Contractual Clauses required (possible post-Schrems II
 * but fragile for EDU data on minors). We therefore allow Together AI ONLY
 * in three tightly scoped modes, and BLOCK it for student-runtime chat.
 *
 * ┌─ ALLOWED MODES ───────────────────────────────────────────────────┐
 * │                                                                    │
 * │  1. BATCH INGEST                                                   │
 * │     Use: one-time or scheduled Wiki LLM corpus generation          │
 * │     Data: public textbook content only (volumes are published)     │
 * │     PII: NONE — student data never sent                            │
 * │     Price: $0.18/M input / $0.54/M output (batch tier)             │
 * │     Cost to ingest full Wiki LLM (6000 chunks × ~500 tok): ~$0.07  │
 * │                                                                    │
 * │  2. TEACHER-CONTEXT MODE                                           │
 * │     Use: docente chiede "prepara lezione" / "genera quiz stampa"   │
 * │     Data: curriculum + volume page refs + teacher UUID only        │
 * │     PII: NONE of the students; the docente explicitly consents     │
 * │           via banner "Elaborazione cloud US — SCC attive. OK?"     │
 * │     Price: $0.88/M input / $0.88/M output (Qwen 2.5 72B instruct)  │
 * │                                                                    │
 * │  3. EMERGENCY ANONYMIZED (rare, manually triggered)                │
 * │     Use: Tutti i provider EU giù (Hetzner + Scaleway + Supabase)   │
 * │     Data: question + circuit topology only; NO session/class IDs   │
 * │     PII: stripped via anonymizePayload() below                     │
 * │     Price: as teacher-context                                      │
 * │     Audit: ogni chiamata logged to Supabase `together_audit_log`   │
 * │                                                                    │
 * └────────────────────────────────────────────────────────────────────┘
 *
 * ┌─ BLOCKED MODES ───────────────────────────────────────────────────┐
 * │                                                                    │
 * │  ✗ STUDENT RUNTIME CHAT                                            │
 * │    Students (via LIM) asking UNLIM questions MUST stay on EU       │
 * │    providers (Hetzner VPS, Scaleway GPU, Supabase FR).             │
 * │    Rationale: dati minori, PNRR/MiUR sensitive, Schrems II risk.   │
 * │                                                                    │
 * │  ✗ PERSISTENCE                                                     │
 * │    Together AI responses MUST NOT be persisted as authoritative    │
 * │    corpus. Batch-ingest writes go to our OWN Supabase/pgvector.    │
 * │    The Together response is the ingredient, not the final dish.    │
 * │                                                                    │
 * └────────────────────────────────────────────────────────────────────┘
 *
 * `canUseTogether(context)` is the single gatekeeper. If it returns false,
 * the caller MUST fallback to EU-only providers (Mistral FR, local Qwen
 * on Hetzner/Scaleway, Gemini EU) or return a graceful error to the user.
 *
 * (c) ELAB Tutor — 2026-04-22
 */

// ════════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════════

export type TogetherMode = 'batch_ingest' | 'teacher_context' | 'emergency_anonymized';

export interface TogetherContext {
  mode: TogetherMode;
  teacherConsent?: boolean;          // required for teacher_context
  emergencyTicketId?: string;         // required for emergency_anonymized
  euProvidersDown?: string[];         // required for emergency_anonymized (must be ≥2)
  payload: {
    hasStudentData: boolean;          // if true → BLOCKED regardless of mode
    hasClassIds: boolean;              // if true → stripped in anonymize()
    hasSessionIds: boolean;            // if true → stripped in anonymize()
    topic: 'wiki_ingest' | 'lesson_prep' | 'quiz_gen' | 'fallback_query';
  };
}

export interface TogetherAuditRow {
  at: string;
  mode: TogetherMode;
  topic: string;
  teacher_uuid?: string;
  cost_cents_estimated: number;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  anonymized: boolean;
  result: 'ok' | 'blocked' | 'error';
  blocked_reason?: string;
  error_message?: string;
}

export interface GuardResult {
  allowed: boolean;
  reason: string;
  mitigations?: string[];
}

// ════════════════════════════════════════════════════════════════════
// Guard: the ONLY public decision function
// ════════════════════════════════════════════════════════════════════

export function canUseTogether(ctx: TogetherContext): GuardResult {
  // Hard rule 1: student data never leaves EU.
  if (ctx.payload.hasStudentData) {
    return {
      allowed: false,
      reason: 'GDPR: dati studenti (minori) non possono transitare verso Together AI (US).',
      mitigations: ['usa Mistral FR', 'usa Qwen locale su Hetzner/Scaleway', 'usa Gemini Pro EU endpoint'],
    };
  }

  switch (ctx.mode) {
    case 'batch_ingest':
      // Only public textbook content
      if (ctx.payload.topic !== 'wiki_ingest') {
        return { allowed: false, reason: 'batch_ingest mode only accepts wiki_ingest topic.' };
      }
      if (ctx.payload.hasClassIds || ctx.payload.hasSessionIds) {
        return { allowed: false, reason: 'batch_ingest payload must be topic-level only, no IDs.' };
      }
      return { allowed: true, reason: 'batch ingest of public textbook, no PII.' };

    case 'teacher_context':
      if (!ctx.teacherConsent) {
        return {
          allowed: false,
          reason: 'teacher_context richiede consenso esplicito del docente (banner UI).',
          mitigations: ['mostra banner consenso una tantum', 'salva consenso in supabase.teachers.together_consent_at'],
        };
      }
      if (ctx.payload.topic !== 'lesson_prep' && ctx.payload.topic !== 'quiz_gen') {
        return { allowed: false, reason: 'teacher_context only accepts lesson_prep or quiz_gen.' };
      }
      if (ctx.payload.hasStudentData) {
        return { allowed: false, reason: 'teacher_context blocca student data anche con consenso.' };
      }
      return { allowed: true, reason: 'teacher-only, consent OK, no student data.' };

    case 'emergency_anonymized':
      if (!ctx.emergencyTicketId) {
        return { allowed: false, reason: 'emergency_anonymized richiede ticket ID tracciato.' };
      }
      if (!ctx.euProvidersDown || ctx.euProvidersDown.length < 2) {
        return {
          allowed: false,
          reason: 'emergency_anonymized richiede almeno 2 provider EU down (verificati).',
          mitigations: ['verifica Hetzner health', 'verifica Scaleway health', 'verifica Mistral FR health'],
        };
      }
      if (ctx.payload.topic !== 'fallback_query') {
        return { allowed: false, reason: 'emergency mode only accepts fallback_query topic.' };
      }
      return { allowed: true, reason: `emergency fallback: EU providers down [${ctx.euProvidersDown.join(', ')}]` };

    default:
      return { allowed: false, reason: `unknown mode: ${ctx.mode as string}` };
  }
}

// ════════════════════════════════════════════════════════════════════
// Anonymizer: strip any residual class/session/teacher identifiers
// ════════════════════════════════════════════════════════════════════

/**
 * Returns a deep-cloned payload with IDs replaced by opaque tokens.
 * Used before sending to Together AI in emergency_anonymized mode.
 */
export function anonymizePayload<T extends Record<string, unknown>>(payload: T): T {
  const clone = JSON.parse(JSON.stringify(payload)) as T;

  const ID_PATTERNS = [
    /class[_-]?id/i,
    /session[_-]?id/i,
    /teacher[_-]?uuid/i,
    /student[_-]?id/i,
    /user[_-]?id/i,
    /email/i,
    /nome|cognome|name|surname/i,
  ];

  function walk(obj: unknown): void {
    if (Array.isArray(obj)) {
      obj.forEach(walk);
      return;
    }
    if (obj && typeof obj === 'object') {
      const record = obj as Record<string, unknown>;
      for (const k of Object.keys(record)) {
        if (ID_PATTERNS.some((re) => re.test(k))) {
          record[k] = '[REDACTED]';
        } else if (typeof record[k] === 'object') {
          walk(record[k]);
        } else if (typeof record[k] === 'string') {
          // redact UUIDs
          const uuidRe = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi;
          record[k] = (record[k] as string).replace(uuidRe, '[UUID]');
        }
      }
    }
  }

  walk(clone);
  return clone;
}

// ════════════════════════════════════════════════════════════════════
// Cost estimator (gives the caller a dry-run cost before firing)
// ════════════════════════════════════════════════════════════════════

const PRICE_USD_PER_M: Record<TogetherMode, { input: number; output: number }> = {
  batch_ingest: { input: 0.18, output: 0.54 },           // Qwen 2.5 72B Batch
  teacher_context: { input: 0.88, output: 0.88 },         // Qwen 2.5 72B Instruct
  emergency_anonymized: { input: 0.88, output: 0.88 },
};

export function estimateCostCents(mode: TogetherMode, inputTokens: number, outputTokens: number): number {
  const p = PRICE_USD_PER_M[mode];
  const usd = (inputTokens * p.input + outputTokens * p.output) / 1_000_000;
  return Math.round(usd * 100);
}

// ════════════════════════════════════════════════════════════════════
// Monthly budget cap (prevents runaway costs)
// ════════════════════════════════════════════════════════════════════

export interface BudgetCheck {
  allowed: boolean;
  monthSpentCents: number;
  capCents: number;
  remainingCents: number;
}

/**
 * Enforces a hard monthly cap. Caller supplies the running total from Supabase.
 * Default cap: 500 cents = $5/month. Increase in env for bigger classes.
 */
export function checkMonthlyBudget(
  monthSpentCents: number,
  proposedCents: number,
  capCents = 500
): BudgetCheck {
  const remainingCents = Math.max(0, capCents - monthSpentCents);
  return {
    allowed: proposedCents <= remainingCents,
    monthSpentCents,
    capCents,
    remainingCents,
  };
}

// ════════════════════════════════════════════════════════════════════
// Thin Together AI client (fetch-based, no sdk dep)
// ════════════════════════════════════════════════════════════════════

export interface TogetherCompletionRequest {
  model: string;                  // e.g. "Qwen/Qwen2.5-72B-Instruct-Turbo"
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  max_tokens?: number;
  temperature?: number;
  response_format?: 'json' | 'text';
  // Meta for audit
  ctx: TogetherContext;
  teacherUuid?: string;
}

export interface TogetherCompletionResponse {
  ok: boolean;
  text?: string;
  error?: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  latencyMs: number;
  cost_cents_estimated: number;
  audit: TogetherAuditRow;
}

export interface TogetherClientOptions {
  apiKey: string;
  baseUrl?: string;                // default https://api.together.xyz/v1
  monthlyBudgetCents?: number;     // default 500 = $5
  getMonthSpentCents?: () => Promise<number>; // wiring to Supabase
  persistAudit?: (row: TogetherAuditRow) => Promise<void>;
  logger?: { warn: (...a: unknown[]) => void; info: (...a: unknown[]) => void };
}

export function createTogetherClient(opts: TogetherClientOptions) {
  const baseUrl = opts.baseUrl || 'https://api.together.xyz/v1';
  const budgetCap = opts.monthlyBudgetCents ?? 500;

  async function completion(req: TogetherCompletionRequest): Promise<TogetherCompletionResponse> {
    const start = Date.now();
    const audit: TogetherAuditRow = {
      at: new Date().toISOString(),
      mode: req.ctx.mode,
      topic: req.ctx.payload.topic,
      teacher_uuid: req.teacherUuid,
      cost_cents_estimated: 0,
      input_tokens: 0,
      output_tokens: 0,
      latency_ms: 0,
      anonymized: false,
      result: 'ok',
    };

    // 1. Gate check
    const guard = canUseTogether(req.ctx);
    if (!guard.allowed) {
      audit.result = 'blocked';
      audit.blocked_reason = guard.reason;
      audit.latency_ms = Date.now() - start;
      await opts.persistAudit?.(audit);
      return { ok: false, error: `blocked: ${guard.reason}`, latencyMs: audit.latency_ms, cost_cents_estimated: 0, audit };
    }

    // 2. Anonymize if emergency
    const messages = req.ctx.mode === 'emergency_anonymized'
      ? req.messages.map((m) => ({ ...m, content: JSON.stringify(anonymizePayload({ c: m.content })).slice(2, -2) }))
      : req.messages;
    if (req.ctx.mode === 'emergency_anonymized') audit.anonymized = true;

    // 3. Rough pre-estimate (4 chars ≈ 1 token)
    const estIn = messages.reduce((s, m) => s + m.content.length, 0) / 4;
    const estOut = req.max_tokens ?? 1024;
    const estCents = estimateCostCents(req.ctx.mode, estIn, estOut);

    // 4. Budget check
    const monthSpent = (await opts.getMonthSpentCents?.()) ?? 0;
    const budget = checkMonthlyBudget(monthSpent, estCents, budgetCap);
    if (!budget.allowed) {
      audit.result = 'blocked';
      audit.blocked_reason = `monthly budget exceeded: spent ${monthSpent}¢/${budgetCap}¢, proposed ${estCents}¢`;
      audit.latency_ms = Date.now() - start;
      await opts.persistAudit?.(audit);
      opts.logger?.warn?.('[together] budget exceeded', audit.blocked_reason);
      return { ok: false, error: audit.blocked_reason, latencyMs: audit.latency_ms, cost_cents_estimated: estCents, audit };
    }

    // 5. Fire
    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${opts.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: req.model,
          messages,
          max_tokens: req.max_tokens,
          temperature: req.temperature ?? 0.3,
          ...(req.response_format === 'json' ? { response_format: { type: 'json_object' } } : {}),
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        audit.result = 'error';
        audit.error_message = `http ${res.status}: ${errText.slice(0, 200)}`;
        audit.latency_ms = Date.now() - start;
        await opts.persistAudit?.(audit);
        return { ok: false, error: audit.error_message, latencyMs: audit.latency_ms, cost_cents_estimated: estCents, audit };
      }
      const json = await res.json();
      const text: string = json?.choices?.[0]?.message?.content ?? '';
      const usage = json?.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

      audit.input_tokens = usage.prompt_tokens;
      audit.output_tokens = usage.completion_tokens;
      audit.cost_cents_estimated = estimateCostCents(req.ctx.mode, usage.prompt_tokens, usage.completion_tokens);
      audit.latency_ms = Date.now() - start;
      await opts.persistAudit?.(audit);

      return {
        ok: true,
        text,
        usage,
        latencyMs: audit.latency_ms,
        cost_cents_estimated: audit.cost_cents_estimated,
        audit,
      };
    } catch (e) {
      audit.result = 'error';
      audit.error_message = e instanceof Error ? e.message : String(e);
      audit.latency_ms = Date.now() - start;
      await opts.persistAudit?.(audit);
      return { ok: false, error: audit.error_message, latencyMs: audit.latency_ms, cost_cents_estimated: estCents, audit };
    }
  }

  return { completion };
}

// ════════════════════════════════════════════════════════════════════
// Supabase migration (together_audit_log table)
// ════════════════════════════════════════════════════════════════════

export const TOGETHER_AUDIT_MIGRATION_SQL = `
-- Together AI audit log — every call logged for GDPR + budget transparency
CREATE TABLE IF NOT EXISTS together_audit_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  at              timestamptz NOT NULL DEFAULT now(),
  mode            text NOT NULL CHECK (mode IN ('batch_ingest','teacher_context','emergency_anonymized')),
  topic           text NOT NULL,
  teacher_uuid    uuid,
  cost_cents_estimated  integer NOT NULL DEFAULT 0,
  input_tokens    integer NOT NULL DEFAULT 0,
  output_tokens   integer NOT NULL DEFAULT 0,
  latency_ms      integer NOT NULL DEFAULT 0,
  anonymized      boolean NOT NULL DEFAULT false,
  result          text NOT NULL CHECK (result IN ('ok','blocked','error')),
  blocked_reason  text,
  error_message   text
);

CREATE INDEX IF NOT EXISTS idx_together_audit_at      ON together_audit_log (at DESC);
CREATE INDEX IF NOT EXISTS idx_together_audit_mode    ON together_audit_log (mode, at DESC);
CREATE INDEX IF NOT EXISTS idx_together_audit_teacher ON together_audit_log (teacher_uuid, at DESC);

-- View: monthly spend per mode (to power the dashboard budget widget)
CREATE OR REPLACE VIEW together_monthly_spend AS
SELECT
  date_trunc('month', at) AS month,
  mode,
  sum(cost_cents_estimated) AS cents_spent,
  count(*) FILTER (WHERE result='ok')      AS ok_count,
  count(*) FILTER (WHERE result='blocked') AS blocked_count,
  count(*) FILTER (WHERE result='error')   AS error_count
FROM together_audit_log
GROUP BY 1,2;
`;
