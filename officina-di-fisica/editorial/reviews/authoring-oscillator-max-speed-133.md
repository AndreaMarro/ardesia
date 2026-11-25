# Authoring DRAFT — oscillator-max-speed-133

Tutti i 16 prompt originali di questa famiglia U4-01 letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605 prima della riscrittura. Le consegne sono autonome e le unità dichiarate; risultati interi, frazioni e radicali esatti, senza richiedere approssimazioni trigonometriche. Lezioni reali C5-L01/L02/L05 rilette; corso C5 e competenze esistenti, nessun ID inventato.

Autore soltanto. Review scientifica indipendente NOT_RUN, human NOT_RUN, publication DRAFT/NONE. Le note di calcolo seguenti aiutano il revisore e non costituiscono un oracolo indipendente o un’autofirma.

Controlli tecnici: due assembly identiche sui record e sui binding; importatore canonico ROOT con package assoluto A in SQLite temporaneo, 16 nuovi poi 0 nuovi/16 invariati. Tutti i 991 pubblicati, live heads e versioni storiche conservati. SVG XML e rendering completo letti dall’autore. Snapshot privata del runtime ROOT con fingerprint f897223d7afb4a9e09eb4fd06768e42e5b52bc131455fa678fbef74b4f39caa5 identica prima del run; medesimo harness b77d90368c3fa4d7fee43db65b402804615e0ba353f6514d699864e2cbd46372: 48/48 anteprime con exit 0, nessuna violazione di overflow, formule o axe. Questo non sostituisce il replay dell’integratore né certifica l’esperienza umana o l’apprendimento. Nessun registro o codice prodotto modificato.

## AR-u4-oscillator-max-speed-01 — Il punto attraversa più rapidamente l’equilibrio

La velocità è la derivata temporale della posizione: v=−ωA sin(ωt+φ). Il seno raggiunge valori di modulo uno, perciò il massimo modulo è ωA. Due metri per tre al secondo dà sei m/s; il radiante è adimensionale. Il massimo si verifica nei passaggi per l’equilibrio.

Controllo didattico d’autore: Dodici userebbe la distanza fra i due estremi, 2A, al posto dell’ampiezza A. Tre copia il numero della pulsazione. Ai punti estremi il modulo della velocità è zero, non massimo; le velocità orientate estreme sono +6 e −6 m/s.

Source SHA256 dcb62ac26fe89ae10f45785f7e040ff035e322a0ab7ff3d517e21d267974dadd; candidato SHA256 05c4f5fdba9601e1d7305d8c8e6b22768da5a0a00a03144bb0d7339be31d8ecb. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-speed-02 — L’unità del modulo massimo

La velocità rapporta variazione di posizione e tempo. Nella formula v_max=ωA, ω ha dimensione tempo inverso e A lunghezza: il prodotto è m/s. Scrivere rad/s per ω ricorda la fase, senza aggiungere una dimensione meccanica al radiante.

Controllo didattico d’autore: Metri misurano ampiezza, m/s² accelerazione, rad/s pulsazione e s durata. Né il massimo né il modulo cambiano le dimensioni della velocità.

Source SHA256 5f6c8c24335dff71b6504c940175cd00e93d8196d7a01877dccfdc445195fa89; candidato SHA256 ac35bab2f21bade8f9ec8b01b0fc1be1078ed5412478a5b92e4dc6f92e298774. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-speed-03 — Dalla sinusoide al massimo modulo

Derivare il coseno introduce un fattore ω e un seno con segno meno. La fase iniziale sposta gli istanti ma non il massimo modulo: in un ciclo |sin| raggiunge uno. Quindi v_max=ωA, pur esistendo velocità orientate sia positive sia negative.

Controllo didattico d’autore: ω²A è il massimo modulo dell’accelerazione; A/ω ha unità m·s e ω/A unità 1/(m·s). Un altro 2π conta due volte la conversione fra frequenza f e pulsazione ω=2πf.

Source SHA256 f858b2b69b7af5efa2aea8680dd03601e3e9a3b9ffac75645a4b66f6c5b2a2bd; candidato SHA256 9e08a5452940de5c322d2f11b815a4cd04a8dcb1d7401c801f963a50cc937fd8. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-speed-04 — Ampiezza dimezzata

A pulsazione fissata il massimo modulo è direttamente proporzionale all’ampiezza. L’oscillatore nuovo compie la stessa fase nello stesso tempo, ma copre spostamenti dimezzati; v_max passa da sei a tre m/s.

Controllo didattico d’autore: Dodici inverte l’effetto, tre mezzi quadra il dimezzamento e uno copia l’ampiezza in unità diverse. Sei ignora il nuovo moto. Il periodo resta uguale perché dipende da ω, non dall’ampiezza nel modello armonico.

Source SHA256 c510156f2730c29106800bc8f6348a6c592749fa90700f2fec45a638b4bad70b; candidato SHA256 d9d77f38f634ed7b30d62da8abdeed0ed201766bb9c8b02dd6186fe090fd9025. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-speed-05 — Ricostruire l’ampiezza

Dividiamo la velocità massima per la pulsazione positiva. Sei metri al secondo diviso tre al secondo lascia due metri. Questa è la distanza dall’equilibrio a un estremo; la distanza fra i due estremi sarebbe quattro metri.

Controllo didattico d’autore: Quattro è la distanza fra gli estremi, non l’ampiezza richiesta. Moltiplicare per ω restituirebbe un’accelerazione, mentre dividere ancora per ω introdurrebbe un tempo in più.

Source SHA256 98b1a069aa4b643ef135063e0458f1c9a4ca93ac147b526a397d05915b6a7051; candidato SHA256 1aa25a879dd929af0352ebc54b237e607e199d515769090e8374ea88ff54935f. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-speed-06 — Ricavare la pulsazione

Dal prodotto v_max=ωA ricaviamo ω=v_max/A. Sei metri al secondo diviso due metri dà tre al secondo, scritti tre rad/s per indicare il ritmo della fase. La frequenza in hertz sarebbe invece 3/(2π) Hz.

Controllo didattico d’autore: Tre Hz non è la stessa grandezza di tre rad/s. Dodici moltiplicherebbe anziché dividere, e un terzo sarebbe un tempo caratteristico inverso alla pulsazione. Si usa il massimo modulo, non una velocità orientata negativa.

Source SHA256 117d323e5d24b12a7030c4bf7bce1223ba141d063b2c0cd3942c63478c0e586c; candidato SHA256 5f061847adb67eeff94d6999e10e076847d208bf85085d6d3abdc50dc2233007. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-speed-07 — Una pulsazione tre volte minore

I due massimi moduli sono sei e due m/s. Il rapporto è due sesti, un terzo. A fissa, ridurre la pulsazione allunga il periodo e riduce la velocità massima dello stesso fattore, non del suo quadrato.

Controllo didattico d’autore: Tre inverte il confronto, un nono usa la legge quadratica dell’accelerazione, uno ignora la modifica e due copia il numero del risultato finale in m/s.

Source SHA256 e4de6c89d41d6824e64c0a4ab49ee814f9a9498ca385441756fcc78fa9a41956; candidato SHA256 650c34619a4dde25159538c3489680eac56053b5625b283bee79734a44263a44. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-speed-08 — Scarto di un massimo sovrastimato

Il massimo modulo corretto è sei m/s. Dodici meno sei dà più sei m/s. La proposta usa il doppio della velocità massima e può nascere dall’aver scambiato A con l’intera distanza 2A fra gli estremi.

Controllo didattico d’autore: Meno sei cambia l’ordine, dodici mantiene la proposta e diciotto somma. Zero accetta il valore errato. Lo scarto ha segno anche se il massimo modulo fisico è sempre positivo.

Source SHA256 0f3f971e804820c87c897630a8b734c4b6ba5e036791ebb6d727d2f0f04f5fc4; candidato SHA256 021951a342070c0b12dfc5bbf5f7701d6913442a92dfa49ce3bcd2dba554265c. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-speed-09 — L’inversa per A

Dividendo v_max=ωA per ω>0 si ottiene A=v_max/ω. Il rapporto (m/s)/(s⁻¹) dà metri. Il massimo modulo non introduce un fattore due, perché A è già l’ampiezza da un estremo all’equilibrio.

Controllo didattico d’autore: Il prodotto v_maxω è un’accelerazione, ω/v_max una lunghezza inversa e v_max/ω² una grandezza con unità m·s. Il due aggiunto restituirebbe 2A, distanza fra gli estremi, non A.

Source SHA256 3067caa0fae41471c4cf854c0e9021deb6a783645220cd85766d354b2601347d; candidato SHA256 761e1b2bb816000c212e8d882858ddb694e7a066a011348d50c6df823320c613. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-speed-10 — Due fattori diretti

Il massimo modulo è un prodotto. Sostituendo le due grandezze della prova II otteniamo κ₁κ₂ volte il valore della prova I. Il cambiamento di fase iniziale non influirebbe sul massimo.

Controllo didattico d’autore: I quozienti invertono dipendenze dirette, il quadrato di κ₂ appartiene all’accelerazione massima, non alla velocità. La somma darebbe due per prove identiche.

Source SHA256 fd135a1bcbd392223a19d025620de247be14d8bf8cb17655852e301b837fba30; candidato SHA256 fb21c374e0e653752594c88e318c3a188a5bb937a8a63771c6b86c115b157d9e. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-speed-11 — Meno ampiezza ma fase più rapida

La prova I ha massimo modulo sei m/s e la prova II quattro m/s. Il rapporto quattro sesti è due terzi. Il dimezzamento dell’ampiezza prevale sull’aumento della pulsazione di quattro terzi.

Controllo didattico d’autore: Tre mezzi è il reciproco, un mezzo segue solo A e quattro terzi solo ω. Quattro è il numero della velocità massima finale, non il rapporto adimensionale.

Source SHA256 51c46ee2f27795a18abd238187c01c8fa398e6ef85eff8698fbcfe935ed7518d; candidato SHA256 8e4658cb66d38ca2b6dfac6c1fe30b7fee70259a1294ea64e65f4655a0a333b3. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-speed-12 — Media di due massimi moduli

I massimi moduli sono sei e quattro m/s: la semisomma è cinque m/s. Questa è una media fra prove, non la velocità media orientata di un oscillatore durante un ciclo, che sarebbe zero.

Controllo didattico d’autore: Dieci è la somma, uno la semidifferenza e quattro la sola prova II. Con A medio 3/2 m e ω media 7/2 rad/s si avrebbe invece 21/4 m/s, maggiore di 1/4 m/s della media richiesta.

Source SHA256 5717db59f9a0bf4bcf6c5e2f6c6e2dcfb3b0693bb55c5a88303eb2b97b761066; candidato SHA256 f3d93ea6c3ec3d748ebb406a72199d817c284443f9882498ee01e0e0bd80a064. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-speed-13 — La pulsazione per un massimo desiderato

Il target è quattro m/s. A un metro di ampiezza serve ω_II=4 rad/s. Il rapporto con tre rad/s è quattro terzi; equivale a dividere il target due terzi per il fattore di ampiezza un mezzo.

Controllo didattico d’autore: Tre quarti inverte il rapporto; due terzi copia il target, due considera solo l’ampiezza e quattro è il numero di ω_II, non il rapporto richiesto.

Source SHA256 c173d72b049e77f377f2e3e525e7292fddce1901c5a2abf581486abf45cc81c9; candidato SHA256 1278a2abbbdd65f22df42c032ae2422a16947b0f12db99ab83fee335f07571af. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-speed-14 — Tarare il massimo modulo

La prova I dà sei m/s e fissa q=3 s/m. La lettura dodici rappresenta quattro m/s. Dividendo per la pulsazione quattro rad/s ricaviamo un metro di ampiezza, non la distanza fra gli estremi.

Controllo didattico d’autore: Dodici è adimensionale, quattro è il numero di una velocità e non una lunghezza. Usare S direttamente come v_max triplicherebbe l’ampiezza a tre metri.

Source SHA256 56a8df9397927a0512d1d2b2f8878a39f7d15839986110b66216d5545ba7fcbf; candidato SHA256 ed1cfb61de0278c0f703207b9a4697f9293f7f60b55f01c9a1f61b101d41cfbf. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-speed-15 — Offset prima dell’ampiezza

I riferimenti sei e quattro m/s danno q=(13−9)/(6−4)=2 s/m e b=1. La lettura quarantuno rappresenta venti m/s. A pulsazione cinque rad/s l’ampiezza è venti diviso cinque, quattro metri.

Controllo didattico d’autore: Con ω=5 rad/s, ampiezze 20,5,10,41 m produrrebbero S=201,51,101,411, non quarantuno. Venti copia il massimo modulo e quarantuno il display. Solo quattro metri ricostruisce i dati dopo taratura.

Source SHA256 5cd788a3ca571d013d05d7e3d5e112f6e06e456eec1ad95e143e16a171c964dc; candidato SHA256 2616955514c3642ad0beb9d21e1c9c47b472a3d31b9c532aaae7287bfa46a512. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u4-oscillator-max-speed-16 — Un vincolo rende quadratica la velocità massima

Sostituendo A=cω nel prodotto otteniamo v_max=cω². Dividere sei m/s per due terzi m·s dà ω²=9 s⁻². La radice positiva è tre rad/s, e il vincolo restituisce A=2 m.

Controllo didattico d’autore: Nove è il numero di ω², non la pulsazione. La radice negativa viola il dominio ω>0 e darebbe A<0. Il coefficiente c ha unità m·s: non è una costante pura, né una legge temporale dell’oscillatore.

Source SHA256 8c594fbea33b01613b5497d63c7f30262e30f163569537c0b6f205bb7bdb8f01; candidato SHA256 9abfd7b344c4c749c00373bc3ab8ac759767b6af528dddb42826ee71300fdb7c. Nessun giudizio scientifico indipendente attribuito all’autore.

C1-L003 è stato riletto e usato come trasferimento esplicito per velocità orientata e pendenza della legge oraria. La fase iniziale nel disegno è scelta nulla: θ=ωt e v=−6 sinθ m/s. I passaggi al centro nei due versi sono istanti differenti; il massimo modulo è positivo, mentre v può essere negativa. Il coefficiente c del caso 16 ha unità m·s e lega prove diverse.
