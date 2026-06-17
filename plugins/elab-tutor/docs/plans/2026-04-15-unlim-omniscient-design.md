# UNLIM Onnisciente e Onnipotente — Design Document
## 15 Aprile 2026 — Andrea Marro / Claude Code

---

## Problema

UNLIM dichiara 37 comandi AZIONE nel system prompt ma ne implementa solo 12.
Il contesto raccoglie 12+ campi ma il backend probabilmente li ignora.
Il RAG ha 549 chunk generici, non legati a pagine specifiche del libro.
Risultato: lo studente dice "costruisci un semaforo" e UNLIM risponde a parole ma non esegue.

## Strategia: Ibrido Frontend-Heavy

L'intelligenza sta nel **frontend** (contesto ricco, esecuzione azioni) e il **backend** (Gemini/Supabase) riceve un prompt gia' perfetto. Zero dipendenza da modifiche backend.

---

## 3 Interventi

### 1. Completare TUTTI i 37 comandi AZIONE (useGalileoChat.js)

Comandi dichiarati nel system prompt ma NON implementati:

| Comando | Mappa a __ELAB_API | Priorita |
|---------|-------------------|----------|
| movecomponent:ID:X:Y | moveComponent(id, {x,y}) | P1 |
| removewire:INDEX | removeWire(index) | P1 |
| measure:ID | measureComponent(id) | P2 |
| diagnose | diagnoseCircuit() | P1 |
| openeditor | openEditor() | P1 |
| closeeditor | closeEditor() | P1 |
| switcheditor:MODE | setEditorMode(mode) | P1 |
| compile | compile() | GIA OK |
| setcode:CODE | setEditorCode(code) | P1 |
| appendcode:CODE | appendEditorCode(code) | P2 |
| getcode | getEditorCode() | P2 |
| resetcode | resetEditorCode() | P2 |
| loadblocks:XML | loadScratchBlocks(xml) | P2 |
| fullscreenscratch | setScratchFullscreen(true) | P3 |
| exitscratchfullscreen | setScratchFullscreen(false) | P3 |
| opentab:TAB | openTab(tab) | P1 |
| openvolume:VOL:PAG | openVolume(vol, page) | P1 |
| openchat | openChat() | P3 |
| closechat | closeChat() | P3 |
| setbuildmode:MODE | setBuildMode(mode) | P1 |
| nextstep | nextBuildStep() | P1 |
| prevstep | prevBuildStep() | P1 |
| showbom | showBillOfMaterials() | P2 |
| listcomponents | listComponents() → inject in response | P1 |
| getstate | getCircuitState() → inject in response | P1 |
| showserial | showSerialMonitor() | P2 |
| serialwrite:TEXT | serialWrite(text) | P2 |
| highlightpin:PINS | highlightPin(pins) | P1 |
| quiz:EXP_ID | openQuiz(expId) | P2 |
| youtube:QUERY | openYouTube(query) | P2 |
| createnotebook:TITLE | createNotebook(title) | P3 |

**Implementazione**: Estendere `executeActionTags()` con switch/case per ogni comando mancante.
Per comandi che richiedono output (listcomponents, getcode, getstate): eseguire e appendere il risultato come messaggio assistant.

### 2. Arricchire il contesto inviato al backend

**Problema attuale**: `sendChat()` inietta `experimentContext` (dal buildTutorContext) + 2 chunk RAG. Ma:
- Non include il testo del libro (volume-references.js e' vuoto)
- Non include la storia completa dello studente
- Non formatta il contesto in modo strutturato per Gemini

**Soluzione**: Creare `buildEnrichedPrompt()` che produce un prompt strutturato:

```
[CHI SEI]
Sei UNLIM, tutor AI di ELAB. Poteri reali sul simulatore.

[REGOLE]
Max 60 parole. Usa tag [AZIONE:...]. Cita il libro quando pertinente.

[ESPERIMENTO ATTIVO]
{id}: "{title}" — Volume {vol}, Capitolo {cap}, Pagina {page}
Contesto dal libro: "{bookText}"
Istruzioni dal libro: {bookInstructions}
Questo e' l'esperimento {N} di {M} del capitolo. Prima: {prev}. Dopo: {next}.

[STATO CIRCUITO]
Componenti: {lista}
Connessioni: {lista}
Simulazione: {running/paused}
LED accesi: {lista}
Errori: {lista}

[CODICE ARDUINO]
{codice troncato a 1000 char}
Compilazione: {success/error: messaggio}

[PASSO PASSO]
Step {current}/{total} — Fase: {phase}
Tempo trascorso: {elapsed}s

[STORIA STUDENTE]
Esperimenti completati: {N}
Tentativi su questo: {attempts}
Hint usati: {hints}
Errori recenti: {lista}
Concetti gia noti: {prereqs con analogie}
Concetti nuovi oggi: {newConcepts con analogie}

[CONTESTO RAG — dai volumi ELAB]
{top 3 chunk pertinenti con fonte e pagina}

Messaggio studente:
{message}
```

### 3. Validare l'esecuzione delle azioni con feedback

**Problema**: UNLIM emette [AZIONE:play] ma lo studente non sa se e' stata eseguita.

**Soluzione**: Dopo `executeActionTags()`, appendere un badge discreto al messaggio:
- "Eseguito: avvio simulazione, evidenzio LED" (verde)
- "Non riuscito: movecomponent non disponibile" (arancione)

---

## File da modificare

1. **`src/components/lavagna/useGalileoChat.js`** — executeActionTags() + feedback
2. **`src/services/api.js`** — buildEnrichedPrompt() sostituisce buildChatMessage()
3. **`src/services/unlimContextCollector.js`** — aggiungere collectVolumeContext()
4. **`src/data/volume-references.js`** — popolato (stub → dati reali) [sessione separata]

## File da NON modificare
- CircuitSolver.js, AVRBridge.js, SimulatorCanvas.jsx (engine core)
- vite.config.js, package.json

## Rischi
- Prompt troppo lungo → Gemini potrebbe tagliare. Mitigazione: cap a 2000 char per sezione.
- Comandi AZIONE che non trovano l'API method → fallback silenzioso con log.
- Regressione test → vitest run prima e dopo ogni modifica.

## Metriche di successo
- 37/37 comandi AZIONE implementati (oggi: 12/37)
- Contesto strutturato in ogni sendChat (oggi: parziale)
- Zero regressioni test (8190 PASS)
- Build PASS

---

*Design approvato da Andrea (istruzione: "PORTALO A LIVELLI PROFESSIONALI")*
*Documento generato da Claude Code — 15/04/2026*
