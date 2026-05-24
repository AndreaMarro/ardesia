# Audit demo — `v2-cap7-esp2`

**Sprint A baseline 24/05/2026 03:00**. Carica+scarica condensatore con LED rosso. Andrea NON COMPIACERMI.

---

## 1. Identità

| Campo | Valore |
|-------|--------|
| Volume | 2 |
| Capitolo | 7 |
| Esperimento libro | ESPERIMENTO 2 |
| Titolo libro | (continua scarica condensatore con LED) |
| Titolo app | "Scarica con LED rosso" |
| ID repository | `v2-cap7-esp2` |
| Pagine PDF | 69, 70 |
| File PDF | `VOL2_ITA_COMPLETO GP V 0.1.pdf` |
| File dati app | `src/data/experiments-vol2.js` |
| Lesson-path | `src/data/lesson-paths/v2-cap7-esp2.json` |
| bookGeometry | `src/data/book-geometry/v2-cap7-esp2.bookGeometry.json` (DA CREARE) |

## 2. Stato componenti (verbatim libro pag.69)

> "In questo esperimento continueremo ad osservare l'effetto di scarica del condensatore. Per questo esperimento abbiamo bisogno di: un condensatore da 1000uF, un pulsante, un LED rosso, il multimetro, tre fili colorati, un resistore da 1kΩ. Inserisci il pulsante a cavallo della divisione centrale della breadboard e collega la batteria come mostrato in figura"

| ID libro | Tipo | Valore | Note |
|----------|------|--------|------|
| bat1 | battery9v | 9V | "collega la batteria come mostrato in figura" pag.69 |
| bb1 | breadboard | half | |
| c1 | capacitor | 1000μF elettrolitico | negativo verso basso |
| btn1 | push-button | 4-pin tactile | a cavallo gap |
| led1 | LED | rosso | catodo → GND rail |
| mm1 | multimeter | giallo, 20V DC | misura cap |
| r1 | resistor | 1kΩ | tra cap+ e altro punto bb (current limit LED + discharge path) |
| wires | 3 fili colorati | jumper | |

## 3. Stati visivi libro

- **state-01** pag.69: pulsante a cavallo gap + batteria collegata
- **state-02** pag.69: condensatore accanto pulsante, neg basso, pos all'altro lato pulsante
- **state-03** pag.70: cap negativo → batteria negativo via filo
- **state-04** pag.70: resistore tra cap positivo e altro punto bb
- **state-final** pag.70: LED + MM (libro implica completamento circuito, illustrazione pag.70 fine sequenza)

## 4. Topologia app corrente (handoff baked)

```
components: bat1, bb1, c1=1000µF, btn1, led1=led-bridge red, r1=1kΩ, mm1
pinAssignments:
  c1:positive = bb1:e14
  c1:negative = bb1:f14
  btn1:pin1 = bb1:e10, pin2 = bb1:e12, pin3 = bb1:f10, pin4 = bb1:f12   # 4-pin
  r1:pin1 = bb1:a14
  r1:pin2 = bb1:a19           # 5-col span
  led1:anode = bb1:e19
  led1:cathode = bb1:f19      # led-bridge gap

connections (8 wires):
  W1: bat+               → bus-top-plus-1
  W2: bus-top-plus-10    → a10                    (red, btn)
  W3: c12                → c14                    (btn out → cap+)
  W4: f14                → bus-bot-minus-14       (cap- → rail bot)
  W5: f19                → bus-bot-minus-19       (LED catodo → GND)
  W6: bus-bot-minus-1    → bat-
  W7: mm1:probe-positive → b14                    (cap+ misura)
  W8: mm1:probe-negative → g14                    (cap- bot section)
```

## 5. Stato demo

### P0 bloccante
- [ ] **Reference crops pag.69-70** MISSING
- [ ] **bookGeometry** MISSING
- [ ] **3 fili colorati libro**: libro esplicita "tre fili colorati". App ne ha 8 totali (incluse rail jumpers). Mapping libro 3 ↔ app 8 = stesso anti-pattern fili extra workflow-v2 fase 8.
- [ ] **Discharge path bug ereditato esp1** — fix solver MM probes R interna applicabile anche qui (con R 1kΩ aggiunge discharge path esplicito).
- [ ] **Sequenza pag.69-70 build steps**: libro è chiaro 4-step (btn → cap → cap-neg-wire → R). App buildSteps verify match.

### P1 importante
- [ ] **Polarità cap "negativo rivolto verso il basso"**: libro pag.69 verbatim. App pinAssignments c1:negative=f14 = riga bottom section bb? Verify che SVG cap mostri striscia neg verso bot.
- [ ] **R 1kΩ posizione**: handoff a14-a19 (5-col span). Libro: "tra cap+ e altro punto della breadboard" = vago. Verbatim match implementabile?
- [ ] **LED a fine sequenza**: libro implica LED + MM aggiunti a end. App li ha già montati in `already-mounted` mode. Passo-passo deve nasconderli fino state-final.
- [ ] **Filo "negativo cap → negativo batteria"**: libro pag.70 esplicito wire colorato per questo. App W4 (f14 → bus-bot-minus-14) + W6 (bus-bot-minus-1 → bat-) = SOMMA di 2 wire app = 1 wire libro. Anti-pattern.

### P2
- [ ] LED rosso brightness varia con tensione cap (discharge curve)
- [ ] MM display animato

## 6. Gap rispetto a libro

| Aspetto | Libro pag.69-70 | Simulatore | Severity |
|---------|------------------|------------|----------|
| Wire count visibili | ~5 visibili (3 colorati + neg bat + filo cap-bat) | 8 app | P0 FIX |
| R posizione | "tra cap+ e altro punto bb" generico | a14-a19 specifico | P1 verbatim verify |
| Polarità cap visiva | striscia neg verso basso | TBD verify SVG | P1 |
| Build steps libro | 4 steps esplicit | TBD verify buildSteps[] | P0 sync |

## 7. Asset SVG status

- [ ] Multimetro libro-style (workflow-v2 fase 5)
- [ ] Cap 1000μF horizontal libro-style
- [ ] LED + LedBridge (riuso esp1 Vol1 — same caveat asset)
- [x] Push-button 4-pin (handoff aggiornato esp1+2 Vol2)

## 8. Wire path

- [ ] 8 vs 5 visibleWires gap

## 9. Verdetto

**NON PRONTO**. Esperimento più complesso (8 connessioni vs ~5 libro). buildSteps[] match libro 4-stadio NON verificato. Polarità cap visiva + posizione R generica NON validate. Stessi gap reference/bookGeometry/discharge solver di esp1.

## 10. Prossimi passi

1. Sprint B: 5 crops pag.69-70 (1 per state)
2. Sprint E: validate buildSteps[] 4-stadio match libro (btn → cap → wire neg → R)
3. Sprint E: fix discharge solver (eredita fix esp1)
4. Sprint E: bookGeometry con 5 step visibility
5. Sprint E: asset SVG MM giallo + cap orizzontale
