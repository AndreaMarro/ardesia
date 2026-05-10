/**
 * Nanobot V2 — Student Memory Manager
 * Reads/writes student progress and context from Supabase DB.
 * GDPR-compliant: no PII, no raw messages, hash-based IDs only.
 * (c) Andrea Marro — 02/04/2026
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { StudentContext } from './types.ts';

let supabase: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (supabase) return supabase;
  const url = Deno.env.get('SUPABASE_URL') || Deno.env.get('ELAB_DB_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('ELAB_DB_SERVICE_KEY');
  if (!url || !key) return null;
  supabase = createClient(url, key);
  return supabase;
}

/**
 * Check if parental consent exists for a session/student.
 * Returns: 'granted' | 'revoked' | 'unknown' (no record found / DB unavailable).
 * When 'unknown', the chat should work but log a warning — consent is
 * not enforced until Supabase Auth is configured (soft check).
 */
export async function checkConsent(sessionId: string): Promise<'granted' | 'revoked' | 'unknown'> {
  const client = getClient();
  if (!client) return 'unknown';

  try {
    // Check if any consent record maps to this session
    // The parental_consents table uses student_id (not session_id),
    // so we check if there's a mapping in student_sessions → student_id → consent
    const { data: session } = await client
      .from('student_sessions')
      .select('student_id')
      .eq('session_id', sessionId)
      .limit(1)
      .single();

    if (!session?.student_id) return 'unknown';

    const { data: consent } = await client
      .from('parental_consents')
      .select('consent_given, revoked_at')
      .eq('student_id', session.student_id)
      .limit(1)
      .single();

    if (!consent) return 'unknown';
    if (consent.revoked_at) return 'revoked';
    return consent.consent_given ? 'granted' : 'revoked';
  } catch {
    return 'unknown';
  }
}

/**
 * Load student context for a session.
 * Returns null if DB is not configured (graceful degradation).
 */
export async function loadStudentContext(
  sessionId: string,
): Promise<StudentContext | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const { data: progress } = await client
      .from('student_progress')
      .select('completed_experiments, common_mistakes, level, last_experiment_id')
      .eq('session_id', sessionId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (!progress) {
      return {
        completedExperiments: 0,
        totalExperiments: 62,
        commonMistakes: [],
        lastSession: null,
        level: 'principiante',
        currentChapter: null,
      };
    }

    const { data: lastSession } = await client
      .from('student_sessions')
      .select('started_at')
      .eq('session_id', sessionId)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    const completed = progress.completed_experiments || [];
    const mistakes = progress.common_mistakes || [];

    const chapterMatch = progress.last_experiment_id?.match(/cap(\d+)/);
    const currentChapter = chapterMatch ? parseInt(chapterMatch[1], 10) : null;

    return {
      completedExperiments: completed.length,
      // iter 11 P0 #7 — Andrea audit: 94 esperimenti reali (38 Vol1 + 27 Vol2 + 29 Vol3, iter 37 +2).
      // Era hardcoded 62 → drift -32 esperimenti. CLAUDE.md "94 esperimenti in 3 volumi".
      totalExperiments: 94,
      commonMistakes: mistakes.slice(0, 5),
      lastSession: lastSession?.started_at || null,
      level: completed.length < 10 ? 'principiante'
        : completed.length < 30 ? 'intermedio'
        : 'avanzato',
      currentChapter,
    };
  } catch (err) {
    console.warn('[Memory] Failed to load student context:', err);
    return null;
  }
}

/**
 * Save session interaction — GDPR compliant.
 * NEVER stores raw user messages. Only stores:
 * - topic category (experimentId or 'general')
 * - message length (for analytics, no content)
 * - truncated AI response (first 100 chars, for continuity)
 * - model used
 */
export async function saveInteraction(
  sessionId: string,
  experimentId: string | null,
  topicCategory: string,
  responsePreview: string,
  model: string,
): Promise<void> {
  const client = getClient();
  if (!client) return;

  try {
    // Upsert session
    await client.from('student_sessions').upsert({
      session_id: sessionId,
      last_experiment_id: experimentId,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'session_id' });

    // Save lesson context — NO raw message, only topic + response preview
    if (experimentId) {
      await client.from('lesson_contexts').upsert({
        session_id: sessionId,
        experiment_id: experimentId,
        context_data: {
          topic: topicCategory,
          messageLength: 0, // Placeholder — caller can pass actual length
          responsePreview: responsePreview.slice(0, 100),
          model,
          timestamp: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'session_id,experiment_id' });
    }

    // Detect common mistakes from AI response only (not user message)
    const mistakePatterns = [
      { pattern: /polarit[aà]/i, mistake: 'polarità LED' },
      { pattern: /resist(ore|enza).*manca|senza resist/i, mistake: 'resistore mancante' },
      { pattern: /corto.?circuito/i, mistake: 'corto circuito' },
      { pattern: /bruciat/i, mistake: 'componente bruciato' },
      { pattern: /non.*collega|scollega/i, mistake: 'connessione mancante' },
    ];

    const detectedMistakes: string[] = [];
    for (const { pattern, mistake } of mistakePatterns) {
      // Only check AI response, not user message (GDPR: no raw message access)
      if (pattern.test(responsePreview)) {
        detectedMistakes.push(mistake);
      }
    }

    if (detectedMistakes.length > 0) {
      const { data: existing } = await client
        .from('student_progress')
        .select('common_mistakes')
        .eq('session_id', sessionId)
        .single();

      const allMistakes = [...new Set([
        ...(existing?.common_mistakes || []),
        ...detectedMistakes,
      ])].slice(0, 10);

      await client.from('student_progress').upsert({
        session_id: sessionId,
        common_mistakes: allMistakes,
        last_experiment_id: experimentId,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'session_id' });
    }
  } catch (err) {
    console.warn('[Memory] Save failed:', err);
  }
}
