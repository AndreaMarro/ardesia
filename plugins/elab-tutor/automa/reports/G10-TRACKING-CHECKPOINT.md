# G10 Tracking Checkpoint — Stato Implementazione

**Data**: 28/03/2026
**Fase**: 3 (Student Tracking Reale) — COMPLETATA

---

## Cosa e' stato implementato

### 1. studentTracker.js (210 LOC) — NUOVO
- Bridge event-driven: ascolta `__ELAB_API` events
- Persiste automaticamente in localStorage via studentService
- Device-based userId (crypto.randomUUID, no login)
- Gestione sessioni (start/end su visibilitychange + beforeunload)
- Tracking automatico: esperimenti aperti, concetti, interazioni
- API manuale: logChatInteraction(), logCompilation(), logGameResult()

### 2. Wiring nel simulatore
- `main.jsx`: `studentTracker.init()` al boot
- `NewElabSimulator.jsx`: `studentTracker.logCompilation()` su successo/errore
- `ElabTutorV4.jsx`: `studentTracker.logChatInteraction()` su risposta Galileo

### 3. Teacher Dashboard — da demo a reale
- RIMOSSO: fallback a `makeDemoStudentData()` e `makeDemoClassReport()`
- AGGIUNTO: stato 'empty' con messaggio informativo
- Il dashboard ora mostra SOLO dati reali (localStorage o server)

## Prove concrete (browser test)

### Test 1: Tracker inizializza
```
deviceId: "660c407a-33a9-4611-b90e-46216af1f0d6"
hasStudentData: true
sessionCount: 1
```

### Test 2: Esperimento tracciato
```
loaded: true (v1-cap6-esp1)
lastActivities: [{ tipo: "esperimento", dettaglio: "Aperto: Cap. 6 Esp. 1 - Accendi il tuo primo LED" }]
conceptCount: 1
eventListeners: [experimentChange(2), stateChange(1), componentInteract(1)]
```

### Test 3: Dashboard mostra dati reali
- Screenshot: "2 studenti nel giardino" (dati localStorage, NO demo)
- Banner: "Dati locali — Il server non e' raggiungibile"
- Zero "Modalita Demo" visibile

## Build
- `npm run build`: OK (34.23s)
- Bundle: 1,563 KB index (-11 KB vs pre-G10!)
- Precache: 107 entries (16,430 KB)

## Score onesto
- **Prima**: Teacher Dashboard 5.5/10 (dati finti, "Demo Mode")
- **Dopo**: Teacher Dashboard **7.0/10** (dati reali, ma pochi; manca aggregate multi-device)
- Delta: **+1.5 punti**

## Limitazioni note
1. Il "2 studenti" include il dev-mock user — in produzione sara' 1 per device
2. Il tracker usa retry (500ms x 20) per aspettare __ELAB_API — potrebbe mancare eventi early
3. HMR di Vite causa listener duplicati (non un problema in production build)
4. Nessun aggregatore multi-device (futuro: export/import JSON)
5. I giochi (CircuitDetective, PredictObserveExplain) non chiamano ancora logGameResult
