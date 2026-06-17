# GALILEO / UNLIM — Mappa Completa Capacità

> Ultimo aggiornamento: 27/03/2026 (post G4)
> Fonte: audit diretto del codice ElabTutorV4.jsx, api.js, UnlimWrapper.jsx, unlimMemory.js

---

## Architettura

```
UTENTE (docente/studente su LIM o tablet)
    │ testo (barra input) / voce (Web Speech API — non ancora implementata)
    ▼
UNLIM WRAPPER (React frontend)
    │ sendChat(message, images, options)
    ▼
FALLBACK CHAIN:
    1. Local Server (Brain VPS 72.60.129.50:11434 — galileo-brain-v13, Qwen3.5-2B)
    2. Nanobot Cloud (Render — DeepSeek + Groq racing text, Gemini vision)
    3. Backend Webhook (n8n Hostinger)
    4. Local Knowledge Base (offline fallback)
    ▼
RISPOSTA con [AZIONE:cmd:args] tags
    │ parsing regex in ElabTutorV4.jsx riga 1755+
    ▼
SIMULATORE (esecuzione azioni via window.__ELAB_API)
```

---

## 26+ Azioni sul Simulatore

Ogni azione è un tag `[AZIONE:comando:argomenti]` generato dall'AI nella risposta.
Parsato da ElabTutorV4.jsx, eseguito via `window.__ELAB_API`.

### Controllo Simulazione
| Comando | Cosa fa | Esempio |
|---------|---------|---------|
| `play` | Avvia simulazione DC/AVR | `[AZIONE:play]` |
| `pause` | Ferma simulazione | `[AZIONE:pause]` |
| `reset` | Reset stato simulazione | `[AZIONE:reset]` |

### Navigazione
| Comando | Cosa fa | Esempio |
|---------|---------|---------|
| `loadexp` | Carica esperimento (componenti + wires + layout) | `[AZIONE:loadexp:v1-cap6-esp1]` |
| `opentab` | Naviga a tab (simulatore/manuale/video/lavagna/detective/poe/reverse/review) | `[AZIONE:opentab:simulatore]` |
| `openvolume` | Apre volume PDF a pagina specifica | `[AZIONE:openvolume:1:33]` |

### Componenti
| Comando | Cosa fa | Esempio |
|---------|---------|---------|
| `addcomponent` | Aggiunge componente al canvas (tipo + x,y) | `[AZIONE:addcomponent:resistor:200:150]` |
| `removecomponent` | Rimuove componente per ID | `[AZIONE:removecomponent:r1]` |
| `movecomponent` | Sposta componente a coordinate | `[AZIONE:movecomponent:led1:300:200]` |
| `highlight` | Glow 4s su componenti (comma-separated) | `[AZIONE:highlight:led1,r1]` |
| `highlightpin` | Glow su pin specifici | `[AZIONE:highlightpin:bb1:a5,bb1:f9]` |

### Fili (Wires)
| Comando | Cosa fa | Esempio |
|---------|---------|---------|
| `addwire` | Collega due pin | `[AZIONE:addwire:bat1:positive:bb1:bus-top-plus-1]` |
| `removewire` | Rimuove filo per indice | `[AZIONE:removewire:3]` |
| `clearall` | Pulisci canvas completo | `[AZIONE:clearall]` |

### Interazione Componenti
| Comando | Cosa fa | Esempio |
|---------|---------|---------|
| `interact` | Premi pulsante, gira pot, muovi slider | `[AZIONE:interact:btn1:press]` |
| `setvalue` | Cambia valore (resistance, position, lightLevel) | `[AZIONE:setvalue:r1:resistance:470]` |
| `measure` | Leggi tensione/corrente da componente | `[AZIONE:measure:led1]` |
| `diagnose` | Diagnosi automatica circuito completo | `[AZIONE:diagnose]` |

### Editor Codice
| Comando | Cosa fa | Esempio |
|---------|---------|---------|
| `compile` | Compila codice Arduino corrente | `[AZIONE:compile]` |
| `openeditor` | Mostra editor codice | `[AZIONE:openeditor]` |
| `closeeditor` | Nascondi editor | `[AZIONE:closeeditor]` |
| `switcheditor` | Cambia modo (scratch/arduino) | `[AZIONE:switcheditor:scratch]` |
| `loadblocks` | Carica workspace Scratch XML | `[AZIONE:loadblocks:...]` |

### Altro
| Comando | Cosa fa | Esempio |
|---------|---------|---------|
| `quiz` | Lancia quiz contestuale | `[AZIONE:quiz:v1-cap6-esp1]` |
| `youtube` | Cerca video YouTube | `[AZIONE:youtube:come funziona LED]` |
| `createnotebook` | Crea taccuino appunti | `[AZIONE:createnotebook:Lezione LED]` |
| `undo` / `redo` | Annulla/ripeti ultima operazione | `[AZIONE:undo]` |

### Risoluzione ID Intelligente
L'executor risolve nomi naturali in ID componenti:
- "il LED" → trova l'unico LED nel circuito
- "la resistenza" → trova il resistore
- "il pulsante" → trova il push-button
- Alias tipo: `TYPE_ALIASES` mappa nomi italiani/inglesi ai tipi corretti

---

## Capacità AI (Backend Nanobot)

### Testo
| Capacità | Provider | Stato |
|----------|----------|-------|
| Risponde in italiano a domande di elettronica | DeepSeek + Groq (racing) | ✅ Funziona |
| Genera azioni `[AZIONE:...]` nel testo | System prompt nanobot.yml | ✅ Funziona |
| Multi-component intent ("costruisci LED + resistenza") | Parsing intelligente | ✅ Funziona |
| Safety filter (blocca contenuto pericoloso/volgare) | Nanobot filter | ✅ Funziona |
| Linguaggio 10-14 anni con analogie quotidiane | System prompt | ✅ Funziona |
| Non rivela mai l'implementazione di ELAB Tutor | System prompt | ✅ Funziona |

### Visione
| Capacità | Provider | Stato |
|----------|----------|-------|
| Analisi screenshot circuito | Gemini vision specialist | ✅ Funziona |
| Foto reale del kit → diagnosi | Gemini + circuit specialist | ✅ Funziona |
| Auto-screenshot del simulatore | Canvas → base64 → Gemini | ✅ Funziona |

### Diagnostica
| Capacità | Endpoint | Stato |
|----------|----------|-------|
| Diagnosi proattiva circuito | `/diagnose` | ✅ Funziona |
| Hint progressivi per esperimento | `/hints` | ✅ Funziona |
| Preload contesto esperimento | `/preload` | ✅ Funziona |

### Contesto
| Capacità | Come | Stato |
|----------|------|-------|
| Sa quale esperimento è aperto | `experimentId` in ogni richiesta | ✅ |
| Sa lo stato del circuito | `circuitState` serializzato | ✅ |
| Sa il contesto del simulatore | `simulatorContext` oggetto | ✅ |
| Curriculum/lesson path come contesto | `experimentContext` stringa | ✅ |

---

## Memoria Studente (Frontend)

File: `src/services/unlimMemory.js`
Storage: `localStorage` (chiave `elab_unlim_memory`)

| Capacità | Dettaglio |
|----------|-----------|
| Esperimenti completati | Per ID, con risultato (success/partial/skipped) e timestamp |
| Tentativi per esperimento | Contatore incrementale |
| Risultati quiz | Per esperimento, con score |
| Errori comuni | Categoria + dettaglio, max 50 |
| Sessioni salvate | Ultime 10, con riassunto |
| Profilo globale | `window.__unlimMemory` accessibile da `buildTutorContext()` |

### Limiti attuali
- **Solo localStorage** — ogni device è isolato, non c'è sync backend
- **Non condiviso con Teacher Dashboard** — il docente non vede i progressi
- **Non usato nei lesson paths** — UNLIM non adatta i percorsi in base alla storia

---

## Frontend UNLIM (6 Componenti React + 1 CSS)

> Aggiornamento: 28/03/2026 (post G17)

| Componente | Righe | Cosa fa |
|-----------|-------|---------|
| `UnlimWrapper.jsx` | ~420 | Wrappa ElabTutorV4, ErrorBoundary, auto-rileva esperimento, sendChat, welcome contestuale, report, sessioni |
| `UnlimMascot.jsx` | ~125 | Mascotte REALE (robot logo ELAB PNG), stati idle/active/speaking, long-press mute con feedback visivo |
| `UnlimOverlay.jsx` | ~310 | Messaggi contestuali POSIZIONATI accanto ai componenti, frecce SVG, auto-dismiss, WCAG AA |
| `UnlimInputBar.jsx` | ~180 | Barra input testo + mic + report + invio, touch-aware (no auto-focus su LIM) |
| `UnlimModeSwitch.jsx` | ~60 | Toggle UNLIM/Classic mode, persist in localStorage |
| `UnlimReport.jsx` | ~450 | FUMETTO ELAB: scene narrative, foto inline, screenshot, stampa PDF, fallback download |
| `unlim-mascot.css` | ~50 | Keyframes mascotte: breathe, speak-glow, speak-bounce, long-press feedback |

### Hooks UNLIM
| File | Righe | Cosa fa |
|------|-------|---------|
| `useSessionTracker.js` | ~240 | Sessioni strutturate: messaggi, azioni, errori. localStorage FIFO 20 sessioni. |
| `useTTS.js` | ~200 | Text-to-speech integrato in UNLIM. Voce italiana, mute toggle, safety timeout. |
| `useSTT.js` | ~120 | Speech-to-text. SpeechRecognition API, continuous mode, interim results. |

### Servizi UNLIM
| File | Righe | Cosa fa |
|------|-------|---------|
| `classProfile.js` | ~210 | Profilo classe da sessioni: concetti, errori, next suggested. Cache TTL 2s. |
| `unlimMemory.js` | ~180 | Memoria studente: esperimenti, quiz, errori. Profilo globale window.__unlimMemory. |

### Lesson Path Panel
| File | Righe | Cosa fa |
|------|-------|---------|
| `LessonPathPanel.jsx` | ~850 | Percorso 5 fasi (PREPARA->CONCLUDI), progress bar, "Monta il circuito", analogie, errori comuni |
| `lesson-paths/index.js` | ~55 | Registry 62 JSON, getLessonPath(), hasLessonPath() |
| `lesson-paths/*.json` | ~170 ciascuno | 62 file JSON con 5 fasi, vocabolario, analogie, assessment |

---

## Stato Implementazione vs Visione (aggiornato G17)

### IMPLEMENTATO (ex "Cosa NON Esiste Ancora")
| Capacita' | Stato | Sessione |
|-----------|-------|----------|
| **Controllo vocale (STT)** | FUNZIONA — useSTT.js, continuous mode, it-IT | G14 |
| **TTS (text-to-speech)** | FUNZIONA — useTTS.js integrato in UNLIM, voce italiana, mute toggle | G14 |
| **Mascotte reale** | FUNZIONA — robot logo ELAB PNG, 3 animazioni CSS, long-press feedback | G13 |
| **Messaggi contestuali posizionati** | FUNZIONA — accanto ai componenti con frecce SVG | G13 |
| **PDF report fumetto** | FUNZIONA — fumetto narrativo con foto, screenshot, stampa A4 | G17 |
| **Sessioni salvate** | FUNZIONA — localStorage FIFO 20, contesto classe, welcome "Bentornati!" | G16 |
| **62 lesson paths** | FUNZIONA — 62/67 coperti (era 13 a G4) | G6 |
| **Error boundary** | FUNZIONA — UNLIM crash non uccide simulatore | G17 |

### DA FARE (gap rimanenti)
| Gap | Impatto | Priorita' |
|-----|---------|-----------|
| **5 lesson paths mancanti** | 62/67 coperti (93%) | P2 |
| **Struttura lezione adattiva** | I 5 step sono fissi per esperimento | P1 |
| **Annotazioni sulla breadboard** | Solo Annotation.jsx generico su canvas | P1 |
| Teacher Dashboard integrata con lesson paths | Docente non vede progressi | P1 |
| Memoria cross-device (backend sync) | Ogni device ricomincia da zero | P2 |
| Nanobot risposte < 60 parole | Risposte troppo lunghe per LIM | P1 |
| GDPR compliance documentata | Nessun DPIA | P1 |

---

## Numeri Reali (aggiornati G17 — 28/03/2026)

| Metrica | G4 | G17 | Delta |
|---------|-----|-----|-------|
| Azioni implementate | 26+ | 26+ | = |
| Lesson paths pronti | 13/67 (19%) | **62/67 (93%)** | +49 |
| Componenti React UNLIM | 5 | **6 + 1 CSS + 3 hooks + 2 servizi** | +7 |
| Build time | ~26s | **~32s** | +6s |
| Bundle ElabTutorV4 | 1,108 KB | **1,091 KB** | -17 KB |
| Console errors | 0 nuovi | **46 (6 log + 40 warn/error)** | +46 (debt) |
| UNLIM vision score | 3.5 | **7.8** | +4.3 |
| Composito insegnante | ~6.5 | **8.0** | +1.5 |
| Error boundaries | 1 | **2** | +1 |
| aria-label | ~80 | **103** | +23 |
| Bug critici aperti | 0 | **0** | = |
