# G10 Data Architecture — Da Demo a Reale

**Data**: 28/03/2026
**Decisione**: NON migrare a IndexedDB. localStorage è sufficiente per il caso d'uso attuale.

---

## Stato attuale (ONESTO)

### Cosa esiste e funziona
- `studentService.js` (564 LOC) — API completa su localStorage:
  - `logExperiment()`, `startSession()`, `endSession()`, `logActivity()`
  - `logConcetto()`, `logConfusione()`, `logMood()`, `addDiarioEntry()`
  - `getClassReport()`, `getAllStudentsData()`, `fetchStudentsFromServer()`
  - Server sync (fire-and-forget, `VITE_AUTH_URL` vuoto → sync MAI attivo)
- `simulator-api.js` (636 LOC) — pub/sub con `emitSimulatorEvent()`:
  - Eventi: `experimentChange`, `stateChange`, `serialOutput`, `componentInteract`, `circuitChange`

### Cosa NON funziona
1. **Zero wiring**: il simulatore emette eventi ma NESSUNO li ascolta per tracciare
2. **Zero userId**: nessun sistema di identificazione utente (no login)
3. **Dashboard mostra DEMO**: 6 studenti finti (Marco Rossi, Sofia Bianchi, ecc.)
4. **localStorage vuoto**: nessuno chiama studentService durante l'uso

### Perché NON IndexedDB
- localStorage: 5-10MB per origin — sufficiente per migliaia di sessioni
- Operazioni sync (no async/await overhead)
- studentService.js già implementato e testato
- Il bottleneck NON è lo storage, è il wiring

---

## Piano implementativo

### 1. Device-based userId (nessun login)
```
userId = localStorage.getItem('elab_device_id') || crypto.randomUUID()
```
- Generato al primo accesso, persistente
- L'insegnante NON fa login (decisione riunione 13/03: "NO account studenti per ora")
- Se serve identificare lo studente: nome opzionale nel profilo locale

### 2. studentTracker.js — Modulo bridge
Nuovo file: `src/services/studentTracker.js`

Responsabilità:
- Si registra come listener su `window.__ELAB_API.on()`
- Chiama `studentService` methods automaticamente
- Gestisce sessione corrente (start/end)
- Tiene contatori interni (play count, error count, ecc.)

Eventi tracciati:
| Evento simulator-api | → studentService call |
|---------------------|----------------------|
| `experimentChange` | `logExperiment()` + `logActivity('esperimento')` |
| `stateChange` (play) | Incrementa playCount, salva tempo |
| `stateChange` (error) | Incrementa errorCount |
| `serialOutput` | Log per debug (opzionale) |
| `componentInteract` | `logActivity('simulatore')` |
| Compilazione OK | `logActivity('compilazione-ok')` |
| Compilazione errore | `logActivity('compilazione-errore')` |
| Domanda Galileo | `logActivity('chat')` |

### 3. Integrazione punti di aggancio

#### NewElabSimulator.jsx
- `useEffect` che importa e inizializza `studentTracker.init()`
- Su unmount: `studentTracker.destroy()`

#### GalileoResponsePanel.jsx / Chat
- Quando l'utente manda un messaggio → `studentTracker.logChatInteraction()`

#### Giochi (Trova il Guasto, ecc.)
- Su game complete → `studentTracker.logGameResult()`

### 4. Teacher Dashboard — Da demo a reale
In `TeacherDashboard.jsx`:
- Rimuovere fallback a demo data (linee 319-324, 508-516)
- Se localStorage ha dati → mostrarli
- Se localStorage è vuoto → mostrare messaggio "Nessuno studente ha ancora usato il simulatore"
- MAI mostrare dati finti

### 5. Export/Import per aggregazione
- Teacher può esportare i dati di uno studente come JSON
- Teacher può importare JSON da altri dispositivi
- Questo sostituisce la necessità di un backend per ora

---

## Rischi e mitigazioni

| Rischio | Mitigazione |
|---------|-------------|
| localStorage cancellato dall'utente | Messaggio "Dati persi" + export periodico |
| Troppi dati in localStorage | FIFO: max 200 riflessioni già implementato, estendere a sessioni |
| Nessun userId → dati mescolati | Device ID unico, profilo opzionale |
| Teacher non vede altri studenti | Export/Import JSON (futuro: sync server) |

---

## Sequenza implementazione
1. `studentTracker.js` — 80-100 LOC, puro bridge
2. Wire in `NewElabSimulator.jsx` — 5-10 LOC
3. Wire in chat/giochi — 5-10 LOC per punto
4. Dashboard: rimuovere demo, leggere dati reali — 20-30 LOC
5. Messaggio "vuoto" se no dati — 10 LOC

**Totale stimato**: ~150 LOC di codice nuovo, ~30 LOC di modifiche
