/**
 * Nanobot V2 — TTS Proxy Edge Function
 * POST /tts — Proxies TTS requests to Voxtral on VPS
 * Returns audio/mpeg stream or base64 data URL.
 * (c) Andrea Marro — 02/04/2026
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import type { TTSRequest } from '../_shared/types.ts';
import { getCorsHeaders, getSecurityHeaders, checkRateLimitPersistent, checkBodySize, validateTTSVoice, validateTTSLanguage, validateTTSSpeed } from '../_shared/guards.ts';
import { checkConsent } from '../_shared/memory.ts';
import { synthesizeIsabella, ISABELLA_DEFAULTS } from '../_shared/edge-tts-client.ts';
import { synthesizeVoxtral, VOXTRAL_DEFAULTS } from '../_shared/voxtral-client.ts';
import { cfMeloTtsSynthesize } from '../_shared/cloudflare-client.ts';

// VPS URL from env var — not hardcoded
const VPS_TTS_URL = Deno.env.get('VPS_TTS_URL') || 'http://72.60.129.50:8880/tts';

// Sprint T iter 29 — Voxtral PRIMARY (Mistral EU 70 ms 9 languages incl IT).
// Andrea iter 31 mandate: KEEP Mistral stack — voce/lentezza fix via:
//   1. max_tokens cap 200 in llm-client.ts (120 parole ≈ 180 token, feedback 2026-05-10)
//   2. Streaming response SSE (perceived latency <500ms)
//   3. Warm-up Cron 30s prevent cold start
//   4. Voice cloning Andrea/Davide IT 6s audio (Voxtral native Italian voice_id)
const VOXTRAL_TTS_ENABLED = Deno.env.get('DISABLE_VOXTRAL_TTS') !== '1';

// Sprint S iter 6 — Isabella Neural via Microsoft edge-tts (no GPU, no VPS).
// Approvato Andrea 2026-04-26. Now FALLBACK chain step 2 (post Voxtral primary).
const EDGE_TTS_ENABLED = Deno.env.get('DISABLE_EDGE_TTS') !== '1';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error:'Method not allowed' }), {
      status: 405, headers: getSecurityHeaders(req),
    });
  }

  // Body size check
  const bodyCheck = checkBodySize(req);
  if (bodyCheck) return bodyCheck;

  try {
    const body: TTSRequest & {
      sessionId?: string;
      provider?: 'voxtral' | 'edge-tts' | 'vps' | 'auto';
      rate?: string;
      pitch?: string;
      voice_id?: string;     // Voxtral cloned voice override
      format?: 'mp3' | 'wav' | 'flac' | 'opus' | 'pcm';
    } = await req.json();
    const { text, sessionId } = body;
    // Validate TTS-specific fields (legacy VPS path)
    const voice = validateTTSVoice(body.voice);
    const language = validateTTSLanguage(body.language);
    const speed = validateTTSSpeed(body.speed);
    const requestedProvider = body.provider || 'auto';
    // edge-tts pass-through fields (no validation lock — Microsoft accepts SSML range)
    const edgeVoice = (typeof body.voice === 'string' && body.voice.startsWith('it-IT-')) ? body.voice : ISABELLA_DEFAULTS.voice;
    const edgeRate = typeof body.rate === 'string' ? body.rate : ISABELLA_DEFAULTS.rate;
    const edgePitch = typeof body.pitch === 'string' ? body.pitch : ISABELLA_DEFAULTS.pitch;

    // Consent check (if sessionId provided)
    if (sessionId) {
      const consentMode = Deno.env.get('CONSENT_MODE') || 'soft';
      if (consentMode !== 'off') {
        const consent = await checkConsent(sessionId);
        if (consent === 'revoked') {
          return new Response(JSON.stringify({ success: false, error: 'Consenso revocato.' }), {
            status: 403, headers: getSecurityHeaders(req),
          });
        }
      }
    }

    // Rate limit TTS (requires sessionId)
    const sessionKey = sessionId ? `tts:${sessionId}` : `tts:anon:${req.headers.get('x-forwarded-for') || 'unknown'}`;
    const allowed = await checkRateLimitPersistent(sessionKey);
    if (!allowed) {
      return new Response(JSON.stringify({ success: false, error:'Troppe richieste TTS. Aspetta qualche secondo.' }), {
        status: 429, headers: getSecurityHeaders(req),
      });
    }

    if (!text?.trim()) {
      return new Response(JSON.stringify({ success: false, error: 'Empty text' }), {
        status: 400, headers: getSecurityHeaders(req),
      });
    }

    // Clean text — remove action tags
    const cleanText = text
      .replace(/\[azione:[^\]]+\]/gi, '')
      .replace(/\[AZIONE:[^\]]+\]/gi, '')
      .replace(/\[INTENT:\{[^}]+\}\]/g, '')
      .replace(/\n{2,}/g, ' ')
      .trim();

    if (!cleanText || cleanText.length < 3) {
      return new Response(JSON.stringify({ success: false, error:'Text too short after cleaning' }), {
        status: 400, headers: getSecurityHeaders(req),
      });
    }

    // Cap text length for TTS (prevent abuse)
    const cappedText = cleanText.slice(0, 500);

    // ── Sprint T iter 29 PRIMARY: Mistral Voxtral mini-tts-2603 ──
    // (Andrea iter 31 mandate: KEEP Mistral stack, optimize latency separately
    // via streaming response + max_tokens cap + warm-up cron iter 31 P0.)
    // MeloTTS Cloudflare keep as emergency fallback only (cfMeloTtsSynthesize
    // available in cloudflare-client.ts, NOT default invoked here).
    const useVoxtral = VOXTRAL_TTS_ENABLED &&
      requestedProvider !== 'edge-tts' &&
      requestedProvider !== 'vps';
    if (useVoxtral) {
      const voxRes = await synthesizeVoxtral({
        text: cappedText,
        // Iter 34 P0 fix Andrea "voglio mia voce clonata":
        // body.voice_id has priority → VOXTRAL_VOICE_ID env (clone Andrea IT
        // `9234f1b6-...`) → DEFAULT_VOICE_ID en_us (last resort). Pass undefined
        // when body.voice_id missing so client picks env var (was passing
        // VOXTRAL_DEFAULTS.voiceId = en_us default, masking env override).
        voiceId: body.voice_id || undefined,
        format: body.format || VOXTRAL_DEFAULTS.format,
      });
      if (voxRes.ok && voxRes.audio) {
        return new Response(voxRes.audio, {
          status: 200,
          headers: {
            ...getSecurityHeaders(req),
            'Content-Type': voxRes.contentType || 'audio/mpeg',
            'Content-Length': String(voxRes.audio.byteLength),
            'Cache-Control': 'public, max-age=3600',
            'X-Tts-Provider': 'voxtral',
            'X-Tts-Voice': voxRes.voiceId || '',
            'X-Tts-Model': voxRes.model || '',
            'X-Tts-Latency-Ms': String(voxRes.latencyMs),
          },
        });
      }
      // Voxtral failed → fall through to Edge TTS Isabella.
      // If caller explicitly forced 'voxtral', return browser fallback marker.
      if (requestedProvider === 'voxtral') {
        return new Response(JSON.stringify({
          success: true,
          source: 'browser',
          text: cappedText,
          message: 'Usa la sintesi vocale del browser.',
          voxtral_error: voxRes.errorReason,
          voxtral_status: voxRes.statusCode,
        }), {
          status: 200, headers: getSecurityHeaders(req),
        });
      }
    }

    // ── Sprint S iter 6 (now FALLBACK 2): Microsoft edge-tts Isabella Neural ──
    const useEdge = EDGE_TTS_ENABLED && requestedProvider !== 'vps';
    if (useEdge) {
      const edgeRes = await synthesizeIsabella({
        text: cappedText,
        voice: edgeVoice,
        rate: edgeRate,
        pitch: edgePitch,
      });
      if (edgeRes.ok && edgeRes.audio) {
        return new Response(edgeRes.audio, {
          status: 200,
          headers: {
            ...getSecurityHeaders(req),
            'Content-Type': edgeRes.contentType || 'audio/mpeg',
            'Content-Length': String(edgeRes.audio.byteLength),
            'Cache-Control': 'public, max-age=3600',
            'X-Tts-Provider': 'edge-tts',
            'X-Tts-Voice': edgeVoice,
            'X-Tts-Latency-Ms': String(edgeRes.latencyMs),
          },
        });
      }
      // edge-tts failed → fall through to VPS path (best effort).
      // If caller explicitly requested 'edge-tts', return browser fallback marker.
      if (requestedProvider === 'edge-tts') {
        return new Response(JSON.stringify({
          success: true,
          source: 'browser',
          text: cappedText,
          message: 'Usa la sintesi vocale del browser.',
          edge_tts_error: edgeRes.errorReason,
        }), {
          status: 200, headers: getSecurityHeaders(req),
        });
      }
      // else fall through to VPS
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const vpsResponse = await fetch(VPS_TTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cappedText, voice, language, speed }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!vpsResponse.ok) {
      // VPS TTS unavailable — graceful degradation: return 200 with browser fallback
      return new Response(JSON.stringify({
        success: true,
        source: 'browser',
        text: cappedText,
        message: 'Usa la sintesi vocale del browser.',
      }), {
        status: 200, headers: getSecurityHeaders(req),
      });
    }

    // Stream audio back to client
    const audioData = await vpsResponse.arrayBuffer();

    return new Response(audioData, {
      status: 200,
      headers: {
        ...getSecurityHeaders(req),
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audioData.byteLength),
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (_err) {
    // VPS unreachable — graceful degradation: return 200 with browser fallback
    return new Response(JSON.stringify({
      success: true,
      source: 'browser',
      text: '',
      message: 'Usa la sintesi vocale del browser.',
    }), {
      status: 200, headers: getSecurityHeaders(req),
    });
  }
});
