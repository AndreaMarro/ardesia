# Principio Zero: "Apre e insegna in 30 secondi" — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Quando la Prof.ssa Rossi apre ELAB, UNLIM sa chi è, dove erano rimasti, e propone la lezione. Zero scelte. Zero confusione. In 30 secondi sta insegnando.

**Architecture:** Approccio B — UnlimWrapper prende il controllo del welcome. Il messaggio hardcoded in ElabTutorV4.jsx viene sostituito da un welcome generato da classProfile.js. L'esperimento suggerito viene caricato automaticamente. Il LessonPathPanel si apre come pannello principale.

**Tech Stack:** React 19, classProfile.js (già implementato), UnlimWrapper.jsx, ElabTutorV4.jsx, LessonPathPanel.jsx, window.__ELAB_API

**Vincoli INVIOLABILI:**
- ZERO REGRESSIONI — `npm run build` deve passare dopo ogni task
- 911/911 test devono passare
- Nessun file `engine/` (CircuitSolver, AVRBridge) viene toccato
- Il simulatore deve continuare a funzionare esattamente come prima
- Linguaggio 10-14 anni in ogni testo visibile

**Principio Zero (test mentale per OGNI modifica):**
La Prof.ssa Rossi, 52 anni, zero esperienza, 25 ragazzi che la guardano dalla LIM.
Se il tuo codice non supera questo scenario → NON COMMITTARE.

---

## Task 1: Welcome dinamico in ElabTutorV4 (sostituire hardcoded)

**Files:**
- Modify: `src/components/tutor/ElabTutorV4.jsx:95-109`
- Read: `src/services/classProfile.js` (getWelcomeMessage, getNextLessonSuggestion)

**Step 1: Leggere il welcome attuale**

Il messaggio in `ElabTutorV4.jsx:95-109` è:
```
"Ciao, sono UNLIM... Da dove vuoi partire? Manuale / Simulatore / Immagine / Circuit Detective"
```
Questo VIOLA il Principio Zero perché chiede all'insegnante di scegliere.

**Step 2: Sostituire con welcome dinamico da classProfile**

Cambiare il `useState` iniziale dei messaggi. Il nuovo welcome deve:
- Prima volta: "Ciao! Sono UNLIM. Pronti per il primo esperimento? Accendiamo un LED!"
- Ritorno: "Bentornati! L'ultima volta: [titolo]. Oggi: [prossimo titolo]."
- Senza `nextSuggested`: "Bentornati! Pronti a continuare?"

```jsx
// In ElabTutorV4.jsx, sostituire il useState hardcoded:
import { buildClassProfile, getNextLessonSuggestion } from '../../services/classProfile';

// Dentro il componente, PRIMA del useState dei messages:
const profile = buildClassProfile();
const suggestion = getNextLessonSuggestion();

let welcomeText;
if (profile.isFirstTime) {
  welcomeText = `**Ciao! Sono UNLIM** 🤖

Oggi accendiamo il primo LED insieme!
Premi **▶ Inizia** per partire — ti guido io passo passo.`;
} else if (suggestion) {
  welcomeText = `**Bentornati!** 🎉

L'ultima volta avete fatto *"${profile.lastExperimentTitle}"*.
Oggi: **${suggestion.title}** — premi **▶ Inizia** per partire!`;
} else {
  welcomeText = `**Bentornati!** 🎉

Pronti a continuare? Scegliete un esperimento o chiedetemi qualcosa!`;
}

const [messages, setMessages] = useState([{
  id: 'welcome',
  role: 'assistant',
  content: welcomeText,
}]);
```

**Step 3: Verificare**

Run: `npm run build`
Expected: PASS

Run: `npx vitest run`
Expected: 911/911 PASS

**Step 4: Commit**

```bash
git add src/components/tutor/ElabTutorV4.jsx
git commit -m "feat: dynamic welcome based on class profile (Principio Zero)"
```

---

## Task 2: Auto-load esperimento suggerito

**Files:**
- Modify: `src/components/unlim/UnlimWrapper.jsx:331-361`
- Read: `src/services/simulator-api.js:104` (loadExperiment)

**Step 1: Capire il flusso attuale**

UnlimWrapper.jsx riga 331-361:
- Se non c'è esperimento caricato → mostra welcome → poi suggerisce il prossimo
- Ma NON carica l'esperimento automaticamente — mostra solo un messaggio

**Step 2: Aggiungere auto-load dopo il suggerimento**

Dopo il messaggio di suggerimento (riga 348-357), caricare l'esperimento:

```jsx
// Dentro l'useEffect del welcome, dopo showMessage del suggestion:
// Auto-load l'esperimento suggerito SOLO se è la prima volta
// (per il ritorno, il docente potrebbe voler rivedere quello precedente)
if (suggestion && profile.isFirstTime) {
  // Carica dopo che il messaggio di suggerimento è visibile (2s)
  const loadTimer = setTimeout(() => {
    if (window.__ELAB_API?.loadExperiment) {
      window.__ELAB_API.loadExperiment(suggestion.experimentId);
    }
  }, WELCOME_DURATION + 3000);
  // Cleanup: clearTimeout(loadTimer) nel return
}
```

Per i ritorni: mostrare un bottone "▶ Inizia lezione" nell'overlay di suggerimento
invece di caricare automaticamente (il docente decide).

**Step 3: Verificare**

Run: `npm run build`
Expected: PASS

Test manuale: aprire il sito in incognito (prima volta) → dopo ~12s l'esperimento v1-cap6-esp1 si carica automaticamente.

**Step 4: Commit**

```bash
git add src/components/unlim/UnlimWrapper.jsx
git commit -m "feat: auto-load first experiment for new users"
```

---

## Task 3: LessonPathPanel come pannello default

**Files:**
- Modify: `src/components/tutor/ElabTutorV4.jsx` (stato tab iniziale)
- Read: `src/components/simulator/panels/LessonPathPanel.jsx`

**Step 1: Capire lo stato attuale**

ElabTutorV4 ha un sistema di tab (simulatore, manuale, video, lavagna, etc.).
Quando si carica un esperimento, il LessonPathPanel appare.
Ma di default non c'è — il docente vede il simulatore vuoto.

**Step 2: Se c'è un esperimento (auto-loaded o manuale), aprire il LessonPathPanel**

Trovare dove il LessonPathPanel viene renderizzato condizionalmente.
Assicurarsi che sia APERTO di default quando un esperimento è attivo.
Il percorso lezione DEVE essere la prima cosa che il docente vede — non il codice,
non i blocchi, non la chat.

```jsx
// Il LessonPathPanel deve essere visibile di default quando c'è un esperimento.
// Se il docente lo chiude, resta chiuso (localStorage preference).
// Ma al primo caricamento di un esperimento → è APERTO.
```

**Step 3: Verificare**

Run: `npm run build`
Expected: PASS

Test: caricare un esperimento → il LessonPathPanel è visibile automaticamente.

**Step 4: Commit**

```bash
git add src/components/tutor/ElabTutorV4.jsx
git commit -m "feat: LessonPathPanel open by default when experiment loaded"
```

---

## Task 4: Nascondere complessità fino a richiesta

**Files:**
- Modify: `src/components/tutor/ElabTutorV4.jsx` (toolbar/tab visibility)

**Step 1: Identificare gli elementi che intimidiscono**

Dalla PRODUCT-VISION.md:
- Editor codice → visibile solo per Vol3 o se il docente lo chiede
- Scratch/Blockly → visibile solo se il docente lo chiede
- Serial Monitor → visibile solo durante simulazione Arduino
- Circuit Detective, Prevedi e Spiega → visibili solo dopo N lezioni

**Step 2: Implementare progressive disclosure basata sul volume**

```jsx
// disclosureLevel basato su:
// - Vol1 (cap 1-13): LIVELLO 1 — solo breadboard, lesson path, UNLIM
// - Vol2 (cap 1-10): LIVELLO 1 — stessa cosa
// - Vol3 (cap 1-8): LIVELLO 2 — + editor codice, Scratch
// Il docente può sempre chiedere a UNLIM "mostrami il codice" per forzare

const disclosureLevel = useMemo(() => {
  if (!activeExperiment?.id) return 1;
  return activeExperiment.id.startsWith('v3-') ? 2 : 1;
}, [activeExperiment?.id]);
```

**Step 3: Applicare il disclosure ai tab/toolbar**

I tab come "Codice", "Blocchi", "Serial" vengono renderizzati con:
```jsx
{disclosureLevel >= 2 && <TabCodice ... />}
```

**Step 4: Verificare**

Run: `npm run build && npx vitest run`
Expected: PASS / 911/911

Test: Vol1 esp → no editor codice visibile. Vol3 esp → editor visibile.

**Step 5: Commit**

```bash
git add src/components/tutor/ElabTutorV4.jsx
git commit -m "feat: progressive disclosure - hide code/scratch for Vol1-Vol2"
```

---

## Task 5: Test end-to-end del flusso "30 secondi"

**Files:**
- Nessun file da modificare — solo verifica

**Step 1: Test Prima Volta (incognito)**

1. Aprire elabtutor.school in incognito (o #prova)
2. Verificare: UNLIM dice "Ciao! Oggi accendiamo il primo LED!"
3. Verificare: dopo ~12s, v1-cap6-esp1 si carica
4. Verificare: LessonPathPanel è aperto con i 5 step
5. Verificare: non c'è editor codice, non c'è Scratch, non c'è Serial

**Step 2: Test Ritorno (con sessione salvata)**

1. Completare qualche interazione nel test precedente
2. Chiudere e riaprire
3. Verificare: UNLIM dice "Bentornati! L'ultima volta: Accendi il LED"
4. Verificare: suggerisce il prossimo esperimento

**Step 3: Test LIM (1024x768)**

1. Ridimensionare il browser a 1024x768
2. Verificare: tutto leggibile (font ≥16px)
3. Verificare: touch targets ≥44px
4. Verificare: nessun overflow

**Step 4: Documentare risultati**

Salvare in `automa/reports/G18-PRINCIPIO-ZERO-TEST.md` con screenshot e risultati.

---

## Sequenza Sessioni Suggerita

### G18 (questa sessione o prossima)
- **Task 1**: Welcome dinamico (30 min)
- **Task 2**: Auto-load esperimento (30 min)
- Commit + build + test

### G19
- **Task 3**: LessonPathPanel default (1h)
- **Task 4**: Progressive disclosure (1h)
- Commit + build + test

### G20
- **Task 5**: Test end-to-end (1h)
- Fix qualsiasi regressione trovata
- Deploy su Vercel

### G21-G24 (automa in parallelo)
- Completare 5 lesson paths mancanti (67/67)
- Vol2 language simplification (18 file)
- Teacher prep expansion
- Console cleanup + dead code

---

## Metriche di Successo

| Metrica | Prima | Dopo | Verifica |
|---------|-------|------|----------|
| Tempo a prima azione docente | >60s (scelta tra 4 opzioni) | <15s (auto-load) | Cronometro |
| Scelte richieste al docente | 4 (Manuale/Sim/Img/Detective) | 0 (UNLIM propone) | Conteggio |
| LessonPath visibile di default | NO (nascosto) | SI (aperto) | Visuale |
| Editor codice in Vol1 | SI (intimidisce) | NO (nascosto) | Visuale |
| Test 911/911 | PASS | PASS | `npx vitest run` |
| Build | PASS | PASS | `npm run build` |
