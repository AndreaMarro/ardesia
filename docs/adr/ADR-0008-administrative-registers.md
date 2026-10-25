# ADR 0008 — Registri amministrativi nello stesso Core

Stato: implementazione composta, verifica PostgreSQL e percorso integrato ancora da eseguire.

Le presenze e le annotazioni manuali di incasso appartengono al gestionale dei mini-corsi. Un incasso dichiarato non conferma un pagamento esterno, un'iscrizione o un apprendimento; una presenza dichiarata non prova il completamento di una lezione. L'interfaccia mantiene queste quattro informazioni distinte.

## Confini e cambiamenti

`attendance.py` e `manual_payments.py` espongono comandi e letture del Core esistente. API e interfaccia sono adattatori: non possiedono un registro alternativo e non ricostruiscono l'autorità da uno stato locale. Le porte `AttendanceAccess` e `CommercialAccess` rendono separabile una futura politica di accesso; oggi entrambe richiedono il tutor proprietario. Il ruolo attuale rimane globale: questa modifica non implementa organizzazioni o ruoli per scuola.

L'esecutore transazionale condiviso conserva idempotenza, ricevute e atomicità. Le operazioni amministrative non emettono eventi didattici e non cambiano ammissione, valutazioni o diario. I nuovi registri sono esplicitamente esclusi dal quaderno portabile dello studente. Cancellazione e backup usano le stesse operazioni canoniche del Core.

Ogni rettifica aggiunge una revisione con motivo, identificatore del record precedente e revisione attesa. Non si sovrascrive la storia. Le chiavi esterne legano la catena alla stessa persona/cella/voce; la fotografia di calendario o offerta resta quella del fatto originale. I conflitti richiedono una rilettura esplicita. Un ACK tardivo non può svuotare una nuova bozza o attraversare un cambio di sessione.

## Costi di lettura e concorrenza

La griglia presenze è limitata a quattro incontri per dieci iscritti. Una lettura SQL prende le teste delle celle: nessuna query per ciascuna delle quaranta celle. Le storie e gli incassi hanno cursori e limiti; l'API impone al massimo cinquanta righe, l'interfaccia ne richiede venti. Filtri di edizione/proprietario precedono la decodifica delle fotografie JSON.

Pagina incassi e riepilogo derivano da una sola istruzione SQL con CTE. Una transazione PostgreSQL READ COMMITTED con due SELECT non basterebbe a garantire la stessa fotografia: la revisione ha riprodotto questa incoerenza prima della correzione. L'aggregazione legge colonne scalari; solo la pagina limitata decodifica le fotografie. Gli indici sostengono edizione/cella/voce/revisione e riferimento normalizzato. Questo è un contratto di lavoro limitato, non una misura di carico o una garanzia di scala illimitata.

Il riferimento esterno usa NFC e una chiave univoca per tutor, anche fra edizioni. Lock di aggregato, vincoli e confronto della revisione gestiscono i retry concorrenti. Unicode non scalare e numeri non finiti vengono rifiutati con errori limitati, senza riflettere input non serializzabile nella risposta.

## Evoluzione dello schema

La migrazione 12 aggiunge due tabelle e porta lo schema a 5, senza inventare presenze o incassi storici. HTTP non crea o ripara tabelle SQLite/PostgreSQL. Un database assente, vecchio o incompleto rimane un'indisponibilità esplicita fino all'operazione amministrativa.

Le tabelle amministrative concedono al ruolo applicativo SELECT/INSERT con RLS, senza UPDATE/DELETE. La policy generale delle ricevute viene sostituita per escludere `admin.%`: aggiungerne una più stretta accanto a una policy permissiva avrebbe lasciato aperto l'OR. Le prove SQLite/ASGI e la revisione statica non sostituiscono i test PostgreSQL/RLS reali.

Prima della migrazione servono un checkpoint coordinato e verificato del solo ambiente sintetico posseduto, poi avvio da sorgenti congelate. I tentativi di preparazione si sono fermati prima di modificare risorse quando configurazione o stato Docker non erano verificabili. Non è stato dichiarato un backup o un ripristino riuscito.

## Evidenze e limiti correnti

L'autore ha eseguito 592 test con 18 skip PostgreSQL su `b37fd197`; il successore `767ddcd8` ha dieci test mirati. La revisione indipendente ha riprodotto e ricontrollato Unicode, fotografia contabile e numeri fuori scala su SQLite/ASGI. Queste esecuzioni conservano i loro SHA e non sono una suite completa del candidato composto con C7.

La UI iniziale `2d6002b1` aveva un finding sulla verifica del pin di una voce durante la rilettura. Il successore `78696de9`, composto nel prodotto `46fda242`, è verificato corretto da sei probe indipendenti React/HTTP simulato: identità, riferimento, valuta e fotografia dell’offerta devono coincidere in pagina, storia e rilettura; una revisione legittima può essere adottata solo esplicitamente. Questi probe non sono prove di Auth o PostgreSQL reali. PostgreSQL schema 5, autorizzazioni vive, percorso tutor/dieci studenti/due interessati, backup/ripristino dei nuovi fatti e browser integrato restano NOT_RUN. Nessuna certificazione globale G0/G1 deriva da questo ADR.
