# ARDESIA monorepo — AGENTS (root)
> STATO CORRENTE — per primo, e GENERATO, mai letto da un documento scritto a mano: `python3 bin/state/project_state.py` produce `docs/ops/CURRENT.md` (umano) e `artifacts/state/project.json` (macchina, gitignorato). Ogni altro file descrive l'istante in cui è stato scritto, non l'istante in cui lo leggi.
> ORIENTAMENTO: leggi `docs/vault/ARDESIA-MAP.md` — com'è fatto il progetto (macchine, repo, branch, loop, modelli, invarianti).
> COME ENTRA IL LAVORO: leggi `docs/ops/ARDESIA-LOOP-TWO-HINGE-2026-07-30.md` — il loop a due cardini (chi scrive, chi confuta, chi autorizza), la forma dei trigger CI e perché, e cosa i gate garantiscono davvero.
> CONVERGENZA DI PRODOTTO: `docs/CANON-INDEX.md` distingue il canone attuale dagli snapshot storici. La consegna `docs/deliveries/2026-10-24-convergence/README.md` collega audit, contratti, prove e prossimo incremento; è uno snapshot datato, non sostituisce lo stato generato. Prima di editare controlla PR e ownership correnti.
Ogni package ha il proprio AGENTS.md + gate. Regole globali: GDPR (no corpus/PII nel repo), ZERO-LLM in prodotto, additive+migrate-safe, mai indebolire i gate, mai auto-merge a main.
