# Ardesia — ricerca indipendente su prodotto, didattica, UX ed economia

**Data:** 24 ottobre 2026. **Autore del lavoro:** agente di ricerca prodotto della sessione Pro. **Stato:** analisi e specifiche proposte, da integrare nei documenti canonici esistenti; questo file non è un secondo canone. **Baseline principale ispezionata:** `339ab08f4139da0b37e78bbde81e9fe4e83afea0`, checkout `/workspace/scratch/6f2994042c33/ardesia`. Una prima lettura è stata eseguita sulla copia precedente `57c492af2bc391652f8c243107cfe8f00a22820d`; i riferimenti recenti sotto sono stati ricontrollati sul checkout nuovo ove indicato. Non sono stati eseguiti acquisti, invii, pubblicazioni o modifiche a repository remoti.

## 1. Valutazione indipendente

**La scelta del primo verticale è ragionevole; la continuità della lezione deve diventare il comportamento riconoscibile del prodotto.** Fluidi è già un buon banco di prova: il modello è piccolo, i vincoli producono errori concettuali osservabili e il codice esistente separa i parametri dalla risposta. Non serve un altro corso, una nuova banca o una sostituzione della lavagna per dimostrare questa promessa.

Il lavoro recente va preservato quando protegge provenienza, versioni e accessi. Nel checkout verificato, `apps/web/src/components/PhysicsLab.tsx` implementa previsione, scelta del vincolo, modifica del raggio e calcolo. `packages/engine/lessonos/study/activities.py` conserva un valutatore deterministico di Poiseuille con dominio esplicito. `catalog.py` vincola ogni edizione a ID, versione e SHA del CoursePack. Sono basi valide, non una deviazione da cancellare.

La lacuna osservata è di composizione dell'esperienza: `Classroom.tsx` presenta laboratorio, banca quesiti, quaderni, note e consegna come sezioni successive. `PhysicsPathways.tsx` organizza materiale e copertura ma dichiara correttamente che il percorso editoriale non è un CoursePack erogabile. Questa struttura rende visibile il patrimonio; non dimostra ancora che un evento di lezione produca un intervento specifico nella sessione successiva. Non deduco da questa lettura che la capacità sia assente in tutto il repository.

**Audio sincronizzato e appunti non costituiscono da soli una novità di mercato.** La documentazione Goodnotes descrive già Note Replay, con scrittura sincronizzata all'audio; la pagina consultata limita il replay a iOS/macOS e ai Notebook. La novità da dimostrare per Ardesia è la catena: passaggio della lezione verificabile → errore osservato → recupero pertinente → revisione del docente → nuova prova → continuità tra lezioni. È una proposta differenziante da validare, non una posizione competitiva già conquistata. [B7]

La promessa comprensibile è:

> **La tua lezione resta utilizzabile: ritrovi il passaggio che ti serve, provi il modello, correggi il ragionamento e riparti da lì.**

Per il tutor:

> **Spieghi una volta, ritrovi il contesto e prepari la prossima attività senza ricostruire tutto da zero.**

Il vantaggio più difficile da sostituire sarebbe la qualità accumulata di esempi, correzioni e decisioni didattiche autorizzate e rivedibili. Un insieme di trascrizioni, un database di quiz e un generico riepilogo AI non bastano. La disponibilità di tale vantaggio va misurata su tempo docente e apprendimento dello studente, senza usare quantità di codice o numero di quesiti come surrogati.

## 2. Cosa sostiene la ricerca e cosa resta un'ipotesi

Le fonti sotto sono pubblicazioni scientifiche originali o sintesi scientifiche firmate dagli autori, consultate sui siti di riviste, istituzioni o autori. Gli effetti medi non sono una previsione dell'effetto di Ardesia. Non sommare gli effect size di interventi differenti.

| Principio | Evidenza consultata e limiti | Scelta operativa proposta |
|---|---|---|
| Esempio svolto prima di una ricerca lunga e cieca | Sweller e Cooper (1985) studiano gli esempi svolti in algebra. La pagina dell'editore identifica lo studio; il recupero del full text dell'editore è stato bloccato da HTTP 403. Non attribuisco numeri o dettagli sperimentali non letti. [P1] | Un esempio completo con scelte motivate; poi un esempio da completare e infine un problema autonomo. Non imporre lo stesso supporto a tutti. |
| Supporto che cambia con la competenza | Salden e colleghi riportano un esperimento di laboratorio e uno in classe: in quel contesto il fading adattivo degli esempi ha superato quello fisso e il solo problem solving. Abstract dell'editore consultato; articolo completo non acquistato. [P2] | Fare scegliere “Mostra un passaggio” e ridurre il supporto solo dopo evidenze coerenti. Un calendario rigido di aiuti non equivale a personalizzazione. |
| Recupero attivo | Roediger e Karpicke (2006) trovano che, su brani in prosa, ripetere test di richiamo migliora il ricordo differito rispetto alla rilettura; la rilettura può apparire migliore nell'immediato. Due esperimenti, non una verifica di problemi ingegneristici complessi. [P3] | Dopo il replay chiedere una predizione senza soluzione visibile. Misurare anche un nuovo caso a distanza, non solo la risposta subito dopo la spiegazione. |
| Pratica distribuita | Cepeda e colleghi sintetizzano 317 esperimenti sul richiamo verbale: intervallo di studio e intervallo di ritenzione interagiscono. Non giustifica un algoritmo universale “1–3–7 giorni” per qualsiasi competenza. [P4] | Riproporre una verifica secondo il tempo disponibile prima della prova e l'esito osservato. Nella beta usare regole dichiarate e modificabili, non una falsa curva individuale di oblio. |
| Attività che richiedono ragionamento | Freeman e colleghi analizzano 225 studi universitari STEM; l'effetto medio sui punteggi è circa 0,47 deviazioni standard. Le pratiche sono eterogenee e non equivalgono a muovere uno slider. [P5] | Ogni interazione deve sollecitare una predizione, un confronto o una spiegazione. Il trascinamento da solo non è una misura di apprendimento. |
| Feedback informativo | Wisniewski e colleghi sintetizzano 435 studi. L'effetto medio depurato dagli estremi è d=0,48, con elevata eterogeneità; l'informazione trasmessa conta. Questo non certifica la correttezza di feedback generati da un modello. [P6] | Dire quale vincolo è stato trascurato, mostrare una prova controllabile e proporre una prossima azione. Evitare risposte che si esauriscono in “corretto/sbagliato” o elogi. |
| Scaffolding | Belland e colleghi sintetizzano 144 studi sperimentali di supporto digitale a problemi STEM poco strutturati; effetto medio g≈0,46. Non trovano una superiorità generale di tutte le forme di personalizzazione dei supporti. [P7] | Iniziare con pochi aiuti validati e misurare se la scelta adattiva aggiunge valore. La complessità dell'algoritmo non è un risultato pedagogico. |
| Carico cognitivo e multimedia | Mayer e Moreno esaminano sovraccarico e principi di progettazione su basi teoriche e sperimentali. Audio, testo e immagini possono competere per l'attenzione; più media non significa automaticamente migliore comprensione. [P8] | Segmenti brevi, pausa, replay, evidenziazione dell'oggetto pertinente. Trascrizione accessibile a richiesta; niente movimento decorativo mentre si legge una formula. |
| Autoregolazione | Panadero confronta sei modelli, le loro evidenze e strumenti di misura. Ricorrono pianificazione, monitoraggio e riflessione; la rassegna non autorizza a diagnosticare motivazione o capacità da pochi clic. [P9] | Prima: obiettivo e previsione. Durante: aiuto e controllo. Dopo: “che cosa hai cambiato nel ragionamento?”. Conservare osservazioni e provenienza, non etichette personali. |

### Protocollo di verifica didattica per il pilot

Reclutare un piccolo gruppo già seguito dal tutor, senza descriverlo come trial di efficacia. Scegliere due microcompetenze comparabili, registrare conoscenza iniziale e alternare la sequenza delle attività fra studenti ove praticabile. La prima prova serve a capire errori di interazione, contenuto e misura; numeri così piccoli non consentono dichiarazioni causali forti.

Misure proposte: riuscita su un problema nuovo senza aiuti; spiegazione del vincolo; tempo docente per preparare e correggere; numero di interventi manuali dovuti a errori del sistema; capacità di ritrovare un passaggio dopo 48 ore. Conservare separatamente chi ha visto la soluzione, chi ha chiesto un aiuto, chi ha corretto da solo e chi ha ricevuto un intervento del tutor. Una risposta corretta dopo aver visto il risultato non prova padronanza indipendente.

Gate operativo iniziale, **proposto e non validato**: nessun errore scientifico noto nei contenuti pubblicati; almeno quattro studenti su cinque riescono senza assistenza dell'autore ad aprire la lezione, ritrovare un passaggio e completare una nuova prova; il tutor risparmia almeno dieci minuti per una lezione confrontabile, senza aumentare il lavoro di verifica. Cinque persone sono un test di usabilità e utilità, non un campione sufficiente a certificare efficacia formativa.

## 3. Benchmark di esperienze concrete

**Metodo e limite:** ho analizzato attività pubbliche, istruzioni operative e documentazione dei prodotti, non soltanto homepage. Non ho eseguito login, sottoscritto abbonamenti o svolto un collaudo visuale in browser di questi prodotti. Di conseguenza le valutazioni sotto riguardano meccanismi documentati e scelte trasferibili; non assegnano punteggi inventati a fluidità, accessibilità o prestazioni. Gli screenshot dell'app Ardesia devono essere raccolti separatamente nel collaudo.

| Esperienza | Meccanismo documentato | Cosa trasferire | Cosa non dedurre o copiare |
|---|---|---|---|
| Brilliant, Scientific Thinking: ingranaggi, strutture, ottica | Il programma pubblico mostra progressioni da componenti semplici a combinazioni e revisioni. È stato letto il corso e la sequenza, non svolte le lezioni protette. [B1] | Un obiettivo concettuale per schermata e una progressione che riutilizza ciò che si è appena scoperto. Per Ardesia: rapporto, quarta potenza, vincolo invertito, trasferimento. | Non usare il marchio o asset; non affermare che Ardesia abbia eguagliato le interazioni della versione a pagamento. |
| Desmos, Function Carnival | La descrizione ufficiale propone di disegnare grafici del moto e confrontare la propria rappresentazione con la traiettoria. [B2] | Fare produrre un'ipotesi allo studente e farne vedere le conseguenze; chiedere un'argomentazione sull'errore. Il feedback visivo può essere il comportamento del modello. | Non ridurre l'idea a un quiz affiancato a un grafico. L'efficacia del singolo compito va verificata nel contesto. |
| GeoGebra, Definition of the Derivative | L'attività pubblica usa un controllo per il punto e uno per h; chiede che cosa accade alla secante a h=0 e poi il confronto con la tangente. [B3] | Collegare rappresentazioni: parametro, geometria, formula e linguaggio. Rendere osservabile il caso limite senza nascondere il dominio matematico. | Non suggerire che il rapporto incrementale sia definito a h=0. Non assumere licenza commerciale di ogni applet perché visibile online. |
| PhET, Circuit Construction Kit DC | Il simulatore documenta costruzione, misure e passaggio tra rappresentazioni; gli obiettivi richiedono spiegare misure e relazioni. La pagina indica funzioni inclusive ma anche limiti di piattaforma. [B4] | Strumenti la cui funzione didattica è immediata, modifiche reversibili e rappresentazioni coerenti. Un laboratorio Kirchhoff deve mostrare anche cosa si misura e in quali ipotesi. | Un modello scientifico non sostituisce automaticamente un laboratorio reale. Le modalità inclusive del prodotto altrui non attestano quelle di Ardesia. |
| Numbas, adaptive marking | La documentazione spiega come una risposta precedente possa diventare un dato nei passi successivi, anche per riconoscere un procedimento coerente dopo un errore iniziale. [B5] | Distinguere errore di dato da errore di metodo. Negli esercizi multipasso conservare dipendenze, evitando di penalizzare più volte la stessa svista. | Una risposta finale errata non identifica da sola la causa. L'algoritmo non equivale a diagnosi cognitiva. |
| STACK, derivazione e potential response tree | L'esempio di authoring separa validazione della sintassi, interpretazione dell'espressione e valutazione di equivalenza. [B6] | Mostrare allo studente come è stato interpretato il suo input. Separare risposta non leggibile, calcolo sbagliato e ragionamento da discutere. | Non trasformare un CAS in valutatore universale di prove o testo libero. Non importare intero LMS per ottenere una sola verifica. |
| Goodnotes, Note Replay | Audio e annotazioni possono essere riprodotti insieme, con controlli di timeline. [B7] | Un'azione “ritorna a questo passaggio”, pausa, scrubbing e recupero rapido del contesto. | Non presentare sincronizzazione temporale come comprensione semantica automatica. È una funzione concorrente già documentata. |
| Khan Academy, progress e mastery | La guida descrive attività, cambi di livello e collegamenti ai prerequisiti; la pagina progresso espone un registro filtrabile. [B8] | Rendere comprensibile perché viene proposta una prossima attività e quali evidenze hanno cambiato lo stato. | Non convertire percentuale di attività completate in probabilità di superare un esame. Non copiare soglie come se fossero calibrate sul pubblico di Andrea. |

### Lettura visuale da applicare alla progettazione

Le cinque famiglie utili sono: compito concentrato (Brilliant), feedback che prende forma nel modello (Desmos), legame tra rappresentazioni (GeoGebra), laboratorio riconoscibile (PhET), ritorno al momento della lezione (Goodnotes). Per ciascuna vanno testati densità, gerarchia, dimensioni touch, tempi, testi lunghi e formulas sul prototipo Ardesia. Non basta inserire cinque iframe: frammenterebbero navigazione, permessi e persistenza.

## 4. Unità di contenuto: esperienza didattica compositiva

**Decisione proposta:** l'unità di authoring è una sequenza di attività con obiettivo ed evidenze; il quiz resta una forma di verifica. La sequenza non richiede un nuovo Core né una seconda banca.

Nel codice verificato, il CoursePack `relazioni-fluidi-v1` contiene attività con `id`, modello, dominio, competenza, prerequisiti e parametri. Il registro canonico ne conserva versione e SHA. `curriculum_pathways.py` dichiara che la composizione editoriale non concede autorizzazione a pubblicare o praticare. Questi confini vanno mantenuti.

### Contratto proposto, non schema già implementato

Una `LearningExperience` può essere una vista/editorial manifest versionato, collegato ai riferimenti già canonici:

```json
{
  "schemaVersion": 1,
  "id": "exp-poiseuille-boundary-v1",
  "status": "DRAFT",
  "coursePackRef": {"id": "relazioni-fluidi-v1", "version": 1, "sha256": "<resolved canonical hash>"},
  "objective": "Distinguere che cosa cambia a pressione o portata fissata",
  "steps": [
    {"id": "predict", "kind": "prediction", "activityRef": "poiseuille-v1"},
    {"id": "explore", "kind": "model", "activityRef": "poiseuille-v1"},
    {"id": "revisit", "kind": "lesson-segment", "sourceRef": "<authorized versioned source>"},
    {"id": "explain", "kind": "explanation"},
    {"id": "retry", "kind": "transfer", "assignmentRef": "<authorized assignment>"}
  ],
  "review": {"scientific": "NOT_ATTESTED", "pedagogical": "NOT_ATTESTED"}
}
```

I segnaposto non sono dati validi da distribuire. L'implementazione deve scegliere i tipi e nomi effettivi già presenti, senza creare una convenzione concorrente. Il manifest può essere inizialmente un campo editoriale o una proiezione: prima ricercare branch e contratti esistenti. I tentativi, le revisioni, la proprietà dei materiali e i permessi restano nei relativi domini canonici. Il manifest ordina e collega; non assegna da solo diritti o padronanza.

Passi facoltativi: situazione, predizione, interazione, esempio svolto, completamento, verifica autonoma, riflessione, richiamo differito. Non obbligare un esercizio semplice a dodici schermate. Un caso già padroneggiato deve poter andare direttamente alla verifica; un novizio deve poter accedere a una spiegazione prima di esplorare.

### Evidenza dello studente

Conservare: risposta effettiva, parametri, vincolo, versione dell'attività, aiuti usati, riferimento alla fonte e revisione docente. La proiezione può dire “in questa prova hai applicato la quarta potenza al contrario”, se osservabile; non “non capisci la fisica”. Un solo errore può essere una svista. La prossima attività va proposta con un motivo leggibile e una possibilità di scelta o correzione del tutor.

Classi epistemiche: evento registrato; controllo deterministico; interpretazione proposta; interpretazione confermata dal docente. Una confidence AI non è un sostituto della provenienza né una probabilità calibrata se non è stata validata come tale.

## 5. La dimostrazione Poiseuille che rende visibile LessonOS

**Obiettivo:** in tre–cinque minuti mostrare il ciclo completo, con dati sintetici esplicitamente etichettati finché non esiste una sessione autentica autorizzata. Le durate sono obiettivi di design, non misure già ottenute.

1. **Problema:** due tubi identici salvo il raggio. Lo studente prevede l'effetto del raddoppio mantenendo fissata la differenza di pressione. Prima del calcolo il risultato numerico non deve essere visibile.
2. **Manipolazione:** r/r₀ passa da 1 a 2. Si mostra il rapporto Q/Q₀=16, perché viscosità e lunghezza sono costanti. La sezione cresce di quattro volte, ma la portata in questo modello cresce di sedici: chiedere di distinguere le due grandezze.
3. **Contesto di lezione:** il tutor dice “qui il vincolo è la pressione”. La timeline evidenzia il controllo e la riga di formula pertinenti. Il legame è un riferimento esplicito della demo; non si dichiara che il sistema abbia capito automaticamente il deittico “qui”.
4. **Cambio di vincolo:** mantenendo Q fissata, con lo stesso rapporto dei raggi la differenza di pressione necessaria diventa 1/16. Non animare sedici volte più particelle in questa modalità: la portata è rimasta costante. Questa coerenza è un test scientifico della UI.
5. **Errore:** su una domanda nuova, lo studente sceglie 16 per la pressione richiesta a portata fissata. Il feedback richiama l'osservazione specifica e il segmento della lezione; non attribuisce una diagnosi permanente.
6. **Recupero:** prima identificare ciò che resta fisso, poi isolare Δp, poi confrontare i rapporti. Uno studente può aprire un aiuto per passaggio; non è obbligato a leggere un'intera dispensa.
7. **Trasferimento:** dimezzare il raggio a portata fissata. Chiedere ragionamento e rapporto Δp/Δp₀=16, nascondendo il risultato del modello fino alla predizione. Il numero finale coincide con quello di un caso precedente ma il vincolo e il ragionamento cambiano.
8. **Continuità:** salvare il tentativo autorizzato e la revisione. Dopo riapertura, la scheda “Da riprendere” indica attività, fonte e motivo. La demo pubblica senza account deve dire chiaramente se il salvataggio vale solo in questo browser e non è un profilo studente remoto.

### Criteri minimi di accettazione

La timeline usa una base temporale dichiarata, conserva la sequenza anche con seek e pausa, distingue audio non disponibile da errore di caricamento e permette lettura della trascrizione. Ogni oggetto indicato è risolvibile nella versione salvata. La modifica libera del laboratorio dopo un replay non deve corrompere l'originale del docente. Il replay è una proiezione; il nuovo tentativo è un nuovo evento.

Test fisici: r/r₀=1 dà rapporto 1 in entrambi i vincoli; scambiare i vincoli produce reciproci positivi; r/r₀=2 produce 16 e 1/16; il controllo non accetta valori non finiti o raggi non positivi. La validità scientifica resta quella di fluido newtoniano incomprimibile, moto laminare stazionario e sviluppato in tubo rigido cilindrico. Non è un modello clinico.

Test didattici: risultato nascosto prima della predizione; feedback diverso per vincolo errato e potenza errata; risposta dopo aiuto distinta da prova autonoma; indicazione del prossimo passo coerente con l'errore; il tutor può correggere o annullare l'interpretazione.

Test di verità commerciale: nessuna frase “riconosce ciò che indichi” se il collegamento è una fixture; nessuna memoria multiutente dichiarata se il dato vive in `localStorage`; nessun “corso completo per il Semestre Filtro” per il solo modulo fluidi.

## 6. Cinque journey con schermate e gate

Tutti i flussi sono **SPECIFIED** in questo rapporto. L'esistenza parziale del codice va attestata dall'inventario tecnico e dai test, non da questa tabella.

| Utente e risultato | Schermate minime e sequenza | Architettura minima | Criterio di accettazione |
|---|---|---|---|
| Il docente insegna e ritrova il contesto | Lezione → avvio esplicito registrazione → lavagna/modello → chiusura → anteprima segmenti | Sessione canonica, event journal, media autorizzati, clock e riferimenti oggetti | Registrazione chiaramente attiva; stop chiude tracce e listener; riapertura ricostruisce la sessione; un audio fallito non è presentato come salvato. |
| Lo studente continua dopo la lezione | “Riprendi” → passaggio preciso → ascolto/testo → nuova attività | Lettura autorizzata della capsula/source version; attività CoursePack; tentativo canonico | Da un collegamento torna al momento corretto; non vede materiale privato altrui; riprende dopo logout/login secondo il livello di persistenza dichiarato. |
| Il sistema propone recupero | Prova → evidenza dell'errore → scelta “rivedi il vincolo” → esempio → trasferimento | Regole trasparenti basate su tentativi; nessun LLM obbligatorio in runtime; proiezione di progresso | Due errori diversi portano a motivazioni differenti; il percorso spiega la scelta; aiuto e risposta autonoma restano distinguibili. |
| Il docente corregge una consegna | Coda → originale e versione → osservazione ancorata → proposta → approva/modifica → nuovo compito | Consegna immutabile, revisione proposta separata da finale, permessi, idempotenza, audit | L'approvazione riguarda quella versione; una modifica concorrente invalida la proposta; lo studente vede solo il feedback pubblicato autorizzato. |
| Un tutor esterno crea un percorso | Spazio → import → selezione passaggio → modello di esperienza → anteprima studente → revisione → pubblicazione | Tenant/ownership canonici, fonte versionata, draft, registro licenze, gate di pubblicazione | Un tutor nuovo crea una piccola esperienza senza codice, la prova come studente e può esportarla; un secondo tutor non può leggere i suoi originali. |

La beta del 2 novembre dovrebbe verificare davvero i primi quattro flussi su un solo verticale e trattare il quinto come percorso assistito per due tutor invitati. Il self-service pubblico e il marketplace richiedono dati di adozione, supporto e isolamento già misurati. Esporre prima una scheda creatore onesta è possibile; dichiarare un ecosistema operativo non lo è.

## 7. Sistema visuale e interazione: consolidare quello esistente

Il foglio `apps/web/src/styles.css` del checkout nuovo contiene già un'identità coerente: carta chiara `#f8f7f3`, superficie `#fffefa`, inchiostro `#202b2b`, accento terracotta, verde e stati di errore. Ha controlli con altezza minima di 44 px, focus visibile e gestione di `prefers-reduced-motion`. Il problema non richiede automaticamente un rebrand o una libreria UI aggiuntiva.

### Token da conservare e organizzare

| Ruolo | Baseline / decisione proposta | Uso |
|---|---|---|
| Sfondo e superfici | Conservare `--paper`, `--surface` | Continuità fra landing, lezione e tutor; evitare una nuova palette per ogni plugin. |
| Testo principale | Conservare `--ink`; validare contrasto di ogni combinazione reale | Formula e spiegazione restano leggibili sul tablet e in screenshot. |
| Azione primaria | Riutilizzare `--action` | Una sola azione dominante per fase: prevedi, verifica, riprova. |
| Accento didattico | `--accent` con alternative di forma e testo | Evidenziare il vincolo o il termine della formula; non affidare il significato al colore soltanto. |
| Tipografia | Stack esistente; corpo 16 px proposto nelle attività, 15–16 nel gestionale | Dimensioni coerenti e lunghezza di riga orientativa 60–75 caratteri; formule con fallback e scorrimento locale. |
| Spaziatura | Scala proposta 4, 8, 12, 16, 24, 32, 48 px | Ridurre distanze arbitrarie e layout che cambiano fra integrazioni. |
| Raggi | Riutilizzare 4–8 px esistenti | Aspetto maturo; evitare capsule e card sovrapposte per ogni riga. |
| Motion | 120–180 ms per risposta al comando; 200–300 ms per cambio di contesto, salvo simulazione controllata | Durate proposte da testare, non requisiti scientifici. L'animazione deve indicare una trasformazione. |

### Componenti prioritari

**Scheda “Riprendi da qui”.** Un obiettivo, una fonte leggibile, ultimo tentativo, prossimo passo. Le informazioni tecniche di SHA e stato editoriale stanno nel pannello di provenienza, tranne quando il loro effetto richiede una decisione dell'utente.

**Lezione con contesto.** Desktop: modello centrale e pannello dei passaggi a fianco; audio sotto il modello. Smartphone: spiegazione breve, modello, controllo, risultato, ripresa; niente due colonne compresse. È meglio un contenitore scrollabile per la formula che un'intera pagina larga.

**Feedback ancorato.** “Hai mantenuto la portata, ma hai applicato la relazione valida a pressione fissata.” Sotto: pulsante al segmento, un passo da correggere, una nuova prova. Non mostrare tre alternative equivalenti e un lungo menu di plugin nel momento dell'errore.

**Coda docente.** Priorità al prossimo lavoro: consegne da correggere, lezione successiva, materiale da approvare. Il numero di quiz disponibili non è il KPI principale del docente.

**Compositore guidato.** Fonte → obiettivo → attività → verifica → anteprima. Il tutor sceglie fra pochi modelli reali. Il sistema non promette di convertire automaticamente qualsiasi PDF in un corso affidabile.

### Stati obbligatori

Registrazione non iniziata, permesso richiesto, in corso, in chiusura, salvata, salvataggio fallito; fonte caricata, fonte non disponibile, versione non coincidente; tentativo in bozza, invio in corso, inviato, feedback proposto, feedback approvato. Un errore va spiegato insieme a cosa può fare l'utente e a ciò che è stato effettivamente conservato.

### Accessibilità e motion

WCAG 2.2 SC 2.5.8 specifica un minimo di 24×24 CSS px o condizioni equivalenti/spaziatura, con eccezioni; mantenere 44 px per controlli touch principali è una scelta di prodotto più comoda, non citare 44 px come obbligo AA universale. SC 2.3.3 è AAA e riguarda la possibilità di disattivare animazioni da interazione non essenziali. [A1][A2]

Conservare input da tastiera per slider, etichette esplicite, focus prevedibile, testo alternativo del modello e trascrizione. Con movimento ridotto, mostrare stati iniziale/finale, frecce e valori; la comprensione della relazione non deve dipendere da un'animazione. Il timer di un esame non appartiene alla prima lezione esplorativa.

**Controllo visuale da eseguire:** desktop 1440×900, tablet 768×1024 e smartphone 390×844; prova aggiuntiva a 320 px e testo al 200%; formula lunga, messaggio di errore lungo, nome corso lungo, tastiera virtuale, zoom e riduzione del movimento. I controlli effettivamente eseguiti vanno registrati con screenshot e versione; non dichiarati in anticipo.

## 8. Modello economico e prezzi da sperimentare

### Sequenza consigliata

Uso del fondatore → cinque studenti già seguiti → prima coorte pagante su un obiettivo limitato → seconda e terza coorte con riuso reale dei materiali → due tutor esterni assistiti → eventuale servizio tutor. In parallelo si può far vedere la visione ampia, ma la vendita iniziale deve descrivere un risultato circoscritto e verificabile.

| Modello | Valore acquistato | Valutazione per il primo rilascio |
|---|---|---|
| Microcorso autonomo | Preparazione di un sottoargomento con attività e verifiche | Buon prodotto di ingresso solo dopo revisione e prova di completamento senza tutor; rischio supporto superiore al prezzo. |
| Piccolo gruppo guidato | Lezioni, correzione e continuità fra incontri | Miglior ipotesi iniziale: usa l'attività già svolta da Andrea e permette di misurare utilità. |
| Abbonamento studente | Uso ricorrente di più percorsi | Rinviare finché non si osservano ritorno e contenuti sufficienti; la preparazione a un esame è episodica. |
| Abbonamento tutor | Risparmio di tempo e continuità con studenti | Potenziale maggiore stabilità, ma da provare con tutor diversi dal fondatore e costi di onboarding. |
| Gratuito con premium | Accesso a laboratorio; supporto o strumenti avanzati a pagamento | Un laboratorio pubblico può acquisire contatti; non offrire costi variabili illimitati. |
| Commissione sulle vendite | Distribuzione, incasso e supporto commerciale | Prematuro se la piattaforma non porta acquirenti. Una commissione senza distribuzione è difficile da giustificare. |
| Combinazione selettiva | Corso guidato ora; strumento tutor successivamente | Raccomandata. Due offerte progressivamente validate, non sette piani tariffari simultanei. |

Prezzi da testare, **non stime di disponibilità a pagare**: €29–49 per un modulo autonomo circoscritto; €79–119 per una coorte pilota con quattro incontri da 90 minuti e correzione delimitata; €19–39/mese per due tutor invitati, solo se il risparmio misurato lo sostiene. Eventuali prezzi finali al consumatore dipendono dal trattamento fiscale applicabile e dai servizi realmente inclusi. Nessuno di questi importi va pubblicato automaticamente.

### Economia per uno studente di una coorte

Il file `product_economics_scenarios.json` contiene i calcoli riproducibili. Tutti gli input di domanda, costo e utilizzo sono **ipotesi**, non dati di mercato. Il modello usa ricavi al netto di eventuali imposte indirette: non sono listini retail già pronti. Il lavoro docente è valorizzato a €25/h come scelta di costo opportunità coerente con la tariffa indicata dall'utente; non significa che il costo pieno dell'attività sia stato misurato.

Assunzioni comuni: sei ore di erogazione per coorte; otto ore per preparare una versione del materiale; commissioni di pagamento ipotetiche del 3% + €0,35 (non attribuite a un provider); rimborsi/abbuoni attesi come percentuale del ricavo. Il costo infrastruttura è un budget di scenario comprendente elaborazione, trascrizione, storage, streaming e DB; non una quotazione di servizi. Il runtime deterministico corrente non richiede un costo LLM per ogni risposta.

| Per studente | Pessimistico | Centrale | Favorevole |
|---|---:|---:|---:|
| Iscritti per coorte | 6 | 8 | 10 |
| Ricavo unitario assunto prima dei rimborsi | €79,00 | €99,00 | €119,00 |
| Rimborsi/abbuoni assunti | 10% | 5% | 2% |
| Ricavo realizzato atteso | €71,10 | €94,05 | €116,62 |
| Erogazione docente ripartita | €25,00 | €18,75 | €15,00 |
| Correzione individuale | €18,75 (45 min) | €8,33 (20 min) | €4,17 (10 min) |
| Assistenza | €12,50 (30 min) | €4,17 (10 min) | €2,08 (5 min) |
| Budget tecnico totale | €8,00 | €3,00 | €1,00 |
| Pagamento ipotetico | €2,72 | €3,32 | €3,92 |
| Contributo prima di acquisizione e contenuti | €4,13 | €56,48 | €90,45 |
| CAC assunto | €25,00 | €12,00 | €5,00 |
| Preparazione ammortizzata | €33,33 | €8,33 | €3,33 |
| Contributo dopo CAC e preparazione | **−€54,20** | **€36,15** | **€82,12** |
| Rapporto contributo/ricavo realizzato | −76,2% | 38,4% | 70,4% |

L'ammortamento della preparazione avviene rispettivamente su una, tre e sei coorti. Non è un ricavo acquisito: in assenza delle coorti future il materiale va imputato a meno iscritti. Con gli input centrali, il prezzo netto che pareggia queste voci è circa €59,71; con quelli pessimistici sale a €141,30. Non sono prezzi raccomandati: mostrano quanto il risultato dipenda da occupazione, riuso e tempo umano.

Questi contributi non sono utile netto aziendale: restano sviluppo della piattaforma, costi fissi non allocati, amministrazione, fiscalità diretta e rischio. Il modello valuta separatamente il lavoro docente per evitare che “tempo gratis del fondatore” nasconda perdite. La conclusione economica principale è che **ridurre dieci minuti di supporto o correzione per studente può contare più di ottimizzare qualche centesimo di inferenza**; questa è aritmetica sugli input, non una misura di Ardesia.

### Costi AI da registrare prima di decidere il prezzo

Per ogni operazione registrare quantità, tariffa effettiva del provider alla data e durata di revisione umana. Formula: costo trascrizione = minuti × tariffa; costo generazione = token input/output × relative tariffe; storage = GB-mese; streaming = traffico o minuti secondo il servizio. Separare authoring condiviso da servizio per singolo studente. Una trascrizione usata da otto iscritti si ripartisce; otto sessioni individuali no. Un contenuto generato e poi scartato resta un costo.

Prima del pilot non serve attivare un nuovo provider. Se non si autorizza un budget, usare pipeline locale o fixture etichettata. Evitare prezzi “AI illimitata” e automatismi che generano nuove attività a ogni tentativo senza limiti osservabili.

### Metriche commerciali per decidere

Contatto qualificato → prova completata → richiesta di informazione → acquisto → frequenza → nuova coorte. I denominatori devono essere espliciti; visite e clic non sono iscritti. Misurare CAC come spesa attribuibile/acquirenti effettivi per canale, tenendo separata la clientela già acquisita. Misurare rimborso e assistenza oltre al margine.

Per il servizio tutor: minuti risparmiati per lezione, settimane di uso, studenti attivi, attività create e riutilizzate, ticket per tutor, costo onboarding, tutor che paga dopo l'assistenza iniziale. La creazione di un account non dimostra adozione; esportare una volta una dispensa non dimostra volontà di abbonarsi.

## 9. Dodici ipotesi avversariali e come decidere

| Ipotesi rischiosa | Perché sembra valida | Perché potrebbe fallire / prova disponibile | Costo dell'errore | Alternativa e esperimento | Raccomandazione |
|---|---|---|---|---|---|
| 1. Un Teaching OS completo è la prima offerta vendibile | Raccoglie tutta la visione | L'utente deve capire troppe capacità prima di ottenere valore; nessuna prova di domanda unificata disponibile | Settimane di integrazione senza vendite | Vendere un risultato preciso e osservare uso del ciclo completo | Visione ampia, prima offerta stretta. |
| 2. Audio+lavagna ci rende unici | È intuitivo e dimostrabile | Goodnotes documenta già questa capacità [B7] | Posizionamento sostituibile | Testare tempo di recupero e azione didattica successiva rispetto al semplice replay | Differenziare la continuità e la correzione. |
| 3. Un errore identifica un prerequisito mancante | Sembra personalizzazione | Stessa risposta può nascere da svista, linguaggio o concetto; fonti pedagogiche non autorizzano diagnosi da singolo evento [P6][P9] | Percorsi sbagliati e sfiducia | Chiedere una controprova breve e mostrare il motivo della proposta | Memoria di evidenze, ipotesi rivedibili. |
| 4. Quattromila domande equivalgono a un corso completo | Aumentano copertura apparente | Pathways dichiara composizione editoriale e revisione non attestata; quantità non prova sequenza né qualità | Revisione enorme, contenuti errati pubblicati | Campione per famiglia e revisione dei soli moduli destinati al pilot | Misurare esperienze complete e pubblicabili. |
| 5. Il tutor esterno vuole fare authoring complesso | Amplia l'offerta senza creare tutto internamente | Non esiste in questa analisi prova di onboarding autonomo | Supporto e abbandono | Due tutor creano una singola esperienza partendo da un loro PDF, cronometrare gli interventi | Template piccoli e percorso assistito. |
| 6. Il marketplace deve arrivare subito | Sembra scalabilità | Senza distribuzione e fiducia aggiunge pagamenti, dispute e moderazione | Costi operativi prima dei ricavi | Vendita diretta iniziale; marketplace solo se i tutor chiedono distribuzione e portano cataloghi validati | Rinviare. |
| 7. Ogni concetto merita una simulazione | Esperienza visiva più appetibile | Alcuni obiettivi richiedono ragionamento simbolico; multimedia può sovraccaricare [P8] | Authoring lento e attenzione dispersa | Confrontare esempio statico e interattivo sul medesimo trasferimento | Interazione solo dove cambia la comprensione. |
| 8. Feedback AI live riduce automaticamente i costi | Riduce latenza apparente | Errori, review e assistenza possono cancellare il risparmio; AGENTS mantiene ZERO-LLM in prodotto | Danni didattici e costi variabili | Authoring esterno revisionato, verificatori deterministici, proposta al docente | Tenere l'AI fuori dalla decisione autorevole finché non misurata. |
| 9. Più automazione equivale a più autonomia | Riduce i clic | Può togliere allo studente scelta e riflessione [P9] | Dipendenza da suggerimenti | Permettere di rifiutare il percorso e motivare la scelta | Suggerimenti spiegabili e tutor correggibile. |
| 10. Rifare la lavagna produce qualità rapidamente | Elimina i compromessi storici | Rischio migrazione input, documenti e replay; nessun benchmark in questa ricerca prova necessità | Perdita di stabilità e giorni del pilot | Misurare una lentezza o gesto preciso e correggere il collo di bottiglia | Sostituzione solo con confronto riproducibile. |
| 11. Completamento e tempo nella pagina misurano apprendimento | Sono facili da registrare | Possono crescere con confusione o click casuali; recupero differito è diverso da familiarità [P3] | Ottimizzazione della metrica sbagliata | Problema nuovo senza aiuti e spiegazione del vincolo | Separare engagement, prestazione e ritenzione. |
| 12. Documentare ogni idea salva il progetto | Riduce perdita di contesto | Canoni paralleli possono divergere; un dossier senza software non chiude il percorso | Agenti impegnati a conciliare documenti | Un documento autorevole per tema, stato generato e prove collegate | Integrare questo report nei canoni; non moltiplicarli. |

## 10. Cosa rendere dimostrabile e cosa escludere dalle promesse

### Entro il 26 ottobre — candidato al gate marketing

Una pagina professionale con un problema leggibile; laboratorio funzionante su desktop e smartphone; previsione prima del risultato; contesto audio/oggetto dimostrato senza ambiguità sulla fixture; una sequenza errore–recupero–nuova prova; anteprima tutor basata sulle stesse evidenze; contatto o richiesta realmente funzionante; limiti sintetici in pagina. Raccogliere screenshot e traccia del percorso, verificando il link pubblico da un contesto senza privilegi.

Una demo prerenderizzata di audio non chiude la cattura reale. Un salvataggio locale non chiude la continuità fra dispositivi. Un API test verde non chiude l'onboarding. Il lavoro root sulla cattura e lifecycle va riportato con stato e limiti propri.

### Entro il 2 novembre — perimetro beta da sottoporre a gate

Un tutor, una coorte invitata, un CoursePack approvato, un laboratorio, sessioni conservate, una fonte audio/visiva autorizzata, materiale derivato revisionato, consegna, feedback docente, nuova prova, accessi isolati, export e recovery. MCP deve leggere e proporre scritture sugli stessi oggetti e permessi, con rilettura dell'esito.

Esclusioni raccomandate: marketplace aperto; promessa di copertura integrale di tutte le materie; riconoscimento semantico automatico affidabile di ogni tratto; adattività clinicamente o psicometricamente calibrata; correzione universale autonoma; nuova app nativa completa; compatibilità di scrittura con ogni host MCP senza prove. Queste sono capacità future con contratti e esperimenti, non pulsanti disabilitati da mettere nella demo.

## 11. Fonti consultate

### Ricerca scientifica

- **[P1]** Sweller, J.; Cooper, G. A. (1985). *The Use of Worked Examples as a Substitute for Problem Solving in Learning Algebra*. Cognition and Instruction 2(1), 59–89. [Editore e DOI](https://www.tandfonline.com/doi/abs/10.1207/s1532690xci0201_3). Metadati consultati; full text dell'editore non recuperato.
- **[P2]** Salden, R. J. C. M.; Aleven, V.; Schwonke, R.; Renkl, A. (2010). *The expertise reversal effect and worked examples in tutored problem solving*. Instructional Science 38, 289–307. [Editore](https://link.springer.com/article/10.1007/s11251-009-9107-8). Abstract consultato.
- **[P3]** Roediger, H. L.; Karpicke, J. D. (2006). *Test-Enhanced Learning: Taking Memory Tests Improves Long-Term Retention*. Psychological Science 17(3), 249–255. [Associazione/editore](https://www.psychologicalscience.org/journals/psychological-science/j.1467-9280.2006.01693.x/), [DOI](https://doi.org/10.1111/j.1467-9280.2006.01693.x).
- **[P4]** Cepeda, N. J. et al. (2006). *Distributed practice in verbal recall tasks: A review and quantitative synthesis*. Psychological Bulletin 132(3), 354–380. [APA/DOI](https://doi.org/10.1037/0033-2909.132.3.354), [repository istituzionale autori](https://digitalcommons.usf.edu/psy_facpub/1771/).
- **[P5]** Freeman, S. et al. (2014). *Active learning increases student performance in science, engineering, and mathematics*. PNAS 111(23), 8410–8415. [Editore](https://doi.org/10.1073/pnas.1319030111), [full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC4060654/).
- **[P6]** Wisniewski, B.; Zierer, K.; Hattie, J. (2020). *The Power of Feedback Revisited: A Meta-Analysis of Educational Feedback Research*. Frontiers in Psychology 10:3087. [Full text dell'editore](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.03087/full).
- **[P7]** Belland, B. R.; Walker, A. E.; Kim, N. J.; Lefler, M. (2017; online 2016). *Synthesizing Results From Empirical Research on Computer-Based Scaffolding in STEM Education: A Meta-Analysis*. Review of Educational Research 87(2), 309–344. [Full text dell'editore](https://journals.sagepub.com/doi/10.3102/0034654316670999).
- **[P8]** Mayer, R. E.; Moreno, R. (2003; pagina online 2010). *Nine Ways to Reduce Cognitive Load in Multimedia Learning*. Educational Psychologist 38(1), 43–52. [Editore](https://www.tandfonline.com/doi/abs/10.1207/S15326985EP3801_6). Abstract consultato.
- **[P9]** Panadero, E. (2017). *A Review of Self-regulated Learning: Six Models and Four Directions for Research*. Frontiers in Psychology 8:422. [Full text dell'editore](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2017.00422/full).

### Prodotti e attività

- **[B1]** Brilliant, [Scientific Thinking: programma e sequenza](https://brilliant.org/courses/puzzle-science/structures/). Non è stato eseguito un account a pagamento.
- **[B2]** Desmos, [Function Carnival nella rassegna ufficiale](https://blog.desmos.com/page/47/) e [Activity Builder Community](https://blog.desmos.com/articles/the-desmos-activity-builder-community/). Descrizioni storiche dei compiti, non attestazione della distribuzione attuale del servizio Classroom.
- **[B3]** Donald Duncan, GeoGebra, [The Definition of the Derivative](https://www.geogebra.org/m/WGCsKBeM). È un'attività dell'autore sulla piattaforma, non una dichiarazione ufficiale di efficacia di GeoGebra.
- **[B4]** PhET, [Circuit Construction Kit: DC](https://phet.colorado.edu/en/simulations/circuit-construction-kit-dc?locale=en).
- **[B5]** Numbas, [adaptive marking: rationale](https://www.numbas.org.uk/behind-the-design/adaptive-marking.html), [riferimento operativo](https://docs.numbas.org.uk/en/heads/queues/question/parts/reference.html). La prima pagina è dichiarata “Outline”; le funzionalità sono confermate nel riferimento operativo.
- **[B6]** STACK, [Authoring quick start 1](https://docs.stack-assessment.org/en/AbInitio/Authoring_quick_start_1/) e [Potential response trees](https://docs.stack-assessment.org/en/Authoring/Potential_response_trees/).
- **[B7]** Goodnotes, [Add Audio Recordings to your documents](https://support.goodnotes.com/hc/en-us/articles/7352688559631-Add-Audio-Recordings-to-your-documents).
- **[B8]** Khan Academy, [Mastery](https://support.khanacademy.org/hc/en-us/articles/360007253831-Using-self-paced-practice-and-Mastery-in-the-classroom) e [Progress](https://support.khanacademy.org/hc/en-us/articles/360032987591).

### Accessibilità

- **[A1]** W3C WAI, [Understanding WCAG 2.2 SC 2.5.8 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- **[A2]** W3C WAI, [Understanding WCAG 2.2 SC 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions).

### Prove locali consultate

Alla baseline `339ab08f4139da0b37e78bbde81e9fe4e83afea0`: `apps/web/src/components/PhysicsLab.tsx`; `apps/web/src/features/Classroom.tsx`; `apps/web/src/features/Public.tsx`; `apps/web/src/components/PhysicsPathways.tsx`; `apps/web/src/styles.css`; `packages/engine/lessonos/study/curriculum_pathways.py`. Registro CoursePack, contenuto fluidi e valutatore sono stati letti inizialmente a `57c492af2bc391652f8c243107cfe8f00a22820d`; un confronto binario successivo ha confermato che `coursepack.py`, `catalog.py`, `activities.py` e `content/relazioni-fluidi-v1.json` sono identici nella baseline nuova. La ricerca pedagogica e di mercato non misura apprendimento o conversioni. I successivi test UI di questa consegna sono documentati separatamente in validation.md e in evidence/replay-browser; non trasformano i benchmark documentali in collaudi dei prodotti concorrenti.
