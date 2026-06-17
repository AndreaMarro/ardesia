# Regole Apprese — ELAB Automa Self Exam

Questo file viene generato automaticamente da `self_exam.py`.
Contiene regole di comportamento apprese dall'analisi dei cicli passati.
Viene iniettato nel prompt dell'agente ad ogni ciclo.

**Non modificare manualmente** — le regole vengono aggiornate automaticamente.


## [c45-empty] REGOLA OPERATIVA — 2026-03-26 20:26
**Fonte**: 3/15 cicli 'done' senza file modificati
**Regola**: Troppi cicli terminano senza modifiche reali. Se il task non richiede modifiche a file, cambiare mode a RESEARCH o AUDIT. Un ciclo IMPROVE deve sempre produrre un diff verificabile.
**Confidenza**: 0.8
