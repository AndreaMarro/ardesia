# Review indipendente finale — bootstrap StudyApp, 25 ottobre 2026

Sola lettura e test mirato, nessun edit. Il verdetto riguarda il binding finale che include entrambi i consumer pubblici, sostituendo la precedente review su e994c048 che non comprendeva il gate CoursePackPreview.

- `apps/studio/src/study/StudyApp.tsx`: SHA256 `de0574cc85cf54e0b22db53ef8b386adca889fcec1cf630d6dc5d406f4c13fda`.
- `apps/studio/src/__tests__/StudyApp.publicBootstrap.test.tsx`: SHA256 `2b1c17f35dd345238a6cb34de1f97661b5f9a443ab90a86d7d93729f31d7638a`.

## Verdetto

Nessun P0/P1 individuato nel delta. Il primo mount non crea più PublicCourseView o CoursePackPreview prima del controllo /me; ciò impedisce che l'epoch iniziale annulli le loro richieste senza una ripartenza. Entrambi usano la key dell'epoch, così uno scambio login fallito che annulla /course e /coursepack viene seguito da richieste nuove. Il login resta utilizzabile mentre /me è pending.

Il finally del controllo iniziale modifica soltanto checked e usa il boolean locale al singolo effect: non può completare un effect già smontato o la prima esecuzione ripulita da StrictMode. Non usa l'epoch vecchio per sbloccare il rendering, perché activateStudySession avanza quell'epoch quando il cookie è valido. L'identità privata continua invece a passare da activateStudySession(epoch), dai guard epoch del client e dal controllo di mount; non deriva da checked. Nessun cambiamento a apiClient, sessionBoundary o autorizzazioni Core.

## Prova fresca del revisore

Comando Vitest deterministico sul solo `StudyApp.publicBootstrap.test.tsx`: **7/7 PASS**, 1 file, exit0. `git diff --check` sui due file PASS. Log `/private/tmp/auditreview-study-bootstrap-final.log`.

I casi verificano: anonimo → corso reale/pack reale + interesse con chiave idempotente; cookie valido → workspace scelto + logout pubblico; doppio effect StrictMode con prima richiesta annullata e identità corrente; unmount e risposta /me tardiva; invito dopo bootstrap anonimo; invito durante /me pending con /me vecchio risolto dopo; login fallito con annullamento delle due richieste pubbliche e un solo nuovo fetch per ciascuna.

PublicCourseView, CoursePackPreview, apiClient e AbortSignal sono reali nei test. Fetch è il server sintetico e PhysicsActivity/StudyWorkspace sono isolati, quindi il test verifica il bootstrap e la selezione del relativo scope, non l'intero workspace o cookie HTTP remoti. Il replay nativo M1 sul candidato composto resta una verifica distinta dell'integratore. Nessun ampliamento dello scope e nessun file audio toccato.
