# G11 Score Card — Brutalmente Onesta

**Data**: 28/03/2026
**Sessione**: G11 Marathon

---

## Score per Area (post-G11)

| Area | G10 Score | G11 Score | Delta | Motivazione |
|------|-----------|-----------|-------|-------------|
| Simulatore funzionalita' | 9.5 | 9.5 | 0 | Non toccato, gia' eccellente |
| Contenuti | 9.0 | 9.0 | 0 | Non toccati |
| LIM/iPad | 5.5 | **7.0** | +1.5 | 0 alert, 0 borderColor, toast non-bloccanti |
| Teacher Dashboard | 7.0 | **8.0** | +1.0 | +Export JSON/CSV PNRR, dati reali |
| WCAG/A11y | 7.0 | **8.0** | +1.0 | 0 alert, 0 borderColor, CSS hover |
| Code Quality | 6.5 | **7.0** | +0.5 | Toast component, CSS classes, meno anti-pattern |
| Performance | 7.0 | **8.5** | +1.5 | PWA 16.4→4.1 MB (-75%), build 26→23s |
| Business | 4.0 | **6.5** | +2.5 | #prova senza login, deep-link, export PNRR |

## Score Composito

**G10**: 7.6/10
**G11**: (9.5 + 9.0 + 7.0 + 8.0 + 8.0 + 7.0 + 8.5 + 6.5) / 8 = **7.9/10**

### Perche' non 8.2+?
1. **LIM/iPad non testato live** — ho rimosso alert e borderColor, ma non ho fatto test reale su LIM. Il score 7.0 e' conservativo.
2. **Business ancora sotto** — #prova e' un passo avanti enorme, ma mancano: aggregazione multi-device, pricing page, teacher onboarding flow.
3. **Galileo non testato** — Il tutor AI non e' stato verificato live con il nanobot.
4. **God components non splittati** — SimulatorCanvas 3139 LOC e' un debito tecnico serio.

### Cosa sposta il punteggio verso l'alto
- Se il test browser conferma 0 errori console → +0.1
- Se Galileo funziona live → +0.2
- Se le 41 stringhe admin vengono tradotte → +0.1
**Potenziale reale: 8.2-8.3 con verifiche positive**

## Deliverables G11

### Feature nuove
1. Rotta `#prova` — simulatore senza login, Vol.1, banner non-bloccante
2. Deep-link esperimenti — `#prova?exp=v1-cap6-esp1`
3. CTA "Prova Subito — Senza Login" nella landing
4. Toast non-bloccanti (componente riutilizzabile)
5. Export JSON/CSV nel tab PNRR
6. Game tracking per 3 giochi

### Fix
1. 23 alert() → 0 (showToast)
2. 8 borderColor DOM mutations → 0 (CSS classes)
3. PWA precache 107→19 entries (16.4→4.1 MB)

### File creati
- `src/components/common/Toast.jsx` (75 LOC)

### File modificati (principali)
- `src/App.jsx` — +40 righe (rotta #prova, deep-link, Toast)
- `src/components/tutor/ElabTutorV4.jsx` — +30 righe (provaMode, banner, deepLink)
- `src/components/VetrinaSimulatore.jsx` — +22 righe (CTA "Prova Subito")
- `vite.config.js` — PWA workbox ristrutturato
- `src/styles/accessibility-fixes.css` — +20 righe (hover classes)
- `src/components/teacher/TeacherDashboard.jsx` — +60 righe (export JSON/CSV)
- 12+ file admin/tutor — alert → showToast
- 3 file giochi — +studentTracker.logGameResult
- 3 file admin — borderColor → CSS class
