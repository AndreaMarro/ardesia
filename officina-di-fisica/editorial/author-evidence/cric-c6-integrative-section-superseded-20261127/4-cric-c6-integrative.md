# cric-c6-integrative

Tredici problemi Cric distinti da due file originali, non varianti. Doppia assembly identica e import canonico reale 13→0/13; 991 pubblicati, live e storico invariati. Quattro pannelli SVG pertinenti: lettura integrale del nuovo PNG 640×2120 dopo terminale reale 0 e XML completo. Tutte le competenze e i prerequisiti C6 riletti nelle lezioni reali.

UI prodotto, revisione scientifica propria e human NOT_RUN; DRAFT. L’integrazione e il credito restano PENDING_ROOT_DISTINCT_REVIEW_AND_GATES.

## C6-Q001

Fonte: `officina-di-fisica/content/C6.json`; famiglia `il-passaggio-tra-due-strumenti`; versione 2 / base 1.

Compito: Due sensori fermi sono distanti 30 cm lungo un tratto rettilineo d’acqua. Un segnale acustico lo percorre a velocità uniforme 1500 m/s. Il primo sensore avvia il cronometro e il secondo lo ferma; trascura i ritardi degli strumenti. Qual è il tempo in microsecondi?

Procedimento: Il tratto è un percorso diretto, non un’eco. Converto prima 30 cm in 3/10 m e divido per 1500 m/s. Ottengo 1/5000 s; poiché un secondo contiene un milione di microsecondi, sono 1000000/5000=200 μs. La verifica inversa usa 1500 m/s per 200/1000000 s e ricostruisce 3/10 m.

Passaggi: `\Delta t=\frac{s}{v}\qquad \Delta t=\frac1{5000}\,\mathrm s\qquad \Delta t=200\,\mathrm{\mu s}`.

Distrattori: 100 μs introdurrebbe una divisione per due da eco, ma qui non c’è ritorno. 20000 μs tratterebbe 30 cm come 30 m. 0,2 è il valore numerico del tempo in millisecondi, da non copiare con l’unità microsecondi.

Aiuto: Segui gli istanti di avvio e arresto: quale cammino è davvero compreso?

## C6-Q002

Fonte: `officina-di-fisica/content/C6.json`; famiglia `un-ordine-di-grandezza`; versione 2 / base 1.

Compito: Una differenza di pressione uniforme di 25 kPa agisce normalmente su un pistone di area 2,0 cm². Quale massa avrebbe un peso uguale al modulo della forza netta di pressione? Usa g=10 m/s² e trascura altre forze.

Procedimento: Un centimetro quadrato è 1/10000 m², quindi l’area vale 2/10000 m². Il prodotto con 25000 Pa dà 5 N. Per avere lo stesso peso pongo mg=5 N e divido per g: m=1/2 kg. Uso la differenza di pressione, che già rappresenta il contributo netto delle due facce, senza aggiungere l’atmosfera.

Passaggi: `A=\frac2{10000}\,\mathrm{m^2}\qquad F=\Delta p A\qquad F=5\,\mathrm N\qquad m=\frac12\,\mathrm{kg}`.

Distrattori: 5 kg copierebbe il numero della forza senza dividerlo per 10 m/s²; il suo peso sarebbe 50 N. 5000 kg richiederebbe un peso di 50000 N e una diversa conversione dell’area. 1/20 kg darebbe soltanto 1/2 N.

Aiuto: Trova prima la forza in newton, poi usa la relazione fra massa e peso.

## C6-Q003

Fonte: `officina-di-fisica/content/C6.json`; famiglia `un-nodo-con-memoria`; versione 2 / base 1.

Compito: Una pompa immette 90 mL/min di un liquido incomprimibile in un raccordo. Un ramo scarica 30 mL/min; un serbatoio laterale trattiene 12 mL/min. Nell’intervallo considerato non ci sono altre entrate, uscite o perdite. Quanto scorre nel terzo ramo, in mL/min?

Procedimento: Scelgo come volume di controllo il raccordo insieme al serbatoio. Per ogni minuto le 90 unità entranti si dividono fra 30 uscenti nel primo ramo, la portata cercata e 12 che rimangono nel sistema. Sottraggo entrambe le quote note: 90−30−12=48 mL/min. Ricomponendo 30+48+12 ritrovo esattamente l’ingresso.

Passaggi: `Q_{\rm in}=Q_1+Q_3+\dot V_{\rm accumulo}\qquad Q_3=48\,\mathrm{mL/min}`.

Distrattori: 60 mL/min trascurerebbe l’accumulo; 72 mL/min aggiungerebbe invece le 12 unità trattenute alla disponibilità in uscita. 90 mL/min assegnerebbe al terzo ramo tutto l’ingresso. Il sistema non è in regime senza accumulo anche se le portate indicate sono costanti.

Aiuto: Disegna il confine includendo il serbatoio e distingui ciò che esce da ciò che resta.

## C6-Q004

Fonte: `officina-di-fisica/content/C6.json`; famiglia `una-misura-su-metallo`; versione 2 / base 1.

Compito: Nel verso della corrente, un tratto di filo mantiene una caduta di tensione di 5,0 V. In un minuto passa una carica netta di 12 C in quel verso. Qual è la potenza elettrica media ricevuta dal tratto, in watt?

Procedimento: Ogni coulomb perde 5 J di energia potenziale elettrica, ricevuti dal tratto. In tutto sono 12×5=60 J durante 60 s. Dividendo energia per durata ottengo 1 W. In modo equivalente la corrente media è 12/60=1/5 A, e il prodotto di tensione costante per corrente media dà la stessa potenza.

Passaggi: `E=Vq\qquad E=60\,\mathrm J\qquad \overline I=\frac15\,\mathrm A\qquad \overline P=1\,\mathrm W`.

Distrattori: 60 W copierebbe l’energia numerica senza dividerla per 60 s. 0,2 W copierebbe il numero della corrente in ampere come se fosse una potenza. Usare un minuto come un secondo moltiplicherebbe il risultato per sessanta.

Aiuto: Puoi calcolare prima l’energia totale oppure la corrente media, mantenendo la stessa durata.

## C6-Q005

Fonte: `officina-di-fisica/content/C6.json`; famiglia `due-letture-sul-calorimetro`; versione 2 / base 1.

Compito: Un blocco scende perdendo 30 J di energia potenziale gravitazionale. La sua velocità resta costante e un calorimetro collegato riceve 24 J. Nel bilancio dell’intero dispositivo non ci sono altre sorgenti di energia. Quanti joule sono trasferiti o accumulati negli altri canali?

Procedimento: La velocità costante rende nulla la variazione dell’energia cinetica del blocco. I 30 J disponibili devono quindi ritrovarsi nei 24 J misurati dal calorimetro e nel resto del dispositivo o nell’ambiente. La differenza 30−24=6 J misura questi altri canali. Non significa che l’energia scompaia, né determina da sola quale componente si scaldi.

Passaggi: `30\,\mathrm J=24\,\mathrm J+E_{\rm altri}\qquad E_{\rm altri}=6\,\mathrm J`.

Distrattori: 54 J sommerebbe due destinazioni della stessa energia anziché chiudere il bilancio. Zero imporrebbe che tutta la perdita fosse nel calorimetro, contro la misura. 24 J è il calore già registrato, non la quota residua.

Aiuto: Se l’energia cinetica non cambia, quali destinazioni devono sommare alla perdita disponibile?

## C6-Q006

Fonte: `officina-di-fisica/content/C6.json`; famiglia `un-generatore-e-un-carico`; versione 2 / base 1.

Compito: In un ciclo una macchina riceve 900 J di calore e ne cede 600 J, tornando allo stato iniziale. Non ci sono altri scambi energetici salvo il lavoro all’albero. Un generatore ne trasforma l’80% in energia elettrica. Quanti joule elettrici si ottengono per ciclo?

Procedimento: La macchina torna allo stesso stato, quindi la sua variazione interna netta è zero. Il lavoro disponibile all’albero è 900−600=300 J. Il generatore riceve questi 300 J, non tutti i 900 J termici; ne converte quattro quinti, pari a 240 J. Gli altri 60 J del generatore si aggiungono ai 600 J già ceduti dalla macchina, chiudendo il bilancio totale.

Passaggi: `W=Q_{\rm ricevuto}-Q_{\rm ceduto}\qquad W=300\,\mathrm J\qquad E_{\rm el}=\frac45W\qquad E_{\rm el}=240\,\mathrm J`.

Distrattori: 720 J applicherebbe l’80% al calore in ingresso anziché al lavoro. 300 J ignorerebbe le perdite del generatore. Dividere per 4/5 darebbe 375 J elettrici da 300 J meccanici, incompatibile con il rendimento dichiarato.

Aiuto: Identifica l’ingresso di ciascun dispositivo prima di applicarne la frazione utile.

## C6-Q007

Fonte: `officina-di-fisica/content/C6.json`; famiglia `sostituire-solo-il-tratto`; versione 2 / base 1.

Compito: Confronta due tubi circolari rigidi, lunghi, con stesso liquido newtoniano e stessa lunghezza. Il moto è laminare stazionario sviluppato, con aderenza alle pareti ferme. La portata positiva è la stessa e il secondo raggio è il doppio del primo. Qual è il rapporto Δp₂/Δp₁ fra i moduli delle cadute di pressione?

Procedimento: Nella legge di Poiseuille la portata è proporzionale al prodotto Δp r⁴, a viscosità e lunghezza fissate. Qui è la portata a rimanere costante. Raddoppiare il raggio moltiplica r⁴ per sedici, quindi la caduta deve diventare un sedicesimo. Il rapporto è definito perché portata e resistenze sono positive; non si confrontano due cadute nulle.

Passaggi: `Q=\frac{\pi r^4\Delta p}{8\eta L}\qquad \frac{\Delta p_2}{\Delta p_1}=\left(\frac{r_1}{r_2}\right)^4\qquad \frac{\Delta p_2}{\Delta p_1}=\frac1{16}`.

Distrattori: Sedici userebbe la variazione di portata a pressione fissata, che è un esperimento diverso. Un quarto applicherebbe soltanto il quadrato del raggio, non la quarta potenza. Un mezzo assumerebbe una legge lineare col raggio.

Aiuto: Isola la caduta di pressione mantenendo costante la portata positiva.

## C6-Q008

Fonte: `officina-di-fisica/content/C6.json`; famiglia `il-rivelatore-guarda-piu-lontano`; versione 2 / base 1.

Compito: Una sorgente puntiforme emette isotropicamente con lo stesso numero medio di segnali per decadimento. La sua attività positiva si dimezza. Lo stesso piccolo rivelatore, normale ai raggi e con efficienza invariata, passa da distanza r>0 a 3r. Trascura fondo e assorbimento. Quanto vale il rapporto fra tasso iniziale e finale?

Procedimento: A parità di rivelatore il tasso è proporzionale all’attività e inversamente al quadrato della distanza. Il dimezzamento fornisce 1/2 e lo spostamento fornisce 1/9: il tasso finale è 1/18 di quello iniziale. È richiesto il rapporto opposto, iniziale su finale, quindi il fattore di riduzione è 18. La sorgente resta puntiforme rispetto alle distanze e il rivelatore intercetta una piccola porzione della superficie sferica.

Passaggi: `\frac{R_f}{R_i}=\frac12\left(\frac13\right)^2\qquad \frac{R_f}{R_i}=\frac1{18}\qquad \frac{R_i}{R_f}=18`.

Distrattori: 1/18 è la frazione finale rimasta, non il rapporto chiesto. Sei combinerebbe il dimezzamento con una distanza lineare; nove trascurerebbe il decadimento e due trascurerebbe la geometria.

Aiuto: Forma prima il rapporto finale su iniziale e poi verifica se devi invertirlo.

## C6-Q009

Fonte: `officina-di-fisica/content/C6.json`; famiglia `un-rettangolo-orientato`; versione 2 / base 1.

Compito: In un filo la corrente convenzionale è +0,30 A per 4 s e poi −0,10 A per 5 s, rispetto allo stesso verso positivo. Qual è la carica netta passata in quel verso nell’intero intervallo?

Procedimento: La carica netta è l’area orientata del grafico corrente–tempo. Il primo rettangolo contribuisce (3/10 A)(4 s)=6/5 C; il secondo (−1/10 A)(5 s)=−1/2 C. Porto al denominatore dieci: 12/10−5/10=7/10 C. Il segno positivo indica che prevale il trasferimento nel verso convenzionale scelto.

Passaggi: `q_1=\frac65\,\mathrm C\qquad q_2=-\frac12\,\mathrm C\qquad q_{\rm netto}=\frac7{10}\,\mathrm C`.

Distrattori: 17/10 C somma i moduli e descrive la quantità transitata nei due versi, non il netto. 6/5 C considera solo il primo tratto e −1/2 C solo il secondo. Il risultato −7/10 C invertirebbe il verso positivo assegnato.

Aiuto: Scrivi il segno di ciascuna area prima di sommare le due cariche.

## C6-Q010

Fonte: `officina-di-fisica/content/C6.json`; famiglia `due-livelli-in-quiete`; versione 2 / base 1.

Compito: Un tubo è pieno di un liquido omogeneo in quiete, di densità costante. Due prese hanno dislivello verticale 0,25 m; la pressione inferiore supera la superiore di 2,0 kPa. Con g=10 m/s², quale densità in kg/m³ ricavi?

Procedimento: In quiete la differenza di pressione fra i due livelli è ρgΔh. Converto 2 kPa in 2000 Pa e isolo ρ. Il prodotto gΔh è (10 m/s²)(1/4 m)=5/2 m²/s²; 2000 diviso 5/2 è 800 kg/m³. La pressione di riferimento si cancella nella differenza, perciò non devo aggiungere la pressione atmosferica.

Passaggi: `\Delta p=\rho g\Delta h\qquad \rho=\frac{\Delta p}{g\Delta h}\qquad \rho=800\,\mathrm{kg/m^3}`.

Distrattori: 0,8 kg/m³ userebbe 2 come se fossero pascal anziché kilopascal. 500 kg/m³ moltiplicherebbe 2000 per 0,25 senza dividere per gΔh; con quella densità il modello darebbe 1250 Pa. Lungo un flusso generico la sola differenza di quota non basterebbe: qui la quiete è dichiarata.

Aiuto: Usa la differenza verticale e converti i kilopascal prima di dividere.

## C6-Q011

Fonte: `officina-di-fisica/content/C6.json`; famiglia `una-misura-che-non-basta`; versione 2 / base 1.

Compito: Un fascio monocromatico investe interamente un sensore. Vuoi attribuire un aumento della potenza ottica incidente al numero medio di fotoni al secondo, invece che all’energia di ciascuno. Quale insieme di misure lo permette?

Procedimento: Nel modello monocromatico ogni fotone porta hf. Se misuro che f resta uguale, l’energia unitaria non cambia. Se cresce anche la potenza ottica incidente P, dalla relazione P=Ṅhf segue che deve crescere il tasso medio Ṅ. Misurare la potenza incidente evita di scambiare una variazione della risposta elettrica non calibrata del sensore con un vero aumento dell’energia ricevuta.

Passaggi: `P=\dot N h f\qquad \dot N=\frac P{hf}`.

Distrattori: La sola temperatura ambiente non determina hf. La sola distanza o l’area illuminata non fissano la potenza totale intercettata. Una lettura elettrica non calibrata può cambiare per ragioni strumentali: la conclusione riguarda qui frequenza e potenza ottica misurate.

Aiuto: Quale misura fissa l’energia di un fotone e quale misura l’energia totale per secondo?

## C6-Q012

Fonte: `officina-di-fisica/content/C6.json`; famiglia `ripensare-una-previsione`; versione 2 / base 1.

Compito: Una lampada assorbe costantemente 5 W elettrici e ne trasforma il 20% in luce. Un rivelatore intercetta il 2% di tutta la potenza luminosa emessa e mantiene questa frazione per 3 s. Quanti millijoule di energia ottica riceve?

Procedimento: La potenza luminosa emessa è un quinto di 5 W, quindi 1 W. Il rivelatore riceve un cinquantesimo di questo watt: 1/50 W. In 3 s ottiene 3/50 J; moltiplicando per 1000 trovo 60 mJ. Il controllo complessivo mostra che 60 mJ sono soltanto il 20% del 2% dei 15 J elettrici iniziali.

Passaggi: `P_{\rm luce}=1\,\mathrm W\qquad P_{\rm ricevuta}=\frac1{50}\,\mathrm W\qquad E_{\rm ricevuta}=\frac3{50}\,\mathrm J\qquad E_{\rm ricevuta}=60\,\mathrm{mJ}`.

Distrattori: 3000 mJ ignorerebbe la frazione intercettata; 300 mJ ignorerebbe la conversione elettricità–luce. 0,06 mJ copierebbe il valore numerico in joule senza convertire il prefisso. Le due percentuali si applicano a stadi successivi.

Aiuto: Procedi da potenza elettrica a luce emessa, poi a luce intercettata e infine a energia.

## C6-AQ01

Fonte: `officina-di-fisica/content/lotto-001.json`; famiglia `portata-da-potenza-termica-e-salto-di-temperatura`; versione 2 / base 1.

Compito: Un riscaldatore trasferisce costantemente 8,0 W a un flusso d’acqua in regime stazionario. L’uscita è 0,50 K più calda dell’ingresso. Trascura dispersioni, cambiamenti di fase e variazioni di quota e velocità. Con c=4000 J/(kg K) e ρ=1000 kg/m³ costanti, trova la portata volumica in mL/s.

Procedimento: Ogni chilogrammo che attraversa il banco richiede cΔT=(4000 J/(kg K))(1/2 K)=2000 J/kg. Con 8 J disponibili ogni secondo la portata massica è 8/2000=1/250 kg/s, cioè 4 g/s. Divido per la densità per ricavare 1/250000 m³/s; un metro cubo contiene un milione di millilitri, quindi sono 4 mL/s. Quattro millilitri hanno massa 4 g e richiedono proprio 8 J per scaldarsi di mezzo kelvin.

Passaggi: `P=\dot m c\Delta T\qquad \dot m=\frac1{250}\,\mathrm{kg/s}\qquad Q_V=\frac{\dot m}{\rho}\qquad Q_V=4\,\mathrm{mL/s}`.

Distrattori: 0,004 mL/s copierebbe il numero della portata massica in kg/s con un’unità volumica diversa. 4000 mL/s trascurerebbe il rapporto fra chilogrammi e grammi a densità assegnata. La densità serve dopo il bilancio termico, per trasformare massa al secondo in volume al secondo.

Aiuto: Trova prima quanti chilogrammi si possono scaldare ogni secondo, poi convertili in volume.
