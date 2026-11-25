# Authoring DRAFT — point-electric-field-191

Letti individualmente tutti gli 80 prompt A190–194 della fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U6-01 SHA256 a981cd7c03f402ee7b2f66e1de79e9f2cea686ffe3178cd19bcb8d17b66c122a. I compiti e gli ID originali sono conservati e si rendono espliciti segni, domini, conversioni e svolgimenti. Riletti i testi reali C4-L01/L02/L03 per Coulomb, campo vettoriale e potenziale scalare. Prima dei candidati A, il revisore distinto B ha confermato primaria prompt-only 80 SHA256 12031f00b348d12feff99b677c4031308ed67876612eec5d77fb98df866b037a; quella primaria non è stata aperta dall’autore. La primaria A dei futuri 80 B195–199 è congelata separatamente SHA256 3531bf38e7970d52ba36b9193b48827d0a59b7f8d5c364705e0ff60809e268e9, senza esposizione U6 a chiavi altrui.

Autore soltanto: DRAFT; revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica.

Due assemblaggi in processi separati dell’assembler unico producono gli stessi byte package e binding. Importatore canonico ROOT su SQLite temporaneo: 16 nuovi, poi 0 nuovi e 16 invariati; tutti i 991 pubblicati e le versioni storiche rimangono invariati. Questo è collaudo tecnico strutturale e non giudizio scientifico.

UI prodotto NOT_RUN: per mandato dell’integratore non si avvia il browser dell’app durante il collaudo globale congelato. Non è stato creato o riusato alcun marker UI. Il diagramma SVG è stato letto come XML e sono state controllate le proporzioni intrinseche dei dati. La resa nativa Quick Look a piena altezza è stata realmente prodotta e letta, con log e PNG conservati: è asset-only, non un replay dell’app o una prova di layout a 320 px. Nessun CSS, runtime, registro, checkpoint o file candidato ROOT modificato.

## AR-u6-point-electric-field-01 — Un campo a tre metri dalla sorgente

Una carica sorgente puntiforme Q>0, fissa nel vuoto, genera un campo elettrostatico. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. A distanza r>0 dalla sorgente, E indica il modulo del campo, diretto radialmente verso l’esterno. Non è assegnata una carica di prova su cui calcolare una forza. Poniamo u=Q/(1 nC), ρ=r/(1 m) ed e=E/(1 N/C), tutti puri: dalla legge fisica E=k_eQ/r² segue e=9u/ρ². Con Q=1 nC e r=3 m, quanto vale E in N/C?

Procedimento d’autore: Un nanocoulomb vale 10⁻⁹ C. Il prodotto k_eQ è quindi 9 N·m²/C; dividendo per (3 m)²=9 m² si ottiene 1 N/C. Il campo appartiene alla sorgente e al punto: il valore non richiede di scegliere la carica di prova. Una prova positiva sentirebbe una forza uscente, una negativa nel verso opposto.

Passaggi: Q=10^{-9}\,\mathrm C;  k_eQ=9\,\mathrm{N\,m^2/C};  E=\frac9{3^2}\,\mathrm{N/C};  E=1\,\mathrm{N/C}.

Distrattori: Nove N/C omette la distanza al quadrato; tre N/C divide solo per r. Scrivere un newton confonde campo e forza: servirebbe una carica di prova. La sorgente positiva fissa il verso radiale uscente, mentre E è il modulo positivo.

Hint: Converti il nanocoulomb e conserva il quadrato della distanza.

Fonte canonica SHA256 2790e4edc0846c63db979b084eef62b846c558a479437c79d007d393c669854d. Candidato SHA256 49eef2f28b11ae6f6d9e5e137b4fa2d44d22666e0b1c9e3e80ce1418eedf3228. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-field-02 — Forza per unità di carica

Un campo elettrico è definito dal rapporto fra la forza su una piccola prova positiva e la sua carica. Quale unità misura il campo?

Procedimento d’autore: Il campo E è forza per unità di carica di prova. Il rapporto N/C è quindi coerente. Quando si introduce una carica q, la forza sarà qE e avrà unità C·N/C=N. Non si deve attribuire al campo l’unità della forza che esso può produrre.

Passaggi: \vec E=\frac{\vec F_{\rm prova}}{q_{\rm prova}};  [E]=\mathrm{N/C};  \vec F=q\vec E.

Distrattori: N è forza, C carica, J energia e m lunghezza. Nessuna di queste da sola è forza per carica. V/m sarebbe un’altra unità equivalente, ma non compare fra le alternative.

Hint: Dividi le unità della forza per quelle della carica.

Fonte canonica SHA256 14a27383dbf5eebe8ff9a1f4f702134bb812f70ebd694462d6592dd91fa45605. Candidato SHA256 a3f4fa92551eeaa1362e1781049ab7ca9982507688dcbfe1d760cfba894cb808. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-field-03 — La tangente alla linea è una direzione

Si considerano linee di un campo elettrostatico. In un punto in cui il campo è diverso da zero, quale affermazione è corretta?

Procedimento d’autore: La linea di campo è una costruzione geometrica: in ogni suo punto la tangente indica la direzione del vettore E. Dove E≠0, il vettore ha una sola direzione; due linee distinte non possono incrociarsi dandone due. Il verso convenzionale è quello della forza su una prova positiva. Una traiettoria dipende invece anche da massa, segno della carica e velocità iniziale.

Passaggi: \vec F=q\vec E;  q>0:\ \vec F\ \text{ha il verso di}\ \vec E.

Distrattori: Una carica può entrare con velocità non parallela alla linea, quindi non la segue necessariamente. L’incrocio in un punto di campo non nullo perderebbe l’unicità locale. In elettrostatica le linee escono dalle sorgenti positive ed entrano nelle negative; la loro lunghezza arbitraria sul foglio non misura E.

Hint: Distingui una rappresentazione del campo da un percorso meccanico della particella.

Fonte canonica SHA256 dc37d01175f86b63982e84ddb1bb8c6e03ca763494510247b6b8a37ee13f91a2. Candidato SHA256 d3a1c35b498bfdb141b189423d955649f41a39fdbf5e8f497d4733d4da31ee50. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-field-04 — Nove volte la carica sorgente

Una carica sorgente puntiforme Q>0, fissa nel vuoto, genera un campo elettrostatico. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. A distanza r>0 dalla sorgente, E indica il modulo del campo, diretto radialmente verso l’esterno. Non è assegnata una carica di prova su cui calcolare una forza. Poniamo u=Q/(1 nC), ρ=r/(1 m) ed e=E/(1 N/C), tutti puri: dalla legge fisica E=k_eQ/r² segue e=9u/ρ². A ha Q=1 nC, C ha Q=9 nC; entrambe hanno r=3 m. Come cambia E?

Procedimento d’autore: La distanza resta tre metri e il denominatore resta nove. Il numeratore è nove volte maggiore, perciò il campo passa da 1 a 9 N/C. La linearità riguarda Q; non si prende una radice della carica e non si eleva al quadrato la sorgente.

Passaggi: E_A=1\,\mathrm{N/C};  e_C=\frac{9\cdot9}{9};  E_C=9\,\mathrm{N/C}.

Distrattori: 1/9 N/C rende inversa la carica. Tre N/C usa una radice non richiesta, 81 N/C ne usa il quadrato. Uno N/C ignora la nuova sorgente; il verso uscente non si modifica.

Hint: Con r fissato, il solo fattore di Q moltiplica il campo.

Fonte canonica SHA256 7336ceb8be48b1618ecb9ba69c6f397303939c3a857939de7bf4b9e9ce158afe. Candidato SHA256 d08cbc9994f68c67587e7cfb5e6745f64293cec85abd661bbb796e5cf503651d. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-field-05 — Risolvere per la carica sorgente

Una carica sorgente puntiforme Q>0, fissa nel vuoto, genera un campo elettrostatico. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. A distanza r>0 dalla sorgente, E indica il modulo del campo, diretto radialmente verso l’esterno. Non è assegnata una carica di prova su cui calcolare una forza. Poniamo u=Q/(1 nC), ρ=r/(1 m) ed e=E/(1 N/C), tutti puri: dalla legge fisica E=k_eQ/r² segue e=9u/ρ². Si misura E=1 N/C a r=3 m. Quanto vale Q in nC?

Procedimento d’autore: Dall’equazione e=9u/ρ² ricaviamo u=eρ²/9. I dati danno 1·9/9=1. Il risultato Q=1 nC descrive la sorgente, non una prova arbitraria; reinserendolo si ritrova il campo misurato.

Passaggi: u=\frac{e\rho^2}{9};  u=1;  Q=1\,\mathrm{nC}.

Distrattori: Un terzo nC perderebbe un fattore distanza e darebbe 1/3 N/C; tre nC darebbero 3 N/C. Usare coulomb al posto di nanocoulomb senza conversione cambierebbe il risultato di 10⁹.

Hint: Moltiplica il campo per r² prima di dividere per la costante della legge.

Fonte canonica SHA256 eb2e282a39228081a120739d8a50f8f78af593dc6d4729fe366b81847bdd9389. Candidato SHA256 c37a7b72dd55b4b8dd6fbce55cfca53b1ccce7dd0351e9137bea15a5d0bad8fa. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-field-06 — La separazione dal campo misurato

Una carica sorgente puntiforme Q>0, fissa nel vuoto, genera un campo elettrostatico. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. A distanza r>0 dalla sorgente, E indica il modulo del campo, diretto radialmente verso l’esterno. Non è assegnata una carica di prova su cui calcolare una forza. Poniamo u=Q/(1 nC), ρ=r/(1 m) ed e=E/(1 N/C), tutti puri: dalla legge fisica E=k_eQ/r² segue e=9u/ρ². Si misura E=1 N/C con Q=1 nC. Quanto vale r in m?

Procedimento d’autore: Si isola ρ²=9u/e=9. La distanza positiva corrisponde a ρ=3, quindi r=3 m. Il segno del versore radiale non si ricava accettando una distanza negativa: il verso è già specificato dalla geometria e dal segno della sorgente.

Passaggi: \rho^2=\frac{9u}{e};  \rho^2=9;  \rho=3;  r=3\,\mathrm m.

Distrattori: Nove metri omette la radice e produrrebbe 1/9 N/C. −3 m non è una distanza; un terzo metro produrrebbe 81 N/C. Il ramo r>0 sceglie una sola soluzione.

Hint: Ricava r² e poi prendi la radice positiva.

Fonte canonica SHA256 53efe760d0a36a87ad1ab434e439441a7052e17d99525a2c0a563a4556a0fab6. Candidato SHA256 ad364d6948775e3be2400c7b1a9c8af4cb7fa40693093f7127733502062f50ed. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-field-07 — Avvicinarsi da tre metri a uno

Una carica sorgente puntiforme Q>0, fissa nel vuoto, genera un campo elettrostatico. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. A distanza r>0 dalla sorgente, E indica il modulo del campo, diretto radialmente verso l’esterno. Non è assegnata una carica di prova su cui calcolare una forza. Poniamo u=Q/(1 nC), ρ=r/(1 m) ed e=E/(1 N/C), tutti puri: dalla legge fisica E=k_eQ/r² segue e=9u/ρ². Q resta 1 nC. A ha r_A=3 m e C ha r_C=1 m. Quanto vale E_C/E_A?

Procedimento d’autore: Il numeratore non cambia. La distanza si riduce a un terzo, così il campo si moltiplica per 3²=9. A dà 1 N/C; C dà 9 N/C. È l’effetto del quadrato della distanza, non un cambiamento della sorgente.

Passaggi: \frac{E_C}{E_A}=\left(\frac{r_A}{r_C}\right)^2;  \frac{E_C}{E_A}=9.

Distrattori: Tre perde il quadrato; 1/3 e 1/9 rendono il campo minore avvicinandosi. Uno ignora lo spostamento del punto di osservazione.

Hint: Scrivi il rapporto inverso delle distanze prima del quadrato.

Fonte canonica SHA256 1503865f833864801ea2cefc1dbe9f8a12ad276fbd674b90c5b25d5ca55089bc. Candidato SHA256 3b616fe98658bb8951140026409a44bb350027b07acb8e6045f83ccc6e82f602. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-field-08 — Quanto supera il campo corretto?

Una carica sorgente puntiforme Q>0, fissa nel vuoto, genera un campo elettrostatico. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. A distanza r>0 dalla sorgente, E indica il modulo del campo, diretto radialmente verso l’esterno. Non è assegnata una carica di prova su cui calcolare una forza. Poniamo u=Q/(1 nC), ρ=r/(1 m) ed e=E/(1 N/C), tutti puri: dalla legge fisica E=k_eQ/r² segue e=9u/ρ². Con Q=1 nC e r=3 m, si propone E=2 N/C. Quanto vale proposta meno risultato corretto?

Procedimento d’autore: La legge restituisce 1 N/C. Il valore proposto lo supera di 2−1=+1 N/C. Il rapporto proposta/corretta è due ma non ha unità; non sostituisce lo scarto tra campi richiesto.

Passaggi: E=1\,\mathrm{N/C};  e_{\rm scarto}=(2-1)\,\mathrm{N/C};  e_{\rm scarto}=1\,\mathrm{N/C}.

Distrattori: −1 N/C scambia l’ordine, due N/C copia la proposta e zero la accetta. Il numero puro due indica il fattore di sovrastima, non la differenza.

Hint: Ricalcola il modulo del campo prima della sottrazione.

Fonte canonica SHA256 bfb0bbf715980e6a25c10c58138cb18c0f160c5de898c98d4c39812faef16abd. Candidato SHA256 a1df412a3a0ef6ee89e980ee828beb9ad287e3f1a8d7f4875249bd481d08b5b7. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-field-09 — L’inversa fisica per Q

Una carica sorgente puntiforme Q>0, fissa nel vuoto, genera un campo elettrostatico. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. A distanza r>0 dalla sorgente, E indica il modulo del campo, diretto radialmente verso l’esterno. Non è assegnata una carica di prova su cui calcolare una forza. Poniamo u=Q/(1 nC), ρ=r/(1 m) ed e=E/(1 N/C), tutti puri: dalla legge fisica E=k_eQ/r² segue e=9u/ρ². Quale formula fisica ricava Q da E e r?

Procedimento d’autore: Moltiplicare E=k_eQ/r² per r² elimina il denominatore; dividere per k_e isola Q. In SI Er²/k_e ha unità (N/C)·m² diviso N·m²/C², cioè C. Per ottenere nC si converte infine la carica oppure si usa la relazione normalizzata u=eρ²/9.

Passaggi: Er^2=k_eQ;  Q=\frac{Er^2}{k_e};  [Q]=\mathrm C.

Distrattori: Perdere un r o tenerne il quadrato al denominatore non annulla la divisione originaria. Il reciproco ha unità C⁻¹; il fattore due dimezzerebbe arbitrariamente la sorgente. Ogni risultato va reinserito nella relazione del campo.

Hint: Cancella r² dal denominatore e poi k_e dal numeratore.

Fonte canonica SHA256 8d198458f4b9842a854ddbfa2fd4d3b3caa101fe43f1008ca835a24eb0311a78. Candidato SHA256 0309fbb82126b9a093500dabc4dc1a9aa7bc040a1e46bfb4de186b5c329d4393. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-field-10 — Fattori su sorgente e distanza

Una carica sorgente puntiforme Q>0, fissa nel vuoto, genera un campo elettrostatico. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. A distanza r>0 dalla sorgente, E indica il modulo del campo, diretto radialmente verso l’esterno. Non è assegnata una carica di prova su cui calcolare una forza. Poniamo u=Q/(1 nC), ρ=r/(1 m) ed e=E/(1 N/C), tutti puri: dalla legge fisica E=k_eQ/r² segue e=9u/ρ². C ha Q_C=κ₁Q_A e r_C=κ₂r_A, con κ₁,κ₂>0. Quale legge generale dà E_C/E_A?

Procedimento d’autore: Il campo è lineare nella sorgente e inversamente proporzionale al quadrato della distanza. Nella nuova configurazione il fattore è κ₁/κ₂²: il quadrato appartiene a κ₂, non a κ₁. I parametri restano assegnati nella singola configurazione.

Passaggi: E_C=\frac{k_e\kappa_1Q_A}{\kappa_2^2r_A^2};  \frac{E_C}{E_A}=\frac{\kappa_1}{\kappa_2^2}.

Distrattori: κ₁/κ₂ usa distanza alla prima potenza. Il prodotto rende diretta la dipendenza dalla distanza; il reciproco inverte C/A. κ₁² attribuisce alla sorgente un quadrato che la legge non contiene.

Hint: Sostituisci i fattori nella legge fisica prima di dividere le due configurazioni.

Fonte canonica SHA256 65f947b59d7e512555d1ca1f859ec668d4e4eac117737e265a6e9f0d50cd748f. Candidato SHA256 71916dabaf64289b84a750ceb6e659cb15972200c03d0177fa8fe75a0e75e16c. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-field-11 — Quattro nanocoulomb a due metri

Una carica sorgente puntiforme Q>0, fissa nel vuoto, genera un campo elettrostatico. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. A distanza r>0 dalla sorgente, E indica il modulo del campo, diretto radialmente verso l’esterno. Non è assegnata una carica di prova su cui calcolare una forza. Poniamo u=Q/(1 nC), ρ=r/(1 m) ed e=E/(1 N/C), tutti puri: dalla legge fisica E=k_eQ/r² segue e=9u/ρ². A ha Q=1 nC, r=3 m. C ha Q=4 nC, r=2 m. Quanto vale E_C/E_A?

Procedimento d’autore: A dà 1 N/C. Per C il numeratore normalizzato è 9·4=36 e il denominatore 2²=4: E_C=9 N/C. Il rapporto è quindi nove. I due fattori sono quattro dalla sorgente e (3/2)²=9/4 dalla geometria.

Passaggi: E_A=1\,\mathrm{N/C};  E_C=\frac{36}{4}\,\mathrm{N/C};  E_C=9\,\mathrm{N/C};  E_C/E_A=9.

Distrattori: Quattro segue soltanto Q. 9/4 segue soltanto la distanza; sei usa il rapporto delle distanze senza quadrato e 1/9 è il reciproco. Il campo non è una forza in newton.

Hint: Controlla entrambi gli ingressi e mantieni r al quadrato.

Fonte canonica SHA256 c67b712c698ccfa227acaa3c300bb610d711e993526ea73d1174a70629bde003. Candidato SHA256 a41638a0cfa3353c4c17f91ba8157ccc1cf5f6d772c9691891d5918c5866f895. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-field-12 — La media di due campi

Una carica sorgente puntiforme Q>0, fissa nel vuoto, genera un campo elettrostatico. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. A distanza r>0 dalla sorgente, E indica il modulo del campo, diretto radialmente verso l’esterno. Non è assegnata una carica di prova su cui calcolare una forza. Poniamo u=Q/(1 nC), ρ=r/(1 m) ed e=E/(1 N/C), tutti puri: dalla legge fisica E=k_eQ/r² segue e=9u/ρ². A usa Q=1 nC e r=3 m; C usa Q=4 nC e r=2 m. Qual è la media aritmetica dei due E con uguale peso?

Procedimento d’autore: Le letture sono 1 e 9 N/C: la media vale (1+9)/2=5 N/C. Ai parametri medi Q=5/2 nC e r=5/2 m, il campo sarebbe 9·(5/2)/(25/4)=18/5 N/C. Il valore del modello alle medie non coincide con la media delle uscite.

Passaggi: \overline E=\frac{1+9}{2}\,\mathrm{N/C};  \overline E=5\,\mathrm{N/C};  E_{\rm dati\ medi}=\frac{18}{5}\,\mathrm{N/C}.

Distrattori: 18/5 N/C usa gli ingressi medi. Dieci N/C non dimezza la somma; quattro N/C è metà della differenza; uno N/C ripete A. Le due prove non sono due sorgenti da sovrapporre nello stesso istante.

Hint: Calcola i due campi separati, poi media le letture.

Fonte canonica SHA256 aa7019b4c88d4e7990e14440bfbc363f051139ee9b964fb0a8462b49e0824432. Candidato SHA256 acfa39b534edf745262ba0e1de63694f11707e1bdd2ff72897e624634bb25d32. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-field-13 — La separazione necessaria al bersaglio

Una carica sorgente puntiforme Q>0, fissa nel vuoto, genera un campo elettrostatico. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. A distanza r>0 dalla sorgente, E indica il modulo del campo, diretto radialmente verso l’esterno. Non è assegnata una carica di prova su cui calcolare una forza. Poniamo u=Q/(1 nC), ρ=r/(1 m) ed e=E/(1 N/C), tutti puri: dalla legge fisica E=k_eQ/r² segue e=9u/ρ². A ha Q=1 nC, r_A=3 m. C ha Q=4 nC e deve avere E_C=9E_A. Quanto vale r_C/r_A?

Procedimento d’autore: Il bersaglio è 9 N/C. Con Q_C=4 nC si ricava ρ_C²=9·4/9=4; il ramo positivo dà r_C=2 m. Il rapporto con r_A=3 m è 2/3, non il rapporto dei quadrati.

Passaggi: E_C=9\,\mathrm{N/C};  \rho_C^2=4;  r_C=2\,\mathrm m;  r_C/r_A=\frac23.

Distrattori: 3/2 capovolge il rapporto, 4/9 confronta i quadrati delle distanze. Quattro e nove copiano rispettivamente i fattori di sorgente e campo e non soddisfano l’inversa geometrica.

Hint: Risolvi prima per r_C, poi dividilo per r_A.

Fonte canonica SHA256 be169957acbaec4cf93b80f17242b6949f2da36a523eb770b845764ca8b626ca. Candidato SHA256 a98531baad92e7be6077bb91bc028cba1edabf119b29f8ee0aaef97604b17e49. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-field-14 — La taratura del sensore di campo

Una carica sorgente puntiforme Q>0, fissa nel vuoto, genera un campo elettrostatico. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. A distanza r>0 dalla sorgente, E indica il modulo del campo, diretto radialmente verso l’esterno. Non è assegnata una carica di prova su cui calcolare una forza. Poniamo u=Q/(1 nC), ρ=r/(1 m) ed e=E/(1 N/C), tutti puri: dalla legge fisica E=k_eQ/r² segue e=9u/ρ². D=aE è un display continuo adimensionale, a>0. A con Q=1 nC, r=3 m dà D=3. C ha r=2 m e D=27. Quanto vale Q_C in nC?

Procedimento d’autore: Il campo di riferimento è 1 N/C, quindi a=3 C/N. D=27 significa E_C=9 N/C. Con r_C=2 m l’inversa normalizzata dà u_C=9·4/9=4 e dunque Q_C=4 nC. Il campo misurato non si moltiplica per una carica di prova, perché si cerca la sorgente.

Passaggi: a=3\,\mathrm{C/N};  E_C=9\,\mathrm{N/C};  u_C=4;  Q_C=4\,\mathrm{nC}.

Distrattori: Dodici nC usa il display come campo e omette il guadagno. Uno nC predirebbe E=9/4 N/C, non nove. Nove nC copia il numero del campo invece di usare la distanza della prova C.

Hint: Decodifica il campo prima di usare Q=Er²/k_e.

Fonte canonica SHA256 2d5bc0a43c907b9099030e3a5ab1de384d2ce724ecedf40f917a4f68c1b82fb3. Candidato SHA256 433959aa6b6f18630dbc86fea513ce83fa7bf91943075ebcd0d8f2b05d914d59. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-field-15 — Separare offset e sorgente

Una carica sorgente puntiforme Q>0, fissa nel vuoto, genera un campo elettrostatico. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. A distanza r>0 dalla sorgente, E indica il modulo del campo, diretto radialmente verso l’esterno. Non è assegnata una carica di prova su cui calcolare una forza. Poniamo u=Q/(1 nC), ρ=r/(1 m) ed e=E/(1 N/C), tutti puri: dalla legge fisica E=k_eQ/r² segue e=9u/ρ². Il display continuo adimensionale è D=aE+b, a>0. A: Q=1 nC, r=3 m, D=3. C: Q=4 nC, r=2 m, D=19. Prova G: r=3 m, D=5. Quanto vale Q_G?

Procedimento d’autore: I campi dei riferimenti sono 1 e 9 N/C. Il guadagno è (19−3)/(9−1)=2 C/N e l’offset b=1. D=5 dà E_G=(5−1)/a=2 N/C. A 3 m, e_G=u_G: la sorgente è Q_G=2 nC.

Passaggi: a=2\,\mathrm{C/N};  b=1;  E_G=2\,\mathrm{N/C};  Q_G=2\,\mathrm{nC}.

Distrattori: 5/2 nC omette b e predice D=6. Uno nC torna al riferimento A. Quattro nC toglie b senza dividere per a e predice D=9; cinque nC usa direttamente il display e predice D=11.

Hint: Rimuovi prima b, poi il guadagno e infine applica l’inversa per la sorgente.

Fonte canonica SHA256 ba01cd61e7bb092b458000b185e3eb57e4763614e4b28bcb634bed1734ee4e96. Candidato SHA256 60160a5ed03b6b9a70affcfcc4d980aff07fc79a59920cdacb4dc906ae5b93bf. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-field-16 — Un vincolo non annulla tutta la distanza

Una carica sorgente puntiforme Q>0, fissa nel vuoto, genera un campo elettrostatico. Si usa k_e=9×10⁹ N·m²/C² come valore di modello. A distanza r>0 dalla sorgente, E indica il modulo del campo, diretto radialmente verso l’esterno. Non è assegnata una carica di prova su cui calcolare una forza. Poniamo u=Q/(1 nC), ρ=r/(1 m) ed e=E/(1 N/C), tutti puri: dalla legge fisica E=k_eQ/r² segue e=9u/ρ². Fra preparazioni si impone Q=γr, con γ=(1/3) nC/m, cioè u=ρ/3. Si misura E=1 N/C. Quanto vale r?

Procedimento d’autore: Dopo la sostituzione e=9(ρ/3)/ρ², una sola potenza di ρ si cancella: e=3/ρ. Il dato e=1 impone ρ=3, cioè r=3 m; il vincolo dà allora Q=1 nC. Il campo resta inversamente proporzionale alla scala della separazione e la misura determina un’unica configurazione positiva.

Passaggi: e=\frac3{\rho};  1=\frac3{\rho};  \rho=3;  r=3\,\mathrm m.

Distrattori: Un metro darebbe 3 N/C, nove metri 1/3 N/C; −3 m è escluso. Non sono infinite soluzioni perché rimane il fattore 1/ρ. Il legame fra Q e r riguarda prove diverse, non una sorgente che varia seguendo una particella.

Hint: Sostituisci il vincolo e conta quante potenze di r rimangono.

Fonte canonica SHA256 c1be80cece878af77c443b9dd310ba426ede6ba895cdb752d4e528366eb531af. Candidato SHA256 6299dd2efb80c2e07583318cbea80bb329bf426d2083dd2ccad8779bf705d73d. Revisione indipendente e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 700e8cdece2f1de79e720b0e4f51853d273e3db81db0e7d6f1829b72b31fd848. Package file SHA256 dd3aeb56e92853c457f94117dc1faeec509767558190048b705c1e3af7c4a763. Binding file SHA256 a2cdfb8a3944ae438d42b2b6b6fb71d4083b634002456bf91d4a43e9f9fee702. Prova strutturale SHA256 e15161bacfdbe4457eab74c91951447a72a488f4097733d281a43906a1349f17. Asset-only manifest SHA256 6cc6115e945cbe1db1c61c02e37f4481ec152550a023485ac68b2ec094e9817b.

Le coordinate intrinseche dell’SVG documentano proporzioni geometriche nella sorgente, non una misura in pixel fisici dopo ridimensionamento. I testi visibili usano soltanto grandezze fisiche e valori pertinenti. Le origini e le etichette sono separate dagli assi; la direzione di ciascuna freccia è letta insieme alla sua didascalia.
