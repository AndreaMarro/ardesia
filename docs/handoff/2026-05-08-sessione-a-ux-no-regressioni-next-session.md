# Handoff - Sessione parallela A UX/no-regressioni

Data: 2026-05-08

## Stato

Sessione A completata con PASS locale, Playwright desktop+iPad proxy, build e deploy preview.

Preview:

- https://elab-tutor-6ei86l26j-andreas-projects-6d4e9791.vercel.app

Evidenze:

- `docs/CoV/2026-05-08-sessione-a-ux-no-regressioni-cov.md`
- `docs/audits/2026-05-08-sessione-a-ux-no-regressioni/audit.md`
- `docs/debug/2026-05-08-sessione-a-ux-no-regressioni-debug.md`
- `docs/audits/2026-05-08-sessione-a-ux-no-regressioni/playwright-results.json`

## Da ricontrollare subito

P0:

- Aprire preview HTTPS su device reale e verificare iPad + Apple Pencil: penna, gomma, ESCI, persistenza per esperimento.
- Verificare microfono/STT/TTS reale su HTTPS; non basta Playwright.
- Smoke manuale su preview: Percorso, Passo Passo, Gia Montato, Manuale, Video, Salva, Fumetto/report, UNLIM.
- Controllare che le sessioni accodate anonime abbiano comportamento prodotto desiderato quando l'utente fa login.

P1:

- Ripulire warning CSS minify `Unexpected "/"`.
- Valutare split chunk per `react-pdf`, Lavagna, Scratch/simulatore.
- Aggiungere un test Playwright versionato per resize multi-lato e gomma, ora coperto da script audit ad hoc.

## Prompt prossima sessione

```txt
Lavora come Sessione A follow-up no-regressioni.
Leggi:
- docs/CoV/2026-05-08-sessione-a-ux-no-regressioni-cov.md
- docs/audits/2026-05-08-sessione-a-ux-no-regressioni/audit.md
- docs/debug/2026-05-08-sessione-a-ux-no-regressioni-debug.md
- docs/handoff/2026-05-08-sessione-a-ux-no-regressioni-next-session.md

Prima di toccare codice: smoke sul preview HTTPS e device reale se disponibile.
Non dichiarare Apple Pencil/voce PASS senza hardware o log reali.
Mantieni il vincolo: non toccare core linguistico UNLIM salvo bug bloccanti.
Verifica in particolare: resize tutti i lati, gomma, persistenza dopo ESCI, sessioni salvate, Manuale, Video, Fumetto/report, Arduino/Scratch, tre pulsanti.
```

