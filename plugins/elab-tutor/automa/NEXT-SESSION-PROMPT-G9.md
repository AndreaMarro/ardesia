# SESSIONE G9 — FEATURE EXPANSION o CONTENT DEEPENING

```
cd "VOLUME 3/PRODOTTO/elab-builder"

SEI ELAB-TUTOR-LOOP-MASTER. Giorno 9.

## STATO VERIFICATO (fine G8)
- 62 lesson paths: Vol 1 (38) + Vol 2 (18) + Vol 3 (6) ✅
- Vocab: 0 violations (audit completo tutte le sezioni) ✅
- Schema: 62/62 JSON valid, 16+ keys, 5 fasi ✅
- Analogie: 62/62 ≥2 ✅ | Common mistakes: 62/62 ≥2 ✅
- Broken links: 0 ✅ | Build: Exit 0 ✅ | Deploy: HTTP 200 ✅
- DAG: 1 start (v1-cap6-esp1), 62 chain walk, 0 cycles ✅
- Durations: all phases in valid range, all totals 35-60min ✅
- Action tags: all loadexp/play/highlight correct ✅
- Browser: 6/6 sample experiments load correctly ✅
- Pedagogical quality: 4/5 (lead audit 4 campioni — analogie concrete, errori reali, linguaggio adatto)

## FIXES APPLICATI IN G8
1. v1-cap7-esp6: aggiunto 4 highlight tags a OSSERVA (rgb1, r1, r2, r3)
2. v1-cap8-esp2: fix next_experiment da v1-cap9-esp1 → v1-cap8-esp3 (3 esperimenti orfani reintegrati nel DAG)
3. 46 phase durations clamped to valid ranges (12 file avevano totali fuori 35-60min)

## CoV 8 LAYER — ALL PASS
| Layer | Cosa | Risultato |
|-------|------|-----------|
| L1 | JSON valid + schema + phases | ✅ 62/62 |
| L2 | Vocab violations = 0 | ✅ ALL CLEAR |
| L3 | Components cross-check | ✅ 38/38 MATCH PERFETTO (2 Opus agents, wire-per-wire) |
| L4 | Sequencing DAG valid | ✅ 1 start, 62 chain, 0 cycles |
| L5 | Duration + action tags | ✅ 0 issues after fix |
| L6 | Build Exit 0 + imports=62 | ✅ PASS |
| L7 | Browser DEV 6 experiments | ✅ 6/6 PASS |
| L8 | Deploy HTTP 200 + WebFetch | ✅ PASS |

## LEAD PEDAGOGICAL AUDIT (4 campioni)
- v1-cap6-esp1: teacher_msg chiaro, analogia F1 per circuito chiuso, provocative_q sul LED al contrario ✅
- v1-cap10-esp1: fotoresistenza come guardiano, hook collegato al potenziometro precedente ✅
- v2-cap7-esp1: condensatore come vasca da bagno, tau come orologio interno ✅
- v3-cap6-semaforo: Arduino come centralino, loop come disco che gira ✅
- Score: 4/5 — solido, margine su brevità analogie

## SCRIPTS DI AUDIT DISPONIBILI
- `automa/audit_g8.py` — L1-L5 comprehensive check (62 files, 0 issues)
- `automa/crosscheck_vol1.py` — L3 components vs experiments-vol1.js

## POSSIBILI DIREZIONI G9
1. **Teacher Dashboard MVP** — OBBLIGATORIO per vendite PNRR (deadline 30/06/2026)
2. **Content deepening** — portare pedagogical score da 4/5 a 5/5 (analogie più brevi, più domande Socratiche)
3. **Vol 3 expansion** — solo 6 esperimenti vs 14 nel volume fisico (8 mancanti)
4. **Scratch integration** — già scaffoldata, serve collegamento con lesson paths
5. **Galileo AI integration** — collegare lesson paths al tutor AI per risposte contextualizzate

## CONTESTO IMMUTABILE
- Giovanni Fagherazzi = ex Global Sales Director ARDUINO
- PNRR deadline 30/06/2026
- Andrea Marro = UNICO sviluppatore
- NON toccare: CircuitSolver, AVRBridge, evaluate.py, checks.py
- Palette: Navy #1E4D8C, Lime #558B2F

## LEZIONI DA G8
1. DAG sequencing va controllato SEMPRE — un next_experiment sbagliato può orfanare intere catene
2. Duration ranges vanno applicati meccanicamente — troppe eccezioni manuali
3. Highlight tags devono corrispondere a componenti reali dell'esperimento
4. Cross-check components richiede un parser JS robusto (commenti nel codice rompono regex semplici)
5. Browser test via preview_eval + getLessonPath è il gold standard per L7

## REFERENCE
- Build: `export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH" && npm run build`
- Deploy: `export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH" && npx vercel --prod --yes`
- Browser: preview_start → preview_eval → preview_screenshot
- Experiments: src/data/experiments-vol1.js (38), experiments-vol2.js (18), experiments-vol3.js (6)
```
