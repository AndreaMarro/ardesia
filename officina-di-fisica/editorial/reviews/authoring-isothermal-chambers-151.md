# Authoring DRAFT — isothermal-chambers-151

Tutti i 16 prompt originali di questa famiglia U5-01 letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605 prima della riscrittura. Le consegne sono autonome e le unità dichiarate; risultati esatti e procedure manuali esplicite, con scale, rapporti e coefficienti dichiarati. Lezioni reali C3-L01/L02/L06/L07 rilette; corso C3 e competenze esistenti, nessun ID inventato.

Autore soltanto. Review scientifica indipendente NOT_RUN, human NOT_RUN, publication DRAFT/NONE. Le note di calcolo seguenti aiutano il revisore e non costituiscono un oracolo indipendente o un’autofirma.

Controlli tecnici: due assembly identiche sui record e sui binding; importatore canonico ROOT con package assoluto A in SQLite temporaneo, 16 nuovi poi 0 nuovi/16 invariati. Tutti i 991 pubblicati, live heads e versioni storiche conservati. SVG XML e rendering completo letti dall’autore. Snapshot privata del runtime ROOT con fingerprint 54054f7ac463ef52f7c4c881d50ee071713315d891812696f18e39d9ad45ab3d identica prima del run; medesimo harness b77d90368c3fa4d7fee43db65b402804615e0ba353f6514d699864e2cbd46372: 48/48 anteprime con exit 0, nessuna violazione di overflow, formule o axe. Questo non sostituisce il replay dell’integratore né certifica l’esperienza umana o l’apprendimento. Nessun registro o codice prodotto modificato.

## AR-u5-isothermal-chambers-01 — La pressione dopo il collegamento

Il primo recipiente contiene n₁=p₁V/(RT), il secondo n₂=p₂V/(RT). Alla fine la stessa quantità totale occupa 2V alla medesima T. La pressione comune è la semisomma: trecento kPa diviso due dà centocinquanta kPa, compresa fra le due iniziali.

Controllo didattico d’autore: Trecento somma le pressioni dimenticando il volume totale doppio. Cento e duecento conservano una sola condizione iniziale. Non si media una temperatura, perché essa è già comune e mantenuta.

Source SHA256 12f31a93ac20333457fbbf6ca4b0093ee99bdf50f69a9669e7ab459f6d3e99f1; candidato SHA256 78ce78dd8c7e1141f47df133150893e85f5c640963ed703c3f8da0bb83c71f4d. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-chambers-02 — L’unità della pressione comune

La semisomma di due pressioni è ancora una pressione, esprimibile in kPa. La conservazione della materia serve a determinarla, ma non trasforma la grandezza richiesta in un numero di moli.

Controllo didattico d’autore: L esprime volume, K temperatura, mol quantità di sostanza e J/K una capacità termica o il prodotto nR. Il fattore uno su due è puro e lascia inalterate le dimensioni.

Source SHA256 a3b26797be27ba0db5cf3cd3efe69b6b3e442b6db3b65f6e9352bc2a4c9ebd14; candidato SHA256 e56e447e7a316ec89ca22c1d0d7c7b7b5910b6f79318f7a80bb4cad3dc13dbe0. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-chambers-03 — La formula dalla conservazione

Le moli iniziali si sommano e i volumi uguali permettono di raccogliere V. Il volume finale totale è 2V. Cancellando V e RT si ottiene la media aritmetica delle pressioni. Non è una legge universale per volumi o temperature iniziali diversi: con volumi diversi a stessa T occorrerebbe una media pesata.

Controllo didattico d’autore: La somma perde il doppio volume; la differenza potrebbe essere negativa e non conserva le moli. La media armonica non nasce da questo bilancio, mentre p₁p₂ ha dimensioni di pressione al quadrato. Il lavoro del confine esterno rigido resta zero, indipendentemente dalla formula di stato finale.

Source SHA256 2b4d05c70e6c63bfbb10bcbfc5e339f3cec444ed2a469e908925e8f355c6341f; candidato SHA256 8c7117e8804cb3afada86a1571cfecb523a76555f4b2c9e03069456cb82d0c8e. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-chambers-04 — Portare le pressioni iniziali all’uguaglianza

La prima prova ha media centocinquanta kPa. La seconda inizia già con entrambe le pressioni a duecento kPa, quindi aprire il collegamento non crea una differenza di pressione da riequilibrare e la pressione comune è duecento. Il dominio ammette anche pressioni iniziali uguali.

Controllo didattico d’autore: Trecento raddoppia tutto il vecchio risultato; quattrocento somma senza dividere. Cento inverte l’effetto e centocinquanta ignora il nuovo gas iniziale corrispondente a p₁ aumentata a V,T fissi.

Source SHA256 fb09b79402168e89922cdf7398616a7f9b2133794e717f0fed168b6235e50c4e; candidato SHA256 e0f05db89f2679c1606b1f020a4901b5d75abbb5b6319ef3816c6b0938960aee. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-chambers-05 — Ricavare una pressione iniziale

Moltiplichiamo la media per due e sottraiamo il contributo noto: trecento meno duecento dà cento kPa. È positivo e minore della pressione finale, che a sua volta è minore di p₂. L’inversa richiede 2p_f>p₂, condizione soddisfatta.

Controllo didattico d’autore: Meno cinquanta sottrae p₂ direttamente dalla media senza raddoppiarla. Trecento copia la somma e cinquecento aggiunge anziché togliere. Non occorre imporre p_f>p₂: la media può essere sotto p₂.

Source SHA256 04d7f2a140cadbb23ebbc55f53e2494ccc84ea58db2d3a906f972a9737c1df09; candidato SHA256 7a4fb8e7172814a501b62739d8396908beea3ab4e6588a99733514447aa257f0. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-chambers-06 — Come si distribuisce il numero totale di molecole

All’equilibrio ogni recipiente ha lo stesso p_f, lo stesso V e la stessa T. La legge ideale n=p_fV/(RT) assegna quindi le stesse moli e lo stesso numero medio di molecole ai due volumi. Ciascuno contiene metà del totale, anche se all’inizio le quantità erano diverse.

Controllo didattico d’autore: Le frazioni iniziali non restano fissate perché la materia può attraversare il collegamento. Un quarto non riempirebbe il totale dei due recipienti; nessuno era più freddo, poiché T era uguale. La pressione iniziale diversa non stabilisce una differenza finale di densità a p,T uguali.

Source SHA256 f0787e950be6474a3c4a6237903ee43d89d0259925de6f58cbe00288a0972157; candidato SHA256 05212b71a7c2cd978f2599d41549367eddf401c25d6f25680a20cebfa5c6a758. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-chambers-07 — Aumentare la pressione del secondo recipiente

Le pressioni comuni sono centocinquanta e duecento kPa. Il rapporto duecento su centocinquanta si semplifica a quattro terzi. Il fattore tre mezzi della sola p₂ non coincide con il fattore della media, perché p₁ resta presente.

Controllo didattico d’autore: Tre mezzi segue solo p₂, tre quarti inverte le prove. Due attribuisce il cambiamento della somma al raddoppio di tutto il sistema e uno ignora la nuova pressione iniziale.

Source SHA256 6c9e0780553717c2e2af375b4a3f2e0c3c5368c8b92bcc3ccc0d4519e0ebab83; candidato SHA256 594a9250ff83fab802548c48b20a3aff005cc250376ccee8fc9024bd4c9c8537. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-chambers-08 — La somma delle pressioni non è la pressione finale

La conservazione dà centocinquanta kPa. La proposta trecento la supera di centocinquanta kPa. Senza riscaldare o aggiungere gas, una pressione finale sopra entrambe le iniziali violerebbe già il controllo della media nel modello dato.

Controllo didattico d’autore: Meno centocinquanta cambia l’ordine, trecento mantiene la proposta e quattrocentocinquanta somma. Zero accetterebbe l’omissione del doppio volume. Il confronto è fra pressioni assolute nelle stesse unità.

Source SHA256 770e20ab8729f360dc94b51ecc60595718cb66dcd4a4e2c75ec3b9a517f38d85; candidato SHA256 8c0f584468ab00829fb4336b16efa0e3254e9eed743830f7572d27bc94101b95. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-chambers-09 — L’inversa con il dominio fisico

La media contiene il fattore un mezzo, che va tolto prima di isolare il primo addendo. Si ottiene p₁=2p_f−p₂. La disuguaglianza fornita rende positiva la pressione iniziale ricostruita; un valore nullo o negativo uscirebbe dal dominio del problema.

Controllo didattico d’autore: La prima differenza senza due non inverte una semisomma. Aggiungere p₂ ne conta un’altra copia; p₂−2p_f cambia il segno e risulta negativo nel dominio assegnato. Ogni termine è una pressione.

Source SHA256 70790d52ea96d4fe0fc9ba3b7479d15f151df7df11b046883e8278db395fc05e; candidato SHA256 91f7251e3d937cf0270748a5544f6ce50cd7d9d5aee475f4124af7ed049b099e. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-chambers-10 — Due fattori e una somma pesata

Le due pressioni scalate vanno sommate prima di formare la nuova media. Il fattore un mezzo è comune e si cancella nel rapporto. Restano le somme pesate, che conservano il contributo di entrambi i recipienti.

Controllo didattico d’autore: Somma e prodotto dei soli fattori perdono i pesi delle pressioni. Il quoziente inverte il ruolo di p₂. Le differenze descrivono un’altra algebra e diventano persino indefinite se p₁=p₂, un caso invece ammesso dalla legge reale del problema.

Source SHA256 28918594811d31ec6a584bb0f085411e025c016858288d97be800a88ad89b120; candidato SHA256 d60fe278be6607f0a79c89c08756a46b4d57540214f6298a7dfd35a5ce796649. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-chambers-11 — Pressioni iniziali entrambe maggiori

A dà centocinquanta kPa e B duecentocinquanta kPa. Il rapporto è cinque terzi. I singoli fattori due e tre mezzi non sono uguali, quindi nessuno dei due rappresenta da solo il cambiamento della pressione comune.

Controllo didattico d’autore: Tre quinti capovolge gli stati, due segue soltanto p₁ e tre mezzi soltanto p₂. Cinque mezzi userebbe p_f,B sul valore iniziale di p₁ anziché sulla media A.

Source SHA256 c9830d833394af7e2ca80b9926e3d611ff3177235f0b8bb6db0e6c2d21f4d6e6; candidato SHA256 977b55463a2576c0ae3165de2412b81d61122eba4290131998e375c5b8a88154. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-chambers-12 — Media statistica di pressioni comuni

La media delle due pressioni finali centocinquanta e duecentocinquanta kPa è duecento kPa. Qui le pressioni iniziali medie centocinquanta e duecentocinquanta kPa darebbero lo stesso valore, perché la legge è lineare e i pesi statistici coincidono. Non si tratta di collegare fisicamente quattro recipienti.

Controllo didattico d’autore: Quattrocento è la somma, cinquanta la semidifferenza e centocinquanta o duecentocinquanta copiano una prova. Non si inventa una discrepanza fra media delle medie e media degli ingressi per questa relazione lineare.

Source SHA256 1aff18279a831e6799e8a4ab85a8a2d613e0b50abdf82f25e4d97ca7f92a0ccd; candidato SHA256 73d36bc49d5dcc87e5188bba9d4b683534410e0db7161e3d06223c028e5ef9f9. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-chambers-13 — Un bersaglio per il secondo recipiente

Il target è cinque terzi di centocinquanta, duecentocinquanta kPa. La somma delle pressioni iniziali B deve quindi essere cinquecento kPa. Togliendo p₁,B=200 kPa otteniamo p₂,B=300 kPa, rapporto tre mezzi rispetto ai duecento iniziali.

Controllo didattico d’autore: Cinque terzi copia il target sulle medie, due segue solo p₁ e cinque mezzi usa la somma cinquecento prima di sottrarre p₁. Due terzi inverte il rapporto richiesto.

Source SHA256 f7fa1a0b3515624ab146871288cc939178de1b3f1267367bf69f9bcc8ad55126; candidato SHA256 e96fcb8cd265e5f25841c5094ac2584ae070ac9f60f9b351f4f8a7edc834f9c5. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-chambers-14 — Display proporzionale alla pressione finale

A ha pressione finale centocinquanta kPa, quindi q=3 per kPa. La nuova lettura settecentocinquanta rappresenta duecentocinquanta kPa. L’inversa dà p₁,B=2·250−300=200 kPa, positiva.

Controllo didattico d’autore: Milleduecento usa S=750 come pressione nella formula 2S−300. Duecentocinquanta copia la pressione finale. Il guadagno strumentale va rimosso prima di usare il bilancio delle moli.

Source SHA256 2277b04db0870273a304029cad614a3cbd7cef0af36c9f64d360574e81a9efae; candidato SHA256 5b903f3b513ba4a698aa778c5b3db2396d4bdc328e4c6c20bf12b52162240fac. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-chambers-15 — Offset e recipienti inizialmente equilibrati

Le pressioni finali A e B sono centocinquanta e duecentocinquanta kPa. Il guadagno è due per kPa e b=1. C ha p_f=(401−1)/2=200 kPa. Quindi p₁,C=2·200−200=200 kPa: C iniziava già con pressioni uguali e non necessita di un flusso netto di riequilibrio.

Controllo didattico d’autore: Quattrocento copia la somma richiesta, cento la p₁ della prova A. Duecentouno trascura l’offset: p_f=401/2 porterebbe p₁=201. Seicento darebbe media quattrocento e S=801, non 401.

Source SHA256 aed197579222f74d944da3077e7ef2f63150fbef3cd72c78cec815e2c8b7f6f0; candidato SHA256 9b09592f38231288aa761f5b58e4f792d448c684a7fb53a7abad0cc85e3e7f47. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-isothermal-chambers-16 — Un vincolo che identifica le pressioni

Sostituendo nella media troviamo p_f=(p₂/2+p₂)/2=3p₂/4. Il secondo recipiente deve quindi partire da quattro terzi di centocinquanta, duecento kPa; il primo da cento kPa. La coppia è unica e positiva.

Controllo didattico d’autore: Cento scambia i due recipienti; centocinquanta copia la pressione finale. Trecento perde il contributo del primo recipiente dopo aver tolto il due esterno. Il vincolo collega stati iniziali di prove diverse e non una legge temporale della pressione.

Source SHA256 53b2788486dec0daf7a8d8c31ac7f487a134e253f183fe05af69a7587d115817; candidato SHA256 2704c1579e3d9363767d109b108e845f39f806098242bcd338022969ae81498f. Nessun giudizio scientifico indipendente attribuito all’autore.

## Condizioni specifiche e lettura della figura

Moli totali conservate, volumi uguali e temperatura assoluta comune mantenuta sono tutte necessarie per la semisomma. Non si impone p₁≠p₂ universalmente: nei casi 04 e 15 l’uguaglianza iniziale è ammessa e non comporta un flusso netto obbligato. Nel 06 si domanda la frazione finale, distinta da quella iniziale: gli uguali p,V,T finali rendono le quantità uguali. L’inversa ammette una pressione finale sotto p₂ e richiede soltanto 2p_f>p₂ per p₁ positivo. Nel 12 le medie coincidono perché la relazione è lineare e i pesi sono uguali, senza un collegamento fisico di quattro recipienti. Il confine esterno rigido compie lavoro nullo: non si applica un lavoro isoterma reversibile di pistone all’apertura interna. I punti SVG sono unità normalizzate di quantità, con la stessa unità in entrambi i pannelli: 4+8=6+6=12; ogni recipiente ha la medesima area grafica per il volume V, non si deduce un conteggio reale di molecole.
