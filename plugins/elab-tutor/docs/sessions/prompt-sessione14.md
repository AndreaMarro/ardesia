# PROMPT SESSIONE 14 — ELAB ECOSYSTEM: FIX FINALE + VIDEO PRESENTAZIONE
# Multi-Wave Team of Agents — Chrome Automated Testing + Remotion Video
# Data: 19/02/2026
# Autore: Andrea Marro
# Score attuale: 8.7/10 (Chain of Verification 19/02/2026)

---

## CONTESTO GLOBALE

### Architettura
- **Sito Pubblico**: `/Users/andreamarro/VOLUME 3/PRODOTTO/newcartella/` → Netlify (https://funny-pika-3d1029.netlify.app)
- **ELAB Tutor "Galileo"**: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/` → Vercel (https://elab-builder.vercel.app)
- **Backend AI**: n8n su Hostinger
- **69 esperimenti**: Vol1 (38) + Vol2 (18) + Vol3 (13)

### Account di Test (VERIFICATI 18/02/2026)
| Ruolo | Email | Password | RBAC |
|-------|-------|----------|------|
| Admin | `debug@test.com` | `Xk9#mL2!nR4` | Tutor + Area Docente + Admin |
| Teacher | `teacher@elab.test` | `Pw8&jF3@hT6!cZ1` | Tutor + Area Docente |
| Student | `student@elab.test` | `Ry5!kN7#dM2$wL9` | Solo Tutor |
| Admin | `marro.andrea96@gmail.com` | `Bz4@qW8!fJ3#xV6` | Tutor + Area Docente + Admin |

### Palette ELAB
Navy: `#1E4D8C` | Lime: `#7CB342` | Vol1: `#7CB342` | Vol2: `#E8941C` | Vol3: `#E54B3D`

### Firma
`© Andrea Marro — DD/MM/YYYY` (ogni 200 righe di codice, watermark dinamica)

---

## STATO ATTUALE — Cosa e stato fatto nelle sessioni pre-14

### FIX COMPLETATI E DEPLOYATI
| Fix | Stato | Dettaglio |
|-----|-------|-----------|
| Emoji escape sequences | DONE | 144 sostituzioni in 22+ file |
| OnboardingOverlay viewport | DONE | clampToBounds + auto-flip + maxWidth/maxHeight |
| Galileo Modalita Guida | DONE | Default OFF, SOCRATIC_INSTRUCTION riscritta |
| n8n offline handling | DONE | KPI nascosti, solo warning banner + quick actions |
| Firma ogni 200 righe | DONE | 258 firme in 111 file |
| Monta Tu generation | DONE | 51 buildSteps generati (33 Vol1 + 18 Vol2), coverage 56/56 = 100% |
| Mobile: Admin tables | DONE | Fix inverted minWidth ternaries in AdminUtenti + AdminCommunity |
| Mobile: Login/Register | DONE | Card padding responsive per mobile |
| Mobile: OnboardingWizard | DONE | Padding + maxHeight dvh |
| Mobile: StudentDashboard | DONE | Header responsive, full-width CTA |
| Mobile: Admin modals | DONE | Verificati gia responsive (GestionaleStyles + AdminWaitlist) |
| Deploy Vercel | DONE | https://elab-builder.vercel.app |

### PROBLEMI ANCORA APERTI (19/02/2026)
#### P0 Critico
- **Vol3 buildSteps**: mancano step piazzamento Arduino/NanoBreakout (13 esperimenti da aggiornare)
- **Errori nei collegamenti Monta Tu**: buildSteps generati automaticamente, non verificati uno per uno in Chrome
- **Componenti sovrapposti nel simulatore**: layout position adjustments per esperimento

#### P1 Important
- n8n offline → KPI dashboard all N/A
- RegisterPage.jsx: subtitle "Unisciti alla community ELAB"
- Console: "Social Auth Ready: Google, Facebook, Apple" log in elab-client.js
- community.html, gruppi.html, profilo.html accessibili via URL diretto
- Login benefit: "Connettiti con altri maker" (community-ish)
- Rate limiter in-memory (reset on cold start serverless)
- License activation MVP (qualsiasi ELAB-XXXX-XXXX accettato)
- auth-reset-confirm.js usa SHA-256 invece di bcrypt

#### P2 Minor
- Watermark Netlify statica "08/02/2026" (Vercel e dinamica)
- login.html title "ELAB Community" instead of "ELAB Tutor"
- Dopo logout, resta su route protetta (no redirect a #login)
- Hero /corsi contiene testo "community"
- Stale Vite chunk post-deploy (browser cache)

---

## REGOLE ASSOLUTE PER TUTTI GLI AGENTI

1. **MASSIMA ONESTA**: Ogni agente DEVE segnalare OGNI problema trovato, senza minimizzare.
2. **SCREENSHOT**: Ogni verifica accompagnata da screenshot Chrome o snapshot.
3. **FIX IMMEDIATO**: Se trovi un bug, FIXalo e verifica con secondo screenshot.
4. **CHAIN OF VERIFICATION**: Dopo ogni fix, rifa la verifica completa.
5. **COMUNICAZIONE**: Agenti comunicano tra loro. Problema cross-wave → avvisa subito.
6. **REPORT**: Ogni wave produce report strutturato PASS/FAIL con screenshot.
7. **NO FALSI POSITIVI**: Non segnare PASS senza verifica Chrome.
8. **FIRMA**: `© Andrea Marro — DD/MM/YYYY` ogni 200 righe + watermark dinamica.

---

## WAVE 1 — SITO PUBBLICO: Struttura e Navigazione

### Agente 1A: Homepage + SEO
**Target**: https://funny-pika-3d1029.netlify.app/
- [ ] Title tag, meta description, Open Graph tags
- [ ] Navbar: Home, I Kit, Corsi, Eventi, Beta, Acquista, Accedi — ZERO "Community"
- [ ] Hero section: testo, CTA, immagini caricano
- [ ] Kit section: Vol1 (55€), Vol2 (75€), Vol3 "In Arrivo" — link Amazon funzionanti
- [ ] Newsletter form "Resta Aggiornato" presente e funzionante
- [ ] Footer: © 2026, social links, privacy, termini
- [ ] Watermark dinamica "Andrea Marro — [DATA ODIERNA]"
- [ ] Console: ZERO errori JavaScript
- [ ] Responsive: 375px, 768px, 1280px

### Agente 1B: Pagine Informative
**Target**: chi-siamo, scuole, privacy, termini, 404
- [ ] Ogni pagina carica senza errori, navbar e footer consistenti
- [ ] Watermark dinamica, contenuto reale (no placeholder)
- [ ] ZERO riferimenti a "Community"
- [ ] privacy.html: GDPR reale | termini.html: T&C reali
- [ ] 404.html funzionante su /pagina-inesistente

### Agente 1C: Login + Reset Password
**Target**: login.html, reset-password.html
- [ ] login.html title = "Accedi | ELAB" (NON "ELAB Community")
- [ ] ZERO bottoni social (Google, Apple, Facebook rimossi)
- [ ] Benefit list: NESSUN testo community-ish → segnalare "Connettiti con altri maker"
- [ ] Console: ZERO log "Social Auth Ready"
- [ ] Test login reale con `student@elab.test` → redirect a Vercel
- [ ] Test password errata → errore chiaro

### Agente 1D: Kit + Negozio + Corsi
- [ ] kit.html: 3 volumi con descrizioni, prezzi, immagini
- [ ] negozio.html: link Amazon funzionanti per Vol1 e Vol2, Vol3 "Coming Soon"
- [ ] corsi.html: banner arancione "I video corsi sono in preparazione!"
- [ ] Hero corsi: ZERO "community"

### Agente 1E: Eventi + Beta + Pagine Dead
- [ ] eventi.html: solo eventi futuri (filtro client-side)
- [ ] beta-test.html: link diretto al tutor (NO PasswordGate)
- [ ] community.html, gruppi.html, profilo.html: SEGNALARE se accessibili → devono essere redirect o rimossi
- [ ] ordine-completato.html: layout corretto
- [ ] admin.html, dashboard.html: NON accessibili senza login

---

## WAVE 2 — SITO PUBBLICO: Qualita e Performance

### Agente 2A: Performance + Asset
- [ ] Homepage carica < 3s
- [ ] Immagini ottimizzate, CSS/JS minificati
- [ ] Nessun asset 404, nessun mixed content
- [ ] Console errors su TUTTE le pagine

### Agente 2B: Responsive Cross-Viewport
- [ ] 3 viewport: 375px, 768px, 1280px
- [ ] Navbar hamburger funzionante, form usabili, nessun overflow-x
- [ ] Kit cards impilate su mobile, footer leggibile

### Agente 2C: Link Integrity + Newsletter E2E
- [ ] Tutti i link interni e esterni funzionano
- [ ] Newsletter: compilare, inviare → verifica server response
- [ ] Waitlist salva su Notion (se verificabile)

---

## WAVE 3 — ADMIN + GESTIONALE

### Agente 3A: Admin Dashboard
**Login**: `debug@test.com` / `Xk9#mL2!nR4` → `#admin`
- [ ] Navbar: "Tutor", "Area Docente", "Admin" — ZERO "Community"
- [ ] Sidebar: Dashboard, Utenti, Ordini, Corsi, Eventi, Waitlist, Licenze, Gestionale — ZERO "Community"
- [ ] KPI: warning "n8n offline" o dati reali
- [ ] Quick Actions: ZERO "Modera Community"
- [ ] Admin Onboarding 5 step se localStorage pulito → salva, non riappare

### Agente 3B: Gestionale ERP
- [ ] Tabella carica (anche vuota se n8n offline)
- [ ] Pagination 50/pagina, filtri, ricerca
- [ ] CRUD (se n8n online), export PDF (lazy @react-pdf)
- [ ] Nessun crash su dati vuoti

### Agente 3C: Tutti i Tab Admin
**Per ogni tab (Utenti, Ordini, Corsi, Eventi, Waitlist, Licenze)**:
- [ ] Carica, contenuto appropriato, ZERO "Community"
- [ ] Pulsanti funzionano o stato "offline", layout OK

### Agente 3D: RBAC Verification
- [ ] Admin `debug@test.com`: Tutor + Area Docente + Admin
- [ ] Admin `marro.andrea96@gmail.com`: stessi permessi
- [ ] Teacher `teacher@elab.test`: Tutor + Area Docente — NO Admin
- [ ] Student `student@elab.test`: solo Tutor
- [ ] Direct nav `#admin` come student → redirect/errore
- [ ] Logout ogni account → redirect `#login`

---

## WAVE 4 — SIMULATORE: 69 Esperimenti Funzionali

### Agente 4A: Volume 1 — Esperimenti 1-19
**Login**: `debug@test.com` → `#tutor` → Simulatore → Volume 1
**Per OGNI esperimento**:
- [ ] Si carica senza errori, circuito visibile sulla breadboard
- [ ] Componenti posizionati, connessioni visibili
- [ ] Play/Simula funziona, LED si accendono, multimetro mostra valori
- [ ] Zero errori JavaScript in console

### Agente 4B: Volume 1 — Esperimenti 20-38
Stesse verifiche di 4A

### Agente 4C: Volume 2 — 18 esperimenti
Stesse verifiche + pin naming:
- [ ] Capacitor `positive`/`negative` | Pot `vcc`/`signal`/`gnd`
- [ ] RGB LED `red`/`common`/`green`/`blue` | Multimeter `probe-positive`/`probe-negative`

### Agente 4D: Volume 3 — 13 esperimenti
Stesse verifiche + Arduino:
- [ ] Compilazione AVR funziona, Serial Monitor output

---

## WAVE 4.5 — MONTA TU: Verifica Completa (P0 CRITICO)

### STATUS AGGIORNATO (post sessione pre-14):
| Volume | Tot | buildSteps | Status |
|--------|-----|------------|--------|
| Vol1 | 38 | **38/38** | Generati automaticamente — DA VERIFICARE |
| Vol2 | 18 | **18/18** | Generati automaticamente — DA VERIFICARE |
| Vol3 | 13 | 13/13 | Esistenti MA **senza step Arduino/NanoBreakout** |
| **TOTALE** | **69** | **69/69** | **Coverage 100% — Qualita da verificare** |

### Agente 4.5A: Monta Tu — Verifica Coverage e Qualita
**Per OGNI esperimento (69 totali)**:
- [ ] `buildSteps` array presente
- [ ] Step piazzamento componenti: componentId, componentType, targetPins corretti
- [ ] Step connessioni: wireFrom, wireTo, wireColor, hint presenti
- [ ] Ordine logico (componenti prima, fili dopo)
- [ ] Hint didattici comprensibili per bambini 8-12 anni
- [ ] targetPins corrispondono a pinAssignments
- [ ] wireFrom/wireTo corrispondono a connections
- [ ] **Vol3**: step Arduino/NanoBreakout sulla breadboard PRESENTE
  - NanoBreakout: ON breadboard, semicerchio SINISTRA, ala DESTRA

### Agente 4.5B: Monta Tu E2E — Test Chrome (campione 10 esperimenti)
- [ ] Cliccare "Monta Tu!" → buildMode si attiva
- [ ] Step-by-step: ogni step aggiunge componente o filo
- [ ] Componenti nella posizione corretta, fili ai pin giusti
- [ ] Alla fine: circuito completo = modalita "Guarda"
- [ ] Pulsanti "Indietro" e "Reset" funzionano

### Agente 4.5C: Monta Tu — Fix Connessioni Errate
- [ ] Per OGNI esperimento: targetPins match pinAssignments
- [ ] wireFrom/wireTo match connections
- [ ] Discrepanze → FIX immediato → re-test Chrome

---

## WAVE 5 — SIMULATORE: Estetica e Layout

### Agente 5A: NanoBreakout + Breadboard Layout
**PER OGNI ESPERIMENTO**:
- [ ] NanoBreakout SULLA breadboard (non flottante)
- [ ] Semicerchio SINISTRA, ala DESTRA
- [ ] Bus naming: `bus-bot-plus/minus` (NON `bus-bottom-plus/minus`)
- [ ] Componenti NON si sovrappongono
- [ ] Colori fili: rosso=VCC, nero=GND

### Agente 5B: Compilatore Arduino + Toolbar
**Per esperimenti `simulationMode: 'avr'`**:
- [ ] Compila, Carica, Serial Monitor, Reset, Stop funzionano
- [ ] Zoom, pan, screenshot toolbar OK

### Agente 5C: Estetica Generale
- [ ] Canvas 2D Whiteboard renderizza, palette ELAB, font >= 14px
- [ ] Touch target >= 44px, Sticky Notes CRUD, zoom/pan fluidi
- [ ] Force-light theme, watermark visibile

---

## WAVE 6 — ELAB TUTOR: Test Completo

### Agente 6A: Onboarding + Navigazione
**Login**: `student@elab.test` (localStorage pulito)
- [ ] OnboardingWizard 5 step → salva localStorage → non riappare
- [ ] Sidebar: Manuale, Simulatore, Giochi, Personale — ZERO "Community"
- [ ] Navbar: ELAB GALILEO, Volume selector, PROGRESSI 0/69

### Agente 6B: Manuale + Giochi + Personale
- [ ] Manuale navigabile per capitoli
- [ ] Giochi/challenge disponibili
- [ ] Personale: SEGNALARE testo "community, gruppi, profilo"
- [ ] Progressi tracking funzionante

### Agente 6C: Teacher View
**Login**: `teacher@elab.test`
- [ ] Redirect `#teacher`, badge "DOCENTE", "La Serra del Prof." 6 tabs
- [ ] Tutor accessibile, Admin NON accessibile
- [ ] ZERO "Community", OnboardingOverlay teacher funzionante
- [ ] Logout → `#login`

---

## WAVE 7 — VETRINA + GALILEO AI

### Agente 7A: Vetrina Showcase
- [ ] Screenshot reali del simulatore (minimo 4, NON placeholder)
- [ ] Gallery funzionante, lightbox, layout responsivo
- [ ] CTA "Prova il Tutor"

### Agente 7B: Galileo AI
**Login**: `debug@test.com`
- [ ] Input testo, contesto esperimento, errore compilazione
- [ ] Enter + pulsante Send funzionano
- [ ] Risposta Markdown, code blocks, contestualizzata
- [ ] Tempo < 30s, scroll chat, storico sessione
- [ ] Galileo NON sempre socratico — risposte dirette per domande semplici

---

## WAVE 8 — INTEGRAZIONE AI + VISTE RUOLO

### Agente 8A: AI + Simulatore
- [ ] Chat Galileo dal simulatore, conosce esperimento attivo
- [ ] Suggerisce modifiche, analizza errori compilazione
- [ ] n8n webhook risponde o graceful fallback

### Agente 8B-8D: Viste Admin / Teacher / Student
- [ ] Admin: statistiche AI, log (se n8n online)
- [ ] Teacher: Galileo nel tutor, strumenti didattici
- [ ] Student: chat adattata al livello, suggerimenti guidati

---

## WAVE 9 — LEGAL + SECURITY

### Agente 9A: Aspetti Legali
- [ ] privacy.html: GDPR completa (titolare, finalita, base giuridica, conservazione, diritti)
- [ ] termini.html: T&C completi (servizio, utilizzo, responsabilita, legge)
- [ ] Cookie consent, newsletter consenso esplicito
- [ ] Registrazione: link privacy + termini

### Agente 9B: Security Audit
- [ ] bcrypt salt=10 in TUTTI i path (register, login, reset)
  - SEGNALARE: auth-reset-confirm.js usa SHA-256 (inconsistenza)
- [ ] Token HMAC-SHA256, scadenza 7 giorni
- [ ] Rate limiting (SEGNALARE: in-memory, reset cold start)
- [ ] CORS whitelist, API keys solo server-side
- [ ] HTTPS forzato, security headers

### Agente 9C: Netlify Functions Security
Per OGNI function: input validation, error handling, CORS, rate limit, no secrets hardcoded

---

## WAVE 10 — RESPONSIVE + UX CRITICA

### Agente 10A: Responsive Sito Pubblico (Netlify)
**3 viewport**: 375px, 768px, 1280px — **per OGNI pagina**:
- [ ] No overflow-x, testo leggibile, touch target >= 44px
- [ ] Navbar hamburger, form usabili, footer OK, watermark OK

### Agente 10B: Responsive Tutor (Vercel)
**Admin** (`debug@test.com`):
- [ ] KPI, sidebar, tabelle scroll, form, quick actions, gestionale
**Tutor** (`student@elab.test`):
- [ ] Sidebar chiude, simulatore tablet, chat, navbar, volume switcher

### Agente 10C: Onboarding Responsive
- [ ] OnboardingWizard visibile e centrato su 375px
- [ ] OnboardingOverlay tooltip NON esce dal viewport
- [ ] Admin + Teacher onboarding: tooltip visibili ovunque

### Agente 10D: Simulatore Layout — Sovrapposizioni
**Campione 10 esperimenti diversi**:
- [ ] NanoBreakout e Arduino non coperti
- [ ] Componenti non si sovrappongono
- [ ] Wires non passano attraverso componenti
- [ ] Zoom 100% e 50% OK
- [ ] Sovrapposizioni trovate → FIX posizioni

---

## WAVE 11 — VIDEO PRESENTAZIONE CON REMOTION (WAVE FINALE)

### Setup
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO"
npx create-video@latest elab-presentation
cd elab-presentation
npm install
```

### Struttura Video — 90 secondi totale

Il video deve essere **accattivante, naturale, conquistante**. Testo minimo ma d'impatto. Transizioni fluide. Palette ELAB.

#### SCENA 1 — Sito Pubblico (0s - 20s)
**Ritmo**: veloce, dinamico, panoramica del prodotto
- **0-3s**: Logo ELAB animato + tagline "Impara l'elettronica giocando"
- **3-8s**: Homepage flythrough — hero, kit cards (Vol1 verde, Vol2 arancione, Vol3 rosso), prezzi Amazon
- **8-13s**: Pagina Kit con zoom sui 3 volumi + componenti reali
- **13-17s**: Negozio con link Amazon + "Disponibile su Amazon"
- **17-20s**: Quick flash di eventi, corsi "coming soon", form newsletter
- **Testo overlay** (stile minimal): "3 Volumi" → "Kit Reali + Simulatore Digitale" → "Da 55€"

#### SCENA 2 — ELAB Tutor + Galileo + Simulatore (20s - 70s)
**Ritmo**: piu lento, esplorativo, mostra la profondita
- **20-28s**: Login → Dashboard studente → OnboardingWizard (5 step rapidi)
  - Overlay: "69 esperimenti guidati"
- **28-38s**: Simulatore in azione — breadboard con LED che si accendono, multimetro che misura
  - Mostrare "Monta Tu!" step-by-step (componente per componente)
  - Overlay: "Monta Tu: impara costruendo"
- **38-45s**: Compilatore Arduino — codice, compilazione, output Serial Monitor
  - Overlay: "Arduino integrato — compila e simula"
- **45-52s**: Chat Galileo — domanda dello studente → risposta AI contestualizzata
  - Overlay: "Galileo AI — il tuo tutor personale"
- **52-58s**: Manuale interattivo + Progressi + Volume switcher
  - Overlay: "Percorso personalizzato per ogni studente"
- **58-65s**: Vista docente — "La Serra del Prof." con strumenti didattici
  - Overlay: "Strumenti per insegnanti STEM"
- **65-70s**: Idee in fase di sviluppo (icone + testo):
  - "Video corsi" | "Community" | "Gamification avanzata" | "Report classe"

#### SCENA 3 — Area Admin (70s - 85s)
**Ritmo**: professionale, overview gestionale
- **70-75s**: Dashboard admin — KPI cards, quick actions
  - Overlay: "Pannello di controllo completo"
- **75-80s**: Gestionale ERP — tabelle utenti, ordini, fatturazione
  - Overlay: "Gestionale integrato — utenti, ordini, licenze"
- **80-85s**: In fase di implementazione (icone + testo):
  - "Analytics AI" | "Report automatici" | "Integrazione WhatsApp" | "KPI real-time"

#### SCENA 4 — Chiusura (85s - 90s)
- **85-88s**: Logo ELAB grande + "L'elettronica a portata di mano"
- **88-90s**: URL `elab-builder.vercel.app` + "Provalo gratis"

#### WATERMARK COSTANTE
- **In basso a sinistra**, piccolo, sempre presente: `Andrea Marro — 19/02/2026`
- Font: Open Sans 12px, colore bianco con 60% opacita, ombra leggera

#### Stile Visivo
- **Sfondo**: gradient navy → nero (#1E4D8C → #0d1b2a)
- **Accenti**: lime #7CB342 per highlights e CTA
- **Font titoli**: Oswald bold uppercase
- **Font body**: Open Sans
- **Transizioni**: slide-in morbido, scale-up su focus, blur su sfondo
- **Overlay testo**: background rgba nero 50%, bordo arrotondato, padding generoso
- **Screenshots**: catturati direttamente dal sito live (Chrome screenshot tool)
- **MUSICA**: PRIMA del render finale, CHIEDERE ALL'UTENTE quale musica/traccia audio vuole usare. Proporre 3 opzioni (es. royalty-free energetica, ambient elettronica, minimal piano) e aspettare la scelta. Non procedere al render senza conferma musicale.
- **NO**: effetti cheap, no testo eccessivo

### Implementazione Remotion
Creare le seguenti composition:
1. `IntroScene` — Logo + tagline (3s)
2. `SiteOverview` — Screenshots sito con pan/zoom (17s)
3. `TutorShowcase` — Simulatore, Monta Tu, Arduino, Galileo (50s)
4. `AdminOverview` — Dashboard, gestionale, roadmap (15s)
5. `OutroScene` — Logo finale + URL (5s)

Ogni scena usa `<Sequence>` con `from` e `durationInFrames` a 30fps.
Screenshot reali vanno catturati prima e salvati in `public/screenshots/`.

### Checklist Agente 11A: Video Remotion
- [ ] Progetto Remotion creato e funzionante (`npm start` → preview)
- [ ] Screenshot catturati dal sito live (minimo 12)
- [ ] IntroScene: logo animato, tagline, palette ELAB
- [ ] SiteOverview: pan su homepage, kit, negozio, newsletter
- [ ] TutorShowcase: simulatore, Monta Tu, Arduino, Galileo, docente
- [ ] AdminOverview: dashboard, gestionale, roadmap
- [ ] OutroScene: logo, URL, CTA
- [ ] Watermark "Andrea Marro — 19/02/2026" in basso a sinistra su TUTTE le scene
- [ ] Testo overlay: poche parole d'impatto, font Oswald/Open Sans
- [ ] Transizioni fluide tra scene
- [ ] **CHIEDERE ALL'UTENTE** quale musica/traccia audio usare PRIMA del render
- [ ] Render finale: `npx remotion render` → MP4 1080p (con audio scelto)
- [ ] Durata totale: ~90 secondi
- [ ] Risultato: accattivante, naturale, conquistante

---

## PROTOCOLLO POST-WAVE

### Dopo OGNI wave:
1. Report strutturato PASS/FAIL con screenshot
2. Fix applicati → re-deploy → re-verifica Chrome
3. Comunicare risultati al team lead

### PROTOCOLLO FINALE (dopo tutte le wave):

1. **Aggregazione**: report di tutte le 11 wave
2. **Score Card Finale**: punteggio per area con deduzioni oneste
3. **Chrome Re-Verification**: check critici con screenshot freschi
4. **Report**: `memory/chain-of-verification-sessione14.md`
5. **MEMORY.md Update**: aggiornare punteggi e stato
6. **Video**: render MP4 finale da Remotion

### Scoring Rules:
- Fix verificato in Chrome: **+0.1**
- Bug dichiarato: **-0.05** P2, **-0.1** P1, **-0.2** P0
- n8n offline: **neutral** (esterno)
- Target: **>= 9.0/10**

---

## NOTA SULLA FIRMA DEL CODICE

Ogni 200 righe di codice (`.js`, `.jsx`, `.css`, `.html`):
```
// © Andrea Marro — DD/MM/YYYY
```
HTML: `<!-- © Andrea Marro — DD/MM/YYYY -->`
CSS: `/* © Andrea Marro — DD/MM/YYYY */`

---

*Prompt Sessione 14 — v2.0 — Aggiornato 19/02/2026*
*Per Andrea Marro — ELAB Ecosystem Total Verification + Video Presentazione*
*Score partenza: 8.7/10 — Target: >= 9.0/10*
*11 WAVE: 10 di verifica/fix + 1 video Remotion*
