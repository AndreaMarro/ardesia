/**
 * compile-proxy CORS allowlist regression — Sprint T iter 29 Task 29.5.
 *
 * BUG-29-01 (P0): browser fetch from Vercel preview deployments
 * (`https://elab-tutor-<branch-slug>-andreas-projects-6d4e9791.vercel.app`)
 * was blocked by static origin allowlist. Regex-based allowlist now matches
 * any preview URL under the `andreas-projects-6d4e9791` Vercel project.
 *
 * This test verifies the gate logic in
 * `supabase/functions/compile-proxy/cors.ts` — pure helpers, no Deno deps,
 * dynamic-imported to avoid Vite resolving the deno.land URL in `index.ts`.
 *
 * Coverage:
 *   - Prod origins (2): elabtutor.school + www.elabtutor.school
 *   - Vercel preview (regex match): branch-specific URL pattern
 *   - Hostile origins (blocked): evil.example.com + lookalikes
 *   - Null/empty/undefined inputs
 */

import { describe, it, expect, beforeAll } from 'vitest';

let CORS_ALLOWED_ORIGINS;
let VERCEL_PREVIEW_REGEX;
let isLoopbackDevOrigin;
let isOriginAllowed;

beforeAll(async () => {
  const mod = await import('../../supabase/functions/compile-proxy/cors.ts');
  CORS_ALLOWED_ORIGINS = mod.CORS_ALLOWED_ORIGINS;
  VERCEL_PREVIEW_REGEX = mod.VERCEL_PREVIEW_REGEX;
  isLoopbackDevOrigin = mod.isLoopbackDevOrigin;
  isOriginAllowed = mod.isOriginAllowed;
});

describe('compile-proxy CORS allowlist (BUG-29-01)', () => {
  describe('CORS_ALLOWED_ORIGINS static list', () => {
    it('includes prod elabtutor.school (apex + www)', () => {
      expect(CORS_ALLOWED_ORIGINS).toContain('https://www.elabtutor.school');
      expect(CORS_ALLOWED_ORIGINS).toContain('https://elabtutor.school');
    });

    it('includes localhost dev origins', () => {
      expect(CORS_ALLOWED_ORIGINS).toContain('http://localhost:5173');
      expect(CORS_ALLOWED_ORIGINS).toContain('http://localhost:3000');
    });
  });

  describe('VERCEL_PREVIEW_REGEX pattern', () => {
    it('matches the e2e-bypass-preview branch URL', () => {
      const url =
        'https://elab-tutor-git-e2e-bypass-preview-andreas-projects-6d4e9791.vercel.app';
      expect(VERCEL_PREVIEW_REGEX.test(url)).toBe(true);
    });

    it('matches a hash-based preview URL', () => {
      const url =
        'https://elab-tutor-abc123-andreas-projects-6d4e9791.vercel.app';
      expect(VERCEL_PREVIEW_REGEX.test(url)).toBe(true);
    });

    it('rejects vercel.app URLs missing the andreas-projects suffix', () => {
      const url = 'https://elab-tutor-malicious.vercel.app';
      expect(VERCEL_PREVIEW_REGEX.test(url)).toBe(false);
    });

    it('rejects URLs with a different project slug', () => {
      const url =
        'https://other-tutor-foo-andreas-projects-6d4e9791.vercel.app';
      expect(VERCEL_PREVIEW_REGEX.test(url)).toBe(false);
    });

    it('rejects http (not https) preview URLs', () => {
      const url =
        'http://elab-tutor-foo-andreas-projects-6d4e9791.vercel.app';
      expect(VERCEL_PREVIEW_REGEX.test(url)).toBe(false);
    });
  });

  describe('isOriginAllowed gate', () => {
    it('allows prod origin', () => {
      expect(isOriginAllowed('https://www.elabtutor.school')).toBe(true);
      expect(isOriginAllowed('https://elabtutor.school')).toBe(true);
    });

    it('allows Vercel preview branch URL via regex', () => {
      const previewUrl =
        'https://elab-tutor-git-e2e-bypass-preview-andreas-projects-6d4e9791.vercel.app';
      expect(isOriginAllowed(previewUrl)).toBe(true);
    });

    it('allows loopback dev origins on arbitrary Vite ports', () => {
      expect(isLoopbackDevOrigin('http://127.0.0.1:5177')).toBe(true);
      expect(isLoopbackDevOrigin('http://localhost:5177')).toBe(true);
      expect(isOriginAllowed('http://127.0.0.1:5177')).toBe(true);
      expect(isOriginAllowed('http://localhost:4173')).toBe(true);
    });

    it('blocks hostile origins', () => {
      expect(isOriginAllowed('https://evil.example.com')).toBe(false);
      expect(isOriginAllowed('https://elabtutor.school.attacker.com')).toBe(false);
      expect(isOriginAllowed('http://127.0.0.1.evil.com:5177')).toBe(false);
      expect(isOriginAllowed('http://localhost.attacker.test:5177')).toBe(false);
      expect(isOriginAllowed('https://127.0.0.1:5177')).toBe(false);
      expect(isOriginAllowed('http://127.0.0.1:80')).toBe(false);
    });

    it('blocks null/empty/undefined inputs', () => {
      expect(isOriginAllowed(null)).toBe(false);
      expect(isOriginAllowed(undefined)).toBe(false);
      expect(isOriginAllowed('')).toBe(false);
    });
  });
});
