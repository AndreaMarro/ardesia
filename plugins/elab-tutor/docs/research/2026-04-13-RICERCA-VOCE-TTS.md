# Ricerca Tecnica: TTS Voce per ELAB

**Data:** 13/04/2026
**Autore:** Andrea Marro — Claude Code Terminal

---

## Problema

ELAB usa browser `speechSynthesis` per TTS. Qualità 6/10 su Chrome (Google Italian), 4/10 su Safari.
Serve voce naturale per bambini 8-14. Budget €0-20/mese. Target: Mac Mini M4 16GB on-premise.

---

## Soluzioni Trovate

### Soluzione A: Kokoro TTS (82M) su Mac Mini M4 ⭐ RACCOMANDATO

- **Qualità**: 8/10 — batte modelli 10x più grandi (XTTS v2 467M, MetaVoice 1.2B)
- **Latenza**: 40-70ms GPU, 3-11x realtime CPU → <100ms su M4
- **Costo**: €0 (Apache 2.0 — uso commerciale OK)
- **Italiano**: ✅ nativo
- **Setup**: `pip install kokoro` + FastAPI server
- **RAM**: ~500MB (82M parametri)
- **Effort**: BASSO (2-4 ore)
- **Rischi**: Nessuno (Apache 2.0, ben mantenuto, 5K+ ⭐ GitHub)

### Soluzione B: Voxtral 4B TTS (Mistral)

- **Qualità**: 9/10 — batte ElevenLabs Flash nel 68% dei blind test
- **Latenza**: 70ms
- **Voice cloning**: 3 secondi di audio di riferimento
- **Costo**: €0 self-hosted
- **Italiano**: ✅ nativo
- **Setup**: HuggingFace + vLLM/TGI
- **RAM**: ~8GB (4B parametri) — AL LIMITE su Mac Mini 16GB con altri servizi
- **Effort**: MEDIO (4-8 ore)
- **⚠️ Licenza**: CC BY-NC 4.0 = NON COMMERCIALE. Per vendere ELAB serve API Mistral (~€0.012/1000 chars)
- **Rischi**: RAM al limite, licenza non commerciale

### Soluzione C: ElevenLabs Flash v2.5 (API cloud)

- **Qualità**: 9/10
- **Latenza**: <100ms
- **Costo**: Free tier 10K chars/mese, poi $0.18/1K chars (~€3/classe/mese)
- **Italiano**: ✅
- **Setup**: API key + fetch
- **Effort**: BASSO (1 ora)
- **Rischi**: Costo a scala, dipendenza API

### Soluzione D: Piper TTS (on-device, leggero)

- **Qualità**: 6/10 — voce accettabile ma non naturale
- **Latenza**: <50ms
- **Costo**: €0 (MIT license)
- **Italiano**: ✅ (voci pre-trained)
- **RAM**: ~100MB
- **Effort**: BASSO (2 ore)
- **Rischi**: Qualità inferiore, poco espressivo

### Soluzione E: Browser Speech Synthesis (attuale)

- **Qualità**: 4-6/10 (dipende dal browser)
- **Latenza**: 0ms
- **Costo**: €0
- **Effort**: 0 (già implementato)

---

## Gemma 4 — Chiarimento

Gemma 4 (Google, 26/02/2026) NON fa TTS. Fa:
- STT (Speech-to-Text): capisce audio in italiano
- Ragionamento multimodale (video, immagini, audio → testo)
- On-device: E2B (2B eff.) su Mac Mini M4

L'architettura giusta (progetto "Parlor" su GitHub):
**Gemma 4 E2B** (capisce) + **Kokoro** (parla) = voice assistant completo su Mac Mini M4

---

## Raccomandazione

| Scenario | Soluzione | Costo |
|----------|-----------|-------|
| Demo lunedì | Browser TTS (attuale) | €0 |
| MVP vendibile | **Kokoro su Mac Mini M4** | €0 |
| Premium voice | ElevenLabs Flash | ~€3/classe/mese |
| Futuro (se licenza cambia) | Voxtral 4B | €0 |

**Piano implementazione Kokoro:**
1. `pip install kokoro` su Mac Mini M4
2. FastAPI server con endpoint `/tts` (POST text → WAV/MP3)
3. Reverse proxy nginx con HTTPS
4. Frontend: `fetch('https://mini.elab/tts', {body: text})` → `Audio.play()`
5. Fallback a browser TTS se Mac Mini offline

---

## Fonti

- [Kokoro TTS](https://kokorottsai.com) — 82M params, Apache 2.0
- [Voxtral 4B TTS](https://huggingface.co/mistralai/Voxtral-4B-TTS-2603) — Mistral, CC BY-NC
- [Gemma 4](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/) — Google, on-device
- [Parlor](https://github.com/fikrikarim/parlor) — Gemma 4 + Kokoro voice assistant
- [Local TTS Guide 2026](https://localclaw.io/blog/local-tts-guide-2026) — Comparativa
- [ElevenLabs](https://elevenlabs.io) — API cloud TTS
- [Piper TTS](https://rhasspy.github.io/piper-samples/) — Lightweight on-device
