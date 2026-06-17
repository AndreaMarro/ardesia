/**
 * CSP inline-script hash drift guard.
 *
 * The stale-precache safety-net is an inline <script> in index.html. Vercel
 * sends a strict CSP header with `script-src 'self' 'sha256-...'`. If the
 * inline script body is edited but the hash in vercel.json is not updated,
 * the browser blocks it from running → the safety-net never fires → users
 * stuck on stale chunks (Andrea 2026-05-28 PM regression).
 *
 * This test recomputes the SHA-256 of every inline runnable script in
 * index.html and asserts each digest is allow-listed in vercel.json's CSP
 * header. JSON-LD blocks (`type="application/ld+json"`) are skipped because
 * CSP `script-src` does not apply to non-runnable script types.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { describe, it, expect } from 'vitest';

const ROOT = join(__dirname, '..', '..');

function extractInlineRunnableScripts(html) {
  const re = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/g;
  const scripts = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1] || '';
    const body = m[2];
    if (/\bsrc\s*=/.test(attrs)) continue;          // external script
    if (/\btype\s*=\s*["']application\/ld\+json/i.test(attrs)) continue; // JSON-LD data
    scripts.push(body);
  }
  return scripts;
}

describe('CSP inline-script hash drift guard', () => {
  it('every inline runnable script in index.html has matching sha256 hash in vercel.json CSP', () => {
    const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
    const vercelCfg = readFileSync(join(ROOT, 'vercel.json'), 'utf8');

    const scripts = extractInlineRunnableScripts(html);
    expect(scripts.length).toBeGreaterThan(0); // sanity: at least one inline runnable script

    const digests = scripts.map((body) =>
      createHash('sha256').update(body, 'utf8').digest('base64')
    );

    for (const digest of digests) {
      const token = `sha256-${digest}`;
      expect(
        vercelCfg.includes(token),
        `CSP in vercel.json missing hash for inline script body — expected token '${token}'. ` +
          `Without this hash the browser CSP blocks the stale-precache safety-net.`
      ).toBe(true);
    }
  });
});
