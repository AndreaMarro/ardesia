# automa — Sistema Autonomo ELAB Tutor

Infrastruttura per testing, monitoring, e miglioramento continuo di ELAB Tutor.

## Stato: in costruzione

Il design è completo. L'implementazione dell'orchestratore è il prossimo passo.

## Cosa c'è

```
PDR.md                    — Piano di Riferimento (priorità, vincoli, costi)
SPRINT-PLAN.md            — Piano 7 giorni (Day 1-7 con task dettagliati)
STATE.md                  — Stato onesto del progetto
PROMPT-SESSIONE-LOOP.md   — Prompt operativo per attivare il loop
VERIFICA-RICHIESTE.md     — Verifica che tutte le richieste siano coperte
handoff.md                — Handoff tra sessioni di lavoro

agents/                   — Script Python per test automatici
  galileo-tester.py       — 50 messaggi al nanobot, verifica risposte
  galileo-judge.py        — Scoring risposte Galileo (5 dimensioni)
  pedagogy-sim.py         — 5 profili studente simulati
  synthesizer.py          — Genera report nightly

context/                  — File di contesto condiviso
  teacher-principles.md   — Principi pedagogici (insegnante = utente reale)
  volume-path.md          — Percorso volumi ELAB e vocabolario progressivo
  tools-config.md         — Configurazione tool e modelli AI

knowledge/                — 23 ricerche completate (evidence-based)
  INDEX.md                — Indice con 1 riga per ricerca
  (23 file .md)           — UX/LIM, pedagogia, Arduino, performance, PWA, etc.

profiles/                 — Profili studente per classi simulate
  sofia-10.yaml, marco-12.yaml, luca-14.yaml, prof-rossi.yaml, edge-case.yaml

queue/                    — Coda task (pending/active/done/failed)
reports/                  — Output dei cicli di test
```

## Cosa manca (da implementare)

```
orchestrator.py           — Cuore del loop (check + Claude Code headless)
checks.py                 — 7 check veloci (health, build, galileo, content, etc.)
tools.py                  — Wrapper API (DeepSeek R1, Gemini 2.5 Pro, Kimi K2.5)
start.sh                  — Avvia il loop
watchdog.sh               — Supervisore launchd
```
