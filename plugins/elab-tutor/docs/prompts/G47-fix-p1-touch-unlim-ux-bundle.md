# G47 — FIX P1: Touch target 35px, UNLIM "Chiedi ancora" broken, Bundle >4500KB

## Contesto
Sessione di sanamento P1. Tre fix indipendenti: accessibilita touch, UX UNLIM, ottimizzazione bundle.
Piano completo: `docs/prompts/G46-G55-sanamento-completo.md`
Audit dettagliato: memoria `G45-audit-brutale.md`

## STATO PRE-SESSIONE (verificato 31/03/2026)
- 972/972 test PASS | Build 28s | Bundle 4505KB | 0 console errors
- Deploy: https://www.elabtutor.school
- 62 esperimenti (38+18+6), 62 lesson paths

## REGOLE INVARIANTI
- ZERO DEMO, ZERO MOCK, ZERO DATI FINTI
- 62 lesson paths INTOCCABILI
- Non toccare engine/ — MAI
- `npm run build` + `npx vitest run` dopo OGNI singolo fix
- PATH: `export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | sort -V | tail -1)/bin:$PATH"`

## PRE-SESSIONE OBBLIGATORIA
1. Esegui `/elab-quality-gate` pre-session
2. Salva baseline: test count, build time, bundle size, console errors

---

## FIX 6 — Touch target experiment selector button 35px -> 44px (P1, 30min)

### Problema
Il bottone selettore esperimento nella toolbar del simulatore ha altezza 35px. WCAG 2.1 AAA richiede minimo 44px per touch target. Il bottone mostra il titolo dell'esperimento corrente (es. "Cap. 6 Esp. 1") e serve per navigare tra esperimenti.

### File da leggere PRIMA di modificare
- `src/components/simulator/NewElabSimulator.jsx` — cerca il bottone che renderizza `currentExperiment?.title` o testo simile come "Cap." / "Esp."
- Cerca stili inline con `height: 35` o `minHeight: 35` nella toolbar

### Implementazione
1. In `NewElabSimulator.jsx`, trova il bottone experiment selector nella toolbar
2. Cerca lo stile del bottone — probabilmente ha `height: 35` o `minHeight: 35` o `padding` che risulta in 35px
3. Cambia a `minHeight: 44` (usa `minHeight` invece di `height` per non rompere il layout se il testo va a capo)
4. Se il bottone non ha uno stile esplicito di altezza, aggiungilo: `minHeight: 44`
5. Verifica che il cambio non rompa l'allineamento della toolbar — se necessario, allinea anche gli altri bottoni adiacenti

### Verifica browser
- Avvia dev server, vai a `#prova`
- Apri DevTools, ispeziona il bottone experiment selector
- Verifica che `computed height >= 44px`
- Usa `preview_eval` per controllare: `document.querySelectorAll('button').forEach(b => { if (b.offsetHeight < 44) console.warn('SMALL:', b.offsetHeight, b.textContent.substring(0,30)) })`
- Verifica che la toolbar non sia rotta visivamente

### Anti-regressione
- Nessun test unitario necessario (e modifica CSS)
- Quality gate check manuale: ispeziona toolbar, tutti i bottoni >= 44px

---

## FIX 7 — UNLIM "Chiedi ancora" button re-sends same query instead of opening input (P1, 1.5h)

### Problema
Nel pannello risposta UNLIM (`UNLIMResponsePanel.jsx`), il bottone "Chiedi ancora" dovrebbe chiudere il pannello risposta e aprire la barra input per permettere all'utente di digitare una NUOVA domanda. Attualmente re-invia la stessa query, che e inutile e confonde l'utente.

### File da leggere PRIMA di modificare
- `src/components/simulator/panels/UNLIMResponsePanel.jsx` — struttura del componente, props ricevute, handler del bottone "Chiedi ancora"
- `src/components/simulator/NewElabSimulator.jsx` — cerca dove UNLIMResponsePanel viene renderizzato, quali props riceve, e come viene gestito lo stato `unlimResponse` e `inputBarVisible`
- Cerca anche `UnlimWrapper` se esiste — potrebbe essere un intermediario

### Implementazione
1. **Leggi prima** `UNLIMResponsePanel.jsx` per capire cosa fa il bottone "Chiedi ancora" oggi. Probabilmente chiama una prop tipo `onRetry` o `onAskAgain` che re-invia la stessa query.

2. **Nel componente padre** (NewElabSimulator.jsx o UnlimWrapper):
   - Definisci un handler `handleAskAgain` che:
     ```javascript
     const handleAskAgain = useCallback(() => {
       setUnlimResponse(null);       // chiudi pannello risposta
       setInputBarVisible(true);     // apri input bar
       // Se c'e un ref all'input, fai focus:
       // inputRef.current?.focus();
     }, []);
     ```
   - Passa `onAskAgain={handleAskAgain}` come prop a UNLIMResponsePanel

3. **In UNLIMResponsePanel.jsx**:
   - Il bottone "Chiedi ancora" deve chiamare `props.onAskAgain()` invece di re-inviare la query
   - Se il bottone oggi chiama qualcosa tipo `props.onRetry(lastQuery)`, sostituisci con `props.onAskAgain()`
   - Cambia anche il testo se necessario: "Chiedi ancora" e OK, ma potrebbe anche essere "Fai un'altra domanda" per chiarezza

4. **Verifica la gerarchia dei componenti** — se c'e un wrapper intermedio, la prop deve passare attraverso tutti i livelli

### Verifica browser
- Avvia dev server, vai a `#prova`
- Apri UNLIM, fai una domanda, aspetta risposta
- Clicca "Chiedi ancora"
- Il pannello risposta deve CHIUDERSI
- La barra input deve APRIRSI (vuota, pronta per nuova domanda)
- NON deve re-inviare la stessa domanda
- Ripeti: nuova domanda -> risposta -> "Chiedi ancora" -> input vuota

### Anti-regressione
- Verifica che il bottone "Chiudi" (X) del pannello continui a funzionare
- Verifica che il flusso normale (domanda -> risposta -> chiudi) non sia rotto
- Verifica che l'input bar si apra con focus sull'input field

---

## FIX 8 — Bundle precache 4505KB -> sotto 4500KB (P1, 1h)

### Problema
Il bundle precache Service Worker e 4505KB, appena sopra il target di 4500KB. Servono almeno 5KB di risparmio. Questo impatta il tempo di primo caricamento e l'esperienza offline.

### File da leggere PRIMA di modificare
- `vite.config.js` — cerca la configurazione `workbox` e i `globPatterns` / `globIgnores` per il precache
- Esegui `npm run build` e cerca nella output la riga che mostra il totale precache (es. "X entries, XXXX KB")
- Controlla la directory `dist/` dopo il build per individuare file grandi non necessari

### Implementazione
Strategie (scegline una o combina):

**Opzione A — Escludi source maps dal precache:**
In `vite.config.js`, nella configurazione workbox, aggiungi ai `globIgnores`:
```javascript
globIgnores: ['**/*.map', ...(existingIgnores || [])]
```

**Opzione B — Escludi font non critici:**
Se ci sono font duplicati o font weight non usati nel precache, escludili:
```javascript
globIgnores: ['**/fonts/*-Italic*', ...(existingIgnores || [])]
```

**Opzione C — Riduci una immagine/asset:**
Cerca nella directory `public/` o `src/assets/` immagini PNG/JPG non ottimizzate. Anche comprimere un singolo PNG puo risparmiare 10-20KB.

**Opzione D — Rivedi i glob patterns:**
Controlla se `globPatterns` include file non necessari per il funzionamento offline (es. file di documentazione, asset di test).

### Verifica
1. `npm run build`
2. Cerca nella output la riga precache totale
3. Deve essere **< 4500KB**
4. Verifica che il sito funzioni ancora offline:
   - Apri in Chrome, vai a Application > Service Workers
   - Attiva "Offline"
   - Il simulatore deve caricarsi con gli esperimenti base

### Anti-regressione
- Dopo l'esclusione, verifica che tutte le risorse critiche siano ancora nel precache:
  - File HTML principale
  - Bundle JS principali (chunks React, simulator, CodeMirror)
  - File HEX per compilazione offline
  - CSS principale
  - Font principali (almeno 1 weight)
- Se hai escluso un asset, verifica che sia ancora accessibile via network (non solo precache)

---

## POST-SESSIONE OBBLIGATORIA
1. `npm run build` — deve passare, bundle < 4500KB
2. `npx vitest run` — deve passare (972+ test)
3. `/elab-quality-gate` post-session — confronta con baseline
4. Verifica browser: 0 console errors
5. Aggiorna `docs/prompts/G46-G55-sanamento-completo.md` con progresso reale
6. Score atteso dopo G47: **6.3/10**

---

## ANTI-REGRESSION CHECKLIST

Prima di chiudere la sessione, verifica TUTTI questi punti:

- [ ] **Touch target**: bottone experiment selector >= 44px (DevTools computed)
- [ ] **Toolbar layout**: nessun elemento rotto o disallineato dopo FIX 6
- [ ] **UNLIM flow completo**: domanda -> risposta -> "Chiedi ancora" -> input vuota -> nuova domanda -> risposta
- [ ] **UNLIM chiudi**: il bottone X del pannello risposta funziona ancora
- [ ] **UNLIM auto-explain**: il bottone UNLIM toolbar (non mascotte) continua a funzionare
- [ ] **Bundle < 4500KB**: confermato dalla riga precache nel build output
- [ ] **Offline funzionante**: simulatore si carica con Service Worker in modalita offline
- [ ] **HEX files**: i file HEX sono ancora nel precache (necessari per compilazione offline)
- [ ] **Build PASS**: `npm run build` senza errori
- [ ] **Test PASS**: `npx vitest run` — 972+ test, 0 fail
- [ ] **Console pulita**: 0 errori nella console browser
- [ ] **62 esperimenti**: nessun lesson path rotto (spot check 3 esperimenti: Vol1, Vol2, Vol3)
