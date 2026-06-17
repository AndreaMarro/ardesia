/**
 * ELAB Together AI Fallback — VPS GPU resilience layer
 * Sprint S iter 1 — 2026-04-26
 *
 * Purpose: provide gated fallback to Together AI when EU primary providers
 * (RunPod / Hetzner VPS GPU + Gemini EU) are down or degraded.
 *
 * Strategy chain (per Andrea Sprint 5 canUseTogether design):
 *   Primary:    RunPod / Hetzner VPS GPU (EU GDPR-clean)
 *      ↓ (if down OR latency >5s OR error)
 *   Fallback 1: Gemini EU (existing, transitional)
 *      ↓ (if down)
 *   Fallback 2: Together AI gated (emergency_anonymized only)
 *      - Requires: 2+ EU providers down
 *      - Mode: anonymized payload (no PII, no class_id, no student_name)
 *      - Audit: every call logged to together_audit_log Supabase table
 *
 * GDPR safety:
 *   - Student runtime BLOCKED unless emergency + anonymized
 *   - Teacher batch + lesson_prep modes OK with consent
 *   - Together AI region US — sensitive data must NEVER reach
 *
 * Wire-up steps (Sprint S iter 3+):
 *   1. Add TOGETHER_API_KEY to Supabase secrets (Andrea)
 *   2. Apply migration: together_audit_log table
 *   3. Wire callLLM chain in unlim-chat handler
 *   4. Add feature flag VITE_TOGETHER_FALLBACK_ENABLED (default false)
 *   5. Production canary 5% → monitor 7d → flip default
 *
 * Test plan:
 *   - Stub VPS GPU 503 → verify Gemini EU fallback engages
 *   - Stub Gemini EU 503 → verify Together AI gated path
 *   - Verify anonymization: payload to Together has no PII
 *   - Verify audit log entry per call
 *
 * (c) Andrea Marro — Sprint S iter 1 fallback prep
 */

import type { ChatMessage, ChatResponse } from '../src/types/chat'; // adjust path

// === Provider configuration ===
interface ProviderConfig {
    name: 'runpod' | 'hetzner' | 'gemini-eu' | 'together';
    endpoint: string;
    apiKey: string;
    region: 'EU' | 'US';
    gdprSafe: boolean;
    maxLatencyMs: number;
    requiresAnonymization: boolean;
}

const PROVIDERS: Record<string, ProviderConfig> = {
    runpod: {
        name: 'runpod',
        endpoint: process.env.VPS_GPU_URL || 'https://gpu.elabtutor.school',
        apiKey: process.env.ELAB_GPU_API_KEY || '',
        region: 'EU',
        gdprSafe: true,
        maxLatencyMs: 5000,
        requiresAnonymization: false,
    },
    'gemini-eu': {
        name: 'gemini-eu',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta',
        apiKey: process.env.GEMINI_API_KEY || '',
        region: 'EU',
        gdprSafe: true,
        maxLatencyMs: 8000,
        requiresAnonymization: false,
    },
    together: {
        name: 'together',
        endpoint: 'https://api.together.xyz/v1',
        apiKey: process.env.TOGETHER_API_KEY || '',
        region: 'US',
        gdprSafe: false,
        maxLatencyMs: 10000,
        requiresAnonymization: true,
    },
};

// === Anonymization (GDPR critical) ===
function anonymize(messages: ChatMessage[]): ChatMessage[] {
    return messages.map(m => ({
        ...m,
        content: m.content
            // Remove names (rough heuristic — production needs proper NER)
            .replace(/(?:nome|nick|alunno|studente)\s*[:=]\s*[\w\s]+/gi, '[NAME_REDACTED]')
            // Remove class IDs
            .replace(/\bclass[_-]?id\s*[:=]\s*[\w-]+/gi, '[CLASS_ID_REDACTED]')
            // Remove emails
            .replace(/\b[\w.-]+@[\w.-]+\.[a-z]{2,}\b/gi, '[EMAIL_REDACTED]')
            // Remove phones
            .replace(/\+?\d{10,13}/g, '[PHONE_REDACTED]')
            // Remove specific Italian PII patterns
            .replace(/\b(?:codice fiscale|CF)\s*[:=]\s*[A-Z0-9]{16}/gi, '[CF_REDACTED]'),
    }));
}

// === Provider call wrappers ===
async function callRunPod(messages: ChatMessage[]): Promise<ChatResponse> {
    const cfg = PROVIDERS.runpod;
    const res = await fetch(`${cfg.endpoint}/v1/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Elab-Api-Key': cfg.apiKey,
        },
        body: JSON.stringify({
            model: 'qwen2.5vl:7b',
            messages,
            stream: false,
            options: { temperature: 0.7 },
        }),
        signal: AbortSignal.timeout(cfg.maxLatencyMs),
    });
    if (!res.ok) throw new Error(`runpod ${res.status}`);
    return await res.json();
}

async function callGeminiEu(messages: ChatMessage[]): Promise<ChatResponse> {
    const cfg = PROVIDERS['gemini-eu'];
    const res = await fetch(`${cfg.endpoint}/models/gemini-2.0-flash:generateContent?key=${cfg.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: messages.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
            })),
        }),
        signal: AbortSignal.timeout(cfg.maxLatencyMs),
    });
    if (!res.ok) throw new Error(`gemini-eu ${res.status}`);
    return await res.json();
}

async function callTogether(messages: ChatMessage[]): Promise<ChatResponse> {
    const cfg = PROVIDERS.together;

    // GDPR critical: anonymize before send
    const safe = cfg.requiresAnonymization ? anonymize(messages) : messages;

    const res = await fetch(`${cfg.endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cfg.apiKey}`,
        },
        body: JSON.stringify({
            model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
            messages: safe,
            temperature: 0.7,
        }),
        signal: AbortSignal.timeout(cfg.maxLatencyMs),
    });
    if (!res.ok) throw new Error(`together ${res.status}`);

    // Audit log (Supabase together_audit_log table)
    await logTogetherCall({
        provider: 'together',
        anonymized: cfg.requiresAnonymization,
        latency_ms: 0, // computed by caller
        status: res.status,
        emergency_reason: 'eu_providers_down',
    });

    return await res.json();
}

async function logTogetherCall(entry: any): Promise<void> {
    // Stub — Sprint S iter 3+ wires real Supabase insert
    console.log('[together_audit_log]', JSON.stringify(entry));
}

// === Main fallback chain ===
export async function callLLMWithFallback(
    messages: ChatMessage[],
    options: { canUseTogether?: boolean; mode?: 'student' | 'teacher_batch' | 'lesson_prep' } = {},
): Promise<ChatResponse> {
    const errors: string[] = [];

    // Try primary VPS GPU (RunPod)
    try {
        return await callRunPod(messages);
    } catch (err: any) {
        errors.push(`runpod: ${err.message}`);
    }

    // Try Gemini EU
    try {
        return await callGeminiEu(messages);
    } catch (err: any) {
        errors.push(`gemini-eu: ${err.message}`);
    }

    // Together AI gated fallback
    const canUseTogether =
        options.canUseTogether === true &&
        errors.length >= 2 && // 2+ EU providers down
        options.mode !== 'student'; // student runtime blocked

    if (canUseTogether) {
        try {
            return await callTogether(messages);
        } catch (err: any) {
            errors.push(`together: ${err.message}`);
        }
    } else if (options.mode === 'student' && errors.length >= 2) {
        throw new Error(
            `EU providers down + student mode = no fallback. ` +
            `Showing offline message to user. Errors: ${errors.join('; ')}`
        );
    }

    throw new Error(`All providers failed: ${errors.join('; ')}`);
}

// === Production wire-up checklist (Sprint S iter 3+) ===
/*
[ ] Andrea: provide TOGETHER_API_KEY (free tier $25 credit)
[ ] Migration: CREATE TABLE together_audit_log (...)
[ ] Wire callLLM in supabase/functions/unlim-chat/index.ts
[ ] Feature flag VITE_TOGETHER_FALLBACK_ENABLED in .env (default false)
[ ] Test stub: VPS_GPU_URL=invalid + GEMINI_API_KEY=invalid → verify Together
[ ] Test anonymization: send messages with email/CF → verify redacted
[ ] Test audit log: verify insert into together_audit_log per call
[ ] Production canary: feature flag 5% → monitor 7d → 100%
[ ] GDPR DPO sign-off: anonymization sufficient for emergency-only US transit
*/
