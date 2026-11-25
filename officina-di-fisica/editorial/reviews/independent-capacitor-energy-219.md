# Revisione indipendente capacitor-energy-219

Gli 80 prompt originali U6-03 B215–219 sono stati letti e risolti individualmente prima di qualsiasi candidato, alternativa, chiave, soluzione o generatore. Primaria SHA256 4c49ff1e2020d073891686e5289e263561531a9b81e84e2f0fa9c8648dc90f4b; copia byte-identica nella fixture. Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, file packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-03.json, SHA256 0bd13e1748174df8c30e06641ad153b8e44ab98df47f31c9f1aba7f925f88077. Nessuna esposizione anticipata alle chiavi. Nessuna primaria altrui è stata aperta. I modelli sono stati scritti e realmente eseguiti prima dei candidati: model-run-1.json documenta exit 0; il modello finale deriva da quella versione e restringe inoltre la corrente operativa al dominio I>0 dichiarato nei candidati. Conserva il docstring storico NOT_RUN dell’istante iniziale, superato dal run documentato e dai nuovi test finali.

Dopo il congelamento della primaria ho letto integralmente ogni record finale: consegna, tutte le alternative, ogni blocco e formula, hint, feedback, metadati e didascalie. Nessun modulo autore è stato importato. Edizione finale letta: 1a91b563ba64de41d16b92dc6dc861806f928bdd. I risultati derivano da potenza in serie, bilancio di calore latente, modello elettrostatico piano, Q=CV e integrale di carica del condensatore lineare. Catalogo reale C4-L03/L04/L07 e C3-L03/L04 riletto per le eccezioni autonome. Il modello della fusione non descrive il successivo circuito aperto; la polarizzazione non coincide con conduzione libera; l’energia immagazzinata non è tutto il lavoro della batteria.

Le quantità numeriche sono esatte, finite e reali prima di ogni operazione; denominatori e rami positivi controllati. I parametri geometrici devono inoltre restare nel regime di piastre estese. Il decoder AST conserva i lessemi originali e non usa eval o roundtrip attraverso float. SHA256 decoder b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc; modello indipendente f27c33334a9349c8941704334fd73761fe9bf0e4209472ea74ae5bb4a48081b4. Entrambi sono controllati e riportati per ciascun record. SymPy, Pint e Fraction sono separati dall’authoring. Le formule generali sono confrontate simbolicamente con tutte le cinque alternative; le domande concettuali hanno prove fisiche specifiche, non una semplice flag.

Tutto l’XML e ciascuno dei cinque nuovi PNG nativi completi sono stati realmente letti. Il processo SVG-only è terminato exit 0 sotto mutex e guardia ≥2 GiB; bounds, dimensioni PNG e source SHA sono nel render.json e nel manifest della fixture. Nessuna app, server o dati studenti sono stati usati nel rendering. Rettifiche B rilette: 21511 identifica il reciproco della sola quota iniziale, 21514 conserva una controprova senza falsa attribuzione al guadagno; 21601 nomina il primo pannello e 21609 fissa la potenza nel confronto della durata; 21814 usa una sostituzione verificabile senza attribuzione falsa al reciproco. Tutte le chiavi, leggi e figure sono rimaste identiche. Nessun finding residuo dopo queste riletture.

## Prove individuali

### AR-u6-capacitor-energy-01

Per un condensatore lineare U=∫₀^Q(q/C)dq=Q²/(2C)=CV²/2. Con 2 μF e 2 V: U=2·4/2=4 μJ. μF·V²=μJ; energia non negativa, distinta dal lavoro totale eventualmente fornito da una batteria durante una procedura di carica.

Ipotesi: Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.

Distrattori e controprove: 4 μJ è l’area triangolare; 8 omette metà, 2 omette il quadrato, zero confonde neutralità con assenza di energia. U<0 è esclusa dal modello C>0.

Esito esatto indipendente: 4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-capacitor-energy-02

L’energia ha unità joule, J, e qui μJ. F·V²=(C/V)V²=C·V=J. Nella primaria le alternative non erano aperte; nella successiva lettura tutte e cinque sono state confrontate individualmente.

Ipotesi: Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.

Distrattori e controprove: J misura energia; W potenza, C carica, F capacità e V tensione. F·V²=C·V=J; il fattore metà è puro.

Esito esatto indipendente: J. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-capacitor-energy-03

La polarizzazione di un dielettrico consiste in separazioni relative di cariche legate e/o orientamento di dipoli nel materiale. Non richiede trasporto macroscopico di cariche libere da un’armatura all’altra né creazione di carica netta. Un materiale inizialmente neutro può avere polarizzazione non nulla e cariche legate superficiali. Non assumo isotropia o un modello molecolare più specifico non dichiarato; nella successiva lettura tutte le alternative sono state confrontate.

Ipotesi: Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.

Distrattori e controprove: Cariche legate si separano relativamente e dipoli permanenti possono orientarsi; carica netta non creata. Conduzione libera non necessaria, E interno non universalmente nullo, molecole tutte positive violerebbero neutralità.

Esito esatto indipendente: Le cariche legate si spostano relativamente e possono orientarsi dipoli permanenti. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-capacitor-energy-04

V resta 2 V mentre C dimezza da 2 a 1 μF: U passa da 4 a 2 μJ. Non è una trasformazione a carica fissata; mantenere la tensione può implicare scambio di energia col generatore.

Ipotesi: Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.

Distrattori e controprove: Con V imposta costante, C dimezzata porta U da 4 a 2 μJ. Otto inverte C, quattro conserva arbitrariamente U, uno quadra il fattore di C, mezzo dimezza ulteriormente.

Esito esatto indipendente: Da 4 μJ a 2 μJ. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-capacitor-energy-05

C=2U/V². Con U=4 μJ e V=2 V: C=8/4=2 μF. Il denominatore V²>0 è necessario per un’inversa finita.

Ipotesi: Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.

Distrattori e controprove: C=2U/V²=2 μF. Un μF omette il due e darebbe 2 μJ; quattro omette il quadrato e darebbe 8 μJ; mezzo è reciproco numerico e non ricostruisce U.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-capacitor-energy-06

V²=2U/C=8/2=4 V². Radici ±2 V, ma il dominio assegnato V>0 seleziona 2 V. L’energia sola non determinerebbe il segno della tensione senza tale convenzione.

Ipotesi: Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.

Distrattori e controprove: V²=4 V² e ramo V>0 dà 2 V. Quattro copia il quadrato, √2 omette due e darebbe 2 μJ, −2 conserva energia ma viola il dominio.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-capacitor-energy-07

C resta costante e la tensione raddoppia da 2 a 4 V: U_B/U_A=(4/2)²=4. Le energie sono 4 e 16 μJ, non in rapporto due.

Ipotesi: Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.

Distrattori e controprove: Rapporto quattro: tensione doppia, energia quadrupla. Due segue Q; 1/4 e 1/2 invertono rispettivamente rapporto quadratico e lineare; uno ignora V.

Esito esatto indipendente: 4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-capacitor-energy-08

Energia corretta 4 μJ; proposta 8 μJ. Scarto proposta−corretto=+4 μJ. Il rapporto 2 è adimensionale e non è lo scarto richiesto.

Ipotesi: Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.

Distrattori e controprove: Scarto +4 μJ. −4 inverte, due puro è rapporto, otto copia proposta, zero la accetta senza controllo.

Esito esatto indipendente: 4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-capacitor-energy-09

Da U=CV²/2 si moltiplica per due e si divide per V²>0: C=2U/V². Dimensione J/V²=F. Tutte le alternative sono state successivamente controllate dopo il congelamento della primaria.

Ipotesi: Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.

Distrattori e controprove: 2U/V² ha F. U/(2V²) è un quarto della capacità giusta; 2U/V è carica; V²/(2U) capacità inversa; 2UV² non isola C.

Esito esatto indipendente: C = 2 U / V². Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-capacitor-energy-10

Con C_B=κ₁C e V_B=κ₂V si ottiene U_B/U_A=κ₁κ₂². La capacità entra linearmente e la tensione quadraticamente. Entrambi i preparati devono restare condensatori lineari ideali entro il proprio regime operativo.

Ipotesi: Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.

Distrattori e controprove: κ₁κ₂²: una potenza di C e due di V. κ₁κ₂ segue la carica; κ₁²κ₂ scambia esponenti; i quozienti invertono dipendenze. Scala comune κ dà κ³.

Esito esatto indipendente: κ₁ κ₂². Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-capacitor-energy-11

U_A=2·2²/2=4 μJ. U_B=4·3²/2=18 μJ. Rapporto 18/4=9/2. Il fattore due della capacità e quello 9/4 del quadrato della tensione si moltiplicano.

Ipotesi: Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.

Distrattori e controprove: 18/4=9/2. 2/9 reciproco, tre segue CV, 9/4 segue solo V², due segue solo C.

Esito esatto indipendente: 9/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-capacitor-energy-12

Media delle uscite (4+18)/2=11 μJ. Ai dati medi C=3 μF e V=5/2 V il modello darebbe 3·(25/4)/2=75/8 μJ. La differenza 11−75/8=13/8 μJ è esatta, senza decimali.

Ipotesi: Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.

Distrattori e controprove: Media 11 μJ distinta da 75/8 μJ ai dati medi, differenza 13/8 μJ. Ventidue è somma, sette semidifferenza, diciotto sola prova B.

Esito esatto indipendente: 11. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-capacitor-energy-13

Bersaglio U_B=(9/2)·4=18 μJ. Con C_B=4 μF, V_B²=2·18/4=9 V²; ramo positivo V_B=3 V. Rapporto V_B/V_A=3/2.

Ipotesi: Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.

Distrattori e controprove: V_B=3 V e V_A=2 V: rapporto 3/2. 2/3 reciproco, 9/4 quadrato, 9/2 rapporto energie, tre copia numero di V_B in volt.

Esito esatto indipendente: 3/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-capacitor-energy-14

Il riferimento U=4 μJ e lettura 12 dà a_cal=3 μJ⁻¹ per display adimensionale. Lettura 54 restituisce U=18 μJ. Con V=3 V, C=2·18/9=4 μF.

Ipotesi: Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.

Distrattori e controprove: Guadagno 3 μJ⁻¹, U_B=18 μJ e C_B=4 μF. Dodici μF usa lettura come energia e triplica D; due omette due e dà 9 μJ; diciotto copia U.

Esito esatto indipendente: 4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-capacitor-energy-15

Riferimenti U_A=4, U_B=18 μJ e letture 9,37: a_cal=(37−9)/(18−4)=2 μJ⁻¹, b_cal=1. Lettura 2 restituisce U_C=(2−1)/2=1/2 μJ. Con V_C=1 V, C_C=2·(1/2)/1=1 μF.

Ipotesi: Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.

Distrattori e controprove: Guadagno 2 μJ⁻¹, offset 1, U_C=1/2 μJ e C_C=1 μF. Due μF omette offset e dà D=3; mezzo copia U e dà D=3/2; quattro usa D come U e dà D=5.

Esito esatto indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-capacitor-energy-16

Il vincolo numerico C[μF]=V[V] ha coefficiente fisico 1 μF/V. Sostituendo nell’energia: U[μJ]=V[V]³/2. Misura 4 μJ implica V³=8 e unica tensione positiva 2 V, con capacità 2 μF. Il vincolo confronta preparazioni, non una capacità che cresce tacitamente durante la carica dello stesso componente.

Ipotesi: Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.

Distrattori e controprove: Con C/(1 μF)=v e v=V/(1 V), U/(1 μJ)=v³/2; v³=8 seleziona 2. Quattro copia U, otto copia v³, −2 non risolve neppure la cubica. La misura fissa la scala.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

## Figura e limiti

SVG completo e PNG indipendente 640×1500 letti. Sei dipoli schematici orientati a destra con meno a sinistra, più a destra, nessuna carica netta creata; freccia E esterno completa. V(Q): x=150+80Q,y=860−100V, retta fino a (470,660)=(4 μC,2 V), area triangolare fisica 4 μJ e non 64000 joule di coordinate. Barre 80/360/220 per 4/18/11 μJ da origine150, scala20 coordinate/μJ; zeri118 separati e tutte etichette libere.

UI del prodotto, layout responsive e approvazione umana NOT_RUN. Nessun marker UI creato o copiato. Publication DRAFT e publicationAction NONE. Identità fresh/saved su fixture finali effettive; confronto con ROOT integrato e replay canonico dell’integratore PENDING. Nessun candidato, registro, ledger, runtime o Git ROOT modificato. Il push pubblico è stato esplicitamente autorizzato dall’utente tramite ROOT.

Verifier SHA256 441fd634bafebded91704cac00891059543f4a33be9aa76ab082d7e6822756b2. Package canonico SHA256 77c9a84717ea3fd09bf38359c5d8076157456dcae27f172f73a9f6c553ab61a6. Binding canonico SHA256 72c5929d3c37629c0643244f721c70e55bb7156d7a8f3786274100500f5ad6b2. Report SHA256 2dd9ade8bad5bf46b2246c0547786d14ab579239b122e0f32c591f1a6cc2f615.
