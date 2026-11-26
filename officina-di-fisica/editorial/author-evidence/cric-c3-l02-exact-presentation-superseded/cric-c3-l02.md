# cric-c3-l02

Dieci problemi Cric distinti; nessuna espansione in varianti. Fonte immutabile `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C3.json`. ID, famiglia, difficoltà e metadati protetti originali conservati; versione nuova = originale + 1, baseVersion originale.

Competenza e prerequisiti riletti nella lezione reale del medesimo pin. Assembler canonico unico, dipendenza esterna congelata 23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5; nessun secondo ETL.

Doppia assembly byte-identica e importatore canonico su SQLite temporaneo: 10 salvati, ripetizione 0/10, dieci live originali e 991 pubblicati/storico invariati. Immagine SVG-only completa letta dopo processo reale exit 0; non è un collaudo del prodotto. Review scientifica propria, approvazione umana e UI prodotto NOT_RUN; pubblicazione NONE.

## C3-Q011

Compito: Un recipiente rigido contiene un gas perfetto alla stessa temperatura prima e dopo una perdita. La pressione assoluta scende da 160 a 120 kPa. Quale percentuale delle moli iniziali è uscita?

Procedimento: Nei due equilibri il rapporto p/n=RT/V resta costante. Il rapporto delle moli rimaste è quindi 120/160=3/4. La frazione uscita è il complemento: 1−3/4=1/4, ossia il 25% delle moli iniziali. Il sistema non è chiuso durante la perdita.

Passaggi esatti: `\frac{n_f}{n_i}=\frac{120}{160}=\frac34\qquad f_{\rm uscita}=1-\frac34=\frac14\qquad f_{\rm uscita}=25\%`.

Distrattori: 75% è la frazione rimasta, non quella uscita. Il calo di 40 kPa va rapportato ai 160 kPa iniziali, non ai 120 finali. Conservare le moli contraddirebbe la perdita nel recipiente rigido isotermo.

Aiuto: A volume e temperatura fissati confronta prima le moli rimaste, poi prendine il complemento.

Famiglia: `quante-molecole-sono-rimaste`; difficoltà 2; versione 2/base 1.

## C3-Q012

Compito: Due recipienti contengono gas perfetti diversi ma hanno gli stessi valori di pressione assoluta p, volume V e temperatura assoluta T. Quale grandezza deve essere uguale?

Procedimento: Per ciascun recipiente l’equazione di stato fornisce n=pV/(RT). I tre dati e la costante universale R sono uguali, quindi le moli sono uguali. La massa è invece nM e può cambiare con la massa molare della specie.

Passaggi esatti: `n_A=\frac{pV}{RT}\qquad n_B=\frac{pV}{RT}\qquad n_A=n_B`.

Distrattori: Masse e densità di massa non sono necessariamente uguali per gas diversi. La massa molare caratterizza la specie, non soltanto lo stato p,V,T. Neppure l’energia interna è universalmente la stessa per gas ideali con struttura molecolare diversa.

Aiuto: Isola n dall’equazione di stato senza introdurre la massa molare.

Famiglia: `due-gas-nello-stesso-stato-macroscopico`; difficoltà 1; versione 2/base 1.

## C3-Q013

Compito: Un palloncino ideale chiuso contiene gas perfetto. Il volume è 1,80 L a 270 K; alla stessa pressione assoluta il gas raggiunge 315 K. Qual è il nuovo volume in litri?

Procedimento: Per la stessa quantità di gas a pressione costante V/T=nR/p. Il rapporto termico è 315/270=7/6. Moltiplico 1,80 L per 7/6: 1,80/6=0,30 e 0,30·7=2,10 L. Il riscaldamento produce qui un aumento di volume.

Passaggi esatti: `\frac{V_f}{V_i}=\frac{T_f}{T_i}\qquad V_f=1{,}80\frac76\,\mathrm L\qquad V_f=2{,}10\,\mathrm L`.

Distrattori: Usare 270/315 descriverebbe la variazione inversa e ridurrebbe il volume mentre il gas si scalda. Sommare 45 al numero di litri mescola un intervallo termico con un volume. Il vincolo è la pressione, non il volume.

Aiuto: Riduci prima il rapporto 315/270 a 7/6.

Famiglia: `un-pistone-sotto-carico-costante`; difficoltà 1; versione 2/base 1.

## C3-Q014

Compito: Un sensore viene azzerato nell’aria. Prima di usare la sua lettura nell’equazione di stato si somma la pressione atmosferica locale. Come si chiama la pressione così ottenuta?

Procedimento: L’azzeramento nell’aria fa leggere una differenza rispetto all’atmosfera. Aggiungendo il riferimento atmosferico si ottiene la pressione assoluta, con zero nel vuoto. È questa la grandezza che entra nell’equazione del gas perfetto.

Passaggi esatti: `p_{\rm ass}=p_{\rm rel}+p_{\rm atm}`.

Distrattori: Relativa è la lettura prima della somma. Tangenziale non è una diversa origine di pressione. Dividere per le moli non definisce la pressione assoluta e il suo segno non deve essere negativo nel modello del gas.

Aiuto: Individua se lo zero della lettura è nell’aria oppure nel vuoto.

Famiglia: `quale-pressione-va-in-pv`; difficoltà 1; versione 2/base 1.

## C3-Q015

Compito: Un gas perfetto di 0,250 mol occupa 6,20 L a 100 kPa assoluti. Usa esattamente il valore di modello R=8,314 J/(mol·K). Quale espressione dà la temperatura in kelvin senza arrotondamenti?

Procedimento: Il prodotto kPa·L equivale a J, quindi pV=100·6,20=620 J. Il prodotto nR è 0,250·8,314=2,0785 J/K, ossia 4157/2000 J/K. Dividere 620 per questa frazione dà 1240000/4157 K. Il rapporto è già un risultato esatto e non richiede una divisione decimale lunga.

Passaggi esatti: `pV=620\,\mathrm J\qquad nR=\frac{4157}{2000}\,\mathrm{J/K}\qquad T=\frac{pV}{nR}\qquad T=\frac{1240000}{4157}\,\mathrm K`.

Distrattori: 620/4157 perde il fattore 2000 del denominatore frazionario. 1240000/8314 dimezza la temperatura corretta. La frazione reciproca non ricostruisce pV=nRT. 310 K userebbe R=8 invece del valore 8,314 prescritto: non è la stessa preparazione.

Aiuto: Calcola pV in joule e scrivi nR come frazione, mantenendo R assegnata.

Famiglia: `risalire-alla-temperatura`; difficoltà 2; versione 2/base 1.

## C3-Q016

Compito: Quale situazione richiede maggiore cautela nell’applicare pV=nRT a un gas reale?

Procedimento: Il modello ideale trascura il volume proprio delle molecole e le interazioni che non siano urti. In un gas denso vicino alla condensazione tali effetti possono diventare importanti: occorre valutare un’equazione di stato più adeguata. L’uso di unità corrette non basta a rendere ideale ogni gas.

Passaggi esatti: `pV=nRT\quad\text{nel modello di gas perfetto}`.

Distrattori: Diluizione e distanza dalla condensazione favoriscono il modello. Pascal, kelvin e moli sono le unità coerenti richieste, non cause del suo fallimento fisico. Non basta cambiare unità per correggere interazioni reali.

Aiuto: Cerca la condizione in cui dimensioni e interazioni molecolari diventano meno trascurabili.

Famiglia: `quando-abbandonare-il-gas-perfetto`; difficoltà 2; versione 2/base 1.

## C3-Q017

Compito: Un gas perfetto chiuso passa da 90 kPa assoluti, 2 L e 270 K a 3 L e 360 K. Qual è la pressione finale in kPa?

Procedimento: La quantità di gas è conservata. Dalla relazione pV/T costante isolo p_f=p_i(T_f/T_i)(V_i/V_f). Il riscaldamento dà un fattore 4/3 e l’espansione un fattore 2/3. Il prodotto con 90 kPa è 90·8/9=80 kPa.

Passaggi esatti: `p_f=p_i\frac{T_f}{T_i}\frac{V_i}{V_f}\qquad p_f=90\frac43\frac23\,\mathrm{kPa}\qquad p_f=80\,\mathrm{kPa}`.

Distrattori: 120 kPa considera soltanto la temperatura. 60 kPa considera soltanto il volume. 180 kPa usa il rapporto diretto dei volumi insieme al riscaldamento, invertendo l’effetto dell’espansione. Nessuno dei due dati può essere ignorato.

Aiuto: Scrivi separatamente il fattore termico e quello volumetrico.

Famiglia: `volume-e-temperatura-cambiano-insieme`; difficoltà 2; versione 2/base 1.

## C3-Q018

Compito: Per un gas perfetto chiuso, il rapporto pV/T vale n moltiplicato per quale costante universale, indicata con una lettera?

Procedimento: Dividendo pV=nRT per T>0 rimane pV/T=nR. La lettera R indica la costante universale dei gas. Non dipende dalla specie, mentre n dipende dalla quantità presente nel campione.

Passaggi esatti: `\frac{pV}{T}=nR\qquad [R]=\mathrm{J/(mol\,K)}`.

Distrattori: g indica un’accelerazione gravitazionale; c e λ possono indicare proprietà termiche o altre grandezze, ma non la costante universale richiesta. σ compare nella legge di irraggiamento. R va distinta dalla massa molare della specie.

Aiuto: Dividi l’equazione di stato per la temperatura assoluta.

Famiglia: `individuare-la-costante-del-campione`; difficoltà 1; versione 2/base 1.

## C3-Q019

Compito: Nel piano con T in kelvin in ascissa e p assoluta in ordinata si tracciano due rette per lo stesso numero di moli di gas perfetto: una a volume V>0, l’altra a 2V. Quale ha pendenza maggiore?

Procedimento: Isolo p=(nR/V)T. La pendenza nel grafico assegnato è nR/V, positiva. Raddoppiando il volume la pendenza si dimezza: la retta a V è quindi due volte più ripida. Le temperature sono assolute, così l’origine ideale è T=0, p=0.

Passaggi esatti: `a_V=\frac{nR}{V}\qquad a_{2V}=\frac{nR}{2V}\qquad \frac{a_V}{a_{2V}}=2`.

Distrattori: Attribuire la pendenza maggiore al volume doppio scambia il rapporto inverso. Il valore nR è comune, ma è diviso per volumi diversi. Cambiare l’origine della scala termica sposta l’intercetta, non trasforma questo rapporto di pendenze.

Aiuto: Leggi il coefficiente di T dopo avere isolato p.

Famiglia: `pendenze-del-grafico-p-contro-t`; difficoltà 2; versione 2/base 1.

## C3-Q020

Compito: Un gas perfetto a 300 K e 100 kPa assoluti ha massa molare M=0,0280 kg/mol. Usa R=8,314 J/(mol·K). Quale espressione esatta dà la densità in kg/m³?

Procedimento: Scrivo m=nM e divido per V: ρ=nM/V=pM/(RT). Nel numeratore 100000·0,0280=2800; nel denominatore 8,314·300=2494,2. Moltiplicando entrambi per 10 e semplificando per 2 ottengo 14000/12471 kg/m³. La frazione è compresa fra 1 e 6/5, controllo ottenibile con prodotti interi.

Passaggi esatti: `\rho=\frac{pM}{RT}\qquad \rho=\frac{2800}{2494{,}2}\,\mathrm{kg/m^3}\qquad \rho=\frac{14000}{12471}\,\mathrm{kg/m^3}`.

Distrattori: 14/12471 conserva il numero in kPa senza convertirlo in Pa. 14000000/12471 usa 28 al posto di 0,0280 kg/mol, perdendo la conversione da grammi a chilogrammi. La frazione reciproca non ha lo stesso valore e 28 copia il numero della massa molare in g/mol, non una densità.

Aiuto: Usa la massa molare in kg/mol e la pressione in Pa prima di formare il rapporto.

Famiglia: `una-densita-a-partire-dalla-massa-molare`; difficoltà 3; versione 2/base 1.
