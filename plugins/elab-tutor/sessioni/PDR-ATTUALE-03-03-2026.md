# PDR ATTUALE — Stato Progetto ELAB
## 12 Marzo 2026 — Aggiornato Post-Sessione 113
## Metodo: Sintesi di TUTTI i report (S3-S113) + MEMORY.md + CoV + Chrome verification + curl verification

---

## 1. ARCHITETTURA SISTEMA

```
+---------------------------+     +------------------------+
|    SITO PUBBLICO          |     |    ELAB TUTOR          |
|    (Netlify)              |     |    (Vercel)            |
|                           |     |                        |
|  16 pagine con widget     |     |  React 19 + Vite 7    |
|  27 Netlify Functions     |     |  110 componenti JSX    |
|  chat-widget.js (nanobot) |     |  69 esperimenti        |
|  NO whatsapp-support.js   |     |  21 SVG Tinkercad      |
|  (rimosso S63)            |     |  CircuitSolver v4      |
|                           |     |  Galileo AI chat       |
|  funny-pika-3d1029.       |     |  + Vision (Gemini)     |
|  netlify.app              |     |  www.elabtutor.school  |
+-----------+---------------+     +----------+-------------+
            |                                |
            |   Auth (bcrypt + HMAC          |  Fallback chain
            |   timing-safe S55)            |
            +--------+-----+----------------+
                     |     |
            +--------v-----v--------+
            |  NOTION (11 databases) |
            |  USERS, LICENSES,      |
            |  CLASSES, EVENTS...    |
            +----------+------------+
                       |
            +----------v-----------+
            |  NANOBOT v5.2.0      |
            |  (Render — Starter)  |
            |  FastAPI + Docker    |
            |  $7/mo always-on     |
            |                      |
            |  /chat (vision)      |
            |  /tutor-chat (circuit)|
            |  /site-chat (public) |
            |  /diagnose, /hints   |
            |  /health, /debug-vis |
            |                      |
            |  TEXT: DeepSeek+Groq |
            |  VISION: Gemini only |
            |  (Kimi ON STANDBY)   |
            +----------------------+
```

### URL di Produzione
| Servizio | URL | Status |
|----------|-----|--------|
| Sito Pubblico | https://funny-pika-3d1029.netlify.app | **LIVE** ✅ |
| ELAB Tutor | https://www.elabtutor.school | **LIVE** ✅ |
| Nanobot API | https://elab-galileo.onrender.com | **STABILE** (Starter $7/mo) ✅ |
| Nanobot Health | https://elab-galileo.onrender.com/health | v5.3.0 ✅ |

### Path Locali
| Progetto | Path |
|----------|------|
| Sito Pubblico | `/Users/andreamarro/VOLUME 3/PRODOTTO/newcartella/` |
| ELAB Tutor | `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/` |
| Nanobot | `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/nanobot/` |

---

## 2. SCORE CARD COMPLESSIVA — POST S66 — BRUTALMENTE ONESTA

### Metodologia
Ogni score e' giustificato con evidenze verificabili. Chrome-tested + curl-verified.
Score NON vengono MAI gonfiati. Se un test non e' stato eseguito, lo dichiariamo.

| # | Area | Score | Δ vs S65 | Evidenza |
|---|------|-------|----------|----------|
| 1 | Build Health | **10/10** | = | 0 errori, 3m46s build (S66 verified), ElabTutorV4 957KB |
| 2 | Code Quality | **9.8/10** | = | `.trim()` su 7 env var URL (S62), 0 console.log, obfuscation MAX. -0.2: P2-TDZ mitigato non risolto |
| 3 | Auth + Security | **9.9/10** | +0.0 | **S66: credential rotation COMPLETA** — password built-in + env vars + admin panel tutto verificato 5/5 curl. -0.1: email E2E non verificata (P1-3) |
| 4 | AI Integration | **10.0/10** | = | **S65: Vision 10/10 PASS** — thinkingBudget fix. **S66: Chrome-verified** camera 2/2 + auto-screenshot 1/1 (2571-2610 char Gemini responses) |
| 5 | detectIntent | **9.5/10** | = | S60B: D7 bypass. S54: D2-D6, Group J fuzzy. S66: 45/45 regex tests PASS |
| 6 | Sito Pubblico | **9.6/10** | = | S63: chat-widget.js field fix. **S66: widget AI Chrome-verified** (risposta ~8s a "Cos'e' un LED?"). -0.4: 61 orphan files |
| 7 | Simulatore Rendering | **9.2/10** | = | S62: toolbar overflow fixed. **S66: 19 toolbar buttons + __ELAB_API + overflow menu tutti Chrome-verified**. -0.3 CollisionDetector, -0.5 cosmetic |
| 8 | Quiz | **9.0/10** | = | 138 domande, 69/69 esperimenti, QuizPanel UI (S33) |
| 9 | Wire V8 | **9.5/10** | = | All-Curved Catmull-Rom + gravity sag (S35) |
| 10 | Simulatore Physics | **7.0/10** | = | CircuitSolver v4 KVL/KCL + MNA. -3: no transient/capacitor |
| 11 | Responsive/A11y | **8.8/10** | = | S57: 6 touch targets 44px, Inter eliminated. -0.7: skip-to-content, SVG a11y |
| 12 | 3 Modalita' Esperimento | **9.0/10** | = | Gia' Montato, Passo Passo, Libero (S39) |
| 13 | Obfuscation | **9.5/10** | = | RC4 100%, CFG 0.75, domainLock, selfDefending (S42) |
| 14 | Games | **8.5/10** | = | 53 sfide, stars, lazy-loaded (S27). **S66: Circuit Detective Chrome-verified** — 6+ puzzle visibili, categorie funzionanti |
| 15 | Nanobot Backend | **9.8/10** | = | S65: v5.2.0, thinkingBudget fix. S66: health 200 OK verified |
| 16 | Chat Widget Sito | **9.5/10** | = | S63: Galileo AI widget. **S66: Chrome-verified AI risponde correttamente** |
| 17 | Teacher Dashboard | **7.0/10** | = | localStorage fallback. -3: STUDENT_TRACKING mancante |
| 18 | Volume Gating | **6.0/10** | = | CLIENT-ONLY, no validazione server |
| | **OVERALL** | **~9.4/10** | +0.1 | S66: Credential rotation COMPLETATA + MEGA DEBUG Chrome verification su tutte le aree |

### Nota di Onesta' sugli Score S66
- **Auth 9.9 e non 10.0**: Email registration flow (P1-3) mai testata end-to-end. Non sappiamo se un utente nuovo riceve la mail di conferma.
- **Overall 9.4 e non 9.5+**: Nessuna nuova feature implementata in S66. La sessione e' stata quasi interamente testing e credential rotation. I punteggi delle aree NON sono cambiati, solo il confidence nelle verifiche e' aumentato.
- **Simulatore Physics resta 7.0**: Non e' cambiato nulla nel CircuitSolver. Transient e capacitor non supportati.
- **Volume Gating resta 6.0**: Ancora bypassabile via DevTools. Nessun lavoro server-side fatto.
- **Teacher Dashboard resta 7.0**: STUDENT_TRACKING non condiviso. Nessun progresso.

### Delta Storico Score Overall
| Sessione | Score | Note |
|----------|-------|------|
| S9.5 | 6.6 | Prima CoV brutale |
| S20 | 7.8 | Simulatore stabile |
| S33 | 8.7 | Quiz UI, 69/69 Chrome |
| S43 (onesto) | 8.0 | CoV correction |
| S45 | 8.2 | Vetrina verificata |
| S55 | 8.8 | Mega-Debug 72 issues, auth hardening |
| S58 | 9.0 | Galileo GOD 65 test, 98.5% pass |
| S60 | 9.3 | 206Q HARDCORE, 0 real FAIL |
| S62 | 9.6 | Vision WORKING, env var .trim(), toolbar fix |
| S63 | 9.2 | Score abbassato per onesta': action routing fix |
| S65 | 9.5 | Vision Mastery — 10/10 test, thinkingBudget fix |
| S66 | 9.4 | Credential rotation COMPLETA. MEGA DEBUG Chrome. Score conservativo |
| S108 | 9.2 | ROADMAP COMPLETE. iPad 8/8, Ralph 21/22, Scratch 17/18 |
| S111 | 9.3 | LCD Blockly 4 blocks, Scratch 22 blocks total |
| **S113 (attuale)** | **9.4** | Scratch generator 41 blocks (was 30). NanoR4Board SVG matching hardware photos. Systematic sprint prompt created. Qwen training ready. |

---

## 3. PROBLEMI APERTI PER PRIORITA'

### P0 — BLOCCANTI
| ID | Problema | Status |
|----|----------|--------|
| - | Nessun P0 attualmente | ✅ |

### P1 — IMPORTANTI
| ID | Problema | Impact | Status |
|----|----------|--------|--------|
| P1-1 | Notion DB ID mismatch (frontend vs backend) | Sync issues | APERTO (H12 PARTIAL) |
| P1-2 | STUDENT_TRACKING DB non shared | Teacher dashboard broken | APERTO (M20) |
| P1-3 | Email E2E non verificata | Registration flow untested | APERTO |
| P1-4 | Cross-referencing specialisti assente | Risposte frammentate | APERTO |
| P1-5 | Volume gating client-only | Bypass via DevTools | APERTO |
| ~~P1-6~~ | ~~Env vars Netlify da aggiornare~~ | ~~Admin panel~~ | ✅ **RISOLTO S66** — Tutte e 3 le env vars aggiornate, admin panel login 200 OK curl-verified |

### P2 — MEDI (8 rimanenti)
| ID | Problema |
|----|----------|
| P2-TDZ | obfuscator/minifier identifier collision (mitigato SKIP_PATTERNS) |
| P2-NAN-5 | circuitState non sanitizzato |
| P2-NAN-7 | Messaggi non sanitizzati in sessione |
| P2-VET-4 | 61 orphan files (~11.7 MB) — identificati, non eliminati |
| P2-WIR-2 | CollisionDetector useMemo ridondante |
| P2-RES-9 | SVG canvas non keyboard-navigable, 21 SVG components lack aria/role/title |
| P2-RES-10 | No skip-to-content link |
| P2-RES-11 | No focus-visible custom |

### P3 — MINORI
| ID | Problema |
|----|----------|
| P3-1 | No test E2E automatizzati |
| P3-2 | Editor Arduino panel z-index bleed-through |
| P3-3 | L1: `confirm()` blocks UI (needs custom modal) |
| P3-4 | L15: notionService no 429 retry logic |

---

## 4. SESSIONI RECENTI — DETTAGLIO

### ✅ S113 — Scratch Generator Fix + NanoR4Board Visual + Sprint Prompt (12/03/2026)

**Scope**: Fix root cause errori compilazione Scratch + visual matching hardware + preparazione overnight sprint per Qwen training.

| Azione | Dettaglio | Stato |
|--------|-----------|-------|
| **ROOT CAUSE Scratch** | Aggiunti 11 generatori Blockly built-in mancanti a scratchGenerator.js | ✅ FIX |
| Generatori variabili | `variables_set`/`variables_get` — fix `if(x=3)` → `if(x==3)` | ✅ |
| Generatori math | `math_modulo`, `math_constrain`, `math_random_int` | ✅ |
| Generatori flow | `controls_flow_statements` (break/continue) | ✅ |
| Generatori procedure | `procedures_def*`/`procedures_call*` (4 blocchi) | ✅ |
| Variable tracking | `_declaredVars` Set con reset in `arduino_base` | ✅ |
| NanoR4Board SVG | "ELAB" su semicerchio, barrel jack, 3 LED blu — matching foto hardware | ✅ |
| Sprint prompt | 9 fasi + CoV + Ralph Loop + context maintenance + ragionamenti folder | ✅ |
| Voice design | Pipeline microfono→VAD→STT→Nanobot→TTS + 20 abilita vocali documentate | ✅ DESIGN |
| Build | 0 errori, Main 304KB gzip, ScratchEditor 190KB gzip | ✅ |
| Deploy | Vercel production https://www.elabtutor.school | ✅ |
| Git | 2 commits pushati (a362f12, b2f542c) | ✅ |

**Bug trovati**: BUG-9 drag&drop in Libero mode (da investigare), BUG-10 variables generators (FIXED)
**Totale generatori scratchGenerator.js**: 41 (era 30)
**File modificati**: scratchGenerator.js, NanoR4Board.jsx, 6 prompt files

### ✅ S108-S112 — Roadmap Complete + LCD Blocks + Build Fixes (03-12/03/2026)
- S108: ROADMAP COMPLETE — iPad 8/8, CSP header, Ralph 21/22
- S111: LCD Blockly 4 blocks (lcd_init, lcd_print, lcd_set_cursor, lcd_clear), Scratch 22 blocks total
- S112: Blockly editor crash fix (patch-blockly v2), direct wire routing A*

### ✅ S66 — Credential Rotation + MEGA DEBUG (03/03/2026)

**Scope**: Rotazione completa credenziali + verifica completa di TUTTE le funzionalita' in produzione.

#### 4a. Credential Rotation
| Azione | Dettaglio | Stato |
|--------|-----------|-------|
| Password Admin built-in | `auth-login.js` — Nuova password crypto-random 16 char | ✅ DEPLOYATA |
| Password Teacher built-in | `auth-login.js` — Nuova password crypto-random 16 char | ✅ DEPLOYATA |
| Deploy Netlify #1 | Password nel codice aggiornate | ✅ LIVE |
| `ADMIN_PASSWORD_HASH` env var | SHA-256 della nuova password → Netlify Dashboard | ✅ AGGIORNATA |
| `ADMIN_TOKEN_SECRET` env var | Nuovo secret 64-char hex → Netlify Dashboard | ✅ AGGIORNATA |
| `USER_TOKEN_SECRET` env var | Nuovo secret 64-char hex → Netlify Dashboard | ✅ AGGIORNATA |
| Deploy Netlify #2 | Re-deploy dopo aggiornamento env vars | ✅ LIVE |
| **Verifica auth-login admin** | curl POST → `success: true`, token generato | ✅ PASS |
| **Verifica auth-login teacher** | curl POST → `success: true`, token generato | ✅ PASS |
| **Verifica admin panel** | curl POST `admin/login` → `success: true`, token con NUOVO secret | ✅ PASS |
| **Verifica vecchia password** | curl POST → rejected | ✅ PASS |
| **Verifica auth-login + admin panel + teacher** | Ri-verificato fine sessione: 5/5 PASS | ✅ PASS |

**File modificati**: `netlify/functions/auth-login.js` (righe 53-85)
**Deploy**: 2x Netlify production (code + env vars)
**Test**: 5/5 PASS (admin login, teacher login, admin panel, old password rejected, health check)

#### 4b. MEGA DEBUG — Verifica Chrome Completa
**Metodo**: Navigazione Chrome MCP automation su www.elabtutor.school in produzione.
**Nota di onesta'**: Test eseguiti via Chrome MCP extension, non manualmente. L'automazione ha avuto 2 disconnessioni durante la sessione e alcuni errori "Detached" (problemi dell'estensione, NON dell'app). I risultati sono comunque attendibili perche' verificati con screenshot e JavaScript DOM queries.

| # | Area Testata | Metodo | Risultato | Note |
|---|--------------|--------|-----------|------|
| 1 | **Simulatore core** | Chrome MCP — accessibility snapshot + JS eval | ✅ PASS | 19 toolbar buttons, `__ELAB_API` con 20+ metodi, SVG circuit rendering |
| 2 | **Play/Pause** | Chrome MCP — click + screenshot | ✅ PASS | LED Blink Vol3 Cap6 Esp1, LED glowing rosso, pause button ⏸ |
| 3 | **Overflow Menu** | Chrome MCP — click + read items | ✅ PASS | 8 items: Componenti, Lista Pezzi, Appunti, Quiz, Fili, Cattura, Report PDF, Lavagna |
| 4 | **Code Editor** | Chrome MCP — Vol3 experiment loaded | ✅ PASS | CM6 editor 198×241px, Arduino syntax, "Compila & Carica", font controls A-/A+ |
| 5 | **Serial Monitor** | Chrome MCP — toggle button click | ✅ PASS | Panel renders (white, empty = corretto prima di simulazione) |
| 6 | **Manuale** | Chrome MCP — tab click + snapshot | ✅ PASS | 3 volumi, sub-tabs (Manuali/Documenti/Carica), AI "Spiega questa pagina" |
| 7 | **Giochi** | Chrome MCP — tab click + scroll | ✅ PASS | Circuit Detective, 6+ puzzles, categories Terra/Schema/Cielo, Facile/Medio |
| 8 | **Video** | Chrome MCP — tab click + snapshot | ✅ PASS | YouTube link + "Carica", 4 quick-select, Videochiamata sub-tab |
| 9 | **Lavagna** | Chrome MCP — tab click + JS canvas eval | ✅ PASS | Canvas 1520×744 2x retina, drawing tools, "Chiedi a Galileo" button |
| 10 | **Vision Camera** (2 test) | Chrome MCP — click camera button | ✅ PASS | 2 risposte Gemini: 2610 + 2583 chars. Identifica componenti, posizioni fori, connessioni |
| 11 | **Vision Auto-screenshot** | Chrome MCP — scritto "guarda il mio circuito" | ✅ PASS | Trigger "guarda" → auto-cattura → Gemini risponde 2571 chars (D13→a18, 5V→bus+) |
| 12 | **Widget Pubblico** | Chrome MCP — funny-pika Netlify | ✅ PASS | Galileo AI risponde "Cos'e' un LED?" in ~8s, WhatsApp button presente |
| 13 | **Galileo Chat Panel** | Chrome MCP — welcome + quick actions | ✅ PASS | "Ciao, sono Galileo", Modalita' Guida toggle, camera button |
| 14 | **Console Errors** | Chrome MCP — readConsoleMessages | ✅ PASS | **0 errori applicativi**. 544 errori = Chrome MCP extension ("message channel closed") |

#### 4c. Test Automatizzati (S66 Verified)
| Suite | Risultato | Dettaglio |
|-------|-----------|-----------|
| **Nanobot Regex** | 45/45 PASS | 6 gruppi: Clearall(10), Action(10), Placement(10), Substitution(5), Notebook(5), Negative(5) |
| **Vitest Frontend** | 152/152 PASS | 13 file: PlacementEngine, CircuitSolver, Vol3, BreadboardFull, 69 experiments smoke, crypto, whiteboard, pinout, components |
| **Production Build** | ✅ 0 errori | 3m 46s. ElabTutorV4 957KB, index 670KB |
| **Infrastructure** | 3/3 ONLINE | Render (200 OK), Vercel (200 OK), Netlify (200 OK) |

#### 4d. Deliverables S66
| Deliverable | Stato |
|-------------|-------|
| PDR aggiornato (questo file) | ✅ |
| Scaletta video 2 minuti per presentazione al capo | ✅ Consegnata in chat |

### ✅ S65 — Vision Mastery (02/03/2026)
**Scope**: Fix truncation risposte vision Gemini. 10/10 test PASS.

| Azione | Dettaglio | Stato |
|--------|-----------|-------|
| ROOT CAUSE | `gemini-2.5-flash` thinking tokens consumavano `maxOutputTokens` budget | ✅ FIX |
| Fix | `thinkingConfig: {thinkingBudget: 2048}` + `maxOutputTokens: 8192` per vision | ✅ DEPLOYATO |
| Vision timeout | `call_google()` 30s → 60s per vision | ✅ |
| Vision logging | Response length + finishReason loggati | ✅ |
| 10/10 Test | V1-V10 tutti PASS (2463-2937 char responses, was 150 truncated) | ✅ |
| Nanobot | v5.2.0, 1 git push to Render, health check confirmed | ✅ |

### ✅ S63 — Action Routing Fix (02/03/2026)
| Fix | Dettaglio |
|-----|-----------|
| Action routing ROOT CAUSE | auto-screenshot intercettava `ACTION_INTENT_KEYWORDS` → aggiunto `shouldAutoScreenshot = false` |
| Widget field fix | `chat-widget.js`: `data.response` field corretto |
| Cleanup | `whatsapp-support.js` rimosso (duplicato con chat-widget) |

### ✅ S62 — Vision Root Cause + Toolbar (01/03/2026)
3 root cause fixes + 6 deploys + Ralph Loop 3/3 PASS:
- `.trim()` su TUTTI 7 env var URL reads (trailing `\n` Vercel)
- Gemini RESERVED for vision only (was in text racing pools → 429 exhaustion)
- Toolbar overflow fixed (breakpoint 1200→1400px)
- Kimi/Moonshot vision support added (ON STANDBY — 401 auth)

### Sessioni S31-S61 (macro-riassunto)
- S61: 6-bug fix — clearall regex, tab-aware screenshot, camera button, markdown links
- S60: 206Q HARDCORE — normalize_action_tags(), wing pin enforcement
- S58: Galileo GOD — 65 test, quiz fallback, safety filter refined
- S57: 6 touch targets 44px, Inter font eliminated
- S56: Galileo Onnipotente 5-agent audit, 13/13 action tags, defer on 16 pages
- S55: Mega-Debug 72 issues (C1-C2 critical, H1-H15, M1-M24, L3-L20)
- S54: detectIntent D2-D6, Group J fuzzy, CanvasTab Galileo
- S53: Vol3 wing pin migration 13/13, Serial Monitor redesign
- S52: 5-cycle audit (7 P1 + 6 P2)
- S50: QA Inesorabile (12 fixes)
- S47: accents + obfuscator
- S43: ShowcasePage crash, score correction
- S35: buildSteps, Tinkercad redesign 4 batch (21 SVG), gap wiring, quiz 138/138
- S34: gap wiring fix, quiz verification
- S33: QuizPanel UI, 69/69 Chrome PASS
- S31: volume gating, accent fixes

---

## 5. INVENTARIO COMPLETO (Aggiornato S66)

### ELAB Tutor (Vercel)
| Categoria | Conteggio |
|-----------|-----------|
| Componenti JSX | 110 |
| File CSS | 9 (modulare) + design-system.css |
| File Dati esperimenti | 8 (658KB, 3 volumi) |
| Servizi frontend | 10 |
| Esperimenti | 70 (Vol1:38, Vol2:18, Vol3:14) |
| Quiz | 138 domande (2 per esperimento) |
| Sfide Giochi | 53 (20 detective + 15 mystery + 18 POE) |
| SVG Componenti | 21 (tutti Tinkercad flat) |
| Lazy-loaded routes | 10 con RBAC guards |
| CircuitSolver | 2,060 righe |
| Build size | ElabTutorV4 957KB, index 670KB, codemirror 474KB |

### Sito Pubblico (Netlify)
| Categoria | Conteggio |
|-----------|-----------|
| Pagine HTML | 16 con chat-widget (13 root + 3 kit volumes) |
| Netlify Functions | 27 |
| Chat Widget | chat-widget.js (Galileo AI, nanobot /site-chat) |
| Security Headers | 5 (CSP, HSTS, XFO, XCTO, RP) |
| Escluse da widget | admin, login, reset-password, dashboard |

### Nanobot v5.3.0 (Render — Starter $7/mo)
| Categoria | Dettaglio |
|-----------|-----------|
| Framework | FastAPI + Docker |
| Endpoints | /health, /chat (vision), /tutor-chat (circuit), /site-chat (public), /diagnose, /hints, /debug-vision |
| Text AI | DeepSeek (primary) + Groq (secondary) — racing |
| Vision AI | Gemini 2.5 Flash (RESERVED, thinkingBudget:2048, maxOutputTokens:8192, timeout:60s) |
| Standby | Kimi/Moonshot (code ready, 401 auth — wrong platform keys) |
| Action Tags | 13: play, pause, reset, clearall, addcomponent, addwire, removecomponent, highlight, loadexperiment, compile, upload, quiz, serial |
| Knowledge | nanobot.yml + site-prompt.yml + prompts/*.yml |

---

## 6. NANOBOT ROUTING (Critico — S63 fix)

```
User message in Galileo Chat
    |
    +-- ACTION_INTENT_KEYWORDS match? (pulisci/aggiungi/avvia/...)
    |   +-- YES -> shouldAutoScreenshot = false
    |           -> tryNanobot(/tutor-chat) -> circuit specialist
    |           -> response contains [AZIONE:...] tags
    |           -> frontend executes via window.__ELAB_API
    |
    +-- VISUAL_KEYWORDS match? (cosa vedi/analizza/descrivi/guarda/...)
    |   +-- YES -> shouldAutoScreenshot = true
    |           -> capture screenshot -> tryNanobot(/chat + images)
    |           -> vision specialist (Gemini) analyzes image
    |
    +-- Camera button clicked?
    |   +-- -> manual screenshot -> tryNanobot(/chat + images)
    |       -> vision specialist
    |
    +-- Normal text question
        +-- tryNanobot(/tutor-chat) -> appropriate specialist
            -> response with educational content
```

---

## 7. AUTH ARCHITECTURE (Aggiornato S66 — Credential Rotation COMPLETA)

### Architettura
- **Server-side** — Netlify Functions (bcrypt + HMAC-SHA256 timing-safe tokens, 7-day expiry)
- **Token verification**: `crypto.timingSafeEqual()` con base64url Buffer (S55 C2)
- Route guards: RequireAuth → RequireLicense → RequireAdmin
- **CORS**: shared `utils/cors.js` — origin whitelist + localhost dev
- **Security headers**: CSP + HSTS (Netlify+Vercel) + X-Frame-Options + X-Content-Type + Referrer-Policy
- **Token storage**: `localStorage` (S55 H14)
- **Auto-refresh**: `startAutoRefresh()` chiama auth-me 10 min prima della scadenza (S55 H13)
- **Open redirect protection**: `auth-reset-request.js` valida hostname redirectUrl (S55 H15)

### Account Built-in (aggiornati S66)
| Account | Email | Ruolo | Password |
|---------|-------|-------|----------|
| Admin | marro.andrea96@gmail.com | admin | **ROTATA S66** — crypto-random 16 char |
| Teacher | teacher@elabtutor.school | teacher | **ROTATA S66** — crypto-random 16 char |

### Admin Panel
| Voce | Dettaglio |
|------|-----------|
| Endpoint login | `/.netlify/functions/admin/login` (POST email+password) |
| Email autorizzata | `andrea@omaric.it` (da env var ADMIN_EMAILS) |
| Auth method | SHA-256 hash password vs `ADMIN_PASSWORD_HASH` env var |
| Token | HMAC-signed con `ADMIN_TOKEN_SECRET`, scadenza 24h |
| Token utente | HMAC-signed con `USER_TOKEN_SECRET`, scadenza 7 giorni |

### Env Vars Critiche (Netlify Dashboard)
| Variabile | Funzione | Status S66 |
|-----------|----------|------------|
| `ADMIN_PASSWORD_HASH` | SHA-256 hash per login admin.js | ✅ **AGGIORNATA** |
| `ADMIN_TOKEN_SECRET` | Firma token admin (24h) | ✅ **AGGIORNATA** |
| `USER_TOKEN_SECRET` | Firma token utente (7 giorni) | ✅ **AGGIORNATA** |
| `PASSWORD_SALT` | Salt per hash SHA-256 legacy | Invariato |
| `ADMIN_EMAILS` | Email admin autorizzate (`andrea@omaric.it`) | Invariato |
| `NOTION_API_KEY` | Accesso Notion DB | Invariato |

> **S66 NOTA**: Tutte le sessioni attive prima del 03/03/2026 sono state invalidate dal cambio dei TOKEN_SECRET.

---

## 8. DEPLOY COMMANDS

```bash
# Sito Pubblico -> Netlify
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/newcartella" && \
npx netlify deploy --prod --dir=. --site=864de867-e428-4eed-bd86-c2aef8d9cb13

# ELAB Tutor -> Vercel
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && \
npm run build && npx vercel --prod --yes

# Nanobot -> Render (via git push)
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/nanobot" && \
git add -A && git commit -m "update" && git push origin main
```

---

## 9. ANTI-REGRESSIONE CHECKLIST (da verificare dopo OGNI deploy)

| # | Test | Comando/Azione | Expected | Fix Session | Ultimo Verificato |
|---|------|---------------|----------|-------------|-------------------|
| 1 | clearall | "pulisci il circuito" | Breadboard vuota | S63 | S66 (45/45 regex) |
| 2 | addcomponent | "aggiungi un led rosso" | LED appare | S63 | S66 (45/45 regex) |
| 3 | play | "avvia la simulazione" | ▶ badge | S62 | S66 (Chrome) |
| 4 | Camera vision | Click camera | Gemini analizza screenshot (2000+ chars) | S65 | **S66 (Chrome — 2610 chars)** |
| 5 | Auto vision | "guarda il circuito" (sim tab) | Screenshot auto + vision response | S65 | **S66 (Chrome — 2571 chars)** |
| 6 | Quiz | "fammi un quiz" | Quiz domande generate | S58 | S58 |
| 7 | Action normalize | Tutte le [AZIONE:] in maiuscolo | Frontend le parsa | S60 | S66 (45/45 regex) |
| 8 | Site chat | Domanda su funny-pika | AI response (non fallback) | S63 | **S66 (Chrome — "Cos'e' un LED?")** |
| 9 | No vision leak | Galileo non dice "specialista vision" | Identity preserved | S62+ | S62+ |
| 10 | Env var trim | Nessun `\n` in URL fetch | 200 OK | S62 | S66 (build OK) |
| 11 | Login admin | Login con nuove credenziali | success: true, token generato | S66 | **S66 (5/5 curl PASS)** |
| 12 | Vecchia password | Login con vecchia password | Rifiutato | S66 | **S66 (curl PASS)** |
| 13 | Admin panel | Login andrea@omaric.it | success: true, token con ADMIN_TOKEN_SECRET | S66 | **S66 (curl PASS)** |
| 14 | **Vitest** | `npx vitest run` | **152/152 PASS** | — | **S66** |
| 15 | **Build** | `npm run build` | **0 errori** | — | **S66 (3m 46s)** |

---

## 10. PALETTE E DESIGN

| Elemento | Valore |
|----------|--------|
| Navy | #1E4D8C |
| Lime | #7CB342 |
| Vol1 accent | #7CB342 |
| Vol2 accent | #E8941C |
| Vol3 accent | #E54B3D |
| Font display (Tutor) | Oswald |
| Font body (Tutor) | Open Sans |
| Font mono (Tutor) | Fira Code |
| Font display (Sito) | Poppins |
| Font body (Sito) | Roboto |
| Theme | Force-light (`data-theme="light"`) |
| Watermark | Andrea Marro — DD/MM/YYYY (dynamic JS) |

---

## 11. COSE DA IMPLEMENTARE — ROADMAP

### Priorita' ALTA (prossime sessioni)
| # | Task | Impatto | Dipendenze |
|---|------|---------|------------|
| 1 | **Volume gating server-side** (P1-5) | Sicurezza — attualmente bypassabile via DevTools | Netlify Function nuova |
| 2 | **STUDENT_TRACKING DB sharing** (P1-2) | Teacher dashboard funzionante | Notion UI action |
| 3 | **Notion DB ID mismatch fix** (P1-1) | Sync frontend/backend | Allineare notion-config.js |
| 4 | **Email E2E verification** (P1-3) | Conferma registration flow completo | Servizio email |
| 5 | **Cross-referencing specialisti** (P1-4) | Risposte AI integrate, non frammentate | Nanobot prompt engineering |

### Priorita' MEDIA (backlog)
| # | Task | Note |
|---|------|------|
| 6 | Sanitizzare circuitState (P2-NAN-5) | Prevenire XSS/injection |
| 7 | Sanitizzare messaggi sessione (P2-NAN-7) | Sicurezza chat |
| 8 | Eliminare 61 orphan files (P2-VET-4) | Risparmio 11.7 MB |
| 9 | SVG keyboard navigation + aria (P2-RES-9) | Accessibilita' WCAG |
| 10 | Skip-to-content link (P2-RES-10) | Accessibilita' |
| 11 | Focus-visible custom (P2-RES-11) | Accessibilita' |
| 12 | CollisionDetector useMemo refactor (P2-WIR-2) | Performance minore |
| 13 | Kimi API keys corrette (platform.moonshot.cn) | Vision Tier 1 backup |

### Priorita' BASSA (nice-to-have)
| # | Task | Note |
|---|------|------|
| 14 | Test E2E automatizzati (P3-1) | Playwright/Cypress |
| 15 | Arduino editor panel z-index (P3-2) | Cosmetic |
| 16 | Custom modal sostituire `confirm()` (P3-3) | UX |
| 17 | notionService 429 retry logic (P3-4) | Resilienza |
| 18 | CircuitSolver transient/capacitor (Physics 7→9) | Simulazione avanzata |
| 19 | TDZ obfuscator fix definitivo (P2-TDZ) | Mitigato ma non risolto |

---

## 12. LEZIONI APPRESE (Top 17 — S3 a S66)

1. **Score inflazionati non servono** — S42→S43 corresse 8.7→8.0. S62→S63 corresse 9.8→9.2. L'onesta' paga.
2. **Fixing one bug breaks another** — S63: il fix auto-screenshot (S61) ha rotto le azioni. Serve SEMPRE regression testing.
3. **`.trim()` su TUTTI gli env var** — Vercel copy-paste aggiunge `\n`. Root cause di vision failure S62.
4. **Endpoint routing e' critico** — `/chat` (vision) vs `/tutor-chat` (circuit). Un'immagine in piu' cambia tutto.
5. **`data.response` vs `data.reply`** — Server e client devono concordare sui nomi dei campi. Testare il FLUSSO, non solo l'endpoint.
6. **Gemini free tier ha limiti** — 20 req/min. Text racing esauriva la quota → vision rotta. Gemini RESERVED for vision only.
7. **Gemini thinking tokens consumano il budget** — `thinkingBudget` separato da `maxOutputTokens` (S65). Senza config esplicita, risposte troncate a ~150 char.
8. **Breadboard gap model** — Righe a-e e f-j sono reti SEPARATE. Serve wire esplicito.
9. **Client-only gating e' un'illusione** — Volume gating senza server e' bypassabile.
10. **CoV e' l'unica metodologia** — Leggere il codice, non i commenti. Testare l'endpoint, non la funzione.
11. **Chrome testing e' non-negoziabile** — curl PASS ≠ frontend PASS. Sempre verificare in browser.
12. **Anti-regressione checklist obbligatoria** — Dopo OGNI fix, ri-testare TUTTO il golden set.
13. **Ralph Loop per convergenza** — TEST→FIX→TEST→VALIDATE. Mai dichiarare PASS senza evidenza.
14. **Cross-referencing > alternanza** — Gli specialisti AI devono INCROCIARE informazioni, non lavorare in silos.
15. **Target audience triple** — Ragazzini 8-14 (primario), insegnanti senza basi, esperti. Analogie obbligatorie.
16. **Credential rotation periodica** — S66: mai lasciare password statiche troppo a lungo. Generare con `crypto.randomBytes()`, testare con curl, verificare vecchie rifiutate.
17. **Env var admin login vs auth-login** — Sono DUE sistemi separati: `auth-login.js` (utenti, bcrypt, USER_TOKEN_SECRET) e `admin.js` (pannello admin, SHA-256, ADMIN_TOKEN_SECRET, ADMIN_PASSWORD_HASH). Testare ENTRAMBI separatamente.

---

## 13. COSA NON E' STATO FATTO IN S66 — TRASPARENZA

Per completezza e onesta', elenco cosa **non** e' stato fatto in questa sessione:

1. **Nessuna nuova feature implementata** — S66 e' stata interamente testing + credential rotation
2. **Nessun bug fix al frontend** — L'unico file modificato e' `auth-login.js` (backend)
3. **Nessun deploy su Vercel** — Il frontend non e' stato toccato
4. **Nessun deploy su Render** — Nanobot non e' stato toccato
5. **Quiz non ritestati in Chrome** — Solo regex test automatici (45/45), non click reale su quiz panel
6. **Azioni Galileo non ritestaste in Chrome** — Le 13 action tags non sono state ri-testate live (solo regex). Le 15 richieste hard test sono state fatte nella prima parte della sessione (prima della compaction del contesto) e non sono direttamente verificabili da questo punto della conversazione.
7. **Report PDF non ritestato** — Il pattern two-step download e' stato implementato nella prima parte della sessione ma non ri-verificato dopo
8. **Passo Passo e Libero non testati** — Solo "Gia' Montato" verificato in Chrome
9. **Physics simulation non verificata** — LED visto acceso (rendering OK), ma nessun test di correttezza circuitale (es. corrente/tensione)

---

*PDR Attuale — Andrea Marro, 03/03/2026*
*Aggiornato post-Sessione 66 — Versione COMPLETA con MEGA DEBUG + Credential Rotation*
*"Lo stato reale del progetto e' l'unico stato che conta."*
*"Mai regredire. Ogni fix deve passare la golden checklist."*
*"Le credenziali si ruotano. Sempre."*
*"Se non l'hai testato, non dire che funziona."*
