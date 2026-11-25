# subzero-ice-melting-173 — note dell’autore

Stato aggiornato: le didascalie e i testi visibili dello SVG ora indicano soltanto grandezze fisiche; tutte le coordinate geometriche sono invariate. Le indicazioni px delle note storiche sono coordinate intrinseche dello SVG, non pixel CSS dopo il ridimensionamento. I byte precedenti e le prove browser storiche sono archiviati con manifest e checksum in editorial/author-evidence/u5-phase-processes-173-177-pixel-labels-superseded-20261125. UI correnti NOT_RUN: nessun nuovo rendering di accettazione è stato eseguito per questa correzione; il profilo b963 resta sospeso.

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U5-03.json; SHA256 file 417d221f47f7e8e3b1f3af5f9a38fb9eebc7f344371b9e64b699e3892039fe6b. Letti individualmente tutti gli 80 prompt e le ipotesi assegnate 173–177 prima della scrittura. Catalogo reale C3-L01, L03 e L04 riletto; potenza in C1-L007 dove pertinente. Si usa il solo assemble_family esistente, course C3 e unit u5.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Queste note sono calcoli dell’autore, non firme o giudizi indipendenti.

Sono conservati i coefficienti numerici ideali prescritti dal sorgente. Ogni cammino distingue calore sensibile e latente, verso del trasferimento e fase finale. Le differenze termiche sono in K; quando compare una lettura Celsius non è scambiata per temperatura assoluta. I rami fisici e i limiti che mantengono la fase dichiarata sono espliciti. I vincoli della prova16 collegano preparazioni diverse e non modificano massa o potenza durante il singolo processo.

SVG letto integralmente in XML e rendering completo. Due assembly confrontati; binding source/candidate/provenance e import canonico in SQLite temporaneo controllati, 991 pubblicati e storico invariati. Nessun database reale o pubblicazione. Questi sono controlli tecnici dell’autore.

Anteprime effettuate nello snapshot privato canonico con byte REALI del ROOT 46338aac745b33ca29379bef583be5d8cb33a662, runtime b963060675f372b28d79823f92e3a781b32856779fe1dd6a6fbb3feaba30686f. Uguaglianza completa del runtime_fingerprint e dei tre script canonici verificata prima delle UI. Il manifest di copia e i checksum sono in u5-03-b-runtime-copy-manifest.json. Nessun fingerprint simulato o ritag di vecchi report. I package sono copie byte identiche di quelli B; il piccolo registro è soltanto dello snapshot di test. Report e completion sono copiati byte per byte dopo il vero exit0 con signal nullo; non costituiscono review scientifica.

## 01 — Prima arrivare a zero, poi fondere

Il ghiaccio deve prima passare da −10 °C alla temperatura di fusione: questo tratto richiede mc_iθ=20 J. A 0 °C occorrono poi mL_f=300 J per trasformare tutta la massa in liquido, senza ulteriore aumento termico. I due trasferimenti entrano nello stesso campione e si sommano: 320 J. I 300 J non comprendono il precedente riscaldamento del solido.

Passaggi: `Q_{\rm ris}=mc_i\theta\qquad Q_{\rm ris}=20\,\mathrm J\qquad Q_{\rm fus}=mL_f=300\,\mathrm J\qquad Q=Q_{\rm ris}+Q_{\rm fus}\qquad Q=320\,\mathrm J`

Errori e controllo: 300 J omette il riscaldamento sotto zero; 20 J omette la fusione. Sottrarre i contributi darebbe 280 J, ma entrambi sono assorbiti. 640 J raddoppia la massa o l’intero trasferimento senza un dato che lo richieda.

## 02 — Un intervallo in kelvin, un trasferimento in joule

Il prodotto mc_iθ cancella grammi e kelvin e dà joule. Anche mL_f cancella grammi e dà joule: solo allora i due termini possono essere sommati. Il kelvin di θ esprime una differenza termica, non una temperatura assoluta negativa.

Passaggi: `[mc_i\theta]=\mathrm J\qquad [mL_f]=\mathrm J\qquad [Q]=\mathrm J`

Errori e controllo: K misura l’intervallo, J/g il calore latente specifico e J/(g·K) il calore specifico del solido. W è una potenza: per ricavarla servirebbe un intervallo di tempo.

## 03 — La legge segue le due fasi del percorso

Finché il campione è interamente solido, il calore sensibile porta il ghiaccio alla fusione. Durante la successiva coesistenza di ghiaccio e acqua, il calore cambia la frazione fusa alla stessa temperatura di fase. Una volta fusa tutta la massa il processo termina: non compare un terzo tratto di riscaldamento dell’acqua. Raccogliendo la massa comune si ottiene m(c_iθ+L_f).

Passaggi: `Q=mc_i\theta+mL_f\qquad Q=m(c_i\theta+L_f)\qquad c_i\theta+L_f>0`

Errori e controllo: I termini isolati descrivono un solo tratto. Il segno meno renderebbe ceduto uno dei due contributi. θ+L_f mescola K e J/g, grandezze non sommabili: il calore specifico non può essere raccolto anche dal termine latente.

## 04 — Il doppio del ghiaccio allo stesso punto iniziale

Ogni grammo richiede 20 J di riscaldamento e 300 J di fusione. Con due grammi ciascun termine raddoppia: 40 J più 600 J danno 640 J. Le proprietà assegnate e l’intervallo iniziale sono gli stessi; cambia soltanto la quantità trasformata.

Passaggi: `c_i\theta+L_f=320\,\mathrm{J/g}\qquad Q_A=320\,\mathrm J\qquad Q_B=(2\,\mathrm g)(320\,\mathrm{J/g})\qquad Q_B=640\,\mathrm J`

Errori e controllo: 160 J tratta una massa maggiore come un risparmio. 620 J raddoppia solo la fusione e lascia i 20 J iniziali per un grammo; 1280 J introduce un secondo raddoppio assente.

## 05 — Quanta massa può arrivare tutta ad acqua

Per ogni grammo servono c_iθ+L_f=320 J/g. Dividiamo l’energia totale per questa energia specifica e troviamo un grammo. La verifica ricostruisce 20 J nel solido e 300 J nella fusione. Non basta dividere per L_f: il ghiaccio non partiva già a 0 °C.

Passaggi: `m=\frac{Q}{c_i\theta+L_f}\qquad c_i\theta+L_f=320\,\mathrm{J/g}\qquad m=\frac{320\,\mathrm J}{320\,\mathrm{J/g}}\qquad m=1\,\mathrm g`

Errori e controllo: 16/15 g usa soltanto la fusione, 16 g soltanto il riscaldamento. Nessuno dei due restituisce 320 J quando si percorrono entrambi i tratti assegnati.

## 06 — Quanto era sotto zero il ghiaccio

Dividendo per la massa ricaviamo 320 J/g. Togliamo i 300 J/g necessari alla fusione: restano 20 J/g per il solo aumento termico del ghiaccio. Divisi per 2 J/(g·K) danno θ=10 K, cioè lettura iniziale −10 °C. Per questa inversa serve Q/m>L_f; il risultato deve inoltre mantenere una temperatura iniziale assoluta positiva.

Passaggi: `Q/m-L_f=c_i\theta\qquad \theta=\frac{Q/m-L_f}{c_i}\qquad \theta=\frac{20\,\mathrm{J/g}}{2\,\mathrm{J/(g\,K)}}\qquad \theta=10\,\mathrm K`

Errori e controllo: 160 K divide tutta l’energia specifica per c_i, omettendo la fusione. −10 K confonde il positivo intervallo θ con la lettura iniziale negativa; il punto iniziale è −10 °C, non −10 K.

## 07 — Una partenza più fredda cambia solo un tratto

A richiede 320 J. In B il riscaldamento sensibile cresce da 20 a 40 J, mentre la fusione richiede ancora 300 J: il totale è 340 J. Il rapporto 340/320 si riduce a 17/16. Raddoppiare la distanza termica non raddoppia l’energia latente.

Passaggi: `Q_A=320\,\mathrm J\qquad Q_B=(40+300)\,\mathrm J\qquad Q_B=340\,\mathrm J\qquad Q_B/Q_A=17/16`

Errori e controllo: Due raddoppia anche la fusione. 16/17 inverte il confronto, 17 omette il denominatore del rapporto ridotto e uno ignora il maggiore riscaldamento iniziale.

## 08 — Lo scarto della proposta raddoppiata

Il percorso richiede 320 J. La proposta di 640 J lo supera di 320 J, dunque lo scarto è positivo. È una differenza fra due energie; non si cambia il segno del calore assorbito dal campione.

Passaggi: `Q=320\,\mathrm J\qquad e=(640-320)\,\mathrm J\qquad e=320\,\mathrm J`

Errori e controllo: −320 J esegue la sottrazione opposta. 640 J copia la proposta, zero la accetta e 160 J divide ancora uno scarto già determinato.

## 09 — Isolare la massa dal calore di entrambi i tratti

La massa moltiplica l’intera somma specifica, positiva. Dividendo per c_iθ+L_f eliminiamo quel fattore e conserviamo unità di massa: J diviso J/g dà g. L’inversa tratta con la stessa massa sia il solido scaldato sia la sostanza fusa.

Passaggi: `Q=m(c_i\theta+L_f)\qquad m=\frac Q{c_i\theta+L_f}\qquad [m]=\mathrm g`

Errori e controllo: Dividere per uno solo dei contributi omette l’altro. Il reciproco ha unità g⁻¹ e il prodotto ha J²/g: non sono masse.

## 10 — Due fattori senza scalare il calore latente

La massa nuova moltiplica tutta l’energia specifica, ma κ₂ moltiplica soltanto θ nel tratto sensibile. Formiamo Q_B e dividiamo per Q_A: la massa A si cancella. Non si riscalano c_i e L_f, assegnati uguali nelle due prove. Il dominio aggiunto mantiene fisicamente ammissibile la temperatura iniziale di B.

Passaggi: `Q_B=\kappa_1m_A(c_i\kappa_2\theta_A+L_f)\qquad Q_A=m_A(c_i\theta_A+L_f)\qquad \frac{Q_B}{Q_A}=\frac{\kappa_1(c_i\kappa_2\theta_A+L_f)}{c_i\theta_A+L_f}`

Errori e controllo: κ₁κ₂ moltiplica anche il termine latente per κ₂. Il quoziente semplice rende inverso l’effetto di una partenza più fredda. La quarta opzione scambia B e A; la somma dà due per prove identiche.

## 11 — Cambiano massa e distanza da zero

A richiede 320 J. Ogni grammo di B richiede 340 J e i due grammi assorbono 680 J. Il rapporto 680/320 si riduce a 17/8. La massa raddoppia tutto il percorso, mentre θ raddoppia soltanto il tratto prima della fusione.

Passaggi: `Q_A=320\,\mathrm J\qquad Q_B=2(40+300)\,\mathrm J\qquad Q_B=680\,\mathrm J\qquad Q_B/Q_A=17/8`

Errori e controllo: Due considera solo la massa, 17/16 solo l’intervallo iniziale. Quattro tratta tutti i termini come un prodotto mθ. 8/17 inverte il rapporto.

## 12 — Media di due trasferimenti completi

Le energie sono 320 e 680 J. La somma è 1000 J e la metà 500 J. I dati medi m=3/2 g e θ=15 K descriverebbero invece un terzo processo: il costo specifico sarebbe 330 J/g e il calore 495 J. Qui mediare gli ingressi non sostituisce la media delle due uscite.

Passaggi: `\overline Q=\frac{320+680}{2}\,\mathrm J\qquad \overline Q=500\,\mathrm J\qquad Q_{\rm ingressi\ medi}=495\,\mathrm J`

Errori e controllo: 1000 J è la somma, 180 J metà della differenza e 250 J dimezza due volte. 495 J usa il modello agli ingressi medi. Non si tratta della temperatura di equilibrio ottenuta mescolando i due campioni.

## 13 — L’intervallo iniziale per un bersaglio energetico

Il riferimento richiede 320 J, quindi il bersaglio è 680 J. Dividendo per i due grammi di B otteniamo 340 J/g; tolta la fusione restano 40 J/g, corrispondenti a 20 K nel solido. Il rapporto con i 10 K iniziali è due.

Passaggi: `Q_B=680\,\mathrm J\qquad Q_B/m_B=340\,\mathrm{J/g}\qquad \theta_B=\frac{Q_B/m_B-L_f}{c_i}\qquad \theta_B=20\,\mathrm K\qquad \theta_B/\theta_A=2`

Errori e controllo: 17/8 copia il bersaglio sulle energie. 17/16 è il rapporto energetico a massa invariata, non quello fra gli intervalli. Un mezzo inverte il confronto e quattro non soddisfa il bilancio richiesto.

## 14 — Convertire il display in energia

A richiede 320 J, quindi q=960/(320 J)=3 J⁻¹. La lettura 2040 rappresenta 680 J. A θ=20 K ogni grammo richiede 340 J: dividendo 680 per 340 otteniamo due grammi. Il display non è una massa né un numero di particelle.

Passaggi: `q=3\,\mathrm{J^{-1}}\qquad Q_B=2040/q=680\,\mathrm J\qquad m_B=\frac{Q_B}{c_i\theta_B+L_f}\qquad m_B=2\,\mathrm g`

Errori e controllo: Usare direttamente 2040 come joule darebbe 6 g. Dividere i 680 J soltanto per L_f darebbe 34/15 g e trascurerebbe il riscaldamento del solido.

## 15 — Guadagno e offset prima della massa

I riferimenti assorbono 320 e 680 J. La differenza 720 delle letture su 360 J fissa q=2 J⁻¹, poi b=1. Per C, (1281−1)/2=640 J. Ogni grammo del suo percorso richiede 320 J, quindi la massa è due grammi.

Passaggi: `q=\frac{1361-641}{(680-320)\,\mathrm J}\qquad q=2\,\mathrm{J^{-1}}\qquad b=1\qquad Q_C=640\,\mathrm J\qquad m_C=640/320\,\mathrm g\qquad m_C=2\,\mathrm g`

Errori e controllo: 4 g darebbero S=2561, 1 g darebbe S=641. 1281/640 g omette l’offset e ricostruisce S=1282. 640 g scambia il numero di joule con una massa e richiederebbe un’energia molto maggiore.

## 16 — Un vincolo che porta a due radici algebriche

Sostituiamo la massa scelta per la prova nella somma dei due tratti. L’equazione numerica, con θ espresso in K, diventa θ²+150θ−1600=0. Si fattorizza come (θ−10)(θ+160)=0. La radice 10 K è positiva e ricostruisce m=1 g; la radice −160 K rende negativi sia θ sia m e non rappresenta ghiaccio inizialmente sotto zero nel dominio assegnato.

Passaggi: `Q=d\theta(c_i\theta+L_f)\qquad x=\theta/(1\,\mathrm K)\qquad x^2+150x-1600=0\qquad (x-10)(x+160)=0\qquad x=10\qquad \theta=10\,\mathrm K`

Errori e controllo: 160 K cambia soltanto il segno della radice esclusa e non soddisfa l’equazione. 20 K darebbe Q=680 J sotto il vincolo. 320 K supera inoltre l’intervallo fisico iniziale consentito e scambia il numero dell’energia con quello dell’intervallo.

Geometria conservata (solo nota autore, coordinate intrinseche dello SVG, non pixel CSS): Q axis 1 intrinsic unit/J; vertical 10 intrinsic units/K; component bars 1.2 intrinsic units/J; comparison bars .6 intrinsic units/J.

Finding della review distinta, ID09: corretto soltanto il nome della grandezza nell’hint. c_iθ+L_f è energia richiesta per unità di massa (J/g); il calore specifico c_i ha invece J/(g·K). Nessuna chiave, formula o geometria cambia. UI corrente resta NOT_RUN.
