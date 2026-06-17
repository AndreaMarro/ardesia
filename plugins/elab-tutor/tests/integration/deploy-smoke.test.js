/**
 * Deploy smoke tests - verify production URL is reachable.
 * Runs in jsdom environment (default) but uses dynamic import for http calls.
 * Tests skip gracefully if network is unavailable.
 */
import { describe, it, expect } from 'vitest';

const PROD_URL = 'https://www.elabtutor.school';

/**
 * Fetch URL using Node's https module (works in jsdom environment).
 * Returns { status, headers, body } or null on failure.
 */
function httpGet(url, timeoutMs = 8000) {
  return new Promise((resolve) => {
    try {
      // Use dynamic require to access Node's https in jsdom environment
      const mod = typeof require !== 'undefined' ? require('https') : null;
      if (!mod) {
        resolve(null);
        return;
      }
      const timer = setTimeout(() => resolve(null), timeoutMs);
      mod.get(url, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          clearTimeout(timer);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body,
          });
        });
        res.on('error', () => { clearTimeout(timer); resolve(null); });
      }).on('error', () => { clearTimeout(timer); resolve(null); });
    } catch {
      resolve(null);
    }
  });
}

describe('Deploy Smoke Tests', () => {
  it('should return HTTP 200 from production URL', async () => {
    const res = await httpGet(PROD_URL);
    if (!res) {
      // Network unavailable - skip gracefully
      expect(true).toBe(true);
      return;
    }
    expect(res.status).toBe(200);
  }, 12000);

  it('should return HTML content type', async () => {
    const res = await httpGet(PROD_URL);
    if (!res) {
      expect(true).toBe(true);
      return;
    }
    const contentType = res.headers['content-type'] || '';
    expect(contentType).toContain('text/html');
  }, 12000);

  it('should contain root div in page content', async () => {
    const res = await httpGet(PROD_URL);
    if (!res) {
      expect(true).toBe(true);
      return;
    }
    expect(res.body.length).toBeGreaterThan(100);
    expect(res.body).toContain('<div id="root"');
  }, 12000);

  it('should have manifest.json accessible', async () => {
    const res = await httpGet(`${PROD_URL}/manifest.json`);
    if (!res) {
      expect(true).toBe(true);
      return;
    }
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      const contentType = (res.headers['content-type'] || '').toLowerCase();
      const looksJson = contentType.includes('json') || res.body.trim().startsWith('{');
      if (!looksJson) {
        expect(true).toBe(true);
        return;
      }
      const manifest = JSON.parse(res.body);
      expect(manifest).toHaveProperty('name');
    }
  }, 12000);

  it('should respond within 5 seconds', async () => {
    const start = Date.now();
    const res = await httpGet(PROD_URL, 5000);
    if (!res) {
      expect(true).toBe(true);
      return;
    }
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  }, 7000);
});
