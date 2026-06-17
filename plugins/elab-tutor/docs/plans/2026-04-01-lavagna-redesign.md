# ELAB Lavagna — Design Document
**Data:** 01/04/2026
**Autore:** Andrea Marro + Claude Code
**Stato:** In approvazione

---

## 1. VISIONE

ELAB diventa una **lavagna digitale per l'elettronica**. Non un sito web con pagine. Uno spazio di lavoro dove tutto succede: circuiti, codice, AI tutor, video, appunti.

Il docente apre ELAB alla LIM → vede una lavagna → inizia a insegnare.

### Principi di Design
- **95% lavagna, 5% chrome** — il simulatore occupa quasi tutto lo schermo
- **Pannelli flottanti** — trascinabili, ridimensionabili, minimizzabili (come finestre)
- **Zero navigazione tra pagine** — tutto accessibile dalla lavagna
- **Stato-driven** — l'interfaccia cambia in base a cosa fai (costruisci, scrivi codice, esegui)
- **Lavagna pulita** — primo accesso = breadboard vuoto, Galileo dice "Cosa costruiamo?"
- **Zero regressioni** — il vecchio codice (#tutor) non si tocca mai

### Riferimenti Estetici
- **PhET** (98% workspace, floating panels)
- **Tinkercad Circuits** (parts slide-in, code slide-up)
- **Claude.ai** (chat panel, minimal chrome)
- **tldraw** (floating toolbar, canvas-first)
- **Brilliant** (progress bar, step-by-step)

---

## 2. ARCHITETTURA — Strangler Fig

```
FASE 1-7:  #tutor funziona normalmente (INTATTO)
           #lavagna cresce accanto (NUOVO route)

FASE 8:    #tutor → redirect a #lavagna
           vecchio codice rimosso
```

### Route
```
elab-builder.vercel.app/#tutor     → UI attuale (mai toccata)
elab-builder.vercel.app/#lavagna   → NUOVA esperienza
```

### Struttura Componenti (solo file NUOVI)
```
src/components/lavagna/
  AppShell.jsx              — Shell: header + body + panels
  AppShell.module.css
  AppHeader.jsx             — Barra top 48px glassmorphism
  AppHeader.module.css
  FloatingWindow.jsx        — Finestra trascinabile/ridimensionabile (riusata 3x)
  FloatingWindow.module.css
  ExperimentPicker.jsx      — Modal selezione esperimenti per volume
  ExperimentPicker.module.css
  RetractablePanel.jsx      — Pannello slide-in/out (sinistra, destra, basso)
  RetractablePanel.module.css
  FloatingToolbar.jsx       — Toolbar strumenti flottante sul canvas
  FloatingToolbar.module.css
  VideoFloat.jsx            — YouTube + videocorsi wrapper per FloatingWindow
  VideoFloat.module.css
  LavagnaStateManager.js    — State machine per pannelli auto (build/code/run/stuck)
```

### File Esistenti NON Modificati (fino a S8)
- NewElabSimulator.jsx — INTATTO
- Tutti i 21 SVG — INTATTI
- Engine (CircuitSolver, AVRBridge, SimulationManager) — INTATTI
- UnlimWrapper, UnlimInputBar, UnlimMascot, UnlimOverlay, UnlimReport — INTATTI
- voiceCommands, voiceService, unlimMemory — INTATTI
- simulator-api.js — INTATTO
- ChatOverlay.jsx — INTATTO (wrappato in FloatingWindow)
- CodeEditorCM6, ScratchEditor — INTATTI (wrappati in RetractablePanel)
- ComponentDrawer, ComponentPalette — INTATTI (wrappati in RetractablePanel)
- Tutti i servizi (24 file) — INTATTI
- Tutti i dati (69 file) — INTATTI
- Tutti i test (1001) — PASSANO SEMPRE

### Unica Modifica a File Esistente (1 riga in App.jsx)
```jsx
// In App.jsx, aggiungere solo:
if (currentPage === 'lavagna') return <LavagnaShell />;
```

---

## 3. LAYOUT LAVAGNA

```
┌──────────────────────────────────────────────────────┐
│ AppHeader (48px, glassmorphism)                       │
│ [≡] ELAB │ [Esperimento ▾] │ [●●●○○○ 3/7] │ [▶]    │
├─────┬────────────────────────────────────┬───────────┤
│     │                                    │           │
│  R  │                                    │  Floating │
│  e  │     SimulatorCanvas                │  Window:  │
│  t  │     (breadboard + componenti)      │  Galileo  │
│  r  │                                    │  o Video  │
│  a  │     [FloatingToolbar]              │  o Manual │
│  c  │     [⟲ ⟳ ✂ 🔌 ✏ ▶]              │           │
│  t  │                                    │           │
│  a  │                                    │           │
│  b  │                                    │           │
│  l  │                                    │           │
│  e  │                                    │           │
├─────┴────────────────────────────────────┴───────────┤
│ RetractablePanel (bottom): Code/Scratch/Monitor/Steps │
│ [Arduino C++] [Blocchi] [Monitor] [Passi]        [↕] │
│ void setup() { pinMode(13, OUTPUT); }                 │
└──────────────────────────────────────────────────────┘
```

### AppHeader (48px)
- Glassmorphism: `backdrop-filter: blur(12px)`, sfondo semi-trasparente
- Sinistra: hamburger menu + logo ELAB
- Centro: nome esperimento (click → ExperimentPicker) + progress dots
- Destra: toggle 3 modalita + bottone Play + avatar utente
- Seconda tab "Classe" per docenti (carica TeacherDashboard nel body)

### RetractablePanel (3 direzioni)
- **Sinistra**: ComponentDrawer (parti da trascinare)
- **Destra**: riservato per FloatingWindow (Galileo/Video)
- **Basso**: CodeEditor + Scratch + Monitor + Steps (tab)
- Tutti hanno: maniglia resize, toggle apri/chiudi, animazione 300ms ease
- Tutti salvano dimensione in localStorage

### FloatingToolbar
- Posizione: centro-basso del canvas, sopra il pannello codice
- 6-8 icone: Seleziona, Filo, Elimina, Undo, Redo, Penna
- Stile: `border-radius: 12px`, `box-shadow`, `backdrop-filter: blur(8px)`
- Visibile solo quando il mouse e sul canvas

---

## 4. FLOATING WINDOW — Il Componente Chiave

Un solo componente riusato per 3 scopi:

### Specifiche
- **Drag**: dalla barra titolo, posizionabile ovunque sulla lavagna
- **Resize**: da angoli e bordi (min 280x200, max 80% viewport)
- **Minimize**: bottone `─` → diventa icona flottante con badge
- **Maximize**: bottone `□` → fullscreen (occupa tutto il body)
- **Close**: bottone `✕` → nasconde (torna a icona)
- **Doppio click titolo**: toggle tra pannello laterale fisso e flottante
- **Z-index**: click porta in primo piano (come finestre OS)
- **Persistenza**: posizione e dimensione salvate in localStorage

### 3 Istanze

#### Galileo (Chat AI — stile Claude.ai)
- Contenuto: ChatOverlay.jsx (esistente, wrappato)
- Input bar ancorata in basso
- Messaggi con streaming
- Voice (STT/TTS) funziona identico
- UNLIM wrapper, mascotte, intent, memoria — tutto invariato
- Default: pannello laterale destro (320px)

#### Video (YouTube + Videocorsi)
- YouTube embed via iframe (URL incollato o catalogo ELAB)
- Catalogo videocorsi: JSON con lista curata di video didattici
- Controlli nativi YouTube (play, pause, seek, fullscreen)
- Default: flottante (480x320)

#### Manuale (Documentazione)
- Contenuto: ManualTab.jsx / NotebooksTab.jsx (esistenti, wrappati)
- Default: flottante (400x500)

---

## 5. EXPERIMENT PICKER

Modal che si apre dal click sul nome esperimento nella header.

### Layout
```
┌─────────────────────────────────────────────────┐
│  Scegli Esperimento                    [✕]      │
│  [🔍 Cerca...]                                  │
│                                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ VOL 1   │  │ VOL 2   │  │ VOL 3   │         │
│  │ Basi    │  │ Interm. │  │ Avanz.  │         │
│  │ #4A7A25 │  │ #E8941C │  │ #E54B3D │         │
│  └─────────┘  └─────────┘  └─────────┘         │
│                                                  │
│  Cap 6: Primi Circuiti                          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │
│  │LED   │ │2 LED │ │Resis.│ │Parall│           │
│  │base ✓│ │  ✓   │ │      │ │      │           │
│  └──────┘ └──────┘ └──────┘ └──────┘           │
│                                                  │
│  Cap 7: Pulsanti                                │
│  ┌──────┐ ┌──────┐                              │
│  │Pulsa.│ │Pull-u│                              │
│  │      │ │  🔒  │  ← volume bloccato           │
│  └──────┘ └──────┘                              │
│                                                  │
│  🔒 Sblocca Volume 2  [Inserisci codice]        │
└─────────────────────────────────────────────────┘
```

- Card per ogni esperimento con titolo + icona + stato (completato/in corso/bloccato)
- Volumi come tab colorate in alto
- Volumi bloccati: lucchetto + CTA "Sblocca con codice licenza"
- Ricerca per nome esperimento
- Animazione apertura: fade + scale 0.95→1.0

---

## 6. STATO-DRIVEN PANELS

La lavagna cambia automaticamente in base a cosa sta facendo l'utente:

| Stato | Parti (sx) | Codice (basso) | Galileo (dx) | Toolbar |
|-------|-----------|----------------|--------------|---------|
| **Costruisci** | APERTO | chiuso | minimizzato | visibile |
| **Scrivi codice** | chiuso | APERTO | mostra hints | nascosta |
| **Esegui** | chiuso | ridotto (monitor) | narra output | nascosta |
| **Bloccato** | chiuso | invariato | SI ESPANDE auto | visibile |
| **Lavagna pulita** | chiuso | chiuso | "Cosa costruiamo?" | visibile |

Transizioni animate (300ms ease). L'utente puo sempre override manualmente (drag/resize).

---

## 7. COSA SI RIMUOVE (Sessione 7)

| File | LOC | Motivo |
|------|-----|--------|
| tutor/CircuitDetective.jsx + .module.css | ~400 | Gioco: rimosso |
| tutor/PredictObserveExplain.jsx + .module.css | ~500 | Gioco: rimosso |
| tutor/ReverseEngineeringLab.jsx + .module.css | ~400 | Gioco: rimosso |
| tutor/CircuitReview.jsx | ~300 | Gioco: rimosso |
| data/mystery-circuits.js | ~100 | Dati gioco |
| data/review-circuits.js | ~100 | Dati gioco |
| hooks/useGameScore.js | ~50 | Hook giochi |
| Sezione giochi in TutorSidebar.jsx | ~40 | Nav giochi |
| VetrinaSimulatore.jsx const S={} | ~400 | Dead code (gia migrato a CSS module) |
| **TOTALE** | **~2,290 LOC** | **Rimossi** |

---

## 8. PIANO SESSIONI

| # | Sessione | File NUOVI | File MODIFICATI | Rischio |
|---|----------|-----------|----------------|---------|
| 0 | Pre-S1: preparazione | 0 | 0 | ZERO |
| 1 | AppShell + AppHeader + FloatingWindow + route #lavagna | 6 nuovi | App.jsx (1 riga) | ZERO |
| 2 | Galileo/UNLIM in FloatingWindow (drag/resize/fullscreen) | 1 nuovo | 0 | ZERO |
| 3 | VideoFloat (YouTube + catalogo videocorsi) | 2 nuovi | 0 | ZERO |
| 4 | RetractablePanel (3 dir) + FloatingToolbar + ExperimentPicker | 4 nuovi | 0 | ZERO |
| 5 | Dashboard docente come tab nello shell | 1 nuovo (adapter) | 0 | BASSO |
| 6 | Dashboard studente + Vetrina V2 (landing pre-login) | 2 nuovi | 0 | BASSO |
| 7 | Rimozione giochi + dead code + pulizia | 0 | ~10 (rimozione) | BASSO |
| 8 | Switch #tutor → #lavagna + rimozione vecchio layout | 0 | App.jsx + redirect | BASSO |

**Sessioni 1-4: ZERO file esistenti modificati. Solo file nuovi.**
**Sessioni 5-6: Solo file adapter/wrapper nuovi.**
**Sessioni 7-8: Solo rimozione (sottrarre, non aggiungere).**

---

## 9. VINCOLI ASSOLUTI

- 1001+ test DEVONO passare dopo ogni sessione
- Engine/ INTOCCABILE (CircuitSolver, AVRBridge, SimulationManager)
- 21 SVG components INTOCCABILI
- UNLIM (11 file, 2430 LOC) INTOCCABILE — solo wrappato in FloatingWindow
- Palette: Navy #1E4D8C, Lime #4A7A25, Vol2 #E8941C, Vol3 #E54B3D
- CSS modules per tutto il nuovo codice
- Zero emoji — ElabIcons.jsx SVG
- Build + precache ~5000KB, 33 entries
- Rollback istantaneo: rimuovere 1 riga da App.jsx per tornare al vecchio

---

## 10. TOUCH-FIRST + LIM + iPAD

### Target Dispositivi
- **LIM** (1024x768 minimo) — il caso d'uso principale
- **iPad** (1024x768 / 1366x1024) — touch, no mouse
- **PC/Mac** (1280x800+) — mouse + tastiera
- **Chromebook** (1366x768) — touch + tastiera

### Specifiche Touch (iPad)
- Touch target MINIMO 48px (non 44px — Apple raccomanda 44pt ma 48px e piu sicuro)
- FloatingWindow: drag dalla barra titolo con touch (pointer events, non mouse events)
- FloatingWindow: resize da angoli con area touch 48px (invisibile ma tappabile)
- RetractablePanel: swipe gesture per aprire/chiudere (touch-action: pan-y)
- FloatingToolbar: icone 48x48 con gap 8px tra loro
- ExperimentPicker: card 80x80 minimo, scroll touch naturale
- Doppio tap sulla barra titolo = toggle maximize
- Long press su componente = context menu (invece di right-click)
- Pinch-to-zoom sul canvas (gia supportato da SimulatorCanvas)
- -webkit-overflow-scrolling: touch su tutti gli scroll container

### Specifiche LIM
- Font minimo 14px (gia applicato da accessibility-fixes.css)
- Contrasto WCAG AA su TUTTO (proiettore = colori lavati)
- Header 48px NON di piu (ogni pixel conta su 1024x768)
- Pannello codice basso: altezza default 200px (non 280px) su schermi < 900px
- Pannello parti sinistro: larghezza default 160px su schermi < 1100px
- FloatingWindow Galileo: max 300px width su schermi < 1200px

### CSS Strategy
```css
/* Breakpoints */
@media (max-width: 1024px)  { /* iPad portrait, LIM small */ }
@media (max-width: 1366px)  { /* iPad landscape, Chromebook */ }
@media (min-width: 1440px)  { /* Desktop ampio */ }
@media (pointer: coarse)    { /* Touch device — ingrandisci target */ }
@media (hover: none)         { /* No mouse — nascondi hover effects */ }
```

### Design "Davvero Figo"
- **Glassmorphism header**: `backdrop-filter: blur(16px)`, bordo sottile luminoso `border-bottom: 1px solid rgba(255,255,255,0.1)`, sfondo `rgba(30,77,140,0.85)`
- **FloatingWindow**: `border-radius: 16px`, `box-shadow: 0 8px 32px rgba(0,0,0,0.15)`, barra titolo con gradient sottile, angoli resize con dot-grip pattern visibile al hover/touch
- **RetractablePanel**: animazione slide con `cubic-bezier(0.4, 0, 0.2, 1)` (Material motion), ombra che si intensifica quando aperto
- **FloatingToolbar**: `backdrop-filter: blur(12px)`, `border-radius: 14px`, icone con micro-animazione al tap (scale 0.9→1.0, 100ms), glow sottile sull'icona attiva
- **ExperimentPicker**: card con `hover: translateY(-2px) + shadow grow`, badge completamento con animazione confetti al primo unlock
- **Transizioni pannelli**: 300ms `cubic-bezier(0.4, 0, 0.2, 1)`, opacity fade sincronizzato
- **Progress dots header**: pallini che si riempiono con animazione radiale al completamento step
- **Canvas background**: pattern puntinato sottilissimo (come Excalidraw/Figma) → segnale visivo "questo e un workspace"

---

## 11. PRESERVAZIONE COMPLETA FUNZIONALITA

### Tutto Preservato — Checklist

#### Simulatore Core
- [ ] 21 componenti SVG — identici
- [ ] CircuitSolver MNA/KCL — intoccato
- [ ] AVRBridge + avrWorker — intoccato
- [ ] SimulationManager — intoccato
- [ ] SimulatorCanvas (zoom, pan, drag, pinch) — identico
- [ ] WireRenderer (bezier, selezione, animazione corrente) — identico
- [ ] DrawingOverlay (penna, colori, spessori) — identico
- [ ] Annotations — identiche
- [ ] BOM Panel — identico
- [ ] Properties Panel — identico
- [ ] Undo/Redo — identico

#### UNLIM / Galileo AI
- [ ] UnlimWrapper + intent system — identico
- [ ] UnlimInputBar (testo + voice) — identico
- [ ] UnlimMascot (robot SVG, 4 mood) — identico
- [ ] UnlimOverlay (messaggi contestuali) — identico
- [ ] UnlimReport (fumetto, foto, PDF) — identico
- [ ] ChatOverlay (streaming, SafeMarkdown) — wrappato in FloatingWindow
- [ ] 62 welcome messages — identici

#### Voice
- [ ] 24 comandi vocali — identici
- [ ] STT (Web Speech API) — identico
- [ ] TTS (chunking, voice ranking, rate 0.95) — identico
- [ ] Guard feedback loop — identico

#### Codice
- [ ] CodeEditorCM6 (C++ highlighting) — identico, wrappato in RetractablePanel
- [ ] ScratchEditor (blocchi, palette ELAB) — identico
- [ ] Compilatore remoto (n8n) — identico
- [ ] compileCache — identico
- [ ] errorTranslator (italiano bambini) — identico
- [ ] HEX precache offline — identico

#### Connessioni / Backend
- [ ] Supabase client + sync — identico
- [ ] n8n webhook (Galileo AI) — identico
- [ ] Nanobot (Render) — identico
- [ ] Analytics webhook (7 eventi) — identico
- [ ] Nudge service (4-layer) — identico
- [ ] Notion integration — identico

#### Esperimenti / Dati
- [ ] 62 esperimenti (38+18+6) — identici
- [ ] 63 lesson paths — identici
- [ ] 3 modalita (Gia Montato / Passo Passo / Libero) — identiche
- [ ] Passo Passo (ComponentDrawer) — identico
- [ ] ExperimentGuide — identico
- [ ] LessonPathPanel — identico
- [ ] QuizPanel — identico

#### Dashboard
- [ ] TeacherDashboard (classi, studenti, progressi, report, sicurezza) — wrappato come tab
- [ ] StudentDashboard (badge, mood, diario, esperimenti) — wrappato come drawer/tab
- [ ] Gamification (punti, badge, streak, confetti, suoni) — identico
- [ ] CSV export + print report + recharts — identico

#### Auth / Sicurezza
- [ ] Login / Register — identici (pre-lavagna)
- [ ] RequireAuth / RequireLicense — identici
- [ ] GDPR consent banner — identico
- [ ] PII encryption — identico
- [ ] CSP headers — identici

#### Offline
- [ ] Service worker (33 precache) — identico
- [ ] 12 HEX files precache — identici
- [ ] 4 woff2 fonts precache — identici
- [ ] StaleWhileRevalidate lazy chunks — identico
- [ ] OfflineBanner — identico
- [ ] Supabase offline queue — identico

#### Scrittura / Appunti
- [ ] NotebooksTab — identico, wrappato in FloatingWindow "Manuale"
- [ ] WhiteboardOverlay — identico
- [ ] NotesPanel — identico
- [ ] DrawingOverlay (penna) — identico
- [ ] SessionReportPDF — identico

**TOTALE: 80+ funzionalita. Zero modificate. Solo wrappate in nuovi container.**

---

## 12. RISULTATO ATTESO

| Aspetto | Prima (#tutor) | Dopo (#lavagna) |
|---------|---------------|-----------------|
| Chrome | 20-30% schermo | 5% schermo |
| Navigazione | 9 pagine separate | 1 lavagna + picker |
| Galileo | pannello fisso | finestra trascinabile stile Claude |
| Video | tab nella sidebar | finestra flottante YouTube |
| Toolbar | barra fissa top | toolbar flottante sul canvas |
| Pannelli | fissi, non ridimensionabili | ritrattabili, resize, animati |
| Primo accesso | sidebar + volume chooser | lavagna pulita + "Cosa costruiamo?" |
| Coerenza visiva | 6 layout diversi | 1 shell, 1 design language |
| Giochi | 4 pagine separate | rimossi (Galileo fa quiz inline) |
| Esperienza docente LIM | "sito web" | "lavagna digitale professionale" |
