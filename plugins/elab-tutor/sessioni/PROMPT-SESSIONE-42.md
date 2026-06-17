# Prompt Sessione 42 — Cryptazione Massima + Firma + Teacher Dashboard + Mobile Audit

**Data prevista**: 25/02/2026
**Priorita**: P0-P1 (protezione codice + usabilita docente)
**Prerequisiti**: Sessione 41 deployata (obfuscation base, UI minimal, nanobot, HiDPI)

---

## CONTESTO

ELAB Tutor (https://www.elabtutor.school) e' un simulatore di circuiti con tutor AI per studenti 8-14 anni. Nella sessione 41 abbiamo:
- Implementato obfuscation base (RC4 strings, hex IDs, control flow flattening 0.3)
- Anti-DevTools runtime (codeProtection.js)
- UI Minimal (5 tab, kebab toolbar, onboarding tooltip)
- Nanobot Docker setup + api.js fallback chain
- Whiteboard HiDPI fix

**Problema**: L'obfuscation attuale NON e' massima. Molte opzioni sono disabilitate (selfDefending, deadCodeInjection, debugProtection). Le soglie sono basse (CFG 0.3, strings 0.75). I dati esperimenti sono in chiaro. Il boss vuole codice COMPLETAMENTE illeggibile.

> **ELAB Tutor, Galileo e i Kit fisici sono UN UNICO PRODOTTO.**
> L'estetica, i componenti, i colori, i font e il linguaggio visivo devono essere IDENTICI tra il software e i volumi stampati. Non ci sono eccezioni.
> **ANCHE LA PERSONA PIU INESPERTA DEL MONDO deve poter insegnare con ELAB Tutor.**
> Se un professore di 60 anni che non ha mai toccato un computer ci mette piu di 10 secondi a capire come funziona qualcosa, quella funzione e' mal progettata.

---

## TASK 1: Cryptazione Massima — Hardening Obfuscation

### Problema
L'obfuscation attuale in `vite.config.js` ha molte opzioni disabilitate o con soglie basse:
- `deadCodeInjection: false` — nessun codice finto iniettato
- `selfDefending: false` — il codice puo essere beautified senza rompersi
- `debugProtection: false` — il debugger non e' bloccato nel bundle
- `controlFlowFlatteningThreshold: 0.3` — solo 30% del control flow e' appiattito
- `stringArrayThreshold: 0.75` — 25% delle stringhe NON sono criptate
- `splitStrings: false` — le stringhe lunghe restano intere
- `unicodeEscapeSequence: false` — nomi leggibili
- Nessun `domainLock` — il codice gira su qualsiasi dominio
- Nessun `disableConsoleOutput` — belt-and-suspenders col runtime

### Cosa fare

**1.1 — Alzare TUTTE le soglie in vite.config.js**:
```javascript
obfuscateChunks({
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,    // 0.3 → 0.75
    deadCodeInjection: true,                   // false → true
    deadCodeInjectionThreshold: 0.4,
    debugProtection: true,                     // false → true
    debugProtectionInterval: 4000,             // 4s loop
    selfDefending: true,                       // false → true — TESTARE!
    stringArray: true,
    stringArrayEncoding: ['rc4'],
    stringArrayThreshold: 1.0,                 // 0.75 → 1.0 (100% stringhe)
    stringArrayWrappersCount: 5,
    stringArrayWrappersChainedCalls: true,
    transformObjectKeys: true,
    unicodeEscapeSequence: true,               // false → true
    splitStrings: true,                        // false → true
    splitStringsChunkLength: 5,
    numbersToExpressions: true,                // NUOVO
    disableConsoleOutput: true,                // NUOVO
    domainLock: [
        '.elabtutor.school',
        '.vercel.app',
        'localhost'
    ],
    domainLockRedirectUrl: 'https://www.elabtutor.school',
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: false,                      // non toccare — rompe cross-chunk
})
```

**1.2 — Testare selfDefending con code-splitting**:
- Il motivo per cui era disabilitato in S41: "breaks cross-chunk references"
- STRATEGIA: abilitare `selfDefending: true` e testare il build completo
- Se rompe, provare: `selfDefending: true` SOLO sul chunk principale (index-*.js), false sugli altri
- Implementare nel plugin `renderChunk`: se `chunk.fileName.startsWith('index-')` → selfDefending true, altrimenti false

**1.3 — Hardening codeProtection.js**:
- Aggiungere rilevamento `debugger` statement trap (oltre al window size check)
- Aggiungere rilevamento `console.log` override (se qualcuno patcha console)
- Aggiungere rilevamento `Proxy` su `window.__ELAB_API__` (protezione API globale)
- Aggiungere `setInterval(() => { debugger; }, 100)` che in produzione blocca chiunque apra il debugger
- Aggiungere trap `Object.defineProperty(window, '__ELAB_CIRCUIT__', { configurable: false })` per impedire override

**1.4 — Criptazione dati esperimenti (AES)**:
- I file in `src/data/experiments/` contengono connections, buildSteps, quiz in chiaro
- A BUILD-TIME: creare un Vite plugin che cifra questi oggetti con AES-256-CBC
- A RUNTIME: decriptare con chiave derivata da `sessionId + userId` (PBKDF2)
- Chiave base hardcoded (offuscata) + salt da sessione utente = chiave finale
- Se qualcuno estrae il bundle, vede solo blob criptati
- **ATTENZIONE**: NON criptare i nomi dei file/moduli, solo il CONTENUTO dei dati

**1.5 — Firma nel codice sorgente**:
- Ogni 200 righe di codice sorgente (NON nel bundle, NEL SORGENTE), inserire commento:
  ```javascript
  // © Andrea Marro — 25/02/2026 — ELAB Tutor — Tutti i diritti riservati
  ```
- Questo finisce nel bundle come stringa criptata RC4 (grazie all'obfuscator)
- Script automatico: creare `scripts/add-signatures.js` che scorre tutti i .jsx/.js/.css e inserisce la firma ogni 200 righe

### File coinvolti
- `vite.config.js` — obfuscation settings hardcore
- `src/utils/codeProtection.js` — hardening runtime
- `scripts/add-signatures.js` (NUOVO) — script firma automatica
- `src/data/experiments/` — criptazione AES (opzionale ma consigliato)

### Metriche di successo
- Bundle: 100% stringhe criptate, control flow appiattito al 75%, dead code iniettato
- DevTools: `debugger` trap attivo, console disabilitata, right-click bloccato
- selfDefending: codice si rompe se formattato (testato con js-beautify)
- Domain lock: codice non funziona su altri domini
- Build: 0 errori, funzionalita IDENTICA

---

## TASK 2: Firma Copyright — Footer + Sorgente

### Problema
Il boss vuole la firma "Andrea Marro" visibile:
1. Su ogni pagina dell'app (footer bottom-left)
2. Nel codice sorgente ogni 200 righe

### Cosa fare

**2.1 — Footer copyright su OGNI pagina**:
- Aggiungere elemento fisso bottom-left su tutte le pagine dell'app
- Stile: piccolo, discreto, non intrusivo ma SEMPRE visibile
- Testo: `© Andrea Marro — DD/MM/YYYY`
- Gia presente come watermark (verificare che sia su TUTTE le route)
- Se manca su qualche pagina (login, register, admin, tutor, simulatore), aggiungere
- Posizione: `position: fixed; bottom: 8px; left: 12px; z-index: 9999`
- Font: 11px, color: #888, opacity: 0.6

**2.2 — Firma nel sorgente ogni 200 righe**:
- Creare script `scripts/add-signatures.js` (Node.js)
- Scorre tutti i file in `src/` con estensione `.js`, `.jsx`, `.css`
- Ogni 200 righe (linea 200, 400, 600...) inserisce:
  - JS/JSX: `// © Andrea Marro — DD/MM/YYYY — ELAB Tutor — Tutti i diritti riservati`
  - CSS: `/* © Andrea Marro — DD/MM/YYYY — ELAB Tutor — Tutti i diritti riservati */`
- NON inserire dentro stringhe, template literals, o JSX return
- Aggiungere come `prebuild` script in package.json: `"prebuild": "node scripts/add-signatures.js"`

### File coinvolti
- `src/App.jsx` o `src/components/shared/Footer.jsx` — footer globale
- `scripts/add-signatures.js` (NUOVO)
- `package.json` — prebuild script

### Metriche di successo
- Footer visibile su: login, register, tutor, simulatore, admin, gestionale, showcase
- Firma presente ogni 200 righe in tutti i file sorgente
- Build non rotto dalle firme

---

## TASK 3: Teacher Dashboard — Far Funzionare STUDENT_TRACKING

### Problema
Il Teacher Dashboard (Area Docente) non funziona perche il database STUDENT_TRACKING su Notion non e' condiviso con l'integration. I docenti non possono vedere i progressi degli studenti. Score attuale: 6.5/10.

### Cosa fare

**3.1 — Verificare lo stato del database Notion**:
- Controllare se il database STUDENT_TRACKING esiste su Notion
- Se non esiste: documentare i passi per crearlo (schema, permessi)
- Se esiste: verificare che l'integration ha accesso

**3.2 — Fallback localStorage → Notion**:
- Attualmente `studentService.js` usa Notion backend
- Se Notion non risponde (503), fare fallback su localStorage
- Mostrare banner "Dati salvati localmente — connetti Notion per sincronizzare"

**3.3 — Student card migliorata**:
- Le card studente mostrano UUID invece del display name
- Fixare: usare `student.name` o `student.email` come label
- Aggiungere avatar placeholder (iniziali colorate)

**3.4 — Setup wizard per docenti**:
- Creare un mini-wizard in Area Docente che guida il docente a:
  1. Copiare il codice classe (generato automaticamente)
  2. Condividerlo con gli studenti
  3. Vedere gli studenti che si registrano
- Target: professore 60 anni, 10 secondi per capire

### File coinvolti
- `src/components/teacher/TeacherDashboard.jsx`
- `src/services/studentService.js`
- `netlify/functions/` — endpoint studenti

### Metriche di successo
- Teacher Dashboard funziona anche senza Notion (fallback localStorage)
- Student cards mostrano nome, non UUID
- Setup wizard chiaro per docenti inesperti
- Score: 6.5 → 8.0/10

---

## TASK 4: Mobile/Responsive Audit Completo

### Problema
L'app non e' mai stata testata sistematicamente su mobile. Per un prodotto per bambini 8-14 anni, molti useranno tablet o smartphone del genitore.

### Cosa fare

**4.1 — Audit responsive su 3 breakpoint**:
- Mobile (375x812 — iPhone SE/13)
- Tablet (768x1024 — iPad)
- Desktop (1280x800)

**4.2 — Verificare ogni pagina**:
- Landing page
- Login / Register
- Tutor (sidebar + content)
- Simulatore (breadboard + toolbar + chat)
- Giochi (tutte e 4 le modalita)
- Area Docente
- Admin

**4.3 — Fix comuni attesi**:
- Sidebar che copre il contenuto su mobile
- Bottoni troppo piccoli (< 44px touch target)
- Testo che esce dal viewport
- Chat overlay che copre tutto
- Toolbar simulatore con scroll orizzontale
- Breadboard non zoomabile su touch

**4.4 — MobileBottomTabs**:
- Attualmente non filtra giochi teacher-gated
- Fixare: nascondere giochi che richiedono permesso docente

### File coinvolti
- `src/components/tutor/ElabTutorV4.css` — responsive styles
- `src/components/tutor/MobileBottomTabs.jsx`
- `src/components/simulator/NewElabSimulator.jsx` — toolbar mobile
- Tutti i componenti pagina

### Metriche di successo
- 0 elementi che escono dal viewport su tutti e 3 i breakpoint
- Touch target >= 44px ovunque
- Chat overlay <= 40vh su mobile
- Sidebar collassata su mobile con hamburger
- MobileBottomTabs filtra giochi correttamente
- Score Frontend/UX: 9.0 → 9.5/10

---

## TASK 5: Nanobot in Produzione + Galileo Potenziato

### Problema
Nanobot e' stato configurato in Docker (Session 41) ma non gira in produzione. Galileo usa ancora solo n8n. Per ridurre la latenza e avere tool-use reale, serve nanobot su un server.

### Cosa fare

**5.1 — Deploy nanobot su Hostinger/VPS**:
- Se Hostinger supporta Docker: deploy diretto con `docker-compose up -d`
- Se no: deploy su Railway/Fly.io/Render (free tier) come alternativa
- Configurare CORS per `elabtutor.school` e `vercel.app`
- Impostare healthcheck e restart policy

**5.2 — Configurare provider AI**:
- Priorita: DeepSeek V3 (costo basso, qualita alta) come primario
- Fallback: Gemini 2.0 Flash (gratis fino a 15 RPM)
- Fallback finale: n8n (Claude via webhook)

**5.3 — Secondo MCP tool: `diagnoseCircuit()`**:
- Input: stato circuito (componenti + connessioni + risultati simulazione)
- Output: diagnosi strutturata:
  ```json
  {
    "status": "error|warning|ok",
    "issues": ["LED1 non collegato al bus positivo", "Resistore mancante"],
    "suggestions": ["Collega il filo rosso da LED1:anode a bus-top-plus-5"]
  }
  ```
- Galileo usa questo per dare suggerimenti SPECIFICI, non generici

**5.4 — Terzo MCP tool: `getExperimentHints(experimentId)`**:
- Dato l'ID esperimento, restituisce hints progressivi
- Livello 1: "Hai collegato tutti i componenti?"
- Livello 2: "Controlla il collegamento del LED — serve un resistore"
- Livello 3: "Collega il resistore (330 ohm) tra bus-top-plus-5 e LED anode (foro a10)"

**5.5 — Aggiornare env var su Vercel**:
- Aggiungere `VITE_NANOBOT_URL=https://[server-nanobot]/chat`
- Verificare fallback chain: nanobot → n8n → RAG → knowledge base

### File coinvolti
- `nanobot/server.py` — nuovi tools
- `nanobot/nanobot.yml` — config tools
- `src/services/api.js` — URL produzione
- Vercel environment variables

### Metriche di successo
- Nanobot raggiungibile da produzione
- Latenza risposta < 2s (vs 2-4s n8n)
- diagnoseCircuit() restituisce diagnosi corretta
- Fallback chain funzionante se nanobot down
- Score AI: 9.5 → 10/10

---

## ORDINE DI ESECUZIONE

1. **Task 1 (Cryptazione Massima)** — 1-2h, protegge tutto il codice
2. **Task 2 (Firma Copyright)** — 30min, firma ovunque
3. **Task 3 (Teacher Dashboard)** — 1h, sblocca feature docente
4. **Task 4 (Mobile Audit)** — 1-2h, responsive completo
5. **Task 5 (Nanobot Produzione)** — 1h, AI potenziata

**Totale stimato**: ~5-6h

---

## FILE CRITICI DA LEGGERE ALL'INIZIO SESSIONE

```
vite.config.js                               (89 righe — obfuscation config)
src/utils/codeProtection.js                  (110 righe — anti-tampering runtime)
src/components/tutor/ElabTutorV4.jsx        (~1100 righe — layout principale)
src/components/tutor/TutorLayout.jsx         (layout wrapper + onboarding)
src/components/tutor/ElabTutorV4.css         (stili responsive)
src/components/teacher/TeacherDashboard.jsx  (area docente)
src/services/studentService.js               (backend studenti)
src/services/api.js                          (~740 righe — backend Galileo + nanobot)
nanobot/server.py                            (FastAPI server)
nanobot/nanobot.yml                          (config Galileo)
```

---

## VINCOLI

- **Palette ELAB**: Navy #1E4D8C, Lime #7CB342, Vol1 #7CB342, Vol2 #E8941C, Vol3 #E54B3D
- **Font**: Oswald + Open Sans + Fira Code
- **Target**: bambini 8-14 anni + docenti inesperti → UI semplicissima, testi grandi (>=14px), touch target >=44px
- **0 console.log** in produzione (disableConsoleOutput: true + codeProtection.js)
- **Build < 1000KB** per ElabTutorV4 chunk (con dead code injection potrebbe crescere — monitorare)
- **Deploy**: `npm run build && npx vercel --prod --yes`
- **Watermark**: Andrea Marro — DD/MM/YYYY (footer bottom-left + sorgente ogni 200 righe)
- **Codice ILLEGGIBILE**: variabili hex, stringhe RC4 100%, CFG 75%, dead code, selfDefending, debugger trap
- **Domain lock**: solo elabtutor.school, vercel.app, localhost

---

## STRINGA DI LANCIO

```
Sessione 42 — ELAB Tutor. Leggi PRODOTTO/elab-builder/sessioni/PROMPT-SESSIONE-42.md e MEMORY.md, poi esegui i 5 task in ordine:

1. **Cryptazione Massima** — alzare TUTTE le soglie obfuscation (CFG 0.75, strings 1.0, deadCodeInjection true, selfDefending true, debugProtection true, splitStrings, unicodeEscape, numbersToExpressions, domainLock). Hardening codeProtection.js con debugger trap + console override detection. Opzionale: AES encryption dati esperimenti.
2. **Firma Copyright** — footer "© Andrea Marro — DD/MM/YYYY" fisso bottom-left su OGNI pagina. Script prebuild che inserisce firma ogni 200 righe nel sorgente.
3. **Teacher Dashboard** — far funzionare STUDENT_TRACKING (fallback localStorage se Notion 503), fix UUID→nome nelle student cards, setup wizard per docenti inesperti.
4. **Mobile Audit** — test responsive 375/768/1280px su TUTTE le pagine, fix touch targets >=44px, sidebar mobile, MobileBottomTabs filtro giochi.
5. **Nanobot Produzione** — deploy su server, diagnoseCircuit() + getExperimentHints() MCP tools, DeepSeek V3 primario, env var Vercel.

Vincoli: palette ELAB, font Oswald+OpenSans+FiraCode, target bambini 8-14 + docenti inesperti, 0 console.log, build <1000KB, deploy Vercel. MASSIMA CRYPTAZIONE: 100% stringhe RC4, 75% CFG, dead code, selfDefending, debugger trap, domain lock. Firma Andrea Marro ovunque.
```

---

*Prompt generato — Session 41, 24/02/2026*
