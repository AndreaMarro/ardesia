# PDR Giorno 22 — Lunedì 12/05/2026

**Sett 4** (ONNISCIENZA) | Andrea 8h + Tea 4h | Goal: **PTC use case 6 — Vol 1+2+3 chunk generation 5500+ parallel**.

## Task del giorno
1. **(P0) DEV: PTC use case 6 split chunks parallel Vol 1+2+3** (3h)
2. **(P0) DEV: 5500+ chunk generated semantici (paragraph-aware)** (1h)
3. **(P0) TESTER: chunk quality test (no fragmenti, paragrafi, source attributi)** (2h)
4. **(P0) ARCHITECT: ADR-010 chunk strategy (semantic vs sliding window)** (1h)
5. **(P2) Tea: PR Vol 2 cap 2-3 esperimenti** (Tea 4h)

## Multi-agent dispatch
```
@team-architect "ADR-010 chunk strategy. Semantic (paragraph-aware) vs sliding window 500 char. Output ADR."
@team-dev "PTC use case 6 (vedi PROGRAMMATIC_TOOL_CALLING.md). Output 5500+ chunk in src/data/rag-chunks-v2.json."
@team-tester "Chunk quality: avg size 400-500, no orphan paragraph, source attribution 100%."
```

## PTC use case 6
Vedi PROGRAMMATIC_TOOL_CALLING.md sez 3 use case 6 per codice completo (split chunks parallel 3 vol).

## DoD
- [ ] 5500+ chunk in rag-chunks-v2.json
- [ ] Quality test PASS (semantic OK)
- [ ] ADR-010 scritto
- [ ] Tea PR
- [ ] Handoff

## Rischi
- PDF text extraction errori OCR → fallback Tesseract pages problematiche
- Chunk troppo piccoli (<200 char) → adjust threshold

## Handoff
`docs/handoff/2026-05-12-end-day.md`
