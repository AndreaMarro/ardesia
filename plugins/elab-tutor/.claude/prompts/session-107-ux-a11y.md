# Session 107 — UX Polish + Accessibility
> **FASE 6: RIFINITURA + ACCESSIBILITA'** — Sessione 14 di 15 (S94-S108)
> Target: Responsive/A11y da 8.0 → 9.5 + cleanup tecnico

## Context obbligatorio
1. Leggi `docs/roadmap/CONTESTO-SESSIONI.md` (cervello condiviso)
2. Leggi `docs/roadmap/00-STATO-ATTUALE.md` (score card attuale)
3. Leggi `docs/roadmap/FASE-6-UX-A11Y.md` (dettaglio FASE 6)

## Stato da S106
- AI Integration: 10.0 (stress test 48/50 PASS, 0 identity leaks)
- Build: 0 errors
- Scratch Gate: SG1-SG10 cv
- Responsive/A11y: 8.0 (gap: no skip-to-content, no focus-visible, 21 SVG senza aria)
- Code Quality: 9.8
- OVERALL: ~8.7

## Task (in ordine)

### FASE A — Skip-to-content (P2-RES-10)
- [ ] Aggiungi link nascosto all'inizio di `App.jsx` o `index.html`
- [ ] Testo: "Vai al simulatore" (italiano)
- [ ] Stile: `position: absolute; left: -9999px` → `:focus { left: 0; top: 0; z-index: 9999 }`
- [ ] Target: `#elab-simulator-canvas` o equivalente
- [ ] Verifica: Tab → appare → Enter → focus sul canvas

### FASE B — Focus-visible custom (P2-RES-11)
- [ ] In `design-system.css`, aggiungi regola globale:
  ```css
  :focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  ```
- [ ] Verifica che NON appare su click mouse
- [ ] Verifica su: button, input, select, a, tab headers

### FASE C — SVG Aria Labels (P2-RES-9)
- [ ] Per ogni SVG component: `role="img"` + `aria-label="{Tipo} {id}: {valore}"`
- [ ] Lista dei 21 SVG: trova con `grep -r "function.*SVG\|const.*SVG" src/components/simulator/svg/`
- [ ] Template: "Resistore r1: 470 ohm", "LED led1: rosso", "Arduino Nano nano1"

### FASE D — Keyboard navigation canvas
- [ ] Componenti SVG selezionabili: `tabindex="0"`
- [ ] Arrow keys: muovi componente selezionato (step: 7.5px)
- [ ] Enter/Space: seleziona/deseleziona
- [ ] Delete: rimuovi componente
- [ ] Escape: deseleziona

### FASE E — Technical Cleanup
- [ ] **P2-WIR-2**: CollisionDetector useMemo ridondante — trova e rimuovi/ottimizza
- [ ] **P2-NAN-7**: Sanitizza messaggi sessione in `nanobot/server.py` (strip HTML, limit length)
- [ ] **P3-L1**: Se tempo rimane, sostituisci `confirm()` con `<ConfirmModal>` component
- [ ] **P2-VET-4**: Elenca 61 orphan files — CHIEDI CONFERMA prima di eliminare

### FASE F — Verifica
- [ ] `npm run build` — 0 errori
- [ ] Scratch Gate SG1-SG10
- [ ] Tab-through: dal primo bottone all'ultimo senza mouse
- [ ] Skip-to-content: Tab → link appare → Enter → focus
- [ ] Focus ring: visibile solo keyboard, non click
- [ ] Aggiorna `CONTESTO-SESSIONI.md` con risultati

## Regole
- Sequenziale: FASE A prima di B, B prima di C, etc.
- Scratch Gate OBBLIGATORIO — 10/10 PASS
- NO agenti paralleli
- Build 0 errors OBBLIGATORIO
- Aggiorna score card e file registro a fine sessione
- CoV: tab-through + screen reader simulation

## Attivazione
```
Sei la Sessione 107 della roadmap ELAB (S94-S108). Il tuo focus: UX Polish + Accessibility.
Leggi docs/roadmap/CONTESTO-SESSIONI.md, poi docs/roadmap/FASE-6-UX-A11Y.md.
Target: Responsive/A11y da 8.0 → 9.5. Skip-to-content, focus-visible, aria labels, keyboard nav.
Alla fine fai CoV (tab-through test) e dammi la stringa di attivazione della sessione successiva (S108).
```
