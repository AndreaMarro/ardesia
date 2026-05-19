# Quality Audit - UNLIM Voice, Voxtral, Clone Andrea

Data: 2026-05-09

## Verdict

Benchmark voce severo: **FAIL formale** per assenza di prova hardware reale microfono/altoparlante.

Endpoint voce e Voxtral clone: **PASS tecnico su preview**.

Questa distinzione e' importante: posso provare che il sistema genera audio Voxtral con il voice id clone configurato; non posso provare in headless che la voce somigli davvero ad Andrea o che un microfono fisico abbia catturato audio in aula.

Preview finale:

- `https://elab-tutor-7qahic9er-andreas-projects-6d4e9791.vercel.app`

## Evidenza Voxtral Clone

Endpoint diretto Supabase `unlim-tts`:

- HTTP 200.
- `content-type: audio/mpeg`.
- `x-tts-provider: voxtral`.
- `x-tts-model: voxtral-mini-tts-2603`.
- `x-tts-voice: 9234f1b6-766a-485f-acc4-e2cf6dc42327`.
- MP3 valido: 42,987 byte, durata 6.46 s.

Preview `/api/tts` dopo fix fast path:

- HTTP 200.
- `content-type: audio/mpeg`.
- `x-tts-provider: voxtral`.
- `x-tts-model: voxtral-mini-tts-2603`.
- `x-tts-voice: 9234f1b6-766a-485f-acc4-e2cf6dc42327`.
- Latenza manuale end-to-end: 3.71 s.
- MP3 valido: 40,461 byte, durata 6.48 s.

## Benchmark Playwright Voce Finale

Comando:

```bash
RUN_VOICE_BENCHMARK=1 BASE_URL=https://elab-tutor-7qahic9er-andreas-projects-6d4e9791.vercel.app npx playwright test --config tests/e2e/playwright.config.js tests/e2e/102-unlim-voice-reactivity-benchmark.spec.js --project=chromium --reporter=json > docs/audits/2026-05-09-unlim-voice-benchmark/playwright-unlim-voice-reactivity-benchmark-vercel-preview-fast-tts.json
```

Risultato endpoint:

- Voxtral: 200, MP3, provider `voxtral`, voice clone id corretto, 49,775 byte, 2654 ms.
- Kokoro: 200, MP3, 74,924 byte, 3226 ms.
- `/api/tts`: 200, MP3, provider `voxtral`, voice clone id corretto, 40,516 byte, 3453 ms.
- Console errors: 0.
- Network failures: 0.
- UI voce: toggle visibile, record button visibile.
- Browser capabilities: `speechSynthesis`, `Audio`, `getUserMedia`, `MediaRecorder` presenti.

Fallimento residuo:

- `realMicrophoneHardwareLog = NOT_PROVEN`.

## Root Cause Dei Rallentamenti

Il ramo `/api/tts` aspettava il vecchio VPS Edge TTS prima di cadere su Voxtral. Quando il VPS non rispondeva, aggiungeva circa 10 secondi morti.

Fix:

- `/api/tts` usa Voxtral/Supabase `unlim-tts` come primario.
- VPS legacy solo fallback con timeout corto.
- `voiceService.synthesizeSpeech()` usa `/api/voxtral` come primo ramo, poi Kokoro, poi `/api/tts`.

## Non Claim

- Non dichiaro che la somiglianza vocale Andrea sia validata da orecchio umano.
- Non dichiaro STT hardware PASS.
- Non dichiaro conversazione voce completa microfono -> STT -> UNLIM -> TTS -> speaker PASS senza log reale.
- Non dichiaro production deploy.

## Addendum Production 2026-05-09

Production testata:

- `https://www.elabtutor.school`.
- Artifact: `playwright-unlim-voice-reactivity-benchmark-production-main.json`.
- Verdict: FAIL.

Motivi:

- `apiReadyMs = 13443`, soglia 10000.
- `realMicrophoneHardwareLog = NOT_PROVEN`.

Endpoint:

- `/api/tts`: 200 MP3, provider `voxtral`, voice `9234f1b6-766a-485f-acc4-e2cf6dc42327`, latency 1844.1 ms.
- `/api/voxtral`: 200 MP3, provider `voxtral`, voice `9234f1b6-766a-485f-acc4-e2cf6dc42327`, latency 3921.6 ms.
- Kokoro fallback: 200 MP3, latency 2855.6 ms.
- Console errors: 0.
- Network failures: 0.

Conclusione: `/api/tts` e' dentro il budget 1-2s nel run production, ma la catena voce completa non e' PASS per API ready lenta e assenza prova hardware.
