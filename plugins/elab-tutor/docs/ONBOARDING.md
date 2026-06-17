# ELAB Backend — Onboarding Collaboratrice
**(c) Andrea Marro — 02/04/2026**

---

## Architettura Backend

```
Frontend (Vercel)
    │ HTTPS POST
    ▼
Supabase Edge Functions (Deno runtime)
    ├── unlim-chat      → Gemini API (routing 70/25/5)
    │                   → RAG pgvector (246 chunk dai volumi)
    │                   → Student memory (Supabase DB)
    │                   → VPS fallback (Ollama Brain)
    ├── unlim-diagnose  → Gemini Flash (analisi circuito)
    ├── unlim-hints     → Gemini Flash-Lite (suggerimenti)
    ├── unlim-tts       → VPS Voxtral (TTS italiano)
    └── unlim-gdpr      → Supabase DB (Art. 17, 20, 8)
```

## File Critici

```
supabase/functions/
  _shared/
    gemini.ts          — Client Gemini (x-goog-api-key, retry, fallback, generic error codes)
    rag.ts             — RAG dual-mode (pgvector semantic + keyword + synonym expansion)
    system-prompt.ts   — Personalità UNLIM (SINGLE SOURCE OF TRUTH, max 60 parole)
    guards.ts          — CORS, rate limit DB-persistent, prompt injection (NFKD + multi-lang),
                         deep sanitize, security headers, GDPR validators
    memory.ts          — Memoria studente (GDPR: NO raw messages, solo topic + response preview)
    router.ts          — Routing modello (keyword → Flash-Lite/Flash/Pro)
    types.ts           — TypeScript types condivisi
  unlim-chat/index.ts  — Endpoint principale (RAG + memory + Gemini + TTS)
  unlim-gdpr/index.ts  — GDPR con auth token + email/consent validation
  unlim-diagnose/      — Diagnosi circuiti
  unlim-hints/         — Suggerimenti progressivi
  unlim-tts/           — Proxy TTS verso VPS
```

## Comandi Deploy

```bash
# Deploy singola funzione
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy unlim-chat \
  --project-ref euqpdueopmlllqjmqnyb --no-verify-jwt

# Deploy tutte
for fn in unlim-chat unlim-diagnose unlim-hints unlim-tts unlim-gdpr; do
  SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy "$fn" \
    --project-ref euqpdueopmlllqjmqnyb --no-verify-jwt
done

# Test endpoint LIVE
curl -X POST "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat" \
  -H "Authorization: Bearer <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"message":"Ciao","sessionId":"test","experimentId":"v1-cap6-esp1"}'
```

## Convenzioni

- **TypeScript strict**: tipi espliciti, no `any` dove evitabile
- **Error handling**: `catch(err) { console.warn('[Context]', err); }` — mai catch vuoti
- **Commenti**: inglese per codice, italiano per messaggi utente
- **Errori client**: MAI esporre dettagli interni. Usa messaggi generici.
- **Logging**: JSON strutturato: `console.log(JSON.stringify({ level, event, ... }))`
- **GDPR**: MAI salvare messaggio raw dello studente. Solo topic category + response preview.
- **Security**: Tutti gli endpoint hanno security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- **Rate limiting**: Ogni endpoint ha rate limiting — DB-persistent con fallback in-memory

## Security Features

| Feature | File | Note |
|---------|------|------|
| Rate limit persistente | guards.ts | DB + in-memory fallback, 30 req/min |
| Prompt injection | guards.ts | Unicode NFKD + 30+ pattern multi-lingua |
| Deep sanitization | guards.ts | Ricorsivo, max depth 10, array size 50 |
| Security headers | guards.ts | OWASP best practices su ogni risposta |
| GDPR validators | guards.ts | Email regex, consent method enum, UUID |
| Error codes generici | gemini.ts | GeminiError con enum, no API detail leak |
| Structured logging | tutti | JSON con level, event, timestamp |
| Session ID anonimo | memory.ts | Hash-based, no PII |

## Schema DB

11 tabelle (vedi `supabase/schema.sql`):
- **Core**: classes, class_students, student_sessions, student_progress
- **Didattica**: mood_reports, nudges, lesson_contexts, confusion_reports
- **Supporto**: rate_limits, gdpr_audit_log, parental_consents

Tutte con RLS (Row Level Security) — docente vede solo sue classi, studente solo suoi dati.

## Flusso di una richiesta chat

1. Frontend → POST `/unlim-chat` con `{message, sessionId, experimentId, circuitState}`
2. `guards.ts`: CORS check → rate limit (DB) → input validation → prompt injection guard → deep sanitize
3. `memory.ts`: carica contesto studente da DB
4. `rag.ts`: cerca chunk rilevanti (pgvector → keyword fallback con sinonimi)
5. `system-prompt.ts`: costruisce system prompt con personalità + contesto + RAG
6. `router.ts`: sceglie modello Gemini (Flash-Lite 70% / Flash 25% / Pro 5%)
7. `gemini.ts`: chiama Gemini API (retry 1x, timeout 15s) → fallback Brain VPS
8. Cap response a 80 parole → TTS parallelo → salva interazione (NO raw message)
9. Risposta JSON con security headers
