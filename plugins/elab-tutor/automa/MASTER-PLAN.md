# ELAB UNLIM — MASTER PLAN
> Basato su: audit fisico 27/03/2026, ricerca web (PNRR, Mistral, competitor),
> contesto completo (riunioni, obiettivi Andrea, committenti), 3 pezzi UNLIM Brain.
> OGNI azione deve servire il Principio Zero.
> Data: 27/03/2026

---

## PRINCIPIO ORGANIZZATORE

Il prodotto dice "guarda quante cose so fare".
Il prodotto DEVE dire "ecco cosa fai adesso".

Il motore è 8/10. L'esperienza docente è 3/10.
Il gap è TUTTO nella UX e nel cervello pedagogico.

---

## FASE 0: FIX BLOCCANTI (giorni 1-3)
> Senza questi, il prodotto è INUTILIZZABILE dalla Prof.ssa Rossi.
> L'automa e i task DEVONO lavorare qui PRIMA di tutto.

### 0.1 Homepage — Eliminare il redirect
- **File**: `src/components/ShowcasePage.jsx`
- **Problema**: "Reindirizzamento alla vetrina..." su sfondo grigio. Prima impressione fatale.
- **Fix**: Renderizzare VetrinaSimulatore direttamente, eliminare redirect a Netlify
- **Verifica**: curl homepage → HTML con contenuto ELAB, non "Reindirizzamento"
- **Chi**: automa IMPROVE

### 0.2 Menu — Nascondere Dev/Admin
- **File**: `src/components/tutor/ElabTutorV4.jsx` (o dove il menu è definito)
- **Problema**: Menu hamburger mostra Dev, Dashboard, Admin. L'insegnante non deve vederli.
- **Fix**: Mostrare Dev/Admin solo se `user.role === 'admin'`
- **Verifica**: aprire menu come utente normale → solo "Area Docente" visibile
- **Chi**: automa IMPROVE

### 0.3 Chat — Default minimizzata, no "Sono qui"
- **File**: `src/components/tutor/ElabTutorV4.jsx` (o componente chat)
- **Problema**: Chat UNLIM si apre automaticamente con "Sono qui", copre metà schermo
- **Fix**: Chat minimizzata per default. Nessun messaggio automatico.
- **Verifica**: aprire il simulatore → chat NON visibile, solo icona piccola
- **Chi**: automa IMPROVE

### 0.4 Toggle Modalità Guida — Eliminare
- **File**: probabilmente nel componente header/toolbar del simulatore
- **Problema**: "Modalità Guida OFF" visibile. Il prodotto È guida — non serve toggle.
- **Fix**: Rimuovere il toggle. La guida è sempre attiva per default.
- **Verifica**: aprire simulatore → nessun toggle "Modalità Guida" visibile
- **Chi**: automa IMPROVE

### 0.5 Toolbar — Ridurre a 3 bottoni essenziali
- **File**: `src/components/simulator/panels/ControlBar.jsx`
- **Problema**: 7 icone visibili (Menu, <, Reset, BOM, ⋮, Quiz, Timer). Troppo.
- **Fix**: Mostrare solo: ◀ Indietro, ▶ Play, 📋 Guida. Il resto in menu "⋮"
- **Verifica**: contare bottoni visibili nella toolbar → ≤4
- **Chi**: automa IMPROVE (progressive disclosure già implementato, serve abbassare default)

### 0.6 Due nomi — Unificare
- **Problema**: "ELAB Tutor" nell'header, "ELAB UNLIM" nel body
- **Fix**: Tutto "ELAB UNLIM" o tutto "UNLIM" — un solo nome
- **Verifica**: grep -r "ELAB Tutor" → 0 occorrenze visibili all'utente
- **Chi**: automa IMPROVE

### GATE FASE 0
- [ ] Homepage non fa redirect
- [ ] Menu non mostra Dev/Admin
- [ ] Chat minimizzata per default
- [ ] Nessun toggle "Modalità Guida"
- [ ] Toolbar ≤4 bottoni
- [ ] Un solo nome del prodotto
- [ ] Build PASSA
- [ ] Deploy su Vercel

---

## FASE 1: UNLIM CONOSCE I VOLUMI (settimana 1)
> Pezzo 1 del cervello pedagogico. Il dato esiste, serve il wiring.

### 1.1 Curriculum YAML nel contesto Galileo
- **Cosa**: Quando il nanobot riceve `experiment_id=v1-cap6-esp1`, carica il YAML
  corrispondente e lo inietta nel prompt di sistema
- **File nanobot**: `nanobot/server.py` (routing), `nanobot/prompts/tutor.yml`
- **File YAML**: `automa/curriculum/v1-cap6-esp1.yaml` (61 file esistono)
- **Problema**: I YAML sono su disco locale, non sul server Render.
  Soluzione: inviare il YAML relevante nel body della richiesta /chat,
  oppure copiare i YAML nel repo nanobot
- **Chi**: automa IMPROVE + sessione interattiva per il wiring nanobot

### 1.2 Vocabolario progressivo enforced
- **Cosa**: Se l'utente è al Cap 6, Galileo NON può usare "resistenza" (si introduce al Cap 7)
- **Come**: Il YAML ha `forbidden_terms`. Il prompt deve dire "NON usare queste parole: ..."
- **Verifica**: Chiedi "cos'è una resistenza?" con experiment_id=v1-cap6-esp1
  → DEVE rispondere "non abbiamo ancora parlato di resistenze, lo vedremo presto!"
- **Chi**: automa IMPROVE (modifica prompt nanobot)

### 1.3 Esperimento successivo noto
- **Cosa**: UNLIM deve sapere quale esperimento viene dopo
- **Come**: Il YAML ha `next_experiment` o si deduce dalla sequenza
- **Verifica**: Chiedi "cosa facciamo dopo?" → DEVE dire "Cap 6 Esp 2: LED senza resistore"
- **Chi**: automa IMPROVE

### 1.4 Galileo più breve
- **Cosa**: Risposte teoria da 534 char a <300 char
- **File**: `nanobot/prompts/shared-optimized.yml` (regole Gulpease)
- **Come**: Max 3 frasi + 1 analogia + 1 azione. Limite 80 parole.
- **Verifica**: 5 domande teoria → tutte sotto 300 char
- **Chi**: automa IMPROVE + galileo-quality-check (scheduled task)

### GATE FASE 1
- [ ] Galileo usa vocabolario progressivo (test 3 esperimenti diversi)
- [ ] Galileo sa quale esperimento viene dopo
- [ ] Risposte teoria <300 char (5/5 test)
- [ ] Build PASSA
- [ ] Deploy nanobot su Render

### RICERCA collegata (per automa RESEARCH + competitor-researcher)
- Paper: "vocabulary scaffolding electronics education children"
- Competitor: come PhET gestisce la progressione dei concetti?
- GDPR: verifica che i YAML non contengano dati personali
- Mistral: test latenza con Mistral Nemo per risposte teoria (<3s?)

---

## FASE 2: UNLIM PREPARA LA LEZIONE (settimana 2)
> Pezzo 2 del cervello pedagogico. Il flusso 6-step nel prodotto.

### 2.1 LessonPathPanel connesso ai YAML
- **Cosa**: Il pannello mostra i 5 step (PREPARA→CONCLUDI) generati dal YAML
- **File**: `src/components/simulator/panels/LessonPathPanel.jsx` (668 LOC, mai testato)
- **Come**: Leggere il YAML dell'esperimento corrente, estrarre:
  - PREPARA: `teacher_briefing` + lista componenti
  - MOSTRA: lista componenti + circuito
  - CHIEDI: `common_mistakes` → domanda provocatoria
  - OSSERVA: [AZIONE:play] + cosa osservare
  - CONCLUDI: `concepts_introduced` → riassunto 2 frasi
- **Chi**: sessione interattiva (richiede design decisions)

### 2.2 "Monta il circuito per me"
- **Cosa**: Bottone nel pannello PREPARA che fa montare il circuito a UNLIM
- **Come**: Usa [INTENT:JSON] con i componenti e wires dal YAML dell'esperimento
- **Verifica**: clicca "Monta" → circuito appare completo sulla breadboard
- **Chi**: sessione interattiva

### 2.3 UNLIM proattivo al caricamento
- **Cosa**: Quando si apre un esperimento, UNLIM dice "Oggi facciamo..." senza aspettare
- **Come**: Evento `experimentChange` → genera messaggio da teacher_briefing
- **Verifica**: apri esperimento → messaggio appare nel pannello (NON nella chat)
- **Chi**: automa IMPROVE

### 2.4 Percorso lezione come centro del prodotto
- **Cosa**: Il LessonPathPanel diventa il pannello principale, non la sidebar volumi
- **Come**: Quando un esperimento è aperto, il pannello lezione occupa il lato destro.
  La sidebar volumi si chiude. Il focus è: circuito + percorso lezione.
- **Verifica**: simulazione Prof.ssa Rossi → segue 5 step senza aprire chat/sidebar
- **Chi**: sessione interattiva

### GATE FASE 2
- [ ] LessonPathPanel si renderizza senza errori
- [ ] 5 step visibili per almeno 3 esperimenti diversi
- [ ] "Monta il circuito per me" funziona per 1 esperimento
- [ ] UNLIM dice "Oggi facciamo..." automaticamente
- [ ] Build PASSA
- [ ] Deploy Vercel

### RICERCA collegata
- Paper: "lesson planning AI scaffolding primary education"
- Competitor: come Arduino CTC GO! struttura le lezioni? (costa 1830€)
- UX: pattern "step-by-step wizard" per docenti inesperti
- Pedagogia: effetto della proattività AI sull'autonomia del docente

---

## FASE 3: UNLIM INLINE (settimana 3)
> Pezzo 3. La chat diventa secondaria. I suggerimenti vivono nel simulatore.

### 3.1 Progress bar 5-step sopra il simulatore
- **Cosa**: Barra orizzontale: ● PREPARA ○ MOSTRA ○ CHIEDI ○ OSSERVA ○ CONCLUDI
- **Dove**: Sopra la breadboard, sotto la toolbar
- **Come**: Componente React, stato sincronizzato con LessonPathPanel
- **Chi**: automa IMPROVE o sessione interattiva

### 3.2 Suggerimenti nel pannello esperimento
- **Cosa**: Quando il docente è al passo CHIEDI, il pannello mostra il suggerimento
  senza aprire la chat
- **Come**: Il pannello LessonPathPanel mostra il contenuto del passo corrente
- **Chi**: automa IMPROVE

### 3.3 Chat secondaria
- **Cosa**: La chat resta per domande libere ma il flusso principale NON la usa
- **Come**: Chat minimizzata per default (già fatto in Fase 0). Nessun "Sono qui".
  Il docente può aprirla se vuole chiedere qualcosa di specifico.
- **Chi**: già implementato in Fase 0

### 3.4 Tooltip inline sui componenti (futuro)
- **Cosa**: LED al contrario → tooltip "L'anodo (+) va in alto!"
- **Come**: Event listener su piazzamento + validazione polarità/collegamento
- **Chi**: sessione interattiva (richiede logica di validazione)
- **Nota**: Questo è P2, non P0. Prima funzionano i 5 step.

### GATE FASE 3
- [ ] Progress bar visibile sopra il simulatore
- [ ] Il docente completa un esperimento SENZA aprire la chat
- [ ] Build PASSA
- [ ] Deploy Vercel

### RICERCA collegata
- UX: "contextual hints in educational software" — best practice
- Competitor: come Duolingo fa suggerimenti inline?
- Paper: "proactive vs reactive AI tutoring systems comparison"

---

## FASE 4: MERCATO E INFRASTRUTTURA (settimana 4+)
> Queste non sono meno importanti — sono BLOCCATE finché le Fasi 0-3 non funzionano.

### 4.1 Landing page /scuole
- **Cosa**: Pagina per dirigenti scolastici. 30 secondi per capire cos'è ELAB.
- **Contenuto**: cos'è, quanto costa, come si compra (MePa), video demo 60s
- **Ricerca fatta**: PNRR Avviso 115839 (laboratori STEM), Piano Scuola 4.0 (60% budget software)
- **Chi**: automa WRITE + sessione interattiva per design

### 4.2 Mistral come fallback GDPR
- **Cosa**: Sostituire Anthropic con Mistral per risposte in produzione
- **Ricerca fatta**: Mistral Nemo $0.02/M token, Zero Data Retention, francese = EU nativo
- **Costo stimato**: ~€6/mese per 1000 studenti
- **Chi**: sessione interattiva (richiede cambio architettura nanobot)

### 4.3 Brain V14 training
- **Cosa**: Retrainare Brain su dati reali dei cicli + fix addcomponent routing
- **Bug noto**: "metti un LED" classificato come play invece di addcomponent
- **Chi**: automa + galileo-brain-dataset-factory skill

### 4.4 Latenza Galileo
- **Problema**: 15.3s media. Target: <5s.
- **Soluzioni**:
  - Cache risposte frequenti nel nanobot (costo zero)
  - Mistral Nemo per risposte corte (<3s)
  - Pre-generazione lezioni al caricamento esperimento
- **Chi**: automa IMPROVE + sessione interattiva

### 4.5 Test con insegnante reale
- **Cosa**: 15 minuti con un docente vero > 100 cicli automa
- **Come**: Andrea chiede a un insegnante di provare. Registra schermo.
- **Chi**: Andrea (non automatizzabile)

---

## ASSEGNAZIONE LAVORO

### L'automa Python (loop ogni 1h) lavora su:
- Fase 0: fix CSS/HTML (homepage, menu, chat, toolbar, toggle)
- Fase 1: prompt Galileo (brevità, vocabolario)
- Fase 4.3: Brain V14 dataset
- Micro-ricerca ogni 3 cicli (paper, competitor)
- Adversarial review ogni 5 cicli

### I scheduled tasks lavorano su:
- **e2e-tester** (ogni 4h): verifica sito + Galileo + build, fixa bug CSS
- **galileo-quality-check** (ogni 12h): testa 5 domande, misura brevità/tags
- **galileo-improver** (ogni 6h): analizza risposte, migliora prompt, ricerca pedagogica
- **visual-audit** (ogni 6h): cerca font piccoli, touch target, parole sviluppatore, fixa
- **simulator-improver** (ogni 5h): cerca bug engine, verifica esperimenti, fixa
- **adversarial-review** (ogni 8h): critica tutto, crea task P0/P1
- **automa-doctor** (ogni 3h): rilancia automa se morto, pulisci queue
- **competitor-researcher** (ogni giorno): ricerca PNRR, Mistral, competitor

### Le sessioni interattive (Andrea + Claude) lavorano su:
- Fase 2: LessonPathPanel (richiede decisioni di design)
- Fase 2: "Monta il circuito per me" (richiede test visuale)
- Fase 3: Progress bar 5-step (richiede design)
- Fase 4.2: Integrazione Mistral (richiede cambio architettura)
- Fase 4.5: Test con insegnante reale

---

## CRITERI DI SUCCESSO PER FASE

| Fase | Successo = | Fallimento = |
|------|-----------|--------------|
| 0 | Prof.ssa Rossi apre il sito e vede il prodotto in <5s senza confusione | Vede redirect, Dev/Admin, chat invadente |
| 1 | Galileo sa che al Cap 6 non può dire "resistenza" e sa cosa viene dopo | Galileo parla come ChatGPT generico |
| 2 | Il docente segue PREPARA→CONCLUDI senza aprire la chat | Il docente non sa cosa fare dopo |
| 3 | Il docente completa una lezione guardando solo il simulatore | Il docente deve usare la chat per ogni passo |
| 4 | Un dirigente scolastico capisce il prodotto in 30s dalla landing page | Nessuno sa che ELAB esiste |

---

## LINEE DI RICERCA (per automa RESEARCH + task)

| # | Linea | Collegata a | Chi |
|---|-------|-------------|-----|
| R1 | Vocabolario progressivo in educazione STEM | Fase 1 | galileo-improver |
| R2 | Pattern step-by-step wizard per docenti | Fase 2 | competitor-researcher |
| R3 | Suggerimenti inline vs chat in EdTech | Fase 3 | galileo-improver |
| R4 | PNRR bandi aperti scuole STEM 2026 | Fase 4 | competitor-researcher |
| R5 | Mistral GDPR compliance per minori | Fase 4 | competitor-researcher |
| R6 | Teacher adoption barriers tecnologia | Fase 0 | adversarial-review |
| R7 | Misconcezioni elettricità bambini 10-14 | Fase 1 | galileo-improver |
| R8 | Local AI models school hardware specs | Fase 4 | competitor-researcher |
| R9 | Proactive vs reactive AI tutoring | Fase 3 | galileo-improver |
| R10 | Arduino CTC GO! struttura lezioni/pricing | Fase 4 | competitor-researcher |

Ogni ricerca DEVE produrre: 1 finding con fonte URL + 1 azione concreta o task YAML.
Ricerca che non produce azione = rumore.

---

## ANTI-PATTERN (cosa NON fare)

1. NON aggiungere feature prima di fixare la Fase 0
2. NON fare ricerca generica — ogni ricerca serve una Fase specifica
3. NON toccare il motore del simulatore (CircuitSolver, AVRBridge) — funziona
4. NON modificare evaluate.py senza autorizzazione
5. NON allargare scope — i 3 pezzi UNLIM sono il perimetro
6. NON dire "fatto" senza test con simulazione Prof.ssa Rossi
7. NON confondere attività con progresso
8. NON investire tempo su i18n, voice control, o cluster hardware prima della Fase 3
