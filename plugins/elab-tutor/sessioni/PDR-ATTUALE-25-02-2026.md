# PDR ATTUALE — Stato Progetto ELAB
## 25 Febbraio 2026 — Fotografia Completa Post-Sessione 45
## Metodo: Sintesi di TUTTI i report (S3-S45) + MEMORY.md + CoV

---

## 1. ARCHITETTURA SISTEMA

```
+---------------------------+     +------------------------+
|    SITO PUBBLICO          |     |    ELAB TUTOR          |
|    (Netlify)              |     |    (Vercel)            |
|                           |     |                        |
|  20 pagine HTML           |     |  React 19 + Vite 7    |
|  27 Netlify Functions     |     |  110 componenti JSX    |
|  Chat Widget (nanobot)    |     |  69 esperimenti        |
|  vetrina.html (NEW)       |     |  21 SVG Tinkercad      |
|                           |     |  CircuitSolver v4      |
|  funny-pika-3d1029.       |     |  Galileo AI chat       |
|  netlify.app              |     |  www.elabtutor.school  |
+-----------+---------------+     +----------+-------------+
            |                                |
            |   Auth (bcrypt + HMAC)         |  Fallback chain
            +--------+-----+----------------+
                     |     |
            +--------v-----v--------+
            |  NOTION (11 databases) |
            |  USERS, LICENSES,      |
            |  CLASSES, EVENTS...    |
            +----------+------------+
                       |
            +----------v------------+
            |  NANOBOT (Render)      |
            |  FastAPI + Docker      |
            |  /chat, /site-chat,    |
            |  /diagnose, /hints     |
            |  DeepSeek/Gemini/Groq  |
            +------------------------+
```

### URL di Produzione
| Servizio | URL | Status |
|----------|-----|--------|
| Sito Pubblico | https://funny-pika-3d1029.netlify.app | **LIVE** |
| ELAB Tutor | https://www.elabtutor.school | **LIVE** |
| Nanobot API | https://elab-galileo-nanobot.onrender.com | **INSTABILE** |
| GitHub Nanobot | github.com/AndreaMarro/elab-galileo-nanobot | **PUSHATO** |

### Path Locali
| Progetto | Path |
|----------|------|
| Sito Pubblico | `/Users/andreamarro/VOLUME 3/PRODOTTO/newcartella/` |
| ELAB Tutor | `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/` |
| Nanobot | `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/nanobot/` |

---

## 2. SCORE CARD COMPLESSIVA — BRUTALMENTE ONESTA

### Metodologia
Ogni score e giustificata con evidenze verificabili. Le sessioni precedenti che avevano score inflazionati sono state corrette. Il delta mostra il trend reale.

| # | Area | Score | Trend | Evidenza |
|---|------|-------|-------|----------|
| 1 | Build Health | **10/10** | = | 0 errori, 1474 moduli, 1m03s (S44) |
| 2 | Code Quality | **9.2/10** | = | 0 console.log, 0 dead exports, obfuscation MAX (S43) |
| 3 | Simulatore Rendering | **9.5/10** | = | 69/69 PASS screenshot, 21 SVG Tinkercad flat (S35) |
| 4 | Quiz | **9.0/10** | = | 138 domande, 69/69 esperimenti, QuizPanel UI (S33) |
| 5 | Wire V7 | **9.5/10** | = | Catmull-Rom + gravity sag, fili malleabili (S35) |
| 6 | Obfuscation | **9.5/10** | = | RC4 100%, CFG 0.75, domainLock, selfDefending (S42) |
| 7 | Knowledge Base Sito | **9.0/10** | NEW | site-prompt.yml v2 completo (S44B) |
| 8 | 3 Modalita Esperimento | **9.0/10** | = | Gia Montato, Passo Passo, Libero (S39) |
| 9 | Sito Pubblico | **8.8/10** | = | 21 pagine + chat widget + vetrina verificata (S45) |
| 10 | CORS + Security Headers | **9.0/10** | = | CSP + HSTS + X-Frame DENY (S44) |
| 11 | Correttezza Elettrica | **9.0/10** | = | 9/10 PASS, 1 FAIL v1-cap10-esp1 (S44) |
| 12 | Auth Server-Side | **8.5/10** | = | bcrypt + HMAC + timing-safe. -1.5: pw 6 chars server (S44) |
| 13 | Games | **8.5/10** | = | 53 sfide, stars, lazy-loaded (S27) |
| 14 | Whiteboard V3 | **8.5/10** | = | HiDPI fix, mai live-tested (S41) |
| 15 | Touch / Mobile | **8.5/10** | = | Touch targets >=44px (95%) (S42) |
| 16 | Frontend/UX Tutor | **8.0/10** | -1.0 | 58+ dichiarazioni 14px per LIM (S44 audit) |
| 17 | Chat Widget Sito | **8.0/10** | NEW | Logo ELAB, DOM-based, branding (S44B) |
| 18 | AI Integration (Galileo) | **7.5/10** | = | Fallback chain OK. -2.5: nanobot instabile (S44) |
| 19 | Vetrina Landing | **7.5/10** | +0.5 | Hero flash fix, redirect /vetrina, full visual audit. -2.5: stock images, screenshots pre-Tinkercad, no unique images (S45) |
| 20 | Teacher Dashboard | **7.0/10** | = | localStorage fallback. -3: STUDENT_TRACKING mancante (S43) |
| 21 | Simulatore Physics | **7.0/10** | = | KVL/KCL + MNA. -3: no transient, no capacitor (S44) |
| 22 | Rate Limiting | **7.0/10** | = | In-memory Map, non persistente (S44) |
| 23 | Volume Gating | **6.0/10** | = | CLIENT-ONLY, no validazione server (S44) |
| 24 | Nanobot Backend | **5.0/10** | NEW | Deploy avviato, provider instabili (S44B) |
| 25 | Teacher-Student | **5.0/10** | = | DB non configurato, localStorage fallback (S43) |
| | **OVERALL** | **~8.1/10** | | Media pesata (rendering/quiz/build pesano di piu) |

### Delta Storico Score Overall
| Sessione | Score | Note |
|----------|-------|------|
| S9.5 (CoV #1) | 6.6 | Prima CoV brutale — scoperte 18 funzioni morte |
| S10 | 7.2 | Fix P0, presentabile al boss |
| S20 | 7.8 | Simulatore stabile, 69 esperimenti |
| S30 | 8.5 | Classi, giochi, whiteboard, AI live |
| S33 | 8.7 | Quiz UI, 69/69 Chrome-validated |
| S42 | 8.7 | Obfuscation MAX, teacher fixes — **INFLAZIONATO** |
| S43 (onesto) | 8.0 | CoV correction: AI e teacher honest downgrade |
| S44 (audit) | 8.3 | 18 aree separate, volume gating scoperto |
| S44B | 8.1 | Nanobot instabile, vetrina non testata |
| S45 (attuale) | **8.2** | Vetrina verificata + hero fix, immagini da sostituire |

---

## 3. PROBLEMI APERTI PER PRIORITA

### P0 — BLOCCANTI
| ID | Problema | Causa | Responsabile | Status |
|----|----------|-------|-------------|--------|
| P0-1 | auth-login HTTP 500 | USERS DB Notion non condiviso | **UTENTE** | APERTO |
| P0-2 | auth-register HTTP 500 | Stessa causa P0-1 | **UTENTE** | APERTO |

> **NOTA CRITICA**: Senza fix P0-1/P0-2, NESSUN UTENTE puo fare login o registrarsi in produzione. Il tutor e accessibile solo se gia loggati (sessione attiva) o per pagine pubbliche.

### P1 — IMPORTANTI
| ID | Problema | Impact |
|----|----------|--------|
| P1-1 | Nanobot provider instabili su Render | Chat AI sito non funziona |
| P1-2 | v1-cap10-esp1 LED senza resistore | Errore fisico nel simulatore |
| P1-3 | Volume gating client-only | Bypass possibile via DevTools |
| P1-4 | Password server 6 chars (client 8) | Password deboli ammesse |
| P1-5 | 58+ font 14px per LIM (serve 16px) | Testo piccolo su proiettore |
| P1-6 | STUDENT_TRACKING DB non condiviso | Teacher dashboard non funziona |
| P1-7 | CLASSES DB non accessibile (503) | Gestione classi rotta |
| P1-8 | diagnoseCircuit/hints non esposti come bottoni | Utente deve scrivere in chat |
| P1-9 | System prompt duplicato (nanobot.yml + api.js) | Rischio divergenza |
| P1-10 | Screenshot Vetrina vecchi (pre-Tinkercad) + stock images | Immagini non rappresentative, foto stock invece di reali, duplicati con scuole.html |
| P1-11 | Email E2E non verificata | Registrazione potrebbe non funzionare |

### P2 — MEDI
| ID | Problema |
|----|----------|
| P2-1 | Rate limiter in-memory (reset su cold start) |
| P2-2 | CSP unsafe-inline scripts |
| P2-3 | ElabTutorV4 chunk 3478KB (1584KB gzip) |
| P2-4 | "Email non trovata" rivela account (user enum) |
| P2-5 | No audit log accessi admin |
| P2-6 | DashboardGestionale 410KB (recharts) |
| P2-7 | Chat-widget PAGE_SUGGESTIONS manca "vetrina" |
| P2-8 | Vetrina foto stock (classroom-teacher.jpg) + condivise con scuole.html (04.jpg, 01.jpg) |
| P2-9 | Mobile responsive non auditato sistematicamente |
| P2-10 | 11 env var names contengono "N8N" |

### P3 — MINORI
| ID | Problema |
|----|----------|
| P3-1 | No test E2E automatizzati |
| P3-2 | Editor Arduino panel z-index bleed-through |
| P3-3 | Admin font-sizes 12px (deliberato) |

---

## 4. INVENTARIO COMPLETO

### ELAB Tutor (Vercel)
| Categoria | Conteggio |
|-----------|-----------|
| Componenti JSX | 110 |
| File CSS | 9 (modulare) |
| File Dati esperimenti | 8 (658KB, 3 volumi) |
| Servizi frontend | 10 |
| Esperimenti | 69 (Vol1:38, Vol2:18, Vol3:13) |
| Quiz | 138 domande (2 per esperimento) |
| Sfide Giochi | 53 (20 detective + 15 mystery + 18 POE) |
| SVG Componenti | 21 (tutti Tinkercad flat) |
| Lazy-loaded routes | 10 con RBAC guards |
| CircuitSolver | 2,060 righe |

### Sito Pubblico (Netlify)
| Categoria | Conteggio |
|-----------|-----------|
| Pagine HTML | 21 (inclusa vetrina.html) |
| Netlify Functions | 27 |
| Chat Widget | 1 (su tutte le pagine) |
| Security Headers | 5 (CSP, HSTS, XFO, XCTO, RP) |

### Nanobot (Render)
| Categoria | Dettaglio |
|-----------|-----------|
| Framework | FastAPI + Docker |
| Endpoints | 5 (/health, /chat, /site-chat, /diagnose, /hints) |
| Provider AI | DeepSeek (primary) + Gemini + Groq |
| Knowledge files | nanobot.yml + site-prompt.yml |

### Database Notion
| DB | Status | Note |
|----|--------|------|
| USERS | **NON CONDIVISO** | P0 bloccante |
| LICENSES | OK | 8 codici validi |
| CLASSES | **NON ACCESSIBILE** | 503 |
| STUDENT_TRACKING | **NON CONDIVISO** | P1 |
| EVENTS | OK | |
| COURSES | OK | |
| WAITLIST | OK | |
| ORDERS | OK | |
| NEWSLETTER | OK | |
| TEACHER_REQUESTS | OK | |
| ADMIN | OK | |

---

## 5. FLUSSO UTENTE ATTUALE

```
Visitatore → Sito Pubblico
  ├── Home (index.html) — panoramica ELAB
  ├── Kit (kit.html) — 3 volumi con link Amazon
  ├── Scuole (scuole.html) — programma adozione
  ├── Vetrina (vetrina.html) — showcase simulatore + AI [NEW]
  ├── Chat Widget — domande a Galileo [NEW]
  └── Registrati → auth-register [ROTTO: 500]

Studente (post-login) → ELAB Tutor
  ├── Vetrina Simulatore — gallery + attivazione kit
  ├── Simulatore → seleziona volume → seleziona capitolo → seleziona esperimento
  │   ├── Gia Montato — circuito pronto, esplora
  │   ├── Passo Passo — costruzione guidata step-by-step
  │   └── Esplora Libero — canvas vuoto + palette componenti
  ├── Quiz (dopo esperimento) — 2 domande per esperimento
  ├── Giochi — CircuitDetective, POE, ReverseEngineering, CircuitReview
  ├── Chat Galileo — tutor AI socratico
  ├── Whiteboard — lavagna collaborativa
  └── Editor Arduino — compila e simula (Vol3)

Insegnante → Area Docente
  ├── Dashboard — [LIMITATO: localStorage only]
  ├── Classi — [ROTTO: 503]
  ├── Giochi gated — abilita/disabilita per classe
  └── Progressi studenti — [NON FUNZIONANTE: DB mancante]

Admin → Admin Panel
  ├── Gestionale — tabelle, grafici, report
  ├── Utenti — CRUD
  └── Configurazione — settings
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

# Nanobot → Render (via GitHub push)
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/nanobot" && \
git add -A && git commit -m "update" && git push origin main
# Poi: Render Dashboard → Manual Deploy
```

---

## 7. ACCOUNT TEST

| Ruolo | Email | Password | RBAC |
|-------|-------|----------|------|
| Admin | marro.andrea96@gmail.com | Qf3!dN9@bL5#wH7 | Tutor + Docente + Admin |
| Teacher | teacher@elab.test | Tm7@xK4!pR2#nJ8 | Tutor + Area Docente |

> **ATTENZIONE**: Login attualmente rotto in produzione (P0-1). Funziona SOLO se il DB USERS viene condiviso con l'integration Notion.

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
| Watermark | Andrea Marro — DD/MM/YYYY |

---

## 9. LEZIONI APPRESE (Top 10 — dalle 44 sessioni)

1. **Score inflazionati non servono a nessuno** — S42 dichiarava 8.7, S43 corresse a 8.0. L'onesta paga.
2. **javascript-obfuscator + dynamic imports** — RC4 corrompe i path delle chunk. `reservedStrings` e obbligatorio.
3. **codeProtection.js vs obfuscator** — Non usare entrambi. L'obfuscator da solo basta.
4. **Client-only gating e un'illusione** — Volume gating senza server e bypassabile in 10 secondi.
5. **race_providers() ritorna 3 valori** — Sempre spacchettare tutti i return values.
6. **Breadboard gap model** — Righe a-e e f-j sono reti SEPARATE. Serve wire esplicito per attraversare.
7. **"Implementato" != "Funzionante"** — Un endpoint che ritorna 500 non e implementato.
8. **CoV e l'unica metodologia che funziona** — Leggere il codice, non i commenti. Testare l'endpoint, non la funzione.
9. **Proactive AI events one-shot** — Usare Set in useRef per tracciare eventi gia sparati.
10. **Self-contained HTML > framework per landing** — vetrina.html e scuole.html sono piu veloci da creare e deployare di componenti React.

---

---

## 10. SESSIONE 45 — RIEPILOGO

**Data**: 25/02/2026

**Lavoro completato**:
1. **Hero flash fix** — Aggiunto `.hero .reveal { opacity: 1; transform: translateY(0); }` per evitare il flash di contenuto invisibile causato da IntersectionObserver timing
2. **Redirect /vetrina** — Aggiunto rule in netlify.toml: `/vetrina` → `/vetrina.html` (status 200)
3. **Deploy Netlify** — Deploy ID: 699e41c4c59d97bf58e01166
4. **Verifica visiva completa** — Tutti i 14 sezioni verificate in Chrome: hero, photo breaks, empathy, quote, simulatore, showcase, Galileo demo, benefits, features navy, horizontal learning, CTA, footer
5. **Analisi immagini** — Mappate tutte le 66 immagini in `/images/`, identificati 3 problemi: stock photo, duplicati con scuole.html, screenshots pre-Tinkercad

**Problemi identificati (per prossima sessione)**:
- `stock/classroom-teacher.jpg` e una foto stock — va sostituita con foto reale
- `scuole/classroom-electronics-04.jpg` e `01.jpg` sono condivise con scuole.html — servono immagini uniche
- `simulator-led-galileo.png` (showcase) troppo simile all'hero `simulator-led-galileo-response.png`
- Tutti gli screenshot potrebbero essere pre-Tinkercad redesign (S35) — servono screenshot freschi dal simulatore attuale
- Nessun riferimento ai cavi malleabili (Wire V7) nel copy della vetrina

---

*PDR Attuale — Andrea Marro, 25/02/2026*
*Prossimo aggiornamento: dopo Sessione 46*
*"Lo stato reale del progetto e l'unico stato che conta."*
