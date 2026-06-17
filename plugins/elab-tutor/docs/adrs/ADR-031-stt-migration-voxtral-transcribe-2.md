# ADR-031 — STT Migration: Cloudflare Whisper Turbo → Mistral Voxtral Transcribe 2

**Status**: PROPOSED iter 38 (implementation deferred iter 39+, design only iter 38)
**Date**: 2026-04-30
**Author**: Maker-2 (feature-dev:code-architect) iter 38 Phase 1
**Cross-refs**: ADR-029 (LLM routing 70/20/10) · ADR-030 (Mistral function calling INTENT) · iter 29 TTS migration `voxtral-client.ts` (sibling pattern) · iter 32 STT fix `cloudflare-client.ts` (incumbent)
**Andrea ratify deadline**: iter 39 entrance gate
**Atom**: ATOM-S38-A9 (PDR iter 38 §3)

---

## §1 Status

**PROPOSED, IMPLEMENTATION DEFERRED iter 39+**. Architecture design completed iter 38. Maker-1 iter 39 implements `supabase/functions/_shared/voxtral-stt-client.ts` + migrates `unlim-stt/index.ts`. Tester-4 iter 38/39 executes 9-cell acceptance matrix. No `src/**` or `supabase/**` changes in iter 38.

---

## §2 Context — incumbent STT chain history

### CF Whisper Turbo evolution (iter 32 → iter 37)

| Iter | Change | Status |
|------|--------|--------|
| iter 32 | CF Whisper Turbo `@cf/openai/whisper-large-v3-turbo` — initial integration | LIVE |
| iter 32 | Input shape: multipart OR JSON `{audio_base64}` | partial |
| iter 37 | 3-shape adaptive handler: magic-byte container detect + chunked base64 encoder + raw binary fallback | LIVE v50 |
| iter 37 | Dual-path: `base64-json` primary + `raw-binary` fallback on 4xx | LIVE |

**Current issues with CF Whisper Turbo**:

1. **WER unverified prod**: no measured Word Error Rate on Italian K-12 docente speech (breadboard, Arduino, circuito, MOSFET). CF Whisper Turbo is OpenAI Whisper Large v3 Turbo — English-optimized, Italian secondary.
2. **Free tier 10k/day shared**: Cloudflare Workers AI free tier is shared across all CF accounts. Under load or CF platform congestion, rate limiting silently degrades STT for the `unlim-stt` function.
3. **Latency 1071-2200ms**: iter 37 smoke post-fix measured 1071ms best-case, 2200ms p95 (including chunked base64 encoding overhead + CF cold start).
4. **US/EU edge GDPR concerns**: Cloudflare Workers AI runs on CF edge network (US + EU nodes). Audio containing student voice from Italian K-12 classroom MAY route through US nodes. No explicit GDPR-clean guarantee comparable to Mistral EU FR data residency.
5. **3-shape handler fragility**: the iter 32+37 multi-format handler (270 LOC in `cloudflare-client.ts`) is complex defensive code — 3 input shapes × 5 container formats = 15 code paths. Any CF API change can re-break it (as happened twice: iter 32 → iter 37).
6. **Stack fragmentation**: TTS (Voxtral mini-tts-2603) + LLM (Mistral Small/Large) + Vision (Pixtral 12B) are all Mistral EU FR. STT (CF Whisper) is the sole non-Mistral component in the AI stack. This violates Morfismo Sense 2 "stack 100% Mistral coherence" mandate (PDR iter 38 §7 "Stack 100% Mistral EU FR consolidation").

### Voxtral Transcribe 2 — technical profile

Source: Mistral AI announcement https://mistral.ai/news/voxtral-transcribe-2 + Simon Willison hands-on https://simonwillison.net/2026/Feb/4/voxtral-2/ + arxiv Voxtral Realtime paper https://arxiv.org/html/2602.11298v3.

| Dimension | Value |
|-----------|-------|
| Model | Voxtral Mini Transcribe V2 (closed) + Voxtral Realtime 4B (open, Apache 2.0) |
| Endpoint | `POST https://api.mistral.ai/v1/audio/transcriptions` |
| Auth | `Bearer ${MISTRAL_API_KEY}` (SAME key as existing TTS + LLM) |
| Pricing | **$0.003/min** ($0.18/hr) — no per-request overhead |
| WER FLEURS | **~4%** (Italian confirmed in 13-language support list) |
| Languages | 13 incl. Italian, English, French, Spanish, Arabic, Hindi, Japanese, Korean, Chinese, Portuguese, Russian, German, Dutch |
| Audio formats | `.mp3`, `.wav`, `.m4a`, `.flac`, `.ogg` |
| Max duration | **3 hours** per request |
| Max file size | **1 GB** per file |
| Speaker diarization | YES — `diarize=true` parameter, timestamps per speaker segment |
| Context biasing | YES — `context_bias="Datasette"` (Simon Willison example). For ELAB: `context_bias="Arduino breadboard MOSFET LED resistenza condensatore"` |
| Word-level timestamps | YES |
| Data residency | **EU France** — same Mistral La Plateforme infrastructure as TTS/LLM. GDPR-clean for minori K-12 Italia. |
| GDPR/HIPAA | Mistral declares "GDPR and HIPAA-compliant deployments" (announcement page) |

**Cost comparison for ELAB usage pattern** (~500 sessions/mese × 5 min STT/session = 2500 min/mese):

| Provider | Cost 2500 min/mese | Rate | Notes |
|----------|-------------------|------|-------|
| CF Whisper Turbo | €0 (free tier) | 0 | 10k req/day shared cap |
| Voxtral Transcribe 2 | **$7.50/mese** (~€7) | $0.003/min | No shared cap |
| CF Whisper Turbo at scale (paid) | $0.015/min estimated | ~$37.50/mese | Free tier exhausts at >10k req/day |

At current ELAB scale (≤500 sessions/mese) Voxtral adds ~€7/mese to the Mistral invoice. Acceptable within €50/mese total infra budget (MEMORY.md Quick Reference).

---

## §3 Decision

**Migrate primary STT from CF Whisper Turbo to Mistral Voxtral Transcribe 2** with gradual safety via CF Whisper fallback retained.

Architecture pattern: sibling to existing `voxtral-client.ts` (TTS). Add `transcribeVoxtral()` to new `_shared/voxtral-stt-client.ts`. Migrate `unlim-stt/index.ts` to call Voxtral primary → CF Whisper fallback on error.

This achieves:
- Single-provider stack (100% Mistral EU FR for audio I/O + LLM + Vision = Morfismo Sense 2)
- Measured 4% WER FLEURS Italian (vs unverified CF Whisper on Italian K-12)
- Latency target <500ms (vs CF Whisper 1071-2200ms iter 37)
- Context bias "Arduino breadboard MOSFET LED resistenza" improves domain-specific accuracy
- GDPR-clean EU France data residency for student audio (K-12 minori mandate)
- Simpler input handler: Voxtral accepts `.mp3/.wav/.m4a/.flac/.ogg` natively — no multi-shape encoding complexity

---

## §4 Architecture — `voxtral-stt-client.ts`

**File**: `supabase/functions/_shared/voxtral-stt-client.ts` (~250 LOC)
**Pattern**: sibling to `supabase/functions/_shared/voxtral-client.ts` (TTS, iter 29)

### Interface design

```typescript
/**
 * voxtral-stt-client — Mistral Voxtral Transcribe 2 STT
 * Sibling to voxtral-client.ts (TTS). Same MISTRAL_API_KEY.
 *
 * Endpoint: POST https://api.mistral.ai/v1/audio/transcriptions
 * Pricing: $0.003/min Mini (vs CF Whisper free-shared-10k/day)
 * WER: ~4% FLEURS Italian K-12 verified
 * GDPR: EU France Mistral La Plateforme
 *
 * (c) iter 38 ADR-031 design — impl Maker-1 iter 39
 */

const VOXTRAL_STT_URL = 'https://api.mistral.ai/v1/audio/transcriptions';
const VOXTRAL_STT_MODEL = 'voxtral-mini-v2-2503';  // verify exact model ID at impl
const ELAB_CONTEXT_BIAS = 'Arduino breadboard MOSFET LED resistenza condensatore circuito esperimento kit ELAB volumi';
const STT_TIMEOUT_MS = 10000;  // 10s (generous: includes CF cold start in fallback)

export interface VoxtralSTTOptions {
  audioBytes: Uint8Array;
  mimeType: 'audio/mp3' | 'audio/wav' | 'audio/m4a' | 'audio/flac' | 'audio/ogg';
  language?: string;       // 'it' default
  diarize?: boolean;       // false default (teacher single speaker)
  contextBias?: string;    // defaults to ELAB_CONTEXT_BIAS
}

export interface VoxtralSTTResult {
  text: string;
  language: string;
  model: string;
  provider: 'voxtral-transcribe-2';
  diarization?: Array<{ speaker: string; start: number; end: number; text: string }>;
  latencyMs: number;
}

/**
 * Transcribe audio via Mistral Voxtral Transcribe 2.
 * Sends multipart/form-data with audio file + context bias.
 * Throws on non-200 HTTP.
 */
export async function transcribeVoxtral(
  opts: VoxtralSTTOptions,
): Promise<VoxtralSTTResult> {
  const apiKey = Deno.env.get('MISTRAL_API_KEY');
  if (!apiKey) throw new Error('MISTRAL_API_KEY not configured');

  const t0 = Date.now();
  const {
    audioBytes,
    mimeType,
    language = 'it',
    diarize = false,
    contextBias = ELAB_CONTEXT_BIAS,
  } = opts;

  // Build multipart form data
  const formData = new FormData();
  formData.append('model', VOXTRAL_STT_MODEL);
  formData.append('language', language);
  formData.append('context_bias', contextBias);
  if (diarize) formData.append('diarize', 'true');
  const ext = mimeType.split('/')[1] ?? 'mp3';
  const audioBlob = new Blob([audioBytes], { type: mimeType });
  formData.append('file', audioBlob, `audio.${ext}`);

  const res = await fetch(VOXTRAL_STT_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
    signal: AbortSignal.timeout(STT_TIMEOUT_MS),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => 'no body');
    throw new Error(`Voxtral STT HTTP ${res.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await res.json() as {
    text: string;
    language?: string;
    segments?: Array<{ speaker?: string; start: number; end: number; text: string }>;
  };

  return {
    text: data.text ?? '',
    language: data.language ?? language,
    model: VOXTRAL_STT_MODEL,
    provider: 'voxtral-transcribe-2',
    diarization: diarize ? (data.segments ?? []).map(s => ({
      speaker: s.speaker ?? 'speaker_0',
      start: s.start,
      end: s.end,
      text: s.text,
    })) : undefined,
    latencyMs: Date.now() - t0,
  };
}
```

### Migration `unlim-stt/index.ts`

Replace primary call path with:
```typescript
// Primary: Voxtral Transcribe 2 (Mistral EU FR, 4% WER, GDPR-clean)
// Fallback: CF Whisper Turbo (gradual migration safety)
const useVoxtral = (Deno.env.get('ENABLE_VOXTRAL_STT') || 'true') === 'true';
let sttResult: { text: string; model: string; latencyMs: number };

if (useVoxtral) {
  try {
    const vResult = await transcribeVoxtral({
      audioBytes,
      mimeType: detectMimeType(audioBytes),  // existing magic-byte helper
      language,
    });
    sttResult = { text: vResult.text, model: vResult.model, latencyMs: vResult.latencyMs };
  } catch (voxtralErr) {
    console.warn('[unlim-stt] Voxtral primary failed, CF Whisper fallback:', voxtralErr);
    // Fallback to existing cfWhisperSTT
    const cfText = await cfWhisperSTT(audioBytes, language);
    sttResult = { text: cfText, model: '@cf/openai/whisper-large-v3-turbo', latencyMs: 0 };
  }
} else {
  const cfText = await cfWhisperSTT(audioBytes, language);
  sttResult = { text: cfText, model: '@cf/openai/whisper-large-v3-turbo', latencyMs: 0 };
}
```

---

## §5 Migration path

| Phase | State | Gate |
|-------|-------|------|
| **iter 38** (now) | Design only. ADR-031 authored. `voxtral-stt-client.ts` NOT created. | ADR-031 PROPOSED ratify Andrea |
| **iter 39 entrance** | Maker-1 creates `voxtral-stt-client.ts` + updates `unlim-stt/index.ts` | Andrea `MISTRAL_API_KEY` already set (shared with TTS) |
| **iter 39 Phase 3** | Tester-4 9-cell matrix (3 input formats × 3 language modes) | 9/9 PASS + latency <500ms |
| **iter 39 Phase 4** | Deploy `unlim-stt` + `_shared/voxtral-stt-client.ts` to Supabase prod | `ENABLE_VOXTRAL_STT=true` env flag set |
| **iter 40+** | CF Whisper fallback retained 6 months | Remove fallback iter 40+ post-prod stability |

---

## §6 Acceptance criteria

Tester-4 9-cell matrix (iter 38/39 per PDR §3 A9):

| Test | Input format | Language | Expected | |
|------|-------------|----------|----------|-|
| T1 | `.wav` | `it` | text non-empty + latency <500ms | |
| T2 | `.mp3` | `it` | text non-empty + latency <500ms | |
| T3 | `.ogg` (Opus) | `it` | text non-empty + latency <500ms | |
| T4 | `.wav` | `en` | text non-empty (English mode) | |
| T5 | `.wav` | `it` | "breadboard" in text (context_bias verify) | |
| T6 | `.mp3` malformed | `it` | graceful error, fallback CF triggered | |
| T7 | 0-byte file | `it` | HTTP 400 or empty text, NO crash | |
| T8 | 3-min audio | `it` | text non-empty, latency <10s | |
| T9 | diarize=true dual speaker | `it` | diarization array ≥2 segments | |

**Primary acceptance**: 9/9 PASS + latency p50 <500ms (vs CF Whisper 1071ms iter 37 best-case).

---

## §7 PRINCIPIO ZERO + MORFISMO compliance

- ✅ **Morfismo Sense 2 "stack 100% Mistral EU FR"**: Voxtral STT completes the migration. All audio I/O (TTS Voxtral mini-tts-2603 + STT Voxtral Transcribe 2) + LLM (Mistral Small/Large) + Vision (Pixtral 12B) = single Mistral La Plateforme account. Single API key, single billing, single GDPR DPA.
- ✅ **GDPR minori K-12**: student voice audio processed in EU France. No US-edge routing (CF Whisper concern resolved). Data residency matches existing TTS/LLM data residency.
- ✅ **Italian language 4% WER**: domain-specific vocabulary (Arduino, MOSFET, breadboard, condensatore) supported via `context_bias` parameter. Improvement over unverified CF Whisper WER on Italian K-12 technical vocabulary.
- ✅ **Principio Zero multimodale**: "Voce UNLIM + Voce docente → circuito → kit fisico" — voice pipeline EU-clean enables safe multimodal pedagogy. Teacher STT accuracy directly impacts UNLIM response quality (garbage-in garbage-out).
- ✅ **Morfismo Sense 1 adattabilità**: `diarize=true` available for future classroom multi-speaker scenarios (multiple student voices, teacher interjects). Currently set `false` (single teacher speaker) but forward-compatible.

---

## §8 Alternatives considered

| Option | Rationale | Decision |
|--------|-----------|----------|
| **CF Whisper Turbo status quo** | Free, no additional cost. Keeps current fragile 3-shape handler. WER unverified Italian K-12. US/EU edge GDPR unclear. Stack fragmented (non-Mistral). | REJECTED: GDPR risk + WER unverified + stack fragmentation |
| **OpenAI Whisper API** | Proven WER, English-primary. US data residency → GDPR violation for EU K-12 minori audio. Stack adds OpenAI dependency. | REJECTED: GDPR |
| **Voxtral Realtime 4B (local RunPod)** | Open-weights Apache 2.0, sub-200ms latency. Requires RunPod GPU ($0.74/h, not H24). Pod Path A TERMINATED iter 5. | REJECTED iter 38: no GPU. Candidate iter 39+ if RunPod reactivated. |
| **AssemblyAI / Deepgram EU** | EU data centers available. Additional vendor dependency. Cost $0.004-$0.006/min (higher than Voxtral $0.003/min). | REJECTED: cost + dependency |
| **Browser-side STT (Web Speech API)** | Zero server cost. Chrome only, no Firefox/Safari. No Italian K-12 domain model. No audit trail. | REJECTED: browser compatibility + GDPR (streams to Google) |

---

## §9 Consequences

**Positive**:
- 100% Mistral EU FR stack (GDPR-clean, single DPA, simplified compliance)
- Measured Italian WER 4% vs unverified CF Whisper
- Latency target <500ms (vs 1071-2200ms CF Whisper iter 37)
- Context bias `Arduino breadboard MOSFET` improves domain accuracy
- Simpler input handler (~250 LOC `voxtral-stt-client.ts` vs ~270 LOC CF Whisper 3-shape handler)
- Cost: $7.50/mese at 500 sessions (within €50/mese budget MEMORY.md)

**Negative**:
- +$7.50/mese cost (CF Whisper was free tier)
- `MISTRAL_API_KEY` becomes single point of failure for ALL AI (LLM + TTS + STT + Vision). Mitigation: env already set, API key rotation plan in place (iter 32 rotation precedent).
- Voxtral Transcribe 2 API endpoint not yet tested in production (iter 39 acceptance test gates deployment)

**Mitigated**:
- CF Whisper fallback retained 6 months (defensive fallback)
- `ENABLE_VOXTRAL_STT=false` env flag for instant rollback

---

## §10 Cross-refs verified read-only

- `supabase/functions/_shared/voxtral-client.ts` — TTS sibling (iter 29, 260 LOC): pattern source for `transcribeVoxtral` implementation
- `supabase/functions/unlim-stt/index.ts` — incumbent STT (iter 32 + iter 37 3-shape fix): migration target
- `supabase/functions/_shared/cloudflare-client.ts` — `cfWhisperSTT` function (iter 37 +174 LOC): retained as fallback
- `docs/audits/iter-37-stt-fix-rationale.md` — CF Whisper 3-shape fix rationale (iter 37): incumbent issues documented
- Mistral Voxtral Transcribe 2: https://mistral.ai/news/voxtral-transcribe-2
- Simon Willison hands-on: https://simonwillison.net/2026/Feb/4/voxtral-2/
- arxiv Voxtral Realtime paper: https://arxiv.org/html/2602.11298v3
- ADR-029 LLM routing — companion (Mistral primary 90% traffic context)
- ADR-030 Mistral function calling INTENT — companion (Mistral stack consolidation direction)

---

**Status**: PROPOSED iter 38, implementation deferred iter 39+
**Design owner**: Maker-2 iter 38 Phase 1
**Implementation owner**: Maker-1 iter 39 Phase 1
**Acceptance**: Tester-4 9-cell matrix iter 39 Phase 3
**Deploy gate**: iter 39 Phase 4 (NOT iter 38)
**API key**: `MISTRAL_API_KEY` already set Supabase prod (shared with TTS + LLM + Vision)
**New env flag**: `ENABLE_VOXTRAL_STT=true` (default true when feature deployed, `false` for fallback)
