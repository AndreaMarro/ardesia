# FASE 3: iPAD COMPLETO (S100–S101)
> Target: iPad da 7.0 → 9.5

## Filosofia
I bambini usano iPad. L'app deve funzionare PERFETTAMENTE con le dita.
- **Touch-first**: ogni interazione pensata per dita, non per mouse
- **No scrollbar**: tutto visible, niente nascosto dietro scroll
- **Immediate feedback**: tocca → succede subito (no 300ms delay)
- **Fat fingers**: target minimo 44×44px, spacing generoso

---

## S100 — iPad Layout Perfection (~2h)

### Dispositivi Target
| Device | Portrait | Landscape |
|--------|----------|-----------|
| iPad Mini 6th | 744×1133 | 1133×744 |
| iPad Air / iPad 10th | 820×1180 | 1180×820 |
| iPad Pro 11" | 834×1194 | 1194×834 |
| iPad Pro 12.9" | 1024×1366 | 1366×1024 |

### Checklist Layout
- [ ] **Toolbar**: fits su TUTTI i device senza overflow (già fixato S86 ma ri-verificare con nuovi stili S94-96)
- [ ] **Canvas**: occupa almeno 55% dello schermo in landscape, almeno 50% in portrait
- [ ] **Editor panel**: side panel in landscape, bottom sheet in portrait
- [ ] **Blockly**: workspace usabile con dita (categorie scrollabili, blocchi grandi)
- [ ] **ComponentDrawer**: card componenti scorrevoli, non overflow
- [ ] **Serial Monitor**: collassabile, non ruba spazio al canvas
- [ ] **Split View**: app funziona quando iPad è in modalità split screen
- [ ] **Virtual keyboard**: quando appare, l'editor si ridimensiona (non si copre)

### Breakpoint Strategy
```
< 600px:    Mobile (stack verticale)
600-767px:  Mobile landscape (slim panels)
768-1023px: iPad portrait (slide-over editor)
1024-1365px: iPad landscape (side-by-side)
1366+:      iPad Pro landscape / Desktop (generous spacing)
```

### 🧩 Scratch Gate (obbligatorio)
- [ ] SG1-SG10 — TUTTI PASS a viewport 1280×800
- [ ] Extra SG-iPad: SG1-SG9 ripetuti a viewport **1180×820** (iPad Air landscape)
- [ ] Extra SG-iPad: SG1-SG9 ripetuti a viewport **820×1180** (iPad Air portrait)
- [ ] Extra: pannello Blocchi `.codeEditorPanelScratch` non tagliato su iPad?
- [ ] Extra: categorie Blockly scrollabili con touch su iPad?

### Validazione Chrome (resize viewport)
Per ogni device/orientamento (8 combinazioni):
1. Resize viewport alla dimensione esatta
2. Screenshot
3. Verificare: toolbar no overflow, canvas visible, editor usabile
4. Blocchi tab: categorie leggibili, workspace non tagliato

---

## S101 — iPad Touch + Gestures (~2h)

### Drag & Drop Componenti
- [ ] Touch start → componente "si stacca" con scale(1.05) + shadow
- [ ] Touch move → segue il dito smoothly (no jitter)
- [ ] Touch end su breadboard → snap al foro più vicino
- [ ] Touch end fuori breadboard → torna alla posizione originale (animazione)
- [ ] `touch-action: none` su canvas per evitare scroll durante drag

### Wire Drawing su Touch
- [ ] Touch su pin → inizia filo (punto verde sul pin)
- [ ] Drag → filo segue il dito con curva naturale
- [ ] Release su altro pin → filo si collega (snap)
- [ ] Release nel vuoto → filo scompare (animazione)
- [ ] Multi-touch: un dito tiene fermo, l'altro disegna (se possibile)

### Pinch-to-Zoom (Canvas)
- [ ] Pinch → zoom in/out del canvas SVG (non del browser)
- [ ] Limiti: min 50%, max 200%
- [ ] Double-tap → fit-to-screen
- [ ] Pan con due dita quando zoomati

### Blockly Touch
- [ ] Categorie: scroll verticale con inerzia
- [ ] Blocchi: drag da toolbox al workspace con dita
- [ ] Connection: snap magnetico quando blocchi si avvicinano
- [ ] Undo: swipe 3 dita per annullare (o bottone)

### Context Menu (Long Press)
- [ ] Long press (500ms) su componente → menu circolare:
  - 🔄 Ruota
  - 🗑️ Elimina
  - ℹ️ Info
  - 🔌 Collega
- [ ] Feedback haptic (se disponibile via Vibration API)

### 🧩 Scratch Gate (obbligatorio)
- [ ] SG1-SG10 — TUTTI PASS
- [ ] Extra: Blockly drag&drop funziona con touch simulation (DevTools)?
- [ ] Extra: ScratchCompileBar "Compila & Carica" ha touch target ≥44px su iPad?

### Validazione Chrome
1. Simulare touch con DevTools (toggle device toolbar)
2. Drag componente dalla palette al canvas → snap corretto?
3. Disegnare filo tra due pin → connessione OK?
4. Pinch zoom → canvas si ingrandisce (non pagina)?
5. Long press → context menu appare?
6. Blockly: drag blocco da categoria al workspace → si aggancia?
