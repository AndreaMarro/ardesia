# PDR Sprint Q — Qualità risposta UNLIM + Refactor Capitolo + Percorso dinamico Wiki-based

**Data:** 2026-04-24
**Autore:** Andrea Marro + Claude (post-audit live)
**Scope:** precede Sprint 6 Day 39 OpenClaw dispatcher.
**Filtro dominante:** Principio Zero v3.1 (vedi `03-SPECS-PRINCIPIO-ZERO-V4.md`).

---

## Perché Sprint Q

Audit onesto 2026-04-24:
1. UNLIM risponde con stralci libro verbatim (non sintesi)
2. Struttura esperimenti tutor = flashcard catalog vs volumi = capitoli progressivi
3. Percorso è statico, non generato dinamicamente per classe/docente
4. Wiki L2 Karpathy 3 concept seed, target 25+
5. Memoria compounding classe + docente = ZERO

**Senza Sprint Q, Sprint 6 Day 39 OpenClaw dispatcher amplifica problemi.**

---

## Sprint Q — struttura Sprint-CoV-Audit

7 sotto-sprint bite-sized, ogni sprint ha:
- Task atomici TDD
- CoV 3x al termine
- Audit brutale onesto
- Gate pass rate > 85% prima prossimo

### Q0 — Analisi Tresjolie + mappatura Capitoli (4-6h)

**Obiettivo:** costruire mappa verità Capitoli da volumi Tresjolie.

**Task:**
- Q0.1 Parse PDF Tresjolie/1 ELAB VOLUME UNO/ per extract struttura (titoli, numeri capitolo, esperimenti, pagina, figure)
- Q0.2 Genera `docs/data/volume-structure.json` schema:
  ```json
  { "vol1": [
      { "cap": 1, "titolo": "...", "pages": [5,8], "theory_start": 5, "esperimenti": [] },
      { "cap": 6, "titolo": "Cos'è il diodo LED?", "pages": [27,34], "theory_start": 27, "esperimenti": [
          { "num": 1, "page_start": 29, "figure_refs": [{page: 28, fig: "LED anatomy"}] },
          { "num": 2, "page_start": 31, ... }
      ]}
  ]}
  ```
- Q0.3 Cross-check tutor lesson-paths (94) vs volume-structure → mapping Capitolo↔esperimento
- Q0.4 Audit gap: esperimenti tutor senza Cap parent, esperimenti volume senza tutor file

**Output:**
- `docs/data/volume-structure.json`
- `docs/audits/2026-04-25-tresjolie-vs-tutor-mapping.md`

**CoV:** script validazione schema + count esperimenti volume (~92+ dovrebbe matchare) vs tutor (94)

**Audit:** % esperimenti coperti, % gap, raccomandazioni refactor.

---

### Q1 — Refactor Capitolo (2-3 giorni)

**Obiettivo:** tutor usa Capitolo come unità pedagogica.

**Q1.A Schema Capitolo (3h)**

File: `src/data/schemas/Capitolo.ts` (NEW)
```ts
export const CapitoloSchema = z.object({
  id: z.string(),           // "v1-cap6"
  volume: z.number(),
  capitolo: z.number(),
  titolo: z.string(),
  pageStart: z.number(),
  pageEnd: z.number(),
  theory: z.object({
    testo_classe: z.string(),
    citazioni: z.array(z.object({ page: z.number(), quote: z.string() })),
    figure_refs: z.array(z.object({ page: z.number(), caption: z.string(), image_path: z.string().optional() })),
  }),
  esperimenti: z.array(z.object({
    id: z.string(),          // "v1-cap6-esp1"
    num: z.number(),
    narrative_from_prev: z.string().nullable(),
    page_start: z.number(),
    steps: z.array(PassoPassoSchema),
    componenti_necessari: z.array(z.string()),
  })),
  quiz_finale: z.array(QuizSchema).optional(),
});
```

**Q1.B Migrazione lesson-paths → Capitolo (8h)**

- Script migrazione: `scripts/migrate-lesson-paths-to-capitoli.mjs`
- Input: 94 JSON lesson-paths + volume-structure.json
- Output: `src/data/capitoli/v1-cap1.json`, `v1-cap6.json`, ..., `v3-capN.json`
- Per ogni Capitolo: aggrega N esperimenti correlati + fetch theory da RAG chunks pag_start-end

**Q1.C Service percorsoService refactor (3h)**

File: `src/services/percorsoService.js` (refactor)
- Nuovo API: `getCapitolo(capitoloId)`, `listCapitoliByVolume(volNum)`
- Legacy API mantenuta retrocompat: `getExperimentPath(expId)` → wrapper che risolve Cap parent

**Q1.D CoV 3x (1h)**

- Test unit: schema validate 14+27+27 Capitoli
- Test integration: percorsoService.getCapitolo("v1-cap6") → ritorna oggetto valido
- Baseline test regress check

**Q1.E Audit (1h)**

- Doc `docs/audits/2026-04-27-capitolo-refactor-audit.md`
- Percentuale Capitoli coperti
- Gap identificati

**Gate:** pass Q1 → Q2.

---

### Q2 — UI Percorso Capitolo (2-3 giorni)

**Obiettivo:** Lavagna mostra Capitolo come scroll narrativo.

**Q2.A Picker Capitoli (3h)**

- `src/components/lavagna/CapitoloPicker.jsx` (NEW)
- Grid Capitoli per volume (icon + titolo + N esperimenti)
- Click → apre Percorso Capitolo

**Q2.B Layout Percorso scroll (6h)**

- `src/components/lavagna/PercorsoCapitoloView.jsx` (NEW)
- Struttura scroll verticale:
  1. Teoria intro (citazioni + figure ref pag volume)
  2. Esperimento 1 (narrative_from_prev + passo-passo embedded)
  3. Esperimento 2 (...)
  4. ...
  5. Quiz finale
- Display grande (LIM), font 24px+, layout class-readable

**Q2.C Docente sidebar overlay (4h)**

- `src/components/lavagna/DocenteSidebar.jsx` (NEW)
- Sticky right side, width ~250px, sempre visibile durante Percorso
- Contenuto: "Ora: step X di esperimento Y. Cosa fare: [breve azione, max 2 righe]"
- Update reactive al scroll position

**Q2.D Citazioni volumi inline (2h)**

- Component `<VolumeCitation vol={1} page={27} />` → icon 📖 + text "Vol.1 pag.27"
- Click → apre VolumeViewer (esistente) a quella pagina
- Inserted automatically nel testo classe per ogni concetto core

**Q2.E CoV 3x (1h)**

- Playwright E2E: apri Capitolo → scroll → sidebar visibile → citazione cliccabile
- Visual regression (manuale)

**Q2.F Audit (1h)**

- Test docente LIM 10 sec: apre Capitolo 6, in 10 sec capisce cosa fare? SI/NO
- Doc `docs/audits/2026-04-28-percorso-ui-audit.md`

**Gate:** Q2 pass → Q3.

---

### Q3 — Prompt ibrido Edge Function UNLIM (1-2 giorni)

**Obiettivo:** UNLIM risponde con sintesi + linguaggio classe + citazioni precise.

**Q3.A Audit attuale Edge Function (2h)**

- Leggi `supabase/functions/unlim-chat/index.ts` + BASE_PROMPT
- Test 10 prompt reali → screenshot risposte
- Doc `docs/audits/2026-04-29-unlim-edge-function-audit.md`

**Q3.B Migra state-aggregator design → Edge Function (6h)**

- Portare logica `scripts/openclaw/state-snapshot-aggregator.ts` in Deno Edge
- Prompt 4 fonti esplicite: LLM knowledge + live state + memoria + anchor (RAG non verbatim)
- PZ v3 validator middleware output

**Q3.C CoV 3x 20 prompt reali (2h)**

- Fixture `scripts/bench/workloads/tutor-qwen.jsonl` (20 prompt tutor reali)
- Run 3x, misura: % cita Vol/pag, % sintesi vs verbatim, plurale OK, max 60 parole

**Q3.D Iterate fino pass rate >85% (2-4h)**

- Se <85% → analizza fallimenti + iterate prompt
- Ogni iterate → CoV 3x

**Q3.E Audit (1h)**

- Doc `docs/audits/2026-04-30-unlim-prompt-cov-audit.md`

**Gate:** >85% → Q4.

---

### Q4 — Wiki L2 espansione (2-3 giorni)

**Obiettivo:** 25+ concept markdown in `docs/unlim-wiki/concepts/`.

**Q4.A Lista concept target (30min)**

- Estrai da volume-structure.json Capitoli → estrai temi core
- 25 concetti: LED, RGB LED, resistenza, breadboard, batteria, pulsante, potenziometro, fotoresistore, cicalino, interruttore magnetico, elettromagnete, robot, transistor, MOSFET, diodo, condensatore, LDR, servo, PWM, Arduino, Scratch, legge Ohm, corrente continua, resistenza serie/parallelo, circuito chiuso

**Q4.B Team agent genera markdown (4-6h)**

Sessioni Claude Desktop locali parallele (chip branch `docs/wiki-l2-expansion-2026-04-24`):
- Agent scribe genera 5 concept/sessione × 5 sessioni = 25
- Ogni concept segue template `docs/unlim-wiki/SCHEMA.md`
- Include: definizione + analogia classe + volume_ref + esperimenti + errori + cross-link

**Q4.C Integra Wiki in percorsoGenerator (3h)**

- `src/services/unlim/percorsoGenerator.ts` legge Wiki L2 markdown
- Concept injection in prompt LLM runtime

**Q4.D CoV 3x mix citation (1h)**

- 20 prompt test: risposta mescola Wiki + RAG + LLM knowledge
- Cita volume corretto?

**Q4.E Audit (1h)**

- Doc `docs/audits/2026-05-02-wiki-l2-expansion-audit.md`

**Gate:** pass → Q5.

---

### Q5 — Memoria compounding classe + docente (1-2 giorni)

**Obiettivo:** `students/<classId>.md` e `teachers/<teacherId>.md` aggiornati dopo ogni sessione.

**Q5.A Schema Student/Teacher markdown (1h)**

- `docs/unlim-wiki/SCHEMA.md` aggiornato con sezione students/teachers
- Front-matter YAML: classId, livello, esperimenti_fatti, errori_ricorrenti, stile_docente, ecc.

**Q5.B Service writeStudentMemory (3h)**

- `src/services/unlim/studentMemoryWriter.js` (NEW)
- Dopo session end: LLM genera update markdown da session log
- Append su Supabase (client-side) + gitignored local markdown

**Q5.C Integrazione percorsoGenerator (2h)**

- percorsoGenerator legge student + teacher markdown come context
- Prompt include memoria compounding

**Q5.D CoV + audit (1h)**

**Gate:** pass → Q6.

---

### Q6 — Percorso dinamico generativo (2-3 giorni)

**Obiettivo:** UNLIM genera Percorso Capitolo ad hoc per classe X + docente Y.

**Q6.A Schema Percorso (1h)**

Come in `03-SPECS-PRINCIPIO-ZERO-V4.md` sezione 3.

**Q6.B Service percorsoGenerator (6h)**

- Input: capitoloId, classId, teacherId, liveState
- Output: Percorso JSON
- Call LLM con prompt ibrido (Wiki + memoria + anchor)
- Response format JSON validated

**Q6.C UI render Percorso dinamico (4h)**

- PercorsoCapitoloView carica da percorsoGenerator.generate()
- Fallback: se generator fallisce, render Capitolo statico (Q1/Q2)
- Loading state pulito

**Q6.D CoV 3x scenari (2h)**

- Scenario A: classe nuova, Cap 6 LED → percorso intro + 3 esp
- Scenario B: classe esperta, Cap 7 RGB → percorso avanzato
- Scenario C: classe con errori passati, Cap 6 → percorso adattato

**Q6.E Audit (1h)**

**Gate:** pass → onnipotenza Sprint 6 Day 39.

---

## Timeline stimata Sprint Q

| Sprint | Giorni | Dalla data | Alla data      |
|--------|--------|------------|----------------|
| Q0     | 0.5-1  | 25/04      | 25/04          |
| Q1     | 2-3    | 26/04      | 28/04          |
| Q2     | 2-3    | 29/04      | 01/05          |
| Q3     | 1-2    | 02/05      | 03/05          |
| Q4     | 2-3    | 04/05      | 06/05          |
| Q5     | 1-2    | 07/05      | 08/05          |
| Q6     | 2-3    | 09/05      | 11/05          |
| **Gate** | —    | **12/05**  | Sprint 6 Day 39 start |

**Totale Sprint Q: ~17-18 giorni**.

Se ritmo sostenuto + team agent efficace + Mac Mini loop H24 → possibile comprimere a 10-12 giorni.

## Risorse necessarie Sprint Q

### Computer
- MacBook Air Andrea (primario dev)
- Mac Mini (loop H24 + CI runner + Supabase staging)
- Weekend GPU benchmark €25 (parallelo non blocca Sprint Q)

### Claude subscriptions
- Claude Max (Desktop locale + cloud sessions)
- Anthropic API key GitHub Actions (TBD se attivare loop remoto)

### Skills/Team
- Agent scribe-sonnet per generazione markdown Wiki L2 (Q4.B)
- Agent generator-app per code (Q1, Q2, Q3, Q5, Q6)
- Agent generator-test per CoV (TDD strict)
- Agent evaluator-haiku per verdict ogni sprint gate

## Rischi e mitigazione

| Rischio                                      | Severità | Mitigazione                                  |
|---------------------------------------------|---------|----------------------------------------------|
| Sprint Q timeline triplicato vs stima       | ALTA    | Decomposizione bite-sized + team agent       |
| Refactor Capitolo introduce regressioni     | MEDIA   | TDD strict + baseline test gate              |
| Wiki L2 markdown generati incoerenti        | MEDIA   | Template SCHEMA.md + lint script             |
| Edge Function Deno porting state-aggregator | MEDIA   | Test fixture input/output identici           |
| Memoria classe GDPR concerns                | ALTA    | Solo metadati pseudonimi, no PII minori      |
| Percorso dinamico cost (LLM every session) | MEDIA   | Cache capitolo-generic + override personal   |
| GPU VPS trial budget overrun                | BASSA   | Weekend fisso €25 cap, no mensile            |

## Deliverable finali Sprint Q

1. `docs/data/volume-structure.json` (Q0)
2. `src/data/capitoli/*.json` (Q1, 14+27+27 = 68 file target)
3. `src/components/lavagna/CapitoloPicker.jsx` + `PercorsoCapitoloView.jsx` + `DocenteSidebar.jsx` (Q2)
4. `src/components/common/VolumeCitation.jsx` (Q2)
5. `supabase/functions/unlim-chat/index.ts` updated con prompt ibrido (Q3)
6. `docs/unlim-wiki/concepts/*.md` (25+ file, Q4)
7. `src/services/unlim/studentMemoryWriter.js` (Q5)
8. `docs/unlim-wiki/SCHEMA.md` updated schema student/teacher (Q5)
9. `src/services/unlim/percorsoGenerator.ts` (Q6)
10. Test coverage: baseline 12291 → target 13500+ (Q1-Q6 incrementi)
11. 7 audit document `docs/audits/2026-04-25...2026-05-11-*.md`

## Post-Sprint Q

1. Gate verification pass rate >85% tutte sessioni
2. Final audit `docs/audits/2026-05-12-sprint-q-final.md` con voto maturità prodotto
3. Merge tutti PR Sprint Q su main
4. Deploy Vercel auto
5. **Sprint 6 Day 39 dispatcher OpenClaw** (onnipotenza vera) parte.

## Confronto con Sprint 6 originale

Sprint 6 Day 39 rimane come pianificato in `docs/superpowers/plans/2026-04-23-openclaw-sprint6-l1-live.md`, ma parte DOPO Sprint Q completion.

Day 39+ userà:
- Capitolo schema (Q1) come unità tool-use (dispatcher può fare `mountCapitolo('v1-cap6')`)
- Wiki L2 (Q4) come context per tool-use decisions
- Memoria compounding (Q5) per personalizzazione tool choice
- Percorso dinamico (Q6) come output primary tool
