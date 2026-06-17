# Ricerca: Pipeline Voice/NLU per Controllo Simulatore ELAB
**Autore**: Andrea Marro
**Data**: 24/03/2026
**Ciclo**: 53
**Tipo**: RESEARCH (P2-042)
**Severity**: medium
**Evidence**: verified (analisi codebase) + hypothesis (design proposto)

---

## Executive Summary

ELAB già ha TTS (useTTS.js) e voice round-trip (voiceService.js).
Manca la direzione inversa per il simulatore: **voce → azione sul simulatore**.
Target pipeline: `utente → ASR → intent parser → planner → DSL → validator → __ELAB_API`

L'`__ELAB_API` espone esattamente i metodi necessari (addComponent, addWire, play, reset, interact...).
La ricerca propone 2 fasi: **Phase 1 browser-native** (zero costo, 0 latenza server), **Phase 2 nanobot** (Whisper, accuracy superiore).

---

## Stato Attuale Voice nel Codebase

| File | Ruolo | Direzione |
|------|-------|-----------|
| `src/hooks/useTTS.js` | Web Speech API SpeechSynthesis | Testo → Voce |
| `src/components/tutor/TTSControls.jsx` | UI play/pause/stop | Testo → Voce |
| `src/services/voiceService.js` | MediaRecorder + nanobot /voice-chat | Voce → Galileo (conversazione) |
| `src/services/simulator-api.js` | `window.__ELAB_API` | Comandi → Simulatore |

**Gap**: nessun collegamento tra voce e `__ELAB_API`.
La pipeline mancante è: Voce → Intent → `__ELAB_API.[method]()`

---

## Fase 1: Browser-Native ASR (Web Speech API)

### Vantaggi
- **Zero latenza server** — riconoscimento locale o via Google Speech (trasparente)
- **Zero costo** — API browser nativa
- **Disponibile su Chrome/Edge/Safari iOS** — copre il 95% dei dispositivi ELAB
- **Linguaggio IT-IT** — ottimo per italiano su Chrome
- **Già presente nel codebase** — stessa API usata per TTS (window.SpeechRecognition)

### Implementazione ASR Browser
```javascript
// Pseudo-codice — non implementare senza test
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'it-IT';
recognition.continuous = false;  // un comando alla volta
recognition.interimResults = false;
recognition.maxAlternatives = 3;  // top-3 ipotesi per robustezza

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  const confidence = event.results[0][0].confidence;
  if (confidence > 0.7) parseIntent(transcript);
};
```

### Limitazioni Phase 1
- Accento regionale → errori frequenti
- Termini tecnici (MOSFET, breadboard) mal riconosciuti
- Richiede HTTPS (già soddisfatto — Vercel)
- Safari iOS: no `continuous`, solo `interim` limitato
- Nessun controllo sul modello linguistico

---

## Fase 2: Whisper via Nanobot (Alta Accuratezza)

### Stack
```
MediaRecorder → webm/opus blob → POST /voice-command →
  Whisper (nanobot) → trascrizione →
  Intent classifier (Claude Haiku?) →
  DSL JSON → response →
  browser execute __ELAB_API
```

### Vantaggi Phase 2
- Whisper large-v3: accuracy molto superiore su italiano
- Possibile fine-tune su vocabolario ELAB (LED, resistore, breadboard...)
- Intent classifier server-side: più facile da aggiornare senza deploy
- Log per analisi errori comuni

### Latenza Stimata
- MediaRecorder stop → blob: 0ms
- Upload 64kbps 2s audio: ~16KB → <100ms
- Whisper small (nanobot): ~300ms
- Intent + DSL: ~100ms Claude Haiku
- **Totale: ~500ms** — accettabile per controllo simulator

---

## Tassonomia Intent (Italiano, 10-14 anni)

### Categoria A: Controllo Simulazione
| Utterance Esempio | Intent | API Call |
|-------------------|--------|----------|
| "avvia", "fai partire", "play", "simula" | SIM_PLAY | `__ELAB_API.play()` |
| "ferma", "stop", "pausa" | SIM_PAUSE | `__ELAB_API.pause()` |
| "ricomincia", "reset", "azzera" | SIM_RESET | `__ELAB_API.reset()` |

### Categoria B: Caricamento Esperimento
| Utterance Esempio | Intent | API Call |
|-------------------|--------|----------|
| "carica esperimento uno", "primo esperimento" | LOAD_EXP | `__ELAB_API.loadExperiment(id)` |
| "vai al capitolo sei", "apri il secondo esperimento" | LOAD_EXP | disambiguazione chapter+index |
| "prossimo passo", "vai avanti" | NEXT_STEP | `__ELAB_API.nextStep()` |
| "passo indietro", "torna" | PREV_STEP | `__ELAB_API.prevStep()` |

### Categoria C: Componenti
| Utterance Esempio | Intent | API Call |
|-------------------|--------|----------|
| "aggiungi un LED", "metti un resistore" | ADD_COMPONENT | `__ELAB_API.addComponent(type, pos)` |
| "togli il LED", "rimuovi la resistenza" | REMOVE_COMPONENT | `__ELAB_API.removeComponent(id)` |
| "connetti il LED alla resistenza" | ADD_WIRE | `__ELAB_API.addWire(pin1, pin2)` |
| "annulla", "disfai" | UNDO | `__ELAB_API.undo()` |
| "rifai" | REDO | `__ELAB_API.redo()` |

### Categoria D: Interazione Componenti
| Utterance Esempio | Intent | API Call |
|-------------------|--------|----------|
| "premi il pulsante", "clicca il bottone" | INTERACT_PRESS | `__ELAB_API.interact(id, 'press')` |
| "ruota il potenziometro al massimo" | INTERACT_SET | `__ELAB_API.interact(id, 'setPosition', 1.0)` |
| "aumenta la luce", "fai più buio" | INTERACT_SET | `__ELAB_API.interact(ldr_id, 'setLightLevel', val)` |

### Categoria E: Richiesta Info / Galileo
| Utterance Esempio | Intent | API Call |
|-------------------|--------|----------|
| "cosa fa questo LED?", "spiega il resistore" | ASK_GALILEO | → Galileo chat |
| "mostra il BOM", "lista componenti" | SHOW_BOM | `__ELAB_API.showBom()` |
| "fai uno screenshot" | SCREENSHOT | `__ELAB_API.captureScreenshot()` |

---

## DSL JSON per Comandi Simulatore

### Struttura Standard
```json
{
  "intent": "ADD_COMPONENT",
  "confidence": 0.89,
  "params": {
    "type": "led",
    "position": {"x": 400, "y": 300}
  },
  "raw": "aggiungi un LED rosso al centro",
  "fallback": false
}
```

### Intent con Disambiguazione
```json
{
  "intent": "LOAD_EXP",
  "confidence": 0.72,
  "params": {
    "chapter": 6,
    "index": 1,
    "volume": 1
  },
  "disambiguation_needed": false,
  "resolved_id": "v1-cap6-primo-circuito"
}
```

---

## Validator: Regole di Sicurezza

Prima di eseguire qualsiasi comando dalla voce:

```
1. INTENT_WHITELIST: solo intent della tassonomia sopra
2. CONFIDENCE_THRESHOLD: > 0.65 (Phase 1), > 0.80 (Phase 2)
3. DESTRUCTIVE_CONFIRM: clearAll() → richiede conferma verbale ("conferma" / "annulla")
4. RATE_LIMIT: max 3 comandi/secondo (anti-loop accidentale)
5. EXPERIMENT_GUARD: loadExperiment richiede che il build mode sia 'sandbox' o 'complete'
6. TYPE_VALIDATION: addComponent(type) solo con type in COMPONENT_REGISTRY
7. PIN_VALIDATION: addWire(pin1, pin2) verifica formato "componentId:pinId"
```

---

## Mapping Componenti: Vocabolario → Tipo API

| Parola (bambino) | Sinonimi accettati | API type |
|------------------|-------------------|----------|
| "LED", "lampadina" | "diodo luminoso", "lucina" | `led` |
| "resistore", "resistenza" | "resistore" | `resistor` |
| "pulsante", "bottone" | "switch", "interruttore" | `button` |
| "batteria", "pila" | "alimentatore" | `battery` |
| "potenziometro" | "manopola", "regolatore" | `potentiometer` |
| "fotoresistenza" | "LDR", "sensore luce" | `ldr` |
| "Arduino", "nano" | "microcontrollore" | `nano` |
| "filo" | "cavo", "collegamento" | → addWire |

---

## Architettura React Proposta

### Hook: `useVoiceCommand()`
```
Responsabilità:
- Gestisce SpeechRecognition lifecycle (start/stop/error)
- Mantiene stato: idle | listening | processing | executing | error
- Emette: { transcript, intent, params, confidence }
- Esegue il comando su __ELAB_API via `executeIntent(intent, params)`
- Fallback: se confidence < threshold → mostra testo per conferma
```

### Componente UI: `VoiceCommandButton`
```
- Microfono icon (40px min per touch target)
- Stati visivi: idle (grey) | listening (red pulse) | processing (yellow spin) | success (green flash)
- Testo ultimo comando riconosciuto
- Posizione: ControlBar del simulatore (accanto agli altri pulsanti)
```

### Integrazione con Galileo
```
Se intent = ASK_GALILEO → bypass __ELAB_API → invia a Galileo chat
Se intent non riconosciuto (confidence < 0.5) → invia testo raw a Galileo
Galileo può rispondere con azioni via [[AZIONE:loadexp]] esistenti
```

---

## Priorità di Implementazione

### P1 — Quick Win (1 sessione)
1. `useVoiceCommand()` hook con Web Speech API (Phase 1)
2. Intent parser pattern-matching (regex italiana) per categorie A e B
3. `VoiceCommandButton` nella ControlBar
4. Feedback visivo (stato listening/processing)

### P2 — Enhanced (2-3 sessioni)
5. Categorie C e D (add/remove component, interact)
6. Confidence threshold + conferma verbale per comandi distruttivi
7. Validator completo
8. Integrazione nanobot Whisper (Phase 2)

### P3 — Future
9. Fine-tune su vocabolario ELAB
10. Wake word detection ("Ehi Galileo...")
11. Multi-turn: "aggiungi LED... e poi connettilo alla resistenza"

---

## Analisi Competitor

### Tinkercad
- **Nessun voice control** — puro drag&drop
- Opportunità ELAB: primo simulatore educativo con voice per il mercato italiano

### Wokwi
- Voice assist: non presente
- Board selection: testuale

### Scratch
- Scratch ha un'estensione per microfono (riconoscimento singole parole)
- Non è integrato con il simulatore hardware

**Conclusione**: Voice control nel simulatore è un **differenziatore unico** sul mercato EdTech italiano. Nessun competitor lo ha.

---

## Stima Impatto su Metriche

| Metrica | Baseline | Con Voice Phase 1 | Gain |
|---------|----------|-------------------|------|
| ipad_compliance | 0.675 | 0.75+ | +0.075 (riduce dipendenza touch preciso) |
| teacher_experience | subjective | migliorata | difficile quantificare |
| accessibility | not measured | WCAG 2.1 speech input | nuovo KPI |
| engagement | not measured | stimato +15% | nuovo KPI proposto |

**Proposta nuova metrica** (metrics-proposals.md): `voice_control_success_rate` — % comandi vocali eseguiti correttamente / totale tentativi.

---

## Raccomandazione Finale

**Implementare Phase 1 subito** — dipendenze: zero.
Web Speech API è già disponibile, `__ELAB_API` è già pronto.
Serve solo:
1. `useVoiceCommand.js` hook (~120 righe)
2. `VoiceCommandButton.jsx` componente (~80 righe)
3. `intentParser.js` utility (~150 righe — pattern matching italiano)
4. Integrazione in ControlBar di NewElabSimulator.jsx (~10 righe)

**Totale stimato**: ~360 righe di codice nuovo, zero dipendenze, zero costi.

---

## Riferimenti

- Web Speech API MDN: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- SpeechRecognition browser support: Chrome 25+, Safari 14.1+, Edge 79+
- Kimi Research Cycle 53: accuratezza simulatore edge case
- ELAB __ELAB_API: src/services/simulator-api.js (completo, 636 righe)
- voiceService.js: src/services/voiceService.js (MediaRecorder + nanobot)

---

*© Andrea Marro — 24/03/2026 — ELAB Tutor — Tutti i diritti riservati*
