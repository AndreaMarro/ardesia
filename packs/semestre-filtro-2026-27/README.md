# Fisica per il semestre filtro 2026/2027 — banca da 4.000 quesiti

Questo pacchetto contiene la banca completa in JSON, i modelli editoriali che permettono di ricostruirla, il catalogo, la mappa del programma e l’integrazione con Ardesia Study. La distribuzione richiesta è **1.000 base, 1.000 facili, 1.000 medi e 1.000 difficili**. Le domande sono originali e sono pensate per ragionare con simboli, numeri esatti, frazioni, potenze elementari e risultati gestibili senza calcolatrice.

**Stato editoriale: DRAFT.** I controlli automatici e la revisione assistita sono documentati. Una revisione scientifica umana dell’intera banca e una calibrazione della difficoltà su studenti non sono state eseguite: i relativi campi riportano `NOT_RUN`. Questo stato non va sostituito con un’approvazione inesistente.

## Dove si trovano i dati

Il punto d’ingresso per l’applicazione è:

`packages/engine/lessonos/study/content/physics-semestre-2026-bank/manifest.json`

Il manifest elenca tutti i file in `questions/`, con numero di record e SHA-256. Ogni file è un normale array JSON completo, leggibile senza eseguire il generatore. Lo schema dei singoli record è `question.schema.json`, nella stessa cartella. La divisione in file evita un unico documento molto grande e permette di verificare l’integrità di ciascuna porzione.

In questo pacchetto sono disponibili anche:

- `catalog.csv`: indice dei 4.000 quesiti, utilizzabile per filtrare e pianificare i minicorsi.
- `sources/taxonomy-2026.json`: programma, sette unità e riferimenti verificati al 21 ottobre 2026.
- `sources/coverage-*.json`: corrispondenze fra argomenti del programma e quesiti/famiglie.
- `sources/exams-2025-blueprint.json`: analisi degli obiettivi dei 62 quesiti dei due appelli precedenti; non una riproduzione dei fascicoli.
- `sources/source-registry.json`: provenienza, collegamenti e modalità di consultazione delle fonti.
- `authoring/models_*.json`: 250 famiglie fisiche con leggi, grandezze, ipotesi, domini, esempi esatti ed errori tipici.
- `authoring/overrides_*.json`: problemi scritti individualmente per concetti, simmetrie, casi con più soluzioni e approfondimenti storici.
- `reports/delivery-validation.json`: esito della verifica sul corpus realmente consegnato e sul motore della piattaforma.
- `docs/AI-REVIEW-2026-10-21.md`: verifiche e limiti della revisione assistita.

## Esito sul corpus consegnato

Il build completo e la verifica finale risultano superati: **4.000 record validati**, **4.000 proiezioni studente controllate** e **4.000 correzioni con restituzione dello svolgimento**. La mappa risolve **147/147 voci tematiche** e tutti i **62 obiettivi storici**, conservando i casi di adattamento e di copertura combinata. Il rapporto riporta la SHA del manifest verificato.

La banca contiene **2.537 scelte multiple** e **1.463 completamenti**, suddivisi in **27 shard JSON** per un totale di **53.236.609 byte** dei soli quesiti. Le soluzioni contengono **2.116.930 parole** complessive, con un minimo di **213** e un massimo di **1.129** per record (conteggio tramite token di parola Unicode). Sono presenti **3.821 quesiti del nucleo 2026** e **179 approfondimenti con legge fornita**, identificati individualmente. Le 250 famiglie di modelli sono raggruppate in 212 famiglie di legge.

La suite completa dell’integrazione ha dato **2.738 test Python passati e 27 saltati**; la suite web **243 test passati in 32 file**, con TypeScript e build superati. Le ragioni dei test saltati, le prime esecuzioni ambientali corrette e i controlli non eseguibili sono registrati in `docs/INTEGRATION-VALIDATION-2026-10-21.md`. Questi numeri descrivono verifiche tecniche reali e non sostituiscono la revisione scientifica umana.

## Distribuzione e significato dei livelli

| Unità | Macroarea | Totale | Per ciascuno dei quattro livelli |
|---|---|---:|---:|
| U1 | Introduzione ai metodi della fisica | 160 | 40 |
| U2 | Meccanica | 928 | 232 |
| U3 | Meccanica dei fluidi | 800 | 200 |
| U4 | Onde meccaniche | 272 | 68 |
| U5 | Termodinamica | 672 | 168 |
| U6 | Elettricità e magnetismo | 800 | 200 |
| U7 | Fisica delle radiazioni | 368 | 92 |
| **Totale** | | **4.000** | **1.000** |

La distribuzione è una scelta didattica ispirata all’estensione degli argomenti. I CFU non vengono interpretati come quote ministeriali di domande d’esame.

Il livello base riguarda il riconoscimento delle grandezze, delle condizioni e delle relazioni, oltre a brevi applicazioni. Il livello facile richiede una scelta dell’incognita, un confronto o pochi passaggi collegati. Il medio introduce manipolazioni simboliche e variazioni simultanee. Il difficile comprende vincoli combinati, ricostruzioni, tarature, controllo dell’unicità e percorsi composti. Il tempo stimato e il carico algebrico sono descrittori editoriali, non misure sperimentali della prestazione degli studenti.

## Varietà e progressione

La struttura contiene **250 famiglie fisiche, ciascuna articolata in 16 compiti**. Una famiglia può chiedere di calcolare un’uscita, ricostruire un dato, confrontare condizioni, ragionare sui simboli, interpretare un fenomeno o verificare un vincolo. Non si tratta di 4.000 leggi diverse; gli obiettivi del programma ricorrono intenzionalmente in una progressione didattica. Sono condivise alcune strutture di soluzione e alcune abilità, come isolare un’incognita o controllare le unità.

Il generatore impedisce identificativi duplicati, testi identici, testi identici dopo la normalizzazione delle cifre e firme di ragionamento duplicate. Questi controlli non costituiscono una prova esaustiva di assenza di ogni somiglianza semantica. Il campo `familyId` rende esplicita la parentela fra esercizi e `lawFamily` raggruppa anche modelli vicini. Le simulazioni scelgono famiglie di legge diverse per evitare sequenze di esercizi quasi equivalenti; i percorsi di recupero possono invece usare la progressione nella stessa famiglia.

Alcuni compiti generici non sono appropriati per tutte le leggi. I casi di simmetria fra variabili, i problemi esponenziali con più radici e le relazioni che richiederebbero funzioni avanzate sono stati sostituiti con problemi individuali. Il generatore blocca i casi trascendenti non gestiti: non assume che la prima risposta restituita da un risolutore sia l’unica soluzione fisica.

## Contenuto di ogni record

| Campo | Uso |
|---|---|
| `id`, `version`, `schemaVersion`, `bankId` | Identità stabile, versione e appartenenza alla banca |
| `title`, `prompt`, `format`, `options` | Testo completo e cinque alternative oppure completamento numerico |
| `answer` | Risultato esatto, tipo, unità, forma leggibile e alternativa corretta |
| `solution`, `solutionSteps` | Spiegazione estesa in Markdown e passi strutturati per la UI |
| `taxonomy` | Unità, macroarea, microarea e argomento |
| `difficulty` | Livello, rango, motivazione, carico concettuale/algebrico e stato della calibrazione |
| `descriptors` | Obiettivo, tipologia di ragionamento, rappresentazione, prerequisiti, errori tipici, tempo, ambito, simboli, ipotesi e minicorsi |
| `familyId`, `lawFamily` | Progressione didattica e selezione di famiglie diverse |
| `semanticDescriptor`, `semanticSignature` | Descrizione strutturata del compito e firma per la verifica dei duplicati |
| `provenance` | Fonti, autore editoriale del modello, assistenza AI e origine non copiata |
| `verification`, `status`, `reviewer` | Controlli eseguiti e stato effettivo della revisione |

Le soluzioni spiegano il fenomeno, definiscono i simboli e le ipotesi, motivano la relazione, mostrano trasformazioni e calcoli, interpretano il risultato e discutono gli errori pertinenti. Le unità e i segni fanno parte della soluzione. I valori esatti evitano arrotondamenti arbitrari: π, radici semplici e logaritmi elementari possono rimanere simbolici quando il testo lo prevede.

Il completamento accetta numeri esatti, frazioni, virgola decimale e notazione scientifica entro limiti dichiarati. Le risposte simboliche usano la scelta multipla, così la piattaforma non deve interpretare algebra inserita dallo studente. Le opzioni numeriche vengono controllate anche per equivalenza algebrica, evitando due alternative uguali scritte in modi diversi.

## Programma corrente e due prove precedenti

La banca distingue due profili:

| Profilo | Scelta multipla | Completamento | Durata |
|---|---:|---:|---:|
| `semestre-2026`, anno 2026/27 | 21 | 10 | 50 minuti |
| `semestre-2025-historical`, anno 2025/26 | 15 | 16 | 45 minuti |

Il profilo corrente usa le disposizioni riportate nella [guida ufficiale Sapienza 2026/27](https://www.uniroma1.it/it/pagina/semestre-aperto-2026-2027-guida-alla-frequenza-dei-corsi). Il testo del programma è stato verificato nella [pagina ufficiale dell’insegnamento UniBo 2026/27](https://www.unibo.it/it/studiare/insegnamenti-competenze-trasversali-moocs/insegnamenti/insegnamento/2026/568106). Il PDF ministeriale è identificato nel registro, ma il suo accesso diretto ha restituito HTTP 403: il registro dichiara il ricorso alla fonte universitaria primaria, senza fingere di aver letto quel download.

I due fascicoli del 2025 sono stati consultati su un sito che li ripubblica; il registro indica che non si tratta di un archivio ministeriale né di una chiave ufficiale delle risposte. Sono usati per identificare obiettivi e difficoltà, non per copiare i testi. Le simulazioni contengono quesiti originali della banca.

L’ambito `syllabus_core` identifica il programma corrente. L’ambito `provided_law_extension` identifica approfondimenti con la legge necessaria fornita nel testo. È il caso, per esempio, di alcune applicazioni quantitative di argomenti richiesti soltanto qualitativamente o di obiettivi incontrati nel 2025. Il profilo 2026 estrae soltanto dal nucleo corrente.

## Materiali forniti

Sono stati consultati gli indici e campioni mirati dei quattro PDF disponibili: Valdes, Ragozzino/Velotta, Scannicchio e `FisicaTB.pdf`. Per la scansione a doppia pagina sono stati usati esame visivo e OCR selettivo. Non è dichiarata una lettura integrale di tutte le pagine. Le spiegazioni della banca sono originali e i PDF non sono inclusi nel repository pubblico.

I materiali sono stati sottoposti a confronto critico. Per esempio, il livello di intensità sonora usa `10 log10(I/I₀)`, quindi 60 dB corrispondono a un rapporto di intensità di un milione; `20 log10` è pertinente a un rapporto di ampiezze nelle condizioni appropriate. Sono state inoltre rese esplicite pressione assoluta/relativa, condizioni di validità dei modelli ideali e segni delle variazioni energetiche.

`Testbustes Eseriziario Completo Semestre Filtro.pdf` non era disponibile nella sessione e non è stato utilizzato.

## Integrazione con Ardesia e minicorsi

La banca è associata al descrittore delle edizioni del corso di fisica mediante `questionBankIds`. Il contenuto immutabile dei CoursePack già esistenti e i relativi SHA sono conservati. Il manifest definisce sette percorsi `sf-u1` … `sf-u7` e il percorso trasversale `sf-fisica-simulazioni`; sono percorsi della banca filtrabili tramite `miniCourseId`, non nuovi CoursePack pubblicati automaticamente.

Le route sono sotto `/study/editions/{editionId}/question-banks`. L’API permette di ottenere il catalogo, filtrare per unità/livello/formato/testo/minicorso, leggere un quesito, creare un allenamento da 31 quesiti e verificare una risposta. L’accesso richiede autenticazione e appartenenza all’edizione persistita, verificata per ogni richiesta.

La proiezione destinata allo studente contiene testo e alternative, mentre esclude risposta, soluzione, dati esatti nascosti delle opzioni e verifiche editoriali. Dopo la risposta, il motore restituisce esito, risultato corretto e spiegazione completa. Il parser numerico non esegue codice e non usa `eval`. Il runtime legge JSON statici: non chiama un LLM e non richiede SymPy.

La UI in Aula carica la banca su richiesta, presenta filtri e paginazione, permette l’allenamento secondo il profilo corrente e visualizza tutti i passi della soluzione. Questi tentativi sono esercitazioni **non persistite nel diario**; la UI e l’API lo dichiarano. L’integrazione non li presenta come esami ufficiali o valutazioni approvate da un tutor.

Il caricamento verifica conteggi, identità e hash degli shard. Una cache di contenuto immutabile evita di decodificare tutti i JSON a ogni richiesta e viene invalidata quando cambiano manifest o shard. Le risposte pubbliche sono copie separate e non possono modificare lo snapshot condiviso.

## Ricostruzione e verifica

Dalla root del repository, con Python e le dipendenze editoriali installate in un ambiente separato:

```bash
python -m pip install -r packs/semestre-filtro-2026-27/authoring/requirements.txt
python packs/semestre-filtro-2026-27/authoring/build_bank.py --expected 4000
python packs/semestre-filtro-2026-27/authoring/assemble_pack.py
python packs/semestre-filtro-2026-27/authoring/validate_bank.py
python packs/semestre-filtro-2026-27/authoring/benchmark_runtime.py
```

I JSON dei modelli sono le sorgenti editoriali canoniche del build. Gli script `author_mechanics.py` e `author_concepts_mechanics.py` documentano anche la stesura delle famiglie U1/U2; non è necessario eseguirli per consumare o ricostruire la banca dai modelli già consegnati.

La verifica controlla tutti i record contro lo schema, quote, hash, identificativi, testo, firme, risposte, lunghezza delle spiegazioni, assenza di soluzioni nella proiezione iniziale e restituzione della soluzione corretta dopo il tentativo. Verifica inoltre i due profili di simulazione, la determinazione della selezione a parità di seme, le quantità di ciascun formato e l’esclusione delle estensioni dal profilo corrente. Il rapporto di consegna riporta gli esiti effettivi; i test unitari e HTTP verificano il comportamento dell’integrazione e gli errori di accesso.

La pubblicazione avviene su un ramo dedicato con pull request in bozza, dipendente dal ramo minicorsi già in lavorazione. Non costituisce un merge in `main` né un deploy della piattaforma.
