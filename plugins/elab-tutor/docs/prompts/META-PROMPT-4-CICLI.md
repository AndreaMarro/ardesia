# META-PROMPT: 4 Cicli di Eccellenza ELAB

## Come usare questo prompt
Copia-incolla TUTTO il contenuto sotto la linea "---START---" all'inizio di una NUOVA sessione Claude Code.
Ogni ciclo ha 4 fasi: ANALISI → ESECUZIONE → VERIFICA → DEBUG.
Dopo i 4 cicli, parte l'audit brutale finale.

---START---

Voglio portare ELAB Tutor da 6.8/10 a 8.5+/10 in questa sessione, eseguendo 4 cicli strutturati di miglioramento con verifica indipendente dopo ogni ciclo.

## PRIMA DI TUTTO: Leggi questi file completamente

- `docs/prompts/G46-G55-sanamento-completo.md` — Piano sanamento completo, stato fix
- `CLAUDE.md` — Regole progetto, architettura, palette, limiti
- Memoria `G45-audit-brutale.md` in `.claude/projects/*/memory/` — Score reale 5.8→6.8, gap residui
- `automa/STATE.md` — Stato corrente progetto
- `automa/handoff.md` — Ultimo handoff

## Riferimento: cosa rende ELAB eccellente

Ecco le regole estratte dal prodotto ideale (principio zero di Andrea):

- SEMPRE: L'insegnante arriva alla LIM e spiega IMMEDIATAMENTE senza conoscenze pregresse
- SEMPRE: Galileo/UNLIM e un assistente INVISIBILE, non una video lezione — risposte <60 parole, socratiche
- SEMPRE: Estetica Apple/Tinkercad — pulita, moderna, nessun elemento visivo superfluo
- SEMPRE: Touch target ≥44px, font ≥14px, contrasto WCAG AA 4.5:1
- SEMPRE: Funziona su LIM 1024x768 senza overflow
- MAI: demo, dati finti, mock visibili all'utente
- MAI: toccare engine/ (CircuitSolver, AVRBridge, SimulationManager)
- MAI: linguaggio adulto/tecnico nelle interfacce — target 8-14 anni
- MAI: score auto-assegnati >7 senza verifica con agenti indipendenti

## SUCCESS BRIEF

Tipo di output: Codice di produzione + report di qualita verificato
Reazione attesa: "Questo prodotto e pronto per essere mostrato a una scuola"
NON deve sembrare: Codice scritto in fretta, UI generica, fix superficiali
Successo significa: Audit indipendente post-ciclo >= 8.0/10 su UX + funzionalita

## REGOLE CRITICHE (leggi PRIMA di scrivere codice)

1. `npm run build` + `npx vitest run` dopo OGNI modifica — se fallisce, fix immediato
2. ZERO regressioni: 982+ test devono sempre passare
3. PATH: `export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | sort -V | tail -1)/bin:$PATH"`
4. Palette: Navy #1E4D8C, Lime #4A7A25, Vol2 #E8941C, Vol3 #E54B3D, Muted #737373
5. 62 lesson paths INTOCCABILI, engine/ MAI

## ALGORITMO DI AUTO-ALLINEAMENTO

Prima di ogni ciclo, calcola:

```
SCORE_ATTUALE = risultato ultimo audit (o 6.8 se primo ciclo)
GAP = 8.5 - SCORE_ATTUALE
AREA_PEGGIORE = feature con score piu basso nell'ultimo audit
IMPATTO_PER_ORA = stima miglioramento/ora per ogni area
PRIORITA = ordina per IMPATTO_PER_ORA decrescente
```

Scegli le 3-5 task del ciclo dalla lista PRIORITA. Non lavorare su cose gia buone (>7.5).

---

## STRUTTURA SINGOLO CICLO (ripetere 4 volte)

### FASE 1: ANALISI (10 min)

```
/elab-quality-gate pre
```

1. Esegui quality gate completo (10 metriche)
2. Identifica le 3 aree con score piu basso
3. Leggi i file coinvolti PRIMA di modificarli
4. Scrivi piano del ciclo in TodoWrite (3-5 task specifiche)
5. Calcola score atteso dopo il ciclo

### FASE 2: ESECUZIONE (bulk del lavoro)

Usa questi plugin/skill quando applicabile:
- `/elab-quality-gate` — prima e dopo ogni ciclo
- `/quality-audit` — audit profondo delle aree modificate
- `superpowers:brainstorming` — PRIMA di ogni decisione di design
- `superpowers:test-driven-development` — scrivi test PRIMA del codice
- `superpowers:verification-before-completion` — verifica che ogni fix funzioni
- `superpowers:systematic-debugging` — per ogni bug trovato
- `superpowers:dispatching-parallel-agents` — lancia agenti paralleli per task indipendenti
- `frontend-design:frontend-design` — per miglioramenti UI/UX
- `design:design-critique` — per feedback strutturato su usabilita
- `design:accessibility-review` — WCAG audit
- `engineering:code-review` — review del codice scritto
- `engineering:testing-strategy` — strategia test per le nuove feature

Per ogni task:
1. Leggi il codice esistente (Read tool)
2. Scrivi test se applicabile (TDD)
3. Implementa il fix/feature
4. `npm run build` + `npx vitest run`
5. Verifica nel browser (preview_start + screenshot + console_logs)
6. Marca task come completata in TodoWrite

### FASE 3: VERIFICA COV (Chain of Verification)

Lancia 3 agenti paralleli:

**Agente 1 — Code Quality:**
```
Verifica che il codice scritto nel ciclo sia:
- Consistente con il resto della codebase
- Senza regressioni (tutti i test passano)
- Senza security issues
- Senza console.log o dead code
```

**Agente 2 — UX/Browser Test:**
```
Usa preview server per verificare:
- Tutte le modifiche sono visibili e funzionanti
- 0 console errors
- Touch targets ≥44px
- Layout OK a 1024x768
- Font ≥14px dove modificato
```

**Agente 3 — Feature Audit:**
```
Per ogni feature modificata in questo ciclo:
- Funziona con dati reali? (non mock)
- Funziona offline? (se applicabile)
- Funziona senza Supabase? (fallback)
- Linguaggio adatto a 8-14 anni?
Score 1-10 per ogni feature
```

### FASE 4: DEBUG SISTEMATICO (dopo ogni ciclo)

```
/elab-quality-gate post
```

1. Confronta score post con score pre
2. Se qualsiasi metrica e PEGGIORATA → fix immediato prima del ciclo successivo
3. Se un test e fallito → debug sistematico (non procedere al ciclo successivo)
4. Documenta: cosa ha funzionato, cosa no, lezioni apprese
5. Aggiorna score per l'algoritmo di auto-allineamento del ciclo successivo

```
SCORE_CICLO_N = media pesata delle metriche quality gate
DELTA = SCORE_CICLO_N - SCORE_CICLO_N-1
if DELTA < 0: ALLARME — regressione, non procedere
if DELTA < 0.2: il ciclo non ha prodotto valore sufficiente — cambia strategia
if DELTA >= 0.3: buon progresso, continuare
```

---

## I 4 CICLI — FOCUS AREAS

### CICLO 1: PRINCIPIO ZERO + SIMULATORE BELLEZZA
Focus: L'insegnante arriva alla LIM e deve dire "WOW".

Task candidate:
- Migliorare l'estetica del simulatore (ombre, transizioni, spacing)
- Arduino/Breadboard SVG piu realistici e nitidi
- Animazioni fluide sul LED glow, wire connections
- Welcome screen piu impattante
- Bottoni mode (Gia Montato/Passo Passo/Libero) piu chiari e belli
- Colori consistenti con la palette ELAB
- Responsive perfetto su 1024x768

### CICLO 2: SCRATCH + ARDUINO + COMPILER UX
Focus: Lo studente scrive codice e vede il risultato — esperienza fluida.

Task candidate:
- Scratch editor: undo/redo buttons visibili
- Warning cambio modo Scratch/Arduino
- Serial monitor UX migliorata
- Compilazione: progress indicator chiaro
- Errori: feedback visivo amichevole (non solo testo)
- Code editor: font size, theme, autocompletion migliorati
- Tempo compilazione percepito (skeleton loading, messaggi incoraggianti)

### CICLO 3: UNLIM VOCE + INTELLIGENZA
Focus: UNLIM deve essere il miglior tutor AI per bambini del mondo.

Task candidate:
- Risposte ancora piu brevi e socratiche (target 40-50 parole)
- Voce: migliorare la qualita TTS (velocita, tono)
- Mascotte: animazioni piu espressive (felice quando risponde bene, pensierosa quando elabora)
- Messaggi overlay posizionati VICINO al componente di cui si parla
- "Non so" celebration — quando lo studente dice "non so", UNLIM festeggia
- Prompt engineering migliorato per risposte piu pedagogiche
- Memoria sessione: "L'ultima volta abbiamo visto il LED, oggi proviamo il pulsante!"

### CICLO 4: DASHBOARD + GIOCHI + POLISH
Focus: L'insegnante ha il controllo, lo studente si diverte.

Task candidate:
- Dashboard: grafici piu belli (Recharts styling)
- Giochi: CircuitMiniature SVG per visualizzazione circuiti
- Nudge: feedback visivo quando il nudge e stato inviato
- Report tab: layout di stampa professionale
- Documentazione tab: contenuto UTILE (FAQ, guida rapida)
- GDPR tab: stato reale con Supabase
- Bundle optimization: lazy loading aggressivo

---

## DOPO I 4 CICLI: AUDIT BRUTALE FINALE

Esegui TUTTO questo in sequenza:

```
/elab-quality-gate full
```

Poi lancia l'audit multi-agente:

1. **Agente spec-auditor**: Verifica TUTTE le specifiche vs realta (13 feature areas)
2. **Agente dashboard-auditor**: Testa OGNI tab della dashboard (11 tab)
3. **Agente subsystems-auditor**: Testa Scratch + Compiler + Games
4. **Agente UX-auditor**: Test browser reale con Control Chrome su www.elabtutor.school

Test da eseguire su URL LIVE:
- Naviga tutti i volumi, apri 3+ esperimenti
- Clicca UNLIM toolbar → conta parole (<80)
- Apri mascotte → scrivi domanda da bambino → verifica risposta
- Cambia modo (Gia Montato/Passo Passo/Libero) 10 volte rapide → 0 crash
- Zoom 20 volte rapide → 0 crash
- Apri experiment picker → naviga capitoli
- Test LIM 1024x768 (resize)
- Test OGNI tab dashboard (se accessibile)
- Stress test: apri/chiudi lesson panel 20 volte
- Verifica 0 console errors

Poi verdetto finale:

```
SCORE FINALE = media pesata (verificata, non auto-assegnata)
DISTANZA DA PRODUZIONE = % lavoro rimanente
TOP 5 PROBLEMI RESIDUI = ordinati per impatto business
RACCOMANDAZIONE = "deployare" / "non deployare" / "deployare con riserva"
```

## ONESTA ASSOLUTA

Ricorda: i self-score precedenti erano inflati di 3-4 punti (8.6 auto vs 5.8 reale).
MAI auto-assegnare >7 senza verifica indipendente.
Se qualcosa non funziona, SCRIVILO. Non "quasi pronto" — o funziona o non funziona.
L'obiettivo e un prodotto REALE per scuole REALI con bambini REALI.

---END---
