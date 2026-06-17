/**
 * Sprint S iter 3 — Task B1 — generator-test-opus
 * 2026-04-26
 *
 * Tests for Together AI gated fallback in
 * `supabase/functions/_shared/together-fallback.ts` (re-exported through
 * `supabase/functions/_shared/llm-client.ts`).
 *
 * Truth table (8 cases) — STRICT enforcement
 *   ┌────────────────────────────────────────────────────────────────┐
 *   │  student   + no consent             → BLOCK (always)           │
 *   │  student   + consent                → BLOCK (student NEVER ok) │
 *   │  teacher   + no consent             → BLOCK                    │
 *   │  teacher   + consent                → ALLOW                    │
 *   │  batch     + anonymized=false       → BLOCK                    │
 *   │  batch     + anonymized=true        → ALLOW                    │
 *   │  emergency + anonymized=false       → BLOCK                    │
 *   │  emergency + anonymized=true        → ALLOW                    │
 *   └────────────────────────────────────────────────────────────────┘
 *
 * Implementation notes:
 *   - canUseTogether(ctx) takes { runtime, consent_id?, anonymized }
 *     where runtime ∈ 'student'|'teacher'|'batch'|'emergency'.
 *     Returns boolean.
 *   - anonymizePayload(messages: ChatMessage[]) returns NEW array
 *     with PII redacted via heuristic regexes.
 *   - logTogetherCall(supabase, entry) returns Promise<void>, never throws.
 *
 * NOTE: extension is .js to match vitest.config.js include
 * `tests/**\/*.{test,spec}.{js,jsx}`. Source helper is .ts (Deno Edge runtime).
 * vitest 3.x can import .ts via Vite plugin.
 */

import { describe, it, expect, vi } from 'vitest';

// Import target — re-exported from llm-client per architect-opus design
// (single import surface for Edge Function callers).
let canUseTogether;
let anonymizePayload;
let logTogetherCall;
let importError = null;

try {
    const mod = await import('../../supabase/functions/_shared/llm-client.ts');
    canUseTogether = mod.canUseTogether;
    anonymizePayload = mod.anonymizePayload;
    logTogetherCall = mod.logTogetherCall;
} catch (err) {
    importError = err;
}

// Fallback: pull directly from the source helper if llm-client did not re-export.
if (!canUseTogether || !anonymizePayload || !logTogetherCall) {
    try {
        const helper = await import('../../supabase/functions/_shared/together-fallback.ts');
        canUseTogether = canUseTogether || helper.canUseTogether;
        anonymizePayload = anonymizePayload || helper.anonymizePayload;
        logTogetherCall = logTogetherCall || helper.logTogetherCall;
    } catch (err) {
        if (!importError) importError = err;
    }
}

// Helper to read GuardResult-or-boolean uniformly.
// Some implementations return a boolean, others return { allowed: boolean, reason: string }.
function isAllowed(result) {
    if (typeof result === 'boolean') return result;
    if (result && typeof result === 'object' && 'allowed' in result) return result.allowed === true;
    throw new Error(`Unexpected canUseTogether return shape: ${JSON.stringify(result)}`);
}

describe('canUseTogether — truth table (Sprint S iter 3 Task B1)', () => {
    it('symbol is exported (llm-client or together-fallback)', () => {
        if (importError) {
            expect.fail(`import failed: ${importError.message}`);
        }
        expect(typeof canUseTogether).toBe('function');
    });

    // ── STUDENT: ALWAYS BLOCKED ──────────────────────────────────────
    it('student + no consent → BLOCK', () => {
        if (typeof canUseTogether !== 'function') return;
        const ctx = { runtime: 'student', anonymized: false };
        expect(isAllowed(canUseTogether(ctx))).toBe(false);
    });

    it('student + consent → BLOCK (student NEVER ok regardless of consent)', () => {
        if (typeof canUseTogether !== 'function') return;
        const ctx = { runtime: 'student', consent_id: 'parent-consent-001', anonymized: true };
        expect(isAllowed(canUseTogether(ctx))).toBe(false);
    });

    // ── TEACHER: GATED BY CONSENT ────────────────────────────────────
    it('teacher + no consent → BLOCK', () => {
        if (typeof canUseTogether !== 'function') return;
        const ctx = { runtime: 'teacher', anonymized: true };
        expect(isAllowed(canUseTogether(ctx))).toBe(false);
    });

    it('teacher + consent → ALLOW', () => {
        if (typeof canUseTogether !== 'function') return;
        const ctx = { runtime: 'teacher', consent_id: 'teacher-consent-uuid-123', anonymized: true };
        expect(isAllowed(canUseTogether(ctx))).toBe(true);
    });

    // ── BATCH INGEST: GATED BY ANONYMIZED ───────────────────────────
    it('batch + anonymized=false → BLOCK', () => {
        if (typeof canUseTogether !== 'function') return;
        const ctx = { runtime: 'batch', anonymized: false };
        expect(isAllowed(canUseTogether(ctx))).toBe(false);
    });

    it('batch + anonymized=true → ALLOW', () => {
        if (typeof canUseTogether !== 'function') return;
        const ctx = { runtime: 'batch', anonymized: true };
        expect(isAllowed(canUseTogether(ctx))).toBe(true);
    });

    // ── EMERGENCY: GATED BY ANONYMIZED ──────────────────────────────
    it('emergency + anonymized=false → BLOCK', () => {
        if (typeof canUseTogether !== 'function') return;
        const ctx = { runtime: 'emergency', anonymized: false };
        expect(isAllowed(canUseTogether(ctx))).toBe(false);
    });

    it('emergency + anonymized=true → ALLOW', () => {
        if (typeof canUseTogether !== 'function') return;
        const ctx = { runtime: 'emergency', anonymized: true };
        expect(isAllowed(canUseTogether(ctx))).toBe(true);
    });

    // ── DEFENSE: unknown runtime → fail closed ──────────────────────
    it('unknown runtime → BLOCK (fail closed)', () => {
        if (typeof canUseTogether !== 'function') return;
        const ctx = { runtime: 'something-else', anonymized: true };
        expect(isAllowed(canUseTogether(ctx))).toBe(false);
    });
});

describe('anonymizePayload — strip PII from chat messages (Sprint S iter 3 Task B1)', () => {
    it('symbol is exported (llm-client or together-fallback)', () => {
        if (importError) {
            expect.fail(`import failed: ${importError.message}`);
        }
        expect(typeof anonymizePayload).toBe('function');
    });

    it('strips name labels from message content', () => {
        if (typeof anonymizePayload !== 'function') return;
        const input = [{ role: 'user', content: 'ciao, nome: Mario Rossi, parlami del LED' }];
        const out = anonymizePayload(input);
        expect(out[0].content).not.toMatch(/Mario Rossi/);
        expect(out[0].content.toUpperCase()).toMatch(/REDACTED/);
    });

    it('strips class_key labels from message content', () => {
        if (typeof anonymizePayload !== 'function') return;
        const input = [{ role: 'user', content: 'class_key=CLASSE-2A-XYZ ho un dubbio' }];
        const out = anonymizePayload(input);
        expect(out[0].content).not.toMatch(/CLASSE-2A-XYZ/);
        expect(out[0].content.toUpperCase()).toMatch(/REDACTED/);
    });

    it('strips student_id labels from message content', () => {
        if (typeof anonymizePayload !== 'function') return;
        const input = [{ role: 'user', content: 'student_id=stu-12345 spiega ohm' }];
        const out = anonymizePayload(input);
        expect(out[0].content).not.toMatch(/stu-12345/);
        expect(out[0].content.toUpperCase()).toMatch(/REDACTED/);
    });

    it('does not mutate the input (returns NEW array)', () => {
        if (typeof anonymizePayload !== 'function') return;
        const input = [{ role: 'user', content: 'nome: Andrea, class_key=A1' }];
        const before = JSON.stringify(input);
        const out = anonymizePayload(input);
        const after = JSON.stringify(input);
        expect(after).toBe(before);
        expect(out).not.toBe(input);
    });

    it('returns empty array on non-array input (defensive)', () => {
        if (typeof anonymizePayload !== 'function') return;
        const out = anonymizePayload(null);
        expect(Array.isArray(out)).toBe(true);
        expect(out.length).toBe(0);
    });

    it('redacts emails and phone numbers in content', () => {
        if (typeof anonymizePayload !== 'function') return;
        const input = [{ role: 'user', content: 'scrivi a marro.andrea@gmail.com o chiama +39 333 1234567' }];
        const out = anonymizePayload(input);
        expect(out[0].content).not.toMatch(/marro\.andrea@gmail\.com/);
        expect(out[0].content).not.toMatch(/333 1234567/);
    });
});

describe('logTogetherCall — audit log (Sprint S iter 3 Task B1)', () => {
    function buildMockSupabase(insertResult = { data: null, error: null }) {
        const insert = vi.fn(() => Promise.resolve(insertResult));
        const from = vi.fn(() => ({ insert }));
        return { client: { from }, fromSpy: from, insertSpy: insert };
    }

    function buildEntry(overrides = {}) {
        return {
            request_kind: 'fallback',
            anonymized_payload: null,
            user_role: 'emergency',
            consent_id: undefined,
            latency_ms: 100,
            status: 'ok',
            ...overrides,
        };
    }

    it('symbol is exported (llm-client or together-fallback)', () => {
        if (importError) {
            expect.fail(`import failed: ${importError.message}`);
        }
        expect(typeof logTogetherCall).toBe('function');
    });

    it('returns a Promise', () => {
        if (typeof logTogetherCall !== 'function') return;
        const { client } = buildMockSupabase();
        const ret = logTogetherCall(client, buildEntry());
        expect(ret).toBeInstanceOf(Promise);
    });

    it('does not throw with a well-shaped mock supabase client', async () => {
        if (typeof logTogetherCall !== 'function') return;
        const { client } = buildMockSupabase();
        await expect(logTogetherCall(client, buildEntry({ user_role: 'batch', request_kind: 'wiki_ingest' }))).resolves.not.toThrow();
    });

    it('targets the together_audit_log table', async () => {
        if (typeof logTogetherCall !== 'function') return;
        const { client, fromSpy } = buildMockSupabase();
        await logTogetherCall(client, buildEntry());
        expect(fromSpy).toHaveBeenCalledWith('together_audit_log');
    });

    it('does not throw when supabase client is null/undefined (best-effort)', async () => {
        if (typeof logTogetherCall !== 'function') return;
        await expect(logTogetherCall(null, buildEntry())).resolves.not.toThrow();
        await expect(logTogetherCall(undefined, buildEntry())).resolves.not.toThrow();
    });

    it('does not throw when insert returns an error (swallows)', async () => {
        if (typeof logTogetherCall !== 'function') return;
        const { client } = buildMockSupabase({ data: null, error: { message: 'rls denied' } });
        await expect(logTogetherCall(client, buildEntry())).resolves.not.toThrow();
    });
});
