# G42 — STRESS TEST + MEMORY LEAKS + WCAG

**Sprint H** — Seconda sessione
**Deadline PNRR**: 30/06/2026 (92 giorni)
**Score attuale**: 9.1/10 | Target G42: 9.3/10

---

## CONTESTO

### G41 — Dashboard Pagination + Nudge Reali + Welcome Expansion
- Pagination dashboard: usePagination hook + Pagination component (3 tab: Giardino, Attivita, Progressi)
- Nudge REALI: nudgeService.js (localStorage + analytics webhook) + overlay studente
- Welcome messages: 10 → 62 (100% copertura)
- sitemap.xml + prefers-reduced-motion per animazione nudge da fixare

### Questa sessione: Robustezza e accessibilita'
Fix dei bug strutturali trovati nell'audit G35 + G41.

---

## FILE ESSENZIALI

| File | Perche' | Bug |
|------|---------|-----|
| `src/components/simulator/canvas/SimulatorCanvas.jsx` | Memory leak pointerup | riga 1888 |
| `src/components/simulator/components/Annotation.jsx` | Listener churn durante drag | riga 102-108 |
| `src/services/studentService.js` | localStorage unbounded growth | riga 70 |
| `src/components/teacher/TeacherDashboard.jsx` | Hardcoded colors fuori palette | 13+ colori |
| `src/services/api.js` | Timer leak tryLocalServer | riga 135-137 |

---

## TASK

### Task 1: Quality Gate Pre-Session

### Task 2: Fix Memory Leaks (1.5h)

**Bug 1: pointerup listener leak** (SimulatorCanvas.jsx:1888)
- `window.addEventListener('pointerup', handleRelease)` aggiunto per-press
- Cleanup solo dentro handleRelease — se component unmounts mid-press, leaks
- **Fix**: aggiungere cleanup in useEffect return, o usare ref per tracciare listener

**Bug 2: Annotation listener churn** (Annotation.jsx:102-108)
- useEffect con `[isDragging, dragOffset.dx, dragOffset.dy]` — riesegue centinaia di volte/sec durante drag
- **Fix**: rimuovere dragOffset dalle deps, usare ref per offset corrente

**Bug 3: Timer leak tryLocalServer** (api.js:135-137)
- setTimeout non cleared quando externalSignal aborts
- **Fix**: clearTimeout nel cleanup dell'externalSignal abort handler

**CoV**: build + test

### Task 3: Fix localStorage Unbounded Growth (1h)

**Bug**: studentService STUDENT_DB_KEY cresce senza limiti.

**Cosa fare**:
1. Aggiungere max retention: 730 giorni (come da GDPR)
2. Al load, pruned studenti con ultimo accesso > 730gg
3. Aggiungere size check: se > 3MB, prunare i piu' vecchi
4. Toast: "Dati vecchi rimossi per liberare spazio" (solo se effettivamente prunato)

**CoV**: build + test

### Task 4: WCAG Contrast Audit Completo (1h)

**Cosa fare**:
1. Orange #E8941C -> #B87A00 per testo su bianco (4.8:1)
2. Red #E53935 -> #C62828 per testo corpo (5.6:1), mantenere #E53935 per badge/bottoni grandi
3. Gray #94A3B8 -> #64748B dove usato come testo (4.63:1)
4. Verificare OGNI combinazione colore del C palette su bianco e su navy
5. Dashboard: sostituire 13+ hardcoded colors con C.* constants

### Task 5: React Style Warnings Fix (30min)

**Bug**: 8x "backgroundImage vs background" warning

**Cosa fare**:
1. Trovare i componenti che mixano `background` shorthand con `backgroundImage`
2. Sostituire con proprieta' esplicite: `backgroundColor`, `backgroundImage`, `backgroundSize` separati

### Task 6: AUDIT FINALE
### Task 7: Handoff + Prompt G43

---

## DELIVERABLE ATTESI G42

| # | Deliverable | Criterio |
|---|-------------|----------|
| 1 | 3 memory leaks fixati | pointerup, annotation, timer |
| 2 | localStorage bounded | Pruning > 730gg, max 3MB |
| 3 | WCAG AA compliant | Tutti i contrasti >= 4.5:1 |
| 4 | 0 React warnings | backgroundImage fix |
| 5 | Score >= 9.7 | Robustezza migliorata |
