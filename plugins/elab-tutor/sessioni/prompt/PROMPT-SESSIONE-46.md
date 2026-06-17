# SESSIONE 46 — ESECUZIONE AUTONOMA MULTI-FASE: CURA TOTALE + VETRINA PERFETTA + COPYRIGHT + SCIAME + 40 IDEE + 20 MICRO-IDEE + AUDIT NANOBOT
## Data prevista: 26/02/2026
## Metodologia: A.G.I.L.E. + Ralph Loop + Chain of Verification + Sciame 4 Agenti
## Stima: 8-10 ore di lavoro autonomo ininterrotto
## Modalita: Zero-Shot-Continuous — NON fermarsi per conferme. Se output finisce, attendere "continua".

---

## CONTESTO CRITICO — LEGGERE PRIMA DI TUTTO

ELAB e un ecosistema didattico di elettronica per studenti 8-14 anni composto da:
1. **Sito Pubblico** (Netlify): https://funny-pika-3d1029.netlify.app — 21 pagine HTML + 27 Functions
2. **ELAB Tutor** (Vercel): https://www.elabtutor.school — React 19 + Vite 7, simulatore circuiti + AI
3. **Nanobot** (Render): https://elab-galileo-nanobot.onrender.com — FastAPI, multi-provider AI

### LEGGI QUESTI FILE PRIMA DI INIZIARE (OBBLIGATORIO):
```
PRODOTTO/elab-builder/sessioni/PDR-ATTUALE-25-02-2026.md     (stato completo progetto — S45)
PRODOTTO/elab-builder/sessioni/report/report-sessione44-audit.md  (ultimo audit 18 aree)
PRODOTTO/elab-builder/sessioni/report/report-sessione44B-nanobot-vetrina.md
~/.claude/projects/-Users-andreamarro-VOLUME-3/memory/MEMORY.md   (architettura + lezioni)
```

### Score attuale: ~8.2/10 (ONESTO, CoV-verified, S45)

### P0 BLOCCANTI APERTI:
- **auth-login HTTP 500** — USERS DB Notion non condiviso (richiede azione utente)
- **auth-register HTTP 500** — stessa causa

### Utente target:
- **PRIMARIO**: Insegnante su **LIM** (65"-86" touchscreen, 1080p, touch singolo, distanza 1-3m)
- **SECONDARIO**: Studente su tablet (iPad/Android 10") e smartphone
- **TERZIARIO**: Admin su desktop

> **REGOLA D'ORO**: Se un professore di 60 anni che non ha mai toccato un computer ci mette piu di 10 secondi a capire qualcosa, quella cosa e mal progettata.

---

## PRINCIPI NON NEGOZIABILI

1. **CHAIN OF VERIFICATION (CoV)**: Ogni affermazione va verificata NEL CODICE. Non nei commenti, non nella memoria. Leggere l'implementazione, testare l'endpoint, confrontare col PDF.
2. **ANALISI BRUTALMENTE ONESTE**: Meglio un 5 reale che un 9 falso. Score inflazionati tradiscono l'utente.
3. **FIX ECCEZIONALI**: Non rattoppare — risolvere. Un fix mediocre e peggio di nessun fix.
4. **"Implementato" != "Funzionante"**: Un endpoint che ritorna 500 non e implementato. Una feature mai testata in browser non esiste.
5. **ZERO CONSOLE.LOG** in produzione
6. **TOUCH TARGETS >= 44px** ovunque
7. **FONT >= 16px** per contenuti didattici proiettati su LIM (14px min per body text non proiettato)
8. **BUILD DEVE PASSARE** dopo ogni blocco di fix: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build`
9. **DEPLOY COMMANDS**:
   - Tutor: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build && npx vercel --prod --yes`
   - Sito: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/newcartella" && npx netlify deploy --prod --dir=. --site=864de867-e428-4eed-bd86-c2aef8d9cb13`
10. **NESSUNA IMMAGINE RIPETUTA** tra vetrina.html e scuole.html. Ogni foto deve essere unica.
11. **FRASI CHIAVE DA USARE** (esatte, non parafrasare):
    - "Con ELAB il docente non sale in cattedra: si siede accanto ai ragazzi e impara insieme a loro."
    - "L'apprendimento e orizzontale: docente e studenti scoprono insieme, fianco a fianco."
    - "Non servono competenze tecniche — il percorso guida tutti, passo dopo passo."

---

## FASE 1: CURA ELAB TUTOR — SIMULATORE, ESPERIMENTI, SISTEMA (~2.5h)

### 1.1 Verifica Esperimenti vs Libro — Continuit&agrave; Posizionamento
Per OGNI volume, campionare almeno 5 esperimenti e verificare:
- [ ] Le `connections` piazzano i componenti negli STESSI fori del PDF
- [ ] I `buildSteps` piazzano nella posizione FINALE (non temporanea)
- [ ] I colori dei fili corrispondono al libro
- [ ] I componenti usati sono quelli del volume corretto (`volumeAvailableFrom`)
- [ ] Il resistore di protezione LED e presente dove necessario
- [ ] DEVE esserci totale identita e continuita visiva tra libro e schermo

**ATTENZIONE**: `v1-cap10-esp1` e NOTO per avere LED senza resistore. Fixare.
**STRUMENTO**: Leggere i file in `src/data/experiments/` e confrontare. Usare `volume-replication` skill.

### 1.2 Wire/Cavi — FOCUS MASSIMO
I cavi nel simulatore devono supportare TUTTE le operazioni possibili nella realta:
- [ ] Wire V7 Catmull-Rom renderizza curve smooth con gravity sag
- [ ] I fili sono **malleabili** — drag libero dei waypoint, no snap a griglia
- [ ] Colori fili coerenti con kit reale (rosso=VCC, nero=GND, colori vari per segnale)
- [ ] Wire si possono aggiungere, rimuovere, riposizionare
- [ ] Wire attraversano il gap breadboard a-e/f-j SOLO con ponte esplicito
- [ ] Wire di lunghezze diverse (corti tra fori adiacenti, lunghi tra bus e componenti)
- [ ] Touch/drag su LIM e tablet funziona fluido (no jitter, no miss-target)
- [ ] Sag realistico proporzionale alla distanza (WIRE_SAG_FACTOR * distance, max 15px)
- [ ] Wire selezionabili e cancellabili con tap/click
- [ ] Feedback visivo di connessione riuscita (snap al foro)
- [ ] **Tutte le situazioni reali**: parallelo, serie, incrocio, bus-to-component, component-to-component
- [ ] Wire rendering fluido a 60fps anche con 20+ fili

Se mancano funzionalita, implementarle. I cavi sono la spina dorsale del simulatore.

### 1.3 Coerenza Sistema Simulatore
- [ ] Tutti i 21 SVG componenti renderizzano senza errori
- [ ] CircuitSolver v4 riconosce tutti i tipi di componenti
- [ ] LED glow funziona (brightness = min(1, current/30mA))
- [ ] LED burn funziona (current > 30mA → burned)
- [ ] Short circuit detection funziona
- [ ] Open circuit detection funziona
- [ ] Drag & drop funziona su touch (LIM + tablet)
- [ ] TUTTI i 21 componenti: stile Tinkercad flat, 0 gradienti multi-stop, 0 filter/shadow
- [ ] Pin naming corretto ovunque (Capacitor: positive/negative, Pot: vcc/signal/gnd, Bus: bus-bot-plus/minus)

### 1.4 Grafiche ELAB Tutor
- [ ] 21 SVG: tutti flat Tinkercad style
- [ ] Screenshot VetrinaSimulatore: servono screenshot FRESCHI post-Tinkercad del simulatore ATTUALE
- [ ] Icone UI: coerenti con palette ELAB (Navy/Lime)
- [ ] Font: Oswald (display) + Open Sans (body) + Fira Code (mono) — nessun font diverso infiltrato

### 1.5 Logica Visualizzazione Volumi per Licenze — A PROVA DI SCEMO
- [ ] Studente senza licenza Vol2: NON VEDE Vol2 (completamente invisibile, NON lucchetto)
- [ ] Studente con Vol1: vede SOLO Vol1 in ExperimentPicker
- [ ] Studente con Vol2: vede Vol1 + Vol2 (cumulativo)
- [ ] ComponentPalette mostra SOLO componenti del volume selezionato
- [ ] Admin/Teacher: vedono TUTTO (bypass: `userKits === null`)
- [ ] Dashboard mostra SOLO componenti del volume selezionato — ZERO confusione
- [ ] Volume gating e CLIENT-ONLY (P1 noto — documentare ma non bloccare per ora)

### 1.6 Dashboard Insegnante + Admin — User Friendly, LIM-Ready
**Per l'insegnante su LIM** (font grandi, bottoni enormi, zero confusione):
- [ ] Area Docente: tutti gli elementi >=44px touch target, font >=16px
- [ ] Setup wizard chiaro: "Come inizio?" → 3 step massimo
- [ ] Student cards mostrano NOME (non UUID)
- [ ] Classi: messaggio chiaro se DB non disponibile
- [ ] **Quick stats**: quanti studenti online, quanti esperimenti completati oggi
- [ ] **Export classe** in CSV o PDF
- [ ] **Notifica LIM-friendly**: studente completa esperimento → notifica grande e colorata
- [ ] **Bottone "Diagnosi Circuito"** visibile nel simulatore (non solo chat)
- [ ] **Bottone "Suggerimento"** visibile nel simulatore
- [ ] Semplificare tutto cio che ha piu di 3 click
- [ ] Nuove feature o semplificazioni che migliorino la vita dell'insegnante

**Per l'admin**:
- [ ] Tabelle leggibili (12px accettabile per dense data)
- [ ] Azioni chiare: nessun bottone ambiguo
- [ ] Nessun crash se Notion non risponde

### 1.7 Compatibilita Mobile ECCEZIONALE
Testare OGNI pagina su 3 viewport:
- [ ] **Mobile** (375x812) — iPhone SE
- [ ] **Tablet** (768x1024) — iPad
- [ ] **LIM** (1920x1080)

Per ogni pagina verificare:
- Nessun elemento esce dal viewport
- Touch targets >= 44px
- Chat overlay <= 40vh su mobile
- Sidebar collassata su mobile con hamburger
- Breadboard zoomabile su touch
- MobileBottomTabs filtra giochi teacher-gated
- Font leggibili (no < 14px su mobile)

**Pagine da testare**: Login, Register, Tutor, Simulatore, Quiz, Giochi (tutti e 4), Area Docente, Admin, Vetrina, Showcase/Gallery

> **BUILD CHECK + DEPLOY VERCEL dopo Fase 1**

---

## FASE 2: VETRINA LANDING PAGE — IMMAGINI PERFETTE (~1.5h)

La vetrina (PRODOTTO/newcartella/vetrina.html) deve diventare una showcase PERFETTA.

### 2.1 Screenshot Freschi dal Simulatore Attuale
Prendere screenshot NUOVI dal simulatore live (www.elabtutor.school):
1. Aprire il simulatore in Chrome (usare Chrome MCP o Preview tools)
2. Caricare diversi esperimenti rappresentativi
3. Screenshot: circuito LED con breadboard e wiring (mostrare Wire V7 malleabile)
4. Screenshot: RGB LED con colori accesi
5. Screenshot: editor Arduino con codice
6. Screenshot: selezione volumi/esperimenti
7. Screenshot: Galileo AI in azione che risponde a uno studente
8. Screenshot: modalita Passo Passo con steps visibili
9. Salvare in `images/screenshots/` con nomi chiari e data
10. Rimuovere/archiviare screenshot vecchi pre-Tinkercad

### 2.2 Eliminare TUTTE le Immagini Stock e Duplicate
Situazione attuale vetrina.html:
- **PROBLEMA 1**: `images/stock/classroom-teacher.jpg` — e una foto STOCK. Sostituire con foto reale da `images/gallery/` o `images/real-photos/`
- **PROBLEMA 2**: `images/scuole/classroom-electronics-04.jpg` — CONDIVISA con scuole.html. Sostituire con `images/real-photos/laboratorio-2.jpg` o altra foto unica
- **PROBLEMA 3**: `images/scuole/classroom-electronics-01.jpg` — CONDIVISA con scuole.html. Sostituire con `images/gallery/classroom-2.jpg` o altra foto unica
- **PROBLEMA 4**: `simulator-led-galileo.png` (showcase) troppo simile all'hero `simulator-led-galileo-response.png` — usare screenshot diverso (es. `simulator-arduino-galileo.png`)

**REGOLA ASSOLUTA**: NESSUNA immagine deve ripetersi tra vetrina.html e scuole.html. Fare cross-check.

### 2.3 Foto Disponibili NON Usate (scegliere da qui)
```
images/real-photos/laboratorio-1.jpg (106K)
images/real-photos/laboratorio-2.jpg (547K)
images/real-photos/maker-1.jpg (67K)
images/real-photos/evento-1.jpg (48K)
images/real-photos/evento-2.jpg (349K)
images/real-photos/classe-2.jpg (57K)
images/gallery/maker-faire-1.jpg (174K)
images/gallery/maker-faire-2.jpg (149K)
images/gallery/classroom-1.jpg (161K)
images/gallery/classroom-2.jpg (180K)
images/kids/kids-learning.jpg (80K)
images/kids/kids-project.jpg (51K)
images/kids/kids-multimeter.jpg (67K)
images/screenshots/simulator-led-circuit.png (139K)
images/screenshots/simulator-arduino-galileo.png (888K)
images/screenshots/simulator-rgb-galileo.png (432K)
```

### 2.4 Copy Migliorato — Target 8-14, Insegnante, Apprendimento Orizzontale
- Usare ESATTAMENTE le frasi chiave (vedi Principi Non Negoziabili)
- Enfatizzare i **cavi malleabili** nella sezione simulatore — menzionare Wire V7
- Aggiungere riferimento alla modalita "Passo Passo" che guida ogni singolo filo
- Target: insegnante in classe che deve convincere il dirigente ad adottare ELAB
- Tono: professionale ma caldo, zero gergo tecnico incomprensibile
- Verificare assenza errori ortografici e accenti italiani

### 2.5 Ottimizzazione Immagini
- Tutte le immagini > 500KB vanno compresse (max 300KB per foto, 200KB per screenshot)
- Aggiungere `loading="lazy"` a tutte le img sotto il fold
- Alt text descrittivi e in italiano per ogni immagine
- Aspect ratio coerenti (16/10 per screenshot, 3/4 o 4/3 per foto)

> **DEPLOY NETLIFY dopo Fase 2**

---

## FASE 3: DEBUG SITO NETLIFY DA CIMA A FONDO (~1.5h)

Audit COMPLETO di tutte le 21 pagine HTML del sito pubblico.

### Per ogni pagina:
- [ ] Carica senza errori (no 404, no mixed content)
- [ ] Link interni funzionano
- [ ] Link esterni funzionano (Amazon, Instagram, YouTube)
- [ ] Chat widget presente e funzionante
- [ ] Watermark visibile
- [ ] Responsive su mobile (375px)
- [ ] Font corretti (Poppins + Roboto)
- [ ] Palette corretta (Navy + Lime)
- [ ] Nessun testo placeholder ("Lorem ipsum", "TODO", "coming soon")
- [ ] Contatti corretti e aggiornati
- [ ] Meta tags SEO presenti (title, description, og:image)
- [ ] Accenti italiani corretti (no `perche`, `citta`, `sara`)

### Pagine da auditare:
```
index.html, kit.html, kit/volume-1.html, kit/volume-2.html, kit/volume-3.html,
scuole.html, vetrina.html, corsi.html, eventi.html, chi-siamo.html,
contatti.html, privacy.html, termini.html, negozio.html,
+ tutte le altre pagine trovate con: ls *.html kit/*.html
```

> **DEPLOY NETLIFY dopo fix**

---

## FASE 4: SCIAME 4 AGENTI — VERIFICA TUTTI I 69 ESPERIMENTI (~2h)

Lanciare **4 agenti in parallelo** (Task tool con subagent_type="general-purpose"):

### Agente 1 — Vision Expert: Vol1 Cap 6-8 (14 esperimenti)
```
Leggi i file degli esperimenti Vol1 Cap6 (esp1-3), Cap7 (esp1-5), Cap8 (esp1-6).
Per OGNI esperimento verifica:
1. Le connections sono coerenti (from→to corrispondono a pin reali)
2. buildSteps piazzano nella posizione FINALE del libro
3. Colori fili specificati e sensati (rosso=+, nero=-)
4. Resistore protezione LED presente
5. Bus naming: "bus-bot-plus/minus" NON "bus-bottom-plus/minus"
6. Nessun wire attraversa gap a-e/f-j senza ponte esplicito
7. Quiz: 2 domande con 3 opzioni ciascuna
8. Continuit&agrave; con libro: i fori sono ESATTAMENTE gli stessi del PDF
Riporta: tabella PASS/FAIL con dettaglio FAIL.
```

### Agente 2 — Code Expert: Vol1 Cap 9-10 + Vol2 Cap 5-6 (24 esperimenti)
```
Stessa checklist Agente 1. Attenzione a v1-cap10-esp1 (LED senza resistore — NOTO).
In piu: verifica che le funzioni circuitSolver gestiscano tutti i componenti usati.
```

### Agente 3 — Arduino Expert: Vol2 Cap 7-8 + Vol3 Cap 11 (18 esperimenti)
```
Stessa checklist. Vol2 Cap7-8 fixati in S34-35 — ri-verificare.
Vol3 Cap11 usa Arduino — verifica codice presente e compilabile.
In piu: verifica che CodeEditorCM6 ha autocomplete per tutte le funzioni usate negli esperimenti.
```

### Agente 4 — QA Expert: Vol3 Cap 12-13 + Audit Trasversale (13 exp + audit globale)
```
Stessa checklist per Vol3 Cap12-13.
AUDIT TRASVERSALE su tutti i 69:
1. Tutti hanno quiz (2 domande)?
2. Tutti hanno buildSteps E connections?
3. volumeAvailableFrom corretto per ogni componente?
4. Nessun esperimento referenzia componente inesistente?
5. Progressione didattica Vol1→Vol2→Vol3 coerente (difficolta crescente)?
Report: conteggio PASS/FAIL globale e lista TUTTI problemi.
```

### Dopo lo sciame:
1. Raccogliere 4 report
2. Unificare in tabella 69 righe
3. Fixare TUTTI i problemi (priorita: correttezza elettrica > quiz > naming)
4. Build check dopo ogni blocco

---

## FASE 5: RICERCA YOUTUBE + COSE FONDAMENTALI MANCANTI (~1h)

### 5.1 Implementare Ricerca Diretta YouTube
Nel tutor, aggiungere possibilita di cercare video YouTube pertinenti:
- URL: `https://www.youtube.com/results?search_query=ELAB+elettronica+{nomeEsperimento}`
- Bottone "Cerca su YouTube" nella toolbar o chat
- Apre in nuova tab (no iframe per CORS)
- Keyword: nome esperimento + "elettronica" + "arduino" (se Vol3)

### 5.2 Lista Cose Fondamentali Mancanti
**NON a livello di progetto finito** — a livello di **ottimo lavoro in fase di sviluppo**:

```
### FONDAMENTALE MANCANTE #N
- Cosa: [descrizione]
- Perche e fondamentale: [impatto]
- Effort: [ore]
- Priorita: P0/P1/P2
```

Categorie: Accessibilita WCAG, Performance (LCP/FID/CLS), SEO, Analytics, Onboarding primo uso, Error handling utente, Offline capability, Data export, Documentazione docenti, Feedback loop.

---

## FASE 6: COPYRIGHT, ANTI-THEFT E PROTEZIONE (~1h)

### IMPORTANTE: NON TOCCARE L'AUTENTICAZIONE
Escludere RIGOROSAMENTE dall'obfuscation: login, API auth, token management, env vars. L'admin DEVE poter accedere senza intoppi.

### 6.1 Domain Lock Silenzioso
Script che verifica hostname (whitelist: localhost, funny-pika-3d1029.netlify.app, www.elabtutor.school, elabtutor.school, elab-builder.vercel.app). Se dominio non autorizzato: degrada performance simulatore silenziosamente (non crashare).

### 6.2 Watermarking Avanzato
- Firma "Copyright Andrea Marro - [Data]" ogni 200 righe nei file buildati
- Steganografia: caratteri Zero-Width Space nelle stringhe principali che formino in binario "Andrea Marro"
- ASCII Art nella Console del browser (visibile solo su DevTools) con diffida legale e attribuzione copyright

### 6.3 Obfuscamento Chirurgico
- Control Flow Flattening e String Array Encryption SOLO sulle logiche matematiche del simulatore
- Protezione comunicazione Arduino
- Frontend fluido a 60fps — NON degradare performance
- Ricordare: `reservedStrings: ['\\.js', '\\.css', '\\.svg', '\\.png', '\\.jpg', 'assets/']` e `splitStringsChunkLength >= 10` (lezione S43)

---

## FASE 7: DEBUG BROWSER — VISUAL AUDIT (~1h)

Usare **Claude in Chrome** (o Preview tools) per debug visivo:

### ELAB Tutor (www.elabtutor.school)
1. Screenshot homepage
2. Navigare al simulatore
3. Caricare esperimento Vol1 (v1-cap6-esp1)
4. Screenshot circuito renderizzato — verificare SVG Tinkercad corretti
5. Testare drag & drop wire
6. Aprire chat Galileo, inviare "Ciao"
7. Screenshot risposta
8. Testare viewport mobile (375px)
9. Screenshot mobile

### Sito Pubblico (funny-pika-3d1029.netlify.app)
1. Screenshot homepage
2. Navigare a /vetrina
3. Screenshot vetrina — verificare layout AIDA + immagini
4. Scrollare fino in fondo — verificare animazioni scroll
5. Testare chat widget
6. Screenshot mobile (375px)
7. Verificare tutti i link navbar

---

## FASE 8: GENERAZIONE STRATEGICA — 40 IDEE (10 per categoria)

**ISTRUZIONI**: Accumula conoscenza durante TUTTE le fasi 1-7. Annota intuizioni, pattern, problemi ricorrenti. ALLA FINE, sintetizza in 40 idee:

### Categoria 1: PEDAGOGIA (10 idee)
Innovazioni didattiche: Bloom's taxonomy, learning by doing, scaffolding, zone of proximal development, gamification, peer learning, spaced repetition, metacognition, apprendimento orizzontale.

### Categoria 2: INFORMATICA (10 idee)
Miglioramenti tecnici: architettura, performance, sicurezza, scalabilita, developer experience, testing, CI/CD, monitoring, code quality.

### Categoria 3: STILE e MARKETING (10 idee)
Comunicazione premium: branding, UX writing, visual design, social proof, conversion, storytelling, community, posizionamento elitario.

### Categoria 4: NON RESTARE INDIETRO (10 idee)
Tecnologie da adottare oggi: AI generativa, AR/VR, voice interfaces, real-time collaboration, edge computing, WebAssembly, PWA, Web Components, LLM agents. Avere SEMPRE un prodotto unico.

**Formato**:
```
### Idea #N — [Titolo]
**Categoria**: [1/2/3/4]
**Genialita**: [perche e geniale]
**Implementazione**: [come in 1-3 sessioni]
**Impatto**: [cosa cambia per utente]
```

**REGOLA**: Idee GENIALI non GRANDIOSE. Poco effort → effetto sproporzionato.

---

## FASE 9: 20 MICRO-IDEE GENIALI + AUDIT NANOBOT

### 9.1 — 20 Micro-Idee Geniali
Piccole, controintuitive, brillanti. Micro-interazioni che migliorano la UX quotidiana di ELAB Tutor. Cose che l'utente non sapeva di volere ma che una volta provate non puo farne a meno.

Formato: `#N — [Titolo breve]: [Descrizione in 2 righe]. Effort: [ore].`

### 9.2 — Audit Nanobot Super Dettagliato
Autopsia BRUTALE dell'infrastruttura Nanobot:

**File da leggere**:
```
PRODOTTO/elab-builder/nanobot/main.py
PRODOTTO/elab-builder/nanobot/nanobot.yml
PRODOTTO/elab-builder/nanobot/site-prompt.yml
PRODOTTO/elab-builder/nanobot/requirements.txt
PRODOTTO/elab-builder/nanobot/Dockerfile
PRODOTTO/elab-builder/nanobot/render.yaml
```

**Checklist audit**:
- [ ] Architettura: e solida o fragile?
- [ ] Provider chain: DeepSeek→Gemini→Groq — fallback funziona?
- [ ] race_providers() ritorna 3 valori — tutti spacchettati?
- [ ] Latenza: primo response < 3s?
- [ ] Rate limiting: protezione abuse?
- [ ] CORS: whitelist corretta?
- [ ] Endpoints: /health, /chat, /site-chat, /diagnose, /hints — tutti funzionano?
- [ ] Knowledge base: nanobot.yml e completo? site-prompt.yml e aggiornato?
- [ ] Docker: immagine ottimizzata? Multi-stage build?
- [ ] Persistenza: come gestisce conversation history?
- [ ] Cold start: tempo di avvio su Render?
- [ ] Error handling: errori graceful o crash?
- [ ] Logging: si vede cosa succede in produzione?
- [ ] Security: API keys protette? No leak in response?
- [ ] Costi: ottimizzato per token usage?

Fornire FIX ARCHITETTURALI DRASTICI per ogni problema trovato.

---

## SKILL E PLUGIN DA USARE

| Skill/Plugin | Quando |
|-------------|--------|
| `quality-audit` | Metriche quantitative (font, touch, bundle, console) |
| `volume-replication` | Confronto esperimenti vs PDF |
| `tinkercad-simulator` | Parita funzionale componenti + wire |
| `ralph-loop` | Iterazione continua fino a quality gate |
| `systematic-debugging` | Quando emergono bug |
| `verification-before-completion` | Prima di dichiarare task completo |
| `brainstorming` | Prima della Fase 8 (idee) |
| `dispatching-parallel-agents` | Fase 4 (sciame) |
| `frontend-design` | Vetrina improvement |
| WebSearch | Cercare idee e soluzioni online |
| WebFetch | Consultare documentazione |
| Chrome MCP | Debug visivo Fase 7 |
| Preview tools | Verifica locale |

---

## PALETTE E VINCOLI DESIGN

| Elemento | Valore |
|----------|--------|
| Navy | #1E4D8C |
| Lime | #7CB342 |
| Vol1 | #7CB342 |
| Vol2 | #E8941C |
| Vol3 | #E54B3D |
| Font Tutor display | Oswald |
| Font Tutor body | Open Sans |
| Font Tutor mono | Fira Code |
| Font Sito display | Poppins |
| Font Sito body | Roboto |
| Theme | Force-light (data-theme="light") |
| Touch target min | 44px |
| Font LIM min | 16px |
| Font body min | 14px |
| Watermark | Andrea Marro — DD/MM/YYYY |
| Bus naming | bus-bot-plus/minus (NON bus-bottom-) |

---

## ACCOUNT TEST

| Ruolo | Email | Password |
|-------|-------|----------|
| Admin | marro.andrea96@gmail.com | Qf3!dN9@bL5#wH7 |
| Teacher | teacher@elab.test | Tm7@xK4!pR2#nJ8 |

> Login attualmente ROTTO in produzione (P0: USERS DB non condiviso). Se non riesci a loggarti, documenta e vai avanti con cio che puoi fare senza login.

---

## IMMAGINI VETRINA — MAPPA COMPLETA

### Immagini ATTUALI in vetrina.html (da sostituire dove indicato):
| Riga | Src attuale | Problema | Sostituzione |
|------|-------------|----------|-------------|
| 966 | screenshots/simulator-led-galileo-response.png | OK (hero) | Screenshot fresco dal simulatore attuale |
| 981 | real-photos/classe-1.jpg | OK unica | Tenere |
| 990 | **stock/classroom-teacher.jpg** | STOCK! | gallery/classroom-1.jpg (161K, reale) |
| 1022 | screenshots/simulator-full.png | Potrebbe essere vecchio | Screenshot fresco simulatore attuale |
| 1056 | **screenshots/simulator-led-galileo.png** | Troppo simile al hero | screenshots/simulator-arduino-galileo.png |
| 1063 | screenshots/simulator-rgb-led.png | OK | Screenshot fresco RGB |
| 1070 | screenshots/simulator-arduino-code.png | OK | Screenshot fresco editor |
| 1077 | screenshots/simulator-volumes-galileo.png | OK | Screenshot fresco volumi |
| 1090 | real-photos/bambino-circuito-1.jpg | OK unica | Tenere |
| 1174 | **scuole/classroom-electronics-04.jpg** | CONDIVISA con scuole.html | real-photos/laboratorio-2.jpg (547K) |
| 1230 | **scuole/classroom-electronics-01.jpg** | CONDIVISA con scuole.html | gallery/classroom-2.jpg (180K) |

### Immagini usate in scuole.html (NON usare in vetrina):
```
scuole/classroom-electronics-01.jpg
scuole/classroom-electronics-02.jpg
scuole/classroom-electronics-03.jpg
scuole/classroom-electronics-04.jpg
scuole/classroom-electronics-05.jpg
scuole/cover-volume-1-it.png
scuole/cover-volume-2-it.png
scuole/cover-volume-3-manuale.png
```

---

## METRICHE DI SUCCESSO SESSIONE 46

| Metrica | Target | Verifica |
|---------|--------|----------|
| Esperimenti verificati | 69/69 | Report sciame agenti |
| Pagine sito debuggate | 21/21 | Checklist per pagina |
| Immagini vetrina uniche | 14/14 (0 stock, 0 duplicati) | Cross-check |
| Screenshot simulatore freschi | >= 6 | File nuovi in images/ |
| Wire V7 completo | Tutte operazioni reali | Test manuale |
| P1 fixati | almeno 5/11 | Diff git |
| Build | 0 errori | npm run build |
| Score onesto | >= 8.5 (da 8.2) | CoV report |
| Console.log | 0 in prod | grep |
| Touch targets | 100% >= 44px | Audit |
| Font LIM | 0 < 16px per contenuto didattico | grep |
| Ricerca YouTube | Funzionante | Browser test |
| Cose mancanti | Lista >= 15 item | Documento |
| Idee strategiche | 40 (10 per categoria) | Documento |
| Micro-idee geniali | 20 | Documento |
| Audit nanobot | Report + fix | Documento |
| Domain lock | Funzionante | Test dominio |
| Watermark steganografia | Implementato | Hex check |
| Copyright protection | 100% | Audit |
| Deploy | Vercel + Netlify success | CLI output |

---

## ORDINE DI ESECUZIONE

```
FASE 1: CURA ELAB TUTOR (~2.5h)
  |-- 1.1 Verifica esperimenti vs libro
  |-- 1.2 Wire/cavi — FOCUS MASSIMO
  |-- 1.3 Coerenza sistema simulatore
  |-- 1.4 Grafiche
  |-- 1.5 Volume gating
  |-- 1.6 Dashboard insegnante + admin
  |-- 1.7 Mobile ECCEZIONALE
  --> BUILD CHECK + DEPLOY VERCEL

FASE 2: VETRINA PERFETTA (~1.5h)
  |-- 2.1 Screenshot freschi dal simulatore attuale
  |-- 2.2 Eliminare stock + duplicati
  |-- 2.3 Scegliere foto uniche
  |-- 2.4 Copy migliorato (frasi chiave, wire, target 8-14)
  |-- 2.5 Ottimizzazione immagini
  --> DEPLOY NETLIFY

FASE 3: DEBUG SITO NETLIFY (~1.5h)
  |-- Audit 21 pagine con checklist
  --> DEPLOY NETLIFY

FASE 4: SCIAME 4 AGENTI (~2h)
  |-- Agente 1: Vol1 Cap 6-8 (14 exp)
  |-- Agente 2: Vol1 Cap 9-10 + Vol2 Cap 5-6 (24 exp)
  |-- Agente 3: Vol2 Cap 7-8 + Vol3 Cap 11 (18 exp)
  |-- Agente 4: Vol3 Cap 12-13 + Audit (13 exp + globale)
  --> FIX + BUILD + DEPLOY

FASE 5: YOUTUBE + MANCANTI (~1h)
  |-- 5.1 Ricerca YouTube
  |-- 5.2 Lista fondamentali mancanti

FASE 6: COPYRIGHT + PROTEZIONE (~1h)
  |-- 6.1 Domain lock silenzioso
  |-- 6.2 Watermarking + steganografia
  |-- 6.3 Obfuscamento chirurgico

FASE 7: DEBUG BROWSER (~1h)
  |-- Chrome ELAB Tutor (9 step)
  |-- Chrome Sito Pubblico (7 step)

FASE 8: 40 IDEE STRATEGICHE (fine sessione)
  |-- 10 Pedagogia + 10 Informatica + 10 Stile/Marketing + 10 Future-Proofing

FASE 9: 20 MICRO-IDEE + AUDIT NANOBOT (chiusura)
  |-- 20 micro-idee geniali
  |-- Audit nanobot dettagliato con fix
```

---

## STRINGA DI LANCIO

```
Sessione 46 — ELAB. Esecuzione autonoma multi-fase. Leggi PRIMA:
1. PRODOTTO/elab-builder/sessioni/PDR-ATTUALE-25-02-2026.md
2. PRODOTTO/elab-builder/sessioni/prompt/PROMPT-SESSIONE-46.md
3. ~/.claude/projects/-Users-andreamarro-VOLUME-3/memory/MEMORY.md

Esegui le 9 fasi in ordine SENZA fermarti per conferme. Usa skill: quality-audit, volume-replication, tinkercad-simulator, ralph-loop, systematic-debugging, brainstorming, dispatching-parallel-agents, frontend-design. Usa Chrome MCP e Preview tools per debug visivo. ANALISI BRUTALMENTE ONESTE. FIX ECCEZIONALI. Chain of Verification su TUTTO. Le 40 idee + 20 micro-idee + audit nanobot ALLA FINE, sedimentando conoscenza durante tutto il lavoro.
```

---

*Prompt Session 46 — Andrea Marro, 25/02/2026*
*Costruito sui PDR di 45 sessioni precedenti.*
*"La cura del dettaglio e cio che separa il buono dall'eccellente."*
*"Con ELAB il docente non sale in cattedra: si siede accanto ai ragazzi e impara insieme a loro."*
