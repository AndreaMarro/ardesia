# Maker-2 Vol2 Phase 1 Completion
- Date: 2026-05-07T02:47:58Z
- Esperimenti audited: 14/14
- Chapters covered: 7, 8, 9, 10, 12 (cap11 GAP)
- Output file: automa/state/maker2-vol2-ch7-12-audit.md
- File size: 301 lines
- Top 3 findings:
  1. Cap11 GAP CONFIRMED (PDF pp.99-102 puramente teorico, ZERO ESPERIMENTO marker — ground truth match, code correctly omits cap11)
  2. PDF V0.9 typo discovered: triple inconsistency 'fotoresistore'/'fototransistor' (cap9-esp1 riga 2365, cap12 riga 2759); duplicato marker 'ESPERIMENTO 2' cap8 (righe 2229+2239 — vero esp3 inizia 2239); codice mappa correttamente in tutti i casi
  3. Solo 2/14 severity medium: v2-cap7-esp4 'variare R' non parametrizzato strutturalmente (R fixed=1000 identico a esp2), v2-cap12-esp1 capstone gap meccanici (ruote/supporto-batteria fisici extra-SVG)
- Gaps/issues:
  - 4/14 esperimenti hanno pdf_wires=null perché PDF è sintetico (cap7-esp3, cap7-esp4, cap10-esp3, cap10-esp4 = istruzioni "applica variazione esp precedente" senza step-by-step) → marcato figure_only_no_text + ereditano wiring esperimenti precedenti
  - PDF V0.9 errori tipografici libro segnalati ma fuori scope fix Cycle 2 (richiede update libro Davide)
- Cap11 confirmation: GAP CONFIRMED
- Status: COMPLETED
