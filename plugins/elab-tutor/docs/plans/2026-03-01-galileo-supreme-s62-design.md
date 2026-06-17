# GALILEO SUPREME — Session 62 Design Document
## Mega-Prompt Universale: Analisi + 200 Test + Debug Massivo
### (c) Andrea Marro — 01/03/2026

---

## 1. Obiettivo

Creare un **prompt monolitico universale** (~3000 parole) che:
1. Analizza l'architettura nanobot e propone modifiche
2. Esegue 200 test categorizzati (70% MCP / 30% Chrome) con Ralph Loop
3. Applica auto-prompt-engineering su nanobot.yml ad ogni fix
4. Debug massivo di tutte le funzionalita ELAB Tutor
5. Genera report finale con scorecard
6. Funziona in Claude Code, Antigravity, qualsiasi LLM

## 2. Architettura Prompt — 7 Blocchi

### BLOCCO 0: IDENTITA + REGOLE D'INGAGGIO
- Chi sei: Claude Code agent per ELAB Tutor Session 62
- Regole non negoziabili: onesta radicale, deploy obbligatorio dopo fix, Chain of Verification
- Contesto: path progetto, deploy commands, test accounts
- Strumenti: MCP Chrome tools, Claude Code tools, nanobot API, Vercel/Render deploy

### BLOCCO 1: ANALISI ARCHITETTURALE NANOBOT
- Leggi: server.py, nanobot.yml, prompts/*.yml, memory.py
- Identifica: gap nel system_prompt, specialist routing bugs, missing patterns
- Proponi: modifiche architetturali se necessarie
- Output: lista gap + proposte fix (max 5 modifiche architetturali)

### BLOCCO 2: AUTO-PROMPT-ENGINEERING
- Framework ciclico: TEST → FAIL → DIAGNOSI → FIX → REGOLA → VALIDATE → DEPLOY
- Ogni fix genera una nuova regola/checklist in nanobot.yml
- Le regole sono cumulative: nanobot.yml diventa piu robusto ad ogni iterazione
- Internal prompt engineering: per ogni fix, genera la regola in formato nanobot-compatible
- Deploy pipeline: nanobot changes → git push Render | frontend changes → npm build + vercel

### BLOCCO 3: 200 TEST CHROME (7:3 MCP:Chrome)
14 categorie, 200 quesiti totali:

| Cat | Nome | Q | MCP | Chrome |
|-----|------|---|-----|--------|
| C1 | Posizionamento componenti | 18 | 12 | 6 |
| C2 | Visualizzazione spaziale incrociata | 14 | 10 | 4 |
| C3 | Circuiti complessi breadboard | 20 | 14 | 6 |
| C4 | Selezione/highlight componenti | 12 | 8 | 4 |
| C5 | Eliminazione componenti | 10 | 7 | 3 |
| C6 | Montaggio esperimento + modifica | 18 | 12 | 6 |
| C7 | Esperimenti Arduino (Vol3) | 16 | 11 | 5 |
| C8 | Codice Arduino | 14 | 10 | 4 |
| C9 | Comprensione contesto/schermata | 16 | 11 | 5 |
| C10 | Frasi + selezioni contestuali | 12 | 8 | 4 |
| C11 | Diagnosi circuiti | 14 | 10 | 4 |
| C12 | Navigazione + UI | 10 | 7 | 3 |
| C13 | Off-topic + safety | 8 | 6 | 2 |
| C14 | Vision + Canvas | 18 | 14 | 4 |
| | TOTALE | 200 | 140 | 60 |

Protocollo test MCP (70%):
- Invia messaggio a nanobot /chat via function call
- Verifica risposta: testo coerente + tag [AZIONE:...] presenti + corretti
- Score: PASS / PARTIAL / FAIL

Protocollo test Chrome (30%):
- Naviga a elabtutor.school in Chrome
- Digita messaggio in chat Galileo
- Verifica visivamente: azione eseguita? UI corretta? Componente visibile?
- Screenshot di conferma

### BLOCCO 4: DEBUG MASSIVO POST-TEST
Audit sistematico di tutte le funzionalita:
- Auth: login flow, token refresh, license check, route guards
- Simulatore: render 69 esperimenti, circuit solver, collision, SVG components
- Chat Galileo: sendChat, tryNanobot, action parsing, repair loop, vision
- Giochi: Detective, POE, Reverse Engineering, Circuit Review
- UI/Responsive: touch targets 44px, focus states, mobile
- Build: 0 errors, bundle sizes, code splitting

### BLOCCO 5: RAG/APPRENDIMENTO EVOLUTO
Migliorie a memory.py + patterns.json:
- Session summaries: salva riassunto dopo ogni sessione
- Pattern injection: inietta pattern rilevanti prima di rispondere
- Learning signals: errori ripetuti → adatta risposte future
- Context enrichment: build_specialist_context piu intelligente

### BLOCCO 6: REPORT + DELIVERABLES
- Report markdown con scorecard per categoria
- Score totale aggiornato
- Lista fix applicati con commit hash
- Nuove regole aggiunte a nanobot.yml
- Confronto pre/post per ogni area
- Deploy finale confermato

## 3. Proporzione 7:3 MCP:Chrome

Motivazione:
- MCP (programmatic): piu veloce, deterministic, batch-testable, 140 test
- Chrome (visual): verifica end-to-end reale, 60 test
- Ogni categoria Chrome verifica che il corrispettivo MCP funzioni anche visivamente
- Chrome tests are GOLD STANDARD: se passa Chrome, passa tutto

## 4. Auto-Prompt-Engineering Internal

Quando un test FAIL:
1. ROOT CAUSE: nanobot.yml? server.py? frontend? specialist prompt?
2. FIX: applica la correzione
3. GENERATE RULE: crea nuova regola in formato nanobot.yml
   Esempio: se Galileo non include [AZIONE:play] quando dice "avvio la simulazione"
   → Nuova checklist: "Se nel testo dici 'avvio/lancio/parto' → c'e [AZIONE:play]?"
4. INJECT: aggiungi la regola nella sezione appropriata di nanobot.yml
5. DEPLOY: git push (nanobot) o vercel --prod (frontend)
6. RETEST: ri-esegui il test fallito

## 5. Compatibilita Antigravity

Il prompt e auto-contenuto:
- Tutta la documentazione e inline (no file references)
- I path sono generici ("il progetto ELAB Tutor")
- Le istruzioni tool-specific hanno fallback testuale
- In Antigravity: l'utente incolla il prompt + descrive i risultati
- In Claude Code: esecuzione automatica con tool calls

## 6. Deliverables

1. **Stringa prompt** copiabile (fornita in chat)
2. **Design doc** (questo file)
3. **Report sessione** (generato durante esecuzione)
4. **nanobot.yml aggiornato** (con nuove regole auto-generate)
5. **MEMORY.md aggiornato** (con score finali)
