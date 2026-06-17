# Multi-Galileo — Piano di Implementazione
## 28/02/2026

### Prerequisiti
- Design approvato: `docs/plans/2026-02-28-multi-galileo-design.md`
- Render Starter tier attivo ($7/mo)
- Nanobot v3.0.0 deployed e funzionante

---

## FASE 1: Prompt Specialisti (backend, ~30 min)
**Obiettivo**: Spezzare il monolite nanobot.yml in 4 prompt focalizzati

1. Creare `nanobot/prompts/` directory
2. Scrivere `circuit.yml` (~60 righe) — diagnosi, pin, breadboard, KVL/KCL, tag azione circuito
3. Scrivere `code.yml` (~60 righe) — Arduino, GCC, Serial, compilazione, tag azione codice
4. Scrivere `tutor.yml` (~80 righe) — pedagogia, quiz, navigazione, giochi, off-topic, tag azione generale
5. Scrivere `vision.yml` (~30 righe) — descrizione screenshot, analisi lavagna, NO tag azione
6. Estrarre catalogo esperimenti + componenti da nanobot.yml in `shared-context.yml` (dati condivisi)
7. Ogni prompt include: ruolo, paletti (cosa NON fare), tag azione consentiti, formato risposta

**Verifica**: Ogni prompt < 80 righe, paletti espliciti, nessuna sovrapposizione

---

## FASE 2: Orchestratore (backend, ~45 min)
**Obiettivo**: Refactor server.py — FASE 1-3 (capire, arricchire, routing)

1. Creare funzione `classify_intent(message, page_context)`:
   - Keyword match per 70% dei casi (~1ms)
   - Fallback a Groq flash per casi ambigui (~300ms)
   - Ritorna: `"circuit"` | `"code"` | `"tutor"` | `"vision"`
2. Creare funzione `build_specialist_context(intent, session_id, experiment_id)`:
   - Carica memoria individuale
   - Carica pattern collettivi per l'esperimento
   - Assembla contesto arricchito
3. Creare funzione `route_to_specialist(intent, message, context, images)`:
   - Carica il prompt yml giusto
   - Se vision=true E intent=circuit → chain: Vision prima, poi Circuiti
   - Se vision=true E intent!=circuit → Vision sola
   - Altrimenti → specialista singolo
4. Refactor `/tutor-chat` endpoint per usare orchestratore
5. Mantenere `/diagnose`, `/hints`, `/site-chat` invariati
6. Fallback: se specialista fallisce → Tutor con prompt completo (graceful degradation)

**Verifica**: `/tutor-chat` funziona come prima, ma routing a specialisti. Test con 5 messaggi tipo.

---

## FASE 3: Sistema Memoria (backend, ~30 min)
**Obiettivo**: memory.py — gestione individuale + collettiva

1. Creare `nanobot/memory.py`:
   - `get_individual_memory(session_id)` → carica dal session file
   - `update_individual_memory(session_id, signals)` → aggiorna errori/livello
   - `get_collective_patterns(experiment_id)` → carica da patterns.json
   - `update_collective_patterns(experiment_id, signals)` → incrementa contatori
   - `estimate_level(profile)` → principiante/intermedio/avanzato
   - `build_memory_context(session_id, experiment_id)` → stringa iniettabile
2. Creare `nanobot/patterns.json` con struttura iniziale vuota
3. Creare FASE 4 async nel server.py:
   - `extract_learning_signals(message, response, circuit_state)` → segnali
   - `async_learn(signals)` → fire-and-forget update memoria
4. Integrazione: orchestratore chiama `build_memory_context()` in FASE 2

**Verifica**: Dopo 3 messaggi, la memoria individuale ha dati. patterns.json si aggiorna.

---

## FASE 4: Auto-Screenshot Frontend (frontend, ~20 min)
**Obiettivo**: Il frontend cattura screenshot automaticamente quando serve

1. In `ElabTutorV4.jsx`, creare `shouldAutoScreenshot(message, context)`:
   - Parole visive: /cosa vedi|guarda|screen|mostrami/i
   - Tab lavagna/canvas: sempre
   - Errore circuito recente: auto
   - Cambio esperimento: 1s delay poi capture
2. Creare `captureCanvasScreenshot()`:
   - `html2canvas` o `canvas.toDataURL()` sul SVG del simulatore
   - Compressione JPEG quality 0.6, max 1.5MB
   - Ritorna base64
3. Modificare `sendChatMessage()` in ElabTutorV4:
   - Se `shouldAutoScreenshot()` → cattura e aggiungi al payload
   - Altrimenti → solo testo + pageContext
4. Arricchire il payload in `api.js`:
   - Aggiungere campo `pageContext` strutturato (non solo stringa)
   - Aggiungere campo `screenshot` (base64, opzionale)

**Verifica**: Dire "cosa vedi?" invia automaticamente screenshot. Tab canvas invia sempre.

---

## FASE 5: Sync Memoria Frontend-Backend (frontend, ~15 min)
**Obiettivo**: galileoMemory.js sincronizza con il backend

1. Aggiungere `syncToBackend(sessionId)` in galileoMemory.js:
   - POST `/memory/sync` con profilo localStorage
   - Chiamato ogni 5 messaggi o su tab close
2. Aggiungere `loadFromBackend(sessionId)` in galileoMemory.js:
   - GET `/memory/{sessionId}` all'avvio sessione
   - Merge con localStorage (backend ha priorita')
3. Aggiungere endpoint `/memory/sync` e `/memory/{sessionId}` nel server.py
4. Gestione conflitti: timestamp piu' recente vince

**Verifica**: Chiudi tab, riapri → memoria caricata dal backend.

---

## FASE 6: Build, Deploy, Test (infra, ~15 min)

1. Build frontend: `npm run build` (0 errori)
2. Deploy frontend: `npx vercel --prod --yes`
3. Deploy nanobot: push Docker su Render (auto-deploy da repo o manual)
4. Test end-to-end:
   - Messaggio circuito → routing a Circuiti ✓
   - Messaggio codice → routing a Codice ✓
   - Messaggio teoria → routing a Tutor ✓
   - "Cosa vedi?" con esperimento caricato → Vision + screenshot ✓
   - Dopo 3 errori → memoria li traccia ✓
   - Secondo studente sullo stesso esperimento → pattern collettivi iniettati ✓

---

## Stima Tempi

| Fase | Tempo | Rischio |
|------|-------|---------|
| 1. Prompt specialisti | 30 min | Basso — e' split di contenuto esistente |
| 2. Orchestratore | 45 min | Medio — refactor core di server.py |
| 3. Sistema memoria | 30 min | Basso — modulo nuovo isolato |
| 4. Auto-screenshot | 20 min | Medio — dipende da canvas capture |
| 5. Sync memoria | 15 min | Basso — 2 endpoint semplici |
| 6. Build + deploy + test | 15 min | Basso |
| **Totale** | **~2.5 ore** | |

---

## Ordine di Dipendenza

```
FASE 1 (prompt) ──┐
                   ├──→ FASE 2 (orchestratore) ──→ FASE 3 (memoria) ──┐
FASE 4 (screenshot)────────────────────────────────────────────────────├──→ FASE 6
FASE 5 (sync) ─────────────────────────────────────────────────────────┘
```

FASE 1+4 possono partire in parallelo. FASE 2 dipende da 1. FASE 3 dipende da 2. FASE 5 indipendente. FASE 6 ultima.
