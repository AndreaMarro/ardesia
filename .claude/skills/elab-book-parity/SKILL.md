---
name: elab-book-parity
description: Verify singolo esperimento ELAB vs reference image disegno Volume. Quick parity check pre/post modifica simulator geometry. Trigger keywords - book parity, libro parity, fedeltà volume, verify experiment, check geometry, parity audit.
---

# ELAB Book Parity Check

Verifica un esperimento simulatore vs reference image disegno cartaceo Volume.

## Quando usare

- DOPO Codex Desktop output S1 7 esp (verify ogni esp vs reference image)
- DOPO modifica `lesson-paths/v*.json build_circuit` (manual verify)
- PRIMA di dichiarare esperimento "demo-ready"
- DURANTE dry-run per spot-check

## Input

User specifica: `<experiment-id>` (es. `v1-cap6-esp1`).

## Workflow

### Step 1: Carica reference image

```bash
ls -la docs/demo-25may/circuit-references/<exp-id>.png
```

Se file mancante: STOP. Report missing reference image come blocker.

### Step 2: Carica lesson-path JSON

```bash
cat src/data/lesson-paths/<exp-id>.json | jq '.build_circuit'
```

Estrai: components, wires, reference_image path.

### Step 3: Open simulator in browser

```bash
npm run dev &
DEV_PID=$!
sleep 5
open "http://localhost:5173/#esperimento/<exp-id>?mode=gia-montato"
```

Oppure usa Playwright snapshot:

```bash
npx playwright test tests/e2e/demo-geometric-fidelity.spec.js --grep "<exp-id>"
ls test-results/<exp-id>-*-actual.png
```

### Step 4: Comparison checklist

Confronto manuale (visivo) o automatico (visual diff Playwright SSIM):

| Item | OK / NO | Note |
|---|---|---|
| **Componenti** mancanti | OK / NO | Lista mancanti |
| **Componenti** extra | OK / NO | Lista extra |
| **Cavi colore** errato | OK / NO | Lista cavi sbagliati |
| **Geometria filo** spazio | OK / NO | Path waypoints differenti |
| **Posizione breadboard** | OK / NO | Coordinate componenti |
| **Pila** clip_simplified | OK / NO | NO strisci cavi |
| **Pin assignment** | OK / NO | Mismatch pin Nano vs cavi |
| **Reference image** ref | OK / NO | reference_image path valido |
| **BookRef pag** | OK / NO | volume_reference.page presente |

### Step 5: Output

```
EXPERIMENT: <exp-id>
PARITY: PASS / FAIL
Componenti mancanti: [...]
Componenti extra: [...]
Cavi colore errato: [...]
Geometria non fedele: [...]
Pin mismatch: [...]
BookRef mancante: [...]
Screenshot richiesti per fix: [...]
Action items: [...]
```

## Demo experiment IDs (7)

- `v1-cap6-esp1` Accendi il tuo primo LED
- `v1-cap6-esp2` LED senza resistore
- `v1-cap6-esp3` Cambia luminosità con resistenze diverse
- `v2-cap7-esp1` Scarica condensatore con multimetro
- `v2-cap7-esp2` Scarica condensatore con LED rosso ← magic fade
- `v3-cap6-esp4` Due LED che si alternano
- `v3-cap6-esp5` Costruiamo un semaforo ← Vol3 pag 57

## Anti-pattern

- ❌ Dichiarare PASS senza viewing actual image side-by-side reference
- ❌ Accettare "good enough" per i 3 hero esp (v1-cap6-esp1, v2-cap7-esp2, v3-cap6-esp5)
- ❌ Skip pin assignment check (= circuito non funziona anche se "sembra giusto")
- ❌ Inflate score (CoV mandate: PASS solo se TUTTI item OK)
