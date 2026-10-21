# [PRO-REGIA-INTEGRAZIONE] — esecuzione 21 ottobre 2026

## Decisione

**HOLD per la simulazione conforme MUR e per il lancio della piattaforma.**
La revisione ha riprodotto due classi di P1 nel verticale esame, una
incompatibilità P1 con il formato 2026/27 e un gate di pubblicazione mancante
nella nuova banca. Durante l'esecuzione è arrivata la PR #270: **4.000 quesiti
effettivamente ricevuti**, contati e validati strutturalmente. Consegna:
adattatore privato senza perdita, probe eseguibili, prove e quarantene di
integrazione. Nessuna modifica ai file posseduti dai worker. Nessun merge/deploy.

Il codice verificato è
`b9764d2e1785c26893f424ea547d2df081e0aca2`, PR #269; la banca è verificata
separatamente sullo SHA #270 riportato sotto. I test di regressione dei
finding sul prodotto restano RED; i test del nuovo adattatore sono PASS.
Le suite verdi preesistenti non sono una dimostrazione di correttezza dei casi
che non esercitavano.

## Rilevazione e confronto

| Riferimento | SHA rilevato | Stato rilevato | Differenza utile |
| --- | --- | --- | --- |
| main | `b124eee04acc8062c27284f23c5d9108e3767c27` | branch principale | Non contiene i verticali delle draft |
| #264 | `b41380e32dee962599dc0bc02ac7cd1d8342590f` | aperta, draft | 5 file; manifest sette unità dichiarato non collegato |
| #265 | `4117382b0a9bd4666e848d49d7ef6beaf5258741` | aperta, draft | 4 file; inventario legacy, non acquisizione runtime |
| #267 | `d0235e8a9dbbccd6808741a087dd0359908feb2b` | chiusa, non merged | Core/gestionale/diario e gate storici |
| #268 | `61e7f00be9fc4ecfdf5eb362275b3b8a566d92bf` | aperta, draft | Reader/quaderno/portabilità; 150 file rispetto al tip #267 |
| #269 | `b9764d2e1785c26893f424ea547d2df081e0aca2` | aperta, draft, base #268 | 19 file, 2 commit: pack31, motore, API, migrazione e UI esame |
| #270 | `e9c87b072913744f6cc6df21217b8856cddfef1f` | aperta, draft, base #268 | 86 file, 2 commit: banca 4.000, runtime di allenamento e UI |

La #266 è chiusa e non merged; il suo tip rilevato è
`cc0f37ba47c4a40bfaa67d0f19a6338f4c98a228`. #269 era la PR più recente
all'inizio della verifica. Gli otto check GitHub della #269 risultavano
SUCCESS: [run 39529756744](https://github.com/AndreaMarro/ardesia/actions/runs/39529756744).
Sono stati letti patch, commenti e dossier pertinenti; non è stato trovato un
finding non bot duplicato nei commenti #268/#269/#270. Nessun commento duplicato
pubblicato.

## STATO DEEPSEEK

**WAITING_FOR_HANDOFF.** GitHub è accessibile; il servizio remoto non ha
dispositivi connessi. Non è visibile la sessione OpenCode sul Mac. Nessun
handoff compilato collega commit, file posseduti e risultati a DeepSeek.
La presenza del medesimo account GitHub non prova l'autore operativo.

Sono state enumerate 298 branch distinte e consultati gli handoff nel repo e
quelli accessibili nella raccolta documentale. L'assenza di una consegna non
prova assenza di lavoro locale. Il prossimo handoff deve contenere repository,
branch, SHA, file posseduti, comandi e log, limiti, costo modello se noto.

Pro possiede esclusivamente i nuovi percorsi di questa consegna. Non modifica
`exam.py`, `Exam.tsx`, API, migrazioni, registry canonico, pack o branch dei
worker. La proprietà effettiva della feature rimane da attestare.

## STATO BANCA 4.000

**DELIVERY_RECEIVED_DRAFT.** La PR #270 è stata trovata nel secondo controllo
delle PR recenti, dopo l'inventario iniziale che non vedeva ancora il corpus.
Questo stato sostituisce il precedente `WAITING_FOR_HANDOFF` del produttore.
Il worker conserva la proprietà dei suoi file. Manifest SHA-256:
`15110c78e3b615eb4a3a50c8d33c179a6e35cd9495e2f6764b29cd9485850896`.

| Passaggio / evidenza | Conteggio verificato |
| --- | ---: |
| QUESTION_INBOX — ricevuti | 4.000 |
| SCHEMA_VALID — JSON Schema eseguito | 4.000 |
| Calcoli fisici indipendenti coerenti | 10, campione limitato |
| MATH_VALID completo | Non attestato per il corpus |
| SCIENCE_REVIEWED con approvazione umana | 0 |
| EDITORIALLY_APPROVED | 0 |
| IMPORTED tramite pipeline canonica approvata | 0 |
| PUBLISHED con approvazione verificata | 0 |

Verificati 27 shard e hash, 4.000 ID/revisioni distinti, esattamente
1.000 base/1.000 facili/1.000 medi/1.000 difficili; 2.537 MCQ a cinque opzioni
e 1.463 completamenti. U1–U7: 160, 928, 800, 272, 672, 800, 368. Il perimetro
dichiarato è 3.821 core e 179 estensioni con legge fornita. Queste etichette non
certificano da sole la profondità della copertura.

Rieseguito il validator del produttore senza modificare gli assert, deviando
soltanto l'output fuori dal worktree: schema, proiezione e round trip
chiave/correzione su 4.000 record, zero errori; dieci simulazioni controllate.
La chiave del produttore inviata al suo grader non è una verifica fisica
indipendente. Verificati separatamente dieci calcoli e 1.138 set di opzioni
razionali, senza equivalenze spurie nei set controllati. Zero duplicati esatti,
normalizzati o di firma; unicità semantica e difficoltà restano da accertare.

Tutti i record sono DRAFT, reviewer nullo, revisione umana NOT_RUN. Per 1.653
record `exact_sympy` è dichiarato ma `automaticChecks` è vuoto: ciò non prova
un errore, ma non attesta il controllo individuale completo. I 4.000 sono
inclusi nei file/runtime della draft PR; questo è distinto da importazione
canonica e pubblicazione di contenuti approvati. Il test P1 sottostante
riproduce l'accessibilità dei DRAFT nel backend sintetico, non un deploy in
produzione.

L'adattatore privato di ingresso conserva ogni campo e verifica i byte contro
il commit dichiarato: **4.000 round trip senza perdita e cinque test PASS**.
Non scrive un secondo corpus/database e non espone la sua copia privata a uno
studente. Dettagli in `bank/BANK-REVIEW.md`, ricevute e probe portabili.
Un ulteriore HOLD di integrazione riguarda `u5-temperature-difference-13`,
revisione 1: il testo esclude e poi richiede rapporti fra temperature Celsius.
Identità/hash sono in `bank/quarantine.json`; nessuna correzione silenziosa.

Separatamente, il pack demo `fisica-semestre-filtro-v1`, versione 1, contiene
31 ID distinti, 21 MCQ e 10 completamenti. È accettato dallo schema attuale,
ma tutte le MCQ hanno quattro alternative. Mancano i campi richiesti per la
banca estesa, tra cui unità/microarea/competenza/difficoltà e revisione del
singolo quesito. Questo demo non viene conteggiato nei 4.000.

Letti tutti i 31 quesiti. Il probe indipendente ha verificato 23 calcoli,
rapporti o bilanci coerenti con la chiave **sotto le ipotesi dichiarate nel
report**. Gli altri otto sono concettuali e non hanno un calcolo indipendente
di risposta. Zero approvazioni scientifiche umane, zero transizioni della
pipeline, zero import/pubblicazioni eseguiti.

Sei HOLD sono registrati in `quarantine.json`: `fis-elettro-11`,
`fis-elettro-13`, `fis-onde-17`, `fis-comp-22`, `fis-comp-23`, `fis-comp-29`.
I due completamenti 22 e 29 hanno errori sulle unità; gli altri quattro
richiedono revisione delle ipotesi o dei casi limite. Il contratto non possiede
una revisione per domanda: si usano versione pack, hash pack e hash quesito,
con `questionRevision: null`. Nessuna rimozione dal database è dichiarata.

Le spiegazioni misurate hanno 10–46 parole, mediana 27: lettura e struttura
indicano feedback da demo, non ancora la trattazione completa richiesta.
`fis-mod-21` e `fis-comp-28` ripetono il caso di tre emivite con risposta 1/8.
È una vicinanza concettuale osservata, non un esito di deduplicazione del
corpus da 4.000. Dettaglio individuale in `SCIENCE-REVIEW.md` e
`science-report.json`.

## Normativa 2026/27

Fonti riverificate:

- [DD 249 del 13 luglio 2026](https://www.mur.gov.it/sites/default/files/2026-07/Decreto%20Direttoriale%20n.%20249%20del%2013-7-2026.pdf): 31 quesiti, 21 MCQ/10 completamenti, 50 minuti; appelli 10 dicembre 2026 e 11 gennaio 2027.
- [Allegato 2 DM 941/2026](https://www.mur.gov.it/sites/default/files/2026-07/All.%202%20al%20D.M.%2010-07-2026%20n.%20941.pdf), punto 4: cinque opzioni per MCQ, una corretta.
- [Syllabus Fisica 2026](https://www.mur.gov.it/sites/default/files/2026-06/Syllabus_FISICA_%20finale%202026.pdf): sette unità, 6 CFU.
- [Guida didattica UniBo 2026/27](https://www.unibo.it/it/studiare/insegnamenti-competenze-trasversali-moocs/insegnamenti/insegnamento/2026/568079), che richiama DM 941 e DD 249: +1 corretta, -0,1 errata, 0 omessa e cinque alternative.

Il PDF dell'Allegato 2 è stato letto correttamente nel primo recupero; un
recupero successivo ha restituito 403. Non è stato sostituito con norme 2025/26.
La grazia di 10 secondi del motore è una scelta applicativa documentata, non
una norma MUR. L'assenza di calcolatrice rimane anche un vincolo didattico
espresso dall'utente; non si attribuisce a un articolo non verificato.

## BUG MATERIALI / incompatibilità

### REGIA-20261021-01 — P1: grading di unità, scala e notazione

Fonte: `packages/engine/lessonos/study/exam.py`, righe 137–162, sullo SHA
esaminato; contenuti `fis-comp-22` e `fis-comp-29` del pack versione 1.

| Input | Esito eseguito | Esito richiesto |
| --- | --- | --- |
| `10 m/s^2` per velocità | corretta, +10 decimi | errata |
| `10 m/s banana` | corretta, +10 | errata |
| `20000 kPa` per 20.000 Pa | corretta, +10 | errata |
| `20.0 kPa` | errata, -1 | corretta |
| `2 × 10^4 Pa` | errata, -1 | corretta |

Causa riprodotta: `remainder.startswith(unit)` accetta suffissi non equivalenti;
gli alias non hanno scale di conversione; la sostituzione della notazione
scientifica conserva uno spazio che spezza il token numerico. Il pack ammette
anche `m/s⁻¹`, dimensione m·s, ed elenca `kpa` senza un fattore di scala.

**RED:** cinque assert falliscono nel motore reale. Controlli `10 m/s`,
`20000 Pa`, `20 kPa` passano. **Correzione applicata: nessuna. GREEN: NOT_RUN.**
La correzione richiede unità complete, conversioni esplicite e normalizzazione
coerente; le rettifiche del contenuto richiedono nuova versione e revisione
umana, conservando gli snapshot storici. Eliminare il solo `startswith` non
risolve tutti i casi. Blocca scoring e validazione dei completamenti.

### REGIA-20261021-02 — P1: autosalvataggio fuori ordine

Fonti: `apps/web/src/features/Exam.tsx`, righe 235–253;
`packages/engine/lessonos/study/exam.py`, righe 373–395.

Riproduzione: scelta 0, primo PUT trattenuto; scelta 1, secondo PUT committato;
rilascio del primo PUT. UI con scelta 1 e «Risposte salvate», ma GET restituisce
0 e la riapertura mostra 0. Ordine di completamento osservato `[1, 0]`.

La UI avvia più PUT dell'intera mappa e marca salvato ogni ACK; il server
sostituisce la mappa senza revisione attesa. Test con componente originale,
React/jsdom, FastAPI reale e SQLite temporaneo; solo il trasporto è riordinato.
Nessun backend simulato e nessun dato reale di studenti.

**RED:** un test fallisce, atteso 1/ricevuto 0. **Correzione applicata: nessuna.
GREEN: NOT_RUN.** Servono contratto di revisione nel Core/API e gestione UI di
invii/ACK coerente con la revisione corrente. La sola serializzazione UI non
protegge due schede concorrenti. Blocca salvataggio/riapertura affidabili.

L'ACK tardivo di una sessione diversa, due schede e concorrenza PostgreSQL non
sono stati eseguiti: restano criteri del prossimo intervento, non altri bug
già dimostrati.

### REGIA-20261021-03 — P1: formato MCQ non conforme al target

`exam.py`, righe 70–73, impone quattro alternative; tutte le 21 MCQ del pack
ne hanno quattro. Il test dedicato confronta il requisito 2026/27 delle cinque
alternative. **RED: riprodotto. Correzione: non applicata. GREEN: NOT_RUN.**
Il demo si dichiara non ufficiale, ma questo non soddisfa il gate della
simulazione conforme richiesto dall'utente. Non aggiungere un quinto distrattore
automatico ai quesiti senza revisione scientifica/editoriale.

### REGIA-20261021-04 — P1: DRAFT accessibili allo studente

SHA #270 `e9c87b072913744f6cc6df21217b8856cddfef1f`. Fonti:
`catalog.py:35–37`, `question_bank.py:257,490–495` e route della banca.
Il catalogo associa la banca alle edizioni Fisica; il loader richiede DRAFT e
reviewer nullo; la route verifica appartenenza ma non approvazione.

**RED reale:** studente sintetico membro, HTTP 200, totale 4.000 e quesiti
`u1-area-conversion-01/02`, versione 1, DRAFT senza approvazione. API FastAPI
via ASGI e SQLite reali, banca effettiva, nessun mock di risposte o record.
**Correzione applicata: nessuna. GREEN del gate: NOT_RUN.** È un'incompatibilità
riprodotta con la pipeline richiesta; non è un bypass di isolamento. Anonimo
401, studente esterno 403 e SHA obsoleto 409 passano nel probe.

Serve separare revisione privata autorizzata e contenuto servibile allo
studente, con approvazioni legate a ID/revisione/hash. Cambiare soltanto
l'etichetta DRAFT non basta. Il backend provato è sintetico: lo stato della
produzione non è attestato. Le fixture positive del futuro test devono usare
approvazioni sintetiche esplicite; un errore di setup non è un GREEN.

### Contratti #269 / #270 e conservazione dei contenuti

Il solo file sovrapposto è `study_api/app.py`: confronto a tre vie fuori
checkout senza conflitti e parsing Python PASS. Nessun merge applicato;
suite e migrazioni dell'unione NOT_RUN. Un quesito reale #270 adattato
preservando tutte le opzioni viene rifiutato dal validatore #269 con
`exam_mcq_invalid`/409. Inoltre **709 soluzioni superano 4.000 caratteri**,
con massimo 7.428. Non eliminare metadati, opzione E, frazioni esatte o passaggi
per forzare l'ingresso nel contratto Exam v1.

Il runtime banca genera pratica stateless; una risposta vuota a `/attempts`
restituisce subito spiegazione con `persisted:false`. È il comportamento
dichiarato dell'allenamento, non una simulazione con consegna persistente.
Occorre un contratto versionato nel Core prima di usarlo nell'esame #269.
L'adattatore d'ingresso conserva il dato, ma non rivendica quel collegamento.

## Verifiche effettivamente eseguite

| Verifica di questa esecuzione | Esito | Perimetro |
| --- | --- | --- |
| Engine `tests/study` | 436 PASS, 18 SKIP; exit 0 | Core/SQLite; i salti non sono PASS PostgreSQL |
| API `tests/test_exam_http.py` | 3 PASS; exit 0 | FastAPI TestClient con Core/SQLite sintetico |
| Probe contratti/grading/lifecycle | 8 test: 2 PASS, 6 FAIL; exit 1 | Include nuovo test cinque opzioni |
| Probe UI autosave | 1 FAIL; exit 1 | React/jsdom + HTTP reale + SQLite |
| Calcoli scientifici separati | 23 confronti coerenti; exit 0 | 31 letti, ipotesi esplicitate, nessuna approvazione |
| Validator banca #270 | 4.000 record, zero errori, exit 0 | Schema/proiezione/chiave; non 4.000 verifiche fisiche indipendenti |
| Probe API banca #270 | 3 test: 2 PASS, 1 FAIL | FAIL gate DRAFT; controlli accesso/versione e alias PASS |
| Campione indipendente banca | 10 calcoli coerenti | Più 1.138 set di opzioni razionali |
| Adattatore privato di ingresso | 4.000 round trip, 5 test PASS | Nessuna importazione/pubblicazione |

Il primo tentativo dell'intera suite API nel sandbox è stato interrotto con
exit 130 senza risultati: non è un PASS. La successiva esecuzione mirata con
permesso loopback ha completato i tre test indicati. La suite API completa non
viene dichiarata rieseguita.

Il controllo SQLite indipendente conferma, nello scenario provato: nessuna
soluzione prima della consegna, accesso del peer negato, retry senza seconda
ricevuta, risultato e timestamp invariati, riapertura dello snapshot anche
quando la sorgente corrente è indisponibile. Non certifica migrazioni di
versione arbitrarie o concorrenza PostgreSQL.

La lettura della migrazione esame non sostiene il sospetto di accesso diretto
PostgREST da `authenticated`: i privilegi sono revocati e concessi soltanto al
ruolo applicativo. Nessun bug RLS non riprodotto viene dichiarato.

## STATO REA e recupero

**REA_NOT_ACCESSIBLE** in questa esecuzione: nessun server/tool REA esposto e
nessun dispositivo remoto connesso. Nessuna acquisizione REA inventata.

Il dossier #268 documenta precedenti osservazioni con REA 6.7.0 di MathLive,
PDF.js e AFFiNE. Sono evidenze storiche lette, non chiamate ripetute ora.
PDF.js 6.4.299 e il reader, il quaderno canonico e l'export/inspect portabile
sono presenti nel codice. La suite Core eseguita comprende quaderno e
portabilità; il ciclo browser completo e l'equivalenza dei donor non vengono
nuovamente certificati. Il dossier notebook-portable riporta anche un gate
Studio fallito; la CI successiva verde non vale come ripetizione di quel gate.

Undici repository storici sono stati letti via GitHub, con SHA, licenza,
candidati e limiti in `donor-summary.json`. Non sono stati eseguiti i runtime
dei donor. LessonOS e ardesia-studio contengono già rispettivamente 228 e 68
blob non vuoti identici alla #268: non vanno ricreati o ricontati come nuova
acquisizione. DM418Reasoning usa il vecchio schema 15+16/45 minuti e rinumera
ID; StressTest conserva scoring e tolleranze incompatibili con il target.
`numeria-lab` contiene un candidato FSRS, da collegare a LessonOS solo dopo
verifica di diritti, persistenza e test.

Le metadata GitHub non identificano una licenza per gli undici repository e
non è stato trovato un LICENSE alla radice; la dichiarazione MIT nel package
di DM418 non viene estesa automaticamente a ogni contenuto. Nessun codice di
donor privato viene copiato in questa consegna e nessuna stima di risparmio è
attribuita senza misura.

**NESSUN NUOVO SOTTOSISTEMA COMPLETO ACQUISITO.**

## Mini-corsi: riuso e gap concreto

Il manifest `packs/semestre-filtro-2026-27/physics.coursepack.json` della #264
elenca le sette unità e il profilo di simulazione, ma dichiara
`DRAFT_NOT_WIRED_NOT_CERTIFIED`. Il registry reale
`packages/engine/lessonos/study/catalog.py` contiene `relazioni-fluidi-v1` e
`taylor-exp-v1`: non otto mini-corsi di Fisica pronti.

Il primo percorso Fisica offre 24 esercizi, quattro modelli (Poiseuille,
geometria/unità, idrostatica, galleggiamento) e due prove di trasferimento da
tre quesiti. Sono bozze con reviewer nullo; mancano pretest/post-test distinti
e percorsi completi per tutte le unità. Non rinominare le prove di trasferimento
per fingere la presenza di pre/post-test.

Riusare `editions.py`, `groups.py`, calendario, CoursePack bindings, submissions,
feedback e diary. Sono presenti quattro date da 90 minuti, capienza massima
dieci, prenotazioni e attesa, calendario canonico/ICS. L'integrazione Google è
`NOT_CONFIGURED`; il MockCalendar non è sincronizzazione reale.
`Classroom.tsx` collega attualmente la consegna normale a due attività, non a
tutti gli ID degli esercizi. Il pack esame non è ancora il percorso didattico
di quattro incontri su simulazione e strategia.

La #270 preserva i JSON/SHA dei CoursePack e aggiunge `questionBankIds` al
descrittore Fisica. `sf-u1`…`sf-u7` e `sf-fisica-simulazioni` sono filtri della
banca, non otto corsi registrati né 32 incontri pronti.

39/49 euro e minimo sei restano ipotesi; nessuna offerta, iscrizione reale,
comunicazione, pagamento o ricavo è stato creato. Il corso svolto dal docente
e il lancio commerciale della piattaforma hanno gate distinti.

## Gate di questa esecuzione

| Gate | Stato | Motivo |
| --- | --- | --- |
| Ricezione/integrità/schema corpus 4.000 | PASS | 27 shard, 4.000 record e JSON Schema verificati |
| Matematica/originalità semantica complete | BLOCKED | Solo campione indipendente; nessuna approvazione |
| Banca: gate pubblicazione | FAIL | Studente membro riceve DRAFT non approvati |
| Banca → esame persistente | BLOCKED | Contratti incompatibili, bridge runtime assente |
| Struttura demo secondo schema attuale | PASS | 31 ID, 21+10; non correttezza scientifica |
| Simulazione formato MUR | FAIL | Quattro alternative anziché cinque |
| Grading completamenti | FAIL | Cinque controesempi eseguiti |
| Salvataggio/riapertura esame | FAIL | Autosave perde la risposta più recente |
| Privacy/retry/snapshot, caso SQLite | PASS | Solo scenario sintetico riprodotto |
| Revisione scientifica umana/editoriale | BLOCKED | Nessuna firma; HOLD registrati per pack31 e banca |
| Corsi: tutor, 10 sintetici, 2 in attesa, calendario, area privata end-to-end | NOT_RUN | Componenti presenti; viaggio completo non eseguito |
| Acquisizione REA in questa esecuzione | BLOCKED | REA_NOT_ACCESSIBLE |
| PostgreSQL/Auth/RLS/Storage/restore reali | NOT_RUN | Nessun ambiente collegato per il collaudo |
| UI 390/820/1440, tastiera, zoom, movimento ridotto | NOT_RUN | jsdom non certifica browser/layout/accessibilità |
| G0/G1 complessivi | BLOCKED | P1 aperti, contenuti e collaudi mancanti |
| G2 corso reale iniziato | NOT_RUN | Nessuna evidenza di corso avviato |

## Azione eseguita e prossima proprietà

Consegna isolata su `codex/ardesia-pro-regia-20261021`, basata sul tip #269:
adattatore privato senza perdita, probe portabili, log RED, ricevute con hash,
verifica tecnica integrale della banca, campione scientifico, revisione del
pack31, HOLD e inventario donor. Un difetto del nuovo adattatore è stato
riprodotto su fixture: byte locali non committati potevano essere attribuiti a
HEAD. Corretto verificando manifest e shard contro i blob del commit; prova
GREEN e round trip sui 4.000 reali ripetuto con successo. Nessuna modifica
runtime o contenuto dei worker;
nessun merge in main, deploy, spesa, messaggio agli studenti o dato reale.

La consegna è pubblicata nella [draft PR #271](https://github.com/AndreaMarro/ardesia/pull/271), primo commit `bf205d2dff093a1b75e9da7c5c80980706ab0e33`: 48 file confrontati byte per byte con GitHub, zero file dei worker modificati. Il primo gate hygiene ha rilevato solo spazi finali/righe vuote alla fine di tre log. La successiva normalizzazione di presentazione conserva gli originali in quel commit e gli hash prima/dopo in `cycle-state.json`; assert ed esiti dei test sono invariati. Nessuna policy CI indebolita. Attivato il ciclo giornaliero di regia dal 22 ottobre al mattino, Europe/Rome; i tre audit orari esistenti restano invariati.

**Unica priorità successiva:** DeepSeek, con handoff esplicito dei file del
produttore #270, deve introdurre il gate Core/API che impedisce di erogare agli
studenti quesiti privi di approvazione scientifica/editoriale autorizzata.
Pro resta reviewer indipendente. Test di conclusione: DRAFT negato/escluso per
lo studente, revisione privata autorizzata al tutor, servizio consentito solo
alla fixture sintetica con evidenza di approvazione della revisione esatta.
Nessuna delle 4.000 approvazioni può essere inventata dal test.
