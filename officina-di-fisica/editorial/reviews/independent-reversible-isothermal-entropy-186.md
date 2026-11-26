# Revisione indipendente reversible-isothermal-entropy-186

Primaria completa degli 80 prompt originali U5-04 salvata prima di candidati, opzioni o chiavi: primary-thermal-transport-183-187-before-candidates-20261125.md, SHA256 004be03cceb688102d1fd50cfb07cf059633b87b608ffc149f19a1a8a4831c95. Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605; shard SHA256 dd52bd4155f765395f5cd10f89259dd35a1dab194da5942ee067e73578a1ff16. I messaggi di consegna hanno anticipato soltanto SHA, percorsi e ipotesi generali, senza risultati. Nessun modulo d’autore importato o usato per le derivazioni.

Poi sono stati letti individualmente tutti i 16 prompt finali, tutte le opzioni, ogni blocco, formula, hint, feedback, metadato e didascalia. Le leggi, i numeri e i domini finali sono stati ricalcolati separatamente. Package e binding ROOT sono byte-identici al pin finale B 1597d4ac6e806f078da028774ceb3051a8b9e0b6; non si congela una versione precedente. Il catalogo reale C3-L01/L05/L06/L09/L10 è stato riletto: scala assoluta per radiazione ed entropia, vie di trasferimento e distinzione fra variazione di una parte e produzione totale. La competenza primaria effettiva è C3-L10.

Gli oracoli derivano le leggi e le inverse con SymPy, verificano unità con Pint/Fraction e mantengono calcoli razionali esatti. La quarta e quinta radice dei casi numerici si riconoscono tramite potenze intere perfette; nessuna valutazione a calcolatrice o approssimazione logaritmica è necessaria. Le alternative simboliche sono confrontate come leggi generali: una coincidenza per parametri particolari non rende corretta una falsa legge. Non si attribuisce PASS dalla sola chiave o da dichiarazioni dell’autore.

## Lettura e prova individuale

### AR-u5-reversible-isothermal-entropy-01

La definizione reversibile è ΔS=∫δQ_rev/T. A T costante positiva si ottiene Q_rev/T=600/300=2 J/K, aumento dell’entropia del sistema.

Ipotesi: Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 0 è totale sistema+sorgente;−2 inverte calore;180000 è prodottoJ K;600J è energia.

Esito indipendente esatto: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-reversible-isothermal-entropy-02

Entropia ha unità J/K, dimensione energia per temperatura. J è calore ed energia, non entropia; K è soltanto temperatura. Nessuna lettera scelta senza opzioni. Le alternative candidate sono state poi lette integralmente: unica unità compatibile J/K.

Ipotesi: Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: J energia,K temperatura,W potenza,K/J inverso; J/K non identifica da sola entropia e capacità.

Esito indipendente esatto: J/K. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u5-reversible-isothermal-entropy-03

Reversibilità significa produzione interna nulla, non entropia del sistema invariata. Con Q_rev>0, ΔS_sistema=Q_rev/T>0; la sorgente reversibile alla stessa temperatura perde −Q_rev/T. La somma universo è zero nel modello completo.

Ipotesi: Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: Produzione zero non impone ΔS individuale zero; sorgente perde quanto sistema riceve.

Esito indipendente esatto: No: il sistema aumenta di Q_rev/T e la sorgente diminuisce dello stesso valore. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u5-reversible-isothermal-entropy-04

A T=300 K, Q da 600 a 1200 J dà ΔS da 2 a 4 J/K. Raddoppia il trasferimento entropico, senza produzione interna nel processo reversibile.

Ipotesi: Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 1 rende inverso Q;8 introduce quadrato;2 ignora Q;0 confonde totale e sistema.

Esito indipendente esatto: Da 2 a 4 J/K. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-reversible-isothermal-entropy-05

Q_rev=TΔS=300 K·2 J/K=600 J. Si usa la temperatura assoluta, non una lettura Celsius.

Ipotesi: Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: T/ΔS=150 haK²/J;2 e300 copiano numeri senza unità corrette.

Esito indipendente esatto: 600. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-reversible-isothermal-entropy-06

T=Q_rev/ΔS=600/(2 J/K)=300 K. Denominatori non nulli garantiti da Q_rev>0 e ΔS>0.

Ipotesi: Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 0 confonde T eΔT;1200 è prodotto con unitàJ²/K;reciproco èK⁻¹.

Esito indipendente esatto: 300. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-reversible-isothermal-entropy-07

A=600/300=2 J/K; B=600/600=1 J/K. Rapporto 1/2: stessa energia trasferita a temperatura maggiore porta meno entropia.

Ipotesi: Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 2 inverte confronto;1 ignora T;1/4 e4 applicano quadrato.

Esito indipendente esatto: 1/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-reversible-isothermal-entropy-08

Proposta 4 J/K−corretto 2 J/K=+2 J/K. Lo scarto è distinto dall’entropia prodotta, nulla per ipotesi reversibile.

Ipotesi: Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: −2 cambia ordine;4 copia proposta;0 la accetta;2 puro è rapporto e non scartoJ/K.

Esito indipendente esatto: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-reversible-isothermal-entropy-09

Moltiplicare ΔS=Q_rev/T per T dà Q_rev=TΔS, energia in J e positiva sul ramo assegnato.

Ipotesi: Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: ΔS/T haJ/K²;T/ΔS haK²/J;1/(TΔS) haJ⁻¹;somma è disomogenea.

Esito indipendente esatto: Q_rev = T ΔS. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u5-reversible-isothermal-entropy-10

ΔS_B/ΔS_A=(κ₁Q_rev/(κ₂T))/(Q_rev/T)=κ₁/κ₂, con fattori positivi e temperature assolute.

Ipotesi: Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: Prodotto rende diretta T;reciproco scambia ingressi;quadrato conta Q due volte;differenza dà0 per prove uguali.

Esito indipendente esatto: κ₁/κ₂. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u5-reversible-isothermal-entropy-11

A=2 J/K; B con Q=1 J e T=1 K dà 1 J/K. Rapporto 1/2. Il sistema non è descritto come gas classico: non si applicano capacità termiche non assegnate a 1 K.

Ipotesi: Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 1/600 segue soloQ;300 segue solo inversaT;2 reciproco;600 inverte rapporto deiQ.

Esito indipendente esatto: 1/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-reversible-isothermal-entropy-12

Media (2+1)/2=3/2 J/K. Il quoziente degli ingressi medi Q=601/2 J e T=301/2 K dà 601/301 J/K, altra operazione.

Ipotesi: Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 601/301 usa ingressi medi;3 omette metà;1/2 è metà differenza;2 ignora B.

Esito indipendente esatto: 3/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-reversible-isothermal-entropy-13

Bersaglio (1/2)·2=1 J/K con Q_B=1 J dà T_B=1 K. Rapporto T_B/T_A=1/300, puro; T_B resta positivo.

Ipotesi: Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 300 reciproco;1/600 copia rapportoQ;1/2 bersaglio entropia;2 inverte solo bersaglio.

Esito indipendente esatto: 1/300. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-reversible-isothermal-entropy-14

Da S_A=6 e ΔS_A=2 J/K: a=3 K/J. S_B=3 dà ΔS_B=1 J/K. Con T_B=1 K segue Q_B=1 J.

Ipotesi: Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 3J usa display comeJ/K senza guadagno;300J usa T diA;2J copia ΔS_A.

Esito indipendente esatto: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-reversible-isothermal-entropy-15

a=(5−3)/(2−1)=2 K/J; b=1. S_C=9 dà ΔS_C=(9−1)/2=4 J/K. T_C=300 K: Q_C=1200 J.

Ipotesi: Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.

Distrattori e controprove: 1350 ometteb;600 tornaA;900 usa3J/K anziché4;4J copia numero diΔS.

Esito indipendente esatto: 1200. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u5-reversible-isothermal-entropy-16

Vincolo Q_rev=(2 J/K)T fra processi. Sostituzione dà ΔS=2 J/K per qualunque T>0; la misura non aggiunge equazione indipendente. Infinite coppie, ad esempio (Q=600 J,T=300 K) e (Q=2 J,T=1 K).

Ipotesi: Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. Il vincolo fra preparazioni non è una legge temporale entro la singola prova.

Distrattori e controprove: 600J/300K e2J/1K sono due esempi distinti;T=0 escluso;la misura ridondante non limita a due coppie.

Esito indipendente esatto: Infinite: ogni T>0 con Q_rev=βT. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

## Figura e limiti delle prove

XML e PNG nativo integrale letti. Freccia schematica600J da sorgente300K a sistema300K nel limite reversibile. Barre con segno−2 e+2J/K lunghezze200 a origine comunex320; totalezero. Pannello separato di prove del solo sistema2/1/3/2J/K con larghezze240/120/180. Zero centrale sotto l’asse, altre etichette non attraversate. Nessuna identità fra media e totale.

Cinque rendering nativi Quick Look realmente terminati con exit 0, sotto mutex condiviso e guardia di spazio libero ≥ 2 GiB; PNG integrali letti, XML e log conservati. Queste sono prove asset-only, non un replay del prodotto o del layout a 320 px. Tutta UI del prodotto rimane NOT_RUN in questo perimetro; nessun marker inventato o riusato. Nessuna modifica a candidati, runtime, registro, checkpoint o Git ROOT.

## Provenienza congelata

Verifier SHA256 426f985bbfb0a1e40bb7f37fceae2f28231129378d08e0178916d3c046c79962. Package canonico SHA256 f539d8c0b347f00b3899272d001bd71d5a736e29e9bd63359c8524c1fa969b4b. Binding canonico SHA256 a4cb613aa1cf58b21952a79fdd518abc8153c9801b35ac0aeae8156ff2f0c019. Report SHA256 41387cb19f5e147ca0d908163c6af0b5869300b2d1018c58c2facbabfc6da92a.

Review AI distinta dall’autore; human NOT_RUN; publication DRAFT; publicationAction NONE. Nessuna nuova integrazione o pubblicazione attribuita.

## Controlli automatici distinti conclusi

Il test comune indipendente è terminato realmente con exit 0: 13 test in 3,763 s. Sono state respinte 125 mutazioni dei pacchetti, di cui 80 risposte errate con binding, token e pin sostituiti soltanto in memoria per isolare gli oracoli matematici; respinti anche cinque guasti alle funzioni costitutive. Sono state provate 240 configurazioni Hypothesis e le identità canoniche dei report fresh e salvati di tutti gli 80 record. Log autentico conservato in thermal-entropy-183-187-independent-tests-20261125.txt. Tutta la suite del corpus e la UI del prodotto sono fuori da questa prova locale.
