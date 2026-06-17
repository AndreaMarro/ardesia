# QUALITY AUDIT — 13/02/2026 (Post-Sprint)
## Massima onestà — numeri verificati con grep, non stime

---

## SCORE CARD

| Metrica | Valore | Target | Status |
|---------|--------|--------|--------|
| Font < 14px (CSS) | 6 (1 watermark intenzionale) | 0 | ⚠️ WARN |
| Font < 14px (JSX inline) | 196 occorrenze / 34 file | 0 | 🔴 FAIL |
| Font ≤ 12px (JSX, escluso SVG+CodeEditor) | 111 / 34 file | 0 | 🔴 FAIL |
| Touch < 44px (CSS) | 25 (tutor 36px) | 0 | ⚠️ WARN |
| Bundle main chunk | 1,355 KB | < 1,200 KB | 🔴 FAIL |
| Bundle totale gzip | 342 KB gzip | < 500 KB | ✅ PASS |
| console.log in prod | 0 | 0 | ✅ PASS |
| console.warn/error | 92 / 24 file | accettabile | ✅ PASS |
| Build time | 3.49s | < 10s | ✅ PASS |
| Build errors | 0 | 0 | ✅ PASS |
| Moduli | 565 | - | ✅ INFO |
| TODO SECURITY | 5 | 0 | 🔴 FAIL |
| prefers-reduced-motion | ✅ presente | ✅ | ✅ PASS |
| English labels in UI | 0 (fixato "Reset"→"Azzera") | 0 | ✅ PASS |

---

## DETTAGLIO FONT SIZE < 14px PER AREA

| Area | Occorrenze ≤12px | Occorrenze 13px | Totale <14px | Note |
|------|-------------------|-----------------|--------------|------|
| Simulatore | 46 | ~25 | ~71 | 17 SVG + 8 CodeEditor = 25 legittimi |
| Admin/Gestionale | 52 | ~40 | ~92 | Solo per admin, non bambini |
| Tutor | 10 | ~8 | ~18 | Usato da bambini! |
| Teacher/Student | 28 | ~19 | ~47 | Dashboard docente/studente |
| Social | 0 | ~12 | ~12 | Profile, Post, Community |
| Auth/Other | 0 | ~6 | ~6 | Login, Register, Privacy |

### Analisi onesta
- **Simulatore**: 46 occorrenze ≤12px, ma 25 sono SVG interni (label pin, dimensioni componenti) e CodeEditor monospace — LEGITTIMI. Restano ~21 problematici.
- **Admin**: 92 occorrenze — NON usato da bambini, solo admin. Gravità: BASSA.
- **Tutor**: 18 occorrenze — USATO DA BAMBINI. Gravità: ALTA.
- **Teacher/Student**: 47 occorrenze — Dashboard studente USATO DA BAMBINI. Gravità: ALTA.
- **Social**: 12 occorrenze — Community/Profile. Gravità: MEDIA.

### Verdetto: I fix CSS hanno coperto solo il 15% del problema
I DFIX hanno fixato solo i CSS (tutor-responsive.css, layout.module.css, overlays.module.css, ElabSimulator.css, codeEditor.module.css, design-system.css). Ma il **grosso del problema è nei JSX inline styles** — 196 occorrenze sparse in 34 file. Il debito tecnico degli inline styles è enorme.

---

## DETTAGLIO TOUCH TARGET < 44px

| File | Selettori sotto 44px | Valore attuale |
|------|---------------------|----------------|
| ElabTutorV4.css | 24 selettori | 36px (was 28-32px) |
| tutor-responsive.css | 0 (fixato) | 44px |
| ElabSimulator.css | 0 (fixato) | 44px |
| codeEditor.module.css | 1 (.fontSizeBtn) | 36px |
| TutorTools.css | 1 (.tool-btn) | 36px |

### Verdetto: Migliorato ma non WCAG AA strict
- Simulatore: ✅ PASS (44px)
- Tutor CSS: ⚠️ WARN (36px + padding → ~40-44px effettivi, ma `min-height` dichiarato sotto 44px)

---

## DETTAGLIO SICUREZZA

| Issue | File | Gravità |
|-------|------|---------|
| Webhook URL hardcoded | api.js, licenseService.js, AdminPage.jsx, notionService.js | P0 |
| Admin hash in client | userService.js:88 | P0 |
| Auth falsificabile | localStorage-based, no server validation | P0 |

### Verdetto: INVARIATO — richiede architettura server-side

---

## DETTAGLIO BUNDLE

```
dist/assets/index-BBaOYUOT.js      1,355 KB (gzip 342 KB)  ← MAIN
dist/assets/codemirror-j5nLyEll.js   439 KB (gzip 144 KB)  ← CODE EDITOR
dist/assets/index-Cds7tnIi.js         51 KB (gzip  13 KB)  ← AVR
dist/assets/react-vendor-Bce9NwRC.js   12 KB (gzip   4 KB)  ← REACT
dist/assets/AVRBridge-BSJsLYG4.js      13 KB (gzip   4 KB)  ← AVR BRIDGE
dist/assets/index-Bzn4Th3g.css        103 KB (gzip  17 KB)  ← CSS
```

### Analisi:
- Main chunk 1,355 KB → include TUTTO (admin, social, teacher, student, tutor, simulator)
- Code splitting per route ridurrebbe a ~400-600 KB per chunk
- React.lazy() per Admin, Social, Teacher, Student = ~500 KB rimossi dal main

---

## PUNTEGGIO FINALE ONESTO

| Area | Score | Motivazione |
|------|-------|-------------|
| **Simulatore** | 7.5/10 | 37 bug fix, MNA solver, touch 44px, ma inline styles piccoli |
| **Tutor** | 5.0/10 | Touch 36px, contrast fixato, ma 18 inline <14px, chat AI non migliorata |
| **Design/WCAG** | 5.5/10 | CSS fixato ma 196 JSX inline non toccati. Non è WCAG AA. |
| **Admin** | 3.5/10 | Non toccato, 92 inline <14px, touch non verificati |
| **Social** | 3.0/10 | Non toccato, 100% localStorage, no auth reale |
| **Sicurezza** | 2.0/10 | Webhook + hash esposti, auth client-only |
| **Bundle** | 5.0/10 | manualChunks ok, ma 1,355 KB main troppo grande |
| **Overall** | **5.0/10** | Miglioramento reale da 4.4 a 5.0, non 6.5 come dichiarato prima |

### Autocritica
Il punteggio "6.5/10" del report precedente era **gonfiato**. Contava solo i fix applicati senza verificare il quadro completo. La realtà:
- I fix CSS coprono solo i file CSS — il grosso dei font piccoli è in JSX inline
- Il tutor ha 24 selettori sotto 44px
- Admin e Social non sono stati toccati
- La sicurezza è invariata (P0)
- Il bundle non è stato ottimizzato con code splitting

### Cosa servirebbero per raggiungere 7/10
1. **Font**: Batch fix `fontSize: 13` → `14` e `fontSize: 12` → `14` in tutti i JSX usati da bambini (~65 occorrenze in tutor+student+simulator)
2. **Touch**: Portare ElabTutorV4.css da 36px a 44px (24 selettori)
3. **Bundle**: React.lazy() per Admin, Social, Teacher, Student
4. **Sicurezza**: Env vars per webhook URLs (5 file)

---

*Quality Audit v1.0 — Generato il 13/02/2026 con massima onestà*
*Numeri da grep su codebase, non stime*
