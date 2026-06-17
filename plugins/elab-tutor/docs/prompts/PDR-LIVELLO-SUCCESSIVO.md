# PDR — ELAB Tutor: Livello Successivo

> Versione: 2.0 | Data: 04/04/2026
> Prerequisito: Post-PDR Session 2 completata (27 bug fixati, 1430/1430 test, deploy LIVE)
> Durata: Ralph Loop max 100 iterazioni
> Obiettivo: Score composito >= 8.5/10 con 95% stress test PASS

---

## PRINCIPI IMMUTABILI (violazione = REVERT immediato)

1. **PRINCIPIO ZERO**: Solo il docente usa ELAB Tutor davanti alla classe sulla LIM. Gli studenti guardano e partecipano. Ogni scelta UX deve servire il docente che spiega.
2. **ZERO REGRESSIONI**: `npx vitest run` + `npm run build` DOPO OGNI singolo fix. Se falliscono, REVERT immediato e root cause analysis.
3. **ENGINE INTOCCABILE**: MAI modificare CircuitSolver.js, AVRBridge.js, SimulationManager.js, avrWorker.js.
4. **ZERO DEMO/MOCK**: Tutto deve funzionare con dati reali. Mai dati finti.
5. **ONESTA BRUTALE**: Mai auto-assegnare score >7 senza evidenza runtime (screenshot/console/network). Ogni score deve avere PROVA.
6. **COV OBBLIGATORIA**: Chain of Verification dopo OGNI ciclo. Quality audit ogni 5 cicli.
7. **ANTI-INFLAZIONE**: Il self-score delle sessioni precedenti era inflato di ~2 punti. Score reale attuale: 6.9/10. NON credere ai self-score.

---

## FASE 0 — BOOTSTRAP COMPLETO (Obbligatorio, 1 sola volta)

### 0.1 Leggi TUTTO il contesto (IN ORDINE)
```
1. CLAUDE.md (architettura, regole, stack)
2. Memory MEMORY.md (indice sessioni)
3. Memory architecture.md (paths, deploy, palette)
4. Memory unlim-vision-core.md (visione UNLIM)
5. Memory simulator-notes.md (architettura simulatore)
6. Memory G45-audit-brutale.md (audit onesto 5.8/10)
7. Memory pdr-session-04apr2026.md (PDR 17 iter)
8. docs/NEXT-STEPS-POST-PDR.md (stato attuale)
9. docs/BUG-LIST-COMPLETA.md (27 fix + 6 aperti)
10. docs/STRESS-TEST-RISULTATI.md (30 scenari E2E)
11. docs/MAPPING-VOLUMI-APP.md (91 esperimenti mapping)
12. docs/BENCHMARK-100-PARAMETRI.md (110 dimensioni)
```

### 0.2 Anti-regressione (TUTTI devono passare)
```bash
npx vitest run                           # DEVE essere 1430/1430
npm run build                            # DEVE passare, 30+ precache
curl -s https://www.elabtutor.school     # DEVE ritornare HTTP 200
curl -s https://elab-galileo.onrender.com/health  # status:ok
```
Se QUALSIASI check fallisce → FIX PRIMA di continuare.

### 0.3 Mappa il sistema completo
Con Explore agent, mappa OGNI funzionalita:
```
src/components/simulator/     → Simulatore (Canvas, Engine, Panels, Overlays)
src/components/lavagna/       → Lavagna (Shell, Header, Toolbar, Panels)
src/components/tutor/         → Tutor (ElabTutorV4, ChatOverlay, Tabs)
src/components/unlim/         → UNLIM (Wrapper, InputBar, Mascot, Report)
src/components/teacher/       → Dashboard docente
src/components/student/       → Dashboard studente
src/data/experiments-vol*.js  → Dati esperimenti (91 totali)
src/data/lesson-paths/        → 64 percorsi lezione JSON
src/services/                 → API, sync, voice, simulator-api, memory
```
Per OGNI area: documenta cosa funziona, cosa no, cosa manca.

---

## FASE 1 — ALLINEAMENTO ESPERIMENTI (Critico)

### Problema
L'app ha 91 esperimenti ma molti sono FRAMMENTI dello stesso esperimento del libro.
Esempio: il libro ha "Dimmer LED con potenziometro" e l'app ha 9 sotto-esperimenti.
Il libro e la FONTE DI VERITA. L'app deve avere SOLO gli esperimenti del libro.

### Azione
1. Leggi `docs/MAPPING-VOLUMI-APP.md` — tabella completa mapping
2. Per OGNI esperimento nell'app, verifica:
   - Titolo IDENTICO al libro
   - Componenti IDENTICI al libro
   - Schema circuitale IDENTICO al libro
   - Codice Arduino (Vol3) IDENTICO al libro
   - Steps di montaggio IDENTICI al libro
3. Identifica frammenti: dove l'app ha spezzato un esperimento in piu parti
4. Decisione per ogni frammento:
   - Se il frammento e una FASE dello stesso esperimento → UNISCILO nell'esperimento padre come step interno
   - Se e un esperimento SEPARATO nel libro → MANTIENILO
   - Se NON ESISTE nel libro → RIMUOVILO o marcalo come "bonus"
5. Verifica che il NUMERO FINALE corrisponda ai libri (Vol1: ~37, Vol2: ~25, Vol3: ~26)

### CoV Fase 1
```bash
npx vitest run  # DEVE passare (se hai cambiato numero esperimenti, aggiorna i test)
npm run build   # DEVE passare
# Conta esperimenti: DEVE corrispondere ai libri
```

---

## FASE 2 — SIMULATORE ARDUINO: DEBUG SISTEMATICO

### 2.1 Compilatore C++ (avr8js)
Per OGNI esperimento Vol3 con code !== null:
1. Carica via Control Chrome su https://www.elabtutor.school
2. Apri tab "Arduino C++" → verifica codice presente
3. Clicca "Compila & Carica" → DEVE compilare senza errori
4. Play → LED/Servo/LCD DEVONO rispondere
5. Serial Monitor → output corretto
6. Se metto codice SBAGLIATO → DEVE mostrare errore comprensibile

### 2.2 Scratch/Blockly
Per OGNI esperimento Vol3:
1. Passa alla tab "Blocchi"
2. Categorie visibili: Decisioni, Ripeti, Accendi e Spegni, Numeri, Variabili, Testo, Suoni, Motore Servo, Schermo LCD, Tempo, Comunicazione, Sensori
3. Crea un programma Blink con blocchi
4. Compila & Carica dalla vista Blocchi
5. Codice C++ generato DEVE essere corretto
6. Compilazione DEVE avere successo
7. LED DEVE lampeggiare
8. Blocchi sbagliati → errore chiaro, NON crash

### 2.3 Fisica degli oggetti — Stress test severo
```
Per OGNI esperimento (tutti i 3 volumi):
1. Carica esperimento → componenti montati correttamente
2. Trascina componente dalla palette → snap ai buchi della breadboard
3. Sposta componente → TUTTI i fili collegati DEVONO seguirlo
4. Collega filo tra due pin → contatto elettrico funzionante
5. Collega filo nel punto SBAGLIATO → NON DEVE funzionare
6. Rimuovi filo → circuito si aggiorna
7. Undo/Redo → funziona senza crash
8. Zoom in/out → layout coerente
9. 15 componenti contemporanei → NESSUN rallentamento
10. Play/Stop → transizione pulita
11. Snap tolerance: non serve essere millimetrici, buco piu vicino
12. Niente salti o trascinamenti casuali
13. Pin cliccabili facilmente (min 44px touch target)
14. NO inerzia strana nel drag
15. Su tablet touch: drag DEVE funzionare con il dito
```

---

## FASE 3 — RESPONSIVE SU SITO LIVE (Control Chrome + preview_resize)

Per OGNI schermata (experiment picker, simulatore, Scratch editor, Dashboard):

### LIM 1024x768
- Tutti gli elementi visibili e utilizzabili
- Font >= 14px (leggibili dalla classe a 3 metri)
- Toolbar e palette accessibili
- Nessun elemento tagliato

### iPad 768x1024
- Touch targets >= 44px
- Nessun overflow orizzontale
- Sidebar retrattile funzionante
- Tutti gli elementi raggiungibili con il dito

### PC 1920x1080
- Layout spacious, circuito auto-fit
- Sidebar aperta di default
- Canvas centrato con margini adeguati

OGNI problema trovato → FIX IMMEDIATO → ri-verifica.

---

## FASE 4 — UNLIM ONNIPOTENTE

### 4.1 Il problema principale
Il codice frontend (parser AZIONE + INTENT + API 58 metodi) e CORRETTO.
Il problema: il backend Gemini (nanobot) NON SEMPRE emette i tag [AZIONE:...] e [INTENT:{...}].
Serve: fix nel prompt del nanobot O post-processing client-side.

### 4.2 Verifica 30 scenari E2E
Usa Control Chrome su https://www.elabtutor.school:
Per OGNI scenario (vedi sezione 5.4 del PDR precedente):
1. Scrivi nella chat UNLIM
2. Aspetta risposta (max 30s per cold start Render)
3. Verifica che l'AZIONE sia stata eseguita
4. Screenshot come prova
5. Se FAIL: root cause + fix immediato + ri-test
Target: 28/30 PASS (era 25/30, dobbiamo migliorare).

### 4.3 Fix specifici UNLIM
- Scenario 8 (circuitState): nanobot 500 → fix payload size o chunking
- Scenario 26-28 (hallucination): aggiungere guardrail client-side
- PercorsoPanel: DEVE aprirsi come FloatingWindow separata (MASSIMA PRIORITA)
- Barra componenti: NASCONDERE in modalita Libero
- Pannelli inline (lezione, chat): renderli ridimensionabili

---

## FASE 5 — MODALITA "MONTA TU" (Build Mode Perfetto)

### Architettura
1. Selezionabile dal tab "Passo Passo" nell'header
2. Pannello laterale ALLARGABILE/NASCONDIBILE/POSIZIONABILE con le istruzioni
3. Istruzioni GENERATE dai dati dell'esperimento + lesson-paths/*.json + volumi
4. Ogni step: testo chiaro, componente da piazzare, posizione suggerita
5. Il pannello NON DEVE sovrapporre il canvas (Principio Zero: no overlay cognitivo)
6. Il docente puo allargare/ridurre/nascondere il pannello come vuole
7. Quando uno step e completato, il prossimo si illumina
8. Feedback visivo: corretto = verde, sbagliato = arancione (MAI rosso = ansia)

### Stress test UX
- Il pannello NON deve coprire il circuito
- Su LIM il pannello deve essere leggibile da 3 metri (font >= 16px)
- Il pannello deve essere nascondibile con UN click
- I testi devono usare linguaggio 10-14 anni
- Se l'esperimento non ha lesson-path, la modalita NON DEVE crashare

---

## FASE 6 — BENCHMARK 100 DIMENSIONI ULTRA-SEVERE

Dopo OGNI ciclo di fix, misura TUTTE le dimensioni con EVIDENZA RUNTIME.
OGNI dimensione: score 0-10 con screenshot/log/curl come PROVA OBBLIGATORIA.
Target: media >= 8.5/10 con ZERO dimensioni < 5.

---

### A. SIMULATORE CORE (15 dimensioni)
1. Tutti gli esperimenti caricano senza crash (target: 91/91)
2. Tutti i Vol3 con codice compilano (target: 25/25)
3. Play/Stop funziona su tutti gli esperimenti
4. Drag componente → snap corretto a buco breadboard piu vicino
5. Sposta componente → TUTTI i fili collegati seguono
6. Collega filo tra due pin → contatto elettrico verificabile
7. Collega filo nel punto SBAGLIATO → circuito NON funziona
8. Rimuovi filo → circuito si aggiorna istantaneamente
9. Undo/Redo 10 operazioni sequenziali → stato perfetto
10. Zoom in/out → layout coerente, nessun elemento sparisce
11. 15 componenti contemporanei (Simon Says) → nessun rallentamento
12. LED acceso con simulazione running → colore corretto
13. Potenziometro → overlay rotazione funzionante
14. LDR → slider luce funzionante
15. Serial Monitor → output Arduino visibile e corretto

### B. SCRATCH/BLOCKLY (10 dimensioni)
16. 12 categorie visibili: Decisioni, Ripeti, Accendi e Spegni, Numeri, Variabili, Testo, Suoni, Motore Servo, Schermo LCD, Tempo, Comunicazione, Sensori
17. Drag blocco da palette → inserimento nel workspace
18. Programma Blink (accendi pin 13, attendi 1s, spegni, attendi 1s) → compila
19. Codice C++ generato da Scratch → sintatticamente corretto
20. Compilazione da Scratch → HEX valido → simulazione funziona
21. Blocchi sbagliati (pin inesistente) → errore chiaro, NO crash
22. Switch Arduino↔Scratch → preserva stato (non perde blocchi)
23. Scratch fullscreen → toggle funzionante
24. Categorie in italiano kid-friendly (non termini tecnici)
25. Palette colori ELAB (Navy=control, Lime=I/O, Orange=tempo, Red=comm)

### C. COMPILATORE C++ (5 dimensioni)
26. Codice corretto → compilazione OK con dimensione flash mostrata
27. Codice con errore sintattico → errore tradotto in italiano bambino-friendly
28. Codice con warning → warning mostrato separatamente dagli errori
29. Errore con numero riga → evidenziazione riga nell'editor
30. Retry compilazione dopo errore → funziona senza reload

### D. UNLIM AI (15 dimensioni)
31. "Monta il circuito del LED" → componenti appaiono (INTENT eseguito)
32. "Aggiungi un buzzer" → buzzer appare sul canvas
33. "Rimuovi il buzzer" → buzzer scompare
34. "Pulisci tutto" → canvas vuoto
35. "Monta il semaforo" → circuito completo caricato
36. "Compila il codice" → compilazione avviata (AZIONE:compile)
37. "Mostra i blocchi Scratch" → tab Scratch attiva
38. "Apri il Serial Monitor" → pannello aperto
39. "Vai al capitolo 7" → experiment picker aperto su cap 7
40. "Spiega la Legge di Ohm" → risposta con analogia kid-friendly
41. "Cosa abbiamo fatto la volta scorsa?" → memoria cross-sessione
42. "Prepara la lezione di oggi" → lesson prep con contesto RAG
43. Risposta < 30s (incluso cold start Render)
44. 3 comandi rapidi in sequenza → tutti eseguiti senza crash
45. Input vuoto o vago → risposta garbata senza crash/hallucination

### E. PERCORSO LEZIONE / MONTA TU (10 dimensioni)
46. PercorsoPanel si apre come FloatingWindow separata (drag, resize, minimize)
47. Percorso lezione mostra 5 fasi (Introduzione, Monta, Programma, Esperimenta, Rifletti)
48. Ogni fase ha testo chiaro, font >= 16px
49. Pannello NON sovrappone il canvas del circuito
50. Pannello nascondibile con UN click
51. Pannello allargabile/riducibile con drag handle
52. "Monta tu" → step-by-step con componente evidenziato
53. Step completato → prossimo step si illumina (animazione)
54. Feedback: corretto = verde, sbagliato = arancione (mai rosso)
55. Esperimento senza lesson-path → modalita non crasha

### F. ESPERIMENTI / DATI (10 dimensioni)
56. Numero esperimenti corrisponde ai libri (Vol1:~37, Vol2:~25, Vol3:~26)
57. Titoli IDENTICI ai libri fisici
58. Componenti IDENTICI ai libri fisici
59. Schema circuitale IDENTICO ai libri
60. Codice Arduino (Vol3) IDENTICO ai libri
61. Steps di montaggio presenti e corretti
62. Quiz presente per ogni esperimento
63. Difficolta (1-5) assegnata correttamente
64. Concetti collegati (concept graph) presenti
65. Lesson path JSON presente per ogni esperimento

### G. UX LAVAGNA (10 dimensioni)
66. AppHeader glassmorphism con nome esperimento visibile
67. FloatingToolbar 7 icone funzionanti (Select, Filo, Elimina, Annulla, Ripeti, Penna, +)
68. Select tool → seleziona componente con click
69. Filo tool → disegna filo tra due pin
70. Elimina tool → cancella componente selezionato
71. Toolbar Annulla/Ripeti → sincronizzato con stato simulatore
72. Barra componenti NASCOSTA in modalita "Libero" (solo canvas pulito)
73. Experiment Picker → ricerca testo + filtro volume funzionante
74. 3 modalita (Gia Montato / Passo Passo / Libero) → switch senza crash
75. UNLIM mascotte cliccabile → apre chat

### H. RESPONSIVE (10 dimensioni)
76. LIM 1024x768: ZERO overflow orizzontale
77. LIM 1024x768: font >= 14px su TUTTI gli elementi
78. LIM 1024x768: toolbar e sidebar accessibili
79. iPad 768x1024: touch targets >= 44px su TUTTI i bottoni
80. iPad 768x1024: swipe per aprire/chiudere sidebar
81. iPad 768x1024: drag componenti funziona con touch
82. PC 1920x1080: canvas auto-fit centrato
83. PC 1920x1080: sidebar aperta di default
84. Nessun elemento tagliato a NESSUNA risoluzione
85. Rotazione iPad landscape↔portrait → layout si adatta

### I. PERFORMANCE (5 dimensioni)
86. Build time < 60 secondi
87. Bundle precache < 3000 KiB
88. Precache entries >= 30
89. First Contentful Paint < 3s su 4G simulato
90. Nessun chunk > 2MB (warning Rollup accettabile, non blocking)

### J. SICUREZZA / GDPR (5 dimensioni)
91. Consent banner visibile al primo accesso
92. Dati studente in localStorage (non esposti in URL)
93. API keys NON esposte nel codice frontend (solo .env)
94. Supabase RLS attivo (anon puo INSERT/SELECT solo con class_key)
95. Nessun dato personale inviato a servizi terzi senza consenso

### K. INTEGRITA / ANTI-REGRESSIONE (5 dimensioni)
96. npx vitest run → 1430+ test PASS (ZERO fallimenti)
97. npm run build → PASS con zero errori
98. curl https://www.elabtutor.school → HTTP 200
99. curl nanobot /health → status:ok
100. git diff dopo ogni fix → SOLO file intenzionalmente modificati

---

### PROTOCOLLO ANTI-REGRESSIONE (eseguire DOPO OGNI singolo fix)

```bash
# STEP 1: Test unitari (BLOCCANTE)
npx vitest run
# Se FALLISCE → REVERT immediato con: git checkout -- <file>
# NON procedere finche non e 1430/1430

# STEP 2: Build (BLOCCANTE)
npm run build
# Se FALLISCE → REVERT immediato
# Deve mostrare "precache N entries" e "built in Xs"

# STEP 3: Conta file src/ (BLOCCANTE)
find src -type f | wc -l
# DEVE essere >= 347 (baseline). Se file sono SPARITI → STOP e investiga

# STEP 4: Engine check (BLOCCANTE)
# Verifica che questi file NON siano stati modificati:
git diff --name-only | grep -E "CircuitSolver|AVRBridge|SimulationManager|avrWorker"
# Se QUALCUNO appare → REVERT IMMEDIATO. Engine e SACRO.

# STEP 5: Console errors (INFORMATIVO)
# Via preview tools: console errors dopo aver caricato un esperimento
# Zero errori = OK. Errori React hooks in dev = accettabile.
# Errori runtime (TypeError, ReferenceError) = BLOCCANTE, fixare.
```

### PROTOCOLLO CoV (Chain of Verification — dopo OGNI ciclo)

```
1. Rileggi cosa hai modificato in questo ciclo
2. Verifica che il fix sia MINIMALE (un cambio alla volta)
3. Verifica che il fix risolva il problema segnalato
4. Verifica che NON abbia introdotto side effects
5. Verifica che i test passino (step 1-4 sopra)
6. Se il fix e > 50 righe → chiedi se serve refactoring o se stai overengineering
7. Documenta: file modificato, riga, cosa hai cambiato, perche
```

### PROTOCOLLO QUALITY AUDIT (ogni 5 cicli)

```
Lancia 3 agenti indipendenti in parallelo:
1. Agente SECURITY: verifica CSP, API keys, RLS, consent
2. Agente WCAG: verifica font sizes, contrast, touch targets, focus rings
3. Agente EXPERIMENTS: carica 5 esperimenti random, verifica montaggio + compilazione

Ogni agente deve dare score 0-10 con evidenza.
Score composito = media 3 agenti.
Se composito < 7 → prioritizza i fix prima di continuare.
```

---

## REGOLE RALPH LOOP

```
MAX ITERAZIONI: 100
COMPLETAMENTO: Score >= 8.5/10 E 95% stress test PASS

Ogni iterazione:
1. Identifica il problema PIU GRAVE (score piu basso)
2. Root cause analysis (MAI fix senza capire)
3. Fix MINIMALE (un cambio alla volta)
4. npx vitest run → DEVE passare
5. npm run build → DEVE passare
6. Verifica via Control Chrome/preview tools
7. CoV: rileggi cosa hai fatto, verifica coerenza

Ogni 5 iterazioni:
- Quality audit completo (3+ agenti)
- Aggiorna docs/BUG-LIST-COMPLETA.md
- Benchmark 20 dimensioni

Ogni 10 iterazioni:
- Screenshot di conferma OGNI area
- Aggiorna docs/BENCHMARK-100-PARAMETRI.md
- Aggiorna docs/STRESS-TEST-RISULTATI.md

CONDIZIONE DI USCITA:
- 95% stress test PASS
- Benchmark media >= 8.5/10
- UNLIM 28/30 azioni funzionanti
- Zero crash in nessun scenario
- Tutti gli esperimenti dei volumi perfettamente funzionanti
- "Monta tu" funzionante su LIM/iPad/PC
- Scratch compila e funziona
- Fisica oggetti supera tutti i 15 test
```

---

## SKILLS DA USARE (OBBLIGATORIE)

```
/systematic-debugging    — Per ogni bug trovato
/debug                   — Debug strutturato
/architecture            — Decisioni architetturali
/frontend-design         — UX/UI design
/using-superpowers       — Coordinamento generale
/elab-quality-gate       — Gate pre/post sessione
/ricerca-bug             — Ricerca sistematica bug
/analisi-simulatore      — Debug simulatore circuiti
/lim-simulator           — Test su LIM 1024x768
/impersonatore-utente    — Simula docente + classe
/analisi-statistica-severa — Benchmark severo
/lavagna-benchmark       — Benchmark lavagna
/firecrawl               — Web scraping e analisi
```

## TOOLS TASSATIVI

```
- Control Chrome — navigare il sito LIVE https://www.elabtutor.school
- Preview tools — screenshot, click, fill, resize, console, network
- Playwright via Bash — test automatizzati E2E
- curl — verifiche API Supabase/Nanobot
- OGNI test deve avere screenshot come prova
```

---

## STATO ATTUALE (04/04/2026)

### Score onesto: 6.9/10
| Area | Score | Target |
|------|-------|--------|
| Simulatore core | 7.3 | 8.5 |
| Lavagna UX | 6.9 | 8.5 |
| UNLIM AI | 7.0 | 8.5 |
| Pedagogico | 7.2 | 8.5 |
| Dashboard/GDPR | 5.7 | 8.0 |
| Performance | 6.7 | 8.0 |
| Responsive | 6.2 | 8.0 |
| Security | 5.7 | 7.5 |
| Visual | 6.7 | 8.5 |
| Build/Test | 8.5 | 9.0 |

### Env vars e endpoints
- Supabase URL: https://vxvqalmxqtezvgiboxyv.supabase.co
- Supabase Anon Key: in .env (VITE_SUPABASE_ANON_KEY)
- Nanobot: https://elab-galileo.onrender.com
- Deploy: npm run build && npx vercel --prod --yes
- Test: npx vitest run
- Build: npm run build
- Budget: 50 euro/mese (Claude escluso)

### Engine INTOCCABILE
- CircuitSolver.js (1702 righe) — Solver DC, Union-Find + MNA/KCL
- SimulationManager.js (302 righe) — Orchestratore
- AVRBridge.js (1051 righe) — Bridge avr8js
- avrWorker.js (348 righe) — Web Worker CPU AVR

### Bug aperti prioritari
1. PercorsoPanel non si apre come FloatingWindow separata (P0 UX)
2. UNLIM backend non emette sempre i tag AZIONE/INTENT (P0 funzionale)
3. Barra componenti visibile in modalita Libero (P1 UX)
4. Pannelli inline non ridimensionabili (P1 UX)
5. Hooks order violation NewElabSimulator (P2 dev-only)
6. Nanobot 500 su circuitState complesso (P2)
