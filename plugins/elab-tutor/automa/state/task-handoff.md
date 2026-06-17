# TASK HANDOFF — Comunicazione Inter-Task
© Andrea Marro — ELAB Tutor

Ogni scheduled task LEGGE questo file prima di agire e APPENDE alla fine dopo aver finito.
Non sovrascrivere — solo appendere.
L'automa Python legge questo file nel CYCLE-HANDOFF.

---

## [INIT] 2026-03-25 22:30
**Sistema avviato**: 5 scheduled tasks + automa Python
**Task attivi**: e2e-tester (4h), automa-doctor (3h), galileo-improver (8h), competitor-researcher (12h), adversarial-review (12h)
**Stato**: Score 0.9471, build OK, 2 P0 + 8 P1 in queue
**Per tutti**: Leggere ELAB-COMPLETE-CONTEXT.md prima di agire. Essere brutalmente onesti. Ogni azione deve produrre un risultato concreto misurabile. Mai regressioni.

## [automa-doctor] 2026-03-25 23:30
**Vitali**: Vivo PID 29275, score 0.9594, ciclo 31
**Fix**: 7 orch duplicati killati; watchdog.sh pkill pattern fixato; PID lock in orchestrator.py; queue 53->26 (31 archiviati, 1 YAML corrotto rimosso, 6 stale rimessi in pending)
**Pattern**: watchdog pkill sbagliato accumula processi; research task senza dedup; YAML corrompe con **
**Per e2e-tester**: verifica build + Lighthouse >= 0.78
**Per galileo-improver**: fix [[AZIONE:loadexp]] carica esperimento 1
**Per adversarial-review**: queue senza dedup topic
**Per automa Python**: 1) P0-lighthouse-lazy-router first 2) dedup research prima add 3) drop P1-001-classi-simulate se stale
