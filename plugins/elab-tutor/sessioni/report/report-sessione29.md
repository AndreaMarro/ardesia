# Report Sessione 29 — Ristrutturazione ELAB Tutor
**Data**: 20/02/2026
**Autore**: Andrea Marro + Claude (Opus 4.6)
**Deployed**: https://elab-builder.vercel.app

---

## Obiettivo
Ristrutturare ELAB Tutor "Galileo" per allinearlo esteticamente ai volumi fisici ELAB. Fasi 1, 2, 4, 8 su 8 pianificate. Le fasi 3, 5, 6, 7 (interazione drag&drop, licenze per volume, giochi teacher-gated, wire routing) sono differite a Sessione 30.

**NOTA IMPORTANTE**: La Fase 2 (tipografia) è stata implementata e poi **revertita** su richiesta dell'utente. I font sono tornati a Oswald + Open Sans + Fira Code.

---

## Riepilogo cambiamenti EFFETTIVI (post-revert)

| Fase | Stato | Impatto reale |
|------|-------|---------------|
| Fase 1 — Rimozione Onboarding | **COMPLETATA** | ~1.150 LOC rimosse, 3 file eliminati, 11 file puliti |
| Fase 2 — Tipografia libro | **REVERTITA** | Font tornati a Oswald + Open Sans + Fira Code |
| Fase 4 — Rimozione progress bars | **COMPLETATA** (by Phase 1) | progressStats, ProjectTimeline, progress-card tutti rimossi |
| Fase 8 — Estetica libro | **COMPLETATA** | Footer, SVG patterns, typography CSS rules, brand topbar |

**Effetto netto della sessione**: ~1.400 LOC di dead code rimosso + estetica libro (footer, patterns, CSS rules). Font invariati.

---

## Fase 1: Rimozione completa Onboarding

| Metrica | Valore |
|---------|--------|
| File eliminati | 3 (OnboardingWizard.jsx 473 LOC + onboarding/ dir 511 LOC + CSS 169 LOC) |
| File modificati | 11 |
| LOC rimosse | ~1.153 |

**File eliminati:**
- `src/components/tutor/OnboardingWizard.jsx` (473 righe)
- `src/components/onboarding/OnboardingOverlay.jsx` (511 righe)
- `src/components/onboarding/` (intera directory)
- CSS onboarding in ElabTutorV4.css (169 righe, linee 2082-2250)

**File modificati (11):**
1. `ElabTutorV4.jsx` — import, stato showOnboarding/userType, callback completeOnboarding, render. Fix: `userType === 'docente'` → `isDocente` da `useAuth()`
2. `ChatOverlay.jsx` — import + JSX OnboardingOverlay
3. `NewElabSimulator.jsx` — import + JSX + showOnboarding state + onShowHelp prop
4. `WhiteboardOverlay.jsx` — import + JSX
5. `TeacherDashboard.jsx` — import + JSX
6. `AdminPage.jsx` — import + JSX + data-onboarding attributes
7. `GestionalePage.jsx` — import + JSX + showOnboarding state + 2 bottoni "Guida"
8. `VetrinaSimulatore.jsx` — import + JSX
9. `AdminDashboard.jsx` — 4 data-onboarding attributes
10. `ControlBar.jsx` — onShowHelp prop + bottone Help/Tutorial + HelpIcon SVG
11. `ElabTutorV4.css` — sezione onboarding CSS

**Verifica:** `grep -r "onboarding|OnboardingWizard|OnboardingOverlay|elab_onboarding" src/` → 0 risultati

---

## Fase 2: Tipografia — IMPLEMENTATA POI REVERTITA

### Cosa è stato fatto (poi annullato)
- Google Fonts: Open Sans + Oswald → Bebas Neue + Roboto
- CSS variables: `--font-sans` → Roboto, `--font-display` → Bebas Neue
- 25 file con font hardcoded aggiornati (21 JSX + 4 CSS)

### Revert completo
Su richiesta dell'utente, tutti i 26 file (index.html + design-system.css + 25 file sorgente) sono stati riportati allo stato pre-sessione 29:

| Proprietà | Valore attuale (post-revert) |
|-----------|------------------------------|
| Google Fonts | `Open Sans (300..800) + Oswald (200..700) + Fira Code (300..700)` |
| `--font-sans` | `'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |
| `--font-heading` | `'Oswald', -apple-system, sans-serif` |
| `--font-display` | `'Oswald', 'Arial Narrow', Arial, sans-serif` |
| `--font-mono` | `'Fira Code', 'SF Mono', 'Consolas', monospace` |

**Verifica post-revert:**
- `grep -r "'Roboto'" src/` → 0 risultati
- `grep -r "'Bebas Neue'" src/` → 0 risultati
- `grep -r "'Open Sans'" src/` → 70 occorrenze (stato originale ripristinato)
- `emailService.js` → mai toccato (4 occorrenze Open Sans in email template server-side)

---

## Fase 4: Rimozione barre progresso

| Metrica | Valore |
|---------|--------|
| File modificati | 0 (già rimosso da Phase 1 subagent) |
| File eliminati | ProjectTimeline.jsx (già eliminato) |

Il subagent di Phase 1 è stato più aggressivo del previsto e ha già rimosso tutti i riferimenti a progressStats, progress-card, ProjectTimeline, refreshProgressStats, sidebar-progress, topbar-progress.

**Verifica:** `grep -r "progressStats|progress-card|sidebar-progress|topbar-progress|ProjectTimeline" src/` → 0 risultati

---

## Fase 8: Estetica libro

| Metrica | Valore |
|---------|--------|
| File modificati | 4 |
| Nuove CSS rules | ~35 righe |

**NOTA**: Le regole CSS di Fase 8 usano `var(--font-display)` e `var(--font-sans)` che risolvono a **Oswald** e **Open Sans** (coerente con il revert font).

**Task 9 — Tipografia globale (ElabTutorV4.css):**
- 5 nuove regole CSS: `.vol-heading`, `.vol-subheading`, `.vol-body`, `.vol-label`, `.vol-code`
- h1/h2: `var(--font-display)` → Oswald, uppercase, letter-spacing 1px, weight 700
- h3: `var(--font-display)` → Oswald, uppercase, letter-spacing 0.5px, weight 400
- body: `var(--font-sans)` → Open Sans, weight 400, line-height 1.6
- label: `var(--font-sans)` → Open Sans, weight 300
- code: `var(--font-mono)` → Fira Code

**Task 10 — Pattern sfondo volume (ExperimentPicker.jsx):**
- `VOL_PATTERN` con SVG inline (crosshair circuiti a 20% opacità per volume)
- Applicato a schermate chapters e experiments
- Chapter cards: `borderTop: 4px solid ${volColor}` + titolo Oswald UPPERCASE
- Experiment cards: titolo Oswald, descrizione Open Sans 400

**Task 11 — Footer (TutorLayout.jsx + ElabTutorV4.css):**
- `<footer className="tutor-footer">` con "Laboratorio di Elettronica: Impara e sperimenta"
- Sfondo navy `#1E4D8C`, testo bianco, Open Sans italic 300, font-size 14px (WCAG)
- Visibile solo fuori fullscreen

**Task 12 — Brand topbar (tutor-responsive.css):**
- `.topbar-title`: var(--font-display) → Oswald, uppercase, letter-spacing 2px
- `.topbar-subtitle`: var(--font-display) → Oswald, uppercase, letter-spacing 1px

---

## Audit finale

| Check | Risultato |
|-------|-----------|
| Build | 0 errori |
| Onboarding references | 0 |
| 'Roboto' in src/ | 0 |
| 'Bebas Neue' in src/ | 0 |
| 'Open Sans' in components | 70 occorrenze (stato corretto) |
| Progress bars | 0 |
| fontSize < 14px in tutor | 1 noto P3 (ChatOverlay:715 disclaimer 10px) |
| Deploy Vercel | OK (post-revert) |

---

## Stato file chiave post-sessione

| File | LOC | Note |
|------|-----|------|
| ElabTutorV4.jsx | 1.170 | -143 LOC vs pre-sessione (~1.313) |
| TutorLayout.jsx | 192 | +6 LOC (footer aggiunto) |
| TutorSidebar.jsx | 141 | -27 LOC (progress card + timeline tab rimossi) |
| TutorTopBar.jsx | 102 | -8 LOC (progress card rimossa) |
| ElabTutorV4.css | 2.134 | -169 LOC onboarding + ~35 LOC nuovi (tipografia + footer) |
| tutor-responsive.css | 1.189 | -78 LOC progress CSS rimosso |
| ExperimentPicker.jsx | 530 | +15 LOC (VOL_PATTERN + borderTop + background) |

**LOC totali rimosse (stima):** ~1.400+ LOC di dead code onboarding/progress

---

## Issues noti rimasti

### P0 Critical
- NESSUNO

### P1 Important
- n8n workflow non pubblicati (HTTP 404) — serve login pannello n8n Hostinger
- Email E2E non verificata (Resend configurato)

### P2 Medium
- DashboardGestionale chunk 410KB (recharts ~300KB bundled)
- Pagamenti: solo Amazon. Serve Satispay/Mollie integration
- Whiteboard V2 non testata E2E

### P3 Minor
- ChatOverlay.jsx:715 — AI disclaimer footer 10px (legal text)
- SVG `<rect> attribute rx` console warning (cosmetic)
- Pin alignment: 6 components not exactly on 7.5px grid
- No automated E2E test suite in CI

---

## Fasi differite a Sessione 30

| Fase | Descrizione | Decisioni già prese |
|------|-------------|---------------------|
| **3** | VolumeHome + ComponentPanel + drag&drop | Drag&drop attivo, snap griglia 7.5px, snap automatico errori |
| **5** | Licenze per volume (mappatura codici → volumi) | Da progettare |
| **6** | Giochi attivabili dal teacher | Da progettare |
| **7** | Wire routing anti-incrocio | Da progettare |

### Decisioni confermate per Sessione 30
- **Pannello componenti**: Drag & drop attivo
- **Esperimenti**: "Monta tu" guidato + sandbox libero
- **Errori montaggio**: Snap automatico alla posizione corretta
- **Sandbox**: Snap griglia breadboard 7.5px

---

## Documenti di riferimento
- **Design doc**: `docs/plans/2026-02-20-session29-restructure-design.md`
- **Piano implementazione**: `docs/plans/2026-02-20-session29-plan.md`
- **Prompt sessione 30**: `sessioni/prompt/prompt-sessione30.md`
- **Memory auto**: `~/.claude/projects/-Users-andreamarro-VOLUME-3/memory/MEMORY.md`

---

## HONESTY NOTE Session 29

- **Phase 1 scope creep**: Il subagent di Phase 1 ha rimosso anche progressStats/ProjectTimeline/timeline tab, rendendo Phase 4 un no-op. Verificato indipendentemente — nessun codice perso che non dovesse essere rimosso.
- **Phase 2 scope expansion poi revert**: Il piano prevedeva 4 file CSS. Il subagent ha trovato 25 file totali. Poi l'utente ha richiesto il revert completo — tutti i 26 file riportati allo stato originale. **0 tracce residue di Roboto/Bebas Neue nel codice.**
- **LOC count**: "~1.400+ LOC rimosse" è stima conservativa. Le rimozioni principali: OnboardingWizard (473) + OnboardingOverlay (511) + CSS onboarding (169) + progress tracking (~150+) + pulizia 11 file consumer.
- **Fase 8 usa CSS variables**: Le regole CSS aggiunte in Fase 8 usano `var(--font-display)` e `var(--font-sans)`, non font hardcoded. Dopo il revert queste risolvono correttamente a Oswald e Open Sans. Nessun conflitto.
- **No visual regression test**: L'audit è stato fatto via grep/build. Non è stata fatta verifica visiva nel browser. Serve test manuale per confermare che font, footer, SVG patterns e brand topbar appaiano correttamente.
