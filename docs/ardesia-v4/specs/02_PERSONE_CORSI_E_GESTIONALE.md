# 2. Persone, mini-corsi e area individuale

## Modello canonico
`Organization` delimita una scuola/tutor indipendente. `User` identifica la persona. `Membership` assegna ruoli in un’organizzazione, non globalmente. Una persona può insegnare in un contesto ed essere studentessa in un altro. Un amministratore commerciale non riceve automaticamente accesso ai compiti e alle note didattiche.

`CourseTemplate` è il modulo riutilizzabile. `CourseEdition` è il gruppo con docente, prezzo, capienza e calendario. `Session` è uno dei quattro incontri. `Enrollment` è il diritto individuale a partecipare. `Assignment` è l’attività assegnata. `SubmissionRevision` è una fotografia immutabile di ciò che viene consegnato. `FeedbackRevision` risponde a quella fotografia. `ResourceVersion` conserva le fonti. I prezzi e lo stato commerciale non appartengono al CoursePack scientifico.

## Tre ambienti, quattro visibilità
1. **Area personale:** home con prossima azione, miei corsi, quaderno, compiti e correzioni, materiali accessibili, progressi osservati, impostazioni. Conserva collegamenti fra corsi senza cedere a ogni docente tutta la storia dello studente.
2. **Aula del corso:** programma, quattro date, link live, biblioteca, attività condivisa, domande del gruppo e materiali pubblicati esplicitamente dal tutor.
3. **Regia del docente:** gruppi, persone, lista delle consegne, rubriche, appuntamenti, presenze, condizioni economiche, lavoro da fare e metriche del proprio business.

Ogni risorsa porta una policy: `learner_private`, `submitted_to_assigned_tutor`, `cohort_shared` oppure `teacher_private`. Una bozza personale è dello studente; il tutor vede solo quanto consegnato o condiviso. I materiali del tutor pubblicati alla classe sono di norma sola lettura. Il feedback alla persona non va pubblicato al gruppo. Un esempio può diventare condiviso solo attraverso una nuova proiezione redatta/autorizzata, con revisione delle informazioni sensibili.

Il riferimento organizzativo è OneNote Class Notebook (biblioteca, collaborazione, notebook individuale). Non si copia il programma Microsoft: si riusa il principio e lo si integra con gruppi, laboratori e LessonOS. Fonte: classnotebook in SOURCES.

## Vita dell’edizione
`DRAFT → COLLECTING_INTEREST → OFFERED → CONFIRMED → RUNNING → COMPLETED`.
Rami separati: `CANCELLED`, `RESCHEDULE_PROPOSED`. Un gruppo non diventa CONFIRMED perché sono arrivati 6 clic. I partecipanti devono avere accettato le quattro date e la condizione economica prevista.

La prima offerta di test: 4 incontri × 90 minuti, €49 per persona, massimo 10; 6 paganti come soglia proposta del primo gruppo, configurabile dal tutor prima della vendita. Formato alternativo successivo: 3×90 minuti a €39. Non promettere né sconti permanenti né supporto umano illimitato. Il servizio incluso deve precisare consegne revisionate, modalità di aiuto e durata dell’accesso attivo.

## Abbinamento senza frammentazione
Un modulo d’ingresso chiede materia, microargomento, obiettivo/prova, data limite e finestre orarie. La diagnosi utilizza pochi problemi o un elaborato reale: non un esame d’ingresso lungo. L’AI può classificare la richiesta testuale; le condizioni rigide sono controllate da regole.

Condizioni rigide: accesso consentito, prerequisiti necessari, stesso obiettivo didattico, calendario disponibile per tutte le sessioni, capacità del tutor e posti. Preferenze: ritmo, tipo di esercizi e urgenza. Il sistema mostra al tutor perché propone una combinazione. Le raccomandazioni non inviano automaticamente inviti né fanno diagnosi psicologiche.

Partire con 2–3 finestre definite per i moduli promossi; raccogliere richieste per il resto. Sei studenti su sei orari incompatibili non sono un gruppo. La lista attesa conserva l’interesse quando il gruppo cambia edizione, ma nessuno viene iscritto/pagato senza accettazione.

## Capienza e pagamenti
Stati individuali: `INTERESTED`, `OFFER_SENT`, `HOLD`, `PAYMENT_PENDING`, `ENROLLED`, `WAITLISTED`, `WITHDRAWN`, `REFUND_PENDING`, `REFUNDED`.

Una prenotazione HOLD ha scadenza configurata e applicata dall’orologio del database. Conferma, scadenza e pagamento concorrenti operano su transazione con lock della riga di edizione o equivalente prova serializzabile. Il conteggio dei posti deriva da record canonici, non da contatori aggiornati dal browser. Idempotency key unica per comando e provider event ID unico per pagamento. Pagamento ricevuto dopo scadenza senza posto → riconciliazione/rimborso, mai undicesima iscrizione.

M1/G0 utilizza adapter pagamenti simulato; per G1 è ammessa registrazione manuale verificabile con autore, data e riferimento esterno. Nessun operatore può modificare ricevute già concluse senza evento di rettifica. Il ledger commerciale non è una promessa di fatturazione fiscale completa.

## Scheda studente del tutor
Mostra solo gli ambiti assegnati: corsi, presenze, consegne aperte, difficoltà osservate con evidenza, feedback, prossima azione. Filtri per corso e argomento; nessun punteggio opaco di «bravura». Un altro tutor non eredita automaticamente il profilo. L’area personale dello studente può aggregare i propri corsi, ma il trasferimento di materiale fra organizzazioni richiede una decisione esplicita e diritti compatibili.

## Riduzione del carico docente
Inbox unica con `nuovo / proposta pronta / richiede chiarimento / revisionato / restituito`. Foto e proposta sono affiancate; il tutor approva o modifica una rubrica e seleziona i passaggi pertinenti. Azioni batch solo su attività compatibili e con anteprima per ciascun elaborato. Il sistema misura tempo di revisione, non soltanto risposte AI al minuto.

Fine corso: report personale breve, prova su problema nuovo, accesso ai materiali secondo offerta, proposta motivata del modulo successivo. Non bloccare il materiale già acquistato per costringere il rinnovo. Conservazione e scadenza dell’assistenza sono politiche diverse.

## Addendum V4 — diario e abbinamento
La sezione personale contiene `Il mio lavoro → Diario degli errori` e in `Oggi` soltanto i prossimi 1–3 interventi più utili, con possibilità di aprire l'originale. Gli errori AI proposti non equivalgono a errori confermati. Il tutor ha un pannello per pattern ricorrenti del gruppo e casi individuali autorizzati; una classifica pubblica degli errori degli studenti è vietata. Per proporre un nuovo modulo usare difficoltà effettivamente osservata + programma + compatibilità oraria + consenso/interesse, non sorveglianza o incentivo psicologico a comprare.

**R8** studia, ove accessibile, il quaderno di Passify e altre controparti; il quaderno come feature non è originale in sé. Distinguersi su passaggio preciso, foto/audio/versione, feedback tutor e prova di trasferimento verificabile.
