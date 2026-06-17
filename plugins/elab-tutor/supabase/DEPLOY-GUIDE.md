# Nanobot V2 — Guida Deploy Completa
**(c) Andrea Marro — 02/04/2026**

---

## Prerequisiti
- Account Supabase (free tier sufficiente)
- API Key Google Gemini (https://ai.google.dev/)
- VPS 72.60.129.50 accessibile con Ollama + Python3

---

## Step 1: Creare Progetto Supabase

1. Vai su https://supabase.com → New Project
2. Nome: `elab-unlim`
3. Regione: **EU West** (GDPR)
4. Password DB: salva in posto sicuro
5. Copia: `Project URL` e `Service Role Key`

## Step 2: Applicare Schema DB

1. Vai su Supabase Dashboard → SQL Editor
2. Apri `supabase/schema.sql`
3. Esegui tutto → 8 tabelle core + 3 tabelle supporto (rate_limits, gdpr_audit_log, parental_consents)
4. Funzioni create: `update_updated_at`, `cleanup_expired_rate_limits`, `cleanup_old_lesson_contexts`, `delete_student_data`

## Step 3: Configurare Secrets

In Supabase Dashboard → Project Settings → Edge Functions → Secrets:

```
GEMINI_API_KEY=AIza...          # Da Google AI Studio
VPS_OLLAMA_URL=http://72.60.129.50:11434
VPS_TTS_URL=http://72.60.129.50:8880/tts
SUPABASE_URL=https://tuo-progetto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Step 4: Deploy Edge Functions

```bash
# Installa Supabase CLI (se non presente)
npm install -g supabase

# Login
supabase login

# Link al progetto
supabase link --project-ref <project-ref>

# Deploy tutte le funzioni (GDPR incluso)
for fn in unlim-chat unlim-diagnose unlim-hints unlim-tts unlim-gdpr; do
  supabase functions deploy "$fn" --no-verify-jwt
done
```

## Step 5: Installare Voxtral sul VPS

```bash
ssh root@72.60.129.50

# Installa dipendenze
pip install fastapi uvicorn transformers torch torchaudio

# Copia lo script
scp supabase/vps-scripts/voxtral-tts-server.py root@72.60.129.50:/opt/elab/

# Avvia come servizio systemd
cat > /etc/systemd/system/voxtral-tts.service << 'EOF'
[Unit]
Description=ELAB Voxtral TTS Server
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/elab
ExecStart=/usr/bin/python3 voxtral-tts-server.py
Restart=always
RestartSec=5
Environment=VOXTRAL_MODEL=mistralai/Voxtral-Mini-3B-2507

[Install]
WantedBy=multi-user.target
EOF

systemctl enable voxtral-tts
systemctl start voxtral-tts

# Verifica
curl http://localhost:8880/health
```

## Step 6: Aggiornare Frontend ELAB

In `.env` (locale o Vercel):
```
VITE_NANOBOT_URL=https://tuo-progetto.supabase.co/functions/v1/unlim-chat
```

Deploy:
```bash
npm run build && npx vercel --prod --yes
```

## Step 7: Verificare

```bash
# Test chat
curl -X POST https://tuo-progetto.supabase.co/functions/v1/unlim-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Ciao! Come funziona un LED?","sessionId":"test-1"}'

# Test diagnosi
curl -X POST https://tuo-progetto.supabase.co/functions/v1/unlim-diagnose \
  -H "Content-Type: application/json" \
  -d '{"circuitState":{"text":"LED senza resistore"}}'

# Test hints
curl -X POST https://tuo-progetto.supabase.co/functions/v1/unlim-hints \
  -H "Content-Type: application/json" \
  -d '{"experimentId":"v1-cap6-esp1","currentStep":0}'

# Test TTS
curl -X POST https://tuo-progetto.supabase.co/functions/v1/unlim-tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Ciao, sono UNLIM!","sessionId":"test-1"}' --output test.mp3

# Test GDPR consent (con validazione email)
curl -X POST https://tuo-progetto.supabase.co/functions/v1/unlim-gdpr/consent \
  -H "Content-Type: application/json" \
  -d '{"studentId":"s-123","parentEmail":"parent@email.com","consentMethod":"email","consentGiven":true}'
```

## Architettura Finale

```
Frontend (Vercel) → Supabase Edge Functions → Gemini API
                                            → VPS (Voxtral TTS + Brain fallback)
                  → Supabase DB (memoria studenti, rate limits, GDPR audit)
```

## Security Features (Backend Session 02/04/2026)

| Feature | Status |
|---------|--------|
| Rate limiting persistente (DB + in-memory fallback) | DONE |
| GDPR data minimization (no raw messages saved) | DONE |
| Prompt injection hardening (unicode NFKD + multi-lang) | DONE |
| Deep circuitState sanitization (recursive, max depth 10) | DONE |
| Structured JSON logging (no error detail leaks) | DONE |
| Security headers (X-Content-Type-Options, X-Frame-Options, etc.) | DONE |
| System prompt unified (single source in system-prompt.ts) | DONE |
| RAG synonym expansion + concept matching | DONE |
| Email/UUID/consent field validation | DONE |
| GeminiError generic codes (never leaks API details) | DONE |
| GDPR audit log for delete/export/consent | DONE |
| Lesson contexts 90-day TTL | DONE |
| TTS rate limiting + sessionId required | DONE |
| VPS URL from env var (not hardcoded) | DONE |

## Costi Mensili

| Componente | Costo |
|-----------|-------|
| Supabase (free) | €0 |
| Vercel (free) | €0 |
| Gemini API | ~€3.30/classe |
| VPS | €10 fisso |
| **TOTALE** | **€10 + €3.30/classe** |

## Rollback

Se qualcosa va storto, basta cambiare l'URL in `.env`:
```
# Torna al vecchio Nanobot su Render
VITE_NANOBOT_URL=https://elab-galileo.onrender.com
```
Il frontend supporta entrambi senza modifiche al codice.

## File Backend

```
supabase/
  functions/
    _shared/
      types.ts          — Tipi TypeScript condivisi
      router.ts         — Routing 70/25/5 (Flash-Lite/Flash/Pro)
      gemini.ts         — Client Gemini API + Brain fallback + metrics + generic error codes
      system-prompt.ts  — System prompt UNICO (single source of truth) + context builder
      memory.ts         — Lettura/scrittura memoria studente (GDPR: no raw messages)
      guards.ts         — CORS + rate limit persistent + prompt injection + deep sanitize + security headers + GDPR validators
      rag.ts            — RAG dual-mode (pgvector + keyword) + synonym expansion + concept matching
    unlim-chat/
      index.ts          — Chat endpoint (/tutor-chat + /chat)
    unlim-diagnose/
      index.ts          — Diagnosi circuito (/diagnose) + rate limited
    unlim-hints/
      index.ts          — Suggerimenti progressivi (/hints) + rate limited
    unlim-tts/
      index.ts          — Proxy TTS verso VPS (/tts) + rate limited + sessionId
    unlim-gdpr/
      index.ts          — GDPR (Art. 8, 17, 20) + email validation + consent method validation
  schema.sql               — Schema DB (11 tabelle + 4 funzioni + RLS + Realtime)
  knowledge-base.json      — 62 experiment chunks per keyword RAG
  DEPLOY-GUIDE.md          — Questa guida
```
