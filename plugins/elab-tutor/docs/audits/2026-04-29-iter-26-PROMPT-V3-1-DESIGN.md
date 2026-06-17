# Sys-prompt v3.1 design — iter 27 P0 (Vol/pag + kit mention)

**Date**: 2026-04-29 iter 26 prep  
**Target iter 27**: Vol/pag 46.7% → 70%+ AND kit_mention 33.3% → 70%+

## Bench iter 23 baseline (30 prompt gold-set)

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| ragazzi_opening | 100% | 90% | ✅ |
| word_count_ok ≤60 | 100% | 90% | ✅ |
| analogy_present | 90% | 90% | ✅ |
| **verbatim_quote** | 66.7% | 90% | -23.3pp |
| **vol_pag_citation** | 46.7% | 90% | -43.3pp |
| **kit_mention** | 33.3% | 90% | -56.7pp ⚠️ |

**Kit mention worse than Vol/pag**. Iter 27 prompt MUST address both.

## Root cause hypotheses

### Vol/pag failure modes
1. Mistral routing 65/25/10 (post iter 24) — Mistral Small/Large NON sempre cita verbatim
2. RAG retrieval wiki source NON sempre top-1 → context manca Vol.N cap.M
3. Few-shot examples 3 (iter 23) insufficient — Mistral parafrasa
4. Vol.N pag.M vs Vol.N cap.M format inconsistent (Tea data has cap, RAG chunks have pag, mix)

### Kit mention failure modes
1. System prompt menziona kit fisico generic ("kit + simulatore") — Mistral interpreta optional
2. NO few-shot example forced kit mention
3. Tea Glossario kids_explanation cita "breadboard" 60% volte, NOT systematic
4. Domanda gold-set NON mention kit explicitly → Mistral skip

## Sys-prompt v3.1 changes proposed

### Section 1: Reinforce verbatim citation

```
REGOLA CITAZIONE OBBLIGATORIA — applicabile SEMPRE quando RAG context disponibile:
- INIZIA risposta con "Ragazzi,"
- PRIMA frase: «testo verbatim chunk» — Vol.N cap.M (formato exact, NO variante "Vol N pag M")
- Estrai testo verbatim DAL chunk RAG content field, NON parafrasi NON sintesi
- Se più chunk wiki: scegli quello con term più rilevante alla domanda
```

### Section 2: Force kit mention

```
REGOLA KIT FISICO OBBLIGATORIA:
- OGNI risposta DEVE menzionare almeno UNO: breadboard, kit, kit fisico, kit ELAB, montate, inserite, costruite, cablate
- Position: ultima frase con invito azione concreta ("Provate sul vostro kit", "Costruite sul breadboard", "Cablate insieme")
- NON sostituibile con simulatore — kit fisico è protagonist (Principio Zero V3 mandate)
```

### Section 3: Few-shot examples 5 (vs current 3)

Add 2 NEW few-shot examples specific kit + verbatim:

**Esempio 4 — Domanda "Cosa è breadboard?" + RAG wiki hit:**
RISPOSTA: "Ragazzi, «La breadboard è una basetta di prototipazione composta da una griglia di fori collegati internamente in modo da permettere collegamenti rapidi senza saldature.» — Vol.1 cap.4. Pensatela come una scacchiera elettronica! Inserite componenti e fili nei fori del vostro kit ELAB e vedete tutto funzionare."

**Esempio 5 — Domanda "Pulsante Arduino come funziona?" + RAG wiki hit:**
RISPOSTA: "Ragazzi, «Il pulsante è un interruttore momentaneo che chiude un circuito quando premuto.» — Vol.3 cap.6. Pensate a un campanello! Sul vostro kit montate il pulsante con resistenza pull-up e collegate al pin digitale Arduino."

## Acceptance criteria iter 27

Bench 30 prompt + post-deploy verify:
- vol_pag_citation ≥ 70% (+23.3pp lift)
- kit_mention ≥ 70% (+36.7pp lift)
- verbatim_quote ≥ 80% (+13.3pp lift)
- ragazzi + word_count + analogy maintain 90%+

## Implementation iter 27 P0

1. Edit `supabase/functions/_shared/system-prompt.ts` add Section 2 (kit mandatory) + 2 NEW few-shot examples (Section 3)
2. Edge Fn deploy unlim-chat
3. Re-run `scripts/bench/vol-pag-regression-suite.mjs` 30 prompts
4. Verify metrics post-deploy
5. Iterate prompt v3.2 if conformance < target (max 3 iterations)
6. Commit + push

## Honest caveat

- Mistral routing 65/25/10 may behave differently per provider. Need provider-specific bench (Mistral Small vs Large vs Together).
- Few-shot bias: troppo strict = robotic, troppo loose = parafrasi. Sweet spot iter 27 verifica.
- Kit mention 33→70% = aggressive. Realistic 50-60% se Mistral resiste.

## Cross-reference

- iter 21 Linguaggio audit: 200 violations imperative singolare (codemod iter 29)
- iter 22 Tea Glossario 180 termini live (RAG hit working)
- iter 23 prompt v3 Vol/pag rule shipped (commit fdb97d9, 0/3 → 5/5 smoke 5 prompts)
- iter 23 bench 30 scale: 46.7% (smoke 100% cherry-pick)
- iter 25 Mistral routing live: 84% Mistral hit (smoke 25 calls)

## Next iter 27

After v3.1 deploy:
- Modalità 4 UI implement (ADR-025)
- Persona simulation 5 utenti REAL Playwright
- Harness STRINGENT criteria (UX layout + visual + linguaggio)
- L2 templates runtime loader (ClawBot 5.5 → 7.0)
