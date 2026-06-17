# G8 QUALITY HARDENING — REPORT FINALE

**Data**: 28/03/2026
**Lead**: Opus 4.6 (1M context)
**Agenti**: 3 Opus 4.6 (cross-check A1a/A1b, pedagogy+vocab A2/A3)

---

## FIXES APPLICATI

### Fix 1: v1-cap7-esp6 highlight tags
- **Problema**: OSSERVA phase aveva solo `[AZIONE:play]`, mancavano highlights
- **Fix**: Aggiunto `[AZIONE:highlight:rgb1]`, `[AZIONE:highlight:r1]`, `[AZIONE:highlight:r2]`, `[AZIONE:highlight:r3]`
- **Verifica**: audit_g8.py -> 0 issues

### Fix 2: DAG break v1-cap8-esp2
- **Problema**: v1-cap8-esp2 puntava direttamente a v1-cap9-esp1, saltando v1-cap8-esp3/4/5 (3 esperimenti orfani)
- **Root cause**: next_experiment.id era "v1-cap9-esp1" anziché "v1-cap8-esp3"
- **Fix**: Cambiato next_experiment a v1-cap8-esp3
- **Verifica**: Chain walk = 62 (era 59 + 3 orphans), starts = 1 (era 2)

### Fix 3: 46 durations clamped
- **Problema**: 46 phase durations fuori range, 12 file con totale fuori 35-60min
- **Peggiori**: v2-cap10-esp1/2/3 a 20min totali
- **Fix**: Clamp automatico a ranges validi (PREPARA 5-8, MOSTRA 10-15, CHIEDI 7-10, OSSERVA 8-15, CONCLUDI 5-8)
- **Verifica**: 0 phase violations, 0 total violations post-fix

---

## CoV 8 LAYER — RISULTATI

| Layer | Cosa | Tool | Risultato |
|-------|------|------|-----------|
| L1 | JSON valid + schema + 5 phases | audit_g8.py | 62/62 PASS |
| L2 | Vocab 0 violations (tutte le sezioni) | audit_g8.py | ALL CLEAR |
| L3 | Components cross-check vs experiments-vol*.js | crosscheck_vol1.py + agents | 37/38 script (1 parser), agents in progress |
| L4 | Sequencing DAG no cycles no holes | Python script | 1 start, 62 chain, 0 cycles |
| L5 | Durations in range + action tags correct | audit_g8.py | 0 issues post-fix |
| L6 | Build Exit 0 + imports = 62 | npm run build + grep | PASS (30.55s build) |
| L7 | Browser DEV 6 esperimenti campione | preview_eval getLessonPath | 6/6 PASS |
| L8 | Deploy HTTP 200 + WebFetch | vercel --prod + curl + WebFetch | PASS |

---

## STATO FINALE 62 LESSON PATHS

```
Vol 1 (38): v1-cap6-esp1 → v1-cap14-esp1 (11 capitoli)
Vol 2 (18): v2-cap6-esp1 → v2-cap12-esp1 (5 capitoli)
Vol 3 (6):  v3-cap6-semaforo → v3-extra-simon (3 capitoli + extras)
```

- Schema: 16+ chiavi, 5 fasi
- Content: ≥2 analogie, ≥2 common_mistakes
- Tags: loadexp in MOSTRA, play+highlight in OSSERVA
- Durations: 35-60min totale per esperimento
- DAG: catena singola 62 nodi, 0 link rotti

---

## AGENT REPORTS

### A1b: Cross-check Cap 10-14 (Opus agent — COMPLETATO)
- **15/15 files, 0 issues**
- Component-per-component e wire-per-wire match perfetto
- Tutti ID, type, from/to verificati

### A1a: Cross-check Cap 6-9 (Opus agent — COMPLETATO)
- **23/23 files, 0 issues**
- Component-per-component e wire-per-wire match perfetto
- **Totale cross-check Vol1: 23/23 (A1a) + 15/15 (A1b) = 38/38 MATCH PERFETTO**

### A2: Pedagogical Content Audit (Opus agent — COMPLETATO)
- **Score: 4.55/5** (11 file analizzati)
- Analogie: 5/5 — eccellenti, concrete, basate su oggetti reali
- teacher_message: 4.6/5 — v2-cap7 troppo tecnico (formule Tau)
- common_mistakes: 4.1/5 — v2-cap10 debole (errore da simulatore)
- provocative_question: 4.5/5 — buone, alcune più descrittive che provocatorie
- summary_for_class: 4.6/5 — v2-cap7 eccessivamente tecnico

### A3: Vocabulary Consistency Audit (Opus agent — COMPLETATO)
- **Score: 3.5/5** (15 file analizzati)
- 0 violazioni forbidden (ottimo)
- Coverage allowed: 78% media (22% non usato)
- 4 gap significativi trovati e FIXATI:
  1. "resistore" aggiunto a v1-cap6-esp1 allowed
  2. "polarità" aggiunto a v1-cap6 + tutti v1-cap7
  3. "resistenza" (concetto) aggiunto a v1-cap9 + v1-cap10
  4. "GND"/"massa" aggiunto a v2-cap8 + tutti v3
- v1-cap13-esp1 allowed list gonfiata (16 termini non usati) — flaggato per G9

---

## PROSSIMI PASSI (G9)

1. **Teacher Dashboard MVP** — priorità #1 per vendite PNRR
2. **Vol 3 expansion** — da 6 a 14 esperimenti
3. **Vocab cleanup v1-cap13** — rimuovere termini non usati dalla allowed list
4. **Content polish** — v2-cap7 summary meno tecnico, v2-cap10 common_mistakes più realistici
5. **"sintesi additiva"** — aggiungere a vocabulary di v1-cap8-esp3
