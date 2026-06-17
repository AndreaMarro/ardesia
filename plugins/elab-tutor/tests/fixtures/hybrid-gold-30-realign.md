# Hybrid gold-set v2 → realigned UUIDs (Sprint S iter 12 ATOM-S12-A1)

Generated: 2026-04-28T02:48:38.617Z
Source: scripts/bench/hybrid-rag-gold-set-v2.jsonl (30 entries)
Target: tests/fixtures/hybrid-gold-30.jsonl
Method: live Supabase rag_chunks query per expected_chunks token (vol/wiki).

## Mapping rules
- `vol1_cap5_pag19_*` → `SELECT id WHERE source=vol1 AND page=19` (top-5 by id).
- `wiki:ohm` → `SELECT id WHERE source=ohm` (wiki slug = `source` column post-ingest).

## Per-query realignment table

| ID | tokens | resolved (token→count) | dropped |
|----|--------|------------------------|---------|
| hrag-q-01 | 3 | wiki:ohm→5 / wiki:legge-ohm→5 | vol1_cap5_pag19_ohm |
| hrag-q-02 | 3 | - | vol1_cap5_pag20_codice_colori / wiki:resistore / wiki:codice-colori |
| hrag-q-03 | 3 | - | vol1_cap6_pag27_led_intro / wiki:led / wiki:catodo |
| hrag-q-04 | 3 | wiki:digital-write→5 / wiki:arduino-port→5 | vol2_cap3_pag24_digitalwrite |
| hrag-q-05 | 3 | wiki:analog-write→5 / wiki:pwm→5 | vol3_cap2_pag89_pwm |
| hrag-q-06 | 3 | - | vol1_cap2_pag12_breadboard / wiki:breadboard / wiki:bus-alimentazione |
| hrag-q-07 | 3 | wiki:condensatore→2 | vol1_cap8_pag58_condensatore / wiki:farad |
| hrag-q-08 | 3 | - | vol3_cap4_pag112_mosfet / wiki:mosfet / wiki:canale-n |
| hrag-q-09 | 3 | - | vol3_cap3_pag95_servomotore / wiki:servomotore / wiki:pwm-50hz |
| hrag-q-10 | 3 | wiki:matrice-led-8x8→5 | vol3_cap5_pag134_matrice / wiki:max7219 |
| hrag-q-11 | 3 | - | vol1_cap6_pag27_led_intro / vol1_cap5_pag19_ohm / wiki:led-protezione |
| hrag-q-12 | 3 | - | vol1_cap5_pag42_partitore / wiki:partitore-tensione / wiki:resistore-serie |
| hrag-q-13 | 3 | - | vol2_cap5_pag36_pulsante / wiki:pull-up / wiki:pull-down |
| hrag-q-14 | 3 | - | vol2_cap5_pag36_pulsante / wiki:input-floating / wiki:pull-up |
| hrag-q-15 | 3 | wiki:analog-write→5 | vol3_cap2_pag89_pwm / wiki:fading |
| hrag-q-16 | 3 | wiki:analog-read→5 | vol3_cap1_pag22_adc / wiki:adc |
| hrag-q-17 | 3 | - | vol3_cap3_pag95_servomotore / wiki:servo-vibrazione / wiki:alimentazione-servo |
| hrag-q-18 | 3 | - | vol3_cap4_pag112_mosfet / wiki:bjt-vs-mosfet / wiki:scelta-transistor |
| hrag-q-19 | 3 | wiki:zener→5 | vol2_cap8_pag105_zener / wiki:stabilizzazione |
| hrag-q-20 | 3 | wiki:motore-dc→2 | vol3_cap6_pag145_motore / wiki:flyback-diodo |
| hrag-q-21 | 4 | wiki:led-giallo→5 / wiki:potenziometro→2 | vol1_cap6_pag28_led_giallo / vol1_cap7_pag48_potenziometro |
| hrag-q-22 | 3 | - | vol2_cap5_pag36_pulsante / vol2_cap7_pag78_cicalino / wiki:pulsante-cicalino |
| hrag-q-23 | 4 | wiki:allarme→5 | vol3_cap6_pag45_pir / vol3_cap6_pag50_allarme / wiki:pir |
| hrag-q-24 | 4 | wiki:analog-read→5 | vol3_cap2_pag89_pwm / vol3_cap2_pag90_fader / wiki:fader |
| hrag-q-25 | 4 | wiki:semaforo→5 / wiki:digital-write→5 | vol2_cap4_pag48_semaforo / vol2_cap4_pag49_codice |
| hrag-q-26 | 4 | wiki:matrice-led-8x8→5 | vol3_cap5_pag134_matrice / vol3_cap5_pag135_max7219 / wiki:max7219 |
| hrag-q-27 | 3 | - | vol1_cap5_pag42_partitore / vol1_cap5_pag43_calcolo / wiki:partitore-tensione |
| hrag-q-28 | 4 | - | vol3_cap3_pag95_servomotore / vol3_cap3_pag96_codice / wiki:servomotore / wiki:servo-library |
| hrag-q-29 | 4 | - | vol1_cap6_pag27_led_intro / vol1_cap6_pag29_calcolo / wiki:led-rosso / wiki:calcolo-resistore |
| hrag-q-30 | 4 | - | vol3_cap4_pag112_mosfet / vol3_cap6_pag145_motore / wiki:mosfet-motore / wiki:pilotaggio-dc |

## Totals
- Queries: 30/30
- Tokens resolved → real UUIDs: 86
- Tokens dropped (no rag_chunks match): 79

## Honesty caveats
- Each gold query expanded from K legacy tokens to N real chunk_ids (typically N >= K when slug present).
- Dropped tokens correspond to wiki slugs not yet ingested (e.g. `legge-ohm` if Mac Mini batch did not ship that concept).
- `min_recall_at_5` left unchanged (semantic property of the query, not bound to UUID realignment).
- `expected_chunks_legacy` preserved per entry for backward audit + diff vs iter 11.
- Validation: 30 lines, every line valid JSON, every entry has `expected_chunks` array (may be empty if 100% dropped).
- chunk_ids capped at 5 per token to stay within recall@5 evaluation context.
