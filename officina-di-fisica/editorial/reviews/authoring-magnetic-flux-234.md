# Authoring DRAFT — magnetic-flux-234

Tutti gli 80 prompt originali A230–234 sono stati letti individualmente tramite allowlist id/prompt prima del primo candidato U6-05. Fonte Git immutabile5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U6-05 SHA256383a0881e644ab8d95bde40b9b3b3a748eaf0baaeaab941e895077251fd087fe. Compiti e casi autonomi preservati: cariche opposte23103, elettrone parallelo23303 e linee magnetiche23403 non sono assorbiti nei rispettivi modelli numerici. Inverse e rapporti mantengono domini e coefficienti dimensionali.

Prima di candidature entrambi i revisori avevano congelato la primaria: B per A230–234 SHA51395bd462210eea741c8535d111ebf94686590467d5821825834e6e8668f91d su4fcc49cee05f35b838084471fe41bf5babc83f8f (mai aperta dall’autore); A per B235–239 SHAc0d2d26dd79ece4c7ad2ff06d8ddd142acf02eb468b971b3e254ed06e16528bc subc4da66c96cc57f8629b8252a24ce2f1943f7f5e. Nessuna chiave, soluzione, hint, opzione o candidata B235–239 letta durante l’autoria A.

Rilette integralmente le lezioni reali C4-L09 e C4-L10: forza di Lorentz su particella e filo, moto circolare, componente parallela e flusso orientato. Mappatura primaria L09 per230–233 e L10 per il flusso234, con eventuale override autonomo23403 a L09; prerequisiti selezionati sul catalogo reale, senza confondere C1-L006 elasticità/gravitazione con il moto curvo di C1-L004. Nessuna competenza inventata.

Autore soltanto: DRAFT, revisione scientifica distinta NOT_RUN_BY_AUTHOR, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica. Due processi separati dell’assembler unico hanno prodotto package/binding byte-identici. Importatore canonico ROOT in sola lettura su SQLite temporaneo:16 nuovi, poi0 nuovi/16 invariati;991 pubblicati e storico conservati. Queste sono prove strutturali e di preservazione, senza accredito di integrazione o approvazione scientifica.

Figura SVG-only realmente renderizzata in browser nativo a piena altezza sotto mutex condiviso e guardia≥2 GiB; XML e PNG completo effettivamente letti. Il processo è terminato exit0, non si è dedotta la riuscita dalla sola comparsa del PNG. Nessuna pagina del prodotto, nessun server o dato studenti usato. UI prodotto e responsività320px NOT_RUN, riservate al runner canonico dell’integratore. I testi visibili non mostrano metriche ingegneristiche e non confrontano scale di pannelli indipendenti.

## AR-u6-magnetic-flux-01 — Il flusso attraverso una superficie orientata

Un campo magnetico uniforme di modulo B>0 attraversa perpendicolarmente una superficie piana aperta di area A>0. La normale positiva scelta è concorde con il campo: θ=0 e il flusso orientato è Φ=BA>0. Ogni prova mantiene queste condizioni; confronti e tarature riguardano preparazioni distinte. Con B=2 T e A=3 m², quanto vale Φ in Wb?

Procedimento d’autore: La formula generale è Φ=BA cosθ. Il campo è concorde alla normale, non soltanto perpendicolare al piano: cosθ=1 e il segno è positivo. Moltiplico 2 T per 3 m² e ottengo 6 Wb. Si tratta di una superficie aperta, non di una superficie chiusa che racchiude un volume.

Formule: \Phi=BA\cos\theta;  \cos\theta=1;  \Phi=6\,\mathrm{Wb}.

Distrattori e controprove: Dodici Wb aggiunge un fattore due non presente: non ci sono due superfici da contare. −6 Wb sceglierebbe una normale opposta; zero confonderebbe il campo perpendicolare al piano con quello perpendicolare alla normale.

Hint: Valuta il coseno rispetto alla normale, poi moltiplica B per A.

Fonte canonica SHA256 7719defd1f2075938eb5f95e0c0e1b6ca60edfeeb804ba66300fdb3605879981. Candidato SHA256 672e7f2c69f8614fa31380829cdba35f681369c8b37785b660132e5473f17a90. Skill reale C4-L10. Review distinta e human NOT_RUN.

## AR-u6-magnetic-flux-02 — L’unità del flusso

Un campo magnetico uniforme di modulo B>0 attraversa perpendicolarmente una superficie piana aperta di area A>0. La normale positiva scelta è concorde con il campo: θ=0 e il flusso orientato è Φ=BA>0. Ogni prova mantiene queste condizioni; confronti e tarature riguardano preparazioni distinte. Quale unità è adatta a esprimere Φ?

Procedimento d’autore: Il prodotto campo per area ha unità T·m², chiamata weber, simbolo Wb. La scelta di orientazione cambia il segno del flusso, non la sua dimensione.

Formule: [\Phi]=\mathrm{T\,m^2};  \mathrm{Wb}=\mathrm{T\,m^2}.

Distrattori e controprove: T è il campo senza area; T/m² divide invece di moltiplicare. V è differenza di potenziale e N forza. Un prefisso sul weber cambierebbe la scala numerica, non la dimensione.

Hint: Conserva l’area nella verifica delle unità.

Fonte canonica SHA256 6d4981111ffb2763efc2924865d8d3e193853e610638a039e139d7c128ce6fc6. Candidato SHA256 2d8cfb3d0d26c37b460a504b7e9e8d1a82d2445346742e21b7469b27a663c9b4. Skill reale C4-L10. Review distinta e human NOT_RUN.

## AR-u6-magnetic-flux-03 — Le linee dentro e fuori il magnete

Caso autonomo: nel disegno elementare del campo di un magnete a barra, si seguono le linee sia all’esterno sia all’interno del magnete. Come si completano le linee illustrate?

Procedimento d’autore: Il modello disegnato non contiene sorgenti magnetiche isolate. Il verso esterno convenzionale è da N a S; la continuazione interna va da S a N. Le due parti completano il percorso illustrato senza inizio o fine ai poli. In formula, Σ indica una qualunque superficie chiusa e il suo flusso totale è nullo. È una descrizione del magnete a barra del quesito, non l’affermazione che qualunque linea in ogni possibile campo debba essere una curva finita chiusa.

Formule: \oint_{\Sigma}\vec B\cdot d\vec A=0.

Distrattori e controprove: Un termine definitivo sui poli imiterà le linee di un campo elettrico con cariche isolate. Eliminare l’interno o interrompere al centro non completa le linee. Invertire entrambi i versi contraddice la convenzione dei poli N e S.

Hint: Segui la stessa linea anche attraverso il materiale del magnete.

Fonte canonica SHA256 47e370c2523dd057c8aff69619792137d773bc397aa8bd9b8dcc27b87127af2f. Candidato SHA256 03c46c92d78f94543ec7e17d3b3143776b8b1f9d8d930eefb3e34face76c97c2. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-magnetic-flux-04 — Campo dimezzato, stessa superficie

Un campo magnetico uniforme di modulo B>0 attraversa perpendicolarmente una superficie piana aperta di area A>0. La normale positiva scelta è concorde con il campo: θ=0 e il flusso orientato è Φ=BA>0. Ogni prova mantiene queste condizioni; confronti e tarature riguardano preparazioni distinte. A resta 3 m² e B passa da 2 a 1 T. Come cambia Φ?

Procedimento d’autore: A e cosθ restano invariati. Φ è lineare in B: il campo dimezzato dimezza il flusso da 6 a 3 Wb. Entrambi restano positivi perché non si è invertita la normale né il campo.

Formule: \Phi_A=6\,\mathrm{Wb};  \Phi_B=3\,\mathrm{Wb};  \Phi_B/\Phi_A=\frac12.

Distrattori e controprove: Dodici rende inversa la dipendenza da B. Sei ignora il cambio; zero richiederebbe B nullo o campo tangente al piano. −3 cambierebbe anche l’orientazione, che qui resta concorde.

Hint: Nel rapporto si cancella l’area.

Fonte canonica SHA256 d2d036985c5d730ac83bcf4118e15198e13a03d36264d44662de6b059fa5cc22. Candidato SHA256 263decec2ade267ba84f9193eac19fb2a73ed938426c23480d584a53f00418c4. Skill reale C4-L10. Review distinta e human NOT_RUN.

## AR-u6-magnetic-flux-05 — Il campo da una misura di flusso

Un campo magnetico uniforme di modulo B>0 attraversa perpendicolarmente una superficie piana aperta di area A>0. La normale positiva scelta è concorde con il campo: θ=0 e il flusso orientato è Φ=BA>0. Ogni prova mantiene queste condizioni; confronti e tarature riguardano preparazioni distinte. Φ=6 Wb e A=3 m². Quanto vale B in T?

Procedimento d’autore: Divido Φ=BA per l’area strettamente positiva. B=Φ/A=6 Wb/(3 m²)=2 T. Nessuna radice è necessaria perché B compare al primo grado.

Formule: B=\frac\Phi A;  B=2\,\mathrm T.

Distrattori e controprove: Diciotto moltiplica i numeri anziché dividerli; 1/2 inverte la divisione e ha anche unità m²/Wb se si usano le grandezze fisiche. Sei copia il flusso senza l’area. −2 non è un modulo ammesso.

Hint: Per isolare B dividi per l’area, non per il flusso.

Fonte canonica SHA256 7a43f8a6f6aa969efd996083b2be65e90bf65c1d5a2551c26aeb9595ac36eb7e. Candidato SHA256 f1e6cd45818381d08ead263f2d914818ef604d11988106168a173c81305e4943. Skill reale C4-L10. Review distinta e human NOT_RUN.

## AR-u6-magnetic-flux-06 — L’area da campo e flusso

Un campo magnetico uniforme di modulo B>0 attraversa perpendicolarmente una superficie piana aperta di area A>0. La normale positiva scelta è concorde con il campo: θ=0 e il flusso orientato è Φ=BA>0. Ogni prova mantiene queste condizioni; confronti e tarature riguardano preparazioni distinte. Φ=6 Wb e B=2 T. Quanto vale A in m²?

Procedimento d’autore: Divido la relazione per B>0: A=Φ/B. Sei weber divisi per due tesla danno 3 m². Il risultato è un’area e non il lato di un quadrato: non bisogna estrarre una radice.

Formule: A=\frac\Phi B;  A=3\,\mathrm{m^2}.

Distrattori e controprove: Dodici moltiplica i due numeri; 1/3 inverte la divisione. √3 m sarebbe la lunghezza di un lato se si imponesse un quadrato, informazione che qui non si richiede. Sei ignora B.

Hint: Controlla che Wb/T dia un’area.

Fonte canonica SHA256 a28cb7e0b4c096257425d7d5a2d7324c1682c538273962f809e88a003fe43f72. Candidato SHA256 86b07b60764ce642b3cb8b4f15828e8ae07ccf7800fd6e3ee5093fa6ed20b8a7. Skill reale C4-L10. Review distinta e human NOT_RUN.

## AR-u6-magnetic-flux-07 — Un terzo dell’area

Un campo magnetico uniforme di modulo B>0 attraversa perpendicolarmente una superficie piana aperta di area A>0. La normale positiva scelta è concorde con il campo: θ=0 e il flusso orientato è Φ=BA>0. Ogni prova mantiene queste condizioni; confronti e tarature riguardano preparazioni distinte. A usa B=2 T,A=3 m². B usa lo stesso campo e area di 1 m². Quanto vale Φ_B/Φ_A?

Procedimento d’autore: Il campo e l’orientazione sono comuni. I flussi sono 6 e 2 Wb: il rapporto è 2/6=1/3, uguale al rapporto delle aree. Non si sta confrontando una lunghezza con un’area.

Formule: \Phi_A=6\,\mathrm{Wb};  \Phi_B=2\,\mathrm{Wb};  \Phi_B/\Phi_A=\frac13.

Distrattori e controprove: Tre inverte il confronto, 1/9 eleva di nuovo al quadrato un rapporto che è già di aree. Uno ignora il cambio e zero non segue da area positiva.

Hint: Semplifica B prima di inserire i numeri.

Fonte canonica SHA256 3c75a0ff3c35f9be4e24d2433b54ed6c78fad7332d40c94a1a2c1e1214235ab8. Candidato SHA256 6d21db0f3be04e951de00c35ee36740387da1302ceff8e04f161881303d5ec91. Skill reale C4-L10. Review distinta e human NOT_RUN.

## AR-u6-magnetic-flux-08 — Uno scarto con segno in weber

Un campo magnetico uniforme di modulo B>0 attraversa perpendicolarmente una superficie piana aperta di area A>0. La normale positiva scelta è concorde con il campo: θ=0 e il flusso orientato è Φ=BA>0. Ogni prova mantiene queste condizioni; confronti e tarature riguardano preparazioni distinte. Con B=2 T,A=3 m² si propone Φ=12 Wb. Quanto vale proposta meno corretto?

Procedimento d’autore: La legge dà 6 Wb. Lo scarto richiesto è 12−6=+6 Wb, distinto dal rapporto puro 12/6=2. Il segno positivo indica una proposta maggiore del corretto.

Formule: \Phi=6\,\mathrm{Wb};  e=(12-6)\,\mathrm{Wb};  e=6\,\mathrm{Wb}.

Distrattori e controprove: −6 cambia l’ordine della sottrazione; due risponde con un rapporto; dodici copia la proposta. Zero la accetta senza confrontarla con il prodotto BA.

Hint: Scrivi esplicitamente proposta meno corretto.

Fonte canonica SHA256 b6fa2a72363a7bc0e673c5fcf9fe2743f1f9708cba6cc980134e01e98f62f041. Candidato SHA256 2a79e50efdb53fb15aed921cc975948f7ba530cf361fc4f1e2875eb476d6e86d. Skill reale C4-L10. Review distinta e human NOT_RUN.

## AR-u6-magnetic-flux-09 — L’inversa simbolica per B

Un campo magnetico uniforme di modulo B>0 attraversa perpendicolarmente una superficie piana aperta di area A>0. La normale positiva scelta è concorde con il campo: θ=0 e il flusso orientato è Φ=BA>0. Ogni prova mantiene queste condizioni; confronti e tarature riguardano preparazioni distinte. Si misurano Φ e A. Quale relazione isola B?

Procedimento d’autore: L’area è positiva e posso dividere entrambi i membri di Φ=BA per A. Ne segue B=Φ/A. Le unità Wb/m² restituiscono T; l’orientazione assegnata assicura Φ>0.

Formule: \Phi=BA;  B=\frac\Phi A;  [B]=\mathrm T.

Distrattori e controprove: ΦA ha unità T·m⁴ invece di T. A/Φ ha unità T⁻¹; la radice ha unità T¹ᐟ² e non appartiene alla legge lineare. Il fattore due al denominatore dimezzerebbe il campo senza una seconda interfaccia o altro dato che lo richieda.

Hint: Dividi per l’unico fattore che moltiplica B.

Fonte canonica SHA256 2e6aad4accef8293e991a4ea978a15e116edcc9ee9aecbf6ff2da577c8f9e5ca. Candidato SHA256 1f3231f1a64692939d8626a0bb8a2526c057e59169fc668363c2981fe0f8795f. Skill reale C4-L10. Review distinta e human NOT_RUN.

## AR-u6-magnetic-flux-10 — Il prodotto dei due fattori di scala

Un campo magnetico uniforme di modulo B>0 attraversa perpendicolarmente una superficie piana aperta di area A>0. La normale positiva scelta è concorde con il campo: θ=0 e il flusso orientato è Φ=BA>0. Ogni prova mantiene queste condizioni; confronti e tarature riguardano preparazioni distinte. Fra preparazioni B_B=κ₁B_A e A_B=κ₂A_A, con κ₁,κ₂>0. Quanto vale Φ_B/Φ_A?

Procedimento d’autore: Sostituisco entrambe le variazioni: Φ_B=(κ₁B_A)(κ₂A_A). Dividendo per il flusso positivo B_AA_A si cancella il riferimento e resta κ₁κ₂. Nessun coseno cambia fra le due preparazioni.

Formule: \Phi_B=\kappa_1\kappa_2B_AA_A;  \Phi_B/\Phi_A=\kappa_1\kappa_2.

Distrattori e controprove: Le divisioni attribuiscono una dipendenza inversa a uno dei due fattori. Il quadrato di κ₁ non è presente; la somma darebbe due per κ₁=κ₂=1, mentre uno stato immutato deve dare rapporto uno.

Hint: Entrambi i fattori compaiono al numeratore nella legge.

Fonte canonica SHA256 06f504e7347950ac8f0d5121937edcb943e8227619417d1b66071f726fc4b8cf. Candidato SHA256 27844cab547c2f14520ba470f9f46a4df3cbe67086f5b1ec3ec0b00703915efa. Skill reale C4-L10. Review distinta e human NOT_RUN.

## AR-u6-magnetic-flux-11 — Campo minore e area maggiore

Un campo magnetico uniforme di modulo B>0 attraversa perpendicolarmente una superficie piana aperta di area A>0. La normale positiva scelta è concorde con il campo: θ=0 e il flusso orientato è Φ=BA>0. Ogni prova mantiene queste condizioni; confronti e tarature riguardano preparazioni distinte. A usa B=2 T,A=3 m²; B usa campo di 1 T e area di 4 m². Quanto vale Φ_B/Φ_A?

Procedimento d’autore: Calcolo separatamente 2·3=6 Wb e 1·4=4 Wb. Il rapporto è 4/6=2/3. L’aumento d’area non compensa del tutto il campo dimezzato.

Formule: \Phi_A=6\,\mathrm{Wb};  \Phi_B=4\,\mathrm{Wb};  \Phi_B/\Phi_A=\frac23.

Distrattori e controprove: 3/2 inverte il confronto. Un mezzo considera solo il campo e 4/3 solo l’area. Uno presuppone una compensazione esatta, che richiederebbe area finale 6 m², non 4.

Hint: Confronta i due prodotti interi prima di ridurre la frazione.

Fonte canonica SHA256 7d73644d1f1cf9ffc9bf2e7ae83195e7a00d51315a4c78e8fbdd844e84fb512a. Candidato SHA256 25c00520b598f37070a77ef261caa8ac20a0e85ee2183ab8afed52626943a462. Skill reale C4-L10. Review distinta e human NOT_RUN.

## AR-u6-magnetic-flux-12 — Media delle letture, non degli ingressi

Un campo magnetico uniforme di modulo B>0 attraversa perpendicolarmente una superficie piana aperta di area A>0. La normale positiva scelta è concorde con il campo: θ=0 e il flusso orientato è Φ=BA>0. Ogni prova mantiene queste condizioni; confronti e tarature riguardano preparazioni distinte. Le prove con uguale peso statistico sono A:B=2 T,A=3 m² e B:B=1 T,A=4 m². Qual è la media di Φ in Wb?

Procedimento d’autore: Le letture sono 6 e 4 Wb. La semisomma è 5 Wb. Ai dati medi B=3/2 T e A=7/2 m² si otterrebbe 21/4 Wb: il prodotto delle medie non coincide con la media dei prodotti. Qui la differenza richiesta meno modello ai dati medi sarebbe −1/4 Wb.

Formule: \overline\Phi=\frac{6+4}{2}\,\mathrm{Wb};  \overline\Phi=5\,\mathrm{Wb};  \Phi_{\rm dati\ medi}=\frac{21}{4}\,\mathrm{Wb}.

Distrattori e controprove: Dieci Wb è la somma senza dimezzare. 21/4 Wb risponde usando gli ingressi medi; un Wb è la semidifferenza. Non c’è alcuna divisione temporale: i pesi sono statistici uguali.

Hint: Trova prima due letture fisiche, poi fanne la media.

Fonte canonica SHA256 322bc2601528795ba595ead17a4cde9a78b845ceb7ad3083ec00b795636f9ddd. Candidato SHA256 558dccc82d5afcfedc0cfe393fccf3d436b7ddd9f1724909946d582e707a4ad3. Skill reale C4-L10. Review distinta e human NOT_RUN.

## AR-u6-magnetic-flux-13 — L’area per il flusso bersaglio

Un campo magnetico uniforme di modulo B>0 attraversa perpendicolarmente una superficie piana aperta di area A>0. La normale positiva scelta è concorde con il campo: θ=0 e il flusso orientato è Φ=BA>0. Ogni prova mantiene queste condizioni; confronti e tarature riguardano preparazioni distinte. A usa B_A=2 T,A_A=3 m². B usa campo di 1 T e deve dare Φ_B=(2/3)Φ_A. Quanto vale A_B/A_A?

Procedimento d’autore: Il flusso iniziale è 6 Wb e il bersaglio è 4 Wb. Con B_B=1 T serve A_B=4 m². Dividendo per A_A=3 m² ottengo 4/3: il campo minore richiede più area rispetto alla sola riduzione del flusso.

Formule: \Phi_B=4\,\mathrm{Wb};  A_B=4\,\mathrm{m^2};  A_B/A_A=\frac43.

Distrattori e controprove: 3/4 inverte il rapporto. 2/3 copia il fattore del flusso ignorando il campo diverso; 1/3 darebbe A_B=1 m² e Φ_B=1 Wb. Due darebbe 6 Wb, uguale al riferimento anziché due terzi.

Hint: Decodifica il bersaglio in weber prima dell’inversa.

Fonte canonica SHA256 db0faf0aec7f0b37c5306394c2cb968cd91be60e193bf56a0cbfbe6393a22d8a. Candidato SHA256 82c26dffb1991ca369a1a6863747c5b5778489e784cb4bdd6ff2864db8f847d9. Skill reale C4-L10. Review distinta e human NOT_RUN.

## AR-u6-magnetic-flux-14 — Taratura proporzionale dello strumento

Un campo magnetico uniforme di modulo B>0 attraversa perpendicolarmente una superficie piana aperta di area A>0. La normale positiva scelta è concorde con il campo: θ=0 e il flusso orientato è Φ=BA>0. Ogni prova mantiene queste condizioni; confronti e tarature riguardano preparazioni distinte. Il display continuo adimensionale segue D=a_cal Φ, senza offset. Il riferimento B=2 T,A=3 m² dà D=18. Nella nuova prova A=4 m²,D=12. Quanto vale B in T?

Procedimento d’autore: Il riferimento dà Φ_A=6 Wb e a_cal=18/(6 Wb)=3 Wb⁻¹. La lettura12 corrisponde a Φ_B=4 Wb; divido per i 4 m² della nuova superficie e ottengo B_B=1 T. Il display non è direttamente un valore in weber.

Formule: a_{\rm cal}=3\,\mathrm{Wb^{-1}};  \Phi_B=4\,\mathrm{Wb};  B_B=1\,\mathrm T.

Distrattori e controprove: Tre T usa D=12 come se fosse 12 Wb. Quattro T copia il valore numerico del flusso decodificato ignorando l’area. 2/3 è il rapporto delle letture, non il nuovo campo: anche l’area è diversa.

Hint: Trova il guadagno con il riferimento prima di usare l’area nuova.

Fonte canonica SHA256 414b3da604eaf93c61ece95aacfcc78551e3eeaf15003971305ee4831f2a2384. Candidato SHA256 1fadd55f3a36a35b0f493bd5eec600552d5f329eb97010beb71b45846d1c1760. Skill reale C4-L10. Review distinta e human NOT_RUN.

## AR-u6-magnetic-flux-15 — Due riferimenti separano guadagno e offset

Un campo magnetico uniforme di modulo B>0 attraversa perpendicolarmente una superficie piana aperta di area A>0. La normale positiva scelta è concorde con il campo: θ=0 e il flusso orientato è Φ=BA>0. Ogni prova mantiene queste condizioni; confronti e tarature riguardano preparazioni distinte. Il display continuo adimensionale segue D=a_cal Φ+b_cal. A:B=2 T,A=3 m²,D=13. B:B=1 T,A=4 m²,D=9. C:A=5 m²,D=41. Quanto vale B_C in T?

Procedimento d’autore: I due flussi di riferimento sono 6 e 4 Wb. La differenza delle letture è 4 per una differenza di 2 Wb: a_cal=2 Wb⁻¹. Da 13=2·6+b_cal segue b_cal=1. Sottraggo l’offset a 41 e divido per 2: Φ_C=20 Wb, quindi B_C=20/5=4 T.

Formule: a_{\rm cal}=2\,\mathrm{Wb^{-1}};  b_{\rm cal}=1;  \Phi_C=20\,\mathrm{Wb};  B_C=4\,\mathrm T.

Distrattori e controprove: 41/10 T omette la sottrazione dell’offset e predice D=42. Otto T sottrae b ma omette la divisione per il guadagno; venti T copia il flusso invece di dividerlo per l’area.

Hint: Sottrai le due equazioni di taratura per eliminare b_cal.

Fonte canonica SHA256 99d76112a67277100b2067d0e5699bbc909215c28907418530193ce6239abe8c. Candidato SHA256 d252f6b3cc96ac8347eb794766a035ade00cb723e58fb3e4c702e2ffaf64753a. Skill reale C4-L10. Review distinta e human NOT_RUN.

## AR-u6-magnetic-flux-16 — Un vincolo con coefficiente dimensionato

Un campo magnetico uniforme di modulo B>0 attraversa perpendicolarmente una superficie piana aperta di area A>0. La normale positiva scelta è concorde con il campo: θ=0 e il flusso orientato è Φ=BA>0. Ogni prova mantiene queste condizioni; confronti e tarature riguardano preparazioni distinte. Fra preparazioni B=[(2/3) T/m²]A e si misura Φ=6 Wb. Quanto vale A?

Procedimento d’autore: Pongo a=A/(1 m²)>0 e β=B/(1 T)>0. Il vincolo dà β=(2/3)a; il flusso numerico sei dà 6=βa=(2/3)a². Moltiplico per 3/2: a²=9. Le due radici algebriche sono alternative, ma solo a=3 rispetta l’area positiva. Ne segue A=3 m² e B=2 T.

Formule: 6=\frac23a^2;  a^2=9;  a=3;  a=-3;  A=3\,\mathrm{m^2}.

Distrattori e controprove: −3 è la radice esclusa dal dominio dell’area. Nove confonde a² con a e darebbe Φ=54 Wb. Due m² darebbe Φ=8/3 Wb. La misura e il vincolo fissano un’unica area positiva.

Hint: Usa variabili numeriche adimensionali prima di risolvere il quadrato.

Fonte canonica SHA256 f88b4f831cffb7dde39d97e46f05792c168a9a4e88b77c18506e00f9a6a16993. Candidato SHA256 2f3760f50b1864997b901e0e4b2dc36abc891285f745361f8f393321bdde6c4e. Skill reale C4-L10. Review distinta e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 846c8f549db28ecb3703be9587c83092067b533003ce86610c98431d85ca0117. Package file SHA256 d5daa559d93c476370169fff9ed35867cf8a64a1ab2bd1f759fc16273937b3c2. Binding file SHA256 6a33c0d310030c0978706c03d23f7fb986a750bed989443fba3dc516764aa620. Prova strutturale SHA256 0da9f594f6bb4bce6bc0aa619ddba628fd7e35910354fba54031d171cfec01de. Manifest asset-only SHA256 e1540de8d59a4c7aa5d978d31ae2ceccf5ae4ee51dba59ce64bc0ff6f8664c07.

Nessun registry, ledger, runtime, checkpoint o Git ROOT modificato. Il revisore B è distinto e deve leggere i finali contro la propria primaria prima di qualsiasi firma. Prodotto UI NOT_RUN, nessun marker inventato o riusato.

Lettura geometrica dell’autore: B e la normale positiva sono concordi, ma le loro lunghezze sono schematiche perché una è dimensionata e l’altra no. Nel pannello del magnete, la continuazione esterna va dalla regione N alla regione S; il tratto interno torna da S a N. Ogni freccia ha un percorso separato e la punta completa è visibile. Il disegno illustra una linea del modello elementare, senza attribuire densità quantitativa alle linee. Le barre240/160/200 coordinate rappresentano6/4/5 Wb: scala comune40 coordinate/Wb. Il grafico a superficie3 m² ha x=150+120B[T], y=1600−30Φ[Wb], punto(390,1420)=(2 T,6 Wb), origine esclusa daB>0. Queste coordinate intrinseche non compaiono nei testi visibili agli studenti.

Il primo import strutturale WIP precedeva lo spostamento del titolo e dell’etichetta esterna per evitare interferenze con il percorso disegnato. Vecchi package, binding, SVG incorporato e prova strutturale sono conservati in editorial/author-evidence/magnetic-flux-234-wip-labels-before-first-delivery/. Doppia assembly e import finale sono stati ripetuti realmente; il native effettivamente letto si riferisce soltanto all’asset finale.
