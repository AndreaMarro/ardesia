# ELAB UNLIM — Piano Operativo G21-G30
## Volume Sections + Roadmap Completa Post-Audit Brutale

> **Principio Zero:** L'insegnante arriva alla lavagna e spiega PER MAGIA.
> **UNLIM è un AGENTE. ELAB Tutor è la piattaforma. Mai regressioni.**
> **Data:** 29 marzo 2026 | **Deadline PNRR:** 30 giugno 2026 (3 mesi)

---

## STATO VERIFICATO (audit G20 — 3 agenti indipendenti)

| Area | Score | Finding chiave |
|------|-------|----------------|
| Pedagogia/Lesson Paths | 9/10 | 62/67, scaffolding, misconcezioni — eccellente |
| Progressive Disclosure | 9/10 | Vol-based, verificato E2E |
| Stabilità | 9/10 | 911/911 test, 0 regressioni in 20 sessioni |
| Competitivo | 9/10 | Vince 9/9 vs Tinkercad/Wokwi |
| Session tracking | 8/10 | Two-tier, dedup, FIFO 20 |
| Fallback chain AI | 7/10 | 5 livelli, ma timeout 120s |
| Simulatore DC | 7/10 | Funziona serie, 3 bug paralleli |
| Estetica | 7/10 | Palette ELAB, mascotte, Oswald |
| Frontend/CSS LIM | 5/10 | Responsive esiste ma inline lo sovrascrive |
| Canvas/SVG | 4/10 | 3140 LOC god, 6px touch, 7px font |
| UNLIM interazione | 3/10 | 419 parole, analisi auto, markdown raw |
| UNLIM affidabilità | 3/10 | Race condition, tag silenziosi, timeout 120s |
| GDPR | 1/10 | Zero documentazione |
| **COMPOSITO** | **6.2/10** | |

---

## FEATURE: SEZIONI VOLUME

### Design approvato (29/03/2026)

**Primo accesso:**
```
UNLIM: "Ciao! Quale volume usate oggi?"

[🔋 Volume 1]  [⚡ Volume 2]  [🤖 Volume 3]  [💡 Inventore]
 38 esperimenti   18 esperimenti   11 esperimenti   Tutti i pezzi
```

**Ritorno:**
```
UNLIM: "Bentornati! L'ultima volta: Volume 2, Cap 8 — Il Pulsante.
        Continuiamo?"

[▶ Continua]   [Cambia volume]
```

**Filtri per volume attivo:**
- Esperimenti: solo del volume attivo
- Componenti palette: cumulativi (Vol2 = Vol1 + Vol2)
- Progressive disclosure: Vol1/2 = livello 1, Vol3 = livello 2
- UNLIM contesto AI: "L'insegnante usa il Volume X"
- Inventore: tutti i componenti, disclosure level 2, nessun lesson path

**Infrastruttura esistente (70% pronta):**
- `volumeAvailableFrom` su tutti i 22 componenti SVG
- `ComponentPalette` con `volumeFilter` funzionante
- `ExperimentPicker` con `userKits` filtro
- `selectedVolume` stato in ElabTutorV4
- `registry.js` con filtro per volume number

**Da implementare:**
1. Stato `activeVolume` come prop primaria (non derivata)
2. Volume chooser UNLIM-style (sostituisce welcome modal)
3. Ritorno con "Bentornati + Continua"
4. Barra superiore con "Volume X — N esperimenti [Cambia]"
5. Filtro ExperimentPicker per volume numerico
6. Contesto AI con volume attivo
7. Modalità Inventore (breadboard vuota, tutto sbloccato)

---

## ROADMAP 10 SESSIONI (G21-G30)

### Priorità derivate dall'audit (ROI decrescente):

| Sprint | Sessioni | Focus | Ore stimate |
|--------|----------|-------|-------------|
| **Sprint A** | G21-G22 | UNLIM fix critici + Volume Sections | ~20h |
| **Sprint B** | G23-G24 | LIM-ready (touch, font, CSS) | ~16h |
| **Sprint C** | G25-G26 | AI reliability + timeout + action parsing | ~14h |
| **Sprint D** | G27-G28 | GDPR + Teacher Dashboard | ~20h |
| **Sprint E** | G29-G30 | Stabilità, test docente reale, deploy | ~16h |

---

## SESSIONI DETTAGLIATE

### G21 — UNLIM FIX CRITICI
**Obiettivo:** UNLIM passa da 3/10 a 7/10

**Task:**
1. Prompt nanobot: max 60 parole, 3 frasi + 1 analogia (2h)
2. Click mascotte = apri input bar, non analisi auto (4h)
3. Renderizzare markdown nelle risposte (2h)
4. Iniettare vocabolario forbidden nel prompt AI (4h)

**Verifica 8 strati CoV:**
1. Build & Test Gate
2. Browser: click mascotte → input bar (non analisi)
3. Browser: risposta UNLIM < 60 parole (contare)
4. Browser: markdown renderizzato (no `**` visibili)
5. Browser: chiedere "cos'è una resistenza?" a Cap 6 → UNLIM non usa la parola
6. Code audit: grep forbidden terms non presenti in risposte
7. LIM 1024x768: risposta leggibile a 3 metri
8. Prof.ssa Rossi: clicca UNLIM, capisce cosa fare?

**5 Quality Audit Gate:**
- #1: Post-fix (UNLIM <60 parole verificato)
- #2: Vocabolario (3 test forbidden terms)
- #3: Markdown (0 raw `**` visibili)
- #4: Pre-deploy (build + test)
- #5: Post-deploy (sito live)

---

### G22 — VOLUME SECTIONS
**Obiettivo:** Implementare sezioni volume con chooser UNLIM

**Task:**
1. Sostituire welcome modal con volume chooser (4h)
2. Stato `activeVolume` + filtro esperimenti + palette (2h)
3. Ritorno "Bentornati + Continua" con lastVolume da sessione (2h)
4. Barra superiore "Volume X [Cambia]" (1h)
5. Modalità Inventore (breadboard vuota, tutto sbloccato) (2h)
6. Contesto AI con volume attivo nel prompt (0.5h)

**Verifica 8 strati CoV:**
1. Build & Test Gate
2. Browser: primo accesso → 4 scatole volume (non welcome modal)
3. Browser: tocca Vol 2 → solo 18 esperimenti visibili
4. Browser: palette → solo componenti Vol 1+2 (no Arduino)
5. Browser: ritorno → "Bentornati, Volume 2, Continuiamo?"
6. Browser: Inventore → tutti i componenti, breadboard vuota
7. LIM 1024x768: scatole volume grandi, toccabili
8. Prof.ssa Rossi: 1 click per entrare nel volume giusto?

---

### G23 — LIM TOUCH + FONT
**Obiettivo:** Canvas/SVG passa da 4/10 a 7/10

**Task:**
1. PIN_HIT_TOLERANCE 6px → 16px (1h)
2. Font SVG minimo 14px (tutti i testi in canvas) (4h)
3. Touch targets bottoni 28px → 44px in ChatOverlay (2h)
4. Fix contrasto ConsentBanner WCAG AA (0.5h)
5. Fix DEV mock user (gate con import.meta.env.DEV) (1h)
6. Fix console [object Object] in StudentTracker (0.5h)

**Verifica 8 strati CoV:**
1. Build & Test
2. Browser: toccare un pin con dito (simula touch 20px area)
3. Browser: tutti i testi SVG ≥ 14px (inspect)
4. Browser: tutti i bottoni ≥ 44px (inspect)
5. Browser: ConsentBanner contrasto ≥ 4.5:1
6. Console: 0 [object Object], 0 DEV warnings in prod
7. LIM 1024x768: pin toccabili, testo leggibile
8. Prof.ssa Rossi: riesce a toccare un componente al primo tentativo?

---

### G24 — CSS RESPONSIVE REALE
**Obiettivo:** Frontend/CSS passa da 5/10 a 7/10

**Task:**
1. Migrare inline styles ChatOverlay → CSS classes (4h)
2. Migrare inline styles ConsentBanner → CSS classes (2h)
3. Migrare inline styles ReflectionPrompt → CSS classes (2h)
4. Verificare media query LIM funzionanti (2h)
5. Focus-visible states su tutti i bottoni (1h)

**Verifica:**
- Browser pointer:coarse: font ≥ 18px, touch ≥ 48px
- Nessun inline style con fontSize/width/height hardcoded nei 3 file
- Tab order funzionante su tutti gli elementi interattivi

---

### G25 — AI RELIABILITY
**Obiettivo:** UNLIM affidabilità passa da 3/10 a 7/10

**Task:**
1. AbortController con 10s timeout in sendChat() (2h)
2. PlacementEngine: placement sequenziale (await in serie) (3h)
3. Log + display action tag parse errors (user-facing message) (2h)
4. Rimuovere Ralph Loop dead code (0.5h)
5. Show "risposta lenta, controllo locale..." a 5s (1h)

**Verifica 8 strati CoV:**
1. Build & Test
2. Browser: simulare nanobot lento → fallback entro 10s (non 120s)
3. Browser: 2 azioni nella stessa risposta → placement sequenziale
4. Browser: azione malformata → messaggio visibile all'utente
5. Code audit: 0 Ralph Loop, AbortController presente
6. Code audit: nessun `await` parallelo in processAiResponse
7. Console: 0 errori silenziosi su azioni droppate
8. Prof.ssa Rossi: se UNLIM è lento, vede un messaggio (non schermo bianco)

---

### G26 — AI QUALITY + PROACTIVE
**Obiettivo:** UNLIM preparazione lezione funzionale

**Task:**
1. UNLIM proattivo: "Oggi facciamo..." da teacher_briefing del lesson path (3h)
2. Contesto classe completo nel prompt (sessioni passate, errori, concetti) (2h)
3. Dedup proactive events atomico (event ID dal simulatore) (2h)
4. TTS voice loading: wait-for-readiness (non 50ms hardcoded) (1h)
5. Risposte proattive brevi: max 2 frasi (1h)

---

### G27 — GDPR + COMPLIANCE
**Obiettivo:** GDPR passa da 1/10 a 6/10

**Task:**
1. DPIA (Data Protection Impact Assessment) draft (4h)
2. Valutazione Mistral EU come provider AI GDPR-compliant (2h)
3. Documentare tutti i flussi dati (localStorage, nanobot, n8n) (2h)
4. Consenso minori: Art. 8 GDPR workflow (2h)
5. Privacy policy aggiornata con tutti i provider (2h)

---

### G28 — TEACHER DASHBOARD
**Obiettivo:** Dashboard docente connessa ai lesson paths

**Task:**
1. Vista progressi classe per esperimento (completato/parziale/non fatto) (6h)
2. Integrazione con session data (unlimMemory + sessionTracker) (4h)
3. Report classe: quali esperimenti fatti, errori comuni, tempo medio (4h)
4. Export CSV per il dirigente scolastico (2h)

---

### G29 — STABILITÀ + POLISH
**Obiettivo:** Score composito ≥ 8/10

**Task:**
1. Fix 3 bug CircuitSolver (potentiometro, condensatore, paralleli) (8h)
2. Session sync immediato su cambio esperimento (1h)
3. Scroll lock chat + badge "nuovo messaggio" (2h)
4. Rate limiting feedback visivo (1h)
5. Quality audit completo con tutti gli strumenti (2h)

---

### G30 — TEST REALE + DEPLOY FINALE
**Obiettivo:** Prodotto testato con docente reale

**Task:**
1. Preparare sessione test con docente (Andrea contatta insegnante) (1h)
2. Screen recording del test (15 minuti) (0.5h)
3. Analizzare video: dove si blocca? cosa non capisce? (2h)
4. Fix critici emersi dal test (4h)
5. Deploy finale pre-PNRR (1h)
6. Report finale onesto: cosa funziona, cosa no, cosa serve ancora (2h)

---

## METRICHE DI SUCCESSO PER SPRINT

| Sprint | Metrica | Target |
|--------|---------|--------|
| A (G21-22) | UNLIM word count | <60 per risposta |
| A (G21-22) | Volume chooser funzionante | 4 opzioni, 1 click |
| B (G23-24) | Touch targets | 100% ≥ 44px |
| B (G23-24) | Font sizes | 100% ≥ 14px |
| C (G25-26) | AI timeout | <10s |
| C (G25-26) | Action tag success rate | >95% |
| D (G27-28) | GDPR DPIA | Documento completo |
| D (G27-28) | Teacher Dashboard | Progressi visibili |
| E (G29-30) | Test docente reale | 15 min registrati |
| E (G29-30) | Score composito | ≥ 8/10 |

---

## VINCOLI INVIOLABILI (tutti i prompt)

1. `npm run build` deve passare dopo OGNI modifica
2. `npx vitest run` 911/911 (o più) PASS
3. Nessun file `engine/` toccato (CircuitSolver, AVRBridge, avrWorker)
4. ZERO DEMO, ZERO DATI FINTI — tutto con dati reali
5. Linguaggio 10-14 anni in ogni testo visibile
6. UNLIM è un AGENTE, ELAB Tutor è la piattaforma
7. ELAB Tutor + kit + volumi = UN UNICO PRODOTTO
8. Mai regressioni — IMPERATIVO

---

## TEST DI VERITÀ (ogni sessione)

1. La Prof.ssa Rossi (52 anni, zero esperienza) capisce in 5 secondi?
2. Un ragazzo di 12 anni dalla LIM capisce cosa succede?
3. Il prodotto dice "ecco cosa fai adesso"?
4. UNLIM sta preparando la lezione o solo rispondendo?
5. Il percorso guidato è il CENTRO?
6. Codice/blocchi visibili solo quando servono?
7. Il prodotto sembra ELAB (kit, volumi) o software generico?
