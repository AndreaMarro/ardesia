# SESSIONE GIORNO 4 — UNLIM Mode (IL GIORNO DELLA SVOLTA)

```
cd "VOLUME 3/PRODOTTO/elab-builder"

SEI ELAB-TUTOR-LOOP-MASTER. Giorno 4 del piano 2 settimane per UNLIM Mode.

## ⚠️ AUDIT GIORNO 1-3: VOTO C+ — LEGGERE PRIMA DI INIZIARE

L'audit indipendente (3 agenti paralleli) ha dato C+. I problemi:
- 3/67 lesson paths (4.5%) dopo 3 giorni
- Teacher Dashboard: 0 righe (bloccante commerciale)
- Automa morto tutto il sprint, mai rilanciato
- Rapporto commit docs/feat = 10/3 (invertito)
- Al ritmo attuale servirebbero 64 giorni per i lesson paths

OGGI DEVE CAMBIARE. Target: da 3 a 13+ lesson paths (batch 10), 3 bug critici fixati.

## STATO VERIFICATO (27/03/2026 fine G3)
- Build: ✅ PASSA (27s)
- Deploy: ✅ HTTP 200 su elabtutor.school
- Git: pulito, ultimo commit 1056512
- Lesson paths: 3/67 (v1-cap6-esp1, v1-cap6-esp2, v1-cap7-esp1)
- Contrasto: ✅ #558B2F (WCAG AA)
- Nanobot Render: ⚠️ STALE — /gdpr-status mancante, risposte >60 parole
- UX Score da tester: 7.5/10
- 3 bug CRITICI aperti, 6 MEDI

## CONTESTO IMMUTABILE
- Giovanni Fagherazzi = ex Global Sales Director ARDUINO
- PNRR deadline 30/06/2026 — 94 giorni
- Palette: Navy #1E4D8C, Lime #558B2F
- NON toccare: CircuitSolver, AVRBridge, evaluate.py, checks.py

## PIANO SESSIONE — 4 BLOCCHI, SEQUENZIALI

### BLOCCO 1: FIX 3 BUG CRITICI (30 min max)

#### C1: Race condition trySubscribe — memory leak
File: `src/components/unlim/UnlimWrapper.jsx` righe 33-55
Bug: se componente unmount durante retry 800ms, listener `experimentChange` non viene unregistered.
Fix: aggiungere `mountedRef = useRef(true)` + guard in handleExpChange + guard nel retry callback.
```js
const mountedRef = useRef(true);
// nel cleanup: mountedRef.current = false;
// in handleExpChange: if (!mountedRef.current) return;
// nel retry: if (!mountedRef.current) return;
```

#### C2: "Monta il circuito per me" silente se esperimento già caricato
File: `src/components/simulator/panels/LessonPathPanel.jsx` righe 273-293
Bug: se `current?.id === experimentId`, il bottone fa noop silenzioso. Demo-killer.
Fix: mostrare feedback visivo "Già caricato! ✓" per 2 secondi.
```js
const [alreadyLoaded, setAlreadyLoaded] = useState(false);
if (current?.id === experimentId) {
  setAlreadyLoaded(true);
  setTimeout(() => setAlreadyLoaded(false), 2000);
  return;
}
```

#### C3: `onSendToUNLIM` dead prop in RichLessonPath
File: `src/components/simulator/panels/LessonPathPanel.jsx` riga 176
Bug: prop accettata ma mai usata. Dead code che segnala feature non finita.
Fix: rimuoverla dalla destructuring se non implementata, o implementarla (bottone "Chiedi a UNLIM" nella fase CHIEDI).

#### M1: InputBar non auto-focus al mount
File: `src/components/unlim/UnlimInputBar.jsx`
Fix: `useEffect(() => { inputRef.current?.focus(); }, []);`

### BLOCCO 2: BATCH GENERAZIONE 10 LESSON PATHS (90 min)

#### Strategia: 2 fasce di generazione

**Fascia A — Con curriculum data (4 percorsi, dati GIÀ PRONTI)**
Questi hanno teacherBriefing + commonMistakes + analogies + assessment in curriculumData.js:
1. `v1-cap6-esp3` — "La resistenza cambia la luminosità" (3 resistori diversi)
2. `v1-cap8-esp1` — "Il pulsante accende il LED" (tact switch, circuito aperto/chiuso)
3. `v1-cap9-esp1` — "Il potenziometro regola la luminosità" (resistenza variabile)
4. `v1-cap10-esp1` — "La fotoresistenza sente la luce" (sensore luce)

**Fascia B — Senza curriculum data (6 percorsi, dati da experiments-vol1.js)**
Generare analogie e errori comuni dagli `steps`, `observe`, `concept`, `unlimPrompt`:
5. `v1-cap7-esp2` — "Accendi il verde del RGB"
6. `v1-cap7-esp3` — "Accendi il blu del RGB"
7. `v1-cap7-esp4` — "Mescola rosso e verde → giallo!"
8. `v1-cap7-esp5` — "Mescola rosso e blu → viola!"
9. `v1-cap7-esp6` — "Tutti e 3 → bianco!"
10. `v1-cap8-esp2` — "Due LED con un pulsante"

#### Processo per ogni JSON (usa v1-cap6-esp1.json come template):
1. Leggi dati esperimento da experiments-vol1.js (components, connections, steps, observe, concept)
2. Leggi curriculum data se disponibile (teacherBriefing, commonMistakes, analogies, assessment)
3. Genera JSON 5 fasi: PREPARA→MOSTRA→CHIEDI→OSSERVA→CONCLUDI
4. Verifica vocabolario: forbidden words per capitolo
5. build_circuit.intent: copia components + connections dall'esperimento
6. Aggiungi a index.js

#### Vocabolario per capitolo (REGOLE):
- Cap 6: NO ohm, volt, parallelo, serie, condensatore, Arduino
- Cap 7: come Cap 6, + permesso "resistore", "LED RGB", "catodo comune"
- Cap 8: come Cap 7, + permesso "pulsante", "circuito aperto/chiuso"
- Cap 9: come Cap 8, + permesso "potenziometro", "resistenza variabile"
- Cap 10: come Cap 9, + permesso "fotoresistenza", "sensore", "LDR"

### BLOCCO 3: BUILD + DEPLOY + TEST (20 min)
1. `npm run build` — DEVE passare
2. Test nel browser: caricare 3 esperimenti a campione, verificare overlay + LessonPathPanel
3. `npx vercel --prod --yes`
4. `curl -s -o /dev/null -w "%{http_code}" https://www.elabtutor.school`

### BLOCCO 4: CHAIN OF VERIFICATION (10 min)

Eseguire TUTTE queste verifiche, riportare risultato PASS/FAIL per ciascuna:

| # | Verifica | Comando/Azione | Evidenza attesa |
|---|----------|----------------|-----------------|
| V1 | Build passa | `npm run build` | Exit 0 |
| V2 | Lesson paths in index.js | `grep "import" src/data/lesson-paths/index.js \| wc -l` | ≥ 13 |
| V3 | Deploy OK | `curl -s -o /dev/null -w "%{http_code}" https://www.elabtutor.school` | 200 |
| V4 | Bug C1 fixato | Leggere UnlimWrapper.jsx, cercare `mountedRef` | Presente |
| V5 | Bug C2 fixato | Leggere LessonPathPanel.jsx, cercare feedback "Già caricato" | Presente |
| V6 | Bug M1 fixato | Leggere UnlimInputBar.jsx, cercare `autoFocus` o `focus()` | Presente |
| V7 | Test browser esp casuale | Caricare v1-cap9-esp1, verificare overlay + panel | Screenshot |
| V8 | Console errors | preview_console_logs level=error | 0 errori nuovi (solo borderColor pre-esistente OK) |
| V9 | JSON schema consistency | Tutti i JSON hanno le stesse chiavi top-level | Verificato |
| V10 | Git pushato | `git log -1 --oneline` | Commit feat con ≥10 lesson paths |

Se anche UNA verifica FAIL → NON dichiarare successo. Fixare prima.

## FILE DA LEGGERE (in ordine — MAX 10 file, NO audit multipli)

### Obbligatori prima di scrivere codice (5 file)
1. `src/data/lesson-paths/v1-cap6-esp1.json` — TEMPLATE (170 righe)
2. `src/data/curriculumData.js` — dati pedagogici per 7 esperimenti
3. `src/data/experiments-vol1.js` — DATI degli esperimenti (righe per ogni ID target)
4. `src/components/unlim/UnlimWrapper.jsx` — per fix C1
5. `src/components/simulator/panels/LessonPathPanel.jsx` — per fix C2+C3

### Riferimento se serve
6. `src/components/unlim/UnlimInputBar.jsx` — per fix M1
7. `src/data/lesson-paths/index.js` — per aggiornare import
8. `automa/SESSION-HANDOFF-20260327-G3.md` — stato verificato

### NON leggere (già noto)
- I 5 componenti UNLIM (funzionano, verificato)
- CLAUDE.md (già nel contesto)
- Contesto business (già nel prompt)
- Qualsiasi file automa/context/

## REGOLE SESSIONE
1. ❌ ZERO commit `docs:` — solo `feat:` e `fix:`
2. ❌ ZERO agenti di ricerca/audit prima di aver scritto codice
3. ❌ ZERO handoff >50 righe
4. ✅ CODICE FIRST — fix bug, poi batch genera JSON
5. ✅ Build dopo ogni blocco
6. ✅ Deploy una volta alla fine
7. ✅ CoV obbligatoria con le 10 verifiche sopra
8. ✅ Massima onestà — se qualcosa non funziona, dillo

## ANTI-PATTERN DA NON RIPETERE (da audit G1-G3)
- ❌ Spendere 30min+ su audit prima di scrivere codice
- ❌ 10 commit docs per 3 commit feat
- ❌ Creare task per l'automa morto
- ❌ Handoff da 200+ righe
- ❌ Rileggere 43 file di contesto
- ❌ "Monta il circuito per me" che non dà feedback

## OUTPUT ATTESO
- 3 bug critici fixati (C1, C2, C3) + 1 medio (M1)
- 10 lesson paths nuovi (da 3 a 13 totali)
- Build ✅ + Deploy ✅
- CoV con 10 verifiche PASS
- Handoff ≤50 righe

## REFERENCE
- Build: `export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH" && npm run build`
- Deploy: `export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH" && npx vercel --prod --yes`
- Sito: https://www.elabtutor.school
- Palette: Navy #1E4D8C, Lime #558B2F
```
