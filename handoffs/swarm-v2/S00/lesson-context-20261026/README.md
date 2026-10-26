# S00 — Contesto esatto della consegna e della correzione

## Contratto e comportamento

La consegna conserva il riferimento della lezione (id, versione e SHA-256) e
la fase `practice` oppure `transfer` nella ricevuta Core esistente. Il Core
ricalcola il riferimento dalla proiezione autorizzata del pack dell'edizione;
un hash fornito dal client non attribuisce accesso. La fase transfer richiede
i parametri della situazione dichiarata. Una modifica dei controlli del
modello è pratica, non una prova di trasferimento o di padronanza.

Il comando incerto ritenta la stessa chiave e lo stesso payload. Un rifiuto
definitivo conserva testo e parent: non diventa silenziosamente un primo
tentativo. Le revisioni devono riguardare lo stesso attore, edizione,
attività, lezione e fase. I comandi legacy restano compatibili; una ricevuta
legacy non acquisisce retroattivamente una lezione esatta. Il lettore rifiuta
un retry senza provenienza esatta anziché scegliere la prima lezione.

La vista Lavoro permette di riprovare anche una lezione diversa dal modello
iniziale del corso. Dopo la conferma il parent viene chiuso, mentre il lettore
conserva la lezione e la fase appena usate. Nessuna tabella, migrazione,
dipendenza, autenticazione o autorità di valutazione aggiunta.

## Prove e controprove

- Core iniziale: sette RED sul riferimento assente dalla ricevuta e dai
  controlli di revisione. Frontend iniziale: sei RED.
- Review distinta: il rifiuto definitivo cancellava il parent (due RED).
  Una successiva revisione mantiene il parent; il caso è ora nel gate Web.
- Transfer con parametri practice: RED HTTP 200, corretto in 409 senza creare
  una ricevuta. Le richieste legacy continuano a funzionare.
- Browser: risposta realmente persa dopo il commit Core, recupero idempotente,
  ricevute practice e transfer, correzione tramite la vera vista docente e
  lettura nel Lavoro dello studente. Il primo runner aveva un selettore che
  ignorava il prefisso della previsione: fallimento conservato, distinto dal
  difetto applicativo del pulsante retry assente per la lezione non iniziale.
- Un secondo RED applicativo mostrava il ritorno alla prima lezione dopo
  l'acknowledgement: il relativo test unitario e il browser ora passano.
- Risultato finale: **17 API, 13 frontend e 10 gruppi browser PASS**. La prova
  browser finale usa il prodotto locale `b26f4e4` con i file esatti registrati
  in `result.json`: riavvio del processo API, nuovo browser, tre ricevute
  identiche, feedback persistito e peer 403. Zero errori JavaScript e zero
  richieste esterne.

Chromium 148.0.7778.96, Node 24.22.1 e Python 3.13; dati sintetici SQLite.
Screenshot a 360/390/820/1440, senza overflow orizzontale. Desktop e 390px
ispezionati. Questa prova di contratto usa il corso Meccanica e non sostituisce
il journey golden G0 Poiseuille o una verifica di Safari/dispositivi reali.

Una singola esecuzione di laboratorio ha misurato 1116 ms per aprire la
lezione e 1547 ms per riavviare server e browser e ritrovare il feedback.
Sono tempi di questa fixture locale, non Core Web Vitals né capacità di
produzione. La verifica dell'intero tree integrato e la CI remota sono gate
successivi, registrati dalla regia di integrazione.

## Riproduzione

Usare il runtime bloccato del repository e Chromium della versione Playwright.
`npm run build:web`, poi `node bin/qa/course-context-browser.mjs` con
`ARDESIA_STUDY_PYTHON`, `ARDESIA_COURSE_CONTEXT_STATE` e
`ARDESIA_COURSE_CONTEXT_EVIDENCE` impostati a runtime/directory nuove. La prova
avvia e termina soltanto il proprio server. Non pubblicare la directory di
stato: contiene database e codici di accesso sintetici. La CI usa il runner
`bin/qa/verify-integrated-consumers.py` e conserva solo le prove consentite.
