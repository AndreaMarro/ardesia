# PROMPT SESSIONE 37 — ELAB Tutor "Galileo" — RALPH LOOP TOTALE
**Data**: 22/02/2026
**Score REALE onesto**: ~6.8/10 → Target: 9.0/10
**Metodo**: RALPH LOOP + 5 agenti paralleli + verifica Claude in Chrome obbligatoria
**Regola #1**: NON DICHIARARE MAI "FATTO" SENZA SCREENSHOT DI PROVA

---

## FASE 0 — LETTURA OBBLIGATORIA (FAI QUESTO PRIMA DI TUTTO)

```
1. Leggi MEMORY.md:
   /Users/andreamarro/.claude/projects/-Users-andreamarro-VOLUME-3/memory/MEMORY.md

2. Leggi PRD completo:
   /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/PRD-ELAB-TUTOR-v1.md

3. Leggi questo prompt intero (non saltare sezioni)

4. Fai build check:
   cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build
   # DEVE dare 0 errori. Se errori → fix subito.

5. Invoca la skill `volume-replication` per avere le procedure di confronto PDF

6. NON iniziare nessun lavoro finché non hai completato i punti 1-5
```

---

## MATERIALE DI RIFERIMENTO — DOVE TROVARE TUTTO

### Codice sorgente
```
/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/          ← Progetto Tutor (React/Vite)
/Users/andreamarro/VOLUME 3/PRODOTTO/newcartella/            ← Sito pubblico (HTML)
```

### File critici del simulatore
```
src/components/simulator/NewElabSimulator.jsx                ← Cuore simulatore (~2500 righe)
src/components/simulator/components/                         ← 21 SVG components
src/components/simulator/engine/CircuitSolver.js             ← Physics engine (2060 righe)
src/data/experiments-vol1.js                                 ← 38 esperimenti Vol1
src/data/experiments-vol2.js                                 ← 18 esperimenti Vol2
src/data/experiments-vol3.js                                 ← 13 esperimenti Vol3
src/services/authService.js                                  ← Auth (sessionStorage)
src/services/studentService.js                               ← ⚠️ BUG P0: usa localStorage
src/context/AuthContext.jsx                                  ← Auth provider
src/components/teacher/TeacherDashboard.jsx                  ← Dashboard docente
src/components/tutor/ChatOverlay.jsx                         ← AI Galileo chat
```

### PDF dei volumi (FONTE DI VERITÀ ASSOLUTA)
```
/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/VOL1_ITA_ COMPLETO V.0.1 GP.pdf
/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/VOL2_ITA_COMPLETO GP V 0.1.pdf
/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/Manuale VOLUME 3 V0.8.1.pdf
```

### Screenshot Tinkercad (RIFERIMENTO ESTETICO)
```
/Users/andreamarro/VOLUME 3/CONTENUTI/foto-volumi/foto-extra/TINKERCAD volume 1/   ← 75 JPG
/Users/andreamarro/VOLUME 3/CONTENUTI/foto-volumi/foto-extra/tinkercad/             ← 27+17 JPG
```

### Immagini estratte dai PDF (confronto rapido)
```
/Users/andreamarro/VOLUME 3/CONTENUTI/immagini_estratte/volume1/   ← 213 immagini
/Users/andreamarro/VOLUME 3/CONTENUTI/immagini_estratte/volume2/   ← 198 immagini
/Users/andreamarro/VOLUME 3/CONTENUTI/immagini_estratte/volume3/   ← 51 immagini
```

### Skills personalizzate (USALE)
```
Skill: volume-replication    ← Confronto PDF vs simulatore (procedura, checklist, fonti)
Skill: quality-audit         ← Audit qualità E2E (font, touch, bundle, WCAG)
Skill: tinkercad-simulator   ← Parità funzionale con Tinkercad
Skill: arduino-simulator     ← Compilatore Arduino e simulatore AVR
Skill: nano-breakout         ← Specifiche NanoBreakout V1.1 GP
```

### Account di test
```
Admin:    debug@test.com          / Xk9#mL2!nR4
Teacher:  teacher@elab.test       / Pw8&jF3@hT6!cZ1
Student:  student@elab.test       / Ry5!kN7#dM2$wL9
Licenze:  ELAB-VOL1-2026, ELAB-VOL2-2026, ELAB-VOL3-2026, ELAB-BUNDLE-ALL
```

### Deploy
```bash
cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build && npx vercel --prod --yes
```

---

## STATO ONESTO DEL PROGETTO — 22/02/2026

### Cosa FUNZIONA
- 69 esperimenti caricano senza crash
- 21 SVG componenti riscritti in stile Fritzing 3D (sessioni 35-36)
- 138 quiz (2 per esperimento)
- Auth bcrypt+HMAC funzionante
- 53 sfide giochi
- Build 0 errori
- Deploy su Vercel attivo

### Cosa NON FUNZIONA o NON È MAI STATO TESTATO
| Problema | Gravità | Dettaglio |
|----------|---------|-----------|
| SVG post-redesign MAI verificati nel browser | 🔴 P0 | 21 componenti riscritti, 0 testati visivamente |
| SVG MAI confrontati col PDF | 🔴 P0 | Disegnati "a memoria", non side-by-side col libro |
| Teacher-Student data rotto | 🔴 P0 | `studentService.js` usa localStorage → cross-browser impossibile |
| 3 modalità esperimento | 🔴 P0 | buildMode nel codice, 0/69 lo usano → score 2/10 |
| auth-list-classes 503 | 🟡 P1 | Notion CLASSES DB non esiste |
| AI Galileo senza contesto | 🟡 P1 | Non sa quale esperimento guardi |
| Whiteboard V3 mai testata | 🟡 P1 | Codice scritto, mai aperto nel browser |
| Responsive mai auditato | 🟡 P1 | 0 test su mobile 375px |
| Volume gating mai testato E2E | 🟡 P1 | Mai provato con account studente reale |
| Sprint 0 sessione 33 mai eseguito | 🔴 | Le sessioni 34-36 l'hanno saltato |

### Score Card ONESTA
| Area | Score | Nota |
|------|-------|------|
| Auth + Security | 8.5 | -1.5: email non testata, classes 503 |
| Simulatore rendering | **7.5** | ⚠️ Non 9.5. Zero verifica post-redesign |
| Simulatore physics | 7.0 | No capacitor dinamico, no transienti |
| Quiz | 8.0 | 138 domande, UI mai testata da utente |
| Teacher Dashboard | **4.0** | localStorage = rotto |
| 3 Experiment Modes | **2.0** | NON IMPLEMENTATO |
| Teacher-Student | **2.0** | localStorage = non funziona |
| Frontend/UX | 7.0 | Responsive non auditato |
| Whiteboard V3 | 5.0 | Mai testata |
| **OVERALL** | **~6.8** | |

---

## MISSIONE DELLA SESSIONE 37 — DUE FASI SEQUENZIALI

### ══════════════════════════════════════════════
### FASE A: GRAFICA SIMULATORE (5 agenti paralleli)
### ══════════════════════════════════════════════

**Obiettivo**: Ogni componente SVG e ogni esperimento nel simulatore DEVE essere IDENTICO alle illustrazioni dei volumi PDF. Verificato con screenshot.

**Skill da invocare**: `volume-replication` — contiene procedure, checklist, fonti di riferimento.

#### 5 AGENTI SPECIALIZZATI

**AGENTE 1 — PDF Reader**
- Apre i 3 PDF dei volumi
- Per ogni capitolo, identifica le illustrazioni Fritzing dei circuiti
- Estrae: forma componenti, colori, proporzioni, posizioni sulla breadboard
- Output: tabella di riferimento per ogni componente e ogni esperimento

**AGENTE 2 — SVG Analyst**
- Legge tutti i 21 file SVG in `src/components/simulator/components/`
- Analizza: gradienti, colori, forme, proporzioni, stile
- Confronta con output dell'Agente 1
- Output: lista discrepanze `{componente, problema, PDF dice X, codice dice Y}`

**AGENTE 3 — SVG Fixer**
- Prende la lista discrepanze dall'Agente 2
- Per ogni discrepanza: riscrive l'SVG per matchare il PDF
- REGOLA: pin positions IMMUTABILI
- REGOLA: dopo ogni fix → `npm run build` → 0 errori
- Output: componenti SVG corretti

**AGENTE 4 — Experiment Verifier**
- Per ogni esperimento (69 totali):
  - Confronta `connections` e `buildSteps` con il PDF
  - Verifica colori fili, posizioni componenti, routing
  - Se discrepanza → corregge in `experiments-volX.js`
- Output: esperimenti allineati al libro

**AGENTE 5 — Chrome Tester (BLOCCANTE)**
- Dopo ogni batch di fix:
  - Deploy su Vercel
  - Apre https://elab-builder.vercel.app con Claude in Chrome
  - Login: `debug@test.com` / `Xk9#mL2!nR4`
  - Carica ogni esperimento modificato
  - Screenshot di confronto
  - Se non matcha → torna all'Agente 3 per fix
- LOOP finché TUTTI i 69 esperimenti matchano il PDF con screenshot

#### RALPH LOOP FASE A
```
PLAN   → Agente 1+2 analizzano PDF e SVG
BUILD  → Agente 3+4 fixano discrepanze
VERIFY → Agente 5 testa in Chrome con screenshot
FIX    → Se discrepanze → torna a BUILD
VERIFY → Agente 5 ri-testa
DEPLOY → Solo quando TUTTI i 69 passano
```

#### CRITERI DI COMPLETAMENTO FASE A
- [ ] Tutti 21 SVG matchano le illustrazioni PDF (screenshot di prova)
- [ ] Tutti 69 esperimenti hanno layout corretto (posizioni = libro)
- [ ] Tutti 69 caricano senza crash nel browser (screenshot)
- [ ] Build 0 errori
- [ ] Deploy su Vercel completato

**NON PASSARE ALLA FASE B finché TUTTI i criteri della Fase A non sono soddisfatti.**

---

### ══════════════════════════════════════════════
### FASE B: COMPLETAMENTO PRD (5 agenti paralleli)
### ══════════════════════════════════════════════

**Obiettivo**: Implementare TUTTO ciò che il PRD richiede e non è ancora stato fatto. Portare il progetto da 6.8/10 a 9.0/10.

**Skills da invocare**: `quality-audit` per verifica finale, `tinkercad-simulator` per feature parity.

#### 5 AGENTI SPECIALIZZATI

**AGENTE 6 — Backend Developer**
Task:
1. **Teacher-Student data server-side**: riscrivere `studentService.js` da localStorage a Netlify Functions + Notion DB
2. **auth-list-classes fix**: creare Notion DB CLASSES, configurare env vars
3. **auth-create-class**: endpoint funzionante
4. **Student data sync**: endpoint per salvare/leggere progresso studente
Verifica: login teacher → vede dati studente → screenshot

**AGENTE 7 — Frontend/UX Developer**
Task:
1. **3 modalità esperimento**: implementare Già Montato / Passo Passo / Libero
   - Selettore in NewElabSimulator.jsx (~riga 2397)
   - buildSteps esistono già in tutti 69 esperimenti
2. **AI Galileo context**: includere experimentId, volume, buildMode nel payload chat
3. **Responsive audit**: testare OGNI pagina a 1440/768/375px
Verifica: ogni feature testata con Chrome → screenshot

**AGENTE 8 — Whiteboard & Polish**
Task:
1. **Whiteboard V3**: aprire nel browser, testare tutte le funzioni, fixare bug
2. **Vetrina redesign**: Apple-quality, responsive
3. **Chat overlay mobile**: verificare max-height 60vh
4. **Student cards**: UUID → nome nel teacher dashboard
Verifica: ogni fix con screenshot prima/dopo

**AGENTE 9 — Quality Assurance**
Task:
1. **Volume gating E2E**: login studente → attiva licenza → verifica visibilità volumi
2. **Quiz E2E**: completare esperimento → rispondere quiz → feedback corretto
3. **Games E2E**: verificare che i 53 giochi funzionino
4. **Font audit**: 0 font < 14px
5. **Touch target audit**: 0 elementi < 44px
6. **Console.log audit**: 0 in produzione
Invocare skill: `quality-audit full`
Verifica: report con score card quantitativa

**AGENTE 10 — Chrome Tester & Deployer (BLOCCANTE)**
Task:
1. Dopo ogni batch di fix degli agenti 6-9:
   - Build + deploy Vercel
   - Test E2E in Chrome con screenshot:
     - Login admin/teacher/student
     - Simulatore: carica esperimento, 3 modalità
     - Teacher dashboard: vede dati studente
     - Quiz: funziona
     - Responsive: 1440/768/375
   - Se bug → torna all'agente responsabile
2. LOOP finché 0 bug

#### RALPH LOOP FASE B
```
PLAN   → Agenti 6-9 analizzano task
BUILD  → Agenti 6-9 implementano in parallelo
VERIFY → Agente 10 testa TUTTO in Chrome
FIX    → Se bug → agente responsabile fixa
VERIFY → Agente 10 ri-testa
DEPLOY → Solo quando 0 bug
```

#### CRITERI DI COMPLETAMENTO FASE B
- [ ] Teacher vede dati studente nel browser (screenshot)
- [ ] 3 modalità funzionanti per almeno 20 esperimenti (screenshot)
- [ ] Galileo sa quale esperimento guardi (screenshot)
- [ ] Whiteboard V3 funziona nel browser (screenshot)
- [ ] Responsive OK su 1440/768/375 per OGNI pagina (screenshot)
- [ ] Volume gating testato E2E (screenshot)
- [ ] Quiz E2E funzionante (screenshot)
- [ ] Quality audit: 0 font < 14px, 0 touch < 44px, 0 console.log
- [ ] Build 0 errori
- [ ] Deploy Vercel completato

---

## REGOLE IMMUTABILI (DA RISPETTARE SEMPRE)

### Regole di verifica
1. **RALPH LOOP per OGNI task**: plan → build → verify Chrome → fix → verify → deploy
2. **SCREENSHOT O NON È MAI SUCCESSO**: ogni fix DEVE avere screenshot
3. **NO SCORE INFLAZIONATI**: se non testato nel browser → NON dire "funziona"
4. **Chain of Verification**: apri il PDF, leggi, confronta. Non fidarti della memoria

### Regole tecniche
5. **Pin positions IMMUTABILI**: mai modificare senza verificare 0/69 rotti
6. **NanoBreakout**: semicerchio LEFT, ala RIGHT, SULLA breadboard
7. **buildSteps posizione FINALE**: ogni step piazza nella posizione del libro
8. **Bus naming**: `bus-bot-plus/minus` (NON `bus-bottom-plus/minus`)
9. **Auth**: sessionStorage key `elab_auth_token`
10. **Build = 0 errori**: sempre, dopo ogni modifica

### Regole estetiche
11. **ESTETICA = VOLUMI**: SVG identici alle illustrazioni Fritzing dei PDF
12. **PALETTE**: Navy #1E4D8C / Lime #7CB342 / Vol1 #7CB342 / Vol2 #E8941C / Vol3 #E54B3D
13. **FONT**: Oswald (titoli) + Open Sans (corpo) + Fira Code (codice). fontSize >= 14px
14. **TOUCH TARGETS**: >= 44px su mobile
15. **Watermark**: `Andrea Marro — DD/MM/YYYY`
16. **Force-light theme**: `data-theme="light"`
17. **0 console.log in produzione**: solo `logger.js` con guard `isDev`

### Regole di processo
18. **NON passare alla Fase B finché Fase A non è 100% completa**
19. **NON dichiarare "PASS" senza screenshot**
20. **Se un agente trova un problema, si ferma e aspetta il fix prima di continuare**
21. **Ogni DEPLOY deve essere seguito da test Chrome sulla versione LIVE**
22. **ANDARE AVANTI FINO A CHE IL COMPITO NON È COMPLETO. Non fermarsi, non chiedere, non delegare all'utente.**

---

## OUTPUT ATTESO FINE SESSIONE

### Deliverables
1. **Report Fase A**: lista 21 componenti con screenshot confronto PDF, 69 esperimenti verificati
2. **Report Fase B**: features implementate con screenshot, score card aggiornata
3. **Score Card finale**: target 9.0/10 overall
4. **MEMORY.md aggiornato** con stato reale post-sessione
5. **Deploy Vercel** live e verificato

### Score Target
| Area | Attuale | Target |
|------|---------|--------|
| Simulatore rendering | 7.5 | **9.5** (verificato con PDF) |
| Teacher Dashboard | 4.0 | **8.0** (server-side data) |
| 3 Experiment Modes | 2.0 | **7.0** (implementato) |
| Teacher-Student | 2.0 | **7.5** (server-side sync) |
| Frontend/UX | 7.0 | **8.5** (responsive auditato) |
| Whiteboard V3 | 5.0 | **7.0** (testata e fixata) |
| **OVERALL** | **6.8** | **~9.0** |

---

*Prompt scritto con MASSIMA ONESTÀ. I punteggi riflettono lo stato REALE verificato.*
*Nessun punteggio è stato gonfiato. Ogni "non testato" è segnalato come tale.*
*22/02/2026 — Andrea Marro / Claude*
