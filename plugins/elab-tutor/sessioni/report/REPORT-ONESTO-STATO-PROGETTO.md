# REPORT MASSIMAMENTE ONESTO — Stato Progetto ELAB

**Data**: 21/02/2026
**Autore**: Claude (Opus 4.6) — senza filtri
**Scopo**: Dire la verità completa, senza arrotondare, senza omissioni

---

## TL;DR — LA VERITÀ IN 5 RIGHE

ELAB è un progetto con **fondamenta solide** (architettura, auth, sicurezza) ma con **buchi critici nell'esperienza utente reale**. Il simulatore mostra circuiti ma non simula fisica reale per Vol1/Vol2. La comunicazione teacher-student è **non funzionante** (localStorage per-browser). 18 esperimenti su 69 non hanno quiz. La mappatura componenti-per-volume nel codice **non corrisponde ai libri fisici**. Molte feature sono state implementate ma **mai testate nel browser da un utente reale**.

---

## 1. COSA FUNZIONA DAVVERO (verificato)

### Sito Pubblico (https://funny-pika-3d1029.netlify.app)
- **20 pagine HTML** funzionanti e deployate
- **5 security headers** attivi (CSP, HSTS, XFO, XCTO, RP)
- **25 Netlify Functions** per auth, classi, admin, ordini
- **Auth server-side** con bcrypt + HMAC-SHA256 + timing-safe comparison
- **8 codici licenza whitelist** (non più regex)
- **RBAC** funzionante: studente, teacher, admin con route guards
- **Score onesto: 8.5/10** — funzionale ma HTML/CSS statico, non una SPA moderna

### ELAB Tutor (https://elab-builder.vercel.app)
- **Build: 0 errori** — Vite 7 + React 19
- **69 esperimenti** (Vol1: 38, Vol2: 18, Vol3: 13) — tutti caricano senza crash
- **21 componenti SVG** — tutti renderizzano, media 8.6/10 visual fidelity
- **CircuitSolver v4** (2,060 LOC) — Union-Find + MNA per Vol1/Vol2
- **AVRBridge** con avr8js — emulazione reale ATmega328p per Vol3
- **CodeEditorCM6** — editor con syntax highlighting, autocomplete, error translation
- **Drag & drop** componenti sulla breadboard
- **Bézier V5 wire routing** — curve naturali con catenary sag
- **4 giochi** (53 sfide): CircuitDetective, POE, ReverseEngineering, CircuitReview
- **Chat Galileo AI** — n8n backend con 3-tier fallback
- **Whiteboard V3** — disegno + selezione/spostamento/ridimensionamento
- **Volume gating** — volumi senza licenza completamente invisibili
- **Score onesto: 7.5/10** — funzionale ma con buchi importanti (vedi sotto)

---

## 2. COSA NON FUNZIONA (la parte scomoda)

### P0 — CRITICO

#### 2.1 Teacher-Student Communication: COMPLETAMENTE ROTTA
- **`studentService.js`** salva TUTTO in `localStorage` del browser dello studente
- **`TeacherDashboard.jsx` riga 217**: chiama `studentService.getAllStudentsData()` — legge localStorage DEL BROWSER DEL TEACHER, non dei browser degli studenti
- **RISULTATO**: Il teacher vede solo i dati degli studenti che hanno usato QUEL BROWSER specifico. In pratica: nessuno.
- **Impatto**: Il teacher dashboard è sostanzialmente vuoto. `getClassReport()` restituisce null o array vuoti.
- **FIX RICHIESTO**: Server-side data sync (Notion DB, Supabase, o Netlify Function che salva dati studente)

#### 2.2 Vol2 Quiz: 0/18 esperimenti hanno quiz
- Vol1: 38/38 con quiz ✓
- Vol3: 13/13 con quiz ✓
- **Vol2: 0/18 con quiz** ← ZERO
- I 18 esperimenti Vol2 non hanno la proprietà `quiz:` nei loro oggetti
- **Impatto**: Lo studente Vol2 non può mai fare quiz dopo gli esperimenti

### P1 — IMPORTANTE

#### 2.3 `auth-list-classes` HTTP 500
- La Netlify Function per listare le classi restituisce errore 500
- **Causa**: Il database Notion per le classi (ID `15ce224a-1c6c-4cf2-9aa2-edfe8be27085`) non è configurato correttamente nel workspace
- **Impatto**: "Le mie classi" nel Teacher Dashboard è rotto
- **Ironia**: Il codice per creare/join classi è corretto — ma non si possono listare

#### 2.4 Email mai testata E2E
- Resend key configurata, template HTML pronto in `emailService.js`
- **Ma nessuno ha mai verificato che una email arrivi in una casella reale**
- L'emailService menziona "67 esperimenti guidati" — numero sbagliato (sono 69)

#### 2.5 PDF dei volumi NON ESISTONO nel progetto
- Il PRD Session 31 diceva: "PDF VOLUMI disponibili in `public/volumes/`"
- **I file `volume1.pdf`, `volume2.pdf`, `volume3.pdf` NON ESISTONO**
- Senza PDF, non è possibile confrontare SVG con illustrazioni dei libri
- **Impatto**: La verifica esperimenti-vs-libri richiesta dall'utente non è mai stata possibile

### P2 — MEDIO

#### 2.6 Mappatura volumeAvailableFrom NON corrisponde ai libri
La tabella nel PRD Session 31 vs il codice reale:

| Componente | PRD dice | Codice dice | Discrepanza? |
|---|---|---|---|
| capacitor | Vol1 ✓ | **Vol2** | **SÌ — il capacitore è in Vol1 nel libro, Vol2 nel codice** |
| potentiometer | Vol1 ✓ | **Vol2** | **SÌ** |
| diode | Vol1 ✓ | **Vol2** | **SÌ** |
| buzzer-piezo | Vol1 ✓ | **Vol2** | **SÌ** |
| photo-resistor | Vol1 ✓ | **Vol2** | **SÌ** |
| reed-switch | Vol1 ✓ | **Vol3** | **SÌ — il PRD dice Vol1, il codice dice Vol3** |
| breadboard-full | PRD: Vol2 | Codice: **Vol1** | **SÌ — in direzione opposta** |
| servo | PRD: Vol3 | Codice: **Vol2** | **SÌ** |
| phototransistor | PRD: Vol2 | Codice: **Vol3** | **SÌ** |
| mosfet-n | PRD: Vol2 | Codice: **Vol3** | **SÌ** |

**Risultato**: ~10 componenti hanno volume sbagliato. Lo studente Vol1 NON vede capacitore, potenziometro, diodo, buzzer — anche se sono nel libro Vol1.

Senza i PDF reali non posso dire CHI ha ragione (PRD o codice). **Ma sicuramente una delle due è sbagliata.**

#### 2.7 Le 3 modalità esperimento NON esistono
L'utente chiede: "pre-assemblato, monta tu con step, drag & drop guidato"
- **Attualmente**: Gli esperimenti hanno solo `simulationMode: "circuit"` o `"avr"`
- Non esiste `buildMode` nei dati degli esperimenti
- Il codice in `NewElabSimulator.jsx` legge `buildMode` ma nessun esperimento lo imposta
- **Risultato**: Tutti i 69 esperimenti vengono caricati in modalità "circuito pre-montato". Non esiste "monta tu" né "drag & drop guidato" come esperienza utente distinta.

#### 2.8 DashboardGestionale 410KB chunk
- recharts bundled nel chunk principale del gestionale
- Funzionalmente corretto, ma pesante

#### 2.9 Whiteboard V3 mai testata nel browser
- Implementata con select/move/resize/delete
- **Mai aperta nel browser da nessuno**. Potrebbe crashare.

#### 2.10 Chat Overlay mobile copre quasi tutto
- Su mobile, il ChatOverlay occupa la maggior parte dello schermo
- UX problematica su device piccoli

### P3 — MINORE

- MobileBottomTabs non filtra giochi teacher-gated
- ChatOverlay disclaimer footer 10px (sotto minimo WCAG)
- Whiteboard text bounds approssimati
- No E2E test suite automatizzata
- Editor Arduino panel bleed-through sotto Lavagna/Detective (z-index)
- Gallery VetrinaSimulatore: 4 immagini aggiunte ma rendering non verificato nel browser

---

## 3. COSA È STATO "FATTO" MA MAI VERIFICATO

Questa è la sezione più importante. Molte feature sono state scritte come codice ma **non sono mai state testate nel browser con un utente reale**:

| Feature | Codice scritto? | Testato nel browser? | Testato con utente reale? |
|---|---|---|---|
| Volume gating (invisibile) | ✓ Session 31 | ✗ | ✗ |
| ComponentPalette filtrata | ✓ Session 31 | ✗ | ✗ |
| Whiteboard V3 (select/move) | ✓ Session 30 | ✗ | ✗ |
| Teacher game toggles | ✓ Session 30 | ✗ | ✗ |
| Class create/join/leave | ✓ Session 30 | Parziale (list rotto) | ✗ |
| Email (welcome/reset) | ✓ Config done | ✗ | ✗ |
| Gallery VetrinaSimulatore | ✓ Session 31 | ✗ | ✗ |
| n8n AI Chat | ✓ Session 30 | ✓ (200 OK) | ✗ |
| 4 giochi con stars | ✓ Session 27 | ✓ (limitato) | ✗ |
| Drag & drop componenti | ✓ Session 30 | ✓ (limitato) | ✗ |

---

## 4. NUMERI VERI (21/02/2026)

### Codebase ELAB Tutor
| Metrica | Valore | Note |
|---|---|---|
| File totali src/ | ~165 | JSX + JS + CSS + JSON |
| Componenti React | 133 | In src/components/ |
| Esperimenti | 69 | 38 + 18 + 13 |
| Componenti SVG | 21 | Tutti >= 8/10 visual |
| Quiz | **51/69** (74%) | Vol2: 0/18 manca |
| Sfide gioco | 53 | 20 + 18 + 15 |
| Codici licenza | 8 | Whitelist server-side |
| LOC experiments data | ~11,900 | Vol1: 6,767 + Vol2: 3,115 + Vol3: 1,991 |
| LOC simulatore core | ~5,500 | NewElabSimulator + Canvas + Solver |
| Bundle principale | ~930KB | ElabTutorV4 |
| Admin bundle | 18.6KB | Code-split OK |
| Build time | ~12s | Vite 7 |
| Dependencies prod | ~21 | React 19, CodeMirror, avr8js, recharts... |

### Codebase Sito Pubblico
| Metrica | Valore | Note |
|---|---|---|
| Pagine HTML | 20 | Statiche, no framework |
| Netlify Functions | 25 | Auth + admin + classi |
| CSS files | 5 attivi | 176KB totali |
| JS files | 8 | 128KB totali |
| Images | 35 | 8.6MB |
| Videos | 2 | 28MB |
| Security headers | 5/5 | CSP+HSTS+XFO+XCTO+RP |

---

## 5. SCORE ONESTI (senza arrotondare)

### Metodo di scoring:
- **10/10**: Perfetto, testato E2E, zero bug noti
- **9/10**: Funzionale, testato, bug solo cosmetici
- **8/10**: Funziona, ma con limitazioni note non critiche
- **7/10**: Funzionalità principale OK ma feature secondarie incomplete
- **6/10**: Funziona parzialmente, bug significativi
- **5/10**: MVP non completo, richiede lavoro significativo
- **< 5/10**: Non funzionante o non implementato

| Area | Score | Motivazione brutale |
|---|---|---|
| **Auth + Security** | **9.0** | bcrypt+HMAC, RBAC, whitelist. -1: email mai testata, classes list rotto |
| **Sito Pubblico** | **8.5** | 20 pagine funzionanti, 5 security headers. -1.5: HTML statico, no SPA, nessun test responsive recente |
| **Simulatore (rendering)** | **8.5** | 69 esperimenti caricano, 21 SVG, drag&drop. -1.5: physics solo circuiti semplici, no thermal/magnetic/gravity |
| **Simulatore (physics)** | **7.0** | CircuitSolver per V=IR, KVL/KCL. AVR per Vol3. -3: No simulazione reale condensatore carica/scarica dinamica, no transitorio, motor non gira fisicamente |
| **Volume Gating** | **8.0** | Invisibile se no licenza. -2: Mai testato con account studente. ~10 componenti nel volume sbagliato. Bypass possibile via props |
| **Quiz** | **7.0** | 51/69 con quiz. -3: Vol2 interamente scoperto (0/18). Nessun sistema di tracking score server-side |
| **Giochi** | **8.0** | 53 sfide, star rating, badges. -2: Teacher-gated non testato, MobileBottomTabs non filtra, localStorage-only |
| **Teacher Dashboard** | **5.0** | UI scritta. -5: studentService usa localStorage (dati non accessibili cross-browser), classes list HTTP 500, game toggles non verificati |
| **AI Integration** | **7.5** | n8n LIVE, 3-tier fallback, chat funziona. -2.5: Mobile UX scadente, prompt non ottimizzati per educazione, no context awareness degli esperimenti |
| **Whiteboard V3** | **6.0** | Codice scritto. -4: MAI testato nel browser. Potrebbe essere completamente rotto |
| **Code Quality** | **9.0** | 0 console.log, build 0 errors, code-splitting. -1: 410KB gestionale chunk, no automated tests |
| **Frontend/UX** | **7.0** | Design system presente, palette coerente. -3: Mai testato responsive recente, chat copre mobile, nessun test con utente reale |
| **3 Modalità Esperimento** | **2.0** | NON ESISTONO. Solo "pre-montato". -8: buildMode nel codice ma 0/69 esperimenti lo usano. "Monta tu" e "drag & drop guidato" non implementati |
| **Teacher-Student Comm** | **2.0** | studentService scritto. -8: localStorage = non funziona cross-browser. Teacher non vede dati. Report classe vuoto |
| **Allineamento Libri-Tutor** | **?/10** | IMPOSSIBILE valutare: i PDF non sono nel progetto. ~10 componenti in volume sbagliato |
| | | |
| **OVERALL** | **~7.0/10** | |

### Confronto con score dichiarati nelle sessioni precedenti:
| Area | Score dichiarato S31 | Score onesto oggi | Delta |
|---|---|---|---|
| Overall | ~9.5/10 | **~7.0/10** | **-2.5** |
| Teacher Dashboard | 8.8/10 | **5.0/10** | **-3.8** |
| Whiteboard V3 | 9.0/10 | **6.0/10** | **-3.0** |
| AI Integration | 8.0/10 | **7.5/10** | **-0.5** |
| ELAB Tutor Student | 9.5/10 | **7.5/10** | **-2.0** |

**Perché i delta sono così grandi?**
I report precedenti davano score al **codice scritto**, non alla **funzionalità verificata**. Se il codice è lì e compila, veniva dato 9/10. Ma "il codice compila" ≠ "funziona per l'utente".

---

## 6. COSA SERVE PER LA SESSIONE 32

### Priorità 1: Rendere funzionante ciò che esiste
1. **Server-side student data** — Sostituire localStorage con Notion DB o API
2. **Fix classes list** — Configurare Notion DB classes correttamente
3. **Fix volume mapping** — Allineare `volumeAvailableFrom` ai libri fisici (RICHIEDE PDF)
4. **Quiz Vol2** — 18 esperimenti × 2 quiz ciascuno = 36 domande da scrivere
5. **Test E2E nel browser** — Aprire OGNI feature con Chrome e verificare

### Priorità 2: Completare le 3 modalità
6. **buildMode nei dati** — Aggiungere `buildMode: 'preassembled' | 'guided' | 'sandbox'` a ogni esperimento
7. **UI per selezione modalità** — L'utente deve poter scegliere come montare il circuito
8. **Step-by-step guided** — Istruzioni visive passo-passo per il drag & drop

### Priorità 3: Frontend perfetto
9. **Responsive audit con Chrome** — Desktop + tablet + mobile per OGNI pagina
10. **Mobile chat overlay** — Ridurre dimensione su mobile
11. **Whiteboard V3 test** — Verificare nel browser e fixare se rotto
12. **VetrinaSimulatore gallery** — Verificare rendering immagini

---

## 7. RISCHI E DEBITI TECNICI

| Rischio | Probabilità | Impatto | Mitigazione |
|---|---|---|---|
| Volume bypass via props | Alta | Alto | Route guard a livello esperimento |
| localStorage perso (clear browser) | Alta | Alto | Server-side sync |
| n8n downtime | Media | Medio | 3-tier fallback già presente |
| No test automatizzati | Alta | Alto | CI/CD con Vitest + Playwright |
| Bundle size cresce | Media | Basso | Code-splitting già presente |
| Notion API rate limits | Bassa | Medio | Caching delle risposte |

---

## 8. STRUTTURA PROGETTO COMPLETA

```
/Users/andreamarro/VOLUME 3/PRODOTTO/
├── newcartella/                          ← SITO PUBBLICO (Netlify)
│   ├── *.html (20 pagine)
│   ├── css/ (5 file, 176KB)
│   ├── js/ (8 file, 128KB)
│   ├── images/ (35 file, 8.6MB)
│   ├── videos/ (2 file, 28MB)
│   ├── netlify/functions/ (25 funzioni)
│   ├── netlify.toml (security headers + redirects)
│   ├── kit/ (3 pagine volume)
│   └── _archivio/ (deploy backup)
│
└── elab-builder/                         ← ELAB TUTOR (Vercel)
    ├── src/
    │   ├── App.jsx + main.jsx
    │   ├── components/ (133 file)
    │   │   ├── admin/ (38 file) — gestionale completo
    │   │   ├── auth/ (5 file) — login, register, guards
    │   │   ├── simulator/ (64 file) — IL CUORE
    │   │   │   ├── components/ (21 SVG + registry)
    │   │   │   ├── engine/ (CircuitSolver + AVRBridge)
    │   │   │   ├── canvas/ (SimulatorCanvas + WireRenderer)
    │   │   │   └── panels/ (ExperimentPicker, CodeEditor, etc.)
    │   │   ├── tutor/ (24 file) — sidebar, chat, hints
    │   │   ├── teacher/ (1 file — TeacherDashboard 69KB)
    │   │   ├── student/ (1 file — StudentDashboard 40KB)
    │   │   └── common/ (3 file — error boundary, consent, privacy)
    │   ├── data/ (8 file — 624KB di esperimenti + giochi)
    │   ├── services/ (10 file — auth, email, student, API)
    │   ├── hooks/ (2 file — gameScore, isMobile)
    │   ├── locales/ (4 file — it, en, de, es)
    │   ├── styles/ (1 file — design-system.css)
    │   └── utils/ (4 file — logger, crypto, safety filter)
    ├── public/assets/
    │   ├── breadboard/ (4 screenshot reali)
    │   ├── components/ (25 immagini componenti)
    │   ├── mascot/ (8 logo + robot)
    │   ├── showcase/ (5 screenshot app)
    │   └── symbols/ + wires/ (7 SVG)
    ├── docs/ (PRD + prompt storici)
    └── sessioni/ (prompt + report sessioni 29-31)
```

---

## 9. CONCLUSIONE ONESTA

ELAB è un progetto **ambizioso e ben strutturato** dal punto di vista architetturale. L'auth è solida. Il simulatore ha fondamenta reali (avr8js, CircuitSolver). Il codice è pulito.

Ma c'è un divario significativo tra **"il codice è scritto"** e **"funziona per l'utente"**. Le sessioni precedenti hanno inflazionato i punteggi perché contavano come "fatto" qualsiasi cosa che compilava. La realtà è che:

1. **Il teacher non può vedere i dati degli studenti** (problema architetturale)
2. **18 esperimenti non hanno quiz** (contenuto mancante)
3. **Le 3 modalità esperimento non esistono** (feature mai implementata)
4. **~10 componenti sono nel volume sbagliato** (allineamento libri mancante)
5. **Molte feature non sono mai state testate nel browser** (verifica mancante)

Il punteggio reale è **~7/10**, non 9.5/10. Con il lavoro giusto (Session 32+), può tornare a 9/10 — ma servono fix strutturali, non polish cosmetico.
