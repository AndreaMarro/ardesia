# Chiusura review R-03 — 21 settembre 2026

**REQUEST_CHANGES**, limitato alla patch R-03. Il revisore indipendente ha
riprodotto un'omissione silenziosa nel download quando IndexedDB non è disponibile.
I precedenti test verdi restano validi per i casi coperti, ma non coprono questa
condizione. La patch non è accettata per integrazione.

## Identità e finding

- Base: `c54fa42c1bb34ac37374a5bb228d838b2b4409ec`.
- Candidate prodotto: `ba9c3bdfe1b3218273dcf286e3c56723d204b707`.
- HEAD documentale prima della review: `8e4783fd3eb132baf84b0f6ce1baaf09455890de`;
  dopo candidate erano stati aggiunti soltanto checkpoint e probe browser.
- Coordinatore/builder: `/Users/andreamarro/VOLUME 3/ardesia-codex-restart-20260921`,
  branch `codex/restart-review-postlesson-20260921`.
- Reviewer: `/root/r03_independent_review`, contesto nuovo (`fork_turns=none`),
  checkout separato `/Users/andreamarro/VOLUME 3/ardesia-codex-r03-review-20260921`.
  Routing richiesto `gpt-5.6-terra/high`; modello/effort effettivi non esposti,
  `inherited/unknown`. Il coordinatore non aggiunge una self-approval.

Il [verdetto originale](reviewer-original/reviewer.md) classifica il finding P1:
RecapView passa all'exporter il risultato di createEventLogStore. Quando manca
IndexedDB, la factory restituisce un nuovo log temporaneo vuoto. L'exporter lo
interpreta come memoria corrente autorevole vuota e omette lo snapshot salvato.
Il pulsante completa il download senza alert; il solo manifest contiene un
avviso. Un backend non disponibile non dimostra che il log persistente sia vuoto.
Il finding riguarda il contenuto del download: lo snapshot nel workspace non
viene cancellato da questa operazione.

Il fallback della factory è preesistente e già dichiarato nel checkpoint del
builder. La review ne misura però una conseguenza introdotta nel chiamante R-03:
un export prima ammesso senza log conserva lo snapshot; il nuovo percorso può
presentare come riuscito un archivio privo di quella memoria. La precedente
dichiarazione del limite non costituisce un'accettazione del comportamento.
R-03 resta aperto con destinazione **R-03b, acquisizione del log per l'export**.

## Prove indipendenti

Il [sorgente della controprova](reviewer-original/R03ReviewerFallbackLifecycle.test.tsx.txt)
usa RecapView, WorkspaceStore, IndexedDbEventLog su backend di test e ZIP reali.
Crea uno snapshot canonico con un fatto riconoscibile, verifica che l'export
storico senza log lo conserva, rende IndexedDB assente e aziona il pulsante
del riepilogo. Il file ottenuto non contiene la memoria e non appare un alert.
Il confronto con il base deriva dal percorso senza log, rimasto immutato, e dal
diff del chiamante; non è una seconda esecuzione della UI su un checkout del base.

Il [comando finale](reviewer-original/command-manifest.json) termina con exit 1:
cinque test R-03 committati passano e la nuova controprova fallisce semanticamente.
Sono sei casi distinti; le ripetizioni non ne moltiplicano il conteggio.
[stdout](reviewer-original/focused-recap-causal.stdout.log) e
[stderr](reviewer-original/focused-recap-causal.stderr.log) sono catturati dal
processo, senza ricostruirli da riassunti. Il primo tentativo aveva un'asserzione
inadatta su un valore undefined: resta conservato e non è il RED finale usato
per il finding. Le revisioni successive rendono espliciti entry assente, alert
assente e controllo causale dell'export storico.

Il controllo dei tipi passa. La prima build fallisce per tre input del pack
esclusi dal checkout sparse, non per una modifica prodotto; il tentativo resta
conservato nei log originali. Aggiunti soltanto i 94 file (circa 0,95 MiB) del
pack necessario, il revisore ha rieseguito la build: exit 0, con il warning
preesistente sulla dimensione dei chunk. Il [supplemento](build-supplement/build-supplement.md)
conserva comando, ambiente, log completi e hash; gli originali sono immutati.
Il revisore non ha rieseguito suite completa, gate congelato, Engine o browser.
I relativi risultati precedenti restano prove del builder, non indipendenti.

Gli [originali](reviewer-original/SHA256SUMS), incluso il receipt e tutti i log,
sono copiati byte per byte e verificati contro il manifest del revisore. Il
coordinatore ha inoltre verificato [la provenienza delle prove precedenti](builder-evidence-provenance.json):
hash del candidate, nove record di comando e quattro archivi browser, con
uguaglianza delle memorie A/B fra i due pulsanti. È un controllo di conservazione,
non una riesecuzione o una confutazione del nuovo finding.

Il controllo Git degli spazi termina con exit 2 sui byte originali conservati:
quattro righe emesse da Vite, due interruzioni Markdown del verdetto e nove
righe vuote finali dei log. Non è dichiarato verde e non è stato riconfigurato;
gli originali non vengono ripuliti perché perderebbero la corrispondenza degli
hash. Tutti i 31 file della review, inclusi i log grezzi, sono controllati per
byte NUL e pattern di segreti ad alta confidenza, senza anomalie.

## Isolamento e limiti di ambiente

La [preregistrazione](preregistration.md) precede la delega. Il checkout completo
è fallito per disco pieno; Git ha rimosso automaticamente la copia incompleta.
Un secondo tentativo non ha potuto creare i metadati. Il coordinatore ha liberato
soltanto dist e cache Vite rigenerabili della propria sessione, mantenendo sorgenti
e prove. È poi riuscito un checkout sparse al candidate, con dipendenze condivise
tramite collegamento alla propria installazione e lockfile byte-identico.
Non è stata effettuata una nuova installazione delle dipendenze. La separazione
riguarda agente, contesto e sorgenti; piattaforma e dipendenze rimangono condivise.
Il problema di spazio generale non è dichiarato risolto.

Tutti i processi di verifica del revisore rimuovono le variabili dei provider
dall'ambiente; nessun valore è stampato. Nessun accesso a vault, Basic Memory,
AgentMemory, altri lavori o dati studenti. Nessuna modifica ai file prodotto
versionati; la controprova temporanea è rimossa dopo averne conservato il sorgente.
Questa review Codex non soddisfa il distinto quorum fra provider di Kirchhoff.

## Stato e unica prossima azione

PR #256 riletta: OPEN/DRAFT, head `705284acc4322db4d241032de071437ab0473cc1`,
base/main remoto `b124eee04acc8062c27284f23c5d9108e3767c27`, zero review sottomesse.
La vecchia CI remota non copre questi commit locali. I receipt precedenti restano
immutati: il PENDING del checkpoint R-03 descriveva lo stato prima di questa review.
Le approvazioni R-01/R-02 restano circoscritte alle rispettive patch. R-04 e i
limiti del pilot/provider restano nelle destinazioni originarie; Kirchhoff invariato.

**Prossima unità:** R-03b, distinguere l'acquisizione del log persistente dal
fallback temporaneo nell'azione di export. Se la memoria persistente non può
essere acquisita, mostrare un errore locale senza scaricare un archivio vuoto;
mantenere il comportamento del vero log persistente vuoto e dell'export storico
esplicito. Aggiungere una regressione per indisponibilità reale della factory,
usando gli adapter esistenti, quindi nuova review indipendente. Non introdurre
un recupero automatico di memoria vecchia o un global flush. Nessuna correzione
prodotto è compresa nella presente unità di review.

MERGE=NOT_PERFORMED; PUSH=NOT_PERFORMED; DEPLOY=NOT_PERFORMED;
REAL_PILOT=NOT_RUN; PAID_LLM_CALLS=0; STUDENT_UPLOADS=0.

## Receipt capability append-only

Unità `r03-independent-review-20260921`; skill persistent-capability-evolution
già applicata, revisore Codex nativo con contesto nuovo e runner del repository.
Esito utile della capability: controesempio nuovo e REQUEST_CHANGES; patch non
accettata, nessuna quota 50/30/20 dichiarata raggiunta. Nessuna promozione,
riscrittura di gate o dipendenza aggiornata. Preregistrazione, receipt, last-use
e next-gate aggiunti localmente senza riscrivere la storia. Nessun registro
esterno consultato: `INDEX_SYNC_DEFERRED`. AgentMemory `RETIRED_NO_READ_NO_WRITE`.
