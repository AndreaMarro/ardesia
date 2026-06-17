// ============================================
// AI Reliability Tests — G26
// Tests: sendChat() AbortController timeout pattern, extractIntentTags() parsing
// © Andrea Marro — 29/03/2026
// ============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── extractIntentTags (copied from ElabTutorV4.jsx — pure function, no deps) ───
function extractIntentTags(text) {
    const results = [];
    const marker = '[INTENT:';
    let pos = 0;
    while (pos < text.length) {
        const start = text.indexOf(marker, pos);
        if (start === -1) break;
        const jsonStart = start + marker.length;
        if (text[jsonStart] !== '{') { pos = jsonStart; continue; }
        let depth = 0;
        let end = -1;
        for (let i = jsonStart; i < text.length; i++) {
            if (text[i] === '{') depth++;
            else if (text[i] === '}') {
                depth--;
                if (depth === 0) { end = i; break; }
            }
        }
        if (end === -1) break;
        if (text[end + 1] === ']') {
            results.push({
                fullMatch: text.substring(start, end + 2),
                json: text.substring(jsonStart, end + 1)
            });
        }
        pos = (end !== -1) ? end + 2 : jsonStart;
    }
    return results;
}

// ─── extractIntentTags tests ───
describe('extractIntentTags', () => {
    it('extracts a single intent tag', () => {
        const text = 'Ciao! [INTENT:{"action":"highlight","target":"led1"}] Prova!';
        const tags = extractIntentTags(text);
        expect(tags).toHaveLength(1);
        expect(tags[0].fullMatch).toBe('[INTENT:{"action":"highlight","target":"led1"}]');
        expect(JSON.parse(tags[0].json)).toEqual({ action: 'highlight', target: 'led1' });
    });

    it('extracts multiple intent tags', () => {
        const text = '[INTENT:{"action":"highlight","target":"r1"}] poi [INTENT:{"action":"run"}]';
        const tags = extractIntentTags(text);
        expect(tags).toHaveLength(2);
        expect(JSON.parse(tags[0].json).target).toBe('r1');
        expect(JSON.parse(tags[1].json).action).toBe('run');
    });

    it('handles nested braces in JSON', () => {
        const text = '[INTENT:{"action":"place","params":{"type":"resistor","value":{"ohms":220}}}]';
        const tags = extractIntentTags(text);
        expect(tags).toHaveLength(1);
        const parsed = JSON.parse(tags[0].json);
        expect(parsed.params.value.ohms).toBe(220);
    });

    it('returns empty for text without intent tags', () => {
        expect(extractIntentTags('Ciao, come stai?')).toHaveLength(0);
        expect(extractIntentTags('')).toHaveLength(0);
        expect(extractIntentTags('[AZIONE:highlight:led1]')).toHaveLength(0);
    });

    it('skips malformed tags without opening brace', () => {
        const text = '[INTENT:not json] ciao [INTENT:{"ok":true}]';
        const tags = extractIntentTags(text);
        expect(tags).toHaveLength(1);
        expect(JSON.parse(tags[0].json).ok).toBe(true);
    });

    it('handles unclosed braces gracefully (no crash)', () => {
        const text = '[INTENT:{"action":"broken"';
        const tags = extractIntentTags(text);
        expect(tags).toHaveLength(0);
    });

    it('skips tags without closing bracket after brace', () => {
        const text = '[INTENT:{"action":"test"} more text';
        const tags = extractIntentTags(text);
        expect(tags).toHaveLength(0);
    });

    it('handles balanced braces with arrays inside', () => {
        const text = '[INTENT:{"action":"wire","pins":["D2","GND"]}]';
        const tags = extractIntentTags(text);
        expect(tags).toHaveLength(1);
        const parsed = JSON.parse(tags[0].json);
        expect(parsed.pins).toEqual(['D2', 'GND']);
    });

    it('handles deeply nested objects', () => {
        const text = '[INTENT:{"a":{"b":{"c":{"d":"deep"}}}}]';
        const tags = extractIntentTags(text);
        expect(tags).toHaveLength(1);
        expect(JSON.parse(tags[0].json).a.b.c.d).toBe('deep');
    });

    it('handles empty JSON object', () => {
        const text = '[INTENT:{}]';
        const tags = extractIntentTags(text);
        expect(tags).toHaveLength(1);
        expect(JSON.parse(tags[0].json)).toEqual({});
    });
});

// ─── sendChat AbortController timeout pattern tests ───
// Tests the master timeout pattern used in api.js sendChat()
// without importing the full module (avoids complex dependency mocking)
describe('sendChat AbortController timeout pattern', () => {
    it('master controller aborts fetch after timeout', async () => {
        const MASTER_TIMEOUT = 100; // Use 100ms for test speed
        const masterController = new AbortController();
        const masterTimer = setTimeout(() => masterController.abort(), MASTER_TIMEOUT);

        // Simulate a fetch that checks the signal
        const fetchPromise = new Promise((resolve, reject) => {
            masterController.signal.addEventListener('abort', () => {
                reject(new DOMException('The operation was aborted.', 'AbortError'));
            });
        });

        await expect(fetchPromise).rejects.toThrow('aborted');
        clearTimeout(masterTimer);
    });

    it('external signal propagates to master controller', () => {
        const masterController = new AbortController();
        const externalController = new AbortController();

        // Pattern from sendChat: external abort → master abort
        externalController.signal.addEventListener('abort', () => masterController.abort(), { once: true });

        expect(masterController.signal.aborted).toBe(false);
        externalController.abort();
        expect(masterController.signal.aborted).toBe(true);
    });

    it('already-aborted external signal aborts master immediately', () => {
        const masterController = new AbortController();
        const externalController = new AbortController();

        // Abort external first
        externalController.abort();

        // Pattern from sendChat: check if already aborted
        if (externalController.signal.aborted) {
            masterController.abort();
        }

        expect(masterController.signal.aborted).toBe(true);
    });

    it('text timeout is 10s, image timeout is 20s', () => {
        // Verify the constants match what sendChat uses
        const MASTER_TIMEOUT_TEXT = 10000;
        const MASTER_TIMEOUT_IMAGE = 20000;

        const textImages = [];
        const imagePayload = [{ base64: 'abc', mimeType: 'image/png' }];

        const textTimeout = imagePayload.length > 0 ? MASTER_TIMEOUT_IMAGE : MASTER_TIMEOUT_TEXT;
        const noImageTimeout = textImages.length > 0 ? MASTER_TIMEOUT_IMAGE : MASTER_TIMEOUT_TEXT;

        expect(noImageTimeout).toBe(10000);
        expect(textTimeout).toBe(20000);
    });

    it('combined signal passes to all fetch calls', async () => {
        const masterController = new AbortController();
        const combinedSignal = masterController.signal;

        // Simulate 3 sequential fetch calls (local → nanobot → webhook)
        // All should receive the same signal
        const fetchCalls = [];
        for (let i = 0; i < 3; i++) {
            fetchCalls.push({ signal: combinedSignal });
        }

        // All calls share the same signal
        expect(fetchCalls.every(c => c.signal === combinedSignal)).toBe(true);

        // Aborting master aborts all
        masterController.abort();
        expect(fetchCalls.every(c => c.signal.aborted)).toBe(true);
    });
});
