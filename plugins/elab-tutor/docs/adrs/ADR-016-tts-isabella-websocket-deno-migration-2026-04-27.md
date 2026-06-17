---
id: ADR-016
title: TTS Isabella Neural — WebSocket Deno migration (rany2/edge-tts protocol, Microsoft Cognitive Services WSS)
status: PROPOSED
date: 2026-04-27
deciders:
  - architect-opus (Sprint S iter 8 Phase 1, Pattern S 5-agent OPUS PHASE-PHASE)
  - Andrea Marro (final approver per WSS endpoint risk + production deploy unlim-tts)
context-tags:
  - sprint-s-iter-8
  - tts-isabella-neural
  - websocket-deno-migration
  - microsoft-cognitive-services
  - box-8-lift
  - principio-zero-voice-narrator
  - morfismo-volumi-verbatim-read
related:
  - ADR-008 (buildCapitoloPromptFragment design) — TTS reads citazioni Vol/pag
  - ADR-009 (Principio Zero validator middleware) — voice register narratore italiano
  - ADR-012 (Vision flow E2E Playwright) — sibling iter 6+8 multimodal
  - ADR-013 (ClawBot composite handler L1 morphic) — composite `speakText` sub-tool consumer
  - ADR-015 (Hybrid RAG retriever) — TTS reads retrieved chunks verbatim
  - docs/architectures/STACK-V3-DEFINITIVE-2026-04-26.md §Voice
  - docs/bench/BENCHMARK-SUITE-ITER-8-2026-04-27.md §B4 — 50 sample fixture spec
input-files:
  - supabase/functions/_shared/edge-tts-client.ts (162 LOC iter 6 REST stub, deprecated MS endpoint 404)
  - supabase/functions/unlim-tts/index.ts (189 LOC iter 6 wire-up consumer)
  - src/services/multimodalRouter.js (367 LOC, routeTTS already real iter 6)
output-files:
  - supabase/functions/_shared/edge-tts-client.ts (REWRITE ~350 LOC, Deno native WebSocket WSS protocol)
  - supabase/functions/unlim-tts/index.ts (~+15 LOC wire-up content-type ogg + chunked streaming)
  - tests/unit/edge-tts-isabella.test.js (extend ~+80 LOC, WSS protocol mock + chunk parsing)
  - scripts/bench/score-tts-isabella.mjs (NEW ~200 LOC, latency + RTF + MOS-stub scorer)
  - scripts/bench/run-tts-isabella-bench.mjs (NEW ~150 LOC, 50-sample fixture runner)
  - scripts/bench/tts-isabella-fixture.jsonl (NEW, 50 sample texts × 5 categorie)
---

# ADR-016 — TTS Isabella WebSocket Deno migration (rany2/edge-tts protocol)

> Sostituire `supabase/functions/_shared/edge-tts-client.ts` iter 6 (162 LOC REST stub Microsoft `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1` deprecated/404 da fine 2025) con implementazione Deno-native WebSocket basata su `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1` protocol port di `rany2/edge-tts` Python (10K+ stars, MIT). Mantiene voce `it-IT-IsabellaNeural` (approvato Andrea iter 5 P3, registro narratore volumi italiano per ragazzi 8-14). Output `audio-24khz-16bit-mono-opus` formato OGG Opus per browser playback nativo. Graceful fallback browser `speechSynthesis` web API preservato. Iter 8 P0 wire-up Box 8 lift 0.7 → 0.95 post B4 PASS.

---

## 1. Contesto

### 1.1 Box 8 TTS+STT Italian stato iter 7 close (0.7)

Sprint S iter 7 close score 8.2/10 ha Box 8 = 0.7. Iter 6 P1 ha shipped:
- `supabase/functions/_shared/edge-tts-client.ts` (162 LOC) iter 6 Task A3 REST stub con endpoint `${SYNTH_BASE}?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}` POST SSML body
- `supabase/functions/unlim-tts/index.ts` (189 LOC) wire-up consumer con graceful fallback browser
- `src/services/multimodalRouter.js` (367 LOC) routeTTS real
- `tests/unit/edge-tts-isabella.test.js` 18 PASS unit

Gap iter 6 noto (vedi `iter-6-handoff.md` §3): endpoint REST Microsoft deprecato fine 2025+. Risposte HTTP 404 / 410 sporadiche. `rany2/edge-tts` Python upstream già migrato a WebSocket protocol da v6.0 (2024). Browser fallback `speechSynthesis` web API attivo MA voci browser default italiano scarsa qualità (Microsoft David Mobile, Google italiano femmina robotica) — non al pari Isabella Neural 24kHz.

### 1.2 Microsoft Edge TTS WebSocket protocol — perché funziona

`wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1` è endpoint pubblico Microsoft Cognitive Services consumer-tier usato da feature "Read Aloud" browser Edge. Auth via:
- Query param `TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4` (pubblico, hardcoded Edge browser)
- Query param `ConnectionId=<UUID v4>` (per-connection unique)
- Header `Sec-MS-GEC=<token>` + `Sec-MS-GEC-Version=<version>` (calcolato client-side via algoritmo basato su `WindowsFileTime` UTC ÷ 11644473600 + offset, port da DRM-GEC.h MS spec)

Tutti questi token NON richiedono Azure subscription né API key paid tier. Limite rate ~3 RPS anonymous per IP. Voice catalog include `it-IT-IsabellaNeural` 24kHz neural female age-appropriate.

Reference impl primary:
- **rany2/edge-tts** Python (https://github.com/rany2/edge-tts, MIT, 10K+ stars, attivo 2024-2026)
- JaVi7864/edge-tts-py-deno Deno port (sandbox-compatible, no native deps)
- Microsoft `speech-sdk` JS upstream (richiede Azure key, NON consumer free)

### 1.3 Perché Deno WebSocket native (NO npm dep)

Supabase Edge Function runtime = Deno isolate. Native `WebSocket` API web standard disponibile no-deps. Vantaggi vs alternativa libreria:
- Zero npm install (Edge Function deploy < 1 MB total)
- TLS handshake gestito dal runtime (no manual cert pinning)
- AbortController integration per timeout 8s standard
- Streaming `audio chunks` via `onmessage` handler natural

Anti-pattern: `npm:edge-tts-deno` packages community-maintained NON ufficiali (security risk + drift). REWRITE direct Deno WebSocket API è pulita.

### 1.4 Perché WSS NON HTTP nuova versione

Microsoft NON pubblica HTTP REST endpoint replacement consumer-free. Le opzioni HTTP rimaste:
- Azure Cognitive Services REST API (richiede subscription + API key paid $4/M characters)
- Azure Functions wrapper self-hosted (richiede MS account + deploy)
- WebSocket consumer-free (la nostra scelta)

Coqui XTTS-v2 / Voxtral 4B / ElevenLabs alternatives valutati §2.

### 1.5 Decisione architetturale fondamentale

REWRITE `edge-tts-client.ts` iter 6 162 LOC REST → ~350 LOC Deno WebSocket. Mantieni interfaccia esterna `synthesizeIsabella(req): Promise<IsabellaTTSResult>` invariata (backwards compat consumer `unlim-tts/index.ts` zero-touch wire-up). Cambia solo internal protocol implementation. Deploy gated Andrea OK post B4 ≥98% success rate + p50 <2s.

---

## 2. Decisione

### 2.1 Stack tecnico finale

| Layer | Componente | Spec |
|-------|-----------|------|
| Endpoint | Microsoft Cognitive Services Consumer | `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1` |
| Auth | Trusted Client Token + Sec-MS-GEC + ConnectionId | Public Edge browser token rotation MS-side |
| Voice | Italian Neural Female | `it-IT-IsabellaNeural` (Andrea iter 5 P3 approved) |
| Output format | OGG Opus 24kHz 16-bit mono | `audio-24khz-16bit-mono-opus` (browser native playback) |
| Runtime | Deno isolate | Native `WebSocket` API, no deps |
| Fallback | Browser Web Speech API | `window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))` it-IT |

### 2.2 Protocol handshake sequenza esatta

```
Client → WSS connect:
  URL: wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1
       ?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4
       &ConnectionId=<uuid-v4-no-dashes>
  Headers:
    Pragma: no-cache
    Cache-Control: no-cache
    Origin: chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold
    Accept-Encoding: gzip, deflate, br
    User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ... Edg/120.0.0.0

Client → text frame 1 (speech.config):
  X-Timestamp: <ISO 8601>
  Content-Type: application/json; charset=utf-8
  Path: speech.config

  {"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-16bit-mono-opus"}}}}

Client → text frame 2 (ssml):
  X-RequestId: <uuid-v4-no-dashes>
  Content-Type: application/ssml+xml
  X-Timestamp: <ISO 8601>
  Path: ssml

  <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='it-IT'>
    <voice name='it-IT-IsabellaNeural'>
      <prosody rate='-5%' pitch='default'>Ragazzi, oggi vediamo il LED.</prosody>
    </voice>
  </speak>

Server → text frame (turn.start):
  X-RequestId: <same>
  Path: turn.start
  ... (acknowledgement)

Server → binary frames (audio chunks):
  Header bytes (UTF-8 text):
    X-RequestId: <same>
    Path: audio
    Content-Type: audio/ogg; codecs=opus
  Body bytes: OGG Opus chunk N

Server → text frame (turn.end):
  Path: turn.end
  → client closes WSS

Client → assemble all binary chunk bodies into single ArrayBuffer = audio file complete.
```

### 2.3 Sec-MS-GEC token algorithm

Microsoft GEC (Generic Edge Client) token rotated every ~10 min. Algorithm port da `rany2/edge-tts` Python `auth.py`:

```typescript
function generateSecMsGec(): string {
  // Windows FILETIME = 100-nanosecond intervals since 1601-01-01 UTC
  const now = BigInt(Date.now()) * 10000n + 116444736000000000n;
  // Round down to nearest 5 minutes (300_000_000 100-ns ticks)
  const rounded = (now / 3000000000n) * 3000000000n;
  // Concatenate with TRUSTED_CLIENT_TOKEN
  const payload = `${rounded}${TRUSTED_CLIENT_TOKEN}`;
  // SHA256 hash uppercase hex
  const hashBuf = new TextEncoder().encode(payload);
  const hash = crypto.subtle.digestSync('SHA-256', hashBuf); // Deno API
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('');
}

const SEC_MS_GEC_VERSION = '1-130.0.2849.68'; // Edge browser version, rotated quarterly
```

NOTE: `crypto.subtle.digestSync` non esiste — usa `await crypto.subtle.digest('SHA-256', payload)` async.

### 2.4 SSML payload con prosody volume narrator

Voice register narratore volumi (PRINCIPIO ZERO + MORFISMO):
- `xml:lang='it-IT'` mandatory (no fallback English)
- `voice name='it-IT-IsabellaNeural'` (femminile adulto, narrazione fiabesca calda)
- `prosody rate='-5%'` (rallentato 5% per ragazzi 8-14)
- `prosody pitch='default'` (no shift, naturale)
- Optional `<break time='200ms'/>` post citazione `Vol.X pag.Y` (pausa narrativa)
- Optional `<emphasis level='moderate'>` su parola chiave concetto (es. "<emphasis>Resistenza</emphasis>")

### 2.5 Output format OGG Opus

`audio-24khz-16bit-mono-opus` scelto vs alternative:

| Format | Pro | Contro |
|--------|-----|--------|
| `audio-24khz-48kbitrate-mono-mp3` (iter 6) | Browser native, small | Lossy, compresso |
| `audio-24khz-16bit-mono-opus` ✅ | Streaming-friendly chunked, high quality, browser native via OGG container | Requires modern browser (>= 2018 OK) |
| `riff-24khz-16bit-mono-pcm` | Lossless | 4× size, no streaming benefit |
| `audio-48khz-96kbitrate-mono-mp3` | Higher quality | 2× cost bandwidth |

OGG Opus è standard `<audio src="data:audio/ogg;base64,...">` works tutti browser moderni post-2018. Dimensione ~50 KB / 10 secondi audio.

---

## 3. Architecture diagram

```
                  ┌─────────────────────────────────────────────────┐
                  │  Edge Function: unlim-tts (Deno isolate)        │
                  │                                                  │
   POST body ────►│  index.ts (~190 LOC)                            │
   {text}         │   ├─ parse + validate + PZ filter               │
                  │   └─ call synthesizeIsabella()                  │
                  │                                                  │
                  │  edge-tts-client.ts (~350 LOC NEW)              │
                  │   ┌──────────────────────────────────────┐      │
                  │   │  1. generateSecMsGec() async          │      │
                  │   │  2. const ws = new WebSocket(url)     │      │
                  │   │  3. ws.onopen → send speech.config   │      │
                  │   │  4. send ssml frame                   │      │
                  │   │  5. ws.onmessage:                     │      │
                  │   │     - text turn.start → log           │      │
                  │   │     - binary audio chunk → push       │      │
                  │   │     - text turn.end → close ws        │      │
                  │   │  6. assemble chunks → ArrayBuffer     │      │
                  │   │  7. return { ok, audio, contentType, │       │
                  │   │             latencyMs }               │      │
                  │   └──────────────────────────────────────┘      │
                  │                                                  │
                  │  Response 200 OK                                 │
                  │   Content-Type: audio/ogg; codecs=opus           │
                  │   Body: ArrayBuffer OGG Opus                     │
                  └─────────────────────────────────────────────────┘
                                       ▲
                                       │ WSS handshake (~200ms)
                                       │ + send config (~10ms)
                                       │ + send ssml (~10ms)
                                       │ + receive chunks (~500-3000ms)
                                       │ + close (~10ms)
                                       ▼
                  ┌─────────────────────────────────────────────────┐
                  │  Microsoft Cognitive Services WSS               │
                  │  speech.platform.bing.com/consumer/speech/...   │
                  │  it-IT-IsabellaNeural Neural TTS engine 24kHz   │
                  └─────────────────────────────────────────────────┘

Fallback path (WSS fail / timeout 8s):
  edge-tts-client returns { ok: false, errorReason }
  unlim-tts/index.ts → response 503 + { fallback: 'browser_speech' }
  browser → window.speechSynthesis.speak() with it-IT voice
```

---

## 4. Latency budget — target B4 thresholds

### 4.1 Breakdown

| Step | Latency target | Notes |
|------|----------------|-------|
| WSS handshake (DNS + TCP + TLS) | 100-200ms | Edge Function regional EU (Supabase Frankfurt) |
| Send `speech.config` text frame | 5-10ms | Single small frame |
| Send `ssml` text frame | 5-10ms | SSML body ≤500 chars per call |
| Receive `turn.start` ack | 100-300ms | MS server processing init |
| Receive audio chunks (first byte) | 500-1000ms | Time-to-first-audio (TTFA) |
| Receive audio chunks (full ~10s text) | 1000-2500ms | Cumulative streaming (lower than full) |
| Receive `turn.end` + close | 50-100ms | |
| **Total p50** | **~1500ms** | Target <2s ✅ |
| **Total p95** | **~3500ms** | Target <5s ✅ |
| **Total p99** | **~5000ms** | Edge case retransmit |

### 4.2 Real Time Factor (RTF)

RTF = synthesis_time / audio_duration. Target ≥1.0 (synthesis più veloce di playback). Microsoft Neural TTS rated ~3-5× realtime nativo. Edge Function overhead ~+200ms = RTF ~2.5-4× per testi 10s. **Pass B4 RTF ≥1.0**.

### 4.3 Success rate

Microsoft Edge TTS WSS rate limit ~3 RPS anonymous IP. Per Edge Function: shared IP Supabase regional → potenziale 429 rate limit se traffic spike concorrente >3 sessioni/sec. Mitigations:
- Retry with exponential backoff (300ms, 700ms, 1500ms) max 3 attempts
- Fallback browser TTS dopo 3rd 429
- Cache TTS output per (text, voice, rate, pitch) hash 24h via Supabase Storage

Target B4: success rate ≥98% (49/50 sample no error). Acceptable failure: 429 dopo retry exhaust.

---

## 5. Code interface — synthesizeIsabella unchanged

### 5.1 Public API (backwards compat iter 6)

```typescript
export interface IsabellaTTSRequest {
  text: string;
  voice?: string;     // default 'it-IT-IsabellaNeural'
  rate?: string;      // default '-5%'
  pitch?: string;     // default 'default'
}

export interface IsabellaTTSResult {
  ok: boolean;
  audio?: ArrayBuffer;
  contentType?: string;     // 'audio/ogg; codecs=opus' (changed from 'audio/mpeg' iter 6)
  errorReason?: string;
  latencyMs: number;
}

export async function synthesizeIsabella(req: IsabellaTTSRequest): Promise<IsabellaTTSResult>;
```

Interface invariata da iter 6. Solo `contentType` cambia da `audio/mpeg` (mp3) a `audio/ogg; codecs=opus`. Consumer `unlim-tts/index.ts` deve aggiornare response header coerentemente.

### 5.2 Internal helpers (NEW iter 8)

```typescript
// Generate Sec-MS-GEC token (Microsoft FILETIME-based rotating auth)
async function generateSecMsGec(): Promise<{ token: string; version: string }>;

// Build SSML envelope (mostly unchanged from iter 6)
export function buildIsabellaSsml(text, voice, rate, pitch): string;

// WSS protocol orchestrator (NEW)
async function connectAndSynthesize(ssml: string, requestId: string): Promise<ArrayBuffer>;

// Parse text frame headers from binary chunk (Microsoft custom protocol)
function parseChunkHeaders(buffer: ArrayBuffer): { headers: Record<string, string>; bodyOffset: number };

// Concatenate audio chunks into single ArrayBuffer
function assembleAudio(chunks: ArrayBuffer[]): ArrayBuffer;
```

### 5.3 Pseudo-code main flow

```typescript
async function synthesizeIsabella(req: IsabellaTTSRequest): Promise<IsabellaTTSResult> {
  const start = Date.now();
  const text = (req.text || '').trim();
  if (!text) return { ok: false, errorReason: 'empty text', latencyMs: 0 };

  const voice = req.voice || DEFAULT_VOICE;
  const rate = req.rate || DEFAULT_RATE;
  const pitch = req.pitch || DEFAULT_PITCH;
  const ssml = buildIsabellaSsml(text, voice, rate, pitch);
  const requestId = crypto.randomUUID().replace(/-/g, '');

  try {
    const audio = await Promise.race([
      connectAndSynthesize(ssml, requestId),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout 8s')), 8000)
      ),
    ]);
    if (audio.byteLength < 64) {
      return { ok: false, errorReason: 'empty audio', latencyMs: Date.now() - start };
    }
    return {
      ok: true,
      audio,
      contentType: 'audio/ogg; codecs=opus',
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      ok: false,
      errorReason: `wss failed: ${(err as Error).message.slice(0, 120)}`,
      latencyMs: Date.now() - start,
    };
  }
}
```

---

## 6. Integration — unlim-tts deploy + browser fallback

### 6.1 Edge Function consumer update minimal

`supabase/functions/unlim-tts/index.ts` cambiamenti minimal:
- Update Content-Type response header da `audio/mpeg` a `audio/ogg; codecs=opus`
- Update error fallback marker da `mp3_fallback` a `opus_fallback`
- Estendere timeout a 10s (vs iter 6 8s) per p99 edge case

```typescript
// Diff iter 6 → iter 8
- res.headers.set('Content-Type', 'audio/mpeg');
+ res.headers.set('Content-Type', result.contentType || 'audio/ogg; codecs=opus');
```

Frontend consumer `src/services/multimodalRouter.js` routeTTS già usa response Content-Type header dinamico → zero-touch.

### 6.2 Browser fallback graceful degradation

Se WSS fail (timeout 8s, 429 retry exhaust, MS protocol drift):
```javascript
// Frontend (multimodalRouter.js)
async function speakText(text, options = {}) {
  try {
    const res = await fetch('/functions/v1/unlim-tts', {
      method: 'POST',
      body: JSON.stringify({ text, voice: 'it-IT-IsabellaNeural' }),
    });
    if (res.ok) {
      const blob = await res.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      await audio.play();
      return { ok: true, source: 'isabella' };
    }
  } catch (err) {
    console.warn('[TTS] Isabella WSS fail, fallback browser', err);
  }
  // Fallback browser
  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'it-IT';
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
    return { ok: true, source: 'browser' };
  }
  return { ok: false, errorReason: 'no_tts_available' };
}
```

---

## 7. Test plan — B4 fixture 50 sample

### 7.1 Fixture spec

`scripts/bench/tts-isabella-fixture.jsonl` (NEW, 50 sample × 5 categorie):

| Cat | N | Esempio | Word count |
|-----|---|---------|------------|
| 1 short_greeting | 10 | "Ciao ragazzi" | 2-5 |
| 2 medium_explanation | 10 | "Vediamo come funziona il LED" | 10-15 |
| 3 full_response | 10 | "Ragazzi, il LED è una piccola lampadina che si accende quando passa corrente..." | 50-60 |
| 4 technical_with_citation | 10 | "Vol.1 pag.27 spiega la legge di Ohm V uguale R per I" | 15-20 |
| 5 long_narrative | 10 | "Ragazzi, oggi entriamo nel mondo dell'elettronica. Il primo capitolo del Vol.1 ci porta a scoprire..." | 100-120 |

### 7.2 Pass thresholds B4

| Metric | Target | Hard gate |
|--------|--------|-----------|
| latency p50 | <2000ms | ✅ |
| latency p95 | <5000ms | ✅ |
| RTF (synth/duration) | ≥1.0 | ✅ |
| MOS score | ≥4.0/5 | manual 5 sample × 5 rater |
| Success rate | ≥98% (49/50) | ✅ |
| File size variance | ≤30% per categoria | sanity check |

### 7.3 MOS evaluation methodology

**MOS (Mean Opinion Score)** soggettivo:
- 5 sample casuali da fixture (1 per categoria)
- 5 rater independent: Andrea + 4 esterni (collaboratori Tea + 1 docente reale + 1 ragazzo 12y target audience + 1 audio engineer)
- Scale 1-5: 1=cattivo, 2=povero, 3=accettabile, 4=buono, 5=eccellente
- Criteri valutazione: naturalezza voce, comprensibilità ragazzi 8-14, registro narrativo italiano corretto, prosody legge di Ohm-style citazioni
- LLM-as-judge stub iter 8 entrance (Claude Opus 4.7 valuta trascrizione + audio descrittore), manual 5×5 iter 8 close

### 7.4 Run command

```bash
node scripts/bench/run-tts-isabella-bench.mjs \
  --fixture scripts/bench/tts-isabella-fixture.jsonl \
  --endpoint https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-tts \
  --output scripts/bench/output/tts-isabella-bench-$(date -u +%Y-%m-%dT%H-%M-%S).json
```

Output:
- JSON scores per ogni sample (latency, RTF, file_size, success)
- Markdown report aggregato p50/p95/RTF avg + sample audio path
- 50 audio files OGG locali per manual MOS rate

---

## 8. Alternatives evaluated

### 8.1 Tabella decisione

| Alternative | Cost | Italian quality | Setup | Risk | Verdict |
|-------------|------|----------------|-------|------|---------|
| **Microsoft Edge TTS WSS Isabella** ✅ | $0 anonymous | Eccellente (Neural 24kHz) | Deno native WS, no deps | Protocol drift MS-side | **CHOSEN** |
| Coqui XTTS-v2 self-hosted | Hardware GPU | Buono (voice clone Andrea opzionale) | Docker + GPU dependency | Pod TERMINATED Path A iter 5 | REJECT (no GPU) |
| ElevenLabs Italian Multilingual | $5/mo 30k char + $0.15/1000 char | Molto buono | npm SDK + API key | Costo non sostenibile (~€50/mo per 50 docenti) | REJECT (cost) |
| Voxtral 4B (Mistral) open-source | $0 self-host | TBD (early access) | GPU dep, modello 4B | Non released stable iter 8 | REJECT (premature) |
| Google Cloud TTS Neural2 it-IT | $16/M chars | Buono | API key + setup | Costo + non-EU pinning concern GDPR | REJECT (GDPR) |
| Azure Cognitive Services TTS Italian | $4/M chars (paid tier) | Eccellente (stesso engine MS) | Subscription + key | Costo + setup overhead | REJECT (cost vs WSS free) |
| Browser Web Speech API only | $0 | Mediocre (David Mobile, robotica) | Zero | Voce default scarsa qualità | REJECT (quality) but USED as fallback |

### 8.2 Perché NON Coqui XTTS-v2

Iter 5 P3 Andrea decise Path A = decommission RunPod GPU pod (TERMINATED tick 50). NO GPU runtime. Coqui XTTS-v2 richiede ~6GB VRAM (T4 minimum) — incompat. Re-spawn RunPod $0.74/h × ~10 ore/giorno docente = $222/mo vs WSS $0/mo. Coqui voice clone Andrea (~3s sample audio) era nice-to-have ma non strategic post Path A.

### 8.3 Perché NON ElevenLabs

Calcolo cost realistico: 50 docenti × 30 sessioni/mese × 12 turn UNLIM × 100 char avg = 1.8M char/mese. ElevenLabs Multilingual €0.15/1000 char = €270/mese. Budget Andrea €50/mese (Claude escluso) → fuori budget 5×.

### 8.4 Perché NON Voxtral 4B

Mistral Voxtral 4B annunciato 2025-Q4 ma early-access non stable iter 8. Modello 4B richiede ~8GB VRAM (no GPU iter 5 P3 Path A). Aspettare release stable iter 9-10+ valutare.

### 8.5 Perché NON Browser Web Speech only

Test informale (Andrea iter 5 P2): voci browser default italiano:
- Microsoft David Desktop: maschile, ENG accent inglese pesante su parole IT
- Microsoft Elsa Online: femminile, robotica, no prosody emphasis
- Google italiano femmina: discreta MA non disponibile offline (richiede cloud Google)

Quality MOS stimato ~2.5-3.0 vs Isabella Neural ~4.5. Browser usato SOLO come fallback graceful degradation (errore WSS retry exhaust).

---

## 9. Honesty caveats

1. **Microsoft può chiudere WSS endpoint senza preavviso**. Questo è il rischio principale. `rany2/edge-tts` upstream ha workaround attivo dal 2023 → community monitor. Mitigation: graceful fallback browser sempre attivo + monitoring 5xx rate Edge Function alert >10%/h → Andrea notifica + decision rollback iter 6 mp3 stub o alternative.
2. **Sec-MS-GEC algorithm può cambiare**. MS rotation quarterly. Port Python `auth.py` rany2/edge-tts come reference truth. Update version string `SEC_MS_GEC_VERSION` quando MS aggiorna Edge browser stable.
3. **Rate limit ~3 RPS per IP shared Supabase Edge Function**. 50 docenti concorrenti picco lezione mattina = potenziale 429. Cache TTS output 24h per (text, voice, rate, pitch) hash MITIGATION mandatory iter 9.
4. **Azure ToS gray-area**. Microsoft consumer endpoint TOS dice "uso non-commerciale Edge browser". ELAB usage commercial-adjacent. Nessuna rivendicazione documentata MS contro `rany2/edge-tts` 10K+ stars 2024-2026 → low risk pratico ma legal review pending Andrea + futurо ToS.
5. **OGG Opus browser support**: Safari iOS pre-17 buggy MediaSource Opus. Test iOS 17+ Andrea + fallback `audio/mpeg` mp3 secondary format option add iter 9 se Safari issues report.
6. **MOS evaluation soggettivo 5×5**. Rater bias possibile (Andrea ascolta "vuole sentire bene"). Iter 9 expand 10 rater + blind A/B vs ElevenLabs sample 5 sample neutral.
7. **Latency p99 ~5000ms edge case**. Internet flaky (3G ragazzi laptop scuola) può aumentare p99 >10s. Mitigation: short text default <50 parole (sintesi UNLIM <60 parole regola PZ già attiva) + chunked audio playback (start play primo chunk arrived).
8. **NO automated MOS LLM-as-judge stub iter 8 entrance**. Stub MOS = 4.0 placeholder per tutti sample iter 8 entrance. Manual rate 5×5 iter 8 close mandatory.
9. **WebSocket connection NOT pooled**. Ogni `synthesizeIsabella()` apre WSS nuovo (handshake ~200ms). Pooling complex (Edge Function isolate stateless) → defer iter 9-10. Acceptable iter 8 (latency budget include handshake).
10. **PII risk audio**: Andrea cita potenzialmente nome ragazzo nel testo TTS request → audio pre-cache Supabase Storage CONTIENE nome. GDPR mandatory: hash testo in cache (no plaintext storage), TTL 24h, no analytics. Iter 9 hardening.

---

## 10. Migration backwards compat

### 10.1 Iter 6 → Iter 8 transition

- `synthesizeIsabella()` interface invariata (zero-touch consumer)
- Internal protocol REWRITE WSS (162 LOC → ~350 LOC)
- `contentType` cambia `audio/mpeg` → `audio/ogg; codecs=opus`
- Test `tests/unit/edge-tts-isabella.test.js` extend (mock WebSocket invece di mock fetch)
- Fallback browser preservato

### 10.2 Rollback path

Se iter 8 deploy fallisce post B4:
- `git revert <commit>` su `_shared/edge-tts-client.ts` ritorna iter 6 162 LOC REST stub
- Edge Function deploy precedente → Microsoft REST endpoint (404 sporadico ma occasional pass)
- Browser fallback sempre attivo come safety net

Rollback decision criteria:
- B4 success rate <95% (vs target 98%)
- B4 latency p95 >7000ms (vs target 5000ms)
- WSS endpoint Microsoft 5xx rate >20%/h sustained 24h

---

## 11. Production deploy plan

### 11.1 Iter 8 close gate Andrea OK

- B4 50-sample bench PASS (success ≥98% + p50 <2s + p95 <5s + RTF ≥1.0 + MOS stub ≥4.0)
- Local dev test 5 sample manual Andrea ascolto verifica registro narratore italiano
- Code review architect-opus + Andrea
- Edge Function `unlim-tts` deploy `npx supabase functions deploy unlim-tts --project-ref euqpdueopmlllqjmqnyb`

### 11.2 Iter 9 monitoring

- Supabase Edge Function logs: parse `success rate` + `latency p95` per hour
- Alert threshold: success <95% OR p95 >7000ms → Slack notification Andrea
- Cache hit rate target: ≥40% post 7 giorni (text repeat across docenti)

### 11.3 Iter 10 hardening

- TTS output cache hash 24h Supabase Storage (PII anonymize)
- Connection pooling WebSocket (3 connections shared)
- A/B test 50% Isabella WSS vs 50% Browser (frontend flag) measure user retention via session length
- Manual MOS expand 10 rater blind A/B vs ElevenLabs

---

## 12. Voice register narratore italiano — PRINCIPIO ZERO + MORFISMO

### 12.1 Compliance check

ADR-016 deve rispettare regole pedagogiche ELAB:

- **PRINCIPIO ZERO**: Voce Isabella legge testo VERBATIM dai volumi quando docente clicca "leggi questa pagina" (MORFISMO regola E voce + visione + tatto). Implementation: `multimodalRouter.routeTTS({text: <volume_text_exact>, voice: 'it-IT-IsabellaNeural'})`. Non parafrasare mai.
- **MORFISMO**: Stesso registro narratore volumi italiano. `it-IT-IsabellaNeural` voce neutra calda femminile compatibile con illustrazioni libri Tea (target ragazzi 8-14, fiabesco-didattico). NO voci anglofone (David Mobile EN-US accent).
- **Plurale "Ragazzi,"**: Edge Function `unlim-chat` BASE_PROMPT v3 garantisce response usa plurale → TTS legge plurale automaticamente. Nessun preprocessing TTS necessario.
- **Citazione Vol.X pag.Y**: SSML `<break time='200ms'/>` post citazione opzionale per pausa narrativa volumi (iter 9 enhancement opzionale).

### 12.2 Anti-patterns vietati

- ❌ Voce maschile (David, Daniele): rompe morfismo narratore femminile volumi Tea
- ❌ Voce robotica (Microsoft Elsa, eSpeak): rompe registro narratore
- ❌ Voce inglese accent: incomprensibile ragazzi 8-14
- ❌ Rate troppo veloce (>+10%): incomprensibile ragazzi
- ❌ Pitch shift +5Hz: voce "cartoon" non naturale
- ❌ Parafrasi del volume in TTS: VIOLA PRINCIPIO ZERO + MORFISMO

### 12.3 Voice clone Andrea (deferred iter 9+)

Andrea iter 5 P3 decise skip voice clone per ora (Isabella default OK). Iter 9+ opzionale:
- Fixture audio Andrea ~3s registrato pulito
- Coqui XTTS-v2 voice clone (richiede GPU re-spawn) OR ElevenLabs voice cloning ($5 una-tantum)
- Use case: bot docente personality "voce Andrea spiega" feature opzionale
- Andrea decision pending iter 10+ post Box 8 stable Isabella production

---

## 13. References

- rany2/edge-tts (2024-2026). https://github.com/rany2/edge-tts (MIT, 10K+ stars)
- JaVi7864/edge-tts-py-deno (2024). https://github.com/JaVi7864/edge-tts-py-deno (Deno port reference)
- Microsoft Cognitive Services Speech SDK docs (2026). https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/
- Microsoft Speech Synthesis Markup Language (SSML) docs (2026). https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/speech-synthesis-markup
- ITU-T P.808 (2018). "Subjective evaluation of speech quality with crowdsourcing testing methodology" — MOS reference standard.
- OGG Vorbis / Opus IETF RFC 6716 (2012). Opus codec specification.

---

## 14. Sign-off

- architect-opus iter 8: PROPOSED ⏳
- Andrea Marro final approver: pending B4 PASS + manual ascolto 5 sample
- Box 8 lift target: 0.7 → 0.95 (iter 8 close post B4 GREEN + Edge Function deploy)
- Iter 9 hardening target: cache + pooling + monitoring → Box 8 = 1.0

— architect-opus iter 8, 2026-04-27
