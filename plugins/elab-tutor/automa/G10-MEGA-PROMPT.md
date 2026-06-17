# G10 MEGA-PROMPT — ELAB Tutor Sessione Marathon

**Data**: 28/03/2026
**Sessione**: G10 (successore di G9 — Teacher Dashboard MVP)
**Durata prevista**: 6-8 ore equivalenti, sessione lunga marathon
**Obiettivo**: Portare il prodotto da "engine 10/10 in shell 6/10" a "prodotto 8/10 vendibile"

---

## ISTRUZIONI CRITICHE

### NON FARE DEMO
**TUTTO deve funzionare DAVVERO.** Niente mock data, niente "Demo Mode", niente dati finti, niente placeholder. Se una feature richiede dati che non esistono, costruisci l'infrastruttura per raccogliere dati REALI (localStorage, IndexedDB, server sync). Un dirigente scolastico che vede "Demo Mode" NON compra. Un insegnante che clicca e trova dati finti perde fiducia IMMEDIATAMENTE.

### MASSIMA ONESTA
Ogni score che assegni deve essere BRUTALMENTE onesto. Se qualcosa fa schifo, dillo. Se un aspetto e' a 3/10, non scrivere 6/10 per far piacere. Andrea ha bisogno di verita', non di complimenti. I committenti (Giovanni Fagherazzi, Omaric Elettronica) si fidano di Andrea e Andrea si fida di te.

### RISPETTA IL PIANO CON LIBERTA
Il piano sotto e' una guida, non una prigione. Se durante il lavoro scopri qualcosa di piu' urgente, HAI IL DOVERE di deviare e comunicarlo. La priorita' assoluta e': prodotto che funziona davvero per insegnanti veri.

### LEGGI IL REPORT G9B
Prima di iniziare, leggi `automa/reports/G9B-SESSION-REPORT.md`. Contiene:
- La scoperta che i vecchi hook in settings.json **non funzionavano** (usavano `$TOOL_INPUT` che non esiste)
- Il giudizio brutale: G9B ha prodotto 0 righe di codice prodotto
- La raccomandazione: **Fase 2+3 e Fase 7 sono le uniche critiche**. Il resto e' bonus. Meglio 2 fasi fatte bene che 8 fatte male.

---

## CONTESTO PROGETTO

### Cos'e' ELAB
ELAB e' un tutor educativo per elettronica e Arduino per bambini 8-12 anni. Include simulatore di circuiti proprietario (CircuitSolver + AVRBridge + avr8js), Chat AI "Galileo" (tutor pedagogico), 62 esperimenti organizzati in 3 volumi, giochi didattici. Target: scuole italiane, kit hardware €75, licenza software €500-1000/anno.

### Stato attuale (post-G9)
- **Simulatore**: 10/10 funzionalita', 21 componenti SVG, KVL/KCL solver, AVR emulation
- **Lesson Paths**: 62/62 completi (Vol1: 38, Vol2: 18, Vol3: 6)
- **Teacher Dashboard**: 8 tab incluso "Progresso PNRR" — MA dati solo da localStorage, 0 studenti reali
- **AI Galileo**: 5 specialisti, multi-provider racing, score 4.3/5 nei test
- **Deploy**: elab-builder.vercel.app (HTTP 200)
- **Build**: passa (vite build OK)
- **Aspetto #6 "Insegnante"**: 5.5/10 (era 3.5, migliorato in G9)
- **Overall honest score**: ~7.5/10 (engine 10, shell 6)

### PDR 16 Aspetti — Score attuali
| # | Aspetto | Score | Note |
|---|---------|-------|------|
| 1 | Simulatore funzionalita' | 10.0 | Zero regressioni |
| 2 | Simulatore estetica | 8.5 | 248 inline styles |
| 3 | iPad + LIM | 8.8 | 13 bottoni <44px |
| 4 | Arduino/Scratch/C++ | 10.0 | 41 blocchi, 35 error patterns |
| 5 | AI/Galileo | 10.0 | 5 specialisti |
| 6 | Insegnante | 5.5 | Dashboard MVP fatto, manca UX reale |
| 7 | Contenuti/Volumi | 9.5 | 62/62 lesson paths |
| 8 | Performance | 8.0 | Build 19s, bundle 1.1MB |
| 9 | PWA/Offline | 7.0 | SW generato, mai testato offline |
| 10 | Sicurezza/A11y | 9.2 | CSP, HSTS, aria-labels |
| 11 | Design/UX | 8.0 | Funzionale non delightful |
| 12 | i18n | 0 | Solo italiano |
| 13 | Business/Mercato | 1 | Zero marketing |
| 14 | Ricerca continua | 3 | Mai usato sistematicamente |
| 15 | Sistemi locali | 2 | Solo Brain V13 su VPS |
| 16 | Cluster scuola | 0 | Futuro |

### Deadline
- **PNRR**: 30/06/2026 (3 mesi)
- **MePA**: gestito da Davide Fagherazzi
- **Demo per Giovanni**: ASAP (ex Arduino Global Sales Director)

---

## PIANO G10 — 8 FASI

### FASE 0: BOOTSTRAP (15 min)
```
Leggi questi file per contesto completo:
1. PRODOTTO/elab-builder/CLAUDE.md
2. PRODOTTO/elab-builder/automa/STATE.md
3. PRODOTTO/elab-builder/automa/PDR.md
4. PRODOTTO/elab-builder/automa/context/ELAB-COMPLETE-CONTEXT.md (se esiste)
5. Questo prompt (G10-MEGA-PROMPT.md)

Poi fai:
- npm run build (deve passare)
- Apri il browser con preview_start
- Verifica che il sito carichi senza errori console
- Screenshot della homepage
```

### FASE 1: AUDIT INIZIALE BRUTALE (30 min)
**Usa: /quality-audit, /analisi-simulatore, /ricerca-bug**

Lancia 3 subagent in parallelo:
1. **Quality Auditor**: font sizes, touch targets, WCAG AA, bundle size, console errors, dead code
2. **Simulator Verifier**: apri 5 esperimenti random (1 per volume), verifica che il circuito si carichi, che il play funzioni, che Galileo risponda
3. **Bug Hunter**: cerca regressioni post-G9, verifica che le 8 tab del Teacher Dashboard funzionino

Output: `automa/reports/G10-AUDIT-INIZIALE.md` con score card

### FASE 2: INFRASTRUTTURA DATI REALI (90 min)
**Usa: /system-design, /architecture, /engineering:system-design**

Il problema piu' grande: la Teacher Dashboard mostra dati finti. Serve:

1. **IndexedDB StudentStore** — storage locale persistente per:
   - Progressi studente (esperimenti completati, tempo, errori)
   - Sessioni di lavoro (inizio, fine, azioni)
   - Risposte Galileo (domande fatte, qualita' risposta)

2. **Data Collection Pipeline** — quando lo studente:
   - Completa un esperimento → salva in IndexedDB
   - Fa play del codice → salva risultato (ok/errore)
   - Chiede a Galileo → salva domanda + risposta
   - Gioca un gioco → salva punteggio

3. **Teacher Dashboard reads from IndexedDB** — sostituisci TUTTI i mock data con query reali

**IMPORTANTE**: Non serve backend. IndexedDB e' persistente nel browser. Ogni studente ha il suo browser/tablet. Il teacher dashboard legge i dati dello studente corrente o (futuro) aggrega via export/import JSON.

Scrivi documento intermedio: `automa/reports/G10-DATA-ARCHITECTURE.md`

### FASE 3: STUDENT TRACKING REALE (90 min)
**Usa: /frontend-design, /subagent-driven-development**

Implementa il tracking reale:

1. **studentTracker.js** — modulo che:
   - Ascolta eventi di `window.__ELAB_API` (experimentChange, stateChange, serialOutput)
   - Salva automaticamente in IndexedDB
   - Espone `getStudentProgress()`, `getSessionHistory()`, `getExperimentStats()`

2. **Integra nel simulatore** — aggiungi tracking in:
   - `NewElabSimulator.jsx` (experiment complete, play count, error count)
   - `CodeEditorCM6.jsx` (compilazioni, errori, fix)
   - `GalileoResponsePanel.jsx` (domande, risposte, rating)
   - Giochi (punteggi, tentativi, tempo)

3. **Teacher Dashboard update** — sostituisci mock con dati reali da IndexedDB

Lancia subagent paralleli per file indipendenti.
Scrivi checkpoint: `automa/reports/G10-TRACKING-CHECKPOINT.md`

### FASE 4: UX INSEGNANTE REALE (60 min)
**Usa: /impersonatore-utente, /lim-simulator, /design:ux-copy, /design:accessibility-review**

Simula l'esperienza dell'insegnante:
1. Impersona "Prof.ssa Rossi, 52 anni, zero esperienza Arduino, prima volta con ELAB"
2. Segui il percorso: login → scegli esperimento → proietta su LIM → spiega alla classe
3. Identifica OGNI frizione (bottoni troppo piccoli, testo troppo tecnico, passaggi non ovvi)
4. Fix i 5 problemi piu' critici trovati

Output: `automa/reports/G10-UX-INSEGNANTE.md`

### FASE 5: POLISH & FIX (60 min)
**Usa: /ricerca-bug, /analisi-galileo, /frontend-design**

1. Fix tutti i bug trovati nelle fasi precedenti
2. Migliora le 248 inline styles piu' visibili (homepage, dashboard, simulatore)
3. Touch targets: porta TUTTI i bottoni a >=44px
4. Verifica Galileo: 5 domande reali, verifica che le risposte siano appropriate per bambini 8-12
5. Performance: controlla che il bundle non sia cresciuto

### FASE 6: RICERCA & INNOVAZIONE (45 min)
**Usa: /ricerca-innovazione, /ricerca-idee-geniali, /ricerca-marketing, /ricerca-tecnica**

Lancia 4 ricerche parallele:
1. **Innovazione**: cosa fanno i competitor nel 2026? Nuove tecnologie EdTech?
2. **Idee geniali**: 3 feature "wow" che nessun competitor ha
3. **Marketing**: come posizionare ELAB per le scuole italiane? Cosa cercano i dirigenti?
4. **Tecnica**: WebUSB per collegamento Arduino reale? WebSerial API? Come farli nel browser?

Output: `automa/reports/G10-RICERCA-COMPLETA.md`

### FASE 7: VERIFICA FINALE MASSIVA (45 min)
**Usa: /quality-audit, /verification-before-completion, /ricerca-bug**

Questa e' la fase piu' importante. NIENTE viene dichiarato "fatto" senza prove.

**Layer 1 — Build**
```bash
cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build
# DEVE passare. Se non passa, FIX PRIMA.
```

**Layer 2 — Browser E2E (5 esperimenti)**
Usa preview_start + preview_snapshot + preview_screenshot:
- Vol1 Cap1 Esp1 (LED base)
- Vol1 Cap7 Esp3 (potenziometro)
- Vol2 Cap1 Esp1 (primo Vol2)
- Vol3 Cap1 Esp1 (primo Vol3)
- Un esperimento random

Per ognuno:
- Carica → screenshot
- Play → verifica circuito
- Galileo → fai una domanda
- Console → 0 errori nuovi

**Layer 3 — Teacher Dashboard**
- Apri dashboard → tutte 8 tab → nessun crash
- Tab PNRR → matrice 62 esperimenti visibile
- Dati → vengono da IndexedDB (NON mock)

**Layer 4 — Touch/A11y**
- Tutti i bottoni >=44px
- Contrasto WCAG AA
- Focus visible

**Layer 5 — Regressioni**
- Confronta con G9: nessuna feature persa
- Bundle size: non piu' di +5% vs G9

**Layer 6 — Scores Onesti**
Aggiorna il PDR con scores REALI post-G10. Sii brutale.

Output: `automa/reports/G10-VERIFICA-FINALE.md`

### FASE 8: DEPLOY + HANDOFF (15 min)
```bash
npm run build && npx vercel --prod --yes
```
Poi:
- Verifica HTTP 200 su elab-builder.vercel.app
- Aggiorna `automa/STATE.md`
- Aggiorna `automa/handoff.md` (per G11)
- Scrivi session summary

---

## COMANDI SKILL DA USARE

### Audit & Quality
- `/quality-audit` — font sizes, touch targets, WCAG, bundle
- `/analisi-simulatore` — circuiti, solver, componenti
- `/ricerca-bug` — bug hunting proattivo
- `/analisi-galileo` — qualita' risposte AI

### Design & Architecture
- `/design:design-system` — audit design system
- `/design:accessibility-review` — WCAG 2.1 AA
- `/design:ux-copy` — microcopy, error messages
- `/engineering:system-design` — architettura dati
- `/engineering:architecture` — ADR decisions

### Implementation
- `/frontend-design` — UI components
- `/subagent-driven-development` — task paralleli
- `/writing-plans` — piano prima del codice
- `/dispatching-parallel-agents` — subagent paralleli

### Research
- `/ricerca-innovazione` — trend EdTech 2026
- `/ricerca-idee-geniali` — feature breakthrough
- `/ricerca-marketing` — posizionamento mercato
- `/ricerca-tecnica` — soluzioni implementative

### Simulation & Test
- `/impersonatore-utente` — simula Prof.ssa Rossi
- `/lim-simulator` — test su LIM scolastica
- `/analisi-video-kimi` — review visuale

### Verification
- `/verification-before-completion` — prove prima di claims
- `/ricerca-bug` — bug hunting finale
- `/quality-audit` — score card finale

### Debug
- `/systematic-debugging` — per ogni bug trovato
- `/engineering:debug` — reproduce, isolate, fix

---

## MCP SERVERS & TOOLS DA USARE

### Browser Testing
- `preview_start` / `preview_stop` — dev server
- `preview_screenshot` — screenshot visuale
- `preview_snapshot` — DOM content
- `preview_console_logs` — errori console
- `preview_click` / `preview_fill` — interazioni
- `preview_inspect` — CSS values
- `preview_network` — network requests

### Chrome Control (per test reali)
- `Control_Chrome` — navigate, execute_javascript, get_page_content
- `Claude_in_Chrome` — read_page, form_input, navigate

### Playwright (E2E automatizzati)
- `browser_navigate` / `browser_snapshot` / `browser_take_screenshot`
- `browser_click` / `browser_fill_form` / `browser_evaluate`

### Firecrawl (ricerca web)
- Per ricerca competitor, trend, documentazione tecnica

### Vercel (deploy)
- `deploy_to_vercel` / `get_deployment` / `list_deployments`

### Galileo MCP (test AI)
- `galileo_chat` — test risposte
- `galileo_health` — verifica server
- `galileo_batch_test` — test batch

---

## DOCUMENTI INTERMEDI DA CREARE

Durante la sessione, crea questi file per mantenere contesto:

1. `automa/reports/G10-AUDIT-INIZIALE.md` — Score card iniziale
2. `automa/reports/G10-DATA-ARCHITECTURE.md` — Architettura IndexedDB
3. `automa/reports/G10-TRACKING-CHECKPOINT.md` — Stato tracking implementation
4. `automa/reports/G10-UX-INSEGNANTE.md` — Report simulazione insegnante
5. `automa/reports/G10-RICERCA-COMPLETA.md` — Risultati 4 ricerche parallele
6. `automa/reports/G10-VERIFICA-FINALE.md` — Verifica 6 layer completa
7. `automa/reports/G10-SCORES-HONEST.md` — Punteggi brutalmente onesti

Questi servono per:
- Mantenere contesto durante la sessione lunga (anti-drift)
- Documentare decisioni per future sessioni
- Prove concrete di lavoro fatto (non claims vuote)

---

## REGOLE SUBAGENT ORCHESTRATION

### Quando lanciare subagent paralleli
- Fase 1: 3 audit indipendenti → 3 subagent
- Fase 3: file indipendenti (studentTracker vs dashboard vs giochi) → 3 subagent
- Fase 6: 4 ricerche indipendenti → 4 subagent
- Fase 7: layer indipendenti → subagent dove possibile

### Quando NON parallelizzare
- Fase 2: architettura prima, implementazione dopo (sequenziale)
- Fase 5: fix dipendono dai bug trovati (sequenziale)
- Deploy: sempre sequenziale

### Pattern team
```
FASE → Brainstorm → Plan → Implement (parallel subagents) → Verify → Checkpoint doc
```

---

## HOOKS ATTIVI (settings.local.json)

3 safety hooks gia' configurati:
1. **PreToolUse/Bash #1**: Blocca `git reset --hard`, `git clean -fd`, `rm -rf /`, `DROP TABLE`
2. **PreToolUse/Bash #2**: Blocca accesso a `.env`, `.env.local`, `.git/config`, `.git/hooks`
3. **Stop**: Esegue `npm run build` — se il build FALLISCE, non puoi dichiarare "finito"

Hooks nel project settings.json (aggiuntivi):
- PreToolUse/Bash: blocca `npx vercel --prod` (deploy solo manuale)
- PreToolUse/Edit|Write: protegge file core (CircuitSolver, AVRBridge, avrWorker, SimulationManager, pinComponentMap, orchestrator.py)

---

## CHECKLIST FINALE (da spuntare SOLO con prove)

- [ ] Build passa (exit 0)
- [ ] Deploy HTTP 200
- [ ] 5 esperimenti caricano nel browser (screenshot)
- [ ] Teacher Dashboard 8 tab funzionano
- [ ] Dati studente da IndexedDB (NON mock)
- [ ] Touch targets >=44px (audit)
- [ ] WCAG AA contrasto (audit)
- [ ] Console 0 errori nuovi
- [ ] Bundle size <= G9 + 5%
- [ ] Galileo risponde (5 test)
- [ ] Scores PDR aggiornati (onesti)
- [ ] 7 documenti intermedi scritti
- [ ] STATE.md aggiornato
- [ ] handoff.md per G11

---

## PROMPT DA INCOLLARE

Copia e incolla questo nella prossima sessione Claude Code:

```
Sessione G10 ELAB Tutor — Marathon Session.

Leggi IMMEDIATAMENTE: PRODOTTO/elab-builder/automa/G10-MEGA-PROMPT.md

Questo e' il piano completo. Seguilo con liberta' ma rispettando le 8 fasi.

REGOLE ASSOLUTE:
1. NON FARE DEMO. Tutto deve funzionare DAVVERO.
2. MASSIMA ONESTA nei punteggi.
3. Crea i 7 documenti intermedi.
4. Usa subagent paralleli dove indicato.
5. La verifica finale (Fase 7) e' OBBLIGATORIA — 6 layer, niente scorciatoie.
6. Se il build non passa, non dichiarare "finito".

Inizia dalla FASE 0: Bootstrap.
```
