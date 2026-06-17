# SESSIONE 45 — CURA TOTALE ELAB TUTOR + DEBUG SITO + SCIAME AGENTI + 20 IDEE GENIALI
## Data prevista: 25/02/2026
## Metodologia: A.G.I.L.E. + Ralph Loop + Chain of Verification + Sciame 4 Agenti
## Stima: 6-8 ore di lavoro autonomo concentrato

---

## CONTESTO CRITICO — LEGGERE PRIMA DI TUTTO

ELAB e un ecosistema didattico di elettronica per studenti 8-14 anni composto da:
1. **Sito Pubblico** (Netlify): https://funny-pika-3d1029.netlify.app — 21 pagine HTML + 27 Functions
2. **ELAB Tutor** (Vercel): https://www.elabtutor.school — React 19 + Vite 7, simulatore circuiti + AI
3. **Nanobot** (Render): https://elab-galileo-nanobot.onrender.com — FastAPI, multi-provider AI

### Leggi questi file PRIMA di iniziare:
```
PRODOTTO/elab-builder/sessioni/PDR-ATTUALE-25-02-2026.md     (stato completo progetto)
PRODOTTO/elab-builder/sessioni/report/report-sessione44-audit.md  (ultimo audit 18 aree)
PRODOTTO/elab-builder/sessioni/report/report-sessione43-finale.md (crash fix + n8n removal)
~/.claude/projects/-Users-andreamarro-VOLUME-3/memory/MEMORY.md   (architettura + lezioni)
```

### Score attuale: ~8.1/10 (ONESTO, CoV-verified)

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

---

## FASE 1: CURA ELAB TUTOR (Sprint 1-2, ~2h)

### 1.1 Verifica Esperimenti vs Libro
Per OGNI volume, campionare almeno 5 esperimenti e verificare:
- [ ] Le `connections` piazzano i componenti negli STESSI fori del PDF
- [ ] I `buildSteps` piazzano nella posizione FINALE (non temporanea)
- [ ] I colori dei fili corrispondono al libro
- [ ] I componenti usati sono quelli del volume corretto (`volumeAvailableFrom`)
- [ ] Il resistore di protezione LED e presente dove necessario

**ATTENZIONE**: `v1-cap10-esp1` e NOTO per avere LED senza resistore. Fixare.

**STRUMENTO**: Leggere i file in `src/data/experiments/` e confrontare con la logica delle connessioni. Usare `volume-replication` skill per dettagli.

### 1.2 Coerenza Sistema Simulatore
Verificare che il simulatore sia un sistema COERENTE:
- [ ] Tutti i 21 SVG componenti renderizzano senza errori
- [ ] CircuitSolver v4 riconosce tutti i tipi di componenti
- [ ] LED glow funziona (brightness = min(1, current/30mA))
- [ ] LED burn funziona (current > 30mA → burned)
- [ ] Short circuit detection funziona
- [ ] Open circuit detection funziona
- [ ] Wire V7 Catmull-Rom renderizza curve smooth
- [ ] Drag & drop funziona su touch (LIM + tablet)

### 1.3 Grafiche ELAB Tutor
Organizzare e verificare tutte le risorse grafiche:
- [ ] 21 SVG: tutti flat Tinkercad style, 0 gradienti multi-stop, 0 filter/shadow
- [ ] Screenshot Vetrina (VetrinaSimulatore): servono screenshot FRESCHI post-Tinkercad
- [ ] Icone UI: coerenti con palette ELAB (Navy/Lime)
- [ ] Font: Oswald (display) + Open Sans (body) + Fira Code (mono) — verificare che non ci siano font diversi infiltrati

### 1.4 Logica Visualizzazione Volumi per Licenze
**A PROVA DI SCEMO**:
- [ ] Studente senza licenza Vol2: NON VEDE Vol2 (completamente invisibile, NON lucchetto)
- [ ] Studente con Vol1: vede SOLO Vol1 in ExperimentPicker
- [ ] Studente con Vol2: vede Vol1 + Vol2 (cumulativo)
- [ ] ComponentPalette mostra SOLO componenti del volume selezionato
- [ ] Admin/Teacher: vedono TUTTO (bypass: `userKits === null`)
- [ ] Volume gating e CLIENT-ONLY (P1 noto — documentare ma non bloccare)

### 1.5 Dashboard — User Friendly a Prova di Scema
**Per l'insegnante su LIM** (font grandi, bottoni enormi, zero confusione):
- [ ] Area Docente: tutti gli elementi >=44px touch target, font >=16px
- [ ] Setup wizard chiaro: "Come inizio?" → 3 step massimo
- [ ] Student cards mostrano NOME (non UUID)
- [ ] Classi: messaggio chiaro se DB non disponibile (non errore tecnico)

**Per l'admin**:
- [ ] Tabelle leggibili (12px e accettabile per tabelle dense)
- [ ] Azioni chiare: nessun bottone ambiguo
- [ ] Nessun crash se Notion non risponde

### 1.6 Compatibilita Mobile ECCEZIONALE
Testare OGNI pagina su 3 viewport:
- [ ] **Mobile** (375x812) — iPhone SE
- [ ] **Tablet** (768x1024) — iPad
- [ ] **LIM** (1920x1080)

Per ogni pagina verificare:
- Nessun elemento esce dal viewport
- Touch targets >= 44px
- Chat overlay <= 40vh su mobile
- Sidebar collassata su mobile con hamburger
- Breadboard zoomabile su touch (pinch?)
- MobileBottomTabs filtra giochi teacher-gated
- Font leggibili (no < 14px su mobile)

**Pagine da testare**: Login, Register, Tutor, Simulatore (con esperimento aperto), Quiz, Giochi (tutti e 4), Area Docente, Admin, Vetrina, Showcase/Gallery

### 1.7 Area Admin e Insegnante — Nuove Feature o Semplificazioni
Valutare e implementare:
- [ ] **Quick stats** in Area Docente: quanti studenti online, quanti esperimenti completati oggi
- [ ] **Export classe** in CSV o PDF (se non esiste)
- [ ] **Notifica LIM-friendly**: quando uno studente completa un esperimento, notifica grande e colorata
- [ ] **Bottone "Diagnosi Circuito"** visibile nel simulatore (non solo chat)
- [ ] **Bottone "Suggerimento"** visibile nel simulatore
- [ ] Semplificare tutto cio che ha piu di 3 click per essere raggiunto

---

## FASE 2: DEBUG SITO NETLIFY DA CIMA A FONDO (Sprint 3, ~1.5h)

Audit COMPLETO di tutte le 21 pagine HTML del sito pubblico:

### Per ogni pagina:
- [ ] Carica senza errori (no 404, no mixed content)
- [ ] Link interni funzionano (non puntano a pagine inesistenti)
- [ ] Link esterni funzionano (Amazon, Instagram, YouTube)
- [ ] Chat widget presente e funzionante
- [ ] Watermark visibile
- [ ] Responsive su mobile (375px)
- [ ] Font corretti (Poppins + Roboto)
- [ ] Palette corretta (Navy + Lime)
- [ ] Nessun testo placeholder ("Lorem ipsum", "TODO", "coming soon" indesiderato)
- [ ] Contatti corretti e aggiornati
- [ ] Meta tags SEO presenti (title, description, og:image)

### Pagine da auditare:
```
index.html, kit.html, kit/volume-1.html, kit/volume-2.html, kit/volume-3.html,
scuole.html, vetrina.html, corsi.html, eventi.html, chi-siamo.html,
contatti.html, privacy.html, termini.html, negozio.html,
blog.html (se esiste), faq.html (se esiste)
+ tutte le altre pagine trovate con: ls *.html kit/*.html
```

### Fix da applicare immediatamente:
- Qualsiasi link morto → rimuovere o redirectare
- Qualsiasi pagina con layout rotto → fixare CSS
- Qualsiasi testo con errore ortografico/accento → fixare
- Chat widget mancante → aggiungere `<script src="js/chat-widget.js"></script>`

---

## FASE 3: SCIAME 4 AGENTI — VERIFICA ESPERIMENTI (Sprint 4, ~2h)

Lanciare **4 agenti in parallelo** (Task tool con subagent_type="general-purpose") per verificare TUTTI i 69 esperimenti. Dividere cosi:

### Agente 1: Vol1 Cap 6-8 (14 esperimenti)
```
Task: Leggi i file degli esperimenti Vol1 Cap6 (esp1-3), Cap7 (esp1-5), Cap8 (esp1-6).
Per OGNI esperimento verifica:
1. Le connections sono coerenti (from→to corrispondono a pin reali dei componenti)
2. buildSteps hanno la stessa sequenza delle connections
3. I colori fili sono specificati e sensati (rosso=+, nero=-)
4. Il resistore di protezione LED e presente
5. I bus naming usano "bus-bot-plus/minus" NON "bus-bottom-plus/minus"
6. Nessun wire attraversa il gap a-e/f-j senza ponte esplicito
7. Il quiz ha 2 domande con 3 opzioni ciascuna
Riporta: tabella PASS/FAIL per ogni check, con dettaglio dei FAIL.
```

### Agente 2: Vol1 Cap 9-10 + Vol2 Cap 5-6 (24 esperimenti)
```
Stessa checklist dell'Agente 1, applicata a Vol1 Cap9-10 e Vol2 Cap5-6.
Attenzione particolare a v1-cap10-esp1 (LED senza resistore — NOTO FAIL).
```

### Agente 3: Vol2 Cap 7-8 + Vol3 Cap 11 (18 esperimenti)
```
Stessa checklist. Vol2 Cap7-8 hanno avuto fix in Session 34-35 — verificare che siano corretti.
Vol3 Cap11 usa Arduino — verificare che il codice Arduino sia presente e compilabile.
```

### Agente 4: Vol3 Cap 12-13 + Audit Trasversale (13 esperimenti + audit)
```
Stessa checklist per Vol3 Cap12-13.
IN PIU: audit trasversale su tutti i 69 esperimenti:
1. Tutti hanno proprieta quiz (2 domande)?
2. Tutti hanno buildSteps E connections?
3. volumeAvailableFrom e corretto per ogni componente usato?
4. Nessun esperimento referenzia un componente che non esiste?
5. La progressione didattica Vol1→Vol2→Vol3 e coerente (difficolta crescente)?
Riporta: conteggio PASS/FAIL globale e lista di tutti i problemi trovati.
```

### Dopo lo sciame:
1. Raccogliere i 4 report
2. Unificare in un singolo report con tabella 69 righe
3. Fixare TUTTI i problemi trovati (priorita: correttezza elettrica > quiz > naming)
4. Build check dopo ogni blocco di fix

---

## FASE 4: RICERCA YOUTUBE + COSE FONDAMENTALI MANCANTI (Sprint 5, ~1h)

### 4.1 Implementare Ricerca Diretta YouTube
Nel tutor, aggiungere la possibilita di cercare video YouTube pertinenti all'esperimento corrente:
- Costruire URL di ricerca: `https://www.youtube.com/results?search_query=ELAB+elettronica+{nomeEsperimento}`
- Bottone "Cerca su YouTube" nella toolbar o nella chat
- Si apre in nuova tab (non iframe, per CORS)
- Keyword: nome esperimento + "elettronica" + "arduino" (se Vol3)

### 4.2 Lista Cose Fondamentali Mancanti
**NON a livello di progetto finito** — a livello di **ottimo lavoro in fase di sviluppo**:

Analizzare l'intero ecosistema e produrre lista strutturata:
```
### FONDAMENTALE MANCANTE #N
- Cosa: [descrizione]
- Perche e fondamentale: [impatto su utente/prodotto]
- Effort stimato: [ore]
- Priorita: P0/P1/P2
```

Categorie da esplorare:
- Accessibilita (WCAG)
- Performance (LCP, FID, CLS)
- SEO
- Analytics / Tracking
- Onboarding primo uso
- Error handling per utente
- Offline capability
- Data export / backup
- Documentazione per docenti
- Feedback loop (come l'utente segnala problemi?)

---

## FASE 5: DEBUG GENERALE CON BROWSER (Sprint 6, ~1h)

Usare **Claude in Chrome** (o Chromium) per debug visivo di ENTRAMBI i siti:

### ELAB Tutor (www.elabtutor.school)
1. Aprire in Chrome con tabs_context_mcp
2. Screenshot homepage
3. Navigare al simulatore (se login funziona, usare account admin)
4. Caricare un esperimento Vol1 (v1-cap6-esp1)
5. Screenshot del circuito renderizzato
6. Verificare che i SVG Tinkercad appaiono correttamente
7. Testare drag & drop di un wire
8. Aprire chat Galileo, inviare "Ciao"
9. Screenshot della risposta
10. Testare su viewport mobile (375px)
11. Screenshot mobile

### Sito Pubblico (funny-pika-3d1029.netlify.app)
1. Screenshot homepage
2. Navigare a /vetrina.html
3. Screenshot vetrina (verificare layout AIDA)
4. Scrollare fino in fondo
5. Verificare che le animazioni scroll funzionano
6. Testare chat widget (cliccare icona, inviare "Quanto costa il Vol1?")
7. Screenshot mobile (375px)
8. Verificare tutti i link nella navbar

---

## FASE 6: 20 IDEE GENIALI (Generare ALLA FINE, sedimentando conoscenza)

**ISTRUZIONI**: NON generare le idee adesso. Accumula conoscenza durante TUTTO il lavoro delle fasi 1-5. Annota intuizioni, pattern, problemi ricorrenti, opportunita scoperte. ALLA FINE della sessione, sintetizza in 20 idee geniali distribuite su 4 categorie:

### Categoria 1: PEDAGOGIA (5 idee)
Innovazioni didattiche che rendono ELAB unico come strumento educativo.
Pensare a: Bloom's taxonomy, learning by doing, scaffolding, zone of proximal development, gamification, peer learning, spaced repetition, metacognition.

### Categoria 2: INFORMATICA (5 idee)
Miglioramenti tecnici che elevano la qualita del software.
Pensare a: architettura, performance, sicurezza, scalabilita, developer experience, testing, CI/CD, monitoring.

### Categoria 3: STILE e MARKETING (5 idee)
Estetica e comunicazione che rendono ELAB desiderabile.
Pensare a: branding, UX writing, visual design, social proof, conversion optimization, storytelling, community.

### Categoria 4: NON RESTARE INDIETRO (5 idee)
Tenere il passo con la tecnologia veloce per avere sempre un prodotto UNICO.
Pensare a: AI generativa, AR/VR, voice interfaces, real-time collaboration, edge computing, WebAssembly, PWA, Web Components, LLM agents.

**Formato per ogni idea**:
```
### Idea #N — [Titolo accattivante]
**Categoria**: [1/2/3/4]
**Genialita**: [perche e geniale, non grandiosa — geniale]
**Implementazione**: [come farla in 1-3 sessioni]
**Impatto**: [cosa cambia per l'utente]
```

**REGOLA**: Le idee devono essere GENIALI (intelligenti, eleganti, sorprendenti) non GRANDIOSE (costose, complesse, irrealistiche). Un'idea geniale e qualcosa che con poco effort produce un effetto sproporzionato.

---

## SKILL E PLUGIN DA USARE

| Skill/Plugin | Quando |
|-------------|--------|
| `quality-audit` | Metriche quantitative (font, touch, bundle, console) |
| `volume-replication` | Confronto esperimenti vs PDF |
| `tinkercad-simulator` | Parita funzionale componenti |
| `ralph-loop` | Iterazione continua fino a quality gate |
| `systematic-debugging` | Quando emergono bug |
| `verification-before-completion` | Prima di dichiarare qualsiasi task completo |
| `brainstorming` | Prima della Fase 6 (idee) |
| `dispatching-parallel-agents` | Fase 3 (sciame 4 agenti) |
| WebSearch | Cercare idee e soluzioni online |
| WebFetch | Consultare documentazione |
| Chrome MCP | Debug visivo Fase 5 |
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

## METRICHE DI SUCCESSO SESSIONE 45

| Metrica | Target | Verifica |
|---------|--------|----------|
| Esperimenti verificati | 69/69 | Report sciame agenti |
| Pagine sito debuggate | 21/21 | Checklist per pagina |
| P0 aperti | 0 (se azione utente completata) | Endpoint test |
| P1 fixati | almeno 5/11 | Diff git |
| Build | 0 errori | npm run build |
| Score onesto | >= 8.5 (da 8.1) | CoV report |
| Console.log | 0 in prod | grep |
| Touch targets | 100% >= 44px | Audit |
| Font LIM | 0 dichiarazioni < 16px per contenuto didattico | grep |
| Ricerca YouTube | Funzionante | Browser test |
| Cose mancanti | Lista >= 15 item | Documento |
| Idee geniali | 20 (5 per categoria) | Documento finale |
| Debug browser | Screenshot prima/dopo | Chrome/Preview |
| Deploy | Vercel + Netlify success | CLI output |

---

## ORDINE DI ESECUZIONE

```
FASE 1: CURA ELAB TUTOR (~2h)
  ├── 1.1 Verifica esperimenti vs libro (campione 15)
  ├── 1.2 Coerenza sistema simulatore
  ├── 1.3 Grafiche (SVG, screenshot, icone)
  ├── 1.4 Volume gating (test completo)
  ├── 1.5 Dashboard user-friendly
  ├── 1.6 Mobile ECCEZIONALE (3 viewport x tutte le pagine)
  └── 1.7 Admin/Insegnante feature/semplificazioni

→ BUILD CHECK + DEPLOY VERCEL

FASE 2: DEBUG SITO NETLIFY (~1.5h)
  └── Audit 21 pagine con checklist

→ DEPLOY NETLIFY

FASE 3: SCIAME 4 AGENTI (~2h)
  ├── Agente 1: Vol1 Cap 6-8 (14 exp)
  ├── Agente 2: Vol1 Cap 9-10 + Vol2 Cap 5-6 (24 exp)
  ├── Agente 3: Vol2 Cap 7-8 + Vol3 Cap 11 (18 exp)
  └── Agente 4: Vol3 Cap 12-13 + Audit trasversale (13 exp + audit)

→ FIX TUTTI I PROBLEMI + BUILD CHECK + DEPLOY

FASE 4: YOUTUBE + MANCANTI (~1h)
  ├── 4.1 Implementare ricerca YouTube
  └── 4.2 Lista fondamentali mancanti

FASE 5: DEBUG BROWSER (~1h)
  ├── Chrome ELAB Tutor (11 step)
  └── Chrome Sito Pubblico (8 step)

FASE 6: 20 IDEE GENIALI (fine sessione)
  └── Sedimentare conoscenza → 5 pedagogia + 5 informatica + 5 stile/marketing + 5 non-restare-indietro
```

---

## STRINGA DI LANCIO

```
Sessione 45 — ELAB. Leggi PRIMA:
1. PRODOTTO/elab-builder/sessioni/PDR-ATTUALE-25-02-2026.md
2. PRODOTTO/elab-builder/sessioni/prompt/PROMPT-SESSIONE-45.md
3. ~/.claude/projects/-Users-andreamarro-VOLUME-3/memory/MEMORY.md

Poi esegui le 6 fasi in ordine. Usa skill quality-audit, volume-replication, ralph-loop, systematic-debugging, brainstorming, dispatching-parallel-agents. Usa Chrome MCP per debug visivo. ANALISI BRUTALMENTE ONESTE. FIX ECCEZIONALI. Le 20 idee geniali ALLA FINE, sedimentando conoscenza durante tutto il lavoro. Chain of Verification su TUTTO.
```

---

*Prompt Session 45 — Andrea Marro, 25/02/2026*
*Costruito sui PDR di 44 sessioni precedenti.*
*"La cura del dettaglio e cio che separa il buono dall'eccellente."*
