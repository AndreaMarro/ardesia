# Audit demo — `v3-cap6-esp4`

**Sprint A baseline 24/05/2026 03:00**. Due LED stile sirena polizia. Topology RESET handoff. Andrea NON COMPIACERMI.

---

## 1. Identità

| Campo | Valore |
|-------|--------|
| Volume | 3 |
| Capitolo | 6 |
| Titolo capitolo | I pin digitali: le dita di Arduino |
| Esperimento libro | ESPERIMENTO 4 |
| Titolo libro | PROGRAMMA LUCI LAMPEGGIANTE STILE SIRENATO 2 — Due LED: effetto "polizia" |
| Titolo app | "Due LED alternano" |
| ID repository | `v3-cap6-esp4` |
| Pagine PDF stampate | 54, 55, 56 (claim handoff) |
| Pagine PDF fisiche | **37 verified pdftotext V0.8.1** |
| File PDF | `Manuale VOLUME 3 V0.8.1.pdf` |
| File dati app | `src/data/experiments-vol3.js` |
| Lesson-path | `src/data/lesson-paths/v3-cap6-esp4.json` |
| bookGeometry | `src/data/book-geometry/v3-cap6-esp4.bookGeometry.json` (DA CREARE Sprint D) |

## 2. Stato componenti (verbatim libro PDF pag.37)

> "ESPERIMENTO 4: PROGRAMMA LUCI LAMPEGGIANTE STILE SIRENATO 2. Due LED: effetto 'polizia'. Prova a usare: LED 1 → pin [valore parzialmente OCR'd PDF — verify verbatim with Andrea]. Collega: LED 2 → pin 9. Programma: uno acceso, l'altro spento, poi si scambiano. Risultato: luci lampeggianti stile sirena."

| ID libro | Tipo | Valore | Note |
|----------|------|--------|------|
| nano | Arduino Nano R4 | AVR / RA4M1 | breakout |
| bb1 | breadboard | half | |
| led1 | LED | colore TBD (libro dice "LED 1") | pin Arduino TBD verbatim |
| led2 | LED | colore TBD (libro dice "LED 2") | pin Arduino 9 |
| r1, r2 | resistor | 220Ω x 2 (default Vol3 LED) | current limit |

## 3. Stati visivi libro

- **state-01** pag-pdf37: 2 LED su bb (colori diversi)
- **state-02** pag-pdf37: LED1 anodo → pin Arduino via R
- **state-03** pag-pdf37: LED2 anodo → pin 9 via R
- **state-04** pag-pdf37: catodi → GND rail
- **state-code** pag-pdf37: codice digitalWrite alternato + delay

## 4. Topologia app corrente

```
HANDOFF VERBATIM: "v3-cap6-esp4 + v3-cap6-esp5 (Nano R4 demo, AVR)
NON ancora pixel-perfect baked. Reverted a base origin/main 4d75c0ca topology.
Andrea può ribasarli manualmente come libro Vol3 pag.54+57."
```

**Topologia attuale = base origin/main pre-demo** — NON validata vs libro V0.8.1.

## 5. Stato demo

### P0 bloccante
- [ ] **Topology RESET** — Sprint D mandatory re-bake da zero seguendo workflow-v2 15 fasi.
- [ ] **Pin assignment LED1 verbatim**: libro V0.8.1 pag-pdf37 pin LED1 parzialmente OCR'd (text estratto "→ pin" senza numero leggibile). Andrea verify PDF visivo.
- [ ] **Pagine printed↔pdf mapping**: handoff dice "Vol3 pag.54-56" ma PDF fisico V0.8.1 = pag.37. Verify quale è il "libro stampato" referente per Andrea (Manuale V0.8.1 vs Vol3 finale).
- [ ] **Nano R4 SVG** vs kit Omaric: workflow-v2 fase 5 asset-inspector verbatim coerenza Morfismo Sense 2.
- [ ] **Wire style angolare corto Vol3** (workflow-v2 fase 7): NON implementato.
- [ ] **Pin-code visual sync**: codice digitalWrite(pin, HIGH) deve highlight visualmente il filo+LED associato. NON validato.
- [ ] **Reference crops** MISSING
- [ ] **bookGeometry** MISSING

### P1 importante
- [ ] **2 colori LED diversi**: libro non specifica colori esatti. App default? Verify experiments-vol3.js.
- [ ] **R 220Ω vs 470Ω**: Vol3 Arduino default R 220Ω (forward-bias LED 5V). Verify.
- [ ] **Codice sample** in app matcha libro pag-pdf37?
- [ ] **Compile + upload UX**: Vol3 = Arduino Nano R4 breakout, compile via n8n + upload simulator AVR. End-to-end demo flow validato?

### P2
- [ ] Animazione alternanza visuale "sirena polizia"
- [ ] Sound effect (opzionale)

## 6. Gap rispetto a libro

| Aspetto | Libro V0.8.1 pag-pdf37 | Simulatore | Severity |
|---------|------------------------|------------|----------|
| Pin LED1 | "→ pin" (OCR partial) | TBD repo | P0 verbatim verify |
| Pin LED2 | 9 (verbatim) | TBD repo | P0 verify |
| Nano R4 SVG | matcha kit Omaric | TBD asset audit | P0 |
| Wire style | angolare corto modulare | TBD verify | P0 |
| Code-circuit sync | codice ↔ LED match | TBD verify | P0 |

## 7. Asset SVG status

- [ ] NanoR4Board SVG verify vs foto kit Omaric (workflow-v2 fase 5 asset-inspector)
- [ ] LED Vol3 style (vs Vol1 LED — diverso?)
- [ ] Resistor 220Ω bande (red-red-brown-gold)
- [ ] Jumper wires angolari corti (style "vol3-short-orthogonal-jumper" workflow-v2)

## 8. Wire path

- [ ] visibleWires Vol3 style angolare modulare (NON soft-curve Vol1)
- [ ] hiddenElectricalConnections per VCC + GND rail bus
- [ ] Codice ↔ wire sync animation

## 9. Verdetto

**NON PRONTO** — topology RESET handoff esplicito. Sprint D mandatory re-bake from scratch seguendo workflow-v2 15 fasi. Mapping pagine printed↔pdf discrepancy da risolvere con Andrea verbatim. Pin LED1 OCR partial = blocker bake fino verifica visiva PDF.

## 10. Prossimi passi (Sprint D)

1. **Andrea verifica visuale**: PDF V0.8.1 pag.37 zoom → conferma pin LED1 verbatim
2. **Mapping printed↔pdf**: chiarire se "Vol3 pag.54-56" = printed in stampa cartacea (PDF mostra solo 37 V0.8.1 manuale)
3. **Reference crops pag-pdf37**: 4 state crops + code crop
4. **Asset audit**: NanoR4Board vs foto kit Omaric pixel-by-pixel
5. **bookGeometry** con wire style angolare + componente poses
6. **buildSteps[]** matcha sequenza libro
7. **Code sample** matcha verbatim libro
8. **Pin-code sync** implementazione (eventi __ELAB_API.unlim.highlightPin durante runtime simulazione)
