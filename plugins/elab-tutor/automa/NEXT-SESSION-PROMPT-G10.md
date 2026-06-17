# SESSIONE G10 — MEGA SESSION: Vol 3 Expansion + Quality Hardening + Innovation

```
cd "VOLUME 3/PRODOTTO/elab-builder"

SEI ELAB-TUTOR-LOOP-MASTER. Giorno 10. MEGA SESSION.

## REGOLA ASSOLUTA
**ZERO DEMO. ZERO DATI FINTI. ZERO MOCK.** Tutto deve funzionare con dati REALI.
Se mancano dati, costruisci l'infrastruttura per raccoglierli. Mai inventare.

## STATO VERIFICATO (fine G9)
- 62 lesson paths: Vol 1 (38) + Vol 2 (18) + Vol 3 (6)
- Teacher Dashboard: 8 tab incluso "Progresso PNRR" con matrice 62 esperimenti
- Quality Audit G9: 89% composite score (post-fix)
- 3 Safety Hooks attivi: PreToolUse destructive blocker, .env protector, Stop build gate
- ARIA semantics: tablist/tab/tabpanel, scope=col, aria-label su select
- console.log: 6 intenzionali (logger, voice, banner)
- Build: Exit 0 | Deploy: HTTP 200
- Regressioni G1-G9: ZERO
- PDR #6 Insegnante: 5.5/10

## CONTESTO IMMUTABILE
- Giovanni Fagherazzi = ex Global Sales Director ARDUINO
- PNRR deadline 30/06/2026 (3 MESI!)
- Andrea Marro = UNICO sviluppatore
- NON toccare: CircuitSolver, AVRBridge, evaluate.py, checks.py
- Palette: Navy #1E4D8C, Lime #558B2F
- SOLO OPUS 4.6 per agenti — ZERO Sonnet
- Budget: 50 euro/mese (Claude escluso)

## PIANO G10 — 4 BLOCCHI SEQUENZIALI

### BLOCCO 1: Vol 3 Expansion (8 esperimenti mancanti)
Il Volume 3 ha solo 6/14 esperimenti. Un insegnante che compra il kit Vol 3 trova il 43% del contenuto. INACCETTABILE per vendita PNRR.

**Esperimenti da aggiungere (dal volume fisico):**
1. Controlla uscita di ogni funzione (cap 7)
2. Sketch: funzioni e variabili (cap 8)
3. Operazioni aritmetiche e logiche (cap 9)
4. Cicli for e while (cap 10)
5. Array e sensori multipli (cap 11)
6. Comunicazione seriale avanzata (cap 12)
7. Progetto finale: stazione meteo (cap 13)
8. Progetto finale: robot evita-ostacoli (cap 14)

**Per OGNI esperimento:**
1. JSON lesson path con schema 16+ keys, 5 fasi (PREPARA/MOSTRA/CHIEDI/OSSERVA/CONCLUDI)
2. Aggiungere a experiments-vol3.js con componenti REALI
3. Aggiungere a lesson-paths/index.js
4. DAG chain next_experiment corretto
5. Durations 35-60min totali, fasi nei range
6. Vocab 10-14 anni, >= 2 analogie, >= 2 common mistakes
7. Action tags: loadexp in MOSTRA, play+highlight in OSSERVA

**Plugin/Skill da usare:**
- /arduino-simulator per validare componenti e pin
- /tinkercad-simulator per verificare layout breadboard
- Subagents paralleli: Agent A (cap 7-10) + Agent B (cap 11-14) + Agent C (index update)

### BLOCCO 2: Frontend Design Hardening

**Skill/Plugin:**
- /frontend-design per componenti modificati
- /quality-audit per verifica post-fix
- preview_start + preview_screenshot per verifica visuale

**Fix da applicare:**
1. WCAG: Orange/Cyan dove usati per testo -> varianti scure
2. aria-labels mancanti su garden plant cards (role=button, tabIndex, onKeyDown)
3. CSV formula injection defense (prepend tab a celle)
4. Error Boundary attorno a TeacherDashboard

### BLOCCO 3: Ricerca + Innovazione

- /ricerca-innovazione — PWA offline per scuole senza Wi-Fi
- /ricerca-idee-geniali — Feature breakthrough vs competitor
- Firecrawl: analizzare Tinkercad, Wokwi, Arduino Education per gap
- /ricerca-tecnica — Scratch integration con lesson paths

### BLOCCO 4: MEGA VERIFICATION (NON SALTARE MAI)

**CoV 14 Layer — TUTTI obbligatori:**

| Layer | Check | Come |
|-------|-------|------|
| L1 | JSON schema valid (70 files) | Python script |
| L2 | Vocab violations = 0 | audit script |
| L3 | Components cross-check vol3 | Subagent |
| L4 | DAG sequencing (70 nodi, 1 start, 0 cycles) | Python |
| L5 | Duration + action tags | audit script |
| L6 | Build Exit 0 + imports = 70 | npm run build |
| L7 | Browser test 10+ esperimenti | preview_eval + getLessonPath |
| L8 | Deploy HTTP 200 | vercel + curl |
| L9 | WCAG contrast colori testo | Python |
| L10 | Touch targets >= 44px | preview_snapshot |
| L11 | Console errors = 0 new | preview_console_logs |
| L12 | Lighthouse Performance >= 70 | Firecrawl |
| L13 | Print test PNRR report | browser print |
| L14 | Hook test: destructive blocked | bash test |

**Quality audit finale:** /quality-audit con score card
**Code review:** /code-review su file modificati
**Semplificazione:** /simplify su codice nuovo
**Debug:** /systematic-debugging se qualcosa si rompe
**Browser reale:** Control Chrome per test
**Prototipi:** Playground per test interattivi rapidi

## DOCUMENTI INTERMEDI (per contesto sessione lunga)
1. automa/G10-BLOCCO1-PROGRESS.md — dopo ogni esperimento
2. automa/G10-BLOCCO2-FIXES.md — dopo ogni fix
3. automa/G10-BLOCCO3-RESEARCH.md — findings ricerca
4. automa/G10-VERIFICATION-MATRIX.md — risultati CoV
5. automa/reports/G10-REPORT.md — report finale
6. automa/NEXT-SESSION-PROMPT-G11.md — handoff

**Dopo ogni blocco**: /clear e rileggere prompt + progress file.

## ORCHESTRAZIONE AGENTI

**Blocco 1 (paralleli):**
- Agent A: genera lesson paths cap 7-10 (4 JSON)
- Agent B: genera lesson paths cap 11-14 (4 JSON)
- Agent C: aggiorna experiments-vol3.js + index.js

**Blocco 4 (paralleli):**
- Agent V1: L1-L5 (schema, vocab, components, DAG, durations)
- Agent V2: L6-L8 (build, browser, deploy)
- Agent V3: L9-L14 (WCAG, touch, console, lighthouse, print, hooks)

## LEZIONI G1-G9
1. DAG: un next_experiment sbagliato orfana catene
2. Durations: 35-60min, applicare meccanicamente
3. Highlights: devono corrispondere a componenti reali
4. Cross-check: parser JS robusto (commenti rompono regex)
5. Browser test: preview_eval + getLessonPath = gold standard
6. console.log -> logger.debug (fatto G9)
7. WCAG: Navy/Text/TextMuted PASS, Orange/Cyan FAIL per testo
8. Touch targets: minHeight 44 su TUTTI i bottoni
9. ZERO DEMO — tutto con dati reali
10. /clear tra macro-feature previene context rot

## REFERENCE
- Build: export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH" && npm run build
- Deploy: export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH" && npx vercel --prod --yes
- Browser: preview_start + preview_eval + preview_screenshot
- Teacher: #teacher, tab "Progresso PNRR"
- Vol3 experiments: src/data/experiments-vol3.js (6 -> 14)
- Lesson paths: src/data/lesson-paths/index.js (62 -> 70)
- Audit: automa/audit_g8.py (aggiornare per 70)
- Hooks: .claude/settings.local.json (3 attivi)
- Quality audit: .team-status/QUALITY-AUDIT-G9.md
```
