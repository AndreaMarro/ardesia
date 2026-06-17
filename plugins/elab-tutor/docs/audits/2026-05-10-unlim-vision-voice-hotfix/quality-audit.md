# Quality audit - UNLIM vision + voice hotfix

Data: 2026-05-10  
Scope: regressione mostrata da screenshot utente: voce in errore, risposta teorica a "riesci a vedere il circuito?", `Errore sconosciuto`.

## Fix applicati

- `riesci a vedere il circuito?` ora viene riconosciuto come richiesta visiva: trigger aggiornato da `vedi` a `vedi/vedere/vederlo`.
- Se la visione non parte o lo screenshot non e' affidabile, UNLIM non cade piu' nella chat generica: risponde onestamente usando lo stato del simulatore o chiede di riprovare con la fotocamera.
- Il fallback chat non mostra piu' `Errore sconosciuto` quando `sendChat` ritorna gia' un messaggio amichevole in `response`.
- La voce STT usa lo stesso anon JWT valido del progetto ELAB quando `VITE_SUPABASE_EDGE_KEY` e' vuota o legacy.
- Se la voce fallisce, la bolla `Messaggio vocale in elaborazione...` viene sostituita con un messaggio breve; non resta appesa.

## Prove

- Unit mirati: `25/25` passati.
- Unit estesi hotfix: `221/221` passati.
- Quality JSON: `100/100` passati.
- Build: PASS, con warning CSS/chunk gia' noti.
- Smoke browser manuale locale con route `/unlim-vision` intercettata:
  - richiesta: `riesci a vedere il circuito?`
  - `visionCalled`: true
  - risposta visiva mostrata: true
  - risposta sbagliata "Un cortocircuito..." assente
  - `Errore sconosciuto` assente
  - vecchio placeholder/refuso assente
- Playwright 104 locale:
  - primo run seriale FAIL: mobile `fai tu, sono in panico` 702 ms contro soglia 500 ms.
  - secondo run seriale PASS.
- Playwright 102 voce locale: PASS.
- Deploy production Vercel:
  - diretto testato: `https://elab-tutor-mvrg7h18w-andreas-projects-6d4e9791.vercel.app`
  - diretto finale: `https://elab-tutor-r7tu0ys93-andreas-projects-6d4e9791.vercel.app`
  - alias: `https://www.elabtutor.school`
  - deployment id testato: `dpl_CC1FdpmRkGk9d8fZNWFML4zH8jx5`
  - deployment id finale: `dpl_CjapjW2bC5fLRPwmAEmfQctjAtLZ`
  - inspect finale: **Ready**
  - alias headers finali: HTTP 200, `last-modified: Sat, 09 May 2026 23:05:43 GMT`, `etag: "83329d76124b0ce7cbdc285b314577c1"`
- Smoke visione post-deploy:
  - `visionCalled`: true
  - risposta visiva mostrata: true
  - risposta sbagliata "Un cortocircuito..." assente
  - `Errore sconosciuto` assente
  - vecchio placeholder/refuso assente
- Smoke visione deploy finale `r7tu0ys93`:
  - `visionCalled`: true
  - risposta visiva mostrata: true
  - risposta sbagliata "Un cortocircuito..." assente
  - `Errore sconosciuto` assente
  - vecchio placeholder/refuso assente
  - console errors: 0
- Playwright 102 voce produzione: PASS.
- Playwright 99 produzione su deploy `mvrg7h18w`: **120/120**.
- Playwright 104 produzione:
  - primo run FAIL: `apiReadyMs=11557` desktop e Arduino operativo `2259 ms`.
  - secondo run caldo PASS.
- Galileo/Nanobot Render health pubblico:
  - URL: `https://elab-galileo.onrender.com/health`
  - HTTP 200.
  - `status: ok`, `version: 5.5.0`.
  - provider dichiarati dall'endpoint: DeepSeek, Gemini 2.5 Flash, Groq, DeepSeek Reasoner, Kimi.
  - vision attiva, specialisti circuit/code/tutor/vision/teacher.
  - **Render non-free/paid non provato**: l'health endpoint non espone piano/billing.

## Caveat

- Il test voce headless conferma endpoint/UI/TTS Voxtral, non prova microfono hardware reale in aula.
- La latenza puo' ancora oscillare: un run locale mobile ha superato il budget utile e un run produzione cold ha superato API ready/Arduino operativo.
- Galileo/Nanobot e' raggiungibile su Render, ma il piano non-free richiede dashboard/API Render con credenziali.
- Warning build CSS/chunk restano.

## Verdict

Hotfix valido per deploy client: corregge il comportamento mostrato nello screenshot e non introduce regressioni nei test mirati. Non dichiaro voce "perfetta" su hardware reale.
