import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// iter 73 STEP 5 (2026-05-17): migration APPLIED prod elab-unlim.
// Renamed _DEFER_20260509010000_student_album_narrative_comics.sql.bak →
// 20260517100000_student_album_narrative_comics.sql (iter 73 timestamp).
// uuid_generate_v4() → gen_random_uuid() (prod uuid-ossp installed
// 'extensions' schema NOT default search_path).
const migrationPath = path.join(
  process.cwd(),
  'supabase/migrations/20260517100000_student_album_narrative_comics.sql',
);

describe('student album narrative migration', () => {
  it('keeps the applied migration SQL on disk with the expected schema surfaces', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');

    expect(sql).toContain('CREATE TABLE IF NOT EXISTS student_album');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS badges_catalog');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS student_badges');
    expect(sql).toContain('ALTER TABLE student_progress');
    expect(sql).toContain('narrative_map_id');
    expect(sql).toContain('comic_asset_url');
    expect(sql).toContain('CREATE OR REPLACE FUNCTION elab_award_progress_badges');
    expect(sql).toContain('CREATE TRIGGER trg_award_progress_badges');
    expect(sql).toContain('gen_random_uuid()');
  });
});
