# G13 FASE 1 — Mascotte Robot ELAB

**Data**: 28/03/2026
**Stato**: COMPLETATO

## Cosa è cambiato

### PRIMA
- `UnlimMascot.jsx`: bottone circolare 64px con lettera "U" bianca su sfondo navy
- Nessun SVG/immagine del robot
- Animazione: solo `box-shadow` pulse quando speaking

### DOPO
- `UnlimMascot.jsx`: bottone rettangolare arrotondato 64x72px con PNG del robot ELAB reale
- Usa `logo-senza-sfondo.png` (mascotte ufficiale) — pixel perfect
- 3 stati animati:
  - **idle**: `unlim-breathe` — scale 1→1.03 (3s ciclo)
  - **active**: bordo lime #4A7A25, ombra glow verde
  - **speaking**: `unlim-speak-bounce` (0.8s) + `unlim-speak-glow` (1.5s)
- Hover: scale 1.1, Active: scale 0.95
- Forma: `borderRadius: 18px` — mostra robot intero (testa+corpo+spina)

### File modificati
- `src/components/unlim/UnlimMascot.jsx` — riscrittura completa
- `src/assets/mascot/unlim-robot.svg` — creato (SVG di backup, non usato nel componente)

### Build
- PASSA (26s, 19 entries PWA)
