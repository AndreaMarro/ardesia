# Prompt Sessione 20 — ELAB FIX & VERIFY
**Data**: 19 Febbraio 2026
**Autore**: Andrea + Claude (co-scritto)
**Prerequisito**: Sessione 19 completata (Audit 8.7/10 — report in `memory/report-sessione19.md`)

---

## Contesto Onesto (dove siamo DAVVERO)

La Session 19 ha auditato l'INTERA piattaforma ELAB Tutor con Playwright headless (22+ screenshot). Risultato: **8.7/10** — significativamente sotto il 9.3 di Session 18 perche quell'audit copriva solo il Simulatore (eccellente, 9.6). L'audit completo ha esposto problemi reali:

- **60% delle funzionalita** dipende da n8n che e OFFLINE da settimane
- Teacher Dashboard e un guscio vuoto (0 studenti)
- L'AI Galileo non risponde a nessun messaggio
- L'Admin Panel ha 6/8 tab bloccate
- La Whiteboard V2 e stata deployata ma non testata su produzione

**Score attuale per area**:
| Area | Score | Problema |
|------|-------|----------|
| Simulatore | 9.6 | Eccellente, niente da fare |
| Auth/Security | 9.0-9.5 | Solido |
| Whiteboard V2 | Non testata | Appena deployata, va verificata |
| Responsive | 7.5 | Tab overflow mobile su Teacher/Admin |
| Teacher | 5.5 | 0 studenti, Nudge sessionStorage |
| Admin/Gestionale | 4.0-5.0 | n8n offline |
| AI Galileo | 3.0 | n8n offline |
| Infrastruttura | 3.0 | n8n offline (3/3 HTTP 000) |

---

## Obiettivo Sessione 20

Risolvere le priorita P0-P2 con fix reali e Chain of Verification su ogni singolo fix. Nessun fix e "fatto" finche non c'e uno screenshot Playwright che lo prova in produzione.

---

## REGOLE DI ONESTA (NON NEGOZIABILI)

1. **Se non lo testi con Playwright su produzione, non e fatto**
2. **Se n8n e ancora offline, lo score AI/Admin resta 3.0** — non inventare workaround cosmetici
3. **Ogni fix richiede**: screenshot PRIMA -> codice -> deploy -> screenshot DOPO
4. **Se un fix fallisce, riporta il fallimento** — non nascondere
5. **Se non riesci a risolvere qualcosa, scrivi perche** — nessuna scusa generica
6. **0 innerHTML non sicuro**, 0 console.log debug, 0 hardcoded credentials
7. **Distingui sempre**: fix reale vs workaround vs impossibile

---

## PRIORITA (ordine di esecuzione)

### FASE 0 — n8n Status Check (5 min)
**Prima di tutto il resto**: verificare se n8n e raggiungibile.

```bash
# Testare i 3 webhook
curl -s -o /dev/null -w "%{http_code}" [URL_WEBHOOK_ADMIN]
curl -s -o /dev/null -w "%{http_code}" [URL_WEBHOOK_GALILEO]
curl -s -o /dev/null -w "%{http_code}" [URL_WEBHOOK_KPI]
```

**Se n8n e online**: procedere con FASE 1 (test AI E2E).
**Se n8n e offline**: procedere con FASE 2 (fix che NON dipendono da n8n). Segnare n8n come "richiede intervento Hostinger manuale".

> **NOTA**: I webhook URL esatti sono in `src/services/api.js` come env vars (`VITE_N8N_CHAT_URL`). Verifica i valori su Vercel Environment Variables.

---

### FASE 1 — AI Galileo E2E (se n8n online)
Solo se FASE 0 conferma n8n online:

- [ ] Aprire chat Galileo, inviare messaggio "Cos'e un LED?"
- [ ] Verificare risposta socratica (non solo echo)
- [ ] Verificare safety filter (inviare messaggio off-topic)
- [ ] Verificare rate limiting (3s interval, 10/min)
- [ ] Screenshot Playwright della conversazione
- [ ] **Chain of Verification**: screenshot chat con risposta reale su produzione

---

### FASE 2 — Whiteboard V2 Verification (nuova feature)
La WhiteboardOverlay V2 e stata deployata in Session 19 ma MAI testata su produzione.

- [ ] Aprire simulatore su qualsiasi esperimento
- [ ] Attivare whiteboard (icona lavagna nel sidebar)
- [ ] Testare **matita** — disegnare linea, verificare colore e spessore
- [ ] Testare **gomma** — cancellare parte del disegno
- [ ] Testare **testo** — click -> input -> "LED R=330ohm" -> Enter -> verificare rendering
- [ ] Testare **rettangolo** — drag -> verifica preview live -> release
- [ ] Testare **cerchio** — drag -> verifica ellisse
- [ ] Testare **freccia** — drag -> verifica punta
- [ ] Testare **linea** — drag -> verifica segmento
- [ ] Testare **undo** (Ctrl+Z) — dopo disegno, annullare ultimo stroke
- [ ] Testare **redo** (Ctrl+Y) — ripristinare stroke annullato
- [ ] Testare **export PNG** — click download -> verificare file scaricato
- [ ] Testare **cancella tutto** — canvas pulito
- [ ] Testare **chiudi** — overlay scompare, circuito sotto visibile
- [ ] Testare **persistenza** — disegnare -> chiudere -> riaprire -> disegno presente
- [ ] Testare **mobile 375px** — toolbar non overflow, touch disegno funziona
- [ ] **Chain of Verification**: screenshot ogni strumento in azione

---

### FASE 3 — Tab Overflow Mobile Fix
**Problema verificato**: Teacher Dashboard mostra solo 3/6 tab su mobile (375px). Admin simile.

**File target**:
- `src/components/teacher/TeacherDashboard.jsx` — tab bar container
- `src/components/admin/AdminPage.jsx` — tab bar container

**Fix richiesto**:
- `overflow-x: auto` sul container tab
- `-webkit-overflow-scrolling: touch` per scroll fluido
- Padding/margin per mostrare che ci sono piu tab (ombra fade-out a destra?)
- Touch target minimo 44px per ogni tab button

**Chain of Verification**:
- [ ] Screenshot PRIMA (375px) — mostrare tab nascoste
- [ ] Applicare fix
- [ ] Build + Deploy Vercel
- [ ] Screenshot DOPO (375px) — mostrare scroll funzionante
- [ ] Screenshot DOPO (768px) — verificare che tablet non sia rotto
- [ ] Screenshot DOPO (1440px) — verificare che desktop non sia rotto

---

### FASE 4 — Font Size Minimum 14px
**Problema**: `minFont: 9px` trovato nel Tutor su tutti i viewport.

**Azione**:
1. Grep tutti i `fontSize` sotto 14px nei file JSX
2. Per ogni occorrenza valutare: e un elemento leggibile dall'utente? (se si: portare a 14px min)
3. Eccezioni accettabili: SVG labels interne, tooltip hints, badge numerici
4. **NON** cambiare font-size in componenti SVG del simulatore (pin labels, component values)

**Chain of Verification**:
- [ ] Lista esatta dei file/linee modificati
- [ ] Build senza errori
- [ ] Screenshot prima/dopo di 3 pagine campione (Login, Teacher, Admin)

---

### FASE 5 — Touch Target "Informativa Privacy"
**Problema**: Link nel consent banner e 132x19px (sotto 36px minimo).

**File target**: `src/components/common/ConsentBanner.jsx`

**Fix**: Aumentare padding verticale del link a minimo `padding: 8px 4px` per raggiungere almeno 36px.

**Chain of Verification**:
- [ ] Screenshot PRIMA con DevTools overlay dimensioni
- [ ] Fix applicato
- [ ] Screenshot DOPO con dimensioni >= 36px

---

### FASE 6 — Dead Social Code Cleanup
**Problema**: ~525 LOC di codice community/groups/profile non piu usato.

**File target**:
- `src/components/social/Navbar.jsx` — refs a community/groups/profile
- `src/services/elab-client.js` (sito Netlify) — social login refs

**Azione**: Rimuovere tutto il codice referenziato a:
- Community posts/comments
- Groups
- Profile pages
- SOCIAL_ENABLED flags
- social login skeleton

**Chain of Verification**:
- [ ] LOC count PRIMA
- [ ] Rimozione
- [ ] LOC count DOPO
- [ ] Build senza errori
- [ ] Grep "community|groups|SOCIAL" -> 0 risultati nei componenti attivi
- [ ] Playwright: navigare tutte le pagine -> nessun link community visibile

---

### FASE 7 — Bundle Optimization Check
**Problema**: ElabTutorV4 = 935KB (vicino a 1000KB warning).

**Azione**:
1. Analizzare cosa c'e dentro ElabTutorV4 chunk (vite-plugin-visualizer o source-map-explorer)
2. Identificare moduli lazy-loadabili (es. CodeEditorCM6, CircuitDetective, ReverseEngineering)
3. Se possibile, splittar almeno 1 modulo pesante per scendere sotto 800KB
4. **NON** rompere nulla — se il code-split e rischioso, documentare perche e lasciare stare

**Chain of Verification**:
- [ ] Bundle size PRIMA
- [ ] Azione (split o documento perche non si splitta)
- [ ] Bundle size DOPO
- [ ] Build + smoke test (tutte le tab caricano)

---

## CHAIN OF VERIFICATION FINALE

Dopo TUTTI i fix, eseguire un singolo script Playwright che:

1. Login come admin
2. Navigare TUTTE le pagine: #tutor, #teacher, #admin, #dashboard, #vetrina
3. Screenshot ogni pagina a 375px, 768px, 1440px
4. Verificare: nessun overflow orizzontale, nessun testo tagliato, nessun errore console
5. Aprire Whiteboard -> disegnare -> chiudere -> riaprire -> verificare persistenza
6. Se n8n online: inviare messaggio Galileo -> verificare risposta

**Output**: `report-sessione20.md` con:
- Score card aggiornata (onesta)
- Screenshot PRIMA/DOPO per ogni fix
- Lista di cosa resta da fare
- Aggiornamento MEMORY.md

---

## TOOLS E PLUGINS DA USARE

| Tool | Uso |
|------|-----|
| **Playwright-core** | E2E testing, screenshot, viewport resize |
| **quality-audit skill** | Font size audit, touch target audit, bundle analysis |
| **Bash grep/wc** | LOC count, dead code detection |
| **Vercel CLI** | Deploy + verify |
| **vite build** | Bundle analysis |
| **curl** | n8n health check |

---

## TEST ACCOUNTS

| Ruolo | Email | Password |
|-------|-------|----------|
| Admin | debug@test.com | Xk9#mL2!nR4 |
| Teacher | teacher@elab.test | Pw8&jF3@hT6!cZ1 |
| Student | student@elab.test | Ry5!kN7#dM2$wL9 |
| Admin | marro.andrea96@gmail.com | Bz4@qW8!fJ3#xV6 |

## CHROMIUM PATH
```
/Users/andreamarro/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing
```

## URLS
- **Tutor (Vercel)**: https://elab-builder.vercel.app
- **Sito (Netlify)**: https://funny-pika-3d1029.netlify.app
- **Auth API**: https://funny-pika-3d1029.netlify.app/.netlify/functions/auth-*

---

## COSA NON FARE

1. **NON dare voti al simulatore** — e gia 9.6, non toccarlo
2. **NON fare refactoring "migliorativi"** senza fix specifico dalla lista
3. **NON cambiare architettura** — solo fix puntuali con Chain of Verification
4. **NON scrivere "funziona" senza screenshot Playwright**
5. **NON tentare di riattivare n8n** se richiede credenziali Hostinger che non hai
6. **NON fixare bug SVG del simulatore** (P3, fuori scope)

---

## TIMELINE STIMATA

| Fase | Tempo | Dipendenza |
|------|-------|------------|
| FASE 0 (n8n check) | 5 min | Nessuna |
| FASE 1 (AI E2E) | 15 min | n8n online |
| FASE 2 (Whiteboard V2 test) | 20 min | Nessuna |
| FASE 3 (Tab overflow) | 25 min | Nessuna |
| FASE 4 (Font 14px) | 20 min | Nessuna |
| FASE 5 (Touch target) | 10 min | Nessuna |
| FASE 6 (Dead code) | 15 min | Nessuna |
| FASE 7 (Bundle) | 20 min | Nessuna |
| Verification finale | 15 min | Tutti i fix |
| **Totale** | **~2.5h** | |

---

## OBIETTIVO SCORE

- **Se n8n online**: da 8.7 -> **9.3+**
- **Se n8n offline**: da 8.7 -> **9.0** (fix P1-P2 senza AI/Admin)
- **Minimo accettabile**: 8.9 (tutti i fix P1-P2 completati con CoV)

---

*Prompt Sessione 20 — Andrea Marro + Claude, 19/02/2026*
*Principio: Fix reali con Chain of Verification. Nessun voto regalato.*
