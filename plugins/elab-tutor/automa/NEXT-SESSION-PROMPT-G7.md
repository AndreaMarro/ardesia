# SESSIONE G7 — VOL 2+3 COMPLETI CON AGENTI PARALLELI

```
cd "VOLUME 3/PRODOTTO/elab-builder"

SEI ELAB-TUTOR-LOOP-MASTER. Giorno 7.

## ARCHITETTURA SESSIONE: TEAM ORCHESTRATO + EVALUATOR

Questa sessione usa il pattern "Generator-Evaluator" da Anthropic Engineering con AGENT TEAMS:
- 3-4 AGENTI GENERATORI in parallelo (worktree isolation)
- 1 LEAD/EVALUATORE (tu, Opus) orchestra, valida con test oracle, merge
- File-based handoff: brief strutturato con schema + dati + vocabolario per ogni agente
- Usa `superpowers:dispatching-parallel-agents` per orchestrazione

### Strategia: combinare TUTTI gli strumenti
1. **Agent tool con subagent paralleli** → 3-4 agenti Sonnet scrivono JSON simultaneamente
2. **Preview tools** → verifica browser post-merge (LessonPathPanel renderizza?)
3. **Vercel deploy MCP** → deploy senza CLI a fine sessione
4. **feature-dev:code-explorer** → se serve capire come index.js o LessonPathPanel funzionano
5. **quality-audit** skill → check WCAG/fonts se tempo rimane

### Regole Agent Teams (da 30 Tips + Anthropic Harness Design)
- Max 3-5 agenti, 5-6 file per agente
- DOMAIN ISOLATION: ogni agente scrive FILE DIVERSI, zero overlap
- START READ-ONLY: Blocco 0 esplora dati, Blocco 1+ genera
- REQUIRE PLAN: ogni agente deve dichiarare il piano prima di scrivere
- MAI auto-valutazione: il lead valida con vocab check + build
- MONITOR: controlla output intermedio, non lanciare e dimenticare
- LOG FAILED APPROACHES: se qualcosa fallisce, scrivi PERCHÉ nel PROGRESS

## STATO VERIFICATO (fine G6 — CoV 14/14 PASS)
- Vol 1: 38/38 COMPLETO ✅
- Vol 2: 0/18 — da fare oggi
- Vol 3: 0/11 — da fare oggi
- Build: Exit 0 | Deploy: HTTP 200 | Vocab: 0 violations

## CONTESTO IMMUTABILE
- Giovanni Fagherazzi = ex Global Sales Director ARDUINO
- PNRR deadline 30/06/2026
- Andrea Marro = UNICO sviluppatore
- NON toccare: CircuitSolver, AVRBridge, evaluate.py, checks.py
- Palette: Navy #1E4D8C, Lime #558B2F

## REGOLE DA ANTHROPIC ENGINEERING (verificate G5-G6 + nuove)

### Pattern confermati (G5-G6)
1. PROGRESS FILE dopo ogni blocco — sopravvive alla compressione
2. CoV intermedia build+vocab+count
3. RALPH LOOP: "Ho DAVVERO finito? Il count è giusto?"
4. Test oracle PRIMA di commit
5. COMMIT OGNI 4-5 FILE

### Pattern nuovi (da ricerca G6)
6. GENERATOR-EVALUATOR SPLIT — i subagenti generano, tu validi. Mai auto-valutazione.
7. FILE-BASED HANDOFF — ogni subagente riceve un prompt strutturato con:
   - Schema JSON (dal template v1-cap14-esp1.json)
   - Dati esperimento (dal grep di experiments-vol*.js)
   - Vocabolario capitolo (allowed/forbidden)
   - NON riceve: tutto il contesto del progetto (context bloat)
8. WORKTREE ISOLATION — ogni subagente scrive in directory isolata
9. DOMAIN ISOLATION — nessun subagente tocca lo stesso file di un altro
10. START READ-ONLY — prima leggi experiments-vol2.js e vol3.js, poi genera
11. LOG FAILED APPROACHES — se qualcosa fallisce, scrivi PERCHÉ nel PROGRESS
12. CHANGELOG come persistent memory — il PROGRESS file È il changelog

### Anti-pattern (verificati)
- ❌ Subagenti che si auto-valutano → bias sistematico
- ❌ Spec troppo dettagliate → errori a cascata. Dai schema + esempio, non istruzioni riga per riga
- ❌ 20+ task per agente → max 5-6 file per subagente
- ❌ Lanciare agenti senza aver letto i dati prima (read-only FIRST)
- ❌ Context bloat: dare 2000 righe di contesto a ogni subagente

## PIANO — 5 BLOCCHI

### BLOCCO 0: READ-ONLY EXPLORATION (10 min)
Prima di generare QUALSIASI cosa:
1. `grep "id:" src/data/experiments-vol2.js` → lista esperimenti Vol 2
2. `grep "id:" src/data/experiments-vol3.js` → lista esperimenti Vol 3
3. Contare capitoli e esperimenti REALI
4. Leggere 2-3 esperimenti per volume per capire components/connections
5. Definire vocabolario per ogni capitolo
6. Salvare tutto in un file HANDOFF per i subagenti: `automa/G7-AGENT-BRIEF.md`

OUTPUT: G7-AGENT-BRIEF.md con:
- Lista completa esperimenti Vol 2 (ID, titolo, chapter, components)
- Lista completa esperimenti Vol 3
- Vocabolario per capitolo
- Schema JSON (copiato da v1-cap14-esp1.json)

### BLOCCO 1: VOL 2 — PARALLEL GENERATION (~20 min)

Lancia 3 subagenti in parallelo:
```
Agent A (sonnet) → primi 6 file Vol 2 (cap 15-16 o equivalenti)
Agent B (sonnet) → secondi 6 file Vol 2
Agent C (sonnet) → ultimi 6 file Vol 2
```

Ogni subagente riceve:
- Il brief da G7-AGENT-BRIEF.md (solo la sezione rilevante)
- Il template JSON
- Il vocabolario del capitolo
- L'istruzione: "Scrivi N file JSON in src/data/lesson-paths/"

REGOLA: ogni agente scrive FILE DIVERSI. Zero overlap.

### BLOCCO 2: VOL 2 — CoV LAYER 1 (per-agent) + MERGE (~10 min)

#### CoV Layer 1: Validazione per-agente (dopo ogni agente completa)
Per OGNI agente, prima di accettare il risultato:
| Check | Comando | Pass |
|-------|---------|------|
| File esistono | `ls src/data/lesson-paths/v2-cap*.json \| wc -l` | N atteso |
| JSON valido | `python3 -c "import json; [json.load(open(f)) for f in glob.glob('...')]"` | 0 errori |
| Schema coerente | Tutte le 16 chiavi top-level presenti | ✅ |
| Vocab per-file | Script vocab check solo sui file dell'agente | 0 violations |

Se un agente fallisce Layer 1 → FIX immediato o ri-genera quel batch.

#### CoV Layer 2: Integrazione Vol 2
1. Aggiorna index.js con TUTTI i nuovi import Vol 2
2. `npm run build` — DEVE passare
3. Vocab check GLOBALE su tutti i 38+N file
4. `grep "^import" index.js | wc -l` = 38 + N_vol2
5. PROGRESS update con numeri reali

Se Layer 2 fallisce → fix PRIMA di andare a Vol 3.

### BLOCCO 3: VOL 3 — PARALLEL GENERATION + CoV Layer 1-2 (~20 min)

Stesso pattern per Vol 3 (11 file):
```
Agent D (sonnet) → primi 5-6 file Vol 3
Agent E (sonnet) → ultimi 5-6 file Vol 3
```

CoV Layer 1 per-agente, poi CoV Layer 2 integrazione.
Import count dopo Layer 2 = 67.

### BLOCCO 4: CoV LAYER 3 — BROWSER DEV (Preview Tools) (~10 min)

Test su DEV SERVER locale con Preview Tools (come in G6):

1. `preview_start` → avvia dev server
2. Testa 4 esperimenti campione:
   - 1 Vol 1 (regressione): v1-cap6-esp1
   - 1 Vol 2 (nuovo): esperimento a metà volume
   - 1 Vol 3 (nuovo): esperimento Arduino
   - 1 nuovo cap 11-14 (G6): v1-cap12-esp1
3. Per OGNI esperimento:
   a. `preview_eval` → naviga all'esperimento (loadExperiment via __ELAB_API)
   b. `preview_eval` → apri LessonPathPanel (click bottone Percorso Lezione)
   c. `preview_eval` → verifica 5 fasi (PREPARA/MOSTRA/CHIEDI/OSSERVA/CONCLUDI)
   d. `preview_eval` → verifica contenuto specifico (titolo, keywords)
   e. `preview_console_logs level=error` → 0 errori critici
   f. `preview_snapshot` → struttura DOM completa
   g. `preview_screenshot` → evidenza visuale salvata

Se Layer 3 fallisce → fix PRIMA di deploy.

### BLOCCO 5: DEPLOY + CoV LAYER 4 — BROWSER PROD (Chrome MCP) (~10 min)

#### Deploy
1. `npm run build` → Exit 0
2. Deploy Vercel: `npx vercel --prod --yes` OPPURE MCP `mcp__57ae1081...deploy_to_vercel`
3. `curl -s -o /dev/null -w "%{http_code}" https://www.elabtutor.school` = 200

#### CoV Layer 4: Test sul SITO REALE DEPLOYATO (Chrome MCP)
Test sulla versione PRODUCTION, non dev — conferma che il deploy funziona:

1. `mcp__Claude_in_Chrome__tabs_context_mcp` → ottieni tab group
2. `mcp__Claude_in_Chrome__navigate` → https://www.elabtutor.school/#tutor
3. `mcp__Claude_in_Chrome__computer(screenshot)` → evidenza sito LIVE
4. `mcp__Claude_in_Chrome__javascript_tool` → naviga a esperimento Vol 2
5. `mcp__Claude_in_Chrome__read_page` → verifica LessonPathPanel nel DOM reale
6. `mcp__Claude_in_Chrome__computer(screenshot)` → screenshot PRODUZIONE
7. `mcp__Claude_in_Chrome__read_console_messages` → errori runtime reali

OPPURE via Control Chrome (alternativa):
1. `mcp__Control_Chrome__open_url` → elabtutor.school/#tutor
2. `mcp__Control_Chrome__execute_javascript` → test esperimento
3. `mcp__Control_Chrome__get_page_content` → verifica contenuto

#### CoV Layer 5: Firecrawl/WebFetch — Verifica contenuto servito
Conferma che il sito serve i dati corretti a un crawler esterno:

1. `WebFetch` URL=https://www.elabtutor.school → verifica che risponde, no errori 5xx
2. `mcp__57ae1081...web_fetch_vercel_url` → fetch autenticato Vercel se necessario

### BLOCCO 6: CoV LAYER 6 — TABELLA FINALE + RALPH LOOP

#### Tabella finale (18 verifiche — 6 layer)
| # | Layer | Verifica | Tool | Atteso |
|---|-------|----------|------|--------|
| V1 | L2 | Build | `npm run build` | Exit 0 |
| V2 | L2 | Import count | `grep "^import" index.js` | 67 |
| V3 | L4 | Deploy HTTP | `curl elabtutor.school` | 200 |
| V4 | L2 | Cap count Vol 1 | grep per cap 6-14 | 3,6,5,9,6,2,4,2,1 |
| V5 | L2 | Cap count Vol 2 | grep per capitoli | numeri reali |
| V6 | L2 | Cap count Vol 3 | grep per capitoli | numeri reali |
| V7 | L1 | Vocab check | Script Python | 0 violations |
| V8 | L1 | JSON valido | Script Python parse | 0 errori |
| V9 | L1 | JSON schema | Script Python | 67 file, stesse chiavi |
| V10 | L3 | Browser DEV: fasi | preview_eval | 5/5 per 4 exp |
| V11 | L3 | Browser DEV: console | preview_console_logs | 0 errori critici |
| V12 | L3 | Browser DEV: screenshot | preview_screenshot | 4 immagini |
| V13 | L4 | Browser PROD: navigate | Chrome MCP navigate | pagina carica |
| V14 | L4 | Browser PROD: content | Chrome MCP read_page | LessonPath nel DOM |
| V15 | L4 | Browser PROD: screenshot | Chrome MCP screenshot | evidenza LIVE |
| V16 | L5 | WebFetch: risposta | WebFetch elabtutor.school | HTTP 200, no 5xx |
| V17 | L2 | Git log | `git log --oneline -5` | feat commits |
| V18 | L6 | RALPH LOOP | "Ho DAVVERO finito?" | Sì, con evidenza per ogni layer |

Se anche UNA verifica fallisce → fix PRIMA di dichiarare successo.

### BLOCCO 7: HANDOFF + DOCUMENTATION

## SPRINT CONTRACT G7

### Definizione di DONE (hard threshold — 6 layer CoV)
- **Layer 1** (per-agente): JSON valido + vocab 0 + schema ok per ogni batch
- **Layer 2** (integrazione): Build Exit 0 + import 67 + vocab globale 0
- **Layer 3** (browser DEV): preview 4/4 pass + 0 errori console + 4 screenshot
- **Layer 4** (browser PROD): Chrome MCP su sito LIVE + screenshot produzione
- **Layer 5** (crawler): WebFetch conferma sito risponde correttamente
- **Layer 6** (meta): Ralph Loop + tabella 18/18 PASS
- Se anche UNA condizione fallisce → fix PRIMA di dichiarare successo

## STRUMENTI DISPONIBILI — MAPPA COMPLETA

### Generazione (BLOCCO 1-3)
| Tool | Uso |
|------|-----|
| Agent (subagent_type=general-purpose, model=sonnet) | Generare batch di JSON in parallelo |
| Write | Scrivere i file JSON |
| Edit | Modificare index.js |
| Grep/Glob | Cercare dati in experiments-vol*.js |

### Verifica DEV (BLOCCO 4 — Layer 3)
| Tool | Uso |
|------|-----|
| preview_start | Avvia dev server |
| preview_eval | Naviga a esperimento, apri panel, verifica contenuto |
| preview_snapshot | DOM accessibility tree |
| preview_screenshot | Screenshot evidenza |
| preview_console_logs | Errori console |
| preview_click | Click su elementi |
| preview_inspect | Verifica CSS specifici |
| preview_network | Verifica network requests |

### Verifica PROD (BLOCCO 5 — Layer 4)
| Tool | Uso |
|------|-----|
| mcp__Claude_in_Chrome__tabs_context_mcp | Ottieni tab group |
| mcp__Claude_in_Chrome__navigate | Apri URL sito LIVE |
| mcp__Claude_in_Chrome__computer(screenshot) | Screenshot PRODUZIONE |
| mcp__Claude_in_Chrome__javascript_tool | Esegui JS sul sito LIVE |
| mcp__Claude_in_Chrome__read_page | Leggi DOM reale |
| mcp__Claude_in_Chrome__find | Trova elementi per testo |
| mcp__Claude_in_Chrome__read_console_messages | Errori runtime PROD |
| mcp__Claude_in_Chrome__gif_creator | GIF demo per Giovanni |

### Verifica CRAWLER (BLOCCO 5 — Layer 5)
| Tool | Uso |
|------|-----|
| WebFetch | Fetch pagina come crawler |
| mcp__57ae1081...web_fetch_vercel_url | Fetch Vercel autenticato |

### Alternativa Chrome
| Tool | Uso |
|------|-----|
| mcp__Control_Chrome__open_url | Apri URL |
| mcp__Control_Chrome__execute_javascript | Esegui JS |
| mcp__Control_Chrome__get_page_content | Contenuto pagina |

## SUBAGENT PROMPT TEMPLATE

Ogni subagente riceve questo prompt (personalizzato con i suoi file):

```
Sei un generatore di lesson path JSON per ELAB Tutor.
Scrivi ESATTAMENTE N file JSON nella directory src/data/lesson-paths/.

SCHEMA: [copiato da G7-AGENT-BRIEF.md]
DATI ESPERIMENTO: [copiati da G7-AGENT-BRIEF.md per i suoi capitoli]
VOCABOLARIO: [allowed/forbidden per capitolo]

REGOLE:
1. Ogni file ha 5 fasi: PREPARA, MOSTRA, CHIEDI, OSSERVA, CONCLUDI
2. build_circuit.intent.components e .wires copiati ESATTI da experiments-vol*.js
3. Vocabolario: le parole forbidden NON devono apparire fuori dalla sezione vocabulary
4. Target: bambini 10-14 anni, linguaggio semplice
5. Analogie: genera dal concept + unlimPrompt dell'esperimento
6. Dopo aver scritto, verifica mentalmente il vocabolario

FILE DA SCRIVERE:
- src/data/lesson-paths/v2-cap15-esp1.json
- src/data/lesson-paths/v2-cap15-esp2.json
- [etc.]
```

## REFERENCE
- Build: `export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH" && npm run build`
- Deploy: `export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH" && npx vercel --prod --yes`
- Template: src/data/lesson-paths/v1-cap14-esp1.json
- Browser: preview_start → preview_eval → preview_screenshot
```
