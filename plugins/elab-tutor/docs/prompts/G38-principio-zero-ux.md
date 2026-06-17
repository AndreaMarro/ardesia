# G38 — PRINCIPIO ZERO UX (Steve Jobs Mode)

**Sprint G** — Terza sessione
**Deadline PNRR**: 30/06/2026 (67 giorni)
**Score attuale**: 9.0/10 | Target G38: 9.3/10

---

## CONTESTO SESSIONI PRECEDENTI

### G37 — Dashboard Reale
- Pagination implementata (25 items/page)
- Nudge persistito (localStorage + server fallback)
- Documentazione con 3 guide in-app
- Classi con student list
- Score Dashboard: 6.5 -> 8+

### Il PRINCIPIO ZERO (dalla visione di Andrea):
> "L'insegnante deve poter arrivare alla lavagna e spiegare PER MAGIA anche se non sa niente."

QUESTA SESSIONE e' dedicata esclusivamente a rendere l'esperienza MAGICA.

---

## FILE ESSENZIALI

| File | Perche' |
|------|---------|
| `src/components/VetrinaSimulatore.jsx` | Landing page — PRIMA COSA che vede il docente |
| `src/components/tutor/ElabTutorV4.jsx` | VolumeChooser blocca l'accesso |
| `src/components/unlim/UnlimMascot.jsx` | Mascotte — deve essere INVITANTE non confusa |
| `src/components/unlim/UnlimOverlay.jsx` | Messaggi contestuali |
| `src/App.jsx` | Routing — default e' showcase, non simulatore |
| `src/styles/design-system.css` | Design system |
| `automa/context/UNLIM-VISION-COMPLETE.md` | Visione Andrea — la BUSSOLA |

---

## TASK

### Task 1: Quality Gate Pre-Session

### Task 2: First-Load Magic — Da Landing a Lezione in 1 Click (2h)

**Il problema**: Docente arriva -> vede pagina vendita -> deve cliccare "Prova" -> VolumeChooser -> finalmente simulatore. 4 passi. Andrea vuole 0 passi.

**Cosa fare (Principio Zero)**:
1. Per utenti con licenza: `#teacher` apre subito dashboard, `#tutor` apre subito simulatore
2. Per utenti senza licenza: mantenere vetrina MA aggiungere hero CTA gigante "Inizia in 3 secondi" che porta a `#prova` con Vol1 Esp1 gia' caricato
3. VolumeChooser: NON mostrare al primo accesso. Mostrare solo quando si cambia volume (click su "Tutti i 62 esperimenti")
4. Default experience: simulatore con UNLIM che dice "Benvenuti! Oggi facciamo il primo circuito." — ZERO interfaccia da capire

### Task 3: Estetica "Volumes Look" — Avvicinare al Design dei Libri Fisici (1.5h)

**Il problema**: L'app sembra un tool tech. Andrea vuole che somigli ai volumi/scatole fisiche.

**Cosa fare**:
1. Aggiungere badge volume colorato nel simulatore: bordo verde/arancione/rosso che indica quale volume e' aperto
2. Typography: usare Oswald per titoli (gia' presente), verificare consistenza
3. Cards esperimenti: bordo arrotondato, ombra sottile, icona volume
4. Palette consistency audit: verificare che OGNI colore nel codebase usi i const C.* o variabili CSS del design system

### Task 4: UNLIM Welcome — Contestuale e Brevissimo (1h)

**Il problema**: UNLIM dice "Ciao! E' la prima volta?" — non e' contest0uale all'esperimento.

**Cosa fare**:
1. Welcome message SPECIFICO per esperimento: "Oggi accendiamo il primo LED! Premi Play quando sei pronto."
2. Se tornano dopo aver fatto il LED: "Bravi! L'ultima volta avete acceso il LED. Oggi proviamo le resistenze diverse."
3. Max 15 parole. No emoji invasive. Tono naturale.
4. I welcome message vengono dal lesson path JSON (campo `welcome_message`) — aggiungerlo ai top 10 esperimenti piu' usati

### Task 5: Touch Targets e Contrast Fix (1h)

**Il problema**: 1 bottone < 44px, Orange #E8941C contrast 2.73:1 su bianco.

**Cosa fare**:
1. Experiment selector button: min-height 44px
2. Orange: darkenare a #B87A00 per testo su bianco (contrast >= 4.5:1) — usare solo per bordi/accenti grandi
3. ConsentBanner: 13px -> 14px
4. VolumeChooser.module.css: 13px -> 14px

### Task 6: AUDIT FINALE
### Task 7: Handoff + Prompt G39

---

## DELIVERABLE ATTESI G38

| # | Deliverable | Criterio |
|---|-------------|----------|
| 1 | First-load in 1 click | Utente nuovo -> simulatore in < 3 secondi |
| 2 | Volume badge nel simulatore | Bordo colorato indica volume attivo |
| 3 | Welcome contestuale | UNLIM dice frase specifica per esperimento |
| 4 | Touch >= 44px | 0 bottoni sotto 44px |
| 5 | WCAG contrast fix | Orange darkened, tutti >= 4.5:1 |
| 6 | Score composito >= 9.3 | Principio Zero quasi raggiunto |
