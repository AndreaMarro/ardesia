# ARDESIA — Inventario sistematizzato di tutto il fatto (15/06/2026)

Mappa di TUTTO il lavoro esistente su 3 superfici (GitHub + Mac Mini + MacBook), classificato per progetto. Da workflow `wqww73ufu` (3 agenti read-only) + recon dirette di questa sessione. READ-ONLY: nessuna modifica. Collegato a [[00-PIANO-MAXDEV-2026-06-15]].

## TL;DR (le 4 verità che contano)
1. **Il codice ARDESIA attivo NON è su GitHub.** Engine (`lessonos`) e Studio (whiteboard) vivono **solo sul Mini** (+ working-clone studio sul MacBook). GitHub `lessonos` è **fermo dal 06-06**; `studio` non è su GitHub affatto. → **rischio durabilità**: se il Mini si perde, M1→M4 (centinaia di commit) spariscono.
2. **Il codice è AVANTI dei doc.** Sul Mini esistono e sono nel gate (live ~1780/0) i moduli M3/M4 (PathMemory/DidacticDelta/LearningDebt/NextLessonPlanner), ma `MILESTONES.md` certifica solo M0(1434)/M1(1608). La desync doc↔codice è la causa del gridlock NOOP.
3. **Tre progetti distinti, da non rimischiare:** ARDESIA (piattaforma) · ELAB (prodotto esistente = primo plugin, repo separato) · NUMERIA (separato, **triplicato** su GitHub). Più tanto **vecchio/morto**.
4. **Docs canonici = `ardesia-wiki`** (GitHub, auto-push 6h, vivo) + questo vault (governance umana, nuovo).

---

## ARDESIA-engine — `lessonos` (motore didattico)
| Dove | Cosa | Stato | Verità |
|---|---|---|---|
| **Mini `~/lessonos`** | Motore: ASR→capsule grounded→grafo→StyleProfile→dispense/recap/teacher_book; graph/{path_memory,didactic_delta,learning_debt,next_lesson_planner,queries,aggregator}; export multi-formato; llm/{router,deepseek,kimi,cost_ledger}; eval | **gate LIVE ~1780/0.** M0/M1 certificati; **M2-M4 a codice+test+CLI** (`run-path`) ma NON formalizzati in MILESTONES.md | ✅ **FONTE DI VERITÀ** (bare `~/lessonos.git`) |
| GitHub `AndreaMarro/lessonos` | mirror | **STALE 06-06** (auto/main 3471689→M3-task1; main 12 dietro) | ❌ mirror vecchio, loop non pusha più |
| MacBook `maestro-mirror/lessonos` | rsync 11/06 (non-git) | gate 1519 (già dietro) | copia datata |
| MacBook `MAESTRO-VAULT/andrea` | OUTPUT del motore (concetti/dispense/teacher_book) | rigenerabile | artefatto, non codice |

**Gap engine (vs visione):** ⭐ flagship `concetto→suggerisci-tool via betweenness` = **0 codice**; CRM per-studente assente (node_type = solo concept/exercise/lesson); 11 edge-type definiti, 3 emessi; retrieval solo-FTS5; M3/M4 non esposti come subcommand; course/planner LLM = stub; blind-test aperto.

## ARDESIA-studio — whiteboard + ToolHost marketplace
| Dove | Cosa | Stato | Verità |
|---|---|---|---|
| **MacBook `whiteboard-studio/studio`** | Lavagna + ToolHost (publish/install firmato ed25519, kill-list, revoca) + ELAB primo plugin (demo Blink) + Room/MathComposer/store | ToolHost T0-T3+T1 chiusi, S-DESIGN-1..10, **gate 138-471** | ⚠️ **working-clone SOLO qui** |
| Mini `~/studio.git` (bare) | bare repo (branch main/auto/main) | — | ✅ verità bare, **MA nessun working-tree sul Mini** |
| GitHub | — | **ASSENTE** | ❌ studio non è su GitHub |
| MacBook `whiteboard-studio/sim` | skeleton SIM-C (Blockly→IR→wokwi-led) pivot 08-09/06 | single-commit, **superato** da studio/ELAB-plugin | archivio |

**Fragilità:** studio = working-tree solo-MacBook + bare solo-Mini, **niente GitHub** → il più esposto. **Gap:** UI marketplace, palette tool, recensioni a-due-pesi, vista CRM, AI-suggest, SDK pubblicabile da terzi.

## ARDESIA-infra — automazione autonoma
- **Mini:** loop launchd `com.elab.lessonos-hourly` (300s, dual-lane driver-orch+driver-studio, maratona) · `eval/gate.sh` frozen · `bin/` (route, pick-build-model, promote_pin, autoheal, review-kimi, adversarial, opus/fable/codex…) · `maestro-tools/` (**tg-bridge.py** [fixato stasera: DeepSeek/Kimi/Gemini + watchdog], strategos, deepresearch, evolution) · launchd `com.ardesia.{audit,audit-adv,wiki-sync}` + `com.maestro.{tg-bridge,strategos}`.
- **MacBook:** `lessonos-supervisor` (launchd orario, **fragile** — laptop in sleep → buco 41h) · `maestro-audit/orch` (copia-per-file dell'orchestrazione Mini, **non-git** = "deploy per copia") · `broker` (FastAPI task-broker MacBook↔Mini, non-git) · `ardesia-audit-2026-06-15/` (snapshot read-only + i fix di stasera).

## ARDESIA-docs
- **`ardesia-wiki`** (GitHub, auto-push 6h, ultimo 06-15) = **canonico**: ARDESIA-ARCHITECTURE.md + ARDESIA-ALIGNMENT.md (governance). ✅ unico mirror GitHub fresco.
- **`ARDESIA-VAULT`** (MacBook, Obsidian, creato oggi) = governance UMANA: piano max-dev, audit, questo inventario, _proposte.
- Mini `maestro-docs/` (PLATFORM-MAESTRO, MAESTRO-VISIONE/PROGETTO, SUPERVISOR-MEMORY) + home `~/MAESTRO-*.md`/RnD/HANDOFF (visione/ricerca).
- `progettibelli/elab-context-hub` (GitHub) = brain-dump maggio **superato** da ardesia-wiki+MEMORY.md → archivio.

## ELAB-product (prodotto esistente = PRIMO PLUGIN ARDESIA, repo SEPARATO)
- **`elab-tutor`** (GitHub): simulatore Arduino + tutor Galileo/UNLIM + volumi + Lavagna. **main FERMO 28/05**, **814 branch** (sprawl auto/test-* + audit/* del loop), **14 PR aperti** (#196 consent, #197 gemini-tools, #198 unblock-CI, #199 eslint, ⚠️#200 scaffolda Numerical-Lab-Journey = cross-contaminazione con NUMERIA).
- **`PRODOTTO/elab-builder`** (MacBook): working-tree di elab-tutor + **~16 worktree** fratelli. `swarm1-isolated` = **worktree** di elab-builder (non repo separato).
- `elab-volumi` (markdown volumi, IP Davide Fagherazzi) · `elab-galileo-nanobot` (backend FastAPI, **stale 04-11**, sostituito in prod da **Supabase Edge Functions** unlim-chat) · `elab-website` (sito, stale 03-10).

## NUMERIA (progetto SEPARATO — mai confondere/toccare)
- `numeria-lab` (06-09, **canonico/attivo**, Next.js) · `numeria` (06-08, predecessore) · `numerical-lab-journey` (06-06, MVP Codex monorepo abbandonato) = **triplicato/drift** → consolidare su numeria-lab. + MacBook `MATJOURNEY` (corsi Algebra/Analisi/Fisica = materiale).

## VECCHIO / MORTO (candidati archivio/eliminazione)
- Org `elabtutor/*` (4 repo: copie ELAB marzo, morte) · `progettibelli/elabtutor` (vuoto).
- Repo junk/vuoti: StressTest, DM418Reasoning, BrutalDesignClone-3 (58MB), WebMirrorClone-12 (88MB), Apocalisse, FILTRO, LASTversion, sito, woooo, sturdy-disco… · fork: claudeco, COVID-19.
- MacBook: `_BACKUPS_OLD` (4 copie VOLUME 3), `VOLUME 3 copia 3`, `cartella senza nome` (vuota), `maestro-staging` (corpus PDF/audio Teoria-Segnali = dati grezzi, non codice), `elab-refs`, `mcp-servers`.

---

## Duplicazioni / drift da consolidare
1. **lessonos GitHub stale 06-06** ↔ Mini (M3/M4/eval non pushati). → **ripristina push GitHub** (Fase 0 del piano).
2. **studio: nessun GitHub**, working-tree solo-MacBook. → **studio→GitHub** (Fase 0).
3. **3 copie di lessonos sul MacBook** (mirror 06-11 + vault-output + nessun working-git).
4. **MILESTONES.md (M0/M1) ↔ codice (M3/M4 presenti)** = desync → **M3-RECONCILE** (Fase 0).
5. **NUMERIA triplicato** (numeria-lab/numeria/numerical-lab-journey) → consolidare (progetto separato, decisione tua).
6. **ELAB: 814 branch + org elabtutor dup** → cleanup massiccio (auto/test-*, audit/* del loop).
7. **PR #200 in elab-tutor** mischia Numeria dentro ELAB → non mergere/separare.
8. `maestro-audit/orch` = non-git ("deploy per copia") → mettere sotto VCS.

## Cosa è RIUSABILE subito per ARDESIA
- **Engine `lessonos` M0-M4** (capsule/grafo/StyleProfile/dispense/recap/learning-debt/next-lesson) = base solida, gate ~1780. Manca solo il flagship tool-suggest + CRM + retrieval-hybrid.
- **Studio ToolHost** (publish/install firmato ed25519) + **ELAB-sim come primo plugin** (demo Blink) = il marketplace è già avviato (dogfooding).
- **ardesia-wiki** = docs canonici già auto-sincronizzati.
- **ELAB-product** (elab-tutor): esiste e funziona → primo plugin, ma resta repo separato (harvest unidirezionale).

## Prossime mosse (allineate a 00-PIANO-MAXDEV §7 Fase 0)
Ripristina push GitHub lessonos · studio→GitHub · M3-RECONCILE (allinea MILESTONES↔codice) · cleanup branch/junk · poi antiregressione totale (CI+branch-protection). Il resto vive sul Mini come fonte di verità finché GitHub non torna corrente.
