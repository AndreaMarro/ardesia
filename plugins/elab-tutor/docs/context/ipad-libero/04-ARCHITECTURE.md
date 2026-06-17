# ARCHITETTURA PROGETTO — Riferimento Rapido

---

## Stack Tecnico

| Layer | Tecnologia | Note |
|-------|-----------|------|
| Frontend | React 19 + Vite 7 | NO react-router (routing custom useState) |
| Styling | Tailwind 4 + CSS Modules + design-system.css | Force-light theme |
| Deploy Frontend | Vercel | https://www.elabtutor.school |
| Backend AI | Nanobot v5.2.0 (FastAPI + Docker) | https://elab-galileo.onrender.com |
| Deploy Backend | Render (Starter $7/mo, always-on) | Git push da nanobot/ |
| Auth | Netlify Functions | bcrypt + HMAC-SHA256 timing-safe tokens |
| Sito Pubblico | Netlify | https://funny-pika-3d1029.netlify.app |
| CPU Emulation | avr8js (ATmega328p) | Web Worker |
| Obfuscation | javascript-obfuscator (RC4 + domain lock) | Vite plugin custom |

## Struttura Directory Principale

```
elab-builder/
  src/
    components/
      simulator/          ← FOCUS di questo piano
        canvas/           ← SimulatorCanvas.jsx (2629 righe)
        components/       ← 21 SVG components (LED, Resistor, etc.)
        engine/           ← CircuitSolver, AVRBridge, SimulationManager
        hooks/            ← (useGalileoCoach.js DA CREARE qui)
        panels/           ← ControlBar, ExperimentGuide, ComponentPalette, etc.
        utils/            ← breadboardSnap, pinComponentMap, (circuitComparator DA CREARE)
        overlays/         ← PotOverlay, LdrOverlay
        NewElabSimulator.jsx  ← orchestratore principale (3582 righe)
        ElabSimulator.css     ← stili simulatore
      tutor/              ← FOCUS Task 4+9
        ElabTutorV4.jsx   ← tutor principale con Galileo chat (2152 righe)
        CanvasTab.jsx     ← disegno libero con Apple Pencil (315 righe)
    data/
      experiments-vol1.js ← struttura esperimenti con buildSteps
      experiments-vol2.js
      experiments-vol3.js
    services/
      api.js              ← fetch wrapper con .trim() su env vars
  nanobot/                ← Backend Galileo (ha git proprio per Render)
    server.py             ← FastAPI + multi-provider racing
    nanobot.yml           ← Prompt system Galileo
    vision.yml            ← Prompt vision Galileo
  docs/
    plans/                ← Piani tecnici
    context/
      ipad-libero/        ← QUESTA CARTELLA
  .team-status/           ← Report audit e analisi CTO
  vercel.json             ← Rewrites SPA + security headers
  vite.config.js          ← Obfuscation + code splitting + watermark
  package.json            ← Dependencies (React 19, avr8js, etc.)
```

## Vercel Config

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [{
    "source": "/(.*)",
    "headers": [
      { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "X-Frame-Options", "value": "DENY" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
    ]
  }]
}
```

## Vite Config — Punti chiave

- **Code splitting**: manualChunks per codemirror, avr, react-vendor, html2canvas, mammoth
- **Obfuscation**: RC4 stringArray 100%, domain lock (.elabtutor.school, .vercel.app, localhost)
- **ElabTutorV4 SKIP**: escluso da obfuscation (causa TDZ crash — S47)
- **Copyright watermark**: "Andrea Marro" ogni 200 righe JS in build

## Nanobot (Backend AI)

- **URL**: https://elab-galileo.onrender.com
- **Health**: GET /health
- **Chat**: POST /chat
- **Vision**: POST /chat (con images[] array)
- **Provider Racing**: DeepSeek + Groq per testo, Gemini SOLO per vision
- **Versione**: v5.2.0
- **Deploy**: `cd nanobot && git push` (Render auto-deploy)

## NO GIT nel progetto principale

```
elab-builder/    ← NIENTE .git
  nanobot/       ← HA .git (per Render deploy)
```

Strategia backup: copiare file prima di modifiche critiche.
```bash
cp SimulatorCanvas.jsx SimulatorCanvas.jsx.bak
```
