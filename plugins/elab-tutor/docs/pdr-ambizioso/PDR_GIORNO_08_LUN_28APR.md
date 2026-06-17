# PDR Giorno 8 — Lunedì 28/04/2026

**Sett 2** (INFRA) | Andrea 8h + Tea 3h | Goal: **Together AI account + first Llama 70B integration test**.

## Pre-flight (9:00)
```bash
git status; git pull; npx vitest run --reporter=dot | tail -3
cat docs/handoff/2026-04-27-end-sett1.md
```

## Task del giorno
1. **(P0) Andrea: signup together.ai + API key + $25 free credit** (30 min)
2. **(P0) DEV: implementa `src/services/together-ai-client.js` OpenAI-compatible** (2h)
3. **(P0) TESTER: 10 query test Llama 70B (latency, Principio Zero v3)** (2h)
4. **(P0) ARCHITECT: blueprint integration UNLIM → Together AI fallback chain** (2h)
5. **(P1) TPM: backlog sett 2 dispatch tasks-board.json** (30 min)
6. **(P2) Tea: PR glossario aggiuntivo Vol 1 (auto-merge test)** (Tea 3h)

## Multi-agent dispatch (10:00)
```
@team-architect "ADR-003 Together AI integration. Output docs/decisions/ADR-003-together-ai.md."
@team-dev "Implement together-ai-client.js OpenAI-compatible. TDD strict."
@team-tester "10 query test Llama 70B. Acceptance: latency <3s, response Principio Zero v3 OK."
```

## PTC use case
**10 query Together AI parallel** (latency benchmark):
```python
import asyncio
from openai import AsyncOpenAI
client = AsyncOpenAI(api_key="...", base_url="https://api.together.xyz/v1")

async def query(q):
    import time; t = time.time()
    resp = await client.chat.completions.create(
        model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
        messages=[{"role": "user", "content": q}], max_tokens=200
    )
    return {"q": q, "latency": time.time() - t, "tokens": resp.usage.total_tokens}

QUERIES = ["spiegami LED", "cos'è resistenza", ...]  # 10 queries
results = await asyncio.gather(*[query(q) for q in QUERIES])
print({"avg_latency": sum(r["latency"] for r in results) / 10, "results": results})
```

## DoD
- [ ] Together AI key + $25 credit
- [ ] together-ai-client.js implementato + test
- [ ] 10 query latency report
- [ ] ADR-003 scritto
- [ ] Tea PR auto-merged
- [ ] Handoff doc

## Rischi
- Together AI signup credit non disponibile → contattare support
- Latency >5s (target <3s) → switch endpoint (Lepton, Replicate alternative)

## Handoff
`docs/handoff/2026-04-28-end-day.md`
