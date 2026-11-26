"""Ten distinct original Cric continuity and transport-time questions."""
from .vector_geometry_authoring import assemble_family,write_family
SOURCE_PATH='officina-di-fisica/content/C2.json'
SOURCE_IDS=[f'C2-Q{n:03}' for n in range(41,51)]
TASKS=[
('Volume accumulato nella vasca','In una vasca entrano 9 L/min e ne escono 5 L/min, entrambi costanti. La vasca non trabocca durante i 45 s osservati. Quanto volume si accumula?',3,
 'L’accumulo è il volume entrante meno quello uscente. La portata netta è 9−5=4 L/min. Converto 45 s in 3/4 min: il volume accumulato è 4·3/4=3 L. La portata netta positiva indica che il livello cresce, se la vasca può contenere quel volume.',
 r'Q_{\rm netto}=(9-5)\,\mathrm{L/min}\qquad \Delta t=\frac34\,\mathrm{min}\qquad \Delta V=Q_{\rm netto}\Delta t\qquad \Delta V=3\,\mathrm L',
 '6,75 L conta soltanto l’ingresso. 3,75 L è il volume uscito, non l’accumulo. 10,5 L somma ingresso e uscita e 180 L usa 45 come minuti. Il bilancio ha bisogno del termine di accumulo: non è un nodo stazionario.',
 'Sottrai prima le portate e usa lo stesso tempo in minuti.'),
('Il getto che accelera','Un getto d’acqua continuo cade verticalmente nell’aria. Nel tratto considerato il moto è stazionario, l’acqua è incomprimibile e non si perde massa lateralmente. Perché la sezione del getto si restringe mentre la rapidità media aumenta?',['Perché la stessa portata richiede A v_media costante','Perché la portata volumetrica deve diminuire durante la caduta','Perché la densità dell’acqua deve annullarsi','Perché stazionario significa velocità uguale in ogni punto','Perché la gravità sottrae massa al getto'],
 'In ogni sezione passa la stessa massa per unità di tempo. A densità costante è uguale anche la portata volumetrica Q=A v_media. Se la rapidità aumenta lungo la caduta, l’area deve diminuire per mantenere il prodotto. Stazionario significa che in ciascun punto il campo non cambia nel tempo; una particella può comunque accelerare passando fra punti diversi.',
 r'Q=A_1\bar v_1=A_2\bar v_2\qquad \bar v_2>\bar v_1\qquad A_2<A_1',
 'Una diminuzione della portata richiederebbe accumulo o perdita, qui esclusi. La densità non si annulla e la gravità non elimina materia. La stazionarietà riguarda il tempo in un punto, non l’uniformità spaziale della velocità.',
 'Segui il prodotto area per velocità media attraverso due sezioni.'),
('Diametro dalla portata','In un tubo circolare scorre un liquido con portata 8π cm³/s e velocità normale media di 2 cm/s. Qual è il diametro interno del tubo?',4,
 'Ricavo prima l’area: A=Q/v_media=(8π)/2=4π cm². Per una sezione circolare A=πr², dunque r²=4 cm² e il raggio positivo è 2 cm. La domanda chiede il diametro, che è il doppio: 4 cm. Il π si cancella esattamente e non serve una sua approssimazione decimale.',
 r'A=\frac Q{\bar v}=4\pi\,\mathrm{cm^2}\qquad r^2=4\,\mathrm{cm^2}\qquad r=2\,\mathrm{cm}\qquad d=2r=4\,\mathrm{cm}',
 '2 cm è il raggio, non il diametro. 8 cm raddoppia ancora il risultato richiesto. 4π cm copia l’area numerica attribuendole un’unità lineare. 16 cm darebbe un raggio di 8 cm, un’area di 64π cm² e quindi una portata di 128π cm³/s, non 8π cm³/s.',
 'Dopo Q/v ottieni un’area: estrai il raggio e ricordati di raddoppiarlo.'),
('Il secondo ramo del raccordo','In un raccordo stazionario entra un liquido incomprimibile a 36 mL/s ed esce da due rami. Nel primo passano 840 mL/min. Non ci sono perdite né accumulo. Qual è la portata del secondo ramo in mL/s?',22,
 'Le portate si possono sommare dopo averle espresse nella stessa unità di tempo. Il primo ramo porta 840/60=14 mL/s. Il bilancio del raccordo è Q_in=Q₁+Q₂, quindi Q₂=36−14=22 mL/s. Il risultato positivo conferma il verso uscente assunto per il secondo ramo.',
 r'Q_1=\frac{840}{60}\,\mathrm{mL/s}\qquad Q_1=14\,\mathrm{mL/s}\qquad Q_2=Q_{\rm in}-Q_1\qquad Q_2=22\,\mathrm{mL/s}',
 '50 mL/s somma anziché sottrarre il primo ramo. −804 mL/s sottrae numeri con minuti e secondi non uniformati. 14 mL/s è la portata del ramo già noto. 18 mL/s presume una divisione uniforme non assegnata: i rami non sono dichiarati equivalenti.',
 'Converti 840 mL/min in mL/s prima di scrivere il bilancio.'),
('Stazionario non significa uniforme','Un tubo ha due sezioni diverse e una portata costante nel tempo. Quale ulteriore descrizione deve valere per chiamare stazionario il campo di velocità?',['Il vettore velocità in ogni punto fissato resta costante nel tempo','Il vettore velocità è uguale in tutti i punti del tubo','Ogni particella ha sempre accelerazione nulla','La velocità deve essere zero sulle due sezioni','La sola costanza della portata garantisce qualunque profilo locale costante'],
 'La stazionarietà del campo riguarda l’osservazione in un punto fisso: il vettore velocità lì non varia nel tempo. Può essere diverso in punti diversi, per esempio maggiore nella sezione stretta. La sola portata costante è un vincolo integrale: da sola non impedisce che cambi il profilo mantenendo uguale la sua media.',
 r'\left.\frac{\partial\vec v}{\partial t}\right|_{\vec x}=0',
 'L’uguaglianza fra punti diversi descrive uniformità spaziale, non stazionarietà. Una particella può accelerare attraversando zone con velocità diverse anche in un campo stazionario. Non si richiede flusso nullo e l’integrale costante su una sezione non determina ogni valore locale.',
 'Immagina un sensore fermo nello stesso punto e chiediti se la sua lettura cambia col tempo.'),
('Quanta massa passa in un secondo?','Un liquido omogeneo di densità 0,85 kg/L attraversa una sezione con portata costante di 12 L/min. Quanti chilogrammi la attraversano in un secondo?',['0,17 kg','10,2 kg','0,85 kg','12 kg','17 kg'],
 'La portata di massa è ρQ. In un minuto passano 0,85·12=10,2 kg. In un secondo ne passa un sessantesimo: 10,2/60=0,17 kg. Equivalentemente, 12 L/min sono 0,2 L/s e 0,85·0,2=0,17 kg/s. L’intervallo richiesto è 1 s.',
 r'\dot m=\rho Q\qquad Q=\frac15\,\mathrm{L/s}\qquad \dot m=\frac{17}{100}\,\mathrm{kg/s}\qquad m(1\,\mathrm s)=0{,}17\,\mathrm{kg}',
 '10,2 kg è la massa transitata in un minuto. 0,85 copia la densità numerica; 12 copia la portata volumetrica e cambia unità senza usare ρ. 17 kg introduce un fattore cento. La massa transitata in un intervallo non è la massa immagazzinata nel tubo.',
 'Uniforma il tempo a un secondo e poi moltiplica i litri per kg/L.'),
('Gas: contare la massa','Un gas scorre senza accumulo fra due sezioni. La densità è uniforme in ciascuna sezione; nella seconda raddoppia mentre l’area si dimezza. Come cambia la velocità normale media?',['Resta uguale','Raddoppia','Si dimezza','Quadruplica','Si annulla'],
 'Per un gas comprimibile si conserva la portata di massa, non necessariamente quella di volume. La legge è ρ₁A₁v₁=ρ₂A₂v₂. Qui il prodotto ρ₂A₂=(2ρ₁)(A₁/2) è uguale a ρ₁A₁, quindi v₂=v₁. La densità uniforme in ciascuna sezione permette di portarla fuori dalla media della velocità.',
 r'\rho_1A_1\bar v_1=\rho_2A_2\bar v_2\qquad \rho_2A_2=(2\rho_1)(A_1/2)\qquad \bar v_2=\bar v_1',
 'Raddoppiare la velocità considera solo l’area come per un liquido a densità costante. Dimezzarla considera solo la densità. Quadruplicarla applica entrambi gli effetti nello stesso verso, ma qui si compensano. Il flusso non deve fermarsi per conservare massa.',
 'Confronta prima i prodotti densità per area nelle due sezioni.'),
('La velocità che entra in Q','Nella relazione Q=A v per una sezione con profilo non uniforme, v è la componente normale della velocità, ... sulla sezione. Quale parola completa correttamente?',['Media','Massima','Minima','Tangenziale','Istantanea soltanto sull’asse'],
 'La portata è l’integrale della componente normale della velocità sulla sezione. Dividendo questo integrale per A si ottiene la media areale v_n media, e allora Q=A v_n media. Il massimo sull’asse in un particolare profilo non può sostituire questa media senza conoscere il profilo stesso.',
 r'Q=\int_A v_n\,dA\qquad \bar v_n=\frac1A\int_A v_n\,dA\qquad Q=A\bar v_n',
 'Massimo e minimo descrivono singoli valori estremi, non la media che restituisce l’integrale. La componente tangenziale non attraversa il piano di misura. Un valore istantaneo sull’asse non rappresenta automaticamente tutta la sezione, anche se il campo è stazionario.',
 'Quale media moltiplicata per l’area ricostruisce l’integrale sulla sezione?' ),
('Riempire la linea prima dell’uscita','Una pompa trasferisce 2,4 L in 3 min a portata costante. All’avvio una linea vuota deve riempirsi con 120 mL prima che arrivi liquido all’uscita. Nel modello ideale senza perdite, accumuli elastici o percorsi alternativi, dopo quanti secondi arriva il liquido?',9,
 'La portata è 2,4/3=0,8 L/min, cioè 800 mL/min. Il tempo per fornire il volume interno è 120/800=3/20 min. Moltiplicando per 60 si ottengono 9 s. Il volume inizialmente vuoto è un accumulo transitorio: prima del suo riempimento l’uscita non ha ancora la stessa portata liquida dell’ingresso.',
 r'Q=800\,\mathrm{mL/min}\qquad t=\frac{V_{\rm linea}}Q\qquad t=\frac3{20}\,\mathrm{min}\qquad t=9\,\mathrm s',
 '0,15 s conserva il numero espresso in minuti ma gli assegna secondi. 15 s fornirebbero già 200 mL, non 120 mL; 90 s introdurrebbero un fattore dieci. Zero ignora i 120 mL da accumulare nella linea. Non si aggiungono i tre minuti, che servono soltanto a definire la portata della pompa.',
 'Dividi il volume da riempire per la portata, poi converti i minuti in secondi.'),
('Area totale del letto terminale','In un modello di rete incomprimibile stazionaria arrivano complessivamente 6 mL/s. La velocità normale media rispetto all’intera area aperta del letto terminale è 0,20 cm/s. Qual è la somma delle aree aperte in cm²?',30,
 'La somma delle sezioni terminali va trattata come l’area complessiva attraversata dalla portata totale. Converto 6 mL/s in 6 cm³/s, poi A_tot=Q/v_media=6/0,20=30 cm². La media è riferita all’intera area aperta; non si sta ricavando l’area di un solo piccolo condotto.',
 r'Q=6\,\mathrm{cm^3/s}\qquad A_{\rm tot}=\frac Q{\bar v}\qquad A_{\rm tot}=\frac6{0{,}20}\,\mathrm{cm^2}\qquad A_{\rm tot}=30\,\mathrm{cm^2}',
 '1,2 moltiplica Q per v invece di dividerlo e non ha dimensioni di area. 0,30 cm² introduce un fattore cento; 300 cm² un fattore dieci. 6 cm² copia la portata numerica. Il diametro del singolo ramo non è dato e non va inventato.',
 'Usa la portata totale e la media sulla superficie complessiva, con mL=cm³.')]
CHOICES={n:0 for n in [2,5,6,7,8]}
UNITS={1:'L',3:'cm',4:'mL/s',9:'s',10:'cm²'}
FIGURES={1:'In 45 s entrano 6,75 L ed escono 3,75 L: le barre di volume hanno scala comune e la differenza è 3 L. Il volume della vasca aumenta; non si sta imponendo un nodo stazionario.',4:'Il raccordo riceve 36 mL/s: 14 mL/s attraversano il primo ramo e 22 mL/s il secondo. Le tre barre di portata hanno origine e scala comuni; il bilancio è 36=14+22.',9:'A 800 mL/min la linea accumula 120 mL in 9 s prima dell’arrivo ideale all’uscita. La retta si riferisce al volume consegnato per riempire la linea, nel solo intervallo iniziale.'}
def assemble(repo,source_ref):
 cats={1:'modello',2:'concetto',3:'algebra',4:'unità',5:'concetto',6:'unità',7:'modello',8:'concetto',9:'modello',10:'unità'}
 ov={n:{'error':{'category':cats[n],'message':t[5],'target':'C2-L005'},'coverage':[t[0]]}for n,t in enumerate(TASKS,1)}
 return assemble_family(repo,source_ref,'cric-c2-l005',TASKS,CHOICES,UNITS,'cric-c2-l005-progressive.svg',FIGURES,0,source_path=SOURCE_PATH,source_origin='cric',source_ids=SOURCE_IDS,course='C2',skill='C2-L005',section='Fluidi in movimento',coverage=['Dieci problemi distinti di portata e continuità'],overrides=ov)
if __name__=='__main__':write_family(assemble,'cric-c2-l005')
