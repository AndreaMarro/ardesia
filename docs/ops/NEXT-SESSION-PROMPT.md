# Prossimo mandato — AUDIO-V2 e prima lezione utilizzabile

Aggiornato: **24 ottobre 2026, Europe/Rome**. Documento operativo da aggiornare
alla chiusura di ogni sessione sostanziale; non misura lo stato live.

La versione del 2 luglio resta nella [storia Git al commit 49bf90ce](https://github.com/AndreaMarro/ardesia/blob/49bf90ce782457494fed52c8e1a812bf27ba158b/docs/ops/NEXT-SESSION-PROMPT.md).
Le sue PR, directory Mac e priorità erano uno snapshot storico. I vincoli attivi
vanno letti in AGENTS e verificati nel contesto dell'incarico.

## Come assegnarlo

Per implementazione con repository, terminale e browser: **GPT-6.1 Sol in Codex o
Work**, ragionamento High/Extra High se disponibile. Per esecuzione complessa
attraverso più strumenti o se quel percorso non è disponibile: **GPT-6 Astra**,
anche nella modalità Pro disponibile al proprio account. Quota e strumenti vanno
controllati nell'interfaccia: non sono verificabili da questo documento.
Una revisione indipendente mirata è più utile di due agenti che modificano gli
stessi file. Non acquistare quote/API o cambiare configurazioni senza
un'autorizzazione pertinente.

Indicazione verificata il 24 ottobre sulle fonti ufficiali
[Models](https://learn.chatgpt.com/docs/models),
[Best practices](https://learn.chatgpt.com/guides/best-practices) e
[Using GPT-6](https://developers.openai.com/api/docs/guides/latest-model).
La scelta per questo incarico è una valutazione operativa, non un benchmark
comparativo eseguito su Ardesia. Rivalutarla se cambiano disponibilità o strumenti.

---

## Mandato da eseguire

Lavora nel repository **AndreaMarro/ardesia** e porta a termine un incremento
utilizzabile: **AUDIO-V2 e un episodio didattico di Poiseuille che colleghi
insegnamento, recupero del contesto e prova successiva**.

Il risultato deve essere codice integrato in un ramo isolato, un percorso
raggiungibile dall'interfaccia, prove riproducibili, una draft PR e memoria
progettuale aggiornata. Un nuovo rapporto generale o un bottone audio scollegato
non chiudono il mandato. Fai una breve ricognizione delle dipendenze e poi
implementa. Prosegui sulle parti autorizzate se incontri un blocco separabile.

### 1. Stato iniziale e letture necessarie

1. Leggi AGENTS.md e gli AGENTS dei package che toccherai.
2. Esegui python3 bin/state/project_state.py. Se una sorgente è UNAVAILABLE,
   conserva il risultato e integra con una lettura GitHub consentita, datata.
   Non trasformare assenza di dati in stato verde.
3. Verifica **PR #297**, head, base, CI, lavori concorrenti e ownership.
   Riferimento applicativo verificato: 49bf90ce782457494fed52c8e1a812bf27ba158b;
   branch pro/ardesia-living-lesson-audio-20261024, base #290 a
   339ab08f4139da0b37e78bbde81e9fe4e83afea0.
   Un eventuale commit documentale successivo non è una nuova prova applicativa.
4. Leggi docs/CANON-INDEX.md, docs/PRODUCT-CANON.md e
   docs/adr/ADR-0004-study-core-and-provider-boundaries.md.
5. Leggi gli ultimi record di docs/ops/ARDESIA-RUNLOG.md e il protocollo
   docs/ops/AGENTMEMORY-SEMANTIC-PROTOCOL.md.
6. Nella consegna docs/deliveries/2026-10-24-convergence/, leggi README,
   status.json, multimodal-mcp-contracts.md, validation.md, le sezioni pertinenti
   di architecture-report.md e il percorso Poiseuille in
   product-pedagogy-economics.md.
7. Leggi docs/reviews/PRO_ADVERSARIAL_REVIEW_GPT61_2026-10-24.md per i difetti
   riprodotti e le conclusioni già confutate. Usa gli altri rapporti a domanda;
   non ripetere tutta l'archeologia giugno-ottobre.

Se #297 è ancora draft, crea un ramo isolato dalla sua head verificata e dichiara
la dipendenza. Se è stata integrata o superata, individua il commit equivalente
e verifica i file necessari prima di scegliere la base. Conserva le modifiche
altrui. Non unire indiscriminatamente rami di audit e rami applicativi.
Un solo integratore possiede la pubblicazione finale.

### 2. Identità e patrimonio da preservare

Ardesia è il Teaching OS; LessonOS è il sottosistema di continuità; Kirchhoff e i
simulatori sono capacità specialistiche; il microcorso è la prima offerta.
Riusa Core deterministico, sessioni, CoursePack, consegne, candidate, revisioni,
diario e registro esistenti. La Learning Experience è una composizione di
riferimenti canonici. Evita nuove autorità per tentativi, consenso o memoria.
Mantieni i confini provider e la politica attuale di inferenza del prodotto.

Conserva i fix di #297: tail audio, permessi tardivi, consenso serializzato,
errori osservabili, replay isolato per Room, confine JSON di Excalidraw e ultimo
istante della timeline. La CI verde di quei fix non certifica AUDIO-V2.

### 3. Incremento A — AUDIO-V2 nel percorso applicativo

Esamina i consumer reali: Room.tsx, AudioRecorder.ts, WorkspaceStore.ts,
sessionState.ts, JournalRecorder.ts, replayTimeline.ts, ReplayView.tsx e i
contratti/export/import correlati. Individua la fonte canonica di ciascun dato.

- Collega il recorder alla Room e alla sessione esistente. Riusa SessionYamlV2,
  createSessionOnce, updateSessionAudioCAS e sessionPaths.
- Porta il consenso nella sessione corretta con aggiornamenti concorrenti
  controllati. Il consenso salvato non autorizza l'avvio automatico del microfono
  alla riapertura. Avvio e stato di cattura devono essere espliciti nella UI.
- Salva media e metadati nella sessione corretta. Byte persistiti prima del
  marker; errori visibili; nessuna conferma di salvataggio anticipata.
- Estendi il contratto canonico degli eventi in modo esplicito, versionato e
  compatibile con i consumer. Mantieni i validator: non ammettere payload
  arbitrari o retrocedere gli envelope per aggirarli. Motiva nel punto
  autorevole pertinente eventuali decisioni di formato.
- Rappresenta recording identity, tempi, MIME, digest e riferimenti verificabili.
  Due registrazioni separate sono flussi distinti: non concatenare alla cieca
  WebM indipendenti. Mappa tempo della lezione e tempo del media, comprese pause,
  fine registrazione e ultimo evento visuale.
- Offri replay, seek e accesso al passaggio dalla UI ordinaria. Gestisci media
  mancanti, corrotti, revocati o non supportati con stato esplicito.
- Integra export/import nel bundle canonico. Il bundle di A non contiene B;
  una nuova istanza/store deve recuperare identità, riferimenti e contenuti.
- Prova revoca durante permesso e scrittura, arresto, riapertura, cambio Room e
  rilascio delle tracce. Distingui dispose, stop e revoca/cancellazione.
  Per copie esportate prima di una revoca dichiara il limite reale: non promettere
  cancellazione retroattiva di copie esterne non più controllate dall'applicazione.
- Associa esplicitamente un segmento a un oggetto o passaggio. Non dichiarare
  comprensione semantica automatica della frase «qui» sulla base del solo tempo.

### 4. Incremento B — Un episodio Poiseuille utilizzabile

Componi sul Core/PhysicsLab già presente un percorso breve e completo:

1. Il tutor apre la lezione, scrive o annota un passaggio e registra un segmento.
2. Collega il segmento a un oggetto/fonte con un riferimento esplicito.
3. Lo studente raggiunge l'esperienza dalla UI ordinaria e formula una previsione
   prima che sia mostrata la soluzione.
4. Se raddoppia il raggio a pressione fissata, il modello dà portata per 16;
   a portata fissata, la pressione è divisa per 16. Vincoli, unità e condizioni
   restano leggibili; l'animazione rispetta la grandezza fissata.
5. Un errore sul vincolo offre un recupero pertinente e consente di tornare al
   passaggio della lezione effettivamente collegato.
6. Un problema diverso verifica il trasferimento: per esempio, raggio dimezzato
   a portata costante. Registra l'esito distinguendo risposta assistita e autonoma
   nei domini esistenti.
7. Il docente vede il lavoro, può revisionarlo e ritrova il prossimo passo.

Riusa candidate/revisioni private e diario: nessun flag di fixture equivale a
revisione umana reale. Usa verificatori deterministici e feedback del docente,
senza introdurre un provider obbligatorio. Etichetta le prove sintetiche.

Fai una seconda variante tramite dati/authoring esistente, quando il contratto
è pronto, per dimostrare il riuso senza duplicare il codice dell'esperienza.
La memoria didattica dello studente resta separata dal registro di progetto
usato dagli agenti.

### 5. UX sul percorso realmente usato

Mantieni identità visiva e componenti esistenti. Correggi accesso al replay,
stati audio, errori, ritorno al contenuto, inquadratura mobile, focus, tastiera,
movimento ridotto e caricamento dei font. Verifica contenuto a 390 px e desktop
sullo stesso candidato. Assenza di overflow del documento non dimostra che gli
oggetti siano visibili o utilizzabili. Registra separatamente crash, console e
richieste di rete fallite.

Non introdurre una riscrittura dell'editor o una nuova applicazione. Mantieni il
gesto del docente e dello studente comprensibile, senza dettagli tecnici inutili
nelle schermate di prodotto.

### 6. REA, MCP e parallelismo

Usa il precedente E0 come prova storica di analisi e verifica: non ha dimostrato
una ricostruzione di funzionalità né un risparmio totale. Porta a termine un
esperimento completo REA su un dubbio di questo percorso, idealmente E3
audio/eventi/tempo: target→osservazione→evidenza→specifica→implementazione→test
→valutazione del costo complessivo. Confronta lo stesso obiettivo con il metodo
diretto, includendo preparazione e analisi; registra UNKNOWN e fallimenti.
Se accesso o strumenti impediscono un passaggio, documenta il blocco e il
protocollo riproducibile, continuando l'implementazione autorizzata; non
dichiarare chiuso quel gate. Un test nativo MediaRecorder non diventa un
esperimento REA per etichettatura. REA resta fuori dalle dipendenze del prodotto.

Mantieni compatibili le quattro letture MCP esistenti. Dopo i due incrementi,
la prima scrittura resta feedback.propose_private_revision, sulla RFC #293 e
sui servizi Core, con pubblicazione umana della revisione esatta. Non allargare
ora il mandato a tutte le scritture e a tutti gli host; registra il passo
successivo e le sue dipendenze. Se il prodotto richiede una modifica delle
letture, verifica SDK, autorizzazione e regressioni pertinenti.

Se il client consente agenti paralleli, separa ownership: integrazione
audio/sessione; esperienza e UX; revisore indipendente. Comunicate i contratti
prima degli edit; nessuna modifica concorrente agli stessi file. Il revisore
attacca isolamento, revoca, fine audio e round-trip. Il root verifica e integra.
Se non sono disponibili subagenti, esegui le verifiche in sequenza e dichiara il
limite della revisione.

### 7. Accettazione e prove

Conserva i test RED pertinenti e verifica GREEN dopo la correzione. Completa i
gate richiesti dai package modificati e la CI sullo SHA finale; non indebolire
asserzioni o gate. Evita ripetizioni di suite senza una ragione concreta.

Il minimo osservabile comprende:

- cattura nativa sintetica breve, ultimo segmento decodificabile e ordine
  storage→marker→stop completato;
- due registrazioni con pausa, seek corretto e ultimo evento;
- due Room, residuo legacy ostile, cambio contesto e cold reopen;
- export A→nuovo store→import→replay, riferimenti conservati e assenza di B;
- revoca, permesso tardivo e scrittura pendente, senza nuova cattura o media
  erroneamente disponibili;
- percorso Poiseuille raggiunto dalla UI, errore→recupero→nuova prova→vista docente;
- screenshot/traccia desktop e mobile, tastiera e movimento ridotto,
  errori console/rete integralmente rendicontati.

Distingui classi isolate, mock, browser nativo, consumer reale, ambiente remoto e
dati reali. Un test sintetico non certifica autorizzazione remota, tutti i browser,
efficacia didattica o beta commerciale. Se un gate fallisce, registra risultato
e causa, correggi entro il perimetro e ricontrolla; non trasformarlo in PASS
tramite una descrizione più favorevole.

### 8. Memoria cronologica che migliora a ogni uso

Applica docs/ops/AGENTMEMORY-SEMANTIC-PROTOCOL.md: leggi prima la cronologia
pertinente, verifica le affermazioni sullo stato reale e registra il risultato
di ogni decisione sostanziale. Aggiorna gli stessi file autorevoli.

Prima della consegna aggiungi a docs/ops/ARDESIA-RUNLOG.md una voce datata con
intento, base/SHA, decisioni e motivi, alternative scartate, errori trovati,
prove e limiti, cambiamenti, questioni aperte e lezioni riutilizzabili.
Una conclusione smentita riceve una correzione datata e un riferimento alla nuova
prova; non riscrivere il passato. Non inserire segreti o dati studenti.

Aggiorna questo prompt con lo stato di uscita e il prossimo incarico concreto.
Ogni nuova voce termina con **3–5 suggerimenti prioritizzati**: beneficio,
dipendenza, primo passo, criterio di accettazione e prova richiesta.
Un suggerimento non autorizza da solo una mutazione futura. Se un errore operativo
si ripete, proponi una regola breve e verificabile nel punto autorevole; evita
la crescita di istruzioni ridondanti.

Non creare attività programmate né dichiarare che la memoria si aggiorna in
assenza di un agente in esecuzione. Il servizio esterno AgentMemory resta una
cache opzionale da verificare; il lavoro deve poter proseguire con Git.

### 9. Vincoli e consegna

Sviluppo in ramo isolato e draft PR sono autorizzati. Sono esclusi merge,
rilascio pubblico/produzione, pagamenti, acquisti API, migrazioni distruttive e
pubblicazione di materiale o dati privati. Non cambiare scheduler o servizi del
computer. Risolvi autonomamente le normali scelte reversibili.

Concludi in italiano con risultato raggiunto, cosa è utilizzabile e come
provarlo, branch/PR/SHA, file, test e prove, limiti e dipendenze residue.
Collega memoria e handoff aggiornati. Chiudi con il prossimo task consigliato e
il motivo, senza lasciare come unico risultato un'altra richiesta di pianificazione.

## Prossimi task suggeriti

1. **AUDIO-V2** — primo passo: verificare session identity/CAS e consumer del
   bundle. Dipende da #297 o equivalente. Accettazione: cattura→persistenza→replay
   →export/import su due Room e revoca verificata.
2. **Episodio Poiseuille** — primo passo: fissare riferimenti CoursePack e
   laboratorio Core esistenti. Dipende dai riferimenti persistenti e da AUDIO-V2
   per il recupero audio. Accettazione: previsione→errore→contesto→nuova prova
   →vista docente, con trace dello stesso build.
3. **Qualità mobile e font** — primo passo: riprodurre inquadratura e richieste
   fallite documentate. Dipende dal percorso visibile, eseguibile in parallelo
   su file separati. Accettazione: contenuto utilizzabile a 390 px, tastiera,
   movimento ridotto e log degli eventuali limiti residui.
4. **Prima scrittura MCP privata** — dopo i gate precedenti, leggere RFC #293 e
   mappare il comando Core. Accettazione: proposta privata, concorrenza e
   autorizzazioni verificate, revisione esatta pubblicata dal docente, un host
   nominato collaudato. Non è una promessa di completamento nel presente mandato.
