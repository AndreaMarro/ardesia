/**
 * compile-proxy CORS allowlist — Sprint T iter 29 Task 29.5 (BUG-29-01).
 *
 * Extracted from `index.ts` for testability: the index.ts imports from
 * `https://deno.land/std@0.208.0/http/server.ts` (Deno-only URL spec) which
 * Vite cannot resolve under vitest. Pure helpers with NO Deno-specific
 * dependencies live here so tests can dynamic-import them.
 *
 * Vercel preview URL pattern (project: andreas-projects-6d4e9791):
 *   https://elab-tutor-<branch-slug>-andreas-projects-6d4e9791.vercel.app
 *
 * Examples that MUST match:
 *   - https://elab-tutor-git-e2e-bypass-preview-andreas-projects-6d4e9791.vercel.app
 *   - https://elab-tutor-abc123-andreas-projects-6d4e9791.vercel.app
 *
 * Examples that MUST NOT match:
 *   - https://evil.example.com
 *   - https://elab-tutor-malicious.vercel.app (missing andreas-projects suffix)
 *   - https://other-tutor-foo-andreas-projects-6d4e9791.vercel.app
 */

export const CORS_ALLOWED_ORIGINS = [
  'https://www.elabtutor.school',
  'https://elabtutor.school',
  'https://elab-builder.vercel.app',
  'https://elab-tutor.it',
  'https://www.elab-tutor.it',
  'http://localhost:5173',
  'http://localhost:3000',
];

export const VERCEL_PREVIEW_REGEX =
  /^https:\/\/elab-tutor-.*-andreas-projects-6d4e9791\.vercel\.app$/;

export function isLoopbackDevOrigin(origin: string | null | undefined): boolean {
  if (!origin) return false;

  try {
    const url = new URL(origin);
    const port = Number.parseInt(url.port, 10);
    const isLoopbackHost =
      url.hostname === 'localhost' || url.hostname === '127.0.0.1';

    return (
      url.protocol === 'http:' &&
      isLoopbackHost &&
      Number.isInteger(port) &&
      port >= 1024 &&
      port <= 65535
    );
  } catch {
    return false;
  }
}

export function isOriginAllowed(origin: string | null | undefined): boolean {
  if (!origin) return false;
  if (CORS_ALLOWED_ORIGINS.includes(origin)) return true;
  if (isLoopbackDevOrigin(origin)) return true;
  if (VERCEL_PREVIEW_REGEX.test(origin)) return true;
  return false;
}
