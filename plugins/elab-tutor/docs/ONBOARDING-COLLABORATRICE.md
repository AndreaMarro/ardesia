# Onboarding — Benvenuta Tea nel progetto ELAB

## Cos'è ELAB
ELAB è un tutor educativo per elettronica e Arduino, pensato per bambini 8-14 anni.
Include un simulatore di circuiti proprietario, un tutor AI ("Galileo"), 62 esperimenti in 3 volumi, e giochi didattici.

**Live**: https://www.elabtutor.school

## Setup iniziale

### 1. Clona il repository
```bash
git clone https://github.com/AndreaMarro/elabtutor.git
cd elabtutor
```

### 2. Installa dipendenze
```bash
npm install
```

### 3. Avvia in development
```bash
npm run dev
```
Apri http://localhost:5173

### 4. Verifica che tutto funzioni
```bash
npm run test:ci    # Deve passare (~1001 test)
npm run build      # Deve completare senza errori
```

### 5. Attiva il quality gate anti-regressione
```bash
git config core.hooksPath .githooks
```
Questo blocca automaticamente i push su `main` se test o build falliscono.

### 5. Installa Claude Code (opzionale ma consigliato)
```bash
npm install -g @anthropic-ai/claude-code
```
Claude Code leggerà automaticamente il file `CLAUDE.md` nella root del progetto e avrà tutto il contesto necessario.

## Stack tecnico
| Tecnologia | Ruolo |
|-----------|-------|
| React 19 + Vite 7 | Frontend |
| Vitest | Test |
| Vercel | Deploy |
| Supabase | Backend (DB + Edge Functions) |
| avr8js | Emulazione CPU Arduino |
| CSS Modules | Styling componenti |

**Nota**: NON usiamo react-router. Il routing è custom con `useState`.

## Struttura progetto (overview)
```
src/
├── components/
│   ├── simulator/          ← Simulatore di circuiti (CORE)
│   │   ├── engine/         ← CircuitSolver, AVRBridge, PlacementEngine
│   │   ├── canvas/         ← SVG canvas, wire routing
│   │   ├── components/     ← Componenti SVG (LED, resistore, etc.)
│   │   ├── panels/         ← Pannelli laterali (code editor, properties)
│   │   ├── api/            ← API globale __ELAB_API
│   │   └── utils/          ← Pin mapping, breadboard snap, etc.
│   ├── lavagna/            ← Redesign interfaccia (IN CORSO)
│   ├── unlim/              ← UNLIM mode (tutor AI)
│   ├── dashboard/          ← Dashboard docente
│   ├── games/              ← Giochi didattici
│   └── common/             ← Componenti condivisi
├── pages/                  ← Pagine standalone
├── styles/                 ← CSS globali
└── data/                   ← Esperimenti, lesson paths, HEX
```

## Palette colori
| Colore | HEX | Uso |
|--------|-----|-----|
| Navy | #1E4D8C | Primario, testi, header |
| Lime | #4A7A25 | Volume 1, azioni positive |
| Orange | #E8941C | Volume 2, warning |
| Red | #E54B3D | Volume 3, errori |
| Background | #F5F5F5 | Sfondo pagine |

## Workflow quotidiano

### Inizio giornata
```bash
git checkout main
git pull origin main
git checkout -b feature/mia-cosa
```

### Durante il lavoro
- Committa spesso
- Testa spesso (`npm run test:ci`)

### Fine giornata
```bash
git push -u origin feature/mia-cosa
# Apri PR su GitHub se il lavoro è pronto per review
```

## Regole importanti
1. **Mai push diretto su `main`** — sempre PR
2. **Mai dati finti** — tutto deve funzionare con dati reali
3. **Mai emoji nei componenti** — usa `ElabIcons.jsx`
4. **Mai aggiungere npm packages** senza OK di Andrea
5. **Sempre** `npm run build` prima di pushare
6. **Target**: bambini 8-14 — testi semplici, bottoni grandi, feedback chiaro

## File da NON toccare senza coordinamento
- `engine/CircuitSolver.js` — cuore del solver
- `engine/AVRBridge.js` — bridge CPU emulation
- `engine/PlacementEngine.js` — posizionamento componenti
- `canvas/SimulatorCanvas.jsx` — canvas SVG principale
- `vite.config.js` — configurazione build
- `package.json` — dipendenze

## Come chiedere aiuto
- Leggi `CONTRIBUTING.md` per il workflow completo
- Leggi `CLAUDE.md` per il contesto tecnico
- Per dubbi, chiedi ad Andrea prima di procedere su aree critiche
