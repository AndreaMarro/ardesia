# Model Matrix Live Test — Iter 29 (2026-04-30)

**Author**: Claude (autonomous agent run)
**Mandate**: Andrea iter 21 — NO mock, NO fasullo. Live curl evidence file-system grounded.
**Project**: Supabase `euqpdueopmlllqjmqnyb` (UNLIM nanobot V2)
**Anon key used**: `VITE_SUPABASE_EDGE_KEY` from `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/.env` (legit prod token, JWT iat 1775142709 / exp 2090718709).
**Working dir**: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`
**Evidence dir**: `scripts/bench/output/voxtral-test/`

---

## Summary tabella

| Provider | Use case | LIVE | Latency p50 (server) | Latency p95 (server) | Quality | Cost stim | GDPR |
|----------|----------|------|----------------------|----------------------|---------|-----------|------|
| **Mistral Voxtral mini-tts-2603** | TTS primary (iter 29) | ✅ PASS 5/5 | **1181 ms** | **1186 ms** | Audio MP3 valid (29-40 KB) | $0.016/1k char | ✅ EU FR |
| Edge TTS Isabella Neural | TTS fallback 2 | ❌ FAIL | n/a | n/a | WebSocket protocol error → browser fallback marker | free | EU/MS |
| Mistral Pixtral 12B-2409 | Vision | ✅ PASS 1/1 | 1289 ms | 1289 ms | IT response, "Ragazzi" plural OK, 60 words | $0.15/1M tok | ✅ EU FR |
| Mistral Small / Large | LLM 65/20% | ⚠️ SKIP — auth | n/a | n/a | unlim-chat gates on `X-Elab-Api-Key` (server-only secret, NOT in local `.env`) | — | ✅ EU FR |
| Together Llama 3.3 70B | LLM 15% | ⚠️ SKIP — auth | n/a | n/a | same blocker | — | US |
| Gemini 2.5 Flash-Lite/Flash/Pro | LLM fallback | ⚠️ SKIP — auth | n/a | n/a | same blocker | — | US |
| Cloudflare Whisper Turbo | STT | ❌ FAIL 0/2 | n/a | n/a | CF Whisper 400 "Type mismatch '/audio', 'string' not in 'array','binary'" — both JSON `audio_base64` and multipart `audio` paths broken at server side | — | US |
| Cloudflare FLUX schnell | ImgGen | ✅ PASS 1/1 | 1330 ms (total) | 1330 ms | 160 KB JPEG (sic — file claims `data:image/png` but `file` reports JPEG) at 512x512 | $0.011/img | US |
| Voyage 3 + rerank-2.5 | Embeddings | ⚠️ NOT TESTED — embeddings invoked transitively via unlim-chat (gated). Code present in `_shared/rag.ts`. | — | — | — | $0.06/1M | US |

---

## 1. Voxtral test (5 sample IT) — ✅ PASS

curl POST `https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-tts` with body `{"text": "...", "provider": "voxtral"}`.

| # | Text | HTTP | Total ms | Server ms | MP3 size | Voice ID | Model |
|---|------|------|----------|-----------|----------|----------|-------|
| T1 | "Ragazzi, oggi accendiamo un LED rosso del kit ELAB." | 200 | 2623 | 1077 | 29555 B | c69964a6-… | voxtral-mini-tts-2603 |
| T2 | "Capitolo 6, pagina 42: il LED ha una gamba lunga e una gamba corta." | 200 | 1701 | 1222 | 39837 B | c69964a6-… | voxtral-mini-tts-2603 |
| T3 | "Prendete la breadboard. Inserite il LED in foglio E5 come nel libro." | 200 | 1539 | 1181 | 38710 B | c69964a6-… | voxtral-mini-tts-2603 |
| T4 | "Se non si accende, controllate la resistenza da 220 Ohm in serie." | 200 | 1558 | 1186 | 39915 B | c69964a6-… | voxtral-mini-tts-2603 |
| T5 | "Volume 2 pagina 88: la fotoresistenza cambia valore con la luce." | 200 | 1504 | 1037 | 38279 B | c69964a6-… | voxtral-mini-tts-2603 |

Aggregate (server-side X-Tts-Latency-Ms): n=5 min=1037 mean=1140 **p50=1181** **p95=1186** max=1222.

Files saved (MP3, MPEG ADTS layer III, 80 kbps 22.05 kHz mono, ID3v2.4):
- `scripts/bench/output/voxtral-test/voxtral-T1.mp3` (29555 B)
- `scripts/bench/output/voxtral-test/voxtral-T2.mp3` (39837 B)
- `scripts/bench/output/voxtral-test/voxtral-T3.mp3` (38710 B)
- `scripts/bench/output/voxtral-test/voxtral-T4.mp3` (39915 B)
- `scripts/bench/output/voxtral-test/voxtral-T5.mp3` (38279 B)

Headers confirmed for every request: `X-Tts-Provider: voxtral`, `X-Tts-Voice: c69964a6-ab8b-4f8a-9465-ec0925096ec8`, `X-Tts-Model: voxtral-mini-tts-2603`. **Iter 29 PRIMARY rollout: confirmed live in prod.**

---

## 2. LLM chain (5 prompts) — ⚠️ SKIP / BLOCKED

curl POST `unlim-chat` with anon JWT in `Authorization` and `apikey` headers.

Result: every request returned **HTTP 401** with body `{"success":false,"error":"unauthorized","reason":"missing X-Elab-Api-Key header"}`.

Root cause: `unlim-chat/index.ts` lines 117-127 enforce a server-side secret (`ELAB_API_KEY`) gate via `verifyElabApiKey()` from `_shared/guards.ts:66`. This secret is **set in Supabase Edge env** but NOT distributed in the local repo `.env`/`.env.local`/`.env.production` (only `VITE_SUPABASE_EDGE_KEY` is present). `automa/state/pixtral-vision-bench-results-MOCK.json` even documents this: `"ELAB_API_KEY BLOCKED iter 28 default → MOCK MODE; live mode pending Andrea provision"`.

| # | Prompt | HTTP | Latency ms | Body |
|---|--------|------|------------|------|
| A1 | "Spiega il LED rosso ai ragazzi 4 primaria" | 401 | 1189 | `{"success":false,"error":"unauthorized",...}` |
| A2 | "Cap.6 esp.1: cosa serve?" | 401 | 1340 | same |
| A3 | "Hello world Arduino C++" | 401 | 380 | same |
| A4 | "Perché il circuito non funziona se LED inverso?" | 401 | 275 | same |
| A5 | "Vol1 pag.45: legge di Ohm" | 401 | 299 | same |

**Status: NEEDS_CONTEXT**. Andrea must export `ELAB_API_KEY` to the agent's env (or write it to `.env` as `VITE_ELAB_API_KEY=…`) before LLM chain p50/p95 + provider routing (Mistral 65/20 vs Together 15 vs Gemini fallback) can be measured live.

Files saved (401 evidence):
- `scripts/bench/output/voxtral-test/chat-A1.json` … `chat-A5.json`

---

## 3. Vision Pixtral (1 sample) — ✅ PASS

curl POST `unlim-vision` body `{"prompt":"Cosa vedi nel circuito?", "images":["data:image/png;base64,…100x100 black PNG…"], "sessionId":"matrix-test-vision"}`.

- HTTP 200 in 2219 ms total (server `latencyMs: 1289`).
- Model: `pixtral-12b-2409` (Mistral EU).
- Response keys: `['success','response','model','provider','latencyMs']`. `provider: "mistral-eu"`.
- Italian response, 60 words, opens with "Ragazzi," (mandate plural ✅), no Vol/pag citation in output (input was a black square so understandable hallucinated kit description with LED/resistor/breadboard/9V battery + warning).

Excerpt (≤15 words): "Nel vostro kit ELAB Arduino vedo:".

File: `scripts/bench/output/voxtral-test/vision-V1.json`.

---

## 4. STT Whisper (1 sample) — ❌ FAIL

curl POST `unlim-stt` two ways. Input was the existing `voxtral-T1.mp3` (29555 B, valid MPEG ADTS).

| Mode | HTTP | Latency ms | Error |
|------|------|------------|-------|
| JSON `audio_base64` | 500 | 1065 | `"CF Whisper 400: AiError: Bad input: Error: required properties at '/' are 'audio': Type mismatch of '/audio', 'string' not in 'array','binary'"` |
| multipart `audio=@…` | 500 | 382 | identical CF error |

Server side bug: the Edge function's call into Cloudflare Whisper Turbo passes `audio` as a string, but CF AI runtime expects `Uint8Array` or `array`. This is a **regression** in `unlim-stt/index.ts` (CF API signature change unhandled). Files:
- `scripts/bench/output/voxtral-test/stt-S1.json` (json mode evidence)
- `scripts/bench/output/voxtral-test/stt-S1-multipart.json` (multipart evidence)

---

## 5. ImgGen FLUX schnell (1 prompt) — ✅ PASS (with caveat)

curl POST `unlim-imagegen` body `{"prompt":"circuito Arduino LED breadboard didattico", "sessionId":"matrix-test-img", "width":512, "height":512}`.

- HTTP 200 in 1330 ms.
- Response JSON: `success: true`, `model: "@cf/black-forest-labs/flux-1-schnell"`, `image: "data:image/png;base64,…"`.
- Decoded payload: 160142 B saved to `scripts/bench/output/voxtral-test/imggen-I1.png`.
- **Caveat**: `file(1)` reports the bytes as `JPEG image data, JFIF standard 1.01, … 512x512, components 3`. The Edge function labels the data URI as `image/png` but Cloudflare returns JPEG bytes. MIME label vs payload mismatch — should be fixed for proper Content-Type negotiation in clients.

File: `scripts/bench/output/voxtral-test/imggen-I1.png` (160142 B JPEG).

---

## 6. Edge TTS Isabella fallback — ❌ DOWN

Sanity probe: curl POST `unlim-tts` with `provider: "edge-tts"` to verify the iter 6 Microsoft Neural fallback path.

- HTTP 200, 871 ms, body `{"success":true,"source":"browser","text":"…","message":"Usa la sintesi vocale del browser.","edge_tts_error":"ws error: NetworkError: failed to connect to WebSocket: stream error received: unspecific protocol error detected"}`.
- Edge TTS WebSocket to Microsoft is failing on Supabase Deno runtime → server falls back to browser SpeechSynthesis marker. Production users still get audio because **Voxtral primary is now serving**, but the documented fallback chain is broken at step 2.

File: `scripts/bench/output/voxtral-test/tts-edge-fallback.mp3` (272 B JSON, not MP3).

---

## 7. Latency aggregate

Server-side latency reported via `X-Tts-Latency-Ms` and `latencyMs` body fields (excludes network).

| Provider | n | min | mean | p50 | p95 | max |
|----------|---|-----|------|-----|-----|-----|
| Voxtral TTS | 5 | 1037 | 1140 | **1181** | **1186** | 1222 |
| Pixtral Vision | 1 | 1289 | 1289 | 1289 | 1289 | 1289 |
| FLUX ImgGen | 1 | n/a | n/a (1330 total) | — | — | — |

Total round-trip (Mac → fra1 Supabase → upstream): Voxtral total ~1.5–2.6 s including TLS+queue.

---

## Honest gaps & blockers

1. **LLM chain entirely unmeasured**: `ELAB_API_KEY` not in agent env. 5/5 prompts returned 401. Cannot verify Mistral 65/20 routing, Together fallback, Gemini fallback, ≤60 words discipline, "Ragazzi" plural, Vol/pag citations, or fallback chain on real LLM responses. **Needs Andrea to provision `VITE_ELAB_API_KEY` in `.env`.**
2. **STT Whisper Turbo broken** server-side: CF AI API signature change unhandled in `unlim-stt/index.ts`. Both JSON and multipart paths return 500. Needs server-side fix (likely change `audio: bytesString` → `audio: [...uint8array]`).
3. **Edge TTS fallback (Isabella) broken**: WebSocket protocol error to Microsoft. Voxtral primary masks this in prod, but fallback resilience is gone.
4. **ImgGen MIME mislabel**: returns `data:image/png;base64,` but bytes are JPEG. Cosmetic but breaks strict consumers.
5. **Voxtral voice cloning IT pending Andrea audio sample** — current default voice ID `c69964a6-ab8b-4f8a-9465-ec0925096ec8` is the stock Voxtral voice (mandate doc).
6. **Voyage 3 + rerank-2.5 embeddings**: not exercised in isolation. Used internally by `unlim-chat` RAG (`_shared/rag.ts`) — couldn't reach because of LLM gate. No standalone embeddings function exposed.

## Score onesto stack G45

**6.0 / 10**

Breakdown:
- Voxtral TTS primary live + sub-1.2 s p50: +2 (genuine production win, iter 29 promise honored)
- Pixtral Vision live IT response: +1.5
- FLUX ImgGen live: +1
- LLM chain unverifiable from local agent: −2 (cannot validate the 65/20/15 routing claim, "Ragazzi" plural, citation discipline)
- STT broken in prod: −1.5
- Edge TTS fallback broken: −0.5 (masked by Voxtral, but fragile if Voxtral degrades)
- ImgGen MIME mislabel: −0.2 (cosmetic)
- Embeddings unmeasured: −0.3

This is the same anti-inflation scoring approach as G45. Self-score INFLATION risk noted: easy to claim 8/10 because "TTS works", but 3/8 measured providers fail or are unverifiable. **6.0 is honest.**

---

## Reproduction commands (record)

```bash
# Voxtral 5x
SUPABASE_URL="https://euqpdueopmlllqjmqnyb.supabase.co"
ANON_KEY="$VITE_SUPABASE_EDGE_KEY"   # from .env line 16
curl -sS -o T1.mp3 -D T1.headers \
  -X POST "$SUPABASE_URL/functions/v1/unlim-tts" \
  -H "Authorization: Bearer $ANON_KEY" -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text":"Ragazzi, oggi accendiamo un LED rosso del kit ELAB.","provider":"voxtral"}'

# Vision
curl -sS -X POST "$SUPABASE_URL/functions/v1/unlim-vision" \
  -H "Authorization: Bearer $ANON_KEY" -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Cosa vedi nel circuito?","images":["data:image/png;base64,…"],"sessionId":"matrix-test-vision"}'

# ImgGen
curl -sS -X POST "$SUPABASE_URL/functions/v1/unlim-imagegen" \
  -H "Authorization: Bearer $ANON_KEY" -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"circuito Arduino LED breadboard didattico","sessionId":"matrix-test-img","width":512,"height":512}'

# STT (FAILS — for reference)
curl -sS -X POST "$SUPABASE_URL/functions/v1/unlim-stt" \
  -H "Authorization: Bearer $ANON_KEY" -H "apikey: $ANON_KEY" \
  -F "audio=@voxtral-T1.mp3;type=audio/mpeg" -F "sessionId=matrix-test-stt" -F "language=it"

# LLM chat (FAILS — needs ELAB_API_KEY)
curl -sS -X POST "$SUPABASE_URL/functions/v1/unlim-chat" \
  -H "Authorization: Bearer $ANON_KEY" -H "apikey: $ANON_KEY" \
  -H "X-Elab-Api-Key: $ELAB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message":"Spiega il LED rosso","sessionId":"matrix-test-1"}'
```

---

## Status

**DONE_WITH_CONCERNS** — 3/8 providers PASS live (Voxtral, Pixtral, FLUX). 1/8 SKIP env (LLM chain). 2/8 FAIL prod regression (STT, Edge TTS fallback). 2/8 not exercised standalone (embeddings, Together fallback).

Provider PASS count: **3 / 8** verifiable in this run.
Audit file: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/audits/2026-04-30-iter-29-MODEL-MATRIX-LIVE-TEST.md` (~280 LOC).
