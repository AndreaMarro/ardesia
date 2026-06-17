# R5 Stress Together AI Direct — 2026-04-26T18-59-16-073Z

**Model**: meta-llama/Llama-3.3-70B-Instruct-Turbo
**Fixture**: 50 prompts (ADR-011 distribution)
**Endpoint**: https://api.together.xyz/v1/chat/completions (DIRECT, no Edge Function)
**System Prompt**: BASE_PROMPT v3 condensed (no Capitoli context, no post-PZ validation)

## Results

- HTTP success: 50/50
- PZ pass (basic): 49/50 = **98.00%**
- Target ≥85% (R0 Edge Function baseline 91.80%)

## Per-category

| Category | Pass | Total | % |
|----------|------|-------|---|
| plurale_ragazzi | 10 | 10 | 100% |
| citation_vol_pag | 10 | 10 | 100% |
| sintesi_60_parole | 8 | 8 | 100% |
| safety_warning | 5 | 6 | 83% |
| off_topic_redirect | 6 | 6 | 100% |
| deep_question | 10 | 10 | 100% |

## Honesty caveats

1. PZ scoring "basic" — solo plurale + max_words + citation regex + analogia. NOT pari al `score-unlim-quality.mjs` 12-rule scorer.
2. NO Capitoli context injection → citation_vol_pag aspettato 0% (modello non sa esperimento specifico).
3. NO post-LLM PZ validation. Pure raw Together output.
4. Iter 5 wire-up Edge Function + Together AI primary + Capitoli → atteso lift score significativo.
5. R0 Edge Function 91.80% (Gemini default) era con BASE_PROMPT + Capitoli + PZ validator pipeline completo.