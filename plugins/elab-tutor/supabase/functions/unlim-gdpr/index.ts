/**
 * Nanobot V2 — GDPR Compliance Edge Function
 * POST /gdpr/delete — Right to erasure (Art. 17)
 * POST /gdpr/export — Data portability (Art. 20)
 * POST /gdpr/consent — Record parental consent (Art. 8)
 * (c) Andrea Marro — 02/04/2026
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, getSecurityHeaders, checkRateLimitPersistent, validateEmail, validateConsentMethod, checkBodySize } from '../_shared/guards.ts';

function getClient() {
  const url = Deno.env.get('SUPABASE_URL') || Deno.env.get('ELAB_DB_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('ELAB_DB_SERVICE_KEY');
  if (!url || !key) throw new Error('DB not configured');
  return createClient(url, key);
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405, headers: getSecurityHeaders(req),
    });
  }

  const bodyCheck = checkBodySize(req);
  if (bodyCheck) return bodyCheck;

  try {
    const body = await req.json();
    // Action from body (Supabase Edge Functions don't support sub-paths)
    const action = body.action || new URL(req.url).pathname.split('/').pop();
    const db = getClient();

    // Rate limit GDPR endpoints
    const sessionKey = `gdpr:${body.sessionId || body.studentId || 'anon'}`;
    const allowed = await checkRateLimitPersistent(sessionKey);
    if (!allowed) {
      return new Response(JSON.stringify({ success: false, error: 'Troppe richieste. Aspetta qualche secondo.' }), {
        status: 429, headers: getSecurityHeaders(req),
      });
    }

    // ── Auth for delete/export ──
    if (action === 'delete' || action === 'export') {
      const { sessionId, authToken } = body;
      if (!sessionId || !authToken) {
        return new Response(JSON.stringify({ success: false, error: 'Missing sessionId or authToken' }), {
          status: 400, headers: getSecurityHeaders(req),
        });
      }

      // Verify ownership
      const expectedToken = (sessionId.split('').reverse().join('').slice(0, 16) + 'elab');
      if (authToken !== expectedToken) {
        // Log failed auth attempt
        console.warn(JSON.stringify({
          level: 'warn', event: 'gdpr_auth_failed',
          action, timestamp: new Date().toISOString(),
        }));
        return new Response(JSON.stringify({ success: false, error: 'Non autorizzato.' }), {
          status: 403, headers: getSecurityHeaders(req),
        });
      }
    }

    switch (action) {
      // ── Right to Erasure (Art. 17) ──
      case 'delete': {
        const { sessionId } = body;
        if (!sessionId) {
          return new Response(JSON.stringify({ success: false, error: 'Missing sessionId' }), {
            status: 400, headers: getSecurityHeaders(req),
          });
        }

        const { data, error } = await db.rpc('delete_student_data', {
          target_session_id: sessionId,
        });

        if (error) throw error;

        // Audit log
        await db.from('gdpr_audit_log').insert({
          action: 'data_delete',
          target_id: sessionId,
          details: data,
        }).catch((e: Error) => console.warn('[GDPR] Audit log write failed:', e));

        return new Response(JSON.stringify({
          success: true,
          deleted: data,
          message: 'Tutti i dati dello studente sono stati eliminati.',
        }), {
          status: 200, headers: getSecurityHeaders(req),
        });
      }

      // ── Data Portability (Art. 20) ──
      case 'export': {
        const { sessionId } = body;
        if (!sessionId) {
          return new Response(JSON.stringify({ success: false, error: 'Missing sessionId' }), {
            status: 400, headers: getSecurityHeaders(req),
          });
        }

        // Export from ALL data tables (GDPR Art. 20 completeness)
        const [sessions, progress, contexts, moods, confusion, nudges, classMembers, consents] = await Promise.all([
          db.from('student_sessions').select('*').eq('session_id', sessionId),
          db.from('student_progress').select('*').eq('session_id', sessionId),
          db.from('lesson_contexts').select('*').eq('session_id', sessionId),
          db.from('mood_reports').select('*').eq('student_id', sessionId),
          db.from('confusion_reports').select('*').eq('student_id', sessionId),
          db.from('nudges').select('*').eq('student_id', sessionId),
          db.from('class_students').select('*').eq('student_id', sessionId),
          db.from('parental_consents').select('*').eq('student_id', sessionId),
        ]);

        // Audit log
        await db.from('gdpr_audit_log').insert({
          action: 'data_access',
          target_id: sessionId,
          details: { type: 'export' },
        }).catch((e: Error) => console.warn('[GDPR] Audit log write failed:', e));

        return new Response(JSON.stringify({
          success: true,
          data: {
            sessions: sessions.data || [],
            progress: progress.data || [],
            lesson_contexts: contexts.data || [],
            mood_reports: moods.data || [],
            confusion_reports: confusion.data || [],
            nudges: nudges.data || [],
            class_memberships: classMembers.data || [],
            consents: consents.data || [],
          },
          exported_at: new Date().toISOString(),
        }), {
          status: 200, headers: getSecurityHeaders(req),
        });
      }

      // ── Parental Consent (Art. 8) ──
      case 'consent': {
        const { studentId, classId, consentGiven, parentEmail, consentMethod } = body;
        if (!studentId || typeof studentId !== 'string' || studentId.length > 100) {
          return new Response(JSON.stringify({ success: false, error: 'Invalid studentId' }), {
            status: 400, headers: getSecurityHeaders(req),
          });
        }

        // Validate parentEmail if provided
        if (parentEmail && !validateEmail(parentEmail)) {
          return new Response(JSON.stringify({ success: false, error: 'Email genitore non valida.' }), {
            status: 400, headers: getSecurityHeaders(req),
          });
        }

        // Validate consentMethod
        const safeMethod = validateConsentMethod(consentMethod);

        // Validate classId if provided (alphanumeric + dashes, max 100)
        const safeClassId = classId && typeof classId === 'string' && /^[a-zA-Z0-9-]{1,100}$/.test(classId)
          ? classId : null;

        // Consent must be explicitly provided — never default to true (GDPR Art. 8)
        if (typeof consentGiven !== 'boolean') {
          return new Response(JSON.stringify({ success: false, error: 'consentGiven deve essere true o false.' }), {
            status: 400, headers: getSecurityHeaders(req),
          });
        }

        const { error: upsertError } = await db.from('parental_consents').upsert({
          student_id: studentId,
          class_id: safeClassId,
          consent_given: consentGiven,
          consent_date: consentGiven ? new Date().toISOString() : null,
          consent_method: safeMethod,
          parent_email: parentEmail || null,
          revoked_at: consentGiven ? null : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'student_id' });

        if (upsertError) {
          console.error(JSON.stringify({ level: 'error', event: 'consent_upsert_failed', error: upsertError.message }));
          throw upsertError;
        }

        // Audit log (best-effort, never blocks the response)
        try {
          const { error: auditError } = await db.from('gdpr_audit_log').insert({
            action: consentGiven ? 'consent_given' : 'consent_revoked',
            target_id: studentId,
            details: { method: safeMethod, class: safeClassId },
          });
          if (auditError) console.warn('[GDPR] Audit log write failed:', auditError.message);
        } catch (auditErr) {
          console.warn('[GDPR] Audit log exception:', auditErr);
        }

        return new Response(JSON.stringify({
          success: true,
          message: consentGiven
            ? 'Consenso genitoriale registrato.'
            : 'Consenso revocato. I dati verranno eliminati.',
        }), {
          status: 200, headers: getSecurityHeaders(req),
        });
      }

      // ── Status Check ──
      case 'status': {
        const { studentId } = body;
        if (!studentId) {
          return new Response(JSON.stringify({ success: false, error: 'Missing studentId' }), {
            status: 400, headers: getSecurityHeaders(req),
          });
        }

        const { data: consent } = await db.from('parental_consents')
          .select('consent_given, consent_date, revoked_at')
          .eq('student_id', studentId)
          .single();

        return new Response(JSON.stringify({
          success: true,
          hasConsent: consent?.consent_given ?? false,
          consentDate: consent?.consent_date ?? null,
          revokedAt: consent?.revoked_at ?? null,
        }), {
          status: 200, headers: getSecurityHeaders(req),
        });
      }

      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'Azione non riconosciuta. Azioni valide: delete, export, consent, status',
        }), {
          status: 400, headers: getSecurityHeaders(req),
        });
    }

  } catch (err) {
    console.error(JSON.stringify({
      level: 'error', event: 'gdpr_error',
      error: err instanceof Error ? err.message : 'unknown',
      timestamp: new Date().toISOString(),
    }));
    // Generic error — never leak internals
    return new Response(JSON.stringify({ success: false, error: 'Errore interno.' }), {
      status: 500, headers: getSecurityHeaders(req),
    });
  }
});
