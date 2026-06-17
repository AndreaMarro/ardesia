# PROMPT — Configura e Attiva il Loop ELAB

> **Leggi PRIMA di fare qualsiasi cosa. Non saltare nessun passo. Non fermarti mai.**

---

## CHI SEI
Sei l'ingegnere che costruisce e attiva il sistema autonomo di ELAB Tutor. Lavori con massima onestà, zero compiacenza, zero teatro architetturale. Se qualcosa non funziona, lo dici. Se qualcosa è inutile, lo dici. Output concreti, funzionanti, testati. Mai documenti senza codice che gira.

## CONTESTO DA LEGGERE (in ordine)
1. `automa/PDR.md` — piano di riferimento con priorità e vincoli
2. `automa/context/teacher-principles.md` — principio zero: insegnante = utente reale
3. `automa/context/volume-path.md` — percorso volumi e vocabolario progressivo
4. `automa/context/tools-config.md` — modelli, API key, endpoint, budget
5. `automa/knowledge/INDEX.md` — indice delle 23 ricerche (leggi quelle rilevanti al task corrente)
6. `automa/STATE.md` — stato attuale onesto del progetto
7. `automa/handoff.md` — cosa è stato fatto nella sessione precedente

## PRINCIPIO ZERO
L'insegnante è il vero utente. Galileo è un libro intelligente e una guida invisibile. Tutti possono insegnare con ELAB Tutor. L'insegnante impara mentre insegna. Il linguaggio sulla LIM è SEMPRE 10-14 anni. Galileo segue i volumi ELAB — non usa mai termini di capitoli futuri. Mai paternalistico, mai si sostituisce all'insegnante.

## VINCOLI NON NEGOZIABILI
- ZERO REGRESSIONI — `npm run build` deve passare sempre. Ogni fix viene ri-testato.
- USA Skills, Skill Creator, Superpowers in ogni task
- USA Gemini 2.5 Pro / Gemini 3 DeepThink per decisioni complesse
- GRAFICI MD giornalieri con score trend, delta, costo — brutale onestà
- BUDGET €50/mese totale (escluso abbonamento Claude)
- SOLO ELAB Tutor + vetrina. MAI sito Netlify.
- iPad e LIM sono vincoli centrali
- CoV (Chain of Verification) su ogni output

## COSA DEVI FARE — SENZA PAUSE

### FASE 0: Riordino (30 min)
1. Ristruttura `MEMORY.md` da 309→80 righe (indice con puntatori)
2. Crea `state.json` machine-readable con scores, issues, deploy status
3. Crea `handoff.md` strutturato
4. Verifica che `automa/knowledge/` abbia tutte le 23 ricerche indicizzate
5. `npm run build` — deve passare. Se non passa, fixa prima di tutto.

### FASE 1: Implementa l'Orchestratore (2h)
Crea questi file in `automa/`:

**`orchestrator.py`** — il cuore:
- Esegue 7 check veloci (Python puro, 3 min)
- Compone prompt con risultati + stato + coda task
- Lancia `claude -p` headless che LAVORA (max 25 min)
- Salva report JSON + aggiorna state.json
- Gestisce budget token giornaliero
- Include 1 micro-ricerca per ciclo (Semantic Scholar o Gemini)

**`checks.py`** — i 7 check:
1. Health: curl nanobot + vercel + brain VPS (15s)
2. Build: `npm run build` (30s)
3. Galileo: 10 messaggi al nanobot, verifica tag + italiano (60s)
4. Content: 62 esperimenti integri — pin, steps, quiz (5s)
5. Gulpease: leggibilità risposte Galileo ≥60 (5s)
6. Browser: Playwright carica exp, play, verifica LED (30s)
7. iPad: Playwright resize 1024x768, overflow?, touch ≥56px? (15s)

**`tools.py`** — wrapper API per:
- DeepSeek R1: `call_deepseek_reasoner(prompt)` — scoring, judge
- Gemini 2.5 Pro: `call_gemini(prompt, images=None)` — vision, ricerca, thinking
- Gemini 3 DeepThink: `call_gemini_deepthink(prompt)` — decisioni complesse
- Kimi K2.5: `call_kimi(prompt)` — review, secondo parere
- Brain V13: `call_brain(message, context)` — routing test
- Semantic Scholar: `search_papers(query)` — paper scan
- AutoResearchClaw: `launch_research(topic)` — deep research

**`queue_manager.py`** — gestione coda:
- Legge/scrive `queue/pending/`, `queue/active/`, `queue/done/`
- Priorità P0 > P1 > P2
- Content-hash dedup (mai lavoro duplicato)

**`vocab_checker.py`** — verifica vocabolario per volume:
- Carica VOLUME_VOCABULARY dict
- Per ogni risposta Galileo: controlla che non usi termini vietati per quel capitolo

**`start.sh`** — avvia tutto:
```bash
#!/bin/bash
# Verifica prerequisiti
# Avvia orchestrator in background
# Configura launchd per watchdog
# Primo ciclo immediato
```

**`watchdog.sh`** — supervisore:
```bash
#!/bin/bash
# Ogni 10 min: heartbeat fresco?
# Se morto: riavvia dispatcher
# Se Mac dorme: caffeinate
# Se disco pieno: pulisci log vecchi
```

**`com.elab.orchestrator.plist`** — launchd config per macOS

**`.env`** — API keys (da context/tools-config.md)

### FASE 2: Popola la coda iniziale (30 min)
Crea task in `queue/pending/` per tutti i P0 e P1 dal PDR:
- P0-001-brain-nanobot.yaml
- P0-002-deploy-vercel.yaml
- P0-003-curriculum-yaml-vol1-cap6.yaml
- P1-001-classi-simulate.yaml
- P1-002-ipad-lim-fix.yaml
- P1-003-pwa-offline.yaml
- P1-004-scratch-blocks.yaml
- P1-005-error-translation.yaml
- P1-006-teacher-pre-lesson.yaml
- P1-007-vocab-checker.yaml
- (e tutti gli altri dal PDR)

### FASE 3: Primo ciclo (30 min)
1. Esegui `python3 automa/orchestrator.py` manualmente
2. Verifica che i 7 check passino
3. Verifica che Claude Code headless prenda il primo task e ci lavori
4. Verifica che il report JSON venga scritto
5. Verifica che state.json venga aggiornato
6. SE QUALCOSA FALLISCE → fixa e riesegui. Non andare avanti.

### FASE 4: Attiva il loop automatico (15 min)
1. `bash automa/start.sh`
2. Verifica che il watchdog sia attivo (`launchctl list | grep elab`)
3. Verifica che il prossimo ciclo sia schedulato
4. Scrivi il primo `reports/YYYY-MM-DD-cycle-1.json`
5. Scrivi il primo grafico score trend in `reports/score-trend.md`

### FASE 5: Non fermarti (continua)
Il loop gira. Tu continui a lavorare su P0/P1 in questa sessione:
- Collega Brain V13 al nanobot (1 env var su Render)
- Deploy Vercel
- Crea i primi 3 curriculum YAML (Vol1 Cap6)
- Fixa touch target iPad
- Implementa Gulpease check nel nanobot

## COME USARE I TOOL DURANTE IL LAVORO
- **Per ogni feature/fix**: usa la skill `superpowers:test-driven-development`
- **Per ogni bug**: usa la skill `superpowers:systematic-debugging`
- **Per decisioni complesse**: chiama Gemini 3 DeepThink
- **Per review**: chiama Kimi K2.5
- **Per scoring risposte**: chiama DeepSeek R1
- **Per cercare soluzioni**: Semantic Scholar API + AutoResearchClaw se serve deep dive
- **Per test browser**: Playwright o Control Chrome MCP
- **Per creare nuove skill**: usa `skill-factory`
- **Per qualità**: usa `quality-audit` periodicamente
- **Per Arduino**: usa skill `arduino-simulator`
- **Per Scratch**: usa skill specifiche + research-arduino-scratch.md
- **Prima di finire qualsiasi cosa**: usa `superpowers:verification-before-completion`

## REPORT GIORNALIERO (scritto alla fine di ogni giorno)
```markdown
## Score Trend — DD/MM/YYYY

Simulatore funz  ████████████████████ 10.0 (=)
AI Integration   ████████████████████ 10.0 (=)
iPad             █████████████████▌   8.7  (+0.2)
...

Cicli oggi: N | Task completati: N | Ricerche: N
Costo oggi: €X.XX | Budget rimanente: €XX.XX/mese
Honest: "valutazione brutalmente onesta"
```

## HANDOFF (scritto alla fine della sessione)
```markdown
# Session Handoff — S117 → S118
## Cosa fatto
## Cosa NON fatto
## Decisioni prese
## File cambiati
## Prossima sessione deve
## Warning / Gotcha
```

## REGOLE FINALI
- Non chiedermi conferma — LAVORA
- Se qualcosa si rompe — FIXALO
- Se non sai — CERCA (Semantic Scholar, Gemini, AutoResearchClaw)
- Se il budget giornaliero finisce — solo task gratuiti (Playwright, Python, build)
- Se il Mac va in sleep — caffeinate lo previene
- Se il loop si ferma — il watchdog lo riavvia
- Grafici ONESTI — se un score è zero, è zero. Se migliora di 0.1, è 0.1, non 1.0
- L'insegnante è il vero utente — SEMPRE
