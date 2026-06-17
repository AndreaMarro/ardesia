# ELAB Tutor — Ralph Loop Systematic Debug & Audit Brutale

## TASK
Fixare tutti i bug aperti, mappare l'intero sistema, e produrre un benchmark multidimensionale brutalmente onesto di ELAB Tutor.

## CONTEXT FILES — Leggi TUTTO prima di iniziare
- `CLAUDE.md` — architettura, stack, regole immutabili
- `.claude/projects/-Users-andreamarro-VOLUME-3/memory/MEMORY.md` — indice memoria completa
- `.claude/projects/-Users-andreamarro-VOLUME-3/memory/G45-audit-brutale.md` — ultimo audit reale (score 5.8/10)
- `.claude/projects/-Users-andreamarro-VOLUME-3/memory/architecture.md` — paths, deploy, palette
- `.claude/projects/-Users-andreamarro-VOLUME-3/memory/scores.md` — score per area
- `docs/prompts/PROMPT-SESSIONE-NEXT-DEBUG-STRESS.md` — ultimo prompt debug (referenza)
- `automa/context/teacher-principles.md` — Principio Zero (LEGGI OBBLIGATORIO)

## METODO — Ralph Loop con Auto-Allineamento

Usa `/ralph-loop` con `--max-iterations 50 --completion-promise ALL_20_SCORES_VERIFIED`.

### Fase 0: MAPPA (primi 30 minuti)
1. **Leggi tutti i resoconti delle ultime sessioni** — trovali in `docs/prompts/` e `.claude/projects/-Users-andreamarro-VOLUME-3/memory/`
2. **Mappa OGNI funzionalita del sistema** in una tabella:
   - Componente | File principale | Stato | Ultimo test | Score
3. **Identifica TUTTI i bug aperti** dalla memoria e dai session logs
4. **Usa `/systematic-debugging`** per ogni bug: Phase 1 (root cause) PRIMA di ogni fix
5. **CoV (Chain of Verification)** ogni 10 minuti: rileggi cosa hai fatto, verifica che sia corretto

### Fase 1: FIX I 4 ISSUE P0/P1 (ordine priorita)

#### Issue 1 — PercorsoPanel non si apre come FloatingWindow
- **Root cause**: `PercorsoPanel` (riga 44) ritorna `null` se `!experiment` — ma il polling 1s potrebbe non trovare l'esperimento in tempo
- **File**: `src/components/lavagna/PercorsoPanel.jsx`
- **Fix**: Rendere il panel visibile anche senza esperimento (mostra "Carica un esperimento"), oppure inizializzare `experiment` dal primo load
- **Verifica**: Clicca "Percorso" nell'header → FloatingWindow appare, trascinabile e ridimensionabile

#### Issue 2 — UNLIM onnipotenza: comandi scritti ma non eseguiti
- **Root cause**: Il backend Gemini Flash-Lite non emette i tag `[AZIONE:...]` nelle risposte, nonostante il system prompt glielo dica
- **File backend**: `supabase/functions/unlim-chat/index.ts` — il system prompt
- **File frontend**: `src/components/lavagna/useGalileoChat.js` — parser AZIONE (riga 33-100)
- **Fix opzione A**: Aggiungere post-processing lato frontend che rileva intent impliciti ("accendi il LED" → `[AZIONE:play]`)
- **Fix opzione B**: Rafforzare il system prompt backend con few-shot examples
- **Fix opzione C**: Aggiungere un fallback che dopo ogni risposta AI, cerca pattern come "evidenziamo", "accendiamo", "carichiamo" e genera azioni automatiche
- **Verifica**: Scrivi "accendi il LED" a UNLIM → il simulatore esegue play. Scrivi "evidenzia il resistore" → R1 si illumina.

#### Issue 3 — Pannelli inline non ridimensionabili
- **I FloatingWindow (VolumeViewer, PercorsoPanel, UNLIM chat) hanno GIA resize handles** — funzionano
- **Il pannello Lezione** ("ACCENDI IL TUO PRIMO LED") nel simulatore NON e ridimensionabile
- **Fix**: Wrappare il pannello lezione in un CSS `resize: both; overflow: auto` oppure convertirlo in FloatingWindow
- **File**: cercare dove il LessonBar e renderizzato in `LavagnaShell.jsx` o `NewElabSimulator.jsx`

#### Issue 4 — Barra componenti sidebar in modalita Libero
- **Root cause**: `QuickComponentPanel` (sidebar sinistra) e sempre visibile indipendentemente dal modo (Gia Montato/Passo Passo/Libero)
- **File**: `src/components/lavagna/LavagnaShell.jsx` riga 477
- **Fix**: Nascondere la sidebar quando il modo e "Libero" (il simulatore ha gia il suo pannello componenti)
- **Verifica**: Passa a "Libero" → sidebar sinistra scompare. Passa a "Gia Montato" → sidebar riappare.

### Fase 2: TEST BRUTALE (dopo i fix)
Usa tutte le skill disponibili in parallelo:
- `/systematic-debugging` per ogni bug trovato
- `/elab-quality-gate` pre e post
- `/quality-audit` completo
- `/ricerca-bug` per bug nascosti
- `/analisi-simulatore` per il motore
- `/lim-simulator` per test LIM 1024x768
- `/impersonatore-utente` con persona docente
- `/elab-nanobot-test` per endpoint backend
- `/analisi-galileo` per qualita risposte UNLIM
- `/lavagna-benchmark` per le 15 metriche Lavagna
- Control Chrome per test browser reale
- Playwright/preview per interazione UI

### Fase 3: BENCHMARK 20 DIMENSIONI

Produci una tabella BRUTALMENTE ONESTA con queste 20 dimensioni:

| # | Dimensione | Come testare | Score /10 | Evidenza |
|---|-----------|-------------|-----------|----------|
| 1 | **Circuiti Vol1 passivi** | Carica tutti 38, verifica LED acceso | | |
| 2 | **Circuiti Vol2 (multimetro/condensatore)** | Carica tutti 27, verifica componenti | | |
| 3 | **Circuiti Vol3 Arduino** | Carica semaforo, compila, AVR running | | |
| 4 | **Scratch/Blockly** | Apri workspace, trascina blocchi, genera codice | | |
| 5 | **Compilazione Arduino** | Codice C++ → HEX → AVR emulation | | |
| 6 | **Monitor Seriale** | Serial.println appare nel monitor | | |
| 7 | **UNLIM chat** | Domanda → risposta <60 parole in italiano | | |
| 8 | **UNLIM onnipotenza** | UNLIM esegue azioni (highlight, play, addcomponent) | | |
| 9 | **VolumeViewer PDF** | Apri manuale, naviga pagine, zoom | | |
| 10 | **Penna annotazioni** | Attiva penna, disegna, cambia pagina, ritorni | | |
| 11 | **PercorsoPanel** | Apri percorso, vedi 5 fasi, espandi | | |
| 12 | **Sidebar componenti** | Icone SVG, click aggiunge, overflow OK | | |
| 13 | **Edge TTS voce** | Attiva voce, UNLIM parla con IsabellaNeural | | |
| 14 | **Responsive LIM 1024x768** | Tutto visibile e usabile su LIM | | |
| 15 | **GDPR consent** | Flow eta → consent → parental per <14 | | |
| 16 | **Password/licenza** | ELAB2026 funziona, altre no | | |
| 17 | **3 volumi nel chooser** | Vol1 (38), Vol2 (27), Vol3 (26) tutti visibili | | |
| 18 | **Parita Vol1 manuale** | 38/38 esperimenti, componenti corretti | | |
| 19 | **Build/Bundle** | <4000KB, 0 errori, precache OK | | |
| 20 | **Console JS zero errori** | No crash, no errori (warning OK) | | |

### REGOLE FERREE

1. **MAI mentire sugli score** — se un test fallisce, scrivi FAIL con dettaglio
2. **MAI auto-assegnare >7 senza verifica con test reale**
3. **Engine intoccabile**: MAI modificare CircuitSolver.js, AVRBridge.js, SimulationManager.js, avrWorker.js
4. **Zero regressioni**: vitest PASS, build <4000KB dopo ogni fix
5. **CoV ogni 10 minuti**: rileggi cosa hai fatto, verifica che sia corretto
6. **Un fix alla volta**: test prima e dopo, mai bundle multipli fix
7. **Score onesto**: self-score max +0.5 dal reale misurato

### OUTPUT ATTESO (completion promise)

Per completare il loop, TUTTI e 20 gli score devono essere:
- **Misurati con evidenza** (screenshot, test output, curl response)
- **Onesti** (nessun inflating)
- **Documentati** in `docs/AUDIT-RALPH-LOOP-RESULTS.md`

I 4 issue P0/P1 devono essere **fixati e verificati** con test runtime.

Deploy finale su Vercel con tutto funzionante.

### LEARNING FROM PREVIOUS SESSIONS

Errori da NON ripetere (dalla memoria):
- G45: self-score 8.6, reale 5.8 (inflato 3 punti) → MAI PIU
- Resistori extra in Cap 10 (LDR) → fisso nella sessione precedente
- DrawingOverlay dead import → fixato
- `drawingEnabled` sempre false → fixato (toggle interno)
- Chooser modal che copre header → da investigare

### COME LANCIARE

```bash
# Nella CLI Claude Code:
/ralph-loop ELAB Tutor Audit Brutale 20 dimensioni --max-iterations 50 --completion-promise ALL_20_SCORES_VERIFIED
```

Oppure copia-incolla questo intero file come prompt.
