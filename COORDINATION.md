# LessonOS — Coordinamento Hermes ↔ Claude (supervisore)
Canale append-only condiviso. Hermes scrive § NEEDS-CLAUDE; Claude risponde § CLAUDE-SAYS. Entrambi migliorano il § PROTOCOLLO (auto-miglioramento dell'interazione). UNA proposta per volta, motivata.

## PROTOCOLLO (v1)
- Hermes autonomo DENTRO un milestone (gate = autorità). Serve Claude → voce NEEDS-CLAUDE: tipo `[BLOCKER|ESCALATION-task-dura|REVIEW|DOMANDA]`, contesto (`file:line`, iter RESEARCH), richiesta.
- **ESCALATION-task-dura** = M3 grafo / M4 delta dove Kimi fa **2 REVERT di fila** sullo stesso obiettivo → Claude la fa con `claude -p` Opus (via bash; Keychain irraggiungibile per Hermes).
- Claude risponde in CLAUDE-SAYS (timestamp); Hermes poi spunta `[risolto]`.
- Merge `auto/main`→`main` = solo Claude+Andrea dopo review.

## NEEDS-CLAUDE  (Hermes scrive qui)
_(vuoto — nessuna richiesta aperta)_

## CLAUDE-SAYS  (supervisore scrive qui)
- **2026-06-06 setup** — Orchestratore #2 verificato indipendentemente: M2-task4, 81 test (mio pytest), gate verde, `main` intatto, codice grounded non-tautologico. Ottimo lavoro, regge. **Via libera M2-task5** (persistenza `LessonCapsule` nello store) → poi **M3 Lesson Graph**. Per M3/M4: 2 REVERT di fila → scrivi ESCALATION qui, la prendo con Opus.
- **ORDINI (debug+doc, da Andrea):** (1) **logga il costo Kimi VERO**, non `cost_usd:0` (stima token × tariffa); (2) **prossima iterazione = documentazione**: scrivi `ARCH.md` ADR-001 che documenta la pipeline M2 completa (ingest → segmentation → extraction → assembly, con i `file:line`) + aggiorna `project-wiki/index.md`; (3) applica il DEBUG §11 e la RETRO §12 d'ora in poi.

## PROPOSTE-PROTOCOLLO  (entrambi — migliorate l'interazione)
_(vuoto)_

## DIRETTIVA RICERCA SCIENTIFICA (M3/M4) — da Andrea, via Claude
Prima di implementare **M3 (Lesson Graph)** e **M4 (Didactic Delta / Learning Debt)**: usa le skill builtin `arxiv`/`llm-wiki`/`research-paper-writing` per studiare lo stato dell'arte e scegliere l'approccio MIGLIORE **scientificamente**, poi applica UNA ipotesi alla volta via ratchet. Temi: knowledge-tracing (BKT/DKT), prerequisite/concept graph, spaced-repetition (SM-2/FSRS), learning-analytics. Cita le fonti in `STATUS.md`. Non compiacere: scegli per evidenza.
**VINCOLI PRODOTTO** (da `ECOSYSTEM-RESEARCH-2026-06-06.md`):
- Lesson Graph = **`networkx` DiGraph + topological sort**, edge prerequisito tipizzati + **provenance** (`authored` vs `auto-suggested` + confidence). NON graphify.
- Path Memory studente = **Postgres+pgvector (Supabase)**, schema relazionale mastery/gaps/delta. NON mem0 (PII studente→LLM = blocco GDPR minori).
**DISCIPLINA TOKEN KIMI:** TPD = 1.5M/giorno. Iterazioni SNELLE (leggi solo i file essenziali). Cap-token attivi: `agent.max_turns=30`, `file_read_max_chars=30000`. Se il gate è esausto, fermati (driver/tick lo gestiscono).
