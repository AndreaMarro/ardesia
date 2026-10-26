# Review del raccordo309/317 — 26 ottobre2026

Base integrata e95a80b393589b71da2846aa98814dc1a034b730, ingresso309350d65a4c795c324cb836808abd9d2e2b39869ad. Questa è una review della composizione in lavorazione, non un verde della nuova head. Ho letto AGENTS, ultimi RUNLOG/NEXT, handoff S06 installed e after-main-a00, App/factory/SourceViewer, dominio/route/planner e cache di studio.

## Finding riprodotto e correzione delegata

P2: `storage.ts` precedente riga15 accettava `reviewScheduler.choices` oggetto, mentre `IndependentStudy.tsx` riga127 usa `.map`. Controprova pura Node26 con cache benformata nei campi allora controllati e `choices:{unexpected:'object'}`: `accepted=true`, poi `TypeError: accepted.state.reviewScheduler.choices.map is not a function`. Una copia corrotta o incompatibile può quindi rompere il recupero offline. Lo stesso confine non controllava controls array, parametri scalari e testi annidati.

Dopo il finding S00 ha delegato espressamente SOLO `storage.ts` e `storage.test.ts`. RED13FAIL/7PASS, poi GREEN20PASS/0,810s sul test mirato; log originali preservati. Ora il confine valida la forma consumata dalla UI. Nessun solver o schema autorevole nuovo. Input della simulazione conservati, risultato omesso con metadata esplicito `omissions:['simulation-result']` anche su cache precedenti e risalvataggio; il parent ha accettato il contratto e cura l'avviso visibile. `clearActorOffline(actor)` elimina copie e bozze di tutte le edizioni dell'attore e preserva altri attori/chiavi. Nessun commit fatto dal revisore, diffcheckPASS. Tsc/fullWeb e prova browser dopo i fix non eseguiti da me. Il parent deve rileggere il delta di cui sono diventato builder.

## Raccordo riletto

SourceViewer risolto conserva ScienceResourceView e IndependentStudySource, i due guard su selezione/fallback raw e gli offset code point dei tentativi S06. Il cambio rapido id/revisione conserva il guard sincrono, active=false dei risultati tardivi e generation/abort del contesto. Notebook è keyed per revisione, lesson-passage ha proiezione distinta. Nessuna nuova regressione dimostrata nel conflitto. Factory installa una sola volta sia independent-study sia science-library, usando auth/store canonici. App monta studio autonomo solo per lo studente iscritto e filtra solo tre kind macchina, lasciando le science-resource visibili nei Materiali. Il dominio preserva CAS, receipt, fonte esatta, assistenza osservata, retry e isolamento nelle API canoniche. La review statica non sostituisce la loro esecuzione.

## Altri percorsi passati al parent

- Cache logout: il listener originale era solo nel componente StudySession e non copriva navigazione verso Materiali prima del logout; App.clearResourceDrafts pulisce un Map diverso. S00 cura la regressione e il hook stabile, nessuna fuga crossactor dichiarata.
- Race proposta: caricamento iniziale non occupa working.current, Riapri ha soltanto aria-disabled; un403 del secondo GET può precedere il200 del GETsession iniziale. handleFailure403 non avanzava generation. S00 cura controprova/fix; non dichiarata riprodotta da questa review.
- Preesistente separato: lesson-passage malformata con onSelect può ancora rendere textarea raw malgrado il messaggio contrario. Lo stesso ramo esiste nella main317; non è stato introdotto dalla composizione309. Nessun fix applicato dal revisore.

## Limiti

Nessun browser/pytest/build pesante indipendente, nessuna modifica fuori dai due file esplicitamente delegati e da questa cartella prove. Vecchi verdi130/34 S06 restano della loro SHA. Le misure del parent, CI e prova del percorso finale devono essere registrate separatamente. Nessuna approvazione umana, rilascio remoto o completamento dei200obiettivi dedotti dalla review.

## Rilettura successiva — fix S00 della sessione

S00 ha riprodotto tre RED nel proprio session-red.log: due copie offline non eliminate dopo abbandono della vista (logout/rejected), più late200 dopo403. Ho letto quei risultati e il delta, senza eseguire io la suite. App chiama ora clearActorOffline nel listener stabile di sessione con dipendenza me.id. IndependentStudy avanza generation e svuota currentState sulla denial; il catch iniziale rifiuta token vecchi. I guard delle risposte positive già esistenti ora impediscono il ripristino del piano privato. L'avviso esplicito sull'omissione del risultato simulazione è presente e non è sovrascritto nel ramo di recupero della bozza. Nessun finding residuo dimostrato nel delta S00; il GREEN integrato resta da attribuire alle esecuzioni del parent. Il mio precedente candidato race è quindi superato dalla controprova S00, non cancellato.
