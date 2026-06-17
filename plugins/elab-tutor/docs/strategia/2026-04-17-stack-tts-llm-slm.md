# Strategia Stack AI: TTS / LLM / SLM per ELAB Tutor
## 17 Aprile 2026 — Andrea Marro

> Obiettivo: avere un prodotto **unico e sostenibile** per le scuole.
> Budget target: €10-50/mese (200-2000 utenti attivi/mese).

---

## 1. Mappa decisionale — quando usare cosa

```
                          ┌──────────────────────┐
                          │  RICHIESTA UTENTE    │
                          │  (voice/text/vision) │
                          └──────────┬───────────┘
                                     │
                ┌────────────────────┼────────────────────┐
                │                    │                    │
           ┌────▼──────┐       ┌─────▼──────┐       ┌─────▼──────┐
           │  TESTO    │       │    VOCE    │       │   VISIONE  │
           └────┬──────┘       └─────┬──────┘       └─────┬──────┘
                │                    │                    │
        ┌───────▼────────┐           │            ┌───────▼────────┐
        │ KB locale hit? │           │            │ Screenshot     │
        │  (score ≥2.5)  │           │            │ + Gemini Vision│
        └───┬───────┬────┘           │            └────────────────┘
            │       │                │
          SI│      NO│                │
            │       │                │
     ┌──────▼─┐  ┌──▼─────────┐      │
     │ KB    │  │ RAG (549   │      │
     │ entry │  │  chunk)?  │      │
     │ (free)│  └─┬────────┬─┘      │
     └───────┘   SI│      NO│       │
                  │        │       │
              ┌───▼──┐  ┌──▼─────────▼──────────┐
              │ RAG  │  │    LLM/SLM cloud      │
              │ snippet│ │ (Gemini/OpenRouter) │
              │ (free)│  └───────────────────────┘
              └──────┘
                                     │
                ┌────────────────────┼────────────────────┐
                │                    │                    │
           TTS OUTPUT           STT INPUT              VISION OUT
                │                    │                    │
           ┌────▼──────┐       ┌─────▼──────┐
           │ Browser    │       │ Web Speech │
           │ speechSyn  │       │ API Chrome │
           │ (fallback) │       │ (free)     │
           └────────────┘       └────────────┘
                │
           ┌────▼──────┐
           │ Edge TTS   │  ← VPS, gratuito
           │ (72.60...) │
           └────────────┘
                │
           ┌────▼──────┐
           │ Kokoro 82M │  ← Self-hosted VPS (€5/mese)
           │ (premium)  │
           └────────────┘
```

---

## 2. TTS — Text-to-Speech

**Obiettivo:** voce naturale italiana per bambini 10-14 anni, non robotica.

| Opzione | Costo | Qualità IT | Latency | CORS | Decisione |
|---|---|---|---|---|---|
| **Browser `speechSynthesis`** | €0 | ★★☆☆☆ (robotica) | <100ms | ✓ | **Fallback sempre disponibile** |
| **Edge TTS (Microsoft, via VPS)** | €0 (solo VPS) | ★★★★☆ | 500-800ms | ✗ da browser diretto | **Proxy tramite VPS** (già fatto: `72.60.129.50:8880`) |
| **Kokoro 82M (self-hosted)** | €5-10/mese VPS | ★★★★★ (best open-source IT) | 1-2s | ✗ | **Premium opzionale** |
| **ElevenLabs** | €5-100/mese | ★★★★★ | 300-600ms | ✓ | Escluso — costo proibitivo a scala |
| **OpenAI TTS (alloy/nova)** | $0.015/1K char | ★★★★☆ | 400ms | ✓ | Alternativa, ma costo variabile |
| **Chatterbox (2024)** | Self-host | ★★★★☆ (SoTA, open) | 1-3s | ✗ | **Valutare per 2026** — battle-testati < 50k parametri |

**Decisione ELAB:**
1. **Default**: Edge TTS via VPS (€0 incrementale, CORS-proxy). Qualità buona, già funzionante.
2. **Premium**: Kokoro su VPS condiviso (€5/mese) per docenti scuole Paganti.
3. **Fallback**: Browser `speechSynthesis` quando tutto cade.

**Azione immediata**: verificare CORS/proxy da Vercel a `72.60.129.50:8880`. Se bloccato, aggiungere route proxy `elabtutor.school/api/tts` → VPS.

---

## 3. LLM — Large Language Models (cloud)

**Obiettivo:** UNLIM prepara lezioni, spiega concetti, cita volumi. Serve contesto esteso (bookText + storia sessioni + circuitState ~4-8K tokens) e risposta italiana in ~60 parole.

| Opzione | Costo input/output (1M tok) | Italiano | Contesto | Decisione |
|---|---|---|---|---|
| **Gemini 2.5 Flash** | $0.075 / $0.30 | ★★★★☆ | 1M | **Default** — free tier 1500 req/day |
| **Gemini 2.5 Flash-Lite** | $0.075 / $0.30 | ★★★☆☆ | 1M | Routing per query semplici |
| **Gemini 2.5 Pro** | $1.25 / $5.00 | ★★★★★ | 2M | Query complesse (<5% traffico) |
| **Claude 3.5 Haiku** | $1.00 / $5.00 | ★★★★★ | 200K | Premium fallback |
| **DeepSeek V3** | $0.27 / $1.10 | ★★★★☆ | 64K | **Fallback alto rapporto Q/€** |
| **OpenRouter → Qwen 2.5 72B** | $0.35 / $0.40 | ★★★★☆ | 128K | Alternativa per routing |

**Routing ELAB v5.5 (già implementato):**
- 70% Gemini Flash-Lite (query semplici, brevi)
- 25% Gemini Flash (contesto arricchito, KB+RAG+book)
- 5% Gemini Pro (query complesse, lezioni lunghe, vision)
- Fallback: DeepSeek → webhook n8n → RAG locale

**Costo stimato a scala (100 classi, 20 req/studente/mese):**
- 100 classi × 25 studenti × 20 req = 50K req/mese
- 80% free tier Gemini (40K req) = €0
- 20% paid (10K req × avg 2K tok) = ~$3/mese
- **~€5/mese totale** per AI

---

## 4. SLM — Small Language Models (on-device / edge)

**Obiettivo:** privacy scuole (GDPR), offline, latency bassa, zero costi marginali.

| Opzione | Dimensione | Italiano | Inferenza | Decisione |
|---|---|---|---|---|
| **Qwen 3.5 2B (Q5_K_M)** | 1.5GB | ★★★★☆ | CPU ~10 tok/s | **Galileo Brain** già deployato su VPS (72.60.129.50:11434) |
| **Gemma 2 2B** | 1.7GB | ★★★☆☆ | CPU ~8 tok/s | Alternativa quantizzata |
| **Llama 3.2 3B** | 2.1GB | ★★★★☆ | CPU ~6 tok/s | Open-source ecosystem forte |
| **Phi-3.5 Mini 3.8B** | 2.3GB | ★★★★☆ | CPU ~8 tok/s | Microsoft, ottima per instruction |
| **WebLLM + Gemma 2 2B** | 1.7GB | ★★★☆☆ | GPU browser ~15 tok/s | **Futuro**: on-device nel browser (serviceworker) |

**Caso d'uso SLM in ELAB:**
1. **Query ripetitive** (`"cos'è il LED"`, `"non va"`) — risposta istantanea KB, no chiamata cloud.
2. **Offline fallback** — scuole con connessione instabile.
3. **Routing brainy**: Galileo Brain (Qwen 3.5 2B) già decide quale LLM cloud chiamare in base al tipo di query.

**Decisione ELAB:**
- **Galileo Brain VPS** rimane il routing layer (già OK).
- **Roadmap 2026-Q4**: WebLLM/Transformers.js on-device per domande KB senza chiamate cloud. POC fattibile, dipende da stabilità Chrome/Firefox WebGPU.

---

## 5. STT — Speech-to-Text

| Opzione | Costo | Qualità IT | Latency | Decisione |
|---|---|---|---|---|
| **Web Speech API (Chrome)** | €0 | ★★★★☆ | 100-300ms | **Default** (già usato in `wakeWord.js`) |
| **Whisper.cpp** (on-device) | €0 | ★★★★★ | 1-3s | Roadmap privacy scuole |
| **AssemblyAI / Deepgram** | $0.01/min | ★★★★★ | 200ms | Costo proibitivo a scala |

**Decisione:** Web Speech API fino a che il costo diventa un problema. Whisper.cpp a lungo termine.

---

## 6. Vision (Gemini Vision)

UNLIM "guarda il circuito" → screenshot → Gemini 2.5 Flash Vision → diagnosi.

- **Costo:** $0.075/1M tok input (immagine ~258 tok = $0.00002 per chiamata)
- **Stima 100 classi:** 5 query vision/classe/giorno = 500 req/gg = $0.30/mese
- **Già implementato** in `api.js` + trigger regex in `useGalileoChat.js`

**Problema aperto:** mai verificato E2E in browser live. Azione: test manuale.

---

## 7. Schema finale — stack ELAB sostenibile

```
┌─────────────────────────────────────────────────────────┐
│              USER LAYER (browser)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐     │
│  │ Web Speech  │  │ speechSynth │  │  React UI    │     │
│  │ (STT+Wake)  │  │ (TTS fallback)  │  (simulator) │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘     │
└─────────┼─────────────────┼───────────────┼────────────┘
          │                 │               │
┌─────────▼─────────────────▼───────────────▼────────────┐
│                   EDGE LAYER (VPS €5/mese)              │
│  ┌───────────┐   ┌────────────┐   ┌──────────────┐      │
│  │ Edge TTS  │   │ Kokoro TTS │   │ Galileo Brain│      │
│  │  (proxy)  │   │ (premium)  │   │ (Qwen 3.5 2B)│      │
│  └───────────┘   └────────────┘   └──────┬───────┘      │
└──────────────────────────────────────────┼──────────────┘
                                            │ routing decision
┌───────────────────────────────────────────▼─────────────┐
│                 CLOUD LAYER (~€5/mese @scale)           │
│  ┌──────────────┐    ┌──────────────┐   ┌────────────┐  │
│  │ Gemini Flash │    │ Gemini Pro    │   │ DeepSeek V3│  │
│  │ (70% + vision) │   │ (complex 5%)│   │ (fallback) │  │
│  └──────────────┘    └──────────────┘   └────────────┘  │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│        LOCAL KB/RAG (offline fallback)       │
│ KB curata (50 entry) + RAG 549 chunk volumi  │
└──────────────────────────────────────────────┘
```

---

## 8. Differenziatori competitivi

Nessun competitor ha TUTTI questi elementi combinati:

| Competitor | Simulatore | AI Tutor | Voce IT | Offline | GDPR kids | Volumi fisici |
|---|---|---|---|---|---|---|
| **ELAB Tutor** | ✓ | ✓ (UNLIM) | ✓ | ✓ (KB local) | ✓ (zero PII) | ✓ (3 volumi kit) |
| Tinkercad | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Arduino Education | parziale | ✗ | ✗ | ✗ | ✗ | ✓ |
| CampuStore CTC | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Wokwi | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

**Unicità ELAB:**
1. Lezioni personalizzate su storia sessioni (nessuno lo fa)
2. Parallelismo perfetto libri fisici ↔ simulatore (unico)
3. Principio Zero: docente impreparato guidato senza studiare (unico)

---

## 9. Costi a scala (scenario realistico)

**100 classi × 25 studenti/classe × 8 mesi anno scolastico:**

| Voce | Costo/mese |
|---|---|
| Vercel (frontend) | €0 (free tier) |
| Supabase (DB + Edge Functions) | €25 (Pro tier per non-paused) |
| VPS (Edge TTS + Kokoro + Galileo Brain) | €10 |
| Gemini API (70/25/5 routing) | €5-10 |
| Compilatore n8n (Hostinger) | €8 |
| Dominio + CDN extras | €2 |
| **Totale** | **€50-55/mese** |

**Ricavi a scala:**
- ELAB Scuola: €500/anno × 30 scuole = €15K/anno → €1250/mese
- Margine: (€1250 - €55) / €1250 = **95.6%**

---

## 10. Azioni concrete prossimi cicli

| # | Azione | Priorità | Tempo |
|---|---|---|---|
| 1 | Verificare CORS Edge TTS da Vercel (proxy route) | **ALTA** | 1h |
| 2 | Test E2E Vision in browser live | **ALTA** | 30min |
| 3 | Resume Supabase (Andrea, manuale) | **ALTA** | 5min |
| 4 | Fix n8n `/compile` (verificare path /webhook/compile) | **MEDIA** | 1h |
| 5 | Integrare `useUnlimNudge` in EmbeddedGuide (FASE 3) | **MEDIA** | 1h |
| 6 | POC WebLLM + Gemma 2 2B on-device | **BASSA** | Roadmap Q4 |
| 7 | Valutazione Chatterbox TTS vs Kokoro | **BASSA** | Roadmap Q3 |

---

*Documento strategico — aggiornare ogni trimestre con benchmarks.*
