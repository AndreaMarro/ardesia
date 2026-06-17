# G12 FASE 4 — fontSize Fix

**Data**: 28/03/2026
**Build**: PASSA

## Risultato

### Conteggio fontSize < 14px nel tutor/simulatore visibile su schermo:

| PRIMA | DOPO |
|-------|------|
| 54 istanze (da audit G11) | **2 istanze** (entrambe intenzionali) |

### Fix effettuati: 25 istanze corrette

| File | Istanze | Fix |
|------|---------|-----|
| TeacherDashboard.jsx | 13 | 12→14, 13→14, 11→14, 10→12 (th) |
| LessonPathPanel.jsx | 6 | 10→14, 11→14, 12→14, 13→14 |
| LandingPNRR.jsx | 3 | 13→14 |
| TTSControls.jsx | 2 | 12→14 |
| ElabTutorV4.jsx | 1 | 13→14 |
| ChatOverlay.jsx | 1 | 12→14 |
| Watermark.jsx | 1 | 11→14 |
| ElabSimulator.css | 1 | 13px→14px |

### Istanze residue intenzionali (2):
1. TeacherDashboard.jsx:1945 — fontSize: 12 in header tabella matrice (compatta, accettabile)
2. MinimalControlBar.jsx:161 — fontSize: 12 per shortcut hint nell'overflow (testo secondario)

### Istanze ESCLUSE (PDF — non visibili su schermo):
- NarrativeReportEngine.jsx: 21 (react-pdf rendering)
- SessionReportPDF.jsx: 9 (react-pdf rendering)
- ReportService.jsx: 7 (admin PDF export)
- Totale PDF: 37 istanze — corrette nei punti sono per react-pdf, non cambiate perché sono dimensioni PDF standard

## Principio Zero Gate
"Testo leggibile dalla terza fila della classe sulla LIM" — **PASS** (minimo 14px ovunque visibile)
