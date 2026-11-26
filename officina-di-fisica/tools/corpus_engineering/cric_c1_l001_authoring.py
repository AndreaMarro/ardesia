"""Ten distinct Cric measurement problems, stable IDs and original families."""
from .vector_geometry_authoring import assemble_family,write_family
SOURCE_IDS=[f'C1-Q{n:03}'for n in range(1,11)]
SOURCE_PATH='officina-di-fisica/content/C1.json'
TASKS=[
('Il microlitro in un cubo millimetrico','Una micropipetta contiene 250 µL. Esprimi lo stesso volume in mm³.',250,
 'Il prefisso micro significa un milionesimo. Poiché 1 L=10⁻³ m³, un microlitro vale 10⁻⁹ m³. Anche un millimetro cubo vale (10⁻³ m)³=10⁻⁹ m³: le due unità di volume sono uguali. Il numero 250 resta quindi invariato.',
 r'1\,\mathrm{\mu L}=10^{-9}\,\mathrm{m^3}\qquad 1\,\mathrm{mm^3}=10^{-9}\,\mathrm{m^3}\qquad 250\,\mathrm{\mu L}=250\,\mathrm{mm^3}',
 '0,25 mm³ confonderebbe la conversione in millilitri con quella richiesta. 250000 mm³ tratterebbe ogni microlitro come un millilitro. Per il volume il fattore lineare va elevato al cubo: non basta spostare il prefisso come per una lunghezza.',
 'Riscrivi entrambe le unità in metri cubi, poi confrontale.'),
('Due termini con la dimensione di energia','Una forza costante F agisce concorde lungo un tratto rettilineo di lunghezza ℓ. Nelle espressioni m indica una massa e v una rapidità. Quale coppia di quantità può comparire in una somma di energie?',['F ℓ e (1/2) m v²','F e m v','F v e (1/2) m v²','m ℓ e F t, con t un tempo','v² e F ℓ'],
 'Il lavoro della forza nelle condizioni assegnate è Fℓ. Le sue dimensioni sono quelle del joule: una massa per una lunghezza al quadrato divisa per un tempo al quadrato. Anche mv²/2 è un’energia, perché v² porta L²/T². Sono quindi termini omogenei e possono essere sommati come energie.',
 r'[F\ell]=ML^2T^{-2}\qquad [mv^2/2]=ML^2T^{-2}\qquad 1\,\mathrm J=1\,\mathrm{N\,m}',
 'F è forza e mv quantità di moto, non energie. Fv è una potenza; mℓ e Ft non hanno la dimensione di energia. v² da solo manca del fattore di massa: ha dimensione di energia per massa, non di energia. Le stesse dimensioni sono una condizione necessaria per una somma fisica.',
 'Controlla entrambi i termini della coppia, non soltanto uno.'),
('Una proprietà che si divide col campione','Un campione omogeneo viene diviso in due parti uguali senza cambiarne lo stato. La massa di ciascuna parte è metà di quella iniziale. Come si chiama una grandezza additiva di questo tipo?',['Estensiva','Intensiva','Adimensionale','Vettoriale','Una grandezza che non dipende dalla quantità di materia'],
 'Indico con m la massa totale e con m₁ e m₂ quelle delle due parti. La massa delle parti si somma per dare la massa totale. La dipendenza dalla quantità di campione identifica una grandezza estensiva. Il dimezzamento non riguarda l’unità: anche esprimendo tutto in chilogrammi ciascuna parte ha metà massa.',
 r'm=m_1+m_2\qquad m_1=m_2\qquad m_1=m/2',
 'Una grandezza intensiva, come la densità del campione omogeneo nello stesso stato, non si dimezza così. La massa ha dimensione M ed è scalare: non diventa adimensionale o vettoriale quando si taglia il campione. L’ultima opzione descrive l’assenza di dipendenza dalla quantità, opposta al dato.',
 'Immagina di riunire le due parti e controlla quale proprietà si somma.'),
('Quante lunghezze della tacca?','Un tratto è lungo 4,0 cm e ogni tacca, intesa come piccolo segmento, è lunga 80 µm. Considera i dati ideali: quante di queste lunghezze coprono esattamente il tratto, senza sovrapposizioni?',500,
 'Indico con n il numero di segmenti richiesto. Porto prima le lunghezze nella stessa unità: 1 cm=10000 µm, quindi il tratto è lungo 40000 µm. Divido per 80 µm. Cancellando uno zero ottengo 4000/8=500. Si contano segmenti di lunghezza data, non punti estremi del tratto.',
 r'4\,\mathrm{cm}=40000\,\mathrm{\mu m}\qquad n=\frac{40000\,\mathrm{\mu m}}{80\,\mathrm{\mu m}}\qquad n=500',
 'Cinquanta perde un fattore dieci nella conversione; cinquemila ne aggiunge uno. Il rapporto inverso 1/500 dice quale frazione del tratto occupa una tacca, non quante ne occorrono. Non si aggiunge uno come nel conteggio dei punti di confine di 500 intervalli.',
 'Conta nella stessa unità prima di dividere; il risultato deve essere puro.'),
('La potenza più vicina in scala logaritmica','Per definizione l’ordine di grandezza è la potenza di dieci più vicina in scala logaritmica. Qual è quella di 7,0 × 10⁻⁵ m?',['10⁻⁴ m','10⁻⁵ m','10⁻⁶ m','10⁻³ m','7,0 × 10⁻⁵ m'],
 'Chiamo n l’esponente della potenza cercata. Tra due potenze consecutive la soglia logaritmica è la loro media geometrica, cioè il coefficiente √10 nella notazione scientifica. Il coefficiente 7 supera √10: basta confrontare i quadrati positivi, 49>10. Si sceglie quindi l’esponente successivo, −4, senza calcolare logaritmi decimali.',
 r'7>\sqrt{10}\qquad 7^2=49>10\qquad n=-5+1\qquad n=-4',
 '10⁻⁵ m copia soltanto l’esponente della notazione scientifica e ignora la soglia. 10⁻⁶ m e 10⁻³ m saltano verso potenze ancora più lontane. Il valore originale con coefficiente 7 non è una singola potenza di dieci e non risponde alla definizione richiesta.',
 'Per decidere il lato di √10 puoi elevare al quadrato entrambi i numeri positivi.'),
('Quattro metri con una direzione','Una scheda riporta uno spostamento di 4 m verso nord. Quale descrizione lo classifica correttamente rispetto a uno scalare?',['È vettoriale: servono modulo, direzione e verso','È scalare: bastano il numero 4 e l’unità m','È adimensionale perché 4 è un numero puro','È una forza perché possiede un verso','È un tempo perché accompagna un moto'],
 'Il numero 4 e l’unità m fissano il modulo, ma non distinguono nord da sud. Lo spostamento ha anche direzione e verso: è una grandezza vettoriale. Una lunghezza scalare, invece, non richiede quella informazione di orientamento.',
 r'|\Delta\vec r|=4\,\mathrm m\qquad [\Delta\vec r]=L',
 'Un dato scalare non cambia scegliendo nord oppure sud, mentre uno spostamento sì. Il numero puro 4 moltiplica un’unità di lunghezza e non rende lo spostamento adimensionale. Avere un verso non basta a essere una forza; metri e secondi descrivono grandezze diverse.',
 'Controlla quale informazione perdi cancellando «verso nord».'),
('La massa dopo avere tolto la tara','Una fiala piena ha massa 54,6 g. La stessa fiala vuota ha massa 0,0420 kg. Qual è la massa del contenuto?',['12,6 g','54,558 g','96,6 g','42,0 g','0,0126 g'],
 'Indico con m_vuota la massa della fiala vuota e con m_contenuto quella del contenuto. La tara va espressa nella stessa unità della massa lorda: 0,0420 kg=42,0 g. Sottraggo 54,6−42,0=12,6 g. La massa del contenuto è positiva e minore di quella della fiala piena, come deve essere per la sottrazione fra massa totale e contenitore.',
 r'm_{\rm vuota}=42{,}0\,\mathrm g\qquad m_{\rm contenuto}=(54{,}6-42{,}0)\,\mathrm g\qquad m_{\rm contenuto}=12{,}6\,\mathrm g',
 '54,558 sottrae 0,0420 a 54,6 senza uniformare kg e g. 96,6 somma la tara; 42,0 è la sola fiala vuota. 0,0126 è il valore numerico corretto in chilogrammi, ma con l’unità g sbagliata diventa mille volte più piccolo.',
 'Prima converti la tara in grammi, poi sottraila.'),
('La dimensione del coefficiente quadratico','Nel modello x=k t², x è una lunghezza e t un tempo. Quale unità SI deve avere k?',['m/s²','m/s','m²/s²','s²/m','m'],
 'Isolo il coefficiente: k=x/t². La sua dimensione è L/T² e l’unità SI è m/s². Il quadrato riguarda il tempo; non modifica la dimensione di x. Avere l’unità di un’accelerazione non significa che k sia automaticamente l’accelerazione numerica del moto: in questa legge l’accelerazione costante sarebbe 2k.',
 r'k=\frac{x}{t^2}\qquad [k]=LT^{-2}\qquad [k t^2]=L',
 'm/s moltiplicato per t² darebbe lunghezza per tempo. m²/s² darebbe un’area, s²/m avrebbe le dimensioni inverse e m lascerebbe un fattore di tempo al quadrato. Ogni proposta va controllata sostituendola nel prodotto k t².',
 'Il coefficiente deve compensare esattamente le dimensioni di t².'),
('Metri al secondo e chilometri all’ora','Un carrello di servizio procede a 1,25 m/s. Qual è lo stesso valore in km/h?',['4,5 km/h','0,45 km/h','45 km/h','5/4 km/h','25/72 km/h'],
 'Chiamo v la rapidità del carrello. Un’ora contiene 3600 s e un chilometro 1000 m. Per passare da m/s a km/h moltiplico per 3600/1000=3,6. Il conto manuale 1,25·3,6 si può fare come 125·36/1000=4500/1000=4,5. Cambia il numero, non la velocità fisica del carrello.',
 r'v=\frac54\,\frac{\mathrm m}{\mathrm s}\qquad v=\frac54\cdot\frac{18}{5}\,\frac{\mathrm{km}}{\mathrm h}\qquad v=\frac92\,\frac{\mathrm{km}}{\mathrm h}',
 '0,45 e 45 introducono un fattore dieci errato. 5/4 conserva il numero senza cambiare l’unità; 25/72 divide per 3,6 e corrisponde alla conversione nel verso opposto, non a quella richiesta.',
 'Costruisci fattori di conversione che cancellino m e s lasciando km/h.'),
('Stesso liquido, massa diversa','Due porzioni dello stesso liquido omogeneo hanno masse diverse, ma uguale temperatura e uguale pressione. Che cosa si può prevedere per le loro densità?',['Sono uguali: la densità è intensiva nello stesso stato','La porzione più massiccia ha densità maggiore nello stesso rapporto','La porzione più massiccia ha densità minore nello stesso rapporto','Devono essere diverse perché le masse sono diverse','Una delle due densità deve essere nulla'],
 'Chiamiamo A e B le due porzioni e λ=m_B/m_A>0 il rapporto delle masse. La densità è massa divisa per volume. Nello stesso liquido omogeneo, alla stessa temperatura e pressione, una porzione con più massa occupa volume proporzionalmente maggiore: il rapporto m/V resta uguale. È una proprietà intensiva dello stato, non una misura della quantità totale di liquido.',
 r'\rho=\frac mV\qquad m_B=\lambda m_A\qquad V_B=\lambda V_A\qquad \rho_B=\rho_A',
 'Le due proporzioni opposte con la sola massa dimenticano che cambia anche il volume. Masse diverse non richiedono densità diverse; densità nulla sarebbe incompatibile con una porzione di massa positiva e volume finito. Lo stato termico e la composizione uguali sono ipotesi essenziali.',
 'Chiediti come cambia anche il volume quando prelevi più liquido.')]
CHOICES={n:0 for n in[2,3,5,6,7,8,9,10]}
UNITS={1:'mm³',4:'1'}
FIGURES={1:'Un volume equivalente può occupare un prisma di lati 5 mm, 5 mm e 10 mm: il prodotto è 250 mm³. È una rappresentazione dello stesso volume, non la forma reale della micropipetta. Il pannello serve a confrontare µL e mm³.',6:'Il pannello finale rappresenta il vettore spostamento da O al punto a nord, con quattro intervalli da 1 m. Il modulo è 4 m e la freccia aggiunge il verso; non rappresenta una forza o una traiettoria obbligata.',7:'Le tre barre della massa hanno origine e scala comuni: piena 54,6 g, vuota 42,0 g e contenuto 12,6 g. La massa del contenuto è una differenza dopo la conversione della tara, non una nuova lettura in chilogrammi.'}
def assemble(repo,source_ref):
 categories={1:'unità',2:'unità',3:'concetto',4:'unità',5:'concetto',6:'concetto',7:'unità',8:'unità',9:'unità',10:'concetto'}
 overrides={n:{'error':{'category':categories[n],'message':t[5],'target':'C1-L001'},'coverage':['Misura e SI',t[0]]}for n,t in enumerate(TASKS,1)}
 return assemble_family(repo,source_ref,'cric-c1-l001',TASKS,CHOICES,UNITS,'cric-c1-l001-progressive.svg',FIGURES,0,source_path=SOURCE_PATH,source_origin='cric',source_ids=SOURCE_IDS,course='C1',skill='C1-L001',section='Misura e rappresentazione',coverage=['Dieci problemi distinti di misura'],overrides=overrides)
if __name__=='__main__':write_family(assemble,'cric-c1-l001')
