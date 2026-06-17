# REDUNDANCY AUDIT — ELAB Builder
**Data**: 11/04/2026
**Codebase**: 234 JS/JSX files, 41 CSS files, 25 servizi
**Metodo**: grep sistematico su export, import, fetch, localStorage, CSS patterns

---

## 1. NANOBOT_URL DEFINITA 3 VOLTE (Impatto: ALTO)

La stessa costante `NANOBOT_URL` da `VITE_NANOBOT_URL` e' definita indipendentemente in 3 file:

| File | Linea | Variante |
|------|-------|----------|
| `src/services/api.js:20` | `const NANOBOT_URL = (import.meta.env.VITE_NANOBOT_URL \|\| '').trim() \|\| _SUPABASE_EDGE;` | Con fallback Supabase |
| `src/services/voiceService.js:10` | `const NANOBOT_URL = (import.meta.env.VITE_NANOBOT_URL \|\| '').trim() \|\| null;` | Con fallback null |
| `src/services/unlimMemory.js:391` | `const NANOBOT_URL = ((typeof import.meta !== 'undefined' && ...) \|\| '').trim() \|\| null;` | Con guard import.meta |

**Rischio**: Se l'URL cambia, serve modificare 3 file. Il fallback e' diverso in ciascuno.
**Fix**: Creare `src/config/endpoints.js` con tutte le URL centralizzate. Ogni servizio importa da li.
**Effort**: 1h

---

## 2. DATA_SERVER_URL DEFINITA 3 VOLTE (Impatto: ALTO)

| File | Linea |
|------|-------|
| `src/services/gdprService.js:10` | `const DATA_SERVER_URL = ...` |
| `src/services/studentService.js:25` | `const DATA_SERVER_URL = ...` |
| `src/components/teacher/TeacherDashboard.jsx:3142` | `const DATA_SERVER = ...` (nome diverso!) |

**Rischio**: Nome inconsistente (`DATA_SERVER` vs `DATA_SERVER_URL`). Se env var cambia, 3 posti da aggiornare.
**Fix**: Centralizzare in `src/config/endpoints.js`.
**Effort**: 30min

---

## 3. TOKEN RETRIEVAL DUPLICATO IN 5 SERVIZI (Impatto: ALTO)

5 servizi implementano ciascuno la propria funzione `getToken()` per leggere il token auth da localStorage:

| File | Pattern |
|------|---------|
| `authService.js:49` | `localStorage.getItem(TOKEN_KEY)` |
| `gdprService.js:14` | `localStorage.getItem(TOKEN_KEY) \|\| sessionStorage.getItem(TOKEN_KEY)` |
| `studentService.js:38` | `localStorage.getItem(TOKEN_KEY) \|\| sessionStorage.getItem(TOKEN_KEY)` |
| `supabaseSync.js:410` | `localStorage.getItem('elab_auth_token')` (hardcoded!) |
| `unlimMemory.js:376` | `localStorage.getItem('elab_auth_token')` (hardcoded!) |

**Rischio**: authService legge solo localStorage. gdprService e studentService leggono anche sessionStorage. supabaseSync e unlimMemory usano stringa hardcoded. Se il key name cambia, 5 file rotti.
**Fix**: Unica funzione `getAuthToken()` in authService, tutti gli altri importano quella.
**Effort**: 1h

---

## 4. SESSION ID RETRIEVAL DUPLICATO (Impatto: MEDIO)

`localStorage.getItem('elab_tutor_session')` usato direttamente in:
- `supabaseSync.js:418`
- `unlimMemory.js:383`
- `ElabTutorV4.jsx:281`
- `GalileoAdapter.jsx:432`

Inoltre `sessionStorage.getItem('unlim_session')` in `api.js:632,699` -- concetto diverso, potenziale confusione.

**Fix**: Funzione centralizzata `getCurrentSessionId()` in un servizio session.
**Effort**: 30min

---

## 5. VetrinaSimulatore + VetrinaV2: DUE LANDING PAGE (Impatto: MEDIO)

- `src/components/VetrinaSimulatore.jsx` (24/02/2026) -- landing page originale
- `src/components/lavagna/VetrinaV2.jsx` (02/04/2026) -- "sostituira VetrinaSimulatore in S8"

Entrambe importate in `App.jsx`. VetrinaV2 e' il sostituto ma VetrinaSimulatore e' ancora nel bundle.

**Fix**: Completare migrazione e rimuovere VetrinaSimulatore + VetrinaSimulatore.module.css.
**Effort**: 30min

---

## 6. ChatOverlay vs GalileoAdapter: DUALISMO CHAT UI (Impatto: MEDIO)

Due componenti chat separati per due modalita:
- `src/components/tutor/ChatOverlay.jsx` + `ChatOverlay.module.css` -- usato da ElabTutorV4 (tutor mode)
- `src/components/lavagna/GalileoAdapter.jsx` + `GalileoAdapter.module.css` + `useGalileoChat.js` -- usato da LavagnaShell

Entrambi fanno la stessa cosa: input testo -> chiamata API Galileo -> display risposta. GalileoAdapter wrappa di fatto ChatOverlay con logiche aggiuntive.

**Rischio**: Bug fix applicato a uno e non all'altro. Stili diversi tra le due UI.
**Fix**: Estrarre logica chat in un unico hook `useChatEngine`, usarlo in entrambi i contesti.
**Effort**: 3h

---

## 7. DEAD EXPORTS: FUNZIONI ESPORTATE MA MAI USATE (Impatto: MEDIO)

| Funzione | File | Usata? |
|----------|------|--------|
| `hasPrecompiledHex` | compiler.js | Solo nella definizione (1 occorrenza) |
| `getPrecompiledCount` | compiler.js | Solo nella definizione (1 occorrenza) |
| `resetMetrics` | sessionMetrics.js | Solo self-reference nel proprio oggetto |
| `clearActivities` | activityBuffer.js | Solo self-reference + __ELAB_ACTIVITY |
| `getUserRole` | authService.js | Solo self-reference nel default export |
| `validatePassword` | authService.js | Solo usata internamente in authService |
| `isCloudDataAvailable` | teacherDataService.js | Solo nella definizione (1 occorrenza) |

**Fix**: Rimuovere `export` da funzioni usate solo internamente. Eliminare quelle completamente inutilizzate.
**Effort**: 30min

---

## 8. CSS: TRIPLO PATTERN (INLINE + STRING CLASS + MODULES) (Impatto: ALTO)

| Pattern | Occorrenze |
|---------|-----------|
| `style={{...}}` inline | **1923** |
| `className="..."` string literal | 353 |
| `className={styles.x}` CSS modules | 29 |
| `` className={`...`} `` template | 118 |

**Analisi**: Su 1923+353+29+118 = 2423 stili totali, il **79% e' inline**. I CSS modules (29 occorrenze) sono quasi inutilizzati nonostante ci siano 32 file `.module.css`.

Questo indica che molti `.module.css` hanno stili definiti ma i componenti usano `style={{}}` inline.

**Rischio**: Impossibile fare theming, dark mode, responsive override. Performance peggiore (ogni render ricrea oggetti stile).
**Fix**: Fase 1: Convertire i 10 componenti piu grandi da inline a CSS modules. Fase 2: Eliminare inline residui.
**Effort**: 8h (fase 1), 16h (fase 2)

---

## 9. CSS: box-shadow RIPETUTO 374 VOLTE (Impatto: MEDIO)

374 dichiarazioni `box-shadow` sparse in 36 file CSS. Nessun design token o variabile condivisa.

Stessi pattern ripetuti:
- `box-shadow: 0 2px 8px rgba(0,0,0,0.15)` -- card shadow (stimati 50+ usi)
- `box-shadow: 0 4px 16px rgba(0,0,0,0.2)` -- elevated shadow (stimati 30+ usi)

Idem per `border-radius` (202 occorrenze) e `backdrop-filter` (30 occorrenze).

**Fix**: Design tokens in `src/styles/design-system.css` (esiste gia ma non e' usato abbastanza). Definire `--shadow-card`, `--shadow-elevated`, `--radius-sm/md/lg`.
**Effort**: 4h

---

## 10. localStorage: NAMING INCONSISTENTE (Impatto: MEDIO)

Due convenzioni mischiate:
- **Underscore**: `elab_tutor_session`, `elab_class_key`, `elab_auth_token`, `elab_gest_log`
- **Dash**: `elab-tts-muted`, `elab-sidebar-pref`, `elab-notebooks`, `elab-lavagna-volume`

Totale chiavi uniche localStorage: ~30+, senza un registry centrale.

**Rischio**: Collisioni con altri prodotti. Nessun modo per fare "clear all ELAB data". GDPR deleteAllData deve conoscere tutte le chiavi.
**Fix**: Creare `src/config/storageKeys.js` con tutte le chiavi. Standard: `elab_` underscore unico.
**Effort**: 2h

---

## 11. fetch() DIRETTE FUORI DAI SERVIZI (Impatto: MEDIO)

4 componenti fanno `fetch()` diretto invece di usare un servizio:

| File | URL target |
|------|-----------|
| `AdminPage.jsx:153` | NOTION_LICENSE_URL |
| `LandingPNRR.jsx:611` | WEBHOOK_URL contatto |
| `AnalyticsWebhook.js:54` | WEBHOOK_URL analytics |
| `TeacherDashboard.jsx:3155` | DATA_SERVER /api/audit |

**Rischio**: Nessun error handling centralizzato, nessun retry, nessun logging.
**Fix**: Spostare in servizi dedicati o nel servizio `api.js` generico.
**Effort**: 1h

---

## 12. studentTracker vs studentService: OVERLAP (Impatto: MEDIO)

Due servizi gestiscono dati studente:
- `studentService.js` (775 righe) -- CRUD studenti, sync server, encryption, reflections
- `studentTracker.js` (314 righe) -- device ID, student name, tracking attivita

Entrambi scrivono su localStorage con chiavi diverse per dati correlati.

**Rischio**: Dati studente frammentati tra due servizi. Chi consuma non sa quale usare.
**Fix**: Merge in un unico `studentService.js` con sottosezioni (identity, tracking, persistence).
**Effort**: 2h

---

## 13. sessionMetrics vs activityBuffer vs sessionReportService: TRIPLO TRACKING (Impatto: MEDIO)

Tre servizi per tracciare attivita sessione:
- `sessionMetrics.js` -- trackExperimentLoad, trackCompilation, trackInteraction
- `activityBuffer.js` -- pushActivity, getRecentActivities, formatForContext
- `sessionReportService.js` -- collectSessionData, captureCircuit, fetchAISummary

Usati da file diversi, dati non sincronizzati tra loro.

**Fix**: Unificare in un unico `sessionAnalytics.js`.
**Effort**: 2h

---

## 14. TUTOR CSS: 3 FILE PLAIN CSS GLOBALI (Impatto: BASSO)

Il tutor usa 3 file CSS globali (non moduli):
- `ElabTutorV4.css` -- 72 box-shadow, stili base tutor
- `TutorTools.css` -- 24 border-radius, stili tool condivisi
- `tutor-responsive.css` -- 33 border-radius, responsive overrides

Tutti usano classi globali che possono collidere.

**Fix**: Migrare a CSS modules o almeno aggiungere prefisso `elab-tutor-`.
**Effort**: 2h

---

## 15. ElabSimulator.css: FILE MONOLITICO (Impatto: BASSO)

`ElabSimulator.css` ha 25 box-shadow e 21 border-radius in un singolo file globale.
Il simulatore gia usa `layout.module.css` e `overlays.module.css` per alcune parti.

**Mix**: Stesso componente (NewElabSimulator) importa SIA `.css` globale SIA `.module.css`.

**Fix**: Migrare tutto a moduli CSS. Eliminare il .css globale.
**Effort**: 2h

---

## 16. #1a1a2e HARDCODED IN 7 FILE (Impatto: BASSO)

Il colore dark background `#1a1a2e` appare hardcoded in 7 file (CSS + JSX).
Non usa la variabile CSS `--elab-dark-bg` (se esiste).

**Fix**: Sostituire con CSS variable del design system.
**Effort**: 30min

---

## RIEPILOGO PRIORITA

| # | Issue | Impatto | Effort | Priorita |
|---|-------|---------|--------|----------|
| 1 | NANOBOT_URL 3x | ALTO | 1h | P0 |
| 2 | DATA_SERVER_URL 3x | ALTO | 30min | P0 |
| 3 | Token retrieval 5x | ALTO | 1h | P0 |
| 8 | CSS inline 79% | ALTO | 8h+ | P1 |
| 4 | Session ID 4x | MEDIO | 30min | P1 |
| 5 | VetrinaSimulatore dead | MEDIO | 30min | P1 |
| 6 | ChatOverlay/GalileoAdapter dualismo | MEDIO | 3h | P1 |
| 7 | Dead exports 7+ | MEDIO | 30min | P1 |
| 9 | box-shadow 374x no tokens | MEDIO | 4h | P2 |
| 10 | localStorage naming mix | MEDIO | 2h | P2 |
| 11 | fetch() fuori servizi | MEDIO | 1h | P2 |
| 12 | studentTracker/studentService overlap | MEDIO | 2h | P2 |
| 13 | Triple tracking services | MEDIO | 2h | P2 |
| 14 | Tutor CSS globali | BASSO | 2h | P3 |
| 15 | ElabSimulator.css monolitico | BASSO | 2h | P3 |
| 16 | #1a1a2e hardcoded | BASSO | 30min | P3 |

**Effort totale stimato**: ~30h
**P0 (bloccanti per manutenzione)**: 2.5h
**P1 (qualita prodotto)**: ~13h
**P2 (debito tecnico)**: ~11h
**P3 (polish)**: ~6.5h

---

## RACCOMANDAZIONE

Creare **2 file nuovi** prima di qualsiasi altro intervento:
1. `src/config/endpoints.js` -- tutte le URL API centralizzate (fix #1, #2)
2. `src/config/storageKeys.js` -- tutte le chiavi localStorage con prefisso standard (fix #10)

Poi procedere con P0 (2.5h) e P1 top 3 (dead exports + VetrinaSimulatore + session ID = 1.5h).

Totale primo sprint di cleanup: **4h per un impatto significativo sulla manutenibilita**.
