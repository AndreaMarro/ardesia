# Whiteboard-Studio — Studio (aula web)

Aula di insegnamento **tutto-in-una-finestra**, posseduta dal docente. Per i 10 docenti (umanistiche + STEM, uni e non) **disposti a pagare €15/mese** (validazione 09/06/2026). Anti-Superprof: la lezione È il prodotto, niente pedaggio-sul-contatto.

**NIENTE ELAB. NIENTE LessonOS. NIENTE sim-Arduino.** (3 progetti separati — vedi `~/HANDOFF-2026-06-09.md`.)

## Stack (assemblato, licenze pulite)
- **Vite 8 + React 19 + TS** (scaffold)
- **Excalidraw 0.18** (MIT) — lavagna
- **MathLive 0.110** (MIT) — composer formule; **MathJax CDN** — LaTeX→SVG per inserirle sulla lavagna
- **pdfjs-dist 6** (Apache) — PDF→immagini (worker Vite-native `?url`)
- **Video = Google Meet ESTERNO** (bottone "apri Meet", niente embed — decisione 10/06; ex-Jitsi rimosso)

## Feature (tutte verificate live, git)
- Lavagna Excalidraw full-screen + header (stanza, copia-link-studente, apri-Meet, formula, carica)
- **Video**: Google Meet esterno via bottone (la lezione vive sulla lavagna, non nel video)
- **Math**: composer MathLive → "inserisci sulla lavagna" (SVG image, spostabile)
- **Carica immagini/PDF** sulla lavagna (PDF = pagine-immagine impilate). [PDF: testare con file reale]
- **Persistenza** localStorage per-stanza (`✓ salvato`) — la lezione non sparisce al refresh

## Run
```
cd ~/whiteboard-studio/studio
npm run dev          # http://localhost:5173
```
(O via Claude Preview: launch.json name **"studio"**, porta 5189.)

## Gotcha imparati (NON ri-sbattere)
- **React duplicato** con Excalidraw+nuova-dep → `resolve.dedupe:['react','react-dom']` in vite.config.
- **Aggiungere una dep** → Vite va riavviato + `rm -rf node_modules/.vite` (l'optimizer non vede la dep a caldo → schermo bianco).
- **mathjax-full (npm) = CJS** (`require is not defined`) → usato **MathJax da CDN** (lazy-load, no bundling).
- `React.CSSProperties`/`React.ChangeEvent` → importare `type CSSProperties`/`type ChangeEvent` (no `import React`).
- Verifica SEMPRE a schermo (screenshot) prima di dire "fatto".

## Prossimo
- **Persistenza cloud (Supabase)** — lo studente riapre la lavagna; fondamenta multi-tenant. Serve progetto Supabase NUOVO (no-ELAB) + URL/anon-key in `.env.local` (mai in chat). Design: localStorage sempre + cloud quando configurato (fallback).
- Co-editing real-time lavagna (Yjs) — oggi: docente disegna, studente vede via screen-share.
- Test PDF con file reale.
- LessonOS come "motore-lezioni" = solo quando il Mac Mini torna online + deployato su host affidabile (NON il Mini di casa).
