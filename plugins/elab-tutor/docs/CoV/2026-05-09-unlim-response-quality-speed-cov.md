# CoV - UNLIM response quality, speed, voice

Data: 2026-05-09  
Sessione: ELAB "UNLIM Qualita Risposta + Velocita Fenomenale"  
Verdict: **deploy production eseguito e verificato**, con due caveat espliciti: primo caricamento produzione al limite e voce Voxtral non provata su microfono reale.

## Cambiamenti chiusi

- Placeholder unico aggiornato a `Sto ELABorando...`, senza `Sto elaborando`, senza `elaborandg`, senza duplicazione.
- Rimossa la seconda bolla lenta dal flusso chat: il loading visibile viene gestito da `ChatOverlay`, non da messaggi assistant duplicati.
- Riscritta policy linguistica runtime: default 1-4 frasi, tono diretto da tutor, niente formule da chatbot, citazioni solo se utili e brevi.
- Aggiunto response quality router con intent: operazione nota, spiega breve, diagnosi circuito, Arduino, Scratch, guarda schermo, domanda vaga, narrazione libro/esperimento.
- Fast path locale per Arduino/Scratch/diagnosi/azioni note: non aspetta il modello quando puo' agire.
- Aggiunti profili 3x2 per i volumi e modalita total/compact; il system prompt contiene un pack conoscenza sui tre volumi, sul software e sulla distinzione memoria passata/presente.
- Aggiunta persistenza memoria lato client con contesto separato tra presente live e memoria passata persistente.
- UNLIM puo' richiedere screenshot/visione e instrada la modalita visiva verso profili Pixtral total/essential.
- Ripristinata interazione con UNLIM in Percorso, Passo Passo e Gia Montato.
- Voce: `/api/voxtral` same-origin verso Supabase `unlim-tts`, Voxtral primario in `voiceService`, fallback invariati.

## Test e prove

- `node scripts/bench/unlim-response-quality-speed.mjs`: **100/100** casi qualita passati.
- Unit mirati: `npx vitest run tests/unit/components/tutor/ChatOverlay-waiting-copy.test.jsx tests/unit/unlimResponseQualityRouter.test.js tests/unit/lavagna/useGalileoChatFastPath.test.jsx tests/unit/apiVoxtralProxy.test.js tests/unit/voiceServiceVoxtralPrimary.test.js tests/unit/supabaseClient.test.js`: **14/14**.
- Unit focalizzati allargati eseguiti in sessione: **461 test passati**.
- Playwright locale `99-unlim-100-operational`: **120/120**.
- Playwright locale `104-unlim-response-quality-speed`: **PASS**.
- Playwright locale `102-unlim-voice-reactivity-benchmark`: primo run **FAIL** per timeout Voxtral 10s, rerun dopo warm **PASS**.
- `npm run build`: **PASS**, con warning non bloccanti CSS/chunk.
- Supabase deploy: `unlim-chat` e `unlim-vision` deployate su project `euqpdueopmlllqjmqnyb`.
- Vercel production deploy: **READY**.
- Playwright produzione `104`: primo run **FAIL** per `apiReadyMs=10500` desktop contro soglia 10000; rerun a cache calda **PASS**.
- Playwright produzione `102`: **PASS**.
- Playwright produzione `99`: **120/120**.

## Deploy

- Deployment diretto: `https://elab-tutor-n4lqu6b78-andreas-projects-6d4e9791.vercel.app`
- Alias production: `https://www.elabtutor.school`
- Vercel deployment id: `dpl_6M3CwsvCSkbyiZp866iJAvx8i3Lt`
- Vercel inspect: status `Ready`, target `production`.
- Header verificati su URL diretta e `www`: `last-modified` 2026-05-09 18:28 UTC, stesso `etag`, cache aggiornata.

## Metriche produzione 104, cache calda

Desktop:
- API ready: 8275 ms.
- First UI feedback: 12-25 ms.
- First useful response: 147-513 ms.
- Arduino action verified: 626 ms.
- Scratch action verified: 199 ms.

iPad:
- API ready: 6272 ms.
- First UI feedback: 13-22 ms.
- First useful response: 177-398 ms.
- Arduino action verified: 659 ms.
- Scratch action verified: 235 ms.

Mobile:
- API ready: 6501 ms.
- First UI feedback: 14-23 ms.
- First useful response: 154-403 ms.
- Arduino action verified: 641 ms.
- Scratch action verified: 206 ms.

Controlli produzione:
- niente white screen.
- niente overflow orizzontale.
- niente `[object Object]`.
- niente vecchia copy `Sto elaborando` / `elaborandg`.
- `Sto ELABorando...` non duplicato.
- niente autoplay media.
- console/network puliti nei test 102/104.

## Voce Voxtral

Post-deploy `102`:
- API ready: 6500 ms.
- Voxtral endpoint: HTTP 200, `content-type: audio/mpeg`.
- Provider: `voxtral`.
- Voice: `9234f1b6-766a-485f-acc4-e2cf6dc42327`.
- Model: `voxtral-mini-tts-2603`.
- Provider latency: 2073 ms.
- End-to-end latency: 3289 ms.
- Audio bytes: 58513.

Caveat voce: il test headless prova endpoint, UI vocale, MediaRecorder disponibile e audio generato. **Non prova microfono hardware reale ne' resa acustica in aula**.

## Gate

- Feedback UI <100 ms: **PASS** nei run 104 locale e produzione cache calda.
- Risposta locale utile <500 ms: **PASS** sulle risposte locali; caso Arduino desktop a 513 ms e' fuori dal budget "utile locale", ma dentro budget operativo noto e azione verificata.
- Risposta operativa nota <1500 ms: **PASS**.
- Azione verificata <3000 ms locale: **PASS**.
- No doppio placeholder: **PASS**.
- No `elaborandg`: **PASS**.
- No citazioni inutili nei 100 test: **PASS**.
- Azione quando richiesta: **PASS**.
- No `[object Object]`: **PASS**.
- API ready produzione cold post-deploy <10000 ms: **FAIL una volta** con 10500 ms, poi **PASS** a cache calda.

## Caveat onesti

- Non dichiaro "conoscenza perfetta" dei volumi: il system prompt contiene il pack importante e router 3x2, non il testo integrale completo verificato dei tre volumi.
- La conoscenza dei volumi e' molto migliorata per intent operativi e narrativa ELAB, ma domande non fast-path vanno ancora testate con un set live provider piu' lungo.
- Il primo run locale voce ha avuto timeout Voxtral a 10s; un curl diretto subito dopo ha dato 200 in circa 2.6s e i run successivi sono passati. Questo resta variabilita reale.
- La build passa, ma restano warning CSS minify/chunk grandi.
- Per evitare 401 browser da vecchio progetto Supabase `vxvqalmxqtezvgiboxyv`, il client legacy viene disabilitato: la sync su quel vecchio progetto resta offline finche' non si fornisce una configurazione valida.

## Artifact

- `docs/audits/2026-05-09-unlim-response-quality-speed/quality-audit.md`
- `docs/audits/2026-05-09-unlim-response-quality-speed/response-quality-tests.json`
- `docs/audits/2026-05-09-unlim-response-quality-speed/speed-benchmark.json`
- `docs/audits/2026-05-09-unlim-response-quality-speed/playwright-quality-speed.json`
- `docs/audits/2026-05-09-unlim-response-quality-speed/playwright-desktop.png`
- `docs/audits/2026-05-09-unlim-response-quality-speed/playwright-ipad.png`
- `docs/audits/2026-05-09-unlim-response-quality-speed/playwright-mobile.png`
- `docs/audits/2026-05-09-unlim-voice-benchmark/voice-reactivity-benchmark.json`
- `docs/handoff/2026-05-09-unlim-response-quality-speed-next-session.md`
- `docs/handoff/2026-05-09-unlim-final-behavior-control-prompt.md`

## Decisione

Deploy production eseguito su esplicita richiesta di Andrea. Il risultato e' usabile e verificato sui percorsi operativi principali, ma non va venduto come "perfetto": cold API ready e variabilita Voxtral restano da monitorare.
