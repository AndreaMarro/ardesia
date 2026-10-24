# ARDESIA — CANON INDEX

## Orientamento aggiornato il 24 ottobre 2026

**Ardesia è il prodotto; LessonOS è il sottosistema di continuità didattica; Kirchhoff e i simulatori sono capacità specialistiche.** Il microcorso è la prima offerta commerciale. La lezione persistente, il lavoro del docente e il percorso dello studente rimangono il centro del prodotto.

Questo indice ordina l'autorità dei documenti; non certifica il deploy corrente. Per lo stato esegui `python3 bin/state/project_state.py`, poi verifica su GitHub lo SHA e i run del candidato. Una prova su un ramo non certifica un altro ramo.

| Argomento | Documento di riferimento | Ambito |
| --- | --- | --- |
| Identità e priorità di prodotto | [PRODUCT-CANON](PRODUCT-CANON.md), addendum 24 ottobre | Visione e decisioni; capacità non ancora integrate dichiarate come tali |
| Core e confini provider | [ADR-0004](adr/ADR-0004-study-core-and-provider-boundaries.md) e [ARCHITECTURE-CANON](ARCHITECTURE-CANON.md), addendum | Dominio nel monorepo canonico; nessun secondo Core |
| Storia, inventario, debito e prove | [Consegna di convergenza](deliveries/2026-10-24-convergence/README.md) | Snapshot fissato alla base e al diff dichiarati; mappa dei documenti richiesti dal mandato |
| Incremento AUDIO-V2 e Poiseuille | [Consegna utilizzabile locale](deliveries/2026-10-24-audio-v2/README.md), [validazione](deliveries/2026-10-24-audio-v2/validation.md) | Successore di #297: percorso docente/studente sintetico, sessioni/media/bundle canonici; limiti locali e remoti distinti |
| Contratto MCP implementato | [Study MCP README](../services/study-mcp/README.md) | Quattro letture; limiti reali del trasporto e delle autorizzazioni |
| Governance e stato | [AGENTS](../AGENTS.md), [loop a due cardini](ops/ARDESIA-LOOP-TWO-HINGE-2026-07-30.md) | Regole operative e stato generato |

**Migrazione documentale:** le sezioni sotto sono il reperto del 23 giugno. Il divieto di leggere i subtree del monorepo e i percorsi `~/lessonos`/`~/maestro-studio` descrivevano la situazione prima del cutover; non sono istruzioni correnti. Gli stati `EXISTS/MISSING`, le percentuali e le priorità di giugno non si trasferiscono all'ottobre 2026. Le regole Core/Plugin/Pack/Workflow restano utili; i loro consumer vanno verificati nel candidato corrente.

## Archivio: indice del 23 giugno 2026

Spec canoniche del prodotto/architettura, ricavate dai repo reali e verificate firsthand (workflow `wf_a3b09ee4`, 10 agenti, file:riga). Autorità: queste 4 + questo indice. NON marketing.

## I quattro documenti
1. **[ARCHITECTURE-CANON](ARCHITECTURE-CANON.md)** — mappa sorgenti canoniche, regola di classificazione, 4 layer AS-IS vs AS-DESIGNED, confine Core da disegnare, persisted-vs-ephemeral, roadmap A–H grounded.
2. **[PRODUCT-CANON](PRODUCT-CANON.md)** — ARDESIA≠ELAB≠simulatore, reality-test camminato sullo stato reale, 2 modalità→`LessonMode`, funzioni Core cross-materia, statement moat onesto, responsive, tagli duri.
3. **[PLUGIN-MARKETPLACE-CANON](PLUGIN-MARKETPLACE-CANON.md)** — `ArdesiaPluginManifest` (as-built + `kind`/visibility/marketplace da-aggiungere), kernel sicurezza, 2 item aperti (TOCTOU, bundleHash), wire-reachability, tipi vendibili, P0=montare l'host.
4. **[ELAB-AS-PLUGIN-CANON](ELAB-AS-PLUGIN-CANON.md)** — stato brutale (ELAB = app intera in `plugins/`), split Simulation-Plugin vs ELABTutor-Pack, salvage/do-not-port file-ref, confine di decoupling + lint-gate.
5. **[ELAB-SCENE-FORGE-CANON](ELAB-SCENE-FORGE-CANON.md)** — il moat profondo: manuale→scena-fisica-fedele. Geometria ~60% esiste (pose+grid) / wire-path il 40% gap; `ElabScene`=`circuit-scene/2` (estendi non forkare); **hand-author 5 scene prima (consumer prima del producer)**, CV-forge differita; licenze AGPL=trap marketplace.

## La REGOLA DI CLASSIFICAZIONE (legge)
Universale → **Core Ardesia** · Strumento riusabile → **Plugin** · Materia/metodo → **Pack** · Sequenza vendibile → **Workflow**.

## I 3 fatti che cambiano il piano (verificati)
1. **Il plugin host è già costruito (production-grade) ma NON montato** (ed25519, kill-switch duale fail-closed, CSP, SES, rehash-at-mount in `maestro-studio host.ts:156`). Roadmap B = wire+manifest-`kind`+route, NON "costruire i primitivi".
2. **`plugins/elab-tutor` è l'intera app ELAB**, non un plugin (duplica auth/memoria/AI/report/lavagna). La "seconda app dentro Ardesia" è già in-tree.
3. **Manuali-come-oggetti-vivi + marketplace + UNLIM-tipato + memoria-per-studente-persistita = greenfield.** Esistono solo primitivi parziali (PDF board, study-pack route, intentSchema isolato, VolumeCitation ELAB-only).

## Correzioni oneste ai claim del vision
- `recall@10=0.23` → **MISMATCH**: nessuna metrica in `packages/engine`; il numero reale è il **floor live `recall@10≈0.21`** (`moat_gate.py`, `~/lessonos`).
- Manifest `kind:tool|pack|manual|workflow|copilot` → **MISMATCH** (non esiste; tutto è "tool") = gap #1.
- `plugins/elab-tutor` decoupled → **MISMATCH** (app intera copiata).
- CircuitScene `provenance` + `LessonMode` enum → **MISMATCH** (spec-only, 0/88, stringhe ad-hoc).
- README local-first/plugin-immutabili/AI-NON-insegna · PR#195 88-esperimenti · CircuitSolver MNA+path-tracing · ed25519+kill-switch → **MATCH**.

## P0 ACCOPPIATO (il primo passo, grounded)
**(a) montare il ToolHost in una route di produzione** (oggi unmounted; unico consumer = demo srcDoc che bypassa la firma) **+ (b) far montare ELAB attraverso l'host** via `renderEmbeddable()` (task **MOUNT-CANVAS** già in `ARDESIA-MAP`) **+ (c) lint/CI gate** che fallisce se in `plugins/elab-tutor/src/` riappaiono `{App.jsx,main.jsx}`/`auth/`/`supabase/functions/`.
Poi: aggiungi `kind` al manifest → estrai ELABTutor Pack (provenance-gated) → Manual-Reader data-model → UNLIM tipato (dry-run→preview→confirm→apply) → student-pack export → marketplace locale.

## Sorgenti canoniche (regola anti-divergenza)
Struttura = `~/ardesia` (Mini). Engine-behavior = `~/lessonos`. Studio-behavior = `~/maestro-studio`. ELAB = `~/VOLUME 3/PRODOTTO/elab-builder`. **Archivia `~/ardesia-monorepo`** (dup stale). NON studiare i subtree engine/studio del monorepo per il comportamento corrente.
