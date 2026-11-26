# Authoring DRAFT — capacitor-sharing-energy-loss-224

Letti individualmente tutti gli 80 prompt originali assegnati A220–224 prima di scrivere il primo candidato. Fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U6-04 SHA256 179bf1cacfb83482e32bb41e99cb78296990faafba1fe9ce3b0e3cbc3a6a09cf. Compiti e ID conservati, incluse eccezioni: 22006 polarità opposte e transitorio esaurito; 22106 capacità delle due topologie, senza falsa conservazione di una commutazione. Rilette integralmente le lezioni reali C4-L07 e C4-L08: L07 definisce il singolo condensatore e resta prerequisito; L08 tratta reti, tensioni in serie, carica dei nodi e dissipazione nella condivisione ed è la competenza primaria corretta dei presenti quesiti. Prerequisiti reali C4-L01/L03/L04/L07/L08 e C1-L001. Nessuna nuova lezione inventata.

Prima di candidature U604 entrambi i revisori avevano congelato la propria primaria: B per A220–224 SHA08e1a184ade8bd85a9d6d8f4b919b18105877f0c2007729ba514f0f48f36eb58 (non aperta dall’autore); A per B225–229 SHA1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a, lettura solo allowlist id/prompt senza opzioni o chiavi altrui.

Autore soltanto: DRAFT, revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica. Due processi separati dell’assembler unico producono byte identici. Per questi byte finali l’importatore canonico ROOT su SQLite temporaneo è terminato due volte per timeout invariato di 60 secondi. I negativi autentici sono preservati. Non si applica il vecchio import positivo, riferito soltanto alla precedente edizione. Importazione canonica dei byte finali PENDING_ROOT sul runner esistente; nessuna prova di preservazione o idempotenza è attribuita al tentativo incompleto. Le sole due assembly attuali sono realmente terminate exit 0 con byte identici. Nessun accredito d’integrazione.

Figura realmente prodotta nel browser soltanto come SVG inline a piena altezza, sotto mutex e guardia ≥2 GiB, processo terminale exit0. XML integrale e PNG intero sono stati letti; dimensioni e bounding box esatti nel manifest. Nessuna pagina dell’app aperta, nessun marker di UI prodotto creato o riusato. UI prodotto e layout a 320px NOT_RUN; collaudo canonico riservato all’integratore. I testi visibili usano grandezze fisiche, non metriche dell’implementazione.

## AR-u6-capacitor-sharing-energy-loss-01 — Dove va l’energia del campo

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. Con V₁=4 V e V₂=2 V, quanto vale L in μJ?

Procedimento d’autore: La carica del futuro nodo positivo è C(V₁+V₂)=6 μC. Alla fine la capacità totale è 2 μF e la tensione comune 3 V. Prima U_i=(1/2)C(4²+2²) V²=10 μJ; dopo U_f=(1/2)(2C)(3 V)²=9 μJ. La differenza positiva L è 1 μJ. La carica del nodo si conserva, ma l’energia del solo campo diminuisce.

Passaggi: V_f=\frac{V_1+V_2}{2};  V_f=3\,\mathrm V;  U_i=10\,\mu\mathrm J;  U_f=9\,\mu\mathrm J;  L=1\,\mu\mathrm J.

Distrattori: Due μJ darebbe il doppio del saldo. Nove μJ è l’energia finale e dieci quella iniziale, non la loro differenza. −1 μJ è l’incremento U_f−U_i del campo: la domanda definisce invece la sua diminuzione positiva.

Hint: Conserva prima la carica per trovare V_f, poi confronta le due energie.

Fonte canonica SHA256 5e39023c448a366f8134e78d615f7e0af6ec694c8568a699748ec125947ee721. Candidato SHA256 69f1f5052ca10cf7aa603e52c81bc49c929896d5741af29f6c2f126553485948. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-02 — Una conversione di energia

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. Quale unità esprime L?

Procedimento d’autore: L è una differenza di energie e ha unità joule. Dalla relazione C(V₁−V₂)²/4 si ottiene F·V²=Coulomb·V=J. Il prefisso μ corrisponde a un milionesimo e non trasforma la grandezza in una potenza.

Passaggi: [L]=\mathrm F\cdot\mathrm V^2;  [L]=\mathrm J.

Distrattori: W misura energia per tempo, non energia. C,F,V indicano carica, capacità e tensione. Il transitorio ha una durata, ma qui non si divide L per essa e non si chiede una potenza media.

Hint: Controlla la dimensione di capacità per tensione al quadrato.

Fonte canonica SHA256 91172e29a32d754d293db66b1d4b53667f71d47d687a4546b33e1446d1593c13. Candidato SHA256 7c2ddc057aa21f71fada34495c0d285a18121f11ad8d62c2e4f8ff5db274a46a. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-03 — Il saldo in forma compatta

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. Quale legge dà L?

Procedimento d’autore: La tensione comune è (V₁+V₂)/2. L’energia iniziale è C(V₁²+V₂²)/2 e quella finale C(V₁+V₂)²/4. Sottraendole e sviluppando il quadrato rimane C(V₁²−2V₁V₂+V₂²)/4, cioè C(V₁−V₂)²/4. Il coefficiente un quarto deriva dal confronto dei due stati, non dall’energia di un solo condensatore.

Passaggi: V_f=\frac{V_1+V_2}{2};  U_f=\frac C4(V_1+V_2)^2;  L=\frac C4(V_1-V_2)^2.

Distrattori: Il denominatore due raddoppia la conversione. Il quadrato della somma dà U_f. La differenza dei quadrati non è il quadrato della differenza: con 4 e 2 V darebbe 3 μJ, non 1 μJ; C(V₁−V₂)/4 ha dimensione di carica e non energia.

Hint: Sottrai l’energia finale da quella iniziale e raccogli il quadrato della differenza.

Fonte canonica SHA256 c6e434fb08e7d74be1621f050d5bb2a8db2808163f172078846b599d20b8db19. Candidato SHA256 4a932ad4c9eac87d61c1a41b2771c5a2c3b900ca87b014f95b77b1f24904f1d8. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-04 — Raddoppia la differenza di tensione

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. V₁ passa da 4 a 6 V, mentre V₂ resta 2 V. Come cambia L?

Procedimento d’autore: La differenza iniziale è 4−2=2 V e quella nuova 6−2=4 V. Raddoppiare questa differenza quadruplica L: da 1 a 4 μJ. Il fattore 6/4 della sola V₁ non è il fattore dell’argomento elevato al quadrato.

Passaggi: \Delta_A=2\,\mathrm V;  \Delta_B=4\,\mathrm V;  L_B=4\,\mu\mathrm J.

Distrattori: Due μJ tratta L come lineare nella differenza. 3/2 μJ segue soltanto V₁, uno non aggiorna gli ingressi e nove μJ non è il saldo della prova nuova. La conversione dipende dallo scarto V₁−V₂.

Hint: Forma la differenza prima di applicare il quadrato.

Fonte canonica SHA256 dd1c1167df11ff1202ace4deb5ad3f908810664159c6c97812e351fa912f1e10. Candidato SHA256 c8c8c09404169aef5a12c23e09af96f329942c6291d921cca8ecda3e5285ca61. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-05 — Ricostruire la tensione maggiore

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. Si misura L=1 μJ e si conosce V₂=2 V. Quanto vale V₁ in V?

Procedimento d’autore: Pongo Δ=V₁−V₂>0. La legge dà Δ²=4L/C=4 V², quindi Δ=2 V sul ramo positivo. Si ricostruisce V₁=V₂+Δ=4 V. La radice negativa della differenza produrrebbe V₁=0 e violerebbe V₁>V₂.

Passaggi: \Delta^2=\frac{4L}{C};  \Delta=2\,\mathrm V;  V_1=V_2+\Delta;  V_1=4\,\mathrm V.

Distrattori: Due V copia la differenza Δ, non la tensione V₁. Zero viene dal ramo negativo ed è escluso. Sei V darebbe una differenza di 4 V e L=4 μJ. Il segno si decide dal dominio, non soltanto dalla positività della radice.

Hint: Trova lo scarto positivo e aggiungilo a V₂.

Fonte canonica SHA256 918654e57a1a38a9df7a7638a9de6aa38d182a57700eba5e5d01c3591e1be4e3. Candidato SHA256 eb8ce9dc662c9d00c14411d629e7561eaeeae8c80c9e7057839a05fd00c4e4d5. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-06 — Ricostruire la tensione minore

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. Si misura L=1 μJ e si conosce V₁=4 V. Quanto vale V₂ in V?

Procedimento d’autore: La stessa differenza positiva vale Δ=√(4L/C)=2 V. Questa volta V₂=V₁−Δ=2 V. L’alternativa V₁+Δ=6 V sarebbe maggiore di V₁ e contraddirebbe l’ordine imposto. In generale serve 0<L<CV₁²/4 per conservare V₂>0.

Passaggi: \Delta=2\,\mathrm V;  V_2=V_1-\Delta;  V_2=2\,\mathrm V.

Distrattori: Sei V conserva la stessa differenza in modulo ma scambia l’ordine delle tensioni iniziali. Quattro V darebbe L=0, escluso dal dominio stretto; zero V darebbe L=4 μJ e non è positivo. La misura e il ramo selezionano una sola V₂.

Hint: Sottrai lo scarto positivo dalla tensione maggiore.

Fonte canonica SHA256 8ea51570f60313dec15414adf7f6e9ea75aa04251295e0d75fd2692b1d546010. Candidato SHA256 5743cf10ba9e2128554364e44276525bf7a9e53917c33e6a30ae82498b82638a. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-07 — Una differenza più grande

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. A ha V₁=4 V,V₂=2 V. B mantiene V₁ e usa V₂=1 V. Quanto vale L_B/L_A?

Procedimento d’autore: L_A=(4−2)²/4 μJ=1 μJ. L_B=(4−1)²/4 μJ=9/4 μJ. Il rapporto è 9/4: abbassare V₂ aumenta la differenza, pur mantenendo V₁ invariata. Il rapporto diretto delle V₂ non descrive questa dipendenza.

Passaggi: L_A=1\,\mu\mathrm J;  L_B=\frac94\,\mu\mathrm J;  L_B/L_A=\frac94.

Distrattori: 4/9 inverte il confronto. Mezzo segue solo V₂, due il suo reciproco e uno ignora il cambiamento. L’argomento del quadrato passa da 2 a 3 V, non da 2 a 1 V.

Hint: Confronta i due scarti e poi i loro quadrati.

Fonte canonica SHA256 692618cd923ca391073acfcfa3bfd78ec0da300714d417a3aeb4058f2435d182. Candidato SHA256 e41fddf107e788023962cdd4b5460d7a8ae09d38bbbeb0ac335e109ac6475c92. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-08 — Scarto e segno del saldo

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. Con V₁=4 V,V₂=2 V si propone L=2 μJ. Quanto vale proposta meno corretto?

Procedimento d’autore: Il corretto L è 1 μJ. La proposta lo supera di 2−1=1 μJ. Non si confonde questo scarto con l’incremento negativo dell’energia del campo: sono due definizioni differenti.

Passaggi: L=1\,\mu\mathrm J;  e=(2-1)\,\mu\mathrm J;  e=1\,\mu\mathrm J.

Distrattori: −1 scambia l’ordine dello scarto; 2 μJ copia la proposta e zero la accetta. Il numero puro due è il rapporto della proposta col corretto, non una differenza di energie.

Hint: Usa la definizione proposto meno corretto, dopo aver trovato L.

Fonte canonica SHA256 f88abde7b14b0c1621f01a91b011f4c314bcd05710c6fe124aaf40d301d0b678. Candidato SHA256 d5e02188e0a579d186c33c88572211a1f1d85c1f13076e99c5ab03ad02c1ee83. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-09 — L’inversa con ordine dichiarato

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. L e V₂ sono noti. Quale relazione isola V₁?

Procedimento d’autore: Il quadrato fornisce due segni per V₁−V₂, ma V₁>V₂ sceglie quello positivo. Si trova Δ=√(4L/C), poi V₁=V₂+Δ. La quantità sotto radice ha V²; dopo la radice è possibile sommarla alla tensione V₂.

Passaggi: V_1-V_2=\sqrt{\frac{4L}{C}};  V_1=V_2+\sqrt{\frac{4L}{C}}.

Distrattori: Il meno viola V₁>V₂. La radice da sola è soltanto la differenza; 4L/C senza radice ha unità V² e non si somma a V₂. La divisione finale per due non deriva dall’equazione del saldo.

Hint: Applica la condizione d’ordine alla radice dello scarto.

Fonte canonica SHA256 7d1d954bde7062b8250f379ae86fac4ab909ef9fba4910df437fab4aa0010d45. Candidato SHA256 a1dd6870bee92d093fd7f02f0b4720bfd7ea3d520a6285f865cfc7a646d5813d. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-10 — Due fattori e un ordine da conservare

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. B usa V₁,B=κ₁V₁ e V₂,B=κ₂V₂. I fattori sono positivi e κ₁V₁>κ₂V₂. Definiamo Δ=V₁−V₂ e Δ_B=κ₁V₁−κ₂V₂, entrambe tensioni positive. Quanto vale L_B/L_A?

Procedimento d’autore: C è identica nelle due prove, quindi il rapporto dei saldi è il quadrato del rapporto delle differenze: L_B/L_A=(Δ_B/Δ)². Non basta dire che i fattori sono positivi: deve conservarsi anche l’ordine delle due tensioni. Con un fattore comune κ la differenza scala di κ e il saldo di κ².

Passaggi: L_A=\frac C4\Delta^2;  L_B=\frac C4\Delta_B^2;  \frac{L_B}{L_A}=\left(\frac{\Delta_B}{\Delta}\right)^2.

Distrattori: Il rapporto semplice omette il quadrato. Il prodotto dei fattori non sviluppa una differenza; il loro quoziente perde i pesi V₁,V₂. L’ultimo rapporto è il reciproco del corretto. Se l’ordine non fosse conservato non si userebbe lo stesso ramo delle inverse.

Hint: Forma la nuova differenza orientata prima del rapporto.

Fonte canonica SHA256 ed48f3afa3ec35654989ddd24d03981396860e658894261133e196947e17f1da. Candidato SHA256 71a81fd7dc998bd708c6c6524491ace1fef1740201dc9431eb5ef568ee250fd9. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-11 — Una scala comune raddoppiata

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. A usa V₁=4 V,V₂=2 V. B usa V₁=8 V,V₂=4 V. Quanto vale L_B/L_A?

Procedimento d’autore: La differenza passa da 2 a 4 V. Le conversioni sono 1 e 4 μJ, quindi rapporto quattro. Entrambe le tensioni raddoppiano e l’ordine resta vero; questo è il caso di una scalatura comune, non di una compensazione.

Passaggi: L_A=1\,\mu\mathrm J;  L_B=4\,\mu\mathrm J;  L_B/L_A=4.

Distrattori: Due segue linearmente la differenza. 1/4 è il reciproco, mezzo rende inversa una sola scala e uno confonde raddoppio comune con invarianza della differenza.

Hint: Il saldo è quadratico nello scarto, anche con scala comune.

Fonte canonica SHA256 1a1ac4d8c6a1e83183b118710438d0e0c6ab2686553b55eb300a13fdbe6124aa. Candidato SHA256 a0ab1fe093cb8c157d80fb2c3e456a1329b68e28965145e7a6ce1cd36de6db96. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-12 — Media delle conversioni

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. A usa 4 e 2 V; B usa 8 e 4 V. Qual è la media aritmetica delle due L con uguale peso?

Procedimento d’autore: Le uscite sono 1 e 4 μJ e la media è 5/2 μJ. Ai dati medi V₁=6 V,V₂=3 V, la legge darebbe 9/4 μJ. La differenza fra 10/4 e 9/4 μJ è 1/4 μJ. Mediare prima le tensioni perderebbe il contributo dovuto alla dispersione delle differenze.

Passaggi: \overline L=\frac52\,\mu\mathrm J;  L_{\rm dati\ medi}=\frac94\,\mu\mathrm J;  \frac52-\frac94=\frac14.

Distrattori: 9/4 μJ applica il modello agli ingressi medi. Cinque somma, 3/2 è metà della differenza e quattro ripete soltanto B. Il valore medio non è l’energia finale del sistema.

Hint: Calcola ogni saldo prima della media.

Fonte canonica SHA256 c0228b01583733c31af939a88c4335f83395709322ce31db0a31a8d856fe20f8. Candidato SHA256 4565acdbd87378ca1f9f9745a60c51965b59a30aef929cfd8e514c25b98c5a66. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-13 — V₂ per il saldo bersaglio

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. A ha V₁=4 V,V₂=2 V. B ha V₁=8 V e deve avere L_B=4L_A. Quanto vale V₂,B/V₂,A?

Procedimento d’autore: Il bersaglio è L_B=4 μJ. La differenza positiva deve valere Δ_B=√(4L_B/C)=4 V. Quindi V₂,B=8−4=4 V e il rapporto con V₂,A=2 V è due. Il ramo alternativo porterebbe V₂,B=12 V, oltre V₁,B, ed è escluso.

Passaggi: L_B=4\,\mu\mathrm J;  \Delta_B=4\,\mathrm V;  V_{2,B}=4\,\mathrm V;  \frac{V_{2,B}}{V_{2,A}}=2.

Distrattori: Mezzo inverte il rapporto, quattro copia il fattore dei saldi, 3/2 non produce lo scarto bersaglio. Uno lascerebbe V₂,B=2 V e darebbe L_B=9 μJ anziché 4 μJ.

Hint: Dalla conversione ricava lo scarto, poi sottrailo da V₁,B.

Fonte canonica SHA256 9e250af367e9a9f16ff6a1f3e163b0fbc21421963ef80dc5b36b3098ac0fd18d. Candidato SHA256 4c6799b47a990f8e77a68dabe895ee5da9b71762780363ada11930f8c5a5057e. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-14 — Guadagno prima della radice

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. D=a_cal L è continuo e adimensionale, a_cal>0. A con V₁=4 V,V₂=2 V dà D=3. B legge D=12 e ha V₂=4 V. Quanto vale V₁,B in V?

Procedimento d’autore: Il riferimento ha L_A=1 μJ, quindi a_cal=3 μJ⁻¹. La nuova lettura dà L_B=4 μJ, da cui Δ_B=4 V. Sommando al V₂,B=4 V si trova V₁,B=8 V. La radice riguarda l’energia fisica decodificata, non direttamente il numero del display.

Passaggi: a_{\rm cal}=3\,(\mu\mathrm J)^{-1};  L_B=4\,\mu\mathrm J;  \Delta_B=4\,\mathrm V;  V_{1,B}=8\,\mathrm V.

Distrattori: Quattro V copia lo scarto o V₂ e darebbe saldo nullo. Dodici V produrrebbe L=16 μJ e D=48. Sei V darebbe L=1 μJ e D=3, tornando al saldo del riferimento e non alla nuova lettura.

Hint: Decodifica L prima di estrarre la radice e sommare V₂.

Fonte canonica SHA256 5012eec4b693ea497fb5ee08041b48e22687099192efabdced2a87aeb475235e. Candidato SHA256 a966888d029c4a41c709a7e7583d5709807004786d0003e07f3fb3ad450cdfe1. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-15 — Una piccola lettura sopra l’offset

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. D=a_cal L+b è continuo. A: V₁=4 V,V₂=2 V,D=3. B: V₁=8 V,V₂=4 V,D=9. C: V₂=1 V,D=3/2. Quanto vale V₁,C?

Procedimento d’autore: I riferimenti hanno L_A=1 e L_B=4 μJ. Guadagno (9−3)/(4−1)=2 μJ⁻¹ e offset 1. Lettura 3/2 dà L_C=(3/2−1)/2 μJ=1/4 μJ. Quindi Δ_C=√(4·1/4) V=1 V e V₁,C=1+1=2 V, maggiore di V₂,C.

Passaggi: a_{\rm cal}=2\,(\mu\mathrm J)^{-1};  b=1;  L_C=\frac14\,\mu\mathrm J;  \Delta_C=1\,\mathrm V;  V_{1,C}=2\,\mathrm V.

Distrattori: (1+√3) V omette l’offset e usa L=3/4 μJ. Un V dà saldo zero; tre V dà L=1 μJ e D=3; quattro V dà L=9/4 μJ e D=11/2. Tutte le radici restano esatte: non occorre valutarle in decimali.

Hint: Sottrai prima l’offset; il quarto di microjoule produce una radice notevole.

Fonte canonica SHA256 017690357f7a15b11c0b3619042f61cc2223bb1d5b739f5340e1364ac3bb31ef. Candidato SHA256 89deafbbd49ee7cde3671b1617f4aeda01ba5bc1f92ec3132f8fed72397ce559. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-sharing-energy-loss-16 — Il vincolo conserva il ramo positivo

Due condensatori lineari identici di capacità C=1 μF hanno tensioni iniziali V₁>V₂>0. Sono scollegati dai generatori e uniti in parallelo con polarità concordi mediante un collegamento con piccola resistenza positiva; si attende che il transitorio si esaurisca. Non entra carica dall’esterno; si trascurano induttanza e radiazione nel modello a parametri concentrati. Indichiamo Δ=V₁−V₂>0. L=U_i−U_f>0 indica la diminuzione dell’energia del campo, convertita qui in calore nel collegamento, non energia totale distrutta. Le capacità restano costanti e si confrontano preparazioni indipendenti. Fra preparazioni vale V₁=2V₂. Si misura L=1 μJ. Quanto vale V₂?

Procedimento d’autore: Con il vincolo, lo scarto V₁−V₂ coincide con V₂. Scrivendo v₂=V₂/(1 V), la legge diventa L/(1 μJ)=v₂²/4. La misura implica v₂²=4; soltanto v₂=2 è positivo e mantiene V₁>V₂. Quindi V₂=2 V e V₁=4 V: la misura fissa la scala.

Passaggi: V_1-V_2=V_2;  v_2^2=4;  V_2=2\,\mathrm V.

Distrattori: Quattro V è il valore della tensione maggiore nella soluzione. −2 viola V₂>0; un V darebbe L=1/4 μJ. Infinite soluzioni ignorerebbe l’informazione assoluta della misura, distinta dal solo rapporto delle tensioni.

Hint: Sostituisci il vincolo e scegli la radice compatibile con entrambe le disuguaglianze.

Fonte canonica SHA256 de758c52d6c258e8f4c146daa967b195e059f14e0b0404b3c99cbe184b09a8c9. Candidato SHA256 975f420132d6c12449ed1bfa4e3e30df153af8d96088c2dbfebb7e8cbcff80fe. Revisione indipendente e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 28c31b150ffbd077958723c67584c564338a98adac010124b85b8c1d7df64d4e. Package file SHA256 7881949f791d8ba9f925cdb046cef1ae4ce3158a1d18f6f4b88b4a6b1f640c1d. Binding file SHA256 22dab95e32d3d84a09b02f448f7d7356a0f22cff8824aac5009f0d59f623bf74. Prova strutturale SHA256 e5adb67dc64a7e3f1f06a59af0f09edf606390b916d7467e860997de27d6f4fd. Manifest asset-only SHA256 49b9331d600759a30516f84b341cfbea5337ea4c88a98a0921d65880c8ed216a.

Nessun runtime, registry, ledger, checkpoint, candidato o Git ROOT modificato. Revisore distinto B assegnato; le sue derivazioni non sono state aperte dall’autore.

## Finding distinto15 e prove tecniche separate

La frase del feedback scrive ora (1+√3) V: l’unità si applica all’intera somma, come nell’opzione già corretta. Strictdiff: soltanto ultimo blocco/error15 e binding15 derivato; altri15, tutti prompt/risposte/formule e SVG byte-identici. Vecchi file e handoff preservati con checksum nell’archivio peer-units15-superseded. Le due nuove assembly-only sono realmente terminate0 e producono byte identici. Due tentativi canonici di importazione sono realmente terminati1 per timeout invariato60s e sono conservati separatamente; non si attribuisce al finale il vecchio import positivo. Root ha disposto il replay con lo stesso importatore sul runner esistente. Import finale PENDING_ROOT, nessun proprioSCI o markerUI. Stesso SVG e PNG nativo già effettivamente letto da A e indipendentemente da B, nessun rerender necessario per questa modifica testuale.

## Correzione di mappatura didattica dopo review distinta

La lezione originale C4-L08 «Mettere insieme i condensatori», riletta nel pin Cric5d1d, è il riferimento primario per questa famiglia. Aggiornati soltanto skill, error.target e aggiunta della competenza esistente L08 ai prerequisiti, conservando L07. Ogni altro campo dei sedici record, tutte le formule e le scelte e ogni byte SVG sono identici per confronto strutturale. Due nuove assembly effettive exit0 e identiche; nessun nuovo render necessario per asset immutato. I precedenti import/report SCI sono conservati nell’archivio con checksum e restano storici sulle vecchie firme. Import finale PENDING_ROOT_REMOTE; nessun nuovo DB locale, come autorizzato dall’integratore. Revisione scientifica distinta delle nuove associazioni e human NOT_RUN, DRAFT e publicationAction NONE.
