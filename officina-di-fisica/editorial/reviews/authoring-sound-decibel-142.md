# Authoring DRAFT — sound-decibel-142

Tutti i 16 prompt originali di questa famiglia U4-02 letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605 prima della riscrittura. Le consegne sono autonome e le unità dichiarate; risultati interi, frazioni e radicali esatti, senza richiedere approssimazioni trigonometriche. Lezioni reali C5-L01/L02/L03/L04/L05 rilette; corso C5 e competenze esistenti, nessun ID inventato.

Autore soltanto. Review scientifica indipendente NOT_RUN, human NOT_RUN, publication DRAFT/NONE. Le note di calcolo seguenti aiutano il revisore e non costituiscono un oracolo indipendente o un’autofirma.

Controlli tecnici: due assembly identiche sui record e sui binding; importatore canonico ROOT con package assoluto A in SQLite temporaneo, 16 nuovi poi 0 nuovi/16 invariati. Tutti i 991 pubblicati, live heads e versioni storiche conservati. SVG XML e rendering completo letti dall’autore. Snapshot privata del runtime ROOT con fingerprint f897223d7afb4a9e09eb4fd06768e42e5b52bc131455fa678fbef74b4f39caa5 identica prima del run; medesimo harness b77d90368c3fa4d7fee43db65b402804615e0ba353f6514d699864e2cbd46372: 48/48 anteprime con exit 0, nessuna violazione di overflow, formule o axe. Questo non sostituisce il replay dell’integratore né certifica l’esperienza umana o l’apprendimento. Nessun registro o codice prodotto modificato.

## AR-u4-sound-decibel-01 — Dall’intensità al livello

Dividiamo prima le intensità: mille diviso dieci dà cento, cioè dieci al quadrato. Il logaritmo in base dieci di cento è due, perché due è l’esponente che produce cento. Il livello ha valore numerico dieci per due: venti dB. Non occorre usare una calcolatrice.

Controllo didattico d’autore: Cento è il rapporto delle intensità, non il livello. Due dimentica il coefficiente dieci; trenta usa tre come esponente, ignorando la divisione per il riferimento. Non si prende il logaritmo di una quantità con unità residue.

Source SHA256 16a1700efb9050203bbda77fba373ca54bff8b790a00042e0f62be75c6da534a; candidato SHA256 5067305d04f38ac7894ccf8d07eb96c9408c4893db7bd38f13da3a36bfe7929a. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-sound-decibel-02 — Che cosa misura il decibel

I e Iᵣ hanno le stesse dimensioni: il loro rapporto è puro e ammette il logaritmo. Il decibel indica la convenzione logaritmica usata per esprimere quel rapporto. Non è un’intensità, una pressione o un’energia; per risalire a I occorre conoscere anche Iᵣ.

Controllo didattico d’autore: W/m² appartiene a I; Pa a una pressione acustica e Hz alla frequenza. J misura energia. Il fatto che dB non introduca una nuova dimensione fisica non autorizza a sostituire il numero del livello al numero di un’intensità.

Source SHA256 998bef185d0fd1ee17275738767084cc988a622775925ea36d718336d38300e7; candidato SHA256 5dc9706371cbbbaf5e57754c0a4cfcee136947983052efe46cb10be1cf913a9e. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-sound-decibel-03 — Intensità fisica e sensazione sonora

La formula del livello assegna lo stesso L ai due rapporti I/Iᵣ uguali. La percezione, però, dipende anche dalla frequenza e dalla risposta dell’orecchio: l’uguaglianza del livello di intensità non prova l’uguaglianza della sensazione. Non stiamo usando una curva di ponderazione né facendo una valutazione clinica.

Controllo didattico d’autore: Cambiare unità di intensità non cambia il rapporto fisico. Il logaritmo non rende piatta la sensibilità dell’orecchio. Affermare livelli fisici sempre diversi confonde invece percezione e definizione matematica.

Source SHA256 bc44a74a07992e801c3c122278a55d4e682fefbfdd4fef4441f5ff2649b49229; candidato SHA256 5a1619a8980526141830abd87e57f7787996b0e86f9c31c94ea1dc17b25da967. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-sound-decibel-04 — Un’intensità dieci volte maggiore

I rapporti rispetto al riferimento sono cento e mille, cioè dieci alla seconda e dieci alla terza. I livelli sono venti e trenta dB. Moltiplicare l’intensità per dieci aggiunge dieci dB; non moltiplica per dieci il livello.

Controllo didattico d’autore: Duecento trasferisce al livello il fattore dell’intensità. Ventuno aggiunge uno al livello invece che all’esponente prima del fattore dieci. Dieci inverte l’aumento, mentre venti ignora il cambiamento.

Source SHA256 6f1e74b213fd6a82af211e5eb0ce32ffc7abb7b84fc3943fa0e5905fec2a8704; candidato SHA256 a0b73633a438cbf905dc21461918dd08b0b4d6883545718ad888813d93b01f0c. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-sound-decibel-05 — Invertire il logaritmo

Dividiamo il valore numerico venti per dieci: il logaritmo del rapporto è due. Per definizione del logaritmo, il rapporto è dieci al quadrato, cento. Moltiplicando per il riferimento dieci pW/m² si ottiene mille pW/m².

Controllo didattico d’autore: Duecento moltiplicherebbe direttamente Iᵣ per il numero venti. Cento è soltanto il rapporto puro. Un’intensità sotto il riferimento darebbe un livello negativo e non venti dB.

Source SHA256 185272f8ae1c804e0dd14f930fc55777acd2ae650e2e7d3ff27b703c06eb2a60; candidato SHA256 9b86a2fec3364d053c0966462dbf8de139a50191f531e4016ee367312b4e799b. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-sound-decibel-06 — Trovare il riferimento

Venti dB significa I/Iᵣ=100. Il riferimento è quindi mille diviso cento, dieci pW/m². Si controlla rimettendolo al denominatore: mille su dieci dà cento e restituisce il livello richiesto.

Controllo didattico d’autore: Centomila moltiplica invece di dividere. Cinquanta divide per venti confondendo livello e rapporto. Il riferimento deve avere le stesse dimensioni di I, non unità di dB.

Source SHA256 e87d014d120452e644a8400ff6d08dd3c57e3180854bf7bc5376fdc1c0b5ff6a; candidato SHA256 5ad9953d377fdbd1e5f8ad7c4bc16b6c6eb3d67e937f0df2004ac769ecd27da1. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-sound-decibel-07 — Cambiare solo il riferimento

Il primo rapporto è cento e dà venti dB; il secondo è mille e dà trenta dB. Il quoziente dei livelli, entrambi non nulli, è trenta su venti: tre mezzi. È un rapporto fra numeri di livello con riferimenti diversi, non un rapporto di intensità o di sensazioni sonore.

Controllo didattico d’autore: Dieci confronta i riferimenti invertiti o i rapporti di intensità, non i livelli. Due terzi scambia A e B. Uno dimentica che il riferimento del logaritmo cambia, pur restando uguale l’intensità fisica.

Source SHA256 18bd8a5600d797ec8ac060effba18023b112dd5e42817d16ae763052f295ad3e; candidato SHA256 fcfea27b5376a80c6e101a64d356039bf8177fbf5ef2bff1d55096fa1d8a4949. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-sound-decibel-08 — Il confine a zero decibel

Zero dB impone log₁₀(I/Iᵣ)=0. La potenza dieci alla zero vale uno: intensità e riferimento coincidono. Non è assenza di energia e non significa che un suono sia universalmente inudibile; qui il riferimento è una scelta assegnata.

Controllo didattico d’autore: Zero non è ammesso come argomento del logaritmo. Dieci e cento darebbero dieci e venti dB; un decimo darebbe meno dieci dB. Questo caso sostituisce esplicitamente la condizione L>0 degli altri confronti.

Source SHA256 cf85c2759128ab68a7a191a78ec7fdcad2ddc5729b99c65399f924b18c9af2d7; candidato SHA256 3d7478fe031a71d0300834ee3a9f579e6dd7e24fb0874f53806114deeadb4f3e. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-sound-decibel-09 — L’esponenziale che ricostruisce I

Dividiamo ℓ per dieci e applichiamo la potenza in base dieci a entrambi i membri: l’esponenziale annulla il logaritmo. Il rapporto I/Iᵣ diventa 10^(ℓ/10), poi si moltiplica per Iᵣ. L’esponente è puro e il risultato mantiene unità di intensità.

Controllo didattico d’autore: Il prodotto lineare con ℓ non inverte un logaritmo. Dividere per Iᵣ produce dimensioni inverse; dieci ℓ usa un esponente sbagliato. Un altro logaritmo non è l’operazione inversa richiesta.

Source SHA256 00c0d038a3cb8c07a6a4e2edebb4962a2ce7e9bc46d5ddb5f3e83030f645df2a; candidato SHA256 38a6905b5bf431a675b242e4476f742ec8dd66dfb351807f844c9d296d077fb2. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-sound-decibel-10 — Due cambiamenti nel rapporto

Il nuovo rapporto d’intensità è R_B. I due livelli hanno lo stesso coefficiente dieci dB, che si cancella nel quoziente. Rimane il rapporto fra i logaritmi, non il logaritmo del rapporto. R>1 garantisce il denominatore non nullo.

Controllo didattico d’autore: R_B/R e κ₁/κ₂ confrontano i rapporti prima del logaritmo. Il quoziente invertito scambia le prove. log₁₀(R_B/R) rappresenta la differenza dei logaritmi, non il loro quoziente.

Source SHA256 27272dc79cf4afde4d9fc1a85159e8069eb64ec222687bef864de208a1de4712; candidato SHA256 213af3a17dacc6602f1010a4dba9ea9ec887dd38a6447f0f01f2dae9bccfd5d5. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-sound-decibel-11 — Due livelli con riferimenti assegnati

A ha rapporto cento e livello venti dB; B ha rapporto dieci e livello dieci dB. Il quoziente dieci su venti è un mezzo. Entrambi i livelli sono positivi, così il confronto è definito.

Controllo didattico d’autore: Uno su cento confronta le intensità, un decimo confronta i rapporti rispetto ai riferimenti. Due è il reciproco. Uno ignora che un fattore dieci e un fattore cento hanno esponenti diversi.

Source SHA256 27d629e09730f15390ae147503c458aa1b7902535cec177013348b6325f92f79; candidato SHA256 90623004a28500dddd6ef79f9421d14b7529fb40d696efa718d6725bd0d1b3b5. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-sound-decibel-12 — Media statistica di livelli

I livelli assegnati sono venti e dieci dB. La loro semisomma è quindici dB. È una statistica dei livelli dichiarati; con riferimenti diversi non descrive da sola un’intensità media fisica e non rappresenta la somma di due sorgenti.

Controllo didattico d’autore: Trenta è la somma; dieci e venti copiano una sola prova. Tre mezzi è un rapporto, non la semisomma. Mediare I e Iᵣ prima del logaritmo cambierebbe il compito e non è richiesto alcun logaritmo non notevole.

Source SHA256 fc0427615f13f53f4efd13ccca7bb7ccb63971e6c4bc0c024c9d9052a1079584; candidato SHA256 c63ff60ddacdc77bf230c68bfd6e55679a9e081a4ef31c4f17c1c5fe2540bab3. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-sound-decibel-13 — Scegliere il riferimento per il bersaglio

Il bersaglio è dieci dB, quindi I_B/Iᵣ,B deve valere dieci. Con I_B=10 pW/m² il riferimento B vale un pW/m². Il suo rapporto col riferimento A di dieci pW/m² è un decimo.

Controllo didattico d’autore: Un mezzo dimezza il riferimento come se la legge fosse lineare. Dieci inverte il rapporto; uno su cento confonde il cambiamento di I con quello del riferimento. Due inverte inoltre il bersaglio sui livelli.

Source SHA256 ab4c298f133bd87ac5ad1b70e9d856a486176d219e28f6f1efcfe94804fe97a0; candidato SHA256 a04993dfc1c3103cb01fe6ff55f621cd9aafb66ba07554065d6054c63fa410e7. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-sound-decibel-14 — Un display proporzionale al livello

La prova A fornisce venti dB, dunque il guadagno è tre per dB. Trenta sul display corrisponde a dieci dB. Questo impone un rapporto d’intensità dieci; moltiplicato per il riferimento B di un pW/m² dà dieci pW/m².

Controllo didattico d’autore: Trenta non è il livello: manca la divisione per q. Usare Iᵣ,A al posto di Iᵣ,B darebbe cento pW/m². Le unità inverse di dB del guadagno rendono S puro.

Source SHA256 213177a914d3cb788ae7f0f6f92cdb4a4603ea27f75d02abf31eb67379eeb757; candidato SHA256 031574ba45b3e727ed9329dda0cd4cbb7a65613419af303b89f17e6bb4bd0c26. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-sound-decibel-15 — Offset, guadagno ed esponenziale

A e B forniscono venti e dieci dB. La differenza venti delle letture divisa per dieci dB dà q=2 per dB; poi b=1. C ha livello (61−1)/2=30 dB, rapporto mille e intensità dieci per mille, diecimila pW/m².

Controllo didattico d’autore: Mille copia l’intensità A, cento usa il rapporto del livello dieci dB e dieci copia il riferimento. Trecento moltiplica direttamente il numero trenta per Iᵣ: il livello deve invece diventare un esponente.

Source SHA256 c772d93734a6a014c3255a79c72726bd032a045534cd750da1242ecbb42359ea; candidato SHA256 c86940ea65f91562c10273049daa1c982838b7434206cc753f8c2f8764e610b2. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-sound-decibel-16 — Un livello non identifica la scala

Sostituendo il vincolo, il rapporto è sempre cento e il livello è sempre venti dB. La misura conferma il vincolo ma non determina la scala assoluta: riferimenti uno e dieci pW/m² generano intensità cento e mille pW/m², entrambe valide. Moltiplicare entrambi per lo stesso fattore positivo non cambia L.

Controllo didattico d’autore: Una sola coppia attribuisce al livello un’informazione assoluta che non possiede. Zero come riferimento è vietato e due esempi non esauriscono le infinite scelte positive. Nessuna contraddizione nasce dal dato ridondante.

Source SHA256 8fe63ef1c0114677bc1f118cd62cd4c9a2f94d154f2072529da0e5f2aa6d04ea; candidato SHA256 93d14a8e83c2669705fcfb90922e825e6fa21ca2f5292ef98e4a2f57f4e00e22. Nessun giudizio scientifico indipendente attribuito all’autore.

Parametrizzazione editoriale dichiarata: intensità in pW/m² al posto dei W/m² numerici della fonte per valori sonori plausibili; riferimento assegnato, non automaticamente soglia uditiva. I rapporti e i compiti dei primi casi sono conservati. Nei casi 11–15 la fonte richiedeva manualità con potenze di dieci ma assegnava alla prova B il rapporto 2: qui B usa I=10 pW/m² e Iᵣ=1 pW/m², rapporto 10, con bersagli e letture coerentemente riscritti. Nessun logaritmo non notevole è richiesto nella nuova prova. Il caso 08 include esplicitamente il confine, separato dalla condizione positiva degli altri confronti. Nel 12 la media dei livelli è statistica, con riferimenti dichiarati diversi; non è una somma energetica. Nel 16 il livello conferma un vincolo ridondante e non identifica la scala. SVG: asse di R logaritmico, asse del livello lineare a 10 px/dB; 100 px indica fattore dieci in R.
