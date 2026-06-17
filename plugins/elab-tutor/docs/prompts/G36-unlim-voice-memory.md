# G36 — UNLIM VOICE + SESSION MEMORY

**Sprint F** — Sesta sessione (post G35 Report PDF + Grafici)
**Deadline PNRR**: 30/06/2026 (82 giorni)
**Riferimento piano**: `docs/prompts/SPRINT-F-MASTER-PLAN.md`

---

## CONTESTO RAPIDO
- G35: ReportTab con 3 grafici recharts (line, bar, pie), 4 KPI cards, PDF export via window.print()
- Score composito: 8.9/10 (target Sprint F: ≥ 9.0/10)
- 956/956 unit test, 20/20 E2E test
- UNLIM è il collo di bottiglia: 7/10 — serve portarlo a 8.5/10
- Dalla visione di Andrea (audio 25/03): "controllo VOCALE", "Galileo = assistente INVISIBILE"

---

## IMPERATIVO ASSOLUTO
ZERO DEMO. ZERO DATI FINTI. ZERO MOCK.
Il voice input deve funzionare con Web Speech API reale. Se il browser non supporta STT, fallback testuale elegante.

---

## SKILL DA USARE (SE DISPONIBILI)

| Fase | Skill | Perché | Fallback manuale |
|------|-------|--------|------------------|
| INIZIO | `/elab-quality-gate` | Baseline pre-session | `npm run build && npx vitest run && npm run test:e2e` |
| RESEARCH | `/ricerca-tecnica` | Web Speech API, TTS italiano, Whisper WASM | Web search manuale |
| FINE | `/elab-quality-gate` | Score card post | Build + test + E2E |

---

## TASK

### 1. Quality Gate Pre-Session (10min)
```
/elab-quality-gate pre
```
Verificare: build, 956+ unit test, 20/20 E2E

### 2. Ricerca Speech API (30min)

Valutare:
- **Web Speech API** (SpeechRecognition) — supporto Chrome/Edge, gratis, no server
- **Web Speech Synthesis** (SpeechSynthesis) — voci italiane disponibili?
- **Whisper WASM** — fallback offline? Bundle size?

Criteri: supporto browser ≥ Chrome 90, italiano, latenza < 2s, GDPR (nessun dato a Google?).

### 3. STT — Speech-to-Text Input (1h)

1. **Bottone microfono** nell'input bar di UNLIM (icona 🎙️ → pulsante)
2. **SpeechRecognition API**: lingua `it-IT`, continuous: false, interimResults: true
3. **Indicatore visuale**: pulsante rosso animato + "Ascoltando..." durante recording
4. **Fallback**: se `webkitSpeechRecognition` non disponibile, bottone nascosto (solo input testuale)
5. **Auto-submit**: dopo riconoscimento completato, inserisce testo nell'input e invia automaticamente
6. **Error handling**: microfono negato → toast "Permetti l'accesso al microfono"

### 4. TTS — Text-to-Speech Output (45min)

1. **SpeechSynthesis** per leggere risposte UNLIM ad alta voce
2. **Voce italiana**: selezionare automaticamente voce `it-IT` (preferire voci femminili/giovani se disponibili)
3. **Bottone altoparlante** accanto a ogni risposta UNLIM (toggle on/off)
4. **Rate/pitch**: rate 1.0, pitch 1.1 (leggermente più giovane)
5. **Auto-read**: opzione toggle globale "Leggi risposte" (default: off)
6. **Stop**: cliccando durante lettura, interrompe

### 5. Session Memory (1h)

1. **Contesto sessione**: salvare in studentService le ultime 5 interazioni UNLIM per userId
2. **Struttura**: `{ timestamp, domanda, risposta, experimentId, concettoId }`
3. **Recall**: quando UNLIM genera risposta, includere nel prompt le ultime interazioni come contesto
4. **Adaptive**: se lo studente ha chiesto la stessa cosa 2 volte, UNLIM lo nota e spiega diversamente
5. **Persistence**: via studentService localStorage (con sync server quando disponibile)

### 6. Quality Gate Post-Session (15min)
```
/elab-quality-gate post
```

---

## CHAIN OF VERIFICATION — 3 PASSAGGI

### CoV 1: POST-TASK (dopo ogni step)
- `npm run build` — DEVE passare
- `npx vitest run` — 956+ test, 0 fail
- `npm run test:e2e` — 20 test, 0 fail

### CoV 2: PRE-MERGE
- STT funziona in Chrome con microfono reale
- TTS legge in italiano correttamente
- Memory persiste tra page reload
- Bundle size incremento < 50KB (no Whisper WASM nel bundle principale)

### CoV 3: POST-SESSION
1. Bottone microfono funzionante
2. TTS legge risposte in italiano
3. Memoria sessioni cross-reload
4. Fallback elegante su browser senza Speech API
5. Handoff aggiornato
6. Prompt G37 scritto

---

## REGOLE
- ZERO DEMO, ZERO DATI FINTI, ZERO MOCK
- ZERO REGRESSIONI: build + vitest + E2E dopo OGNI modifica
- Non toccare engine/ — MAI
- Budget ≤ €50/mese
- 20 E2E test devono continuare a passare
- Palette: Navy #1E4D8C, Lime #4A7A25, Vol2 #E8941C, Vol3 #E54B3D
- GDPR: Web Speech API invia audio a Google — documentare nel DPIA

---

## DELIVERABLE ATTESI G36

| # | Deliverable | Criterio di accettazione |
|---|-------------|--------------------------|
| 1 | STT input | Bottone microfono, riconoscimento italiano |
| 2 | TTS output | Risposte lette ad alta voce in italiano |
| 3 | Session memory | Ultime 5 interazioni salvate e richiamate |
| 4 | Fallback graceful | Browser senza STT → solo input testuale |
| 5 | Score card G36 | UNLIM ≥ 8/10, composito ≥ 9.0/10 |

---

## SCORE TARGET

| Area | G35 | Target G36 | Come |
|------|-----|-----------|------|
| Build/Test | 10/10 | **10/10** | Mantenere |
| Simulatore | 8.5/10 | **8.5/10** | Mantenere |
| Teacher Dashboard | 9/10 | **9/10** | Mantenere |
| UNLIM | 7/10 | **8.5/10** | +voice +memory |
| GDPR | 8.5/10 | **8.5/10** | Mantenere (documentare Speech API) |
| **COMPOSITO** | **8.9/10** | **9.0/10** | UNLIM boost |
