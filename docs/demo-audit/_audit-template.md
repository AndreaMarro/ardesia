# Audit demo — `<esp-id>`

**Template Sprint A workflow-v2 fase 1.** Copia + popola dati VERIFIED solo (NO inference, NO compiacere). Andrea mandate: NON COMPIACERMI.

---

## 1. Identità

| Campo | Valore |
|-------|--------|
| Volume | <1\|2\|3> |
| Capitolo | <numero capitolo libro> |
| Esperimento (libro) | ESPERIMENTO <N> |
| Titolo libro | <titolo verbatim PDF> |
| Titolo app | <titolo experiments-vol*.js> |
| ID repository | `<v?-cap?-esp?>` |
| Pagine PDF (stampate) | <pag1>-<pagN> |
| Pagine PDF (fisiche) | <pag1>-<pagN> se diverse |
| File PDF | `<filename.pdf>` |
| Reference manifest | `reference/vol<N>/<esp-id>/manifest.json` |
| File dati app | `src/data/experiments-vol<N>.js` |
| Lesson-path | `src/data/lesson-paths/<esp-id>.json` |
| bookGeometry | `src/data/book-geometry/<esp-id>.bookGeometry.json` |

## 2. Stato componenti (verbatim libro)

Lista componenti che IL LIBRO chiede esplicitamente:

| ID libro | Tipo | Valore/colore | Note |
|----------|------|---------------|------|
| | | | |

## 3. Stati visivi nel libro

Sequenza progressive del circuito come mostrato dalle illustrazioni libro:

- **state-01** (pag.X): <descrizione testuale verbatim o paraphrase fedele>
- **state-02** (pag.X): ...
- **state-final** (pag.X): ...

## 4. Topologia app corrente (da experiments-vol*.js)

```
pinAssignments:
  <da repo current state>

connections:
  <da repo current state>
```

## 5. Stato demo

### P0 bloccante (impedisce demo)
- [ ] (vuoto se nessuno)

### P1 importante (degrada qualità)
- [ ]

### P2 rifinitura
- [ ]

## 6. Gap rispetto a libro (workflow-v2 fase 5 componenti)

| Aspetto | Libro | Simulatore corrente | Severity |
|---------|-------|---------------------|----------|
| | | | |

## 7. Asset SVG status

- [ ] Asset esistono per tutti componenti
- [ ] Forma matcha libro
- [ ] Colori matchano kit Omaric + libro
- [ ] Scale coerenti tra componenti
- [ ] Pin footprint matcha pin spec libro

## 8. Wire path status

- [ ] visibleWires definite (da libro)
- [ ] hiddenElectricalConnections separate (logica solver, NON disegnate)
- [ ] Path curve confrontate con libro
- [ ] No fili extra rispetto a libro
- [ ] No fili che coprono testo libro

## 9. Verdetto

`<NON PRONTO | QUASI PRONTO | PRONTO DEMO>`

**Motivazione**: <1-3 frasi onesti>

## 10. Prossimi passi

1. (Sprint B/C/D/E)
2.
3.
