# Revisione indipendente series-parallel-resistor-network-208

Gli 80 prompt originali U6-02 B205–209 sono stati letti e risolti individualmente prima di qualsiasi candidato, alternativa, chiave o soluzione altrui. Primaria SHA256 e8b27ab57d7cae8ac419227900fbb28282555d33ba3c3265e0e55199e19378bd, copia byte-identica in u6-independent-205-209-fixtures-20261125/primary-source-only.md. Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, file packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-02.json, SHA256 fc81a187db9ee2f6d17bf299b333defd87a754ad04fc7efaddd2c40737ecc24d. Nessuna esposizione anticipata alle chiavi U6-02. La primaria è rimasta immutata.

Successivamente ho letto integralmente i sedici record finali: ogni consegna, tutte le alternative, ogni blocco e formula, hint, feedback, metadati e didascalie. Le leggi e gli esiti sono stati confrontati con la primaria indipendente; nessun modulo autore è stato importato. Edizione finale letta: 8c30df9ded9344adddd257b241fbd103d3532fe1. I modelli derivano da conservazione del volume, legge ohmica e leggi di Kirchhoff secondo la topologia pertinente. Catalogo reale C4-L05/L06 riletto; il caso sui materiali è distinto dalla riduzione delle reti.

Le inverse conservano parametri reali finiti, resistenze positive e denominatori non nulli; il conteggio di elementi rimane intero positivo dove richiesto. Le tarature hanno guadagno positivo e possono avere offset negativo. Il decoder AST legge esattamente i lessemi originali, senza eval né ricostruzione da float binari. Il suo SHA256 b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc è controllato e riportato per ogni record. SymPy, Pint e Fraction forniscono oracoli separati dai generatori.

Tutto l’XML e il nuovo rendering nativo completo sono stati letti. I cinque render asset-only sono realmente terminati con exit 0 sotto mutex condiviso e guardia di spazio libero ≥ 2 GiB. Le copie esatte di SVG, PNG e log sono nella fixture con manifest. Le rettifiche d’autore sono state rilette prima del congelamento: 205 didascalia dei due fili e descrizione simbolica; 206 parentesi della somma e attribuzione del numero puro; 207 controprova della conduttanza e tensione positiva esplicita; 208 scale comuni solo entro il pannello; 209 somma di N cadute senza uguaglianza interna spezzata. Chiavi, leggi e geometrie sono rimaste invariate; nessun helper autore globale è stato modificato.

## Prove individuali

### AR-u6-series-parallel-resistor-network-01

Ridurre prima il parallelo r||R=rR/(r+R), poi aggiungere il primo r in serie: S=r+rR/(r+R)=r(r+2 R)/(r+R). Per r=R=2 Ω: parallelo 1 Ω e totale 3 Ω. Nella candidata la stessa resistenza totale della primaria è indicata con T.

Ipotesi: Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.

Distrattori e controprove: 6 Ω mette tutti gli elementi in serie; 2/3 Ω li mette tutti in parallelo; 1 Ω omette il resistore esterno; 2 Ω omette il blocco in parallelo.

Esito esatto indipendente: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-series-parallel-resistor-network-02

Il totale S è resistenza, quindi Ω; somma e quoziente sono dimensionalmente coerenti perché rR/(r+R) ha Ω. Nella primaria prompt-only le alternative non erano aperte; nella successiva revisione tutte e cinque sono state lette e confrontate: solo Ω è resistenza. Nella candidata la stessa resistenza totale della primaria è indicata con T.

Ipotesi: Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.

Distrattori e controprove: S misura conduttanza, A corrente, V tensione e Ω² un prodotto privo del necessario denominatore. T è qui una resistenza, non una temperatura.

Esito esatto indipendente: Ω. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-series-parallel-resistor-network-03

La topologia contiene un primo r in serie con due rami r e R fra la stessa coppia di nodi. Legge corretta S=r+rR/(r+R), non una serie di tre né un parallelo di tre. Nella candidata la stessa resistenza totale della primaria è indicata con T.

Ipotesi: Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.

Distrattori e controprove: 2r+R tratta i tre elementi come serie; 1/(2/r+1/R) li pone tutti in parallelo; rR/(2r+R) altera il blocco; r+R elimina un ramo.

Esito esatto indipendente: T = r + r R / (r + R). Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-series-parallel-resistor-network-04

Entrambi i resistori denominati r cambiano insieme da 2 a 1 Ω; R resta 2 Ω. Totale iniziale 3 Ω; finale 1+2/3=5/3 Ω. Non si cambia soltanto il resistore in serie. Nella candidata la stessa resistenza totale della primaria è indicata con T.

Ipotesi: Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.

Distrattori e controprove: 2 Ω modifica soltanto il resistore esterno; 3/2 Ω scala anche R, rimasta invariata; 3 Ω ignora la modifica; 4 Ω aumenta mentre entrambe le occorrenze di r diminuiscono.

Esito esatto indipendente: Da 3 a 5/3 Ω. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-series-parallel-resistor-network-05

Con S=3 Ω, R=2 Ω, moltiplico S(r+R)=r²+2 rR: r²+(2 R−S)r−SR=0 ⇒r²+r−6=(r−2)(r+3)=0. Radici 2 e−3 Ω: solo r=2 Ω è positiva e dà la rete richiesta. Nella candidata la stessa resistenza totale della primaria è indicata con T.

Ipotesi: Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.

Distrattori e controprove: −3 Ω è la radice negativa esclusa dalla passività; r=1 Ω dà T=5/3 Ω; r=3 Ω dà 21/5 Ω. Il totale non è una serie semplice r+R.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-series-parallel-resistor-network-06

Ponendo P=S−r, il parallelo soddisfa P=rR/(r+R). Si ricava R=r(S−r)/(2 r−S). ConS 3, r 2 Ω ottengo 2·1/1=2 Ω. In generale, per r, R finiti positivi occorre r<S<2 r. Nella candidata la stessa resistenza totale della primaria è indicata con T.

Ipotesi: Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.

Distrattori e controprove: R=1 Ω dà T=8/3 Ω e R=3 Ω dà 16/5 Ω. I confini T=r e T=2r sono esclusi per un ramo R finito e positivo.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-series-parallel-resistor-network-07

A=3 Ω. B con r 2, R 1 Ω:2+2/3=8/3 Ω. Rapporto(8/3)/3=8/9. Entrambi i resistori r restano 2 Ω. Nella candidata la stessa resistenza totale della primaria è indicata con T.

Ipotesi: Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.

Distrattori e controprove: 9/8 è il reciproco; 1/2 segue soltanto R; 2/3 copia il valore numerico del parallelo finale in Ω; 1 ignora la variazione.

Esito esatto indipendente: 8/9. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-series-parallel-resistor-network-08

Corretto 3 Ω, proposta 6 Ω: scarto+3 Ω. Sei sarebbe la serie di tutti e tre, una topologia diversa. Nella candidata la stessa resistenza totale della primaria è indicata con T.

Ipotesi: Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.

Distrattori e controprove: −3 Ω inverte lo scarto; 6 Ω copia la proposta; zero la accetta; 2 è un rapporto adimensionale e non lo scarto.

Esito esatto indipendente: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-series-parallel-resistor-network-09

S(r+R)=r²+2 rR ⇒r²+(2 R−S)r−SR=0. Discriminante(2 R−S)²+4 SR=S²+4 R². Radice positiva r=[S−2 R+√(S²+4 R²)]/2; l’altra è negativa perché il prodotto delle radici è−SR<0. Per S, R>0 esiste una sola r>0; le unità sotto radice sono Ω². Nella candidata la stessa resistenza totale della primaria è indicata con T.

Ipotesi: Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.

Distrattori e controprove: Il segno meno davanti alla radice seleziona una resistenza negativa; T−R impone una falsa serie; TR/(T+R) impone un parallelo inesistente; +2R cambia il coefficiente della quadratica.

Esito esatto indipendente: r = (T − 2R + √(T² + 4R²)) / 2. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-series-parallel-resistor-network-10

Con r_B=κ₁r, R_B=κ₂R, S_B=κ₁r+(κ₁κ₂rR)/(κ₁r+κ₂R). Rapporto S_B/S_A ottenuto dividendo per r+rR/(r+R), equivalente a κ₁(κ₁r+2κ₂R)(r+R)/[(κ₁r+κ₂R)(r+2 R)]. Nessun denominatore nullo con dati positivi. Nella candidata la stessa resistenza totale della primaria è indicata con T.

Ipotesi: Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.

Distrattori e controprove: Prodotto e quoziente dei soli fattori omettono i pesi e le due occorrenze di r; il rapporto delle somme descrive un’altra rete; 1/κ₁ inverte anche una scalatura uniforme.

Esito esatto indipendente: κ₁ (κ₁ r + 2κ₂ R) (r + R) / [(κ₁ r + κ₂ R) (r + 2R)]. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-series-parallel-resistor-network-11

A:3 Ω. B r 3, R 6 Ω:3+18/9=5 Ω. Rapporto 5/3. Nella candidata la stessa resistenza totale della primaria è indicata con T.

Ipotesi: Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.

Distrattori e controprove: 3/5 è il reciproco; 3/2 segue soltanto r; 3 segue soltanto R; 2 confronta i blocchi in parallelo e omette il tratto esterno.

Esito esatto indipendente: 5/3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-series-parallel-resistor-network-12

Media delle uscite(3+5)/2=4 Ω. Ai dati medi r=5/2, R=4 Ω, S=5/2+20/13=105/26 Ω;105/26−4=1/26 Ω. Non si usa il modello sulle medie al posto della media richiesta. Nella candidata la stessa resistenza totale della primaria è indicata con T.

Ipotesi: Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.

Distrattori e controprove: 105/26 Ω applica il modello ai dati medi; 8 Ω omette la divisione per due; 1 Ω è metà della differenza; 3 Ω ripete la prima prova. La differenza fra i due tipi di media è 1/26 Ω.

Esito esatto indipendente: 4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-series-parallel-resistor-network-13

Bersaglio(5/3)·3=5 Ω, con r_B 3 Ω. Il parallelo deve valere 2 Ω:2=3 R/(3+R)⇒R=6 Ω. Rapporto con R_A 2 Ω:3. Si ha 3<S 5<6, quindi dominio inverso rispettato. Nella candidata la stessa resistenza totale della primaria è indicata con T.

Ipotesi: Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.

Distrattori e controprove: 1/3 è il reciproco; 5/3 copia il rapporto dei totali; 6 copia il valore numerico finale di R in Ω; 3/2 segue soltanto r. Il bersaglio rispetta r<T<2r.

Esito esatto indipendente: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-series-parallel-resistor-network-14

S_A 3 Ω con lettura 9 dà a=3 Ω⁻¹. Lettura 15 indica S 5 Ω, R 6 Ω. Equazione r²+7 r−30=(r−3)(r+10)=0; solo r=3 Ω positiva. È il valore di entrambi i resistori uguali. Nella candidata la stessa resistenza totale della primaria è indicata con T.

Ipotesi: Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.

Distrattori e controprove: −10 Ω è la radice negativa; 5 Ω copia il totale; r=2 Ω con R=6 Ω dà T=7/2 Ω e lettura 21/2, non 15.

Esito esatto indipendente: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-series-parallel-resistor-network-15

R_A 3 eR_B 5 Ω con letture 7,11 danno a=2 Ω⁻¹, b=1. Lettura 13 indica S 6 Ω, R 4 Ω. Equazione r²+2 r−24=(r−4)(r+6)=0, quindi r=4 Ω; radice−6 non fisica. Nella candidata la stessa resistenza totale della primaria è indicata con T.

Ipotesi: Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.

Distrattori e controprove: 6 Ω dà T=42/5 Ω; 2 Ω dà 10/3 Ω; 3 Ω dà 33/7 Ω; −6 Ω è l’altra radice, esclusa dalla passività.

Esito esatto indipendente: 4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-series-parallel-resistor-network-16

Vincolo r=R=x>0. Il parallelo è x/2 e il totale 3 x/2. Misura 3 Ω impone x=2 Ω: seconda resistenza R 2 Ω e i due r anch’essi 2 Ω. Unica soluzione positiva. Nella candidata la stessa resistenza totale della primaria è indicata con T.

Ipotesi: Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.

Distrattori e controprove: 1 Ω copia il solo parallelo della prova corretta; 3 Ω copia il totale; −2 Ω non è passivo. La misura di T fissa la scala dopo il vincolo r=R.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

## Figura e limiti

XML e rendering nativo indipendente completo letti. Il resistore r esterno precede il nodo (300,240); i rami r e R condividono quel nodo e (550,240). Nel secondo pannello i segmenti 80+40 e 120+80 rappresentano 2+1 e 3+2 Ω con scala 40 coordinate/Ω. Nel terzo le barre 180,300,240 rappresentano 3,5,4 Ω con scala 60 coordinate/Ω. La didascalia distingue esplicitamente le scale fra pannelli; la scala è comune soltanto entro ciascun pannello. Gli zeri a x=125 sono liberi dagli assi.

UI del prodotto, verifica del layout responsive e approvazione umana NOT_RUN. Nessun marker UI creato o copiato. Publication DRAFT e publicationAction NONE. Le fixture e l’identità fresh/saved sono controlli della revisione locale; confronto con ROOT integrato e replay canonico dell’integratore restano PENDING. Nessun candidato, registro, ledger, runtime o Git ROOT modificato. Nessun push o upload durante il vincolo operativo di ROOT.

Verifier SHA256 1db2e215b1b5c8faccf81f6f7890038e00f260a79dfcbd67854c83cd5e87e144. Package canonico SHA256 13109bdd5206ed33036194dbb4f5f05382e780581958924c009528be0528f626. Binding canonico SHA256 a64b8a65f671b4969ed2d66fc3e165c8cae227b6ee6a37748bf75cf3b67d1c75. Report SHA256 b412c6cdaa70b02039c46fbf7a72859582a884b00d75e73805c358dcd59c03e7.
