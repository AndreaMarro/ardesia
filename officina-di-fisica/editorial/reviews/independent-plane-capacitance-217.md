# Revisione indipendente plane-capacitance-217

Gli 80 prompt originali U6-03 B215–219 sono stati letti e risolti individualmente prima di qualsiasi candidato, alternativa, chiave, soluzione o generatore. Primaria SHA256 4c49ff1e2020d073891686e5289e263561531a9b81e84e2f0fa9c8648dc90f4b; copia byte-identica nella fixture. Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, file packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-03.json, SHA256 0bd13e1748174df8c30e06641ad153b8e44ab98df47f31c9f1aba7f925f88077. Nessuna esposizione anticipata alle chiavi. Nessuna primaria altrui è stata aperta. I modelli sono stati scritti e realmente eseguiti prima dei candidati: model-run-1.json documenta exit 0; il modello finale deriva da quella versione e restringe inoltre la corrente operativa al dominio I>0 dichiarato nei candidati. Conserva il docstring storico NOT_RUN dell’istante iniziale, superato dal run documentato e dai nuovi test finali.

Dopo il congelamento della primaria ho letto integralmente ogni record finale: consegna, tutte le alternative, ogni blocco e formula, hint, feedback, metadati e didascalie. Nessun modulo autore è stato importato. Edizione finale letta: 2d27216100473a6d81a0774e369b4d9873054b48. I risultati derivano da potenza in serie, bilancio di calore latente, modello elettrostatico piano, Q=CV e integrale di carica del condensatore lineare. Catalogo reale C4-L03/L04/L07 e C3-L03/L04 riletto per le eccezioni autonome. Il modello della fusione non descrive il successivo circuito aperto; la polarizzazione non coincide con conduzione libera; l’energia immagazzinata non è tutto il lavoro della batteria.

Le quantità numeriche sono esatte, finite e reali prima di ogni operazione; denominatori e rami positivi controllati. I parametri geometrici devono inoltre restare nel regime di piastre estese. Il decoder AST conserva i lessemi originali e non usa eval o roundtrip attraverso float. SHA256 decoder b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc; modello indipendente f27c33334a9349c8941704334fd73761fe9bf0e4209472ea74ae5bb4a48081b4. Entrambi sono controllati e riportati per ciascun record. SymPy, Pint e Fraction sono separati dall’authoring. Le formule generali sono confrontate simbolicamente con tutte le cinque alternative; le domande concettuali hanno prove fisiche specifiche, non una semplice flag.

Tutto l’XML e ciascuno dei cinque nuovi PNG nativi completi sono stati realmente letti. Il processo SVG-only è terminato exit 0 sotto mutex e guardia ≥2 GiB; bounds, dimensioni PNG e source SHA sono nel render.json e nel manifest della fixture. Nessuna app, server o dati studenti sono stati usati nel rendering. Rettifiche B rilette: 21511 identifica il reciproco della sola quota iniziale, 21514 conserva una controprova senza falsa attribuzione al guadagno; 21601 nomina il primo pannello e 21609 fissa la potenza nel confronto della durata; 21814 usa una sostituzione verificabile senza attribuzione falsa al reciproco. Tutte le chiavi, leggi e figure sono rimaste identiche. Nessun finding residuo dopo queste riletture.

## Prove individuali

### AR-u6-plane-capacitance-01

C=εA/d. Con ε=10 pF/m, A=100 cm²=1/100 m² e d=1 mm=1/1000 m, C=10·10 pF=100 pF. Il dielettrico è lineare e il modello trascura il bordo; la geometria deve conservare dimensioni laterali grandi rispetto a d.

Ipotesi: Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.

Distrattori e controprove: 100 cm²=1/100 m², d=1/1000 m: A/d=10 m e C=100 pF.10 pF perde un fattore dieci;1 pF usa area1 cm²;100000 pF usa impropriamente d=10⁻⁶ m. La permittività10 pF/m è un dato esatto di modello, non epsilon zero universale.

Esito esatto indipendente: 100. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-plane-capacitance-02

La capacità ha unità farad, F=Coulomb/Volt; pF è un suo sottomultiplo. Da εA/d si verifica (F/m)·m²/m=F. Nella primaria le alternative non erano aperte; nella successiva lettura tutte e cinque sono state confrontate individualmente.

Ipotesi: Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.

Distrattori e controprove: Il farad è C/V. Il coulomb da solo misura carica; V,J,Ω sono tensione,energia,resistenza. Il simbolo C della capacità non cambia la propria unità in coulomb.

Esito esatto indipendente: F. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-plane-capacitance-03

In equilibrio elettrostatico il campo elettrico nel materiale conduttore è nullo; altrimenti le cariche libere continuerebbero a muoversi. Di conseguenza il potenziale è costante nel conduttore connesso e la carica libera netta in eccesso risiede alle superfici. Non estendere automaticamente E=0 a una cavità con cariche interne o all’esterno. La successiva lettura delle cinque alternative conferma la descrizione del campo nullo nel materiale e del potenziale uniforme.

Ipotesi: Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.

Distrattori e controprove: E=0 nel materiale conduttore in equilibrio e potenziale uniforme nel corpo connesso. Il valore assoluto del potenziale dipende dal riferimento; non è necessariamente zero. Le altre opzioni confondono campo esterno, corrente continua o neutralità con le condizioni necessarie. Le cavità sono esplicitamente escluse. Skill C4-L04 pertinente.

Esito esatto indipendente: Il campo elettrico è nullo e il potenziale è uniforme. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-plane-capacitance-04

A d e ε fissati, C è proporzionale all’area. Da 100 a 1 cm², C passa da 100 a 1 pF, fattore 1/100. L’ipotesi di bordo trascurabile va conservata anche dopo il cambiamento; non basta la sola positività di A e d per garantire una buona approssimazione geometrica reale.

Ipotesi: Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.

Distrattori e controprove: Area100→1 cm² con d fisso produce C100→1 pF. Dieci pF usa una radice del fattore d’area;10000 inverte;100 ignora;1/100 applica due volte il fattore. Si conserva il regime di bordo trascurabile dichiarato, non una promessa di esattezza di un condensatore reale finito.

Esito esatto indipendente: Da 100 pF a 1 pF. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-plane-capacitance-05

A=Cd/ε. Con C=100 pF, d=1 mm e ε=10 pF/m, A=1/100 m²=100 cm². In unità numeriche dichiarate il coefficiente si semplifica: A[cm²]=C[pF]d[mm].

Ipotesi: Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.

Distrattori e controprove: A=Cd/ε, risultato100 cm². Nelle unità prescritte il coefficiente si riduce a uno.10 cm² dividerebbe di nuovo per10 dopo la conversione già inclusa;100 m² cambierebbe l’area fisica di10⁴.

Esito esatto indipendente: 100. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-plane-capacitance-06

d=εA/C. Con ε=10 pF/m, A=1/100 m² e C=100 pF si ottiene d=1/1000 m=1 mm. C,A,ε devono restare positivi finiti; il limite C=0 non è un’inversa ammessa in questo modello.

Ipotesi: Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.

Distrattori e controprove: d=εA/C=1 mm. Il prodotto εA=1/10 pF·m diviso100 pF dà1/1000 m. Un quadrato di area100 cm² ha lato10 cm, quindi il gap1 mm resta piccolo. Nessun denominatore nullo.

Esito esatto indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-plane-capacitance-07

A ed ε restano fissi mentre d raddoppia. C_B/C_A=d_A/d_B=1/2. Capacità iniziale 100 pF e finale 50 pF; non si suppone fissata la carica durante il confronto se il collegamento elettrico non è specificato.

Ipotesi: Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.

Distrattori e controprove: Rapporto1/2, capacità100 e50 pF. Due rende diretto d; i quadrati non sono nella legge; uno ignora la modifica. Il collegamento al generatore non è necessario per la sola capacità geometrica.

Esito esatto indipendente: 1/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-plane-capacitance-08

Prendo x positivo da sinistra a destra. ΔV=V_destra−V_sinistra=−40 V e Δx=2 cm=1/50 m. E_x=−ΔV/Δx=+2000 V/m, diretto dalla piastra a +40 V verso quella a 0 V. L’uniformità segue dal modello piano senza effetti di bordo.

Ipotesi: Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.

Distrattori e controprove: Con x verso destra, ΔV=−40 V e Δx=1/50 m. E_x=−ΔV/Δx=2000 V/m verso destra. Sinistra inverte il segno;20 V/m usa2 cm come2 m;zero confonde il dielettrico/spazio interno con il metallo;40 V/m copia il numero della tensione. Skill C4-L03 pertinente.

Esito esatto indipendente: 2000 V/m verso destra. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-plane-capacitance-09

Da C=εA/d si moltiplica per d e si divide per ε>0: A=Cd/ε. Se C è espresso in pF e d in mm, con il valore assegnato di ε la formula per i valori numerici diventa A[cm²]=C[pF]d[mm]. Non confondere questa scorciatoia di unità con la legge dimensionale universale.

Ipotesi: Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.

Distrattori e controprove: Cd/ε ha m². εd/C e C/(εd) sono puri; ε/(Cd) ha m⁻²; Cεd ha F². Tutte le alternative fisiche sono state lette; la semplificazione numerica A=C d con unità normalizzate non sostituisce la formula dimensionale.

Esito esatto indipendente: C d / ε. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-plane-capacitance-10

Con ε invariata, A_B=κ₁A e d_B=κ₂d danno C_B/C_A=κ₁/κ₂. Fattori positivi mantengono i denominatori non nulli; occorre inoltre che entrambe le geometrie restino nel regime di bordo trascurabile.

Ipotesi: Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.

Distrattori e controprove: Il rapporto èκ₁/κ₂, con entrambe le geometrie ancora ammissibili. Prodotto e reciproco alterano dipendenze;κ₁ è già fattore d’area e non va quadrato come se fosse un lato;κ₂² non segue dalla separazione.

Esito esatto indipendente: κ₁ / κ₂. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-plane-capacitance-11

A: 100/1=100 pF. B: 400/2=200 pF. Rapporto 2: l’area fornisce un fattore quattro e la separazione un fattore inverso due.

Ipotesi: Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.

Distrattori e controprove: C_A100 pF, C_B200 pF: rapporto2. Quattro considera solo area;1/2 considera solo distanza o inverte l’intero rapporto;uno presume erroneamente fattori compensanti uguali.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-plane-capacitance-12

Media delle capacità (100+200)/2=150 pF. Il modello sui dati medi A=250 cm² e d=3/2 mm darebbe 250/(3/2)=500/3 pF. La differenza 500/3−150=50/3 pF è esatta, senza decimalizzazione.

Ipotesi: Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.

Distrattori e controprove: Media150 pF; il modello su area250 cm² e gap3/2 mm darebbe500/3 pF. Le alternative300,50,200 pF sono somma,semidifferenza,sola prova B. La differenza dei due tipi di media è50/3 pF esatta.

Esito esatto indipendente: 150. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-plane-capacitance-13

Bersaglio C_B=2·100=200 pF con A_B=400 cm². Da d[mm]=A[cm²]/C[pF] si trova d_B=2 mm, quindi d_B/d_A=2. Le due geometrie devono rispettare la stessa approssimazione piana.

Ipotesi: Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.

Distrattori e controprove: Bersaglio200 pF con area400 cm² impone gap2 mm e rapporto2. Mezzo inverte;quattro conserverebbe100 pF;uno darebbe400 pF;otto darebbe50 pF. Tutte le controprove ricompongono C=A/d nelle unità definite.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-plane-capacitance-14

Il riferimento C=100 pF con lettura 300 dà a_cal=3 pF⁻¹ per display adimensionale. Lettura 600 restituisce C=200 pF. Con d=2 mm si trova A=200·2=400 cm². Prima si rimuove la taratura, poi si usa la legge geometrica.

Ipotesi: Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.

Distrattori e controprove: Guadagno3 pF⁻¹, lettura600→C200 pF, gap2 mm→area400 cm².1200 usa il display come capacità;100 divide per d e darebbe50 pF;200 copia il numero della capacità senza il fattore del gap.

Esito esatto indipendente: 400. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-plane-capacitance-15

C_A=100 pF, C_B=200 pF; letture 201,401 danno a_cal=2 pF⁻¹ e b_cal=1. Lettura 3 restituisce C_C=(3−1)/2=1 pF. Con d=1 mm, A=1 cm². La validità della geometria piana resta un’ipotesi distinta dalla soluzione algebrica e deve essere conservata nell’edizione.

Ipotesi: Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.

Distrattori e controprove: Guadagno2 pF⁻¹ e offset1, lettura3→C1 pF e area1 cm² al gap1 mm.3/2 cm² omette offset e ricostruisce D4;2 cm² omette guadagno e D5;3 cm² usa D come area e D7. Si mantiene l’idealizzazione geometrica esplicita.

Esito esatto indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-plane-capacitance-16

Il vincolo numerico A[cm²]=100 d[mm] ha coefficiente 100 cm²/mm. Allora C[pF]=A/d=100 per ogni d>0 nel modello. La misura è ridondante: infinite coppie (A,d) proporzionali, restringendo eventualmente d al sottoinsieme che conserva dimensioni laterali grandi rispetto alla separazione. Non determina una scala assoluta.

Ipotesi: Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.

Distrattori e controprove: Il vincolo A=(100 cm²/mm)d fissa C100 pF per un continuo di geometrie. Gli esempi(100,1) e(200,2) nelle unità dichiarate non esauriscono la famiglia; la sola positività non autorizza d arbitrariamente grande rispetto ai lati. La candidata esplicita il vincolo di piastre estese. Nessuna scala assoluta ricavata dalla misura ridondante.

Esito esatto indipendente: Infinite coppie positive. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

## Figura e limiti

SVG completo a quattro pannelli e PNG indipendente 640×2040 letti. Primo quote schematiche A=100 cm²,d=1 mm non in scala reciproca. Secondo conduttore E=0 e V uniforme. Terzo +40/0 V e d=2 cm: tre frecce distinte lunghe 205 coordinate a destra, E=2000 V/m, punte tutte visibili. Ultime barre 160/320/240 per 100/200/150 pF, origine 150; zero118 lontano dall’asse.

UI del prodotto, layout responsive e approvazione umana NOT_RUN. Nessun marker UI creato o copiato. Publication DRAFT e publicationAction NONE. Identità fresh/saved su fixture finali effettive; confronto con ROOT integrato e replay canonico dell’integratore PENDING. Nessun candidato, registro, ledger, runtime o Git ROOT modificato. Il push pubblico è stato esplicitamente autorizzato dall’utente tramite ROOT.

Verifier SHA256 3a1b2dd74aeceac4bfa885966dd3fd835501c08a6019dc6d4d3437215d3c1170. Package canonico SHA256 9e80cd9df7441f20c956a0a851ec59d81bb6129647c3be82021c45b2c528de32. Binding canonico SHA256 c05ad4b636735e678a1a262fd9578a5d0bb4df2c0ded13eb43ae129831175702. Report SHA256 c819c8f50b747678730687e339e98ab12d5a1f2f4d2de065b48615d0744201c7.
