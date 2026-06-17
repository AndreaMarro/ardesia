# Decisioni prese il 2026-03-23 — Con evidenze

## Decisione 1: Memoria — SQLite basta, Graphiti/Mem0 overkill
- **Evidenza**: Benchmark Graphiti vs Mem0 mostra che entrambi aggiungono complessità (Neo4j per Graphiti, $249/mese per Mem0 graph features). Il nostro Context DB SQLite con 27 entries funziona.
- **Azione**: Continuare con SQLite enhanced. Rivalutare quando entries > 100.
- **Severity**: Low — non blocca nulla

## Decisione 2: LangGraph — Skip, file-based state machine basta
- **Evidenza**: LangGraph risolve problemi di crash recovery e branching che non abbiamo. Il nostro state.json + YAML queue è più semplice e debuggabile.
- **Azione**: Non aggiungere LangGraph. Il loop Python è sufficiente.
- **Severity**: Low

## Decisione 3: Voice — Solo TTS, recognition troppo fragile
- **Evidenza**: Web Speech Recognition è Chrome-only con 20% error rate per bambini. SpeechSynthesis (TTS) funziona ovunque.
- **Azione**: P2 — aggiungere Galileo TTS (legge risposte ad alta voce). NON implementare voice input come feature primaria.
- **Severity**: Medium — TTS migliorerebbe molto l'UX per bambini

## Decisione 4: Latency — Streaming SSE è il fix #1
- **Evidenza**: 17.6s breakdown mostra che LLM generation è il bottleneck principale. Streaming riduce percepito da 17s a 2-3s (time-to-first-token).
- **Azione**: P0 task già in coda. Ordine: streaming > keep-alive > prompt compress > cache.
- **Severity**: Blocker — 17.6s è inaccettabile per bambini

## Decisione 5: GDPR — Design zero-PII con localStorage
- **Evidenza**: Italia: consenso parentale obbligatorio sotto 14 anni. Garante aggressivo (TikTok €10M).
- **Azione**: NON raccogliere dati personali. localStorage-only per progresso studente. Se cloud: consenso parentale verificabile.
- **Severity**: High — rischio legale reale

## Decisione 6: Misconcezioni — Codificare nel system prompt Galileo
- **Evidenza**: Letteratura consolidata (Shipstone 1984, Osborne 1983). 3 misconcezioni prevedibili persistono nel 40-60% studenti.
- **Azione**: Modificare system prompt Galileo per riconoscere frasi indicative e correggere con analogie acqua-tubo. Annotare esperimenti YAML.
- **Severity**: High — core del principio 0 (docente inesperto deve poter insegnare)

## Decisione 7: Autoresearch — Adattare per prompt optimization
- **Evidenza**: Karpathy autoresearch funziona con 1 metrica scalare. ELAB può fare lo stesso con tag compliance su 200 domande come metrica.
- **Azione**: Futuro — dopo che il loop base è stabile. Non priorità immediata.
- **Severity**: Medium — alta potenzialità ma serve stabilità prima

## Decisione 8: evaluate.py v2 STRICT — Composite sceso da 0.90 a 0.72
- **Evidenza**: Il vecchio score era generoso (test gratis, Gulpease troppo facile, build binario). Il nuovo è onesto.
- **Azione**: Baseline v2: 0.7225. Target settimana 1: 0.80.
- **Severity**: N/A — è una calibrazione, non un problema
