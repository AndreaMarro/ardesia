# SESSIONE GIORNO 5 — SESSIONE LUNGA: COMPLETARE VOL 1 CAP 6-10

```
cd "VOLUME 3/PRODOTTO/elab-builder"

SEI ELAB-TUTOR-LOOP-MASTER. Giorno 5 del piano 2 settimane.

## ⚠️ QUESTA È UNA SESSIONE LUNGA — LEGGI PRIMA QUESTE REGOLE

Questa sessione è progettata per durare e produrre il massimo risultato.
Le regole vengono da Anthropic Engineering ("Harness Design for Long-Running Apps",
"Building a C Compiler", "Long-Running Claude") — pattern testati su sessioni 6+ ore.

### REGOLE SESSIONE LUNGA
1. **COMMIT OGNI 5 FILE** — non accumulare. Git è il tuo checkpoint system.
2. **PROGRESS FILE** — aggiorna `automa/PROGRESS-G5.md` dopo OGNI blocco. Scrivi: cosa fatto, cosa manca, problemi trovati. Questo sopravvive alla compressione del contesto.
3. **CoV INTERMEDIA** — dopo ogni capitolo completato (8, 9, 10), fai mini-CoV (build + vocab check + count). Non aspettare la fine.
4. **RALPH LOOP** — dopo ogni blocco chiediti: "Ho DAVVERO finito questo blocco? Il count è giusto? Il build passa?" Se no, continua prima di andare avanti.
5. **TEST ORACLE** — i due script Python (vocab check + circuit data match) sono i tuoi test. Eseguili PRIMA di ogni commit, non dopo.
6. **SE IL BUILD FALLISCE** — fix SUBITO. Non andare avanti con un build rotto. Pivot: rileggi l'errore, fix, rebuild, poi continua.
7. **ONESTÀ** — se un lesson path è dubbio (dati esperimento ambigui, vocabolario incerto), segnalo nel PROGRESS file. Non inventare.

## STATO VERIFICATO (27/03/2026 fine G4)
- Build: ✅ PASSA (26s)
- Deploy: ✅ HTTP 200 su elabtutor.school — commit 6b7c553
- Lesson paths: 13/67 totali, 13/38 Volume 1
  - Cap 6: ✅ COMPLETO (3/3: esp1, esp2, esp3)
  - Cap 7: ✅ COMPLETO (6/6: esp1-esp6)
  - Cap 8: 2/5 (esp1, esp2 fatti — mancano esp3, esp4, esp5)
  - Cap 9: 1/9 (esp1 fatto — mancano esp2-esp9)
  - Cap 10: 1/6 (esp1 fatto — mancano esp2-esp6)
- Bug critici: 0
- Vocab check automatico: 0 violazioni reali (4 meta "NON dire X")
- JSON schema: tutte 16 chiavi consistenti across 13 file
- Circuit data match: 100% (intent = experiments-vol1.js)

## CONTESTO IMMUTABILE
- Giovanni Fagherazzi = ex Global Sales Director ARDUINO
- PNRR deadline 30/06/2026 — 93 giorni
- ELAB Tutor + kit + volumi = STESSO PRODOTTO
- Palette: Navy #1E4D8C, Lime #558B2F
- NON toccare: CircuitSolver, AVRBridge, evaluate.py, checks.py
- Visione UNLIM: mascotte contestuale, messaggi overlay, sessioni salvate
  (dettagli in automa/context/UNLIM-VISION-COMPLETE.md — NON rileggere, solo riferimento)

## SPRINT CONTRACT (pattern Anthropic "Harness Design")

### Deliverable
- 16 lesson paths nuovi → cap 8-10 COMPLETI
- Da 13 a 29 lesson paths totali
- Vol 1 capitoli 6-10 = 100% copertura (29/29 esperimenti)

### Definizione di DONE (hard threshold)
- `grep "import" src/data/lesson-paths/index.js | wc -l` = 29
- `npm run build` = Exit 0
- Vocab check Python = 0 violazioni reali
- Circuit data match = 0 mismatch
- Deploy Vercel = HTTP 200

### Se anche UNA condizione fallisce → NON dichiarare successo. Fix prima.

## PIANO — 5 BLOCCHI CON CoV INTERMEDIA

### BLOCCO 1: CAP 8 (3 lesson paths) — ~25 min

| # | ID | Titolo | Note chiave |
|---|---|--------|-------------|
| 1 | v1-cap8-esp3 | RGB + pulsante = viola | Combo cap7 (RGB) + cap8 (pulsante) |
| 2 | v1-cap8-esp4 | 3 pulsanti → 3 colori RGB | 3 pulsanti separati, circuito complesso |
| 3 | v1-cap8-esp5 | Mix avanzato con resistori diversi | Resistori misti + pulsanti |

**Dopo il blocco**:
1. Run vocab check → 0 violazioni
2. Run circuit data match → 0 mismatch
3. `npm run build` → Exit 0
4. `git add + commit` (feat: cap8 completo)
5. Aggiorna PROGRESS-G5.md
6. **RALPH CHECK**: `grep "v1-cap8" src/data/lesson-paths/index.js | wc -l` = 5? Se no, cosa manca?

### BLOCCO 2: CAP 9 prima metà (4 lesson paths) — ~35 min

| # | ID | Titolo | Note chiave |
|---|---|--------|-------------|
| 4 | v1-cap9-esp2 | Inverti la rotazione | Pot al contrario |
| 5 | v1-cap9-esp3 | LED di colore diverso con pot | Pot + LED colorato |
| 6 | v1-cap9-esp4 | Dimmer RGB azzurrino | Pot regola RGB |
| 7 | v1-cap9-esp5 | Pot miscelatore blu rosso | Pot sceglie tra R e B |

**Dopo il blocco**:
1. Vocab check → 0
2. Build → Exit 0
3. Commit (feat: cap9 esp2-5)
4. Aggiorna PROGRESS-G5.md
5. **RALPH CHECK**: count in index.js ora = 20?

### BLOCCO 3: CAP 9 seconda metà (4 lesson paths) — ~35 min

| # | ID | Titolo | Note chiave |
|---|---|--------|-------------|
| 8 | v1-cap9-esp6 | Lampada RGB con 3 pot | 3 pot × 3 canali, circuito più grande |
| 9 | v1-cap9-esp7 | Sfida: aggiungi pulsanti alla lampada | Pot + pulsanti combo |
| 10 | v1-cap9-esp8 | Sfida: combina esp 5+6 | Combinazione di due esperimenti |
| 11 | v1-cap9-esp9 | Sfida: aggiungi pulsante all'esp 8 | Combo avanzata |

**Dopo il blocco**:
1. Vocab check → 0
2. Build → Exit 0
3. Commit (feat: cap9 completo esp6-9)
4. Aggiorna PROGRESS-G5.md
5. **RALPH CHECK**: `grep "v1-cap9" index.js | wc -l` = 9? Cap 9 COMPLETO?

### BLOCCO 4: CAP 10 (5 lesson paths) — ~40 min

| # | ID | Titolo | Note chiave |
|---|---|--------|-------------|
| 12 | v1-cap10-esp2 | LED diverso colore con LDR | Variazione colore LED |
| 13 | v1-cap10-esp3 | 3 LDR controllano RGB | 3 sensori × 3 canali, circuito complesso |
| 14 | v1-cap10-esp4 | LED bianco illumina LDR → LED blu | LDR con luce artificiale |
| 15 | v1-cap10-esp5 | Aggiungi pot per controllare LED bianco | LDR + pot combo |
| 16 | v1-cap10-esp6 | Aggiungi pulsante al circuito LDR | LDR + pulsante combo |

**Dopo il blocco**:
1. Vocab check → 0
2. Circuit data match → 0
3. Build → Exit 0
4. Commit (feat: cap10 completo)
5. Aggiorna PROGRESS-G5.md
6. **RALPH CHECK**: `grep "v1-cap10" index.js | wc -l` = 6? Cap 10 COMPLETO?

### BLOCCO 5: DEPLOY + CoV FINALE + HANDOFF — ~20 min

1. Build finale
2. Deploy Vercel
3. CoV completa (11 verifiche — vedi sotto)
4. Test browser (preview_console_logs, preview_snapshot)
5. Commit handoff ≤ 30 righe
6. Scrivi NEXT-SESSION-PROMPT-G6.md

## VOCABOLARIO PER CAPITOLO (REGOLE STRICT)

### Cap 8 — Pulsante
**PERMESSO**: pulsante, circuito aperto/chiuso, LED, LED RGB, catodo comune, resistore, corrente, breadboard, batteria, filo, anodo, catodo
**VIETATO**: ohm, volt, tensione, parallelo, serie, condensatore, potenziometro, Arduino, codice, programma, digitale, toggle, latch

### Cap 9 — Potenziometro
**PERMESSO**: come Cap 8 + potenziometro, resistenza variabile, manopola, dimmer
**VIETATO**: ohm, volt, tensione, parallelo, serie, condensatore, Arduino, codice, programma, partitore

### Cap 10 — Fotoresistenza
**PERMESSO**: come Cap 9 + fotoresistenza, sensore, LDR, luce, buio
**VIETATO**: ohm, volt, tensione, parallelo, serie, condensatore, Arduino, codice, programma, partitore, digitale

### Eccezione "NON dire X"
Se un'istruzione per il docente dice "NON dire/introdurre [termine proibito]", il termine può apparire nel contesto meta. Lo script vocab check ha un filtro per questo pattern.

## PROCESSO PER OGNI JSON

1. Leggi dati esperimento da experiments-vol1.js (id, title, components, connections, steps, observe, concept, unlimPrompt)
2. Usa il template del capitolo corrispondente come modello:
   - Cap 8: `v1-cap8-esp1.json` (già fatto G4)
   - Cap 9: `v1-cap9-esp1.json` (già fatto G4)
   - Cap 10: `v1-cap10-esp1.json` (già fatto G4)
3. Genera JSON 5 fasi: PREPARA→MOSTRA→CHIEDI→OSSERVA→CONCLUDI
4. build_circuit.intent: copia components + connections dall'esperimento (ESATTI, non modificare)
5. Analogie: genera dal concept + unlimPrompt dell'esperimento
6. Verifica vocabolario MENTALMENTE prima di scrivere (poi lo script conferma)
7. Aggiungi a index.js

## SCRIPT TEST ORACLE (eseguire PRIMA di ogni commit)

### Vocab check:
```bash
cd "VOLUME 3/PRODOTTO/elab-builder" && python3 -c "
import json, glob, re
violations = []
for f in sorted(glob.glob('src/data/lesson-paths/v1-*.json')):
    d = json.load(open(f))
    forbidden = set(w.lower() for w in d.get('vocabulary', {}).get('forbidden', []))
    eid = d['experiment_id']
    for pi, phase in enumerate(d.get('phases', [])):
        for field in ['teacher_message','teacher_tip','class_hook','provocative_question','observation_prompt','summary_for_class']:
            text = (phase.get(field) or '').lower()
            for fw in forbidden:
                if re.search(r'\b' + re.escape(fw) + r'\b', text):
                    if not re.search(r'non\s+(dire|introdurre|usare)\b.*\b' + re.escape(fw), text):
                        violations.append(f'{eid} phase[{pi}].{field}: \"{fw}\"')
        for mi, m in enumerate(phase.get('common_mistakes', [])):
            for mf in ['mistake','teacher_response','analogy']:
                text = (m.get(mf) or '').lower()
                for fw in forbidden:
                    if re.search(r'\b' + re.escape(fw) + r'\b', text):
                        violations.append(f'{eid} phase[{pi}].mistakes[{mi}].{mf}: \"{fw}\"')
if violations:
    print(f'FAIL: {len(violations)} violations'); [print(f'  {v}') for v in violations]
else:
    print('PASS: 0 vocabulary violations')
"
```

### Circuit data match:
```bash
cd "VOLUME 3/PRODOTTO/elab-builder" && python3 -c "
import json, glob, re
with open('src/data/experiments-vol1.js') as f:
    content = f.read()
mismatches = []
for f in sorted(glob.glob('src/data/lesson-paths/v1-*.json')):
    d = json.load(open(f))
    eid = d['experiment_id']
    for phase in d.get('phases', []):
        bc = phase.get('build_circuit')
        if not bc: continue
        intent_comps = bc.get('intent', {}).get('components', [])
        intent_wires = bc.get('intent', {}).get('wires', [])
        exp_match = re.search(rf'id:\s*\"{eid}\".*?components:\s*\[(.*?)\]', content, re.DOTALL)
        conn_match = re.search(rf'id:\s*\"{eid}\".*?connections:\s*\[(.*?)\]', content, re.DOTALL)
        if exp_match:
            n = len(re.findall(r'type:', exp_match.group(1)))
            if len(intent_comps) != n:
                mismatches.append(f'{eid}: {len(intent_comps)} intent vs {n} exp comps')
        if conn_match:
            n = len(re.findall(r'from:', conn_match.group(1)))
            if len(intent_wires) != n:
                mismatches.append(f'{eid}: {len(intent_wires)} intent vs {n} exp wires')
if mismatches:
    print(f'FAIL: {len(mismatches)} mismatches'); [print(f'  {m}') for m in mismatches]
else:
    print('PASS: all circuit data matches')
"
```

### JSON schema consistency:
```bash
cd "VOLUME 3/PRODOTTO/elab-builder" && python3 -c "
import json, os, glob
ref_keys = None
for f in sorted(glob.glob('src/data/lesson-paths/v1-*.json')):
    d = json.load(open(f))
    keys = sorted([k for k in d.keys() if k != '_meta'])
    if ref_keys is None: ref_keys = keys
    elif keys != ref_keys:
        print(f'FAIL: {os.path.basename(f)} has different keys')
        print(f'  Extra: {set(keys)-set(ref_keys)}, Missing: {set(ref_keys)-set(keys)}')
        exit(1)
print(f'PASS: all {len(list(glob.glob(\"src/data/lesson-paths/v1-*.json\")))} files consistent ({len(ref_keys)} keys)')
"
```

## CHAIN OF VERIFICATION FINALE (11 verifiche)

| # | Verifica | Comando | Evidenza attesa |
|---|----------|---------|-----------------|
| V1 | Build passa | `npm run build` | Exit 0 |
| V2 | Import count | `grep "import" src/data/lesson-paths/index.js \| wc -l` | 29 |
| V3 | Deploy OK | `curl -s -o /dev/null -w "%{http_code}" https://www.elabtutor.school` | 200 |
| V4 | Cap 8 completo | `grep "v1-cap8" src/data/lesson-paths/index.js \| wc -l` | 5 |
| V5 | Cap 9 completo | `grep "v1-cap9" src/data/lesson-paths/index.js \| wc -l` | 9 |
| V6 | Cap 10 completo | `grep "v1-cap10" src/data/lesson-paths/index.js \| wc -l` | 6 |
| V7 | Vocab check | Script Python | 0 violazioni reali |
| V8 | Circuit data match | Script Python | 0 mismatch |
| V9 | JSON schema | Script Python | Tutte stesse chiavi |
| V10 | Console errors | preview_console_logs level=error | Solo borderColor |
| V11 | Git log | `git log --oneline -5` | 4+ commit feat/fix, 0 docs |

## FILE DA LEGGERE (in ordine — STRICT)

### OBBLIGATORI prima di scrivere codice (leggere UNA VOLTA, non rileggere)
1. `src/data/lesson-paths/v1-cap8-esp1.json` — template cap8 (~170 righe)
2. `src/data/lesson-paths/v1-cap9-esp1.json` — template cap9
3. `src/data/lesson-paths/v1-cap10-esp1.json` — template cap10
4. `src/data/experiments-vol1.js` — righe 1337-1600 (cap8), 2360-3500 (cap9), 4148-5340 (cap10)
5. `src/data/lesson-paths/index.js` — per aggiornare import

### SE SERVE (non leggere preventivamente)
6. `src/data/curriculumData.js` — ha curriculum per cap8-esp1, cap9-esp1, cap10-esp1

### NON LEGGERE MAI
- CLAUDE.md (già nel contesto automatico)
- automa/context/*.md (visione già nota, non rileggere)
- Contesto business (già nel prompt)
- TeacherDashboard (non toccare oggi)
- I 5 componenti UNLIM (non toccare oggi)
- File automa/knowledge/* (ricerca, non codice)

## REGOLE SESSIONE
1. ❌ ZERO commit `docs:` — solo `feat:` e `fix:`
2. ❌ ZERO agenti di ricerca/audit PRIMA di scrivere codice
3. ❌ ZERO handoff > 30 righe
4. ❌ NON rileggere file già letti — scrivi codice
5. ✅ CODICE FIRST — genera JSON, poi testa, poi committa
6. ✅ Test oracle PRIMA di ogni commit (vocab + circuit + build)
7. ✅ CoV intermedia dopo ogni capitolo
8. ✅ PROGRESS-G5.md aggiornato dopo ogni blocco
9. ✅ Se un JSON è dubbio, leggi l'esperimento originale per quel singolo ID
10. ✅ Massima onestà — se qualcosa non quadra, segnalo

## ANTI-PATTERN (provati e falliti G1-G3)
- ❌ 30min+ audit prima di scrivere codice → G1-G3 producevano 1 lesson path/giorno
- ❌ 10 commit docs per 3 commit feat → invertito
- ❌ Rileggere 43 file di contesto → compressione contesto
- ❌ Handoff da 200+ righe → nessuno li legge
- ❌ Lanciare agenti di ricerca quando il lavoro è batch meccanico
- ❌ Dichiarare successo senza count verificato (Ralph loop!)

## OUTPUT ATTESO
- 16 lesson paths nuovi (da 13 a 29)
- Cap 6-10 COMPLETI al 100%
- 4+ commit feat, 0 commit docs
- CoV intermedia dopo ogni capitolo (3 mini-CoV)
- CoV finale con 11 verifiche PASS
- PROGRESS-G5.md con storia onesta della sessione
- NEXT-SESSION-PROMPT-G6.md per completare Vol 1 (cap 11-14, 9 esperimenti)
- Handoff ≤ 30 righe

## PROGRESS FILE (creare all'inizio, aggiornare dopo ogni blocco)

Crea `automa/PROGRESS-G5.md` con questa struttura:
```markdown
# G5 Progress — [data]
## Blocco 1: Cap 8
- [ ] v1-cap8-esp3
- [ ] v1-cap8-esp4
- [ ] v1-cap8-esp5
- Build: ?  Vocab: ?  Commit: ?

## Blocco 2: Cap 9 (esp2-5)
...
## Blocco 3: Cap 9 (esp6-9)
...
## Blocco 4: Cap 10 (esp2-6)
...
## Blocco 5: Deploy + CoV
...
## Problemi trovati
(lista onesta di qualsiasi problema)
## Tempo totale
```

Aggiorna DOPO ogni blocco. Questo file sopravvive alla compressione del contesto.

## REFERENCE
- Build: `export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH" && npm run build`
- Deploy: `export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH" && npx vercel --prod --yes`
- Sito: https://www.elabtutor.school
- Palette: Navy #1E4D8C, Lime #558B2F
```
