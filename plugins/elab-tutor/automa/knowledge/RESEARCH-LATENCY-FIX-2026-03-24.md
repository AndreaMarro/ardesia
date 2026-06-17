# Ricerca: Come ridurre latenza Galileo da 19.8s a <5s

**Data**: 24/03/2026
**Tipo**: RESEARCH con conseguenze dirette
**Severity**: BLOCKER

## Breakdown Latenza Attuale

- Render cold start: ~30s (free tier spins down dopo 15min)
- Render warm overhead: 50-200ms
- AI Provider API (DeepSeek racing): 7-15s
- Total warm: 17-20s | Total cold: 45s+

## Benchmark Provider (da ricerca web 2026)

| Provider | TTFT | Output speed | Free tier |
|----------|------|-------------|-----------|
| **Groq Llama 3.1 8B** | **0.3-0.5s** | 680-840 t/s | 30 req/min, 14400/day |
| Gemini 2.5 Flash-Lite | 0.46s | 144 t/s | 15 req/min, 1000/day |
| Gemini 2.5 Flash | 0.5-0.8s | 120 t/s | 10 req/min, 250/day |
| DeepSeek V3 | **7.0-7.5s** | 30-40 t/s | Varies |
| Kimi | 2-3s | 50 t/s | Limited |

**Groq è 14x più veloce di DeepSeek per TTFT.**

## Piano d'Azione (ordinato per impatto)

| # | Azione | Riduzione latenza | Effort |
|---|--------|------------------|--------|
| 1 | **Spostare nanobot su VPS** (72.60.129.50) | -30s cold start | 2-3h |
| 2 | **Groq come primary provider** (drop DeepSeek dal racing) | -10-15s TTFT | 30min |
| 3 | **SSE streaming** | Perceived TTFT ~1s | 3-4h |
| 4 | **Cache exact-match** top 50 domande | 30% query a <10ms | 2-3h |
| 5 | **Cache semantica** con sentence-transformers | +20-30% a <50ms | 4-6h |
| 6 | Migrare da Gemini 2.0 a 2.5 Flash-Lite | Future-proofing (2.0 muore giugno 2026) | 1h |

## Quick Win Immediato: Keep-alive ping

```bash
# UptimeRobot (gratis, 50 monitor) oppure crontab:
*/10 * * * * curl -s https://elab-galileo.onrender.com/health > /dev/null
```
Elimina cold start 30s. Costo zero.

## Latenze Attese Post-Ottimizzazione

- Cache hit (exact): <10ms
- Cache hit (semantic): 20-50ms
- Cache miss, Groq streaming TTFT: 0.5-1s
- Cache miss, Groq full response: 1-3s

**Con azioni 1-3: sotto 3s per primo contenuto visibile.**

## Task YAML

- P0: Keep-alive ping per nanobot (5 min)
- P0: Groq come primary provider (30 min)
- P1: Migrazione nanobot su VPS (2-3h)
- P1: SSE streaming (3-4h)
- P2: Cache exact-match (2-3h)
- P2: Cache semantica (4-6h)

## Note

- Gemini 2.0 Flash deprecato, shutdown 1 giugno 2026 — migrare subito
- Groq free tier: 30 req/min = sufficiente per una classe
- VPS già ha Ollama → aggiungere nanobot è triviale (systemd + uvicorn)
