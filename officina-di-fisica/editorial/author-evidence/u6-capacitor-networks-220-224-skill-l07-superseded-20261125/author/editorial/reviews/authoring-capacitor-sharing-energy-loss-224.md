# Authoring DRAFT — capacitor-sharing-energy-loss-224

Letti individualmente tutti gli 80 prompt originali assegnati A220–224 prima di scrivere il primo candidato. Fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U6-04 SHA256 179bf1cacfb83482e32bb41e99cb78296990faafba1fe9ce3b0e3cbc3a6a09cf. Compiti e ID conservati, incluse eccezioni: 22006 polarità opposte e transitorio esaurito; 22106 capacità delle due topologie, senza falsa conservazione di una commutazione. Riletta integralmente la lezione reale C4-L07, capacità come Q/V, geometria piana, lavoro di carica e distinzione fra condensatore isolato e collegato; prerequisiti reali C4-L01/L03/L04 e C1-L001. Nessuna nuova lezione inventata.

Prima di candidature U604 entrambi i revisori avevano congelato la propria primaria: B per A220–224 SHA08e1a184ade8bd85a9d6d8f4b919b18105877f0c2007729ba514f0f48f36eb58 (non aperta dall’autore); A per B225–229 SHA1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a, lettura solo allowlist id/prompt senza opzioni o chiavi altrui.

Autore soltanto: DRAFT, revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica. Due processi separati dell’assembler unico producono byte identici. Per questi byte finali l’importatore canonico ROOT su SQLite temporaneo è terminato due volte per timeout invariato di 60 secondi. I negativi autentici sono preservati. Non si applica il vecchio import positivo, riferito soltanto alla precedente edizione. Importazione canonica dei byte finali PENDING_ROOT sul runner esistente; nessuna prova di preservazione o idempotenza è attribuita al tentativo incompleto. Le sole due assembly attuali sono realmente terminate exit 0 con byte identici. Nessun accredito d’integrazione.

Figura realmente prodotta nel browser soltanto come SVG inline a piena altezza, sotto mutex e guardia ≥2 GiB, processo terminale exit0. XML integrale e PNG intero sono stati letti; dimensioni e bounding box esatti nel manifest. Nessuna pagina dell’app aperta, nessun marker di UI prodotto creato o riusato. UI prodotto e layout a 320px NOT_RUN; collaudo canonico riservato all’integratore. I testi visibili usano grandezze fisiche, non metriche dell’implementazione.

## AR-u6-capacitor-sharing-energy-loss-01 — Dove va l’energia del campo

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. Con V₁=4 V e V₂=2 V, quanto vale L in μJ?

Procedimento d’autore: La carica del futuro nodo positivo è C(V₁+V₂)=6 μC. Alla fine la capacità totale è 2 μF e la tensione comune 3 V. Prima U_i=(1/2)C(4²+2²) V²=10 μJ; dopo U_f=(1/2)(2C)(3 V)²=9 μJ. La differenza positiva L è 1 μJ. La carica del nodo si conserva, ma l’energia del solo campo diminuisce.

Passaggi: V_f=\frac{V_1+V_2}{2};  V_f=3\,\mathrm V;  U_i=10\,\mu\mathrm J;  U_f=9\,\mu\mathrm J;  L=1\,\mu\mathrm J.

Distrattori: Due μJ darebbe il doppio del saldo. Nove μJ è l’energia finale e dieci quella iniziale, non la loro differenza. −1 μJ è l’incremento U_f−U_i del campo: la domanda definisce invece la sua diminuzione positiva.

Hint: Conserva prima la carica per trovare V_f, poi confronta le due energie.

Fonte canonica SHA256 5e39023c448a366f8134e78d615f7e0af6ec694c8568a699748ec125947ee721. Candidato SHA256 d07eb69a3c70fa2ac7c1605ec7513c70a2bc8d30dd3a537edf13629bff95ed05. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-02 — Una conversione di energia

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. Quale unità esprime L?

Procedimento d’autore: L è una differenza di energie e ha unità joule. Dalla relazione C(V₁−V₂)²/4 si ottiene F·V²=Coulomb·V=J. Il prefisso μ corrisponde a un milionesimo e non trasforma la grandezza in una potenza.

Passaggi: [L]=\mathrm F\cdot\mathrm V^2;  [L]=\mathrm J.

Distrattori: W misura energia per tempo, non energia. C,F,V indicano carica, capacità e tensione. Il transitorio ha una durata, ma qui non si divide L per essa e non si chiede una potenza media.

Hint: Controlla la dimensione di capacità per tensione al quadrato.

Fonte canonica SHA256 91172e29a32d754d293db66b1d4b53667f71d47d687a4546b33e1446d1593c13. Candidato SHA256 88878fd043db2d59854b1d796e17d62c60e5b5617b0229e1654e8e5408c2d371. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-03 — Il saldo in forma compatta

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. Quale legge dà L?

Procedimento d’autore: La tensione comune è (V₁+V₂)/2. L’energia iniziale è C(V₁²+V₂²)/2 e quella finale C(V₁+V₂)²/4. Sottraendole e sviluppando il quadrato rimane C(V₁²−2V₁V₂+V₂²)/4, cioè C(V₁−V₂)²/4. Il coefficiente un quarto deriva dal confronto dei due stati, non dall’energia di un solo condensatore.

Passaggi: V_f=\frac{V_1+V_2}{2};  U_f=\frac C4(V_1+V_2)^2;  L=\frac C4(V_1-V_2)^2.

Distrattori: Il denominatore due raddoppia la conversione. Il quadrato della somma dà U_f. La differenza dei quadrati non è il quadrato della differenza: con 4 e 2 V darebbe 3 μJ, non 1 μJ; C(V₁−V₂)/4 ha dimensione di carica e non energia.

Hint: Sottrai l’energia finale da quella iniziale e raccogli il quadrato della differenza.

Fonte canonica SHA256 c6e434fb08e7d74be1621f050d5bb2a8db2808163f172078846b599d20b8db19. Candidato SHA256 100793067b8ffc97e826c391e71d6920571dedbf1f0b53a47242469415b648f0. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-04 — Raddoppia la differenza di tensione

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. V₁ passa da 4 a 6 V, mentre V₂ resta 2 V. Come cambia L?

Procedimento d’autore: La differenza iniziale è 4−2=2 V e quella nuova 6−2=4 V. Raddoppiare questa differenza quadruplica L: da 1 a 4 μJ. Il fattore 6/4 della sola V₁ non è il fattore dell’argomento elevato al quadrato.

Passaggi: \Delta_A=2\,\mathrm V;  \Delta_B=4\,\mathrm V;  L_B=4\,\mu\mathrm J.

Distrattori: Due μJ tratta L come lineare nella differenza. 3/2 μJ segue soltanto V₁, uno non aggiorna gli ingressi e nove μJ non è il saldo della prova nuova. La conversione dipende dallo scarto V₁−V₂.

Hint: Forma la differenza prima di applicare il quadrato.

Fonte canonica SHA256 dd1c1167df11ff1202ace4deb5ad3f908810664159c6c97812e351fa912f1e10. Candidato SHA256 86b9227e848de7b2a55a1cba377b91b5d5c62b151a47bf32c552e14d5c714017. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-05 — Ricostruire la tensione maggiore

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. Si misura L=1 μJ e si conosce V₂=2 V. Quanto vale V₁ in V?

Procedimento d’autore: Pongo Δ=V₁−V₂>0. La legge dà Δ²=4L/C=4 V², quindi Δ=2 V sul ramo positivo. Si ricostruisce V₁=V₂+Δ=4 V. La radice negativa della differenza produrrebbe V₁=0 e violerebbe V₁>V₂.

Passaggi: \Delta^2=\frac{4L}{C};  \Delta=2\,\mathrm V;  V_1=V_2+\Delta;  V_1=4\,\mathrm V.

Distrattori: Due V copia la differenza Δ, non la tensione V₁. Zero viene dal ramo negativo ed è escluso. Sei V darebbe una differenza di 4 V e L=4 μJ. Il segno si decide dal dominio, non soltanto dalla positività della radice.

Hint: Trova lo scarto positivo e aggiungilo a V₂.

Fonte canonica SHA256 918654e57a1a38a9df7a7638a9de6aa38d182a57700eba5e5d01c3591e1be4e3. Candidato SHA256 f4929b33d302fb9f21c0a049d7ce68121937938f1a53dd77130ab8603802dc33. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-06 — Ricostruire la tensione minore

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. Si misura L=1 μJ e si conosce V₁=4 V. Quanto vale V₂ in V?

Procedimento d’autore: La stessa differenza positiva vale Δ=√(4L/C)=2 V. Questa volta V₂=V₁−Δ=2 V. L’alternativa V₁+Δ=6 V sarebbe maggiore di V₁ e contraddirebbe l’ordine imposto. In generale serve 0<L<CV₁²/4 per conservare V₂>0.

Passaggi: \Delta=2\,\mathrm V;  V_2=V_1-\Delta;  V_2=2\,\mathrm V.

Distrattori: Sei V conserva la stessa differenza in modulo ma scambia l’ordine delle tensioni iniziali. Quattro V darebbe L=0, escluso dal dominio stretto; zero V darebbe L=4 μJ e non è positivo. La misura e il ramo selezionano una sola V₂.

Hint: Sottrai lo scarto positivo dalla tensione maggiore.

Fonte canonica SHA256 8ea51570f60313dec15414adf7f6e9ea75aa04251295e0d75fd2692b1d546010. Candidato SHA256 1b089a4f97c4b65db5237114f4f57cd40abcdaefab5941eaca72701091b61ad0. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-07 — Una differenza più grande

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. A ha V₁=4 V,V₂=2 V. B mantiene V₁ e usa V₂=1 V. Quanto vale L_B/L_A?

Procedimento d’autore: L_A=(4−2)²/4 μJ=1 μJ. L_B=(4−1)²/4 μJ=9/4 μJ. Il rapporto è 9/4: abbassare V₂ aumenta la differenza, pur mantenendo V₁ invariata. Il rapporto diretto delle V₂ non descrive questa dipendenza.

Passaggi: L_A=1\,\mu\mathrm J;  L_B=\frac94\,\mu\mathrm J;  L_B/L_A=\frac94.

Distrattori: 4/9 inverte il confronto. Mezzo segue solo V₂, due il suo reciproco e uno ignora il cambiamento. L’argomento del quadrato passa da 2 a 3 V, non da 2 a 1 V.

Hint: Confronta i due scarti e poi i loro quadrati.

Fonte canonica SHA256 692618cd923ca391073acfcfa3bfd78ec0da300714d417a3aeb4058f2435d182. Candidato SHA256 0b53d033c418991af09f100cf1aa5a45569d25d903d02e9081a38c61017b45af. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-08 — Scarto e segno del saldo

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. Con V₁=4 V,V₂=2 V si propone L=2 μJ. Quanto vale proposta meno corretto?

Procedimento d’autore: Il corretto L è 1 μJ. La proposta lo supera di 2−1=1 μJ. Non si confonde questo scarto con l’incremento negativo dell’energia del campo: sono due definizioni differenti.

Passaggi: L=1\,\mu\mathrm J;  e=(2-1)\,\mu\mathrm J;  e=1\,\mu\mathrm J.

Distrattori: −1 scambia l’ordine dello scarto; 2 μJ copia la proposta e zero la accetta. Il numero puro due è il rapporto della proposta col corretto, non una differenza di energie.

Hint: Usa la definizione proposto meno corretto, dopo aver trovato L.

Fonte canonica SHA256 f88abde7b14b0c1621f01a91b011f4c314bcd05710c6fe124aaf40d301d0b678. Candidato SHA256 83e51093a125deba5b5acb412d4b04f3f4c059daaf9370b43a1124cc27a71411. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-09 — L’inversa con ordine dichiarato

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. L e V₂ sono noti. Quale relazione isola V₁?

Procedimento d’autore: Il quadrato fornisce due segni per V₁−V₂, ma V₁>V₂ sceglie quello positivo. Si trova Δ=√(4L/C), poi V₁=V₂+Δ. La quantità sotto radice ha V²; dopo la radice è possibile sommarla alla tensione V₂.

Passaggi: V_1-V_2=\sqrt{\frac{4L}{C}};  V_1=V_2+\sqrt{\frac{4L}{C}}.

Distrattori: Il meno viola V₁>V₂. La radice da sola è soltanto la differenza; 4L/C senza radice ha unità V² e non si somma a V₂. La divisione finale per due non deriva dall’equazione del saldo.

Hint: Applica la condizione d’ordine alla radice dello scarto.

Fonte canonica SHA256 7d1d954bde7062b8250f379ae86fac4ab909ef9fba4910df437fab4aa0010d45. Candidato SHA256 2350b35c4b905c115f0e7d8e4e1c7a53a9f16bc426c383100e6167edbcb391e3. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-10 — Due fattori e un ordine da conservare

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. B usa V₁,B=κ₁V₁ e V₂,B=κ₂V₂. I fattori sono positivi e κ₁V₁>κ₂V₂. Definiamo Δ=V₁−V₂ e Δ_B=κ₁V₁−κ₂V₂, entrambe tensioni positive. Quanto vale L_B/L_A?

Procedimento d’autore: C è identica nelle due prove, quindi il rapporto dei saldi è il quadrato del rapporto delle differenze: L_B/L_A=(Δ_B/Δ)². Non basta dire che i fattori sono positivi: deve conservarsi anche l’ordine delle due tensioni. Con un fattore comune κ la differenza scala di κ e il saldo di κ².

Passaggi: L_A=\frac C4\Delta^2;  L_B=\frac C4\Delta_B^2;  \frac{L_B}{L_A}=\left(\frac{\Delta_B}{\Delta}\right)^2.

Distrattori: Il rapporto semplice omette il quadrato. Il prodotto dei fattori non sviluppa una differenza; il loro quoziente perde i pesi V₁,V₂. L’ultimo rapporto è il reciproco del corretto. Se l’ordine non fosse conservato non si userebbe lo stesso ramo delle inverse.

Hint: Forma la nuova differenza orientata prima del rapporto.

Fonte canonica SHA256 ed48f3afa3ec35654989ddd24d03981396860e658894261133e196947e17f1da. Candidato SHA256 405e2689357cb14a8dce3217f51f75138378573c96479dba1a0ad87d8f6adeaa. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-11 — Una scala comune raddoppiata

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. A usa V₁=4 V,V₂=2 V. B usa V₁=8 V,V₂=4 V. Quanto vale L_B/L_A?

Procedimento d’autore: La differenza passa da 2 a 4 V. Le conversioni sono 1 e 4 μJ, quindi rapporto quattro. Entrambe le tensioni raddoppiano e l’ordine resta vero; questo è il caso di una scalatura comune, non di una compensazione.

Passaggi: L_A=1\,\mu\mathrm J;  L_B=4\,\mu\mathrm J;  L_B/L_A=4.

Distrattori: Due segue linearmente la differenza. 1/4 è il reciproco, mezzo rende inversa una sola scala e uno confonde raddoppio comune con invarianza della differenza.

Hint: Il saldo è quadratico nello scarto, anche con scala comune.

Fonte canonica SHA256 1a1ac4d8c6a1e83183b118710438d0e0c6ab2686553b55eb300a13fdbe6124aa. Candidato SHA256 de1c086da81a5d3225bc3761283ffc03e4c454ba9a9c3d2488294418d08482c8. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-12 — Media delle conversioni

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. A usa 4 e 2 V; B usa 8 e 4 V. Qual è la media aritmetica delle due L con uguale peso?

Procedimento d’autore: Le uscite sono 1 e 4 μJ e la media è 5/2 μJ. Ai dati medi V₁=6 V,V₂=3 V, la legge darebbe 9/4 μJ. La differenza fra 10/4 e 9/4 μJ è 1/4 μJ. Mediare prima le tensioni perderebbe il contributo dovuto alla dispersione delle differenze.

Passaggi: \overline L=\frac52\,\mu\mathrm J;  L_{\rm dati\ medi}=\frac94\,\mu\mathrm J;  \frac52-\frac94=\frac14.

Distrattori: 9/4 μJ applica il modello agli ingressi medi. Cinque somma, 3/2 è metà della differenza e quattro ripete soltanto B. Il valore medio non è l’energia finale del sistema.

Hint: Calcola ogni saldo prima della media.

Fonte canonica SHA256 c0228b01583733c31af939a88c4335f83395709322ce31db0a31a8d856fe20f8. Candidato SHA256 d4cbf356a86dd790b727893d6a64cce8b70a1b00d379dd27485f89ca96d5d600. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-13 — V₂ per il saldo bersaglio

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. A ha V₁=4 V,V₂=2 V. B ha V₁=8 V e deve avere L_B=4L_A. Quanto vale V₂,B/V₂,A?

Procedimento d’autore: Il bersaglio è L_B=4 μJ. La differenza positiva deve valere Δ_B=√(4L_B/C)=4 V. Quindi V₂,B=8−4=4 V e il rapporto con V₂,A=2 V è due. Il ramo alternativo porterebbe V₂,B=12 V, oltre V₁,B, ed è escluso.

Passaggi: L_B=4\,\mu\mathrm J;  \Delta_B=4\,\mathrm V;  V_{2,B}=4\,\mathrm V;  \frac{V_{2,B}}{V_{2,A}}=2.

Distrattori: Mezzo inverte il rapporto, quattro copia il fattore dei saldi, 3/2 non produce lo scarto bersaglio. Uno lascerebbe V₂,B=2 V e darebbe L_B=9 μJ anziché 4 μJ.

Hint: Dalla conversione ricava lo scarto, poi sottrailo da V₁,B.

Fonte canonica SHA256 9e250af367e9a9f16ff6a1f3e163b0fbc21421963ef80dc5b36b3098ac0fd18d. Candidato SHA256 27418986572488583bedfb0dcb0e2b275699c73064fb56e7fd535ddcf175f1cd. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-14 — Guadagno prima della radice

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. D=a_cal L è continuo e adimensionale, a_cal>0. A con V₁=4 V,V₂=2 V dà D=3. B legge D=12 e ha V₂=4 V. Quanto vale V₁,B in V?

Procedimento d’autore: Il riferimento ha L_A=1 μJ, quindi a_cal=3 μJ⁻¹. La nuova lettura dà L_B=4 μJ, da cui Δ_B=4 V. Sommando al V₂,B=4 V si trova V₁,B=8 V. La radice riguarda l’energia fisica decodificata, non direttamente il numero del display.

Passaggi: a_{\rm cal}=3\,(\mu\mathrm J)^{-1};  L_B=4\,\mu\mathrm J;  \Delta_B=4\,\mathrm V;  V_{1,B}=8\,\mathrm V.

Distrattori: Quattro V copia lo scarto o V₂ e darebbe saldo nullo. Dodici V produrrebbe L=16 μJ e D=48. Sei V darebbe L=1 μJ e D=3, tornando al saldo del riferimento e non alla nuova lettura.

Hint: Decodifica L prima di estrarre la radice e sommare V₂.

Fonte canonica SHA256 5012eec4b693ea497fb5ee08041b48e22687099192efabdced2a87aeb475235e. Candidato SHA256 9e7e9dc5e28e583f2defbb037110a4b81e17a9def98a9fff068445ea50675676. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-15 — Una piccola lettura sopra l’offset

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. D=a_cal L+b è continuo. A: V₁=4 V,V₂=2 V,D=3. B: V₁=8 V,V₂=4 V,D=9. C: V₂=1 V,D=3/2. Quanto vale V₁,C?

Procedimento d’autore: I riferimenti hanno L_A=1 e L_B=4 μJ. Guadagno (9−3)/(4−1)=2 μJ⁻¹ e offset 1. Lettura 3/2 dà L_C=(3/2−1)/2 μJ=1/4 μJ. Quindi Δ_C=√(4·1/4) V=1 V e V₁,C=1+1=2 V, maggiore di V₂,C.

Passaggi: a_{\rm cal}=2\,(\mu\mathrm J)^{-1};  b=1;  L_C=\frac14\,\mu\mathrm J;  \Delta_C=1\,\mathrm V;  V_{1,C}=2\,\mathrm V.

Distrattori: (1+√3) V omette l’offset e usa L=3/4 μJ. Un V dà saldo zero; tre V dà L=1 μJ e D=3; quattro V dà L=9/4 μJ e D=11/2. Tutte le radici restano esatte: non occorre valutarle in decimali.

Hint: Sottrai prima l’offset; il quarto di microjoule produce una radice notevole.

Fonte canonica SHA256 017690357f7a15b11c0b3619042f61cc2223bb1d5b739f5340e1364ac3bb31ef. Candidato SHA256 9fe15f33428ba12bce021d9a12755ef060dc21ca6837d3249584b19d78bfcd97. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-16 — Il vincolo conserva il ramo positivo

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. Fra preparazioni vale V₁=2V₂. Si misura L=1 μJ. Quanto vale V₂?

Procedimento d’autore: Con il vincolo, lo scarto V₁−V₂ coincide con V₂. Scrivendo v₂=V₂/(1 V), la legge diventa L/(1 μJ)=v₂²/4. La misura implica v₂²=4; soltanto v₂=2 è positivo e mantiene V₁>V₂. Quindi V₂=2 V e V₁=4 V: la misura fissa la scala.

Passaggi: V_1-V_2=V_2;  v_2^2=4;  V_2=2\,\mathrm V.

Distrattori: Quattro V è il valore della tensione maggiore nella soluzione. −2 viola V₂>0; un V darebbe L=1/4 μJ. Infinite soluzioni ignorerebbe l’informazione assoluta della misura, distinta dal solo rapporto delle tensioni.

Hint: Sostituisci il vincolo e scegli la radice compatibile con entrambe le disuguaglianze.

Fonte canonica SHA256 de758c52d6c258e8f4c146daa967b195e059f14e0b0404b3c99cbe184b09a8c9. Candidato SHA256 d877d53053586cf377d55604a7b8ce021732c7e3ab9809610bb5a373c77284d0. Revisione indipendente e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 28c31b150ffbd077958723c67584c564338a98adac010124b85b8c1d7df64d4e. Package file SHA256 2305f4249da1ff10ff4e06d87a2f984b3703ad3118cec09088b286f1023831d7. Binding file SHA256 f819ee8b667e3e9584197d20e898a7df6270ce0418dedf2193bfe268448c96e3. Prova strutturale SHA256 f3977f3c58621d450ba878d58ff4fb1f440d2b2697fceefe6aa61cb2d26a701d. Manifest asset-only SHA256 49b9331d600759a30516f84b341cfbea5337ea4c88a98a0921d65880c8ed216a.

Nessun runtime, registry, ledger, checkpoint, candidato o Git ROOT modificato. Revisore distinto B assegnato; le sue derivazioni non sono state aperte dall’autore.

## Finding distinto15 e prove tecniche separate

La frase del feedback scrive ora (1+√3) V: l’unità si applica all’intera somma, come nell’opzione già corretta. Strictdiff: soltanto ultimo blocco/error15 e binding15 derivato; altri15, tutti prompt/risposte/formule e SVG byte-identici. Vecchi file e handoff preservati con checksum nell’archivio peer-units15-superseded. Le due nuove assembly-only sono realmente terminate0 e producono byte identici. Due tentativi canonici di importazione sono realmente terminati1 per timeout invariato60s e sono conservati separatamente; non si attribuisce al finale il vecchio import positivo. Root ha disposto il replay con lo stesso importatore sul runner esistente. Import finale PENDING_ROOT, nessun proprioSCI o markerUI. Stesso SVG e PNG nativo già effettivamente letto da A e indipendentemente da B, nessun rerender necessario per questa modifica testuale.
