# SESSIONE BACKEND — API, Security, GDPR, Monitoring
**Ralph Loop** `--max-iterations 30` | **Score partenza**: 6.8/10 | **Target**: 8.5/10
**Prerequisito**: leggere `docs/SESSION-COMPLETE-02-APR-2026.md`

---

## COMANDO

```
/ralph-loop Esegui TUTTO docs/prompts/PROMPT-BACKEND-SESSIONE-NEXT.md --max-iterations 30 --completion-promise "BACKEND SESSIONE COMPLETATA SCORE 8.5 VERIFICATO"
```

---

## CONTESTO

### Architettura attuale

```
Frontend (Vercel) → Supabase Edge Functions → Gemini API
                                            → VPS (Voxtral TTS + Brain fallback)
                                            → pgvector (246 chunk RAG)
```

### 5 Edge Functions LIVE
| Endpoint | Modello | Stato |
|----------|---------|-------|
| unlim-chat | Flash-Lite/Flash/Pro (70/25/5) | LIVE, CORS ristretto |
| unlim-diagnose | Flash | LIVE |
| unlim-hints | Flash-Lite | LIVE |
| unlim-tts | Voxtral (VPS) | LIVE |
| unlim-gdpr | N/A (DB only) | LIVE, auth token aggiunto |

### File backend
```
supabase/functions/
  unlim-chat/index.ts          — Chat principale
  unlim-diagnose/index.ts      — Diagnosi circuiti
  unlim-hints/index.ts         — Suggerimenti
  unlim-tts/index.ts           — TTS proxy
  unlim-gdpr/index.ts          — GDPR (Art. 17, 20, 8)
  _shared/
    gemini.ts                  — Client Gemini API
    rag.ts                     — RAG (keyword + pgvector semantic)
    router.ts                  — Routing modello (70/25/5)
    system-prompt.ts           — System prompt UNLIM
    guards.ts                  — CORS, rate limiting, input validation
    memory.ts                  — Student memory persistence
    types.ts                   — TypeScript types
  knowledge-base.json          — 62 experiment chunks (keyword RAG)
```

### Gap REALI backend (da audit 14 issues)
1. Rate limiting in-memory (resetta al redeploy)
2. GDPR: message raw salvato in lesson_contexts (violazione Art. 5)
3. Prompt injection patterns bypassabili (unicode, homoglyphs)
4. CircuitState sanitization non deep (nested objects non filtrati)
5. Error messages leakano dettagli interni
6. TTS endpoint senza rate limiting
7. No HTTPS enforcement per VPS
8. Consent fields non validati (email, UUID, enum)
9. No Content-Security-Policy header
10. System prompt duplicato (api.js + system-prompt.ts)
11. Session ID spoofabile (no server validation)
12. skipActions flag non implementato in sendChat

---

## PREPARAZIONE COLLABORATRICE

Ogni modifica backend deve:
- TypeScript strict (tipi espliciti, no `any` dove evitabile)
- Error handling esplicito (no catch vuoti)
- Commenti in inglese per il codice, italiano per i messaggi utente
- Test per ogni nuovo endpoint/funzione
- Documentare in `supabase/DEPLOY-GUIDE.md`

---

## 8 CICLI — Ogni ciclo: implementa → test LIVE → audit CoV (3 agenti) → deploy

### CICLO 1: Rate limiting persistente su Supabase
**Obiettivo**: Rate limit sopravvive ai redeploy.

- Creare tabella `rate_limits` in Supabase:
  ```sql
  CREATE TABLE rate_limits (
    session_id TEXT PRIMARY KEY,
    request_count INT DEFAULT 0,
    window_start TIMESTAMPTZ DEFAULT now()
  );
  ```
- Modificare `guards.ts`: checkRateLimit() interroga DB invece di Map in-memory
- Fallback: se DB non raggiungibile, usa Map in-memory come adesso
- Rate limit per TTS endpoint (aggiungere sessionId obbligatorio)
- Rate limit per GDPR endpoint

**Test LIVE**: inviare 31 messaggi → il 31o deve essere bloccato (429)
**Deploy**: `npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb`
**Audit**: 3 agenti (rate-limit-test, fallback-test, performance-impact)

### CICLO 2: GDPR data minimization
**Obiettivo**: MAI salvare messaggio raw dello studente.

- `memory.ts`: sostituire `lastMessage: message.slice(0, 200)` con hash/lunghezza
- Aggiungere TTL a lesson_contexts (90 giorni, trigger auto-delete)
- Validare parentEmail con regex in consent endpoint
- Validare consentMethod contro enum (in_app, email, paper, verbal)
- Validare studentId/classId come UUID

**Test LIVE**: POST /gdpr/consent con email invalida → rifiutato
**Deploy**: funzioni aggiornate
**Audit**: 3 agenti (gdpr-compliance, data-minimization, input-validation)

### CICLO 3: Prompt injection hardening
**Obiettivo**: Injection patterns robusti.

- Normalizzare unicode (NFKD) prima del check
- Aggiungere pattern multi-lingua (spagnolo, inglese, francese)
- Deep sanitize circuitState (ricorsivo, max depth 10)
- Limitare lunghezza nested strings a 500 chars
- Limitare array size a 50 elementi

**Test LIVE**: 10 tentativi injection diversi → tutti bloccati
**Deploy**: guards.ts aggiornato
**Audit**: 3 agenti (injection-bypass, deep-sanitize, edge-cases)

### CICLO 4: Error handling + monitoring
**Obiettivo**: Nessun errore interno leakato. Logging utile.

- Sostituire error text leak in gemini.ts con codici generici (SERVICE_RATE_LIMITED, SERVICE_UNAVAILABLE, API_ERROR)
- Aggiungere structured logging: `console.log(JSON.stringify({ level, event, ... }))`
- Aggiungere health check endpoint: GET /health → { status, uptime, version }
- Aggiungere metriche: contare richieste per modello, latenza media

**Test LIVE**: provocare errore Gemini → risposta generica al client
**Deploy**: tutte le funzioni
**Audit**: 3 agenti (error-leak, logging-quality, monitoring)

### CICLO 5: Security headers + CSP
**Obiettivo**: Headers di sicurezza su tutte le risposte.

- Aggiungere a guards.ts:
  ```
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  ```
- VPS URL da env var (non hardcoded)
- Verificare che nessuna credenziale sia nel bundle frontend

**Test LIVE**: curl -D - → verificare headers presenti
**Deploy**: tutte le funzioni
**Audit**: 3 agenti (headers-check, credential-leak, owasp-top10)

### CICLO 6: System prompt unificazione
**Obiettivo**: Un solo system prompt, non due.

- Rimuovere SOCRATIC_INSTRUCTION da api.js (frontend)
- Tutto passa per system-prompt.ts (backend)
- Aggiungere regola RAG nel BASE_PROMPT permanentemente
- Verificare che il comportamento sia identico per nanobot e webhook path

**Test LIVE**: confrontare risposte pre/post unificazione
**Deploy**: funzioni aggiornate
**Audit**: 3 agenti (consistency, behavior-diff, prompt-quality)

### CICLO 7: RAG miglioramento + test onniscienza
**Obiettivo**: UNLIM risponde con le STESSE PAROLE dei volumi.

- Testare 10 domande specifiche dai volumi:
  1. "Qual e il valore della resistenza nell'esperimento 3 del capitolo 7?"
  2. "Cosa dice il manuale sulla polarita dei LED?"
  3. "Come si leggono i colori delle bande di una resistenza?"
  4. "Qual e la formula della legge di Ohm?"
  5. "Cosa succede se inverto la polarita del LED?"
  6. "Come funziona un condensatore?"
  7. "Qual e il pinout dell'Arduino Nano?"
  8. "Come si usa il potenziometro?"
  9. "Cosa fa il MOSFET?"
  10. "Come si programma il blink in Arduino?"
- Confrontare risposte con testo esatto dal volume
- Se le risposte non usano le stesse parole → migliorare RAG threshold/prompt

**Test LIVE**: 10 domande → almeno 8 usano terminologia del volume
**Audit**: 3 agenti (accuracy, terminology-match, volume-coverage)

### CICLO 8: Audit finale SEVERO + deploy completo
5 agenti paralleli:
1. **Security**: OWASP, injection, CORS, headers, rate limiting
2. **GDPR**: data minimization, consent, delete, export, audit log
3. **API quality**: response time, error handling, consistency
4. **RAG accuracy**: onniscienza verificata su 10 domande
5. **Collaboratrice**: codice TypeScript pulito, documentato, testabile

Score = MINIMO dei 5. Se < 8.5, fixa e rilancia.
Deploy TUTTO: `npx supabase functions deploy --project-ref euqpdueopmlllqjmqnyb`

---

## DOCUMENTO ONBOARDING (per la collaboratrice — salvare in docs/ONBOARDING.md)

### Architettura backend che la collaboratrice deve conoscere:
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

### File backend critici:
```
supabase/functions/
  _shared/
    gemini.ts          — Client Gemini (x-goog-api-key header, retry, fallback)
    rag.ts             — RAG dual-mode (pgvector semantic + keyword fallback)
    system-prompt.ts   — Personalita UNLIM (max 60 parole, analogie, tag azioni)
    guards.ts          — CORS whitelist, rate limiting, prompt injection, input validation
    memory.ts          — Persistenza cross-sessione (student_progress, lesson_contexts)
    router.ts          — Routing modello (keyword → Flash-Lite/Flash/Pro)
    types.ts           — TypeScript types
  unlim-chat/index.ts  — Endpoint principale (RAG + memory + Gemini + TTS)
  unlim-gdpr/index.ts  — GDPR con auth token (delete/export protetti)
```

### Comandi deploy backend:
```bash
# Deploy singola funzione
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb --no-verify-jwt

# Deploy tutte
for fn in unlim-chat unlim-diagnose unlim-hints unlim-tts unlim-gdpr; do
  SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy "$fn" --project-ref euqpdueopmlllqjmqnyb --no-verify-jwt
done

# Test endpoint LIVE
curl -X POST "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat" \
  -H "Authorization: Bearer <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"message":"Ciao","sessionId":"test","experimentId":"v1-cap6-esp1","circuitState":{"components":[],"connections":[]}}'
```

### Convenzioni backend:
- TypeScript strict (tipi espliciti, no `any`)
- Error handling: `catch(err) { console.warn('[Context]', err); }` (mai catch vuoti)
- Commenti: inglese per codice, italiano per messaggi utente
- Ogni endpoint testato LIVE dopo deploy
- Credenziali MAI nel bundle frontend

## REGOLE

1. ZERO REGRESSIONI (test LIVE pre/post ogni deploy)
2. MAI CREDENZIALI NEL BUNDLE FRONTEND
3. OGNI ENDPOINT TESTATO LIVE DOPO DEPLOY
4. ERROR = LOG + GENERIC RESPONSE (mai leak interni)
5. DOCUMENTA IN DEPLOY-GUIDE.md

## CREDENZIALI

```
Supabase: euqpdueopmlllqjmqnyb
URL: https://euqpdueopmlllqjmqnyb.supabase.co
Token: sbp_REVOKED_20260423_REDACTED
Gemini: AIzaSyB3IjfrHeG9u_yscwHamo7lT1zoWJ0ii1g
VPS: 72.60.129.50 (Ollama :11434, Voxtral :8880)
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cXBkdWVvcG1sbGxxam1xbnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDI3MDksImV4cCI6MjA5MDcxODcwOX0.289s8NklODdiXDVc_sXBb_Y7SGMgWSOss70iKQRVpjQ
Admin: #admin → [REDACTED-MOVED-TO-ENV]
```

## SKILL DA USARE

```
/elab-nanobot-test /elab-quality-gate /elab-cost-monitor
/systematic-debugging /engineering:code-review
/engineering:testing-strategy /engineering:system-design
/ricerca-bug /ricerca-tecnica
Preview tools (per test LIVE endpoint)
```
