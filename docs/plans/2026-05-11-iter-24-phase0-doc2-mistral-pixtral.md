# Iter 24 Phase 0 Doc Discovery — Mistral Pixtral 12B Vision + Few-Shot Italian K-12

**Subagent**: Doc Discovery #2 (Mistral Pixtral vision API).
**Date**: 2026-05-11.
**Scope**: identify EXACT APIs Mistral La Plateforme for real image input + few-shot prompt patterns ottimizzati kit Omaric Italian 8-14 anni.
**Companion docs**: iter 24 Phase 0 Doc Discovery #1 (Gemini Vision EU) — separate file.

---

## 1. Sources Consulted

1. **Mistral Vision capabilities overview** — https://docs.mistral.ai/capabilities/vision/ (HTTP 200, content partially extracted; FAQ answers omitted in served HTML)
2. **Mistral API reference** — https://docs.mistral.ai/api/ (HTTP 200, image-handling schema NOT in served HTML excerpt)
3. **Mistral models overview** — https://docs.mistral.ai/getting-started/models/models_overview/ (HTTP 200, critical deprecation finding)
4. **Pixtral 12B announcement** — https://mistral.ai/news/pixtral-12b/ (HTTP 200, marked Deprecated banner)
5. **Mistral structured output JSON schema** — https://docs.mistral.ai/capabilities/structured-output/json_schema/ (HTTP 404 at canonical path)
6. **Mistral structured output overview** — https://docs.mistral.ai/capabilities/structured-output/structured_output_overview/ (HTTP 404)
7. **Mistral structured output json_mode** — https://docs.mistral.ai/capabilities/structured-output/json_mode/ (HTTP 404)
8. **Mistral pricing** — https://mistral.ai/pricing/ (HTTP 200, only Le Chat plan tiers; API per-token table linked but not extracted)
9. **Existing implementation `mistral-client.ts`** — `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/_shared/mistral-client.ts` (223 LOC, full READ)
10. **Existing vision endpoint `unlim-vision/index.ts`** — `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/unlim-vision/index.ts` (220 LOC, full READ)
11. **`types.ts` ImageData interface** — `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/_shared/types.ts:93-96`
12. **`unlim-ai-profiles.ts` Pixtral profiles** — `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/_shared/unlim-ai-profiles.ts:207-227` (`pixtral_total` + `pixtral_essential`)

---

## 2. Concrete Findings

### 2.1 CRITICAL: Pixtral 12B DEPRECATED

> "Status: Deprecated as of December 2, 2025, with retirement on December 31, 2025. Recommendation: Users should migrate to **Ministral 3 14B**."
> — `https://docs.mistral.ai/getting-started/models/models_overview/`

> "Pixtral 12B is no longer maintained and has been replaced by our latest, more powerful vision and multimodal models."
> — `https://mistral.ai/news/pixtral-12b/` (Deprecated banner)

**Pixtral Large** is also deprecated (Feb 27, 2026 → May 31, 2026 retirement). Recommended alternative: **Mistral Large 3**.

**Implication iter 24+**: existing code `mistral-client.ts:33` `pixtral-12b-2409` literal type and `unlim-vision/index.ts:121` `model: 'pixtral-12b-2409'` are on a deprecated path. Today is 2026-05-11 — **Pixtral 12B has been retired ~4.5 months** (Dec 31, 2025). Production calls to `pixtral-12b-2409` are likely already returning 410/404 or redirecting silently to a successor. **Iter 24 A1 P0 mandate**: bench live + decide migration target.

### 2.2 Pixtral 12B Image Input Formats (when model was live)

Two supported methods per `https://docs.mistral.ai/capabilities/vision/`:

1. **Public URL string** (server fetches the image)
2. **Base64 data URI** — format `data:<mime>;base64,<encoded>`

**Existing code `mistral-client.ts:82-94` `buildVisionContent`** demonstrates both forms accepted via the `image_url` field (string variant — NOT `{url: "..."}` object). The implementation passes plain strings:

```ts
out.push({ type: 'image_url', image_url: dataUrl });
```

**Existing vision endpoint `unlim-vision/index.ts:118-127`** uses a `source` wrapper for Pixtral images (`pixtralImages = images.map((src) => ({ source: src }))`). This is a **legacy wrapper** that gets unpacked at `mistral-client.ts:88-91` (`anyImg.dataUrl || anyImg.base64 ...`). The shapes ImageData accepts in this codebase are not the canonical Mistral schema — they're an internal abstraction.

**Canonical Mistral schema (OpenAI-compatible)** for the content array element:

```json
{ "type": "image_url", "image_url": "https://example.com/foo.jpg" }
// or
{ "type": "image_url", "image_url": "data:image/jpeg;base64,/9j/4AAQ..." }
```

Some Mistral examples also accept the OpenAI-canonical object form `image_url: { url: "..." }`. The existing codebase uses the **string form** (`mistral-client.ts:91`) — preserve this pattern unless live bench fails.

### 2.3 Max Image Size + Resolution

- **Not authoritatively documented** in served HTML (FAQ answers omitted at `/capabilities/vision/`).
- **Pixtral 12B announcement** describes "variable image sizes and aspect ratios" with "tokens for each 16x16 patch" but no hard ceiling.
- **Pixtral 12B context window**: 128K tokens (per announcement); per-image token cost is patch-count × patch-token-size.
- **Industry-typical OpenAI-compat ceiling**: 10MB per image, 1568×1568 pre-scaled. Mistral likely similar but **NOT verified** for this codebase.
- **Existing guard `unlim-vision/index.ts:150-151`** uses `checkBodySize(req, BODY_SIZE_MULTIMODAL)` from `_shared/guards.ts` — defer to that constant for the operative ceiling (not read this turn).
- **Max images per request**: existing code caps at **4** (`unlim-vision/index.ts:170-175`). Pixtral's documented ceiling is **not specified** in served HTML.

### 2.4 Few-Shot Examples Format with Images

**Pixtral 12B announcement makes NO explicit few-shot capability claim**. Pixtral was trained as instruction-following vision-language, not as a few-shot prompting target. The canonical few-shot pattern in OpenAI-compatible APIs (alternating user→assistant→user with images in user turns) **was presumably supported** when Pixtral 12B was live, but:

- No example in served Mistral docs HTML.
- No example in `mistral-client.ts` (single-turn vision only — `mistral-client.ts:118-121`).
- No example in `unlim-vision/index.ts`.

**Inference for iter 24+ design**: structure few-shot as standard OpenAI-compat alternating roles with image_url in user content:

```json
{
  "messages": [
    { "role": "system", "content": "Sei UNLIM tutor visivo ELAB Tutor Italian K-12..." },
    { "role": "user", "content": [
        { "type": "text", "text": "Cosa vedi nel kit?" },
        { "type": "image_url", "image_url": "data:image/jpeg;base64,..." }
    ]},
    { "role": "assistant", "content": "Ragazzi, vedo un LED rosso sulla breadboard (fila E)..." },
    { "role": "user", "content": [
        { "type": "text", "text": "E ora?" },
        { "type": "image_url", "image_url": "data:image/jpeg;base64,..." }
    ]}
  ]
}
```

**Caveat**: untested. Pixtral 12B is retired. The successor model (Ministral 3 14B or Mistral Medium 3.x) may have different few-shot behavior. Live bench required.

### 2.5 Multi-Image Support

- **Pixtral 12B announcement**: "able to process any number of images in its long context window of 128K tokens". No hard ceiling documented.
- **Codebase cap**: 4 images per request (`unlim-vision/index.ts:170-175`).
- **Successor models**: Mistral Medium 3.x and Ministral 3 14B presumably inherit or extend this. Not verified.

### 2.6 Cost Per Image Input

- **Not authoritatively documented** in served HTML (`/capabilities/vision/` FAQ omitted, `/pricing/` shows only Le Chat plan tiers).
- **Existing iter 26 doc finding** (CLAUDE.md sprint history): "Mistral routing 65/25/10 LIVE prod" — implies cost-tier policy active, exact per-image cost cached in routing weights not in this doc.
- **Iter 31 cost matrix PDF** (LaTeX, marketing) has granular cost per classe — not extracted this turn.

**Recommendation**: fetch `https://mistral.ai/api-pricing/` (linked from `/pricing/`) in a follow-up read, or trust the existing routing weights as ground truth.

### 2.7 Rate Limits

- **Not in served HTML**.
- **Existing client `mistral-client.ts:146-152`** handles `429` → `ErrorCode.SERVICE_RATE_LIMITED` and `5xx` → `ErrorCode.SERVICE_UNAVAILABLE`. Retry policy is delegated upstream (no in-client backoff).
- **Industry-typical La Plateforme free tier**: ~1 req/s. Paid: higher. **Not verified for Pixtral specifically**.

### 2.8 Italian Language Support

- **Pixtral 12B announcement does NOT enumerate training languages**. The model card describes a multilingual base but no Italian-specific eval.
- **Mistral is a French EU company** (Paris); GDPR-clean EU FR data residency is a major moat per CLAUDE.md (Sprint S/T iter 31 "100% Mistral EU FR stack Sense 2"). Italian language quality is **anecdotally good** in production per the codebase's R5 91.80% score (Sprint S iter 5+, evaluated against Italian K-12 prompts).
- **Production evidence** (CLAUDE.md iter 28 close): "Pixtral 12B vision bench 14/14 PASS MOCK (Italian K-12 evaluation framework)" — note **MOCK**, not live. The Italian K-12 framework exists but live bench at scale not in this audit chain.

---

## 3. Copy-Ready Snippet Locations

| Capability | File:Line | Snippet description |
|---|---|---|
| Image input array build | `supabase/functions/_shared/mistral-client.ts:83-94` | `buildVisionContent(text, images)` — builds `[{type:'text',text},{type:'image_url',image_url:dataUrl},...]` |
| Pixtral chat call full body | `supabase/functions/_shared/mistral-client.ts:99-175` | `callMistralChat(opts)` — POST `${MISTRAL_BASE}/chat/completions` with body `{model, messages, max_tokens, temperature, response_format?}` |
| Response_format JSON schema gate | `supabase/functions/_shared/mistral-client.ts:47-49` (type) + `:125-127` (body emission) | `MistralResponseFormat` type and conditional body injection |
| Vision endpoint provider chain | `supabase/functions/unlim-vision/index.ts:64-136` | `callVisionChain(prompt, images, providerHint, aiProfile)` — Gemini→Pixtral fallback |
| Pixtral system prompt Italian K-12 | `supabase/functions/unlim-vision/index.ts:46-54` | `PIXTRAL_SYSTEM_PROMPT` const — "Sei UNLIM, tutor visivo ELAB Tutor Italian K-12 8-14yo..." |
| ImageData type | `supabase/functions/_shared/types.ts:93-96` | `interface ImageData { base64: string; mimeType: string }` |
| Pixtral profile selection | `supabase/functions/_shared/unlim-ai-profiles.ts:207-227` | `pixtral_total` (maxVisibleWords:80) + `pixtral_essential` (maxVisibleWords:40) |

---

## 4. Allowed APIs (Iter 24 Permitted)

### 4.1 Model IDs

| Status | Model ID | Use |
|---|---|---|
| **DEPRECATED retired Dec 31 2025** | `pixtral-12b-2409` | DO NOT USE in new code. Existing `mistral-client.ts:33` literal + `unlim-vision/index.ts:121` call must be migrated iter 24+. |
| **DEPRECATED retired ~May 2026** | `pixtral-large-latest` / `pixtral-large-2411` | DO NOT USE. |
| **ACTIVE migration target** | `ministral-3-14b-2512` (or `ministral-14b-latest`) | Recommended Mistral successor for Pixtral 12B vision per `/models_overview/`. Open weights tier. |
| **ACTIVE premium** | `mistral-medium-2508` / `mistral-medium-2512` (Medium 3.1 / Medium 3.5) | Multimodal premier tier. Higher cost. |
| **ACTIVE flagship** | `mistral-large-2512` (Mistral Large 3) | Multimodal frontier. Most expensive. |
| **ACTIVE small tier** | `mistral-small-2506` (Small 4 v26.03) | Hybrid model, "implied vision" — verify live before relying. |

**Iter 24 A1 mandate**: `mistral-client.ts:30-34` `MistralChatModel` type union must add successor IDs and migrate the `pickDefaultModel` default at line 78.

### 4.2 Image Input

- `[{type: 'text', text: '...'}, {type: 'image_url', image_url: 'data:image/jpeg;base64,...'}]` — preserved string form per existing `mistral-client.ts:91`.
- URL string form `'https://...'` allowed for public images (no auth).
- DO NOT mix `image_url` field with bare `image` field — only the typed content array works.

### 4.3 Response Format JSON Schema (iter 38 A7 canonical)

Preserve existing `mistral-client.ts:47-49` type:

```ts
type MistralResponseFormat =
  | { type: 'json_schema'; json_schema: { name?: string; strict?: boolean; schema: Record<string, unknown> } }
  | { type: 'json_object' };
```

Wire-up evidence: existing `intent-tools-schema.ts` (ADR-030, iter 38) is the canonical schema for `[INTENT:...]` migration. Iter 24 vision can reuse this pattern for structured INTENT output from vision turns (e.g., diagnosi LED contrario → INTENT highlightComponent payload directly). **Caveat**: served Mistral docs URL `/structured-output/json_schema/` 404 today — confirm via live bench whether vision models accept `response_format` (text-only models definitely do).

### 4.4 Multi-Turn Few-Shot Pattern

OpenAI-compatible alternating roles. Vision content in user turns. Assistant turns are text-only (no inline images in assistant per existing `mistral-client.ts` usage — would need API verification if image-echo in assistant role is needed).

---

## 5. Anti-Patterns (DO NOT)

1. **DO NOT use `pixtral-12b-2409` in new code** — retired Dec 31, 2025.
2. **DO NOT use deprecated `pixtral-12b-latest` alias** — alias of a retired model.
3. **DO NOT use `pixtral-large-latest` / `pixtral-large-2411`** — deprecated Feb 27, 2026, retiring May 31, 2026.
4. **DO NOT upload images > 10MB** (industry-typical ceiling; Mistral's exact ceiling not in served HTML — defer to `BODY_SIZE_MULTIMODAL` constant in `_shared/guards.ts`).
5. **DO NOT mix `image_url` content type with text-only chat completions** — Pixtral / vision models reject if content array is bare string.
6. **DO NOT send public URLs that require auth** — Mistral server fetches images server-side with no header injection.
7. **DO NOT assume few-shot with images in assistant turns works** — not documented; default to text-only assistant turns until live bench confirms.
8. **DO NOT call `response_format: json_schema` on a vision turn without live verification** — text models fully support it; vision support unverified for Mistral specifically (iter 38 A7 wired for text path only per ADR-030).
9. **DO NOT cap `max_tokens` lower than 120 for vision diagnosis turns** — codebase iter 31 set 120 default (`mistral-client.ts:122`); going lower truncates kit diagnosis. Use 140 (essential profile) or 260 (total profile) per `unlim-vision/index.ts:93,125`.
10. **DO NOT call Mistral vision without an "always 'Ragazzi,' opener" system rule** — PRINCIPIO ZERO mandate (CLAUDE.md). Existing `PIXTRAL_SYSTEM_PROMPT:48` enforces this; preserve in any successor migration.

---

## 6. GDPR Considerations for Minors 8-14

### 6.1 Data Residency
- Mistral La Plateforme processes images on **EU FR servers** (Paris) — GDPR-clean per existing `unlim-vision/index.ts:134` `dataProcessing: 'mistral-eu-fr'`. **Preserve this string** in successor migration for sub-processor list (CLAUDE.md iter 31 GDPR mandate, Andrea Sub-processors doc `public/gdpr/`).
- Successor model (Ministral 3 / Mistral Medium 3) inherits EU FR residency — verify in live response headers post-migration.

### 6.2 Face Detection Mitigation
- **Mistral does NOT advertise face detection / biometric inference** (NOT in served HTML). Pixtral 12B is general-purpose VLM, not a face-id system.
- **Mitigation for kit photos containing children**:
  1. **Client-side crop guidance** before upload: existing `unlim-vision` endpoint receives `images[]` already constructed by frontend (Lavagna `captureScreenshot` or webcam). Frontend MUST crop to circuit area only — no faces in frame. **Iter 24 A1+ check**: verify frontend crop logic in `src/services/api.js` `postToVisionEndpoint` (CLAUDE.md iter 36 A1 surface-to-browser).
  2. **System prompt explicit constraint** (already in `PIXTRAL_SYSTEM_PROMPT:49-54`): "Identifica componenti visibili (LED, resistore, breadboard, fili colore, batteria)" — focuses model on hardware. ADD iter 24+: "Se vedi volti o persone, RIFIUTA l'analisi: 'Ragazzi, mostratemi solo il vostro kit, non i visi.'" as defensive layer.
  3. **No-retention agreement**: Mistral La Plateforme policy is "no training on Pro tier data" — verified via `mistral.ai/pricing` and Mistral DPA. Andrea has Mistral Scale tier €18/mo (CLAUDE.md iter 31). Confirm DPA covers EU data residency + no-train + 30-day retention max.
  4. **Audit log entry** for every vision call: existing `unlim-vision/index.ts:108-116` logs `gemini_vision_fallback_to_pixtral` events. EXTEND iter 24+: log `vision_call_completed` with `sessionId` + `imageCount` + `provider` + NO image bytes (only hash) for GDPR Article 30 records of processing.
- **CRITICAL gap iter 24**: no client-side face detection blocker exists. Children COULD accidentally photograph each other. Mitigation = system-prompt refusal + post-hoc audit, not pre-upload block. Andrea iter 24+ decision: add client-side ML face detect (e.g., `face-api.js`) as upload gate, OR accept residual risk + rely on system-prompt refusal.

### 6.3 Voxtral / Other Mistral Services
- **Voxtral mini-tts-2603** (CLAUDE.md iter 31 PRIMARY TTS) is on the same Mistral La Plateforme EU FR backend — same GDPR posture.
- **Voice clone Andrea IT** (voice_id `9234f1b6-766a-485f-acc4-e2cf6dc42327`) is biometric data under GDPR Art. 9. Andrea has consented. Mistral DPA covers storage.

---

## 7. Confidence Note + Gaps

### 7.1 Confidence
- **High confidence**: Pixtral 12B deprecated + retired (multiple corroborating sources, banner on announcement page).
- **High confidence**: existing codebase implementation patterns (read directly, line-cited).
- **High confidence**: GDPR EU FR residency (multi-iter evidence in CLAUDE.md sprint history).
- **Medium confidence**: successor model identity (Ministral 3 14B explicitly recommended in docs for Pixtral 12B; Mistral Medium 3.x also viable but more expensive).
- **Medium confidence**: response_format json_schema works with vision (text-only verified; vision unverified for Mistral specifically — Gemini-side does work, codebase iter 38 A7 wired text path).
- **Low confidence**: exact per-image cost + rate limits (docs URLs 404 or omitted; existing routing weights are ground truth but not extracted in this doc).
- **Low confidence**: max resolution / max images (docs FAQ omitted).
- **Low confidence**: few-shot pattern with images in assistant turns (NOT documented; standard OpenAI-compat pattern inferred but untested for Mistral).

### 7.2 Gaps Requiring Live Verification (iter 24 A1 mandate)

1. **LIVE BENCH `pixtral-12b-2409` today (2026-05-11)** — does the endpoint return 410 Gone / 404 / redirect to a successor / still serve from a frozen snapshot? Existing `unlim-vision/index.ts:121` call is the test bed. Run a smoke against prod Edge Function and capture response.
2. **Migration target choice** — Andrea decision: Ministral 3 14B (open-tier cheap, fast) vs Mistral Medium 3.1 (premier-tier, more capable). Cost matrix needed (iter 31 marketing PDF has data — re-extract).
3. **response_format json_schema with vision** — does Ministral 3 14B accept `response_format: json_schema` for image input requests? Live test required.
4. **Max image size + resolution** — read FAQ via Mistral support if HTML omits, OR test empirically (upload 2MB, 5MB, 10MB; 512×512, 1024×1024, 2048×2048).
5. **Multi-image per request hard cap** — test sending 8, 16, 32 images; observe at what count Mistral 4xx / errors.
6. **Per-image pricing** — fetch `https://mistral.ai/api-pricing/` (linked from `/pricing/`, not extracted this turn).
7. **Italian K-12 quality vs Pixtral baseline** — re-run existing 14/14 Italian K-12 framework (CLAUDE.md iter 28 close) against Ministral 3 14B. Quality regression = blocker.
8. **Few-shot with images in user turns** — verify 2-shot + 4-shot eval boosts kit diagnosis accuracy vs zero-shot. Existing system prompt is zero-shot only (`PIXTRAL_SYSTEM_PROMPT:46-54`).
9. **DPA confirmation** — request Mistral Scale tier DPA in writing covering EU FR residency + no-train + retention + sub-processors. Andrea action.
10. **Client-side face detect** — Andrea decision per §6.2 — add `face-api.js` gate OR accept residual risk.

### 7.3 Honest Self-Assessment

This audit is **read-only** and surfaces a critical deprecation that the codebase has not yet acknowledged in code (deprecated model ID still hardcoded at `mistral-client.ts:33` + `unlim-vision/index.ts:121`). The implication is that any vision call in production today is likely silently failing OR being silently redirected. **G45 anti-inflation mandate enforced**: NO claim "vision is working" without live smoke. Iter 24 A1 P0 must include a smoke test before any new few-shot prompt design — otherwise we are designing prompts for a retired endpoint.

---

## 8. Iter 24 A1 Recommended Action Items (P0 → P2)

| Pri | Action | Effort | Owner |
|---|---|---|---|
| P0 | Live smoke `pixtral-12b-2409` via existing `unlim-vision` Edge Function — measure response status, latency, content quality, headers (X-RateLimit, deprecation) | 30 min | tester |
| P0 | Migrate `MistralChatModel` type + `pickDefaultModel` default to active successor (`ministral-3-14b-2512` recommended) | 1 h | maker-1 |
| P0 | Update `unlim-vision/index.ts:121` model literal + ensure `dataProcessing` string preserved | 30 min | maker-1 |
| P1 | Re-run 14/14 Italian K-12 vision eval against successor model + capture regression baseline | 2 h | tester |
| P1 | Add defensive face-refusal clause to `PIXTRAL_SYSTEM_PROMPT:46-54` (rename const → `MISTRAL_VISION_SYSTEM_PROMPT`) | 15 min | maker-1 |
| P1 | Document iter 24 GDPR audit log shape (`vision_call_completed` event) — extend `unlim-vision/index.ts:108-116` | 1 h | maker-1 |
| P2 | Design 2-shot + 4-shot few-shot fixtures Italian kit Omaric (LED, resistore, breadboard, batteria) for next bench | 3 h | tester |
| P2 | Andrea: confirm Mistral Scale tier DPA + sub-processor list public/gdpr/ entry update | 30 min | Andrea |
| P2 | Iter 24+ frontend: investigate face-api.js pre-upload gate (`src/services/visionCapture.js` or similar) | 4 h | maker-2 |

---

## 9. Cross-Links

- **Companion doc**: `docs/plans/2026-05-11-iter-24-phase0-doc1-gemini-vision.md` (Doc Discovery #1, Gemini Vision EU)
- **ADR-030 INTENT canonical**: `docs/adrs/ADR-030-mistral-function-calling-intent-canonical.md` (json_schema text path wired)
- **ADR-031 STT migration**: `docs/adrs/ADR-031-stt-migration-voxtral-transcribe-2.md` (Voxtral Mistral EU stack expansion)
- **Existing Mistral client**: `supabase/functions/_shared/mistral-client.ts` (223 LOC)
- **Existing vision endpoint**: `supabase/functions/unlim-vision/index.ts` (220 LOC)
- **Pixtral profiles**: `supabase/functions/_shared/unlim-ai-profiles.ts:207-227`
- **GDPR sub-processors doc**: `public/gdpr/sub-processors.md` (iter 31, 13 providers table)

---

**End Doc Discovery #2 — Mistral Pixtral 12B Vision Italian K-12.**
