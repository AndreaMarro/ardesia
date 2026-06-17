# PDR Giorno 10 — Mercoledì 30/04/2026

**Sett 2** | Andrea 8h + Tea 3h | Goal: **RunPod serverless EU + Mistral 24B endpoint setup**.

## Pre-flight
```bash
git status; git pull; npx vitest run --reporter=dot | tail -3
ssh elab-prod 'docker ps'  # CX31 verify ieri
```

## Task del giorno
1. **(P0) Andrea: signup RunPod + $20 credit + EU Amsterdam region select** (30 min)
2. **(P0) Andrea: create serverless endpoint Mistral Small 3 24B (template Anyscale)** (1h)
3. **(P0) DEV: implementa `src/services/runpod-client.js` HTTP wrapper + retry** (2.5h)
4. **(P0) TESTER: cold start latency test (target <30s, warm <2s)** (2h)
5. **(P1) ARCHITECT: ADR-006 RunPod vs Modal Labs vs Replicate** (1h)
6. **(P1) Tea: PR esperimenti vol1 cap 5 (auto-merge)** (Tea 3h)

## Multi-agent dispatch
```
@team-dev "runpod-client.js HTTP wrapper. Retry 3x exponential backoff. timeout 60s."
@team-tester "10 cold start cycle test. Misura: cold start time, warm latency, cost per query."
@team-architect "ADR-006 RunPod vs alt. Cost analysis 100h GPU/mese."
```

## PTC use case
**10 cold start cycle measurement parallel**:
```python
import asyncio
import aiohttp
import time

async def cold_start_cycle(idx):
    # Wait long enough for endpoint to scale to zero
    await asyncio.sleep(60 if idx > 0 else 0)
    t0 = time.time()
    async with aiohttp.ClientSession() as s:
        async with s.post("https://api.runpod.ai/...", json={"prompt": "Hello"}, timeout=120) as resp:
            data = await resp.json()
    return {"cycle": idx, "cold_start_s": time.time() - t0}

results = await asyncio.gather(*[cold_start_cycle(i) for i in range(10)])
```

## DoD
- [ ] RunPod serverless endpoint creato + invokable
- [ ] runpod-client.js implementato + test
- [ ] Cold start avg <30s misurato
- [ ] ADR-006 scritto
- [ ] Tea PR auto-merged
- [ ] Handoff

## Rischi
- Mistral 24B template Anyscale outdated → custom template Docker
- Cold start >60s consistent → switch Modal Labs
- $20 credit esaurito veloce → cap test cycles

## Handoff
`docs/handoff/2026-04-30-end-day.md`
