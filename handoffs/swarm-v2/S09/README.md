# S09 — primo consumer gestionale tutor

Stato: IMPLEMENTATO, CI verde; prova browser finale in corso. Non DONE del mandato S09.
Base: `37e0fe828e47b7c81784c2eb48a1b9776dd859ed`.
Branch: `codex/s09-tutor-operations-20261026`.
Rendez-vous: https://github.com/AndreaMarro/ardesia/pull/306

## Risultato raggiungibile

Da Corsi, il docente proprietario apre «Posti, persone e riepilogo economico».
La superficie usa i registri Core esistenti: posti liberi meno riserve attive,
iscritti, lista d’attesa e interesse separati; appuntamenti e ore residue delle
edizioni caricate, con misura in UTC e visualizzazione Europe/Rome.
Il valore nominale degli iscritti è una previsione; gli incassi sono dichiarazioni
manuali. Ricavi verificati e somme dovute rimangono non determinati.

Le presenze esportano anche data originaria e conflitto calendario. Le annotazioni
di incasso sono esportabili per pagina, con navigazione; il totale Core include
tutte le pagine. Ogni campo CSV è quotato e neutralizzato per formule. Il calendario
ICS richiede anteprima e conferma della stessa revisione, con retry della stessa
chiave; nessun invito o promemoria viene inviato. Le letture private non partono
finché il riepilogo è chiuso. Cambio identità/edizione/sessione distrugge il consumer;
403 o una risposta incoerente non lasciano dati esportabili.

## Ownership e persistenza

- UI: `apps/web/src/features/tutor-operations/**`.
- Raccordo: sole due righe in `features/Courses.tsx`, delega S00
  https://github.com/AndreaMarro/ardesia/pull/306#issuecomment-6404992331.
- Nessun nuovo endpoint, schema, database, login, ledger o package runtime.
- Date/iscrizioni/registri/ricevute persistono nel Core; l’agenda è una proiezione.
  Il browser non introduce una seconda autorità né memorizza anagrafiche localmente.
- EditionManager, editions.py, admin_routes.py, RootApp e memoria comune non modificati.

## Prove eseguite a questo checkpoint

- Baseline Core groups+calendar_time: 37 PASS.
- Baseline EditionManager: 5 PASS.
- Nuovi test UI/modello iniziali: 10 PASS.
- Nuovo attraversamento Core: 1 PASS. Creazione Taylor, date e offerta; 9 iscritti
  e 2 richieste concorrenti sull’ultimo posto, una sola riserva; conclusione con
  10 iscritti e 2 in attesa. Retry, dichiarazione manuale 1200 centesimi separata
  dal valore nominale 49000, altro tutor/studente403, riapertura di un nuovo Store.
- Typecheck Web: exit0. La prova finale sulla head è distinta.
- Review tecnica read-only di un secondo agente: nessun difetto azionabile;
  ha letto codice e contratti, senza eseguire test o browser. Non è approvazione umana.
- Prima suite dopo aggiunta ICS: 13 PASS/2 timeout5000ms su host saturo.
  I due test riguardano apertura riepilogo e download calendario; nessun gate o
  timeout modificato. Ripetizione seriale invariata: 15 PASS in8.76s, 3 file.
- CI prodotto `e9555c3ec51ffda8dc5a293c85a8eea50bd57a3e`: tutti i sette required
  SUCCESS, più golden path advisory e marketing. Run40246398330,
  contract40246398410. Il verde non si trasferisce automaticamente alla prossima head.
- Browser reale: creazione Taylor/date/offerta dalla UI e contesa HTTP10+2 PASS;
  percorso complessivo ancora FAIL sul selettore del modulo presenze. I primi due
  run si fermavano su avviso/editor smontati dal normale reload; corretto il runner
  a risposta200+stato persistito e visibile. Il terzo usa getByLabel exact sul select,
  mentre il test canonico usa getByRole(combobox): allineato il runner, senza editare
  il prodotto. Prova visuale/export/revoca ancora da completare nella coda host.
  Browser plugin assente; usa Playwright già nel repository.

## Riproduzione privata

Usare un database sintetico nuovo con `bin/study-demo/seed.py`. Avviare la Study
API e il client Web sullo stesso origin tramite proxy `/study`, con porte dedicate.
Eseguire il runner con `ARDESIA_WEB_URL=http://127.0.0.1:PORT`,
`ARDESIA_DEMO_ACCESS=/percorso/privato/demo-access.json` e
`ARDESIA_QA_OUTPUT=/percorso/evidenze`.

Il runner crea una nuova edizione Taylor dalla UI, configura le quattro date e
conferma l’offerta. Il carico sintetico 10+2 viene costruito tramite HTTP Core
reale, poi presenze e dichiarazione manuale passano dalla UI. Prova CSV/ICS,
tastiera, 1440/390px, reload, isolamento e revoca. Non invoca notifiche/pagamenti.
I token e il database sintetico restano fuori Git; non pubblicare il file accessi.

## Riuso e diritti

Scelta: estendere i consumer Core già maturi, senza introdurre un ERP o estrarre
software proprietario. React19.2.6/MIT e Playwright1.60.0/Apache-2.0 sono già
pinnati nel lockfile; metadata e licenze sono stati letti nell’installazione
esistente. Fonti ufficiali: https://react.dev/ e https://playwright.dev/.
Nessun asset donor, nuova dipendenza o nuova licenza. Intl/Blob sono API native.
Teachworks/TutorCruncher/Moodle restano candidati di benchmark, non sorgenti copiate
o valutazioni funzionali dichiarate eseguite. REA non usato: Core/API/test locali
sufficienti; nessuna capacità REA corrente o risparmio quantitativo inventato.
Manutenzione: riutilizzare validatori e contratti dei registri; rollback rimuove
il solo mount e il namespace, senza migrazioni né perdita di dati.

## Limiti e tre prossimi batch

1. Pricing da configurazione: registry/validazione S10 e successiva delega
   EditionManager. Oggi i prezzi restano3900/4900 canonici: nessuna UI per importi
   che il Core rifiuta. Prova discriminante: prezzo aggiunto da configurazione e
   negativo sul prezzo non consentito, conservando le offerte storiche.
2. Rinvio/cancellazione/recupero e ritiro dall’attesa: serve contratto S10 per
   riconferma e audit. Il comando corrente rifiuta modifiche con iscritti/riserve,
   preservando le presenze; non è implementato un rinvio completo. Verificare
   gare, idempotenza, vecchie ricevute e autorizzazioni media dello stesso iscritto.
3. Disponibilità persistita, annotazioni amministrative generiche e report
   complessivi coerenti: definire semantica/retention con S10/S11. Oggi disponibilità
   non significa agenda completa dell’host e l’export incassi è per pagina.

Merge/deployment: non eseguiti a questo checkpoint. Nessuna certificazione del
backend remoto, pagamento verificato, approvazione scientifica o rilascio pubblico.
L’implementazione non dichiara completato il mandato gestionale esteso.
