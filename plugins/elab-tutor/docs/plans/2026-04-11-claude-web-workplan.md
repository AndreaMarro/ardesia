# Piano Lavoro Claude Code Web — 11 aprile 2026

> Riunione LUNEDÌ con Omaric + Giovanni Fagherazzi.
> NO DEMO. NO REGRESSIONI. Tutto deve funzionare con dati REALI.
> Metodo Agile: blocchi piccoli, audit dopo ogni blocco, documentazione continua.

## BASELINE

- Test: 2225 pass, 74 file
- Build: PASS (3005KB precache)
- Deploy: LIVE su elabtutor.school
- Chapter-map: integrato nella UI (4 riferimenti in ExperimentPicker)
- Bentornati flow: su branch `work/claude/bentornati-flow-VEhLp` (NON su main)
- Nanobot: DeepSeek primario (DEVE diventare Gemini)
- RAG: 246 chunk (target 1000+)
- Simulable labels: 14 esperimenti etichettati
- ScratchXml: 31 XML non testati in runtime
- BuildSteps: 92/92 ma non verificati vs volumi

## STRUMENTI DISPONIBILI

### Accesso File
- **Repo git**: push/pull su `github.com/AndreaMarro/elab-tutor`
- **Cartella volumi**: `/Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/`
  - `1 ELAB VOLUME UNO/` — PDF/immagini Vol1
  - `2 ELAB VOLUME DUE/` — PDF/immagini Vol2
  - `3 ELAB VOLUME TRE/` — PDF/immagini Vol3
  - `BOM KIT CON ELENCO COMPONENTI/` — lista componenti kit
- **File .env**: credenziali in root progetto

### Endpoint API
```
# Nanobot chat (AI tutor)
POST https://elab-galileo.onrender.com/tutor-chat
POST https://elab-galileo.onrender.com/chat (con immagini)
GET  https://elab-galileo.onrender.com/health

# Supabase Edge Functions
POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat
POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-diagnose
POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-hints
POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-tts

# Supabase DB
URL: https://vxvqalmxqtezvgiboxyv.supabase.co
Anon Key: in .env (VITE_SUPABASE_ANON_KEY)

# Compiler Arduino
POST https://n8n.srv1022317.hstgr.cloud/webhook/elab-compile
Body: {"code": "void setup(){} void loop(){}"}

# Brain VPS (Ollama, galileo-brain-v13)
http://72.60.129.50:11434

# Admin ELAB
#admin → password [REDACTED-MOVED-TO-ENV]
```

### Strumenti MCP (se disponibili)
- **Control Chrome**: per test su piattaforma reale (navigate, click, screenshot)
- **Playwright**: per E2E test automatici (`e2e/*.spec.js`)
- **WebSearch/WebFetch**: per ricerca

### Comandi
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
npx vitest run                    # Test (>=2225, 0 fail)
npm run build                     # Build
npx vercel --prod --yes           # Deploy
gh run list --limit 2             # CI status
gh pr create --title "..." --body "..."  # PR
```

### Skill disponibili
- `elab-quality-gate` — quality gate pre/post sessione
- `elab-rag-builder` — costruzione RAG dai volumi
- `elab-nanobot-test` — test endpoint nanobot
- `quality-audit` — audit qualità end-to-end
- `impersonatore-utente` — simula docente/studente
- `lim-simulator` — simula uso su LIM
- `analisi-simulatore` — analisi simulatore circuiti
- `volume-replication` — replica volumi nel simulatore

---

## PIANO: 6 BLOCCHI CON AUDIT CONTINUO

### BLOCCO 1: Merge Bentornati + Deploy (30 min)

**Obiettivo**: Il flusso "Bentornati" di Claude Web va su main e live.

**Steps**:
1. `git fetch --all && git pull origin main`
2. Cherry-pick SOLO i file necessari dal branch bentornati:
   - `src/components/lavagna/LavagnaShell.jsx` (il flusso)
   - `src/components/lavagna/LavagnaShell.module.css` (stili bentornati)
   - Test se presenti
3. NON prendere: .github/workflows/ (CI vecchio), copyright watermarks
4. Test: `npx vitest run` >= 2225, 0 fail
5. Build: `npm run build` PASS
6. Commit su branch `sprint/web-bentornati`, push, PR
7. Merge PR dopo CI verde
8. Deploy: `npx vercel --prod --yes`

**AUDIT dopo Blocco 1**:
```bash
npx vitest run                    # >= 2225
npm run build                     # PASS
curl -s https://www.elabtutor.school -o /dev/null -w "%{http_code}"  # 200
# Apri Chrome: vedi "Bentornati!" quando carichi il sito?
```

**DOC**: Scrivi `docs/sprint/B1-BENTORNATI-REPORT.md`

---

### BLOCCO 2: Espansione RAG (2h)

**Obiettivo**: UNLIM deve conoscere OGNI dettaglio dei volumi. Da 246 a 1000+ chunk.

**Steps**:
1. Usa skill `elab-rag-builder` se disponibile
2. Leggi i PDF/immagini in TRES JOLIE per ogni volume
3. Per ogni capitolo: estrai concetti, componenti, istruzioni montaggio, analogie
4. Crea chunk JSON strutturati per pgvector
5. Upload a Supabase (serve SUPABASE_ACCESS_TOKEN)

**Se non hai accesso a Supabase pgvector**: crea i chunk JSON localmente in `src/data/rag-chunks/` e documenta cosa manca per l'upload.

**AUDIT dopo Blocco 2**:
```bash
# Conta chunk
ls src/data/rag-chunks/*.json 2>/dev/null | wc -l  # target 1000+
# Testa onniscienza UNLIM
curl -s -X POST "https://elab-galileo.onrender.com/tutor-chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"Spiega cosa succede nel capitolo 7 del volume 1","experimentId":"v1-cap7-esp1","sessionId":"rag-test"}'
```

**DOC**: Scrivi `docs/sprint/B2-RAG-REPORT.md`

---

### BLOCCO 3: Validazione ScratchXml + BuildSteps vs Volumi (1.5h)

**Obiettivo**: Verificare che i dati nel codice corrispondano ai volumi reali.

**Steps**:
1. Leggi i PDF dei volumi da TRES JOLIE
2. Per ALMENO 20 esperimenti: confronta buildSteps nel codice con istruzioni nel libro
3. Per ALMENO 10 scratchXml: verifica che i blocchi Blockly funzionino
4. Scrivi test per ogni validazione
5. Documenta discrepanze

**AUDIT dopo Blocco 3**:
```bash
npx vitest run  # >= 2225 + nuovi test
# Report discrepanze scritto
```

**DOC**: Scrivi `docs/sprint/B3-VALIDATION-REPORT.md`

---

### BLOCCO 4: Test E2E su Chrome Reale (1h)

**Obiettivo**: Nessuno ha MAI aperto Chrome per testare il prodotto reale.

**Steps** (usa Control Chrome MCP o Playwright):
1. Apri https://www.elabtutor.school
2. Verifica: homepage carica in <3s
3. Verifica: i 3 volumi sono visibili
4. Verifica: i titoli Tea sono mostrati (Cap 2 non Cap 6)
5. Seleziona esperimento v1-cap6-esp1
6. Verifica: simulatore carica, breadboard visibile
7. Verifica: buildSteps funzionano (se UI lo supporta)
8. Verifica: UNLIM risponde a una domanda
9. Screenshot di ogni step

**AUDIT dopo Blocco 4**:
```bash
# Screenshot salvati in docs/sprint/screenshots/
# Report scritto con problemi trovati
```

**DOC**: Scrivi `docs/sprint/B4-CHROME-AUDIT.md` con screenshot

---

### BLOCCO 5: Test UNLIM Onniscienza — 30 Domande (45 min)

**Obiettivo**: UNLIM deve sapere rispondere su OGNI esperimento.

**Steps**:
1. Invia 30 domande reali al nanobot (10 per volume)
2. Per ogni risposta valuta: corretta? linguaggio kid-friendly? inventa?
3. Documenta risposte con score

**Domande** (già preparate in CLAUDE-WEB-SESSION-2.md):
```bash
curl -s -X POST "https://elab-galileo.onrender.com/tutor-chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"[DOMANDA]","experimentId":"[ID]","sessionId":"test-30q"}'
```

**AUDIT dopo Blocco 5**:
```bash
# Score X/30 nel report
```

**DOC**: Scrivi `docs/sprint/B5-UNLIM-30-DOMANDE.md`

---

### BLOCCO 6: Scrivi 200+ Test + COV (continuo)

**Obiettivo**: Da 2225 a 2400+ test. Coverage documentation.

**Steps**:
1. Test per flusso bentornati (dopo merge blocco 1)
2. Test per RAG chunk validation
3. Test per buildSteps vs volumi
4. Test per scratchXml runtime
5. Test E2E Playwright aggiuntivi
6. Coverage report: `npx vitest run --coverage`

**AUDIT dopo Blocco 6**:
```bash
npx vitest run          # >= 2400
npm run build           # PASS
npx vitest run --coverage  # report
```

**DOC**: Scrivi `docs/sprint/B6-TEST-COV-REPORT.md`

---

## METODO AGILE

### Sprint Board (aggiorna dopo ogni blocco)

Aggiorna `docs/sprint/S2-PROGRESS.md` con:
```
## Blocco N — [ORA]
- Status: [IN_PROGRESS/DONE/BLOCKED]
- Test prima: [N]
- Test dopo: [N]
- Build: [PASS/FAIL]
- Problemi trovati: [lista]
- Doc creata: [filename]
```

### Definition of Done per ogni blocco
1. Test >= baseline (mai meno del blocco precedente)
2. Build PASS
3. DOC scritta in docs/sprint/
4. Nessun file proibito toccato (.env, vite.config.js, package.json)
5. Prova oggettiva (screenshot, curl output, test count)

### COV (Chain of Verification)
Dopo ogni blocco:
1. `npx vitest run` → count e 0 fail
2. `npm run build` → PASS
3. Verifica Chrome SE possibile
4. git diff → solo file previsti modificati
5. Documenta nel report del blocco

---

## REGOLE FERREE

1. **SEMPRE su branch** — mai push su main
2. **git pull prima di ogni commit** — evita conflitti
3. **Test >= 2225 dopo OGNI modifica** — se scende, STOP e fix
4. **Prova oggettiva** — niente è "fatto" senza evidenza
5. **NO REGRESSIONI** — mai, per nessun motivo
6. **Principio Zero** — ogni riga serve il docente che arriva e insegna
7. **Linguaggio UNLIM** — 10-14 anni, analogie quotidiane, italiano semplice
8. **Documenta TUTTO** — report per ogni blocco in docs/sprint/

---

## FILE CHE PUOI TOCCARE

- `src/components/lavagna/LavagnaShell.jsx` (flusso bentornati)
- `src/components/lavagna/LavagnaShell.module.css`
- `src/data/rag-chunks/` (NUOVO — chunk RAG)
- `src/data/unlim-knowledge-base.js` (arricchimento)
- `tests/` (nuovi test)
- `e2e/` (nuovi E2E)
- `docs/sprint/` (report)

## FILE CHE NON DEVI TOCCARE

- `src/components/lavagna/ExperimentPicker.jsx` (chapter-map già integrato)
- `src/components/VetrinaSimulatore.jsx` (già aggiornato)
- `src/data/experiments-vol*.js` (buildSteps/scratchXml già fatti)
- `.github/workflows/*` (CI fix già applicato — NON sovrascrivere)
- `vite.config.js`
- `package.json`
- `.env`
