# Revisione distinta cric-c4-l06

Dieci problemi Cric distinti. La primaria e il modello Root sono congelati prima delle candidate. La precedente esposizione limitata Root al valore di Q091 rimane dichiarata e la compensazione source-only A db4f4c7e la precede. A ha risolto e riletto separatamente tutti i cinquanta prompt in 83337ef8 prima del modello Root e dei candidati; il nuovo boundary numerico e il modello sono stati eseguiti e congelati in 2bd7ec24 prima di aprire le candidate.

Sono stati letti integralmente ogni originale e candidato, tutti i cinque SVG candidati in XML e in cinque nuove PNG native indipendenti intere, diciotto SVG originali e le lezioni reali C4-L06–L10. Il target comune ha eseguito 19 test con exit 0. Nessun browser del prodotto, import o approvazione umana è attribuito al peer. Stato DRAFT; Root resta unico integratore.

## C4-Q051

Ipotesi e dominio: Resistori positivi ohmici, due nodi comuni al parallelo e tratto esterno attraversato dalla corrente totale; generatore ideale 9 V.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: I rami hanno la stessa tensione, quindi le conduttanze si sommano:
1/Rp=1/30+1/60=3/60=1/20, Rp=20Ω. Il resistore da 10Ω è attraversato dalla corrente
totale e si somma a Rp: Rtot=30Ω. Ohm dà I=9/30=3/10 A=0,3 A. Non si sommano tutti
e tre i resistori: i primi due condividono i nodi.

Confronto delle alternative: 0,09 A somma i tre R; 0,45 omette 10 Ω; 0,90 usa soltanto 10 Ω; 3 A richiederebbe Rtot=3 Ω<10 Ω.

Verifica: EXACT_ORACLE; firma `4961d6ec4f9ab5bf3bcb6906d67d1356361eb4d58a54936c26a0a90c723d7072`.

## C4-Q052

Ipotesi e dominio: Due resistenze positive diverse, tensione comune NON NULLA; nessuna corrente comune assunta nei rami.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: A tensione fissata P=VI e I=V/R, dunque P=V²/R. Per R positive diverse
e **V non nulla**, il resistore minore dissipa di più. Se V=0 entrambe le potenze
sono nulle: rendere esplicita la tensione non nulla se si chiede un confronto
strettamente maggiore. La regola P=I²R non autorizza a tenere uguale I nei rami.

Confronto delle alternative: A V comune P inversa a R: usare soltanto I²R dimentica correnti diverse; V=0 è escluso.

Verifica: AI_CONCEPTUAL; firma `41208aa6a0f1395a0155950f6c86b24c7d45763545b833dff3949a9bd9b92551`.

## C4-Q053

Ipotesi e dominio: Estremi connessi esclusivamente da filo ideale, nessun componente interposto; potenziale comune.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Il nome è nodo. Un filo ideale non presenta caduta di potenziale:
tutti gli estremi collegati da quel filo appartengono allo stesso nodo
equipotenziale, anche se il disegno li dispone lontani.

Confronto delle alternative: Maglia è percorso chiuso, equivalente è risposta ai morsetti e generatore è componente, non insieme equipotenziale.

Verifica: AI_CONCEPTUAL; firma `fb51ebfedcac816ec9bc9ee240184c77082a5720479c3498eeebced4b6b229b5`.

## C4-Q054

Ipotesi e dominio: Corrente costante 20 mA, resistenza invariata 100 Ω, intera durata 30 s; energia elettrica trasformata distinta dalla potenza.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: I=20 mA=20/1000 A=1/50 A. La potenza Joule è I²R=(1/2500)100=1/25 W.
Per 30 s l’energia è E=Pt=30/25=6/5 J=1,2 J. Il quadrato riguarda anche il fattore
di conversione milli; non si moltiplica semplicemente I per R per ottenere energia.

Confronto delle alternative: 0,040 J copia la potenza numerica; 1200000 J usa 20 A; 1200 J ha errore mille, 60 J non soddisfa I²Rt.

Verifica: EXACT_ORACLE; firma `8c607bc176e2f2d4d26018667cd8a588492fe9b3cc332f77c3e3850c7274238b`.

## C4-Q055

Ipotesi e dominio: Due rami passivi positivi; equivalente 4 Ω minore del ramo noto 12 Ω; residuo di conduttanza positivo.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Dal parallelo 1/4=1/12+1/Rx. Sottraggo: 1/Rx=3/12−1/12=2/12=1/6.
Quindi Rx=6Ω. Controllo: l’equivalente 4Ω è minore di entrambi i resistori
positivi 6 e 12Ω. La formula inversa è Rx=Req R/(R−Req), con 0<Req<R.

Confronto delle alternative: 8 Ω usa sottrazione da serie, 1/6 copia conduttanza in siemens; 12·6/18=4 controlla l’inversa.

Verifica: EXACT_ORACLE; firma `15443c294077de48bd1a420dd1d6a6836c8517ecf9aee7939cbf3d28da0fbb86`.

## C4-Q056

Ipotesi e dominio: Generatore ideale mantiene V e ramo superstite mantiene R; apertura soltanto dell’altro ramo.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: La sorgente ideale mantiene V; il resistore rimasto mantiene R.
La sua corrente V/R non cambia. Cambiano la corrente totale e la potenza totale
erogate dalla sorgente, non la tensione del ramo superstite. La conclusione
richiede il generatore ideale, non una batteria con resistenza interna arbitraria.

Confronto delle alternative: Raddoppio/dimezzamento richiedono cambio V o R; apertura di un ramo non apre il superstite né conserva corrente totale.

Verifica: AI_CONCEPTUAL; firma `10c37f3aff5ccee71494658feaf910d6f797c4b2960db1574ad3b6cfe667aeee`.

## C4-Q057

Ipotesi e dominio: Resistore dissipativo; energia interna e trasferimento all’ambiente distinti; regime termico stazionario non elimina potenza.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Effetto Joule: l’energia elettrica ricevuta dal resistore si
trasferisce alla sua energia interna. L’energia totale non scompare.

Confronto delle alternative: Fotoelettrico è emissione sotto luce; Faraday è induzione; dissipazione non annulla conservazione energetica completa.

Verifica: AI_CONCEPTUAL; firma `fb8baa765e6b64ebdeb3e36925913c5283e8279171ddc4341bbade4c2c0fb4e4`.

## C4-Q058

Ipotesi e dominio: Serie senza derivazioni, sorgente ideale 12 V, prima caduta 4 V su 80 Ω; corrente comune positiva.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Nei due resistori in serie passa la stessa corrente: I=4/80=1/20 A.
Sul secondo devono cadere 12−4=8 V. Pertanto R₂=8/(1/20)=160Ω. Il rapporto delle
tensioni 8/4=2 coincide con quello delle resistenze 160/80=2.

Confronto delle alternative: 240 Ω assegna tutti 12 V al secondo; 40 Ω inverte le cadute; 12/(80+160)=1/20 A ricostruisce 4 V.

Verifica: EXACT_ORACLE; firma `82d410f144006f2f0757a9bd405545c75aa09aee96b57c9c40c7b3f5ed215619`.

## C4-Q059

Ipotesi e dominio: Connettività di entrambi i terminali alla stessa coppia di nodi, senza inferenza dalla vicinanza grafica.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Occorre seguire i fili: entrambi i resistori devono avere i due
estremi collegati alla stessa coppia di nodi. Vicinanza, altezza o orientamento
grafico non stabiliscono il collegamento elettrico.

Confronto delle alternative: Un solo terminale comune, valore uguale e posizione grafica non impongono entrambi i nodi.

Verifica: AI_CONCEPTUAL; firma `a3a4565bf2d3e15f4f8e5dfa10a04fc9acde988d6a4d9874e038878eae499ebe`.

## C4-Q060

Ipotesi e dominio: Resistenza ohmica invariata; modulo V finale metà e potenza iniziale positiva 8 W.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Per R costante, P=V²/R. Dimezzare V moltiplica P per(1/2)²=1/4:
8 W diventano 2 W. Anche I si dimezza; il prodotto VI diventa un quarto.

Confronto delle alternative: 4 W assume legge lineare; 32 W inverte rapporto al quadrato; 8 W ignora variazione di V.

Verifica: EXACT_ORACLE; firma `5482cd0b53a871eea69fd8269f0e80566c00a6251289ebe72f7937194dd9a747`.
