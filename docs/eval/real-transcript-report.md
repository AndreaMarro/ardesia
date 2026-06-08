# M7 P1 — Real-transcript eval report (raw text, PLACEHOLDER fixture)

**Data:** 2026-06-09
**Fixture:** `fixtures/raw_transcript/lesson_derivatives.txt` (4225 chars, prosa continua su derivate)
**LLM:** Mock (test deterministici, veloci, gratis)
**Pipeline:** chunk_raw_text → ingest segmenti → assemble_lesson_capsule (LLM) → groundedness + excerpt-accuracy metrics

## Risultati (mock)

L'eval gira su mock e produce report strutturato con:

- **groundedness=1.00 (PASS)** — tutte le citazioni mock puntano a seg_id reali generati dal chunker
- **excerpt-accuracy=1.00 (PASS)** — ogni excerpt mock è substring del segmento referenziato
- **citations:** ≥1 per capsule (varia con mock payload)
- **chunks:** dipende dal chunking (paragraph/sentence/window)
- **topics:** LLM raggruppa chunk in topic

## Metriche qualità oneste

Il report include metriche aggiuntive oltre a groundedness/accuracy:

1. **chunks_with_topics** = num_chunks / num_topics — se ≈1.0, ogni chunk ha il suo topic (LLM non astrae)
2. **num_concepts** — quanti concetti estratti; se molto alto può indicare over-extraction
3. **failure_modes** — tuple di stringhe che documentano anomalie:
   - "LLM produced more topics than chunks" — over-splitting
   - "Each chunk got its own topic" — LLM re-labeling chunks invece di astrarre
   - "Very high concept extraction rate" — possibile over-extraction

## Failure modes identificati (mock, con segnalazione automatica)

| Failure mode | Come si manifesta | Rilevato automaticamente? |
|---|---|---|
| One-topic-per-chunk | LLM assegna un topic per ogni chunk | SÌ, chunks_with_topics ≈ 1.0 + failure_mode string |
| Over-splitting (più topic che chunk) | LLM produce topic senza corrispondenza chunk | SÌ, num_topics > num_chunks → failure mode |
| Over-extraction concetti | Concetti > 2× chunk count | SÌ, failure mode associato |

## Gap attuali (da risolvere con eval LIVE)

1. **Solo mock** — i veri failure modes su LLM reali (DeepSeek/Kimi) non sono ancora misurati. Il mock è deterministico e grounded by construction.
2. **Solo raw text** — VTT/SRT pipeline testata a livello chunker ma non ancora end-to-end con LLM su VTT reale.
3. **Nessuna misura qualitativa** — i concetti estratti sono sensati? Le topic sono ragionevoli? Questo richiede valutazione umana o LLM-as-judge.
4. **Chunking naive** — per paragrafo/frase/window può tagliare a metà un ragionamento. Il report misura ma non risolve — è un failure mode strutturale.

## Prossimi passi

- Eval LIVE con DeepSeek (richiede DEEPSEEK_API_KEY + debit account)
- Report failure modes reali su LLM production (non mock)
- Valutazione qualitativa dei concetti estratti da un umano o LLM giudice
