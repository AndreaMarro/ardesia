# Revisione scientifica/editoriale e sicurezza — 25 ottobre 2026

## Esito e perimetro

Il candidato iniziale è `1898b633` (tree `87357259b006fdbc0777915b8dd6c8d9acf48b66`), confrontato con `origin/main@b124eee04acc8062c27284f23c5d9108e3767c27`. Il root ha preparato un merge index con quel tree, senza usare storie estranee. La presente revisione è mirata ai gate scientifici/editoriali, accessi e revoca, media e sessioni, ripresa Hydro e fonte della lezione; non è una scansione esaustiva di ogni file delle 37 PR.

Ho trovato e riprodotto un P0 privacy: la revoca da una seconda vista cancellava i byte e persistiva OFF, ma lasciava il microfono della prima vista attivo, oppure avviava un MediaRecorder dopo la risoluzione tardiva del permesso. Il controllo di revoca nella stessa istanza passava. Il root ha assegnato esplicitamente il fix dopo il RED. Il delta risultante è ancora locale e richiede la review indipendente e il gate completo del root.

Sul delta congelato: **97 test audio/pannello PASS in 7 file, typecheck Studio PASS; Chromium nativo in due schede 8/8 PASS**, con MediaRecorder, Web Locks e BroadcastChannel reali e dispositivo audio sintetico. La prima review dei gate scientifici/editoriali ha eseguito **45 test PASS, zero SKIP** sul candidato. Questi esiti non attestano validità scientifica dei contenuti, microfono hardware, efficacia didattica o beta remota.

**La riunificazione del codice DRAFT mantiene la release bloccata.** Il checker conserva `releaseStatus=BLOCKED`, reviewer/autorizzatore umani null e i gate separati: `bin/web/check_teaching_candidate.py:153-171`. La rotta storica di approvazione HTTP non può pubblicare nemmeno con conferma: `services/study-api/study_api/question_bank_routes.py:174-193`. Il consolidamento Git non costituisce revisione scientifica, autorizzazione di lancio o approvazione GitHub.

## Difetto P0 e correzione autorizzata

### RED riproducibile

Fixture sintetica con due `WorkspaceStore` sullo stesso driver, una prima registrazione già salvata e una seconda registrazione/permission pending. La prima take rende la sessione visibile nello storico di un'altra apertura (`apps/studio/src/LessonPassageAuthor.tsx:49-67`); il registro attività è condiviso tra viste (`lessonMutationLock.ts:287-295`).

1. Seconda vista: `await revokeStoredAudioSession(storeB, identity)`.
2. Sessione canonica OFF e directory audio vuota.
3. Prima vista: `stage=recording`, MediaRecorder `recording`, track non fermata.
4. Variante con permesso pendente: dopo revoca conclusa, la risoluzione del permesso costruiva ancora una nuova istanza nativa prima del CAS stale.

Il RED originale esterno era 1 controllo PASS / 2 difetti RED su source pin `1898b633`. Il RED del test entrato nel repository contiene quattro fallimenti materiali: attivo, permission tardiva, coda nativa, local-only senza BroadcastChannel. Contiene inoltre un errore di harness Node/Blob di JSZip, separato dai difetti: corretto usando l'ambiente jsdom già usato dalle suite AUDIO-V2. Non conteggiare quell'errore come quinto difetto di prodotto.

Prove: `audio-repository-red.log`; test canonico `apps/studio/src/__tests__/AudioV2_crossViewRevocation.test.ts`. Il file conserva i nove casi iniziali più otto controlli su capacità indisponibile, cleanup, path con maiuscole, ripartenza, UI e intento anteriore a una revoca idempotente.

La review non autrice C ha riprodotto un clic nuovo perso durante una revoca. Un primo tentativo di ignorare il notice OFF quando l'intento non aveva ancora una lease era troppo permissivo: C ha dimostrato un P0 con intento **anteriore** a un OFF idempotente e initialization trattenuta. Quella guardia è stata rimossa. La versione consegnata cancella sempre l'intento raggiunto da OFF e, nel caso senza lease, espone «Consenso cambiato in un'altra vista. Premi Registra di nuovo per confermare.»; un nuovo gesto dopo la revoca funziona, senza retry ON automatico. Il test di regressione trattiene initialization e richiede zero nuovi getUserMedia/take e consenso OFF. `audio-p2-intent-red.log` conserva il primo difetto UX; il controllo nativo stale di C documenta perché la guardia intermedia è stata rifiutata.

C ha poi rieseguito tre probe nativi indipendenti sul nuovo binding: intento OLD prima di OFF idempotente → errore visibile, zero native start e consenso OFF; nuovo clic raggiunto dal vecchio notice → cancellazione sicura, poi retry **esplicito** che avvia e salva una take; nuovo clic durante purge già avviato → attesa, poi nuova take salvata e track ended. Nessun P0/P1 residuo riprodotto nel perimetro. Il report di C è `/private/tmp/ardesia-audio-independent-review/report.md`; i suoi script non hanno modificato il repository.

### Delta e ordine dei lock

| File | Cambiamento necessario |
|---|---|
| `apps/studio/src/store/SessionAudioRecorder.ts` | Invalidazione OFF con readback della sessione canonica; scarto della take e stop nativo; controllo del consenso prima del native start; permission pending non trattenuta dalla revoca; coda e purge attendibili. Nessun ON dal messaggio. |
| `apps/studio/src/store/lessonMutationLock.ts` | Namespace capture distinto dalle mutazioni. Lifetime condiviso; breve transition condivisa per ON/start, esclusiva da prima OFF fino al termine del purge; barriera esclusiva di capture durante il purge. |
| `apps/studio/src/store/WorkspaceStore.ts` | Descrittore tecnico del backend: localStorage per origin, oggetto driver per fallback locale. Nessun nuovo file, DB, sessione o consenso. Cambio archivio rifiutato durante una cattura. |
| `apps/studio/src/SessionAudioControls.tsx` | Motivo di indisponibilità visibile prima del consenso; checkbox e Registra disabilitati; revoca dei dati storici disponibile. |

Non si acquisisce un lock capture/transition possedendo un lock di mutazione. Il prompt di `getUserMedia` rimane fuori dal transition gate: una revoca non aspetta un prompt che potrebbe restare irrisolto. Una nuova azione ON aspetta il completamento del vecchio purge. Le lease separano lezioni e driver distinti anche quando le identità della sessione sono state copiate.

**Limite deliberato:** la cattura live su FSA è chiusa prima di ON/getUserMedia, con spiegazione visibile. Nome della cartella, UUID copiati e hash del contenuto non identificano in modo affidabile una cartella tra realm. Non è stata inventata un'altra autorità persistita o dichiarata una prova cross-folder non eseguita. Replay, import e revoca dei byte storici restano disponibili. Non è stata modificata `drivers/fsa.ts`.

Le firme dei quattro file runtime e dei due test sono in `audio-source-binding.json`; il binding indica esplicitamente un delta non committato. Il mock di `LessonPassageAuthor.test.tsx` dichiara il nuovo metodo `captureUnavailableReason: () => null`: nessun fallback opzionale nel prodotto e nessuna asserzione indebolita. Il root deve rilegarlo al commit finale.

## Matrice capacità / gate

| Capacità | Main `b124eee0` | Candidato `1898b633` + delta autorizzato | Gate e limite |
|---|---|---|---|
| Unico Study Core/DB/ricevute | Il sottosistema Study di ottobre non è su main | Dominio condiviso `packages/engine/lessonos/study`; API e MCP consumano il Core, non un secondo ledger | ADR-0004; SQLite e adapter PostgreSQL condividono policy. Non equivale a prova remota Supabase. |
| Review scientifica privata | Assente questa superficie Study | `question_bank_approvals.py:216`; CAS del predecessore, hash/versione esatti, append-only | Review non crea approvazioni; 45 test locali dei confini PASS. |
| Pubblicazione / revoca quesiti | Assente questa superficie Study | `question_bank_approvals.py:244`, `:311`; HTTP review+publish separati; vecchia approvazione APPROVED rifiutata `question_bank_routes.py:189` | Revoca durevole; retry della pubblicazione revocata non la riattiva. Nessuna approvazione dell'intera banca DRAFT implicata. |
| Feedback docente / diario | Assente il flusso Study di ottobre | `feedback.py:21` proposta `deterministic_fake`; `:41` rilascio tutor, ricevute e proiezione Core | Bozza privata non è correzione AI; digest della futura proposta MCP non implementato dall'RFC. |
| Cattura fine / consenso / revoca | Recorder legacy; i gate AUDIO-V2 non sono su main | Sessioni v2 CAS, journal e byte verificati; P0 di revoca tra viste corretto nel delta | 97 test audio/pannello, due schede native; FSA live e browser senza coordinamento chiusi; hardware NOT_RUN. |
| Import/export / round-trip | Primitive legacy | `lessonBundle.ts:380`, `audioWriteFence.ts:33`; sessione revocata non ripristinabile da bundle vecchio o revision artificiale alta | Audio esatto e identità verificati; export è artefatto non firmato, non nuova autorizzazione o distribuzione remota. |
| Ripresa Hydro #302 | Assente | `ScalarExperienceEpisode.tsx:16`: receipt per actor/activity/experience id-version-digest/step; `:61` resume | Non inferisce padronanza. UI complessiva è ri-montata per actor/edizione (`App.tsx:216`). Il root mantiene la controprova browser finale. |
| Fonte leggibile #303/#304 | Assente | `SourceViewer.tsx:125` trascrizione, `:133` selezione sull'originale; `:157` revisione intera in provenienza | Dati/offset originali conservati; #304 ripara solo l'asserzione della revisione compatta. Test verde non equivale a nuova funzionalità. |
| MCP writer #293 | Assente | `services/study-mcp/study_mcp/server.py:19-24`, `:41-69`: quattro letture con `readOnlyHint=True` | **Writer NON IMPLEMENTATO.** L'RFC resta proposta, non tool remoto né permesso di publish. |
| Pubblicazione marketing / voce / quattro DRAFT | Non certificata dal candidato | `check_teaching_candidate.py:155` sempre BLOCKED; scheda umana R1 e runlog R2 mantengono pending | Approvare digest esatti o escludere con rebuild; autorizzare il target separatamente. Preview SSO non è lancio pubblico. |

## Sei PR indipendenti: raccomandazione terminale

Sono raccomandazioni alla regia: non ho chiuso, mergiato, pubblicato o contattato persone. Gli SHA sono quelli letti da GitHub durante questa review.

| PR / SHA | Contenuto reale | Raccomandazione prima dello stato terminale |
|---|---|---|
| #264 `b41380e3` | RFC debranding/universalità e vecchio CoursePack | Non assorbire il ramo indiscriminatamente. Dichiarare superate le decisioni equivalenti dai canoni correnti e preservare esplicitamente eventuale contenuto unico prima della chiusura. Non certificare il vecchio pack per effetto della chiusura. |
| #265 `4117382b` | Inventario legacy, script/test e workflow | Integrare gli strumenti utili e verificati sotto ownership root; poi chiudere con binding del commit. I vecchi conteggi nel documento sono snapshot, non stato corrente. La review del nuovo inventory è del root/altri owner. |
| #291 `690e1586` | Protocollo di convergenza e playbook, solo docs DRAFT | Conservare decisioni/prove utili in un solo indice canonico; evitare una seconda norma parallela a `AGENTMEMORY-SEMANTIC-PROTOCOL`. Chiudere come consolidata/superata soltanto quando il riferimento preservato esiste nel candidato. |
| #293 `5a4d8931` | RFC MCP write su feedback Core + licenze, solo docs DRAFT | Preservare l'RFC come PROPOSED e chiudere la PR dopo il suo assorbimento documentale. Il ticket futuro può iniziare dal RED sul Core; nessun writer/AI runtime/publish è stato creato o autorizzato. |
| #295 `15fa8176` | Audit source-level della race originale #294, otto gate RED proposti | Preservare il documento come evidenza storica. Chiudere come superata dalla fonte e dalle prove del candidato solo dopo review indipendente, gate completo e binding finale del fix nuovo. Non cancellare i NOT_RUN storici. |
| #296 `65d84389` | Indice pubblico dei quattro kit editoriali, DRAFT; nessun testo docente privato | Assorbire l'indice mantenendo DRAFT e confini; poi chiudere. La PR privata knowledge #20 non viene importata né approvata; il suo archivio incompleto descritto dal documento non è una dipendenza utilizzabile. |

Per tutte: una chiusura unmerged va chiamata archiviazione/superamento, non integrazione. L'integrazione del candidato segue la branch protection corrente e l'approvazione richiesta da GitHub di persona eleggibile distinta da autore/ultimo pusher. Nessun bypass o auto-merge è stato tentato.

## Riproduzione e limiti delle prove

### Audio mirato

```sh
cd /private/tmp/ardesia-r2-20261024/apps/studio
/opt/homebrew/opt/node@26/bin/node node_modules/vitest/vitest.mjs run \
  src/__tests__/AudioV2_crossViewRevocation.test.ts \
  src/__tests__/AudioV2.test.ts src/__tests__/AudioV2_independent.test.ts \
  src/__tests__/AudioRecorder.lifecycle.test.ts \
  src/__tests__/AudioRecorder.adversarial.test.ts src/__tests__/AudioRecorder.test.ts \
  src/__tests__/LessonPassageAuthor.test.tsx \
  --pool=threads --maxWorkers=1 --no-file-parallelism \
  --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
/opt/homebrew/opt/node@26/bin/node node_modules/typescript/bin/tsc -b --noEmit
```

Risultato congelato: `audio-focused-final.log` 97 PASS; `audio-typecheck-final.log` exit 0.

### Chromium in due schede

```sh
/opt/homebrew/opt/node@26/bin/node \
  /private/tmp/ardesia-convergence-20261025-work/science-security/native-two-tabs.mjs
```

Lo script avvia Vite solo su loopback, legge la fonte congelata, apre due schede nello stesso contesto e usa il fratello `native-audio.html`. Artifact: `native-two-tabs.json`, 8/8 PASS, zero pageerror e zero lease capture residue. Il receipt include gli SHA-256 reali dei sei file selezionati; la commit SHA del producer è marcata espressamente come fixture sintetica, non head del prodotto. L'attempt1 è preservato: sei verifiche privacy passavano, poi il cleanup dispose di una take appena avviata incontrava correttamente un tail nativo vuoto. Il runner finale revoca/scarta prima di dispose; non sono stati aumentati timeout o indeboliti assert del prodotto. La receipt `native-two-tabs-before-guard-rollback.json` mantiene l'esito limitato degli otto controlli sulla guardia intermedia: il controesempio aggiuntivo di C ne ha dimostrato la copertura insufficiente.

Questa è una prova browser del source, non un deploy, un artefatto servito al pubblico o hardware. Node 26.5.1 è il runtime locale usato per questi test; non è una nuova esecuzione REA e non eredita claim di compatibilità REA.

### PostgreSQL e Supabase

Il root prepara il DB locale effimero. Test esatti previsti dal repository:

```sh
PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=packages/engine:services/study-api \
ARDESIA_TEST_POSTGRES_URL='<URL del cluster effimero locale del root>' \
services/study-api/.venv/bin/python -m pytest -p no:cacheprovider \
  packages/engine/tests/study/test_postgres_schema_convergence.py \
  packages/engine/tests/study/test_postgres_question_reviews.py -q -ra \
  --basetemp=/private/tmp/ardesia-convergence-20261025-work/pg-native-temp
```

Sono 12 test: 9 schema/RLS/exam e 3 review/privacy/CAS/revoca. I fixture creano e cancellano propri database sintetici. Gli altri `test_postgres_*` che importano `pg_configuration` da `test_postgres_contract.py` richiedono `ARDESIA_SUPABASE_ENV_FILE`: restano SKIP senza Supabase locale. Il bootstrap nativo imita tabelle auth/storage per test SQL: **non è** verifica del servizio Auth, HTTP, Storage o Supabase reale. Non convertire SKIP/NOT_RUN in PASS.

## Questioni residue

- P0 rilascio: firma scientifica/editoriale/voce, decisione sui quattro DRAFT e autorizzazione del target restano umane e separate.
- P0 privacy nello scope supportato: correzione proposta con prove verdi; l'esito finale dipende dalla review non autrice e dal gate completo sul commit del root.
- P1 disponibilità: FSA live capture dichiarata indisponibile; nessuna promessa cross-folder. Auth/RLS/Storage/inviti/media remoti/restore non certificati da queste prove.
- P2 UX: un intento accodato raggiunto da OFF viene cancellato conservativamente, con messaggio visibile e richiesta di premere nuovamente Registra. L'ordine tra due gesti in realm differenti non viene inferito dal solo hash idempotente. La conferma nuova richiede un gesto; nessuna cattura automatica.
- La correttezza delle soluzioni e delle alternative della banca richiede la revisione umana esatta; questi test verificano il gate, non tale giudizio. Nessun dato docente grezzo, PII, token o handle FSA è copiato in questo report.
