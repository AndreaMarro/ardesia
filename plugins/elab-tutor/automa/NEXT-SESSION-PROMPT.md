# PROMPT PROSSIMA SESSIONE — Copia TUTTO qui sotto in una nuova sessione Claude Code

```
cd "VOLUME 3/PRODOTTO/elab-builder"

SEI ELAB-TUTOR-LOOP-MASTER. Giorno 1 del piano 2 settimane per UNLIM Mode.

## TASK
Continua il lavoro dalla sessione 27/03/2026. La Fase 0 (fix UX) è COMPLETATA.
Ora inizia la costruzione di UNLIM Mode: il layer sopra il prodotto esistente.

Prima di qualsiasi azione, leggi TUTTI i file nella sezione CONTEXT FILES.
Poi verifica lo stato (build, automa, deploy, score).
Poi lavora sugli obiettivi del Giorno 1.
Massima onestà. Usa superpowers. CoV su tutto.

## CONTEXT FILES — LEGGI PRIMA DI TUTTO (in ordine)

### A. Handoff e piano
1. automa/SESSION-HANDOFF-20260327.md — cosa è stato fatto, stato verificato, cosa non funziona
2. automa/MASTER-PLAN.md — piano 2 settimane con Fasi 0-4, assegnazioni, gate, anti-pattern
3. automa/NEXT-SESSION-PROMPT.md — questo file (per riferimento)

### B. Visione e design
4. automa/context/PRODUCT-VISION.md — bussola: 6 problemi UX, 3 pezzi UNLIM, priorità P0/P1, test di verità
5. automa/context/UNLIM-BRAIN-DESIGN.md — cervello pedagogico: cosa ha UNLIM (20 API verificate), cosa manca, 3 pezzi, sequenza, rischi
6. docs/plans/2026-03-27-unlim-brain-design.md — design doc approvato: 2 modalità, 8 componenti, piano 14 giorni

### C. Contesto progetto
7. automa/context/ELAB-COMPLETE-CONTEXT.md — committenti (Omaric/Franzoso/Fagherazzi), Principio Zero, riunioni, decisioni, obiettivi Andrea
8. automa/context/teacher-principles.md — fondamenta pedagogiche (Reggio Emilia, Montessori, effetto Protégé)
9. automa/context/volume-path.md — 3 volumi (Scoperta/Comprensione/Creazione), vocabolario progressivo
10. automa/context/ELAB-BIBLE.md — riassunto prodotto, stack, competitor, vantaggi unici
11. automa/context/project-history.md — storia S4→S119→Automa, lezione S9.5 (score gonfiato)

### D. Ricerca
12. automa/knowledge/competitor-lesson-structures.md — 197 righe: PhET (5E model), Tinkercad (workshop), Arduino CTC GO (20 sessioni)
13. automa/knowledge/gemini-lesson-template-v1-cap6-esp1.json — template percorso lezione 5 fasi da perfezionare
14. automa/knowledge/claude-mem-analysis.md — analisi plugin memoria persistente

### E. Stato runtime
15. automa/state/state.json — loop status, score, budget, bugs
16. automa/state/last-eval.json — ultimo composite score
17. automa/state/lessons.jsonl — tutte le lessons (ultime 10 righe)
18. automa/state/shared-results.md — output dei task scheduled e adversarial
19. automa/results.tsv — storico esperimenti keep/discard

### F. Automa e infra
20. automa/CONTEXT-PROTOCOL.md — protocollo 11 passi per tutti gli agenti
21. automa/orchestrator.py — loop brain (NON modificare senza motivo)
22. automa/checks.py — 7 check automatici (NON modificare)
23. automa/evaluate.py — ground truth metriche (NON modificare)
24. automa/tools.py — wrapper AI (call_gemini_cli, call_kimi, call_deepseek, etc.)
25. automa/parallel_research.py — ricerca Kimi parallela

### G. Prodotto — file chiave da conoscere
26. src/App.jsx — routing principale (useState-based, hash mapping)
27. src/components/tutor/ElabTutorV4.jsx — componente principale tutor (~3500 LOC)
28. src/components/tutor/ChatOverlay.jsx — chat UNLIM (ora minimizzata per default)
29. src/components/simulator/NewElabSimulator.jsx — simulatore principale (~1900 LOC, splittato)
30. src/components/simulator/panels/ControlBar.jsx — toolbar (progressive disclosure)
31. src/components/simulator/panels/LessonPathPanel.jsx — percorso lezione (668 LOC, da connettere)
32. src/components/simulator/hooks/useDisclosureLevel.js — hook progressive disclosure
33. src/components/ShowcasePage.jsx — homepage (redirect eliminato)
34. src/components/LandingPNRR.jsx — landing page PNRR (creata dall'automa)
35. nanobot/prompts/tutor.yml — prompt Galileo (max 3 frasi, 60 parole)
36. nanobot/prompts/shared-optimized.yml — regole Gulpease, struttura risposta
37. nanobot/server.py — backend Galileo (Mistral integrato, GDPR_EU_ONLY)
38. src/data/experiments-vol1.js — 38 esperimenti Volume 1
39. src/data/experiments-vol2.js — 18 esperimenti Volume 2
40. src/data/experiments-vol3.js — 11 esperimenti Volume 3

### H. Curriculum e dati
41. automa/curriculum/ — 61 file YAML con vocabolario progressivo, misconcezioni, teacher_briefing
42. src/data/unlim-knowledge-base.js — knowledge base UNLIM
43. src/styles/design-system.css — design tokens (colori, spacing, font)

## OBIETTIVI GIORNO 1-2

### 1. Template percorso lezione PERFETTO (v1-cap6-esp1)
- Prendi il template Gemini (file #13), perfezionalo
- Leggi il curriculum YAML per v1-cap6-esp1 (file #41)
- 5 fasi: PREPARA → MOSTRA → CHIEDI → OSSERVA → CONCLUDI
- Vocabolario corretto per Cap 6 (NO "resistenza", si introduce al Cap 7)
- Suggerimento docente concreto, domanda provocatoria per la classe
- Questo diventa il modello per l'automa per gli altri 66 esperimenti

### 2. Scheletro componenti React UNLIM Mode
Crea i file base (scheletro funzionante, non completo):
- src/components/unlim/UnlimWrapper.jsx — wrapper che nasconde/mostra UI classica
- src/components/unlim/UnlimMascot.jsx — mascotte ELAB nell'angolo (immagine statica + CSS glow)
- src/components/unlim/UnlimOverlay.jsx — messaggi contestuali (posizione + testo + fade)
- src/components/unlim/UnlimInputBar.jsx — barra input (testo + mic + invio)
- src/components/unlim/UnlimModeSwitch.jsx — bottone switch + localStorage

### 3. Deploy nanobot su Render
Le modifiche Mistral + Galileo brevità + /gdpr-status sono nel repo (file #37), servono in produzione.

### 4. L'automa genera percorsi lezione
Verifica che l'automa sia vivo (watchdog 30min lo rilancia).
Dagli task YAML specifici per generare percorsi lezione usando il template perfetto.

## REFERENCE
- Il prodotto ha un motore 8/10 (simulatore funziona) e UX 3/10 (troppa complessità)
- UNLIM Mode è un LAYER SOPRA il prodotto, non un rifacimento
- Le funzionalità restano circa le stesse — cambia fruizione ed estetica
- Nessun competitor ha AI dentro il simulatore (PhET=sandbox, Tinkercad=no AI, Arduino CTC=€1830)
- Palette: Navy #1E4D8C, Lime #7CB342, Vol1 verde, Vol2 arancione, Vol3 rosso
- La Prof.ssa Rossi (52 anni, zero esperienza) è il test di ogni modifica
- UNLIM = mascotte nell'angolo + messaggi overlay contestuali + barra input
- 2 modalità: UNLIM (default) + Classic (pulita, per esperti) + switch
- Sessioni salvate, report PDF, si scrive ovunque
- GDPR: Mistral EU + Brain locale. Mai dati minori su server USA.
- Budget: kit €75 + licenza €500-1000/anno. Target: TUTTE le scuole italiane.
- Committenti: Omaric (Franzoso), Fagherazzi (Raas Impact). Andrea = unico sviluppatore.

## RULES
1. Leggi SESSION-HANDOFF prima di tutto — non ripetere lavoro già fatto
2. Leggi MASTER-PLAN per sapere cosa fare oggi
3. Non toccare CircuitSolver, AVRBridge, evaluate.py, checks.py — funzionano
4. Build DEVE passare dopo ogni modifica (npm run build)
5. Massima onestà — se qualcosa non funziona, dillo
6. Committi e pusha spesso — il lavoro non committato si perde
7. Usa superpowers per audit e CoV
8. Il test è sempre: "La Prof.ssa Rossi lo capirebbe in 5 secondi?"
9. Non montarti la testa — il prodotto UNLIM non esiste ancora, siamo al Giorno 1
10. Deploy Vercel dopo ogni gruppo di fix significativo

## PLAN
1. Leggi TUTTI i 43 file di contesto elencati sopra
2. Verifica stato: automa vivo? build passa? deploy aggiornato? score?
3. Perfeziona template percorso lezione v1-cap6-esp1
4. Crea scheletro 5 componenti React UNLIM Mode
5. Integra UnlimWrapper in ElabTutorV4 + switch funzionante
6. Deploy nanobot su Render
7. Dai all'automa task per generare percorsi lezione
8. Audit + CoV con superpowers
9. Scrivi SESSION-HANDOFF per la sessione successiva

## OUTPUT
Alla fine della sessione:
- Template percorso lezione perfetto e testato
- 5 componenti React funzionanti (scheletro)
- Switch UNLIM/Classic funzionante
- Nanobot deployato con Mistral + brevità
- L'automa sta generando percorsi lezione
- Tutto committato e pushato
- SESSION-HANDOFF scritto per continuità
```
