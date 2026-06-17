# PROMPT S74 — Galileo Improvement + iPad Real-Device Test

> Copia-incolla questo intero prompt nella nuova sessione Claude Code.
> Sessione S74 — Due fasi: (A) Miglioramento Galileo, (B) Test iPad reale guidato.

---

## CONTESTO

Progetto ELAB Tutor — simulatore di circuiti per studenti 8-14 anni.
Root: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/`
Nanobot backend: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/nanobot/`
Deploy: Vercel (frontend) + Render (nanobot git push)

**Sessione S73 completata**: 7 fix backend + 1 bonus fix (addcomponent→INTENT conversion). Ralph Loop R1-R30: **25/28 PASS, 3 PARTIAL**. Deploy Vercel + Render completati.

**Sessione S72 completata**: 11 bugfix iPad da test reale Chiara. Score Sprint 1: 9.4/10. **iPad re-test ancora da fare post-S72+S73.**

**LEGGI PRIMA DI TUTTO** (in parallelo):
1. `docs/context/ipad-libero/02-INVARIANTS.md` — regole inviolabili
2. `docs/context/ipad-libero/05-TASK-TRACKER.md` — stato sprint
3. `.team-status/QUALITY-AUDIT.md` — audit S72+S73

---

## RIEPILOGO S73 — Cosa e' stato fatto

### 7 Fix Backend (server.py + circuit.yml + PlacementEngine.js + ElabTutorV4.jsx)

| # | Fix | Descrizione |
|---|-----|-------------|
| FIX-1 | TUTOR_OVERRIDE word-boundary | `\b` regex: "costruisci" non matcha piu' "cos'e'" |
| FIX-2 | Multi-component intent injection | `findall()` + congiunzioni + quantita' + ref sequenziali `_NEW_N` |
| FIX-3 | Circuit specialist prompt v5.3 | `action_imperative`, `pin_map` 14 tipi, esempi multi-comp |
| FIX-4 | WIRING_TEMPLATES expansion | 5→14 component types in PlacementEngine.js |
| FIX-5 | Vision→Circuit chaining | `route_to_specialist()` catena Vision→Circuit per "guarda e correggi" |
| FIX-6 | Context enrichment goal state | `handleSend()` aggiunge componenti attuali/attesi/mancanti |
| FIX-7 | deterministic_action_fallback | highlight, compile, loadexp, opentab regex + tab name map |

### Bonus Fix: convert_addcomponent_to_intent()

Il LLM genera spesso `[AZIONE:addcomponent:led:250:100]` (da nanobot.yml) invece di `[INTENT:]` (da circuit.yml). Post-processor che converte TUTTI i tag addcomponent in un singolo [INTENT:] con componenti e relazioni.

Applicato su 3 path: `/tutor-chat` specialist, `/tutor-chat` monolithic fallback, `/chat` endpoint.

---

## RALPH LOOP R1-R30 — RISULTATI

### 25/28 PASS (89%)

| Range | Categoria | Risultato |
|-------|-----------|-----------|
| R1-R4 | Azioni base (play/pause/reset/clearall) | 4/4 PASS |
| R5-R7 | Singolo componente (LED/resistore/buzzer) | 3/3 PASS |
| R8 | Richiesta passiva ("ho bisogno di un pulsante") | PARTIAL |
| R9 | Aggiungi con posizione ("LED a destra") | PASS |
| R10 | Inserisci condensatore | PARTIAL (risposta vuota, race LLM) |
| R11-R12 | Multi-componente (LED+resistore / 3 LED) | 2/2 PASS |
| R13 | "Piazza pulsante a sinistra" | PARTIAL (interpretato come move) |
| R14-R17 | Azioni tab (highlight/compile/loadexp/opentab) | 4/4 PASS |
| R18-R19 | Teoria + Galileo identity | 2/2 PASS |
| R20 | "Cos'e' un resistore?" | PASS (contenuto corretto, routing sub-ottimale) |
| R21-R23 | Regressione (vision chain, clearall, quiz) | 3/3 PASS |
| R26-R30 | Nuove azioni S73 + regressione no-tag | 5/5 PASS |

### 3 Gap residui da migliorare

| ID | Prompt test | Problema | Root cause |
|----|-------------|----------|------------|
| R8 | "Ho bisogno di un pulsante" | Nessun INTENT generato | Frase passiva senza verbo azione (aggiungi/metti/inserisci). `classify_intent()` non riconosce "ho bisogno di" come ACTION |
| R10 | "Inserisci un condensatore" | Risposta vuota | Race LLM transiente (tutti i provider hanno fallito o ritornato vuoto). Non un bug di codice. |
| R13 | "Piazza il pulsante a sinistra del LED" | Generato movecomponent invece di addcomponent | LLM interpreta "piazza" come spostamento. `classify_intent()` non distingue "place new" da "move existing" |

---

## FASE A — MIGLIORAMENTO GALILEO (3 fix mirati)

### FIX-A1: classify_intent — richieste passive (R8)

**File**: `nanobot/server.py`
**Funzione**: `classify_intent()`

Aggiungere pattern per richieste passive che implicano aggiunta componente:

```
Verbi passivi da riconoscere come ACTION:
- "ho bisogno di (un/una/dei/delle) COMPONENTE"
- "mi serve (un/una) COMPONENTE"
- "mi servirebbe (un/una) COMPONENTE"
- "vorrei (un/una) COMPONENTE"
- "voglio (un/una) COMPONENTE"
- "ci vuole (un/una) COMPONENTE"
- "manca (un/una) COMPONENTE"
```

Questi pattern devono matchare solo quando seguiti da un nome componente valido (LED, resistore, pulsante, buzzer, etc.).

### FIX-A2: classify_intent — disambiguazione place vs move (R13)

**File**: `nanobot/server.py`
**Funzione**: `classify_intent()` e/o `deterministic_intent_injection()`

Logica:
- Se il messaggio contiene "piazza/posiziona/metti" + componente + posizione relativa ("a sinistra/destra/vicino/sopra/sotto")
- E il componente NON esiste gia' nel `circuitState` (se disponibile dal context enrichment FIX-6)
- → Classificare come ACTION (nuovo componente), non come MOVE

Se il circuitState non e' disponibile, default ad ACTION (meglio aggiungere che spostare il nulla).

### FIX-A3: nanobot.yml — armonizzazione addcomponent vs INTENT

**File**: `nanobot/nanobot.yml`
**Problema**: Il system prompt istruisce TUTTI gli specialist a usare `[AZIONE:addcomponent:TYPE:X:Y]`, ma circuit.yml dice "NON usare MAI addcomponent, usa [INTENT:]". Questa contraddizione causa il 70% dei fallback su `convert_addcomponent_to_intent()`.

**Azione**:
- In nanobot.yml, nella sezione tag azioni, aggiungere nota chiara: "Per aggiungere componenti al circuito, usare [INTENT:] (vedi circuit.yml). [AZIONE:addcomponent] e' DEPRECATO e verra' convertito automaticamente."
- NON rimuovere addcomponent dal nanobot.yml (potrebbe rompere altri specialist che non hanno circuit.yml)
- Aggiungere `[INTENT:]` come tag documentato nel nanobot.yml con sintassi ed esempi

---

## FASE A — PROCEDURA

1. Leggi `nanobot/server.py` — funzioni `classify_intent()` e `deterministic_intent_injection()`
2. Implementa FIX-A1 (pattern passivi)
3. Implementa FIX-A2 (disambiguazione place/move)
4. Leggi `nanobot/nanobot.yml` — sezione tag azioni
5. Implementa FIX-A3 (armonizzazione INTENT)
6. `npm run build` — DEVE essere 0 errori
7. Commit nanobot + push Render
8. Deploy frontend Vercel (se toccato)
9. Test rapido R8 + R13 con curl sul nanobot live
10. Aggiorna QUALITY-AUDIT.md con sezione S74

---

## FASE B — TEST iPAD REALE GUIDATO

### Pre-requisiti

- iPad con Safari
- Apple Pencil (USB-C o Lightning)
- URL: https://www.elabtutor.school
- Account login (studente o insegnante)

### Checklist Test Completa (30 punti)

Apri https://www.elabtutor.school su iPad Safari, login, vai al simulatore con un esperimento qualsiasi del Volume 1 (es. 1.1 LED).

#### A. Touch Base (S72 bugfix verification — 6 test)

| # | Test | Come | Atteso | S72 Fix | Risultato |
|---|------|------|--------|---------|-----------|
| A1 | Pan 1 dito | Tocca sfondo e trascina | Canvas si muove fluido | - | |
| A2 | Pinch zoom 2 dita | Pizzica con 2 dita | Zoom fluido | - | |
| A3 | Palm rejection | Appoggia palmo | Nessuna azione | - | |
| A4 | Drag componente | Trascina un LED | Si aggancia a foro valido | P0-DRAG-1 | |
| A5 | Snap precision | Trascina verso fori diversi | Si aggancia a raggio 30px | P0-SNAP-1 | |
| A6 | Deselect su pan | Pan e rilascia su sfondo | NON deseleziona se pan > 5px | P2-DESELECT-1 | |

#### B. Layout iPad (S72 bugfix verification — 3 test)

| # | Test | Come | Atteso | S72 Fix | Risultato |
|---|------|------|--------|---------|-----------|
| B1 | ViewBox auto-fit | Ricarica pagina | Circuito centrato e visibile | P0-LAYOUT-1 | |
| B2 | Zoom buttons | Entra in Passo Passo | Bottoni +/- NON coperti | P0-LAYOUT-2 | |
| B3 | Panel overflow | Apri lista esperimenti | Lista NON esce dal viewport | P0-LAYOUT-3 | |

#### C. Context Menu e ControlBar (S72 verification — 5 test)

| # | Test | Come | Atteso | S72 Fix | Risultato |
|---|------|------|--------|---------|-----------|
| C1 | Long-press componente | Tieni premuto 500ms su LED | Menu appare (Elimina/Ruota/Prop) | - | |
| C2 | Long-press potenziometro | Tieni premuto 500ms su pot | Menu appare (rotazione differita) | P1-CTXMENU-1 | |
| C3 | ControlBar pulse | Seleziona un componente | Toolbar si illumina brevemente | P1-CONTROLBAR-1 | |
| C4 | ControlBar buttons | Seleziona e guarda toolbar | Elimina/Ruota/Prop visibili, >= 44px | - | |
| C5 | Dismissal | Tocca fuori dal menu | Menu si chiude | - | |

#### D. Pin Tooltips (S72 verification — 2 test)

| # | Test | Come | Atteso | S72 Fix | Risultato |
|---|------|------|--------|---------|-----------|
| D1 | Tooltip touch | Tocca vicino a un pin | Tooltip appare con nome pin | P1-TOOLTIP-1 | |
| D2 | Auto-dismiss | Aspetta dopo tooltip | Scompare dopo ~2 secondi | P1-TOOLTIP-1 | |

#### E. Apple Pencil (S72 verification — 3 test)

| # | Test | Come | Atteso | S72 Fix | Risultato |
|---|------|------|--------|---------|-----------|
| E1 | Disegno Canvas tab | Vai su Canvas, disegna con Pencil | Tratto appare | - | |
| E2 | Pressione variabile | Premi piu' forte / piu' leggero | Tratto piu' spesso / sottile | P1-PENCIL-1 | |
| E3 | Dito vs Pencil | Disegna con dito | Tratto uniforme (no pressure) | - | |

#### F. Warning e Feedback (S72 verification — 1 test)

| # | Test | Come | Atteso | S72 Fix | Risultato |
|---|------|------|--------|---------|-----------|
| F1 | Warning stabilita' | Simula con resistore sbagliato | Warning appare SENZA sfarfallio | P2-FLICKER-1 | |

#### G. Galileo AI Tutor (S73 verification — 10 test)

| # | Test | Come | Atteso | S73 Fix | Risultato |
|---|------|------|--------|---------|-----------|
| G1 | "Avvia la simulazione" | Scrivi nella chat | Simulazione parte | FIX-7 | |
| G2 | "Aggiungi un LED" | Scrivi nella chat | LED appare sul canvas | FIX-2+3 | |
| G3 | "Costruisci un circuito con LED e resistore" | Scrivi nella chat | Almeno 1 INTENT generato | FIX-2 | |
| G4 | "Cos'e' un resistore?" | Scrivi nella chat | Spiegazione semplice, nessun tag azione | FIX-1 | |
| G5 | "Ho bisogno di un pulsante" | Scrivi nella chat | Pulsante aggiunto (dopo FIX-A1) | FIX-A1 | |
| G6 | "Compila il codice" | Scrivi nella chat | Compilazione avviata | FIX-7 | |
| G7 | "Apri il manuale" | Scrivi nella chat | Tab manuale si apre | FIX-7 | |
| G8 | "Evidenzia il LED" | Scrivi nella chat | LED evidenziato | FIX-7 | |
| G9 | Camera Galileo | Tocca icona camera nella chat | Screenshot catturato e analizzato | S62 | |
| G10 | "Guarda il circuito e dimmi cosa manca" | Scrivi nella chat (su Simulator tab) | Screenshot auto + analisi visiva | FIX-5 | |

---

## SCORE CARD ATTESO POST-S74

| Area | Pre-S74 (S73) | Target S74 | Note |
|------|---------------|------------|------|
| iPad Touch | 9.5/10 | 9.5/10 | Conferma S72 bugfix su device reale |
| iPad Interaction | 9.3/10 | 9.3/10 | Conferma tooltip, ctx menu, controlbar |
| Apple Pencil | 9.1/10 | 9.2-9.5/10 | Validazione USB-C pressure heuristic |
| Galileo Action | 9.8/10 (R1-R30) | 9.9/10 | FIX-A1 (passivi) + FIX-A2 (place/move) |
| Galileo Context | 9.5/10 | 9.5/10 | S73 FIX-6 context enrichment confermato |
| Code Quality | 9.8/10 | 9.8/10 | Build 0 errori, 0 regressioni |

---

## REMAINING ISSUES (da S72/S73, fuori scope S74)

### P2 (Sprint 2)
- P2-RES-9: SVG canvas non keyboard-navigable, 21 SVG components lack aria/role/title
- P2-RES-10: No skip-to-content link
- P2-RES-11: No focus-visible custom
- P2-WIR-2: CollisionDetector useMemo ridondante
- P2-TOUCH-TUTOR: CircuitReview.jsx 2 interactive elements at 36px

### Sprint 2 (non iniziato)
- Task 7: CircuitComparator (utility frontend)
- Task 8: ExperimentGuide progress tracking
- Task 9: Galileo Coach proattivo (hook 30s)
- Task 10: Canvas target highlighting (cerchi SVG)
- Task 11: Deploy finale + validazione

---

## PROCEDURA COMPLETA

```
FASE A (20-30 min):
1. Leggi invarianti + audit
2. Implementa FIX-A1, FIX-A2, FIX-A3
3. Build + deploy
4. Test curl R8 + R13

FASE B (30-45 min — con utente su iPad):
1. Utente apre iPad Safari → https://www.elabtutor.school
2. Login
3. Apri esperimento 1.1 LED
4. Segui checklist A→G punto per punto
5. Utente riporta risultati (PASS/FAIL/NOTE)
6. Claude aggiorna QUALITY-AUDIT.md con risultati
7. Se FAIL → fix immediato + re-deploy + ri-test punto specifico
```

---

*Prompt S74 — 2026-03-05 — Galileo Improvement + iPad Real-Device Test*
