# P1 — Studio StudyApp, bootstrap pubblico

Base: `17eebd0`. Ownership del root limitata a `apps/studio/src/study/StudyApp.tsx` e al nuovo `apps/studio/src/__tests__/StudyApp.publicBootstrap.test.tsx`. Nessun edit a `apiClient`, `sessionBoundary`, PublicCourseView, E2E o guard di autorizzazione; nessun commit/push.

## Causa e RED

Il root ha osservato il fallimento nativo dell'originale `e2e/study-group-journey.spec.ts`: Invio interesse restava disabilitato nonostante `/study/course` HTTP 200. Prima del delta, PublicCourseView montava immediatamente e il suo effetto avviava `/study/course`; successivamente l'effetto del parent chiamava `beginStudySessionCheck()`, avanzava l'epoch e abortiva quella richiesta. PublicCourseView restava montato senza una nuova lettura.

Il nuovo test usa `studyRequest` e sessionBoundary reali, fetch con un vero AbortSignal/AbortError, `/me` differito e i componenti PublicCourseView e CoursePackPreview reali. Sono simulati solo Workspace privato e laboratorio, estranei al bootstrap. Sul codice iniziale **5/5 casi RED**: lettura prematura del corso (due letture in StrictMode), corso mai disponibile e modulo interesse disabilitato. Raw: `study-app-bootstrap-red.log`. Il primo harness simulava l'anteprima del pack: la review root ha segnalato la stessa race del suo effetto `/coursepack`. Rimosso quel mock, sono stati riprodotti **2/2 ulteriori RED mirati** sulla lettura prematura e sul mancato recupero del pack dopo login fallito; raw `study-app-bootstrap-preview-red.log`. Il GREEN finale usa entrambe le viste pubbliche reali e un pack sintetico valido con zero attività, senza avviare un valutatore aggiuntivo.

## Correzione minima

- Un booleano `checked` inizialmente false impedisce di montare PublicCourseView e CoursePackPreview prima della conclusione del controllo iniziale.
- Il `finally` imposta checked soltanto se quell'effetto è ancora montato. Non usa l'epoch come condizione: un `/me` valido attiva la sessione e avanza legittimamente l'epoch.
- Il form di login resta disponibile con `/me` pendente. Entrambe le viste pubbliche usano la chiave dell'epoch corrente: dopo un exchange fallito che ha abortito le letture precedenti, il render del messaggio d'errore monta una sola lettura nuova per endpoint. Nessun timer o retry illimitato.

Il diff runtime è di quattro linee comportamentali. L'epoch, gli AbortController, activateStudySession e le guardie private restano invariati.

## GREEN e binding

**7/7 test PASS**, typecheck `tsc -b --noEmit` PASS e diffcheck PASS:

1. Anonimo: nessun `/course` o `/coursepack` prima della conclusione di `/me`; poi corso/banco leggibili e pulsante abilitato, invio interesse e ricevuta con Idempotency-Key.
2. Cookie valido: soltanto workspace dell'identità corrente; logout ritorna a un corso pubblico fresco.
3. StrictMode: primo `/me` abortito, secondo principal valido; nessun principal stale o corso pubblico transitorio.
4. Unmount: controllo abortito; risposta tardiva non monta letture pubbliche o private.
5. Visitatore anonimo: invito scambiato e scope studente restituito.
6. `/me` ancora pendente: login utilizzabile, invito riuscito e vecchio `/me` incapace di sostituire il principal nuovo.
7. Login fallito durante le letture corso e pack: entrambi i vecchi segnali abortiti, esattamente una nuova lettura per endpoint, contenuti leggibili e modulo interesse nuovamente abilitato.

```sh
cd /private/tmp/ardesia-r2-20261024/apps/studio
/opt/homebrew/opt/node@26/bin/node node_modules/vitest/vitest.mjs run \
  src/__tests__/StudyApp.publicBootstrap.test.tsx \
  --pool=threads --maxWorkers=1 --no-file-parallelism
/opt/homebrew/opt/node@26/bin/node node_modules/typescript/bin/tsc -b --noEmit
```

Log finali: `study-app-bootstrap-green-final.log`, `study-app-bootstrap-typecheck-final.log`.

`study-app-bootstrap-binding.json` lega la fonte al delta non committato:

| File | SHA-256 |
|---|---|
| StudyApp.tsx | `de0574cc85cf54e0b22db53ef8b386adca889fcec1cf630d6dc5d406f4c13fda` |
| StudyApp.publicBootstrap.test.tsx | `2b1c17f35dd345238a6cb34de1f97661b5f9a443ab90a86d7d93729f31d7638a` |

La review indipendente C ha verificato gli hash finali, rieseguito i sette casi con entrambi i consumer pubblici reali e concluso senza P0/P1 individuati nel delta; report `/tmp/auditreview/study-bootstrap-review.md`. La ripetizione del journey nativo originale sul build ricostruito appartiene al gate finale della regia. I test qui verificano il bootstrap e le transizioni locali, non una nuova prova remota Auth/Storage o un'autorizzazione di pubblicazione.
