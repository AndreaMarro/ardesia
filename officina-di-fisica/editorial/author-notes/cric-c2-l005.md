# cric-c2-l005

Dieci problemi Cric distinti; nessuna espansione in varianti. Fonte immutabile `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C2.json`. ID, famiglia, difficoltà e metadati protetti originali conservati; versione nuova = originale + 1, baseVersion originale.

Competenza e prerequisiti riletti nella lezione reale del medesimo pin. Assembler canonico unico, dipendenza esterna congelata 23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5; nessun secondo ETL.

Doppia assembly byte-identica e importatore canonico su SQLite temporaneo: 10 salvati, ripetizione 0/10, dieci live originali e 991 pubblicati/storico invariati. Immagine SVG-only completa letta dopo processo reale exit 0; non è un collaudo del prodotto. Review scientifica propria, approvazione umana e UI prodotto NOT_RUN; pubblicazione NONE.

## C2-Q041

Compito: In una vasca entrano 9 L/min e ne escono 5 L/min, entrambi costanti. La vasca non trabocca durante i 45 s osservati. Quanto volume si accumula?

Procedimento: L’accumulo è il volume entrante meno quello uscente. La portata netta è 9−5=4 L/min. Converto 45 s in 3/4 min: il volume accumulato è 4·3/4=3 L. La portata netta positiva indica che il livello cresce, se la vasca può contenere quel volume.

Passaggi esatti: `Q_{\rm netto}=(9-5)\,\mathrm{L/min}\qquad \Delta t=\frac34\,\mathrm{min}\qquad \Delta V=Q_{\rm netto}\Delta t\qquad \Delta V=3\,\mathrm L`.

Distrattori: 6,75 L conta soltanto l’ingresso. 3,75 L è il volume uscito, non l’accumulo. 10,5 L somma ingresso e uscita e 180 L usa 45 come minuti. Il bilancio ha bisogno del termine di accumulo: non è un nodo stazionario.

Aiuto: Sottrai prima le portate e usa lo stesso tempo in minuti.

Famiglia: `un-recipiente-si-riempie`; difficoltà 2; versione 2/base 1.

## C2-Q042

Compito: Un getto d’acqua continuo cade verticalmente nell’aria. Nel tratto considerato il moto è stazionario, l’acqua è incomprimibile e non si perde massa lateralmente. Perché la sezione del getto si restringe mentre la rapidità media aumenta?

Procedimento: In ogni sezione passa la stessa massa per unità di tempo. A densità costante è uguale anche la portata volumetrica Q=A v_media. Se la rapidità aumenta lungo la caduta, l’area deve diminuire per mantenere il prodotto. Stazionario significa che in ciascun punto il campo non cambia nel tempo; una particella può comunque accelerare passando fra punti diversi.

Passaggi esatti: `Q=A_1\bar v_1=A_2\bar v_2\qquad \bar v_2>\bar v_1\qquad A_2<A_1`.

Distrattori: Una diminuzione della portata richiederebbe accumulo o perdita, qui esclusi. La densità non si annulla e la gravità non elimina materia. La stazionarietà riguarda il tempo in un punto, non l’uniformità spaziale della velocità.

Aiuto: Segui il prodotto area per velocità media attraverso due sezioni.

Famiglia: `un-getto-che-si-assottiglia`; difficoltà 2; versione 2/base 1.

## C2-Q043

Compito: In un tubo circolare scorre un liquido con portata 8π cm³/s e velocità normale media di 2 cm/s. Qual è il diametro interno del tubo?

Procedimento: Ricavo prima l’area: A=Q/v_media=(8π)/2=4π cm². Per una sezione circolare A=πr², dunque r²=4 cm² e il raggio positivo è 2 cm. La domanda chiede il diametro, che è il doppio: 4 cm. Il π si cancella esattamente e non serve una sua approssimazione decimale.

Passaggi esatti: `A=\frac Q{\bar v}=4\pi\,\mathrm{cm^2}\qquad r^2=4\,\mathrm{cm^2}\qquad r=2\,\mathrm{cm}\qquad d=2r=4\,\mathrm{cm}`.

Distrattori: 2 cm è il raggio, non il diametro. 8 cm raddoppia ancora il risultato richiesto. 4π cm copia l’area numerica attribuendole un’unità lineare. 16 cm darebbe un raggio di 8 cm, un’area di 64π cm² e quindi una portata di 128π cm³/s, non 8π cm³/s.

Aiuto: Dopo Q/v ottieni un’area: estrai il raggio e ricordati di raddoppiarlo.

Famiglia: `ricavare-il-diametro-dal-flusso`; difficoltà 2; versione 2/base 1.

## C2-Q044

Compito: In un raccordo stazionario entra un liquido incomprimibile a 36 mL/s ed esce da due rami. Nel primo passano 840 mL/min. Non ci sono perdite né accumulo. Qual è la portata del secondo ramo in mL/s?

Procedimento: Le portate si possono sommare dopo averle espresse nella stessa unità di tempo. Il primo ramo porta 840/60=14 mL/s. Il bilancio del raccordo è Q_in=Q₁+Q₂, quindi Q₂=36−14=22 mL/s. Il risultato positivo conferma il verso uscente assunto per il secondo ramo.

Passaggi esatti: `Q_1=\frac{840}{60}\,\mathrm{mL/s}\qquad Q_1=14\,\mathrm{mL/s}\qquad Q_2=Q_{\rm in}-Q_1\qquad Q_2=22\,\mathrm{mL/s}`.

Distrattori: 50 mL/s somma anziché sottrarre il primo ramo. −804 mL/s sottrae numeri con minuti e secondi non uniformati. 14 mL/s è la portata del ramo già noto. 18 mL/s presume una divisione uniforme non assegnata: i rami non sono dichiarati equivalenti.

Aiuto: Converti 840 mL/min in mL/s prima di scrivere il bilancio.

Famiglia: `un-ramo-laterale-non-misurato`; difficoltà 2; versione 2/base 1.

## C2-Q045

Compito: Un tubo ha due sezioni diverse e una portata costante nel tempo. Quale ulteriore descrizione deve valere per chiamare stazionario il campo di velocità?

Procedimento: La stazionarietà del campo riguarda l’osservazione in un punto fisso: il vettore velocità lì non varia nel tempo. Può essere diverso in punti diversi, per esempio maggiore nella sezione stretta. La sola portata costante è un vincolo integrale: da sola non impedisce che cambi il profilo mantenendo uguale la sua media.

Passaggi esatti: `\left.\frac{\partial\vec v}{\partial t}\right|_{\vec x}=0`.

Distrattori: L’uguaglianza fra punti diversi descrive uniformità spaziale, non stazionarietà. Una particella può accelerare attraversando zone con velocità diverse anche in un campo stazionario. Non si richiede flusso nullo e l’integrale costante su una sezione non determina ogni valore locale.

Aiuto: Immagina un sensore fermo nello stesso punto e chiediti se la sua lettura cambia col tempo.

Famiglia: `stazionario-non-vuol-dire-uniforme`; difficoltà 2; versione 2/base 1.

## C2-Q046

Compito: Un liquido omogeneo di densità 0,85 kg/L attraversa una sezione con portata costante di 12 L/min. Quanti chilogrammi la attraversano in un secondo?

Procedimento: La portata di massa è ρQ. In un minuto passano 0,85·12=10,2 kg. In un secondo ne passa un sessantesimo: 10,2/60=0,17 kg. Equivalentemente, 12 L/min sono 0,2 L/s e 0,85·0,2=0,17 kg/s. L’intervallo richiesto è 1 s.

Passaggi esatti: `\dot m=\rho Q\qquad Q=\frac15\,\mathrm{L/s}\qquad \dot m=\frac{17}{100}\,\mathrm{kg/s}\qquad m(1\,\mathrm s)=0{,}17\,\mathrm{kg}`.

Distrattori: 10,2 kg è la massa transitata in un minuto. 0,85 copia la densità numerica; 12 copia la portata volumetrica e cambia unità senza usare ρ. 17 kg introduce un fattore cento. La massa transitata in un intervallo non è la massa immagazzinata nel tubo.

Aiuto: Uniforma il tempo a un secondo e poi moltiplica i litri per kg/L.

Famiglia: `una-portata-di-massa`; difficoltà 2; versione 2/base 1.

## C2-Q047

Compito: Un gas scorre senza accumulo fra due sezioni. La densità è uniforme in ciascuna sezione; nella seconda raddoppia mentre l’area si dimezza. Come cambia la velocità normale media?

Procedimento: Per un gas comprimibile si conserva la portata di massa, non necessariamente quella di volume. La legge è ρ₁A₁v₁=ρ₂A₂v₂. Qui il prodotto ρ₂A₂=(2ρ₁)(A₁/2) è uguale a ρ₁A₁, quindi v₂=v₁. La densità uniforme in ciascuna sezione permette di portarla fuori dalla media della velocità.

Passaggi esatti: `\rho_1A_1\bar v_1=\rho_2A_2\bar v_2\qquad \rho_2A_2=(2\rho_1)(A_1/2)\qquad \bar v_2=\bar v_1`.

Distrattori: Raddoppiare la velocità considera solo l’area come per un liquido a densità costante. Dimezzarla considera solo la densità. Quadruplicarla applica entrambi gli effetti nello stesso verso, ma qui si compensano. Il flusso non deve fermarsi per conservare massa.

Aiuto: Confronta prima i prodotti densità per area nelle due sezioni.

Famiglia: `gas-in-un-restringimento`; difficoltà 2; versione 2/base 1.

## C2-Q048

Compito: Nella relazione Q=A v per una sezione con profilo non uniforme, v è la componente normale della velocità, ... sulla sezione. Quale parola completa correttamente?

Procedimento: La portata è l’integrale della componente normale della velocità sulla sezione. Dividendo questo integrale per A si ottiene la media areale v_n media, e allora Q=A v_n media. Il massimo sull’asse in un particolare profilo non può sostituire questa media senza conoscere il profilo stesso.

Passaggi esatti: `Q=\int_A v_n\,dA\qquad \bar v_n=\frac1A\int_A v_n\,dA\qquad Q=A\bar v_n`.

Distrattori: Massimo e minimo descrivono singoli valori estremi, non la media che restituisce l’integrale. La componente tangenziale non attraversa il piano di misura. Un valore istantaneo sull’asse non rappresenta automaticamente tutta la sezione, anche se il campo è stazionario.

Aiuto: Quale media moltiplicata per l’area ricostruisce l’integrale sulla sezione?

Famiglia: `velocita-efficace-per-la-portata`; difficoltà 1; versione 2/base 1.

## C2-Q049

Compito: Una pompa trasferisce 2,4 L in 3 min a portata costante. All’avvio una linea vuota deve riempirsi con 120 mL prima che arrivi liquido all’uscita. Nel modello ideale senza perdite, accumuli elastici o percorsi alternativi, dopo quanti secondi arriva il liquido?

Procedimento: La portata è 2,4/3=0,8 L/min, cioè 800 mL/min. Il tempo per fornire il volume interno è 120/800=3/20 min. Moltiplicando per 60 si ottengono 9 s. Il volume inizialmente vuoto è un accumulo transitorio: prima del suo riempimento l’uscita non ha ancora la stessa portata liquida dell’ingresso.

Passaggi esatti: `Q=800\,\mathrm{mL/min}\qquad t=\frac{V_{\rm linea}}Q\qquad t=\frac3{20}\,\mathrm{min}\qquad t=9\,\mathrm s`.

Distrattori: 0,15 s conserva il numero espresso in minuti ma gli assegna secondi. 15 s fornirebbero già 200 mL, non 120 mL; 90 s introdurrebbero un fattore dieci. Zero ignora i 120 mL da accumulare nella linea. Non si aggiungono i tre minuti, che servono soltanto a definire la portata della pompa.

Aiuto: Dividi il volume da riempire per la portata, poi converti i minuti in secondi.

Famiglia: `un-residuo-nella-linea`; difficoltà 2; versione 3/base 2.

## C2-Q050

Compito: In un modello di rete incomprimibile stazionaria arrivano complessivamente 6 mL/s. La velocità normale media rispetto all’intera area aperta del letto terminale è 0,20 cm/s. Qual è la somma delle aree aperte in cm²?

Procedimento: La somma delle sezioni terminali va trattata come l’area complessiva attraversata dalla portata totale. Converto 6 mL/s in 6 cm³/s, poi A_tot=Q/v_media=6/0,20=30 cm². La media è riferita all’intera area aperta; non si sta ricavando l’area di un solo piccolo condotto.

Passaggi esatti: `Q=6\,\mathrm{cm^3/s}\qquad A_{\rm tot}=\frac Q{\bar v}\qquad A_{\rm tot}=\frac6{0{,}20}\,\mathrm{cm^2}\qquad A_{\rm tot}=30\,\mathrm{cm^2}`.

Distrattori: 1,2 moltiplica Q per v invece di dividerlo e non ha dimensioni di area. 0,30 cm² introduce un fattore cento; 300 cm² un fattore dieci. 6 cm² copia la portata numerica. Il diametro del singolo ramo non è dato e non va inventato.

Aiuto: Usa la portata totale e la media sulla superficie complessiva, con mL=cm³.

Famiglia: `somma-delle-aree-capillari`; difficoltà 3; versione 2/base 1.
