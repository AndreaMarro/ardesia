# Revisione indipendente capacitor-charge-218

Gli 80 prompt originali U6-03 B215–219 sono stati letti e risolti individualmente prima di qualsiasi candidato, alternativa, chiave, soluzione o generatore. Primaria SHA256 4c49ff1e2020d073891686e5289e263561531a9b81e84e2f0fa9c8648dc90f4b; copia byte-identica nella fixture. Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, file packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-03.json, SHA256 0bd13e1748174df8c30e06641ad153b8e44ab98df47f31c9f1aba7f925f88077. Nessuna esposizione anticipata alle chiavi. Nessuna primaria altrui è stata aperta. I modelli sono stati scritti e realmente eseguiti prima dei candidati: model-run-1.json documenta exit 0; il modello finale deriva da quella versione e restringe inoltre la corrente operativa al dominio I>0 dichiarato nei candidati. Conserva il docstring storico NOT_RUN dell’istante iniziale, superato dal run documentato e dai nuovi test finali.

Dopo il congelamento della primaria ho letto integralmente ogni record finale: consegna, tutte le alternative, ogni blocco e formula, hint, feedback, metadati e didascalie. Nessun modulo autore è stato importato. Edizione finale letta: 035031b9d0c968b9510ccf8275c1fcb0722cf14d. I risultati derivano da potenza in serie, bilancio di calore latente, modello elettrostatico piano, Q=CV e integrale di carica del condensatore lineare. Catalogo reale C4-L03/L04/L07 e C3-L03/L04 riletto per le eccezioni autonome. Il modello della fusione non descrive il successivo circuito aperto; la polarizzazione non coincide con conduzione libera; l’energia immagazzinata non è tutto il lavoro della batteria.

Le quantità numeriche sono esatte, finite e reali prima di ogni operazione; denominatori e rami positivi controllati. I parametri geometrici devono inoltre restare nel regime di piastre estese. Il decoder AST conserva i lessemi originali e non usa eval o roundtrip attraverso float. SHA256 decoder b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc; modello indipendente f27c33334a9349c8941704334fd73761fe9bf0e4209472ea74ae5bb4a48081b4. Entrambi sono controllati e riportati per ciascun record. SymPy, Pint e Fraction sono separati dall’authoring. Le formule generali sono confrontate simbolicamente con tutte le cinque alternative; le domande concettuali hanno prove fisiche specifiche, non una semplice flag.

Tutto l’XML e ciascuno dei cinque nuovi PNG nativi completi sono stati realmente letti. Il processo SVG-only è terminato exit 0 sotto mutex e guardia ≥2 GiB; bounds, dimensioni PNG e source SHA sono nel render.json e nel manifest della fixture. Nessuna app, server o dati studenti sono stati usati nel rendering. Rettifiche B rilette: 21511 identifica il reciproco della sola quota iniziale, 21514 conserva una controprova senza falsa attribuzione al guadagno; 21601 nomina il primo pannello e 21609 fissa la potenza nel confronto della durata; 21814 usa una sostituzione verificabile senza attribuzione falsa al reciproco. Tutte le chiavi, leggi e figure sono rimaste identiche. Nessun finding residuo dopo queste riletture.

## Prove individuali

### AR-u6-capacitor-charge-01

Per condensatore lineare Q=CV. μF·V=μC, dunque 2·3=6 μC su ciascuna armatura in modulo. Le cariche sono +Q e −Q: la carica netta dell’intero condensatore ideale resta zero, non 12 μC.

Ipotesi: Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.

Distrattori e controprove: 6 μC è il modulo su una piastra; 12 somma i moduli e zero è invece la carica netta. I prefissi non introducono milli aggiuntivi.

Esito esatto indipendente: 6. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-capacitor-charge-02

La carica si misura in coulomb, C, o suoi multipli/sottomultipli; qui μC. Da Q=CV segue F·V=C. Nella primaria le alternative non erano aperte; nella successiva lettura tutte e cinque sono state confrontate individualmente.

Ipotesi: Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.

Distrattori e controprove: Solo C è carica: F capacità, V tensione, J energia e A corrente. Tutte le cinque alternative lette nella successiva review.

Esito esatto indipendente: C. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-capacitor-charge-03

La capacità è il coefficiente C=Q/V per armature con moduli uguali e opposti; isolando la carica positiva in modulo si ottiene Q=CV, con C,V>0. Non occorre un ulteriore fattore due perché si chiede il modulo su ciascuna armatura e non la somma dei moduli.

Ipotesi: Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.

Distrattori e controprove: Q=CV isola il modulo su una armatura. C/V e V/C cambiano dimensione; 2CV conta due moduli; CV²/2 è energia, non carica.

Esito esatto indipendente: Q = C V. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-capacitor-charge-04

V resta 3 V e C dimezza da 2 a 1 μF. Q passa da 6 a 3 μC, una dipendenza lineare. A tensione mantenuta, il generatore può scambiare carica; non si assume isolamento delle armature.

Ipotesi: Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.

Distrattori e controprove: A V=3 V fissata, C dimezzata porta Q da 6 a 3 μC. Dodici inverte, sei ignora, 3/2 dimezza due volte, uno copia C_B.

Esito esatto indipendente: Da 6 μC a 3 μC. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-capacitor-charge-05

C=Q/V=6 μC/(3 V)=2 μF. Divisione per V>0 finita. La dimensione è C/V=F e non energia.

Ipotesi: Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.

Distrattori e controprove: 6 μC/3 V=2 μF. QV è energia; V/Q è capacità inversa. Reinserendo 2 μF si recuperano 6 μC.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-capacitor-charge-06

V=Q/C=6 μC/(2 μF)=3 V. Si usa il modulo della differenza di potenziale nel ramo positivo assegnato; il segno della singola armatura non cambia il valore richiesto.

Ipotesi: Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.

Distrattori e controprove: 6 μC/2 μF=3 V. Il segno delle armature non altera il modulo richiesto; il problema fissa V>0.

Esito esatto indipendente: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-capacitor-charge-07

C resta 2 μF. Q_A=6 μC e Q_B=2 μC. Rapporto Q_B/Q_A=2/6=1/3, uguale al rapporto delle tensioni.

Ipotesi: Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.

Distrattori e controprove: 1/3 è il rapporto; 3 è reciproco, 1/9 e 9 introducono un quadrato e uno ignora il cambiamento.

Esito esatto indipendente: 1/3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-capacitor-charge-08

Carica corretta 6 μC; proposta 12 μC. Scarto proposta−corretto=+6 μC. Il raddoppio errato può confondere il modulo di una singola armatura con la somma dei due moduli, che non è la quantità richiesta.

Ipotesi: Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.

Distrattori e controprove: Scarto +6 μC. −6 scambia ordine; 2 è rapporto puro; 12 copia proposta; zero accetta errore.

Esito esatto indipendente: 6. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-capacitor-charge-09

Da Q=CV si divide per V>0 e si ricava C=Q/V. Le unità μC/V danno μF. Il denominatore nullo è escluso; con V=0 non si inferisce C dal solo Q=0.

Ipotesi: Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.

Distrattori e controprove: Q/V ha F; QV ha J, V/Q ha F⁻¹, 2Q/V² e Q/V² hanno C/V². V è positivo e non nullo.

Esito esatto indipendente: C = Q / V. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-capacitor-charge-10

Sostituendo C_B=κ₁C e V_B=κ₂V si trova Q_B=κ₁κ₂CV. Rapporto Q_B/Q_A=κ₁κ₂, con tutti i dati finiti positivi. Sono confronti fra preparazioni, non una variazione obbligata nello stesso condensatore isolato.

Ipotesi: Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.

Distrattori e controprove: κ₁κ₂ segue il prodotto. Quozienti invertono un ingresso, il quadrato di κ₂ aggiunge un fattore e la somma darebbe due per prove identiche.

Esito esatto indipendente: κ₁ κ₂. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-capacitor-charge-11

A: 2·3=6 μC. B: 1·5=5 μC. Rapporto 5/6: la tensione aumenta ma la capacità si dimezza, perciò la carica finale è leggermente minore.

Ipotesi: Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.

Distrattori e controprove: 5/6 confronta Q_B=5 con Q_A=6 μC. 6/5 è reciproco, 5/3 ignora il cambio di capacità, 1/2 segue solo C, uno presume compensazione.

Esito esatto indipendente: 5/6. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-capacitor-charge-12

Media delle uscite (6+5)/2=11/2 μC. Ai dati medi C=3/2 μF e V=4 V il prodotto sarebbe 6 μC, diverso di 1/2 μC. La media del prodotto non è in generale il prodotto delle medie.

Ipotesi: Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.

Distrattori e controprove: Media 11/2 μC. Sei μC è il prodotto dei dati medi, undici la somma, mezzo la semidifferenza, zero la confusione con carica netta.

Esito esatto indipendente: 11/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-capacitor-charge-13

Bersaglio Q_B=(5/6)·6=5 μC. Con C_B=1 μF, V_B=5 V. Rapporto V_B/V_A=5/3; tutti i parametri restano nel ramo positivo.

Ipotesi: Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.

Distrattori e controprove: B deve avere Q=5 μC e C=1 μF, quindi V=5 V e rapporto 5/3. 3/5 inverte; 5/6 copia il rapporto delle cariche; mezzo e due non ricostruiscono il bersaglio.

Esito esatto indipendente: 5/3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-capacitor-charge-14

Q_A=6 μC con lettura 18 dà a_cal=3 μC⁻¹ per display adimensionale. Lettura 15 restituisce Q=5 μC. Con V=5 V, C=1 μF. Non dividere direttamente la lettura strumentale per la tensione.

Ipotesi: Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.

Distrattori e controprove: Guadagno 3 μC⁻¹, lettura 15 dà Q=5 μC, V=5 V dà C=1 μF. La controprova finale 1/5 μF produce Q=1 μC, non 5: riletta 035031b9 dopo eliminazione dell’attribuzione falsa al reciproco.

Esito esatto indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-capacitor-charge-15

Riferimenti Q_A=6 e Q_B=5 μC, letture 13,11: a_cal=2 μC⁻¹ e b_cal=1. Lettura 17 restituisce Q_C=(17−1)/2=8 μC. Con V_C=2 V, C_C=4 μF.

Ipotesi: Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.

Distrattori e controprove: Guadagno 2 μC⁻¹, offset 1, Q_C=8 μC e C_C=4 μF. 17/4 μF omette offset e dà D=18; 8 μF dà D=33; 16 μF dà D=65.

Esito esatto indipendente: 4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-capacitor-charge-16

Il vincolo numerico C[μF]=(2/3)V[V] ha coefficiente fisico (2/3) μF/V. Inserendo in Q=CV si ottiene 6=(2/3)V² per i valori numerici dichiarati. Quindi V²=9 e il ramo V>0 seleziona 3 V; C=2 μF. L’altra radice non appartiene al dominio positivo.

Ipotesi: Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.

Distrattori e controprove: v²=9 con ramo positivo v=3; C=2 μF. −3 darebbe capacità negativa nel vincolo, nove copia il quadrato, due darebbe Q=8/3 μC; misura non ridondante.

Esito esatto indipendente: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

## Figura e limiti

SVG completo e PNG indipendente 640×1490 letti. Sei simboli per piastra, ciascuno 1 μC esplicito, non sei particelle elementari: netta zero e moduli 6 μC. Curva Q(V) per C=2 μF, x=150+100V,y=850−30Q, segmento e punto (250,790)=(1 V,2 μC), origine come limite. Barre 300/250/275 per 6/5/11/2 μC, origine 150 e scala 50 coordinate/μC; zeri e label leggibili.

UI del prodotto, layout responsive e approvazione umana NOT_RUN. Nessun marker UI creato o copiato. Publication DRAFT e publicationAction NONE. Identità fresh/saved su fixture finali effettive; confronto con ROOT integrato e replay canonico dell’integratore PENDING. Nessun candidato, registro, ledger, runtime o Git ROOT modificato. Il push pubblico è stato esplicitamente autorizzato dall’utente tramite ROOT.

Verifier SHA256 6cb71e14341818f44d31b28482b388293e186e57a275c5da246b0ad8dfe60ec8. Package canonico SHA256 9eae49d463d096eef23e4412bdb28dc375d5896bc6a4bedcc58f9ae8e93463cf. Binding canonico SHA256 cd9e73e84e570c9dbdcce97c205f37aada963dc6982c00b9ed713390b9018c4e. Report SHA256 397d5bc85fceae6af384212141d2456887b32910be077e7569ef76d1fad38b29.
