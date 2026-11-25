# Authoring DRAFT — engine-efficiency-159

Tutti gli 80 prompt assegnati A158–162 sono stati letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605 prima di iniziare la riscrittura. Fonte U5-02 SHA256 66ade7951eecbdbea93c529a628b01c2e8bf393959f757a2cf82aeb03cabb95c. Compiti e casi speciali conservati; eventuali nuove parametrizzazioni sono dichiarate qui. Riletti i blocchi delle lezioni reali C3-L08/L09/L10 e il lavoro/potenza in C1-L007, oltre ai prerequisiti C3 pertinenti. Corso C3 e competenze del catalogo, nessuna lezione inventata.

Autore soltanto: revisione scientifica indipendente NOT_RUN, approvazione umana NOT_RUN, DRAFT e publicationAction NONE. Queste sono note di calcolo dell’autore, non un oracolo indipendente e non un’autofirma.

Due assembly in processi distinti hanno prodotto package e binding identici. Importatore canonico ROOT con percorso assoluto in SQLite temporaneo: 16 nuovi, poi 0 nuovi/16 invariati; 991 pubblicati e versioni storiche conservati, SHA dei pubblicati invariato. Asset SVG letto in XML e rendering nativo completo. Snapshot privata del runtime ROOT, fingerprint 54054f7ac463ef52f7c4c881d50ee071713315d891812696f18e39d9ad45ab3d, verificata uguale prima del replay. Runner canonico browser-batches.mjs ha realmente completato 48 viste a 1440/768/320 px con exit 0 e scritto atomicamente il proprio completion.json; marker riletto dal validatore canonico contro i byte finali. Report grezzo e marker sono conservati byte per byte in editorial/author-evidence. Nessun ritag di prove precedenti, nessuna modifica a runtime, CSS, registry o dati degli studenti. Queste prove tecniche non certificano la correttezza scientifica o l’esperienza umana.

Il caso03 conserva la proposta Kelvin–Planck come domanda distinta, senza assumere anticipatamente lo scarico positivo per dimostrarne il divieto. Nei casi numerici0<η<1. Il caso12 distingue media a pesi uguali13/20 e rendimento degli ingressi medi27/34. Il16 è non identificabile: il vincolo ripete il rendimento. Letture del display continue e adimensionali. Le temperature non assegnate non autorizzano a imporre sorgenti uguali fra prove.

Il primo replay ha correttamente fallito sul caso03 a320 px per una frase troppo lunga inclusa nella formula. La frase resta nel testo esplicativo, mentre il blocco matematico contiene soltanto Q=W. Il primo report non vale come prova positiva e non ha completion; il secondo replay completo sui byte finali è quello conservato.

## AR-u5-engine-efficiency-01 — Quale parte del calore diventa lavoro

Una macchina ciclica chiusa assorbe il modulo Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda; 0<Q_c<Q_h. Non vi sono altri apporti energetici, e le energie macroscopiche ritornano ai valori iniziali. W=Q_h−Q_c è il lavoro netto uscente e η=W/Q_h il rendimento. I calori sono in J. Le temperature delle sorgenti non sono assegnate: ciascuna prova è fisicamente compatibile col secondo principio, senza imporre sorgenti identiche fra prove. Q_h=100 J e Q_c=20 J. Quanto vale η, come numero puro?

Procedimento d’autore: Nel ciclo l’energia interna non cambia. Dei cento joule ricevuti, venti sono ceduti e ottanta diventano lavoro. Ottanta su cento si riduce a quattro quinti: il rendimento confronta l’uscita utile con l’ingresso, non con lo scarico.

Passaggi esatti: W=(100-20)\,\mathrm J;  W=80\,\mathrm J;  \eta=\frac{W}{Q_h};  \eta=\frac45.

Distrattori e controllo didattico: Un quinto è la frazione ceduta. Cinque è Q_h/Q_c e sei quinti somma lo scarico all’ingresso. Ottanta è il lavoro espresso in joule, non il rendimento puro. Qui quattro quinti equivale all’80%, ma non a 80 come numero puro.

Fonte canonica SHA256 99b4d5d3a859fb9f73b5453e6709dc0f2f7e000123a06575fee689be117de7f1. Candidato SHA256 8e8ee1ba00429c1fe57634bd65f44147b44f1afa20d9d869cd3a5634aae3d3e0. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-efficiency-02 — Il rendimento non è un’energia

Il rendimento termico è η=W/Q_h, rapporto fra lavoro e calore ricevuto, entrambi in J. Quale unità lo esprime?

Procedimento d’autore: Il rapporto di due energie ha unità J/J=1. Si può esprimerlo come frazione o percentuale, mantenendo il fattore cento della notazione percentuale. L’assenza di dimensione non lo rende uguale a qualsiasi altro rapporto energetico.

Passaggi esatti: [\eta]=\mathrm J/\mathrm J;  [\eta]=1.

Distrattori e controllo didattico: J misura energia e W potenza; J/K una capacità termica e K una temperatura. Nessuna durata è presente nel rendimento, quindi non compare il watt.

Fonte canonica SHA256 c39be189a1a5f57732f83401fb2d4b40a58c7cb86df02ac44d6d11dbafd4fb1a. Candidato SHA256 60eac17d725f3f80295e1e2a446919b02b30e48925b6361edf2d23e9846b6017. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-efficiency-03 — Il limite del secondo principio

Si propone una macchina ciclica il cui unico effetto sia assorbire calore da una sola sorgente e convertirlo integralmente in lavoro. Non vi sono altri cambiamenti o trasferimenti. Quale giudizio è corretto?

Procedimento d’autore: Il primo principio, da solo, ammetterebbe Q=W e ΔU_ciclo=0. L’enunciato di Kelvin–Planck del secondo principio vieta che questo sia l’unico effetto di una macchina ciclica in contatto con una sola sorgente. La restrizione riguarda la trasformazione proposta, non il solo materiale del fluido. Non si assume in partenza Q_c>0 per dimostrare il divieto.

Passaggi esatti: \Delta U_{\rm ciclo}=0;  Q=W.

Distrattori e controllo didattico: Calore e lavoro hanno la stessa dimensione. Aumentare Q non elimina il divieto, e chiudere il ciclo è proprio una delle condizioni dell’enunciato. Non si sta affermando che una singola espansione non ciclica non possa trasformare tutto il calore ricevuto in lavoro.

Fonte canonica SHA256 e37619da97dc1e4f5d33cc4d6b2273976a1544e3e15a05d1029eb6cd988a850c. Candidato SHA256 c4a132de0878074da53c3476c5b60e46ac835d8df290d9bda25a31660052158a. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-efficiency-04 — Stesso scarico e calore ricevuto doppio

Una macchina ciclica chiusa assorbe il modulo Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda; 0<Q_c<Q_h. Non vi sono altri apporti energetici, e le energie macroscopiche ritornano ai valori iniziali. W=Q_h−Q_c è il lavoro netto uscente e η=W/Q_h il rendimento. I calori sono in J. Le temperature delle sorgenti non sono assegnate: ciascuna prova è fisicamente compatibile col secondo principio, senza imporre sorgenti identiche fra prove. A ha Q_h=100 J,Q_c=20 J. B ha Q_h=200 J e lo stesso Q_c=20 J. Come cambia η?

Procedimento d’autore: La frazione persa è inizialmente 20/100=1/5, poi 20/200=1/10. Sottraendola da uno il rendimento passa da quattro quinti a nove decimi. Il lavoro aumenta da ottanta a centottanta joule, ma anche il denominatore Q_h cambia.

Passaggi esatti: \eta_A=1-\frac{20}{100};  \eta_A=\frac45;  \eta_B=1-\frac{20}{200};  \eta_B=\frac9{10}.

Distrattori e controllo didattico: Otto quinti raddoppia direttamente il rendimento e supera uno. Due quinti lo dimezza come se fosse inverso a Q_h; un decimo è la sola quota ceduta. Quattro quinti richiederebbe il raddoppio anche di Q_c.

Fonte canonica SHA256 d927589f15724e95abb84774eb5b7c2431a8bff5b3b6e0ba0651a2a494c971e8. Candidato SHA256 e71c91a66da05f5c19e104744a0c215af86ed0caa9a7b4df0e6d8cc39e8e6bd9. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-efficiency-05 — Il calore necessario per un dato rendimento

Una macchina ciclica chiusa assorbe il modulo Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda; 0<Q_c<Q_h. Non vi sono altri apporti energetici, e le energie macroscopiche ritornano ai valori iniziali. W=Q_h−Q_c è il lavoro netto uscente e η=W/Q_h il rendimento. I calori sono in J. Le temperature delle sorgenti non sono assegnate: ciascuna prova è fisicamente compatibile col secondo principio, senza imporre sorgenti identiche fra prove. η=4/5 e Q_c=20 J. Quanto vale Q_h in J?

Procedimento d’autore: Da η=1−Q_c/Q_h resta 1−η=1/5. Questa è la quota di ingresso ceduta al freddo. Venti joule sono quindi un quinto di Q_h: moltiplichiamo per cinque e otteniamo cento joule. Il denominatore è positivo perché η<1.

Passaggi esatti: 1-\eta=\frac{Q_c}{Q_h};  Q_h=\frac{Q_c}{1-\eta};  Q_h=100\,\mathrm J.

Distrattori e controllo didattico: Venticinque J divide Q_c per η, usando la frazione utile al posto di quella ceduta. Quattro J moltiplica per un quinto anziché dividere; ottanta J sarebbe il lavoro del ciclo trovato, non il calore assorbito.

Fonte canonica SHA256 f8d2d309e8ef540f5c74d80f11837df85e367de65c8ab80a4304c9226dda5714. Candidato SHA256 283e4f2b82d8185d6a612a64e2aadb048705893d58760c90b0b9f884e65ab9c7. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-efficiency-06 — La parte non trasformata in lavoro

Una macchina ciclica chiusa assorbe il modulo Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda; 0<Q_c<Q_h. Non vi sono altri apporti energetici, e le energie macroscopiche ritornano ai valori iniziali. W=Q_h−Q_c è il lavoro netto uscente e η=W/Q_h il rendimento. I calori sono in J. Le temperature delle sorgenti non sono assegnate: ciascuna prova è fisicamente compatibile col secondo principio, senza imporre sorgenti identiche fra prove. η=4/5 e Q_h=100 J. Quanto vale Q_c in J?

Procedimento d’autore: Il rendimento indica che quattro quinti del calore diventano lavoro. Il restante quinto è ceduto alla sorgente fredda: cento diviso cinque è venti. Il lavoro sarebbe ottanta joule e la somma delle due uscite restituisce l’ingresso.

Passaggi esatti: Q_c=(1-\eta)Q_h;  Q_c=\frac15\,100\,\mathrm J;  Q_c=20\,\mathrm J.

Distrattori e controllo didattico: Ottanta J usa ηQ_h, che è W. Centoventicinque divide per η e meno venti assegna al modulo Q_c il segno del calore ricevuto dal fluido. L’inversa richiesta è una moltiplicazione per la quota persa.

Fonte canonica SHA256 d2408f205fc7fd980aa0642b4e31a2d7920aa380fb1dcb13cbff2210b22d8858. Candidato SHA256 c7edd9ed2a129d952cce6197a40bf1166029421a413ea7a2f748444edd3a5d0e. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-efficiency-07 — Confrontare due quote di scarico

Una macchina ciclica chiusa assorbe il modulo Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda; 0<Q_c<Q_h. Non vi sono altri apporti energetici, e le energie macroscopiche ritornano ai valori iniziali. W=Q_h−Q_c è il lavoro netto uscente e η=W/Q_h il rendimento. I calori sono in J. Le temperature delle sorgenti non sono assegnate: ciascuna prova è fisicamente compatibile col secondo principio, senza imporre sorgenti identiche fra prove. A ha Q_h=100 J,Q_c=20 J. B mantiene Q_h e ha Q_c=40 J. Quanto vale η_B/η_A?

Procedimento d’autore: Il rendimento A è ottanta su cento, quattro quinti. B compie sessanta joule e ha rendimento tre quinti. Il quoziente (3/5)/(4/5) è tre quarti: la stessa entrata e uno scarico maggiore riducono la quota utile.

Passaggi esatti: \eta_A=\frac45;  \eta_B=\frac35;  \eta_B/\eta_A=\frac34.

Distrattori e controllo didattico: Quattro terzi capovolge il rapporto. Due segue lo scarico, non il rendimento; un mezzo dimezza erroneamente la quota utile e uno ignora la perdita aggiuntiva.

Fonte canonica SHA256 221186740ab66d10ed6fa53ada18e3352dec726ad94d08f8f1f59718d697d0e5. Candidato SHA256 ca22c0ccdd4f7e84ab8f6c80cec59d6a8645d5b08aac5cbad2ba0fd5f8bfb615. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-efficiency-08 — Un rendimento proposto oltre il limite energetico

Una macchina ciclica chiusa assorbe il modulo Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda; 0<Q_c<Q_h. Non vi sono altri apporti energetici, e le energie macroscopiche ritornano ai valori iniziali. W=Q_h−Q_c è il lavoro netto uscente e η=W/Q_h il rendimento. I calori sono in J. Le temperature delle sorgenti non sono assegnate: ciascuna prova è fisicamente compatibile col secondo principio, senza imporre sorgenti identiche fra prove. Per Q_h=100 J e Q_c=20 J si propone η=8/5. Quanto vale proposta meno valore corretto?

Procedimento d’autore: Il rendimento corretto è quattro quinti. Otto quinti meno quattro quinti dà quattro quinti, senza unità. La proposta supererebbe uno e richiederebbe lavoro maggiore del solo calore ricevuto: non rispetta il bilancio di questa macchina.

Passaggi esatti: \eta=\frac45;  e=\frac85-\frac45;  e=\frac45.

Distrattori e controllo didattico: Meno quattro quinti cambia l’ordine dello scarto. Otto quinti ripete la proposta, zero non la corregge e un quinto è la frazione di calore ceduto, non lo scarto.

Fonte canonica SHA256 037ca2aa72640d642e7bae982327550a0e852e1638a53ec387f999d457bb5538. Candidato SHA256 72e72cf4139377443c6d4fa84bd94575f8d94b45ad0277f1bdae514450409aab. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-efficiency-09 — L’inversa e il denominatore fisico

Una macchina ciclica chiusa assorbe il modulo Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda; 0<Q_c<Q_h. Non vi sono altri apporti energetici, e le energie macroscopiche ritornano ai valori iniziali. W=Q_h−Q_c è il lavoro netto uscente e η=W/Q_h il rendimento. I calori sono in J. Le temperature delle sorgenti non sono assegnate: ciascuna prova è fisicamente compatibile col secondo principio, senza imporre sorgenti identiche fra prove. Q_c e η sono noti, con 0<η<1. Quale formula determina Q_h?

Procedimento d’autore: Moltiplicando 1−η=Q_c/Q_h per Q_h e dividendo per 1−η si ricava Q_h=Q_c/(1−η). Il divisore è positivo e minore di uno: l’ingresso risulta maggiore dello scarico. Il caso η=1 è escluso e non va inserito in questa inversa.

Passaggi esatti: (1-\eta)Q_h=Q_c;  Q_h=\frac{Q_c}{1-\eta};  1-\eta>0.

Distrattori e controllo didattico: Dividere per η usa la frazione di lavoro. Moltiplicare per 1−η inverte l’operazione necessaria; η−1 renderebbe negativo Q_h. L’ultimo rapporto ha unità J⁻¹ invece di J.

Fonte canonica SHA256 0f66933a2d4619ed4346b9719ac7ed4018bae1ad5112dc023534d9bb7de7465a. Candidato SHA256 c21dc76dc8f53efa8ce9d9aecec798f1bbd948c16d88489e8bcb27539bf88f6a. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-efficiency-10 — Scalare entrambi gli scambi prima del rendimento

Una macchina ciclica chiusa assorbe il modulo Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda; 0<Q_c<Q_h. Non vi sono altri apporti energetici, e le energie macroscopiche ritornano ai valori iniziali. W=Q_h−Q_c è il lavoro netto uscente e η=W/Q_h il rendimento. I calori sono in J. Le temperature delle sorgenti non sono assegnate: ciascuna prova è fisicamente compatibile col secondo principio, senza imporre sorgenti identiche fra prove. B ha Q_h,B=κ₁Q_h e Q_c,B=κ₂Q_c, con κ₁,κ₂>0 e κ₁Q_h>κ₂Q_c; i simboli senza pedice sono di A. Quanto vale η_B/η_A?

Procedimento d’autore: In B il lavoro è κ₁Q_h−κ₂Q_c, ma il suo ingresso è κ₁Q_h. Dividendo il rendimento B per (Q_h−Q_c)/Q_h si cancella Q_h e rimane il rapporto indicato. Un fattore comune κ₁=κ₂ non cambia il rendimento, benché cambi tutte le energie.

Passaggi esatti: \eta_B=1-\frac{\kappa_2Q_c}{\kappa_1Q_h};  \eta_A=1-\frac{Q_c}{Q_h};  \frac{\eta_B}{\eta_A}=\frac{\kappa_1Q_h-\kappa_2Q_c}{\kappa_1(Q_h-Q_c)}.

Distrattori e controllo didattico: Il solo quoziente dei fattori ignora la sottrazione e il prodotto darebbe κ² per un fattore comune. Omettere κ₁ dal denominatore produce il rapporto dei lavori, non dei rendimenti. La differenza dei fattori darebbe zero per la stessa macchina.

Fonte canonica SHA256 c67575ff9123becbf259906c0e487f0025360500bcd29e78d443e418490050e4. Candidato SHA256 774399df24b89130548827e5b829acbda5eebe5ed095ef6676174bd7e3440fc0. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-efficiency-11 — Un ciclo piccolo può avere rendimento diverso

Una macchina ciclica chiusa assorbe il modulo Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda; 0<Q_c<Q_h. Non vi sono altri apporti energetici, e le energie macroscopiche ritornano ai valori iniziali. W=Q_h−Q_c è il lavoro netto uscente e η=W/Q_h il rendimento. I calori sono in J. Le temperature delle sorgenti non sono assegnate: ciascuna prova è fisicamente compatibile col secondo principio, senza imporre sorgenti identiche fra prove. A ha Q_h=100 J,Q_c=20 J. B ha Q_h=2 J,Q_c=1 J. Quanto vale η_B/η_A?

Procedimento d’autore: A trasforma ottanta joule su cento, rendimento quattro quinti. B trasforma un joule su due, rendimento un mezzo. Dividere un mezzo per quattro quinti equivale a moltiplicarlo per cinque quarti: cinque ottavi. La piccola energia per ciclo non rende da sola piccolo il rendimento.

Passaggi esatti: \eta_A=\frac45;  \eta_B=\frac12;  \eta_B/\eta_A=\frac12\frac54;  \eta_B/\eta_A=\frac58.

Distrattori e controllo didattico: Otto quinti è il reciproco. Un ottantesimo confronta i lavori e un cinquantesimo gli ingressi termici; un ventesimo segue gli scarichi. Sono rapporti diversi da quello delle quote utili.

Fonte canonica SHA256 94fe5b6abb03424c839367cb22a284e8bdea1a1550d974c01170c939990079f4. Candidato SHA256 a9b51439e2fd754074f7961cabcbe8c740dc48818ad287a7dbeaa1b7f55a2e94. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-efficiency-12 — Media di rendimenti e rendimento degli ingressi medi

Una macchina ciclica chiusa assorbe il modulo Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda; 0<Q_c<Q_h. Non vi sono altri apporti energetici, e le energie macroscopiche ritornano ai valori iniziali. W=Q_h−Q_c è il lavoro netto uscente e η=W/Q_h il rendimento. I calori sono in J. Le temperature delle sorgenti non sono assegnate: ciascuna prova è fisicamente compatibile col secondo principio, senza imporre sorgenti identiche fra prove. A ha Q_h=100 J,Q_c=20 J. B ha Q_h=2 J,Q_c=1 J. Qual è la media aritmetica dei due η con uguale peso?

Procedimento d’autore: I rendimenti quattro quinti e un mezzo diventano otto decimi e cinque decimi. La metà di tredici decimi è tredici ventesimi. Usando invece i calori medi si ottengono Q_h=51 J,Q_c=21/2 J e rendimento 27/34: è una diversa operazione, che pesa implicitamente di più il ciclo con ingresso maggiore.

Passaggi esatti: \overline\eta=\frac{\frac45+\frac12}{2};  \overline\eta=\frac{13}{20};  \eta_{\rm ingressi\ medi}=\frac{27}{34}.

Distrattori e controllo didattico: Ventisette trentaquattresimi risponde al modello sugli ingressi medi. Tredici decimi è la somma senza dimezzare e tre decimi la differenza. Un mezzo copia B. Le due medie non coincidono: 13·34=442 e 27·20=540.

Fonte canonica SHA256 e1e3e413e97cc12a0ca674413d6e34d8b21553501be0d9e9f30cc6b10eef1b6d. Candidato SHA256 009fc9b9736c861a353cdf13098a1ce9ff0dd3de6c3854aeb7d9f3caf2fa4d95. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-efficiency-13 — Lo scarico che realizza un rapporto bersaglio

Una macchina ciclica chiusa assorbe il modulo Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda; 0<Q_c<Q_h. Non vi sono altri apporti energetici, e le energie macroscopiche ritornano ai valori iniziali. W=Q_h−Q_c è il lavoro netto uscente e η=W/Q_h il rendimento. I calori sono in J. Le temperature delle sorgenti non sono assegnate: ciascuna prova è fisicamente compatibile col secondo principio, senza imporre sorgenti identiche fra prove. A ha Q_h=100 J,Q_c,A=20 J. B riceve Q_h,B=2 J e deve avere η_B=(5/8)η_A. Quanto vale Q_c,B/Q_c,A?

Procedimento d’autore: Il bersaglio è cinque ottavi di quattro quinti, un mezzo. La macchina B deve cedere la metà dei suoi due joule: un joule. Il rapporto fra lo scarico B e i venti joule di A è un ventesimo. Il ciclo B compie l’altro joule come lavoro positivo.

Passaggi esatti: \eta_B=\frac58\frac45;  \eta_B=\frac12;  Q_{c,B}=1\,\mathrm J;  Q_{c,B}/Q_{c,A}=\frac1{20}.

Distrattori e controllo didattico: Venti è il reciproco; cinque ottavi copia il rapporto imposto ai rendimenti. Un cinquantesimo è il rapporto fra i calori ricevuti. Uno confonde il valore numerico di Q_c,B in J con il rapporto richiesto.

Fonte canonica SHA256 952e274472b4bffa63d6a90d78338897d30ac0e86d84400cebb492dbf6d8b415. Candidato SHA256 02fa9199dbfd93b59224e850711e7f61df7b36bcfe335bb8d92a29ca40c5b097. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-efficiency-14 — Un display continuo della quota utile

Una macchina ciclica chiusa assorbe il modulo Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda; 0<Q_c<Q_h. Non vi sono altri apporti energetici, e le energie macroscopiche ritornano ai valori iniziali. W=Q_h−Q_c è il lavoro netto uscente e η=W/Q_h il rendimento. I calori sono in J. Le temperature delle sorgenti non sono assegnate: ciascuna prova è fisicamente compatibile col secondo principio, senza imporre sorgenti identiche fra prove. Il display continuo adimensionale è S=qη con q>0 costante. A: Q_h=100 J,Q_c=20 J,S=12/5. B: Q_c=1 J,S=3/2. Quanto vale Q_h,B in J?

Procedimento d’autore: A ha η=4/5, quindi q=(12/5)/(4/5)=3. In B la lettura tre mezzi divisa per tre dà rendimento un mezzo. Il calore ceduto è allora metà dell’ingresso: un joule diviso un mezzo dà due joule ricevuti.

Passaggi esatti: q=3;  \eta_B=\frac{3/2}{3};  \eta_B=\frac12;  Q_{h,B}=2\,\mathrm J.

Distrattori e controllo didattico: Tre mezzi è una lettura, non un calore. Usarla direttamente come rendimento darebbe η>1 e ingresso negativo nell’inversa. Un joule copia Q_c. Le letture frazionarie sono ammesse perché il display è continuo, non un conteggio di eventi.

Fonte canonica SHA256 358fca8e5472ec99c8918f5cd06e1395b5b5d8e22574a069ded46d0695e07016. Candidato SHA256 06035bb23ca6a25ec675f509f32a16faa014f2062d1125f0cd24aae3b873cfa2. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-efficiency-15 — Offset e guadagno prima dell’inversa

Una macchina ciclica chiusa assorbe il modulo Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda; 0<Q_c<Q_h. Non vi sono altri apporti energetici, e le energie macroscopiche ritornano ai valori iniziali. W=Q_h−Q_c è il lavoro netto uscente e η=W/Q_h il rendimento. I calori sono in J. Le temperature delle sorgenti non sono assegnate: ciascuna prova è fisicamente compatibile col secondo principio, senza imporre sorgenti identiche fra prove. Il display continuo è S=qη+b, con q>0 e q,b costanti. A: Q_h=100 J,Q_c=20 J,S=13/5. B: Q_h=2 J,Q_c=1 J,S=2. C: Q_c=20 J,S=14/5. Quanto vale Q_h,C?

Procedimento d’autore: Fra A e B il rendimento cambia di tre decimi e S di tre quinti: q=2. Da B resta b=1. Per C, (14/5−1)/2=9/10, dunque 1−η_C=1/10. Venti joule ceduti sono un decimo dell’ingresso: Q_h,C=200 J.

Passaggi esatti: q=2;  b=1;  \eta_C=\frac9{10};  Q_{h,C}=\frac{20}{1/10}\,\mathrm J;  Q_{h,C}=200\,\mathrm J.

Distrattori e controllo didattico: Cento J tornerebbe al rendimento A e alla lettura 13/5. Venti J darebbe η=0. Meno cinquanta J nasce ignorando b, ottenendo η=7/5 fuori dominio. 200/9 J divide per η anziché per la quota ceduta.

Fonte canonica SHA256 e3bce56b1f86c1614695e30c98a908e66e2a255fa340f47c746a7682ccf0dfee. Candidato SHA256 43ec110752923e3144011119d59619cb1956e1f4b5ca8a783992df04983598fc. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-engine-efficiency-16 — Un rendimento che non fissa la scala energetica

Una macchina ciclica chiusa assorbe il modulo Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda; 0<Q_c<Q_h. Non vi sono altri apporti energetici, e le energie macroscopiche ritornano ai valori iniziali. W=Q_h−Q_c è il lavoro netto uscente e η=W/Q_h il rendimento. I calori sono in J. Le temperature delle sorgenti non sono assegnate: ciascuna prova è fisicamente compatibile col secondo principio, senza imporre sorgenti identiche fra prove. Fra prove vale Q_h=5Q_c. Una misura dà η=4/5. Quali valori di Q_c>0 sono compatibili?

Procedimento d’autore: Il vincolo sostituito nella legge dà η=1−Q_c/(5Q_c)=4/5 per ogni Q_c positivo. La misura ripete la stessa informazione e non seleziona un’energia. Per esempio Q_c=1 J,Q_h=5 J e Q_c=20 J,Q_h=100 J sono due cicli distinti con uguale rendimento.

Passaggi esatti: \eta=1-\frac{Q_c}{5Q_c};  \eta=\frac45\quad(Q_c>0).

Distrattori e controllo didattico: Venti J riprende un esempio senza essere imposto. Quattro quinti J attribuisce al rendimento puro un’unità di energia. Nessuno nega due esempi validi; zero viola i moduli strettamente positivi e renderebbe il rapporto indeterminato.

Fonte canonica SHA256 ddfc0382a6c0d6bb3d8b40fc1a544823f13594b4e2ca1634ec1a85022f1589e2. Candidato SHA256 e03667a2ea1f0a9edbef9f8e06cf980a12f3b227c7ccc2346254e553355849f0. Review indipendente NOT_RUN; human NOT_RUN.
