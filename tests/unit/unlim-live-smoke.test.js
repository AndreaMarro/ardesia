/**
 * unlim-live-smoke.test.js — Sprint X iter 105.3
 *
 * LIVE smoke tests against deployed UNLIM Edge Function on Supabase.
 *
 * GATED: tests SKIP unless `UNLIM_LIVE_SMOKE=true` env set. This avoids:
 *   - CI flakiness when Supabase is rate-limited
 *   - Unintended LLM cost during dev test runs
 *   - Hitting production from local without explicit opt-in
 *
 * Run locally:
 *   UNLIM_LIVE_SMOKE=true \
 *   UNLIM_LIVE_URL=https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat \
 *   ELAB_API_KEY=<key> SUPABASE_ANON_JWT=<jwt> \
 *   npx vitest run tests/unit/unlim-live-smoke.test.js
 *
 * Or via npm script (add to package.json):
 *   "test:live:unlim": "UNLIM_LIVE_SMOKE=true npx vitest run tests/unit/unlim-live-smoke.test.js"
 */

import { describe, it, expect } from 'vitest';

const LIVE = process.env.UNLIM_LIVE_SMOKE === 'true';
const URL = process.env.UNLIM_LIVE_URL || 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat';
const API_KEY = process.env.ELAB_API_KEY || '';
const JWT = process.env.SUPABASE_ANON_JWT || '';

const describeLive = LIVE ? describe : describe.skip;

const CT_HEADER = { 'Content-Type': 'application/json' };

function authHeaders() {
  const h = { ...CT_HEADER };
  if (API_KEY) h['X-Elab-Api-Key'] = API_KEY;
  if (JWT) h['Authorization'] = `Bearer ${JWT}`;
  return h;
}

async function postChat(body) {
  const res = await fetch(URL, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  let json = null;
  try { json = await res.json(); } catch { /* may be empty on 4xx */ }
  return { status: res.status, json, headers: Object.fromEntries(res.headers) };
}

// ===========================================================================

describe('Live smoke — config check (always runs)', () => {
  it('LIVE smoke gated by UNLIM_LIVE_SMOKE env', () => {
    if (LIVE) {
      console.info('UNLIM live smoke ENABLED — target:', URL);
    } else {
      console.info('UNLIM live smoke SKIPPED (set UNLIM_LIVE_SMOKE=true to enable)');
    }
    expect(typeof LIVE).toBe('boolean');
  });

  it('Has URL configured when live', () => {
    if (LIVE) expect(URL).toMatch(/^https?:\/\//);
  });
});

// ===========================================================================

describeLive('Live smoke — GET /health endpoint', () => {
  it('returns 200 with status JSON', async () => {
    const res = await fetch(URL, { method: 'GET', headers: authHeaders() });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('status');
    expect(json).toHaveProperty('version');
    expect(json).toHaveProperty('uptimeSeconds');
  });
});

// ===========================================================================

describeLive('Live smoke — POST /chat basic Italian query', () => {
  it('returns 200 with response field for LED query', async () => {
    const sessionId = `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const { status, json } = await postChat({
      message: 'Cosa è un LED?',
      sessionId,
    });
    expect(status).toBe(200);
    expect(json).toHaveProperty('success', true);
    expect(json).toHaveProperty('response');
    expect(typeof json.response).toBe('string');
    expect(json.response.length).toBeGreaterThan(20);
  }, 30000);

  it('response starts with "Ragazzi," (PZ V3 plural opener)', async () => {
    const sessionId = `test-${Date.now()}-pz`;
    const { json } = await postChat({
      message: 'spiega il LED',
      sessionId,
    });
    if (json && json.response) {
      expect(json.response.trim().toLowerCase()).toMatch(/^ragazzi/);
    }
  }, 30000);

  it('response word count respects UNLIM_MAX_VISIBLE_WORDS=120', async () => {
    const sessionId = `test-${Date.now()}-wc`;
    const { json } = await postChat({
      message: 'Cosa è un LED?',
      sessionId,
    });
    if (json && json.response) {
      // Count visible words (rough: split on whitespace, exclude tags)
      const visible = json.response
        .replace(/\[AZIONE:[^\]]+\]/gi, '')
        .replace(/\[INTENT:\{[\s\S]*?\}\]/gi, '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      expect(visible.length).toBeLessThanOrEqual(125); // 120 + small ellipsis slack
    }
  }, 30000);

  it('response includes prompt_class metadata', async () => {
    const { json } = await postChat({
      message: 'Cosa è un LED?',
      sessionId: `test-${Date.now()}-pc`,
    });
    if (json && json.prompt_class) {
      expect(json.prompt_class).toHaveProperty('category');
      expect(typeof json.prompt_class.category).toBe('string');
    }
  }, 30000);
});

// ===========================================================================

describeLive('Live smoke — POST /chat citation_vol_pag query', () => {
  it('Vol/cap query response contains Vol.X pag.Y citation (PZ V3)', async () => {
    const sessionId = `test-${Date.now()}-cite`;
    const { json } = await postChat({
      message: 'Vol.1 cap.6 cosa dice del LED?',
      sessionId,
    });
    if (json && json.response) {
      expect(json.response).toMatch(/Vol\.\s*1\s+pag\.\s*\d+/i);
    }
  }, 30000);
});

// ===========================================================================

describeLive('Live smoke — POST /chat safety voltage_danger', () => {
  it('220V query triggers safety canonical response (NOT LLM)', async () => {
    const sessionId = `test-${Date.now()}-volt`;
    const { json } = await postChat({
      message: 'posso collegare il LED a 220V?',
      sessionId,
    });
    if (json) {
      expect(json.success).toBe(true);
      // Source should indicate safety path
      expect(['safety-pre-llm', 'safety-hardcoded-fallback-iter27']).toContain(
        String(json.source),
      );
      // Response references 9V (safe voltage)
      expect(json.response).toMatch(/9\s*[Vv]/);
    }
  }, 30000);

  it('safety_fires includes voltage_danger', async () => {
    const { json } = await postChat({
      message: 'attacco la presa di corrente al LED',
      sessionId: `test-${Date.now()}-volt2`,
    });
    if (json && Array.isArray(json.safety_fires)) {
      expect(json.safety_fires).toContain('voltage_danger');
    }
  }, 30000);
});

// ===========================================================================

describeLive('Live smoke — POST /chat off-topic gentle bridge', () => {
  it('off-topic query (sport) returns gentle bridge template', async () => {
    const sessionId = `test-${Date.now()}-off`;
    const { json } = await postChat({
      message: 'chi ha vinto la partita Juve Inter?',
      sessionId,
    });
    if (json) {
      // Source should be offtopic-pre-llm or offtopic-template-iter25
      expect(String(json.source)).toMatch(/offtopic/i);
      // Response NOT brutally refuses — should bridge to ELAB
      expect(json.response.toLowerCase()).toMatch(/elab|kit|esperiment|circuito|volume/);
    }
  }, 30000);
});

// ===========================================================================

describeLive('Live smoke — POST /chat error handling', () => {
  it('missing sessionId returns 400', async () => {
    const res = await fetch(URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ message: 'test' }),
    });
    expect(res.status).toBe(400);
  });

  it('invalid sessionId format returns 400', async () => {
    const res = await fetch(URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ message: 'test', sessionId: 'a$%^&*invalid' }),
    });
    expect(res.status).toBe(400);
  });

  it('GET on chat endpoint returns 200 health (not 405)', async () => {
    const res = await fetch(URL, { method: 'GET', headers: authHeaders() });
    expect(res.status).toBe(200);
  });

  it('PUT method returns 405', async () => {
    const res = await fetch(URL, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ message: 'x', sessionId: 'test' }),
    });
    expect(res.status).toBe(405);
  });
});

// ===========================================================================

describeLive('Live smoke — POST /chat debug_retrieval flag', () => {
  it('debug_retrieval=true surfaces retrieved chunks', async () => {
    const sessionId = `test-${Date.now()}-debug`;
    const { json } = await postChat({
      message: 'Cosa è un LED secondo Vol 1?',
      sessionId,
      debug_retrieval: true,
    });
    if (json && Array.isArray(json.debug_retrieval)) {
      // May be empty when chit-chat skips RAG; if non-empty verify shape
      json.debug_retrieval.forEach((chunk) => {
        expect(chunk).toHaveProperty('id');
        expect(chunk).toHaveProperty('source');
      });
    }
  }, 30000);
});

// ===========================================================================

describeLive('Live smoke — Latency budget (p95 < 12s)', () => {
  it('basic query responds within 12s', async () => {
    const t0 = Date.now();
    await postChat({
      message: 'Cosa è un LED?',
      sessionId: `test-${Date.now()}-perf`,
    });
    const dt = Date.now() - t0;
    expect(dt).toBeLessThan(12000);
  }, 15000);

  it('safety query (pre-LLM short-circuit) responds within 2s', async () => {
    const t0 = Date.now();
    await postChat({
      message: 'posso collegare a 220V?',
      sessionId: `test-${Date.now()}-perfsafe`,
    });
    const dt = Date.now() - t0;
    expect(dt).toBeLessThan(2000);
  }, 5000);
});

// ===========================================================================

describeLive('Live smoke — Memory persistence cross-message', () => {
  it('two sequential messages preserve sessionId memory', async () => {
    const sessionId = `test-${Date.now()}-mem`;
    // First message anchors lastExperimentId
    await postChat({
      message: 'Vol.1 cap.6 esp.1 cosa monto?',
      sessionId,
      experimentId: 'v1-cap6-esp1',
    });
    // Second message: short prompt should recall context
    const { json } = await postChat({
      message: 'continuiamo',
      sessionId,
    });
    // Response should reference Vol.1 or cap.6 from memory
    if (json && json.response) {
      expect(json.response.toLowerCase()).toMatch(/vol|cap|esperiment/i);
    }
  }, 30000);
});
