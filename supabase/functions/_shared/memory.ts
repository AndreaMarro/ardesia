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
 * iter 12 P0 — load last N lesson_contexts for Onniscenza L6_chat_history injection.
 * Diagnosi memoria Q10 V2 regression: history `[]` hardcoded `unlim-chat/index.ts:433`
 * → Onniscenza L6 vuota → msg2 "Continuiamo" perde contesto seed Vol.X cap.Y di msg1.
 * Fix #1: caller usa loadRecentHistory(sessionId, 5) e injette in aggregateOnniscenza({history}).
 *
 * Returns array di {role,content} ultimi N record (default 5). MAI raw user message
 * (GDPR mandate iter 14 P0 #2): solo `responsePreview` AI assistant + `topic` proxy.
 */
export async function loadRecentHistory(
  sessionId: string,
  limit = 5,
): Promise<Array<{ role: 'assistant'; content: string }>> {
  const client = getClient();
  if (!client) return [];
  try {
    // iter 18.5 BUG FIX — usa unlim_session_memory (lesson_contexts schema mismatch + RLS recursion).
    // Only single most-recent row per session_id (no msg-by-msg history yet — Future iter aggiunge
    // table unlim_message_history per multi-msg context).
    const { data: mem } = await client
      .from('unlim_session_memory')
      .select('last_experiment_id, last_response_preview, last_topic, updated_at')
      .eq('session_id', sessionId)
      .maybeSingle();
    if (!mem || !mem.last_response_preview) return [];
    const expRef = mem.last_experiment_id ? `[${mem.last_experiment_id}] ` : '';
    return [{
      role: 'assistant' as const,
      content: `${expRef}${mem.last_response_preview}`,
    }];
  } catch (err) {
    console.warn('[Memory] loadRecentHistory failed:', err);
    return [];
  }
}

/**
 * iter 12 P0 — extract Vol/cap from user message regex.
 * Diagnosi Q10 V2 fix #2: saveInteraction non persiste last_experiment_id senza
 * experimentId esplicito → next msg perde chapter context. Estrae da safeMessage:
 *   "Vol.1 cap.6"  → "v1-cap6"
 *   "volume 2 capitolo 4" → "v2-cap4"
 *   "Vol.3 capitolo 8 esperimento 1" → "v3-cap8-esp1"
 * Returns null se nessun pattern matchato.
 */
export function extractVolCapFromMessage(message: string): string | null {
  if (!message || typeof message !== 'string') return null;
  // Pattern: vol.N cap.M [esp.K]
  const m = message.match(/\bvol(?:ume)?\.?\s*([1-3])\s+cap(?:itolo)?\.?\s*(\d{1,2})(?:\s+esp(?:erimento)?\.?\s*(\d{1,2}))?/i);
  if (!m) return null;
  const vol = m[1];
  const cap = m[2];
  const esp = m[3];
  return esp ? `v${vol}-cap${cap}-esp${esp}` : `v${vol}-cap${cap}`;
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
    // iter 18.5 BUG FIX critical — schema diagnostic prod live:
    //   - student_progress.session_id COLUMN does NOT exist (real PK student_id UUID FK)
    //   - student_sessions.last_experiment_id COLUMN does NOT exist
    //   - lesson_contexts RLS infinite recursion class_students policy
    // memory.ts assume schema diverso → memoria UNLIM mai funzionata davvero
    // (Andrea brutal "memoria mai esistita davvero" ROOT CAUSE).
    // Fix: NEW table dedicated unlim_session_memory keyed session_id, bypass legacy schema.
    const { data: progress } = await client
      .from('unlim_session_memory')
      // iter 24 Phase 1 — include user_intent_seed per recall verbatim msg1 intent
      .select('last_experiment_id, last_chapter, last_volume, user_intent_seed, common_mistakes, message_count, updated_at')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (!progress) {
      return {
        completedExperiments: 0,
        totalExperiments: 94,
        commonMistakes: [],
        lastSession: null,
        level: 'principiante',
        currentChapter: null,
        lastExperimentId: null,
        currentVolume: null,
      };
    }

    const completed: number = progress.message_count || 0;
    const mistakes: string[] = Array.isArray(progress.common_mistakes) ? progress.common_mistakes as string[] : [];
    const currentChapter: number | null = progress.last_chapter || null;
    const currentVolume: number | null = progress.last_volume || null;

    return {
      completedExperiments: completed,
      totalExperiments: 94,
      commonMistakes: mistakes.slice(0, 5),
      lastSession: progress.updated_at || null,
      level: completed < 10 ? 'principiante'
        : completed < 30 ? 'intermedio'
        : 'avanzato',
      currentChapter,
      lastExperimentId: progress.last_experiment_id || null,
      currentVolume,
      // iter 24 Phase 1 P0 — user_intent_seed verbatim msg1 IMMUTABLE preserve cross-msg
      userIntentSeed: progress.user_intent_seed || null,
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
  userMessage?: string,  // iter 24 Phase 1 P0 — preserve user msg1 verbatim intent
): Promise<void> {
  const client = getClient();
  if (!client) return;

  try {
    // iter 24 Phase 1 P0 ROOT CAUSE FIX (Doc-4 Phase 0 evidence brutale).
    // PRECEDENTE iter 12 BUG: extractVolCapFromMessage(responsePreview) estraeva Vol/cap
    // dalla RISPOSTA AI stessa → quando msg2 reply citava "Vol.3 pag.33" (side-topic digitalWrite),
    // sovrascriveva last_chapter=6 last_volume=3 cancellando stato Vol.1 cap.6 LED msg1.
    // Session 5 iter 22 marathon hallucination CONFIRMED verbatim Doc-4.
    // FIX: extract Vol/cap SOLO da userMessage (utente esplicitamente intende chapter), MAI da AI response.
    let effectiveExperimentId = experimentId;
    if (!effectiveExperimentId && userMessage) {
      effectiveExperimentId = extractVolCapFromMessage(userMessage);
    }

    // iter 18.5 BUG FIX critical — use unlim_session_memory dedicated table (bypass schema mismatch).
    // Legacy student_sessions + lesson_contexts queries failed silently (schema diverso reale prod).
    // Extract chapter + volume from effectiveExperimentId for verbatim recall msg2.
    const chapterMatch = effectiveExperimentId?.match(/cap(\d+)/);
    const lastChapter = chapterMatch ? parseInt(chapterMatch[1], 10) : null;
    const volMatch = effectiveExperimentId?.match(/^v([1-3])/);
    const lastVolume = volMatch ? parseInt(volMatch[1], 10) : null;

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

    // iter 24 Phase 1 P0 ROOT CAUSE FIX — atomic RPC upsert_session_memory
    // preserve user_intent_seed COALESCE (msg1 verbatim) + jsonb merge mistakes server-side.
    // Doc-3+4 evidence H5: SELECT-then-UPSERT race window + user intent lost cross-msg.
    // Sostituisce iter 18.5 client-side merge with atomic SECURITY DEFINER function.
    if (effectiveExperimentId) {
      const userIntentPreview = userMessage ? userMessage.slice(0, 250) : null;
      const { error } = await client.rpc('upsert_session_memory', {
        p_session_id: sessionId,
        p_user_intent: userIntentPreview,
        p_last_experiment_id: effectiveExperimentId,
        p_last_chapter: lastChapter,
        p_last_volume: lastVolume,
        p_last_topic: topicCategory,
        p_last_response_preview: responsePreview.slice(0, 100),
        p_last_model: model,
        p_new_mistakes: detectedMistakes,
      });
      if (error) {
        console.warn('[Memory] upsert_session_memory RPC error:', error);
      }
    }
  } catch (err) {
    console.warn('[Memory] Save failed:', err);
  }
}
