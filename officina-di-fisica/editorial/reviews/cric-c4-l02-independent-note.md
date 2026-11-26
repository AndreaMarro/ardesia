# Revisione indipendente cric-c4-l02

Dieci problemi distinti, risolti prima delle candidate nella primaria C4 Q001-020 commit 719bbd0fbc114937438b80a74d787297c5249336, SHA 34337ec50e90ae61e6a447c62a98c698bf14a4bc47b24f92586a6e4bcd27f6ea. Modello realmente eseguito prima dei candidati, SHA 5162581bc4dc366e2a1fe26c00966661f1eae97cba671a8081a1a938cd00bc3a, con Git-inputs e snapshot verbatim dichiarati. Tutte le sue funzioni conservano AST identico. Nessun modulo autore importato.

Tutti i 10 record finali c45cdc5edb5be3d457e0ec952617610a1f5ce825 letti per intero: dati, risposte, opzioni, hint, blocchi, formule, errori e metadati. Lezione reale C4-L02 letta nel catalogo pinned; identità/versioni/famiglie/difficoltà/prerequisiti/exam controllati individualmente. I risultati numerici derivano dalla primaria, non dalle chiavi.

Tre pannelli letti integralmente nel nuovo PNG 640×1540: F e E hanno unità distinte e nessuna scala comune impropria; P divide 360 coordinate in 120 e 240, cioè10 e20 cm; due campi opposti hanno entrambe lunghezza80. Nel terzo pannello 180,240,300 coordinate rappresentano300,400,500 N/C: triangolo3–4–5 con punte intere e label separate.

Il decoder canonico mantiene il lessema decimale senza float intermedi. Le grandezze orientate, le conversioni dei prefissi e i rapporti puri sono distinti; le opzioni equivalenti sono confrontate con la loro dimensione. Le risposte numeric JSON devono essere interi esatti; i risultati frazionari sono scelte letterali esatte, non float.

Le mutazioni ostili rinnovano binding, hash, token e pin soltanto nel test e lasciano ripristinate le firme finali. EXACT_ORACLE e AI_CONCEPTUAL sono modalità separate. Nuova resa nativa è asset-only: nessuna UI prodotto o approvazione umana; stati DRAFT/NOT_RUN.

## C4-Q011

Ipotesi: External nonzero field fixed by unperturbed sources; probe charge changes from +q to −q with q positive.

Derivazione: Il campo resta invariato perché le sorgenti sono inalterate e la carica di prova è non perturbativa. La forza qE cambia verso, mantenendo il modulo per cariche di prova di uguale valore assoluto.

Distrattori: Source field does not reverse with the test particle; equal charge magnitudes preserve force magnitude.

Didattica: Separate field of sources from force on a probe.

Modalità: AI_CONCEPTUAL; esito True; firma 0058f1dd22d63900ef6bb5e024930d25ff1a8986753a41c4d64b67bd95d8aac1.

## C4-Q012

Ipotesi: Positive nonperturbing probe 4 nC, force 1.2 microN east; field equals force per charge.

Derivazione: Il campo è F/q, diretto come la forza su una prova positiva. E=(1,2×10⁻⁶)/(4,0×10⁻⁹)=300 N/C verso est; il prompt richiede soltanto il modulo.

Distrattori: 0.3 omits micro/nano factor 1000;4800 N/C would give 19.2 microN rather than 1.2.

Didattica: Interpret prefixes before division and check inverse multiplication.

Modalità: EXACT_ORACLE; esito True; firma bfcfd8e41d8ed049ca33d21f1fe89ed01466b8f6f0d38d838e11ca1e8a399539.

## C4-Q013

Ipotesi: Regular point with nonzero field; local line tangent defines direction.

Derivazione: La parola è tangente. Il vettore campo non nullo ha direzione tangente alla propria linea di campo nel punto, con il verso stabilito dal campo.

Distrattori: Normal is perpendicular; a remote secant is not the local tangent; gravity is unrelated.

Didattica: Local geometry rather than shape of a whole curve.

Modalità: AI_CONCEPTUAL; esito True; firma 9398f32101f9f36d287dea2f0f35b24dbbcf450560fff978b5d3b9304bb68b3e.

## C4-Q014

Ipotesi: Two stationary positive point sources q and 4 q in vacuum, q positive, separation 30 cm; point lies strictly between them.

Derivazione: Fra sorgenti positive i contributi hanno verso opposto. kq/x²=4kq/(30−x)² implica 30−x=2x nel ramo interno positivo; x=10 cm da +q. L’altra distanza è 20 cm, non 10 cm da entrambe.

Distrattori: 15 cm leaves a fourfold field mismatch;20 cm is distance from the stronger source.

Didattica: Positive-root inverse and vector cancellation distinguished.

Modalità: EXACT_ORACLE; esito True; firma 2a16bf4e13152ca1cec8aca3b68984256ebd29aa6eb4ef911dc756266fdee685.

## C4-Q015

Ipotesi: Nonzero resultant field at regular point; two distinct tangents cannot define one vector.

Derivazione: Un campo non nullo assegna una sola direzione in ogni punto. Due tangenti differenti darebbero due direzioni incompatibili nello stesso punto; la rappresentazione è errata per un campo elettrostatico ben definito.

Distrattori: Lines are representations, not independent sources; their crossing cannot give two resultant vectors.

Didattica: Uniqueness of a local vector has explicit nonzero condition.

Modalità: AI_CONCEPTUAL; esito True; firma 9897a9ec212ea566427b322728199a733c0fed03691884f9b36e80d9d2c0d9e6.

## C4-Q016

Ipotesi: Only electric force, constant horizontal speed 4 m/s and vertical acceleration 6 m/s² from zero transverse speed; active region contains the considered path.

Derivazione: Il tempo è fissato dal moto orizzontale uniforme: t=0,80/4=1/5 s. Verticalmente y=(1/2)·6·(1/5)²=3/25 m=12 cm verso y positivo. Non si usa direttamente lo spostamento orizzontale come tempo.

Distrattori: 24 cm omits half;60 cm requires 30 m/s² over 0.20 s rather than 6; horizontal acceleration remains zero.

Didattica: Use one time for two independent component equations.

Modalità: EXACT_ORACLE; esito True; firma 4edd1caac6e26277af48f722a9b321636c933ac45ee1baa31a501dea21f8e185.

## C4-Q017

Ipotesi: Single nonzero central point source, inward radial field lines defined by a positive probe.

Derivazione: La sorgente è negativa, perché le linee di campo entrano nelle cariche negative e ne escono per le positive. Il numero delle linee in un disegno non basta a determinare il valore numerico della carica.

Distrattori: Positive source has outward lines; a zero source cannot produce the specified nonzero radial pattern.

Didattica: Relate line direction to sign of source.

Modalità: AI_CONCEPTUAL; esito True; firma 6b62a9860f8c1011b9903854bb66bc63297d4fdd9fe9c69023acb02931dede65.

## C4-Q018

Ipotesi: Two nonzero perpendicular contributions 300 and 400 N/C, east and north.

Derivazione: Le componenti ortogonali vanno composte come vettori: |E|=√(300²+400²)=500 N/C. Il triangolo 3–4–5 rende il calcolo esatto senza trigonometria o calcolatrice.

Distrattori: 700 assumes concordant collinear components and 100 opposite collinear components; neither applies.

Didattica: Manual 3–4–5 triangle with dimensioned squares.

Modalità: EXACT_ORACLE; esito True; firma 77b8b2e1ec5f9772c92262af1cba624ca10efc8ff68efd3a289eb9192f4694b7.

## C4-Q019

Ipotesi: Negative charge and positive mass, initially at rest, nonzero uniform field right, no other forces.

Derivazione: La forza qE e quindi l’accelerazione sono verso sinistra, opposte al campo, perché la carica è negativa. Appena rilasciata da ferma la particella comincia a muoversi verso sinistra; non ha velocità iniziale verso il campo.

Distrattori: Negative charge reverses force; zero initial velocity does not cancel nonzero acceleration.

Didattica: Release instant and immediately subsequent motion are distinguished.

Modalità: AI_CONCEPTUAL; esito True; firma 9f6cb5ee9b81a283b299d5810333de10e0999d223fc7fcc955030a8b9a973c01.

## C4-Q020

Ipotesi: Uniform electric acceleration left persists throughout inversion, initial speed right 6 m/s and acceleration magnitude 3 m/s².

Derivazione: Con asse positivo verso destra, v(t)=6−3t. Al primo arresto v=0, quindi t=2 s; dopo quel tempo la velocità diventa negativa e il moto inverte verso. Campo e accelerazione sono costanti nel tratto assegnato.

Distrattori: At 1 s velocity is+3 and at 3 s−3 m/s; a/v has dimension inverse time.

Didattica: Stopping instant is a change of velocity sign, not vanishing acceleration.

Modalità: EXACT_ORACLE; esito True; firma 151f0517b8d1b2778c88aff09e7803fef59941aee1d4ec969ac2694ede784390.
