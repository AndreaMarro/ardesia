# PIANO OPERATIVO 2 SETTIMANE — "Da Motore a Prodotto"

**Data**: 28/03/2026
**Deadline PNRR**: 30/06/2026 (3 mesi)
**Obiettivo**: Score insegnante da 5.7/10 a 8.5/10
**Principio Zero**: L'insegnante arriva alla LIM e spiega IMMEDIATAMENTE.
**Regola**: ZERO sessioni su infrastruttura interna. 100% su cio' che l'insegnante VEDE.

---

## MAPPA DELLE 7 SESSIONI

| Sessione | Giorno | Nome | Obiettivo | Score target |
|----------|--------|------|-----------|-------------|
| G12 | 1-2 | "Respira" | Progressive disclosure — da 28 bottoni a 3 | +0.8 LIM |
| G13 | 3-4 | "Il Robot Prende Vita" | Mascotte reale + messaggi contestuali | +1.0 UNLIM |
| G14 | 5-6 | "La Prof.ssa Parla" | Voce TTS+STT + Galileo live test | +1.0 UNLIM |
| G15 | 7 | "Meta' Strada" (AUDIT) | CoV massivo, course correction | verifica |
| G16 | 8-9 | "UNLIM Ricorda" | Sessioni salvate + contesto classe | +0.5 UNLIM |
| G17 | 10-11 | "Il Fumetto" | Report PDF + demo end-to-end | +1.0 Business |
| G18 | 12-14 | "Il Giorno del Giudizio" | QA finale + deploy + presentazione | finale |

---

## ANTI-PATTERN DA EVITARE (lezioni dalle 11 sessioni)

1. **Mai refactoring "per pulizia"** — se non cambia l'esperienza insegnante, non farlo
2. **Mai admin panel** — il gestionale ERP e' finito, non toccarlo
3. **Mai auth/login** — gia' risolto con #prova
4. **Mai dead code cleanup** — 1198 commenti possono restare
5. **Mai "preparo il mega-prompt"** — il prompt E' il lavoro, non una meta-attivita'
6. **Mai score inflazionati** — se fa schifo, scrivi che fa schifo

---

## GATE DI QUALITA' (in ogni sessione)

Ogni sessione ha 3 gate obbligatori:
1. **BUILD GATE**: `npm run build` PASSA dopo ogni fase
2. **PRINCIPIO ZERO GATE**: "La Prof.ssa Rossi riuscirebbe?" — se servono >3 tap, FAIL
3. **CoV GATE**: Chain of Verification a fine sessione — 3 agenti paralleli verificano

---
---
---

# G12 — "RESPIRA" (Progressive Disclosure)

**Durata**: sessione lunga
**Obiettivo**: Da 28 bottoni a 3. Da 8 tab a 1 visibile. L'interfaccia respira.
**Score target**: LIM/iPad 4.0 → 6.0 (+2.0)

## PRINCIPIO ZERO
L'insegnante vede: breadboard grande, mascotte piccola, barra input in basso. NIENT'ALTRO.
Gli strumenti appaiono quando servono — chiesti a UNLIM o suggeriti da UNLIM.

## CONTESTO OBBLIGATORIO
Leggi PRIMA di scrivere codice:
1. CLAUDE.md
2. automa/STATE.md
3. automa/reports/G11-MEGA-AUDIT-ONESTO.md (il quadro reale)
4. automa/context/UNLIM-VISION-COMPLETE.md (la bussola)
5. automa/context/GALILEO-CAPABILITIES.md (26+ azioni)
6. Questo prompt fino in fondo

## FASE 0: Bootstrap + Audit Iniziale (15 min)
- npm run build PASSA
- npm run dev parte
- Screenshot homepage attuale (preview_screenshot)
- Conta i bottoni visibili nella ControlBar (target: documentare il "prima")
- Conta i tab visibili in ElabTutorV4
- Scrivi automa/reports/G12-AUDIT-INIZIALE.md con numeri PRIMA

## FASE 1: ControlBar Minimale (2-3 ore) ★ CRITICO

### Obiettivo
ControlBar passa da 28+ bottoni a 3 bottoni base + menu "..." per il resto.

### I 3 bottoni che restano SEMPRE visibili:
1. **▶ Play/Pause** — il piu' importante, grande, lime
2. **Esperimento** — nome esperimento corrente, cliccabile per cambiare
3. **UNLIM** — la mascotte (gia' presente)

### Tutto il resto va in un menu overflow ⋯ (tre puntini)
- Componenti, Editor, BOM → nel menu sotto "Strumenti"
- Wire mode, Rotate, Delete → nel menu sotto "Modifica"
- Serial, Screenshot, Export → nel menu sotto "Avanzato"
- Shortcuts, Help → nel menu sotto "Aiuto"

### Il menu overflow
- Si apre con click su "⋯"
- Organizzato in sezioni con titoli
- Ogni item ha icona + nome + shortcut
- Si chiude cliccando fuori

### Approccio tecnico
- NON eliminare i bottoni — nascondili
- Crea un componente `MinimalControlBar.jsx` che wrappa ControlBar
- Prop `minimalMode={true}` (default) mostra solo 3 bottoni + overflow
- Prop `minimalMode={false}` mostra tutto (per backward compat)
- In UNLIM mode (default): `minimalMode=true`

### Sotto-task
1. Leggi ControlBar.jsx (935 LOC) — capire la struttura
2. Crea MinimalControlBar.jsx — 3 bottoni + menu overflow
3. In NewElabSimulator.jsx, usa MinimalControlBar in UNLIM mode
4. Verifica: screenshot con 3 bottoni visibili vs screenshot vecchio con 28

### Plugin: /frontend-design per il menu overflow, /writing-plans, /architecture
### Checkpoint: automa/reports/G12-FASE1-TOOLBAR.md
### Verifica: screenshot PRIMA (28 bottoni) vs DOPO (3 bottoni)

## FASE 2: Tab Nascosti (1-2 ore)

### Obiettivo
Da 8 tab visibili a 0 tab visibili. Il simulatore e' a schermo pieno.

### Come
- Il tab "Simulator" e' il default e UNICO visibile all'apertura
- Gli altri tab (Manual, Games, Canvas, Notebooks, Videos) si attivano via UNLIM:
  - "mostrami il manuale" → appare tab Manual
  - "giochiamo a Trova il Guasto" → appare tab Detective
  - "apri la lavagna" → appare tab Canvas
- Oppure via menu overflow sotto "Attivita'"

### Approccio tecnico
- In TutorLayout.jsx, nascondi la tab bar quando UNLIM mode e' attivo
- I tab si attivano programmaticamente via `setActiveTab()` (gia' esposto)
- L'azione UNLIM `[AZIONE:opentab:xxx]` gia' funziona — basta nascondere i bottoni tab

### Checkpoint: automa/reports/G12-FASE2-TAB.md
### Verifica: screenshot — simulatore a schermo pieno, zero tab visibili

## FASE 3: Sidebar Pulita (1 ora)

### Obiettivo
La sidebar mostra SOLO il percorso lezione corrente, non la navigazione a 3 livelli.

### Come
- In UNLIM mode, la sidebar mostra LessonPathPanel se un esperimento e' caricato
- Mostra ExperimentPicker solo se il docente chiede "cambia esperimento"
- La sidebar si chiude automaticamente su tablet (gia' implementato)

### Checkpoint: automa/reports/G12-FASE3-SIDEBAR.md

## FASE 4: fontSize Fix (1 ora)

### Obiettivo
54 istanze di fontSize < 14px → 0 nel tutor/simulatore visibile.

### Come
- Grep per `fontSize: 1[0-3]` e `font-size: 1[0-3]px`
- Sostituisci con minimo 14px
- ESCLUDI: code editor (monospace puo' essere 12px), admin panel (non visibile)
- Focus: tutto cio' che appare su LIM

### Checkpoint: automa/reports/G12-FASE4-FONTS.md
### Verifica: grep conferma 0 istanze nel tutor/simulatore

## FASE 5: Verifica + CoV (1-2 ore)

### Layer 1 — Build
npm run build PASSA

### Layer 2 — Screenshot Confronto
- PRIMA: screenshot con 28 bottoni, 8 tab
- DOPO: screenshot con 3 bottoni, 0 tab, simulatore a schermo pieno

### Layer 3 — Principio Zero
- Apro #prova → vedo breadboard grande, 3 bottoni, barra input
- Carico v1-cap6-esp1 → LED si accende
- Tutto funziona come prima, ma l'interfaccia respira

### Layer 4 — CoV (3 agenti)
1. Agente "Impersonatore Prof.ssa Rossi" — simula l'uso sulla LIM
2. Agente "Bug Hunter" — cerca regressioni
3. Agente "UNLIM Vision Check" — confronta con UNLIM-VISION-COMPLETE.md

### Layer 5 — Score
- Bottoni visibili: 28 → 3 (target)
- Tab visibili: 8 → 0 (target, simulatore default)
- fontSize < 14px nel tutor: 54 → 0 (target)

### Scrivi: automa/reports/G12-VERIFICA-FINALE.md, automa/reports/G12-SCORES.md
### Aggiorna: automa/STATE.md, automa/handoff.md, memory/session-summaries.md

---
---
---

# G13 — "IL ROBOT PRENDE VITA" (Mascotte + Messaggi Contestuali)

**Durata**: sessione lunga
**Obiettivo**: La mascotte ELAB e' un robot animato. I messaggi appaiono accanto ai componenti.
**Score target**: UNLIM vision 1.5 → 3.5 (+2.0)

## PRINCIPIO ZERO
UNLIM non e' una lettera "U". E' il robottino del logo ELAB — occhi che brillano quando parla, corpo che pulsa. I messaggi appaiono DOVE servono: accanto al LED quando parla del LED, sopra la breadboard quando suggerisce il montaggio.

## CONTESTO OBBLIGATORIO
1-5 come G12 + automa/reports/G12-VERIFICA-FINALE.md + assets mascotte

## FASE 0: Bootstrap + Asset Mascotte (30 min)
- Cerca il logo ELAB robot in assets/mascot/
- Se non esiste SVG del robot, CREALO — stile piatto, friendly, occhi rotondi, corpo compatto
- Deve funzionare a 48px (angolo) e 200px (centro schermo)
- 3 stati: idle (neutro), speaking (occhi brillano, bordo lime), thinking (pulsazione lenta)

## FASE 1: UnlimMascot Reale (2 ore)
- Sostituisci la lettera "U" con il robot SVG animato
- 3 stati CSS animation: idle, speaking, thinking
- Click sulla mascotte → apre/chiude la chat
- La mascotte si ingrandisce leggermente quando UNLIM sta parlando
- Posizione: angolo in basso a destra, 56px, z-index 1000

### Plugin: /frontend-design per le animazioni, /design-system per coerenza

## FASE 2: Messaggi Contestuali Posizionati (3-4 ore) ★ CRITICO

### Questo e' il cuore della visione UNLIM.

I messaggi non appaiono piu' in top-center. Appaiono ACCANTO al componente di cui parlano.

### Come funziona
1. UNLIM risponde con testo + opzionalmente `[AZIONE:highlight:led1]`
2. Il sistema di overlay rileva l'highlight
3. Trova la posizione SVG del componente `led1` nel canvas
4. Mostra il messaggio come tooltip/fumetto accanto a quel componente
5. Dopo 4-6 secondi, il messaggio sfuma

### Quando non c'e' un componente specifico
- Messaggi generali: centro dello schermo, grande, sfuma dopo 4s
- Messaggi sulla breadboard: sopra la breadboard
- Messaggi sul codice: accanto all'editor (se visibile)

### Approccio tecnico
- Modifica UnlimOverlay.jsx per accettare `targetPosition: {x, y}` opzionale
- Crea `getComponentScreenPosition(componentId)` che:
  1. Trova il componente nel circuito corrente
  2. Ottiene le coordinate SVG dal canvas
  3. Converte in coordinate schermo (considerando zoom/pan)
- Se `targetPosition` e' presente: posiziona il messaggio li'
- Se no: fallback a centro schermo

### Plugin: /frontend-design per i tooltip, /tinkercad-simulator per ispirazione
### Checkpoint: automa/reports/G13-FASE2-MESSAGGI.md
### Verifica: screenshot con messaggio accanto al LED dopo `[AZIONE:highlight:led1]`

## FASE 3: Integrazione con Action Tags (1-2 ore)
- Quando ElabTutorV4 parsa una risposta con `[AZIONE:highlight:xxx]`
- Oltre ad eseguire l'highlight, PASSA le coordinate al sistema overlay
- Il messaggio testuale appare accanto al componente evidenziato

## FASE 4: CoV + Verifica (1-2 ore)
Come G12 ma con focus su:
- La mascotte e' il robot, non la "U"?
- I messaggi appaiono accanto ai componenti?
- Lo schermo resta pulito dopo che i messaggi spariscono?
- 3 agenti CoV: Prof.ssa Rossi, Bug Hunter, Vision Check

---
---
---

# G14 — "LA PROF.SSA PARLA" (Voce + Galileo Live)

**Durata**: sessione lunga
**Obiettivo**: Il docente parla a UNLIM. UNLIM risponde a voce. Galileo funziona DAVVERO.
**Score target**: UNLIM vision 3.5 → 5.5 (+2.0)

## PRINCIPIO ZERO
Su una LIM con 25 ragazzi, il docente NON digita. Parla. "Monta il circuito del pulsante" → UNLIM lo fa. "Cosa succede se tolgo il resistore?" → UNLIM risponde a voce.

## FASE 1: STT — Speech-to-Text (2 ore)
- Web Speech API (gratis, Chrome/Edge — ~75% browser)
- UnlimInputBar ha gia' il bottone mic e prop `onMicClick`
- Implementa: click mic → `SpeechRecognition` start → testo nella barra → auto-send
- Lingua: `it-IT`
- Feedback visivo: mic rosso quando ascolta, testo che appare in tempo reale
- Fallback: se browser non supporta, mic non appare (nessun errore)

## FASE 2: TTS — Text-to-Speech (1-2 ore)
- `SpeechSynthesis` API (gratis, tutti i browser)
- Quando UNLIM risponde, LEGGE la risposta ad alta voce
- Voce italiana (seleziona `it-IT` voice)
- Toggle on/off (icona speaker accanto alla mascotte)
- Non legge le azioni [AZIONE:xxx] — solo il testo naturale
- Rate: 0.9 (leggermente lento per bambini 10-14)

## FASE 3: Galileo Live Test (2-3 ore) ★ CRITICO
- Avvia il dev server
- Apri il browser
- Fai 10 domande REALI a UNLIM:
  1. "Cosa facciamo oggi?" (con esperimento v1-cap6-esp1 caricato)
  2. "Cos'e' un LED?"
  3. "Monta il circuito"
  4. "Perche' serve il resistore?"
  5. "Cosa succede se giro il LED?"
  6. "Compila il codice" (con esperimento Vol3)
  7. "Cerca un video sui LED"
  8. "Fai un quiz"
  9. "Aiutami, non funziona!" (con circuito sbagliato)
  10. "Cosa abbiamo imparato oggi?"

### Per ogni domanda documenta:
- Tempo di risposta (target: <5s, acceptable: <10s)
- Qualita' risposta (1-5)
- Azione eseguita correttamente? (si/no)
- Tono appropriato 10-14 anni? (si/no)
- Screenshot del risultato

### Se il nanobot e' in sleep (cold start 30-60s):
- Documenta il tempo di cold start
- Considera: puo' il frontend mostrare "UNLIM si sta svegliando..." con animazione?

### Plugin: /analisi-galileo, MCP Galileo tools, Control Chrome
### Checkpoint: automa/reports/G14-FASE3-GALILEO-LIVE.md con tutti i risultati

## FASE 4: Fix basati sul test live (1-2 ore)
- Se le risposte sono troppo lunghe → tronca a 60 parole + "Vuoi saperne di piu'?"
- Se le azioni non funzionano → fix il parsing
- Se il tono e' sbagliato → fix il system prompt nanobot
- Se il cold start e' inaccettabile → implementa wake-up ping al boot

## FASE 5: CoV + Verifica
- Il docente puo' parlare a UNLIM? ✅/❌
- UNLIM risponde a voce? ✅/❌
- Galileo risponde in <10s? ✅/❌
- Le azioni funzionano? ✅/❌
- Il tono e' 10-14 anni? ✅/❌
- 3 agenti CoV

---
---
---

# G15 — "META' STRADA" (Audit + Course Correction)

**Durata**: sessione media (meta' giornata)
**Obiettivo**: Verificare TUTTO. Correggere la rotta se necessario.
**Questa sessione NON produce feature. Produce VERITA'.**

## FASE 1: Score Card Meta' Percorso (1 ora)
Ricalcola TUTTI i punteggi con la stessa metodologia del mega-audit G11:
- Simulatore engine
- Contenuto pedagogico
- LIM/iPad usabilita' (DEVE essere salito)
- Teacher Dashboard
- WCAG/A11y
- Code Quality
- Performance
- Business readiness
- UNLIM vision (DEVE essere salito)

## FASE 2: CoV Massivo (2 ore)
5 agenti paralleli:
1. **Prof.ssa Rossi Impersonation** — simula uso completo sulla LIM
2. **Bug Hunter** — cerca regressioni da G12-G14
3. **UNLIM Vision Delta** — confronta stato attuale con UNLIM-VISION-COMPLETE.md
4. **Competitor Check** — cosa hanno fatto Tinkercad/Wokwi questa settimana?
5. **LIM Simulator** — simula su schermo 1920x1080 proiettato

## FASE 3: Course Correction (1 ora)
Basandosi sui risultati:
- Se UNLIM vision < 4.0 → G16-G17 devono concentrarsi su mascotte/messaggi, non sessioni
- Se Galileo non funziona → G16 diventa fix Galileo, non sessioni salvate
- Se il build e' rotto → fix prima di tutto
- Aggiorna il piano se necessario

### Scrivi: automa/reports/G15-AUDIT-MIDPOINT.md
### Aggiorna: PIANO-2-SETTIMANE.md se serve course correction

---
---
---

# G16 — "UNLIM RICORDA" (Sessioni + Contesto Classe)

**Durata**: sessione lunga
**Obiettivo**: UNLIM sa cosa ha fatto la classe. Quando il docente torna, riprende da dove era.
**Score target**: UNLIM vision 5.5 → 6.5 (+1.0)

## PRINCIPIO ZERO
"Bentornati! L'ultima volta avete fatto il LED. Marco ha avuto problemi con la polarita'. Oggi passiamo al resistore. Servono 3 resistori diversi."

## FASE 1: Sessione Strutturata (2-3 ore)
- Quando il docente apre un esperimento → INIZIO SESSIONE
- Tutto viene registrato:
  - Messaggi UNLIM (domande + risposte)
  - Azioni eseguite (esperimenti caricati, circuiti montati)
  - Errori (LED al contrario, cortocircuito)
  - Screenshot periodici (ogni 60s se il circuito cambia)
  - Tempo per fase
- Quando il docente chiude o cambia esperimento → FINE SESSIONE
- Sessione salvata in localStorage con ID univoco

### Struttura dati sessione:
```json
{
  "id": "sess_2026-03-30_v1-cap6-esp1",
  "experimentId": "v1-cap6-esp1",
  "startTime": "2026-03-30T09:15:00",
  "endTime": "2026-03-30T09:45:00",
  "messages": [...],
  "actions": [...],
  "errors": [...],
  "screenshots": ["base64..."],
  "summary": "Primo circuito LED. 3 errori di polarita'. Concetto chiave: anodo/catodo."
}
```

## FASE 2: Contesto Classe (2 ore)
- Al boot, UNLIM legge TUTTE le sessioni precedenti
- Costruisce un "profilo classe":
  - Ultimo esperimento completato
  - Concetti capiti (nessun errore) vs confusi (errori ripetuti)
  - Prossimo esperimento suggerito
- Questo profilo viene iniettato nel system prompt di ogni richiesta AI
- Il messaggio di benvenuto usa il contesto: "Bentornati! L'ultima volta..."

## FASE 3: Suggerimento Prossima Lezione (1 ora)
- Quando il docente apre UNLIM senza esperimento specifico
- UNLIM suggerisce: "La prossima lezione e' [Cap X Esp Y]. Vuoi iniziare?"
- Basato su: ultimo esperimento + curriculum sequenziale dei volumi

## FASE 4: CoV + Verifica
- Apro UNLIM → chiudo → riapro → UNLIM ricorda? ✅/❌
- Il messaggio di benvenuto e' contestuale? ✅/❌
- Le sessioni sono salvate in localStorage? ✅/❌
- Il profilo classe e' costruito correttamente? ✅/❌

---
---
---

# G17 — "IL FUMETTO" (Report PDF + Demo)

**Durata**: sessione lunga
**Obiettivo**: Report lezione come fumetto PDF. Demo end-to-end per Giovanni.
**Score target**: Business 3.5 → 5.5 (+2.0)

## PRINCIPIO ZERO
Il dirigente scolastico riceve un PDF: la mascotte ELAB racconta la lezione. Immagini del circuito, domande dei ragazzi, risposte di UNLIM, concetti appresi. Condivisibile, stampabile, archivabile per il PNRR.

## FASE 1: Report PDF Engine (3-4 ore)

### Struttura del PDF fumetto:
1. **Copertina**: Logo ELAB + "Lezione: Accendi il LED" + data + classe
2. **Timeline fumetto**: Per ogni momento chiave della sessione:
   - Mascotte con fumetto: il messaggio
   - Screenshot del circuito in quel momento
   - Se c'e' stato un errore: "Oops! Il LED era al contrario"
3. **Riepilogo**: Concetti appresi, errori corretti, prossima lezione
4. **Footer**: "Generato da ELAB Tutor — elabtutor.school"

### Approccio tecnico
- Usa i dati della sessione salvata (FASE 1 di G16)
- Genera HTML → stampa CSS `@media print` → il docente fa "Stampa → Salva PDF"
- OPPURE: genera con una libreria client-side leggera (jsPDF + html2canvas gia' presente)
- NON servono server — tutto client-side

### La mascotte nel PDF
- SVG inline del robot in posizioni diverse (parla, pensa, esulta, indica)
- Fumetti con i messaggi accorciate (max 2 righe)

## FASE 2: Demo End-to-End (2 ore)
Simula l'intera esperienza che mostrerai a Giovanni Fagherazzi:

1. Apri elab-builder.vercel.app/#prova → 2 tap al LED ✅
2. UNLIM saluta: "Bentornati!" ✅ (o "Ciao! Primo esperimento?" se prima volta)
3. Carica v1-cap6-esp1 → circuito pronto
4. Passo Passo → step guidati
5. Parla: "Cos'e' un LED?" → UNLIM risponde a voce
6. Montaggio sbagliato → UNLIM corregge (messaggio accanto al componente)
7. Play → LED si accende
8. "Crea il report" → PDF fumetto generato
9. Teacher Dashboard → dati reali → Export PNRR

### Documenta TUTTO con screenshot
### Se qualcosa non funziona → FIX IMMEDIATO (non rimandare)

## FASE 3: CoV + Verifica
- Il PDF si genera? ✅/❌
- Il PDF e' leggibile e professionale? ✅/❌
- La demo end-to-end funziona senza intoppi? ✅/❌
- 3 agenti CoV: Prof.ssa Rossi, Quality, Vision

---
---
---

# G18 — "IL GIORNO DEL GIUDIZIO" (QA Finale + Deploy)

**Durata**: sessione lunga
**Obiettivo**: Verificare TUTTO. Deploy. Score finale.
**Questo e' l'ultimo checkpoint. Nessun bluff.**

## FASE 1: Verifica Massiva 10 Layer (3-4 ore)

### Layer 1 — Build
`npm run build` → exit 0

### Layer 2 — Browser E2E (10 esperimenti)
v1-cap6-esp1, v1-cap7-esp1, v1-cap7-esp3, v1-cap8-esp2, v1-cap9-esp4,
v2-cap6-esp1, v2-cap6-esp3, v2-cap7-esp1, v3-cap6-semaforo, v3-cap7-mini

### Layer 3 — Console Errors
Target: 0 errori nuovi

### Layer 4 — Teacher Dashboard
8 tab, dati reali, export JSON/CSV, report PNRR stampabile

### Layer 5 — Accesso Zero-Friction
#prova → 2 tap al LED

### Layer 6 — Progressive Disclosure
3 bottoni visibili (non 28), 0 tab visibili (simulatore default)

### Layer 7 — Mascotte + Messaggi
Robot animato (non "U"), messaggi accanto ai componenti

### Layer 8 — Voce
STT funziona, TTS funziona, toggle on/off

### Layer 9 — Sessioni + Report
Sessione salvata, contesto classe, PDF fumetto generato

### Layer 10 — UNLIM Vision
Confronto punto per punto con UNLIM-VISION-COMPLETE.md

### 5 agenti CoV paralleli + /giudizio-multi-ai

## FASE 2: Score Finale Onesta (1 ora)
| Area | G11 | G18 target | G18 reale |
|------|-----|-----------|-----------|
| Simulatore | 9.5 | 9.5 | ? |
| Contenuto | 8.5 | 8.5 | ? |
| LIM/iPad | 4.0 | 7.0 | ? |
| Dashboard | 6.5 | 7.0 | ? |
| WCAG | 6.0 | 7.5 | ? |
| Code Quality | 4.5 | 5.0 | ? |
| Performance | 7.5 | 7.5 | ? |
| Business | 3.5 | 6.0 | ? |
| UNLIM vision | 1.5 | 6.5 | ? |
| **Insegnante** | **5.7** | **8.0+** | ? |

## FASE 3: Deploy
`npm run build && npx vercel --prod --yes`

## FASE 4: Handoff Definitivo
- automa/STATE.md aggiornato
- automa/handoff.md con tutto
- memory/ aggiornato
- Report finale per Giovanni Fagherazzi

---
---
---

## STRUTTURA AUTOMA E TASK PER LE 2 SETTIMANE

### Automa (loop continuo)
**Focus UNICO**: Pre-generare i 5 lesson path JSON mancanti (62→67)
- Ogni ciclo: prende 1 esperimento senza lesson path → genera il JSON → valida → salva
- Output: file JSON in src/data/lesson-paths/
- Il lesson path ha: 5 fasi, vocabolario, analogie, errori comuni, assessment

### Scheduled Tasks

| Task | Frequenza | Cosa fa |
|------|-----------|---------|
| `build-check` | ogni 2h | npm run build, notifica se fallisce |
| `regression-test` | ogni 4h | carica 5 esperimenti random, verifica zero errori |
| `galileo-warmup` | ogni 1h | ping nanobot per evitare cold start |
| `unlim-vision-delta` | ogni 12h | confronta stato codice con UNLIM-VISION-COMPLETE.md |
| `competitor-watch` | ogni 24h | check Tinkercad/Wokwi/Code.org novita' |

### Comunicazione automa ↔ task
- automa/shared-results.md — l'automa scrive, i task leggono
- automa/task-findings.md — i task scrivono, l'automa legge
- Ogni sessione interattiva (G12-G18) legge entrambi al bootstrap

---

## METRICHE DI SUCCESSO FINALE

| Metrica | G11 (oggi) | Target G18 | Come si misura |
|---------|-----------|-----------|----------------|
| Bottoni toolbar | 28 | 3 | Conta visibile screenshot |
| Tab visibili | 8 | 0 (simulatore default) | Screenshot |
| Mascotte | Lettera "U" | Robot animato | Screenshot |
| Messaggi posizionati | 0% | 80%+ | Test 5 azioni con highlight |
| Voce STT | No | Si (Chrome) | Test mic → testo |
| Voce TTS | No | Si | Test risposta → audio |
| Galileo funziona | Non testato | Si, <10s | 10 domande live |
| Sessioni salvate | No | Si | Chiudi → riapri → contesto |
| Report PDF | No | Si | Genera → apri → leggibile |
| fontSize < 14px (tutor) | 54 | 0 | Grep |
| alert() | 0 | 0 | Grep |
| PWA precache | 4.1 MB | < 4 MB | Build output |
| Score insegnante | 5.7 | 8.0+ | Score card pesata |
| Score UNLIM vision | 1.5 | 6.5+ | Checklist 7 capacita' |
