# PROMPT OPERATIVO SESSIONE 31

**Data**: 20/02/2026
**Modalita**: Ralph Loop (agile) — NON parallelizzare le fasi
**Tools OBBLIGATORI**: Claude in Chrome + frontend-design skill + screenshot ad ogni step

---

## ISTRUZIONE PRINCIPALE

Leggi il PRD completo in `sessioni/prompt/prompt-sessione31.md` — e il tuo single source of truth.

Lavora in modalita Ralph Loop: ogni sprint segue il ciclo `plan → build → verify → deploy → report`.

**REGOLA FONDAMENTALE**: Questa sessione e VISUAL-FIRST. Devi usare Claude in Chrome per GUARDARE tutto prima di scrivere una sola riga di codice. Il flusso e:

```
GUARDA (screenshot) → CONFRONTA (con PDF/design) → PIANIFICA (fix list) → IMPLEMENTA → GUARDA DI NUOVO (verifica)
```

---

## SEQUENZA OPERATIVA (SERIALE — NON PARALLELIZZARE)

### Sprint 1: AUDIT VISIVO BRUTALE

**Step 1.1**: Apri Chrome e naviga su https://funny-pika-3d1029.netlify.app
- Screenshot di TUTTE le pagine (8 pagine)
- Per ogni pagina: mobile (375px) + desktop (1440px)
- Documenta: layout rotti, immagini mancanti, colori sbagliati, font errati

**Step 1.2**: Naviga su https://elab-builder.vercel.app
- Login con `debug@test.com` / `Xk9#mL2!nR4`
- Screenshot: login → vetrina → picker → simulatore → sidebar → chat → lavagna → teacher dashboard
- Controlla console per errori (DevTools → Console)

**Step 1.3**: Apri simulatore con esperimento Vol1 (es. v1-cap6-esp1)
- Screenshot del circuito montato
- Screenshot di OGNI componente SVG visibile
- Apri PDF `public/volumes/volume1.pdf` per confronto
- Per ogni componente: vota 1-10 la fedelta al disegno del libro

**Step 1.4**: Ripeti con Vol2 e Vol3
- Confronta ogni componente con le illustrazioni dei rispettivi PDF
- Documenta TUTTE le discrepanze in un audit report

**Step 1.5**: Scrivi `sessioni/report/report-sessione31-sprint1-audit.md`
- Lista completa di issues con priorita P0/P1/P2/P3
- Score per componente SVG
- Screenshot di riferimento

**Step 1.6**: Deploy? NO — Sprint 1 e solo audit, nessun deploy.

---

### Sprint 2: FIX COMPONENTI SVG

**Step 2.1**: Per ogni componente con score < 8/10:
- Leggi il file .jsx corrispondente
- Usa `frontend-design` skill per ridisegnare il componente SVG
- Vincoli: pin corretti (MEMORY.md), griglia 7.5px, colori dal libro
- NanoBreakout: semicerchio LEFT, wing RIGHT, SULLA breadboard

**Step 2.2**: Dopo ogni batch di 3-5 componenti fixati:
- `npm run build` → 0 errori
- Apri Chrome → carica esperimento con componente fixato → screenshot
- Confronta con PDF → se OK passa al prossimo, se NO rifai

**Step 2.3**: Report: `sessioni/report/report-sessione31-sprint2-svg.md`

**Step 2.4**: Deploy Vercel
```bash
cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build && npx vercel --prod --yes
```

---

### Sprint 3: VOLUME GATING

**Step 3.1**: ExperimentPicker — volumi senza licenza INVISIBILI (non locked)
File: `src/components/simulator/panels/ExperimentPicker.jsx`
Cambiare: se `!hasVolumeAccess(volNum)` → `return null` (non renderizzare la card)

**Step 3.2**: ComponentPalette — solo componenti del volume selezionato
File: `src/components/simulator/panels/ComponentPalette.jsx`
Usare: `getComponentsByVolume(selectedVolume)` dal registry

**Step 3.3**: Verificare con Chrome:
- Login con student account → attivare SOLO `ELAB-VOL1-2026`
- Screenshot ExperimentPicker → SOLO Vol1 visibile
- Aprire esperimento Vol1 → ComponentPalette mostra SOLO componenti Vol1
- Verificare che Vol2 e Vol3 NON appaiano DA NESSUNA PARTE

**Step 3.4**: Login con admin → verificare che TUTTO e visibile

**Step 3.5**: Report: `sessioni/report/report-sessione31-sprint3-gating.md`

**Step 3.6**: Deploy Vercel

---

### Sprint 4: VETRINA + UX PERFETTO

**Step 4.1**: VetrinaSimulatore — ri-aggiungere screenshots
File: `src/components/VetrinaSimulatore.jsx`
Immagini: `/assets/breadboard/circuito-base.png`, `circuito-led.png`, `circuito-condensatore.jpg`, `circuito-modificato.png`
Usare `frontend-design` skill per rendere la galleria perfetta.

**Step 4.2**: Screenshot VetrinaSimulatore con Chrome → verificare rendering

**Step 4.3**: UX sweep completo con Chrome
Navigare TUTTO il flusso studente step by step:
Login → Vetrina → Licenza → Volume → Capitolo → Esperimento → Simulatore → Tab → Giochi → Chat → Lavagna

Per OGNI step: screenshot + documentare UX issues

**Step 4.4**: Fix UX issues (quelli < 30 min)

**Step 4.5**: Report: `sessioni/report/report-sessione31-sprint4-ux.md`

**Step 4.6**: Deploy Vercel + Netlify (se sito modificato)

---

### Sprint 5: AUDIT FINALE + DEPLOY

**Step 5.1**: `npm run build` → 0 errori
**Step 5.2**: Console.log audit → 0 inappropriate
**Step 5.3**: Screenshot post-deploy con Chrome (6 screenshot chiave)
**Step 5.4**: Report FINALE: `sessioni/report/report-sessione31-finale.md`
**Step 5.5**: Aggiornare MEMORY.md con nuovi score e issues
**Step 5.6**: HONESTY NOTE: cosa e stato REALMENTE verificato vs cosa no

---

## DOCUMENTI DA LEGGERE PRIMA DI INIZIARE

1. `sessioni/prompt/prompt-sessione31.md` — PRD completo (SINGLE SOURCE OF TRUTH)
2. `sessioni/report/report-sessione30-finale.md` — Report sessione precedente
3. `~/.claude/projects/-Users-andreamarro-VOLUME-3/memory/MEMORY.md` — Memory completa
4. `public/volumes/volume1.pdf` — Per confronto SVG (pagine con circuiti)
5. `public/volumes/volume2.pdf` — Per confronto SVG
6. `public/volumes/volume3.pdf` — Per confronto SVG

---

## DOPO OGNI SPRINT

1. `npm run build` → DEVE passare con 0 errori
2. Screenshot post-build con Chrome in Chrome per verificare
3. Scrivere report sprint in `sessioni/report/`
4. Deploy (Vercel e/o Netlify)
5. Aggiornare todo list

---

## SKILLS DA USARE

- **Ralph Loop** (`/ralph-loop`): Per ogni sprint
- **Claude in Chrome**: Per OGNI screenshot e verifica visiva
- **frontend-design** (`/frontend-design`): Per migliorare design componenti e UI
- **quality-audit** (`/quality-audit`): Per audit finale (Sprint 5)
