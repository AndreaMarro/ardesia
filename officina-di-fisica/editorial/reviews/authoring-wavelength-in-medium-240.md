# Authoring DRAFT — wavelength-in-medium-240

Tutti gli 80 prompt originali A240–244 sono stati letti individualmente tramite allowlist id/prompt prima del primo candidato U7-01. Fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U7-01 SHA256 609dec0246ff1cd1b89afed2ea7258c0f65ff8e853735ce9196fe24829fc1233. Ogni caso autonomo è conservato, senza imporre il modello numerico comune: frequenza all’interfaccia 24003, velocità di fase 24004, ordinamento fotonico 24103, soglia a un fotone 24203 e geometria EM 24303. Conteggi N interi e tassi medi sono distinti. Le unità di misura scalate non sono confuse con quantità adimensionali: ogni coefficiente numerico è definito dalla normalizzazione.

Prima di qualunque candidato sono state congelate entrambe le primarie. B per A240–244: SHA 8771a65b67207b7b6f31618ba4ebc9cf17d99b55162f75f4c776cb0f327c975d su 8a82a32527171b68346cf30a933552b2a5f9366f, mai aperta dall’autore. A per B245–249: SHA 6ead7521b5a47b0f1cfa8675ca614070ef3c285b5b0be2815d82b299c3b26e08 su b3932757. Nessuna opzione, chiave, soluzione, SVG o modulo autore B245–249 letto durante l’autoria A.

Lettura integrale delle lezioni reali C5-L06 e C5-L07 al pin Cric 5d1dc8dc7b601aef959d10d564c75462be74708d: interfaccia stazionaria, campi EM, energia per fotone, potenza e frazione trasmessa. Primaria C5-L06 per 240/243 e C5-L07 per 241/242/244; prerequisiti reali del catalogo. Nessuna competenza inventata.

Autore soltanto: DRAFT, revisione scientifica distinta NOT_RUN_BY_AUTHOR, human NOT_RUN, publicationAction NONE. Due processi separati dell’assembler unico hanno prodotto package/binding byte-identici. Import canonico ROOT in sola lettura su SQLite temporaneo: 16 nuovi e poi 0 nuovi/16 invariati; 991 pubblicati e storico conservati. Non è una seconda pipeline e non attribuisce credito di integrazione o SCI.

Asset SVG-only realmente renderizzato in browser nativo, XML e PNG completo effettivamente letti dopo exit 0 reale del processo. Mutex condiviso e guardia ≥2 GiB rispettati. Nessuna UI prodotto locale: test a 320px e relativo marker NOT_RUN e riservati al runner canonico. I testi visibili mostrano grandezze fisiche, non pixel o altre metriche ingegneristiche.

## AR-u7-wavelength-in-medium-01 — La frequenza resta, la distanza fra le creste cambia

Una radiazione monocromatica di lunghezza d’onda nel vuoto λ₀>0 entra in un mezzo trasparente fermo, attraverso un’interfaccia stazionaria. L’indice di fase n è finito e n≥1; alla frequenza considerata v_fase=c/n. La frequenza f resta quella della sorgente durante ciascun passaggio: f=c/λ₀ e λ=v_fase/f. Fra preparazioni si possono cambiare sorgente o mezzo, sempre nel dominio dichiarato. Con λ₀=600 nm e n=2, quanto vale λ in nm?

Procedimento d’autore: Nel vuoto c=λ₀f; nel mezzo v_fase=λf. La stessa f permette di dividere le due relazioni: λ/λ₀=v_fase/c=1/n. Quindi λ=600 nm/2=300 nm. La lunghezza d’onda più corta non indica che la sorgente abbia cambiato frequenza all’interfaccia.

Formule: \lambda=\frac{v_{\rm fase}}f;  \lambda=\frac{\lambda_0}{n};  \lambda=300\,\mathrm{nm}.

Distrattori e controprove: 1200 nm moltiplica per n invece di dividere.600 nm conserva la lunghezza anziché la frequenza;150 nm divide due volte. Il valore zero non segue da indice finito e λ₀ positiva.

Hint: Confronta le due relazioni velocità=lunghezza d’onda per frequenza.

Fonte SHA256 073b131d3d29233a7bbdf57bdd47017d32ae9015cde61e4be5d9fe5e5f9fc7e9. Candidato SHA256 a84e3de2581cf40c48c09bb60c243d2e2f469531f8b19f5253eef300d34f8176. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-wavelength-in-medium-02 — La lunghezza conserva la propria dimensione

Una radiazione monocromatica di lunghezza d’onda nel vuoto λ₀>0 entra in un mezzo trasparente fermo, attraverso un’interfaccia stazionaria. L’indice di fase n è finito e n≥1; alla frequenza considerata v_fase=c/n. La frequenza f resta quella della sorgente durante ciascun passaggio: f=c/λ₀ e λ=v_fase/f. Fra preparazioni si possono cambiare sorgente o mezzo, sempre nel dominio dichiarato. Quale unità misura λ?

Procedimento d’autore: λ è una distanza. Il nanometro è un’unità di lunghezza:1 nm=10⁻⁹ m. Dividere λ₀ per n, che è un numero puro, conserva questa dimensione. La frequenza resta una grandezza distinta.

Formule: 1\,\mathrm{nm}=10^{-9}\,\mathrm m;  [n]=1;  [\lambda]=\mathrm m.

Distrattori e controprove: Hz misura f, m/s la velocità di fase, s il periodo. Il simbolo 1 indica una quantità pura come n, non la lunghezza λ.

Hint: L’indice non aggiunge un’unità alla lunghezza.

Fonte SHA256 96afc45c285747f2fa7cd78536199964a2963b7d1601b0535c7ff8a909b87dfb. Candidato SHA256 cd8f6d7f76142f98a85e3f7bfa93ebf2c49b40860a03a65c7f128ee0102346e8. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-wavelength-in-medium-03 — Che cosa attraversa l’interfaccia senza cambiare

Caso autonomo: luce monocromatica passa dall’aria a un vetro trasparente fermo attraverso un’interfaccia stazionaria. Quale grandezza resta invariata nel passaggio?

Procedimento d’autore: La continuità temporale dell’oscillazione all’interfaccia ferma impone la stessa frequenza sui due lati. Velocità di fase e lunghezza d’onda cambiano con il mezzo. Intensità e ampiezza trasmesse non sono in generale invarianti: possono intervenire riflessione e differente impedenza ottica, anche in assenza di assorbimento.

Formule: f_{\rm aria}=f_{\rm vetro};  \lambda=\frac{v_{\rm fase}}f.

Distrattori e controprove: Conservare λ insieme a f imporrebbe la stessa velocità, contrariamente al cambio di indice. Trasparente non significa trasmissione di tutta l’intensità senza riflessione. L’ampiezza non è la frequenza.

Hint: Pensa al ritmo imposto dalla sorgente a un confine fermo.

Fonte SHA256 b4dbbc24f03848d45ee7a324d9a4adbbd792d0c102940800b266e8fd7778edde. Candidato SHA256 8a103527f731b5871bb9b5a53903998ee9f43b7aba32fe56bc332e316b312fbb. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-wavelength-in-medium-04 — Velocità di fase da un indice assegnato

Caso autonomo: un mezzo trasparente ha n=3/2. Si assume c=3 × 10⁸ m/s. Secondo n=c/v_fase, quanto vale la velocità di fase?

Procedimento d’autore: Moltiplico n=c/v_fase per v_fase e divido per n>0: v_fase=c/n. Dividere per 3/2 equivale a moltiplicare per 2/3. I tre del numeratore e del divisore si cancellano e resta 2 × 10⁸ m/s. Qui non si chiede una velocità di gruppo o una velocità di particelle materiali.

Formule: v_{\rm fase}=\frac cn;  v_{\rm fase}=\frac23c;  v_{\rm fase}=2\cdot10^8\,\mathrm{m/s}.

Distrattori e controprove: (9/2)× 10⁸ m/s moltiplica c per n.3 × 10⁸ ignora il mezzo; (3/2)× 10⁸ copia il numero dell’indice nella velocità. Zero non segue da n finito.

Hint: L’indice maggiore di uno riduce la velocità di fase rispetto a c.

Fonte SHA256 510e7f86558c4667e3ac3145b53f0cd1d8c6d33b2d686a6325576ba2014af54a. Candidato SHA256 c43fa202c7420800b6f91b136dcb79139c916cf3c9209de12478060b2cc2bf18. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-wavelength-in-medium-05 — La lunghezza nel vuoto da quella nel mezzo

Una radiazione monocromatica di lunghezza d’onda nel vuoto λ₀>0 entra in un mezzo trasparente fermo, attraverso un’interfaccia stazionaria. L’indice di fase n è finito e n≥1; alla frequenza considerata v_fase=c/n. La frequenza f resta quella della sorgente durante ciascun passaggio: f=c/λ₀ e λ=v_fase/f. Fra preparazioni si possono cambiare sorgente o mezzo, sempre nel dominio dichiarato. Si misurano λ=300 nm e n=2. Quanto vale λ₀ in nm?

Procedimento d’autore: Moltiplico λ=λ₀/n per n: λ₀=nλ. Due per 300 nm restituisce 600 nm. È la lunghezza della stessa radiazione nel vuoto, non un’ulteriore lunghezza nel vetro.

Formule: \lambda_0=n\lambda;  \lambda_0=600\,\mathrm{nm}.

Distrattori e controprove: 150 nm divide ancora per n;300 nm ignora l’indice.1200 nm applica due volte la moltiplicazione. La sostituzione 600/2=300 nm ricostruisce il dato.

Hint: Nell’inversa devi annullare la divisione per n.

Fonte SHA256 f92c0d8e557e7fe5acb5bbc1379c0bfe6fbe4379101316cb099b616d7ba896fb. Candidato SHA256 5b917e0ccffd25a17fa867a2928540eb1ae1109d2b2321dc9676905107ef9053. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-wavelength-in-medium-06 — L’indice da due lunghezze

Una radiazione monocromatica di lunghezza d’onda nel vuoto λ₀>0 entra in un mezzo trasparente fermo, attraverso un’interfaccia stazionaria. L’indice di fase n è finito e n≥1; alla frequenza considerata v_fase=c/n. La frequenza f resta quella della sorgente durante ciascun passaggio: f=c/λ₀ e λ=v_fase/f. Fra preparazioni si possono cambiare sorgente o mezzo, sempre nel dominio dichiarato. λ₀=600 nm e λ=300 nm. Quanto vale n?

Procedimento d’autore: Isolo n=λ₀/λ. Le unità nm si cancellano e il rapporto 600/300=2 è puro. Il dominio n≥1 richiede λ≤λ₀: una misura λ>λ₀ non sarebbe ammessa nel modello dichiarato.

Formule: n=\frac{\lambda_0}{\lambda};  n=2.

Distrattori e controprove: Un mezzo inverte il rapporto e viola n≥1.300 o 600 copiano una lunghezza invece di formare un rapporto. Non occorre una radice.

Hint: Controlla prima che il rapporto rispetti il dominio dell’indice.

Fonte SHA256 cd2c98088612541b7262cd7c6ef9efb846bfc47c7835a1d97f8f1e84622e9ee5. Candidato SHA256 08e94031695cb1969eef063fed27d074cc6bdc0e24033a5877d27e1bab003092. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-wavelength-in-medium-07 — Un indice minore, stessa sorgente

Una radiazione monocromatica di lunghezza d’onda nel vuoto λ₀>0 entra in un mezzo trasparente fermo, attraverso un’interfaccia stazionaria. L’indice di fase n è finito e n≥1; alla frequenza considerata v_fase=c/n. La frequenza f resta quella della sorgente durante ciascun passaggio: f=c/λ₀ e λ=v_fase/f. Fra preparazioni si possono cambiare sorgente o mezzo, sempre nel dominio dichiarato. A usa λ₀=600 nm, n=2. B mantiene λ₀ e usa n=3/2. Quanto vale λ_B/λ_A?

Procedimento d’autore: A dà 300 nm. In B dividere 600 per 3/2 significa 600·2/3=400 nm. Il rapporto finale/iniziale è 400/300=4/3. Entrambi gli indici rispettano n≥1 e la sorgente è la stessa in queste due prove.

Formule: \lambda_A=300\,\mathrm{nm};  \lambda_B=400\,\mathrm{nm};  \lambda_B/\lambda_A=\frac43.

Distrattori e controprove: 3/4 segue il rapporto degli indici senza invertirlo. Due o mezzo non usano n_B=3/2; uno ignora il cambio di mezzo.

Hint: La lunghezza nel mezzo è inversa all’indice a sorgente fissata.

Fonte SHA256 25b28aa8aa947a0b662bb2e66160339a1d764760804968a965b633143e9e67a7. Candidato SHA256 89e61bfa6f180c8e3d9068d51feead5b3f6d3e0f3ef1d700eea80ced465b6fde. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-wavelength-in-medium-08 — Uno scarto espresso in nanometri

Una radiazione monocromatica di lunghezza d’onda nel vuoto λ₀>0 entra in un mezzo trasparente fermo, attraverso un’interfaccia stazionaria. L’indice di fase n è finito e n≥1; alla frequenza considerata v_fase=c/n. La frequenza f resta quella della sorgente durante ciascun passaggio: f=c/λ₀ e λ=v_fase/f. Fra preparazioni si possono cambiare sorgente o mezzo, sempre nel dominio dichiarato. Con λ₀=600 nm, n=2 si propone λ=600 nm. Quanto vale proposta meno corretto?

Procedimento d’autore: La lunghezza corretta è 300 nm. La proposta supera il risultato di 600−300=300 nm. Il rapporto è invece due, senza unità, e non è la grandezza richiesta.

Formule: \lambda=300\,\mathrm{nm};  e=(600-300)\,\mathrm{nm};  e=300\,\mathrm{nm}.

Distrattori e controprove: −300 cambia l’ordine della sottrazione; due risponde con il rapporto;600 copia la proposta. Zero accetta una lunghezza che non soddisfa λ=λ₀/n.

Hint: Ricava il valore nel mezzo prima di sottrarre.

Fonte SHA256 6f98d0fa4de0e7f2a471a219268354eeef030e917b6da7b930e59fdda0f79503. Candidato SHA256 b5cf3c35e2dec042c2913548c736bd1c73ebb1c57aee1d885d0ec437cfa1cc2d. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-wavelength-in-medium-09 — L’inversa simbolica mantiene n

Una radiazione monocromatica di lunghezza d’onda nel vuoto λ₀>0 entra in un mezzo trasparente fermo, attraverso un’interfaccia stazionaria. L’indice di fase n è finito e n≥1; alla frequenza considerata v_fase=c/n. La frequenza f resta quella della sorgente durante ciascun passaggio: f=c/λ₀ e λ=v_fase/f. Fra preparazioni si possono cambiare sorgente o mezzo, sempre nel dominio dichiarato. λ e n sono noti. Quale relazione isola λ₀?

Procedimento d’autore: Dalla relazione λn=λ₀ segue direttamente λ₀=nλ. n è puro e la dimensione rimane una lunghezza. L’inversa vale nel dominio λ>0, n≥1 della preparazione.

Formule: n\lambda=\lambda_0;  \lambda_0=n\lambda.

Distrattori e controprove: λ/n ripete la legge diretta. n/λ ha dimensione inversa di lunghezza; nλ² ha dimensione di area. λ−n sottrae una lunghezza a un numero puro.

Hint: Moltiplica entrambi i membri della legge diretta per n.

Fonte SHA256 fc788d729bc209df26f9deca00f6cf76897deea5976630d99dbe3645d7cb0ab6. Candidato SHA256 4eb78d8bbc5d52d643ad45b86606bae7bbe604006146dd10c982d78f1c467a6d. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-wavelength-in-medium-10 — Sorgente e mezzo cambiano fra preparazioni

Una radiazione monocromatica di lunghezza d’onda nel vuoto λ₀>0 entra in un mezzo trasparente fermo, attraverso un’interfaccia stazionaria. L’indice di fase n è finito e n≥1; alla frequenza considerata v_fase=c/n. La frequenza f resta quella della sorgente durante ciascun passaggio: f=c/λ₀ e λ=v_fase/f. Fra preparazioni si possono cambiare sorgente o mezzo, sempre nel dominio dichiarato. Fra prove λ₀, B=κ₁λ₀, A e n_B=κ₂n_A, con fattori positivi e n_A, n_B≥1. Quanto vale λ_B/λ_A?

Procedimento d’autore: La nuova lunghezza nel vuoto moltiplica il numeratore e l’indice il denominatore. Nel rapporto restaκ₁/κ₂. Se cambia λ₀ può cambiare la sorgente fra le prove: la frequenza resta invariata solo attraverso ciascuna interfaccia stazionaria, non necessariamente fra sorgenti differenti.

Formule: \lambda_B=\frac{\kappa_1\lambda_{0,A}}{\kappa_2n_A};  \lambda_B/\lambda_A=\kappa_1/\kappa_2.

Distrattori e controprove: Il prodotto rende diretta la dipendenza da n; il reciproco scambia i ruoli e il quadrato di κ₂ non appartiene alla legge. La somma darebbe due per preparazioni identiche. κ₂ può essere minore di uno, purché κ₂n_A≥1.

Hint: Mantieni il vincolo sull’indice finale, non imporre arbitrariamente κ₂≥1.

Fonte SHA256 b0d1ce318c87856fd10d561ee9602781dfebd1122d800b7646c4130eb2865da8. Candidato SHA256 f24344701b0523d0a1a492f9ab640191942ff8de23b22f10d873684b056aae1f. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-wavelength-in-medium-11 — Due variazioni che allungano λ

Una radiazione monocromatica di lunghezza d’onda nel vuoto λ₀>0 entra in un mezzo trasparente fermo, attraverso un’interfaccia stazionaria. L’indice di fase n è finito e n≥1; alla frequenza considerata v_fase=c/n. La frequenza f resta quella della sorgente durante ciascun passaggio: f=c/λ₀ e λ=v_fase/f. Fra preparazioni si possono cambiare sorgente o mezzo, sempre nel dominio dichiarato. A ha λ₀=600 nm, n=2. B ha λ₀=800 nm, n=3/2. Quanto vale λ_B/λ_A?

Procedimento d’autore: A dà 300 nm. B dà 800·2/3=1600/3 nm. Il rapporto è(1600/3)/300=16/9: il fattore 4/3 della lunghezza nel vuoto si moltiplica per il fattore inverso 4/3 dell’indice.

Formule: \lambda_A=300\,\mathrm{nm};  \lambda_B=\frac{1600}{3}\,\mathrm{nm};  \lambda_B/\lambda_A=\frac{16}{9}.

Distrattori e controprove: 9/16 inverte il confronto.4/3 segue solo uno dei due effetti, 3/4 il rapporto diretto degli indici. Uno presume una compensazione invece del rinforzo.

Hint: Tieni la frazione 1600/3 esatta, senza decimali.

Fonte SHA256 fbef45070059ca2b454370515a2b9377c1fcbad8f6954a5276adcfd868110148. Candidato SHA256 314a7869694437de8faf27409c5134ecef43b860c2fa7ef19be7a6378b4b6bb3. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-wavelength-in-medium-12 — Media delle due lunghezze nel mezzo

Una radiazione monocromatica di lunghezza d’onda nel vuoto λ₀>0 entra in un mezzo trasparente fermo, attraverso un’interfaccia stazionaria. L’indice di fase n è finito e n≥1; alla frequenza considerata v_fase=c/n. La frequenza f resta quella della sorgente durante ciascun passaggio: f=c/λ₀ e λ=v_fase/f. Fra preparazioni si possono cambiare sorgente o mezzo, sempre nel dominio dichiarato. Si mediano con uguale peso A:λ₀=600 nm, n=2 e B:λ₀=800 nm, n=3/2. Quanto vale la media di λ?

Procedimento d’autore: Le uscite sono 300 e 1600/3 nm. Scrivo 300=900/3, sommo 2500/3 e dimezzo: media 1250/3 nm. Agli ingressi medi λ₀700 nm, n 7/4 il modello darebbe 400 nm, inferiore alla media delle uscite di 50/3 nm. Nessuna approssimazione è necessaria.

Formule: \overline\lambda=\frac{300+1600/3}{2}\,\mathrm{nm};  \overline\lambda=\frac{1250}{3}\,\mathrm{nm};  \lambda_{\rm dati\ medi}=400\,\mathrm{nm}.

Distrattori e controprove: 400 nm usa gli ingressi medi;2500/3 è la somma senza dimezzare;350/3 è la semidifferenza.1600/3 ripete soltanto la seconda lettura. La media statistica non è una nuova interfaccia attraversata in successione.

Hint: Usa il denominatore comune tre prima di dividere per due.

Fonte SHA256 4efc0e0d92c17a55fd2ce797d406937d56d9a7c2cabd41f89d9328f1430e8c01. Candidato SHA256 e9fbdc8856dbc3d102d820a8020058202d5af08662902f14054e03188fa530c8. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-wavelength-in-medium-13 — Quale indice per il bersaglio

Una radiazione monocromatica di lunghezza d’onda nel vuoto λ₀>0 entra in un mezzo trasparente fermo, attraverso un’interfaccia stazionaria. L’indice di fase n è finito e n≥1; alla frequenza considerata v_fase=c/n. La frequenza f resta quella della sorgente durante ciascun passaggio: f=c/λ₀ e λ=v_fase/f. Fra preparazioni si possono cambiare sorgente o mezzo, sempre nel dominio dichiarato. A ha λ₀, A=600 nm, n_A=2. B usa λ₀, B=800 nm e deve dare λ_B=(16/9)λ_A. Quanto vale n_B/n_A?

Procedimento d’autore: Il bersaglio è(16/9)·300=1600/3 nm. L’inversa dà n_B=800/(1600/3)=3/2, che rispetta n≥1. Divido per n_A 2 e ottengo 3/4. Il fattore dell’indice non coincide con quello della lunghezza.

Formule: \lambda_B=\frac{1600}{3}\,\mathrm{nm};  n_B=\frac32;  n_B/n_A=\frac34.

Distrattori e controprove: 4/3 inverte il rapporto.16/9 copia il bersaglio di λ e 9/16 il suo reciproco. Un indice invariato darebbe 400 nm nella seconda prova, non 1600/3 nm.

Hint: Prima ricava la lunghezza bersaglio, poi isola n_B.

Fonte SHA256 38931c5cda549dbf2cdd94a047ade9a254a6ca6b067e70328260571fb6b6d9d4. Candidato SHA256 7fbd2c75d3e1aa096293d609271a451bfb0d9334eb63dd4ca7f687b5160f6cb5. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-wavelength-in-medium-14 — Un display continuo prima dell’inversa

Una radiazione monocromatica di lunghezza d’onda nel vuoto λ₀>0 entra in un mezzo trasparente fermo, attraverso un’interfaccia stazionaria. L’indice di fase n è finito e n≥1; alla frequenza considerata v_fase=c/n. La frequenza f resta quella della sorgente durante ciascun passaggio: f=c/λ₀ e λ=v_fase/f. Fra preparazioni si possono cambiare sorgente o mezzo, sempre nel dominio dichiarato. Il display continuo adimensionale D=a_cal λ, senza offset, legge 900 per λ₀=600 nm, n=2. Nella nuova prova D=1600, n=3/2. Quanto vale λ₀ nuova in nm?

Procedimento d’autore: Il riferimento ha λ 300 nm: a_cal=900/(300 nm)=3 nm⁻¹. D 1600 decodifica λ 1600/3 nm. Moltiplicando per n 3/2, i tre si cancellano e λ₀=800 nm. Non occorre arrotondare la lettura frazionaria di lunghezza.

Formule: a_{\rm cal}=3\,\mathrm{nm^{-1}};  \lambda=\frac{1600}{3}\,\mathrm{nm};  \lambda_0=800\,\mathrm{nm}.

Distrattori e controprove: 2400 nm usa il display come lunghezza e poi moltiplica per n.1600 nm si ferma alla lettura senza tararla;600 nm ripete il riferimento. La lettura non è un conteggio di lunghezze intere.

Hint: Decodifica λ prima della moltiplicazione per l’indice.

Fonte SHA256 dbfcd7a4826ed7527ea5cab652f4275bfe11ed62bb5c28784ad7aaf7d493f283. Candidato SHA256 5f70ca3f5940b3568df75acca5ffea48e9b41c023642d1c40f8699a1ece21255. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-wavelength-in-medium-15 — Due riferimenti separano il guadagno dallo zero

Una radiazione monocromatica di lunghezza d’onda nel vuoto λ₀>0 entra in un mezzo trasparente fermo, attraverso un’interfaccia stazionaria. L’indice di fase n è finito e n≥1; alla frequenza considerata v_fase=c/n. La frequenza f resta quella della sorgente durante ciascun passaggio: f=c/λ₀ e λ=v_fase/f. Fra preparazioni si possono cambiare sorgente o mezzo, sempre nel dominio dichiarato. D=a_cal λ+b_cal è un display continuo. A:λ₀=600 nm, n=2, D=601. B:λ₀=800 nm, n=3/2, D=3203/3. C:n=2, D=801. Quanto vale λ₀, C in nm?

Procedimento d’autore: Le lunghezze di riferimento sono 300 e 1600/3 nm. La differenza di letture è(3203−1803)/3=1400/3, mentre quella fisica è(1600−900)/3=700/3 nm. Il rapporto dà a_cal 2 nm⁻¹ e b_cal 1. La lettura 801 indica λ_C 400 nm, quindi λ₀, C 800 nm.

Formule: a_{\rm cal}=2\,\mathrm{nm^{-1}};  b_{\rm cal}=1;  \lambda_C=400\,\mathrm{nm};  \lambda_{0,C}=800\,\mathrm{nm}.

Distrattori e controprove: 801 nm omette la sottrazione dell’offset e predice D 802.1600 nm sottrae b ma omette la divisione per il guadagno.400 nm si ferma alla lunghezza nel mezzo, senza tornare al vuoto.

Hint: Le differenze eliminano l’offset e mantengono frazioni esatte.

Fonte SHA256 548a8b63544df1587fe2d58a984806b96bd04a6df49592bd53b8145ba51dc323. Candidato SHA256 ce3b1b94686f7d4f0ed8d83a8031240def1a857371db73c07c0720b0cdf336ee. Skill reale C5-L06. Review distinta e human NOT_RUN.

## AR-u7-wavelength-in-medium-16 — Una misura che non fissa l’indice

Una radiazione monocromatica di lunghezza d’onda nel vuoto λ₀>0 entra in un mezzo trasparente fermo, attraverso un’interfaccia stazionaria. L’indice di fase n è finito e n≥1; alla frequenza considerata v_fase=c/n. La frequenza f resta quella della sorgente durante ciascun passaggio: f=c/λ₀ e λ=v_fase/f. Fra preparazioni si possono cambiare sorgente o mezzo, sempre nel dominio dichiarato. Fra preparazioni λ₀=(300 nm)n e si misura anche λ=300 nm. Quante coppie (λ₀, n) sono possibili nel dominio n≥1?

Procedimento d’autore: Inserendo il vincolo in λ=λ₀/n si ottiene sempre 300 nm. La misura è ridondante: n 1 con λ₀300 nm e n 2 con λ₀600 nm sono due esempi, ma tutti gli n reali finiti almeno uno danno una coppia. Non è un conteggio di fotoni e n non è imposto intero.

Formule: \lambda_0=(300\,\mathrm{nm})n;  \lambda=300\,\mathrm{nm};  (\lambda_0,n)=(300\,\mathrm{nm},1).

Distrattori e controprove: Una o due coppie richiederebbero un altro vincolo indipendente. La risposta “Nessuna coppia” è smentita dagli esempi. Imporre indici interi non è previsto dal modello e perderebbe soluzioni ammesse.

Hint: Controlla se λ si semplifica dopo la sostituzione.

Fonte SHA256 111054b500367808fa6dd2060c932afe10b5f0ea47efeea3b02b3385d8ddbac8. Candidato SHA256 cbe2c80320ed5e32746d63354e175a50ecfb17df0f59da9ddbc5a24f8a6a4ea2. Skill reale C5-L06. Review distinta e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 cd45ead7fa602df6b5b7ed91978bae8697195ebb1266740d055dd8dcd68b17a3. Package file SHA256 27519f0837fe526d03f8a58b7655efe1e8de424d3aebbf77ea63eca88e19f04e. Binding file SHA256 c1d3437c20c277ca5e5e674cb7c7079021ec3b83192a9d7927006d6ca0f8b7ee. Strutturale SHA256 4c77ce10cca1d5b2170659950a426d9407e02afbbb6cc91a307d9e2a7cd900a2. Manifest asset-only SHA256 70b6ca2d81dce27536d132d6a4843777e44f0afc75e0cc9a4e015c45b2afd05d.

Nessun registry, ledger, runtime, checkpoint o Git ROOT modificato. Il revisore B deve leggere questi finali contro la propria primaria distinta prima del congelamento scientifico.

Lettura geometrica d’autore: la distanza fra fronti equivalenti è180 coordinate per600 nm nel vuoto e90 per300 nm nel mezzo, stessa scala0,3 coordinate/nm. Le due righe sono regioni distinte e non fotografie successive della medesima regione. Le barre135/240/187,5 coordinate rappresentano300/1600/3/1250/3 nm, scala comune9/20 coordinate/nm; i numeri decimali delle coordinate non sono approssimazioni dei risultati fisici. Il grafico finale a n2 ha x=150+λ₀[nm]/2 e y=1280−λ[nm]/2: il punto(450,1130) è(600nm,300nm), l’estremo(550,1080) è(800nm,400nm). L’origine aperta è esclusa dal dominio positivo. Tutte le etichette e le punte sono state lette nel PNG completo; nessuna coordinata intrinseca è visibile agli studenti.

## Rilettura pedagogica del solo record15 —26 novembre

Su finding Root, il feedback finale distingue in tre frasi complete i valori proposti801 nm,1600 nm e400 nm. La prima controprova specifica D=802 anziché801; la seconda omette il guadagno, la terza si ferma alla lunghezza nel mezzo. Nessun dato, risposta800, formula, SVG o altro15 record mutato. Edizione precedente e report SCI indipendenti conservati byte per byte nella cartella feedback15-superseded. Due nuove assembly byte-identiche e import canonico reale16→0/16,991 pubblicati/storico invariati. Asset invariato: nessun nuovo render o UI attribuito. Review scientifica e pedagogica distinta della nuova frase PENDING_B; human NOT_RUN, pubblicazione NONE.
