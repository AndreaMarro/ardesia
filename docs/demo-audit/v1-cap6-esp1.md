# Audit demo — `v1-cap6-esp1`

**Sprint A baseline audit 24/05/2026 03:00**. Workflow-v2 fase 1. Honest gap analysis pre-Sprint B bake. NON COMPIACERMI.

---

## 1. Identità

| Campo | Valore |
|-------|--------|
| Volume | 1 |
| Capitolo | 6 |
| Titolo capitolo | Cos'è il diodo LED? |
| Esperimento (libro) | ESPERIMENTO 1 |
| Titolo libro | Accendi il tuo primo LED |
| Titolo app | "Primo LED" / "Accendi primo LED" |
| ID repository | `v1-cap6-esp1` |
| Pagine PDF stampate | 29, 30, 31 |
| Pagine PDF fisiche | 29, 30, 31 (verified pdftotext) |
| File PDF | `VOL1_ITA_ COMPLETO V.0.1 GP.pdf` |
| Reference manifest | `reference/vol1/v1-cap6-esp1/manifest.json` |
| File dati app | `src/data/experiments-vol1.js` |
| Lesson-path | `src/data/lesson-paths/v1-cap6-esp1.json` |
| bookGeometry | `src/data/book-geometry/v1-cap6-esp1.bookGeometry.json` (DA CREARE Sprint B) |

## 2. Stato componenti (verbatim libro pag.29)

> "Per accendere il LED e fare il nostro primo esperimento abbiamo bisogno di: Un LED, sceglilo del colore che ti piace di più! Una breadboard. Una batteria 9V. La clip per la batteria 9V. Un resistore da 470 Ohm: spiegheremo dopo perché. Ti ricordi i colori?(Giallo Viola Marrone)"

| ID libro | Tipo | Valore/colore | Note |
|----------|------|---------------|------|
| bat1 | battery9v + clip | 9V | clip terminals esce orizzontale |
| bb1 | breadboard | half-size 830 holes | orientamento orizzontale (libro Vol1 PDF) |
| r1 | resistor | 470Ω giallo-viola-marrone-oro | E12 4-band standard |
| led1 | LED | rosso (default, colore a piacere) | gambetta lunga = anodo |

## 3. Stati visivi libro (sequenza pagine)

- **state-01** pag.30: clip della batteria collegata alla batteria
- **state-02** pag.30: positivo batteria → striscia rossa superiore bb
- **state-03** pag.30: resistore 470Ω tra striscia rossa e zona sotto
- **state-04** pag.30: LED gambetta lunga verso R, gambetta corta zona sotto divisione centrale
- **state-final** pag.31: negativo batteria → stessa colonna gambetta corta LED → MAGIA

## 4. Topologia app corrente (`experiments-vol1.js` handoff baked round 7)

```
components: bat1, bb1, r1=470Ω, led1=led-bridge red
pinAssignments:
  r1:pin1 = bb1:a2
  r1:pin2 = bb1:a7        # 5-col span (=37.5px pin distance)
  led1:anode = bb1:e7
  led1:cathode = bb1:f7   # led-bridge variant attraversa gap

connections (4 wires):
  W1 red:   bat1:positive       → bb1:bus-top-plus-1
  W2 red:   bb1:bus-top-plus-2  → bb1:a2
  W3 black: bb1:f7              → bb1:bus-bot-minus-7
  W4 black: bb1:bus-bot-minus-1 → bat1:negative
```

## 5. Stato demo

### P0 bloccante
- [ ] **Reference PNG crops MISSING** — no `reference/vol1/v1-cap6-esp1/page-030-*.png`. Solo manifest scheletro. Sprint B fase 3.
- [ ] **bookGeometry MISSING** — solo schema globale. Esp-specific file da creare.
- [ ] **Visual diff vs libro MAI eseguito** — claim "pixel-perfect baked" handoff = self-claim, non validato.
- [ ] **Wire path canonico vs libro** — handoff dice "4 wires da batteria", libro pag.30 mostra solo "Collega il positivo batteria → striscia rossa" + "negativo → colonna gambetta corta" = 2 wire visibili nel libro. App ha 4 wire (incluso bus-top-plus-2 → a2 + bus-bot-minus-1 → bat-). Questo è anti-pattern workflow-v2 fase 8 (filo extra rispetto a libro).

### P1 importante
- [ ] **LedBridge variant** ≠ libro Vol1 pag.30. Libro mostra LED CON GAMBE DIVARICATE in fori adiacenti (gambetta lunga + gambetta corta = colonne diverse), NON variant che attraversa gap. Vedi handoff "bug residui Vol1 bb verticale" — Andrea preferisce book-faithful.
- [ ] **Asset SVG batteria9V verbatim libro** — verificare proporzioni clip + corpo rispetto a foto libro pag.29.
- [ ] **Resistor color bands** — verbatim libro "Giallo Viola Marrone" = 470Ω 3-band. Handoff dice "E12 standard 4-band giallo-viola-marrone-oro" = corretto ma libro ne menziona 3.

### P2 rifinitura
- [ ] Antialiasing fili
- [ ] Ombre componenti
- [ ] Scala batteria vs breadboard relativa libro

## 6. Gap rispetto a libro (componente)

| Aspetto | Libro pag.30 | Simulatore corrente | Severity |
|---------|--------------|---------------------|----------|
| LED forma | gambe divaricate visibili, anodo+catodo colonne diverse | led-bridge (variante gap) | P1 ASSET |
| Wire count visibili | 2 wire (bat→bus+, bus−→bat−) + R/LED visibili inseriti | 4 wire (include bus−rail jumper) | P0 FIX |
| Resistor bands | giallo-viola-marrone (3) | giallo-viola-marrone-oro (4) | P2 |
| Breadboard orientamento | verticale long-side vertical (Andrea preferenza) | orizzontale | DEFERRED post-demo (handoff layout bug) |

## 7. Asset SVG status

- [x] Asset esistono: Battery9V.jsx, Resistor.jsx, Led.jsx, LedBridge variant
- [ ] Forma matcha libro (R bande standard OK, LED bridge ≠ libro)
- [x] Colori palette ELAB applicati
- [x] Scale coerenti tra componenti (handoff: R body 8px, leads 14.75px each = 5-col span 37.5px)
- [ ] Pin footprint matcha libro (5-col span OK per R, LED bridge problematico)

## 8. Wire path status

- [ ] visibleWires definite (da libro) — DA CREARE bookGeometry
- [ ] hiddenElectricalConnections separate — workflow-v2 fase 8 PENDING
- [ ] Path curve confrontate con libro — NESSUN visual diff eseguito
- [ ] No fili extra — **VIOLATA** (4 vs 2 libro)
- [x] No fili coprono testo libro (N/A nessun crop ancora)

## 9. Verdetto

**QUASI PRONTO** (handoff self-claim "pixel-perfect baked") → **NON PRONTO** (audit onesto Sprint A).

**Motivazione**: la topologia elettrica nel solver è corretta (5 esp baked round 7 commit ecf01b70), MA workflow-v2 mandate richiede separazione visibleWires (libro 2) ↔ hiddenElectricalConnections (rail jumpers interni 2). App attualmente disegna 4 fili visibili — anti-pattern workflow-v2 fase 8. LedBridge variant ≠ libro pag.30 (gambe divaricate normali). Nessun reference PNG crop esiste. Nessun visual diff vs libro mai eseguito.

## 10. Prossimi passi (Sprint B priorità)

1. **Sprint B fase 3**: pdftotext + crop tools per estrarre `reference/vol1/v1-cap6-esp1/page-030-step-{01..04}.png` + `page-031-final.png`
2. **Sprint B fase 7**: rimodellare wire visibility — bus-rail jumpers diventano `hiddenElectricalConnections`, solo bat+→bus+ e bus−→bat− restano `visibleWires`
3. **Sprint B fase 5**: sostituire led-bridge variant con LED standard splay+ (gambe divaricate libro) — handoff già implementa splay+ in `Led.jsx`
4. **Sprint C**: BookGeometryRenderer renderizza bookGeometry su `<NewElabSimulator>` mount per esp demo locked
5. **Sprint F**: visual diff automatizzato tutorScreenshot ↔ reference crop, threshold P0/P1/P2
