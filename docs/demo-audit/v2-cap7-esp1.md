# Audit demo — `v2-cap7-esp1`

**Sprint A baseline 24/05/2026 03:00**. Carica condensatore + multimetro. Andrea NON COMPIACERMI.

---

## 1. Identità

| Campo | Valore |
|-------|--------|
| Volume | 2 |
| Capitolo | 7 |
| Titolo capitolo | Che cosa sono i condensatori? |
| Esperimento libro | ESPERIMENTO 1 |
| Titolo libro | Effetto di scarica del condensatore elettrolitico |
| Titolo app | "Scarica condensatore + multimetro" |
| ID repository | `v2-cap7-esp1` |
| Pagine PDF | 67, 68 |
| File PDF | `VOL2_ITA_COMPLETO GP V 0.1.pdf` |
| File dati app | `src/data/experiments-vol2.js` |
| Lesson-path | `src/data/lesson-paths/v2-cap7-esp1.json` |
| bookGeometry | `src/data/book-geometry/v2-cap7-esp1.bookGeometry.json` (DA CREARE) |

## 2. Stato componenti (verbatim libro pag.67)

> "In questo esperimento osserveremo l'effetto di scarica del condensatore elettrolitico. Abbiamo bisogno di: un condensatore da 1000uF, un pulsante, il multimetro, un filo colorato, un resistore da 1kΩ. Imposta il multimetro su 20V in continua come fondo scala"

| ID libro | Tipo | Valore | Note |
|----------|------|--------|------|
| bat1 | battery9v | 9V | implicito (libro non menziona ma necessario per carica) |
| bb1 | breadboard | half | |
| c1 | capacitor | 1000μF elettrolitico | polarità +/− visibile su corpo |
| btn1 | push-button | 4-pin tactile | a cavallo gap centrale |
| mm1 | multimeter | giallo, 20V DC fondo scala | |
| r1 | resistor | 1kΩ | menzionato lista ma NON usato in handoff esp1 topology — vedi P0 |
| wire1 | wire colorata | jumper | btn → c+ |

**DISCREPANZA LIBRO ↔ HANDOFF**: libro pag.67 menziona "resistore 1kΩ" nei componenti necessari, ma handoff topology esp1 esplicita "NO R, NO LED". Handoff esp2 invece HA R 1kΩ. Verify: libro intende R per esp1 o per esp2 (esp2 dice "tre fili colorati, un resistore da 1kΩ" pag.69)? **VERBATIM AUDIT NEEDED**.

## 3. Stati visivi libro

- **state-01** pag.67: imposta MM 20V DC
- **state-02** pag.67: condensatore a cavallo separazione centrale, MM cavo nero su negativo cap, rosso su positivo cap
- **state-03** pag.67: pulsante accanto al condensatore, a cavallo gap
- **state-04** pag.68: filo colorato da un lato pulsante a positivo cap, premi → MM ~9V
- **state-final** pag.68: rilascia → tensione scende lentamente (scarica via probes MM resistenza interna alta)

## 4. Topologia app corrente (handoff baked round 8/9)

```
components: bat1, bb1, c1=1000µF, btn1=push-button, mm1=multimeter (NO R, NO LED)
pinAssignments:
  c1:positive = bb1:e14
  c1:negative = bb1:f14         # a cavallo gap centrale
  btn1:pin1 = bb1:e10
  btn1:pin2 = bb1:e12
  btn1:pin3 = bb1:f10
  btn1:pin4 = bb1:f12           # 4-pin tactile a cavallo gap

connections (7 wires):
  W1: bat+               → bus-top-plus-1            (red)
  W2: bus-top-plus-10    → a10                       (red, alimenta btn)
  W3: c12                → c14                       (btn out → cap+ — filo colorato libro)
  W4: f14                → bus-bot-minus-14          (black, cap- → rail bot)
  W5: bus-bot-minus-1    → bat-                      (black)
  W6: mm1:probe-positive → b14                       (cap+ misura)
  W7: mm1:probe-negative → g14                       (cap- bot section)
```

## 5. Stato demo

### P0 bloccante
- [ ] **Bug residuo handoff: multimetro discharge path** — "cap esp1 trattiene 9V dopo rilascio". Solver model: dopo rilascio btn, cap deve scaricare via probes MM (alta R interna probes). Modello fisico incompleto.
- [ ] **R 1kΩ libro ↔ app discrepanza** — verbatim PDF dice "resistore da 1kΩ" lista materiali pag.67. App esp1 NO R. Audit: errore PDF (dovrebbe essere esp2 only) o gap implementazione?
- [ ] **Reference crops pag.67-68 MISSING**
- [ ] **bookGeometry MISSING**
- [ ] **Wire colorato non-standard color**: libro dice "filo colorato" generico, app dovrebbe usare colore distintivo (verde? blu?) — NON red/black bus.

### P1 importante
- [ ] **MM 20V DC fondo scala UI**: simulatore deve mostrare display MM impostato 20V DC verbatim. Verify SVG MM display + range selector visibili.
- [ ] **Pulsante 4-pin orientation**: handoff specifica e10/e12/f10/f12 (a cavallo gap). Verify orientation matcha libro pag.67 (illustrazione pulsante).
- [ ] **Condensatore polarità visiva**: c+ vs c- segnato esplicitamente su SVG (libro mostra striscia negativa cilindrica).
- [ ] **Premi+rilascia UX**: interazione pulsante simulatore (click hold? toggle?). Libro: "premi pulsante → MM ~9V" implica hold.

### P2
- [ ] Animazione "scarica lenta" MM display (V scende continuous)
- [ ] Suono "click" pulsante

## 6. Gap rispetto a libro

| Aspetto | Libro pag.67-68 | Simulatore | Severity |
|---------|------------------|------------|----------|
| R 1kΩ lista materiali | menzionato | NO R | P0 audit verbatim |
| MM display 20V DC | esplicito | TBD verify | P1 |
| Discharge dopo rilascio | scarica lenta visibile | trattiene 9V (bug) | P0 |
| Wire colorato distintivo | "filo colorato" | TBD verify color | P1 |
| Polarità c+ c- visiva | striscia neg cilindrica | TBD verify SVG | P1 |

## 7. Asset SVG status

- [ ] Multimetro giallo libro-style (workflow-v2 fase 5 codex: "multimeter-book-yellow" da creare?)
- [ ] Condensatore elettrolitico orizzontale corpo nero + striscia neg (workflow-v2 fase 5)
- [ ] Push-button tactile 4-pin
- [x] Bb + battery9v riuso

## 8. Wire path

- [ ] 7 wires app vs libro: libro pag.67-68 mostra 4-5 wire visibili (filo colorato + nero negative + probes MM). App ha 7 = probabili 2 hidden rail jumpers (W2, W5).

## 9. Verdetto

**NON PRONTO**. Bug solver discharge bloccante (P0 handoff). Discrepanza R 1kΩ libro vs no-R app richiede verbatim re-audit. Asset MM + cap horizontal libro-style non confermati. 7 wires app vs ~5 libro = stesso anti-pattern fili extra.

## 10. Prossimi passi

1. **Sprint A integrare**: PDF crop pag.67 lista materiali → conferma R 1kΩ inteso per esp1 o solo esp2
2. **Sprint E priorità**: fix solver discharge path (cap → MM probes R interna)
3. **Sprint E**: asset SVG multimetro giallo + condensatore orizzontale libro-style (workflow-v2 fase 5)
4. **Sprint E**: bookGeometry con animation states (premi → 9V, rilascia → discharge curve)
