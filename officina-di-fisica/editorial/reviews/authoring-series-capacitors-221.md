# Authoring DRAFT — series-capacitors-221

Letti individualmente tutti gli 80 prompt originali assegnati A220–224 prima di scrivere il primo candidato. Fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U6-04 SHA256 179bf1cacfb83482e32bb41e99cb78296990faafba1fe9ce3b0e3cbc3a6a09cf. Compiti e ID conservati, incluse eccezioni: 22006 polarità opposte e transitorio esaurito; 22106 capacità delle due topologie, senza falsa conservazione di una commutazione. Rilette integralmente le lezioni reali C4-L07 e C4-L08: L07 definisce il singolo condensatore e resta prerequisito; L08 tratta reti, tensioni in serie, carica dei nodi e dissipazione nella condivisione ed è la competenza primaria corretta dei presenti quesiti. Prerequisiti reali C4-L01/L03/L04/L07/L08 e C1-L001. Nessuna nuova lezione inventata.

Prima di candidature U604 entrambi i revisori avevano congelato la propria primaria: B per A220–224 SHA08e1a184ade8bd85a9d6d8f4b919b18105877f0c2007729ba514f0f48f36eb58 (non aperta dall’autore); A per B225–229 SHA1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a, lettura solo allowlist id/prompt senza opzioni o chiavi altrui.

Autore soltanto: DRAFT, revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica. Due processi separati dell’assembler unico producono byte identici. L’import positivo 16→0/16 con 991 pubblicati invariati appartiene alla precedente edizione, preservata in archivio. Per i presenti byte con nuova mappatura, import PENDING_ROOT_REMOTE; non si trasferisce il precedente esito.

Figura realmente prodotta nel browser soltanto come SVG inline a piena altezza, sotto mutex e guardia ≥2 GiB, processo terminale exit0. XML integrale e PNG intero sono stati letti; dimensioni e bounding box esatti nel manifest. Nessuna pagina dell’app aperta, nessun marker di UI prodotto creato o riusato. UI prodotto e layout a 320px NOT_RUN; collaudo canonico riservato all’integratore. I testi visibili usano grandezze fisiche, non metriche dell’implementazione.

## AR-u6-series-capacitors-01 — La tensione totale si ripartisce

Due condensatori lineari ideali, di capacità finite positive C₁ e C₂, sono inizialmente scarichi e poi collegati in serie fra A e B. Il nodo intermedio M non è collegato ad altri corpi e conserva carica netta iniziale zero. Si considera lo stato elettrostatico finale con V=V_A−V_B>0. Q è il modulo di carica su ciascuna armatura; S è la capacità equivalente definita da Q=SV. Con C₁=C₂=2 μF, quanto vale S in μF?

Procedimento d’autore: La neutralità di M impone cariche opposte e di uguale modulo sulle due armature interne. Quindi i due condensatori hanno lo stesso Q in modulo. Le cadute sono Q/C₁ e Q/C₂; sommandole si ottiene V=Q(1/C₁+1/C₂). Con due capacità da 2 μF, la somma dei reciproci è 1 μF⁻¹ e S=1 μF.

Passaggi: V=\frac Q{C_1}+\frac Q{C_2};  \frac1S=\frac1{C_1}+\frac1{C_2};  S=1\,\mu\mathrm F.

Distrattori: Quattro μF è la somma del parallelo. Due μF ignora un condensatore; mezzo μF divide ancora per due. L’equivalente della serie deve essere minore di ciascuna delle capacità positive finite.

Hint: Somma le tensioni corrispondenti allo stesso modulo Q.

Fonte canonica SHA256 3db2cd687e76a6fc1db504bd1b37b303a4c7f73c8fd3c7d82c2bec82c9cf1b5d. Candidato SHA256 43ee951192c05a616cab2266456e14306271ea319decef0dc5ae7d2c93b2dd6f. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitors-02 — Reciproci con la loro unità

Due condensatori lineari ideali, di capacità finite positive C₁ e C₂, sono inizialmente scarichi e poi collegati in serie fra A e B. Il nodo intermedio M non è collegato ad altri corpi e conserva carica netta iniziale zero. Si considera lo stato elettrostatico finale con V=V_A−V_B>0. Q è il modulo di carica su ciascuna armatura; S è la capacità equivalente definita da Q=SV. Quale unità esprime S?

Procedimento d’autore: S collega una carica a una tensione e si misura in farad. La somma 1/C₁+1/C₂ ha unità F⁻¹: bisogna prenderne il reciproco per ottenere S. Non si cambia unità della capacità perché si è cambiata la topologia.

Passaggi: [1/S]=\mathrm F^{-1};  [S]=\mathrm F.

Distrattori: F⁻¹ è l’unità del reciproco, non di S. C indica carica, V tensione e 1 un rapporto puro. I prefissi come μ conservano la dimensione fisica del farad.

Hint: Controlla se stai leggendo S oppure 1/S.

Fonte canonica SHA256 d5d0cf304b5fcaf871d60554dd5e2c17fc59eabf924820631bfe30a815636914. Candidato SHA256 5746b386164862e75fa29a7130807c4331be8f3c804771941834f4e5d03e3a53. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitors-03 — Il vincolo del nodo neutro

Due condensatori lineari ideali, di capacità finite positive C₁ e C₂, sono inizialmente scarichi e poi collegati in serie fra A e B. Il nodo intermedio M non è collegato ad altri corpi e conserva carica netta iniziale zero. Si considera lo stato elettrostatico finale con V=V_A−V_B>0. Q è il modulo di carica su ciascuna armatura; S è la capacità equivalente definita da Q=SV. Quale grandezza ha lo stesso modulo nei due condensatori a regime?

Procedimento d’autore: Il nodo M comprende una piastra di ciascun condensatore e non riceve carica dall’esterno. Poiché era neutro, le due cariche su M devono sommarsi a zero: sono −Q e +Q. Ne segue uguale modulo sulle armature dei due condensatori. Le tensioni Q/C dipendono invece dalla rispettiva capacità.

Passaggi: Q_M=-Q_1+Q_2;  Q_M=0;  Q_1=Q_2.

Distrattori: Tensioni ed energie coincidono soltanto in casi particolari, come capacità uguali, non per ogni serie. La connessione non rende identiche C₁ e C₂. Una corrente continua di conduzione non nulla è impossibile attraverso un dielettrico ideale nello stato elettrostatico finale.

Hint: Usa la carica netta conservata sul nodo intermedio.

Fonte canonica SHA256 97200b3e5b73ac7d2a3bb7d5b0a1bddaa47306e5bd5628f1bc867527ca92b8f5. Candidato SHA256 38fd11f69cc1eb778e95bd7efbc20cea1e34244e68adea87d5e4dc2360e1808d. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitors-04 — Una capacità si dimezza

Due condensatori lineari ideali, di capacità finite positive C₁ e C₂, sono inizialmente scarichi e poi collegati in serie fra A e B. Il nodo intermedio M non è collegato ad altri corpi e conserva carica netta iniziale zero. Si considera lo stato elettrostatico finale con V=V_A−V_B>0. Q è il modulo di carica su ciascuna armatura; S è la capacità equivalente definita da Q=SV. C₁ passa da 2 a 1 μF mentre C₂ resta 2 μF. Come cambia S?

Procedimento d’autore: Prima la serie di 2 e 2 μF dà S_A=1 μF. Dopo il prodotto è 2 μF² e la somma 3 μF, dunque S_B=2/3 μF. La capacità diminuisce, ma non si dimezza perché cambia anche la somma al denominatore.

Passaggi: S=\frac{C_1C_2}{C_1+C_2};  S_B=\frac23\,\mu\mathrm F.

Distrattori: Mezzo μF segue soltanto il fattore di C₁ senza il denominatore. Tre μF è il parallelo nuovo; uno ignora il cambio e due copia C₂. Il risultato deve restare minore del componente da 1 μF.

Hint: Aggiorna sia il prodotto sia la somma.

Fonte canonica SHA256 9764c0ea057206372ab5cddee83028d860125f2cd3c696539fd6ae45863102a5. Candidato SHA256 9258afce3d66a611fe8488f02e3ce787662edebc510bb818aee74ef0c1960c0d. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitors-05 — L’inversa con denominatore positivo

Due condensatori lineari ideali, di capacità finite positive C₁ e C₂, sono inizialmente scarichi e poi collegati in serie fra A e B. Il nodo intermedio M non è collegato ad altri corpi e conserva carica netta iniziale zero. Si considera lo stato elettrostatico finale con V=V_A−V_B>0. Q è il modulo di carica su ciascuna armatura; S è la capacità equivalente definita da Q=SV. Si misura S=1 μF e si conosce C₂=2 μF. Quanto vale C₁ in μF?

Procedimento d’autore: Moltiplico S=C₁C₂/(C₁+C₂) per la somma e raccolgo C₁: SC₂=C₁(C₂−S). Quindi C₁=SC₂/(C₂−S). I dati danno (1·2)/(2−1) μF=2 μF. Il divisore è positivo perché S<C₂.

Passaggi: SC_2=C_1(C_2-S);  C_1=\frac{SC_2}{C_2-S};  C_1=2\,\mu\mathrm F.

Distrattori: Sottrarre semplicemente il noto dà un valore negativo: sarebbe l’inversa di una somma, non della serie. Un μF ricopia S e con C₂=2 μF darebbe 2/3 μF. Il confine S=C₂ non ammette un C₁ finito positivo.

Hint: Sottrai le capacità nel denominatore e controlla S<C₂.

Fonte canonica SHA256 459babd1117c4b0d1e3a3df82e3a3782536dfd48144d19c410c0cc3fe9db7bfb. Candidato SHA256 d743225d899d0ccdf3872725c654684ebaf1b46b7952aa3f6e97926bcc415952. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitors-06 — Stessi componenti, altra topologia

Caso autonomo: due condensatori lineari identici da 2 μF sono misurati prima come collegamento in serie, con nodo intermedio inizialmente neutro, e poi come collegamento in parallelo fra due nodi comuni. Si confrontano soltanto le capacità equivalenti delle due configurazioni. Non si impone conservazione di tensione o carica durante un esperimento di commutazione. Quanto vale C_parallelo/C_serie?

Procedimento d’autore: La serie di due capacità uguali C vale C/2, quindi 1 μF; il parallelo vale 2C, quindi 4 μF. Il rapporto fra i due coefficienti Q/V è quattro. Non è il rapporto delle cariche di una stessa commutazione, che richiederebbe ulteriori condizioni iniziali.

Passaggi: C_{\rm serie}=1\,\mu\mathrm F;  C_{\rm parallelo}=4\,\mu\mathrm F;  \frac{C_{\rm parallelo}}{C_{\rm serie}}=4.

Distrattori: Due confronta 2C con C e ignora il dimezzamento della serie. 1/4 è il reciproco, mezzo segue il solo dimezzamento e uno presume che i componenti fissino l’equivalente indipendentemente dai collegamenti.

Hint: Calcola separatamente C/2 e 2C, poi forma il rapporto.

Fonte canonica SHA256 5dd49b3bfd04f05f727c3b2ef994fa82e3f06ee7e8577ebd4b6a93cc43e04f82. Candidato SHA256 01b4c95c8ac09d8a5f4388c2b428ca10a222cd4897ae91def3f017fd04e4747e. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitors-07 — Cambia soltanto C₂

Due condensatori lineari ideali, di capacità finite positive C₁ e C₂, sono inizialmente scarichi e poi collegati in serie fra A e B. Il nodo intermedio M non è collegato ad altri corpi e conserva carica netta iniziale zero. Si considera lo stato elettrostatico finale con V=V_A−V_B>0. Q è il modulo di carica su ciascuna armatura; S è la capacità equivalente definita da Q=SV. A ha C₁=C₂=2 μF. B mantiene C₁=2 μF e usa C₂=1 μF. Quanto vale S_B/S_A?

Procedimento d’autore: A ha S_A=1 μF. B ha S_B=(2·1)/(2+1) μF=2/3 μF. Il rapporto è 2/3. La simmetria della legge scambia i nomi dei componenti, ma non trasforma la serie in una dipendenza lineare da uno solo di essi.

Passaggi: S_A=1\,\mu\mathrm F;  S_B=\frac23\,\mu\mathrm F;  S_B/S_A=\frac23.

Distrattori: 3/2 inverte il confronto. Mezzo segue C₂ da sola, due rende diretto il suo reciproco e uno non modifica l’uscita. Nessuno tiene insieme prodotto e somma nuovi.

Hint: Usa la legge della serie in ciascuna preparazione.

Fonte canonica SHA256 a2610ee4a4f52d97e07ce90e90487d2137e72344411c31836c46771835ca734e. Candidato SHA256 5ce5af546e71b968384e588275567af40749c9b4b14907d958250652f13f514d. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitors-08 — Uno scarto di capacità

Due condensatori lineari ideali, di capacità finite positive C₁ e C₂, sono inizialmente scarichi e poi collegati in serie fra A e B. Il nodo intermedio M non è collegato ad altri corpi e conserva carica netta iniziale zero. Si considera lo stato elettrostatico finale con V=V_A−V_B>0. Q è il modulo di carica su ciascuna armatura; S è la capacità equivalente definita da Q=SV. Con C₁=C₂=2 μF si propone S=2 μF. Quanto vale proposta meno corretto?

Procedimento d’autore: L’equivalente corretto è 1 μF. La proposta supera il corretto di 2−1=1 μF. La proposta stessa coincide con un singolo componente e non con la serie dei due.

Passaggi: S=1\,\mu\mathrm F;  e=(2-1)\,\mu\mathrm F;  e=1\,\mu\mathrm F.

Distrattori: −1 scambia l’ordine; 2 μF copia la proposta; zero la accetta. Il numero puro due è il rapporto e non una differenza di capacità.

Hint: Non confondere l’unità dello scarto con quella di un rapporto.

Fonte canonica SHA256 6decd642e5c355ce5780836728081a7f1d6dfc3d8e60c81029878b505780a032. Candidato SHA256 89aec401d5aba53562c99c298ec48bb74f2a35e1eefb45e8e227e71e99231d54. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitors-09 — La formula inversa generale

Due condensatori lineari ideali, di capacità finite positive C₁ e C₂, sono inizialmente scarichi e poi collegati in serie fra A e B. Il nodo intermedio M non è collegato ad altri corpi e conserva carica netta iniziale zero. Si considera lo stato elettrostatico finale con V=V_A−V_B>0. Q è il modulo di carica su ciascuna armatura; S è la capacità equivalente definita da Q=SV. S e C₂ sono noti, con 0<S<C₂. Quale relazione isola C₁?

Procedimento d’autore: Dalla somma delle tensioni segue SC₁+SC₂=C₁C₂. Raccogliendo i termini della capacità ignota si trova SC₂=C₁(C₂−S). Dividendo per C₂−S>0 segue C₁=SC₂/(C₂−S); F²/F restituisce F.

Passaggi: SC_2=C_1(C_2-S);  C_1=\frac{SC_2}{C_2-S}.

Distrattori: Il più al denominatore non deriva dal raccoglimento. S−C₂ rende negativo il risultato nel dominio; la semplice differenza è l’inversa del parallelo. C₂/S è puro e non una capacità.

Hint: Porta il termine SC₁ dallo stesso lato di C₁C₂.

Fonte canonica SHA256 b2dbfe3c90453b6690210f6c60337cc60fdeb8c24e5cbf7d23b933765444ca85. Candidato SHA256 d08e3f73893c34b02a7a83200926fd3e4c555850b30f05d46bf8901ffbcf5bf5. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitors-10 — Scalare entrambi i condensatori

Due condensatori lineari ideali, di capacità finite positive C₁ e C₂, sono inizialmente scarichi e poi collegati in serie fra A e B. Il nodo intermedio M non è collegato ad altri corpi e conserva carica netta iniziale zero. Si considera lo stato elettrostatico finale con V=V_A−V_B>0. Q è il modulo di carica su ciascuna armatura; S è la capacità equivalente definita da Q=SV. B usa C₁,B=κ₁C₁ e C₂,B=κ₂C₂. Definiamo T=C₁+C₂ e T_B=κ₁C₁+κ₂C₂. I fattori sono positivi. Quanto vale S_B/S_A?

Procedimento d’autore: Il prodotto C₁C₂ riceve entrambi i fattori; il denominatore diventa T_B. Dividendo la legge nuova per quella vecchia compare anche T al numeratore. Il rapporto è κ₁κ₂T/T_B. Con una scalatura comune κ si ottiene κ, come richiesto dall’omogeneità di una capacità equivalente.

Passaggi: S_A=\frac{C_1C_2}{T};  S_B=\frac{\kappa_1\kappa_2C_1C_2}{T_B};  \frac{S_B}{S_A}=\frac{\kappa_1\kappa_2T}{T_B}.

Distrattori: Il solo prodotto perde la variazione del denominatore. κ₁/κ₂ perde i pesi delle capacità; T_B/T descrive una somma di parallelo. L’ultima espressione è il reciproco del rapporto corretto.

Hint: Conserva il fattore della somma oltre a quelli del prodotto.

Fonte canonica SHA256 ddfdc0f0aea6de506bbcdfc4b547da26df4f5458a6fcf988f560de4cb241b8a6. Candidato SHA256 1e9dedfa266b908747704798b2ffe5eb173c12b186cd8ef3bdcab42b2a89263d. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitors-11 — Una nuova coppia in serie

Due condensatori lineari ideali, di capacità finite positive C₁ e C₂, sono inizialmente scarichi e poi collegati in serie fra A e B. Il nodo intermedio M non è collegato ad altri corpi e conserva carica netta iniziale zero. Si considera lo stato elettrostatico finale con V=V_A−V_B>0. Q è il modulo di carica su ciascuna armatura; S è la capacità equivalente definita da Q=SV. A ha C₁=C₂=2 μF. B ha C₁=3 μF e C₂=6 μF. Quanto vale S_B/S_A?

Procedimento d’autore: A dà 1 μF. B dà (3·6)/(3+6) μF=18/9 μF=2 μF. Quindi il rapporto è due. Anche B ha equivalente minore del più piccolo componente da 3 μF.

Passaggi: S_A=1\,\mu\mathrm F;  S_B=2\,\mu\mathrm F;  S_B/S_A=2.

Distrattori: Mezzo è il reciproco; 3/2 segue il solo C₁ e tre il solo C₂. 9/4 è il rapporto delle somme e appartiene alla topologia parallela, non a questa serie.

Hint: Controlla il risultato rispetto alla capacità più piccola.

Fonte canonica SHA256 c913dc5e1ee1ccac35b62714eec2952367440c806999c7ef544fef928c3c3a02. Candidato SHA256 43894c4f1924ef31506f9b71692012ffd139ffda8704dd7358fad76cca75bef0. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitors-12 — Le medie non commutano con la serie

Due condensatori lineari ideali, di capacità finite positive C₁ e C₂, sono inizialmente scarichi e poi collegati in serie fra A e B. Il nodo intermedio M non è collegato ad altri corpi e conserva carica netta iniziale zero. Si considera lo stato elettrostatico finale con V=V_A−V_B>0. Q è il modulo di carica su ciascuna armatura; S è la capacità equivalente definita da Q=SV. A usa 2 e 2 μF; B usa 3 e 6 μF. Qual è la media aritmetica delle due S con uguale peso?

Procedimento d’autore: Le uscite sono 1 e 2 μF, quindi la media vale 3/2 μF. Ai dati medi C₁=5/2 μF e C₂=4 μF si otterrebbe invece 10/(13/2) μF=20/13 μF. Con denominatore comune 26, i risultati sono 39/26 e 40/26 μF: differiscono di 1/26 μF senza bisogno di decimali.

Passaggi: \overline S=\frac32\,\mu\mathrm F;  S_{\rm dati\ medi}=\frac{20}{13}\,\mu\mathrm F;  \frac{20}{13}-\frac32=\frac1{26}.

Distrattori: 20/13 μF usa gli ingressi medi anziché le uscite. Tre somma, mezzo è metà della differenza e due ripete B. La capacità di una rete costruita con dati medi non è la media statistica delle capacità di due reti.

Hint: Completa ogni calcolo di serie prima della media.

Fonte canonica SHA256 4f1c85059537ecf956bcf99558417680be62c0b4ea9f1191908e67ba23eb17fe. Candidato SHA256 93e9a5de3525cb2cbaf59b25f87546ee521d2b89a7f49bcce76d1957b9094efa. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitors-13 — C₂ per raddoppiare S

Due condensatori lineari ideali, di capacità finite positive C₁ e C₂, sono inizialmente scarichi e poi collegati in serie fra A e B. Il nodo intermedio M non è collegato ad altri corpi e conserva carica netta iniziale zero. Si considera lo stato elettrostatico finale con V=V_A−V_B>0. Q è il modulo di carica su ciascuna armatura; S è la capacità equivalente definita da Q=SV. A ha C₁=C₂=2 μF. B usa C₁=3 μF e deve dare S_B=2S_A. Quanto vale C₂,B/C₂,A?

Procedimento d’autore: Il bersaglio S_B=2 μF è minore del C₁,B da 3 μF, quindi l’inversa passiva esiste. C₂,B=S_BC₁,B/(C₁,B−S_B)=6/(3−2) μF=6 μF. Il rapporto con C₂,A=2 μF è tre.

Passaggi: S_B=2\,\mu\mathrm F;  C_{2,B}=6\,\mu\mathrm F;  \frac{C_{2,B}}{C_{2,A}}=3.

Distrattori: 1/3 inverte il confronto, due copia il rapporto degli equivalenti, 3/2 segue C₁. Sei copia il valore numerico di C₂,B in μF senza dividerlo per C₂,A=2 μF.

Hint: Fissa il bersaglio e usa l’inversa nell’altro componente.

Fonte canonica SHA256 a69e43bb1db0300e87d4fb0c071018b4813b2ffc3f942ca697c2fda5a56ba18b. Candidato SHA256 52e7ef46286aafb3c05778282b035e5f4e543e853a33bb87acbd4fd38abd9c6d. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitors-14 — Display proporzionale della serie

Due condensatori lineari ideali, di capacità finite positive C₁ e C₂, sono inizialmente scarichi e poi collegati in serie fra A e B. Il nodo intermedio M non è collegato ad altri corpi e conserva carica netta iniziale zero. Si considera lo stato elettrostatico finale con V=V_A−V_B>0. Q è il modulo di carica su ciascuna armatura; S è la capacità equivalente definita da Q=SV. D=a_cal S è continuo e adimensionale, senza offset. A con C₁=C₂=2 μF dà D=3. B legge D=6 e ha C₂=6 μF. Quanto vale C₁,B in μF?

Procedimento d’autore: Il riferimento ha S_A=1 μF, dunque a_cal=3 μF⁻¹. Lettura 6 indica S_B=2 μF. L’inversa dà C₁,B=(2·6)/(6−2) μF=3 μF. Usare direttamente D come capacità darebbe il confine S=C₂, non una capacità finita.

Passaggi: a_{\rm cal}=3\,(\mu\mathrm F)^{-1};  S_B=2\,\mu\mathrm F;  C_{1,B}=3\,\mu\mathrm F.

Distrattori: Due μF copia l’equivalente e produrrebbe S=3/2 μF. Sei μF dà S=3 μF e D=9. Un valore ottenuto dividendo per zero non è un’ulteriore soluzione fisica.

Hint: Rimuovi il guadagno e controlla che S sia minore del componente noto.

Fonte canonica SHA256 73d1788cb7b4757bce514b098f08f9353337b433edb902631dd1f69d9100b967. Candidato SHA256 e62738ef1eff16bf05864147b33fce9bcb8f6585b0e5c4b170e675cf3972e849. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitors-15 — Offset e inversa della capacità

Due condensatori lineari ideali, di capacità finite positive C₁ e C₂, sono inizialmente scarichi e poi collegati in serie fra A e B. Il nodo intermedio M non è collegato ad altri corpi e conserva carica netta iniziale zero. Si considera lo stato elettrostatico finale con V=V_A−V_B>0. Q è il modulo di carica su ciascuna armatura; S è la capacità equivalente definita da Q=SV. D=a_cal S+b è continuo. A: C₁=C₂=2 μF, D=3. B: C₁=3 μF, C₂=6 μF, D=5. C: C₂=1 μF, D=2. Quanto vale C₁,C?

Procedimento d’autore: I riferimenti hanno S_A=1 e S_B=2 μF. Il guadagno è 2 μF⁻¹ e l’offset 1. Lettura 2 restituisce S_C=1/2 μF, strettamente minore di C₂=1 μF. Quindi C₁,C=[(1/2)·1]/[1−1/2] μF=1 μF.

Passaggi: a_{\rm cal}=2\,(\mu\mathrm F)^{-1};  b=1;  S_C=\frac12\,\mu\mathrm F;  C_{1,C}=1\,\mu\mathrm F.

Distrattori: Mezzo μF copia S e darebbe equivalente 1/3 μF. Due μF dà S=2/3 μF e D=7/3; tre μF dà S=3/4 μF e D=5/2. Una soluzione positiva esiste; omettere l’offset porterebbe erroneamente al confine S=C₂.

Hint: Controlla il dominio dopo aver decodificato la lettura.

Fonte canonica SHA256 3b5bebca3f5ec15c9e59dd48c239852b61dc4eca818983ebd8346d45eb3278b4. Candidato SHA256 4a724e502cbd1f403602f72e3258af069d7911d875765c4e97df83f54a82e172. Revisione indipendente e human NOT_RUN.

## AR-u6-series-capacitors-16 — Il vincolo dei componenti uguali

Due condensatori lineari ideali, di capacità finite positive C₁ e C₂, sono inizialmente scarichi e poi collegati in serie fra A e B. Il nodo intermedio M non è collegato ad altri corpi e conserva carica netta iniziale zero. Si considera lo stato elettrostatico finale con V=V_A−V_B>0. Q è il modulo di carica su ciascuna armatura; S è la capacità equivalente definita da Q=SV. Fra preparazioni C₁=C₂. Si misura S=1 μF. Quanto vale C₂?

Procedimento d’autore: Con capacità comune x>0, la legge di serie dà S=x²/(2x)=x/2. La misura fissa x=2S=2 μF. Il rapporto C₁/C₂=1 da solo lascia una scala libera; la capacità equivalente misurata la determina.

Passaggi: C_1=C_2; C_2=x;  S=\frac x2;  x=2S;  C_2=2\,\mu\mathrm F.

Distrattori: Uno μF copia S e darebbe mezzo μF. Mezzo μF divide invece di moltiplicare per due. Il valore negativo non è ammesso; infinite soluzioni ignorerebbe la misura assoluta dell’equivalente.

Hint: Semplifica la serie di due componenti uguali prima di invertire.

Fonte canonica SHA256 3a2e17971ad4cea1562150af11424e99abb12af6bcb89acb840ae6e03c4a4e14. Candidato SHA256 1d0ce2929729d42f6a152ca3c4aab2b25b3e3829c457b13698298778b6387c18. Revisione indipendente e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 33063149547cd4a33e74926c4d177dbcd3d68ba37fcaa93f089016a9e245f5b6. Package file SHA256 4771baf9f46b7982f871c4dc5600db1cfee4f603e601df6a1cfcfb591678a72e. Binding file SHA256 06fa0a8a513ed618fa2253dd0a02b911a1a4d7a6b44fb852b27ced85cb8294b0. Prova strutturale SHA256 78b2cc4567f9e540c2a3e48ba3017aac9266ee9a0400055cdc7c57cca0bce245. Manifest asset-only SHA256 d081db0ba9a39f29b6457f77ed21f9b8144c6d3e98aec7eda73e04551a8d5913.

Nessun runtime, registry, ledger, checkpoint, candidato o Git ROOT modificato. Revisore distinto B assegnato; le sue derivazioni non sono state aperte dall’autore.

## Rilettura del finding distinto03

Il revisore B ha rilevato che la corrente di conduzione, nulla in entrambi i dielettrici ideali, rendeva vera anche l’alternativa non qualificata. Soltanto quell’opzione richiede ora una corrente non nulla e il feedback la confuta esplicitamente. Chiave carica comune, tutte le leggi, altri15 record e SVG sono byte-identici. Vecchia edizione e native conservati con checksum nella cartella peer-choice03-superseded. Due nuove assembly/import reali; stesso SVG e stesso PNG nativo già letto, nessun rerender o marker prodotto inventato. Revisione scientifica distinta della nuova edizione e UI prodotto NOT_RUN.

## Correzione di mappatura didattica dopo review distinta

La lezione originale C4-L08 «Mettere insieme i condensatori», riletta nel pin Cric5d1d, è il riferimento primario per questa famiglia. Aggiornati soltanto skill, error.target e aggiunta della competenza esistente L08 ai prerequisiti, conservando L07. Ogni altro campo dei sedici record, tutte le formule e le scelte e ogni byte SVG sono identici per confronto strutturale. Due nuove assembly effettive exit0 e identiche; nessun nuovo render necessario per asset immutato. I precedenti import/report SCI sono conservati nell’archivio con checksum e restano storici sulle vecchie firme. Import finale PENDING_ROOT_REMOTE; nessun nuovo DB locale, come autorizzato dall’integratore. Revisione scientifica distinta delle nuove associazioni e human NOT_RUN, DRAFT e publicationAction NONE.
