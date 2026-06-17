# FASE 7: AUDIT FINALE (S108)
> Target: OVERALL ≥ 9.5, deploy in produzione

## S108 — Grand Final Audit + Deploy (~2h)

### Full Ralph Loop (5 cicli)

#### Ciclo 1: Vol1 Basic
1. Dashboard → Simulatore → Vol1 → Cap1 → primo esperimento
2. Già Montato → circuito compare? Componenti corretti?
3. Play → LED si accende?
4. Galileo chat: "Cos'è un resistore?" → risposta educativa?
5. Stop → ritorna alla lista

#### Ciclo 2: Vol2 Intermediate
1. Vol2 → Cap4 → esperimento con condensatore
2. Passo Passo → avanzare tutti i step
3. Play → condensatore si carica visualmente?
4. Galileo: "Non funziona" → debug assistant?

#### Ciclo 3: Vol3 Scratch COMPLETO
1. Vol3 → Cap6 → LED Blink
2. Passo Passo → scelta "🧩 Blocchi"
3. Avanzare TUTTI gli scratch steps (5/5)
4. Compilare in Blocchi → `✅ bytes/32256`
5. Play → LED lampeggia
6. Switch a "Arduino C++" → codice C++ intatto, NON sovrascritto
7. Compilare in Arduino → ✅
8. Play → LED lampeggia con codice utente
9. Switch Blocchi↔Codice 3 volte → zero perdita, zero freeze
10. Pannello Blocchi: workspace intero visibile, categorie leggibili

#### Ciclo 3b: Vol3 Scratch Avanzato
1. Vol3 → Extra → LCD Hello
2. Blocchi: usare blocchi LCD (lcd_init, lcd_print)
3. Compilare → C++ generato include `#include <LiquidCrystal.h>`?
4. Vol3 → Extra → Servo Sweep
5. Blocchi: servo_attach + for loop + servo_write
6. Compilare → C++ generato include `#include <Servo.h>`?
7. Play → servo angle si aggiorna visualmente

#### Ciclo 4: Vol3 Advanced
1. Vol3 → Extra → LCD Hello
2. Blocchi: usare blocchi LCD (lcd_init, lcd_print)
3. Compilare → C++ corretto?
4. Galileo: "Spiega lcd.begin()" → spiegazione chiara?

#### Ciclo 5: Galileo Full Powers
1. Vision: "Guarda il mio circuito" → screenshot → analisi
2. Action: "Avvia la simulazione" → Play
3. Debug: Disconnettere un filo → "Perché non funziona?" → diagnosi
4. Quiz: "Fammi un quiz" → domanda + feedback
5. Wiring: "Collegami il LED" → guida step by step

### iPad Test Matrix (8 combinazioni)

| Device | Orientation | Test |
|--------|-------------|------|
| iPad Mini | Portrait | Load Vol1, Passo Passo, toolbar |
| iPad Mini | Landscape | Load Vol3, Blockly, compile |
| iPad Air | Portrait | ComponentDrawer, wire drawing |
| iPad Air | Landscape | Full workflow: load → build → code → play |
| iPad Pro 11" | Portrait | Serial Monitor, Galileo chat |
| iPad Pro 11" | Landscape | Scratch full workspace, categories |
| iPad Pro 12.9" | Portrait | Split View compatibility |
| iPad Pro 12.9" | Landscape | All panels open simultaneously |

### 🧩 Scratch Gate FINALE (più esteso del normale)
| # | Test | PASS/FAIL |
|---|------|-----------|
| SG1-SG10 | Standard gate (vedi Piano Maestro) | |
| SGF1 | Tutti i 12 exp AVR: Blocchi tab appare | |
| SGF2 | 5 exp con scratchSteps: avanzare tutti gli step | |
| SGF3 | 7 exp senza scratchSteps: default block presente | |
| SGF4 | Blocchi LCD: lcd_init + lcd_print compila | |
| SGF5 | Blocchi Servo: servo_attach + servo_write compila | |
| SGF6 | Galileo in Blocchi: "spiega questo" → parla di blocchi | |
| SGF7 | iPad 1180×820: Blocchi workspace non tagliato | |
| SGF8 | Passo Passo → scelta "Codice": editor C++ apre | |

### Lighthouse Audit
- [ ] Performance: ≥ 80
- [ ] Accessibility: ≥ 90
- [ ] Best Practices: ≥ 90
- [ ] SEO: ≥ 80

### Bundle Size Check
- [ ] Main chunk < 700KB gzip
- [ ] ScratchEditor chunk < 1MB gzip (lazy loaded)
- [ ] Total initial load < 2MB gzip
- [ ] Lazy chunks load on demand

### Score Card Finale

| Area | Pre-Roadmap | Target | Final |
|------|-------------|--------|-------|
| Auth + Security | 9.8 | 9.8 | |
| Sito Pubblico | 9.6 | 9.6 | |
| Sim (funzionalità) | 9.8 | 10.0 | |
| **Sim (estetica)** | **6.5** | **9.5** | |
| **Sim (iPad)** | **7.0** | **9.5** | |
| **Sim (physics)** | **7.0** | **9.0** | |
| **Scratch** | 10.0 | **10.0** | |
| **AI Integration** | 10.0 | **10.0+** | |
| **Responsive/A11y** | **7.5** | **9.5** | |
| Code Quality | 9.8 | 9.8 | |
| **OVERALL** | **~8.7** | **≥9.5** | |

### Deploy Checklist
- [ ] `npm run build` → 0 errori
- [ ] Vercel deploy: `npx vercel --prod --yes`
- [ ] Render deploy: nanobot git push
- [ ] Health check: nanobot `/health` → 200 OK
- [ ] Live test: https://www.elabtutor.school → login → simulatore → play
- [ ] MEMORY.md aggiornato con score finali
- [ ] `00-STATO-ATTUALE.md` aggiornato

### Celebrazione 🎉
Se tutto ≥9.5: ELAB Tutor è pronto per il mondo.
