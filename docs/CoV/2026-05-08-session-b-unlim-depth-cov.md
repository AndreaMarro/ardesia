# CoV — Sessione parallela B UNLIM depth

Data: 2026-05-08  
Scope: UNLIM/Percorso/voce/citazioni/non-troncamento/console health. Vincolo rispettato: nessuna modifica al layout del simulatore o ai tre pulsanti.

## Verdetto

PASS per codice, test, Playwright locale desktop+iPad, build e deploy preview.

Non dichiaro PASS per microfono reale, wake word continuo su browser/device fisico, TTS udibile, Apple Pencil o Safari iPad reale: sono cablati/meglio protetti, ma richiedono prova manuale su hardware e HTTPS.

## Modifiche verificate

- UNLIM Lavagna non tronca più lato client le risposte a 60 parole: conserva citazioni Vol./pag., diagnosi e passaggi necessari.
- Prompt UNLIM aggiornato: risposta breve ma completa, non tagliata.
- `ensureBookCitation` non considera più “Vol. N” da solo come citazione sufficiente: serve pagina esatta.
- Fallback locale/RAG/KB ora passa da `ensureBookCitation` quando c’è `experimentId`.
- `PercorsoCapitoloView` mostra `sendChat().response`, non il JSON envelope.
- Voce: `voiceService` usa fallback Supabase Edge coerente con chat, timeout STT 45s, niente probe HTTP diretto al VPS bloccato da CSP.
- Console locale pulita: disattivati in locale i sync/realtime Supabase `scribble_paths`/nudge salvo opt-in `VITE_ENABLE_SUPABASE_REALTIME=true`.

## Test

Baseline pre-patch:

```txt
6 test files passed
200 tests passed
```

Post-patch mirati:

```txt
6 test files passed
88 passed, 1 todo
8 test files passed
340 passed, 4 skipped
8 test files passed
604 passed
6 test files passed
143 passed
```

Eval distribuiti:

```txt
Hybrid RAG dry-run: 30 fixtures
recall@1=0.311 recall@3=0.933 recall@5=1.000
precision@1=1.000 MRR=1.000 nDCG@5=1.000
Verdict: PASS
```

Build:

```txt
npm run build: PASS
PWA precache: 31 entries, 1720.74 KiB
```

Warning build non bloccanti: CSS minify `Unexpected "/"`, due classi Tailwind-like `[file:*]`, chunk >1000 kB.

Verifica fresca finale dopo attività concorrente nel worktree:

```txt
6 test files passed
99 passed, 1 todo
npm run build: PASS
PWA precache: 31 entries, 1720.76 KiB
```

## Playwright

Locale `http://127.0.0.1:5177/#lavagna`, desktop 1280x720 e iPad landscape 1024x768:

```json
{
  "noCapitoli": true,
  "noGuardaCircuito": true,
  "hasUnlim": true,
  "hasVoice": true,
  "hasThreeModes": true,
  "passoHasAvanti": true,
  "passoHasUnlimWindow": true,
  "avantiChangesStep": true,
  "giaNoAvanti": true,
  "giaHasCircuit": true,
  "logs": [],
  "badResponses": []
}
```

Screenshot e JSON:

- `docs/audits/2026-05-08-session-b-unlim-depth/desktop-01-welcome.png`
- `docs/audits/2026-05-08-session-b-unlim-depth/desktop-02-percorso.png`
- `docs/audits/2026-05-08-session-b-unlim-depth/desktop-03-passo.png`
- `docs/audits/2026-05-08-session-b-unlim-depth/desktop-04-passo-avanti.png`
- `docs/audits/2026-05-08-session-b-unlim-depth/desktop-05-gia-montato.png`
- `docs/audits/2026-05-08-session-b-unlim-depth/ipad-landscape-01-welcome.png`
- `docs/audits/2026-05-08-session-b-unlim-depth/ipad-landscape-02-percorso.png`
- `docs/audits/2026-05-08-session-b-unlim-depth/ipad-landscape-03-passo.png`
- `docs/audits/2026-05-08-session-b-unlim-depth/ipad-landscape-04-passo-avanti.png`
- `docs/audits/2026-05-08-session-b-unlim-depth/ipad-landscape-05-gia-montato.png`
- `docs/audits/2026-05-08-session-b-unlim-depth/playwright-smoke-result.json`

## Deploy

Preview Vercel:

- `https://elab-tutor-jdya06e37-andreas-projects-6d4e9791.vercel.app`

Non ho promosso produzione/alias stabile.
