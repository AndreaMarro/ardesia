# FASE 2: FISICA + LOGICA (S97–S99)
> Target: Physics da 7.0 → 9.0+ (approccio EDUCATIONAL, non accademico)

## Filosofia
Il simulatore insegna a bambini delle medie. La fisica deve essere:
- **Visibile**: il bambino VEDE cosa succede (LED si illumina, motore gira)
- **Comprensibile**: carica/scarica come "riempire un bicchiere d'acqua"
- **Coerente**: se colleghi male, succede qualcosa di logico (non crash silenzioso)
- **Non accademico**: no formule complesse, sì feedback intuitivo

---

## S97 — Capacitor + Timing Educational (~2h)

### Obiettivo
Il condensatore funziona in modo comprensibile: si carica, si scarica, il LED lo mostra.

### Approccio Educational (NON full transient analysis)
- **Carica**: rampa lineare da 0V a Vmax in N step (N proporzionale a R×C ma semplificato)
- **Scarica**: rampa lineare inversa
- **Visualizzazione**: fill progressivo del componente SVG (come un bicchiere che si riempie)
- **Effetto sul circuito**: LED brightness segue la tensione del condensatore

### Checklist
- [ ] `Capacitor.jsx`: aggiungere visualizzazione livello carica (rettangolo che sale)
- [ ] `CircuitSolver.js`: aggiungere stato `capacitorVoltage` per ogni condensatore
- [ ] Logica carica: `V += (Vsource - V) / steps` per ogni tick simulazione
- [ ] Logica scarica: `V -= V / steps` quando disconnesso dalla sorgente
- [ ] LED brightness: `opacity = f(current)` dove corrente dipende da V_capacitor
- [ ] Parametro `steps` derivato da valore RC (es. 1μF×1kΩ = veloce, 100μF×10kΩ = lento)

### File da modificare
- `src/components/simulator/components/Capacitor.jsx` — visual gauge
- `src/components/simulator/engine/CircuitSolver.js` — logica carica/scarica
- `src/data/experiments-vol2.js` — verificare esperimenti con condensatore

### 🧩 Scratch Gate (obbligatorio)
- [ ] SG1-SG10 — TUTTI PASS
- [ ] Extra: compilare esperimento con condensatore in Blocchi → funziona?

### Validazione Chrome
1. Piazzare RC circuit (resistore + condensatore + LED)
2. Play → LED si accende gradualmente (non istantaneo)
3. Disconnettere → LED si spegne gradualmente
4. Serial Plotter mostra rampa
5. Ripetere con valori C diversi — velocità diversa

---

## S98 — Component Behavior Parity (~2h)

### Obiettivo
Ogni componente reagisce in modo proporzionale ai segnali elettrici.

### LED
- [ ] **Brightness**: `opacity = clamp(current/20mA, 0, 1)` — 20mA = full brightness
- [ ] **Color**: rosso/verde/blu/giallo già gestiti, ma luminosità ora proporzionale
- [ ] **PWM**: `analogWrite(pin, 128)` → 50% brightness (opacity 0.5)
- [ ] **Overcurrent warning**: >30mA → LED lampeggia rosso (warning visivo)

### Buzzer
- [ ] **Tone visual**: cerchio pulsante al centro del buzzer (frequenza → velocità pulsazione)
- [ ] **No tone**: buzzer fermo, cerchio statico
- [ ] **Web Audio** (opzionale): `oscillator.frequency = toneValue` — suono reale

### Motor DC
- [ ] **Rotation animation**: CSS `@keyframes rotate` con `animation-duration` inversamente proporzionale al PWM
- [ ] **Direction**: CW/CCW basato sulla polarità
- [ ] **Speed 0**: motore fermo

### Servo
- [ ] **Angle visual**: braccio servo ruota da 0° a 180°
- [ ] **Position update**: in tempo reale con `servo.write(angle)` dall'AVR

### Potentiometer
- [ ] **Smooth value**: rotazione knob → valore 0-1023 smooth (non a step)
- [ ] **Visual feedback**: indicatore angolo sul knob

### PhotoResistor + Phototransistor
- [ ] **Simulated light**: slider o day/night toggle per simulare luce ambientale
- [ ] **Resistance change**: valore analogico cambia con "luce"

### 🧩 Scratch Gate (obbligatorio)
- [ ] SG1-SG10 — TUTTI PASS
- [ ] Extra: PWM da blocchi Scratch → LED brightness funziona?
- [ ] Extra: Servo da blocchi Scratch → angolo visuale si aggiorna?

### Validazione Chrome
Per ogni componente:
1. Piazzare nel circuito con esperimento appropriato
2. Play → verificare risposta visuale proporzionale
3. Cambiare parametro (PWM, frequenza, angolo) → risposta cambia
4. Screenshot before/after

---

## S99 — Error Feedback + Smart Diagnostics (~2h)

### Obiettivo
Quando sbagli, il simulatore te lo dice in modo chiaro e aiuta a capire.

### Short Circuit Detection
- [ ] CircuitSolver: rilevare quando V+ connesso direttamente a GND
- [ ] Visual: flash rosso sui fili coinvolti + icona ⚠️ sulla breadboard
- [ ] Toast message: "⚠️ Cortocircuito rilevato! Controlla i collegamenti."
- [ ] Auto-pause: fermare la simulazione per proteggere il "circuito virtuale"

### Missing Connection Warnings
- [ ] Rilevare componenti con pin non collegati (LED con un solo pin connesso)
- [ ] Visual: pin disconnesso → cerchio arancione lampeggiante
- [ ] Hover sul cerchio → tooltip: "Questo pin non è collegato"

### Component Overload
- [ ] LED senza resistore → warning "LED senza resistore: potrebbe bruciarsi!"
- [ ] Resistore con valore troppo alto → "La corrente è troppo bassa per accendere il LED"

### Custom Modals (sostituire confirm())
- [ ] Creare `<ConfirmModal>` component (replace di window.confirm)
- [ ] Design: coerente col tema, bottoni 44px, animazione fade
- [ ] Usare per: reset, clearall, azioni distruttive

### CircuitState Sanitization (P2-NAN-5)
- [ ] Validare circuitState prima di inviarla a Galileo
- [ ] Rimuovere dati sensibili/inutili, limitare dimensioni

### 🧩 Scratch Gate (obbligatorio)
- [ ] SG1-SG10 — TUTTI PASS
- [ ] Extra: error feedback visibile anche quando si è nel tab Blocchi?

### Validazione Chrome
1. Creare cortocircuito → flash rosso + warning?
2. LED senza resistore → warning?
3. Componente non collegato → pin arancione?
4. `confirm()` → custom modal?
5. Zero regressioni: Ralph Loop Vol1+Vol3
