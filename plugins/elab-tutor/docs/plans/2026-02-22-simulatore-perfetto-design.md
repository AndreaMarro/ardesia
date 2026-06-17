# Design: Simulatore Perfetto — ELAB S39+
**Data:** 22/02/2026
**Autore:** Andrea Marro
**Stato:** Approvato
**Score attuale:** ~8.3/10 | **Target:** 10/10

---

## Obiettivo

Portare il simulatore ELAB a parità totale con i libri fisici:

1. **Componenti identici al libro** — SVG Tinkercad-style, tutti e 21 verificati
2. **Esperimenti identici al libro** — 69/69 con wiring, buildSteps, steps text CoV-verificati
3. **Build modes funzionanti** — Già Montato / Passo Passo / Esplora Libero testate in browser
4. **Volume gating corretto** — Vol1 mostra solo Vol1, Vol2 cumula Vol1+Vol2, ecc.
5. **Drag & drop preciso** — snapping sulla breadboard, feedback visivo, facile da usare
6. **Galileo ↔ Simulator integrazione completa** — contesto live, guida passo-passo, quiz in context

---

## Stato di Partenza (S38)

| Area | Score | Note |
|------|-------|------|
| SVG Componenti (21) | 9.5/10 | S38: tutti Tinkercad-redesigned, 6 fix |
| Esperimenti (69/69) | 9.0/10 | S34/S35: CoV completa, 10 bug gap wiring fixati |
| Build Modes (3) | 7.5/10 | S37: implementate, MAI testate in browser |
| Volume Gating | 8.5/10 | S37: visibile+bypass, untested con utente reale |
| Galileo AI | 8.5/10 | S37: experiment context injection, -1.5 mobile UX |
| Drag & Drop | ~7.0/10 | Non auditato sistematicamente |

---

## Architettura di Esecuzione

```
Ralph Loop (iterazione continua)
  ↓
Serena (find_symbol / replace_symbol_body — chirurgia precisionale)
  ↓
preview_start → npm run dev (porta 5173)
  ↓
Claude in Chrome (testing interattivo: click, drag, form, scroll)
  ↓
preview_screenshot (proof visivo a ogni milestone)
  ↓
Playwright (regression automatica)
  ↓
claude-mem (ogni osservazione catturata permanentemente)
  ↓
vercel deploy (quando ogni loop è completo)
```

---

## Piano in 4 Loop

### Loop 1 — Build Modes (Target: 10/10)
**File principali:** `NewElabSimulator.jsx`, `BuildModeGuide.jsx`, `ExperimentPicker.jsx`

**Criteri di successo:**
- [ ] `Già Montato`: selezionare un esperimento piazza TUTTI i componenti nelle posizioni del libro
- [ ] `Passo Passo`: ogni step piazza UN componente nella posizione FINALE del libro
- [ ] `Esplora Libero`: canvas vuoto, drag & drop libero
- [ ] 3 esperimenti campione testati in Chrome: v1-cap6-esp1, v2-cap7-esp2, v3 (se disponibile)
- [ ] Nessun componente fuori posto o sovrapposto

**Testing:** Claude in Chrome — seleziona ogni modo, verifica visivamente ogni esperimento campione
**Promise:** `<promise>BUILD_MODES_VERIFIED</promise>`

---

### Loop 2 — Volume Gating + Drag & Drop (Target: 10/10)
**File principali:** `ExperimentPicker.jsx`, `ComponentPalette.jsx`, `NewElabSimulator.jsx`, `SimulatorCanvas.jsx`

**Criteri di successo:**
- [ ] Vol1 selezionato → ComponentPalette mostra SOLO componenti Vol1
- [ ] Vol2 selezionato → ComponentPalette mostra Vol1 + Vol2 cumulativi
- [ ] Vol3 selezionato → tutti i componenti
- [ ] Drag da ComponentPalette → snapping preciso sulla breadboard
- [ ] Wire drawing: click-drag-release fluido, colore corretto
- [ ] Componente spostato non rompe le connessioni esistenti

**Testing:** Claude in Chrome — simula studente che seleziona Vol1, trascina LED, verifica snapping
**Promise:** `<promise>VOLUME_DRAGDROP_VERIFIED</promise>`

---

### Loop 3 — Galileo ↔ Simulator Full Integration (Target: 10/10)
**File principali:** `GalileoResponsePanel.jsx`, `ElabTutorV4.jsx`, `ChatOverlay.jsx`, `NewElabSimulator.jsx`

**Criteri di successo:**
- [ ] Galileo riceve: quale esperimento è caricato, quale modo (Già Montato/Passo Passo/Esplora)
- [ ] Galileo riceve: stato circuito (LED acceso? cortocircuito? tensione nodi)
- [ ] Galileo guida step-by-step in Passo Passo mode
- [ ] Galileo sa quale step è corrente e suggerisce il prossimo
- [ ] Galileo integra il quiz: sa se lo studente ha risposto correttamente
- [ ] Mobile: ChatOverlay non supera 60vh, tutte le funzioni accessibili

**Testing:** Claude in Chrome — monta circuito rotto, chiede a Galileo perché non funziona
**Promise:** `<promise>GALILEO_INTEGRATED</promise>`

---

### Loop 4 — Polish Finale + Deploy (Target: 10/10)
**File principali:** tutti

**Criteri di successo:**
- [ ] `npm run build` → 0 errori, 0 warning
- [ ] Screenshot proof: Vol1, Vol2, Vol3 esperimento montato in Già Montato
- [ ] Screenshot proof: Passo Passo step-by-step funzionante
- [ ] Screenshot proof: Galileo risponde in context a circuito rotto
- [ ] Deploy Vercel → prod confermato
- [ ] claude-mem: tutte le osservazioni catturate

**Promise:** `<promise>SIMULATORE_COMPLETO</promise>`

---

## Stack Tecnologico

| Strumento | Ruolo |
|-----------|-------|
| **Ralph Loop** | Iterazione continua fino al goal |
| **Serena** | `find_symbol`, `replace_symbol_body` — zero rischio regressioni |
| **preview_start** | Dev server locale sempre attivo (porta 5173) |
| **Claude in Chrome** | Testing interattivo reale: click, drag, scroll, verifica visiva |
| **preview_screenshot** | Proof visivo ad ogni milestone |
| **Playwright** | Regression test automatici |
| **claude-mem** | Ogni osservazione/decisione catturata permanentemente |
| **quality-audit skill** | Audit sistematico prima del deploy finale |
| **volume-replication skill** | CoV vs PDF per esperimenti dubbi |

---

## Regole Invarianti (NON modificare mai)

1. **Pin positions IMMUTABLE** — nessuna modifica a `x`, `y` dei pin in SVG
2. **0 glow/shadow/filter** nel SVG — stile Tinkercad flat
3. **CoV obbligatoria** — ogni modifica a experiments verificata vs PDF
4. **Build 0 errori** — mai deployare con warning
5. **Watermark:** `Andrea Marro — DD/MM/YYYY`

---

## Definizione di "Done"

Il simulatore è completo quando:
- Ogni esperimento dei 3 volumi si monta con un click in `Già Montato`
- Ogni esperimento si costruisce step-by-step in `Passo Passo` con posizioni identiche al libro
- Galileo guida, spiega e fa quiz in modo contestuale al circuito attuale
- Claude in Chrome non trova nessun bug visivo o funzionale dopo test completo
- Screenshot del risultato finale per ogni volume

---

*Generato automaticamente dalla sessione di brainstorming S39 — 22/02/2026*
