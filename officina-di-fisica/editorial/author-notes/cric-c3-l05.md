# cric-c3-l05

Dieci problemi Cric distinti; nessuna espansione in varianti. Fonte immutabile `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C3.json`. ID, famiglia, difficoltà e metadati protetti originali conservati; versione nuova = originale + 1, baseVersion originale.

Competenza e prerequisiti riletti nella lezione reale del medesimo pin. Assembler canonico unico, dipendenza esterna congelata 23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5; nessun secondo ETL.

Doppia assembly byte-identica e importatore canonico su SQLite temporaneo: 10 salvati, ripetizione 0/10, dieci live originali e 991 pubblicati/storico invariati. Immagine SVG-only completa letta dopo processo reale exit 0; non è un collaudo del prodotto. Review scientifica propria, approvazione umana e UI prodotto NOT_RUN; pubblicazione NONE.

## C3-Q041

Compito: Un ventilatore accelera il raffreddamento di una piastra più calda dell’aria circostante. Quale meccanismo viene potenziato direttamente dal moto imposto all’aria?

Procedimento: Il ventilatore impone una corrente di aria che trasporta energia e rinnova il fluido vicino alla piastra. Questo potenzia la convezione forzata. Nel sottile strato vicino alla superficie interviene anche la conduzione, ma il cambiamento introdotto dal ventilatore è il moto del fluido.

Passaggi esatti: `\text{convezione forzata}`.

Distrattori: Il vuoto non contiene il fluido che il ventilatore mette in moto. Fusione e isolamento non seguono dal raffreddamento osservato. L’irraggiamento può coesistere, ma non è il meccanismo direttamente imposto dalla corrente d’aria.

Aiuto: Identifica il trasferimento che accompagna il movimento del fluido.

Famiglia: `vento-sulla-superficie`; difficoltà 1; versione 2/base 1.

## C3-Q042

Compito: Una lastra omogenea ha conducibilità 0,040 W/(m·K) e area 0,75 m². In regime stazionario unidimensionale le facce differiscono di 20 K e le perdite laterali sono trascurabili. Qual è lo spessore minimo, in cm, per non superare una potenza condotta di 12 W?

Procedimento: La legge stazionaria è P=λAΔT/s. Isolo s=λAΔT/P: 0,040·0,75·20=0,60 W·m. Dividendo per 12 W ottengo 0,050 m, cioè 5 cm. Uno spessore maggiore ridurrebbe ulteriormente la potenza a parità delle altre condizioni.

Passaggi esatti: `s=\frac{\lambda A\Delta T}{P}\qquad s=0{,}050\,\mathrm m\qquad s=5\,\mathrm{cm}`.

Distrattori: 0,050 cm cambia l’unità senza convertire i metri. 50 cm aggiunge un fattore dieci. Aumentare lo spessore non aumenta questa potenza: riduce il gradiente di temperatura.

Aiuto: Isola lo spessore e mantieni i metri fino all’ultima conversione.

Famiglia: `spessore-di-progetto`; difficoltà 2; versione 2/base 1.

## C3-Q043

Compito: Due superfici separate da vuoto scambiano energia termica. Quale meccanismo può attraversare lo spazio vuoto?

Procedimento: La radiazione elettromagnetica può propagarsi nel vuoto e trasportare energia da una superficie all’altra. Conduzione e convezione, come meccanismi materiali, richiedono invece materia lungo il percorso. Il quesito riguarda il tratto vuoto fra le superfici.

Passaggi esatti: `\text{irraggiamento}`.

Distrattori: Nel vuoto non c’è un fluido che possa circolare. Il contatto diretto non attraversa uno spazio vuoto. La fusione è un cambiamento di fase di un materiale, non dello spazio.

Aiuto: Cerca un trasporto energetico che non richieda un mezzo materiale.

Famiglia: `trasmissione-nel-vuoto`; difficoltà 1; versione 2/base 1.

## C3-Q044

Compito: Una lastra conduce 9 W in regime stazionario. A parità di conducibilità e differenza di temperatura si raddoppiano sia area sia spessore. Qual è la nuova potenza in W?

Procedimento: La potenza è proporzionale al rapporto A/s. Nella seconda configurazione il rapporto è (2A)/(2s)=A/s. I due fattori si cancellano e la potenza resta 9 W. Il materiale e la differenza termica restano quelli assegnati.

Passaggi esatti: `\frac{P_2}{P_1}=\frac{A_2}{A_1}\frac{s_1}{s_2}\qquad \frac{P_2}{P_1}=2\frac12=1\qquad P_2=9\,\mathrm W`.

Distrattori: 18 W considera soltanto l’area; 4,5 W soltanto lo spessore. 36 W tratta anche lo spessore come proporzionalità diretta. Non basta contare due raddoppi: occorre controllare dove entrano nella legge.

Aiuto: Forma il rapporto delle due potenze prima di sostituire i dati.

Famiglia: `doppia-area-e-doppio-spessore`; difficoltà 1; versione 2/base 1.

## C3-Q045

Compito: Due manici hanno uguali area di sezione e lunghezza e la stessa differenza di temperatura positiva ΔT>0 fra le estremità. Le due conducibilità sono positive; il manico metallico ha quella maggiore. In regime stazionario unidimensionale, con perdite laterali trascurabili, quale conduce più potenza?

Procedimento: Con geometria e differenza termica comuni, la legge P=λAΔT/ℓ lascia come unico fattore variabile la conducibilità. Il manico con λ maggiore conduce più potenza. Stazionario significa profilo termico invariato nel tempo, non assenza di trasferimento energetico.

Passaggi esatti: `\frac{P_{\rm metallo}}{P_{\rm altro}}=\frac{\lambda_{\rm metallo}}{\lambda_{\rm altro}}>1`.

Distrattori: La stessa geometria non elimina il ruolo del materiale. Una conducibilità minore aumenta la resistenza termica. La temperatura iniziale non determina il flusso dello stato stazionario con estremità fissate.

Aiuto: Elimina i fattori comuni e confronta la conducibilità.

Famiglia: `manico-di-metallo-e-manico-di-legno`; difficoltà 1; versione 2/base 1.

## C3-Q046

Compito: Una superficie passa da 300 a 450 K mantenendo area A>0 ed emissività ε>0 positive e costanti. Per la potenza totale emessa usa P=εσAT⁴ e trascura in questo confronto l’assorbimento. Qual è P_f/P_i?

Procedimento: Il rapporto delle temperature assolute è 450/300=3/2. Gli altri fattori della legge si cancellano. Elevo il rapporto alla quarta: (3/2)⁴=81/16. Il risultato è adimensionale e riguarda l’emissione, non il saldo netto con un ambiente.

Passaggi esatti: `\frac{P_f}{P_i}=\left(\frac{T_f}{T_i}\right)^4\qquad \frac{P_f}{P_i}=\left(\frac32\right)^4=\frac{81}{16}`.

Distrattori: 3/2 usa una legge lineare; 9/4 applica soltanto il quadrato. 16/81 inverte il rapporto finale/iniziale. Il valore 1 ignorerebbe il cambiamento termico. Le letture Celsius non possono sostituire i kelvin in questa quarta potenza.

Aiuto: Semplifica il rapporto termico prima di elevarlo alla quarta.

Famiglia: `quanto-cambia-la-potenza-emessa`; difficoltà 2; versione 2/base 1.

## C3-Q047

Compito: Una parete mantiene nel tempo lo stesso profilo di temperatura e trasmette una potenza termica costante. Come si definisce il regime?

Procedimento: Nel regime stazionario i campi macroscopici non cambiano nel tempo. Una differenza di temperatura può comunque sostenere un flusso costante: la potenza entrante e quella uscente si bilanciano senza accumulo nel materiale. L’equilibrio termico senza flusso è una condizione diversa.

Passaggi esatti: `\frac{\partial T}{\partial t}=0\qquad P_{\rm entrante}=P_{\rm uscente}`.

Distrattori: Stazionario non significa adiabatico e non impone temperatura uniforme. Un regime periodico torna uguale dopo un intervallo ma può variare dentro il periodo. L’energia interna non deve essere nulla.

Aiuto: Distingui assenza di variazione temporale da assenza di trasferimento.

Famiglia: `regime-senza-accumulo`; difficoltà 1; versione 2/base 1.

## C3-Q048

Compito: Un liquido che si dilata scaldandosi è riscaldato dal basso in gravità. Quale fenomeno può innescare una circolazione naturale?

Procedimento: A parità di massa la dilatazione aumenta il volume e riduce la densità. Una regione calda sotto fluido più denso può risalire per effetto del galleggiamento, mentre altre regioni scendono. È il meccanismo della convezione naturale; il suo sviluppo effettivo dipende anche da viscosità, diffusione e geometria, quindi non si afferma che avvenga sempre.

Passaggi esatti: `\rho=m/V\qquad V\uparrow\ \Longrightarrow\ \rho\downarrow`.

Distrattori: La dilatazione assegnata non aumenta la densità. Irraggiamento e conduzione possono coesistere ma non sono di per sé la circolazione descritta. La presenza di conduzione non vieta in assoluto il moto convettivo.

Aiuto: Segui come cambia la densità del liquido riscaldato a massa fissata.

Famiglia: `il-fluido-caldo-sale-sempre`; difficoltà 2; versione 2/base 1.

## C3-Q049

Compito: Attraverso una lastra piana omogenea di area 0,40 m² e spessore 0,020 m passano 18 W fra facce a 30 e 15 °C. Il regime è stazionario e unidimensionale, senza perdite laterali. Trova λ in W/(m·K).

Procedimento: La differenza delle letture è 15 K. Isolando λ dalla legge P=λAΔT/s ottengo Ps/(AΔT). Il numeratore vale 18·0,020=0,36 W·m; il denominatore 0,40·15=6 m²·K. Il rapporto è 0,060 W/(m·K).

Passaggi esatti: `\Delta T=15\,\mathrm K\qquad \lambda=\frac{Ps}{A\Delta T}\qquad \lambda=\frac{0{,}36}{6}\,\mathrm{W/(m\,K)}\qquad \lambda=0{,}060\,\mathrm{W/(m\,K)}`.

Distrattori: Usare 30 al posto di 30−15 confonde una lettura con un intervallo termico. Invertire il rapporto fra spessore e area non ricostruisce 18 W nella legge iniziale. Lo spessore è già in metri e non va convertito una seconda volta.

Aiuto: Scrivi prima la differenza termica e isola λ senza invertire il fattore di spessore.

Famiglia: `calibrare-la-conducibilita`; difficoltà 2; versione 2/base 1.

## C3-Q050

Compito: Una piccola superficie con emissività positiva è in equilibrio radiativo in una grande cavità isoterma alla sua stessa temperatura assoluta T>0. Quale descrizione distingue emissione e bilancio energetico?

Procedimento: All’equilibrio radiativo il trasferimento netto è nullo perché emissione e assorbimento si compensano. Per una superficie con emissività positiva a T>0 l’emissione non è nulla. La cavità alla stessa temperatura fornisce l’assorbimento corrispondente, mantenendo il saldo energetico zero.

Passaggi esatti: `P_{\rm netta}=P_{\rm emessa}-P_{\rm assorbita}\qquad P_{\rm emessa}=P_{\rm assorbita}\qquad P_{\rm netta}=0`.

Distrattori: Saldo nullo non significa assenza dei due processi. Un’emissione senza assorbimento raffredderebbe la superficie; un assorbimento senza emissione la scalderebbe. Le due potenze sono moduli non negativi, mentre il saldo può avere segno.

Aiuto: Distingui i singoli flussi dal loro saldo.

Famiglia: `emissione-e-bilancio-radiativo`; difficoltà 2; versione 2/base 1.
