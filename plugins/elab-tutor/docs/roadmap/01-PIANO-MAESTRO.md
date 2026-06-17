# ELAB Tutor — Piano Maestro: 15 Sessioni verso la Perfezione

> **Regole Ferree**:
> - MAI agenti paralleli — tutto sequenziale, verificato passo passo
> - Chrome Control per validare OGNI modifica visivamente
> - ZERO regressioni — Ralph Loop a fine sessione
> - **SCRATCH GATE obbligatorio** — ogni sessione deve verificare Scratch (vedi sotto)
> - Chiedere allineamento utente prima di decisioni importanti
> - Ogni sessione produce un deliverable testabile + score aggiornato

---

## 🧩 SCRATCH GATE (Obbligatorio OGNI sessione)

Qualsiasi modifica a CSS, layout, logica, iPad, o componenti può rompere Scratch.
**Questa checklist va eseguita a FINE di ogni sessione, PRIMA del deploy.**

| # | Test | Verifica | PASS/FAIL |
|---|------|----------|-----------|
| SG1 | Caricare Vol3 LED Blink → tab "Blocchi" | Blockly workspace visibile, categorie leggibili | |
| SG2 | Blocchi Setup/Loop presenti | I blocchi default sono nel workspace | |
| SG3 | Drag blocco da categoria al workspace | Il blocco si aggancia correttamente | |
| SG4 | Compilare in modalità Blocchi | `✅ bytes/32256` — compilazione OK | |
| SG5 | Play dopo compilazione Blocchi | Simulazione parte, LED lampeggia | |
| SG6 | Switch a "Arduino C++" | Codice C++ utente intatto, NON sovrascritto | |
| SG7 | Compilare in modalità Arduino | Compilazione OK con codice utente | |
| SG8 | Switch ripetuto Blocchi↔Codice (2x) | Zero perdita codice, zero freeze | |
| SG9 | Pannello Blocchi non tagliato | Workspace Blockly visibile per intero, no overflow | |
| SG10 | `npm run build` | 0 errori | |

> **Se anche UN SOLO test SG fallisce → la sessione NON è completa.**
> Fixare la regressione PRIMA di procedere.

---

## FASE 1: ESTETICA + MINIMALISMO (S94–S96)
*Obiettivo: da 6.5 a 9.5 — il simulatore deve essere bello da usare*

### S94 — Design System Purge
**Focus**: Eliminare ogni colore hardcoded e rendere il tema coerente
- [ ] Audit completo: trovare tutti i colori hardcoded nel simulatore (150+ identificati S75)
- [ ] Sostituire con CSS custom properties (`--color-*` dal design-system.css)
- [ ] Dark theme coerente: toolbar, panels, modals, tooltips
- [ ] Font audit: verificare Oswald/Open Sans/Fira Code ovunque
- **CoV**: Screenshot di 5 schermate chiave, confronto before/after
- **Score target**: Estetica 6.5 → 7.5

### S95 — Toolbar + Panels Minimal
**Focus**: Interfaccia pulita, meno rumore visivo
- [ ] Toolbar: icone coerenti, tooltips uniformi, spacing consistente
- [ ] ComponentDrawer: card componenti più pulite, spacing
- [ ] Editor panel: header tabs raffinati, status bar minimalista
- [ ] Serial Monitor: pulizia visuale, font mono coerente
- [ ] Eliminare elementi decorativi superflui
- **CoV**: Screenshot toolbar, drawer, editor, serial monitor
- **Score target**: Estetica 7.5 → 8.5

### S96 — SVG Components + Canvas Polish
**Focus**: I componenti devono sembrare professionali
- [ ] 22 componenti SVG: audit colori, stroke, consistenza visiva
- [ ] Breadboard: texture, ombre, colori realistici
- [ ] Wires: anti-aliasing, curve naturali, colori differenziati
- [ ] Canvas: background, griglia, zoom controls
- [ ] Aria labels su tutti i 21 SVG mancanti (P2-RES-9)
- **CoV**: Zoom su ogni componente, confronto con foto reali
- **Score target**: Estetica 8.5 → 9.5, Responsive/A11y 7.5 → 8.0

---

## FASE 2: FISICA + LOGICA SIMULATORE (S97–S99)
*Obiettivo: da 7.0 a 9.0+ — il simulatore deve comportarsi come la realtà*

### S97 — Capacitor + Transient Analysis
**Focus**: Condensatore funzionante con carica/scarica
- [ ] Capacitor.jsx: visualizzazione carica (fill progressivo o gauge)
- [ ] CircuitSolver.js: logica RC time constant (τ = R×C)
- [ ] Transient step simulation: carica esponenziale, scarica
- [ ] Esperimento di test: RC con LED che si affievolisce
- **CoV**: Play RC circuit, verificare curva esponenziale su Serial Monitor/Plotter
- **Score target**: Physics 7.0 → 8.0

### S98 — Component Behavior Parity
**Focus**: Ogni componente si comporta come il vero
- [ ] LED: luminosità proporzionale alla corrente (PWM → opacity)
- [ ] Buzzer: tono variabile (frequenza → audio Web API o visual)
- [ ] Motor DC: velocità proporzionale al PWM
- [ ] Potentiometer: valore analogico smooth (0-1023)
- [ ] Servo: angolo visuale in tempo reale (0-180°)
- [ ] PhotoResistor/Phototransistor: risposta alla luce simulata
- **CoV**: Ogni componente testato con esperimento dedicato
- **Score target**: Physics 8.0 → 8.8

### S99 — Error Feedback + Smart Diagnostics
**Focus**: Il simulatore aiuta l'utente a capire gli errori
- [ ] Short circuit detection + visual feedback (flash rosso)
- [ ] Missing connection warnings (pin disconnesso → icona ⚠️)
- [ ] Component overload (LED senza resistore → warning)
- [ ] Custom modals al posto di `confirm()` (P3)
- [ ] CircuitState sanitization (P2-NAN-5)
- **CoV**: Testare 5 scenari di errore, verificare feedback visuale
- **Score target**: Sim funzionalità 9.8 → 10.0, Physics 8.8 → 9.0

---

## FASE 3: iPAD COMPLETO (S100–S101)
*Obiettivo: da 7.0 a 9.5 — usabile perfettamente su iPad con dita e Apple Pencil*

### S100 — iPad Layout Perfection
**Focus**: Tutti i breakpoints pixel-perfect
- [ ] iPad Mini (768×1024): portrait + landscape test
- [ ] iPad Air (820×1180): portrait + landscape test
- [ ] iPad Pro 11" (834×1194): portrait + landscape test
- [ ] iPad Pro 12.9" (1024×1366): portrait + landscape test
- [ ] Split View / Slide Over compatibility
- [ ] Keyboard overlay handling (virtual keyboard push)
- **CoV**: Screenshot ogni dispositivo × 2 orientamenti = 8 screenshot
- **Score target**: iPad 7.0 → 8.5

### S101 — iPad Touch + Gestures
**Focus**: Interazione naturale con dita e Apple Pencil
- [ ] Drag-drop componenti: smooth su touch, no 300ms delay
- [ ] Wire drawing: touch → pin snap → curva → release
- [ ] Pinch-to-zoom sul canvas (controllato, non browser zoom)
- [ ] Blockly su touch: categorie, drag blocks, connection snap
- [ ] Apple Pencil: precision mode per wire drawing
- [ ] Context menu: long-press → azioni componente
- **CoV**: Video-style test: piazzare componente, collegare filo, compilare, play
- **Score target**: iPad 8.5 → 9.5

---

## FASE 4: SCRATCH COMPLETAMENTO (S102–S103)
*Obiettivo: mantenere 10 e colmare gap copertura*

### S102 — Scratch Steps per Tutti gli Esperimenti
**Focus**: Ogni AVR experiment ha un percorso Scratch guidato
- [ ] Scrivere scratchSteps per i 7 esperimenti mancanti:
  - v3-cap6-morse (3 steps: delay pattern)
  - v3-cap7-pullup (3 steps: digitalRead + if)
  - v3-cap7-pulsante (4 steps: debounce + toggle)
  - v3-cap7-mini (3 steps: multiple buttons)
  - v3-cap8-pot (3 steps: analogRead + map)
  - v3-extra-lcd-hello (4 steps: LCD init + print)
  - v3-extra-servo-sweep (3 steps: servo attach + for loop)
- [ ] Scrivere scratchXml per v3-cap6-morse (unico mancante)
- **CoV**: Ogni esperimento: Passo Passo → Blocchi → advance all steps → compile → play
- **Score target**: Scratch 10 → 10 (copertura 12/12)

### S103 — Scratch Blocks + Generator Expansion
**Focus**: Blocchi mancanti per esperimenti avanzati
- [ ] Blocchi LCD: `lcd_init`, `lcd_print`, `lcd_set_cursor`, `lcd_clear`
- [ ] Blocchi Servo: `servo_attach`, `servo_write`, `servo_detach`
- [ ] Blocchi analogici avanzati: `analog_read`, `map_value`
- [ ] Blocchi stringa: `serial_print_text`, `string_concat`
- [ ] Generator: C++ corretto per ogni nuovo blocco
- [ ] Error messages migliori: "Blocco X non connesso" con highlight
- **CoV**: Creare programma complesso con nuovi blocchi → compile → verify C++ output
- **Score target**: Scratch 10 → 10 (capacità espansa)

---

## FASE 5: GALILEO ONNISCIENTE (S104–S106)
*Obiettivo: Galileo sa tutto, vede tutto, aiuta in tutto*

### S104 — Galileo Context Engine
**Focus**: Galileo conosce lo stato completo del simulatore in tempo reale
- [ ] Iniettare nel context: experiment ID, nome, volume, capitolo
- [ ] Iniettare: lista componenti piazzati + posizioni
- [ ] Iniettare: fili collegati + pin mapping
- [ ] Iniettare: step Passo Passo corrente (hw step N di M, code step N di M)
- [ ] Iniettare: editorMode (scratch/arduino) + ultimo codice compilato
- [ ] Iniettare: errori compilazione recenti
- [ ] Iniettare: simulation state (running/paused/stopped)
- **CoV**: Chiedere "dove sono?" → Galileo descrive esattamente stato corrente
- **Score target**: AI 10 → 10 (context depth +++)

### S105 — Galileo New Powers
**Focus**: Nuove capacità di aiuto attivo
- [ ] **Wiring Helper**: "collegami il LED" → Galileo mostra passo passo dove collegare
- [ ] **Debug Assistant**: "il LED non si accende" → Galileo analizza circuito + codice
- [ ] **Hint System**: suggerimenti progressivi (vago → specifico → soluzione)
- [ ] **Quiz Expansion**: quiz contestuali per ogni esperimento + scoring
- [ ] **Code Explanation**: seleziona riga → "spiega questa riga" → spiegazione inline
- [ ] Nuovi action tags per queste capacità in nanobot.yml
- **CoV**: 10 scenari conversazionali testati in Chrome
- **Score target**: AI 10 → 10 (capabilities +++)

### S106 — Galileo Stress Test + Personality
**Focus**: Galileo non si rompe MAI e ha personalità consistente
- [ ] Stress test 50 domande rapide (mix text/vision/action)
- [ ] Edge cases: domande fuori contesto, insulti, prompt injection
- [ ] Personalità: tono costante (amichevole, incoraggiante, mai condiscendente)
- [ ] Multi-turno: conversazioni lunghe senza perdita contesto
- [ ] Recovery: dopo errore, Galileo si riprende gracefully
- [ ] Session memory: ricorda cosa hai fatto in questa sessione
- **CoV**: Chat log completo delle 50 domande analizzato
- **Score target**: AI 10 → 10 (robustness +++)

---

## FASE 6: RIFINITURA + ACCESSIBILITÀ (S107)
*Obiettivo: tutti i piccoli dettagli che fanno la differenza*

### S107 — UX Polish + Accessibility
**Focus**: Skip-to-content, focus-visible, orphan cleanup, keyboard nav
- [ ] Skip-to-content link (P2-RES-10)
- [ ] Focus-visible custom rings (P2-RES-11)
- [ ] Keyboard navigation nel canvas SVG (P2-RES-9)
- [ ] Cleanup 61 orphan files (P2-VET-4) — dopo conferma utente
- [ ] Custom modals per `confirm()` rimanenti (P3-L1)
- [ ] useMemo CollisionDetector fix (P2-WIR-2)
- [ ] Session messages sanitization (P2-NAN-7)
- **CoV**: Tab-through intera app, screen reader test
- **Score target**: Responsive/A11y 8.0 → 9.5

---

## FASE 7: AUDIT FINALE (S108)
*Obiettivo: tutto ≥9.5, deploy in produzione, celebrazione*

### S108 — Grand Final Audit + Deploy
**Focus**: Verifica totale, score card finale
- [ ] Ralph Loop completo: Vol1 → Vol2 → Vol3 → Scratch → Arduino → Galileo
- [ ] iPad test: 4 dispositivi × 2 orientamenti
- [ ] Lighthouse audit: Performance, A11y, Best Practices
- [ ] Bundle size check: lazy loading verification
- [ ] 20-question Galileo test
- [ ] Score card finale — ogni area ≥9.5
- [ ] Deploy Vercel (frontend) + Render (nanobot)
- [ ] Aggiornare MEMORY.md con score finali
- **Deliverable**: Report PDF con before/after screenshots
- **Score target**: OVERALL 8.7 → ≥9.5

---

## Timeline Visuale

```
S94 ──► S95 ──► S96    ESTETICA (3 sessioni)
                  │
S97 ──► S98 ──► S99    FISICA + LOGICA (3 sessioni)
                  │
          S100 ──► S101    iPAD (2 sessioni)
                     │
          S102 ──► S103    SCRATCH (2 sessioni)
                     │
S104 ──► S105 ──► S106    GALILEO (3 sessioni)
                     │
               S107        UX + A11Y (1 sessione)
                  │
               S108        AUDIT FINALE (1 sessione)
```

**Totale**: 15 sessioni = 3+3+2+2+3+1+1

## Dipendenze Critiche
1. **S96 prima di S100**: I componenti SVG devono essere belli prima di testare su iPad
2. **S99 prima di S105**: Le diagnostiche circuito servono a Galileo Debug Assistant
3. **S103 prima di S104**: I blocchi Scratch nuovi devono esistere perché Galileo li conosca
4. **S107 prima di S108**: L'accessibilità va fixata prima dell'audit finale

## File di Contesto per Sessione
Ogni sessione produrrà:
- `docs/roadmap/SXX-deliverables.md` — Cosa è stato fatto
- `docs/roadmap/SXX-cov-results.md` — Risultati Chain of Verification
- Score card aggiornato in `00-STATO-ATTUALE.md`
