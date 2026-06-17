# G16 AUDIT INIZIALE — "UNLIM RICORDA"

**Data**: 28/03/2026
**Build**: PASSA (48s, PWA 19 entries / 4,124 KB)
**Obiettivo**: Sessioni salvate + contesto classe + suggerimento prossima lezione

---

## Stato Memoria Attuale

### unlimMemory.js (ESISTE — 356 LOC)
- **Cosa salva**: profilo studente (esperimenti completati, quiz, errori frequenti, session summaries)
- **Cosa NON salva**: timeline messaggi UNLIM, azioni eseguite, errori specifici per sessione, tempo per fase
- **Backend sync**: implementato (nanobot /memory/sync) ma non usato per sessioni strutturate
- **buildMemoryContext()**: genera stringa per AI — solo dati aggregati, nessun contesto sessione

### sessionMetrics.js (ESISTE — 103 LOC)
- **Cosa traccia**: sessionStart, experimentStart, compilazioni, idle time
- **Persistenza**: ZERO — tutto in-memory, perso al refresh
- **formatForContext()**: `[METRICHE] sessione=Xmin, esperimento=Ymin, compilazioni=N`

### SessionRecorderContext.jsx (ESISTE)
- **Cosa traccia**: timeline eventi e snapshot circuito
- **Persistenza**: ZERO — React context, perso al refresh

### Lesson Paths (67 JSON)
- **session_save.next_suggested**: PRESENTE in tutti i 67 file ✅
- **session_save.resume_message**: PRESENTE in tutti i 67 file ✅
- **session_save.concepts_covered**: PRESENTE in tutti i 67 file ✅
- **Catena curriculum**: v1-cap6-esp1 → ... → v3-extra-simon (null = fine)

---

## Gap Analysis

| Funzionalità | Stato | Target G16 |
|-------------|-------|-----------|
| Sessione strutturata (messages+actions+errors) | ❌ | ✅ |
| Persistenza sessione in localStorage | ❌ | ✅ |
| Profilo classe (ultimo esp, concetti, errori) | ❌ | ✅ |
| Messaggio benvenuto contestuale ("Bentornati!") | ❌ (solo class_hook) | ✅ |
| Suggerimento prossima lezione | ❌ | ✅ |
| Contesto sessioni nel system prompt AI | ❌ | ✅ |

---

## Piano Implementazione

### FASE 1: useSessionTracker.js (NUOVO)
- Hook React che ascolta experimentChange → apre sessione
- Registra messaggi UNLIM (intercetta handleSend + risposte)
- Registra azioni (experimentChange, play, highlight)
- Registra errori (LED invertito via circuitChange)
- Al cambio esperimento o beforeunload → salva in localStorage
- Key: `elab_sessions` → array di sessioni
- Max 20 sessioni (FIFO)

### FASE 2: classProfile builder
- Al boot, legge tutte le sessioni salvate
- Costruisce: lastExperiment, conceptsLearned, commonErrors, nextSuggested
- Messaggio benvenuto: usa resume_message del lesson path
- Inietta nel buildTutorContext (via unlimMemory)

### FASE 3: Suggerimento prossima lezione
- Se nessun esperimento caricato → leggi lastExperiment → next_suggested
- Mostra overlay: "La prossima lezione è [X]. Vuoi iniziare?"

---

## File da creare/modificare

| File | Azione | LOC stimate |
|------|--------|-------------|
| `src/hooks/useSessionTracker.js` | NUOVO | ~180 |
| `src/services/classProfile.js` | NUOVO | ~120 |
| `src/components/unlim/UnlimWrapper.jsx` | MODIFICA | +60 |
| `src/services/unlimMemory.js` | MODIFICA (minor) | +20 |

**Totale stimato**: ~380 LOC nuove
