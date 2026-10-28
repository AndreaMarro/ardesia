# ARDESIA — Specifica integrale ricostruita, visione completa e stato verificabile
**Data della ricostruzione:** 28 ottobre 2026 (Europe/Rome)
**Repository canonico:** [AndreaMarro/ardesia](https://github.com/AndreaMarro/ardesia)
**Ultimo `main` verificato durante la ricognizione:** `e857954847c56cd425753632f84cfaedde54239e` (merge #332, 28 ottobre).
**Tipo:** ricostruzione documentale, non dichiarazione di completezza né autorizzazione al rilascio.

## 0. Regole di lettura, fonti e affidabilità

Questo testo ricompone il PRD del 13 luglio 2026, le decisioni e conversazioni recuperabili dal giugno all'ottobre 2026, i canoni del repository, le specifiche V4/V4.1, la matrice dei quattro corsi, il dossier decisionale del 28 ottobre e PR/branch GitHub osservati. **Non può dimostrare di aver letto ogni singolo messaggio di tutte le conversazioni storiche, ogni file dei repository privati, né ogni riga di tutte le migliaia di file del repository.** Un requisito privo di riscontro viene identificato come proposta, non inventato. Le fonti più nuove prevalgono sulle vecchie **soltanto quando decidono esplicitamente il medesimo punto**.

Usare le seguenti etichette:
- **[VISIONE]** proprietà voluta per Ardesia pienamente sviluppata, senza implicare che esista nel prodotto di oggi.
- **[REQUISITO]** scelta funzionale o tecnica documentata e non smentita; esige prove d'accettazione.
- **[IMPLEMENTATO]** codice o funzionalità testata in uno scope identificabile. Può non essere disponibile su produzione.
- **[PR APERTA]** lavoro concreto su ramo non integrato in `main`.
- **[BOZZA]** contenuto o proposta non approvata scientificamente o non ancora verificata nel percorso.
- **[RINVIATO]** parte dell'orizzonte Ardesia ma esclusa dal primo rilascio.
- **[STORICO/SUPERATO]** soluzione o priorità precedente che non rappresenta la configurazione corrente.
- **[NON VERIFICATO]** non si possiede prova sufficientemente diretta.
- **[ESCLUSO]** vincolo negativo espresso e ancora applicabile.

Ogni stato di PR e deploy è una **fotografia**; non equivale allo stato futuro o alla presenza di una stessa versione in produzione. Un test verde riferito a un commit passato resta prova solo di quel commit. Una persona o un modello che dice «PASS» non è evidenza in assenza di manifest, log e verifica del comportamento reale. Nessun risultato tecnico certifica da solo efficacia dell'apprendimento, sostenibilità economica, licenza di terzi o accessibilità completa.

### Principali ancore documentali
- [Indice canonico](https://github.com/AndreaMarro/ardesia/blob/main/docs/CANON-INDEX.md), [Product Canon](https://github.com/AndreaMarro/ardesia/blob/main/docs/PRODUCT-CANON.md), [Architecture Canon](https://github.com/AndreaMarro/ardesia/blob/main/docs/ARCHITECTURE-CANON.md), [Plugin Marketplace Canon](https://github.com/AndreaMarro/ardesia/blob/main/docs/PLUGIN-MARKETPLACE-CANON.md).
- [Specifiche Ardesia V4 01–15](https://github.com/AndreaMarro/ardesia/tree/main/docs/ardesia-v4/specs), [ADR-0004](https://github.com/AndreaMarro/ardesia/blob/main/docs/adr/ADR-0004-study-core-and-provider-boundaries.md), [ADR-0006](https://github.com/AndreaMarro/ardesia/blob/main/docs/adr/ADR-0006-change-tolerance-and-growth.md).
- [Contratto Chiusura 1 del 28 ottobre](https://github.com/AndreaMarro/ardesia/blob/main/docs/ops/closure1-20261028/contract.md), [matrice 57 obiettivi Fluidi/Termo](https://github.com/AndreaMarro/ardesia/blob/main/docs/ops/closure1-20261028/coverage-matrix.md), [matrice quattro corsi](https://github.com/AndreaMarro/ardesia/blob/main/matrici/QUATTRO_CORSI.md), [report quattro corsi 25 ottobre](https://github.com/AndreaMarro/ardesia/blob/main/docs/ops/four-courses-2026-10-25/README.md).
- [Banca Fisica 4.000](https://github.com/AndreaMarro/ardesia/blob/main/packs/semestre-filtro-2026-27/README.md), [Study demo](https://github.com/AndreaMarro/ardesia/blob/main/docs/study/README.md), [convergenza ottobre](https://github.com/AndreaMarro/ardesia/blob/main/docs/deliveries/2026-10-24-convergence/README.md).
- **Documenti storici recuperati dalla Library dell'utente:** `ARDESIA-PRD-v2.0-EVIDENCE-FIRST-2026-07-13.md` (13 luglio, 2.470 righe), `Ardesia_documento_decisionale_2026-10-28.md` (28 ottobre, 609 righe, criteri D01–D68). Le tabelle integrali dei **116 requisiti identificati nel PRD storico** e dei **68 criteri di chiusura** sono conservate nelle appendici di questa ricostruzione. La loro presenza non li promuove automaticamente a implementazioni o priorità attuali.

## 1. Identità: che cos'è Ardesia

**[VISIONE] Ardesia è un unico ambiente educativo e creativo, local-first nella sua ambizione originaria, capace di accompagnare una persona mentre apprende, insegna, prende appunti, sperimenta, corregge, costruisce e distribuisce conoscenza.** Non è un quiz online con decorazioni, né un simulatore disciplinare, né una piattaforma di ricerca tutor con un chatbot sovrapposto, né un LMS frammentato in pagine senza continuità.

Il centro non è una schermata. È **la lezione e il lavoro che sopravvive alla lezione**: contenuti e fonti originali, intenzioni del docente, oggetti scientifici manipolati, ipotesi e tentativi, errori localizzati, correzioni, audio sincronizzato e passi successivi. Ogni oggetto rimane attribuito, versionato, recuperabile e riusabile. La stessa esperienza può cominciare da una lavagna, un corso, un PDF, una domanda, un post-it o un laboratorio e proseguire dallo stesso stato.

La differenziazione auspicata è la **composizione coerente** di cinque sistemi che il mercato spesso separa: ambiente visuale; pedagogia interattiva verificabile; memoria didattica e Knowledge Graph; plugin/Pack/workflow portabili; rete per condividere, offrire e scambiare contenuti, strumenti e competenze. La piattaforma deve restare realmente utile anche in assenza di AI generativa e non può sostituire il criterio scientifico del docente con un output probabilistico.

**[REQUISITO] Un solo prodotto logico.** Più applicazioni, pagine, bundle, provider e modalità sono ammissibili solamente se condividono il Core e le identità canoniche; non possono introdurre carriere dello studente, autorizzazioni, solver, quiz, memory store o calendari incompatibili. La visione universale del luglio 2026 resta distinta dal primo prodotto commerciale del 2026: **i quattro microcorsi Semestre Filtro sono un vertical di ingresso dentro Ardesia, non Ardesia nella sua totalità**.

### 1.1 Principi fondativi documentati
- Persona e proprietà degli artefatti prima del piano commerciale; identità ≠ ruolo ≠ entitlement ≠ ownership ≠ visibilità.
- Libertà di apprendere, insegnare e creare: la creatività locale non dipende dal possesso del ruolo docente.
- Core unico, strumenti a capacità limitate, separazione fra motore e contenuto, composizione invece di duplicazione.
- Il dato originario, la revisione, l'evento e la provenienza prevalgono su una sintesi AI.
- Il grafo e i report sono proiezioni ricostruibili, non autorità parallele.
- La conoscenza è dimostrata da ragionamenti, tentativi diversi, osservazioni e revisioni; non dal tempo in piattaforma o dal numero di click.
- UI semplice all'inizio e potente quando serve; controllo contestuale, non moltiplicazione di barre e dashboard.
- Portabilità, revoca, privacy, accessibilità, compatibilità e costi verificabili.
- Nessun claim di produzione, efficacia, sicurezza o licenza senza prove.

### 1.2 Confini espliciti
**[ESCLUSO]** Ardesia non si identifica con ELABTutor/eLab, Kirchhoff, Simulation Plugin, ExamForge, Exam Trainer, il bot di un provider AI o un singolo microcorso. Essi sono stati, o possono diventare, strumenti e verticali. **[DECISIONE 28/10] eLab deve essere rimosso dal prodotto e dalle dipendenze runtime attive, senza cancellare la storia né eliminare gli strumenti scientifici indipendenti**; la [PR #332](https://github.com/AndreaMarro/ardesia/pull/332) risulta integrata in `main`. L'antico rapporto «ELAB come primo Pack» è quindi *storico/superato*, non una parte da ripristinare inavvertitamente.

## 2. Persone, ruoli e tre modalità

**[VISIONE]** Ogni persona ha **un'unica identità**, una Library personale e un Knowledge Graph privato, mentre i ruoli dipendono dal contesto. I soggetti fondamentali sono: studente autonomo, studente iscritto a un corso, tutor/docente, creatore di strumenti e contenuti, facilitatore/organizzatore di gruppo; un amministratore può svolgere funzioni commerciali limitate. Organizzazioni, scuole e istituzioni sono una possibile evoluzione, **non il primo target commerciale**. Il tutor che svolge realmente lezioni è il primo soggetto operativo di prova; lo studente deve comunque potersi esercitare senza presenza costante del docente.

Modalità principali:
- **Study:** ingresso da corso, attività od «Oggi»; spiegazione, previsione, prova, correzione, ripasso, Diario, lavoro personale, Materiali, Knowledge.
- **Teach:** creazione e conduzione della lezione, Lavagna/Studio, citazioni e oggetti, materiali condivisi, compiti, correzioni, regia dell'edizione, calendario e follow-up.
- **Create:** configurazione, combinazione, creazione, test, esportazione e — in futuro — pubblicazione di plugin, Pack, workflow e lezioni riusabili.

**[REQUISITO]** Cambiare modalità non deve clonare una lezione né creare dati discordanti; un tutor può diventare studente, un allievo può creare un plugin locale, un creator può aprire il proprio quaderno. Per i corsi correnti i ruoli e l'appartenenza all'edizione vengono ricontrollati dal server. L'implementazione storica di `study_principals` con un ruolo globale non equivale ancora al modello ambizioso di `Organization` e `Membership` scoped: questa lacuna è riconosciuta nell'[ADR-0006](https://github.com/AndreaMarro/ardesia/blob/main/docs/adr/ADR-0006-change-tolerance-and-growth.md).

## 3. Esperienza e navigazione: una superficie comprensibile

**[VISIONE]** Il primo accesso a un workspace creativo deve poter mostrare il foglio/lavagna, non un «cockpit» di funzioni. Il primo accesso al microcorso deve poter mostrare la **prossima azione didattica**, senza obbligare a entrare nella lavagna generalista. Queste due regole non sono incompatibili: rappresentano ingressi contestuali allo stesso sistema.

Aree concettuali storiche: **Workspace**, **Knowledge**, **Library**, **Discover**. Superfici operative correnti: area pubblica, Corsi, Aula, Studio/Lezione, Materiali, il mio lavoro/Diario, regia tutor, eventuale area commerciale. La **Pagina Personale** non deve diventare obbligatoriamente la schermata iniziale. L'esperienza deve distinguere ciò che è pubblico, ciò che è privato e ciò che richiede iscrizione.

**[REQUISITI UX]**
- Gerarchia visiva dominata dalla spiegazione/attività oppure dal foglio attivo, non da più pannelli simultanei.
- Testi, gergo, menu e messaggi coerenti e in italiano curato: niente termini tecnici come CAS, event sourcing o `resourceId` nel percorso studente.
- Azione successiva chiara; i pulsanti sono veri, oppure marcati indisponibili e non camuffati da funzionalità.
- Stati vuoto, caricamento, salvataggio in corso, confermato, offline, errore, permesso negato, conflitto e recupero progettati, non schermate senza esito.
- Ricerca, anteprima e navigazione sulla fonte corretta, senza finestre invadenti o zoom imprevedibile.
- Responsive intenzionale per desktop, tablet/iPad, mobile e LIM; Pencil/penne reali come target di prova, non proprietà già certificata.
- Tastiera, focus e semantica accessibile; grafici alternativi tabellari/testuali; contrasto, reduced motion, touch; target di conformità **WCAG 2.2 AA**, non certificazione già ottenuta.
- Per la lezione interattiva i viewport espressamente richiesti dal dossier di chiusura includono **360/390, 820 e 1440 px**, e i browser target includono Chrome/Firefox, Safari e tablet.
- Nessuna dipendenza da modali stratificate, visita guidata, feed ornamentale, gamification arbitraria o installazione di un'app specifica per comprendere il compito.

### 3.1 Direzione visiva e i 36 PNG
**Aggiornamento della tracciabilità (28 ottobre):** i 36 PNG originali del 27 ottobre sono ora mappati nell'[Appendice D](#d-atlante-27-ottobre--collegamento-dei-36-modelli-visivi-alle-specifiche) con requisiti, stato ed acceptance test. L'**atlante HTML autonomo** consente di esaminare anche le miniature visuali. La loro presenza non equivale a implementazione.

Il dossier decisionale del 28 ottobre dichiara di avere ispezionato **36 immagini originali del 27 ottobre**. I riferimenti classificati includono Apple Books (tipografia e lettura), Goodnotes (penna/quaderno), Miro (oggetti e spazio), Obsidian (backlink/grafi), analytics evidenziali, UI premium e schermate di riferimento Ardesia. Il dossier propone una gerarchia editoriale sobria, una scena scientifica dominante e controlli locali. Questo testo **non dichiara un nuovo esame dei 36 binari**, né che le loro immagini siano già riprodotte fedelmente nel prodotto. Evitare copiatura pixel per pixel di interfacce protette e nuove palette/temi arbitrari. Il sistema grafico deve essere unificato fra Web, Studio, Corsi e laboratori, con tipografia, spazi, movimento e stati consistenti.

## 4. Workspace: Lavagna e Taccuino

**[VISIONE]** Due modi di leggere e modificare **gli stessi oggetti**, senza doppio archivio:
1. **Taccuino/Notebook:** pagine, sezioni, cronologia, scrittura a penna, import e annotazioni, organizzazione narrativa; una sensazione di quaderno reale e ordine nel tempo.
2. **Lavagna/Whiteboard:** canvas anche infinito, posizionamento spaziale, ink/shapes, formule, media, fonti, collegamenti e plugin vivi; libertà di insegnamento sincrono e riorganizzazione.

Una pagina delimitata e una vista infinita sono **presentazioni** selezionabili. I documenti o le viste possono essere distinti, ma condividono kernel, versioni, asset, eventi e riferimenti. È richiesta naturalezza d'uso paragonabile alla categoria Goodnotes/Miro nelle azioni pertinenti, **non** una pretesa di parity completa già raggiunta.

**[REQUISITI]** penna, gomma, evidenziatore, testo, forme, formule LaTeX/MathLive, inserimento di PDF, immagini e file, annotazioni ancorate alla fonte, livelli e autori, zoom/pan senza intrappolare touch, undo/redo semantico, gestione degli strati, selezione/movimento/ridimensionamento degli oggetti, collegamenti a concetti e revisione della sorgente. Salvataggio, chiusura e riapertura devono preservare identità e posizione. Export/import trasparente di contenuti ed eventuali perdite. La scrittura collaborativa non deve mescolare tratti o perdere la paternità; livelli/focus e ACL per autore sono soluzioni tecniche documentate, mentre una collaborazione live generale sincronizzata è **[RINVIATO/NON CERTIFICATO]**.

**[IMPLEMENTATO CON LIMITI]** Studio contiene Excalidraw, editor/strumenti contestuali, fonti, formule, layer, journal e primitive di file `.lesson`; il loro montaggio uniforme sul percorso remoto del corso non è stato certificato come completezza. Una funzione locale o un import manuale non costituisce una lavagna cloud multiutente pronta.

## 5. Post-it e oggetti vivi

Il modello originale di Ardesia considera ogni plugin sulla lavagna un **oggetto/post-it**, non un iframe o un'app autonoma nel pannello laterale. La specifica del luglio 2026 (`ARDESIA-PLUGIN-ON-PAPER-UX-SPEC`) definisce:
- identità stabile, posizione, dimensioni, selezione, serializzazione e legame a LessonOS;
- prossimità `far | near | active`: pochi comandi visibili da lontano, più controlli solo vicino/attivo;
- superficie `hidden | compact | normal | expanded`: adattamento alle dimensioni effettive con espansione sul foglio;
- stato prodotto distinto da installazione: `ready | preview | planned`;
- sub-post-it figli per manuale, equazioni, prove, suggerimenti, diagnosi, note e materiali, richiamabili senza sovraccaricare la pagina;
- contenuto e relazioni reali indipendenti dal layout; spostare una card non muta un problema o una topologia.

**[REQUISITO]** la card, la vista espansa e il lettore debbono riferirsi allo stesso oggetto e alla stessa versione. Le azioni disponibili dipendono dal contesto e dai diritti, non da un menu nascosto altrove. La possibilità di rendere un'istanza post-it, pannello, full-screen o embed è detta **polimorfismo delle superfici**; non implica clonare il suo stato.

## 6. Architettura LEGO: Core, plugin, Pack, workflow

**[VISIONE / REQUISITO ARCHITETTURALE]** l'estensibilità è un principio fondante e non va persa a favore di quattro pagine statiche.

| Livello | Che cosa possiede | Che cosa non deve possedere |
|---|---|---|
| **Ardesia Core** | identità, autorizzazioni, Lesson, eventi, risorse, versioni, memoria, regole, esportazioni, contratti | logica fisica di ogni laboratorio, pagamento del singolo plugin |
| **ToolHost/SDK** | package registry, verify/install, capability routing, mount, lifecycle, sandbox, limiti, audit, revoca | nuovo database didattico o autenticazione separata |
| **PluginPackage** | strumento con manifest, versione, capability dichiarate, licenza, bundle e provenienza | accesso implicito a dati di altri plugin |
| **PluginInstance** | istanza stateful con `instanceId`, configurazione, snapshot, viste e lifecycle | permessi non dichiarati, accesso diretto al database |
| **PluginLink** | relazione tipata fra due istanze o fonti | ownership automatica o trasferimento silenzioso di autorizzazioni |
| **Pack/CoursePack** | materia, metodo, programma, media, obiettivi, attività e rubriche versionati | solver duplicato, autenticazione, ledger privato |
| **Workflow / ComposableExperience** | sequenze e grafo di attività riutilizzabili con fasi e dipendenze | una seconda piattaforma educativa |
| **LessonOS / Resources** | contesto storico, provenienza, revisioni, tentativi e osservazioni | risultati scientifici inventati o scorciatoie al sistema dei diritti |

### 6.1 Lifecycle e sicurezza plugin
Percorso completo documentato: `install → verify → instantiate → mount → suspend → resume → clone → export → import → migrate → disable → uninstall → dispose`. Ogni passaggio ha condizioni, errore/rollback, evento, permessi e responsabilità. Gli oggetti devono mantenere `pluginId`, `instanceId`, package version, schema, owner/scope, stato serializzabile, provided/required capability, links, provenance. Il clone genera **nuova identità** e non duplica accidentalmente eventi, segreti o autorizzazioni.

Le capability dichiarano namespace, versione, input/output tipati, privilegi richiesti, costi, consenso, comportamento offline e audit. `graph.query` è una lettura limitata; `lesson.event.emit` e ogni scrittura devono passare un comando autorizzato. Vietato importare internals di altre istanze, accedere direttamente a storage privato, gestire token provider nel browser o elevare privilegi perché un oggetto è figlio visivo di un altro.

Sicurezza desiderata: manifest con schema stretto, hash e firma (storicamente ed25519), publisher e licenza, version compatibility, CSP/isolation, permission review per install e aggiornamento, kill switch fail-closed, limitazione risorse, revoca e rollback. **Non tutti questi passaggi sono provati nel prodotto**: i nuovi 16 modelli Fluidi/Termo risultano codice first-party nella PR #331, non prova di installazione autonoma di plugin firmati dallo store.

### 6.2 Creator ladder
Quattro livelli di creazione, sullo stesso formato:
1. **Configure:** cambiare parametri e preset di un oggetto esistente.
2. **Compose:** collegare elementi compatibili per formare una lezione o un workflow.
3. **No-code:** comporre input/output/eventi/interazioni con blocchi tipati.
4. **Code:** creare attraverso SDK, contratti, test, pacchetti firmati e licenze.

La creatività locale e l'uso di plugin non devono essere monopolio del ruolo docente. Il **marketplace commerciale** di distribuzione è un livello successivo, non il prerequisito dell'editor.

## 7. Lezione viva: modello pedagogico canonico

La lezione non è solo video/testo da leggere. **[REQUISITO]** deve poter preservare e collegare un percorso come:

`Obiettivo e prerequisiti → fonte e diagnosi → previsione motivata → manipolazione o esempio → confronto → spiegazione e procedura → annotazione e domande → attività autonoma → feedback su revisione esatta → nuovo esercizio/transfer → ripasso → lezione successiva`.

Due modalità didattiche storiche, documentate dal giugno 2026, sono **«Passo passo»** (lo studente costruisce) e **«Già montato»** (il docente mostra e fa interrogare una configurazione). Sono modalità applicabili ai plugin quando pertinenti, **non** due simulatori. Il docente può regolare la sequenza, le fonti, gli aiuti e la durata; lo studente non è spettatore obbligato.

La lezione deve distinguere quattro fatti:
- **partecipazione/interazione**: aver aperto o manipolato;
- **tentativo e risultato**: input, metodo, risposta, condizioni, assistenza;
- **feedback/verifica**: revisione docente o validatore dichiarato su una evidenza precisa;
- **trasferimento**: problema realmente diverso che prova il riuso del ragionamento.

Una risposta corretta dopo un aiuto non viene spacciata per prestazione indipendente; la risposta ripetuta identica non prova la risoluzione di un errore. Nessuna percentuale di «padronanza 92%» è legittima senza metodo calibrato.

La lezione deve essere **esportabile, riapribile, annotabile, modificabile in nuova revisione**, con referenti scientifici e allegati; un cambio editoriale non riscrive ciò che lo studente aveva visto. La pipeline editoriale seleziona materiale con fonti, esattezza, qualità linguistica, pedagogia, licenze, review e target. Il player pubblico non può importare una banca privata di chiavi di risposta.

## 8. LessonOS: cronologia semantica e memoria del metodo

**[VISIONE]** LessonOS è la dorsale della memoria delle lezioni, **non** un prodotto concorrente di Ardesia. La sequenza di eventi semantici conserva attori, contesto, risorse/versioni, intenti, azioni, tentativi, causation, ordine, idempotenza, media marker, feedback, origine ed eventuali rettifiche. Ogni mutazione durevole autorizzata dovrebbe emettere il proprio evento o ricevuta nel contratto Core.

**[REQUISITI]** event log append-only; snapshot, replay e cold reopen, tombstone e versioni, proiezioni rigenerabili, gestione duplicati, conflitti e retry, cancellazione/erasure governata, esportazione/importazione con integrità, differenza fra dato verificato e interpretazione AI. Movimenti transitori del mouse, animazioni frame-by-frame e rumore UI non devono essere registrati come eventi semantici dell'apprendimento.

**[IMPLEMENTATO IN SCOPE LIMITATI]** journal e replay in Studio, snapshot e Core Study con consegne/revisioni e learning events; diverse PR ottobre hanno integrato fonti viventi, marker/audio, ripresa e memoria privata. **[NON VERIFICATO]** copertura totale di un LessonOS universale offline/cloud coerente su ogni dispositivo, con registrazioni contestuali sempre immediatamente accessibili al normale studente.

## 9. Audio, media e Note Replay

**[VISIONE]** il docente insegna e scrive: la piattaforma può registrare audio previo consenso, legare momenti della spiegazione al disegno, alla pagina, alla formula, al plugin e alla fonte, e trasformare il risultato in una lezione riascoltabile. Lo studente può selezionare un punto del quaderno e recuperare **il passaggio giusto**, non una generica registrazione.

Requisiti: consenso attivo prima del microfono; stop e revoca robusti anche quando il browser restituisce permessi tardi; nessun audio catturato o riprodotto di nascosto; trascrizione correggibile e timecode per revisione esatta; play/pausa, seek, buffering, error/retry, fine audio, preview delle risorse e player accessibile senza autoplay. Sorgente originale, trascrizione, marker e versione devono restare coerenti. Se una registrazione non è disponibile, la UI deve dirlo; non deve fingere audio da una simulazione testuale.

L'audio **sintetico editoriale** (quattro clip brevi, una per corso, nel report 25 ottobre) non è registrazione del tutor e non prova un Note Replay completo. Gli interventi S17/S08/S20 hanno riparato recorder, marker, replay canonico e passaggi contestuali; non dimostrano cloud sync generale, ascolto umano né un media backend remoto pronto. La **FSA live** è stata dichiarata disabilitata nelle consegne di ottobre; non attribuirle capacità utilizzabile in produzione.

## 10. Knowledge, Library, fonti, grafo e memoria personale

**[VISIONE]** Knowledge e Library sono due **viste degli stessi fatti**, non copie indipendenti da gestire separatamente.
- **Library:** inbox, materiali, PDF, immagini, media, dispense, risorse del corso, appunti, elaborati, artefatti generati, versioni, license, autore, tag, argomento, ricerca, raccolte e aperture esatte.
- **Knowledge Graph:** concetti, prerequisiti, domande, assunti, errori, fonti, attività, tentativi, revisioni, oggetti e relazioni con eventi originali. È privato di default e diverso dal grafo pubblico Discover e dal grafo tecnico fra plugin.
- **Memoria didattica:** timeline e contesto riprendibili fra sessioni, senza fingere una conoscenza psicologica della persona.

Ogni nodo o arco deve rispondere «da quale fonte/evento e quale revisione deriva?», «chi l'ha verificato?», «cosa succede se la fonte viene revocata?». Una rettifica crea nuova versione; la provenienza non viene sovrascritta. Aprire un collegamento storico deve risolvere esattamente `(resourceId,revisionId)`; un aggiornamento della fonte non giustifica di aprire un head diverso. Se l'originale non è più accessibile, il grafo mostra il limite e oscura il contenuto.

La [PR #315](https://github.com/AndreaMarro/ardesia/pull/315), integrata in `main`, riguarda memoria privata e grafi persistenti Cytoscape; i registri S05 descrivono note, idee, ipotesi, osservazioni, rettifiche, collegamenti, ricerche, export/import JSON con verifiche. Si tratta di **memoria personale e collegamenti attestabili**, non di una mastery adattiva scientificamente convalidata o della prova di tutte le viste generaliste del PRD del luglio.

### 10.1 Diario degli errori come memoria attiva
Il Diario è **P0 della specifica V4** e deve continuare a esistere per lo stesso studente oltre la singola edizione del corso. Non è un voto né una lista di crocette. Il modello distingue:
- `ErrorObservation`: passaggio/fonte/tentativo/revisione, tipo e osservatore; AI può proporre ma non certificare.
- `ErrorThread`: nucleo personale di difficoltà confermate, aggregato senza confondere errori diversi.
- `FeedbackRevision`: spiegazione e rubrica ancorate alla versione; stati `PROPOSED_AI`, `CHECKED_IN_SCOPE`, `REVIEWED_BY_TUTOR` distinti.
- `TransferAttempt`: nuovo problema con ragionamento e parametri/contesto differenti.
- `DiaryProjection`: vista ricostruibile da eventi, **non** secondo database autorevole.

Tipi documentati: `misconception`, `model_selection`, `procedure`, `algebra`, `sign`, `units`, `arithmetic`, `reading_or_transcription`, `ambiguous_question`, `other`. Stati documentati: `CANDIDATE`, `OPEN`, `PRACTISING`, `VERIFIED_RESOLVED`, `RECURRED`, `DISMISSED`. Falso OCR, domanda ambigua, fonte ritirata, contestazione, nuovo errore e prova insufficiente richiedono transizioni esplicite, non cancellazioni silenziose.

**UI:** «Dove mi sono fermato», «Perché non funzionava», «Cosa provo adesso», «Cosa è cambiato», «Stato». Da `Oggi` o `Il mio lavoro`; solo casi e fonti autorizzati. **Tutor:** vede soltanto gli studenti assegnati e può costruire una prossima lezione su errori ricorrenti, evitando di rendere pubblici gli elaborati individuali. Nessun admin commerciale legge errori intimi/feedback/audio. Un tutor nuovo non eredita automaticamente la storia privata dei precedenti corsi dello studente.

## 11. Studio autonomo, assistenza e ripasso

**[REQUISITO]** Ardesia non deve dipendere dalla presenza del tutor. La persona può aprire una lezione, recuperare prerequisiti, manipolare, rispondere, chiedere indizi graduati, annotare, inviare o auto-verificare quando consentito, riprovare con problema nuovo, studiare errori e progredire nella sequenza. La regia docente rimane disponibile ma non monopolizza il percorso.

Funzioni documentate in filoni S06/S11 e V4: attività autonome versionate, progressivo reveal, retrieval practice, ripassi pianificati/FSRS laddove siano verificabili, percorso di recupero, learning insights, fonti richiamabili, filtri della banca e sintesi della lezione. **La proposta di ripasso non è una misura certificata della padronanza**; la qualità del contenuto è una condizione necessaria. L'AI può personalizzare se fonte e permessi lo consentono; esiste un percorso deterministico a provider spento.

Gli aiuti devono indicare se la soluzione è guidata e non cancellare la previsione iniziale. Tutte le azioni formative significative alimentano il contesto solo tramite eventi autorizzati e possono essere ritirate/rettificate quando la fonte cambia.

## 12. CoursePack, corsi, edizioni, catalogo e prova

**[REQUISITO]** Un **corso** descrive percorso, programma, lezioni, obiettivi, modelli di attività, prerequisiti e materiale. Un'**edizione** identifica gruppo, docente, studenti, date, stato di offerta e **revisione immutabile del corso scelto**. Una **lezione** è una parte versionata del corso; una **sessione** è un incontro/evento nel tempo. Una **consegna** contiene tentativi e revisioni dello studente; un **feedback** è un'altra revisione, con autoria e fonte. Non vanno confusi «corso disponibile», «edizione attiva», «lezione letta», «attività risolta» e «studente competente».

Il contratto Chiusura 1 riusa i veri oggetti `CoursePack`, `CourseRecord`, `CourseLesson` e `CoursePackRef`: identificazione per `pathId`, `packId`, `(packId,packVersion,packSha256)`; lezione con `lessonRef={id,version,sha256}`; obiettivi con `objectiveIds` canonici. I contenuti visibili al pubblico sono **proiezioni generate** della fonte canonica, non un secondo archivio editoriale aggiornato a mano. Anche la soluzione proposta rimane protetta se non è destinata allo studente.

**[REQUISITI]** Le revisioni storiche non si correggono in place: quando si aggiorna materiale che era già stato usato, le ricevute vecchie continuano a riferirsi alla versione esatta. I cambi di programma/materiale con significato didattico avanzano una revisione. Nessuna migrazione tacita di uno studente a esercizio o formulazione nuova. Anagrafiche, membership, scope e ACL vengono ricontrollati a ogni lettura e scrittura.

**Modello di corso** desiderato: programma → macroargomento → unità → microconcetto/obiettivo → lezione → attività/fasi → valutazione → recupero → transfer. Serve capacità di collegare contenuti a più corsi senza duplicare l'oggetto originario e senza inventare coperture ministeriali.

### 12.1 Il ciclo dell'edizione e delle iscrizioni

Le specifiche V4 descrivono due macchine a stati distinte e auditabili:
- **CourseEdition:** `DRAFT → COLLECTING_INTEREST → OFFERED → CONFIRMED → RUNNING → COMPLETED`, con sospensione, annullamento e riprogrammazione controllata.
- **Enrollment:** `INTERESTED → OFFER_SENT → HOLD → PAYMENT_PENDING → ENROLLED`, con stati di rinuncia/scadenza/refund da precisare rispetto all'infrastruttura di pagamento effettivamente adottata.

Tutor e studenti vedono disponibilità, capacità, scadenza dell'offerta, conferma esplicita di programma/date/prezzo, sessioni e materiali. L'undicesimo studente non può ricevere un posto a capienza 10; hold e conferma devono essere transazionali e idempotenti, con row lock, `offer_revision`, `managementRevision` e difesa dal riuso di preview superate. Un prezzo nella landing non vale come pagamento gestito. La cronologia delle offerte e delle ricevute non scompare quando cambia il calendario.

### 12.2 Corsi come unità del primo rilascio, ma non unica natura di Ardesia

**[DECISIONE OTTOBRE]** Prima offerta: **quattro microcorsi Fisica per il Semestre Filtro**, nello stesso ambiente Ardesia. Il corso è la prova commerciale/educativa della piattaforma; non deve cancellare lavagna, memoria, plugin, editor, gestione gruppi e percorso autonomo. Il singolo corso **Fluidi e termodinamica**, e in particolare il caso Poiseuille, costituisce la prima «Chiusura 1» profonda e riusabile; il mandato tecnico del 28 ottobre ne ha ampliato l'ambito **all'intero corso Fluidi e termodinamica**. Questo non equivale a sostenere che gli altri tre corsi siano già scientificamente accettati o che la demo Poiseuille esaurisca Fluidi/Termodinamica.

## 13. I quattro microcorsi: corpus, obiettivi e consistenza

**[MATRICE CANONICA DEL 25 OTTOBRE — STATO EDITORIALE DRAFT]** Le 200 competenze elencate sono **sotto-obiettivi editoriali derivati da 38 famiglie** del syllabus, non «200 obiettivi pubblicati dal MUR». La classificazione conserva sette unità generali del programma:
- U1: Introduzione ai metodi della fisica.
- U2: Meccanica.
- U3: Meccanica dei fluidi.
- U4: Onde meccaniche.
- U5: Termodinamica.
- U6: Elettricità e magnetismo.
- U7: Fisica delle radiazioni.

| Microcorso canonico | Unità | Sotto-obiettivi | Famiglie DRAFT | Lezioni nel percorso editoriale del 25/10 | Esempi pubblici in quella fotografia | Obiettivi accettati nella matrice |
|---|---|---:|---:|---:|---:|---:|
| **Strumenti e meccanica** | U1 + U2 | 52 | 9 | 11 | 2: molla, cinematica | 0 |
| **Fluidi e termodinamica** | U3 + U5 | 57 | 10 | 11 | 1: gas ideale; Poiseuille presente anche in vertical separati | 0 |
| **Elettricità e magnetismo** | U6 | 33 | 7 | 8 | 1: serie/parallelo | 0 |
| **Onde, ottica e radiazioni** | U4 + U7 | 58 | 12 | 13 | 1: onda armonica | 0 |
| **Totale** | U1–U7 | **200** | **38** | **43** | **5** | **0** |

La somma delle 43 lezioni comprende 38 nuclei/famiglie e 5 esempi distinti. Il materiale aveva 12 diagnostiche nuove, 200 prove finali in bozza, formulari per corso (8/9/7/7) e link di recupero. Gli esercizi qualitativi non potevano essere automaticamente spacciati per una valutazione completa; il report del 25 ottobre dichiara mancanza di review umana, calibrazione studenti, consegne canoniche in alcuni flussi e piena ripresa remota. Il materiale di 43 lezioni nella review privata non è la prova che 43 lezioni siano pubblicate integralmente o accettate.

**[REQUISITO SCIENTIFICO/EDITORIALE]** Ogni obiettivo deve avere: prerequisiti, spiegazione completa, fonte verificabile, almeno una rappresentazione significativa, esercizio diagnostico, pratica guidata, prova non banale, feedback localizzato, errore tipico e recupero, attività di trasferimento, versione immutabile e approvazione per quella revisione. Criteri «completo» e «mastered» vanno separati. Gli esempi e le simulazioni non devono semplificare falsamente le leggi fisiche per rendere la UI più spettacolare.

Il progetto cita fonti universitarie/ministeriali, esempi di appelli precedenti e un eserciziario Testbusters come **riferimenti per obiettivi, tipologie e livello**, non autorizzazione a riprodurre materiale, loghi, struttura confondibile con esame ufficiale o chiavi altrui. L'accesso diretto a un PDF ministeriale ha restituito 403 durante un precedente controllo: la matrice registra esplicitamente le fonti universitarie usate come controprova, senza attribuirsi una lettura impossibile. Il profilo storico 2025/26 e il programma 2026/27 rimangono distinti.

### 13.1 Completezza del corso Fluidi e termodinamica

La matrice «Chiusura 1» contiene **57 obiettivi con ID immutabili**: U3 include pressione/densità, Stevino, Pascal, Archimede, galleggiamento, barometro e manometri, continuità, Bernoulli, Venturi, fluidi ideali/reali, laminare/turbolento, Poiseuille e resistenze, capillarità, tensione superficiale e Laplace. U5 include stato, gas ideale, calore, capacità termiche, calorimetria, cambi di stato, trasmissione del calore, primo principio, lavoro e trasformazioni, macchine termiche/Carnot, secondo principio, entropia e irreversibilità nei confini effettivamente previsti dalla matrice. **Non si presume copertura completa di un'unità da un unico oggetto**: gas ideale non sostituisce termodinamica; Poiseuille non sostituisce fluidi; una scena Venturi ideale non modella tutte le stenosi biologiche.

L'evoluzione di ottobre deve essere letta come **filiera in corso**, non risultato pubblicato:
1. [#330 — MERGED](https://github.com/AndreaMarro/ardesia/pull/330): 57 obiettivi, fonti, mappa scientifica e contratti, con accettazione iniziale DRAFT.
2. [#334 — APERTA](https://github.com/AndreaMarro/ardesia/pull/334): dieci lezioni approfondite con fenomeno, ipotesi, derivazione, esempio, feedback e **57 rubriche/transfer**, humanApproval=false, 0/57 accettati; review AI e test limitati descritti.
3. [#335 — APERTA e dipendente da #334](https://github.com/AndreaMarro/ardesia/pull/335): 199 quesiti selezionati/controverificati dalla banca unica, 40 svolgimenti di 40 lawFamily differenti e **due simulazioni tematiche U3/U5** da 21 MC + 10 completamenti, 50 minuti. Non sono simulazioni dell'intero esame nazionale né una seconda banca.
4. [#331 — APERTA](https://github.com/AndreaMarro/ardesia/pull/331): sedici laboratori scientifici first-party con preset, modelli analitici, grafici 2D e scene Three.js quando utili; non installazione commerciale di plugin autonomi già certificata.
5. [#337 — APERTA e dipendente da #335/#331](https://github.com/AndreaMarro/ardesia/pull/337): controprova indipendente di 54 casi numerici sui sedici modelli, **45 obiettivi coinvolti**, non 45 obiettivi approvati; gap dichiarati su densità/forza su area diretta, barometro e microstati.
6. [#333 — APERTA](https://github.com/AndreaMarro/ardesia/pull/333): runtime remoto sintetico controllato con Supabase Auth/PostgreSQL/RLS/HTTPS, test locali ma senza collaudo hosted completo attestato.
7. [#336 — APERTA](https://github.com/AndreaMarro/ardesia/pull/336): raccordo di laboratori, player, risorse, evidenze, ripresa remota e authoring Studio, **dipendente da #331, #332, #333, #334, #335**; CI e browser sul candidato integrato restavano da chiudere al momento del controllo. Questo è lavoro esistente e concreto, **non** una funzionalità finale presente nel `main` osservato.

## 14. Banca di quesiti Fisica e motore delle valutazioni

**[IMPLEMENTATO COME CORPUS DRAFT]** Il pacchetto `packs/semestre-filtro-2026-27` contiene **4.000 quesiti originali Fisica**, bilanciati in 1.000 base, 1.000 facili, 1.000 medi, 1.000 difficili. La distribuzione per unità è U1 160, U2 928, U3 800, U4 272, U5 672, U6 800, U7 368. I formati sono **2.537 scelte multiple** e **1.463 completamenti**, distribuiti in **27 shard JSON**. Il corpus è organizzato in 250 famiglie di modelli, 212 famiglie di legge, con derivazioni e soluzioni estese, verifiche sintattiche e numeriche, hash, taxonomy e provenienza. Non sono 4.000 «leggi diverse» e non sono tutte prove pedagogicamente calibrate.

La struttura di ogni record documentata include: `id/version/schemaVersion/bankId`, titolo e prompt, `format/options`, `answer`, `solution/solutionSteps`, `taxonomy`, difficoltà e relativa motivazione, carico algebrico/cognitivo, prerequisiti, misconcezioni, `familyId/lawFamily`, firme semantiche, `provenance`, `verification/status/reviewer`. Le risposte studente e le soluzioni restano proiezioni diverse; la chiave non è spedita a un utente non autorizzato prima della correzione. Il parsing del numero ammette notazione coerente con frazioni, virgola/decimali e tolleranze dichiarate, senza `eval`. Le alternative numeriche/simboliche sono controllate per equivalenza, non confrontate come semplici stringhe.

**Profili d'esame distinti, secondo il pacchetto:** `semestre-2026`: 21 scelte multiple + 10 completamenti, 50 minuti; `semestre-2025-historical`: 15 scelte multiple + 16 completamenti, 45 minuti. La selezione deve usare famiglie diverse nelle simulazioni, salvare seed e regole e non trasformare un profilo storico in quello corrente. Gli approfondimenti con legge fornita vengono marcati rispetto al nucleo del programma; non vengono spacciati per contenuti sicuramente richiesti dal programma 2026/27.

**[LIMITAZIONE]** Le 4.000 proiezioni e verifiche automatiche sono documentate come PASS del corpus consegnato, ma **revisione scientifica umana integrale e calibrazione della difficoltà su studenti: NOT_RUN**. La banca possiede filtri e un percorso di esercitazione via API, ma il report del pacchetto dichiara **tentativi della specifica UI di question-bank non persistiti nel Diario**. Non trasformare quel flusso in una registrazione di carriera mai implementata.

### 14.1 Cosa deve fare un valutatore credibile

Attività supportate dalla visione: scelta multipla, completamento numerico con unità/tolleranza, spiegazione aperta da revisionare, problemi multistep, prove di trasferimento, eventuali vero/falso e formati estensibili con validatori appropriati. Occorre distinguere validazione formale, scientifica, revisione editoriale, tentativo e feedback. L'AI può generare **proposte** di varianti, rubriche o commenti: non deve autoconfermare una soluzione non validata. L'originalità va controllata per copertura e ragionamento, non solo per identità lessicale. Le prove ufficiali precedenti servono da blueprint, con rispetto di copyright e provenienza.

**[VISIONE PIÙ AMPIA] ExamForge** è un generatore di prove originali da syllabus, materiali autorizzati e blueprint di tipologie/difficoltà, con domanda, soluzione completa, rubriche, versione studente/docente, PDF/LaTeX e interoperabilità Moodle GIFT/QTI dove realmente supportata. Non deve copiare professori, loghi o compiti in modo confondibile.

**[STORICO DEL LUGLIO] Exam Trainer** era un primo wedge proposto e documentato, come plugin generico `io.ardesia.exam-trainer` con Pack di *Meccanica Statistica* (dispense Marco Billò, 15 domande iniziali), richiamo cronologico/casuale seedato/libero, indizi/scaletta/risposta, autovalutazione, fonti pagina e persistenza in LessonOS. Le domande senza fonte adeguata dovevano rimanere `SOURCE_MISSING`, mai ricevere spiegazione presentata come certa. Questo **non è diventato la priorità commerciale di ottobre**, ma resta una specifica storica riusabile del sistema plug-in. Non dichiararlo completato o pubblicato.

## 15. Laboratori scientifici 2D/3D e motori di simulazione

**[VISIONE]** Ardesia non deve limitarsi a slider, numeri e grafici statici: propone esperienze scientifiche di qualità alta, manipolabili, accurate, riusabili in più lezioni e corsi, con feedback immediato e supporto di strumenti 2D e 3D *quando il fenomeno ne beneficia*. Modello fisico, stato pedagogico e renderer devono essere separati. Una scena 3D senza corrispondenza quantitativa non è una simulazione scientifica. Un solver non può rendere lecita una configurazione fuori dominio o inventare dati assenti.

Ogni laboratorio deve dichiarare: `id`, versione, scopo, `objectiveIds`, ipotesi, limiti, unità SI, configurazioni tipate, min/max, preset, regole di validazione, solver/test oracle, grafico/i, eventuale scena, interazioni e serializzazione, provenance/licenza e alternativa accessibile. Le mutazioni dell'interfaccia non modificano tentativi passati; il confronto con la previsione è un passaggio didattico significativo. Il pacchetto deve essere montabile nel ToolHost e riprendibile solo tramite riferimenti Core confermati. I preset sono esempi, non l'evidenza che uno studente abbia imparato.

### 15.1 I sedici modelli reali proposti nella PR #331

L'elenco seguente proviene esattamente da `apps/studio/plugins/fluid-thermo/definitions.ts` sulla branch **non integrata** della [PR #331](https://github.com/AndreaMarro/ardesia/pull/331). Non è un catalogo di sedici plugin indipendenti già installati in produzione.

| # | ID modello | Oggetto scientifico |
|---|---|---|
| 1 | `manometer` | Pressione, densità e manometri |
| 2 | `hydrostatic` | Stevino e distribuzione della pressione |
| 3 | `pascal` | Pascal e pressa idraulica |
| 4 | `buoyancy` | Archimede e volume immerso |
| 5 | `continuity` | Continuità e sezioni del condotto |
| 6 | `venturi` | Bernoulli e Venturi |
| 7 | `poiseuille` | Poiseuille e profilo di velocità |
| 8 | `hydraulic-network` | Resistenze idrauliche in serie e parallelo |
| 9 | `capillary` | Capillarità, menisco e Laplace |
| 10 | `ideal-gas` | Gas ideale e pistone |
| 11 | `calorimetry` | Calorimetria e miscelazione |
| 12 | `phase-change` | Calore latente e cambiamenti di stato |
| 13 | `heat-transfer` | Conduzione, convezione e irraggiamento |
| 14 | `process` | Trasformazioni e primo principio |
| 15 | `carnot` | Macchina di Carnot e rendimento |
| 16 | `entropy` | Entropia e irreversibilità |

La PR dichiara **32 preset** (due per modello), diagrammi 2D, scene Three.js lazy dove pertinenti, modelli analitici con solver Python indipendente e snapshot versionato. La review indipendente #337 ha verificato matematicamente **54 casi** relativi a tutti e sedici i modelli, con 45 target collegati, ma dichiara browser e revisione umana NOT_RUN e gap scientifici specifici. I grafici di Carnot, i bilanci termici e l'espansione libera devono descrivere correttamente la fisica: **non disegnare un cammino p–V inesistente nell'espansione libera**. Per la capillarità il modello specifica un dominio Bond limitato; per Poiseuille il regime laminare deve restare una condizione esplicita.

### 15.2 Poiseuille: contratto analitico di riferimento

Per fluido newtoniano incomprimibile, tubo cilindrico rigido, regime stazionario laminare completamente sviluppato, condizione di non scorrimento alla parete:

\[
Q=\frac{\pi r^4\Delta p}{8\eta L},\quad \bar v=\frac{Q}{\pi r^2},\quad u(s)=\frac{\Delta p}{4\eta L}(r^2-s^2),\quad v_{\max}=2\bar v.
\]

A **Δp fissata**, `r×2` implica `Q×16`, area `×4`, velocità media `×4`; a **Q fissata**, `r×2` implica `Δp/16`, velocità media `/4`. A Q e r fissati, raddoppiare sia viscosità sia lunghezza richiede Δp `×4`. Il viewer deve esplicitare la grandezza mantenuta costante e tenere coerenti formula, numeri, grafico, sezione 3D e feedback. Traccianti illustrativi non equivalgono automaticamente a descrizione quantitativa di un fluido reale; densità visiva non equivale a portata; turbolenza/sangue reale/CFD generale non sono modellati implicitamente.

**Esperienza completa:** fonte e prerequisiti → previsione originale e motivazione → scelta di vincolo → cambio raggio e misure → interpretazione del grafico e profilo → aiuto contestuale con trascrizione → nota sull'errore → problema inverso → feedback/versione → recupero su altro dispositivo. Le due rappresentazioni 3D/2D devono avere pari contenuto cognitivo: il 3D mostra sezione e distribuzione spaziale, non è un premio decorativo. Niente auto-«mastery» dopo un click.

### 15.3 Altri strumenti, motori e idee specialistiche

Le conversazioni e il repository contengono ulteriori verticali **non equivalenti a funzionalità già chiuse**: circuiti e misure elettriche; cinematica, molla, termodinamica e onde; meccanica, controlli e segnali (Bode, fasori), matematica grafica (JSXGraph), grafici di funzioni/superfici, formule/LaTeX; Arduino, breadboard, custom chips e scene 3D; manuali interattivi, fisica della biomeccanica e altri oggetti STEM. Il riuso desiderato di biblioteche come MathLive, JSXGraph, Three.js, ReactFlow, Cytoscape, PDF.js, FullCalendar, Excalidraw, solutori simbolici/analitici e componenti native richiede **verifica di licenza, qualità, isolamento e consumer reale**. Nessun target REA o libreria in un registro implica che l'intera sua esperienza sia stata acquisita.

**[ESCLUSO DAL PRIMO RILASCIO]** non obbligare CFD, scene universali con collisioni, editor 3D arbitrario, completa parità con Tinkercad/PhET/Goodnotes/Miro o simulazione biologica clinicamente fedele per dichiarare completo un primo corso. Le capacità complesse devono entrare solo quando l'esperimento fisico e la lezione ne giustificano la presenza.

## 16. Elettrotecnica, Kirchhoff, simulatore, Arduino e strumenti specialistici

**[STORICO ORIGINARIO]** La visione includeva Simulation Plugin `io.ardesia.simulation` come plugin autonomo e un contenuto ELABTutor sovrapposto; il simulatore doveva incorporare schemi, breadboard, collegamenti, strumenti, SPICE/solver, Arduino e scene visuali, con comportamento Tinkercad-like e ingresso graduale da immagini/PDF. L'input affidabile immediato era però **CircuitScene/netlist confermata**, non il riconoscimento infallibile di qualsiasi foto: foto/scansione → candidate detection/topology → confidence/ambiguità → correzione umana → validate → solve. Il ramo Arduino distingue board/chip, provider, simulazione supportata e diagnostica esplicita invece di emulare falsamente un microcontrollore non implementato.

**[DECISIONE PIÙ RECENTE]** eLab viene rimosso dal prodotto attivo. Questo **non elimina** il valore di un solver e di strumenti elettrici indipendenti, a condizione che la loro dipendenza da ELAB sia stata realmente separata. Il laboratorio **S19 Kirchhoff/DC** ha una propria implementazione e PR [#325 MERGED](https://github.com/AndreaMarro/ardesia/pull/325), con scene circuitali, orientazione delle correnti, KCL/KVL, resistenze, verifiche strutturate, fino a 32 passi, previsione, revoca/review, ricevuta Core, export JSON/SPICE/CircuitikZ e transfer. Il suo perimetro è *DC verificato nello scope documentato*: non prova solver universale MNA/AC/transitori, riconoscimento fotografico generale o il funzionamento di ogni strumento Arduino. La lezione del corso rimane DRAFT fino a revisione scientifica umana.

**[VISIONE SPECIALISTICA] Circuit Tutor / ElettroSolve**: da scena confermata, obiettivo e metodo scelto o approvato, soluzione completa **umana e spiegata**, trasformazioni equivalenti, conservazione del verso e della convenzione di segno, controlli KCL/KVL, metodo nodale, maglie, Thévenin, Norton, Millman, sovrapposizione, trasformazioni di generatori, potenze, rete DC, poi AC/fasori/transitori. Output con disegni e trasformazioni verificabili, PDF/LaTeX/CircuitikZ, errori ragionati e sedimentazione LessonOS. Il **metodo del professore** e la procedura del docente sono dati di contenuto/method pack, non verità matematica privata del renderer.

Una eventuale integrazione di materiale didattico di terzi (incluse dispense menzionate in chat) richiede prova esplicita dei diritti e della versione. Non si ripubblicano contenuti privati o loghi senza licenza.

## 17. Intelligenza artificiale: assistenza, conoscenza, personalizzazione

**[VISIONE]** Ardesia deve poter operare come tutor contestuale e assistente alla creazione di lezioni, ma l'AI non è l'autorità della scienza, del voto, dell'identità o della pubblicazione. Il ciclo documentato è **input → extraction candidato → grounding su fonti/versioni → ragionamento proposto → controllo deterministico/indipendente → review umana dove necessaria → artefatto versionato**. Le attività deterministiche (unità, leggi, algebra, invarianti, stati, receipt, deadline, permessi) vanno eseguite e ricontrollate da codice appropriato, non affidate al testo di un modello.

**Capacità candidate**: import multimodale di PDF/foto/screenshot/lezione audio; OCR/ASR con testo originale e correzione esplicita; costruzione/semplificazione di materiali, tabelle, grafici, formule, esempi, quiz e verifiche; spiegazioni alternative; domande socratiche; identificazione di passaggi confusi; scelta di esercizio di recupero; proposte di diario; ricerca delle fonti e citazioni; sintesi temporali e grafi di concetti; supporto al docente per revisione, comunicazioni e preparazione. Ogni funzione necessita scope, consent/retention, provider scelto, budget, sourceRefs/unsupportedClaims e fallback a provider spento.

**[REQUISITO]** Conservare separati `HUMAN`, `AI_ASSISTED`, `AI_GENERATED` e stati `PROPOSED`, `CHECKED`, `HUMAN_REVIEWED`; un `INSUFFICIENT_SOURCE` deve emergere come limite, non diventare una risposta autorevole. L'AI non può leggere memorie di allievi terzi, pubblicare correzioni senza permission/review, fissare esiti scientifici fuori dominio o utilizzare corpus personali per training di default. Eventuali modelli locali compatti (Gemma/Qwen), provider remoti, router multi-modello e tool specializzati sono **scelte candidate storiche**, non piattaforma AI completa verificata. Le configurazioni preferite sono cambiate nelle conversazioni; non fissare arbitrariamente il nome di un LLM nella specifica universale.

### 17.1 Personalizzazione e «memoria» senza finzioni

Un modello può consultare il contesto autorizzato: programma, lezione, fonte, feedback passati, risposte, tipo di errore e rubrica. Non equivale a «leggere la mente», valutare la persona o avere un modello permanente addestrato sui suoi dati. Una personalizzazione solida richiede tracciabilità, conservazione degli esiti di nuove prove e possibilità di negare o rettificare inferenze. L'efficacia di un algoritmo adattivo, FSRS o rete di memoria AI non è certificata dalla sola esistenza della tabella/feature.

### 17.2 Infrastruttura AI e servizi esterni

Il *gateway* astratto ammette provider/interfacce diverse e trasformazioni di prompt/dati. Le chiamate provider sono server-side quando contengono credenziali; si applicano quote, timeout, cancellazione, rate limit, logging senza PII, controllo costi, modello e versione, valutazioni ripetibili. MCP fornisce eventualmente un'interfaccia di strumenti, non una scorciatoia per aggirare Core e ACL. L'AI è **facoltativa per il golden path**; contenuti già approvati restano fruibili senza inference a ogni apertura.

## 18. Docente: Pagina Personale, regia, CRM educativo e gestione

**[REQUISITO]** Il tutor non deve passare continuamente fra agenda, cartelle, chat, account, lavagna e rubriche. La **Pagina Personale** si collega al lavoro corrente e rende recuperabili lezioni, studenti, contenuti, richieste, compiti da correggere e prossime azioni, senza trasformarsi in un nuovo software amministrativo separato.

Il ciclo operativo documentato è: **interesse/offerta → composizione di un gruppo → edizione confermata → quattro sessioni/lezioni → upload e fonti → consegna → correzione con revisione → ripasso/transfer → relazione con lo studente**. Lezioni e sessioni producono ricevute, non soltanto appunti del tutor. Il materiale di un corso può essere riusato per una nuova edizione senza ereditare gli elaborati privati di un vecchio gruppo.

La dashboard tutor può mostrare: calendario e disponibilità, candidati a corso, posti/hold, iscritti, assenti e recuperi, materiali da revisionare, compiti da correggere, osservazioni e risposte inviate, errori ricorrenti **con scope autorizzato**, fonti mancanti, stato delle attività e idee per lezione successiva, indicatori di progresso **se supportati da evidenze**. Le metriche amministrative (fatturazione, lead, conversioni) restano separate da dati psicologici/didattici. Non presentare uno score globale di «bravura studente» non validato.

**[IMPLEMENTATO CON LIMITI]** V4 ha costruito un nucleo gestionale e prove di offerte, edizioni, sessioni, consent, ricevute e concorrenza in runtime controllato. L'accesso commerciale/pagamento reale, le notifiche multicanale e l'intero CRM non risultano verificati in produzione. Uno stato `OFFERED` o una preview con prezzo non costituiscono fattura, pagamento o iscrizione effettiva.

### 18.1 Calendario

**[REQUISITO]** Tutte le date hanno un fuso IANA e gestiscono DST; l'orario civile inesistente/non ambiguo non può essere accettato tacitamente. Disponibilità e conflitti devono avere lock e ri-verifica all'accettazione. Sono previste anteprima calendario, quattro incontri, riprogrammazione con nuova revisione, ICS e possibile OAuth/free-busy Google. L'integrazione **FullCalendar** nel frontend è un componente d'interfaccia, non prova di autentico calendario Google bidirezionale. OAuth, revoca, deduplica eventi, token, callback, provider error e conflitti restano gate separati. Le sessioni non devono generare una nuova identità di lezione scollegata dal Core.

### 18.2 Contatto e notifiche

Un contatto/richiesta registrato è diverso da notifica consegnata; messaggio email, WhatsApp, Telegram e futura app mobile richiedono trasporto, consenso, opt-out, tracciamento esito e privacy propri. Il primo microcorso può utilizzare processi commerciali esistenti purché l'utente capisca esattamente cosa avviene; non obbligare pagamento automatizzato e CRM completo prima della convalida del valore educativo.

## 19. Collaborazione, aule, gruppi e materiali condivisi

**[VISIONE]** Lezioni sincrone e asincrone tra docente e studenti, lavagna condivisa, interventi controllati con penna, commenti e revisioni, esercizi assegnati, condivisione selettiva di post-it, plugin e fonti, quaderno personale isolato e proiezione di un materiale per il gruppo. La collaborazione deve gestire più mani sul foglio **senza «pasticciare»** il lavoro: identità e ruoli per gesto/oggetto, eventuali corsie o layer, lock/merge/revisioni, indicazione di presenza e storia recuperabile. Non bastano due cursori demo o una simulazione locale per dichiararla funzionante da due dispositivi.

L'accesso docente, studente iscritto, altro studente, utente senza corso e anonimo deve essere diverso. Il tutor vede un elaborato **dopo consegna autorizzata**, non durante la bozza privata; una bozza personale condivisa solo come link o come selezione di oggetti conserva il proprio scope. **Nessun peer legge tentativi privati altrui**, e la revoca di una membership invalida successivi accessi anche se il browser conserva URL, layout o cache.

Gruppi di studio futuri: obiettivo, creazione/join/leave, membership e ruoli, calendario e asset comuni, artefatti riusabili, tutor/facilitatore, privacy dei tentativi individuali, consenso alla pubblicazione, moderazione ed export. Lezioni di gruppo: numero posti, regia, materiali in sessione, permessi temporanei, recap e follow-up, riprogrammazione. Gli aspetti social/public groups sono **[RINVIATI]** alla commercial beta, mentre iscrizione e un piccolo gruppo del primo corso sono priorità operative.

## 20. Discover, professionisti, marketplace e rete educativa

**[VISIONE STORICA CONSERVATA / RINVIATA DAL PRIMO RILASCIO]** Ardesia ambiva a diventare anche ecosistema creator e luogo di incontro fra studenti, tutor, insegnanti, autori, contenuti e strumenti. Il **Discover** del PRD v2 integra tipologie esplicitamente distinguibili: plugin, Pack, workflow, template, corsi, manuali, raccolte, professionisti, lezioni singole, lezioni di gruppo, gruppi di studio, abbonamenti creator e bundle.

### 20.1 Profili e reputazione

Profilo: disciplina, livello, lingua, metodo dichiarato, credenziali dichiarate/verificate **separatamente**, portfolio versionato, dimostrazioni, disponibilità, contatto, prezzo e condizioni, recensioni realmente riferibili a esperienze svolte. La reputazione non diventa un unico voto opaco: qualità dell'insegnamento, completezza/correttezza del contenuto, qualità tecnica del plugin, manutenzione, accessibilità e affidabilità commerciale sono segnali differenti. Se esistono ranking, la persona deve sapere perché un elemento compare; sponsorizzazioni etichettate, meccanismi ragionevoli per nuovi creator, no pay-to-rank nascosto, no sfruttamento di dati educativi privati.

### 20.2 Marketplace e publishing

Pipeline candidata: `create → preview → test → provenance/license → capability review → security/quality gate → package/sign → publish → install/use → update/rollback → support`.

Licenze open/free/paid/seat/subscription solo quando verificate e compatibili; publisher e package identificati, hash/firma, compatibilità SDK, feedback pubblico contestualizzato, contestazione per plagio/takedown, report/block, supporto, rimborsi, tasse e pagamenti mediante provider. Un seller non è autorizzato a distribuire un manuale perché lo ha caricato privatamente; una fonte citata non concede un diritto di copia.

**[STATO]** le primitive di manifest/ToolHost non dimostrano catalogo commerciale vivo, checkout, payout, moderazione, KYC o redditi reali. Non aprire un secondo marketplace mentre rimangono incompleti login, persistenza e lezioni del primo corso. La vetrina viene dopo un oggetto didattico realmente utile, revisionato e portabile.

## 21. Piani, entitlements, ricavi e sostenibilità

Il modello finanziario ha avuto **proposte successive, non un listino approvato**. Nel README storico: circa **€15/mese** SaaS, marketplace **70/30**, **0% di commissione sulle lezioni**. Nel PRD del luglio: Study/free sostanziale, Pro/Creator per compute/hosting/sync/pubblicazione, Team/School futuro; prezzo, commissioni, fee booking e retention dichiarati **human gates**. In una conversazione d'agosto erano stati ipotizzati tier Student/Pro/Tutor/School con prezzi diversi: proposte, non decisioni tariffarie vincolanti. Ottobre cambia il **primo modello di entrata** e propone microcorsi vendibili direttamente.

**[PROPOSTA V4]** Esempio di offerta: **quattro incontri da 90 minuti**, **€49/persona**, massimo **10 studenti**, soglia minima **6**; scenario alternativo tre incontri da 90 minuti a €39 e lezioni individuali a €25/ora. È una **ipotesi commerciale documentata**, non una promessa che posti/checkout/servizio siano attivi a quei prezzi. Ricavo lordo per una edizione da €49: 6 partecipanti €294, 8 partecipanti €392, 10 partecipanti €490, prima di tasse, tempi di preparazione, supporto, infrastruttura, acquisizione e revisioni.

**[REQUISITO]** misurare costo reale per corso/utente e per AI (token, storage, banda, provider, moderazione, backup, assistenza, hosting, laboratori). Non aggiungere nuovi abbonamenti o provider per inseguire modelli senza un beneficio misurato rispetto all'alternativa open source o deterministica. Il piano non altera ownership né blocca l'export delle fonti della persona; downgrade senza perdita; modello gratuito non deve essere una demo inutilizzabile. I dati educativi personali non diventano un bene vendibile. Un eventuale marketplace con commissioni non deve confondersi con i compensi per lezioni private.

**[STATO]** dai report non discendono ricavi, PMF, conversione commerciale o costo per studente certificati. Il pagamento mensile Vercel dichiarato dall'utente è un vincolo di costo da sfruttare, non prova che l'infrastruttura corrente supporti già un pilota sicuro multiutente.

## 22. Dati: identità, eventi, risorse e ricevute

**[REQUISITO ARCHITETTURALE]** Un'architettura autorizzata da un singolo Core, con policy centralizzata per `UserIdentity`, `RoleGrant`, `Membership`, `CourseTemplate`, `CourseEdition`, `Session`, `Enrollment`, `Assignment`, `Activity`, `Attempt`, `SubmissionRevision`, `FeedbackRevision`, `ResourceVersion`, `LessonEvent`, `Observation`, `DiaryProjection`, `PluginInstance`, `Pack`, `Workflow`. Questi nomi rappresentano **tipi/concetti documentati**, non prova che tutte le tabelle omonime esistano. La parte implementata del Core Study usa un proprio schema effettivo e le relative revisioni: i nomi vanno mappati, non creati come secondo dominio.

### 22.1 Provenienza e versioni

- Materiale/study source: `(resourceId,revisionId,contextId)`, hash byte, owner, visibilità, edizione, licenza, autore, import/derivazione e cancellazione.
- Lezione: `packId/version/SHA`, `lessonRef/id/version/hash`, `objectiveIds`, attività/versione, fase e eventuale `ExerciseRef`.
- Tentativo: previsione originale, testo e passaggi dello studente, parametri e vincoli, tipo di aiuto e momento, risultato scientifico, dato di confronto, verifica; consegna con receipt.
- Feedback: revisione dell'elaborato a cui si riferisce; l'aggiornamento successivo non aggiorna retroattivamente la review passata.
- Plugin e modello: manifest/capability/SDK version, config typizzata, unità, snapshot, stato UI separato dallo stato scientifico, provenance del solver.
- Archivi: integrità e indicazione delle perdite; un file firmato/hash non conferisce il permesso su una fonte privata che l'utente non può più leggere.

### 22.2 Invarianti di scrittura

Autorità server tramite `/me`, membership/scoping effettivo e policy Core; i valori di `actorId`, `courseId` o `teacherId` inviati dal browser **non sono autorizzazioni**. Nessuna mutazione diretta dal renderer scientifico, dal plugin o da MCP al database; si riusano command/API Core, `expectedRevision` e `Idempotency-Key` quando previsto. I duplicati ricevono la ricevuta dell'operazione precedente, non un secondo invio; il cambio di attore, la sessione scaduta e la risposta tardiva devono annullare l'applicazione alla UI corrente. **409 = conflitto da risolvere preservando la bozza**; **503 = operazione non attestata**, non «salvato».

### 22.3 Una fonte non è il layout

Una `BoardView` può cambiare posizione, scala e modalità senza mutare i bytes della fonte o la validità dell'esercizio. Le relazioni `cites`, `derived_from`, `attempt_of`, `feedback_on`, `requires`, `corrects` mantengono riferimenti determinati. Un *morfismo di presentazione* può trasformare vista e interazione in base a dispositivo/ruolo/contesto, senza cambiare scienza, privacy, evidenze o rubriche. Un adattatore d'export deve dichiarare che cosa preserva e che cosa perde, invece di presentare come equivalente un PDF e un oggetto vivo.

## 23. Autenticazione, confini remoti, Storage e resilienza

**[DECISIONE ADOTTATA IN ADR-0004 E 0006]** Core Study come **monolite modulare** e database canonico; UI e MCP client dello stesso API. È vietato risolvere la complessità con un secondo login, store o sistema di submission. In locale il Core può usare SQLite, con adapter PostgreSQL per runtime controllato; `BlobRepository` astratto e implementazioni di storage immutabile. Supabase Auth, PostgreSQL/RLS e Storage sono confini di provider da collaudare, non il modello di dominio. Le migrazioni PostgreSQL sono amministrative, mai «create table» eseguite quando arriva una richiesta HTTP.

**Privato per default**: fonte privata, bozza studente, allegato, audio e osservazione; `submitted_to_assigned_tutor` soltanto con azione consentita, `cohort_shared` solo per contenuto scelto e autorizzato, `teacher_private` separato. Revoca utente, sessione e partecipazione; scadenza, cambio ruolo, altra organizzazione, URL indovinato, risposta ritardata, replay, export e import sono casi negativi da provare. Altri docenti e compagni non devono aggirare i controlli con riferimento diretto o cache. Dati reali di minori richiedono policy e consenso adeguati; la beta sintetica non costituisce base giuridica per usarli.

**Resilienza**: connessioni e transazioni limitate, row locks per edizione, aggregate locks, compare-and-swap, code bounded, retry idempotente, rollback e recovery; hash del blob originale, commit-intent per operazioni con Storage esterno, verifica permission anche dopo backup/restore. ADR-0004 documenta ammissione per processo **16 richieste store attive e attesa massima 0,5 s** nel candidato; sono limiti di quel runtime, **non capacità misurata del servizio**. Il totale delle connessioni deve considerare numero di processi e job amministrativi; zero affermazioni su scala illimitata.

**[LIMITAZIONE ATTUALE]** la [PR #333](https://github.com/AndreaMarro/ardesia/pull/333) definisce `SYNTHETIC_ACCEPTANCE`, login email/password via cookie `Secure/HttpOnly`, HTTPS Host/Origin stretti, runtime remoto e RLS; sul ramo i test locali di 118+2 sono dichiarati superati. **Manca ancora prova hosted integrata certificata** sullo stesso candidato, con tutor e due studenti, logout/revoca, RLS Storage, doppia scheda, secondo dispositivo, backup/restore e qualità. La [PR #336](https://github.com/AndreaMarro/ardesia/pull/336) affronta consumer/persistenza ma è separata e aperta. `localStorage` o un notebook JSON locale **non equivalgono** a ripresa remota attestata.

### 23.1 Local-first: aspirazione e situazione reale

Il **PRD del luglio** definisce il percorso locale completo senza account, export/import e possibilità di passare a un account cloud senza perdere lo storico. Le **specifiche commerciali V4 di ottobre** richiedono invece come gate un'**edizione autenticata** con Core remoto autorevole e condivisione controllata. Non è stata approvata una soluzione tecnica che realizzi interamente entrambe in ogni scenario, né esiste prova di sync universale. Questa è un'**integrazione ancora aperta** da definire senza cambiare le fonti di verità: modalità locale onesta, runtime remoto autorevole per le attività condivise e un protocollo esplicito di trasferimento/sincronizzazione/versioni. Il principio local-first non va cancellato dalle specifiche per comodità, ma **non può essere dichiarato disponibile** solo perché alcuni file locali sono salvabili.

## 24. Architettura software concreta e confini di cambiamento

Il monorepo osservato contiene almeno:

| Zona del repository | Ruolo |
|---|---|
| `apps/web/` | client corso-first Ardesia e consumer Studio/Study, interfacce utente, cataloghi e attività |
| `apps/studio/` | lavagna, LessonOS/registrazione, ToolHost/SDK, plugin, foglietti e strumenti d'autore |
| `apps/marketing-01/` | superficie pubblica e di acquisizione, proiezioni didattiche e demo limitate |
| `packages/engine/` | dominio e motori Study/LessonOS, Content/CoursePack, policy e valutatori deterministici |
| `services/study-api/` | API autorizzate, autenticazione runtime, comandi, ricevute, gestione e storage |
| `services/study-mcp/` | interfaccia standard MCP per host supportati, non nuova autorità |
| `services/entitlement/` | confine per capacità e piani dove utilizzabile |
| `plugins/s19-circuit-lab/` | modulo specialistico DC, separato da eLab |
| `packs/semestre-filtro-2026-27/` | banca di Fisica e relativi manifest/editoriali |
| `factory/rea/`, `registry/`, `bin/`, `ops/` | acquisizione/reverse engineering lecito, script di QA, gate e fabbrica di sviluppo, non runtime didattico |
| `docs/`, `matrici/`, `handoffs/` | canoni, specifiche, ADR, evidenze, ownership e stato versionato |

**Regola del cambiamento:** una nuova attività scientifica aggiunge modello/versione, validatore, render e preset attraverso contratti; non riscrive il CoursePack né il Core. Un nuovo modello commerciale aggiunge policy/entitlement, non clona l'identità. Una nuova vista modifica Web/Studio, non la fonte originale. Un nuovo provider storage/autenticazione/database implementa un adapter con contratti e test negativi; non crea funzioni parallele. Nuovi contenuti producono nuove versioni, non alterano evidenze esistenti. Un plugin non scrive il Diario; emette azioni autorizzate e il Core decide.

**Stack verificato/menzionato:** frontend React/TypeScript/Vite e codice di studio/corsi; Python per i motori e FastAPI per servizi; gestione dipendenze Node/npm e Python/uv; provider Vercel per superfici web, PostgreSQL/Supabase nei test/runtime proposti. Un antico documento suggeriva Next.js: la successiva decisione adottata è **non migrare a Next.js solo per inseguire una preferenza architetturale**. Render è comparso come ipotesi hosting per servizi, non si presume ogni workload già attivo in cloud. Non inventare un'architettura a microservizi dove la decisione corrente è monolite modulare.

### 24.1 Documenti, source of truth e governance

1. `AGENTS.md`, canoni datati e ADR guidano le responsabilità; la fonte del vero stato del codice è `main` reale e la sua SHA.
2. `bin/state/project_state.py` e report generati aggiornano lo snapshot senza riscrivere arbitrariamente la storia.
3. Ogni PR punta a un consumer e a un perimetro verificabile; owner chiari; nessun merge diretto/automerge quando mancano gate o autorizzazioni.
4. Branch/worktree isolati per il lavoro parallelo. Le PR non restano indefinitamente aperte senza motivo, ma **chiudere** richiede merge verificato o reject motivato; non unire codice non compatibile.
5. Log, evidenze, liste di test saltati, screenshot e SHA vengono conservati per riproduzione. Un testo «CI verde» senza revisione non chiude un gate.

## 25. MCP e interoperabilità

**[VISIONE]** Ardesia deve poter essere usata dalla propria UI e, come strumento integrato, da host AI attraverso **Model Context Protocol** e potenzialmente MCP Apps. I servizi esterni devono consumare **le stesse API e ricevute Core**, così che un esercizio creato da chat, una consegna avvenuta in browser e una revisione docente si incontrino sulla stessa lezione senza «doppia memoria».

Due domini da non confondere:
- **MCP di prodotto:** recupera corsi/fonti, espone capacità, propone attività, legge contesto autorizzato, prepara upload o revisioni; scritture a fondamento di rubriche, identity check, idempotenza e revisione esplicita del docente. Gli strumenti nominati nelle specifiche V4 (es. `course.list_mine`, `lesson.get_context`, `feedback.request_hint`, `calendar.preview_schedule`, `circuit.check_steps`) sono **contratti proposti**, non per questo tutti implementati.
- **MCP della fabbrica:** ricerca, auditing, PR, acquisizione REA, compilazione e test; nessuna facoltà automatica di leggere dati privati della classe o produrre un voto ufficiale. La fabbrica non è il prodotto.

Il percorso **MCP read/write** deve autenticare un utente reale e lo scope, esporre revisioni e provenienza, limitare tool/capability, bloccare operazioni pericolose e differenziare «proposta privata» da «pubblicazione autorizzata». Le RFC di ottobre prevedono writer di correzioni private sopra risorse esistenti; **un MCP writer generico di pubblicazione non è dichiarato implementato**. ChatGPT e altri host richiedono prove separate per il transport, i cookie/token, il protocollo, versioni, UI e revoca.

**Interoperabilità futura:** PDF e LaTeX, `.lesson`, `.study.json`, un possibile pacchetto `.ardesia` (aspirazione, non formato universale già provato), Markdown/JSON, registri di contenuti, eventuali Moodle GIFT/QTI/LTI/xAPI, file ICS e storage Drive/OneDrive con OAuth. I formati devono dichiarare che cosa preservano: PDF non può salvare il comportamento pieno di un simulatore, un export unsigned non è una firma di autorizzazione, una snapshot non prova permessi correnti. Versioni e migrazioni esplicite, link referenziali e test round-trip.

## 26. REA, open source e integrazione di grandi componenti

**[REQUISITO STRATEGICO]** Accelerare Ardesia recuperando legalmente architetture, librerie, comportamenti, componenti e pattern già maturi, evitando di riscrivere tutto da zero. Nelle conversazioni questa strategia viene chiamata **REA** e riguarda in particolare lavagna, grafi, 3D, simulazioni, editor scientifici, audio, compiti, calendario, report e flussi pedagogici.

Categorie separate:
- **A. Riuso di sorgente open source:** soltanto quando licenza, attribuzione, aggiornamenti e compatibilità lo consentono; mantenere notices, SBOM, provenienza e diritti.
- **B. Studio comportamentale di un prodotto terzo:** osservare interazioni, stati, flussi, screenshot e performance dove consentito, per scrivere una realizzazione originale e verificata. Non copiare codice proprietario, brand, asset protetti, sessioni private o misure che eludano controlli.
- **C. Interoperabilità e adapter:** usare protocolli/formati pubblici, senza ricostruire un provider finto o un'app gemella.
- **D. Materiali editoriali e dati:** originalità, autorizzazione e validazione; la presenza di un manuale o PDF privato non abilita la distribuzione.

**Protocollo REA richiesto:** problema visibile all'utente → target donor → permesso/licenza → capture effettivo e ambiente → modello di interazioni, dati e error states → gap di Ardesia → componente minimo originale/riusato → consumer reale → test e screenshot → prova su commit esatto → costo totale e manutenzione → accettazione o rifiuto motivato. Il numero di donor censiti, un URL o una ricerca di repository **non** costituiscono integrazione. I gate `G0/G1` REA in un documento non equivalgono ai gate omonimi di rilascio o alla chiusura dell'intero corso.

Il repository contiene `factory/rea`, registri di target, script ed evidenze; la strategia originaria prevedeva **grandi recuperi** anche da strumenti di lavagna e gestionali. Il report quattro corsi documenta almeno una esecuzione concreta di acquisizione su quattro modelli, senza dimostrare acquisizione completa di quelle applicazioni. Le PR recenti documentano uso selettivo di MathLive, JSXGraph, Cytoscape e FullCalendar, soggetto a licenze e collaudi; l'esistenza nel codice di una dipendenza non prova un'esperienza eccellente. Le risorse realmente utili vanno integrate nel player/Studio esistente, non aggiunte come seconda UI senza raccordo.

## 27. Prestazioni, sicurezza, accessibilità, QA e osservabilità

### 27.1 Requisiti non funzionali

- **Correttezza:** unità e convenzioni di segno, modello e condizioni applicative, numeri esatti/tolleranze, solver indipendente e test di casi degeneri; nessuna falsa certezza AI.
- **Sicurezza/privacy:** deny-by-default, membership server-side, segregazione persone/organizzazioni, nessuna chiave nel frontend, sanificazione file/rendering, upload bounded, limiti di abuso, privacy per trascrizioni, note e audio, policy cancellazione/retention, consensi e copyright.
- **Affidabilità:** idempotency, CAS, restart, apertura a freddo, retry/timeout, reload, due tab, sessioni revocate, backup e restore per versioni esatte; copia e possibile omissione dichiarata negli export.
- **Accessibilità:** obiettivo WCAG 2.2 AA sui percorsi fondamentali, tastiera, focus, nomi e testi, touch e penna ove previsto, alternativa 2D/tabellare alle scene, riduzione movimento, no colore unico indicatore, trascrizione audio.
- **Prestazioni:** feedback locale al percentile 95 entro 100 ms come **target nel dossier 28/10**, scena ~60 fps desktop / ~30 fps tablet concordato come target, prima azione utile in 3 secondi sulla rete definita; il PRD luglio riportava anche apertura shell p75 <2,5s; **non confondere target non ratificati con misure effettuate**.
- **Osservabilità:** release SHA, source/build/bundle, flag, endpoint, provider e contesto autorizzato nei log con redazione PII; health e ripristino riproducibili; errori non mascherati.
- **Manutenibilità:** contratti typed, package version, nessun clone di auth/solver/DB, test sulla revisione finale, migrazioni additive, dipendenze bloccate, governance branch e PR, report `not_checked`.
- **Scalabilità:** budget e misura della concorrenza, row/aggregate lock e indici; scansione per scope, pagination/cursors quando necessario; no «scala a milioni di utenti» dedotto da test locali.

### 27.2 Release levels distinti

**Presenza nel codice** ≠ **funzionalità accessibile nel player** ≠ **test automatici locali** ≠ **browser locale** ≠ **preview protetta** ≠ **browser pubblico** ≠ **beta autenticata e persistente** ≠ **contenuto approvato da umano** ≠ **prodotto commercialmente usabile** ≠ **evidenza di efficacia didattica**. Il principio di non confondere i livelli è un requisito di governo e di comunicazione.

## 28. Metriche e ricerca dell'efficacia

Una metrica di utilizzo valida non certifica apprendimento. Il PRD v2 richiede eventi con envelope autorizzato e registrazione di tipi di attività/risposta, indizi, autocertificazione, modifica, transfer, revisione docente, tempo e frequenza, ripasso successivo; minimizzazione dati per scopo e consenso. Il tutor deve poter leggere indicatori **interpretabili**, non sorveglianza opaca: che cosa è stato tentato, con quale aiuto, quale errore, con che evidenza, come è cambiata la risposta a esercizio nuovo.

Separare:
1. **Prodotto/affidabilità:** percentuale di lezioni iniziate/completate, errori e perdite, ripresa remota verificata, tempo per preparare una lezione, tasso di crash, tempi e bundle.
2. **Pedagogia:** rubriche, ragionamenti, trasferimento su problema nuovo, richiamo differito, revisione docente, condizioni di test.
3. **Mercato:** contatti, iscrizioni paganti confermate, partecipazione agli incontri, costo di acquisizione, costo di servizio, retention, disponibilità a pagare.
4. **Creator/ecosistema futuro:** plugin installati e realmente riusati, compatibilità, failure rates, qualità del contenuto, supporto e licenze.

**[VINCOLO]** nessun «migliora del 40%», «mastery 95%», «sostituisce l'insegnante» o «scientificamente validato» senza disegno e dati appropriati. Un piccolo pilota (nel dossier: almeno **cinque studenti rappresentativi**, quattro su cinque capaci di completare compiti UX senza suggerimenti) serve a trovare ostacoli, non fornisce una stima causale generalizzabile di efficacia. La valutazione degli apprendimenti va separata dall'usabilità e dalle impressioni sulla grafica.

## 29. Marketing, distribuzione e prima offerta

**[DECISIONE OPERATIVA OTTOBRE]** Raggiungere studenti del Semestre Filtro tempestivamente con quattro microcorsi riconoscibili, preview autentica, informazioni oneste, iscrizioni edizioni limitate, materiali originali e chiaro rapporto fra tutor, lezione e studio autonomo. L'acquisizione può essere organica, tramite sito personale, ricerca, passaparola e servizi esistenti, senza richiedere immediatamente advertising a pagamento o un grande marketplace.

La landing deve mostrare nomi e ambiti dei quattro percorsi, programma e date **soltanto quando confermati**, esempi realmente interattivi con contesto, ciò che è incluso, prerequisiti e canale di disponibilità/contatto. Le demo non devono fingere che tutte le lezioni del corso siano complete o accessibili, né presentare la review protetta come prodotto pubblico. Messaggi, claim, testimonianze, pagamenti e termini commerciali devono essere verificabili. Un link che chiama «Apri il microcorso» deve aprire il corso corretto; un ritorno al catalogo non deve mandare a una destinazione diversa in modo sorprendente.

**[NOTA STORICA]** I report del 25 ottobre citano deploy pubblici e preview protette su Vercel con cinque esempi e 43 attività editoriali. Quegli URL e deployment sono evidenze su **revisioni specifiche**, non prove che l'attuale produzione serva il `main` più recente con le nuove PR 331–337; il dossier del 28 ottobre ha osservato backend non configurato su una preview privata e `/study` 503. Serve nuova verifica sul candidato esatto. Il no-code marketing non può nascondere che il percorso didattico reale manchi.

## 30. Stato effettivo ricostruito al 28 ottobre 2026

**La visione descritta da questo documento NON è tutta implementata.** Quello che segue è lo snapshot documentato da GitHub e dalle consegne disponibili, non un nuovo browser test autonomo su ogni URL.

| Sottosistema / prodotto | Prova disponibile | Cosa non risulta certificato |
|---|---|---|
| **Ardesia Core/Study** | Domain, API, revisioni/receipt, scope, idempotenza, controlli e prove synthetic/PG su commit indicati | disponibilità commerciale remota ordinaria, disaster recovery completo, scala misurata |
| **Studio/Lavagna** | Excalidraw, toolhost/primitivi, journal, note/media/formule, `.lesson`, interazioni di prova | piena parità Goodnotes/Miro, penna reale e collaborazione remoto totale, tutto integrato nel percorso studente |
| **LessonOS** | eventi/snapshot e record, recuperi contestuali/versioni in varie PR, integrazione selettiva | unico Note Replay cloud completo con registrazioni sempre accessibili, graph/mastery universali |
| **Memoria personale/Diario** | note, backlinks, grafi, fonti versionate, osservazioni e proiezioni, test Core/UI in sottosistemi | lettura psicologica affidabile, competenza predittiva calibrata, sync universale |
| **Quattro microcorsi** | 43 nuclei/editoriali draft, 5 esempi pubblici storici, 200 obiettivi interni e 4 URL, CoursePack | 200 obiettivi approvati, quattro corsi completi e convalidati, tutti i percorsi remoti autonomi |
| **Banca Fisica** | 4.000 record e verifiche automatiche, formati 2026/2025, runtime per esercitazione | revisione scientifica umana integrale, difficoltà calibrata, tentativi banca persistiti nel diario |
| **Poiseuille e PhysicsLab** | sequenza di previsione–modifica–confronto–aiuto e modelli analitici provati in demo/suite | singola esperienza completa accettata D01–D68, 3D scientifico e cloud certificati |
| **S19/Kirchhoff** | laboratorio DC, misure/calcoli/step e receipt, PR integrata | solver elettronico universale, tutor da foto arbitrarie, Arduino/Tinkercad completo |
| **Sedici laboratori Fluidi/Termo** | codice, modelli, 32 preset, 2D/3D in #331; controprove su ramo #337 | merge e rilascio, replay docente-studente hosted, review umana, tutti i gap scientifici |
| **REA/fabbrica** | registri, script, acquisizioni selettive, test e provenienza; cicli indipendenti | aver «preso» tutte le applicazioni e UI di riferimento, un prodotto automaticamente eccellente |
| **Gestione corsi/calendar** | edizioni, offerte e vincoli in candidati Core; elementi calendario/UI | acquisti live, pagamento completo, OAuth Google live, notifiche garantite |
| **Plugin marketplace/Discover** | canoni, ToolHost/SDK e progetti, modelli dati/futuri | acquisto/installazione firmata e lifecycle completo sul prodotto pubblico, social, monetizzazione, moderation |
| **MCP** | servizi e contratti product, tool specialistici con perimetri provati | writer generale, distribuzione su tutti gli host, credenziali revocabili già collaudate in produzione |
| **Rilascio Vercel** | preview pubbliche e private, manifest/test storici | che l'ultimo main e le PR aperte siano visibili e funzionanti in produzione con Auth/Storage |

### 30.1 Pull request e codice integrato

**`main` osservata nel controllo:** `e857954847c56cd425753632f84cfaedde54239e`. Il 28 ottobre risultavano integrati, tra gli altri, #328 (raccordo pubblico ai corsi), #329 (contratto Chiusura 1), #330 (57 obiettivi) e #332 (rimozione eLab attivo). La cronologia precedente include #313–#327 come patrimonio di integrazione di fonti/audio/formule, percorsi studente, 2D, memorie e S19: non attribuire al loro merge il completamento pedagogico o del runtime remoto.

**Sei PR aperte durante il controllo:**
- **#331:** 16 laboratori Fluidi/Termo, 32 preset, renderer e snapshot, review/mount pendenti.
- **#333:** runtime remoto `SYNTHETIC_ACCEPTANCE`; prova hosted completa non certificata.
- **#334:** dieci lezioni e 57 rubriche DRAFT, 0 accettate.
- **#335:** selezione 199 quesiti + 40 svolti + due prove tematiche, ramo di #334.
- **#336:** consumer unificato, ripresa e Studio; dipendenze multiple e CI/browser finale non certificati.
- **#337:** controprove indipendenti, ramo di #335; revisione browser/umana mancante.

Le PR possono avere head e test autonomi corretti senza avere **l'albero combinato finale testato**. Sono vietate descrizioni del tipo «16 simulatori rilasciati» o «CoursePack Fluidi completato» finché non siano superati i gate definitivi. La [PR #332](https://github.com/AndreaMarro/ardesia/pull/332) dimostra una decisione di eliminazione del vecchio eLab; l'audit di assenza di residui nei bundle del prossimo deploy rimane un controllo da fare sul commit finale.

### 30.2 Evidenza esterna e limiti di attestazione

Il dossier decisionale verificato il 28 ottobre riportava una produzione Vercel pubblica distinta da Studio e una preview privata con `learningJourney=true`, ma `backend=NOT_CONFIGURED`, `remoteReady=false` e `/study` a **503**. Un'altra consegna elencava diversi deploy e prove browser/screenshot su revisioni precedenti. **Nessuno di tali dati autorizza a dichiarare che il servizio oggi esegua senza problemi il candidato aperto #336.** L'SSO Vercel per il team non sostituisce un'Auth applicativa per il vero studente.

Tutti gli indicatori di approvazione contenuto presenti nel report dei quattro corsi e nel ramo di revisione risultano **DRAFT / `approved=false`**. Le prove con studenti, l'osservazione su dispositivo fisico/iPad Pen, la review scientifica di un esperto e il pagamento reale devono essere attestati autonomamente prima del relativo claim.

## 31. Convergenza: cosa è stato deciso, cosa no

### 31.1 Contratti trasversali che devono rimanere stabili

1. **Una sola lezione/versione** per fonti, player, tentativi, feedback, audio e ripresa.
2. **Un Core autorizzato** per iscrizione, contenuto privato, consegne, audit e Diario.
3. **Un solutore verificato per modello scientifico**, indipendente dalla grafica e dall'LLM.
4. **Un oggetto vivo e versionato** montabile e visualizzabile in più contesti, non una pagina speciale che vive fuori Ardesia.
5. **Una sola fonte dei contenuti** per CoursePack e banca domande, con proiezioni selettive per pubblico, studente, docente.
6. **Una gerarchia pedagogica prima della UI**: prerequisito, previsione, manipolazione, spiegazione, esercizio, feedback, recovery, transfer.
7. **Stato verificabile e comunicazione non fuorviante** per dati, scienza, esperienza utente e ricavi.
8. **No nuova dipendenza** senza provenienza, gate, consumer, manutenzione e costo comprensibili.

### 31.2 Decisioni che non vanno reinterpretate

- **eLab eliminato dal prodotto attivo** (non ritorna sotto nome «Sim»); archivio e notices storici possono restare. S19 e nuovi strumenti scientifici indipendenti non si eliminano per assonanza.
- **Microcorsi prima**, ma Ardesia intera resta prodotto e il codice deve mantenere ToolHost/portabilità; non inseguire una quiz-app autonoma.
- **Fluidi/Termodinamica prima come Chiusura 1**, non ripetere Poiseuille all'infinito come scusa per ignorare il resto; il caso Poiseuille rimane la prova di profondità e del modello comune.
- **REA autentica e selettiva** per grandi blocchi riusabili; donor senza prove non produce una feature.
- **Grafica, 2D e 3D davvero curate**, non meri test verdi; una scena utile e accessibile prevale su effetti decorativi.
- **Correggere il sistema esistente**: evitare nuove auth, DB, API, LMS, motori e calendari per una stessa capacità.
- **Parallelo con convergenza**: writer indipendenti ma un integratore, contratti stabili, poche dipendenze e PR chiuse con gate, non grandi catene indefinite.
- **Costi espliciti**: non cambiare provider o sottoscrivere nuovi servizi senza un vantaggio concreto e misura delle spese; il vincolo del momento è lavorare senza disponibilità di crediti Codex.

### 31.3 Divergenze o problemi tuttora aperti

| Tema | Visione/documento iniziale | Decisione o realtà successiva | Esito corretto |
|---|---|---|---|
| Prodotto | lavagna local-first + ecosistema universale | Web course-first per Semestre Filtro, Core remoto | **integrare** ingressi e kernel; niente due prodotti; local-first completo non dimostrato |
| Primo verticale | ELABTutor/Simulation, poi Exam Trainer Billò | quattro Fisica e Fluidi/Termo priorità | priorità **superata**, contenuti storici rinviati; eLab attivo **rimosso** |
| Contenuti | generazione massiva e test automatici | 200 sotto-obiettivi DRAFT, 0 accettati | non dichiarare «completi» senza reviewer umano e transfer |
| Modello 3D | scene spettacolari, Tinkercad-like | solo modelli verificati, Three.js on-demand nel ramo | non chiamare modulo 3D «live» finché manca mount e browser remoto |
| Identità | ruoli per contesto e più organizzazioni | nucleo implementato con global role per principal | modello organizzativo complessivo **non realizzato** |
| Lavoro offline | PRD v2 P0 completo senza account | Study edition cloud-authoritative, snapshot locale e formati distinti | conflitto architetturale non risolto end-to-end |
| AI | modelli locali/remoti, tutor adattivo generalista | calcoli deterministici e AI proposta, runtime AI-off importante | nessun claim di personalizzazione generativa globale già attiva |
| Knowledge | grafo/Library personale universale | note e connessioni scoped implementate | non confondere con stima mastery calibrata |
| Monetizzazione | SaaS + marketplace 70/30, zero fee lezioni | microcorsi e lezioni a pagamento come primo wedge | prezzi e commissioni di lungo termine **non approvati** |
| Deploy | CI verde/preview protetta | 503/remote not configured in evidenze recenti | rilascio ed esito browser su target finale **obbligatori** |
| Grafica | più direzioni/UI visuali e donor | 36 riferimenti e una gerarchia da convergere | scelta estetica finale e prova su dispositivi ancora gate |
| Governance | tante PR parallele, subagent e branch | requisiti di minimizzare dipendenze e chiudere PR | non riaprire roadmap indefinite né inventare merge |

### 31.4 Questioni che necessitano di decisione o prova futura

Non sono specifiche già deliberate in forma univoca: tariffario definitivo e canali pagamento; commissione plugin/lezioni; licenze e distribuzione marketplace; modello completo organizzazioni/ruoli; portabilità universale `.ardesia` e sync local-first/cloud; ASR/registrazioni live; supporto locale dei modelli AI e quota API; esperienza docente penna/iPad nativa; completamento reale della collaborazione sincrona; calendario Google live; retention/cancellazione dei dati reali e policy minori; KPI di apprendimento e programma di ricerca; modello di fatturazione e assistenza; distribuzione ufficiale su ChatGPT/MCP directories; monetizzazione di strumenti fisici. Non trasformare l'assenza di una decisione in un sì automatico.

## 32. Traguardi e Definition of Done (senza confondere gli omonimi)

**Due sistemi di gate coesistono e hanno significati differenti**:
- Le specifiche V4/V4.1 chiamavano `G0` una prova sintetica su tutor/studenti/corso/diario e `G1` un passo di beta hosted; altre specifiche REA chiamano `G0/G1` le proprie acquisizioni.
- Il contratto **Chiusura 1 del 28 ottobre** usa `G0` baseline e identità, `G1` prova remota sintetica reale, `G2` copertura corso/laboratori, `G3` qualità visuale/2D/3D, `G4` CI/provenienza/rilascio e gate umani. Questi gate sono **contratti della Chiusura 1**, non certificazioni già superate.

Il dossier strategico dello stesso giorno distingue la roadmap **M0–M6**:

| Tappa | Uscita verificabile | Non è sufficiente |
|---|---|---|
| **M0 Perimetro** | SHA baseline, identità di lezione/coursepack, inventario interazioni, rubrica, stati visivi, confini | elenco di idee o screenshot |
| **M1 Rischio remoto** | tutor e due studenti reali nel runtime distribuito controllato; fonte, consegna, ripresa, revoca, isolamento, costo | test solo loopback, demo senza Auth |
| **M2 Una lezione completa** | spiegazione, fonte, previsione, manipolazione, audio, nota, feedback, transfer e recupero versionati | buona animazione o un quiz |
| **M3 Qualità e affidabilità** | 3D analitico dove serve, alternativa 2D, test mobile/touch/tastiera, error states, prestazioni, eLab assente, DoD D01–D60 e D64 | CI verde senza review UX |
| **M4 Utenti e rilascio** | pilota osservato, revisione umana, publish/rollback/verifica sulla URL, D61–D63 e D65–D68 | un ambiente «READY» o screenshot |
| **M5 Riuso** | molla/secondo fenomeno con gli stessi contratti e senza secondo sistema | copiare il primo player |
| **M6 Quattro corsi** | percorso per tutte le famiglie del syllabus, verifiche e approvazioni per ogni target | 43 nuclei DRAFT o 4.000 JSON |

La **Chiusura 1 operativa** del 28 ottobre amplia l'orizzonte immediato a Fluidi/Termodinamica attraverso collaboratori 1A/1B/1C, ma l'albero combinato deve superare gli stessi **principi di accettazione**. Le misure sintetiche non sostituiscono cinque studenti reali, il revisore scientifico e una distribuzione che funziona dopo il merge.

### 32.1 Criterio minimo per chiamare «finita» una funzione

È *DONE* quando uno studente/docente autorizzato può raggiungerla e comprenderla sulla versione prevista; essa tratta correttamente gli input e i casi negativi; conserva il lavoro dopo refresh e cambio contesto; le sue fonti e i suoi risultati sono riproducibili; ha una modalità accessibile; la revisione e lo stato dei contenuti sono espliciti; il browser di destinazione e il backend richiesto sono verificati; tutte le dipendenze e le licenze sono documentate; i difetti noti e i limiti sono esposti, non nascosti da copy marketing. L'esito scolastico richiede **una verifica pedagogica separata**, non unicamente la sua correttezza tecnica.

## 33. Perimetro della ricostruzione: ciò che è incluso senza diventare promessa

Questo documento conserva intenzionalmente elementi lontani dal primo rilascio: prodotti open-core/federabili, piani e marketplace creator, rete sociale/Discover, plugin no-code/SDK, import da app esterne e grafi personali, workspace unico su più dispositivi, esperimenti con modelli piccoli AI locali, circuiti e Arduino estesi, ExamForge/Exam Trainer Billò, supporto a strumenti fisici, app native iPad, interoperabilità con LMS e social educational. **Sono pezzi della storia/visione, non funzionalità obbligate della Chiusura 1 e non prove di disponibilità.** Alcune idee conversazionali estranee ad Ardesia (ad esempio un'architettura sperimentale di reti AI per memoria, negozi gestiti da agenti o altri progetti) non vengono inglobate automaticamente solo perché discusse vicino ad Ardesia.

Non sono stati mutati repository, PR, Vercel, credenziali, ambienti o dati degli studenti durante questa ricostruzione.

---

# Appendici di tracciabilità

Le appendici riportano **in forma tabellare fedele** le righe di due documenti dell'utente recuperati dalla Library. Non sono interamente riscritte in chiave di stato attuale: preservano l'identificativo e la formulazione originale per impedire che un requisito scompaia in una parafrasi. Per ogni nuova implementazione occorre applicare il contratto più recente e verificare se il requisito sia ancora pertinente. Le priorità `P0` del luglio non diventano automaticamente `P0` del primo microcorso dell'ottobre.

## A. I 68 criteri D01–D68 (fonte: dossier decisionale 28/10/2026)

**Stato di accettazione:** requisiti da verificare sul candidato finale; la loro presenza qui non li certifica. Nel dossier si applicano alla lezione dimostrativa Poiseuille e al suo percorso di rilascio.

| ID | Requisito | Prova/criterio di accettazione |
|---|---|---|
| D01 | Una sola identità canonica della lezione nel corso Fluidi e termodinamica | Ingresso, pratica, fonte, feedback e ripresa riferiscono la stessa lezione/versione |
| D02 | Obiettivi circoscritti e prerequisiti espliciti | Il docente approva la mappa fra obiettivo, spiegazione e prova |
| D03 | Spiegazione completa per il perimetro scelto | Nessun salto logico indispensabile, placeholder o rimando a materiale ancora assente |
| D04 | Diagnosi, pratica, recupero e transfer distinti | Almeno un problema cambia la struttura del ragionamento, non soltanto i numeri |
| D05 | Revisioni scientifica ed editoriale umane | Nome del revisore, versione, osservazioni risolte e data, senza approvazioni generiche al progetto |
| D06 | Completamento, esito e aiuti sono concetti distinti | Aprire la scena o ottenere un numero corretto non attribuisce automaticamente padronanza |
| D07 | Prerequisiti minimi recuperabili | Poiseuille non viene presentato come primo argomento del syllabus se richiede concetti precedenti |
| D08 | Testo italiano curato | Terminologia, unità, punteggiatura, simboli, errori, titoli e suggerimenti riletti nell'interfaccia |
| D09 | Ipotesi e dominio dichiarati | Fluido newtoniano incomprimibile, regime laminare stazionario e sviluppato, tubo cilindrico rigido, condizioni alla parete coerenti |
| D10 | Raggio doppio, pressione differenziale fissata | Portata ×16; velocità media ×4; area ×4 |
| D11 | Raggio doppio, portata fissata | Pressione differenziale ÷16; velocità media ÷4 |
| D12 | Viscosità e lunghezza raddoppiate, portata e raggio fissati | Pressione differenziale ×4 |
| D13 | Scena, numeri, grafico e formula coerenti | Derivano dallo stesso stato fisico; controlli indipendenti sui casi analitici |
| D14 | Unità, arrotondamenti e tolleranze espliciti | Nessuna risposta corretta respinta per formattazione equivalente; nessuna incoerenza dimensionale accettata |
| D15 | Input degeneri e limiti | Raggio/viscosità/lunghezza non positivi, campo vuoto e fuori intervallo gestiti prima del calcolo; niente NaN/Infinity visibili |
| D16 | Animazione non ingannevole | Traccianti medi o locali dichiarati; eventuale profilo rispettato; densità grafica non confusa con portata |
| D17 | Regime laminare trattato onestamente | Con soli rapporti è un'ipotesi, non un regime numericamente verificato; dati assoluti richiedono un riferimento fisico approvato |
| D18 | Limiti del modello | Nessuna promessa di descrivere turbolenza, stenosi, sangue reale o CFD generale |
| D19 | Ingresso leggibile | Lo studente riconosce obiettivo, stato e prima azione senza una spiegazione dell'operatore |
| D20 | Navigazione coerente | Avanti, indietro, ritorno al corso, refresh, URL diretto e cronologia browser preservano il contesto previsto |
| D21 | Vincolo sempre identificabile | Cambio fra pressione e portata fissate aggiorna etichette, valori, scena e feedback; l'utente capisce che è un altro esperimento |
| D22 | Slider e campi concordi | Mouse, tastiera e touch portano allo stesso valore; min/max, passi, decimali con virgola e incolla hanno regole comprensibili |
| D23 | Manipolazione 3D controllabile | Nessun trascinamento ambiguo fra raggio, camera e scroll; camera iniziale leggibile e ripristino prevedibile |
| D24 | Pausa e ripristino corretti | Pausa ferma l'animazione, non cambia la legge fisica; reset distingue stato del modello e lavoro già consegnato |
| D25 | Previsione conservata | Confronto, nuova manipolazione e cambio passo non riscrivono il tentativo precedente |
| D26 | Feedback specifico | Distingue vincolo errato, raggio/area, portata/velocità, esponente e unità; spiega il passo utile invece di un generico «sbagliato» |
| D27 | Esplorazione rispettata | Vedere risultati e usare aiuti nell'esplorazione non viene trattato come una penalizzazione; l'assistenza è registrata quando rilevante alla prova |
| D28 | Fonte e annotazione | Apri, chiudi, seleziona, modifica, annulla e riapri funzionano sul riferimento esatto; nessun salto a una fonte sostitutiva silenziosa |
| D29 | Dialoghi e focus | Apertura, Escape, conferma, annullamento e ritorno del focus funzionano; niente interazioni invisibili sotto un overlay |
| D30 | Stati intermedi curati | Caricamento, vuoto, disabilitato, salvataggio, successo, errore ed esito incerto hanno messaggi e azioni coerenti |
| D31 | Uscita dal lavoro | Nessuna perdita silenziosa; conferma proporzionata alle modifiche effettivamente non salvate |
| D32 | Microtesti orientati allo studente | «Salvato» o «Risposta consegnata» dove appropriato; niente Core, CAS, adapter o chiavi tecniche nel percorso ordinario |
| D33 | Una sola direzione visiva | Schermate approvate di ingresso, manipolazione, errore, aiuto e ripresa; stesso sistema di testo, spaziatura, colori e controlli |
| D34 | Gerarchia del compito | Una scena/attività principale; pannelli secondari contestuali; niente dashboard obbligatoria prima di iniziare |
| D35 | Responsive intenzionale | Verifica a 360/390, 820 e 1440 px, portrait/landscape pertinenti; testo, formule e azioni non tagliati |
| D36 | Accesso senza mouse | Percorso completo via tastiera; nomi accessibili, ordine e focus visibile; nessun compito essenziale soltanto drag |
| D37 | Alternative alla scena | Dati, formula e descrizione accessibili; fallback 2D completo quando WebGL manca o viene perso |
| D38 | Movimento e colore | Riduzione del movimento rispettata; significato non affidato soltanto al colore; contrasto verificato |
| D39 | Audio accessibile | Trascrizione completa e coerente; niente autoplay; azioni del player accessibili |
| D40 | Dispositivi reali della promessa | Chrome/Firefox desktop, Safari e tablet previsto verificati; la penna richiede una prova su dispositivo fisico prima di prometterne qualità |
| D41 | Leggibilità sotto stress | Zoom del testo, formule lunghe, messaggi di errore e contenuto di esempio realistico non rompono il layout |
| D42 | Audio remoto realmente disponibile | Nessun import `.lesson` nascosto richiesto allo studente per ascoltare il passaggio della lezione |
| D43 | Versione e ancoraggio | Audio, trascrizione, fonte e timecode appartengono alla versione approvata |
| D44 | Player affidabile | Play/pausa, seek, fine, buffering, errore e retry provati; un rientro non riproduce un altro passaggio |
| D45 | Salvataggio confermato | «Salvato» compare solo dopo riscontro autorevole; stato locale temporaneo distinguibile |
| D46 | Ripresa reale | Refresh, browser nuovo e secondo dispositivo autorizzato ritrovano passo, risposta, nota, aiuti e feedback confermati |
| D47 | Commit con risposta persa | Retry con la stessa identità di comando non duplica consegna o feedback |
| D48 | Concorrenza e conflitti | Due tab o due modifiche non sovrascrivono silenziosamente; scelta di recupero comprensibile |
| D49 | Sessione scaduta | Riautenticazione e recupero senza attribuire il lavoro all'account successivo |
| D50 | Revisione editoriale nuova | Vecchi tentativi restano legati alla fonte e al problema usati; migrazione esplicita e verificabile |
| D51 | Crash e lavoro locale | Autosalvataggi confermati sopravvivono; eventuale intervallo non ancora salvato dichiarato, recupero locale limitato e isolato se previsto |
| D52 | Backup e ripristino | Prova concreta su dati sintetici del verticale, inclusi riferimenti media e autorizzazioni; non basta che il provider dichiari backup |
| D53 | Identità reali e ruoli | Un docente e due studenti distinti; niente scorciatoie sintetiche nel runtime distribuito |
| D54 | Isolamento e revoca | Fonte privata, risposta, nota, URL copiato e sessione revocata provati contro accessi non autorizzati |
| D55 | Dati e media controllati | Validazione input, limiti upload dove presenti, sanificazione rendering, diritti degli asset, gestione di cancellazione e conservazione definita |
| D56 | Un'autorità dei dati | Niente secondo store di progresso, scoring, memoria o scheduler per aggirare un'integrazione |
| D57 | Manutenibilità | Separazione comprensibile fra modello scientifico, stato educativo, trasporto e renderer; dipendenze bloccate e documentazione minima utile |
| D58 | Test del rischio reale | Controprove scientifiche, contratti Core, isolamento, un percorso E2E completo e recuperi principali; niente quantità di test usata come surrogato di qualità |
| D59 | Prestazioni misurate | Dispositivo e rete dichiarati, budget concordati, niente misure del solo computer dello sviluppatore |
| D60 | Diagnostica operativa | Errori e versioni ricostruibili senza esporre token o risposte private nei log; procedura di ripristino conosciuta |
| D61 | Identità del rilascio | Commit, build, flag, contenuti e ambiente corrispondono alla versione accettata; CI richiesta verde |
| D62 | Browser dopo pubblicazione | Percorso reale verificato sulla URL destinata agli utenti con servizi effettivi, non soltanto su localhost |
| D63 | Ritorno alla versione precedente | Rollback esercitato su candidato e compatibilità dei dati dichiarata |
| D64 | eLab eliminato dal prodotto | Nessun ingresso, plugin «Sim» rinominato, consumer o dipendenza runtime residua; storia conservabile come archivio |
| D65 | Revisione visiva nell'interazione | Andrea valuta i cinque stati principali in uso, non soltanto un mockup statico |
| D66 | Osservazione di almeno cinque studenti rappresentativi | Almeno quattro su cinque completano i compiti UX principali senza suggerimenti dell'operatore; tutti i blocchi ricorrenti vengono risolti |
| D67 | Transfer separato dall'usabilità | Risposte e motivazioni confrontate con rubrica; un insuccesso concettuale non viene nascosto da una UI facile |
| D68 | Chiusura dei difetti del perimetro | Nessuna perdita dati, errore scientifico, accesso indebito, funzione promessa assente o blocco del percorso; le rifiniture approvate sono effettivamente presenti |

## B. I 116 requisiti funzionali e non funzionali del PRD v2 del 13/07/2026

**Stato:** registro storico di visione e progettazione evidence-first; le priorità del luglio non attestano uno scope implementativo dell’ottobre. `P0`, `P1`, `P2`, `P3` restano le categorie del PRD originale.

| ID | Priorità storica | Specifica | Accettazione storica |
|---|---|---|---|
| CORE-001 | P0 | Un solo modello logico di utente, Lesson, PluginInstance, Pack, eventi, Knowledge e Library. | Nessuna copia divergente tra modalità Study/Teach/Create. |
| CORE-002 | P0 | Modalità locale completa senza account. | Creazione, uso, save/reopen ed export del percorso pilot offline. |
| CORE-003 | P0 | Import/export LessonPackage lossless. | Round-trip preserva ID, eventi, asset, plugin state, link e provenance. |
| CORE-004 | P0 | Una mutazione durevole emette un LessonEvent. | Test negativo impedisce write bypass. |
| CORE-005 | P0 | Proiezioni ricostruibili. | Knowledge/Library ricostruibili dal log e dagli asset. |
| CORE-006 | P0 | Asset con hash, provenance, scope e revisione. | Nessun blob orfano soddisfa il gate. |
| CORE-007 | P1 | Workspace modes Study/Teach/Create senza oggetti duplicati. | Cambio mode mantiene la stessa Lesson e istanze. |
| CORE-008 | P1 | Entitlement centralizzato e downgrade non distruttivo. | Testa piano change senza perdita o lock-out export. |
| CORE-009 | P1 | StorageProvider intercambiabile. | Contract test locale + provider opzionale. |
| CORE-010 | P1 | Connector capability gateway. | Nessun provider secret nel client. |
| CORE-011 | P1 | Observability con exact SHA/versioni. | Ogni errore runtime include release e instance context. |
| CORE-012 | P2 | Multi-device sync con conflict policy esplicita. | Nessun overwrite silenzioso. |
| ROLE-001 | P0 | Ruoli e piani modellati separatamente. | Una persona può avere più ruoli e un set di entitlement. |
| ROLE-002 | P0 | Creazione locale plugin disponibile a ogni ruolo. | Nessun gate teacher-only sul creator locale. |
| ROLE-003 | P1 | Publishing e monetizzazione richiedono eligibility. | Enforcement server-side e audit. |
| ROLE-004 | P1 | Knowledge personale privato per default. | Marketplace non può interrogarlo. |
| ROLE-005 | P2 | Ruoli scoped a group/lesson/workspace. | Grant/revoke testati. |
| PLUG-001 | P0 | Manifest strict con id, versione, kind, capability, integrity, privacy e publisher. | Unknown key reject e contract test. |
| PLUG-002 | P0 | PluginInstance con stable instanceId e stato versionato. | Compact/expanded/reload mantengono ID. |
| PLUG-003 | P0 | Storage namespaced per istanza. | Collision test multi-instance. |
| PLUG-004 | P0 | Capability deny-by-default. | Chiamata non dichiarata fallisce chiusa. |
| PLUG-005 | P0 | PluginLink tipato, detachable e senza ownership implicita. | Attach/detach/reopen test. |
| PLUG-006 | P0 | Clone genera nuova identità senza collisioni. | Clone test su state, links, events e asset refs. |
| PLUG-007 | P0 | Surfaces polimorfiche sulla stessa istanza. | Board/panel/fullscreen condividono state. |
| PLUG-008 | P0 | Lifecycle e terminal states. | Ogni transizione ha test e rollback. |
| PLUG-009 | P0 | Package export/import portabile. | Import su workspace vuoto produce stessa semantica. |
| PLUG-010 | P0 | First-party non bypassa il contratto senza ADR. | Boundary gate. |
| PLUG-011 | P1 | Dependency graph e cycle detection. | Ciclo rifiutato con diagnostica. |
| PLUG-012 | P1 | Capability negotiation/version compatibility. | Incompatibilità degrada senza corruzione. |
| PLUG-013 | P1 | Update, migration, rollback, disable, uninstall. | Test upgrade/downgrade. |
| PLUG-014 | P1 | Sandbox preview e permission review. | No network/secret leakage. |
| PLUG-015 | P1 | Creator tecnico e no-code convergono sullo stesso package. | Artifact byte/schema-compatible. |
| PLUG-016 | P2 | Registry private/unlisted/public. | Visibility enforcement. |
| PLUG-017 | P2 | Licenze e modelli free/open/paid/subscription/seat. | Manifest/listing coerenti. |
| LESSON-001 | P0 | Lesson creation e reopen. | Same room/context after reload. |
| LESSON-002 | P0 | Taccuino e lavagna complementari. | Stessa istanza referenziabile senza clone. |
| LESSON-003 | P0 | Undo/redo sulle mutazioni semantiche. | Replay e redo invalidation. |
| LESSON-004 | P0 | Snapshot/recovery. | Corruzione testata senza perdita silenziosa. |
| LESSON-005 | P1 | Export PDF/Markdown/JSON/LessonPackage. | Artifact con provenance. |
| KNOW-001 | P0 | Knowledge derivato da eventi reali. | Nessun fixture node in acceptance. |
| KNOW-002 | P0 | Ogni nodo/edge ha provenance. | Click mostra source event/asset. |
| KNOW-003 | P0 | Empty/error state onesti. | Nessun grafo inventato. |
| KNOW-004 | P1 | Navigazione concept→evidence→source→plugin. | Round-trip al contesto. |
| KNOW-005 | P1 | Mastery separa self-report e prova. | Schema e UI distinguono signal types. |
| KNOW-006 | P1 | Vista accessibile alternativa al grafo. | Lista/tree keyboard e screen-reader. |
| LIB-001 | P0 | Library indicizza asset reali con hash. | Dedupe e reload. |
| LIB-002 | P0 | Library apre lo stesso asset/istanza. | No copy divergence. |
| LIB-003 | P1 | Search/filter/sort/collections. | Test su real assets. |
| LIB-004 | P1 | Licenza/review/provenance visibili. | Metadata completeness. |
| AI-001 | P0 | Nessuna API key privilegiata nel client. | Secret scan e bundle audit. |
| AI-002 | P0 | Provider adapter tipato e sostituibile. | Fake deterministica nei test. |
| AI-003 | P0 | Funzionamento senza provider live. | Golden path offline. |
| AI-004 | P0 | GroundedResult con sourceRefs e unsupportedClaims. | Schema validation. |
| AI-005 | P0 | INSUFFICIENT_SOURCE fail-closed. | Test domanda source-missing. |
| AI-006 | P1 | Artifact labeling human/assisted/generated. | UI + export metadata. |
| AI-007 | P1 | Review workflow prima di publish. | Cannot publish draft-ai. |
| AI-008 | P1 | Cost/retention/provider disclosure. | Consent/preview. |
| AI-009 | P1 | Eval suite per citations/correctness/privacy. | Versioned eval report. |
| DISC-001 | P2 | Catalogo unificato con tipi distinti. | Plugin/Pack/workflow/person/offering leggibili. |
| DISC-002 | P2 | Profili con portfolio e offerte. | Contact path e provenance. |
| DISC-003 | P2 | Review verificate separate per dimensione. | No single opaque score. |
| DISC-004 | P2 | Ranking spiegabile e fairness cold-start. | Why shown + sponsored label. |
| DISC-005 | P2 | Report/block/moderation. | Abuse flow test. |
| MKT-001 | P2 | License grant e install dopo acquisto. | Download/reopen verified. |
| MKT-002 | P2 | Checkout/payout via provider sandbox. | No money before legal/release gate. |
| MKT-003 | P2 | Refund/dispute/tax policy. | State machine and audit. |
| MKT-004 | P2 | Plagiarism/provenance/takedown. | Cannot sell unlicensed source. |
| GROUP-001 | P1 | Gruppo di studio con membership e obiettivo. | Create/join/leave/export. |
| GROUP-002 | P1 | Stato personale separato dal condiviso. | Private attempts not readable by peers. |
| GROUP-003 | P2 | Sessioni e asset condivisi. | Permissions and artifact ownership. |
| GROUP-004 | P2 | Lezioni di gruppo con facilitator. | Capacity, role, recap, follow-up. |
| GROUP-005 | P2 | Moderazione e block. | Safety scenarios. |
| EXAM-001 | P0 | Exam Trainer come plugin generico. | Nessun riferimento Billò nel core del plugin. |
| EXAM-002 | P0 | Pack Billò separato e versionato. | Manifest/hash/source map. |
| EXAM-003 | P0 | 15 domande seed con testo originale e normalizzato. | Count and provenance test. |
| EXAM-004 | P0 | Source coverage per domanda. | Supported/partial/ambiguous/missing. |
| EXAM-005 | P0 | Nessuna risposta inventata per source-missing. | UI + AI fail test. |
| EXAM-006 | P0 | Cronologico deterministico. | Stable order test. |
| EXAM-007 | P0 | Random seedato senza repeat prematuro. | Property tests. |
| EXAM-008 | P0 | Libero per topic/tipo/coverage. | Filter tests. |
| EXAM-009 | P0 | Progressive reveal. | Answer hidden until explicit action. |
| EXAM-010 | P0 | Confidence e recall separati. | Persistence and event test. |
| EXAM-011 | P0 | Fonte apribile. | Source ref points to correct page/asset. |
| EXAM-012 | P0 | State/reload completo. | Browser round-trip. |
| EXAM-013 | P0 | LessonOS events. | Sequence/causation/evidence tests. |
| EXAM-014 | P0 | Knowledge/Library real projections. | No mock data. |
| EXAM-015 | P1 | AI rephrase/hint/variant grounded. | Provider + fallback. |
| EXAM-016 | P1 | Adaptive honest. | Uses explicit signal model; no scientific claim. |
| EXAM-017 | P1 | Session report/export. | JSON/Markdown with provenance. |
| NFR-SEC-001 | P0 | Capability e authorization deny-by-default. | Negative tests per endpoint/method. |
| NFR-SEC-002 | P0 | Firma/hash/rehash package. | Tamper at install e mount rifiutato. |
| NFR-SEC-003 | P0 | No secrets/PII/corpus nel repo e nei log. | CI scan + manual audit. |
| NFR-SEC-004 | P1 | SAST/dependency/SBOM/CVE gates. | Report per release. |
| NFR-SEC-005 | P1 | Threat model per ToolHost, AI, marketplace e groups. | Mitigazioni owner/stato. |
| NFR-PRIV-001 | P0 | Local-first e data minimization. | Golden path senza account. |
| NFR-PRIV-002 | P0 | Export/delete comprensibili. | User-visible control and audit. |
| NFR-PRIV-003 | P1 | Consent e provider disclosure. | No remote processing implicit. |
| NFR-PRIV-004 | P1 | Knowledge privato separato da marketplace analytics. | Access control tests. |
| NFR-REL-001 | P0 | Nessuna perdita dati su reload/close/reopen. | Repeat browser test. |
| NFR-REL-002 | P0 | Idempotenza e replay. | Duplicate event no double effect. |
| NFR-REL-003 | P0 | Failure isolation plugin. | Crash plugin non abbatte workspace. |
| NFR-REL-004 | P1 | Recovery da corruzione. | Backup/restore/reopen test. |
| NFR-PERF-001 | P0 | Interazione fluida su device target. | Budget definito e misurato su scene realistiche. |
| NFR-PERF-002 | P1 | Bundle/code splitting. | No uncontrolled growth; report chunk. |
| NFR-PERF-003 | P1 | AI latency e cancel. | Progress, timeout, retry. |
| NFR-A11Y-001 | P0 | WCAG AA per percorsi essenziali. | axe/manual keyboard/screen-reader checks. |
| NFR-A11Y-002 | P0 | Touch target ≥44 CSS px. | Viewport probes. |
| NFR-A11Y-003 | P0 | Reduced motion e non-color state. | Automated/manual checks. |
| NFR-PORT-001 | P0 | Formati versionati e documentati. | Schema fixtures e migration tests. |
| NFR-PORT-002 | P0 | Nessun lock-in su export. | Import in fresh workspace. |
| NFR-OBS-001 | P0 | Exact SHA e versioni in runtime evidence. | Release tag in error/event. |
| NFR-OBS-002 | P1 | Error monitoring con PII masking. | Synthetic error test. |
| NFR-TEST-001 | P0 | Unit/integration/browser per contratti. | CI required jobs. |
| NFR-TEST-002 | P0 | Test dopo ultima modifica sul candidate SHA. | Verifier receipt. |
| NFR-DOC-001 | P0 | Claim register e source map. | Ogni claim importante ha evidence class. |
| NFR-DOC-002 | P1 | Docs aggiornate solo con prova e versione. | Drift audit. |

## C. Fonti primarie e revisioni consultate

1. [Repository](https://github.com/AndreaMarro/ardesia), `main` `e857954847c56cd425753632f84cfaedde54239e` nell’ultima ricognizione; PR #328–#337 e relativi metadati/branch come fotografati il 28/10.
2. [Canoni](https://github.com/AndreaMarro/ardesia/blob/main/docs/CANON-INDEX.md), [ADR-0004](https://github.com/AndreaMarro/ardesia/blob/main/docs/adr/ADR-0004-study-core-and-provider-boundaries.md), [ADR-0006](https://github.com/AndreaMarro/ardesia/blob/main/docs/adr/ADR-0006-change-tolerance-and-growth.md), [Decisioni di esecuzione](https://github.com/AndreaMarro/ardesia/blob/main/docs/ops/ARDESIA-DECISIONS.md).
3. [V4 specs](https://github.com/AndreaMarro/ardesia/tree/main/docs/ardesia-v4/specs) 01–15; [Closure1 contract](https://github.com/AndreaMarro/ardesia/blob/main/docs/ops/closure1-20261028/contract.md) e [matrice](https://github.com/AndreaMarro/ardesia/blob/main/docs/ops/closure1-20261028/coverage-matrix.md).
4. [Quattro corsi](https://github.com/AndreaMarro/ardesia/blob/main/matrici/QUATTRO_CORSI.md), [quattro corsi delivery](https://github.com/AndreaMarro/ardesia/blob/main/docs/ops/four-courses-2026-10-25/README.md), [banca Fisica](https://github.com/AndreaMarro/ardesia/blob/main/packs/semestre-filtro-2026-27/README.md).
5. [Studio UX canon](https://github.com/AndreaMarro/ardesia/blob/main/docs/product/ARDESIA-PLUGIN-ON-PAPER-UX-SPEC.md), [Circuit Tutor](https://github.com/AndreaMarro/ardesia/blob/main/docs/product/ELECTROTECHNICS-SOLVER-PACK.md), [ExamForge](https://github.com/AndreaMarro/ardesia/blob/main/docs/product/EXAMFORGE-PACK.md), [Simulation Plugin legacy](https://github.com/AndreaMarro/ardesia/blob/main/docs/architecture/simulation-plugin-v2.md), [S19](https://github.com/AndreaMarro/ardesia/blob/main/handoffs/swarm-v2/S19/README.md), [S05](https://github.com/AndreaMarro/ardesia/blob/main/handoffs/swarm-v2/S05/README.md).
6. PRD recuperato dalla Library: `ARDESIA-PRD-v2.0-EVIDENCE-FIRST-2026-07-13.md`; dossier recuperato: `Ardesia_documento_decisionale_2026-10-28.md`. Le due fonti sono redazioni storiche con limiti dichiarati e informazioni di runtime che possono essere successive o superate.
7. Conversazioni rilevanti richiamate: definizione originale 23 giugno; estensioni plugin/visione luglio; architettura local-first/Notebook e audit agosto; ridefinizione corso-first e LessonOS ottobre 2026; convergenza 24–28 ottobre. Recupero storico per tema, non esportazione integrale di ogni trascrizione.

**Regola di pubblicazione del presente documento:** è una SPECIFICA RICOSTRUITA, non un attestato «ARDESIA COMPLETATA» né un aggiornamento del codice. Le parti future e le PR aperte rimangono visibili con il proprio stato.


---

## D. Atlante 27 ottobre — collegamento dei 36 modelli visivi alle specifiche

**Integrato il 28 ottobre 2026.** In questa revisione sono stati recuperati **tutti i 36 PNG originali** dalla Library e ispezionati come miniature d'insieme; le tavole centrali B01–B04, R05/R07/R08, G01/G02 e O03 sono state osservate anche singolarmente. La fonte canonica dell'inventario è `docs/design/visual-reference-library/README.md` del ramo `docs/visual-references-3d-physics-20261027`, che conserva tre file di *specifica/ricerca*, mentre i PNG non sono inclusi come binari in quel ramo. Le immagini sono **mockup di direzione prodotto**, non screenshot di una funzione operativa. Riferimenti eLab, etichette di «approvato», simulatore LED, percentuali, profili, ricavi e sincronizzazione nei mockup non sono automaticamente verificati e **non autorizzano il ripristino di eLab** dopo #332.

### D.1 Regola di composizione dei modelli

I modelli **B03 + B04** indicano la **Lavagna del docente**; **G01** il **Taccuino/Notebook**; **B01 + B02** l'organizzazione spaziale e i collegamenti; **O03 + R04** l'accesso al grafo/Knowledge; **A01** la lettura. Sono **superfici differenti degli stessi identificativi di Lesson, ResourceVersion, PluginInstance e Link**, non sei prodotti autonomi. R05 illustra il percorso narrativo di una lezione con strumento scientifico, ma il riferimento al pacchetto eLab è obsoleto.

**Base verificabile oggi:** Excalidraw e Room/Studio, ToolHost e registro strumenti, formula MathLive, fonti/revisioni Core, event log, memoria e grafo, layer per autore e componenti specialistici risultano in varia misura presenti; nessuna di queste evidenze certifica che il risultato grafico dei mockup sia già ottenuto, né una collaborazione remota contemporanea generale. Lo screenshot isolato non è un acceptance test.

### D.2 Matrice immagine → funzione → contratto → prova di accettazione

| Immagine originale | Cosa rappresenta | Sezioni di questa specifica | Riferimento canonico | Priorità e trattamento | Prova richiesta |
|---|---|---|---|---|---|
| `R01_baseline_collage_dashboard_graph_student_schema.png` | Collage iniziale: tutor, grafo, studente e schemi | §§3, 4, 10, 18 | `CORE-001; LESSON-002; KNOW-001` | SINTESI / non una nuova feature | I quattro ingressi riusano la stessa Lesson e risorse. |
| `R02_baseline_collage_lesson_pack_marketplace_plugin.png` | Collage: lezione, pack, marketplace, officina | §§6, 7, 11, 20 | `PLUG-002/007; LESSON-005; DISC-001` | SINTESI / visione compositiva | Una lezione genera pack citabile senza un secondo store. |
| `R03_dashboard_docente_baseline.png` | Cruscotto docente e coda evidenze | §§10, 18, 28 | `KNOW-002; AI-006; V4/02` | P1 / regia basata su evidenze | Indicatori e link provengono da ricevute reali, nessuna percentuale artificiale. |
| `R04_grafo_lezione_baseline.png` | Grafo di concetti, fonti, prove ed errori | §§10, 22 | `KNOW-001/002/003/004` | P1 / proiezione del Core | Aprire un nodo risolve la revisione esatta; revoca e revisione non risuscitano contenuti. |
| `R05_lezione_live_simulatore_baseline.png` | Lezione live con simulatore, fonte, aiuto, evento | §§4, 7, 8, 9, 15 | `LESSON-001/004; PLUG-002/007` | P0 / solo schema, eLab escluso | Inserire laboratorio indipendente, annotare, usare ricevuta Core, salvare e riaprire. |
| `R06_marketplace_baseline.png` | Catalogo plugin, pack e workflow | §§6, 20, 21 | `DISC-001; PLUG-001; MKT-001` | P2 / mercato commerciale rinviato | Non mostrare card acquistabili senza installazione/permessi reali; eLab eliminato. |
| `R07_student_pack_builder_baseline.png` | Costruzione pacchetto studio e ripasso | §§7, 10, 11, 12 | `LESSON-005; LIB-002; AI-006` | P1 / dopo la lezione completa | Export riapre fonti/revisioni/attività realmente autorizzate, con omissioni dichiarate. |
| `R08_studio_schemi_baseline.png` | Studio schemi dalle fonti, con approvazione | §§4, 10, 18, 22 | `KNOW-002/004; AI-006/007` | P1 / schemi proposti, non certificati | Separare proposta, modifica manuale e approvazione umana; link alle fonti esatte. |
| `R09_profilo_studente_traiettoria_baseline.png` | Traiettoria di apprendimento personale | §§10, 11, 18, 28 | `GROUP-002; KNOW-005; V4/13` | P1 / privato e osservazionale | Lo studente vede eventi, errori e transfer propri; non percentuali di competenza inventate. |
| `R10_officina_plugin_baseline.png` | Officina creator, manifest e sicurezza plugin | §§6, 20, 24 | `PLUG-001/003/004/008/015` | P2 / strumento creator, non primo rilascio | Un plugin firmato prova ciclo install/mount/save/reopen senza permessi extra. |
| `B01_miro_board_collaborativo.png` | Lavagna spaziale con gruppi, prove, relazioni | §§4, 5, 19, 22 | `LESSON-002; PLUG-005; GROUP-002` | P0 / riferimento per W0 | Gruppo/connessione non cambia l’ownership; nota e prova riaprono la fonte esatta. |
| `B02_miro_mappa_lezione_estesa.png` | Mappa lezione estesa e inspector oggetti | §§4, 5, 10 | `PLUG-002/005/007; KNOW-004` | P1 / estensione a W0 | Trascina e collega card senza duplicare oggetti; pannello legge dati, non crea autorità. |
| `B03_workshop_docente_annotazioni.png` | Workshop: penna, frecce, evidenze, suggerimenti | §§4, 7, 10, 18 | `LESSON-003/004; KNOW-002; AI-007` | P0 / modello principale W0 | Annotazione a penna e commento ancorati a versione, con salvataggio/redo/reopen. |
| `B04_whiteboard_progettazione_lezione.png` | Progettazione: mappa, flusso, timeline, vista studente | §§3, 4, 7, 10 | `LESSON-002/004; KNOW-004` | P0/P1 / focus per W0, viste avanzate dopo | Passaggio Lavagna↔Aula conserva contesto, fonti, stato e permessi. |
| `O01_obsidian_vault_graph.png` | Vault personale e grafo | §§3, 10 | `KNOW-001/002; LIB-001` | P1 / conoscenza privata | Grafo proiettato da eventi e fonti; no dati fittizi per riempire spazio. |
| `O02_obsidian_grafo_lezione_dark.png` | Grafo di lezione in tema scuro | §§3, 10 | `KNOW-004/006` | P1 / vista alternativa | Navigazione concetto→evidenza→sorgente accessibile; scuro opzionale. |
| `O03_obsidian_workspace_split.png` | Editor+grafo+backlink+strumenti | §§3, 4, 10 | `KNOW-004; LIB-002` | P1 / split contestuale, non default | Selezione del nodo e ritorno al documento senza perdita della revisione. |
| `O04_obsidian_document_graph_dark.png` | Documento, grafo e plugin in un contesto | §§4, 6, 10 | `PLUG-007; KNOW-002/004` | P1 / composizione delle viste | Apri un plugin dal grafo senza nuove identità o provider di memoria. |
| `A01_reader_editoriale_apple_books.png` | Reader di lezione editoriale leggibile | §§3, 7, 10 | `LESSON-001; LIB-002` | P0 / lettura della lezione W0 | Testi, formule, fonte e attività leggibili; navigazione per tastiera/touch. |
| `G01_goodnotes_notebook_simulatore.png` | Taccuino scritto a mano con esperimento integrato | §§4, 5, 7, 15 | `LESSON-002; PLUG-002/007` | P0 / riferimento per W0 | Stesso oggetto vivo nel quaderno e nella lavagna; nota e esperimento si riaprono. |
| `G02_goodnotes_study_pack_planner.png` | Quaderno di ripasso personale | §§4, 10, 11, 12 | `LESSON-002/005; KNOW-005` | P1 / integrazione study | Stessa fonte in pagina/pack senza copia; nessuna mastery o serie gamificata inventata. |
| `AN01_analytics_docente_conoscenza_errori.png` | Analytics docente e priorità di recupero | §§10, 18, 28 | `KNOW-005; V4/13` | P1 / indicatori auditabili | Solo conteggi da prove, aiuti e tentativi verificati; no percentuali non calibrate. |
| `AN02_governance_schema_provenienza.png` | Governance degli schemi e qualità delle inferenze | §§10, 14, 22, 27 | `AI-006/007/009; KNOW-002` | P1 / gate scientifico | Un grafo proposto non si auto-approva; fonte/operatore/revisione sempre ispezionabili. |
| `P01_premium_ecosystem_home_creator.png` | Home ecosistema e attività creator | §§3, 20, 21 | `DISC-001; MKT-001` | P2 / visione, non home W0 | Mostrare servizi ed eventi esistenti; mai allestire feed o fatturato di fantasia. |
| `P02_social_marketplace_tutor_materiali.png` | Social discovery, tutor, materiali | §§20, 21 | `DISC-002/003/004` | P2 / marketplace e rete futura | Profilo e raccomandazione spiegabili con consenso e provenienza. |
| `P03_creator_storefront_premium.png` | Vetrina contenuti/strumenti di autore | §§20, 21 | `DISC-002; MKT-001/004` | P2 / distribuzione futura | Solo pack con versioni, licenze, publisher e diritti verificati. |
| `P04_plugin_marketplace_moderno.png` | Marketplace plugin in stile card | §§6, 20, 21 | `PLUG-001/013; MKT-001/002` | P2 / installazione reale prima della UI | Card mostra dati reali, compatibilità, permessi, install e rollback verificati. |
| `P05_profilo_docente_storefront_light.png` | Profilo pubblico del docente | §§18, 20, 21 | `DISC-002/003` | P2 / rispetto identità e privacy | Pubblicazione consapevole, contenuti e review realmente attribuiti. |
| `E01_filiera_ardesia_supply_chain.png` | Filiera: idea→produzione→verifica→utilizzo | §§6, 20, 21, 26 | `PLUG-001; AI-007` | P2 / visione di sistema | Ogni contenuto pubblicato ha fonte, revisione e risultato del gate. |
| `E02_command_center_ideazione_valore.png` | Centro operativo e metriche creator | §§18, 21, 28 | `KNOW-005; V4/09` | P2 / no cockpit iniziale | Ricavi, attività e prestazioni da ledger, mai dati inventati. |
| `E03_network_ecosystem_creator_dashboard.png` | Rete, collaborazioni e contenuti | §§20, 21 | `DISC-001/002; GROUP-001` | P2 / social network futuro | Ruoli, membership e pubblicazioni autorizzate, senza esporre fonti private. |
| `X01_dark_neon_plugin_cockpit.png` | Esperimento visivo dark neon | §§3, 27 | `V4/08` | ESPLORAZIONE / non baseline | Non assumere cockpit e neon come design system obbligatorio. |
| `X02_neobrutalist_creator_dashboard.png` | Esperimento neo-brutalista | §§3, 27 | `V4/08` | ESPLORAZIONE / non baseline | Accessibilità e leggibilità prima del trattamento tipografico decorativo. |
| `X03_gamified_learning_graph.png` | Grafo gamificato: XP e livelli | §§10, 11, 28 | `KNOW-005; V4/13` | ESPLORAZIONE / rinviare o evitare | Nessuna percentuale di competenza o XP non sostenuti da misure. |
| `MO01_moodboard_12_direzioni.png` | Moodboard dodici direzioni | §3 | `V4/08` | ESPLORAZIONE / scegliere una direzione | Il prodotto usa un unico design system, non dodici temi paralleli. |
| `D01_duplicato_social_home_feed.png` | Variante home social feed | §§3, 20 | `DISC-001` | DEFER / duplicato | Non introdurre un feed come ingresso principale per la lezione. |

### D.3 Requisiti trasversali della Lavagna W0 (prima chiusura visiva)

| ID proposto | Requisito osservabile | Legame alle specifiche esistenti | Gate minimo |
|---|---|---|---|
| `BOARD-W0-01` | Arrivare da Aula a una Lavagna che mostra **la stessa lezione canonica**, obiettivo e ritorno all'Aula | §§3/4/7/12, V4/08, `LESSON-001` | Navigazione andata/ritorno conserva courseId/lessonRef e autorizzazioni |
| `BOARD-W0-02` | Penna, evidenziatore, selezione, undo/redo e zoom fluidi; oggetti selezionabili | §4, V4/08, `LESSON-003` | Tratti, edit e undo/replay si preservano in stato e riapertura |
| `BOARD-W0-03` | Inserire un **laboratorio scientifico indipendente da eLab**, ancorato al suo modello/versione e configurazione | §§5/6/15, `PLUG-002`, `PLUG-007` | Inserimento, modifica parametro, snapshot, riapertura con risultato coerente |
| `BOARD-W0-04` | Formula, fonte e nota collegati al passaggio esatto e non a un testo generico | §§7/10/22, `KNOW-002`, `LIB-002` | `resourceId/revisionId` corretti dopo reload, revoca e fonte aggiornata |
| `BOARD-W0-05` | Quaderno e Lavagna mostrano **lo stesso oggetto e lo stesso stato**, senza clonare il plugin | §4, `LESSON-002`, `PLUG-007` | Cambiare vista preserva `instanceId`, parametri, riferimenti e posizione della vista |
| `BOARD-W0-06` | Pubblicazione e anteprima studente rispettano confini privato/condiviso | §§18/19/23, `GROUP-002` | Studente B non vede bozza o correzione personale di A; docente assegnato opera solo nello scope previsto |
| `BOARD-W0-07` | Layout sobrio editoriale e controlli contestuali; la lavagna resta dominante | §§3/5/27, V4/08, Plugin-on-Paper UX | Test visivo a 390/820/1440, focus e tastiera; nessuna sovrapposizione bloccante |
| `BOARD-W0-08` | Nessun dato «approvato», voto, padronanza, presenza, stato sync o audio senza evidenza reale | §§7/9/10/18/28, `KNOW-005`, `AI-006` | Fixture deliberatamente incomplete non producono indicatori falsi |

### D.4 Decisione sul prossimo intervento minimo

**Microtraguardo `BOARD-W0`: una sola lezione vera, con un foglio didattico ispirato a B03/B04, la naturalità di G01, il riferimento spaziale di B01 e fonte riapribile.** Nel caso Poiseuille: dall'Aula il docente apre la lezione, inserisce un diagramma/formula e l'esperimento già disponibile, scrive un'annotazione e la collega alla revisione precisa; salva, torna al corso, riapre e verifica lo snapshot; lo studente vede soltanto ciò che è stato condiviso. Se il Core remoto non è ancora pronto, il test locale è dichiarato locale e non sostituisce il gate remoto della Chiusura 1.

**Non fa parte di W0:** clone completo Miro, collaborazione live multiutente generale, sostituzione di Excalidraw, marketplace, creator, grafi infiniti come home, nuovi solver, 12 skin/moodboard, ricomparsa di eLab, nuova app parallela. Successive estensioni possono sviluppare il grafo O03/R04, i sub-post-it, il taccuino completo e la modalità presentazione sulla stessa base di identità e autorizzazioni.

### D.5 Fonti e statuto

- **Ardesia: PRD v2.0, 13 luglio 2026:** ARDESIA-PRD-v2.0-EVIDENCE-FIRST-2026-07-13.md — CORE-001, LESSON-002/003/004, PLUG-002/005/007, KNOW-001/002/004, LIB-002, GROUP-002.
- **Product Canon:** https://github.com/AndreaMarro/ardesia/blob/main/docs/PRODUCT-CANON.md — Una sola identità del prodotto e continuità fra lezione, fonte, prova, correzione e attività successiva.
- **Spec V4/03:** https://github.com/AndreaMarro/ardesia/blob/main/docs/ardesia-v4/specs/03_MEMORIA_POSTIT_E_MORFISMI.md — ResourceVersion, BoardView, Relation e morfismo di presentazione; vietato duplicare fonte e permessi.
- **Spec V4/08:** https://github.com/AndreaMarro/ardesia/blob/main/docs/ardesia-v4/specs/08_UI_UX_E_PRESTAZIONI.md — Flussi, layout, accessibilità, salvataggi, responsive e test dei gesti.
- **Plugin su carta UX:** https://github.com/AndreaMarro/ardesia/blob/main/docs/product/ARDESIA-PLUGIN-ON-PAPER-UX-SPEC.md — Post-it come oggetto, proximity, size mode, sub-post-it e serializzazione.
- **Acceptance 27 ottobre:** https://github.com/AndreaMarro/ardesia/blob/docs/visual-references-3d-physics-20261027/docs/design/visual-reference-library/ACCEPTANCE.md — Criteri espliciti di lavagna, corsi, simulazioni, test e consenso.
- **Atlante grafico 27 ottobre:** https://github.com/AndreaMarro/ardesia/blob/docs/visual-references-3d-physics-20261027/docs/design/visual-reference-library/README.md — Inventario nominale dei 36 PNG; binari in Library utente, non nel repository.

Le **36 immagini sono fonti visuali, non specifiche complete di runtime**, e i riferimenti esterni 3D non sono binari licenziati da Ardesia. I criteri sono nuovi punti di tracciabilità che concretizzano requisiti già decisi; non modificano le relative priorità commerciali né rendono vere schermate non pubblicate.
