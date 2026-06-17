# G24 — CSS RESPONSIVE REALE

## OBIETTIVO: Frontend/CSS da 5/10 a 7/10. Le media query per LIM devono FUNZIONARE.

## PROBLEMA
tutor-responsive.css ha regole per `@media (pointer: coarse)` con font 18px e touch 48px.
Ma ChatOverlay, ReflectionPrompt, ConsentBanner usano inline styles che SOVRASCRIVONO tutto.

## TASK
1. ChatOverlay.jsx: migrare 40+ inline style objects → CSS classes (4h)
   - Creare chat-overlay.module.css
   - Sostituire ogni `style={{ fontSize: '0.88em' }}` con className
   - Le media query di tutor-responsive.css devono funzionare
2. ConsentBanner.jsx: inline → CSS classes (2h)
3. ReflectionPrompt.jsx: inline → CSS classes (2h)
4. Verificare: pointer:coarse media query effettiva su tutti e 3 (2h)
5. Focus-visible states su tutti i bottoni (1h)

## VERIFICA 8 STRATI CoV
1. Build & Test
2. Browser desktop: layout invariato (no regressione visiva — screenshot before/after)
3. Browser pointer:coarse (preview_eval → matchMedia): font >= 18px
4. Browser pointer:coarse: touch targets >= 48px
5. Code audit: 0 inline fontSize/width/height nei 3 file migrati
6. Code audit: grep `style={{` nei 3 file → count ridotto del 80%+
7. Tab order: tutti gli elementi navigabili con Tab
8. Focus ring visibile su ogni bottone focusabile

## REGOLE
- ZERO REGRESSIONI VISIVE. Screenshot before/after per ogni file.
- Non toccare logica — solo stili.
