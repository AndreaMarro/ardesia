# Quality Audit - Sessioni A+B

Data: 2026-05-08  
Repo: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`

## Findings

1. **P0 processo: production deploy completato prima del quality gate approvato**

   Dopo la richiesta "alla fine deploy sul sito vero" ho avviato `npx vercel deploy . --prod -y`. Quando e arrivato lo stop "fai solo prima cov e quality audit", ho ucciso il processo locale, ma Vercel aveva gia completato la build remota. `vercel inspect` mostra `dpl_7hxcPtazDNtkzYeWg3myLZwh4xHh` `Ready` con alias `www.elabtutor.school` e `elabtutor.school`.

   Impatto: sito vero aggiornato senza audit scritto prima. Non ho fatto rollback autonomo.

2. **P1 voce/STT: possibile mismatch env Production**

   `src/services/voiceService.js` usa `VITE_SUPABASE_EDGE_KEY` per aggiungere `apikey`/`Authorization` a `/unlim-stt`, ma `vercel env ls` non mostra `VITE_SUPABASE_EDGE_KEY` in Production. `src/services/api.js` ha invece un fallback anon key hardcoded.

   Impatto: se `VITE_NANOBOT_URL` in Production punta a Supabase Functions, `sendVoiceChat()` puo chiamare `/unlim-stt` senza anon key e fallire. Se punta a Render legacy, allora la dichiarazione "voce Supabase Edge coerente con chat" non e vera in produzione. Serve test HTTPS reale o allineamento env prima di dichiarare voce PASS.

3. **P1 vincolo UNLIM: Sessione B ha toccato prompt operativo**

   `src/services/api.js` modifica `SOCRATIC_INSTRUCTION` e `BREVITY_RULE`, rimuovendo il limite distruttivo a 60 parole. Il fix e ragionevole per evitare taglio citazioni/diagnosi, ma e comunque una modifica del prompt operativo. Va classificata come eccezione "bug bloccante", non come "core linguistico intatto" in senso assoluto.

4. **P2 capability voce sovrastimata**

   `checkVoiceCapabilities()` imposta `tts=true` se esiste `speechSynthesis`, ma `synthesizeSpeech()` usato da Galileo/Simulator API puo comunque fallire se `/api/kokoro`, `/api/tts` e backend TTS falliscono. Esiste fallback browser in `useTTS`, ma non in tutti i call path (`GalileoAdapter` e `simulator-api` usano `voiceService.synthesizeSpeech` diretto).

   Impatto: UI puo mostrare TTS disponibile anche quando il pulsante TTS naturale fallisce silenziosamente o restituisce errore.

5. **P2 build hygiene: warning ancora aperti**

   Build PASS, ma restano:

   - CSS minify `Unexpected "/"`.
   - warning proprieta CSS `file` da classi generate `[file:*]`.
   - chunk >1000 kB, inclusi `react-pdf`, Lavagna, simulatori/Scratch.

6. **P2 worktree condiviso molto sporco**

   Il repo contiene molte modifiche parallele/preesistenti oltre ai file A+B. Non ho revertito nulla. Prima di commit/merge serve staging selettivo e review file-per-file.

## Pass confermati

- Test combinati A+B: 11 file PASS, 418 test PASS, 1 todo.
- Build locale finale: PASS.
- `git diff --check` sui file principali A+B: PASS.
- Playwright locale Sessione A: PASS desktop+iPad proxy, 0 console/page errors.
- Playwright locale Sessione B: PASS desktop+iPad landscape, `logs=[]`, `badResponses=[]`.
- Vercel production deployment attuale: `Ready`.

## No-claim

Non sono verificati su hardware reale:

- Apple Pencil.
- iPad Safari.
- Microfono reale.
- TTS udibile.
- Wake word continuo.

Non e stato eseguito smoke post-production sul dominio vero dopo la production gia completata.

## Raccomandazione

Prima di ulteriori azioni:

1. Decidere se mantenere o rollbackare il production deploy `dpl_7hxcPtazDNtkzYeWg3myLZwh4xHh`.
2. Se si mantiene: fare smoke sul sito vero con Playwright e poi test manuale voce/iPad/Pencil.
3. Allineare env voce: `VITE_SUPABASE_EDGE_KEY` in Production oppure chiarire che Production usa Render legacy.
4. Solo dopo, eventuale nuovo deploy o rollback esplicito.

