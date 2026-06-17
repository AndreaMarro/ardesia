/**
 * LLM Client Provider Switch — Integration Tests
 * Tests the unified callLLM dispatcher routing between Together AI and Gemini.
 * TDD RED phase: these tests define the expected behavior of llm-client.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We test the logic by importing the module and mocking fetch + Deno env
// Since llm-client.ts is a Deno module with Deno.env, we mock the environment

// Mock Deno global for Node/Vitest environment
const mockEnv = new Map();
if (typeof globalThis.Deno === 'undefined') {
  globalThis.Deno = {
    env: {
      get: (key) => mockEnv.get(key),
      set: (key, val) => mockEnv.set(key, val),
    },
  };
}

// We will dynamically import after setting up mocks
let callLLM, callTogether, LLM_PROVIDER_TOGETHER, LLM_PROVIDER_GEMINI;

// Helper: build a standard Together AI response
function togetherResponse(content = 'Ciao ragazzi!', model = 'meta-llama/Llama-3.3-70B-Instruct-Turbo') {
  return {
    choices: [{ message: { content } }],
    usage: { prompt_tokens: 100, completion_tokens: 30 },
    model,
  };
}

// Helper: build a standard Gemini response
function geminiResponse(text = 'Ciao ragazzi!') {
  return {
    candidates: [{ content: { parts: [{ text }] } }],
    usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 30 },
  };
}

describe('llm-client.ts — Unified LLM Dispatcher', () => {
  let originalFetch;

  beforeEach(() => {
    mockEnv.clear();
    mockEnv.set('TOGETHER_API_KEY', 'test-together-key-123');
    mockEnv.set('GEMINI_API_KEY', 'test-gemini-key-456');
    mockEnv.set('LLM_PROVIDER', 'together');
    originalFetch = globalThis.fetch;
    vi.restoreAllMocks();
    // Reviewer issue #3 (Day 01): ES module caching could mask provider-routing
    // bugs. Without resetModules, the first dynamic import caches llm-client.ts
    // and subsequent env changes (e.g. LLM_PROVIDER=gemini) might not re-read
    // Deno.env if module-level constants were introduced. resetModules forces
    // a fresh import per test so each assertion actually exercises the path
    // under the CURRENT mockEnv — no vacuous pass.
    vi.resetModules();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const baseOptions = {
    model: 'gemini-2.5-flash-lite',
    systemPrompt: 'Sei UNLIM, tutor di elettronica per bambini.',
    message: 'Ciao UNLIM!',
    maxOutputTokens: 256,
    temperature: 0.7,
  };

  describe('Provider Routing', () => {
    it('routes to Together API when LLM_PROVIDER=together and no images', async () => {
      mockEnv.set('LLM_PROVIDER', 'together');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(togetherResponse()),
      });

      // Dynamic import to pick up mocked Deno.env
      const mod = await import('../../supabase/functions/_shared/llm-client.ts');
      const result = await mod.callLLM(baseOptions);

      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
      const fetchUrl = globalThis.fetch.mock.calls[0][0];
      expect(fetchUrl).toContain('api.together.xyz');
      expect(result.text).toBe('Ciao ragazzi!');
      expect(result.tokensUsed).toEqual({ input: 100, output: 30 });
    });

    it('routes to Gemini when LLM_PROVIDER=gemini', async () => {
      mockEnv.set('LLM_PROVIDER', 'gemini');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(geminiResponse('Risposta Gemini')),
      });

      const mod = await import('../../supabase/functions/_shared/llm-client.ts');
      const result = await mod.callLLM(baseOptions);

      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
      const fetchUrl = globalThis.fetch.mock.calls[0][0];
      expect(fetchUrl).toContain('googleapis.com');
      expect(result.text).toBe('Risposta Gemini');
    });

    it('ALWAYS routes to Gemini when images are present, regardless of LLM_PROVIDER', async () => {
      mockEnv.set('LLM_PROVIDER', 'together');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(geminiResponse('Vedo il circuito!')),
      });

      const optionsWithImages = {
        ...baseOptions,
        model: 'gemini-2.5-flash',
        images: [{ base64: 'abc123', mimeType: 'image/png' }],
      };

      const mod = await import('../../supabase/functions/_shared/llm-client.ts');
      const result = await mod.callLLM(optionsWithImages);

      const fetchUrl = globalThis.fetch.mock.calls[0][0];
      expect(fetchUrl).toContain('googleapis.com');
      expect(fetchUrl).not.toContain('together');
      expect(result.text).toBe('Vedo il circuito!');
    });

    it('defaults to together when LLM_PROVIDER is not set', async () => {
      mockEnv.delete('LLM_PROVIDER');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(togetherResponse()),
      });

      const mod = await import('../../supabase/functions/_shared/llm-client.ts');
      const result = await mod.callLLM(baseOptions);

      const fetchUrl = globalThis.fetch.mock.calls[0][0];
      expect(fetchUrl).toContain('api.together.xyz');
    });
  });

  describe('Together Auto-Fallback to Gemini', () => {
    it('falls back to Gemini when Together returns 500', async () => {
      mockEnv.set('LLM_PROVIDER', 'together');

      let callCount = 0;
      globalThis.fetch = vi.fn().mockImplementation((url) => {
        callCount++;
        if (typeof url === 'string' && url.includes('together')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            text: () => Promise.resolve('Internal Server Error'),
          });
        }
        // Gemini fallback
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(geminiResponse('Gemini fallback!')),
        });
      });

      const mod = await import('../../supabase/functions/_shared/llm-client.ts');
      const result = await mod.callLLM(baseOptions);

      expect(result.text).toBe('Gemini fallback!');
      // Should have called Together first, then Gemini
      expect(callCount).toBeGreaterThanOrEqual(2);
    });

    it('falls back to Gemini when Together times out', async () => {
      mockEnv.set('LLM_PROVIDER', 'together');

      globalThis.fetch = vi.fn().mockImplementation((url) => {
        if (typeof url === 'string' && url.includes('together')) {
          // Simulate AbortError (timeout)
          const err = new DOMException('The operation was aborted', 'AbortError');
          return Promise.reject(err);
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(geminiResponse('Gemini after timeout!')),
        });
      });

      const mod = await import('../../supabase/functions/_shared/llm-client.ts');
      const result = await mod.callLLM(baseOptions);

      expect(result.text).toBe('Gemini after timeout!');
    });
  });

  describe('Response Normalization', () => {
    it('Together response has normalized shape { text, model, provider, tokensUsed, latencyMs }', async () => {
      mockEnv.set('LLM_PROVIDER', 'together');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(togetherResponse('Test normalization')),
      });

      const mod = await import('../../supabase/functions/_shared/llm-client.ts');
      const result = await mod.callLLM(baseOptions);

      expect(result).toHaveProperty('text', 'Test normalization');
      expect(result).toHaveProperty('model');
      expect(result).toHaveProperty('provider', 'together');
      expect(result).toHaveProperty('tokensUsed');
      expect(result.tokensUsed).toHaveProperty('input');
      expect(result.tokensUsed).toHaveProperty('output');
      expect(result).toHaveProperty('latencyMs');
      expect(typeof result.latencyMs).toBe('number');
    });

    it('Gemini response has same normalized shape with provider=gemini', async () => {
      mockEnv.set('LLM_PROVIDER', 'gemini');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(geminiResponse('Test Gemini shape')),
      });

      const mod = await import('../../supabase/functions/_shared/llm-client.ts');
      const result = await mod.callLLM(baseOptions);

      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('model');
      expect(result).toHaveProperty('provider', 'gemini');
      expect(result).toHaveProperty('tokensUsed');
      expect(result.tokensUsed).toHaveProperty('input');
      expect(result.tokensUsed).toHaveProperty('output');
      expect(result).toHaveProperty('latencyMs');
    });
  });

  describe('Together Request Format', () => {
    it('sends correct OpenAI-compatible format to Together', async () => {
      mockEnv.set('LLM_PROVIDER', 'together');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(togetherResponse()),
      });

      const mod = await import('../../supabase/functions/_shared/llm-client.ts');
      await mod.callLLM(baseOptions);

      const fetchCall = globalThis.fetch.mock.calls[0];
      const url = fetchCall[0];
      const opts = fetchCall[1];
      const body = JSON.parse(opts.body);

      expect(url).toBe('https://api.together.xyz/v1/chat/completions');
      expect(opts.headers['Authorization']).toBe('Bearer test-together-key-123');
      expect(body.model).toBe('meta-llama/Llama-3.3-70B-Instruct-Turbo');
      expect(body.messages).toEqual([
        { role: 'system', content: baseOptions.systemPrompt },
        { role: 'user', content: baseOptions.message },
      ]);
      expect(body.max_tokens).toBe(256);
      expect(body.temperature).toBe(0.7);
    });

    it('maps all Gemini tier models to the same Together model', async () => {
      mockEnv.set('LLM_PROVIDER', 'together');

      const models = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-pro'];

      for (const model of models) {
        globalThis.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(togetherResponse()),
        });

        const mod = await import('../../supabase/functions/_shared/llm-client.ts');
        await mod.callLLM({ ...baseOptions, model });

        const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
        expect(body.model).toBe('meta-llama/Llama-3.3-70B-Instruct-Turbo');
      }
    });
  });

  describe('Edge Cases', () => {
    it('throws when both Together and Gemini fail', async () => {
      mockEnv.set('LLM_PROVIDER', 'together');

      globalThis.fetch = vi.fn().mockImplementation(() => {
        return Promise.resolve({
          ok: false,
          status: 500,
          text: () => Promise.resolve('Server Error'),
        });
      });

      const mod = await import('../../supabase/functions/_shared/llm-client.ts');
      await expect(mod.callLLM(baseOptions)).rejects.toThrow();
    });

    it('handles empty Together response gracefully', async () => {
      mockEnv.set('LLM_PROVIDER', 'together');

      globalThis.fetch = vi.fn().mockImplementation((url) => {
        if (typeof url === 'string' && url.includes('together')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ choices: [{ message: { content: '' } }], usage: {} }),
          });
        }
        // Gemini fallback
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(geminiResponse('Fallback on empty')),
        });
      });

      const mod = await import('../../supabase/functions/_shared/llm-client.ts');
      const result = await mod.callLLM(baseOptions);
      // Should either throw or fallback - empty response should not succeed silently
      // The implementation should fallback to Gemini on empty response
      expect(result.text).toBeTruthy();
    });
  });
});
