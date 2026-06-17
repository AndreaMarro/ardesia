# QUALITY AUDIT G14 — "LA PROF.SSA PARLA" + 9 SESSIONI CUMULATIVE
> Data: 28/03/2026 | Auditor: Claude Opus 4.6 | Brutalmente onesto
> Principio Zero: L'insegnante arriva alla LIM e spiega IMMEDIATAMENTE

---

## SCORE CARD QUANTITATIVA

| Metrica | Valore | Target | Status | Note |
|---------|--------|--------|--------|------|
| **fontSize < 14px (teacher-facing)** | ~35 | 0 | FAIL | ChatOverlay 14px, BuildModeGuide 14px, toasts 14px, LDR overlay 14px |
| **fontSize < 14px (admin/gestionale)** | ~145 | N/A | SKIP | Non visibile all'insegnante |
| **fontSize < 14px (simulatore internals)** | ~63 | N/A | CONCERN | Componenti SVG labels, toasts, loading |
| **Touch targets < 44px** | 3+ | 0 | FAIL | Mute toggle 36px, UnlimModeSwitch knob 16px, close buttons |
| **Bundle main chunk** | 1,567 KB | <1200 KB | FAIL | index-BmWsQZYA.js (gzip: 724KB) |
| **Bundle ElabTutorV4** | 1,117 KB | <800 KB | FAIL | Monolith — needs splitting |
| **Bundle react-pdf** | 1,486 KB | lazy-load | WARN | Solo per report — non serve al boot |
| **console.log/warn/error** | 46 calls | 0 in prod | FAIL | 14 in ElabTutorV4, 8 in gdprService |
| **alert()** | 1 | 0 | FAIL | Toast.jsx — must be replaced |
| **aria-label/role coverage** | 151 | >100 | PASS | Buona copertura a11y base |
| **Build time** | 42s | <30s | FAIL | Dev server running aumenta il tempo |
| **PWA precache** | 4,121 KB | <4,000 | WARN | Leggermente sopra target |
| **Regressioni G14** | 0 | 0 | PASS | Zero regressioni |
| **TTS funzionante** | SI | SI | PASS | Web Speech API, italiano |
| **STT funzionante** | SI | SI | PASS | SpeechRecognition, it-IT |

---

## FONT SIZE DEEP DIVE — TEACHER-FACING

File visibili all'insegnante con fontSize < 14px:

| File | Occorrenze | Gravita | Dettaglio |
|------|------------|---------|-----------|
| `ChatOverlay.jsx` | 3 | **P1** | fontSize: '14px' su testo chat — su LIM a 3m illeggibile |
| `BuildModeGuide.jsx` | 2 | P2 | fontSize: 14 su istruzioni di montaggio |
| `LdrOverlay.jsx` | 1 | P2 | fontSize: 14 su label overlay |
| `NewElabSimulator.jsx` | 5 | P2 | Toast "Foto salvata" 14px, loading 14px |
| `CircuitReview.jsx` | 3 | P2 | fontSize: '0.88rem' (~14px) |
| `PredictObserveExplain.jsx` | 2 | P2 | fontSize: '0.875rem' (~14px) |
| `ReverseEngineeringLab.jsx` | 2 | P2 | fontSize: '0.875rem' |
| `SafeMarkdown.jsx` | 1 | P2 | fontSize: '0.88rem' base |
| `StudentDashboard.jsx` | 5 | P2 | Testi 14px nel diario studente |
| `UnlimOverlay.jsx` | 1 | P3 | fontSize: '22px' su emoji — ok |

**Totale teacher-facing < 14px**: ~25 istanze in 10 file
**Fix minimo**: Portare tutto a 16px nei componenti visibili su LIM

---

## TOUCH TARGET VIOLATIONS

| Elemento | Size | File | Fix |
|----------|------|------|-----|
| Mute toggle 🔊 | 36x36px | UnlimWrapper.jsx:287 | → 44x44px |
| UnlimModeSwitch knob | 16x16px | UnlimModeSwitch.jsx:88 | → 24px min |
| Switch container | 20px height | UnlimModeSwitch.jsx:77 | → 32px min |

---

## BUNDLE ANALYSIS

```
CHUNKS > 500 KB (gzipped):
index-BmWsQZYA.js    1,567 KB (724 KB gzip) — core app
react-pdf            1,486 KB (497 KB gzip) — PDF viewer
ElabTutorV4          1,117 KB (260 KB gzip) — tutor monolith
ScratchEditor          731 KB (191 KB gzip) — Scratch blocks
mammoth                500 KB (130 KB gzip) — DOCX parser
codemirror             474 KB (156 KB gzip) — code editor
```

**Osservazione critica**: `react-pdf` (1.5MB) e `mammoth` (500KB) sono caricati al boot ma servono SOLO per report/PDF. Se lazy-loaded, il boot risparmia 2MB.

---

## EVOLUZIONE 9 SESSIONI (G5→G14)

| Metrica | G5 | G9 | G12 | G13 | G14 | Trend |
|---------|----|----|-----|-----|-----|-------|
| UNLIM vision | 1.0 | 1.5 | 3.5 | 5.5 | **6.5** | +5.5 |
| Composito insegnante | 5.7 | 6.0 | 6.5 | 7.0 | **7.5** | +1.8 |
| Bottoni toolbar | 28 | 28 | 3 | 3 | **3** | -25 |
| Tab visibili | 8 | 8 | 0 | 0 | **0** | -8 |
| Progressive Disclosure | 5% | 5% | 65% | 65% | **65%** | +60% |
| Voce TTS | NO | NO | NO | NO | **SI** | NEW |
| Voce STT | NO | NO | NO | NO | **SI** | NEW |
| Galileo testato live | NO | NO | NO | NO | **SI** | NEW |
| Mascotte | "U" | "U" | "U" | Robot | **Robot** | OK |
| Messaggi posizionati | NO | NO | NO | SI | **SI** | OK |

---

## PROBLEMI CRITICI APERTI (ONESTI)

### P0 — Bloccanti per la demo
1. **ChatOverlay.jsx ancora attivo** — mostra una vecchia chat "UNLIM Online" che compete con il sistema overlay UNLIM. Confonde l'insegnante: due interfacce chat.
2. **Nessun truncamento risposte** — Galileo risponde 60-80 parole. Su un overlay bubble, max 30-40 parole sono leggibili.

### P1 — Gravi per LIM
3. **14px font su chat/toast/guide** — illeggibile su LIM proiettata a 3m
4. **Mute toggle 36px** — sotto il minimo touch 44px, difficile da premere su touch screen
5. **Bundle 4.1MB al boot** — su connessione scuola (10 Mbps shared), boot lento

### P2 — UX Issues
6. **UNLIM mode switch** — "Passa a modalita Classic" non ha senso per un insegnante che non sa cos'e' "Classic"
7. **Lesson path panel** auto-apre sulla destra — copre parte della breadboard
8. **Input placeholder "Chiedi qualcosa a UNLIM..."** — dovrebbe dire "Parla o scrivi al robot"
9. **console.log in produzione** — 46 chiamate, rallentano e inquinano DevTools

### P3 — Nice to have
10. **react-pdf lazy load** — risparmia 1.5MB al boot
11. **mammoth lazy load** — risparmia 500KB
12. **SVG component labels** — fontSize nei componenti SVG (R1, LED1) potrebbe essere piu grande

---

## CONFRONTO CON PRINCIPIO ZERO

> "L'insegnante deve poter arrivare alla lavagna e spiegare PER MAGIA anche se non sa niente."

| Aspetto | Stato | Giudizio |
|---------|-------|----------|
| Arriva e vede il simulatore | ✅ #prova → circuito | BENE |
| 3 bottoni chiari | ✅ Play, Esperimento, UNLIM | BENE |
| Clicca robot → parla | ✅ Mic + input | BENE |
| Robot risponde a voce | ✅ TTS | BENE |
| Messaggio accanto al LED | ✅ Contestuale | **ECCELLENTE** |
| Deve leggere chat testuale | ❌ ChatOverlay ancora li | **PROBLEMA** |
| Testo leggibile su LIM | ❌ 14px troppo piccolo | **PROBLEMA** |
| Zero confusione | ❌ Due interfacce chat | **PROBLEMA** |
| Boot veloce su WiFi scuola | ❌ 4.1MB | **MIGLIORABILE** |

**Score Principio Zero: 6.5/10** — Funziona ma ha frizioni visibili.

---

## RACCOMANDAZIONI PRIORITARIE

1. **RIMUOVERE o NASCONDERE ChatOverlay** in UNLIM mode — una sola interfaccia
2. **fontSize minimo 16px** su tutti i componenti teacher-facing
3. **Touch targets 44px** su mute toggle e mode switch
4. **Troncare risposte Galileo** a 40 parole + "Vuoi saperne di piu?"
5. **Lazy-load react-pdf e mammoth** — -2MB al boot
6. **Rimuovere console.log** dal codice produzione (usare logger.js)
7. **Rinominare mode switch** — "UNLIM" toggle senza "Classic"
8. **Placeholder input** → "Parla o scrivi al robot..."
