# Session 29 Design — Ristrutturazione ELAB Tutor

**Data**: 20/02/2026
**Autore**: Andrea Marro + Claude
**Approccio**: Refactor chirurgico (Approccio A)
**Scope**: Fasi 1, 2, 4, 8 (pulizia + estetica)
**Fasi differite a sessione 30**: 3 (VolumeHome + ComponentPanel + drag&drop), 5 (licenze per volume), 6 (giochi teacher-gated), 7 (wire routing)

---

## Decisioni chiave (confermate dall'utente)

| Domanda | Risposta |
|---------|----------|
| Pannello componenti | Drag & drop attivo (sessione 30) |
| Esperimenti | "Monta tu" guidato + sandbox libero (sessione 30) |
| Errori montaggio | Snap automatico alla posizione corretta |
| Sandbox | Snap griglia breadboard 7.5px |
| Scope sessione 29 | Fasi 1-4 + 8 (estetica) |
| Approccio | A — Refactor chirurgico |

---

## Fase 1: Rimozione completa Onboarding

### File da eliminare
- `src/components/tutor/OnboardingWizard.jsx` (473 righe)
- `src/components/onboarding/OnboardingOverlay.jsx` (511 righe)
- Cartella `src/components/onboarding/`

### File da modificare (8 file)
1. `ElabTutorV4.jsx` — rimuovere import, stato `showOnboarding`, callback `completeOnboarding`, render condizionale
2. `ChatOverlay.jsx` — rimuovere import/uso OnboardingOverlay
3. `NewElabSimulator.jsx` — idem
4. `TeacherDashboard.jsx` — idem
5. `AdminPage.jsx` — idem
6. `VetrinaSimulatore.jsx` — idem
7. `GestionalePage.jsx` — idem
8. `WhiteboardOverlay.jsx` — verificare e rimuovere se presente

### localStorage da pulire
Rimuovere riferimenti a: `elab_onboarding_done`, `elab_user_type`, `elab_user_volume`, `elab_onboarding_completed`

### Tab iniziale
Lo studente entra direttamente nel `simulator`. Nella sessione 30 il default diventerà la selezione volume (VolumeHome).

### Verifica
- `grep -r "onboarding\|OnboardingWizard\|OnboardingOverlay" src/` → 0 risultati
- Build senza errori

---

## Fase 2: Tipografia identica ai volumi fisici

### Font mapping
| Uso | Prima | Dopo |
|-----|-------|------|
| Titoli | Oswald | Bebas Neue (fallback Oswald) |
| Body | Open Sans | Roboto |
| Codice | Fira Code | Fira Code (invariato) |

### Modifiche
1. **index.html**: Sostituire Google Fonts link
   - Rimuovere: Open Sans, Oswald
   - Aggiungere: Bebas Neue, Roboto (300,400,500,700 + italic)
   - Mantenere: Fira Code

2. **ElabTutorV4.css**: Aggiornare variabili
   - `--font-sans: 'Roboto', -apple-system, sans-serif`
   - `--font-display: 'Bebas Neue', 'Oswald', sans-serif`
   - `--font-mono: 'Fira Code', 'Courier New', monospace`

3. **Regole tipografiche globali**:
   - h1/h2: `var(--font-display), uppercase, letter-spacing: 1px`
   - body: `var(--font-sans), 400, line-height: 1.6`
   - etichette: `var(--font-sans), 300`
   - codice: `var(--font-mono)`

4. **Componenti**: Verificare che nessuno hardcodi Open Sans o Poppins

### Scope
Solo il tutor (`elab-builder/`). Il sito pubblico (`newcartella/`) NON viene toccato.

### Verifica
- `grep -r "Open Sans\|Poppins" src/` → 0 risultati (nel tutor)
- Visual check: titoli in Bebas Neue uppercase

---

## Fase 4: Rimozione barre progresso

### File da modificare
1. **TutorSidebar.jsx**: Rimuovere `sidebar-progress-card`, prop `progressStats`, tab `timeline`
2. **TutorTopBar.jsx**: Rimuovere `topbar-progress-card`, prop `progressStats`
3. **ElabTutorV4.jsx**: Rimuovere stato `progressStats`, `refreshProgressStats`, polling useEffect, window listeners, render `<ProjectTimeline />`
4. **ElabTutorV4.css**: Rimuovere CSS `.sidebar-progress-*`, `.topbar-progress-*`
5. **ProjectTimeline.jsx**: Valutare eliminazione (diventa orfano)

### NON rimuovere
- `studentService` — serve per altri scopi

### Verifica
- `grep -r "progressStats\|progress-card\|fetchProgress\|sidebar-progress\|topbar-progress" src/` → 0 risultati
- La sidebar non mostra barre di completamento
- La topbar non mostra "Progressi ELAB: X/Y"

---

## Fase 8: Estetica identica ai volumi fisici

### Pattern sfondo per volume
- Vol.1: Pattern circuiti `#7CB342` su bianco
- Vol.2: Pattern circuiti `#E8941C` su bianco
- Vol.3: Pattern circuiti `#E54B3D` su bianco
- Implementazione: SVG inline in CSS `background-image`

### Header capitolo (ExperimentPicker.jsx)
- Barra superiore 4px, colore volume
- Titolo: Bebas Neue UPPERCASE
- Sottotitolo: Roboto Light
- Badge: numero esperimenti

### Card esperimento (ExperimentPicker.jsx)
- Titolo: Bebas Neue
- Descrizione: Roboto 400
- Badge difficolta (se nei dati)
- Icona componente principale

### Footer tutor (ElabTutorV4.jsx)
- Barra navy `#1E4D8C`, testo bianco
- Testo: "Laboratorio di Elettronica: Impara e sperimenta"
- Font: Roboto Italic 300

### Volume badge topbar
Colore dinamico basato sul volume selezionato

### Verifica
- Pattern sfondo visibile e coerente col volume
- Header capitolo identico al libro
- Footer presente su tutte le pagine tutor

---

## Ordine di esecuzione

1. Fase 1 → build → deploy
2. Fase 2 → build → deploy
3. Fase 4 → build → deploy
4. Fase 8 → build → deploy
5. Audit finale (fontSize, accenti, copyright, build)

---

## Fasi differite a Sessione 30

- **Fase 3**: VolumeHome + ComponentPanel + drag&drop con snap
- **Fase 5**: Licenze per volume (mappatura codici → volumi)
- **Fase 6**: Giochi attivabili dal teacher
- **Fase 7**: Wire routing anti-incrocio
