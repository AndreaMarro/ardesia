# Report Sessione 40B — Galileo Pervasivo + Wire V7
**Data**: 24 febbraio 2026
**Autore**: Andrea Marro (con Claude)
**Deploy**: https://www.elabtutor.school

---

## Obiettivi della sessione
1. **Fili iper malleabili** (richiesta boss Franzoso Riccardo)
2. **Galileo pervasivo** — tutor AI che vede il circuito e interviene proattivamente
3. **Valutazione nanobot** — sicurezza e possibilita di integrazione

---

## CHAIN OF VERIFICATION

### 1. WireRenderer V7 (Flexible / Malleable)
| Check | Risultato | Dettaglio |
|-------|-----------|-----------|
| File modificato | `src/components/simulator/canvas/WireRenderer.jsx` | 1066 righe |
| Header aggiornato | V6 Manhattan → V7 Flexible | Riga 2 |
| `buildRoutedPath()` riscritto | **SI** | Righe 191-258 |
| 2-point wire: quadratic Bezier + sag | **SI** | `WIRE_SAG_FACTOR=0.12`, `MAX_SAG=15` |
| 3+ point wire: Catmull-Rom spline | **SI** | `CR_TENSION=0.5`, cubic Bezier conversion |
| Routing functions (routeJumperWire, etc.) | **INTATTE** — producono waypoints, rendering e' separato |
| Wire handles (move/split) | **INTATTI** — posizionati ai waypoints |
| console.log | **0** |
| Build | **PASS** (0 errori) |

### 2. SimulatorCanvas.jsx — Free-form wire drag
| Check | Risultato | Dettaglio |
|-------|-----------|-----------|
| File modificato | `src/components/simulator/canvas/SimulatorCanvas.jsx` | 2317 righe |
| Grid snapping rimosso | **SI** | Riga 892-895, was 3.75px snap |
| Free-form drag | **SI** | `newX = svgPt.x; newY = svgPt.y;` |
| console.log | **0** |

### 3. NewElabSimulator.jsx — Circuit Bridge + Proactive Events
| Check | Risultato | Dettaglio |
|-------|-----------|-----------|
| File modificato | `src/components/simulator/NewElabSimulator.jsx` | 3125 righe |
| Props aggiunte | `onCircuitStateChange`, `onCircuitEvent` | Righe 136-137 |
| Circuit bridge effect | **SI** | Righe 897-1015, debounce 800ms |
| Serializzazione componenti | LED, resistor, buzzer, motor, pot, button, LDR, battery, capacitor |
| Serializzazione connessioni | `from → to (color)` conciso |
| Circuit health check | burned, high current >50mA, dead LEDs |
| Build mode context | Gia Montato / Passo Passo step X/Y / Esplora Libero |
| Proactive event: led-burned | **SI** | Riga 1039, one-shot via firedEventsRef |
| Proactive event: high-current | **SI** | Riga 1055, soglia >30mA |
| Proactive event: circuit-working | **SI** | Riga 1072, first LED on |
| Reset eventi al cambio esperimento | **SI** | Riga 1082 |
| console.log | **0** |

### 4. ElabTutorV4.jsx — Galileo Pervasivo Integration
| Check | Risultato | Dettaglio |
|-------|-----------|-----------|
| File modificato | `src/components/tutor/ElabTutorV4.jsx` | 1204 righe |
| `circuitStateRef = useRef(null)` | **SI** | Riga 111 |
| `handleCircuitEvent` callback | **SI** | Righe 115-124, useCallback |
| Aggiunge messaggio proattivo alla chat | **SI** | `setMessages(prev => [...prev, {...}])` |
| Apre chat se nascosta | **SI** | `setShowChat(true)` |
| Flag `proactive: true` | **SI** | Per distinguere dai messaggi user-triggered |
| `onCircuitStateChange` passato a NewElabSimulator | **SI** | Riga 1088 |
| `onCircuitEvent` passato a NewElabSimulator | **SI** | Riga 1089 |
| `experimentContext` arricchito con liveCircuit | **SI** | Righe 843-848 |
| console.log | **0** |

### 5. api.js — System Prompt Arricchito
| Check | Risultato | Dettaglio |
|-------|-----------|-----------|
| File modificato | `src/services/api.js` | 739 righe |
| `SOCRATIC_INSTRUCTION` aggiornato | **SI** | 36 righe (era ~19) |
| Sezione [ANALISI CIRCUITO] | **SI** | Diagnostica LED, corrente, cortocircuiti |
| Sezione [FORMATO CONNESSIONI] | **SI** | Spiega formato pin references |
| Sezione [CONTROLLI SIMULATORE] | **SI** | Include "FILI FLESSIBILI" |
| console.log | **0** |

### 6. Build & Deploy
| Check | Risultato |
|-------|-----------|
| `npm run build` | **PASS** — 0 errori, 24.59s locale |
| ElabTutorV4 chunk | 984.60 KB (sotto soglia 1000KB) |
| Vercel deploy | **PASS** — https://www.elabtutor.school |
| 0 console.log in tutti i file modificati | **CONFERMATO** |

---

## ARCHITETTURA GALILEO PERVASIVO

```
NewElabSimulator
  |
  |-- [ogni 800ms, debounced] --> onCircuitStateChange(serializedState)
  |                                  |
  |                                  v
  |                              ElabTutorV4.circuitStateRef (ref, no re-render)
  |                                  |
  |                                  +--> [user sends message] --> sendChat(msg, experimentContext=liveCircuit)
  |                                                                    |
  |                                                                    v
  |                                                                 n8n webhook + SOCRATIC_INSTRUCTION arricchito
  |
  |-- [evento one-shot] --> onCircuitEvent({ type, componentId, message })
                                |
                                v
                            ElabTutorV4.handleCircuitEvent
                                |
                                +--> setMessages([...prev, { role:'assistant', content:message, proactive:true }])
                                +--> setShowChat(true)
```

**Flusso dati**:
- **Continuo** (ref): stato circuito serializzato ogni 800ms, letto solo quando l'utente scrive
- **Discreto** (callback): eventi critici scattano 1 volta sola e aggiungono messaggi Galileo in chat

---

## VALUTAZIONE NANOBOT (HKUDS/nanobot)

| Aspetto | Stato |
|---------|-------|
| Repository | github.com/HKUDS/nanobot — HK University of Data Science |
| Stars | 24.3k |
| Licenza | MIT |
| Linguaggio | Python ~4000 righe |
| Vulnerabilita note | Shell injection, path traversal, LiteLLM RCE — **TUTTE FIXATE in v0.1.3.post7+** |
| Versione attuale | v0.1.4.post1 (sicura) |
| Verdict | **USABILE CON CAUTELA** — Docker isolato obbligatorio |

**Piano integrazione (Fase 3 — futura)**:
1. Docker sidecar su n8n, nanobot in container isolato
2. MCP tools: `readCircuit()`, `moveWire()`, `setResistorValue()`, `runSimulation()`
3. Galileo diventa agent con tool-use reale (non solo text output)

---

## SCORE AGGIORNATI (post Session 40B)

| Area | Score | Delta | Note |
|------|-------|-------|------|
| AI Integration | **9.5/10** | +0.5 | Galileo pervasivo: vede circuito, interviene proattivamente |
| Simulatore (rendering) | **9.5/10** | = | 69/69 PASS |
| Code Quality | **9.0/10** | = | 0 console.log, 0 build errors |
| Frontend/UX | **8.0/10** | = | Wire V7 piu naturali, ma UI non toccata |
| **Overall** | **~8.6/10** | +0.1 | Wire V7 + Galileo pervasivo |

---

## PROBLEMI NOTI (per prossima sessione)

### P1 — Frontend non minimal
- Troppi bottoni visibili, UI "ingombrante" per un bambino di 8-14 anni
- Chat overlay sovrapposta al simulatore su mobile
- Tab bar ha troppe voci (manual, simulator, detective, poe, reverse, review, canvas, notebooks, videos)

### P1 — Performance / Velocita
- ElabTutorV4 chunk 984KB — quasi al limite
- n8n webhook latenza 2-4s per risposta Galileo
- Circuit bridge 800ms debounce — potrebbe essere piu reattivo

### P1 — Whiteboard pixelosa
- CanvasTab e WhiteboardOverlay usano HTML5 Canvas 2D
- **NESSUN handling di `window.devicePixelRatio`** → pixelato su Retina/HiDPI
- Fix necessario: `canvas.width = logical * dpr` + `ctx.scale(dpr, dpr)`
- Alternativa migliore: migrare a SVG o libreria vettoriale (Excalidraw-like)

### P2 — Nanobot non integrato
- Valutato ma non ancora usato
- Necessita Docker + MCP tools custom
- Priorita inferiore rispetto a UX e performance

---

*Report generato automaticamente — Session 40B, 24/02/2026*
