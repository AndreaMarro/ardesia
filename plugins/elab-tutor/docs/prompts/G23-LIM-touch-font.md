# G23 — LIM TOUCH + FONT

## OBIETTIVO: Canvas/SVG da 4/10 a 7/10. Tutto toccabile e leggibile sulla LIM.

## TASK
1. PIN_HIT_TOLERANCE 6px → 16px in SimulatorCanvas.jsx (1h)
2. Font SVG minimo 14px — tutti i testi nel canvas: padlock 7→14, labels 9→14, rotation 10→14 (4h)
3. Touch targets bottoni ChatOverlay 28px → 44px (2h)
4. Fix contrasto ConsentBanner: white on #4A7A25 (0.5h)
5. Fix DEV mock user: gate con `import.meta.env.DEV` in AuthContext.jsx (1h)
6. Fix console `[object Object]` in StudentTracker init log (0.5h)

## VERIFICA 8 STRATI CoV
1. Build & Test
2. Browser: toccare un pin con area 20px → si seleziona
3. Browser: inspect tutti i testi SVG → fontSize >= 14px
4. Browser: inspect tutti i bottoni → height >= 44px
5. Browser: ConsentBanner contrasto WebAIM checker >= 4.5:1
6. Console: 0 `[object Object]`, 0 DEV warnings
7. LIM 1024x768: pin toccabili, testo leggibile a 3 metri (screenshot)
8. Prof.ssa Rossi: tocca un LED al primo tentativo?

## REGOLE
- ZERO REGRESSIONI. Build + test dopo OGNI modifica.
- Non toccare engine/
- Verificare con preview_inspect, non a occhio
