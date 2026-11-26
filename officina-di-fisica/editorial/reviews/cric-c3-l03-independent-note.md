# Revisione indipendente cric-c3-l03

Dieci problemi distinti, risolti prima delle candidate nella primaria C3 A50 commit030d4658, SHA 34cdd1eb8b9f296a638c2fa1e3874ffbace49c48e907257c063fe1f0f7ad0b80. Modello realmente eseguito prima dei candidati, SHA 9b870976c03b6578eeac6f6e4c2e89cebc6c53d2a6a0ef0b806e749b36c88e1f, con Git-inputs e snapshot verbatim dichiarati. Tutte le sue funzioni conservano AST identico. Nessun modulo autore importato.

Tutti10 record finali 0bbc287299c0169fe26093d2b48bc94d6570c666 letti per intero: dati, risposte, opzioni, hint, blocchi, formule, errori e metadati. Lezione reale C3-L03 letta nel catalogo pinned; identità/versioni/famiglie/difficoltà/prerequisiti/exam controllati individualmente. I risultati numerici derivano dalla primaria, non dalle chiavi.

XML e nuovo PNG indipendente 640×1500 letti per intero. Retta Q–ΔT da(140,410) a(500,140): 360 coordinate per 6 K e 270 per 540 J,quindiQ/ΔT=90 J/K. Dividendo per 0,200 kg si ottiene 450 J/(kgK). Freccia di calore 3000 J dal corpo 70°C all’acqua 20°C,calori−3000/+3000 J e finale 30°C. Barre 500/400/100 J: lunghezze 300/240/60 a scala comune 3/5 coordinate/J. Nessuna occlusione o contatto residuo.

Il decoder canonico mantiene il lessema decimale senza float intermedi. Intervalli in kelvin e letture Celsius sono distinti: il confronto di opzioni equivalenti applica l’offset soltanto alle temperature assolute, non agli intervalli. Le risposte numeric JSON devono essere interi esatti; i risultati frazionari sono scelte letterali esatte, non float.

Le mutazioni ostili rinnovano binding, hash, token e pin soltanto nel test e lasciano ripristinate le firme finali. EXACT_ORACLE e AI_CONCEPTUAL sono modalità separate. Nuova resa nativa è asset-only: nessuna UI prodotto o approvazione umana; stati DRAFT/NOT_RUN.

## C3-Q021

Ipotesi: m 0,200 kg,Q 540 J,ΔT 6 K,calore specifico costante senza fase.

Derivazione: La massa è 200 g=1/5 kg. Da Q=mcΔT, c=540/[(1/5)·6]=450 J/(kg·K), assumendo capacità costante sul tratto e nessun altro trasferimento energetico.

Distrattori: 90 J/K è C totale; 200 kg anziché 0,2 produce 0,45; moltiplicare ΔT non isola c.

Didattica: Capacità specifica e totale con conversione della massa.

Modalità: EXACT_ORACLE; esito True; firma 147f26548ee6c864b6da27506663e578ab7eaaca341a5b5ee994c80c556c0db9.

## C3-Q022

Ipotesi: Potenza comune costante,perdite e transizioni assenti,C positive costanti; masse non assegnate uguali.

Derivazione: Con la stessa potenza netta P e senza perdite, dT/dt=P/C. A ha capacità termica totale C minore. Il solo grafico non determina il calore specifico se le masse non sono note uguali.

Distrattori: m o c più piccoli possono ridurre C ma non si inferiscono separatamente; P già uguale.

Didattica: Pendenza P/C prima di isolare m o c.

Modalità: AI_CONCEPTUAL; esito True; firma e700f2dfe5d6e7897c2f13ea80a52967f5d3233782683d5ab76350e36ec11d93.

## C3-Q023

Ipotesi: C totale J/K divisa per massa kg; percorso e modello materiale pertinenti.

Derivazione: Si ottiene il calore specifico c=C/m, con unità J/(kg·K). Capacità totale del campione e proprietà specifica del materiale vanno distinte.

Distrattori: L haJ/kg,λW/(mK),ρkg/m³,PW: nessuna coincide con C/m.

Didattica: Definizione e dimensioni della proprietà specifica.

Modalità: AI_CONCEPTUAL; esito True; firma dea99df708c62915632f8317e413dfbda7df6facf4424d7cb6e8f06fb2b91606.

## C3-Q024

Ipotesi: C 75 J/K,raffreddamento 48→32°C,Q positivo entrante.

Derivazione: La variazione di temperatura è 32−48=−16 K. Con Q positivo entrante, Q=75·(−16)=−1200 J: il metallo cede energia come calore.

Distrattori: +1200 perde segno; 16 è coefficiente del calo nonenergia; offset cancella fra letture.

Didattica: Calore con segno distinto dal modulo ceduto.

Modalità: EXACT_ORACLE; esito True; firma 734a285044e670664323a4cab584768fa1aacfb304486249cc34b8776066a142.

## C3-Q025

Ipotesi: Sistema isolato,nessun lavoro/fase,recipiente trascurato,Cacqua 300 J/K,70/20→30°C.

Derivazione: In isolamento, il calore perso dal campione e quello acquistato dall’acqua si compensano. C_s(70−30)=300(30−20), quindi C_s=3000/40=75 J/K. Si suppongono capacità costanti e recipiente trascurabile o già incluso.

Distrattori: 300 JK è capacità dell’acqua; letture 30 e intervallo 40 non sono capacità; duecalori non entrano entrambi.

Didattica: Bilancio di due sistemi con capacità positive.

Modalità: EXACT_ORACLE; esito True; firma 01311d682a5250659ee3fd351e0ee881d8cd88d35fb69594d9dbfec65fb2da36.

## C3-Q026

Ipotesi: Capacità positive costanti,recipiente inizialmente alla T fredda,caldo e freddo diversi.

Derivazione: Il recipiente inizialmente freddo assorbe parte dell’energia ceduta dal corpo caldo. Con capacità positiva il valore finale reale è minore della previsione che trascura il recipiente, pur restando fra le temperature iniziali nel modello senza altre fonti.

Distrattori: Recipiente non creaenergia; capacità positiva lo scalda eabbassaTf; restano limiti fra le dueT.

Didattica: Partecipazione del recipiente nel bilancio calorimetrico.

Modalità: AI_CONCEPTUAL; esito True; firma c451e10ef14700d88bea5442a1071267d00ef7679e67398b888748e4da1db35f.

## C3-Q027

Ipotesi: Una mole dello stesso gas perfetto,stessi estremiT,ΔT 15 K,solo lavoro pV,R 8,314 assegnata.

Derivazione: Per gas ideale C_p−C_v=R per mole. La differenza fra i due calori è nRΔT=1·8,314·15=124,71 J=12471/100 J. Si confrontano gli stessi estremi di temperatura e solo lavoro di volume nei processi definiti.

Distrattori: Zero ignora lavoro isobaro; 8,314 copia R; 15 copia ΔT; negativo inverte differenza.

Didattica: Differenza fra percorsi con identici estremi di temperatura.

Modalità: EXACT_ORACLE; esito True; firma 42cb889ccc5a9cfea843cfdc542c83e83b1d15c73f515846ecc096e633e04a8e.

## C3-Q028

Ipotesi: Gas perfetto chiuso,solo lavoro pV,Cv costante nell’intervallo.

Derivazione: È il volume. In un riscaldamento isocoro di gas ideale, senza altri lavori o variazioni macroscopiche, Q=nC_vΔT. Non si attribuisce questa espressione al calore di un processo arbitrario.

Distrattori: Isobara dà nCpΔT; isoterma non definisce capacitàCv e può avere Q nonnullo.

Didattica: Esclusione del lavoro dell’albero e vincolo isocoro.

Modalità: AI_CONCEPTUAL; esito True; firma c8411838ff5c9c29451fe25ac4ea520c455d15e397031225cea557234068aace.

## C3-Q029

Ipotesi: Due corpi 15/45°C,capacità positive,isolamento e solo calore senza fase.

Derivazione: In isolamento con capacità positive e solo calore sensibile, la temperatura finale è una media pesata fra 15 e 45 °C. 51 °C è fuori dall’intervallo: il bilancio o i segni sono errati.

Distrattori: Massa maggiore cambia pesi nonlimiti; Kelvin conserva ordine; somma di letture nonconserva energia.

Didattica: Controllo dei limiti prima di rifare il calcolo.

Modalità: AI_CONCEPTUAL; esito True; firma 2d57f05fdfc43b94855a161799dca1a44f8f632228f9de260d0233952c3484af.

## C3-Q030

Ipotesi: Ingresso 500 J,C 80 J/K,ΔT 5 K,nessun lavoro apprezzabile o fase.

Derivazione: Il campione acquista CΔT=80·5=400 J. Dei 500 J erogati, 500−400=100 J sono trasferiti all’esterno, purché non vi siano altre forme di accumulo non conteggiate.

Distrattori: 400 J accumulo,500 J ingresso,perdita 100 J; Ctot non richiede un fattore massa aggiuntivo.

Didattica: Energia fornita distinta da quella trattenuta.

Modalità: EXACT_ORACLE; esito True; firma 1bb8e43a1b1ea75579d649b246236451622e1eb7744ea835907fef51501b86ec.
