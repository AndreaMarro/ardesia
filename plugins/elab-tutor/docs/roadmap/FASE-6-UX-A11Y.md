# FASE 6: UX POLISH + ACCESSIBILITY (S107)
> Target: Responsive/A11y da 8.0 → 9.5 + cleanup tecnico

## S107 — UX Polish + Accessibility (~2h)

### Accessibility (WCAG 2.1 AA)

#### Skip-to-content (P2-RES-10)
- [ ] Link nascosto che appare al primo Tab
- [ ] "Vai al simulatore" → focus sul canvas
- [ ] Stile: visible on focus, invisibile altrimenti

#### Focus-visible custom (P2-RES-11)
- [ ] Ring personalizzato: `outline: 2px solid var(--color-accent)` + offset
- [ ] Su TUTTI gli elementi interattivi (button, input, select, a)
- [ ] Non visibile su click mouse (solo keyboard)
- [ ] `:focus-visible` + fallback `:focus:not(:focus-visible)`

#### SVG Keyboard Navigation (P2-RES-9)
- [ ] Ogni componente SVG: `tabindex="0"` + `role="img"` + `aria-label`
- [ ] Arrow keys per muovere componente selezionato (Step: 7.5px = 1 hole)
- [ ] Enter/Space per selezionare/deselezionare
- [ ] Delete per rimuovere componente selezionato
- [ ] Escape per deselezionare

#### Aria Labels (21 SVG mancanti)
- [ ] Template: `aria-label="{ComponentType} {id}: {value}"`
  - es. "Resistore r1: 470Ω"
  - es. "LED led1: rosso"
  - es. "Arduino Nano nano1"

### Technical Cleanup

#### Orphan Files (P2-VET-4)
- [ ] Elencare tutti i 61 file orfani con path
- [ ] Chiedere conferma utente prima di eliminare
- [ ] Eliminare in batch + verificare build
- [ ] Salvare ~11.7MB

#### CollisionDetector useMemo (P2-WIR-2)
- [ ] Trovare il useMemo ridondante
- [ ] Rimuovere o ottimizzare
- [ ] Verificare performance drag-drop

#### Session Messages Sanitization (P2-NAN-7)
- [ ] Sanitizzare messaggi prima di salvarli in sessione
- [ ] Strip HTML tags, limitare lunghezza, escape special chars

#### Custom Modals (P3-L1) — se non fatto in S99
- [ ] Sostituire tutti i `confirm()` con `<ConfirmModal>`
- [ ] Smooth animation, branded design

### 🧩 Scratch Gate (obbligatorio)
- [ ] SG1-SG10 — TUTTI PASS
- [ ] Extra: Tab-through nel pannello Blocchi funziona? (tab → categorie → workspace)
- [ ] Extra: Focus-visible ring visibile su tab "Blocchi" e "Arduino C++"?
- [ ] Extra: ScratchEditor ha aria labels per blocchi?

### Validazione Chrome
1. Tab-through: dal primo bottone all'ultimo senza mouse
2. Skip-to-content: Tab → link appare → Enter → focus sul canvas
3. SVG navigation: Tab su LED → Arrow keys → si muove
4. Focus ring: visibile solo su keyboard, non su click
5. Screen reader simulation: ogni componente ha label leggibile
6. Build post-cleanup: 0 errori, bundle size ridotto
