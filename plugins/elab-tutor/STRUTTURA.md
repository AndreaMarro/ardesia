# Struttura Progetto ELAB Builder

## Mappa veloce

```
elab-builder/
|
|-- src/                    # SORGENTE PRINCIPALE
|   |-- components/         # Componenti React
|   |   |-- admin/          # Pannello admin (AdminPage, tabs, gestionale)
|   |   |-- auth/           # Login, Register, DataDeletion
|   |   |-- common/         # ErrorBoundary, PrivacyPolicy, etc.
|   |   |-- simulator/      # Simulatore circuiti (NewElabSimulator, SVG, engine)
|   |   |-- social/         # Navbar
|   |   |-- student/        # Dashboard studente
|   |   |-- teacher/        # Dashboard docente
|   |   |-- tutor/          # ElabTutorV4 (componente principale)
|   |   |-- games/          # 4 giochi interattivi
|   |   |-- VetrinaSimulatore.jsx   # Landing page senza licenza
|   |   |-- ShowcasePage.jsx        # Showcase pubblica
|   |   `-- Watermark.jsx
|   |
|   |-- context/            # AuthContext, ThemeContext
|   |-- data/               # Dati esperimenti (69), knowledge base Galileo
|   |-- services/           # API, Notion, GDPR, license, email
|   |-- styles/             # CSS (design-system, ElabSimulator, tutor-responsive)
|   `-- utils/              # codeProtection, logger, helpers
|
|-- public/                 # Assets statici (copiati in dist/)
|   |-- assets/showcase/    # 5 screenshot per Vetrina
|   `-- assets/mascot/      # Logo ELAB
|
|-- nanobot/                # Backend AI (FastAPI + Docker)
|   |-- main.py             # Server FastAPI
|   |-- render.yaml         # Config deploy Render
|   `-- Dockerfile
|
|-- server/                 # Server utilities
|-- scripts/                # Script build e utility
|-- tests/                  # Test (unit, integration, validation)
|-- volumes/                # PDF 3 volumi (riferimento)
|
|-- dist/                   # OUTPUT BUILD (non modificare)
|-- node_modules/           # Dipendenze npm
|
|-- sessioni/               # STORIA DEL PROGETTO
|   |-- INDICE.md           # Indice navigabile di tutte le sessioni
|   |-- prompt/             # PRD/prompt di ogni sessione
|   `-- report/             # Report finali di ogni sessione
|
|-- docs/                   # DOCUMENTAZIONE TECNICA
|   |-- agents/             # Report audit agenti
|   |-- plans/              # Design/architettura
|   |-- sessions/           # Docs sessioni vecchie
|   `-- archive/            # Docs archiviate
|
|-- _archive/               # FILE ARCHIVIATI (non servono per il build)
|   |-- debug/              # Log debug, test output
|   |-- old-audits/         # Vecchi audit
|   |-- n8n-legacy/         # Workflow n8n (sostituiti da backend generico)
|   `-- screenshots/        # Screenshot vecchi
|
|-- CLAUDE.md               # Istruzioni per Claude Code
|-- STRUTTURA.md            # QUESTO FILE
|-- package.json            # Dipendenze npm
|-- vite.config.js          # Config Vite + obfuscation
|-- vercel.json             # Config deploy Vercel
|-- index.html              # Entry HTML
`-- vitest.config.js        # Config test
```

## Comandi principali

```bash
# Sviluppo
npm run dev                 # Server dev (localhost:5173)

# Build
npm run build               # Build produzione (dist/)

# Deploy
npx vercel --prod --yes     # Deploy su Vercel (www.elabtutor.school)

# Test
npx vitest                  # Test unitari
```

## File chiave da conoscere

| File | Cosa fa |
|------|---------|
| `src/components/tutor/ElabTutorV4.jsx` | Componente principale del tutor |
| `src/components/simulator/NewElabSimulator.jsx` | Simulatore circuiti |
| `src/data/experiments/` | 69 esperimenti (connections, buildSteps, quiz) |
| `src/services/api.js` | Tutte le chiamate API |
| `src/utils/codeProtection.js` | Protezione anti-copy (solo prod) |
| `vite.config.js` | Obfuscation settings |
| `sessioni/INDICE.md` | Per capire la storia del progetto |

---

*Ultimo aggiornamento: 24/02/2026 — Sessione 43*
