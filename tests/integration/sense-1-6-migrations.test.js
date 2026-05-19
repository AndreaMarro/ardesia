/**
 * ADR-049 Sense 1.6 Atom 1 — migration schema validation tests
 *
 * Iter 64 entrance dispatch (Andrea ratify gruppo 3 4/4 SI 2026-05-15 PM).
 *
 * Scope:
 *   - 4 migration files presence + naming convention (timestamp + descriptive)
 *   - Schema correctness via SQL parsing (CREATE TABLE + RLS + GRANT + INDEX)
 *   - RLS Pattern S1 open client-side (`USING (true) WITH CHECK (true)`)
 *   - GRANT ALL to anon + authenticated (existing iter 14 pattern)
 *   - Indices coverage: anon_uuid lookups + class_key + session_id
 *
 * Strategy: NO actual DB call (Atom 1 explicit constraint NO apply prod —
 *   Andrea ratify gate iter 65+ entrance). SQL text parsing only.
 *
 * Sub-processor list verify: +4 entries `public/sub-processors.md` con flag
 *   [STATUS: pending UI deploy iter 66+] (Q5 ratify iter 64).
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const MIGRATIONS_DIR = resolve(process.cwd(), 'supabase/migrations');
const SUB_PROCESSORS_MD = resolve(process.cwd(), 'public/sub-processors.md');

const SENSE_1_6_TABLES = [
  'teacher_history_log',
  'class_session_metadata',
  'voice_movement_log',
  'errore_ricorrente_pattern',
];

function findMigrationFile(tableName) {
  const files = readdirSync(MIGRATIONS_DIR);
  return files.find((f) => f.endsWith(`_${tableName}.sql`));
}

function readMigrationFor(tableName) {
  const file = findMigrationFile(tableName);
  if (!file) return null;
  return readFileSync(join(MIGRATIONS_DIR, file), 'utf-8');
}

describe('ADR-049 Sense 1.6 Atom 1 — migration files presence', () => {
  it('migrations directory exists', () => {
    expect(existsSync(MIGRATIONS_DIR)).toBe(true);
  });

  it.each(SENSE_1_6_TABLES)('migration file present for %s', (table) => {
    const file = findMigrationFile(table);
    expect(file, `migration file for ${table} not found in ${MIGRATIONS_DIR}`).toBeTruthy();
  });

  it('all 4 Sense 1.6 migrations present (count check)', () => {
    const found = SENSE_1_6_TABLES.map(findMigrationFile).filter(Boolean);
    expect(found).toHaveLength(4);
  });

  it.each(SENSE_1_6_TABLES)('%s migration uses timestamp naming convention', (table) => {
    const file = findMigrationFile(table);
    // Pattern: YYYYMMDDHHMMSS_<descriptive>.sql (14 digits)
    expect(file).toMatch(/^\d{14}_.+\.sql$/);
  });
});

describe('ADR-049 Sense 1.6 Atom 1 — schema correctness (SQL parsing)', () => {
  it.each(SENSE_1_6_TABLES)('%s — CREATE TABLE statement present', (table) => {
    const sql = readMigrationFor(table);
    expect(sql).toBeTruthy();
    expect(sql).toMatch(new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`, 'i'));
  });

  it.each(SENSE_1_6_TABLES)('%s — UUID PRIMARY KEY with gen_random_uuid()', (table) => {
    const sql = readMigrationFor(table);
    expect(sql).toMatch(/id UUID PRIMARY KEY DEFAULT gen_random_uuid\(\)/);
  });

  it.each(SENSE_1_6_TABLES)('%s — created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()', (table) => {
    const sql = readMigrationFor(table);
    expect(sql).toMatch(/created_at TIMESTAMPTZ NOT NULL DEFAULT NOW\(\)/);
  });
});

describe('ADR-049 Sense 1.6 Atom 1 — table-specific schema fields', () => {
  it('teacher_history_log — required columns per ADR-049 §3.1', () => {
    const sql = readMigrationFor('teacher_history_log');
    expect(sql).toMatch(/teacher_anon_uuid UUID NOT NULL/);
    expect(sql).toMatch(/session_id UUID NOT NULL/);
    expect(sql).toMatch(/experiment_id TEXT/);
    expect(sql).toMatch(/concepts_explained TEXT\[\]/);
    expect(sql).toMatch(/errors_encountered TEXT\[\]/);
    expect(sql).toMatch(/consent_version TEXT NOT NULL/);
  });

  it('class_session_metadata — required columns per ADR-049 §3.2', () => {
    const sql = readMigrationFor('class_session_metadata');
    expect(sql).toMatch(/class_key TEXT NOT NULL/);
    expect(sql).toMatch(/tempo_disponibile_min INT NOT NULL DEFAULT 40/);
    expect(sql).toMatch(/livello_autonomia TEXT NOT NULL DEFAULT 'lead'/);
    expect(sql).toMatch(/materiale_presente JSONB NOT NULL DEFAULT '\{\}'/);
    expect(sql).toMatch(/narrative_position TEXT/);
  });

  it('voice_movement_log — required columns per ADR-049 §3.3', () => {
    const sql = readMigrationFor('voice_movement_log');
    expect(sql).toMatch(/session_id UUID NOT NULL/);
    expect(sql).toMatch(/voice_event_type TEXT/);
    expect(sql).toMatch(/voice_payload JSONB/);
    expect(sql).toMatch(/movement_paths JSONB/);
    expect(sql).toMatch(/movement_intensity FLOAT/);
    expect(sql).toMatch(/zone_preferred TEXT\[\]/);
  });

  it('errore_ricorrente_pattern — required columns per ADR-049 §3.4', () => {
    const sql = readMigrationFor('errore_ricorrente_pattern');
    expect(sql).toMatch(/teacher_anon_uuid UUID NOT NULL/);
    expect(sql).toMatch(/pattern_signature TEXT NOT NULL/);
    expect(sql).toMatch(/detected_count INT NOT NULL DEFAULT 1/);
    expect(sql).toMatch(/first_detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW\(\)/);
    expect(sql).toMatch(/last_detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW\(\)/);
  });
});

describe('ADR-049 Sense 1.6 Atom 1 — RLS Pattern S1 (open client-side)', () => {
  it.each(SENSE_1_6_TABLES)('%s — ENABLE ROW LEVEL SECURITY', (table) => {
    const sql = readMigrationFor(table);
    expect(sql).toMatch(new RegExp(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`, 'i'));
  });

  it.each(SENSE_1_6_TABLES)('%s — CREATE POLICY FOR ALL USING (true) WITH CHECK (true)', (table) => {
    const sql = readMigrationFor(table);
    expect(sql).toMatch(/CREATE POLICY/i);
    expect(sql).toMatch(/FOR ALL USING \(true\) WITH CHECK \(true\)/);
  });

  it.each(SENSE_1_6_TABLES)('%s — GRANT ALL TO anon, authenticated', (table) => {
    const sql = readMigrationFor(table);
    expect(sql).toMatch(new RegExp(`GRANT ALL ON ${table} TO anon, authenticated`, 'i'));
  });
});

describe('ADR-049 Sense 1.6 Atom 1 — indices strategy', () => {
  it('teacher_history_log — anon_uuid + chapter_lookup indices', () => {
    const sql = readMigrationFor('teacher_history_log');
    expect(sql).toMatch(/CREATE INDEX[\s\S]*?idx_thl_teacher_uuid[\s\S]*?ON teacher_history_log\(teacher_anon_uuid\)/i);
    expect(sql).toMatch(/CREATE INDEX[\s\S]*?idx_thl_chapter_lookup[\s\S]*?ON teacher_history_log\(teacher_anon_uuid, vol, chapter\)/i);
  });

  it('class_session_metadata — class_key + session_id composite index', () => {
    const sql = readMigrationFor('class_session_metadata');
    expect(sql).toMatch(/CREATE INDEX[\s\S]*?idx_csm_class_session[\s\S]*?ON class_session_metadata\(class_key, session_id\)/i);
  });

  it('voice_movement_log — session_id index (retention 90d access pattern)', () => {
    const sql = readMigrationFor('voice_movement_log');
    expect(sql).toMatch(/CREATE INDEX[\s\S]*?idx_vml_session[\s\S]*?ON voice_movement_log\(session_id\)/i);
  });

  it('errore_ricorrente_pattern — anon_uuid + signature composite index', () => {
    const sql = readMigrationFor('errore_ricorrente_pattern');
    expect(sql).toMatch(/CREATE INDEX[\s\S]*?idx_erp_teacher_signature[\s\S]*?ON errore_ricorrente_pattern\(teacher_anon_uuid, pattern_signature\)/i);
  });
});

describe('ADR-050 Atom 0 §2.4 — sub-processor list +4 entries', () => {
  it('public/sub-processors.md exists (canonical fonte iter 64+)', () => {
    expect(existsSync(SUB_PROCESSORS_MD)).toBe(true);
  });

  it.each(SENSE_1_6_TABLES)('sub-processor entry present for %s', (table) => {
    const md = readFileSync(SUB_PROCESSORS_MD, 'utf-8');
    expect(md).toContain(table);
  });

  it('Q5 ratify flag [STATUS: pending UI deploy iter 66+] present for Sense 1.6 entries', () => {
    const md = readFileSync(SUB_PROCESSORS_MD, 'utf-8');
    expect(md).toMatch(/\[STATUS: pending UI deploy iter 66\+\]/);
  });

  it('retention 24 mesi declared per Q4 ratify (teacher_history_log + class_session_metadata + errore_ricorrente_pattern)', () => {
    const md = readFileSync(SUB_PROCESSORS_MD, 'utf-8');
    // 3 occurrences for 24m retention (voice_movement_log uses 90d)
    const matches = md.match(/24 mesi/g) || [];
    expect(matches.length).toBeGreaterThanOrEqual(3);
  });

  it('voice_movement_log retention 90 giorni (proporzionalità GDPR)', () => {
    const md = readFileSync(SUB_PROCESSORS_MD, 'utf-8');
    expect(md).toMatch(/90 giorni/);
  });

  it('RLS Pattern S1 declared in sub-processor table', () => {
    const md = readFileSync(SUB_PROCESSORS_MD, 'utf-8');
    // 4 occurrences (one per Sense 1.6 table)
    const matches = md.match(/Pattern S1/g) || [];
    expect(matches.length).toBeGreaterThanOrEqual(4);
  });
});

describe('ADR-049 Atom 1 — deploy gate iter 65+ (NO apply prod iter 64)', () => {
  it.each(SENSE_1_6_TABLES)('%s migration declares deploy gate comment', (table) => {
    const sql = readMigrationFor(table);
    // Each migration documents "NO supabase db push --linked iter 64" gate
    // Pattern is informational only — comment block at top
    expect(sql).toMatch(/iter 6[45]/i);
  });
});
