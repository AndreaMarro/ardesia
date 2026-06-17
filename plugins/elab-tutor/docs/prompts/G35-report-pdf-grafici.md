# G35 — REPORT PDF + GRAFICI INTERATTIVI

**Sprint F** — Quinta sessione (post G34 Compilatore Locale)
**Deadline PNRR**: 30/06/2026 (83 giorni)
**Riferimento piano**: `docs/prompts/SPRINT-F-MASTER-PLAN.md`

---

## CONTESTO RAPIDO
- G34: Compilatore locale con fallback chain (pre-compiled → cache → remote → errore), 12 HEX files, UI indicator ⚡
- Score composito: 8.8/10 (target Sprint F: ≥ 9.0/10)
- 956/956 unit test, 20/20 E2E test
- Teacher Dashboard esiste ma ha solo tabelle, nessun grafico interattivo
- Il dirigente scolastico deve decidere l'acquisto: serve un report convincente

---

## IMPERATIVO ASSOLUTO
ZERO DEMO. ZERO DATI FINTI. ZERO MOCK.
I grafici devono usare dati reali da studentService/sessionMetrics. Se non ci sono dati, mostrare stato vuoto elegante.

---

## SKILL DA USARE (SE DISPONIBILI)

| Fase | Skill | Perché | Fallback manuale |
|------|-------|--------|------------------|
| INIZIO | `/elab-quality-gate` | Baseline pre-session | `npm run build && npx vitest run && npm run test:e2e` |
| RESEARCH | `/ricerca-tecnica` | recharts vs chart.js vs Nivo | Web search manuale |
| DESIGN | `/elab-quality-gate` | Audit visual coerenza palette | Verifica manuale |
| FINE | `/elab-quality-gate` | Score card post | Build + test + E2E |

---

## TASK

### 1. Quality Gate Pre-Session (10min)
```
/elab-quality-gate pre
```
Verificare: build, 956+ unit test, 20/20 E2E

### 2. Ricerca Libreria Grafici (30min)

Scegliere tra:
- **Recharts** (React-native, declarativo, leggero)
- **Chart.js** (canvas-based, più pesante, non React-native)
- **Nivo** (basato su D3, bellissimo, più pesante)

Criteri: bundle size <100KB aggiuntivi, React compatibility, supporto line/bar/pie, accessibilità.

### 3. Implementazione Grafici Dashboard (1.5h)

Nella Teacher Dashboard, tab "Report":

1. **Line chart**: trend completamento esperimenti nel tempo (asse X: date, Y: % completamento)
2. **Bar chart**: top 10 esperimenti più completati (orizzontale, ordinato)
3. **Pie chart**: distribuzione mood studenti (emoji feedback)
4. **KPI cards**: numero studenti attivi, esperimenti completati totali, tempo medio sessione

Dati da: `studentService.getAllActivities()` o `studentTracker`.

### 4. Export PDF (1h)

1. **Bottone "Scarica Report"** nella tab Report
2. Layout print-friendly: nasconde navbar, aggiunge margini, font serif per leggibilità
3. Report 1 pagina per dirigente scolastico: logo ELAB, KPI, grafico trend, top esperimenti
4. Usare `@media print` o `html2pdf.js` (valutare bundle size)

### 5. Quality Gate Post-Session (15min)
```
/elab-quality-gate post
```

---

## CHAIN OF VERIFICATION — 3 PASSAGGI

### CoV 1: POST-TASK (dopo ogni step)
- `npm run build` — DEVE passare
- `npx vitest run` — 956+ test, 0 fail
- `npm run test:e2e` — 20 test, 0 fail

### CoV 2: PRE-MERGE
- Grafici renderizzano con dati reali
- PDF scaricabile e leggibile
- Bundle size incremento < 100KB

### CoV 3: POST-SESSION
1. 3 grafici interattivi nella dashboard
2. PDF scaricabile 1-click
3. Layout stampa pulito
4. Handoff aggiornato
5. Prompt G36 scritto

---

## REGOLE
- ZERO DEMO, ZERO DATI FINTI, ZERO MOCK
- ZERO REGRESSIONI: build + vitest + E2E dopo OGNI modifica
- Non toccare engine/ — MAI
- Budget ≤ €50/mese
- 20 E2E test devono continuare a passare
- Palette: Navy #1E4D8C, Lime #4A7A25, Vol2 #E8941C, Vol3 #E54B3D

---

## DELIVERABLE ATTESI G35

| # | Deliverable | Criterio di accettazione |
|---|-------------|--------------------------|
| 1 | Line chart trend | Mostra trend completamento nel tempo |
| 2 | Bar chart top esperimenti | Top 10 esperimenti più completati |
| 3 | Pie chart mood | Distribuzione mood studenti |
| 4 | KPI cards | Studenti attivi, esperimenti, tempo medio |
| 5 | PDF export | Report 1 pagina scaricabile |
| 6 | Print layout | @media print pulito |
| 7 | Score card G35 | Dashboard ≥ 9/10 |

---

## SCORE TARGET

| Area | G34 | Target G35 | Come |
|------|-----|-----------|------|
| Build/Test | 10/10 | **10/10** | Mantenere |
| Simulatore | 8.5/10 | **8.5/10** | Mantenere |
| Teacher Dashboard | 8.5/10 | **9/10** | +grafici +PDF |
| GDPR | 8.5/10 | **8.5/10** | Mantenere |
| **COMPOSITO** | **8.8/10** | **9.0/10** | Dashboard boost |
