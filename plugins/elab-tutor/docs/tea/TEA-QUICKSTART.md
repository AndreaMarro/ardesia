# Tea Quickstart — Come contribuire a ELAB Tutor

Benvenuta Tea! Questa guida ti spiega come contribuire al progetto in modo sicuro.

## Setup iniziale (una volta sola)

```bash
# Clona il repo
git clone https://github.com/AndreaMarro/elab-builder.git
cd elab-builder

# Installa dipendenze
npm install

# Verifica che tutto funzioni
npm run build
npx vitest run
```

## Workflow per ogni contributo

### 1. Crea un branch

```bash
git checkout main
git pull origin main
git checkout -b style/nome-modifica  # oppure docs/, fix/, etc.
```

### 2. Fai le tue modifiche

Aree dove puoi lavorare liberamente (auto-merge abilitato):

| Path | Cosa contiene |
|------|--------------|
| `docs/` | Documentazione, guide, report |
| `tests/` | Test (sempre benvenuti!) |
| `src/styles/` | CSS globali |
| `src/components/common/` | Componenti condivisi UI |
| `src/components/dashboard/` | Dashboard docente |
| `src/components/**/*.module.css` | CSS Modules di qualsiasi componente |
| `src/data/lesson-paths/` | Percorsi lezione JSON |

### 3. Verifica prima di committare

```bash
# OBBLIGATORIO: test devono passare
npx vitest run

# OBBLIGATORIO: build deve passare
npm run build
```

### 4. Committa e pusha

```bash
git add file1.css file2.md  # aggiungi SOLO i file che hai modificato
git commit -m "style(lavagna): migliora padding card esperimento"
git push -u origin style/nome-modifica
```

### 5. Apri Pull Request

Su GitHub, apri una PR verso `main`. Aggiungi la label `tea-autoflow` per abilitare auto-merge.

Se la PR tocca SOLO path sicuri e la CI passa, verrà auto-approvata e mergiata.
Se tocca file critici (engine, API, config), Andrea dovrà approvarla manualmente.

## Aree OFF-LIMITS (richiedono review Andrea)

NON modificare questi file senza coordinamento:

- `src/components/simulator/engine/` — Solver, AVR Bridge
- `src/components/simulator/canvas/SimulatorCanvas.jsx` — Canvas SVG
- `src/components/simulator/NewElabSimulator.jsx` — Shell simulatore
- `src/services/api.js`, `src/services/simulator-api.js` — API
- `vite.config.js`, `package.json` — Build config
- `.github/workflows/` — CI/CD

## Convenzioni

- **Commit**: `tipo(area): descrizione` (es. `style(lavagna): fix padding`)
- **Branch**: `style/`, `docs/`, `fix/` + nome descrittivo
- **CSS**: preferisci CSS Modules (`.module.css`) a inline styles
- **Font**: minimo 13px testi, 10px label
- **Touch**: minimo 44x44px bottoni interattivi
- **Palette**: Navy #1E4D8C / Lime #4A7A25 / Orange #E8941C / Red #E54B3D
- **Icone**: usa `ElabIcons.jsx`, mai emoji nei componenti

## Aiuto

Se hai dubbi, chiedi ad Andrea. Meglio chiedere prima che fixare dopo!
