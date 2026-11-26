# cric-c3-l04

Dieci problemi Cric distinti; nessuna espansione in varianti. Fonte immutabile `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C3.json`. ID, famiglia, difficoltà e metadati protetti originali conservati; versione nuova = originale + 1, baseVersion originale.

Competenza e prerequisiti riletti nella lezione reale del medesimo pin. Assembler canonico unico, dipendenza esterna congelata 23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5; nessun secondo ETL.

Doppia assembly byte-identica e importatore canonico su SQLite temporaneo: 10 salvati, ripetizione 0/10, dieci live originali e 991 pubblicati/storico invariati. Immagine SVG-only completa letta dopo processo reale exit 0; non è un collaudo del prodotto. Review scientifica propria, approvazione umana e UI prodotto NOT_RUN; pubblicazione NONE.

## C3-Q031

Compito: Un liquido già alla temperatura di ebollizione assorbe 45,2 kJ destinati soltanto alla vaporizzazione. Il calore latente specifico è 2,26 MJ/kg. Quanti grammi evaporano?

Procedimento: Porto il calore latente in kJ/kg: 2,26 MJ/kg=2260 kJ/kg. La massa trasformata è Q/L=45,2/2260 kg=0,020 kg, cioè 20 g. Non c’è un tratto di riscaldamento preliminare, perché il liquido è già alla temperatura di ebollizione.

Passaggi esatti: `L=2260\,\mathrm{kJ/kg}\qquad m=Q/L\qquad m=0{,}020\,\mathrm{kg}\qquad m=20\,\mathrm g`.

Distrattori: 0,020 g cambia l’unità senza convertire i chilogrammi. 20000 g perde la conversione da MJ a kJ. Moltiplicare Q per L non isola una massa e produce unità diverse da kg.

Aiuto: Usa la stessa unità energetica per Q e L, poi converti kg in g.

Famiglia: `massa-evaporata-dal-bilancio-energetico`; difficoltà 1; versione 2/base 1.

## C3-Q032

Compito: A pressione costante un campione puro assorbe energia e resta alla sua temperatura di fusione mentre coesistono solido e liquido. Che cosa aumenta durante questo tratto?

Procedimento: Nel tratto di fusione l’energia trasforma una parte del solido in liquido. La temperatura resta al valore di coesistenza, mentre aumenta la massa già fusa e diminuisce quella solida. Si considera un campione chiuso, quindi la massa totale non cresce.

Passaggi esatti: `Q_{\rm fusione}=m_{\rm fusa}L_f\qquad m_{\rm liquida}\uparrow`.

Distrattori: L’aumento di temperatura caratterizza i tratti fuori dal plateau. La massa totale non è il conteggio della sola fase liquida. La frazione solida diminuisce, non aumenta. Il plateau non impone che la potenza del riscaldatore cambi.

Aiuto: Distingui la temperatura dalla proporzione fra le due fasi.

Famiglia: `la-struttura-del-plateau`; difficoltà 1; versione 2/base 1.

## C3-Q033

Compito: Il vapore d’acqua forma goccioline liquide su un vetro freddo. Come si chiama il passaggio dal vapore al liquido?

Procedimento: La condensazione è il passaggio dalla fase aeriforme a quella liquida. Le goccioline sul vetro sono acqua liquida proveniente dal vapore. Durante il processo il vapore cede energia all’ambiente; non basta osservare gocce per concludere che sia avvenuta una solidificazione.

Passaggi esatti: `\text{vapore}\longrightarrow\text{liquido}`.

Distrattori: La fusione parte dal solido, la solidificazione termina nel solido e la vaporizzazione procede nel verso opposto. La sublimazione collega direttamente solido e vapore.

Aiuto: Nomina prima la fase iniziale e poi quella finale.

Famiglia: `gocce-sul-vetro-freddo`; difficoltà 1; versione 2/base 1.

## C3-Q034

Compito: Un riscaldatore trasmette al ghiaccio una potenza netta costante di 80 W. Quanto tempo serve a fondere interamente 40 g già a 0 °C alla pressione atmosferica, con L_f=334 kJ/kg? Si trascurano altri scambi.

Procedimento: Converto 40 g in 0,040 kg e 334 kJ/kg in 334000 J/kg. L’energia richiesta è 0,040·334000=13360 J. Una potenza di 80 J/s richiede 13360/80=167 s. Il ghiaccio è già al punto di fusione: non aggiungo un termine mcΔT.

Passaggi esatti: `Q=mL_f\qquad Q=13360\,\mathrm J\qquad t=Q/P\qquad t=167\,\mathrm s`.

Distrattori: 13,36 copia il valore numerico dell’energia richiesta espressa in kJ, senza costruire il rapporto energia/potenza necessario per il tempo. Dimenticare la conversione da grammi darebbe una durata mille volte maggiore. Riscaldare l’acqua dopo la fusione sarebbe un processo ulteriore non richiesto.

Aiuto: Trova prima l’energia latente e dividila per la potenza effettiva.

Famiglia: `cronometrare-una-fusione`; difficoltà 2; versione 2/base 1.

## C3-Q035

Compito: Una goccia d’acqua esposta all’aria su una piastra a 22 °C diminuisce di volume. Quale meccanismo è compatibile con questa osservazione, senza richiedere ebollizione?

Procedimento: Molecole possono lasciare la superficie liquida anche sotto la temperatura di ebollizione. Se l’aria consente una perdita netta di vapore, la goccia diminuisce di volume per evaporazione. La temperatura di 22 °C non obbliga a postulare bolle nell’intero liquido.

Passaggi esatti: `\text{liquido superficiale}\longrightarrow\text{vapore}`.

Distrattori: L’ebollizione non è necessaria per l’evaporazione superficiale. La condensazione tenderebbe ad aggiungere liquido, non a spiegare da sola la perdita. La semplice diminuzione di volume non dimostra che l’acqua sia diventata ghiaccio.

Aiuto: Ricorda che la superficie può perdere molecole anche senza bolle.

Famiglia: `evaporare-lontano-dallebollizione`; difficoltà 1; versione 2/base 1.

## C3-Q036

Compito: In un campione puro a pressione fissata la fusione di 30 g dura 150 s sotto una potenza termica netta costante di 60 W. La temperatura resta al valore di fusione. Trova il calore latente specifico in kJ/kg.

Procedimento: L’energia del plateau è PΔt=60·150=9000 J. La massa effettivamente fusa è 0,030 kg. Dividendo ottengo L=9000/0,030=300000 J/kg, cioè 300 kJ/kg. La durata del plateau riguarda la trasformazione di tutta la massa assegnata.

Passaggi esatti: `Q=9000\,\mathrm J\qquad L=\frac{Q}{m}\qquad L=300000\,\mathrm{J/kg}\qquad L=300\,\mathrm{kJ/kg}`.

Distrattori: 9000 J è il calore totale, non quello per chilogrammo. Dividere per 30 senza convertire i grammi dà 300 J/g, che equivale proprio a 300 kJ/kg: non si deve poi cambiare l’unità senza controllarne il fattore.

Aiuto: L’area potenza-tempo dà l’energia; dividila per la massa trasformata.

Famiglia: `ricavare-l-dalla-durata-del-plateau`; difficoltà 2; versione 2/base 1.

## C3-Q037

Compito: Un materiale a pressione fissa cede calore latente e passa da liquido a solido restando alla temperatura di coesistenza. Come si chiama il fenomeno?

Procedimento: La solidificazione trasforma il liquido in solido. Nel modello di equilibrio a pressione fissata la temperatura resta al valore di coesistenza mentre cambia la frazione solida. Il calore esce dal materiale: con il calore entrante positivo il suo Q di fase è negativo.

Passaggi esatti: `Q_{\rm materiale}=-m_{\rm trasformata}L_f`.

Distrattori: La fusione è il processo inverso e richiede energia entrante. La condensazione parte dal vapore e termina nel liquido; evaporazione e sublimazione terminano nel vapore.

Aiuto: Distingui il verso del passaggio di fase e quello del calore.

Famiglia: `dal-liquido-al-solido`; difficoltà 1; versione 2/base 1.

## C3-Q038

Compito: Un campione chiuso contiene inizialmente 120 g di solido al punto di fusione, a pressione fissata. Si fornisce energia finché restano 45 g di solido. Quale percentuale della massa iniziale è diventata liquida?

Procedimento: La massa trasformata è la differenza fra quella inizialmente solida e il residuo: 120−45=75 g. La frazione fusa è 75/120=5/8. Moltiplicando per 100 si ottiene 62,5%. I 45 g rimasti costituiscono invece il 37,5%.

Passaggi esatti: `m_{\rm fusa}=75\,\mathrm g\qquad f=\frac{75}{120}=\frac58\qquad f=62{,}5\%`.

Distrattori: 37,5% è la parte ancora solida. 75 copia il valore numerico della massa fusa in grammi, non la percentuale. 100% ignora il residuo di 45 g. La frazione 5/8 va moltiplicata per 100 per esprimerne la percentuale: scrivere 5/8% perderebbe questo fattore.

Aiuto: Sottrai il residuo prima di formare la percentuale rispetto alla massa iniziale.

Famiglia: `frazione-fusa-dal-residuo`; difficoltà 1; versione 2/base 1.

## C3-Q039

Compito: Masse uguali di vapore saturo a 100 °C e di acqua liquida a 100 °C terminano entrambe come acqua a 40 °C, alla pressione atmosferica. Quale contributo aggiuntivo viene ceduto dal vapore?

Procedimento: Il vapore deve prima condensare alla pressione assegnata, cedendo il calore latente mL_v. Poi l’acqua ottenuta si raffredda da 100 a 40 °C. Quest’ultimo tratto è comune alla massa che era già liquida; la condensazione è il contributo aggiuntivo. Chiamo E_c il modulo del calore di condensazione ed E_r quello del successivo raffreddamento del liquido.

Passaggi esatti: `E_c=mL_v\qquad E_r=mc_l(100-40)\,\mathrm K\qquad |Q_{\rm vapore}|=E_c+E_r\qquad |Q_{\rm liquido}|=E_r`.

Distrattori: La stessa temperatura iniziale non rende uguali le energie delle due fasi. Non è presente ghiaccio, quindi non compare una fusione. Il quesito non impone un getto con energia cinetica macroscopica.

Aiuto: Suddividi il percorso del vapore in condensazione e raffreddamento del liquido.

Famiglia: `perche-il-vapore-cede-piu-energia`; difficoltà 2; versione 2/base 1.

## C3-Q040

Compito: Alla pressione atmosferica, in isolamento si aggiungono 10 g di ghiaccio a 0 °C a 100 g d’acqua a 20 °C. Usa L_f=334 J/g e c_l=4,18 J/(g·K), recipiente trascurabile e nessun lavoro apprezzabile. Quale temperatura finale esatta in °C si ottiene?

Procedimento: Raffreddando l’acqua fino a 0 °C si libererebbero 100·4,18·20=8360 J, più dei 3340 J necessari a fondere tutto il ghiaccio. Restano 5020 J che scaldano 110 g di acqua liquida. La capacità finale è 110·4,18=459,8 J/K. Il quoziente 5020/459,8=25100/2299 dà la lettura finale sopra 0 °C, senza ricorrere a una divisione approssimata.

Passaggi esatti: `E_{\rm disponibile}=8360\,\mathrm J\qquad E_{\rm fusione}=3340\,\mathrm J\qquad E_{\rm residua}=5020\,\mathrm J\qquad C_f=459{,}8\,\mathrm{J/K}\qquad t_f=\frac{25100}{2299}\,{}^\circ\mathrm C`.

Distrattori: 0 °C sarebbe possibile se restasse ghiaccio, ma il controllo energetico lo esclude. 20 °C ignorerebbe l’energia ceduta dall’acqua. Raddoppiare il quoziente non rispetta il bilancio. Il valore negativo è incompatibile con acqua liquida finale nel ramo fisico verificato.

Aiuto: Confronta prima il calore cedibile fino a 0 °C con quello necessario alla fusione completa.

Famiglia: `bilancio-di-una-miscela-con-ghiaccio`; difficoltà 3; versione 2/base 1.
