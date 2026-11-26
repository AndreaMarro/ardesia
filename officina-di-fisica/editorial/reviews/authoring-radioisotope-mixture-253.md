# Authoring DRAFT — radioisotope-mixture-253

Tutti gli 80 prompt originali A250–254 sono stati letti individualmente tramite allowlist id/prompt prima del primo candidato U7-02. Fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U7-02 SHA256 43ad92dba82bc16829a60f11071965f30bf0d8e115def3c1dc5eb2a3e229aeb7. Le quantità statistiche sono distinte dai conteggi di eventi di un singolo nucleo; esponenti sempre adimensionali e parametri costanti entro una preparazione.

Entrambe le primarie sono state congelate prima dell’autoria: A per B255–259 SHA 5b685efd1f9081ea829990d63cf50291ffc298c922b8aac2b169b8de5cdaa3e4 su d0628ef617dc36ac03d018a854de21fdb3da4f28; B per A250–254 SHA 51439933fe3974da7552b58de5f9929aecd44ed758e84ab1e1a0c379c47515d2 su 7518f76e54b9d05ab1b03548e6113339afd40db9, mai aperta dall’autore A. Nessun candidato, opzione, chiave, hint, solutionSteps o SVG B255–259 letto durante l’autoria A.

Letta integralmente la lezione reale C5-L08 «Una popolazione di nuclei che cambia nel tempo» al pin Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, comprese formule e figura storica C5-emivita.svg. Copre esplicitamente popolazione media, emivita, attività, alfa/beta/gamma e condizioni del rivelatore. Skill primaria C5-L08, prerequisiti reali C1-L001/C5-L08. Nessun ID inventato.

Autore soltanto: DRAFT, SCI distinta NOT_RUN_BY_AUTHOR, human NOT_RUN, publicationAction NONE. Due processi separati dell’assembler unico hanno prodotto package/binding byte-identici. Import canonico ROOT in sola lettura su SQLite temporaneo con timeout originale: 16 nuovi e poi 0 nuovi/16 invariati; 991 pubblicati e storico conservati. Nessun credito di integrazione attribuito dall’autore.

SVG-only effettivamente renderizzato in browser nativo, XML e PNG completo letti dopo exit 0 reale del processo. Mutex condiviso e guardia ≥2 GiB rispettati. UI prodotto locale vietata e NOT_RUN; replay a 320px riservato al runner canonico. Le figure mostrano grandezze fisiche e non metriche in pixel.

## AR-u7-radioisotope-mixture-01 — Due orologi nucleari nello stesso campione

Un campione chiuso contiene due radionuclidi genitori indipendenti, con attività iniziali A₁>0 e A₂>0. Il primo ha emivita 1 h, il secondo 30 min. Non c’è nuova produzione di genitori né contributo dei figli all’attività richiesta. Tutte le uscite si osservano dopo 1 h: il primo contributo è A₁/2, il secondo A₂/4. Le attività sono tassi medi in Bq e le prove confrontano preparazioni distinte con dati finiti. Con A₁=8 Bq e A₂=8 Bq, quanto vale l’attività totale dopo 1 h, in Bq?

Procedimento d’autore: In un’ora il primo radionuclide trascorre una emivita e passa da 8 a 4 Bq. Il secondo trascorre due emivite: 60/30=2, quindi passa da 8 a 2 Bq. I tassi delle due popolazioni indipendenti si sommano: totale 6 Bq.

Formule: A_{\rm tot}=\frac{A_1}{2}+\frac{A_2}{4};  A_{\rm tot}=4\,\mathrm{Bq}+2\,\mathrm{Bq};  A_{\rm tot}=6\,\mathrm{Bq}.

Distrattori e controprove: Otto Bq dimezzerebbe entrambi i contributi una sola volta. Sedici ignora il tempo trascorso; quattro conserva soltanto il primo contributo e due soltanto il secondo. Le emivite non si sommano per ottenere una emivita comune.

Hint: Conta separatamente quante emivite trascorre ciascuna specie.

Fonte SHA256 6f5122ae64e304dfc99341bc19721cda84457cc7c521b4f6b82a1c837dc0ff30. Candidato SHA256 70b6669e5fd364642a5bc1193eea9c47e51ea2999d5ed3a2c00f21401bbdfe59. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioisotope-mixture-02 — Somma di tassi medi

Quale unità SI è adatta all’attività totale di due popolazioni radioattive indipendenti?

Procedimento d’autore: La somma di due tassi di trasformazioni conserva la dimensione di un tasso. Un Bq è un decadimento medio per secondo. Il totale non indica direttamente né energia emessa né numero totale di nuclei presenti.

Formule: [A_{\rm tot}]=\mathrm{s^{-1}};  1\,\mathrm{Bq}=1\,\mathrm{s^{-1}}.

Distrattori e controprove: J misura energia, s un tempo, C carica e m una lunghezza. Le due attività vanno espresse nella stessa scala prima della somma.

Hint: Somma grandezze dello stesso tipo e con unità coerenti.

Fonte SHA256 fdf3c03d58db78d874f8d922902bceea3a3891c8c0d1ee5e148e4234dd867ac0. Candidato SHA256 1fff613a82646c476ae3d26e863ccac25142b51eafbc2f46c1b09cdda23932b2. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioisotope-mixture-03 — La somma arriva dopo i due decadimenti

Un campione chiuso contiene due radionuclidi genitori indipendenti, con attività iniziali A₁>0 e A₂>0. Il primo ha emivita 1 h, il secondo 30 min. Non c’è nuova produzione di genitori né contributo dei figli all’attività richiesta. Tutte le uscite si osservano dopo 1 h: il primo contributo è A₁/2, il secondo A₂/4. Le attività sono tassi medi in Bq e le prove confrontano preparazioni distinte con dati finiti. Quale formula dà l’attività totale al tempo assegnato?

Procedimento d’autore: La stessa ora rappresenta un intervallo di emivita per il primo e due per il secondo. Applico a ciascuna attività iniziale la propria frazione residua e sommo soltanto i risultati. Non esiste un unico dimezzamento comune alle due specie.

Formule: A_1(1\,\mathrm h)=A_1/2;  A_2(1\,\mathrm h)=A_2/4;  A_{\rm tot}=A_1/2+A_2/4.

Distrattori e controprove: Dimezzare o dividere per quattro tutta la somma assegna la stessa emivita alle due specie. Il prodotto delle attività ha dimensione Bq². Scambiare i denominatori attribuisce al genitore sbagliato la propria legge di decadimento.

Hint: Segui ogni popolazione fino al tempo comune prima di formare il totale.

Fonte SHA256 5d4157cf99b862f3580cc24fed2106c2b7f3e8c7ca37227ec14f24c8ce559a09. Candidato SHA256 1f2c48e64c4b52220bb0daa3d4a28cce60f60a02f514dcc94bc0397d5284d65e. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioisotope-mixture-04 — Raddoppia soltanto la prima attività iniziale

Un campione chiuso contiene due radionuclidi genitori indipendenti, con attività iniziali A₁>0 e A₂>0. Il primo ha emivita 1 h, il secondo 30 min. Non c’è nuova produzione di genitori né contributo dei figli all’attività richiesta. Tutte le uscite si osservano dopo 1 h: il primo contributo è A₁/2, il secondo A₂/4. Le attività sono tassi medi in Bq e le prove confrontano preparazioni distinte con dati finiti. A ha A₁=8 Bq,A₂=8 Bq. B ha A₁=16 Bq,A₂=8 Bq. Come cambia il totale dopo 1 h?

Procedimento d’autore: Il primo contributo finale raddoppia da 4 a 8 Bq. Il secondo resta 2 Bq, quindi il totale passa da 6 a 10 Bq. Raddoppiare un solo ingresso non raddoppia una somma con un altro contributo positivo invariato.

Formule: A_{{\rm tot},A}=6\,\mathrm{Bq};  A_{{\rm tot},B}=8\,\mathrm{Bq}+2\,\mathrm{Bq};  A_{{\rm tot},B}=10\,\mathrm{Bq}.

Distrattori e controprove: 12 Bq raddoppierebbe anche il secondo ingresso. Tre dimezza erroneamente il totale, sei ignora il cambiamento e venti raddoppia ancora il nuovo totale.

Hint: Mantieni fisso il contributo che non cambia.

Fonte SHA256 5c3410abd4d008c2f74be1969cdddb2a06bac8db311c70ff8140cb0e46cab36a. Candidato SHA256 2d0cfd56685585e62cb788cc711e66a4d116a691a098a1d8f5c48dc636337d11. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioisotope-mixture-05 — Separare il primo contributo noto il secondo

Un campione chiuso contiene due radionuclidi genitori indipendenti, con attività iniziali A₁>0 e A₂>0. Il primo ha emivita 1 h, il secondo 30 min. Non c’è nuova produzione di genitori né contributo dei figli all’attività richiesta. Tutte le uscite si osservano dopo 1 h: il primo contributo è A₁/2, il secondo A₂/4. Le attività sono tassi medi in Bq e le prove confrontano preparazioni distinte con dati finiti. Il totale a 1 h è 6 Bq e A₂ iniziale vale 8 Bq. Quanto vale A₁ iniziale in Bq?

Procedimento d’autore: Il secondo contributo finale è 2 Bq. Lo sottraggo dal totale: restano 4 Bq dovuti al primo. Per ricostruire il suo inizio moltiplico per due e ottengo 8 Bq. Il residuo deve essere strettamente positivo.

Formule: A_1=2\left(A_{\rm tot}-A_2/4\right);  A_1=2(6-2)\,\mathrm{Bq};  A_1=8\,\mathrm{Bq}.

Distrattori e controprove: Quattro copia il primo contributo finale, senza l’inversa. Dodici raddoppia tutto il totale senza sottrarre la seconda specie; 16 moltiplica ancora per due il valore corretto. Occorre A_tot>A₂/4, non basta un totale positivo.

Hint: Togli prima la parte nota e poi annulla il suo dimezzamento.

Fonte SHA256 4d8b3fb3233b072f31b6309726d8f035dd50cfa97aed2be71dc999cb90a37c85. Candidato SHA256 4328695a42e4bf07883c1b7abed1de4d99d27079f204e2ffb90c9f2badd4f2aa. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioisotope-mixture-06 — Separare il secondo contributo

Un campione chiuso contiene due radionuclidi genitori indipendenti, con attività iniziali A₁>0 e A₂>0. Il primo ha emivita 1 h, il secondo 30 min. Non c’è nuova produzione di genitori né contributo dei figli all’attività richiesta. Tutte le uscite si osservano dopo 1 h: il primo contributo è A₁/2, il secondo A₂/4. Le attività sono tassi medi in Bq e le prove confrontano preparazioni distinte con dati finiti. Il totale a 1 h è 6 Bq e A₁ iniziale vale 8 Bq. Quanto vale A₂ iniziale in Bq?

Procedimento d’autore: Il primo contributo finale è 4 Bq, quindi il secondo deve dare 2 Bq. È rimasto un quarto della sua attività iniziale: moltiplico 2 per quattro e ritrovo 8 Bq. L’inversa richiede un totale maggiore di A₁/2.

Formule: A_2=4\left(A_{\rm tot}-A_1/2\right);  A_2=4(6-4)\,\mathrm{Bq};  A_2=8\,\mathrm{Bq}.

Distrattori e controprove: Due copia il contributo finale e quattro lo inverte come se fosse una sola emivita. Ventiquattro moltiplica tutto il totale per quattro ignorando il primo radionuclide. Un residuo negativo sarebbe incompatibile col modello.

Hint: Per la seconda specie sono trascorse due emivite, non una.

Fonte SHA256 f86adfc45eef117c48fcaf93328e99c2d5f2fe1eafdcef760360b19599a37e2c. Candidato SHA256 2c66610450e42935d35da2642d46a0edb555dd09cf3823414f2a385c42536254. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioisotope-mixture-07 — Raddoppia soltanto la seconda specie

Un campione chiuso contiene due radionuclidi genitori indipendenti, con attività iniziali A₁>0 e A₂>0. Il primo ha emivita 1 h, il secondo 30 min. Non c’è nuova produzione di genitori né contributo dei figli all’attività richiesta. Tutte le uscite si osservano dopo 1 h: il primo contributo è A₁/2, il secondo A₂/4. Le attività sono tassi medi in Bq e le prove confrontano preparazioni distinte con dati finiti. A ha A₁=8 Bq,A₂=8 Bq. B mantiene A₁=8 Bq e usa A₂=16 Bq. Quanto vale A_tot,B/A_tot,A?

Procedimento d’autore: A dà 4+2=6 Bq. B dà 4+4=8 Bq, quindi il rapporto è 8/6=4/3. Il raddoppio riguarda il contributo inizialmente meno pesante al tempo finale.

Formule: A_{{\rm tot},A}=6\,\mathrm{Bq};  A_{{\rm tot},B}=8\,\mathrm{Bq};  A_{{\rm tot},B}/A_{{\rm tot},A}=\frac43.

Distrattori e controprove: 3/4 inverte il confronto, due raddoppia anche il primo ingresso. Un mezzo fa diminuire il totale nonostante un ingresso maggiore e uno ignora la seconda modifica.

Hint: Calcola due somme complete prima di dividere.

Fonte SHA256 d62dd47319070e6e8662592273fa48f072dcf8f7561ab41895880d9ee8df1cbf. Candidato SHA256 471c16451e77def1a7784e0ac8d39254c82e4be756dbb77fb5983481ae696861. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioisotope-mixture-08 — Una proposta che somma troppo

Un campione chiuso contiene due radionuclidi genitori indipendenti, con attività iniziali A₁>0 e A₂>0. Il primo ha emivita 1 h, il secondo 30 min. Non c’è nuova produzione di genitori né contributo dei figli all’attività richiesta. Tutte le uscite si osservano dopo 1 h: il primo contributo è A₁/2, il secondo A₂/4. Le attività sono tassi medi in Bq e le prove confrontano preparazioni distinte con dati finiti. Con A₁=A₂=8 Bq viene proposto un totale a 1 h di 12 Bq. Quanto vale proposta meno corretto?

Procedimento d’autore: Il corretto è 6 Bq, non 12. Lo scarto ordinato è quindi +6 Bq. La somma iniziale delle attività era 16 Bq, anch’essa diversa dal totale richiesto al tempo successivo.

Formule: \delta A=(12-6)\,\mathrm{Bq};  \delta A=6\,\mathrm{Bq}.

Distrattori e controprove: −6 Bq scambia il verso, due è il rapporto proposto/corretto, dodici la proposta e zero non ne controlla la perdita già avvenuta.

Hint: Confronta il totale proposto con la somma dopo le due attenuazioni.

Fonte SHA256 1a7ce822305c81c5040e04c7e10397e62b794c528c25b67ffac7bf9a8e4d94d3. Candidato SHA256 b5aa85d9e57c0cf42a938cf49e9f64fef7cd1986b241277997cb835776932570. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioisotope-mixture-09 — L’inversa simbolica del primo ingresso

Un campione chiuso contiene due radionuclidi genitori indipendenti, con attività iniziali A₁>0 e A₂>0. Il primo ha emivita 1 h, il secondo 30 min. Non c’è nuova produzione di genitori né contributo dei figli all’attività richiesta. Tutte le uscite si osservano dopo 1 h: il primo contributo è A₁/2, il secondo A₂/4. Le attività sono tassi medi in Bq e le prove confrontano preparazioni distinte con dati finiti. Il totale e A₂ sono noti. Quale espressione isola A₁?

Procedimento d’autore: Sottraggo A₂/4 a entrambi i membri e moltiplico il residuo per due. La positività dell’attività A₁ richiede A_tot>A₂/4. Il totale non è da attribuire interamente alla prima specie.

Formule: A_1/2=A_{\rm tot}-A_2/4;  A_1=2(A_{\rm tot}-A_2/4).

Distrattori e controprove: Il segno più aggiunge due volte il contributo noto; dividere per due ripete la perdita. 4A_tot−A₂ usa il fattore della seconda specie e 2A_tot omette la sua presenza.

Hint: Separa prima la parte nota della somma, poi esegui l’inversa.

Fonte SHA256 61077f524e73845f6d861665bcd11cbd39eae5d2e55ed72081b5dc2b0f2ab8cc. Candidato SHA256 68b19ef72bc274ae8b2e1657e17e39f79c02617d212e4df22da82f281fed5d32. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioisotope-mixture-10 — Due fattori in una somma pesata

Un campione chiuso contiene due radionuclidi genitori indipendenti, con attività iniziali A₁>0 e A₂>0. Il primo ha emivita 1 h, il secondo 30 min. Non c’è nuova produzione di genitori né contributo dei figli all’attività richiesta. Tutte le uscite si osservano dopo 1 h: il primo contributo è A₁/2, il secondo A₂/4. Le attività sono tassi medi in Bq e le prove confrontano preparazioni distinte con dati finiti. Fra prove A₁,B=κ₁A₁,A e A₂,B=κ₂A₂,A, con fattori positivi. Definiamo R=A_tot,B/A_tot,A. Nei simboli seguenti A₁,A₂ appartengono ad A. Qual è R?

Procedimento d’autore: Il rapporto è (κ₁A₁/2+κ₂A₂/4)/(A₁/2+A₂/4). Moltiplicando numeratore e denominatore per quattro, i pesi rimasti sono due e uno. Un fattore comune ai due ingressi si raccoglierebbe, ma fattori diversi non si possono moltiplicare fra loro.

Formule: R=\frac{2\kappa_1A_1+\kappa_2A_2}{2A_1+A_2}.

Distrattori e controprove: Prodotto e quoziente dei fattori non descrivono una somma. La loro media semplice ignora i pesi finali; il rapporto senza il due usa le attività iniziali invece dei contributi dopo un’ora.

Hint: Mantieni i pesi un mezzo e un quarto fino alla formazione del rapporto.

Fonte SHA256 9b090af5b6ab3c4aef3ff1f75f8c6de9ac49aba1bf21c60a97a2244b9165e9a5. Candidato SHA256 61c0f963062d28cb32fd1d43662a7d3ea2555f76b43120b1768d3f7ff4c2d41b. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioisotope-mixture-11 — Quando entrambi gli ingressi raddoppiano

Un campione chiuso contiene due radionuclidi genitori indipendenti, con attività iniziali A₁>0 e A₂>0. Il primo ha emivita 1 h, il secondo 30 min. Non c’è nuova produzione di genitori né contributo dei figli all’attività richiesta. Tutte le uscite si osservano dopo 1 h: il primo contributo è A₁/2, il secondo A₂/4. Le attività sono tassi medi in Bq e le prove confrontano preparazioni distinte con dati finiti. A ha A₁=A₂=8 Bq. B ha A₁=A₂=16 Bq. Quanto vale A_tot,B/A_tot,A?

Procedimento d’autore: A dà 6 Bq e B dà 8+4=12 Bq. Questa volta entrambi i contributi hanno lo stesso fattore due, che si raccoglie dalla somma: rapporto due. Le emivite sono ancora diverse.

Formule: A_{{\rm tot},B}=12\,\mathrm{Bq};  A_{{\rm tot},B}/A_{{\rm tot},A}=2.

Distrattori e controprove: Un mezzo inverte il rapporto; quattro moltiplica i due raddoppi come se i contributi si moltiplicassero. Uno ignora le nuove popolazioni e 3/2 non segue la stessa scala comune.

Hint: Un fattore comune a tutta la somma si può raccogliere.

Fonte SHA256 8486a973cc9c82575c450b5cbbde428184ec755be21c8fc85c7f3ab6b4813853. Candidato SHA256 ab92ea96e281ae5d4fc1e5807b5a61ebf3fb6c2797695d3e79b685403984a8ef. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioisotope-mixture-12 — Una media che qui coincide con gli ingressi medi

Un campione chiuso contiene due radionuclidi genitori indipendenti, con attività iniziali A₁>0 e A₂>0. Il primo ha emivita 1 h, il secondo 30 min. Non c’è nuova produzione di genitori né contributo dei figli all’attività richiesta. Tutte le uscite si osservano dopo 1 h: il primo contributo è A₁/2, il secondo A₂/4. Le attività sono tassi medi in Bq e le prove confrontano preparazioni distinte con dati finiti. A ha A₁=A₂=8 Bq. B ha A₁=A₂=16 Bq. Qual è la media aritmetica dei due totali con pesi uguali?

Procedimento d’autore: I totali sono 6 e 12 Bq: media 9 Bq. In questo modello lineare negli ingressi, usare A₁=A₂=12 Bq darebbe anch’esso 6+3=9 Bq. La coincidenza è giustificata dalla linearità con pesi costanti, non da una regola valida per ogni legge fisica.

Formule: \overline A=\frac{6+12}{2}\,\mathrm{Bq};  \overline A=9\,\mathrm{Bq};  A_{\rm dati\ medi}=9\,\mathrm{Bq}.

Distrattori e controprove: 18 Bq è la somma, tre la semidifferenza, sei e dodici ripetono una sola prova. Non si devono inventare due risposte diverse quando la linearità rende le operazioni equivalenti.

Hint: Verifica prima la media delle uscite, poi spiega la eventuale coincidenza.

Fonte SHA256 66f106830372770646686324e7d835949333d466bbe8f0c22905524a0fd1df3b. Candidato SHA256 836d127d625509c54b0dc168c0468e465f49ab9213eec41623c38e83deddb274. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioisotope-mixture-13 — La seconda attività per il bersaglio

Un campione chiuso contiene due radionuclidi genitori indipendenti, con attività iniziali A₁>0 e A₂>0. Il primo ha emivita 1 h, il secondo 30 min. Non c’è nuova produzione di genitori né contributo dei figli all’attività richiesta. Tutte le uscite si osservano dopo 1 h: il primo contributo è A₁/2, il secondo A₂/4. Le attività sono tassi medi in Bq e le prove confrontano preparazioni distinte con dati finiti. A ha A₁=A₂=8 Bq. B deve avere A₁=16 Bq e totale doppio rispetto ad A. Quanto vale A₂,B/A₂,A?

Procedimento d’autore: Il bersaglio è 12 Bq. Il primo contributo di B vale 8 Bq, dunque ne mancano 4. Per avere 4 Bq dopo due emivite il secondo ingresso deve essere 16 Bq: rapporto 16/8=2.

Formule: A_{{\rm tot},B}=12\,\mathrm{Bq};  A_{2,B}=4(12-8)\,\mathrm{Bq};  A_{2,B}=16\,\mathrm{Bq};  A_{2,B}/A_{2,A}=2.

Distrattori e controprove: Uno darebbe un totale di 10 Bq; quattro darebbe 16 Bq. Un mezzo inverte il rapporto e 3/2 darebbe 11 Bq, non il bersaglio.

Hint: Sottrai dal target il contributo già fissato della prima specie.

Fonte SHA256 9e828c04ec8492ff1cda47b46f810b59c10e9fc21d800610f486943d58016ee8. Candidato SHA256 be261d7077999365511ea92fe669799cab827db6ccdde26195181c5418724d5f. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioisotope-mixture-14 — Il display legge il totale finale

Un campione chiuso contiene due radionuclidi genitori indipendenti, con attività iniziali A₁>0 e A₂>0. Il primo ha emivita 1 h, il secondo 30 min. Non c’è nuova produzione di genitori né contributo dei figli all’attività richiesta. Tutte le uscite si osservano dopo 1 h: il primo contributo è A₁/2, il secondo A₂/4. Le attività sono tassi medi in Bq e le prove confrontano preparazioni distinte con dati finiti. D=g A_tot è continuo e adimensionale. A con A₁=A₂=8 Bq dà D=18. In B D=36 e A₂=16 Bq. Quanto vale A₁,B in Bq?

Procedimento d’autore: Il riferimento ha totale 6 Bq, dunque g=3 Bq⁻¹. D=36 indica 12 Bq. Tolto il contributo 16/4=4 Bq della seconda specie restano 8 Bq finali della prima: l’inizio era 16 Bq.

Formule: g=3\,\mathrm{Bq^{-1}};  A_{{\rm tot},B}=12\,\mathrm{Bq};  A_{1,B}=2(12-4)\,\mathrm{Bq};  A_{1,B}=16\,\mathrm{Bq}.

Distrattori e controprove: 64 Bq tratterebbe D=36 come un totale di 36 Bq e predirebbe D=108. Otto copia il contributo finale, 24 omette il secondo contributo e predirebbe D=48.

Hint: Decodifica il totale prima di separare i due radionuclidi.

Fonte SHA256 c9ef3abcd6cccc27408aff0eda125b7c72075c0c8f3a04095989c266c92166c5. Candidato SHA256 b6fbe71f2757b06369520929b7c64fd824cfc668d3a53536dcd895395c42bf7b. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioisotope-mixture-15 — Offset sul totale, poi bilancio dei contributi

Un campione chiuso contiene due radionuclidi genitori indipendenti, con attività iniziali A₁>0 e A₂>0. Il primo ha emivita 1 h, il secondo 30 min. Non c’è nuova produzione di genitori né contributo dei figli all’attività richiesta. Tutte le uscite si osservano dopo 1 h: il primo contributo è A₁/2, il secondo A₂/4. Le attività sono tassi medi in Bq e le prove confrontano preparazioni distinte con dati finiti. D=g A_tot+b. A: A₁=A₂=8 Bq,D=13. B: A₁=A₂=16 Bq,D=25. C: A₂=8 Bq,D=21. Quanto vale A₁,C in Bq?

Procedimento d’autore: I totali di riferimento sono 6 e 12 Bq. La differenza delle letture dà g=2 Bq⁻¹ e poi b=1. D=21 corrisponde a 10 Bq. Tolti i 2 Bq della seconda specie, il primo contributo finale è 8 Bq: A₁,C=16 Bq.

Formule: g=2\,\mathrm{Bq^{-1}};  b=1;  A_{{\rm tot},C}=10\,\mathrm{Bq};  A_{1,C}=16\,\mathrm{Bq}.

Distrattori e controprove: 17 Bq omette l’offset e predirebbe D=22. Trentasei omette il guadagno dopo aver tolto b e predirebbe D=41. Otto lascia il primo contributo al tempo finale, senza ricostruire l’inizio.

Hint: Sottrai l’offset strumentale prima del contributo fisico noto.

Fonte SHA256 18e2420a08fb0166ae9f67255e6d257aea638d63db9e273132721ca94af0ffde. Candidato SHA256 28dd6b3aec5fd9fccad68c0237ec83e5de2ab3aea9a51e1a0fb7dd43244cc866. Skill reale C5-L08. Review distinta e human NOT_RUN.

## AR-u7-radioisotope-mixture-16 — Attività iniziali uguali, scala determinata

Un campione chiuso contiene due radionuclidi genitori indipendenti, con attività iniziali A₁>0 e A₂>0. Il primo ha emivita 1 h, il secondo 30 min. Non c’è nuova produzione di genitori né contributo dei figli all’attività richiesta. Tutte le uscite si osservano dopo 1 h: il primo contributo è A₁/2, il secondo A₂/4. Le attività sono tassi medi in Bq e le prove confrontano preparazioni distinte con dati finiti. Si impone A₁=A₂ e si misura totale 6 Bq dopo 1 h. Quanto vale A₂ iniziale in Bq?

Procedimento d’autore: Definisco X=A₁=A₂. La somma finale è X/2+X/4=3X/4. La misura 6 Bq fissa X=8 Bq. L’uguaglianza iniziale non rende uguali le attività finali: restano 4 e 2 Bq.

Formule: X=A_1;  A_2=X;  A_{\rm tot}=\frac34X;  X=8\,\mathrm{Bq}.

Distrattori e controprove: Sei Bq confonde totale e singolo ingresso e darebbe totale 9/2 Bq. Quattro darebbe 3 Bq; dodici darebbe 9 Bq. Il vincolo e la misura sono indipendenti e fissano una sola coppia positiva.

Hint: Usa una sola incognita per gli ingressi, conservando però i due pesi diversi.

Fonte SHA256 8f7493ce8527e8d4a64830fe7fce239a996e03b1549161bf39bc3087025c911d. Candidato SHA256 4c4fe9ea960006eab58ec5a57fa8ceb79bd378842398d3e1a24a9eeec9c905d5. Skill reale C5-L08. Review distinta e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 2bc82387241bde4df9c0857e1e16ec01ecb0b3cade4ed8537ce3f3bb6cab214a. Package file SHA256 cf1eee511f1efc4a25381338846fa92512cccb760ae157da4d7525324fcd5064. Binding file SHA256 8471d183525564d301ca8c35ff751813c3423ba0b0ae8935e9cbb5f784c14d3b. Strutturale SHA256 525ce91b141407f2c36e105d85ba1276fcb8cfddf3378b8f8c1e209451f8ac37. Manifest asset-only SHA256 3726676ab558afa8939e49011b0bb36460b314afa6079ca15f12b307f8c9c30a.

Nessun registry, ledger, runtime, checkpoint o Git ROOT modificato. Il revisore B deve leggere questi finali contro la propria primaria distinta prima del congelamento scientifico.

Nota geometrica d’autore: le prime barre composte hanno scala comune20 coordinate/Bq, segmenti160+160 per8+8 Bq iniziali e80+40 per4+2 Bq dopo1 h. Nel grafico A₂ è fissata a8 Bq: x=150+20 A₁[Bq], y=1000−30 A_tot[Bq], con limite aperto (0,2) e punti esatti (8,6),(16,10). Le barre finali150/300/225 rappresentano6/12/9 Bq alla scala25 comune entro quel pannello. Sono state lette integralmente struttura XML e immagine nativa640×1600 dopo exit0 reale; nessuna sovrapposizione osservata. Le coordinate sono metadati tecnici, non pixel responsive nello svolgimento.
