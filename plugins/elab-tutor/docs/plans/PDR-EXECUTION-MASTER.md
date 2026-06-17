# PDR EXECUTION MASTER — Design Excellence
## ELAB Lavagna: da 8.6/10 a 9.5/10
**Data creazione**: 02/04/2026 | **Autore**: Andrea Marro + Claude Code

---

## STATO ATTUALE VERIFICATO (02/04/2026)
- **Test**: 1053/1053 PASS
- **Build**: 41s, 1693 modules, 33 precache, 4010KB
- **Console errors**: 0
- **File lavagna**: 27 (15 JSX/JS + 12 CSS modules)
- **Dead code rimosso**: VetrinaSimulatore `const S={}` (403 righe)
- **Routing**: `#tutor` → redirect → `#lavagna` (Strangler Fig ATTIVO)
- **Design system**: 286 CSS variables in design-system.css

## PRINCIPI NON NEGOZIABILI (da conversazione Andrea)
1. **Principio Zero**: L'insegnante arriva alla LIM e spiega IMMEDIATAMENTE
2. **UNLIM Ovunque**: non chatbot, ma intelligenza interconnessa a TUTTO
3. **Riconoscibilità > Stilizzazione**: icone che un bambino riconosce
4. **Kit + Volumi + Tutor = Unico Prodotto**: estetica coerente Tres Jolie
5. **Mascotte sempre visibile**: non nascosta in un bottone
6. **Input UNLIM sempre in basso**: come ChatGPT
7. **Overlay cognitivo ZERO**: max 3 azioni visibili
8. **UNLIM Onnisciente e Onnipotente**: vede stato circuito, monta, compila, quiz, video
9. **Sessioni salvate**: UNLIM ricostruisce contesto quando il docente torna
10. **Linguaggio 10-14 anni**: sempre, ovunque

## COSA ESISTE GIÀ (da verificare nel browser)
| Componente | File | LOC | Stato |
|-----------|------|-----|-------|
| MascotPresence | MascotPresence.jsx | 60 | Creato, da verificare |
| UnlimBar | UnlimBar.jsx | 96 | Creato, da verificare |
| Dot pattern canvas | LavagnaShell.module.css | 3 righe | Creato, da verificare |
| AppHeader | AppHeader.jsx | 140 | Funzionante |
| ExperimentPicker | ExperimentPicker.jsx | ~250 | Funzionante |
| FloatingWindow | FloatingWindow.jsx | ~180 | Funzionante |
| FloatingToolbar | FloatingToolbar.jsx | ~100 | Funzionante |
| RetractablePanel | RetractablePanel.jsx | ~120 | Funzionante |
| GalileoAdapter | GalileoAdapter.jsx | ~200 | Funzionante |
| VideoFloat | VideoFloat.jsx | ~350 | Funzionante |
| LavagnaStateManager | LavagnaStateManager.js | ~100 | Funzionante |
| LessonBar | LessonBar.jsx | ~70 | Funzionante |
| LavagnaShell | LavagnaShell.jsx | 506 | Orchestratore |

## 16 ASPETTI PDR — SCORE ATTUALI vs TARGET
| # | Aspetto | Score attuale | Target | Sessione |
|---|---------|--------------|--------|----------|
| 1 | Mascotte ELAB Visibile | 5/10 | 9/10 | S1 |
| 16 | UNLIM Bar Sempre Visibile | 5/10 | 9/10 | S1 |
| 7 | Dot Pattern Canvas | 7/10 | 8/10 | S1 |
| 2 | UNLIM Interconnesso | 3/10 | 9/10 | S2 |
| 3 | Icone Componenti Realistiche | 4/10 | 9/10 | S2 |
| 4 | Percorso Lezione Compatto | 5/10 | 9/10 | S3 |
| 5 | Header Umano | 6/10 | 9/10 | S3 |
| 6 | Glassmorphism Coerente | 5/10 | 9/10 | S4 |
| 10 | Animazioni Coerenti | 4/10 | 9/10 | S4 |
| 11 | Responsive LIM/iPad/PC | 7/10 | 9.5/10 | S5 |
| 8 | Toolbar Posizionamento | 6/10 | 9/10 | S5 |
| 9 | Card Esperimenti Premium | 6/10 | 9/10 | S6 |
| 12 | YouTube Funzionante | 3/10 | 8/10 | S6 |
| 13 | Font Sizing Consistente | 6/10 | 10/10 | S7 |
| 14 | Feedback Sonoro | 2/10 | 7/10 | S7 |
| 15 | Brand ELAB Tres Jolie | 4/10 | 9/10 | S7 |

## CICLO DI ESECUZIONE (per ogni sessione)
```
ANALYZE → stato attuale, score, screenshot
  ↓
IMPLEMENT → task concreti, file specifici
  ↓
TEST → vitest run + npm run build + 0 errors
  ↓
AUDIT (1/3) → /elab-quality-gate su aspetti sessione
  ↓
FIX → bug trovati dall'audit
  ↓
IMPLEMENT → task rimanenti
  ↓
TEST → vitest run + npm run build
  ↓
AUDIT (1/2) → benchmark 15 metriche
  ↓
FIX → problemi trovati
  ↓
POLISH → micro-dettagli, transizioni, hover
  ↓
TEST → suite completa
  ↓
AUDIT (fine) → 3 agenti CoV → score = MINIMO dei 3
  ↓
COMMIT + UPDATE MEMORY → documenta tutto
```

## SESSIONE S1: Mascotte + UNLIM Bar + Dot Pattern (Aspetti 1, 16, 7)

### Task S1.1: Verificare componenti esistenti
- Start dev server, naviga a #lavagna
- Screenshot: MascotPresence visibile? Dove? Dimensioni?
- Screenshot: UnlimBar visibile? Posizione? Stile?
- Screenshot: Dot pattern visibile? Densità? Contrasto?
- Confronto con ELAB Tres Jolie

### Task S1.2: Migliorare MascotPresence
- La mascotte deve usare il logo ELAB reale (logo-senza-sfondo.png) come immagine
- Il fallback SVG deve essere riconoscibile come il robottino ELAB
- Dimensione: 48x48 desktop, 40x40 LIM
- Posizione: basso-destra, sopra UnlimBar
- Animazioni: breathing idle, bounce al speaking, scale hover
- Click → apre GalileoAdapter

### Task S1.3: Migliorare UnlimBar
- Glassmorphism: backdrop-filter blur, sfondo semi-trasparente
- Posizione: centrata in basso, larghezza 60% max (come ChatGPT)
- Placeholder: "Chiedi a UNLIM..." con icona mascotte a sinistra
- Focus glow lime #4A7A25
- Responsive: 90% width su mobile, 48px touch targets

### Task S1.4: Polish Dot Pattern
- Verificare che non distragga dal circuito
- Colore punti: più chiaro se necessario (#d0d0d0 → #ddd)
- Verificare su LIM 1024x768 (proiettore lava i colori chiari)

### Task S1.5: Audit 1/3
- Run tests (1053+ PASS)
- Build PASS
- Screenshot 3 viewport (LIM, iPad, Desktop)

### Task S1.6: Fix da audit
- Risolvere qualsiasi problema emerso

### Task S1.7: Audit 1/2 con benchmark
- 15 metriche (F1-F5, U1-U5, D1-D5)
- Score per aspetto

### Task S1.8: Polish finale + Audit CoV
- 3 agenti CoV
- Score = MINIMO dei 3
- Git commit
- Update MEMORY.md + LAVAGNA-CURRENT-STATE.md

### Gate Bloccanti S1
- Build PASS
- 1053+ test PASS
- 0 console errors
- #tutor redirect funzionante
- Mascotte VISIBILE su 3 viewport
- UnlimBar VISIBILE e FUNZIONANTE
- Dot pattern visibile ma non invasivo

---

## SESSIONI S2-S8 (outline)

### S2: UNLIM Interconnesso + Icone Realistiche
- Bottone "Chiedi a UNLIM" su ogni step del percorso lezione
- Tooltip errori → "UNLIM può aiutarti"
- Icone componenti: mini-preview SVG realistiche (LED dome+gambe, resistore con bande)
- QUICK_COMPONENTS in LavagnaShell con SVG realistici

### S3: Percorso Lezione Compatto + Header Umano
- LessonBar: barra compatta IN BASSO, "[1/5] PREPARA — Non dare il resistore subito"
- Header: rimuovi "Lavagna" (è ovvio), nome esperimento leggibile, progress dots 12px, label "Avvia"

### S4: Glassmorphism Coerente + Animazioni
- Glassmorphism su: ExperimentPicker, FloatingWindow, FloatingToolbar, LessonBar
- Sistema animazione: --ease-out, --duration-fast/normal/slow
- Micro-animazioni: scale bottoni, card lift hover

### S5: Responsive + Toolbar
- LIM 1024x768: percorso in basso, componenti collassati, UNLIM minimizzato
- iPad portrait: layout stacked
- Toolbar: sinistra quando componenti chiusi, basso quando aperti

### S6: Card Premium + YouTube Reale
- Card esperimenti: icona capitolo, difficoltà, tempo, componenti, badge "NUOVO"
- YouTube: videoId REALI (almeno 10 video curati)

### S7: Font + Suoni + Brand Tres Jolie
- Font system: --text-xs/sm/base/lg/xl, min 14px su LIM
- Suoni: tick click, woosh play, buzz errore, fanfara completamento
- Brand: logo SVG header, gradients volume, border-radius 16px

### S8: Stress Test Totale
- 10 aperture/chiusure rapide
- Multi-window overlap
- 5 cambi esperimento consecutivi
- State machine 10 transizioni
- Memory leak check (devtools)
- LIM 1024x768 full test
- Confronto con Tres Jolie
- 5 agenti CoV → score composito

---

## REGOLA ANTI-INFLAZIONE
- Score senza screenshot = 0
- Score senza test reale nel browser = 0
- Self-score > evidenze + 1.0 → RIFIUTATO
- Storico: G45 era inflato +2.8 punti → ATTESO
- MAI score > 7 senza 10+ screenshot di prova

## FILE INTOCCABILI
```
src/components/simulator/engine/* — INTOCCABILE
src/components/simulator/NewElabSimulator.jsx — NON modificare
src/components/unlim/* — solo wrappare, mai modificare
```

## RALPH LOOP STRING (copia in nuova sessione)
```
Leggi COMPLETAMENTE questi file PRIMA di qualsiasi azione:
1. CLAUDE.md
2. docs/plans/PDR-DESIGN-EXCELLENCE.md
3. docs/plans/PDR-EXECUTION-MASTER.md
4. docs/plans/2026-04-01-lavagna-redesign.md
5. docs/prompts/ANDREA-VISION-COMPLETE.md
6. docs/prompts/LAVAGNA-FINAL-REPORT.md

PRIMA DI TUTTO: npx vitest run — TUTTI i test devono passare.
Poi: esegui il PDR sessione per sessione (S1→S8).
Ciclo per ogni sessione: ANALYZE → IMPLEMENT → TEST → AUDIT → FIX → TEST → AUDIT → COMMIT.
ZERO REGRESSIONI. UNLIM interconnesso ovunque. Icone realistiche.
Mascotte sempre visibile. Input UNLIM sempre in basso.
Score senza screenshot = 0. Mai score > 7 senza prova.
Il docente di 55 anni alla LIM è il tuo utente.
Kit + Volumi + Tutor = UNICO PRODOTTO.
```
