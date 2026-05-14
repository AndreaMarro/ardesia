# Quality audit - UNLIM response quality, speed, voice

Data: 2026-05-09  
Scope: chat UNLIM, router qualita, latenza percepita/reale, UX placeholder, azioni Arduino/Scratch, screenshot/visione, voce Voxtral, deploy produzione.  
Verdict: **PASS operativo in produzione a cache calda**, con limiti dichiarati.

## Evidenza sintetica

- Quality JSON: `response-quality-tests.json`, **100 casi / 100 passati**.
- Speed JSON microbench: `speed-benchmark.json`, soglie locali rispettate.
- Playwright locale 99: **120/120**.
- Playwright locale 104: **PASS** con screenshot desktop/iPad/mobile.
- Playwright produzione 104: primo run **FAIL** per `apiReadyMs=10500`; secondo run **PASS**.
- Playwright produzione 102 voce: **PASS**.
- Playwright produzione 99: **120/120**.
- Build produzione: **PASS** con warning CSS/chunk.
- Deploy production Vercel: `https://www.elabtutor.school`, deployment diretto `https://elab-tutor-n4lqu6b78-andreas-projects-6d4e9791.vercel.app`.

## Metriche produzione 104

Run PASS su URL diretta:

Desktop:
- API ready 8275 ms.
- Feedback UI 12-25 ms.
- Risposta utile 147-513 ms.
- Arduino verificato 626 ms.
- Scratch verificato 199 ms.

iPad:
- API ready 6272 ms.
- Feedback UI 13-22 ms.
- Risposta utile 177-398 ms.
- Arduino verificato 659 ms.
- Scratch verificato 235 ms.

Mobile:
- API ready 6501 ms.
- Feedback UI 14-23 ms.
- Risposta utile 154-403 ms.
- Arduino verificato 641 ms.
- Scratch verificato 206 ms.

Health:
- white screen: no.
- overflow orizzontale: 0 px.
- `[object Object]`: no.
- autoplay media: 0.
- vecchia copy `Sto elaborando` / `elaborandg`: assente.
- duplicazione `Sto ELABorando...`: assente.

## Qualita risposta

Il router copre:
- richiesta vaga/docente in panico.
- spiegazione breve.
- diagnosi circuito.
- Arduino.
- Scratch.
- guarda schermo/screenshot.
- narrazione libro/esperimento.
- citazione solo quando serve.
- richiesta che deve chiedere chiarimento.

Controlli nei 100 casi:
- niente risposta generica.
- budget lunghezza rispettato.
- naturalezza minima rispettata.
- niente citazioni inutili.
- azione presente quando richiesta.
- nessun `[object Object]`.
- nessuna duplicazione del placeholder.
- label ufficiale `Sto ELABorando...`.

## Voce

Produzione `102`:
- `apiReadyMs`: 6500.
- `/api/voxtral`: 200.
- provider: `voxtral`.
- voice: `9234f1b6-766a-485f-acc4-e2cf6dc42327`.
- model: `voxtral-mini-tts-2603`.
- provider latency: 2073 ms.
- end-to-end latency: 3289 ms.
- audio: 58513 bytes.
- console errors: 0.
- network failures: 0.

Caveat: headless non dimostra microfono reale o qualita acustica in aula. Dimostra endpoint, UI, disponibilita MediaRecorder e generazione audio.

## Cambiamenti tecnici verificati

- `src/components/tutor/ChatOverlay.jsx`: attese pronte, prima frase `Sto ELABorando...`.
- `src/components/lavagna/useGalileoChat.js`: rimosso placeholder assistant duplicato, fast path operativo con paint prima delle azioni.
- `src/components/lavagna/MascotPresence.jsx`: bolla unica `Sto ELABorando...`.
- `supabase/functions/_shared/operational-response.ts`: label ufficiale, router qualita, risposte locali, tag azione.
- `supabase/functions/_shared/system-prompt.ts`: policy linguistica, memoria presente/passata, pack volumi/software.
- `supabase/functions/_shared/unlim-ai-profiles.ts`: profili 3x2 e total/compact.
- `src/services/compiler.js`: match precompilati rapidi per esperimenti noti.
- `src/services/simulator-api.js` e `src/components/simulator/hooks/useCircuitHandlers.js`: compile locale piu' rapido e risultato verificabile.
- `api/voxtral.js`, `api/tts.js`, `src/services/voiceService.js`, `vite.config.js`: Voxtral same-origin e proxy dev.
- `src/services/supabaseClient.js`: filtro configurazione Supabase legacy non valida per evitare 401 browser.

## Deploy e provider

- Supabase functions deployate: `unlim-chat`, `unlim-vision`.
- Vercel production ready: `dpl_6M3CwsvCSkbyiZp866iJAvx8i3Lt`.
- Alias `www.elabtutor.school` aggiornato: header `last-modified` 2026-05-09 18:28 UTC, stesso `etag` della URL diretta.
- Galileo/Nanobot Render resta in `connect-src` e nei percorsi di fallback, ma questa sessione non ha dimostrato un upgrade a Render paid/non-free. Serve verifica provider/account separata.

## Non conformita e rischi

- Primo run produzione 104: `apiReadyMs=10500`, fuori soglia 10000. Il run a cache calda passa, ma il cold load resta al limite.
- Primo run locale voce: timeout Voxtral a 10s. Run successivi e produzione passano; resta variabilita.
- Build: warning CSS minify e chunk grandi. Non bloccano il deploy, ma sono debito tecnico.
- Knowledge pack: migliorato, ma non e' il testo integrale verificato dei tre volumi. Non dichiarare "conosce perfettamente tutti i volumi" come fatto provato.

## Artifact

- `response-quality-tests.json`
- `speed-benchmark.json`
- `playwright-quality-speed.json`
- `playwright-desktop.png`
- `playwright-ipad.png`
- `playwright-mobile.png`
- `../2026-05-09-unlim-voice-benchmark/voice-reactivity-benchmark.json`

## Decisione audit

UNLIM ora e' molto piu' usabile sui percorsi operativi noti: risponde breve, agisce, non duplica il placeholder e verifica azioni Arduino/Scratch. Non e' ancora dimostrato "onnisciente" sui tre volumi o perfetto sulla voce reale in aula.
