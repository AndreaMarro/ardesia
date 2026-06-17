/**
 * unlim-session-description — iter 35 P0
 *
 * POST { session_id }  →  { description: string }
 *
 * Genera (e cache su `unlim_sessions.description_unlim`) una descrizione
 * breve UNLIM-style di una sessione passata, da mostrare nella cronologia
 * homepage Google-style.
 *
 * Output: stringa fattuale ≤80 char, plurale "Ragazzi" non si addice qui
 * (è metadato lista, non istruzione docente). Es:
 *   "Esplorato circuito LED con resistenza · 25 min · 6 interazioni"
 *
 * Cache: prima di chiamare LLM controlla `description_unlim` non null. Se
 * presente, ritorna direttamente. Update con UPDATE ... WHERE id=$1.
 *
 * Andrea Marro — 30/04/2026
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { getCorsHeaders, getSecurityHeaders, checkBodySize } from '../_shared/guards.ts';
import { callLLM } from '../_shared/llm-client.ts';

const MAX_CHARS = 80;

interface SessionRow {
  id: string;
  experiment_id: string | null;
  modalita: string | null;
  started_at: string | null;
  ended_at: string | null;
  events: unknown;
  description_unlim: string | null;
}

function fallbackSummary(row: SessionRow): string {
  const expId = row.experiment_id || 'esperimento';
  const events = Array.isArray(row.events) ? row.events.length : 0;
  const dur = row.started_at && row.ended_at
    ? Math.max(1, Math.round((new Date(row.ended_at).getTime() - new Date(row.started_at).getTime()) / 60000))
    : 0;
  const parts: string[] = [`Sessione su ${expId}`];
  if (dur) parts.push(`${dur} min`);
  if (events) parts.push(`${events} eventi`);
  return parts.join(' · ').slice(0, MAX_CHARS);
}

function buildPrompt(row: SessionRow): { systemPrompt: string; message: string } {
  const expId = row.experiment_id || 'sconosciuto';
  const modalita = row.modalita || 'percorso';
  const events = Array.isArray(row.events) ? row.events.slice(0, 12) : [];
  const dur = row.started_at && row.ended_at
    ? Math.max(1, Math.round((new Date(row.ended_at).getTime() - new Date(row.started_at).getTime()) / 60000))
    : null;

  const systemPrompt = [
    'Sei UNLIM, tutor AI ELAB Tutor.',
    'Genera UNA descrizione breve e fattuale della sessione (1-2 frasi, MAX 80 caratteri).',
    'Tono: neutro, fattuale, plurale impersonale ("Esplorato", "Costruito", "Verificato").',
    'NIENTE saluti, NIENTE imperativi al docente, NIENTE emoji.',
    'Cita SOLO concetti realmente presenti negli eventi. Se non sai, ometti.',
  ].join(' ');

  const message = [
    `Esperimento: ${expId}`,
    `Modalità: ${modalita}`,
    dur ? `Durata: ${dur} min` : '',
    `Eventi recenti: ${JSON.stringify(events)}`,
    'Restituisci SOLO la descrizione, senza prefissi.',
  ].filter(Boolean).join('\n');

  return { systemPrompt, message };
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
    const body = await req.json().catch(() => ({}));
    const sessionId = typeof body?.session_id === 'string' ? body.session_id.trim() : '';
    if (!sessionId) {
      return new Response(JSON.stringify({ success: false, error: 'session_id required' }), {
        status: 400, headers: getSecurityHeaders(req),
      });
    }

    const supabaseUrl = (Deno.env.get('SUPABASE_URL') || '').trim();
    const supabaseKey = (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '').trim();
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ success: false, error: 'Supabase not configured' }), {
        status: 503, headers: getSecurityHeaders(req),
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1) Fetch session row
    const { data: row, error: fetchErr } = await supabase
      .from('unlim_sessions')
      .select('id, experiment_id, modalita, started_at, ended_at, events, description_unlim')
      .eq('id', sessionId)
      .single();

    if (fetchErr || !row) {
      return new Response(JSON.stringify({ success: false, error: 'session not found' }), {
        status: 404, headers: getSecurityHeaders(req),
      });
    }

    // 2) Cache hit: return existing description without LLM call
    if (row.description_unlim && row.description_unlim.trim().length > 0) {
      return new Response(JSON.stringify({ success: true, description: row.description_unlim, cached: true }), {
        status: 200, headers: getSecurityHeaders(req),
      });
    }

    // 3) Generate via LLM (weighted routing — fast Gemini Flash-Lite primary post iter 35)
    let description = '';
    try {
      const { systemPrompt, message } = buildPrompt(row as SessionRow);
      const result = await callLLM({
        model: 'gemini-2.5-flash-lite',
        systemPrompt,
        message,
        maxOutputTokens: 80,
        temperature: 0.4,
      });
      description = (result.text || '').trim().replace(/^["']|["']$/g, '').slice(0, MAX_CHARS);
    } catch (llmErr) {
      console.info(JSON.stringify({ level: 'info', event: 'session_description_llm_down', error: llmErr instanceof Error ? llmErr.message : String(llmErr) }));
    }

    if (!description) {
      description = fallbackSummary(row as SessionRow);
    }

    // 4) Cache write (best effort, non-blocking on response)
    try {
      await supabase
        .from('unlim_sessions')
        .update({ description_unlim: description })
        .eq('id', sessionId);
    } catch (updErr) {
      console.info(JSON.stringify({ level: 'info', event: 'session_description_cache_write_failed', error: updErr instanceof Error ? updErr.message : String(updErr) }));
    }

    return new Response(JSON.stringify({ success: true, description, cached: false }), {
      status: 200, headers: getSecurityHeaders(req),
    });
  } catch (err) {
    console.error(JSON.stringify({ level: 'error', event: 'session_description_unhandled', error: err instanceof Error ? err.message : String(err) }));
    return new Response(JSON.stringify({ success: false, error: 'unhandled' }), {
      status: 500, headers: getSecurityHeaders(req),
    });
  }
});
