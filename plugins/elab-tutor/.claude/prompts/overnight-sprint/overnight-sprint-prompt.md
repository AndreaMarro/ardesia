# OVERNIGHT SPRINT — ELAB Simulator Perfection

## Stringa di Attivazione

```
Esegui il prompt overnight-sprint. Obiettivo: portare il simulatore ELAB alla perfezione totale entro fine sessione. Segui OGNI fase in ordine, usa CoV dopo ogni step, MAI regredire. Se un build fallisce, FERMA e correggi prima di andare avanti.
```

---

## Contesto Critico

- **QA Score attuale**: 64/80 (Antigravity QA Session 5) con 8 bug documentati
- **QA Score ufficiale**: 80/80 (report consolidato dopo fix Sessions 108-112)
- **Esperimenti**: 70 totali (38 Vol1 + 18 Vol2 + 14 Vol3)
- **3 Modalita obbligatorie**: Gia Montato, Passo Passo, Libero
- **Build**: 0 errori, Main 302KB gzip, ScratchEditor 190KB gzip
- **Deploy target**: Vercel (elab-builder.vercel.app / www.elabtutor.school)
- **Repo**: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/`

## Vincoli IMMUTABILI

1. **Pin positions**: TUTTI i 47 pin del NanoR4Board sono IMMUTABILI
   ```
   Header:  PIN_START_X=20, PIN_PITCH=7.5, TOP_PIN_Y=35, BOTTOM_PIN_Y=64
   Wing:    WING_PIN_START_X=62, WING_PIN_PITCH=5.0, WING_PIN_Y=78
   ```
2. **COMP_SIZES**: 168 x 99 — NON CAMBIARE
3. **BOARD_W/BOARD_H**: 168/99 — NON CAMBIARE
4. **NO REGRESSIONI**: Ogni step deve passare `npm run build` con 0 errori
5. **CoV**: Dopo OGNI fase, verifica punto per punto prima di procedere

---

## FASE 0 — Build Health & Baseline (5 min)

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npm run build
```

**CoV Checklist:**
- [ ] Build 0 errori
- [ ] Main chunk < 350KB gzip
- [ ] ScratchEditor < 250KB gzip
- [ ] Nessun warning critico

---

## FASE 1 — NanoR4Board SVG Rewrite (40 min)

**File**: `src/components/simulator/components/NanoR4Board.jsx` (708 righe)

**Piano gia approvato** in `/Users/andreamarro/.claude/plans/greedy-roaming-pillow.md`

### 1.1 Board Outline (BOARD_PATH)
- Semicerchio + body con nano slot interno + wing tab con angoli arrotondati
- Wing leggermente piu larga (R=4-5 SVG units)
- Path secondario per il dettaglio nano slot (groove line)

### 1.2 Arduino Nano R4 Module
- MCU Renesas RA4M1 con dot marker
- Connettore USB-C proporzionato
- WiFi module (ESP32-S3) rettangolare metallico
- Pin headers visivi (oro)
- Silkscreen: "ARDUINO" + "NANO R4"
- Status LEDs funzionali (PWR, D13, TX, RX)

### 1.3 Wing Connector
- Housing plastico scuro (charcoal)
- Pin wells individuali
- Silkscreen labels ruotati 90 gradi (A0-A3, ~D3, ~D5, etc.)

### 1.4 Power Bus Pads
- 4 pad saldatura (non 2 cerchi)
- Pad + rosso, pad - nero
- Gold circle con hole center

### 1.5 Silkscreen e Dettagli PCB
- "ELAB Nano Breakout V1.1 GP" sulla zona gialla
- Copper trace hints (cosmetici)
- Mounting holes placcati
- Board edge cut (bordo scuro)

**CoV Checklist FASE 1:**
- [ ] Build 0 errori
- [ ] Outline mostra semicerchio + nano slot + wing
- [ ] Arduino Nano R4 con dettagli realistici visibili
- [ ] 15 top header pins renderizzati con label
- [ ] 15 bottom header pins renderizzati con label
- [ ] 17 wing pins renderizzati con label
- [ ] 4 power bus pads visibili (+/-/+/-)
- [ ] Reset button interattivo
- [ ] Status LEDs funzionali
- [ ] Running indicator funziona
- [ ] LED glow funziona

---

## FASE 2 — Simon Game Perfection (30 min)

**File**: `src/data/experiments-vol3.js` (esperimento `v3-extra-simon`)

### Requisiti dal video di riferimento:
- 4 LED colorati (rosso, verde, blu, giallo) posizionati correttamente
- 4 pulsanti corrispondenti ai LED
- Buzzer per feedback sonoro
- Sequenza di gioco: illuminazione LED in sequenza casuale
- Il giocatore deve ripetere la sequenza
- Difficolta progressiva (sequenza piu lunga)
- Feedback sonoro diverso per ogni LED
- Game over con feedback visivo/sonoro

### Verifica:
- Scratch XML workspace completo e funzionale
- Codice C++ generato compila senza errori
- Tutti i componenti piazzati nelle posizioni corrette (matching volume)
- Wiring corretto dal nano wing ai componenti sulla breadboard
- Tutte e 3 le modalita funzionano (Gia Montato, Passo Passo, Libero)

**CoV Checklist FASE 2:**
- [ ] Simon carica senza errori console
- [ ] 4 LED visibili e posizionati come nel video
- [ ] 4 pulsanti visibili e posizionati come nel video
- [ ] Buzzer presente
- [ ] Wiring corretto (wing pins → breadboard)
- [ ] Scratch XML genera C++ valido
- [ ] "Gia Montato" piazza tutto correttamente
- [ ] "Passo Passo" guida step-by-step
- [ ] Build 0 errori

---

## FASE 3 — Tutti gli Esperimenti Verificati (45 min)

Per OGNI volume, verificare che:

### Vol1 (38 esperimenti)
- Componenti corretti per ogni esperimento
- Posizioni identiche alle illustrazioni Fritzing del libro
- CircuitSolver produce risultati corretti
- 3 modalita funzionanti

### Vol2 (18 esperimenti)
- Stesso check di Vol1
- Componenti specifici Vol2 (potenziometro, fotoresistenza, etc.)

### Vol3 (14 esperimenti — AVR)
- Scratch tab presente per TUTTI (12 su 14, 2 circuit-only esclusi)
- Codice C++ generato dal Scratch compila
- Arduino simulation funziona
- 3 modalita funzionanti

**CoV Checklist FASE 3:**
- [ ] `loadExperiment()` per OGNI esperimento → 0 errori console
- [ ] Componenti visibili e posizionati correttamente
- [ ] "Gia Montato" funziona per ogni esperimento
- [ ] Scratch tab presente per tutti gli AVR
- [ ] Build 0 errori

---

## FASE 4 — Circuit Solver Responsive (20 min)

**File**: `src/components/simulator/engine/CircuitSolver.js` (2485 righe)

### Requisiti:
- SVG coordinates coerenti via `getScreenCTM().inverse()`
- ResizeObserver aggiorna viewBox su resize
- Zoom/Pan funzionante
- Touch events per iPad (pinch-to-zoom)
- Breakpoints: mobile (375px), tablet (768px), desktop (1280px)

**CoV Checklist FASE 4:**
- [ ] Simulator visibile a 375px width
- [ ] Simulator visibile a 768px width
- [ ] Simulator visibile a 1280px width
- [ ] Pin positions coerenti dopo resize
- [ ] Build 0 errori

---

## FASE 5 — Scratch Compile Fix (20 min)

### Bug P1 documentati:
1. **"Codice Generato" CM6 panel mancante** in Scratch mode
2. **"Compila & Carica" non funzionale** in Scratch mode
3. **v3-cap6-blink default C++ code broken** (brackets malformati)

### Fix richiesti:
- Verificare side-by-side layout (Blockly 60% + CodeMirror6 40%)
- Compilazione Scratch → C++ → output funzionante
- Codice default blink corretto

**CoV Checklist FASE 5:**
- [ ] Side-by-side layout visibile (Blockly + "Codice Generato")
- [ ] Compilazione produce output
- [ ] v3-cap6-blink ha codice C++ valido
- [ ] Build 0 errori

---

## FASE 6 — SVG Components Skills (15 min)

### Creare skill `nano-breakout`
**File**: `.claude/skills/nano-breakout/SKILL.md`

Contenuto:
- Path corretti (PRODOTTO/elab-builder)
- Layout constants correnti
- Pin immutability rules
- DWG reference data
- Build/test commands

**CoV Checklist FASE 6:**
- [ ] Skill file creato e leggibile
- [ ] Path corretti nel file
- [ ] Costanti pin documentate
- [ ] Build/test commands funzionanti

---

## FASE 7 — Deploy & Push (10 min)

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npm run build
npx vercel --prod --yes
git add -A
git commit -m "S113: Overnight sprint — NanoR4Board rewrite + Simon perfection + Scratch fixes"
git push origin main
```

**CoV Checklist FINALE:**
- [ ] Build 0 errori
- [ ] Deploy Vercel production OK
- [ ] Git push OK
- [ ] Tutti i file committati
- [ ] Nessuna regressione

---

## Riferimenti

| Risorsa | Path/URL |
|---------|----------|
| NanoR4Board.jsx | `src/components/simulator/components/NanoR4Board.jsx` |
| experiments-vol3.js | `src/data/experiments-vol3.js` |
| CircuitSolver.js | `src/components/simulator/engine/CircuitSolver.js` |
| Piano NanoR4 | `.claude/plans/greedy-roaming-pillow.md` |
| QA Report | `.claude/prompts/antigravity-qa/antigravity-qa-report.md` |
| PDR | `sessioni/PDR-ATTUALE-03-03-2026.md` |
| Memory | `~/.claude/projects/-Users-andreamarro-VOLUME-3/memory/MEMORY.md` |
| Fritzing Parts | https://github.com/fritzing/fritzing-parts |
| SparkFun Parts | https://github.com/sparkfun/Fritzing_Parts |

## REGOLE ASSOLUTE

1. **MAI regredire** — se un fix rompe qualcosa, annullalo e trova un altro approccio
2. **CoV dopo OGNI fase** — non procedere alla fase successiva senza aver verificato TUTTO
3. **Build check** — `npm run build` DEVE passare con 0 errori dopo ogni modifica
4. **Pin positions IMMUTABILI** — i 47 pin del NanoR4Board non si toccano MAI
5. **Ralph Loop** — Load → Test → Verify → Next per sviluppo incrementale
6. **Git commit** dopo ogni fase completata per preservare il lavoro
