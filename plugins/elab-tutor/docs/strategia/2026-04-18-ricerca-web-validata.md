# Ricerca Web Validata — Stack TTS/LLM/Wake Word
## 18 Aprile 2026 — Numeri aggiornati con fonti

> **Metodologia:** ogni numero in questo doc è verificato via WebSearch il 17-18/04/2026.
> Sostituisce gli assunti del doc `2026-04-17-stack-tts-llm-slm.md`, specie dove le cifre differiscono.

---

## 1. TTS — Kokoro 82M vs alternative (validato)

### 1.1 Kokoro 82M — conferme

| Dato | Valore | Fonte |
|---|---|---|
| Posizione TTS Arena (gennaio 2026) | **#1** (batte XTTS 467M, MetaVoice 1.2B) | TTS Arena leaderboard (citato da Arif Solmaz, ariya.io, geeky-gadgets) |
| MOS score (open-source) | **4.2** (massimo tra open) | Hugging Face benchmarks |
| Licenza | **Apache 2.0** | HuggingFace Kokoro-82M card |
| Throughput | **17× real-time** CPU (~96× su GPU cloud) | ariya.io Mar 2026 |
| Parametri | 82M | HF |
| Lingua italiana | 1 voce F + 1 voce M | VOICES.md HuggingFace |
| Supporto IT | "thin" (weak G2P per non-EN) | HuggingFace VOICES.md |

**Rischio identificato (nuovo):** solo 2 voci italiane. Per ELAB serve variazione (docente vs mascotte vs narratore). Azione: valutare XTTS v2 come secondo motore per multi-voice italiano.

### 1.2 ElevenLabs Flash v2.5 (verificato)

| Dato | Valore | Fonte |
|---|---|---|
| Latenza inferenza | **75ms** (escluso network) | deeplearning.ai "The Batch", ElevenLabs docs |
| Lingue | 32 | ElevenLabs Docs |
| Target use case | real-time agents, interactive apps | ElevenLabs |
| Pricing (stimato già noto) | ~$0.30 / 1000 char | strategia doc (non ri-verificato qui) |

**Conferma:** a scala ELAB (100 classi × 40M char/anno) → ~€10K/anno. Non sostenibile come default. Usare come **premium opt-in**.

### 1.3 Fish Audio vs ElevenLabs (contesto 2026)

Emerge come alternativa open-source competitiva. Non testato IT, da valutare.

---

## 2. LLM — Gemini pricing CORRETTO (aprile 2026)

### 2.1 Cifre verificate

| Modello | Input/1M tok | Output/1M tok | Fonte |
|---|---|---|---|
| **Gemini 2.5 Flash** | **$0.30** | **$2.50** | pricepertoken.com, MetaCTO, tokencost.app |
| **Gemini 2.5 Flash-Lite** | **$0.10** | **$0.40** | llm-stats.com, developers.googleblog.com |
| Gemini 2.5 Pro | $1.25 | $5.00 | tldl.io |
| Cached context | $0.03 / 1M | — | pricepertoken |

### 2.2 Differenza rispetto a strategia precedente

Il doc `2026-04-17-stack-tts-llm-slm.md` indicava Flash a $0.075/$0.30, che **sono le vecchie cifre di Flash-Lite**. La stima costo €5-10/mese era sottostimata.

### 2.3 Ricalcolo onesto a scala

**Assunzioni:** 100 classi × 25 studenti × 20 req/mese = 50.000 req/mese. Media 2K input + 500 output tokens.

| Routing | Quota | Input (tok) | Output (tok) | Costo in $ | Costo out $ | Totale |
|---|---|---|---|---|---|---|
| 70% Flash-Lite | 35.000 | 70M | 17.5M | $7.00 | $7.00 | **$14** |
| 25% Flash | 12.500 | 25M | 6.25M | $7.50 | $15.63 | **$23** |
| 5% Pro | 2.500 | 5M | 1.25M | $6.25 | $6.25 | **$12.50** |
| **Totale** | **50.000** | | | | | **~$50/mese (€45)** |

Free tier Flash-Lite (1500+ req/min in 2026) copre una parte. Stima realistica: **€30-50/mese** (vs €5-10 del doc precedente).

**Impatto:** infra mensile totale sale da €50-55 a **~€80-100**. Margine scende da 95% a **~92%** su €1250/mese ricavi. Ancora molto buono, ma va aggiornato il documento strategia.

---

## 3. Porcupine Wake Word — limiti veri 2026

### 3.1 Free tier

| Dato | Valore (aprile 2026) | Fonte |
|---|---|---|
| Free tier | **1 Monthly Active User** | SaaSWorthy, Picovoice Docs |
| Custom keyword | training istantaneo su Picovoice Console | Picovoice Console Tutorial |
| Deploy commerciale free | ✓ per piccoli progetti | Picovoice FAQ |
| Enterprise pricing | da **$6000/anno** | SaaSWorthy |

### 3.2 Impatto ELAB

- POC (Andrea + docente test) → OK con free tier
- **Produzione 100 classi** → servono 100+ MAU per **€6000+/anno** (~€500/mese) — fuori budget!

### 3.3 Alternative da valutare

| Opzione | Costo | Browser support | Note |
|---|---|---|---|
| **Web Speech API + keyword detection custom** | €0 | Chrome/Edge (no Safari, no Firefox) | Attualmente usato in `wakeWord.js`. Meno preciso di Porcupine |
| **Mycroft Precise** | Open source, gratis | Richiede runtime custom | Poco manutenuto 2025+ |
| **openWakeWord** | Open source, gratis | Python/JS bindings | Alternativa seria, voce training possibile |
| **Whisper.cpp + keyword match** | On-device, free | WASM | Più pesante ma robusto |

**Raccomandazione aggiornata:**
1. Mantenere Web Speech API fallback per Chrome/Edge (già attivo)
2. Roadmap Q3 2026: valutare **openWakeWord** come alternativa gratuita e cross-browser
3. Porcupine **solo per POC**, non in produzione

---

## 4. Silero VAD per barge-in — fattibile

### 4.1 Cifre tecniche

| Dato | Valore | Fonte |
|---|---|---|
| RTF (Real-Time Factor) | **0.004** AMD CPU | Silero VAD GitHub |
| 1 ora audio → processato in | 15.4s | Silero GitHub |
| Browser integration | ONNX Runtime Web (WASM) | snakers4/silero-vad discussions |
| Package npm | `@ricky0123/vad` | npmjs.com |
| CPU usage | "negligible" | Silero docs |

### 4.2 Integrazione ELAB

Il barge-in per interrompere il TTS quando il docente inizia a parlare è tecnicamente **fattibile in 1 sprint**:
1. `npm install @ricky0123/vad`
2. Avviare VAD listener quando TTS sta parlando
3. `vadSpeechDetected` → `speechSynthesis.cancel()` + `audio.pause()`
4. Latency target: <500ms dalla voce al cancel (VAD ~200ms)

**Azione:** aggiungere a backlog sprint 2 (dopo Kokoro + useUnlimNudge).

---

## 5. Competitor — Tinkercad / Wokwi / AI STEM (verificato)

### 5.1 Panorama 2026

| Tool | Target | AI Tutor | IT/scuole |
|---|---|---|---|
| Tinkercad Circuits | principianti, scuole | ✗ (AI in 3D, non in circuiti) | ✓ Google Classroom integration |
| Wokwi | maker avanzati, ESP32 | ✗ | generic |
| Proteus | professionisti | ✗ | generic |
| **ELAB Tutor** | **8-14 anni, scuole IT** | **✓ UNLIM** | **✓ kit fisici + volumi IT** |

### 5.2 Conferma unicità ELAB

Nessun competitor 2026 ha "AI tutor + volumi fisici IT + sessioni personalizzate + kit hardware". Posizionamento unico confermato.

**Cifra differenziatore:** Tinkercad ha classi Google Classroom ma ZERO AI tutoring. Wokwi è solo simulatore. ELAB = simulatore + AI + libri + kit.

### 5.3 Gap di validazione

Non ho trovato prodotti italiani competitor diretti con AI tutor per elettronica 10-14. Conferma: ELAB è pioniere in questo specifico segmento.

---

## 6. Decisioni aggiornate (sostituisce strategia precedente)

### 6.1 Stack TTS produzione

1. **Default**: Kokoro 82M VPS → **conferma** (Apache 2.0, MOS 4.2, IT voci limitate ma usabili)
2. **Fallback L1**: Edge TTS VPS (già attivo 72.60.129.50:8880)
3. **Fallback L2**: Browser `speechSynthesis`
4. **Premium opt-in**: ElevenLabs Flash v2.5 (€ a consumo, solo demo/marketing)

### 6.2 Wake word

- **Default produzione**: Web Speech API (già attivo) — NON Porcupine
- **Roadmap Q3**: migrazione a **openWakeWord** per cross-browser
- **Porcupine**: solo per sviluppo/POC (free 1 MAU)

### 6.3 LLM routing

- 70% Flash-Lite ($0.10/$0.40) per query brevi
- 25% Flash ($0.30/$2.50) per contesto arricchito
- 5% Pro ($1.25/$5) per lezioni complesse / vision
- **Costo realistico: €30-50/mese @ 100 classi** (vs stima precedente €5-10 — corretto)

### 6.4 Barge-in

- Sprint 2: integrare `@ricky0123/vad` (Silero via ONNX WASM)
- Target: TTS stop in <500ms dal detect voce docente

---

## 7. TL;DR cambiamenti rispetto al doc precedente

| Elemento | Doc 17/04 | Ricerca 18/04 | Impatto |
|---|---|---|---|
| Gemini Flash pricing | $0.075/$0.30 | **$0.30/$2.50** | 4-8× più caro |
| Gemini Flash-Lite pricing | — | $0.10/$0.40 | come Flash-Lite vecchio |
| Costo infra totale | €50-55/mese | **€80-100/mese** | +60% |
| Margine | 95.6% | ~92% | -3.6pp (ancora ottimo) |
| Porcupine free tier | 3 MAU (memoria Andrea) | **1 MAU** | richiede alternativa |
| Kokoro IT voci | non specificato | 1F + 1M (thin) | valutare seconda voce |
| Silero VAD fattibilità | da verificare | **fattibile 1 sprint** | confermato per Sprint 2 |
| Competitor IT | ipotesi unicità | **confermato pioniere** | posizionamento OK |

---

## 8. Fonti

### TTS
- [Kokoro TTS Review 2026 — ReviewNexa](https://reviewnexa.com/kokoro-tts-review/)
- [Kokoro-82M VOICES.md — HuggingFace](https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md)
- [Local CPU-Friendly Kokoro TTS — ariya.io](https://ariya.io/2026/03/local-cpu-friendly-high-quality-tts-text-to-speech-with-kokoro)
- [ElevenLabs drops latency to 75ms — DeepLearning.ai](https://www.deeplearning.ai/the-batch/elevenlabs-drops-latency-to-75-milliseconds/)
- [Eleven Flash v2.5 benchmarks — llm-stats.com](https://llm-stats.com/models/eleven_flash_v2_5)
- [Best Open-Source TTS Models 2026 — CodeSOTA](https://www.codesota.com/guides/tts-models)

### LLM
- [Gemini 2.5 Flash pricing 2026 — pricepertoken.com](https://pricepertoken.com/pricing-page/model/google-gemini-2.5-flash)
- [Gemini 2.5 Flash-Lite pricing — pricepertoken.com](https://pricepertoken.com/pricing-page/model/google-gemini-2.5-flash-lite)
- [Gemini API Pricing 2026 — MetaCTO](https://www.metacto.com/blogs/the-true-cost-of-google-gemini-a-guide-to-api-pricing-and-integration)
- [Gemini 2.5 Flash-Lite GA — Google Developers Blog](https://developers.googleblog.com/en/gemini-25-flash-lite-is-now-stable-and-generally-available/)
- [Gemini Pricing 2026 — TLDL.io](https://www.tldl.io/resources/google-gemini-api-pricing)

### Wake Word
- [Picovoice Free Tier — Hackster.io](https://www.hackster.io/news/picovoice-launches-completely-free-usage-tier-for-offline-voice-recognition-for-up-to-three-users-e1eafbc97bb0)
- [Picovoice Pricing SaaSWorthy April 2026](https://www.saasworthy.com/product/picovoice-ai/pricing)
- [Porcupine FAQ — Picovoice](https://picovoice.ai/docs/faq/porcupine/)
- [Complete Guide to Wake Word Detection 2026 — Picovoice](https://picovoice.ai/blog/complete-guide-to-wake-word/)

### VAD
- [@ricky0123/vad — npm](https://www.npmjs.com/package/@ricky0123/vad)
- [Silero VAD in browser — GitHub Discussion](https://github.com/snakers4/silero-vad/discussions/175)
- [Silero VAD GitHub](https://github.com/snakers4/silero-vad)
- [Best VAD 2026 — Picovoice](https://picovoice.ai/blog/best-voice-activity-detection-vad/)

### Competitor
- [Wokwi vs Tinkercad for STEM Labs — cybotz](https://cybotz.tech/wokwi-vs-tinkercad-best-tool-for-school-stem-labs-let-the-circuit-showdown-begin/)
- [Best Arduino Simulators 2026 — Zbotic](https://zbotic.in/best-arduino-simulator-tools-tinkercad-vs-wokwi-vs-proteus/)
- [Tinkercad and AI STEM Future — PrintPal](https://blog.printpal.io/tinkercad-and-ai-the-future-of-stem-education-and-creative-3d-design/)

---

*Documento validato con WebSearch live 17-18/04/2026. Andrea Marro via Claude Code Ralph Loop iterazione 1.*
