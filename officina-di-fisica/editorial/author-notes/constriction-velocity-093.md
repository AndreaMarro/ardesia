# constriction-velocity-093 — note dell’autore

Fonte5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U3-02.json. Tutti80 originali089–093 letti prima dell’authoring, con varianti dimensionali02 e profilo09103 separatamente. ID effettivi confermati; stesso assembler canonico courseC2/unitu3 e competenze esistenti rilette nel catalogo C2.

DRAFT; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN. Nessun verificatore o firma scientifica dell’autore. Note di calcolo per il revisore separato.

Continuità da conservazione della massa in tubo senza rami/perdite e regime stazionario; incomprimibilità permetteQ1=Q2. Media normale v1=2cm/s, non velocità assiale massima. Aree positive, non raggi. Ogni prova può cambiare tubo/pompa, ma v1 è mantenuta; non si dichiara la stessaQfra apparati diversi.16A1=2A2 rendev2=4cm/s ridondante, infinite coppie. Non si deduce Bernoulli o pressione dalla sola continuità.

SVG XML e rendering nativo completo letti dall’autore. Ogni grandezza ha la propria scala esplicita; vettori su path separati con marker-end, origini e riferimenti indicati. Le formule sono scomposte con il helper law_steps esistente; nessun CSS o renderer modificato.

## 01 — La velocità media nel tratto stretto

La massa che entra deve uscire e, poiché la densità è la stessa, anche i volumi per secondo coincidono. L’ingresso fornisce Q=4·2=8 cm³/s; attraverso una sezione di2 cm² quella portata richiede v₂=4 cm/s. Il volume non scompare nel restringimento.

Passaggi: `A_1v_1=A_2v_2\qquad Q=8\,\mathrm{cm^3/s}\qquad v_2=Q/A_2\qquad v_2=4\,\mathrm{cm/s}`

Errori e controllo: Mantenere v₂=2 cm/s farebbe uscire soltanto4 cm³/s, incompatibile con l’assenza di accumulo. Il bilancio deriva dalla conservazione della massa; per ricavare pressioni occorrerebbero anche dati e ipotesi energetiche.

## 02 — Un rapporto di aree per una velocità

Nella relazione v₂=v₁A₁/A₂ il rapporto delle aree è adimensionale, così l’unità resta quella di v₁. Usare cm² per entrambe le aree permette di cancellarle senza fattori di conversione.

Passaggi: `v_2=v_1\frac{A_1}{A_2}\qquad [v_2]=L/T\qquad \mathrm{cm/s}\cdot\frac{\mathrm{cm^2}}{\mathrm{cm^2}}=\mathrm{cm/s}`

Errori e controllo: cm³/s è portata volumetrica, cm² area, s/cm velocità inversa e kg/s portata massica. Un’area moltiplicata per una velocità sarebbe Q, non v₂.

## 03 — La continuità prima dell’energia

Un volume di controllo fra le sezioni non accumula massa nel tempo. L’equazione è ρA₁v₁=ρA₂v₂; la densità comune positiva si cancella. Dividendo per A₂ ricaviamo la velocità media richiesta. La viscosità non invalida la conservazione della massa.

Passaggi: `\rho A_1v_1=\rho A_2v_2\qquad A_1v_1=A_2v_2\qquad v_2=\frac{v_1A_1}{A_2}`

Errori e controllo: Invertire le aree renderebbe più lento il flusso stretto aQ uguale. Il prodotto delle aree altera le dimensioni; il doppio conta due volte v₁ e l’uguaglianza delle velocità vale soltanto se le aree sono uguali. Nulla qui determina il salto di pressione.

## 04 — Ridurre l’area di ingresso a velocità fissata

Con v₁ mantenuta, una sezione d’ingresso minore fornisce meno volume al secondo: Q passa da8 a6 cm³/s. Nella seconda sezione fissa da2 cm², la media scende da4 a3 cm/s. La continuità impone ugualeQ entro ciascuna prova, non fra apparati con ingressi diversi.

Passaggi: `Q_A=8\,\mathrm{cm^3/s}\qquad Q_B=6\,\mathrm{cm^3/s}\qquad v_{2,B}=6/2\,\mathrm{cm/s}\qquad v_{2,B}=3\,\mathrm{cm/s}`

Errori e controllo: 16/3 usa l’inverso del fattore3/4;quattro manterrebbe unaQ fra prove non assegnata. Sei è il numero della portata B, non della velocità; zero è escluso dagli ingressi positivi.

## 05 — L’area di ingresso da una velocità a valle

La seconda sezione trasporta4·2=8 cm³/s. Il suo stesso volume deve entrare con v₁=2 cm/s, quindi l’area iniziale vale8/2=4 cm². L’inversa conserva l’unità del dato di area.

Passaggi: `A_1=\frac{A_2v_2}{v_1}\qquad A_1=\frac{(2\,\mathrm{cm^2})(4\,\mathrm{cm/s})}{2\,\mathrm{cm/s}}\qquad A_1=4\,\mathrm{cm^2}`

Errori e controllo: A₂v₁/v₂ invertirebbe il rapporto e darebbe1 cm², insufficiente per gli8 cm³/s richiesti. Le aree non sono raggi: non occorre elevarle al quadrato.

## 06 — La seconda area dal bilancio

L’ingresso fornisce sempre8 cm³/s. Una velocità media di4 cm/s richiede una sezione da2 cm²: A₂=Q/v₂. Poiché v₂ è doppia di v₁, l’area risulta metà di A₁.

Passaggi: `A_2=\frac{A_1v_1}{v_2}\qquad A_2=\frac{8\,\mathrm{cm^3/s}}{4\,\mathrm{cm/s}}\qquad A_2=2\,\mathrm{cm^2}`

Errori e controllo: Otto sarebbe il numero della portata, non dell’area. Un’area da8 cm² insieme a4 cm/s richiederebbe32 cm³/s e violerebbe il bilancio del tubo senza rami.

## 07 — Dimezzare soltanto l’area di uscita

L’ingresso è uguale nelle due prove, perciòQ rimane8 cm³/s. La sezione finale dimezzata richiede una media doppia: da4 a8 cm/s. La relazione inversa riguarda l’area, non il raggio.

Passaggi: `v_{2,A}=4\,\mathrm{cm/s}\qquad v_{2,B}=8\,\mathrm{cm/s}\qquad v_{2,B}/v_{2,A}=2`

Errori e controllo: Un mezzo ha il verso opposto;quattro tratterebbe la scalatura dell’area come se fosse quella del raggio. Otto è la velocità numerica di B, non il rapporto. Uno non trasferirebbe il volume imposto dall’ingresso.

## 08 — Una velocità a valle sovrastimata

La velocità corretta è4 cm/s. La proposta otto richiederebbe unaQ di16 cm³/s a valle contro gli8 cm³/s in ingresso. Lo scarto è+4 cm/s; il valore errato non può essere giustificato dalla sola presenza di un restringimento.

Passaggi: `v_2=4\,\mathrm{cm/s}\qquad e=(8-4)\,\mathrm{cm/s}\qquad e=4\,\mathrm{cm/s}`

Errori e controllo: −4 scambia l’ordine,otto ripete la proposta,zero la accetta e due dimezza lo scarto. La verifica Q₁=Q₂ individua l’errore anche prima di svolgere la sottrazione.

## 09 — L’inversa mantiene v₁ come grandezza

Moltiplichiamo v₂=v₁A₁/A₂ perA₂ e dividiamo perv₁>0. Mantenere esplicitamente v₁ evita di scrivere il numero2 senza la sua unità di velocità. Il rapporto v₂/v₁ è puro e moltiplica A₂.

Passaggi: `A_2v_2=A_1v_1\qquad A_1=\frac{A_2v_2}{v_1}\qquad v_1=2\,\mathrm{cm/s}`

Errori e controllo: Il rapporto invertito scambia l’effetto della velocità; v₂/v₁ da solo non è un’area. A₂v₂ è una portata e il doppio introduce un fattore non richiesto.

## 10 — Scalare le due aree con v₁ fissata

La prima area moltiplica la portata fornita dall’ingresso, mentre la seconda divide la velocità necessaria a trasportarla. Nel confronto fra apparati il dato v₁ comune si cancella: rimaneκ₁/κ₂. Si scalano aree già calcolate, non raggi.

Passaggi: `v_{2,B}=v_1\frac{\kappa_1A_{1,A}}{\kappa_2A_{2,A}}\qquad v_{2,B}/v_{2,A}=\kappa_1/\kappa_2`

Errori e controllo: Il prodotto attribuisce un effetto diretto all’area a valle;il rapporto inverso scambia gli apparati. Il quadrato diκ₁ conterebbe due volte una scalatura di area;la somma non vale uno per apparati identici.

## 11 — Ingresso minore e uscita ancora più piccola

La portata B diminuisce da8 a6 cm³/s, ma la seconda area si dimezza e prevale nel rapporto. La velocità B vale6 cm/s contro4 cm/s di A: il fattore è3/2. Una portata minore può quindi accompagnarsi a velocità locale media maggiore in una sezione più stretta.

Passaggi: `v_{2,A}=4\,\mathrm{cm/s}\qquad v_{2,B}=6\,\mathrm{cm/s}\qquad v_{2,B}/v_{2,A}=\frac32`

Errori e controllo: Due terzi è il reciproco;3/4 segue soltanto l’ingresso e due soltanto l’uscita. Sei è il numero della velocità di B, non il rapporto puro.

## 12 — La media di due velocità a valle

Le due velocità sono4 e6 cm/s. La loro media vale5 cm/s. Non si stanno sommando due rami di una rete e non si deve sostituire automaticamente al tubo una sezione media prima di risolvere ciascuna prova.

Passaggi: `\overline v_2=\frac{4+6}{2}\,\mathrm{cm/s}\qquad \overline v_2=5\,\mathrm{cm/s}`

Errori e controllo: Dieci è la somma,5/2 divide ancora e due è la differenza. Le aree medie A₁7/2 cm²,A₂3/2 cm² darebbero2·(7/2)/(3/2)=14/3 cm/s, diverso da5 di1/3: il quoziente non commuta con la media.

## 13 — L’uscita per una velocità bersaglio

La velocità bersaglio è6 cm/s. In B l’ingresso fornisceQ=3·2=6 cm³/s, perciò la seconda area deve essere1 cm². Il rapporto con2 cm² è1/2. Questa scelta realizza simultaneamente il nuovo ingresso e il bersaglio.

Passaggi: `v_{2,B}=6\,\mathrm{cm/s}\qquad Q_B=6\,\mathrm{cm^3/s}\qquad A_{2,B}=1\,\mathrm{cm^2}\qquad A_{2,B}/A_{2,A}=\frac12`

Errori e controllo: Due inverte il rapporto.3/2 segue la velocità invece dell’area inversa;3/4 seguirebbe solo la riduzione d’ingresso e darebbe ancora4 cm/s. Uno manterrebbev₂3 cm/s, sotto il bersaglio.

## 14 — Un display di velocità per ricavare l’ingresso

La velocità del riferimento è4 cm/s, quindiq=3 s/cm. La nuova lettura significa6 cm/s. A valle transitano6 cm³/s e, con ingresso a2 cm/s, l’area iniziale deve essere3 cm².

Passaggi: `q=3\,\mathrm{s/cm}\qquad v_{2,B}=6\,\mathrm{cm/s}\qquad A_{1,B}=\frac{A_{2,B}v_{2,B}}{v_1}\qquad A_{1,B}=3\,\mathrm{cm^2}`

Errori e controllo: UsareS18 come velocità darebbe9 cm² e triplicherebbe indebitamenteQ. Il rapporto delle letture vale il rapporto delle velocità soltanto dopo aver accertato offset nullo e stesso guadagno.

## 15 — L’offset nella velocità inferita

Le velocità di riferimento sono4 e6 cm/s. Dalla differenza delle letture troviamoq=2 s/cm e poi z=1. C ha velocità(7−1)/2=3 cm/s; il suoQ è2·3=6 cm³/s, da dividere perv₁=2 cm/s.

Passaggi: `q=2\,\mathrm{s/cm}\qquad z=1\qquad v_{2,C}=3\,\mathrm{cm/s}\qquad Q_C=6\,\mathrm{cm^3/s}\qquad A_{1,C}=3\,\mathrm{cm^2}`

Errori e controllo: ConA₂2 cm², le aree d’ingresso2,4,1,6 cm² produrrebberoS5,9,3,13. Solo3 dà7. Il rapporto delle letture grezze non cancella un offset diverso dazero.

## 16 — Una misura che non fissa la scala del tubo

Sostituendo nella continuità, v₂=v₁·2A₂/A₂=2v₁=4 cm/s per ogniA₂>0. La misura non aggiunge un’informazione indipendente al rapporto delle aree. Un tubo con aree4e2 cm² e uno con8e4 cm² hanno la stessa velocità, ma portate diverse.

Passaggi: `A_1=2A_2\qquad v_2=v_1\frac{2A_2}{A_2}\qquad v_2=2v_1\qquad v_2=4\,\mathrm{cm/s}`

Errori e controllo: Due esempi non significano soltanto due coppie: qualunque scala positiva funziona. Zero è escluso dalle aree e dalla divisione. Per fissare la scala servirebbe conoscere una delle aree o la portataQ.

