# Authoring DRAFT — capacitor-charge-sharing-223

Letti individualmente tutti gli 80 prompt originali assegnati A220–224 prima di scrivere il primo candidato. Fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U6-04 SHA256 179bf1cacfb83482e32bb41e99cb78296990faafba1fe9ce3b0e3cbc3a6a09cf. Compiti e ID conservati, incluse eccezioni: 22006 polarità opposte e transitorio esaurito; 22106 capacità delle due topologie, senza falsa conservazione di una commutazione. Rilette integralmente le lezioni reali C4-L07 e C4-L08: L07 definisce il singolo condensatore e resta prerequisito; L08 tratta reti, tensioni in serie, carica dei nodi e dissipazione nella condivisione ed è la competenza primaria corretta dei presenti quesiti. Prerequisiti reali C4-L01/L03/L04/L07/L08 e C1-L001. Nessuna nuova lezione inventata.

Prima di candidature U604 entrambi i revisori avevano congelato la propria primaria: B per A220–224 SHA08e1a184ade8bd85a9d6d8f4b919b18105877f0c2007729ba514f0f48f36eb58 (non aperta dall’autore); A per B225–229 SHA1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a, lettura solo allowlist id/prompt senza opzioni o chiavi altrui.

Autore soltanto: DRAFT, revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica. Due processi separati dell’assembler unico producono byte identici. L’import positivo 16→0/16 con 991 pubblicati invariati appartiene alla precedente edizione, preservata in archivio. Per i presenti byte con nuova mappatura, import PENDING_ROOT_REMOTE; non si trasferisce il precedente esito.

Figura realmente prodotta nel browser soltanto come SVG inline a piena altezza, sotto mutex e guardia ≥2 GiB, processo terminale exit0. XML integrale e PNG intero sono stati letti; dimensioni e bounding box esatti nel manifest. Nessuna pagina dell’app aperta, nessun marker di UI prodotto creato o riusato. UI prodotto e layout a 320px NOT_RUN; collaudo canonico riservato all’integratore. I testi visibili usano grandezze fisiche, non metriche dell’implementazione.

## AR-u6-capacitor-charge-sharing-01 — La carica iniziale si distribuisce

Un condensatore lineare C₀=2 μF è carico alla tensione V₀>0. Dopo averlo scollegato dal generatore, lo si unisce in parallelo con polarità concordi a un condensatore lineare C>0 inizialmente scarico. Il sistema non scambia carica con l’esterno; una piccola resistenza positiva dei collegamenti permette al transitorio di esaurirsi. Si cerca la tensione comune finale V_f>0, non un valore durante il transitorio. Le capacità restano finite e costanti. La carica conservata è la somma algebrica sulle armature che formeranno ciascun nodo; l’energia del solo campo non è in generale conservata. Con V₀=6 V e C=2 μF, quanto vale V_f in V?

Procedimento d’autore: Sul futuro nodo positivo la carica iniziale è C₀V₀=12 μC, perché il secondo condensatore è scarico. Alla fine i due hanno la stessa tensione e la capacità totale è C₀+C=4 μF. Conservare quella carica dà V_f=12 μC/(4 μF)=3 V. L’altro nodo porta la carica opposta, non una carica aggiuntiva da sommare al numeratore.

Passaggi: Q_A=C_0V_0;  Q_A=(C_0+C)V_f;  V_f=3\,\mathrm V.

Distrattori: Sei V mantiene la tensione come se il generatore fosse ancora collegato. Dodici copia il numero della carica in μC, non una tensione; 3/2 dimezza ancora e zero confonde la carica netta delle due armature con quella conservata su ciascun nodo.

Hint: Conserva la carica del nodo e usa la capacità totale finale.

Fonte canonica SHA256 bf5776f59c83bcd71d196bf9b35b52f8c221618c456b835149d860b9dc64d941. Candidato SHA256 a258265dfd1fd00645ecad4fa7fa893f6a19495440e586d7fd5a9c3752b0cd17. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-charge-sharing-02 — L’unità del potenziale comune

Un condensatore lineare C₀=2 μF è carico alla tensione V₀>0. Dopo averlo scollegato dal generatore, lo si unisce in parallelo con polarità concordi a un condensatore lineare C>0 inizialmente scarico. Il sistema non scambia carica con l’esterno; una piccola resistenza positiva dei collegamenti permette al transitorio di esaurirsi. Si cerca la tensione comune finale V_f>0, non un valore durante il transitorio. Le capacità restano finite e costanti. La carica conservata è la somma algebrica sulle armature che formeranno ciascun nodo; l’energia del solo campo non è in generale conservata. Quale unità esprime V_f?

Procedimento d’autore: La tensione è carica divisa per capacità: C/F=V. Nel rapporto C₀/(C₀+C), numeratore e denominatore sono capacità e si cancellano; il prodotto con V₀ conserva i volt.

Passaggi: V_f=\frac{Q_A}{C_0+C};  [V_f]=\mathrm{C/F};  [V_f]=\mathrm V.

Distrattori: C è carica, F capacità e J energia. Il numero 1 può descrivere il rapporto delle capacità, ma non la tensione ottenuta moltiplicandolo per V₀.

Hint: Distingui il rapporto puro dal prodotto con una tensione.

Fonte canonica SHA256 a58ee378b1e0e122cc5f1de0f5528f678ee637f68e657454b08feb8af147850a. Candidato SHA256 8be4d2025b6e0e13e5062c567df8e55d68c3e7060291c1a2201570d8c8922634. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-charge-sharing-03 — La legge della condivisione

Un condensatore lineare C₀=2 μF è carico alla tensione V₀>0. Dopo averlo scollegato dal generatore, lo si unisce in parallelo con polarità concordi a un condensatore lineare C>0 inizialmente scarico. Il sistema non scambia carica con l’esterno; una piccola resistenza positiva dei collegamenti permette al transitorio di esaurirsi. Si cerca la tensione comune finale V_f>0, non un valore durante il transitorio. Le capacità restano finite e costanti. La carica conservata è la somma algebrica sulle armature che formeranno ciascun nodo; l’energia del solo campo non è in generale conservata. Quale relazione dà V_f?

Procedimento d’autore: Prima del collegamento soltanto C₀ è carico, quindi la carica del futuro nodo A è C₀V₀. Dopo, Q_A=C₀V_f+CV_f. Uguagliando i due stati e dividendo per C₀+C si ottiene V_f=C₀V₀/(C₀+C). Per C>0 risulta strettamente 0<V_f<V₀.

Passaggi: C_0V_0=(C_0+C)V_f;  V_f=\frac{C_0V_0}{C_0+C}.

Distrattori: V₀ invariata richiederebbe il generatore o C=0, escluso. Invertire la frazione dà una tensione maggiore dell’iniziale; usare C al numeratore assegna carica iniziale al condensatore sbagliato. Il prodotto (C₀+C)V₀ è carica, non tensione.

Hint: Scrivi la carica del nodo prima e dopo il transitorio.

Fonte canonica SHA256 ff4fb6d03067535aac582613f712507320b30e57a9018ee25ff07f22443f0a50. Candidato SHA256 48acbd4d17b1793ecc88dca3ef187c53802e664dd7ae82b48522e01bc414a56f. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-charge-sharing-04 — Una diversa preparazione iniziale

Un condensatore lineare C₀=2 μF è carico alla tensione V₀>0. Dopo averlo scollegato dal generatore, lo si unisce in parallelo con polarità concordi a un condensatore lineare C>0 inizialmente scarico. Il sistema non scambia carica con l’esterno; una piccola resistenza positiva dei collegamenti permette al transitorio di esaurirsi. Si cerca la tensione comune finale V_f>0, non un valore durante il transitorio. Le capacità restano finite e costanti. La carica conservata è la somma algebrica sulle armature che formeranno ciascun nodo; l’energia del solo campo non è in generale conservata. V₀ passa da 6 a 8 V, mentre C resta 2 μF. Come cambia V_f?

Procedimento d’autore: Il rapporto C₀/(C₀+C) resta 1/2. Perciò la tensione finale passa da 6/2=3 V a 8/2=4 V. Le cariche iniziali sono 12 e 16 μC: ciascuna preparazione conserva la propria, non necessariamente la stessa fra preparazioni.

Passaggi: V_{f,A}=3\,\mathrm V;  V_{f,B}=\frac{8}{2}\,\mathrm V;  V_{f,B}=4\,\mathrm V.

Distrattori: Otto V copia V₀,B; tre ignora il cambiamento. 3/2 V applica un ulteriore dimezzamento e sei V copia l’ingresso della prima preparazione. Nessuno conserva la carica iniziale di B con capacità finale 4 μF.

Hint: Mantieni fissa la frazione delle capacità.

Fonte canonica SHA256 7bfd7f23d88599b4dc03f47d076da8a7e0b1a52a70454faac52b58d2ce40cde3. Candidato SHA256 ef5a1e5285383a1748106fb226627edcb5f8e7297e3338c458437b03bee7a86d. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-charge-sharing-05 — Ricostruire la tensione di carica

Un condensatore lineare C₀=2 μF è carico alla tensione V₀>0. Dopo averlo scollegato dal generatore, lo si unisce in parallelo con polarità concordi a un condensatore lineare C>0 inizialmente scarico. Il sistema non scambia carica con l’esterno; una piccola resistenza positiva dei collegamenti permette al transitorio di esaurirsi. Si cerca la tensione comune finale V_f>0, non un valore durante il transitorio. Le capacità restano finite e costanti. La carica conservata è la somma algebrica sulle armature che formeranno ciascun nodo; l’energia del solo campo non è in generale conservata. Si misura V_f=3 V e si conosce C=2 μF. Quanto vale V₀ in V?

Procedimento d’autore: Moltiplicando per la capacità totale: V_f(C₀+C)=C₀V₀. L’inversa è V₀=V_f(C₀+C)/C₀. Qui il rapporto vale due e la tensione iniziale è 6 V. Il controllo 0<3<6 conferma il dominio della condivisione con secondo condensatore positivo.

Passaggi: V_0=V_f\frac{C_0+C}{C_0};  V_0=6\,\mathrm V.

Distrattori: Tre V copia la finale senza compensare la condivisione; 3/2 V inverte la frazione e predirebbe soltanto 3/4 V alla fine. Dodici copia il numero della carica e darebbe V_f=6 V.

Hint: Inverti la frazione delle capacità, non la tensione da sola.

Fonte canonica SHA256 ef93957131f5dc6c4393bccabcbc483a53899babf7e3af69d742ab8cf26cc5e8. Candidato SHA256 79dd9e76423345cfb620422ebbe8cc74b0b15d8325f50f2bc1e7c13d53942268. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-charge-sharing-06 — Ricostruire il condensatore scarico

Un condensatore lineare C₀=2 μF è carico alla tensione V₀>0. Dopo averlo scollegato dal generatore, lo si unisce in parallelo con polarità concordi a un condensatore lineare C>0 inizialmente scarico. Il sistema non scambia carica con l’esterno; una piccola resistenza positiva dei collegamenti permette al transitorio di esaurirsi. Si cerca la tensione comune finale V_f>0, non un valore durante il transitorio. Le capacità restano finite e costanti. La carica conservata è la somma algebrica sulle armature che formeranno ciascun nodo; l’energia del solo campo non è in generale conservata. Si misura V_f=3 V e si conosce V₀=6 V. Quanto vale C in μF?

Procedimento d’autore: Da V_f(C₀+C)=C₀V₀ si sottrae C₀V_f: V_fC=C₀(V₀−V_f). Quindi C=C₀(V₀/V_f−1). Con i dati: 2 μF·(2−1)=2 μF. La positività richiede 0<V_f<V₀; al confine V_f=V₀ si avrebbe C=0.

Passaggi: V_fC=C_0(V_0-V_f);  C=C_0\left(\frac{V_0}{V_f}-1\right);  C=2\,\mu\mathrm F.

Distrattori: Quattro μF omette il termine meno uno e predirebbe V_f=2 V. Un μF darebbe V_f=4 V. Una capacità negativa non appartiene al modello e non può essere scelta per evitare il controllo del dominio.

Hint: Porta il contributo di C₀ dallo stesso lato della tensione iniziale.

Fonte canonica SHA256 598f7ff04bd2b0dabd3b9d7aea77959923dcc72ccb7dabee642298caff40fc52. Candidato SHA256 edb6f2b923a03eb0b92bfed56c286db548ecb225e8b7372db371cf8805189ab3. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-charge-sharing-07 — Meno capacità da caricare

Un condensatore lineare C₀=2 μF è carico alla tensione V₀>0. Dopo averlo scollegato dal generatore, lo si unisce in parallelo con polarità concordi a un condensatore lineare C>0 inizialmente scarico. Il sistema non scambia carica con l’esterno; una piccola resistenza positiva dei collegamenti permette al transitorio di esaurirsi. Si cerca la tensione comune finale V_f>0, non un valore durante il transitorio. Le capacità restano finite e costanti. La carica conservata è la somma algebrica sulle armature che formeranno ciascun nodo; l’energia del solo campo non è in generale conservata. A ha V₀=6 V,C=2 μF. B mantiene V₀ e usa C=1 μF. Quanto vale V_f,B/V_f,A?

Procedimento d’autore: A ha V_f,A=12/4=3 V. B ha V_f,B=12/3=4 V. Il rapporto è 4/3: la stessa carica iniziale viene distribuita su una capacità finale minore. Non si raddoppia l’uscita dimezzando solo C, perché C₀ resta nel denominatore.

Passaggi: V_{f,A}=3\,\mathrm V;  V_{f,B}=4\,\mathrm V;  \frac{V_{f,B}}{V_{f,A}}=\frac43.

Distrattori: 3/4 inverte il confronto, due segue soltanto il reciproco di C, mezzo ne segue il fattore diretto e uno non cambia la tensione. Il nuovo V_f resta comunque minore dei 6 V iniziali.

Hint: La capacità totale è C₀+C, non il solo C.

Fonte canonica SHA256 e3852b3f28a56427c9e23a37fcaf6c55e1884d4b9620f86d6c678dbacb08594c. Candidato SHA256 5cf78f32face21c320a1d90bbec2ae99775799baddc1b03f488a140b977a7306. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-charge-sharing-08 — Scarto della proposta

Un condensatore lineare C₀=2 μF è carico alla tensione V₀>0. Dopo averlo scollegato dal generatore, lo si unisce in parallelo con polarità concordi a un condensatore lineare C>0 inizialmente scarico. Il sistema non scambia carica con l’esterno; una piccola resistenza positiva dei collegamenti permette al transitorio di esaurirsi. Si cerca la tensione comune finale V_f>0, non un valore durante il transitorio. Le capacità restano finite e costanti. La carica conservata è la somma algebrica sulle armature che formeranno ciascun nodo; l’energia del solo campo non è in generale conservata. Con V₀=6 V e C=2 μF si propone V_f=6 V. Quanto vale proposta meno corretto?

Procedimento d’autore: La tensione finale corretta è 3 V. La proposta la supera di 6−3=3 V. Essa tratterebbe il sistema come se fosse ancora mantenuto a 6 V dal generatore, che invece è stato scollegato.

Passaggi: V_f=3\,\mathrm V;  e=(6-3)\,\mathrm V;  e=3\,\mathrm V.

Distrattori: −3 V scambia l’ordine, sei copia la proposta e zero la accetta. Due è il rapporto fra proposta e corretto, adimensionale, non lo scarto richiesto.

Hint: Calcola prima il valore finale dalla conservazione della carica.

Fonte canonica SHA256 03f1107ffe9ba7026614cd42fa68e33370a7dbb08af8f100fdef60beb33f044a. Candidato SHA256 d2eb235b088e9626f89694d2e110a5a1757083fd64d2d7358e1e046160ceebbc. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-charge-sharing-09 — L’inversa generale per V₀

Un condensatore lineare C₀=2 μF è carico alla tensione V₀>0. Dopo averlo scollegato dal generatore, lo si unisce in parallelo con polarità concordi a un condensatore lineare C>0 inizialmente scarico. Il sistema non scambia carica con l’esterno; una piccola resistenza positiva dei collegamenti permette al transitorio di esaurirsi. Si cerca la tensione comune finale V_f>0, non un valore durante il transitorio. Le capacità restano finite e costanti. La carica conservata è la somma algebrica sulle armature che formeranno ciascun nodo; l’energia del solo campo non è in generale conservata. V_f e C sono noti. Quale relazione isola V₀?

Procedimento d’autore: La carica finale del nodo è (C₀+C)V_f e deve coincidere con C₀V₀. Dividendo per il C₀ positivo assegnato si ottiene V₀=V_f(C₀+C)/C₀. Il fattore delle capacità è puro e maggiore di uno, quindi ricostruisce una tensione iniziale maggiore della finale.

Passaggi: C_0V_0=(C_0+C)V_f;  V_0=V_f\frac{C_0+C}{C_0}.

Distrattori: La frazione inversa riduce ancora la tensione; C/C₀ omette l’addendo C₀ della somma. Gli ultimi quozienti hanno F/V o V/F e non tensione. La conservazione riguarda il nodo e non l’energia del solo campo.

Hint: Isola l’ingresso dalla stessa equazione di carica.

Fonte canonica SHA256 5885dcdedf07f0bab1788b83ec7dd2d42887a7d32a85d8e91c45ee5b2e8d9f31. Candidato SHA256 8a548b55f87da7e79293b96b395f46646d8cfba8882123f119f9eabd7b15d4e4. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-charge-sharing-10 — Rapporto tra preparazioni

Un condensatore lineare C₀=2 μF è carico alla tensione V₀>0. Dopo averlo scollegato dal generatore, lo si unisce in parallelo con polarità concordi a un condensatore lineare C>0 inizialmente scarico. Il sistema non scambia carica con l’esterno; una piccola resistenza positiva dei collegamenti permette al transitorio di esaurirsi. Si cerca la tensione comune finale V_f>0, non un valore durante il transitorio. Le capacità restano finite e costanti. La carica conservata è la somma algebrica sulle armature che formeranno ciascun nodo; l’energia del solo campo non è in generale conservata. B usa V₀,B=κ₁V₀ e C_B=κ₂C, con fattori positivi. Definiamo S=C₀+C e S_B=C₀+κ₂C. Quanto vale V_f,B/V_f,A?

Procedimento d’autore: La carica iniziale prende il fattore κ₁ perché C₀ resta fissato. Il denominatore finale diventa S_B, mentre quello iniziale era S. Il rapporto è κ₁S/S_B. Solo C viene scalato nella capacità nuova, non anche C₀.

Passaggi: V_{f,A}=\frac{C_0V_0}{S};  V_{f,B}=\frac{\kappa_1C_0V_0}{S_B};  \frac{V_{f,B}}{V_{f,A}}=\frac{\kappa_1S}{S_B}.

Distrattori: κ₂ al numeratore scala l’ingresso sbagliato. Il prodotto perde il denominatore; S_B/(κ₁S) inverte il confronto. κ₁/κ₂ sarebbe corretto solo se tutto il denominatore fosse scalato da κ₂, mentre C₀ resta invariato.

Hint: Separa la variazione della carica iniziale da quella della capacità finale.

Fonte canonica SHA256 20134b810b8f15544e7bad4b30c97b00edf3fbb24ab1257150f9ed324e669878. Candidato SHA256 eefae89764e951e55bfdfcc162f57afc09f696b76bfad205da7f8e5206295b5a. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-charge-sharing-11 — Cambiano entrambi gli ingressi

Un condensatore lineare C₀=2 μF è carico alla tensione V₀>0. Dopo averlo scollegato dal generatore, lo si unisce in parallelo con polarità concordi a un condensatore lineare C>0 inizialmente scarico. Il sistema non scambia carica con l’esterno; una piccola resistenza positiva dei collegamenti permette al transitorio di esaurirsi. Si cerca la tensione comune finale V_f>0, non un valore durante il transitorio. Le capacità restano finite e costanti. La carica conservata è la somma algebrica sulle armature che formeranno ciascun nodo; l’energia del solo campo non è in generale conservata. A ha V₀=6 V,C=2 μF. B ha V₀=12 V,C=4 μF. Quanto vale V_f,B/V_f,A?

Procedimento d’autore: A termina a 3 V. B parte con 24 μC sul nodo e ha capacità finale 6 μF, quindi termina a 4 V. Il rapporto è 4/3. Raddoppiare V₀ e C non lascia il rapporto invariato, perché C₀ non raddoppia.

Passaggi: V_{f,A}=3\,\mathrm V;  V_{f,B}=4\,\mathrm V;  \frac{V_{f,B}}{V_{f,A}}=\frac43.

Distrattori: 3/4 inverte il rapporto; due segue soltanto V₀ e mezzo soltanto C in modo inverso. Uno presume una compensazione esatta e ignora il termine C₀ fisso nel denominatore.

Hint: Valuta il totale finale della prova B.

Fonte canonica SHA256 c375fdd12ef3982340e20c29fc415c0b887bb75a4f6eade834ce88ab804f3530. Candidato SHA256 d625ca8a6476ca799f3a1e622124e91f6ed0d6b7d80a2b6d4d106724d93ba7df. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-charge-sharing-12 — Media delle tensioni finali

Un condensatore lineare C₀=2 μF è carico alla tensione V₀>0. Dopo averlo scollegato dal generatore, lo si unisce in parallelo con polarità concordi a un condensatore lineare C>0 inizialmente scarico. Il sistema non scambia carica con l’esterno; una piccola resistenza positiva dei collegamenti permette al transitorio di esaurirsi. Si cerca la tensione comune finale V_f>0, non un valore durante il transitorio. Le capacità restano finite e costanti. La carica conservata è la somma algebrica sulle armature che formeranno ciascun nodo; l’energia del solo campo non è in generale conservata. A usa V₀=6 V,C=2 μF; B usa V₀=12 V,C=4 μF. Qual è la media aritmetica delle due V_f con uguale peso?

Procedimento d’autore: Le uscite sono 3 e 4 V: la loro media è 7/2 V. Ai dati medi V₀=9 V e C=3 μF, il modello darebbe 2·9/5 V=18/5 V. Con denominatore comune dieci sono 35/10 e 36/10 V, diversi di 1/10 V. Non si deve mediare prima il denominatore della legge.

Passaggi: \overline{V_f}=\frac72\,\mathrm V;  V_{f,\rm dati\ medi}=\frac{18}{5}\,\mathrm V;  \frac{18}{5}-\frac72=\frac1{10}.

Distrattori: 18/5 V usa gli ingressi medi. Sette V somma, mezzo è metà della differenza e quattro ripete solo B. La media è statistica di stati finali, non il valore durante un transitorio.

Hint: Calcola separatamente le due uscite prima della media.

Fonte canonica SHA256 575d1217a7aa2516aceed6b69e15d9c4d3b3987962147c7bdbdea2b1deacbe5b. Candidato SHA256 b0486d9bb4e3590aad83bc4938ced31b8fd044d21946db2042bc8b966de9135e. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-charge-sharing-13 — La capacità per il bersaglio

Un condensatore lineare C₀=2 μF è carico alla tensione V₀>0. Dopo averlo scollegato dal generatore, lo si unisce in parallelo con polarità concordi a un condensatore lineare C>0 inizialmente scarico. Il sistema non scambia carica con l’esterno; una piccola resistenza positiva dei collegamenti permette al transitorio di esaurirsi. Si cerca la tensione comune finale V_f>0, non un valore durante il transitorio. Le capacità restano finite e costanti. La carica conservata è la somma algebrica sulle armature che formeranno ciascun nodo; l’energia del solo campo non è in generale conservata. A ha V₀=6 V,C=2 μF. B parte da V₀=12 V e deve ottenere V_f,B=(4/3)V_f,A. Quanto vale C_B/C_A?

Procedimento d’autore: Il bersaglio è V_f,B=4 V. L’inversa geometrica della condivisione dà C_B=C₀(V₀,B/V_f,B−1)=2·(3−1) μF=4 μF. Il rapporto con C_A=2 μF è due e il controllo 0<4<12 conferma il dominio.

Passaggi: V_{f,B}=4\,\mathrm V;  C_B=4\,\mu\mathrm F;  C_B/C_A=2.

Distrattori: Mezzo inverte il confronto. 4/3 copia il rapporto delle tensioni finali; 3/4 il suo reciproco. Quattro copia il valore numerico di C_B in μF senza dividerlo per il C_A da 2 μF.

Hint: Trova prima la tensione finale bersaglio e poi C_B.

Fonte canonica SHA256 8ee8d181fbd6d7258189f5cd74c4236f8fa4f756c74b733738f8fe0811668282. Candidato SHA256 fe14901a816e677370f7eb4bc60308c038e77fcf5f1329e13b2d3b4cefda0f90. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-charge-sharing-14 — Un display senza offset

Un condensatore lineare C₀=2 μF è carico alla tensione V₀>0. Dopo averlo scollegato dal generatore, lo si unisce in parallelo con polarità concordi a un condensatore lineare C>0 inizialmente scarico. Il sistema non scambia carica con l’esterno; una piccola resistenza positiva dei collegamenti permette al transitorio di esaurirsi. Si cerca la tensione comune finale V_f>0, non un valore durante il transitorio. Le capacità restano finite e costanti. La carica conservata è la somma algebrica sulle armature che formeranno ciascun nodo; l’energia del solo campo non è in generale conservata. D=a_cal V_f è continuo e adimensionale, a_cal>0. A con V₀=6 V,C=2 μF dà D=9. B legge D=12 e ha C=4 μF. Quanto vale V₀,B in V?

Procedimento d’autore: Il riferimento ha V_f,A=3 V, quindi a_cal=3 V⁻¹. Lettura 12 indica V_f,B=4 V. Il rapporto (C₀+C)/C₀ vale 6/2=3, dunque V₀,B=4·3=12 V. La lettura coincide numericamente con il risultato solo per questi dati: non è una regola di unità.

Passaggi: a_{\rm cal}=3\,\mathrm V^{-1};  V_{f,B}=4\,\mathrm V;  V_{0,B}=12\,\mathrm V.

Distrattori: Quattro V copia l’uscita finale e darebbe un’altra lettura. Trentasei V usa D=12 come tensione finale e ricostruirebbe D=36. Otto V darebbe V_f=8/3 V e D=8.

Hint: Rimuovi la taratura prima di ricostruire la tensione iniziale.

Fonte canonica SHA256 d6664154583baa48310d9e512284dac53377d4898695d221439f240660587ebf. Candidato SHA256 98d89ca7d02f1d466b167195edd790e74738551e3bc4f4237d2b5bf079b37393. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-charge-sharing-15 — Offset nella misura finale

Un condensatore lineare C₀=2 μF è carico alla tensione V₀>0. Dopo averlo scollegato dal generatore, lo si unisce in parallelo con polarità concordi a un condensatore lineare C>0 inizialmente scarico. Il sistema non scambia carica con l’esterno; una piccola resistenza positiva dei collegamenti permette al transitorio di esaurirsi. Si cerca la tensione comune finale V_f>0, non un valore durante il transitorio. Le capacità restano finite e costanti. La carica conservata è la somma algebrica sulle armature che formeranno ciascun nodo; l’energia del solo campo non è in generale conservata. D=a_cal V_f+b è continuo. A: V₀=6 V,C=2 μF,D=7. B: V₀=12 V,C=4 μF,D=9. C: capacità scarica 3 μF,D=13. Quanto vale V₀,C?

Procedimento d’autore: I riferimenti terminano a 3 e 4 V. Guadagno a_cal=(9−7)/(4−3)=2 V⁻¹ e offset b=1. La lettura 13 dà V_f,C=6 V. Con capacità totale 5 μF, l’inversa porta V₀,C=6·5/2 V=15 V. Si conserva V_f,C<V₀,C.

Passaggi: a_{\rm cal}=2\,\mathrm V^{-1};  b=1;  V_{f,C}=6\,\mathrm V;  V_{0,C}=15\,\mathrm V.

Distrattori: 65/4 V omette l’offset e usa V_f=13/2 V: ricostruisce D=14, non 13. Sei V copia l’uscita finale; trenta V omette il guadagno dopo la sottrazione; tredici V copia la lettura strumentale. Tutti possono essere confutati reinserendoli nella legge.

Hint: Decodifica V_f e moltiplicala per la frazione inversa delle capacità.

Fonte canonica SHA256 0284e49ed1f66748e926d1b37efe3341612f85e15961f936b8b99381e3177f5d. Candidato SHA256 d5c42c6829f634237d7268d6c304150127cd6b26052571a8620be597a921e385. Revisione indipendente e human NOT_RUN.

## AR-u6-capacitor-charge-sharing-16 — Il vincolo non è ridondante

Un condensatore lineare C₀=2 μF è carico alla tensione V₀>0. Dopo averlo scollegato dal generatore, lo si unisce in parallelo con polarità concordi a un condensatore lineare C>0 inizialmente scarico. Il sistema non scambia carica con l’esterno; una piccola resistenza positiva dei collegamenti permette al transitorio di esaurirsi. Si cerca la tensione comune finale V_f>0, non un valore durante il transitorio. Le capacità restano finite e costanti. La carica conservata è la somma algebrica sulle armature che formeranno ciascun nodo; l’energia del solo campo non è in generale conservata. Fra preparazioni vale V₀=(3 V/μF)C. Si misura V_f=3 V. Quanto vale C?

Procedimento d’autore: Pongo c=C/(1 μF), numero positivo: il vincolo dà V₀=3c V. La legge diventa V_f/(1 V)=6c/(2+c). Uguagliando a tre e moltiplicando per 2+c>0 si ottiene 6c=6+3c, quindi c=2. La misura fissa C=2 μF e V₀=6 V; non si cancella tutta la dipendenza da C.

Passaggi: 3(2+c)=6c;  3c=6;  C=2\,\mu\mathrm F.

Distrattori: Un μF darebbe V_f=2 V e tre μF darebbe 18/5 V. −2 μF viola la positività e annulla il denominatore della forma normalizzata. Infinite soluzioni confonde questo vincolo con uno che renderebbe l’uscita costante.

Hint: Conserva l’addendo fisso C₀ nel denominatore dopo la sostituzione.

Fonte canonica SHA256 3f65058021538f22c9d7ea37cdc9ac85026ba394379463acaa344cb83237cf0a. Candidato SHA256 a64b5aa52b26c5b0be3245d9b20ea374269a59021042d9fcb51056990753ea67. Revisione indipendente e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 a61bb0f46b9b9d94297e4baa23111d7afe5f38c95c25191ad80902ba00246dee. Package file SHA256 4d6eda109e86973af45b0e4679b262721bff951949f9e7e8560c3230d0ca77df. Binding file SHA256 f64bd850b6106d5001ff9f1aa0ba6d156706366460948aba7c242b8786136527. Prova strutturale SHA256 531b67387aeb4a5a81f7f44ab2cc998dd8f68c6eabc2feb519bd756323677f54. Manifest asset-only SHA256 9bb4255c10dd89f84adae16b377fa0b56f6f59a8a4cbe52b131dd9d5228e25b7.

Nessun runtime, registry, ledger, checkpoint, candidato o Git ROOT modificato. Revisore distinto B assegnato; le sue derivazioni non sono state aperte dall’autore.

## Lettura geometrica d’autore

XML e PNG completo640×1580 realmente letti. Primo pannello: il futuro nodo A ha12 μC sul condensatore C₀ e0 su C; barra360 da origine150, scala30 coordinate/μC, il valore zero è un punto e non una barra positiva. Secondo: finale in parallelo con3 V comuni e6 μC per armatura su A; totale12 μC. Le cariche opposte dell’altro nodo non si sommano al numeratore. Ultime barre240/320/280 per3/4/7/2 V, origine150 e scala80 coordinate/V comune e distinta da quella delle cariche. Zeri118 liberi, nessuna etichetta sulle piastre.

## Correzione di mappatura didattica dopo review distinta

La lezione originale C4-L08 «Mettere insieme i condensatori», riletta nel pin Cric5d1d, è il riferimento primario per questa famiglia. Aggiornati soltanto skill, error.target e aggiunta della competenza esistente L08 ai prerequisiti, conservando L07. Ogni altro campo dei sedici record, tutte le formule e le scelte e ogni byte SVG sono identici per confronto strutturale. Due nuove assembly effettive exit0 e identiche; nessun nuovo render necessario per asset immutato. I precedenti import/report SCI sono conservati nell’archivio con checksum e restano storici sulle vecchie firme. Import finale PENDING_ROOT_REMOTE; nessun nuovo DB locale, come autorizzato dall’integratore. Revisione scientifica distinta delle nuove associazioni e human NOT_RUN, DRAFT e publicationAction NONE.
