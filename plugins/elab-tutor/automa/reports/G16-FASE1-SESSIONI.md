# G16 FASE 1 — Sessione Strutturata

**Data**: 28/03/2026
**Build**: PASSA (45s)

## Cosa è stato fatto

### useSessionTracker.js (NUOVO — ~190 LOC)
- Hook React: `useSessionTracker()`
- Auto-start sessione su evento `experimentChange` da `__ELAB_API`
- `recordMessage(role, text)` — registra domande utente e risposte UNLIM
- `recordAction(type, detail)` — registra azioni (experiment_loaded, highlight, play)
- `recordError(type, detail)` — registra errori (anche in unlimMemory per aggregazione)
- `finaliseSession()` — calcola summary deterministica, salva in localStorage
- Salvataggio automatico su `beforeunload` + `visibilitychange` (mobile Safari compat)
- Max 20 sessioni FIFO, max 100 messaggi/sessione
- Static helpers: `getSavedSessions()`, `getLastSession()`, `getSessionsForExperiment(id)`

### Struttura dati sessione:
```json
{
  "id": "sess_1711612800000_v1-cap6-esp1",
  "experimentId": "v1-cap6-esp1",
  "startTime": "2026-03-28T09:15:00.000Z",
  "endTime": "2026-03-28T09:45:00.000Z",
  "messages": [
    {"role": "user", "text": "cos'è un LED?", "timestamp": "..."},
    {"role": "assistant", "text": "Un LED è come una lampadina...", "timestamp": "..."}
  ],
  "actions": [
    {"type": "experiment_loaded", "detail": "v1-cap6-esp1", "timestamp": "..."},
    {"type": "highlight", "detail": "led1", "timestamp": "..."}
  ],
  "errors": [],
  "summary": "Accendi il tuo primo LED — 30 min, 5 messaggi. Nessun errore. Concetti: circuito_chiuso, LED_polarita, breadboard_base."
}
```

### Integrazione in UnlimWrapper.jsx
- `sessionTracker.recordMessage('user', text)` chiamato in handleSend PRIMA di inviare a Galileo
- `sessionTracker.recordMessage('assistant', cleanText)` chiamato dopo ricezione risposta
- `sessionTracker.recordAction('highlight', targetComponentId)` quando Galileo evidenzia un componente
- `sessionTracker.recordAction('welcome_shown', text)` quando il benvenuto viene mostrato

## Verifiche
| Check | Risultato |
|-------|-----------|
| Build exit 0 | ✅ |
| Hook creato | ✅ |
| Integrato in UnlimWrapper | ✅ |
| localStorage key definita | ✅ (`elab_unlim_sessions`) |
| beforeunload handler | ✅ |
| visibilitychange handler | ✅ |
| Max sessions cap | ✅ (20 FIFO) |
