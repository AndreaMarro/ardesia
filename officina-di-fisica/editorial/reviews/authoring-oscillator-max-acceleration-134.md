# Authoring DRAFT — oscillator-max-acceleration-134

Tutti i 16 prompt originali di questa famiglia U4-01 letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605 prima della riscrittura. Le consegne sono autonome e le unità dichiarate; risultati interi, frazioni e radicali esatti, senza richiedere approssimazioni trigonometriche. Lezioni reali C5-L01/L02/L05 rilette; corso C5 e competenze esistenti, nessun ID inventato.

Autore soltanto. Review scientifica indipendente NOT_RUN, human NOT_RUN, publication DRAFT/NONE. Le note di calcolo seguenti aiutano il revisore e non costituiscono un oracolo indipendente o un’autofirma.

Controlli tecnici: due assembly identiche sui record e sui binding; importatore canonico ROOT con package assoluto A in SQLite temporaneo, 16 nuovi poi 0 nuovi/16 invariati. Tutti i 991 pubblicati, live heads e versioni storiche conservati. SVG XML e rendering completo letti dall’autore. Snapshot privata del runtime ROOT con fingerprint f897223d7afb4a9e09eb4fd06768e42e5b52bc131455fa678fbef74b4f39caa5 identica prima del run; medesimo harness b77d90368c3fa4d7fee43db65b402804615e0ba353f6514d699864e2cbd46372: 48/48 anteprime con exit 0, nessuna violazione di overflow, formule o axe. Questo non sostituisce il replay dell’integratore né certifica l’esperienza umana o l’apprendimento. Nessun registro o codice prodotto modificato.

## AR-u4-oscillator-max-acceleration-01 — Il richiamo è massimo agli estremi

Il modulo di x non supera l’ampiezza A. Dalla relazione a_x=−ω²x segue che il massimo modulo dell’accelerazione è ω²A. Due al quadrato per un metro dà quattro m/s². A x=+1 m l’accelerazione è −4 m/s²; a x=−1 m è +4 m/s²: il massimo modulo è lo stesso.

Controllo didattico d’autore: Due userebbe una sola ω e produrrebbe una velocità. Otto raddoppierebbe ancora il valore; zero vale al centro e non agli estremi. Agli estremi la velocità è momentaneamente zero proprio quando il modulo dell’accelerazione è massimo.

Source SHA256 47cdfc70ab23b370f1cadde03c1c36bc594713c26352b9186fb8cfd291383b8c; candidato SHA256 7507a0733db09e637ce30fcb1a17e7ae232c3d11637c738c56e75812beec4069. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-acceleration-02 — L’unità di un’accelerazione massima

L’accelerazione ha dimensione di lunghezza su tempo al quadrato. Nel prodotto ω²A la pulsazione al quadrato ha dimensione s⁻², perciò moltiplicando per un’ampiezza in metri si ottiene m/s². Prendere il massimo del modulo non cambia le unità.

Controllo didattico d’autore: m/s è velocità, m ampiezza, rad/s pulsazione e N forza. Per trasformare un’accelerazione in forza serve anche una massa, che non è richiesta da questo problema.

Source SHA256 e6c0103210111cad652b6e7bb36b3d625713edc3dce7f28450ee794b5921999d; candidato SHA256 7ae8ad85183961911008f09f3682608ae2ee4fb4697028c7aa7ca056ab1c0fde. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-acceleration-03 — Una seconda derivata introduce ω²

La prima derivata della posizione dà la velocità, la seconda l’accelerazione. Si ottiene a_x=−ω²A cos(ωt+φ)=−ω²x. Durante il ciclo il coseno raggiunge modulo uno e quindi a_max=ω²A, sempre positivo nel dominio assegnato.

Controllo didattico d’autore: ωA è v_max. A/ω² ha unità m·s² e ω²/A unità 1/(m·s²). Un fattore due aggiunto scambierebbe ampiezza e distanza fra gli estremi, mentre il massimo di |x| è A.

Source SHA256 98947284134473824a38bd03045724d639948d8308d3c4fc3d0b113075081635; candidato SHA256 276e5cbb7a24ef1cabe3f6151c6d7efefa896887378379298db84cf0e0d902c7. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-acceleration-04 — Ampiezza tripla, stessa pulsazione

La pulsazione al quadrato resta quattro al secondo quadrato. Il massimo spostamento diventa tre metri, quindi l’accelerazione massima passa da quattro a dodici m/s². La dipendenza da A è lineare anche se quella da ω è quadratica.

Controllo didattico d’autore: Trentasei quadra il fattore tre dell’ampiezza, quattro terzi lo inverte e quattro ignora la modifica. Sei non applica il fattore tre. Il segno dell’accelerazione a un estremo resta opposto a x, ma qui si confrontano moduli massimi.

Source SHA256 be0a3e8d3d4d7e6792260b3fa1c2e44f223a6e7b9cd69a8531efb93de0dd03eb; candidato SHA256 85ac253d1e70fe69a3c66f05aeb05cc8d015626d1a4f98fef278f3e07accfaaa. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-acceleration-05 — L’ampiezza ricavata da a_max

Dividiamo a_max per ω², non per la sola ω. Quattro metri al secondo quadrato diviso quattro al secondo quadrato restituisce un metro. È l’ampiezza da centro a estremo; la distanza fra gli estremi sarebbe due metri.

Controllo didattico d’autore: Due ottenuto dividendo per ω avrebbe in realtà unità m/s, non di ampiezza. Due metri sarebbe anche la distanza fra gli estremi: quel dato geometrico non sostituisce A. Nessuna radice di A è richiesta nell’inversa.

Source SHA256 485b243093f7b247e7ab12e93589f6fe5c1bc39fdb96e4d92737ddc06c6a4d83; candidato SHA256 a69e30ab3162e7779447f66f235dd428f94adadc794571d1311c79de0455bdfb. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-acceleration-06 — Scegliere il ramo positivo della pulsazione

Prima isoliamo ω²=a_max/A=4 s⁻². Solo dopo estraiamo la radice: due rad/s. Il numero quattro è la pulsazione al quadrato. La soluzione negativa dell’equazione quadratica non appartiene alla convenzione ω>0.

Controllo didattico d’autore: Quattro rad/s darebbe sedici m/s², mentre un mezzo rad/s darebbe un quarto m/s². La frequenza in hertz sarebbe 1/π Hz, distinta da ω: non si rimuove un 2π inesistente dai dati.

Source SHA256 21c923556ec2afe86ca35e3a4bf50ce7489c90e619c5f9656dbec00122518ac8; candidato SHA256 93ff8a34944bc86840df0f4541b0f2dba8ccf59f0dcb901bdadfb49ee12a3c09. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-acceleration-07 — Pulsazione dimezzata

La pulsazione si dimezza e il suo quadrato diventa un quarto. I massimi moduli sono quattro e uno m/s²: il rapporto B su A è un quarto. La velocità massima, che contiene una sola ω, si dimezzerebbe invece.

Controllo didattico d’autore: Un mezzo segue la legge della velocità massima, quattro inverte il rapporto corretto e due inverte quello lineare. Uno ignora il cambiamento. Il confronto non riguarda il segno di a_x.

Source SHA256 616e9b165511214846b8da25d531e5261d4d294d512c6f04856f34fe154e8fd1; candidato SHA256 c348c5afb5e5805df14baf6e5b60faed31e2c1e76fafb6cd4676d2f8f410fe24. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-acceleration-08 — Scarto di una previsione doppia

Il massimo modulo corretto è quattro m/s². Otto meno quattro dà più quattro m/s². Non si sottrae l’accelerazione orientata negativa di un estremo: la proposta riguarda a_max, un modulo positivo.

Controllo didattico d’autore: Meno quattro cambia l’ordine, otto mantiene la proposta, dodici somma i moduli e zero accetta il valore doppio. Lo scarto può avere segno pur confrontando due moduli.

Source SHA256 c4ec8dda317b199b8261ef79e887b832c188d1ac1eec61dbe04f30c5368dc955; candidato SHA256 1cee22f7c69b82b3ed6c70e6b30f5184d0cda3b11ea32a0a9476c54efbebd4a2. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-acceleration-09 — Isolare l’ampiezza senza una radice

A compare alla prima potenza nel prodotto ω²A. Dividere per ω²>0 dà A=a_max/ω², con unità metri. La radice servirebbe a ricavare ω, non A.

Controllo didattico d’autore: Dividere solo per ω dà velocità; moltiplicare per ω² dà m/s⁴, il reciproco una lunghezza inversa. La radice del rapporto corretto avrebbe dimensione radice di una lunghezza, non una lunghezza.

Source SHA256 6413fc4bd34f1ac4cdcd2b15742fa6b7c544e23262b9060f699133ae3b37a84b; candidato SHA256 b6c5d398ac829dbf2ecc3a4f6b6fcaa8142050b45ecde7f16efa0cc83e7ab9ca. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-acceleration-10 — La pulsazione porta due fattori

Sostituiamo entrambi i parametri: a_max,B=(κ₂ω_A)²κ₁A_A. La pulsazione fornisce κ₂² e l’ampiezza κ₁; il rapporto è κ₁κ₂². Una fase iniziale diversa cambierebbe gli istanti, non questo massimo.

Controllo didattico d’autore: κ₁κ₂ perde una pulsazione; κ₁²κ₂ quadra l’ampiezza sbagliata. I quozienti rendono inversa una dipendenza che nel massimo modulo è diretta.

Source SHA256 520a814edd41e96daef6b345f554549b0925529b7395ad903b3a75a91f52bea2; candidato SHA256 79e6d52b4968c46d91e48a3cb5aed74308f9d1d459c43f8bc70f92dc370fdcda. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-acceleration-11 — Due parametri aumentano il massimo

A dà quattro m/s². B dà tre al quadrato per due, diciotto m/s². Il rapporto diciotto quarti è nove mezzi, uguale a due volte il quadrato di tre mezzi.

Controllo didattico d’autore: Due noni inverte il confronto, tre segue soltanto il prodotto lineare dei fattori. Due considera solo l’ampiezza e nove quarti solo la pulsazione al quadrato. Entrambi gli effetti vanno inclusi.

Source SHA256 1f144a8ff7fa455d11d864823c75f7ff413172f2d072569653e97ca2670228d2; candidato SHA256 e3b2c92f660228f3bde6d8f5135e67ac2110bd9b22ed0eafd60d0f6c3f4d4706. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-acceleration-12 — Media dei massimi, non media nel ciclo

I due massimi moduli quattro e diciotto hanno media undici m/s². Non è l’accelerazione orientata media durante un ciclo, che sarebbe zero per il ritorno alla stessa velocità. Si mediano due parametri positivi di prove diverse.

Controllo didattico d’autore: Ventidue è la somma, sette la semidifferenza e diciotto la sola B. Usare ampiezza media 3/2 m e pulsazione media 5/2 rad/s darebbe 75/8 m/s², inferiore alla media richiesta di 13/8 m/s². Le unità corrette non rendono equivalenti i due procedimenti.

Source SHA256 1c389a8a041a6d03aa7dfda5d0f3d47a64098fcc2d868bc68612d95a5056dcdc; candidato SHA256 d1c46f59d1fd68147fcedb2b212987947750233de664b87b7dd5846726a37cc5. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-acceleration-13 — La pulsazione per un’accelerazione obiettivo

Il fattore due dell’ampiezza lascia nove quarti da ottenere dal quadrato della pulsazione. La radice positiva di nove quarti è tre mezzi. Infatti ω_B=3 rad/s e a_max,B=18 m/s².

Controllo didattico d’autore: Nove quarti è il rapporto ancora al quadrato, due terzi il reciproco. Nove mezzi copia il target e tre il numero di ω_B in rad/s. Il ramo negativo della radice non è ammesso dalle pulsazioni positive.

Source SHA256 2736069471f99a0fc7fc099ff7dc9c2c970fcc1d149fd11588763c020d51f31a; candidato SHA256 3c0d7a0704e080547cc6c0a74e624472b140ce5259fd1a748b828232374e27f6. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-acceleration-14 — Il display misura un’accelerazione

Il riferimento ha a_max=4 m/s², quindi q=3 s²/m. La lettura cinquantaquattro corrisponde a diciotto m/s². Dividendo per nove s⁻² si ottengono due metri di ampiezza.

Controllo didattico d’autore: Cinquantaquattro è la lettura grezza, diciotto il numero di un’accelerazione, tre quello della pulsazione. Trattare S come accelerazione triplicherebbe l’ampiezza a sei metri. La taratura non elimina il quadrato di ω.

Source SHA256 09014f273109b88cea5dc878717691052d3eacb7e3e950791230e5d95561f19c; candidato SHA256 c5b5fb90fd8e0a6dae9262b752af13c3ebfa0f417df8e6c17cc45f191ccf55db. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-acceleration-15 — Offset e quadrato della pulsazione

I riferimenti quattro e diciotto m/s² danno q=(37−9)/(18−4)=2 s²/m e b=1. La lettura venticinque corrisponde a dodici m/s². Con ω_C²=4 s⁻², l’ampiezza è dodici diviso quattro, tre metri.

Controllo didattico d’autore: Sei divide per ω anziché per ω²; dodici copia l’accelerazione. Due riproduce S=17 a questa pulsazione, venticinque copia il display. Solo tre metri genera S=25 dopo l’inversa e la taratura.

Source SHA256 33a8bb391d72d38330e6e7a61f72c07e7be4e0efa25161661a75421fa9864f3e; candidato SHA256 cdbdb64c322508e5b41c85d6cf459f921c459751b512aab50a559c869301d4c1. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-acceleration-16 — Un vincolo rende cubica l’inversa

Sostituire A=cω nella relazione a_max=ω²A dà a_max=cω³. Dividere quattro m/s² per mezzo m·s produce ω³=8 s⁻³. La radice cubica reale positiva è due rad/s e il vincolo dà A=1 m.

Controllo didattico d’autore: Otto è il numero del cubo, non della pulsazione; √8 risolverebbe un’equazione quadratica diversa. La funzione ω³ è crescente sul dominio positivo: c’è una sola soluzione fisica, senza aggiungere una radice negativa. Il coefficiente c è dimensionato in m·s e collega prove diverse.

Source SHA256 3d301d5d6851f702f385093e880a583cabaeb8f7b55c5926a6e95d85cfba6f52; candidato SHA256 3bfeb36240727073ed0a15bc7d9fb19ab763ee3d09af124bc035f64491f00cf5. Nessun giudizio scientifico indipendente attribuito all’autore.

C1-L003 è stato riletto per il trasferimento esplicito di accelerazione orientata. Le schede distinguono a_x da a_max: il richiamo ha segno opposto a x, il massimo modulo è positivo. Nel 16 c=1/2 m·s lega prove diverse; a_max=cω³ è cubica in ω e non un cambiamento temporale del moto.

Lettura grafica d’autore: la prima etichetta a_x=+4 m/s² era attraversata dall’asse di posizione. Spostata da baseline 447 a 490 px senza cambiare geometria o scale; package/asset e binding 01/11 rigenerati. XML e rendering completo finali riletti, poi due assembly equivalenti, import canonico e 48 anteprime fresche con exit 0 sui nuovi byte. Il grafico a_x(x) ha pendenza −4 s⁻²; frecce a 25 px/(m/s²) e barre a 20 px/(m/s²), esplicitamente scale diverse.
