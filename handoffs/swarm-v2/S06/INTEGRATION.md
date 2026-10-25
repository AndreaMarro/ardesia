# Raccordo S06 — composizione a cura S00/S10

S00 ACCEPT: https://github.com/AndreaMarro/ardesia/pull/306#issuecomment-6404987366

## Web

```tsx
const IndependentStudy = lazy(() => import('./features/independent-study/IndependentStudy').then(m => ({default: m.IndependentStudy})));
// solo studente autenticato, edizione corrente autorizzata:
<IndependentStudy me={me} editionId={data.edition.id} sessionVersion={sessionVersion} />
```

ID riservato `independent-study`, etichetta «Studia da solo». Il componente è già keyed per identità/edizione/sessionVersion e ascolta sessionBoundary. App/Shell non modificati da S06. Escludere dal rendering grezzo dei Materiali le risorse macchina con kind `independent-study-plan-v1`, `independent-study-source-v1`, `independent-study-attempt-v1` oppure usare adapter; sono fatti Core, non nuovi documenti da presentare come JSON.

## API

Nel factory esistente, vicino agli altri installer, senza cambiare dipendenze o auth:

```python
from lessonos.study.independent_study.routes import install_routes as install_independent_study_routes
install_independent_study_routes(app, store_dependency, authenticate)
```

GET/POST `/study/independent-study`; GET `/{id}`; POST `/{id}/actions` e `/{id}/attempts`. Pydantic vieta campi top-level aggiuntivi. Idempotency-Key obbligatoria sui comandi; accesso verificato dal Core. Il modulo routes importa FastAPI soltanto quando usato dal servizio, non dal dominio headless.

Il test HTTP e il runner locale, finché il factory shared non è delegato, passano gli authenticate/store_dependency reali attraverso l'hook admin di composizione della fixture. Questo prova HTTP/SQLite/Auth reali in composizione isolata, non un aggancio già presente in main o un backend remoto.

## Persistenza e confini

Stato di navigazione in risorsa privata con revisioni CAS. Solo revisioni emesse dal dominio hanno evento `independent-study.saved`: la generic resource API non può falsificare assistenza/stato. Fonte lezione e contesto del tentativo sono risorse/revisioni esatte; la consegna è `submissions.submit` canonica. Entrambe le fonti sono sourceRefs della consegna: il docente accede soltanto alle revisioni presentate, non al planner privato. Nessuna tabella/migrazione, provider o formula frontend nuovi.

Prepare/submit/confirm usa ricevute idempotenti Core. Durante pending le altre azioni sono bloccate; GET restituisce la richiesta byte-esatta e la stessa chiave per recuperare un crash. Una ricevuta già confermata si può ritrovare dopo chiusura e con una nuova sessione. Il feedback precedente è assistenza per tentativi successivi nella stessa fase. Nessun voto o mastery inferiti.

Delta canonico ActivityEvidence.lessonRef/fase resta S10: nessun campo inventato mandato alla freeze attuale. Il ponte sourceRefs è esplicito e versionato. RLS/PostgreSQL e provider remoto non collaudati dal filone S06.

## Limiti di prodotto

Cinque esempi Fisica consentiti e un modulo Taylor già registrato; materiali tutti DRAFT, non lezioni approvate o quattro corsi completi. Le38 qualitative e i200target non diventano consegne/accettazioni per effetto del planner. Prerequisiti sono indicazioni dei pack, non recuperi dedicati completi. Richieste tutor e contestazioni sono persistite private `RECORDED_NOT_SENT`: nessun messaggio esterno o disponibilità nel registro docente dichiarati. Scheduler originale trasparente1/3giorni+override1/3/7/14; nessuna efficacia didattica attestata. Copie offline opt-in del solo passaggio visibile e input; nessun invio senza riconferma Core, nessuna falsa sincronizzazione.
