# PDR #2 — UNLIM Serving Layer (ex "OpenClaw Infra", corretto 19/04)

**Status**: ⚠️ **REWRITTEN 2026-04-19** — versione precedente aveva assumption errata su OpenClaw

**Target agent**: Claude Opus 4.7 via Managed Agent (Max #1)
**Durata stimata**: 50-70h autonome
**Branch**: `feature/unlim-serving-v1`
**Dipendenze**: PDR3 VPS RunPod Deploy (endpoint URL disponibili)
**Governance**: `docs/GOVERNANCE.md` regole 0-5 obbligatorie

---

## ⚠️ Correzione onesta (19/04/2026)

**Versione 18/04 di questo PDR era sbagliata**. Descriveva "OpenClaw" come container Docker scheletro UNLIM su Hetzner CX52 per serving docenti/studenti.

**Realtà verificata 19/04 via fetch `github.com/openclaw/openclaw`**:
- OpenClaw è **personal AI assistant** (Peter Steinberger, 360k stars, MIT)
- Node.js v24 + TypeScript, multi-channel (WhatsApp/Telegram/Slack/Discord/Signal/iMessage)
- Wake word, canvas, cron, webhook — **personal use**, non serving classi
- Integrates OpenAI primary (non Claude-first)

**OpenClaw NON è soluzione per serving UNLIM in produzione**. Era mia assumption errata.

**OpenClaw uso corretto**: tool **personale Andrea** su Mac Mini Strambino:
- Meeting notes automatiche (Fagherazzi, Omaric, Davide)
- Telegram bridge workflow Andrea
- Cron task personali
- Voice wake personal assistant

NON integrato in prodotto ELAB. Minori GDPR rischio, OpenAI primary, feature set personal-adult.

---

## 🎯 Obiettivo reale PDR #2

Costruire **UNLIM Serving Layer**: componente infrastructure che:
- Intercetta richieste da Supabase Edge Function `unlim-chat`
- Gestisce memoria persistente cross-session
- Routa a endpoint RunPod corretto (LLM / Vision / TTS / STT / Embedding)
- Fallback chain: RunPod → Brain V13 VPS Hostinger → degraded mode
- Cost guard + circuit breaker
- Audit log

**Architettura proposta: Python FastAPI custom su Hetzner CX52** (non OpenClaw, non Docker monolithic).

---

## ⚖️ Regola 0 — riuso esistente

**Riusa**:
- `src/services/unlimMemory.js` → pattern memoria 3-tier
- `src/services/unlimProactivity.js` → proactive diagnosis logic
- `supabase/functions/_shared/memory.ts` → Supabase memory persistence
- `supabase/functions/_shared/rag.ts` → RAG pgvector
- `supabase/functions/unlim-chat/index.ts` → diventa bridge a Serving Layer
- `src/data/rag-chunks.json` → 549 chunk espandibili

**Nuovo**:
- `unlim-serving/` repo separato OR `supabase/functions/unlim-router/` Edge extension
- FastAPI Python app O Deno Edge Function estesa
- Hetzner CX52 €32/mese O Supabase Edge serverless (più economico, già incluso Pro)

---

## 📋 Task (8 sub-task)

### 2.1 — Decisione architettura (ADR)

Scegliere tra:
- **Option A**: FastAPI Python su Hetzner CX52 dedicato
  - Pro: controllo totale, log custom, debug easy
  - Con: +€32/mese, maintenance OS, più attack surface
- **Option B**: Supabase Edge Function estesa `unlim-router`
  - Pro: €0 extra (dentro Supabase Pro), auto-scale, GDPR
  - Con: cold start, limiti Deno runtime, 10MB bundle max
- **Option C**: Cloudflare Workers con DO (Durable Objects)
  - Pro: global edge, KV + DO per state, €5/mese 10M req
  - Con: setup complex, lock-in Cloudflare

**Mia raccomandazione**: **Option B** per MVP. Scale a Option A solo se serve.

Deliverable: `docs/decisions/2026-04-19-unlim-serving-architecture.md`

### 2.2 — Schema memoria multi-livello Supabase

Tabelle esistenti + nuove:
- `student_memory` (esistente)
- `class_memory` (pattern errori classe, concetti masterati)
- `teacher_preferences` (stile, lingua, ritmo docente)
- `school_context` (metadata scuola, privacy-safe)

SQL migration: `supabase/migrations/2026-04-19-memory-multilevel.sql` con RLS policies.

### 2.3 — UNLIM Router (core decision logic)

File nuovo: `supabase/functions/_shared/unlim-router.ts`

```typescript
export async function routeRequest(req: UnlimRequest): Promise<UnlimResponse> {
  // 1. Load multi-level memory
  const ctx = await loadFullContext(req.sessionId, req.classId);
  
  // 2. Decide endpoint based on task
  const endpoint = pickEndpoint(req); // llm | vision | tts | stt | embed
  
  // 3. Build prompt with Principio Zero v3 + memory
  const prompt = buildSystemPrompt(ctx, req);
  
  // 4. Call RunPod with fallback chain
  try {
    return await callRunPod(endpoint, prompt);
  } catch (err) {
    return await callBrainV13Fallback(prompt);
  }
}
```

### 2.4 — Fallback chain

Priority ordered:
1. RunPod Amsterdam serverless (primary, €1.39/h A100)
2. Brain V13 Ollama VPS Hostinger (already UP, CPU-only Qwen3.5-2B)
3. Degraded mode ("UNLIM in riposo, riprova 30s")

Circuit breaker 2-min auto-rollback se RunPod error rate > 5%.

### 2.5 — Cost guard

Supabase table `cost_tracking` + daily cap configurable.
Telegram alert se burn > €1/h.
Auto-throttle (reduce RunPod concurrent workers) se > €2/h.

### 2.6 — Audit log

Tutte request UNLIM loggate su Supabase `unlim_audit` con:
- sessionId + classId (pseudonymized)
- endpoint chiamato
- latency
- tokens in/out
- fallback triggered?
- error (se any)

GDPR retention: 30gg, auto-delete cron.

### 2.7 — Telegram bridge docenti (moved from OpenClaw misconception)

Bot custom Python/Node `@ElabUnlimBot`:
- `/status` stato classe
- `/report <classe>` PDF ultima sessione
- `/nudge <studente>` manda nudge motivazionale
- `/lingua <it/en/...>` cambia lingua classe
- Auth docente via code pairing one-time

File: `scripts/telegram-teacher-bot.py` (Python) OR `openclaw_personal/` configurazione tua (se usi OpenClaw vero come personal tool).

**Separazione critica**:
- **Bot custom ELAB** → docenti usano per classi (parte prodotto)
- **OpenClaw personal Andrea** → Andrea usa per meeting/personal (no integration prodotto)

### 2.8 — Monitoring

Prometheus + Grafana Cloud Free + Sentry (già menzionati).

Dashboard UNLIM dedicato:
- Uptime per endpoint
- p50/p95/p99 latency
- Cost burn daily
- Fallback trigger rate
- Error rate per model

---

## 🔬 Exit criteria

- [ ] ADR architettura scelta + doc
- [ ] 4 Supabase tables memoria multi-livello con RLS
- [ ] UNLIM router funzionante end-to-end (Edge → Router → RunPod)
- [ ] Fallback chain testata (kill RunPod → Brain V13 responde)
- [ ] Cost guard test attivato via simulated burn
- [ ] Audit log persiste tutte request
- [ ] Telegram bot custom `@ElabUnlimBot` funzionante (non OpenClaw)
- [ ] Monitoring Grafana dashboard live
- [ ] Baseline 12081 preservato
- [ ] Zero mention di "OpenClaw" come serving (correzione semantica)
- [ ] Auditor APPROVE

---

## 🚨 Rischi

| Rischio | Mitigation |
|---------|------------|
| Option B Supabase Edge: cold start | Pre-warming quando lesson aperta |
| RunPod serverless idle latency | Flex workers idle=0, accept 5-15s cold start |
| Memory query pesante (4 tables) | JOIN ottimizzato + cache Redis edge (future) |
| Telegram bot abuse | Rate limit + auth token classe |

---

## 🎯 Summary

**Vecchio PDR #2 (18/04) citava "OpenClaw" come serving** — sbagliato.
**Nuovo PDR #2 (19/04)**: UNLIM Serving Layer custom Python/Deno su Supabase Edge (Option B raccomandata). OpenClaw resta solo tool personale Andrea, non integrato in prodotto.

Governance 8-step rispettato. Regola 0 riuso codice esistente massimo.
