/**
 * T1-009 Tea Autoflow — governance file validation
 * Verifica che CODEOWNERS e workflow siano corretti e coerenti.
 * No external YAML parser needed — validates structure via regex.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(__dirname, '../../..');

describe('T1-009: Tea Autoflow governance files', () => {
  describe('CODEOWNERS', () => {
    const codeownersPath = resolve(ROOT, '.github/CODEOWNERS');

    it('file exists', () => {
      expect(existsSync(codeownersPath)).toBe(true);
    });

    it('has valid format (no empty owner lines)', () => {
      const content = readFileSync(codeownersPath, 'utf-8');
      const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        expect(parts.length).toBeGreaterThanOrEqual(2);
        expect(parts[parts.length - 1]).toMatch(/^@/);
      }
    });

    it('protects engine files with @AndreaMarro', () => {
      const content = readFileSync(codeownersPath, 'utf-8');
      expect(content).toContain('src/components/simulator/engine/');
      expect(content).toContain('@AndreaMarro');
    });

    it('protects package.json and vite.config.js', () => {
      const content = readFileSync(codeownersPath, 'utf-8');
      expect(content).toContain('package.json');
      expect(content).toContain('vite.config.js');
    });

    it('lists safe paths (docs, styles, tests, common, dashboard)', () => {
      const content = readFileSync(codeownersPath, 'utf-8');
      expect(content).toContain('docs/');
      expect(content).toContain('src/styles/');
      expect(content).toContain('tests/');
      expect(content).toContain('src/components/common/');
      expect(content).toContain('src/components/dashboard/');
    });
  });

  describe('tea-auto-merge workflow', () => {
    const workflowPath = resolve(ROOT, '.github/workflows/tea-auto-merge.yml');

    it('file exists', () => {
      expect(existsSync(workflowPath)).toBe(true);
    });

    it('has valid YAML structure (name field present)', () => {
      const content = readFileSync(workflowPath, 'utf-8');
      expect(content).toMatch(/^name:\s+Tea Auto-Merge/m);
    });

    it('triggers on pull_request', () => {
      const content = readFileSync(workflowPath, 'utf-8');
      expect(content).toMatch(/on:\s*\n\s+pull_request:/m);
    });

    it('has check-safe-paths and auto-merge jobs', () => {
      const content = readFileSync(workflowPath, 'utf-8');
      expect(content).toContain('check-safe-paths:');
      expect(content).toContain('auto-merge:');
    });

    it('filters by TeaLeaBabbalea and tea-autoflow label', () => {
      const content = readFileSync(workflowPath, 'utf-8');
      expect(content).toContain('TeaLeaBabbalea');
      expect(content).toContain('tea-autoflow');
    });

    it('blocks critical paths (engine, api, config)', () => {
      const content = readFileSync(workflowPath, 'utf-8');
      expect(content).toContain('simulator/engine');
      expect(content).toContain('api\\.js');
      expect(content).toContain('vite\\.config\\.js');
    });

    it('auto-merge depends on check-safe-paths', () => {
      const content = readFileSync(workflowPath, 'utf-8');
      expect(content).toMatch(/needs:\s*check-safe-paths/);
    });
  });

  describe('Tea quickstart guide', () => {
    const guidePath = resolve(ROOT, 'docs/tea/TEA-QUICKSTART.md');

    it('file exists', () => {
      expect(existsSync(guidePath)).toBe(true);
    });

    it('mentions safe paths and tea-autoflow label', () => {
      const content = readFileSync(guidePath, 'utf-8');
      expect(content).toContain('docs/');
      expect(content).toContain('src/styles/');
      expect(content).toContain('tests/');
      expect(content).toContain('tea-autoflow');
    });

    it('warns about off-limits engine areas', () => {
      const content = readFileSync(guidePath, 'utf-8');
      expect(content).toContain('engine');
      expect(content).toContain('OFF-LIMITS');
    });

    it('includes ELAB design conventions', () => {
      const content = readFileSync(guidePath, 'utf-8');
      expect(content).toContain('#1E4D8C');
      expect(content).toContain('ElabIcons');
      expect(content).toContain('44x44px');
    });
  });
});
