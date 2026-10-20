# 13. Diario degli errori — memoria personale attiva, non archivio di quiz sbagliati

## Scopo e priorità
**P0 per G0.** Ogni studente dispone di un **Diario degli errori** permanente in `Il mio lavoro`, indipendente dall'edizione del corso. Le osservazioni alimentano sia la propria ripresa sia la preparazione delle prossime lezioni del mini-corso. Il diario non è una classifica, non rappresenta una diagnosi della persona e non si riduce al conteggio di crocette errate.

**Differenziazione da verificare:** Passify dichiara già un quaderno degli errori che ripropone quesiti fino alla padronanza; non rivendicare l'invenzione del quaderno. Ardesia collega *l'errore su un passaggio preciso* alla fonte (foto/audio/PDF/lavagna), a una correzione verificabile, a una nuova prova diversa e alla spiegazione del docente nella lezione successiva. La stessa evidenza resta visibile e utile quando lo studente cambia micro-corso.

## Un errore non è un voto né un risultato di OCR
Distinguere rigorosamente:
- **Osservazione (`ErrorObservation`):** evidenza puntuale su una versione di tentativo, posizione/segmento, tipologia proposta e chi l'ha osservata. Un modello può proporla; solo l'attore responsabile può confermare secondo la policy.
- **Nucleo del diario (`ErrorThread`):** aggregazione stabile *per studente* di osservazioni coerenti su un concetto o comportamento, con eventi di apertura, pratica, verifica, ricomparsa, contestazione e archivio. Non creare un nuovo nucleo per ogni tentativo né fondere errori diversi solo perché condividono una parola.
- **Rubrica e spiegazione (`FeedbackRevision`):** commento versionato e ancorato alla risorsa corretta; stato `PROPOSED_AI` ≠ `CHECKED_IN_SCOPE` ≠ `REVIEWED_BY_TUTOR`.
- **Prova di trasferimento (`TransferAttempt`):** *nuovo* esercizio con parametri/contesto sufficientemente diversi; la risposta corretta al quiz originale o un clic su «Capito» non dimostrano risoluzione.
- **Vista (`DiaryProjection`):** sintesi ricostruibile dalla sequenza canonica di eventi, non seconda base di verità accanto a LessonOS. Indici e proiezioni possono essere rigenerati e invalidati.

## Tipologie iniziali, modificabili
`misconception`, `model_selection`, `procedure`, `algebra`, `sign`, `units`, `arithmetic`, `reading_or_transcription`, `ambiguous_question`, `other`. La tipologia è una proposta pratica per filtrare esercizi e interventi, non una classificazione clinica né una proprietà permanente della persona. Consentire rettifica, fusione e separazione dei nuclei **con provenance degli eventi**.

## Stati del nucleo e transizioni
- `CANDIDATE`: osservazione proposta non convalidata; non entra negli indicatori di difficoltà confermate.
- `OPEN`: osservazione confermata da rubrica verificabile o tutor; mostra un prossimo passo concreto.
- `PRACTISING`: almeno un nuovo tentativo pertinente, ma nessuna verifica ancora sufficiente.
- `VERIFIED_RESOLVED`: esiste una nuova prova di trasferimento revisionata/controllata in un perimetro dichiarato che soddisfa la rubrica; indicare chi e che cosa ne attesta l'esito. Non equivale a padronanza permanente.
- `RECURRED`: nuovo evento di errore confermato successivo alla verifica, con evidenza distinta; il thread riapre la pratica.
- `DISMISSED`: falso positivo, domanda difettosa, OCR/ASR errato, osservazione non pertinente o annullamento motivato. Non cancellare silenziosamente la rettifica.

**Regole:** l'AI non può promuovere a `VERIFIED_RESOLVED` da sola; una singola risposta fortunata non basta senza procedura o variazione idonea. Un elemento `ambiguous_question` resta sottoposto a verifica della fonte prima di penalizzare lo studente. Una correzione pubblicata su revisione superata diventa `STALE`. Non usare un punteggio «mastery 92%» senza calibrazione e prova.

## UI dello studente — un diario utile in 20 secondi
Percorso: `Oggi → Rivedi un passaggio` oppure `Il mio lavoro → Diario degli errori`.
Ogni scheda mostra soltanto cinque cose, con linguaggio non punitivo:
1. **Dove mi sono fermato:** estratto leggibile del passaggio con accesso all'originale e alla versione;
2. **Perché non funzionava:** breve spiegazione / feedback approvato, oppure stato «da verificare»;
3. **Cosa provo adesso:** una nuova attività o domanda breve, non una lista infinita di quiz;
4. **Cosa è cambiato:** tentativi e verifica più recente;
5. **Stato:** da verificare, da riprovare, in pratica, verificato, ricomparso oppure archiviato.

Uno studente può contestare un errore, aggiungere una nota, scegliere un esercizio oppure richiedere una spiegazione. Nessun elenco pubblico di fallimenti. Il docente può configurare spiegazioni più concise o verbose, non manipolare arbitrariamente l'evidenza originaria.

## Regia docente e collegamento ai gruppi
In `Da correggere` compare il singolo elaborato. In `Gruppi → Prossima lezione` compare un riepilogo autorizzato: es. "4 su 9 hanno chiesto un chiarimento sulla conversione di cm² in m²" quando gli eventi supportano il conteggio. Le osservazioni AI non convalidate sono separate. Il tutor può aprire i casi individuali **soltanto per gli studenti assegnati**, scegliere un errore comune e crearne un esempio neutro *nuovo* per la lezione. Non copiare il compito personale nel materiale condiviso per impostazione predefinita. Anche il numero aggregato può reidentificare con gruppi piccoli: rispettare soglie e policy di visibilità.

Il diario propone moduli successivi soltanto quando coincidono **difficoltà osservata, disponibilità, programma e interesse espresso**. Una raccomandazione non è un'iscrizione né autorizza promozione invasiva.

## Contratti proposti (da riconciliare con il codice reale)
```ts
interface ErrorObservation {
  observationId: string;
  organizationId: string;
  studentId: string;                  // derivato dalla sessione autenticata, non fidato dal client
  conceptId: string;
  category: ErrorCategory;
  source: ResourceVersionRef;         // owner, hash, revisione e posizione/segmento validati
  attemptRevisionId: string;
  actorId: string;
  verification: 'PROPOSED_AI'|'CHECKED_IN_SCOPE'|'REVIEWED_BY_TUTOR';
  occurredAt: string;
}
interface DiaryThread {
  threadId: string;
  studentId: string;
  conceptId: string;
  status: 'CANDIDATE'|'OPEN'|'PRACTISING'|'VERIFIED_RESOLVED'|'RECURRED'|'DISMISSED';
  observationIds: string[];
  latestTransferAttemptId?: string;
  updatedAt: string;
}
```
I contratti sono un **design**, non la dichiarazione di tipi già implementati. Gli identificativi ricevuti devono essere risolti lato server e filtrati per tenant e proprietario prima di qualsiasi recupero.

Operazioni logiche da realizzare: `proposeError(actor, attemptRev, anchor, category)`, `confirmObservation(tutor, observationId, rubricRev, key)`, `attachTransferAttempt(actor, threadId, activityVersion, attemptRev, key)`, `verifyTransfer(tutorOrVerifier, threadId, attemptRev, evidence)`, `dismissObservation(authorizedActor, observationId, reason)`, `getMyDiary(actor, filters)`. L'API non accetta un `studentId` arbitrario dal browser per autorizzare le richieste.

## Memoria e cancellazione
- Usare gli eventi LessonOS già disponibili (`error.observed`, `exercise.completed`, ecc.) dove gli invarianti coincidono; introdurre eventi aggiuntivi **versionati** solo se necessari per prove e stati più ricchi, senza alterare il replay storico.
- Leggere `learningDebtProjection.ts` prima di implementare: supporta già il filtro individuale e le ricorrenze; differenziare `errore ripetuto` da `errore dimostrato superato` senza inventare un secondo ledger.
- Correzione della trascrizione non modifica la fonte binaria; revoca o nuova versione invalida le proiezioni collegate; cancellazione elimina accessibilità e indici dei dati personali, mantenendo solo gli eventuali metadati minimi consentiti.
- Stesso studente: corso Fisica → Analisi, medesimo diario personale; altro tutor vede solo ciò che la policy della nuova edizione autorizza, non tutta la cronologia.

## Prove automatiche obbligatorie
`tests/ERROR_JOURNAL_FIXTURES.json` contiene transizioni con attori sintetici. In applicazione i test devono attraversare **DB/API/RLS e browser**, non solo la funzione di proiezione. Coprire: proposta AI non confermata, conferma con fonte valida, prova diversa insufficiente, verifica con evidenza, ricomparsa, OCR errato contestato, stessa domanda ripetuta per errore, idempotenza degli eventi, revoca della fonte, accesso del compagno negato, trasferimento ad Analisi e degradazione con AI spenta. La card UI non usa percentuali inventate. Reviewer e tempi misurati.

## Ricerca REA collegata (R8)
**Passify**: studiare il quaderno errori dichiarato (risposta sbagliata che ritorna, risposta fortunata insufficiente), SENZA assimilare materiale proprietario. **Math Academy / RemNote**: studiare diagnosi, richiami e ripresa; **Gradescope / PrairieLearn / Numbas**: rubriche, feedback e tentativi. La missione R8 è **G0 obbligatoria**: scenario realmente analizzato su almeno una superficie esterna accessibile/licenziata, o alternativa della stessa famiglia, e confronto con la proiezione LessonOS. Nessuna attività di REA viene certificata dalla sola lettura della pagina commerciale.

Fonti: [Passify, Semestre Filtro](https://www.passify.it/semestre-filtro), [Ardesia learningDebtProjection.ts](https://github.com/AndreaMarro/ardesia/blob/main/apps/studio/src/lessonos/learningDebtProjection.ts), [Gradescope](https://www.gradescope.com/), [RemNote](https://www.remnote.com/), [Numbas](https://www.numbas.org.uk/).
