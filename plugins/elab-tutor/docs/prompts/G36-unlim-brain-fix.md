# G36 — UNLIM BRAIN FIX (P0/P1 Critical)

**Sprint G** — Prima sessione (post G35 Audit Brutale)
**Deadline PNRR**: 30/06/2026 (81 giorni)
**Score attuale ONESTO**: 7.4/10 | Target G36: 8.4/10
**Riferimento piano**: `docs/plans/2026-03-30-sprint-g-master-plan.md`

---

## CONTESTO SESSIONI PRECEDENTI

### G35 — Report PDF + Grafici + Audit Brutale
- Aggiunto ReportTab con recharts (Line, Bar, Pie), KPI cards, PDF export
- **AUDIT BRUTALE** con 5 agenti: score reale 7.4/10 (era gonfiato a 8.9)
- **Fix P0**: role bug `isDocente` (AuthContext.jsx:154), homepage counter (VetrinaSimulatore.jsx)
- **Fix font**: chart fonts 11-13px portati a 14px

### Findings critici dall'audit G35 (che QUESTA sessione deve fixare):
1. **AI conosce solo 17/44 azioni** — api.js:55-76 system prompt incompleto
2. **UNLIM overlay NON inietta student memory** — UnlimWrapper.jsx:242
3. **STT silenziosamente assente su Firefox** — useSTT.js

---

## IMPERATIVO ASSOLUTO
ZERO DEMO. ZERO DATI FINTI. ZERO MOCK.
Ogni fix deve funzionare con dati reali. Se UNLIM non risponde, mostrare errore chiaro.

---

## FILE ESSENZIALI DA LEGGERE PRIMA DI INIZIARE

| File | Perche' | Righe chiave |
|------|---------|-------------|
| `src/services/api.js` | System prompt con lista azioni (INCOMPLETA) | 33-76 |
| `src/components/tutor/ElabTutorV4.jsx` | Action parser con 44 azioni | 1776-2050 |
| `src/components/unlim/UnlimWrapper.jsx` | sendChat senza memory injection | 242 |
| `src/services/unlimMemory.js` | buildMemoryContext() non usato in overlay | tutto |
| `src/hooks/useSTT.js` | STT solo Chrome, nessun fallback message | tutto |
| `src/hooks/useTTS.js` | TTS funzionante ma qualita' OS-dependent | tutto |
| `automa/context/GALILEO-CAPABILITIES.md` | Mappa 26+ azioni documentate | tutto |

---

## TASK

### Task 1: Quality Gate Pre-Session (10min)
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npm run build        # DEVE passare
npx vitest run       # 956+ test
npm run test:e2e     # 20+ test
```
Salvare baseline.

### Task 2: Aggiornare System Prompt AI con TUTTE le 44 azioni (2h)

**Il problema**: `api.js` righe 55-76 dice all'AI solo ~17 azioni. Ma ElabTutorV4.jsx ne implementa 44.

**Cosa fare**:
1. Leggere ElabTutorV4.jsx righe 1776-2050 e estrarre TUTTE le azioni implementate
2. Aggiornare `SOCRATIC_INSTRUCTION` in api.js con la lista completa
3. Organizzare le azioni per categoria (controllo, navigazione, componenti, fili, editor, altro)
4. Mantenere il prompt sotto 800 token (comprimere, non elencare ogni parametro)
5. Testare: inviare "mostra il BOM" a UNLIM -> deve generare `[AZIONE:showbom]`

**CoV Task 2**: `npm run build && npx vitest run`

### Task 3: Iniettare Student Memory in UNLIM Overlay Mode (1h)

**Il problema**: UnlimWrapper.jsx:242 chiama sendChat senza `unlimMemory.buildMemoryContext()`.
ElabTutorV4.jsx lo fa (riga ~1440), ma UNLIM overlay no.

**Cosa fare**:
1. In UnlimWrapper.jsx, importare `unlimMemory` (o accedere via window.__unlimMemory)
2. Prima di sendChat (riga ~220), costruire il contesto memoria:
   ```js
   const memoryCtx = window.__unlimMemory?.buildMemoryContext?.() || '';
   ```
3. Includere `memoryCtx` nel payload inviato a sendChat
4. Verificare che non duplichiamo il contesto se gia' presente da classProfile

**CoV Task 3**: `npm run build && npx vitest run`

### Task 4: Fallback Message per Browser senza STT (30min)

**Il problema**: useSTT.js nasconde il bottone microfono se SpeechRecognition non esiste. Nessun messaggio.

**Cosa fare**:
1. In UnlimInputBar.jsx, quando `!stt.isSupported`, mostrare un tooltip/testo piccolo:
   "Usa Chrome o Edge per il controllo vocale"
2. NON un popup invasivo — solo un hint sotto l'input bar, visibile una volta
3. Salvare in localStorage `elab_stt_hint_shown` per non ripeterlo

**CoV Task 4**: `npm run build && npx vitest run`

### Task 5: Indicatore Offline Persistente (1h)

**Il problema**: Quando TUTTI i server sono giu', UNLIM mostra errore temporaneo che sparisce. Bambini confusi.

**Cosa fare**:
1. In UnlimWrapper.jsx, dopo un errore sendChat, settare stato `isOffline: true`
2. Mostrare banner sottile sotto l'input bar: "Connessione assente — le risposte saranno limitate"
3. Dopo un sendChat riuscito, rimuovere il banner
4. Usare colore arancione warning, non rosso errore (per non spaventare bambini)
5. Stile coerente con il banner "Dati locali (offline)" del TeacherDashboard

**CoV Task 5**: `npm run build && npx vitest run`

### Task 6: Test E2E + Quality Gate Post-Session (30min)
```bash
npm run test:e2e     # 20+ test
```

### Task 7: AUDIT FINALE (OBBLIGATORIO)

Esegui il template audit completo (vedi master plan).
5 agenti paralleli + test browser reale.
Score card ONESTA.

### Task 8: Handoff + Prompt G37
Aggiornare `automa/handoff.md` e scrivere/aggiornare `docs/prompts/G37-dashboard-reale.md`

---

## CHAIN OF VERIFICATION — 3 PASSAGGI

### CoV 1: POST-TASK (dopo ogni step)
- `npm run build` -- DEVE passare
- `npx vitest run` -- 956+ test, 0 fail

### CoV 2: PRE-MERGE
- UNLIM risponde con azioni nuove (testare "mostra BOM", "undo", "prossimo passo")
- UNLIM conosce storia studente in overlay mode
- Browser Firefox mostra hint STT
- Banner offline appare quando server e' giu'

### CoV 3: POST-SESSION (AUDIT BRUTALE)
Vedi template audit nel master plan.

---

## DELIVERABLE ATTESI G36

| # | Deliverable | Criterio |
|---|-------------|----------|
| 1 | System prompt con 44 azioni | AI genera azioni per showbom, undo, nextstep |
| 2 | Memory injection overlay | UNLIM sa cosa lo studente ha fatto prima |
| 3 | STT fallback message | Firefox mostra "Usa Chrome per voce" |
| 4 | Offline indicator | Banner arancione quando server giu' |
| 5 | Score UNLIM >= 8/10 | Da 6.5 a 8+ |
| 6 | Score composito >= 8.4 | Da 7.4 a 8.4 |

---

## SCORE TARGET

| Area | G35 | Target G36 |
|------|-----|-----------|
| Build/Test | 10/10 | 10/10 |
| Simulatore | 7.9/10 | 7.9/10 |
| UNLIM | 6.5/10 | **8.5/10** |
| Dashboard | 6.5/10 | 6.5/10 |
| GDPR | 7/10 | 7/10 |
| **COMPOSITO** | **7.4/10** | **8.4/10** |
