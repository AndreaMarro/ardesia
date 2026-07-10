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

La baseline e' l'unione ordinata dei due file. Un cambio di hash, rimozione o
reinterpretazione richiede approvazione esplicita di Andrea e decision log.

## 1. Outcome

Costruire una prima versione di ARDESIA che Andrea possa usare realmente. Il
risultato deve essere professionale, attraente, innovativo, facile da usare,
rapido su iPad/LIM, locale-first, verificabile e migliorabile senza riscrivere
il core.

La V1 e' la prima matrice obbligatoria: accesso/local mode; creazione lezione;
notebook/canvas con mouse, touch e Pencil; Knowledge Card; import PDF, immagine
e audio; manuale ELAB; costruzione, modifica, solve, diagnosi, undo/redo e
persistence del circuito LED; LessonOS, graph ed ElabTutor grounded;
generazione di appunti, esercizi e quiz; export PDF, Markdown e Lesson Package;
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

Il goal termina solo con `FULL_GOAL_GREEN`, non con una demo LED o una V1
ristretta.

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

## 3. Riuso prima della costruzione

Ordine obbligatorio:

1. cercare nel monorepo e nei worktree attivi;
2. riusare API, componenti, solver, asset e test esistenti;
3. confrontare al massimo tre candidati esterni mirati;
4. preferire `USE` quando un componente mantenuto e con licenza compatibile
   riduce il costo totale build+integrazione+manutenzione; usare `ABSORB` solo
   per una parte piccola e isolabile;
5. registrare URL, versione/SHA, SPDX, file copiati, attribution/NOTICE,
   dipendenze transitive/SBOM, CVE scan, owner aggiornamenti/drift e rollback;
6. nessun import host da internals plugin: il riuso attraversa confini solo
   tramite export pubblici/capability e contract test.

Non copiare UI, brand, opere o composizioni. Riferimenti come Miro, GoodNotes,
Tinkercad, Matisse, Calder e Haring descrivono principi funzionali o astratti,
non un risultato da clonare.

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
- LessonOS usa un event log append-only con ordering, idempotenza, replay,
  snapshot, recovery, export e delete.
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
| Lavagna | penna, forme, selezione, zoom, undo/redo, autosave | notebook avanzato, template | collaborazione realtime | suite creativa estesa |
| Knowledge Card | nota, formula, source, quiz, simulation observation, plugin view attach/detach | conversioni, graph links, audio, plugin state/history | publishing/licensing | marketplace aperto |
| Simulation | scenario LED completo, wire, solve, diagnosi, persistence e matrice parity attiva | strumenti, Arduino, code/serial/plot e piu' esperimenti | matrice Tinkercad completa certificata | nuove discipline hardware |
| Plugin | manifest, capability, lifecycle, audit, storage/eventi, creator template e una composizione plugin-su-plugin | package/install/update/disable/uninstall, creator tecnico+docente e dependency graph | review, signing e publishing | ecosistema pubblico aperto |
| LessonOS | event log locale, snapshot, graph projection verticale | sync staging e conflict policy | multi-tenant production | federation |
| ElabTutor | risposta grounded sullo scenario LED con citazioni | mastery/misconception | provider/cost control estesi | tutor generalista |
| Content | appunti, quiz, Markdown/PDF/JSON package | slide/HTML/transcript | package vendibile | commerce |
| Audio | registrazione/import/export con consenso | transcript e timeline | provider EU | processing avanzato |
| Backend | staging, auth, tenant, RLS, eventi, export | backup/observability | scaling e billing | multi-region |

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
due file congelati, con ID sorgente univoco, citazione/parafrasi, milestone,
prova e stato. Un controllo deve provare copertura 100%, nessuna omissione e
nessun duplicato; il baseline puo' cambiare solo con approvazione Andrea.

### M0 - Visual Rescue

Obiettivo: ARDESIA deve apparire e comportarsi come un prodotto, non un
harness tecnico.

Acceptance:

- la UI e' organizzata per compiti del docente, non per moduli tecnici;
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

- Matisse -> campiture nette e ritmo per categorie e stati;
- Calder -> relazioni spaziali leggere e motion che spiega connessioni;
- Haring -> segno immediato, inclusivo e leggibile da lontano;
- sintesi originale -> grafite morbida, bianco neutro, corallo/blu/giallo/verde
  funzionali, forme compatte e touch-first, senza imitare opere o composizioni.

Il gate non e' una ripulita CSS: deve trasformare comprensione, gerarchia,
azione e piacere d'uso mantenendo una densita' professionale da lezione.

### M1 - Post-it Plugin Foundation

Acceptance:

- una Knowledge Card puo' ospitare, collassare, espandere, duplicare,
  salvare, riaprire, esportare e rimuovere un plugin senza perdere dati;
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

- azione circuito -> comando -> evento plugin -> LessonOS locale;
- projection a graph con provenance;
- query ElabTutor grounded sul fatto osservato;
- artifact appunti/quiz con citazioni;
- export Markdown, PDF e Lesson Package;
- reopen conserva eventi e artefatti.

### M5 - Backend and Security

Acceptance:

- staging canonico legato allo SHA;
- auth/tenant/RLS con test tenant-negative;
- sync offline, retry, idempotenza e conflict policy;
- export/delete GDPR, backup e rollback;
- secret, dependency, CSP, sandbox e supply-chain gate.

### M6 - Plugin Creator and Composition

Acceptance:

- creator flow completo: template, identity, manifest, provided/required
  capability, events, graph contributions, storage, export, permission,
  sandbox preview, test, package, sign, install, update, rollback, uninstall;
- almeno tre composizioni reali: Simulation -> Plot/Export, ElabTutor ->
  Citation/Graph/Simulation Explanation, Knowledge Card -> plugin view;
- capability negotiation, health, failure isolation e migration testate;
- SDK/starter e creator docente producono lo stesso formato di package;
- nessun plugin first-party bypassa il contratto senza ADR e label esplicita.

### M7 - Full Tinkercad Parity

Acceptance:

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

### M8 - Pilot Hardening

Acceptance:

- iPad/Pencil e LIM;
- keyboard/focus/WCAG/reduced motion;
- performance su board realistica;
- CI e deploy preview con provenance SHA;
- Andrea completa il protocollo docente e registra confusioni/recovery;
- GO/NO-GO per pilot assistito.

### M9+ - Full Goal Closure Waves

M8 chiude il primo pilot, non la roadmap completa. Dopo M8, A0 genera milestone
ordinate e finite dalle righe non-GREEN della traceability, privilegiando ogni
volta valore utente, dipendenze e rischio. Le wave continuano finche'
`LATER + DEFERRED + UNKNOWN + RED + BLOCKED = 0`; nessuna voce puo' essere
rimossa dal denominatore per chiudere il goal.

## 8. Prime slice eseguibili

1. Integrare la palette WIP Claude solo dopo commit, test e review; nessuna
   duplicazione nel worktree Codex.
2. Ridisegnare la vista Simulation dedicata: canvas dominante, toolbar docente,
   diagnostica progressiva, nessun gergo harness.
3. Rendere il post-it un host plugin persistente con attach/detach/expand.
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

Numero di commit, test o documenti non e' una metrica di prodotto.

## 12. Stop e claim

- `GREEN_SLICE`: slice visibile/integrata, testata, review e CI verdi.
- `HONEST_RED`: fallimento riprodotto con causa/prossimo esperimento.
- `SECURITY_RED`: secret/RLS/privacy/sandbox blocker.
- `ARCHITECTURE_RED`: due verita' o contratto incompatibile.
- `BLOCKED_EXTERNAL`: accesso/hardware/account umano indispensabile.
- `PILOT_READY`: percorso completo, manca solo validazione esterna.
- `V1_GREEN`: percorso completo sul deploy, sicurezza verde e prova Andrea.
- `FULL_GOAL_GREEN`: ogni requisito del mandato sorgente e' presente in una
  traceability matrix con ID, milestone, prova eseguibile o protocollo umano,
  evidenza sul runtime canonico e stato GREEN. Nessuna voce puo' essere omessa,
  raggruppata come "fondamentale", o restare `LATER`, `DEFERRED`, `UNKNOWN`,
  `RED` o `BLOCKED` senza modifica esplicita del mandato approvata da Andrea.
  Richiede inoltre il golden journey completo
  `shell -> canvas -> card/plugin creator -> simulation -> tutor -> export`,
  senza assistenza tecnica bloccante, su desktop, iPad e LIM.
- `GREEN_CANDIDATE`: branch/PR verde ma non integrata; non conta come
  `GREEN_SLICE`, che richiede merge umano e re-gate sul branch canonico.

Non usare `parity`, `production-ready`, `robusto`, `perfetto` o `finito` senza
una matrice e prova della stessa ampiezza.

## 13. Stato di partenza verificato

- `origin/main@91ec22ed`; PR #170 base palette merged.
- PR #171 open, CI verde, decisione umana merge/reject richiesta.
- PR #172/P38 open, CI verde, prova test-only della persistenza LessonOS locale;
  non e' graph projection e non e' merged.
- Claude b-bis worktree: 6 modified + 2 untracked, live su `5193`; solo
  candidato. Import host da internals plugin, registry exposure, colori raw e
  eccezione >5 file richiedono review architetturale/UX.
- `UI_CURRENT = INCOMPREHENSIBLE/RED`; nessun claim UI verde prima del
  superamento integrale di M0. Plugin piccolo, palette debole e vista dedicata
  espongono gergo da harness.
- Tinkercad parity generale, 88 esperimenti certificati, backend/RLS e tutor
  verticale restano `UNKNOWN` o `RED` finche' non provati.

Prossima sequenza: decisione merge/reject su #171 e #172; review e reshape o
reject del WIP Claude senza duplicazione; poi M0. P38 e' l'ultima slice
invisibile consentita prima di due slice UX visibili, salvo `SECURITY_RED` G0.
