# Authoring DRAFT — oscillator-period-132

Tutti i 16 prompt originali di questa famiglia U4-01 letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605 prima della riscrittura. Le consegne sono autonome e le unità dichiarate; risultati interi, frazioni e radicali esatti, senza richiedere approssimazioni trigonometriche. Lezioni reali C5-L01/L02/L05 e C1-L005/L006 rilette; corso C5 e competenze esistenti, nessun ID inventato.

Autore soltanto. Review scientifica indipendente NOT_RUN, human NOT_RUN, publication DRAFT/NONE. Le note di calcolo seguenti aiutano il revisore e non costituiscono un oracolo indipendente o un’autofirma.

Controlli tecnici: due assembly identiche sui record e sui binding; importatore canonico ROOT con package assoluto A in SQLite temporaneo, 16 nuovi poi 0 nuovi/16 invariati. Tutti i 991 pubblicati, live heads e versioni storiche conservati. SVG XML e rendering completo letti dall’autore. Snapshot privata del runtime ROOT con fingerprint f897223d7afb4a9e09eb4fd06768e42e5b52bc131455fa678fbef74b4f39caa5 identica prima del run; medesimo harness b77d90368c3fa4d7fee43db65b402804615e0ba353f6514d699864e2cbd46372: 48/48 anteprime con exit 0, nessuna violazione di overflow, formule o axe. Questo non sostituisce il replay dell’integratore né certifica l’esperienza umana o l’apprendimento. Nessun registro o codice prodotto modificato.

## AR-u4-oscillator-period-01 — Una scala temporale diversa dal periodo

Il rapporto m/k è un quarto di secondo quadrato, perché N/m=kg/s². La radice positiva dà mezzo secondo. Questo è τ: il periodo completo contiene ancora il fattore 2π e vale π secondi, non mezzo secondo.

Controllo didattico d’autore: Un quarto è il numero di τ², non una durata; due secondi inverte m/k prima della radice. Inserire π nel risultato darebbe il periodo T quando si chiede τ. La radice negativa non è una durata fisica.

Source SHA256 9c24d2686e48202b4d3da42ab54a466b0bfb244735e6d251fb99ea198487a04c; candidato SHA256 7aadf3319330c60ca2785b4a01730758b46143841f5c88faf423534217f74655. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-period-02 — Che unità ha T diviso per 2π?

Due e π sono numeri puri. Dividere un tempo per 2π mantiene la dimensione di tempo. Anche √(m/k) dà secondi: il rapporto fra massa e costante elastica ha dimensione di tempo al quadrato.

Controllo didattico d’autore: Hertz è tempo inverso, s² è la dimensione prima della radice, N/m è k e kg è m. τ non è adimensionale soltanto perché il suo nome è «ridotto».

Source SHA256 202fce14fd870e36fbaa3c916ca868522e689ab325ce807fa92f5105d0fff49c; candidato SHA256 793e85c12a015524ecc097085c03739f1d4206ec93b45f38b2fa94b99b42ae8f. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-period-03 — Dalla forza di richiamo a τ

Il secondo principio lungo x dà ma_x=−kx, quindi a_x=−(k/m)x. Confrontandolo con la legge armonica a_x=−ω²x otteniamo ω²=k/m. Siccome T=2π/ω, dividere T per 2π lascia τ=1/ω=√(m/k).

Controllo didattico d’autore: 2π√(m/k) è T completo; √(k/m) è ω, non τ. m/k ha unità s²; l’ultima formula dà la frequenza f=1/T in hertz. Sono grandezze diverse, anche se nascono dallo stesso oscillatore.

Source SHA256 35d502dc6919dd7e48b9a456b500b3ef0aa939540660b2b847356a82da9bede2; candidato SHA256 e85978a6c381df9696c704eb6a618250394fd1c54ed9c4127811bb277c9c10da. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-period-04 — Una massa doppia sulla stessa molla

Raddoppiare m raddoppia τ², non τ. Il periodo ridotto passa da un mezzo a √(2/4)=√2/2 secondi. Si lascia il radicale esatto: non occorre stimare √2 in decimali. Anche T cresce del fattore √2.

Controllo didattico d’autore: Uno segue m linearmente, un quarto inverte l’effetto; due non rispetta il rapporto sotto radice. Mezzo ignora la massa nuova. Il modello lineare non richiede cambiare l’ampiezza per produrre questo fattore.

Source SHA256 caa8ca7e5446f601d01ef521380c15cac1128964ffc6affbc5b6830e3c6c4c85; candidato SHA256 118f7a59b9ca45a735b8619db0f0e17c61a273b1441ee74ee0e2137a509a92c4. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-period-05 — La massa da un periodo ridotto noto

Eleviamo τ al quadrato e moltiplichiamo per k: m=kτ². Quattro kg/s² per un quarto s² dà un kg. Se fosse stato fornito T completo avremmo prima dovuto dividerlo per 2π; qui τ è già la grandezza ridotta.

Controllo didattico d’autore: Moltiplicare k per il solo τ non dà massa; omettere il quadrato restituisce kg/s. Non bisogna introdurre un altro fattore 2π dopo aver ricevuto τ.

Source SHA256 420394f23a68b145be8413752aa0fa57d321e8ec4e9ab1ff08cf5d403a643fca; candidato SHA256 09f30b09c2c15123cb4df77f646ad7c92db6b3e0ff1ad853e416e34454e9c8a3. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-period-06 — La rigidezza da massa e τ

Dalla relazione τ²=m/k si ricava k=m/τ². Dividere un kg per un quarto di secondo quadrato dà quattro kg/s², equivalenti a quattro N/m. Sostituendo i dati si ritrova τ=1/2 s.

Controllo didattico d’autore: Un quarto moltiplicherebbe per τ² anziché dividere. Due dividerebbe soltanto per τ e avrebbe unità kg/s. Il k cercato è positivo per avere un richiamo stabile intorno all’equilibrio.

Source SHA256 4047b88731734e58509ea461689aaa158802acd09e490ea473411ba78532f0de; candidato SHA256 84ab586e85da07bc896ba0222258b8343a76bcbe324d0fd0650ae8dc2caed95a. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-period-07 — Una molla quattro volte meno rigida

A ha τ=1/2 s e B √(1/1)=1 s. Il rapporto è due: ridurre k a un quarto moltiplica m/k per quattro e la sua radice per due. Una molla più debole lascia un’oscillazione più lenta.

Controllo didattico d’autore: Quattro omette la radice, un mezzo inverte gli stati, un quarto segue direttamente k. Uno ignora il nuovo richiamo. Il rapporto fra T completi sarebbe lo stesso perché 2π si cancella.

Source SHA256 6de30b20d596b4d8b4dbd78eb1294497dd7b9cdfae6a3bbfea718af110a0bc84; candidato SHA256 492cf8d64ebb38460e9ccd3f8ae9ef8d4e5bb753aac1cb35d91f3b06a92c4d65. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-period-08 — Uno scarto fra durate ridotte

Il valore corretto è mezzo secondo. Un secondo meno mezzo secondo dà più mezzo secondo. Lo scarto confronta due valori di τ; non si sottrae il periodo completo π secondi a una proposta per τ.

Controllo didattico d’autore: Meno mezzo scambia l’ordine; uno conserva la proposta, tre mezzi somma e zero la accetta. Confondere T e τ cambierebbe invece la grandezza confrontata.

Source SHA256 7ef6dd6a8d4c89e84d71d613f78117d934c5b26506a29e0ab4e7fc09bc99a599; candidato SHA256 cee98a9e1e0c86b460e57bccdd3e91745f2b5d1918fbdaaf32eae3c5d9a3ee46. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-period-09 — Isolare m senza reintrodurre 2π

Poiché τ=T/(2π), la relazione ridotta è già τ²=m/k. Moltiplicare per k restituisce m=kτ². Il fattore 4π² apparirebbe in una formula scritta in funzione di T, non come moltiplicatore aggiuntivo di τ².

Controllo didattico d’autore: kτ ha unità kg/s; k/τ² kg/s⁴ e τ²/k s⁴/kg. 4π²kτ² conserva la dimensione ma sbaglia il coefficiente: l’unità giusta da sola non certifica l’algebra.

Source SHA256 9ce5076ae1e8490130cc64cac02a115f981dda9e9a4e5c3aa7ee037ff653d9ea; candidato SHA256 d196abebf1d844a30c3ce1292b27f0621dad456e9b9b0ceb8bd8ce3bad59032e. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-period-10 — Due fattori sotto una radice

Sostituendo nella radice, τ_B=√[(κ₁/κ₂)(m_A/k_A)]. Tutti i fattori sono positivi, quindi la radice del rapporto dei fattori si separa e τ_A si cancella. Rimane √(κ₁/κ₂).

Controllo didattico d’autore: κ₁/κ₂ omette la radice; il rapporto capovolto inverte massa e rigidezza. I prodotti rendono diretta la dipendenza da k, mentre una molla più rigida riduce τ a m fissata.

Source SHA256 f276f400ecd8a25657a70cb54bc34e933db04b1e8139c5bf0333b4d58b0f6ec0; candidato SHA256 eefccc841959c11a8ac08ba7629caf4a7234551822d212a58274c1531de957f7. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-period-11 — Massa maggiore e molla più debole

B ha τ=√(4/1)=2 s, mentre A ha 1/2 s. Il rapporto due diviso mezzo è quattro. Il fattore quattro della massa e il quarto della rigidezza moltiplicano m/k per sedici, la cui radice è quattro.

Controllo didattico d’autore: Due segue soltanto la massa o soltanto la riduzione della rigidezza; otto non è la radice di sedici. Un quarto inverte il confronto. Sedici è il rapporto fra i quadrati e omette la radice; due secondi sarebbe invece la durata B, non un rapporto puro.

Source SHA256 a1c740698d38fc70e70e2aeded26d371e2e70fbc64e50d254dd276ff0d126db1; candidato SHA256 7e7de74ff9a1f56922322ac5b44db2c968ca867982499656bef86fb83f30a019. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-period-12 — La media di due scale temporali

Le durate ridotte sono un mezzo e due secondi. Sommandole otteniamo cinque mezzi secondi; dividendo per due, cinque quarti secondi. Si mediano durate ridotte, non quadrati o periodi completi.

Controllo didattico d’autore: Cinque mezzi è la somma, tre quarti la semidifferenza e due la sola B. Gli ingressi medi m=5/2 kg,k=5/2 N/m darebbero τ=1 s, un quarto di secondo in meno della media richiesta.

Source SHA256 16f634603d3480a2cbb479a657429192b159a4e7930a98c4eb9a3d673f67c6ec; candidato SHA256 e9def42f0586dc401acf76ce175e375608c414166acefc5df6bc5780a63a790d. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-period-13 — La rigidezza per un’oscillazione più lenta

L’obiettivo è τ_B=2 s. Da k_B=m_B/τ_B² segue k_B=4/4=1 N/m. Rispetto ai quattro N/m iniziali il rapporto è un quarto. Al quadrato, il target richiede (τ_B/τ_A)²=16, non quattro.

Controllo didattico d’autore: Quattro inverte la variazione. Un mezzo omette parte del quadrato, uno conta soltanto la massa, un sedicesimo ignorerebbe la massa quadrupla. La rigidezza rimane positiva e il moto stabile nel modello.

Source SHA256 7ad4929f10babbefdee048623b73568224753a64cfbf79503433f663a5ffeebf; candidato SHA256 28f72244d63859e29af05425ac35d58d99ca06369ba59464fcba1bb1ee8304e4. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-period-14 — Un display tarato su τ

Il riferimento ha τ_A=1/2 s. Il guadagno è (3/2)/(1/2 s)=3 s⁻¹. La lettura sei rappresenta τ_B=2 s, non un periodo completo di due secondi. La massa è k_Bτ_B²=4 kg.

Controllo didattico d’autore: Sei è la lettura grezza e due è il numero di secondi di τ_B, non una massa. Confondere τ con T introdurrebbe 4π² nell’inversa. La taratura va applicata prima di elevare al quadrato.

Source SHA256 f79efade72d08579f845c88bc4ccdf9a36c4673569a60d2983576697b0f24680; candidato SHA256 155abe9a186fb131ebfe35f06d76b9f4f2c6ae41db750dbe0829d3d2e7d527c3. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-period-15 — Offset di una misura ridotta

A e B hanno τ=1/2 e 2 s. Il guadagno è (5−2)/(2−1/2) s⁻¹=2 s⁻¹, poi b=1. La lettura sette dà τ_C=(7−1)/2=3 s. La massa cercata è un kg/s² per nove secondi quadrati, cioè nove kg.

Controllo didattico d’autore: Tre copia il numero di τ_C, sette quello del display e quattro la massa B. Trentasei è il quadrato di S−b: omette del tutto la divisione per q² richiesta da m=k[(S−b)/q]².

Source SHA256 bd6e69aaa92c457d35f1e123ce3468faa683ae8fc831444d4db1b956bd0e0958; candidato SHA256 6ea0393a59102156534c2a2e53d4358ca6756959374310603f0fcc4612a4d8eb. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-period-16 — Stesso τ, molte masse e rigidezze

Il rapporto m/k vale b=1/4 s² in ogni prova. La misura τ=√b=1/2 s ripete il vincolo e non determina la scala di m o k. Per esempio 1 kg con 4 N/m e 4 kg con 16 N/m danno lo stesso τ, pur essendo sistemi diversi.

Controllo didattico d’autore: Due esempi non esauriscono la famiglia positiva continua. La coppia nulla è esclusa e darebbe un rapporto indefinito. Serve un dato indipendente di m o k per selezionare una coppia; b è dimensionato e non una costante adimensionale.

Source SHA256 63af74bcd5b1cc0568bb3435cfa50f789af31333d03eb175e0826d3aa49d02dc; candidato SHA256 1bb0f99f6ba5359ad3b98eb07cd72a3c31bc0fe44c5295c218107869bfed4ed3. Nessun giudizio scientifico indipendente attribuito all’autore.

Distinzione centrale: τ=T/(2π), T=2πτ. Il derivare ω²=k/m usa F=−kx e Newton, perciò i prerequisiti C1-L005/L006 sono trasferimenti espliciti. Nel grafico una fase 2π corrisponde al ciclo completo, mentre le barre sono solo τ. I casi 04 lasciano √2/2 s esatto e 16 mantengono b=1/4 s² dimensionato.

Il primo import è stato rifiutato correttamente perché answer.value del record01 era una stringa «1/2» invece di un numero JSON. Correzione strutturale d’autore a 0.5, che rappresenta esattamente 1/2; testi, formule, chiave matematica e figura invariati. Nuove assembly/import e 48 anteprime finali tutti su questo payload, nessun PASS attribuito al tentativo rifiutato.

Finding del revisore indipendente nel feedback 15: 36 è (S−b)² e omette completamente q². Dividere soltanto per q darebbe invece 18, non 36. Corretta solo la spiegazione e il feedback/error derivato, con nuovo binding 15. Altri 15 record, tutte le risposte, formule e SVG identici. Nuove assembly equivalenti, import canonico 16 poi 0/16 e 48 anteprime finali con exit 0 sulla correzione; nessuna firma scientifica dell’autore.
