# Audit demo — `v1-cap6-esp2`

**Sprint A baseline 24/05/2026 03:00**. Anti-pattern educativo (LED senza R = brucia). Andrea NON COMPIACERMI.

---

## 1. Identità

| Campo | Valore |
|-------|--------|
| Volume | 1 |
| Capitolo | 6 |
| Esperimento libro | ESPERIMENTO 2 |
| Titolo libro | (anti-pattern: LED direttamente alla batteria → brucia) |
| Titolo app | "LED senza resistore" |
| ID repository | `v1-cap6-esp2` |
| Pagine PDF | 32 |
| File PDF | `VOL1_ITA_ COMPLETO V.0.1 GP.pdf` |
| File dati app | `src/data/experiments-vol1.js` |
| Lesson-path | `src/data/lesson-paths/v1-cap6-esp2.json` |
| bookGeometry | `src/data/book-geometry/v1-cap6-esp2.bookGeometry.json` (DA CREARE) |

## 2. Stato componenti (verbatim libro pag.32)

> "Il nostro circuito include un resistore, ma perché? Abbiamo detto che i resistori servono per limitare la corrente te lo ricordi? Ogni LED può sopportare una corrente massima che non deve essere superata altrimenti il led si rompe. [...] Se infatti colleghi per errore il LED direttamente alla batteria, il LED si brucia e potrebbe addirittura esplodere! [...] RICORDA: NON collegare MAI il LED direttamente alla batteria, ma inserisci sempre un resistore al centro!"

| ID libro | Tipo | Valore | Note |
|----------|------|--------|------|
| bat1 | battery9v | 9V | |
| bb1 | breadboard | half-size | |
| led1 | LED | rosso | NO resistore (anti-pattern educativo) |

## 3. Stati visivi libro

- **state-01** pag.32: spiegazione perché serve il resistore (testuale)
- **state-final** pag.32: anti-circuito LED direct → batteria con icona pericolo

## 4. Topologia app corrente (handoff baked)

```
components: bat1, bb1, led1=led-bridge red (NO R, NO mock)
pinAssignments: led1:anode=e7, led1:cathode=f7
connections (4 wires):
  W1 red:   bat+              → bus-top-plus-1
  W2 red:   bus-top-plus-7    → a7         # direct anode NO R
  W3 black: f7                → bus-bot-minus-7
  W4 black: bus-bot-minus-1   → bat-
```

## 5. Stato demo

### P0 bloccante
- [ ] **Reference PNG crop libro pag.32 MISSING** — anti-pattern figura.
- [ ] **bookGeometry MISSING**.
- [ ] **Visualizzazione "brucia"**: app deve mostrare LED-burn animation / flash + warning UNLIM. Verifica: implementato? Handoff non menziona burn-effect rendering.
- [ ] **Stessa violazione 4 fili visibili vs 2 libro** (vedi `v1-cap6-esp1.md` sec 5 P0).

### P1 importante
- [ ] **Anti-pattern UX**: simulatore deve EVIDENZIARE pericolo (warning rosso, vibrazione, sound). Pedagogia: ragazzi devono capire che il libro INSEGNA un errore per spiegare la regola.
- [ ] **Solver behavior**: senza R, current = V/R_led_only → overcurrent. Solver deve emit `LED_BURN` event a UNLIM context per spiegazione automatica?
- [ ] **Reversibilità**: dopo burn, esp deve resettare? Oppure LED resta "bruciato" finché studente non rimuove?

### P2
- [ ] Effetto visivo burn (animazione fade-to-black + crepa SVG)
- [ ] Sound effect "pop"

## 6. Gap rispetto a libro

| Aspetto | Libro pag.32 | Simulatore | Severity |
|---------|--------------|------------|----------|
| Warning visivo brucia | icona pericolo + testo grande | TBD verify | P1 |
| LED senza R | esplicito (anti-pattern) | OK NO R wired | OK |
| Wire count visibili | 2 (bat→bus+, bus−→bat−) + LED inserito | 4 (rail jumpers extra) | P0 FIX |

## 7. Asset SVG status

- [x] LED + LedBridge esistono
- [ ] LED burn animation asset — TBD verify
- [x] Battery9V + bb (riuso esp1)

## 8. Wire path

- [ ] Stesso problema 4 vs 2 visibleWires (vedi esp1)

## 9. Verdetto

**NON PRONTO**. Solver topology OK + anti-pattern correttamente implementato (no R). MA: rendering "brucia" non verificato, no reference crop, no bookGeometry, stessa violazione 4-wire vs 2-libro di esp1.

## 10. Prossimi passi

1. Sprint B: crop pag.32 + manifest update
2. Sprint B: implementare LED-burn visualization (UI feedback + UNLIM event)
3. Sprint B: applicare stessa wire-visibility refactor di esp1
4. Sprint C: BookGeometryRenderer animation states
