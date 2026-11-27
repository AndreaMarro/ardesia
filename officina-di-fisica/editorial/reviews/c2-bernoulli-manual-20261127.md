# Velocità, pressione e bilanci

## SIM-C2-L006-01 · Teorema di Bernoulli

Immagina di seguire una piccola porzione d’acqua dall’ingresso alla gola. Nel Venturi del banco il moto è stazionario, l’acqua è incomprimibile, le perdite sono trascurate e le due sezioni considerate sono alla stessa quota. Su quella linea di corrente l’energia per volume si ripartisce fra pressione statica e contributo cinetico.

\[
p_1+\frac{\rho v_1^2}{2}=p_2+\frac{\rho v_2^2}{2},\qquad p_2=p_1-\frac{\rho}{2}(v_2^2-v_1^2)
\]

Il prodotto di kg/m³ per m²/s² dà Pa. Con ρ = 1000 kg/m³ e velocità indicate in m/s, il fattore 1000 si cancella nel passaggio a kPa: basta dimezzare la differenza dei quadrati. All’ingresso v₁ = 1 m/s e p₁ = 20 kPa.

Alla gola con 3 m/s, fai 3² − 1² = 8. Dimezzando ottieni una caduta di 4 kPa e leggi 20 − 4 = 16 kPa. Con 2 m/s, 4 − 1 dà 3 e la caduta è 3/2 kPa. Ottieni 20 − 3/2 = 18,5 kPa.

Se conosci 16 kPa puoi risalire alla velocità: la caduta è 4 kPa, quindi la differenza dei quadrati è 8. Sommando 1 ottieni 9 e scegli 3 m/s, il valore positivo del modulo. La presa alla gola legge pressione statica. Il contributo cinetico cresce nel tratto stretto.

## SIM-C2-L006-02 · Pressione statica e dinamica

Segui le due prese del Pitot. La presa frontale è rivolta contro la corrente. Nella piccola regione davanti alla presa il moto si arresta idealmente. La presa laterale misura la pressione statica del flusso. Con acqua incomprimibile e perdite trascurabili, il passaggio alla condizione di arresto trasforma il contributo cinetico in incremento di pressione.

\[
p_0-p_\mathrm{stat}=\frac{\rho v^2}{2},\qquad v=\sqrt{\frac{2(p_0-p_\mathrm{stat})}{\rho}}
\]

Con acqua a densità 1000 kg/m³, dividi per 1000 per passare da Pa a kPa. Il fattore 1000 della densità si semplifica. A 2 m/s basta fare 2²/2 = 4/2 = 2 kPa. A 4 m/s fai 4²/2 = 16/2 = 8 kPa.

Con 8 kPa di differenza, il quadrato della velocità vale 16 nelle unità del banco. La velocità è 4 m/s. Il raddoppio da 2 a 4 m/s quadruplica la differenza, che si annulla quando il fluido è fermo. Il risultato non determina da solo la pressione statica.

## SIM-C2-L006-03 · Stenosi e aneurisma in modello ideale

Considera quanto liquido attraversa due sezioni nello stesso piccolo intervallo di tempo. Nel modello rigido, stazionario e incomprimibile, senza rami, quel volume è uguale. Se la sezione locale si dimezza, lo stesso volume può passare soltanto raddoppiando la velocità media.

\[
A_1v_1=A_2v_2,\qquad v_2=\frac{v_1}{A_2/A_1},\qquad \frac{A_2}{A_1}=\frac{v_1}{v_2}
\]

Il rapporto delle aree è un numero puro, perciò la velocità rimane in m/s. All’ingresso hai 2 m/s. Nel restringimento, l’area vale metà di quella iniziale: 2 ÷ (1/2) = 4 m/s. Nell’allargamento l’area è doppia: 2÷2=1 m/s.

Dalla velocità di 1 m/s puoi recuperare il rapporto delle aree facendo 2÷1=2. Leggi la variazione dell’area nel disegno, senza usare il raggio come se fosse l’area. Un vaso reale può deformarsi, avere moto pulsatile e dissipare energia. Qui si confrontano soltanto le velocità medie nel modello.

## SIM-C2-L006-04 · Condizioni di validità

Confronta l’ingresso e l’uscita del tubo alla stessa altezza e con la stessa sezione. In moto stazionario e incomprimibile le velocità medie coincidono. In un bilancio meccanico per volume i termini di quota e di velocità si cancellano fra ingresso e uscita. Resta una caduta di pressione che rappresenta l’energia dissipata.

\[
p_1-p_2=\Delta p_\mathrm{perdita},\qquad p_2=p_1-\Delta p_\mathrm{perdita}
\]

Il pascal è un joule per metro cubo, quindi perdita per volume e pressione possono essere espresse entrambe in kPa. Partendo da 15 kPa, sottrai 6 kPa e ottieni 9 kPa. Se la perdita è 4 kPa, ottieni 15 − 4 = 11 kPa.

Da 11 kPa in uscita puoi ricavare 4 kPa di perdita sottraendo la lettura di uscita dai 15 kPa all’ingresso. A perdita nulla il modello dà 15 kPa a entrambe le prese. La velocità può restare uguale anche se la pressione statica scende.
