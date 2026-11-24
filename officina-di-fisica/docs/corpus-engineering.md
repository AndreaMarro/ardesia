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

## Checkpoint del 24 novembre 2026

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
var/corpus-venv/bin/python -m tools.corpus_engineering.units_verifier --directory editorial/batches --output var/units-review.json
var/corpus-venv/bin/python -m tools.corpus_engineering.integration --output var/units-integration.json
var/corpus-venv/bin/python -m tools.corpus_engineering --source-ref 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605 --cric-ref 5d1dc8dc7b601aef959d10d564c75462be74708d --destination var/corpus-reproduction
cmp editorial/corpus/checkpoint.json var/corpus-reproduction/checkpoint.json
npm ci
node tests/corpus/browser-drafts.mjs
python3 tools/package_release.py var/corpus-release.zip --verify
var/corpus-venv/bin/python -m tools.corpus_engineering.release_check var/corpus-release.zip
```

La costruzione della release legge HEAD, quindi il controllo ZIP va ripetuto dopo
il commit. Il workflow `cric-corpus.yml` ripete questi comandi insieme ai gate
preesistenti del prodotto; lo stato GitHub va letto sulla SHA effettiva. Le prove
locali non sostituiscono la CI né dichiarano una pubblicazione.

## Prosecuzione obbligatoria

1. Consolidare il lotto tramite PR verso `officina-di-fisica`, completare i gate
   e rileggere la CI sulla SHA risultante. Non eseguire deploy o promozioni editoriali.
2. Continuare U1 da `u1-scientific-scale-01` per famiglie, preservando il legame al
   testo letto e il riesame indipendente. Gli altri 128 ID U1 non sono già riscritti.
3. Applicare lo stesso protocollo agli altri 4.446 quesiti fuori da U1 e recuperare
   le prove pertinenti prima di riscrivere. I 199 recuperati hanno ancora fasi aperte.
4. Rivedere lezioni, esempi, esperimenti ed esami; gli indicatori di approssimazione
   sono priorità di lettura, non prova automatica di necessità della calcolatrice.
   Preparare nuove edizioni, mai sostituire le risposte di tentativi storici.
5. Completare revisione umana, verifica d'uso con studenti e pubblicazione controllata
   soltanto dopo le rispettive evidenze. Nessun PASS tecnico vale come firma umana.
