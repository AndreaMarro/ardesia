# Maker-3 Vol3 Phase 1 — Completed

- Date: 2026-05-07
- Sprint: Sprint U Cycle 2 Vol3 audit (PDF v0.13)
- Esperimenti audited: 9/9
- Audit file: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/automa/state/maker3-vol3-cap8-10-extras-audit.md`

## Verdetti chiave

### cap9 piezo GAP verdict: **CONFIRMED CRITICAL**
- PDF v0.13 cap9 "Il piezo: facciamo musica!" (NEW, 8 pagine 133-140) ha 2 ESERCIZIO numbered (9.1 LA 440 Hz tone()/noTone() + 9.2 pianoforte 4 pulsanti).
- Code experiments-vol3.js: ZERO esperimenti `v3-cap9-*` presenti.
- Verifica: `grep -nE "v3-cap9" experiments-vol3.js` → 0 match.
- Verifica: `grep -niE "ESERCIZIO 9\.[0-9]" /tmp/vol3-v013.txt` → 9.1 (line 4189) + 9.2 (line 4276) confermati.
- Gap totale 100% capitolo cap9 NON implementato.

### cap10 Simon naming verdict: **EXTRA NAMING WRONG**
- PDF v0.13 cap10 = "Il progetto finale: il gioco Simon" (esplicito line 4350 "CAPITOLO 10 IL PROGETTO FINALE: IL GIOCO SIMON" pag. 141).
- Code: id `v3-extra-simon` + `chapter: "Extra"` → semanticamente scorretto.
- Dovrebbe essere `v3-cap10-simon` (o `v3-cap10-esp1`) con `chapter: "Capitolo 10 - Il progetto finale: il gioco Simon"`.
- BONUS critico: pin assignments completamente diversi vs PDF (LED A0-A3 PDF vs D9-D12 code, buzzer D9 PDF vs D8 code, pulsanti D13-D10 PDF vs D3-D5-D6-D13 code, manca pulsanteDiAvvio 5° su D6 in PDF line 4660).

### Extras lcd-hello + servo-sweep status: **LEGACY V0.8.1 (entrambi)**
- Verifica grep v0.13: `lcd|servo|i2c|hd44780|liquidcrystal|sg90` → 0 menzioni hardware rilevanti.
- v3-extra-lcd-hello (line 4711-4894) + v3-extra-servo-sweep (line 4895-5034) sono entrambi orphan rispetto al PDF v0.13.
- Diagnosi: leftover dalla versione precedente del PDF (V0.8.1, capitoli display/servo poi rimossi).
- Anti-pattern Morfismo: "Esercizi software che esistono SOLO nel software (NON nel libro fisico)".

## Top 3 findings

1. **GAP CAPITOLO 9 PIEZO COMPLETO** (severity critical): 2 ESERCIZIO PDF mai implementati. Andrea iter 21+ mandate "esperimenti broken Playwright UNO PER UNO" deve includere creazione completa v3-cap9-esp1 + v3-cap9-esp2 (~2-3h impl, codice C++ esempio gia' presente nel PDF lines 4215-4238 + 4297-4341).

2. **SIMON NAMING + PIN MISMATCH CRITICO**: `v3-extra-simon` deve diventare `v3-cap10-simon` E avere pin allineati al PDF v0.13 (LED A0-A3, buzzer D9, pulsanti D13-D10, +pulsanteDiAvvio D6). Studenti che seguono libro fisico Omaric NON possono replicare schema software corrente. Morfismo Sense 2 pesantemente violato.

3. **EXTRAS LEGACY DA RIMUOVERE O ETICHETTARE**: v3-extra-lcd-hello + v3-extra-servo-sweep non esistono in v0.13. 2 path Andrea decision: (A) rimuovere strict, (B) etichettare "Bonus extra-curriculum non-Vol3" con badge UI separato + doc CLAUDE.md.

## Findings minori (severity high/medium)

- `v3-cap8-serial` DUPLICA `v3-cap8-esp1` (entrambi ESERCIZIO 8.1 PDF) + cita "Vol.3 pag. 87" sbagliato (vero pag. 119)
- `v3-cap8-esp5` claim "progetto finale Volume 3" (line 4442) e' falso — il vero capstone e' cap10 Simon
- `v3-cap8-esp6` (PDF line 4098 "barra progressiva tipo volume") MANCA in code (cap8 5/6 esp coverage)
- 5/5 esp cap8 hanno chapter field "Comunicazione Seriale" vs PDF "Visualizzare i dati: Il monitor seriale"
- esp1+esp2 includono breadboard non richiesta da PDF (PDF dice "non serve costruire circuito, basta cavo USB")

## Constraints respected

- NO src/ modifications
- NO test/build/git operations
- NO synthesis su contenuti incerti — tutti grep markers verificati
- File output solo in `automa/state/` + `automa/team-state/messages/`

## Files written

1. `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/automa/state/maker3-vol3-cap8-10-extras-audit.md` (audit principale)
2. `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/automa/team-state/messages/maker3-vol3-phase1-completed.md` (questa completion msg)
