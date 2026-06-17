# Verifica Richieste — 22/03/2026

## Visione generale del sistema

| Richiesta | Considerata? | Dove | Stato reale | Gap | Priorità |
|-----------|-------------|------|-------------|-----|----------|
| Loop automigliorante vero | Parziale | automa/dispatcher.sh | Script scritto, MAI avviato | Non gira | P0 |
| Lavoro continuo, non batch | Parziale | dispatcher.sh (ogni 2h) | Non testato | Serve avvio + verifica | P0 |
| Orchestrato davvero | No | Solo documenti (.md) | Zero orchestrazione reale | n8n non configurato | P0 |
| Watchdog/retry/fallback | Parziale | watchdog.sh + launchd plist | Scritto, non installato | Mai eseguito | P1 |
| Tutte le risorse usate | Parziale | Ricerca fatta su tutti i tool | Solo Claude Code usato davvero | Zero integrazione reale | P1 |
| Sempre onesto | Sì | Comportamento sessione | Applicato in questa sessione | Serve nel prompt permanente | P0 |

## Utente reale e pedagogia

| Richiesta | Considerata? | Dove | Stato reale | Gap | Priorità |
|-----------|-------------|------|-------------|-----|----------|
| Insegnante = utente vero | Sì | KICKOFF-PROMPT Principio Zero | Solo testo, zero codice | Nessun teacher mode implementato | P0 |
| Galileo non sostituisce insegnante | Sì | KICKOFF-PROMPT | Solo principio scritto | Zero nel codice Galileo | P0 |
| Apprendimento orizzontale | Sì | research-horizontal-learning.md | Solo ricerca | Zero implementazione | P1 |
| Linguaggio 10-14 su LIM | Sì | brainstorm-teacher-scaffolding.md | 20 esempi scritti | Non nel nanobot.yml | P0 |
| Analogie quotidiane | Sì | brainstorm-teacher-scaffolding.md | Mappa completa analogie | Non nel nanobot.yml | P0 |
| Segue percorso volumi | Parziale | 62 esperimenti con buildSteps | Esperimenti esistono | Manca curriculum YAML per esperimento | P1 |
| Prep lezioni invisibile | Sì | brainstorm-teacher-scaffolding.md | Design dettagliato | Zero codice | P1 |

## Simulatore e controllo

| Richiesta | Considerata? | Dove | Stato reale | Gap | Priorità |
|-----------|-------------|------|-------------|-----|----------|
| Galileo controlla millimetricamente | Parziale | 26+ action tags nel nanobot | Funzionano in produzione | Brain V13 ora produce i tag nativamente | P1 |
| Visione + contesto integrati | Parziale | Gemini vision nel nanobot | Funziona in produzione | Non testato in questa sessione | P2 |
| Test browser reali | No | research-browser-testing.md | Solo ricerca, 10 scenari scritti | Zero test implementati | P1 |
| iPad + LIM | Parziale | research-ux-lim.md | Ricerca (56px, 28pt) | Zero fix implementati | P1 |

## Ambito lavoro

| Richiesta | Considerata? | Dove | Stato reale | Gap | Priorità |
|-----------|-------------|------|-------------|-----|----------|
| No lavoro su Netlify | Sì | — | Rispettato | — | — |
| Solo ELAB Tutor + vetrina | Sì | — | Rispettato | — | — |

## Tool e orchestrazione

| Richiesta | Considerata? | Dove | Stato reale | Gap | Priorità |
|-----------|-------------|------|-------------|-----|----------|
| Claude Code | Sì | Sessione attuale | Usato attivamente | OK | — |
| ChatGPT/Codex | Parziale | research-chatgpt-integration.md | Solo ricerca | Zero uso reale | P2 |
| Gemini CLI | Parziale | research-tool-headless.md | Ricerca: headless OK | Mai usato | P2 |
| Kimi K2.5 | Parziale | Usato dall'utente in OpenCode | Bug headless #10411 documentato | Solo via API per loop | P2 |
| n8n | No | docker-compose.yml scritto | Mai avviato | Serve docker-compose up | P1 |
| AutoResearchClaw | No | research-autoresearchclaw-strategy.md | Mai installato | P1 |
| Tecniche orchestrazione moderne | Sì | research-orchestration-advanced.md | Ricerca profonda (HTN, blackboard, stigmergy) | Zero implementato | P2 |
| CoV dappertutto | Parziale | Nel dispatcher.sh | Solo lì | Serve in ogni script/test | P1 |
| AGILE | No | — | Solo menzionato | Mai strutturato | P2 |
| Knowledge ordinata | Sì | automa/knowledge/ (23 file + INDEX) | Creata e indicizzata | OK | — |

## Ricerca continua

| Richiesta | Considerata? | Dove | Stato reale | Gap | Priorità |
|-----------|-------------|------|-------------|-----|----------|
| AutoResearch su presentazione tutor | Sì | research-ux-lim.md | Ricerca fatta | Non integrata | P2 |
| AutoResearch su offline | Sì | research-pwa-offline.md + research-offline-edtech.md | Ricerca fatta | Non implementata | P1 |
| AutoResearch su interfaccia | Sì | research-performance.md | Ricerca fatta | Non implementata | P1 |
| AutoResearch su Arduino/Scratch | Sì | research-arduino-scratch.md | Ricerca fatta (8 blocchi mancanti) | Non implementata | P1 |
| AutoResearch su mercato | Sì | research-italy-market.md | Ricerca fatta (PNRR, MePa, pricing) | Non azionata | P2 |
| Ricerche nella knowledge automa | Sì | automa/knowledge/ | 23 file salvati + INDEX | OK | — |

## Contesto e organizzazione

| Richiesta | Considerata? | Dove | Stato reale | Gap | Priorità |
|-----------|-------------|------|-------------|-----|----------|
| Riorganizzare cartelle | No | — | Non fatto | MEMORY.md ancora 309 righe | P0 |
| Conservare history | Parziale | automa/knowledge/ | Research salvata | Sessioni passate non archiviate | P1 |
| Tecniche contesto moderne | Sì | research-context-techniques.md | Ricerca (handoff, state.json, ChromaDB) | Zero implementato | P1 |

## Brain

| Richiesta | Considerata? | Dove | Stato reale | Gap | Priorità |
|-----------|-------------|------|-------------|-----|----------|
| Provare Brain | **SÌ** | Test locale + VPS | **V13 FUNZIONA su VPS Hostinger** | Serve collegare al nanobot | P0 |
| Brain con nanobot | Parziale | Nanobot ha codice Brain | Brain "off" su Render | Serve env var BRAIN_URL su Render | P0 |
| Dove sta il Brain | Chiarito | VPS 72.60.129.50:11434 | LIVE, raggiungibile | OK | — |
| Come migliorarlo | Sì | research-self-improving.md | Flywheel + monthly retrain | Non implementato | P2 |
| Colab solo per training | Chiarito | notebooks/galileo-brain-serve.ipynb | Notebook pronto | Training non necessario ora | P3 |
