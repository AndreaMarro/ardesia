# cric-c3-l01

Dieci problemi Cric distinti; nessuna espansione in varianti. Fonte immutabile `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C3.json`. ID, famiglia, difficoltà e metadati protetti originali conservati; versione nuova = originale + 1, baseVersion originale.

Competenza e prerequisiti riletti nella lezione reale del medesimo pin. Assembler canonico unico, dipendenza esterna congelata 23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5; nessun secondo ETL.

Doppia assembly byte-identica e importatore canonico su SQLite temporaneo: 10 salvati, ripetizione 0/10, dieci live originali e 991 pubblicati/storico invariati. Immagine SVG-only completa letta dopo processo reale exit 0; non è un collaudo del prodotto. Review scientifica propria, approvazione umana e UI prodotto NOT_RUN; pubblicazione NONE.

## C3-Q001

Compito: Una pentola scoperta bolle e perde vapore. Il sistema scelto è l’acqua liquida rimasta nella pentola, non l’intera cucina. Come si classifica durante l’ebollizione?

Procedimento: Il confine separa il liquido rimasto dal resto. Durante l’ebollizione molecole inizialmente nel liquido attraversano quel confine diventando vapore. Il sistema può quindi perdere materia ed è aperto. Può anche ricevere energia dal fornello: la sola classificazione aperto non ne fissa il bilancio energetico.

Passaggi esatti: `m_{\rm uscita}>0`.

Distrattori: Un sistema chiuso non scambia materia; uno isolato non scambia né materia né energia. Adiabatico riguarda soltanto il calore e non segue dall’ebollizione. Il confine esiste anche quando è una superficie scelta idealmente.

Aiuto: Segui le molecole che diventano vapore rispetto al sistema scelto.

Famiglia: `il-confine-della-pentola`; difficoltà 1; versione 2/base 1.

## C3-Q002

Compito: Un sensore passa da 311 K a 20,0 °C. Usa la conversione esatta T=t+273,15 tra i valori numerici nelle due scale. Calcola la variazione finale meno iniziale in kelvin.

Procedimento: Converto soltanto la lettura finale: 20,0 °C corrispondono a 293,15 K. La variazione è finale meno iniziale, quindi 293,15−311=−17,85 K. Il segno negativo descrive il raffreddamento. Si può anche convertire 311 K in 37,85 °C e sottrarre: l’intervallo numerico è lo stesso.

Passaggi esatti: `T_f=293{,}15\,\mathrm K\qquad \Delta T=T_f-T_i\qquad \Delta T=-17{,}85\,\mathrm K`.

Distrattori: 17,85 K sarebbe il modulo del calo, non la variazione con segno richiesta. Sottrarre direttamente 20−311 mescola due origini diverse. Il numero 273,15 serve alla conversione delle letture; non si aggiunge una seconda volta a una differenza già espressa in kelvin.

Aiuto: Porta entrambe le letture sulla stessa scala prima di fare finale meno iniziale.

Famiglia: `cronologia-di-un-raffreddamento`; difficoltà 2; versione 2/base 1.

## C3-Q003

Compito: La temperatura all’equilibrio ha lo stesso valore quando il sistema torna nello stesso stato, indipendentemente dal percorso seguito. Completa l’espressione «funzione di …».

Procedimento: Una funzione di stato dipende dallo stato, non dalla storia del percorso. Tornando allo stesso stato si ritrova lo stesso valore della temperatura. Questo non rende il calore e il lavoro funzioni di stato: essi descrivono trasferimenti lungo un processo.

Passaggi esatti: `T_f=T_i\quad\text{se lo stato finale coincide con quello iniziale}`.

Distrattori: Cammino indica proprio la dipendenza che qui è esclusa. Calore e lavoro non sono le parole che completano questa definizione. Il tempo trascorso può essere diverso per due percorsi che raggiungono lo stesso stato.

Aiuto: La parola cercata riguarda le condizioni raggiunte, non la strada seguita.

Famiglia: `lettura-senza-memoria`; difficoltà 1; versione 2/base 1.

## C3-Q004

Compito: Due blocchi inizialmente alla stessa temperatura sono messi in contatto e isolati da tutto il resto. Non reagiscono, non cambiano fase e non compiono lavoro. Quale affermazione è giustificata?

Procedimento: Il contatto termico non produce un flusso netto guidato da una differenza di temperatura, perché quella differenza è nulla. Restano possibili scambi microscopici in entrambi i versi che si compensano in media. La stessa temperatura non impone la stessa energia interna: contano anche materiale e quantità di materia.

Passaggi esatti: `T_A=T_B\qquad Q_{A\to B,\,\rm netto}=0`.

Distrattori: Uguagliare le energie interne richiederebbe dati ulteriori. Né la massa maggiore né il semplice contatto raddoppiano la temperatura. L’equilibrio termico non significa immobilità delle molecole.

Aiuto: Distingui uguaglianza di temperatura da uguaglianza dell’energia interna.

Famiglia: `due-termometri-e-zero-scambio-netto`; difficoltà 1; versione 2/base 1.

## C3-Q005

Compito: Un campione parte da 26,85 °C. A quanti °C corrisponde il doppio della sua temperatura assoluta? Usa T=t+273,15 per le letture numeriche.

Procedimento: La lettura iniziale corrisponde a 300 K. Raddoppiare la temperatura assoluta porta a 600 K. Torno infine alla scala Celsius sottraendo 273,15: 600−273,15=326,85 °C. Il rapporto due è applicato ai kelvin, non alla lettura rispetto allo zero Celsius.

Passaggi esatti: `T_i=300\,\mathrm K\qquad T_f=2T_i=600\,\mathrm K\qquad t_f=326{,}85\,{}^\circ\mathrm C`.

Distrattori: 53,70 °C raddoppia la lettura Celsius e non la temperatura assoluta. 600 °C cambia soltanto il simbolo dell’unità. 300 K è lo stato iniziale, non quello raddoppiato. Lo spostamento di origine della scala va fatto prima e dopo il rapporto.

Aiuto: Converti in kelvin, raddoppia, poi torna ai gradi Celsius.

Famiglia: `raddoppiare-la-temperatura-assoluta`; difficoltà 2; versione 2/base 1.

## C3-Q006

Compito: Quale variabile, espressa in pascal, descrive la forza normale media per unità di area esercitata da un gas sulle pareti?

Procedimento: La pressione media è il rapporto fra il modulo della forza normale complessiva e l’area della parete considerata. Un pascal equivale a un newton per metro quadrato. Nel gas all’equilibrio macroscopico questa grandezza descrive l’effetto medio degli urti sulle pareti.

Passaggi esatti: `p=F_\perp/A\qquad 1\,\mathrm{Pa}=1\,\mathrm{N/m^2}`.

Distrattori: Temperatura, volume e quantità di sostanza hanno unità diverse. Una forza tangenziale per unità di area descriverebbe uno sforzo di taglio, non la pressione. La forza sola non è ancora divisa per l’area.

Aiuto: Riconosci la grandezza con unità N/m².

Famiglia: `dal-micro-al-macro`; difficoltà 1; versione 2/base 1.

## C3-Q007

Compito: Un gas uniforme all’equilibrio viene diviso idealmente in due metà di uguale volume, senza cambiare lo stato intensivo locale. Quale proprietà di ciascuna metà si dimezza?

Procedimento: La massa è estensiva: conta quanta materia si trova nel campione. Ciascuna metà contiene metà della massa iniziale. Pressione, temperatura e densità restano quelle del gas uniforme originale. Anche il calore specifico è una proprietà per unità di massa, nelle stesse condizioni.

Passaggi esatti: `m_{1/2}=m/2\qquad V_{1/2}=V/2\qquad \rho_{1/2}=\frac{m/2}{V/2}=\rho`.

Distrattori: Dimezzare pressione o temperatura cambierebbe lo stato intensivo, escluso dalla preparazione. La densità non si dimezza perché diminuiscono insieme massa e volume. La capacità termica totale si dimezzerebbe, ma il calore specifico dell’opzione resta invariato.

Aiuto: Cerca una proprietà proporzionale alla quantità di materia.

Famiglia: `separare-due-campioni-uguali`; difficoltà 2; versione 2/base 1.

## C3-Q008

Compito: Un bagno inizialmente a 35 °C si raffredda prima di 4 K e poi di altri 6 K. Qual è la temperatura finale in °C?

Procedimento: Gli intervalli Celsius e kelvin hanno uguale ampiezza. Un calo di 4 K riduce la lettura da 35 a 31 °C; il successivo calo di 6 K la porta a 25 °C. Il calo totale è 10 K, equivalente a 10 °C come intervallo, non come temperatura assoluta.

Passaggi esatti: `\Delta T=-(4+6)\,\mathrm K\qquad t_f=(35-10)\,{}^\circ\mathrm C\qquad t_f=25\,{}^\circ\mathrm C`.

Distrattori: 31 °C considera soltanto il primo calo. 29 °C considera soltanto il secondo. 45 °C somma un aumento invece di sottrarre il raffreddamento. Aggiungere 273,15 a ciascun intervallo sarebbe una conversione impropria di differenze.

Aiuto: Somma i due cali e sottrai il totale alla lettura iniziale.

Famiglia: `caduta-cumulativa-in-due-soste`; difficoltà 1; versione 2/base 1.

## C3-Q009

Compito: Un pistone viene spinto bruscamente e nel gas si propagano onde di pressione. Quale operazione permette di attribuire al campione una pressione macroscopica uniforme di equilibrio?

Procedimento: Durante le onde la pressione può dipendere dalla posizione e dal tempo: una lettura locale non descrive necessariamente l’intero gas. Occorre attendere lo smorzamento dei transitori e l’equilibrio meccanico; l’eventuale equilibrio termico va anch’esso specificato per descrivere lo stato con un’unica temperatura.

Passaggi esatti: `p(\mathbf r,t)\longrightarrow p_{\rm equilibrio}`.

Distrattori: Una misura immediata può essere soltanto locale. Rapidità e pressione costante non sono sinonimi. Sommare pressioni di punti diversi non produce la pressione uniforme dello stato. La velocità del pistone ha dimensioni e significato differenti.

Aiuto: Chiediti quando una lettura locale diventa rappresentativa del gas intero.

Famiglia: `stato-del-gas-dopo-lo-scossone`; difficoltà 2; versione 2/base 1.

## C3-Q010

Compito: Una parete impedisce lo scambio di calore attraverso di essa, ma può muoversi e trasmettere lavoro. Quale aggettivo termodinamico la qualifica?

Procedimento: Una parete adiabatica impedisce lo scambio di calore attraverso il confine. Questo vincolo non proibisce il movimento della parete e quindi non esclude il lavoro meccanico. L’isolamento energetico completo richiederebbe anche l’assenza di ogni altro trasferimento di energia.

Passaggi esatti: `Q_{\rm attraverso\ la\ parete}=0`.

Distrattori: Diatermica significa capace di scambiare calore. Rigida riguarda lo spostamento della parete, non il flusso termico. Adiabatica non significa temperatura costante e non definisce la permeabilità alla materia.

Aiuto: Separa il vincolo sul calore da quello sul lavoro e sulla materia.

Famiglia: `parete-che-isola-dal-calore`; difficoltà 1; versione 2/base 1.
