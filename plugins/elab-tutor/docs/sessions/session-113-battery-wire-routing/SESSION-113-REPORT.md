# Session 113 Report — Battery Wire Routing V6

**Data**: 10/03/2026
**Commit**: `c8ee45b`
**Sessione precedente**: S112 (`828e7ed`) — Breadboard Hole Grid Audit

## Problema
I fili della batteria 9V si attorcigliavano e sovrapponevano. Il routing era basato su path diretti a 2 punti che si affidavano al sag (gravita simulata) per la separazione visiva — insufficiente e inaffidabile.

## Root Cause
`routeToBreadboardPin()` in `WireRenderer.jsx` restituiva un path diretto `[offPos, bbPinPos]` per tutti i fili batteria. La funzione `computeSag()` aggiungeva una curva di gravita ma non garantiva separazione tra il filo + e il filo -.

## Fix Applicato — V6 L-Shape Routing

### Evoluzione della soluzione
- **V5 (midpoint)**: Lane basate sul punto medio tra batteria e breadboard. Problema: i pin della batteria sono distanti 26px in Y, e i bus rail della breadboard 7.5px — i midpoint individuali divergono, dando solo 2.5-7px di separazione.
- **V6 (bbX/bbY anchor)**: Lane ancorate al bordo della breadboard (bbX per orizzontale, bbY per verticale). Reference point condiviso = separazione esattamente LANE_SEP (14px) garantita.

### Codice modificato
**File**: `src/components/simulator/canvas/WireRenderer.jsx`
**Funzione**: `routeToBreadboardPin(offPos, bbPinPos, bbX, bbY)`

```
Caso orizzontale (|dx| >= |dy|):
  Filo +: riser verticale a bbX - LANE_SEP * sign
  Filo -: riser verticale a bbX - 2*LANE_SEP * sign
  → Separazione: esattamente 14px

Caso verticale (|dy| > |dx|):
  Filo +: riser orizzontale a bbY - LANE_SEP * sign
  Filo -: riser orizzontale a bbY - 2*LANE_SEP * sign
  → Separazione: esattamente 14px
```

Path a 4 punti (waypoints) renderizzati da `buildRoutedPath()` come segmenti ortogonali con curve quadratiche Bezier (R=15) agli angoli.

### Parametri
- `LANE_SEP = 14` — separazione tra le corsie dei fili (requisito >= 10px)
- `R = 15` — raggio curvatura angoli (in buildRoutedPath)
- Soglia distanza minima: `absDx + absDy < 30` → path diretto (componenti molto vicini)

## File Modificati
| File | Modifica |
|------|----------|
| `src/components/simulator/canvas/WireRenderer.jsx` | `routeToBreadboardPin()` V4→V6: da 2 punti diretti a 4 punti L-shape con lane ancorate |
| `docs/skills/wire-routing-test.md` | Nuovo: skill di test con 6 procedure (T1-T6) + script JS console |

## COV — Chain of Verification

| # | Test | Risultato | Note |
|---|------|-----------|------|
| 1 | v1-cap6-esp1 (batteria a sinistra) | **PASS** | Separazione 14px, risers red x=86 / black x=72 |
| 2 | v1-cap6-esp2 (secondo esperimento) | **PASS** | Separazione 14px |
| 3 | v1-cap7-esp1 (altro capitolo) | **PASS** | Separazione 14px |
| 4 | Batteria a destra (programmatic) | **PASS** | Separazione 14px |
| 5 | Batteria sopra (programmatic) | **PASS** | Separazione 14px (V6 fix) |
| 6 | Zoom 50%/100%/200% | **PASS** | Curve smooth, fili distinguibili |

**Risultato**: 6/6 PASS

## Regression Test
- Caricato v1-cap7-esp1: batteria, fili, LED, resistore tutti visibili e posizionati correttamente
- Snap fori breadboard (S112): nessuna regressione
- Build: 0 errori, `npm run build` completato

## Deploy
- **GitHub**: `c8ee45b` pushed to `origin/main`
- **Vercel**: https://www.elabtutor.school — production deploy OK
- **Build time**: 1m 40s, 0 errors

## Metriche
- Linee aggiunte: ~150 (routing logic + skill doc)
- Linee rimosse: ~8 (vecchio path diretto)
- File toccati: 2
- Zero regressioni
