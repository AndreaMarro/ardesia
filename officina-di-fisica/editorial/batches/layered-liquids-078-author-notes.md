# Note dell’autore — layered-liquids-078

Letti tutti16 originali U3-01 alla fonte5cfbdcb055ba3ba136f97fb56e997f06e6cf3605. Corso C2, primaria C2-L002 «Leggere una colonna di liquido», prerequisiti reali C2-L001/L002, riuso C6; unica pipeline assemble_family. La lezione reale tratta Stevino e somma degli strati con pressione continua. Nessun verificatore o firma scientifica propria.

Scelti acqua1000kg/m³ e olio800kg/m³: fluidi immiscibili, uniformi e incomprimibili in quiete, olio meno denso sopra acqua per stabilità; g10 uniforme, altezze verticali positive, capillarità trascurata e pressione continua all’interfaccia. γ_a10 eγ_o8kPa/m hanno dimensioni. p_r è relativa all’atmosfera sulla superficie, non assoluta. Il modello si applica separatamente in ogni strato; densità fisse e altezze variabili fra prove.

01:olio8·1 più acqua10·1=18kPa, senza media né nuova atmosfera. 02:entrambi i termini hanno M/(LT²), kPa unica opzione dimensionalmente adatta. 03:superficie→interfaccia dàγ_oh_o, interfaccia→fondo dàγ_ah_a; somma completa per continuità. Pressioni intermedie p_i,p_f definite nel testo, non un azzeramento all’interfaccia. 04:solo acqua1→2m:18→28kPa,incremento10kPa e rapporto14/9, non2.

05:h_a=(18−8)/10=1m, dominio p_r>γ_oh_o. 06:h_o=(18−10)/8=1m, dominio p_r>γ_ah_a. 07:solo olio1→2m:18→26kPa, rapporto13/9. 08:36−18=+18kPa;proposta coerente con entrambi gli strati raddoppiati.

09:h_a=(p_r−γ_oh_o)/γ_a, numeratore pressione e denominatore pressione per metro. 10:W=γ_ah_a eO=γ_oh_o sono pressioni;R=(κ₁W+κ₂O)/(W+O), coefficienti distinti e somma nei due esperimenti. 11:altezze entrambe1→2m danno18→36kPa, rapporto2, non4 perché la legge è additiva. 12:semisomma27kPa;ingressi medi3/2m danno anch’essi27 per linearità a densità fisse, coincidenza giustificata.

13:target36kPa,acqua2m→20kPa,residuo16kPa→olio2m,rapporto2. 14:q54/(18kPa)=3kPa⁻¹;S108→36kPa;olio2m→16kPa,residuo20→acqua2m. 15:q(73−37)/(36−18)=2kPa⁻¹,b1;S57→28kPa;olio1m→8,residuo20→acqua2m. Alternativeh_a1,3/2,5/2,3m darebberoS37,47,67,77. Offset strumentale e atmosfera distinti, display continuo adimensionale.

16:h_a=h_o=h; p_r=(γ_a+γ_o)h=(18kPa/m)h18kPa→h1m, unica coppia positiva. Nessuna densità uguale implicita; nessun quadrato delle altezze. Senza vincolo resterebbe una famiglia di coppie, qui eliminata dalla relazione aggiuntiva.

SVG01/03: olio e acqua1m ciascuno,100px alla scala100px/m;olio sopra più denso acqua. Barre pressione80/100px per8/10kPa,totale180px per18kPa,scala10px/kPa. Grafico pressione orizzontale e profondità in basso: (0kPa,0m)→(8kPa,1m)→(18kPa,2m),incrementi orizzontali80/100px e verticali100px; continuo e con diversa pendenza. Frecce assi in path separati, scale indipendenti dichiarate. XML e rendering completo letti.

Assembly/binding deterministici e16metadati C2/L002/prereqL001,L002 controllati. Import canonico ROOT con SQLite temporaneo:16DRAFT poi0nuove/16invariate;991pubblicati e991versioni storiche invariati SHA25699c8d805004c82ba63a19f7ad8c0825666ca813d4f15471b8df4db5657b7c9ee. PackageSHA2569046c907b62de568113420699515e55f0bdf81a1e3200175b7fc3ed1fcd4fe44. Controlli tecnici d’autore soltanto; DRAFT, independentReview NOT_RUN, human NOT_RUN, publication NONE.
