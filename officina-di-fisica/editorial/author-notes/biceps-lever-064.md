# biceps-lever-064 · note d’autore

DRAFT; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN. Queste sono note e calcoli dell’autore per la revisione separata, non una firma scientifica.

Lette individualmente le16 fonti `u2-biceps-lever-01..16` alla5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, shard `questions/U2-05.json`. Modello biomeccanico esplicitamente idealizzato: avambraccio rigido orizzontale senza peso, equilibrio nel riferimento inerziale, cerniera del gomito senza coppia, forza muscolare verticale nel modello scelto. Il braccio è sempre perpendicolare. L=30cm=3/10m,0<b<L. W indica una forza in N, non lavoro o watt. Le formule mantengono L come lunghezza dimensionale; F>W segue dal dominio. La reazione del gomito può equilibrare le forze ma non correggere momenti residui rispetto al gomito.

| ID | Calcolo manuale da rileggere |
|---|---|
|01|b5cm=1/20m;L/b=30/5=6;F60N. Nel modello verticale reazione50N verso il basso.|
|02|F=W(L/b),rapporto puro,unitàN.|
|03|Antiorario positivo:Fb−WL=0→F=WL/b>W.|
|04|W10→20N,stesso braccio:F60→120N.|
|05|W=Fb/L=3N·m/(3/10m)=10N.|
|06|b=WL/F=3/60m=1/20m=5cm;strettamente minore di30cm. Alternative1/10,3/20,1/40m danno momenti6,9,3/2N·m;L viola il dominio aperto.|
|07|F_B30N/F_A60N=1/2,entrambi maggiori del carico10N.|
|08|120−60=+60N;proposta darebbe momento6N·m contro3N·m del carico.|
|09|W=Fb/L<F,conL esplicita.|
|10|κ1/κ2 con0<κ2b<L;fattori positivi non bastano senza il limite geometrico.|
|11|W_B30N,b_B1/10m→F_B90N;rapporto3/2.|
|12|(60+90)/2=75N;ingressi mediW20N,b3/40m darebbero80N.|
|13|target90N,momento9N·m→b_B1/10m,rapporto2.|
|14|c180/60=3N⁻¹;S270→F90N;W=90(1/10)/(3/10)=30N.|
|15|c=(181−121)/(90−60)=2N⁻¹,offset1;S241→F120N;W20N. AlternativeW10,19,21,40N dannoS121,229,253,481.|
|16|W=cb,c200N/m→F=cbL/b=cL=60N per ogni0<b<L. Infinite coppie;esempi(b1/20m,W10N),(b1/10m,W20N). Zero e bordoL esclusi. Tutte hannoW<60N=F.|

SVG letto integralmente XML+PNG: geometria1000px/m, bracci50px e300px per5e30cm. Forze con scala comune2px/N: F60N120px verso l’alto, W10N20px verso il basso e reazione50N100px verso il basso nelle proiezioni separate. Momenti+3e−3N·m. Nessun peso proprio o coppia della cerniera introdotti implicitamente.

Il browser iniziale ha individuato overflow87px nel solo01a320: diagnostica Range sui nodi di testo ha localizzato la didascalia concatenata senza spazi; formule e figura rientravano. Corretto solo il testo della didascalia nel modulo autore,senza CSS/guard/pipeline. Verifica finale canonica48casi1440/768/320. Rigenerazione identica,hashsource/candidate/provenance,import temporaneo16poi0/16,991pubblicatiimmutati e nuovi live0. Nessun giudizio scientifico dell’autore.
