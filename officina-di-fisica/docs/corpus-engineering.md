# Revisione integrale del corpus

Mandato del proprietario del 24 novembre 2026: 4.000 quesiti Ardesia e 606 Cric,
conservando l'unica applicazione e le sue edizioni, gli esami e i progressi.
La base è `5d1dc8dc`; Ardesia è letto dalla SHA risolta di main, mai da una copia
non identificata. Il registro è uno strumento editoriale offline, non un secondo
archivio degli studenti. Non viene letto da `catalog_seed` e non pubblica nulla.

## Contratto e decisioni

Gli ID Cric restano invariati; quelli Ardesia diventano `AR-<id sorgente>`.
Il contenuto canonico JSON e i file sorgente hanno SHA-256 distinti. Ogni voce
contiene provenienza, hash, stato e verifiche: una vecchia prova vale soltanto per
gli stessi byte normalizzati e per la versione del verificatore identificata.
I confronti semantici producono candidati da esaminare, mai cancellazioni automatiche.
Famiglia comune non significa domanda duplicata: ripetizione e trasferimento vanno
decisi sul compito cognitivo, non soltanto sui numeri.

Il comando costruisce una generazione immutabile in lotti di massimo 100 ID e poi
sposta atomicamente il puntatore del checkpoint. Un'interruzione prima del puntatore
lascia leggibile il checkpoint precedente. Una riesecuzione con gli stessi ingressi
produce gli stessi byte. Un hash diverso invalida le prove del contenuto precedente.
Le attività non questionarie sono contabilizzate separatamente per evitare che
lezioni, esempi, esperimenti o esami sfuggano al vincolo senza calcolatrice.

Le revisioni sono pacchetti `astra/1`, accettati dal validatore e dall'importatore
editoriale già esistenti. Gli ID di competenze, prerequisiti, famiglie e recupero
collegano le nuove schede al sequenziamento e al diario esistenti. Nessuna migrazione
dei tentativi e nessuna nuova authority di pubblicazione. Un'importazione di prova
usa esclusivamente un SQLite temporaneo e non promuove le bozze.

Verifica automatica, revisione AI, approvazione umana e pubblicazione hanno stati
distinti. I manifest non contengono risposte. I pacchetti editoriali offline non
vanno aggiunti a `content/` né serviti da una route HTTP. La presenza di un numero
razionale o della dichiarazione `calculatorAllowed=false` non prova fattibilità
manuale; occorrono un percorso esplicito e un controllo per ID.

## Sequenza eseguibile

- [ ] Recupero verificabile, SHA e checksum; identificare separatamente il lotto Pro.
- [x] Test RED/GREEN: identità, idempotenza, invalidazione, checkpoint, parser sicuro.
- [x] Contabilizzare 4.606 quesiti e tutte le altre attività senza pubblicare DRAFT.
- [x] Ricalcolare le prove recuperate e registrare limiti e copertura individuale.
- [ ] Risolvere e riscrivere ogni famiglia con verificatore indipendente, dimensioni,
  ipotesi, distrattori, aritmetica manuale e asset progressivi quando pertinenti.
- [ ] Importare i lotti nel banco autore, verificare isolamento e adattività.
- [ ] Eseguire suite e CI sulla SHA candidata, revisione indipendente e integrazione
  controllata nel branch canonico; mantenere handoff e lista dei mancanti.

Priorità di rischio: non pubblicare il sorgente DRAFT; non cambiare una vecchia
risposta d'esame; non riusare una prova dopo una modifica; non promuovere un lotto
parzialmente valido; non presentare similarità lessicale come deduplicazione semantica.

La Taste Skill 2.5.1 è stata letta dalla copia recuperata in `taste-v251`;
[sito della skill](https://www.tasteskill.dev/). Qui si preservano il lettore e le
figure scientifiche esistenti. Didascalie e lettura progressiva richieste dal mandato
prevalgono sulle regole di marketing della skill. Playwright e axe-core del progetto
restano i verificatori dell'interfaccia; la loro esecuzione non certifica da sola
WCAG 2.2 AA, UDL 3.0 o l'uso reale con persone con DSA/ADHD.

## Checkpoint corrente — 416 quesiti e 45 altre attività

Generazione `ee506766c87603c1be333fb3d4323b65a1346006c0d9b0959614fe8f1eec6f12`:
416quesiti riscritti DRAFT e45/385attività riesaminate; restano4190revisioni
complete e340attività. Sei nuove famiglie021–026 hanno96soluzioni individuali,
verificatori separati dagli autori e288anteprime private terminali exit0. Il totale
è1254casi:1248quesiti e6revisioni di esempi. Le otto attività aggiunte sono
C1-E017..020 eC2-E001..004, con49controlli esatti e sette figure storiche rilette.

I test avversari provano96risposte sbagliate con binding e firme rinnovati soltanto
in memoria: gli oracoli matematici le rifiutano. Le firme congelate rifiutano anche
testi, fonti, asset e forme incomplete. Nessuna prova deriva dalla chiave originaria.
Ricostruzione fresh identica all'incrementale; import idempotenti e991pubblicati/
storico invariati. I due FAIL delle vecchie edizioni E003/E008 restano aperti.

Primo ID successivo `u2-vertical-flight-01` (027); authoring027–030 e031–034 in
worktree isolati non equivale a revisione completata. C1-E021..023 sono ancora da
riesaminare nel file `content/esempi-di-copertura.json`, non nel fileC1.json.
Approvazione umana NOT_RUN e nuove pubblicazioni0. Le sezioni sotto sono snapshot.

## Checkpoint precedente del primo shard U2 — 320 quesiti e 37 altre attività

Completate le ulteriori64schede su medie a tempi uguali, andata/ritorno e primo
arresto: tuttaU1 e tutti i160ID di U2-01 sono ora revisionati in bozza, per320
quesiti complessivi. I quattro nuovi lotti hanno verifica indipendente per ID,
88controprove, import idempotente e192anteprime terminali PASS. Il totale delle
anteprime è966:960dei quesiti e6delle due nuove edizioni degli esempi.

Anche C1-E009–E016 sono stati riesaminati individualmente:8originali validi con
procedure manuali documentate,36controlli e figure verificate; nessuna nuova
edizione necessaria. Le37attività riesaminate comprendono16percorsi/contenitori,
5laboratori e16esempi, due dei quali hanno le candidate corrette v2. Restano
4286quesiti da revisionare integralmente e348altre attività. I due problemi delle
edizioni pubblicate C1-E003/E008 restano espliciti fino al gate editoriale umano.

Checkpoint `fa1bbebaa9e3638a04508c21adcf8bc70d6340e920a5d8a088aece0887c0d8d6`;
le generazioni precedenti rimangono conservate. La prosecuzione parte da
`u2-freefall-speed-01` nello shard U2-02; caduta libera e moto circolare sono
assegnati ad autori distinti, senza contare le candidate in corso come completate.

## Checkpoint precedente U2 iniziale — 256 quesiti e 29 altre attività

La PR355 è integrata in `ba6aec22008f2ac83de4959a6165bac5a8ee0a14`; le run
post-merge Officina45466165934 e corpus45466165896 sono SUCCESS. Il successivo
incremento è sul ramo `feat/cric-u2-first-families`, da integrare dopo la propria CI.

Sono revisionati256quesiti, inclusi96nuovi U2 su moto uniforme, posizione,
velocità media, accelerazione media, velocità finale e partenza da fermo. Autore
e verificatore sono distinti per ciascun ID. Le procedure manuali e le controprove
mantengono distinti componenti con segno, moduli, medie e vincoli fra prove.

Sono riesaminate29altre attività:16precedenti,5laboratori classici e8esempi C1.
Il riesame dei laboratori controlla anche il runtime tramite21configurazioni e131
controlli indipendenti. C2 confronta le letture effettive a quattro cifre
significative:4909/78540 si confronta con1/16 tramite78544 e78540, senza divisione
decimale. Le consegne qualitative non vengono presentate come calcoli numerici.

Due originali non sono certificati senza calcolatrice: C1-E003 conclude con un
angolo decimale da trigonometria inversa; C1-E008 scrive approssimazioni come
uguaglianze esatte e le propaga. Le nuove edizioni v2/base1 sostituiscono quel
procedimento con seno3/5 e coseno4/5 nel primo quadrante, e conπ/5 eπ²/5 nel moto
circolare. La review indipendente approva tecnicamente le candidate DRAFT, mentre
conserva i due FAIL degli originali in `publishedEditionReview`. La pubblicazione
rimane separata: non è dichiarato100%manuale il materiale attualmente pubblicato.

`revisionPackage` estende il medesimo registro delle attività: identità, fonti,
versioni, firme, import e browser sono controllati con gli stessi strumenti.
Ogni nuova edizione conserva i live e i payload storici: nessun dato degli utenti
è stato aperto. La generazione registra esplicitamente le due edizioni pubblicate
problematiche e la coda delle nuove bozze, senza trasformare il loro PASS in un
PASS degli originali. Un test rifiuta proprio tale contraddizione.

Sono passate774anteprime (768dei quesiti e6delle due nuove edizioni) con exit0,
completezza delle formule e figure, decodifica degli asset, controllo degli ospiti,
axe e overflow. Un primo run parallelo era rimasto vivo nel cleanup dopo le
asserzioni ed è stato interrotto con esito1. La correzione chiude esplicitamente
la stdout del server di prova e ne rimuove il riferimento, senza forzare exit0 o
chiudere browser dell'utente. Il successivo run completo termina con16lotti,
quattro worker e zero errori. Corretto anche l'accesso al terzo record, inesistente
nei pacchetti di due esempi. I contratti offline del corpus hanno invalidazione
propria; non invalidano più il lettore, mentre CSS e contratti runtime sì.

Il checkpoint `c0ef6e38483d96d9421d448e7effd2c9eb43ab78291696916f74475d29417e19`
contabilizza4606quesiti e385attività: restano4350revisioni complete e356attività.
HumanApproval rimaneNOT_RUN e zero nuovi contenuti sono pubblicati. La prossima
famiglia da consolidare è `u2-equal-time-average-01`; altri64candidati sono già
scritti e recensiti, ma non contano come completati prima del loro collaudo.

## Checkpoint precedente U1 — 160 quesiti e 16 altre attività

La PR354 è integrata in `f972c972ffdc8d229c2d55dc7cc43b8a335bf5a1` dopo i check
tecnici; la CI corpus post-merge è SUCCESS, mentre il job Officina va riconciliato
con lo stato corrente. La PR353 sui permessi è integrata in `b0642d87` e la sua
CI post-merge è SUCCESS. Le sezioni successive conservano gli incrementi precedenti.

La continuazione completa scientificamente le sei famiglie U1 residue: difference,
perpendicular, scalar-product, vector-product, projection e angle-ratio. Tutti i
160 ID U1 hanno quindi una nuova scheda con soluzione indipendente, ipotesi,
calcolo manuale, distrattori e provenienza; sono nove pacchetti registrati perché
il primo contiene due famiglie. Le bozze restano da approvare umanamente.
Sono passate 480 anteprime a1440/768/320px e tutte le importazioni idempotenti.

Le altre attività ora hanno lotti di verifica nello stesso registro e nello stesso
checkpoint: sei contenitori di corso senza calcoli incorporati e dieci percorsi di
metodo con49 passi. Ogni passo è confrontato con un risultato indipendente; le
cinque inverse sono risolte simbolicamente e le quantità sono controllate con Pint
e frazioni esatte. I contenitori non certificano le attività collegate. Le sedici
edizioni originali restano valide e conservate, senza riscritture inutili.

La generazione contiene le due code di riesame umano: `human-approval-queue.json`
per le nuove schede e `human-activity-review-queue.json` per le attività riesaminate.
ID e hash individuano esattamente ciò che è da approvare; nessuna voce è approvata
automaticamente. Restano4.446 quesiti da revisionare integralmente e369 altre
attività da riesaminare. Pro100 rimane non identificato e199 prove recuperate sono
parziali, indipendenti da questi conteggi. Zero nuove pubblicazioni.

La verifica dell'importatore è estesa anche alle revisioni di ID Cric già esistenti:
il puntatore live deve conservare l'edizione precedente, anziché diventare nullo.
Una controprova crea un'edizione successiva in SQLite temporaneo, la reimporta e
controlla sia il live sia tutti i payload delle versioni storiche. Non è stato
modificato il database di un'installazione reale.

Nel processo indipendente sono stati corretti vettori disegnati con scale diverse
e simboli non definiti nei testi isolati. Le firme sono state rifiutate dopo i
cambiamenti e congelate soltanto dopo nuova lettura. I verificatori e le note per
ogni ID sono persistiti accanto ai rapporti. Primo ID successivo da consolidare:
`u2-uniform-displacement-01`; i candidati U2 ancora in verifica non sono conteggiati
come completati. La review U2 sta correggendo distrattori equivalenti e il testo
di una conversione: non si attende il gate umano per continuare gli altri lotti.

## Ripresa precedente del 24 novembre 2026 — 64 schede e lotti parametrizzati

La PR #352 è integrata in `a599cc8c621ea5c2b8e62834cbe00419b4694b4f`;
i 14 job post-merge sono terminati con successo. Il registro versionato
`editorial/batches/registry.json` identifica i lotti e i loro ID disgiunti.
L'aggregatore scopre i verificatori dal registro, controlla la completezza di ogni
risultato e lega le prove ai byte del pacchetto, alle fonti, agli asset e alla
versione del verificatore. Non dipende dal nome o dalla dimensione del primo lotto.

Le 32 revisioni iniziali sono conservate; `scale-002` aggiunge 16 quesiti sulle
potenze di dieci e `vectors-003` 16 su spostamenti concordi e coordinate.
Sono quindi 64 i quesiti riscritti, 4.542 quelli ancora da revisionare integralmente.
Le 385 attività restano inventariate con riesame `NOT_RUN`. I 199 controlli recuperati
rimangono prove parziali distinte e il lotto Pro di 100 revisioni non è identificato.
L'approvazione scientifica umana resta `NOT_RUN`; nessuna bozza è pubblicata.

La cache riusa soltanto l'aritmetica sorgente quando coincidono fonte, provenienza,
schema ed evaluatore. Famiglia, competenza e giudizi vengono ricostruiti, evitando
che la rimozione di una revisione conservi una vecchia tassonomia. Le prove browser
sono invalidate da cambiamenti al runtime del lettore, al protocollo di prova o
alle dipendenze effettive; sono state rieseguite 192 anteprime su tre larghezze.
Ogni importazione usa SQLite temporaneo, salva il numero registrato di bozze,
non ne duplica alcuna alla ripetizione e conserva identici i 991 materiali pubblicati.

Le controprove hanno rilevato un report di importazione non aggiornato dopo una
modifica al diario degli errori: il gate lo ha rifiutato e l'importazione è stata
rieseguita. Hanno inoltre corretto cache di tassonomia, prove browser non legate
al runtime e accettazione di output scientifici incompleti. Le chiavi concettuali
controllate mediante lettura AI sono dichiarate `AI_CONCEPTUAL`, separatamente dai
risultati verificati tramite oracoli matematici esatti.

Il collaudo dei permessi ha riprodotto un accesso ospite alle figure tramite alias
URL. La correzione è nella PR #353: normalizzazione prima del dispatch e controllo
dell'identità della directory nel fallback statico. Le controprove HTTP verificano
il diniego agli ospiti e la lettura autorizzata sulle medesime varianti. La review
indipendente è tecnica e non costituisce approvazione scientifica umana.

La prosecuzione assegnata è `u1-vector-difference-01`: i successivi 96 ID U1 hanno
ownership disgiunta in due worktree di authoring. I candidati in lavorazione non
sono conteggiati come revisioni verificate. Un unico integratore aggiorna registro,
prove e checkpoint dopo la verifica indipendente.

## Primo checkpoint del 24 novembre 2026 — stato storico della PR #352

Il [puntatore machine-readable](../editorial/corpus/checkpoint.json) identifica
una generazione con checksum, 47 lotti e tutti i 4.606 ID. Le 385 altre attività
sono nell'inventario separato: nessuna è dichiarata senza calcolatrice sulla sola
base di uno screening automatico. `state`, `review` ed `evidence` distinguono i
32 record riscritti, i 199 con prove tecniche recuperate e i record ancora da risolvere.
Le 93 domande d'esame Cric sono contabilizzate con visibilità `protected_exam`.
Zero nuovi record sono pubblicati. La revisione completa resta da eseguire su
4.574 quesiti, oltre al riesame sistematico delle attività non questionarie.

La selezione storica di 199 ID è stata rieseguita dal verificatore nel commit
`5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, senza copiarne l'implementazione o
importare il generatore. I suoi controlli numerici a campione e le chiavi concettuali
AI non completano la catena scientifico-didattica. Non è stata identificata come il
lotto delle 100 revisioni Pro citato nel mandato. I worktree locali del 21 novembre
e i branch remoti sono stati ispezionati; una lettura di `git status` del vecchio
worktree `recupero-q027` è rimasta indisponibile ed è stata interrotta. Il recupero
Q027 e le edizioni C1/C2/C4/C5 già presenti nel branch canonico sono conservati.

Il [lotto units-001](../editorial/batches/units-001.json) contiene 32 schede
complete e due allegati SVG originali con hash. I calcoli usano conteggi indipendenti
di celle, conversioni SI esatte e sistemi di taratura risolti con SymPy. La review
AI indipendente ha controllato risposte, ipotesi, fonti, distrattori e decomposizione
delle uguaglianze sul pacchetto con digest
`8f23c52cf23aa8103781781e833400353a1fd637951911de7b5dadeac7542e17`.
Il verificatore congela contenuto, provenienza e asset: rigenerare le associazioni
non rinnova automaticamente il giudizio. I giudizi umani rimangono `NOT_RUN`.

I test hanno rilevato e corretto: accettazione del lotto vuoto/parziale, riuso di
cache senza checksum, arrotondamento preliminare di decimali, aggiramento del limite
degli esponenti con underscore, mancato legame alle figure e alla provenienza,
distribuzione involontaria dei sorgenti DRAFT. L'anteprima a 320 px ha rilevato
18 formule troppo lunghe: ora ogni uguaglianza è una tappa leggibile. L'ispezione
axe usa un contesto di test con bypass CSP per l'iniezione del verificatore; la
CSP dell'applicazione resta invariata. Il test prova anche che l'ospite riceve 403
sugli allegati della bozza.

L'importatore resta quello canonico, con un adapter offline da massimo 100 ID e
un savepoint per lotto. Nel SQLite temporaneo il primo import crea 32 bozze, il
secondo zero revisioni, e tutti i 991 materiali pubblicati conservano gli stessi
byte. I file `editorial/` e gli strumenti che incorporano i testi delle bozze sono
esclusi dal pacchetto scaricabile. Nessun database degli utenti è stato aperto.

## Riproduzione

Dalla directory `officina-di-fisica/`, con Git che dispone dei due commit sorgente:

```sh
python3 -m venv var/corpus-venv
var/corpus-venv/bin/pip install -r tools/corpus_engineering/requirements.txt
var/corpus-venv/bin/python -m unittest discover -s tests/corpus -v
npm ci
var/corpus-venv/bin/python -m tools.corpus_engineering.batches
var/corpus-venv/bin/python -m tools.corpus_engineering --source-ref 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605 --cric-ref 5d1dc8dc7b601aef959d10d564c75462be74708d --destination var/corpus-reproduction
cmp editorial/corpus/checkpoint.json var/corpus-reproduction/checkpoint.json
node tests/corpus/browser-batches.mjs
python3 tools/package_release.py var/corpus-release.zip --verify
var/corpus-venv/bin/python -m tools.corpus_engineering.release_check var/corpus-release.zip
```

La costruzione della release legge HEAD, quindi il controllo ZIP va ripetuto dopo
il commit. Il workflow `cric-corpus.yml` ripete questi comandi insieme ai gate
preesistenti del prodotto; lo stato GitHub va letto sulla SHA effettiva. Le prove
locali non sostituiscono la CI né dichiarano una pubblicazione.

## Prosecuzione obbligatoria

1. Consolidare i nuovi lotti tramite PR verso `officina-di-fisica`, completare i gate
   e rileggere la CI sulla SHA risultante. Non eseguire deploy o promozioni editoriali.
2. Continuare da `u2-vertical-flight-01` per famiglie, preservando il legame al
   testo letto e il riesame indipendente. U1 e U2-01 sono già revisionati.
3. Applicare lo stesso protocollo ai4.190quesiti ancora aperti e recuperare
   le prove pertinenti prima di riscrivere. I 199 recuperati hanno ancora fasi aperte.
4. Rivedere lezioni, esempi, esperimenti ed esami; gli indicatori di approssimazione
   sono priorità di lettura, non prova automatica di necessità della calcolatrice.
   Preparare nuove edizioni, mai sostituire le risposte di tentativi storici.
5. Completare revisione umana, verifica d'uso con studenti e pubblicazione controllata
   soltanto dopo le rispettive evidenze. Nessun PASS tecnico vale come firma umana.
