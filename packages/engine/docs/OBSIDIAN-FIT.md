FILE: /Users/andreamarro/OBSIDIAN-FIT.md (51 righe, grounding da ~/maestro-mirror/lessonos: SCHEMA.md §2-4, lessonos/export/, derived/db/lessonos.db, pin-format MILESTONES.md)

# OBSIDIAN-FIT.md — Verdetto Obsidian per MAESTRO

Data: 2026-06-12. Metodo: scout multi-fonte + verifica adversariale su fonti primarie (obsidian.md/blog+terms, github.com/obsidianmd/jsoncanvas LICENSE via API, docs.obsidian.md, registry community-plugins.json). Solo claim verificati. Vincoli rispettati: Obsidian closed-source NON embeddabile; file nostri/aperti; zero costi runtime; motore = verità, vault = proiezione.

## 1. Verdetti per caso d'uso

**U1 VIEWER — ADOPT.**
Legalmente verde su due fonti primarie indipendenti (gratis per uso commerciale dal 20/02/2025: blog + changelog ToS; il ToS vieta solo redistribuire l'app, non i vault generati da terzi). Tecnicamente quasi-gratis: derived/ è già markdown-as-truth, manca solo la proiezione grafo→wikilink. Risolve ORA la frizione misurata (il docente non vede mai grafo/dispense) a costo zero e lock-in zero (.md standard).

**U2 EDITOR/CURATION — DEFER (design esplicito in v2).**
Conflitto frontale con la dottrina "derived rigenerabile": l'edit umano in derived/ verrebbe sovrascritto. Richiede una decisione architetturale (namespace `human/` separato letto dal motore come input, oppure flag frontmatter `human_edited`) PIÙ uno spike di 30 min: `vault.on('modify')` su scritture esterne è vero empiricamente ma NON garantito dalla doc primaria. Nessun bisogno immediato: la frizione misurata è di visione, non di curation.

**U3 JSON CANVAS — TRIAL (solo come export di vista, mai storage).**
MIT verificata (LICENSE nel repo ufficiale, spdx MIT): implementabile liberamente anche in prodotto commerciale. Limite verificato sulla spec 1.0: gli archi hanno solo id/from/to/side/end/color/label — NESSUN attributo semantico arbitrario → adeguato per snapshot del grafo prerequisiti (label="prerequisito"), inadeguato per `.lesson` (step/esercizi/progressione). Costo ~0 (un emettitore JSON dentro M1-7); valore da misurare col docente.

**U4 PLUGIN MARKETPLACE — DEFER (rivalutare post-traction).**
Fattibile ma sproporzionato per 10 docenti target (profilo non-Obsidian-user). Vincoli verificati: `isDesktopOnly: true` OBBLIGATORIO con API Node/Electron; il percorso di review standard richiede sorgente visibile su GitHub pubblico (closed-source = eccezione "case by case") → se mai, plugin = bridge open verso processo locale, motore proprietario FUORI dal plugin. Costo manutenzione API a ogni release > valore canale, oggi.

## 2. SPEC pin (U1 = ADOPT)

- **lessonos**: **M1-7 — VAULT-EXPORT Obsidian (proiezione read-only di derived/).** Nuovo modulo `lessonos/export/obsidian_vault.py` + comando CLI `export-vault --teacher andrea --out derived/vault/andrea/`. **ZERO LLM, ZERO modifiche al motore**: legge `derived/db/lessonos.db` (graph/evidence/segments, già scritti da `graph/writer.py`) e i markdown già in `derived/wiki/`, `derived/dispense/`, `derived/teacher_book/`. Mapping:
  - **concetto (nodo)** → `concetti/<slug>.md`; frontmatter YAML: `concept_id, teacher, lesson_ids, confidence, provenance, generated_by: lessonos, regenerable: true`.
  - **prerequisito (arco)** → sezione `## Prerequisiti` con wikilink `[[<slug>]]` (il graph-view li rende archi senza plugin).
  - **evidenza** → `trascrizioni/<lesson>.md` generata dai segments (seg_id 1-indexed, contratto SCHEMA.md §2), ogni segmento chiuso da `^seg-<id>`; la citazione nel concetto = `[[trascrizioni/<lesson>#^seg-<id>]]` + excerpt verbatim. SOLO citazioni VERIFICATE (regola grounding §3): mai seg_id nudi, mai evidence unverified.
  - **wiki/dispense/teacher_book** → copiati nel vault con wikilink-ificazione deterministica dei soli nomi canonici della resolution globale (`derived/global_resolution/andrea.json`), exact-match, no fuzzy.
  - **opzionale `--canvas`**: `grafo-prerequisiti.canvas` (JSON Canvas 1.0, nodi `type:file` → `concetti/`, edges `label:"prerequisito"`) = il TRIAL U3 dentro la stessa task.
  - **`README.md` nel vault**: "proiezione rigenerata dal motore — non editare qui; le modifiche vanno perse alla rigenerazione".
  Dottrina: vault DENTRO `derived/` → interamente rigenerabile; export idempotente (directory ricreata da zero a ogni run); `raw/` mai toccato.
  **Accettazione**: vault generato sulle 4 lezioni REALI di Andrea; aperto in Obsidian: graph-view leggibile (cluster per lezione, catene prerequisiti visibili — atteso ordine ~49 archi da M1-1c), click su una citazione salta al blocco `^seg-` verbatim; secondo run = vault identico (idempotenza); `git diff` vuoto sui moduli motore esistenti; nessuna feature proprietaria di plugin (no Dataview/Templater — solo md+wikilink+frontmatter+`^block`); gate verde; COMMIT IMMEDIATO a gate verde.

## 3. Conflitti con dottrina — onesto

- **markdown-as-truth**: COMPLEMENTA, non duplica. Nessun formato nuovo: rende navigabile il markdown già canonico. La verità resta motore (SQLite + derived/); il vault è una vista.
- **derived-rigenerabile**: COMPATIBILE solo perché il vault è read-only-per-convenzione dentro derived/. Ogni edit umano nel vault VIOLA la dottrina: è esattamente il motivo per cui U2 è DEFER finché non esiste il namespace `human/`.
- **basic-memory (TRIAL in corso)**: DUPLICA il pattern (vault-come-proiezione di memoria AI) ma non il dominio: basic-memory è memoria agente, M1-7 è output prodotto per il docente. Lezioni trasferibili (frontmatter, struttura), codice separato. Nessun conflitto.
- **R5 grafo-nativo in roadmap**: Obsidian NON sostituisce la UI nativa — la DE-RISCHIA. Osservare come il docente naviga il vault produce requisiti gratis per R5; il JSON Canvas emesso oggi è leggibile dalla futura UI (MIT). Quando R5 esiste, il vault degrada a export interop, non a debito.

## 4. Rischi top-3

1. **UX del target**: docenti 45-60 non-tech devono installare Obsidian e capire "vault"; il graph-view globale degrada oltre ~200 note (evidence community). Mitigazione: README nel vault, Local Graph per-concetto, tag per-lezione come filtro; fallback senza installazione = Quartz (MIT, repo vivo, push 11/06/2026).
2. **Edit accidentale del docente** → perso alla rigenerazione, percepito come data-loss. Mitigazione: README + `regenerable: true` in ogni frontmatter; fix vero solo col design U2.
3. **Dipendenza da app closed-source di terzi**: la policy è già cambiata una volta (02/2025, in meglio) e può ricambiare. Mitigazione strutturale: il vault non usa nulla di proprietario — gli stessi .md si aprono in VS Code/Typora/Quartz identici.

## 5. Cosa NON fare

- NON embeddare né redistribuire Obsidian nel prodotto (ToS: vietato distribuire il Software; il vault sì, l'app no).
- NON promettere il loop di curation U2 prima dello spike su `vault.on` per scritture esterne (non garantito dalla doc primaria).
- NON usare JSON Canvas come formato primario di `.lesson` o del grafo (niente attributi semantici sugli archi; SQLite resta la verità).
- NON costruire ora il plugin marketplace; se mai: plugin = bridge open-source, motore proprietario fuori (review richiede sorgente visibile, desktop-only obbligatorio).
- NON usare nel vault feature di plugin terzi (Dataview/Templater/Excalibrain): solo markdown+wikilink+frontmatter+block-ID = portabilità reale.
- NON editare derived/ a mano, nemmeno "solo una volta": il vault si rigenera, l'edit muore.