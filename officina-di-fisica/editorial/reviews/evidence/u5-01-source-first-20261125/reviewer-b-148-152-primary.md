# Derivazioni indipendenti dai soli prompt U5-01 — A148–152

Pin sorgente: 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605. SHA256 del file U5-01.json: 3eed8f64e97002c31d1e55bb612508d5e71766fee62f3d02fc6c3e994b6be863. Estratto dei soli 80 ID, prompt, reasoningTask e ipotesi: /private/tmp/cric-a148-152-source-prompts-before-keys.json, SHA256 f52df0ad54f58bd96d881de780dca350c870d74c77d0ace920d50585ae94659d.

Questa primaria è stata scritta dopo la lettura individuale di tutti gli 80 prompt e prima dell’apertura di candidate, opzioni o chiavi dell’autore A. Nessun giudizio sui byte candidati non ancora letti. Calcoli sorgente formali e condizioni fisiche sono distinti; le eventuali parametrizzazioni candidate saranno ricalcolate separatamente. Non è approvazione umana.

## 148 — temperature-difference

La conversione affine è T_K=t_C+5463/20. Due punti Celsius vanno convertiti prima dei rapporti assoluti; nella loro sottrazione l’offset si annulla. Un incremento in K ha la stessa ampiezza dell’incremento in gradi Celsius. I fattori imposti alle letture numeriche Celsius non sono fattori della temperatura assoluta.

01: (40+273,15)−(20+273,15)=20 K.
02: l’intervallo ha dimensione di temperatura; K è unità SI. Verificare le alternative finali senza confondere una capacità termica.
03: il passaggio 20→40 °C dà +20 K; 313,15/293,15=6263/5863 non è due. La lettura Celsius raddoppia, la temperatura assoluta no.
04: 60−20=40 K, contro 20 K iniziali: aumento di 20 K e fattore due.
05: t_c=20+20=40 °C; somma di punto e intervallo con unità affine coerente.
06: t_f=40−20=20 °C.
07: ΔT_A=20 K, ΔT_B=30 K; rapporto 3/2.
08: proposta meno corretta=40−20=20 K.
09: t_c numerico Celsius=t_f numerico Celsius+ΔT numerico kelvin. È una relazione fra letture esplicitate; fisicamente punto più intervallo.
10: rapporto (κ₁ t_c−κ₂ t_f)/(t_c−t_f). Dominio in entrambe le prove: letture positive e caldo maggiore di freddo; nessuna interpretazione come scala assoluta dei fattori.
11: ΔT_B=60−10=50 K; rapporto 50/20=5/2.
12: media (20+50)/2=35 K; coincide qui con differenza delle letture medie (50−15) per linearità.
13: bersaglio 50 K con t_c,B=60 °C implica t_f,B=10 °C; rapporto fra le letture Celsius 10/20=1/2.
14: q=60/(20 K)=3 K⁻¹; S=150 dà ΔT=50 K; con t_f=10 °C si ricava t_c=60 °C.
15: q=(101−41)/(50−20)=2 K⁻¹; b=1. S=81 implica ΔT=40 K; t_c=60 °C.
16: vincolo fra letture t_c=2t_f, differenza 20 K: t_f=20 °C e t_c=40 °C. Non è T_c,K=2T_f,K.

## 149 — ideal-gas-pressure

Con C=nR=1 J/K, p=CT/V e kPa·L=J. T è assoluta positiva, p assoluta positiva, V positivo; C è proprietà del campione chiuso, non valore universale di R. Il sorgente usa formalmente T=1 K in alcuni casi: il risultato del modello non certifica l’applicabilità fisica di un gas reale a quel regime. Verificare eventuale riparametrizzazione dichiarata dell’autore.

01: 300 J/3 L=100 kPa.
02: pressione ha dimensione energia per volume; Pa e kPa sono compatibili, secondo le alternative finali.
03: dagli stati del gas ideale la variazione di U dipende dalle temperature per composizione fissata; Q=ΔU+W richiede il percorso del lavoro. Stati uguali non fissano sempre Q; due cammini con W diversi hanno Q diversi dello stesso scarto.
04: T raddoppiata a V fisso dà 200 kPa anziché 100 kPa.
05: T=pV/C=100×3/1=300 K.
06: V=CT/p=300/100=3 L.
07: V raddoppia a T fisso, p_B=50 kPa; rapporto 1/2.
08: a densità elevata volume molecolare e interazioni intermolecolari trascurati possono diventare rilevanti. Non si deduce un verso universale dello scarto senza un modello ulteriore; nessuna transizione di fase è assunta.
09: T=pV/C come quantità fisiche. Solo nelle unità e nel C assegnati i valori numerici soddisfano T[K]=p[kPa]V[L].
10: rapporto κ₁/κ₂, entrambi positivi.
11: nel sorgente B ha T=1 K e V=1 L, quindi p_B=1 kPa e rapporto 1/100. Ricalcolare ogni sostituzione candidata.
12: media sorgente (100+1)/2=101/2 kPa. Il modello agli ingressi medi darebbe 301/4 kPa, diverso.
13: bersaglio 1 kPa con T_B=1 K implica V_B=1 L; rapporto 1/3.
14: q=3 kPa⁻¹; S=3 implica p=1 kPa; V=1 L implica T=1 K nel sorgente formale.
15: q=(3−201)/(1−100)=2 kPa⁻¹; b=1. S=401 dà p=200 kPa, V=3 L dà T=600 K.
16: T=cV, c=100 K/L, rende p=Cc=100 kPa per ogni V>0. Misura ridondante e infinite coppie; esempi positivi (V=3 L,T=300 K) e (6 L,600 K).

## 150 — gas-density

Da pV=nRT e m=nM si ottiene ρ=pM/(RT). Per M=32 g/mol e R=8 J/(mol·K) prescritti, M/R=4 g·K/J. La forma numerica ρ[g/L]=4p[kPa]/T[K] usa kPa·L=J. 1 g/L=1 kg/m³. La composizione resta fissa e non si promuove l’approssimazione R=8 a costante universale esatta.

01: 4×80/320=1 g/L.
02: dimensione massa per volume; identificare l’unica alternativa compatibile.
03: legge ρ=pM/(RT); il coefficiente quattro della forma numerica non è adimensionale se si lavora con quantità fisiche.
04: p=160 kPa a T=320 K dà 2 g/L; raddoppia.
05: p=ρRT/M=80 kPa.
06: T=pM/(Rρ)=320 K.
07: dimezzare T a p fisso dà ρ_B=2 g/L, rapporto due.
08: energia cinetica traslazionale media per molecola è proporzionale a T; 900/300=3. Nessuna radice: non è rapporto di velocità quadratiche medie.
09: p=ρRT/M, cioè p[kPa]=ρ[g/L]T[K]/4 nelle unità dichiarate.
10: rapporto κ₁/κ₂.
11: B dà 4×160/160=4 g/L; rapporto quattro.
12: media (1+4)/2=5/2 g/L; agli ingressi medi 4×120/240=2 g/L, distinto.
13: a p doppia per avere ρ quadrupla serve T dimezzata: rapporto 1/2.
14: q=3 L/g; S=12 dà ρ=4 g/L. A T=160 K si ricava p=160 kPa.
15: q=(9−3)/(4−1)=2 L/g; b=1. S=5 dà ρ=2 g/L, T=320 K dà p=160 kPa.
16: p=cT con c=(1/4) kPa/K rende ρ=1 g/L per tutte le T positive del modello. Infinite coppie, ad esempio (80 kPa,320 K) e (40 kPa,160 K).

## 151 — isothermal-chambers

Si conserva il numero totale di moli del sistema dei due recipienti. n_totRT=p₁V+p₂V=p_f(2V), quindi p_f=(p₁+p₂)/2. Il volume uguale e la stessa T iniziale/finale sono necessari per la semisomma non pesata. Il collegamento con differenza finita di pressione non è reversibile. Le molecole non conservano l’etichetta del recipiente di provenienza; equilibrio macroscopico finale a p,T comuni e volumi uguali dà n_finale,1=n_finale,2=n_tot/2.

01: p_f=(100+200)/2=150 kPa.
02: unità di pressione; leggere le alternative finali.
03: semisomma, non somma né media geometrica.
04: con entrambe le pressioni 200 kPa, p_f=200 kPa; aumento da 150 kPa e non raddoppio.
05: p₁=2p_f−p₂=300−200=100 kPa.
06: in ciascun recipiente si trova metà del totale nel modello macroscopico; frazione 1/2, indipendente dalla distribuzione iniziale.
07: p_f,B=200 kPa contro 150 kPa, rapporto 4/3.
08: proposta 300 kPa meno corretta 150 kPa=150 kPa.
09: p₁=2p_f−p₂; p₁>0 impone 2p_f>p₂. Non basta che le letture singole siano positive.
10: rapporto (κ₁p₁+κ₂p₂)/(p₁+p₂); denominatore positivo, media pesata dei fattori.
11: B dà 250 kPa; rapporto 250/150=5/3.
12: media (150+250)/2=200 kPa; coincide con semisomma degli ingressi medi per linearità.
13: bersaglio 250 kPa con p₁,B=200 kPa implica p₂,B=300 kPa; rapporto 300/200=3/2.
14: q=450/(150 kPa)=3 kPa⁻¹; S=750 dà p_f=250 kPa; p₂=300 kPa dà p₁=200 kPa.
15: q=(501−301)/(250−150)=2 kPa⁻¹; b=1. S=401 dà p_f=200 kPa; p₂=200 kPa dà p₁=200 kPa.
16: p₁=p₂/2 implica p_f=3p₂/4. Da 150 kPa segue p₂=200 kPa, p₁=100 kPa.

## 152 — isothermal-work

Integrando il lavoro reversibile p(V)=nRT/V si ottiene W=C ln r con C=nRT>0. W₂=C ln2>0 è energia caratteristica di questo campione e temperatura. r>0 è adimensionale; r>1 dà espansione e W>0, r=1 dà W=0, 0<r<1 compressione e W<0. W₂ non è il lavoro sul gas, ma il lavoro compiuto dal gas nel raddoppio.

01: r=2 dà W=W₂=10 J.
02: lavoro in J; i logaritmi hanno argomenti adimensionali.
03: W=W₂ ln(r)/ln2; non W₂r e non ln di una quantità dimensionata.
04: W₂ doppio a r=2 dà W=20 J.
05: W₂=W ln2/lnr=10 J con r=2. In generale r≠1; W e lnr devono avere lo stesso segno per W₂>0.
06: r=2^(W/W₂)=2. Resta positivo per ogni lavoro reale; la condizione W>0 seleziona r>1.
07: r_B=4 dà W_B=20 J contro 10 J, rapporto 2.
08: proposta 20 J meno corretta 10 J=10 J.
09: W₂=W ln2/lnr; r=1 è un limite di non identificabilità, non una divisione ammessa. Per r=1,W=0 ogni W₂>0 soddisfa la misura; per r=1,W≠0 nessuno.
10: rapporto κ₁ ln(κ₂r)/lnr con r≠1. Il prodotto κ₂r deve essere positivo, garantito da positività. Il lavoro di B può cambiare segno o annullarsi; non si usa κ₁κ₂.
11: B con W₂=20 J,r=4 dà 40 J; rapporto 4.
12: media dei lavori (10+40)/2=25 J. Modello agli ingressi medi: 15 ln3/ln2 J, diverso; uguaglianza richiederebbe 27=32. Non occorrono logaritmi decimali.
13: bersaglio 40 J con W₂,B=20 J richiede log₂r_B=2, quindi r_B=4 e r_B/r_A=2.
14: q=3 J⁻¹; S=120 dà W_B=40 J. Con r=4 si ricava W₂,B=20 J.
15: q=(81−21)/(40−10)=2 J⁻¹; b=1. S=41 dà W=20 J, r=2 implica W₂=20 J.
16: W_hot=C_h ln4; W_cold=−(C_h/2)ln4=−W_hot/2; W_isochore=0. W_net=W_hot/2=12 J implica W_hot=24 J. Per gas ideale lungo l’isoterma ΔU=0, quindi Q_hot,isoterma=24 J. Non è il calore assorbito totale del ciclo: la successiva isocora di riscaldamento assorbe a sua volta energia se non è assegnato un rigeneratore. Non chiamare questo ciclo Carnot: ha isocore, non adiabatiche.
