import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const LOOPBACK_COMPILE_ORIGINS = [
  'http://localhost:8000',
  'http://127.0.0.1:8000',
];

function readProjectFile(path) {
  return readFileSync(join(ROOT, path), 'utf8');
}

function getHtmlCspConnectSrc(html) {
  const match = html.match(
    /<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i,
  );
  expect(match?.[1]).toBeTruthy();
  const connectSrc = match[1].match(/connect-src\s+([^;]+)/)?.[1] || '';
  return connectSrc.split(/\s+/).filter(Boolean);
}

function getHeadersCspConnectSrc(headers) {
  const line = headers
    .split('\n')
    .find((entry) => entry.trim().startsWith('Content-Security-Policy:'));
  expect(line).toBeTruthy();
  const connectSrc = line.match(/connect-src\s+([^;]+)/)?.[1] || '';
  return connectSrc.split(/\s+/).filter(Boolean);
}

function getVercelCspConnectSrc(vercelJson) {
  const config = JSON.parse(vercelJson);
  const cspHeader = config.headers
    ?.flatMap((entry) => entry.headers || [])
    .find((header) => header.key === 'Content-Security-Policy');
  expect(cspHeader?.value).toBeTruthy();
  const connectSrc = cspHeader.value.match(/connect-src\s+([^;]+)/)?.[1] || '';
  return connectSrc.split(/\s+/).filter(Boolean);
}

describe('compile local dev CSP allowlist', () => {
  it('allows the local Arduino compile server from index.html CSP', () => {
    const connectSrc = getHtmlCspConnectSrc(readProjectFile('index.html'));
    expect(connectSrc).toEqual(expect.arrayContaining(LOOPBACK_COMPILE_ORIGINS));
  });

  it('allows the local Arduino compile server from deployed _headers CSP', () => {
    const connectSrc = getHeadersCspConnectSrc(readProjectFile('public/_headers'));
    expect(connectSrc).toEqual(expect.arrayContaining(LOOPBACK_COMPILE_ORIGINS));
  });

  it('allows the local Arduino compile server from Vercel deployed headers', () => {
    const connectSrc = getVercelCspConnectSrc(readProjectFile('vercel.json'));
    expect(connectSrc).toEqual(expect.arrayContaining(LOOPBACK_COMPILE_ORIGINS));
  });

  it('does not allow direct n8n compile from deployed CSP headers', () => {
    const vercelConnectSrc = getVercelCspConnectSrc(readProjectFile('vercel.json'));
    const headersConnectSrc = getHeadersCspConnectSrc(readProjectFile('public/_headers'));
    expect(vercelConnectSrc).not.toContain('https://n8n.srv1022317.hstgr.cloud');
    expect(headersConnectSrc).not.toContain('https://n8n.srv1022317.hstgr.cloud');
  });

  it('routes HTTPS browser compile through Supabase compile proxy before direct compile endpoints', () => {
    const apiSource = readProjectFile('src/services/api.js');
    const proxyBranch = apiSource.indexOf('if (httpsBrowser && COMPILE_PROXY_URL)');
    const directBranch = apiSource.indexOf('if (COMPILE_URL && !(httpsBrowser && isDirectN8nCompileUrl(COMPILE_URL)))');

    expect(apiSource).toContain('const COMPILE_PROXY_URL');
    expect(apiSource).toContain('isDirectN8nCompileUrl(COMPILE_WEBHOOK)');
    expect(proxyBranch).toBeGreaterThan(-1);
    expect(directBranch).toBeGreaterThan(-1);
    expect(proxyBranch).toBeLessThan(directBranch);
  });
});
