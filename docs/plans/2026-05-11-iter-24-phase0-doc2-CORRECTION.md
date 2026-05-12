# Doc-2 Mistral Pixtral CORRECTION — Live evidence post-doc-claim

**Data**: 2026-05-11
**Source**: live curl test Mistral API direct post Doc-2 BG report

## Correzione Doc-2 finding

Doc-2 claim:
> Pixtral 12B was deprecated Dec 2, 2025 and RETIRED Dec 31, 2025

**Live evidence prod 2026-05-11**:

```bash
curl -X POST "https://api.mistral.ai/v1/chat/completions" \
  -H "Authorization: Bearer $MISTRAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"pixtral-12b-2409","messages":[{"role":"user","content":"Test"}],"max_tokens":10}'
```

Response (HTTP 200 OK):
```json
{
  "id": "5fab70e9d24c4d53ad21c061d952b6d8",
  "created": 1778499348,
  "model": "pixtral-12b-2409",  ← MODEL ECHOED, NOT REDIRECTED
  "usage": {"prompt_tokens": 4, "total_tokens": 14, "completion_tokens": 10},
  "choices": [{"message": {"content": "Hello! 😊 How can I help you"}}]
}
```

**Verdict ONESTO**: Pixtral 12B `pixtral-12b-2409` STILL OPERATIVE prod LIVE Mistral La Plateforme.

## Hypothesis

1. Mistral docs claim deprecation Dec 2, 2025 + retire Dec 31, 2025 MA backward-compat preserved 5+ mesi past retire date (current date 2026-05-11 = ~4.5 mesi past stated retire)
2. Possibile retire postponed
3. Possibile docs aggiornati MA endpoint legacy preserved for paying customers

## Impact iter 24 Phase 3 plan

✅ **NO EMERGENCY MIGRATION needed**. Plan iter 24 Phase 3 multimodal Pixtral live real test kit Omaric = STILL VALID con `pixtral-12b-2409` model.

✅ Optional defensive iter 24+: aggiungere fallback chain `pixtral-12b-2409` → `ministral-3-14b-2512` → `gemini-2.5-flash` vision (defensive against future enforcement).

✅ Codebase 3 locations hardcoded `pixtral-12b-2409` (`mistral-client.ts:33,78` + `unlim-vision/index.ts:121`) = STILL FUNCTIONAL prod, NO breaking change.

## Anti-inflation G45 mandate

Doc-2 BG agent based finding on Mistral docs scraping. Real LIVE evidence verification CONTRADICTS docs claim. Andrea brutal mandate "NO compiacenza" applied: trust live evidence > docs claim.

## Iter 24 Phase 3 plan UNCHANGED

1. Andrea 5 foto kit Omaric upload `tests/fixtures/screenshots/real-kit-omaric/`
2. 3-shot Pixtral prompt examples specifici kit Omaric
3. GDPR on-device blur volti runtime verify
4. Bench 5 foto Pixtral detection accuracy + latency + cost

## Defensive iter 25+ optional

- Add Mistral API model availability check pre-call (HEAD probe)
- Fallback chain: Pixtral → Ministral → Gemini Vision
- Monitor Mistral docs for hard enforcement signals
