# Audit demo — `v1-cap6-esp3`

**Sprint A baseline 24/05/2026 03:00**. Variante luminosità (R variable). Andrea NON COMPIACERMI.

---

## 1. Identità

| Campo | Valore |
|-------|--------|
| Volume | 1 |
| Capitolo | 6 |
| Esperimento libro | ESPERIMENTO 3 |
| Titolo libro | "Per rendere il led più luminoso ci basta partire dal circuito che abbiamo" |
| Titolo app | "Cambiare luminosità" |
| ID repository | `v1-cap6-esp3` |
| Pagine PDF | 33 |
| File PDF | `VOL1_ITA_ COMPLETO V.0.1 GP.pdf` |
| File dati app | `src/data/experiments-vol1.js` |
| Lesson-path | `src/data/lesson-paths/v1-cap6-esp3.json` |
| bookGeometry | `src/data/book-geometry/v1-cap6-esp3.bookGeometry.json` (DA CREARE) |

## 2. Stato componenti (verbatim libro pag.33)

> "Per rendere il led più luminoso ci basta partire dal circuito che abbiamo"

Componenti = esp1 + variante valore R:

| ID libro | Tipo | Valore | Note |
|----------|------|--------|------|
| bat1 | battery9v | 9V | |
| bb1 | breadboard | half | |
| r1 | resistor | **220Ω default**, swap 470Ω, 1kΩ | confronto luminosità |
| led1 | LED | rosso | |

## 3. Stati visivi libro

- **state-01** pag.33: stesso circuito esp1 (riferimento back)
- **state-02-220** pag.33: variante 220Ω (più luminoso)
- **state-03-470** pag.33: variante 470Ω (medio)
- **state-04-1k** pag.33: variante 1kΩ (meno luminoso)

## 4. Topologia app corrente (handoff)

```
"Stesso layout esp1, R=220Ω default (cambia 220→470→1k)"

components: bat1, bb1, r1, led1=led-bridge red
pinAssignments: identici esp1 (r1:a2-a7, led1:e7/f7)
connections: identiche esp1 (4 wires)
```

## 5. Stato demo

### P0 bloccante
- [ ] **Reference PNG crops pag.33** MISSING per 3 stati R variant (220/470/1k)
- [ ] **bookGeometry MISSING**
- [ ] **R swap UX** — verificare: studente può cambiare R via properties panel? Handoff non chiarisce flow swap.
- [ ] **Luminosità LED variabile** — solver calcola correttamente brightness (P_led) in funzione di R? Visual rendering LED deve riflettere intensity.
- [ ] **Wire visibility 4 vs 2** (stesso esp1)

### P1 importante
- [ ] **R bande**: app deve aggiornare color bands SVG quando user cambia 220→470→1k. Handoff: "4 color bands E12 standard (220=red-red-brown-gold, 470=yellow-violet-brown-gold, 1k=brown-black-red-gold)". Verifica: live update?
- [ ] **Confronto educativo**: UI deve presentare side-by-side R values? Oppure swap sequenziale solo?

### P2
- [ ] Animazione transition luminosità su swap

## 6. Gap rispetto a libro

| Aspetto | Libro pag.33 | Simulatore | Severity |
|---------|--------------|------------|----------|
| 3 stati R variant | 220 / 470 / 1k illustrate | swap dynamic via properties | P0 verify |
| Luminosità visibile | LED più/meno luminoso illustrato | brightness calc verify | P0 verify |
| Bande color update | corrette per valore | dynamic SVG update verify | P1 |

## 7. Asset SVG status

- [x] Resistor con 3 color bands variants
- [x] LED + brightness state
- [ ] Brightness animation verify

## 8. Wire path

- [ ] 4 vs 2 stessa violazione

## 9. Verdetto

**NON PRONTO**. Topology elettrica ereditata da esp1 (OK), MA:
- swap R UX non chiaramente implementato (verify properties panel)
- 3 stati visivi 220/470/1k non testati
- brightness LED dinamico non confermato
- stessi gap reference/bookGeometry di esp1+esp2

## 10. Prossimi passi

1. Sprint B: 3 reference crops pag.33 (uno per valore R)
2. Sprint B: verify R-swap UX (properties panel o dropdown lezione)
3. Sprint B: verify brightness calc + rendering visivo
4. Sprint C: bookGeometry con `componentStates` per 3 valori R
