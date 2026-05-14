# Handoff — Sessione B UNLIM depth

Data: 2026-05-08

## Stato

Sessione B completata con PASS locale e deploy preview.

Preview:

- `https://elab-tutor-jdya06e37-andreas-projects-6d4e9791.vercel.app`

Evidenze:

- `docs/CoV/2026-05-08-session-b-unlim-depth-cov.md`
- `docs/audits/2026-05-08-session-b-unlim-depth-audit.md`
- `docs/debug/2026-05-08-session-b-unlim-depth-debug.md`
- `docs/audits/2026-05-08-session-b-unlim-depth/playwright-smoke-result.json`

## Cosa ricontrollare nella prossima sessione

P0:

- Test reale su HTTPS preview: microfono, STT, risposta UNLIM, TTS udibile.
- Wake word `Ehi UNLIM` su Chrome/Edge reale; documentare fallback microfono su Safari/iPad.
- Apple Pencil su iPad fisico: penna, gomma, tratto continuo, salvataggio per esperimento.
- Deploy preview smoke su URL Vercel prima di promuovere alias stabile.

P1:

- Risolvere warning CSS minify `Unexpected "/"` e classi `[file:*]`.
- Valutare chunk >1000 kB.
- Se serve realtime Supabase in locale, usare `VITE_ENABLE_SUPABASE_REALTIME=true` e chiavi valide.

## Prompt prossima sessione

```txt
Rileggi:
- docs/CoV/2026-05-08-session-b-unlim-depth-cov.md
- docs/audits/2026-05-08-session-b-unlim-depth-audit.md
- docs/debug/2026-05-08-session-b-unlim-depth-debug.md
- docs/handoff/2026-05-08-session-b-unlim-depth-handoff.md

Prima di modificare codice: smoke HTTPS preview su #lavagna con Playwright/Browser desktop+iPad.
Poi prova manuale reale: microfono, STT, TTS, wake word, Apple Pencil.
Non dichiarare voce/wake/Pencil passati senza hardware o log reali.
Mantieni no-regressione tre pulsanti: Percorso sandbox+tab percorso, Passo Passo drawer+Avanti, Già Montato circuito completo senza drawer.
```

