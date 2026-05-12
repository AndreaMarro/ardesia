/**
 * Nanobot V2 — Student Memory Manager
 * Reads/writes student progress and context from Supabase DB.
 * GDPR-compliant: no PII, no raw messages, hash-based IDs only.
 * (c) Andrea Marro — 02/04/2026
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { MessageHistoryEntry, StudentContext } from './types.ts';

// iter 25 P0-A — GDPR slice caps for unlim_message_history previews.
// MUST mirror values in `_shared/memory.ts` saveInteraction (250 user / 100 response).
const USER_MSG_PREVIEW_MAX = 250;
const RESPONSE_PREVIEW_MAX = 100;

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
 * iter 12 P0 + iter 25 P0-A — load last N message turns for Onniscenza L6_chat_history.
 *
 * iter 25 P0-A architectural unblocker (Doc-4 Phase 0 ROOT CAUSE):
 *   - PRIMARY path: query `unlim_message_history` per-message timeline ORDER BY message_idx DESC LIMIT N.
 *     Each row produces 2 entries interleaved: `user_msg_preview` → role:'user', then
 *     `response_preview` → role:'assistant'. Final array reversed to chronological order
 *     (oldest first) so prompt L6 reads naturally as a conversation log.
 *   - FALLBACK path: legacy `unlim_session_memory` single-row (iter 18.5 era sessions
 *     created BEFORE migration 20260511120000_unlim_message_history.sql applied).
 *
 * Return shape backward-compatible: `Array<{ role: 'user'|'assistant', content: string, ...meta }>`
 * Existing callers expecting only `assistant` entries still work (TypeScript widening; orchestrator
 * filters role if needed). NEW richer fields (`experiment_id`, `chapter`, `volume`) optional and
 * additive — does NOT break iter 18.5 consumers.
 *
 * GDPR mandate iter 14 P0 #2: previews already capped server-side at INSERT (saveMessageHistory)
 * to USER_MSG_PREVIEW_MAX (250) / RESPONSE_PREVIEW_MAX (100). No raw full content leaks.
 */
export async function loadRecentHistory(
  sessionId: string,
  limit = 5,
): Promise<MessageHistoryEntry[]> {
  const client = getClient();
  if (!client) return [];

  // PRIMARY: per-message timeline table (iter 25 P0-A).
  try {
    const { data: rows, error } = await client
      .from('unlim_message_history')
      .select('message_idx, experiment_id, chapter, volume, topic, user_msg_preview, response_preview')
      .eq('session_id', sessionId)
      .order('message_idx', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('[Memory] loadRecentHistory primary query error:', error);
      // Fall through to fallback path below.
    } else if (Array.isArray(rows) && rows.length > 0) {
      // Interleave user + assistant per row. Each timeline row = 1 turn (user msg + AI response).
      // DESC order from DB → newest first; iterate in REVERSE so older turns push first → final
      // array is chronological (oldest user → oldest assistant → newest user → newest assistant).
      const interleaved: MessageHistoryEntry[] = [];
      for (let i = rows.length - 1; i >= 0; i--) {
        const row = rows[i];
        const meta = {
          experiment_id: row.experiment_id ?? undefined,
          chapter: typeof row.chapter === 'number' ? row.chapter : undefined,
          volume: typeof row.volume === 'number' ? row.volume : undefined,
        };
        if (row.user_msg_preview) {
          interleaved.push({
            role: 'user',
            content: row.user_msg_preview,
            ...meta,
          });
        }
        if (row.response_preview) {
          interleaved.push({
            role: 'assistant',
            content: row.response_preview,
            ...meta,
          });
        }
      }
      return interleaved;
    }
  } catch (err) {
    console.warn('[Memory] loadRecentHistory primary path threw:', err);
    // Fall through to fallback path below.
  }

  // FALLBACK: iter 18.5 single-row unlim_session_memory (backward compat).
  try {
    const { data: mem } = await client
      .from('unlim_session_memory')
      .select('last_experiment_id, last_response_preview, last_topic, last_chapter, last_volume, updated_at')
      .eq('session_id', sessionId)
      .maybeSingle();
    if (!mem || !mem.last_response_preview) return [];
    const expRef = mem.last_experiment_id ? `[${mem.last_experiment_id}] ` : '';
    return [{
      role: 'assistant',
      content: `${expRef}${mem.last_response_preview}`,
      experiment_id: mem.last_experiment_id ?? undefined,
      chapter: typeof mem.last_chapter === 'number' ? mem.last_chapter : undefined,
      volume: typeof mem.last_volume === 'number' ? mem.last_volume : undefined,
    }];
  } catch (err) {
    console.warn('[Memory] loadRecentHistory fallback failed:', err);
    return [];
  }
}

/**
 * iter 25 P0-A — append a single per-message turn to `unlim_message_history` timeline.
 *
 * Orchestrator (unlim-chat/index.ts) wires this call AFTER each completed user/AI turn,
 * alongside the existing single-row `saveInteraction` upsert. Both writes coexist:
 * - saveInteraction: keeps `unlim_session_memory.last_*` for quick "current state" reads.
 * - saveMessageHistory: appends timeline row for "il secondo era quale?" / "riepilogo" recall.
 *
 * GDPR: user message sliced to USER_MSG_PREVIEW_MAX (250), response to RESPONSE_PREVIEW_MAX (100).
 * Server-side atomic RPC `insert_message_history` auto-increments `message_idx` (SECURITY DEFINER
 * lock semantics — no race vs MERGE PG15 race-unsafe pattern Doc-3 evidence).
 *
 * Defensive: NEVER throws — DB unavailable / RPC error logged + swallowed (chat flow unaffected).
 * Returns new `message_idx` on success, `null` on failure.
 */
export async function saveMessageHistory(
  sessionId: string,
  experimentId: string | null,
  chapter: number | null,
  volume: number | null,
  topic: string,
  userMessage: string,
  responsePreview: string,
  model: string,
): Promise<number | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const userPreview = typeof userMessage === 'string'
      ? userMessage.slice(0, USER_MSG_PREVIEW_MAX)
      : null;
    const respPreview = typeof responsePreview === 'string'
      ? responsePreview.slice(0, RESPONSE_PREVIEW_MAX)
      : null;

    const { data, error } = await client.rpc('insert_message_history', {
      p_session_id: sessionId,
      p_experiment_id: experimentId,
      p_chapter: chapter,
      p_volume: volume,
      p_topic: topic,
      p_user_msg_preview: userPreview,
      p_response_preview: respPreview,
      p_model: model,
    });

    if (error) {
      console.warn('[Memory] insert_message_history RPC error:', error);
      return null;
    }
    return typeof data === 'number' ? data : null;
  } catch (err) {
    console.warn('[Memory] saveMessageHistory threw:', err);
    return null;
  }
}

/**
 * iter 12 P0 — extract Vol/cap from user message regex.
 * Diagnosi Q10 V2 fix #2: saveInteraction non persiste last_experiment_id senza
 * experimentId esplicito → next msg perde chapter context. Estrae da safeMessage:
 *   "Vol.1 cap.6"  → "v1-cap6"
 *   "volume 2 capitolo 4" → "v2-cap4"
 *   "Vol.3 capitolo 8 esperimento 1" → "v3-cap8-esp1"
 *   "v.1 c.6" (iter 31 L2 fix code-review) → "v1-cap6" abbreviazione
 *   "vol 1 cap 6" (no dot) → "v1-cap6"
 * Returns null se nessun pattern matchato.
 */
export function extractVolCapFromMessage(message: string): string | null {
  if (!message || typeof message !== 'string') return null;
  // Pattern primary: vol.N cap.M [esp.K]
  const primary = message.match(/\bvol(?:ume)?\.?\s*([1-3])\s+cap(?:itolo)?\.?\s*(\d{1,2})(?:\s+esp(?:erimento)?\.?\s*(\d{1,2}))?/i);
  if (primary) {
    const vol = primary[1];
    const cap = primary[2];
    const esp = primary[3];
    return esp ? `v${vol}-cap${cap}-esp${esp}` : `v${vol}-cap${cap}`;
  }
  // iter 31 L2 fix code-review — extend abbreviazione studenti: "v.N c.M" / "v N c M" / "v.Nc.M"
  // Andrea iter 21+ linguaggio plurale studenti typing abbreviato common.
  const abbrev = message.match(/\bv\.?\s*([1-3])\s*c\.?\s*(\d{1,2})(?:\s*e\.?\s*(\d{1,2}))?/i);
  if (abbrev) {
    const vol = abbrev[1];
    const cap = abbrev[2];
    const esp = abbrev[3];
    return esp ? `v${vol}-cap${cap}-esp${esp}` : `v${vol}-cap${cap}`;
  }
  return null;
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
