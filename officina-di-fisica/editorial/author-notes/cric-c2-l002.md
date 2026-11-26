# cric-c2-l002

Dieci problemi Cric distinti; nessuna espansione in varianti. Fonte immutabile `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C2.json`. ID, famiglia, difficoltà e metadati protetti originali conservati; versione nuova = originale + 1, baseVersion originale.

Competenza e prerequisiti riletti nella lezione reale del medesimo pin. Assembler canonico unico, dipendenza esterna congelata 23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5; nessun secondo ETL.

Doppia assembly byte-identica e importatore canonico su SQLite temporaneo: 10 salvati, ripetizione 0/10, dieci live originali e 991 pubblicati/storico invariati. Immagine SVG-only completa letta dopo processo reale exit 0; non è un collaudo del prodotto. Review scientifica propria, approvazione umana e UI prodotto NOT_RUN; pubblicazione NONE.

## C2-Q011

Compito: In acqua omogenea ferma con densità 1000 kg/m³, a quale profondità la pressione supera quella della superficie di 4,0 kPa? Usa g=10 m/s².

Procedimento: L’incremento di pressione dipende dal dislivello verticale: Δp=ρgh. Converto 4,0 kPa in 4000 Pa e isolo h. Il prodotto ρg vale 10000 Pa/m: 4000/10000=4/10=0,40 m. La pressione atmosferica non va aggiunta perché il dato è già una differenza rispetto alla superficie.

Passaggi esatti: `\Delta p=\rho gh\qquad h=\frac{\Delta p}{\rho g}\qquad h=\frac{4000}{1000\cdot10}\,\mathrm m\qquad h=\frac25\,\mathrm m`.

Distrattori: 4,0 m e 0,04 m spostano di un fattore dieci la profondità. 40 m darebbe 400 kPa, non 4 kPa; 400 m ne darebbe 4000. Usare 4 come se fossero pascal produrrebbe 0,0004 m, un’altra confusione fra Pa e kPa.

Aiuto: Isola h usando soltanto la differenza di pressione e porta prima i kPa in Pa.

Famiglia: `un-livello-sotto-la-superficie`; difficoltà 2; versione 3/base 2.

## C2-Q012

Compito: Due recipienti aperti alla stessa atmosfera, uno largo e uno stretto, sono collegati alla base. Contengono lo stesso liquido fermo e omogeneo; trascura la capillarità. Come si dispongono le superfici libere?

Procedimento: Scelgo un punto del liquido connesso alla base. All’equilibrio la pressione a quella quota deve essere la stessa nei due rami. Su entrambe le superfici agisce la stessa atmosfera, quindi ρgh₁=ρgh₂. Poiché ρ e g sono positivi, h₁=h₂: le superfici hanno quota uguale. La larghezza cambia il volume contenuto, non questa condizione.

Passaggi esatti: `p_{\rm atm}+\rho gh_1=p_{\rm atm}+\rho gh_2\qquad h_1=h_2`.

Distrattori: Un dislivello mantenuto soltanto dalle aree produrrebbe pressioni diverse alla base e avvierebbe un moto. Il peso totale non è la sola forza sul fondo: contano anche le pareti. Il rapporto dei volumi non sostituisce la legge idrostatica. Qui la capillarità, che potrebbe creare dislivelli in tubi sottili, è esclusa.

Aiuto: Confronta la pressione alla stessa quota del liquido connesso.

Famiglia: `due-recipienti-comunicanti`; difficoltà 2; versione 2/base 1.

## C2-Q013

Compito: Un barometro contiene mercurio con densità 13600 kg/m³. La colonna è alta 0,740 m; la pressione sopra è trascurabile. Con g=9,81 m/s², stima la pressione atmosferica in kPa.

Procedimento: L’equilibrio della colonna dà p_atm=ρgh perché in cima si trascura la pressione. Per un conto manuale: 13600·0,740=10064; poi 10064·9,81=10064·(10−0,19)=100640−1912,16=98727,84 Pa. Divido per mille: 98,72784 kPa, circa 98,7 kPa. L’arrotondamento riguarda la stima finale, non un cambio di modello.

Passaggi esatti: `p_{\rm atm}=\rho gh\qquad p_{\rm atm}=98727{,}84\,\mathrm{Pa}\qquad p_{\rm atm}=98{,}72784\,\mathrm{kPa}\qquad p_{\rm atm}\simeq98{,}7\,\mathrm{kPa}`.

Distrattori: 9,87 e 987 kPa introducono rispettivamente un fattore un decimo o dieci. 100,6 kPa sostituisce g=10 al valore 9,81 prescritto e non è la stima richiesta con questi dati. 0,740 copia la lettura di altezza senza convertirla in pressione. Se la pressione superiore non fosse trascurabile andrebbe sommata.

Aiuto: Puoi moltiplicare per 9,81 come per 10 meno per 0,19; converti in kPa solo alla fine.

Famiglia: `la-colonna-di-mercurio`; difficoltà 2; versione 2/base 1.

## C2-Q014

Compito: Da un punto a pressione nota si risale verticalmente di h>0 nello stesso liquido omogeneo in quiete. La densità è ρ e g è costante. Qual è la variazione finale meno iniziale della pressione?

Procedimento: Scelgo la coordinata z verso l’alto. In un liquido omogeneo fermo la pressione diminuisce con la quota: dp/dz=−ρg. Risalendo di h la variazione è −ρgh. Il modulo della diminuzione è positivo, ρgh, ma la variazione finale meno iniziale è negativa.

Passaggi esatti: `\Delta z=h\qquad \Delta p=-\rho g\Delta z\qquad \Delta p=-\rho gh`.

Distrattori: +ρgh descrive una discesa o inverte l’ordine delle pressioni. Zero è possibile per h=0, escluso dalla domanda. ρg/h e ρgh² non hanno dimensioni di pressione. Il percorso eventualmente inclinato non cambia il risultato se il dislivello verticale resta h.

Aiuto: Fissa il verso positivo della quota prima di attribuire il segno alla variazione.

Famiglia: `risalire-lungo-un-tubo`; difficoltà 2; versione 3/base 2.

## C2-Q015

Compito: Uno sportello verticale rettangolare è largo 0,40 m e alto 0,20 m. Su un lato l’acqua arriva al bordo superiore; sull’altro agisce la stessa atmosfera presente sulla superficie libera. Usa ρ=1000 kg/m³ e g=10 m/s². Qual è il modulo della forza netta?

Procedimento: L’atmosfera comune si cancella. La sovrapressione dell’acqua cresce da zero al bordo alto a ρgH=2000 Pa al bordo basso. Essendo lineare, il suo valore medio è metà: 1000 Pa. L’area dello sportello è 0,40·0,20=0,08 m²; la forza netta vale 1000·0,08=80 N. Usare la pressione al fondo su tutta l’area darebbe il doppio.

Passaggi esatti: `H=\frac15\,\mathrm m\qquad \Delta p_{\rm fondo}=2000\,\mathrm{Pa}\qquad \Delta p_{\rm media}=1000\,\mathrm{Pa}\qquad F=\frac12\rho g bH^2\qquad F=80\,\mathrm N`.

Distrattori: 160 N tratta la pressione massima come uniforme su tutto lo sportello. Zero considera soltanto il bordo superiore. 800 N introduce un fattore dieci nel prodotto dell’area. 2000 N copia il valore numerico della pressione al fondo in pascal senza moltiplicarlo per una superficie.

Aiuto: Rappresenta la sovrapressione con un triangolo e usa il suo valore medio.

Famiglia: `una-parete-verticale-rettangolare`; difficoltà 3; versione 3/base 2.

## C2-Q016

Compito: In un manometro inclinato il liquido occupa un tratto obliquo fra due livelli. Quale distanza entra nel termine ρgh della differenza idrostatica di pressione?

Procedimento: La gravità seleziona la direzione verticale: nella legge idrostatica h è la differenza di quota. Se un tratto lungo s forma angolo θ con l’orizzontale, il dislivello è s sinθ. La lunghezza obliqua coincide con h soltanto quando il tubo è verticale. Il diametro può influire su altri fenomeni, ma non sostituisce il dislivello in ρgh.

Passaggi esatti: `h=s\sin\theta\qquad |\Delta p|=\rho gh`.

Distrattori: La lunghezza completa sovrastima h per un tratto non verticale. La proiezione orizzontale non è la distanza lungo la gravità. Diametro e somma proposta descrivono grandezze geometriche diverse dai due livelli. Si assumono liquido fermo, densità uniforme e correzioni capillari trascurabili.

Aiuto: Proietta lungo la verticale, non lungo il tubo.

Famiglia: `lasse-da-misurare`; difficoltà 1; versione 2/base 1.

## C2-Q017

Compito: Due livelli di un manometro sono separati da un tratto lungo 0,50 m lungo un tubo inclinato di 30° sull’orizzontale. Il liquido fermo ha densità 800 kg/m³; usa g=10 m/s² e sin30°=1/2. Trascurando gli altri contributi, qual è il modulo della differenza di pressione?

Procedimento: La lunghezza obliqua non è il dislivello. Proietto: h=0,50·1/2=0,25 m. Il modulo richiesto è ρgh=800·10·0,25=2000 Pa. Il segno dipenderebbe da quale livello si prende come iniziale; la domanda chiede soltanto il modulo.

Passaggi esatti: `h=\frac12\frac12\,\mathrm m\qquad h=\frac14\,\mathrm m\qquad |\Delta p|=\rho gh\qquad |\Delta p|=2000\,\mathrm{Pa}`.

Distrattori: 4000 Pa usa tutta la lunghezza del tubo. 1000 Pa applica due volte la proiezione di fattore un mezzo. 20 Pa trascura il fattore cento nel prodotto dei dati; 800 Pa copia la densità come se fosse già una pressione. Non occorre valutare un seno non notevole.

Aiuto: Calcola prima h usando il seno esatto fornito, poi applica la legge idrostatica.

Famiglia: `un-manometro-inclinato`; difficoltà 2; versione 2/base 1.

## C2-Q018

Compito: Due recipienti separati contengono lo stesso liquido omogeneo con g uguale. I punti di fondo sono entrambi a profondità h sotto le rispettive superfici. Il gas sopra il primo ha pressione assoluta maggiore. Come si confrontano le pressioni assolute al fondo?

Procedimento: Scrivo p₁=p_g1+ρgh e p₂=p_g2+ρgh. I contributi idrostatici sono uguali; sottraendo rimane p₁−p₂=p_g1−p_g2>0. I recipienti sono separati: l’uguaglianza di profondità non impone la stessa pressione quando i valori sulle superfici sono diversi.

Passaggi esatti: `p_1=p_{g1}+\rho gh\qquad p_2=p_{g2}+\rho gh\qquad p_1-p_2=p_{g1}-p_{g2}>0`.

Distrattori: La sola profondità determina l’incremento rispetto alla propria superficie, non il valore assoluto. Non compare un’inversione dell’effetto della pressione del gas. Aggiungere lo stesso termine alle due pressioni non conserva in generale il loro rapporto. La forma non entra in questa legge.

Aiuto: Confronta due somme con lo stesso termine ρgh, usando una differenza.

Famiglia: `stesso-livello-gas-differenti`; difficoltà 2; versione 2/base 1.

## C2-Q019

Compito: In un liquido omogeneo fermo la pressione cresce di 4,5 kPa quando la profondità aumenta di 0,50 m. Usa g=10 m/s². Qual è la densità?

Procedimento: La pendenza rispetto alla profondità è Δp/Δh=ρg. Converto 4,5 kPa in 4500 Pa e divido per gΔh=10·0,50=5 m²/s². Ottengo 4500/5=900 kg/m³. Una pressione superficiale costante cambia l’intercetta del grafico, non la pendenza.

Passaggi esatti: `\frac{\Delta p}{\Delta h}=\rho g\qquad \rho=\frac{\Delta p}{g\Delta h}\qquad \rho=\frac{4500}{5}\,\mathrm{kg/m^3}\qquad \rho=900\,\mathrm{kg/m^3}`.

Distrattori: 9000 omette la divisione per g; 450 omette quella per il dislivello di 0,50 m. 0,9 usa il numero della pressione in kPa come se fosse in Pa. 2250 kg/m³ darebbe un incremento di 11250 Pa, non 4500 Pa.

Aiuto: Dalla pendenza ρg ricava ρ dividendo ancora per g.

Famiglia: `riconoscere-il-liquido-dalla-pendenza`; difficoltà 2; versione 2/base 1.

## C2-Q020

Compito: In un barometro si mantiene la stessa pressione atmosferica e lo stesso mercurio. Sopra la colonna resta un gas a pressione p_g>0, minore di quella atmosferica. Rispetto al caso con pressione superiore trascurabile, che cosa accade all’altezza?

Procedimento: L’equilibrio dà p_atm=p_g+ρgh. Isolando l’altezza ottengo h=(p_atm−p_g)/(ρg). Rispetto alla quota h₀=p_atm/(ρg), la presenza di gas la riduce di p_g/(ρg). Il dominio 0<p_g<p_atm mantiene una colonna di altezza positiva.

Passaggi esatti: `h=\frac{p_{\rm atm}-p_g}{\rho g}\qquad h_0=\frac{p_{\rm atm}}{\rho g}\qquad h_0-h=\frac{p_g}{\rho g}>0`.

Distrattori: Sommare le pressioni attribuirebbe al gas superiore una spinta concorde a quella atmosferica inferiore, mentre ne compensa una parte. L’altezza non resta identica e non raddoppia senza un rapporto assegnato. Non è negativa nel dominio fisico esplicito.

Aiuto: Il gas superiore sostiene già una parte della pressione atmosferica: quale differenza resta alla colonna?

Famiglia: `il-quasi-vuoto-nel-barometro`; difficoltà 3; versione 2/base 1.
