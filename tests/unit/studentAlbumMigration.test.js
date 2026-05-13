import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// iter 41 cleanup A5 — migration file intentionally deferred (renamed to
// `_DEFER_20260509010000_student_album_narrative_comics.sql.bak` in
// supabase/migrations/). The SQL contents are intact and reviewable; the
// migration is held back from Supabase apply until the album narrative
// pipeline ships. This test is marked todo to surface the deferred state
// without failing the suite. Restore to `it(...)` and rename the file to
// `20260509010000_student_album_narrative_comics.sql` when applying.
const migrationPath = path.join(
  process.cwd(),
  'supabase/migrations/_DEFER_20260509010000_student_album_narrative_comics.sql.bak',
);

describe('student album narrative migration', () => {
  it.todo('defines server-side album, progress, badge and comic metadata surfaces');

  it('keeps the deferred migration SQL on disk with the expected schema surfaces', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');

    expect(sql).toContain('CREATE TABLE IF NOT EXISTS student_album');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS badges_catalog');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS student_badges');
    expect(sql).toContain('ALTER TABLE student_progress');
    expect(sql).toContain('narrative_map_id');
    expect(sql).toContain('comic_asset_url');
    expect(sql).toContain('CREATE OR REPLACE FUNCTION elab_award_progress_badges');
    expect(sql).toContain('CREATE TRIGGER trg_award_progress_badges');
  });
});
