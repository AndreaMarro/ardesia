# Authoring DRAFT — series-capacitor-voltage-222

Letti individualmente tutti gli 80 prompt originali assegnati A220–224 prima di scrivere il primo candidato. Fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U6-04 SHA256 179bf1cacfb83482e32bb41e99cb78296990faafba1fe9ce3b0e3cbc3a6a09cf. Compiti e ID conservati, incluse eccezioni: 22006 polarità opposte e transitorio esaurito; 22106 capacità delle due topologie, senza falsa conservazione di una commutazione. Riletta integralmente la lezione reale C4-L07, capacità come Q/V, geometria piana, lavoro di carica e distinzione fra condensatore isolato e collegato; prerequisiti reali C4-L01/L03/L04 e C1-L001. Nessuna nuova lezione inventata.

Prima di candidature U604 entrambi i revisori avevano congelato la propria primaria: B per A220–224 SHA08e1a184ade8bd85a9d6d8f4b919b18105877f0c2007729ba514f0f48f36eb58 (non aperta dall’autore); A per B225–229 SHA1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a, lettura solo allowlist id/prompt senza opzioni o chiavi altrui.

Autore soltanto: DRAFT, revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica. Due processi separati dell’assembler unico producono byte identici. Importatore canonico ROOT read-only su SQLite temporaneo: 16 nuovi, poi 0 nuovi e 16 invariati, 991 pubblicati e relativo storico invariati. Sono prove tecniche, senza accredito d’integrazione.

Figura realmente prodotta nel browser soltanto come SVG inline a piena altezza, sotto mutex e guardia ≥2 GiB, processo terminale exit0. XML integrale e PNG intero sono stati letti; dimensioni e bounding box esatti nel manifest. Nessuna pagina dell’app aperta, nessun marker di UI prodotto creato o riusato. UI prodotto e layout a 320px NOT_RUN; collaudo canonico riservato all’integratore. I testi visibili usano grandezze fisiche, non metriche dell’implementazione.

## AR-u6-series-capacitor-voltage-01 — Caduta sul primo condensatore

Due condensatori lineari ideali, C₁>0 e C₂>0 finiti, sono inizialmente scarichi e collegati in serie fra A e B a un generatore ideale E=12 V. C₁ è fra A e M, C₂ fra M e B. Il nodo M non riceve carica dall’esterno e conserva carica netta zero. A regime le armature dei due condensatori hanno lo stesso modulo Q. Si cerca V₁=V_A−V_M, la caduta positiva sul primo condensatore; la somma delle due cadute è E e 0<V₁<E. Le capacità restano costanti entro ciascuna preparazione. Con C₁=2 μF e C₂=2 μF, quanto vale V₁ in V?

Procedimento d’autore: Indico con S la capacità equivalente della serie: con due componenti da 2 μF vale 1 μF. Con E=12 V si accumula un modulo Q=12 μC. Sul primo condensatore V₁=Q/C₁=12 μC/(2 μF)=6 V. Il secondo ha anch’esso 6 V e la somma ricostruisce la tensione del generatore. Non si usa la corrente finale, che in un dielettrico ideale a regime è nulla.

Passaggi: S=1\,\mu\mathrm F;  Q=12\,\mu\mathrm C;  V_1=\frac Q{C_1};  V_1=6\,\mathrm V.

Distrattori: Dodici V assegna tutta la caduta al primo e zero al secondo. Tre V è la caduta che si avrebbe con C₁=3C₂, non con capacità uguali. Quattro e due copiano numeri di capacità senza ricostruire Q/C₁. Il rapporto delle tensioni non si legge come quello diretto delle capacità.

Hint: Trova la carica comune della serie e dividila per C₁.

Fonte canonica SHA256 bf120f64c9b0f0d3d56e0b84bc770324f1e873fcef1181bbb754ab8c39839dec. Candidato SHA256 9c793fb87c80f03dbc0b834e4ebe533df10949a83e2cd15a6639d8853e5df881. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitor-voltage-02 — L’unità della caduta

Due condensatori lineari ideali, C₁>0 e C₂>0 finiti, sono inizialmente scarichi e collegati in serie fra A e B a un generatore ideale E=12 V. C₁ è fra A e M, C₂ fra M e B. Il nodo M non riceve carica dall’esterno e conserva carica netta zero. A regime le armature dei due condensatori hanno lo stesso modulo Q. Si cerca V₁=V_A−V_M, la caduta positiva sul primo condensatore; la somma delle due cadute è E e 0<V₁<E. Le capacità restano costanti entro ciascuna preparazione. Quale unità esprime V₁?

Procedimento d’autore: V₁ è una differenza di potenziale. Da Q/C₁ si ricava l’unità C/F=V. Il rapporto C₂/(C₁+C₂) è puro e moltiplica i 12 V del generatore: non è esso stesso l’uscita dimensionata.

Passaggi: [V_1]=\mathrm{C/F};  [V_1]=\mathrm V.

Distrattori: A misura corrente, μF capacità e W potenza. Il numero 1 è l’unità del rapporto delle capacità, non della caduta. La capacità ha cambiato il riparto, non la dimensione di V₁.

Hint: Il rapporto delle capacità moltiplica una tensione.

Fonte canonica SHA256 fa2054f4b867655f16d595b8ee7e8a6cc1da5abbd8b8ebec173e75ecc775eb90. Candidato SHA256 fc1fff35a64f029ce0c74d1a8f5a877d24a34534327318b8d4dd406cc5642b92. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitor-voltage-03 — Carica comune, tensioni diverse

Due condensatori lineari ideali, C₁>0 e C₂>0 finiti, sono inizialmente scarichi e collegati in serie fra A e B a un generatore ideale E=12 V. C₁ è fra A e M, C₂ fra M e B. Il nodo M non riceve carica dall’esterno e conserva carica netta zero. A regime le armature dei due condensatori hanno lo stesso modulo Q. Si cerca V₁=V_A−V_M, la caduta positiva sul primo condensatore; la somma delle due cadute è E e 0<V₁<E. Le capacità restano costanti entro ciascuna preparazione. Quale relazione dà V₁?

Procedimento d’autore: La neutralità del nodo intermedio rende comuni i moduli Q, non le tensioni. Sommando Q/C₁ e Q/C₂ si trova Q=E C₁C₂/(C₁+C₂). Dividendo questa carica per C₁ si ottiene V₁=E C₂/(C₁+C₂). Il C₂ al numeratore nasce proprio dalla divisione per C₁ della carica comune.

Passaggi: E=\frac Q{C_1}+\frac Q{C_2};  Q=E\frac{C_1C_2}{C_1+C_2};  V_1=E\frac{C_2}{C_1+C_2}.

Distrattori: C₁ al numeratore dà la caduta sul secondo condensatore. Invertire il rapporto produce una caduta maggiore di E; dividere per il solo C₁ omette C₂ nella somma. EC₁C₂ ha unità V·F² e non V.

Hint: Somma Q/C₁ e Q/C₂ e poi isola Q.

Fonte canonica SHA256 e934f4ef2f5e533cbb4360e5711328b92d196308b1cc441d11bd09fd8c317780. Candidato SHA256 7511bbca9cc5e984ba27e73af02d43ed925e892f53414742477315daab2735bf. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitor-voltage-04 — Il primo condensatore diminuisce

Due condensatori lineari ideali, C₁>0 e C₂>0 finiti, sono inizialmente scarichi e collegati in serie fra A e B a un generatore ideale E=12 V. C₁ è fra A e M, C₂ fra M e B. Il nodo M non riceve carica dall’esterno e conserva carica netta zero. A regime le armature dei due condensatori hanno lo stesso modulo Q. Si cerca V₁=V_A−V_M, la caduta positiva sul primo condensatore; la somma delle due cadute è E e 0<V₁<E. Le capacità restano costanti entro ciascuna preparazione. C₁ passa da 2 a 1 μF, mentre C₂ resta 2 μF. Come cambia V₁?

Procedimento d’autore: Prima le due capacità uguali danno V₁,A=6 V. Dopo C₁=1 μF e C₂=2 μF, la carica comune è Q_B=12·(2/3) μC=8 μC. Dividendo per il nuovo C₁ si ottiene V₁,B=8 V; l’altra caduta è 4 V. Una capacità più piccola prende qui la caduta maggiore.

Passaggi: V_{1,A}=6\,\mathrm V;  Q_B=8\,\mu\mathrm C;  V_{1,B}=8\,\mathrm V.

Distrattori: Tre V rende la caduta direttamente proporzionale a C₁, sei la conserva ignorando il cambio, dodici annulla l’altra caduta. Quattro V è la caduta finale sul secondo condensatore, non sul primo.

Hint: La caduta sul componente più piccolo aumenta a tensione totale fissata.

Fonte canonica SHA256 f1b4ba0e30f9e9e09684a374f093a43f7084a2c5fc6e466c7948656846be3a2c. Candidato SHA256 d7ef2a3ceb21052c51b082e523234d0a18415142a1315c08ae92b7b2f3187eeb. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitor-voltage-05 — Ricostruire C₁

Due condensatori lineari ideali, C₁>0 e C₂>0 finiti, sono inizialmente scarichi e collegati in serie fra A e B a un generatore ideale E=12 V. C₁ è fra A e M, C₂ fra M e B. Il nodo M non riceve carica dall’esterno e conserva carica netta zero. A regime le armature dei due condensatori hanno lo stesso modulo Q. Si cerca V₁=V_A−V_M, la caduta positiva sul primo condensatore; la somma delle due cadute è E e 0<V₁<E. Le capacità restano costanti entro ciascuna preparazione. Si misura V₁=6 V e si conosce C₂=2 μF. Quanto vale C₁ in μF?

Procedimento d’autore: Da V₁(C₁+C₂)=EC₂ segue V₁C₁=(E−V₁)C₂. Dividendo per V₁>0 si trova C₁=C₂(E−V₁)/V₁. I dati danno 2 μF·6/6=2 μF. Il dominio 0<V₁<E rende la capacità positiva.

Passaggi: V_1C_1=(E-V_1)C_2;  C_1=C_2\frac{E-V_1}{V_1};  C_1=2\,\mu\mathrm F.

Distrattori: Sei μF darebbe V₁=3 V; quattro μF darebbe V₁=4 V. Sottrarre direttamente una tensione da una capacità mescola unità. Il confine V₁=0 non permette un primo componente positivo finito in questa serie.

Hint: Porta il termine V₁C₂ a destra prima di dividere per V₁.

Fonte canonica SHA256 448c4e9addd00f77e9284be7612199ee8ca91045d6ed2ef809177ef932e213ce. Candidato SHA256 03e4bdb074cb06d71d370e762dc1cf4d01c6512b34ca730dd50afac06ba57aa6. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitor-voltage-06 — Ricostruire C₂

Due condensatori lineari ideali, C₁>0 e C₂>0 finiti, sono inizialmente scarichi e collegati in serie fra A e B a un generatore ideale E=12 V. C₁ è fra A e M, C₂ fra M e B. Il nodo M non riceve carica dall’esterno e conserva carica netta zero. A regime le armature dei due condensatori hanno lo stesso modulo Q. Si cerca V₁=V_A−V_M, la caduta positiva sul primo condensatore; la somma delle due cadute è E e 0<V₁<E. Le capacità restano costanti entro ciascuna preparazione. Si misura V₁=6 V e si conosce C₁=2 μF. Quanto vale C₂ in μF?

Procedimento d’autore: Raccolgo la stessa equazione in C₂: V₁C₁=(E−V₁)C₂. Dunque C₂=V₁C₁/(E−V₁). Con V₁=6 V e C₁=2 μF risulta C₂=2 μF. Il denominatore E−V₁ è una tensione positiva, non una capacità.

Passaggi: V_1C_1=(E-V_1)C_2;  C_2=\frac{V_1C_1}{E-V_1};  C_2=2\,\mu\mathrm F.

Distrattori: Quattro μF darebbe V₁=8 V; un μF darebbe V₁=4 V. Sostituire E+V₁ al denominatore darebbe 2/3 μF e non ricostruirebbe la caduta. Il confine V₁=E è escluso.

Hint: Raccogli C₂ e dividi per la tensione positiva E−V₁.

Fonte canonica SHA256 508b4b3fa60ff0b12ec48391ee885b2d3f646a0071323eed62df26996934ce92. Candidato SHA256 4d467de4c4ea88e35cba4e9074153a5020cb878b01ebc33fcf80737a43cc4cb9. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitor-voltage-07 — Il secondo condensatore aumenta

Due condensatori lineari ideali, C₁>0 e C₂>0 finiti, sono inizialmente scarichi e collegati in serie fra A e B a un generatore ideale E=12 V. C₁ è fra A e M, C₂ fra M e B. Il nodo M non riceve carica dall’esterno e conserva carica netta zero. A regime le armature dei due condensatori hanno lo stesso modulo Q. Si cerca V₁=V_A−V_M, la caduta positiva sul primo condensatore; la somma delle due cadute è E e 0<V₁<E. Le capacità restano costanti entro ciascuna preparazione. A ha C₁=2 μF, C₂=2 μF. B mantiene C₁ e ha C₂=4 μF. Quanto vale V₁_B/V₁_A?

Procedimento d’autore: A dà 6 V. B con C₁=2 μF e C₂=4 μF dà V₁,B=12·4/6 V=8 V; il rapporto è 8/6=4/3. Raddoppiare C₂ modifica sia il numeratore sia la somma, perciò non raddoppia la caduta sul primo condensatore.

Passaggi: V_{1,A}=6\,\mathrm V;  V_{1,B}=8\,\mathrm V;  \frac{V_{1,B}}{V_{1,A}}=\frac43.

Distrattori: 3/4 inverte il confronto. Due segue soltanto C₂, mezzo ne inverte l’effetto e uno ignora la modifica. La nuova caduta sul primo deve restare minore di 12 V.

Hint: Valuta sia il numeratore sia il denominatore della nuova prova.

Fonte canonica SHA256 72889de8fde0b454dcabe836e15b24ba076c604388a410a72710283f291935cf. Candidato SHA256 ce5bd54a83ce51ca7447dba47cdb548c5c2e66a20e38edfb4ce78b0ba998e8e1. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitor-voltage-08 — Scarto della tensione proposta

Due condensatori lineari ideali, C₁>0 e C₂>0 finiti, sono inizialmente scarichi e collegati in serie fra A e B a un generatore ideale E=12 V. C₁ è fra A e M, C₂ fra M e B. Il nodo M non riceve carica dall’esterno e conserva carica netta zero. A regime le armature dei due condensatori hanno lo stesso modulo Q. Si cerca V₁=V_A−V_M, la caduta positiva sul primo condensatore; la somma delle due cadute è E e 0<V₁<E. Le capacità restano costanti entro ciascuna preparazione. Con C₁=C₂=2 μF si propone V₁=12 V. Quanto vale proposta meno corretto?

Procedimento d’autore: La corretta caduta è 6 V. La proposta 12 V la supera di 6 V e assegnerebbe zero all’altro condensatore finito positivo. Lo scarto richiesto è proposta meno corretto e conserva l’unità volt.

Passaggi: V_1=6\,\mathrm V;  e=(12-6)\,\mathrm V;  e=6\,\mathrm V.

Distrattori: −6 V scambia l’ordine, dodici copia la proposta e zero la accetta. Due puro è un rapporto e non una differenza di tensione.

Hint: Dividi prima la tensione fra i due condensatori uguali.

Fonte canonica SHA256 aad04bcb030140f6f80c5a61a4460eae8c515f09915d4991c12a69731c2b2c2a. Candidato SHA256 3cff80ed0b7a832b4f83661e0db40da0146192663c08bff875f6c22d94beb985. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitor-voltage-09 — L’inversa nella prima capacità

Due condensatori lineari ideali, C₁>0 e C₂>0 finiti, sono inizialmente scarichi e collegati in serie fra A e B a un generatore ideale E=12 V. C₁ è fra A e M, C₂ fra M e B. Il nodo M non riceve carica dall’esterno e conserva carica netta zero. A regime le armature dei due condensatori hanno lo stesso modulo Q. Si cerca V₁=V_A−V_M, la caduta positiva sul primo condensatore; la somma delle due cadute è E e 0<V₁<E. Le capacità restano costanti entro ciascuna preparazione. Sono noti V₁, E e C₂. Quale formula isola C₁?

Procedimento d’autore: Moltiplico per la somma e raccolgo l’incognita: V₁C₁=(E−V₁)C₂. L’inversa C₁=C₂(E−V₁)/V₁ conserva l’unità di capacità perché il rapporto delle tensioni è puro. I confini V₁=0 o V₁=E non appartengono al caso con entrambe le capacità finite positive.

Passaggi: V_1(C_1+C_2)=EC_2;  V_1C_1=(E-V_1)C_2;  C_1=C_2\frac{E-V_1}{V_1}.

Distrattori: Il più non isola il termine. C₂V₁/(E−V₁) inverte il rapporto delle tensioni: con E=12 V,V₁=3 V,C₂=1 μF darebbe 1/3 μF, mentre C₁=3 μF. V₁/C₂ e C₂−V₁ non hanno la dimensione richiesta.

Hint: Controlla insieme l’algebra e il dominio 0<V₁<E.

Fonte canonica SHA256 67b739baa8e6876566b93943c9812846f8146c3e6f6b429bfafd089f599c536d. Candidato SHA256 05dfb185442cc58b40f6e8190ae7a447bfc814a80555af2f1897c59a22a443e5. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitor-voltage-10 — Fattori separati nella somma

Due condensatori lineari ideali, C₁>0 e C₂>0 finiti, sono inizialmente scarichi e collegati in serie fra A e B a un generatore ideale E=12 V. C₁ è fra A e M, C₂ fra M e B. Il nodo M non riceve carica dall’esterno e conserva carica netta zero. A regime le armature dei due condensatori hanno lo stesso modulo Q. Si cerca V₁=V_A−V_M, la caduta positiva sul primo condensatore; la somma delle due cadute è E e 0<V₁<E. Le capacità restano costanti entro ciascuna preparazione. B usa C₁,B=κ₁C₁ e C₂,B=κ₂C₂, con fattori positivi. Definiamo S=C₁+C₂ e S_B=κ₁C₁+κ₂C₂, somme ausiliarie e non capacità equivalenti della serie. Quanto vale V₁,B/V₁,A?

Procedimento d’autore: La caduta è E C₂/S, con S=C₁+C₂. Nella nuova prova il numeratore porta κ₂ e la somma diventa S_B. Dividendo le due cadute si ottiene V₁,B/V₁,A=κ₂S/S_B. Scalare entrambe le capacità dello stesso fattore lascia invariate le tensioni, ma cambia Q.

Passaggi: V_{1,A}=E\frac{C_2}{S};  V_{1,B}=E\frac{\kappa_2C_2}{S_B};  \frac{V_{1,B}}{V_{1,A}}=\frac{\kappa_2S}{S_B}.

Distrattori: κ₁ al numeratore scala il componente sbagliato nella formula della caduta. Il prodotto omette la variazione della somma; S_B/(κ₂S) inverte il confronto. κ₂/κ₁ perde i pesi delle capacità nel denominatore.

Hint: Distingui il fattore dell’elemento inferiore dalla variazione del totale.

Fonte canonica SHA256 8d4ec6ef4db474ed2b85610aa04e20349ac0d84fa8d44e6fb1e5232a90a0dc13. Candidato SHA256 8ecff7af23b48172db7008cca4eed507d0769558420e3a39091aa2b2882f153d. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitor-voltage-11 — Nuova ripartizione elettrostatica

Due condensatori lineari ideali, C₁>0 e C₂>0 finiti, sono inizialmente scarichi e collegati in serie fra A e B a un generatore ideale E=12 V. C₁ è fra A e M, C₂ fra M e B. Il nodo M non riceve carica dall’esterno e conserva carica netta zero. A regime le armature dei due condensatori hanno lo stesso modulo Q. Si cerca V₁=V_A−V_M, la caduta positiva sul primo condensatore; la somma delle due cadute è E e 0<V₁<E. Le capacità restano costanti entro ciascuna preparazione. A ha C₁=2 μF e C₂=2 μF. B ha C₁=3 μF e C₂=1 μF. Quanto vale V₁_B/V₁_A?

Procedimento d’autore: Le due somme sono entrambe 4 μF. A ha V₁,A=12·2/4=6 V; B ha V₁,B=12·1/4=3 V. Il rapporto è 1/2. In B la carica comune vale 9 μC: divisa per C₁=3 μF dà proprio 3 V.

Passaggi: V_{1,A}=6\,\mathrm V;  V_{1,B}=3\,\mathrm V;  \frac{V_{1,B}}{V_{1,A}}=\frac12.

Distrattori: Due inverte il rapporto. 3/2 segue soltanto C₁; un terzo usa C₂,B/C₁,B anziché C₂,B/(C₁,B+C₂,B). Uno riconosce la somma uguale ma ignora il cambiamento del riparto.

Hint: Calcola la frazione inferiore in ciascuna prova.

Fonte canonica SHA256 ebceba0fdbec71f445cfb3a2e89686a25dcd7322aa0d63367fcf00df015dca98. Candidato SHA256 97332850fc5286a76c366f035a7a59f53d771a593004f3f89b47205beb1c6351. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitor-voltage-12 — Media con somma comune

Due condensatori lineari ideali, C₁>0 e C₂>0 finiti, sono inizialmente scarichi e collegati in serie fra A e B a un generatore ideale E=12 V. C₁ è fra A e M, C₂ fra M e B. Il nodo M non riceve carica dall’esterno e conserva carica netta zero. A regime le armature dei due condensatori hanno lo stesso modulo Q. Si cerca V₁=V_A−V_M, la caduta positiva sul primo condensatore; la somma delle due cadute è E e 0<V₁<E. Le capacità restano costanti entro ciascuna preparazione. A usa C₁=2 μF, C₂=2 μF; B usa C₁=3 μF, C₂=1 μF. Qual è la media aritmetica delle due V₁ con uguale peso?

Procedimento d’autore: La media delle due cadute è (6+3)/2=9/2 V. Ai dati medi C₁=5/2 μF e C₂=3/2 μF, la formula dà lo stesso 12·(3/2)/4=9/2 V. La coincidenza dipende dalla somma comune di 4 μF nei riferimenti, non vale per tutte le coppie di capacità.

Passaggi: \overline{V_1}=\frac{6+3}{2}\,\mathrm V;  \overline{V_1}=\frac92\,\mathrm V;  V_{1,\rm dati\ medi}=\frac92\,\mathrm V.

Distrattori: Nove V somma; 3/2 V è metà della differenza; sei e tre ripetono una sola prova. La coincidenza con il modello ai dati medi va motivata dalla somma comune.

Hint: Media le due tensioni già calcolate e controlla il totale comune.

Fonte canonica SHA256 2908e23ccfae36ef8f3e4950eb8e865e8378c1471e2b7cd2c62f2784e89af17f. Candidato SHA256 ba10a2cfd5d93b45887fc22fc87a627a13f483f18254102c6253766f58288852. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitor-voltage-13 — C₂ per la caduta bersaglio

Due condensatori lineari ideali, C₁>0 e C₂>0 finiti, sono inizialmente scarichi e collegati in serie fra A e B a un generatore ideale E=12 V. C₁ è fra A e M, C₂ fra M e B. Il nodo M non riceve carica dall’esterno e conserva carica netta zero. A regime le armature dei due condensatori hanno lo stesso modulo Q. Si cerca V₁=V_A−V_M, la caduta positiva sul primo condensatore; la somma delle due cadute è E e 0<V₁<E. Le capacità restano costanti entro ciascuna preparazione. A ha C₁=C₂=2 μF. B usa C₁=3 μF e deve dare V₁_B=V₁_A/2. Quanto vale C₂,B/C₂,A?

Procedimento d’autore: Il bersaglio è V₁,B=3 V. Con C₁,B=3 μF, l’inversa C₂,B=V₁,BC₁,B/(E−V₁,B) dà 9/9 μF=1 μF. Il rapporto con C₂,A=2 μF è 1/2; la caduta bersaglio è ancora interna al dominio.

Passaggi: V_{1,B}=3\,\mathrm V;  C_{2,B}=1\,\mu\mathrm F;  \frac{C_{2,B}}{C_{2,A}}=\frac12.

Distrattori: Due inverte il confronto. Un terzo confronta C₂,B con C₁,B anziché con C₂,A; 3/2 segue C₁; uno lascerebbe C₂=2 μF e produrrebbe 24/5 V, non 3 V.

Hint: Fissa la tensione bersaglio prima di invertire la legge.

Fonte canonica SHA256 6058329c5a16f9d8db28608841727574a8ac8589478cfcd071e6258bb65946d3. Candidato SHA256 d4e714516b5e56c21952d1f4acf369197341a5953188985b4824355389c703f9. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitor-voltage-14 — Display proporzionale della caduta

Due condensatori lineari ideali, C₁>0 e C₂>0 finiti, sono inizialmente scarichi e collegati in serie fra A e B a un generatore ideale E=12 V. C₁ è fra A e M, C₂ fra M e B. Il nodo M non riceve carica dall’esterno e conserva carica netta zero. A regime le armature dei due condensatori hanno lo stesso modulo Q. Si cerca V₁=V_A−V_M, la caduta positiva sul primo condensatore; la somma delle due cadute è E e 0<V₁<E. Le capacità restano costanti entro ciascuna preparazione. D=a_cal V₁ è continuo e adimensionale, a_cal>0, senza offset. A con C₁=C₂=2 μF dà D=18. C dà D=9 e ha C₂=1 μF. Quanto vale C₁,C in μF?

Procedimento d’autore: Il riferimento V₁,A=6 V con lettura 18 fissa a_cal=3 V⁻¹. Lettura 9 indica V₁,C=3 V. Con C₂,C=1 μF, l’inversa superiore dà C₁,C=1·(12−3)/3 μF=3 μF. La lettura è adimensionale, non direttamente una tensione.

Passaggi: a_{\rm cal}=3\,\mathrm V^{-1};  V_{1,C}=3\,\mathrm V;  C_{1,C}=3\,\mu\mathrm F.

Distrattori: 1/3 μF usa D=9 come volt e produrrebbe 9 V. Un μF dà 6 V; nove μF dà 6/5 V. Solo tre μF restituisce 3 V e lettura 9.

Hint: Decodifica la tensione prima dell’inversa di C₁.

Fonte canonica SHA256 69b6f440ed066d5a3c0a1d38e19bb48eb17426d94ea49fa41f7334225dcea2bc. Candidato SHA256 73da2f4ca84fc20c0599824df18c3e453e8dff358f72b88b2a0a78c9421d475f. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitor-voltage-15 — Taratura prima dell’inversa

Due condensatori lineari ideali, C₁>0 e C₂>0 finiti, sono inizialmente scarichi e collegati in serie fra A e B a un generatore ideale E=12 V. C₁ è fra A e M, C₂ fra M e B. Il nodo M non riceve carica dall’esterno e conserva carica netta zero. A regime le armature dei due condensatori hanno lo stesso modulo Q. Si cerca V₁=V_A−V_M, la caduta positiva sul primo condensatore; la somma delle due cadute è E e 0<V₁<E. Le capacità restano costanti entro ciascuna preparazione. D=a_cal V₁+b è continuo e adimensionale. A: C₁=2 μF, C₂=2 μF, D=13. B: C₁=3 μF, C₂=1 μF, D=7. C: C₂=2 μF, D=17. Quanto vale C₁,C?

Procedimento d’autore: I riferimenti hanno cadute 6 e 3 V, letture 13 e 7: guadagno 2 V⁻¹, offset 1. Lettura 17 indica V₁,C=(17−1)/2 V=8 V. Con C₂,C=2 μF, C₁,C=2·(12−8)/8 μF=1 μF. Il controllo di 8<12 precede l’inversa.

Passaggi: a_{\rm cal}=2\,\mathrm V^{-1};  b=1;  V_{1,C}=8\,\mathrm V;  C_{1,C}=1\,\mu\mathrm F.

Distrattori: 14/17 μF omette l’offset e usa V₁=17/2 V: ricostruisce D=18. Due μF dà D=13, quattro dà D=9, otto dà D=29/5. La capacità cercata deve restare positiva.

Hint: Sottrai b prima di dividere per a_cal, poi controlla V₁<E.

Fonte canonica SHA256 8141f78f1c97514f9d35c3caa0995d6adb0f51f2e3c31b499d33e8f60e7bc05c. Candidato SHA256 75c4bce9223ae905ed9f74c8b68e2d04d239ad40ad5df5cd4cef42aa7a9f4d2f. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitor-voltage-16 — La caduta non fissa la scala

Due condensatori lineari ideali, C₁>0 e C₂>0 finiti, sono inizialmente scarichi e collegati in serie fra A e B a un generatore ideale E=12 V. C₁ è fra A e M, C₂ fra M e B. Il nodo M non riceve carica dall’esterno e conserva carica netta zero. A regime le armature dei due condensatori hanno lo stesso modulo Q. Si cerca V₁=V_A−V_M, la caduta positiva sul primo condensatore; la somma delle due cadute è E e 0<V₁<E. Le capacità restano costanti entro ciascuna preparazione. Fra preparazioni vale C₁=C₂. Si misura inoltre V₁=6 V. Quante coppie positive (C₁,C₂) sono determinate?

Procedimento d’autore: Con C₁=C₂=x>0 finito, la frazione C₂/(C₁+C₂) diventa 1/2: V₁=6 V per ogni x. La misura della sola caduta è ridondante e lascia infinite coppie uguali positive. La carica comune cambierebbe con x e fornirebbe una nuova informazione, ma non è misurata.

Passaggi: C_1=C_2; C_2=x;  V_1=E\frac{x}{2x};  V_1=\frac E2;  V_1=6\,\mathrm V.

Distrattori: Le coppie singole sono esempi e non soluzioni uniche. Nessuna è smentita da esempi espliciti. Non qualsiasi coppia positiva è ammessa: deve valere C₁=C₂.

Hint: Sostituisci il vincolo e verifica se resta una capacità libera.

Fonte canonica SHA256 70969fb7468c2f8079eec69f276ffcb4217799f1cd050da08730b75da8652f28. Candidato SHA256 ee7d46f5ed235a3ca528028fb795a53addf01262c6b5586742dd609e684f4b6f. Revisione indipendente e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 798a357186e2333050c2f93de86ed8b8c245304253a3cd2dab50859ea50b7adb. Package file SHA256 0f74b434aa56f9e3fe6486420aecf373206bf7e1475429bda263eb218aafc7b5. Binding file SHA256 09a3be00490461a80321bb1866c4aa2a7e603eee77830875697ed7aaf95ef06b. Prova strutturale SHA256 dab321f543788c535f1db887dda1de7b9e9f456ed64e47d84a2b3aa4d0bdff90. Manifest asset-only SHA256 72ba2b3b07cbabd169f94b4f613425d1a24129c0c7891bae3c1317923c582699.

Nessun runtime, registry, ledger, checkpoint, candidato o Git ROOT modificato. Revisore distinto B assegnato; le sue derivazioni non sono state aperte dall’autore.

## Lettura geometrica d’autore

XML e PNG completo640×1540 realmente letti. La prima topologia ha un solo nodo intermedio neutro, due condensatori in serie e parentesi di caduta A–M e M–B: le etichette V₁ e V₂ identificano rispettivamente V_A−V_M e V_M−V_B, non frecce del campo. Nel secondo pannello le barre impilate180+180 e240+120 rappresentano6+6 e8+4 V, scala30 coordinate/V e somma12 V comune. Il terzo pannello ha altre prove dichiarate: barre240/120/180 per6/3/9/2 V, origine150 e scala40 coordinate/V, diversa da quella centrale come chiarito nelle caption. Zero118 libero, nessuna etichetta attraversata da assi o piastre. Nessuna UI del prodotto o giudizio scientifico autonomo.
