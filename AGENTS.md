# ARDESIA monorepo — AGENTS (root)
> ORIENTAMENTO: leggi `docs/vault/ARDESIA-MAP.md` — com'è fatto il progetto (macchine, repo, branch, loop, modelli, invarianti).
Ogni package ha il proprio AGENTS.md + gate. Regole globali: GDPR (no corpus/PII nel repo), ZERO-LLM in prodotto, additive+migrate-safe, mai indebolire i gate, mai auto-merge a main.

## Memory governance — PROPOSED / NO CUTOVER (agg. 2026-07-18)

- L'evidenza esatta di prodotto, test e Git legata allo SHA resta l'autorità tecnica più alta.
- Gli ordini e le approvazioni umane determinano intento e autorità; test, SHA e receipt determinano i fatti ma non autorizzano deploy, spesa, segreti o mutazioni esterne. Un conflitto tra le due gerarchie è STOP.
- La fonte canonica della conoscenza umana è Markdown in un repository Git privato e pulito, aperto in Obsidian. Prima di ogni slice leggere indice, decisione corrente e ultimo receipt; ogni slice aggiunge un receipt append-only.
- Basic Memory è soltanto un indice locale, ricostruibile e non autorevole. L'evidenza canary corrente è il receipt Obsidian `30-Evidence-Receipts/2026-07-18-FOUNDER-BETA-FB3A-REVIEWED.md`; i fatti datati sono riepilogati una sola volta nel §2 del runbook.
- Per il canary corrente il MacBook è l'unico writer del branch `canary/basic-memory-20260717`; il Mini è mirror fast-forward-only. L'indice deve leggere uno snapshot dedicato e read-only, non il clone usato per sincronizzare Git.
- Se Basic Memory non risponde, leggere direttamente i Markdown con filesystem/`rg` e accodare il receipt. La riconciliazione nel vault è un gate di release, non un blocco alla correzione locale del codice.
- AgentMemory è escluso dai workflow attivi e non è un fallback. Il servizio storico non è stato disabilitato o cancellato e il cutover non è stato dichiarato completato: non introdurre nuove dipendenze; solo dopo un gate separato potrà diventare una sorgente di migrazione congelata.
- Prompt B e loop overnight restano disattivati. Nessuna installazione, listener, tunnel, modifica client, unload, cancellazione o accesso a segreti senza il rispettivo gate umano esplicito.
- Decisione e runbook proposti: `docs/adr/ADR-0003-markdown-git-basic-memory-plane.md` e `docs/ops/BASIC-MEMORY-CANARY-AND-CUTOVER.md`.
