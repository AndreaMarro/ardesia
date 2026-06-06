# LessonOS — Ricerca ecosistema (risorse Andrea 2026-06-06)
4 agenti di ricerca paralleli, valutazione evidence-based, **dev + prodotto**, anti-compiacenza (adopt/borrow/reject motivato). Verifica i miei audit precedenti, non li ripete a vuoto.

## DEV (loop Hermes-Kimi) — decisioni
| risorsa | verdetto | motivo |
|---|---|---|
| **graphify** (safishamsi) | **REJECT** | edge cross-file LLM-inferred (conf 0.55–1.0), NON LSP. Serena LSP + grep danno go-to-def/refs esatti e deterministici. Nessun guadagno per la navigazione dell'agente. |
| **mem0** | **REJECT (dev)** | nessuna integrazione Claude-Code, LLM-mandatory. agentmemory copre già il ruolo hub. |
| **agentmemory** (rohitg00) | **ADOPT (già)** | hub dev :3111 BM25/noop, LLM-free. Resta. |
| **autoresearch** (karpathy) | **ADOPT (già)** | ratchet frozen-gate + git-revert = il nostro `driver-orch.sh`. |
| **LLM-Wiki** (karpathy gist) | **ADOPT (già)** | = il nostro `project-wiki/` (3 layer, cita file:line). |
| **wikillm** (laramohan) | **REJECT** | è MEMIT param-editing del modello, NON un tool wiki. Niente da prendere. |
| **karpathy-guidelines** (.mdc) | **ADOPT (già)** | Think/Simple/Surgical/Goal = AGENTS §5/§9 + skill locale. |
| **Hermes tips** (nousresearch) | **ADOPT — GOLD** | leve concrete costo/affidabilità (sotto). |

### Borrow concreti (Karpathy program.md + Hermes tips)
1. **Fix 429 (FATTO):** `compression.summary_model: kimi-k2.6` — il default Gemini non-keyed faceva failover su codex/OpenAI (org TPD 429). Ora compression = Kimi → Hermes 100% Kimi.
2. **Costo (Hermes tips):** cap `agent.max_turns` 30–40 (default 90 = #1 leva runaway), `tool_output.max_bytes` ~50k, `file_read_max_chars` ~100k, AGENTS.md byte-identico (prompt-cache hit). → config.yaml.
3. **Affidabilità headless:** `HERMES_CRON_TIMEOUT=600` + API/stream timeouts nel driver (evita hang infiniti).
4. **Simplicity-as-metric (autoresearch):** regola di accettazione, non solo stile — a parità di metrica vincono meno righe; rifiuta micro-win che aggiungono complessità brutta. → AGENTS §9.
5. **Wiki `lint`:** sweep periodico stale/orphan/contraddizioni sul project-wiki (candidato retro §12).
6. **REJECT NEVER-STOP** (autoresearch lo predica): **viola "TUA E MIA supervisione"** — niente auto-merge, niente loop che non si ferma mai. Confine fermo.

## PRODOTTO (motore LessonOS / ELAB) — note di design dalla ricerca
1. **Lesson Graph (M3):** `networkx` DiGraph + topological sort, **NON graphify**. Edge prerequisito **tipizzati + provenance** (`authored` vs `auto-suggested` + confidence) — Path Memory non si fida mai di una dipendenza indovinata (stessa filosofia grounding del prodotto). ~50 righe, zero LLM nel path.
2. **Path Memory (studente):** **build-own su Supabase Postgres+pgvector** (che abbiamo già), **NON mem0**. mem0 `infer=True` (il suo valore) manda testo studente grezzo a un LLM = **blocco GDPR minori**; `infer=False` = solo embed-cache = zero vantaggio su pgvector. Schema relazionale normalizzato mastery/gaps/delta + retrieval pgvector. GDPR-safe by-construction, $0 infra.
3. **GraphRAG per UNLIM:** retrieval graph-scoped (validato: ~71× meno token/query) ma su pgvector+networkx esistenti, non graphify.

## Direttiva di ricerca scientifica per Hermes (M3/M4)
Prima di implementare M3 (Lesson Graph) e M4 (Didactic Delta): usa le skill builtin `arxiv`/`llm-wiki`/`research-paper-writing` per studiare lo stato dell'arte (knowledge-tracing BKT/DKT, prerequisite-graph, spaced-repetition, learning-analytics), cita le fonti in STATUS, e applica UNA ipotesi alla volta via ratchet. Scienza, non intuizione. Non compiacere.
