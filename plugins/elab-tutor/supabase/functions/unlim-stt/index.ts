/**
 * unlim-stt — Edge Function (Sprint T iter 25)
 *
 * Speech-to-text via Cloudflare Workers AI Whisper Large v3 Turbo.
 * Italian K-12 voice transcription for ELAB Tutor docente input.
 *
 * POST /unlim-stt
 * Body: multipart/form-data with 'audio' file (.mp3/.wav/.webm/.flac)
 *   OR JSON { audio_base64: string, sessionId: string, language?: 'it'|'en' }
 * Returns: { success: true, text: string, language: string, model: '@cf/openai/whisper-large-v3-turbo' }
 *
 * (c) Andrea Marro — 2026-04-29
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { getCorsHeaders, getSecurityHeaders, checkBodySize, BODY_SIZE_MULTIMODAL } from '../_shared/guards.ts';
import { cfWhisperSTT } from '../_shared/cloudflare-client.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405, headers: getSecurityHeaders(req),
    });
  }

  const bodyCheck = checkBodySize(req, BODY_SIZE_MULTIMODAL);
  if (bodyCheck) return bodyCheck;

  try {
    let audioBytes: Uint8Array;
    let language = 'it';
    let sessionId = '';

    const contentType = req.headers.get('content-type') || '';

    // Iter 32 P0 fix — handle 3 input shapes:
    //   1. multipart/form-data (audio File field)
    //   2. application/json {audio_base64, sessionId, language}
    //   3. audio/* (audio/mpeg, audio/wav, audio/mp4, audio/x-m4a, audio/webm, ...) raw binary
    // Previous iter 30 fix only handled 1+2; massive E2E test iter 31 (Batch E)
    // confirmed harness sent audio/mpeg directly → JSON parse error "Unexpected token I".
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const audioFile = formData.get('audio') as File | null;
      if (!audioFile) {
        return new Response(JSON.stringify({ success: false, error: 'audio file required' }), {
          status: 400, headers: getSecurityHeaders(req),
        });
      }
      audioBytes = new Uint8Array(await audioFile.arrayBuffer());
      language = (formData.get('language') as string) || 'it';
      sessionId = (formData.get('sessionId') as string) || '';
    } else if (contentType.startsWith('audio/')) {
      // Raw audio binary upload (audio/mpeg, audio/wav, audio/mp4, audio/x-m4a, etc.)
      const buf = await req.arrayBuffer();
      audioBytes = new Uint8Array(buf);
      language = (req.headers.get('x-language') as string) || 'it';
      sessionId = (req.headers.get('x-session-id') as string) || '';
    } else {
      // application/json path
      const body = await req.json();
      if (!body.audio_base64 || typeof body.audio_base64 !== 'string') {
        return new Response(JSON.stringify({ success: false, error: 'audio_base64 OR multipart audio OR audio/* binary required' }), {
          status: 400, headers: getSecurityHeaders(req),
        });
      }
      const binStr = atob(body.audio_base64);
      audioBytes = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) audioBytes[i] = binStr.charCodeAt(i);
      language = body.language || 'it';
      sessionId = body.sessionId || '';
    }

    if (!sessionId) {
      return new Response(JSON.stringify({ success: false, error: 'sessionId required (UUID)' }), {
        status: 400, headers: getSecurityHeaders(req),
      });
    }

    // Cap audio size 10MB
    if (audioBytes.length > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ success: false, error: 'audio too large (>10MB)' }), {
        status: 413, headers: getSecurityHeaders(req),
      });
    }

    const result = await cfWhisperSTT({ audio: audioBytes, language });

    return new Response(JSON.stringify({
      success: true,
      text: result.text,
      language: result.language || language,
      model: '@cf/openai/whisper-large-v3-turbo',
      provider: 'cloudflare-workers-ai',
      latencyMs: result.latencyMs,
    }), {
      status: 200, headers: getSecurityHeaders(req),
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error';
    console.error(JSON.stringify({
      level: 'error', event: 'unlim_stt_error', error: msg,
      timestamp: new Date().toISOString(),
    }));
    return new Response(JSON.stringify({
      success: false, error: 'Transcription failed', details: msg.slice(0, 200),
    }), {
      status: 500, headers: getSecurityHeaders(req),
    });
  }
});
