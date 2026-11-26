# Revisione indipendente dielectric-isolated-voltage-225

Tutti gli 80 prompt originali U6-04 B225–229 sono stati letti e risolti individualmente prima dei candidati, tramite allowlist id/prompt dal pin Git. Primaria SHA256 1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a, commit47cb9cbefc0def9db276d2ba106e3f2491b60e7f: copia immutata nella fixture. Nessuna opzione, chiave, solutionSteps, hint o modulo autore B era stato aperto. Nessuna primaria B è stata letta. Fonte 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605:packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-04.json, file SHA256179bf1cacfb83482e32bb41e99cb78296990faafba1fe9ce3b0e3cbc3a6a09cf.

Dopo la consegna iniziale di tutti gli 80 A220–224, durante la pausa per spazio insufficiente, ho letto tutti gli 80 prompt finali B tramite la sola allowlist id/prompt. I dati corrispondevano alla primaria. Ho poi scritto ed eseguito realmente i modelli prima di aprire le chiavi: model-run-1.json registra exit0, 80 derivazioni e 79.2844342909957 secondi, codice SHA25642da25a28a0f45351c833e9c583afeed5f0c615326404dc6ce4e2af1f8df61e9. La successiva correzione A22415 riguardava soltanto parentesi; nessuna chiave B era aperta durante quel fix. L’ulteriore correzione di metadata A220–224 a C4-L08 è stata fatta dopo la lettura B, ma non ha mutato leggi, scelte, numeri o asset A. Non viene attribuita alla primaria manuale la data della successiva preparazione del modello.

Solo dopo ho letto integralmente tutti i record finali B: prompt, tutte e cinque le alternative, risposta proposta, ciascun blocco e formula, hint, feedback, metadati, didascalie, source binding e asset. Edizione effettivamente letta 4f908dc4dbbcdba0eebc8ecbd8a249b7c328f789. Nessun modulo autore è stato importato. I risultati sono derivati da Q=CV, capacità geometrica, energia Q²/(2C), carica libera isolata o generatore ideale, e forza vettoriale di Lorentz. Le lezioni reali C4-L07, C4-L08 e C4-L09 sono state rilette nel pin Cric5d1d: L07 tratta proprio il singolo condensatore e il dielettrico, L08 le reti distinte, L09 Lorentz. Pertanto225–228 restano correttamente L07 e229 L09.

Tutti i dati numerici sono esatti, reali e finiti prima dell’aritmetica; denominatori non nulli, κ≥1 e s≥1 anche nelle inverse. I fattori di confronto possono essere minori di uno purché gli stati rispettino il dominio. Il regime di piastre estese è una premessa distinta, non dedotta dalla sola positività. Il limite v<c del modello è necessario ma non certifica quantitativamente il regime non relativistico: quest’ultimo è una premessa esplicita letta nei candidati. Per Lorentz03 la potenza q(v×B)·v=0 è dimostrata anche con componente parallela; il modulo della velocità è distinto dal vettore.

Il modello pre-key è copiato byte per byte come dipendenza di review. Il suo docstring descrive l’istante storico prima delle chiavi; la presente nota documenta la successiva lettura completa e i test finali. Decoder AST esatto SHA256 b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc; modello indipendente SHA256 42da25a28a0f45351c833e9c583afeed5f0c615326404dc6ce4e2af1f8df61e9. Entrambi sono controllati e riportati per ogni ID, senza eval né roundtrip attraverso float.

Tutti i cinque XML e i cinque PNG nativi indipendenti completi sono stati letti realmente, sotto mutex e guardia≥2 GiB. I processi sono terminati exit0; non è bastata la comparsa del PNG. Dimensioni640×1480 e bounds riportati nelle fixture, insieme alle osservazioni di processo. Nessun server o app aperto e nessun marker di UI prodotto creato. Non sono emersi finding testuali, matematici o grafici nei cinque finali dopo questa lettura.

## Prove individuali

### AR-u6-dielectric-isolated-voltage-01

Derivazione primaria storica, conservata: Il generatore scollegato non può scambiare carica libera con le armature ideali: il modulo Q su ciascuna resta fisso. Inserimento completo e geometria invariata danno C=κC₀. Da V=Q/C e Q=C₀V₀ segue V=V₀/κ. Con 12 V e κ=2: V=6 V. Non si impone la vecchia tensione dopo lo scollegamento.

Ipotesi fisiche controllate: Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: 6 V segue la carica libera fissata. 24 V moltiplica per κ, 12 V impone il generatore, 3 V divide due volte. Non si conserva la sola carica netta zero per dedurre V.

Esito esatto indipendente: 6. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-dielectric-isolated-voltage-02

Derivazione primaria storica, conservata: Si cerca una tensione, dimensione energia per carica e unità volt, V=J/C. Un prefisso modifica la scala e non la dimensione. Nella primaria le alternative non erano aperte; nella successiva lettura tutte e cinque sono state confrontate individualmente.

Ipotesi fisiche controllate: Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: V è tensione. C carica, F capacità, J energia e T campo magnetico. J/C=V, mentre κ non porta unità. Le cinque alternative sono state aperte soltanto dopo la primaria.

Esito esatto indipendente: V. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-dielectric-isolated-voltage-03

Derivazione primaria storica, conservata: L’isolamento elettrico delle singole armature fissa la loro carica libera, non la tensione e non l’energia del campo. La neutralità complessiva del condensatore da sola non basterebbe a fissare il modulo sulle piastre. Un dielettrico ideale può polarizzarsi senza fornire un canale di conduzione fra esse. C può crescere e V diminuire; eventuali aspetti meccanici richiedono un bilancio distinto.

Ipotesi fisiche controllate: Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: È fissata per isolamento la carica libera su ciascuna armatura. Con κ>1 C e permittività aumentano, V e U del campo diminuiscono. Il limite κ=1 non trasforma quelle grandezze nella quantità fissata dall’isolamento.

Esito esatto indipendente: La carica libera su ciascuna armatura. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-dielectric-isolated-voltage-04

Derivazione primaria storica, conservata: Con κ=2 fissato, V è lineare in V₀. Il riferimento dà 12/2=6 V; il preparato con V₀=1 V dà 1/2 V. Il rapporto finale/iniziale delle due uscite è 1/12. Sono preparazioni con cariche iniziali diverse, ciascuna poi isolata.

Ipotesi fisiche controllate: Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: A dà 6 V e B 1/2 V. Due V applica la dipendenza diretta; uno ignora la divisione di B per κ; sei copia A e dodici è la tensione iniziale A. Il fattore B/A è 1/12.

Esito esatto indipendente: Da 6 V a 1/2 V. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-dielectric-isolated-voltage-05

Derivazione primaria storica, conservata: V=V₀/κ si moltiplica per κ: V₀=κV. Con V=6 V e κ=2 si trova V₀=12 V. κ è puro, finito e almeno uno; la tensione iniziale risulta positiva e non minore di quella finale.

Ipotesi fisiche controllate: Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: κV=12 V. Tre V ripete la divisione, sei omette il dielettrico; 36 V darebbe 18 V dopo inserimento. V₀≥V perché κ≥1.

Esito esatto indipendente: 12. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-dielectric-isolated-voltage-06

Derivazione primaria storica, conservata: Da κV=V₀ si ricava κ=V₀/V=12/6=2, adimensionale. Serve V>0 e deve risultare κ≥1: una misura V>V₀ sarebbe incompatibile col modello dichiarato, non un ramo alternativo da accettare.

Ipotesi fisiche controllate: Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: κ=12/6=2. Un mezzo viola κ≥1; sei copia il valore numerico finale e 72 forma un prodotto di tensioni. Il valore è puro.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-dielectric-isolated-voltage-07

Derivazione primaria storica, conservata: A dà V_A=12/2=6 V. B con κ=1 dà V_B=12 V, cioè assenza di incremento dielettrico della capacità. Rapporto V_B/V_A=2. Il confine κ=1 è ammesso e non è un denominatore nullo.

Ipotesi fisiche controllate: Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: B con κ=1 ha V=12 V, quindi rapporto due. Mezzo è reciproco, quattro quadra, uno ignora κ. Zero non segue né Q=C₀V₀ positivo né C finita.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-dielectric-isolated-voltage-08

Derivazione primaria storica, conservata: Il corretto è 6 V; la proposta è 12 V. Scarto proposto meno corretto=+6 V. Il rapporto due sarebbe puro e risponderebbe a un’altra domanda; la tensione proposta conserva impropriamente il valore precedente l’inserimento.

Ipotesi fisiche controllate: Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: Proposta 12 meno corretto 6=+6 V. −6 scambia ordine; due è rapporto; 12 copia proposta; zero confonde netta neutra con tensione nulla.

Esito esatto indipendente: 6. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-dielectric-isolated-voltage-09

Derivazione primaria storica, conservata: Parto da V=V₀/κ. Moltiplicando per κ finito positivo segue V₀=κV, con unità V. La carica libera resta fissata durante l’inserimento, perciò non si usa la legge di un condensatore ancora collegato al generatore.

Ipotesi fisiche controllate: Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: V₀=κV deriva da Q invariata e C=κC₀. V/κ è ancora diretta; κ/V ha V⁻¹, κV² ha V² e V−κ sottrae dimensioni incompatibili.

Esito esatto indipendente: V₀ = κ V. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-dielectric-isolated-voltage-10

Derivazione primaria storica, conservata: Stati A e B sono preparazioni separate: V_A=V₀/κ e V_B=(κ₁V₀)/(κ₂κ). Dividendo le due espressioni positive si ottiene V_B/V_A=κ₁/κ₂. Oltre ai fattori positivi, occorre κ_A≥1 e κ_B=κ₂κ_A≥1; κ₂ non deve necessariamente essere almeno uno.

Ipotesi fisiche controllate: Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: κ₁/κ₂: il primo parametro è al numeratore e il secondo al denominatore. Prodotto e reciproco cambiano dipendenza; κ₂² aggiunge una potenza; somma dà due per prove identiche. κ_B resta≥1.

Esito esatto indipendente: κ₁ / κ₂. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-dielectric-isolated-voltage-11

Derivazione primaria storica, conservata: A: 12/2=6 V. B: 9/3=3 V. Rapporto 3/6=1/2, puro. Il fattore 3/4 dell’ingresso V₀ e il fattore inverso 2/3 della costante dielettrica si moltiplicano.

Ipotesi fisiche controllate: Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: V_A=6 V e V_B=3 V: rapporto 1/2. Due reciproco, 3/4 sola preparazione iniziale, 3/2 solo κ senza invertirlo; uno presume compensazione.

Esito esatto indipendente: 1/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-dielectric-isolated-voltage-12

Derivazione primaria storica, conservata: Le due letture fisiche sono 6 V e 3 V. Media con pesi uguali=(6+3)/2=9/2 V. Ai dati medi V₀=21/2 V e κ=5/2, la legge darebbe 21/5 V, non 9/2 V; la differenza è 3/10 V esatta. Non è richiesta alcuna approssimazione decimale.

Ipotesi fisiche controllate: Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: Media 9/2 V, distinta da 21/5 V ai dati medi, scarto 3/10 V. Nove è somma, 3/2 semidifferenza e zero usa netta neutra al posto di una tensione fra piastre.

Esito esatto indipendente: 9/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-dielectric-isolated-voltage-13

Derivazione primaria storica, conservata: L’uscita bersaglio è (1/2)·6 V=3 V. Con V₀,B=9 V, κ_B=9/3=3. Rapporto κ_B/κ_A=3/2, compatibile con entrambi i domini κ≥1. Non si copia il rapporto delle tensioni finali come rapporto dei dielettrici.

Ipotesi fisiche controllate: Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: Bersaglio 3 V e V₀, B 9 V richiedono κ_B 3: rapporto 3/2. 2/3 reciproco, 1/2 copia bersaglio, 3/4 segue solo V₀; due darebbe 9/4 V.

Esito esatto indipendente: 3/2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-dielectric-isolated-voltage-14

Derivazione primaria storica, conservata: Il riferimento V=6 V con lettura 18 fissa a_cal=3 unità strumentali per volt. Lettura 9 decodifica V=3 V. Per κ=3 l’inversa restituisce V₀=κV=9 V. Il numero strumentale non è direttamente la tensione fisica.

Ipotesi fisiche controllate: Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: Guadagno 3 V⁻¹, lettura 9 dà 3 V, κ 3 ricostruisce 9 V iniziali. 27 salta il guadagno, 1 divide ancora per κ, 3 si ferma all’uscita finale.

Esito esatto indipendente: 9. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-dielectric-isolated-voltage-15

Derivazione primaria storica, conservata: Riferimenti: V_A=6 V e V_B=3 V; letture 13 e 7. Guadagno a_cal=(13−7)/(6−3)=2 unità/V e offset b_cal=1. Lettura 5 implica V_C=(5−1)/2=2 V; κ_C=4 dà V₀,C=8 V. Prima si sottrae l’offset, poi si divide per il guadagno.

Ipotesi fisiche controllate: Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: Guadagno 2 V⁻¹ e offset 1: lettura 5 dà 2 V, κ 4 dà V₀8 V. Dieci omette offset e predice D 6; sedici omette guadagno; due omette l’inversa fisica.

Esito esatto indipendente: 8. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-dielectric-isolated-voltage-16

Derivazione primaria storica, conservata: Il vincolo fisico è V₀=(6 V)κ. Inserito nella legge dà V=6 V per ogni κ≥1 finito. La misura è ridondante: infinite coppie (V₀,κ)=(6 κ V,κ), ad esempio (6 V,1) e (12 V,2), ma non soltanto queste. Non si ammette il ramo 0<κ<1.

Ipotesi fisiche controllate: Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: Il parametro si cancella: V=6 V per ogni κ≥1. Esempi κ 1, 3/2, 2 con V₀6, 9, 12 V sono distinti. Nessuna quadratica né conteggio intero; scegliere κ 2 senza dato è arbitrario.

Esito esatto indipendente: Infinite coppie continue con κ≥1. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

## Figura e limiti

XML completo e PNG nativo 640 × 1480 letti: sezioni schematiche, Q 12 μC su entrambi gli stati, C 1→2 μF, V 12→6 V. Barre origine 150 con larghezze 240/120/180 per 6/3/9/2 V, scala comune 40 coordinate/V. Grafico indipendente x=150+(80/3)V₀, y=1300−(80/3)V, retta fino(470, 1140)=(12, 6)V con κ 2. Origine 0 è limite, zeri 132 a sinistra, punte e label non coperte.

UI prodotto, layout responsive e approvazione umana NOT_RUN. Nessun marker UI inventato, copiato o aggiornato. Publication DRAFT, publicationAction NONE. Le identità fresh/saved sono confrontate con le fixture realmente lette e con i commit Git dei finali. Confronto canonico ROOT e integrazione restano PENDING_ROOT: nessun credito anticipato. Nessun candidato, registry, ledger, runtime o Git ROOT modificato.

Verifier SHA256 3424d34fb8a551bb4251bbb029c8191577094b75b7fa99036317f93ef03d822e. Package canonico SHA256 138f7466149c2d0c23d001b8f506228ed274364fe2676f829e77f85302ecf991. Binding canonico SHA256 6d85b4aef117211f90750d1599a6feab925d7530262f308e379741c9bdab84de. Report SHA256 5f2466540cd38a43d162c6cd90f61c66b9ac877d4e074a4b8dae16ede3a002a5.
