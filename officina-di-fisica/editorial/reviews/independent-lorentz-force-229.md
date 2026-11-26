# Revisione indipendente lorentz-force-229

Tutti gli 80 prompt originali U6-04 B225–229 sono stati letti e risolti individualmente prima dei candidati, tramite allowlist id/prompt dal pin Git. Primaria SHA256 1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a, commit47cb9cbefc0def9db276d2ba106e3f2491b60e7f: copia immutata nella fixture. Nessuna opzione, chiave, solutionSteps, hint o modulo autore B era stato aperto. Nessuna primaria B è stata letta. Fonte 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605:packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-04.json, file SHA256179bf1cacfb83482e32bb41e99cb78296990faafba1fe9ce3b0e3cbc3a6a09cf.

Dopo la consegna iniziale di tutti gli 80 A220–224, durante la pausa per spazio insufficiente, ho letto tutti gli 80 prompt finali B tramite la sola allowlist id/prompt. I dati corrispondevano alla primaria. Ho poi scritto ed eseguito realmente i modelli prima di aprire le chiavi: model-run-1.json registra exit0, 80 derivazioni e 79.2844342909957 secondi, codice SHA25642da25a28a0f45351c833e9c583afeed5f0c615326404dc6ce4e2af1f8df61e9. La successiva correzione A22415 riguardava soltanto parentesi; nessuna chiave B era aperta durante quel fix. L’ulteriore correzione di metadata A220–224 a C4-L08 è stata fatta dopo la lettura B, ma non ha mutato leggi, scelte, numeri o asset A. Non viene attribuita alla primaria manuale la data della successiva preparazione del modello.

Solo dopo ho letto integralmente tutti i record finali B: prompt, tutte e cinque le alternative, risposta proposta, ciascun blocco e formula, hint, feedback, metadati, didascalie, source binding e asset. Edizione effettivamente letta d08b78557da6988f0264890c7c1994789f744533. Nessun modulo autore è stato importato. I risultati sono derivati da Q=CV, capacità geometrica, energia Q²/(2C), carica libera isolata o generatore ideale, e forza vettoriale di Lorentz. Le lezioni reali C4-L07, C4-L08 e C4-L09 sono state rilette nel pin Cric5d1d: L07 tratta proprio il singolo condensatore e il dielettrico, L08 le reti distinte, L09 Lorentz. Pertanto225–228 restano correttamente L07 e229 L09.

Tutti i dati numerici sono esatti, reali e finiti prima dell’aritmetica; denominatori non nulli, κ≥1 e s≥1 anche nelle inverse. I fattori di confronto possono essere minori di uno purché gli stati rispettino il dominio. Il regime di piastre estese è una premessa distinta, non dedotta dalla sola positività. Il limite v<c del modello è necessario ma non certifica quantitativamente il regime non relativistico: quest’ultimo è una premessa esplicita letta nei candidati. Per Lorentz03 la potenza q(v×B)·v=0 è dimostrata anche con componente parallela; il modulo della velocità è distinto dal vettore.

Il modello pre-key è copiato byte per byte come dipendenza di review. Il suo docstring descrive l’istante storico prima delle chiavi; la presente nota documenta la successiva lettura completa e i test finali. Decoder AST esatto SHA256 b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc; modello indipendente SHA256 42da25a28a0f45351c833e9c583afeed5f0c615326404dc6ce4e2af1f8df61e9. Entrambi sono controllati e riportati per ogni ID, senza eval né roundtrip attraverso float.

Tutti i cinque XML e i cinque PNG nativi indipendenti completi sono stati letti realmente, sotto mutex e guardia≥2 GiB. I processi sono terminati exit0; non è bastata la comparsa del PNG. Dimensioni640×1480 e bounds riportati nelle fixture, insieme alle osservazioni di processo. Nessun server o app aperto e nessun marker di UI prodotto creato. Non sono emersi finding testuali, matematici o grafici nei cinque finali dopo questa lettura.

## Prove individuali

### AR-u6-lorentz-force-01

Derivazione primaria storica, conservata: Il modulo della forza magnetica è |q|vB sinθ. Qui θ=90° e q=1 μC, dunque F_B=|q|vB. Un μC·un km/s·un mT=10⁻⁶·10³·10⁻³ N=1 μN. Per v=2 km/s e B=3 mT, F_B=6 μN. Il verso richiederebbe vettori orientati e regola del prodotto vettoriale, non determinabile dai soli moduli.

Ipotesi fisiche controllate: Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: q 1 μC, v 2 km/s, B 3 mT perpendicolari: F 6 μN. Kilo e milli si compensano; sei N perde il prefisso micro della carica, dodici duplica, tre omette v 2. Direzione da prodotto vettoriale, non dal modulo.

Esito esatto indipendente: 6. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-lorentz-force-02

Derivazione primaria storica, conservata: Si chiede una forza, unità newton N e qui μN. C·(m/s)·T=N, perché T=N·s/(C·m). Le cinque alternative non sono state aperte; i prefissi non alterano la dimensione. Nella primaria le alternative non erano aperte; nella successiva lettura tutte e cinque sono state confrontate individualmente.

Ipotesi fisiche controllate: Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: N misura forza. C·(m/s)·T=N; T campo, C carica, J lavoro, V tensione. Forza e campo non sono la stessa grandezza.

Esito esatto indipendente: N. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-lorentz-force-03

Derivazione primaria storica, conservata: La forza è q v×B, perpendicolare alla velocità: la potenza istantanea F·v=0. L’energia cinetica e quindi il modulo della velocità restano costanti per una particella ideale di massa fissata soggetta soltanto al campo magnetico statico. Il vettore velocità può cambiare direzione; senza la condizione v⊥B non si impone un moto puramente circolare: può essere elicoidale. Le alternative effettive saranno lette successivamente.

Ipotesi fisiche controllate: Caso autonomo: particella carica, non necessariamente q=+1 μC, soggetta soltanto a campo magnetico uniforme statico; nessun campo elettrico, altre forze o radiazione. Modello classico, massa positiva costante. Il prodotto vettoriale è ortogonale a v anche con componente parallela a B: K e rapidità si conservano. Non si impone qui v perpendicolare a B né un valore numerico della carica.

Successiva lettura delle alternative e controprove indipendenti: (v×B)·v=0 implica potenza e variazione di K nulle: rapidità costante. Il vettore v può ruotare, posizione cambia, accelerazione generalmente ruota. Moto parallelo è caso particolare, non proprietà universale.

Esito esatto indipendente: Il modulo della velocità. Modalità AI_CONCEPTUAL; ambito NO_STUDENT_CALCULATION.

### AR-u6-lorentz-force-04

Derivazione primaria storica, conservata: B=3 mT e q fissati, v scende da 2 a 1 km/s mantenendosi perpendicolare. F_B passa da 6 a 3 μN, dipendenza lineare dalla rapidità. Confronto fra stati o preparazioni, non decelerazione causata dal solo campo magnetico.

Ipotesi fisiche controllate: Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: v dimezzata a B e angolo invariati porta 6→3 μN. 12 inverte, 3/2 quadra, 6 ignora e 0 richiederebbe v 0 o direzione parallela, esclusi.

Esito esatto indipendente: Da 6 μN a 3 μN. Modalità AI_CONCEPTUAL; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-lorentz-force-05

Derivazione primaria storica, conservata: Da F_B=|q|vB segue v=F_B/(|q|B). Nelle unità assegnate con q=1 μC, v[km/s]=F_B[μN]/B[mT]. Quindi v=6/3=2 km/s. Denominatore B positivo e non nullo.

Ipotesi fisiche controllate: Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: v=F/(|q|B)=2 km/s. 18 moltiplica numeri, mezzo reciproco, sei copia la forza senza campo; prefissi vanno convertiti tutti.

Esito esatto indipendente: 2. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-lorentz-force-06

Derivazione primaria storica, conservata: B=F_B/(|q|v). Con forza 6 μN e v=2 km/s, B=3 mT. È modulo del campo, non una componente con segno; la carica positiva fissa il verso della forza solo dopo specificare le direzioni di v e B.

Ipotesi fisiche controllate: Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: B=F/(|q|v)=3 mT. 12 prodotto, 1/3 reciproco, 6 copia F; segnonon dedotto dal modulo. Direzione richiede dati vettoriali.

Esito esatto indipendente: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-lorentz-force-07

Derivazione primaria storica, conservata: A dà F_A=2·3=6 μN; B dà F_B=2·1=2 μN. Rapporto 2/6=1/3, puro. La rapidità resta uguale, cambia soltanto il modulo del campo fra le preparazioni.

Ipotesi fisiche controllate: Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: B ridotto 3→1 mT dà F 6→2 μN e rapporto 1/3. Tre reciproco, 1/9 e 9 quadrati, uno ignora B.

Esito esatto indipendente: 1/3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-lorentz-force-08

Derivazione primaria storica, conservata: Corretto 6 μN e proposta 12 μN. Scarto proposto meno corretto=+6 μN. Il rapporto due è adimensionale e non lo scarto; non si introduce un fattore due nella legge qvB.

Ipotesi fisiche controllate: Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: Scarto+6 μN.−6 inverte, due rapporto, 12 proposta, zero confonde potenza magnetica nulla con forza nulla.

Esito esatto indipendente: 6. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-lorentz-force-09

Derivazione primaria storica, conservata: L’inversa fisica è v=F_B/(|q|B), nel caso perpendicolare. Con q=1 μC e le unità numeriche dichiarate diventa v[km/s]=F_B[μN]/B[mT]. F/B da solo in SI non è una velocità se si omette il fattore |q|: la scorciatoia dipende dalla carica e dai prefissi assegnati.

Ipotesi fisiche controllate: Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: F/(|q|B) ha m/s. Il reciproco ha s/m; FB/|q| e F/(|q|B²) alterano dimensioni; F/B ha C·m/s. Rapidità modulo non prende segno di q.

Esito esatto indipendente: v = F_B / (|q| B). Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-lorentz-force-10

Derivazione primaria storica, conservata: Con q e θ=90° invariati, v_B=κ₁v_A e B_B=κ₂B_A danno rapporto dei moduli F_B,B/F_B,A=κ₁κ₂. Sono confronti tra preparazioni; il campo magnetico da solo non porta la stessa particella da una rapidità all’altra compiendo lavoro. Fattori e moduli restano finiti positivi nel regime del modello.

Ipotesi fisiche controllate: Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: κ₁κ₂ segue prodotto vB. Quozienti invertono dipendenze, κ₁²introduce quadrato, somma fallisce prove identiche. Entrambe velocità nel regime nonrel dichiarato.

Esito esatto indipendente: κ₁ κ₂. Modalità AI_CONCEPTUAL; ambito SYMBOLIC_MANUAL_DERIVATION.

### AR-u6-lorentz-force-11

Derivazione primaria storica, conservata: A: F_A=2·3=6 μN. B: F_B=1·4=4 μN. Rapporto 4/6=2/3; fattore 1/2 della rapidità e fattore 4/3 del campo si moltiplicano.

Ipotesi fisiche controllate: Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: F_A 6, F_2=4 μN→2/3; 3/2 reciproco, mezzo solo v, 4/3 solo B, uno compensa senza dati.

Esito esatto indipendente: 2/3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-lorentz-force-12

Derivazione primaria storica, conservata: Media dei moduli (6+4)/2=5 μN. Ai dati medi v=3/2 km/s e B=7/2 mT, il prodotto darebbe 21/4 μN, differente di 1/4 μN. Non è una media di vettori con direzioni non specificate, ma delle letture positive richieste.

Ipotesi fisiche controllate: Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: Media 5 μN distinta da 21/4 ai dati medi: media meno risultato ai dati medi=−1/4.10 somma, uno semidifferenza, zero usa cancellazione vettoriale invece media moduli.

Esito esatto indipendente: 5. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-lorentz-force-13

Derivazione primaria storica, conservata: Bersaglio F_B,B=(2/3)·6=4 μN, nuova v=1 km/s. Serve B_B=4 mT e rapporto B_B/B_A=4/3. Non si copia il rapporto delle forze perché varia anche la rapidità.

Ipotesi fisiche controllate: Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: Bersaglio 4 μN e v 1 richiedono B 4 mT: rapporto 4/3; 3/4 reciproco, 2/3 copia rapporto di F, mezzo solo v, 2 darebbe F 6 μN.

Esito esatto indipendente: 4/3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-lorentz-force-14

Derivazione primaria storica, conservata: Riferimento forza 6 μN e lettura 18: guadagno 3 unità/μN. Lettura 12 decodifica forza 4 μN. Con B=4 mT e q=1 μC, l’inversa dà v=1 km/s. Il display non misura la rapidità direttamente.

Ipotesi fisiche controllate: Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: Guadagno 3 μN⁻¹, D 12→F 4, B 4→v 1 km/s. 3 tratta D come F, 4 copia F, 1/4 predice F 1 e D 3.

Esito esatto indipendente: 1. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-lorentz-force-15

Derivazione primaria storica, conservata: Forze di riferimento 6 e 4 μN e letture 13 e 9: guadagno (13−9)/(6−4)=2 unità/μN, offset 1. Lettura 41 indica F=(41−1)/2=20 μN. Con B=5 mT, v=20/5=4 km/s.

Ipotesi fisiche controllate: Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: Guadagno 2 μN⁻¹, offset 1, D 41→F 20, B 5→v 4 km/s. 41/10 omette l’offset e D 42; 8 omette il guadagno; 20 copia F.

Esito esatto indipendente: 4. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

### AR-u6-lorentz-force-16

Derivazione primaria storica, conservata: Il vincolo fra preparazioni è v=(2/3 km/s per mT)B. Scrivendo b=B/(1 mT), la forza in μN è (2/3)b². Misura 6 implica b²=9; il ramo B>0 seleziona B=3 mT e v=2 km/s. Non è un campo che aumenta temporalmente con la velocità: un B variabile richiederebbe altri effetti non presenti nel modello.

Ipotesi fisiche controllate: Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.

Successiva lettura delle alternative e controprove indipendenti: β=B/(1 mT)>0 porta F/(1 μN)=(2/3)β²=6→β²9→β 3, v 2 km/s.−3 viola i moduli, 9 copia quadrato, 2 copia v; misura fissa scala.

Esito esatto indipendente: 3. Modalità EXACT_ORACLE; ambito EXACT_MANUAL_CALCULATION.

## Figura e limiti

XML completo e PNG nativo 640 × 1480 letti: q positiva, v verso destra, B entrante dà F verso l’alto; due frecce separate con punte complete e rettangolo ortogonalità, lunghezze non confrontabili fra unità diverse esplicitate. Barre 300/200/250 per 6/4/5 μN da origine 150, comune 50 coordinate/μN. Grafico indipendente con B 3 mT, q 1 μC: x=150+160 v, y=1310−30 F, segmento(470, 1130)=(2 km/s, 6 μN); origine aperta esclusa da v>0. Nessuna traiettoria rettilinea inferita dal disegno.

UI prodotto, layout responsive e approvazione umana NOT_RUN. Nessun marker UI inventato, copiato o aggiornato. Publication DRAFT, publicationAction NONE. Le identità fresh/saved sono confrontate con le fixture realmente lette e con i commit Git dei finali. Confronto canonico ROOT e integrazione restano PENDING_ROOT: nessun credito anticipato. Nessun candidato, registry, ledger, runtime o Git ROOT modificato.

Verifier SHA256 5427fd70e99aeae130be01083d14eed14efc3233c5ab93fa5165f2d9fe3e8810. Package canonico SHA256 de63741a3beb8f0f46c208549d909e1c7a89377259bc92a807245ff3f26da9df. Binding canonico SHA256 7e9837a066eda6b0fc8db9e292ba4d4c65ea3ac5a86830ea2c2e4ba08b64419d. Report SHA256 e24abe953ed67f4df359ba252310a27b2827f9c945b8a8574a14e7e0eef15ed2.
