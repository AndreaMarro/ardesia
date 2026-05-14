# Handoff - prossima sessione UNLIM

Data: 2026-05-09  
Stato: deploy production eseguito, test principali passati, caveat documentati.

## Stato live

- URL production: `https://www.elabtutor.school`
- URL diretta deploy: `https://elab-tutor-n4lqu6b78-andreas-projects-6d4e9791.vercel.app`
- Vercel deployment id: `dpl_6M3CwsvCSkbyiZp866iJAvx8i3Lt`
- Supabase project: `euqpdueopmlllqjmqnyb`
- Functions deployate: `unlim-chat`, `unlim-vision`

## Cosa e' cambiato

- Placeholder ufficiale: `Sto ELABorando...`.
- Vecchie forme bandite nel runtime/test: `Sto elaborando`, `elaborandg`.
- Doppio placeholder rimosso.
- Risposte default brevi, operative, con citazioni solo se servono.
- Fast path locale per comandi noti e azioni Arduino/Scratch.
- Router qualita con intent e budget.
- Profili AI 3x2 per volumi e modalita total/compact.
- Memoria persistente con distinzione presente live / memoria passata.
- Screenshot/visione instradabili su profili Pixtral.
- Chat UNLIM disponibile anche nelle modalita Percorso, Passo Passo, Gia Montato.
- Voce: Voxtral primario via `/api/voxtral`, fallback invariati.

## Prove finali

- `node scripts/bench/unlim-response-quality-speed.mjs`: 100/100.
- Unit mirati: 14/14.
- Unit focalizzati allargati in sessione: 461 passati.
- Locale `99-unlim-100-operational`: 120/120.
- Locale `104-unlim-response-quality-speed`: PASS.
- Locale `102-unlim-voice-reactivity-benchmark`: primo run FAIL per timeout Voxtral 10s, secondo run PASS.
- Build: PASS con warning.
- Produzione `104`: primo run FAIL `apiReadyMs=10500`, secondo run PASS.
- Produzione `102`: PASS.
- Produzione `99`: 120/120.

## Dati importanti

Produzione 104 cache calda:
- desktop API ready 8275 ms, Arduino verificato 626 ms, Scratch 199 ms.
- iPad API ready 6272 ms, Arduino 659 ms, Scratch 235 ms.
- mobile API ready 6501 ms, Arduino 641 ms, Scratch 206 ms.

Voce produzione:
- Voxtral 200, provider `voxtral`.
- voice `9234f1b6-766a-485f-acc4-e2cf6dc42327`.
- provider latency 2073 ms, end-to-end 3289 ms, audio 58513 bytes.

## Caveat da non nascondere

- Cold load produzione al limite: un run post-deploy ha fatto 10500 ms di API ready.
- Voxtral ha mostrato variabilita: primo run locale abortito a 10s.
- Test voce headless non prova microfono reale o ascolto in classe.
- Pack conoscenza volumi migliorato, ma non integrale. Non dire "conoscenza perfetta" senza nuovo audit sui testi completi.
- Warning build CSS/chunk restano.
- Verifica Render paid/non-free per Galileo/Nanobot non completata in questa sessione.

## Artifact

- `docs/CoV/2026-05-09-unlim-response-quality-speed-cov.md`
- `docs/audits/2026-05-09-unlim-response-quality-speed/quality-audit.md`
- `docs/audits/2026-05-09-unlim-response-quality-speed/response-quality-tests.json`
- `docs/audits/2026-05-09-unlim-response-quality-speed/speed-benchmark.json`
- `docs/audits/2026-05-09-unlim-response-quality-speed/playwright-quality-speed.json`
- `docs/audits/2026-05-09-unlim-response-quality-speed/playwright-desktop.png`
- `docs/audits/2026-05-09-unlim-response-quality-speed/playwright-ipad.png`
- `docs/audits/2026-05-09-unlim-response-quality-speed/playwright-mobile.png`
- `docs/audits/2026-05-09-unlim-voice-benchmark/voice-reactivity-benchmark.json`
- `docs/handoff/2026-05-09-unlim-final-behavior-control-prompt.md`

## Prossima sessione consigliata

1. Audit vero dei tre volumi: estrarre pack completo verificabile e testare 50 domande non fast-path.
2. Ridurre cold `API ready`: split chunk lavagna/simulatore e misurare p95/p99 su produzione.
3. Rendere Voxtral piu' prevedibile: warmup controllato o cache breve delle frasi frequenti.
4. Verificare account/provider Galileo-Nanobot su Render non-free e documentare prove.
5. Test hardware voce con microfono reale e playback in browser non headless.
