# ARDESIA — PRODUCT-CANON (23/06/2026)

> Cos'è il prodotto, cosa NON è, e la definizione-di-fatto (reality test) camminata sullo stato REALE. Verificato firsthand. Vedi [ARCHITECTURE-CANON](ARCHITECTURE-CANON.md).

## 1. ARDESIA ≠ ELABTutor ≠ simulatore
- **ARDESIA** = lavagna didattica **plugin-native, local-first**, con memoria e marketplace, dove materiali letti, lezioni, errori e contenuti **sedimentano nel tempo**. È l'**ambiente unico di lavoro del tutor**.
- **Simulation Plugin** = strumento potentissimo, ma **plugin** (non Ardesia).
- **ELABTutor** = **primo Pack disciplinare** (circuiti/Arduino) sopra il Simulation Plugin. NON il centro.
- **Pericolo già reale:** `plugins/elab-tutor` oggi è **l'intera app ELAB standalone** (auth, dashboard, memoria, 13 fn AI Supabase, report, lavagna propri) → la "seconda app dentro Ardesia" che il vision teme **è già in-tree**. Il fix è il confine HOST (vedi ELAB-AS-PLUGIN-CANON).

## 2. REALITY TEST = definizione-di-fatto (camminata sullo stato reale)
Il test che conta (se funziona, Ardesia è vera; mille gate-verdi senza questo = ancora fabbrica/architettura):
| Step | Stato reale verificato |
|---|---|
| Apro Ardesia | studio EXISTS (lavagna Excalidraw + host) |
| Apro manuale ELAB | **solo PDF ELAB** (`VolumeViewer.jsx` hard-coded volumi 1/2/3); nessun Manual-object Core |
| Trascino citazione in lavagna | **greenfield** — `BoardCitation` non esiste (solo `VolumeCitation.jsx` render, non data-model né embed montabile) |
| Monto Simulation Plugin | host **costruito ma NON montato** (unico mount = demo srcDoc che bypassa firma) |
| Carico ELABTutor Pack | dati ELAB **fusi** nell'app, non impacchettati |
| Scelgo Passo Passo | `buildMode` esiste in ELAB (`NewElabSimulator buildMode:1055`, lesson-paths `modes_supported` 88/88) |
| Validator becca LED/resistenza sbagliata | **CircuitSolver validators ESISTONO** (series-resistor/polarity/short/overload) |
| UNLIM spiega citando il manuale | **fragile** (tag-regex `[azione:...]`) + nessun manuale-object da citare |
| Genero student pack | route engine `/v1/saved-lessons/{id}/study-pack` ESISTE; manca `/v1/export` + board/plugin-state nel pack |

**Lettura onesta:** ~metà degli step ha un primitivo reale (board, solver, validators, study-pack), ~metà è greenfield (manuale-object, citazione-in-board, mount, pack, UNLIM-tipato). Il prodotto è **vero a tratti, non end-to-end**.

## 3. Le 2 MODALITÀ elevate a livello Ardesia
Da stringhe `buildMode` di ELAB → **`LessonMode` enum di Core**:
```ts
type LessonMode = "passo-passo" | "gia-montato"
```
- **Passo Passo** = costruiamo insieme, un gesto alla volta: `manuale → step → plugin → verifica → hint UNLIM → prossimo step`. (grounding: lesson-paths `modes_supported`, `PassoPassoUnifiedPanel` ELAB = Manuale+Step unificato.)
- **Già Montato** = esempio pronto: `osserva → spiega → varia → trova-errore → quiz`.
Oggi sono stringhe ad-hoc (`complete/guided/sandbox`); il canon le promuove a enum tipato condiviso da TUTTI i plugin.

## 4. Funzioni Core cross-materia (tag stato)
| Funzione | Owner reale | Stato |
|---|---|---|
| Lavagna fluida | studio (Excalidraw) | EXISTS (board base) |
| Manuali/PDF vivi | studio `loadFile.ts` (pdf.js) + ELAB | **PARTIAL** (board-PDF sì, manual-data-model no) |
| Memoria per-lezione | engine (capsules/saved_lessons) | EXISTS |
| Memoria per-studente | engine (CRM) | **PARTIAL** (consenso/CRM sì; errori-ricorrenti/debt non persistiti) |
| Contenuti sedimentati | engine | **PARTIAL** (graph/recap sì; BoardSnapshot/PluginSnapshot aspirazionali) |
| Student pack | engine study-pack route | **PARTIAL** (no export-route, no board/plugin-state) |
| Recap | engine `recap_export.py` ZERO-LLM | EXISTS |
| Errori ricorrenti | engine `path_memory.py:805` | **PARTIAL** (ricalcolato, non persistito) |
| Marketplace/host/permessi/save-stato-plugin | studio toolhost | **host EXISTS-unmounted; marketplace MISSING** |
| Export / ricerca / collegamenti | engine | export CLI-only; links via graph |

## 5. Statement MOAT onesto (VIETATO il "+0.33")
- **Floor lessicale** `recall@10 ≈ 0.21` CI[0.118, 0.303] (misurato live `moat_gate.py --report` su `~/lessonos`). *(Il "recall@10=0.23" del vision è il numero che ricordi del floor live, NON una metrica di `packages/engine` — lì non esiste.)*
- Il grafo **alza la fetta-prerequisiti** da 0.0 → segnale; il "1.0 headline" è artefatto circolare su gold sintetico.
- **`graph_aware_retrieve`** è **wired sul package-path** (`app.py:2926` `_grounding_window` → `app.py:3048` route `/v1/packages`, fail-soft a `segments_for_lesson`). L'item aperto **WIRE-MOAT** riguarda il sotto-path di grounding dei **quiz/flashcard atom** dentro `assemble_lesson_package` (da riconciliare con l'audit-v11). 
- **VIETATO** "+0.33"/PPR/reasoning. Claim permesso: *"edge-set pedagogico dal corpus del docente"*. Lift onesto da ri-misurare gold-blind N≥50 sul served-path (può uscire ~0 = verità).

## 6. Responsive (formalizzazione UI)
Desktop `[Manuale][Lavagna][Plugin/UNLIM]` · Laptop `[Lavagna]+pannelli-collassabili` · iPad-landscape `[Lavagna]+drawer` · iPad-portrait focus-mono-vista · Mobile review/student-pack (NON authoring). **GoodNotes NON va copiato feature-by-feature**: Ardesia deve essere buona nella scrittura ma **superiore nella combinazione** manuali+memoria+plugin+student-pack+marketplace.

## 7. Tagli duri (NON fare ora)
app iPad nativa · marketplace pubblico completo · creator portal · pagamento plugin · collab real-time · port totale di `NewElabSimulator` · UNLIM chatbot estetico · 20 plugin · Vercel come cuore-del-prodotto (Vercel = serving/superfici, NON il prodotto) · storage cloud dei dati reali studente · refactor perfetto di tutto ELAB · riscrittura CircuitSolver.

## 8. Formula canonica
*Ardesia è una lavagna didattica local-first con memoria e marketplace plugin. Materiali, lezioni, errori e contenuti sedimentano nel tempo. I plugin aggiungono strumenti specializzati. Il Simulation Plugin è il primo grande plugin dimostrativo. ELABTutor è il primo Pack disciplinare sopra quel plugin.*
