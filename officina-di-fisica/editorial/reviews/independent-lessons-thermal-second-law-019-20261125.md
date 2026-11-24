# Revisione indipendente AI — lessons-thermal-second-law-019

Il file Git del corso C3 contiene esattamente dieci lezioni, con ID a due cifre. Dopo L01..L08 restano soltanto **C3-L09 e C3-L10**: questo lotto ne verifica due, senza inventare L11/L12 o riempire il lotto con C4 di altra ownership. Letti integralmente **15 blocchi**, formule e didascalie e due SVG originali, XML e anteprime individuali complete. Revisore AI separato dall'autore storico; nessun authoring, chiave o flag preesistente usato come oracolo.

**2 originali PASS,0 FAIL,36 controlli esatti** con SymPy1.14.0,Pint0.25.2 e frazioni. Nessuna nuova edizione necessaria per questi due record entro le ipotesi lette. `humanApproval=NOT_RUN`, `publicationAction=NONE`, originali conservati. Non modificati fonti, asset, candidati, registro, checkpoint o runtime. Le costruzioni matematiche aggiuntive sono prove del revisore, non nuovi esercizi o risultati di studenti.

Fonte effettiva: `officina-di-fisica/content/C3.json` alla revisione Git `5d1dc8dc7b601aef959d10d564c75462be74708d`, SHA256 file `44cb7679671a99a5da654133d4f1c12a542acf1a4688987121bcd5a776a262e0`. Entrambi gli ID riscontrati anche `ACCOUNTED/NOT_RUN` nel checkpoint letto `debb91ed15d80c101a2c0fa244640b37ad78bfb1f6f70e12e768e0100170de7a`.

| ID | SHA256 canonico dell'intero record letto | Esito / controlli |
|---|---|---|
| C3-L09 | `aea4c6724c1f14307b97b8e2ca64b622d2a35248ef29f02f2c72b3212d22b214` | PASS / 18 |
| C3-L10 | `d129e867749b91c95d0d0f7af9daa0179ccc38ba033dd3d1a7cad66bb011ab74` | PASS / 18 |

## C3-L09 — macchina termica e limite di Carnot

Controllati ciclo motore, Qh/Qc come moduli positivi, segno negativo del calore espulso nel bilancio del fluido, lavoro utile ed efficienza con **calore assorbito**, non calore netto, al denominatore. Primo principio sul ciclo dà W=Qh−Qc e eta=W/Qh=1−Qc/Qh. Il dominio di rendimento motore comprende Qh>0,W≥0 e due soli serbatoi a temperature assolute0<Tc<Th, senza altre risorse o effetti netti nascosti. Non applico questa eta come se fosse una prestazione frigorifera.

Gli enunciati di Kelvin–Planck e Clausius sono qualificati con sistema ciclico e **unico effetto**. Non proibiscono un'espansione isoterma non ciclica che converta Q in W lasciando il gas in un volume diverso; non proibiscono un frigorifero alimentato da lavoro. L'enunciato non è una falsa affermazione che qualsiasi processo debba sempre scaricare calore per produrre lavoro.

Derivazione indipendente del limite: l'entropia dei serbatoi cambia di `Sgen=Qc/Tc−Qh/Th≥0` sul ciclo complessivo. Ricavo `Qc=Tc(Qh/Th+Sgen)` e quindi

`etaCarnot−eta=Tc Sgen/Qh≥0`.

Con Sgen=0 si ottiene1−Tc/Th. Temperature uguali danno rendimento massimo0; Tc positivo fa rimanere il limite sotto1. Per il ciclo reversibile di Carnot, le due isoterme sono raccordate da due adiabatiche, come dice il testo. In una realizzazione con gas ideale le adiabatiche danno `Vc/Vd=Vb/Va`, perciò i logaritmi delle due isoterme si cancellano e `Qc/Qh=Tc/Th`. Questa realizzazione è un controllo aggiuntivo; il limite universale sopra non è dedotto solo da un particolare fluido.

**Prove del revisore**, non dati assegnati dalla lezione: Th=600K,Tc=300K danno etaCarnot=1/2. Ricevere6J e scaricarne3 produce3J di lavoro e rendimento1/2. Scaricarne4 produce rendimento1/3, sotto il limite. Il tentativo6J assorbiti e2J espulsi darebbe rendimento2/3 ma variazione entropica dei serbatoi `−6/600+2/300=−1/300J/K`, impossibile come unico effetto del modello isolato. Convertire ciclicamente6J di un solo bagno a600K tutti in lavoro rimuoverebbe1/100J/K senza compensazione; una trasformazione non ciclica può invece lasciare incremento entropico nel fluido, mostrando il ruolo della condizione ciclica.

La controprova frigorifera è coerente:3J presi al freddo più3J di lavoro ricevuto permettono6J ceduti al caldo. Con300/600K, `−3/300+6/600=0` per i serbatoi nel limite reversibile; non è trasferimento spontaneo come unico effetto. Inserire i corrispondenti numeri Celsius di300/600K nel rapporto darebbe2000/2179 anziché1/2: l'avviso della fonte sulle temperature assolute è sostanziale. Tutte le prove usano interi, frazioni e cancellazione di simboli, senza imporre una valutazione decimale di logaritmi.

`C3-macchina.svg`: Qh entra nel motore dalla sorgente calda a sinistra; Qc esce a destra verso la fredda; W esce in basso. Le tre punte sono presenti. Le frecce hanno lunghezze diverse non dichiarate proporzionali a energia: Qc graficamente più lungo di Qh non assegna un motore con Qc>Qh. La didascalia dichiara direzioni e moduli, non scala energetica. Nessuna temperatura o quantità di calore numerica assegnata.

## C3-L10 — entropia, riferimento reversibile e conteggio statistico

Controllati conservazione dell'energia distinta dal verso spontaneo, temperatura comune dei corpi, entropia di sistema e ambiente nell'insieme **complessivamente isolato**, possibilità che una parte perda entropia, funzione di stato, cammino reversibile ausiliario, reservoir a temperatura fissa, avviso per temperature variabili e interpretazione statistica con configurazioni **equiprobabili**. I limiti sono presenti nel materiale stesso, non aggiunti per salvare un'affermazione universale falsa.

Per Q>0 dal caldo al freddo, i due contributi sono `−Q/Th` e `+Q/Tc`; la somma è `Q(Th−Tc)/(ThTc)>0`. Con serbatoi alla stessa T il limite è0. J/K è l'unità corretta. **Prova del revisore**:6J da600 a300K danno−1/100J/K al caldo,+1/50J/K al freddo e+1/100J/K totale. Il processo inverso senza altra compensazione conserva ancora energia, ma darebbe−1/100J/K totale: il primo principio da solo non seleziona il verso.

DeltaS è calcolabile lungo un cammino **reversibile che colleghi gli stati**, non sostituendo sempre il calore reale irreversibile in Q/T. Per un serbatoio internamente a T fissa la variazione rimane il calore da esso ricevuto diviso per quella T; non è richiesta reversibilità dell'intero trasferimento fra i due serbatoi. Per un corpo che cambia temperatura, con capacità costante C, l'integrale di C/T da Ti a Tf dà `C ln(Tf/Ti)`, con argomento adimensionale e temperature assolute.

**Controprova finita costruita dal revisore**: due corpi con uguali capacità C, inizialmente400K e100K, isolati insieme e senza altro lavoro, terminano a250K. La variazione totale è

`C ln(250/400)+C ln(250/100)=C ln(25/16)>0`.

Il segno si determina a mano perché25>16; non serve calcolare un decimale del logaritmo. Usare un solo denominatore arbitrario per tutto il trasferimento mancherebbe la variazione delle temperature, esattamente il rischio indicato nel testo. Il materiale non assegna400/100K o una risposta decimale: sono verifiche del revisore, lasciate esatte.

Per i microstati, `S=kB lnOmega` è esplicitamente limitata a configurazioni equiprobabili; Omega conta configurazioni accessibili intere positive. Le differenze combinano correttamente i logaritmi in `kB ln(Omegaf/Omegai)`; configurazioni indipendenti moltiplicano le molteplicità e sommano le entropie. Il modello non è esteso a distribuzioni non uniformi senza cambiare formula.

**Controprova statistica del revisore**: due stati equiprobabili danno kB ln2 dal funzionale di Gibbs. Con probabilità3/4 e1/4, invece, si ottiene `kB(2ln2−3ln3/4)`, non kB ln2. La differenza dal valore uniforme è `kB ln(27/16)/4>0`, verificabile senza decimali perché27>16. Ciò controlla realmente la necessità della condizione di equiprobabilità.

Per N particelle ideali indipendenti, raddoppiare il volume accessibile moltiplica le configurazioni posizionali per2^N e dà DeltaS=NkB ln2. La probabilità che tutte restino in uno dei due compartimenti è `2^(1−N)`, pari a1/512 per10 particelle e tendente a0 con N grande. Questo supporta l'avverbio «estremamente probabile» della fonte, senza trasformare la legge macroscopica in certezza di ogni singola configurazione microscopica. Non si assegna questa semplice conta a un qualunque gas interagente o quantistico.

`C3-entropia.svg`: Q passa dal serbatoio caldo sinistro a quello freddo destro; etichette DeltaSh=−Q/Th e DeltaSc=+Q/Tc hanno segni e denominatori distinti corretti. Didascalia e testo specificano che i serbatoi conservano le proprie temperature. Non vengono disegnati due piccoli corpi a temperatura implicitamente costante, né valori metrici nascosti.

## Integrità e limiti

Asset storici originali confrontati con Git e copie locali, immutati:

- C3-macchina.svg: `d731c50778f96cbb5e0038adb43ee4196ed99af557dece4c7de381d1485fb193`.
- C3-entropia.svg: `8d95c2e3952150bb1a206ee74e61635e13fa841522aa1a06383d736ed49c7782`.

**6/6 test PASS,exit0,0,972s**: insieme dei due veri ID residui e assenza di lezioni C3 inventate, identità/riproducibilità, fonte e asset effettivi Git, mutazioni/omissioni di entrambi i record, asset rimossi/alterati, liste di controlli vuote o fallite respinte, logaritmi mantenuti esatti e versi delle figure. Il verificatore non accetta `all([])` come prova. Report originali/effective identici, entrambi2PASS, senza candidato o pubblicazione.

Nessun finding concreto nelle due edizioni lette. Il giudizio è AI e non una decisione umana di pubblicazione, prova UI generale o verifica di prestazioni con studenti. Non sono stati trasformati i richiami teorici in esenzioni da calcoli: derivazioni, segni, unità e casi esclusi sono riportati e risolti; i logaritmi simbolici esatti non sono richieste di calcolatrice non presenti nella fonte.

- Verificatore SHA256: `b068b6e8fb7a621c112d91c23ea69063c6cde6d0fec1de098e9c1c28e5015411`.
- Test SHA256: `ade8505c323d9123c9313760b1012bbed6c13462c560583a001809d4b611a50c`.
- Entrambi i report SHA256 file: `e2a39f13a7d49df10e6780d6f87423cc8d86fee7a32d6728021ab74b8d025845`.
- Digest canonico JSON di ciascun report: `b9dab275985af509e31a019f7ef59985ed97544c517f5def30732ca2e800c676`.
- Contratto SHA256 letto dai report: `a410c96a54250969592294c9aa7755294ec970a6ffee0aed6374debd6b33fe60`.
