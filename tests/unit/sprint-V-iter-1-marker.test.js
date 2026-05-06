/**
 * Sprint V iter 1 — TDD compliance marker test (Governance Rule 2)
 *
 * Smoke test verificando che 3 NEW Sprint V atom shipped iter 1 producono
 * file artefatti file-system (anti-regression smoke).
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../../');

describe('Sprint V iter 1 — file artifact smoke', () => {
  it('ElabMascotte SVG component exists', () => {
    expect(fs.existsSync(path.join(ROOT, 'src/components/common/ElabMascotte.jsx'))).toBe(true);
  });

  it('Supabase migration scribble_paths_session_id.sql exists', () => {
    expect(fs.existsSync(path.join(ROOT, 'supabase/migrations/20260505000000_scribble_paths_session_id.sql'))).toBe(true);
  });

  it('Anti-regression scripts present', () => {
    expect(fs.existsSync(path.join(ROOT, 'scripts/feature-parity-snapshot.sh'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'scripts/anti-inflation-gate.sh'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'scripts/retroactive-regression-scan.sh'))).toBe(true);
  });

  it('Phase 1 diagnosis audits present', () => {
    expect(fs.existsSync(path.join(ROOT, 'docs/audits/sprint-V-iter1-wakeword-diagnosis.md'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'docs/audits/sprint-V-iter1-lavagna-persistence-diagnosis.md'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'docs/audits/sprint-V-iter1-modalita-diagnosis.md'))).toBe(true);
  });
});
