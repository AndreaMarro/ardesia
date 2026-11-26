# cric-c2-l003

Dieci problemi Cric distinti; nessuna espansione in varianti. Fonte immutabile `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C2.json`. ID, famiglia, difficoltà e metadati protetti originali conservati; versione nuova = originale + 1, baseVersion originale.

Competenza e prerequisiti riletti nella lezione reale del medesimo pin. Assembler canonico unico, dipendenza esterna congelata 23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5; nessun secondo ETL.

Doppia assembly byte-identica e importatore canonico su SQLite temporaneo: 10 salvati, ripetizione 0/10, dieci live originali e 991 pubblicati/storico invariati. Immagine SVG-only completa letta dopo processo reale exit 0; non è un collaudo del prodotto. Review scientifica propria, approvazione umana e UI prodotto NOT_RUN; pubblicazione NONE.

## C2-Q021

Compito: Un pistone aumenta di 7 kPa la pressione in un liquido confinato e fermo. Densità, geometria e quote rimangono invariate. Quale grandezza aumenta di 7 kPa anche in un punto più in basso?

Procedimento: Il principio di Pascal riguarda l’incremento di pressione. Scrivo al punto basso p_b=p_a+ρgh prima e dopo la manovra. Con densità e dislivello invariati il termine ρgh non cambia; sottraendo i due stati, l’incremento al punto basso è lo stesso 7 kPa. Le pressioni assolute a quote diverse non devono essere uguali.

Passaggi esatti: `p_b=p_a+\rho gh\qquad \Delta p_b=\Delta p_a\qquad \Delta p_b=7\,\mathrm{kPa}`.

Distrattori: Una forza dipende anche dall’area e non si misura in kPa. Peso e volume non aumentano di una pressione. La differenza idrostatica resta ρgh, costante nelle condizioni dichiarate; è la pressione di entrambi i punti ad aumentare di 7 kPa.

Aiuto: Confronta i due stati alla stessa coppia di quote e sottrai le equazioni idrostatiche.

Famiglia: `che-cosa-arriva-uguale`; difficoltà 2; versione 2/base 1.

## C2-Q022

Compito: Una pressa ideale ha pistoni circolari alla stessa quota e alla stessa pressione atmosferica. I diametri sono 2 cm e 6 cm. Applicando sul piccolo una forza aggiuntiva di 25 N, quale forza aggiuntiva può equilibrare sul grande?

Procedimento: Le forze aggiuntive si riferiscono alla sovrapressione comune, al netto dell’atmosfera. Il rapporto dei diametri è 6/2=3, ma quello delle aree è il suo quadrato, 9. La forza sul grande è quindi 25·9=225 N. Il modello suppone manovra lenta, pistoni senza attrito e liquido confinato.

Passaggi esatti: `A=\pi d^2/4\qquad \frac{A_2}{A_1}=\left(\frac62\right)^2=9\qquad F_2=F_1\frac{A_2}{A_1}\qquad F_2=225\,\mathrm N`.

Distrattori: 75 N usa il rapporto dei diametri invece di quello delle aree. 25 N confonde uguaglianza di pressione con uguaglianza di forza. 25/9 N usa il rapporto inverso e 675 N eleva il rapporto lineare al cubo. L’aumento di forza non implica un aumento simultaneo della corsa.

Aiuto: La pressione si distribuisce su aree: prima eleva al quadrato il rapporto dei diametri.

Famiglia: `i-diametri-dei-pistoni`; difficoltà 2; versione 2/base 1.

## C2-Q023

Compito: Una pressa ideale in equilibrio ha pistoni alla stessa quota, senza attrito e con la stessa atmosfera esterna. Sul grande, di area 90 cm², va sostenuto un carico aggiuntivo di 300 N. Il piccolo ha area 6 cm². Quale forza aggiuntiva va applicata al piccolo?

Procedimento: La sovrapressione necessaria sul grande è la stessa trasmessa dal piccolo. Isolo F₁=F₂A₁/A₂. Le aree hanno la stessa unità e il loro rapporto è 6/90=1/15. Dividendo 300 N per 15 ottengo 20 N. La forza minore agisce sul pistone minore, mentre per una corsa ideale occorrerebbe uno spostamento maggiore.

Passaggi esatti: `\frac{F_1}{A_1}=\frac{F_2}{A_2}\qquad F_1=F_2\frac{A_1}{A_2}\qquad F_1=300\frac6{90}\,\mathrm N\qquad F_1=20\,\mathrm N`.

Distrattori: 4500 N usa il rapporto inverso delle aree. 300 N ignora le loro dimensioni diverse. 50 N divide il carico per il solo numero 6 e 1800 N lo moltiplica: nessuno dei due mantiene la stessa sovrapressione sui pistoni.

Aiuto: Controlla che la forza sul pistone piccolo risulti minore di 300 N.

Famiglia: `ricavare-la-forza-di-comando`; difficoltà 2; versione 2/base 1.

## C2-Q024

Compito: Un circuito idraulico contiene una bolla d’aria che si comprime sensibilmente all’inizio della corsa. Il pistone 1 entra nel circuito di s₁>0 e il 2 esce di s₂≥0; le aree sono A₁ e A₂ e non ci sono perdite. Quale relazione, valida per il circuito tutto incomprimibile, non si può usare durante la compressione della bolla?

Procedimento: Con il circuito interamente incomprimibile il volume spinto dal primo pistone deve uscire dal secondo. Se la bolla si comprime, una parte del volume spinto serve invece a ridurne il volume. Definendo δV_b>0 come diminuzione del volume della bolla, il bilancio diventa A₁s₁=A₂s₂+δV_b. Non viene meno la conservazione della massa: viene meno la relazione senza accumulo volumetrico.

Passaggi esatti: `\delta V_b>0\qquad A_1s_1=A_2s_2+\delta V_b\qquad A_1s_1>A_2s_2`.

Distrattori: Una bolla comprimibile non distrugge materia. Pressione, massa e volume mantengono le loro definizioni, e il liquido continua ad avere pressione. Non è corretto attribuire automaticamente la differenza di volumi a una perdita all’esterno, che la domanda esclude.

Aiuto: Quale parte del volume spinto può essere assorbita dalla riduzione della bolla?

Famiglia: `una-bolla-intrappolata`; difficoltà 3; versione 2/base 1.

## C2-Q025

Compito: Un sollevatore ideale è pieno di liquido incomprimibile, senza bolle né perdite. Il rapporto delle aree è A₂/A₁=8. Il pistone piccolo può scendere al massimo di 0,24 m. Di quanti centimetri può salire il grande?

Procedimento: La conservazione del volume spostato dà A₁s₁=A₂s₂. Isolo la corsa grande: s₂=s₁/8. Il conto 0,24/8=0,03 m corrisponde a 3 cm. Si usano i moduli degli spostamenti, con il piccolo entrante e il grande uscente. Il modello geometrico non richiede di assumere uguali lavori finiti a quote diverse.

Passaggi esatti: `A_1s_1=A_2s_2\qquad s_2=s_1\frac{A_1}{A_2}\qquad s_2=\frac{0{,}24}{8}\,\mathrm m\qquad s_2=3\,\mathrm{cm}`.

Distrattori: 192 cm moltiplica per otto e farebbe uscire un volume 64 volte quello disponibile. 24 cm attribuisce la stessa corsa ad aree diverse. 0,03 cm omette la conversione da metri a centimetri. 0,3 cm introduce un ulteriore fattore dieci.

Aiuto: Il pistone otto volte più grande richiede otto volte il volume per la stessa corsa.

Famiglia: `un-limite-di-corsa`; difficoltà 2; versione 2/base 1.

## C2-Q026

Compito: Quale cognome identifica il principio secondo cui, in equilibrio e con geometria invariata, un incremento di pressione applicato a un fluido confinato si trasmette in tutto il fluido?

Procedimento: Il principio è quello di Pascal. Si riferisce a un incremento di pressione nel fluido confinato, non all’uguaglianza di tutte le pressioni assolute a quote diverse. In una coppia di punti con dislivello invariato, il contributo idrostatico resta uguale nei due stati e perciò i due incrementi coincidono.

Passaggi esatti: `\Delta p_1=\Delta p_2`.

Distrattori: Archimede riguarda la spinta sul volume spostato. Torricelli identifica fra l’altro il barometro e l’efflusso ideale; Bernoulli collega termini energetici nel moto del fluido. Hooke descrive la risposta elastica lineare, non questo principio idrostatico.

Aiuto: Pensa alla pressa idraulica e distingui pressione da forza.

Famiglia: `la-macchina-con-due-pistoni`; difficoltà 1; versione 2/base 1.

## C2-Q027

Compito: Un pistone di area 12 cm² avanza di 5 mm in una linea piena di liquido incomprimibile, senza perdite. Quale volume sposta in mL?

Procedimento: Il volume geometrico spostato è area per corsa. Converto 5 mm in 0,5 cm, così il prodotto è 12 cm²·0,5 cm=6 cm³. Poiché 1 cm³=1 mL, il pistone sposta 6 mL. Il dato di pressione non serve per questo calcolo geometrico.

Passaggi esatti: `s=0{,}5\,\mathrm{cm}\qquad \Delta V=As\qquad \Delta V=12\cdot0{,}5\,\mathrm{cm^3}\qquad \Delta V=6\,\mathrm{mL}`.

Distrattori: 60 mL usa 5 come se fossero centimetri. 0,6 mL converte troppo la corsa. 24 mL divide per la corsa invece di moltiplicarla. 12 mL copia il valore dell’area senza introdurre una lunghezza. Le unità cm²·cm devono diventare un volume.

Aiuto: Metti area e corsa in centimetri prima di moltiplicare.

Famiglia: `quanto-volume-percorre-la-linea`; difficoltà 2; versione 2/base 1.

## C2-Q028

Compito: In una pressa reale con attriti, durante una manovra lenta il lavoro fornito supera quello utile sul carico. Se l’energia meccanica immagazzinata non cambia, dove può andare la differenza?

Procedimento: Il bilancio energetico comprende macchina, fluido, carico e possibili scambi con l’ambiente. Gli attriti trasformano parte del lavoro fornito in energia interna, che può poi essere ceduta come calore. Con accumulo meccanico trascurabile, la differenza positiva W_in−W_utile è energia dissipata nel trasferimento meccanico. La conservazione dell’energia non richiede che tutto diventi lavoro utile.

Passaggi esatti: `E_{\rm diss}=W_{\rm in}-W_{\rm utile}\qquad E_{\rm diss}>0`.

Distrattori: L’energia non scompare e il limite del modello ideale non cancella il bilancio. Una perdita di massa non segue dall’esistenza di attriti. Il lavoro utile non può aumentare gratuitamente e le corse restano legate a geometria e bilancio volumetrico, non al nome della dissipazione.

Aiuto: Allarga il bilancio alle energie interne e allo scambio termico, non soltanto al sollevamento.

Famiglia: `un-impianto-reale-dissipa`; difficoltà 2; versione 2/base 1.

## C2-Q029

Compito: Una membrana di area 2 cm² separa un circuito dall’atmosfera. La pressione interna supera quella esterna uniformemente di 150 kPa. Qual è il modulo della forza netta sulla membrana?

Procedimento: Le pressioni comuni ai due lati si cancellano: conta la sovrapressione di 150 kPa. Converto l’area in 2·10⁻⁴ m² e la pressione in 150000 Pa. Il prodotto è 150000·2·10⁻⁴=30 N. La forza è diretta dal lato con pressione maggiore verso quello con pressione minore.

Passaggi esatti: `A=2\cdot10^{-4}\,\mathrm{m^2}\qquad \Delta p=150000\,\mathrm{Pa}\qquad F=\Delta p\,A\qquad F=30\,\mathrm N`.

Distrattori: 300000 N moltiplica la pressione in Pa per 2 senza convertire i cm². 0,03 N usa 150 come se fossero Pa. 75 non è una forza ottenuta dal prodotto e 150 N copia il valore numerico della sovrapressione in kPa. Non va aggiunta ancora l’atmosfera a una differenza già assegnata.

Aiuto: Usa la differenza delle pressioni e ricorda che il fattore di lunghezza va elevato al quadrato.

Famiglia: `verifica-della-pressione-ammissibile`; difficoltà 2; versione 3/base 2.

## C2-Q030

Compito: Due manometri ideali hanno lo stesso riferimento e sono collegati alla medesima quota dello stesso liquido connesso e fermo, sotto pistoni di aree diverse. Che cosa mostrano?

Procedimento: Alla stessa quota di un unico liquido connesso in equilibrio la pressione è uguale. Usando lo stesso riferimento anche le letture dei manometri coincidono. Le forze sui pistoni possono però essere diverse, perché una stessa sovrapressione moltiplica aree diverse. La quiete impone equilibrio, non pressione nulla.

Passaggi esatti: `p_1=p_2\qquad F_1=\Delta p A_1\qquad F_2=\Delta p A_2`.

Distrattori: I rapporti delle aree compaiono nelle forze a pressione assegnata, non in due pressioni alla stessa quota del medesimo fluido. Lo zero della lettura richiederebbe pressione uguale al riferimento, che non è dato. Pascal è unità di pressione e non misura direttamente una forza.

Aiuto: Separa l’uguaglianza idrostatica p₁=p₂ dalla relazione fra forza e area.

Famiglia: `due-manometri-alla-stessa-quota`; difficoltà 2; versione 2/base 1.
