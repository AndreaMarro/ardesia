# cric-c1-l001

Dieci problemi Cric distinti; nessuna espansione in varianti. Fonte immutabile `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C1.json`. ID, famiglia, difficoltà e metadati protetti originali conservati; versione nuova = originale + 1, baseVersion originale.

Competenza e prerequisiti riletti nella lezione reale del medesimo pin. Assembler canonico unico, dipendenza esterna congelata 23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5; nessun secondo ETL.

Doppia assembly byte-identica e importatore canonico su SQLite temporaneo: 10 salvati, ripetizione 0/10, dieci live originali e 991 pubblicati/storico invariati. Immagine SVG-only completa letta dopo processo reale exit 0; non è un collaudo del prodotto. Review scientifica propria, approvazione umana e UI prodotto NOT_RUN; pubblicazione NONE.

## C1-Q001

Compito: Una micropipetta contiene 250 µL. Esprimi lo stesso volume in mm³.

Procedimento: Il prefisso micro significa un milionesimo. Poiché 1 L=10⁻³ m³, un microlitro vale 10⁻⁹ m³. Anche un millimetro cubo vale (10⁻³ m)³=10⁻⁹ m³: le due unità di volume sono uguali. Il numero 250 resta quindi invariato.

Passaggi esatti: `1\,\mathrm{\mu L}=10^{-9}\,\mathrm{m^3}\qquad 1\,\mathrm{mm^3}=10^{-9}\,\mathrm{m^3}\qquad 250\,\mathrm{\mu L}=250\,\mathrm{mm^3}`.

Distrattori: 0,25 mm³ confonderebbe la conversione in millilitri con quella richiesta. 250000 mm³ tratterebbe ogni microlitro come un millilitro. Per il volume il fattore lineare va elevato al cubo: non basta spostare il prefisso come per una lunghezza.

Aiuto: Riscrivi entrambe le unità in metri cubi, poi confrontale.

Famiglia: `un-volume-sulla-scala-si`; difficoltà 2; versione 2/base 1.

## C1-Q002

Compito: Una forza costante F agisce concorde lungo un tratto rettilineo di lunghezza ℓ. Nelle espressioni m indica una massa e v una rapidità. Quale coppia di quantità può comparire in una somma di energie?

Procedimento: Il lavoro della forza nelle condizioni assegnate è Fℓ. Le sue dimensioni sono quelle del joule: una massa per una lunghezza al quadrato divisa per un tempo al quadrato. Anche mv²/2 è un’energia, perché v² porta L²/T². Sono quindi termini omogenei e possono essere sommati come energie.

Passaggi esatti: `[F\ell]=ML^2T^{-2}\qquad [mv^2/2]=ML^2T^{-2}\qquad 1\,\mathrm J=1\,\mathrm{N\,m}`.

Distrattori: F è forza e mv quantità di moto, non energie. Fv è una potenza; mℓ e Ft non hanno la dimensione di energia. v² da solo manca del fattore di massa: ha dimensione di energia per massa, non di energia. Le stesse dimensioni sono una condizione necessaria per una somma fisica.

Aiuto: Controlla entrambi i termini della coppia, non soltanto uno.

Famiglia: `due-quantita-sommabili`; difficoltà 2; versione 3/base 2.

## C1-Q003

Compito: Un campione omogeneo viene diviso in due parti uguali senza cambiarne lo stato. La massa di ciascuna parte è metà di quella iniziale. Come si chiama una grandezza additiva di questo tipo?

Procedimento: Indico con m la massa totale e con m₁ e m₂ quelle delle due parti. La massa delle parti si somma per dare la massa totale. La dipendenza dalla quantità di campione identifica una grandezza estensiva. Il dimezzamento non riguarda l’unità: anche esprimendo tutto in chilogrammi ciascuna parte ha metà massa.

Passaggi esatti: `m=m_1+m_2\qquad m_1=m_2\qquad m_1=m/2`.

Distrattori: Una grandezza intensiva, come la densità del campione omogeneo nello stesso stato, non si dimezza così. La massa ha dimensione M ed è scalare: non diventa adimensionale o vettoriale quando si taglia il campione. L’ultima opzione descrive l’assenza di dipendenza dalla quantità, opposta al dato.

Aiuto: Immagina di riunire le due parti e controlla quale proprietà si somma.

Famiglia: `il-campione-si-divide`; difficoltà 1; versione 2/base 1.

## C1-Q004

Compito: Un tratto è lungo 4,0 cm e ogni tacca, intesa come piccolo segmento, è lunga 80 µm. Considera i dati ideali: quante di queste lunghezze coprono esattamente il tratto, senza sovrapposizioni?

Procedimento: Indico con n il numero di segmenti richiesto. Porto prima le lunghezze nella stessa unità: 1 cm=10000 µm, quindi il tratto è lungo 40000 µm. Divido per 80 µm. Cancellando uno zero ottengo 4000/8=500. Si contano segmenti di lunghezza data, non punti estremi del tratto.

Passaggi esatti: `4\,\mathrm{cm}=40000\,\mathrm{\mu m}\qquad n=\frac{40000\,\mathrm{\mu m}}{80\,\mathrm{\mu m}}\qquad n=500`.

Distrattori: Cinquanta perde un fattore dieci nella conversione; cinquemila ne aggiunge uno. Il rapporto inverso 1/500 dice quale frazione del tratto occupa una tacca, non quante ne occorrono. Non si aggiunge uno come nel conteggio dei punti di confine di 500 intervalli.

Aiuto: Conta nella stessa unità prima di dividere; il risultato deve essere puro.

Famiglia: `due-misure-un-rapporto`; difficoltà 2; versione 2/base 1.

## C1-Q005

Compito: Per definizione l’ordine di grandezza è la potenza di dieci più vicina in scala logaritmica. Qual è quella di 7,0 × 10⁻⁵ m?

Procedimento: Chiamo n l’esponente della potenza cercata. Tra due potenze consecutive la soglia logaritmica è la loro media geometrica, cioè il coefficiente √10 nella notazione scientifica. Il coefficiente 7 supera √10: basta confrontare i quadrati positivi, 49>10. Si sceglie quindi l’esponente successivo, −4, senza calcolare logaritmi decimali.

Passaggi esatti: `7>\sqrt{10}\qquad 7^2=49>10\qquad n=-5+1\qquad n=-4`.

Distrattori: 10⁻⁵ m copia soltanto l’esponente della notazione scientifica e ignora la soglia. 10⁻⁶ m e 10⁻³ m saltano verso potenze ancora più lontane. Il valore originale con coefficiente 7 non è una singola potenza di dieci e non risponde alla definizione richiesta.

Aiuto: Per decidere il lato di √10 puoi elevare al quadrato entrambi i numeri positivi.

Famiglia: `una-stima-in-scala-logaritmica`; difficoltà 2; versione 2/base 1.

## C1-Q006

Compito: Una scheda riporta uno spostamento di 4 m verso nord. Quale descrizione lo classifica correttamente rispetto a uno scalare?

Procedimento: Il numero 4 e l’unità m fissano il modulo, ma non distinguono nord da sud. Lo spostamento ha anche direzione e verso: è una grandezza vettoriale. Una lunghezza scalare, invece, non richiede quella informazione di orientamento.

Passaggi esatti: `|\Delta\vec r|=4\,\mathrm m\qquad [\Delta\vec r]=L`.

Distrattori: Un dato scalare non cambia scegliendo nord oppure sud, mentre uno spostamento sì. Il numero puro 4 moltiplica un’unità di lunghezza e non rende lo spostamento adimensionale. Avere un verso non basta a essere una forza; metri e secondi descrivono grandezze diverse.

Aiuto: Controlla quale informazione perdi cancellando «verso nord».

Famiglia: `il-dato-direzionale`; difficoltà 1; versione 3/base 2.

## C1-Q007

Compito: Una fiala piena ha massa 54,6 g. La stessa fiala vuota ha massa 0,0420 kg. Qual è la massa del contenuto?

Procedimento: Indico con m_vuota la massa della fiala vuota e con m_contenuto quella del contenuto. La tara va espressa nella stessa unità della massa lorda: 0,0420 kg=42,0 g. Sottraggo 54,6−42,0=12,6 g. La massa del contenuto è positiva e minore di quella della fiala piena, come deve essere per la sottrazione fra massa totale e contenitore.

Passaggi esatti: `m_{\rm vuota}=42{,}0\,\mathrm g\qquad m_{\rm contenuto}=(54{,}6-42{,}0)\,\mathrm g\qquad m_{\rm contenuto}=12{,}6\,\mathrm g`.

Distrattori: 54,558 sottrae 0,0420 a 54,6 senza uniformare kg e g. 96,6 somma la tara; 42,0 è la sola fiala vuota. 0,0126 è il valore numerico corretto in chilogrammi, ma con l’unità g sbagliata diventa mille volte più piccolo.

Aiuto: Prima converti la tara in grammi, poi sottraila.

Famiglia: `la-bilancia-con-la-tara`; difficoltà 2; versione 3/base 2.

## C1-Q008

Compito: Nel modello x=k t², x è una lunghezza e t un tempo. Quale unità SI deve avere k?

Procedimento: Isolo il coefficiente: k=x/t². La sua dimensione è L/T² e l’unità SI è m/s². Il quadrato riguarda il tempo; non modifica la dimensione di x. Avere l’unità di un’accelerazione non significa che k sia automaticamente l’accelerazione numerica del moto: in questa legge l’accelerazione costante sarebbe 2k.

Passaggi esatti: `k=\frac{x}{t^2}\qquad [k]=LT^{-2}\qquad [k t^2]=L`.

Distrattori: m/s moltiplicato per t² darebbe lunghezza per tempo. m²/s² darebbe un’area, s²/m avrebbe le dimensioni inverse e m lascerebbe un fattore di tempo al quadrato. Ogni proposta va controllata sostituendola nel prodotto k t².

Aiuto: Il coefficiente deve compensare esattamente le dimensioni di t².

Famiglia: `dimensione-del-coefficiente`; difficoltà 2; versione 3/base 2.

## C1-Q009

Compito: Un carrello di servizio procede a 1,25 m/s. Qual è lo stesso valore in km/h?

Procedimento: Chiamo v la rapidità del carrello. Un’ora contiene 3600 s e un chilometro 1000 m. Per passare da m/s a km/h moltiplico per 3600/1000=3,6. Il conto manuale 1,25·3,6 si può fare come 125·36/1000=4500/1000=4,5. Cambia il numero, non la velocità fisica del carrello.

Passaggi esatti: `v=\frac54\,\frac{\mathrm m}{\mathrm s}\qquad v=\frac54\cdot\frac{18}{5}\,\frac{\mathrm{km}}{\mathrm h}\qquad v=\frac92\,\frac{\mathrm{km}}{\mathrm h}`.

Distrattori: 0,45 e 45 introducono un fattore dieci errato. 5/4 conserva il numero senza cambiare l’unità; 25/72 divide per 3,6 e corrisponde alla conversione nel verso opposto, non a quella richiesta.

Aiuto: Costruisci fattori di conversione che cancellino m e s lasciando km/h.

Famiglia: `velocita-annotata-in-reparto`; difficoltà 2; versione 2/base 1.

## C1-Q010

Compito: Due porzioni dello stesso liquido omogeneo hanno masse diverse, ma uguale temperatura e uguale pressione. Che cosa si può prevedere per le loro densità?

Procedimento: Chiamiamo A e B le due porzioni e λ=m_B/m_A>0 il rapporto delle masse. La densità è massa divisa per volume. Nello stesso liquido omogeneo, alla stessa temperatura e pressione, una porzione con più massa occupa volume proporzionalmente maggiore: il rapporto m/V resta uguale. È una proprietà intensiva dello stato, non una misura della quantità totale di liquido.

Passaggi esatti: `\rho=\frac mV\qquad m_B=\lambda m_A\qquad V_B=\lambda V_A\qquad \rho_B=\rho_A`.

Distrattori: Le due proporzioni opposte con la sola massa dimenticano che cambia anche il volume. Masse diverse non richiedono densità diverse; densità nulla sarebbe incompatibile con una porzione di massa positiva e volume finito. Lo stato termico e la composizione uguali sono ipotesi essenziali.

Aiuto: Chiediti come cambia anche il volume quando prelevi più liquido.

Famiglia: `controllare-una-pesata-media`; difficoltà 1; versione 2/base 1.

## Lettura della figura e limiti

SVG 640×1650, immagine intera effettivamente letta. Prisma equivalente: lati disegnati 100,100,200 coordinate per 5,5,10 mm; asse obliquo con proiezione a45°, non sagoma della pipetta. Barre masse con origine comune e 5 coordinate/g:273,210,63 per54,6/42/12,6 g. Spostamento quattro intervalli da1 m,50 coordinate/m, punta intera dipinta dopo le tacche. Scale geometriche soltanto tecniche.

WIP non renderizzato preservato nella cartella vector-paint-order-superseded: solo ordine di pittura della freccia corretto prima della resa finale. Due launcher preliminari hanno fallito per percorso relativo e interprete senza SymPy; nessun risultato positivo attribuito a quei tentativi. Le successive doppia assembly/import e finalizzazione sono realmente concluse con il runtime condiviso. Nessuna approvazione SCI propria o UI prodotto.
