# Authoring DRAFT — refrigerator-cop-162

Tutti gli 80 prompt assegnati A158–162 sono stati letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605 prima di iniziare la riscrittura. Fonte U5-02 SHA256 66ade7951eecbdbea93c529a628b01c2e8bf393959f757a2cf82aeb03cabb95c. Compiti e casi speciali conservati; eventuali nuove parametrizzazioni sono dichiarate qui. Riletti i blocchi delle lezioni reali C3-L08/L09/L10 e il lavoro/potenza in C1-L007, oltre ai prerequisiti C3 pertinenti. Corso C3 e competenze del catalogo, nessuna lezione inventata.

Autore soltanto: revisione scientifica indipendente NOT_RUN, approvazione umana NOT_RUN, DRAFT e publicationAction NONE. Queste sono note di calcolo dell’autore, non un oracolo indipendente e non un’autofirma.

Due assembly in processi distinti hanno prodotto package e binding identici. Importatore canonico ROOT con percorso assoluto in SQLite temporaneo: 16 nuovi, poi 0 nuovi/16 invariati; 991 pubblicati e versioni storiche conservati, SHA dei pubblicati invariato. Asset SVG letto in XML e rendering nativo completo. Snapshot privata del runtime ROOT, fingerprint 54054f7ac463ef52f7c4c881d50ee071713315d891812696f18e39d9ad45ab3d, verificata uguale prima del replay. Runner canonico browser-batches.mjs ha realmente completato 48 viste a 1440/768/320 px con exit 0 e scritto atomicamente il proprio completion.json; marker riletto dal validatore canonico contro i byte finali. Report grezzo e marker sono conservati byte per byte in editorial/author-evidence. Nessun ritag di prove precedenti, nessuna modifica a runtime, CSS, registry o dati degli studenti. Queste prove tecniche non certificano la correttezza scientifica o l’esperienza umana.

Qc è energia asportata al freddo, W è lavoro entrante. COP=Qc/W può superare1 e non è un rendimento motore; Qh=Qc+W. Nessun limite Carnot numerico è inferito senza le temperature. Il caso12 distingue media dei COP3 e COP sugli ingressi medi101/21. Il16 lascia libera la scala energetica.

## AR-u5-refrigerator-cop-01 — Il calore spostato per joule di lavoro

Un frigorifero chiuso compie un ciclo: Q_c>0 è il calore asportato alla sorgente fredda e W>0 il lavoro fornito alla macchina, entrambi in J per ciclo. Le energie interne e macroscopiche tornano ai valori iniziali e non vi sono altri scambi. Il calore ceduto alla sorgente calda è Q_h=Q_c+W. Il coefficiente di prestazione frigorifero è COP=Q_c/W, non il rendimento di un motore. Le temperature delle sorgenti non sono assegnate; si considerano prove termodinamicamente possibili, senza imporre la stessa coppia di sorgenti fra prove. Q_c=100 J e W=20 J. Quanto vale COP?

Procedimento d’autore: Dividiamo cento joule asportati al freddo per venti joule di lavoro entrante: COP=5. Non sono cinque joule creati da uno: per ogni joule di lavoro il frigorifero trasferisce anche energia già presente nella sorgente fredda. Alla calda arrivano 120 J, somma di calore asportato e lavoro ricevuto.

Passaggi esatti: \mathrm{COP}=\frac{Q_c}{W};  \mathrm{COP}=\frac{100}{20};  \mathrm{COP}=5;  Q_h=120\,\mathrm J.

Distrattori e controllo didattico: Un quinto inverte il rapporto e sei usa Q_h/W, coefficiente della pompa di calore per il riscaldamento. Ottanta J sottrae il lavoro dal calore asportato, ma qui entrambi entrano nel sistema e sono ceduti insieme alla sorgente calda.

Fonte canonica SHA256 ca31d0a2e84135a79ed9b4ad2c9812701c5cce38e9226741cad1267286d5d3e1. Candidato SHA256 eec23fda0b779beab4459c3134a2ec55f40f7bd334e2efb27f5ff0a7222f173e. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-refrigerator-cop-02 — Un rapporto di energie senza unità

Un frigorifero chiuso compie un ciclo: Q_c>0 è il calore asportato alla sorgente fredda e W>0 il lavoro fornito alla macchina, entrambi in J per ciclo. Le energie interne e macroscopiche tornano ai valori iniziali e non vi sono altri scambi. Il calore ceduto alla sorgente calda è Q_h=Q_c+W. Il coefficiente di prestazione frigorifero è COP=Q_c/W, non il rendimento di un motore. Le temperature delle sorgenti non sono assegnate; si considerano prove termodinamicamente possibili, senza imporre la stessa coppia di sorgenti fra prove. Quale unità è corretta per COP?

Procedimento d’autore: COP è Q_c/W, rapporto di due energie, quindi J/J=1. Non compare una durata e non è una potenza. Un coefficiente maggiore di uno è compatibile con la sua definizione: l’effetto utile è spostare calore già presente, non convertirlo tutto da lavoro.

Passaggi esatti: [\mathrm{COP}]=\mathrm J/\mathrm J;  [\mathrm{COP}]=1.

Distrattori e controllo didattico: J indica un trasferimento energetico, W una potenza, J/K una capacità termica e K una temperatura. Essere adimensionale non impone da solo un intervallo fra zero e uno.

Fonte canonica SHA256 dddec4efda467329f610a08865ae9e043c12d16ede24df5a0d99387b6c74d98e. Candidato SHA256 834e93ebeba4d7cd9ccc8fbbf4956f48e95e78b8f5d28ed238863f62e527c6e5. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-refrigerator-cop-03 — La definizione da non scambiare con un rendimento

Un frigorifero chiuso compie un ciclo: Q_c>0 è il calore asportato alla sorgente fredda e W>0 il lavoro fornito alla macchina, entrambi in J per ciclo. Le energie interne e macroscopiche tornano ai valori iniziali e non vi sono altri scambi. Il calore ceduto alla sorgente calda è Q_h=Q_c+W. Il coefficiente di prestazione frigorifero è COP=Q_c/W, non il rendimento di un motore. Le temperature delle sorgenti non sono assegnate; si considerano prove termodinamicamente possibili, senza imporre la stessa coppia di sorgenti fra prove. Quale relazione dà il COP frigorifero?

Procedimento d’autore: Per raffreddare interessa il calore rimosso alla sorgente fredda. Il costo energetico è il lavoro fornito alla macchina: il loro rapporto è Q_c/W. Il calore ceduto alla calda contiene anche il lavoro e descrive un altro effetto utile, quello della pompa di calore.

Passaggi esatti: \mathrm{COP}=\frac{Q_c}{W};  Q_h=Q_c+W.

Distrattori e controllo didattico: W/Q_c è il reciproco. Q_h/W è il coefficiente della pompa di calore e supera il COP frigorifero di uno.1−Q_c/Q_h usa una forma da motore con ruoli energetici diversi. La somma Q_c+W è calore ceduto in joule, non un coefficiente puro.

Fonte canonica SHA256 622b4f9f8cf35ddce1932909f699d0475c364ce973f341c80a719a7870a37563. Candidato SHA256 d670cc8c469200d0af84a096ad63c577c43118e9ceb985b422a3fccd4aca5212. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-refrigerator-cop-04 — Più calore asportato con lo stesso lavoro

Un frigorifero chiuso compie un ciclo: Q_c>0 è il calore asportato alla sorgente fredda e W>0 il lavoro fornito alla macchina, entrambi in J per ciclo. Le energie interne e macroscopiche tornano ai valori iniziali e non vi sono altri scambi. Il calore ceduto alla sorgente calda è Q_h=Q_c+W. Il coefficiente di prestazione frigorifero è COP=Q_c/W, non il rendimento di un motore. Le temperature delle sorgenti non sono assegnate; si considerano prove termodinamicamente possibili, senza imporre la stessa coppia di sorgenti fra prove. A ha Q_c=100 J,W=20 J. B ha Q_c=200 J e lo stesso W=20 J. Come cambia COP?

Procedimento d’autore: Il lavoro fornito è invariato mentre il calore utile asportato raddoppia. Il rapporto passa da 100/20=5 a 200/20=10. In B vengono ceduti alla calda 220 J, ma quel numero non è il numeratore del COP frigorifero.

Passaggi esatti: \mathrm{COP}_A=5;  \mathrm{COP}_B=\frac{200}{20};  \mathrm{COP}_B=10.

Distrattori e controllo didattico: Cinque mezzi rende inversa la dipendenza da Q_c, cinque ignora il cambiamento. Undici usa Q_h/W, mentre un decimo capovolge il COP B. Il secondo principio non si controlla imponendo COP≤1: servirebbero le temperature per un limite quantitativo.

Fonte canonica SHA256 3be2b5933ebfb01449c50e69bb7b5bf1a7442e404ab061021ae5a065f1deaae0. Candidato SHA256 199d27d663776c1538e3d0f21833ee0b3bed72263345db0bfd6c7286b967905e. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-refrigerator-cop-05 — Il calore rimosso dal coefficiente

Un frigorifero chiuso compie un ciclo: Q_c>0 è il calore asportato alla sorgente fredda e W>0 il lavoro fornito alla macchina, entrambi in J per ciclo. Le energie interne e macroscopiche tornano ai valori iniziali e non vi sono altri scambi. Il calore ceduto alla sorgente calda è Q_h=Q_c+W. Il coefficiente di prestazione frigorifero è COP=Q_c/W, non il rendimento di un motore. Le temperature delle sorgenti non sono assegnate; si considerano prove termodinamicamente possibili, senza imporre la stessa coppia di sorgenti fra prove. COP=5 e W=20 J. Quanto vale Q_c in J?

Procedimento d’autore: La definizione richiede Q_c=(COP)W. Cinque volte venti joule sono cento joule asportati al freddo. Sommando il lavoro troviamo poi 120 J ceduti al caldo, senza confonderli con il calore utile richiesto.

Passaggi esatti: Q_c=\mathrm{COP}\,W;  Q_c=100\,\mathrm J;  Q_h=120\,\mathrm J.

Distrattori e controllo didattico: Quattro J divide per cinque anziché moltiplicare. Centoventi J è Q_h e venti J copia il lavoro. Ottanta J sottrae W dal calore asportato invece di usare la definizione del COP.

Fonte canonica SHA256 2888a0bdebf9e141e496ad659b706defb17a15a48d5556f54375e8208453bd40. Candidato SHA256 a54eec0e71d3d32602ce0ec4b97f0d9cfa3610e865b7df4b8d5f1243750f93a4. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-refrigerator-cop-06 — Il lavoro necessario al frigorifero

Un frigorifero chiuso compie un ciclo: Q_c>0 è il calore asportato alla sorgente fredda e W>0 il lavoro fornito alla macchina, entrambi in J per ciclo. Le energie interne e macroscopiche tornano ai valori iniziali e non vi sono altri scambi. Il calore ceduto alla sorgente calda è Q_h=Q_c+W. Il coefficiente di prestazione frigorifero è COP=Q_c/W, non il rendimento di un motore. Le temperature delle sorgenti non sono assegnate; si considerano prove termodinamicamente possibili, senza imporre la stessa coppia di sorgenti fra prove. COP=5 e Q_c=100 J. Quanto vale W in J?

Procedimento d’autore: Isoliamo W nel rapporto: W=Q_c/COP. Cento diviso cinque sono venti joule di lavoro entrante. Il valore è positivo, come richiede la macchina assegnata; non è lavoro prodotto verso l’esterno.

Passaggi esatti: W=\frac{Q_c}{\mathrm{COP}};  W=\frac{100}{5}\,\mathrm J;  W=20\,\mathrm J.

Distrattori e controllo didattico: Cinquecento J moltiplica per COP invece di dividere. Meno venti cambierebbe la convenzione dichiarata: sarebbe lavoro della macchina negativo, non il modulo di ingresso W richiesto. Cento J copia Q_c.

Fonte canonica SHA256 fe8a01eafbaec6d00d66040c654421e0f3a8f7762a2da55c060143e664b11b49. Candidato SHA256 1a3887373fc394cfad7dd5bc357237e32e11b601d5726afaeb908f5ea39229f8. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-refrigerator-cop-07 — Stesso effetto utile, costo doppio

Un frigorifero chiuso compie un ciclo: Q_c>0 è il calore asportato alla sorgente fredda e W>0 il lavoro fornito alla macchina, entrambi in J per ciclo. Le energie interne e macroscopiche tornano ai valori iniziali e non vi sono altri scambi. Il calore ceduto alla sorgente calda è Q_h=Q_c+W. Il coefficiente di prestazione frigorifero è COP=Q_c/W, non il rendimento di un motore. Le temperature delle sorgenti non sono assegnate; si considerano prove termodinamicamente possibili, senza imporre la stessa coppia di sorgenti fra prove. A ha Q_c=100 J,W_A=20 J. B mantiene Q_c e richiede W_B=40 J. Quanto vale COP_B/COP_A?

Procedimento d’autore: A ha COP5; B asporta gli stessi cento joule usando quaranta joule di lavoro e ha COP5/2. Il quoziente(5/2)/5 è un mezzo. Un lavoro maggiore per lo stesso effetto utile significa prestazione minore.

Passaggi esatti: \mathrm{COP}_A=5;  \mathrm{COP}_B=\frac52;  \frac{\mathrm{COP}_B}{\mathrm{COP}_A}=\frac12.

Distrattori e controllo didattico: Due segue direttamente il lavoro anziché il suo inverso. Uno ignora il costo aggiuntivo, un quarto e quattro aggiungono un quadrato che la definizione non contiene.

Fonte canonica SHA256 f3ebd67b9b9c666913e53c9dab0bbd6a862415346368c945010e9e06f9539aee. Candidato SHA256 e031f4d924494dc364c3924e5fdbc4cd21dc413c904263f52076c21b00099851. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-refrigerator-cop-08 — Una proposta doppia del coefficiente corretto

Un frigorifero chiuso compie un ciclo: Q_c>0 è il calore asportato alla sorgente fredda e W>0 il lavoro fornito alla macchina, entrambi in J per ciclo. Le energie interne e macroscopiche tornano ai valori iniziali e non vi sono altri scambi. Il calore ceduto alla sorgente calda è Q_h=Q_c+W. Il coefficiente di prestazione frigorifero è COP=Q_c/W, non il rendimento di un motore. Le temperature delle sorgenti non sono assegnate; si considerano prove termodinamicamente possibili, senza imporre la stessa coppia di sorgenti fra prove. Con Q_c=100 J e W=20 J si propone COP=10. Quanto vale proposta meno valore corretto?

Procedimento d’autore: Il rapporto corretto è cinque. Dieci meno cinque dà cinque, senza unità. La proposta non viene rifiutata perché supera uno: viene rifiutata perché non restituisce i calori e il lavoro assegnati. Con W=20 J,COP10 richiederebbe Q_c=200 J.

Passaggi esatti: \mathrm{COP}=5;  e=10-5;  e=5.

Distrattori e controllo didattico: Meno cinque cambia l’ordine dello scarto; dieci copia la proposta e zero la accetta. Due è il rapporto fra proposta e corretta, non la loro differenza.

Fonte canonica SHA256 cb98cfe718364d73fefda455169c601307aa9aaad6890a78d5d3ed39707572f4. Candidato SHA256 56417282a0a52c202d27248db73b01ef47637b249a29486b5ba9d4b034615e6b. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-refrigerator-cop-09 — L’inversa generale del calore utile

Un frigorifero chiuso compie un ciclo: Q_c>0 è il calore asportato alla sorgente fredda e W>0 il lavoro fornito alla macchina, entrambi in J per ciclo. Le energie interne e macroscopiche tornano ai valori iniziali e non vi sono altri scambi. Il calore ceduto alla sorgente calda è Q_h=Q_c+W. Il coefficiente di prestazione frigorifero è COP=Q_c/W, non il rendimento di un motore. Le temperature delle sorgenti non sono assegnate; si considerano prove termodinamicamente possibili, senza imporre la stessa coppia di sorgenti fra prove. Sono noti COP e W>0. Quale formula dà Q_c?

Procedimento d’autore: Moltiplicando COP=Q_c/W per il lavoro positivo si ottiene Q_c=COP·W. La grandezza pura COP non cambia l’unità J del lavoro. Per le prove considerate COP>0, quindi il calore asportato è positivo.

Passaggi esatti: \mathrm{COP}\,W=Q_c;  Q_c=\mathrm{COP}\,W.

Distrattori e controllo didattico: W/COP risolve un problema diverso e non ricostruisce il rapporto dato. COP/W ha unità J⁻¹. Sommare o sottrarre un coefficiente puro a un lavoro mescola dimensioni diverse.

Fonte canonica SHA256 9cc1a29a25fb1e4a4b458faee2cae79ed5bd6bcb9b09b891299d15bbad070330. Candidato SHA256 f70049d2e68ce530364ffcba37d983d098910658abc4484f39ecf2b95117fd18. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-refrigerator-cop-10 — Fattori sul raffreddamento e sul costo

Un frigorifero chiuso compie un ciclo: Q_c>0 è il calore asportato alla sorgente fredda e W>0 il lavoro fornito alla macchina, entrambi in J per ciclo. Le energie interne e macroscopiche tornano ai valori iniziali e non vi sono altri scambi. Il calore ceduto alla sorgente calda è Q_h=Q_c+W. Il coefficiente di prestazione frigorifero è COP=Q_c/W, non il rendimento di un motore. Le temperature delle sorgenti non sono assegnate; si considerano prove termodinamicamente possibili, senza imporre la stessa coppia di sorgenti fra prove. B usa Q_c,B=κ₁Q_c,A e W_B=κ₂W_A, con κ₁,κ₂>0. Quanto vale COP_B/COP_A?

Procedimento d’autore: Il calore utile e il lavoro entrante compaiono in un quoziente. Nel confronto fra prove restano κ₁ al numeratore e κ₂ al denominatore. Se entrambi i trasferimenti crescono dello stesso fattore, il COP resta invariato: cambia la scala energetica, non la prestazione per unità di lavoro.

Passaggi esatti: \mathrm{COP}_B=\frac{\kappa_1}{\kappa_2}\mathrm{COP}_A;  \frac{\mathrm{COP}_B}{\mathrm{COP}_A}=\frac{\kappa_1}{\kappa_2}.

Distrattori e controllo didattico: Il prodotto tratta più lavoro come aumento della prestazione. Il quoziente inverso scambia le prove, il quadrato non segue dalla definizione e la somma darebbe due per due prove identiche.

Fonte canonica SHA256 7c3473b7bd2c3cdaaab5188946a2da7485c41f5f7841b144e1bf41fa33068698. Candidato SHA256 0e550f4aacac3808b21fc13b094ed1b011f40516960c10be78afdd72b49725c7. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-refrigerator-cop-11 — Un ciclo piccolo con COP unitario

Un frigorifero chiuso compie un ciclo: Q_c>0 è il calore asportato alla sorgente fredda e W>0 il lavoro fornito alla macchina, entrambi in J per ciclo. Le energie interne e macroscopiche tornano ai valori iniziali e non vi sono altri scambi. Il calore ceduto alla sorgente calda è Q_h=Q_c+W. Il coefficiente di prestazione frigorifero è COP=Q_c/W, non il rendimento di un motore. Le temperature delle sorgenti non sono assegnate; si considerano prove termodinamicamente possibili, senza imporre la stessa coppia di sorgenti fra prove. A ha Q_c=100 J,W=20 J. B ha Q_c=1 J,W=1 J. Quanto vale COP_B/COP_A?

Procedimento d’autore: A ha COP5. In B il rapporto fra un joule asportato e un joule di lavoro è uno. Dividendo uno per cinque otteniamo un quinto. Il calore ceduto alla calda in B è 2 J, ma non entra nel numeratore del COP frigorifero.

Passaggi esatti: \mathrm{COP}_A=5;  \mathrm{COP}_B=1;  \frac{\mathrm{COP}_B}{\mathrm{COP}_A}=\frac15.

Distrattori e controllo didattico: Cinque è il reciproco; un centesimo confronta i calori utili e un ventesimo i lavori. Uno copia COP_B senza dividerlo per COP_A. La piccola dimensione del ciclo non determina da sola il coefficiente.

Fonte canonica SHA256 e4f9a19cd8b00b3c2bf94598e2ec15b4cf2e5b2ee68e985d75e9900dc7bb407f. Candidato SHA256 40745184820599b3f7d3ab0f232b37adcb70a7c9cc968b091d9e11f2d212a9f7. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-refrigerator-cop-12 — Una media non pesata dei coefficienti

Un frigorifero chiuso compie un ciclo: Q_c>0 è il calore asportato alla sorgente fredda e W>0 il lavoro fornito alla macchina, entrambi in J per ciclo. Le energie interne e macroscopiche tornano ai valori iniziali e non vi sono altri scambi. Il calore ceduto alla sorgente calda è Q_h=Q_c+W. Il coefficiente di prestazione frigorifero è COP=Q_c/W, non il rendimento di un motore. Le temperature delle sorgenti non sono assegnate; si considerano prove termodinamicamente possibili, senza imporre la stessa coppia di sorgenti fra prove. A ha Q_c=100 J,W=20 J. B ha Q_c=1 J,W=1 J. Qual è la media aritmetica dei due COP con uguale peso?

Procedimento d’autore: I COP sono cinque e uno, quindi la loro media è tre. Sommare invece gli effetti utili e i lavori dei due cicli dà 101/21: è la prestazione aggregata, pesata per i lavori 20 J e 1 J. Valutare la legge sui due ingressi medi dà lo stesso 101/21, ma non la media statistica richiesta.

Passaggi esatti: \overline{\mathrm{COP}}=\frac{5+1}{2};  \overline{\mathrm{COP}}=3;  \mathrm{COP}_{\rm aggregato}=\frac{101}{21}.

Distrattori e controllo didattico: 101/21 risponde al confronto fra le somme energetiche. Sei non dimezza la somma, quattro fa una differenza e cinque ignora B. Non occorre dividere in decimali:101≠3·21=63 prova che le due operazioni sono diverse.

Fonte canonica SHA256 0ae680b9630c94b44e529d310990da4b865fe06b2ab4440503a34c47e0b80d8a. Candidato SHA256 8589d5654b6804b89465f76c5ccaaaf496743b16dc029e77aed5722b9f579bc4. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-refrigerator-cop-13 — Il lavoro che realizza il bersaglio

Un frigorifero chiuso compie un ciclo: Q_c>0 è il calore asportato alla sorgente fredda e W>0 il lavoro fornito alla macchina, entrambi in J per ciclo. Le energie interne e macroscopiche tornano ai valori iniziali e non vi sono altri scambi. Il calore ceduto alla sorgente calda è Q_h=Q_c+W. Il coefficiente di prestazione frigorifero è COP=Q_c/W, non il rendimento di un motore. Le temperature delle sorgenti non sono assegnate; si considerano prove termodinamicamente possibili, senza imporre la stessa coppia di sorgenti fra prove. A ha Q_c=100 J,W_A=20 J. B deve avere COP_B=(1/5)COP_A e asporta Q_c,B=1 J. Quanto vale W_B/W_A?

Procedimento d’autore: Il bersaglio è un quinto di cinque, quindi COP_B=1. Per asportare 1 J con coefficiente uno occorre W_B=1 J. Il rapporto con i 20 J di lavoro A è un ventesimo. La sorgente calda riceve 2 J nel ciclo B, in accordo col bilancio.

Passaggi esatti: \mathrm{COP}_B=1;  W_B=\frac{Q_{c,B}}{\mathrm{COP}_B};  W_B=1\,\mathrm J;  W_B/W_A=\frac1{20}.

Distrattori e controllo didattico: Venti è il reciproco, un quinto copia il bersaglio sui COP e un centesimo il rapporto fra i calori asportati. Uno confonde il valore numerico di W_B in J con il rapporto richiesto.

Fonte canonica SHA256 2ac76515552507416a9f3424dca1c5fe8db39e4adcc6738787efb132fe3bb6f7. Candidato SHA256 1b159abbc43c9b30b617d599df712926111cf015d768436128c85c4b9deb2d49. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-refrigerator-cop-14 — Decodificare il display prima di ricavare il calore

Un frigorifero chiuso compie un ciclo: Q_c>0 è il calore asportato alla sorgente fredda e W>0 il lavoro fornito alla macchina, entrambi in J per ciclo. Le energie interne e macroscopiche tornano ai valori iniziali e non vi sono altri scambi. Il calore ceduto alla sorgente calda è Q_h=Q_c+W. Il coefficiente di prestazione frigorifero è COP=Q_c/W, non il rendimento di un motore. Le temperature delle sorgenti non sono assegnate; si considerano prove termodinamicamente possibili, senza imporre la stessa coppia di sorgenti fra prove. S=q·COP è un display continuo adimensionale con q>0 costante. A: Q_c=100 J,W=20 J,S=15. B: W=1 J,S=3. Quanto vale Q_c,B in J?

Procedimento d’autore: Il riferimento ha COP5, perciò q=15/5=3. La lettura B di tre corrisponde a COP_B=1. Moltiplicando questo coefficiente per 1 J di lavoro si ottiene 1 J asportato al freddo. Il display continuo non è una quantità di calore.

Passaggi esatti: q=3;  \mathrm{COP}_B=1;  Q_{c,B}=\mathrm{COP}_B W_B;  Q_{c,B}=1\,\mathrm J.

Distrattori e controllo didattico: Tre J scambia la lettura grezza con il coefficiente fisico, omettendo q. Due J è invece Q_h,B, il calore ceduto alla calda. Un terzo J applica una divisione ulteriore dopo aver già decodificato il coefficiente.

Fonte canonica SHA256 feca92b1cc5579c9bf1499273e244557298d8bf33f74c045083c367b21815cdb. Candidato SHA256 45138c46eb62fff61d5132e560424478eff3ee40340e1756a3aad318ad3056c5. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-refrigerator-cop-15 — La taratura affine di una prestazione

Un frigorifero chiuso compie un ciclo: Q_c>0 è il calore asportato alla sorgente fredda e W>0 il lavoro fornito alla macchina, entrambi in J per ciclo. Le energie interne e macroscopiche tornano ai valori iniziali e non vi sono altri scambi. Il calore ceduto alla sorgente calda è Q_h=Q_c+W. Il coefficiente di prestazione frigorifero è COP=Q_c/W, non il rendimento di un motore. Le temperature delle sorgenti non sono assegnate; si considerano prove termodinamicamente possibili, senza imporre la stessa coppia di sorgenti fra prove. Il display continuo è S=q·COP+b, con q>0 e q,b costanti. A: Q_c=100 J,W=20 J,S=11. B: Q_c=1 J,W=1 J,S=3. C: W=20 J,S=21. Quanto vale Q_c,C?

Procedimento d’autore: I riferimenti hanno COP5 e 1. La differenza 8 fra le letture divisa per 4 fra i coefficienti dàq=2; poi b=1. C ha COP_C=(21−1)/2=10 e asporta 10·20 J=200 J. L’offset non rappresenta un calore trasferito.

Passaggi esatti: q=2;  b=1;  \mathrm{COP}_C=10;  Q_{c,C}=200\,\mathrm J.

Distrattori e controllo didattico: Cento J ricondurrebbe alla lettura 11. Venti J copia il lavoro e darebbe COP1. Duecentodieci J omette b, usando COP=21/2 e ricostruendo S=22. Quattrocento raddoppia ancora il calore dopo aver già applicato il coefficiente.

Fonte canonica SHA256 2553992e51e34bd4d70229d8ba6f0fb7f942aca590c0cf4b0882f6cd56dcc65b. Candidato SHA256 5195a579a60cfb1885c5135e8694fea38fbdb75862fa2cd88cc229c70ab3984c. Review indipendente NOT_RUN; human NOT_RUN.

## AR-u5-refrigerator-cop-16 — Il coefficiente non stabilisce il lavoro assoluto

Un frigorifero chiuso compie un ciclo: Q_c>0 è il calore asportato alla sorgente fredda e W>0 il lavoro fornito alla macchina, entrambi in J per ciclo. Le energie interne e macroscopiche tornano ai valori iniziali e non vi sono altri scambi. Il calore ceduto alla sorgente calda è Q_h=Q_c+W. Il coefficiente di prestazione frigorifero è COP=Q_c/W, non il rendimento di un motore. Le temperature delle sorgenti non sono assegnate; si considerano prove termodinamicamente possibili, senza imporre la stessa coppia di sorgenti fra prove. Fra prove vale Q_c=5W. Una misura dà COP=5. Quali W>0 sono compatibili?

Procedimento d’autore: Sostituendo il vincolo si trova COP=5W/W=5 per ogni lavoro positivo. La misura ripete il rapporto assegnato e non fissa la scala energetica. W=1 J,Q_c=5 J e W=20 J,Q_c=100 J sono due esempi distinti validi; ciascun ciclo cede al caldo la somma dei propri ingressi.

Passaggi esatti: \mathrm{COP}=\frac{5W}{W};  \mathrm{COP}=5\quad(W>0).

Distrattori e controllo didattico: Venti J copia il riferimento; cinque J trasforma un coefficiente puro in un’energia senza un dato ulteriore. Nessuno ignora gli esempi e zero non è ammesso: renderebbe Q_c/W un rapporto 0/0. Il vincolo vale fra prove, non definisce potenze istantanee.

Fonte canonica SHA256 4aee0a04de0648530c1946fcaba0817b4b5128e62e9670bb0ac979a2651c8375. Candidato SHA256 7509cc5c0226d0c46998637f6e33eb8cf59b4424c7717135fd1dfe7dda63871a. Review indipendente NOT_RUN; human NOT_RUN.
