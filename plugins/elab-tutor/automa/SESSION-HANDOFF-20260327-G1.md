# HANDOFF — Giorno 1 UNLIM Mode (27/03/2026)

---

## COSA È STATO FATTO (con evidenza verificata)

### 1. Template percorso lezione PERFETTO — v1-cap6-esp1
- **File**: `src/data/lesson-paths/v1-cap6-esp1.json` (170 righe)
- **Contenuto**: 5 fasi (PREPARA→MOSTRA→CHIEDI→OSSERVA→CONCLUDI) con:
  - `teacher_message` — cosa dire ai ragazzi
  - `teacher_tip` — consiglio pedagogico per il docente
  - `provocative_question` — domanda che fa pensare
  - `common_mistakes` con risposte specifiche (3 errori comuni)
  - `analogies` evidence-based (Shipstone 1985, Osborne & Freyberg 1985)
  - `action_tags` per automazione simulatore ([AZIONE:loadexp], [AZIONE:play], [AZIONE:highlight])
  - `build_circuit` con intent JSON completo (componenti + wires)
  - `vocabulary` allowed/forbidden verificato contro curriculum YAML
  - `session_save` con `resume_message` per continuità tra sessioni
  - `next_experiment` con preview
- **Indice**: `src/data/lesson-paths/index.js` — API: `getLessonPath(id)`, `hasLessonPath(id)`, `PHASE_NAMES`
- **Template flag**: `_meta.template: true` — l'automa lo usa come modello per i 66 restanti

### 2. Scheletro 5 componenti React UNLIM Mode
- `src/components/unlim/UnlimWrapper.jsx` — wrapper che gestisce UNLIM/Classic mode, auto-rileva esperimento via `experimentChange` event
- `src/components/unlim/UnlimMascot.jsx` — mascotte nell'angolo (stati idle/active/speaking, CSS glow pulsante)
- `src/components/unlim/UnlimOverlay.jsx` — messaggi contestuali con fade in/out, coda messaggi, posizioni multiple, tipi (info/success/hint/question)
- `src/components/unlim/UnlimInputBar.jsx` — barra input testo + mic + invio, design minimale
- `src/components/unlim/UnlimModeSwitch.jsx` — toggle con persist localStorage, hook `useUnlimMode()`

### 3. Integrazione in App.jsx
- `UnlimWrapper` wrappa `ElabTutorV4` in App.jsx (riga ~223)
- Zero modifiche a ElabTutorV4 — integrazione completamente non-invasiva
- Auto-rilevamento esperimento via evento `experimentChange` di `__ELAB_API`
- Lo switch mostra automaticamente il messaggio `class_hook` dal percorso lezione quando disponibile

### 4. Deploy
- Build: PASSA (25.26s)
- Git: committato e pushato (b3d7a10)
- Vercel: deployato in produzione (READY)
- Sito: HTTP 200 su https://www.elabtutor.school

---

## STATO VERIFICATO

| Elemento | Stato | Evidenza |
|----------|-------|----------|
| Build | ✅ PASSA | npm run build exit 0, 25.26s |
| Git | ✅ Pushato | b3d7a10 on main |
| Deploy Vercel | ✅ Produzione | HTTP 200 |
| Template lezione | ✅ Creato | 170 righe JSON, vocabolario verificato |
| Componenti UNLIM | ✅ 5/5 creati | Build passa, nessun errore |
| Switch funzionante | ✅ Integrato | localStorage persist |
| Automa | ❌ MORTO | Non rilanciato in questa sessione |
| Nanobot Render | ⚠️ NON DEPLOYATO | Modifiche solo nel repo |

---

## COSA NON È STATO FATTO

1. **Deploy nanobot su Render** — le modifiche Mistral + brevità + /gdpr-status sono nel repo ma non in produzione
2. **Connessione input bar → Galileo API** — per ora mostra messaggio di conferma, serve wiring a `sendChat()`
3. **Wiring percorso lezione → LessonPathPanel** — il template JSON esiste ma non è connesso al pannello React
4. **L'automa non genera percorsi lezione** — serve rilanciarlo con task specifici
5. **Zero test con Prof.ssa Rossi simulata** — i componenti sono scheletro, servono test visuaili

---

## COSA FARE NELLA PROSSIMA SESSIONE (Giorno 2-3)

### Priorità 1: Connettere input bar → Galileo
- In `UnlimWrapper.handleSend`, usare `sendChat()` dal servizio API esistente
- Mostrare la risposta come overlay (non in chat)
- Gestire isLoading per il mascot state

### Priorità 2: Connettere percorso lezione → LessonPathPanel
- `LessonPathPanel.jsx` (668 LOC) deve leggere da `getLessonPath(experimentId)`
- Renderizzare i 5 step con il contenuto dal JSON
- Progress bar: ● PREPARA ○ MOSTRA ○ CHIEDI ○ OSSERVA ○ CONCLUDI

### Priorità 3: "Monta il circuito per me"
- Il template ha `build_circuit.intent` con componenti e wires
- Serve connettere al sistema `[INTENT:JSON]` già esistente

### Priorità 4: Deploy nanobot su Render
- `cd nanobot && git push render main` (se configurato)
- Verificare /health, /gdpr-status, brevità risposte

### Priorità 5: L'automa genera percorsi lezione
- Creare task YAML per l'automa
- Template: copiare struttura v1-cap6-esp1.json per ogni esperimento
- Target: 10 percorsi Volume 1 al giorno

---

## FILE CREATI/MODIFICATI

### Nuovi (8 file, 817 righe)
- `src/components/unlim/UnlimWrapper.jsx`
- `src/components/unlim/UnlimMascot.jsx`
- `src/components/unlim/UnlimOverlay.jsx`
- `src/components/unlim/UnlimInputBar.jsx`
- `src/components/unlim/UnlimModeSwitch.jsx`
- `src/data/lesson-paths/v1-cap6-esp1.json`
- `src/data/lesson-paths/index.js`

### Modificati (1 file)
- `src/App.jsx` — aggiunto import UnlimWrapper + wrapping ElabTutorV4

### NON modificati (come da regola)
- `CircuitSolver.js`, `AVRBridge.js`, `evaluate.py`, `checks.py` — intatti
- `ElabTutorV4.jsx` — ZERO modifiche (integrazione completamente esterna)
