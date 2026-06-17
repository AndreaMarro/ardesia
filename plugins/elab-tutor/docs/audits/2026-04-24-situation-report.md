# Situation Report — 2026-04-24

**Auditor:** Claude (sessione R2.S1, ruolo strategic product analyst, read-only)
**Budget tempo:** 30 min
**Filtro dominante:** Principio Zero v3 — "Docente davanti alla LIM inizia a spiegare senza attrito, senza ambiguità, senza passaggi inutili."
**Fonti:** 13 file obbligatori + `git log main -n 30` + `gh pr list merged limit 15`.

---

## 1. Dove siamo davvero oggi (fatti verificabili)

| Dimensione | Valore | Fonte |
|---|---|---|
| Sprint corrente | Sprint 6 Day 38 in corso | PR #27 merged 2026-04-24 |
| Baseline test | 12290 pass | `automa/baseline-tests.txt` |
| PR merged ultimi 3 giorni | 4 (#25, #26, #27, #28) | gh pr list |
| Feature deployate mappate | 78 totali | R1.S1 feature map §0 |
| LIVE confermate prod | 47 | R1.S1 §0 |
| ROTTA | 3 | R1.S1 §0 |
| ATTRITO P-Zero v3 | 18 | R1.S1 §10 |
| OpenClaw ToolSpec | 57 (target 80) | PR #27 handoff |
| Handler OpenClaw live | 47 (6 wired + 3 event-stub + 38 legacy) | Day 37 audit §2 |
| Scuole paganti | 0 | revenue-model §0 |
| Classi pilota freemium | 0-2 non verificato | revenue-model §1 |
| Infra €/mese oggi | ~€20-50 | revenue-model §1 |
| Baseline benchmark score | 4.73 (sotto target sett-1 4.9) | day-37-audit §3 riga 4 |
| Secret leak Supabase PAT | risolto (sanitize + upstream rotation) | audit 2026-04-23 |
| Supabase migrations OpenClaw | NON applicate (SQL file staged) | Day 37 audit §5 G4 |
| Dispatcher OpenClaw in src/ | NON wired (spec esiste, import non in useGalileoChat) | sunto 22-23 riga 66 |

**Commit log main ultimi 3 giorni:** 16× `chore(watchdog): append anomalies` (auto-loop) + 4 PR sostanziali. Lavoro reale = spec OpenClaw + handler bridge + audit mappa deployato.

---

## 2. Priorità esplicite ultimi 3 giorni (da PR merged)

| PR | Titolo | Data | Volume |
|---|---|---|---|
| #25 | OpenClaw Onnipotenza Morfica v4 — spec + infra | 2026-04-23 | ~3.160 righe doc+ts, 0 runtime wired |
| #26 | Sprint-6-Day-37 wire 9 OpenClaw unlim handlers [+47 tests] | 2026-04-23 | +181 LOC simulator-api.js, 32 test blocks |
| #27 | Sprint-6-Day-38 registry expand 42→57 ToolSpec + handoff | 2026-04-24 | 15 nuovi ToolSpec Layer A |
| #28 | Mappa funzionalità deployate 2026-04-24 (Routine 1 S1) | 2026-04-24 | 554 righe audit feature |

**Lettura:** 3 PR su 4 sono architetturali (OpenClaw). 1 PR è auditing. **Zero PR su fix UX / vendita / dashboard.** L'attenzione reale è stata sul cervello morphic, non sulla superficie utente.

---

## 3. Priorità implicite emergenti (letture tra righe)

1. **Onestà brutale come metodo.** Tutti i doc recenti (`openclaw-plan-honest-check` 7.2/10, `day-37-audit` 7.0/10, `feature-map` 47/78 live) evitano self-inflation storica. Pattern: voto <8 sempre, gaps enumerati min 5.
2. **Architettura > vendita** deliberato. Sunto 22-23 riga 11: "Architettura prima, vendita dopo. Scuole paganti → dopo."
3. **Rinvio GPU mensile** definitivo fino Stage 2a. Solo €15-20 orarie weekend. `gpu-vps-decision-framework` riga 146: "Non attiviamo GPU mensile oggi".
4. **Together AI come martello specifico**, MAI runtime studente. GDPR gate è single source of truth.
5. **Wiki POC Sett-4 salvato** come Layer 1 di OpenClaw, non buttato. `makeRetriever` + `loadCorpus` importati in `state-snapshot-aggregator`.
6. **Watchdog auto-loop attivo** ma produce 16+ commit rumore/giorno senza segnalazioni utili a utente (errors-log non azionato).
7. **CoV 5x discipline slittata a 3x** Day 37 — compromesso scopo-stretto accettato ma documentato come debito.

---

## 4. Ordini Andrea raccolti (frasi letterali)

Da `docs/sunti/2026-04-23-sunto-sessione-openclaw.md`:
- "Principio Zero v3: UNLIM parla ai RAGAZZI, non al docente. Cita Vol.X pag.Y. No meta-istruzioni. Linguaggio bambino 8-14, max 60 parole." (riga 12)
- "OpenClaw come cervello + scheletro UNLIM (pilotaggio, ascolto, visione, voce)" (riga 23)
- "Generare nuovi tool a runtime con memoria riuso/cancella" (riga 24)
- "Non sprecare lavoro loop Sett-4 (Wiki POC)" (riga 25)
- "Vendibile a Giovanni Fagherazzi (grande nerd + sales)" (riga 26)
- "Deve FAR GUADAGNARE ma non è priorità immediata" (riga 28)
- "Massima onestà: no inflazione numerica, no compiacere, no hype." (riga 20)

Da `CLAUDE.md`:
- "Il docente e il tramite. UNLIM e lo strumento del docente. Gli studenti lavorano sui kit fisici ELAB." (riga 5)
- "CHIUNQUE accendendo ELAB Tutor deve essere in grado, SENZA conoscenze pregresse, di giostrarsi sulla piattaforma e spiegare ai ragazzi" (riga 11)
- "MAI emoji come icone nei componenti — usare ElabIcons.jsx" (riga 101)
- "MAI dati finti o demo — tutto deve funzionare con dati reali" (riga 102)
- "MAI chiamare il tutor 'Galileo' — il nome è UNLIM" (riga 104)

Da `MEMORY.md > feedback_priorities_09apr2026.md`: "Priorità PRODOTTO: parità volumi, UNLIM onnisciente, Principio Zero, voce, Arduino/Scratch perfetti. Andrea NON fa vendite."

---

## 5. Principio Zero v3 — quanto rispettato oggi (voto)

**Voto: 4/10.**

Evidenze a favore (usando feature map R1.S1):
- UNLIM linguaggio enforced in codice via `pz-v3-validator.ts` IT primary
- RAG 549 chunk con `bookText` cita pagine volumi (CLAUDE.md riga 68)
- 92/92 esperimenti enriched con testo volume (CLAUDE.md riga 68)
- Vision + voice + chat tutti in sezione §5 feature map live

Evidenze contro (feature map R1.S1 §10, 18 flag ATTRITO):
- **3 ConsentBanner sovrapposti** su `#prova` (§10 riga 2) — bug visibile, domanda ripetuta 3×
- **"Chiave univoca" senza spiegazione** su `/` (§10 riga 3) — docente non sa cosa inserire
- **4 overlay simultanei primo accesso `#prova`** (§10 riga 4) — paralisi decisionale 10 secondi
- **4 overlay simultanei primo accesso `#lavagna`** (§10 riga 5) — idem
- **Emoji icone Build mode + Lesson step** (§10 righe 6-7-8) — viola CLAUDE regola 11 esplicita
- **Mobile lavagna canvas fuori viewport** (§10 riga 9) — docente iPad portrait non vede circuito
- **Wake word `api.galileo.sendMessage` inesistente** (§10 riga 12) — voice break silenzioso su "Ehi UNLIM"
- **`#dashboard-v2` "Failed to fetch"** (§10 riga 13) — backend Edge Function down
- **RegisterPage label vuoti** (§10 riga 14) — form incomprensibile
- **`#admin` non protetta da auth server** (§10 riga 15) — password client-side hardcoded in memoria

Docente davanti LIM oggi: incontra ConsentBanner "Quanti anni hai?" (non è un minore), 3× sovrapposto, con 4 overlay Welcome/Bentornati/Picker/Suggerimento, emoji icone ovunque. Non inizia a spiegare — chiude o chiama supporto. **Il filtro PZ v3 fallisce proprio nei primi 10 secondi che la regola stessa protegge.**

---

## 6. PDR 8 settimane — % completato reale

Piano: `docs/superpowers/plans/2026-04-20-elab-v1-ambitious-self-host-8-weeks.md`

| Area | Target 8W | Stato oggi | % reale |
|---|---|---|---|
| Sprint milestones | 8 sprint | Sprint 6 Day 38 in corso | 72% schedule (non deliverable) |
| Test baseline | 14.000 | 12.290 | 87% |
| OpenClaw registry | ~80 ToolSpec | 57 live | 71% |
| OpenClaw dispatcher in src/ | wired + flag | spec only, NON importato | 25% |
| OpenClaw L1 composition live | produzione behind flag | flag esiste, handler NON wirato in `useGalileoChat` | 15% |
| Dashboard docente funzionante | core 3 viste (progressi/nudge/export) | `#dashboard-v2` Failed to fetch, `dashboard/index.jsx` scaffold skeleton | 5% |
| UNLIM parità volumi | Vol1+Vol2+Vol3 | 92/92 esperimenti + 27 Lezioni | 90% |
| Principio Zero v3 enforcement | zero drift prod | validator IT OK, 18 ATTRITO in deploy | 40% UX |
| GDPR hardening | Together gate + audit log | gate codice OK, `together_audit_log` migration NON applicata | 60% |
| E2E Playwright | suite almeno 10 spec | 1 spec (R1.S1) + vision live 5/5 | 15% |
| Vendita PNRR | 5-15 scuole firmate | 0 | 0% |
| GPU benchmark weekend | tabella cost/latency reale | piano esiste (`2026-04-26-gpu-vps-weekend-benchmark.md`), non eseguito | 10% |

**Media onesta pesata sulle cose che spostano vendita: ~42%.**

PDR disegnato 20/04 → oggi 24/04 = 4 giorni su 56 = 7% tempo consumato. Sul tempo: avanti. Sul deliverable-che-vende (dashboard funzionante): quasi a zero.

---

## 7. Errori fatti ultimi 3 giorni (da self-audit + agent failure)

1. **AC-5 divergenza Day 37** — 3 handler event-stub (`generateQuiz`/`exportFumetto`/`videoLoad`) marcati `status: 'live'` nel registry ma nessun listener UI ancora ascolta gli eventi. Contratto Day 37 voleva `status: 'todo_sett5'`. Disclosure onesta c'è, ma field del registry mente. (day-37-audit §5 G1)
2. **CoV 3x invece di 5x** (day-37-audit §5 G2) — Rule 4.1 Day 04+ richiede 5. Scelta scopo-stretto accettata ma debito.
3. **Stress test post-deploy skipped Day 37** — 14/20 matrix metric SKIPPED. Benchmark fast-cache 4.73 sotto target 4.9 non è regressione codice ma worker_uptime probe. (day-37-audit §5 G3)
4. **Dashboard-v2 regressione silente** — deployato su prod, backend `dashboard-snapshot` Edge Function non risponde, utente vede "Failed to fetch". Scoperto da audit R1.S1, non da stress test automatico. (R1.S1 §2.7)
5. **Wake word bug preesistente non scoperto** fino R1.S1 — `api.galileo.sendMessage` in LavagnaShell.jsx:431, chiamata a namespace inesistente. Silent break da giorni. (R1.S1 §7.5)
6. **3 ConsentBanner sovrapposti in prod** — regressione UX non identificata fino feature-map. (R1.S1 §0 top-5 #1)
7. **Secret Supabase PAT leaked in git history** (`sbp_eaa2d1aa...` + `sbp_86f828bce...` in 12 file) — scoperto da `coherence-check.mjs` prima run. Rotation + sanitize fatto, history NON purgata (accettato). (audit 2026-04-23-security)
8. **Supabase migrations `openclaw_tool_memory` + `together_audit_log` NON applicate** — `saveSessionMemory` usa ancora localStorage. Gap vs pianificato. (day-37-audit §5 G4, CLAUDE.md bug #8)
9. **Dispatcher OpenClaw scritto come spec ma non importato da `src/`** — tutto il lavoro L1 live è bloccato su questo step (sunto §61 riga 66).

---

## 8. Cosa protegge davvero la visione

1. **Volumi fisici + kit Omaric + filiera integrata** (Giovanni sales, Davide MePA, Andrea dev, Omaric hardware). Impossibile da copiare da OpenAI/Google.
2. **RAG 549 chunk con bookText + pagine citate** (`src/data/rag-chunks.json`, CLAUDE.md riga 68) — ogni risposta può ancorare al testo del volume reale.
3. **Principio Zero v3 formalizzato + validator IT production** — concetto vendibile "UNLIM parla ai ragazzi, non al docente" non ha competitor.
4. **GDPR EU-only runtime + Together AI gate** — deploy region Supabase FR/Irlanda, gate `canUseTogether` BLOCKS student runtime. Vendibile a PNRR audit.
5. **Pre-commit secret scanner + coherence check** — il leak PAT ha trovato se stesso. Regressione futura bloccata.
6. **12290 test baseline + CoV discipline** — regressioni tecniche catturate. Rule "test scendono → REVERT IMMEDIATO" in CLAUDE.md riga 40.
7. **CLAUDE.md regole immutabili** — 17 regole hard su qualità/tecnica/design. Funge da costituzione.
8. **Architettura modulare OpenClaw** — 3-layer (reflection/semantic/morphic) + L3 spento di default = scalare senza rompere.
9. **Mascotte + chat + vision + voice UI tutti LIVE** — superficie utente completa se overlay stacking si risolve.
10. **Filiera Omaric Elettronica Strambino** — fornitore hardware Arduino-chain, autonomo da Andrea.

---

## 9. Cosa indebolisce la visione

Primo blocco (3 ROTTA visibili docente 10s, R1.S1 §0 top-5):

1. **`#dashboard-v2` backend Failed to fetch** — Edge Function `dashboard-snapshot` non risponde. Senza dashboard non si vende PNRR (MEMORY "Dashboard senza backend = shell vuota" G45-audit-brutale #1 blocker).
2. **3 ConsentBanner sovrapposti** su `#prova` — bug visibile, domanda età ripetuta 3×.
3. **Wake word call `api.galileo.sendMessage` inesistente** — voice break silenzioso su "Ehi UNLIM". LavagnaShell.jsx:431.

Secondo blocco (18 ATTRITO PZ v3 da §10 feature map):

4. **ConsentBanner su `/scuole/pnrr` landing B2B** — docente non capisce perché età minore
5. **"Chiave univoca" su `/` senza spiegazione**
6-8. **4 overlay simultanei primo accesso `#prova` + `#lavagna` + Welcome + Suggerimento**
9-11. **Emoji icone Build mode + Lesson step + MinimalControlBar** — viola CLAUDE regola 11
12. **Mobile lavagna canvas fuori viewport** — iPad portrait
13. **Mobile `#prova` modal coprono tutto** — ~80px canvas usabile
14. **`RegisterPage` label vuoti**
15. **`#admin` password client-side hardcoded**
16. **`addComponent` da palette posiziona random, non snap breadboard**
17. **Bentornati auto-load 2s primi accessi** — esperimento cambia da solo mentre docente clicca
18. **LessonPath default chiusa `#lavagna` vs aperta `#prova`** — inconsistenza UX

Terzo blocco (strategici):

19. **0 scuole paganti a 67 giorni da deadline PNRR 30/06/2026** (revenue-model riga 12)
20. **Andrea unico dev** — burnout risk (revenue-model §8 riga 175)
21. **Watchdog commit noise** 16+/giorno senza segnalazione utile
22. **Dispatcher OpenClaw non wired in `src/`** — architettura brillante spenta
23. **9/57 handler rimasti `todo`/`composite` senza UI** — tool promessi ma non eseguibili
24. **MePA status sconosciuto** — Davide non ha aggiornato n. scuole preventivate (revenue-model §9.6)
25. **Storia di self-score inflato** — G20 audit brutale score 6.2 mentre self-claim era 8.6 (+3 punti drift). Sistema oggi corretto ma abitudine residua.

---

## 10. 5 decisioni critiche prossimi 4 giorni

### Decisione 1 — Dashboard docente: fix backend o togliere link

**Contesto:** `#dashboard-v2` è deployato ma "Failed to fetch" immediato. Shell vuota = zero vendita PNRR possibile (MEMORY G45-audit-brutale #1 blocker, revenue-model §8 "#1 rischio").

**Opzioni:**
- A: Fix Edge Function `dashboard-snapshot` — 2h stima, sblocca dashboard base
- B: Togliere link da nav fino fix + marcare `[beta]` — 10 min, onesto
- C: Forzare redirect `#dashboard-v2` → scaffold placeholder con "in lavorazione" — 30 min

**Raccomandato:** A se backend fixable in giornata, altrimenti B subito + A pianificato Day 39-40.

### Decisione 2 — Eliminare 18 ATTRITO primo-accesso in 1 sweep

**Contesto:** ConsentBanner x3, 4 overlay, emoji icone Build/Lesson = primi 10 secondi docente perduti (feature-map §0 top-3).

**Azione concreta:**
- Rimuovere 2 istanze duplicate `ConsentBanner` (mantenere 1 root AppRouter)
- Skip ConsentBanner su route `/scuole/pnrr` (non è student-facing)
- Serializzare overlay primo accesso: un dialog alla volta con priority queue
- Sostituire 8 emoji pill (🔧👣🎨📋❓👀✅💡) con `ElabIcons`
- Stima: 4-6h, impatto: ATTRITO da 18 → 6

**Raccomandato:** PR singolo "ux: primo accesso senza attrito" entro Day 40.

### Decisione 3 — Wake word fix + dispatcher OpenClaw mount

**Contesto:**
- Wake word silent break (LavagnaShell.jsx:431) — 15 min fix
- Dispatcher OpenClaw blocker L1 live — sunto §61 "non ancora cablato"

**Azione:**
- Single-line fix `api.galileo.sendMessage` → sostituire con logica `useGalileoChat.sendMessage` o dispatch equivalente
- Importare `openclawDispatch` in `useGalileoChat.js` behind `VITE_OPENCLAW_ENABLED` (Task 13 del plan `2026-04-23-openclaw-sprint6-l1-live.md`)

**Raccomandato:** Day 39.

### Decisione 4 — MePA status call con Davide + 1-pager Giovanni

**Contesto:** Deadline PNRR 30/06/2026 = 67 giorni. 0 scuole firmate. Senza aggiornamento Davide + materiale Giovanni, H1 è perso e H2 diventa marketing organico lento (revenue-model §8 rischio #1).

**Azione Andrea (non-dev, alto impatto):**
- Chiamare Davide: n. scuole preventivate, n. firme Q2, blocker
- Scrivere 1-pager tecnico + 3-min video demo con `#prova` volume 1
- Inviare a Giovanni per feedback Pitch Giovanni

**Raccomandato:** Day 39-40 (2 ore Andrea totali, ROI >50× di 2 ore di codice).

### Decisione 5 — Supabase migrations OpenClaw apply staging

**Contesto:** `openclaw_tool_memory` + `together_audit_log` SQL scritti ma non applicati. `saveSessionMemory` usa localStorage, tool-memory off. (day-37-audit §5 G4)

**Azione:** `npx supabase db push --linked` su staging project + smoke test insert/delete. Stima 20 min.

**Raccomandato:** Day 39 prima del dispatcher wire-up (Decisione 3) altrimenti dispatcher L1 scrive su localStorage non su vector store.

---

## 11. Verdetto sintetico brutalmente onesto

**Score ELAB Tutor oggi: 6.2/10.**

Pipeline tecnica eccellente (12290 test, OpenClaw spec rigoroso, 92 esperimenti parità volumi, RAG pagina-citata) convive con superficie utente rotta nei primi 10 secondi (4 overlay, emoji icone, wake word morto, dashboard Failed to fetch). Il filtro Principio Zero v3 che Andrea ha scolpito in costituzione fallisce proprio nel momento che doveva difendere. 0 scuole paganti a 67 giorni dal deadline PNRR segnala che il lavoro architetturale "prima vendita dopo" ha consumato 3 sprint intanto che il frontend era marcio. Onestà del reporting è il grande progresso: score auto-inflazionato è sparito. Ma i gap nel deploy sono scoperti da audit, non da CI — la regressione silente funziona ancora. I prossimi 4 giorni vanno spesi su superficie utente + backend dashboard + call Davide, non su registry 57→80.

**5 decisioni critiche:**
1. Dashboard-v2 fix backend o togliere link
2. PR unico UX primo-accesso (ConsentBanner + overlay + emoji)
3. Wake word one-line fix + dispatcher OpenClaw mount behind flag
4. Andrea call Davide MePA + 1-pager Giovanni
5. Supabase migrations apply staging (sblocca tool-memory)
