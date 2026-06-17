# Benchmark ELAB Tutor — 2026-04-12

## Score Finale: 6.8/10

> 3611 test totali (3144 categorizzati + 467 generici), 0 fail, 30 categorie

| # | Categoria | Test | Pass | Fail | Score | Peso |
|---|-----------|------|------|------|-------|------|
| 1 | Homepage | 13 | 13 | 0 | 8/10 | 3x |
| 2 | Consent/GDPR | 72 | 72 | 0 | 10/10 | 3x |
| 3 | Lavagna | 119 | 119 | 0 | 10/10 | 3x |
| 4 | Simulator Canvas | 31 | 31 | 0 | 7/10 | 3x |
| 5 | UNLIM Chat | 0 | 0 | 0 | 0/10 | 3x |
| 6 | Voice | 110 | 110 | 0 | 10/10 | 2x |
| 7 | BuildSteps | 184 | 184 | 0 | 10/10 | 2x |
| 8 | ScratchXml | 159 | 159 | 0 | 10/10 | 2x |
| 9 | Lesson Paths | 356 | 356 | 0 | 10/10 | 2x |
| 10 | Chapter Map | 52 | 52 | 0 | 10/10 | 2x |
| 11 | Experiments Data | 1426 | 1426 | 0 | 10/10 | 2x |
| 12 | Components SVG | 228 | 228 | 0 | 10/10 | 2x |
| 13 | WCAG AA | 0 | 0 | 0 | 0/10 | 2x |
| 14 | Mobile 375px | 7 | 7 | 0 | 4/10 | 2x |
| 15 | Tablet 768px | 0 | 0 | 0 | 0/10 | 2x |
| 16 | XSS Security | 70 | 70 | 0 | 10/10 | 3x |
| 17 | GDPR/COPPA | 61 | 61 | 0 | 10/10 | 3x |
| 18 | Performance FCP | 0 | 0 | 0 | 0/10 | 2x |
| 19 | Memory | 16 | 16 | 0 | 8/10 | 2x |
| 20 | Error Handling | 39 | 39 | 0 | 10/10 | 2x |
| 21 | Offline PWA | 0 | 0 | 0 | 0/10 | 2x |
| 22 | Teacher Dashboard | 13 | 13 | 0 | 6/10 | 3x |
| 23 | Gamification | 25 | 25 | 0 | 10/10 | 2x |
| 24 | Report PDF | 17 | 17 | 0 | 8/10 | 2x |
| 25 | Volume Parity | 27 | 27 | 0 | 7/10 | 3x |
| 26 | Breadboard Snap | 11 | 11 | 0 | 8/10 | 2x |
| 27 | Circuit Solver | 39 | 39 | 0 | 8/10 | 2x |
| 28 | AVR Bridge | 0 | 0 | 0 | 0/10 | 2x |
| 29 | Placement Engine | 69 | 69 | 0 | 10/10 | 2x |
| 30 | Design System | 0 | 0 | 0 | 0/10 | 1x |

## Top 7 Debolezze (ZERO test)

1. **UNLIM Chat (0 test, peso 3x)** — Il cuore del prodotto non ha test! Fix: test unit su useGalileoChat, mock fetch, verifica safety filter
2. **WCAG AA (0 test, peso 2x)** — Accessibilita non verificata. Fix: test contrasto, aria-label, focus trap
3. **Tablet (0 test, peso 2x)** — iPad e il device principale delle scuole. Fix: Playwright resize 768x1024
4. **Performance FCP (0 test, peso 2x)** — Nessuna metrica di velocita. Fix: Playwright FCP timing
5. **Offline PWA (0 test, peso 2x)** — Service worker non testato. Fix: test manifest, precache entries
6. **AVR Bridge (0 test, peso 2x)** — Emulazione CPU Arduino non testata. Fix: test GPIO, ADC, pin map
7. **Design System (0 test, peso 1x)** — Palette/font non verificati. Fix: test colori hex, font-family

## Top 5 Punti di Forza

1. **Experiments Data (1426 test)** — Copertura massiva su tutti gli esperimenti
2. **Lesson Paths (356 test)** — Ogni JSON validato strutturalmente
3. **Components SVG (228 test)** — Componenti render verificati
4. **BuildSteps (184 test)** — Tutti i passi di montaggio validati
5. **Consent/GDPR (72 test) + XSS (70 test)** — Sicurezza solida

## Raccomandazioni per Vendita (Lunedi)

### Must-fix prima della demo
- UNLIM deve rispondere: verificare che Supabase Edge Functions funzionino dal sito live
- Il circuito deve essere visibile PRIMA di UNLIM (FIX FATTO: galileo=false)
- Back browser non deve dare pagina vuota

### Nice-to-have per impressionare
- Mostrare il "Passo Passo" — il circuito si monta da solo davanti agli occhi
- Mostrare la chat UNLIM che risponde con parole dei volumi (RAG 638 chunk)
- Mostrare il report fumetto a fine sessione

### Da NON mostrare (ancora rotto)
- Teacher Dashboard senza studenti reali
- Scratch/Blockly (funziona ma UI non polished)
- Modalita "Percorso" (parziale)
