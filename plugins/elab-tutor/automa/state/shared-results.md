# RISULTATI CONDIVISI — Tutti i task leggono e scrivono qui
© Andrea Marro — ELAB Tutor
Ultimo aggiornamento: 2026-03-25 22:45

---

## REGOLA
Ogni scheduled task e l'automa Python APPENDONO i loro risultati qui.
NON sovrascrivere — solo appendere alla fine.
Formato: ## [nome-task] YYYY-MM-DD HH:MM → risultati strutturati

## STATO ATTUALE SISTEMA
- Score: 0.9471
- Build: OK (1m 4s)
- Bundle: 51 KB main
- Fix reali: ConsentBanner CLS, Google Fonts, font LIM, landing /scuole, lazy-load, DOMPurify
- Automa: PID 24834, loop ogni 10min
- Queue: 2 P0 + 8 P1

---

## [Ciclo 36] RESEARCH — 2026-03-26 13:15
- Cosa fatto: Ricerca innovazione EdTech — analizzati 8 fonti accademiche (Stanford Tutor CoPilot RCT, Harvard AI tutoring, npj systematic review, GenAI EE tutors, CADRE microelectronics, trend 2026)
- File modificati: automa/knowledge/research-cycle-36.md (nuovo)
- Finding principali:
  - F1: Stanford Tutor CoPilot conferma Principio Zero — AI che supporta il docente > AI che sostituisce (+9% mastery per inesperti, $20/anno)
  - F2: Middle school (10-14 anni) è la fascia dove ITS hanno effetti meno significativi — servono scaffold specifici
  - F3: Prompt strutturati → risposte AI migliori (vantaggio curriculum YAML di ELAB)
  - F4: 2026 = anno consolidamento abitudini AI nelle scuole (timing perfetto per ELAB)
- Opportunità: O1 Galileo multi-suggerimento (medium), O2 scaffold progressivo (medium), O3 articolo marketing Stanford-ELAB (low)
- Lesson: La ricerca Stanford valida scientificamente il modello ELAB. Il gap middle school suggerisce che ELAB deve investire in scaffold calibrati per 10-14 anni, non copiare pattern da high school/università.

## [Ciclo 37] IMPROVE — 2026-03-26 13:30
- Cosa fatto: Lighthouse LCP — deferred 3 heavy imports from main bundle
  - PrivacyPolicy (1339 LOC) → React.lazy() (only used on /privacy path)
  - Buffer polyfill → requestIdleCallback (only needed by react-pdf, already lazy)
  - mobile-drag-drop → requestIdleCallback (only needed for touch-device simulator)
- File modificati: src/App.jsx, src/main.jsx
- Risultato: index chunk 675 KB → 478 KB (**-29%**, -197 KB)
- Build: PASS (18.57s)
- Lesson: Polyfills importati staticamente che servono solo a moduli lazy-loaded sono sprechi sul critical path. requestIdleCallback con fallback setTimeout è il pattern sicuro per deferire.

## [Ciclo 38] IMPROVE — 2026-03-26 13:15
- Cosa fatto: Fixed 9 relatedExperiment IDs in unlim-knowledge-base.js (100% were broken offline)
- Mapping: cap1-led-semplice→v1-cap6-esp1, cap7-led-rgb→v1-cap7-esp1, cap6-pulsante→v1-cap8-esp1, cap3-potenziometro→v1-cap9-esp1, cap4-buzzer→v1-cap11-esp1, cap5-fotoresistenza→v1-cap10-esp1, cap8-servo→v3-extra-servo-sweep, cap9-motor-dc→v2-cap10-esp1, cap10-lcd→v3-extra-lcd-hello
- File modificati: src/data/unlim-knowledge-base.js
- Build: PASS (19.10s)
- Lesson: Knowledge base IDs were authored with a fictional naming convention that never matched the actual experiment ID schema (v{vol}-cap{ch}-esp{n}). Cross-validation between data files is essential.

## [smoke-test-agent] 2026-03-26 20:53
- Automa: PID 56062 (running)
- Build: PASS (last chunk: dist/workbox-354287e6.js)
- Questo test FUNZIONA

## [adversarial] 2026-03-26 23:22
- Score: 0.9655
- Critici: 3
- Tasks creati: 1
- 1. Cosa fanno i competitor: Tinkercad offre un'interfaccia più intuitiva e facile da usare per i pro
- **VALIDATORE UX ATTIVATO. ANALISI SPIETATA.**
- [ERROR: Command '['claude', '-p', 'Sei un ARCHITETTO SOFTWARE critico. Analizza ELAB UNLIM.\nELAB UN

---

## [ricerca-web-reale] 2026-03-26 23:30

### PNRR — Bandi attivi e opportunità

1. **Avviso n. 115839 (3 luglio 2025)** — "Laboratori di orientamento e PCTO in ambito STEM"
   - Destinatari: Scuole secondarie di secondo grado
   - Modalità: Candidature "a sportello" fino a esaurimento fondi
   - Finanzia: Orientamento scientifico, mobilità, laboratori STEM, workshop IA
   - Fonte: https://www.tutornow.it/blog/formazione-scolastica/post/pnrr-scuola-2025-2026-stem-intelligenza-artificiale

2. **Bandi attivi su MR Digital (marzo 2026)**:
   - Potenziamento offerta formativa ITS Academy
   - Fondi formazione AI per docenti
   - Agenda Sud e Agenda Nord
   - Realizzazione laboratori innovativi e avanzati
   - Campus formativi integrati
   - Fonte: https://education.mrdigital.it/bandi/

3. **Piano Scuola 4.0** — Stanziamento totale: €2,1 miliardi per 100.000 classi
   - Azione 1 (Next Generation Classrooms): ambienti innovativi
   - Azione 2 (Next Generation Labs): laboratori professioni digitali
   - Min 60% budget per dotazioni digitali (software, app, contenuti)
   - Completamento progetti: dicembre 2025, formazione estesa a.s. 2025/2026
   - Portali: pnrr.istruzione.it, padigitale2026.gov.it, Scuola Futura
   - Fonte: https://www.campustore.it/bandi-e-finanziamenti/piano-nazionale-di-ripresa-e-resilienza-pnrr/piano-scuola-4-0-pnrr.html

**DATO CRITICO per ELAB**: Il 60% minimo per dotazioni digitali (software incluso) è la porta d'ingresso. Le scuole DEVONO spendere su software STEM. Bandi "a sportello" = chi arriva prima prende.

### Competitor

#### Tinkercad Circuits (Autodesk)
- **Prezzo**: GRATUITO, browser-based, nessun piano a pagamento
- **Novità 2026**: Aggiunti componenti I2C, aggiornamenti interfaccia incrementali
- **Limiti**: No librerie custom, no upload, set sensori limitato, no nuove board Arduino
- **Punto debole**: Nessun aggiornamento sostanziale di feature nel 2025-2026. Stagnante.
- Fonte: https://www.tinkercad.com/blog/i2c-components
- Fonte: https://www.g2.com/products/tinkercad/reviews

#### Wokwi
- **Community (free)**: Simulazioni illimitate, progetti pubblici, WiFi virtuale
- **Hobby**: $7/mese annuale — 100 build veloci, progetti unlisted, librerie custom
- **Hobby+**: $12/mese annuale — 500 build veloci, VS Code integration
- **Pro**: $25/posto/mese annuale — 1000 build, 2000 CI min, team billing
- **Classroom**: Quotazione custom (min 5 studenti), ~$1,050/anno risparmio su annuale
- **Punto forte**: ESP32, STM32, RPi Pico, WiFi sim — il più avanzato
- **Punto debole per ELAB**: target professionale/universitario, non scuola media
- Fonte: https://wokwi.com/pricing
- Fonte: https://wokwi.com/classroom

#### Arduino Education CTC GO!
- **CTC GO! Core Module**: €1.830 per max 24 studenti (su Campustore)
- **Arduino Student Kit**: €79 IVA inclusa (singolo studente)
- **Durata hardware**: ~2 anni, accesso piattaforma: 1 anno dall'attivazione
- **Include**: 8 UNO WiFi Rev2, 8 Education Shield, 20 sessioni da 45 min
- **Piattaforma online**: IT, EN, ES, DE, PT, FR
- **Punto debole per ELAB**: €1.830 per 24 studenti = €76/studente. ELAB kit €75 + licenza software competitivo.
- Fonte: https://www.campustore.it/arduino-ctc-go-core-module.html
- Fonte: https://store.arduino.cc/products/arduino-ctc-go-core-module

### GDPR / Mistral AI — Alternativa EU-safe

- **Azienda**: Francese, non soggetta a CLOUD Act USA
- **Infrastruttura**: 18.000 chip NVIDIA in Francia (giugno 2025), EU data centers di default
- **Piano Studenti**: €5,99/mese (Le Chat Pro studenti), €14,99/mese standard
- **API pricing chiave per ELAB**:
  - Mistral Small 3.1 (24B): $0.03/$0.11 per 1M token — OTTIMO per didattica
  - Mistral Small 3.2 (24B): $0.075/$0.20 per 1M token
  - Mistral Nemo: $0.02/$0.04 per 1M token — IL PIÙ ECONOMICO
  - Mistral Large: $0.50/$1.50 per 1M token
  - Devstral Small 2505: GRATUITO (experiment tier)
- **GDPR**: Team/Enterprise = Zero Data Retention di default. API dati non usati per training.
- **NOTA CNIL**: Reclamo pendente su opt-out free users (Art. 12 GDPR), nessuna decisione ancora
- Fonte: https://pricepertoken.com/pricing-page/provider/mistral-ai
- Fonte: https://www.waimakers.com/en/resources/gdpr-compliance/mistral-ai
- Fonte: https://weventure.de/en/blog/mistral

**CALCOLO COSTO ELAB con Mistral Nemo**: 1000 studenti x 20 domande/giorno x 500 token medi = 10M token/giorno input. Costo: $0.20/giorno = ~€6/mese. SOSTENIBILE nel budget €50/mese.

### Progetti scuola media Italia — Simulatori circuiti

1. **PhET (Univ. Colorado)** — Il più usato nelle scuole medie italiane
   - Simulatore "Kit Creazione Circuiti: Corrente Continua"
   - Gratuito, tradotto in italiano, browser-based
   - Usato su tecnologiaduepuntozero.it per scuola secondaria
   - Fonte: https://phet.colorado.edu/it/simulations/circuit-construction-kit-dc

2. **IC Bregante-Volta** — Progetto "STEM: che passione!"
   - Attività laboratoriali: circuiti su cartoncino con nastro rame + LED
   - Approccio integrato discipline + digitale
   - Fonte: https://www.icbregantevolta.edu.it/pagine/modulo-stem-che-passione

3. **Simulatori gratuiti usati nelle scuole**:
   - EveryCircuit, Lushprojects Circuit Simulator, DcAcLab
   - Prof. Puglisi (Altervista): raccolta dei migliori simulatori gratuiti
   - Fonte: https://profpuglisisalvatore.altervista.org/didattica/migliori-simulatori-elettronici-gratuiti/
   - Fonte: https://www.electroyou.it/renzodf/wiki/articolo15

**NESSUN progetto italiano usa un simulatore PROPRIETARIO con AI integrato per scuola media. ELAB è UNICO in questo spazio.**

### Gap critici identificati

1. **GAP PNRR**: ELAB non ha una pagina/landing dedicata ai bandi PNRR con codici MEPA e documentazione pronta per i dirigenti scolastici. Le scuole comprano tramite MEPA/Consip.
2. **GAP Mistral**: L'integrazione Mistral API come fallback GDPR-safe non è implementata. Costo stimato: €6/mese per 1000 studenti con Mistral Nemo. Galileo attualmente dipende solo da Anthropic (non EU).


---

## Automa Doctor -- 2026-03-26 23:32

### Status
- Orchestrator: ALIVE (PID 56062)
- Stuck tasks moved to failed/: 3

### Ultimi 5 Lessons
- Ciclo 28: Fix v4-zoom-btn 44x44px. done/keep.
- Ciclo 29: Write permissions bloccate. no_measurement.
- Ciclo 30: exit 0, 602 chars, nessun JSON. done/keep.
- Ciclo 45: max_turns. partial/no_measurement.
- Ciclo 46: max_turns. partial/no_measurement.

### Task stuck -> moved to failed/
- P1-001-classi-simulate.yaml: stuck 94h (dal 2026-03-23)
- P1-font-self-hosted-not-imported.yaml: stuck 10.5h
- P1-teacher-prep-expansion.yaml: stuck 11.5h

### Active queue dopo pulizia
- P1-037-gulpease-improve.yaml (23:11)
- P1-brain-v14-training.yaml (23:31)
- P1-breadboard-appunti-centrali.yaml (23:26)

### Note
- Cicli 45-46 max_turns: scope troppo ampio
- P1-001 stuck 94h: richiede infrastruttura mancante
- Orchestrator vivo ma no_measurement ripetuti: verificare write permissions

## [competitor-research] 2026-03-27 14:30 — Percorsi lezione competitor
- **PhET**: Modello 5E (Engage→Explore→Explain→Elaborate→Evaluate), 4-5 step, 45-50 min. Simulatore = sandbox puro, tutta la struttura viene da worksheet PDF dell'insegnante. Forte inquiry-based. No gestione classe integrata.
- **Tinkercad**: Workshop format (Setup→Intro→Tutorial guidato→Esplorazione libera→Share), 4-5 step, 45-60 min. Ha Classrooms integrato, Starters pre-fatti, feedback conseguenze (LED brucia senza resistore). Corso completo 4 fasi (34 lezioni). Google Classroom add-on.
- **Arduino CTC GO**: 20 sessioni da 45-50 min in 3 fasi: 8 lezioni pratiche → 6 progetti guidati → 6 progetti autonomi (24h totali). Kit fisico + LMS digitale. Gruppi da 3, fino 24 studenti. Training webinar per insegnanti. No valutazione propria.
- **Best practice**: (1) Progressione universale Guidato→Semi-guidato→Autonomo, (2) Sessioni 45-50 min, (3) Insegnante non deve essere esperto, (4) Feedback immediato simulatore, (5) Starters/template pre-fatti, (6) Screenshot come "consegna", (7) Gruppi 2-3 studenti
- **Cosa ELAB puo prendere**: (1) Struttura 5 step per sessione, (2) Starters/circuiti template, (3) Progressione 3 fasi come CTC GO, (4) Gestione classe integrata, (5) Galileo AI come guida DENTRO il simulatore (nessun competitor ce l'ha), (6) Passo Passo vocale (unico), (7) Collegamento Volume fisico ↔ lezione digitale (unico), (8) Report AI automatico per insegnante
- **File completo**: `automa/knowledge/competitor-lesson-structures.md`

## [adversarial] 2026-03-27 03:05
- Score: 0.943
- Critici: 3
- Tasks creati: 1
- ### Cosa 1: Interattività e Simulazioni Dinamiche (Confronto con PhET)
- Ok, Andrea. Allacciati le cinture. Qui non si abbellisce niente.
- Error: Reached max turns (5)

## [adversarial] 2026-03-27 04:40
- Score: 0.9415
- Critici: 3
- Tasks creati: 2
- ### Cosa fanno i competitor meglio di ELAB UNLIM
- Perfetto. Modalità spietata attivata.
- ---

## [adversarial] 2026-03-27 06:33
- Score: 0.9415
- Critici: 3
- Tasks creati: 1
- ### Cosa fanno i competitor meglio di ELAB UNLIM
- Come VALIDATORE UX spietato, ecco la mia analisi:
- [ERROR: [Errno 2] No such file or directory: 'claude']

## [adversarial] 2026-03-27 06:43
- Score: 0.9445
- Critici: 3
- Tasks creati: 2
- ### Cosa fanno i competitor meglio di ELAB UNLIM
- VALIDAZIONE SPIETATA.
- ---

## [adversarial] 2026-03-27 08:44
- Score: 0.9415
- Critici: 3
- Tasks creati: 0
- ### Cosa fanno i competitor meglio di ELAB UNLIM
- [GEMINI-CLI-TIMEOUT]
- [ERROR: [Errno 2] No such file or directory: 'claude']
