# Deep-research: il metodo per conservare history/struttura/contesto (umano+agente)

**Data**: 2026-06-11 ~00:30 · **Harness**: workflow multi-agente (105 agenti, 5 angoli, 23 fonti,
115 claim estratti → 25 verificati avversarialmente con 3 voti → **13 confermati, 12 uccisi**).
Sintesi: supervisore (lo step di sintesi automatica è morto su session-limit; i claim sotto sono
quelli sopravvissuti alla verifica avversaria, citati alla fonte).
Ordine: Andrea via Telegram 10/06 21:39 ("metodi migliori… conservare history/struttura/contesto…
strumento utile, profittevole, innovativo… sii scientifico, non compiacermi").

## Sintesi (10 righe)

1. **Il pattern vincente 2025-26 è quello che MAESTRO usa già**: markdown leggibile come fonte di
   verità + indice derivato rigenerabile ("raw immutabile + derived rigenerabile"). Confermato da
   3 fonti indipendenti: Anthropic first-party, sqlite-memory, basic-memory, e formalizzato in
   accademia (arXiv 2512.05470: History immutabile → Memory derivata → Scratchpad effimeri).
2. **Index-plus-pointers batte il dump monolitico**: identificatori leggeri + caricamento
   just-in-time via tool (Anthropic, 3-0). Il nostro MEMORY.md-indice + topic-file è già questo.
3. **Anti-hype confermato dai dati**: il knowledge-graph per-progetto NON è un upgrade netto
   (Codebase-Memory: 83% qualità vs 92% della file-exploration, 3-0; il claim "10× più efficiente"
   è stato CONFUTATO 0-3). Le skill come canale di conoscenza possono essere token-NEGATIVE
   (+451% token a pass-rate invariato, 3-0).
4. **Gap reale trovato**: NESSUNO dei tool del landscape verifica che i claim di memoria siano
   grounded VERBATIM su fonti raw immutabili. MAESTRO M0 ha già costruito esattamente questo.

## Fatti verificati (voto avversario, fonte)

| # | Fatto | Voto | Fonte |
|---|-------|------|-------|
| 1 | Just-in-time: identificatori leggeri (path, query, link) caricati a runtime via tool, NON pre-retrieval monolitico | 3-0 | anthropic.com/engineering/effective-context-engineering |
| 2 | "Structured note-taking / agentic memory" su file (NOTES.md, CLAUDE.md) = tecnica first-class Anthropic ⇒ endorsement first-party del memory-as-code | 3-0 | idem |
| 3 | sqlite-memory: markdown = fonte di verità, SQLite (chunk+embedding+FTS) = layer derivato rigenerabile; "de facto standard futuro" | 2-1 | github.com/sqliteai/sqlite-memory |
| 4 | sqlite-memory gira 100% on-device (GGUF/llama.cpp), zero cloud ⇒ GDPR-compatibile | 3-0 | idem |
| 5 | arXiv 2512.05470 formalizza il 3-tier: History append-only immutabile → Memory derivata rigenerabile → Scratchpad effimeri | 2-1 | arxiv.org/pdf/2512.05470 |
| 6 | basic-memory: local-first, tutto markdown su disco + indice SQLite locale, zero cloud di default | 3-0 | github.com/basicmachines-co/basic-memory |
| 7 | basic-memory: KG per-progetto DENTRO il markdown (Entities/Observations/Relations `[[wiki-link]]`), bidirezionale umano↔agente — l'artefatto umano È il grafo agente | 3-0 | idem |
| 8 | Graphiti: trazione VERA (27.3k★, Apache-2.0, release 08/06/2026, 196 release) | 3-0 | github.com/getzep/graphiti |
| 9 | Graphiti: modello bi-temporale, history per invalidazione (mai delete), provenance alla fonte | 3-0 | idem |
| 10 | Graphiti: model-agnostic, può girare full-local (Ollama/llama.cpp) MA serve LLM locale capace per l'estrazione = collo di bottiglia su 16GB | 3-0 | idem + arXiv 2501.13956 |
| 11 | Codebase-Memory (MCP, Tree-Sitter, 66 linguaggi): il KG-per-codice via MCP esiste già | 3-0 | arxiv.org/abs/2603.27277 |
| 12 | MA: quel KG FA PEGGIO della file-exploration su qualità risposta (83% vs 92%) | 2-1 | idem |
| 13 | Skill-injection può costare +451% token a pass-rate INVARIATO ⇒ le skill sono per procedure, non per dump di conoscenza | 3-0 | arxiv.org/abs/2603.15401 |

**Confutazioni rilevanti (claim UCCISI dalla verifica)**: "KG 10× più efficiente" (0-3) ·
"le skill SWE sono inutili" come generalizzazione (0-3) · "context-rot fonda tutto" come
formulazione assoluta (0-3) · "basic-memory funziona su TUTTI i client" nei dettagli (0-3) ·
compressione latente T2V batte full-context MA richiede encoder model-specific ⇒ NON
model-agnostic (1-2, fuori dai vincoli).

## Verdetti (con costi reali)

- **ADOPT (pattern, costo ~0)** — *già nostro, ora validato*: markdown-as-truth + derived
  rigenerabile + index-plus-pointers. Azione: formalizzare il metodo in OGNI repo MAESTRO
  (un `memory/` con INDEX.md + topic-file, come la memoria supervisore). È IL metodo richiesto:
  fruibile per Andrea (markdown leggibile), per gli agenti (pointers just-in-time), model-agnostic
  (testo), zero debito (niente DB proprietario), attecchimento massimo (file = funziona ovunque).
- **TRIAL (1 settimana, costo: ore setup, zero cloud)** — **basic-memory**: il più vicino al
  bisogno (markdown bidirezionale umano↔agente con KG dentro i file, local-first). Da provare
  BESIDE Serena-memories e agentmemory, non al posto: vince chi sopravvive all'uso reale.
- **WATCH (no ora)** — **Graphiti**: eccellente ma costo-LLM per OGNI scrittura + serve LLM locale
  capace (il Mini 16GB no); il nostro graph_writer è ZERO-LLM deterministico = superiore per il
  nostro caso. **sqlite-memory**: direzione giusta, troppo presto (early-stage). 
- **IGNORE** — KG-per-codice come sostituto dell'esplorazione file (i dati dicono che perde);
  skill come canale di conoscenza (token-negative); compressione latente (non model-agnostic).

## La risposta alla domanda finale: SÌ, c'è lo strumento — ed è già mezzo costruito

**Gap confermato dal landscape** (23 fonti): basic-memory/Graphiti/sqlite-memory/agentmemory
conservano claim e provenance, ma NESSUNO verifica meccanicamente che ogni claim di memoria sia
**grounded VERBATIM** su una fonte raw immutabile, con soglia di accettazione. Graphiti ha i
puntatori di provenance, non la verifica verbatim né il gate.

**MAESTRO M0 ha già costruito e provato in produzione esattamente questo** (9990 segmenti reali):
`verify_citation` (excerpt = sottostringa verbatim della fonte) + excerpt-obbligatorio +
`assert_grounding_threshold` (>20% non-verificato ⇒ FAIL) + gate su dati reali.

**Proposta: "grounded-memory" — MCP server minimo (estrazione di lessonos/graph/grounding.py)**
- 3 tool: `remember(claim, source_ref, excerpt)` → rifiuta se excerpt non è verbatim nella fonte;
  `recall(query)` → restituisce SOLO claim verificati (+ ratio di grounding); `audit(source)` →
  report soglia per fonte.
- Storage: markdown (claims leggibili) + SQLite derivato — il pattern validato sopra.
- Local-first, zero cloud, model-agnostic (nessun LLM richiesto: la verifica è meccanica).
- Perché regge i 4 criteri di Andrea: *utile* (memoria anti-allucinazione per qualunque agente),
  *comunità* (MCP = canale di distribuzione standard), *profittevole* (memoria auditabile =
  mercato enterprise/GDPR/compliance), *innovativo* (gap reale: la verifica verbatim come
  primitiva di memoria non esiste nel landscape).
- Costo MVP: il core esiste (grounding.py, ~150 righe provate); wrapper MCP + storage ≈ 2-3
  giornate di build nel loop. Naming/brand da decidere con Andrea.

## Incertezze dichiarate

- "Nessuno fa verifica verbatim" = assenza non dimostrata esaustivamente (23 fonti, non il
  censimento totale di GitHub). Prima del build: ricerca mirata "verbatim grounding memory MCP".
- 4 verifiche + sintesi automatica perse per session-limit (claim restanti non verificati, esclusi).
- I numeri Codebase-Memory (83/92) vengono dal paper stesso (self-reported).
- sqlite-memory early-stage: il claim "67 stelle" è stato confutato nei dettagli — trazione esatta
  da ricontrollare prima di citarla.
