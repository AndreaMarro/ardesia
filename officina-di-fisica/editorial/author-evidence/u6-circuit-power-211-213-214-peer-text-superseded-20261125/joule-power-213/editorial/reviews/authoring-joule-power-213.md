# Authoring DRAFT — joule-power-213

Letti individualmente tutti i 16 prompt del presente lotto e completate separatamente le 80 derivazioni primarie B215–219 della fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U6-03 SHA256 0bd13e1748174df8c30e06641ad153b8e44ab98df47f31c9f1aba7f925f88077. I compiti e gli ID originali sono conservati e si rendono espliciti segni, domini, conversioni e svolgimenti. Riletti i testi reali C4-L05/L06/L07 per corrente, legge di Ohm, topologia dei nodi e distinzione da capacità ed energia elettrostatica. Prima dei candidati A, il revisore distinto B ha confermato primaria prompt-only 80 SHA256 5a11a0eae02cb2aaf503d979af679d9a586f1dc8572134ca7523f895ca07e509; quella primaria non è stata aperta dall’autore. La primaria A dei futuri 80 B215–219 è congelata separatamente SHA256 4c49ff1e2020d073891686e5289e263561531a9b81e84e2f0fa9c8648dc90f4b, senza esposizione U6 a chiavi altrui.

Autore soltanto: DRAFT; revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica.

Due assemblaggi in processi separati dell’assembler unico producono gli stessi byte package e binding. Importatore canonico ROOT su SQLite temporaneo: 16 nuovi, poi 0 nuovi e 16 invariati; tutti i 991 pubblicati e le versioni storiche rimangono invariati. Questo è collaudo tecnico strutturale e non giudizio scientifico.

UI prodotto NOT_RUN: per mandato dell’integratore non si avvia il browser dell’app durante il vincolo operativo sui replay locali. Non è stato creato o riusato alcun marker UI. Il diagramma SVG è stato letto come XML e sono state controllate le proporzioni intrinseche dei dati. La resa nativa Quick Look a piena altezza è stata realmente prodotta e letta, con log e PNG conservati: è asset-only, non un replay dell’app o una prova di layout a 320 px. Nessun CSS, runtime, registro, checkpoint o file candidato ROOT modificato.

## AR-u6-joule-power-01 — Potenza assorbita dal resistore

Un resistore ohmico ha R>0 finita, mantenuta costante durante ciascuna prova. Una corrente continua di modulo I>0 lo attraversa, entrando nel morsetto a potenziale maggiore: la caduta positiva è V=RI. La potenza assorbita P=VI=I²R viene convertita termicamente nel resistore. Non si chiede la velocità di aumento della sua temperatura: può scambiare calore con l’ambiente mantenendo R fissata. Fra preparazioni I e R possono cambiare e il generatore si adatta alla caduta richiesta. Con I=2 A e R=3 Ω, quanto vale P in W?

Procedimento d’autore: La caduta è V=IR=6 V. Moltiplicando per la corrente si trova P=VI=6·2 W=12 W. Equivalentemente I²R=(2 A)²·3 Ω=12 W. Si eleva al quadrato il valore della corrente, non quello della resistenza.

Passaggi: V=IR;  V=6\,\mathrm V;  P=VI;  P=12\,\mathrm W.

Distrattori: Sei W usa IR, che in realtà dà 6 V. Quattro copia I² senza R; diciotto usa IR² e trentasei quadra anche la resistenza. Queste operazioni non ricostruiscono insieme potenza e legge di Ohm.

Hint: Trova prima la caduta oppure usa direttamente il quadrato della corrente.

Fonte canonica SHA256 d059b26df6785caac394488a4245bbe87a1a5a34b93e3d5cfd065475b6a8a17d. Candidato SHA256 0f317e910e889f6e600e9b51abf71042e58d2db7e3d12aa69be314d81b7eae2d. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-power-02 — Energia per unità di tempo

Un resistore ohmico ha R>0 finita, mantenuta costante durante ciascuna prova. Una corrente continua di modulo I>0 lo attraversa, entrando nel morsetto a potenziale maggiore: la caduta positiva è V=RI. La potenza assorbita P=VI=I²R viene convertita termicamente nel resistore. Non si chiede la velocità di aumento della sua temperatura: può scambiare calore con l’ambiente mantenendo R fissata. Fra preparazioni I e R possono cambiare e il generatore si adatta alla caduta richiesta. Quale unità esprime P?

Procedimento d’autore: La potenza misura energia trasformata nell’unità di tempo: W=J/s. Dal prodotto VI si ottiene anche V·A=W. I joule da soli misurano energia, che richiederebbe specificare anche una durata per una potenza costante.

Passaggi: [P]=\mathrm V\cdot\mathrm A;  1\,\mathrm W=1\,\mathrm{J/s}.

Distrattori: J misura energia, V tensione, Ω resistenza e A corrente. Nessuna di queste unità singole sostituisce il watt nel quesito sulla potenza.

Hint: Distingui un trasferimento energetico dal suo ritmo temporale.

Fonte canonica SHA256 182f0ea926ab0a59a0d772a98bb07590d52f82dd24318d7e2a3d06e439761543. Candidato SHA256 47d9b353f8a08ddfd0cc07861722cb093c0a4aefe28341079c1caa06c4e55f99. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-power-03 — Da VI alla legge di Joule

Un resistore ohmico ha R>0 finita, mantenuta costante durante ciascuna prova. Una corrente continua di modulo I>0 lo attraversa, entrando nel morsetto a potenziale maggiore: la caduta positiva è V=RI. La potenza assorbita P=VI=I²R viene convertita termicamente nel resistore. Non si chiede la velocità di aumento della sua temperatura: può scambiare calore con l’ambiente mantenendo R fissata. Fra preparazioni I e R possono cambiare e il generatore si adatta alla caduta richiesta. Quale relazione dà P in funzione di I e R?

Procedimento d’autore: La potenza assorbita è VI nella convenzione passiva assegnata. Sostituendo V=RI segue P=(RI)I=I²R. La potenza resta non negativa anche se si invertisse il verso fisico della corrente insieme al riferimento della caduta, perché la forma resistiva contiene I².

Passaggi: P=VI;  V=RI;  P=I^2R.

Distrattori: IR è una tensione, non una potenza. IR² introduce una dipendenza da R non ottenuta da VI; I²/R ha dimensioni diverse da W e R/I² non segue la legge. Il segno positivo rappresenta assorbimento, non generazione nel resistore passivo.

Hint: Sostituisci la legge di Ohm dentro P=VI, senza cambiare l’altro fattore I.

Fonte canonica SHA256 42c597b27cba80a59747da344e887c6db885241f8c73b9b242b13085ccd73d40. Candidato SHA256 5a78f9eb2f50df93b9be318464e6bb10a1841085714a7ac93e9073d1a0d74c5f. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-power-04 — Metà corrente, un quarto di potenza

Un resistore ohmico ha R>0 finita, mantenuta costante durante ciascuna prova. Una corrente continua di modulo I>0 lo attraversa, entrando nel morsetto a potenziale maggiore: la caduta positiva è V=RI. La potenza assorbita P=VI=I²R viene convertita termicamente nel resistore. Non si chiede la velocità di aumento della sua temperatura: può scambiare calore con l’ambiente mantenendo R fissata. Fra preparazioni I e R possono cambiare e il generatore si adatta alla caduta richiesta. I passa da 2 a 1 A, mentre R resta 3 Ω. Come cambia P?

Procedimento d’autore: La potenza iniziale è 2²·3=12 W. Dopo il cambio è 1²·3=3 W. Dimezzare I riduce il quadrato a un quarto. Anche la caduta cambia, da 6 a 3 V: non è imposto mantenerla uguale fra le due prove.

Passaggi: P_A=12\,\mathrm W;  \frac{P_B}{P_A}=\left(\frac12\right)^2;  P_B=3\,\mathrm W.

Distrattori: Sei W applica una dipendenza lineare da I. Dodici ignora il cambiamento; ventiquattro e quarantotto rendono inversa una variazione che qui diminuisce la potenza. La scelta della grandezza controllata è parte del modello.

Hint: Eleva al quadrato il rapporto delle correnti, non la loro differenza.

Fonte canonica SHA256 3c2aaa151ba4a3fd2b996854d2e4a360905940773e0076e036fd8dad5d806561. Candidato SHA256 7d3b18db5fe58d4b2eebc8f789c0b8018411c1843fe67096b02d6759773c28ed. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-power-05 — La corrente dalla potenza

Un resistore ohmico ha R>0 finita, mantenuta costante durante ciascuna prova. Una corrente continua di modulo I>0 lo attraversa, entrando nel morsetto a potenziale maggiore: la caduta positiva è V=RI. La potenza assorbita P=VI=I²R viene convertita termicamente nel resistore. Non si chiede la velocità di aumento della sua temperatura: può scambiare calore con l’ambiente mantenendo R fissata. Fra preparazioni I e R possono cambiare e il generatore si adatta alla caduta richiesta. Si misura P=12 W e si conosce R=3 Ω. Quanto vale I in A?

Procedimento d’autore: Da P=I²R si divide per R>0: I²=P/R=4 A². Si prende la radice positiva perché I è il modulo nel dominio dichiarato. I=2 A ricompone esattamente la potenza 4·3=12 W.

Passaggi: I^2=\frac PR;  I^2=4\,\mathrm{A^2};  I=2\,\mathrm A.

Distrattori: Quattro A scambia I² con I e darebbe 48 W. −2 A è l’altro segno di una corrente orientata, ma non il modulo positivo chiesto. Sei A darebbe 108 W; dividere R per P inverte anche le dimensioni.

Hint: Dividi per R e solo dopo estrai la radice sul ramo positivo.

Fonte canonica SHA256 71f98e906621b6086ad27dc324f36eb5fb6c63d2ef21d925c5a26605a9cbef4c. Candidato SHA256 d01bda909210c07f752f142f7b930c0b342a4e1ae3a31bed15c39c0219a89d96. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-power-06 — La resistenza dissipativa

Un resistore ohmico ha R>0 finita, mantenuta costante durante ciascuna prova. Una corrente continua di modulo I>0 lo attraversa, entrando nel morsetto a potenziale maggiore: la caduta positiva è V=RI. La potenza assorbita P=VI=I²R viene convertita termicamente nel resistore. Non si chiede la velocità di aumento della sua temperatura: può scambiare calore con l’ambiente mantenendo R fissata. Fra preparazioni I e R possono cambiare e il generatore si adatta alla caduta richiesta. Si misura P=12 W e si conosce I=2 A. Quanto vale R in Ω?

Procedimento d’autore: I²R=P, quindi R=P/I². Il quadrato della corrente è 4 A² e 12 W/(4 A²)=3 Ω. La divisione per I² è lecita con I>0; a corrente nulla una misura P=0 non determinerebbe R.

Passaggi: R=\frac P{I^2};  R=\frac{12}{4}\,\Omega;  R=3\,\Omega.

Distrattori: Sei Ω divide per I anziché I² e darebbe 24 W. Quarantotto Ω moltiplica per I²; 1/3 Ω inverte il rapporto e darebbe 4/3 W. Solo tre Ω riproduce la potenza misurata.

Hint: Mantieni il quadrato quando sposti il fattore della corrente.

Fonte canonica SHA256 3b7965ba72ee89ccec64be4adb66311c86b46bba1d34cb5ac9767d8a048478d0. Candidato SHA256 b01df394d2ee79a21664d23e43cb82107049cdd1c8e84b089e23994e40e5f296. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-power-07 — R cambia a corrente fissata

Un resistore ohmico ha R>0 finita, mantenuta costante durante ciascuna prova. Una corrente continua di modulo I>0 lo attraversa, entrando nel morsetto a potenziale maggiore: la caduta positiva è V=RI. La potenza assorbita P=VI=I²R viene convertita termicamente nel resistore. Non si chiede la velocità di aumento della sua temperatura: può scambiare calore con l’ambiente mantenendo R fissata. Fra preparazioni I e R possono cambiare e il generatore si adatta alla caduta richiesta. A ha I=2 A e R=3 Ω. B mantiene I e ha R=1 Ω. Quanto vale P_B/P_A?

Procedimento d’autore: La corrente comune alle due preparazioni è 2 A. A dissipa 12 W e B dissipa 4 W: il rapporto è 1/3. A corrente fissata P è proporzionale a R; non si usa la dipendenza inversa V²/R mantenendo implicitamente fisso anche V.

Passaggi: P_A=12\,\mathrm W;  P_B=4\,\mathrm W;  \frac{P_B}{P_A}=\frac13.

Distrattori: Tre inverte il rapporto e corrisponderebbe al diverso controllo di una tensione invariata. Uno ignora la modifica; un nono e nove introducono un quadrato di R non presente nella legge.

Hint: La grandezza controllata qui è I, non V.

Fonte canonica SHA256 d9ab3a00f14282b08547ecd89a8b461be956a1a23388e6b40c619f59f12791f9. Candidato SHA256 97c80b8d6de48c465ffdf987d97e58d3370015fc5acf2c831cf83ce630b4dae7. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-power-08 — Due utilizzatori alla stessa tensione

Due utilizzatori A e B assorbono potenza in regime continuo, collegati in parallelo a un generatore ideale che mantiene 12 V ai capi di entrambi. P_A=18 W e P_B=6 W. Le correnti positive entrano nei morsetti a potenziale maggiore. Quanto vale I_A/I_B?

Procedimento d’autore: Questo è un caso autonomo: non serve assumere che i due utilizzatori siano resistori ohmici uguali. Per la potenza assorbita P=VI, la tensione comune non nulla si cancella nel rapporto delle correnti. I_A=18/12=3/2 A e I_B=6/12=1/2 A, quindi il rapporto vale tre.

Passaggi: I_A=\frac32\,\mathrm A;  I_B=\frac12\,\mathrm A;  \frac{I_A}{I_B}=\frac{P_A}{P_B};  \frac{I_A}{I_B}=3.

Distrattori: Un terzo inverte A/B. Due non è il rapporto 18/6 delle potenze. La differenza delle correnti varrebbe invece 1 A e risponderebbe a un’altra domanda. Dodici copia il valore numerico della tensione e uno assume correnti uguali nonostante le potenze diverse.

Hint: Le due correnti si ricavano dividendo per la stessa tensione.

Fonte canonica SHA256 33e6d71d6edc5208af4958af5a57005fcd04a0622ff021f60a030410a8210e22. Candidato SHA256 8255fd2fe70087b5cbfb687478704ee91c7c455c18b9a68ef5507e0e93a4d701. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-power-09 — L’inversa sul modulo positivo

Un resistore ohmico ha R>0 finita, mantenuta costante durante ciascuna prova. Una corrente continua di modulo I>0 lo attraversa, entrando nel morsetto a potenziale maggiore: la caduta positiva è V=RI. La potenza assorbita P=VI=I²R viene convertita termicamente nel resistore. Non si chiede la velocità di aumento della sua temperatura: può scambiare calore con l’ambiente mantenendo R fissata. Fra preparazioni I e R possono cambiare e il generatore si adatta alla caduta richiesta. Sono noti P e R. Quale formula ricava il modulo I?

Procedimento d’autore: Dividiamo per R>0, ottenendo I²=P/R. Poiché I è positivo, I=√(P/R). Il rapporto P/R ha unità A², quindi la radice ha unità A. La potenza di un resistore non determina il segno di una corrente orientata senza una convenzione aggiuntiva: qui il dominio lo fissa.

Passaggi: I^2=\frac PR;  I=\sqrt{\frac PR};  I>0.

Distrattori: P/R è il quadrato del modulo, non il modulo. √(PR) ha unità V e ricava invece la caduta positiva. R/P ha unità A⁻². Il segno negativo seleziona un verso orientato escluso dalla definizione richiesta.

Hint: Verifica sia l’unità sotto radice sia il ramo fisico.

Fonte canonica SHA256 3d1a18a28bfda98b3cdfb77a5ce02bc09a2b6a0a1843ffca4da50d401b770b5f. Candidato SHA256 c1d51c2a4cf4ad45bd3ee0e6b7fd0a85da17543064dedee90ba0577c15c5a58e. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-power-10 — Due variazioni nella potenza

Un resistore ohmico ha R>0 finita, mantenuta costante durante ciascuna prova. Una corrente continua di modulo I>0 lo attraversa, entrando nel morsetto a potenziale maggiore: la caduta positiva è V=RI. La potenza assorbita P=VI=I²R viene convertita termicamente nel resistore. Non si chiede la velocità di aumento della sua temperatura: può scambiare calore con l’ambiente mantenendo R fissata. Fra preparazioni I e R possono cambiare e il generatore si adatta alla caduta richiesta. B usa I_B=κ₁I_A e R_B=κ₂R_A, con fattori positivi. Quanto vale P_B/P_A?

Procedimento d’autore: La nuova corrente è elevata al quadrato: P_B=(κ₁I_A)²κ₂R_A. Dividendo per I_A²R_A rimane κ₁²κ₂. Ogni resistenza resta costante entro la sua prova; la relazione fra preparazioni non impone una rampa temporale di I o R.

Passaggi: P_B=\kappa_1^2\kappa_2I_A^2R_A;  \frac{P_B}{P_A}=\kappa_1^2\kappa_2.

Distrattori: κ₁κ₂ perde un fattore della corrente; κ₁²/κ₂ rende inversa R come se fosse fissata V. Il quadrato di κ₂ attribuisce a R la dipendenza quadratica che spetta a I. L’ultimo rapporto inverte l’effetto della corrente.

Hint: Segui l’esponente della corrente e la prima potenza della resistenza.

Fonte canonica SHA256 8dbf160585685884e60283aa8e5e384a07a7382e67d1de4b5e72691b47b2e1b0. Candidato SHA256 30afeae3468ba11539be99a448ed97c2c96d6ad4b4a702fd335fe27fb062e7ea. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-power-11 — Due cambiamenti con effetto opposto

Un resistore ohmico ha R>0 finita, mantenuta costante durante ciascuna prova. Una corrente continua di modulo I>0 lo attraversa, entrando nel morsetto a potenziale maggiore: la caduta positiva è V=RI. La potenza assorbita P=VI=I²R viene convertita termicamente nel resistore. Non si chiede la velocità di aumento della sua temperatura: può scambiare calore con l’ambiente mantenendo R fissata. Fra preparazioni I e R possono cambiare e il generatore si adatta alla caduta richiesta. A usa I=2 A e R=3 Ω. B usa I=1 A e R=4 Ω. Quanto vale P_B/P_A?

Procedimento d’autore: A dà 12 W; B dà 1²·4=4 W. Il rapporto è 1/3. La corrente dimezzata fornisce un fattore 1/4, mentre la resistenza fornisce 4/3: il prodotto è 1/3.

Passaggi: P_A=12\,\mathrm W;  P_B=4\,\mathrm W;  \frac{P_B}{P_A}=\frac13.

Distrattori: Tre è il reciproco; un mezzo segue soltanto I; 4/3 segue soltanto R; 2/3 moltiplica i fattori senza elevare al quadrato quello della corrente. Ogni risposta si può controllare ricostruendo P_B.

Hint: Calcola i due prodotti I²R prima del confronto.

Fonte canonica SHA256 a4b84106ce8e42d3963f01b7fd8e69653b01250d6969b9df744e3b441957fe7e. Candidato SHA256 1b56d6c72b9311c817996b18aa5f843a12d9568f3cedb04d22cca16907f0a2fd. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-power-12 — La media delle potenze

Un resistore ohmico ha R>0 finita, mantenuta costante durante ciascuna prova. Una corrente continua di modulo I>0 lo attraversa, entrando nel morsetto a potenziale maggiore: la caduta positiva è V=RI. La potenza assorbita P=VI=I²R viene convertita termicamente nel resistore. Non si chiede la velocità di aumento della sua temperatura: può scambiare calore con l’ambiente mantenendo R fissata. Fra preparazioni I e R possono cambiare e il generatore si adatta alla caduta richiesta. A ha I=2 A, R=3 Ω; B ha I=1 A, R=4 Ω. Qual è la media aritmetica delle due P?

Procedimento d’autore: Le potenze sono 12 e 4 W: media (12+4)/2=8 W. Ai dati medi I=3/2 A e R=7/2 Ω, invece, si avrebbe (9/4)(7/2)=63/8 W. Otto W supera tale valore di 1/8 W. Mediare le uscite conserva la richiesta statistica.

Passaggi: \overline P=\frac{12+4}{2}\,\mathrm W;  \overline P=8\,\mathrm W;  P_{\rm dati\ medi}=\frac{63}{8}\,\mathrm W.

Distrattori: 63/8 W usa gli ingressi medi; sedici non divide per due; quattro e dodici ripetono una singola prova. La media di potenze non determina automaticamente una potenza media nel tempo senza durate assegnate.

Hint: Le due letture hanno uguale peso statistico, non un tempo implicito.

Fonte canonica SHA256 8b1bab77c55129a7f8a446c4fb7b827963ebeb37cd102b8b1b21617005e80297. Candidato SHA256 cf1da9b189a555162efe489876a909cbbfafd48b54c545b3e099916c24ab838e. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-power-13 — R per il bersaglio a corrente minore

Un resistore ohmico ha R>0 finita, mantenuta costante durante ciascuna prova. Una corrente continua di modulo I>0 lo attraversa, entrando nel morsetto a potenziale maggiore: la caduta positiva è V=RI. La potenza assorbita P=VI=I²R viene convertita termicamente nel resistore. Non si chiede la velocità di aumento della sua temperatura: può scambiare calore con l’ambiente mantenendo R fissata. Fra preparazioni I e R possono cambiare e il generatore si adatta alla caduta richiesta. A ha I=2 A e R=3 Ω. B usa I=1 A e deve dare P_B=P_A/3. Quanto vale R_B/R_A?

Procedimento d’autore: Il bersaglio è 12/3=4 W. Con I_B=1 A, R_B=P_B/I_B²=4 Ω. Il rapporto con 3 Ω iniziali è 4/3. La riduzione di corrente non consente di copiare direttamente il fattore bersaglio nella resistenza.

Passaggi: P_B=4\,\mathrm W;  R_B=4\,\Omega;  \frac{R_B}{R_A}=\frac43.

Distrattori: 3/4 inverte il confronto. Un terzo copia il rapporto delle potenze ignorando I; due segue il fattore inverso della corrente senza quadrato. Quattro è R_B in Ω, non il rapporto richiesto.

Hint: Ricava la nuova resistenza con la corrente B, poi confronta le R.

Fonte canonica SHA256 ab2cea8fe740bd9989c09ae6ca4e50e992843e3dd543ca043f77ba8f5db7a8b5. Candidato SHA256 f78efb144c0b2e09ad193beaef23dcb281b0bd41d974fbb66cb57b44cf558264. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-power-14 — Potenza dal display, poi corrente

Un resistore ohmico ha R>0 finita, mantenuta costante durante ciascuna prova. Una corrente continua di modulo I>0 lo attraversa, entrando nel morsetto a potenziale maggiore: la caduta positiva è V=RI. La potenza assorbita P=VI=I²R viene convertita termicamente nel resistore. Non si chiede la velocità di aumento della sua temperatura: può scambiare calore con l’ambiente mantenendo R fissata. Fra preparazioni I e R possono cambiare e il generatore si adatta alla caduta richiesta. D=a_cal P è continuo e adimensionale, a_cal>0, senza offset. A con I=2 A e R=3 Ω dà D=36. C dà D=12 e ha R=4 Ω. Quanto vale I_C in A?

Procedimento d’autore: La potenza di riferimento è 12 W, dunque a_cal=36/(12 W)=3 W⁻¹. C ha P_C=12/(3 W⁻¹)=4 W. Dividendo per R_C=4 Ω si trova I_C²=1 A² e quindi I_C=1 A nel ramo positivo.

Passaggi: a_{\rm cal}=3\,\mathrm W^{-1};  P_C=4\,\mathrm W;  I_C^2=1\,\mathrm{A^2};  I_C=1\,\mathrm A.

Distrattori: √3 A usa D=12 come potenza prima della taratura. Due A darebbe P=16 W e D=48; quattro A darebbe 64 W. Non si copia il valore della potenza come se fosse una corrente.

Hint: Decodifica P, dividi per R e prendi soltanto alla fine la radice positiva.

Fonte canonica SHA256 447f22ac92b6b74b8dc91cbefc77a9eb8c8eadd5fabb9fa6ca0d9a0a33d4bc8a. Candidato SHA256 e24e1641c7b503f9e36ab6510f508f393a51e7c25477cbe30470ff27a664514a. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-power-15 — Offset prima della radice

Un resistore ohmico ha R>0 finita, mantenuta costante durante ciascuna prova. Una corrente continua di modulo I>0 lo attraversa, entrando nel morsetto a potenziale maggiore: la caduta positiva è V=RI. La potenza assorbita P=VI=I²R viene convertita termicamente nel resistore. Non si chiede la velocità di aumento della sua temperatura: può scambiare calore con l’ambiente mantenendo R fissata. Fra preparazioni I e R possono cambiare e il generatore si adatta alla caduta richiesta. D=a_cal P+b è continuo e adimensionale. A: I=2 A, R=3 Ω, D=25. B: I=1 A, R=4 Ω, D=9. C: R=2 Ω, D=37. Quanto vale I_C?

Procedimento d’autore: Le potenze A e B sono 12 e 4 W. Quindi a_cal=(25−9)/(12−4) W⁻¹=2 W⁻¹ e b=1. C restituisce P_C=(37−1)/2 W=18 W. Da I_C²=18/2 A²=9 A² segue il modulo I_C=3 A.

Passaggi: a_{\rm cal}=2\,\mathrm W^{-1};  b=1;  P_C=18\,\mathrm W;  I_C=3\,\mathrm A.

Distrattori: 37/4 tratta come corrente il valore di I² stimato senza rimuovere l’offset. Nove A confonde il quadrato nove con il modulo e darebbe 162 W; diciotto copia la potenza in W e uno ricostruisce D=5. Solo tre A restituisce D=37.

Hint: La sottrazione dell’offset precede la divisione e la radice.

Fonte canonica SHA256 3f590b4df3b8841a885a735d9f2dd5be077de846100a5c6587dd499578fd06ce. Candidato SHA256 1c4b854688532917bf00057fc16b804500feb8120250cf29d8235570e556dd30. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-power-16 — Un vincolo fra preparazioni

Un resistore ohmico ha R>0 finita, mantenuta costante durante ciascuna prova. Una corrente continua di modulo I>0 lo attraversa, entrando nel morsetto a potenziale maggiore: la caduta positiva è V=RI. La potenza assorbita P=VI=I²R viene convertita termicamente nel resistore. Non si chiede la velocità di aumento della sua temperatura: può scambiare calore con l’ambiente mantenendo R fissata. Fra preparazioni I e R possono cambiare e il generatore si adatta alla caduta richiesta. Fra preparazioni si impone I=αR, con α=(2/3) A/Ω. Si misura P=12 W. Quanto vale R?

Procedimento d’autore: Definiamo x=R/(1 Ω), numero positivo. Il vincolo dà I/(1 A)=2x/3. La potenza normalizzata è P/(1 W)=4x³/9. Con 12 W si trova x³=27 e quindi x=3: R=3 Ω e I=2 A. È una relazione fra prove, non una variazione della resistenza durante una misura.

Passaggi: x=\frac R{1\,\Omega};  12=\frac49x^3;  x^3=27;  R=3\,\Omega.

Distrattori: Ventisette copia x³ invece di estrarre la radice cubica. Due Ω darebbe P=32/9 W. −3 Ω viola la passività e il vincolo positivo; la monotonia di x³ per x>0 esclude infinite soluzioni.

Hint: Sostituisci il vincolo prima di isolare la resistenza.

Fonte canonica SHA256 5da5b44585588a572f09c5f96de2958d847bba20fdf7ede4d308b38a4702cb33. Candidato SHA256 0aac431cd0d53be78ee4445f81cf94f3a9f39bd8bbeaadb7b3c3f4bf37d85ec4. Revisione indipendente e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 97d8a6e762e2a3f217526d7136348c24de83ccd6fa7f6f6ee56e051ec1922944. Package file SHA256 6c275e92ffa437a5037517472e6960cd5aefc324ef6667d13050fc7b322e2346. Binding file SHA256 5ba1a3febef04d2b052f209fbe2abf01392deebc22538cc7f14b5c4fb8808337. Prova strutturale SHA256 0de46577c3ec02326a2d9c5c589680b6d84a672d4f7167925f1389b2fc3df1d9. Asset-only manifest SHA256 cf09134e838fcb87e7a16a02e8b3237a3dac948115545f5de588f1855e344286.

Le coordinate intrinseche dell’SVG documentano proporzioni geometriche nella sorgente, non una misura in pixel fisici dopo ridimensionamento. I testi visibili usano soltanto grandezze fisiche e valori pertinenti. Le origini e le etichette sono separate dagli assi; la direzione di ciascuna freccia è letta insieme alla sua didascalia.

La prima anteprima nativa completa mostrava la curva attraversare l’etichetta 3 W. Asset, package, binding, PNG e log originali sono archiviati con manifest in joule-power-213-first-native-label-overlap-20261125. Ho spostato soltanto quel testo da (255,730) a (170,760), conservando ogni punto, la curva e le scale; poi ho realmente ripetuto due assembly, import e rendering e letto l’immagine finale per intero. Non è un replay dell’app.

La Bézier centrale è M240 740 Q310 680 380 560: x=240+140u, y=740−120u−60u². Con I=(x−100)/140 A e P=(800−y)/20 W segue esattamente P=3 I² nei valori numerici delle unità dichiarate. Il tratto rappresenta 1≤I/(1 A)≤2. Le barre 12,4,8 W hanno larghezze 240,80,160 (20 coordinate/W) con origine comune 150. Le coordinate sono soltanto documentazione tecnica, non pixel fisici visibili allo studente.
