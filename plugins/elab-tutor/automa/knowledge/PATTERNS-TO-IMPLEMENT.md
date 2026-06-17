# Pattern da implementare — Prioritizzati per impatto

Fonte: 3 agenti di ricerca + audit manuale (2026-03-23)
Principio guida: "I framework sono baggage. I pattern sono gold."

## Da implementare SUBITO (prossimi 10 cicli)

### 1. Reflexion — Post-iteration reflection (1h)
Dopo ogni task: genera 1 frase "Attempted X, result Y, because Z. Next time: action."
Salva in Context DB. Inietta ultime 3 riflessioni nel prompt del prossimo task simile.
Costo: 1 call DeepSeek extra (~€0.005). Impatto: agent impara dai fallimenti.

### 2. Temporal validity — Knowledge con timestamp (30min)
Aggiungere `valid_from` e `superseded_at` al DB. Non sovrascrivere, marcare superseded.
Storia cambiamenti gratis. SQL: `ALTER TABLE knowledge ADD valid_from TEXT, ADD superseded_at TEXT;`

### 3. Checkpoint-resume — JSON state dopo ogni step (30min)
Se il loop crasha a metà task, il prossimo run riprende da dove si era fermato.
File `automa/state/checkpoint.json` con: step, task, files_changed, score_before.

## Da implementare SETTIMANA 1

### 4. PIVOT/REFINE gate (2h)
A metà ciclo IMPROVE, l'agent decide: CONTINUE, PIVOT, ABANDON.
Se dopo 3 tentativi sullo stesso task non migliora → ABANDON e passa al prossimo.

### 5. Misconcezioni nel prompt Galileo (2h)
Codificare le 3 misconcezioni (corrente si consuma, modello unipolare, batteria costante)
nel system prompt nanobot. Con trigger phrases e risposte correttive.

### 6. Warm-up Render (15min)
Cron job che pinga il nanobot ogni 10 min per evitare cold start.
`*/10 * * * * curl -s https://elab-galileo.onrender.com/health > /dev/null`

## Da implementare MESE 1

### 7. Streaming SSE per Galileo (3 sessioni)
Frontend: SSE handler in GalileoResponsePanel.jsx
Backend: nanobot deve supportare chunked responses
Impatto: latenza percepita da 17s a 2-3s

### 8. TTS — Galileo legge risposte (2h)
Web Speech API SpeechSynthesis con voce `it-IT`. Funziona ovunque.
Pulsante "ascolta" nelle risposte di Galileo.

### 9. Privacy by default — localStorage (1 sessione)
Verificare che ELAB non raccoglie PII. Progresso studente solo in localStorage.
Se serve cloud: flusso consenso parentale.

## NON implementare (decisione documentata)

| Pattern | Fonte | Perché NO |
|---------|-------|-----------|
| Graphiti full | getzep/graphiti | Serve Neo4j, overkill per 30 entries |
| Mem0 full | mem0ai/mem0 | LLM extraction non-deterministica, SQLite basta |
| LangGraph | langchain-ai/langgraph | Loop sequenziale, non serve DAG framework |
| OpenClaw full | openclaw/openclaw | Multi-channel dispatch irrilevante per ELAB |
| AutoResearchClaw full | aiming-lab | Paper generator, non product improvement |
| Voice recognition | Web Speech API | Chrome-only, 20% error rate bambini |
