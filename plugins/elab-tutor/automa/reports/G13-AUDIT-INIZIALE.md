# G13 Audit Iniziale

**Data**: 28/03/2026
**Sessione**: G13 "IL ROBOT PRENDE VITA"

## Stato pre-G13

| Metrica | Valore |
|---------|--------|
| Build | PASSA (26s) |
| PWA | 19 entries, 4.1 MB |
| Mascotte | Lettera "U" statica |
| Messaggi | Toast top-center fisso |
| UNLIM vision | 3.5/10 |
| Progressive Disclosure | 65% |
| Composito insegnante | 6.5/10 |

## File critici pre-modifica

| File | LOC | Stato |
|------|-----|-------|
| UnlimMascot.jsx | 70 | Lettera "U", 1 animazione |
| UnlimOverlay.jsx | 157 | 3 posizioni hardcoded |
| UnlimWrapper.jsx | 216 | position: 'top-center' ovunque |
| SimulatorCanvas.jsx | ~2400 | Nessun data-component-id |
| ElabTutorV4.jsx | ~2400 | Highlight senza messaggio contestuale |

## Asset mascotte

- `public/elab-mascot.png` — robot ELAB con testo (465x609px)
- `public/assets/mascot/logo-senza-sfondo.png` — robot solo, sfondo trasparente (200x200px approx)
- `public/assets/mascot/logo-transparent.png` — idem
- `public/assets/mascot/logo-omaric-elab.png` — logo Omaric+ELAB
- `public/assets/mascot/logo-elab-url.jpg` — logo con URL

## Piano di esecuzione

1. FASE 1: UnlimMascot.jsx → usa PNG reale, 3 stati CSS
2. FASE 2: UnlimOverlay.jsx → posizionamento contestuale via getBoundingClientRect
3. FASE 3: Bridge ElabTutorV4 → UnlimWrapper via CustomEvent
4. FASE 4: Verifica, CoV, score card
