# Linguaggio codemod prep — Sprint U Cycle 1 audit follow-through

> iter 60 entrance Workstream B item 1 (Andrea iter-21+ mandate critico per `feedback_iter21_mandate_critical.md`).
> Status: AUDIT + PREP only — NO bulk apply yet. Andrea ratify scope decision pending PRIMA execute.

## Background

Sprint U Cycle 1 (2026-05-01) audit-1 + audit-2 trovato:
- **52 Vol1+Vol2 lesson-paths con singolare violations in teacher_messages** (almost universal "premi" in OSSERVA phase, audit `docs/audits/sprint-u-cycle1-iter1-audit-vol1-vol2.md`)
- **21 Vol3 lesson-path con singolare violations** (audit `docs/audits/sprint-u-cycle1-iter1-audit-vol3.md`)
- **28 Vol3 lesson-paths senza "Ragazzi" in teacher_msg**
- **91 teacher_messages missing "Ragazzi," opener** (cross-volume Sprint U Cycle 1 verdict)

Andrea iter-21+ mandate verbatim (per `feedback_iter21_mandate_critical.md`): "linguaggio plurale 'Ragazzi,' + cita Vol/pag VERBATIM = INVARIANTE" (Principio Zero non negoziabile).

## Sample empirical grep iter 60 (5 lesson-paths inventory)

Comando: `grep -nE '"(Premi|Fai|Clicca|Monta|Collega|Prendi|Prova|Inserisci|Apri|Chiudi|Cerca|Vedi)"' src/data/lesson-paths/{v1-cap6-esp1,v2-cap6-esp1,v3-cap6-esp1,v3-cap6-esp2,v3-cap7-esp1}.json`

Pattern emerso:
| File | teacher_tip style | Compliance plurale "Ragazzi"? |
|---|---|---|
| `v1-cap6-esp1.json` | SINGOLARE imperativo (`Usa`/`Chiedi`/`Evidenzia`/`Non dare`/`Non correre`) | ❌ VIOLATIONS |
| `v2-cap6-esp1.json` | PLURALE imperativo (`Chiedete`/`Mostrate`/`Fate l'analogia`/`Evidenziate`/`Fate il calcolo`) | ✅ COMPLIANT |
| `v3-cap6-esp1.json` | INFINITO neutrale (`Chiedere`/`Mostrare`/`Usare`/`Compilare`/`Insistere`) | ⚠️ NEUTRO non-plurale |
| `v3-cap6-esp2.json` | INFINITO neutrale (`Mostrare`/`Sottolineare`/`Lasciare`/`Rafforzare`) | ⚠️ NEUTRO non-plurale |
| `v3-cap7-esp1.json` | INFINITO + PLURALE misto (`Spiegare`/`Lasciare`/`Far notare`/`Sottolinearlo`) | ⚠️ MISTO |

**Anomalia**: pattern NON uniforme cross-volume. Vol1 = singolare ❌, Vol2 = plurale ✅, Vol3 = infinito ⚠️.

## Andrea ratify decision (BLOCKING PRIMA codemod bulk apply)

**Q-CODEMOD-1**: scope target per teacher_tip cross-volume:
- a) **PLURALE imperativo uniforme** (`Chiedete`/`Mostrate`/`Usate`) — stile Vol2 esistente, anti-pattern Vol1 singolare + Vol3 infinito. Fortissimo. Coerente "Ragazzi,".
- b) **INFINITO neutrale uniforme** (`Chiedere`/`Mostrare`/`Usare`) — stile Vol3 esistente, distacca docente da imperativo. Coerente con teacher_tip = brief NOT script.
- c) **HYBRID per Volume**: Vol1+Vol2 plurale (consistente Vol2 esistente), Vol3 infinito (consistente Vol3 esistente). Minimal change.
- d) Altro (Andrea decide).

**Q-CODEMOD-2**: scope target per teacher_messages (non teacher_tip):
- a) PLURALE "Ragazzi, premete..." (Andrea iter-21+ mandate verbatim)
- b) ... 
Recommended: PLURALE "Ragazzi, ..." per mandate iter-21+ esplicito.

**Q-CODEMOD-3**: bulk apply mode:
- a) Script automatic with whitelist verb mapping + dry-run preview + Andrea ratify per-file (slow but safe, ~73 file × ~3 sec review = ~4h Andrea time)
- b) Script automatic bulk apply + post-hoc review via git diff (fast but riskier, ~30 min apply + ~30 min review)
- c) Manual edit file-by-file (slowest, ~73 × ~5min = ~6h — but max control)

Recommended: a) — Andrea ratify per-file via Claude Code inline.

## Verb mapping proposed (PLURALE imperativo target — Andrea Q-CODEMOD-1 option a)

| Singolare imperativo | Plurale imperativo | Infinito neutrale |
|---|---|---|
| Premi | Premete | Premere |
| Fai | Fate | Fare |
| Clicca | Cliccate | Cliccare |
| Monta | Montate | Montare |
| Collega | Collegate | Collegare |
| Prendi | Prendete | Prendere |
| Prova | Provate | Provare |
| Inserisci | Inserite | Inserire |
| Apri | Aprite | Aprire |
| Chiudi | Chiudete | Chiudere |
| Cerca | Cercate | Cercare |
| Vedi | Vedete | Vedere |
| Usa | Usate | Usare |
| Chiedi | Chiedete | Chiedere |
| Mostra | Mostrate | Mostrare |
| Non dare | Non date | Non dare |
| Non correre | Non correte | Non correre |
| Evidenzia | Evidenziate | Evidenziare |
| Lascia | Lasciate | Lasciare |
| Spiega | Spiegate | Spiegare |

## False positive guards (skip transformations)

Contextual descriptive "premi" NOT command — leave unchanged (Sprint U Cycle 1 audit found 3 such cases V1V2):
- `"quando premi il pulsante"` — descriptive
- `"se premi"` — conditional
- `"premuto"` — past participle (already plural-neutral)
- `"premendo"` — gerund
- `"premere"` — infinitive (target style option b/c)

Regex guard: NOT transform if preceded by `quando |se |dopo |prima `.

## Estimated scope iter 60+ Workstream B item 1

- **73 lesson-paths/*.json** files (52 V1V2 + 21 V3 per Sprint U audit) — total ~3-5h Andrea review + apply
- **Risk**: JSON parse failure if regex bad — mitigation: dry-run JSON validate each file post-edit
- **Anti-regression gate**: vitest 13118 PRESERVED (lesson-paths tests must continue PASS)
- **Codex Pattern C-V**: `scripts/dev/codex-prompts/verify-lesson-path-edit.txt` per file

## Files iter 60 entrance (THIS deliverable)

- `docs/audits/2026-05-15-iter-60-linguaggio-codemod-prep.md` (this file, ~120 LOC) — audit summary + Andrea ratify queue
- `scripts/sprint-u/` directory created (empty — codemod script SCAFFOLD only after Andrea ratify Q-CODEMOD-1+2+3)

## Next action (iter 60+ post Andrea ratify)

1. Andrea ratify Q-CODEMOD-1 (PLURALE vs INFINITO vs HYBRID) — ~5 min
2. Andrea ratify Q-CODEMOD-2 (teacher_messages target) — ~5 min
3. Andrea ratify Q-CODEMOD-3 (apply mode) — ~5 min
4. Write codemod script `scripts/sprint-u/linguaggio-codemod.mjs` per ratified scope
5. Dry-run + sample preview 5 file
6. Andrea ratify sample preview
7. Bulk apply (or per-file iter) + Codex Pattern C-V verify each
8. Anti-regression vitest 13118 PRESERVED gate
9. Score iter 61+ delta progress

## NON COMPIACERE

- 73 lesson-paths NON modified iter 60 entrance — solo audit + Andrea ratify queue.
- Andrea Q-CODEMOD-1/2/3 BLOCKING for codemod script execute.
- Pattern non-uniforme cross-Vol1+2+3 = audit finding nuovo iter 60 (Sprint U non aveva catturato dettaglio per-Volume style divergence).
- Pre-script writing required Andrea decision — NO unilateral mass codemod.
