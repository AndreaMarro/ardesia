# Revisione avversariale del lavoro recente su Ardesia

**Data:** 24 ottobre 2026. **Base applicativa:** [#290](https://github.com/AndreaMarro/ardesia/pull/290), `339ab08f4139da0b37e78bbde81e9fe4e83afea0`. **Incremento:** `pro/ardesia-living-lesson-audio-20261024`. **Stato:** review indipendente con correzioni e prove locali; nessuna decisione di rilascio.

Il titolo segue il mandato. La review valuta gli artefatti attribuiti alla linea di lavoro GPT-6.1 e agli altri agenti, non presume di poter attribuire ogni commit a un modello specifico. I difetti audio #292/#294 erano già stati segnalati: qui vengono riprodotti e corretti. Il mismatch del replay, il confine Excalidraw/journal e l'ultimo istante irraggiungibile sono ulteriori risultati verificati della sessione.

## 1. Panoramica del lavoro individuato

Lo stack #268–290 include Core/Study, CoursePack, quantità, esame, review scientifica, percorsi, runner e marketing. Le PR #291/#293/#295 sono audit/RFC, #296 è un indice editoriale. Main osservato resta `b124eee04acc8062c27284f23c5d9108e3767c27`. Una PR verde contro la propria base non equivale a un prodotto integrato in main.

L'[audit architetturale](../deliveries/2026-10-24-convergence/architecture-report.md) contiene cronologia e inventario, con i pin esatti nel JSON delle evidenze. La [consegna](../deliveries/2026-10-24-convergence/README.md) collega decisioni, test e prossimi gate. Non riscrivo qui la RFC MCP #293 o gli audit precedenti.

## 2. Elementi ben progettati da preservare

Il modular monolith e i confini provider dell'ADR-0004 sono adeguati alla fase del prodotto. CoursePack versionati, quantità derivate, autorizzazioni server-side, revisione scientifica separata dalla pubblicazione e runner su API reale sono progressi concreti. Il diario e la revisione delle consegne esistono: sostituirli con un nuovo sistema sarebbe un costo evitabile. PhysicsLab contiene già il modello di Poiseuille; non va riscritto nella landing.

Anche l'estetica corrente ha valore: tipografia e superfici coerenti, esempi progressivi e un invito all'azione semplice. La critica è al collegamento fra parti e alla promessa risultante, non un motivo per scartare tutto il lavoro.

## 3. Errori tecnici riprodotti e corretti

| Difetto nella base | Conseguenza osservabile | Correzione e prova |
| --- | --- | --- |
| Stop audio non attende l'ultimo evento nativo e la coda completa | Clip breve persa o salvataggio annunciato troppo presto | Lifecycle per take, drain dopo stop nativo; 12 nuove regressioni inizialmente RED e prova Chromium nativa |
| `getUserMedia` può risolversi dopo revoca/stop/dispose | Stream tardivo avvia o mantiene una registrazione non più richiesta | Generazioni, rilascio stream tardivo, coalescenza start e attesa purge |
| Scritture del consenso fuori ordine | Un vecchio ON può superare un OFF più recente | Coda di snapshot serializzata, test con storage bloccato |
| Errori bytes/marker non osservabili | Falso successo della chiusura | `lastError`, stop rejection e attesa del marker anche asincrono; review indipendente |
| ReplayView carica journal flat, Room scrive quello scoped | Timeline vuota o lezione legacy attribuita alla room scelta | Room esplicita al loader, decoder vincolato alla fonte, nessun fallback globale |
| Titolo/errore/media conservati durante cambio room | Stato della lezione precedente visibile nella successiva | Risultato legato a workspace/room e ownership dell'object URL |
| Excalidraw emette proprietà opzionali `undefined` | Disegno reale interrompe la pagina al validator v2 | Snapshot al confine producer: omissione mirata, altri valori invalidi preservati per il rifiuto |
| Range replay a passi di 100 ms | L'ultimo update può essere irraggiungibile e lasciare il testo vuoto | Precisione di 1 ms e regressione del caso con estremo non multiplo di 100 |

Il validator canonico non è stato indebolito. La normalizzazione non usa una serializzazione lossy che trasformi valori invalidi o esegua getter. Non sono state aggiunte dipendenze. Vedere [validazione e log](../deliveries/2026-10-24-convergence/validation.md) per conteggi e limiti; i test dei singoli gruppi non vanno sommati come se fossero suite disgiunte.

## 4. Errori e rischi di prodotto: le cinque decisioni peggiori

| Decisione / assunzione da contestare | Classificazione | Perché costa | Alternativa concreta |
| --- | --- | --- | --- |
| Far coincidere la promessa con catalogo e preparazione test | RISCHIOSA | Rende Ardesia sostituibile e nasconde il contesto della lezione | Vendere un risultato stretto, dimostrare continuità fonte→errore→nuova prova |
| Misurare avanzamento con quantità di quesiti/target/menu | ERRATA se usata come qualità | La revisione e l'integrazione crescono, senza prova di utilità | Misurare esperienze complete, corrette, raggiungibili e riutilizzate |
| Trattare primitivi testati come funzioni disponibili | ERRATA, ora confutata | Audio non montato e replay sbagliato sopravvivono ai test isolati | Percorso browser reale sullo stesso candidato e schema del producer |
| Prolungare stack aperto e canoni incompatibili | RISCHIOSA | Ogni agente ricostruisce contesto e attribuisce prove allo SHA sbagliato | Candidato unico, registro di dipendenze, stato generato, archivio datato |
| Aggiungere un nuovo Core/CRM/CorrectionDraft o rifare la lavagna | RIDONDANTE/PREMATURA | Migrazioni, doppie autorizzazioni e regressioni consumano la finestra beta | Completare consumer e porte dei servizi esistenti; riscrivere solo un confine misurato |

Il catalogo non è in sé sbagliato, né una nuova superficie è sempre vietata. Il criterio è se riduce il lavoro reale e condivide gli stessi oggetti e permessi. Nessuna preferenza estetica giustifica una seconda fonte di verità.

## 5. Le cinque opportunità maggiori

| Opportunità | Impatto atteso | Costo/fattibilità relativi | Prova che decide |
| --- | --- | --- | --- |
| Ritornare al passaggio preciso della lezione | Alto per docente e studente | Medio: journal/replay esistono, ponte media manca | Riapertura e ricerca del passaggio, round-trip e tempo di recupero |
| Errore revisionato→recupero→trasferimento | Alto e più distintivo del quiz | Medio: diario e attività Core già presenti | Prova nuova senza aiuti e spiegazione del vincolo |
| Authoring di esperienze a partire dalle proprie fonti | Alto sul costo di contenuto | Medio: compositore piccolo e riferimenti versionati | Seconda esperienza realizzata da un tutor, minuti e interventi di supporto |
| Coda docente unificata e registro operativo | Alto sul valore quotidiano | Basso/medio: servizi amministrativi esistono | Tempo risparmiato su preparazione, correzione e follow-up |
| MCP su comandi esistenti e capability specialistiche | Alto come canale e portabilità | Medio/alto: write/auth/host da completare | Private draft, review exact digest, negazioni e rilettura in un host reale |

Sono stime qualitative di priorità, non promesse di ROI. REA aiuta le prove di un confine opaco; non sostituisce la decisione didattica né la responsabilità del dominio.

## 6. Coerenza con la visione

Il patrimonio Teaching OS rimane nei canoni, journal, sessioni, bundle, LessonOS e plugin. È la sua raggiungibilità nel percorso quotidiano a essere insufficiente. L'audio contestuale non è solo “poco visibile”: nella base esaminata non è collegato alla Room e v2 lo rifiuta. Questo cambia la stima: serve un ponte contrattuale, non aggiungere un pulsante.

La visione va formulata per l'utente: “ritrovi il passaggio, provi il concetto, correggi l'errore e riparti da lì”. È un obiettivo da provare. Non dichiarare che Ardesia capisce semanticamente un “questo” del docente solo perché gli eventi hanno tempi vicini.

## 7. Problemi UX

Le superfici marketing, Studio, Study e tutor non dimostrano ancora un percorso unico completo. Il replay è verificato tramite deep link; questa prova non dimostra che un nuovo utente scopra un comando Replay. L'audio non ha un flusso di cattura v2 disponibile. Il test mobile trova il controllo per tornare al contenuto, ma richiede un gesto aggiuntivo e non equivale a fit automatico dell'intera scena.

Priorità: una scheda “Riprendi da qui”, stato di registrazione inequivoco quando integrata, errori recuperabili, correzione con fonte a fianco, nuova prova accessibile. Nessun menu generalista di plugin deve interrompere lo studente nel momento dell'errore.

## 8. Problemi grafici e motion

Conservare carta/inchiostro e token esistenti. Uniformare gerarchia, controlli e stati fra le superfici; il problema più grave non è il colore della landing. Il laboratorio deve animare la quantità coerente con il vincolo: a portata fissata non rappresentare sedici volte più flusso. Riduzione movimento, tastiera e alternative testuali fanno parte del componente.

Il build Studio segnala chunk grandi; non lo nascondiamo alzando la soglia. Il browser di prova ha errori di caricamento font da CDN esterno; sono registrati come limite ambientale e dipendenza da rendere riproducibile, non cancellati per ottenere una console apparentemente pulita. Prima di una promessa mobile commerciale occorre completare il fit/navigazione della scena e la verifica dei font nel contesto supportato.

## 9. Scalabilità

La scala iniziale è tutor/coorte/corso, non traffico planetario. I rischi immediati sono autorizzazioni coerenti fra superfici, concorrenza sulle revisioni, dimensioni degli asset, storage della lezione e costi umani. Il server MCP locale con cookie per processo non è un backend condiviso multiutente. La modalità `synthetic_only` non certifica un esercizio remoto con studenti reali.

Un nuovo graph database, microservizi o una riscrittura Rust non sono giustificati dalle misure presenti. Misurare il collo di bottiglia prima, poi sostituire un confine se il costo complessivo scende.

## 10. Debito tecnico prioritario

P0 per il ciclo multimodale: sessione audio scoped, schema v2, replay di registrazioni multiple, bundle/import e revoca. P0 per la beta remota: candidato integrato e prove di identità/isolamento sul backend effettivo. P1: candidate revision/digest nella review, private MCP write e authoring guidato. P2: duplicazioni di superfici, peso del bundle, disponibilità font e archivi documentali.

Il [registro dettagliato](../deliveries/2026-10-24-convergence/architecture-report.md#7-debito-prioritario-e-riparazione) distingue riuso e nuovo lavoro. Il rischio documentale si riduce con addenda ai canoni storici e collegamenti, non copiando tutti i rapporti in ogni repository.

## 11. Sicurezza e affidabilità

La perdita del chunk finale è affidabilità; il permesso tardivo dopo revoca e il consenso fuori ordine incidono sul controllo della cattura. Il replay di un journal globale non è una prova di isolamento. Gli errori sono riprodotti con dati sintetici e corretti senza accedere a voci o consegne reali.

Le autorizzazioni MCP vanno rifatte nel Core a ogni chiamata. `actorId`, ruolo o istruzioni estratte da un PDF/foto non sono autorità. Il rilascio di feedback deve vincolare la candidata effettivamente vista dal docente. Gli asset privati e i volumi restano fuori dal repository pubblico. Non dichiariamo conformità legale o sicurezza complessiva sulla base di queste regressioni.

## 12. Alternative concrete e classificazione delle decisioni

| Scelta | Verdetto |
| --- | --- |
| Core e provider indipendenti | CONFERMATA |
| Catalogo/CoursePack e gate scientifici | CONFERMATA, consumer da completare |
| Quattro read MCP con output limitato | CONFERMATA nel perimetro locale |
| Audio legacy senza consumer v2 | DA MIGLIORARE, ponte necessario |
| Loader flat nella vista room | ERRATA, corretto |
| Documento di giugno come routing sorgente attuale | DA SOSTITUIRE come istruzione; preservato come storia |
| Secondo sistema di correzione/CRM | RIDONDANTE |
| Marketplace aperto o nuova app nativa nella beta di nove giorni | PREMATURA |
| Setup REA come prova di ricostruzione completa | ERRATA |
| Compatibilità con tutti gli host o redditività dei corsi | ANCORA NON VERIFICABILE |

## 13. Effetto sui costi

Le correzioni usano dipendenze già presenti e riducono rischio di perdita, supporto e diagnosi ripetute; non quantifichiamo un risparmio non misurato. Il costo del prossimo incremento deriva soprattutto dal ponte fra formati, sessioni e consumer, non dalla trascrizione in sé. REA ha costi di setup e triage da includere; i millisecondi di parsing non misurano produttività dello sviluppatore.

Gli [scenari economici](../deliveries/2026-10-24-convergence/product-pedagogy-economics.md#8-modello-economico-e-prezzi-da-sperimentare) includono lavoro docente, correzione, assistenza, preparazione, acquisizione e tecnica. Non imputare tempo gratuito al fondatore per far apparire positivo il margine.

## 14. Impatto sui ricavi

La prima vendita deve promettere un risultato e un servizio circoscritti. Un'esperienza migliore può migliorare conversione, frequenza o riacquisto, ma nessuna di queste variazioni è misurata qui. Il vantaggio commerciale potenziale è aumentare il valore del lavoro del tutor e ridurre il costo di seguire ciascuno studente; non vendere accesso a un numero di quiz come se fosse un risultato formativo.

La domanda di tutor esterni resta un'ipotesi. Prima di un marketplace servono due tutor che creino e riutilizzino un'esperienza con supporto misurato. Prezzi e margini del report sono input di scenario, non domanda validata né utile netto.

## 15. Raccomandazione finale

Convergere sul sistema esistente e chiudere un episodio di apprendimento completo. Conservare il lavoro valido su Core, gate, catalogo e design. Usare il nuovo incremento per rendere nuovamente affidabile la lezione persistente, poi integrare media e diario. Non spostare il progetto su una nuova architettura per evitare di affrontare i collegamenti mancanti.

Il 26 ottobre è un gate di dimostrabilità, non una data che rende vere capacità assenti. Il 2 novembre può essere una beta invitata stretta solo dopo prove sul candidato unico. Una preview statica e una classe audio testata non bastano a chiamarla beta multimodale.

## 16. Riferimenti e prove

- [Base #290](https://github.com/AndreaMarro/ardesia/pull/290); [audit #291](https://github.com/AndreaMarro/ardesia/pull/291); [MCP reuse #293](https://github.com/AndreaMarro/ardesia/pull/293); [audio race #295](https://github.com/AndreaMarro/ardesia/pull/295).
- [Issue audio tail #292](https://github.com/AndreaMarro/ardesia/issues/292); [issue permesso tardivo #294](https://github.com/AndreaMarro/ardesia/issues/294).
- Sorgenti modificati: `apps/studio/src/store/AudioRecorder.ts`, `JournalRecorder.ts`, `replayTimeline.ts`, `apps/studio/src/ReplayView.tsx`; regressioni nello stesso package.
- [Validazione](../deliveries/2026-10-24-convergence/validation.md): suite Studio completa, typecheck/build, Chromium audio nativo, browser A/B, REA e limiti.
- [Rapporto REA](../deliveries/2026-10-24-convergence/rea-research.md): fonti primarie, ArtCraft e licenze; [rapporto pedagogico](../deliveries/2026-10-24-convergence/product-pedagogy-economics.md): fonti e benchmark, con limiti metodologici espliciti.

## 17. Priorità delle modifiche

1. Completare revisione e verifica del delta applicativo su questo branch; nessuna modifica concorrente agli stessi file senza coordinamento.
2. AUDIO-V2: identità sessione, media e schema, round-trip e revoca. Riutilizzare le prove native; non simulare il successo del consumer.
3. Episodio fluidi con errore, recupero e nuova prova alimentato dal Core esistente.
4. Private revision e binding del digest, poi primo host MCP nominato.
5. Prova tutor/coorte, misure di utilità e costo; solo dopo ampliare offerta e automazione.

## 18. Decisioni umane ancora aperte

Ratificare la promessa commerciale e il perimetro della beta; selezionare il candidato da integrare; approvare contenuti scientifici effettivi e il supporto offerto; decidere se e come cambiare la policy di inferenza nel runtime; autorizzare eventuali costi provider, uso di dati reali, merge e rilascio. Queste decisioni non impediscono sviluppo sintetico e draft PR già autorizzati dal mandato e non sono una richiesta di conferma preventiva per il lavoro consegnato.
