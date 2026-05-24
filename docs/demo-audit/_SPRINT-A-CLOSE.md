# Sprint A close — Fondazione dati audit

**Sessione**: 2026-05-24 03:00 GMT+2 — demo 25/05 sera (~36h finestra)
**Branch**: `feat/demo-25may`
**Workflow**: `docs/demo-25may-workflow-v2.md` (workflow-v2 15 fasi)
**Mandate Andrea**: FAI UN LAVORO IMPECCABILE. NON COMPIACERMI.

---

## Deliverables Sprint A (18 file nuovi)

```
docs/demo-audit/
  _audit-template.md                  (template riusabile fase 1)
  _demo-gate-template.md              (template gate finale fase 15)
  _SPRINT-A-CLOSE.md                  (questo file)
  v1-cap6-esp1.md                     (audit Primo LED — Vol1 pag.29-31)
  v1-cap6-esp2.md                     (audit LED senza R — Vol1 pag.32)
  v1-cap6-esp3.md                     (audit luminosità R variant — Vol1 pag.33)
  v2-cap7-esp1.md                     (audit cap+MM — Vol2 pag.67-68)
  v2-cap7-esp2.md                     (audit cap+LED — Vol2 pag.69-70)
  v3-cap6-esp4.md                     (audit Due LED polizia — Vol3 pdf p.37)
  v3-cap6-esp5.md                     (audit Semaforo — Vol3 pdf p.38)

src/data/
  book-geometry/bookGeometry.schema.json   (JSON Schema validazione)
  manual-index.json                        (7 esp → vol/cap/pages/quotes)

reference/
  vol1/v1-cap6-esp1/manifest.json     (5 state crops PLANNED)
  vol1/v1-cap6-esp2/manifest.json     (2 state crops PLANNED)
  vol1/v1-cap6-esp3/manifest.json     (4 variant crops PLANNED)
  vol2/v2-cap7-esp1/manifest.json     (5 state crops PLANNED)
  vol2/v2-cap7-esp2/manifest.json     (5 state crops PLANNED)
  vol3/v3-cap6-esp4/manifest.json     (2 crops PLANNED)
  vol3/v3-cap6-esp5/manifest.json     (3 crops PLANNED)
```

## Anti-regressione attivata

- ✅ Git tag `baseline-sprintA-<HHMM>` set pre-Sprint A
- ✅ Vitest baseline pre-Sprint A: **29 fail / 14466 pass / 15 skip / 10 todo / 14520 total** (failures pre-esistenti dal handoff round 12 Battery9V pin coords)
- ✅ Sprint A scope = SOLO file NUOVI (docs + data + reference). ZERO `src/components/` toccato. ZERO test toccato.
- ✅ Git diff stat: 0 file critici modificati. Solo `automa/state/iter-19-harness-2.0-results.json` modificato (pre-esistente, NON mio).
- ⏳ Vitest post-Sprint A: running background — match baseline ATTESO 29/14466
- ⏳ Build post-Sprint A: running background — PASS ATTESO

## Verdetti onesti 7 esp (NON COMPIACERMI)

| Esp | Handoff self-claim | Audit Sprint A onesto |
|-----|--------------------|------------------------|
| v1-cap6-esp1 | pixel-perfect baked | **NON PRONTO** — 4 wire app vs 2 libro (anti-pattern), led-bridge ≠ libro gambe divaricate, no bookGeometry, no visual diff |
| v1-cap6-esp2 | baked | **NON PRONTO** — stesso 4/2 wire, no LED-burn animation verify |
| v1-cap6-esp3 | baked | **NON PRONTO** — swap UX 220/470/1k non verificata, brightness dinamico TBD |
| v2-cap7-esp1 | baked | **NON PRONTO** — solver discharge bug (P0 cap trattiene 9V), R 1kΩ libro↔app discrepancy |
| v2-cap7-esp2 | baked | **NON PRONTO** — 8 wire app vs ~5 libro, buildSteps[] match libro non validato |
| v3-cap6-esp4 | reverted base | **NON PRONTO** — topology RESET, pin LED1 OCR partial, Sprint D ribake |
| v3-cap6-esp5 | reverted base | **NON PRONTO** — topology RESET + **canone clash pin rosso libro=7 vs codex review=9** |

## Discrepanze fonte critiche per Andrea

### 1. Pagine printed ↔ pdf physical mapping Vol3
- Handoff workflow-v2 claim: Vol3 pag.54-59 stampate
- pdftotext `Manuale VOLUME 3 V0.8.1.pdf`: ESPERIMENTO 4 = pdf pag.37, ESPERIMENTO 5 = pdf pag.38
- **Andrea verifica**: V0.8.1 manuale = libro stampato di riferimento? O esiste Vol3 finale stampato V1.0+ diverso?

### 2. Canone pin Semaforo (esp5)
- Libro V0.8.1 pag.38 verbatim: "Verde → pin [OCR partial], Giallo → pin 6, **Rosso → pin 7**"
- Codex adversarial review §22: "LED verde → pin 5, LED giallo → pin 6, **LED rosso → pin 9**"
- **CONFLITTO**: codex sbagliato OR esiste sorgente diversa
- **Andrea verifica**: quale è canone?

### 3. R 1kΩ esp1 Vol2 cap7
- Libro pag.67 lista materiali: "...un resistore da 1kΩ"
- Handoff esp1 topology: "NO R, NO LED" (R presente solo esp2)
- **Andrea verifica**: errore PDF (intende esp2 only) o gap implementazione esp1?

### 4. Wire visibility anti-pattern (tutti 7 esp)
- Libro Vol1 pag.30 mostra 2 wire visibili (bat+→bus+, bus−→bat−)
- App esp1 disegna 4 wire (include rail-jumpers app-only)
- Workflow-v2 fase 8 esplicita: separazione `visibleWires` (libro) vs `hiddenElectricalConnections` (solver-only)
- App attualmente NON applica separazione → ogni connessione → wire visibile
- **Sprint B priorità**: refactor wire visibility 7 esp

## Sprint B preview (Vol1 LED prima)

Mandate workflow-v2: "Se Vol1 non perfetto, NON procedere."

Sprint B priority order:
1. Andrea verifica visivo Vol1 pag.29-33 PDF — conferma 2 wire visibili libro (sostituisce app 4)
2. Rimuovere LedBridge variant → ripristinare LED standard splay+ (gambe divaricate libro)
3. Implementare `bookGeometry` per v1-cap6-esp1 (template per altri 6)
4. Implementare `BookGeometryRenderer.jsx` (Sprint C overlap)
5. Crop tools per estrarre 5 PNG state da PDF Vol1 pag.30-31
6. Visual diff manuale: screenshot simulatore vs crop libro

## Comandi commit (NON push — Andrea verify first)

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25"

# Aggiunge solo Sprint A files (NO automa/state pre-modificato)
git add docs/demo-audit/ src/data/manual-index.json src/data/book-geometry/ reference/

# Verifica
git status --short

# Commit (signed-off, no Co-Authored claim non necessaria)
git commit -m "docs(sprint-A): foundation audit 7 esp demo + bookGeometry schema + manual-index

Workflow-v2 fase 1-3 deliverables:
- 7 audit docs popolati con honest verdicts (NON COMPIACERMI)
- bookGeometry.schema.json JSON Schema validazione
- manual-index.json mapping 7 esp → vol/cap/pages/quotes verbatim
- 7 reference manifests (PNG crops PLANNED Sprint B)
- 2 reusable templates audit + demo-gate
- Sprint A close summary

Discrepanze critiche segnalate ad Andrea:
1. Vol3 pages printed↔pdf mapping (handoff 54-59 vs PDF V0.8.1 37-38)
2. Canone pin Semaforo (libro=7 vs codex=9 per LED rosso)
3. R 1kΩ esp1 Vol2 libro↔app discrepancy
4. Wire visibility anti-pattern 7 esp (visibleWires vs hidden)

Anti-regressione: NO src/ critical modificato, NO test modificato, vitest baseline 29 fail / 14466 pass preservata."
```

**NON PUSH AUTOMATICO.** Andrea ratify next session prima push.
