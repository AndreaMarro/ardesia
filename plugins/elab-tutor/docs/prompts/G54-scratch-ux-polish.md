# G54 — SCRATCH UX POLISH + SAFETY

## Contesto
Fase 4 del piano sanamento: Scratch UX. L'editor Scratch (Blockly) funziona ma ha problemi UX: nessun undo/redo visibile, errori non tradotti (se non fixato in G46), switch mode confuso, step negativo nel for loop.
Piano completo: `docs/prompts/G46-G55-sanamento-completo.md`

## STATO PRE-SESSIONE (da verificare)
- Test PASS count: ___  | Build time: ___s | Bundle: ___KB | Console errors: ___
- Deploy: https://www.elabtutor.school
- 62 esperimenti, 62 lesson paths

## REGOLE INVARIANTI
- ZERO DEMO, ZERO MOCK, ZERO DATI FINTI
- 62 lesson paths INTOCCABILI
- Non toccare engine/ — MAI
- `npm run build` + `npx vitest run` dopo OGNI singolo fix
- Palette: Navy #1E4D8C, Lime #4A7A25, Vol2 #E8941C, Vol3 #E54B3D
- Muted text: #737373 (WCAG AA 4.7:1)
- PATH: `export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | sort -V | tail -1)/bin:$PATH"`
- Budget: €50/mese (Claude escluso). Niente servizi costosi.

## PRE-SESSIONE OBBLIGATORIA
1. Esegui `/elab-quality-gate` pre-session
2. Salva baseline: test count, build time, bundle size, console errors

---

## TASK 1 — Friendly errors in Scratch (30min — verifica se fatto in G46)

### Check
Leggere `src/components/simulator/panels/ScratchCompileBar.jsx`:
- Cerca dove mostra l'errore di compilazione (probabilmente un `<pre>` tag)
- Verifica se importa `friendlyError` da `utils/friendlyError.js`

### Se NON fatto in G46
1. Verifica che `src/components/simulator/utils/friendlyError.js` esista (estratto da CodeEditorCM6)
2. In `ScratchCompileBar.jsx`:
```javascript
import { friendlyError } from '../utils/friendlyError';

// Dove mostra l'errore:
// PRIMA:  <pre>{compileResult.error}</pre>
// DOPO:   <pre>{friendlyError(compileResult.error)}</pre>
```

### Se GIA fatto in G46
- Segna come SKIP e passa al Task 2

### Verifica
- Scratch mode -> crea blocco con errore -> Compila -> errore deve essere in italiano kid-friendly

---

## TASK 2 — Scratch/Text mode switch warning (30min)

### File da leggere PRIMA
- `src/components/simulator/NewElabSimulator.jsx` — cercare dove si cambia `editorMode` tra 'arduino' e 'scratch'

### Problema
Lo studente non capisce che i blocchi Scratch e il codice Arduino sono INDIPENDENTI. Modifica i blocchi, passa a Arduino, e non vede le modifiche.

### Implementazione
Quando lo studente cambia modalita editor:

```javascript
// Ref per mostrare il toast solo UNA VOLTA per sessione
const hasShownModeWarningRef = useRef(false);

function handleEditorModeSwitch(newMode) {
  if (!hasShownModeWarningRef.current && editorMode !== newMode) {
    hasShownModeWarningRef.current = true;
    // Mostrare toast informativo (NON bloccante, NON alert)
    showToast(
      'I blocchi Scratch e il codice Arduino sono indipendenti. Le modifiche in un modo non si vedono nell\'altro.',
      { duration: 5000, type: 'info' }
    );
  }
  setEditorMode(newMode);
}
```

### Note
- Il toast NON deve bloccare il cambio di modo
- Si mostra UNA VOLTA per sessione (useRef, non localStorage — va bene che riappaia al reload)
- Usare il sistema toast esistente nel progetto (cercare come vengono mostrati gli altri toast)

### Verifica
- Aprire esperimento Vol3 in Scratch mode
- Passare a Arduino mode -> toast appare
- Passare di nuovo a Scratch -> toast NON riappare
- Ricaricare pagina -> toast riappare al primo switch (corretto, e per sessione)

---

## TASK 3 — controls_for negative step guard (1h)

### File da leggere PRIMA
- `src/components/simulator/panels/scratchGenerator.js` — cercare `controls_for` o `controls_repeat_ext`

### Problema
Il blocco `for` di Blockly genera codice C++ con confronto `<=` hardcoded. Se lo step e negativo (countdown), il loop non termina mai perche `i <= end` non diventa mai falso quando si conta all'indietro.

### Implementazione
Nel generator `controls_for`:

```javascript
// Trovare dove viene generato il codice for loop
// Tipicamente: for (int i = FROM; i <= TO; i += BY)

// FIX: scegliere l'operatore di confronto in base al segno dello step
const byValue = parseFloat(by) || 1;
const comparison = byValue >= 0 ? '<=' : '>=';

// Generare: for (int i = FROM; i [<=|>=] TO; i += BY)
const code = `for (int ${variable} = ${from}; ${variable} ${comparison} ${to}; ${variable} += ${by}) {\n${branch}\n}\n`;
```

### ATTENZIONE
- Se `by` e una variabile (non un numero letterale), non si puo determinare a compile time
- In quel caso, generare un guard runtime:
```cpp
for (int i = from; (by > 0 ? i <= to : i >= to); i += by) {
```
- Oppure lasciare `<=` e aggiungere un commento nel codice generato

### Verifica
- In Scratch: creare un blocco "conta da 10 a 1 passo -1"
- Guardare il codice generato (pannello Arduino)
- Deve avere `>=` nel confronto, non `<=`
- Compilare -> non deve andare in loop infinito

---

## TASK 4 — Undo/Redo in Scratch (1h)

### File da leggere PRIMA
- `src/components/simulator/panels/ScratchCompileBar.jsx` — la barra sopra l'area Scratch
- Cercare dove viene creato/referenziato il workspace Blockly (probabilmente un ref)

### Problema
Blockly ha undo/redo built-in (`workspace.undo(false)` = undo, `workspace.undo(true)` = redo) ma non ci sono bottoni visibili.

### Implementazione
In `ScratchCompileBar.jsx`, aggiungere due bottoni:

```jsx
// Il workspace Blockly deve essere accessibile (prop o ref)
// Cercare come ScratchCompileBar riceve il workspace

<button
  onClick={() => workspaceRef.current?.undo(false)}
  title="Annulla (Ctrl+Z)"
  aria-label="Annulla ultima azione"
  style={{ minHeight: 44, minWidth: 44 }}  // Touch target WCAG
>
  ↩ Annulla
</button>

<button
  onClick={() => workspaceRef.current?.undo(true)}
  title="Ripeti (Ctrl+Y)"
  aria-label="Ripeti ultima azione annullata"
  style={{ minHeight: 44, minWidth: 44 }}
>
  ↪ Ripeti
</button>
```

### Note
- I bottoni devono essere posizionati nella barra Scratch (accanto a Compila)
- Stile coerente con gli altri bottoni della barra
- Touch target minimo 44x44px
- Ctrl+Z e Ctrl+Y dovrebbero gia funzionare in Blockly — verificare
- Se il workspace non e accessibile da ScratchCompileBar, passarlo come prop

### Verifica
- In Scratch: aggiungere un blocco -> cliccare Annulla -> blocco scompare
- Cliccare Ripeti -> blocco riappare
- Verificare che Ctrl+Z/Y funzionino anche da tastiera

---

## TASK 5 — procedures_defreturn type fix (1h)

### File da leggere PRIMA
- `src/components/simulator/panels/scratchGenerator.js` — cercare `procedures_defreturn`

### Problema
Il generator per funzioni con return hardcoda il tipo a `int`. Se la funzione ritorna una stringa o un booleano, il codice C++ non compila.

### Implementazione
```javascript
// Nel generator procedures_defreturn:

// Determinare il tipo dal blocco di return
function inferReturnType(returnBlock) {
  if (!returnBlock) return 'void';

  const type = returnBlock.type;

  // Blocchi stringa
  if (type === 'text' || type === 'text_join' || type === 'text_charAt') {
    return 'String';
  }
  // Blocchi booleani
  if (type === 'logic_boolean' || type === 'logic_compare' ||
      type === 'logic_operation' || type === 'logic_negate') {
    return 'bool';
  }
  // Blocchi numerici (default)
  if (type === 'math_number' || type === 'math_arithmetic' ||
      type === 'math_random_int' || type.startsWith('math_')) {
    return 'int';
  }
  // Variabili o blocchi sconosciuti: usare int come fallback sicuro
  return 'int';
}

// Applicare:
const returnBlock = block.getInputTargetBlock('RETURN');
const returnType = inferReturnType(returnBlock);
// Generare: returnType funcName(args) { ... return value; }
```

### ATTENZIONE
- `float` vs `int`: se il blocco di return e `math_arithmetic` con divisione, il tipo dovrebbe essere `float`
- Per semplicita, si puo usare `int` per tutti i numeri e `float` solo se si rileva una divisione
- NON usare `auto` — non supportato in Arduino C++ (GCC per AVR non lo supporta pienamente)

### Verifica
- In Scratch: creare una funzione che ritorna un testo -> codice generato deve avere `String`
- Creare funzione che ritorna true/false -> codice deve avere `bool`
- Creare funzione che ritorna un numero -> codice deve avere `int`
- Compilare tutti e 3 i casi -> nessun errore

---

## TASK 6 — Test con esperimento Vol3 (30min)

### Verifica end-to-end
1. Aprire un esperimento Vol3 che ha componenti complessi (servo, LCD, etc.)
2. Passare a Scratch mode
3. Costruire un programma semplice con i blocchi
4. Compilare -> deve funzionare senza errori
5. Creare un errore intenzionale -> deve mostrare errore tradotto (italiano kid-friendly)
6. Usare Undo/Redo -> deve funzionare
7. Creare un loop countdown (10 a 1, step -1) -> deve generare codice corretto
8. Creare una funzione con return -> tipo corretto nel codice generato
9. Passare a Arduino mode -> toast informativo

---

## POST-SESSIONE OBBLIGATORIA
1. `npm run build` — deve passare
2. `npx vitest run` — deve passare (test count >= baseline)
3. `/elab-quality-gate` post-session — confronta con baseline
4. Verifica browser: 0 console errors
5. Aggiorna `docs/prompts/G46-G55-sanamento-completo.md` con progresso reale

## Anti-regressione specifica G54
- [ ] Errori Scratch mostrati in italiano kid-friendly (friendlyError applicato)
- [ ] Toast switch mode appare UNA VOLTA per sessione
- [ ] controls_for con step negativo genera `>=` nel confronto
- [ ] Bottoni Undo/Redo visibili e funzionanti in ScratchCompileBar
- [ ] Touch target Undo/Redo >= 44x44px
- [ ] procedures_defreturn: String per testo, bool per booleani, int per numeri
- [ ] Esperimento Vol3 in Scratch: compila senza errori con codice corretto
- [ ] Ctrl+Z e Ctrl+Y funzionano da tastiera in Scratch
- [ ] 0 console errors in production build
- [ ] Build passa, tutti i test passano

## Score atteso dopo G54: **7.8/10**
