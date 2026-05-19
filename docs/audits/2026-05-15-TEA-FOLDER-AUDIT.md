# Tea Folder Audit — 2026-05-15

> Provenance: prep iter 63 entrance per mandate Andrea "FONDAMENTALE rivedi cartella TEA".
> Path: `/Users/andreamarro/VOLUME 3/TEA/`
> Files inventory: 30+ artifacts including 7 manuali volumi PDF + 6 zip OCR + briefs + planning docs.

## Inventory completo

### A. Top-level artifacts (per data)

| File | Size | Data | Provenance | Status |
|---|---|---|---|---|
| `10_idee_miglioramento_2026-04-13.docx` | 12.8 KB | 2026-04-13 | Tea consegna | Indexed CLAUDE.md, Dashboard/Glossario/Quaderno ideas |
| `analisi_complessita_esperimenti_2026-04-13.pdf` | 295 KB | 2026-04-13 | Tea consegna | 92 esp analizzati, 4 capstone, MOSFET problematico |
| `riepilogo_correzioni_github_2026-04-13.pdf` | ? | 2026-04-13 | Tea consegna | PR #73 mergiata (chunk error + icone + Scratch) |
| `schema_ux_semplificato_2026-04-13.docx` | ? | 2026-04-13 | Tea consegna | 3 zone Guida Docente toolbar 4 comandi |
| `2026-04-27-LAVORI-COMPLESSI-CON-CLAUDE/` | dir | 2026-04-27 | Tea workspace | Note workflow Claude |
| `2026-04-27-onboarding-tea-iter-7-close/` | dir | 2026-04-27 | Tea onboarding | iter 7 onboarding |
| `GLOSSARIO TEA 28 APRILE/` | dir 3 PDF | 2026-04-28 | Tea consegna | Glossario_Vol{1,2,3}_ELAB_2026-04-27.pdf |
| `MANUALE VOLUME 1 ITALIANO.pdf` + 2 + 3 | dir w/ markdown | 2026-05-12 | Davide volumi cartacei | OCR markdown extract |
| `MANUALE VOLUME 2 ITALIANO.pdf` + 2 + 3 | dir w/ markdown | 2026-05-12 | Davide volumi cartacei | OCR markdown extract |
| `Manuale vol 3 versione 0.13.pdf` + 2 | dir w/ markdown | 2026-05-12 | Davide v0.13 | OCR markdown extract |
| `ocr-playground-download-*.zip` × 6 | ~? KB | 2026-05-12 | OCR pipeline runs | Download artifacts |
| `Nuovo lavoro tea/` | dir 28 files | 2026-05-13 | Tea consegna recente | **CRITICAL** vedi sezione B |
| `elab-tutor-battlecard-2026-05.html` | ? | 2026-05-?? | Tea sales material | Battlecard sales |
| `iter-58-brief-tea.md` | ~? | 2026-05-15 | Claude brief | T1-T8 task assignment Tea iter 58 |
| `iter-58-brief-matteo.md` | ~? | 2026-05-15 | Claude brief | Matteo onboarding 2 giorni × 30 min |
| `PLAN-unlim-prof-pilot-chatgpt.md` | 35.9 KB | 2026-05-15 | Claude make-plan | Prof Pilot mode + ChatGPT Apps SDK + Vision breadboard |

### B. `Nuovo lavoro tea/` (consegna recente 2026-05-13, CRITICAL)

| File | Status | Use case |
|---|---|---|
| `album_studente_mockup.html` | 37 KB mockup | UI mockup album studente |
| `album_studente_spec.html` + `.pdf` | spec | Spec album studente |
| `bibbia_stilistica.pdf` | 65 KB | **Style bible per ELAB Tutor — design language** |
| `cliffhanger_table.json` | 30 KB | **Tabella cliffhanger esperimento → esperimento** (KEY narrative arc) |
| `elab-fumetti-consegna/` + `-v2/` | dir | Fumetti consegna V1 + V2 (UNLIM report) |
| `esp_v1_cap6_esp1_canonico.md` | 2.7 KB | **Schema canonico esperimento V1 cap6 esp1** |
| `f24.pdf` + `modello_f24.pdf` | doc fiscale | Out-of-scope (admin) |
| `fumetto_payload_esempio.json` | 8 KB | Schema payload fumetto report |
| `fumetto_pilota.pdf` | 46 KB | Pilot fumetto design |
| `fumetto_schema.json` | 12 KB | JSON schema fumetto |
| `mascotte_unlim.svg` + `_canonica.md` | 3.5 KB svg + 3 KB doc | **Mascotte UNLIM canonica** asset |
| `narrative_map.json` | 56 KB | **Mappa narrativa esperimenti** (KEY arc) |
| `punto1_standard_schema.pdf` | spec | Standard schema esperimenti |
| `punto2_mapping_narrativo.pdf` | spec | Mapping narrativo |
| `schema_dati_per_andrea.pdf` | spec | Data schema design |
| `standard_experiment_schema.json` | spec | **Schema standard esperimento (7-step canonical)** |

## Categorizzazione status

### CATEGORIA 1 — DA INTEGRARE PRIORITÀ MASSIMA (utility immediata)

1. `Nuovo lavoro tea/standard_experiment_schema.json` — **fonte ufficiale schema 7-step esperimenti** (CLAUDE.md Sprint S iter 7 brief tea T1 reference)
2. `Nuovo lavoro tea/cliffhanger_table.json` — **transizioni esperimento→esperimento** per arco narrativo continuo (Andrea mandate FONDAMENTALE)
3. `Nuovo lavoro tea/narrative_map.json` — **mappa narrativa esperimenti** (KEY ma audit iter-54 trovò 16/22 chapter title diversi dal libro stampato Vol3, e bookText Vol3 fabricated; allineamento iter 58 brief Tea T1 in corso)
4. `Nuovo lavoro tea/esp_v1_cap6_esp1_canonico.md` — **template canonico esperimento Vol1** (golden esempio struttura)
5. `Nuovo lavoro tea/bibbia_stilistica.pdf` — **style bible design language** (palette/font/iconografia/voce)
6. `Nuovo lavoro tea/mascotte_unlim.svg` + `_canonica.md` — **asset mascotte canonica**

### CATEGORIA 2 — TASK ATTIVI ITER 58+ (Tea consegne in corso)

7. `iter-58-brief-tea.md` — T1-T8 task assignment iter 58 settimana 2026-05-15→22
   - **T1 PRIORITÀ ALTA** (~60 min) Vol3 narrative arc review (audit iter 57 lavoro 30 esp + 4 chain capitoli)
   - **T2 MEDIA** (~90 min) Cap.8 narrative refactor draft
   - T3-T8 dettaglio non letto (read iter 63 P0)
8. `PLAN-unlim-prof-pilot-chatgpt.md` (35.9 KB) — Prof Pilot mode + ChatGPT Apps SDK + Vision breadboard validator + Anthropic Managed Agents Memory
   - Phase 0 documentation discovery DONE (Anthropic Dreams + Memory + Vision; OpenAI Apps SDK + MCP + ChatKit + Custom GPT Actions)
   - Decision points pending: residenza EU GDPR (Bedrock vs Vertex vs API direct), Custom GPT vs Apps SDK channel, Vision validator ground truth eval set
   - Status: **brainstorm/spec stage** — non implementazione
9. `iter-58-brief-matteo.md` — Matteo onboarding 2 giorni × 30 min (priorità BASSA, non blocking)

### CATEGORIA 3 — REFERENCE LIBRARY (sempre disponibili)

10. 7 manuali volumi PDF + markdown OCR — fonte ufficiale Davide volumi cartacei (vol 1 + 2 + 3 versions 0.13)
11. 3 glossari Vol1+2+3 (Tea consegna 2026-04-27)
12. `analisi_complessita_esperimenti_2026-04-13.pdf` — 92 esp analyzed con 4 capstone + MOSFET problematico
13. `schema_ux_semplificato_2026-04-13.docx` — 3 zone Guida Docente toolbar
14. `10_idee_miglioramento_2026-04-13.docx` — Dashboard, Glossario (DONE iter 35), Quaderno, Cronologia idee

### CATEGORIA 4 — SALES MATERIAL (non blocking sviluppo)

15. `elab-tutor-battlecard-2026-05.html` — battlecard sales (out-of-scope dev iter 63)

### CATEGORIA 5 — ARCHIVIO CANDIDATO (out-of-scope)

16. `f24.pdf` + `modello_f24.pdf` — documenti fiscali admin
17. `ocr-playground-download-*.zip` × 6 — artefatti pipeline OCR (mantenere temp, archive dopo iter 63)
18. `.DS_Store` × N — macOS metadata (cleanup)

## Gap identificati

1. **`bibbia_stilistica.pdf` NOT integrato** in `.impeccable.md` o CLAUDE.md design context — servono linee guida design extracted iter 63 P1
2. **`cliffhanger_table.json` NOT wire-up** Modalità Percorso/Passo Passo — narrative arc principio mandate Andrea
3. **`narrative_map.json` Vol3 PARZIALE** — audit iter-54 16/22 chapter title diversi, bookText Vol3 fabricated. Iter 58 T1 brief Tea allineamento in corso (review pending)
4. **`mascotte_unlim_canonica.md` NOT enforced** — possibili mascotte alternative in produzione non allineate a versione canonica
5. **`PLAN-unlim-prof-pilot-chatgpt.md` brainstorm freezing** — decisione channels (Custom GPT vs Apps SDK) + residency EU pending decision Andrea
6. **`Nuovo lavoro tea/punto*.pdf` SPEC docs** — non integrate codebase, servono review formali iter 63
7. **`elab-fumetti-consegna-v2/`** — payload fumetto design v2, integration MVP iter 36 shipped MA non wired (CLAUDE.md iter 36 close A-NEW PR #6 Fumetto MERGED MVP NON wired)

## Action items iter 63 entrance Andrea

| # | Action | Owner | Time | Priority |
|---|---|---|---|---|
| 1 | Read full `iter-58-brief-tea.md` T3-T8 task list | Claude iter 63 | 10 min | P0 |
| 2 | Wire-up `cliffhanger_table.json` Modalità Percorso transitions | Andrea + Claude iter 63 | 4h | P0 |
| 3 | Integrate `standard_experiment_schema.json` validator codebase | Codex iter 63 BG | 2h | P0 |
| 4 | Extract `bibbia_stilistica.pdf` design tokens → `.impeccable.md` | Claude iter 63 | 1h | P1 |
| 5 | Decide PROF PILOT mode channels (Custom GPT vs Apps SDK vs both) Andrea ratify | Andrea | 5 min | P1 |
| 6 | Tea iter 58 brief reply — compile responses T1-T8 | Tea | 2-3h × 2-3 giorni | P1 |
| 7 | Matteo onboarding kick-off | Matteo + Andrea | 30 min × 2 giorni | P2 |
| 8 | Archive 6 OCR zip + clean .DS_Store | Andrea | 5 min | P2 |
| 9 | Sales battlecard review | Andrea + Giovanni | TBD | P2 |
| 10 | Mascotte UNLIM enforcement audit (verifica produzione = canonica) | Codex iter 63 | 30 min | P2 |

## Tea responsabilità chiare iter 63 (Andrea direttiva)

Per Andrea mandate "Tea deve avere più responsabilità ma chiare, NON task vaghi":

**RUOLO CONSOLIDATO Tea iter 63+** (per CLAUDE.md team section):
- **Owner UX docente** — Modalità Percorso/Passo Passo narrative continuity (`narrative_map.json` + `cliffhanger_table.json`)
- **Owner volumi alignment** — Vol3 review iter 58 T1 + future v0.14+ alignment
- **Owner schema canonical** — `standard_experiment_schema.json` enforcement codebase
- **Owner style bible** — `bibbia_stilistica.pdf` design tokens authority
- **Owner UAT** — usabilità test docente target con kit fisico reale
- **Co-dev parallel** — Claude Code worktree dedicato Tea (no conflict Andrea worktree)

## Cross-link

- CLAUDE.md memory `feedback_iter21_mandate_critical.md` (volumi narrative refactor mandate)
- CLAUDE.md Sprint S iter 7 brief Tea (`SETUP-NEXT-SESSION/PROMPT-PER-TEA-2026-04-26-AGGIORNATO.md`)
- `docs/audits/2026-05-14-iter-57-close-audit.md` (Vol3 narrative arc rifatto base iter 57)
- `docs/audits/2026-05-14-epic1-a4-1d-clean-titles.md` (30 titoli puliti iter 57)
- iter 58 brief Tea + Matteo (in TEA folder root)
