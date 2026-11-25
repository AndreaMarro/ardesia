# Authoring DRAFT — cyclic-work-158

Tutti gli 80 prompt assegnati A158–162 sono stati letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605 prima di iniziare la riscrittura. Fonte U5-02 SHA256 66ade7951eecbdbea93c529a628b01c2e8bf393959f757a2cf82aeb03cabb95c. Compiti e casi speciali conservati; eventuali nuove parametrizzazioni sono dichiarate qui. Riletti i blocchi delle lezioni reali C3-L08/L09/L10 e il lavoro/potenza in C1-L007, oltre ai prerequisiti C3 pertinenti. Corso C3 e competenze del catalogo, nessuna lezione inventata.

Autore soltanto: revisione scientifica indipendente NOT_RUN, approvazione umana NOT_RUN, DRAFT e publicationAction NONE. Queste sono note di calcolo dell’autore, non un oracolo indipendente e non un’autofirma.

Due assembly in processi distinti hanno prodotto package e binding identici. Importatore canonico ROOT con percorso assoluto in SQLite temporaneo: 16 nuovi, poi 0 nuovi/16 invariati; 991 pubblicati e versioni storiche conservati, SHA dei pubblicati invariato. Asset SVG letto in XML e rendering nativo completo. Snapshot privata del runtime ROOT, fingerprint 54054f7ac463ef52f7c4c881d50ee071713315d891812696f18e39d9ad45ab3d, verificata uguale prima del replay. Runner canonico browser-batches.mjs ha realmente completato 48 viste a 1440/768/320 px con exit 0 e scritto atomicamente il proprio completion.json; marker riletto dal validatore canonico contro i byte finali. Report grezzo e marker sono conservati byte per byte in editorial/author-evidence. Nessun ritag di prove precedenti, nessuna modifica a runtime, CSS, registry o dati degli studenti. Queste prove tecniche non certificano la correttezza scientifica o l’esperienza umana.

Si assumono cicli motori energeticamente e termodinamicamente possibili; le temperature non sono dati del problema. Non si impone una coppia unica di sorgenti fra prove, che potrebbe restringere i fattori liberi senza motivo. Il ritorno di U non annulla i trasferimenti energetici. La media del caso12 coincide con il modello sui calori medi perché il bilancio è lineare. SVG: frecce schematiche; barre energetiche del pannello2 a4 px/J, lavori del pannello3 a3 px/J, con scala locale esplicita.

## AR-u5-cyclic-work-01 — Un ciclo può fornire lavoro pur tornando allo stato iniziale

Il fluido operante è un sistema chiuso che compie un ciclo e torna allo stesso stato; anche energia cinetica e potenziale macroscopica tornano ai valori iniziali. Nel ciclo assorbe Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda: Q_h e Q_c sono moduli in J, con Q_h>Q_c. Non vi sono altri scambi energetici. W è il lavoro netto compiuto dal fluido, positivo uscente. Le temperature delle sorgenti non sono assegnate: si considerano realizzazioni compatibili con il secondo principio e non si impone che le sorgenti restino uguali fra prove diverse. Q_h=100 J e Q_c=40 J. Quanto vale W in J?

Procedimento d’autore: Al termine del ciclo U torna al valore iniziale, quindi ΔU_ciclo=0. Il calore entrante con segno è cento meno quaranta joule: l’uscita termica non si somma all’entrata. Nel primo principio resta 0=Q_netto−W, perciò il lavoro netto è sessanta joule. Tornare allo stesso stato non annulla ciascuno dei trasferimenti.

Passaggi esatti: \Delta U_{\rm ciclo}=0;  Q_{\rm netto}=Q_h-Q_c;  W=Q_h-Q_c;  W=60\,\mathrm J.

Distrattori e controllo didattico: Centoquaranta J somma i due moduli senza rispettare i versi. Cento J dimentica il calore ceduto e quaranta J copia soltanto quel contributo. Zero confonde il ritorno di U al valore iniziale con lavoro netto nullo.

Fonte canonica SHA256 4fa9e550023407d84a022bdc811d588b950aeded76b0284968c3f3c2497ecfa6. Candidato SHA256 5028a4f78863a0046a9cd0fcd86a459b73134f9c38385aa9e72d39b7ce5c283a. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-cyclic-work-02 — L’unità del lavoro netto

W è il lavoro meccanico netto compiuto in un ciclo. Quale unità è corretta?

Procedimento d’autore: Il lavoro è un trasferimento di energia e si misura in joule. Il primo principio sottrae il lavoro dal calore netto, quindi entrambi devono avere la stessa dimensione. Il simbolo W della grandezza non significa che l’unità sia watt.

Passaggi esatti: [W]=[Q_h]; [Q_h]=[Q_c];  [W]=\mathrm J.

Distrattori e controllo didattico: W come unità è watt, ossia J/s e richiede una durata. J/K è capacità termica, K temperatura e Pa pressione. Ripetere cicli non introduce da solo una divisione per il tempo.

Fonte canonica SHA256 79e71068deae5a5dadbdb76f44fc8bdece780324b200077426d8006afde433e3. Candidato SHA256 2d19ab2aafec9ddb1bcff00472fa3c92ca94fe2688c7f3568d6a40295ba24a47. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-cyclic-work-03 — La formula con due moduli di calore

Il fluido operante è un sistema chiuso che compie un ciclo e torna allo stesso stato; anche energia cinetica e potenziale macroscopica tornano ai valori iniziali. Nel ciclo assorbe Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda: Q_h e Q_c sono moduli in J, con Q_h>Q_c. Non vi sono altri scambi energetici. W è il lavoro netto compiuto dal fluido, positivo uscente. Le temperature delle sorgenti non sono assegnate: si considerano realizzazioni compatibili con il secondo principio e non si impone che le sorgenti restino uguali fra prove diverse. Quale formula generale dà W?

Procedimento d’autore: Il primo principio usa calore entrante positivo. La macchina riceve Q_h ma perde Q_c come calore verso l’ambiente freddo: Q_netto=Q_h−Q_c. Dato ΔU_ciclo=0, il lavoro netto del gas coincide con quel calore netto. Nel dominio dichiarato è positivo e minore di Q_h.

Passaggi esatti: 0=Q_h-Q_c-W;  W=Q_h-Q_c;  0<W<Q_h.

Distrattori e controllo didattico: La somma tratta un’uscita come ingresso. La differenza inversa dà lavoro del gas negativo, contrario al ciclo motore qui assegnato. Il prodotto ha J² e il quoziente è puro: nessuno dei due è un lavoro in J.

Fonte canonica SHA256 517fe07f4d816fdeddb2d30a0b79005b3d54137b510a661cc433c43799d09bfd. Candidato SHA256 3aede4830c86d12a5ff832864515de538e3b2067981c6547380954c7645add6c. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-cyclic-work-04 — Aumentare l’energia ricevuta senza cambiare lo scarico

Il fluido operante è un sistema chiuso che compie un ciclo e torna allo stesso stato; anche energia cinetica e potenziale macroscopica tornano ai valori iniziali. Nel ciclo assorbe Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda: Q_h e Q_c sono moduli in J, con Q_h>Q_c. Non vi sono altri scambi energetici. W è il lavoro netto compiuto dal fluido, positivo uscente. Le temperature delle sorgenti non sono assegnate: si considerano realizzazioni compatibili con il secondo principio e non si impone che le sorgenti restino uguali fra prove diverse. A ha Q_h=100 J e Q_c=40 J. B ha Q_h=200 J e lo stesso Q_c=40 J. Come cambia W?

Procedimento d’autore: Il primo ciclo fornisce sessanta joule. Nel secondo duecento meno quaranta sono centosessanta. I cento joule aggiuntivi ricevuti diventano cento joule aggiuntivi di lavoro quando il calore ceduto resta fisso. Il lavoro non raddoppia semplicemente, perché Q_c non è raddoppiato.

Passaggi esatti: W_A=60\,\mathrm J;  W_B=(200-40)\,\mathrm J;  W_B=160\,\mathrm J.

Distrattori e controllo didattico: Centoventi raddoppia direttamente l’uscita A. Duecentoquaranta somma lo scarico al nuovo ingresso, sessanta ignora il cambiamento e meno centosessanta usa la convenzione opposta senza dichiararla.

Fonte canonica SHA256 a599438ef64f3e00447a688bddce8b72901361f4393d1007e276837de3aa2d85. Candidato SHA256 3f88e59cdbfddb98508031430c8db443fc3dd1ae611d3ae81dc3d488a7c25fa5. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-cyclic-work-05 — Quanto deve fornire la sorgente calda

Il fluido operante è un sistema chiuso che compie un ciclo e torna allo stesso stato; anche energia cinetica e potenziale macroscopica tornano ai valori iniziali. Nel ciclo assorbe Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda: Q_h e Q_c sono moduli in J, con Q_h>Q_c. Non vi sono altri scambi energetici. W è il lavoro netto compiuto dal fluido, positivo uscente. Le temperature delle sorgenti non sono assegnate: si considerano realizzazioni compatibili con il secondo principio e non si impone che le sorgenti restino uguali fra prove diverse. Il lavoro netto è W=60 J e vengono ceduti Q_c=40 J. Quanto vale Q_h in J?

Procedimento d’autore: L’energia ricevuta deve fornire sia il lavoro utile sia il calore scaricato. Aggiungendo sessanta e quaranta joule si ottengono cento joule. La somma supera Q_c di sessanta joule e rispetta il ramo motore.

Passaggi esatti: W=Q_h-Q_c;  Q_h=W+Q_c;  Q_h=100\,\mathrm J.

Distrattori e controllo didattico: Venti J sottrae ancora il calore ceduto e darebbe lavoro −20 J, incompatibile con W=60 J. Sessanta J copia il lavoro e quaranta lo scarico. Un prodotto di energie non risponde all’inversa additiva.

Fonte canonica SHA256 369f8d6daa9eaa6b4ddeeb6648bf98c32c6a365bac7557159433a12709c3e4a5. Candidato SHA256 dba147ee59250fd8773e8c7297f24a90576f469f3d9e79f2db7da6465f02b356. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-cyclic-work-06 — Lo scarico termico dal lavoro netto

Il fluido operante è un sistema chiuso che compie un ciclo e torna allo stesso stato; anche energia cinetica e potenziale macroscopica tornano ai valori iniziali. Nel ciclo assorbe Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda: Q_h e Q_c sono moduli in J, con Q_h>Q_c. Non vi sono altri scambi energetici. W è il lavoro netto compiuto dal fluido, positivo uscente. Le temperature delle sorgenti non sono assegnate: si considerano realizzazioni compatibili con il secondo principio e non si impone che le sorgenti restino uguali fra prove diverse. Si hanno Q_h=100 J e W=60 J. Quanto vale Q_c in J?

Procedimento d’autore: Dei cento joule ricevuti, sessanta sono trasferiti come lavoro. I quaranta rimanenti vengono ceduti alla sorgente fredda. L’inversa Q_c=Q_h−W richiede 0<W<Q_h, soddisfatto dai dati; Q_c è il modulo positivo, non il calore con segno ricevuto dal fluido.

Passaggi esatti: Q_c=Q_h-W;  Q_c=(100-60)\,\mathrm J;  Q_c=40\,\mathrm J.

Distrattori e controllo didattico: Meno quaranta J indicherebbe il contributo con segno al calore del fluido, non il modulo richiesto. Centosessanta somma invece di togliere il lavoro; sessanta copia W. La macchina cede quaranta joule, non ne assorbe altri quaranta dal freddo.

Fonte canonica SHA256 a7b79ea640406151e5bc094255b97264e20000b409927cfeb6706331315da7e6. Candidato SHA256 e700ebb71030565f49ff59f4829b8e14976f53709e57d79830b4c274f11929b9. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-cyclic-work-07 — Più scarico, meno lavoro utile

Il fluido operante è un sistema chiuso che compie un ciclo e torna allo stesso stato; anche energia cinetica e potenziale macroscopica tornano ai valori iniziali. Nel ciclo assorbe Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda: Q_h e Q_c sono moduli in J, con Q_h>Q_c. Non vi sono altri scambi energetici. W è il lavoro netto compiuto dal fluido, positivo uscente. Le temperature delle sorgenti non sono assegnate: si considerano realizzazioni compatibili con il secondo principio e non si impone che le sorgenti restino uguali fra prove diverse. A usa Q_h=100 J, Q_c=40 J. B mantiene Q_h e cede Q_c=60 J. Quanto vale W_B/W_A?

Procedimento d’autore: A fornisce sessanta joule e B quaranta. Il rapporto quaranta su sessanta si riduce a due terzi. Con la stessa energia ricevuta, una quota maggiore ceduta al freddo lascia meno lavoro utile; entrambi restano cicli motori.

Passaggi esatti: W_A=60\,\mathrm J;  W_B=40\,\mathrm J;  W_B/W_A=\frac23.

Distrattori e controllo didattico: Tre mezzi inverte i lavori ed è anche il rapporto degli scarichi, una grandezza diversa. Uno ignora il maggiore Q_c e due non segue dalla differenza. Il segno negativo è escluso perché entrambi i lavori sono positivi.

Fonte canonica SHA256 eff3b60d2ba7b6016020406411a13bdac5b4dc519ca1d4694b7cbd3cc7eae9e0. Candidato SHA256 fb365c3ebcf3636fbd46a96cdb2c5c82c154930c5ae0e926ecf8fbb5edb41aa4. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-cyclic-work-08 — Una proposta maggiore del lavoro realmente disponibile

Il fluido operante è un sistema chiuso che compie un ciclo e torna allo stesso stato; anche energia cinetica e potenziale macroscopica tornano ai valori iniziali. Nel ciclo assorbe Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda: Q_h e Q_c sono moduli in J, con Q_h>Q_c. Non vi sono altri scambi energetici. W è il lavoro netto compiuto dal fluido, positivo uscente. Le temperature delle sorgenti non sono assegnate: si considerano realizzazioni compatibili con il secondo principio e non si impone che le sorgenti restino uguali fra prove diverse. Con Q_h=100 J e Q_c=40 J si propone W=120 J. Quanto vale proposta meno risultato corretto?

Procedimento d’autore: Il bilancio del ciclo dà sessanta joule, non centoventi. La proposta lo supera di sessanta joule. Essa supera perfino il calore ricevuto, mentre una macchina senza altre entrate e con Q_c positivo deve avere W<Q_h. Centoventi non è Q_h+Q_c, che in questi dati sarebbe centoquaranta: si confuta il valore senza attribuirgli quell’errore diverso.

Passaggi esatti: W=60\,\mathrm J;  e=(120-60)\,\mathrm J;  e=60\,\mathrm J.

Distrattori e controllo didattico: Meno sessanta cambia l’ordine dello scarto, centoventi copia la proposta e zero la accetta. Trenta divide ancora per due una differenza già calcolata.

Fonte canonica SHA256 e481ae2cea50d97768b56f22c79d637d0b01f6ced21ecc7bcd7cb83009872d11. Candidato SHA256 a7118acf1720ec6d01df92466ed428fd6c15d430754b06736a1025d73a99aab8. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-cyclic-work-09 — L’inversa generale per l’energia ricevuta

Il fluido operante è un sistema chiuso che compie un ciclo e torna allo stesso stato; anche energia cinetica e potenziale macroscopica tornano ai valori iniziali. Nel ciclo assorbe Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda: Q_h e Q_c sono moduli in J, con Q_h>Q_c. Non vi sono altri scambi energetici. W è il lavoro netto compiuto dal fluido, positivo uscente. Le temperature delle sorgenti non sono assegnate: si considerano realizzazioni compatibili con il secondo principio e non si impone che le sorgenti restino uguali fra prove diverse. W>0 e Q_c>0 sono noti. Quale formula ricava Q_h?

Procedimento d’autore: Aggiungendo Q_c a entrambi i membri di W=Q_h−Q_c si ottiene Q_h=W+Q_c. Entrambi gli addendi sono energie. W positivo garantisce che l’ingresso ricostruito superi il calore ceduto, come richiede il dominio.

Passaggi esatti: W+Q_c=Q_h;  Q_h=W+Q_c;  Q_h>Q_c.

Distrattori e controllo didattico: Sottrarre ancora Q_c non elimina il suo contributo negativo nella legge iniziale. La differenza opposta inverte i ruoli; prodotto e quoziente hanno rispettivamente J² e dimensione pura, non J.

Fonte canonica SHA256 cf71d01adb1e375d1510008a8f1d5059431a00f8520ef967f2b4e5407c11cd79. Candidato SHA256 b3d2830214ab74829e6fcc9552b2a1cfab1f5e061224cdae68e7f8f82620d809. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-cyclic-work-10 — Due fattori prima di formare la differenza

Il fluido operante è un sistema chiuso che compie un ciclo e torna allo stesso stato; anche energia cinetica e potenziale macroscopica tornano ai valori iniziali. Nel ciclo assorbe Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda: Q_h e Q_c sono moduli in J, con Q_h>Q_c. Non vi sono altri scambi energetici. W è il lavoro netto compiuto dal fluido, positivo uscente. Le temperature delle sorgenti non sono assegnate: si considerano realizzazioni compatibili con il secondo principio e non si impone che le sorgenti restino uguali fra prove diverse. B usa Q_h,B=κ₁Q_h e Q_c,B=κ₂Q_c, con κ₁,κ₂>0 e κ₁Q_h>κ₂Q_c; i simboli senza pedice sono di A. Quanto vale W_B/W_A?

Procedimento d’autore: Applichiamo ciascun fattore al proprio scambio, poi facciamo la differenza. Il rapporto è (κ₁Q_h−κ₂Q_c)/(Q_h−Q_c). Il denominatore è positivo perché A è motore; la disuguaglianza aggiunta rende positivo anche il lavoro B. Se i due fattori sono lo stesso κ, il lavoro cresce per κ.

Passaggi esatti: W_B=\kappa_1Q_h-\kappa_2Q_c;  W_A=Q_h-Q_c;  \frac{W_B}{W_A}=\frac{\kappa_1Q_h-\kappa_2Q_c}{Q_h-Q_c}.

Distrattori e controllo didattico: Il prodotto dei fattori varrebbe per un prodotto di ingressi e qui darebbe κ² per un fattore comune. Il quoziente ignora i pesi energetici. Il rapporto delle somme conta il calore ceduto col segno sbagliato; κ₁−κ₂ darebbe zero per due cicli identici anziché uno.

Fonte canonica SHA256 35d36b43260b378410f30d239831ba9608e302f6ec06eda6fad09de9eaf260d6. Candidato SHA256 11d1850af2cb8ef5585dbde1e1ea842a558bd712b0bcff42dbc28fb2eaad5d8a. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-cyclic-work-11 — Due bilanci energetici, non due singoli fattori

Il fluido operante è un sistema chiuso che compie un ciclo e torna allo stesso stato; anche energia cinetica e potenziale macroscopica tornano ai valori iniziali. Nel ciclo assorbe Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda: Q_h e Q_c sono moduli in J, con Q_h>Q_c. Non vi sono altri scambi energetici. W è il lavoro netto compiuto dal fluido, positivo uscente. Le temperature delle sorgenti non sono assegnate: si considerano realizzazioni compatibili con il secondo principio e non si impone che le sorgenti restino uguali fra prove diverse. A usa Q_h=100 J, Q_c=40 J. B usa Q_h=200 J, Q_c=60 J. Quanto vale W_B/W_A?

Procedimento d’autore: Il primo ciclo fornisce sessanta joule. Il secondo fornisce duecento meno sessanta, centoquaranta joule. Centoquaranta su sessanta si semplifica dividendo numeratore e denominatore per venti: sette terzi.

Passaggi esatti: W_A=60\,\mathrm J;  W_B=140\,\mathrm J;  W_B/W_A=\frac{140}{60};  W_B/W_A=\frac73.

Distrattori e controllo didattico: Tre settimi è il reciproco; due segue soltanto Q_h e tre mezzi soltanto Q_c. Centoquaranta è il numero di joule del lavoro B e non un rapporto adimensionale.

Fonte canonica SHA256 f0e306840934761511300594256b18229537075df056b6c4efc40e65b2e4c309. Candidato SHA256 084a7ba6b74bfb8733d324fc59e5c1988edc40dc2e514ddad834319dcf9dede8. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-cyclic-work-12 — Media statistica di lavori per ciclo

Il fluido operante è un sistema chiuso che compie un ciclo e torna allo stesso stato; anche energia cinetica e potenziale macroscopica tornano ai valori iniziali. Nel ciclo assorbe Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda: Q_h e Q_c sono moduli in J, con Q_h>Q_c. Non vi sono altri scambi energetici. W è il lavoro netto compiuto dal fluido, positivo uscente. Le temperature delle sorgenti non sono assegnate: si considerano realizzazioni compatibili con il secondo principio e non si impone che le sorgenti restino uguali fra prove diverse. A ha Q_h=100 J, Q_c=40 J. B ha Q_h=200 J, Q_c=60 J. Qual è la media aritmetica dei due W con uguale peso?

Procedimento d’autore: I lavori sono sessanta e centoquaranta joule. La metà della loro somma è cento joule. La stessa risposta nasce dagli ingressi medi: Q_h medio centocinquanta meno Q_c medio cinquanta dà cento, perché il bilancio è lineare. Si sta facendo una media statistica per ciclo, non calcolando una potenza senza durate.

Passaggi esatti: \overline W=\frac{60+140}{2}\,\mathrm J;  \overline W=100\,\mathrm J.

Distrattori e controllo didattico: Duecento è la somma, cinquanta dimezza ancora la media e ottanta è la differenza dei lavori. Centocinquanta è solo il calore medio ricevuto, senza togliere quello ceduto. Qui non si inventa una differenza fra media delle uscite e modello sugli ingressi medi.

Fonte canonica SHA256 9562e0178c5eee702e8512558926b85d11ef64191daa15a8eb9d345f163b7295. Candidato SHA256 6aacbc76440583af8679098b6d425a570a0ca4229bdaf6f510f200d80cbb6f7d. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-cyclic-work-13 — Il calore ceduto richiesto dal bersaglio

Il fluido operante è un sistema chiuso che compie un ciclo e torna allo stesso stato; anche energia cinetica e potenziale macroscopica tornano ai valori iniziali. Nel ciclo assorbe Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda: Q_h e Q_c sono moduli in J, con Q_h>Q_c. Non vi sono altri scambi energetici. W è il lavoro netto compiuto dal fluido, positivo uscente. Le temperature delle sorgenti non sono assegnate: si considerano realizzazioni compatibili con il secondo principio e non si impone che le sorgenti restino uguali fra prove diverse. A ha Q_h=100 J, Q_c,A=40 J. B riceve Q_h,B=200 J e deve fornire W_B=(7/3)W_A. Quanto vale Q_c,B/Q_c,A?

Procedimento d’autore: Il bersaglio è sette terzi di sessanta, centoquaranta joule di lavoro. La macchina B ne riceve duecento, quindi ne deve cedere sessanta al freddo. Sessanta diviso quaranta è tre mezzi. Lo scarico ricostruito è positivo e inferiore all’ingresso B.

Passaggi esatti: W_B=140\,\mathrm J;  Q_{c,B}=Q_{h,B}-W_B;  Q_{c,B}=60\,\mathrm J;  Q_{c,B}/Q_{c,A}=\frac32.

Distrattori e controllo didattico: Due terzi capovolge il rapporto richiesto; sette terzi copia il fattore sul lavoro. Due imporrebbe Q_c,B=80 J e lascerebbe solo 120 J di lavoro. Sessanta è un calore in joule e non il rapporto richiesto.

Fonte canonica SHA256 f52de82aa33c468d5312cb423f93a74e3c4abd03afc21e3d9adb6528d22ea8b0. Candidato SHA256 b94ab50f533e084941f1f574c7fc0071b0520d924ff6712352d4bacc14696d5e. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-cyclic-work-14 — Un display del lavoro e l’ingresso termico

Il fluido operante è un sistema chiuso che compie un ciclo e torna allo stesso stato; anche energia cinetica e potenziale macroscopica tornano ai valori iniziali. Nel ciclo assorbe Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda: Q_h e Q_c sono moduli in J, con Q_h>Q_c. Non vi sono altri scambi energetici. W è il lavoro netto compiuto dal fluido, positivo uscente. Le temperature delle sorgenti non sono assegnate: si considerano realizzazioni compatibili con il secondo principio e non si impone che le sorgenti restino uguali fra prove diverse. S=qW è un display continuo adimensionale con q>0 costante. A: Q_h=100 J, Q_c=40 J, S=180. B: Q_c=60 J, S=420. Quanto vale Q_h,B in J?

Procedimento d’autore: Il riferimento compie sessanta joule: q=180/(60 J)=3 J⁻¹. La lettura quattrocentoventi rappresenta centoquaranta joule di lavoro. Il calore ricevuto deve fornire questi e i sessanta ceduti alla sorgente fredda, quindi duecento joule.

Passaggi esatti: q=3\,\mathrm{J^{-1}};  W_B=140\,\mathrm J;  Q_{h,B}=W_B+Q_{c,B};  Q_{h,B}=200\,\mathrm J.

Distrattori e controllo didattico: Centoquaranta copia il lavoro e omette lo scarico. Usare il display grezzo 420 come joule darebbe Q_h=480 J: il guadagno strumentale non è uno. La lettura continua non conta pacchetti interi di energia.

Fonte canonica SHA256 381da499c99ef5e0f32b425ab5a308251e5310315e4d2bc3e2d52edf0ba98cd1. Candidato SHA256 36478be0551789ea79e5d4c0129c8dbd51435e76659d2db8db246045d80cd643. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-cyclic-work-15 — Due riferimenti per distinguere lavoro e calore

Il fluido operante è un sistema chiuso che compie un ciclo e torna allo stesso stato; anche energia cinetica e potenziale macroscopica tornano ai valori iniziali. Nel ciclo assorbe Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda: Q_h e Q_c sono moduli in J, con Q_h>Q_c. Non vi sono altri scambi energetici. W è il lavoro netto compiuto dal fluido, positivo uscente. Le temperature delle sorgenti non sono assegnate: si considerano realizzazioni compatibili con il secondo principio e non si impone che le sorgenti restino uguali fra prove diverse. Il display continuo è S=qW+b, con q>0 e q,b costanti. A: Q_h=100 J, Q_c=40 J, S=121. B: Q_h=200 J, Q_c=60 J, S=281. C: Q_c=40 J, S=321. Quanto vale Q_h,C?

Procedimento d’autore: A e B forniscono sessanta e centoquaranta joule. La differenza centosessanta delle letture divisa per ottanta joule dà q=2 J⁻¹; b=1. C fornisce (321−1)/2=160 J di lavoro. Il suo ingresso è 160+40=200 J, perché va contato anche il calore ceduto.

Passaggi esatti: q=2\,\mathrm{J^{-1}};  b=1;  W_C=160\,\mathrm J;  Q_{h,C}=200\,\mathrm J.

Distrattori e controllo didattico: Centosessanta è il lavoro prima di aggiungere Q_c. Cento J darebbero S=121 e quattrocento J S=721. 401/2 J omette l’offset e ricostruisce S=322 invece di 321. Duecento J restituiscono esattamente S=2(200−40)+1=321.

Fonte canonica SHA256 78dd430f5617efafda51e00d335e144e926d1b405179e475d526dddc570e1a1e. Candidato SHA256 a4c5ee197cb2bbab4ca444e883e79c7baa6151f83babe798ab55aa9c7a0c654f. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-cyclic-work-16 — Un vincolo fra i moduli dei calori

Il fluido operante è un sistema chiuso che compie un ciclo e torna allo stesso stato; anche energia cinetica e potenziale macroscopica tornano ai valori iniziali. Nel ciclo assorbe Q_h>0 dalla sorgente calda e cede Q_c>0 alla fredda: Q_h e Q_c sono moduli in J, con Q_h>Q_c. Non vi sono altri scambi energetici. W è il lavoro netto compiuto dal fluido, positivo uscente. Le temperature delle sorgenti non sono assegnate: si considerano realizzazioni compatibili con il secondo principio e non si impone che le sorgenti restino uguali fra prove diverse. Fra prove si impone Q_h=(5/2)Q_c. Se W=60 J, quanto vale Q_c>0?

Procedimento d’autore: Sostituendo il vincolo nel bilancio resta W=(5/2)Q_c−Q_c=(3/2)Q_c. Moltiplichiamo sessanta per due terzi e otteniamo quaranta joule ceduti. L’ingresso è cento joule, maggiore dello scarico e con lavoro positivo. Il vincolo collega i due trasferimenti totali del ciclo, non una legge istantanea di flusso termico.

Passaggi esatti: W=\frac52Q_c-Q_c;  W=\frac32Q_c;  Q_c=\frac23W;  Q_c=40\,\mathrm J;  Q_h=100\,\mathrm J.

Distrattori e controllo didattico: Meno quaranta viola il modulo positivo. Sessanta copia W e cento copia Q_h. Ventiquattro divide per cinque mezzi ignorando il calore ceduto che va sottratto: dopo il bilancio il coefficiente è tre mezzi.

Fonte canonica SHA256 bba1eb2ced8f25c9ca1f0af913214b4b9061a9636bfb0de6104b7bd8989135a0. Candidato SHA256 fd293f91a93220d178c3ff156d3a3cbfabfc56df6df74fbf77d6235bfc7946fc. Review indipendente NOT_RUN; human NOT_RUN.
