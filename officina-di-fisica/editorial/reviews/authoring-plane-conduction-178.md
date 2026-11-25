# Authoring DRAFT — plane-conduction-178

Letti individualmente tutti gli 80 prompt A178–182 della fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U5-04 SHA256 dd52bd4155f765395f5cd10f89259dd35a1dab194da5942ee067e73578a1ff16. La fonte conserva i compiti e gli ID; la nuova edizione rende esplicite ipotesi, unità, segni, domini e procedimenti. Riletti i testi reali C3-L01/L05/L06 per scale, trasferimento e bilancio stazionario. La primaria degli 80 futuri ID B è stata salvata separatamente prima di candidati o chiavi B; non è un’approvazione di questi lotti A.

Autore soltanto: DRAFT; revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica.

Due assemblaggi in processi separati dell’assembler unico producono gli stessi byte package e binding. Importatore canonico ROOT su SQLite temporaneo: 16 nuovi, poi 0 nuovi e 16 invariati; tutti i 991 pubblicati e le versioni storiche rimangono invariati. Questo è collaudo tecnico strutturale e non giudizio scientifico.

UI prodotto NOT_RUN: per mandato dell’integratore non si avvia il browser dell’app durante il collaudo globale congelato. Non è stato creato o riusato alcun marker UI. Il diagramma SVG è stato letto come XML e in una resa nativa Quick Look a piena altezza, conservata nella prova asset-only: non è un replay dell’app né una prova di layout a 320 px. Nessun CSS, runtime, registro, checkpoint o file candidato ROOT modificato.

## AR-u5-plane-conduction-01 — Dal gradiente alla potenza attraverso la lastra

Una lastra solida omogenea e ferma ha facce quadrate di lato 10 cm, area A=0,01 m² e spessore L=0,01 m. Le due facce piane sono mantenute a temperature uniformi con differenza ΔT=T_h−T_c>0, in K; i lati sono isolati. Si considera conduzione monodimensionale stazionaria, senza generazione interna. La conducibilità k>0, in W/(m·K), è uniforme e costante entro ciascuna prova; confrontare valori diversi di k significa confrontare prove o materiali diversi. P>0 è il modulo della potenza condotta dal caldo al freddo. Con k=2 W/(m·K) e ΔT=10 K, quanto vale P in W?

Procedimento d’autore: La legge di Fourier fornisce P=kAΔT/L. Il rapporto geometrico è A/L=1 m, quindi la conduttanza della lastra è 2 W/K. Ogni secondo attraversano la lastra venti joule: il prodotto di 2 W/K per 10 K vale 20 W. La temperatura non cambia nel tempo, ma il trasferimento continua.

Passaggi: P=\frac{kA}{L}\Delta T;  \frac AL=1\,\mathrm m;  G=\frac{kA}{L};  G=2\,\mathrm{W/K};  P=20\,\mathrm W.

Distrattori: Due copia il numero di k e ignora la differenza termica. Dieci copia ΔT; 40 W raddoppia un fattore già incluso. Non si deve scambiare la potenza in W con un’energia in J: servirebbe una durata per calcolare il calore trasferito.

Hint: Ricava prima la conduttanza kA/L e poi moltiplicala per ΔT.

Fonte canonica SHA256 addbae65cf55f330ce4f2247fca7e960786db37758f203e2addf15fd95114a39. Candidato SHA256 ea7b6937bac61a190bfe3f56d3853462687c1572c943222e149720c02c77e78d. Revisione indipendente e human NOT_RUN.

## AR-u5-plane-conduction-02 — L’unità di un trasferimento per secondo

Una lastra conduce una potenza termica P. Quale unità è adatta a P?

Procedimento d’autore: La potenza è energia trasferita per unità di tempo: un watt è un joule al secondo. In kAΔT/L i metri quadrati dell’area e il metro dello spessore cancellano il metro nel denominatore di k; si cancellano anche i kelvin. Rimangono watt.

Passaggi: [P]=\frac{\mathrm W}{\mathrm{m\,K}}\frac{\mathrm{m^2}}{\mathrm m}\mathrm K;  [P]=\mathrm W.

Distrattori: J è energia, W/K conduttanza, W/(m·K) conducibilità e K differenza termica. Conducibilità e conduttanza non hanno la stessa unità: la geometria le collega.

Hint: Scrivi il watt come joule al secondo e controlla la legge completa.

Fonte canonica SHA256 3fe8bb9bf1e38f3484b32d5bedfbe7b99a02874861d7b743b2fe1b56f9f6385f. Candidato SHA256 6c5bb4cb28be8d8ad887b43c303afa63ba5291a3d7a5f27bb873457a1cabcfef. Revisione indipendente e human NOT_RUN.

## AR-u5-plane-conduction-03 — Conduzione nel solido e trasporto di materia

Una parete solida resta ferma mentre trasferisce energia dalla faccia calda a quella fredda. Quale descrizione distingue la conduzione dalla convezione in un fluido?

Procedimento d’autore: Nella conduzione l’energia passa tra regioni del materiale attraverso interazioni microscopiche; il solido non deve spostarsi nel suo insieme. La convezione comprende invece trasporto di energia associato al moto macroscopico del fluido. Non serve introdurre una massa che attraversi la parete per spiegare la potenza condotta.

Passaggi: P=\frac{kA}{L}(T_h-T_c).

Distrattori: Il moto di una corrente descrive convezione. Le onde che attraversano anche il vuoto descrivono irraggiamento. Una parete ferma può condurre, quindi non è corretto dedurre trasferimento nullo dall’assenza di moto macroscopico.

Hint: Distingui movimento del materiale nel suo insieme e scambio microscopico di energia.

Fonte canonica SHA256 7ccadae226d5c3874ca656d30b186040cc91baeac430e3baa971dadcab100e82. Candidato SHA256 a910dda33f70c92a1a03cd75807b728bb8e83485ce585c42e8b5f6ad99369d24. Revisione indipendente e human NOT_RUN.

## AR-u5-plane-conduction-04 — Una conducibilità doppia nella stessa geometria

Una lastra solida omogenea e ferma ha facce quadrate di lato 10 cm, area A=0,01 m² e spessore L=0,01 m. Le due facce piane sono mantenute a temperature uniformi con differenza ΔT=T_h−T_c>0, in K; i lati sono isolati. Si considera conduzione monodimensionale stazionaria, senza generazione interna. La conducibilità k>0, in W/(m·K), è uniforme e costante entro ciascuna prova; confrontare valori diversi di k significa confrontare prove o materiali diversi. P>0 è il modulo della potenza condotta dal caldo al freddo. A ha k=2 W/(m·K), B ha k=4 W/(m·K); entrambe hanno ΔT=10 K. Come cambia P?

Procedimento d’autore: La geometria e la differenza termica restano uguali, quindi P è direttamente proporzionale a k. Le conduttanze sono 2 e 4 W/K; con dieci kelvin le potenze sono 20 e 40 W. La prova B non è una lastra che modifica k durante il passaggio di calore.

Passaggi: G_A=2\,\mathrm{W/K};  G_B=4\,\mathrm{W/K};  P_A=20\,\mathrm W;  P_B=40\,\mathrm W.

Distrattori: 10 W rende inversa la dipendenza da k. 80 W applica un quadrato; 20 W e zero ignorano rispettivamente la variazione e il gradiente positivo.

Hint: Confronta i coefficienti dopo aver fissato A, L e ΔT.

Fonte canonica SHA256 5df1def7e2db3baf982ae9ac81cbd37e98350b31fd7148adb67b00c48111d830. Candidato SHA256 054b61b57c6d85eaa8bc7c803da4682323565e06ece7a6aa103b124269ee2e07. Revisione indipendente e human NOT_RUN.

## AR-u5-plane-conduction-05 — Ricostruire la conducibilità

Una lastra solida omogenea e ferma ha facce quadrate di lato 10 cm, area A=0,01 m² e spessore L=0,01 m. Le due facce piane sono mantenute a temperature uniformi con differenza ΔT=T_h−T_c>0, in K; i lati sono isolati. Si considera conduzione monodimensionale stazionaria, senza generazione interna. La conducibilità k>0, in W/(m·K), è uniforme e costante entro ciascuna prova; confrontare valori diversi di k significa confrontare prove o materiali diversi. P>0 è il modulo della potenza condotta dal caldo al freddo. Si misura P=20 W con ΔT=10 K. Quanto vale k in W/(m·K)?

Procedimento d’autore: Isoliamo k moltiplicando per L e dividendo per AΔT. Con A/L=1 m, P/ΔT=2 W/K è la conduttanza; la successiva divisione per 1 m dà k=2 W/(m·K). Quel metro non si può omettere in una formula dimensionale.

Passaggi: k=\frac{PL}{A\Delta T};  G=\frac P{\Delta T};  G=2\,\mathrm{W/K};  k=2\,\mathrm{W/(m\,K)}.

Distrattori: Venti copia la potenza e dieci l’intervallo. Moltiplicare P per ΔT invece di dividere non produce una conducibilità. Il divisore AΔT è positivo e rende univoca l’inversa.

Hint: Usa la relazione fisica con A e L prima di sostituire i numeri.

Fonte canonica SHA256 4c717ad5c0845d369c1de8749e97c0a51683b4dd03cebd64073f5715242162a8. Candidato SHA256 11bd720e62e1c34473dbc5c1b048f04afc60c7ed546ce8b5d272487f80b5a04b. Revisione indipendente e human NOT_RUN.

## AR-u5-plane-conduction-06 — Il salto termico richiesto da venti watt

Una lastra solida omogenea e ferma ha facce quadrate di lato 10 cm, area A=0,01 m² e spessore L=0,01 m. Le due facce piane sono mantenute a temperature uniformi con differenza ΔT=T_h−T_c>0, in K; i lati sono isolati. Si considera conduzione monodimensionale stazionaria, senza generazione interna. La conducibilità k>0, in W/(m·K), è uniforme e costante entro ciascuna prova; confrontare valori diversi di k significa confrontare prove o materiali diversi. P>0 è il modulo della potenza condotta dal caldo al freddo. Con P=20 W e k=2 W/(m·K), quanto vale ΔT in K?

Procedimento d’autore: La conduttanza è 2 W/K, quindi un salto di dieci kelvin produce venti watt. Dividere la potenza per la conduttanza dà l’intervallo: ΔT=PL/(kA)=10 K. Il risultato è una differenza, numericamente uguale a dieci gradi Celsius di differenza.

Passaggi: \Delta T=\frac{PL}{kA};  \Delta T=\frac{20\,\mathrm W}{2\,\mathrm{W/K}};  \Delta T=10\,\mathrm K.

Distrattori: Non si aggiunge 273,15 a un intervallo. Quaranta moltiplica per la conduttanza anziché dividere; due copia il numero della conducibilità e non il salto termico.

Hint: Dividi watt per watt al kelvin.

Fonte canonica SHA256 030292fe6f86865305c7f016fad586f5d5d30f16bda7dad4390a6f6ebe32421e. Candidato SHA256 e0c084e8d812c44cea678fc3025c1ba503f833069fc112abf905bd277ebedfb0. Revisione indipendente e human NOT_RUN.

## AR-u5-plane-conduction-07 — Raddoppiare il salto a k fissato

Una lastra solida omogenea e ferma ha facce quadrate di lato 10 cm, area A=0,01 m² e spessore L=0,01 m. Le due facce piane sono mantenute a temperature uniformi con differenza ΔT=T_h−T_c>0, in K; i lati sono isolati. Si considera conduzione monodimensionale stazionaria, senza generazione interna. La conducibilità k>0, in W/(m·K), è uniforme e costante entro ciascuna prova; confrontare valori diversi di k significa confrontare prove o materiali diversi. P>0 è il modulo della potenza condotta dal caldo al freddo. Con k=2 W/(m·K), A ha ΔT=10 K e B ha ΔT=20 K. Quanto vale P_B/P_A?

Procedimento d’autore: Le potenze sono 20 e 40 W. Nel rapporto si cancellano k, area e spessore, lasciando 20/10=2. Il verso resta dal caldo al freddo e si stanno confrontando moduli positivi.

Passaggi: \frac{P_B}{P_A}=\frac{\Delta T_B}{\Delta T_A};  \frac{P_B}{P_A}=2.

Distrattori: Un mezzo inverte B e A; quattro introduce un quadrato; uno ignora il cambiamento e meno due non è il rapporto di due potenze positive.

Hint: Cancella soltanto i parametri effettivamente uguali.

Fonte canonica SHA256 02b85472dc8c6156a78d72c7fad7eb5ffe98cee2b584af95dc7212ae89404703. Candidato SHA256 8a0c4bf2422df45cb841db288d0d24e28947499e1c04ddd1ad0e9a95d5f366dd. Revisione indipendente e human NOT_RUN.

## AR-u5-plane-conduction-08 — Una proposta troppo grande

Una lastra solida omogenea e ferma ha facce quadrate di lato 10 cm, area A=0,01 m² e spessore L=0,01 m. Le due facce piane sono mantenute a temperature uniformi con differenza ΔT=T_h−T_c>0, in K; i lati sono isolati. Si considera conduzione monodimensionale stazionaria, senza generazione interna. La conducibilità k>0, in W/(m·K), è uniforme e costante entro ciascuna prova; confrontare valori diversi di k significa confrontare prove o materiali diversi. P>0 è il modulo della potenza condotta dal caldo al freddo. Con k=2 W/(m·K) e ΔT=10 K si propone P=40 W. Quanto vale proposta meno risultato corretto?

Procedimento d’autore: La legge dà 20 W. La proposta di 40 W supera il valore corretto di 20 W: lo scarto richiesto è positivo. Il numero due sarebbe il rapporto tra proposta e risultato, non la loro differenza.

Passaggi: P=20\,\mathrm W;  e=P_{\rm proposto}-P;  e=20\,\mathrm W.

Distrattori: −20 W cambia l’ordine della sottrazione. 40 W copia la proposta; zero la accetta e 2 W assegna un’unità di potenza a un rapporto puro.

Hint: Ricalcola P e rispetta l’ordine indicato per lo scarto.

Fonte canonica SHA256 03fa5a8210c0f9c4c15f77c6e263a1b45d3b9b86854040104776f049ccf7b3b1. Candidato SHA256 60fc22fb9e9f8e2e56e2be57bd553cecfe528c99d973b6526c37508b183c7fbc. Revisione indipendente e human NOT_RUN.

## AR-u5-plane-conduction-09 — L’inversa conserva tutta la geometria

Una lastra solida omogenea e ferma ha facce quadrate di lato 10 cm, area A=0,01 m² e spessore L=0,01 m. Le due facce piane sono mantenute a temperature uniformi con differenza ΔT=T_h−T_c>0, in K; i lati sono isolati. Si considera conduzione monodimensionale stazionaria, senza generazione interna. La conducibilità k>0, in W/(m·K), è uniforme e costante entro ciascuna prova; confrontare valori diversi di k significa confrontare prove o materiali diversi. P>0 è il modulo della potenza condotta dal caldo al freddo. Sono noti P e ΔT. Quale formula isola k?

Procedimento d’autore: Dal prodotto P=kAΔT/L, moltiplichiamo per L e dividiamo per AΔT. Si ottiene k=PL/(AΔT), con unità W/(m·K). Il semplice quoziente P/ΔT è invece una conduttanza: resta ancora da moltiplicarlo per L/A.

Passaggi: PL=kA\Delta T;  k=\frac{PL}{A\Delta T}.

Distrattori: Scambiare A e L cambia sia la geometria sia le unità. Moltiplicare per ΔT aggiunge kelvin invece di toglierli. AΔT/(PL) è il reciproco della conducibilità; P/ΔT non ha il metro richiesto.

Hint: Isola k prima di usare il particolare rapporto numerico A/L.

Fonte canonica SHA256 92c5cf9e33a3d3742d6ac6baafbfcd219d2d54438f9aa9b45ba482295151547a. Candidato SHA256 fe2bca40aa54404260c7092de2a39b200c4ab303657ad4b04ba8e40ec0550e6e. Revisione indipendente e human NOT_RUN.

## AR-u5-plane-conduction-10 — Due cambiamenti indipendenti fra prove

Una lastra solida omogenea e ferma ha facce quadrate di lato 10 cm, area A=0,01 m² e spessore L=0,01 m. Le due facce piane sono mantenute a temperature uniformi con differenza ΔT=T_h−T_c>0, in K; i lati sono isolati. Si considera conduzione monodimensionale stazionaria, senza generazione interna. La conducibilità k>0, in W/(m·K), è uniforme e costante entro ciascuna prova; confrontare valori diversi di k significa confrontare prove o materiali diversi. P>0 è il modulo della potenza condotta dal caldo al freddo. B usa k_B=κ₁k_A e ΔT_B=κ₂ΔT_A, con κ₁,κ₂>0. Quanto vale P_B/P_A?

Procedimento d’autore: A e L restano uguali. La potenza B contiene un fattore κ₁ dalla conducibilità e un fattore κ₂ dal salto termico. Nel rapporto resta il prodotto κ₁κ₂. Se entrambi sono uno, il rapporto torna uno.

Passaggi: P_B=\frac{\kappa_1k_AA}{L}\kappa_2\Delta T_A;  \frac{P_B}{P_A}=\kappa_1\kappa_2.

Distrattori: I quozienti rendono inversa una dipendenza diretta. La somma darebbe due per prove identiche; il quadrato aggiunge una dipendenza che Fourier non contiene.

Hint: Scrivi la legge in B prima di cancellare quella in A.

Fonte canonica SHA256 6e60ae6e9d3228fcda074345e7c89cb5f8aa4b131ea0e08b8452fec9614d9e55. Candidato SHA256 1fdae92992950c8494de58d87bc0489ce92e94155e8a453bd2cb87f94bb232a8. Revisione indipendente e human NOT_RUN.

## AR-u5-plane-conduction-11 — Quando raddoppiano entrambi i fattori

Una lastra solida omogenea e ferma ha facce quadrate di lato 10 cm, area A=0,01 m² e spessore L=0,01 m. Le due facce piane sono mantenute a temperature uniformi con differenza ΔT=T_h−T_c>0, in K; i lati sono isolati. Si considera conduzione monodimensionale stazionaria, senza generazione interna. La conducibilità k>0, in W/(m·K), è uniforme e costante entro ciascuna prova; confrontare valori diversi di k significa confrontare prove o materiali diversi. P>0 è il modulo della potenza condotta dal caldo al freddo. A ha k=2 W/(m·K), ΔT=10 K; B ha k=4 W/(m·K), ΔT=20 K. Quanto vale P_B/P_A?

Procedimento d’autore: A conduce 20 W. B ha conduttanza 4 W/K e salto 20 K, quindi conduce 80 W. Il rapporto 80/20 è quattro: un raddoppio per ciascun fattore.

Passaggi: P_A=20\,\mathrm W;  P_B=80\,\mathrm W;  P_B/P_A=4.

Distrattori: Due considera soltanto uno dei raddoppi. Un quarto inverte il rapporto; otto applica un fattore in più e uno ignora entrambi i cambiamenti.

Hint: Calcola le due potenze complete, non un solo rapporto di dati.

Fonte canonica SHA256 6e436e90bc80ed04de9e8425669798ca3b8658de33597ec0f6869bc373a0aa81. Candidato SHA256 d19148cc0b855a29491b5c07eb9c094d40e640b72f68509d5a6419a81b45045a. Revisione indipendente e human NOT_RUN.

## AR-u5-plane-conduction-12 — Media delle potenze, non prodotto delle medie

Una lastra solida omogenea e ferma ha facce quadrate di lato 10 cm, area A=0,01 m² e spessore L=0,01 m. Le due facce piane sono mantenute a temperature uniformi con differenza ΔT=T_h−T_c>0, in K; i lati sono isolati. Si considera conduzione monodimensionale stazionaria, senza generazione interna. La conducibilità k>0, in W/(m·K), è uniforme e costante entro ciascuna prova; confrontare valori diversi di k significa confrontare prove o materiali diversi. P>0 è il modulo della potenza condotta dal caldo al freddo. A usa k=2 W/(m·K), ΔT=10 K; B usa k=4 W/(m·K), ΔT=20 K. Qual è la media aritmetica di P con uguale peso?

Procedimento d’autore: Le letture sono 20 e 80 W. La loro somma è cento e la metà cinquanta watt. La prova ai dati medi k=3 W/(m·K) e ΔT=15 K darebbe invece 45 W: è un terzo esperimento, non la media delle due uscite.

Passaggi: \overline P=\frac{20+80}{2}\,\mathrm W;  \overline P=50\,\mathrm W;  P(\overline k,\overline{\Delta T})=45\,\mathrm W.

Distrattori: 45 W usa gli ingressi medi. 100 W non dimezza la somma, 30 W è metà della differenza e 25 W dimezza la media una seconda volta.

Hint: Fai la media solo dopo aver trovato ciascuna lettura.

Fonte canonica SHA256 3fdc2995eb6cd5923690c9b8298b2264b4d3e6a68c9c0eb91c0baa03b09d3ac4. Candidato SHA256 8b7a984f6de67d17ecc61537fb1b9ebe291e65a6bf627211e85986dc1da68c4f. Revisione indipendente e human NOT_RUN.

## AR-u5-plane-conduction-13 — Un bersaglio quadruplo con k già doppio

Una lastra solida omogenea e ferma ha facce quadrate di lato 10 cm, area A=0,01 m² e spessore L=0,01 m. Le due facce piane sono mantenute a temperature uniformi con differenza ΔT=T_h−T_c>0, in K; i lati sono isolati. Si considera conduzione monodimensionale stazionaria, senza generazione interna. La conducibilità k>0, in W/(m·K), è uniforme e costante entro ciascuna prova; confrontare valori diversi di k significa confrontare prove o materiali diversi. P>0 è il modulo della potenza condotta dal caldo al freddo. A ha k=2 W/(m·K), ΔT_A=10 K. B ha k_B=4 W/(m·K) e deve condurre quattro volte la potenza A. Quanto vale ΔT_B/ΔT_A?

Procedimento d’autore: Il bersaglio è 80 W. Con la nuova conduttanza 4 W/K occorrono 20 K, il doppio dei dieci iniziali. Il raddoppio di k fornisce già metà del fattore quattro richiesto.

Passaggi: P_B=80\,\mathrm W;  \Delta T_B=20\,\mathrm K;  \Delta T_B/\Delta T_A=2.

Distrattori: Quattro trasferisce tutto il bersaglio al salto dimenticando k. Un mezzo è il reciproco, uno darebbe soltanto 40 W e venti copia il numero dei kelvin anziché un rapporto puro.

Hint: Dividi il fattore d’uscita per quello già fornito dalla conducibilità.

Fonte canonica SHA256 4c4f57b683957928edaef971b44041dd71fcff79fe5be8b433db5a8f9cd1562c. Candidato SHA256 f4ad76f4ab9e61edc263e8404d650018b0214a9dc2019989e112359390dca572. Revisione indipendente e human NOT_RUN.

## AR-u5-plane-conduction-14 — Prima tarare, poi ricavare k

Una lastra solida omogenea e ferma ha facce quadrate di lato 10 cm, area A=0,01 m² e spessore L=0,01 m. Le due facce piane sono mantenute a temperature uniformi con differenza ΔT=T_h−T_c>0, in K; i lati sono isolati. Si considera conduzione monodimensionale stazionaria, senza generazione interna. La conducibilità k>0, in W/(m·K), è uniforme e costante entro ciascuna prova; confrontare valori diversi di k significa confrontare prove o materiali diversi. P>0 è il modulo della potenza condotta dal caldo al freddo. Il display continuo adimensionale segue S=qP, q>0. A con k=2 W/(m·K), ΔT=10 K dà S=60. B dà S=240 e ha ΔT=20 K. Quanto vale k_B in W/(m·K)?

Procedimento d’autore: Il riferimento ha P_A=20 W, perciò q=60/(20 W)=3 W⁻¹. B conduce 240/3=80 W. Dividendo per ΔT_B=20 K si trova G_B=4 W/K; moltiplicando per L/A=1 m⁻¹ si ottiene k_B=4 W/(m·K).

Passaggi: q=3\,\mathrm{W^{-1}};  P_B=80\,\mathrm W;  k_B=\frac{P_BL}{A\Delta T_B};  k_B=4\,\mathrm{W/(m\,K)}.

Distrattori: Usare 240 direttamente come watt darebbe k=12 W/(m·K). Due manterrebbe k del riferimento e predirebbe S=120; venti copia il salto e non soddisfa la lettura.

Hint: Decodifica il display prima di invertire la legge termica.

Fonte canonica SHA256 c90e21b62650594d7827fd7ab71b8ca85e1ea208b256ebf380827980eeb98936. Candidato SHA256 6dc779569fa833aaa2fc48cfd43059b5386584a01b8ecb48b3da3c182e2f88f1. Revisione indipendente e human NOT_RUN.

## AR-u5-plane-conduction-15 — Due riferimenti eliminano l’offset

Una lastra solida omogenea e ferma ha facce quadrate di lato 10 cm, area A=0,01 m² e spessore L=0,01 m. Le due facce piane sono mantenute a temperature uniformi con differenza ΔT=T_h−T_c>0, in K; i lati sono isolati. Si considera conduzione monodimensionale stazionaria, senza generazione interna. La conducibilità k>0, in W/(m·K), è uniforme e costante entro ciascuna prova; confrontare valori diversi di k significa confrontare prove o materiali diversi. P>0 è il modulo della potenza condotta dal caldo al freddo. Il display è S=qP+b, continuo e adimensionale, q>0. A: k=2 W/(m·K), ΔT=10 K, S=41. B: k=4 W/(m·K), ΔT=20 K, S=161. C: ΔT=10 K, S=81. Quanto vale k_C?

Procedimento d’autore: I riferimenti sono 20 e 80 W. La differenza 120 delle letture su 60 W dà q=2 W⁻¹; poi b=41−2·20=1. C conduce (81−1)/2=40 W. Con dieci kelvin, la sua conduttanza è 4 W/K e k_C=4 W/(m·K).

Passaggi: q=2\,\mathrm{W^{-1}};  b=1;  P_C=40\,\mathrm W;  k_C=4\,\mathrm{W/(m\,K)}.

Distrattori: 81/20 W/(m·K) omette b e usa 81/2 W: ricostruirebbe S=82, non 81. Due torna ad A; otto darebbe 80 W con questi dieci kelvin, quindi S=161. Quaranta copia il numero della potenza.

Hint: Sottrai l’offset anche nella prova incognita, dopo averlo trovato.

Fonte canonica SHA256 d45939a1782f38074656c0ee8786a6aa986aadb20afd0875667a606d3e6c7249. Candidato SHA256 86ab8e87eb0ecc74d6eee46bc26f882c2c74425d8fd1ebbfb6ae39b35e79644f. Revisione indipendente e human NOT_RUN.

## AR-u5-plane-conduction-16 — Un vincolo fra materiali e salti di prova

Una lastra solida omogenea e ferma ha facce quadrate di lato 10 cm, area A=0,01 m² e spessore L=0,01 m. Le due facce piane sono mantenute a temperature uniformi con differenza ΔT=T_h−T_c>0, in K; i lati sono isolati. Si considera conduzione monodimensionale stazionaria, senza generazione interna. La conducibilità k>0, in W/(m·K), è uniforme e costante entro ciascuna prova; confrontare valori diversi di k significa confrontare prove o materiali diversi. P>0 è il modulo della potenza condotta dal caldo al freddo. Fra preparazioni si impone k=βΔT, con β=1/5 W/(m·K²). Si misura P=20 W. Quanto vale ΔT>0?

Procedimento d’autore: Sostituiamo il vincolo nella potenza totale, mantenendo k uniforme entro ogni lastra. Si ottiene P=β(A/L)(ΔT)², con coefficiente 1/5 W/K². Venti watt impongono (ΔT)²=100 K². Le due radici algebriche sono alternative; soltanto +10 K rispetta il salto positivo e dà k=2 W/(m·K). Il vincolo non è una legge locale k(T) dentro il materiale.

Passaggi: P=\beta\frac AL(\Delta T)^2;  (\Delta T)^2=100\,\mathrm{K^2};  \Delta T=10\,\mathrm K.

Distrattori: −10 K viola ΔT>0 e rende k negativo nel vincolo. Cento copia il quadrato senza radice. Cinque kelvin darebbero 5 W e venti kelvin 80 W, con il vincolo applicato.

Hint: Usa il vincolo prima dell’inversa e controlla il ramo fisico della radice.

Fonte canonica SHA256 c9087df0011e5fb48751b517e5cc65d61b890d4746f319ba00b386504279d563. Candidato SHA256 b002a2c116aa054218d45427233f496ebb13cb06d720790045f74f7fe1058874. Revisione indipendente e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 67aa4eacd086d4d195bd30b8248679247d211d34d7f375aa16c64185b3323dd1. Package file SHA256 aa05809aaa7d83892dbf1f1e661bf3bb3652211d2c0368350da8d2864de18b09. Binding file SHA256 d76bec879cf2c7400fe3ccaaa17054667dc48938b4dab381c9a0850fc89e50f0. Prova strutturale SHA256 79310d01318432bfd378f4b6382302bf777b3c1c2844b03732857034354e5ae1. Asset-only manifest SHA256 2e997660a1075df65440787cf938b58fba05915b5f27c37749d09b44cc2357bc.

Le coordinate intrinseche dell’SVG documentano proporzioni geometriche nella sorgente, non una misura in pixel fisici dopo ridimensionamento. I testi visibili usano soltanto grandezze fisiche e valori pertinenti. Le origini e le etichette sono separate dagli assi; la direzione di ciascuna freccia è letta insieme alla sua didascalia.
