# PIANO ORCHESTRATO — Sessione 13 Aprile 2026

> Riunione LUNEDI con Omaric + Giovanni Fagherazzi
> Questo piano coordina: Terminal (Ralph Loop) + Claude Web + 3 Worker + Agent paralleli
> TUTTO comunica via git (push su origin + work) e docs/sprint/

---

## ARCHITETTURA SESSIONE

```
┌─────────────────────────────────────────────────────────┐
│                    TERMINAL (Ralph Loop)                  │
│  Orchestratore principale — cicli ogni 20 min            │
│  Pull → Task → Test → COV → Commit → Push → Deploy      │
│                                                          │
│  8 AGENT PARALLELI (lanciati dal Ralph Loop):            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ AGENT 1  │ │ AGENT 2  │ │ AGENT 3  │ │ AGENT 4  │   │
│  │Simulatore│ │  UNLIM   │ │  Volumi  │ │   UX     │   │
│  │ bug fix  │ │ RAG+test │ │ parita   │ │ touch/PC │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ AGENT 5  │ │ AGENT 6  │ │ AGENT 7  │ │ AGENT 8  │   │
│  │  Voce    │ │  Costi   │ │Playwright│ │  Critic  │   │
│  │wake word │ │pacchetti │ │50 utenti │ │ avversar │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│           CLAUDE WEB (andrea marro)             │
│  PRIORITA MASSIMA nelle prime 3 ore             │
│                                                 │
│ Task:                                           │
│ - Scaletta demo lunedi (P0)                     │
│ - Analisi costi OGNI combinazione (P0)          │
│ - Test UNLIM 30 Q&A via curl (P1)              │
│ - Pacchetti prezzo (P0)                         │
│ - CSS prototipi (P2)                            │
│ - Parita volumi + esperimenti superflui (P1)    │
│ - Cap1 breadboard prototipo (P2)                │
└────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              3 WORKER PROGRAMMATI (ogni ora)              │
│  :17 Audit    │  :32 Debugger   │  :47 Critic           │
│  pull+test    │  colma gap test │  trova bug             │
└─────────────────────────────────────────────────────────┘
```

## COMUNICAZIONE TRA COMPONENTI

Tutti comunicano via:
- **Git**: push su `origin` + `work` dopo ogni blocco
- **docs/sprint/S3-PROGRESS.md**: ogni componente scrive il suo stato ogni 30 min
- **docs/sprint/BLOCKERS.md**: se qualcuno è bloccato, scrive qui
- Il Ralph Loop in Terminal legge S3-PROGRESS e BLOCKERS ad ogni ciclo

---

## RALPH LOOP — Terminal (sessione principale)

### Prompt iniziale Terminal
```
Leggi docs/plans/2026-04-13-sessione-prossima-prompt.md — contiene i 6 task.
Sei in modalità Ralph Loop: cicli ogni 20 minuti.
Ogni ciclo: pull → scegli task → implementa → test → COV → push → deploy.
Lancia 8 agent paralleli come descritto nel piano orchestrato.
Score attuale: 6.8/10. Target: 8.0/10. Test: 3674.
Riunione DOMANI. PRINCIPIO ZERO.
```

### Ciclo Ralph Loop (ogni 20 min)

```
CICLO N:
1. git pull origin main (prendi lavoro da Claude Web e worker)
2. Leggi docs/sprint/S3-PROGRESS.md — cosa hanno fatto gli altri?
3. Leggi docs/sprint/BLOCKERS.md — qualcuno è bloccato?
4. Scegli il task con priorità più alta NON ancora completato
5. Implementa (o lancia agent parallelo)
6. npx vitest run >= 3674 (NO REGRESSIONI)
7. npm run build (PASS)
8. Aggiorna docs/sprint/S3-PROGRESS.md
9. git commit + push origin + push work
10. Se ciclo 3/6/9: npx vercel deploy
11. Se ciclo 5/10: audit COV + benchmark aggiornato
```

### Ordine task nel Ralph Loop

| Ciclo | Task | Agent parallelo |
|-------|------|-----------------|
| 1 | Setup: pull, verifica stato, lancia agent 1-4 | Agent 1-4 |
| 2 | UNLIM: test 10 domande via curl, fix prompt | Agent 5-8 |
| 3 | Simulatore: testa Cap6 Vol1 su Chrome, fix bug | — |
| 4 | Raccogli risultati agent, merge, test | — |
| 5 | COV + benchmark aggiornato | — |
| 6 | UNLIM: wake word "Ehi UNLIM" implementazione | — |
| 7 | Voce: testa Edge TTS, valuta Kokoro | — |
| 8 | Raccogli risultati Claude Web, merge | — |
| 9 | Deploy + test live Chrome | — |
| 10 | Audit finale, PDR, prompt sessione dopo | — |

---

## 8 AGENT PARALLELI — Dettaglio

### Agent 1: Simulatore Bug Fix
```
Testa OGNI esperimento Vol1 Cap6 (3 esperimenti) su Chrome via Playwright.
Per ognuno: carica, verifica SVG render, play, pause, reset.
Fix qualsiasi bug. Testa Scratch per v3-cap6-semaforo.
Output: docs/sprint/AGENT1-SIMULATOR-REPORT.md
```

### Agent 2: UNLIM RAG + Test
```
Testa UNLIM con 20 domande reali via Supabase Edge.
Verifica che le risposte usino parole dei volumi (RAG 638 chunk).
Se la risposta è generica → il chunk RAG non è stato trovato → migliora query.
Testa AZIONE tags: play, highlight, loadexp.
Testa INTENT tags: place+wire circuito complesso.
Output: docs/sprint/AGENT2-UNLIM-QA-REPORT.md (20 Q&A con score 1-5)
```

### Agent 3: Analisi Volumi + Esperimenti Superflui
```
Leggi docs/volumi-originali/VOLUME-{1,2,3}-TESTO.txt
Leggi docs/sprint/AUDIT-PARITA.md
Identifica esperimenti che sono REITERAZIONI:
- Cap 9 Esp 7/8/9 = variazioni di "aggiungi pulsante"
- Cap 10 Esp 5/6 = variazioni di "aggiungi potenziometro/pulsante"
Proponi: quali accorpare, quali rimuovere, quali rinominare
Output: docs/sprint/AGENT3-VOLUMI-SUPERFLUI.md
```

### Agent 4: UX Touch + PC
```
Playwright test su 3 viewport: mobile 375px, tablet 768px, desktop 1280px.
Per ognuno: testa touch target >= 44px, overflow, header troncato.
Verifica che breadcrumb "Vol > Cap > Esp" sia visibile.
Verifica UNLIM su mobile (deve essere usabile).
Output: docs/sprint/AGENT4-UX-REPORT.md
```

### Agent 5: Voce + Wake Word
```
Analizza src/services/voiceService.js e src/hooks/useSTT.js.
Proponi implementazione wake word "Ehi UNLIM":
- WebSpeech API continuous listening per wake word
- Attivazione STT dopo rilevamento
- Costo: zero (browser API)
Scrivi test per voiceCommands con "ehi unlim" pattern.
Output: docs/sprint/AGENT5-VOICE-WAKEWORD.md
```

### Agent 6: Verifica Costi (cross-check del lavoro Claude Web)
```
Leggi docs/presentazione/ANALISI-COSTI-COMPLETA.md (scritto da Claude Web).
RICONTROLLA tutti i calcoli. Verifica:
- I prezzi API sono aggiornati (Gemini, ElevenLabs, OpenAI)
- I margini sono calcolati correttamente
- Il break-even e realistico
Se trovi errori: correggi e documenta.
Output: docs/sprint/AGENT6-COST-VERIFICATION.md
```

### Agent 7: Playwright 50 Utenti
```
Esegui e2e/20-fifty-users-comprehensive.spec.js
Se ci sono fail: documenta bug, proponi fix.
Aggiungi 20 test nuovi per le 7 categorie benchmark a zero.
Output: docs/sprint/AGENT7-PLAYWRIGHT-REPORT.md
```

### Agent 8: Critico Avversario
```
Leggi TUTTO il codice critico (api.js, LavagnaShell, useGalileoChat).
Cerca: credenziali hardcoded, console.log, dead code, XSS, GDPR violation.
Simula Giovanni che prova il prodotto: cosa non funziona?
Simula un docente al primo uso: cosa confonde?
Output: docs/sprint/AGENT8-CRITIC-REPORT.md
```

---

## CLAUDE WEB #1 — Account Andrea Marro

### Prompt
```
Pull da main. Leggi docs/plans/2026-04-13-PIANO-ORCHESTRATO-COMPLETO.md.

I tuoi 4 task:

1. SCALETTA DEMO LUNEDI (P0)
   Crea docs/presentazione/SCALETTA-DEMO-LUNEDI.md
   30 minuti, 15 step, cosa cliccare/dire/NON mostrare per ogni step.
   Esperimenti da mostrare per ogni volume.
   Risposte a obiezioni di Giovanni.

2. ANALISI COSTI (P0)
   Crea docs/presentazione/ANALISI-COSTI-COMPLETA.md
   OGNI combinazione scuole × pacchetto × voce.
   Margine per ogni scenario. Break-even.
   Calcola almeno 2 volte per verificare.

3. TEST UNLIM 30 DOMANDE (P1)
   curl -X POST le Supabase Edge Functions con 30 domande reali.
   Documenta risposte e score 1-5.
   Se UNLIM non risponde: documenta il bug.

4. PACCHETTI PREZZO (P0)
   Base (€200/anno): Lavagna + UNLIM chat
   Standard (€350): + Voce + Report
   Premium (€500): + Videolezioni + Dashboard → SPINGI QUESTO
   Enterprise (€800): + LIM + Offline + Supporto
   Per ogni pacchetto: cosa include ESATTAMENTE, margine, target cliente.

Aggiorna docs/sprint/S3-PROGRESS.md ogni 30 min.
Push su origin main. Test >= 3674.
```

### Durata: sessione MOLTO lunga (6+ ore) — PRIORITA MASSIMA nelle prime 3 ore
**NOTA**: Il Terminal locale potrebbe non essere disponibile nelle prime ore. Claude Web #1 deve fare il lavoro pesante SUBITO: scaletta demo + analisi costi + test UNLIM. NON aspettare il Terminal.

---

---

## 3 WORKER PROGRAMMATI (già attivi)

| Worker | Schedule | Task sessione 13/04 |
|--------|----------|---------------------|
| elab-audit-worker (:17) | Pull, test, build | Verifica 0 regressioni ogni ora |
| elab-debugger-worker (:32) | Colma gap test | Focus: WCAG + Tablet + PWA (categorie zero) |
| elab-critic-worker (:47) | Trova bug | Focus: credenziali nel bundle, dead code |

---

## TIMELINE SESSIONE (stimata 6-8 ore)

| Ora | Terminal (Ralph Loop) | Claude Web (andrea) | Worker |
|-----|----------------------|---------------------|--------|
| 0:00 | (forse offline) | Scaletta demo + analisi costi | — |
| 0:30 | (forse offline) | Analisi costi (ricontrolla!) + pacchetti | Audit :17 |
| 1:00 | (forse offline) | Parita volumi + esperimenti superflui | Debugger :32 |
| 1:30 | (forse offline) | CSS fix proposte + test (200+ nuovi) | Critic :47 |
| 2:00 | Setup se disponibile | Rilettura e push tutto | Audit :17 |
| 2:30 | Pull + merge + test anti-regressione | — | Debugger :32 |
| 3:00 | Agent 1-4 (simulatore, UNLIM, UX, voce) | — | Critic :47 |
| 3:30 | Agent 5-8 (Playwright, critic, costi verifica) | — | Audit :17 |
| 4:00 | Merge agent + test UNLIM 30 Q&A via curl | — | Debugger :32 |
| 4:30 | Fix bug trovati + wake word "Ehi UNLIM" | — | Critic :47 |
| 5:00 | Deploy + test live Chrome | — | Audit :17 |
| 5:30 | Audit finale + benchmark aggiornato | — | Debugger :32 |
| 6:00 | PDR + prompt sessione dopo + checklist pre-demo | — | Critic :47 |

**STRATEGIA**: Claude Web fa lavoro documentale (prime 2 ore). Terminal fa lavoro tecnico (ore 2-6). Worker colmano gap test continuamente. Test UNLIM via curl lo fa il Terminal (Claude Web non puo fare HTTPS esterno).

---

## PIANO B — Se qualcosa non funziona alla demo

| Problema | Piano B |
|----------|---------|
| UNLIM non risponde (rate limit Gemini) | Mostra screenshot risposte pre-registrate |
| Sito non carica | Demo da localhost (npm run dev) |
| Scratch non si apre | Salta, mostra solo circuiti analogici Vol1-Vol2 |
| Voce non funziona | Disattiva TTS, usa solo chat testuale |
| Build fallisce | Deploy precedente e ancora LIVE |

## CHECKLIST PRE-DEMO (1 ora prima di lunedi)

- [ ] `curl https://www.elabtutor.school` → 200 OK
- [ ] Apri Chrome → inserisci ELAB2026 → Lavagna carica
- [ ] UNLIM minimizzato (mascotte in basso)
- [ ] Click mascotte → UNLIM apre → scrivi "Come funziona il LED?"
- [ ] UNLIM risponde con parole dei volumi
- [ ] "Passo Passo" → circuito si monta
- [ ] Batteria sufficiente laptop
- [ ] WiFi stabile o hotspot telefono pronto
- [ ] Documenti presentazione pronti in docs/presentazione/

---

## METRICHE DI SUCCESSO

| Metrica | Attuale | Target fine sessione |
|---------|---------|---------------------|
| Test vitest | 3674 | 4000+ |
| Playwright Chrome | 50 | 100+ |
| Benchmark score | 6.8/10 | 7.5/10 |
| Categorie zero | 7 | 3 |
| UNLIM Q&A score | non testato | 4.0/5 media |
| Simulatore bug | sconosciuti | 0 P0 |
| Deploy live | 12/04 23:15 | Aggiornato |
| Presentazione | non esiste | Completa |
| Analisi costi | parziale | Completa |

---

## REGOLE FERREE (per TUTTI i componenti)

1. Push su ENTRAMBI: `git push origin main && git push work main`
2. Test >= 3674 sempre (NO REGRESSIONI)
3. Aggiornare S3-PROGRESS.md ogni 30 min
4. Prova oggettiva per ogni task
5. SE UNA COSA SEMBRA FINITA, RICONTROLLALA
6. MAI auto-celebrarsi
7. Principio Zero: il docente è il protagonista
8. NO DEMO, NO DATI FINTI — tutto deve funzionare con dati reali
