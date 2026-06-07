# LessonOS Core Engine — Roadmap bounded (ordine = riduzione del rischio)

> Regola: una task alla volta (AGENTS.md §3). Ogni milestone = poche task piccole. Spunta `[x]` solo quando pytest è verde + Codex review affrontata + committato.

## M0 — Scaffold (fondamenta testabili)
- [ ] `pyproject.toml` (uv), pkg `lessonos/`, `tests/`, `README.md`, `.gitignore` (include `.env`, `*.db`).
- [ ] `make`/`uv` task: `uv run pytest` gira a vuoto (1 test smoke verde).
- [ ] `lessonos/llm/router.py` — interfaccia LLM + provider `mock` (da fixture deterministiche). Test: il router restituisce la fixture.
- [ ] `lessonos/llm/kimi.py` — provider Kimi (Moonshot, key da env), **non testato live in unit** (solo wiring; skip se no key).
- [ ] `fixtures/sample_path/` — 1 percorso sintetico: 3 lezioni (transcript JSON + timeline_events + 1 fonte PDF/testo + marker). Dati FINTI (matematica: derivate/integrali).
- [ ] `ARCH.md` — ADR-001: scelte (Python, SQLite+sqlite-vec, router mock/kimi, schemi JSON).

## M1 — Data model (il dominio, PLAN §7 + §14)
- [ ] `lessonos/models/` — entità: Path, Lesson, Source, Moment, Concept, Exercise, LearningDebtItem, GraphNode, GraphEdge (dataclass/pydantic).
- [ ] `lessonos/store/` — persistenza SQLite (schema PLAN §14, layer astratto), migrazioni semplici.
- [ ] CRUD + test: crea Path con 3 Lesson dalle fixture, rileggi, verifica integrità referenziale.

## M2 — Lesson Capsule pipeline (PLAN §16.1 percorso testo + §26.1)
- [x] Ingest: carica una lezione-fixture (transcript + timeline + fonte) nello store.
- [x] Segmentazione per argomenti (via router LLM; mock in test).
- [x] Estrazione concetti + esercizi + dubbi + compiti (schema §26.1).
- [x] **Lesson Capsule** JSON completo con **citazioni fondate** (timestamp/pagina/segmento). Ogni claim → citazione.
- [x] Test: capsule dalla fixture ha i campi richiesti + ogni citazione punta a un segmento esistente (no citazioni inventate).
- [x] **M2-task5 (ordine Claude)**: persistenza LessonCapsule nello store come JSON blob (save_capsule/get_capsule, save=True su assemble, load_capsule helper)

## M3 — Lesson Graph + Path Memory (PLAN §3.2 + §26.2)
- [x] Costruisci nodi/archi del grafo dalle capsule (edge_type PLAN §14.2: explains, depends_on, repeats, prepares...).
- [x] `lessonos/graph/` — query: "dove è introdotto X?", "in quali lezioni torna?", prerequisiti.
- [x] **Path Memory** (§26.2): aggregazione progressiva (concetti canonici, lesson_index, recurring_misconceptions).
- [x] Test: dato il percorso 3-lezioni, il grafo collega un concetto introdotto in L1 e ripreso in L2/L3.

## M4 — Didactic Delta + Learning Debt (IL differenziatore, PLAN §3.3 + §3.4)
- [x] **Didactic Delta**: confronto tra versioni del percorso (cosa aggiunto/chiarito/ancora-aperto/ripetuto-troppo).
- [x] **Learning Debt Ledger** (§3.4 + §14): debiti (concetti non padroneggiati, dubbi sospesi, esercizi non corretti) con evidenze/citazioni.
- [x] **Next Lesson Planner** (§8.2): dato il percorso + debito → agenda prossima lezione (cosa riprendere, esercizi, fonti).
- [x] **Test M4 end-to-end**: aggiungendo L4 (mock capsule), DidacticDelta rileva concetto nuovo + debito aperto da L2. L4 fixture reale esiste (`fixtures/sample_path/lessons/l4_integral_substitution.json`, validata da test_fixtures_sample_path.py).

## M5 — Eval harness + Cost ledger (PLAN §22 + §20)
- [x] Eval set: ~20 cases (domande lesson-scope + path-scope) with expected.
- [x] Metriche groundedness/citation-accuracy (stile Ragas/DeepEval, ma minimal custom).
- [x] **Cost ledger** per-lezione (§20): traccia token/costo per chiamata reale.
- [x] Test: l'eval gira sul mock e produce un report; groundedness check fallisce su una citazione volutamente rotta.

## M6 (stretch) — Demo CLI/HTTP end-to-end
- [ ] CLI `lessonos run-path fixtures/sample_path` → stampa Lesson Capsules + Path Map + Delta + Debt + Next-Plan.
- [ ] (opz.) FastAPI minimale che espone gli endpoint PLAN §15 sul percorso-fixture.
- [ ] Eval reale gated (1 run con Kimi, costo loggato) — solo se Andrea dà OK.

**Definition of Done progetto-v0:** M0–M5 verdi; demo M6 mostra il ciclo §3 su dati-fixture con citazioni fondate; eval report + cost ledger esistono. Onestà sopra completezza: meglio M0–M3 solidi che M0–M6 fragili.
