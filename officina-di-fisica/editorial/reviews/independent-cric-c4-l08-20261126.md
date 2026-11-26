# Revisione distinta cric-c4-l08

Dieci problemi Cric distinti. La primaria e il modello Root sono congelati prima delle candidate. La precedente esposizione limitata Root al valore di Q091 rimane dichiarata e la compensazione source-only A db4f4c7e la precede. A ha risolto e riletto separatamente tutti i cinquanta prompt in 83337ef8 prima del modello Root e dei candidati; il nuovo boundary numerico e il modello sono stati eseguiti e congelati in 2bd7ec24 prima di aprire le candidate.

Sono stati letti integralmente ogni originale e candidato, tutti i cinque SVG candidati in XML e in cinque nuove PNG native indipendenti intere, diciotto SVG originali e le lezioni reali C4-L06–L10. Il target comune ha eseguito 19 test con exit 0. Nessun browser del prodotto, import o approvazione umana è attribuito al peer. Stato DRAFT; Root resta unico integratore.

## C4-Q071

Ipotesi e dominio: Tre condensatori inizialmente scarichi fra gli stessi due nodi, sorgente 4 V; carica fornita al solo nodo positivo.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: In parallelo Ctot=2+3+5=10μF. Alla tensione 4 V la carica del nodo
positivo è Qtot=Ctot V=40μC. Per chiamarla carica «fornita» dal generatore
dall’inizio, precisare che i condensatori erano inizialmente scarichi; altrimenti
40μC è la carica finale e non necessariamente la variazione fornita.

Confronto delle alternative: 10 copia Ctot in μF; 80 μC somma entrambi i moduli; zero è totale di entrambi i nodi.

Verifica: EXACT_ORACLE; firma `754482ee2e3cc74c57f642971f811a4545b927127215be4333cd379374711d21`.

## C4-Q072

Ipotesi e dominio: Capacità positive diverse, nodo centrale isolato e inizialmente neutro, carica comune Q>0 per confronto stretto.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Il nodo centrale isolato e inizialmente neutro impone cariche
opposte e uguali in modulo sulle due sue armature. Quindi |Vᵢ|=|Q|/Cᵢ e il
condensatore minore sostiene la tensione maggiore. Per il confronto stretto
occorre una carica comune non nulla; a circuito scarico entrambe le tensioni sono zero.

Confronto delle alternative: Regola del parallelo non applicabile alla serie; Q=0 darebbe uguaglianza ma è escluso.

Verifica: AI_CONCEPTUAL; firma `0e412dc621bec9231a0ef27e1909e4c527e0f9df270882d4f0094882c1f7eabd`.

## C4-Q073

Ipotesi e dominio: Nodo intermedio isolato e inizialmente neutro; nessuna conduzione libera attraverso dielettrici ideali.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Si conserva la carica elettrica algebrica totale del nodo isolato,
inizialmente zero. Le cariche sulle sue parti si possono ridistribuire; non
si conservano separatamente su ciascuna armatura durante il transitorio.

Confronto delle alternative: Tensioni ed energie individuali non conservate durante carica; conduzione non nulla nel dielettrico contraddice isolamento.

Verifica: AI_CONCEPTUAL; firma `82f48b19ae74be30a9cf23738ee241c2cb7231505cff7078c6d3cd0bceb27642`.

## C4-Q074

Ipotesi e dominio: Serie con nodo intermedio neutro, capacità note positive ed equivalente 3<9 μF; inversa nel ramo fisico positivo.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Per la serie 3=9 Cx/(9+Cx). Moltiplico:27+3 Cx=9 Cx, dunque 6 Cx=27 e
Cx=27/6=9/2μF=4,5μF. L’inversa è Cx=Ceq C₁/(C₁−Ceq), con 0<Ceq<C₁.

Confronto delle alternative: 6/12 μF sottraggono/sommano direttamente; 2/9 μF copia coefficiente del reciproco con unità sbagliata.

Verifica: EXACT_ORACLE; firma `7209027884ce36b074f7b4aac1a4037d7d8017c8257d5e82a0621363a2090a95`.

## C4-Q075

Ipotesi e dominio: Condensatori identici C>0,V>0 isolati da sorgenti, polarità opposte; resistenza positiva consente esaurimento del transitorio.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Ciascun nuovo nodo unisce una carica+CV e una−CV, quindi parte
con carica netta zero. Dopo il transitorio reale dissipativo il modulo della
tensione comune è 0 V. L’energia iniziale dei due campi non può essere imposta
costante ai soli condensatori: va nel circuito e nell’ambiente. Un collegamento
idealizzato senza alcuna dissipazione richiederebbe descrivere il transitorio.

Confronto delle alternative: 2 V ignora nuove polarità, V/2 usa preparazione scarico/carico diversa; resistenza non crea carica finale del nodo.

Verifica: AI_CONCEPTUAL; firma `204e8d6a70bd79421ecdcb844323e6880cb70a5e3668152e541a0781f9545314`.

## C4-Q076

Ipotesi e dominio: Due nodi comuni al parallelo 3 e 6 μF; serie con 9 μF, nodo intermedio neutro e isolato.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Prima il parallelo:3+6=9μF. Poi la serie di due 9μF:
Ceq=9 × 9/(9+9)=81/18=9/2μF=4,5μF. Il raggruppamento va seguito attraverso i nodi,
non sommando tutti i valori senza distinguere i collegamenti.

Confronto delle alternative: 18 μF somma tutto in parallelo; 2 μF mette in serie i componenti interni; 9 μF omette secondo blocco in serie.

Verifica: EXACT_ORACLE; firma `ca280f6cebe3e5ca6462a84e27ecc8bd132cdd9e001faf6f82c585f1ec74a401`.

## C4-Q077

Ipotesi e dominio: Stessa coppia di nodi distinti, capacità non necessariamente uguali; un solo estremo comune non basta.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Il collegamento è in parallelo. La condizione determinante è la
stessa coppia di nodi; la stessa tensione ne segue come proprietà elettrica.

Confronto delle alternative: Un solo nodo comune o uguaglianza dei C non definiscono parallelo; nodi distinti non sono corto necessario.

Verifica: AI_CONCEPTUAL; firma `80cb080f29b4116c6355e5dd83e462e39667713dd2135ca26468a7611e8383ae`.

## C4-Q078

Ipotesi e dominio: Condensatori lineari isolati da generatori, positive insieme; transitorio resistivo esaurito, carica algebrica dei nodi conservata.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: La carica del nuovo nodo positivo è 2μF× 8 V+6μF× 4 V=16+24=40μC.
La capacità complessiva è 8μF: Vf=40/8=5 V, compresa fra 4 e 8 V. Il primo perde 6μC
e il secondo ne riceve 6. I campi passano da 112 a 100μJ: conservare la sola energia
dei condensatori darebbe una soluzione scorretta del transitorio reale.

Confronto delle alternative: 6 V media semplice richiede capacità uguali, 12 V somma tensioni; energia del solo campo non conservata nel transitorio resistivo.

Verifica: EXACT_ORACLE; firma `e143fe6e62c8a0a018b4be6fd87a662df1d2e0cfbfcafdb7b60e214343ba10e7`.

## C4-Q079

Ipotesi e dominio: Condensatori identici C>0, uno carico V>0 e altro scarico; resistenza positiva, stato finale elettrostatico; energia totale dei due campi.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Inizialmente Uᵢ=CV²/2. Alla fine la capacità totale è 2 C e la
tensione V/2, quindi Uf=(2 C)(V/2)²/2=CV²/4=Uᵢ/2. Ogni condensatore finale ha un
quarto dell’energia iniziale, ma ce ne sono due. La carica dei nodi si conserva.

Confronto delle alternative: Totale finale somma due energie da un quarto ciascuna; carica conservata non implica U conservata, finale positivo.

Verifica: AI_CONCEPTUAL; firma `3f6f09add115f8924b90c1bd2b5bd94adcbf46e850742fcdd669c009386333cf`.

## C4-Q080

Ipotesi e dominio: Stessi componenti positivi in due preparazioni topologiche distinte, nodo intermedio neutro per serie; rapporto adimensionale esatto.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Cp=4+12=16μF e Cs=4 × 12/(4+12)=3μF. Il rapporto esatto è 16/3,
adimensionale. Non richiedere la trascrizione di una rappresentazione decimale
infinita in un input Number a tolleranza zero: usare un risultato simbolico
selezionabile/accettato oppure una parametrizzazione o approssimazione manuale
con criterio di valutazione esplicito. La formula generale è(C₁+C₂)²/(C₁C₂).

Confronto delle alternative: 3/16 reciproco; 16 e 3 copiano singoli equivalenti. Alternativa 4 richiederebbe Cp=12 μF con Cs=3 μF, non 16; vecchia attribuzione al rapporto dei componenti respinta.

Verifica: EXACT_ORACLE; firma `5e506b0c14d7c9f7d27720c3ca8af148fa9e90b05b6d6c9f11258a94bb67e658`.
