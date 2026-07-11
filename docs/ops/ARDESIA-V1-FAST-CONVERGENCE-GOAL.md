# ARDESIA - Full Product Fast Convergence Goal

Status: EXECUTABLE FULL GOAL - V1 IS THE FIRST RELEASE GATE
Date: 2026-07-11
Canonical implementation repo: `AndreaMarro/ardesia`
Primary user: Andrea, docente in una lezione reale

Mandato canonico congelato per questa esecuzione:

- mandato completo: `/Users/andreamarro/.codex/attachments/3765288a-1527-43c5-a5cb-13de9c2da1e6/pasted-text-1.txt`,
  SHA-256 `4a59deec58d0e1ca23720da3a958a6d30148e71224f4be15ebc18476ea86916b`;
- addendum corrente: `/Users/andreamarro/.codex/attachments/c1f75ee2-e5ee-467e-b69a-02ca9ddf9742/pasted-text.txt`,
  SHA-256 `17000115531d1bacc62d06025f89a3bea5e1ac0342f364dd00ff8805e0186a50`.
- chiarimenti consolidati: `docs/ops/ARDESIA-MANDATE-ADDENDUM-20260711.md`,
  SHA-256 `c33f4a377aaa2a30337a3277c872284645edef5c92ee056f826b26dd03b2bfc4`.

La baseline e' l'unione ordinata delle tre fonti. Un cambio di hash, rimozione o
reinterpretazione richiede approvazione esplicita di Andrea e decision log.

Addendum vincolante 2026-07-11: massimizzare velocita', qualita' e riuso come
un progettista di prodotto. Tutti i link e i riferimenti forniti da Andrea
devono essere valutati; la ricerca deve trovare ulteriori soluzioni mature;
codice, asset e pattern open source/open licensed vanno adottati o adattati
quando riducono tempo e costo totale senza degradare il prodotto. Nessun
requisito esplicito puo' sparire per semplificazione dell'agente.

Chiarimento vincolante 2026-07-11: **ogni plugin e' un post-it/Knowledge Card e
non e' mai una pagina separata**. `Tinkercad parity` significa esperienza
equivalente dentro un post-it, tramite un'istanza del Simulation Plugin. Una
route Simulatore, un iframe Tinkercad, uno screenshot o una demo statica non
soddisfano il requisito.

## 1. Outcome

Costruire una prima versione di ARDESIA che Andrea possa usare realmente. Il
risultato deve essere professionale, attraente, innovativo, facile da usare,
rapido su iPad/LIM, locale-first, verificabile e migliorabile senza riscrivere
il core.

La V1 e' la prima matrice obbligatoria: accesso/local mode; creazione lezione;
**taccuino a pagine e lavagna infinita**, entrambi con mouse, touch e Pencil;
Knowledge Card; import PDF, immagine e audio; manuale ELAB; costruzione,
modifica, solve, diagnosi, undo/redo e
persistence del circuito LED; LessonOS, graph ed ElabTutor grounded;
Knowledge Explorer navigabile per lezione e insieme di lezioni; generazione di
appunti, esercizi e quiz; Library ordinata di audio, materiali, appunti e
artifact; storage locale o Drive; export PDF, Markdown e Lesson Package;
close/reopen; prova iPad e LIM.

Il circuito LED e' la prima spina verticale riutilizzabile, non una riduzione
del prodotto finale:

```text
crea lezione -> lavagna/notebook -> Knowledge Card -> manuale ELAB
-> Simulation Plugin -> costruisci/modifica circuito LED
-> solve e diagnosi -> undo/redo -> save/reopen
-> LessonOS -> graph -> ElabTutor grounded -> artifact -> export
```

`V1_GREEN` richiede evidenza sul deploy per ogni voce della matrice e una prova
Andrea senza assistenza tecnica bloccante.

`V1_GREEN` non conclude questo goal. Il risultato completo richiede inoltre:

- post-it/Knowledge Card che ospitano plugin reali, installabili e persistenti;
- creator flow tecnico e creator visuale docente;
- plugin che consumano capability pubbliche di altri plugin;
- dependency graph, semver, capability negotiation, cycle detection, startup
  deterministico, permission composition e failure isolation;
- Tinkercad parity completa secondo la matrice di placement, breadboard,
  componenti, wire, strumenti, Arduino, codice, seriale, plot, persistence,
  import/export, tutorial, touch, accessibilita', performance e AI control;
- piattaforma di contenuti, memoria, graph e materiali esportabili/vendibili
  descritta nel mandato, senza riduzioni implicite.
- Teacher Network e Marketplace: profili/portfolio, discovery sociale,
  pubblicazione e vendita di contenuti originali o AI-assisted, abbonamenti,
  reputazione, licenze, acquisto, payout e qualita' verificabile.
- Creator Ecosystem aperto: chiunque puo' creare plugin no-code o tecnici e
  scegliere se distribuirli gratuitamente, open source o monetizzarli; uso e
  composizione restano sempre nel modello plugin-post-it.
- separazione ruoli: il docente genera/approva/pubblica; lo studente non genera
  materiali ma consulta riassunti completi e interagisce con la propria
  conoscenza, esercizi, simulazioni e annotazioni private.

Il goal termina solo con `FULL_GOAL_GREEN`, non con una demo LED o una V1
ristretta.

### Topologia prodotto scelta

Poche pagine shell, nessuna pagina-plugin:

```text
Lezioni
  -> Taccuino a pagine
  -> Lavagna infinita
Knowledge Explorer
Library
Teacher/Creator Network + Marketplace
Impostazioni, account e connector
```

Gli oggetti canonici sono pochi e componibili:

```text
Lesson
LessonAsset
PluginInstance -> PostItFrame
LessonEvent -> graph/notes/analytics projections
ContentArtifact
PluginPackage
UserKnowledgeGraph
```

I servizi core hanno responsabilita' strette:

```text
ToolHost         plugin registry, capability, lifecycle e sandbox
LessonOS         event backbone, replay, projection e provenance
StorageProvider  local-first oppure Drive, stesso formato portabile
ConnectorHub     adapter esterni, consent, scope, sync e revoca
Marketplace      catalogo, discovery, licenze, checkout e payout provider
```

Percorsi principali:

- docente: lezione -> taccuino/lavagna -> plugin-post-it -> LessonOS ->
  Graph/Library -> genera/approva -> assegna o pubblica/vende;
- studente: lezione assegnata -> riassunto completo -> graph personale ->
  pratica/simula/annota -> evidenze LessonOS, senza generation;
- creator plugin: Creator post-it -> package -> preview/test -> installa ->
  pubblica free/open source/paid -> acquirente lo usa come post-it.

## 2. Regole di velocita'

1. Ogni ciclo deve cambiare qualcosa che Andrea puo' vedere o usare, salvo un
   ciclo di integrazione obbligatorio e dichiarato.
2. Mai piu' di una slice invisibile consecutiva. Rapporto target: due slice
   prodotto/UX per una slice infrastruttura/integrazione.
3. Timebox normale per slice: 90 minuti:
   15 recon, 50 implementazione, 20 verifica, 5 commit/PR.
4. Se dopo 20 minuti non esiste un'ipotesi falsificabile, ridurre o cambiare
   slice. Se un agente non produce evidenza in 15 minuti, interromperlo.
5. Critical path locale al Loop Captain. Massimo due sidecar read-only; un solo
   writer per superficie. Nessun fanout per lavoro sequenziale.
6. Una feature, un branch, una PR. Massimo cinque file salvo motivazione
   esplicita nel brief.
7. Documentazione per slice: aggiornare solo il ledger necessario. Il prodotto
   non aspetta un nuovo framework di documentazione.
8. Targeted test durante il build; typecheck/build/e2e proporzionati al rischio
   prima della PR. Full suite in CI o quando cambia un contratto condiviso.
9. Ogni slice UI termina con screenshot prima/dopo e prova browser reale.
10. Nessun nuovo framework, proxy o dipendenza se non riduce un costo misurato
    o chiude un requisito che il codice esistente non puo' soddisfare.
11. Sessione <=10 ore e <=12 slice; <=2 repair per slice; <=3 slice consecutive
    sullo stesso sottosistema; dopo tre, integration iteration obbligatoria.
12. Autonomia completa sulle decisioni reversibili e sulle normali azioni
    tecniche: non chiedere consenso. Fermarsi solo per `SECURITY_RED`, azione
    irreversibile, side effect esterno non gia' autorizzato o scelta di prodotto
    non deducibile dal canon e dall'evidenza.
13. Ragionare dal percorso utente e dal rischio maggiore verso il codice:
    definire outcome, riusare, comporre una verticale, provarla nel runtime
    reale, poi generalizzare solo cio' che si ripete davvero.
14. Recon + ricerca per una decisione sono timeboxed a 20 minuti. Devono
    terminare con `ADOPT`, `ADAPT` o `BUILD`, owner e prova imminente; una
    ricerca senza decisione non conta come progresso.
15. Ottimizzare il tempo al primo comportamento completo e verificato, non
    volume di codice, numero di agenti o documenti. Integrare presto; evitare
    astrazioni speculative, migrazioni ampie e parallelismo sul critical path.
16. Montare pezzi maturi dietro adapter/contract stabili. Prima di sostituire
    comportamento esistente: characterization baseline; dopo: contract/replay,
    migrazione additiva, browser proof e rollback. Nessuna regressione nota si
    scambia per velocita'.

## 3. Riuso prima della costruzione

Default: non reinventare e non buttare cio' che funziona. Il codice nuovo e'
un costo permanente; il riuso e' preferito solo quando mantiene controllo,
coerenza e costo totale inferiore.

Ordine obbligatorio per ogni sottosistema:

1. cercare nel monorepo, nella storia Git e nei worktree attivi, inclusi WIP
   altrui leggibili ma non modificabili;
2. inventariare e aprire tutti i link forniti da Andrea; nessun link puo'
   essere ignorato: stato `ADOPTED`, `ADAPTED`, `REFERENCE`, `REJECTED` o
   `BLOCKED`, con una riga di motivazione;
3. cercare in modo mirato ulteriori repository, package e standard ufficiali,
   privilegiando progetti mantenuti, diffusi, testati e con API stabili;
4. confrontare al massimo tre candidati esterni sulla decisione imminente per
   licenza, fit, accessibilita', performance, sicurezza, manutenzione,
   lock-in, bundle e costo di integrazione;
5. scegliere `ADOPT` per una dipendenza pubblica, `ADAPT` per una parte
   isolabile o `BUILD` da zero. `BUILD` richiede evidenza che riuso locale e
   candidati esterni falliscono i gate precedenti;
6. registrare URL canonico, versione/SHA, SPDX, file copiati, copyright,
   attribution/NOTICE,
   dipendenze transitive/SBOM, CVE scan, owner aggiornamenti/drift e rollback;
7. preservare test e comportamento valido del materiale esistente. Sostituire
   una soluzione funzionante richiede confronto prima/dopo, migrazione e
   rollback; riscriverla per gusto personale e' vietato;
8. nessun import host da internals plugin: il riuso attraversa confini solo
   tramite export pubblici/capability e contract test.

E' consentito copiare e adattare codice o asset solo quando la licenza lo
permette e gli obblighi sono rispettati. Licenza assente, ambigua, source-
available incompatibile, segreti o provenienza incerta producono `REJECTED` o
`LEGAL_RED`: non si copiano. Idee, architetture e pattern si possono studiare;
non si clonano UI protette, brand, opere o composizioni riconoscibili.

Miro, GoodNotes, Notability, Jamboard, Mixboard e Tinkercad sono reference
funzionali da analizzare comparativamente, non codice o identita' da clonare.
Il risultato deve restare originale ARDESIA.

Registro operativo obbligatorio:
`docs/ops/ARDESIA-REUSE-AND-INSPIRATION-REGISTER.md`. Contiene i link forniti,
le nuove fonti trovate, cosa apprendere/adottare, licenza, decisione e milestone.

## 4. Acceleratori: gate, non progetto

Un acceleratore e' ammesso solo per un collo di bottiglia misurato, con
esperimento reversibile <=30 minuti e confronto prima/dopo. Nessuna slice
prodotto viene ritardata per installare o studiare un framework operativo.

Headroom, Caveman, GSD e BMAD restano candidati, non attivita', finche' una
misura non dimostra il collo di bottiglia che ciascuno dovrebbe rimuovere.

## 5. Invarianti architetturali

- `SimulationScene` e' l'unica verita' del circuito. DOM e SVG renderizzano.
- Modalita' montata e passo-passo derivano dalla stessa scena/operazioni.
- Operazioni manuali e AI usano comandi tipati, reversibili e auditabili.
- Plugin comunicano tramite capability e interfacce pubbliche; nessun accesso a
  internals, permessi ereditati o dipendenze cicliche.
- Il modello plugin e' object-oriented per contratto, non per gerarchie fragili:
  ogni `PluginInstance` ha identita'/tipo/versione, stato incapsulato, comandi,
  query, eventi, capability provided/required, view e lifecycle. ToolHost e'
  registry/runtime; il creator e' una factory; il post-it contiene e presenta
  un riferimento all'istanza.
- Polimorfismo tramite manifest e capability, composizione prima
  dell'ereditarieta'. Nessun plugin legge o muta direttamente stato/internals
  di un altro; usa comandi/eventi/capability pubbliche.
- `PluginLink` collega istanze con capability provided/required, mount slot,
  lifecycle e failure isolation. Un post-it puo' dockarsi a un altro ma conserva
  ID, stato, permessi e possibilita' di detach; nessun nesting crea ownership
  implicita o accesso agli internals.
- `ArduinoToolchainPlugin` e' un post-it autonomo collegabile a Simulation ed
  ElabTutor. `ArduinoProject` conserva board FQBN/core/versione, librerie,
  sorgente C++, Blockly/AST, build artifact, diagnostics e serial state.
- Collapse, expand, duplicate, move, save/reopen ed export operano sulla stessa
  istanza e sullo stesso stato. L'espansione e' un overlay del post-it dentro la
  lavagna, mai una route/pagina dedicata, e non crea una seconda source of truth.
- Nessun plugin aggiunge una voce di navigazione primaria o una pagina
  prodotto. Anche Simulation, ElabTutor, Graph, Plot, Export e Plugin Creator
  nascono, vivono e si compongono come post-it nel taccuino o sulla lavagna.
- Taccuino e lavagna infinita sono due superfici shell complementari, non due
  prodotti: il taccuino ordina pagine, sezioni, scrittura e cronologia della
  lezione; la lavagna organizza liberamente oggetti, gruppi e relazioni nello
  spazio. Lo stesso plugin-post-it puo' essere referenziato in entrambe senza
  duplicare istanza o stato.
- LessonOS usa un event log append-only con ordering, idempotenza, replay,
  snapshot, recovery, export e delete.
- Ogni `PluginInstance` e' collegata a LessonOS. Create/attach, comandi
  semantici, risultati, error/recovery, export e remove emettono eventi tipati
  con `lessonId`, `pluginInstanceId`, schema/versione, command/causation ID,
  sequence e provenance. Pointer move intermedi e rendering non inquinano il
  log; una mutazione durevole non puo' bypassarlo.
- LessonOS proietta lo stesso log in timeline, knowledge graph, indice appunti,
  analytics e contesto grounded. Le projection sono ricostruibili, versionate e
  non diventano fonti di verita' concorrenti.
- Ogni audio, trascrizione, PDF, immagine, nota, source e artifact e' un
  `LessonAsset` con ID, type, content hash, provenance, lesson scope, graph
  links, provider ref, revision e timestamps. Nessun blob orfano o file senza
  indice puo' soddisfare il gate.
- `Knowledge Explorer` e' una pagina shell, non un plugin: naviga corso,
  insieme di lezioni, lezione, concetto, nota/evidenza, sorgente e post-it con
  breadcrumb, back/forward, filtri, profondita' e ritorno al contesto originale.
- `Library` e' la vista ordinata degli stessi asset: inbox, lezione/raccolta,
  tipo, concetto/tag, fonte e tempo. Graph, Library, taccuino e lavagna aprono lo
  stesso asset e la stessa provenance, senza copie divergenti.
- Lo storage usa un contratto `StorageProvider`. `LocalStorageProvider` e'
  default e rende l'app completa offline; `DriveStorageProvider` e' opzionale e
  usa file/revisioni Drive con scope minimo. Il formato LessonPackage, gli ID e
  il modello dati sono identici e portabili tra provider.
- Le app esterne entrano tramite connector/adapter e capability pubbliche.
  OAuth/token e webhook secret non vivono nel client; permessi, provenance,
  sync status, disconnect, export/delete e degradazione offline sono espliciti.
- Ogni contenuto pubblicabile deriva da un artifact versionato collegato a
  LessonOS/graph. Distingue `human-authored`, `AI-assisted` e `AI-generated`,
  con autore responsabile, fonti, licenza, revisioni e quality evidence.
- Teacher Network/Marketplace sono pagine shell per discovery, profilo,
  storefront e acquisto, non pagine plugin. Gli strumenti di authoring,
  preview, graph, analytics ed export restano plugin-post-it o Knowledge
  Explorer collegati allo stesso artifact.
- Le capability di ruolo sono enforcement di dominio/backend: solo `teacher`
  puo' invocare `content.generate`, `content.publish` e configurare generation
  provider. `student` puo' leggere artifact assegnati,
  navigare il proprio graph, rispondere, esercitarsi, simulare e creare note
  private, ma non generare o pubblicare materiali.
- `plugin.create` e' disponibile a ogni ruolo. `plugin.publish` e
  `plugin.monetize` richiedono creator/seller eligibility, non il ruolo docente:
  identita', eta'/tutore o organizzazione, paese, payout e gate security/quality.
- Il knowledge graph studente contiene progresso, evidenze, risposte,
  misconception e mastery del solo studente; e' privato, pseudonimizzato e
  visibile soltanto allo studente e ai docenti autorizzati, mai al marketplace.
- Dati didattici e PII restano sotto controllo ARDESIA; nessuna chiave
  privilegiata nel client.
- Principio Zero: docente centrale, kit e manuale reali, citazioni/provenance,
  nessuna correzione silenziosa o contenuto generico quando esiste il canon.
- La UI condivide design token, accessibilita', touch target e reduced motion.
- Backend/provider sono adapter sostituibili, non dipendenze del dominio.

## 6. Scope per stadio

| Area | Teaching V1 | Pilot | Commercial Beta | Later |
|---|---|---|---|---|
| Shell | lezione, navigazione, error/recovery | multiutente assistito | ruoli/amministrazione | booking/video |
| Taccuino | pagine/sezioni, penna, Pencil, import, selezione, undo/redo, autosave | template e cross-link | collaborazione realtime | publishing avanzato |
| Lavagna infinita | pan/zoom infinito, penna, forme, gruppi, selezione, link, undo/redo, autosave | spatial graph e template | collaborazione realtime | suite creativa estesa |
| Knowledge Card | nota, formula, source, quiz, simulation observation, plugin view attach/detach | conversioni, graph links, audio, plugin state/history | publishing/licensing | marketplace aperto |
| Simulation | scenario LED completo, wire, solve, diagnosi, persistence e matrice parity attiva | strumenti, Arduino, code/serial/plot e piu' esperimenti | matrice Tinkercad completa certificata | nuove discipline hardware |
| Arduino Toolchain | Blockly/C++, board select, compile/diagnostics e provider status | FQBN/core dinamici, upload/seriale reali | matrice board/protocol completa | ecosistema hardware esteso |
| Plugin | manifest, capability, lifecycle, audit, storage/eventi, creator template e una composizione plugin-su-plugin | package/install/update/disable/uninstall, creator tecnico+docente e dependency graph | review, signing e publishing | ecosistema pubblico aperto |
| LessonOS | event log locale, snapshot, graph projection verticale | sync staging e conflict policy | multi-tenant production | federation |
| Knowledge Explorer | grafo/appunti navigabile per singola lezione | selezione multi-lezione, filtri, livelli e grafici | corso/scuola con policy privacy | federazione graph |
| Library | audio/materiali/appunti ordinati, search e provenance | raccolte, transcript/timeline e dedupe | publishing/licensing | federation asset |
| ElabTutor | risposta grounded sullo scenario LED con citazioni | mastery/misconception | provider/cost control estesi | tutor generalista |
| Content | appunti, quiz, Markdown/PDF/JSON package | slide/HTML/transcript | package vendibile | commerce |
| Studente | riassunti completi, fonti, graph personale, quiz/sim e note private | percorso adattivo approvato | portfolio privato | interoperabilita' |
| Audio | registrazione/import/export con consenso | transcript e timeline | provider EU | processing avanzato |
| Backend | staging, auth, tenant, RLS, eventi, export | backup/observability | scaling e billing | multi-region |
| Connector | import/export file con provenance | Drive/LMS/MCP adapter con scope minimi | catalogo connector governato | ecosistema esterno |
| Storage | local-first offline e LessonPackage portabile | Drive provider, sync/revision/conflict | school storage policy | multi-provider |
| Distribution | share/export e PWA | Embed SDK, LTI, MCP/OpenAPI | partner/catalog integration | federation |
| Teacher Network | profilo, portfolio, follow/save e preview | review, collection e discovery | community/moderation | federation sociale |
| Marketplace | artifact gratuito/privato e licenza | vendita singola/raccolta e abbonamento creator | payout, tax, ranking e sponsorship | marketplace federato |

Le colonne sono ordine di consegna, non categorie eliminabili. `Later` significa
solo "dopo i gate precedenti": resta nel denominatore di `FULL_GOAL_GREEN`.

## 7. Roadmap di convergenza

### G0 - Mandatory re-gate

Prima di ogni writer: verificare SHA/status/worktree/processi concorrenti,
PR/CI, secret scan di working tree/storia recente/docs, env/client bundle e
capability bypass noti. Segreto valido, chiave privilegiata client-side o
writer concorrente non controllato produce `SECURITY_RED` e STOP. M5 estende
backend e security; non rinvia questo baseline gate.

Prima di qualsiasi writer prodotto deve esistere
`docs/ops/ARDESIA-FULL-TRACEABILITY.md`: una riga per ogni requisito atomico dei
tre baseline congelati e degli addenda successivi, con ID sorgente univoco,
citazione/parafrasi, milestone, prova e stato. Include un registro di ogni URL
fornito da Andrea e delle fonti aggiuntive effettivamente valutate. Un controllo
deve provare copertura 100%, nessuna omissione e nessun duplicato; il baseline
puo' cambiare solo con approvazione Andrea.

### M0 - Visual Rescue

Obiettivo: ARDESIA deve apparire e comportarsi come un prodotto, non un
harness tecnico.

Acceptance:

- la UI e' organizzata per compiti del docente, non per moduli tecnici;
- la lavagna con i post-it e' la superficie prodotto; una vista plugin separata
  puo' esistere solo come harness di sviluppo e non vale come acceptance UX;
- taccuino e lavagna infinita sono entrambi raggiungibili senza perdere
  selezione, contesto di lezione o stato dei plugin;
- a riposo esiste una sola azione primaria e non piu' di tre comandi primari;
- il percorso `costruisci -> collega -> simula -> spiega` e' leggibile senza
  onboarding tecnico e mostra sempre fase corrente e prossima azione;
- selezione, pending placement, successo, errore e recovery hanno stato
  testuale/iconico inequivocabile, mai affidato soltanto al colore;
- provider, schema, guard, ID, log e diagnostica sviluppatore sono fuori dalla
  vista docente e disponibili solo in un inspector secondario;
- Simulation Plugin leggibile senza zoom manuale;
- palette con icone/nomi/stato selezionato chiaro;
- canvas usa la maggior parte dello spazio utile;
- feedback esplicito `seleziona -> piazza -> collega -> simula`;
- gerarchia, contrasto e touch target verificati su desktop e iPad;
- nessuna label interna (`harness`, provider debug, guard count) nella vista
  docente primaria; diagnostica tecnica dietro disclosure.
- screenshot a 1440x900, iPad 1024x1366 e 1366x1024, LIM 1920x1080; zero
  overlap, clipping o scroll trap;
- canvas >=65% dell'area centrale utile; target essenziali >=44 CSS px;
  contrasto WCAG AA; stato mai solo colore;
- nessun nuovo colore raw fuori dai design token;
- Andrea identifica la prossima azione entro 5 secondi e completa
  `seleziona -> piazza -> collega -> simula` senza istruzioni;
- Andrea registra separatamente `PASS/RED` per comprensione entro 5 secondi,
  completamento senza aiuto, qualita' professionale, attrattiva, identita'
  distintiva/innovativa e piacere d'uso; ogni RED blocca M0; registrare tempo,
  errori, recovery e screenshot desktop/iPad/LIM.

Direzione distintiva ARDESIA:

- Henri Matisse -> campiture nette, forme ritagliate, ritmo, leggibilita' ed
  energia per categorie e stati;
- Alexander Calder -> equilibrio, movimento, forme sospese e relazioni
  spaziali; il motion deve spiegare connessioni, non decorare;
- Keith Haring -> segno immediato, energia, inclusivita' e leggibilita' da
  lontano;
- minimalismo allegro -> pochi elementi vivi, chiari e pieni di personalita';
- sintesi originale -> grafite morbida, bianco neutro, corallo/blu/giallo/verde
  funzionali, forme compatte e touch-first, senza imitare opere o composizioni.

Questi riferimenti non sono un moodboard opzionale: ogni superficie
user-facing deve dimostrare ritmo/gerarchia, chiarezza spaziale, immediatezza e
personalita' ARDESIA. Non deve necessariamente mostrare tutti i tratti insieme
e non deve imitare lo stile riconoscibile di un artista.

Il gate non e' una ripulita CSS: deve trasformare comprensione, gerarchia,
azione e piacere d'uso mantenendo una densita' professionale da lezione.

### M1 - Post-it Plugin Foundation

Acceptance:

- una Knowledge Card puo' ospitare, collassare, espandere, duplicare,
  salvare, riaprire, esportare e rimuovere un plugin senza perdere dati;
- un plugin-post-it puo' essere collocato nella pagina del taccuino o nella
  lavagna infinita; eventuali riferimenti multipli puntano alla stessa istanza;
- l'utente crea un post-it, sceglie un tipo plugin e ottiene una vera
  `PluginInstance`; card, inspector ed eventuale fullscreen usano lo stesso ID
  e lo stesso stato;
- un plugin e' una superficie interattiva guidata da stato semantico e comandi;
  screenshot, immagini e SVG statici sono solo source/thumbnail/fallback
  etichettati e non possono soddisfare il gate `plugin funzionante`;
- almeno un'interazione reale modifica lo stato di dominio, emette un evento,
  aggiorna il rendering e sopravvive a save/reopen;
- ogni plugin mostra stato `live`, `loading`, `offline`, `error` e recovery,
  senza fingere interattivita' quando il runtime non e' disponibile;
- template creator docente genera un plugin dichiarativo senza codice
  arbitrario; creator tecnico usa manifest/schema/contract test;
- preview, package locale, install, enable/disable e uninstall funzionano;
- un plugin consuma una capability pubblica di un secondo plugin senza import
  di internals o permessi impliciti;
- dependency graph valida semver, cicli, startup e degradazione;
- permission review e data export/delete sono visibili all'utente.
- golden journey sul deploy canonico: Andrea crea un plugin senza codice,
  dichiara capability provided/required, esegue preview/package/install, lo
  collega a un post-it, consuma una capability di un secondo plugin tramite
  ToolHost, salva/chiude/riapre, verifica stato e composizione, quindi esporta
  ed elimina/disinstalla senza dati orfani;
- e2e browser pointer/touch e test negativi per capability negata, ciclo,
  provider assente e failure isolation.

### M2 - Functional LED Interaction

Acceptance:

- batteria, breadboard, resistenza, LED e fili sono manipolabili;
- pointer/touch reale per add, connect, disconnect, retarget e delete;
- undo e redo multi-step;
- solve deterministico e errore comprensibile;
- save, close e reopen senza perdita;
- e2e diviso in test di confine piu' un percorso verticale.

### M3 - Book Fidelity and Principle Zero

Acceptance:

- un `BookCircuitSpec` versionato per Vol.1 esperimento LED;
- parita' semantica, topologica, visuale e temporale;
- `reduce(steps) == mountedScene` e netlist equivalenti;
- screenshot/anchor review e validazione umana Andrea;
- ElabTutor distingue target, circuito utente e variazione valida;
- claim consentito solo per l'esperimento/revisione certificati.

### M4 - Lesson Spine

Acceptance:

- ogni tipo plugin registra manifest, schema eventi e reducer/replay LessonOS;
- azione plugin -> comando tipato -> evento plugin -> LessonOS locale, con
  lesson/plugin instance ID, sequence, causation, versione e provenance;
- lifecycle `create/attach/save/reopen/export/remove` e failure/recovery sono
  ricostruibili; nessuna mutazione durevole esiste solo nel componente React;
- projection deterministiche e ricostruibili a timeline, knowledge graph,
  indice appunti e metriche, con provenance fino all'evento/sorgente/post-it;
- asset registry indicizza audio, transcript, PDF, immagini, note e artifact
  per hash, tipo, lezione/raccolta, concetto/tag, fonte e tempo;
- Library offre import, inbox, ordinamento, ricerca, preview/playback, link al
  graph/post-it e raccolte senza duplicare i file;
- audio supporta waveform/timeline, marker, note collegate e transcript con
  consenso/stato; ogni segmento citabile torna al timestamp originale;
- Knowledge Explorer naviga almeno cinque livelli senza perdere contesto:
  `insieme lezioni -> lezione -> concetto -> nota/evidenza -> sorgente/post-it`;
- selettore scope `lezione singola | insieme selezionato | corso`, filtri per
  tipo/tempo/fonte/plugin e profondita' 1..N; breadcrumb e ritorno al nodo;
- click su un nodo apre nota, evidenza, source e posizione originale nel
  taccuino/lavagna; la vista locale e globale restano sincronizzate;
- grafici reali derivano da query versionate sul graph/event log, non da mock:
  copertura concetti, evidenze/fonti, attivita' temporale, misconception e
  relazioni tra lezioni, con drill-down ai dati sottostanti;
- query ElabTutor e generazione sono grounded sul sottografo selezionato;
- appunti, sintesi, quiz, esercizi, slide/outline e lesson package riportano
  graph node ID, event/source ID, scope lezioni, prompt/versione e citazioni;
- ogni riassunto studente e' teacher-approved e passa coverage del sottografo,
  correttezza/citazioni, struttura, leggibilita' e assenza di claim unsupported;
- lo studente naviga il proprio graph, apre riassunti/fonti, marca comprensione,
  risponde e pratica; queste interazioni aggiornano evidenze/mastery LessonOS
  senza abilitare generation di nuovi artifact;
- contenuto senza supporto resta `UNKNOWN` o richiesta di integrazione, mai
  completato silenziosamente dal modello;
- export Markdown, PDF e Lesson Package;
- reopen conserva eventi e artefatti.

### M5 - Backend and Security

Acceptance:

- staging canonico legato allo SHA;
- auth/tenant/RLS con test tenant-negative;
- capability/RLS role-negative: uno studente non puo' generare, pubblicare,
  vendere, cambiare provider o leggere graph/asset di altri studenti, anche
  chiamando API/ToolHost direttamente;
- sync offline, retry, idempotenza e conflict policy;
- `LocalStorageProvider` e `DriveStorageProvider` passano lo stesso contract
  test: create/read/update/delete, large audio, dedupe hash, revision, offline
  queue, retry, conflict, export/import e provider switch senza data loss;
- local mode non richiede account; Drive usa picker e scope per-file minimo,
  resumable upload, revision/etag e revoca. Nessun overwrite silenzioso;
- metadata e blob restano coerenti: tombstone/retention e garbage collection
  rimuovono orfani solo dopo verifica e rollback window;
- export/delete GDPR, backup e rollback;
- secret, dependency, CSP, sandbox e supply-chain gate.
- connector OAuth/OIDC con scope minimi, token server-side cifrati, revoca,
  webhook verification, audit, tenant isolation e test provider-negative;
- valutare prima standard aperti: LTI 1.3 per LMS, xAPI per learning activity,
  MCP per tool AI, quindi adapter Drive/OneDrive/Classroom specifici.
- esporre lo stesso gateway capability a ChatGPT Apps tramite Apps SDK/MCP, a
  GPT custom tramite OpenAPI Actions e a Claude Team/Enterprise tramite remote
  MCP connector; auth per utente/workspace, allowlist, consent e audit sono
  obbligatori e nessuna piattaforma esterna riceve accesso implicito al lesson;

### M6 - Plugin Creator and Composition

Acceptance:

- creator flow completo: template, identity, manifest, provided/required
  capability, events, graph contributions, storage, export, permission,
  sandbox preview, test, package, sign, install, update, rollback, uninstall;
- almeno tre composizioni reali: Simulation -> Plot/Export, ElabTutor ->
  Citation/Graph/Simulation Explanation, Knowledge Card -> plugin view;
- composizione fondamentale: un ElabTutor post-it richiede e si collega a un
  Simulation post-it tramite `simulation.scene.read`, `simulation.command`,
  `simulation.diagnostics`, `simulation.events` e `lesson.event.append`;
- attach/dock/detach/reopen dell'ElabTutor conserva due istanze indipendenti;
  provider mancante degrada il tutor senza corrompere il circuito;
- capability negotiation, health, failure isolation e migration testate;
- un plugin richiede connector esterni tramite capability (`content.import`,
  `artifact.export`, `storage.attach`, `classroom.publish`, `tool.invoke`), mai
  tramite SDK segreti o chiamate provider sparse nel componente;
- SDK/starter e creator docente producono lo stesso formato di package;
- creator no-code e tecnico sono disponibili a tutti; package, preview e test
  sono identici indipendentemente dal ruolo;
- il creator sceglie licenza e modello: `private`, `free`, `open-source`,
  `one-time`, `subscription` o `school-seat`; dipendenze, diritti commerciali,
  revenue share e costi provider sono dichiarati prima della pubblicazione;
- nessun plugin first-party bypassa il contratto senza ADR e label esplicita.
- `Embed SDK` espone shell/lesson/post-it governati a software web esterni; LTI,
  MCP e OpenAPI riusano lo stesso capability gateway. Nessun embed implementa
  un secondo LessonOS, stato plugin o modello autorizzativo.

### M6A - Arduino Toolchain Plugin

Acceptance:

- e' un vero plugin-post-it, collassabile/espandibile, persistente e collegato a
  LessonOS/Library; nessuna IDE pagina separata;
- modalita' `Blocchi` e `C++` condividono un `ArduinoProject`. Harvest mirato di
  Blockly, CodeMirror e `elabArduinoAst` da ELABTutor, con characterization
  test prima dell'adattamento;
- il subset round-trip Blockly <-> Arduino AST <-> C++ e' dichiarato/testato;
  C++ fuori subset resta intatto e marcato non convertibile, mai distrutto;
- board catalog deriva da package index/core e FQBN, con version pin, opzioni,
  librerie e capability; nessuna lista chiusa spacciata per universalita';
- package index/core/library provengono da registry allowlisted o approvati,
  con URL/versione/hash/licenza e rollback; nessun toolchain download esegue
  codice non verificato sul host;
- `CompilerProvider` supporta almeno Arduino CLI isolato e provider remoto/
  locale sostituibile; cache per source+FQBN+core+library lock e diagnostica
  strutturata/riproducibile;
- compile gira in sandbox effimera senza host secret, filesystem o rete
  illimitati, con CPU/RAM/time/output quota e cleanup. Invio sorgente a provider
  remoto richiede consenso, region/retention dichiarati e delete/audit;
- `UploadProvider` negozia Web Serial, WebUSB, loopback/desktop agent o provider
  board-specific. Mostra compatibilita' reale per browser/OS/board e non finge
  upload su iPad/Safari o protocolli non implementati;
- upload fisico richiede gesto e conferma umana, device/port espliciti,
  progress, verify, cancel/retry e recovery; AI non puo' flashare da sola;
- serial monitor/plotter hanno connect/disconnect, baud, log bounded, export e
  collegamento a graph/note; input non fidato e' sanitizzato;
- build artifact, code hash, FQBN/core/provider/versione, diagnostics e upload
  result entrano in Library/LessonOS; source privato non finisce nei log;
- capability pubbliche: `arduino.project`, `arduino.board.catalog`,
  `arduino.compile`, `arduino.upload`, `arduino.serial` e
  `arduino.blockly.codegen`;
- Simulation consuma firmware/runtime quando supportato; ElabTutor consuma
  project/diagnostics/serial e puo' proporre fix, ma ogni mutazione passa da
  comando tipato e ogni upload resta human-confirmed;
- matrice per board family/core/upload protocol/browser. Una board e' GREEN
  solo con compile reale; upload GREEN richiede hardware evidence separata;
- e2e minimo: Blockly -> C++ -> compile reale -> diagnostics/artifact ->
  ElabTutor explanation -> LessonOS -> reopen. Hardware upload e' un gate
  aggiuntivo, mai simulato come prova reale.

### M7 - Full Tinkercad Parity

Acceptance:

- la superficie canonica e' un Simulation Plugin dentro un post-it/Knowledge
  Card creato dall'utente. Da li' si costruisce, modifica, programma, simula,
  misura, salva e riapre; una route separata e' vietata nel prodotto;
- il post-it e' ridimensionabile e puo' espandersi/fullscreen mantenendo la
  stessa `PluginInstance`, undo stack, selezione, viewport e simulation state;
  l'espansione resta un overlay della lavagna e torna allo stesso post-it;
- per code/compile/upload/serial parity, Arduino Toolchain resta una
  `PluginInstance` indipendente ma si monta tramite `PluginLink` in uno slot del
  Simulation post-it. L'esperienza e' interna al post-it canonico; due card solo
  affiancate non soddisfano il gate;
- il percorso e2e parte da `nuovo post-it -> aggiungi Simulation Plugin` e
  termina nel post-it riaperto con circuito e strumenti persistiti;
- golden composition: aggiungi ElabTutor post-it -> collegalo al Simulation
  post-it -> osserva scena esatta -> spiega/diagnostica grounded -> applica un
  comando tipato -> LessonOS audit -> save/reopen -> detach senza data loss;
- collega anche Arduino Toolchain post-it: ElabTutor correla circuito, Blockly/
  C++, compile diagnostics e serial output senza leggere internals;
- matrice completa con target behavior, stato, evidenza, test e limite per:
  catalogo, breadboard, power, pin topology, placement/move/rotate/select,
  wire/route/waypoint/disconnect/retarget/delete, undo/redo, netlist/solver,
  diagnostics, multimeter/probe/oscilloscope/plot, Arduino, editor, compile,
  execute, serial, save/reopen, import/export, tutorial/free mode, touch,
  accessibilita', performance, AI control e LessonOS integration;
- ogni riga e' GREEN sul runtime canonico o il goal resta aperto;
- parity visuale e funzionale validata su desktop, iPad e LIM;
- nessuna sostituzione finta di hardware/runtime non supportato;
- regression suite e compatibility matrix per package e provider.
- prima dell'implementazione congelare prodotto/versione/data/account/viewport
  Tinkercad osservati e un inventario numerato di ogni componente, strumento,
  gesto e comportamento;
- il denominatore della matrice e' fisso: righe mancanti, non accessibili o non
  implementate restano RED/BLOCKED, non vengono escluse;
- ogni riga richiede confronto reference-vs-ARDESIA, prova funzionale
  indipendente e sign-off Andrea; solo il 100% GREEN consente
  `FULL_GOAL_GREEN`.

### M8 - Teacher Network and Marketplace

Acceptance:

- il docente crea un profilo/storefront, portfolio, discipline, livelli,
  metodo, credenziali dichiarate e contenuti pubblicati;
- ogni account puo' creare `PluginPackage`; ogni account legalmente idoneo puo'
  aprire un creator storefront e monetizzarlo. Minori usano payout e
  pubblicazione gestiti da tutore/scuola secondo policy verificata;
- solo account docente puo' generare/pubblicare `ContentArtifact` didattici;
  lo studente resta deny server-side su content generation/publishing;
- pubblicazione da artifact manuale o generato dal sottografo di una o piu'
  lezioni, con preview, versione, fonti, livello AI, licenza e accessibility;
- prodotti singoli e raccolte supportano free/paid, prezzo, classroom/school
  license, aggiornamenti, refund policy e download/reopen verificabile;
- il catalogo unifica `ContentArtifact` e `PluginPackage` ma rende evidente il
  tipo; il plugin acquistato si installa come post-it e passa permission review;
- social utile: follow, save, collection, review verificata, comment/Q&A,
  con report, moderation, block e tutela minori/PII;
- discovery per materia, livello, kit/volume, formato, lingua, prezzo e graph
  concepts; ogni risultato spiega perche' e' mostrato;
- ranking organico versionato combina qualita' pedagogica, evidence/citazioni,
  accessibilita', uso, vendite, conversione, rating verificati, refund/report,
  freschezza e affidabilita' autore; raw sales non domina da sola;
- cold-start e piccoli creator ricevono esplorazione/fairness misurabile;
  self-purchase, review fraud, plagiarism e ranking gaming sono rilevati;
- abbonamento creator offre strumenti, analytics e opportunita' di visibilita'.
  Ogni posizione pagata e' etichettata `Sponsorizzato` e separata dal ranking
  organico; nessun pagamento compra una falsa qualita';
- checkout, commissione, seller onboarding/KYC, payout, dispute, VAT/tax e
  refund usano un provider marketplace verificato; nessun flusso denaro reale
  prima di sandbox, legal review e approvazione release;
- provenance, diritti e plagiarism gate impediscono vendita di manuali/corpus,
  asset o output AI non licenziabili; takedown e audit sono operativi;
- dashboard creator mostra vendite, conversione, quality signals, refund,
  provenienza traffico e azioni concrete senza esporre PII di studenti.

### M9 - Pilot Hardening

Acceptance:

- iPad/Pencil e LIM;
- keyboard/focus/WCAG/reduced motion;
- performance su board realistica;
- CI e deploy preview con provenance SHA;
- Andrea completa il protocollo docente e registra confusioni/recovery;
- GO/NO-GO per pilot assistito.

### M10+ - Full Goal Closure Waves

M9 chiude il primo pilot, non la roadmap completa. Dopo M9, A0 genera milestone
ordinate e finite dalle righe non-GREEN della traceability, privilegiando ogni
volta valore utente, dipendenze e rischio. Le wave continuano finche'
`LATER + DEFERRED + UNKNOWN + RED + BLOCKED = 0`; nessuna voce puo' essere
rimossa dal denominatore per chiudere il goal.

## 8. Prime slice eseguibili

1. Integrare la palette WIP Claude solo dopo commit, test e review; nessuna
   duplicazione nel worktree Codex.
2. Ridisegnare il Simulation Plugin nel vero post-it su taccuino/lavagna:
   canvas dominante, toolbar docente, diagnostica progressiva, nessun gergo.
3. Persistenza della stessa PluginInstance attraverso attach/detach/expand,
   passaggio taccuino/lavagna e close/reopen.
4. Creator template dichiarativo: crea -> preview -> installa un plugin card.
5. Prima composizione reale plugin-su-plugin tramite capability pubblica.
6. Feedback di placement visibile e test pointer/touch desktop+iPad.
7. Undo/redo canonico per componenti e wire, con redo invalidation.
8. Retarget/delete wire nella vista reale e persistence round-trip.
9. Golden LED browser journey con screenshot prima/dopo e console pulita.
10. BookCircuitSpec del solo esperimento LED; pipeline poi generalizzata con
    evidenza, non con duplicazione manuale.
11a. Chiudere P38: action -> LessonOS local persistence.
11b. LessonOS event -> graph projection con provenance.
11c. Graph fact -> grounded ElabTutor retrieval.
11d. Tutor result -> cited artifact -> export/reopen.

Ogni slice LessonOS si ferma al primo confine RED e deve aggiungere evidenza al
percorso deployato.

## 9. Contratto di una slice

Brief massimo una pagina:

- valore utente visibile;
- comportamento prima/dopo;
- owner e massimo cinque file;
- riuso previsto;
- acceptance falsificabile;
- comando/test;
- rischio e rollback;
- cosa NON viene fatto.
- contratto pubblico e direzione dipendenze prima/dopo;
- nessun internal import, ciclo o seconda source of truth;
- contract test per ogni confine host/plugin/domain;
- compatibilita'/migrazione additiva;
- delta di duplicazione e owner della manutenzione.

Una slice UI e' `GREEN_SLICE` solo con:

- browser reale;
- screenshot desktop e iPad;
- almeno un gesto pointer/touch reale;
- console/network errors vuoti;
- target touch e focus essenziali;
- persistence se modifica dati;
- test mirati e CI;
- reviewer diverso dall'implementer.

Ogni milestone user-facing ripete i gate separati M0: comprensione,
completamento senza aiuto, qualita' professionale, attrattiva, identita'
distintiva/innovativa e piacere d'uso. Un solo `RED` mantiene aperta la
milestone; l'approvazione di una superficie non si eredita sulle successive.

## 10. Orchestrazione minima

- A0 integratore: mantiene goal, branch, PR e critical path.
- A2 UI: un writer solo per la superficie visiva.
- A3 simulation: un writer solo per dominio/physics.
- A4 Plugin/ToolHost: unico writer per M1/M6 e owner di package, creator,
  capability pubbliche, dependency graph e lifecycle.
- A5 LessonOS/backend: attivo solo da M3/M4.
- A7 reviewer read-only: avversariale, chiamato a diff pronto.

Non attivare tutti i ruoli. Default: A0 + un writer + un reviewer. Sidecar
research solo quando il risultato cambia una decisione imminente.

## 11. Metriche vere

Traccia per macrofase:

- task docente completabili nell'anteprima;
- tempo al primo circuito funzionante;
- gesture riuscite/fallite;
- confusione osservata;
- percentuale percorso verticale coperta;
- difetti P0/P1 aperti;
- performance desktop/iPad/LIM;
- slice visibili / slice invisibili;
- cycle time e repair count;
- costo build/manutenzione evitato dal riuso, costo di integrazione introdotto,
  dependency/license/security drift;
- decisioni `ADOPT/ADAPT/BUILD`, tempo ricerca e tempo al primo percorso verde;
- link forniti valutati / link forniti totali, con target 100%;
- creator attivi, content quality, conversione, refund/report, ranking fairness,
  vendite organiche/sponsorizzate e payout correctness;

Numero di commit, test o documenti non e' una metrica di prodotto.

## 12. Stop e claim

- `GREEN_SLICE`: slice visibile/integrata, testata, review e CI verdi.
- `HONEST_RED`: fallimento riprodotto con causa/prossimo esperimento.
- `SECURITY_RED`: secret/RLS/privacy/sandbox blocker.
- `LEGAL_RED`: licenza, copyright, attribution o provenienza impediscono il
  riuso; cercare subito il candidato successivo senza bloccare il prodotto.
- `ARCHITECTURE_RED`: due verita' o contratto incompatibile.
- `BLOCKED_EXTERNAL`: accesso/hardware/account umano indispensabile.
- `PILOT_READY`: percorso completo, manca solo validazione esterna.
- `MARKETPLACE_READY`: sandbox end-to-end verde, legal/security/moderation
  gates verdi; non significa pagamenti reali attivi.
- `V1_GREEN`: percorso completo sul deploy, sicurezza verde e prova Andrea.
- `FULL_GOAL_GREEN`: ogni requisito delle tre baseline e' presente in una
  traceability matrix con ID, milestone, prova eseguibile o protocollo umano,
  evidenza sul runtime canonico e stato GREEN. Nessuna voce puo' essere omessa,
  raggruppata come "fondamentale", o restare `LATER`, `DEFERRED`, `UNKNOWN`,
  `RED` o `BLOCKED` senza modifica esplicita del mandato approvata da Andrea.
  Tutti i link forniti devono risultare valutati, anche quando correttamente
  rifiutati; ogni `BUILD` deve avere una decisione di non-riuso verificabile.
  Richiede inoltre, senza assistenza tecnica bloccante:
  - product journey su desktop/iPad/LIM: `shell -> taccuino/lavagna -> post-it
    Simulation -> LessonOS -> Knowledge Explorer/Graph/Library -> tutor ->
    contenuto/grafico -> export`;
  - cross-surface journey: la stessa `PluginInstance` passa/riferisce tra
    taccuino e lavagna, expand/collapse, save/reopen senza fork di stato;
  - teacher/student journey: docente genera e approva -> studente consulta
    riassunto e graph personale -> pratica/simula/annota -> LessonOS aggiorna
    evidence/mastery, mentre generation/publish studente sono negati;
  - creator journey: qualsiasi utente crea/testa un plugin -> creator idoneo lo
    pubblica/monetizza -> discovery/acquisto -> permission review -> install e
    uso come post-it, con update/uninstall e dati integri;
  - storage/connector journey: consenso -> local/Drive import e sync -> offline
    edit/reopen -> conflict/recovery -> revoca -> export/provider switch senza
    perdita; ChatGPT App/GPT o Claude connector usa capability scoped e produce
    provenance/audit LessonOS.
- `GREEN_CANDIDATE`: branch/PR verde ma non integrata; non conta come
  `GREEN_SLICE`, che richiede merge umano e re-gate sul branch canonico.

Non usare `parity`, `production-ready`, `robusto`, `perfetto` o `finito` senza
una matrice e prova della stessa ampiezza.

## 13. Stato di partenza verificato

- `origin/main@91ec22ed`; PR #170 base palette merged.
- PR #171 open, CI verde, decisione umana merge/reject richiesta.
- PR #172/P38 open, CI verde, prova test-only della persistenza LessonOS locale;
  non e' graph projection e non e' merged.
- PR #174 open, CI verde: miglioramento riusabile della teacher surface, ma
  dopo il chiarimento `plugin = post-it` resta `PARTIAL/RED` per M0 finche' lo
  stesso flusso non vive nel post-it reale su taccuino/lavagna con LessonOS.
- fonte ELABTutor verificata: repository privato
  `AndreaMarro/elab-tutor@732ff07754e15a2859e4823f16490505221725ce`, senza
  licenza dichiarata. Solo harvesting first-party controllato; security/corpus
  gate prima di copiare codice o asset.
- Claude b-bis worktree: 6 modified + 2 untracked, live su `5193`; solo
  candidato. Import host da internals plugin, registry exposure, colori raw e
  eccezione >5 file richiedono review architetturale/UX.
- `UI_CURRENT = INCOMPREHENSIBLE/RED`; nessun claim UI verde prima del
  superamento integrale di M0. Plugin piccolo, palette debole e vista dedicata
  espongono gergo da harness.
- Tinkercad parity generale, 88 esperimenti certificati, backend/RLS e tutor
  verticale restano `UNKNOWN` o `RED` finche' non provati.

Prossima sequenza: riusare la teacher surface #174 nel vero post-it Simulation;
e2e `taccuino/lavagna -> nuovo post-it -> Simulation Plugin -> azione ->
LessonOS -> reopen`; poi Graph/Library verticale. Decisione merge/reject su
#171/#172 e WIP Claude solo senza duplicare o perdere lavoro valido.
