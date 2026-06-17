---
from: architect-opus
to: orchestrator
ts: 2026-04-26T11:33:00+02:00
sprint: S
iter: 2
ralph_loop: true
type: deliverable_complete
---

# architect-opus → orchestrator — Sprint S iter 2 deliverable

## Files prodotti

- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/adrs/ADR-008-buildCapitoloPromptFragment-design.md` (~600 righe)
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/adrs/ADR-009-principio-zero-validator-middleware.md` (~580 righe)

Nessun file fuori `docs/adrs/` toccato. CoV verificato: zero modifiche a `src/`, `tests/`, `supabase/`, `scripts/`, `automa/`, `CLAUDE.md`, `docs/audits/`, `docs/handoff/`.

## ADR-008 — key decisions

- **D1 Format**: Markdown con header `###` (NO XML, NO JSON) — Gemini-native
- **D2 Scope**: slice basato su experimentId, NON full capitolo (≤900 token vs 4500)
- **D3 Narrative**: solo `intro_text` + transition rilevante (escluso `closing_text` + `text_docente_action` meta-istruzione)
- **D4 Citazioni**: max 2 pre-selezionate, format `«...» Vol.N pag.X` esplicito anti-verbatim
- **D5 Wiki separation**: NO Wiki concept join nella fragment, blocco distinto (rispetta ADR-007)
- **D6 Token budget**: target 500-900, hard cap 1200 con truncation ordinata (testo_classe → citazioni → analogie)
- **D7 Failure modes**: capitolo null → return "", schema invalid → skip section, programmer-error → throw

## ADR-009 — key decisions

- **D1 Subset rule**: 6 su 12 a runtime (R1, R2, R3, R6, R7, R12) — fixture-driven e RAG-overlap restano bench-only
- **D2 Severity gate**: default OFF (log only) — opt-in via env `ELAB_PZ_GATE_CRITICAL=true` solo per R2 CRITICAL
- **D3 Audit log**: nuova tabella `unlim_pz_violations` (NO riuso `together_audit_log` per semantic mismatch)
- **D4 Performance**: budget <50ms totale (~11ms typical, fire-and-forget DB write)
- **D5 Heuristics**: regex only, NO ML, NO LLM-judge (latenza/costo)
- **D6 Locale**: IT only Sprint R1, struttura `LocaleRules` ready per multilingue futuro
- **D7 Telemetria**: query Supabase on-demand, NO Datadog/PostHog (GDPR + cost)

## Open questions per Andrea (decisioni richieste prima merge PR Sprint R1)

1. **Gate CRITICAL on/off default** (ADR-009 §2.2) — mio default OFF + telemetria 2 settimane. Andrea preferisce safety-first (ON immediato)? Trade-off: 5-10% risposte sostituite con fallback generico vs zero imperativi al docente. Flag env, flippabile senza redeploy.
2. **Fallback message wording** (ADR-009 §8.2) — copy proposto: `"Un attimo, lasciami riformulare. Ragazzi, vediamo insieme."` Andrea può sostituire.
3. **Token cap fragment 1200** (ADR-008 §2.6) — adatto a Gemini Pro (32K context). Per Together Llama 8B (8K context) ridurre a 600? Da rivedere dopo bench R5.
4. **Schema audit log `response_excerpt`** (ADR-009 §8.3) — 200 char per debug regex tuning. Privacy-pedante: escludere e tenere solo metadata? Mio default include.
5. **Default `includeClosing`** (ADR-008 §7.1) — false (mio default), override via opzione. OK?
6. **Cardinalità citazioni max 2** (ADR-008 §7.3) — alzare a 3? Trade-off: più ancora autorevole vs più rischio RULE 6 verbatim 3+ frasi fail.

## Suggested next step per generator-app-opus

**Ordine implementazione raccomandato Sprint R1 (PR atomica)**:

1. **Preparatorio** (10min, no LLM call): aggiungere migration SQL `supabase/migrations/YYYYMMDDHHMMSS_unlim_pz_violations.sql` da ADR-009 §2.3
2. **Modulo 1** (45min): creare `supabase/functions/_shared/principio-zero-validator.ts` con signature ADR-009 §3 + 6 rule runtime — questa è la "scarpetta" più semplice (regex pure, no I/O bloccante)
3. **Modulo 2** (60min): creare `supabase/functions/_shared/capitolo-prompt-fragment.ts` con signature ADR-008 §3 — più logica condizionale (slice mode, truncation), test snapshot importanti
4. **Wire-up** (30min): modificare `supabase/functions/unlim-chat/index.ts` integrando ENTRAMBI i moduli (ADR-008 §5 + ADR-009 §6) + RISCRIVERE BASE_PROMPT line 86-99 (`system-prompt.ts`) per Andrea call-out (master plan §4.4 testo letterale già pronto)
5. **Test** (60min): `tests/unit/supabase/principio-zero-validator.test.ts` (15 scenarios ADR-009 §7) + `tests/unit/supabase/capitolo-prompt-fragment.test.ts` (10 scenarios ADR-008 §6)
6. **CoV** (15min): `npx vitest run` 3 volte (target +25 test, baseline 12291 → 12316), `npm run build` PASS, `npx supabase functions deploy unlim-chat --dry-run` PASS

**Driver implementazione**: ADR-009 §6 wire-up code è copy-pasteable. ADR-008 §5 idem. ADR-008 §4 esempio output e §6 test scenarios guideranno generator-test-opus per snapshot fixtures.

**Rischi noti per generator**:
- Truncation logic ADR-008 §2.6 (ordine: testo_classe → citazioni → analogie) richiede stima token rough (parole * 1.3) — accettabile imprecisione 10%, NON usare tokenizer real per non aggiungere dependency.
- Fire-and-forget DB write ADR-009 §2.4 deve essere `void supabase.from(...).insert(...).then().catch(console.error)` — NON `await`. Se generator dimentica `void`, ESLint warning ma non crash.
- BASE_PROMPT riscrittura coordinata: NON splittare il PR — se ADR-008 va senza riscrittura, prompt resta verbatim-mandate e fragment è inutile.

## Stato CoV

- File ADR ben-formed (frontmatter YAML valido, sezioni complete)
- Riferimenti file:line citati con `tool:line` accuracy (system-prompt.ts:14, :135, :234, capitoli-loader.ts:60-70, score-unlim-quality.mjs:24-160)
- Zero codice eseguito, zero test girati (rispetto regola read-only)
- Comunicazione caveman in chat reply, ADR italiano normale per leggibilità
