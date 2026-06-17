# Review Accademica -- ELAB Tutor: Simulatore di Elettronica per Bambini

**Reviewer**: Full Professor, AI & Software Engineering (MIT, 20 anni di esperienza, autore di textbook su Embedded Systems Simulation e Educational AI)
**Data**: 14 febbraio 2026
**Oggetto**: Progetto ELAB Tutor (`/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/`)
**Metodologia**: Analisi statica completa di 141 file sorgente (~6.228 LOC nette, senza data files), con lettura approfondita dei 9 file critici (6.426 LOC totali). Analisi con grep automatizzato su 30+ metriche di qualita.

---

## VOTO COMPLESSIVO: 5.0 / 10

| Dimensione | Voto | Peso |
|---|---|---|
| Architettura Software | 4.5/10 | 25% |
| AI Integration | 5.5/10 | 20% |
| Simulator Engine | 6.5/10 | 25% |
| Build & DevOps | 5.0/10 | 15% |
| Security | 2.5/10 | 15% |

Il voto riflette un progetto che mostra ambizione tecnica notevole e competenza nel dominio (simulazione circuiti, emulazione AVR), ma che presenta lacune strutturali gravi su sicurezza, testabilita e manutenibilita. E il lavoro di un singolo sviluppatore talentuoso che ha bisogno di disciplina ingegneristica.

---

## I 3 MERITI TECNICI

### 1. CircuitSolver: Hybrid Path-Tracer + MNA con Convergenza Iterativa

**File**: `src/components/simulator/engine/CircuitSolver.js` (1.782 LOC)

Questo e il pezzo di codice piu impressionante del progetto. L'architettura del solver e genuinamente intelligente:

- **Union-Find per net connectivity** (righe 34-69): implementazione classica con path compression e union by rank. Corretta e efficiente -- O(alpha(n)) ammortizzato per operazione.
- **Dual solver strategy** (riga 1164-1173): il solver rileva automaticamente se il circuito ha percorsi paralleli (`_hasParallelPaths()`) e passa da path-tracing (O(V+E)) a MNA completo (O(n^3) con Gaussian elimination). Questo e un trade-off ingegneristicamente valido: i circuiti semplici dei bambini (Vol1/Vol2) sono quasi tutti serie, quindi il path-tracer basta. Solo quando serve (resistenze in parallelo) scatta il MNA.
- **Convergenza iterativa per non-linearita** (righe 313-343): il loop esterno con 5 iterazioni gestisce MOSFET, diodi e potentiometri. Il convergence check con snapshot serializzato e rozzo ma funzionale. La separazione tra `_preEvaluateSwitches()`, `_buildNets()`, `_markSupplyNets()`, `_solveAllLoads()` mostra buona comprensione del flusso di una simulazione DC.
- **LED come voltage source con forward resistance** (riga 942-960): modellare il LED come Vf + 20 ohm nel MNA e la scelta corretta (non una resistenza pura). Il loop iterativo per escludere LED reverse-biased (righe 1063-1080) e una soluzione elegante al problema della polarita.

**Nota critica**: Il Gaussian elimination (righe 1096-1150) e corretto ma naive -- nessun sparse matrix support. Per i circuiti di questo progetto (max ~30 nodi) non e un problema, ma non scalerebbe.

### 2. AVR Bridge: Architettura Dual-Mode con Fallback Graceful

**File**: `src/components/simulator/engine/AVRBridge.js` (1.070 LOC)

La decisione di supportare sia Web Worker che main-thread execution e architetturalmente solida:

- **Worker initialization con fallback** (righe 82-108): `try/catch` che degrada a main-thread se Worker non e disponibile. Il retry automatico (`_loadHexWorker` -> main thread, riga 128-139) se il Worker fallisce il caricamento hex e ben pensato.
- **Time-sliced execution via MessageChannel** (righe 592-633): Usare `MessageChannel.port1.onmessage` invece di `setTimeout(0)` per scheduling non-throttled e una scelta tecnica avanzata. Il throttling real-time (righe 596-611) confronta `performance.now()` con i cicli CPU attesi, evitando che la simulazione vada troppo veloce.
- **ADC Hook via writeHooks** (righe 346-372): Intercettare le scritture al registro ADCSRA per iniettare valori analogici simulati e l'approccio corretto per integrare input analogici senza modificare avr8js.
- **PWM duty cycle extraction** (righe 701-737): Leggere direttamente i registri timer OCRxn e i bit COMxn1 e il modo giusto per estrarre duty cycles dall'emulatore, senza polling continuo.

### 3. Rate Limiting e Content Moderation per Piattaforma Bambini

**File**: `src/services/api.js` (righe 33-165)

In un contesto educativo per bambini 8-14 anni, questa e una delle poche aree dove il progetto mostra maturita:

- **Doppio rate limit** (intervallo minimo 3s + massimo 10/minuto): protegge sia contro spam involontario che intenzionale. L'uso di `sessionStorage` per i contatori e appropriato (reset al chiudi tab).
- **Content moderation regex** (righe 139-148): Pattern per linguaggio volgare italiano, violenza, richieste dati personali, contenuti adulti. Non e perfetto (bypassed con typos), ma e un first-line defense ragionevole.
- **Error messages kid-friendly** (righe 106-132): "Galileo sta dormendo" invece di "404 Not Found" e esattamente il tono giusto per il target.
- **Moderation response predefinita** (righe 150-155): Redirect elegante verso il dominio dell'app invece di mostrare un errore.

---

## I 5 PROBLEMI CRITICI

### CRITICO 1: Autenticazione Interamente Client-Side -- Fondamentalmente Insicura

**File**: `src/services/userService.js`, righe 56-65, 72-78, 83-141

L'intero sistema di autenticazione vive in `localStorage`. Questo non e un sistema di auth: e un'illusione di auth.

```javascript
// userService.js:56-65
function dbRead(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch { return []; }
}
```

**Problemi specifici**:

1. **Password hash SHA-256 senza salt** (riga 72-78): SHA-256 nudo e vulnerabile a rainbow tables. Qualsiasi password comune e reversibile in secondi. Per bambini non e critico, ma per l'admin lo e.

2. **Admin password hash hardcoded nel client bundle** (riga 97): `c56bcbd957d6f0de92aba70b0ae029f9166909c7f9bf56376c313e1b993d4273` -- questo hash e visibile a chiunque faccia View Source. Il commento TODO a riga 88-91 lo riconosce ma non lo risolve.

3. **HMAC session signing con secret generato client-side** (righe 33-37): Il `SESSION_SECRET` e generato in `sessionStorage` se non c'e la env var. Questo significa che il secret vive nel browser dell'utente -- lo stesso utente che si sta cercando di "proteggere". E come dare la chiave della cassaforte al ladro.

4. **Tutti i dati social (post, commenti, gruppi) in localStorage** (righe 17-26): Nessuna persistenza cross-device, nessuna protezione da manipolazione, nessun backup.

**Severita**: BLOCCANTE per qualsiasi deployment in contesto scolastico reale. Un ragazzino sveglio di 12 anni con DevTools puo diventare admin in 30 secondi.

### CRITICO 2: NewElabSimulator.jsx -- God Component da 2.165 LOC

**File**: `src/components/simulator/NewElabSimulator.jsx` (2.165 righe)

Nonostante il refactoring dichiarato ("3.507 -> 1.831 LOC"), questo componente e ancora un monolite. Ho contato:

- **32 `useState` hooks** (righe 80-209): Ogni nuovo stato e un altro filo in un gomitolo gia inestricabile. `customLayout`, `customConnections`, `customComponents`, `customPinAssignments`, `selectedWireIndex`, `potOverlay`, `ldrOverlay`, `propsPanel`, `showGuide`, `showBom`, `showShortcuts`, `annotations`, `selectedAnnotation`, `exportToast`, `wireToast`, `isAskingGalileo`, `galileoResponse`, `circuitWarning`...
- **14 `useRef` hooks** (righe 101-113, 165, 213-221): Refs per solver, AVR, polling, pin map, compilation guard, timers, wire start, probes, TX LED -- tutto nello stesso scope.
- **5 `eslint-disable` comments** (3 nell'intero progetto sono in questo file): Segno che le dipendenze di `useEffect` non sono gestite correttamente.
- **Module-level state** (righe 65-66): `_avrSetupInProgress` e `_avrSetupExpId` sono variabili globali a livello di modulo -- un antipattern che sopravvive ai remount di React ma crea problemi con Strict Mode e testing.

**Raccomandazione concreta**: Serve `useReducer` con un state machine (o una libreria come XState) che gestisca le transizioni `idle -> loading -> ready -> running -> paused -> error`. Almeno 15 dei 32 useState possono essere consolidati.

### CRITICO 3: Zero Test Automatizzati

Ho eseguito `find src -name "*.test.*" -o -name "*.spec.*"` e il risultato e vuoto. Zero file di test. Per un simulatore di circuiti che fa calcoli fisici, questo e inaccettabile.

**Impatto concreto**:
- Il CircuitSolver ha 1.782 LOC di logica matematica non testata. La formula `1/Rtot = 1/R1 + 1/R2` (riga 657-672) potrebbe avere un off-by-one e nessuno lo saprebbe fino a quando uno studente non ottiene un risultato sbagliato.
- Il parser Intel HEX (AVRBridge riga 394-412) non ha test. Un singolo byte sbagliato puo mandare la CPU in un loop infinito.
- Le 69 esperimenti sono "testati" manualmente una volta, ma qualsiasi refactoring futuro non ha rete di sicurezza.

**Costo stimato per aggiungere test**: ~40 ore per una suite minima (unit test solver + integration test esperimenti). Ma ogni ora di ritardo moltiplica il debito tecnico.

### CRITICO 4: .env con Credenziali Reali Committato nel Progetto

**File**: `.env` (non in `.gitignore` correttamente, dato che il file esiste nella directory)

Il file `.env` contiene URL webhook di produzione reali:

```
VITE_N8N_CHAT_URL=https://n8n.srv1022317.hstgr.cloud/webhook/galileo-chat
VITE_N8N_LICENSE_URL=https://n8n.srv1022317.hstgr.cloud/webhook/elab-license
VITE_COMPILE_URL=https://n8n.srv1022317.hstgr.cloud
VITE_ACCESS_HASH=c56bcbd957d6f0de92aba70b0ae029f9166909c7f9bf56376c313e1b993d4273
```

Il `.gitignore` include `.env`, il che e corretto. Ma il fatto che il file esista nella working directory con credenziali reali, combinato con l'hash della password admin in chiaro sia nel `.env` (riga 32) che hardcoded nel codice sorgente (`userService.js:97`), crea una superficie di attacco doppia.

Inoltre, il prefisso `VITE_` significa che TUTTE queste variabili finiscono nel bundle JavaScript di produzione. Chiunque faccia View Source nel browser puo vedere gli URL dei webhook n8n. Questo non e un bug teorico: un attaccante puo inviare richieste direttamente ai webhook, bypassando rate limiting e content moderation.

### CRITICO 5: Nessun Router, Nessun State Management, Nessun Lazy Loading delle Route

L'applicazione non usa `react-router` (confermato da grep: 0 occorrenze). Il routing e gestito con `useState` in `App.jsx`. Questo significa:

- **Nessun deep linking**: Un insegnante non puo condividere il link a un esperimento specifico (`/simulator/v1-cap3-esp1`).
- **Nessun code splitting per route**: L'admin panel, il social network, il simulatore e il tutor sono tutti caricati nel bundle iniziale. Con un chunk principale da 1.305 KB, questo e un problema reale per connessioni scolastiche lente.
- **Nessun state management globale**: Lo stato dell'applicazione e distribuito tra `localStorage` (124 occorrenze in 22 file), `sessionStorage` (in `api.js`), `useContext` (solo `AuthContext`), e 32 `useState` nel simulatore. Non c'e una single source of truth.
- **Navigazione browser rotta**: Il tasto "Back" del browser non funziona correttamente perche non c'e history management.

---

## LE 5 RACCOMANDAZIONI CONCRETE

### R1: Migrare l'Auth a un Backend Reale (Priorita: BLOCCANTE)

**Effort**: 20-30 ore

L'intero `userService.js` (794 LOC) deve essere riscritto come backend. Due opzioni pratiche:

- **Opzione A (minima)**: Usare i webhook n8n esistenti per auth. n8n gia gira su Hostinger -- aggiungere un workflow di login che verifica credenziali server-side, ritorna un JWT firmato con un secret che vive SOLO sul server, e valida il JWT su ogni richiesta API.
- **Opzione B (migliore)**: Usare un BaaS come Supabase (free tier, PostgreSQL, Row Level Security, auth integrato). Migrazione da localStorage a Supabase e ~2 giorni di lavoro per uno sviluppatore esperto.

Il social network (`postsService`, `commentsService`, `groupsService` -- 300+ LOC) semplicemente non funziona senza un backend reale. Ogni utente vede solo i propri dati perche sono nel SUO localStorage.

### R2: Scrivere una Suite di Test per il CircuitSolver (Priorita: ALTA)

**Effort**: 20-25 ore

Il CircuitSolver e il cuore del prodotto. Senza test, ogni modifica e una roulette russa. Piano minimo:

1. **10 unit test per il path-tracer**: Serie semplice (1 resistore + 1 LED), serie con 2 LED, parallelo 2 resistori, voltage divider con pot, circuito aperto, cortocircuito.
2. **10 unit test per il MNA solver**: Verificare che le tensioni nodo e le correnti ramo corrispondano ai valori calcolati a mano (Kirchhoff).
3. **5 integration test**: Caricare 5 esperimenti reali dal catalogo e verificare che `getState()` produca i risultati attesi.
4. **Framework**: Vitest (gia compatibile con Vite, zero config aggiuntiva). Aggiungere `"test": "vitest"` al `package.json`.

### R3: Decomporre NewElabSimulator con useReducer + Context (Priorita: ALTA)

**Effort**: 15-20 ore

Sostituire i 32 `useState` con un `useReducer`:

```javascript
const initialState = {
  experiment: null,
  simulation: { running: false, time: 0, mode: 'idle' },
  editor: { code: '', status: null, errors: null },
  ui: { sidebar: true, palette: false, codeEditor: false, wireMode: false },
  avr: { ready: false, serialOutput: '' },
  custom: { layout: {}, connections: [], components: [], pinAssignments: {} },
};

function simulatorReducer(state, action) {
  switch (action.type) {
    case 'LOAD_EXPERIMENT': ...
    case 'SIMULATION_START': ...
    case 'SIMULATION_PAUSE': ...
    // etc.
  }
}
```

Questo elimina le race condition tra setState multipli, rende il codice testabile (il reducer e una funzione pura), e permette di estrarre sotto-componenti con `useContext` senza prop drilling.

### R4: Aggiungere React Router + Lazy Loading (Priorita: MEDIA)

**Effort**: 8-12 ore

```javascript
const SimulatorPage = React.lazy(() => import('./pages/SimulatorPage'));
const TutorPage = React.lazy(() => import('./pages/TutorPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const SocialPage = React.lazy(() => import('./pages/SocialPage'));
```

Con `react-router` v7 e `<Suspense>`, il bundle iniziale si ridurrebbe da ~1.305 KB a ~400 KB (solo shell + route attiva). Deep linking funzionerebbe automaticamente. Il tasto Back del browser funzionerebbe.

### R5: Rimuovere il Prefisso VITE_ dalle Variabili Sensibili (Priorita: ALTA)

**Effort**: 2-3 ore

Ogni variabile con prefisso `VITE_` finisce nel bundle client. Le URL dei webhook n8n non dovrebbero essere esposte. Due approcci:

- **Proxy server-side**: Creare una Vercel Edge Function (`/api/chat`, `/api/compile`) che inoltra le richieste ai webhook n8n. Le URL reali vivono nelle env vars di Vercel (senza `VITE_` prefix), invisibili al client.
- **Minimo**: Almeno `VITE_ACCESS_HASH` deve essere rimosso immediatamente dal `.env` -- e la password dell'admin.

---

## METRICHE DI QUALITA MISURATE

| Metrica | Valore | Soglia Accettabile | Giudizio |
|---|---|---|---|
| File sorgente | 141 | -- | Progetto medio |
| LOC totali | ~6.228 | -- | -- |
| File test | 0 | >= 30 | CRITICO |
| console.log/warn/error | 99 in 30 file | 0 in prod | WARN |
| eslint-disable | 5 | 0 | WARN |
| TODO/FIXME/HACK | 1 | 0 | OK (quasi) |
| fontSize <= 12px (inline JSX) | 297 in 42 file | 0 | WCAG FAIL |
| localStorage/sessionStorage | 124 in 22 file | < 10 | CRITICO |
| Dipendenze prod | 22 | -- | Ragionevole |
| React Router | Assente | Presente | CRITICO |
| State management | Solo useState | useReducer/Zustand | WARN |
| TypeScript | Assente | Presente | WARN |

---

## NOTA SULLA PROTEZIONE DEI MINORI (COPPA/GDPR-K)

Questo progetto dichiara di servire bambini 8-14 anni. In questa fascia di eta, la normativa COPPA (USA) e GDPR Art. 8 (EU) richiedono:

1. **Consenso genitoriale verificabile** per raccolta dati (il `ConsentBanner.jsx` esiste ma gestisce solo cookies, non dati personali).
2. **Minimizzazione dati**: Il sistema raccoglie email, nome, scuola, citta, interessi -- tutti dati personali di minori salvati in localStorage senza cifratura.
3. **Data breach notification**: Con dati in localStorage, un XSS vuln espone tutto senza possibilita di breach detection.

Questo non e solo un problema tecnico: e un rischio legale per l'autore del software.

---

## CONCLUSIONE

ELAB Tutor e un progetto che tradisce un talento tecnico reale -- il CircuitSolver e l'AVRBridge sono pezzi di ingegneria che molti sviluppatori senior non saprebbero scrivere. Il dominio (simulazione elettronica per bambini) e genuinamente difficile e l'autore lo comprende.

Ma il progetto soffre di quello che nel nostro campo chiamiamo "brilliant programmer syndrome": eccellenza nel problem-solving tecnico, insufficienza nella disciplina ingegneristica. Zero test, auth client-side, no router, variabili d'ambiente esposte, God component -- sono tutti debiti tecnici che cumulati rendono il software non deployabile in un contesto scolastico reale.

La raccomandazione piu urgente e R1 (backend auth). Senza quella, tutto il resto e costruito sulla sabbia.

**Voto finale**: 5.0/10 -- con il potenziale per raggiungere 7.5/10 dopo l'implementazione delle 5 raccomandazioni.

---

*Questa review e stata condotta con analisi statica approfondita. Non include testing dinamico o penetration testing. Le raccomandazioni riflettono lo stato del codice al 14/02/2026.*
