# Revisione distinta cric-c4-l07

Dieci problemi Cric distinti. La primaria e il modello Root sono congelati prima delle candidate. La precedente esposizione limitata Root al valore di Q091 rimane dichiarata e la compensazione source-only A db4f4c7e la precede. A ha risolto e riletto separatamente tutti i cinquanta prompt in 83337ef8 prima del modello Root e dei candidati; il nuovo boundary numerico e il modello sono stati eseguiti e congelati in 2bd7ec24 prima di aprire le candidate.

Sono stati letti integralmente ogni originale e candidato, tutti i cinque SVG candidati in XML e in cinque nuove PNG native indipendenti intere, diciotto SVG originali e le lezioni reali C4-L06–L10. Il target comune ha eseguito 19 test con exit 0. Nessun browser del prodotto, import o approvazione umana è attribuito al peer. Stato DRAFT; Root resta unico integratore.

## C4-Q061

Ipotesi e dominio: Condensatore lineare invariato; incrementi coerenti di modulo Q su una sola armatura e modulo V.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Per il condensatore lineare la pendenza Q/V è C, quindi anche
ΔQ=CΔV. La variazione di tensione è 5−2=3 V, non 5 V. C=18μC/3 V=6μF. I prefissi si
corrispondono perché μC/V=μF.

Confronto delle alternative: 18/5 e 18/2 μF mescolano incremento con lettura; 6·3=18 ricostruisce ΔQ.

Verifica: EXACT_ORACLE; firma `f3a9086882eb13b794808005dc79d86f5517153ebd118378507922b85a2c63f8`.

## C4-Q062

Ipotesi e dominio: Piastre cariche Q>0 isolate; area e permittività invariate, bordi trascurati nel regime piano.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Nel modello piano C=εA/d. Allontanare le armature riduce C; a Q
fissata |V|=|Q|/C aumenta nella stessa proporzione di d. **Q deve essere non
nulla** per un aumento stretto; se il condensatore è scarico resta V=0. Scrivere
«condensatore carico» e chiedere il modulo della tensione evita ambiguità di segno.

Confronto delle alternative: Vecchia sorgente scollegata non fissa V; isolamento non annulla campo; polarità non si inverte allontanando piastre.

Verifica: AI_CONCEPTUAL; firma `fff21159ba189efeb7591d3b071001bbeda28aaf3505aa624aa24a02accdf599`.

## C4-Q063

Ipotesi e dominio: Capacità definita mediante modulo su una sola armatura e modulo della tensione; unità SI C/V.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: L’unità è il farad:1 F=1 C/V. La capacità confronta la carica di una
armatura con la differenza di potenziale, non con una corrente.

Confronto delle alternative: Coulomb misura carica, volt tensione, ohm resistenza e tesla campo; farad è C/V.

Verifica: AI_CONCEPTUAL; firma `aff82417004c643077c7c928573795ebb1c0fb54f69e1e04b1b3bb8191bcc7eb`.

## C4-Q064

Ipotesi e dominio: Costante ε₀ numerica prescritta come modello; distanza 1 mm piccola rispetto al lato 10 cm; area affacciata e area della sezione non confuse.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Inverto C=ε₀A/d: A=Cd/ε₀. Il rapporto 88,5/8,85 vale 10; i pF si
cancellano fra C e il valore di ε₀ espresso in pF/m. Risulta A=10 m×(1/1000)m
=1/100 m². Poiché 1 m²=10⁴cm², l’area è 100 cm². La conversione dell’area è quadratica;
non basta moltiplicare per 100.

Confronto delle alternative: 1 cm² usa conversione lineare per area; 10000 cm² richiede distanza 0,10 m alla C assegnata, non 1 mm; vecchia attribuzione al fattore mille respinta.

Verifica: EXACT_ORACLE; firma `4dde82d54542943bb5a942fa366307126b3c27e62eb7d4a5aaf3c04277f7fa5b`.

## C4-Q065

Ipotesi e dominio: Condensatore lineare inizialmente scarico, caricamento lento; lavoro ∫V dq, tutte le alternative lette; il grafico duale Q(V) non è proposto come falso.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Il lavoro elementare di carica è dU=Vdq: il grafico direttamente
associato al lavoro ha q orizzontale e V verticale. Per C costante V=q/C e
l’integrale da 0 aQ è il triangolo U=QV/2. **Cautela per le alternative:** anche
il grafico inverso Q(V), se lineare, ha area numericamente uguale CV²/2.
Non classificarlo automaticamente come distrattore falso. Se si vuole una sola
scelta, specificare il grafico dell’integrale Vdq oppure costruire alternative
senza due triangoli entrambi equivalenti nel modello lineare.

Confronto delle alternative: Altri assi proposti danno K·s, Ω·m, T·s o C·s, non J; nessuna seconda alternativa duale con stessa area è presente.

Verifica: AI_CONCEPTUAL; firma `7c11e4b80899d522c71bbdc09f5c7afe3323eb6beeeccb231249015b7b474e1b`.

## C4-Q066

Ipotesi e dominio: Stessa capacità positiva, due tensioni in modulo con origine energetica scarica comune; differenza di quadrati.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: U=CV²/2, perciò ΔU=(5μF/2)(4²−2²)V²=(5/2)× 12μJ=30μJ. Sottrarre
prima le tensioni e poi elevare al quadrato darebbe una diversa grandezza.
μF·V²=μJ, controllato anche nel percorso SI indipendente.

Confronto delle alternative: 40 μJ finale e 10 μJ iniziale non aumento; C(ΔV)²/2 coincide qui con 10 μJ per caso, non legge corretta.

Verifica: EXACT_ORACLE; firma `05d2eb7f0f40806a02c7ada28192a24d294cd71831506a084b18c660ea993c2b`.

## C4-Q067

Ipotesi e dominio: Dielettrico lineare, generatore ideale collegato durante inserimento; caso non nullo specificato nella formula del rapporto.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Il generatore ideale collegato fissa la differenza di potenziale.
Inserendo il dielettrico cresce C e il generatore può fornire altra carica:
non si conserva automaticamente Q come nel condensatore isolato.

Confronto delle alternative: Carica, C e U possono variare; dielettrico non cortocircuita e generatore scambia carica mantenendo V.

Verifica: AI_CONCEPTUAL; firma `98f13f0f9a06dd729b551800c8f93b6c7b820e2f82fb2f3f6ef4308c9b9ddf84`.

## C4-Q068

Ipotesi e dominio: Generatore da 8 V mantenuto per intero; capacità raddoppiata e energia iniziale 16 μJ, campo distinto dal lavoro totale del generatore.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Con la tensione **mantenuta a 8 V dal generatore**, U=CV²/2 è
proporzionale a C. Se C raddoppia,16μJ diventano 32μJ. Se invece si scollegasse
la sorgente e si fissasse Q, varrebbe U=Q²/(2 C) e il risultato sarebbe diverso.
Esplicitare che il collegamento resta durante l’inserimento.

Confronto delle alternative: 8 μJ usa isolamento a Q fissa; 16 μJ impone conservazione del solo campo; lavoro generatore distinto.

Verifica: EXACT_ORACLE; firma `443e7eed98ff9564bd9fc455c1de245046b9be50950417d33fc73ad5381bd4c1`.

## C4-Q069

Ipotesi e dominio: Cariche opposte +7 e −7 μC, Q definito come modulo su UNA armatura; totale algebrico e somma dei moduli distinti.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Q è il modulo su una sola armatura:7μC. La carica netta dell’intero
condensatore è zero, mentre la somma dei moduli sarebbe 14μC: nessuna delle due
sostituisce Q nella definizione data.

Confronto delle alternative: 14 μC conta entrambe le armature, zero totale algebrico, valori negativi non moduli.

Verifica: AI_CONCEPTUAL; firma `98fa5235e0eb69b281b0e7e15298d5ec35df9912c917fe2a6393e09ed416a4e1`.

## C4-Q070

Ipotesi e dominio: Capacità positiva 8 μF, energia 100 μJ, richiesta del modulo sceglie radice non negativa; segno della polarità non identificato.

Derivazione e calcolo manuale: Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Da U=CV²/2 ricavo |V|=√(2 U/C). Il radicando è 200μJ/(8μF)=25 V²;
la radice positiva è 5 V. Non serve approssimare una radice irrazionale. La
richiesta del modulo seleziona il valore non negativo.

Confronto delle alternative: 25 V copia V²; 5/2 V darebbe 25 μJ; radice negativa non è modulo.

Verifica: EXACT_ORACLE; firma `8a71f4997847b46ed29066a6e4e0066e6865896db6ca7ceff1f81432db0b5775`.
