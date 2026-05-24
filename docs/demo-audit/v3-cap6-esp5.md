# Audit demo — `v3-cap6-esp5`

**Sprint A baseline 24/05/2026 03:00**. Semaforo 3 LED. Topology RESET handoff. Andrea NON COMPIACERMI.

---

## 1. Identità

| Campo | Valore |
|-------|--------|
| Volume | 3 |
| Capitolo | 6 |
| Titolo capitolo | I pin digitali: le dita di Arduino |
| Esperimento libro | ESPERIMENTO 5 |
| Titolo libro | Il semaforo |
| Titolo app | "Semaforo" |
| ID repository | `v3-cap6-esp5` |
| Pagine PDF stampate | 57, 58, 59 (claim handoff) |
| Pagine PDF fisiche | **38 verified pdftotext V0.8.1** |
| File PDF | `Manuale VOLUME 3 V0.8.1.pdf` |
| File dati app | `src/data/experiments-vol3.js` |
| Lesson-path | `src/data/lesson-paths/v3-cap6-esp5.json` |
| bookGeometry | `src/data/book-geometry/v3-cap6-esp5.bookGeometry.json` (DA CREARE Sprint D) |

## 2. Stato componenti (verbatim libro PDF pag.38)

> "ESPERIMENTO 5: Il semaforo. Un semaforo è solo: un link con più fasi. LED: Verde → pin [valore parzialmente OCR'd], Giallo → pin 6, Rosso → pin 7. Sequenza V3-1-3 R..."

| ID libro | Tipo | Valore | Note |
|----------|------|--------|------|
| nano | Arduino Nano R4 | AVR | breakout |
| bb1 | breadboard | half | |
| led_verde | LED | verde | pin Arduino TBD verbatim |
| led_giallo | LED | giallo | pin Arduino **6** verbatim |
| led_rosso | LED | rosso | pin Arduino **7** verbatim |
| r1, r2, r3 | resistor | 220Ω x 3 | current limit ciascun LED |

## 3. Stati visivi libro

- **state-01** pag-pdf38: 3 LED verticali sequenza semaforo (verde top, giallo mid, rosso bot — convenzione libro)
- **state-02** pag-pdf38: pin assignments verde/giallo/rosso → pin Arduino
- **state-03** pag-pdf38: ciascun LED via resistor 220Ω
- **state-04** pag-pdf38: GND comune rail
- **state-code** pag-pdf38: codice sequenza temporizzata (V → G → R cycle)

## 4. Topologia app corrente

```
HANDOFF: "NON ancora pixel-perfect baked. Reverted a base origin/main 4d75c0ca topology."
```

**Topologia attuale = base origin/main pre-demo** — NON validata vs libro V0.8.1.

## 5. Stato demo

### P0 bloccante
- [ ] **Topology RESET** — Sprint D mandatory re-bake da zero.
- [ ] **Pin LED verde verbatim**: PDF V0.8.1 pag.38 testo "Verde → pin" senza numero leggibile OCR. Andrea verify zoom PDF.
- [ ] **DISCREPANZA Codex review vs libro**: codex adversarial review section §22 codice example claim "LED verde → pin 5, LED giallo → pin 6, LED rosso → pin 9". Libro V0.8.1 pag.38 verbatim **giallo → 6 + rosso → 7**. Codex SBAGLIATO o libro V0.8.1 ≠ Vol3 finale. **Andrea verifica canone**.
- [ ] **Pagine printed↔pdf mapping** stesso problema esp4 (handoff dice pag.57-59 stampate, PDF V0.8.1 = pag.38).
- [ ] **Wire-code sync 3 LED**: codice digitalWrite sequenza V→G→R deve highlight visualmente. NON validato.
- [ ] **Reference crops** MISSING
- [ ] **bookGeometry** MISSING

### P1 importante
- [ ] **Sequenza temporizzata semaforo**: libro mostra ordine V (3sec) → G (1sec) → R (3sec) standard. App codice match?
- [ ] **Disposizione LED bb**: verticale (sequenza semaforo verticale) o orizzontale? Libro illustra setup specifico.
- [ ] **R 220Ω x 3 bande**: red-red-brown-gold
- [ ] **GND comune rail**: tutti 3 catodi → bus-bot-minus

### P2
- [ ] Animazione transizione fasi semaforo
- [ ] Sound semaforo (opzionale)

## 6. Gap rispetto a libro

| Aspetto | Libro V0.8.1 pag-pdf38 | Codex review claim | Simulatore | Severity |
|---------|------------------------|---------------------|------------|----------|
| Pin verde | "→ pin" OCR partial | 5 | TBD repo | P0 verbatim |
| Pin giallo | 6 verbatim | 6 | TBD repo | P0 verify |
| Pin rosso | 7 verbatim | 9 (errato vs libro V0.8.1) | TBD repo | **P0 CANONE CLASH** |
| Sequenza temp | V3-1-3 R | non menziona | TBD codice | P1 |
| Layout LED bb | verticale (illustrazione) | non menziona | TBD | P1 |

## 7. Asset SVG status

- [ ] NanoR4Board SVG verify (eredita Sprint D esp4)
- [ ] 3 LED colori distinti (verde, giallo, rosso) — verify saturation libro-faithful
- [ ] 3 Resistor 220Ω bande
- [ ] GND rail jumper visibili

## 8. Wire path

- [ ] visibleWires 3 wire pin Arduino → R → LED + 3 catodo → GND
- [ ] Stile angolare corto Vol3 (workflow-v2 fase 7)

## 9. Verdetto

**NON PRONTO** — topology RESET + canone clash pin rosso (libro V0.8.1 = 7, codex review = 9). Andrea **VERIFICA URGENTE** quale libro è canone (V0.8.1 manuale vs Vol3 finale stampato). Sprint D blocker fino risoluzione.

## 10. Prossimi passi (Sprint D blocker-resolve first)

1. **Andrea verifica visuale**: PDF V0.8.1 pag.38 zoom → conferma pin verde verbatim + valida pin rosso 7 vs 9
2. **Canone clarify**: V0.8.1 manuale = libro stampato Andrea? Oppure esiste Vol3 finale diverso? (handoff cita Vol3 pag.57-59 — esiste un Vol3 V1.0 oltre V0.8.1?)
3. **Reference crops pag-pdf38**: 5 state crops (3 LED setup + code + sequenza)
4. **Asset audit**: NanoR4Board + 3 LED colorati saturation
5. **bookGeometry** wire style angolare modulare + 3 LED canonicalPose
6. **Code sample** verbatim libro sequenza temporizzata
7. **Pin-code sync UX**: durante simulazione AVR, evidenzia LED + filo del pin attivo correntemente
8. **buildSteps[]** matcha sequenza assembly libro (V → G → R + GND)
