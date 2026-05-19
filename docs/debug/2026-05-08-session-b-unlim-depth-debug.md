# Debug — Sessione B UNLIM depth

Data: 2026-05-08

## Root cause

- Le risposte venivano post-processate due volte: il server/prompt chiedeva brevità e il client tagliava ancora. Il taglio lato client era pericoloso perché avveniva dopo `ensureBookCitation`.
- `bookCitation` considerava “Vol. 2” come sufficiente, ma il requisito reale è volume + pagina fisica.
- `PercorsoCapitoloView` assumeva una shape vecchia (`content/message`) mentre `sendChat` usa `response`.
- `voiceService.checkVoiceCapabilities()` faceva probing HTTP diretto verso VPS; la CSP lo blocca correttamente.
- `drawingSync` e nudge realtime chiamavano Supabase anche in locale con env non affidabile, causando 401 non bloccanti ma rumorosi.

## Prove

- Test mirati e long/difficult UNLIM: PASS.
- Playwright desktop+iPad: tutti i check true, `logs=[]`, `badResponses=[]`.
- Build locale: PASS.
- Vercel preview: READY.

## Decisioni

- Non ho toccato il layout simulatore/tre pulsanti.
- Non ho rimosso la brevità come qualità didattica: ho rimosso solo il taglio distruttivo.
- Non ho dichiarato voce reale “perfetta” perché non è verificabile senza microfono/device.

