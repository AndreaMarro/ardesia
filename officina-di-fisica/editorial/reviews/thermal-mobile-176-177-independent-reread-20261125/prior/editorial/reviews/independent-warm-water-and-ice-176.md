# Revisione indipendente warm-water-and-ice-176

La primaria di tutti gli 80 prompt originali U5-03 è stata salvata prima di aprire candidati, opzioni o chiavi: file primary-calorimetry-173-177-before-candidates-20261125.md, SHA256 ea13a6d7b6eca676daa520594e324f8c84aaabe64114d375dc3eabf35f47e2d9. Pin fonte 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605; shard U5-03 SHA256 417d221f47f7e8e3b1f3af5f9a38fb9eebc7f344371b9e64b699e3892039fe6b. I messaggi autore hanno anticipato soltanto SHA, file e ipotesi generali, senza chiavi o risultati. Nessun modulo autore è stato importato o letto per derivare le risposte.

Successivamente sono stati letti individualmente tutti i 16 prompt finali, ciascuna opzione, tutti i blocchi e le formule, hint, feedback, metadati e didascalie; i calcoli sono stati ricontrollati sui dati realmente proposti. Il file ROOT è identico all’edizione finale letta nel Git B, comprendendo il fix visibile SVG 9d647bca e, per 17309, il fix hint 5579fe21. Non si congela una vecchia edizione. Le competenze C3-L01 (scale e confine), C3-L03 (capacità totale e specifica) e C3-L04 (fase e bilanci a tratti) sono reali e sono state rilette. La competenza primaria L04 è coerente con tutti questi sedici compiti.

Il modello usa coefficienti ideali esplicitamente assegnati; non li dichiara valori sperimentali esatti dell’acqua. Massa, potenza, calore trasferito, temperature puntuali e incrementi restano grandezze distinte. Gli oracoli indipendenti derivano bilanci, inverse, rapporti, tarature e rami fisici con SymPy, Pint e Fraction; nessun PASS deriva dalla sola chiave candidata o dal flag autore.

## Lettura e prova per ciascun ID

### AR-u5-warm-water-and-ice-01

Il caldo cede 4·4(50−Θ) J, il ghiaccio riceve 300+4Θ J. 800−16Θ=300+4Θ dà Θ=25 K, lettura 25 °C; fusione completa perché 800>300 J.

Ipotesi: Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: Media aritmetica semplice delle temperature perde massa e calore latente; 50 °C non cede calore, zero ignora residuo positivo.

Esito indipendente esatto: 25; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-warm-water-and-ice-02

Il risultato è una lettura in °C. L’incremento da 0 °C è in K con stesso numero, mentre il punto assoluto corrispondente è 298,15 K.

Ipotesi: Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: J, g, J/g e W sono grandezze diverse da una lettura termica.

Esito indipendente esatto: °C; modalità AI_CONCEPTUAL, ambito NO_STUDENT_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-warm-water-and-ice-03

Raccogliendo Θ nel bilancio c_lm_a(50 K−Θ)=m_iL_f+c_lm_iΘ, il denominatore è c_l(m_a+m_i), la capacità di tutta l’acqua finale.

Ipotesi: Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: Il denominatore include entrambe le masse finali; segno più farebbe della fusione una sorgente.

Esito indipendente esatto: Θ = [c_l m_a (50 K) − m_i L_f] / [c_l (m_a + m_i)]; modalità AI_CONCEPTUAL, ambito SYMBOLIC_MANUAL_DERIVATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-warm-water-and-ice-04

Con caldo 8 g e ghiaccio 1 g: residuo 1600−300=1300 J, capacità 36 J/K, lettura 325/9 °C fra 25 e 50.

Ipotesi: Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 50 °C è raddoppio ingiustificato; 25/2 °C va nel verso opposto, 100 °C supera le temperature iniziali.

Esito indipendente esatto: Da 25 a 325/9 °C; modalità AI_CONCEPTUAL, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-warm-water-and-ice-05

A 25 °C il grammo di ghiaccio richiede 300+100=400 J; ogni grammo caldo cede 4·25=100 J. Servono 4 g.

Ipotesi: Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 3 g coprono solo fusione a 25 K di raffreddamento; 1 g non garantisce fusione completa.

Esito indipendente esatto: 4; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-warm-water-and-ice-06

Il caldo di 4 g cede 400 J; ogni grammo di ghiaccio richiede 400 J/g per fondere e arrivare a 25 °C. Massa ghiaccio 1 g.

Ipotesi: Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 4/3 g omettono il riscaldamento dell’acqua fusa; 4 g copiano il caldo e violano il ramo.

Esito indipendente esatto: 1; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-warm-water-and-ice-07

B con 4 g caldi e 2 g di ghiaccio: (800−600)/24=25/3 K. Rapporto delle letture con A=25 è 1/3, entrambe nel ramo completo.

Ipotesi: Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 1/2 segue solo massa ghiaccio, 3 è reciproco, 2 ha verso sbagliato, 1 ignora entrambi i costi.

Esito indipendente esatto: 1/3; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-warm-water-and-ice-08

La proposta 50 °C supera il corretto 25 °C di 25 K. Alla proposta il caldo non cederebbe calore, impossibile per fondere una massa positiva.

Ipotesi: Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: −25 K inverte sottrazione; 50 K copia la proposta, 2 è rapporto puro e non scarto.

Esito indipendente esatto: 25; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-warm-water-and-ice-09

m_a=m_i(L_f+c_lΘ)/[c_l(50 K−Θ)]. Il denominatore positivo richiede 0<Θ<50 K; la parentesi al numeratore è il fabbisogno per grammo ghiacciato.

Ipotesi: Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: Solo L_f omette il riscaldamento; c_lΘ al divisore scambia i due intervalli; reciproco non soddisfa il bilancio.

Esito indipendente esatto: m_a = m_i (L_f + c_l Θ) / [c_l (50 K − Θ)]; modalità AI_CONCEPTUAL, ambito SYMBOLIC_MANUAL_DERIVATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-warm-water-and-ice-10

Il rapporto è [(200κ₁m_a−300κ₂m_i)(m_a+m_i)]/[(κ₁m_a+κ₂m_i)(200m_a−300m_i)]. Si mantengono sia residui sia capacità finali; fattore comune lascia il rapporto 1.

Ipotesi: Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: Residui da soli omettono capacità finali; prodotto e differenza non danno 1 per fattore comune.

Esito indipendente esatto: [(200 κ₁ m_a − 300 κ₂ m_i)(m_a + m_i)] / [(κ₁ m_a + κ₂ m_i)(200 m_a − 300 m_i)]; modalità AI_CONCEPTUAL, ambito SYMBOLIC_MANUAL_DERIVATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-warm-water-and-ice-11

A=25 °C; B=(1000−600)/28=100/7 °C. Rapporto (100/7)/25=4/7. I 1000 J disponibili superano i 600 latenti.

Ipotesi: Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 7/4 è reciproco; 5/4 segue solo caldo; 2 segue solo ghiaccio e 1/2 non è il rapporto completo.

Esito indipendente esatto: 4/7; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-warm-water-and-ice-12

Media (25+100/7)/2=275/14 °C. Le masse medie 9/2 e 3/2 g danno 75/4 °C; scarto esatto fra le operazioni 25/28 K.

Ipotesi: Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 75/4 °C usa masse medie; 275/7 è somma e 75/14 metà differenza, 25 °C ignora B.

Esito indipendente esatto: 275/14; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-warm-water-and-ice-13

Bersaglio 100/7 K con caldo 5 g: cessione 5000/7 J; fabbisogno 2500/7 J/g. Ghiaccio B=2 g, rapporto con 1 g iniziale pari a 2.

Ipotesi: Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 4/7 è rapporto termico e 5/4 rapporto del caldo; 1/2 inverte la massa ricostruita.

Esito indipendente esatto: 2; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-warm-water-and-ice-14

A con Θ=25 K e S=75 dà q=3 K⁻¹. S_B=300/7 dà Θ_B=100/7 K; ghiaccio 2 g richiede 5000/7 J, ogni grammo caldo cede 1000/7 J: caldo B=5 g.

Ipotesi: Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: Il display grezzo non è Θ: q deve precedere l’inversa e la massa non si somma a una lettura.

Esito indipendente esatto: 5; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-warm-water-and-ice-15

Differenze dei riferimenti: ΔS=150/7 su ΔΘ=75/7 K, quindi q=2 K⁻¹, b=1. S_C=659/9 dà Θ_C=325/9 K. Il grammo ghiacciato chiede 4000/9 J, ogni grammo caldo cede 500/9 J: 8 g.

Ipotesi: Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.

Distrattori e controprove: 4 g danno S=51; 5 g danno 178/3; 9 g danno 76, mentre C richiede 659/9.

Esito indipendente esatto: 8; modalità EXACT_ORACLE, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

### AR-u5-warm-water-and-ice-16

Sostituire m_a=4m_i dà Θ=(800−300)/(4·5)=25 K per ogni m_i>0. Fusione completa 8m_i>3m_i. Infinite coppie, non soltanto 4 g e 1 g.

Ipotesi: Acqua iniziale a 50 °C e ghiaccio a 0 °C, masse positive e costanti. Modello calorimetrico isolato con capacità del recipiente trascurabile, coefficienti ideali c_l=4 J/(g K), L_f=300 J/g. 2m_a>3m_i garantisce completa fusione e 0<Θ<50 K. Si conserva il bilancio dei calori e si scalda anche l’acqua appena fusa; rapporti espliciti di letture Celsius, non temperature assolute. Il vincolo confronta preparazioni diverse, non modifica massa o coefficienti nel tempo interno della singola prova.

Distrattori e controprove: 4 g e 1 g sono un esempio; 25 g copia una lettura, zero viola positività e rende indefinito il rapporto.

Esito indipendente esatto: Infinite: ogni m_i>0 con m_a=4m_i; modalità AI_CONCEPTUAL, ambito EXACT_MANUAL_CALCULATION. La procedura usa aritmetica razionale, fattorizzazione elementare o algebra simbolica; nessuna valutazione trascendente o calcolatrice è richiesta.

## Figura e limiti delle prove

SVG completo letto in XML e rendering nativo a piena altezza. Freccia unica e con punta dal caldo al ghiaccio, dichiarata schematica; nessuna lunghezza-massa inventata nei riquadri. Disponibilità 800 J al limite 0 °C distinta dai 400 J effettivamente ceduti alla finale 25 °C. Barre 320 e 240+80 rappresentano 400=300+100 J a scala comune 4/5. Incrementi 25/100/7/275/14 K con larghezze 175/100/137,5 a scala 7 coordinate/K.

I cinque rendering integrali sono asset-only: non costituiscono un replay dell’app o un marker UI. Le anteprime autore b963 precedenti sono storiche; i pacchetti finali di questi cinque lotti non acquisiscono alcun credito UI da questa revisione. Il replay prodotto sul profilo finale è competenza dell’integratore.

## Provenienza congelata

- Verifier SHA256: fbba798cb2d8b28f8bca65b71b1dc2e285b72a820e01d1a82f26ea498dd05131.
- Package canonico SHA256: cb026c59732b99647ffeb40fff987d275562ab23186cfa7701877cabf22092e0.
- Binding canonico SHA256: da67f24f0e0890895de5870af19e1cfea6e76207ba72c36f528be1662a9209fd.
- Report SHA256: 642b9cd9b22840b880921cd950de2bc68206f72eef5d04b607d560f1b826252c.

Nessuna modifica a candidati, registro, checkpoint, runtime o Git ROOT. Human NOT_RUN; publication DRAFT; publicationAction NONE. Questa è review AI distinta dall’autore, non approvazione umana o misura empirica.

## Collaudo finale indipendente

Suite comune: 13 test PASS, processo exit 0 in 7,635 s. Identità canonica fresh e saved per tutti gli 80 record; soltanto enum EXACT_ORACLE e AI_CONCEPTUAL. Verificati dal Git il file fonte immutabile e gli 80 hash individuali. Sei proprietà Hypothesis, ciascuna con 40 configurazioni deterministiche (240 in totale), verificano bilanci, inverse, scale, segni e vincoli ridondanti.

Per questo lotto 25 mutazioni sono realmente rifiutate, incluse tutte le 16 chiavi sbagliate con candidateSha, binding, token e guardie package/binding deliberatamente rinnovati soltanto in memoria. Il rifiuto deve provenire dall’oracolo matematico. Le altre mutazioni controllano testo fisico falso a chiave corretta, fonte falsa, unità errata, corso errato, confini di completezza e SVG alterati. Cinque guasti ulteriori, uno per funzione costitutiva di famiglia, sono introdotti solo nei test dopo svuotamento della cache: le asserzioni fisiche indipendenti li espongono. Si distinguono quindi 125 mutazioni sui pacchetti e 5 guasti degli oracoli, senza accredito di nuove domande.

Trascritto phase-processes-173-177-independent-tests.txt SHA256 6c27acda40992ad18c26290e572f683d4c3e93066c2de6f20d7fb15ce7d6f1c6. Test comune SHA256 de4d573412be9114654c5ec1eaf6e80230051fbecb65345991fde08add7788e0. Mutation report SHA256 081be484fedb7b0d66b4d96bfef0eeda5a66da27bc57005b5a5fa065e933d7de. Nessuna prova browser del prodotto è generata da questa suite scientifica.
