# G24 — CSS RESPONSIVE REALE

## OBIETTIVO: Frontend/CSS da 5/10 a 7/10. Eliminare inline styles, media query LIM funzionanti.

## TASK
1. Migrare inline styles ChatOverlay → CSS classes (4h)
2. Migrare inline styles ConsentBanner → CSS classes (2h)
3. Migrare inline styles ReflectionPrompt → CSS classes (2h)
4. Verificare media query LIM funzionanti (2h)
5. Focus-visible states su tutti i bottoni (1h)

## VERIFICA 8 STRATI CoV
1. Build & Test
2. Browser pointer:coarse: font ≥ 18px, touch ≥ 48px
3. Nessun inline style con fontSize/width/height hardcoded nei 3 file
4. Tab order funzionante su tutti gli elementi interattivi
5. Browser: focus-visible visibile su Tab navigation
6. Console: 0 errori, 0 warnings
7. LIM 1024x768: media query applicata, testo ≥ 18px
8. Prof.ssa Rossi: naviga con Tab, vede il focus?

## REGOLE
- ZERO REGRESSIONI. Build + test dopo OGNI modifica.
- Non toccare engine/
- Verificare con preview_inspect, non a occhio
