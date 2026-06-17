-- ============================================
-- ELAB Tutor — Auth con Chiave Classe (senza Supabase Auth)
-- Il docente inserisce una chiave univoca → accesso RLS.
-- Lo student_id e un UUID locale (browser-generated).
-- (c) Andrea Marro — 04/04/2026
-- ============================================

-- 1. Aggiungi class_key alle tabelle che ne hanno bisogno
ALTER TABLE student_sessions ADD COLUMN IF NOT EXISTS class_key TEXT;
ALTER TABLE student_progress ADD COLUMN IF NOT EXISTS class_key TEXT;
ALTER TABLE mood_reports ADD COLUMN IF NOT EXISTS class_key TEXT;
ALTER TABLE nudges ADD COLUMN IF NOT EXISTS class_key TEXT;
ALTER TABLE lesson_contexts ADD COLUMN IF NOT EXISTS class_key TEXT;
ALTER TABLE confusion_reports ADD COLUMN IF NOT EXISTS class_key TEXT;

-- 2. Crea indici per class_key
CREATE INDEX IF NOT EXISTS idx_sessions_class_key ON student_sessions(class_key);
CREATE INDEX IF NOT EXISTS idx_progress_class_key ON student_progress(class_key);

-- 3. Rimuovi vincoli FK su auth.users (che non usiamo)
-- NOTA: Esegui solo se le tabelle hanno FK su auth.users
-- ALTER TABLE student_sessions DROP CONSTRAINT IF EXISTS student_sessions_student_id_fkey;
-- ALTER TABLE student_progress DROP CONSTRAINT IF EXISTS student_progress_student_id_fkey;

-- 4. Cambia student_id da UUID FK a TEXT (UUID locale browser)
ALTER TABLE student_sessions ALTER COLUMN student_id DROP NOT NULL;
ALTER TABLE student_sessions ALTER COLUMN student_id TYPE TEXT USING student_id::TEXT;
ALTER TABLE student_progress ALTER COLUMN student_id TYPE TEXT USING student_id::TEXT;

-- 5. RLS Policies per accesso con anon key + class_key
-- Permetti INSERT a tutti (anon) — il class_key nel payload filtra i dati
ALTER TABLE student_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

-- Policy: chiunque con anon key puo inserire (il class_key viene dal client)
CREATE POLICY IF NOT EXISTS "anon_insert_sessions" ON student_sessions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "anon_select_sessions" ON student_sessions
  FOR SELECT TO anon USING (true);

CREATE POLICY IF NOT EXISTS "anon_insert_progress" ON student_progress
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "anon_select_progress" ON student_progress
  FOR SELECT TO anon USING (true);

-- NOTA: Queste policy sono PERMISSIVE perche il filtro avviene nel client.
-- Per produzione, usare una Edge Function con JWT personalizzato.
-- Per ora, il class_key agisce come filtro logico, non di sicurezza.
