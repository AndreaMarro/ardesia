# free-expansion-pressure-166 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U5-02.json; SHA256 del file sorgente 66ade7951eecbdbea93c529a628b01c2e8bf393959f757a2cf82aeb03cabb95c. Letti individualmente tutti gli 80 prompt e le ipotesi assegnate 163–167 prima della scrittura. Rilette le lezioni reali C3-L01, L02, L03, L06, L07, L08 e L09. Per il caso03 è stata letta integralmente anche C3-L10: cammino reversibile ausiliario per l’entropia e aumento nei processi irreversibili isolati. Il solo03 ha skill C3-L10; i quesiti di pressione mantengono C3-L07. Si usa il solo assemble_family esistente, course C3, unit u5.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Queste sono note di calcolo dell’autore per la futura revisione distinta: non contengono firme scientifiche o approvazioni.

Sono mantenuti i parametri numerici dei quesiti sorgente. I trasferimenti Q e W sono distinti dalle funzioni di stato. Le convenzioni di segno e le unità sono esplicite nei prompt; i confronti riguardano prove separate. Capacità totale, capacità molare e calore specifico sono distinti quando presenti. Il vincolo fra parametri della prova16 riguarda preparazioni diverse e non introduce una legge variabile lungo il processo.

SVG letto integralmente in XML e rendering nativo; scale e posizioni delle etichette controllate dall’autore. Formula steps separati usando law_steps. Due assembly confrontati, legami source/candidate/provenance riletti e import canonico in SQLite temporaneo, senza pubblicazione. Le anteprime usano browser-batches, helper di resume e browser-drafts canonici immutati in uno snapshot privato del runtime integratore, con package d’autore e un piccolo registro privato che dichiara esattamente i loro ID. Report e completion sono copiati byte per byte solo dopo il vero exit0; il marker non viene costruito da report precedenti. Tali controlli sono tecnici e non costituiscono revisione scientifica indipendente.

## 01 — Più volume senza raffreddamento ideale

Il vuoto non oppone una pressione esterna al gas e il confine esterno del recipiente non si sposta: non esce lavoro. L’isolamento annulla il calore entrante, quindi l’energia interna rimane uguale. Per il gas ideale ciò conserva la temperatura fra i due equilibri. A parità di moli e temperatura, raddoppiare il volume dimezza la pressione: da cento a cinquanta kilopascal.

Passaggi: `Q=W=0\qquad \Delta U=0\qquad T_f=T_1\qquad V_f=V_0+V_v=2\,\mathrm L\qquad p_f=\frac{100\cdot1}{2}\,\mathrm{kPa}\qquad p_f=50\,\mathrm{kPa}`

Errori e controllo: Cento kPa ignorerebbe il volume reso accessibile. La formula reversibile pV^γ=costante non si applica: questo processo non attraversa una successione di equilibri reversibili. Non si calcola il lavoro con la pressione iniziale interna moltiplicata per il volume aggiunto.

## 02 — Il rapporto volumico è adimensionale

V₀ e V₀+V_v sono volumi e devono essere espressi nella stessa unità; il loro rapporto non porta unità. Rimane quella di p₁, qui kilopascal. La scelta dei litri non altera il rapporto purché sia coerente in entrambi i termini.

Passaggi: `\left[\frac{V_0}{V_0+V_v}\right]=1\qquad [p_f]=[p_1]=\mathrm{kPa}`

Errori e controllo: L misura il volume, J energia e K temperatura. kPa/L comparirebbe dividendo per un volume senza il corrispondente fattore V₀ al numeratore.

## 03 — La temperatura resta, l’entropia aumenta

Il primo principio annulla ΔU perché calore e lavoro esterni sono nulli. Per un gas ideale l’energia interna dipende dalla temperatura, quindi ΔT=0. Il processo è però irreversibile: il gas acquista volume accessibile e la sua entropia aumenta. Per calcolare questa variazione di stato si può immaginare un percorso reversibile isotermo fra gli stessi estremi, senza attribuire quel percorso al processo reale. Nella formula, n>0 indica le moli del campione e R la costante universale dei gas.

Passaggi: `\Delta U=Q-W=0\qquad \Delta T=0\qquad \Delta S=nR\ln\!\left(\frac{V_0+V_v}{V_0}\right)\qquad V_v>0\Rightarrow\Delta S>0`

Errori e controllo: Adiabatico significa Q=0, non ΔS=0: l’entropia resta costante solo nell’adiabatica reversibile. Il raffreddamento è proprio di altre espansioni, per esempio quella reversibile adiabatica con lavoro uscente. Qui non si assume una temperatura uniforme durante ogni istante del transitorio.

## 04 — Raddoppiare la pressione preparata

Il volume finale resta il doppio di quello iniziale in entrambe le prove. Il fattore geometrico è quindi sempre un mezzo. Applicato alle due pressioni preparate separatamente dà cinquanta e cento kilopascal: la pressione finale raddoppia.

Passaggi: `V_0/(V_0+V_v)=1/2\qquad p_{f,A}=50\,\mathrm{kPa}\qquad p_{f,B}=100\,\mathrm{kPa}`

Errori e controllo: Venticinque kPa renderebbe inversa la dipendenza da p₁. Duecento ripeterebbe la nuova pressione iniziale senza espansione; zero richiederebbe un limite di volume finale infinito, non i due litri assegnati.

## 05 — La pressione prima della rimozione del setto

Il volume finale è due volte quello iniziale; per ricostruire la pressione precedente all’espansione moltiplichiamo la finale per due. Cinquanta kilopascal diventano cento. La pressione iniziale deve essere maggiore della finale perché il volume aggiunto è positivo.

Passaggi: `p_1=p_f\frac{V_0+V_v}{V_0}\qquad p_1=50\cdot2\,\mathrm{kPa}\qquad p_1=100\,\mathrm{kPa}`

Errori e controllo: Dividere ancora per due darebbe 25 kPa, minore di p_f e incompatibile con l’espansione descritta. Cinquanta ignora che il volume è aumentato.

## 06 — Il volume che era vuoto

Dal rapporto delle pressioni ricaviamo che il volume finale è due volte V₀. Quel volume comprende sia il comparto inizialmente occupato sia quello vuoto. Togliendo il primo litro dai due finali otteniamo un litro inizialmente vuoto. L’inversa richiede 0<p_f<p₁ per dare V_v>0.

Passaggi: `V_0+V_v=V_0p_1/p_f\qquad V_v=V_0(p_1/p_f-1)\qquad V_v=(1\,\mathrm L)(2-1)\qquad V_v=1\,\mathrm L`

Errori e controllo: Due L è il volume totale finale, non il solo comparto vuoto. Un valore negativo descriverebbe un volume rimosso, fuori dal modello. La differenza di pressioni da sola non ha unità di volume.

## 07 — Aggiungere tre litri anziché uno

A termina in due litri a cinquanta kilopascal. B termina in quattro litri a venticinque kilopascal. Il rapporto venticinque su cinquanta è un mezzo. V_v triplica, ma la pressione dipende dal volume totale V₀+V_v, che qui soltanto raddoppia.

Passaggi: `V_{f,A}=2\,\mathrm L\qquad V_{f,B}=4\,\mathrm L\qquad p_{f,A}=50\,\mathrm{kPa}\qquad p_{f,B}=25\,\mathrm{kPa}\qquad p_{f,B}/p_{f,A}=1/2`

Errori e controllo: Un terzo usa solo il volume vuoto e dimentica il litro iniziale. Due inverte il rapporto delle pressioni; tre trasforma una dipendenza inversa nel volume totale in una diretta nel solo V_v.

## 08 — Lo scarto della pressione non aggiornata

La pressione corretta è cinquanta kilopascal. La proposta mantiene erroneamente quella iniziale e la supera di cinquanta kilopascal. Lo scarto positivo segnala una sovrastima, non un riscaldamento del gas.

Passaggi: `p_f=50\,\mathrm{kPa}\qquad e=(100-50)\,\mathrm{kPa}\qquad e=50\,\mathrm{kPa}`

Errori e controllo: Meno cinquanta sottrae nell’ordine opposto. Cento copia la proposta, zero la accetta e venticinque non è la differenza fra i due valori.

## 09 — L’inversa conserva il litro iniziale

Il fattore V₀/(V₀+V_v) è positivo. Per annullarlo moltiplichiamo per il suo reciproco. Il rapporto di volumi mantiene l’unità di pressione e, essendo maggiore di uno, produce p₁>p_f, come richiede l’espansione.

Passaggi: `p_f=p_1\frac{V_0}{V_0+V_v}\qquad p_1=p_f\frac{V_0+V_v}{V_0}`

Errori e controllo: La seconda opzione applica ancora il fattore di espansione. Usare il solo V_v dimentica il volume iniziale già occupato. Le ultime due espressioni hanno unità pressione moltiplicata per volume e pressione divisa per volume, non pressione.

## 10 — Due riscalamenti con un volume fisso

Il nuovo volume vuoto va sommato allo stesso V₀, non si riscalano entrambi i comparti. Scrivendo le pressioni finali e dividendo, p₁ e V₀ al numeratore si cancellano. Rimangono κ₁ e il rapporto inverso dei volumi totali. Per κ₁=κ₂=1 il risultato torna uno.

Passaggi: `p_{f,B}=\frac{\kappa_1p_1V_0}{V_0+\kappa_2V_v}\qquad p_{f,A}=\frac{p_1V_0}{V_0+V_v}\qquad \frac{p_{f,B}}{p_{f,A}}=\frac{\kappa_1(V_0+V_v)}{V_0+\kappa_2V_v}`

Errori e controllo: κ₁/κ₂ sarebbe valido se si scalasse tutto il volume finale, che qui contiene un termine fisso. Il prodotto assegna al volume l’effetto opposto; la quarta opzione inverte il rapporto e l’ultima omette volumi presenti in entrambe le prove.

## 11 — Una pressione iniziale molto minore

A termina a 50 kPa. B distribuisce la pressione iniziale di un kilopascal sul triplo del volume occupato inizialmente: p_f,B=1/3 kPa. Dividendo per 50 kPa si ottiene 1/150. La piccola pressione assoluta è positiva e compatibile col modello ideale assegnato.

Passaggi: `p_{f,A}=50\,\mathrm{kPa}\qquad p_{f,B}=\frac13\,\mathrm{kPa}\qquad \frac{p_{f,B}}{p_{f,A}}=\frac{1/3}{50}\qquad p_{f,B}/p_{f,A}=1/150`

Errori e controllo: 1/100 considera solo il cambiamento di p₁. Due terzi considera solo i volumi totali e 1/3 ripete il valore numerico della pressione B. Centocinquanta scambia B e A.

## 12 — Media delle pressioni, non degli ingressi

Le letture sono cinquanta e un terzo di kilopascal. Portandole a denominatore tre, la somma è 151/3 kPa; la metà è 151/6 kPa. Gli ingressi medi sarebbero 101/2 kPa e 3/2 L: produrrebbero invece 101/5 kPa, una terza prova distinta dalla media richiesta.

Passaggi: `\overline p_f=\frac{50+1/3}{2}\,\mathrm{kPa}\qquad \overline p_f=\frac{151}{6}\,\mathrm{kPa}`

Errori e controllo: 151/3 è la somma senza dimezzamento. 149/6 fa metà della differenza anziché della somma; 25 ignora la piccola lettura B. 101/5 applica il modello agli ingressi medi e non dà la media delle uscite.

## 13 — Il comparto per un bersaglio piccolo

Il riferimento dà 50 kPa e il bersaglio è 1/3 kPa. Con p₁,B=1 kPa, il volume totale deve essere tre volte V₀, dunque tre litri. Togliendo il litro inizialmente occupato restano due litri vuoti: il rapporto col comparto A di un litro è due.

Passaggi: `p_{f,B}=50/150\,\mathrm{kPa}\qquad p_{f,B}=\tfrac13\,\mathrm{kPa}\qquad V_{v,B}=V_0(p_{1,B}/p_{f,B}-1)\qquad V_{v,B}=2\,\mathrm L\qquad V_{v,B}/V_{v,A}=2`

Errori e controllo: Tre è il rapporto dei volumi totali, non dei comparti vuoti. Centocinquanta è il fattore sulle pressioni finali e non si trasferisce direttamente a V_v perché cambia anche p₁.

## 14 — Tarare prima di ricostruire p₁

A termina a 50 kPa, quindi q=3 kPa⁻¹. La lettura uno di B vale 1/3 kPa. Il volume finale B è tre volte V₀: l’inversa moltiplica la pressione finale per tre e ricostruisce un kilopascal iniziale.

Passaggi: `p_{f,A}=50\,\mathrm{kPa}\qquad q=3\,\mathrm{kPa^{-1}}\qquad p_{f,B}=\tfrac13\,\mathrm{kPa}\qquad p_{1,B}=3p_{f,B}\qquad p_{1,B}=1\,\mathrm{kPa}`

Errori e controllo: Tre kPa risulterebbero trattando la lettura come una pressione già espressa in kPa. Un terzo è la finale, non l’iniziale; la taratura e l’inversa geometrica sono due passaggi distinti.

## 15 — Due riferimenti separano il guadagno dall’offset

Le finali di riferimento sono 50 kPa e 1/3 kPa. Le differenze delle letture e delle pressioni valgono 298/3 e 149/3 kPa: il rapporto dà q=2 kPa⁻¹. A fissa b=1. Per C, tolto uno e diviso per due, troviamo 100 kPa finali. Il volume raddoppiato richiede una pressione iniziale doppia, cioè 200 kPa.

Passaggi: `q=\frac{101-5/3}{(50-1/3)\,\mathrm{kPa}}\qquad q=2\,\mathrm{kPa^{-1}}\qquad b=1\qquad p_{f,C}=100\,\mathrm{kPa}\qquad p_{1,C}=200\,\mathrm{kPa}`

Errori e controllo: Cento kPa si ferma alla finale. 201 kPa omette l’offset e ricostruisce S=202. Quattrocento kPa darebbero S=401, cinquanta kPa darebbero S=51: la sostituzione nelle due leggi rifiuta queste alternative.

## 16 — Una pressione scelta insieme al comparto

Sostituiamo nella legge e moltiplichiamo per V₀+V_v, che è positivo. Rimane un’equazione lineare: p_fV₀=(dV₀−p_f)V_v. Qui dV₀−p_f=50 kPa, positivo, e il quoziente dà un litro. Ricostruiamo p₁=100 kPa e p_f=50 kPa: il vincolo riguarda prove preparate diversamente, non un aumento di pressione durante l’espansione.

Passaggi: `p_f=\frac{dV_vV_0}{V_0+V_v}\qquad p_fV_0=(dV_0-p_f)V_v\qquad V_v=\frac{p_fV_0}{dV_0-p_f}\qquad V_v=1\,\mathrm L`

Errori e controllo: Meno un litro viola il dominio. Due litri darebbero 200/3 kPa finali e mezzo litro 100/3 kPa. Il denominatore è non nullo e fissa una sola soluzione; per questo vincolo il dominio delle pressioni finali è 0<p_f<dV₀.
