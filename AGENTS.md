# ARDESIA monorepo — AGENTS (root)

## Ordine di lettura

È un ordine di costo, non di autorità.

1. **Stato corrente** — si misura, non si legge da un documento scritto a mano:

   ```bash
   python3 bin/state/project_state.py --print
   ```

   Senza `--print`, lo stesso generatore scrive `docs/ops/CURRENT.md` e
   `artifacts/state/project.json`; entrambi sono gitignorati.
2. **Invarianti di prodotto** — `docs/PRODUCT-CONTRACT.md`, con gli identificatori
   `PC-*` e i riferimenti alle sezioni del PRD.
3. **Requisiti completi** —
   `10-Requirements/2026-08-02-PRD-ARDESIA-DEFINITIVO.md`, nel repository separato
   `ARDESIA-KNOWLEDGE`.
4. **Struttura del codice** — `ARDESIA-MAP.md`.
5. **Processo** — `docs/ops/ARDESIA-LOOP-TWO-HINGE-2026-07-30.md`.

In caso di conflitto vale `PC-AUTH-001`. Lo stato osservato descrive ciò che esiste,
non restringe ciò che il prodotto deve diventare. `docs/vault/ARDESIA-MAP.md` e i
canon del giugno 2026 sono fonti storiche, non entry point normativi correnti.

## Invarianti e guardrail

- L'AI è necessaria al funzionamento pieno di ARDESIA (`PC-AI-001`). Senza AI
  resta disponibile il nucleo documentale enumerato dal PRD. È vietato descrivere
  il prodotto come `ZERO-LLM` o ridurre LessonOS a una chat.
- Ogni modifica di prodotto cita la clausola `PC-*` pertinente e la corrispondente
  sezione del PRD. Il contratto è un indice: non sostituisce il PRD.
- Nessun corpus, dato personale o segreto nel repository, in CI o sui nodi agente.
- Lavoro additivo e migrate-safe; mai indebolire i gate; mai auto-merge su `main`;
  nessun deploy senza autorizzazione esplicita.
- Ogni package conserva il proprio `AGENTS.md` e il proprio gate.
