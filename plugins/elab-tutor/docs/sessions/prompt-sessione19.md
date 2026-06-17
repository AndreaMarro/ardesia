# Prompt Sessione 19 — ELAB TUTOR DEEP AUDIT
**Data**: 19 Febbraio 2026
**Autore**: Andrea + Claude (co-scritto)
**Prerequisito**: Sessione 18 completata (Simulatore 9.6/10)

---

## Obiettivo

Audit sistematico e **brutalmente onesto** dell'intera piattaforma ELAB Tutor — tutto ciò che NON è il simulatore puro (già auditato nella Sessione 18). Ogni singolo pulsante, ogni flusso, ogni schermata. Nessun voto regalato: se qualcosa è stub, mock, o non funziona davvero, si dice.

**Produzione**: https://elab-builder.vercel.app

---

## Regole di Onestà

1. **Zero presunzioni**: se non lo testi con Playwright, non dare un voto
2. **Distingui SEMPRE**: funzionalità reale vs UI placeholder vs mock data
3. **n8n è OFFLINE**: tutto ciò che dipende da n8n va marcato come BLOCKED, non come "funzionante"
4. **Il gestionale usa mock data**: non fingere che sia collegato a un database reale
5. **I nudge del docente sono sessionStorage**: non sono notifiche push reali
6. **La license accetta qualsiasi ELAB-XXXX-XXXX**: non è una vera validazione
7. **Se un pulsante non fa niente, scrivilo**
8. **Se un componente esiste solo come UI senza backend, scrivilo**

---

## FASI DELL'AUDIT (12 fasi)

### FASE 0: Ambiente + Prerequisiti
- [ ] Verifica Vercel deployment status
- [ ] Verifica n8n webhook status (3 endpoint: elab-admin, galileo-chat, elab-kpi)
- [ ] Login con 4 account di test (admin, teacher, student, marro.andrea96)
- [ ] Verifica RBAC: ogni ruolo vede solo le sue route

**Test accounts**:
| Ruolo | Email | Password |
|-------|-------|----------|
| Admin | debug@test.com | Xk9#mL2!nR4 |
| Teacher | teacher@elab.test | Pw8&jF3@hT6!cZ1 |
| Student | student@elab.test | Ry5!kN7#dM2$wL9 |
| Admin | marro.andrea96@gmail.com | Bz4@qW8!fJ3#xV6 |

---

### FASE 1: Autenticazione End-to-End
Per OGNI flusso, Playwright screenshot + verifica:

- [ ] **Login** (email + password) → token in sessionStorage → redirect a #tutor
- [ ] **Login fallito** → messaggio errore visibile
- [ ] **Registrazione** → form completo, validazione campi, password strength
- [ ] **Logout** → sessionStorage pulito, redirect a #login
- [ ] **Token expiry** → auto-refresh o redirect
- [ ] **RequireAuth guard** → utente non loggato su #tutor → redirect
- [ ] **RequireLicense guard** → utente senza licenza → redirect a #vetrina
- [ ] **Vetrina** (#vetrina) → cosa mostra? Quanto è funzionale?
- [ ] **Privacy Policy** (/privacy) → pagina accessibile, contenuto presente
- [ ] **Data Deletion** (/data-deletion) → GDPR Art. 17 funzionante?
- [ ] **Consent Banner** → appare al primo accesso? Si salva la scelta?

**Essere onesti su**: il reset password funziona davvero? (Resend configurato ma MAI testato E2E)

---

### FASE 2: Navbar e Navigazione Globale
- [ ] **Desktop**: logo, link, dropdown account
- [ ] **Mobile 375px**: hamburger menu appare, si apre, naviga correttamente
- [ ] **Tablet 768px**: idem
- [ ] **Ogni singolo link** della navbar: dove porta? Funziona?
- [ ] **Dropdown account** (quando loggato): tutte le voci funzionano?
- [ ] **Redirect post-login**: dopo login, torna alla pagina precedente?
- [ ] **Active state**: la navbar evidenzia la pagina corrente?

**Essere onesti su**: ci sono ancora riferimenti morti "community" nella Navbar.jsx? (~525 LOC dead code segnalato in Session 14-16)

---

### FASE 3: Galileo AI Chat — Test Completo
Questo è il cuore dell'integrazione AI. Essere SPIETATI:

- [ ] **Chat UI** (ChatOverlay.jsx): si apre? Layout corretto?
- [ ] **Welcome message**: appare con suggerimenti rapidi?
- [ ] **Quick suggestions**: i 4 pulsanti funzionano?
- [ ] **Input + Invio**: il messaggio viene inviato?
- [ ] **Risposta AI**: arriva? (ASPETTARSI FALLIMENTO — n8n OFFLINE)
- [ ] **Loading state**: spinner/skeleton durante attesa?
- [ ] **Errore rete**: messaggio user-friendly in italiano?
- [ ] **Rate limiting**: dopo 10 messaggi in 1 minuto, blocca?
- [ ] **Modalità Socratica**: toggle funziona? Cambia l'istruzione di sistema?
- [ ] **XSS sicurezza**: formatMarkdown() sanitizza tutto?
- [ ] **Markdown rendering**: bold, code, code blocks, elenchi
- [ ] **Integrazione Simulatore**: `window.__ELAB_API.galileo` esiste?
  - highlightComponent()
  - highlightPin()
  - clearHighlights()
  - getCircuitState()
- [ ] **Invio immagine**: il pulsante "foto circuito" funziona?
- [ ] **Scroll**: auto-scroll sui nuovi messaggi
- [ ] **Mobile**: la chat è usabile su 375px?

**Essere onesti su**: con n8n offline, Galileo è un guscio vuoto. Qual è l'esperienza utente REALE oggi?

---

### FASE 4: ElabTutorV4 — Container Principale
Il cervello della piattaforma. Testare OGNI tab/sezione:

- [ ] **Layout 3 pannelli** (TutorLayout.jsx): sidebar + main + bottom. Rendering OK?
- [ ] **TopBar**: volume/esperimento selezionato visibile?
- [ ] **Tab: Simulatore** → NewElabSimulator caricato? (già auditato in S18, conferma solo)
- [ ] **Tab: Manuale** (ManualTab.jsx) → contenuto caricato? Da dove?
- [ ] **Tab: Canvas/Lavagna** (CanvasTab.jsx) → reindirizza a WhiteboardOverlay?
- [ ] **Tab: Quaderni** (NotebooksTab.jsx) → cosa fa realmente?
- [ ] **Tab: Video** (VideosTab.jsx) → YouTube embed funzionante?
- [ ] **Tab: Codice** (CodePanel.jsx) → editor CodeMirror funziona standalone?
- [ ] **PresentationModal** → modalità presentazione fullscreen?
- [ ] **ProjectTimeline** → timeline dei progetti dello studente?
- [ ] **Confusion/Idle prompts** (ContextualHints.jsx) → si attivano?
- [ ] **Onboarding** (OnboardingWizard.jsx) → tutorial primo accesso?

**Essere onesti su**: quanti di questi tab hanno contenuto REALE vs placeholder "Coming soon"?

---

### FASE 5: Lavagna/Whiteboard — AUDIT APPROFONDITO
**PRIORITÀ UTENTE**: l'utente chiede specificamente di migliorare la lavagna.

- [ ] **Apertura**: si apre correttamente dal tab Canvas?
- [ ] **Strumenti attuali**:
  - Matita (pencil) — funziona? Tratto fluido?
  - Gomma (eraser) — cancella bene?
  - 5 colori preset (#1E4D8C, #E54B3D, #7CB342, #E8941C, #333) — selezionabili?
  - 2 spessori (2px, 5px) — cambiano?
  - Cancella tutto — funziona?
  - Chiudi — chiude?
- [ ] **Persistenza**: il disegno si salva per esperimento (localStorage)?
- [ ] **Resize**: al ridimensionamento finestra, il disegno si preserva?
- [ ] **Touch**: funziona su tablet/LIM?
- [ ] **Cosa MANCA** (essere onesti):
  - ❌ Testo diretto sulla lavagna (scrivere testo, non solo disegnare)
  - ❌ Forme geometriche (linea retta, rettangolo, cerchio, freccia)
  - ❌ Undo/Redo
  - ❌ Seleziona e sposta
  - ❌ Esportazione immagine
  - ❌ Zoom
  - ❌ Livelli (layer)
  - ❌ Scrivere SULLA breadboard (overlay sopra il simulatore?)

**VALUTAZIONE ONESTA**: la lavagna attuale è un MVP basilare — matita + gomma + 5 colori. Per un tutor educativo serve molto di più.

---

### FASE 6: Giochi Educativi
3 modalità di gioco. Testare OGNUNA:

#### 6a. Circuit Detective ("Trova il Guasto!")
- [ ] Lista circuiti rotti disponibili?
- [ ] Selezionare un circuito → carica correttamente?
- [ ] Hints funzionano?
- [ ] Soluzione mostra spiegazione?
- [ ] Persistenza (circuiti risolti salvati)?
- [ ] Connessione con il simulatore?
- [ ] Quanti circuiti ci sono? (broken-circuits.js)

#### 6b. Predict-Observe-Explain (POE)
- [ ] Lista sfide disponibili?
- [ ] Fase Prediction → input utente?
- [ ] Fase Observation → mostra risultato?
- [ ] Fase Explanation → riflessione?
- [ ] Quante sfide ci sono? (poe-challenges.js)

#### 6c. Reverse Engineering Lab ("Circuito Misterioso")
- [ ] Lista circuiti misteriosi?
- [ ] Hints progressivi?
- [ ] Cross-navigazione al simulatore?
- [ ] Quanti circuiti? (mystery-circuits.js)

**Essere onesti su**: i giochi usano dati reali o sono skeleton con 2-3 esempi?

---

### FASE 7: Area Docente / Teacher Dashboard
Testare con account `teacher@elab.test`:

- [ ] **Accesso**: #teacher raggiungibile? Guard RBAC corretto?
- [ ] **Tab "Il Giardino"**:
  - Studenti visualizzati come piante?
  - Logica crescita (esperimenti + concetti → tipo pianta)?
  - Click su studente → dettaglio?
  - **Da dove arrivano i dati studenti?** (studentService.js → mock o reale?)
- [ ] **Tab "Meteo Classe"**:
  - Heatmap confusione per concetto?
  - Icone meteo funzionanti?
  - Dati reali o mock?
- [ ] **Tab "Attività"**:
  - Log attività in tempo reale?
  - O lista vuota?
- [ ] **Tab "Dettaglio Studente"**:
  - Selezionare uno studente → analytics completo?
  - Esperimenti completati, tempo, concetti?
- [ ] **Tab "Nudge"**:
  - Inviare messaggio motivazionale → dove va?
  - sessionStorage solo? (NON notifica push reale)
  - Lo studente lo riceve MAI?
- [ ] **Tab "Documentazione"**:
  - PDF curriculum? Contenuto presente o placeholder?

**Essere onesti su**: il Teacher Dashboard è un mockup bellissimo o uno strumento reale? Gli studenti generano dati che il docente può vedere? O è tutto hard-coded/empty?

---

### FASE 8: Admin Panel
Testare con account `debug@test.com`:

- [ ] **Accesso**: #admin raggiungibile? Guard RBAC?
- [ ] **AdminDashboard tab**: KPI visibili? (ASPETTARSI: tutto N/A — n8n offline)
- [ ] **AdminUtenti tab**: lista utenti? CRUD funzionante?
- [ ] **AdminCorsi tab**: gestione corsi? Contenuto reale?
- [ ] **AdminOrdini tab**: lista ordini? (mock o Stripe reale? Stripe è DISABILITATO)
- [ ] **AdminEventi tab**: gestione eventi? Collegato a Netlify Function?
- [ ] **AdminWaitlist tab**: lista d'attesa?
- [ ] **AdminCommunity tab**: DISABLED (rimosso in Session 14)?

#### 8b. Gestionale (Business Suite)
- [ ] Modulo Dashboard: KPI fatturato, ordini, cash flow — DATI REALI o mock?
- [ ] Modulo Dipendenti: funzionante?
- [ ] Modulo Ordini/Vendite: collegato a cosa?
- [ ] Modulo Fatturazione: genera fatture? (FatturaElettronicaService)
- [ ] Modulo Magazzino Kit: inventario reale?
- [ ] Modulo Banche: dati finanziari?
- [ ] Modulo Burocrazia: documenti?
- [ ] Modulo Marketing: CRM?
- [ ] Modulo Report: genera PDF?
- [ ] Global Search (Cmd+K): funziona?
- [ ] Notification Center: notifiche reali?

**Essere onesti su**: il Gestionale è un ERP completo o è un insieme di UI placeholder con dati finti? Questo è critico da capire.

---

### FASE 9: Responsive & Accessibilità
Test su 3 breakpoint: 375px (mobile), 768px (tablet), 1440px (desktop)

- [ ] **Login page**: responsive su tutti e 3?
- [ ] **Tutor layout**: usabile su mobile? I 3 pannelli collassano?
- [ ] **Simulator**: usabile su mobile? (probabilmente NO — è SVG complesso)
- [ ] **Chat Galileo**: usabile su 375px?
- [ ] **Teacher Dashboard**: responsive?
- [ ] **Admin**: responsive?
- [ ] **Touch target**: tutti i pulsanti ≥ 44px?
- [ ] **Font size**: niente sotto 14px?
- [ ] **Contrasto WCAG AA**: colori palette vs background?
- [ ] **Keyboard nav**: Tab/Shift+Tab funziona?
- [ ] **ARIA labels**: elementi interattivi hanno aria-label?

---

### FASE 10: Code Quality & Bundle
Audit tecnico senza modifiche:

- [ ] `npm run build` → tempo + dimensioni chunk
- [ ] `console.log` residui in produzione? (dovrebbe essere 0 post-S16)
- [ ] Dead imports / export non usati
- [ ] Code splitting: React.lazy() su AdminPage e pdf-viewer?
- [ ] Duplicazione codice tra componenti
- [ ] TODO/FIXME/HACK comments nel codice

---

### FASE 11: Licenza e Integrazione E2E
- [ ] **Attivazione licenza**: accetta ELAB-XXXX-XXXX? (MVP)
- [ ] **Licenza invalida**: messaggio errore?
- [ ] **Device lock**: funziona? (sessionStorage-based)
- [ ] **Release on logout**: la licenza si libera?
- [ ] **Flusso completo**: registro → login → attivo licenza → accedo al tutor → faccio un esperimento → compilo codice → chiedo a Galileo

---

### FASE 12: Report Finale + Score Card

Produrre:
1. `report-sessione19.md` con Chain of Verification
2. Score card aggiornata con MOTIVAZIONI per ogni voto
3. Lista fix prioritizzati (P0/P1/P2/P3)
4. Aggiornare MEMORY.md

**Score card richiesta**:

| Area | Score Pre | Score Post | Delta | Evidenza |
|------|-----------|------------|-------|----------|
| Tutor Platform | 9.3 | ? | ? | Screenshot + test ID |
| AI Integration | 8.0 | ? | ? | n8n status + UI test |
| Area Docente | N/A | ? | - | PRIMO audit! |
| Gestionale | N/A | ? | - | PRIMO audit! |
| Giochi Educativi | N/A | ? | - | PRIMO audit! |
| Lavagna | N/A | ? | - | PRIMO audit! |
| Auth E2E | 9.3 | ? | ? | Login/Register/RBAC test |
| Responsive | 9.5 | ? | ? | 3 breakpoint |
| Code Quality | 9.1 | ? | ? | Bundle + dead code |

---

## Nota sulla Lavagna e Breadboard

L'utente ha richiesto specificamente:
> "migliorare la lavagna, scrivere meglio anche su breadboard"

Questo va OLTRE l'audit — è una richiesta di feature. Dopo l'audit:
1. Documentare lo stato attuale della lavagna (FASE 5)
2. Proporre piano di miglioramento con queste funzionalità:
   - **Testo sulla lavagna**: tool testo con font, dimensione, colore
   - **Forme**: linea retta, freccia, rettangolo, cerchio
   - **Scrivere sulla breadboard**: overlay lavagna che appare SOPRA il simulatore
   - **Undo/Redo**: stack di azioni
   - **Esportazione**: salva come PNG
3. Implementare le migliorie richieste (se il tempo lo permette)

---

## Script Playwright

Per ogni FASE, creare uno script `session19-faseN.mjs` che:
1. Naviga alla pagina target
2. Interagisce con ogni pulsante/elemento
3. Prende screenshot con nome descrittivo
4. Logga risultati strutturati (PASS/FAIL/BLOCKED/MOCK)
5. Distingue ALWAYS tra: funzionalità REALE vs UI-ONLY vs BLOCKED

**Chromium path**: `/Users/andreamarro/Library/Caches/ms-playwright/chromium-1161/chrome-mac/Chromium.app/Contents/MacOS/Chromium`
**Base URL**: `https://elab-builder.vercel.app`

---

## Timeline Stimata

| Fase | Durata | Tipo |
|------|--------|------|
| FASE 0 | 5 min | Prep |
| FASE 1 | 15 min | Auth E2E |
| FASE 2 | 10 min | Navbar |
| FASE 3 | 15 min | Galileo AI |
| FASE 4 | 20 min | Tutor V4 tabs |
| FASE 5 | 15 min | Lavagna |
| FASE 6 | 20 min | Giochi |
| FASE 7 | 20 min | Area Docente |
| FASE 8 | 25 min | Admin + Gestionale |
| FASE 9 | 15 min | Responsive |
| FASE 10 | 10 min | Code Quality |
| FASE 11 | 10 min | Licenza E2E |
| FASE 12 | 15 min | Report |
| **TOTALE** | **~3h** | |

---

## Dopo l'audit: IMPLEMENTAZIONI

Se il tempo lo permette (o nella sessione successiva):
1. **Migliorare lavagna** (tool testo, forme, undo, export)
2. **Overlay breadboard** (scrivere annotazioni sopra il simulatore)
3. Fix qualsiasi P0/P1 trovato durante l'audit

---

*Prompt scritto da Andrea + Claude — 19/02/2026*
*Filosofia: se non è testato con Playwright, non è verificato.*
*Se è mock data, lo diciamo. Se è un placeholder, lo diciamo.*
*Nessun voto regalato.*
