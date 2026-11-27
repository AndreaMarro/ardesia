# Cric — ripresa operativa

## Stato verificato del 27 novembre 2026

Il branch di lavorazione contiene **4.606/4.606 quesiti revisionati e registrati come bozze**. La riproduzione scientifica sull’intero registro ha restituito 303 lotti positivi e nessun errore. Il registro include 4.000 Ardesia e 606 Cric. Il prossimo ID di quesito è `null`. I 93 quesiti di esame conservano l’accesso protetto nell’app. La prova scientifica è nel commit `f72cfcf016c4e7d9cf28c331fcbccea3b6b22e5a`.

Il candidato più avanzato registra **271 attività su 385** con prove su runtime identificati. Restano **114 attività**, distribuite in 26 C2, 35 C3, 26 C4 e 27 C5. Il prossimo ID è `SIM-C2-L005-01`. Il collaudo su un solo runtime, la PR canonica e la CI sulla SHA integrata restano aperti. [Registro per ID](https://github.com/AndreaMarro/ardesia/blob/d3d1bde8082bb1d7a9e5df43dfc78bd28fa8deb1/officina-di-fisica/editorial/reviews/full-corpus-work-status-20261126.json).

L’idrostatica C2 aggiunge cinque attività come bozze. Stevino ha superato 120 osservazioni e tre anteprime riservate. L’edizione pubblicata rifiuta 15 kPa anche se la consegna assegna g = 10 m/s². La bozza adotta g = 981/100 m/s² e accetta 14,715 kPa. Le altre quattro bozze hanno 192 osservazioni, 64 risposte inviate, 12 anteprime riservate e un secondo passaggio senza nuove registrazioni. Il manometro pubblicato resta alla versione 2, l’autore vede la bozza 3 e l’ospite in quel percorso riceve 403. La pressa distingue l’incremento comune di pressione dalla pressione idrostatica ai diversi livelli. [Stevino](https://github.com/AndreaMarro/ardesia/commit/dcb2ff393d976147fadbf9b1c4ffe03c8a094417) · [Quattro bozze C2](https://github.com/AndreaMarro/ardesia/commit/d3d1bde8082bb1d7a9e5df43dfc78bd28fa8deb1).

Tutti e cinque i job del replay tecnico sul runtime `3ed5bc77…` sono conclusi. L’indice collega i cinque archivi Git verificati per 45.576 interazioni e 139 banchi. La somma dei raster unici nei singoli corsi è 23.225. Il replay contribuisce zero registrazioni scientifiche. [Indice degli archivi](https://github.com/AndreaMarro/ardesia/blob/00cbc9c0ee0a7b1d1d175347cc3ba5a41e647da6/officina-di-fisica/editorial/reviews/visibility139-3ed5-run45945853585-archive-index-20261127.json) · [Run GitHub](https://github.com/AndreaMarro/ardesia/actions/runs/45945853585).

Cinque attività C4 restano aperte nel registro. Le 448 osservazioni più recenti hanno risolto i difetti originali a 8 cm e −3 nC e dato riscontri visivi positivi per i tre indicatori fra piastre. A 3 cm la freccia viola di L02-01 è ancora una linea senza punta distinguibile in 2D. Una correzione successiva ha superato 331 test Node e due contratti. Attende la rilettura indipendente nel browser. In C2 L005-03 resta un rilievo simile in 2D a 8 cm². [Archivio 448](https://github.com/AndreaMarro/ardesia/commit/dc705d5bc1e11254c6bd02fe7839a143ec614438) · [Revisione C4](https://github.com/AndreaMarro/ardesia/commit/a8dffa5fca22d1437df2638c0c1cc89c7092e0a7) · [Correzione C4](https://github.com/AndreaMarro/ardesia/commit/1dbd137840444b5a38ae49f17b00b6591f27f7d0) · [Rilievo C2](https://github.com/AndreaMarro/ardesia/commit/90620e84f8f81416e6be4e985c56679f5a03c943).

Sono in lavorazione ulteriori famiglie. Dodici bozze C3 coprono gas, macchine termiche e trasformazioni. Undici bozze C5 hanno superato la revisione scientifica indipendente dopo due correzioni testuali e attendono la decisione visiva. Quattordici bozze C4 su materia, corrente, circuiti e condensatori sono state importate in SQLite in due lotti. Ogni lotto ha salvato sette bozze al primo passaggio e zero al secondo, con i 991 pubblicati preservati. Le bozze citate in questo paragrafo sono fuori dal conteggio delle 271. [C3 gas](https://github.com/AndreaMarro/ardesia/commit/b9530f9be51234a0e9cce760025741031ab3ccfb) · [C3 trasformazioni](https://github.com/AndreaMarro/ardesia/commit/6ae3c2a177bcde74b2bebf8f22c1fa50850b0413) · [C5 revisione finale](https://github.com/AndreaMarro/ardesia/commit/1eb32d12) · [C4 materia e corrente](https://github.com/AndreaMarro/ardesia/commit/967e45d1f25b11f4e28423527d813fa040fed8d2) · [C4 circuiti e condensatori](https://github.com/AndreaMarro/ardesia/commit/45af4e31194a07e4b9d9967874ecbaceb49cf106).

Il controllo di coesistenza applicato al registro corrente ha importato 4.634 bozze in 320 pacchetti. La ripetizione ha salvato zero edizioni. I 991 record pubblicati, tre tentativi sintetici preesistenti e tre elementi di sessione sono stati preservati. La prova di adattività percorre 4.611 quesiti, inclusi cinque supplementari fuori dal corpus sorgente. Il registro comprende 93 domande d’esame protette nell’app. [Ricevuta dettagliata](https://github.com/AndreaMarro/ardesia/blob/a7a33dfcfc844adc5f766db7d2c91e4f97781cdb/officina-di-fisica/editorial/reviews/current-7c72-coexistence-with-hydrostatic-20261127/result.json).

I paragrafi seguenti documentano gli avanzamenti precedenti.

Tre attività di elettrostatica hanno superato il validatore e aggiunto tre chiusure. Il lotto C4 ha osservato 448 casi in quattro gruppi senza duplicati, con 128 risposte effettive. La lettura indipendente ha identificato cinque rilievi visivi residui. I relativi record restano aperti. Un archivio separato contiene anche i 7.872 casi remoti C4 e i checksum verificati di tutte le 5.000 immagini uniche. [Tre chiusure e riscontri per ID](https://github.com/AndreaMarro/ardesia/commit/8936ab7a798fa4b398d03ee8c655103820657537) · [Quattro gruppi browser](https://github.com/AndreaMarro/ardesia/commit/0848ecd06819453aa5ae988b1d6a839852894508) · [Archivio remoto](https://github.com/AndreaMarro/ardesia/commit/c6bc5b815cfb1817753ad228f741dd4f3b288015).

Il manometro in bozza ha superato 48 casi sul candidato `7c7281…`. La prova HTTP conserva l’edizione pubblicata 2, rende l’edizione 3 disponibile all’autore e restituisce 403 a un visitatore anonimo. Restano i collaudi degli altri quattro ID idrostatici. Sei nuove bozze C3 hanno completato l’importazione idempotente e sono in revisione indipendente. [Canary del manometro](https://github.com/AndreaMarro/ardesia/commit/8ae4fe9d790189f333298024f250532da2f7b9c1) · [Bozze termodinamica](https://github.com/AndreaMarro/ardesia/commit/b9530f9be51234a0e9cce760025741031ab3ccfb).

Il validatore ha chiuso `LAB3D-03` dopo 120 casi effettivi, 64 osservazioni temporali e la lettura indipendente di 184 schermate della famiglia 035. La nota del test mirato con unità errate resta archiviata insieme alla correzione esplicita. Le risposte originali sono **5 kPa e 2 m**. Il secondo passaggio nel validatore ha aggiunto zero chiusure. [Chiusura Stevino](https://github.com/AndreaMarro/ardesia/commit/8141ef50c6648aef188f5d8bf502a4fad5c98d48) · [Verifica indipendente](https://github.com/AndreaMarro/ardesia/commit/76edf024abf52865a91ee2c48eeb6e1aa6a20d5f).

Cinque attività C2 su densità e pressione sono entrate nel registro dopo 224 casi browser, 80 risposte effettive e la ricostruzione distinta dei calcoli manuali. Lo stesso collector ha preservato 225 osservazioni univoche del tentativo C4, che si è arrestato per capacità disco. Quel tentativo ha esito 1 e il lotto resta aperto. La ripresa C4 usa quattro gruppi disgiunti con lo stesso candidato e lo stesso piano complessivo. [Chiusura C2](https://github.com/AndreaMarro/ardesia/commit/568a5db0ce71b45bf1efea40c3ed47ea228d4891) · [Candidato C4 e Stevino](https://github.com/AndreaMarro/ardesia/commit/b9994b9116e87478905191d85cca8037d17ae4bd).

Quattro bozze C2 di idrostatica e cinque di portata sono state importate ciascuna due volte nell’importatore canonico. La ripetizione ha salvato zero edizioni e ha preservato i 991 pubblicati. Il controllo distinto ha verificato otto e dieci compiti rispettivamente. Le anteprime visuali delle nuove bozze restano da eseguire. Il comando di anteprima privata richiede ora l’ID esplicito del lotto e ha superato 36 test di ripresa. Le anteprime complete storiche restano legate al loro strumento e alla loro SHA. [Bozze e revisione idrostatica](https://github.com/AndreaMarro/ardesia/commit/39b82327267ef8576049848aa32965df61efd786) · [Revisione portata](https://github.com/AndreaMarro/ardesia/commit/820f32eb94aeab1c4abbec24264d9ede8847d2c4) · [Comando parametrico](https://github.com/AndreaMarro/ardesia/commit/bf87634c25761b8ddce2c45c05865c7e2c678341).

### Evidenze per revisione e cronologia

Le sezioni originali di **250 bozze in 25 lotti** sono state ripristinate. Il controllo distingue la firma scientifica storica dalla prova del nuovo candidato. I 25 verificatori e i 25 doppi import sono passati. Il lotto `cric-c1-l006` ha superato anche le 30 anteprime e il validatore canonico. Le anteprime dei restanti 240 candidati riallineati sono comprese nella replica completa riportata sotto. Se una bozza anteriore era già stata materializzata in un database esterno, l’importatore conserva quella versione e segnala il conflitto. Il test SQLite ha verificato questa proprietà sui dieci record di `cric-c1-l006`.

La prova di coesistenza `9c0eb3f59945321d4409d47485d9c92714d86775` ha importato 4.628 bozze in 317 pacchetti e ha salvato zero record alla ripetizione. Ha conservato i 991 contenuti pubblicati, tre tentativi sintetici preesistenti e i relativi payload e versioni. I 4.628 record includono cinque esercizi supplementari, separati dai 4.606 sorgente, e 17 revisioni di attività. La prova precede il riallineamento delle sezioni.

Il registro precedente riportava **242/385 altre attività accettate e 143 aperte**. Le quattro simulazioni `SIM-C1-L002-01`–`SIM-C1-L002-04` e l’intero lotto delle fondazioni C1 hanno superato i rispettivi validatori, compresa la chiusura di `SIM-C1-L001-06`. Le prove correnti di forze e lavoro hanno mostrato tre coperture complete di frecce a 320 px, ora riaperte nel registro. Restano quattro attività C1 riaperte e 139 attività C2–C6 da chiudere. Le chiusure richiedono verifica sul runtime effettivamente integrato.

Sul runtime candidato `cb9fc66d96ecced2addff3df4dfbeb0b5834e73a13719a78ea964bc28a5ada49`, i 62 modelli delle edizioni originali C4–C6 sono stati rieseguiti. Quattro originali richiedono correzioni di fattibilità manuale. Le prove delle nuove bozze sono conservate per edizione.

La campagna delle anteprime ha verificato 315 lotti su 316. L’unico lotto con un errore ha presentato uno sforamento di 74 px per `C2-Q013` a 320 px. Il candidato di correzione ha eseguito tutte le 30 anteprime del lotto con esito positivo e sforamento pari a zero. La prova sull'intero registro rimane vincolata alla revisione d'integrazione. [Esecuzione GitHub delle anteprime](https://github.com/AndreaMarro/ardesia/actions/runs/45919159272).

I cinque job della campagna interattiva sono terminati con esito tecnico positivo. Tutti i cinque archivi originali e i relativi hash sono stati verificati e consolidati in Git. La ricevuta riconcilia 45.576 interazioni e 139 ID sorgente. Il collaudo distingue i risultati tecnici dall’accettazione delle singole attività. Restano sotto revisione le prove visive su Pitot, fusione, i banchi `LAB3D-07` e `LAB3D-10` e l’accessibilità della tavola di `LAB3D-04`. [Esecuzione GitHub delle 139 esperienze](https://github.com/AndreaMarro/ardesia/actions/runs/45917299096).

La riproduzione dei lettori sullo stesso runtime ha confermato 189 record già registrati in 33 gruppi. Nessun nuovo ID è contato sulla base di queste riproduzioni. Il prossimo ID esplicitamente riaperto è `SIM-C1-L006-03`.

La replica delle anteprime riservate ha superato **316 lotti e 13.869 casi Playwright** sul commit `728474c72f069e87ab8528549bb31f172ed5608a`. Il controllo comprende i 250 riallineamenti di sezione e la correzione di `C2-Q013`. L’archivio originale, i log, il registro e i marker SHA-256 sono riconciliati. [Esecuzione GitHub](https://github.com/AndreaMarro/ardesia/actions/runs/45929961994) · [Ricevuta e archivio](https://github.com/AndreaMarro/ardesia/blob/e12c9591db3a7e7b385d01b83efb2f04b16684eb/officina-di-fisica/editorial/reviews/full-preview-45929961994-20261127/receipt.json).

Sul medesimo candidato, il collaudo di coesistenza più recente ha verificato 4.628 bozze su 317 pacchetti, 4.628 invariate alla ripetizione, 991 edizioni pubblicate e tre tentativi sintetici preservati. La prova di adattività ha percorso 4.611 record, inclusi cinque esercizi supplementari. [Ricevuta SQLite e adattività](https://github.com/AndreaMarro/ardesia/blob/e3f4f6e09f3dea4246127ebabf47811e0baad6c7/officina-di-fisica/editorial/reviews/cric-composed-coexistence-20261127/receipt.json).

Il successivo replay delle 139 esperienze si è fermato in tutti e cinque i job prima di Playwright. Il checksum del pacchetto 263 era diverso da quello già verificato. La sorgente `0184b146513e024d99ce8391fb0a5f4892f79e7e` ripristina gli input esatti e aggiunge le correzioni visive di piccolo segnale, piano inclinato e volo. Ha passato 305 test Node, due contratti e il preflight C5, che ha ricostruito 14.464 casi previsti e ha verificato i due pacchetti contenenti nove bozze. Il nuovo replay è stato accodato. [Fallimento archiviato](https://github.com/AndreaMarro/ardesia/actions/runs/45932692932) · [Nuovo replay](https://github.com/AndreaMarro/ardesia/actions/runs/45935050054).

I 552 casi eseguiti su un candidato precedente delle famiglie C1 e le 530 immagini uniche sono riproducibili dall’archivio. L’esito tecnico attende il riscontro visivo indipendente. Il primo ID di chiusura resta `SIM-C1-L006-03`.

Il candidato con il registro corrente ha ripetuto il doppio import in SQLite e verificato 4.628 bozze in 317 pacchetti, 4.628 invariate alla ripetizione, 991 edizioni pubblicate e tre tentativi sintetici preservati. Il test di adattività ha percorso 4.611 record. Le anteprime di questa revisione sono terminate. Il log originale di GitHub registra 316 lotti con 13.869 casi e zero errori. Il nuovo ZIP originale e tutti i singoli marker sono verificati e versionati con SHA-256. [Ricevuta](https://github.com/AndreaMarro/ardesia/blob/2a1eccb446a91bfdc34633117a2ab11de29fa2a2/officina-di-fisica/editorial/reviews/canonical-candidate-full-coexistence-20261127/receipt.json) · [Esecuzione delle anteprime](https://github.com/AndreaMarro/ardesia/actions/runs/45935494138).

La revisione indipendente ha conservato cinque esiti positivi sui banchi di campi e ottica. Nella meccanica ha trovato il tratto della freccia di gravità coperto dal tavolo al lancio. Nella vista 2D di C1 restavano punte poco leggibili. In C6 sono state riprodotte due coperture causate dalle etichette della lente e del rivelatore. Le correzioni sono nel candidato di revisione e attendono le verifiche mirate sul browser. Le 143 attività aperte restano da chiudere. [Prova indipendente dei banchi](https://github.com/AndreaMarro/ardesia/commit/68e821d7eea971ab11065cd70ce21eaeacb61c8c) · [Candidato visuale](https://github.com/AndreaMarro/ardesia/commit/ad00ccac9e1d0839c45bd1880cb344b9334f2ae1).

Le sei esperienze C6 hanno superato il validatore canonico sul candidato e sono state registrate come revisioni delle edizioni originali. L’evidenza include 312 interazioni browser, 48 immagini lette individualmente, 96 risposte inviate nell’app, la verifica esatta di 97 impostazioni e 400 osservazioni dell’orologio. La ripetizione ha aggiunto zero record. Quattro controprove hanno respinto sorgente alterata, artefatto diverso, copertura visiva mancante e runtime obsoleto. Il candidato più avanzato conta **248 attività su 385**, con **137 aperte**. Restano quattro C1 riaperte e 133 C2–C5. [Registrazione C6 e prove](https://github.com/AndreaMarro/ardesia/commit/0be84bc345eb5da07798531e203fabf907c049b5) · [Registro per ID del candidato](https://github.com/AndreaMarro/ardesia/blob/0be84bc345eb5da07798531e203fabf907c049b5/officina-di-fisica/editorial/reviews/full-corpus-work-status-20261126.json).

L’ultima ripetizione locale C1 ha completato **552 interazioni**, comprese 96 configurazioni e 192 risposte corrette. L’archivio contiene 530 immagini uniche e i controlli per tutti i 12 ID. La lettura indipendente e la chiusura sul runtime d’integrazione sono in corso. Il primo ID da riprendere è `SIM-C1-L006-03`. [Prova tecnica C1](https://github.com/AndreaMarro/ardesia/blob/6085680883a44f954433d5ee312f24cf0ed03ca0/officina-di-fisica/editorial/reviews/c1-two-families-980-552-20261127/receipt.json).

La nuova prova indipendente del banco del volo ha superato 70 casi e 58 controlli geometrici sul runtime `980518…`. Il campo a metà tra due cariche mostrava una legenda incoerente e una punta poco leggibile nella tavola 2D. Nella pressa idraulica la legenda lasciava ambigua la lunghezza delle frecce. Il candidato `099fe6614bdaf14702da8a472eea1bb743fd1599` corregge entrambe le attività e ha superato 313 test Node e due contratti. Il nuovo collaudo visivo è in corso. [Prova indipendente del volo](https://github.com/AndreaMarro/ardesia/commit/484b89b79fccefe9cd8e05d47d7151abf8348946) · [Correzioni di pressa e campo](https://github.com/AndreaMarro/ardesia/commit/099fe6614bdaf14702da8a472eea1bb743fd1599).

Il job C4 del replay composto ha completato 7.872 interazioni. Lo ZIP originale e i checksum di ogni caso e immagine sono verificati e versionati. Tutti e cinque i job C2–C6 sono terminati con esito tecnico positivo. Restano la verifica degli altri quattro ZIP e la valutazione individuale delle attività sul runtime scelto. [Ricevuta C4](https://github.com/AndreaMarro/ardesia/blob/6085680883a44f954433d5ee312f24cf0ed03ca0/officina-di-fisica/editorial/reviews/visibility139-abb2-run45935050054-20261127/C4/receipt.json) · [Esecuzione GitHub](https://github.com/AndreaMarro/ardesia/actions/runs/45935050054).

La bozza `SIM-C3-L03-02` sulla capacità termica è stata registrata dopo il doppio passaggio nel validatore. L’edizione precedente resta disponibile con il suo esito negativo sulla frase «raddoppia». Il banco ha superato 192 casi, compresi 16 percorsi di apprendimento, e l’anteprima canonica ha superato tre larghezze. La revisione distinta ha letto 16 schermate del banco e due della preview. Nel raster da 320 px è leggibile la prima formula. Le metriche DOM coprono tutte e tre le formule. [Registrazione e prove C3](https://github.com/AndreaMarro/ardesia/commit/797fb93f8fb5d3aba83ee452d6b3dbad8e99e483).

Il successivo registro conferma **248 attività con evidenze registrate e 137 aperte**, comprese cinque riaperture e 132 revisioni residue C2–C5. La nuova attività C3 aggiunge un record, mentre il riscontro indipendente dello zero oscillante ha riaperto `LAB3D-10`. Le sei attività C6 hanno superato due volte il validatore sul nuovo runtime con 312 casi effettivi e 48 schermate rilette. Il report storico è conservato. [Rinnovo verificato C6](https://github.com/AndreaMarro/ardesia/commit/6745dd13acfc1896b8fba141e801a2ce2dc38e31). Il primo ID da completare è `SIM-C1-L006-03`. [Registro corrente e ritiro LAB3D-10](https://github.com/AndreaMarro/ardesia/commit/b569eaa796f462e360eafd1c5997fc0a3c7e87c8).

Sul runtime `209649…` il controllo indipendente ha verificato tutti e cinque i banchi 035 e quattro dei cinque banchi 036. La nuova sorgente mostra lo zero istantaneo con una precisione coerente con l’ampiezza della simulazione. Ha superato 315 test Node e due contratti. La verifica mirata ha superato 98 casi, comprese le letture accessibili e la tavola 2D. Il replay completo di 036 resta in corso. [Prova mirata indipendente](https://github.com/AndreaMarro/ardesia/commit/b4813dab9a6f63fa79874074364c21ac38ed18bc). [Riscontri 035/036](https://github.com/AndreaMarro/ardesia/commit/e52c789d44ec9942a2fb583c8fcf93dbfa452fae) · [Correzione del banco onde](https://github.com/AndreaMarro/ardesia/commit/375faa7a90f5f643840aabb8cc3076f9a2d5f5de).

Le quattro riaperture C1 sono chiuse sul candidato `1b46231ffcedf3a544368d032e10dac01c4e7bb2`. Il validatore ha rinnovato tutti e sei i record della famiglia 048, con 296 interazioni browser, 96 risposte e una rilettura indipendente dei sei procedimenti manuali. Il secondo passaggio ha aggiunto zero chiusure. Il registro più avanzato conta **252 attività su 385, con 133 aperte**. Resta riaperto `LAB3D-10`. Il prossimo originale C2 ancora aperto è `SIM-C2-L001-01`. [Registro del candidato e ricevuta C1](https://github.com/AndreaMarro/ardesia/commit/1b46231ffcedf3a544368d032e10dac01c4e7bb2).

La sorgente della correzione onde ha completato il collaudo tecnico 036 con 148 casi e 56 osservazioni dell’orologio. Tutte le 14 letture del passaggio per l’equilibrio riportano zero. Il report indipendente di famiglia e la chiusura nel registro sono in preparazione. Il replay tecnico delle 139 esperienze è avviato sulla nuova sorgente, con i due pacchetti di esempio verificati prima della richiesta. [Nuovo replay GitHub](https://github.com/AndreaMarro/ardesia/actions/runs/45945853585).

Il candidato precedente registrava **257 attività su 385, con 128 aperte**. Cinque attività di idraulica e galleggiamento hanno superato il validatore sul runtime `3ed5…`. Le prove comprendono 240 casi, 80 risposte, 40 schermate rilette e una verifica indipendente dei procedimenti manuali. Il secondo passaggio ha aggiunto zero. Restano 127 revisioni originali C2–C5 e una riapertura. [Registro corrente](https://github.com/AndreaMarro/ardesia/commit/7b05fd3a9cc3b0463c1b2d32015e41cca56e8b73).

Il validatore ha chiuso `LAB3D-10` con i cinque banchi 036 positivi. Il confronto visivo 035 ha confermato che le etichette della sonda A e della superficie si sovrappongono a profondità zero in due viste 2D. Le schermate delle due revisioni sono identiche e la matematica resta verificata. Il nuovo candidato sposta la sola etichetta della sonda e ha superato 316 test Node e due contratti. Il collaudo mirato ha terminato 16 casi con esito tecnico positivo. La lettura indipendente e il nuovo replay 035 restano aperti. [Chiusura del banco onde](https://github.com/AndreaMarro/ardesia/commit/497584f4392c7cbf95c5501e67ddd6fa7312bfab) · [Registro del rilievo Stevino](https://github.com/AndreaMarro/ardesia/commit/19fc04ea8d3ce2dbdd6d72c53cec2e95d9d0e939) · [Correzione](https://github.com/AndreaMarro/ardesia/commit/3abd7dce2c2d837c903c9e17ac1d7fd0aa08dcca).

Il primo originale C2 ancora aperto è `SIM-C2-L001-01`. I cinque svolgimenti del lotto documentano dieci conti manuali verificati da un revisore distinto, mentre il collaudo visivo sul runtime nuovo è in preparazione. Il lotto C4 da 448 casi ha interrotto l’accettazione dopo tre esaurimenti dello spazio disponibile nel collector. Le tre chiavi duplicate nel report e i dati grezzi restano disponibili. [Verifica manuale C2](https://github.com/AndreaMarro/ardesia/commit/cfd6312aacf96b878ad0ab6ac32077a7193317c4) · [Esito originale C4](https://github.com/AndreaMarro/ardesia/commit/34233eef99a913151be4badf5451a86472043d9a).

Il branch di lavoro GitHub è `feat/cric-experiment-manual-revisions`. Il canone remoto verificato è `officina-di-fisica` a `7c29ccc18ad3b42ceecfca509ef57f786bd2c496`. Il checkpoint compilato da 3.632 quesiti e 246 attività è storico. PR canonica, CI integrata, approvazione umana e pubblicazione nell’app restano aperte. Le 100 revisioni Pro restano non identificate. I 199 controlli tecnici recuperati sono documentati separatamente.

[Stato per la ripresa e ricevute](../../officina-di-fisica/editorial/reviews/handoff-4606-20261127.json).

### Snapshot precedenti

## Stato verificato del 27 novembre — 4.513 quesiti registrati

Il registro conta **4.513/4.606 quesiti DRAFT verificati** e riconcilia tutti gli ID sorgente. Restano **93 quesiti**, tutti nelle tre simulazioni protette C6. Il prossimo ID nell’ordine del registro è `C6-Q013`. Le 385 attività non questionarie comprendono 232 accettazioni registrate e 153 aperte. Il collaudo delle attività sul runtime candidato è in corso.

I 13 quesiti integrativi C6 sono nel commit `2c28547929f407876ff54b15fa9dabfa158b905a`. L’integratore ha ripetuto i 20 test della verifica distinta e importato i record in SQLite temporaneo. L’import ha salvato 13 bozze, poi zero con tutte e 13 invariate. I 991 contenuti pubblicati e lo storico sono rimasti identici. Il controllo delle fonti legge `C6-AQ01` dal file assegnato e preserva sezione, prerequisiti, famiglia, ordine e identificatori. I tre lotti d’esame sono scritti. Le loro verifiche distinte e il collaudo finale restano in corso. I feedback di `C6-Q029` e `C6-Q057` sono stati corretti su segnalazione dei verificatori. Le edizioni precedenti sono archiviate.

Il controllo di coesistenza del registro 4.500 ha importato 4.517 bozze in 312 pacchetti, con zero salvataggi alla ripetizione e 991 pubblicati identici. Ha esercitato i 4.500 record del registro con fixture sintetiche di grading e adattività. La ricevuta è nel commit `be790f93c84c88b5bc6c02a20ed13242ff1f3ee3`. Il controllo documenta un registro e un runtime precedenti ai 13 quesiti integrativi e alla correzione finale del lettore.

Il test del lettore su `34d3de9…` ha passato 358 casi a 320 e 1.280 px. Una verifica distinta ha poi rilevato sei casi che sforavano alle larghezze intermedie. La successiva correzione guidata dalla larghezza disponibile li ha fatti passare in due esecuzioni distinte. Nelle tavole 2D di Lorentz e Snell sono rimaste istruzioni che indicavano viste 3D disabilitate. La sorgente `cf3d8774ea4eb2f5287b7d7b890d9be0bf8bc8bc`, runtime `cb9fc66d96ecced2addff3df4dfbeb0b5834e73a13719a78ea964bc28a5ada49`, usa le istruzioni della vista attiva. Quattro casi 2D e sei del lettore sono passati nella prova d’autore, insieme ai 279 test Node. La verifica tecnica distinta e il replay di tutte le attività proseguono. Le prove precedenti restano fissate ai propri runtime.

La verifica indipendente del protocollo numerico V2 è acquisita nel commit `be790f93c84c88b5bc6c02a20ed13242ff1f3ee3`. Ha confermato l’isolamento a parità di browser e l’esclusione di richieste estranee. L’ultimo piano completo precedente ha validato 45.576 interazioni previste per 139 attività. È in preparazione la stessa campagna sulla sorgente `cf3d8774`. Il preflight da solo non dà credito di revisione.

Il pacchetto con cinque esercizi supplementari è stato provato nell’importatore e nell’anteprima proprietario. Resta fuori dal conteggio 4.606 e attende revisione scientifica distinta. Il registro supporta ora questi pacchetti con hash e revisione indipendente obbligatori. La copertura completa va provata sul registro finale. Un audit separato ha trovato 250 bozze C1–C5 con una sezione diversa dall’originale. Il raggruppamento è usato anche nell’indice e nei PDF. La riconciliazione prima della promozione resta da chiudere. Le edizioni pubblicate storiche sono state conservate.

Il canone remoto rimane `officina-di-fisica` a `7c29ccc18ad3b42ceecfca509ef57f786bd2c496`. Nessuna nuova pubblicazione nell’app o approvazione umana. Il checkpoint compilato 3.632/246 è storico. Le 100 revisioni Pro restano non identificate. I 199 controlli tecnici recuperati sono conservati separatamente. Il mandato rimane incompleto fino al consolidamento del corpus, alla validazione completa delle attività e alla CI sulla SHA canonica.

## Snapshot precedente

## Stato verificato del 27 novembre — mandato incompleto

Il registro contiene **4.500/4.606 quesiti DRAFT verificati**, pari al 97,7% del corpus sorgente. Restano i **106 quesiti C6**. Il primo ID mancante è `C6-AQ01`. Il registro delle attività conta **232/385 accettazioni** e **153 aperte**, con 14 riaperture esplicite. Le 385 attività restano soggette alla rivalidazione sul runtime finale. Il precedente checkpoint compilato 3.632/246 resta uno snapshot storico.

Tutti i 100 quesiti C5 sono stati verificati da un agente distinto dall’autore e riprodotti dall’integratore. I primi 50 sono nel commit `4c735a75efbbf3ebfaa0a0c1113db783689fa8e7` con 17 test e cinque importazioni. Gli ultimi 50 sono in `0df4235db60c288c8014a7ab6ad487bc616182bf` con 19 test e cinque importazioni. Ogni import ha salvato dieci bozze e ne ha lasciate invariate dieci alla ripetizione. I 991 contenuti pubblicati e i payload storici sono risultati identici. Il registro e gli ID mancanti sono stati riconciliati. L’UI sull’intero registro corrente resta da riprodurre.

C6 in lavorazione. Il lotto `cric-c6-integrative` comprende 13 quesiti, inclusa la provenienza separata di `C6-AQ01`, e ha consegna autore `49b0a0c587dd9cc139e8ffff7d895650b4108695`. Il lotto `cric-c6-protected-exam-01` comprende 31 quesiti e ha consegna autore `fbafd79f0aef315af762d0abf7316ff0d78d1d7d`. L’accettazione di entrambi attende verifica distinta e riproduzione nell’integratore. I due lotti di esame rimanenti contano 31 quesiti ciascuno. Il requisito di una terza famiglia per le competenze da `C6-L02` a `C6-L06` resta aperto.

Il protocollo V2 per la parità numerica è pubblicato in `da6c179fc382865e26a33e3fc6d410350c4c2509`. Il confronto usa due contesti con origini distinte nello stesso Chrome. La controprova ha mantenuto la baseline a 3,441458618106277 e ha respinto la variazione del candidato a 3,4414586181062776. Sono passati 11 casi UI mirati con bozza, orologio e controlli ausiliari, quattro test di integrità V2 e quindici test sui report storici V1 e legacy. La review tecnica distinta V2 è in corso. La campagna completa delle 139 attività attende il runtime definitivo. Le prove precedenti e i 744 fallimenti originali restano disponibili.

L’audit lettori sul runtime `748b31de…` ha misurato 358 casi su 179 attività. Tutti i 179 casi a 1.280 px sono passati. A 320 px, 135 casi hanno rilevato scorrimento interno delle formule e 132 hanno segnalato anche un problema di accessibilità da tastiera. I 28 casi delle 14 bozze sono passati. Il manifesto indipendente è nel commit `634096804360f9b4bf37efd295af643a502d1398`, con SHA-256 `23d76bd51d5c7edf60548598efca3fd5f52aa0cd33fa4c837199c4e975ccc4ed`. L’autore ha riprodotto tutti i 213 blocchi formula coinvolti in un test isolato e ottenuto zero fuori misura con interruzioni visive e MathML identico. Il candidato `5bd3d016842e4ebcf4dba965c25b5252bd2cc36c`, runtime `34d3de9ee5f452bf469b007c8e6f9686ebcc103af647bfe1ac4873d975e0cb67`, attende verifica del lettore reale e review distinta. I risultati dello specifico test non conferiscono credito alle attività.

Il branch canonico remoto è `officina-di-fisica` a `7c29ccc18ad3b42ceecfca509ef57f786bd2c496`. La nuova CI finale e la nuova integrazione canonica restano da eseguire. Approvazioni umane e nuove pubblicazioni nell’app sono entrambe zero. I 93 quesiti d’esame restano protetti nell’app. Le 100 revisioni Pro non sono state identificate. I 199 controlli tecnici recuperati conservano il loro stato separato.

Per riprendere, verificare il registro e i manifesti per ID, partire da `C6-AQ01` dopo la verifica distinta, completare la correzione e il collaudo di tutti i lettori sul runtime effettivo, poi eseguire la campagna interattiva e rinnovare il checkpoint. Il passaggio al canone richiede la PR ordinaria e la CI sulla SHA integrata. Il prossimo handoff deve riportare gli esiti effettivi e ogni residuo.

### Snapshot precedenti

## Stato storico — 4.300 quesiti verificati, 306 residui; 232 attività accettate, 153 residue

## Stato verificato del 27 novembre — 4.400 quesiti accettati, 206 residui; mandato incompleto

Il registro esistente contabilizza **4.400/4.606 quesiti accettati come DRAFT**: tutti i 4.000 Ardesia e i 400 Cric C1–C4. Restano **206 quesiti**, prossimo ID Root **C5-Q001**. Questo 95,5% misura solo i quesiti, non il completamento del prodotto. Attività attualmente accettate **232/385**, residue **153**; 14 riaperture esplicite rimangono aperte. Approvazioni umane e nuove pubblicazioni: **0**.

C4 concluso con autori e verificatori distinti. Primo10 `be07f102`; altri40 **70a069dd36feb8147b4b4bc529bfec2ef98c04c4**: 44 test Root PASS in 3,261s, quattro import canonici 10→0/10. Ultimi50 **acf9639a15091cce336687e541a97c7ea685b7bc**: 19 test Root PASS in 20,695s, cinque import 10→0/10. Report fresh/saved identici, tutti991 materiali pubblicati e storico/live heads preservati. I primi10 sono stati ricontrollati senza credito duplicato. Registro, tutti4606 stati per ID e missingQuestionIds206 riconciliati; ricevute `cric-c4-a50/b50-root-registration-20261127`. UI completa sul registro4400 ancora da eseguire.

C5: autori50+50 conclusi e pushati, **nessun credito anticipato**. A finale `0db824ed411a484f9f9cc17e68f64ff1d2319c0c`, handoff SHA `e4f0634cd0cf0e0d616b4781a484ed7b01245fedb8c23a63002cc34b76203d5d`; B finale `7f3f2ae4fb8dbe41e9ee1e780a3289055c16777c`, handoff SHA `4352c0995d39f87510ce68206a526e30ccab1634357622f062f0c9f4a0b452c2`. B avvia peer C5A; A congela prima la primaria C6B62 source-only e poi peer C5B. Le primarie C5B Root e C6A44 B restano congelate; nessuna primaria equivale a revisione completa. Fonte C6 dal sourcePath individuale, senza assumere tutto in C6.json o rendere practice i93 esami.

Correzione layout metodo: source **63131d8367ffbd16cc33b77319a7aedf05de7f1a**, runtime **748b31decc821162f9631e619747cf8d273202b35ebe9ca993e7e0b2a0e2ebc4**, due sole righe CSS su27503; nessun font, contenuto o formula cambiato, nessuno scroll nascosto. Root autore20 sequenze/98passi reali PASS, negativi baseline e min-width-only conservati. Peer Core distinta **0847c3d0947d09e55e792378573be96f666c65fd**, delivery SHA `df799a1594434e4687724b64e4b7108c07b12674d3ede204b1ded38d36c741c2`: riferisce20/98,196feedback,100contesti formula e1944glifi controllati,0overflow. Da acquisire Root; consumer non installato nel Root e nessuna riapertura chiusa automaticamente. Core rinnova le altre240 attività su748; rinnovo distinto dei6vettori su748 ancora richiesto, prove927 non ritaggabili.

Nuovo finding nel protocollo di confronto numerico: **474b00df7f8c39ddf44b3f1f3ef51ad134ed7b51**, delivery SHA `7350b9227529282e2545a03b96000ed6c2b4f9bbd3788c02153511104f7a44ec`, 15 file acquisiti e hash verificati Root. ESM separati nel medesimo window condividono Math: un nextUp di Math.cos fa derivare insieme candidato e baseline e la parità passa. Il test b1 non è pronto per l'intera campagna139. Prossimo intervento: baseline immutabile in un BrowserContext distinto nello stesso browser, nessuna modifica agli intrinseci del candidato, nuova versione esplicita del riferimento, test avversario e peer distinta. La review B positiva di b1 conserva il proprio scope ma non copre il nuovo finding. Nessun nuovo full139 avviato, request attiva immutata, 744FAIL originali e45576 casi conservati; zero credito scientifico da sola parità tecnica.

Core ha inoltre riferito un nuovo cohort lettori C1 su748:66casi,43PASS e23FAIL per scroll orizzontale interno delle formule a320; tutti33wide1280PASS,0pageerror. È un finding di layout da acquisire e valutare Root, non prova automatica di errore matematico o glifo permanentemente invisibile. Nessun ulteriore ritiro inferito dal solo riepilogo; i criteri non sono stati allentati. I numeri232/153 rappresentano il registro attuale e possono cambiare all'esito dell'audit.

Canone remoto ricontrollato: **7c29ccc18ad3b42ceecfca509ef57f786bd2c496**, feature pubblica **acf9639a15091cce336687e541a97c7ea685b7bc** prima di questo aggiornamento. Nessuna nuova PR/merge; CI finale sul corpus e consumer effettivi ancora da eseguire. Runtime Root resta1a3502eb; checkpoint compilato3632/246 storico, non4400/232 né adozione3792stale. GitHub pubblico con materiali editoriali autorizzati; app DRAFT/default-deny/93esami e gate umano invariati. Pro100 NOT_IDENTIFIED;199 controlli recuperati non sono revisioni complete. Nessuna ETA affidabile; nessuna percentuale complessiva inventata.

Priorità di ripresa: (1) peer C5 e contenuti C6 con primarie congelate, prossimo Root C5-Q001; (2) acquisire prove CSS/lettori e rinnovare le attività su748 senza ritag né chiusure automatiche; (3) correggere l'isolamento baseline, peer e poi full139 sulla source reale; (4) ripristinare tutti i gate, replay completo4400→4606, PR ordinaria e CI sulla SHA realmente integrata; (5) documentazione e handoff oggettivo con residui, approvazione umana e pubblicazione separate. Mutex unico, almeno2GiB liberi; nessun processo utente terminato.

### Snapshot precedenti — validi solo per le epoche dichiarate


Mandato **INCOMPLETO**. Registro: tutti i4.000 Ardesia e300 Cric C1–C3 accettati e registrati DRAFT. Prossimo ID Root **C4-Q001**. Otto ulteriori schede `C1/C3/C4/C5-M-formula/-graph` riaperte esplicitamente per overflow a320, provato su entrambe le epoche1a e927:16 casi/SHA PNG verificati Root,2PNG aperti,8 controlli reali default-deny. Ledger ha ora14ID aperti; le sei riaperture vettoriali restano. Non sono nuovi errori nelle formule. Registro e snapshot per tutti4606+385ID riconciliati, missingQuestionIds306 e prossimoID aggiornati. Checkpoint compilato3632/246 resta storico; nessuna adozione3792stale.

Il canone resta7c29ccc18ad3b42ceecfca509ef57f786bd2c496 (PR364 e14/14 postmerge già verificati); runtimeRoot1a invariato, nessuna nuovaPR. Feature pubblica fino82fd8b95 prima di questa riapertura. AutoreCSS Root riusa il checkout già isolato `/private/tmp/cric-vector-apparatus-author-20261126`, nuova branch `feat/cric-method-workshop-fit`, base27503c36: baseline runtime927 e279/279Node PASS1557,559ms, ancora nessuna modificaCSS al momento di questo aggiornamento. Core è reviewer distinto del layout: niente ampieUI927 nuove prima del consumer consolidato. Non nascondere lo scroll o spostare il taglio nelle formule; verificare documento, ogni `.math`, KaTeX, tutti20percorsi/98passi e state/progressi.

Protocollo139: vecchio run45888351023 integralmente archiviato,45576 tentati/44832PASStecnici/744FAILnumerici,0credito scientifico. Nuovo opt-in Root e7aeae2b confronta baselineeb51 e candidato nello stesso browser/ingresso, ESM isolato con80blob immutabili e parser vincolato, zero tolleranza sul modello. B ha trovato realmente il bypass omettendointeraction (REDc65a1d20); Root lo ha riprodotto e corretto in **b1f566b7**, con stati obbligatori derivati dal piano. Tre test indipendenti invariati poiPASS,9legacy+7integrity e nuovo7UI reali0. ReviewB prosegue:11casi draft/clock/aux e5legacy senzahelper effettivamente0 riferiti daB, consegna finale ancora da acquisire. Request attiva ancora immutata; nessun nuovo45kmacro/PASS139 anticipato.

Recovery927 in49496007: **2065 file** esatti (1022autore+57peer+983rinnovo+3manifest), treZIP CRC/SHA verificati, byte source/tests non installati. NuovaSCI distinta sei A7afec3f9:6record/47check/148punti,10test e fresh/saved riferiti ma ancora da acquisire Root; vale solo927, nessun retag su futuroCSS. Core5rinnovo576 in f8fa0d80, non interi gruppi. Layout8: consegna79944834 acquisita e riapertura Root; i negativi FIELDSET(harness) eoverflow(prodotto) sono separati. Tutte prove precedenti conservate, nessuna chiusura automatica.

C4: autoriA/B hanno concluso50+50, peer incrociate in corso. A finale075dfc05, handoff00ae58c4...; B finaleb4369321, handoff140c955c... . B primo10peer5fb5bc57 in consegna,0nuovo credito finché Root non rilegge/rilancia/importa. Non usareA-l02 0b74: finale c45cdc5e. C5B50 primariaRoot e modulo importabile congelati **d664c30a**, recovery/handoff **82fd8b95**, SHA7607029c96e6b7f88e914cf632506c19cbec2f2eba34e916417bd51a7084c857:50criteri,27grandezze,11identità,15Pint,120Hyp reali,0credito. Stimoli065/100 lettiXML, nonraster. B C5A50 già18fd1cd4/0ab44f00; B C6A44 primarie in due parti1c368fcd/4d74eb63,0credito. Fonte peresame/practice da sourcePath individuale, non soloC6.json.

GitHubPUBBLICO autorizzato per tutti i materiali; nell'app DRAFT/default-deny/93esami e gate umano invariati. Human0, nuove pubblicazioni0. Pro100NOT_IDENTIFIED;199controlli non revisioni complete. C6-L02..L06 devono acquisire legittima terza famiglia, senza usare esami o rinominare ripetizioni. Goal nativo conserva la vecchia etichetta blocked per limiteCCA; esecuzione manuale autorizzata continua.

Priorità:1)integrare progressivamenteC4 e proseguireC5/C6;2)CSSmetodo isolato, peer e nuova epoca unica;3)chiudere review tecnica139 e avviare macro sul consumer effettivo;4)rinnovare report/UI, chiudere14withdrawal esplicitamente, replay completo e normalePR+CI sullaSHAreale;5)documentazione e handoff oggettivo con residui/limiti, pubblicazioneumana separata. Mutex unico, almeno2GiB, nessun processo utente terminato. L'unico processo fermato daRoot era il proprio recuperatore incompleto71035: per-blob lazyfetch evitato usando i Git degli autori, evidenze poi recuperate tutte.

### Snapshot precedenti (storici, non stato corrente)

## Stato verificato del 26 novembre: 4.300 quesiti accettati; mandato incompleto

**4.300/4.606 quesiti (93,4%)** accettati e registrati come DRAFT: tutti i 4.000 Ardesia e i 300 Cric C1–C3. Restano **306 quesiti**, prossimo ID Root **C4-Q001**. Altre attività accettate **240/385**, residue **145**, comprese le sei C1 esplicitamente riaperte. Approvazioni umane e nuove pubblicazioni: 0. Canone `7c29ccc18ad3b42ceecfca509ef57f786bd2c496` invariato; nessuna nuova PR. Runtime Root `1a3502eb...` invariato. Il checkpoint compilato 3632/246 è storico e non certifica lo stato corrente.

C3 completato con autore/verificatore distinti: primi dieci `637253a7`, secondi dieci `c5d44b7d` e log esatti `3d231a67`; altri trenta `9526b475` (87 test Root, 1,386 s, i primi venti già accettati non ricontati); ultimi cinquanta `ed387599` (21 test Root, 7,441 s). Otto nuovi import canonici 10→0/10, report fresh/saved identici; 991 pubblicati, live heads e storico preservati. Registry 4300; il replay UI completo sul registro corrente rimane da eseguire. A/B producono ora C4 per ownership disgiunta, primarie source-only già congelate; Q091 conserva la disclosure Root e la primaria distinta A, senza falsa cecità.

UI139: run `45888351023` terminato. Tutti i **45.576 casi** tentati: **44.832 PASS tecnici e 744 FAIL**, C6 3992/3992 tecnici senza credito scientifico. Tutti cinque ZIP originali conservati in parti ≤40 MiB, CRC, casi e PNG verificati; log e metadati GitHub completi. Primo push unico rifiutato dal server Git con errore pack/rename; trasferimento per corso riuscito su `feat/cric-visibility-terminal-archive`, ultimo `27f63c17` (stesso tree di `2a55fda5`), poi feature principale pushata fino a `ed387599`. Nessuna seconda applicazione o pipeline. Originali download duplicati rimossi solo dopo ricostruzione SHA identica dalle parti in commit; nessuna evidenza perduta.

Diagnosi numerica delimitata: nei FAIL C2/C4, 34/38 punti unici legavano y a un x legacy diverso da quello esatto pianificato. Gli altri quattro riprodotti davvero in Chrome locale 158.0.8127.37 sullo stesso runtime4c: tre setup positivi e quattro FAIL rigorosi conservati, valori misurati acquisiti. Il cloud usava .36 e ometteva i valori sui FAIL: non inventare retroattivamente quei dati. Contratto di parità tecnica baseline immutabile/stesso browser/stesso input in preparazione, **non ancora implementato o approvato**, nessun epsilon aggiunto e nessuna autorità scientifica attribuita alla baseline.

Sei vettori: autore Core finale unico `27503c36`, runtime `9279713a...`, 1022 file e test di framing/264 UI d’autore. Peer distinta A in corso: primo replay fallito per spazio <2 GiB, negativo preservato; vero retry264 terminale0, giudizio geometrico/pedagogico finale ancora pendente. Non integrare né chiudere per soli metadati. Core ricusato su tutti sei; rinnova le altre 240 attività (179 letture/cataloghi + 10 worksheet interattivi + 51 dinamiche), prossimo576 su927. Prove vecchie1a/95769 non ritaggabili. C6-L02..L06 mantengono il gap reale della terza famiglia; nessun uso dei93 esami protetti. GitHub pubblico autorizzato, app DRAFT/default-deny e gate umano invariati. Pro100 NOT_IDENTIFIED;199 controlli tecnici non sono revisioni complete. Goal nativo resta blocked storico per limite CCA, mandato manuale autorizzato continua.

Priorità: (1) contenuti C4→C6 con peer distinta e commit per lotto; (2) giudizio finale sei vettori e nuovi audit sull’epoca effettiva; (3) correggere e verificare il contratto numerico139 senza indebolire le verifiche; (4) replay ETL/UI completo, PR ordinaria e CI sulle SHA realmente integrate; (5) handoff e coda umana separata. Mutex unico per Chrome e operazioni locali pesanti, almeno2 GiB liberi; nessun processo utente terminato.

### Snapshot precedenti (storici, non stato corrente)

## Stato verificato del26novembre:4.200 quesiti accettati; mandato incompleto

**4.200/4.606 quesiti (91,2%)** accettati e registrati: tutti i4.000 Ardesia e tutti i200 Cric C1/C2. Restano **406 Cric** nei corsiC3–C6; prossimo ID Root **C3-Q001**. Attività attualmente accettate240/385, residue145. Root ha recuperato251 file, verificato tutti14 casi storici e7 coppie source/DRAFT identiche al95769, e aperto i5 PNG sorgente: confermate e riaperte le cinque ulteriori attività vettoriali. Sono6 gli ID aperti nel ledger, senza contestare punte/coni o le leggi fisiche. Nessun nuovo credito da review parziali, nessuna approvazione umana o pubblicazione. Registry4200; checkpoint ufficiale3632/246 storico. Canone7c29ccc18ad3b42ceecfca509ef57f786bd2c496 invariato, nessuna nuovaPR.

C2 interamente completato: primo10 in361a140f; altri40 in4a76a49b (69 testRoot PASS, inclusa nuova prova title/desc SVG con tutti pin rinnovati, primi10 record scientifici invariati); ultimi50 in830f14f0 (19 testRoot PASS4,141s). Ogni lotto ha import10→0/10 con991 pubblicati, live heads e versioni storiche identici. Tutte le100 righe fresh/saved coincidono; i finding su dominio, feedback e arco sono chiusi con revisioni e negativi preservati. Primo negativo del guard accessibile e cinque vecchi file001 conservati byte per byte; nessun credito doppio.

Collaudo tecnico sul registro4200:282 pacchetti/4217 record DRAFT importati, reimport0/4217, prove adattive/graph/grading su tutti4200 quesiti. Tre vere sessioni private sintetiche con tre tentativi preesistenti (corretto autonomo, corretto con suggerimento, errato autonomo) restano identiche, compresi item/versioni precedenti e991 pubblicati. Exit0 in15,897s, ricevuta registry4200-history-fixture-20261126. Il primo scenario di test usava erroneamente reveal→answer ed è stato correttamente respinto dall’app409; negativo preservato, scenario corretto a hint→answer senza cambiare applicazione. Non è prova di apprendimento reale né approvazione scientifica di attività riaperte. Provenienza corrente:28 commit immutabili/65 blob verificati, nessun fetch necessario.

C3 primarie/modelli reciproci congelati e pushati: B per A030d4658/f7d68ecf; A per B93ea8d3c/92090ea0/b374cab4. I reali negativiPint di setup sono preservati e risolti prima dei positivi, senza nuove tolleranze. B ha iniziato cric-c3-l06/Q051–060 in9515ad86, solo authoring, nessuna review acquisita Root. **C3 usa batchl01..l10 a due cifre**, come l’ownership; C1/C2 usavano l001..l010. Usare discovery e i nomi dichiarati, mai inventare padding o moduli. Preparazione source-only C4A50 già disponibile df933505, non revisioni complete.

Consumer e attività: nuova withdrawal00701 b55199d8 rimane aperta. AutoreCore7173/runtime95769 consegnato; A sta eseguendo peer distinto40 casi, fonte vera esperienze-C1.json,00701 soltanto publishedv1 (non esiste un suo DRAFT140). Core5altri ID: consegna3cb4aa07/973file,576UI tecniche, nessun credito né chiusura di interi gruppi. Root ha riletto il criterio convesso e richiesto addendum per l’inviluppo Float32 delle primitive nominali, non segnalato un nuovo errore visivo: margine minimo0,002761world su8040 certificati. Prova nominale congelata e valida nel suo scope; estensione numerica e recupero973Root ancora pendenti. Core ha inoltre osservato y su5altri vettori e riferisce confronto storico14 identico; attendere consegna congelata e verificare prima di riaprire. Distinguere179 letture/cataloghi,10 worksheet guidate interattive e57 attività parametriche/bench/LAB: non sono189 statiche.

FixtureEcho isolata78978e4c, recuperata8b36ac98:279/279Node PASS0 sul95769, vecchioassertobsoleto corretto mantenendo parete/ritardo/ritorno/340m/s. Test attivo e consumerRoot1a non ancora modificati. UI139 run45888351023/source07a2dbf5 sul4c83 ancora in corso all’ultima lettura,45576 pianificate; nessun PASS globale. Non ritaggare su95769 o epoche successive. I due bootstrapFAIL con0UI e tutte le correzioni restano archiviati.

3792 SUCCESS storico esatto archiviato integralmente be765e05:1133test645,861s,249pacchetti/11427UI,2885CRC e marker standard controfonte5e verificati. NON adottato come corrente per successive modifiche aQ24015/ledger. Pubblicazioni0/umana0; GitHub pubblico autorizzato, appDRAFT/default-deny/93esami invariati. C6-L02..L06 richiedono legittima terza famiglia per consolidamento ritardato, senza usare esami o indebolire il gate. Pro100NOT_IDENTIFIED;199 controlli tecnici non revisioni complete. Goalnativo resta blocked storico per limite trusted-source-turnCCA, esecuzione manuale autorizzata continua.

Priorità:1) C3 authoring/review incrociata e Root fino aC6;2) recuperare storico5vettori e consolidare un solo fix coerente, peer distinta e audit attuali;3) seguire UI139 e conservare ogni esito reale;4) nuovo replayETL/UI completo dopo gate, normalePR/CI SHA+merge effettivi;5) handoff/manifests e coda umana separata. Non rifare i4200 già accettati. Mutex unico, almeno2GiB, unChrome locale, nessun processo utente terminato.

Aggiornamento vettori: nuovo ledger Root validato e cinque controlli reali di default-deny PASS. Gruppi interessati118 (SIM-C1-L001-06),119 (SIM-C1-L002-01..04), oltre048 (00701 già aperto). A ha confermato nel fallback320/1280 i comandi3D disabilitati mentre la legenda richiede Alto;40/40 tecnici e supplemento4/4 non chiudono il finding. Core prepara un unico fix nativo dei6 ID con legenda utilizzabile e invarianti sugli altri175. Prove3cb4 nominali non alterate; addendumFloat32 separato richiesto. Nessuna chiusura o nuova epoca intermedia.

### Snapshot precedenti (storici, non stato corrente)

## Stato verificato del 26 novembre: 4.110 quesiti accettati, mandato incompleto

**4.110/4.606 quesiti (89,2%)** con revisione distinta e collaudo Root: tutti i 4.000 Ardesia e C1 Cric100 e C2-Q001–010. Restano **496 Cric**, prossimo ID Root **C2-Q011**. Registro4110; checkpoint ufficiale ancora3632/246 storico. C2 in authoring/review incrociata, nessun credito anticipato. Nuovo stato per tutti i4.606+385 ID: `officina-di-fisica/editorial/reviews/full-corpus-work-status-20261126.json` (snapshot derivato; autorità nei report individuali e ledger esistente).

Ultimi90 Cric accettati in a89de4a3:460 file recuperati da quattro handoff SHA-verificati,65 test Root reali PASS (12+12+12+12+17), nove import canonici10→0/10;991 pubblicati, live heads e versioni storiche identici. Primo tentativo50B ERROR per modulo importabile omesso dall’handoff: negativo conservato, modulo recuperato byte-esatto da pre-key0a430e35/SHA6216ca8c, nessun test/verificatore/aspettativa cambiato. Primo10 C1 già accettato c3c4660f non ricontato. Registrate ora308 accettate (U702160+U70348+Cric100), nessun ulteriore credito scientifico.

**Attività attualmente accettate245/385; residue140.** Nuova riapertura esplicita `SIM-C1-L007-01` nel ledger, b55199d8: vero replay storico1a Side320α0 e PNG identica al4c83 dimostrano cartiglio y sulle code/porzioni shaft, punte libere.12 osservazioni shaft/6stati sulla candidata; sullo storico è stata riprodotta una sola coppia reale setup/stato. Root ha aperto il PNG e3 test diagnostici PASS. Vecchie chiusure non cancellate. Core ora autore del fix minimo in checkout isolato; serviranno peer distinta e prove attuali, nessuna autochiusura per hash. Preparazione/PR completa trattenuta da questo gate concreto, non dall’approvazione umana.

Q24015 Ardesia ripristinato correttamente0405b690: autoreA00d4ac91, peerB455c2f2c,19+3 testRoot e import16→0/16; solo confini/frasi feedback, chiave800 e matematica invariati. Nuovo pacchetto wavelength240 SHA032f2430 richiede nuova UI: non riusare come corrente il vecchio marker.

Preparazione3792 **SUCCESS storico esatto** run45877605987/source5e27eeee:1133 test645,861s,249 pacchetti/11427UI, ETL/coexistence/releasePASS. Artefatto153505274 byte/SHAce8239b4ba04b48a6648080e4227bdcc87de912c90a0cbc4d3444724d450f026 salvato in4parti, tutti2885CRC verificati, generazione e249marker rivalidati con validatori esistenti contro pacchetti fonte5e. Archivio pubblico be765e05. **Non adottato:** registry/withdrawal/Q24015 sono cambiati dopo quella SHA. Checkpoint3632 non toccato. Prossimo replay completo deve usare il registro effettivo dopo chiusura del finding; nessun gate indebolito.

UI139 remota finalmente avviata: run45888351023/source07a2dbf5, consumer isolato64aef05b/runtime4c83e015,45.576 osservazioni pianificate, quattro corsi osservati in fase browser eC6 in coda all’ultima lettura; nessun PASS globale/credito attività. Due run precedenti hanno fallito prima di aprire UI:45885414909 checkout lazy-fetch e45887711139 path extensions assente. Log negativi preservati; bootstrap corretto con lazyfetch0 soltanto checkout/archivi immutabili, verificatori sempre1. Vero partialclone vuoto128→0→0, tutti tre archivi0 e nuova preparazioneC6/9+7test0. Non ritaggare prove su un consumer successivo.

Canone nuovamente verificato **7c29ccc18ad3b42ceecfca509ef57f786bd2c496**, PR364MERGED e14/14CI postmerge già verificati su quella SHA; nuova PR non ancora aperta. RuntimeRoot/canone1a3502eb invariato. GitHubPUBLIC e tutti i materiali autorizzati; nell’app DRAFT/default-deny/93esami e gate umano invariati. Human0, nuove pubblicazioni0, Pro100NOT_IDENTIFIED,199controlli tecnici non revisioni complete. Il controllo goal nativo resta BLOCKED storico perché il connettore richiede trusted source-turn context CCA; esecuzione manuale autorizzata prosegue, nessuna falsa riattivazione.

Priorità:1) chiudere il finding C1 con autore/verificatore distinti e rinnovare gli audit sul runtime effettivo;2) accettare C2 dagli handoff finali poi C3–C6, senza rifare i4100;3) seguire run45888351023 e archiviare ogni esito reale;4) replay ETL/UI completo e PR ordinaria con CI SHA/merge reali;5) aggiornare handoff e coda umana separata. Mutex locale unico, almeno2GiB liberi; nessun processo utente terminato.

Primo lotto fluidi Cric accettato e registrato361a140f:13 test Root PASS1,008s, fresh/saved identici e import10→0/10,991 pubblicati/live heads/storico preservati. Proposta test Echo isolata78978e4c:186 before185PASS/1FAIL osservato; nuovo contratto marker/legenda preserva tutte le leggi,279/279 Node PASS0/900,647ms sul runtime95769 invariato. Test attivo Root1a e consumer non ancora modificati; fonte/proposta/ricevuta preservate, nessun credito attività.

### Snapshot precedenti (storici, non stato corrente)

## Stato verificato del 26 novembre: tutti i 4.000 Ardesia revisionati

Mandato INCOMPLETO: **4.000/4.606 quesiti** con revisione indipendente e collaudo Root (86,8%); restano i **606 Cric**. Altre attività: **246/385**, residue **139**. Nessuna approvazione umana o nuova pubblicazione nell’app. Registry 3.792, checkpoint ufficiale 3.632/246; 208 revisioni accettate attendono registrazione (U702160 + U70348). Non rifarle e non confondere questi stati.

Gli ultimi48 U703 sono recuperati da f014882a/e17b880c/9cfeb84f/e665d590,121 file con SHA verificati. Root13 test PASS0,675s +16 PASS4,568s,48 report indipendenti fresh/saved identici, tre import canonici16→0/16 con991 pubblicati e tutte le versioni storiche invariati. Ricevuta `u7-03-root-integration-20261126/receipt.json`; riconciliazione `ardesia4000-id-reconciliation.json`: tutti e soli i4.000 ID Ardesia originali, nessun mancante/duplicato/estraneo. Disclosure limitata «beta60» nell’argv: conservata esplicitamente, nessuna dichiarazione di cecità totale; primaria originale e derivazioni antecedenti, modello immutato, verifica finale distinta. Nessun finding residuo sui48.

Il prossimo ID scientifico è **C1-Q001**. Cric606 è assegnato in54 cohort distinti; primarie incrociate prompt-only C1 in congelamento prima dei candidati. Sono542 originali v1 e64 v2: ogni nuova edizione usa la base individuale. I93 esami mantengono i contrassegni e il default-deny nell’app. L’assemblatore condiviso esistente è esteso in23f3ff2b: `source_origin="cric", source_ids=[...]`,1–100 ID originali; versioni, corso/skill/esame protetti e famiglie/difficoltà individuali preservate. Quattro test tecnici PASS1,875s con import reale misto2→0/2 e991/storico invariati, legacy240 byte-identico. Non è una seconda ETL e non dà credito scientifico; review tecnica distinta A ancora PENDING.

Preparazione3792 iniziale45873357486/source42049bf1 FAIL:1060 test634,211s,unico ERROR dovuto al commit storico24cf4060 mancante nel clone. UI249/11427, ETL fresh/incrementale e coesistenza PASS; release SKIPPED, nessuna adozione. Artefatto114361759 byte/SHA8802c46374114b0beb579a493340af41f39e9f429310360fb3320445c71c11c4 integralmente archiviato in3 parti su GitHub. Fix5e27eeee del recuperatore esistente dichiara3 blob storici con fullSHA/path/snapshot/hash; clone Git vuoto reale:fetch3,verify3,repeat0;6 test0,529s +17 target0,6,998s PASS. Primo negativo schedulato partì dopo la patch ed è INVALID come RED; negativo reale eseguito separatamente sul modulo originale archiviato, senza cambiare storia. Retry3792=45877605987/source5e27eeee ora IN_PROGRESS nella suite completa dopo le fasi UI/ETL/coesistenza riuscite. Solo dopo successo e adozione registrare208 accettate e avviare replay4000 (o il totale realmente accettato allora) con i moduli dichiarati. Tenere previewrequest al pin precedente finché il replay finale è adottato, poi sincronizzarlo PRprima, evitando producer duplicati. Nessun gate viene indebolito.

Checkpoint3632 adottato realmente e pubblico2f2e2d51: run45865245464/source4e403a89,239 pacchetti/10947 casi UI,1015 test PASS532,456s e release verificata. Artefatto completo148545732 byte/SHA42d000e748c4240fc294f4247be9954fd1311a77bef91152c1df6bb8937f17e2 in4 parti; generazione c0b84b2576606de5b6edbfb7cab7ea74ed5c6f90656d2c22b93f60db1d6421c8, manifest61ae9fa1b0bec26a70f942871ebb181251392fc05992cbc5250968044e9d4f58. Canone7c29ccc18ad3b42ceecfca509ef57f786bd2c496/PR364,3312quesiti/246attività,14/14 postmerge SUCCESS sullaSHA esatta. RuntimeRoot/canone1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba invariato.

Consumer isolato47984189/runtime0dee1aae03c52966051a7fe41347a1ea937f257127c0b402568677b4c7f779a8, non integrato né approvato. Quattro negativi b2 reali conservati: cartigli rete/campo/Lorentz/eco coprivano punte; per l’eco anche raggioTOP attraverso sfera e percorsi sovrapposti. Correzioni d’autore salvate con prima/raw/contratti; ultima eco7test PASS1,479s. Non retaggare le prove d9/b2/d94 sui runtime successivi. Protocollo UI139 concreto in review distinta: diagnostiche bounded reali, ma completa osservazione139 e approvazione scientifica NON ancora eseguite. Prossimo passo è congelare/integrare il protocollo e avviare i5 corsi su runner separati.

GitHub PUBLIC con tutti i materiali editoriali autorizzati. Nell’app DRAFT/default-deny e gate umano invariati. Pro100 NOT_IDENTIFIED;199 controlli tecnici non sono revisioni complete. Mutex locale e almeno2GiB liberi; nessun processo utente terminato.

Priorità:1) adottare3792 solo dopo successo verificato, poi registro/replay4000;2) produrre e verificare i606 Cric;3) eseguire UI139 sul runtime effettivo e chiudere i difetti senza falsi PASS;4) PR ordinaria e CI sulle SHA effettive;5) preservare manifest, prove e coda umana separata dalla pubblicazione.

## Stato verificato del26novembre:3.952 revisioni; checkpoint3.632 adottato

Mandato INCOMPLETO:3.952/4.606 quesiti con review indipendente e collaudo Root (85,8%); restano654=48Ardesia+606Cric. Registry3792,160U702 accettati ma da registrare dopo adozione3792; checkpoint3632/246. Attività246/385, residue139. Human0 e pubblicazioni nuove0. Gli stati sono distinti; nessuna revisione va rifatta perché attende la registrazione.

U702:318file recuperati esattamente da5a55fce6/6b073e2c/3d5a153b/9a38e5ef, quattro handoff conSHA; Root20testPASS19,721s +17PASS24,092s,160reportfresh/saved identici, dieci import16→0/16 e991pubblicati/versioni storiche identici. Ricevuta u7-02-root-integration-20261126/receipt.json e script riproducibile. La ricevuta pre-key errata5c3af5ea è conservata ma INVALID; il positivo correttoa114caa9 è antecedente alle chiavi e usa equivalenza simbolica esatta, nessuna tolleranza. Tre chiarimenti d’autore riletti dopo finding; nessun altro residuo. ProssimoID AR-u7-lens-magnification-01 (U70348); poi i54cohort Cric606 assegnati con baseVersion individuale e93exam preservati.

Preparazione3632 effettivamente SUCCESS:45865245464/source4e403a89,239pacchetti/10947casi UI,1015test532,456s, ETLfresh/incrementale identici, coesistenza/releasePASS. Artefatto15143421272/148545732byte/SHA42d000e748c4240fc294f4247be9954fd1311a77bef91152c1df6bb8937f17e2 archiviato integralmente in4parti. Adozione2f2e2d51, checkpoint generations/c0b84b2576606de5b6edbfb7cab7ea74ed5c6f90656d2c22b93f60db1d6421c8, manifest61ae9fa1b0bec26a70f942871ebb181251392fc05992cbc5250968044e9d4f58. Il precedente FAIL45859734058 resta storico, non è stato convertito inPASS.

U701160 registrati42049bf1:registrySHA62c195d8b6ab1f4ddbac1af2ada5ad834656943db19c85bb195f8742d0dcdb2c. Nuovo run3792=45873357486/source42049bf1 è IN_PROGRESS, faseETL dopo browser osservata, nessun SUCCESS/release/adottamento ancora. Previewrequest mantenuto temporaneamente al pinprecedente per evitare un secondo producer completo; sincronizzarlo DOPO3792adozione e PRprima, senza toccare gate/protocollo. Dopo adozione3792 attivareU702160→3952 e successiviU703 secondo prova reale.

Canone invariato7c29ccc18ad3b42ceecfca509ef57f786bd2c496, PR364MERGED e14/14postmergeSUCCESS sullaSHAesatta;3312quesiti/246attività. RuntimeRoot1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba invariato. Preparazione feature non sostituisce futuraCI sullaSHAeffettiva dellaPR/merge.

Consumer isolato finale4a6f56bc/d94b19e02f9bbe74c75080dd8df74082bc80bc2ab2fa4c1508be6692b38b58f3, non integrato né approvato. Tre finding b2 reali e immutabili: NodoA copre punta ingresso; E×10 copre punte inTOP;22tip-mask Lorentz in10statiTOP (non22occlusioni uniche/intericone). Autore sposta nomi inlegendeHTML associate e separa rappresentazioneE×10 anche inz. Prove fisiche positive, UI distinta sul nuovo runtime PENDING;139attività non acquisiscono credito. Protocollo/YAML parametrico UI139 in preparazione indipendente, non secondoETL. Non ritaggare prove d9/b2 sui runtime nuovi; originaliFAIL e73/80vecchi test rimangono delimitati all’epoca effettiva.

GitHubPUBLIC con tutti i materiali editoriali autorizzati; appDRAFT/default-deny/93exam e gate umano invariati. Pro100NOT_IDENTIFIED;199prove tecniche non revisioni complete. Mutex locale unico, almeno2GiB, nessun processo utente eliminato.

Priorità:concludere/adottare3792 reale; attivareU702 e proseguire48+606; ottenere nuovaUI139 e chiudere difetti con ruoli distinti; normalePR+CIpostmerge; mantenere manifest/handoff e coda umana separata.

## Stato verificato del26novembre:3.792 revisioni e CIcanonico completa

Mandato INCOMPLETO. Quesiti scientificamente revisionati e accettati da Root3.792/4.606 (82,3%); restano814:208Ardesia e606Cric. Registry3632, con160U701 accettati ma in attesa di registrazione dopo il collaudo/adottamento3632 già in coda. Checkpoint ufficiale3472/246. Non confondere questi tre stati né rifare i160 già verificati. Attività complete246/385; residue139. Human0, pubblicazioni nuove0.

U701:327file recuperati dai4handoff finali cc8048cc/7d5bc325/32b08c5a/42b7e3cb conSHA verificati; Root19testPASS5,945s +17PASS12,607s, tutti160reportfresh/saved identici e10import16→0/16 con991pubblicati/versioni storiche invariati. Ricevuta u7-01-root-integration-20261126/receipt.json; registro temporaneamente invariato3632 per mantenere adottabile la preparazione in corso. Prossimo ID scientifico AR-u7-radioactive-survivors-01. Autori proseguonoU702, poiU703 e54cohortCric606 conversioni individuali64v2/542v1 e93exam preservati.

PR364 MERGED e canone7c29ccc18ad3b42ceecfca509ef57f786bd2c496 nuovamente misurato: CIpostmerge14/14SUCCESS, run45859292127/45859292343 entrambi completatiSUCCESS sullaSHAesatta. Ricevuta pr364-integration-20261126/postmerge-ci.json. Canone3312quesiti/246attività, separato dalle successive revisioni della feature.

Preparazione3632: primo45859734058 FAIL1015test954,151s(1FAIL ASTversione+1ERRORfixturemancante). ProveUI239/10947, ETLfresh/incrementale e coesistenzaPASS; releaseSKIPPED e nessuna adozione. ZIPfallito conservato integralmente suGitHub. Recuperata fixturestorica esatta172a24ec... e fix distinto4852c817 della sola asserzioneAST verso fonte esatta55ff6aaa..., Root7+16test positivi. Retry45865245464/source4e403a89 in coda al preview45859734142; lascia ilregistry3632 finché si può verificare/adottare questo collaudo. Poi registraU701/3792, nuovo replay incrementale e successivaPRordinaria. Non dichiarare retrySUCCESS prima del terminale.

RuntimeRoot/canone1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba invariato. Candidato consumer isolato16dcfbe6/b2abff8e44eab69812c8c2a03c9876fdf49ae3dab2285f323303bcd3c1689e46:11contratti geometry+80generaliPASS, ma nessuna attività completata. Review distinta delle sole guide/formule epocad9d1 salvata5d749ec1 e recuperata inRoot,9testRootPASS1,547s;32UI/64submit/24transizioni reali, invarianti139/2144,17difetti geometrici ancora aperti allora. Non ritaggare d9su b2. Primo canaryb2 di8profili trova nuovoFAILreale NodoA copre punta della freccia entrante a8mL/s inSIM-C2-L005-05; nessunclaiminterocono. Autore correggerà solo testoNodoA/B spostandolo nella legendaHTML con associazione alle biforcazioni, poi nuovo replay distinto. Reviewer continua gli altri16 nel snapshot16dc e preparaUI139. Nessuna modifica runtime integrata né vecchioFAIL cancellato.

Repository PUBLIC con tutti i contenuti editoriali autorizzati; nell’appDRAFT/default-deny e93esami invariati. Pro100NOT_IDENTIFIED;199controlli tecnici non sono revisioni complete. Mutex unico, almeno2GiB, nessun processo utente terminato.

Prossime azioni: concludere retry3632/adottare soltanto prove riuscite; attivare160U701 e replay3792; continuare208Ardesia e606Cric; chiudere NodoA e altri consumer con autore/reviewer distinti e veri testUI; aggiornare checkpoint/coda umana separata dalla pubblicazione.

## Ripresa del 26 novembre 2026: 3.632 revisioni, PR364 integrata

Mandato INCOMPLETO: 3.632/4.606 quesiti revisionati con verifica indipendente e collaudo Root (78,9%); restano 974, di cui 368 Ardesia e 606 Cric. Attività complete 246/385, residue139. Nessuna nuova approvazione umana o pubblicazione nell’app.

U6-05: tutti160 finali accettati, 18 test Root PASS6,017s e16 PASS8,135s, report fresh/saved identici, dieci import canonici16→0/16 con991 pubblicati e versioni storiche invariati. Ricevuta editorial/reviews/u6-05-root-integration-20261126/receipt.json. Recupero da commit immutabili, con raw log aggiunti realmente in2447ad2d; prima mancavano13log nell’albero74dcd219. Due tentativi Root hanno segnalato primaria antecedente assente; recuperata dai commit originali, senza cambiare oracoli, poi ripetuti positivamente tutti i controlli. Negativi conservati.

Checkpoint compilato ufficiale3472/246: generations/246f485b3fd81da8a99f124e033af0481dd270136389e3cf21413ca015c5fbbe, manifest e2cdf877d2d81b6cfb4b9db486f0738cf4b459219d6116c532b1152a3a4e4890. Run45849149030/source68c95531 SUCCESS,229pacchetti/10467casi UI,957test604,148s, ETL fresh/incrementale e coesistenza/release PASS. ZIP completo SHA6208db65c22f07080e5088097e63671c6bb6ceb10e1fcb7cf7e12465192a4606 salvato in quattro parti suGitHub, adozioneaa7577b7. Non equivale a CI sulle modifiche successive. Registry3632, nuovo replay necessario.

PR364 MERGED normalmente il26novembre: headabeb4957, merge7c29ccc18ad3b42ceecfca509ef57f786bd2c496, tutti i check premerge SUCCESS e nessuna conversazione irrisolta. Canone ora3312 quesiti,246 attività; CI postmerge45859292343/45859292127 IN_PROGRESS. Non dichiarare postmerge PASS prima della conclusione. Nessun bypass/force/approvazione umana simulata.

U7-01: ownershipu7-01-v1, fonte SHA609dec0246ff1cd1b89afed2ea7258c0f65ff8e853735ce9196fe24829fc1233 su5cfbdcb0. A240–244/B245–249 con revisori incrociati, primarie congelate8a82a325/b3932757 prima dei candidati. Prossimo ID scientifico AR-u7-wavelength-in-medium-01. Poi U7-02/U7-03 e606Cric, senza fermarsi alla famiglia.

Runtime Root/canone resta1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba. Autoria consumer isolata feat/cric-experiment-consumer-corrections: guide non assegnate ora distinguono osservazione e calcolo, ma review distinta ha trovato sei transizioni temporali con titolo/testo obsoleti. Riprodotto RED Playwright sul consumer vero, fix della triade in collaudo; primo test esteso ha rilevato scrollable-region-focusable nella bozza adiabatica, conservato. Diciassette difetti geometrici ancora aperti. Otto bozze manuali hanno solo source/math/manual/figure review parziale, zero credito attività;139 residue e UI129 NOT_RUN restano espliciti. Ogni cambio runtime richiede nuove prove reali, nessun ritag.

Repository PUBLIC e tutti i materiali editoriali autorizzati pubblicamente; app DRAFT/default-deny e93esami preservati. Pro100 NOT_IDENTIFIED;199controlli tecnici non sono revisioni complete. Mutex condiviso, almeno2GiB, nessun processo utente terminato.

Prossimi passi: verificare CI postmerge sulla SHA7c29; riprodurre e adottare3632 dopo replay terminale; continuare U7 e Cric606 con autori/verificatori distinti; chiudere guide/geometry eUI delle139; mantenere checkpoint e coda umana separata dalla pubblicazione.

## Stato operativo — 3.472 revisioni, mandato incompleto

Aggiornamento del 26 novembre 2026: **3.472/4.606 quesiti scientificamente revisionati (75,4%); restano 1.134: 528 Ardesia e 606 Cric.** Attività complete: 246/385; restano 139. Approvazioni umane e nuove pubblicazioni nell’app: zero. Repository pubblico e tutti i contenuti editoriali autorizzati su GitHub; default-deny DRAFT e 93 esami invariati nell’app.

Checkpoint effettivo compilato: **3.312/246**, generazione69d765df1fc6958667faf8ca408bb8e351d9086db62ded40c091b7133781c798, manifest4b0446801589392ded402bba19ec635a46ba7adbb5a83d55124a5be4c49b7d62. Run45654876359, source46042d7e:219 pacchetti,9.987casi UI (209riusi autentici+10render), ETL fresh/incrementale identici, coesistenza,924test PASS926,610s e release PASS. Artefatto completo verificato SHAfc359476a908784ba07f96f112dc867a2e502a1878272cde8a667e211fa29cac, conservato integralmente suGitHub in quattro parti; ricevuta preintegration-45654876359-root-adoption-20261125/receipt.json. Il collaudo non approva automaticamente modifiche successive né la pubblicazione.

U6-04:160 finali Root accettati, dopo correzione della mappatura reti condensatori verso C4-L08 con C4-L07 prerequisito. Autori/verificatori distinti, vecchie prove preservate. Root19test PASS13,143s +14PASS12,435s, tutti160report fresh/saved identici e dieci import canonici16→0/16 con991pubblicati invariati, hash prima/dopo. Prove in u6-04-root-integration-20261126/receipt.json; recuperati262file da commit immutabili. Registry3472; compilato/UI globale ancora3312 fino al nuovo replay.

Otto nuove attivitàv2/base1 sono bozze, non attività completate: author-handoff.json SHA91e45ee6d9e9895894b9e551bd9cfdf09a501da6818a0bcd21e65e0ead1feafa, commit3a0b5960. Primaria distinta d8fb5265 prima dell’assembly; autore non ne ha letto le risposte. Corrette con autore distinto le percentuali, la descrizione teorica del coseno e quattro unità duplicate dal producer effettivo. Otto SVG e16valori invariati; import8→0/8 reale. Verifier e avversarial indipendenti in corso; UI prodotto NOT_RUN, geometryFAIL originali Lorentz/Snell ancora aperti. Nessun credito alle139 attività da questo lavoro parziale. Tutti139originali restano nell’inventario, con19ID FAIL acquisiti e4solo lacune di supporto;129UI_NOT_RUN.

U6-05:ownershipu6-05-v1 attiva, fonte383a0881e644ab8d95bde40b9b3b3a748eaf0baaeaab941e895077251fd087fe. Primaria BperA230–234:4fcc49ce/SHA51395bd462210eea741c8535d111ebf94686590467d5821825834e6e8668f91d. Primaria AperB235–239:bc4da66c/SHA c0d2d26dd79ece4c7ad2ff06d8ddd142acf02eb468b971b3e254ed06e16528bc. Entrambe prima dei candidati; autori in worktree disgiunti, Root unico integratore. Prossimo ID scientifico **AR-u6-force-current-wire-01**. Proseguire poi U7 e606Cric; non fermarsi a questo lotto.

Canone remoto ultimo misurato831b73fa71076b2e9b363006ffd94a350f22fe90. Stessa PR364 in aggiornamento alla head congelata3a0b5960 per3312; verificare head effettiva e check obbligatori prima di merge ordinario e CI post-merge. Nessun bypass/force-push, nessuna approvazione umana simulata. Le100revisioniPro restano NOT_IDENTIFIED;199controlli recuperati non sono revisioni complete.

Prossimi passi: seguire il nuovo replay3472 fino a terminale, verificare artefatto e adottare solo prove reali; chiudere CI della stessa PR364 sulla SHA effettiva e integrare; continuare autoria/review U605/U7/Cric606; concludere review8e correggere le restanti attività con autore distinto e UI reale. Runtime1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba invariato. Mutex condiviso e almeno2GiB; nessun processo utente terminato. Pubblicazione rimane un gate umano separato.


### Addendum del26novembre:8revisioni parziali verificate e CIin corso

Recuperata consegna COREeb51d0e9 con56file verificatiSHA, più13input della primaria d8fb5265. Primo targetRoot fallito per inputprojection mancante (0test, negativo conservato); dopo recupero esatto Root9testPASS7,726s. Otto testi/modelli/procedimenti/figure e16domande effettive verificati; nessun nuovo credito attività, UIprodottoNOT_RUN e originaliFAIL/LorentzSnellpreservati. File inexperiments-manual-support-263-independent-20261125/. PR364orahead1bbe0600, richiesta preview corretta per registro3312 senza modificare i controlli: CIin corso, mergeNONeseguito. Replay3472run45849149030/source68c95531 in corso. ProssimoautoreRoot: correzioni consumer17ID inworktreeisolato, verificatore distinto; evitare cambio runtime1a nelRoot finché nuovaepoca e prove nonsono complete.

Le sezioni seguenti sono snapshot storici.

---

## Stato operativo — 3.312 quesiti revisionati, mandato incompleto

Aggiornato 2026-11-25T16:14:35.144444+00:00; snapshot `4a15046fda85be6904df29031cc2aa89a0c17139`. **3.312/4.606 quesiti scientificamente revisionati (71,9%). Restano 1.294 quesiti: 688 Ardesia e 606 Cric.** Attività complete nella feature: **246/385; ne restano 139** (C2: 41, C3: 36, C4: 29, C5: 27, C6: 6). Approvazioni umane: 0; nuove pubblicazioni nell’app: 0. Le 93 domande d’esame restano protette nell’app. Le 100 revisioni Pro rimangono NOT_IDENTIFIED; i 199 controlli tecnici recuperati non equivalgono a revisioni complete.

**Repository pubblico, tutti i contenuti editoriali autorizzati su GitHub.** L’utente ha precisato «no, mantieni pubblico» e «no, metti pure tutto». La precedente sospensione dei push è superata. Non cambiare la visibilità né richiedere nuovamente conferma. Restano invariati default-deny nell’app, stato DRAFT e approvazione umana distinta dalla pubblicazione. Il breve passaggio precedente a PRIVATE e il ripristino PUBLIC sono documentati in `editorial/reviews/github-public-restoration-20261125.json`; nessun contenuto era stato pushato durante quel transitorio.

**Checkpoint effettivo: 3.152 quesiti e 246 attività, collaudo remoto superato.** Run [45635225687](https://github.com/AndreaMarro/ardesia/actions/runs/45635225687), source SHA `6f7553f28b4134941db7c11fdb1d0e7e6a971269`: 209 pacchetti / 9.507 casi UI, ETL fresh e incrementale byte-identici, coesistenza con 991 pubblicati invariati, **879 test PASS in 909,603 s**, validatore lotti e release PASS. Generazione `generations/201726f6645939c1e18a78d16fab3e79e299f720b6b1015ff211c0e6266becc4`, manifest `7a6e0f3b0e91019051282111b952512255819c333b15ca1fad4b61ec601b666d`. L’artefatto originale completo è recuperato e conservato in parti da massimo 40 MiB con SHA-256 e istruzioni di ricostruzione; comprende tutte le immagini e la release originali. Ricevuta `editorial/reviews/preintegration-45635225687-root-adoption-20261125/receipt.json`. Root ha verificato checksum, conteggi e marker autentici con il validatore esistente. È preparazione tecnica sulla SHA indicata, non CI obbligatoria sulla nuova head o merge canonico.

**U6-03: tutti i 160 quesiti 210–219 accettati scientificamente da Root**, commit `173208b5a336aab9f5fd2d1e0772adc658643239` dopo `57e319a397581726c764ecc815bc718ff26ca31f`. Autori e verificatori distinti, primarie precedenti ai candidati, testo e figure riletti individualmente. Root: 17 test PASS in 9,749 s e 14 PASS in 11,785 s; tutti i 10 import canonici 16 → 0 salvati / 16 invariati, con i 991 pubblicati preservati. SHA prima/dopo, report fresh/saved e provenienze conservati nelle ricevute `u6-03-A80-root-integration-20261125/` e `u6-03-B80-root-integration-20261125/`. Registry corrente: 3312; checkpoint e collaudo prodotto restano a 3.152 finché il nuovo replay non termina. Il runtime rimane `1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba`.

**U6-04: 160 candidati 220–229 scritti, verifica incrociata in corso.** Ownership in `editorial/assignments/u6-04-v1.json`; entrambe le primarie congelate prima dei candidati. I finali non ricevono credito fino a handoff indipendente e replay Root. Prossimo ID da accettare: **AR-u6-parallel-capacitors-01**; primo nuovo ID da registrare se registry ancora 3.152: **AR-u6-identical-parallel-resistors-01**. Continuare poi U6-05, U7 e i 606 Cric, senza duplicare le revisioni recuperate.

**Tutte le 139 attività residue hanno evidenze parziali recuperate; nessun nuovo credito.** L’inventario distingue unione di 19 ID con FAIL acquisito e altri 4 ID con solo lacune nel supporto manuale; non sommare categorie sovrapposte. Le osservazioni UI storiche riguardano 10 attività, mentre 129 rimangono UI_NOT_RUN. Recuperate le due dipendenze frozen 047 esatte, quindi Root ha realmente superato 7 test inventario in 5,985 s e 7 trasporto in 6,494 s; il precedente errore per input mancante è conservato. La correzione del test per clone pulito è ora recuperata con SHA: Root ha superato altri 7 + 7 test in 3,974 s e 17,643 s, con entrambi i Markdown fisicamente assenti e poi ripristinati byte-identici. I documenti frozen restano conservati verbatim nello ZIP, senza alterarne whitespace/SHA. La review tecnica distinta del trasporto ha inoltre superato 7 controprove isolate, con Node simulato e nessun nuovo credito UI. Worklist per l’autore distinto: `editorial/reviews/experiment-corrections-author-worklist-20261125/author-contracts.md`. Stevino v2 rimane candidato parziale; non creare una terza edizione per lo stesso problema.

Canone remoto misurato: `831b73fa71076b2e9b363006ffd94a350f22fe90`. PR [364](https://github.com/AndreaMarro/ardesia/pull/364) ancora DRAFT sulla vecchia `5a9a0b8fe700034dc2494fe1fce2223ded89bb50`, DO_NOT_MERGE_OLD_HEAD. La CI post-merge storica non approva le nuove modifiche. Conservare la stessa PR, eseguire i check obbligatori sulla nuova SHA e sul merge tree, poi merge ordinario e post-merge; nessun bypass, force-push o approvazione umana simulata.

Risorse: Mac 8 GiB; liberata soltanto cache npm ricostruibile (`npm cache clean --force`), non node_modules, _npx, browser o dati utente. Tutti i lavori locali impegnativi sotto mutex `/private/tmp/cric-bounded-local-work.lock` e guardia ≥2 GiB; collaudi globali sul runner. Un timeout reale dell’import autore 224 è stato conservato e non contato PASS; la ripresa deve usare l’importatore invariato. Non terminare processi dell’utente.

Prossimi passi:
1. Registrare 210–219 e richiedere il replay canonico usando il produttore autentico 45635225687; compilare e verificare il nuovo corpus senza promuovere prove vecchie a nuove SHA.
2. Concludere peer-review U6-04, recuperare i finali con hash, rieseguire gli oracoli e gli import Root; proseguire le famiglie residue con ownership disgiunta e primarie precedenti ai candidati.
3. Scrivere le correzioni delle attività con autore distinto; verificare procedimenti manuali, geometrie complete e UI reale. Ogni cambio runtime invalida selettivamente le prove dipendenti e richiede replay effettivo.
4. Aggiornare la stessa PR364 solo con head verificata, ottenere CI obbligatoria completa, integrare e controllare la SHA canonica post-merge. Pubblicazione umana separata.
5. Aggiornare manifest per ID, handoff e prove dopo ogni lotto. Il mandato è incompleto; non stimare una data finale senza una misura attendibile del lavoro residuo.

Le sezioni seguenti sono snapshot storici.

---

## Stato operativo — 3.152 revisioni scientifiche, mandato incompleto

Aggiornato 2026-11-25T14:31:40.975932+00:00; snapshot locale `ab1266583475c964a569a6a1ad7e759174a8b1bc`, ultimo Root pubblico83cafbb9. **3.152/4.606 quesiti revisionati (68,4%); restano1.454:848Ardesia e606Cric.** Attività complete nella feature246/385, restano139 (41C2,36C3,29C4,27C5,6C6). Le analisi parziali delle attività non ricevono credito. Approvazioni umane0 e pubblicazioni nuove0;93 esami protetti nell’app. Le100revisioniPro restano NOT_IDENTIFIED, i199controlli tecnici recuperati non sono revisioni complete.

**Ultimo checkpoint locale interamente collaudato:2.992/246**, generazione5bf6580b19cfb977b6b9ec9e55af2b44735a8216ae6a7eea9d52f62e140db047, manifestfc03c8a711985064a8f37ed59b345635a679dad9c5e1fd9110100732916266ae, commit0faa887. Anteprime199/9.027 realmente PASS (188riusi+11render), ETLfresh180,531s/incrementale190,608s byte-identici56file, coesistenza3.009draft e991pubblicati invariati, **800testPASS491,766s**, validatore199batchPASS145,44s, release SHA64310e060498b2f6f1acaf9acbba6c27d9424d63e814031365d8c4bfd8c8d977 con0fonti/figureDRAFT incluse. Tutte le prove grezze, ZIP UI467file e ricevute sono salvate sotto `editorial/reviews/local-only-2992-20261125/`. È prova locale, non CI sulla head finale o integrazione nel canone remoto.

**U6-02:160 ulteriori scientificamente accettati da Root**, commitc94946262e90cc7b2f52f495e67cdc9220722293. Aautore200–204/Bverificatore, Bautore205–209/Averificatore; entrambe primarie prompt-only precedenti ai candidati. Root ha recuperato232file conSHA, poi il followup finite/exacteaaaf6c (SHA75762a98b796b9af1e61ac58698a0bc2adefc37806fa0638c4e678f78d7265e4). Le vecchie399c2b8provenienze rimangono storiche. Guardie per nonfiniti/nonreali/Float/simboli/bool completate senza cambiare leggi, candidati, primarie o decoderpurob581. RED reale conservato:251mancatiValueError e605eccezioni di tipo diverso, non605accettazioni. Root ha rieseguito16testPASS3,017s e14testPASS4,738s, tutti160fresh/savedidentici sui file canonici Root senza fallbackfixture, verificati SHA prima/dopo e10import16→0/16 con991pubblicati invariati. Ricevuta completa `editorial/reviews/u6-02-root-integration-20261125/receipt.json`.

Registryora3.152, SHAfde7f8ca91fd4d504e5ab78231391e0183f8ceaf4c317a1206a65a98bd26edc1. Il replay locale canonico209pacchetti è **PASS**, riusando soltanto199marker autentici; le altre prove3152 restano da compilare/verificare. Non chiamare aggiornato il checkpoint2992 finché ETL e collaudo corrispondenti non sono conclusi. Runtimeimmutato1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba e tre protocolli canonici invariati.

C2/C3/C4: consegne parziali recuperate e salvate suGit localed5963c8 e8dda5f7, SHA individuali verificate. C2restanti26, C336 eC429 hanno prove math/code e negativi espliciti, nessuna UI conclusiva. AddendumC3L07-05 SHA1f538c032dac9c469e49d00d5533d34f6f561c0cb6aea5be6e3683e1e8bdcac0 supera soltanto il vecchio flag di manualità: risultato8√10 non accettato daNumber, bound3,16–3,17 elaborato dal reviewer e noninsegnato nella fonte. C4L09-02 richiede95° e Number:6 passa tolleranza ma non dimostra un procedimento fruibile. Nuove edizioni ancora da scrivere/verificare separatamente. Negativi geometrici restano CODE_GEOMETRY e non screenshot mai eseguiti. Due documentiMarkdown frozen con spazioEOF sono conservati verbatim nelZIP `C2-C3-frozen-raw-evidence-20261125/raw-frozen-documents.zip`; ripristinare le due path da manifest prima dell’audit completo delle consegne originali. Non modificarne bytes o SHA per far passare hygiene. Third prosegue C5 dopo primaria27 già congelata, poiC6sei; nessun anticipo di credito.

U6-03:160 assegnati in `editorial/assignments/u6-03-v1.json`, sorgenteSHA0bd13e1748174df8c30e06641ad153b8e44ab98df47f31c9f1aba7f925f88077. Aautore210–214/Bverificatore; Bautore215–219/Averificatore. PrimariaAperB4c49ff1e2020d073891686e5289e263561531a9b81e84e2f0fa9c8648dc90f4b (e1c789b), primariaBperA5a11a0eae02cb2aaf503d979af679d9a586f1dc8572134ca7523f895ca07e509 (b06205f), entrambe prima dei candidati. I commit autore locali210751185c,211611bbd6,2127c71e09,215e474aa3,216459f43c non sono ancora accettati scientificamente da Root. Prossimo ID scientifico esatto **AR-u6-identical-parallel-resistors-01**; recuperare gli80finali completi e i peerhandoff, non ristudiare i3152 già accettati.

**GitHub pubblico: autorizzazione chiarita dall’utente.** Dopo la prima risposta sul requisito ancheGitHub, il repository è stato brevemente reso privato. L’utente ha poi corretto esplicitamente: «no, mantieni pubblico» e «no, metti pure tutto». È stato subito ripristinato PUBLIC, verificato anonimamente HTTP200; confrontate impostazioni/protezioni/ruleset prima/dopo, identiche. Nessun fork pubblico, stella o GitHubPages risultava prima. Nessun nuovo contenuto è stato pushato durante il transitorio privato. La precedente sospensione degli upload è SUPERATA: sono autorizzati i push di tutti i contenuti/prove, con DRAFT e risposte protette soltanto nei flussi dell’app. Approvazione umana e pubblicazione dell’app restano distinte. Ricevuta `editorial/reviews/github-public-restoration-20261125.json`. Non cambiare più visibilità senza nuova istruzione. Canone remoto ancora831b73fa71076b2e9b363006ffd94a350f22fe90; PR364DRAFT alla vecchia5a9a0b8, DO_NOT_MERGE_OLD_HEAD fino a prove sulla nuova head.

Bootstrap CI: i nuovi audit197–199/205–209 verificano via gitshow i pacchetti dei commit autore. Il nuovo `git_provenance` recupera i10 oggetti dichiarati nei manifestfixture, con SHA40 e hashpackage/binding verificati, gruppi32 e ripresa idempotente; non importa generatori, non cambia modelli o gate scientifici. La prima discovery AST indiscriminata dei metadata era troppo ampia:9 riferimenti informativi legacy non sono recuperabili dal remoto, documentati in `git-provenance-inputs-20261125/legacy-metadata-availability.json`, senza dichiarare acquisiti quei commit. Le edizioni integrate e le fonti rimangono verificabili per hash. Review tecnica distinta di Third3 test e controprove65refs in32/32/1, senza blocker; la suite remota completa resta necessaria.

Prossimi passi riproducibili:
1. Osservare terminale del replay209, archiviare report/marker/assetveri e persistere standard; seFAIL correggere solo tramite autore+reviewer distinto e nuovo replay, mai ritag o abbassamento gate. Poi ETL3152fresh/incrementale giàPASS190,498s/195,524s,56fileidentici; completare coesistenza, suiteaggiornata e release, con ricevute e commit locali.
2. Rieseguire inRoot i targetC2/C3/C4 recuperati sotto mutex, aggiornando prove della sola faseparziale; creditoattività resta0 fino a edizione manualmente fruibile eUIvera. Conservare ogni negativo.
3. Continuare autoria/review distinta U6-03 e recupero dei finali; proseguire tutte le848Ardesia residue e606Cric. Preparare nuove edizioni delle139attività, con gate umano separato e nessun app parallela.
4. Verificare e registrare il Gitbundle locale in `work/private-recovery/`, SHA eprerequisito83cafbb9; aggiornare snapshot dopo i nuovi commit. Un bundle incrementale richiede quel commit pubblico preesistente. Non lasciare risultati esclusivamente in/tmp.
5. Consolidare subito suGitHub pubblico secondo l’ultima autorizzazione esplicita, senza altre conferme; CI finale, integrazione canonica e revisioneumana restano lavoro residuo. Il mandato non è completo.

Le sezioni seguenti sono snapshot storici.

---

## Stato operativo — 2.992 revisioni scientifiche, collaudo locale verificato

Aggiornamento 2026-11-25T13:51:44.058216+00:00, snapshot `a0136844c7e8a9d34624a1d0b01b18d88d1bb14d`. Mandato **INCOMPLETO**: **2.992/4.606 quesiti (65,0%)**, ancora **1.614**. Le 246/385 altre attività hanno revisione completa nella feature; restano139 (C2 41, C3 36, C4 29, C5 27, C6 6). Il prossimo lotto U6-02 di160 è scritto e verificato incrociatamente nei worktree, ma NON riceve ancora credito Root. Prossimo ID da accettare `AR-u6-zero-field-distance-ratio-01`; prossimo nuovo authoring `AR-u6-identical-parallel-resistors-01`, U6-03 famiglie210–219.

**Consolidamento canonico distinto dalla revisione:** il ramo remoto `officina-di-fisica` è stato nuovamente misurato a `831b73fa71076b2e9b363006ffd94a350f22fe90`, storico1.728 revisioni. L’ultimo push Root è `a0136844c7e8a9d34624a1d0b01b18d88d1bb14d`. PR364 rimane DRAFT sulla vecchia head5a9a0b8, DO_NOT_MERGE_OLD_HEAD; non aprire una PR parallela, non bypassare i required checks. Lo stato generato in CURRENT è un’osservazione della monorepo: la classificazione orphan_base rispetto a main non sostituisce la destinazione canonica richiesta dall’utente.

**Ambito privacy da chiarire, nuovi upload sospesi:** il repository GitHub è PUBLIC, confermato anche dal connettore. Il default-deny protegge la presentazione nell’app, non i file pubblici GitHub. I push precedenti esistono già: non dichiararli privati né cancellati. È pendente una domanda all’utente: divieto di esposizione DRAFT soltanto nell’app, oppure anche nel repository? Finché non risponde, nessun push, upload, dispatch remoto o modifica di visibilità/storia. Authoring, verifica e commit LOCALI continuano. Nessuna richiesta è stata respinta da auto-review; è un conflitto di ambito osservato realmente.

Il run remoto45606283140 su29f6af6 è realmente SUCCESS:177 pacchetti/7.971 casi UI, fresh/incrementale identici, coesistenza,741 test PASS506,483s, release verificata. Artefatto15018199639 SHAee98df48cc25a3762c81b8344517b8108a1ad7fb4eeba6889f7d7c06bd2d0004 scaricato e adottato2640/246, commitdb11f62. Non equivale a CI sulla head corrente. Il successivo45611122114 su7f5c956 ha realmente FALLITO sul solo18712 (320px overflow e focusability);188 pacchetti/8.499 casi validi archiviati, downstream SKIPPED. AutoreB ha corretto i soli10 passaggi di18712 senza cambiare risultato5/4J/K; A ha riletto distintamente. Root ha rieseguito21 test PASS4,412s, refresh187/188/189 e import idempotenti; nessun vecchio FAIL cancellato.

**Nuova prova locale effettiva:** il runner Playwright canonico immutato ha terminato199/199 pacchetti,9.027 casi,188 riusi validi+11 render nuovi, zero fallimenti. Un worker, mutex, nessun browser utente terminato; memoria libera minima25%, disco minimo4.982.063.104byte. Persistenza standard realmente riuscita. Runtime invariato `1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba`. ETL canonico fresh exit0 in180,531s e incrementale exit0 in190,608s,56 file byte-identici, conteggi4606/385/2992/246. Il wrapper genitore aveva poi fallito per PYTHONPATH: preservato exit1 e recuperata soltanto la validazione finale mancante con load_checkpoint, senza inventare un nuovo run. Generazione candidata `generations/5bf6580b19cfb977b6b9ec9e55af2b44735a8216ae6a7eea9d52f62e140db047`, manifest `fc03c8a711985064a8f37ed59b345635a679dad9c5e1fd9110100732916266ae`. La coesistenza corrente è PASS:3.009 record DRAFT importati (quesiti+edizioni di attività),991 pubblicati invariati. Suite completa 800 test PASS491,766s e release PASS, ricevuta local-validation-complete.json sul candidato locale, non CI remota. Artefatti in `officina-di-fisica/var/local-only-2992/` e `output/playwright/local-only-2992/`.

U6-01 tutti160 completati:190–194 Aautore/Bverificatore;195–199 Bautore/Averificatore. Primarie antecedenti ai candidati,40 test Root in tre esecuzioni (14+13+13; consultare le ricevute per tempi e perimetri), mutazioni di chiavi e modelli, SymPy/Pint/Hypothesis e10 import16→0/16,991 pubblicati invariati. Il numero dei test non è un conteggio dei quesiti. Il fix dei cinque decoder legacy è integrato inb0651fe con guardie su lessemi esatti e SHA dipendenza in ogni record: vecchie prove negative conservate nel raw-exact-evidence.zip con manifest di ripristino. Nessun credito addizionale per rigenerare le prove112 già revisionate.

C2:41 fonti con analisi parziali; C3:36 fonti e72 consegne/calcoli con analisi parziali. Le nuove consegne CORE C2remaining26 (manifest0b2e8d5edf92488d0f660b0d1e10079bdccc745cb90b1a2fcc220ebcd4fa731c) e C336 (b48b4171936c979caa7199f6e03bd658163aa26e22f567e3d1f5841239396580) sono congelate, da recuperare inRoot e verificare. Nessun nuovo credito attività, UI NOT_RUN. Conservare negativi geometrico/consumer distinti da screenshot: C2 ingresso rete assente, Pitot oltre tubo, velocità Couette nel piatto, doppia scala di velocità errata; C3 endcap termometro contenuto nel bulbo a−50/−45°C e punta freccia frigorifero dentro box opaco a75/80J, provati inXYZ/mesh e materiali, non fotografie UI. Third prosegue C4 e C5. Qualsiasi futura modifica runtime invalida le prove dipendenti: nessun ritag di1a35.

Governance: approvazioni umane0, nuove pubblicazioni0;93 esami protetti nell’app. Le100 revisioni Pro sono NOT_IDENTIFIED; i199 controlli tecnici recuperati non sono revisioni complete. Ogni esecuzione con PYTHONPATH mancante, ENOSPC,143, runner mobile fallito o comando non eseguito resta esplicita, mai trasformata in PASS.

Priorità riproducibili:
1. Terminare e osservare la suite locale2992, validatorebatch e release; accettazione: terminali0, invarianti e SHA effettive. Aggiornare ricevute, salvare con commit locale; niente upload finché ambito privacy pendente.
2. Recuperare gli autori finali U6-02 e i due handoff distinti399c2b8/474157f solo dopo il congelamento dei test2992. Verificare tutti i file SHA, Root14+14 test, fresh/saved identity e10 import canonici. Accettazione:160 verificati sul payload finalmente integrato, poi3.152; non anticipare il conteggio. Handoff A200–204 SHA025778ff8ed9a6ed85b84296c0f2a6a2c5eb4237c13f6f99f6343c0c0d41e5e8; verifica B10ba795c7e999f0ba672491ce00ea9837c6df5d72116dd6232e1bd6b1237ad5b; verifica A205–2094e5aeee85aa82765aec37d22fb72b30c6caa74750d92a5cc57a21fe05c959736.
3. Recuperare le consegne C2/C3 con path-safe SHA e credito0; continuare C4/C5/C6. Autoria delle correzioni separata dal verificatore; nessun PASS completo senza UI reale e procedimento manuale effettivo.
4. Continuare U6-03 in worktree disgiunti, primarie prompt-only incrociate congelate prima dei candidati. Poi proseguire tutte famiglie Ardesia rimanenti e Cric606, senza fermarsi al singolo lotto.
5. Dopo decisione privacy, preparare la stessa PR364 con prove aggiornate alla SHA effettiva, CI obbligatoria, merge ordinario e post-merge14/14. La pubblicazione resta un gate umano distinto. Non dichiarare completamento finché residui e approvazioni richieste non sono contabilizzati.

Le sezioni seguenti sono snapshot storici.

---

## Stato operativo attuale — 2.832 revisioni scientifiche, integrazione in corso

**Quesiti scientificamente revisionati: 2.832/4.606 (61,5%); restano 1.774.** Tutti hanno evidenze individuali; il checkpoint locale compilato resta a 2.320. Registry: 2.640 quesiti e 246 attività. Altri 192 quesiti, U5-04 e U5-05, hanno revisione distinta e import canonico idempotente, ma non sono ancora registrati o provati nella UI prodotto. Attività verificate nella feature 246/385, restano 139; il vecchio checkpoint ne registra 230. Nessuna approvazione umana o nuova pubblicazione, 93 domande d’esame protette. I 199 controlli recuperati non diventano revisioni complete; le 100 revisioni Pro restano NOT_IDENTIFIED.

GitHub è aggiornato sul ramo `feat/cric-experiment-manual-revisions`; canone `officina-di-fisica` nuovamente misurato a `831b73fa71076b2e9b363006ffd94a350f22fe90`. PR364 resta DRAFT sulla vecchia head `5a9a0b8fe700034dc2494fe1fce2223ded89bb50`: quei vecchi check non approvano le nuove modifiche. Non creare una PR parallela, non usare bypass o force-push.

Le 7.971 anteprime dei 177 pacchetti sono realmente PASS su GitHub. Il primo collector45591666917 aveva trovato cinque difetti reali di layout nei lotti171/176/177, corretti dagli autori e riletti da verificatori distinti. Le esecuzioni45598456938 e45602120352 hanno poi passato177/7.971, ma si sono fermate nell’ETL per due witness geometrici140 diversi tra piattaforme nell’ordine10^-16. Il fix29f6af6 uniforma soltanto la serializzazione delle distanze diagnostiche; il predicato grezzo di visibilità resta invariato. Originali, negativi, vecchi report e chiusura precedente sono archiviati. Rigenerato realmente140 (6/6), aggiornata esplicitamente la sola SHA della chiusura00505 e il ledger nel registry. Root13 test PASS8,729s e17 test dei ritiri PASS0,238s; audit distinto3 test+15 controprove.

La nuova esecuzione [45606283140](https://github.com/AndreaMarro/ardesia/actions/runs/45606283140), SHA `29f6af6d8b9f12dfad701b4ea76d49af96bebb8a`, ha superato anteprime, refresh scientifico48, ETL fresh/incrementale e coesistenza; **suite completa IN_PROGRESS**, release e consegna ancora pendenti. È preparazione tecnica, non la CI obbligatoria finale. Il checkpoint remoto non è ancora scaricato né promosso localmente. L’artefatto precedente45602120352 è stato scaricato, verificato SHA256 `c3db78a031f76f3ae398970d9222b76b2a00e809d1598719e10aef999d692b83`, estratto con controllo dei path; tutte177 prove terminali e i sei report scientifici/import effettivi171/176/177 sono salvati su Git.

U5-04: tutti160 sono ora revisionati e salvati (`a754d47`), non più WIP. Due primarie antecedenti ai candidati; Root ha verificato tutti i file dei due handoff e rieseguito28 test PASS5,614s, con file invariati prima/dopo. U5-05: tutti32 di A188/B189 sono ora verificati da Root contro la propria primaria582e30b antecedente ai candidati, con modelli SymPy/Pint,120 casi Hypothesis,32 chiavi mutate con tutti i guardiani editoriali sostituiti respinte,8 test PASS1,832s e import16→0/16 per lotto con991 pubblicati invariati. XML e immagini native integrali letti da Root; UI prodotto dei192 nuovi resta NOT_RUN. Audit tecnico distinto su188/189:169 asserzioni; nessun blocker residuo nel perimetro.

L’audit ha trovato un rischio reale del decoder numerico in tre verificatori U5-01 e due U5-04: il float-roundtrip può confondere2.0000000000000000001 con2. Non è un difetto dei contenuti frozen correnti con interi/frazioni, quindi nessun ritiro implicito. Il nuovo decoder188/189 conserva il lessema esatto, con regressione e guardie finite/reali. Third prepara in CORE il fix isolato per `isochoric_heat`, `isobaric_monatomic_heat`, `compression_heating`, `reversible_isothermal_entropy`, `entropy_hot_cold`, più helper puro e dipendenza SHA in ogni record. Root non deve integrare una nuova head senza review, refresh esplicito dei report interessati (inclusi188/189 per dipendenza) e gate reali. Non basta una SHA soltanto nel top-level report: `validate_batch` confronta i record.

U6-01: ownership190–199 salvata,160 ID disgiunti. Entrambe le primarie prompt-only sono congelate su Git prima dei candidati: B sui190–194 SHA12031f00b348d12feff99b677c4031308ed67876612eec5d77fb98df866b037a; A sui195–199 SHA3531bf38e7970d52ba36b9193b48827d0a59b7f8d5c364705e0ff60809e268e9. Autori A190–194/B195–199, verificatori incrociati. Autoria in corso: A190/191/192 e B195/196 già pushati sui rispettivi rami, non ancora recuperati in Root; nessun credito scientifico anticipato. Continuare senza leggere la primaria dell’altro prima dell’autoria.

C2: recuperate e verificate19 file di consegne parziali, senza credito. Stevino DRAFT047 ha23 controlli matematici distinti e5 mutazioni respinte, ma il difetto visivo della sonda resta aperto. Le31 fonti successive hanno62 riferimenti esatti/378 configurazioni razionali, non UI. I primi5 consumer successivi hanno77 stati Node,29 controlli esatti e5 test PASS4,173s; UI NOT_RUN, esito completo falso. Rischi pressa/sonda sono separati dalle fotografie effettive: non inventare nuovi screenshot o FAIL visuali.

Risorse locali: Mac8GiB; il vecchio globale locale ha avuto exit1 per ENOSPC e la ripresa exit143 intenzionale, mai PASS. Conservati sorgenti, Git, asset e prove; rimossi soltanto duplicati reinstallabili. Non terminare browser/processi utente. Browser prodotto e suite complete sul runner. Piccoli processi locali sotto `/private/tmp/cric-bounded-local-work.lock`, minimo2GiB liberi prima dell’import, recovery venv esplicito e `PYTHONDONTWRITEBYTECODE=1`.

Prossimi passi, in ordine:
1. Seguire45606283140 fino al terminale effettivo. Verificare SHA dell’artefatto e contenuti prima di adottare il checkpoint2640/246; ogni errore richiede diagnosi, non alleggerimento del gate.
2. Integrare e rivedere il fix dei cinque decoder; rigenerare realmente solo i report invalidati, includere le nuove dipendenze nei record e rieseguire controlli proporzionati. Conservare le versioni prima/dopo. Nessun incremento di credito.
3. Registrare i192 quesiti178–189 già scientificamente verificati, eseguire le UI mancanti con il runner canonico e la cache valida, ETL, coesistenza, suite e release. Il prossimo ID da consolidare nel checkpoint locale resta `u5-cyclic-work-01` / `AR-u5-cyclic-work-01` (158); il primo nuovo ID da registrare è `AR-u5-plane-conduction-01` (178).
4. Continuare autoria/review distinta U6-01, prossimo ID scientifico `u6-coulomb-force-01` (190), senza duplicare i160 già assegnati o attribuire PASS agli autori. Recuperare singoli commit e prove dai rami A/B, Root unico integratore.
5. Aggiornare la stessa PR364 solo con head concretamente verificata; CI obbligatoria sulla SHA finale e sul merge, post-merge14/14, human/publication separati. Continuare poi U6/U7/Cric606 e le139 attività residue. Il mandato resta incompleto.

Le sezioni seguenti sono snapshot storici e non descrivono lo stato attuale.

---

## Stato attivo — collaudo remoto avviato, lavoro editoriale ancora aperto

**Revisione scientifica: 2.640/4.606 quesiti, da revisionare1.966.** Il checkpoint compilato resta2.320; i320 ulteriori hanno review distinta e import idempotente e sono ora tutti nel registry, ma il nuovo checkpoint attende UI/ETL/coesistenza/CI. I sei ritiri C1 sono chiusi esplicitamente con runtime1a35 e report perID/SHA attuali, negativi immutati. Registrati246 ID di attività scientificamente verificati, di cui16 nuovi; il checkpoint storico registra230, il successivo246 resta da compilare. Le cinque criticità C2-047 sono esplicite e senza nuovo credito. Human NOT_RUN, pubblicazioni nuove0, esami protetti93.

Il disco del Mac ha esaurito lo spazio durante il globale167: exit1 reale con SQLite disk I/O, senza PASS. La ripresa locale177 con unworker è poi terminata intenzionalmente143 prima di una nuova saturazione. Salvati e verificati46 marker autentici/2.256 casi individuali. Memoria host8GiB, swap osservato>10GiB. Rimossi solo due vecchi node_modules reinstallabili, una cacheSwift, il vecchio venv duplicato e bytecode; preservati sorgenti, Git, edizioni, asset e tutte le prove. NON chiudere browser o processi utente. Nessun processo di preview locale resta attivo.

È realmente IN CORSO il job GitHub [45591666917](https://github.com/AndreaMarro/ardesia/actions/runs/45591666917), job139127158015, SHA`569114d56e306edc63592ad6d9acd523dd7d8684`:177 pacchetti/7.971 casi, quattro worker sul runnerUbuntu. Lo stesso runner e i tre protocolli canonici sono invariati; runtime1a35, registry e SHA dei protocolli sono stati già confrontati con successo nel job. Il nuovo workflow di sola raccolta prove è separato: i due workflow CI obbligatori sono byte-identici. Review tecnica B con unP2 sul path dello schema corretto e riletto, ricevuta versionata. Non chiamare questo job completa CI scientifica o approvazione umana.

Root ha salvato su Git59 test C1 PASS775,434s, nove035 PASS3,158s e17 test dei ritiri PASS0,590s. I due handoff C1 attuali sono verificati per1.300 file; il047 originale è congelato per324 file,10 attività con5PASS/5FAIL,9fonti scientificamente corrette e un conflitto g; Root non ha eseguito ancora la nuova suite047 per la pressione risorse. Nuovo Stevino v2 in223fb0d: autoreRoot, Third ha riletto17blocchi ma automazione/render/UI sono NOT_RUN e sonda consumerFAIL aperta.

U5-04: A178/179/180 sono pushati (`83f82bca`+`5e934bfa`, `eebdbfb3`, `cceb5d0b`); A181 è WIP assemblato, A182 non iniziato. B183/184/185/186 pushati (`1f06ede`, `9a91216`, `9f090727`, `1597d4ac`); B187 è WIP assemblato con didascalia da precisare. Root ha già178/183/184, deve recuperare179/180/185/186. Entrambe le primarie erano congelate prima dei candidati; testi/XML B183184 e testiA178 letti senza finding finora, ma niente firme finali o credito finché render/test distinti non esistono. Nuovi render NOT_RUN. Assemblies181/187 sono effettivamente concluse, ma i launcher nonfailclosed hanno erroneamente proseguito dopo guardia spazio fallita: registrare il limite, non inventare uno stop; nessun dato perso. Autori al momento senza processi pesanti e con WIP intatti.

U5-05: fonte32 record SHA`e8f90aea8c862df7110419c599fbd2b7160d32b370a098146feb303553194378`; primariaRoot32 prima dei candidati SHA`582e30b76edaa9d53138240934256a3ff1224966737fcdb7b74defa578b21023`. AssignmentA188/B189, verifierRoot. Non leggere la primariaRoot da autori prima dell’autoria. Esplicitare denominatori non nulli e conteggi interi positivi; nessun authoring188/189 avviato.

Prossimi passi concreti:
1. Seguire il job45591666917 fino al terminale vero; scaricare tramite connettore/API gli artefatti autentici, verificare SHA/runtime/protocolli/package/ID e marker, poi persistere su Git. Nessun PASS da report senza exit0.
2. A prova UI positiva, usare la pipeline esistente per ETL fresh/incrementale, coesistenza, checkpoint e release; CI completa sulla SHA finale, stessa PR364 e post-merge14/14, nessun bypass. PR364 resta DRAFT sulla vecchia5a9a0b8.
3. Recuperare i quattro commit autore disponibili e salvare WIP181/187; continuare review distinta U5-04. Finché il disco resta sotto2GiB, evitare subprocess pesanti e nuovi browser; preferire i runner per le verifiche pesanti. I fileWIP non sono risultati completati.
4. Chiudere la sola matematicaStevino con verifier distinto, mantenere originale/visivaFAIL; successivo fixC2 separato e realmente verificato. Prossimo ID di checkpoint sempre`u5-cyclic-work-01`/`AR-u5-cyclic-work-01` (158); prossimo da completare in authoring`u5-parallel-thermal-panels-01`/famiglie180–182 se ripresa dal relativoWIP, senza duplicare178179.

Il mandato non è completato. Le sezioni seguenti sono snapshot storici.

---

## Aggiornamento operativo — 2.640 revisioni scientifiche, checkpoint 2.320

Il checkpoint resta **2.320/4.606 quesiti DRAFT**; altri **320** hanno concluso la revisione scientifica indipendente (U5-02 e U5-03). Totale scientifico **2.640/4.606**, da revisionare **1.966**. I 320 non ricevono credito di checkpoint prima delle UI e dell’integrazione finale. Le attività effettive restano **227/385**, da chiudere **158**; sei ritiri OPEN, tre riferiti ad accettazioni già registrate. Nessuna approvazione umana o nuova pubblicazione; 93 esami protetti.

ROOT contiene ora il runtime reale `1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba`. Il globale autentico 167 pacchetti/7.491 casi è IN CORSO, due worker, sessione 69122 e log `/private/tmp/cric-runtime1a35-all-ui.log`. Salvati su Git 22 marker terminali autentici/1104 casi come **evidenza parziale**, non PASS globale. Registro e ledger restano congelati finché la corsa non termina. Le vecchie prove b963/8d rimangono storiche, senza ritag.

I due handoff C1 correnti (Third1051 file, A247 file) sono copiati e verificati: 1.300 file unici inclusi i manifest, 752 copiati e 38 versioni precedenti preservate. Commit `6445ce8`; la suite ROOT distinta di 58 test è in corso, sessione61035, log `/private/tmp/cric-c1-root58-current1a35.log`. I cinque banchi035 hanno invece già veri 10 replay correnti con exit0, 378 configurazioni e 9 test PASS in3,158s; nessun nuovo credito, 13 vecchi file b963 conservati. Tutti gli80 B173–177 sono ora verificati da A: 13 test ROOT PASS in16,863s, handoff SHA `16ce849780555048747922984ed3c63d142e782bdb5f0775f492191ae5e6773e`, commit `23118b7`.

U5-04 è assegnato in `editorial/assignments/u5-04-v1.json`, SHA `2560e2203323123c3b8a1bb1568b9d04136bc0c1f7be3b9dfe7c46e99d194070`. Autori A178–182/B183–187 e verificatori incrociati, 160 ID disgiunti. Entrambe le primarie prompt-only sono congelate prima dei candidati: Bc94597… sugli80 A; A004be03… sugli80 B. Authoring parallelo in corso, nessuna nuova UI o modifica di produzione. Prossimo ID scientifico da produrre `u5-plane-conduction-01`; prossimo ID da CONSOLIDARE nel checkpoint rimane `u5-cyclic-work-01` / `AR-u5-cyclic-work-01`, lotto158.

C2 gruppo047 continua la lettura distinta dei10 originali. Negativi reali: sonda coperta in00105/00201/00202, freccia Couette00102 nella lastra, punte Pascal00301 sotto etichette; 00201 ha anche g10 nel prompt contro9,81 nel modello. Le osservazioni di solo bordo0,253px in00204 non sono promosse a FAIL. Root ha prodotto una nuova edizione2 `experiment-stevino-revision-047` con g981/100 coerente e conti esatti19,62/14,715: import canonico1→0/1 e991 pubblicati invariati; review indipendente e UI NOT_RUN, nessun credito. Non corregge da sola il difetto visivo.

Priorità di prosecuzione:
1. Osservare il terminale vero del globale167 e della suite58; conservare marker validi, diagnosticare eventuali errori senza indebolire i gate.
2. Dopo il terminale globale, chiudere esplicitamente i sei ritiri con report per ID/SHA/runtime correnti; registrare048/049 e dieci famiglie U5-03, poi vero replay177 con riuso dei marker validi.
3. Eseguire ETL fresh/incrementale, coesistenza, suite completa e release sul risultato effettivo; aggiornare la stessa PR364, CI sulla SHA finale, merge ordinario e post-merge14/14. La PR364 rimane DRAFT sulla vecchia head5a9a0b8: non integrare quella head.
4. Continuare autoria e review distinta U5-04; congelare i negativi047 e far verificare a Third il nuovo Stevino prima di qualsiasi accettazione. Ulteriori correzioni runtime C2 richiedono prove reali proprie.

Il mandato rimane aperto. Le sezioni seguenti sono snapshot storici.

---

## Aggiornamento attivo — layout 1a35 verificato, rinnovi scientifici in corso

Il CORE propone `85d42237e53c4450ddbcae5efb6911132f7859ca`, runtime `1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba`. La review distinta Third è positiva nel perimetro dei 26 consumer: 352 casi browser reali, 1.245 stati, 1.176 delta invariati, 176 viste native senza coperture delle punte da parte delle etichette. Manifest `7004239d984ca479d4cfe36872fa1c922c2d213e982134c1a3d3dfd71f40a9d8`. Sono in corso i veri rinnovi 048/049, 036 e 118/119/140; la nuova prova della normale ha 128 casi e manifest `fc8efd368725d02bcfbcd034f10eb7144d19e38726446227d6ccf5c2bc4f3bf1`. Non confondere questa review del layout con un checkpoint completo o un'approvazione umana. ROOT resta b963 fino all'integrazione verificata.

Il checkpoint storico resta 2.320 quesiti e 230 attività registrate, **227 attività effettive** dopo tre ritiri registrati. Registry: 2.480 specifiche di quesiti, di cui 160 U5-02 con review indipendente e import pronti ma nuovo checkpoint ancora pendente. Il globale b963 è terminato intenzionalmente con 143; 11 marker veri e 576 casi sono conservati come evidenza parziale, senza PASS globale. Cinque ritiri sono OPEN nel ledger (tre registrati e due gruppi futuri); il nuovo finding 00701 è documentato nella negativa 8d e va aggiunto alla chiusura controllata prima di integrare 048.

U5-03: tutti i 160 candidati A168–172/B173–177 sono scritti e salvati sui rami autore; la review distinta continua. ROOT ha letto tutti i 16 di 168 e l'intero XML della figura: risposte corrette, due frasi precisate e revisione delle etichette grafiche ancora da congelare. B ha letto tutti i 64 di 169–172, trovando un controesempio numerico 171-16 da correggere 32→35 °C; A sta leggendo gli 80 di B, con un hint 173-09 da precisare. Le etichette di coordinate SVG in pixel vengono sostituite da unità fisiche visibili, conservando geometrie, dati e vecchi asset. Nessun risultato è approvato dal proprio autore. Le UI correnti dei candidati finali sono NOT_RUN, le vecchie prove b963 sono archiviate senza ritag.

Prossimo ID da consolidare: `u5-cyclic-work-01` / `AR-u5-cyclic-work-01`, lotto 158. Dopo il positivo scientifico dei gruppi, integrare il vero runtime definitivo e fare i replay globali, ETL fresh/incrementale, coesistenza e suite completa. PR #364 resta DRAFT sulla vecchia head; non integrare senza tutti i gate della nuova SHA. Continuare in parallelo le review U5-03 e il corpus residuo; la primaria B degli 80 U5-04 A178–182 è già salvata, senza authoring successivo avviato. Human NOT_RUN, pubblicazioni nuove zero, 93 esami protetti; mandato aperto.

Le sezioni seguenti sono snapshot storici del lavoro in corso.

---

## Correzione operativa — 2.320 quesiti storici, 227 attività effettive, replay sospeso

Il mandato rimane aperto. Il checkpoint `67fe90ae` registra storicamente 2.320 quesiti DRAFT/230 attività, ma tre accettazioni registrate sono ritirate: `SIM-C1-L005-05`, `SIM-C1-L004-02`, `SIM-C1-L004-04`. **Attività effettive 227; da chiudere 158.** I 160 quesiti U5-02 hanno review scientifica distinta e import idempotente; sono ora specificati nel registry (2.480 quesiti), senza credito di nuovo checkpoint finché tutti i gate non tornano validi. Prossimo ID esatto da consolidare `u5-cyclic-work-01` / `AR-u5-cyclic-work-01`, lotto158.

ROOT è sul runtime reale `b963060675f372b28d79823f92e3a781b32856779fe1dd6a6fbb3feaba30686f`. Il globale167 pacchetti/7.491 casi è stato intenzionalmente interrotto con exit143 dopo i finding040: nessun PASS globale. Salvati su Git11 marker terminali autentici e576 casi individuali sotto `editorial/reviews/runtimeb963-terminal-evidence/`; i report senza marker dei processi interrotti non sono promossi. Audit del solo gruppo processi di test23566 conservato. Non segnalati altri browser o processi del computer.

La revisione indipendente A sul piano aveva128 casi reali e341 artefatti, manifest `3c9bf897...`; la chiusura140 resta subordinata al report scientifico nuovo. Il successivo censimento26 consumer/1.245 configurazioni ha trovato tre ID con punte coperte da corpi/tavolo:00402,00404,00803. Il canary distinto ha confermato anche la sprite di Hooke00602 a320/+6cm. Le tre prime accettazioni registrate sono OPEN nel ledger; i due precedenti positivi isolati048/049 sono anch'essi ritirati prima di ogni futura registrazione. Originali negativi, limiti di misura e assenza di screenshot a quota0,25 nel solo b963 sono preservati. I due negativi aggiuntivi non sottraggono altre attività dal checkpoint230.

CORE `3f400ad26a96f95c13c8c26419224c981f9dfbd6` propone runtime `8d36a399f6a4d7f436369163be9cf48eb15633cbca7683ebf368f2efccb34a55`. Quattro funzioni di disegno e le legende sono corrette senza cambiare leggi/delta/scale:13 test mirati PASS dopo4 RED,277 Node e2 contratti PASS. Review distinta Third:352 UI reali,1.245 stati,1.176 delta invariati,6 test PASS; **CHANGES_REQUIRED**, perché la label a/b di `SIM-C1-L007-01` copre punte reali a320/1280. Il candidato Via00304 ha un margine di0,10px e resta osservazione separata, senza dichiarazione di cono completamente coperto. Non integrare né avviare un nuovo globale su8d finché la correzione dei nomi non supera una review distinta. Nessun replay Third è attivo alla consegna; cartella prova8d congelata, manifest `e88da7b94d1b454ac208653d9b5748313500151d329f51dc3d0d377abb5f6c96`.

035 ha una prova b963 reale5/5,378 configurazioni/10 UI/9 test.039 ha prova A reale6/6,66 UI,249 frame e9 test18,468s, più9 test ROOT freschi482,373s; le snapshot5405 sono autentiche. Queste prove sono storiche per un futuro runtime differente: nessun ritag.036 e118/119/140 non sono stati rieseguiti sul candidato8d. I gruppi048/049 hanno sulb963 solo replay diagnostici68+104+24 e canary5, non una nuova approvazione scientifica.

U5-03 avanza in parallelo: tutti80 candidati B173–177 sono committati/pushati e recuperati in ROOT;173/174 hanno solo anteprime storiche b963,175–177 UI NOT_RUN. A168 è recuperato e letto integralmente da ROOT contro primaria indipendente, con chiavi corrette; due precisazioni di prosa/feedback13/14 sono richieste all'autore, senza cambiare risposte/figure.169 è già pushato;170–172 in chiusura. Primarie indipendenti: ROOT168 `3d20a03b...`; B169–172 `94195304...`; A173–177 `ea13a6d7...`. La primaria B U5-04 first80 è salvata `c94597ea...`, nessun candidato letto; discovery160, ownership proposta178–187 confermata, authoring successivo non ancora iniziato. Non contare primarie e candidati come revisioni complete.

La suite completa storica2320 rimane579/86 moduli/467,946s su da2d1ad, antecedente ai ritiri.25 test U5-02 e6 test delle primarie168 sono distinti, non una suite unica sommata. CI finale sulla nuova SHA NOT_RUN. Canone remoto riconfermato831b73f, conteggio storico1.728/204 ed effettivo203; PR364 resta DRAFT su5a9a0b8,25 SUCCESS/1 SKIPPED della vecchia SHA. Non esiste ancora un merge canonico di questi incrementi. Human NOT_RUN, nuove pubblicazioni0,93 esami protetti, Pro100 NOT_IDENTIFIED.

Prossimi passi eseguibili:

1. Nel CORE correggere le label vettoriali e la piccola sovrapposizione Via, conservando tutti i negativi; far ripartire il verificatore Third sul vero nuovo fingerprint. Nessun globale prima della review positiva.
2. Chiudere il fix testuale168 e la sua verifica ROOT; proseguire review incrociata A173–177/B169–172 e acquisire tutti i candidati, senza attendere il gate umano.
3. Sul runtime definitivo eseguire davvero035/036/039/040/118/119/140/048/049; chiudere esplicitamente ciascun ritiro con report corrente e ledger, poi anteprime167+, coesistenza, ETL fresh/incrementale e suite completa.
4. Aggiornare la stessa PR364 soltanto con gate concreti, CI della SHA finale, merge senza bypass e verifica post-merge; continuare tutto il corpus4.606/385. Riprendere047, tuttora solo primaria parametrica, e U5-04 dopo la review U5-03.

Le sezioni seguenti sono snapshot storici, superati da questa correzione datata25novembre2026.

---

## Stato operativo — 2.320 quesiti; 229 attività effettive; ritiro visivo aperto

Il mandato continua. Il checkpoint storico `67fe90ae` (manifest `03ee6336`) registra 2.320 quesiti DRAFT e 230 attività. La nuova prova indipendente ritira l'accettazione di `SIM-C1-L005-05`: **229 attività effettivamente accettate e 156 ancora da chiudere**, 2.286 quesiti ancora da integrare. Non promuovere il ROOT 5405 o la vecchia head della PR #364 mentre il ritiro è aperto. Human NOT_RUN, pubblicazioni nuove zero, 93 esami protetti.

HEAD remoto canonico riconfermato `831b73fa71076b2e9b363006ffd94a350f22fe90`; main sorgente ancora `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`. PR #364 resta DRAFT sulla vecchia `5a9a0b8fe700034dc2494fe1fce2223ded89bb50`; i suoi check precedenti non approvano questa nuova fotografia. Il canone ha 1.728 quesiti/204 attività storiche, 203 effettive per il precedente ritiro LAB3D-01; il fix di quel banco è indipendentemente verificato solo nella feature.

Ritiro salvato e pushato ROOT `2258a1d`: 49 file originali verificati e copiati byte per byte, manifest `33c21222478335a063a50b41d81e57342e837117705ef89a379e71db4b8558e7`. Le fotografie sono state eseguite sul CORE c177; l'applicabilità al ROOT 5405 deriva dall'identità verificata della funzione piano e delle dipendenze pertinenti. Non sono fotografie rieseguite sul ROOT. Difetti: normale a 75° interamente nella sfera opaca e punta del peso a 0° nascosta dal tavolo. Modulo, leggi e conti manuali erano corretti; il PASS numerico non provava la leggibilità del vettore.

CORE `27610cc9d625d291d9522251e18061aa755c5ab9` contiene una correzione proposta, runtime `b963060675f372b28d79823f92e3a781b32856779fe1dd6a6fbb3feaba30686f`: vettori completi fuori dagli occludenti, stessa scala e linee d'azione, nomi nella legenda HTML esistente. 9 test mirati, 273 Node e 2 contratti reali PASS; la review visiva indipendente A sul nuovo runtime è in corso, nessuna accettazione anticipata. Le precedenti prove c177 di 048/049 restano storiche e richiedono riesecuzione reale.

Gate nella pipeline esistente: CORE `9621a9c`, ritiro ancora OPEN. Cambiare candidato o runtime non lo chiude; serve chiusura esplicita legata a runtime attuale e report scientifico positivo dello stesso ID/lotto, oltre alla normale verifica fresca. ROOT ha letto i diff e verificato 8 SHA, invarianti del registry, 46 test reali PASS in 0,915 s e rifiuto del caso reale. Fixture storica CORE `b925c3c`: veri archivi Git f897/5405, niente alias del runtime attuale. ROOT 10 test PASS in 1,886 s e 42 negativi storici PASS in 110,807 s; tutti i 16 corpi dei test 045/046 invariati. Questi commit tecnici non chiudono il ritiro scientifico.

U5-02: tutte le 160 revisioni 158–167 hanno review scientifica distinta, salvata e pushata ROOT `7ead34c`; 255 controprove, 480 configurazioni Hypothesis e 25 test ROOT freschi PASS in 3,962 s. Il primo precedente run da 25 in 6,065 s resta distinto. Una didascalia 166-01 è stata corretta e riletta. Nessun credito aggiunto al checkpoint prima dell'integrazione. Prossimo ID esatto **`u5-cyclic-work-01` / `AR-u5-cyclic-work-01`**, batch `cyclic-work-158`. Discovery U5-03 source-only in corso; niente duplicazione dei 160 già scritti.

Suite completa effettiva della fotografia 2320: **579 test PASS, 86 moduli, 467,946 s**, startingHead `da2d1ad10542c0d5054650aa8a8e6c46d9ca4f1b`, exit 0, input e checkpoint invariati; ricevuta salvata ROOT `1b8168d`. È una prova tecnica anteriore al ritiro visivo, non un'approvazione scientifica globale. I 25 nuovi test non sono sommati come singola suite da 604. I 157 pacchetti/7.011 casi 5405 e la release tecnica 2320 (SHA `485a48cadac3589ddd7811d5663a79b31e5553e9d83e3d9fa2cdb72c3ad5b554`) restano prove storiche di quell'epoca; nessun ritag al b963.

Priorità eseguibili:

1. Chiudere la review indipendente A della correzione piano sul b963, conservando ogni negativo; solo dopo ottenere vera nuova prova 140 e chiusura esplicita del ritiro.
2. Rinnovare davvero 035/036/039/040, 118/119/140 e 048/049 sul runtime definitivo; poi integrare con un solo integratore e rieseguire anteprime, ETL fresh/incrementale, coesistenza e suite completa. Nessun marker sintetico.
3. Registrare i dieci lotti 158–167 con prove aggiornate e proseguire U5-03 con ownership disgiunta e autori/verificatori distinti. Riprendere anche il gruppo attività 047, finora solo primaria parametrica.
4. Aggiornare la stessa PR #364 quando tutti i gate sono concreti, CI sulla SHA finale, merge senza bypass e verifica post-merge. Proseguire fino a 4.606/385; i 199 controlli recuperati e le 100 revisioni Pro NOT_IDENTIFIED non sostituiscono revisioni complete.

Le sezioni seguenti sono snapshot storici e sono superate da questa correzione datata 25 novembre 2026.

---

## Stato operativo — checkpoint 2.320/230 salvato; PR canonica in preparazione

**2.320 quesiti revisionati DRAFT e 230 attività riesaminate**, 17 edizioni correttive. Tutti i 4.606 quesiti e le 385 attività sono contabilizzati. Restano 2.286 quesiti e 155 attività; la sola risoluzione indipendente manca per 2212 ID. Checkpoint salvato e pushato in `4b7bd36da02c638e57e2446efdd31dec094fc7b7`, generazione `generations/67fe90aeda4392b446f70b7cbf6f9872ef6ca645d7bdb8226d77f569f9ec95ab`, manifest `03ee63364c2656a598f2f07181b35104e31203b674b9e846a80bdf71401f7e49`. Fresh e incrementale hanno veri exit 0 e tutti i 55 file identici. Sorgente main verificata ancora su `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`; Cric storico `5d1dc8dc7b601aef959d10d564c75462be74708d`.

ROOT `/private/tmp/cric-resident-integrator`, ramo `feat/cric-experiment-manual-revisions`, runtime congelato `54054f7ac463ef52f7c4c881d50ee071713315d891812696f18e39d9ad45ab3d`. Tutti i 157 pacchetti e 7.011 casi hanno report e marker terminali autentici versionati. L'ultimo macro ha riusato 155 pacchetti e renderizzato i due mancanti; il riavvio riusa 157/0. Recuperati 384 casi U5-01 soltanto da otto marker già prodotti dal runner canonico, con identici input e hash; nessun marker ricavato da soli report, nessun ritag.

Coesistenza reale: 2.337 bozze, zero scritture al secondo import, 2.337 unchanged; tutti i 991 pubblicati/live head/storia/tentativi invariati, 181 entry point preservati. La correzione degli anchor di 054/073 è riletta da un revisore distinto; formule e asset invariati. RED, snapshot, 18 test del revisore e due test ROOT conservati. Le accettazioni e gli errori precedenti non sono stati cancellati.

Validazione precedente completa: **554 test PASS in 475,907 s**, 84 moduli sulla fotografia `8fc95a0`, input/checkpoint invariati. Nuovi U5-01: 12 test ROOT PASS in 2,468 s e 13 in 3,875 s, dichiarati separatamente. La nuova suite completa sulla 2320 deve ancora essere registrata; launcher locale `work/run-tracked-corpus-suite.py`, output atteso `editorial/reviews/local-regressions-2320-20261125.json`. Prima di congelare la PR finale richiedere tutta la CI della SHA effettiva.

Canone remoto ancora `831b73fa71076b2e9b363006ffd94a350f22fe90`, PR #363 MERGED e 14/14 post-merge SUCCESS. Conteggio storico 1.728/204; accettazione LAB3D-01 ritirata, quindi 203 attività ancora accettate finché il fix non è canonico. La correzione 5405 del banco classico è già indipendentemente verificata in questa feature. Distinti e conservati il falso controesempio μd>μs fuori dominio e il falso GREEN da shell che mascherava exit 1, seguiti da prove vere e review distinta.

PR [#364](https://github.com/AndreaMarro/ardesia/pull/364) è ancora DRAFT sulla precedente head `5a9a0b8fe700034dc2494fe1fce2223ded89bb50`, con 25 SUCCESS/uno SKIPPED tecnici. **Non integrare quella head**. Aggiornare la stessa PR con il successore 2320 completo, descrizione riscritta, release riproducibile/boundary e CI della SHA effettiva; poi merge senza bypass e 14 job post-merge reali. Release 2160 verificata e conservata, SHA-256 `9ea8995de2c167ef6f1205c5542f175a68c4c83345b9b41f2432d2c5f15da1e3`, zero sorgenti/figure DRAFT; è uno snapshot precedente, la 2320 è ancora da costruire.

U5-01 (148–157) è integralmente registrata: autori e verificatori distinti, 255 controprove e 480 configurazioni Hypothesis. Quattro feedback/hint corretti e riletti, chiavi/formule/figure conservate; due primarie originali recuperate byte per byte con le SHA dichiarate. U5-02 ha tutti i 160 candidati 158–167 salvati sui rami autore e in trasferimento ROOT, con review incrociata in corso e zero credito aggiuntivo. Primaria A dei B163–167 salvata prima della lettura delle chiavi. Il prossimo ID da integrare è sorgente `u5-cyclic-work-01`, canonico `AR-u5-cyclic-work-01`, lotto `cyclic-work-158`; il primo ID lessicografico del backlog è diverso.

CORE isolato `/private/tmp/cric-experiment-contract-fix`, ramo `feat/cric-c1-consumer-visibility`, commit `0503dadcb1834c6ea306613fd57c3e212c0cfe61`, runtime `c177aba9dfdbfd8296addd3583ce487e8f43ed1b52cef784636a2d1cd40f0744`. I gruppi nuovi 048/049 sono verificati indipendentemente: 16/16, 262 controlli, 263 configurazioni, 245 frame, 32 compiti manuali, 196 casi browser e nove test PASS in 62,832 s. Tutti i 48 file di consegna sono verificati per SHA e committati. I negativi 045/046, 47c3 e 805e restano immutati; i due candidati precedenti hanno fatto emergere tre problemi visivi reali, corretti prima dell'accettazione. Fulcro/Gomito sono nella legenda HTML esistente per non coprire il marker a 320 px. ROOT resta sul 5405: nessun credito per i 16 consumer finché non sono integrati e tutti i dipendenti rivalidati.

Prima di portare C177 nel ROOT, preparare fixture storiche autentiche 5405 per i negativi 045/046, senza cambiarne i pin; aggiornare la base CORE dalla 2320 e rieseguire davvero 035/036/039/040 e i 16 esperimenti 118/119/140, oltre alle anteprime globali sul nuovo runtime. Il gruppo 047 ha solo una primaria di dieci ID e 19 controlli, con costanti esplicitamente parametriche: nessun PASS fonte/consumer e nessuna registrazione.

Dei 199 vecchi controlli tecnici, 125 ID sono ora completamente revisionati e 74 restano parziali; non confonderli con revisioni complete. Le 100 revisioni Pro restano NOT_IDENTIFIED. Approvazioni umane NOT_RUN, nuove pubblicazioni zero, 93 esami protetti. Adattività provata soltanto su fixture sintetiche private; axe non certifica da solo WCAG/UDL o apprendimento. Mandato aperto: continuare tutto il corpus senza attendere il gate umano di pubblicazione. Le sezioni seguenti sono snapshot storici.

---

## Stato operativo — PR #364 in CI, runtime nuovo in rivalidazione

Ultimo checkpoint integralmente validato: 2.048 quesiti DRAFT e 214 attività, generazione 90d05fb5, sulla SHA `5a9a0b8fe700034dc2494fe1fce2223ded89bb50`, runtime f897. [PR #364](https://github.com/AndreaMarro/ardesia/pull/364) aperta e congelata su quella SHA; CI in corso, nessun merge dichiarato. Release 2048 riproducibile/smoke e boundary verificati, SHA256 `a62a386c649b4b90bf40f6e4c233cb3ad21af3135bdcc1dc49eeb144f4130eb5`, zero sorgenti e figure DRAFT distribuiti.

Canone remoto: `831b73fa71076b2e9b363006ffd94a350f22fe90`, PR #363 MERGED, 1.728/204, post-merge 14/14 SUCCESS sui run 45540501792/45540501766. Report versionato. Non confondere il checkpoint della feature con il conteggio già canonico.

ROOT `/private/tmp/cric-resident-integrator`, nuovo ramo `feat/cric-experiment-manual-revisions`. Core 32c6763 integrato localmente nel merge `1db37d69ca3d8006fb53b1d713a32a40f1082212`; attuale runtime `97cd2aba7360c632b8d7421f8ccaaa58c00d8e600c14b67d6b74de13a35bea72`. Il checkpoint 2048 resta storico del runtime precedente finché i gate dipendenti non sono realmente rinnovati. Nessun FP ritoccato. `editorial/reviews/runtime-transition-20261125.json` marca CURRENT_RUNTIME_REVALIDATION_PENDING.

Replay esaustivo in corso con il runner esistente `tests/corpus/browser-batches.mjs`, quattro worker, output `/private/tmp/cric-runtime97-all-ui`, log `/private/tmp/cric-runtime97-all-ui.log`. Il processo verifica tutti i lotti registrati e le 14 edizioni correttive già registrate. Le 9 anteprime118/119/140 sono state davvero rifatte sul 97cd nella worktree core, oltre a12 casi tecnici nel banco reale. La revisione scientifica distinta dei 16 ID di037/038/041 continua in `/private/tmp/cric-experiment-contract-fix`; nuovi verifier non sono ancora nel registro. Originali negativi e test riprodotti su vero Git snapshot f897, non sul runtime nuovo mascherato.

035/036/039/040 richiedono nuova lettura delle dipendenze cambiate, veri replay e report attuali prima del prossimo ETL. I test storici037/038/041 usano ora un fixture autentico isolato; nessuna vecchia asserzione rimossa. Il helper ha 3 test e review tecnica distinta, che segnala correttamente che il test di conservazione confronta banco.js e APP, mentre la costruzione scrive solo nel TemporaryDirectory.

I 112 candidati U4-02 sono tutti salvati sui rami autore. ROOT include 141–147; review incrociata in corso. Piccolo finding 144-11 sulle ipotesi per confrontare intensità: autore deve precisare onde progressive codirezionali e stesso coefficiente, poi rilettura distinta e nuovi hash. Non congelare 144 prima di quel fix. Prossimo ID operativo del checkpoint: `u4-wave-amplitude-energy-01`, 141. Ancora 2.558 quesiti e 171 attività sul checkpoint; nessun nuovo credito dai lavori in corso. Human NOT_RUN, nuove pubblicazioni 0, 93 esami protetti. Mandato aperto.

Le sezioni seguenti sono snapshot storici.

## Checkpoint corrente — 2.048 quesiti e 214 attività, 25 novembre 2026

Generazione `90d05fb5bd0d0ffda8f110475c4b8af7d923e08987254f670e49ee4ec0476cc0`, manifest `a5aa43a38ec626635c91e45f81de4282b9b9bd2ab8d02be98601a112a3bf2a01`. Tutti i 4.606 quesiti e le 385 attività sono contabilizzati. **2.048 revisioni individuali DRAFT e 214 attività complete**; restano **2.558 quesiti e 171 attività**. U1, U2, U3 e U4-01 revisionati in bozza. Prossimo ID operativo `u4-wave-amplitude-energy-01`, lotto 141, distinto dall’ordinamento lessicografico della coda completa.

I nuovi 160 quesiti U4-01 trattano lunghezza d’onda, eco, periodo ridotto, massimi di velocità/accelerazione, energia, fase spaziale/temporale, intensità sferica ed energia incidente. Autori e verificatori distinti, 245 controprove, 400 configurazioni Hypothesis, ipotesi, unità, conti manuali, inverse e distrattori per ID. Corrette e rilette due motivazioni: il distrattore 36 di 132-15 omette q², e 1/4 in 138-01 omette il fattore p anziché invertire un rapporto uguale a 1. Chiavi/formule/figure e altri record invariati. Le 480 anteprime ROOT finali sono terminate con 0; le 48 di 138 rifatte sul nuovo hash e il vecchio report conservato come superato. Totale 6.186 anteprime valide: 6.144 quesiti e 42 per le 14 nuove edizioni di attività, tutte sul runtime f897.

Fresh e incrementale coincidono. Coesistenza di 2.062 edizioni nello stesso SQLite temporaneo, secondo import senza scritture e tutti i 991 pubblicati/live head/storia/tentativi invariati. Competency graph, diario, ripetizione distinta da trasferimento, autonomia distinta da aiuto e richiamo differito verificati solo su fixture private sintetiche. Nessuna misura di apprendimento reale.

Validazione locale: suite 481 test PASS sul precedente checkpoint 1888, più 11+11 test indipendenti dei nuovi 160 e 3 test della fixture storica (8,065s/2,626s/17,214s). La somma non è dichiarata una singola suite completa sulla 2048: la CI deve eseguire l’intera suite sulla SHA finale. Tutti i lotti scientifici e le integrazioni sono stati rivalidati dalla ricostruzione completa. Il nuovo supporto storico riproduce davvero i difetti f897 dal commit493df79 in un ambiente temporaneo vincolato per hash; nessuna asserzione dei vecchi test rimossa, nessuna firma storica applicata al runtime nuovo.

Il canone remoto contiene 1.728/204: PR #363 MERGED su `831b73fa71076b2e9b363006ffd94a350f22fe90`, head `493df796527bdb31b71f223343384656258e8e3a`, 24 SUCCESS/1 SKIPPED pre-merge e **14/14 post-merge SUCCESS** sui run 45540501792/45540501766, report versionato. Release 1728 SHA256 `a3b377d8f8fc07416d760c440be0ced950aa94f5c8ead1a851e316c3a52f9c4e`, zero sorgenti/figure DRAFT distribuiti. Questo 2048/214 è sul ramo `feat/cric-u3-surface`, ancora da integrare con release e gate della SHA finale.

Core e nuove edizioni sperimentali 118/119/140 restano isolate in `feat/cric-experiment-parameterization`, runtime finale 97cd2aba. Dopo il rilievo del revisore, il banco mostra ora i blocchi nel lettore esistente da Comprendi. 12 casi tecnici reali e 9 anteprime rinnovate sono riusciti; la revisione scientifica distinta delle 16 attività 037/038/041 è ancora in corso. I finding originali restano negativi e immutati. Quando il core sarà integrato, tutte le prove dipendenti dal runtime devono essere realmente rieseguite, senza ritag. U4-02 continua con ownership 141–147 e riformulazioni manuali dei logaritmi, fuori conteggio finché non supera i gate.

Dei 199 vecchi controlli tecnici, 97 hanno ora revisione completa e 102 restano parziali. Mancano 2.558 revisioni complete e 2.456 sole risoluzioni indipendenti: code distinte. Le 100 revisioni Pro restano NOT_IDENTIFIED. Human NOT_RUN, nuove pubblicazioni 0, 93 domande d’esame protette. Axe e fixture non certificano tutti i criteri WCAG/UDL o apprendimento reale. Mandato aperto: proseguire i contenuti senza attendere l’approvazione umana dei lotti precedenti. Le sezioni seguenti sono snapshot storici.

## Checkpoint corrente — 1.888 quesiti e 214 attività, 25 novembre 2026

Generazione `447461e5791774c155dcf8058f41b14f2e90a49e92b089a31aeffbdc00bb262e`, manifest `25f072fab56c8510b6a9d190d1ec890415138dc74b1976abe9bb0331dc3f567f`. Tutti i 4.606 quesiti e 385 attività contabilizzati. **1.888 revisioni individuali DRAFT e 214 attività complete**; restano 2.718 quesiti e 171 attività. U1, U2 e tutti gli shard U3 revisionati in bozza. Prossimo ID operativo `u4-wave-wavelength-01`, lotto130; l’ordine operativo per famiglie è distinto dall’ordinamento lessicografico del backlog.

Le 160 nuove revisioni U3-05 hanno autori e verificatori distinti: reti multistadio, colonna accelerata, forza su film, lavoro superficiale, Laplace per gocce e alveoli, surfattante, due gocce, capillarità, distacco e frammentazione.245 controprove, 400 configurazioni Hypothesis e 480 nuove anteprime ROOT con uscita 0. Corrette tre motivazioni: due confronti dimensionali e il prodotto newton per metro nel joule, senza cambiare chiavi. Riletti SVG e ipotesi per ID. Totale 5.706 anteprime registrate sul runtime f897:5.664 quesiti e 42 delle14 nuove edizioni di attività.

Dieci esperienze039/040 aggiunte: moti, secanti, caduta, parabola e accelerazione centripeta, con 118 casi nei consumer effettivi3D/fallback,160 configurazioni di controllo e 489 osservazioni temporali. Radicali semplici documentati mediante limiti razionali, istante di inversione distinto dalla derivata definita. Sono prove indipendenti delle attività originali, non nuove pubblicazioni. Nessun cambiamento di formule, parser o tolleranze in questo checkpoint.

Suite locale tracciata: **481 test PASS in 419,121 s**,75 moduli dello startingHead `ce4eaa150922a747e04b48d2b0d1eedb496384f3`, hash degli input invariati. Inventario, esito e trascritto riproducibile in `editorial/reviews/local-regressions-1888-20261125.json`. Fresh e incrementale coincidono. Coesistenza di 1.902 edizioni nello stesso SQLite temporaneo, secondo import senza scritture,991 pubblicati/live head/storia/tentativi invariati; adattività e diario solo su fixture sintetiche private. La prova130–134 aggiunta dopo lo snapshot ha 11 test mirati PASS in 8,065 s ed è fuori dai 481.

Il canone remoto contiene 1.728/204: PR #363 MERGED su `831b73fa71076b2e9b363006ffd94a350f22fe90`, head `493df796527bdb31b71f223343384656258e8e3a`,24 SUCCESS/1 SKIPPED pre-merge. Post-merge ancora in corso sui run 45540501792/45540501766: non dichiarare già14 PASS. Il canone precedente0970417 ha 14/14 post-merge SUCCESS. Release1728 SHA256 `a3b377d8f8fc07416d760c440be0ced950aa94f5c8ead1a851e316c3a52f9c4e`, zero sorgenti/figure DRAFT distribuiti. Questo1888/214 è sul successore `feat/cric-u3-surface`, da consolidare con i gate della SHA finale.

Le prove storiche037/038/041 restano fuori registro:95°/40° non manuali, separatori delle migliaia non copiabili e frecce con scale incompatibili. Core e nuove edizioni118/119/140 sono isolate sul ramo `feat/cric-experiment-parameterization`. Il revisore ha inoltre trovato che il banco ignorava i blocchi editoriali: corretto riusando il lettore esistente in un pannello disponibile da Comprendi, con 12 casi tecnici effettivi riusciti; revisione scientifica distinta ancora in corso. Il nuovo runtime non è integrato: dopo il merge richiede vera riesecuzione delle prove dipendenti, mai ritag di f897.

Tutti160 candidati U4-01 sono salvati con ownership disgiunta e review incrociata in chiusura. Correzioni dei feedback13215 e 13801 rilette dal revisore; gli altri contenuti e le chiavi non sono stati modificati. U4-02 continua sui112 ID reali nei lotti 141–147;140 è riservato all’attività. Questi lavori fuori registro non aumentano i conteggi del checkpoint.

Dei 199 vecchi controlli tecnici,97 ID hanno ora una revisione completa e 102 restano parziali. Mancano 2.718 revisioni complete e 2.616 sole risoluzioni indipendenti: code distinte. Le 100 revisioni Pro restano NOT_IDENTIFIED. Human NOT_RUN, pubblicazioni nuove 0,93 esami protetti. Axe e fixture non certificano tutti i criteri WCAG/UDL o apprendimento reale. Mandato aperto; proseguire senza attendere il gate umano di pubblicazione. Le sezioni seguenti sono snapshot storici.

## Checkpoint corrente — 1.728 quesiti e 204 attività, 25 novembre 2026

Generazione `98e03e39c8eef3963bb2c4e71da88a486601332574c0f9a908ac89cc5b9677fb`, manifest `2445ee1f9604a6b6a13ecd62305e83b42f1af4a0143a6e110cca857479b7f454`.
Contabilizzati tutti i 4.606 quesiti e le 385 attività. Revisioni complete: **1.728 quesiti DRAFT e 204 attività**; restano **2.878 quesiti e 181 attività**, tutte esperienze. U1, U2 e U3-01..04 revisionati in bozza. Prossimo ID del checkpoint: `u3-network-stages-01`, batch `network-stages-120`.

I 160 nuovi quesiti U3-04 coprono svuotamento, trasporto, Poiseuille, reti, dissipazione, profili, Couette e gradiente pressorio. Autori e verificatori distinti hanno risolto ogni ID: 245 controprove, 375 configurazioni Hypothesis, identità fresh/saved, domini, unità, inversi, conti manuali e distrattori. Due motivazioni testuali corrette dagli autori e rilette: una radice attribuita impropriamente a9 e la definizione dimensionale del pascal. Chiavi e formule invariate. I 480 casi browser finali sono terminati con0; due pacchetti rifatti dopo i feedback, con hash nuovi verificati. Totale5.226 anteprime valide:5.184 quesiti e42 delle14 nuove edizioni di attività. Profilo effettivo ancora f897, senza modifiche al runtime in questo incremento.

Sette esempi di copertura034 e tutti i dieci banchi035/036 aggiungono17 attività. Banchi verificati nei consumer reali:32 casi3D/fallback/stati limite,1.423 configurazioni contro oracoli indipendenti,28 esercizi distinti con conti manuali, unità e risposte errate/corrette. Le letture numeriche osservative sono distinte dai calcoli assegnati; radicali semplici possono essere delimitati con quadrati razionali. Il controesempio preliminare del piano è ritirato: la guardia UI già presente mantiene μd≤μs. Claim e correzione conservati, nessun fix runtime o credito prima della review completa. Axe e le fixture non certificano da sole tutti i criteri WCAG/UDL o apprendimento reale.

Suite tracciata: **415 test PASS in197,642s**; inventario dello startingHead `3af76dbd9000898f22708c62fe5cef45eb692fab` in `editorial/reviews/local-regressions-1728-20261125.json`. Fresh e incrementale identici. Coesistenza:1.742 edizioni nello stesso SQLite temporaneo, secondo import senza scritture, tutti i991 pubblicati, live head e storia invariati. Adattività su fixture private sintetiche, non su tentativi reali. Human NOT_RUN; nuove pubblicazioni zero;93 domande d’esame protette.

Prove storiche037/038 aggiunte fuori registro dopo la suite:16 test mirati PASS, senza accreditarne le attività.037 ha3PASS/3FAIL: due roundtrip dei numeri raggruppati rifiutati dall’input, un trasferimento95° non manuale.038 ha2PASS/2FAIL: altro95° e residui trigonometrici mostrati come componenti non nulle agli angoli esattamente ortogonali/antiparalleli. Il primo giudizio0383/1 è archiviato byte-identico e corretto esplicitamente. Questi difetti dei consumer sono distinti dalla correttezza delle leggi e dei valori della fonte. Non sono stati nascosti cambiando etichette o tolleranze.

Il canone remoto contiene1.568/187: PR#362 MERGED su `0970417edf5114b5cede22b12e94e1b5be306919`, head `b469b3b8f7ac0879236b98716b51d1e1a9b8e259`,24SUCCESS/1SKIPPED prima del merge e **14/14 post-merge SUCCESS** nei run45530466030/45530466044, report versionato. Release1568 SHA256 `3240d5e5568270c7993ad521068b95375b9af52452a4785994315bbd105c7a8c`, zero sorgenti/figure DRAFT distribuiti. Questo1728/204 è su `feat/cric-u3-viscosity`, ancora da integrare con i propri gate.

La patch per esperienze è separata in `/private/tmp/cric-experiment-contract-fix`, branch `feat/cric-experiment-parameterization`: nuova selezione didattica opzionale di due input sulla griglia, y sempre dalla legge installata e fisica/references immutabili; formatter copiabile senza punti delle migliaia; zeri geometrici esatti senza soglia globale sulle piccole quantità. Nuove edizioni118/119 ancora da produrre e verificare. La patch non è ancora integrata e cambierà il fingerprint: dopo il suo merge occorre rifare davvero le anteprime, non ritoccare f897 nei report. Il lavoro su039 e le esperienze successive continua.

Dei199 ID con vecchi controlli tecnici,88 sono ora completamente revisionati e111 restano parziali. Code distinte:2.878 revisioni complete mancanti,2.767 sole risoluzioni indipendenti. Le100 revisioni Pro restano NOT_IDENTIFIED. I160 candidati U3-05 fuori registro proseguono con review incrociata; U4-01 ha ownership130–139 e corrisponde a onde, courseC5, nonC3. Ownership non completa ID. Mandato aperto; pubblicazione e vera approvazione umana restano gate separati. Le sezioni seguenti sono snapshot storici.

## Checkpoint corrente — 1.568 quesiti e 187 attività, 25 novembre 2026

Generazione `dbd3d5d8473091ae0faf2d32ba1f76d001b35fb2540a380df0bd77e62d584ae8`, manifest `e297f6940fed78c6e46634870dbe1459e55c871bf68558075ab01a42c87818bc`.
Tutti i 4.606 quesiti e le 385 altre attività sono contabilizzati. Revisioni complete: 1.568 quesiti DRAFT e 187 attività; restano **3.038 quesiti e 198 attività**. U1, U2 e U3-01/U3-02/U3-03 revisionati in bozza. Prossimo ID da consolidare: `u3-reservoir-emptying-01`, batch `reservoir-emptying-107`. Il mandato rimane aperto.

I 320 quesiti aggiunti rispetto al canone 1248 hanno autori e verificatori distinti, risoluzioni individuali, ipotesi, controlli matematici e dimensionali, inversi, conti manuali e distrattori motivati. Le nuove famiglie comprendono galleggiamento, continuità, reti, pompa, Bernoulli e getti. Due feedback corretti dagli autori e riletti: un distrattore non era descritto dalla divisione inversa indicata e una frase ometteva l’uguaglianza u=−3. Nessuna modifica alle chiavi per eludere il controllo.

Quattro didascalie hanno fallito il reflow mobile: report e schermate NONPASS conservati; correzioni lette separatamente e 192 casi rifatti con uscita 0. I 960 nuovi casi dei quesiti hanno report validi e processi terminati con 0. Totale 4.746 anteprime sul medesimo runtime: 4.704 quesiti e 42 delle 14 nuove edizioni di attività. Formula termica inizialmente troppo larga su 320 px separata in tappe algebriche; fallimento conservato e sei casi rifatti. Nessuna asserzione o regola CSS allentata. Axe non certifica da solo WCAG/UDL o esperienza reale DSA/ADHD.

Le 58 attività aggiunte comprendono 12 lezioni, 40 esempi C4/C5 e sei esempi C6. Sei nuove edizioni correttive: C5-E008, E009, E017, E018 e C6-E003, E004; i rispettivi finding negativi sulle edizioni originali restano visibili, separati dalle prove delle bozze. Sono ora 14 problemi originali e 14 nuove edizioni DRAFT nel registro. Le nuove spiegazioni precisano tensione costante, geometria degli echi, risposte angolari esatte, bilancio termico senza falsa uguaglianza di arrotondamento e ipotesi del sensore. Nessuna edizione storica sostituita.

Suite tracciata: **371 test PASS in 165,423 s**, inventario degli input e startingHead `3e3f7907173254902f304db981eba19966734235` nel report `editorial/reviews/local-regressions-1568-20261125.json`. Le prove originali 034 aggiunte successivamente restano fuori registro e hanno controlli mirati separati. Fresh e incrementale coincidono. Coesistenza: 1.582 edizioni nel medesimo SQLite temporaneo, secondo import senza scritture, tutti i 991 pubblicati, live head e storia invariati. Adattività verificata con fixture private sintetiche, nessuna misura di apprendimento reale.

Il rilievo preliminare sul piano inclinato è stato ritirato: considerava soltanto il risolutore e non la guardia già presente nel consumer. L’handler mantiene μd≤μs prima di ogni solve; default e reset sono validi. Il controesempio diretto è fuori dal dominio raggiungibile del banco. Claim originale, motivazione del ritiro e hash restano tracciati, senza credito di completamento né modifiche al runtime. Proseguire la lettura completa dei consumer, senza inferire problemi di prodotto dai soli limiti dei parametri.

Il canone remoto contiene ancora 1.248/129: PR #361 MERGED su `8a2d7c5abf64753c69cdd8066a9dcc8302e03448`, head finale `d77132ba4a7966ee37a9ac23ef1a40ca28d9168c`, CI post-merge 14/14 SUCCESS sui run 45522773668 e 45522773758. Nessun bypass. Release 1248 SHA256 `0eb025ac3697804558ee11eb81dd8756aa7c14a5a5562c10faeb9d01f672fc5a`, zero sorgenti o figure DRAFT distribuiti. Questo incremento 1568/187 sul ramo `feat/cric-u3-buoyancy` richiede ancora release, PR e CI sulla SHA finale prima dell’integrazione canonica.

Dei 199 ID con vecchi controlli tecnici, 65 hanno ora una revisione completa e 134 restano parziali. Backlog completo 3.038 e sola risoluzione indipendente 2.904 sono code diverse. Le 100 revisioni Pro restano NOT_IDENTIFIED. Human NOT_RUN, nuove pubblicazioni zero, 93 domande d’esame protette. U3-04 nei lotti 107–116 e le prove di copertura 034 continuano fuori conteggio. Ownership assegna lavoro, non completa record. Proseguire senza attendere firme umane per l’authoring; pubblicazione separata. Le sezioni successive sono snapshot storici.

## Checkpoint corrente — 1.408 quesiti e 169 attività, 25 novembre 2026

Generazione `e2b6b54d3a4f665b5827076a5376e75c6f684e6a0800f24357c6d4eea1008f47`, manifest `afa4c8e8fb1ace0ef48722f55f10f598b86d104e2b1090f95a7979abcac629ef`.
Tutti i 4.606 quesiti e le 385 attività sono contabilizzati. Revisioni complete: 1.408 quesiti DRAFT e 169 attività; restano 3.198 quesiti e 216 attività. U1, U2 e U3-01/U3-02 revisionati in bozza. Prossimo ID: `u3-identical-branches-01`, batch `identical-branches-095`.

Le dieci famiglie 084–093 hanno autori e verificatori distinti, risoluzioni individuali, oracoli, controprove e procedimenti manuali. Quattro didascalie hanno fallito il reflow mobile: report e schermate NONPASS conservati, correzioni rilette separatamente, 192 casi rifatti con uscita 0. Gli altri sei pacchetti hanno 288 casi con uscita 0. Complessivamente 4.251 anteprime valide sul runtime effettivo: 4.224 quesiti e 27 delle nove nuove edizioni di attività. Le scansioni axe non certificano da sole WCAG/UDL o esperienza reale DSA/ADHD.

Dodici lezioni 023–026 e 28 esempi 027–030 aggiungono 40 attività. C5-E008v2 esplicita la tensione invariata nel confronto di potenze sulla corda; il finding originale resta negativo. Nove problemi originali e nove bozze corrette sono registrati separatamente. Fresh e incrementale producono lo stesso checkpoint. Coesistenza di 1.417 edizioni nello stesso SQLite temporaneo, secondo import senza scritture, 991 pubblicati, live head e storia invariati. Adattività verificata su fixture private sintetiche. I controlli mirati passano; suite completa e CI del prossimo consolidamento ancora da eseguire.

Il canone remoto contiene 1.248 quesiti e 129 attività: PR #361 MERGED su `8a2d7c5abf64753c69cdd8066a9dcc8302e03448`, head finale `d77132ba4a7966ee37a9ac23ef1a40ca28d9168c`. CI post-merge 14/14 SUCCESS, run 45522773668 e 45522773758, riportati in `editorial/reviews/ci-postmerge-1248-20261125.json`. Anche PR #360 ha 14/14 post-merge SUCCESS. Nessun bypass. Release 1248 SHA256 `0eb025ac3697804558ee11eb81dd8756aa7c14a5a5562c10faeb9d01f672fc5a`, nessuna sorgente o figura DRAFT distribuita.

Questo checkpoint 1408/169 è sul ramo `feat/cric-u3-buoyancy`, ancora da integrare. I 160 quesiti 095–104 hanno review scientifica e 480 anteprime con uscita 0, ma non sono ancora registrati. Le attività 105/106/117 avanzano separatamente. Ownership U3-04 nei lotti 107–116: assegna lavoro, non completa ID.

Dei 199 ID con controlli tecnici recuperati, 43 hanno ora una revisione completa; 156 restano parziali. Backlog completo: 3.198; sola risoluzione indipendente: 3.042. Le 100 revisioni Pro restano NOT_IDENTIFIED. Human NOT_RUN, pubblicazioni aggiunte zero, 93 domande d’esame protette. Proseguire con 1568 e tutto il corpus senza attendere firme umane per l’authoring. Il mandato rimane aperto. Le sezioni successive sono snapshot storici.

## Checkpoint corrente — 1.248 quesiti e 129 altre attività, 25 novembre 2026

Generazione `08f8b3c9bafed7a706577825ffb37b99b3410438ac7fe03e1d2bb64a68276a24`, manifest `c074bca3b71bca45a5944eef208519246f55f43568d52352f92f1d2ea1bfd3bc`.
Tutti i 4.606 quesiti e le 385 altre attività sono contabilizzati. Sono complete
1.248 revisioni individuali DRAFT e 129 revisioni di attività; restano **3.358 quesiti
e 256 attività**. U1, tutti gli shard U2 e U3-01 sono revisionati in bozza.
Prossimo ID da consolidare: `u3-archimedes-force-01`, lotto `archimedes-force-084`.

I 160 nuovi quesiti U3-01 sono collegati alle competenze e lezioni C2 reali. Le dieci
famiglie 074–083 hanno autori e verificatori distinti, ipotesi fisiche, passaggi
manuali, formule inverse e motivazioni dei distrattori per ID. Le 245 controprove
comprendono chiavi errate con binding e token rinnovati: gli oracoli le respingono
indipendentemente dalla sola firma. Corrette e rilette una negazione non universale
sul segno di un distrattore nel manometro e una frase che impediva erroneamente alla
profondità di variare lungo la colonna. Nessun PASS è basato sulla sola chiave fonte.
L'esposizione accidentale iniziale della chiave fonte di 079-01 è dichiarata nella
nota per ID; il risultato è stato derivato separatamente dal bilancio delle pressioni.

Il compilatore ha rifiutato 27 record concettuali con una nuova etichetta fuori
contratto. Il verificatore ha usato il valore previsto AI_CONCEPTUAL, conservando
le prove fisiche e tutti gli altri campi. Nessuno schema è stato ampliato o giudizio
promosso a EXACT_ORACLE. Nuovo test sul contratto: RED sui cinque report iniziali,
poi GREEN su tutti gli 80 record fresh/saved e sugli stessi pacchetti/binding.
La ripresa non ha contato il lotto rifiutato e ha mantenuto il checkpoint precedente.

La suite tracciata passa **248 test** in 187,420 s. Le 480 nuove anteprime sono
terminate con uscita 0; con i report precedenti validi sul medesimo runtime si
raggiungono 3.768 casi: 3.744 quesiti e 24 delle otto nuove edizioni di attività.
Ogni pacchetto ha isolamento ospite, formule, figure, reflow e controllo axe alle tre
larghezze; questo non certifica da solo WCAG/UDL o l'esperienza reale DSA/ADHD.
Fresh e incrementale producono lo stesso puntatore. Il collaudo comune importa
1.256 edizioni nello stesso SQLite temporaneo, ripete senza scritture e conserva
991 pubblicati, live head e storia. Nessun database o tentativo degli utenti modificato.
Le prove adattive sono fixture sintetiche private, non apprendimento osservato.

Le nuove attività 020–022 completano le lezioni C4 e le prime quattro C5; originali
e figure restano invariati. Otto problemi nelle edizioni originali sono tracciati
separatamente dalle otto bozze corrette: C1-E003, C1-E008, C1-L002, C1-L003, C2-E005,
C2-L007, C3-E003 e C3-E020. Approvazione umana NOT_RUN; pubblicazioni aggiunte zero;
93 domande d'esame protette. Nessuna delle 100 revisioni Pro è stata identificata.
Dei 199 ID con vecchi controlli tecnici, 22 hanno ora una vera revisione completa
attraverso i nuovi lotti; i restanti 177 sono ancora parziali. Il backlog completo
contiene 3.358 ID e quello della sola risoluzione indipendente 3.181: sono code diverse.

PR #360, lotto 960/105, è **MERGED** su `0d9f79696153838f3cc23b1fe6f3aece7dc5fcc8`.
La head verificata era `4490b7025bee534d1e2ed96b14c1e5c3bdce63cd`: 26 check SUCCESS
e uno SKIPPED prima del merge, senza bypass. La fixture web di revoca è stata
corretta dopo il RED reale: target 3/3, typecheck e suite web 893/893 PASS, review
indipendente. Un timeout successivo nel diario WebKit è stato seguito da un replay
locale completo sulle cinque configurazioni, 15 scansioni axe PASS; una sola
riesecuzione del job sulla stessa head è terminata SUCCESS, senza cambiare o saltare
asserzioni. Il timeout iniziale non è dichiarato PASS né si pretende di aver risolto
una causa non riprodotta. CI post-merge ancora in corso: corpus45515730354 e
Officina45515730416. Il canone contiene quindi 960/105, con verifica post-merge da chiudere.
La release 960 ricostruita conserva SHA256
`6c80f034b60ff03c59645e076218156ae973479ae72c65a95d93e7b4f56e6446`;
zero sorgenti o figure DRAFT nel pacchetto.

Questo incremento 1.248/129 e il checkpoint storico 1.088/119 sono sul ramo
`feat/cric-u2-closure`, ancora da integrare con una PR e i propri gate. I 160 candidati
U3-02 (084–093) sono tutti salvati; review incrociate in corso, non conteggiati.
Le lezioni successive 023–025 hanno prove salvate fuori registro e non aumentano129.
L'ownership assegna lavoro, non completa record; l'autorità resta il checkpoint.

Proseguire: chiudere la CI post-merge #360; integrare 1.248/129 sulla SHA esatta;
consolidare 1.408 dopo review completa di U3-02; continuare tutte le famiglie e le
attività residue, senza attendere firme umane per l'authoring. La pubblicazione
resta un gate separato. Le sezioni seguenti sono snapshot storici.

## Checkpoint corrente — 1.088 quesiti e 119 altre attività, 25 novembre 2026

Generazione `c0201cafe7ce3b2d7f9fcea13eff3e257419b5b6d4b9daa6bc19d1711877d1f3`, manifest `f6d246073d29b3aa3ebda873df32dc9821f1e32ecd934a110c1d86f91249279d`.
Tutti i 4.606 quesiti e le 385 altre attività sono contabilizzati. Le revisioni complete
in bozza sono 1.088; le altre attività riesaminate sono 119. Restano **3.518 quesiti
e 266 attività**. U1 e tutti gli shard U2-01..06 sono revisionati in DRAFT.
Prossimo ID da consolidare: `u3-pressure-area-01`, lotto `pressure-area-074` in U3-01.

Le otto nuove famiglie 065–072 coprono coppie di forze, gravità, orbite, discesa con
perdite, lancio elastico, urti e frenata. Autori e verificatori distinti hanno
congelato i singoli candidati dopo le correzioni; 196 controprove verificano anche
chiavi e binding falsificati in memoria. Conservate ipotesi, inversi, unità, passaggi
manuali e lettura fisica dei risultati per ogni ID. Le 14 lezioni aggiunte dai lotti
016–019 completano C3 e le prime quattro C4: 180 controlli esatti, originali invariati.
La controreview di elettrostatica conferma la distinzione tra carica libera e tensione
fissate per i dielettrici e tra conduttore in equilibrio e filo resistivo in corrente.
Le costanti tabulate arrotondate restano distinte dai valori SI esatti, senza inventare
una richiesta di calcolo decimale non presente nella lezione.

La suite tracciata passa **215 test** in 141,629 s. I 384 nuovi casi browser hanno
uscita regolare 0; con i report precedenti ancora validi sul medesimo runtime sono
3.288 anteprime: 3.264 dei quesiti e 24 delle otto nuove edizioni di attività.
Le ricostruzioni fresh e incrementale hanno gli stessi byte del checkpoint.
Nel medesimo SQLite temporaneo convivono 1.096 edizioni: secondo import senza
scritture, tutti i 991 pubblicati e la storia invariati, nessuna pubblicazione o
scrittura su database degli utenti. Le prove adattive sono fixture private sintetiche,
non evidenze di apprendimento reale. Le 93 domande d'esame restano protette.

Restano otto problemi nelle edizioni originali, affiancati da otto bozze corrette:
C1-E003, C1-E008, C1-L002, C1-L003, C2-E005, C2-L007, C3-E003 e C3-E020.
Approvazione umana NOT_RUN; nuove pubblicazioni zero. Le 100 revisioni Pro non sono
identificate; i 199 controlli recuperati rimangono parziali. Il backlog completo ha
3.518 ID, quello della sola risoluzione indipendente 3.319: sono code diverse.

Il canone remoto verificato resta 800/89 su `884c06422a570fc021401285550ad43ab0ecb132`,
con CI post-merge 14/14 SUCCESS. PR #360 contiene 960/105 sulla head
`4490b7025bee534d1e2ed96b14c1e5c3bdce63cd`, ma non è ancora MERGED: il job web ha
riprodotto una corsa nella fixture di revoca della sessione. La sola attesa del test
è stata corretta in una worktree dedicata; target 3/3, typecheck e suite web 893/893
PASS. La review indipendente conferma il fix; è stato pushato e la nuova CI sulla head corretta precede il merge.
Questo incremento 1.088/119 è sul ramo successivo `feat/cric-u2-closure` e richiede
la propria integrazione dopo #360. Nessuna prova locale è chiamata CI post-merge.

I 160 candidati U3-01 sono già salvati: review incrociate in chiusura e 480 nuove
anteprime in esecuzione; non sono conteggiati in 1.088. L'authoring U3-02 è iniziato
con ownership disgiunta su altri 160 ID reali, lotti 084–093. Il terzo revisore prosegue
le lezioni C4. L'ownership assegna lavoro, non completa record: l'autorità resta
`editorial/corpus/checkpoint.json`.

Proseguire senza attendere firme umane: concludere PR #360 con tutti i gate sulla SHA
finale e post-merge; integrare 1.088/119; consolidare 1.248 dopo la verifica completa
di U3-01; continuare U3-02 e tutte le famiglie residue. Le sezioni seguenti conservano
snapshot storici. La pubblicazione resta un gate separato.

## Checkpoint corrente — 960 quesiti e 105 altre attività, 25 novembre 2026

Generazione `debb91ed15d80c101a2c0fa244640b37ad78bfb1f6f70e12e768e0100170de7a`, manifest `36e7878ea400b1e243590d8f22b05948463fc3724775931369e7dcde69c51189`.
Contabilizzati tutti i 4.606 quesiti e le 385 attività:960 revisioni individuali DRAFT,
105 attività riesaminate; restano 3.646 quesiti e 280 attività. U1 e U2-01..05 completi
in bozza. Prossimo ID da consolidare: `u2-force-couple-01`, lotto 065 inU2-06.
I 128 candidati 065–072 hanno già review indipendente e 384 anteprime con uscita0,
ma restano fuori dal registro fino al prossimo incremento 1088. I 160 candidati U3-01
sono assegnati ad autori e verificatori distinti; non equivalgono a revisioni finite.

Le dieci famiglie 055–064 hanno evidenze individuali distinte dall'autore e
controprove su chiavi, binding, ipotesi, formule, unità e figure. Le 16 nuove lezioni
012–015 conservano tutte le edizioni storiche. C2-L007v2 esplicita stazionarietà,
sviluppo completo, dominio Newtoniano e no-slip prima di dedurre la parabola:
un controesempio laminare non stazionario e il controllo dell'integrale su anelli
distinguono questi requisiti. Le altre nuove lezioni termiche016/017 ed elettriche 018
hanno review già salvate, ma non aumentano 105 finché fuori dal registro.

Il collaudo congiunto ha trovato due falsi positivi del correttore: la normalizzazione
casefold confondeva M/m e V/v in opzioni fisicamente diverse. La selezione effettiva
ora conserva l'identità dell'opzione; il fallback testuale vale quando non ambiguo.
RED su tre controprove, GREEN su cinque test e tre test indipendenti, incluso il
consumer HTTP reale con 10 tentativi sintetici temporanei. Verificate 4.042 selezioni
su 241 choice originali e 603 registrate. Nessun tentativo reale è stato ricalcolato.

Il nuovo runtime ha richiesto il rendering di tutti i 65 pacchetti: 2.904 casi,
2.880 dei quesiti e 24 delle otto nuove edizioni di attività, alle tre larghezze.
Un processo 055 si è bloccato dopo i controlli nella pulizia finale: interrotto e
registrato NONPASS; il replay dello stesso pacchetto è terminato con 0. Gli altri 64
sono terminati con 0 nel run congiunto. Evidenza separata in
`editorial/reviews/browser-case-runtime-20261125.json`; nessun vecchio report rietichettato.
209 test editoriali e 18 workflow applicativi PASS. Fresh e incrementale hanno puntatori
identici. Il collaudo comune importa 968 edizioni, ripete senza scritture, conserva
991 pubblicati, live head e storia, non aggiunge tentativi reali o pubblicazioni.
L'adattività è provata con fixture private sintetiche, non con apprendimento osservato.

Otto originali conservano problemi espliciti: C1-E003,C1-E008,C1-L002,C1-L003,
C2-E005,C2-L007,C3-E003,C3-E020. Le otto nuove edizioni restano DRAFT; firme umane 0,
nuove pubblicazioni 0. Pro 100 non identificato; 199 controlli recuperati restano parziali.
Backlog completo 3.646 ID; coda storica della sola risoluzione indipendente 3.447 ID.

Canone verificato: PR #359 MERGED su `884c06422a570fc021401285550ad43ab0ecb132`,
800/89, post-merge 14/14 SUCCESS (corpus 45502678487, Officina 45502678472).
Il lotto960/105 richiede la propria PR, CI sulla head esatta e postmerge.
Le sezioni successive sono snapshot precedenti; prevale questo blocco corrente.

Priorità: integrare 960 con tutti i gate; consolidare 1.088 con i 128 finali U2 e le review
attività già pronte; completare i 160 U3-01 con verifica incrociata; proseguire
sistematicamente tutti i restanti ID, senza attendere firme umane per l'authoring.
Pubblicazione e approvazione umana rimangono gate separati.

## Checkpoint corrente — 800 quesiti e 89 altre attività

Generazione `bdd6171e789ceb7c06961ed7f9501545e818e011723291e5664de613c4c627ed`, manifest `9b90da6f221144ab1875116d230f6c19bca22e6609267b2925fe954265feb9bb`.
Tutti i 4.606 quesiti e le 385 altre attività sono contabilizzati. Sono completate
800 revisioni individuali DRAFT e 89 revisioni di attività; restano 3.806 quesiti e
296 attività. U1 e gli shard U2-01..U2-04 sono revisionati in bozza. Il prossimo ID
da consolidare è `u2-impulse-01`, lotto 055 in U2-05.

Le dieci nuove famiglie 044–053 hanno verifica distinta dall'autore per ogni ID,
con controprove che sostituiscono chiavi e binding in memoria per isolare il
controllo matematico. Corretti prima del freeze due distrattori equivalenti W/J/s,
una precisazione sul lavoro utile e la competenza primaria dell'energia elastica.
I 146 test editoriali passano. Tutte le 2.421 anteprime sono state riprodotte sotto
il protocollo finale: 2.400 casi dei quesiti e 21 delle sette nuove edizioni di
attività, a 1440, 768 e 320 pixel. Fresh e incrementale producono lo stesso puntatore.

La revisione delle prime quattro lezioni conserva due originali validi e due FAIL
editoriali di severità distinta: C1-L002 confonde il massimo della proiezione con
segno con il suo modulo; C1-L003 descrive come positivi anche gli estremi nulli di
un grafico. Le nuove v2 distinguono concordi/discordi, prodotti e proiezioni, e i
due diversi moti dei grafici x–t/v–t, con calcoli manuali e limiti espliciti. Le
figure storiche sono copiate byte per byte da Git nel pacchetto con tutti gli hash;
i file pubblicati rimangono intatti. Una falsa catena prodotta dallo splitter è
stata corretta prima del freeze usando formule autonome. Una scansione dei 640
quesiti precedenti non ha trovato gli stessi pattern; non è una prova semantica
generale su tutte le formule.

Il browser ora raggiunge ogni figura lazy prima di decodificarla, con deadline di
15 secondi. Il blocco a 320 pixel era nel collaudo delle lezioni lunghe; i run non
terminati sono stati abortiti e non dichiarati PASS. Il cambiamento del test hash
ha richiesto il nuovo rendering di tutti i lotti: non sono state rietichettate le
prove precedenti. Nessun CSS o renderer è stato modificato.

Il collaudo di convivenza usa lo stesso importatore canonico, in lotti di massimo
100, nello stesso SQLite temporaneo: 807 edizioni candidate, seconda importazione
senza scritture, tutti i 991 pubblicati e la storia invariati. Per ogni nuovo quesito
esercita grading e grafo e distingue ripetizione, aiuto, autonomia e trasferimento
differito con fixture sintetiche. Non crea tentativi studenti, apprendimento reale,
firme umane o pubblicazioni. Una lettura incoerente del registro è stata riprodotta
indipendentemente e corretta con uno snapshot unico; tre test e il replay del
controesempio confermano la correzione. La CI ripete il collaudo e confronta il report.

Sette originali pubblicati conservano un problema tracciato: C1-E003, C1-E008,
C1-L002, C1-L003, C2-E005, C3-E003, C3-E020. Le sette nuove edizioni sono DRAFT,
verificate separatamente; nessuna approvazione umana o pubblicazione aggiunta.
Il backlog completo contiene 3.806 ID, la vecchia coda solo indipendentSolution
3.607: i 199 controlli recuperati rimangono parziali. Pro100 non identificato.

PR #358 (640/85) è MERGED su `b919e130c77dd5ab19ca7712e8f37e5c708bc39e`, con
24 check SUCCESS e uno SKIPPED sulla head `73db9b1f0a18add3ee06eb103f98c2ffda6a242e`.
CI post-merge realmente SUCCESS: corpus45496024392 e Officina45496023935, 14 job
complessivi. Anche #357 ha concluso entrambi i workflow post-merge con successo.
Il nuovo incremento 800/89 è su `feat/cric-u2-energy`: PR, CI e merge propri ancora
da completare. I candidati U2-05 fuori registro non aumentano il conteggio800.

Prosecuzione:
1. Verificare HEAD remoto e concludere PR/CI/integrazione800/89 sulla SHA effettiva.
2. A autore055–059 (80 ID), B autore060–064 (80 ID), in worktree residenti isolati; revisione incrociata dopo l'authoring e root unico integratore.
3. Reviewer distinto sulle quattro lezioni C1-L005..L008, lotto012; dopo di esse proseguire le296attività del registro, senza aspettare firme umane.
4. Consolidare960 quesiti, continuare l'intero corpus e mantenere separati approvazione umana/pubblicazione; nessuna chiave o bozza nel prodotto pubblico.

Checkout attivo `/private/tmp/cric-resident-integrator`; worktree autore A/B
residenti fuori da iCloud. Il vecchio checkout della workspace è conservato ma
inattivo. Nessuna ricostruzione da un file dataless equivale a un recupero verificato;
il backup originale di config.worktree e le100revisioni Pro restano indisponibili.

## Checkpoint corrente — 640 quesiti e 85 altre attività

Generazione `66e0af717843b2f3188e8340e143ee6c10f5c44addb56b53a78c6af8490ac433`; manifest `6473c92448fc78a8e1d2bdcffca404234143d7a34da723b226106d03d25da5e8`.
Il registro contabilizza tutti i 4.606 quesiti e le 385 altre attività. Sono completate
640 revisioni individuali DRAFT e 85 revisioni di attività: restano 3.966 quesiti e
300 attività. U1 e i tre shard U2-01, U2-02, U2-03 sono revisionati in bozza.
Il prossimo ID da consolidare è `u2-parallel-springs-01`, lotto 044 in U2-04.

Le 1.935 anteprime private comprendono 1.920 casi dei quesiti e 15 delle cinque
nuove edizioni di esempi, ciascuno a 1440, 768 e 320 pixel. Ogni pacchetto registrato
ha verifica indipendente per ID, import canonico ripetuto senza nuove scritture e
preservazione dei 991 pubblicati, dei live head e della storia. Tutti i 116 test
editoriali passano; ricostruzione fresh e incrementale coincidono. I nuovi lotti
036–041 includono 147 controprove; due etichette dei pesi intersecate dai piani sono
state corrette dall'autore, rilette dal revisore e sottoposte a 96 nuove anteprime.

Cinque edizioni originali conservano un giudizio negativo esplicito: C1-E003,
C1-E008, C2-E005, C3-E003, C3-E020. Le cinque nuove v2 sono bozze separatamente
verificate. C3-E020 lascia ln 2 simbolico, esplicita il percorso reversibile
immaginato tra gli stessi stati e lo distingue dall'espansione libera reale.
L'aritmetica manuale è documentata, senza pretendere una valutazione numerica del
logaritmo. Nessuna firma umana o pubblicazione aggiunta.

Il nuovo campo additivo `pendingFullQuestionRevisionIds` elenca tutti i 3.966 ID
senza revisione completa; la coda precedente `pendingQuestionIds`, conservata per
compatibilità, riguarda soltanto la soluzione indipendente ancora NOT_RUN. La sua
lunghezza è 3.767: la differenza di 199 sono controlli recuperati ancora parziali,
non revisioni complete. Il test ha riprodotto l'assenza del nuovo campo prima della
correzione e passa sulla nuova generazione. Anche questo selettore è stato riletto
da un revisore distinto. Le 100 revisioni Pro restano non identificate.

PR #357 (544/69) è MERGED su `6ab24b975686fbfc72c1adefdad6845c48b1ce4d`, dopo 24
check SUCCESS e uno SKIPPED sulla head `7bcf2ccbb5266ef6cbd1ec9bef5e244a05859390`.
I workflow post-merge 45493606289 e 45493606308 sono ancora da verificare fino a
conclusione. Il nuovo incremento 640/85 è sul ramo `feat/cric-u2-contact`, con la
propria PR/CI ancora da completare. Non confondere autore, verifica AI, firma umana
e pubblicazione. I candidati fuori registro non incrementano il completamento.

Priorità operative:
1. Verificare CI post-merge di #357 sulla SHA 6ab24b97 e integrare 640/85 con PR e CI effettive.
2. Proseguire U2-04: A autore 044–047, B autore 048–051, root autore 052–053; review separata incrociata dei primi due gruppi e reviewer distinto sui 32 root.
3. Dopo le verifiche, consolidare 800 quesiti e proseguire le altre attività dal registro dei 300 mancanti, senza attendere firme editoriali umane.
4. Continuare l'intero corpus, accessibilità e percorso adattivo; nessuna pubblicazione automatica o modifica degli esami protetti.

Checkout attivo: `/private/tmp/cric-resident-integrator`. Worktree autore A e B
residenti fuori da iCloud. Vecchio checkout della workspace conservato e inattivo;
non riprendere il vecchio sequencer Git o leggere un file dataless come recuperato.
Il backup originale di config.worktree rimane indisponibile; nessun byte originale
acquisito o artefatto Pro recuperato viene dichiarato senza evidenza.

## Ripresa corrente — 544 quesiti e 69 altre attività

Generazione `446c3b28d505045e286a9523cf749bb897e836687c76b735fda01266c3797aff`, manifest `82ee5179209a9583a7dfd2d652a2aaf810db621ef55837c568678df31484d7ff`.
Tutti i 4.606 quesiti e le 385 altre attività sono contabilizzati; 544 quesiti hanno
revisioni complete DRAFT e 69 attività hanno riesame individuale. Restano 4.062
revisioni complete e 316 attività. U1, U2-01 e U2-02 sono revisionati in bozza;
U2-03 ha i primi 64 ID completati. Primo ID successivo: `u2-incline-acceleration-01`.

Le 1.644 anteprime private (1.632 dei quesiti, 12 delle quattro nuove edizioni di
esempi) sono riferite ai pacchetti e al protocollo attuali. Sono stati corretti
cinque testi/formule troppo larghi sui piccoli schermi; una seconda prova ha
localizzato nel prompt di Atwood una sequenza di definizioni senza spazi.
97 test editoriali, 55 Python applicativi, 260 Node e due dei contratti PASS.
Ricostruzione fresh identica all'incrementale, import idempotenti; tutti i 991
pubblicati, i live head e le versioni storiche preservati nei database di prova.

Quattro originali pubblicati conservano un problema esplicito: C1-E003, C1-E008,
C2-E005 (approssimazione idrostatica non dichiarata) e C3-E003 (uguaglianza usata
per un arrotondamento). Le nuove v2 sono DRAFT separatamente verificate. Il calcolo
originale di C3-E003 è manualmente fattibile: il difetto riguarda la precisione
presentata, non una necessità di calcolatrice. Nessuna firma umana o pubblicazione.

Il fingerprint delle prove include ora politiche d'esame e motori installati;
l'harness rifiuta override esterni non compresi nella prova e passa al processo
figlio il percorso assoluto dei motori verificati. Due controesempi indipendenti
sono stati corretti. Tutte le anteprime sono state riprodotte sotto il protocollo
finale; le prove precedenti non sono state rietichettate.

PR #356 è MERGED su `0b5f3a8bce91f1c9aa9ac273829bc6c67e72023c`; entrambi i workflow
post-merge sono SUCCESS (45478253510 e 45478253343). Questo incremento è sul ramo
`feat/cric-u2-orbits`, in attesa della propria PR/CI/integrazione. I candidati 036–041
fuori registro non incrementano le revisioni complete. Le 199 verifiche recuperate
restano parziali; le 100 revisioni Pro non sono identificate.

L'integratore attivo è `/private/tmp/cric-resident-integrator`, checkout dello stesso
repository fuori da iCloud; i due worktree autore residenti hanno ownership disgiunta.
Il vecchio checkout nella workspace è conservato per recupero, non è la copia attiva.
Le ricostruzioni da Git di file offloaded sono state verificate byte per byte; il
backup originale di `config.worktree` non è disponibile e i suoi byte non sono
stati acquisiti. Non dedurre da questo il recupero di artefatti scientifici mancanti.

Prossimi passi:
1. Verifica HEAD remoto, checkpoint e prove sulla SHA effettiva; completa PR/CI/merge di544/69.
2. Verifica indipendente incrociata dei48 ID A036–038 e48 B039–041; root unico integratore.
3. Completa i browser/import e checkpoint di640 quesiti; riesamina C3-E005..012 e prosegui.
4. Prosegui U2-04 e attività non riesaminate senza attendere approvazioni editoriali umane.
La pubblicazione resta un gate separato; nessun materiale DRAFT o esame protetto esposto.

# Checkpoint corrente — 416 quesiti, 45 altre attività

Generazione ee506766c87603c1be333fb3d4323b65a1346006c0d9b0959614fe8f1eec6f12.
Restano4190revisioni complete e340attività;1254anteprime private PASS,991pubblicati
inalterati, DRAFT/humanNOT_RUN, due originali E003/E008 ancora FAIL. U1 eU2-01
revisionati; U2-02 restano64ID027–030. Primo ID `u2-vertical-flight-01`.
A autore031–034 (forze/ascensore/dueblocchi/Atwood), B autore027–030 (volo/gittata/
unsecondo/frequenza), reviewer separato perB, rootreviewA e unico integratore.
Non contare candidati fuori registry. C1-E021..023 sono nel file degli esempi di
copertura e restano NOT_RUN: non dedurne assenza dal soloC1.json.

PR356 contiene320/37, con riparazione mirata fixture Insights f59c1f36 e pin runner
S19Ubuntu24.04 5ffe1655; leggere CI sulla head effettiva e poi post-merge.
Il nuovo incremento416/45 va su ramo separato, senza invalidare quel collaudo.
La storia sotto conserva snapshot precedenti; leggere sempre il puntatore attuale.

# Prosecuzione corrente — Cric, revisione di 4.606 quesiti

Checkpoint più recente:320/4606quesiti revisionati in bozza,37/385altre attività
riesaminate; restano4286revisioni complete e348attività. Generazionefa1bbebaa9e3638a04508c21adcf8bc70d6340e920a5d8a088aece0887c0d8d6.
U1 eU2-01 sono completati editorialmente;966anteprime terminali PASS. Le due nuove
edizioni C1-E003/E008 sono DRAFT e i FAIL dei due originali pubblicati rimangono
tracciati. Nessuna nuova pubblicazione o firma umana. Pro100 non identificato.

Primo ID da consolidare: `u2-freefall-speed-01`, sourcequestions/U2-02.json.
B scrive freefall-speed021/freefall-time022/vertical-maximum023; A scrive
circular-speed024/centripetal-acceleration025/circular-force026. Reviewer separato
da B per021–023; root/reviewer distinto per024–026. Non autoverificare gli ID.
Leggere registry/checkpoint e SHA GitHub corrente prima di proseguire. I blocchi
successivi di questo file conservano gli incrementi precedenti come storia.

Ultimo checkpoint:256quesiti revisionati e29altre attività riesaminate,
generazionec0ef6e38483d96d9421d448e7effd2c9eb43ab78291696916f74475d29417e19.
Restano4350revisioni complete e356attività. Le nuove edizioni di C1-E003/E008
sono DRAFT: i due originali ancora pubblicati conservano FAIL esplicito. Non
dichiarare100%manuale il pubblicato e non simulare approvazioni umane.

PR355 MERGED su ba6aec22008f2ac83de4959a6165bac5a8ee0a14, CI post-merge SUCCESS.
La continuazione è sul ramo feat/cric-u2-first-families.774anteprime fresche
con16lotti/4worker terminano exit0; precedenti processi di test fermi nel cleanup
sono stati registrati come run non riuscito, non come PASS. Registro unico ora
supporta revisionPackage delle attività, mantenendo source e candidate separati.

Primo ID successivo: `u2-equal-time-average-01`. Le quattro famiglie017–020 sono
candidate già recensite da A, autore B, ma ancora da consolidare con browser,
import e checkpoint; non incrementare il conteggio sulla sola review scientifica.
Leggere i report perID e le note di correzione prima di congelare altre versioni.
Tutti i385record restano contabilizzati, le199prove recuperate sono parziali e
Pro100 non è identificato. La storia sotto conserva gli incrementi precedenti.

Checkpoint più recente della continuazione:160/4606 quesiti riscritti (tuttaU1),
16/385 altre attività riesaminate (6 contenitori senza calcoli,10 percorsi di metodo).
480 anteprime private e import idempotenti; umanoNOT_RUN, nuove pubblicazioni0.
Restano4.446 revisioni complete e369 altre attività. Pro100 non identificato;
199 controlli recuperati ancora parziali. Leggere il puntatore e verificare gli hash,
non dedurre il completamento dai candidati presenti ma non registrati.

PR354 MERGED su f972c972ffdc8d229c2d55dc7cc43b8a335bf5a1; CI corpus post-merge
SUCCESS, job Officina da rileggere. PR353 MERGED su b0642d87 e CI post-merge SUCCESS.
Il prossimo ID da consolidare è `u2-uniform-displacement-01`. Due autori hanno
ownership disgiunta su U2; la verifica è affidata a revisori AI distinti dall'autore
per ciascun ID. I nuovi candidati fuori dal registro non sono ancora revisioni
complete. Conservare la coda DRAFT e le versioni Cric già live.

L'importazione di un ID Cric esistente deve preservare il vecchio live e tutte le
versioni: il runner ora prova anche questo caso, oltre ai nuovi ID AR. Le code
umane sono artefatti della generazione; nessun PASS concede approvazione o pubblicazione.
Le note sotto sono snapshot precedenti e non aggiornano i conteggi più recenti.

Aggiornamento operativo del 24 novembre: PR #352 MERGED su
`a599cc8c621ea5c2b8e62834cbe00419b4694b4f`, CI post-merge 14/14 SUCCESS.
La continuazione produce altri 32 svolgimenti (scale-002, vectors-003), portando
a 64 i quesiti riscritti e verificati; 4.542 restano da revisionare integralmente.
I 199 controlli recuperati sono parziali; Pro100 ancora NOT_IDENTIFIED; 385 altre
attività ancora da riesaminare. Non ripetere scale/sum già presenti nel checkpoint.

Il registro dei lotti è ora parametrico: leggere `editorial/batches/registry.json`,
poi validare con `python -m tools.corpus_engineering.batches`. Cache sorgente,
prove scientifiche e prove browser hanno invalidazioni distinte. Le 192 anteprime
sono legate al runtime e ai byte dei pacchetti. La PR #353 protegge le figure anche
dagli alias URL/filesystem; rileggere SHA, check e stato terminale su GitHub.

Primo ID successivo: `u1-vector-difference-01`. Ownership isolata e temporanea:
autore A = difference/perpendicular/scalar-product, 48 ID;
autore B = product/projection/angle-ratio, 48 ID. Root unico integratore;
reviewer indipendente dall'autore prima di congelare le firme. I candidati in
lavorazione non entrano nei conteggi completati. Non attendere approvazione umana
per lavorare sui lotti successivi; mantenere tutte le nuove edizioni DRAFT.

Le righe sotto descrivono l'ingresso precedente alla PR #352 e sono conservate
come contesto storico. Per conteggi e prossimo ID prevalgono checkpoint e questa
riconciliazione, riletti con GitHub e con le somme della generazione.

Mandato esplicito del proprietario del 24 novembre 2026. Target unico:
branch `officina-di-fisica`, directory omonima. Base `5d1dc8dc7b601aef959d10d564c75462be74708d`;
sorgente Ardesia main `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`.
Leggere [contratto, risultati e comandi](../../officina-di-fisica/docs/corpus-engineering.md)
e [checkpoint per ID](../../officina-di-fisica/editorial/corpus/checkpoint.json).
Questo ingresso sostituisce le vecchie priorità operative; non modifica i canoni
o gli stati editoriali. Le sezioni precedenti sono conservate sotto come contesto datato.

Sono contabilizzati 4.000+606 quesiti e 385 altre attività. Sono stati recuperati
199 controlli tecnici distinti e prodotti 32 nuovi svolgimenti importabili in bozza.
Il lotto Pro di 100 revisioni non è identificato: non dichiararlo acquisito.
Nessun nuovo materiale pubblicato, nessun database degli utenti modificato.
Il registro distingue fasi automatiche, review AI e approvazione umana NOT_RUN.
Restano 4.574 revisioni complete, incluse le fasi mancanti dei 199 recuperati.

Primo passo: rileggere GitHub per la PR del branch `feat/cric-corpus-engineering`,
la sua SHA e le CI; completare l'integrazione nel target prima di rivendicarla.
Poi continuare con `u1-scientific-scale-01` e gli altri 128 U1, secondo le cinque
priorità e i criteri di accettazione nel documento collegato. Non fermarsi alla
pipeline: ogni successivo incremento deve produrre contenuti effettivi e prove.
Le bozze sono sotto `editorial/`, mai `content/` o `static/`; i pacchetti riusano
il validatore/importatore e i prerequisiti/adattività dell'unica applicazione.

## Ingresso precedente — accettazione di Fluidi e termodinamica

Snapshot del28 ottobre2026, preparato prima del merge finale. Il mandato CHIUSURA1 riguarda l'intero corso. Leggere prima lo stato generato con `python3 bin/state/project_state.py`, poi la [PR336](https://github.com/AndreaMarro/ardesia/pull/336), il suo record terminale, l'ultima voce del [RUNLOG](ARDESIA-RUNLOG.md) e la [prova di integrazione](closure1-20261028/integration-evidence.json). Un PENDING datato non dimostra un blocco attuale: rileggere GitHub, main, CI e deployment.

1A è unico integratore/deployer;1B possiede contenuti e valutazione;1C plugin e laboratori. Nessun writer parallelo sugli stessi file. Corso:10 DS più la lezione originale con audio,57 obiettivi/0 approvati,16 modelli/17 collocazioni effettive,8 scene3D,199 quesiti/40 svolti/2 mock. La mappa concettuale49 link/45 obiettivi è distinta dalla disponibilità per lezione. Riutilizzare Core/ricevute, registry/ToolHost e WorkspaceStore. eLab non deve rientrare:332 è già integrata e il boundary gate resta obbligatorio; SDK/Core/S19 indipendenti sono conservati.

Preview controllata: https://ardesia-closure1-acceptance-preview.vercel.app . Il percorso al corso include `view=classroom&edition=closure1-fluidi-20261028`. Supabase Auth/PostgreSQL sono reali con tre identità sintetiche; SYNTHETIC_ACCEPTANCE e productionReady=false, nessun profilo ordinario. Nessuna credenziale nei report/Git; non leggere o copiare l'intero bootstrap privato, che contiene anche la password DB. Nessun auto-deploy di main o promozione produzione implicita.

Primo passo: leggere l'esito terminale336. Se non conclusa, verificare collaudo readonly/ingresso docente sul candidato combinato2bef6629, CI strict, main effettiva e CI post-merge, preview main e rollback; soltanto poi disposition331/333/334/335/337. Fonte originale e commit distribuito sono distinti. Tutti i required checks, strict, enforceAdmins e conversazioni risolte restano obbligatori; niente admin/force. Se336 è già integrata e provata, non riaprire la convergenza.

Priorità successive: approvazioni scientifiche/editoriali nominative e cinque stati in uso con Andrea; device/rete/budget concordati con tablet/penna/secondo hardware; pilota di cinque studenti con almeno4/5 compiti UX senza suggerimenti e transfer distinto; decisione esplicita su profilo ordinario/privacy/costi/conservazione. Review AI, screenshot,0 violazioni axe e100 campioni SwiftShader non sostituiscono questi gate. I57 obiettivi restano DRAFT fino all'accettazione richiesta.

Conservare tutte le prove datate, inclusi RED:669 corso/ACK/GET/guard/fonti/audio/esami/Studio export e replay dati; d57b Core axe e compat;392 matrice completa e Poiseuille ma replay visuale RED; b807 conferma seek e dati ma conserva zoom SDK e clippingCSS;2bef6629 integra nomi, apertura del file nella identità originale e reflow, con prova hosted PASS separata:percorso ordinario,seek/scroll,zero replay writes/hashstabili,canvasaxe0violazioni,ownlogout/oldcookie401. Il record terminale distingue questa fonte da main e dal rollback. Le20 incomplete axe Core richiedono esame manuale. §8 unsupported/missing e cache non diventano strict-ready. D52 è restore verticale controllato, non piattaforma DR standalone. D55 provider PASS ma worker operatore disabilitato: non cancellare originali confermati né riattivare il worker senza procedura e decisione specifiche.

Il vecchio handoff dei quattro corsi rimane nella [versione precedente](https://github.com/AndreaMarro/ardesia/blob/d57b7c45f8cb55ad473572589b2bf5c06f17d10d/docs/ops/NEXT-SESSION-PROMPT.md); questo incremento non accetta gli altri corsi. Prima di terminare aggiornare RUNLOG/NEXT con risultati, limiti, errori/correzioni,3–5 priorità e prove. AgentMemory esterno è cache opzionale e non certifica lo stato.


## Addendum documentale, 28 ottobre 2026 — PR #338 — sintesi visiva e requisito W0

Questo aggiornamento **non è un nuovo task di implementazione** e non sostituisce i gate e le priorità operative già aperte. [PR #338](https://github.com/AndreaMarro/ardesia/pull/338) raccoglie la [specifica integrale datata](../product/ARDESIA_specifiche_integrali_ricostruite_2026-10-28.md), l'[atlante HTML dei 36 mockup](../design/visual-reference-library/ARDESIA_atlante_visivo_36_modelli_2026-10-28.html) e l'[indice visuale/accettazione W0](../design/visual-reference-library/README.md). Tutti i file sono riferimenti progettuali: **non** un nuovo canon, un attestato di implementazione o un motivo per pubblicare la banca DRAFT.

**Come riprendere correttamente:** generare lo stato con `bin/state/project_state.py` nel checkout reale; verificare `main`, PR/CI/Vercel correnti; leggere `AGENTS.md`, [CANON-INDEX](../CANON-INDEX.md), le ultime voci del [RUNLOG](ARDESIA-RUNLOG.md), contratti CoursePack/Core e i gate della chiusura attiva. `RUNLOG` è indicato come lettura per gli agenti, ma la lettura automatica da ogni host non è attestata. `CURRENT.md` non si aggiorna a mano e AgentMemory non è una seconda fonte autorevole.

**Per la prossima chiusura visuale:** usare B03/B04/G01/B01 del 27 ottobre come criterio W0: foglio didattico, penna, fonte e revisione esatta, laboratorio indipendente manipolabile, salvataggio e cold reopen; la stessa risorsa nel Taccuino e nella Lavagna, senza nuovo DB, plugin registry o authoring. **Non ripristinare eLab** e non realizzare un clone integrale dei mockup. Le verifiche UX, sicurezza, prestazioni e collaborazione restano da eseguire su un candidato preciso.

**Quattro prossime azioni subordinate ai gate correnti:** (1) chiudere PR #338 con check e stato GitHub effettivo; (2) mappare B03/B04/G01 ai componenti reali senza implementare più di una lezione W0; (3) verificare permessi, revoca, nuovo dispositivo e ripresa nella prova sintetica remota già in sviluppo; (4) fare review grafico-pedagogica su browser e hardware disponibile, registrando RED/GREEN e `not_checked`. Non sostituire con questi suggerimenti i mandati operativi delle PR #331–#337.

Esito integrazione documentale338: main778e2ebbb6f5d8f6b836d799d8a3fdfc41e66a58 già verificata come origine dei riferimenti. Il task documentale338 è MERGED; la checklist storica di apertura resta uno snapshot. I riferimenti W0 non sostituiscono la chiusura336 e non assegnano nuove implementazioni. Il file HTML contiene36 immagini integrate, distinto dai36 PNG originali del27 ottobre.

## 21 novembre 2026 · Ritrovare l’Officina di Fisica

Per un lavoro sui sei corsi di Andrea usare il branch `officina-di-fisica`, directory `officina-di-fisica/`, tag `officina-di-fisica-v1.0.0`. Avviare la copia locale con `python3 app.py serve --open` dalla directory del prodotto. Il pacchetto ZIP contiene la sola Officina e il bundle conserva il repository autonomo. Lo stato degli studenti e le istruzioni bancarie reali appartengono all’installazione privata. Il verbale di collaudo, la matrice MUR e il README documentano l’edizione. [Indice](../../officina-di-fisica/README.md) · [Distribuzione](../../officina-di-fisica/distribuzione/) · [Registro di questo branch](ARDESIA-RUNLOG.md)

## Cric / Officina di Fisica · aggiornamento del 23 novembre 2026

Per questa applicazione partire dal ramo `officina-di-fisica`, dallo stato terminale della PR 339 e dalle verifiche riferite al commit integrato. Il capitolo e la voce sono le chiavi di navigazione dei laboratori. Il rapporto distingue risultati su Mac reale, viewport touch emulati e valutazioni umane ancora aperte. [PR 339](https://github.com/AndreaMarro/ardesia/pull/339) · [Revisione canonica](../../officina-di-fisica/docs/architettura/README.md)

Alla riapertura, attendere la valutazione di Andrea. I tre passi condizionati sono il collaudo touch/lettore di schermo su telefono fisico, la prova di comprensione con studenti e il collaudo di un modello editoriale scelto dal docente. Dipendenze e risultati attesi sono nell’ultima voce dedicata a Cric. [Registro](ARDESIA-RUNLOG.md)

## 23 novembre 2026 · Recupero formativo C1-Q027

Il percorso di riferimento è C1 → Esercizi prioritari → Aree di segno opposto → Inizia il quesito. Dopo un errore aprire **Prova il ritorno di 7 s**. La PR tecnica e il job Officina distinguono il collaudo del candidato da quello del ramo integrato. Per riprendere la valutazione, leggere prima il verbale, poi le tre prove aperte del registro: rubrica del docente, telefono fisico quando disponibile, pilot e trasferimento differito. [Verbale e istruzioni](../../officina-di-fisica/docs/recupero-c1-q027/README.md) · [Registro](ARDESIA-RUNLOG.md)

## Continuità · 23 novembre 2026

Per Officina partire dalla SHA effettiva del ramo `officina-di-fisica` e dalla PR tecnica della ricerca. Il contratto della ricerca distingue verifica automatica, ritorno alla sessione, regressioni scientifiche e prova con studenti. La priorità di prodotto successiva è il diario operativo dei recuperi su C1–C6, legato ai tentativi esistenti. [Matrice delle funzioni](../../officina-di-fisica/docs/verifica-prodotto/README.md) · [Prove e limiti](../../officina-di-fisica/docs/verifica-prodotto/ricerca.md) · [Registro](ARDESIA-RUNLOG.md)

## 23 novembre 2026 · Diario formativo

Partire dalla SHA effettiva di `officina-di-fisica`. Verificare il verbale di integrazione della ricerca sul merge `f31ef847` e l’esito della PR del diario. Il codice `9b5dc7e4` aggiunge il percorso operativo su tutti i sei microcorsi e conserva i registri precedenti. La matrice D1–D6 riporta il confronto su 513 quesiti, la riapertura della risposta originale e i limiti dei richiami nei cinque obiettivi con sole due famiglie.

1. Confrontare il commit integrato, i tredici job, il pacchetto verificato e il percorso reale con il verbale della PR.
2. Dalla base così verificata migliorare le modalità di lettura presenti, con accettazione anticipata e prove sul lettore canonico.
3. Tracciare separatamente gli esiti editoriali per ID, il collaudo touch fisico rinviato e l’osservazione dell’autonomia con studenti. [Evidenze](../../officina-di-fisica/docs/verifica-prodotto/diario.md)

## Officina · Lettura personale

Partire dal ramo ufficiale e verificare l’effettiva integrazione dell’incremento del lettore. I punti da riprendere nell’ordine sono il confronto con le prove della SHA di merge, la revisione delle spiegazioni per ID e il recupero grafico conservando i dati della simulazione. Per riprodurre la lettura aprire C6-L01 e il terzo passaggio sull’eco. Per il ritorno all’allenamento aprire C1-Q034. [Risultati, controlli e limiti](../../officina-di-fisica/docs/verifica-prodotto/lettura.md)

## Officina · Edizione C4 e banchi

Il codice dell’edizione C4 discende dal lettore integrato `250673b6`. Prima di proseguire riconciliare commit effettivo, CI post-merge e pacchetto. Per il confronto aprire C4-Q091 e il primo problema di LAB3D-07. La geometria e il recupero del contesto richiedono un incremento separato, con baseline reale per WebGL e tavola. Gli altri corsi conservano la loro revisione da svolgere per ID. [Contratto, prove per SHA e limiti](../../officina-di-fisica/docs/verifica-prodotto/edizione-c4.md)

### Officina · 23 novembre 2026, continuità dei banchi

Riconciliare base, PR e merge con GitHub. La revisione C4 ha verbale post-merge e ZIP identici sulla `d2c9e0a6`. Il banco recupera il contesto sulla sorgente `efef256b` con controprove di immagine, scelte manuali e letture. Proseguire con il registro editoriale degli altri corsi, la correzione delle voci motivate e la verifica dei collegamenti contestuali. Le prove con utenti e telefono fisico rimangono separate. [Contratto](../../officina-di-fisica/docs/verifica-prodotto/continuita-banchi.md)

### Localizzazione del controllo mobile del26novembre

Il replay completo con audit perID ha localizzato il FAILscrollable-region-focusable in SIM-C5-L03-02, formule9/11 dell’interferenza:334/283pixel in260disponibili. La precedente attribuzione all’adiabatica era un’ipotesi prima del dettaglio perID; l’adiabatica ha superato i4controlli di lettura, ma il cleanup del suo processo di test è stato terminato dopo185s con exit−15, quindi non è un test terminalePASS. Autore ha scomposto le due uguaglianze dell’interferenza in righe algebriche brevi, senza cambiare valori/16input/8SVG; verifica distinta e nuovo replay necessari. La correzione della triade delle guide temporali ha invece12casi browser terminaliPASS e24transizioni, più69test37,650s. Tutto rimane candidato isolato e credito attività0.

### Ripresa tecnica del collaudo3632,26novembre

Run45859734058 su99e98f49 terminaFAIL:1015test954,151s,1FAIL ASTdipendente da Python e1ERRORfixturestorica assente. Anteprime239/10947, fresh/incremental3632/246 e coesistenza sono PASS; releaseSKIPPED, checkpoint ufficiale resta3472. ZIP completo109850359byte SHA8d42d829baaf3c6ce2b1d2f9019b5036298d5fa44fbbf0db13cd79bccedc08a1 in3parti, ricevuta preintegration-failed-45859734058-20261126. Recuperato dal file localeCORE esatto il vecchio actual-runtime.json2143985byte/SHA172a24ec6a2cc3e486f73f13d21c4872abcff4711fe3fe388ccaaedc86c66cee, già fissato dal contratto c4b008;7testRootPASS0,848s senza modificare il test o le guardie. Afix4852c817 sostituisce il digest dipendente daast.dump con SHA della fonte esatta della stessa funzione55ff6aaa71fd195322e44745a9f17762d6ac745a1abe7dac5e739d69e4c0e5ca e ulteriori mutazioni:16testRootPASS5,420s, fonte identica anche suPython3.9.6. Nessuna legge, risposta, verifier o runtime cambiati. Retry totale suPython3.12 necessario; si riusano esclusivamente le239 anteprime autentiche compatibili del run fallito. NessunPASS complessivo anticipato.

Autoria consumer completa per17correzioni, ancora isolata:16dcfbe6/runtimeb2abff8e44eab69812c8c2a03c9876fdf49ae3dab2285f323303bcd3c1689e46,11contratti geometrici e80test generali27,918s PASS. Non sono17chiusure:300+contratti di separazione non equivalgono a nuove occlusioni dimostrate; review distinta e UI139/griglie/camere rimangono necessarie. Prova distinta5d749ec1 vale solo epocad9d1:9test,32UI/64input numerici/24transizioni guide e formule PASS, credito attività0; non ritaggare questa prova su b2. U701160bozze tutte scritte, peerreview in corso; prossime208assegnate daU702/U703. Verificati606Cric originali con93exam e64versioni2: tutti606payload identici al canone attuale, nessun credito scientifico aggiunto. Le loro nuove edizioni devono derivare dalla versione individuale, non da una base1 fissa.
