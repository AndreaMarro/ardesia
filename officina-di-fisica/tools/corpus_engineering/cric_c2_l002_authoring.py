"""Ten distinct Cric hydrostatic questions, stable source IDs and families."""
from .vector_geometry_authoring import assemble_family,write_family
SOURCE_PATH='officina-di-fisica/content/C2.json'
SOURCE_IDS=[f'C2-Q{n:03}' for n in range(11,21)]
TASKS=[
('Ricavare una profondità','In acqua omogenea ferma con densità 1000 kg/m³, a quale profondità la pressione supera quella della superficie di 4,0 kPa? Usa g=10 m/s².',['0,40 m','4,0 m','0,04 m','40 m','400 m'],
 'L’incremento di pressione dipende dal dislivello verticale: Δp=ρgh. Converto 4,0 kPa in 4000 Pa e isolo h. Il prodotto ρg vale 10000 Pa/m: 4000/10000=4/10=0,40 m. La pressione atmosferica non va aggiunta perché il dato è già una differenza rispetto alla superficie.',
 r'\Delta p=\rho gh\qquad h=\frac{\Delta p}{\rho g}\qquad h=\frac{4000}{1000\cdot10}\,\mathrm m\qquad h=\frac25\,\mathrm m',
 '4,0 m e 0,04 m spostano di un fattore dieci la profondità. 40 m darebbe 400 kPa, non 4 kPa; 400 m ne darebbe 4000. Usare 4 come se fossero pascal produrrebbe 0,0004 m, un’altra confusione fra Pa e kPa.',
 'Isola h usando soltanto la differenza di pressione e porta prima i kPa in Pa.'),
('Recipiente largo e recipiente stretto','Due recipienti aperti alla stessa atmosfera, uno largo e uno stretto, sono collegati alla base. Contengono lo stesso liquido fermo e omogeneo; trascura la capillarità. Come si dispongono le superfici libere?',['Alla stessa quota','Più in alto nel recipiente stretto per compensare la sua area','Più in alto nel recipiente largo per compensare il peso totale','A quote fissate dal rapporto dei volumi','A qualunque quota, anche con pressioni diverse alla base'],
 'Scelgo un punto del liquido connesso alla base. All’equilibrio la pressione a quella quota deve essere la stessa nei due rami. Su entrambe le superfici agisce la stessa atmosfera, quindi ρgh₁=ρgh₂. Poiché ρ e g sono positivi, h₁=h₂: le superfici hanno quota uguale. La larghezza cambia il volume contenuto, non questa condizione.',
 r'p_{\rm atm}+\rho gh_1=p_{\rm atm}+\rho gh_2\qquad h_1=h_2',
 'Un dislivello mantenuto soltanto dalle aree produrrebbe pressioni diverse alla base e avvierebbe un moto. Il peso totale non è la sola forza sul fondo: contano anche le pareti. Il rapporto dei volumi non sostituisce la legge idrostatica. Qui la capillarità, che potrebbe creare dislivelli in tubi sottili, è esclusa.',
 'Confronta la pressione alla stessa quota del liquido connesso.'),
('Pressione atmosferica dal mercurio','Un barometro contiene mercurio con densità 13600 kg/m³. La colonna è alta 0,740 m; la pressione sopra è trascurabile. Con g=9,81 m/s², stima la pressione atmosferica in kPa.',['Circa 98,7 kPa','Circa 9,87 kPa','Circa 987 kPa','Circa 100,6 kPa','Circa 0,740 kPa'],
 'L’equilibrio della colonna dà p_atm=ρgh perché in cima si trascura la pressione. Per un conto manuale: 13600·0,740=10064; poi 10064·9,81=10064·(10−0,19)=100640−1912,16=98727,84 Pa. Divido per mille: 98,72784 kPa, circa 98,7 kPa. L’arrotondamento riguarda la stima finale, non un cambio di modello.',
 r'p_{\rm atm}=\rho gh\qquad p_{\rm atm}=98727{,}84\,\mathrm{Pa}\qquad p_{\rm atm}=98{,}72784\,\mathrm{kPa}\qquad p_{\rm atm}\simeq98{,}7\,\mathrm{kPa}',
 '9,87 e 987 kPa introducono rispettivamente un fattore un decimo o dieci. 100,6 kPa sostituisce g=10 al valore 9,81 prescritto e non è la stima richiesta con questi dati. 0,740 copia la lettura di altezza senza convertirla in pressione. Se la pressione superiore non fosse trascurabile andrebbe sommata.',
 'Puoi moltiplicare per 9,81 come per 10 meno per 0,19; converti in kPa solo alla fine.'),
('Risalire nel liquido','Da un punto a pressione nota si risale verticalmente di h>0 nello stesso liquido omogeneo in quiete. La densità è ρ e g è costante. Qual è la variazione finale meno iniziale della pressione?',['−ρgh','+ρgh','Zero per qualunque h','−ρg/h','+ρgh²'],
 'Scelgo la coordinata z verso l’alto. In un liquido omogeneo fermo la pressione diminuisce con la quota: dp/dz=−ρg. Risalendo di h la variazione è −ρgh. Il modulo della diminuzione è positivo, ρgh, ma la variazione finale meno iniziale è negativa.',
 r'\Delta z=h\qquad \Delta p=-\rho g\Delta z\qquad \Delta p=-\rho gh',
 '+ρgh descrive una discesa o inverte l’ordine delle pressioni. Zero è possibile per h=0, escluso dalla domanda. ρg/h e ρgh² non hanno dimensioni di pressione. Il percorso eventualmente inclinato non cambia il risultato se il dislivello verticale resta h.',
 'Fissa il verso positivo della quota prima di attribuire il segno alla variazione.'),
('La spinta su uno sportello verticale','Uno sportello verticale rettangolare è largo 0,40 m e alto 0,20 m. Su un lato l’acqua arriva al bordo superiore; sull’altro agisce la stessa atmosfera presente sulla superficie libera. Usa ρ=1000 kg/m³ e g=10 m/s². Qual è il modulo della forza netta?',80,
 'L’atmosfera comune si cancella. La sovrapressione dell’acqua cresce da zero al bordo alto a ρgH=2000 Pa al bordo basso. Essendo lineare, il suo valore medio è metà: 1000 Pa. L’area dello sportello è 0,40·0,20=0,08 m²; la forza netta vale 1000·0,08=80 N. Usare la pressione al fondo su tutta l’area darebbe il doppio.',
 r'H=\frac15\,\mathrm m\qquad \Delta p_{\rm fondo}=2000\,\mathrm{Pa}\qquad \Delta p_{\rm media}=1000\,\mathrm{Pa}\qquad F=\frac12\rho g bH^2\qquad F=80\,\mathrm N',
 '160 N tratta la pressione massima come uniforme su tutto lo sportello. Zero considera soltanto il bordo superiore. 800 N introduce un fattore dieci nel prodotto dell’area. 2000 N copia il valore numerico della pressione al fondo in pascal senza moltiplicarlo per una superficie.',
 'Rappresenta la sovrapressione con un triangolo e usa il suo valore medio.'),
('L’altezza nel tubo inclinato','In un manometro inclinato il liquido occupa un tratto obliquo fra due livelli. Quale distanza entra nel termine ρgh della differenza idrostatica di pressione?',['Il dislivello verticale fra i livelli','L’intera lunghezza obliqua, per ogni inclinazione','La proiezione orizzontale del tratto','Il diametro interno del tubo','La somma fra lunghezza obliqua e diametro'],
 'La gravità seleziona la direzione verticale: nella legge idrostatica h è la differenza di quota. Se un tratto lungo s forma angolo θ con l’orizzontale, il dislivello è s sinθ. La lunghezza obliqua coincide con h soltanto quando il tubo è verticale. Il diametro può influire su altri fenomeni, ma non sostituisce il dislivello in ρgh.',
 r'h=s\sin\theta\qquad |\Delta p|=\rho gh',
 'La lunghezza completa sovrastima h per un tratto non verticale. La proiezione orizzontale non è la distanza lungo la gravità. Diametro e somma proposta descrivono grandezze geometriche diverse dai due livelli. Si assumono liquido fermo, densità uniforme e correzioni capillari trascurabili.',
 'Proietta lungo la verticale, non lungo il tubo.'),
('Mezzo metro a trenta gradi','Due livelli di un manometro sono separati da un tratto lungo 0,50 m lungo un tubo inclinato di 30° sull’orizzontale. Il liquido fermo ha densità 800 kg/m³; usa g=10 m/s² e sin30°=1/2. Trascurando gli altri contributi, qual è il modulo della differenza di pressione?',2000,
 'La lunghezza obliqua non è il dislivello. Proietto: h=0,50·1/2=0,25 m. Il modulo richiesto è ρgh=800·10·0,25=2000 Pa. Il segno dipenderebbe da quale livello si prende come iniziale; la domanda chiede soltanto il modulo.',
 r'h=\frac12\frac12\,\mathrm m\qquad h=\frac14\,\mathrm m\qquad |\Delta p|=\rho gh\qquad |\Delta p|=2000\,\mathrm{Pa}',
 '4000 Pa usa tutta la lunghezza del tubo. 1000 Pa applica due volte la proiezione di fattore un mezzo. 20 Pa trascura il fattore cento nel prodotto dei dati; 800 Pa copia la densità come se fosse già una pressione. Non occorre valutare un seno non notevole.',
 'Calcola prima h usando il seno esatto fornito, poi applica la legge idrostatica.'),
('Stessa profondità, gas diversi','Due recipienti separati contengono lo stesso liquido omogeneo con g uguale. I punti di fondo sono entrambi a profondità h sotto le rispettive superfici. Il gas sopra il primo ha pressione assoluta maggiore. Come si confrontano le pressioni assolute al fondo?',['La prima è maggiore della stessa differenza fra le pressioni dei gas','Sono uguali perché h è uguale','La prima è minore perché il gas comprime il liquido','Il rapporto è necessariamente uguale al rapporto delle pressioni dei gas','La pressione al fondo dipende soltanto dalla forma del recipiente'],
 'Scrivo p₁=p_g1+ρgh e p₂=p_g2+ρgh. I contributi idrostatici sono uguali; sottraendo rimane p₁−p₂=p_g1−p_g2>0. I recipienti sono separati: l’uguaglianza di profondità non impone la stessa pressione quando i valori sulle superfici sono diversi.',
 r'p_1=p_{g1}+\rho gh\qquad p_2=p_{g2}+\rho gh\qquad p_1-p_2=p_{g1}-p_{g2}>0',
 'La sola profondità determina l’incremento rispetto alla propria superficie, non il valore assoluto. Non compare un’inversione dell’effetto della pressione del gas. Aggiungere lo stesso termine alle due pressioni non conserva in generale il loro rapporto. La forma non entra in questa legge.',
 'Confronta due somme con lo stesso termine ρgh, usando una differenza.'),
('Densità dalla pendenza','In un liquido omogeneo fermo la pressione cresce di 4,5 kPa quando la profondità aumenta di 0,50 m. Usa g=10 m/s². Qual è la densità?',900,
 'La pendenza rispetto alla profondità è Δp/Δh=ρg. Converto 4,5 kPa in 4500 Pa e divido per gΔh=10·0,50=5 m²/s². Ottengo 4500/5=900 kg/m³. Una pressione superficiale costante cambia l’intercetta del grafico, non la pendenza.',
 r'\frac{\Delta p}{\Delta h}=\rho g\qquad \rho=\frac{\Delta p}{g\Delta h}\qquad \rho=\frac{4500}{5}\,\mathrm{kg/m^3}\qquad \rho=900\,\mathrm{kg/m^3}',
 '9000 omette la divisione per g; 450 omette quella per il dislivello di 0,50 m. 0,9 usa il numero della pressione in kPa come se fosse in Pa. 2250 moltiplica per l’altezza invece di dividerla e non ricostruisce 4,5 kPa.',
 'Dalla pendenza ρg ricava ρ dividendo ancora per g.'),
('Gas sopra il mercurio','In un barometro si mantiene la stessa pressione atmosferica e lo stesso mercurio. Sopra la colonna resta un gas a pressione p_g>0, minore di quella atmosferica. Rispetto al caso con pressione superiore trascurabile, che cosa accade all’altezza?',['Diminuisce, perché la colonna equilibra soltanto p_atm−p_g','Aumenta, perché si sommano p_atm e p_g','Resta identica qualunque sia p_g','Diventa necessariamente negativa','Raddoppia indipendentemente dal valore di p_g'],
 'L’equilibrio dà p_atm=p_g+ρgh. Isolando l’altezza ottengo h=(p_atm−p_g)/(ρg). Rispetto alla quota h₀=p_atm/(ρg), la presenza di gas la riduce di p_g/(ρg). Il dominio 0<p_g<p_atm mantiene una colonna di altezza positiva.',
 r'h=\frac{p_{\rm atm}-p_g}{\rho g}\qquad h_0=\frac{p_{\rm atm}}{\rho g}\qquad h_0-h=\frac{p_g}{\rho g}>0',
 'Sommare le pressioni attribuirebbe al gas superiore una spinta concorde a quella atmosferica inferiore, mentre ne compensa una parte. L’altezza non resta identica e non raddoppia senza un rapporto assegnato. Non è negativa nel dominio fisico esplicito.',
 'Il gas superiore sostiene già una parte della pressione atmosferica: quale differenza resta alla colonna?')]
CHOICES={n:0 for n in [1,2,3,4,6,8,10]}
UNITS={5:'N',7:'Pa',9:'kg/m³'}
FIGURES={5:'Lo sportello è alto 0,20 m e largo 0,40 m. La sovrapressione cresce linearmente da 0 a 2000 Pa; la media di 1000 Pa sull’area di 0,08 m² dà 80 N. Il disegno del profilo non localizza la risultante al punto medio.',7:'Il tratto di tubo misura 0,50 m e forma 30° con l’orizzontale. La proiezione verticale è 0,25 m, da cui il modulo 2000 Pa. Il triangolo non rappresenta una traiettoria del liquido.',9:'La pressione aumenta di 4,5 kPa lungo un incremento di profondità di 0,50 m. Il grafico usa Δp rispetto al primo punto: la pendenza è 9 kPa/m e la densità è 900 kg/m³.'}
def assemble(repo,source_ref):
 cats={1:'unità',2:'concetto',3:'unità',4:'modello',5:'modello',6:'concetto',7:'modello',8:'concetto',9:'algebra',10:'concetto'}
 ov={n:{'error':{'category':cats[n],'message':t[5],'target':'C2-L002'},'coverage':[t[0]]}for n,t in enumerate(TASKS,1)}
 return assemble_family(repo,source_ref,'cric-c2-l002',TASKS,CHOICES,UNITS,'cric-c2-l002-progressive.svg',FIGURES,0,source_path=SOURCE_PATH,source_origin='cric',source_ids=SOURCE_IDS,course='C2',skill='C2-L002',section='Fluidi in quiete',coverage=['Dieci problemi distinti di idrostatica'],overrides=ov)
if __name__=='__main__':write_family(assemble,'cric-c2-l002')
