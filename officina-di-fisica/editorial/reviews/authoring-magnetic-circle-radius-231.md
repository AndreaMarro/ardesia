# Authoring DRAFT — magnetic-circle-radius-231

Tutti gli 80 prompt originali A230–234 sono stati letti individualmente tramite allowlist id/prompt prima del primo candidato U6-05. Fonte Git immutabile5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U6-05 SHA256383a0881e644ab8d95bde40b9b3b3a748eaf0baaeaab941e895077251fd087fe. Compiti e casi autonomi preservati: cariche opposte23103, elettrone parallelo23303 e linee magnetiche23403 non sono assorbiti nei rispettivi modelli numerici. Inverse e rapporti mantengono domini e coefficienti dimensionali.

Prima di candidature entrambi i revisori avevano congelato la primaria: B per A230–234 SHA51395bd462210eea741c8535d111ebf94686590467d5821825834e6e8668f91d su4fcc49cee05f35b838084471fe41bf5babc83f8f (mai aperta dall’autore); A per B235–239 SHAc0d2d26dd79ece4c7ad2ff06d8ddd142acf02eb468b971b3e254ed06e16528bc subc4da66c96cc57f8629b8252a24ce2f1943f7f5e. Nessuna chiave, soluzione, hint, opzione o candidata B235–239 letta durante l’autoria A.

Rilette integralmente le lezioni reali C4-L09 e C4-L10: forza di Lorentz su particella e filo, moto circolare, componente parallela e flusso orientato. Mappatura primaria L09 per230–233 e L10 per il flusso234, con eventuale override autonomo23403 a L09; prerequisiti selezionati sul catalogo reale, senza confondere C1-L006 elasticità/gravitazione con il moto curvo di C1-L004. Nessuna competenza inventata.

Autore soltanto: DRAFT, revisione scientifica distinta NOT_RUN_BY_AUTHOR, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica. Due processi separati dell’assembler unico hanno prodotto package/binding byte-identici. Importatore canonico ROOT in sola lettura su SQLite temporaneo:16 nuovi, poi0 nuovi/16 invariati;991 pubblicati e storico conservati. Queste sono prove strutturali e di preservazione, senza accredito di integrazione o approvazione scientifica.

Figura SVG-only realmente renderizzata in browser nativo a piena altezza sotto mutex condiviso e guardia≥2 GiB; XML e PNG completo effettivamente letti. Il processo è terminato exit0, non si è dedotta la riuscita dalla sola comparsa del PNG. Nessuna pagina del prodotto, nessun server o dato studenti usato. UI prodotto e responsività320px NOT_RUN, riservate al runner canonico dell’integratore. I testi visibili non mostrano metriche ingegneristiche e non confrontano scale di pannelli indipendenti.

## AR-u6-magnetic-circle-radius-01 — La forza magnetica curva senza accelerare la rapidità

Una particella ideale ha massa m=1 mg e modulo della carica |q|=1 μC. Entra con rapidità v>0 perpendicolarmente a un campo magnetico esterno uniforme di modulo B>0. Agisce soltanto la forza magnetica; radiazione e altre forze sono trascurate. Ogni preparazione e variazione resta nel regime non relativistico. Si cerca il raggio positivo r, non il verso di curvatura. Con v=2 m/s e B=1 T, quanto vale r in m?

Procedimento d’autore: La forza magnetica è perpendicolare a v e fornisce la risultante centripeta: |q|vB=mv²/r. Cancello v>0 e ricavo r=mv/(|q|B). Un milligrammo è 10⁻⁶ kg, proprio come 1 μC è 10⁻⁶ C: m/|q| vale 1 kg/C, non un numero puro. Inserendo le unità SI il raggio è 2 m.

Formule: |q|vB=\frac{mv^2}{r};  r=\frac{mv}{|q|B};  \frac m{|q|}=1\,\mathrm{kg/C};  r=2\,\mathrm m.

Distrattori e controprove: Quattro m userebbe il quadrato della rapidità senza cancellare v nella forza magnetica. Un m omette il valore due di v; un raggio negativo non è un’alternativa fisica. Il segno di q cambia il verso, non questo modulo.

Hint: Usa lo stesso v nella forza magnetica e in quella centripeta.

Fonte canonica SHA256 83c2fb8b36e0869148af9d7eba702643d75a493ad8495a2d5ede4324faeb4613. Candidato SHA256 b82ac6e6ed9c0666ba5ff2583213df0b09472d8cfc046f8ad579b7101866fbc4. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-circle-radius-02 — Un raggio è una lunghezza

Una particella ideale ha massa m=1 mg e modulo della carica |q|=1 μC. Entra con rapidità v>0 perpendicolarmente a un campo magnetico esterno uniforme di modulo B>0. Agisce soltanto la forza magnetica; radiazione e altre forze sono trascurate. Ogni preparazione e variazione resta nel regime non relativistico. Si cerca il raggio positivo r, non il verso di curvatura. Quale unità esprime r?

Procedimento d’autore: Il raggio è una lunghezza. Nella legge mv/(|q|B), il prodotto |q|B ha unità kg/s; dividere la quantità di moto kg·m/s per kg/s restituisce m. Il prefisso della massa va convertito prima di usare i numeri.

Formule: [|q|B]=\mathrm{kg/s};  [r]=\mathrm m.

Distrattori e controprove: s è tempo, T campo magnetico, N forza e m/s rapidità. Una traiettoria curva non cambia la dimensione del suo raggio.

Hint: Controlla le unità di mv e di |q|B.

Fonte canonica SHA256 5b796c8a3336ef37c3b8f58eeb3a2b18145c721ccc4b3ed21a929ddfa903c54b. Candidato SHA256 07e588c4edb99c1197a80c7a6db75113ab90d7f9cfdfeb7d220ae340bbcb24c5. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-circle-radius-03 — Stessa grandezza del raggio, segno opposto

Caso autonomo: due particelle con uguale massa positiva, uguale modulo della carica e stessa velocità iniziale non nulla partono dallo stesso punto. Le cariche sono +q e −q e la velocità è perpendicolare allo stesso campo uniforme. Nel modello classico senza altre forze, come si confrontano le traiettorie?

Procedimento d’autore: Il modulo della forza è |q|vB per entrambe, quindi il raggio mv/(|q|B) è uguale. All’istante iniziale le velocità coincidono e il prodotto vettoriale q v×B cambia segno con la carica: le forze e le curvature iniziali sono opposte. Dopo l’evoluzione le velocità non coincidono necessariamente. Il campo da solo non aumenta la rapidità, perché la forza è ortogonale alla velocità.

Formule: r_+=r_-;  \vec F_-(0)=-\vec F_+(0);  \vec F\cdot\vec v=0.

Distrattori e controprove: Un raggio con segno confonde la geometria con il verso di curvatura. All’istante iniziale la forza vettoriale non coincide; il moto non è rettilineo con v perpendicolare e B non nullo. La potenza magnetica nulla esclude l’aumento di rapidità.

Hint: Separa |q| nella legge del raggio da q nella legge vettoriale.

Fonte canonica SHA256 c920f6886f4b34a68de6f1753320dfd33daa40fd2c591221cae5e967f515fc96. Candidato SHA256 54263da27a27b393fc24d8d48363eba06c6a1eefc62c0bebf67de995d472821c. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-circle-radius-04 — Una rapidità maggiore nello stesso campo

Una particella ideale ha massa m=1 mg e modulo della carica |q|=1 μC. Entra con rapidità v>0 perpendicolarmente a un campo magnetico esterno uniforme di modulo B>0. Agisce soltanto la forza magnetica; radiazione e altre forze sono trascurate. Ogni preparazione e variazione resta nel regime non relativistico. Si cerca il raggio positivo r, non il verso di curvatura. B resta 1 T e v passa da 2 a 3 m/s. Come cambia r?

Procedimento d’autore: A massa, modulo della carica e campo fissati, r dipende linearmente da v. Il rapporto delle rapidità è 3/2, quindi il raggio passa da 2 a 3 m. Il campo devia ciascuna particella alla rapidità con cui è stata preparata, senza portarla da solo da 2 a 3 m/s.

Formule: r_A=2\,\mathrm m;  r_B=3\,\mathrm m;  r_B/r_A=\frac32.

Distrattori e controprove: 9/2 m applica il quadrato del fattore 3/2. 4/3 m inverte l’effetto; due ignora la nuova rapidità e sei aggiunge un fattore non richiesto.

Hint: Il v² centripeto si riduce a un solo v dopo la cancellazione.

Fonte canonica SHA256 6e913a9c3949a821742afef5338eb9ea5406f43233f95340086aaee55862e667. Candidato SHA256 1af97adb7c8e3f5625eab7d7be3d7c401101ef5db3359eb3203f9456c72bf0d3. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-circle-radius-05 — La rapidità da un’orbita

Una particella ideale ha massa m=1 mg e modulo della carica |q|=1 μC. Entra con rapidità v>0 perpendicolarmente a un campo magnetico esterno uniforme di modulo B>0. Agisce soltanto la forza magnetica; radiazione e altre forze sono trascurate. Ogni preparazione e variazione resta nel regime non relativistico. Si cerca il raggio positivo r, non il verso di curvatura. Si misurano r=2 m e B=1 T. Quanto vale v in m/s?

Procedimento d’autore: Moltiplico r=mv/(|q|B) per |q|B e divido per m>0: v=|q|Br/m. I dati danno 2 m/s. Il rapporto |q|/m è 1 C/kg e mantiene la dimensione necessaria al prodotto Br.

Formule: v=\frac{|q|Br}{m};  v=2\,\mathrm{m/s}.

Distrattori e controprove: Un mezzo m/s è il reciproco numerico di due e non ricostruisce l’orbita. Quattro m/s darebbe r=4 m; omettere |q|/m lascerebbe B·r con unità diverse da m/s.

Hint: Controlla anche che la rapidità ricavata resti nel regime dichiarato.

Fonte canonica SHA256 800d4b07159f6ff161401cde3c5ab65f3a7601f445dd3a21be84bf972d9a8e70. Candidato SHA256 4e6211d64e00967dffbf3fdc4ea67c7caedf6966b2b60396390c9c1dcb7798be. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-circle-radius-06 — Il campo da raggio e rapidità

Una particella ideale ha massa m=1 mg e modulo della carica |q|=1 μC. Entra con rapidità v>0 perpendicolarmente a un campo magnetico esterno uniforme di modulo B>0. Agisce soltanto la forza magnetica; radiazione e altre forze sono trascurate. Ogni preparazione e variazione resta nel regime non relativistico. Si cerca il raggio positivo r, non il verso di curvatura. Si misurano r=2 m e v=2 m/s. Quanto vale B in T?

Procedimento d’autore: Isolo B=mv/(|q|r). Il rapporto massa/carica vale 1 kg/C e v/r vale 1 s⁻¹: il prodotto è 1 T. Si ricava un modulo positivo; la sola misura del raggio non assegna il verso del vettore B.

Formule: B=\frac{mv}{|q|r};  B=1\,\mathrm T.

Distrattori e controprove: Due T copia il valore numerico della rapidità o del raggio e darebbe r=1 m. Quattro T moltiplica v e r invece di dividerli. Un segno meno non si determina dal modulo r.

Hint: Il campo è inversamente proporzionale al raggio a v fissata.

Fonte canonica SHA256 6fd25bf44759df429ebc01d1a25cb92da74a2218239dd9097c231d6000ffa6f5. Candidato SHA256 9954c097d2e1b58eb85dd5494a06d5f41b9d82dce3aeb6b407669587827a65ea. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-circle-radius-07 — Raddoppiare il campo

Una particella ideale ha massa m=1 mg e modulo della carica |q|=1 μC. Entra con rapidità v>0 perpendicolarmente a un campo magnetico esterno uniforme di modulo B>0. Agisce soltanto la forza magnetica; radiazione e altre forze sono trascurate. Ogni preparazione e variazione resta nel regime non relativistico. Si cerca il raggio positivo r, non il verso di curvatura. A ha v=2 m/s,B=1 T; B mantiene v=2 m/s e usa campo di 2 T. Quanto vale r_B/r_A?

Procedimento d’autore: A ha r_A=2 m. Il campo doppio nella seconda preparazione dà r_B=1 m e rapporto 1/2. Non si dice che il campo compia lavoro rallentando la particella: la rapidità resta quella assegnata in entrambe.

Formule: r_A=2\,\mathrm m;  r_B=1\,\mathrm m;  r_B/r_A=\frac12.

Distrattori e controprove: Due inverte il confronto; un quarto introduce il quadrato di B; uno ignora il cambiamento. Zero richiederebbe un limite estraneo ai moduli finiti positivi.

Hint: Confronta prima le due lunghezze.

Fonte canonica SHA256 5a7c5e2f4024260411e2360b7224403367188334350f8f3eac8115c81987655f. Candidato SHA256 9bab4e737a874f365d324b94453320bbfb8498fe2b3c1d196a02ea6907428f7e. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-circle-radius-08 — Lo scarto non è un raggio orientato

Una particella ideale ha massa m=1 mg e modulo della carica |q|=1 μC. Entra con rapidità v>0 perpendicolarmente a un campo magnetico esterno uniforme di modulo B>0. Agisce soltanto la forza magnetica; radiazione e altre forze sono trascurate. Ogni preparazione e variazione resta nel regime non relativistico. Si cerca il raggio positivo r, non il verso di curvatura. Con v=2 m/s,B=1 T si propone r=4 m. Quanto vale proposta meno corretto?

Procedimento d’autore: Il raggio corretto è 2 m. Lo scarto della proposta è 4−2=+2 m. Il segno di questa differenza non indica il verso della curvatura; viene soltanto dall’ordine richiesto.

Formule: r=2\,\mathrm m;  e=(4-2)\,\mathrm m;  e=2\,\mathrm m.

Distrattori e controprove: −2 scambia l’ordine; due puro è un rapporto, quattro copia la proposta e zero non la verifica. Il raggio geometrico resta positivo anche per una carica negativa.

Hint: Conserva l’unità metro nella sottrazione.

Fonte canonica SHA256 30691edfc74553af04a763e2528eacde6e81b5ee7c03167807c13fcd43fc4ab7. Candidato SHA256 3a528e409a5bc8b64c088052c4ca72c6c03f1b83491346133336b8bff05286a5. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-circle-radius-09 — L’inversa con massa e carica esplicite

Una particella ideale ha massa m=1 mg e modulo della carica |q|=1 μC. Entra con rapidità v>0 perpendicolarmente a un campo magnetico esterno uniforme di modulo B>0. Agisce soltanto la forza magnetica; radiazione e altre forze sono trascurate. Ogni preparazione e variazione resta nel regime non relativistico. Si cerca il raggio positivo r, non il verso di curvatura. r e B sono noti. Quale formula isola v?

Procedimento d’autore: Dal prodotto r|q|B=mv divido per m. La formula v=|q|Br/m mantiene sia il modulo della carica sia la massa. Soltanto per i valori assegnati, il numero v in m/s coincide con il prodotto dei numeri B in T e r in m: non è una legge universale v=Br senza coefficiente.

Formule: v=\frac{|q|Br}{m};  [v]=\mathrm{m/s}.

Distrattori e controprove: mr/(|q|B) ripete una dipendenza inversa da B e ha unità m·s. mB/(|q|r) non ha unità di velocità; |q|B/(mr) ha 1/(m·s), mentre m/(|q|Br) ha s/m. Il controllo dimensionale discrimina queste espressioni.

Hint: Moltiplica per |q|B prima di dividere per m.

Fonte canonica SHA256 d19abab370d0f1db7bafdd878e665a5363fd46040223578537daf3c0e7b5ec42. Candidato SHA256 2cba1f17492c74206d6e333227a2f78a285fff295b5364ea64b12722c634808a. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-circle-radius-10 — Cambiano rapidità e campo

Una particella ideale ha massa m=1 mg e modulo della carica |q|=1 μC. Entra con rapidità v>0 perpendicolarmente a un campo magnetico esterno uniforme di modulo B>0. Agisce soltanto la forza magnetica; radiazione e altre forze sono trascurate. Ogni preparazione e variazione resta nel regime non relativistico. Si cerca il raggio positivo r, non il verso di curvatura. Fra preparazioni v_B=κ₁v_A e B_B=κ₂B_A. I fattori sono positivi e le rapidità restano non relativistiche. Quanto vale r_B/r_A?

Procedimento d’autore: Il rapporto massa/carica si cancella fra le prove. La rapidità dà il fattore κ₁ al numeratore e il campo κ₂ al denominatore: r_B/r_A=κ₁/κ₂. La perpendicolarità resta valida in entrambi i moti.

Formule: r_B=\frac{m\kappa_1v_A}{|q|\kappa_2B_A};  r_B/r_A=\kappa_1/\kappa_2.

Distrattori e controprove: Il prodotto rende diretto l’effetto del campo. Il reciproco scambia i ruoli, il quadrato di κ₁ non segue dalla legge e la somma vale due per preparazioni identiche.

Hint: Il raggio dipende da una potenza di v e dall’inverso di B.

Fonte canonica SHA256 f6c25a3564968cf4242dda9b7d913a0a543e3f51d53b5d6ad544b33492f16bc2. Candidato SHA256 6aee3e71ce638d291213e775efb612395ddff1159417d74d03279586097082d3. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-circle-radius-11 — Rapidità tripla e campo doppio

Una particella ideale ha massa m=1 mg e modulo della carica |q|=1 μC. Entra con rapidità v>0 perpendicolarmente a un campo magnetico esterno uniforme di modulo B>0. Agisce soltanto la forza magnetica; radiazione e altre forze sono trascurate. Ogni preparazione e variazione resta nel regime non relativistico. Si cerca il raggio positivo r, non il verso di curvatura. A ha v=2 m/s,B=1 T. B ha v=6 m/s,B=2 T. Quanto vale r_B/r_A?

Procedimento d’autore: Il raggio iniziale è 2 m; quello nuovo è 3 m. Il rapporto è 3/2: il fattore tre della rapidità è diviso per il fattore due del campo. I due effetti non si annullano.

Formule: r_A=2\,\mathrm m;  r_B=3\,\mathrm m;  r_B/r_A=\frac32.

Distrattori e controprove: Due terzi inverte il confronto; tre segue soltanto v, mezzo soltanto B e uno presume una compensazione esatta. Tutti i calcoli riguardano moduli.

Hint: Non fermarti al fatto che entrambi gli ingressi aumentano.

Fonte canonica SHA256 e71a95071e3f406be5427dc4bb7884cc16bd42d63fc5963bacb3c9f87e2d1b51. Candidato SHA256 dd7dc494de2aac3b1ba8a5924c9d8fd3f55093a192ff05a80b75c37a429d82fe. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-circle-radius-12 — Media di due raggi distinti

Una particella ideale ha massa m=1 mg e modulo della carica |q|=1 μC. Entra con rapidità v>0 perpendicolarmente a un campo magnetico esterno uniforme di modulo B>0. Agisce soltanto la forza magnetica; radiazione e altre forze sono trascurate. Ogni preparazione e variazione resta nel regime non relativistico. Si cerca il raggio positivo r, non il verso di curvatura. Si mediano con uguale peso A:v=2 m/s,B=1 T e B:v=6 m/s,B=2 T. Qual è la media di r?

Procedimento d’autore: Le uscite sono 2 e 3 m: media 5/2 m. Agli ingressi medi v=4 m/s e B=3/2 T il raggio sarebbe 8/3 m. Con denominatore comune sei: 15/6−16/6=−1/6 m. Non si richiede un’approssimazione decimale.

Formule: \overline r=\frac52\,\mathrm m;  r_{\rm dati\ medi}=\frac83\,\mathrm m;  \frac52-\frac83=-\frac16.

Distrattori e controprove: 8/3 usa gli ingressi medi; cinque è la somma, mezzo la semidifferenza e zero non è la media di questi raggi positivi. Non si media una carica positiva con una negativa.

Hint: Completa ogni calcolo di r prima della media.

Fonte canonica SHA256 eff530e5fb4722729d0f3b68d9875f63b0825da02a642105134d6b9ef7ff6317. Candidato SHA256 f8201b772adb812d0a87d94782434fcd6dcdc80222a07e60c76c6ae8c6ebe7ab. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-circle-radius-13 — Il campo per un raggio bersaglio

Una particella ideale ha massa m=1 mg e modulo della carica |q|=1 μC. Entra con rapidità v>0 perpendicolarmente a un campo magnetico esterno uniforme di modulo B>0. Agisce soltanto la forza magnetica; radiazione e altre forze sono trascurate. Ogni preparazione e variazione resta nel regime non relativistico. Si cerca il raggio positivo r, non il verso di curvatura. A ha v_A=2 m/s,B_A=1 T. B usa v_B=6 m/s e deve dare r_B=(3/2)r_A. Quanto vale B_B/B_A?

Procedimento d’autore: Il bersaglio è r_B=3 m. Dall’inversa B=mv/(|q|r) si ottiene B_B=2 T, dunque il rapporto dei campi è due. Il rapporto dei raggi non è il rapporto dei campi perché cambia anche v.

Formule: r_B=3\,\mathrm m;  B_B=2\,\mathrm T;  B_B/B_A=2.

Distrattori e controprove: Mezzo è il reciproco; 3/2 copia il bersaglio dei raggi e tre il solo fattore di v. Un campo invariato darebbe r_B=6 m, non tre.

Hint: Esprimi il bersaglio in metri prima dell’inversa.

Fonte canonica SHA256 3e54dc48d6e7ead396dd9a5887f2140ed70a5f776cee7c8a67a572012883b1f7. Candidato SHA256 64d576ed3865e993fa7c62ab1c43f922e500a8f64ce0fe3bade2ac7fbda632f2. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-circle-radius-14 — Prima il display, poi la rapidità

Una particella ideale ha massa m=1 mg e modulo della carica |q|=1 μC. Entra con rapidità v>0 perpendicolarmente a un campo magnetico esterno uniforme di modulo B>0. Agisce soltanto la forza magnetica; radiazione e altre forze sono trascurate. Ogni preparazione e variazione resta nel regime non relativistico. Si cerca il raggio positivo r, non il verso di curvatura. Il display continuo adimensionale segue D=a_cal r con guadagno positivo. A:v=2 m/s,B=1 T,D=6. B:B=2 T,D=9. Quanto vale v_B in m/s?

Procedimento d’autore: A ha r_A=2 m e fissa a_cal=3 m⁻¹. D_B=9 restituisce r_B=3 m. L’inversa v=|q|Br/m dà v_B=6 m/s. Il dato ricostruito resta non relativistico.

Formule: a_{\rm cal}=3\,\mathrm m^{-1};  r_B=3\,\mathrm m;  v_B=6\,\mathrm{m/s}.

Distrattori e controprove: Diciotto m/s tratterebbe la lettura nove come nove metri. Tre m/s copia il raggio senza il fattore |q|B/m. Due m/s copia il riferimento e predirebbe D=3 con campo doppio.

Hint: Decodifica la lunghezza prima di usare il campo nuovo.

Fonte canonica SHA256 d5f194c8e01fbd22a84e50ffba13e4b7bd153516a97189ba91c6d1ca611a7c1e. Candidato SHA256 be1a742b697ae0b85646984cb946b21e178549663039f5d484bc5113fdb61889. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-circle-radius-15 — Offset e unità della velocità

Una particella ideale ha massa m=1 mg e modulo della carica |q|=1 μC. Entra con rapidità v>0 perpendicolarmente a un campo magnetico esterno uniforme di modulo B>0. Agisce soltanto la forza magnetica; radiazione e altre forze sono trascurate. Ogni preparazione e variazione resta nel regime non relativistico. Si cerca il raggio positivo r, non il verso di curvatura. Il display continuo adimensionale segue D=a_cal r+b_cal. A:v=2 m/s,B=1 T,D=5. B:v=6 m/s,B=2 T,D=7. C:B=1 T,D=3. Quanto vale v_C in m/s?

Procedimento d’autore: I riferimenti hanno r_A=2 m e r_B=3 m: guadagno (7−5)/(3−2)=2 m⁻¹ e offset uno. D_C=3 dà r_C=(3−1)/2=1 m; l’inversa con B_C=1 T restituisce v_C=1 m/s.

Formule: a_{\rm cal}=2\,\mathrm m^{-1};  b_{\rm cal}=1;  r_C=1\,\mathrm m;  v_C=1\,\mathrm{m/s}.

Distrattori e controprove: 3/2 m/s omette l’offset e predirebbe D=4. Due m/s sottrae l’offset senza dividere per il guadagno. Tre m/s copia il display e darebbe D=7.

Hint: L’offset è strumentale, non un raggio residuo.

Fonte canonica SHA256 814c06032c8f15cc03a21de6c178ba805a7e576a23a1a850d38520dd95326f5b. Candidato SHA256 18c0e76602f07ca9735b2ae1da60a6aeb3357ef2c2d9cef702acd5366f24c779. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-circle-radius-16 — Una misura che non seleziona il campo

Una particella ideale ha massa m=1 mg e modulo della carica |q|=1 μC. Entra con rapidità v>0 perpendicolarmente a un campo magnetico esterno uniforme di modulo B>0. Agisce soltanto la forza magnetica; radiazione e altre forze sono trascurate. Ogni preparazione e variazione resta nel regime non relativistico. Si cerca il raggio positivo r, non il verso di curvatura. Fra preparazioni si impone v=[2 (m/s)/T]B. Si misura anche r=2 m. Quante coppie (v,B) sono determinate?

Procedimento d’autore: Il vincolo sostituito in r=mv/(|q|B) dà r=2 m per ogni B positivo compatibile col modello. La misura ripete quindi un dato del vincolo. Esempi B=1 T,v=2 m/s e B=2 T,v=4 m/s; esiste un continuo di altri valori, anche in un intervallo di rapidità molto piccole rispetto a c.

Formule: v=[2\,\mathrm{(m/s)/T}]B;  r=2\,\mathrm m.

Distrattori e controprove: La variabile si cancella: non compare una quadratica da cui scegliere due radici. Fissare B=1 T sarebbe una preparazione possibile, non una conseguenza dei dati; B non è un conteggio intero.

Hint: Controlla se il raggio misurato aggiunge un’equazione indipendente.

Fonte canonica SHA256 795f7a898ff4526bc62ca53b6bd4f5bf04d83fc4ff17242e2323640f8a5c2137. Candidato SHA256 f2219cbf2a9a6f2720bac04eb85f4f81825ce6482d293a52f7584a2b6a43dce2. Skill reale C4-L09. Review distinta e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 dd526dbb16e5cfddcba904112963e4af78b0e5d49f1e9365c631489afd11e856. Package file SHA256 2572a1c51625fa34cb752fa60c3c883fa4d4f2bebc4b0bcf3f6a089163a01b61. Binding file SHA256 4e738085655a0ada1854ae32e687bdaf9df9a99645fbad7884a234b22c9b8ec0. Prova strutturale SHA256 947ed0319cc1c440fb5b600ad317118bcc3987d8ce92ba9ba47476c0230757f6. Manifest asset-only SHA256 16ed9fb25f440cdf303f2f40450f5d17c36cf8e026a4404ac80f23a7a30603f7.

Nessun registry, ledger, runtime, checkpoint o Git ROOT modificato. Il revisore B è distinto e deve leggere i finali contro la propria primaria prima di qualsiasi firma. Prodotto UI NOT_RUN, nessun marker inventato o riusato.

Lettura geometrica dell’autore: nel primo pannello q positiva e campo entrante danno curvatura verso il centro sopra il punto inferiore; v è tangente verso destra. I raggi 80 e 40 coordinate per 2 e 1 m danno scala comune 40 coordinate/m nel secondo pannello. Il grafico ha x=150+80B[T], y=1280−80r[m]; i punti (230,1120), (310,1200), (470,1240) rappresentano (1,2), (2,1), (4,1/2) nelle unità indicate. Nessuna interpolazione lineare e nessun punto fisico a B=0. Queste coordinate intrinseche sono soltanto documentazione tecnica.

Rilettura autore dopo finding indipendente B: la formula vettoriale e le due frasi vicine del solo03 specificano adesso t=0, perché le velocità successive possono divergere. Strictdiff conferma gli altri15 record, tutte le chiavi e l’asset identici. Le nuove due assembly e l’import ripetuto sono reali; il native conservato è relativo agli stessi identici byte SVG, senza nuova UI o nuova approvazione scientifica. Edizione precedente archiviata con manifest in editorial/author-evidence/magnetic-circle-radius-231-initial-force-superseded-20261126/.
