# Authoring DRAFT — carnot-efficiency-161

Tutti gli 80 prompt assegnati A158–162 sono stati letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605 prima di iniziare la riscrittura. Fonte U5-02 SHA256 66ade7951eecbdbea93c529a628b01c2e8bf393959f757a2cf82aeb03cabb95c. Compiti e casi speciali conservati; eventuali nuove parametrizzazioni sono dichiarate qui. Riletti i blocchi delle lezioni reali C3-L08/L09/L10 e il lavoro/potenza in C1-L007, oltre ai prerequisiti C3 pertinenti. Corso C3 e competenze del catalogo, nessuna lezione inventata.

Autore soltanto: revisione scientifica indipendente NOT_RUN, approvazione umana NOT_RUN, DRAFT e publicationAction NONE. Queste sono note di calcolo dell’autore, non un oracolo indipendente e non un’autofirma.

Due assembly in processi distinti hanno prodotto package e binding identici. Importatore canonico ROOT con percorso assoluto in SQLite temporaneo: 16 nuovi, poi 0 nuovi/16 invariati; 991 pubblicati e versioni storiche conservati, SHA dei pubblicati invariato. Asset SVG letto in XML e rendering nativo completo. Snapshot privata del runtime ROOT, fingerprint 54054f7ac463ef52f7c4c881d50ee071713315d891812696f18e39d9ad45ab3d, verificata uguale prima del replay. Runner canonico browser-batches.mjs ha realmente completato 48 viste a 1440/768/320 px con exit 0 e scritto atomicamente il proprio completion.json; marker riletto dal validatore canonico contro i byte finali. Report grezzo e marker sono conservati byte per byte in editorial/author-evidence. Nessun ritag di prove precedenti, nessuna modifica a runtime, CSS, registry o dati degli studenti. Queste prove tecniche non certificano la correttezza scientifica o l’esperienza umana.

Nuova parametrizzazione esplicita nei casi11–15: il riferimento B originario3 K/1 K è sostituito con900 K/300 K, preservando il rendimento2/3 e il compito. C del15 usa Tc600 K e lettura5/3, quindiTh900 K. Si evitano temperature criogeniche senza cambiare la legge o il carattere manuale. Il12 confronta7/12 con8/13, rendimento sui nuovi ingressi medi650 K e250 K. Carnot richiede reversibilità e due sorgenti ideali con temperature costanti entro ciascun ciclo; non richiede un gas particolare.

## AR-u5-carnot-efficiency-01 — Il limite reversibile fra due sorgenti

Si considera una macchina di Carnot ideale, ciclica e reversibile, che scambia calore soltanto con due sorgenti ideali a temperature assolute T_h>T_c>0. Ciascuna sorgente mantiene la propria temperatura costante durante una prova; fra prove le temperature possono cambiare come dichiarato. η è il rendimento del lavoro netto rispetto al calore assorbito. Tutte le temperature riportate sono in kelvin, e non letture Celsius. T_h=400 K e T_c=200 K. Quanto vale η?

Procedimento d’autore: Il teorema di Carnot dà η=1−T_c/T_h. Il rapporto fra200 K e400 K è un mezzo; il complemento a uno è ancora un mezzo. La differenza di temperatura200 K non è un rendimento: va rapportata alla temperatura calda assoluta.

Passaggi esatti: \eta=1-\frac{T_c}{T_h};  \eta=1-\frac{200}{400};  \eta=\frac12.

Distrattori e controllo didattico: Due è il rapporto caldo/freddo, un quarto ne introduce un quadrato e uno ignorerebbe il calore ceduto a una sorgente fredda con T_c>0. Duecento è una differenza di temperature in K, non un numero puro.

Fonte canonica SHA256 dbed779206afe232e460e77189bc461f5ae3eac04ee38f4dea2025298ce5f64e. Candidato SHA256 6db51727db4c70dd053555745a049aaa438211c2d9c4198e11bb6e6cfd53eb60. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-carnot-efficiency-02 — Due kelvin si cancellano nel rapporto

Per una macchina di Carnot η=1−T_c/T_h, con temperature assolute. Quale unità ha η?

Procedimento d’autore: Il rapporto T_c/T_h ha unità K/K=1 e può essere sottratto da uno. Il rendimento è quindi puro. La scelta dei kelvin è essenziale per il valore del rapporto: cambiare lo zero della scala con una trasformazione affine non mantiene il rapporto dei numeri.

Passaggi esatti: [T_c/T_h]=1;  [\eta]=1.

Distrattori e controllo didattico: K sarebbe adatto alla differenza fra temperature, J a un calore e W a una potenza. K⁻¹ è dimensione di un reciproco di temperatura, non di un rapporto fra due temperature.

Fonte canonica SHA256 145ec82d08e3fa233a27f8e482189248bee75112ec2c6edb4ee1d45cf8f89683. Candidato SHA256 f39bf13e634782df0af1c839520841a422bc5f2acad80b12b001241f3f753cdb. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-carnot-efficiency-03 — Il fluido non cambia il limite di Carnot

Due macchine ideali reversibili compiono cicli fra le stesse due sorgenti T_h>T_c>0, ma usano fluidi operanti diversi. Quale confronto dei rendimenti è corretto?

Procedimento d’autore: Il teorema di Carnot fissa il rendimento di tutte le macchine reversibili fra la medesima coppia di sorgenti. Il fluido e i dettagli del ciclo possono cambiare le energie scambiate e il lavoro per ciclo, ma non il loro rapporto η=1−T_c/T_h. Non si deduce che le due macchine compiano lo stesso lavoro.

Passaggi esatti: \eta_1=1-\frac{T_c}{T_h};  \eta_2=1-\frac{T_c}{T_h};  \eta_1=\eta_2.

Distrattori e controllo didattico: Massa molecolare, capacità termica e numero di moli possono incidere sul ciclo concreto, non sul rendimento reversibile fra sorgenti fissate. Conoscere Q_h serve per W=ηQ_h, non per confrontare questi rendimenti.

Fonte canonica SHA256 cf43d61228a0de9dea0baf0a38af5c7f679dba07b5ed9528586fe966473c0962. Candidato SHA256 62ef88db75c0fd542829978c0286ecacddbf8b3e3318da5b81aefaedbcdfe6a6. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-carnot-efficiency-04 — Una sorgente calda più calda

Si considera una macchina di Carnot ideale, ciclica e reversibile, che scambia calore soltanto con due sorgenti ideali a temperature assolute T_h>T_c>0. Ciascuna sorgente mantiene la propria temperatura costante durante una prova; fra prove le temperature possono cambiare come dichiarato. η è il rendimento del lavoro netto rispetto al calore assorbito. Tutte le temperature riportate sono in kelvin, e non letture Celsius. A usa T_h=400 K,T_c=200 K. B usa T_h=600 K e mantiene T_c=200 K. Come cambia η?

Procedimento d’autore: A ha rendimento un mezzo. In B il rapporto freddo/caldo è200/600=1/3, perciò η_B=2/3. Aumentare T_h con T_c fissa aumenta il rendimento, ma non lo rende unitario a una temperatura calda finita.

Passaggi esatti: \eta_A=\frac12;  \eta_B=1-\frac13;  \eta_B=\frac23.

Distrattori e controllo didattico: Tre quarti moltiplica direttamente η_A per il fattore3/2 su T_h, ma la legge contiene un complemento. Un terzo è la quota ceduta; un mezzo ignora il cambiamento e uno richiederebbe T_c=0 in questa formula.

Fonte canonica SHA256 86d994fe7eeeebb12c695f39f6ff3f0256e3d56ad42f3be3c798bc60335b9aea. Candidato SHA256 3237d8aec74ba45b153821b6dde56ace0eba5e8194270af6b2538efb646ae7f6. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-carnot-efficiency-05 — La temperatura calda dall’efficienza

Si considera una macchina di Carnot ideale, ciclica e reversibile, che scambia calore soltanto con due sorgenti ideali a temperature assolute T_h>T_c>0. Ciascuna sorgente mantiene la propria temperatura costante durante una prova; fra prove le temperature possono cambiare come dichiarato. η è il rendimento del lavoro netto rispetto al calore assorbito. Tutte le temperature riportate sono in kelvin, e non letture Celsius. η=1/2 e T_c=200 K. Quanto vale T_h in K?

Procedimento d’autore: La frazione T_c/T_h è1−η=1/2. Duecento kelvin sono metà della temperatura calda: l’inversa dà200/(1/2)=400 K. Il valore supera T_c e rispetta il dominio motore.

Passaggi esatti: 1-\eta=\frac{T_c}{T_h};  T_h=\frac{T_c}{1-\eta};  T_h=400\,\mathrm K.

Distrattori e controllo didattico: Cento K moltiplica per un mezzo invece di dividere e sarebbe minore di T_c. Duecento K annullerebbe il rendimento. I400 K non significano400 °C: il risultato è sulla scala assoluta.

Fonte canonica SHA256 4c87adee6c22254c400848f39a167ef6c1075be9b23116e7fdb5205021053d17. Candidato SHA256 c609b4f3f0cfa99a265a0105d7999d8cba42015b5e385ecade26784ac55684d2. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-carnot-efficiency-06 — La sorgente fredda compatibile con η

Si considera una macchina di Carnot ideale, ciclica e reversibile, che scambia calore soltanto con due sorgenti ideali a temperature assolute T_h>T_c>0. Ciascuna sorgente mantiene la propria temperatura costante durante una prova; fra prove le temperature possono cambiare come dichiarato. η è il rendimento del lavoro netto rispetto al calore assorbito. Tutte le temperature riportate sono in kelvin, e non letture Celsius. η=1/2 e T_h=400 K. Quanto vale T_c in K?

Procedimento d’autore: La frazione di temperatura fredda è1−η=1/2. Moltiplicandola per400 K otteniamo200 K. Questo dato è strettamente positivo e inferiore a T_h, quindi non richiede il limite non fisico T_c=0.

Passaggi esatti: T_c=(1-\eta)T_h;  T_c=\frac12\,400\,\mathrm K;  T_c=200\,\mathrm K.

Distrattori e controllo didattico: Ottocento K dividerebbe per un mezzo e violerebbe T_c<T_h. Quattrocento K darebbe η=0; zero darebbeη=1, diverso dal dato. L’inversa usa il complemento del rendimento.

Fonte canonica SHA256 1587b4e4be38647553a3f3ddb90c44f16095f63a75a05851ffe8101f12d70855. Candidato SHA256 f0e8a6e2ff3fa6fe12d93465890b59f30413d0a787fb643d6154c862a9621574. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-carnot-efficiency-07 — Riscaldare la sorgente fredda riduce il rendimento

Si considera una macchina di Carnot ideale, ciclica e reversibile, che scambia calore soltanto con due sorgenti ideali a temperature assolute T_h>T_c>0. Ciascuna sorgente mantiene la propria temperatura costante durante una prova; fra prove le temperature possono cambiare come dichiarato. η è il rendimento del lavoro netto rispetto al calore assorbito. Tutte le temperature riportate sono in kelvin, e non letture Celsius. A usa T_h=400 K,T_c=200 K. B mantiene T_h e porta T_c a300 K. Quanto vale η_B/η_A?

Procedimento d’autore: A haη=1/2. In B la quota ceduta reversibile è300/400=3/4 e il rendimento è1/4. Un quarto diviso un mezzo dà un mezzo: la differenza fra le temperature si è ridotta, pur lasciando il ramo T_h>T_c.

Passaggi esatti: \eta_A=\frac12;  \eta_B=1-\frac34;  \eta_B=\frac14;  \eta_B/\eta_A=\frac12.

Distrattori e controllo didattico: Due inverte il rapporto; tre mezzi segue solo T_c e due terzi il suo inverso. Uno ignora la minore differenza fra sorgenti. La variazione del rendimento non segue direttamente T_c.

Fonte canonica SHA256 78e5f40e155c8050684119103640d6141deae2c22a728de981599a25e6934132. Candidato SHA256 40da714c8ff13115975494f539652c06c605695f40caeea6402bc7c13cf1e6eb. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-carnot-efficiency-08 — Il rendimento unitario proposto

Si considera una macchina di Carnot ideale, ciclica e reversibile, che scambia calore soltanto con due sorgenti ideali a temperature assolute T_h>T_c>0. Ciascuna sorgente mantiene la propria temperatura costante durante una prova; fra prove le temperature possono cambiare come dichiarato. η è il rendimento del lavoro netto rispetto al calore assorbito. Tutte le temperature riportate sono in kelvin, e non letture Celsius. T_h=400 K e T_c=200 K. Si propone η=1. Quanto vale proposta meno valore corretto?

Procedimento d’autore: Il rendimento corretto è un mezzo. La proposta uno lo supera di un mezzo. Con T_c>0 e T_h finita, il termine T_c/T_h è positivo e il rendimento di Carnot rimane strettamente minore di uno.

Passaggi esatti: \eta=\frac12;  e=1-\frac12;  e=\frac12.

Distrattori e controllo didattico: Meno un mezzo scambia l’ordine dello scarto. Uno copia la proposta, zero la accetta e due è T_h/T_c. L’uguaglianza η=1 non segue dalla sola reversibilità.

Fonte canonica SHA256 d08b67c9ae42e4a260e31d73dfc952a5a6911c605143017b0136e84fbf59bf50. Candidato SHA256 f4a7c52d5750d8e170cb40636fddc8ec41dbe0b4f9bc5af39dc9473c611e5754. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-carnot-efficiency-09 — L’inversa simbolica richiede η minore di uno

Si considera una macchina di Carnot ideale, ciclica e reversibile, che scambia calore soltanto con due sorgenti ideali a temperature assolute T_h>T_c>0. Ciascuna sorgente mantiene la propria temperatura costante durante una prova; fra prove le temperature possono cambiare come dichiarato. η è il rendimento del lavoro netto rispetto al calore assorbito. Tutte le temperature riportate sono in kelvin, e non letture Celsius. Sono noti T_c e0<η<1. Quale formula ricava T_h?

Procedimento d’autore: Dalla formula di Carnot si ricava(1−η)T_h=T_c. Dividendo per il coefficiente positivo1−η si trova T_h=T_c/(1−η). Poiché tale coefficiente è minore di uno, T_h supera T_c. η=1 non appartiene al dominio dell’inversa.

Passaggi esatti: (1-\eta)T_h=T_c;  T_h=\frac{T_c}{1-\eta};  T_h>T_c>0.

Distrattori e controllo didattico: T_c/η sostituisce la frazione complementare con quella utile: coincide per caso aη=1/2, ma non in generale. Moltiplicare non isola T_h; dividere perη−1 la rende negativa. η/T_c ha unità K⁻¹.

Fonte canonica SHA256 eddcc233f0a4990e97e466328ce3e29d95cf3d77b5cd7c3f0f7910847ea0ead0. Candidato SHA256 5e1be946a2c62562d0ad4f3dcf85430b825399b67b51ea72fde05563face8035. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-carnot-efficiency-10 — Due nuove temperature, due domini da mantenere

Si considera una macchina di Carnot ideale, ciclica e reversibile, che scambia calore soltanto con due sorgenti ideali a temperature assolute T_h>T_c>0. Ciascuna sorgente mantiene la propria temperatura costante durante una prova; fra prove le temperature possono cambiare come dichiarato. η è il rendimento del lavoro netto rispetto al calore assorbito. Tutte le temperature riportate sono in kelvin, e non letture Celsius. B usa T_h,B=κ₁T_h e T_c,B=κ₂T_c, dove i simboli senza pedice sono di A. κ₁,κ₂>0 eκ₁T_h>κ₂T_c. Quanto vale η_B/η_A?

Procedimento d’autore: Ogni rendimento è la differenza delle temperature divisa per la propria temperatura calda. Per B il denominatore èκ₁T_h; nel rapporto con A si cancella T_h e rimane l’espressione indicata. La disuguaglianza del testo mantiene B come motore fra due sorgenti ordinate. Un fattore comune sulle temperature assolute lascia il rendimento invariato.

Passaggi esatti: \eta_B=1-\frac{\kappa_2T_c}{\kappa_1T_h};  \eta_A=1-\frac{T_c}{T_h};  \frac{\eta_B}{\eta_A}=\frac{\kappa_1T_h-\kappa_2T_c}{\kappa_1(T_h-T_c)}.

Distrattori e controllo didattico: κ₁/κ₂ ignora il complemento a uno, il prodotto non resta uno per fattori comuni. Omettereκ₁ dal denominatore dà il rapporto delle differenze termiche, non dei rendimenti. κ₁−κ₂ si annullerebbe per prove identiche.

Fonte canonica SHA256 8063157d2c490504f32c29871ad450caff9463f087bf86278e486a2b752a0350. Candidato SHA256 b0a9395e0d1484c94c11964512f2174cdcfc5ba7af5d10140f9ed38c7f5f057f. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-carnot-efficiency-11 — Un confronto con temperature tutte diverse

Si considera una macchina di Carnot ideale, ciclica e reversibile, che scambia calore soltanto con due sorgenti ideali a temperature assolute T_h>T_c>0. Ciascuna sorgente mantiene la propria temperatura costante durante una prova; fra prove le temperature possono cambiare come dichiarato. η è il rendimento del lavoro netto rispetto al calore assorbito. Tutte le temperature riportate sono in kelvin, e non letture Celsius. A usa T_h=400 K,T_c=200 K. B usa T_h=900 K,T_c=300 K. Quanto vale η_B/η_A?

Procedimento d’autore: A ha rendimento1/2. Per B il rapporto300/900 è1/3 e il rendimento2/3. Dividere due terzi per un mezzo dà quattro terzi. Il rapporto fra due rendimenti può superare uno anche se ciascun rendimento resta minore di uno.

Passaggi esatti: \eta_A=\frac12;  \eta_B=\frac23;  \eta_B/\eta_A=\frac43.

Distrattori e controllo didattico: Tre quarti capovolge il confronto. Nove quarti segue soltanto T_h e tre mezzi soltanto T_c. Due terzi è il rendimento B, non il rapporto B/A. Nessuna potenza o lavoro è determinato senza conoscere anche il calore assorbito.

Fonte canonica SHA256 cd07018ddfd96dd4db195b0435c4b5277e493a93fe19cf8e718e86dffbd1515b. Candidato SHA256 47e90e9c15fbeb2b2019966de250a46428a4dc76855acfef19d0457a24531d38. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-carnot-efficiency-12 — La media non si calcola sulle temperature

Si considera una macchina di Carnot ideale, ciclica e reversibile, che scambia calore soltanto con due sorgenti ideali a temperature assolute T_h>T_c>0. Ciascuna sorgente mantiene la propria temperatura costante durante una prova; fra prove le temperature possono cambiare come dichiarato. η è il rendimento del lavoro netto rispetto al calore assorbito. Tutte le temperature riportate sono in kelvin, e non letture Celsius. A usa T_h=400 K,T_c=200 K. B usa T_h=900 K,T_c=300 K. Qual è la media aritmetica dei due η con uguale peso?

Procedimento d’autore: I rendimenti1/2 e2/3 si scrivono3/6 e4/6. La metà della somma7/6 è7/12. Le temperature medie sarebbero650 K e250 K: il rendimento valutato su quelle è1−250/650=8/13. Il rapporto non è lineare, perciò questa è una diversa operazione.

Passaggi esatti: \overline\eta=\frac{\frac12+\frac23}{2};  \overline\eta=\frac7{12};  \eta_{\rm temperature\ medie}=\frac8{13}.

Distrattori e controllo didattico: Otto tredicesimi usa le temperature medie; sette sesti non divide per due. Un sesto è la differenza dei rendimenti e due terzi copia B. Il confronto esatto7·13=91 e8·12=96 prova che le due medie non coincidono senza usare decimali.

Fonte canonica SHA256 e547040034b44720b587dcad8316775d22ed29941ff3cc8731362097d44e3c22. Candidato SHA256 bda37d55c5328d3d1111d77d1d15db0e672f9ae9ee6706b34dafd901d1206ee3. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-carnot-efficiency-13 — Ricostruire la temperatura fredda del bersaglio

Si considera una macchina di Carnot ideale, ciclica e reversibile, che scambia calore soltanto con due sorgenti ideali a temperature assolute T_h>T_c>0. Ciascuna sorgente mantiene la propria temperatura costante durante una prova; fra prove le temperature possono cambiare come dichiarato. η è il rendimento del lavoro netto rispetto al calore assorbito. Tutte le temperature riportate sono in kelvin, e non letture Celsius. A usa T_h=400 K,T_c,A=200 K. B ha T_h,B=900 K e deve avere η_B=(4/3)η_A. Quanto vale T_c,B/T_c,A?

Procedimento d’autore: Il bersaglio è quattro terzi di un mezzo, due terzi. La quota complementare è un terzo, quindi T_c,B=(1/3)900 K=300 K. Il rapporto300/200 è tre mezzi. Il dato ricostruito è positivo e sotto900 K.

Passaggi esatti: \eta_B=\frac23;  T_{c,B}=(1-\eta_B)T_{h,B};  T_{c,B}=300\,\mathrm K;  T_{c,B}/T_{c,A}=\frac32.

Distrattori e controllo didattico: Due terzi inverte il rapporto, quattro terzi copia il bersaglio sui rendimenti e nove quarti segue le temperature calde. Un terzo è T_c,B/T_h,B, con un denominatore diverso da quello richiesto.

Fonte canonica SHA256 6bfbce4aa9865b72aa56665235e0e94891278ac0fbb385cf3bb3e18632061a92. Candidato SHA256 706c033389c729e69b0f102aeb641578d19cf3b2120f257c552e3b00b27a97ed. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-carnot-efficiency-14 — Un display continuo sul rendimento di Carnot

Si considera una macchina di Carnot ideale, ciclica e reversibile, che scambia calore soltanto con due sorgenti ideali a temperature assolute T_h>T_c>0. Ciascuna sorgente mantiene la propria temperatura costante durante una prova; fra prove le temperature possono cambiare come dichiarato. η è il rendimento del lavoro netto rispetto al calore assorbito. Tutte le temperature riportate sono in kelvin, e non letture Celsius. S=qη è un display continuo adimensionale con q>0 costante. A: T_h=400 K,T_c=200 K,S=3/2. B: T_c=300 K,S=2. Quanto vale T_h,B in K?

Procedimento d’autore: A haη=1/2: q=(3/2)/(1/2)=3. La lettura B di due dàη_B=2/3. Il complemento è1/3 e T_h,B=300/(1/3)=900 K. Il valore della lettura può superare uno perché è amplificato da q; il rendimento fisico resta sotto uno.

Passaggi esatti: q=3;  \eta_B=\frac23;  T_{h,B}=\frac{300}{1/3}\,\mathrm K;  T_{h,B}=900\,\mathrm K.

Distrattori e controllo didattico: Trecento K copia la sorgente fredda e darebbeη=0. Quattrocentocinquanta K divide perη_B invece di1−η_B. Usare S=2 come rendimento viola il dominio; la taratura serve prima dell’inversa.

Fonte canonica SHA256 18fb17ec2ecf2fbea7aa0e751eb48d64e1eef02c21274f732c337c60eed8df85. Candidato SHA256 a778a233d536373582ee10d9dfdfa466f1099f7d80402ebd452cfaed10e10f41. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-carnot-efficiency-15 — Due riferimenti per la taratura affine

Si considera una macchina di Carnot ideale, ciclica e reversibile, che scambia calore soltanto con due sorgenti ideali a temperature assolute T_h>T_c>0. Ciascuna sorgente mantiene la propria temperatura costante durante una prova; fra prove le temperature possono cambiare come dichiarato. η è il rendimento del lavoro netto rispetto al calore assorbito. Tutte le temperature riportate sono in kelvin, e non letture Celsius. Il display continuo è S=qη+b, con q>0 e q,b costanti. A: T_h=400 K,T_c=200 K,S=2. B: T_h=900 K,T_c=300 K,S=7/3. C: T_c=600 K,S=5/3. Quanto vale T_h,C?

Procedimento d’autore: A e B hannoη=1/2 e2/3. Il rapporto delle differenze(1/3)/(1/6) dàq=2, poi b=1. C haη_C=(5/3−1)/2=1/3. Il complemento è2/3, quindi600 K diviso2/3 dà900 K. La sorgente calda resta sopra quella fredda.

Passaggi esatti: q=2;  b=1;  \eta_C=\frac13;  T_{h,C}=\frac{600}{2/3}\,\mathrm K;  T_{h,C}=900\,\mathrm K.

Distrattori e controllo didattico: Milleduecento K imporrebbeη=1/2 eS=2. Milleottocento divide perη_C invece di1−η_C. Tremilaseicento omette l’offset e usaη=5/6. Trecento K viola T_h>T_c e non descrive la macchina motrice dichiarata.

Fonte canonica SHA256 06b48bd367835f060988f26395d18085d37c36749c7936a7996c6315f16a50bb. Candidato SHA256 6b0042f952ffe349b4db5231ca41c6c7cfc5ed507210a74bc05c3c01ef066767. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-carnot-efficiency-16 — Un rapporto di temperature non fissa la loro scala

Si considera una macchina di Carnot ideale, ciclica e reversibile, che scambia calore soltanto con due sorgenti ideali a temperature assolute T_h>T_c>0. Ciascuna sorgente mantiene la propria temperatura costante durante una prova; fra prove le temperature possono cambiare come dichiarato. η è il rendimento del lavoro netto rispetto al calore assorbito. Tutte le temperature riportate sono in kelvin, e non letture Celsius. Fra prove vale T_h=2T_c. Una misura dàη=1/2. Quali T_c>0 sono compatibili?

Procedimento d’autore: La sostituzioneη=1−T_c/(2T_c) dà1/2 per ogni temperatura fredda positiva. La misura ripete il vincolo di rapporto e non ne determina la scala. Per esempio200 K/400 K e300 K/600 K sono entrambe coppie valide ordinate fredda/calda.

Passaggi esatti: \eta=1-\frac{T_c}{2T_c};  \eta=\frac12\quad(T_c>0).

Distrattori e controllo didattico: Duecento K è un esempio, non un valore imposto. Mezzo kelvin confonde il rendimento puro con una temperatura. Nessuna ignora le coppie valide e zero è escluso: con il vincolo renderebbe nulle entrambe le temperature e il rapporto non definito.

Fonte canonica SHA256 9caee876589136194ced55f8295b84e6a07a5e2248c9b4a04025ab78b87ffe81. Candidato SHA256 6a0345004140c96eb5047a04a71e5e937d27e7b214716862fbe3079b1ef60212. Review indipendente NOT_RUN; human NOT_RUN.
