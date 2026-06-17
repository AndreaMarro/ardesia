# G11 MARATHON — "La Prof.ssa Rossi Entra in Classe"

**Data**: 28/03/2026 (prompt generato da G10)
**Durata**: Sessione lunga (equivalente 7-8 sessioni precedenti)
**Principio Zero**: L'insegnante arriva alla LIM e spiega IMMEDIATAMENTE senza conoscenze pregresse.
**REGOLA ASSOLUTA**: ZERO DEMO, ZERO DATI FINTI, ZERO MOCK. Tutto funziona DAVVERO con dati reali.
**Prodotto**: ELAB Tutor + Kit fisici + Volumi = UN UNICO PRODOTTO interdipendente. Linguaggio 10-14 anni.

---

## CONTESTO — Stato attuale post-G10

### Build
- **Build**: PASSA (22.80s, bundle index 1,593 KB)
- **Bundle totale**: 9.7 MB (3.5 MB gzip) — troppo per WiFi scolastico
- **PWA precache**: 16.4 MB (107 entries) — primo avvio 60+s su WiFi scuola
- **Deploy**: Non fatto (hook protegge). Da fare dopo fix.

### Score Composito: 7.6/10
- Simulatore funzionalita': 9.5 | Contenuti: 9.0 | LIM/iPad: 5.5 | Teacher Dashboard: 7.0
- WCAG/A11y: 7.0 | Code Quality: 6.5 | Performance: 7.0 | Business: 4.0

### Cosa funziona
- CircuitSolver KCL/MNA verificato 96% (2,400/2,486 LOC) — ROBUSTO
- 67 esperimenti tutti caricano (5/5 E2E browser test PASS)
- StudentTracker reale (localStorage, zero mock)
- Teacher Dashboard con dati reali (zero "Demo Mode")
- WCAG AA: Navy 8.48:1, Lime 5.12:1, Orange 4.52:1, Red 5.14:1 — tutti PASS su bianco
- Focus outline corretto (WCAG 2.4.7)
- ErrorBoundary su tutte le aree (6/6)
- borderColor DOM mutations: 24→8 (-67%)

### Cosa NON funziona (dal MEGA-AUDIT-G3-G10.md)
1. **ACCESSO BLOCCATO** — RequireAuth + RequireLicense → 4+ tap dal browser al primo LED
2. **Bundle 9.7 MB** — cold start 60+s su WiFi scuola
3. **Tutor non LIM-ready** — 52-68% WCAG vs 95%+ del simulatore
4. **6 alert() bloccanti** nel tutor — interrompono la lezione
5. **41 stringhe non localizzate** — inglese nel gestionale
6. **8 borderColor DOM mutations residue** (ExperimentPicker, DipendentiModule, BancheFinanzeModule)
7. **Giochi non tracciati** — CircuitDetective, PredictObserveExplain, ReverseEngineeringLab
8. **Galileo non testato live** con nanobot/n8n
9. **God components** — SimulatorCanvas 3,139 LOC, ElabTutorV4 2,562 LOC
10. **Export dati Teacher Dashboard** — manca per dirigente/PNRR

---

## FASI DI ESECUZIONE

### FASE 0: Bootstrap (10 min)
```
Leggi OBBLIGATORIAMENTE:
1. CLAUDE.md (regole immutabili, palette, stack)
2. automa/STATE.md (stato corrente)
3. automa/handoff.md (cosa fare)
4. automa/reports/MEGA-AUDIT-G3-G10.md (audit completo)
5. Questo prompt fino in fondo

Verifica:
- npm run build PASSA
- Il server dev parte (npm run dev)
```

### FASE 1: Accesso Zero-Friction (2-3 ore) ★ CRITICO
**Obiettivo**: La Prof.ssa apre elab-builder.vercel.app → in 2 tap vede un circuito LED REALE funzionante.

**ATTENZIONE**: NON creare una "demo mode" con dati finti. Creare una rotta `#prova` (o simile) che carica il simulatore VERO con esperimenti REALI del Volume 1, senza richiedere login. Il simulatore deve funzionare al 100%: circuiti, KCL, LED che si accendono, Passo Passo, tutto.

**Approccio tecnico**:
- In `App.jsx`, aggiungere una rotta `#prova` che carica `ElabTutorV4` SENZA `RequireAuth`/`RequireLicense`
- Limitare gli esperimenti visibili a 5-10 del Volume 1 (i piu' semplici)
- Il simulatore e' lo STESSO componente — zero duplicazione
- Mostrare un banner NON bloccante: "Stai usando la versione di prova. Per tutti i 67 esperimenti, attiva la licenza."
- Il banner deve essere discreto (non modal, non popup, non overlay che copre il simulatore)
- StudentTracker funziona anche senza login (usa device UUID)

**Plugin da usare**:
- `/frontend-design` per il banner non-bloccante
- `/writing-plans` per pianificare l'approccio prima di scrivere codice
- `/system-design` per l'architettura della rotta

**Checkpoint FASE 1**:
```
Scrivi: automa/reports/G11-FASE1-ACCESSO.md
Verifica nel browser (preview_start + preview_screenshot):
- [ ] Apro elab-builder.vercel.app/#prova → vedo il simulatore
- [ ] Carico v1-cap6-esp1 → LED si accende
- [ ] Passo Passo funziona
- [ ] Banner "versione di prova" visibile ma non bloccante
- [ ] StudentTracker registra l'attivita'
- [ ] Console: 0 errori nuovi
- [ ] Build PASSA
```

### FASE 2: Bundle Diet (2 ore)
**Obiettivo**: Ridurre il bundle da 9.7 MB a < 5 MB per cold start < 30s su WiFi scuola.

**Approccio**:
- `/ricerca-tecnica` per investigare strategie di code-splitting avanzato
- Lazy-load `react-pdf` (1,486 KB) SOLO quando l'utente clicca "Genera PDF"
- Lazy-load `mammoth` (500 KB) SOLO quando l'utente carica un DOCX
- Ridurre PWA precache da 107 entries a ~30 (solo critical path)
- Analizzare se `html2canvas` (201 KB) puo' essere sostituito con SVG serialization nativa (gia' usata per Export PNG)
- Verificare se `DashboardGestionale` (410 KB) puo' essere lazy-loaded piu' aggressivamente

**Plugin da usare**:
- `/ricerca-tecnica` per best practice code-splitting React 19
- Firecrawl per documentazione Vite chunk splitting
- `/quality-audit` per misurare before/after

**Checkpoint FASE 2**:
```
Scrivi: automa/reports/G11-FASE2-BUNDLE.md
Misura PRIMA e DOPO:
- [ ] Bundle totale JS: ___KB → ___KB (target: < 5,000 KB)
- [ ] Bundle gzip: ___KB → ___KB (target: < 2,000 KB)
- [ ] PWA precache: ___entries (___KB) → ___entries (___KB) (target: < 8 MB)
- [ ] Build time: ___s (target: < 25s)
- [ ] ZERO regressioni funzionali
```

### FASE 3: Tutor LIM-Ready (2-3 ore)
**Obiettivo**: Portare il tutor dal 52-68% WCAG al 90%+ come il simulatore.

**Sotto-task**:
1. **6 alert() → toast non-bloccanti**: cercare tutti gli `alert(` in src/ e sostituire con un componente toast che scompare dopo 3s. Su LIM, un alert() blocca l'intera lezione.
2. **41 stringhe non localizzate** → italiano. Cercare stringhe in inglese nel tutor/gestionale e tradurre.
3. **Touch targets < 44px** nei bottoni del tutor (ChatOverlay, ControlBar, ExperimentPicker)
4. **Font < 14px** nei contesti visibili su LIM (eliminare i 13px residui)
5. **8 borderColor DOM mutations residue** → CSS class (come fatto per GestionaleForm)

**Plugin da usare**:
- `/frontend-design` per i toast non-bloccanti
- `/design-system` per audit consistenza design tokens
- `/lim-simulator` per testare l'esperienza LIM
- `/impersonatore-utente` per simulare Prof.ssa Rossi
- Playwright per test automatici touch targets

**Checkpoint FASE 3**:
```
Scrivi: automa/reports/G11-FASE3-TUTOR-LIM.md
Verifica:
- [ ] 0 alert() in src/ (grep -rn "alert(" src/)
- [ ] 0 stringhe inglesi visibili nel tutor
- [ ] Touch targets: tutti >= 44px
- [ ] Font: tutti >= 14px nel tutor (escluso code editor)
- [ ] borderColor DOM mutations: 8 → 0
- [ ] Console errors homepage: 0
```

### FASE 4: Game Tracking + Galileo Live Test (1-2 ore)
**Obiettivo**: I giochi tracciano i risultati. Galileo funziona davvero.

**Sotto-task**:
1. **CircuitDetective**: aggiungere `studentTracker.logGameResult()` nel handler di completamento
2. **PredictObserveExplain**: idem
3. **ReverseEngineeringLab**: idem
4. **Galileo live test**: fare 5 domande REALI al nanobot (http://72.60.129.50:11434 o https://elab-galileo.onrender.com) e verificare che:
   - Le risposte arrivano
   - Il tracking chat registra in localStorage
   - Il tono e' appropriato per 10-14 anni
   - I concetti sono corretti (LED, resistore, circuito)

**Plugin da usare**:
- `/analisi-galileo` per testare le risposte AI
- MCP Galileo tools (galileo_chat, galileo_health, galileo_diagnose)
- Control Chrome per test reale nel browser

**Checkpoint FASE 4**:
```
Scrivi: automa/reports/G11-FASE4-GAMES-GALILEO.md
Verifica:
- [ ] CircuitDetective.jsx chiama logGameResult
- [ ] PredictObserveExplain.jsx chiama logGameResult
- [ ] ReverseEngineeringLab.jsx chiama logGameResult
- [ ] Galileo risponde a 5 domande (screenshot risposte)
- [ ] localStorage contiene dati chat reali
- [ ] Tono 10-14 anni: SI/NO per ciascuna risposta
```

### FASE 5: Teacher Dashboard Export + PNRR (1-2 ore)
**Obiettivo**: Il dirigente scolastico puo' scaricare un report per la rendicontazione PNRR.

**Sotto-task**:
1. **Export JSON/CSV** della classe — bottone nella dashboard che scarica i dati reali
2. **Report PNRR stampabile** — pagina dedicata che mostra: quanti studenti, quanti esperimenti completati per volume, ore stimate, competenze sviluppate
3. **Import dati** — per aggregare dati da piu' dispositivi (la Prof.ssa raccoglie i JSON dai tablet)

**ATTENZIONE**: I dati esportati sono REALI da localStorage. Se non ci sono dati, il report dice "Nessun dato disponibile" — MAI dati inventati.

**Plugin da usare**:
- `/frontend-design` per il layout del report stampabile
- `/ricerca-tecnica` per best practice export dati client-side
- Playground per testare il layout di stampa

**Checkpoint FASE 5**:
```
Scrivi: automa/reports/G11-FASE5-EXPORT-PNRR.md
Verifica:
- [ ] Bottone "Esporta CSV" scarica file con dati reali
- [ ] Bottone "Esporta JSON" scarica file con struttura corretta
- [ ] Report PNRR mostra dati reali o "Nessun dato"
- [ ] Import JSON funziona e aggiorna la dashboard
- [ ] Zero dati finti in qualsiasi stato
```

### FASE 6: Ricerca + Innovazione (1 ora)
**Obiettivo**: Capire cosa fanno i competitor nel 2026 e cosa possiamo fare meglio.

**Plugin da usare**:
- `/ricerca-innovazione` — trend EdTech 2026
- `/ricerca-idee-geniali` — pensiero laterale per feature uniche
- `/ricerca-marketing` — analisi competitor (Tinkercad, Arduino IDE, Code.org)
- Firecrawl per scraping siti competitor
- `/ricerca-tecnica` — WebUSB, WebSerial, WebBluetooth per connessione kit fisico

**Checkpoint FASE 6**:
```
Scrivi: automa/reports/G11-FASE6-RICERCA.md
Output:
- [ ] Top 5 feature competitor che noi NON abbiamo
- [ ] Top 3 idee geniali UNICHE per ELAB
- [ ] Stato WebUSB/WebSerial nel 2026 (fattibilita' connessione kit fisico)
- [ ] 1 raccomandazione implementabile nella sessione corrente
```

### FASE 7: Implementa la Raccomandazione dalla Ricerca (1-2 ore)
**Obiettivo**: Prendi la raccomandazione migliore dalla FASE 6 e implementala.

**Plugin da usare**:
- `/writing-plans` per pianificare prima di codificare
- `/subagent-driven-development` per esecuzione parallela
- `/frontend-design` se e' un componente UI
- `/architecture` se e' un cambio architetturale

**Checkpoint FASE 7**:
```
Scrivi: automa/reports/G11-FASE7-INNOVAZIONE.md
Verifica:
- [ ] Feature implementata e funzionante
- [ ] Build PASSA
- [ ] Browser test PASS
- [ ] Nessuna regressione
```

### FASE 8: Verifica Massiva — 8 Layer (2-3 ore) ★ CRITICO
**Obiettivo**: Verificare TUTTO prima del deploy. Questa fase e' la piu' importante.

**Layer 1 — Build**
```bash
cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build
# Exit 0 obbligatorio
```

**Layer 2 — Browser E2E (10 esperimenti)**
Usa preview_start + preview_eval per testare:
```
v1-cap6-esp1, v1-cap7-esp1, v1-cap7-esp3, v1-cap8-esp2, v1-cap9-esp4
v2-cap6-esp1, v2-cap6-esp3, v2-cap7-esp1
v3-cap6-semaforo, v3-cap7-mini
```
Per OGNI esperimento: carica, verifica componenti, verifica fili, verifica modo (circuit/avr).

**Layer 3 — Console Errors**
```
preview_console_logs level=error → target: 0 errori nuovi
```

**Layer 4 — Teacher Dashboard**
```
Naviga a #teacher, verifica 8 tab, verifica dati reali, verifica export
```

**Layer 5 — Accesso Zero-Friction**
```
Naviga a #prova, verifica simulatore funzionante senza login
```

**Layer 6 — Bundle Size**
```
Verifica bundle < target, PWA precache < target
```

**Layer 7 — WCAG/A11y**
```
0 alert() | 0 stringhe inglesi visibili | touch >= 44px | font >= 14px
```

**Layer 8 — Regressioni**
```
Confronta con G10: nessuna feature persa, nessun esperimento rotto
```

**Plugin da usare per la verifica**:
- `/quality-audit` per score card automatica
- `/ricerca-bug` per bug hunting proattivo
- `/analisi-simulatore` per verifica CircuitSolver
- `/analisi-statistica-severa` per i numeri
- Control Chrome per test reale nel browser
- Playground per test interattivi
- 3+ subagent paralleli per audit quality/simulator/bug-hunt
- `/giudizio-multi-ai` per assessment oggettivo

**Checkpoint FASE 8**:
```
Scrivi: automa/reports/G11-VERIFICA-FINALE.md
Ogni layer deve avere: PASS/FAIL + numeri precisi + prove (screenshot o output)
```

### FASE 9: Scores Onesti + Deploy + Handoff (30 min)

**Score card**: Aggiorna il PDR con i nuovi punteggi. Sii BRUTALMENTE onesto.

**Plugin da usare**:
- `/analisi-statistica-severa` per i numeri
- `/giudizio-multi-ai` per assessment cross-validato

**Deploy** (se tutti i check passano):
```bash
cd "VOLUME 3/PRODOTTO/elab-builder"
npm run build && npx vercel --prod --yes
curl -s -o /dev/null -w "%{http_code}" https://elab-builder.vercel.app
```

**Handoff**:
```
Scrivi: automa/handoff.md (G11 → G12)
Aggiorna: automa/STATE.md
Aggiorna: memory/session-summaries.md
```

---

## DOCUMENTI INTERMEDI OBBLIGATORI

Dopo OGNI fase, scrivi il documento di checkpoint in `automa/reports/G11-FASE{N}-*.md`.
Questi documenti servono per:
1. Mantenere il contesto se la sessione viene compressa
2. Permettere alla fase successiva di leggere i risultati
3. Fornire prove verificabili a Andrea

Formato documento:
```
# G11 FASE {N} — {Titolo}
Data: {data}
Durata: {tempo stimato}
Status: PASS/FAIL

## Cosa e' stato fatto
[lista]

## Metriche prima/dopo
[tabella]

## Problemi trovati
[lista]

## Prossimi passi
[lista]
```

---

## REGOLE DELLA SESSIONE

### Onesta'
- Se qualcosa fa schifo, dillo. Se qualcosa e' buono, dillo.
- Mai gonfiare i punteggi. Mai minimizzare i problemi.
- Se una fase fallisce, documentalo e vai avanti.

### Zero Demo
- MAI creare dati finti, mock, demo mode, placeholder
- Se mancano dati: "Nessun dato disponibile"
- Il simulatore deve funzionare DAVVERO in ogni contesto

### Principio Zero
- Ogni decisione va filtrata con: "La Prof.ssa Rossi riuscirebbe?"
- Prof.ssa Rossi: 52 anni, insegna Tecnologia, zero esperienza ELAB, ha il kit e il Volume 1 sulla cattedra, 25 ragazzini di 12 anni che si distraggono
- Se servono piu' di 3 tap per arrivare al simulatore, HAI FALLITO

### Plugin Obbligatori
Usa ALMENO questi plugin durante la sessione:
- `/quality-audit` (FASE 8)
- `/frontend-design` (FASE 1, 3, 5)
- `/writing-plans` (FASE 1, 7)
- `/system-design` (FASE 1)
- `/architecture` (FASE 7)
- `/ricerca-innovazione` (FASE 6)
- `/ricerca-idee-geniali` (FASE 6)
- `/ricerca-tecnica` (FASE 2, 5, 6)
- `/ricerca-bug` (FASE 8)
- `/analisi-simulatore` (FASE 8)
- `/analisi-galileo` (FASE 4)
- `/analisi-statistica-severa` (FASE 9)
- `/giudizio-multi-ai` (FASE 9)
- `/lim-simulator` (FASE 3)
- `/impersonatore-utente` (FASE 3)
- `/design-system` (FASE 3)
- `/subagent-driven-development` (FASE 7, 8)
- Firecrawl (FASE 2, 6)
- Control Chrome (FASE 4, 8)
- Playground (FASE 5, 8)
- MCP Galileo (FASE 4)
- preview_start + preview_screenshot (tutte le fasi)

### Subagent Teams
Lancia team di agenti paralleli dove possibile:
- FASE 1: 1 agente design + 1 agente routing
- FASE 3: 1 agente alert→toast + 1 agente i18n + 1 agente touch/font
- FASE 8: 3+ agenti (quality, simulator, bug-hunt, a11y)

### Build Gate
Verifica `npm run build` dopo OGNI fase. Se fallisce, fixa PRIMA di procedere.

---

## TARGET FINALE G11

| Metrica | Pre-G11 | Target G11 | Peso |
|---------|---------|-----------|------|
| Tap al primo LED | 4+ | <= 2 | ★★★ |
| Bundle totale | 9.7 MB | < 5 MB | ★★ |
| Tutor WCAG | 52-68% | > 85% | ★★ |
| alert() | 6 | 0 | ★★ |
| borderColor mutations | 8 | 0 | ★ |
| Giochi tracciati | 0/3 | 3/3 | ★ |
| Galileo testato live | No | Si | ★ |
| Export PNRR | No | Si | ★★ |
| Score composito | 7.6/10 | > 8.2/10 | ★★★ |

**Se raggiungi 8.2+ con prove, e' un successo straordinario.**
**Se raggiungi 8.0+ con onesta', e' un ottimo risultato.**
**Se scendi sotto 7.6, qualcosa e' andato storto — documentalo.**
