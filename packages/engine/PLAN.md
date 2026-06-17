# LessonOS / Pathbook — Spec tecnica per il Core Engine
> Distillazione FEDELE del piano di ricerca (sezioni business/benchmark/marketing omesse: non servono al build). Il piano completo originale resta presso Andrea.

## Tesi (§0, §3, §33)
NON "GoodNotes + chatbot". Un **SO didattico**: ogni lezione = oggetto ricco/verificabile/riusabile; ogni ciclo = memoria didattica progressiva. **Idea originale (§3): ogni lezione AGGIORNA un grafo didattico del percorso; ogni punto è leggibile sia localmente sia nel contesto del percorso.** Frase guida: *ogni lezione rende più intelligente la prossima.*

## Due viste (§8)
- **Lesson Lens** — singola lezione: notebook + media-sync + fonti + trascrizione + rielaborazione AI (recap, concetti, esercizi, dubbi, compiti, citazioni).
- **Path Lens** — percorso: lezioni in ordine logico, concetti ricorrenti, debito didattico, mappa, rielaborazione progressiva.

## Concetti originali (§3) — IL CUORE da costruire
- **Lesson Graph (§3.2)**: grafo che collega lezioni · pagine · momenti · trascrizioni · fonti · concetti · prerequisiti · esempi · esercizi · errori · domande · compiti · obiettivi · studenti · moduli. `edge_type` ∈ {explains, depends_on, revises, contradicts, repeats, exemplifies, assesses, derived_from, assigned_in, resolved_by, prepares}.
- **Didactic Delta (§3.3)**: confronto fra versioni del percorso — cosa aggiunto / chiarito / ancora-aperto / ripetuto-troppo / non-abbastanza-esercitato; quali spiegazioni meritano di diventare materiale stabile.
- **Learning Debt Ledger (§3.4)**: registro debito — concetti non padroneggiati, dubbi sospesi, esercizi non corretti, errori ricorrenti, prerequisiti deboli, promesse "la prossima volta lo riprendiamo". Alimenta la preparazione delle lezioni successive.

## Oggetti (§7) → entità del data model
Workspace · Path · Lesson · Source · Moment · Concept · Exercise · LearningDebtItem (campi chiave §7.2–7.8 del piano).

## Data model (§14) — tabelle principali
`paths, lessons, modules, sources, source_chunks, transcript_segments, timeline_events, concepts, concept_aliases, exercises, misconceptions, learning_debt_items, graph_nodes, graph_edges, ai_outputs, model_calls, cost_ledger`.
`timeline_events.event_type` ∈ {page_created, source_opened, marker_important, marker_doubt, marker_homework, marker_error, exercise_started, question_asked, concept_introduced, transcript_segment}.

## Pipeline (§16) — v0 = percorso SOLO TESTO
Post-lezione (§16.1): ingest → segmentazione argomenti → parsing fonti → estrazione concetti/esercizi/dubbi → **Lesson Capsule** → indicizzazione (chunk tipizzati + embeddings) → aggiornamento **Lesson Graph** → update **Path Memory**.
Path reprocessing (§16.2): aggrega summary → concetti ricorrenti → debito → evoluzione concetti → prerequisiti mancanti → **Next Lesson Plan** + **Cycle Refinement**.

## Retrieval (§13)
Chunk **TIPIZZATI** (transcript_segment, source_passage, exercise, lesson_summary, path_summary, concept_card…) con metadata (path_id, lesson_id, concept_ids, timestamp, visibility). Retrieval **GERARCHICO** (lesson/module/path/workspace scope) + **HYBRID** (vettoriale + BM25 + filtri metadata + grafo). **CITAZIONI OBBLIGATORIE** (§13.4): ogni claim → `{type, lesson_id, source_id, timestamp|page, excerpt, confidence}`. Mai citazioni inventate.

## Schemi output (§26) — produrre ESATTAMENTE questi JSON
- **Lesson Capsule (§26.1)**: `lesson_title, path_context, objectives_planned, objectives_covered, summary_short, summary_detailed, timeline[{start,end,topic,description,citations}], concepts[{name,status∈{introduced,reinforced,reviewed,problematic},prerequisites,citations}], exercises, student_questions, misconceptions, homework, learning_debt_candidates, next_lesson_suggestions, source_references`.
- **Path Memory (§26.2)**: `path_title, current_state, modules, concept_graph, lesson_index, recurring_misconceptions, learning_debt, exercise_bank, best_explanations, material_library, next_actions, cycle_refinement{merge_lessons,split_lessons,move_concepts,missing_prerequisites,new_materials_needed}`.
- **Prompt pattern (§26.3)**: ROLE (assistente didattico, NON sostituto del docente) · SCOPE (lesson/module/path/workspace) · GROUNDING (solo fonti recuperate; se manca evidenza → dichiaralo) · OUTPUT (schema JSON) · CITATIONS (ogni claim specifico) · UNCERTAINTY (marca inferenze/bassa confidenza).

## Principi prodotto (§6)
Canvas-first / AI-second · Teacher-in-control (AI propone, docente approva) · **Grounded by default** · Lesson e Path distinte · ogni lezione migliora la prossima · niente raw-AI-chaos (output strutturati) · open-infra + API-models (**NO modelli locali**) · cost-observability · privacy-conservative · export = feature.

## AI stack (§12) per il Core Engine
**Router multi-modello** (mai un solo modello): modello economico per estrazione, forte per sintesi, long-context per path-synthesis. v0 = provider `mock` (test, deterministico) + `kimi` (Moonshot, eval gated). Embeddings v0 = stub locale semplice; target pgvector. Eval (§22): groundedness, citation-accuracy, retrieval-precision. Cost ledger (§20): mock=gratis, chiamate reali loggate.

## SCOPE del Core Engine
**DENTRO** (headless, testabile): data model · pipeline testo · Lesson Capsule · Lesson Graph · Path Memory · Didactic Delta · Learning Debt · Next-Lesson-Plan · retrieval ibrido · citazioni · eval · cost ledger · demo CLI.
**FUORI** (dopo, con GUI/umani — NON ora): iPad SwiftUI/PencilKit · web Next.js · audio/video reale + FFmpeg/STT · OCR pesante · LiveKit · storage cloud (R2/Supabase) · billing · multiutente.
