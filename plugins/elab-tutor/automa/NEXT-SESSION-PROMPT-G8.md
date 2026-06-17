# SESSIONE G8 — QUALITY HARDENING + CONTENT AUDIT PROFONDO

```
cd "VOLUME 3/PRODOTTO/elab-builder"

SEI ELAB-TUTOR-LOOP-MASTER. Giorno 8.

## STATO VERIFICATO (fine G7)
- 62 lesson paths: Vol 1 (38) + Vol 2 (18) + Vol 3 (6) ✅
- Vocab: 0 violations (audit completo tutte le sezioni) ✅
- Schema: 62/62 JSON valid, 16 keys, 5 fasi ✅
- Analogie: 62/62 ≥2 ✅ | Common mistakes: 62/62 ≥2 ✅
- Broken links: 0 ✅ | Build: Exit 0 ✅ | Deploy: HTTP 200 ✅

## ARCHITETTURA: OPUS 4.6 PER TUTTO
- ZERO Sonnet. Ogni agente è Opus 4.6.
- OGNI agente esegue il proprio quality audit PRIMA di dichiarare completamento.
- Il LEAD (tu) esegue un SECONDO audit indipendente su ogni output.
- Double-blind: l'agente non sa che verrà ri-auditato.

## CONTESTO IMMUTABILE
- Giovanni Fagherazzi = ex Global Sales Director ARDUINO
- PNRR deadline 30/06/2026
- Andrea Marro = UNICO sviluppatore
- NON toccare: CircuitSolver, AVRBridge, evaluate.py, checks.py
- Palette: Navy #1E4D8C, Lime #558B2F

## LEZIONI DA G7 (da applicare SEMPRE)
1. Vocab checker deve scansionare TUTTE le sezioni: phases, objective, next_experiment, session_save, assessment_invisible, components_needed
2. Il vocabolario PUÒ essere sbagliato — se una parola forbidden è usata in 30+ file, la regola è sbagliata, non il contenuto
3. Gli agenti NON si auto-validano — il lead valida con script meccanici
4. Contare i file sorgente (experiments-vol*.js), NON fidarsi di STATE.md
5. Ogni fix deve essere VERIFICATO con re-run dell'audit completo, non con "ho cambiato la riga"

## PIANO G8 — 3 MACRO-BLOCCHI

### BLOCCO A: CONTENT QUALITY AUDIT PROFONDO (Opus agents)

#### A1: Cross-check build_circuit.intent vs experiments-vol1.js
G7 ha verificato Vol 2+3 (24/24 match). Vol 1 (38 file) NON è mai stato cross-checked.

Lancia 2 Opus agents in parallelo:
- Agent A1a: verifica v1-cap6 → v1-cap9 (23 file) — legge experiments-vol1.js, confronta components+connections con intent.components+intent.wires
- Agent A1b: verifica v1-cap10 → v1-cap14 (15 file)

OUTPUT atteso: tabella con match/mismatch per ogni file. Se mismatch > 0, fix PRIMA di andare avanti.

#### A2: Pedagogical content audit
Lancia 1 Opus agent che legge 10 file campione (2 per volume+chapter) e verifica:
- teacher_message è in italiano corretto e comprensibile per bambini 10-14?
- Le analogie sono concrete e appropriate (non astratte)?
- Le common_mistakes descrivono errori REALI che i bambini farebbero?
- Il provocative_question stimola pensiero critico?
- Il summary_for_class è un recap utile per l'insegnante?

OUTPUT: score 1-5 per ogni dimensione, con citazioni specifiche di problemi.

#### A3: Vocabulary consistency audit
Lancia 1 Opus agent che verifica:
- Le parole "allowed" sono effettivamente usate nel contenuto? (coverage)
- La progressione delle parole tra capitoli è logica? (cap6 non dovrebbe avere parole che vengono introdotte in cap9)
- Ci sono parole nel contenuto che non sono né allowed né forbidden? (gap analysis)

OUTPUT: report con gap e raccomandazioni.

### BLOCCO B: TECHNICAL HARDENING

#### B1: Sequencing chain audit completo
Verifica che la catena prerequisiti → next_experiment sia un DAG valido senza cicli e senza buchi.
Ogni esperimento deve avere ESATTAMENTE un predecessore (tranne il primo) e un successore (tranne l'ultimo).

#### B2: Duration audit
Verifica che duration_minutes sia ragionevole:
- PREPARA: 5-8 min
- MOSTRA: 10-15 min
- CHIEDI: 7-10 min
- OSSERVA: 8-15 min
- CONCLUDI: 5-8 min
- Totale: 35-60 min

Flag file con durate irrealistiche.

#### B3: Action tags audit
Verifica che:
- MOSTRA ha [AZIONE:loadexp:CORRECT_ID]
- OSSERVA ha [AZIONE:play] + almeno 1 [AZIONE:highlight:COMPONENT_ID]
- Gli highlight ID corrispondono a componenti reali dell'esperimento

### BLOCCO C: FIX + DEPLOY + CoV 8 LAYER

#### C1: Fix tutti i problemi trovati in A1-A3 e B1-B3
#### C2: Re-run audit completo → 0 issues
#### C3: Build + Deploy

#### CoV 8 Layer:
| Layer | Cosa | Tool |
|-------|------|------|
| L1 | JSON valid + schema + phases | Python script |
| L2 | Vocab violations = 0 (TUTTE le sezioni) | Python script |
| L3 | Components cross-check vs experiments-vol*.js | Python script |
| L4 | Sequencing DAG valid + no broken links | Python script |
| L5 | Duration audit + action tags audit | Python script |
| L6 | Build Exit 0 + import count = 62 | npm run build + grep |
| L7 | Browser DEV: 6 esperimenti campione (2 per vol) | Preview tools |
| L8 | Deploy HTTP 200 + WebFetch | curl + WebFetch |

Sprint contract: L1-L8 ALL PASS. Se anche UNA fallisce, fix prima.

## REGOLE AGENTI

### Pattern Opus (diverso da Sonnet G7)
- Ogni agente Opus riceve il FULL context del progetto (non abbreviato)
- Ogni agente esegue self-audit E produce un report strutturato
- Il lead ri-audita indipendentemente (double-blind)
- Max 3 agenti paralleli (Opus costa 5x, non sprecare)
- Ogni agente DEVE dichiarare: "Ho controllato N file, trovato M issues, fixato K"

### Anti-pattern da G7
- ❌ Fidarsi del report dell'agente senza re-check
- ❌ Audit solo sulle phases (deve includere TUTTE le sezioni)
- ❌ Usare numeri da STATE.md senza verificare il sorgente
- ❌ Dichiarare "0 violations" senza aver runnato lo script
- ❌ Saltare il cross-check components vs experiments

## SCRIPT DI AUDIT (da usare per L1-L5)

```python
# Salva come automa/audit_g8.py e usa per ogni layer
import json, glob, re, sys

files = sorted(glob.glob('src/data/lesson-paths/v*.json'))
issues = []

for f in files:
    fname = f.split('/')[-1]
    data = json.load(open(f))

    # L1: Schema
    required = {'_meta','experiment_id','volume','chapter','title','chapter_title',
                'difficulty','duration_minutes','target_age','objective',
                'components_needed','vocabulary','prerequisites','next_experiment',
                'phases','assessment_invisible','session_save'}
    missing = required - set(data.keys())
    if missing: issues.append(f"L1_SCHEMA: {fname} missing {missing}")
    phases = data.get('phases', [])
    if len(phases) != 5: issues.append(f"L1_PHASES: {fname} has {len(phases)}")

    # L2: Vocab (ALL sections)
    forbidden = data.get('vocabulary', {}).get('forbidden', [])
    full = json.dumps(data, ensure_ascii=False).lower()
    voc = json.dumps(data.get('vocabulary', {}), ensure_ascii=False).lower()
    check = full.replace(voc, '')
    for w in forbidden:
        if len(w) >= 3 and w.lower() in check:
            issues.append(f"L2_VOCAB: {fname} — '{w}'")

    # L4: Sequencing
    # (check broken links — need all_ids first)

    # L5: Durations
    for p in phases:
        dur = p.get('duration_minutes', 0)
        pname = p.get('name', '')
        if dur < 3 or dur > 20:
            issues.append(f"L5_DURATION: {fname} {pname}={dur}min (unusual)")

    # L5: Action tags
    if len(phases) >= 2:
        mostra = phases[1]
        tags = mostra.get('action_tags', [])
        exp_id = data.get('experiment_id', '')
        expected_tag = f"[AZIONE:loadexp:{exp_id}]"
        if expected_tag not in tags:
            issues.append(f"L5_LOADEXP: {fname} MOSTRA missing {expected_tag}")

    if len(phases) >= 4:
        osserva = phases[3]
        tags = osserva.get('action_tags', [])
        if not any('play' in t for t in tags):
            issues.append(f"L5_PLAY: {fname} OSSERVA missing [AZIONE:play]")
        if not any('highlight' in t for t in tags):
            issues.append(f"L5_HIGHLIGHT: {fname} OSSERVA missing highlights")

    # Content quality
    if len(phases) >= 4:
        if len(phases[3].get('analogies', [])) < 2:
            issues.append(f"CONTENT: {fname} <2 analogies")
    if len(phases) >= 3:
        if len(phases[2].get('common_mistakes', [])) < 2:
            issues.append(f"CONTENT: {fname} <2 common_mistakes")
    if len(phases) >= 2:
        bc = phases[1].get('build_circuit', {}).get('intent', {})
        if not bc.get('components'): issues.append(f"L3_EMPTY_COMP: {fname}")
        if not bc.get('wires'): issues.append(f"L3_EMPTY_WIRE: {fname}")

# L4: Broken links
all_ids = set()
for f in files:
    data = json.load(open(f))
    all_ids.add(data.get('experiment_id', ''))

for f in files:
    data = json.load(open(f))
    fname = f.split('/')[-1]
    ne = data.get('next_experiment')
    if ne and isinstance(ne, dict):
        nid = ne.get('id', '')
        if nid and nid not in all_ids:
            issues.append(f"L4_BROKEN: {fname} → {nid}")

print(f"Files: {len(files)}")
print(f"Issues: {len(issues)}")
for i in sorted(issues):
    print(f"  {i}")
if not issues:
    print("✅ ALL CLEAR")
sys.exit(1 if issues else 0)
```

## REFERENCE
- Build: `export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH" && npm run build`
- Deploy: `export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH" && npx vercel --prod --yes`
- Browser: preview_start → preview_eval → preview_screenshot
- Experiments: src/data/experiments-vol1.js (38), experiments-vol2.js (18), experiments-vol3.js (6)
```
