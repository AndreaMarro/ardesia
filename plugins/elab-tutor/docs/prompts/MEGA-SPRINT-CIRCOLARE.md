# 🔥 ELAB Tutor — Mega Sprint 12+ Sessioni Circolari (Notturno)

---

## ▌TASK

Voglio portare ELAB Tutor a qualità produzione finale in 10 sprint **CIRCOLARI** con COV. I 10 sprint girano in loop infinito: dopo Sprint 10, si torna a Sprint 1 e si raffina tutto. Ogni ciclo migliora i punteggi e cattura problemi sfuggiti al ciclo precedente. Il loop continua finché ogni area non raggiunge 10/10 o finché non ti fermo io.

Obiettivi chiave: funzionalità perfetta, componenti identici ai libri, Galileo onnisciente, Scratch fruibile su qualsiasi device (specialmente iPad), lavagna super-fluida, drag & drop perfetto, OGNI foro della breadboard funzionante, contenuti perfettamente adattati ad ogni dispositivo, zero regressioni.

Prima di tutto leggi COMPLETAMENTE questi file di contesto:

---

## ▌CONTEXT FILES

```
docs/prompts/context/00-STATO-PROGETTO.md        — score card, problemi noti, architettura
docs/prompts/context/01-COMPONENTI-SVG.md         — mappa dei 22 componenti SVG, pin, dimensioni
docs/prompts/context/02-ESPERIMENTI-MAPPA.md      — tutti gli esperimenti vol1/2/3 con status
docs/prompts/context/03-SCRATCH-ARDUINO.md        — stato Scratch, Blockly, compilazione, blocchi
docs/prompts/context/04-GALILEO-CAPABILITIES.md   — azioni Galileo, routing, knowledge, lacune
docs/prompts/context/05-IPAD-RESPONSIVE.md        — breakpoints, touch, problemi noti iPad
docs/prompts/context/06-ESTETICA-DESIGN.md        — palette, font, design tokens, inconsistenze
docs/prompts/context/07-NANO-R4-SPECS.md          — specifiche hardware Arduino Nano R4, pinout
docs/prompts/context/08-REGRESSIONI-LOG.md        — log regressioni trovate e prevenute (append-only)
docs/prompts/context/09-COV-CHECKLIST.md          — checklist COV cumulativa (append-only)
```

Questi file vengono aggiornati ad ogni sprint. Leggili TUTTI prima di iniziare ogni sprint.

---

## ▌REFERENCE

Modello di lavoro: Piano 5 Sessioni (S112-S116) → 36/36 COV PASS.

Regole estratte:
- **Always** eseguire COV punto per punto PRIMA di dichiarare uno sprint completo
- **Always** fare `npm run build` → 0 errori prima di ogni commit
- **Always** testare nel browser con Claude Preview dopo ogni fix
- **Always** produrre il prompt dello sprint successivo alla fine di ogni sprint
- **Always** creare/aggiornare skill di test riutilizzabili per pattern ricorrenti
- **Always** testare fruibilità, bellezza, leggibilità e adattamento contenuti su almeno 3 viewport (mobile, tablet/iPad, desktop)
- **Always** verificare drag & drop di componenti su fori contigui — traslazione a fori adiacenti DEVE funzionare
- **Never** usare agenti paralleli o subagenti — lavoro strettamente sequenziale
- **Never** modificare codice senza prima leggere il file e capire il contesto
- **Never** committare senza aver verificato che le funzionalità precedenti funzionano
- **Never** considerare un fix completo senza averlo visto funzionare nel browser
- **Never** ignorare un fallimento di test — diagnosticarlo e risolverlo prima di procedere

---

## ▌SUCCESS BRIEF

**Tipo di output**: 10 sprint ciclici di codice + documentazione + deploy
**Durata**: molte ore, lavoro notturno autonomo con massima autonomia
**Risultato atteso**: ELAB Tutor pronto per utenti reali — studenti e insegnanti usano Scratch, Arduino, Galileo, Lavagna senza alcun intoppo su qualsiasi device. Il simulatore è PERFETTO: ogni foro funziona, ogni drag è fluido, ogni componente si posiziona con precisione chirurgica.
**NON deve sembrare**: lavoro superficiale, fix cosmetici senza verifica, checklist spuntata senza test reali
**Successo significa**: ogni sprint chiuso con COV PASS, deploy Vercel funzionante, 0 regressioni cumulative, punteggi che salgono ad ogni ciclo, simulatore usabile da uno studente di 12 anni senza aiuto

---

## ▌RULES (Immutabili)

### R1 — Zero Regressioni
Dopo OGNI modifica, verificare che tutte le funzionalità esistenti funzionano ancora. Usare Ralph Loop per test continui. Se una regressione viene rilevata, STOP immediato — fixare prima di procedere. Aggiornare `08-REGRESSIONI-LOG.md`.

### R2 — COV Obbligatorio
Ogni sprint ha una checklist COV specifica. Ogni punto va verificato nel codice E nel browser. Non dichiarare PASS senza evidenza. Aggiornare `09-COV-CHECKLIST.md`.

### R3 — Sequenziale, Mai Parallelo
Un fix alla volta. Un file alla volta. Leggere → capire → modificare → testare → committare. MAI lanciare agenti o subagenti in parallelo.

### R4 — Browser Verification Obbligatoria + Multi-Device
Usare Claude Preview (dev server porta 5173) per verificare OGNI fix visivamente. Screenshot o snapshot come evidenza. Nessun fix è completo senza verifica browser.

**Test continui su Claude in Chrome** con viewport multipli dopo ogni fix visivo:
| Device | Viewport | Note |
|--------|----------|------|
| iPhone SE | 375×667 | Mobile minimum |
| iPhone 14 Pro | 393×852 | Mobile standard |
| iPad Mini | 768×1024 | Tablet portrait |
| iPad Air landscape | 1180×820 | Tablet landscape |
| iPad Pro 12.9" | 1024×1366 | Tablet grande |
| Desktop HD | 1440×900 | Desktop standard |
| Desktop 4K | 2560×1440 | Widescreen |

Usare `resize_window` per cambiare dimensione e `computer(screenshot)` per catturare evidenza. Testare ALMENO 3 viewport per ogni fix visivo (mobile + iPad + desktop). Ogni screenshot diventa evidenza nella COV.

### R5 — Documentazione Continua
Ogni sprint produce: report nella cartella sessione, aggiornamento dei context files, prompt dello sprint successivo. La cartella `docs/prompts/context/` è la single source of truth.

### R6 — Componenti = Libro, MAI Regredire
I componenti SVG devono essere GRAFICAMENTE IDENTICI a quelli illustrati nei volumi PDF. **REGOLA CRITICA**: un nuovo SVG non deve MAI far regredire il simulatore. Ogni componente SVG nuovo o modificato DEVE:
1. Mantenere gli stessi pin IDs del componente che sostituisce (per compatibilità CircuitSolver/PlacementEngine)
2. Funzionare in TUTTI gli esperimenti dove il vecchio componente era usato
3. Essere testato con simulazione PLAY su almeno 3 esperimenti prima del commit
4. Migliorare o pareggiare il componente sostituito — MAI peggiorare
Se un nuovo SVG rompe anche UN solo esperimento → REVERT immediato, diagnosticare, riprovare.

### R7 — Breadboard Perfetta
I componenti SULLA breadboard TRASLANO con la breadboard. Parent-child attachment sacro. OGNI SINGOLO FORO della griglia deve funzionare — snap preciso, traslazione a fori contigui fluida. Se un componente viene spostato da un foro al foro adiacente, il risultato deve essere preciso e immediato. Nessun foro "morto".

### R8 — iPad First + Responsive Perfetto + Claude Chrome Multi-Device
Ogni fix deve funzionare su iPad (768×1024, 1024×768, 1180×820). Touch ≥44px. No hover-only. Contenuti (testo, pulsanti, pannelli) devono adattarsi in modo leggibile e bello ad ogni viewport. Testare fruibilità, bellezza, leggibilità su almeno 3 dimensioni.

**Protocollo test Claude Chrome**: dopo ogni sprint che tocca UI/CSS/layout, eseguire un ciclo completo di resize su TUTTI i 7 viewport della matrice R4. Per ogni viewport verificare:
1. Nessun overflow orizzontale (scrollbar X)
2. Testo leggibile (font-size ≥ 14px su mobile, ≥ 12px desktop)
3. Pulsanti tappabili (≥ 44px su touch, ≥ 32px su desktop)
4. Pannelli non sovrapposti
5. Contenuto non troncato o nascosto

### R9 — Token Economy
Minimizzare token per massimizzare contesto. Read con offset/limit. Grep mirato. Context files come cache.

### R10 — Skill Creator Massivo & Sistematico
Usare `/skill-factory` in modo MASSIVO e SISTEMATICO. Per OGNI area del progetto creare skill dedicate:
- `skill-breadboard-test.md` — test griglia fori + snap + traslazione
- `skill-experiment-verify.md` — test caricamento/simulazione esperimento generico
- `skill-scratch-compile.md` — test compilazione Scratch→C++ per esperimento AVR
- `skill-galileo-action.md` — test singolo action tag Galileo
- `skill-svg-regression.md` — test regressione SVG (pin IDs, esperimenti, simulazione)
- `skill-responsive-check.md` — test viewport mobile/iPad/desktop
- `skill-lavagna-perf.md` — test performance lavagna (lag, undo/redo)
- `skill-drag-stress.md` — test drag & drop stress su griglia breadboard
Creare skill PRIMA di testare. Usare skill per OGNI test. Skill = test riproducibile e documentato. Se un test viene fatto più di una volta, DEVE esistere una skill per esso.

---

## ▌CONVERSATION (Allineamento rapido → poi autonomia)

Prima di iniziare chiedi conferma SOLO su:
1. Quale sprint ha priorità massima? (suggerimento: Sprint 1 — Audit)
2. Il dev server è già avviato o devo avviarlo?
3. Ci sono fix urgenti emersi dall'ultimo uso del sito?

**DOPO aver ricevuto le risposte, VAI AVANTI IN TOTALE AUTONOMIA.** Non chiedere più nulla. Non aspettare conferme tra sprint. Esegui tutti gli sprint in sequenza, loop circolare, finché l'utente non ti ferma. L'allineamento iniziale è l'UNICO momento di interazione — dopo è lavoro autonomo al 100%.

---

## ▌PLAN — I 12 Sprint (espandibili se necessario)

> **REGOLA ESPANSIONE**: Se durante uno sprint emerge che serve più lavoro di quanto previsto, SPEZZA lo sprint in sotto-sprint (es. Sprint 4A, 4B). Il numero di sprint non è un limite rigido — la qualità viene prima della pianificazione. Aggiungi sprint quando serve.

### Sprint 1 — Audit & Context Bootstrap
Creare `docs/prompts/context/` con tutti i 10 file MD. Audit completo: ogni componente SVG, ogni esperimento, stato Scratch, stato Galileo, problemi iPad, stato lavagna, problemi drag & drop noti, breadboard snap status. Score card aggiornata. Questo sprint NON modifica codice — solo documentazione.
- **COV**: 10 context files creati, ognuno con ≥20 righe di contenuto verificato

### Sprint 2 — Breadboard Perfetta & Drag Chirurgico
OGNI foro della breadboard (griglia 63×10 + bus power) deve accettare snap. Traslazione componente da foro a foro contiguo: fluida, precisa, senza glitch. Drag & drop stress test: spostare LED, resistore, filo su 20+ fori diversi. Fix qualsiasi "foro morto" o snap impreciso. Parent-child attachment: tutti i componenti seguono la breadboard nel drag.
- **COV**: Griglia completa testata (almeno 20 fori campione inclusi angoli e bus) + traslazione contigua 5 componenti PASS + parent-child drag PASS

### Sprint 3 — Scratch Desktop & iPad Perfection
Scratch fruibile: side-by-side su desktop, stacked su iPad, Blockly responsive, compilazione C++ per TUTTI i 12 AVR, blocchi LCD, resize. Leggibilità blocchi e codice su iPad.
- **Chrome Multi-Device**: resize_window su 7 viewport → Blockly workspace adattato, code panel leggibile, compile button visibile ovunque
- **COV**: 12/12 AVR compile + iPad portrait + landscape + desktop + codice leggibile ogni viewport + 7 screenshot Chrome PASS

### Sprint 4 — Arduino Nano R4 SVG (Sostituzione NanoBreakout)
Eliminare NanoR4Board.jsx "breaknano" → SVG identico alla scheda Arduino Nano R4 del libro. Pinout, dimensioni, aspetto. Integrare con PlacementEngine, CircuitSolver, Vol3.
- **COV**: SVG = reference libro + 12 Vol3 funzionanti + pin mapping verificato

### Sprint 5 — Esperimenti Vol1 Verifica Completa
OGNI esperimento Vol1 (≈25): caricamento, componenti, posizioni, fili, simulazione, 3 build modes. Drag contiguo per ogni esperimento. Fix discrepanze.
- **COV**: 25/25 Vol1 PASS (load + simulate + build modes + drag)

### Sprint 6 — Esperimenti Vol2+Vol3 Verifica Completa
Vol2 (≈20) + Vol3 (≈25 AVR). Compilazione Arduino, Scratch, Serial Monitor. Drag su ogni esperimento.
- **COV**: 45/45 Vol2+Vol3 PASS + compilazione AVR 12/12

### Sprint 7 — Galileo Onnisciente (Controllo Totale)
Galileo controlla OGNI funzione: load/play/pause/stop/clearall/addcomponent/removewire/compile/switcheditor/openeditor/closeeditor/loadblocks/quiz/hint/loadexp/opentab + azioni breadboard. Verificare ogni action tag.
- **COV**: 26+ action tags verificati uno per uno nel browser

### Sprint 8 — Galileo Onnisciente (Consapevolezza & Spiegazioni)
Galileo sa cosa c'è sul circuito, esperimento, modalità, tab. Spiega Scratch, guida passo-passo, diagnostica errori, suggerisce fix. Knowledge base completa.
- **COV**: 20 domande test (5 circuito + 5 Scratch + 5 Arduino + 5 contesto) PASS

### Sprint 9 — Lavagna Super-Fluida & Scorrevole
WhiteboardOverlay fluida come carta: zero lag, pinch-zoom iPad, palm rejection, stroke smoothing, resize, undo/redo. Touch + Apple Pencil + mouse. Bella, scorrevole, responsive.
- **Chrome Multi-Device**: resize_window su 7 viewport → lavagna fruibile e bella su ogni dimensione, toolbar non overflow, canvas ridimensionato
- **COV**: 0 lag stroke + pinch-zoom + iPad portrait/landscape + undo/redo 10x + responsive + 7 screenshot Chrome PASS

### Sprint 10 — Estetica Unificata & Fruibilità Totale
Pulsanti uniformi, spacing, font (Oswald + Open Sans + Fira Code), palette (#1E4D8C, #7CB342), design tokens. Testare fruibilità, bellezza, leggibilità, adattamento contenuti su mobile (375px), iPad (768/1024px), desktop (1440px). OGNI elemento bello e leggibile su ogni schermo.
- **Chrome Multi-Device OBBLIGATORIO**: ciclo COMPLETO 7 viewport con resize_window. Per ogni viewport: screenshot + verifica overflow + font-size check + touch target check. Questo sprint è il gatekeeping estetico — nessun viewport può avere problemi.
- **COV**: 0 colori fuori palette + 0 inline styles + 7 viewport screenshot tutti belli e leggibili + read_page accessibility check su 3 viewport

### Sprint 11 — SVG = Libro (Parità Visiva SENZA Regressioni)
Confrontare OGNI componente SVG (22) con illustrazioni Fritzing dei PDF. Proporzioni, colori, dettagli. LED = LED del libro. Resistore con bande corrette. Breadboard giusta. **PER OGNI SVG MODIFICATO**: verificare pin IDs invariati, testare 3+ esperimenti che lo usano con PLAY, confermare CircuitSolver/PlacementEngine compatibilità. Un SVG nuovo che rompe un esperimento = REVERT + diagnosi. Usare `skill-svg-regression.md` per ogni componente.
- **COV**: 22 componenti confrontati + PER OGNUNO: 3 esperimenti testati con PLAY + pin mapping invariato + 0 regressioni

### Sprint 12 — Integration Test Finale & Mega-Test
Test end-to-end di TUTTO: ogni esperimento (70+), ogni modalità, Scratch, Arduino C++, Galileo (azioni + knowledge), Lavagna, iPad (3 viewport), desktop, drag & drop, breadboard fori, responsive. Fix finali. Deploy. Score card definitiva.
- **Chrome Multi-Device COMPLETO**: ciclo 7 viewport su TUTTE le aree (simulatore, Scratch, lavagna, Galileo chat, pannelli). Documentazione screenshot per ogni viewport.
- **COV**: Mega-test 60+ punti across all sprints + score card con delta vs ciclo precedente + 7×5 matrice viewport-area screenshot PASS

---

## ▌ALIGNMENT (Solo Sprint 1 del Ciclo 1)

**Solo al primo sprint del primo ciclo**, prima di scrivere codice:
1. Leggi TUTTI i context files in `docs/prompts/context/`
2. Lista le 3 regole più rilevanti per lo sprint corrente
3. Scrivi il piano di esecuzione (max 5 passi)
4. Fai le 3 domande della sezione CONVERSATION
5. Dopo le risposte dell'utente → **AUTONOMIA TOTALE**, non chiedere MAI più nulla

**Per tutti gli sprint successivi**: leggi context files → esegui → COV → deploy → sprint successivo. ZERO interazione.

---

## ▌TOOLING & TECHNIQUES

### Mantenimento Contesto
```
docs/prompts/context/           — 10 file MD aggiornati ad ogni sprint
docs/sessions/sprint-N.M-*/    — cartella per sprint con REPORT + PROMPT successivo
08-REGRESSIONI-LOG.md           — append-only, mai cancellare
09-COV-CHECKLIST.md             — append-only, cumulativo
```

### Plugin & Skill
- **Ralph Loop** (`/ralph-loop`): test continui e ripetuti dopo ogni fix
- **Skill Creator** (`/skill-factory`): creare skill per pattern ricorrenti
- **Claude Preview** (`preview_start`): dev server per verifica browser
- **Quality Audit** (`/quality-audit`): audit automatico qualità
- **Claude in Chrome** (`tabs_context_mcp` + `navigate` + `resize_window` + `computer(screenshot)`): test CONTINUI multi-device. Dopo ogni fix visivo:
  1. `tabs_context_mcp` → ottieni tabId
  2. `navigate` → carica `http://localhost:5173` (o URL Vercel deploy)
  3. `resize_window` → ciclo su 7 viewport (375×667, 393×852, 768×1024, 1180×820, 1024×1366, 1440×900, 2560×1440)
  4. `computer(screenshot)` → cattura evidenza per ogni viewport
  5. `read_page` → verifica accessibility tree (overflow, elementi fuori schermo)
  Salvare screenshot come evidenza COV. Se un viewport mostra problemi → fix PRIMA di procedere

### Tecniche
- **Programmatic Tool Calling**: tool calling strutturato e prevedibile
- **Token Economy**: `Read` con offset/limit, `Grep` mirato, context files come cache
- **Sequential Execution**: mai più di un'operazione alla volta
- **COV as Code**: checklist verificabili, non descrittive
- **Responsive Testing Multi-Device**: testare ogni fix su 7 viewport usando Claude in Chrome:
  - Mobile: 375×667 (iPhone SE), 393×852 (iPhone 14 Pro)
  - Tablet: 768×1024 (iPad Mini portrait), 1180×820 (iPad Air landscape), 1024×1366 (iPad Pro 12.9")
  - Desktop: 1440×900 (HD), 2560×1440 (4K)
  - Ogni viewport: screenshot + overflow check + touch target check + font leggibilità

### Comandi Git per Sprint
```bash
npm run build                              # 0 errors
git add [file specifici]                   # mai git add -A
git commit -m "Sprint N.M: [descrizione]"  # messaggio documentato
git push origin main                       # push immediato
npx vercel --prod --yes                    # deploy produzione
```

---

## ▌EXECUTION ORDER — LOOP CIRCOLARE ♻️

```
╔═══════════════════════════════════════════════════════════════════╗
║                        LOOP INFINITO                              ║
║                                                                   ║
║   Sprint 1  → AUDIT (context, score card)                         ║
║   Sprint 2  → BREADBOARD + DRAG (fori, snap, traslazione)        ║
║   Sprint 3  → SCRATCH (iPad + desktop)                            ║
║   Sprint 4  → NANO R4 SVG (sostituzione breaknano)               ║
║   Sprint 5  → ESPERIMENTI VOL1 (verifica completa)               ║
║   Sprint 6  → ESPERIMENTI VOL2+VOL3 (verifica completa)          ║
║   Sprint 7  → GALILEO CONTROLLO (action tags)                     ║
║   Sprint 8  → GALILEO KNOWLEDGE (consapevolezza)                  ║
║   Sprint 9  → LAVAGNA (super-fluida + scorrevole)                ║
║   Sprint 10 → ESTETICA + FRUIBILITÀ (bellezza ogni device)       ║
║   Sprint 11 → SVG = LIBRO (parità visiva)                        ║
║   Sprint 12 → INTEGRATION TEST + MEGA-TEST                       ║
║        │                                                           ║
║        ╰──────── TORNA A Sprint 1 ────────╮                       ║
║                                            │                       ║
║   Ogni ciclo raffina. Il punteggio SALE.   │                       ║
║   Si esce SOLO quando l'utente lo dice.    │                       ║
║   Sprint aggiuntivi se serve (4A, 4B...)   │                       ║
╚═══════════════════════════════════════════════════════════════════╝
```

### Naming Convention
- Ciclo 1: `sprint-1.1`, `sprint-1.2`, ... `sprint-1.12`
- Ciclo 2: `sprint-2.1`, `sprint-2.2`, ... `sprint-2.12`
- Sotto-sprint: `sprint-1.4A`, `sprint-1.4B` (se uno sprint va spezzato)

### Regola del Ciclo
Al completamento di Sprint N.12:
1. Aggiorna score card in `00-STATO-PROGETTO.md`
2. Confronta punteggi col ciclo precedente
3. Identifica aree sotto 9.5/10
4. Torna a Sprint (N+1).1 focalizzato su quelle aree
5. Continua fino a quando l'utente non ti ferma

### Output di Ogni Sprint
1. ✅ Fix implementati e testati nel browser
2. 📋 COV checklist PASS
3. 📁 Report nella cartella sprint
4. 📝 Context files aggiornati
5. 🚀 Deploy Vercel production
6. 🔄 Transizione immediata allo sprint successivo

---

## ▌NOTA FINALE — AUTONOMIA MASSIMA

Questo è lavoro notturno autonomo. **Vai avanti da solo per molte ore.** Non fermarti. Non chiedere conferma tra uno sprint e l'altro — prosegui automaticamente. Se trovi un problema, risolvilo. Se un test fallisce, diagnosticalo e fixalo. Se un context file è incompleto, completalo. Se un componente non corrisponde al libro, ridisegnalo. Se Galileo non capisce, aggiungi knowledge. Se un foro non funziona, fixalo. Se il drag non è fluido, rendilo fluido. Se la lavagna lagga, ottimizzala. Se un testo è illeggibile su iPad, adattalo.

Il loop circolare garantisce che nulla venga dimenticato. Ogni ciclo cattura ciò che il precedente ha mancato. Il punteggio può solo salire.

**L'obiettivo è svegliarsi con ELAB Tutor perfetto.**
