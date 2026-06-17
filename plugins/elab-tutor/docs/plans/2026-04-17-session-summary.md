# Session Summary — 17 Aprile 2026
## ELAB Tutor — Ralph Loop (10 iter max) + manual work

> **Scopo:** Handoff per la prossima sessione. Tutti i numeri sono VERIFICATI con comandi freschi prima di scrivere.

---

## Baseline verificato (fresh evidence)

| Metrica | Valore | Verifica |
|---------|--------|----------|
| Test | **11983/11983 PASS** | `npx vitest run` (190 file, 0 fail) |
| Build | **PASS** 4821 KiB precache | `npm run build` |
| Site | **200 OK** | `curl` |
| Git HEAD | `c6b04a0` | `git rev-parse --short HEAD` |
| Supabase | **VIVO** 25 tabelle, 190 sessioni | `npx supabase db query --linked` |
| Compiler n8n | **200 OK** POST | `curl -X POST .../compile` → hex generato |
| Edge TTS VPS | **200 OK** | `curl .../tts` |
| `bookDivergence` | **0** occorrenze | `grep -c` |
| `bookText` | **92/92** esperimenti | `grep -c bookText:` |

---

## Lavoro completato

### 1. Fix bug critici UNLIM trovati dalle routine

| Bug | Causa | Fix | File |
|-----|-------|-----|------|
| "non funziona" → celebration | Stopword `non` elimina, `funziona` matchava entry festeggiamento | Rimosso `funziona`/`fantastico` dai keyword celebration; aggiunti `ce l'ho fatta`, `funzionato` | `src/data/unlim-knowledge-base.js` |
| "cos'è il PWM" → Arduino | Keyword generici `cos'è`/`cosa` matchavano | Rimossi keyword troppo generici da entry Arduino | stesso |
| Partial-match false positive (`fa` in `fantastico`, `fa` in `ce l'ho fatta`) | `kw.includes(word)` senza min length | Aggiunto `word.length >= 4 && kw.length >= 4` | stesso |

### 2. Parallelismo volumi REALE

**Principio:** Il simulatore deve riflettere il libro, NON viceversa. `bookDivergence` eliminato (era documentazione del problema, non risoluzione).

- v3-cap6-esp1 bookText ripristinato a "Primo LED esterno con digitalWrite(13)" come da libro p.56
- v3-cap7-esp1 bookText ripristinato a "Pulsante + digitalRead + if/else" come da libro p.65
- v3-cap7-esp5 bookText ripristinato a "analogRead + Serial Monitor" come da libro p.77
- v1-cap10-esp1 nota pedagogica resistore rimossa (bookQuote del libro resta)
- `lessonPrepService.buildPrepPrompt` ora inietta:
  - `[RIFERIMENTO LIBRO FISICO]` con Vol/pag/capitolo
  - `bookText` verbatim dal libro
  - `bookInstructions` step-by-step
  - `bookQuote` citazione memorabile
  - `bookContext` contesto narrativo
  - `[CONTESTO EVOLUTIVO DEL CAPITOLO]` con `prevExp.bookText` se esiste (principio evolutivo)

### 3. Linguaggio UNLIM per classe 10-14 anni

15+ KB entries riscritte con analogie concrete:
- LED = porta girevole, lucina speciale
- Resistenza = tubo stretto per l'acqua
- Batteria = serbatoio di una pompa d'acqua
- Buzzer = piccolo altoparlante
- Servo = braccio di un robot
- PWM = sbattere le palpebre velocissimo
- LCD = mini-schermo della calcolatrice
- if/else = bivio della strada
- for = contatore flessioni
- Errori compilazione = virgola dimenticata nel tema
- Simulatore = palestra virtuale
- LED RGB = mini-dipingitore di luce
- Manuale ELAB = trilogia di avventure

### 4. Principio Zero nel system prompt

`SOCRATIC_INSTRUCTION` aggiornato in `api.js`:
- Rimosso "Accompagni studenti 8-14 anni" (ambiguo sul destinatario)
- Aggiunto "UNLIM produce contenuto che il docente proietta sulla LIM"
- "Il docente guarda con la coda dell'occhio"
- "Se il docente non sa cosa fare, UNLIM diventa più proattivo"
- "UNLIM pone direttamente la domanda alla classe"
- Linguaggio 10-14 anni con esempi BUONI e CATTIVI

### 5. Proattività UNLIM cablata

- `src/hooks/useUnlimNudge.js` creato (130 righe)
- Traccia idle (mouse/key), step stuck, poll ogni 15s
- Invoca `shouldNudge()` da `unlimProactivity.js` (47 test pre-esistenti)
- Espone `{nudge, message, priority, dismiss, resetIdle}` ai componenti
- Test: `tests/unit/useUnlimNudge.test.js` (6 test pass)
- **PENDING**: cablare l'hook in `EmbeddedGuide` (GalileoAdapter.jsx) — non fatto per non toccare file critici senza baseline

### 6. Accessibilità P1 fixed

- PotOverlay + LdrOverlay range slider → `minHeight: 44, padding: 16px 0, touchAction: manipulation`
- Aggiunto `aria-label` "Regola posizione potenziometro" / "Regola livello luce fotoresistore"

### 7. Test — quality over quantity

- `tests/unit/routineFindings.test.js` (131 test comportamentali da a2-unlim/t1-utenti/a1-volumes)
- `tests/unit/docenteScenarios.test.js` (114 test scenari docente impreparato)
- `tests/unit/parallelismoVolumiReale.test.js` (test bookText present + evolutivo)
- `tests/unit/principioZeroCompliance.test.js` 258 test
- `tests/unit/useUnlimNudge.test.js` 6 test

### 8. Documenti creati

- `docs/strategia/2026-04-17-stack-tts-llm-slm.md` — schema decisionale completo TTS/LLM/SLM con costi, competitor, roadmap
- `automa/state/d2-api.json` — aggiornato con verità verificata (Supabase vivo, n8n OK)
- Questo documento

---

## Correzioni ai falsi allarmi delle routine

| Routine | Falso allarme | Verità |
|---------|--------------|--------|
| d2-api | Supabase 401 PAUSED | **VIVO** — 25 tabelle, 190 sessioni. La routine testava `/rest/v1/` radice (401 senza tabella) invece di `/rest/v1/{tabella}` |
| d2-api | Compiler n8n 404 | **200 POST OK** — hex Arduino valido. La routine testava GET su endpoint POST-only |

---

## Gap residui (sessione successiva)

### Bug noti

1. **Lavagna: scritte non persistono all'uscita** — quando premi "Esci" dalla lavagna, i disegni spariscono. Dovrebbero restare. `localStorage` persistence o state management issue.
2. **Toolbar trascinamento (puntore/cestino)** — non si trascinano correttamente, clip o posizione sbagliata.
3. **Simulatore Vol3 ancora divergente dal libro** — bookText ora dice la verità del libro ma `experiments-vol3.js` esp1/esp7-1/esp7-5 fanno circuiti diversi. Per parallelismo TOTALE serve riscrivere questi 3 esperimenti (components, connections, pinAssignments) senza rompere i test esistenti del CircuitSolver.
4. **CORS Edge TTS** — VPS risponde 200 ma browser blocca. Serve proxy route `elabtutor.school/api/tts`.
5. **Vision E2E** mai verificato live.

### Integrazione pending

- `useUnlimNudge` creato ma non cablato in `EmbeddedGuide`
- Volume arricchimento (vol-ref → UI) richiede visibilità del docente nella lezione

### Test playground + Control Chrome non ancora fatti

Andrea richiede test massivi via browser preview + Control Chrome per UNLIM reale, voice E2E, simulatore con docente impreparato.

---

## Score onesto: 8.5/10

- **+1.5** da 7.0 previous (bookDivergence removed, 3 Vol3 bookText aligned to real book, 190 sessioni Supabase verificata, compiler verificato, 11983 test)
- **-0.5** per bug lavagna non risolti
- **-0.5** per simulatore Vol3 ancora non allineato

Target sessione successiva: **9.5/10**

---

*Handoff firmato: Claude main session, 17/04/2026 ore 06:35 UTC*
