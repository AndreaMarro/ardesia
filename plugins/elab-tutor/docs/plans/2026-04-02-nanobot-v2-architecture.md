# Nanobot V2 — Architettura Completa
**Data**: 02/04/2026 | **Autore**: Andrea Marro + Claude Code

---

## OBIETTIVO
Sostituire il Nanobot V1 (Render free, inaffidabile, cold start 1 min) con un backend moderno su Supabase Edge Functions + Gemini 3 API + Voxtral TTS. Zero downtime, voce naturale, memoria persistente.

## ARCHITETTURA

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND ELAB                     │
│              (elab-builder.vercel.app)               │
│                                                     │
│  api.js → tryNanobot() → POST /tutor-chat           │
│                        → POST /chat (vision)        │
│                        → POST /diagnose             │
│                        → POST /hints                │
│                                                     │
│  GalileoAdapter.jsx → playTracked(audio)            │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────┐
│            SUPABASE EDGE FUNCTIONS                   │
│         (unlim-chat, unlim-diagnose, etc.)           │
│                                                     │
│  ┌─────────────────┐  ┌──────────────────────┐     │
│  │  ROUTER          │  │  MEMORIA             │     │
│  │  keyword-based   │  │  student_progress    │     │
│  │  70% Flash-Lite  │  │  lesson_contexts     │     │
│  │  25% Flash       │  │  confusion_reports   │     │
│  │  5% Pro          │  │  student_sessions    │     │
│  └────────┬─────── │  └──────────────────────┘     │
│           │         │                               │
│           ▼         │                               │
│  ┌─────────────────┐│                               │
│  │  GEMINI API     ││                               │
│  │  System prompt  ││                               │
│  │  + circuitState ││                               │
│  │  + studentMem   ││                               │
│  │  + experimentCtx││                               │
│  └────────┬────────┘│                               │
│           │         │                               │
│           ▼         │                               │
│  ┌─────────────────┐│                               │
│  │  RESPONSE       ││                               │
│  │  text + actions ││                               │
│  │  + audio URL    ││                               │
│  └─────────────────┘│                               │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP (TTS request)
                       ▼
┌─────────────────────────────────────────────────────┐
│                VPS 72.60.129.50                      │
│                                                     │
│  ┌─────────────────┐  ┌──────────────────────┐     │
│  │  Voxtral 4B TTS │  │  Galileo Brain       │     │
│  │  POST /tts      │  │  (fallback offline)   │     │
│  │  Streaming audio│  │  POST /generate       │     │
│  └─────────────────┘  └──────────────────────┘     │
└─────────────────────────────────────────────────────┘
```

## ENDPOINT API (compatibili con Nanobot V1)

### 1. POST /tutor-chat
**Input:**
```json
{
  "message": "Come funziona un LED?",
  "sessionId": "tutor-1712345678-abc123",
  "circuitState": { "components": [...], "connections": [...] },
  "experimentId": "v1-cap6-esp1",
  "simulatorContext": { "running": false, "errors": [] }
}
```
**Output:**
```json
{
  "success": true,
  "response": "Il LED è come una strada a senso unico...",
  "source": "gemini-3.1-flash-lite",
  "audio": "https://72.60.129.50/tts/audio-abc123.mp3"
}
```

### 2. POST /chat (con immagini/vision)
**Input:** Come /tutor-chat + `images: [{ base64, mimeType }]`
**Output:** Come /tutor-chat (usa sempre Gemini Flash o Pro per vision)

### 3. POST /diagnose
**Input:** `{ circuitState, experimentId }`
**Output:** `{ success, diagnosis, source }`

### 4. POST /hints
**Input:** `{ experimentId, currentStep, difficulty }`
**Output:** `{ success, hints, source }`

## ROUTING AI

```javascript
function routeModel(message, context) {
  const msg = message.toLowerCase();
  const hasImages = context.images?.length > 0;
  const hasErrors = context.circuitState?.errors?.length > 0;

  // PRO (5%): vision + circuiti complessi con errori
  if (hasImages && hasErrors) return 'gemini-3.1-pro-preview';
  if (msg.match(/analizza|debug|perché non|errore complesso/)) return 'gemini-3.1-pro-preview';

  // FLASH (25%): ragionamento, spiegazioni, confronti
  if (hasImages) return 'gemini-3-flash-preview';
  if (msg.match(/spiega|come funziona|differenza|confronta|progetta|perché/))
    return 'gemini-3-flash-preview';

  // FLASH-LITE (70%): tutto il resto
  return 'gemini-3.1-flash-lite-preview';
}
```

## SYSTEM PROMPT ELAB (per Gemini)

Derivato dal system prompt attuale in api.js, ottimizzato per Gemini:
- Identità: UNLIM, tutor elettronica 8-14 anni
- Regole: max 60 parole, 3 frasi + 1 analogia
- Tag azioni: [AZIONE:play], [AZIONE:highlight:id], etc.
- Contesto circuito iniettato dinamicamente
- Memoria studente iniettata dinamicamente

## VOXTRAL TTS

### Endpoint VPS
```
POST http://72.60.129.50:8880/tts
Content-Type: application/json

{
  "text": "Il LED è come una strada a senso unico...",
  "voice": "unlim-tutor",
  "language": "it",
  "speed": 0.95
}

Response: audio/mpeg (streaming)
```

### Chunking per fluidità
1. Gemini genera risposta testo
2. Edge Function invia PRIMA la risposta testo al frontend
3. In parallelo, chiama Voxtral per la voce
4. Frontend mostra testo subito, audio arriva ~1s dopo
5. Mascotte si anima quando audio parte

## MEMORIA PERSISTENTE

### Schema DB (già in supabase/schema.sql)
- `student_sessions` — sessioni con timestamp
- `student_progress` — esperimenti completati, errori
- `lesson_contexts` — contesto lezione per cross-session
- `confusion_reports` — errori aggregati per classe
- `mood_reports` — stato emotivo studente

### Contesto iniettato in ogni chiamata
```javascript
async function buildStudentContext(sessionId, experimentId) {
  const progress = await supabase
    .from('student_progress')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(5);

  return `
MEMORIA STUDENTE:
- Esperimenti completati: ${progress.completed?.length || 0}/62
- Errori frequenti: ${progress.common_mistakes?.join(', ') || 'nessuno'}
- Ultima sessione: ${progress.last_session || 'prima volta'}
- Livello: ${progress.level || 'principiante'}
  `;
}
```

## COSTI

| Componente | Costo/mese |
|-----------|-----------|
| Supabase (free tier) | €0 |
| Gemini API (per classe) | ~€3.30 |
| VPS (Voxtral + Brain) | €10 fisso |
| **Totale per classe** | **~€3.30** |
| **Prezzo scuola** | **€20/classe** |
| **Margine** | **~82%** |

## MIGRAZIONE

### Frontend: UN solo cambio
```javascript
// .env
VITE_NANOBOT_URL=https://tuo-progetto.supabase.co/functions/v1
// Prima era: https://elab-galileo.onrender.com
```

### Fallback chain aggiornata
```
1. Supabase Edge (Gemini) → primario
2. VPS Brain (Ollama) → fallback offline
3. Knowledge base locale → ultima risorsa
```

## FILE DA CREARE

```
supabase/functions/
  unlim-chat/index.ts        — /tutor-chat + /chat endpoint
  unlim-diagnose/index.ts    — /diagnose endpoint
  unlim-hints/index.ts       — /hints endpoint
  unlim-tts/index.ts         — proxy TTS verso VPS Voxtral
  _shared/
    gemini.ts                 — client Gemini API
    router.ts                 — routing 70/25/5
    system-prompt.ts          — system prompt ELAB
    memory.ts                 — lettura/scrittura memoria studente
    types.ts                  — tipi condivisi
```

## COMPATIBILITÀ

Il frontend ELAB (`api.js`) non cambia logica — solo l'URL del Nanobot.
I 4 endpoint restano identici nel formato request/response.
Zero regressioni su 1053 test.
