# PDR Settimana 6 — Voice Premium: Voxtral TTS + Whisper STT + Wake Word

**Periodo**: lunedì 26/05/2026 → domenica 01/06/2026
**Owner**: Andrea + Tea + Team Opus
**Goal**: Voice premium UX = Voxtral 4B TTS self-host + Whisper Turbo STT (Cloudflare gratis) + wake word "Ehi UNLIM" browser-side. **Score target**: 8.3/10.

---

## 0. Architettura Voice premium

```
Microfono Browser
   │
   ▼
Wake Word Detection (openWakeWord browser-side)
   │ "Ehi UNLIM" rilevato
   ▼
Whisper Turbo STT (Cloudflare Workers AI)
   │ trascritto
   ▼
UNLIM (Vercel AI SDK + Together AI)
   │ response text
   ▼
Voxtral 4B TTS (Hetzner self-host)
   │ audio mp3
   ▼
Speaker Browser
```

**Why questa architettura**:
- Voxtral 4B = batte ElevenLabs in benchmark, voice cloning 3s, GDPR self-host EU
- Whisper Turbo Cloudflare = gratis 10K query/day, latency <500ms
- openWakeWord browser = no cloud STT continuo (privacy + cost)

---

## 1. Obiettivi misurabili sett 6

| Obiettivo | Target |
|-----------|--------|
| Voxtral 4B deployed Hetzner | sì |
| Whisper Turbo CF integration | sì |
| openWakeWord browser custom "Ehi UNLIM" | sì |
| 36 voice command testati E2E | 36/36 |
| Latency wake → response audio | <3s |
| Voice cloning Andrea 3s sample | sì |
| Apostrophe bug TTS fixato | sì |
| Score benchmark | 8.3 |
| Test count | 13456+ |
| OpenClaw Telegram layer iniziato | wireframe |

---

## 2. Task breakdown 7 giorni

### Lun 26/05 — Voxtral 4B deploy Hetzner

- DEV: setup container Voxtral 4B su Hetzner (GPU shared sufficient)
- DEV: HTTP API wrapper (text → mp3 audio)
- TESTER: latency test (target <2s per 60-word response)
- File: `giorni/PDR_GIORNO_36_LUN_26MAG.md`

### Mar 27/05 — Voice cloning Andrea

- DEV: Voxtral voice cloning (3s sample Andrea voice)
- TESTER: A/B test originale vs Andrea-cloned voice (Tea valuta naturalezza)
- DEV: integration con `unlim-tts` Edge Function
- File: `giorni/PDR_GIORNO_37_MAR_27MAG.md`

### Mer 28/05 — Whisper Turbo Cloudflare

- DEV: signup Cloudflare Workers AI (free tier 10K/day)
- DEV: API wrapper STT (audio → text)
- TESTER: 50 voice sample test (Italian children speech)
- File: `giorni/PDR_GIORNO_38_MER_28MAG.md`

### Gio 29/05 — openWakeWord browser

- DEV: install openWakeWord (custom train "Ehi UNLIM")
- DEV: WebAudio integration browser
- TESTER: false positive rate test (target <5% in 1h normal speech)
- File: `giorni/PDR_GIORNO_39_GIO_29MAG.md`

### Ven 30/05 — Apostrophe bug + 36 command E2E

- DEV: fix apostrophe TTS bug (Italian "l'errore" preservato)
- TESTER: PTC use case 8 — 36 voice command E2E parallel
- Tea: PR esperimenti Vol 3 cap 6-7 (auto-merge)
- File: `giorni/PDR_GIORNO_40_VEN_30MAG.md`

### Sab 31/05 — OpenClaw Telegram layer iniziato

- ARCHITECT: blueprint OpenClaw layer docente (Telegram bot)
- DEV: setup OpenClaw stub (NodeJS, Telegram BotFather token)
- AUDITOR: voice premium live test (record session 30 min usage normale)
- File: `giorni/PDR_GIORNO_41_SAB_31MAG.md`

### Dom 01/06 — Handoff sett 6

- Handoff: `docs/handoff/2026-06-01-end-sett6.md`
- Score 8.3 verify
- File: `giorni/PDR_GIORNO_42_DOM_01GIU.md`

---

## 3. Costi sett 6

| Voce | Costo |
|------|-------|
| Voxtral 4B Hetzner GPU (shared CPU sett 6) | €0 |
| Cloudflare Workers AI Whisper (free tier) | €0 |
| Together AI usage | ~€20 |
| Hetzner CX31 | €8.21 |
| RunPod testing | ~€5 |
| **TOTALE settimana 6** | **~€33** |

---

## 4. Definition of Done sett 6

- [x] Voxtral TTS Hetzner deployed
- [x] Whisper Turbo CF integration
- [x] openWakeWord browser custom
- [x] 36 voice command E2E PASS
- [x] Voice cloning Andrea OK
- [x] Apostrophe bug fix
- [x] Score ≥8.3
- [x] OpenClaw layer wireframe

---

## 5. Self-critica

- Voxtral self-host primo deploy: 1 giorno realistico tight, può slittare 2-3 giorni.
- Voice cloning quality variabile: backup plan = Edge TTS Microsoft (già attivo VPS).
- 36 command E2E test = lungo. PTC parallel essential.

**Forza ELAB. Sett 6 inizia lun 26/05.**
