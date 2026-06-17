# INVARIANTI — Regole Inviolabili

> Queste regole NON si possono violare MAI durante l'implementazione.
> Leggere ad ogni inizio sessione.

---

## 1. Handler che NON si toccano

```
handleWheel       — zoom con rotella mouse. Resta event listener useEffect separato (passive:false).
handleKeyDown     — keyboard shortcuts. Resta event listener separato.
handleBackgroundClick — click su sfondo SVG. Resta su onClick dell'SVG.
```

## 2. CSS obbligatorio per Pointer Events

```css
/* SVG element DEVE avere questa proprieta' */
touch-action: none;
/* Senza questo, iOS Safari intercetta i gesti e il pointer capture non funziona */
```

## 3. Pin Naming

```
CORRETTO:   bus-bot-plus / bus-bot-minus
SBAGLIATO:  bus-bottom-plus / bus-bottom-minus

Capacitor: positive / negative
Potentiometer: vcc / signal / gnd
Multimeter: probe-positive / probe-negative
RGB LED: red / common / green / blue
```

## 4. Build Steps

```
Le posizioni nei buildSteps sono SEMPRE la posizione FINALE del libro.
Mai posizioni temporanee o intermedie.
```

## 5. Galileo AI

```
- Parla in linguaggio semplice (target 8-14 anni) per TUTTI (studenti E insegnanti)
- NON rivela MAI la sua architettura interna (multi-specialist, vision, etc.)
- Si presenta come "Galileo, l'assistente AI di ELAB Tutor"
```

## 6. Theme e Stile

```
- Force-light theme: data-theme="light" SEMPRE
- Zero emoji nei file sorgente (salvo richiesta esplicita)
- Watermark: "Andrea Marro" ogni 200 righe di JS in build (vite.config.js copyrightWatermark plugin)
  Formato: /* (c) Andrea Marro — YYYY-MM-DD — ELAB Tutor — Tutti i diritti riservati */
  Si applica AUTOMATICAMENTE durante npm run build — NON aggiungere manualmente
- Palette: Navy #1E4D8C, Lime #7CB342
```

## 7. Deploy

```
- npm run build DEVE passare con 0 errori PRIMA di ogni deploy
- Deploy Vercel: npm run build && npx vercel --prod --yes
- MAI deployare senza aver verificato la build
```

## 8. SVG Simulator

```
- BB_HOLE_PITCH = 7.5px
- SNAP_THRESHOLD = 4.5px
- NanoR4Board SCALE = 1.8
- ATmega328p pin map: D0-D7=PORTD, D8-D13=PORTB, A0-A5=PORTC
```

## 9. NanoBreakout V1.1 GP

```
- DEVE stare ON breadboard (semicircle LEFT, wing RIGHT, MAI floating)
- Wing pins: W_A0-W_A5, W_D3, W_D5, W_D6, W_D9-W_D13
- Pins NOT on wing: D2, D4, D7, D8 — DEVONO usare sostituti
- Standard subs: D8->D10, D7->D3, D2->D6, D4->D10
```

## 10. Pointer Events — Regole specifiche per questo piano

```
- isPrimary=false → IGNORARE (palm rejection)
- setPointerCapture(pointerId) su pointerdown per tutti i pointer
- releasePointerCapture(pointerId) su pointerup/pointercancel
- pointercancel DEVE fare la stessa cleanup di pointerup
- activeTouchesRef (Map) per tracciare multi-touch/pinch
- pointerTypeRef per distinguere mouse/touch/pen nei handler successivi
```

## 11. Code Quality

```
- .trim() su TUTTE le letture env var URL (Vercel puo' aggiungere \n)
- Nessun console.log in produzione (logger.js isDev guard)
- Accenti italiani corretti (perche' con backtick, non UTF-8 con apostrofo)
```
