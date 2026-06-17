# DIRETTIVE PER CLAUDE CODE WEB — Andrea Marro

> Questo file è la LEGGE. Leggilo PRIMA di fare qualsiasi cosa.
> Se non l'hai letto, FERMATI e leggilo ORA.

---

## REGOLA SUPREMA: SE UNA COSA SEMBRA FINITA, NON LO È.

**Mai dare nulla per scontato.** Quando pensi di aver finito qualcosa:
1. DIMOSTRALO con prova oggettiva (test, screenshot, conteggio, output)
2. VERIFICALO sulla piattaforma reale (Chrome, non solo vitest)
3. CONFRONTALO con il gold standard (Vol1 buildSteps = qualità target)
4. Solo DOPO dichiara "completato"

**Se non puoi dimostrarlo, non è fatto.**

### PROATTIVITÀ OBBLIGATORIA
Dopo aver fatto QUALSIASI cosa — anche la più piccola:
1. **NON dare per scontato che sia giusta.** Verifica.
2. **NON aspettare che qualcuno te lo chieda.** Se vedi un problema, fixalo.
3. **NON pensare "questo è ovvio, funziona".** Testalo.
4. Se un test passa ma il comportamento in Chrome è sbagliato → **il test è sbagliato, non il codice**.
5. Se hai scritto codice e non l'hai testato live → **non l'hai scritto**.

### MODALITÀ PROGETTO
Questo è un PRODOTTO REALE per scuole italiane. Non è un esercizio.
- Lunedì c'è una riunione con gli stakeholder:
  - **Omaric Elettronica** (Strambino, Torino) — l'azienda che produce l'hardware ELAB. Sono nella filiera Arduino (producono schede e kit). Sede a Strambino. Sono il partner hardware del progetto. ELAB Tutor (software) + Kit Omaric (hardware) + Volumi (manuali) = UN UNICO PRODOTTO che Omaric vende alle scuole.
  - **Giovanni Fagherazzi** — ex Arduino Global Sales Director. Ha guidato le vendite Arduino in tutto il mondo. Ora è nel team ELAB come responsabile vendite e strategia commerciale. SA ESATTAMENTE come deve funzionare un prodotto EdTech per scuole. Se il prodotto non è all'altezza, lui lo vede subito.
  - **Davide Fagherazzi** — figlio di Giovanni. Gestisce la parte MePA (Mercato Elettronico della Pubblica Amministrazione). Le scuole pubbliche italiane DEVONO comprare da MePA.
  - **Andrea Marro** — l'UNICO sviluppatore. Gli hanno dato fiducia. La sua reputazione dipende da questo.
- Se qualcosa non funziona dal vivo, la reputazione di Andrea è a rischio
- Il team ha GIÀ la filiera: hardware (Omaric), vendite globali (Giovanni), procurement PA (Davide), dev (Andrea)
- Ogni riga di codice deve servire il Principio Zero

---

## PRINCIPIO ZERO — La Bussola di TUTTO

> "Rendere facilissimo per CHIUNQUE spiegare i concetti dei manuali ELAB e spiegarne gli esperimenti SENZA ALCUNA CONOSCENZA PREGRESSA. Arrivi e magicamente insegni."

**NON è ELAB Tutor che insegna.**
ELAB Tutor e UNLIM sono gli STRUMENTI con cui l'insegnante diventa IMMEDIATAMENTE in grado di spiegare, DIVERTENDOSI.

Questo significa:
- L'insegnante è il PROTAGONISTA, non UNLIM
- UNLIM è INVISIBILE — prepara tutto dietro le quinte
- Il docente arriva alla LIM, apre ELAB, e SPIEGA come se sapesse tutto
- UNLIM gli ha già preparato la lezione, i circuiti, le analogie, le domande
- Il docente NON deve studiare prima, NON deve preparare niente
- La MAGIA è che il docente sembra competente IMMEDIATAMENTE
- E si DIVERTE a farlo — non è un peso, è un gioco

**OGNI decisione, OGNI riga di codice deve rispondere a: "Questo aiuta il docente a insegnare senza preparazione?"**

---

## ELAB Tutor, Kit e Volumi = UN UNICO PRODOTTO

Non sono 3 cose separate. Sono UNA cosa. Il software deve rispecchiare ESATTAMENTE i volumi cartacei:
- Stessi esperimenti, stessi componenti, stesse istruzioni
- Stessa progressione didattica
- Stessa estetica (palette, font, tono)
- Se il volume dice "inserisci il resistore nei fori A2 e A9", il software DEVE dire la stessa cosa

---

## Quality Audit Continui — NON OPZIONALI

Dopo OGNI blocco di lavoro:
1. `npx vitest run` → 0 fail (MINIMO 1649 test)
2. `npm run build` → PASS
3. `gh run list --limit 1` → CI verde
4. Verifica su Chrome reale — apri elabtutor.school e TESTA
5. Conta le metriche:
   - `grep -c buildSteps src/data/experiments-vol*.js`
   - `grep -c scratchXml src/data/experiments-vol3.js`
   - `grep -c targetPins src/data/experiments-vol*.js`
   - `ls src/data/lesson-paths/v*.json | wc -l`

**Se qualsiasi gate fallisce: FERMA TUTTO e fixa prima di procedere.**

---

## Stato Attuale (10 aprile 2026)

### Completato
- ✅ BuildSteps 92/92 (100%) — Vol1 38, Vol2 27, Vol3 27
- ✅ ScratchXml Vol3 31 (96%) — 20 nuovi, 1 mancante (hardware-only)
- ✅ Lesson Paths 94 (100%) — 11 nuovi
- ✅ Alias Mapping Tea 24 capitoli — chapter-map.js
- ✅ Voice Commands 36 — 12 nuovi per Principio Zero
- ✅ Safety regex P1 — child safety filter
- ✅ Fetch timeout P2 — 25/25 calls protected
- ✅ CI fix lightningcss — GREEN
- ✅ BuildSteps quality fix — 0 "area di lavoro" generici, +9 targetPins Vol2

### Problemi APERTI (audit brutale)
1. **chapter-map.js NON integrato nella UI** — il docente vede ancora "Cap 6" non "Cap 2"
2. **ScratchXml NON testato in Blockly** — 20 XML generati da AI, mai eseguiti
3. **ZERO test E2E su piattaforma reale** — tutto verificato solo con vitest
4. **Lesson paths generati da AI** — non confrontati con volumi cartacei
5. **BuildSteps non confrontati con volumi** — istruzioni plausibili ma non verificate
6. **Flusso "bentornati" NON esiste** — UNLIM non propone la lezione all'apertura
7. **Report fumetto NON testato e2e** — codice esiste ma mai provato con dati reali

### Metriche
- Test: 1649 pass, 37 file
- Build: PASS (~50s)
- CI: test+build+e2e GREEN (security+deploy fail per config, non codice)
- Bundle: ~3000KB precache
- Score evaluate-v3: 95/100

---

## Priorità Andrea (09/04/2026)

1. **PARITÀ PERFETTA** tra ELAB Tutor, Kit fisico e Volumi
2. **UNLIM ONNISCIENTE e ONNIPOTENTE** su TUTTE le funzionalità
3. **PRINCIPIO ZERO al 100%**
4. **Qualità e tempi voce**
5. **Arduino, Compilatore, Scratch PERFETTI**
6. **Montaggio circuiti graficamente migliore**
7. **Idee innovative** — cose NON sul mercato

**Andrea NON si occupa di vendite** (Giovanni, Davide fanno quello). Vuole concentrarsi sul PRODOTTO.

---

## Chi fa cosa
- Giovanni Fagherazzi: vendite, PNRR, bandi
- Davide Fagherazzi: MePA, procurement PA  
- Andrea Marro: SVILUPPO PRODOTTO (unico sviluppatore)
- Tea: analisi volumi, documento riallineamento

---

## File Critici da Leggere

| File | Cosa contiene |
|------|--------------|
| `CLAUDE.md` | Regole tecniche immutabili |
| `docs/sprint/HANDOFF.md` | Stato corrente dettagliato |
| `docs/plans/2026-04-09-principio-zero-sprint-design.md` | Design sprint |
| `docs/plans/2026-04-09-principio-zero-sprint.md` | Piano implementazione |
| `automa/learned-lessons.md` | Errori da NON ripetere |
| `automa/context/UNLIM-VISION-COMPLETE.md` | Visione completa UNLIM |
| `src/data/chapter-map.js` | Alias mapping Tea |

---

## Errori della Sessione Precedente — DA NON RIPETERE

1. **Pushato 36+ commit su main senza verificare CI** → SEMPRE verificare `gh run list`
2. **Dichiarato "quality gate PASS" mentre CI falliva** → MAI dichiarare senza CI verde
3. **Push diretto su main** → SEMPRE branch + PR
4. **BuildSteps generici "area di lavoro"** → SEMPRE fori specifici come Vol1
5. **ScratchXml non testato** → SEMPRE testare in runtime
6. **Auto-celebrazione senza verifica** → SEMPRE prova oggettiva prima

---

## Template Prova Oggettiva

Quando dichiari qualcosa "completato", usa questo template:

```
## Prova Oggettiva: [nome task]
- Test: npx vitest run → [N] pass, 0 fail
- Build: npm run build → PASS ([N]s)
- CI: gh run list → [status]
- Metriche: buildSteps=[N], scratchXml=[N], lessonPaths=[N], targetPins=[N]
- Chrome test: [screenshot o descrizione di cosa hai verificato]
- Confronto gold standard: [come si confronta con Vol1 buildSteps]
```
