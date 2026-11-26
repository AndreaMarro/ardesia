# Revisione distinta cric-c4-l09

Dieci problemi Cric distinti. La primaria e il modello Root sono congelati prima delle candidate. La precedente esposizione limitata Root al valore di Q091 rimane dichiarata e la compensazione source-only A db4f4c7e la precede. A ha risolto e riletto separatamente tutti i cinquanta prompt in 83337ef8 prima del modello Root e dei candidati; il nuovo boundary numerico e il modello sono stati eseguiti e congelati in 2bd7ec24 prima di aprire le candidate.

Sono stati letti integralmente ogni originale e candidato, tutti i cinque SVG candidati in XML e in cinque nuove PNG native indipendenti intere, diciotto SVG originali e le lezioni reali C4-L06–L10. Il target comune ha eseguito 19 test con exit 0. Nessun browser del prodotto, import o approvazione umana è attribuito al peer. Stato DRAFT; Root resta unico integratore.

## C4-Q081

Ipotesi e dominio: Contributo del solo filo lungo, punto esterno fisso, corrente non nulla invertita a modulo invariato; campo terrestre non incluso.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Il campo del filo è proporzionale alla corrente orientata.
Invertire I inverte il contributo B nel punto esterno fissato. Anche il modulo
resta uguale se si mantiene uguale |I|; non si può dedurre il campo totale in
presenza di altri contributi non specificati.

Confronto delle alternative: Filo fisso non impone corrente fissa; punto fisso conserva distanza e inversione I cambia tangente orientata.

Verifica: AI_CONCEPTUAL; firma `5c66d716eea17ea283392a4011b6084fe391df18a3aec3dfa16ac639e019694d`.

## C4-Q082

Ipotesi e dominio: Velocità perpendicolare al campo, F e B assegnati in modulo; segno della carica non inferibile dal solo modulo.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Poiché v è perpendicolare a B, F=|q|vB. Quindi
|q|=2 × 10⁻⁶/(400 × 1/2)C=10⁻⁸C=10 nC. È il modulo della carica, non il suo segno.
La conversione micro→nano dà un fattore 1000, verificato nel percorso Pint.

Confronto delle alternative: 0,010 nC confonde nano/micro; 1000 nC produce 200 μN, non 2 μN; il segno non è determinato.

Verifica: EXACT_ORACLE; firma `eea901960c0d88d521e1615dddeda0c436ccfb1360d543df813625dc07a24ba2`.

## C4-Q083

Ipotesi e dominio: q, v e B non nulli; la nullità del prodotto vettoriale deriva dall’angolo, non da neutralità o velocità zero.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Antiparallela. Con q, v e B non nulli, F=qv×B è zero quando
sinθ=0, cioè per θ=0 oppureπ. Non è necessario che la particella sia ferma.

Confronto delle alternative: 90° massimizza forza, 45° non annulla seno, uniformità spaziale non annulla prodotto vettoriale.

Verifica: AI_CONCEPTUAL; firma `549bdc117a6c22e7d07a131605ff1e7a7eaff3041a4e3db7c90427dea4d963d1`.

## C4-Q084

Ipotesi e dominio: Segmento rettilineo, campo uniforme, angolo 30° rispetto alla corrente; seno esatto 1/2.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: F=IℓB sin 30°=4 ×(3/10)×(1/5)×(1/2)N=3/25 N=0,12 N.
Il seno 30° è esattamente 1/2; non occorre una calcolatrice. L’angolo è quello
fra la direzione della corrente nel filo e B.

Confronto delle alternative: 0,24 N omette seno, 0,06 N dimezza due volte, 1,2 N errore dieci, zero richiede fattore nullo o parallelismo.

Verifica: EXACT_ORACLE; firma `8257dbe91c746445ff84cbc3a0cd156c517b4595cf5aa1da1513c0c3b07fdd18`.

## C4-Q085

Ipotesi e dominio: q negativa, v a destra e B entrante nel foglio; assi x destra,y alto,z uscente.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Scelgo x a destra, y in alto, z uscente. Per la velocità+x e
campo−z, v×B è+y. La carica negativa inverte quel verso: forza−y, verso il
basso. Il prodotto vettoriale è verificato anche con matrici simboliche.

Confronto delle alternative: Alto corrisponde q positiva; destra non perpendicolare a v; entrante/uscente parallelo a B incompatibile con v×B.

Verifica: AI_CONCEPTUAL; firma `072e16831ec3744c335c48f7498d3448c911ff638391a4823f9460a9d9edf57d`.

## C4-Q086

Ipotesi e dominio: Campo uniforme, regime non relativistico, rotazione uniforme; 0,40 ms è un QUARTO, non periodo completo.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Un quarto di periodo dura 0,40 ms, dunque T=4 × 0,40=1,60 ms.
f=1/T=1000/1,6 Hz=10000/16 Hz=625 Hz. Moltiplicare per quattro la frequenza
anziché ricostruire prima il periodo confonderebbe tempo e inverso del tempo.

Confronto delle alternative: 2500 Hz usa quarto come periodo; 0,625 ignora milli; 10000 moltiplica reciproco del quarto per quattro.

Verifica: EXACT_ORACLE; firma `e3038d6733e84a0efd52a4e3d3f65f8338bde5198c6c53fc7e531eeebf135b3e`.

## C4-Q087

Ipotesi e dominio: Campo uniforme non nullo e nessun’altra forza; due componenti iniziali della velocità non nulle, regime non relativistico.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: La traiettoria è un’elica. La componente parallela non subisce
la forza magnetica e resta costante; quella perpendicolare ruota. Il cerchio
è il caso limite con componente parallela nulla, escluso nel prompt.

Confronto delle alternative: Cerchio/retta richiedono una componente nulla esclusa; parabola o raggio crescente richiedono diversa dinamica/energia.

Verifica: AI_CONCEPTUAL; firma `a546093531aef6cc04f7ffff584e9010d9e1d96efcbdd95c5d74a35389c9015f`.

## C4-Q088

Ipotesi e dominio: Sola forza magnetica statica uniforme; F perpendicolare a v in ogni istante e teorema lavoro-energia applicato all’intero arco.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: La potenza magnetica è q(v×B)·v=0 in ogni istante.
La velocità cambia direzione, ma non modulo: ΔK=0 J anche dopo la deviazione 90°.
L’identità è simbolica per componenti generiche, non basata su un singolo disegno.

Confronto delle alternative: Forza non nulla non implica lavoro; deviazione di 90° non moltiplica K; segno q cambia curvatura ma non lavoro nullo.

Verifica: EXACT_ORACLE; firma `d670400ac91e1d0d967dae2071556395aed449aa00742c1d93cc783ac185ef8e`.

## C4-Q089

Ipotesi e dominio: Modulo della quantità di moto non nullo comune, B>0 comune, ingressi perpendicolari; nessuna uguaglianza separata di m o v necessaria.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Dal moto circolare r=p/(|q|B). A parità di p e B, la carica+2 e
ha raggio metà di quella+e. Non serve conoscere separatamente massa e velocità.

Confronto delle alternative: Stesso p non rende uguali raggi se |q| differisce; temperatura irrilevante; segno comune non cancella curvatura.

Verifica: AI_CONCEPTUAL; firma `969e342b6914d8b1988f2c956a8f05aa4697484541cfa2530df7f5f3632233e8`.

## C4-Q090

Ipotesi e dominio: Particella positiva non relativistica, campi incrociati e forze opposte, nessun’altra forza; q si cancella solo dopo il bilancio vettoriale.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: L’assenza di deviazione richiede |q|E=|q|vB nelle condizioni
perpendicolari date. v=E/B=1200/(1/25)=30000 m/s. La carica si cancella perché
è non nulla; l’opposizione dei versi è già assegnata dal prompt.

Confronto delle alternative: 48 copia EB; 30 m/s dà vB=1,2 V/m; cancellazione q valida nel bilancio con versi opposti.

Verifica: EXACT_ORACLE; firma `533b497ee74b9ee8a183ed5d36152c13fd67c9bb0ea111604cfc21de5ef0b935`.
