# Campi magnetici e induzione

## SIM-C4-L09-01 · Origine magnetica delle correnti ed esperimento di Oersted

Immagina di guardare il filo lungo il suo asse. Il campo magnetico gira intorno al filo, perché la corrente rettilinea produce circonferenze di campo. Il pollice della mano destra indica il verso della corrente convenzionale, le dita piegate indicano il verso del campo. La sonda confronta questo verso con la tangente positiva fissata dal banco.

\[
B_{\mathrm{tang}}=\frac{\mu_0 I}{2\pi r},\qquad r=5\ \mathrm{cm}=\frac{1}{20}\ \mathrm m
\]

Per il filo lungo ideale usa il valore di modello μ₀ ≃ 4π × 10⁻⁷ T·m/A. Il π si cancella. Dividere per 2πr lascia 2 × 10⁻⁷ T·m/A diviso 1/20 m, cioè 4 × 10⁻⁶ T/A. In microtesla basta moltiplicare la corrente per quattro.

A +5 A leggi +20 µT. A −2 A leggi −8 µT. Il segno descrive un verso, mentre il modulo vale 8 µT nel secondo caso. Se misuri −8 µT, dividendo per 4 µT/A ricavi −2 A. Il banco isola il contributo del filo e trascura altri campi ambientali.

## SIM-C4-L09-03 · Moto circolare in campo magnetico uniforme

La velocità è perpendicolare al campo uniforme. La forza magnetica è quindi perpendicolare al moto: cambia la direzione della velocità, mentre il suo modulo resta costante. Per descrivere la traiettoria circolare, uguaglia il modulo della forza magnetica a mv²/r, la forza radiale richiesta.

\[
|q|vB=\frac{mv^2}{r},\qquad r=\frac{mv}{|q|B},\quad \frac{mv}{|q|}=0{,}12\ \mathrm{T\,m}
\]

Semplifica una v, che nel banco è diversa da zero. Dividere T·m per T lascia metri. Con 3 T dividi 12 centimetri per 3 e ottieni 4 cm. Con 1 T il raggio è 12 cm. Per passare da 0,12 m a 12 cm basta moltiplicare per cento.

Se leggi 4 cm, la relazione inversa restituisce 12÷4=3 T. Triplicare B a velocità fissata stringe l’orbita a un terzo. Il segno di q determina il senso della curva, mentre il suo valore assoluto determina il raggio.

## SIM-C4-L10-01 · Flusso magnetico

Per contare il flusso scegli la normale orientata alla superficie della spira. L’angolo del controllo è quello fra campo e normale. In un campo uniforme, la componente che attraversa il piano vale B cos θ. Il segno indica se questa componente concorda con la normale.

\[
\Phi=\vec B\cdot\vec A=BA\cos\theta
\]

Moltiplica 0,3 T per 0,02 m²: 3 × 2 × 10⁻³ dà 6 milliweber. A 120°, il coseno è −1/2 perché 120° supplementa 60°. Ottieni −3 mWb. Ruotando fino a 60°, il coseno diventa +1/2 e ottieni +3 mWb.

Dalla misura +3 mWb, dividi per 6 mWb e ritrovi cos θ = 1/2. Nel dominio da 0° a 180° ciò individua 60°. A 90° il campo è parallelo alla superficie e il flusso si annulla, anche con campo diverso da zero.

## SIM-C4-L10-02 · Forza elettromotrice indotta

La bobina nel banco resta ferma col piano perpendicolare al campo di riferimento. La normale orientata è parallela al suo verso positivo. Cambia soltanto la componente di campo lungo quella normale. Il flusso di ogni spira è quindi AB e quello concatenato vale NAB.

\[
\varepsilon=-\frac{d(NAB)}{dt}=-NA\frac{dB}{dt}
\]

Dieci spire da 0,05 m² danno un fattore di area 0,5 m². Con una variazione di +3 T/s, fai −3/2 = −1,5 V. Con −2 T/s, fai −(−2)/2 = +1 V. Il prodotto T·m²/s è Wb/s, cioè volt.

A partire da +1 V, dividi per −0,5 m² e ritrovi −2 T/s. Il segno meno collega la fem alla variazione di flusso: invertire la variazione inverte la polarità rispetto allo stesso riferimento. Se il campo è costante, il modello dà fem nulla.

## SIM-C4-L10-03 · Legge di Faraday–Neumann–Lenz

La bobina mantiene lo stesso orientamento. La grandezza data è già il flusso concatenato Ψ, somma dei contributi delle spire. Usa direttamente la differenza fra il suo valore finale e quello iniziale. La fem media è il rapporto di questa variazione per la durata, con il segno di Lenz.

\[
\bar\varepsilon=-\frac{\Delta\Psi}{\Delta t},\qquad \Psi=N\Phi
\]

In 2 s la variazione +2 Wb dà −2/2 = −1 V. In mezzo secondo, dividere 2 per 1/2 significa raddoppiare: ottieni −4 V. La fem resta negativa in entrambe le prove perché il flusso concatenato aumenta nello stesso orientamento.

A −4 V puoi risalire al tempo facendo 2÷4=1/2 s. Il voltmetro misura una media sull’intervallo. Non moltiplicare ancora per N, perché il dato iniziale include già tutte le spire.

## SIM-C4-L10-04 · Correnti indotte e loro verso

Fissa una normale e il verso positivo lungo la spira che le corrisponde. La legge di Faraday lega la fem alla variazione di flusso concatenato. Assumendo resistenza di 2 Ω e autoinduzione trascurabile, la legge di Ohm trasforma la fem orientata nella corrente orientata.

\[
I=\frac{\varepsilon}{R}=-\frac{1}{R}\frac{d\Psi}{dt},\qquad R=2\ \mathrm{\Omega}
\]

Con +6 Wb/s la fem è −6 V e −6÷2 dà −3 A. Con −4 Wb/s la fem è +4 V e 4÷2 dà +2 A. Il passaggio da Wb/s a V mantiene il valore numerico, e V/Ω dà ampere.

Se il banco mostra +2 A, ricostruisci la fem +4 V e quindi una variazione di flusso pari a −4 Wb/s. La risposta positiva indica corrente nel verso scelto, non un aumento del flusso. Il campo della corrente indotta tende a opporsi alla variazione che la produce.
