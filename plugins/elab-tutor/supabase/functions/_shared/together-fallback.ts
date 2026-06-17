/**
 * Together AI Fallback — Edge Function gate + audit helper
 *
 * Sprint S iter 3 — gen-app-opus (2026-04-26)
 *
 * Single decision point for whether the unlim-chat Edge Function may
 * route a query to Together AI (US provider) instead of EU primaries
 * (RunPod EU GPU + Gemini EU).
 *
 * GDPR rules (HARD):
 *   - student runtime  → BLOCK ALWAYS (US transit forbidden for minor data)
 *   - teacher runtime  → ALLOW if consent_id present AND anonymized=true
 *   - batch / emergency → ALLOW if anonymized=true (caller responsibility)
 *
 * The shipped implementation is intentionally MINIMAL. The richer
 * scaffold in `scripts/openclaw/together-teacher-mode.ts` covers the
 * Node-side audit dashboard work. Edge Function code stays small,
 * imports zero npm deps, and writes audit rows via supabase-js client
 * passed in by the caller.
 *
 * Wire-up:
 *   - default disabled via env: TOGETHER_FALLBACK_ENABLED=false
 *   - gate `canUseTogether` always evaluated; env flag is independent
 *
 * (c) Andrea Marro
 */

// ════════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════════

export type TogetherRuntime = 'student' | 'teacher' | 'batch' | 'emergency';

export interface TogetherContext {
  runtime: TogetherRuntime;
  consent_id?: string;          // required for runtime === 'teacher'
  anonymized: boolean;          // required for batch / emergency
  // Optional traceability
  request_id?: string;
  teacher_uuid?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface TogetherAuditEntry {
  request_kind: string;        // e.g. "fallback", "teacher_lesson_prep", "wiki_ingest"
  anonymized_payload?: unknown; // jsonb
  user_role: TogetherRuntime;
  consent_id?: string;
  latency_ms: number;
  status: string;              // "ok" | "blocked" | "error" | http status string
}

// Minimal supabase-js shape (avoids importing supabase types in Edge Function)
export interface SupabaseClientLike {
  from(table: string): {
    insert(row: Record<string, unknown>): Promise<{ data: unknown; error: unknown }>;
  };
}

// ════════════════════════════════════════════════════════════════════
// Gate predicate (single source of truth)
// ════════════════════════════════════════════════════════════════════

/**
 * Decision gate. Returns true ⇒ caller may route to Together AI.
 *
 * Truth table:
 *
 *   runtime    | consent_id | anonymized | result | reason
 *   -----------+------------+------------+--------+--------------------------
 *   student    | *          | *          | false  | minors data → never US
 *   teacher    | absent     | *          | false  | consent missing
 *   teacher    | present    | *          | true   | consented teacher
 *   batch      | *          | false      | false  | un-anonymized batch payload
 *   batch      | *          | true       | true   | wiki ingest etc.
 *   emergency  | *          | false      | false  | un-anonymized emergency
 *   emergency  | *          | true       | true   | EU providers down + clean payload
 */
export function canUseTogether(context: TogetherContext): boolean {
  // Hard rule: student runtime always blocked
  if (context.runtime === 'student') return false;

  if (context.runtime === 'teacher') {
    return Boolean(context.consent_id && context.consent_id.length > 0);
  }

  if (context.runtime === 'batch' || context.runtime === 'emergency') {
    return context.anonymized === true;
  }

  // Unknown runtime → fail closed
  return false;
}

// ════════════════════════════════════════════════════════════════════
// PII anonymization (best-effort heuristic — fail open with redactions)
// ════════════════════════════════════════════════════════════════════

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /\+?\d{2,3}[ -]?\d{3}[ -]?\d{4,7}/g;
const CF_RE = /\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b/g;          // Italian fiscal code
const UUID_RE = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi;
const NAME_LABEL_RE = /\b(?:nome|cognome|name|surname|alunno|studente|studentessa)\s*[:=]\s*[A-Za-zÀ-ÿ' -]+/gi;
const CLASS_LABEL_RE = /\bclass[_-]?(?:id|key)\s*[:=]\s*[\w-]+/gi;
const STUDENT_LABEL_RE = /\bstudent[_-]?(?:id|uuid)\s*[:=]\s*[\w-]+/gi;

/**
 * Strip PII from messages prior to Together AI dispatch.
 * Returns NEW array (input not mutated).
 */
export function anonymizePayload(messages: ChatMessage[]): ChatMessage[] {
  if (!Array.isArray(messages)) return [];
  return messages.map((m) => ({
    role: m.role,
    content: redact(m.content || ''),
  }));
}

function redact(text: string): string {
  return text
    .replace(NAME_LABEL_RE, '[NAME_REDACTED]')
    .replace(CLASS_LABEL_RE, '[CLASS_ID_REDACTED]')
    .replace(STUDENT_LABEL_RE, '[STUDENT_ID_REDACTED]')
    .replace(CF_RE, '[CF_REDACTED]')
    .replace(EMAIL_RE, '[EMAIL_REDACTED]')
    .replace(PHONE_RE, '[PHONE_REDACTED]')
    .replace(UUID_RE, '[UUID_REDACTED]');
}

// ════════════════════════════════════════════════════════════════════
// Audit log writer — never throws, swallows errors after logging
// ════════════════════════════════════════════════════════════════════

/**
 * Insert one row into `together_audit_log`.
 *
 * Caller passes a supabase-js client (or compatible shape). On failure
 * we log + return — never throw, because failed audit MUST NOT block
 * the LLM response from reaching the student/teacher.
 *
 * Audit trail is best-effort + must be reconciled with provider
 * billing dashboard (Together AI) for compliance reporting.
 */
export async function logTogetherCall(
  supabase: SupabaseClientLike | null | undefined,
  entry: TogetherAuditEntry,
): Promise<void> {
  if (!supabase) return;
  try {
    const row = {
      ts: new Date().toISOString(),
      request_kind: entry.request_kind,
      anonymized_payload: entry.anonymized_payload ?? null,
      user_role: entry.user_role,
      consent_id: entry.consent_id ?? null,
      latency_ms: entry.latency_ms,
      status: entry.status,
    };
    const { error } = await supabase.from('together_audit_log').insert(row);
    if (error) {
      console.warn(JSON.stringify({
        level: 'warn',
        event: 'together_audit_log_insert_failed',
        error: String(error),
        ts: row.ts,
      }));
    }
  } catch (e) {
    console.warn(JSON.stringify({
      level: 'warn',
      event: 'together_audit_log_threw',
      error: e instanceof Error ? e.message : String(e),
    }));
  }
}

// ════════════════════════════════════════════════════════════════════
// Env flag — caller asks both gate AND env before firing
// ════════════════════════════════════════════════════════════════════

/**
 * Whether Together AI fallback is enabled by ops at all.
 * Defaults to FALSE (must opt in via Supabase secret).
 */
export function isTogetherFallbackEnabled(): boolean {
  try {
    // Deno.env access in Edge Function
    // deno-lint-ignore no-explicit-any
    const env = (globalThis as any).Deno?.env;
    if (!env) return false;
    const v = (env.get('TOGETHER_FALLBACK_ENABLED') || '').trim().toLowerCase();
    return v === 'true' || v === '1' || v === 'yes';
  } catch {
    return false;
  }
}
