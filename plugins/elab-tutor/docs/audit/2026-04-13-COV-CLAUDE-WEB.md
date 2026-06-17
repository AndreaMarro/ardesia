# COV Audit — Claude Web Branch `claude/deploy-rag-edge-functions-tVhNm`

**Data:** 2026-04-13
**Auditor:** Claude Code (Opus 4.6)
**Metodo:** Chain of Verification — lettura diretta dei file sorgente su main post-merge

---

## 1. UNLIM memoria persistente (useGalileoChat.js)

**FAIL**

La chiave `elab-unlim-chat-history-v1` non esiste da nessuna parte nel codebase (grep zero risultati).
Il hook `useGalileoChat` inizializza i messaggi con un singolo welcome message statico:

```js
// riga 349
const [messages, setMessages] = useState([WELCOME_MSG]);
```

Non c'e' nessun `localStorage.getItem` ne' `localStorage.setItem` per la chat history.
Non c'e' nessun cap sui messaggi salvati.
**I messaggi vengono persi al refresh della pagina.**

---

## 2. Tasto Play Arduino (MinimalControlBar.jsx)

**PASS**

Il bottone Play e' visibile e funzionante. Riga 222-229:

```jsx
<button
  className="minimal-toolbar__btn minimal-toolbar__btn--play"
  onClick={onPlay}
  title="Avvia simulazione (Spazio)"
  aria-label="Avvia"
>
  <PlayIcon />
</button>
```

Il handler `onPlay` e' passato come prop dal parent (`NewElabSimulator.jsx`).
Il bottone e' condizionato a `isArduinoExperiment` (riga 211), corretto.
Nota: il collegamento a `window.__ELAB_API.play()` non e' in MinimalControlBar direttamente ma nel parent che passa `onPlay`. Funziona.

---

## 3. Fumetto generabile (MinimalControlBar.jsx)

**FAIL**

`onOpenFumetto` non e' presente in MinimalControlBar.jsx (grep zero risultati).
Il prop `onGenerateReport` e' nel menu overflow alla riga 366:

```js
if (onGenerateReport) items.push({ label: isGeneratingReport ? 'Generazione...' : 'Report PDF', action: onGenerateReport, disabled: isGeneratingReport });
```

Ma questo e' il Report PDF generico, NON il fumetto.
Il fumetto (`onOpenFumetto`) esiste solo in `ControlBar.jsx` (riga 307, 533) e in `NewElabSimulator.jsx` (riga 810), ma non e' stato portato in MinimalControlBar.
**Il bottone fumetto non e' accessibile dalla toolbar minimale.**

---

## 4. Passo Passo allargabile (BuildModeGuide.jsx)

**FAIL**

Non esiste nessun toggle S/M/L in BuildModeGuide.jsx.
L'unico toggle presente e' expand/collapse binario (riga 31):

```js
const [expanded, setExpanded] = useState(true);
```

Che mostra/nasconde l'intero pannello. Non c'e' nessun concetto di dimensione S/M/L, nessun `panelSize`, nessun resize.
Le dimensioni sono fisse nel CSS (`overlays.module.css` con `guideRoot`).

---

## 5. Lavagna persiste su uscita (LavagnaShell.jsx)

**FAIL**

LavagnaShell persiste in localStorage:
- `elab-lavagna-left-panel` (dimensione pannello sinistro)
- `elab-lavagna-bottom-panel` (dimensione pannello inferiore)
- `elab-lavagna-buildmode` (modalita' montaggio)
- `elab-lavagna-volume` (numero volume aperto)
- `elab-lavagna-page` (pagina volume)

Ma **NON** persiste l'esperimento attivo. `currentExperiment` e' inizializzato a `null` (riga 344):

```js
const [currentExperiment, setCurrentExperiment] = useState(null);
```

Non c'e' nessun `localStorage.getItem('elab-lavagna-exp...')` ne' salvataggio dell'esperimento.
Al refresh si perde l'esperimento e si torna al picker.

---

## 6. UNLIM fallback chain (api.js)

**PASS**

La catena di fallback e' presente e corretta (righe 610-800):

```
0. tryLocalServer (Ollama offline)
1. tryNanobot (Supabase Edge / Gemini)     -- riga 614-618
2. backend webhook (CHAT_WEBHOOK / n8n)    -- riga 620-757
3. local RAG (LOCAL_API /api/search)       -- riga 760-781
4. knowledge base locale (offline curato)  -- riga 784-802
```

La catena copre: Edge (Supabase) -> webhook (n8n) -> RAG locale -> knowledge base.
Non c'e' un fallback esplicito "Render" come entita' separata, ma `NANOBOT_URL` punta a Supabase Edge in produzione e potrebbe puntare a Render via `VITE_NANOBOT_URL` env var (riga 20). La chain e' funzionale.

---

## 7. iPad touch 44px

**PASS**

File `src/styles/accessibility-fixes.css` contiene regole esplicite:

- Riga 42-48: `.btn-icon, .control-btn, .toolbar-btn, .step-nav-btn` con `min-width: 44px !important; min-height: 44px !important`
- Riga 51-58: `.component-chip, .draggable-chip, .sandbox-component` con `min-width: 56px !important; min-height: 56px !important`
- Riga 246-258: Media query iPad `@media (min-width: 768px) and (max-width: 1023px)` con target 48-60px
- Riga 231-243: Mobile `@media (max-width: 767px)` con target 48px

Anche in molteplici CSS module (lavagna, tutor, unlim) ci sono regole `min-height: 44px` coerenti.
**I touch target rispettano il minimo 44px richiesto.**

---

## 8. System prompt nuove azioni (system-prompt.ts)

**PASS**

Il file `supabase/functions/_shared/system-prompt.ts` contiene il set completo di tag AZIONE (righe 33-50):

- play, pause, reset, highlight, loadexp, addcomponent, removecomponent, addwire
- compile, undo, redo, clearall, interact, setvalue, screenshot, describe, video

Include anche:
- Catene multi-step (riga 53-54)
- Interpretazione linguaggio naturale (righe 66-69)
- Analisi circuito (righe 72-76)
- Conoscenza dai volumi (righe 78-80)
- Contesto studente dinamico (righe 92-100)
- Stato circuito iniettato (righe 103-109)

**Il system prompt e' completo e copre tutte le azioni del simulatore.**

---

## Riepilogo

| # | Fix | Risultato | Note |
|---|-----|-----------|------|
| 1 | UNLIM memoria persistente | **FAIL** | Nessun localStorage per chat history, zero codice di persistenza |
| 2 | Tasto Play Arduino | **PASS** | Bottone visibile, handler collegato correttamente |
| 3 | Fumetto generabile | **FAIL** | onOpenFumetto non presente in MinimalControlBar, solo Report PDF generico |
| 4 | Passo Passo allargabile | **FAIL** | Nessun toggle S/M/L, solo expand/collapse binario |
| 5 | Lavagna persiste esperimento | **FAIL** | Layout persistito, ma esperimento attivo NO |
| 6 | UNLIM fallback chain | **PASS** | Chain a 4 livelli: Edge -> webhook -> RAG -> knowledge base |
| 7 | iPad touch 44px | **PASS** | Regole CSS complete, media query iPad dedicata |
| 8 | System prompt azioni | **PASS** | 17 tag AZIONE + catene + linguaggio naturale |

**Score: 4/8 PASS (50%)**

4 fix mancanti (1, 3, 4, 5) richiedono intervento nella prossima sessione.
