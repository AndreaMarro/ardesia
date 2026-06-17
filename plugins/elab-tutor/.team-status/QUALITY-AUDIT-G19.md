# Quality Audit — G19 (2026-03-29)
## Massima onesta, zero sconti

### SCORE CARD

| Metrica | Prima | Dopo | Target | Status |
|---------|-------|------|--------|--------|
| Font < 14px (screen) | 1 | **0** | 0 | PASS |
| Font < 14px (PDF) | 30 | 30 | N/A* | N/A |
| Touch < 44px | 2 | **0** | 0 | PASS |
| console.log raw | 1 | 1** | 0 | PASS |
| Build time | 39.7s | 39.7s | < 60s | PASS |
| Dead code files | ~17K LOC | ~17K LOC | - | WARN |
| Runtime errors | 1 | **0** | 0 | PASS |
| Test suite | 911/911 | 911/911 | 911 | PASS |
| Broken imports | 0 | 0 | 0 | PASS |
| Input focus consistency | FAIL | **PASS** | PASS | PASS |
| Bundle main chunk | 1118 KB | 1118 KB | < 1200 | PASS |
| WCAG AA compliance | ~99% | ~100% | > 95% | PASS |

*\* Font sizes in PDF files (react-pdf) use typographic points, not screen pixels — exempt*
*\*\* Intentional copyright notice in browser console — exempt*

### BUGS TROVATI E FIXATI

1. **electronViewEnabled ReferenceError** — L'automa ha cancellato ElectronView.jsx ma ha lasciato il riferimento `electronViewEnabled={electronViewEnabled}` in NewElabSimulator.jsx:843. Crash a runtime nel simulatore. **FIXATO** (rimosso prop, default=false in SimulatorCanvas).

2. **Touch target .v4-zoom-btn 36px** — Bottone zoom nel tutor sotto il minimo WCAG di 44px. **FIXATO** (36→44px).

3. **Touch target "Tutti i N esperimenti" 32px** — Bottone filtro esperimenti con minHeight 32px. **FIXATO** (32→44px).

4. **TeacherDashboard fontSize 12** — Header tabella studenti con fontSize 12px, sotto il minimo 14px. **FIXATO** (12→14px).

5. **Input focus color inconsistency** — `.elab-input:focus` usava `--color-primary` (navy) mentre tutti gli altri focus states usano `--color-accent` (green). **FIXATO** (unificato a --color-accent).

### FALSE POSITIVE (non bug)

1. **studentTracker event listener leak** — Segnalato dal subagent di review come P1 memory leak. In realta il cleanup e' gia corretto: `_unsubscribers.push(() => document.removeEventListener(...))` a riga 66, chiamato da `destroy()` a riga 272.

2. **console.log in codeProtection.js** — E' un copyright notice intenzionale nella console browser. Non deve passare per logger.debug() perche' verrebbe soppresso in produzione.

3. **30 font-size < 14px in PDF** — Sono file react-pdf (SessionReportPDF.jsx, ReportService.jsx) che usano punti tipografici, non pixel screen. 10pt in un PDF e' perfettamente leggibile.

### DEBITO TECNICO RESIDUO (non fixato — serve decisione di Andrea)

1. **~17.000 LOC di moduli admin/gestionale mai usati** — 12 file lazy-loaded in App.jsx ma mai raggiungibili dal routing. Sono una feature futura? Se no, cancellare risparmia ~800KB di bundle.

2. **3 chunk > 1000KB** — ElabTutorV4 (1118KB), react-pdf (1485KB), index (1568KB). Servono ulteriori code splitting o lazy loading per migliorare il Time to Interactive.

3. **Bundle totale 4145KB** — In linea con il target ma crescera. Monitorare.

### COMMIT G19

```
21e31a4 feat(G19): Principio Zero — progressive disclosure + automa improvements (191 files)
280b6d3 chore(automa): sprint infra — 130 task, reports G8-G17 (102 files)
27f0948 docs: Principio Zero plan, audit reports G9-G17 (6 files)
c5eac18 fix: remove dangling electronViewEnabled reference (1 file)
d7bb1a9 fix(G19): quality audit — touch targets, font size, focus color (4 files)
```

**Totale: 304 file committati, 5 bug fixati, 911/911 test PASS, deploy Vercel OK.**
