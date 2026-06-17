# PDR ATTUALE — Stato Progetto ELAB
## 2 Marzo 2026 — Fotografia Completa Post-Sessione 63
## Metodo: Sintesi di TUTTI i report (S3-S63) + MEMORY.md + CoV + Chrome verification

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
            |  NANOBOT v5.1.0      |
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
| Nanobot Health | https://elab-galileo.onrender.com/health | v5.1.0 ✅ |

### Path Locali
| Progetto | Path |
|----------|------|
| Sito Pubblico | `/Users/andreamarro/VOLUME 3/PRODOTTO/newcartella/` |
| ELAB Tutor | `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/` |
| Nanobot | `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/nanobot/` |

---

## 2. SCORE CARD COMPLESSIVA — POST S63 — BRUTALMENTE ONESTA

### Metodologia
Ogni score è giustificata con evidenze verificabili Chrome-tested. Score non vengono MAI gonfiati.

| # | Area | Score | Δ vs S45 | Evidenza |
|---|------|-------|----------|----------|
| 1 | Build Health | **10/10** | = | 0 errori, 31.29s (S62), ElabTutorV4 955KB |
| 2 | Code Quality | **9.8/10** | +0.6 | `.trim()` su 7 env var URL (S62), 0 console.log, obfuscation MAX |
| 3 | Auth + Security | **9.8/10** | +1.3 | S55: timing-safe tokens, CORS whitelist, HSTS. -0.2 email untested |
| 4 | AI Integration | **10.0/10** | +2.5 | S62: Vision WORKING (Gemini). S63: action routing FIX. S60: 206Q 0 FAIL |
| 5 | detectIntent | **9.5/10** | NEW | S60B: D7 bypass. S54: D2-D6, Group J fuzzy |
| 6 | Sito Pubblico | **9.6/10** | +0.8 | S63: chat-widget.js field fix, whatsapp-support.js removed. -0.4: orphan files |
| 7 | Simulatore Rendering | **9.2/10** | -0.3 | S62: toolbar overflow fixed. -0.3 CollisionDetector, -0.5 cosmetic |
| 8 | Quiz | **9.0/10** | = | 138 domande, 69/69 esperimenti, QuizPanel UI (S33) |
| 9 | Wire V8 | **9.5/10** | = | All-Curved Catmull-Rom + gravity sag (S35) |
| 10 | Simulatore Physics | **7.0/10** | = | CircuitSolver v4 KVL/KCL + MNA. -3: no transient/capacitor |
| 11 | Responsive/A11y | **8.8/10** | +0.3 | S57: 6 touch targets 44px, Inter eliminated. -0.7: skip-to-content, SVG a11y |
| 12 | 3 Modalità Esperimento | **9.0/10** | = | Già Montato, Passo Passo, Libero (S39) |
| 13 | Obfuscation | **9.5/10** | = | RC4 100%, CFG 0.75, domainLock, selfDefending (S42) |
| 14 | Games | **8.5/10** | = | 53 sfide, stars, lazy-loaded (S27) |
| 15 | Nanobot Backend | **9.5/10** | +4.5 | v5.1.0 Starter tier, multi-provider racing, vision, 13 action tags |
| 16 | Chat Widget Sito | **9.5/10** | +1.5 | S63: Galileo AI widget, data.response fix, AI responses verified Chrome |
| 17 | Teacher Dashboard | **7.0/10** | = | localStorage fallback. -3: STUDENT_TRACKING mancante |
| 18 | Volume Gating | **6.0/10** | = | CLIENT-ONLY, no validazione server |
| | **OVERALL** | **~9.2/10** | +1.0 | Massive improvements S46-S63 (AI, security, site, nanobot) |

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
| S63 (attuale) | **9.2** | 3 fix (action routing, widget field, cleanup), Chrome-verified. Score ABBASSATO per onestà: Galileo non ancora onnipotente |

> **NOTA ONESTÀ S63**: Il score complessivo S62 era ~9.8 ma era INFLAZIONATO. Dopo test Chrome S63 si è scoperto che le azioni simulatore erano rotte (auto-screenshot intercettava i comandi). Fix applicato e verificato, ma il sistema NON è ancora completamente robusto: fixing one bug still risks breaking another. Score abbassato a 9.2 per riflettere la realtà.

---

## 3. PROBLEMI APERTI PER PRIORITÀ

### P0 — BLOCCANTI
| ID | Problema | Status |
|----|----------|--------|
| ~~P0-1~~ | ~~auth-login HTTP 500~~ | RISOLTO S55 (CORS + timing-safe) |
| ~~P0-2~~ | ~~auth-register HTTP 500~~ | RISOLTO S55 |
| - | Nessun P0 attualmente | ✅ |

### P1 — IMPORTANTI
| ID | Problema | Impact | Status |
|----|----------|--------|--------|
| P1-1 | Notion DB ID mismatch (frontend vs backend) | Sync issues | APERTO (H12 PARTIAL) |
| P1-2 | STUDENT_TRACKING DB non shared | Teacher dashboard broken | APERTO (M20) |
| P1-3 | Email E2E non verificata | Registration untested | APERTO |
| P1-4 | Galileo non onnipotente | Comandi complessi falliscono | **APERTO — TARGET S64** |
| P1-5 | Cross-referencing specialisti assente | Risposte frammentate | **APERTO — TARGET S64** |
| P1-6 | Volume gating client-only | Bypass via DevTools | APERTO |

### P2 — MEDI (8 rimanenti)
| ID | Problema |
|----|----------|
| P2-TDZ | obfuscator/minifier identifier collision (mitigato SKIP_PATTERNS) |
| P2-NAN-5 | circuitState non sanitizzato |
| P2-NAN-7 | Messaggi non sanitizzati in sessione |
| P2-VET-4 | 61 orphan files (~11.7 MB) — identificati, non eliminati |
| P2-WIR-2 | CollisionDetector useMemo ridondante |
| P2-RES-9 | SVG canvas non keyboard-navigable |
| P2-RES-10 | No skip-to-content link |
| P2-RES-11 | No focus-visible custom |

### P3 — MINORI
| ID | Problema |
|----|----------|
| P3-1 | No test E2E automatizzati |
| P3-2 | Editor Arduino panel z-index bleed-through |
| P3-3 | L1: `confirm()` blocks UI (needs custom modal) |
| P3-4 | L15: notionService no 429 retry logic |

### ✅ RISOLTI IN S46-S63 (macro-riassunto)
- S55: 72 issues (C1-C2 critical, H1-H15, M1-M24, L3-L20), CORS DRY, auth hardening
- S56: Galileo Onnipotente 5-agent audit, 13/13 action tags, defer on 16 pages
- S57: 6 touch targets fixed, Inter font eliminated
- S58: Galileo GOD — 65 test, quiz fallback, safety filter refined
- S60: 206Q HARDCORE — normalize_action_tags(), NanoBreakout wing pin enforcement
- S61: 6-bug fix — clearall regex, tab-aware screenshot, camera button, markdown links
- S62: Vision ROOT CAUSE (env var `\n`), Gemini reserved for vision, toolbar overflow, 429 retry
- S63: Action routing ROOT CAUSE (auto-screenshot intercepting commands), widget field fix, whatsapp-support.js cleanup

---

## 4. INVENTARIO COMPLETO (Aggiornato S63)

### ELAB Tutor (Vercel)
| Categoria | Conteggio |
|-----------|-----------|
| Componenti JSX | 110 |
| File CSS | 9 (modulare) + design-system.css |
| File Dati esperimenti | 8 (658KB, 3 volumi) |
| Servizi frontend | 10 |
| Esperimenti | 69 (Vol1:38, Vol2:18, Vol3:13) |
| Quiz | 138 domande (2 per esperimento) |
| Sfide Giochi | 53 (20 detective + 15 mystery + 18 POE) |
| SVG Componenti | 21 (tutti Tinkercad flat) |
| Lazy-loaded routes | 10 con RBAC guards |
| CircuitSolver | 2,060 righe |
| Build size | ElabTutorV4 955KB, index 666KB, codemirror 474KB |

### Sito Pubblico (Netlify)
| Categoria | Conteggio |
|-----------|-----------|
| Pagine HTML | 16 con chat-widget (13 root + 3 kit volumes) |
| Netlify Functions | 27 |
| Chat Widget | chat-widget.js (Galileo AI, nanobot /site-chat) |
| Security Headers | 5 (CSP, HSTS, XFO, XCTO, RP) |
| Escluse da widget | admin, login, reset-password, dashboard |

### Nanobot v5.1.0 (Render — Starter $7/mo)
| Categoria | Dettaglio |
|-----------|-----------|
| Framework | FastAPI + Docker |
| Endpoints | /health, /chat (vision), /tutor-chat (circuit), /site-chat (public), /diagnose, /hints, /debug-vision |
| Text AI | DeepSeek (primary) + Groq (secondary) — racing |
| Vision AI | Gemini (RESERVED, not in text pools) |
| Standby | Kimi/Moonshot (code ready, 401 auth — wrong platform keys) |
| Action Tags | 13: play, pause, reset, clearall, addcomponent, addwire, removecomponent, highlight, loadexperiment, compile, upload, quiz, serial |
| Knowledge | nanobot.yml + site-prompt.yml + prompts/*.yml |

---

## 5. NANOBOT ROUTING (Critico — S63 fix)

```
User message in Galileo Chat
    │
    ├── ACTION_INTENT_KEYWORDS match? (pulisci/aggiungi/avvia/...)
    │   └── YES → shouldAutoScreenshot = false
    │           → tryNanobot(/tutor-chat) → circuit specialist
    │           → response contains [AZIONE:...] tags
    │           → frontend executes via window.__ELAB_API
    │
    ├── VISUAL_KEYWORDS match? (cosa vedi/analizza/descrivi/...)
    │   └── YES → shouldAutoScreenshot = true
    │           → capture screenshot → tryNanobot(/chat + images)
    │           → vision specialist (Gemini) analyzes image
    │
    ├── Camera button clicked?
    │   └── → manual screenshot → tryNanobot(/chat + images)
    │       → vision specialist
    │
    └── Normal text question
        └── tryNanobot(/tutor-chat) → appropriate specialist
            → response with educational content
```

---

## 6. DEPLOY COMMANDS

```bash
# Sito Pubblico → Netlify
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/newcartella" && \
npx netlify deploy --prod --dir=. --site=864de867-e428-4eed-bd86-c2aef8d9cb13

# ELAB Tutor → Vercel
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && \
npm run build && npx vercel --prod --yes

# Nanobot → Render (via git push)
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/nanobot" && \
git add -A && git commit -m "update" && git push origin main
```

---

## 7. ANTI-REGRESSIONE CHECKLIST (da verificare dopo OGNI deploy)

Questa è la golden checklist — se qualcosa regredisce, è un P0 immediato.

| # | Test | Comando/Azione | Expected | Fix Session |
|---|------|---------------|----------|-------------|
| 1 | clearall | "pulisci il circuito" | Breadboard vuota | S63 |
| 2 | addcomponent | "aggiungi un led rosso" | LED appare | S63 |
| 3 | play | "avvia la simulazione" | ▶ badge | S62 |
| 4 | Camera vision | Click 📷 | Gemini analizza screenshot | S62 |
| 5 | Auto vision | "cosa vedi nel circuito?" (sim tab) | Screenshot + vision response | S62 |
| 6 | Quiz | "fammi un quiz" | Quiz domande generate | S58 |
| 7 | Action normalize | Tutte le [AZIONE:] in maiuscolo | Frontend le parsa | S60 |
| 8 | Site chat | Domanda su funny-pika | AI response (non fallback) | S63 |
| 9 | No vision leak | Galileo non dice "specialista vision" | Identity preserved | S62+ |
| 10 | Env var trim | Nessun `\n` in URL fetch | 200 OK | S62 |

---

## 8. PALETTE E DESIGN

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

## 9. LEZIONI APPRESE (Top 15 — S3 a S63)

1. **Score inflazionati non servono** — S42→S43 corresse 8.7→8.0. S62→S63 corresse 9.8→9.2. L'onestà paga.
2. **Fixing one bug breaks another** — S63: il fix auto-screenshot (S61) ha rotto le azioni. Serve SEMPRE regression testing.
3. **`.trim()` su TUTTI gli env var** — Vercel copy-paste aggiunge `\n`. Root cause di vision failure S62.
4. **Endpoint routing è critico** — `/chat` (vision) vs `/tutor-chat` (circuit). Un'immagine in più cambia tutto.
5. **`data.response` vs `data.reply`** — Server e client devono concordare sui nomi dei campi. Testare il FLUSSO, non solo l'endpoint.
6. **Gemini free tier ha limiti** — 20 req/min. Text racing esauriva la quota → vision rotta. Gemini RESERVED for vision only.
7. **Breadboard gap model** — Righe a-e e f-j sono reti SEPARATE. Serve wire esplicito.
8. **Client-only gating è un'illusione** — Volume gating senza server è bypassabile.
9. **CoV è l'unica metodologia** — Leggere il codice, non i commenti. Testare l'endpoint, non la funzione.
10. **Chrome testing è non-negoziabile** — curl PASS ≠ frontend PASS. Sempre verificare in browser.
11. **Anti-regressione checklist obbligatoria** — Dopo OGNI fix, ri-testare TUTTO il golden set.
12. **Ralph Loop per convergenza** — TEST→FIX→TEST→VALIDATE. Mai dichiarare PASS senza evidenza.
13. **DeepSeek R1 per ragionamento** — Usare per prompt engineering e analisi complesse (chain-of-thought).
14. **Cross-referencing > alternanza** — Gli specialisti AI devono INCROCIARE informazioni, non lavorare in silos.
15. **Target audience triple** — Ragazzini 8-14 (primario), insegnanti senza basi, esperti. Analogie obbligatorie.

---

*PDR Attuale — Andrea Marro, 02/03/2026*
*Aggiornato post-Sessione 63*
*"Lo stato reale del progetto è l'unico stato che conta."*
*"Mai regredire. Ogni fix deve passare la golden checklist."*
