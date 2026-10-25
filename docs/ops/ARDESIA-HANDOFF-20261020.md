# Consegna Ardesia — 20 ottobre 2026

L’utente ha chiesto di concludere il lavoro in corso, portarlo su GitHub e fermare il goal. Il candidato è conservato sul ramo `codex/ardesia-v4-g0-20261020`, nella [PR267](https://github.com/AndreaMarro/ardesia/pull/267). La chiusura della PR avviene senza merge: **G0 globale non certificato; G1 non pronto**. Nessun proseguimento automatico è previsto dopo questa consegna.

Il prodotto finale di questa sessione è `46fda24283ef686172ff3edd082139fffe395e84`: backend del registro `dd43df52` più i18file Web del freeze `78696de9`, verificati byte-per-byte. I commit successivi alla sorgente prodotto contengono documentazione. Lo stato macchina si rigenera con `bin/state/project_state.py`; questo documento è un’istantanea della consegna.

## Codice consegnato

Il monorepo recupera Engine/LessonOS, Studio, memoria, grafo e documentazione. Il Core condiviso serve mini-corsi e aree personali, fonti con revisione esatta, lezioni, consegne/correzione e Diario degli errori; i pack Fisica Semestre Filtro e Analisi1 hanno documenti e prove con i limiti registrati nei rispettivi dossier. Non tutti i requisiti del programma sono completati o scientificamente approvati.

Il nuovo registro aggiunge presenze e annotazioni manuali di incasso, con interfaccia tutor integrata nei corsi. Interesse, iscrizione, incasso dichiarato e presenza sono informazioni distinte. Un’annotazione non verifica un pagamento esterno e non produce un evento didattico. Le rettifiche aggiungono revisioni motivate e richiedono il record/revisione attesi; non riscrivono la storia. La UI conserva bozze e chiavi di retry, attende ricevute valide e impedisce a risposte tardive o di altra sessione di confermare nuovi dati.

Il pin della rilettura contabile verifica persona, riferimento, valuta e offerta originale in tutte e tre le superfici: pagina, storia e rilettura fuori pagina. Una nuova revisione legittima richiede adozione esplicita. La revisione indipendente ha riprodotto il difetto originale prima della correzione; i sei probe finali sono verdi nel solo perimetro React/HTTP simulato.

C7 centralizza il rifiuto di sessione su JSON, file e upload: una401 autenticata invalida la shell privata; una risposta della sessione precedente non cancella il cookie del nuovo accesso. C8 migliora nomi accessibili, titoli e focus. Le prove reali PostgreSQL/Auth/Chrome di C7/C8 rimangono attribuite al prodotto precedente `f4384eed`, non al nuovo registro.

## Verifiche e loro perimetro

| Oggetto | Evidenza conservata | Limite |
| --- | --- | --- |
| Prodotto combinato46fda | Otto check-run GitHub CI SUCCESS sullo SHA esatto, inclusi139test Web su20file, typecheck/build e Core/API | La CI dichiara gli skip live; non esercita il nuovo registro sul PostgreSQL locale |
| Root locale46fda | Typecheck exit0; Web interrotto al limite210s, due casi falliti nel log parziale | Non è un PASS della suite locale; build locale successiva non eseguita; causa non stabilita |
| Backend del registro |592PASS/18skipPG su b37;10mirati su767; recheck indipendenti Unicode, lettura pagina/totale atomica e numeri fuori scala | Fonti distinte; nessuna nuova suite completa locale su46fda |
| UI del registro |131Web sul primo2d; fix786:7PASS/1timeout dell’autore;6probe indipendenti PASS sul fix | Mock HTTP; le prove browser/Axe del2d non sono riattribuite al fix786 |
| C7/C8 su f438 |543Core/API con PG/Auth/RLS/Storage reali,0skip;110Web;26viste Chrome/Axe a1440/390, nessuna violazione/overflow/pageerror | Ambito sintetico e automatizzato; nessuna certificazione UX umana/WCAG completa |
| RestoreS | DB/Auth/Storage su volumi distinti,3asset/3oggetti/3file, degrado503 e ricostruzione verificati | Fixture nota completa; debito storico15file mancanti ancora aperto; nuovi registri esclusi dal run storico |

Fonti: [stato](ARDESIA-STATE.json), [verifica registro](admin-registers/verification-at-handoff.json), [autore UI](admin-registers/web-author-78696de9.md), [recheck UI indipendente](admin-registers/web-independent-78696de9.md), [recheck backend](admin-registers/backend-independent-767ddcd8.md), [cronologia](ARDESIA-RUNLOG.md). I fallimenti e i raw privati restano conservati localmente, separati dai report pubblicabili.

## REA realmente osservata

Le ricevute R0/R1/R2/R3/R8/R6/R4 sono accettate nel perimetro `f4384eed`. Il root ha ricalcolato96input nuovi e158storici e verificato39file di implementazione. Gli originali checker dei subgate REA G0/G1 passano con policy invariata: **non sono il gate globale del prodotto**. Le quattro capture correnti sono globalmenteINCOMPLETE; il confronto mantiene7CHANGED/363UNKNOWN. Non si trasformano gli UNKNOWN in equivalenza.

La mappa139 registra139visite d’ingresso; non significa139reverse engineering completi. Le indagini profonde di MathLive081 e PDF.js082 hanno evidenze e contratti, con licenze/versioni circoscritte. Il prototipo082ADAPTER resta separato e non è integrato: la revisione indipendente F082-1 ha riprodotto una vecchia rejection di pagina/testo che sovrascrive lo stato della fonte successiva. Occorrono guard di generazione anche nei catch/finally e un descrittore binario autorizzato con SHA canonico prima dell’adozione. [Review indipendente082](rea-deep/TARGET-082/INDEPENDENT-INTEGRATION-REVIEW.md). Ricerca e prove non sono equiparate a componenti adottati. Il [dossier esperimenti116/082ADAPTER](rea-deep/EXPERIMENTS-HANDOFF-20261020/README.md) conserva il lavoro supplementare senza promuoverlo a prodotto.

## Manutenibilità e scala

Un solo Core, adattatori HTTP/Web, porte di accesso sostituibili e moduli separati per presenze/incassi. Query limitate, cursori e indici; griglia4×10, pagine20/max50 e una sola istruzione SQL per pagina contabile e totale. Lo schema5 richiede migrazione12 esplicita: HTTP non ripara il database all’avvio. [ADR0006](../adr/ADR-0006-change-tolerance-and-growth.md), [ADR0007](../adr/ADR-0007-encoded-body-admission.md), [ADR0008](../adr/ADR-0008-administrative-registers.md).

Questi contratti facilitano i cambiamenti, senza provare scala illimitata. Ruolo globale del principal, organizzazioni non implementate e letture workspace/consegne ancora da paginare restano debiti espliciti. Non sono state aggiunte dipendenze per il registro.

## Stato operativo e lavoro non concluso

La migrazione schema5, RLS reale del registro, viaggio tutor/dieci studenti/due interessati, backup/ripristino dei nuovi fatti e browser integrato del nuovo registro sono NOT_RUN. I tentativi di checkpoint del clone si sono fermati prima di creare un backup, modificare il database o fermare le API. Lo stato Docker corrente non era verificabile; GET sul socket posseduto è scaduto dopo8s. Il runtime locale precedentemente osservato serve `f4384eed`, non46fda; la sua disponibilità corrente non è stata riconfermata.

Restano approvazioni umane/scientifiche, requisiti syllabus/media/offline/cancellazione, organizzazioni/ruoli, paginazione e checkpoint AC085 del21ottobre sera. Le priorità e i requisiti originali rimangono nei documenti `docs/ardesia-v4/`; questa consegna non li cancella.

Un push errato ha avviato automaticamente una Preview Vercel del commit9e0, deployment `dpl_5iUwzeRarRoXUxb49ra4te4Ypwv1`, non produzione. Il ramo temporaneo è rimosso e `vercel.json` esclude ora `codex/ardesia-*`; i push successivi usano il ref candidato esplicito. Ispezione MCP403 e CLI ufficiale64.7.0 senza credenziali non hanno consentito di verificare rimozione o costo: **entrambi restano sconosciuti**. Nessun merge o deploy produzione eseguito. Anche l’esito/costo di precedenti chiamate CLI live restaUNKNOWN; i test live ora richiedono opt-in esplicito e ambiente controllato.

GitHub contiene codice, migrazione, test, contratti e resoconti condivisibili. Credenziali, sessioni, configurazioni private, corpus e manuali allegati, database/backup, acquisizioni grezze di terzi rimangono fuori dal repository. Nessun servizio esistente o archivio privato viene eliminato durante la chiusura.

Per riprendere serve una nuova richiesta dell’utente: prima verificare accesso/ownership del runtime, creare e verificare il checkpoint coordinato del solo ambiente sintetico, poi eseguire migrazione e prove reali. Solo dopo aggiornare l’associazione REA al nuovo prodotto e riesaminare G0/G1. Non è programmata una prosecuzione autonoma di questo goal.
