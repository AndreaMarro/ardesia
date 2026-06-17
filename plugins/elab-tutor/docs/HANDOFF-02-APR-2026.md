# Handoff Document — Sessione 02/04/2026
**Autore**: Claude Code | **Data**: 02/04/2026

---

## COSA E' STATO FATTO

### 1. PDF Business Case (12 pagine)
- **File**: `docs/ELAB-Business-Case.pdf`
- **Script**: `scripts/generate-business-case-pdf.py`
- **Contenuto**: Executive Summary + Rischi onesti, Alternative AI (tabella 5 opzioni), Costi dettagliati (routing 70/25/5), Modelli ammortamento, Proiezioni finanziarie 3 anni, Vantaggi competitivi, **GDPR e Conformita Minori** (richiesto dall'utente), Roadmap
- Nota utente: "abbonamento integrabile con altri contenuti" — aggiunto

### 2. RAG Completo dai Volumi Tres Jolie
- **246 chunk** estratti da 3 volumi (321 pagine)
  - Vol 1: 95 chunk (114 pagine)
  - Vol 2: 84 chunk (116 pagine)
  - Vol 3: 67 chunk (91 pagine)
- **246/246 embeddings** generati con `gemini-embedding-001` (3072 dim)
- **File dati**: `data/rag/all-chunks.json`, `data/rag/embeddings-cache.json`
- **SQL**: `data/rag/insert-chunks.sql` (246 INSERT + schema + funzione ricerca)
- **rag.ts aggiornato**: nuova `retrieveVolumeContext()` con ricerca semantica pgvector + fallback keyword
- **unlim-chat aggiornato**: RAG iniettato nel system prompt + regola "usa stesse parole del volume"

### 3. Security Fix (P0)
- **CORS ristretto**: da `*` a whitelist (`elab-builder.vercel.app`, `elab-tutor.it`, `localhost:5173/3000`)
  - Applicato a tutti e 5 gli endpoint (chat, diagnose, hints, tts, gdpr)
  - Nuova funzione `getCorsHeaders(req)` in `guards.ts`
- **Gemini API key nell'header**: da URL param `?key=` a header `x-goog-api-key`
  - Fix in `gemini.ts`

### 4. Frontend Fix (P0/P1)
- **LavagnaShell**: setInterval cleanup quando API trovata (era polling infinito)
- **FloatingWindow**: cleanup refs drag/resize su unmount
- **AppHeader**: icona UNLIM sostituita con stella/sparkle (richiesto dall'utente: "simbolo piu carino")

### 5. Stress Test
- **10/10 chat** messaggi sequenziali PASS
- **3/3 endpoint** LIVE (chat, diagnose, hints)
- **3/3 error handling** (empty msg, no auth 401, wrong method 405)
- **4/4 security** (prompt injection, system prompt leak, >2000 chars, XSS)

### 6. Nuove Skill
- `/elab-nanobot-test` — test automatici endpoint
- `/elab-rag-builder` — pipeline RAG
- `/elab-cost-monitor` — monitoraggio costi Gemini

---

## NUMERI VERIFICATI

| Metrica | Valore |
|---------|--------|
| Test suite | 1075/1075 PASS |
| Build | PASS (33 precache, ~3996KB) |
| Endpoint LIVE | 3/3 funzionanti |
| Error handling | 3/3 PASS |
| Security guards | 4/4 PASS |
| RAG chunks | 246 |
| RAG embeddings | 246/246 (0 errori) |
| PDF pagine | 12 |
| Nuove skill | 3 |

---

## COSA RESTA DA FARE

### Priorita ALTA
1. **Configurare Supabase pgvector**: eseguire `data/rag/insert-chunks.sql` nel SQL Editor + caricare embeddings con service key
2. **Deploy Edge Functions aggiornate**: `supabase functions deploy` per applicare CORS ristretto + API key header + RAG
3. **Deploy frontend**: `npm run build && npx vercel --prod --yes`
4. **Revisione frontend meticolosa**: l'utente ha chiesto revisione completa (penna, LIM, iPad, coerenza link/pulsanti) — 6 agenti lanciati, risultati parziali ricevuti

### Priorita MEDIA
5. **Test coverage 70%+**: attualmente 1075 test ma coverage non misurata
6. **Monitoring/alerting**: Sentry o PostHog per errori produzione
7. **Teacher Dashboard con Supabase**: lo schema e pronto, serve configurare e connettere

### Priorita BASSA
8. **Voxtral TTS test**: verificare che il VPS funzioni con le nuove CORS
9. **GDPR endpoint auth**: aggiungere validazione ownership su delete/export

---

## COME RIPRODURRE

```bash
# Test
cd "VOLUME 3/PRODOTTO/elab-builder"
npx vitest run  # 1075 test

# Build
npm run build  # ~3996KB, 33 precache

# Genera PDF business case
python3 scripts/generate-business-case-pdf.py

# Estrai testo volumi
python3 scripts/extract-volumes-rag.py

# Genera embeddings RAG
python3 scripts/upload-rag-supabase.py

# Test endpoint LIVE
curl -X POST "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat" \
  -H "Authorization: Bearer <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"message":"Ciao","sessionId":"test","experimentId":"v1-cap6-esp1","circuitState":{"components":[],"connections":[]}}'
```

---

## SCORE ONESTO

| Area | Score | Note |
|------|-------|------|
| Backend (Nanobot V2) | 7.5/10 | LIVE, routing OK, ma RAG vettoriale non ancora in prod |
| Frontend (Lavagna) | 6.5/10 | Fix P0, ma revisione meticolosa non completata |
| Security | 7.0/10 | CORS ristretto, API key header, ma GDPR endpoint senza auth ownership |
| RAG | 6.0/10 | 246 chunk + embeddings pronti, ma non caricati su Supabase |
| Business Case | 8.0/10 | PDF completo con GDPR, rischi onesti, numeri reali |
| **Composito** | **7.0/10** | Sessione produttiva ma alcune cose restano da completare |

## FIX AGGIUNTIVI (Iterazione 2)

### Vetrina
- Rimosso foto duplicate (LIVE) e gioco (prova) dal showcase — ora solo Simulatore + UNLIM AI
- Sezione "Sei un docente o scuola?" rimossa → link semplice a Netlify scuole
- Fix unicode raw `\u2192` e `\uD83D\uDED2` non renderizzati in JSX

### Admin Security
- Rimosso DEV mock che dava admin a tutti su localhost
- Rimosso pulsante "Pannello Admin" dalla vetrina e topbar
- Aggiunto form password SHA-256 nell'AdminPage (accesso via #admin)
- AdminPage accessibile a tutti ma protetto da password

### A11y
- quickAsk button 40→44px (WCAG touch target)
- tabBtn min-height 32→44px con @media(pointer:coarse)
- Font experimentName 12→13px (min), 13→14px (LIM)

### Memory Leaks
- ExperimentPicker: timeout cleanup in useEffect
- RetractablePanel: resizeRef cleanup on unmount

### Verifica 3 Viewport
- LIM 1024x768: screenshot OK, nulla tagliato
- Desktop 1280x800: layout completo
- iPad 768x1024: cards responsive, touch targets OK

### Report Fumetto
- Verificato: security (esc XSS), mood system, photo slots, stat bars, stampa PDF — tutto OK

### Deploy Edge Functions (Iterazione 4)
- **5/5 Edge Functions DEPLOYED** su Supabase (`supabase functions deploy`)
- CORS ristretto LIVE (verificato: origin sbagliato → fallback a elab-builder.vercel.app)
- API key in header LIVE (non piu in URL)
- RAG aggiornato con `retrieveVolumeContext()` LIVE
- Tutti e 3 gli endpoint testati post-deploy: SUCCESS

### Lesson Prep Service (richiesto dall'utente)
- `src/services/lessonPrepService.js` — preparazione lezioni basata su esperimenti + contesto passato
- Integrato in `useGalileoChat.js` — rileva "prepara la lezione" e genera piano
- Documentato in `docs/UNLIM-LESSON-PREP-ARCHITECTURE.md`
- Testato LIVE nel browser con screenshot

**Score aggiornato: 8.2/10** (migliorato da 7.0 → 7.3 → 8.2)

### RAG pgvector LIVE (Iterazione 6)
- **246/246 embeddings caricati su Supabase** via PostgREST PATCH
- Ricerca semantica testata LIVE: domanda su LED → risposta corretta con conoscenza volume
- No ivfflat/hnsw index (3072 dim > pgvector 2000 limit) — seq scan OK per 246 righe

### Lesson Prep E2E (Iterazione 7)
- Testato con AI LIVE: "Prepara la lezione" → risposta con GANCIO, ADATTAMENTO, DOMANDA CHIAVE, PROSSIMO PASSO
- Backend Gemini risponde correttamente con contesto pedagogico

### Overlay fix (Iterazione 6-7)
- FloatingToolbar z-index 60→950
- UnlimBar z-index 800→1050
- FloatingWindow z-index capped a 5000 (reset automatico)
- Title tooltip su FloatingWindow
- experimentName max-width 340→480px

### 11 agenti audit (6+5)
- **Scratch/compilatore: ZERO BUG** (production ready)
- **Fumetto: TUTTO FUNZIONALE** (pannelli, balloon, mood, sicurezza)
- **UNLIM onnipotenza: VERIFICATO** (6 pattern, 14 campi, RAG integrato)
- Overlay: 18 issues trovati, 6 fixati
- Security: 14 issues, 3 P0 fixati e deployati

### Score FINALE ONESTO: 7.6/10

**Per arrivare a 9.0 serve:**
- GDPR endpoint con validazione ownership (P0 security)
- Pannelli tutti drag/resize/hide/show come l'utente vuole (architettura)
- DrawingOverlay: undo passo-passo
- StateManager: reset da STUCK
- Index pgvector (richiede dimensioni < 2000 o modello embedding diverso)
