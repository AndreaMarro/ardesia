# SPRINT F — MASTER PLAN G31-G40

**Data**: 30/03/2026
**Deadline PNRR**: 30/06/2026 (91 giorni)
**Sviluppatore**: Andrea Marro (unico)
**Score attuale**: 8.0/10 | Target Sprint F: ≥ 9.0/10
**Prompts sessioni**: `docs/prompts/G31-*.md` ... `docs/prompts/G40-*.md`

---

## DOVE TROVARE I PROMPT

```
docs/prompts/
├── G31-backend-server-mvp.md        ← GIÀ SCRITTO
├── G32-gdpr-encryption-layer.md     ← DA SCRIVERE a fine G31
├── G33-test-e2e-playwright.md       ← DA SCRIVERE a fine G32
├── G34-compilatore-wasm.md          ← DA SCRIVERE a fine G33
├── G35-report-pdf-grafici.md        ← DA SCRIVERE a fine G34
├── G36-unlim-voice-memory.md        ← DA SCRIVERE a fine G35
├── G37-landing-mepa.md              ← DA SCRIVERE a fine G36
├── G38-polish-stress-test.md        ← DA SCRIVERE a fine G37
├── G39-pre-release-audit.md         ← DA SCRIVERE a fine G38
├── G40-release-candidate.md         ← DA SCRIVERE a fine G39
└── SPRINT-F-MASTER-PLAN.md          ← QUESTO FILE (indice)
```

## REGOLA DI RISCRITTURA PROMPT

**ALLA FINE DI OGNI SESSIONE**, prima di chiudere:

1. Esegui `/elab-arsenal:session-manager` per creare handoff
2. Leggi questo file (`SPRINT-F-MASTER-PLAN.md`) per il piano della sessione SUCCESSIVA
3. **RISCRIVI il prompt della sessione successiva** adattandolo a:
   - Cosa è stato effettivamente completato (non il piano ideale)
   - Cosa è rimasto in sospeso
   - Nuovi problemi emersi
   - Score aggiornato
4. Il prompt riscritto DEVE mantenere:
   - Sezione SKILL DA USARE con le skill elab-arsenal appropriate
   - Sezione CHAIN OF VERIFICATION con i 3 passaggi
   - Sezione DELIVERABLE ATTESI con criteri di accettazione
   - Riferimento a questo MASTER PLAN
5. Salva come `docs/prompts/G{N+1}-*.md`

---

## PANORAMICA 10 SESSIONI

```
     G31          G32          G33         G34         G35
  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
  │ BACKEND │→│  GDPR   │→│ TEST E2E│→│  WASM   │→│ REPORT  │
  │ SERVER  │ │ ENCRYPT │ │PLAYWRIGHT│ │COMPILER │ │PDF+CHART│
  │  MVP    │ │ + AUTH  │ │ 5 FLOWS │ │ OFFLINE │ │DASHBOARD│
  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
       P0          P0          P1          P1          P2

     G36          G37          G38         G39         G40
  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
  │ UNLIM   │→│LANDING  │→│ POLISH  │→│PRE-REL  │→│RELEASE  │
  │ VOICE + │ │ MePA +  │ │ STRESS  │ │ AUDIT   │ │CANDIDATE│
  │ MEMORY  │ │ONBOARD  │ │  TEST   │ │ TOTALE  │ │+ DEPLOY │
  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
       P1          P0          P1          P0          P0
```

---

## G31 — Backend Server MVP ⬅ GIÀ SCRITTO
**File**: `docs/prompts/G31-backend-server-mvp.md`
**Priorità**: P0
**Obiettivo**: PocketBase su Render EU. POST /api/sync, GET /api/class/:id. studentService migrato. Teacher Dashboard da server.
**Score target**: 8.0 → 8.6

---

## G32 — GDPR Encryption + Auth Server-Side
**File**: `docs/prompts/G32-gdpr-encryption-layer.md` (da scrivere a fine G31)
**Priorità**: P0

### Obiettivo
Cifratura dati localStorage (AES-GCM), auth server-side robusta, audit log completo, data retention enforcement.

### Skill da usare
| Skill | Perché |
|-------|--------|
| `/elab-arsenal:quality-gate` | Baseline + post |
| `/elab-arsenal:legale-gdpr` | Audit GDPR punto per punto |
| `/elab-arsenal:avversario-red-team` | Attacca auth per trovare bypass |
| `/elab-arsenal:deep-web-research` | DPIA template italiano per scuole |
| `/elab-arsenal:legale-contratti` | Requisiti DPA per PA |
| `/elab-arsenal:context-loader` | Contesto |
| `/elab-arsenal:session-manager` | Handoff |

### Task principali
1. **Cifrare localStorage** — `studentService._saveActivities()` cifra con AES-GCM, chiave da userId
2. **Auth server-side** — PocketBase auth con email/password, token JWT, refresh token
3. **Audit log** — ogni accesso API loggato con timestamp + userId + action + IP
4. **Data retention** — cron job PocketBase che cancella record > 730 giorni
5. **DPIA draft** — documento Data Protection Impact Assessment (template italiano)
6. **Consenso parentale server-side** — PocketBase verifica email genitori prima di sbloccare account <14 anni

### Deliverable
- localStorage cifrato end-to-end
- Auth con JWT server-validated
- Audit log queryable da admin
- DPIA v1 in `docs/legal/DPIA-elab.md`
- Score GDPR: 8/10 → 9/10

---

## G33 — Test E2E con Playwright
**File**: `docs/prompts/G33-test-e2e-playwright.md` (da scrivere a fine G32)
**Priorità**: P1

### Obiettivo
5 test E2E con browser reale. Catturare regressioni prima del deploy.

### Skill da usare
| Skill | Perché |
|-------|--------|
| `/elab-arsenal:quality-gate` | Baseline + post |
| `/elab-arsenal:test-e2e-integrazione` | Design test journey |
| `/elab-arsenal:test-simulatore` | Verifica rendering SVG |
| `/elab-arsenal:usabilita-docente` | Test Prof.ssa Rossi journey |
| `/elab-arsenal:usabilita-studente` | Test Marco journey |
| `/elab-arsenal:ricerca-strumenti` | Playwright vs Cypress confronto |
| `plugin:playwright` | MCP Playwright per esecuzione diretta |

### Task principali
1. `npm install -D @playwright/test` + config
2. **Test 1**: Homepage → "Prova Subito" → simulatore caricato → SVG canvas presente
3. **Test 2**: Seleziona esperimento Vol.1 Cap.6 → LED e resistore nel canvas → breadboard visibile
4. **Test 3**: Clicca UNLIM → input bar → invia "Ciao" → risposta ricevuta
5. **Test 4**: /#teacher → tab progressi → griglia presente → CSV export scarica file
6. **Test 5**: Login → dashboard studente → progresso visibile
7. CI: GitHub Action che esegue `npx playwright test` su push

### Deliverable
- 5 test E2E che passano
- GitHub Action CI configurata
- Screenshot di fallimento automatici
- Score test: 6/10 → 8.5/10

---

## G34 — Compilatore WASM Locale
**File**: `docs/prompts/G34-compilatore-wasm.md` (da scrivere a fine G33)
**Priorità**: P1

### Obiettivo
Compilazione C++ offline nel browser. Eliminare dipendenza da n8n.

### Skill da usare
| Skill | Perché |
|-------|--------|
| `/elab-arsenal:quality-gate` | Baseline + post |
| `/elab-arsenal:ricerca-tech-frontier` | avr-gcc WASM, emscripten, alternative |
| `/elab-arsenal:ricerca-strumenti` | WASM avr-gcc prebuilt vs build vs Vercel Edge |
| `/elab-arsenal:test-arduino-scratch` | Verifica compilazione 62 esperimenti |
| `/elab-arsenal:ai-backend` | Fallback chain: WASM → n8n → errore |
| `/elab-arsenal:avversario-stress` | Stress test: compilazioni rapide, codice enorme |

### Task principali
1. **Ricerca**: esiste avr-gcc prebuilt WASM? Se no: emscripten build? Se no: Vercel Edge Function?
2. **Integrazione**: `src/services/compiler.js` con fallback chain
3. **Test**: compilare defaultCode di tutti i 62 esperimenti offline
4. **Performance**: target < 3s per compilazione, < 5MB WASM bundle
5. **UI**: indicatore "Compilazione locale ⚡" vs "Compilazione remota 🌐"

### Deliverable
- Compilazione funziona senza server
- Tutti 62 esperimenti compilano offline
- Bundle WASM < 5MB (lazy loaded)
- Score simulatore: 8/10 → 9/10

---

## G35 — Report PDF + Grafici Interattivi
**File**: `docs/prompts/G35-report-pdf-grafici.md` (da scrivere a fine G34)
**Priorità**: P2

### Obiettivo
Dashboard con grafici interattivi (recharts) + export PDF per riunioni scolastiche.

### Skill da usare
| Skill | Perché |
|-------|--------|
| `/elab-arsenal:quality-gate` | Baseline + post |
| `/elab-arsenal:ricerca-strumenti` | recharts vs chart.js vs Nivo |
| `/elab-arsenal:estetica-visual` | Grafici coerenti con design system |
| `/elab-arsenal:usabilita-docente` | Grafici comprensibili per docente |
| `/elab-arsenal:principio-zero` | Report capibile in 30 secondi |
| `/elab-arsenal:marketing-posizionamento` | Report che vende a dirigente scolastico |

### Task principali
1. `npm install recharts` (o scelta alternativa)
2. **ReportTab**: line chart trend completamento, bar chart top esperimenti, pie chart moods
3. **PDF export**: @media print o html2pdf.js
4. **Report dirigente**: 1 pagina con KPI chiave (per il dirigente scolastico che decide l'acquisto)
5. **Print layout**: nascondere navbar, margini, font print-friendly

### Deliverable
- 3 grafici interattivi nella dashboard
- PDF scaricabile 1-click
- Layout stampa pulito
- Score dashboard: 9/10 → 9.5/10

---

## G36 — UNLIM Voice + Session Memory
**File**: `docs/prompts/G36-unlim-voice-memory.md` (da scrivere a fine G35)
**Priorità**: P1

### Obiettivo
Controllo vocale per UNLIM + memoria tra sessioni. Dalla visione di Andrea: "controllo VOCALE".

### Skill da usare
| Skill | Perché |
|-------|--------|
| `/elab-arsenal:quality-gate` | Baseline + post |
| `/elab-arsenal:unlim-innovazione` | Roadmap feature vocali |
| `/elab-arsenal:unlim-architettura` | Integrare voice nel request chain |
| `/elab-arsenal:unlim-pedagogia` | Voice deve essere pedagogica, non tech |
| `/elab-arsenal:ricerca-tech-frontier` | Web Speech API, Whisper WASM |
| `/elab-arsenal:usabilita-studente` | Un bambino di 8 anni usa la voce? |
| `/elab-arsenal:principio-zero` | Vocale deve funzionare senza istruzioni |
| `/elab-arsenal:allineamento-spec` | Verifica allineamento con audio Andrea |

### Task principali
1. **STT**: Web Speech API (Chrome) con fallback testuale
2. **TTS**: Web Speech Synthesis per risposte UNLIM (voce italiana, tono giovane)
3. **Session memory**: PocketBase salva contesto sessioni passate per userId
4. **Adaptive UNLIM**: se lo studente ha sbagliato anodo/catodo ieri, oggi ricorda e corregge
5. **UI voice**: bottone microfono nell'input bar, indicatore "ascoltando..."

### Deliverable
- UNLIM risponde a voce
- Studente parla e UNLIM capisce
- Memoria cross-sessione (sa cosa hai fatto ieri)
- Score UNLIM: 7/10 → 8.5/10

---

## G37 — Landing Page MePA + Onboarding Docente
**File**: `docs/prompts/G37-landing-mepa.md` (da scrivere a fine G36)
**Priorità**: P0

### Obiettivo
Landing page che converte dirigenti scolastici. Onboarding docente in 3 click.

### Skill da usare
| Skill | Perché |
|-------|--------|
| `/elab-arsenal:quality-gate` | Baseline + post |
| `/elab-arsenal:marketing-posizionamento` | UVP, messaging per PA |
| `/elab-arsenal:marketing-competitor` | Tabella comparativa competitor |
| `/elab-arsenal:principio-zero` | Dirigente capisce in 30 secondi |
| `/elab-arsenal:usabilita-docente` | Onboarding 3 click |
| `/elab-arsenal:legale-contratti` | Info MePA, pricing, SLA |
| `/elab-arsenal:deep-web-research` | Best practice landing page EdTech |
| `/elab-arsenal:estetica-visual` | Design system coerente |
| Canva MCP | Design asset per landing |

### Task principali
1. **Landing `/scuole`**: hero + video demo + 3 benefit + tabella competitor + CTA MePA + testimonial
2. **Onboarding docente**: primo accesso → scegli volume → prima lezione pronta in 3 click
3. **SEO**: meta tag, Open Graph, sitemap
4. **Analytics**: PostHog per tracking conversioni
5. **CTA**: "Richiedi Demo Live" con form contatto → webhook

### Deliverable
- Landing page live su `/scuole`
- Onboarding docente < 3 click
- Tabella competitor visibile
- Form contatto funzionante

---

## G38 — Polish + Stress Test Finale
**File**: `docs/prompts/G38-polish-stress-test.md` (da scrivere a fine G37)
**Priorità**: P1

### Skill da usare
| Skill | Perché |
|-------|--------|
| `/elab-arsenal:quality-gate` | Baseline + post |
| `/elab-arsenal:avversario-stress` | 100 componenti, 50 fili, 500 righe codice |
| `/elab-arsenal:avversario-red-team` | Penetration test finale |
| `/elab-arsenal:estetica-visual` | Audit design consistenza totale |
| `/elab-arsenal:estetica-motion` | Animazioni fluide 60fps |
| `/elab-arsenal:test-e2e-integrazione` | Tutti i test passano |
| `/elab-arsenal:test-simulatore` | 62 esperimenti tutti funzionanti |
| `/elab-arsenal:allineamento-spec` | Audio Andrea verificato punto per punto |

### Task principali
1. **Stress test**: canvas con 100+ componenti, performance profiling
2. **Red team finale**: ogni endpoint, ogni input, ogni edge case
3. **CSS audit**: consistenza totale design system
4. **Animazioni**: tutte a 60fps, prefers-reduced-motion rispettato
5. **Accessibility**: WCAG AA completo, screen reader test
6. **Fix tutti P1 residui**

---

## G39 — Pre-Release Audit Totale
**File**: `docs/prompts/G39-pre-release-audit.md` (da scrivere a fine G38)
**Priorità**: P0

### Skill da usare
| Skill | Perché |
|-------|--------|
| `/elab-arsenal:orchestratore-supremo` | **AUDIT TOTALE** — comanda tutte le skill |
| `/elab-arsenal:quality-gate` | 10 check finali |
| `/elab-arsenal:principio-zero` | Verifica principio fondamentale |
| `/elab-arsenal:parita-kit-volumi` | 62 esperimenti = kit fisici |
| `/elab-arsenal:legale-gdpr` | GDPR checklist completa |
| `/elab-arsenal:legale-contratti` | Documenti PA pronti |
| `/elab-arsenal:allineamento-spec` | 9 requisiti Andrea tutti verificati |
| `/elab-arsenal:automa-guardia` | Nessuna regressione |

### Task principali
1. **Orchestratore Supremo**: lancia 5 agenti paralleli (simulatore, UNLIM, dashboard, GDPR, UX)
2. **Checklist pre-release**: 50 punti (funzionalità, performance, sicurezza, legal, UX)
3. **Report per Giovanni**: documento di 2 pagine per il team commerciale
4. **Bug triage finale**: ogni bug residuo classificato come ship/no-ship
5. **Score card finale**: obiettivo ≥ 9.0/10

---

## G40 — Release Candidate + Deploy Produzione
**File**: `docs/prompts/G40-release-candidate.md` (da scrivere a fine G39)
**Priorità**: P0

### Skill da usare
| Skill | Perché |
|-------|--------|
| `/elab-arsenal:quality-gate` | Gate finale PASS obbligatorio |
| `/elab-arsenal:orchestratore-supremo` | Coordinamento deploy |
| `/elab-arsenal:session-manager` | Handoff Sprint F → Sprint G |
| `/elab-arsenal:automa-guardia` | Protezione regressioni |
| Vercel MCP | Deploy produzione |
| Sentry MCP | Error monitoring setup |
| PostHog MCP | Analytics setup |

### Task principali
1. **Freeze**: nessuna feature nuova, solo bug fix
2. **Tag release**: `git tag v1.0.0-rc1`
3. **Deploy produzione**: Vercel custom domain `elabtutor.school`
4. **Monitoring**: Sentry per errori, PostHog per analytics
5. **Smoke test produzione**: 5 journey E2E su URL live
6. **Comunicazione team**: email a Giovanni, Davide, Omaric con URL + istruzioni

---

## TIMELINE

```
Aprile 2026
 1-4 apr   G31  Backend Server MVP (PocketBase + Render EU)
 7-11 apr  G32  GDPR Encryption + Auth Server-Side
14-18 apr  G33  Test E2E Playwright (5 flow)
21-25 apr  G34  Compilatore WASM Locale

Maggio 2026
 1-5 mag   G35  Report PDF + Grafici
 8-12 mag  G36  UNLIM Voice + Memory
15-19 mag  G37  Landing MePA + Onboarding
22-26 mag  G38  Polish + Stress Test

Giugno 2026
 2-6 giu   G39  Pre-Release Audit
 9-13 giu  G40  Release Candidate + Deploy
16-30 giu  BUFFER — solo bug fix per deadline PNRR
```

---

## SCORE PROGRESSION TARGET

| Sessione | Area Focus | Score Atteso |
|----------|-----------|--------------|
| G30 (oggi) | Audit | 8.0/10 |
| G31 | Backend | 8.6/10 |
| G32 | GDPR | 8.8/10 |
| G33 | Test E2E | 9.0/10 |
| G34 | WASM | 9.1/10 |
| G35 | Report | 9.2/10 |
| G36 | Voice | 9.3/10 |
| G37 | Landing | 9.4/10 |
| G38 | Polish | 9.5/10 |
| G39 | Audit | 9.6/10 |
| **G40** | **Release** | **≥ 9.5/10** |

---

## REGOLE INVARIANTI (TUTTE LE SESSIONI)

1. **ZERO DEMO, ZERO MOCK, ZERO DATI FINTI** — imperativo assoluto
2. **62 lesson paths INTOCCABILI** (38+18+6) — se cambia è regressione
3. **Non toccare engine/** — CircuitSolver, AVRBridge, avrWorker sono stabili
4. **npm run build + npx vitest run** dopo OGNI modifica
5. **Principio Zero** sovrascrive ogni altra considerazione
6. **Budget ≤ €50/mese** per infrastruttura (Claude escluso)
7. **Handoff** scritto a fine OGNI sessione in `automa/handoff.md`
8. **Prompt successivo** riscritto a fine OGNI sessione basandosi su risultati reali
9. **Quality Gate** pre e post OGNI sessione — non opzionale
10. **Massima onestà** — se qualcosa non funziona, scriverlo. Mai gonfiare score.
