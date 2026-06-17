# G39 — LANDING PAGE + ONBOARDING DOCENTE

**Sprint G** — Quarta sessione
**Deadline PNRR**: 30/06/2026 (60 giorni)
**Score attuale**: 9.3/10 | Target G39: 9.5/10

---

## CONTESTO

### G38 — Principio Zero UX (completata)
- VolumeChooser skip per returning users (localStorage)
- Hero CTA "Inizia in 3 secondi" con Oswald, gradient verde
- Volume badge Oswald + accent border colorato nel simulatore
- 10 welcome messages contestuali per esperimento (top 10)
- Touch targets 44px, Orange #B87A00 per testo WCAG AA
- Score: 9.0/10
- **NOTE: G37 (pagination + nudge) NON ancora completata**

### Questa sessione: Conversione dirigente scolastico
Il dirigente deve capire IN 30 SECONDI perche' comprare ELAB via MePA.

---

## FILE ESSENZIALI

| File | Perche' |
|------|---------|
| `src/components/VetrinaSimulatore.jsx` | Landing attuale da trasformare |
| `src/components/tutor/ElabTutorV4.jsx` | Onboarding primo accesso |
| Nessun file nuovo: MODIFICARE l'esistente |

---

## TASK

### Task 1: Quality Gate Pre-Session

### Task 2: Landing `/scuole` per Dirigenti (2h)

**Cosa fare**:
1. Nuova route `#scuole` con pagina dedicata (NON la vetrina generica)
2. Hero: "ELAB Tutor — Il laboratorio di elettronica che funziona sulla LIM"
3. 3 benefit chiari: (1) Funziona subito, (2) GDPR compliant, (3) Allineato PNRR Scuola 4.0
4. Tabella comparativa: ELAB vs Tinkercad vs Arduino IDE (solo fatti, no marketing)
5. CTA: "Richiedi Preventivo MePA" con form contatto (nome, scuola, email, messaggio)
6. Form invia a webhook (VITE_CONTACT_WEBHOOK o mailto fallback)
7. Footer: "Omaric Elettronica — Strambino (TO) — Filiera Arduino Italiana"

### Task 3: Onboarding Docente — 3 Click (1.5h)

**Cosa fare**:
1. Primo login docente: overlay "Benvenuto! Scegli come iniziare:"
   - "Lezione pronta" → Vol1 Cap6 Esp1 con UNLIM che guida
   - "Esplora il simulatore" → Modo Libero con canvas vuoto
   - "Vai alla dashboard" → #teacher
2. Salvare scelta in localStorage per non ripetere
3. Max 1 overlay, max 3 bottoni, max 10 parole per opzione

### Task 4: SEO Basics (30min)

**Cosa fare**:
1. Meta tag: title, description, og:image, og:title
2. Robots.txt: allow everything
3. Canonical URL
4. Structured data: EducationalApplication schema

### Task 5: AUDIT FINALE
### Task 6: Handoff + Prompt G40

---

## DELIVERABLE ATTESI G39

| # | Deliverable | Criterio |
|---|-------------|----------|
| 1 | Landing #scuole | Dirigente capisce valore in 30 sec |
| 2 | Form contatto | Invia a webhook o mailto |
| 3 | Onboarding 3 click | Docente primo login -> lezione in 3 click |
| 4 | SEO basics | Meta tag + structured data |
| 5 | Score >= 9.5 | Target raggiunto |
