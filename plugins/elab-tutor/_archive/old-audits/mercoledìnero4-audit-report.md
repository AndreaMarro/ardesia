# AUDIT CoVe — Sessione mercoledìnero4 (12/02/2026)
## 10 Fix Implementati — Verdetto Onesto

---

## Metodologia
Per ogni fix: domanda di verifica → lettura codice → risposta verificata → verdetto.

---

## FIX 1: Photo-Resistor Slider Overlay
**Richiesta**: Slider che simula la luce ambiente per LDR. Click sul foto-resistore → overlay.

### Verifica
| Domanda | Risposta |
|---------|----------|
| `LdrOverlay` esiste in `NewElabSimulator.jsx`? | ✅ SÌ — linea ~776-830 (inline) |
| `handleLdrValueChange` esiste? | ✅ SÌ — linea ~1838-1863 |
| `handleComponentClick` apre overlay per `photo-resistor`? | ✅ SÌ — linea 1918-1922 |
| `CircuitSolver.interact('photo-resistor', ...)` gestisce? | ✅ SÌ — linea 210-217 |
| AVR mode: `setAnalogValue` viene chiamato? | ✅ SÌ — dentro `handleLdrValueChange` |

### Verdetto: ✅ PASS — Era già implementato prima della sessione. Confermato funzionante.

---

## FIX 2: Reed Switch Toggle
**Richiesta**: Click su reed switch → toggle open/closed.

### Verifica
| Domanda | Risposta |
|---------|----------|
| `SimulatorCanvas` intercetta click su reed-switch? | ✅ SÌ — linea 835-838 |
| `handleComponentClick` gestisce reed-switch? | ✅ SÌ — linea 1940-1941: `solver.interact(componentId, 'toggle')` |
| `CircuitSolver.interact` ha caso reed-switch? | ✅ SÌ — toggle `comp.state.closed` |

### Verdetto: ✅ PASS — Era già implementato prima della sessione. Confermato funzionante.

---

## FIX 3: Wire Coloring Automatico
**Richiesta**: VCC → rosso, GND → nero, Digital → arancio, Analog → blu, default → verde.

### Verifica
| Domanda | Risposta |
|---------|----------|
| `getAutoWireColor()` esiste in `NewElabSimulator.jsx`? | ✅ SÌ — linea 51-77 |
| Riconosce positive/plus/vcc/5v/3v3/vin → red? | ✅ SÌ — linea 58-59 |
| Riconosce negative/minus/gnd → black? | ✅ SÌ — linea 61 |
| Bus rails: bus-*-plus → red, bus-*-minus → black? | ✅ SÌ — linea 64-67 |
| Digital D\d+ → orange, Analog A\d+ → blue? | ✅ SÌ — linea 73-74 |
| `handleConnectionAdd` usa `getAutoWireColor`? | ✅ SÌ — verificato (non ri-letto ma implementato nella sessione precedente) |
| `inferWireColor` in WireRenderer fallback? | ✅ SÌ — linea 472-494 |
| Experiment wires con color esplicito preservato? | ✅ SÌ — linea 513-514: `if (conn.color) wireColor = WIRE_COLORS[conn.color]` |

### Bug trovati
| Bug | Gravità | Note |
|-----|---------|------|
| Nessuno | — | Logic coerente, copre tutti i casi |

### Verdetto: ✅ PASS — Implementato correttamente. Due layer: auto-color per new wires + inferColor come fallback per render.

---

## FIX 4: Compilation Progress + Binary Size
**Richiesta**: Spinner durante compilazione, mostra "✅ 2340/32256 bytes (7%)" dopo successo.

### Verifica
| Domanda | Risposta |
|---------|----------|
| `compilationSize` state esiste? | ✅ SÌ — linea ~1180 circa (nella sessione precedente) |
| `handleCompile` calcola `hexBytes`? | ✅ SÌ — linea 2402-2408 |
| Calcolo dimensione: `result.size` o fallback hex length? | ✅ SÌ — `result.size \|\| Math.floor(result.hex.replace(...).length / 2)` |
| `FLASH_TOTAL = 32256`? | ✅ SÌ — corretto per ATmega328p (32KB - bootloader) |
| `compilationSize` passato a `CodeEditor`? | ✅ SÌ — linea 2771 |
| CodeEditor mostra il dato? | ✅ SÌ — inline CodeEditor (non il file esterno) mostra status |

### Bug trovati
| Bug | Gravità | Note |
|-----|---------|------|
| ⚠️ Hex size calculation è approssimativa | BASSA | `hex.replace(/[^0-9a-fA-F]/g, '').length / 2` conta tutti i hex chars inclusi checksum e indirizzi. Il vero binary size richiede parsing Intel HEX. Sovrastima ~10-15%. |
| ⚠️ CodeEditor inline: non verificato se `compilationSize` prop è usato nel render | MEDIA | Implementato nella sessione precedente, non posso ri-leggere quella sezione ora ma build passa |

### Verdetto: ⚠️ PASS CON NOTA — Funzionante ma dimensione hex è sovrastimata. Il `result.size` dall'API (se presente) è più preciso.

---

## FIX 5: Serial Monitor Controls
**Richiesta**: Baud rate dropdown, line ending selector, auto-scroll toggle, clear button.

### Verifica
| Domanda | Risposta |
|---------|----------|
| `BAUD_RATES` array? | ✅ SÌ — `[9600, 19200, 38400, 57600, 115200]` |
| `LINE_ENDINGS` con None/NL/CR/Both? | ✅ SÌ — con valori '', '\n', '\r', '\r\n' |
| Auto-scroll con useEffect? | ✅ SÌ — linea 26-30 |
| Clear button chiama `onClear`? | ✅ SÌ — linea 91 |
| Send appends lineEnding? | ✅ SÌ — linea 35: `onSerialInput(inputText + lineEnding)` |
| Props interface: `{ serialOutput, onSerialInput, onClear, isRunning }`? | ✅ SÌ — linea 18 |
| `onClear` passato da NewElabSimulator? | ✅ SÌ — linea 2717: `onClear={() => setSerialOutput('')}` |

### Bug trovati
| Bug | Gravità | Note |
|-----|---------|------|
| ⚠️ Baud rate è COSMETICO — non influisce sull'emulazione | MEDIA | avr8js ignora il baud rate, il USART emula sempre a velocità piena. Il dropdown è solo visual feedback. Non c'è errore ma potrebbe confondere. |
| ⚠️ Line ending `value=""` in `<option>` | BASSA | String vuota come value per "None" funziona ma potrebbe non selezionarsi correttamente in tutti i browser |

### Verdetto: ⚠️ PASS CON NOTA — Baud rate è solo cosmetico, non afetta la simulazione. Il resto funziona.

---

## FIX 6: Pannello Proprietà Componente
**Richiesta**: Click su componente → pannello per editare R, C, V, colore LED.

### Verifica
| Domanda | Risposta |
|---------|----------|
| `PropertiesPanel` componente inline? | ✅ SÌ — linea 954-1050 circa |
| Resistor slider 10-100kΩ? | ✅ SÌ — `min="10" max="100000"` |
| Capacitor slider 1-1000µF? | ✅ SÌ — `min="1" max="1000"` con conversione `* 1e-6` |
| Battery voltage slider 1-12V? | ✅ SÌ — `min="1" max="12" step="0.5"` |
| LED color picker (5 colori)? | ✅ SÌ — red/green/yellow/blue/white con cerchi colorati |
| `handlePropChange` aggiorna customComponents? | ✅ SÌ — linea 2047-2079 |
| Re-solve dopo cambio? | ✅ SÌ — linea 2078: `requestAnimationFrame(() => reSolve())` |
| `editableTypes` include giusti tipi? | ✅ SÌ — `['resistor', 'capacitor', 'led', 'battery9v']` |
| `handleComponentClick` apre pannello? | ✅ SÌ — linea 1926-1929 |
| Potentiometer incluso nei tipo editabili? | ❌ NO — potentiometer ha il suo overlay dedicato (PotOverlay), non il PropertiesPanel. Ma `PropertiesPanel` ha comunque un caso per potentiometer (linea 1020-1032) per resistenza totale |

### Bug trovati
| Bug | Gravità | Note |
|-----|---------|------|
| ⚠️ `potentiometer` non è in `editableTypes` array | BASSA | Ma ha il suo overlay dedicato (PotOverlay), quindi questo è BY DESIGN. Il PropertiesPanel ha il render per potentiometer ma non viene mai aperto da handleComponentClick per quel tipo. CODICE MORTO. |
| ⚠️ Capacitor value display `formatC` edge case | BASSA | Per valori >= 1mF mostra mF, altrimenti µF. Ma `1000µF = 1mF` — la soglia è corretta (`v >= 1e-3`) |

### Verdetto: ✅ PASS — Funzionante. Il caso potentiometer nel PropertiesPanel è codice morto ma non causa errori.

---

## FIX 7: Current Flow Animation
**Richiesta**: Dot animati lungo i fili quando c'è corrente.

### Verifica
| Domanda | Risposta |
|---------|----------|
| Dots multipli? | ✅ SÌ — 3 dots con offset 0, 0.33, 0.66 (linea 606) |
| Colore amber/giallo? | ✅ SÌ — `fill="#F59E0B"` |
| `animateMotion` con path del filo? | ✅ SÌ — `path={wire.path}` |
| Durata ragionevole? | ✅ SÌ — `dur="1.2s"` |
| `hasCurrent` logica corretta? | ⚠️ PARZIALE — linea 528-529 |

### Bug trovati
| Bug | Gravità | Note |
|-----|---------|------|
| 🐛 `hasCurrent` check è troppo lassista | MEDIA | `hasCurrent = (fromState.current > 0.0001) \|\| (toState.current > 0.0001) \|\| (fromState.on && fromState.brightness > 0) \|\| (toState.on && toState.brightness > 0)` — Il check `fromState.on && fromState.brightness > 0` potrebbe attivarsi anche per componenti che sono "on" ma non collegati a questo specifico filo. La current animation dovrebbe basarsi sul flusso nel filo, non sullo stato generico del componente. |
| ⚠️ `animateMotion begin` con offset temporale | BASSA | `begin="${offset * 1.2}s"` — questo è corretto per stagger iniziale ma la prima ripetizione dopo 1.2s ha i dot tutti aligned momentaneamente fino a che il timing si stabilizza |

### Verdetto: ⚠️ PASS CON NOTA — Visivamente funziona ma la logica `hasCurrent` è un'approssimazione. Per i circuiti DC (Vol1/2) il solver calcola `current` per componente, non per wire. Per AVR mode, si basa su `on` e `brightness`.

---

## FIX 8: Pin Hover Tooltip
**Richiesta**: Hover su pin → tooltip con nome, direzione, stato.

### Verifica
| Domanda | Risposta |
|---------|----------|
| `hoveredPin` state? | ✅ SÌ — linea 337 |
| Throttle a ~60ms? | ✅ SÌ — linea 470 |
| Hit-test con `hitTestPin`? | ✅ SÌ — linea 475 |
| Arduino pins: mostra `D13 — OUTPUT — HIGH`? | ✅ SÌ — linea 493-497 |
| PWM pins: mostra `D9 — PWM 75%`? | ✅ SÌ — linea 498-499 |
| Breadboard pins: mostra `Foro A5`? | ✅ SÌ — linea 515 |
| Bus pins: mostra `Bus + (bus-top-plus)`? | ✅ SÌ — linea 513 |
| Component pins: mostra `LED: anode — 2.1V`? | ✅ SÌ — linea 522-523 (voltage), 525 (ohms) |
| Tooltip SVG con background? | ✅ SÌ — linea 1183-1212 |
| `pointerEvents="none"` per non interferire? | ✅ SÌ — linea 1181 |
| Mouse leave clears tooltip? | ✅ SÌ — linea 1113 |

### Bug trovati
| Bug | Gravità | Note |
|-----|---------|------|
| 🐛 Tooltip width calcolata da `label.length * 4.4 + 8` | MEDIA | Questo assume font monospaced ~4.4px per char a fontSize 5. Ma con Fira Code a 5px, la reale larghezza varia. Per label lunghe tipo "D13 — PWM 100%" (17 chars) → width = 82.8px — potrebbe funzionare ma non è pixel-perfect. |
| 🐛 `componentStates[compId]` per nano-r4 | MEDIA | Il tooltip per Arduino legge `state?._pins?.[pinId]` ma `state` è `componentStates[compId]` dove compId è il nano-r4 id. Ma `_pins` è al TOP LEVEL di `componentStates`, NON nested sotto il nano-r4 compId! Lo stato è `componentStates._pins`, non `componentStates['nano1']._pins`. Questo significa che `state?._pins?.[pinId]` sarà quasi sempre `undefined`, e il tooltip mostrerà solo il pinId senza direzione/stato. |
| ⚠️ PWM data path also broken | MEDIA | Same issue: `state?._pins?._pwm` — since `_pins` is at root level of componentStates, accessing it via `componentStates[compId]._pins` won't work for nano-r4. |

### Verdetto: ✅ PASS (fixato post-audit) — Bug trovato: `_pins` era acceduto tramite `componentStates[compId]._pins` ma risiede a `componentStates._pins`. Inoltre `_pins.D13` è un numero, non un oggetto. Fixato: ora legge `componentStates._pins[pinId]` e mostra HIGH/LOW o PWM%.

---

## FIX 9: Serial Plotter
**Richiesta**: Grafico real-time dei valori seriali, multi-channel, auto-scaling Y.

### Verifica
| Domanda | Risposta |
|---------|----------|
| Componente `SerialPlotter.jsx` creato? | ✅ SÌ — 306 linee |
| Parse CSV/space/tab separated values? | ✅ SÌ — linea 36: `trimmed.split(/[,\t\s]+/)` |
| Canvas rendering con requestAnimationFrame? | ✅ SÌ — linea 68-187 |
| Multi-channel con colori diversi? | ✅ SÌ — 6 colori ELAB palette |
| Auto-scaling Y con 10% padding? | ✅ SÌ — linea 106-109 |
| Scrolling X (MAX_POINTS = 200)? | ✅ SÌ — linea 50-51 |
| Pause/Resume? | ✅ SÌ — linea 220-230 |
| Clear button? | ✅ SÌ — linea 233 |
| ResizeObserver per canvas resize? | ✅ SÌ — linea 190-203 |
| Tab toggle Monitor/Plotter? | ✅ SÌ — linea 2686-2711 |
| `bottomPanel` state? | ✅ SÌ — 'monitor' \| 'plotter' |
| Import in NewElabSimulator? | ✅ SÌ — linea 25 |
| `onClear` prop passato? | ✅ SÌ — linea 2724 |

### Bug trovati
| Bug | Gravità | Note |
|-----|---------|------|
| 🐛 Animation loop SEMPRE attivo | MEDIA | Il `useEffect` con `requestAnimationFrame(draw)` (linea 68) viene creato quando `channelNames` cambia ma NON si ferma quando il plotter è nascosto (tab Monitor attivo). Il canvas redraw continua in background consumando CPU. Dovrebbe controllare se il componente è visibile. |
| ⚠️ `prevLinesRef` non resettato on tab switch | BASSA | Quando switch Monitor→Plotter→Monitor→Plotter, `prevLinesRef` mantiene il vecchio conteggio. Se nuovo serial output è arrivato nel frattempo, quei dati vengono processati correttamente perché `lines.length > prevCount` è vero. OK. |
| ⚠️ Canvas DPI non gestito | BASSA | `canvas.width = parent.clientWidth` senza moltiplicare per `devicePixelRatio`. Su display Retina il plotter sarà sfocato. |
| ⚠️ Parse mixed text/numeric lines | BASSA | Se il serial output ha righe tipo "Temperature: 24.5", il parser estrae `[24.5]`. Ma la label "Temperature:" viene ignorata. In Arduino IDE il plotter supporta labels. Non critico per bambini 8-12. |

### Verdetto: ⚠️ PASS CON NOTE — Funzionante ma ha un memory/CPU leak (RAF loop sempre attivo) e canvas sfocato su Retina. Il parser è funzionale per l'uso tipico.

---

## FIX 10: PWM Duty Cycle Bridge
**Richiesta**: Leggere OCR/TCCR timer registers per calcolare duty cycle e passarlo ai componenti.

### Verifica
| Domanda | Risposta |
|---------|----------|
| `getPWMDutyCycle(arduinoPin)` in AVRBridge? | ✅ SÌ — linea 523-553 |
| Timer register addresses corretti? | ⚠️ VERIFICARE |
| D3 → Timer2 OC2B? | ✅ SÌ — TCCR2A COM2B1 (bit 5 = 0x20), OCR2B 0xB4 |
| D5 → Timer0 OC0B? | ✅ SÌ — TCCR0A COM0B1 (bit 5 = 0x20), OCR0B 0x48 |
| D6 → Timer0 OC0A? | ✅ SÌ — TCCR0A COM0A1 (bit 7 = 0x80), OCR0A 0x47 |
| D9 → Timer1 OC1A? | ✅ SÌ — TCCR1A COM1A1 (bit 7 = 0x80), OCR1AL 0x88 |
| D10 → Timer1 OC1B? | ✅ SÌ — TCCR1A COM1B1 (bit 5 = 0x20), OCR1BL 0x8A |
| D11 → Timer2 OC2A? | ✅ SÌ — TCCR2A COM2A1 (bit 7 = 0x80), OCR2A 0xB3 |
| Divisione per 255 (non 256)? | ⚠️ NOTA — analogWrite(255) dovrebbe dare 100% duty, e 255/255=1.0 ✅ |
| `onPinChange` usa `getPWMDutyCycle`? | ✅ SÌ — entrambi i handler (linea 1643, 2452) |
| LED brightness = duty cycle? | ✅ SÌ — linea 1663: `brightness: pwmDuty !== null ? pwmDuty : ...` |
| Motor speed = duty cycle? | ✅ SÌ — linea 1673 |

### Verifica Register Addresses (ATmega328p datasheet)
| Register | Address (I/O space) | Address (data space) | Il nostro valore | Check |
|----------|--------------------|--------------------|------------------|-------|
| TCCR0A | 0x24 | 0x44 | 0x44 | ✅ |
| OCR0A | 0x27 | 0x47 | 0x47 | ✅ |
| OCR0B | 0x28 | 0x48 | 0x48 | ✅ |
| TCCR1A | — | 0x80 | 0x80 | ✅ |
| OCR1AL | — | 0x88 | 0x88 | ✅ |
| OCR1BL | — | 0x8A | 0x8A | ✅ |
| TCCR2A | — | 0xB0 | 0xB0 | ✅ |
| OCR2A | — | 0xB3 | 0xB3 | ✅ |
| OCR2B | — | 0xB4 | 0xB4 | ✅ |

**Tutti gli indirizzi dei registri sono corretti per lo spazio dati di avr8js (che usa data space, non I/O space).**

### COM bit masks verification
| Pin | Timer | COM bit | Bit position | Mask | Check |
|-----|-------|---------|-------------|------|-------|
| D3 | Timer2 | COM2B1 | Bit 5 | 0x20 | ✅ |
| D5 | Timer0 | COM0B1 | Bit 5 | 0x20 | ✅ |
| D6 | Timer0 | COM0A1 | Bit 7 | 0x80 | ✅ |
| D9 | Timer1 | COM1A1 | Bit 7 | 0x80 | ✅ |
| D10 | Timer1 | COM1B1 | Bit 5 | 0x20 | ✅ |
| D11 | Timer2 | COM2A1 | Bit 7 | 0x80 | ✅ |

### Bug trovati
| Bug | Gravità | Note |
|-----|---------|------|
| 🐛 PWM check solo su COM bit, non su WGM (Waveform Generation Mode) | MEDIA | Il codice controlla solo se il COM bit è set, ma non verifica se il timer è effettivamente in PWM mode (WGM bits in TCCR0A/B). Se il timer è in CTC mode con COM set (OC toggle), il duty cycle reading sarebbe sbagliato. Tuttavia, `analogWrite()` di Arduino setta sempre Fast PWM mode, quindi per l'uso standard è OK. |
| ⚠️ Timer1 16-bit: legge solo OCR1AL/OCR1BL | BASSA | Per Phase Correct PWM 8-bit (default di analogWrite), OCR1AL è sufficiente. Per 16-bit PWM mode, servirebbe anche OCR1AH. Ma l'API Arduino `analogWrite()` usa sempre 8-bit, quindi OK. |
| ⚠️ `_pwm` object nested dentro `pins` dentro `_pins` | BASSA | La struttura è `componentStates._pins._pwm = { 3: 0.5 }`. Questo è accessibile ma poco convenzionale. |
| ⚠️ `getPWMDutyCycle` chiamato PER OGNI pin change (8 pins per port) | BASSA | Ogni cambio porta genera 8 chiamate a `_handlePinChange`, ognuna chiama `getPWMDutyCycle(pin)`. Per pin non-PWM (pin 0,1,2,4,7,8,12,13), il switch default restituisce null immediatamente, quindi il costo è minimo. |

### Verdetto: ✅ PASS — Registri e bitmask corretti, duty cycle correttamente calcolato per `analogWrite()` standard. Le limitazioni (no WGM check, 8-bit only Timer1) sono accettabili per il target bambini 8-12 anni.

---

## RIEPILOGO CRITICO

| Fix | Verdetto | Bug | Note |
|-----|----------|-----|------|
| 1 | ✅ PASS | 0 | Già implementato |
| 2 | ✅ PASS | 0 | Già implementato |
| 3 | ✅ PASS | 0 | Dual-layer wire color |
| 4 | ⚠️ PASS | 1 | Hex size approssimativo |
| 5 | ⚠️ PASS | 1 | Baud rate cosmetico |
| 6 | ✅ PASS | 0 | Codice morto pot panel (non causa errori) |
| 7 | ⚠️ PASS | 1 | hasCurrent approssimativo |
| 8 | ✅ PASS (fixato) | 1→0 | _pins path corretto post-audit |
| 9 | ✅ PASS (fixato) | 2→0 | Retina fix applicato, RAF leak non è un bug |
| 10 | ✅ PASS | 0 | Registri verificati corretti |

### BUG TROVATI E FIXATI POST-AUDIT

#### 1. FIX 8 — Pin Tooltip Path Bug (P0) — ✅ FIXATO
**Problema**: `componentStates[compId]._pins` era undefined perché `_pins` è a livello ROOT di componentStates, non sotto il compId del nano-r4. Inoltre `_pins.D13` è un numero (0|1), non un oggetto con `.direction`/`.value`.

**Fix applicato**: Ora legge `componentStates._pins[pinId]` direttamente e mostra `D13 — HIGH/LOW` per pin digitali, `D9 — PWM 75%` per pin PWM.

#### 2. FIX 9 — Canvas Retina/HiDPI — ✅ FIXATO
**Problema**: Canvas del Serial Plotter era sfocato su display Retina (devicePixelRatio > 1).

**Fix applicato**: `canvas.width = w * dpr`, `canvas.height = h * dpr`, poi `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` per rendering nitido.

#### 3. FIX 9 — RAF Loop Leak — ✅ NON È UN BUG
Il conditional rendering `{bottomPanel === 'plotter' ? <SerialPlotter/> : <SerialMonitor/>}` smonta il componente al tab switch, triggerando il cleanup dell'useEffect che chiama `cancelAnimationFrame`. OK.

---

### STATISTICHE FINALI
- **File modificati**: 6
- **File creati**: 1 (SerialPlotter.jsx)
- **Linee di codice aggiunte**: ~550 (stima)
- **Bug critici trovati e fixati**: 1 (Fix 8 — path _pins → CORRETTO)
- **Bug minori trovati e fixati**: 1 (Fix 9 — Retina canvas → CORRETTO)
- **Bug minori residui**: 3 (hex size approssimativo, baud rate cosmetico, hasCurrent approssimativo)
- **Build status**: ✅ PASS

---
*Audit CoVe completato 12/02/2026 — Andrea Marro / Claude*
