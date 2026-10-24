# Ardesia: archeologia, audit architetturale e delta verificato

Data della rilevazione: 24 ottobre 2026. Rapporto di ricerca collegato al punto di ingresso della consegna; **non è un nuovo canone**, né una dichiarazione di prontezza del prodotto.

## 1. Fonti, commit e limiti

Ho letto il mandato dell'utente, le regole root e Studio, i canoni storici, ADR-0004, la consegna del 20 ottobre, codice Studio/Engine/Study, la metadata live delle PR #268–296 e i README dei repository storici accessibili. La prima copia locale era `57c492af2bc391652f8c243107cfe8f00a22820d` (#284). La copia di lavoro finale è `/workspace/scratch/6f2994042c33/ardesia`, base #290 `339ab08f4139da0b37e78bbde81e9fe4e83afea0`, branch locale `pro/ardesia-living-lesson-audio-20261024`.

Ho confrontato con GitHub i blob di `activities.py`, `AudioRecorder.ts`, `journalBridge.ts`, `course.ts`, `study_api/app.py`, `Room.tsx` e `JournalRecorder.ts`: sono identici fra la prima copia e #290. Le conclusioni di sorgente su questi file si applicano quindi alla base aggiornata, non per semplice supposizione di continuità del branch.

Le descrizioni di PR e i README riportano risultati dei rispettivi autori. Non li ho trasformati in test eseguiti personalmente. Ho verificato indipendentemente via API che i run #290 `40034887180` (`ci`) e `40034887686` (`marketing-static`) sono conclusi con `success`; questo certifica lo stato dichiarato da GitHub di quei run su quello SHA, non la beta integrata. Non ho fatto deploy, merge, modifica di dati reali, lettura di credenziali, accesso al corpus dei volumi o nuove scritture GitHub.

Riferimenti principali:

- [Main osservato](https://github.com/AndreaMarro/ardesia/commit/b124eee04acc8062c27284f23c5d9108e3767c27), 23 agosto 2026.
- [Stack finale osservato #290](https://github.com/AndreaMarro/ardesia/pull/290).
- [Audit esistente #291](https://github.com/AndreaMarro/ardesia/pull/291), [RFC Core/MCP #293](https://github.com/AndreaMarro/ardesia/pull/293), [audio lifecycle #295](https://github.com/AndreaMarro/ardesia/pull/295).
- [ADR-0004 attuale nella base](https://github.com/AndreaMarro/ardesia/blob/339ab08f4139da0b37e78bbde81e9fe4e83afea0/docs/adr/ADR-0004-study-core-and-provider-boundaries.md).
- [Canon prodotto del 23 giugno](https://github.com/AndreaMarro/ardesia/blob/339ab08f4139da0b37e78bbde81e9fe4e83afea0/docs/PRODUCT-CANON.md).

## 2. Valutazione indipendente

La tecnologia conserva molto più della visione originaria di quanto la sola landing faccia percepire. Il problema principale è la **frattura fra sottosistemi e superfici raggiungibili**, aggravata da una lunga catena di lavoro non ancora integrato in main. Catalogo, quantità esatte, revisione scientifica separata dalla pubblicazione e run su vera API SQLite sono progressi utili. Non dimostrano però che una lezione catturata diventi un'esperienza continuativa dello studente.

La frase commercialmente distintiva dovrebbe essere: **«La tua lezione resta utilizzabile: ritrovi il passaggio, provi il concetto, correggi l'errore e riparti da lì.»** È una direzione, non una capacità interamente disponibile. Il prossimo incremento deve ricucire questa catena; un ulteriore indice di corsi non sostituisce quel lavoro.

### Delta importante rispetto alle review già esistenti

1. **La cattura audio non è semplicemente poco visibile: è scollegata nel percorso corrente.** `Room.tsx` pubblica `audioRecorder: null` nel test harness; la ricerca sui sorgenti produttivi non trova un'istanza di `AudioRecorder`. `JournalRecorder.recordAudioChunk()` lancia esplicitamente `audio is outside Founder Beta canonical journal`. L'unione canonica dei journal v2 non comprende audio. La classe legacy e i suoi test non provano un percorso attivabile dall'utente. [Room](https://github.com/AndreaMarro/ardesia/blob/339ab08f4139da0b37e78bbde81e9fe4e83afea0/apps/studio/src/Room.tsx), [JournalRecorder](https://github.com/AndreaMarro/ardesia/blob/339ab08f4139da0b37e78bbde81e9fe4e83afea0/apps/studio/src/store/JournalRecorder.ts).
2. **Replay leggeva il journal sbagliato nel percorso produttivo.** Room registra in `raw/<room>/events.jsonl`; ReplayView, raggiungibile attraverso `?vista=replay`, chiamava il loader flat `raw/events.jsonl`. WorkspaceStore non rimappa i path. Con dati flat residui mostrava la lezione legacy invece di quella selezionata; senza residui mostrava una timeline vuota. Sei test RED hanno riprodotto il problema prima del fix. Questa sessione lo ha corretto con fonte esplicita room-scoped e decoder canonico che verifica lesson/source. [Baseline loader](https://github.com/AndreaMarro/ardesia/blob/339ab08f4139da0b37e78bbde81e9fe4e83afea0/apps/studio/src/store/replayTimeline.ts).
3. **Il cambio di room conservava stato presentazionale precedente.** Due ulteriori test RED hanno rilevato titolo vecchio durante caricamento e errore di una room che nascondeva la successiva valida. Ora lo stato del replay appartiene alla coppia workspace/room e l'URL audio viene rilasciato dal caricamento che lo possiede.
4. **La sessione audio v2 ha già un contratto CAS riutilizzabile.** `SessionYamlV2`, `createSessionOnce`, `updateSessionAudioCAS`, `sessionPaths` isolano `raw/<lesson>/<session>/...`. Non serve inventare un nuovo session store. La classe audio legacy scrive invece file flat; l'export usa ancora session/audio room-scoped. La cattura v2 richiede integrazione fra questi contratti, non soltanto un nuovo bottone. [WorkspaceStore](https://github.com/AndreaMarro/ardesia/blob/339ab08f4139da0b37e78bbde81e9fe4e83afea0/apps/studio/src/store/WorkspaceStore.ts), [sessionState](https://github.com/AndreaMarro/ardesia/blob/339ab08f4139da0b37e78bbde81e9fe4e83afea0/apps/studio/src/store/sessionState.ts).
5. **Poiseuille esiste già e va riusato.** `activities.py` calcola il rapporto di portata a pressione fissa e il reciproco per la pressione a portata fissa; il Web ha PhysicsLab con predizione e parametri. Ho eseguito dodici controlli indipendenti sullo stesso blob presente in #290: sette valori/casi fisici e cinque input invalidi, tutti PASS. Non è approvazione scientifica completa del corso. [Modello](https://github.com/AndreaMarro/ardesia/blob/339ab08f4139da0b37e78bbde81e9fe4e83afea0/packages/engine/lessonos/study/activities.py), [PhysicsLab](https://github.com/AndreaMarro/ardesia/blob/339ab08f4139da0b37e78bbde81e9fe4e83afea0/apps/web/src/components/PhysicsLab.tsx).

## 3. Stato delle PR: topologia osservata

Il default branch live è `main@b124eee...`, con ultimo commit del 23 agosto. Le PR dell'ottobre non sono state fuse in main.

| Gruppo | Stato osservato | Significato |
| --- | --- | --- |
| #268 | open draft, base main | Recupero REA/quaderno e candidato di ottobre. |
| #269–272 | open draft | Banca/esame e approvazione; rami inizialmente paralleli. |
| #273–277 | open draft stacked | Convergenza schema/PostgreSQL, esame, correzioni C1/C2. |
| #278 | open draft | Preview statica dal Core. |
| #279–281 | open draft laterali | Quantità, review scientifica, navigazione PDF; confluite nella proposta #282. |
| #282 → #284 → #285 → #286 → #287 | open draft stacked | Catalogo, fix publication gate, physics pathways, vera API e runner isolation. |
| #283 | open draft laterale | RED della review scientifica legacy, non funzionalità da fondere automaticamente. |
| #288 → #289 → #290 | open draft stacked | Landing, UX e quattro esempi svolti; preview commerciale distinta dal runtime di lezione. |
| #291, #293, #295 | open draft, base main | Audit e proposte. Nessun app fix. |
| #296 | open draft, base main | Indice pubblico dei quattro kit; contenuti in knowledge privato. |
| #292, #294 | issue open | Audio final chunk e race getUserMedia dopo revoca; non PR. |

I pin esatti, le basi e gli SHA sono in `evidence/architecture-evidence.json`. Una PR CLEAN/mergeable rispetto alla propria base non significa stack pronto alla produzione. Non aprire un altro piano generale che ignori #291/#293/#295. Usare un breve indice datato dei delta e collegare quelle fonti.

## 4. Cronologia ricostruita, senza riscrivere la storia

| Periodo | Evidenza e decisione originale | Evoluzione da conservare |
| --- | --- | --- |
| Maggio | README ELAB/UNLIM: prodotto disciplinare, simulazione, guida, volumi e stack propri. | Trattare come donor o pack con provenienza, non farlo tornare identità di Ardesia. Le metriche README sono dichiarazioni storiche. |
| 6 giugno | `numerical-lab-journey@b33a5eb...`: piattaforma separata di calcolo numerico, quiz e runner Octave. | Valutare solo moduli ed esercizi isolati; importare intera auth/DB/queue duplicherebbe il Core. |
| 9–10 giugno | README `ardesia-studio`: aula nella stessa finestra, Excalidraw/MathLive/PDF, Meet esterno; allora «niente LessonOS» per separare tre progetti. | Conservare UX essenziale. La separazione iniziale non è divieto perpetuo d'integrazione. Il README riferisce dieci docenti a 15 €/mese senza dati primari disponibili qui: non usarlo come domanda di mercato verificata. |
| 17–26 giugno | Repo Studio e LessonOS con rami autonomi; canoni 23 giugno prescrivono Core/Plugin/Pack/Workflow e mostrano integrazione incompleta. | Preservare distinzione prodotto/sottosistemi e non gonfiare risultati del retrieval sintetico. |
| 30 giugno–luglio | Cutover monorepo, ToolHost, firma e capability, bridge journal/LessonOS, teacher dashboard, snapshot. Fonti `MONOREPO-TOTAL-CUTOVER-PACKET.md`, audit dashboard 11 luglio. | La disciplina di provenienza e il consumer prima del generatore sono utili. Gli stati in quei documenti restano datati. |
| 29–30 luglio | `ARDESIA-LOOP-TWO-HINGE-2026-07-30.md`: controlli reali distinti da status cosmetici, gate semantici, umano al merge. | Preservare i gate e i pin; eliminare dipendenza operativa da percorsi Mac ormai non presenti nei runner. |
| 1–2 agosto | #242 merged: post-it vivo identificato, isolato e persistente. #241 native-first chiusa non merged. | Nucleo di plugin instances reale; native-first non può essere assunto ratificato perché esisteva una PR. |
| Settembre | #248–258: bundle Studio→Engine, proiezioni StudyDigest, SummaryPack, integrità export. PR poi chiuse senza merge il 15–17 ottobre. | Salvare il patrimonio, ma controllare commit e consumer nel candidato prima di dire «è in main». |
| 2–16 ottobre | CircuitCheck/Kirchhoff, lezioni DC/AC/Laplace; chiusura documentale Kirchhoff in main `b35a8b5...`. | Integrare API e schema versione fissata. Non equiparare controlli AC/Laplace a proof DC o a copertura completa delle 21 famiglie. |
| 20 ottobre | ADR-0004 e consegna V4/G0: modular monolith, database canonico, Study API, error diary, registro. G0 globale non certificato; vari test live su SHA precedenti. | Conservare Core e porte provider. Non riattribuire 543 test live del vecchio SHA al registro nuovo o all'ultimo stack. |
| 21–23 ottobre | Banca 4.000, esame, gate scientifico, catalogo, quattro pathways, marketing. | I microcorsi sono ingresso commerciale. Portare il gesto didattico e la continuità nel percorso dimostrabile. |
| 24 ottobre | Audit #291/#293/#295 e questo delta; mandate utente rimette audio, multimodalità, MCP write al centro. | Evoluzione additiva documentata. L'attuale branch di ricerca non autorizza automaticamente produzione, corpus pubblico o marketplace. |

### Contraddizioni documentali da risolvere

- `CANON-INDEX` e `ARCHITECTURE-CANON` di giugno dicono di non leggere i subtree del monorepo come comportamento corrente; ADR-0004 e il lavoro di ottobre collocano il dominio nel monorepo. Soluzione: marcare il vecchio routing come **storico/superato dal cutover**, lasciando integro il racconto dell'epoca; un solo punto di ingresso attuale.
- Gli AGENTS dei package si rivolgono a Hermes su Mac mini e vietano Web/cloud e push per vecchi milestone. Il mandato attuale autorizza sviluppo, review e draft PR. Non inventare un blocco operativo perché una vecchia istruzione era contestuale a M0; conservare invece i vincoli sostanziali su dati reali, gate e produzione.
- ZERO-LLM nel prodotto e il nuovo obiettivo multimodale/AI non sono equivalenti. Il percorso a minor rischio è AI esterna che propone bozze, dominio deterministico che conserva autorità e docente che rilascia; l'effettiva integrazione deve dichiarare cosa cambia e quali misure la verificano. Non dichiarare autorizzata la produzione perché è autorizzato sviluppare.
- «Studio native-first», «universale», «microcorsi» e «marketplace» descrivono livelli e orizzonti diversi. La UI deve mostrare un percorso completo, non tre app concorrenti.

## 5. Repository storici: decisione di riuso

Metadata `archived` e accesso verificati via GitHub. README letti dove presente; 404 README significa assenza di quel file, non repository inaccessibile. Costi sono stime qualitative d'integrazione, non misure di ore. Nessuna licenza dei repository privati è presunta.

| Repository | Stato osservato | Ruolo consigliato, valore e costo | Provenienza/licenza |
| --- | --- | --- | --- |
| ardesia | public, non archived | Canonico prodotto e contratti; integrare stack verificato. Costo medio dovuto alle superfici. | Fonti e dipendenze da verificare per file; pubblico non equivale a libero riuso. |
| ardesia-studio | private, archived; README letto | Archivio UX/lavagna iniziale; donor mirato basso costo. Evitare secondo frontend attivo. | Dipendenze dichiarate nel README; nessun riuso commerciale globale dedotto. |
| ardesia-lavagna | private, archived; README assente | Archivio. Inventario interno ancora da fare; non inventare funzionalità. | UNKNOWN. |
| ardesia-simulator | private, archived; README assente | Archivio/prototipo; confrontare con simulator attuale prima di estrarre. | UNKNOWN. |
| lessonos | private, archived; default auto/main, giugno | Archivio dei motori e ricerche; usare per tracciare storia e test mancanti, non nuovo source-of-truth. | README metriche retrieval sintetiche: non benchmark del prodotto. |
| ardesia-tools | private, attivo; README letto | Fabbrica/automation, non runtime. Conservare idee di monitoraggio e ricevute; script legati a Mac e vecchi loop, costo medio. | Non eseguire script che inviano messaggi o manipolano branch solo perché presenti. |
| ardesia-vault | private, archived; README assente | Archivio storico, non stato attuale. | Accessi e contenuti privati da preservare. |
| ardesia-wiki | private, archived; README letto | Ricerca storica curata; link invece di duplicazione. | README esclude corpus di studenti. |
| ardesia-knowledge | private, attivo; main luglio, branch editoriali separati | Canonico per asset privati e continuità editoriale, non codice applicativo. Non sovrascrivere sync/current. | Non riversare contenuto privato nel monorepo pubblico. |
| kirchhoff | public, main `b35a8b5...` 16 ottobre | Componente specialistico da integrare con port versionata; proof e lezione distinti. Costo medio. | README: 15 PARTIAL, 6 NOT_SUPPORTED, 0 COMPLETE nel piano 21 famiglie; documento storico non rieseguito qui. |
| elab-tutor | private, attivo; README letto | Donor di simulazione/Arduino e contenuti con permessi; NON importare auth/memoria/dashboard intera. Costo alto se senza confine plugin. | Titolarità/diritti non deducibili dall'accesso al repository. |
| elab-volumi | private, attivo; README letto | Fonte privata consultabile solo per scopi autorizzati. Non trasferire corpus. | README dichiara esplicitamente IP terza e divieto di pubblicazione. |
| elab-website | private, attivo; README letto | Archivio di flussi commerciali. Non adottare seconda auth/Notion/Stripe per beta. Costo alto per riuso intero. | README all rights reserved. |
| unlim-intelligente | private, attivo; README letto | Ricerca/target di tutor AI disciplinare; recuperare requisiti di grounding e failure modes. | Target e prezzi storici, non risultati validati correnti. |
| numerical-lab-journey | private, attivo, default codex/initial-mvp | Donor futuro per esercizi numerici/runner isolato; basso valore immediato per Fluidi. | Runtime Octave distinto da MATLAB; esaminare licenze e sandbox prima dell'adozione. |

## 6. Inventario tecnico del percorso distintivo

| Capacità | Stato per evidenza disponibile | Gap pratico |
| --- | --- | --- |
| Lavagna e journal v2 | Confine Excalidraw corretto dopo RED browser; 72 test journal PASS e browser del collega (§12) | Browser usa storage locale sintetico; FSA, auth e dispositivi fisici non provati. |
| AudioRecorder | Primitivo legacy; lifecycle corretto dal root e 39 test PASS, inclusa review indipendente (§11) | Non istanziato nella Room corrente; session/path/journal v2 da collegare. |
| Audio→semantica | SPECIFIED, non dimostrato | `journalBridge` promuove PDF riconosciuto, non interpretazione voce-oggetto. Servono evidenze e revisione. |
| Replay legacy e room | IMPLEMENTED, ora 43 test locali verdi; ultimo millisecondo raggiungibile (§12) | Codec/browser reali e più registrazioni con intervalli da provare. |
| Sessioni persistenti CAS | IMPLEMENTED in WorkspaceStore/sessionState | Audio legacy non consuma il contratto; export usa livello room anziché session. |
| Materiali post-lezione | Engine/capsule/proiezioni e lavori settembre presenti | Non verificato ciclo completo con audio corrente, né tutti gli artefatti remoti. |
| Poiseuille/Taylor | Core e due renderer Web presenti | Unirli alla storia della lezione, non duplicare solvers sul marketing. |
| Unità/idrostatica/Archimede | Core evaluator presente | `apps/web/src/course.ts` accetta solo Poiseuille/Taylor come entry activity. |
| Correzioni | Submission + draft + review + projection presenti | Draft è `deterministic_fake`; manca input reale AI e revisione di candidata con digest. |
| Diario errori | Core/eventi/prove di trasferimento presenti | Evitare inferenza di competenza o mastery senza compiti di trasferimento. |
| Gestionale | Edizioni, posti, presenze, incassi manuali presenti | Vincoli hardcoded del pilot e assenza di organizzazioni reali; non è SaaS multi-tutor già pronto. |
| Study MCP | Quattro GET nel #285 e stack | Nessuna write; cookie di sessione per processo su loopback, non remoto multiutente. |
| Study remoto | `create_app(demo=False)` rifiuta con synthetic_only | Auth, RLS, ripristino e tenant isolation da verificare sullo SHA target. |
| Banca 4.000 | Dataset draft e gate separati | Conteggio non implica correttezza scientifica/varietà/revisione editoriale. |
| Marketing | Quattro percorsi/esempi e CTA; CI #290 success | Non è ancora demo di cattura, replay, produzione materiale e memoria personale. |

## 7. Debito prioritario e riparazione

| ID | Priorità e rischio | Causa e intervento | Verifica discriminante |
| --- | --- | --- | --- |
| D1 | P0 sul replay | Loader flat mentre producer room-scoped. **Riparato nel working tree**. | Due room reali da JournalRecorder, residuo flat ostile, load ripetuto, mismatch envelope; sei RED→GREEN. |
| D2 | P0 audio quando riattivato | Ultimo blob perso, getUserMedia tardivo dopo revoca e failure storage nascosti. Corretti nel primitivo dal root. | 39 test PASS: deferred media, stop ordering, purge dopo write, rapid reconsent, dispose e failure esplicite; browser nativo separato. |
| D3 | P1 integrazione multimodale | Contratto audio v1, sessione v2, export room, journal senza audio. | Vedi backlog seguente; nessun secondo sistema di sessione. |
| D4 | P1 stato UI | Titolo/errore/URL legati al caricamento precedente. **Riparato**. | Room B pending non mostra A; errore A non blocca B; URL A revocato. |
| D5 | P1 multi-tutor | Scope globale/organizzazioni mancanti; synthetic_only. | Tenant ostile, revoca, actor forgery, source deletion su vero adapter target. |
| D6 | P1 correzione AI/MCP | Stub feedback, digest della bozza non pinnato nel rilascio. | RFC #293 W01–W18 sul Core prima di tool write. |
| D7 | P1 pubblicazione scienza | Bypass legacy corretto #284, altri publisher da riesaminare. | Nessun ID servibile senza review exact content e pubblicazione separata, inclusi retry/revoca. |
| D8 | P1 rilascio | Main agosto, stack ottobre lungo, CI per singolo SHA. | Build e prova end-to-end del candidato integrato; niente inferenze dai badge delle sole PR figlie. |
| D9 | P2 duplicazione sistemi | Potenziale import app ELAB/Numerical Lab invece di capability. | Confine Plugin/Pack, zero seconda auth/diario/memoria. |
| D10 | P2 documentazione | Canoni giugno, stato generato e mandato ottobre in tensione. | Indice breve con autorità, snapshot datati, superseded pointers, generator per stato live. |
| D11 | P0 cattura lavagna | Excalidraw emette optional undefined; il producer li passava al validator JSON e faceva cadere la UI. **Riparato al confine producer**. | 7 RED→72 PASS; dati non JSON respinti, nessun indebolimento dello schema. |
| D12 | P0 completezza replay | Slider step100 non raggiungeva l'ultimo evento quando durata non multipla100. **Riparato step1 ms**. | Range nativo si fermava1400 su max1405; RED→43 replay PASS; verifica End nel browser a cura collega. |

## 8. Sequenza minima per audio v2 e lezione viva

La correzione del recorder legacy riduce rischi ma non basta a dichiarare disponibile la cattura. Per un'integrazione mantenibile:

1. **Scegliere sessione esistente come autorità.** Room ha già `runtime.identity`. Creare/leggere la sessione attraverso `WorkspaceStore.createSessionOnce` e aggiornare consenso attraverso `updateSessionAudioCAS`. Non leggere un cookie o consent globale come autorizzazione per altra room. Ogni riapertura può richiedere nuova scelta esplicita; il consenso persistito è dato storico, non inizio automatico del microfono.
2. **Adattare porta storage del recorder.** `AudioRecorderOptions` deve ricevere un port di storage/persistenza scoped oppure identità validata. I file nuovi appartengono a `sessionPaths(identity).audioDir`, i write sessione alla stessa identità CAS. Una vecchia richiesta media non deve iniziare né cancellare registrazione successiva.
3. **Evento canonico di media osservato.** Aggiunta esplicita/versionata al journal v2 (es. audio segment recorded) con asset ref, sessionId, tempi, MIME/digest. Rifiutare durata negativa, indice non valido, identity mismatch. Non promuovere automaticamente il contenuto a concetto appreso. Mantenere la distinzione tra raw evidence e fatti didattici.
4. **Timeline per registrazione.** Un `startEpoch` unico non basta per più start/stop con pause; MediaRecorder emette stream WebM distinti. Raggruppare per recording/session identity, mantenere mapping tempo media↔tempo lezione e non concatenare alla cieca stream separati. La finestra permesso microfono non è audio registrato.
5. **Export/import coerenti.** Aggiungere al bundle riferimenti alle sessioni e ai file consentiti, con hash e versione. Il bundle di A non contiene B; la revoca elimina/omette media coerentemente senza cancellare l'evidenza storica di revoca. Non retrocedere un envelope v2 a v1 per comodità.
6. **Prova browser.** Gesto esplicito → stream sintetico browser → scrittura → stop+flush → seek nel replay → export → nuova istanza/store → import e stesso passaggio. Poi revoca e verifica assenza dei byte. Niente voci reali necessarie per questa prova.
7. **Collegamento alla didattica.** Riutilizzare Poiseuille: predizione a raggio doppio; risultato 16× a pressione fissa; spiegazione con segmento e oggetto; errore annotato dal docente; compito di trasferimento raggio dimezzato a portata fissa. Il prossimo compito usa l'errore osservato e la versione esatta, non una percentuale di padronanza inventata.

Questo percorso è più grande del fix locale. Il mandato lo autorizza come sviluppo in branch; non va nascosto dietro una flag che fa apparire già pronta una funzionalità priva di export/replay/consenso coerenti. Una demo sintetica può rendere visibile il design, purché etichettata e alimentata da contratti reali.

## 9. Revisione avversariale: cosa preservare e cosa contestare

**Preservare** il modular monolith, i comandi del Core, gli eventi append-only, sourceRefs exact revision, la separazione review/pubblicazione, i renderer esistenti, gli asset originali e la distinzione tra preview e produzione. Gli errori di prodotto non giustificano un nuovo kernel, un nuovo grafo o una riscrittura di tutto il catalogo.

**Contestare** dieci assunzioni concrete:

1. Più quiz = più valore: misurare risoluzione autonoma e ritorno in lezione, non il numero record.
2. Un test audio verde = audio pronto: il producer v2 rifiuta audio e il recorder non è montato.
3. Esiste ReplayView = la lezione si rivede: il loader leggeva il path sbagliato, ora dimostrato.
4. Campo `humanReviewed` = revisione umana reale: in fixture il ritorno include `syntheticTutor: true`.
5. MCP read = compatibilità host completa: transport, OAuth e MCP Apps vanno provati separatamente.
6. Import ELAB = accelerazione garantita: import intero riporta auth, memoria e flussi concorrenti.
7. Un vecchio canone vale come stato corrente: documenti di giugno rinviano a repository ora archiviati.
8. Quattro percorsi = quattro microcorsi completi: può trattarsi di classificazione di materiale draft.
9. CI locale/SQLite = produzione Auth/RLS: i live test saltano senza opt-in, il runtime principale rifiuta production mode.
10. REA visit count = trasferimento verificato: la consegna del 20 ottobre distingue 139 ingressi da analisi profonde e conserva UNKNOWN/INCOMPLETE.

## 10. Incremento implementato e prove

File modificati da questo filone:

- `apps/studio/src/store/replayTimeline.ts`: room esplicita; source path al decoder; audio importato nella medesima room; consumer flat solo attraverso API legacy esplicita.
- `apps/studio/src/ReplayView.tsx`: passa room; stato caricamento associato a workspace/room; cleanup URL audio di proprietà della lettura.
- `apps/studio/src/__tests__/ReplayView.test.tsx`: fixture coerenti con produzione, prova sorgente scelta, cambio room e recupero da errore; Room replay non scrive.
- `apps/studio/src/__tests__/replayTimelineRoom.test.ts`: cinque test aggiuntivi con **JournalRecorder reale** e store in memoria, due room, riapertura, flat ostile, envelope mismatch, legacy audio e room invalida.

Prove conservate:

| Prova | Risultato | File |
| --- | --- | --- |
| Prima modifica test, sorgenti baseline #290 | Sei RED (6/6 eseguiti), nessun falso PASS | `research/replay-red.log` |
| Due ulteriori regressioni cambio room | Due RED | `research/replay-scope-red.log` |
| Suite replay completa dopo fix | 42 PASS, 4 file | `research/replay-green.log` |
| TypeScript Studio | exit 0 | `research/replay-typecheck.log` |
| Whitespace/diff | `git diff --check` exit 0 | Eseguito sul working tree condiviso |
| Modelli fisici | 12 PASS sul blob identico #290 | Output tool; schema riepilogo in architecture_evidence.json |

Comando suite: `ARDESIA_GIT_SHA=339ab08f4139da0b37e78bbde81e9fe4e83afea0 npx vitest run src/__tests__/replayTimelineRoom.test.ts src/__tests__/replayTimeline.test.ts src/__tests__/ReplayView.test.tsx src/__tests__/ReplayEngine.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000` da apps/studio.

La prima invocazione senza ARDESIA_GIT_SHA non ha avviato i test: Vite, eseguendo config bundled in `.vite-temp`, non risolveva il fallback git. Il pin esplicito coincide con lo SHA base realmente osservato. Non è stato cambiato il gate o il resolver. Le prove locali dimostrano quel working tree con modifiche non committate; il root dovrà registrare lo SHA finale al commit e distinguere le verifiche successive.

**Non verificato da questo filone:** browser reale, codec audio, iPad, nuovo export multimodale, auth remoto, RLS, carico multiutente, riconoscimento semantico, efficacia didattica, disponibilità commerciale. Nessun commit/push eseguito dal subagente.

## 11. Review indipendente del nuovo lifecycle AudioRecorder

Il root ha implementato il ciclo di vita del recorder legacy: proprietà della richiesta microfono per generazione, una take per recorder, drain del blob finale, write serializzate e cancellazione dopo la revoca. Questo filone ha riesaminato il codice e aggiunto **sei probe indipendenti** in `apps/studio/src/__tests__/AudioRecorder.adversarial.test.ts`, senza cambiare il recorder.

È emerso un problema concreto nel primo diff: il catch della coda dei chunk assorbiva sia il fallimento dello storage sia l'eccezione del marcatore. Lo `stop()` risolveva con successo pur non avendo salvato l'ultimo segmento. Due test RED hanno riprodotto i due casi, mentre un terzo test verificava già la cancellazione dopo una callback fallita. La trace originale è `research/audio-independent-red.log`.

Il root ha corretto il contratto del primitivo: `lastError` conserva l'errore, `stop()` rigetta se il salvataggio non è completo, `onChunk` può essere asincrono ed è atteso prima del completamento, la revoca continua comunque il drain e la purge. `lastRevoke` segnala i fallimenti della cancellazione o della persistenza del consenso; una perdita del recording precedente rimane visibile in `lastError` e non impedisce la cancellazione.

| Probe indipendente | Risultato dopo correzione |
| --- | --- |
| Scrittura dei byte finali fallisce | stop rigetta; lastError mantiene la causa; microfono rilasciato |
| Marcatore sincrono fallisce | stop rigetta e causa osservabile |
| Marcatore asincrono fallisce | stop rigetta e causa osservabile |
| Marcatore asincrono ancora pendente | stop rimane pendente anche quando i byte sono già scritti |
| Revoca dopo marcatore fallito | Byte eliminati; sessione OFF persistita; causa originaria ancora osservabile |
| Evento di errore MediaRecorder | Stato recording falso, stream rilasciato, errore osservabile |

Esecuzione diretta: **39 PASS su 3 file** (21 precedenti, 12 lifecycle del root, 6 avversariali), `npm run typecheck` exit 0 dopo aver corretto l'inferenza eccessivamente stretta del mock di questo filone, `git diff --check` exit 0. Log: `research/audio-independent-green.log`. Queste prove usano stream e byte sintetici e la sequenza asincrona degli eventi del browser; non sostituiscono una verifica del codec nativo.

La semantica di `dispose()` è ora dichiarata: chiusura terminale del recorder e annullamento delle richieste pendenti; conserva la cronologia già autorizzata. **Non è una revoca persistente.** Per la revoca sono necessari `consent=false` e attesa di `lastRevoke`. Non usare questo fix per affermare che dispose abbia persistito OFF o cancellato registrazioni storiche, né per dichiarare chiuse tutte le condizioni del prodotto nelle issue #292/#294.

### Controprova browser sopraggiunta

Il filone `product_pedagogy`, nella propria prova browser, ha segnalato un errore alla prima creazione nativa Excalidraw: `payload.element.customData` contiene `undefined`, rifiutato dal validatore JSON canonico v2. Il file `research/replay-browser/first-run-drawing-crash.json` e lo screenshot del filone documentano il risultato. **È una prova del collega, non una mia esecuzione.** I miei test iniziali del replay usavano JournalRecorder reale ma elementi sintetici JSON-validi: dimostravano isolamento e caricamento, non il confine della lavagna nativa. Il root ha quindi autorizzato questo filone a correggere quel confine e la precisione del cursore; risultati nella sezione seguente.

## 12. Riparazioni guidate dalla controprova browser

### 12.1 Excalidraw → journal canonico

La causa non era uno schema troppo severo. Gli elementi nativi contengono `customData: undefined` per indicare metadati opzionali assenti. `recordChange` clonava l'intero elemento e lo passava al formato v2, che ammette solo JSON rigoroso. Ho aggiunto test prima del cambiamento: add, update e campi opzionali annidati riproducono l'errore identico al browser.

La stessa analisi ha mostrato un problema complementare: `structuredClone` applicato **prima** del validatore trasformava classi in oggetti plain, scartava proprietà symbol/non-enumerable ed eseguiva getter. Quattro ulteriori test hanno dimostrato che questi dati passavano al record senza rifiuto. Totale baseline: **7 RED e 10 PASS** in `JournalRecorder.boardBoundary.test.ts` (`research/board-boundary-red.log`).

`JournalRecorder.ts` ora usa uno snapshot specifico per gli elementi della lavagna. Omette solo proprietà own, stringa, enumerabili, di dati, con valore undefined su oggetti plain. Mantiene i descrittori e gli altri valori per la validazione successiva: niente conversione NaN→null, niente Date→stringa, niente esecuzione di getter, niente rimozione dei buchi negli array. Il traversal è iterativo e conserva i cicli, che il validatore canonico rifiuta. Le proprietà vengono definite esplicitamente, evitando la speciale assegnazione di `__proto__`. L'oggetto fornito dalla lavagna non è modificato.

Non ho cambiato `assertEventEnvelopeV2`, l'unione dei kind, Room o l'export. La funzione esistente che costruisce l'envelope continua a validare prima e dopo il proprio snapshot. I test controllano anche che un envelope a cui venga aggiunto undefined venga ancora respinto.

Esito: **72 PASS** (17 nuovi boundary + 55 JournalRecorder esistenti), typecheck PASS e diff-check PASS. Log `research/board-boundary-green.log`. L'ulteriore esecuzione combinata journal/envelope/Room/replay ha prodotto 259 PASS e un FAIL ambientale: `spawnSync git EPERM` nel controllo di provenienza del checkout. La stessa chiamata fallisce in Node standalone, quindi non è attribuita alla correzione; non ho modificato o saltato il controllo. `research/board-expanded-suite.log` conserva anche questo limite; il root ha avviato il gate completo con il runner autorizzato per tale subprocess.

### 12.2 Ultimo evento raggiungibile

Dopo la correzione del confine, il browser del collega ha registrato correttamente un elemento testo con un update finale. La seconda controprova ha trovato che End si fermava cinque millisecondi prima di max: con `step=100`, la durata non multipla di100 rendeva l'ultimo update irraggiungibile. La scena appariva vuota perché il testo rimaneva alla versione iniziale senza contenuto. Non attribuire a questo run un rettangolo completato: il collega ha rilevato che la prima shortcut non aveva il focus necessario e ha reso esplicita questa precondizione nel QA successivo.

Un test DOM usa lo stepping nativo dell'input range: con min1000/max1405 il valore massimo ottenibile era1400. Questa è la nuova prova RED (`research/replay-range-red.log`). `ReplayView.tsx` ora usa `step=1`, coerente con i timestamp in millisecondi. Il test raggiunge1405 e verifica la scena dell'ultimo evento; tutte le **43 prove replay** sono verdi (`research/replay-range-green.log`). Typecheck e diff-check successivi sono entrambi exit0.

Il root ha revisionato il diff descriptor-aware e il replay. Nessun commit o push di questo filone. Il sorgente è rimasto congelato durante il gate completo e la prova browser finale.

### 12.3 Prova browser finale del collega e controllo degli artefatti

`product_pedagogy` ha completato il flusso Chromium: creazione via mouse/tastiera di due room, journal v2 di23 eventi per room, replay A, replay B, riapertura a freddo A, room vuota con residuo flat valido e controllo mobile. **13 controlli PASS**, stato del report `PASS_WITH_EXTERNAL_FONT_ERRORS`; zero pageerror e zero warning. Gli errori di console rimasti riguardano il caricamento dei font CDN con certificato rifiutato nel runtime. Non descrivere la console come pulita o il rendering tipografico come interamente verificato.

Fonte esecutiva: `research/replay-browser/replay-browser-result.json`, concluso `2026-10-24T08:51:04.441Z`. Ho letto quel JSON e ispezionato indipendentemente gli screenshot `room-a-replay-desktop.png` e `room-a-replay-mobile-recovered.png`: desktop mostra il testo e il riquadro attesi; mobile recupera il contenuto tramite il pulsante visibile ma il bordo destro del riquadro resta fuori viewport. Il controllo fa pan, non auto-fit. Questa è una **frizione mobile residua**, non perdita del journal; non rivendicare UX mobile già rifinita.

La route replay è stata raggiunta via deep link. Il test non prova un pulsante di navigazione replay già disponibile nel prodotto. Il cambio della sola hash non aggiorna l'identità catturata al mount; la riapertura testata include reload, coerente con la navigazione applicativa esistente. La prova usa dati sintetici e storage browser locale, non FSA, server auth, microfono reale, nuovo audio v2, associazione semantica o codec. Le tre precedenti controprove fallite sono conservate come evidenza, non cancellate dal run finale.

## Esito del gate coordinato finale

Dopo il congelamento dei sorgenti, root ha eseguito i comandi Studio invariati in un executor autorizzato: typecheck PASS; suite completa **2.201 PASS, 5 SKIPPED** (200 file PASS, un file visual-smoke saltato per assenza delle fixture screenshot); build PASS. Il precedente `spawnSync git EPERM` non compare nel run finale. Sono rimasti i warning jsdom di navigazione e il warning di bundle grande, documentati in `validation.md`. Non sono stati modificati gate o test di provenienza. I risultati del browser e dell’audio nativo hanno ambito distinto.
