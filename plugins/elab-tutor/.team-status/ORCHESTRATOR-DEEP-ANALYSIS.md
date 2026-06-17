# ELAB Automa Orchestrator — Deep Analysis
*Data: 2026-03-24 | Analisi: Claude Opus 4.6 (Explore agent)*

## Executive Summary

Il sistema autoresearch è ambizioso ma **praticamente inefficace**. Ha 9 layer di contesto, 5 modi, 3 AI esterne, self-exam — ma **nessun feedback loop chiuso**. Il sistema gira in cerchio, apparendo produttivo ma accumulando stato senza progresso.

## SCORECARD

| Aspetto | Score | Problema |
|---------|-------|----------|
| Context Management | 3/10 | 9 layer ma troncati a summary. Nessun link causale. |
| Evolution Capability | 2/10 | Cicli senza learning. No A/B testing. |
| Research Depth | 2/10 | Findings generati ma mai validati o integrati. |
| AI Tool Usage | 2/10 | Tool chiamati su schedule ma risultati ignorati. |
| Self-Exam Loop | 1/10 | Regole generate ma mai applicate. Loop rotto. |
| Prompt Quality | 4/10 | Completo ma contraddittorio, assume file che non esistono. |
| Mode Balance | 3/10 | Distribuzione bilanciata ma non reagisce a fallimenti. |
| Code Quality | 5/10 | Pulito e modulare, ma 7 bug trovati. |
| Testability | 2/10 | Accoppiamento stretto, nessun unit test. |
| Real-World Impact | 1/10 | Il sistema gira ma non migliora ELAB. |

## 7 BUG CRITICI TROVATI

1. **Skill files irraggiungibili**: prompt dice `cat .claude/skills/X/SKILL.md` ma l'agent non puo' leggerli
2. **Learned rules mai applicate**: regole in testo, nessun enforcement, nessuna misura
3. **Schema mismatch**: Agent SDK e claude headless ritornano JSON diversi, self_exam crasha
4. **Micro-research duplicata**: stessi topic ogni 16 cicli, stessi paper, nessun dedup
5. **Task priority ignorata**: select_mode() usa cycle%, ignora task P0 in coda
6. **Score regression non rilevata**: composite score loggato ma mai confrontato col precedente
7. **Gulpease troppo permissivo**: passa a 55, target e' 60 per scuole medie

## FEEDBACK LOOPS ROTTI

```
Self-exam genera regole → iniettate nel prompt → Claude le legge (forse) → nessuna verifica
                                                                              ↓
                                                                    LOOP ROTTO QUI
```

```
Micro-research trova paper → salvati in log → mai letti dal ciclo successivo
                                                         ↓
                                                   LOOP ROTTO QUI
```

```
AI scoring (DeepSeek 8/10) → scritto in feedback.log → mai aggregato → nessun trend
                                                                          ↓
                                                                    LOOP ROTTO QUI
```

## RACCOMANDAZIONI (ordinate per impatto/effort)

### Immediate (2-4h)
1. Fix learned rules: convertire in JSON eseguibile, enforcement in orchestrator
2. Fix skill files: iniettare contenuto skill nel prompt (non path)
3. Aggiungere score regression detection (alert se composite cala >5%)
4. Deduplicare micro-research (cache per topic)

### Medio termine (8-16h)
5. Chiudere il self-exam loop (misurare se le regole cambiano il comportamento)
6. A/B testing su modifiche al codice
7. Arricchire context DB (decisioni + reasoning, non solo fatti)

### Lungo termine (20h+)
8. Mode selection basata su score trend, non cycle%
9. Research → Task pipeline automatico
10. Skill marketplace con rating per successo

## CONCLUSIONE

> "The system runs in circles, appearing productive but accumulating status without progress."

Per essere efficace serve:
1. Regole eseguibili (JSON, non prosa)
2. Misura dei feedback (verificare che i miglioramenti siano avvenuti)
3. Integrazione decisionale (ricerca → task → codice → score)
4. Scheduling adattivo (reagire ai fallimenti, non ai cicli)
5. Reward espliciti (valutare approcci per successo, deprecare fallimenti)
