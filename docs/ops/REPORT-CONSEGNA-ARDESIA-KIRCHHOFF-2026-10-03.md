# Ardesia + Kirchhoff — report di consegna

**3 ottobre 2026 · checkpoint software utilizzabile · TARGET_INCOMPLETE**

Il mandato completo non è concluso. Questa consegna chiude una lezione utilizzabile,
la collaborazione locale e percorsi portabili DC, AC e Laplace. La matrice delle
21 famiglie contiene **15 PARTIAL e 6 NOT_SUPPORTED; nessuna famiglia è dichiarata
completamente supportata**. Tre righe diventano parziali per la nuova risposta in s;
non è stata implementata l'antitrasformata nel tempo.

## 1. Consegna e confini

- [Ardesia PR #259](https://github.com/AndreaMarro/ardesia/pull/259), branch
  `codex/circuitcheck-vertical-20261002`, sopra `muse/postlesson-export-integrity-20260922`.
- [Kirchhoff PR #17](https://github.com/AndreaMarro/kirchhoff/pull/17), branch
  `codex/kirchhoff-takeover-20261002`, sopra `release/proof-workbench-beta-0.3-rc1`.
- Sono PR esistenti e dipendenti dalle rispettive basi. Il lavoro è pubblicato
  per revisione, senza merge. Non è una nuova release di produzione.
- Il repository Kirchhoff risulta pubblico al controllo GitHub; Ardesia privato.
  Materiale didattico privato, immagini originali degli esercizi, credenziali,
  stanze locali e link con token restano fuori dai repository.
- Nessun deploy manuale, chiamata a provider fotografico o acquisto di servizi.
  Eventuali check/preview automatici collegati alle PR sono distinti dal collaudo locale.

## 2. Avvio

Ambienti richiesti: Python 3.12 con dipendenze del lockfile Kirchhoff, Node compatibile
con i manifest (PDF.js richiede almeno 22.13 o 24), dipendenze npm già installate.
Per preparare un clone usare i lockfile: `uv sync --frozen --extra dev --extra mcp`
nel checkout Kirchhoff, `npm ci` in `kirchhoff/web` e `ardesia/apps/studio`.

```sh
# Nel checkout Kirchhoff
npm --prefix web run build

# Nel checkout Ardesia, con il percorso reale del checkout affiancato
KIRCHHOFF_DIR=/percorso/kirchhoff bash bin/dev-laboratory.sh --check
KIRCHHOFF_DIR=/percorso/kirchhoff bash bin/dev-laboratory.sh
```

Studio: http://127.0.0.1:5199. CircuitCheck: http://127.0.0.1:43921.
Room-sync: http://127.0.0.1:4318. Il terminale deve restare aperto; Ctrl+C
ferma i tre processi avviati. Il launcher non installa nulla. Se sono già in
esecuzione, fermare quella copia prima di avviarne un'altra sulle stesse porte.

Gli archivi delle stanze sono in `~/.local/share/ardesia/room-sync`, modificabile
con `ROOM_SYNC_DATA_DIR`. Browser/cartella scelta e servizio stanza hanno archivi
separati: esportare `.lesson` per conservare una copia portabile. La collaborazione
è stata collaudata su loopback: due browser sulla stessa macchina, non una classe
remota collegata via Internet. Non basta distribuire un link `127.0.0.1` agli studenti.

## 3. Prima lezione completa

1. Aprire Studio, assegnare un nome, importare un PDF con **media** se necessario.
   Ogni pagina arriva in lavagna; i byte originali restano archiviati localmente.
2. Premere **circuiti**. Aggiungere due resistori da 3 Ω e 6 Ω fra `a` e `0`;
   chiedere la resistenza equivalente fra i due nodi. Rivedere i collegamenti,
   confermare e risolvere: risultato **2 Ω**, schema e passaggi sulla lavagna.
3. Avviare la lezione condivisa. Da **Condivisione e appunti** invitare a scrivere
   oppure a osservare; aprire l'invito in un altro profilo browser.
4. Disegnare da entrambi i contesti. L'annullamento riguarda il proprio intervento.
   Un conflitto sullo stesso oggetto viene mostrato; il contributo altrui è preservato.
5. Da **PDF originali**, il docente può condividere esplicitamente il documento
   intero; il partecipante può conservarne una copia verificata. L'invio delle
   sole pagine raster non invia automaticamente l'originale.
6. Esportare da **Materiali → Esporta .lesson**. In un browser vuoto importare
   il bundle, riaprire lavagna, PDF originali, recap stampabile e Continuità.
7. La prova riaperta è storica: un nuovo calcolo serve per dichiararla confrontata
   nella sessione attuale. Una review docente è legata ai byte esatti del recap;
   dopo una modifica il precedente giudizio non vale per la nuova revisione.

La copia esportata da un osservatore conserva scena e materiali ricevuti. Il suo
journal locale è realmente vuoto; il manifest avverte `remote event history was
not transferred`. Non sono inventati eventi, sessioni o cronologia docente.

## 4. Funzionalità consegnate

### Lavagna, materiali e continuità

- Servizio persistente con owner/editor/viewer, inviti revocabili, versioni degli
  oggetti, operazioni idempotenti, conflitti espliciti e undo per autore.
- Ripresa dopo disconnessione, proposta locale recuperabile e appunti personali
  esclusi dalla sincronizzazione. Nessuna trasformazione del token in percorso file.
- Bundle versionati: sessioni originali e inventario/hash nel formato 2; originali
  PDF, pagine e riferimenti nel formato 3; lettura dei formati storici preservata.
- Scritture e cambi di vista attendono scena e journal. Import isolato per lezione,
  controlli sui percorsi e rollback delle scritture fallite.
- Continuità collega eventi CircuitCheck alla prova soltanto quando hash, lezione,
  sessione, build e scena coincidono. Non deduce apprendimento da segni arbitrari.
- PDF originali: consenso per documento, verifica byte/hash, quote 20 MiB per file,
  100 MiB e 32 documenti per stanza. Revoca e ritiro bloccano gli accessi futuri;
  le copie già conservate dal partecipante rimangono sul suo dispositivo.
- Grafico di funzione locale inseribile, modificabile e riapribile nel bundle,
  con export SVG. Resta distinto da un generatore di Bode o da un CAS completo.
- Registro dei tool riusato per CircuitCheck, grafico e simulazione. Catalogo
  operativo con attivazione/disattivazione, installazione e ciclo di vita completo
  dei plugin ancora da completare; nessuna installazione remota simulata.

### CircuitCheck e Kirchhoff

- Editor di componenti/morsetti come ingresso principale; netlist esperta facoltativa.
  Foto, PDF, pagina e ritaglio mantengono fonte e revisione per il confronto esplicito.
- Schemi con fili connessi, nodi, componenti, polarità e riferimento della domanda.
  Il focus collega il passaggio al componente originale.
- AST matematico condiviso: frazioni, algebra e formule in UI, MCP App, recap e PDF.
  I testi non vengono interpretati come codice e non sostituiscono l'algebra controllata.
- DC: metodi già presenti preservati, domande di porta resistiva, StudentTrace
  strutturato con KCL/KVL e orientamento delle tensioni/correnti.
- AC: RLC e sorgenti V/I a una frequenza esatta; fasi multiple di 30°; convenzione
  `exp(+jωt)` e RMS/picco/non specificato espliciti. Confronto MNA/tableau per tutti
  i rami, leggi costitutive, KCL/KVL/Tellegen e algebra dei passaggi.
- Potenza AC: S, P e Q per componente, convenzione passiva, fattore 1/2 solo
  quando le ampiezze sono di picco, prodotto rettangolare indipendente e bilancio.
- Impedenza AC di porta: sorgenti azzerate, sonda orientata da 1 A e rapporto V/I;
  controlli indipendenti e percorso fino a PDF/quaderno/bundle. Sono richieste
  soluzioni univoche del circuito originale aperto e della rete di prova.
- Laplace: funzioni razionali esatte, RLC, sorgenti gradino o impulso, tensione
  iniziale di ogni C e corrente iniziale di ogni L obbligatorie, anche se nulle.
  Le IC sono a 0−; l'impulso richiede area V·s/A·s. Le risposte sono V(s)/I(s),
  con unità V·s/A·s, e mantengono eventuali termini impulsivi.
- Il checker Laplace rigioca l'algebra con un'implementazione polinomiale indipendente.
  L'adapter Ardesia lega sorgenti/IC al circuito e verifica esattamente AST e trasformata
  con limiti espliciti di profondità, grado, dimensione numerica e costo.
- Identità runtime fissata ai file realmente caricati: una modifica Python durante
  l'esecuzione blocca le nuove risposte con `runtime_changed` fino al riavvio.
- PDF e quaderno portabile conservano risultato, convenzioni e fonte. SPICE e
  CircuitikZ rimangono limitati al sottoinsieme DC dichiarato.

### MCP e integrazioni bidirezionali

- Server MCP Kirchhoff stdio con servizio canonico condiviso, capacità dichiarate
  e MCP App autonoma inclusa in wheel/sdist. Build con controlli d'integrità su
  sorgenti, template, lockfile e risorsa: niente dipendenza dal checkout a runtime.
- SDK MCP Apps reale esercitato in un host locale di prova, anche su viewport mobile.
  Non costituisce accettazione in Claude Desktop o in un altro host esterno.
- Server MCP Ardesia stdio sul servizio canonico della stanza: `room_snapshot`,
  `room_apply`, `room_undo`. Lettura predefinita, scritture abilitate esplicitamente
  nella configurazione; grant e revoca restano controllati dal servizio.
- Un processo per stanza, token fuori dagli argomenti dei tool, HTTP loopback,
  niente redirect/proxy o recupero automatico di URL della lavagna.
- Claude Desktop è installato ma il collaudo ha incontrato la schermata di login.
  Nessun accesso o configurazione credenziali è stato simulato. Host esterno: **BLOCKED**.

## 5. Verifiche e prove

| Controllo | Esito e perimetro |
| --- | --- |
| Studio, gate congelato | **2.434 passati, 0 falliti**, incluso typecheck e replay |
| Studio, build | PASS; warning di dimensione chunk conservato |
| Adapter Laplace + compatibilità | 87 regressioni + 3 test payload reali; digest storici invariati |
| Validazione Laplace wire | 57 test esatti, inclusi limiti e numeri oltre 2^53 |
| Room-sync HTTP/store | **17/17 PASS** |
| Room-sync MCP stdio reale | **13/13 PASS** contro server HTTP canonico |
| PDF condiviso a due browser | **1 percorso completo PASS**: consenso, byte identici, bundle, ritiro/revoca |
| Laplace standalone e MCP App locale | **8/8 PASS**, desktop/mobile, RC gradino/impulso, RL libero, PDF/quaderno |
| Laplace in Ardesia | **1/1 PASS**: componenti → evento → bundle → recap/continuità a freddo |
| Kirchhoff web | **136/136 PASS**, typecheck e build standalone/App |
| Kirchhoff Python finale | **2.517/2.517 PASS**, coverage **97,36%**, soglia 95% invariata |
| Domain coverage e confini | **100% domain**, import boundaries PASS |
| AC/porta/potenza, checkpoint precedente | 14 browser Kirchhoff e 5 Ardesia PASS; log storici conservati |
| Grafico e PDF multipagina | Percorsi browser reali PASS al checkpoint precedente |

La prima suite Python finale ha restituito 2.516 successi e un errore: i record
del catalogo conservavano il vecchio `lesson_build`. Il catalogo è stato rigenerato
tramite `serve_student.py --export`; il test specifico è poi passato. Il log del
primo fallimento viene mantenuto, insieme al successivo gate finale.

Il primo rerun PDF condiviso si è fermato in attesa dell'avvio della pagina;
il controllo diagnostico non ha trovato errori runtime e il rerun completo è passato.
Prima di questo, il test aveva trovato l'assenza del journal nella copia viewer:
la correzione archivia onestamente una copia senza cronologia remota.

### Oracoli indipendenti e AutoCircuits

- **AC porta, 71 casi congelati:** 62 risposte confrontate, 6 rifiuti conservativi,
  3 input invalidi. Il runner library mantiene exit 1 per le eccezioni di quei
  tre input; tutti e tre verificati separatamente su HTTP reale con risposta 422.
  Errore massimo scalato 1,44e−15. Non viene nascosto il fallimento grezzo.
- **Laplace kernel, 80 casi congelati:** 70 risolvibili, 3 rifiuti, 7 errori tipizzati;
  420 campioni complessi, 104 identità analitiche esatte, 5 verifiche dei poli,
  3 mutazioni di risposta respinte. Nessuna equivalenza con una prova completa del prodotto.
- **Nuovo checker di cinque reti 2C+2L:** bloccato prima dell'HTTP dal confronto
  byte a byte della rigenerazione di residui floating point. I file congelati
  sono integri; gli attesi non sono stati modificati. Anche il tentativo con
  `PYTHONHASHSEED=0` fallisce. Questa nuova accettazione resta **NON ACQUISITA**.
- **AutoCircuits reale:** recuperato un PDF dal form pubblico, trascritti i valori
  effettivamente restituiti e confrontati con Kirchhoff e un oracolo Fraction:
  1287/355 V e 78/71 A, coerenti con 3,625 V e 1,099 A stampati. Il servizio
  randomizza i valori: i valori inviati non sono stati usati come attesi.
  Un circuito non dimostra parità su tutte le 21 famiglie.

I generatori e gli oracoli già aperti al prodotto sono ormai suite di regressione;
non vengono rietichettati come nuovo holdout. Gli auditor pubblicabili e i relativi
risultati sono in `kirchhoff/docs/takeover/evidence-2026-10-03/`.

### Materiale autorizzato, conservato fuori Git

- Inventario locale e hash delle fonti; esame 2021 Q2: percorso di porta DC e PDF.
- Esercizio 11.17: fonte originale, RMS esplicito, risultato 700/29+j300/29 V,
  14 passaggi, PDF, quaderno e percorso Ardesia con riapertura a freddo.
- Esercizio 11.13: ritaglio della pagina originale, impedenza −j62478/1375 Ω,
  confronto con il −45j arrotondato stampato, 16 passaggi, PDF e quaderno riaperto.
- Esercizio 11.15: due richieste, resistore 128+j0 VA e induttore 0+j576 VA;
  fonte, ritaglio, 13 passaggi, PDF e quaderno riaperto per entrambe.
- Sono trascrizioni manuali esercitate dal test: `human_confirmation=false`,
  `teacher_review_recorded=false`, `automatic_ocr=false`, `physical_pen=false`.
  Il clic del test non viene attribuito a un docente. Nessuna accettazione
  dell'intero corpus e nessun riconoscimento fotografico automatico misurato.

## 6. Tutte le 21 famiglie

`PARTIAL` significa un sottoinsieme implementato, anche solo nel kernel dove
specificato. Non equivale a una famiglia completa o a una prova canonica VERIFIED.

| ID | Famiglia | Stato | Copertura e gap |
| --- | --- | --- | --- |
| ACAT-01 | DC equivalent resistance | PARTIAL | Resistenza DC fra due nodi; sottoprove 0 A/1 A. Lineage originale ancora parziale. |
| ACAT-02 | DC circuit solution | PARTIAL | Lezione R/V/I, tensione o corrente, calcolo e passaggi esatti. |
| ACAT-03 | DC Thevenin/Norton equivalents | PARTIAL | Metodi didattici su topologie riconosciute; kernel di porta più ampio della UI. |
| ACAT-04 | DC modified nodal analysis | PARTIAL | MNA DC; controllate disponibili nel kernel, non nella lezione servita. |
| ACAT-05 | DC two-ports | NOT_SUPPORTED | Manca il percorso completo per doppi bipoli DC. |
| ACAT-06 | AC equivalent impedance | PARTIAL | Impedenza RLC con sonda 1 A, sorgenti spente e algebra; esclusi casi non univoci. |
| ACAT-07 | AC circuit solution | PARTIAL | RLC a una frequenza, sorgenti V/I, fasi multiple di 30°, RMS/picco dichiarati. |
| ACAT-08 | AC Thevenin/Norton equivalents | PARTIAL | Vth/Zth/Norton nel kernel; lezione equivalente AC ancora assente. |
| ACAT-09 | AC power | PARTIAL | Potenza complessa per componente, P/Q, convenzione passiva e bilancio. |
| ACAT-10 | AC multifrequency steady state | NOT_SUPPORTED | Sovrapposizione multifrequenza non servita. |
| ACAT-11 | First-order circuits | PARTIAL | RC/RL con stato iniziale esplicito e risposta in s; manca x(t). |
| ACAT-12 | Transfer functions | NOT_SUPPORTED | Manca una richiesta H(s) e una derivazione dedicata. |
| ACAT-13 | Impulse responses | PARTIAL | Sorgenti impulsive con area esplicita e risposta in s; manca antitrasformata. |
| ACAT-14 | Natural frequencies | PARTIAL | Determinante a s razionale nel kernel; estrazione generale dei modi assente. |
| ACAT-15 | Bode diagrams | NOT_SUPPORTED | Bode non implementato; il grafico generico Ardesia non lo sostituisce. |
| ACAT-16 | State equations | NOT_SUPPORTED | Manca la derivazione servita delle equazioni di stato. |
| ACAT-17 | Transients with no initial conditions | PARTIAL | Stati iniziali esplicitamente nulli e risposta in s; manca x(t). |
| ACAT-18 | Transients with initial conditions obtained from DC analysis | NOT_SUPPORTED | Manca il calcolo automatico dello stato iniziale dal circuito prima della commutazione. |
| ACAT-19 | General transients | PARTIAL | Kernel RLC e trasformate con stati dichiarati; commutazioni e risposta temporale incomplete. |
| ACAT-20 | MNA of LTI circuits | PARTIAL | MNA simbolica razionale, algebra e controlli esatti per il sottoinsieme RLC servito. |
| ACAT-21 | LTI two-ports | PARTIAL | Kernel Y a frequenza singola e conversione Z condizionata; manca percorso LTI generale. |

La matrice macchina contiene anche stadi, superfici, evidenze e limiti:
`kirchhoff/docs/takeover/coverage-2026-10-02.json`, aggiornata al 3 ottobre.

## 7. Limiti, rischi e prossimi passi

1. Completare le famiglie temporali: antitrasformata, commutazioni, IC da analisi
   precedente, funzioni di trasferimento, equazioni di stato, Bode e multifrequenza.
2. Portare nelle lezioni controllate, operazionali e doppi bipoli già presenti
   in alcuni kernel. Servire Thévenin/Norton AC completi e convenzioni trifase.
3. Chiudere la prova canonica della derivazione originale e delle trasformazioni.
   Gli scope `PHASOR_*` e `LAPLACE_ALGEBRA_CROSSCHECKED` restano distinti da VERIFIED;
   `product_verified=false` è preservato su tutte queste lezioni.
4. Rendere riproducibile il nuovo audit Laplace in una versione preregistrata,
   conservando l'originale fallito; estendere l'accettazione a reti servite più ampie.
5. Collaudare un host MCP App esterno autenticato e una classe remota reale con
   distribuzione, identità, backup e autorizzazioni adeguate. Loopback non li prova.
6. Misurare ingresso fotografico/manoscritto e fedeltà delle trascrizioni sul
   materiale autorizzato; registrare una vera review docente delle lezioni.
7. Completare il ciclo di vita dei plugin e le integrazioni istituzionali.

Rischi concreti: complessità delle espressioni e limiti di costo possono causare
rifiuti espliciti; backend simbolico e rendering richiedono ulteriori casi grandi.
La revoca non elimina copie già scaricate. Un browser può perdere la propria
cache: bundle/cartella e backup restano essenziali. I warning di chunk pesanti
non sono stati eliminati. La review automatica di PR draft può essere saltata
ed è separata dalle prove riportate qui.

## 8. Riproduzione, evidenze e continuità operativa

```sh
# Ardesia/apps/studio
NODE_OPTIONS=--no-experimental-webstorage bash eval/gate.sh
npm run build

# Ardesia
node --test services/room-sync/*.test.mjs
/path/kirchhoff/.venv/bin/python -m pytest services/room-sync/test_mcp_server.py -q -o addopts=''

# Kirchhoff
.venv/bin/python -m pytest -q
.venv/bin/python scripts/check_domain_coverage.py
.venv/bin/python scripts/check_boundaries.py
npm --prefix web test -- --run
npm --prefix web run build
```

I test browser live sono versionati nelle directory `e2e` e `web/tests-e2e`;
richiedono esplicitamente i servizi reali e le rispettive variabili di ambiente.
Le registrazioni locali complete sono in `MATJOURNEY/evidence-20261003`, le prove
private in `MATJOURNEY/private-corpus-20261002`. I log finali pubblicabili e i
manifest SHA-256 accompagnano i report nei repository. Gli artefatti privati
rimangono consultabili localmente, non vengono aggiunti per rendere il report completo.

Skill persistente e canon Markdown/Git usati per receipt append-only. Modello reale
registrato `inherited/unknown`, senza attribuzione inventata dei ruoli SOL/TERRA.
Basic Memory: `INDEX_SYNC_DEFERRED`. AgentMemory: `RETIRED_NO_READ_NO_WRITE`.
Nessuna promozione automatica di capability e nessuna riscrittura dei gate congelati.
Il wrapper storico di review Studio punta a un altro checkout; non è stato eseguito
come se revisionasse questo lavoro. Sono conservate le prove indipendenti effettive
e il limite della revisione esterna ancora aperta.

## 9. Pubblicazione e rollback

I commit mantengono il lavoro sulle due branch delle PR già aperte. Nessun push
su main/master, nessun force push, nessun merge. Per ritirare il checkpoint usare
una PR di revert dei commit di consegna, preservando gli archivi utente e i bundle.
Le migrazioni sono additive: non cancellare le stanze o i materiali per annullare
una modifica al codice. Stato CI e commit finali sono registrati nella descrizione
delle PR e nella ricevuta locale di pubblicazione.
