# Authoring DRAFT — engine-average-power-160

Tutti gli 80 prompt assegnati A158–162 sono stati letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605 prima di iniziare la riscrittura. Fonte U5-02 SHA256 66ade7951eecbdbea93c529a628b01c2e8bf393959f757a2cf82aeb03cabb95c. Compiti e casi speciali conservati; eventuali nuove parametrizzazioni sono dichiarate qui. Riletti i blocchi delle lezioni reali C3-L08/L09/L10 e il lavoro/potenza in C1-L007, oltre ai prerequisiti C3 pertinenti. Corso C3 e competenze del catalogo, nessuna lezione inventata.

Autore soltanto: revisione scientifica indipendente NOT_RUN, approvazione umana NOT_RUN, DRAFT e publicationAction NONE. Queste sono note di calcolo dell’autore, non un oracolo indipendente e non un’autofirma.

Due assembly in processi distinti hanno prodotto package e binding identici. Importatore canonico ROOT con percorso assoluto in SQLite temporaneo: 16 nuovi, poi 0 nuovi/16 invariati; 991 pubblicati e versioni storiche conservati, SHA dei pubblicati invariato. Asset SVG letto in XML e rendering nativo completo. Snapshot privata del runtime ROOT, fingerprint 54054f7ac463ef52f7c4c881d50ee071713315d891812696f18e39d9ad45ab3d, verificata uguale prima del replay. Runner canonico browser-batches.mjs ha realmente completato 48 viste a 1440/768/320 px con exit 0 e scritto atomicamente il proprio completion.json; marker riletto dal validatore canonico contro i byte finali. Report grezzo e marker sono conservati byte per byte in editorial/author-evidence. Nessun ritag di prove precedenti, nessuna modifica a runtime, CSS, registry o dati degli studenti. Queste prove tecniche non certificano la correttezza scientifica o l’esperienza umana.

Il rendimento assegnato è1/4, le durate sono positive, i cicli si ripetono senza pause. La potenza è media sull’intero ciclo. Il caso12 distingue la media statistica41/8 W dalla potenza totale dei due cicli concatenati27/4 W. Il vincolo16 è fra modi operativi e non una legge istantanea di riscaldamento.

## AR-u5-engine-average-power-01 — Energia utile in due secondi

Una macchina chiusa opera ciclicamente con rendimento assegnato η=1/4 in ciascuna prova, senza altre sorgenti di energia. Q_h>0 è il calore ricevuto per ciclo, in J, t>0 la durata del ciclo in s. Il lavoro utile per ciclo è W=ηQ_h; P è la potenza utile media su quel ciclo, in watt. I cicli si susseguono senza intervalli inattivi quando si parla di funzionamento ripetuto. Non si richiede la potenza istantanea lungo le singole trasformazioni. Q_h=80 J e t=2 s. Quanto vale P in W?

Procedimento d’autore: Un quarto degli ottanta joule ricevuti diventa lavoro, cioè venti joule. La potenza media distribuisce quei venti joule sui due secondi del ciclo: dieci joule ogni secondo, dieci watt. Il calore residuo non diventa lavoro utile.

Passaggi esatti: W=\frac14Q_h;  W=20\,\mathrm J;  P=\frac{W}{t};  P=10\,\mathrm W.

Distrattori e controllo didattico: Quaranta W divide tutto Q_h per t senza applicare η. Venti è il lavoro in joule prima di dividere per la durata; cinque W dimezza ancora il risultato. Non si moltiplica per t: ciò darebbe unità J·s.

Fonte canonica SHA256 705c476beaaa408944c2116b3c00e34f4ed5ce355c884723d5f70ab41d74bd7e. Candidato SHA256 96ec2df62a3e8b9961a53c9b2057e2d78c57096591a2df34f85d9458119db335. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-average-power-02 — L’unità di una potenza media

P è il rapporto fra lavoro utile di un ciclo e durata del ciclo. Quale unità è corretta?

Procedimento d’autore: Il watt è il joule al secondo. Due cicli possono compiere lo stesso lavoro ma avere potenze medie diverse se impiegano tempi differenti. La media su un intervallo finito conserva la dimensione energia diviso tempo.

Passaggi esatti: [P]=\frac{\mathrm J}{\mathrm s};  1\,\mathrm W=1\,\mathrm{J/s}.

Distrattori e controllo didattico: J indica lavoro per ciclo, J·s moltiplica invece di dividere e 1 è il rendimento adimensionale. K è temperatura. Il simbolo W è qui unità watt, mentre nella legge W/t il numeratore W denota il lavoro: il contesto li distingue.

Fonte canonica SHA256 5bf71f2a3c28e7abd9ceab813e316fef75799afdbcee8a3e2c601663e1209544. Candidato SHA256 d527759d20c7be669b373cd460a032c3a285660087dc8bbb1a011d97cc584892. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-average-power-03 — Dalla definizione al modello medio

Una macchina chiusa opera ciclicamente con rendimento assegnato η=1/4 in ciascuna prova, senza altre sorgenti di energia. Q_h>0 è il calore ricevuto per ciclo, in J, t>0 la durata del ciclo in s. Il lavoro utile per ciclo è W=ηQ_h; P è la potenza utile media su quel ciclo, in watt. I cicli si susseguono senza intervalli inattivi quando si parla di funzionamento ripetuto. Non si richiede la potenza istantanea lungo le singole trasformazioni. Quale formula dà P nelle unità dichiarate?

Procedimento d’autore: La potenza media è lavoro diviso durata. Sostituendo il lavoro ηQ_h con η=1/4 si ottiene Q_h/(4t). La durata positiva è al denominatore: la stessa energia utile trasferita in un tempo maggiore dà potenza media minore.

Passaggi esatti: P=\frac{W}{t};  P=\frac{\eta Q_h}{t};  P=\frac{Q_h}{4t}.

Distrattori e controllo didattico: Moltiplicare per quattro inverte il rendimento. Moltiplicare per il tempo produce J·s; omettere quattro considera tutta l’energia ricevuta come lavoro. Il rapporto t/(4Q_h) ha unità inversa a una potenza.

Fonte canonica SHA256 2b39105deaa9b2f0fceb115f23a79996f9aaf23bede972da682bbbb8ebac6857. Candidato SHA256 8a6ddff9f5652978edce61b14bff67e7bbb9e81e33d24c50e74cd98c8e3523ff. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-average-power-04 — Stessa durata, più calore per ciclo

Una macchina chiusa opera ciclicamente con rendimento assegnato η=1/4 in ciascuna prova, senza altre sorgenti di energia. Q_h>0 è il calore ricevuto per ciclo, in J, t>0 la durata del ciclo in s. Il lavoro utile per ciclo è W=ηQ_h; P è la potenza utile media su quel ciclo, in watt. I cicli si susseguono senza intervalli inattivi quando si parla di funzionamento ripetuto. Non si richiede la potenza istantanea lungo le singole trasformazioni. A usa Q_h=80 J,t=2 s. B usa Q_h=160 J e la stessa durata. Come cambia P?

Procedimento d’autore: A compie venti joule in due secondi. B compie un quarto di centosessanta, quaranta joule, ancora in due secondi: venti watt. Con η e t invariati la potenza media raddoppia insieme a Q_h.

Passaggi esatti: P_A=10\,\mathrm W;  W_B=40\,\mathrm J;  P_B=\frac{40}{2}\,\mathrm W;  P_B=20\,\mathrm W.

Distrattori e controllo didattico: Cinque rende inversa la dipendenza da Q_h e dieci ignora il cambiamento. Ottanta W dimentica η; quaranta copia il lavoro B senza dividerlo per il tempo.

Fonte canonica SHA256 a94a855c4c15a91a982c134a2ddb425359b8020d90a9d5ae7563a5a1c75bd5c8. Candidato SHA256 4971f43478e7e95ab5af0bc34d746463ff7532ee2e32c99fc789939b082716fb. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-average-power-05 — Quanta energia termica serve al ciclo

Una macchina chiusa opera ciclicamente con rendimento assegnato η=1/4 in ciascuna prova, senza altre sorgenti di energia. Q_h>0 è il calore ricevuto per ciclo, in J, t>0 la durata del ciclo in s. Il lavoro utile per ciclo è W=ηQ_h; P è la potenza utile media su quel ciclo, in watt. I cicli si susseguono senza intervalli inattivi quando si parla di funzionamento ripetuto. Non si richiede la potenza istantanea lungo le singole trasformazioni. P=10 W e t=2 s. Quanto vale Q_h in J?

Procedimento d’autore: Dieci joule al secondo per due secondi corrispondono a venti joule utili. Poiché sono un quarto del calore assorbito, l’ingresso deve essere quattro volte venti: ottanta joule. L’inversa conserva entrambe le operazioni, moltiplicazione per t e divisione per η.

Passaggi esatti: W=Pt;  W=20\,\mathrm J;  Q_h=4Pt;  Q_h=80\,\mathrm J.

Distrattori e controllo didattico: Venti J è soltanto il lavoro utile. Cinque J divide ancora per quattro e quaranta J non conta la durata di due secondi. In unità, W·s sono J.

Fonte canonica SHA256 09df9808625e648303e8a0f12c5780a64e6e657801b40a40a7a20df7b99d52da. Candidato SHA256 1df57376b4d2ef74ad73cc0042aa0fde153a9c9af74bfd2c6467c43a46d68fdb. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-average-power-06 — La durata che realizza la potenza

Una macchina chiusa opera ciclicamente con rendimento assegnato η=1/4 in ciascuna prova, senza altre sorgenti di energia. Q_h>0 è il calore ricevuto per ciclo, in J, t>0 la durata del ciclo in s. Il lavoro utile per ciclo è W=ηQ_h; P è la potenza utile media su quel ciclo, in watt. I cicli si susseguono senza intervalli inattivi quando si parla di funzionamento ripetuto. Non si richiede la potenza istantanea lungo le singole trasformazioni. P=10 W e Q_h=80 J. Quanto vale t in s?

Procedimento d’autore: Il lavoro del ciclo vale un quarto di ottanta, venti joule. Dividendo venti joule per dieci joule al secondo otteniamo due secondi. Isolare t richiede P>0; qui segue da Q_h>0 e rendimento positivo.

Passaggi esatti: t=\frac{Q_h}{4P};  t=\frac{80}{40}\,\mathrm s;  t=2\,\mathrm s.

Distrattori e controllo didattico: Otto secondi dimentica il rendimento. Un mezzo secondo è il reciproco del risultato numerico e non deriva dall’inversa; quaranta J è una quantità energetica, non una durata. Con t=2 s il modello restituisce10 W.

Fonte canonica SHA256 099ab386f0a31bd1fb717bf0882b1bb345e043852921c455198686784ca3c5ca. Candidato SHA256 f8f2158c9011ad3bda3048dfa302cf8111e633c90806d4367415904325854ed1. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-average-power-07 — Lo stesso ciclo energetico svolto più lentamente

Una macchina chiusa opera ciclicamente con rendimento assegnato η=1/4 in ciascuna prova, senza altre sorgenti di energia. Q_h>0 è il calore ricevuto per ciclo, in J, t>0 la durata del ciclo in s. Il lavoro utile per ciclo è W=ηQ_h; P è la potenza utile media su quel ciclo, in watt. I cicli si susseguono senza intervalli inattivi quando si parla di funzionamento ripetuto. Non si richiede la potenza istantanea lungo le singole trasformazioni. A usa Q_h=80 J,t_A=2 s. B mantiene Q_h ma ha t_B=4 s. Quanto vale P_B/P_A?

Procedimento d’autore: Il lavoro utile è venti joule in entrambi i casi. A lo fornisce in due secondi, B in quattro: P_A=10 W e P_B=5 W. Il rapporto è un mezzo, inverso del fattore due sulle durate.

Passaggi esatti: P_A=10\,\mathrm W;  P_B=5\,\mathrm W;  P_B/P_A=\frac12.

Distrattori e controllo didattico: Due segue direttamente il tempo e uno ignora che la potenza è una rapidità di trasferimento. Un quarto e quattro introducono un quadrato assente dalla legge.

Fonte canonica SHA256 757d6f09476aeeef2da1453416f22173d7bd962bc4abad45a4a84bbf007c8b5b. Candidato SHA256 2cf28e856bb3b158bb1997f172b7759f37ce10bcba04c98ee36ee9bccfa9abad. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-average-power-08 — Controllo di una potenza proposta

Una macchina chiusa opera ciclicamente con rendimento assegnato η=1/4 in ciascuna prova, senza altre sorgenti di energia. Q_h>0 è il calore ricevuto per ciclo, in J, t>0 la durata del ciclo in s. Il lavoro utile per ciclo è W=ηQ_h; P è la potenza utile media su quel ciclo, in watt. I cicli si susseguono senza intervalli inattivi quando si parla di funzionamento ripetuto. Non si richiede la potenza istantanea lungo le singole trasformazioni. Q_h=80 J e t=2 s. Si propone P=20 W. Quanto vale proposta meno risultato corretto?

Procedimento d’autore: Il lavoro è venti joule e la potenza corretta dieci watt. La proposta supera il risultato di dieci watt. Il valore venti coincide con il numero del lavoro in J, ma la trasformazione da energia a potenza richiede ancora la durata.

Passaggi esatti: P=10\,\mathrm W;  e=(20-10)\,\mathrm W;  e=10\,\mathrm W.

Distrattori e controllo didattico: Meno dieci scambia i termini dello scarto. Venti copia la proposta, zero la accetta e cinque dimezza ancora la differenza. Il confronto è fra potenze, quindi lo scarto è in W.

Fonte canonica SHA256 dd5f4b3e009af50be483a00c719f469b4ec49cda3105c9b1538629530c758853. Candidato SHA256 42d83f753f347703ee615799205a2696decf3dfa9d5a527ff302fe3091763df6. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-average-power-09 — L’inversa generale per il calore ricevuto

Una macchina chiusa opera ciclicamente con rendimento assegnato η=1/4 in ciascuna prova, senza altre sorgenti di energia. Q_h>0 è il calore ricevuto per ciclo, in J, t>0 la durata del ciclo in s. Il lavoro utile per ciclo è W=ηQ_h; P è la potenza utile media su quel ciclo, in watt. I cicli si susseguono senza intervalli inattivi quando si parla di funzionamento ripetuto. Non si richiede la potenza istantanea lungo le singole trasformazioni. P e t sono noti e positivi. Quale espressione ricava Q_h?

Procedimento d’autore: Moltiplichiamo P=Q_h/(4t) per4t: Q_h=4Pt. Il prodotto potenza per durata è energia; quattro compensa il fatto che solo un quarto dell’ingresso diventa lavoro. Tutti i dati positivi danno Q_h positivo.

Passaggi esatti: 4Pt=Q_h;  Q_h=4Pt;  [Pt]=\mathrm J.

Distrattori e controllo didattico: Pt/4 applica nuovamente il rendimento invece di invertirlo. P/t e P/(4t) hanno dimensione energia su tempo al quadrato; t/P non è un’energia.

Fonte canonica SHA256 8a991fbe4005a1ca9f6b6f9a346c79b9b3db86fc11ed1c5b0d9074b672890d62. Candidato SHA256 6c9815ea5a4d5249c74ad5cb59f56f645465266bd00f6d9104e0b51140daffbf. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-average-power-10 — Fattori indipendenti sul calore e sulla durata

Una macchina chiusa opera ciclicamente con rendimento assegnato η=1/4 in ciascuna prova, senza altre sorgenti di energia. Q_h>0 è il calore ricevuto per ciclo, in J, t>0 la durata del ciclo in s. Il lavoro utile per ciclo è W=ηQ_h; P è la potenza utile media su quel ciclo, in watt. I cicli si susseguono senza intervalli inattivi quando si parla di funzionamento ripetuto. Non si richiede la potenza istantanea lungo le singole trasformazioni. Fra prove Q_h,B=κ₁Q_h,A e t_B=κ₂t_A, con κ₁,κ₂>0. Quanto vale P_B/P_A?

Procedimento d’autore: Il rendimento comune si cancella nel rapporto delle potenze. Il fattore sul calore rimane al numeratore e quello sul tempo al denominatore. Se entrambi sono uguali, il lavoro aumenta nello stesso rapporto della durata e la potenza media resta la stessa.

Passaggi esatti: P_B=\frac{\kappa_1}{\kappa_2}P_A;  P_B/P_A=\frac{\kappa_1}{\kappa_2}.

Distrattori e controllo didattico: Il prodotto tratta una durata maggiore come aumento di potenza. Il quoziente inverso scambia le prove, il quadrato di κ₁ non è nella legge e la somma darebbe due per prove identiche.

Fonte canonica SHA256 82fc1ee1f5922fbc129b58a77baeb2aef2fc4f852723cb11cc590bc23edeb32a. Candidato SHA256 d8523079dbf9915f4980d2dc96679b4550d0892a3a2e65f2275dbca7bb6bc9a8. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-average-power-11 — Energia e tempo cambiano nello stesso confronto

Una macchina chiusa opera ciclicamente con rendimento assegnato η=1/4 in ciascuna prova, senza altre sorgenti di energia. Q_h>0 è il calore ricevuto per ciclo, in J, t>0 la durata del ciclo in s. Il lavoro utile per ciclo è W=ηQ_h; P è la potenza utile media su quel ciclo, in watt. I cicli si susseguono senza intervalli inattivi quando si parla di funzionamento ripetuto. Non si richiede la potenza istantanea lungo le singole trasformazioni. A usa Q_h=80 J,t=2 s. B usa Q_h=1 J,t=1 s. Quanto vale P_B/P_A?

Procedimento d’autore: A ha potenza dieci watt. B fornisce un quarto di joule utile in un secondo, quindi un quarto di watt. Dividere1/4 per10 dà1/40. Il confronto deve includere la durata B, che è metà di quella A.

Passaggi esatti: P_A=10\,\mathrm W;  P_B=\frac14\,\mathrm W;  P_B/P_A=\frac1{40}.

Distrattori e controllo didattico: Quaranta è il reciproco. Un ottantesimo segue solo il calore; un mezzo segue il rapporto dei tempi e un quarto copia il valore numerico della potenza B.

Fonte canonica SHA256 31a5573f12dd6c0ae2fac1c6d4d24fd8023b10d47c1a25d8a88bca47d402355f. Candidato SHA256 3e5439c671efbf905b371d1f7709d248022318d959688ace9cb3577987c08e84. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-average-power-12 — Media statistica e concatenazione di cicli

Una macchina chiusa opera ciclicamente con rendimento assegnato η=1/4 in ciascuna prova, senza altre sorgenti di energia. Q_h>0 è il calore ricevuto per ciclo, in J, t>0 la durata del ciclo in s. Il lavoro utile per ciclo è W=ηQ_h; P è la potenza utile media su quel ciclo, in watt. I cicli si susseguono senza intervalli inattivi quando si parla di funzionamento ripetuto. Non si richiede la potenza istantanea lungo le singole trasformazioni. A usa Q_h=80 J,t=2 s; B usa Q_h=1 J,t=1 s. Qual è la media aritmetica dei due P con uguale peso?

Procedimento d’autore: Le potenze sono10 W e1/4 W. La loro somma è41/4 W e la metà41/8 W. Due cicli concatenati trasferirebbero invece81/4 J in3 s, con potenza27/4 W: quella è una media pesata sulle durate, non la media statistica a pesi uguali richiesta. È anche il modello valutato su Q_h medio81/2 J e t medio3/2 s.

Passaggi esatti: \overline P=\frac{10+1/4}{2}\,\mathrm W;  \overline P=\frac{41}{8}\,\mathrm W;  P_{\rm concatenati}=\frac{27}{4}\,\mathrm W.

Distrattori e controllo didattico: Ventisette quarti corrisponde ai cicli concatenati. Quarantuno quarti non dimezza la somma e trentanove ottavi usa una sottrazione. Dieci copia il ciclo A e ignora B.

Fonte canonica SHA256 a52868f9204ed9696da73c806f6210c7c74436c0c48a14d62537db602d74dd17. Candidato SHA256 a48e59471161dab84a0e2f0b49b06c0e9b71f561d1af6984af8a162fd16bf1e8. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-average-power-13 — La durata richiesta per una potenza bersaglio

Una macchina chiusa opera ciclicamente con rendimento assegnato η=1/4 in ciascuna prova, senza altre sorgenti di energia. Q_h>0 è il calore ricevuto per ciclo, in J, t>0 la durata del ciclo in s. Il lavoro utile per ciclo è W=ηQ_h; P è la potenza utile media su quel ciclo, in watt. I cicli si susseguono senza intervalli inattivi quando si parla di funzionamento ripetuto. Non si richiede la potenza istantanea lungo le singole trasformazioni. A usa Q_h=80 J,t_A=2 s. B riceve Q_h,B=1 J e deve avere P_B=(1/40)P_A. Quanto vale t_B/t_A?

Procedimento d’autore: Un quarantesimo di10 W è1/4 W. Il lavoro B è1/4 J, quindi t_B=(1/4 J)/(1/4 W)=1 s. Il rapporto con i2 s di A vale1/2. La durata è positiva e ricostruisce il bersaglio.

Passaggi esatti: P_B=\frac14\,\mathrm W;  t_B=\frac{Q_{h,B}}{4P_B};  t_B=1\,\mathrm s;  t_B/t_A=\frac12.

Distrattori e controllo didattico: Due inverte il rapporto, un quarantesimo copia il bersaglio sulle potenze e un ottantesimo segue solo il calore. Uno imporrebbe t_B=2 s e darebbe1/8 W, metà del bersaglio.

Fonte canonica SHA256 999ff42a7f9164c789c5a2eb22dc6d9b3e334ecee5773da627192173ee842cbf. Candidato SHA256 e4fdb51f4707a2df904c4f120e4388896097b714cc9a5cd81ee9971297076837. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-average-power-14 — Il display di potenza non legge direttamente il calore

Una macchina chiusa opera ciclicamente con rendimento assegnato η=1/4 in ciascuna prova, senza altre sorgenti di energia. Q_h>0 è il calore ricevuto per ciclo, in J, t>0 la durata del ciclo in s. Il lavoro utile per ciclo è W=ηQ_h; P è la potenza utile media su quel ciclo, in watt. I cicli si susseguono senza intervalli inattivi quando si parla di funzionamento ripetuto. Non si richiede la potenza istantanea lungo le singole trasformazioni. S=qP è un display continuo adimensionale con q>0 costante. A: Q_h=80 J,t=2 s,S=30. B: t=1 s,S=3/4. Quanto vale Q_h,B in J?

Procedimento d’autore: A ha potenza10 W, dunque q=30/(10 W)=3 W⁻¹. La lettura B divisa per tre vale1/4 W. Moltiplicando per4t_B si ricava un joule ricevuto. La lettura frazionaria è un’uscita continua, non un numero intero di cicli.

Passaggi esatti: q=3\,\mathrm{W^{-1}};  P_B=\frac14\,\mathrm W;  Q_{h,B}=4P_Bt_B;  Q_{h,B}=1\,\mathrm J.

Distrattori e controllo didattico: Tre quarti è la lettura senza unità; usarla come watt darebbe3 J. Un quarto J copia il solo lavoro utile B, mentre l’ingresso è quattro volte maggiore.

Fonte canonica SHA256 a2b627c02b20ddc25c717196fdae5b21a66f775325c9902adc5bd9905f3deaa8. Candidato SHA256 2487b9b74bfc4c861614346147ceb94cc54650f98f9d1457f698736b9b2a7e9b. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-average-power-15 — La taratura affine prima della potenza utile

Una macchina chiusa opera ciclicamente con rendimento assegnato η=1/4 in ciascuna prova, senza altre sorgenti di energia. Q_h>0 è il calore ricevuto per ciclo, in J, t>0 la durata del ciclo in s. Il lavoro utile per ciclo è W=ηQ_h; P è la potenza utile media su quel ciclo, in watt. I cicli si susseguono senza intervalli inattivi quando si parla di funzionamento ripetuto. Non si richiede la potenza istantanea lungo le singole trasformazioni. Il display continuo è S=qP+b, con q>0 e q,b costanti. A: Q_h=80 J,t=2 s,S=21. B: Q_h=1 J,t=1 s,S=3/2. C: t=2 s,S=41. Quanto vale Q_h,C?

Procedimento d’autore: A e B hanno potenze10 W e1/4 W. La differenza delle letture è39/2 e quella delle potenze39/4 W: q=2 W⁻¹, poi b=1. C ha P_C=(41−1)/2=20 W. In2 s produce40 J utili e richiede160 J termici.

Passaggi esatti: q=2\,\mathrm{W^{-1}};  b=1;  P_C=20\,\mathrm W;  Q_{h,C}=4P_Ct_C;  Q_{h,C}=160\,\mathrm J.

Distrattori e controllo didattico: Ottanta J darebbero la potenza A e lettura21. Quaranta è il lavoro utile C. Centosessantaquattro J omette b, usa P=41/2 W e ricostruisce S=42. Trecentoventi raddoppia di nuovo la durata già conteggiata.

Fonte canonica SHA256 543afd6710b0d9dff2fd10ebd4190138817357238f5dce568da81983ad26be2f. Candidato SHA256 c2048376cfb0d0504253a04bad2e455c2ce049b68118445b946d8c5e139e0832. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-average-power-16 — Un vincolo che rende la misura ridondante

Una macchina chiusa opera ciclicamente con rendimento assegnato η=1/4 in ciascuna prova, senza altre sorgenti di energia. Q_h>0 è il calore ricevuto per ciclo, in J, t>0 la durata del ciclo in s. Il lavoro utile per ciclo è W=ηQ_h; P è la potenza utile media su quel ciclo, in watt. I cicli si susseguono senza intervalli inattivi quando si parla di funzionamento ripetuto. Non si richiede la potenza istantanea lungo le singole trasformazioni. Fra modi operativi diversi si impone Q_h=(40 J/s)t. Si misura P=10 W. Quali durate t>0 sono compatibili?

Procedimento d’autore: Sostituendo il vincolo nella potenza media resta P=(40 J/s)t/(4t)=10 W per ogni t positivo. La misura non fornisce una seconda condizione indipendente. Per esempio t=1 s,Q_h=40 J e t=2 s,Q_h=80 J sono entrambi validi. Il vincolo descrive prove diverse, non l’evoluzione del calore durante un singolo ciclo.

Passaggi esatti: P=\frac{(40\,\mathrm{J/s})t}{4t};  P=10\,\mathrm W\quad(t>0).

Distrattori e controllo didattico: Due secondi riprende il riferimento senza essere imposto. Dieci secondi copia il numero della potenza in un’altra unità. Nessuna ignora gli esempi e zero renderebbe il rapporto energia/durata indefinito.

Fonte canonica SHA256 9ef2b77ca586bbd5167fddf9a3bce7928ff930dfb76f4f084e450a707af72e4d. Candidato SHA256 a13774b4a5846ea6cddd13133b187b4b34983aef61bebaf7f10106c430227ad5. Review indipendente NOT_RUN; human NOT_RUN.
