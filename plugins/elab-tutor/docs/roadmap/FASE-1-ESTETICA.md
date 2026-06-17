# FASE 1: ESTETICA + MINIMALISMO (S94–S96)
> Target: Estetica da 6.5 → 9.5

## Filosofia
Il simulatore è per bambini delle medie. Deve essere:
- **Pulito**: niente rumore visivo, ogni pixel ha uno scopo
- **Coerente**: un solo set di colori, un solo set di font, un solo stile
- **Professionale**: sembra un'app vera, non un prototipo
- **Dark theme**: l'editor è dark, il canvas è light — il contrasto aiuta la concentrazione

---

## S94 — Design System Purge (~2h)

### Obiettivo
Eliminare TUTTI i colori hardcoded e unificare il tema.

### Checklist
- [ ] `grep -r "#[0-9a-fA-F]{3,8}" src/` — trovare tutti i colori hex
- [ ] Classificare: quali sono brand (navy/lime), quali sono tema (bg/border/text), quali sono errore
- [ ] Creare mappa: `#hex-vecchio → var(--color-nome)` per ogni occorrenza
- [ ] Sostituire in ordine: componenti SVG → panels → toolbar → modals → tooltips
- [ ] Verificare che `design-system.css` contenga TUTTE le variabili necessarie
- [ ] Font audit: trovare `font-family` inline, sostituire con `var(--font-*)`
- [ ] Screenshot 5 schermate: toolbar, editor, drawer, canvas, serial monitor

### File da toccare (stimati)
- `src/styles/design-system.css` — aggiungere variabili mancanti
- `src/styles/ElabTutorV4.css` — bulk replace hex → var
- `src/components/simulator/*.jsx` — inline styles con hex
- `src/components/simulator/panels/*.jsx` — inline styles
- `src/components/simulator/components/*.jsx` — SVG colori

### Validazione Chrome
1. Aprire simulatore → caricare Vol1 LED
2. Screenshot toolbar + canvas + editor
3. Aprire Vol3 AVR → Blocchi tab
4. Screenshot Blockly workspace
5. Dark mode consistency check: tutto scuro è uniforme?

### 🧩 Scratch Gate (obbligatorio)
- [ ] SG1-SG10 da `01-PIANO-MAESTRO.md` — TUTTI PASS
- [ ] Extra: i colori del Blockly workspace (dark theme) sono coerenti col nuovo design system?
- [ ] Extra: le categorie Scratch (Logica, Cicli, etc.) usano font/colori dal design system?

### Non toccare
- Logica/funzionalità — ZERO cambiamenti al behavior
- Layout/dimensioni — solo colori e font

---

## S95 — Toolbar + Panels Minimal (~2h)

### Obiettivo
Ogni panel ha spacing coerente, bordi puliti, niente decorazioni superflue.

### Checklist
- [ ] Toolbar: audit ogni bottone — icona + tooltip + spacing
- [ ] Toolbar: gruppi logici con separatori sottili (non spessi)
- [ ] ComponentDrawer: card componenti — padding, border-radius, hover state
- [ ] Editor tabs (Arduino C++ / Blocchi): tab design pulito
- [ ] ScratchCompileBar: design coerente con editor header
- [ ] Serial Monitor: header, font, background, scroll behavior
- [ ] Build mode selector (Già Montato / Passo Passo / Libero): pill buttons design
- [ ] Toast notifications / status messages: design consistente

### Principi di Design
- **Spacing**: multipli di 4px (4, 8, 12, 16, 20, 24)
- **Border radius**: `--radius-sm: 6px`, `--radius-md: 8px`, `--radius-lg: 12px`
- **Font sizes**: `--font-size-xs: 12px`, `--font-size-sm: 14px`, `--font-size-md: 16px`
- **Touch targets**: minimo 44×44px su ogni bottone
- **Hover/Focus**: transizione 150ms, colore accent `#7CB342` per focus

### 🧩 Scratch Gate (obbligatorio)
- [ ] SG1-SG10 — TUTTI PASS
- [ ] Extra: tab Arduino C++ / Blocchi hanno lo stesso design raffinato?
- [ ] Extra: ScratchCompileBar (Compila & Carica) ha lo stesso stile dei nuovi bottoni?

### Validazione Chrome
1. Tab-through toolbar: ogni bottone ha focus ring visibile?
2. Hover su ogni bottone: transizione fluida?
3. Resize 1280→1024→768: toolbar non overflow?
4. Screenshot before/after di ogni panel

---

## S96 — SVG Components + Canvas Polish (~2h)

### Obiettivo
I componenti devono sembrare veri. Il canvas deve sembrare una scrivania.

### Checklist per ogni componente SVG (22 totali)
- [ ] Colori: usa palette ufficiale, no grigi random
- [ ] Stroke: consistente (1px per pin, 2px per body)
- [ ] Ombra: `filter="drop-shadow()"` leggero per profondità
- [ ] Hover state: outline leggera quando mouse sopra
- [ ] Selected state: highlight accent `#7CB342`
- [ ] Dragging state: opacity 0.8 + scale(1.02)
- [ ] Aria labels: `role="img"` + `aria-label="Resistore 470Ω"` su tutti i 21 mancanti

### Canvas specifics
- [ ] Background: griglia sottile o texture "workbench"
- [ ] Breadboard: colori realistici (bianco/rosso/blu per power rails)
- [ ] Wires: curva naturale, colori differenziati per tipo, anti-alias
- [ ] Zoom controls: + / - / fit buttons posizionati coerentemente

### 🧩 Scratch Gate (obbligatorio)
- [ ] SG1-SG10 — TUTTI PASS
- [ ] Extra: i blocchi Scratch usano colori coerenti col nuovo SVG style?
- [ ] Extra: il pannello Blocchi ha la stessa qualità visiva del pannello Arduino?

### Validazione Chrome
1. Zoom 200% su ogni componente — pixelation? bordi sfocati?
2. Drag componente — feedback visuale fluido?
3. Wire drawing — curva naturale?
4. Screenshot confronto con foto reali componenti
