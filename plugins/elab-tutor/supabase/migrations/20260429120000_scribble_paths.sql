-- ============================================
-- Scribble Paths — Lavagna drawingPaths cross-device sync
-- Sprint T iter 28 — Bug 3 (drawingPaths persist via Supabase)
--
-- Currently DrawingOverlay paths are saved only in localStorage
-- (per-device, per-browser). When the docente switches device
-- (Mac at home → LIM in classe), drawings are lost.
--
-- This table mirrors the localStorage `elab-drawing-<expId>` bucket
-- to Supabase so paths follow the experiment cross-device.
--
-- Conflict resolution: last-write-wins on (experiment_id, user_id).
-- A heavier 3-way CRDT merge is OUT-OF-SCOPE iter 28 — Andrea iter 29+
-- decides if needed (multi-docente collab non è caso d'uso primario).
--
-- Class-virtuale pattern (no Supabase Auth required):
-- user_id is nullable; row scoped via experiment_id + class_key
-- on application layer. RLS aperte come altre tabelle ELAB iter 21+.
--
-- DO NOT apply via `supabase db push` without Andrea OK.
-- This migration is SCAFFOLDED, NOT deployed.
-- ============================================

-- Table
CREATE TABLE IF NOT EXISTS scribble_paths (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id   TEXT NOT NULL,                 -- 'v1-cap6-esp1' or 'paths' for sandbox
    user_id         UUID,                          -- nullable: class-virtuale anon UUID OK
    class_key       TEXT,                          -- nullable: matches localStorage class_key
    paths           JSONB NOT NULL DEFAULT '[]'::jsonb,  -- array of {points,color,width,isEraser}
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- one row per (experiment, user) — last-write-wins via UPSERT
    CONSTRAINT scribble_paths_exp_user_unique UNIQUE (experiment_id, user_id)
);

-- Indexes for typical access patterns
CREATE INDEX IF NOT EXISTS idx_scribble_paths_exp_updated
  ON scribble_paths (experiment_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_scribble_paths_class_exp
  ON scribble_paths (class_key, experiment_id);

CREATE INDEX IF NOT EXISTS idx_scribble_paths_paths_gin
  ON scribble_paths USING GIN (paths);

-- Trigger to maintain updated_at on every UPDATE
CREATE OR REPLACE FUNCTION scribble_paths_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS scribble_paths_updated_at_trg ON scribble_paths;
CREATE TRIGGER scribble_paths_updated_at_trg
  BEFORE UPDATE ON scribble_paths
  FOR EACH ROW
  EXECUTE FUNCTION scribble_paths_set_updated_at();

-- Comments
COMMENT ON TABLE scribble_paths IS
  'Lavagna SVG annotation strokes per experiment, mirrored from '
  'localStorage `elab-drawing-<experimentId>` bucket. Last-write-wins '
  'on (experiment_id, user_id). Used by services/drawingSync.js.';
COMMENT ON COLUMN scribble_paths.paths IS
  'JSONB array of {points: "x1,y1 x2,y2 ...", color, width, isEraser}. '
  'Same shape as DrawingOverlay paths state.';
COMMENT ON COLUMN scribble_paths.user_id IS
  'Nullable to support class-virtuale pattern (anon UUID from localStorage). '
  'When NULL, rows are still scoped via class_key + experiment_id at app layer.';

-- RLS — aperte come altre tabelle ELAB iter 21+
-- (class-virtuale pattern, no Supabase Auth required)
ALTER TABLE scribble_paths ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'scribble_paths' AND policyname = 'anon_all_open'
    ) THEN
        CREATE POLICY anon_all_open
            ON scribble_paths
            FOR ALL
            TO anon, authenticated
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'scribble_paths' AND policyname = 'service_role_all'
    ) THEN
        CREATE POLICY service_role_all
            ON scribble_paths
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- GRANT (mirror altre tabelle iter 21+)
GRANT SELECT, INSERT, UPDATE, DELETE ON scribble_paths TO anon, authenticated;
