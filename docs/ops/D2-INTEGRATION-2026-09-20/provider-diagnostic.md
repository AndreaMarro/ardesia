# Provider diagnostic — Kimi 404 (separate lane, no product change)

## Observed (redacted, no secrets)

- KIMI_API_KEY: present in environment (presence only, value never read/printed).
- Live probe (synthetic prompt, 2026-09-20): `RuntimeError: Kimi API
  returned HTTP 404: {"code":5,"error":"url.not_found",...,"url":"/anthropic/chat/completions"}`.
- Base URL source: **override** (`KIMI_BASE_URL` set in environment).
- Override shape (boolean probes only, value undisclosed): ends with
  `/anthropic`: **true**; ends with `/v1`: false.
- Provider defaults: model `kimi-k2-0905-preview`, timeout 120s.
- Request construction (unit-proven with fake transport,
  `test_llm_kimi.py::TestKimiRequestContract` + mutation control):
  `POST {base}/chat/completions`, OpenAI-compatible body
  `{model, messages:[{role:user,content}]}`, Bearer auth, 120s timeout.

## Classification

**LOCAL_CONFIGURATION** (not CODE_REQUEST_CONSTRUCTION).

The environment override points at an Anthropic-API-shaped gateway base,
while `KimiProvider` speaks the OpenAI-compatible shape it documents
(`{base}/chat/completions`). Effective request path
`<gateway>/anthropic/chat/completions` 404s server-side. The code honors
its contract; the default (`https://api.moonshot.ai/v1`) was not exercised
(changing endpoint config is an owner decision, not a code fix).

## Consequences

- No product fix, no separate fix PR (§52: config/account, not code bug).
- LIVE_MODEL_PATH=NOT_RUN. REAL_QUALITY_PILOT stays blocked.
- Kimi/live-provider debt remains a separate lane from deterministic
  pipeline correctness (unchanged principle).
