# 00 — Stato Progetto ELAB Tutor

> Ultimo aggiornamento: Post Ciclo 160 — Sprint 161.4 (11/03/2026)

## Architettura

| Layer | Path | Deploy | URL |
|-------|------|--------|-----|
| Sito Pubblico | `PRODOTTO/newcartella/` | Netlify | https://funny-pika-3d1029.netlify.app |
| ELAB Tutor | `PRODOTTO/elab-builder/` | Vercel | https://www.elabtutor.school |
| Backend AI (Galileo) | `elab-builder/nanobot/` | Render (Docker) | https://elab-galileo.onrender.com |

**Stack**: React 18 + Vite + Blockly (Scratch) + CodeMirror 6 + AVR emulation + nanobot (FastAPI)

## Build Status

- **Build**: 0 errori (11/03/2026)
- **Main chunk**: `index-*.js` ~671 KB gzip ~304 KB
- **ElabTutorV4**: ~1119 KB gzip ~258 KB
- **ScratchEditor**: ~1987 KB gzip ~896 KB (lazy-loaded)
- **Warnings**: 3 chunks > 1000 KB (ScratchEditor, react-pdf, ElabTutorV4)

## File Principali (LOC)

| File | Righe | Ruolo |
|------|-------|-------|
| NewElabSimulator.jsx | 4276 | Core simulatore, canvas SVG, drag&drop, states |
| ElabTutorV4.jsx | 2235 | AI chat, action tags, vision, quiz |
| CircuitSolver.js | 2485 | KVL/KCL solver, correnti, tensioni |
| PlacementEngine.js | 822 | Posizionamento automatico componenti |
| experiments-vol1.js | 6913 | 35 esperimenti Vol1 |
| experiments-vol2.js | 3487 | 17 esperimenti Vol2 |
| experiments-vol3.js | 3434 | 15 esperimenti Vol3 |

## Score Card — Post Sprint 161.4 (11/03/2026)

| Area | Score | Delta | Note |
|------|-------|-------|------|
| Auth + Security | 9.8/10 | = | CORS, HSTS, CSP, timing-safe tokens |
| Sito Pubblico | 9.6/10 | = | 61 orphan files da rimuovere |
| Simulatore (funzionalità) | 10.0/10 | = | 70/70 exp, 32 API methods, Ralph Loop, Scratch Gate |
| Simulatore (estetica) | 9.2/10 | = | S161.2: 17 bare colors tokenized → 0 bare tokenizable |
| Simulatore (iPad) | 8.8/10 | = | 5 viewport PASS, toolbar responsive, touch ≥44px |
| Simulatore (physics) | 8.0/10 | = | No dynamic capacitor/transient simulation |
| Scratch Universale | 10.0/10 | = | 22 blocks, 14/14 gate, compile parity |
| AI Integration (Galileo) | 10.0/10 | = | Vision, Actions 4/4, Quiz, context-aware chat, tutor routing |
| Responsive/A11y | **9.5/10** | ↑ +0.3 | S161.3: 9 aria-live regions (announcer, warnings, toasts, status bar, errors) + .sr-only utility |
| Code Quality | 9.8/10 | = | 0 build errors, CSP + HSTS + nosniff |
| **Overall** | **~9.5/10** | ↑ | Sprint 161: breadboard fixes + estetica tokenizations + aria-live a11y, 0 regressioni |

### Sprint 161 Deliverables
- **S161.1**: Fix A (SNAP_BACK_THRESHOLD 8→3), Fix B (cascade move rewrite), Fix C (NaN SVG guard) — console errors 16→0
- **S161.2**: 17 inline colors tokenized across 5 files: 13 new CSS tokens in design-system.css (9 syntax + 3 gradient + 1 blockly)
- **S161.3**: 9 aria-live regions across 3 files: simulation announcer (play/pause/reset), circuit warning (assertive), toasts (polite), wire mode, CodeEditor status/warnings/errors + `.sr-only` utility class
- **S161.4**: Scratch fullscreen fix — z-index 300→900 + solid background in layout.module.css. COV: desktop 1280×800, iPad landscape 1024×768, iPad portrait 768×1024 — all 3 PASS, 0 overlaps, 0 console errors

### Aree Migliorabili
- **Estetica 9.2 → 9.5**: Padding grid inconsistencies, remaining inline styles in minor components
- **iPad 8.8 → 9.5**: Migliorare slide-over UX, RotateOverlay
- **Physics 8.0**: Limitazione architetturale (no transient sim) — non migliorabile senza refactor major

## Problemi Noti (P1/P2)

### P1 — Important
1. Notion DB ID mismatch: frontend notionService.js vs backend notion-config.js
2. STUDENT_TRACKING DB non condiviso
3. Email E2E non verificata

### P2 — Medium (5 remaining)
1. **P2-TDZ**: obfuscator/minifier identifier collision (mitigated by SKIP_PATTERNS)
2. **P2-NAN-5**: circuitState non sanitizzato
3. **P2-NAN-7**: messaggi non sanitizzati in sessione
4. **P2-VET-4**: 61 orphan files (~11.7 MB)
5. **P2-MAMMOTH**: mammoth.js modulepreloaded (could be lazy-loaded)

### P3 — Minor
- No automated E2E test suite
- `confirm()` blocks UI (15 calls in admin pages)
- notionService no 429 retry logic
- ~~No aria-live region for simulation state changes~~ — ✅ RESOLVED S161.3

## Comandi Deploy

```bash
# Vercel (ELAB Tutor)
cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build && npx vercel --prod --yes

# Netlify (Sito Pubblico)
cd "VOLUME 3/PRODOTTO/newcartella" && npx netlify deploy --prod --dir=. --site=864de867-e428-4eed-bd86-c2aef8d9cb13

# Nanobot (Render)
cd "VOLUME 3/PRODOTTO/elab-builder/nanobot" && git push render main
```
