# 05 — iPad & Responsive

> Ultimo aggiornamento: Sprint 1.1 (11/03/2026)

## Breakpoints Canonici (design-system.css)

| Breakpoint | Range | Target |
|------------|-------|--------|
| Mobile portrait | < 600px | iPhone SE (375px), iPhone 14 Pro (393px) |
| Mobile landscape | 600px - 767px | iPhone landscape |
| iPad portrait | 768px - 1023px | iPad Mini (768px) |
| iPad landscape | 1024px - 1365px | iPad Air (1180px), iPad Pro (1024px) |
| Desktop | >= 1366px | Standard desktop |
| Wide desktop | >= 1440px | Full HD+ |

**REGOLA**: Tutti i `@media` DEVONO usare questi valori esatti. No 900px, no 1200px, no 1400px.

## File CSS Responsive

| File | Breakpoints | Ruolo |
|------|-------------|-------|
| `layout.module.css` | 599/600/767/768/1023/1024/1365/1440 | Layout principale simulatore |
| `ElabSimulator.css` | 599/767/768/1023/1024/1365/1366 | Toolbar, canvas, pulsanti sim |
| `tutor-responsive.css` | 599/600/767/768/1023/1024/1440 | Chat Galileo, pannelli tutor |
| `ElabTutorV4.css` | 768 | Chat overlay mobile |
| `overlays.module.css` | 599/600/767/768/1023/1440 | Overlays (pot, LDR, rotate) |
| `codeEditor.module.css` | (da verificare) | Editor codice |
| `TutorTools.css` | 500/600 | Tools Galileo (quiz, canvas) |

## Touch Targets

- Minimum: 44px (WCAG, `--touch-min: 44px` in design-system.css)
- Verificato S86: SerialMonitor iconBtn, toggle, hamburger, editor tabs, font btns, compile btn
- `touch-action: none` su `.elab-simulator-canvas` (prevent browser pinch-zoom)
- `touch-action: manipulation` su `.toolbar` (prevent 300ms tap delay)

## iPad-Specific Fixes (S86)

- Toolbar overflow: 0px (was 397px), spacer collapse
- Galileo/info nascosti at <= 1365px
- Scratch: vertical stack in portrait (Blockly 60% + code 40%)
- Toolbar fits 768px

## Z-Index Hierarchy

```
Canvas:     20-80
Editor:     200
Chat:       400
Hints:      1000
```

## Problemi Noti iPad

1. **Slide-over UX**: iPad multitasking slide-over non ottimizzato
2. **RotateDeviceOverlay**: potrebbe non apparire correttamente
3. **Mammoth.js**: modulepreloaded (lazy-load migliorerebbe perf iPad)
4. No `aria-live` per stato simulazione (screen reader)

## Protocollo Test iPad

Per ogni fix che tocca UI:
1. Resize 768x1024 (iPad Mini portrait)
2. Resize 1024x768 (iPad landscape)
3. Resize 1180x820 (iPad Air landscape)
4. Verificare: no overflow X, font >= 14px, pulsanti >= 44px, pannelli non sovrapposti
