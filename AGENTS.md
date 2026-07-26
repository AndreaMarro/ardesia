# ARDESIA monorepo — AGENTS (root)
> ORIENTAMENTO: leggi `docs/vault/ARDESIA-MAP.md` — com'è fatto il progetto (macchine, repo, branch, loop, modelli, invarianti).
Ogni package ha il proprio AGENTS.md + gate. Regole globali: GDPR (no corpus/PII nel repo), ZERO-LLM in prodotto, additive+migrate-safe, mai indebolire i gate, mai auto-merge a main.

### Deroga documentata alla regola PII — identificazione del titolare dei diritti

La regola «no corpus/PII nel repo» vieta corpus, dati di studenti e docenti,
segreti e dati personali di terzi. **Non** si applica alla denominazione del
titolare dei diritti in `LICENSE` e `NOTICE`.

Motivo: identificare il licenziante è il contenuto legalmente necessario di una
licenza proprietaria. Senza un titolare identificato, la concessione e la
riserva di diritti non sono attribuibili e la licenza è di fatto inopponibile.
Il titolare è una ditta individuale registrata, che in diritto italiano è
identificata dal nome del titolare: la denominazione è quindi l'entità
d'impresa, non un dato personale incidentale.

Portata della deroga, tassativa:

- vale **solo** per `LICENSE` e `NOTICE` alla radice del repository;
- vale **solo** per la denominazione del titolare dei diritti;
- **non** autorizza indirizzi, contatti, codici fiscali, partite IVA o altri
  identificativi;
- **non** si estende ad altri file, ad altri soggetti, né ai dati di studenti,
  docenti o terzi, che restano vietati senza eccezioni.

Approvata da Andrea Marro il 2026-07-26. Revoca: rimuovere questa sezione
rende di nuovo bloccante qualunque nominativo in `LICENSE`/`NOTICE`.
