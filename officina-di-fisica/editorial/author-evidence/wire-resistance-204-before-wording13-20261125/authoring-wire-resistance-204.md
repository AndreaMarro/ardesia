# Authoring DRAFT — wire-resistance-204

Letti individualmente tutti gli 80 prompt A200–204 della fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U6-02 SHA256 fc81a187db9ee2f6d17bf299b333defd87a754ad04fc7efaddd2c40737ecc24d. I compiti e gli ID originali sono conservati e si rendono espliciti segni, domini, conversioni e svolgimenti. Riletti i testi reali C4-L02/L05/L06/L09 per campo vettoriale, corrente, leggi di Ohm, resistività e campo magnetico del filo. Prima dei candidati A, il revisore distinto B ha confermato primaria prompt-only 80 SHA256 d7ebcced2248cb67371054303db64193683455aecc7acf34a27196c23ba8afb6; quella primaria non è stata aperta dall’autore. La primaria A dei futuri 80 B205–209 è congelata separatamente SHA256 e8b27ab57d7cae8ac419227900fbb28282555d33ba3c3265e0e55199e19378bd, senza esposizione U6 a chiavi altrui.

Autore soltanto: DRAFT; revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica.

Due assemblaggi in processi separati dell’assembler unico producono gli stessi byte package e binding. Importatore canonico ROOT su SQLite temporaneo: 16 nuovi, poi 0 nuovi e 16 invariati; tutti i 991 pubblicati e le versioni storiche rimangono invariati. Questo è collaudo tecnico strutturale e non giudizio scientifico.

UI prodotto NOT_RUN: per mandato dell’integratore non si avvia il browser dell’app durante il collaudo globale congelato. Non è stato creato o riusato alcun marker UI. Il diagramma SVG è stato letto come XML e sono state controllate le proporzioni intrinseche dei dati. La resa nativa Quick Look a piena altezza è stata realmente prodotta e letta, con log e PNG conservati: è asset-only, non un replay dell’app o una prova di layout a 320 px. Nessun CSS, runtime, registro, checkpoint o file candidato ROOT modificato.

## AR-u6-wire-resistance-01 — L’area va convertita al quadrato

Un filo omogeneo e uniforme ha resistività fissata ρ=2×10⁻⁸ Ω·m, lunghezza L>0 in m e area trasversale A>0 in mm². La temperatura è mantenuta costante. R=ρL/A si applica con A convertita in m²: 1 mm²=10⁻⁶ m². Per scrivere i soli numeri definiamo ℓ=L/(1 m), a=A/(1 mm²) e r=R/(1 Ω); allora r=ℓ/(50a). Fra prove L e A sono parametri assegnati: non si assume volume conservato salvo un vincolo esplicito. Con L=100 m e A=2 mm², quanto vale R in Ω?

Procedimento d’autore: Un millimetro vale 10⁻³ m, quindi un millimetro quadrato vale 10⁻⁶ m². L’area è 2·10⁻⁶ m². Il numeratore ρL è 2·10⁻⁶ Ω·m²: il rapporto con l’area restituisce 1 Ω. Nei numeri normalizzati è 100/(50·2)=1.

Passaggi: A=2\cdot10^{-6}\,\mathrm{m^2};  \rho L=2\cdot10^{-6}\,\mathrm{\Omega\,m^2};  R=1\,\Omega.

Distrattori: Usare 2 come area in m² darebbe 10⁻⁶ Ω. Convertire mm² con il solo fattore 10⁻³ darebbe 10⁻³ Ω. Due Ω ignora il divisore due dell’area; cento copia il numero della lunghezza.

Hint: Converti l’unità di area con il quadrato del fattore lineare.

Fonte canonica SHA256 a967fc0c6cd4c541c28de2c5c9e708af8be682a8655a7d0f5e265418700b2e56. Candidato SHA256 beb1bf504fda34c3750cceca0f74c8d585b8171437b6aa877d42980b13c5a75c. Revisione indipendente e human NOT_RUN.

## AR-u6-wire-resistance-02 — Resistenza e resistività hanno unità diverse

Un filo omogeneo e uniforme ha resistività fissata ρ=2×10⁻⁸ Ω·m, lunghezza L>0 in m e area trasversale A>0 in mm². La temperatura è mantenuta costante. R=ρL/A si applica con A convertita in m²: 1 mm²=10⁻⁶ m². Per scrivere i soli numeri definiamo ℓ=L/(1 m), a=A/(1 mm²) e r=R/(1 Ω); allora r=ℓ/(50a). Fra prove L e A sono parametri assegnati: non si assume volume conservato salvo un vincolo esplicito. Quale unità esprime R?

Procedimento d’autore: La resistività ha unità Ω·m. Moltiplicarla per L e dividere per l’area produce Ω·m·m/m²=Ω. La geometria serve a trasformare una proprietà del materiale nella resistenza di questo particolare filo.

Passaggi: [R]=\frac{\mathrm{\Omega\,m}\cdot\mathrm m}{\mathrm{m^2}};  [R]=\Omega.

Distrattori: Ω·m è l’unità di ρ, non di R. Metri misurano lunghezze, ampere corrente e volt differenza di potenziale. Il simbolo A dell’area non è qui l’unità ampere.

Hint: Distingui il simbolo A della sezione dall’unità A della corrente.

Fonte canonica SHA256 3a43e9da43394811af4209100039120055f003c9655465008f6cab73720647c9. Candidato SHA256 933eb4907e5325a448a8f6df88d01c14b70b2dce65e714af5583462160a6bb87. Revisione indipendente e human NOT_RUN.

## AR-u6-wire-resistance-03 — La legge con unità coerenti

Un filo omogeneo e uniforme ha resistività fissata ρ=2×10⁻⁸ Ω·m, lunghezza L>0 in m e area trasversale A>0 in mm². La temperatura è mantenuta costante. R=ρL/A si applica con A convertita in m²: 1 mm²=10⁻⁶ m². Per scrivere i soli numeri definiamo ℓ=L/(1 m), a=A/(1 mm²) e r=R/(1 Ω); allora r=ℓ/(50a). Fra prove L e A sono parametri assegnati: non si assume volume conservato salvo un vincolo esplicito. Usando grandezze fisiche in unità SI, quale formula dà R?

Procedimento d’autore: Una lunghezza maggiore aumenta il percorso resistivo; una sezione maggiore offre più conduzione in parallelo nel filo uniforme. La legge è R=ρL/A. Il coefficiente numerico 1/50 vale solo quando L è espresso in m e A in mm², non sostituisce una resistività con unità arbitrarie.

Passaggi: R=\rho\frac LA;  r=\frac{\ell}{50a}.

Distrattori: ρA/L avrebbe unità Ω·m². Il reciproco della resistività altera dimensioni e dipendenza dal materiale. Moltiplicare per A rende diretta una dipendenza inversa; il quadrato di L non appartiene alla legge del filo uniforme.

Hint: Controlla insieme dipendenza dalla geometria e cancellazione delle unità.

Fonte canonica SHA256 838652f58613f8346f76860fbc823adb8f39e556a28706fddce36f049954954e. Candidato SHA256 d2c4f24bd0431fd86d0e5d6084e88e0754f0cb2a1092609e3b514bb469dc949b. Revisione indipendente e human NOT_RUN.

## AR-u6-wire-resistance-04 — La lunghezza diventa un centesimo

Un filo omogeneo e uniforme ha resistività fissata ρ=2×10⁻⁸ Ω·m, lunghezza L>0 in m e area trasversale A>0 in mm². La temperatura è mantenuta costante. R=ρL/A si applica con A convertita in m²: 1 mm²=10⁻⁶ m². Per scrivere i soli numeri definiamo ℓ=L/(1 m), a=A/(1 mm²) e r=R/(1 Ω); allora r=ℓ/(50a). Fra prove L e A sono parametri assegnati: non si assume volume conservato salvo un vincolo esplicito. L passa da 100 a 1 m, mentre A resta 2 mm². Come cambia R?

Procedimento d’autore: Area, materiale e temperatura non cambiano. La lunghezza finale è un centesimo di quella iniziale, quindi la resistenza diventa un centesimo: R_B=1/(50·2)=1/100 Ω. Non occorre convertire il risultato in decimali.

Passaggi: R_A=1\,\Omega;  \frac{R_B}{R_A}=\frac1{100};  R_B=\frac1{100}\,\Omega.

Distrattori: Cento Ω inverte la dipendenza da L. Uno ignora il cambio; 1/50 dimentica l’area numerica due e un mezzo non rappresenta una riduzione di cento volte.

Hint: A sezione fissa il rapporto delle resistenze è il rapporto delle lunghezze.

Fonte canonica SHA256 db24d88358990afdf204683026658d3b54be115468cb99bd6d4e30952607c32e. Candidato SHA256 b0d400e50e5caa06d2be964e1ba25de954a78ba3af4dc3ce0606396b777e8a5e. Revisione indipendente e human NOT_RUN.

## AR-u6-wire-resistance-05 — La lunghezza dalla resistenza

Un filo omogeneo e uniforme ha resistività fissata ρ=2×10⁻⁸ Ω·m, lunghezza L>0 in m e area trasversale A>0 in mm². La temperatura è mantenuta costante. R=ρL/A si applica con A convertita in m²: 1 mm²=10⁻⁶ m². Per scrivere i soli numeri definiamo ℓ=L/(1 m), a=A/(1 mm²) e r=R/(1 Ω); allora r=ℓ/(50a). Fra prove L e A sono parametri assegnati: non si assume volume conservato salvo un vincolo esplicito. Si misura R=1 Ω e si conosce A=2 mm². Quanto vale L in m?

Procedimento d’autore: Da R=ρL/A si ricava L=RA/ρ. In SI A=2·10⁻⁶ m² e ρ=2·10⁻⁸ Ω·m: il rapporto è 10² m. In alternativa, ℓ=50ra=50·1·2=100. La divisione per ρ è lecita perché il materiale ha resistività positiva.

Passaggi: L=\frac{RA}{\rho};  \ell=50ra;  \ell=100;  L=100\,\mathrm m.

Distrattori: Cinquanta m perde il valore due della sezione. Duecento m introdurrebbe un ulteriore fattore due e darebbe R=2 Ω. Moltiplicare R per ρ non isola la lunghezza e cambia le dimensioni.

Hint: Moltiplica R per l’area coerente prima di dividere per ρ.

Fonte canonica SHA256 4e770c5921bf5b20b348fec34866f3bab098d8224d6856781236b41adf53469c. Candidato SHA256 9b3f929da73cc80a8ed967ecfe4d47858369eddba20302efa9b4172a8cf7d6a5. Revisione indipendente e human NOT_RUN.

## AR-u6-wire-resistance-06 — Ricostruire l’area

Un filo omogeneo e uniforme ha resistività fissata ρ=2×10⁻⁸ Ω·m, lunghezza L>0 in m e area trasversale A>0 in mm². La temperatura è mantenuta costante. R=ρL/A si applica con A convertita in m²: 1 mm²=10⁻⁶ m². Per scrivere i soli numeri definiamo ℓ=L/(1 m), a=A/(1 mm²) e r=R/(1 Ω); allora r=ℓ/(50a). Fra prove L e A sono parametri assegnati: non si assume volume conservato salvo un vincolo esplicito. Si misura R=1 Ω con L=100 m. Quanto vale A in mm²?

Procedimento d’autore: Moltiplichiamo per A e dividiamo per R: A=ρL/R. Il risultato SI è 2·10⁻⁶ m². Poiché 1 mm² vale 10⁻⁶ m², l’area cercata è 2 mm². Qui l’area sta al denominatore della legge diretta ma al numeratore dopo l’inversione.

Passaggi: RA=\rho L;  A=\frac{\rho L}R;  A=2\cdot10^{-6}\,\mathrm{m^2};  A=2\,\mathrm{mm^2}.

Distrattori: Un mezzo mm² inverte il rapporto numerico e darebbe R=4 Ω. Due m² perdono il fattore 10⁶ della conversione di area. Quattro mm² darebbero 1/2 Ω, non la misura.

Hint: Trova prima l’area in SI, poi converti metri quadrati in millimetri quadrati.

Fonte canonica SHA256 ae4c78b88a2e940bf552d0a3194f4b19c396a678ac94bcb95d6dc9ed6667d4bc. Candidato SHA256 5acd524deba58a4e4675fb612be2286986a1d2dd0b4e6952ceff92bbef7886e5. Revisione indipendente e human NOT_RUN.

## AR-u6-wire-resistance-07 — Metà sezione, doppia resistenza

Un filo omogeneo e uniforme ha resistività fissata ρ=2×10⁻⁸ Ω·m, lunghezza L>0 in m e area trasversale A>0 in mm². La temperatura è mantenuta costante. R=ρL/A si applica con A convertita in m²: 1 mm²=10⁻⁶ m². Per scrivere i soli numeri definiamo ℓ=L/(1 m), a=A/(1 mm²) e r=R/(1 Ω); allora r=ℓ/(50a). Fra prove L e A sono parametri assegnati: non si assume volume conservato salvo un vincolo esplicito. A usa L=100 m e area 2 mm². B mantiene L e ha area 1 mm². Quanto vale R_B/R_A?

Procedimento d’autore: La lunghezza e la resistività sono uguali. Dimezzare l’area raddoppia R: A dà 1 Ω, B dà 100/(50·1)=2 Ω. Il rapporto è due; si confrontano fili o configurazioni preparate, senza imporre la conservazione del loro volume.

Passaggi: R_A=1\,\Omega;  R_B=2\,\Omega;  \frac{R_B}{R_A}=2.

Distrattori: Un mezzo rende diretta la dipendenza dall’area. Uno ignora il cambiamento, quattro introduce un quadrato non presente e il segno negativo contraddice due resistenze passive positive.

Hint: Mantieni il numeratore e confronta le aree nell’ordine inverso.

Fonte canonica SHA256 1178c1fe212c63b9ff5d971416ef62ec65534d78b009bbe4bd2e70e715f22d5c. Candidato SHA256 dfe3887f49d79fecbf8884462b85c62174da10fbf0954f66d6c205f78c21811c. Revisione indipendente e human NOT_RUN.

## AR-u6-wire-resistance-08 — Scarto di una resistenza proposta

Un filo omogeneo e uniforme ha resistività fissata ρ=2×10⁻⁸ Ω·m, lunghezza L>0 in m e area trasversale A>0 in mm². La temperatura è mantenuta costante. R=ρL/A si applica con A convertita in m²: 1 mm²=10⁻⁶ m². Per scrivere i soli numeri definiamo ℓ=L/(1 m), a=A/(1 mm²) e r=R/(1 Ω); allora r=ℓ/(50a). Fra prove L e A sono parametri assegnati: non si assume volume conservato salvo un vincolo esplicito. Con L=100 m e A=2 mm² si propone R=2 Ω. Quanto vale proposta meno corretto?

Procedimento d’autore: Il corretto è 1 Ω. La proposta lo supera di 2−1=1 Ω. Il numero puro due è invece il rapporto fra proposta e corretto: non esprime la differenza di due resistenze.

Passaggi: R=1\,\Omega;  e=(2-1)\,\Omega;  e=1\,\Omega.

Distrattori: −1 inverte l’ordine; due ohm copia la proposta e zero la accetta. Due senza unità è un’altra quantità. Un confronto dimensionale deve mantenere Ω nella differenza.

Hint: Usa la conversione di area corretta prima della sottrazione.

Fonte canonica SHA256 0fe1ede5c6d24bc96820658c0bfa86f738c4d22e2a02fbf450bcf95a63e93e97. Candidato SHA256 2489e1056b2622df47e6f7305422d3c83eba759ca03a780c19149bcd43586384. Revisione indipendente e human NOT_RUN.

## AR-u6-wire-resistance-09 — Isolare L nella legge fisica

Un filo omogeneo e uniforme ha resistività fissata ρ=2×10⁻⁸ Ω·m, lunghezza L>0 in m e area trasversale A>0 in mm². La temperatura è mantenuta costante. R=ρL/A si applica con A convertita in m²: 1 mm²=10⁻⁶ m². Per scrivere i soli numeri definiamo ℓ=L/(1 m), a=A/(1 mm²) e r=R/(1 Ω); allora r=ℓ/(50a). Fra prove L e A sono parametri assegnati: non si assume volume conservato salvo un vincolo esplicito. Sono noti R, A e ρ. Quale relazione fisica ricava L?

Procedimento d’autore: Da R=ρL/A moltiplichiamo per A e dividiamo per ρ>0. Il risultato è L=RA/ρ, con unità Ω·m²/(Ω·m)=m. Per usare il valore dell’area in mm² si converte prima in SI, oppure si usa ℓ=50ra con i numeri normalizzati definiti.

Passaggi: RA=\rho L;  L=\frac{RA}{\rho};  [L]=\mathrm m.

Distrattori: Rρ/A ha unità Ω²/m; ρA/R ha m³ e R/(ρA) ha m⁻³. RAρ non è una lunghezza. La formula corretta si riconosce anche senza affidarsi solo alle unità: deve ricomporre R=ρL/A.

Hint: Fai le operazioni inverse su entrambi i membri e mantieni coerente l’area.

Fonte canonica SHA256 abc8423aa007a101dd5d7f7b59e91a25d4289620fc0417668a009486ea0e38c7. Candidato SHA256 8714982a675fc95126356c3fd64891c4f122e9138147a3038af274492530c16a. Revisione indipendente e human NOT_RUN.

## AR-u6-wire-resistance-10 — Lunghezza e sezione insieme

Un filo omogeneo e uniforme ha resistività fissata ρ=2×10⁻⁸ Ω·m, lunghezza L>0 in m e area trasversale A>0 in mm². La temperatura è mantenuta costante. R=ρL/A si applica con A convertita in m²: 1 mm²=10⁻⁶ m². Per scrivere i soli numeri definiamo ℓ=L/(1 m), a=A/(1 mm²) e r=R/(1 Ω); allora r=ℓ/(50a). Fra prove L e A sono parametri assegnati: non si assume volume conservato salvo un vincolo esplicito. B ha L_B=κ₁L_A e A_B=κ₂A_A, con fattori positivi e stessa ρ. Quanto vale R_B/R_A?

Procedimento d’autore: La nuova lunghezza porta κ₁ al numeratore, la nuova area κ₂ al denominatore. La stessa resistività si cancella e resta κ₁/κ₂. Il quadrato necessario nella conversione mm²→m² non implica un quadrato del fattore con cui cambia l’area già assegnata.

Passaggi: R_B=\rho\frac{\kappa_1L_A}{\kappa_2A_A};  \frac{R_B}{R_A}=\frac{\kappa_1}{\kappa_2}.

Distrattori: Il prodotto rende diretta l’area. Il reciproco scambia B/A. κ₂² confonde un fattore d’area con un fattore di lunghezza della sezione; κ₁² introduce una dipendenza quadratica dalla lunghezza del filo.

Hint: Scala le grandezze L e A così come sono definite, senza aggiungere un vincolo di volume.

Fonte canonica SHA256 da572d40a2dc1c11b67de2bbb5f68491ecd3f75b27621f9ccd706f1fdb9f596f. Candidato SHA256 4bad0c72cbf7460912ad8bbb0bc24e92178fcb0c9eff5edc45e83b54f240ade4. Revisione indipendente e human NOT_RUN.

## AR-u6-wire-resistance-11 — Più lungo e più sottile

Un filo omogeneo e uniforme ha resistività fissata ρ=2×10⁻⁸ Ω·m, lunghezza L>0 in m e area trasversale A>0 in mm². La temperatura è mantenuta costante. R=ρL/A si applica con A convertita in m²: 1 mm²=10⁻⁶ m². Per scrivere i soli numeri definiamo ℓ=L/(1 m), a=A/(1 mm²) e r=R/(1 Ω); allora r=ℓ/(50a). Fra prove L e A sono parametri assegnati: non si assume volume conservato salvo un vincolo esplicito. A usa L=100 m, A=2 mm². B usa L=200 m, A=1 mm². Quanto vale R_B/R_A?

Procedimento d’autore: A ha R=1 Ω. B ha R=200/(50·1)=4 Ω. La lunghezza doppia fornisce un fattore due e la sezione dimezzata un altro fattore due: il prodotto dà quattro. La resistività resta uguale.

Passaggi: R_A=1\,\Omega;  R_B=4\,\Omega;  \frac{R_B}{R_A}=4.

Distrattori: Due considera un solo cambiamento. Un quarto inverte B/A; uno presuppone una compensazione che invece non avviene, perché entrambi i cambiamenti aumentano R.

Hint: Valuta l’effetto di ciascun dato nella sua posizione originale della legge.

Fonte canonica SHA256 7f06fc8b16c87ba25d57abafd0939d113968a16e9701c547f8465894007faefc. Candidato SHA256 293a6a1d9866e4161a7e6f4441415b51f507bc1a7a6ba882cb7d112a7bc9c323. Revisione indipendente e human NOT_RUN.

## AR-u6-wire-resistance-12 — La media dei fili preparati

Un filo omogeneo e uniforme ha resistività fissata ρ=2×10⁻⁸ Ω·m, lunghezza L>0 in m e area trasversale A>0 in mm². La temperatura è mantenuta costante. R=ρL/A si applica con A convertita in m²: 1 mm²=10⁻⁶ m². Per scrivere i soli numeri definiamo ℓ=L/(1 m), a=A/(1 mm²) e r=R/(1 Ω); allora r=ℓ/(50a). Fra prove L e A sono parametri assegnati: non si assume volume conservato salvo un vincolo esplicito. A usa L=100 m, A=2 mm²; B usa L=200 m, A=1 mm². Qual è la media aritmetica delle due R con uguale peso?

Procedimento d’autore: Le due resistenze sono 1 e 4 Ω. La loro media è 5/2 Ω. Ai dati medi L=150 m e A=3/2 mm², invece, si avrebbe R=150/(50·3/2)=2 Ω. La media delle uscite supera quel valore di 1/2 Ω. Non si sta costruendo un circuito con i due fili.

Passaggi: \overline R=\frac{1+4}{2}\,\Omega;  \overline R=\frac52\,\Omega;  R_{\rm dati\ medi}=2\,\Omega.

Distrattori: Due Ω usa i dati medi. Cinque non dimezza, 3/2 è metà della differenza e quattro copia B. Una somma o un parallelo di fili sarebbero problemi di topologia diversi da questa media statistica.

Hint: Calcola le resistenze dei due fili prima di fare la media.

Fonte canonica SHA256 eefeaca14b744687ed272d329c337f1c3c58e8e5e4c1246f9d9074882a9844d8. Candidato SHA256 9f2412ceb7de0ba0e5e87da24af678a3b4ce841a0ae43d4bae80a59615064da4. Revisione indipendente e human NOT_RUN.

## AR-u6-wire-resistance-13 — L’area necessaria al bersaglio

Un filo omogeneo e uniforme ha resistività fissata ρ=2×10⁻⁸ Ω·m, lunghezza L>0 in m e area trasversale A>0 in mm². La temperatura è mantenuta costante. R=ρL/A si applica con A convertita in m²: 1 mm²=10⁻⁶ m². Per scrivere i soli numeri definiamo ℓ=L/(1 m), a=A/(1 mm²) e r=R/(1 Ω); allora r=ℓ/(50a). Fra prove L e A sono parametri assegnati: non si assume volume conservato salvo un vincolo esplicito. A ha L=100 m, A_A=2 mm². B usa L=200 m e deve dare R_B=4R_A. Quanto vale A_B/A_A?

Procedimento d’autore: Il bersaglio è R_B=4 Ω. Nella relazione numerica 4=200/(50a_B) si trova a_B=1, quindi A_B=1 mm². Il rapporto con 2 mm² iniziali è 1/2. L’allungamento doppio contribuisce già a metà dell’aumento richiesto.

Passaggi: R_B=4\,\Omega;  a_B=\frac{200}{50\cdot4};  A_B=1\,\mathrm{mm^2};  \frac{A_B}{A_A}=\frac12.

Distrattori: Due inverte il rapporto. Un quarto usa solo l’aumento di resistenza e dimentica L raddoppiata. Quattro copia il bersaglio e uno darebbe R_B=2 Ω, non 4 Ω.

Hint: Ricava l’area B con la nuova lunghezza prima del rapporto delle aree.

Fonte canonica SHA256 101aa600349d1909b686a5239301b53c27a30d8378466853c2ef5660c59f2aa6. Candidato SHA256 c3204c4fbec755aea20e0cc83225f7f3ed3627ab4d9e85c10c6387d82521a5b3. Revisione indipendente e human NOT_RUN.

## AR-u6-wire-resistance-14 — Un display prima della lunghezza

Un filo omogeneo e uniforme ha resistività fissata ρ=2×10⁻⁸ Ω·m, lunghezza L>0 in m e area trasversale A>0 in mm². La temperatura è mantenuta costante. R=ρL/A si applica con A convertita in m²: 1 mm²=10⁻⁶ m². Per scrivere i soli numeri definiamo ℓ=L/(1 m), a=A/(1 mm²) e r=R/(1 Ω); allora r=ℓ/(50a). Fra prove L e A sono parametri assegnati: non si assume volume conservato salvo un vincolo esplicito. D=a_cal R è continuo e adimensionale, a_cal>0 e senza offset. A con L=100 m, A=2 mm² dà D=3. C dà D=12 e ha area 1 mm². Quanto vale L_C in m?

Procedimento d’autore: Il riferimento ha R_A=1 Ω e guadagno a_cal=3 Ω⁻¹. C ha R_C=12/3=4 Ω. Con area numerica uno, ℓ_C=50·4·1=200, cioè L_C=200 m. La taratura si rimuove prima dell’inversa geometrica.

Passaggi: a_{\rm cal}=3\,\Omega^{-1};  R_C=4\,\Omega;  \ell_C=200;  L_C=200\,\mathrm m.

Distrattori: Seicento m usa D come ohm. Quattro m copia R_C e cinquanta copia il coefficiente di conversione. Non si cambia la resistività del materiale per adattare il display.

Hint: Decodifica la resistenza e poi usa L=RA/ρ.

Fonte canonica SHA256 c0b4636d3eaf56d45138a57859d9cf87a8ad5188cd5f4cabe74551fde4e3c6f5. Candidato SHA256 c0645c5801d22b27145ee2e8b7d40a9b0a1d960364e16737a2d31e203006e8bd. Revisione indipendente e human NOT_RUN.

## AR-u6-wire-resistance-15 — Un piccolo valore sopra l’offset

Un filo omogeneo e uniforme ha resistività fissata ρ=2×10⁻⁸ Ω·m, lunghezza L>0 in m e area trasversale A>0 in mm². La temperatura è mantenuta costante. R=ρL/A si applica con A convertita in m²: 1 mm²=10⁻⁶ m². Per scrivere i soli numeri definiamo ℓ=L/(1 m), a=A/(1 mm²) e r=R/(1 Ω); allora r=ℓ/(50a). Fra prove L e A sono parametri assegnati: non si assume volume conservato salvo un vincolo esplicito. D=a_cal R+b è continuo e adimensionale, a_cal>0. A: L=100 m, A=2 mm², D=3. B: L=200 m, A=1 mm², D=9. C: area 1 mm², D=26/25. Quanto vale L_C?

Procedimento d’autore: Le resistenze di riferimento sono 1 e 4 Ω. Il guadagno è (9−3)/(4−1)=2 Ω⁻¹ e b=1. C supera l’offset di 26/25−1=1/25; dividendo per due si trova R_C=1/50 Ω. L’area è 1 mm², quindi ℓ_C=50·(1/50)·1=1 e L_C=1 m. Nessun decimale è necessario.

Passaggi: a_{\rm cal}=2\,\Omega^{-1};  b=1;  R_C=\frac1{50}\,\Omega;  L_C=1\,\mathrm m.

Distrattori: Ventisei m omette b e usa R_C=13/25 Ω. Due m sottrae b ma non divide per il guadagno. 1/50 m copia il numero della resistenza; cinquanta m ignora il piccolo eccesso del display sopra l’offset.

Hint: Calcola prima 26/25−1 come frazione esatta, poi rimuovi il guadagno.

Fonte canonica SHA256 e2960577815fbd9da4279875659147b51b7ebc3b43bb51b61e12974ca40a0757. Candidato SHA256 d99464ddedd19d32696be0277e384a0582b9b0dcbc9eab21b4417324861e8c4e. Revisione indipendente e human NOT_RUN.

## AR-u6-wire-resistance-16 — Geometrie diverse, stessa resistenza

Un filo omogeneo e uniforme ha resistività fissata ρ=2×10⁻⁸ Ω·m, lunghezza L>0 in m e area trasversale A>0 in mm². La temperatura è mantenuta costante. R=ρL/A si applica con A convertita in m²: 1 mm²=10⁻⁶ m². Per scrivere i soli numeri definiamo ℓ=L/(1 m), a=A/(1 mm²) e r=R/(1 Ω); allora r=ℓ/(50a). Fra prove L e A sono parametri assegnati: non si assume volume conservato salvo un vincolo esplicito. Fra preparazioni si impone L=γA, con γ=50 m/mm². Si misura inoltre R=1 Ω. Quante coppie positive (L,A) sono determinate?

Procedimento d’autore: Il vincolo significa ℓ=50a. Inserendolo nella legge normalizzata si ottiene r=50a/(50a)=1 per ogni a>0. In SI γ=5·10⁷ m⁻¹ e ργ=1 Ω. La misura non aggiunge una condizione indipendente: 50 m con 1 mm² e 100 m con 2 mm² sono due esempi della stessa famiglia.

Passaggi: \ell=50a;  r=\frac{50a}{50a};  r=1;  R=1\,\Omega.

Distrattori: Le coppie singole non esauriscono l’insieme. L e A non sono libere indipendentemente, ma devono rispettare il rapporto assegnato. Non si tratta di allungare a volume fisso lo stesso filo: qui il vincolo lega lunghezza e area tra preparazioni con la stessa resistività.

Hint: Sostituisci il rapporto geometrico e controlla se resta una scala libera.

Fonte canonica SHA256 9d6c3e378d3a1b45d9d6074c12aae11690a3c8b571ee086264653e71ce817d91. Candidato SHA256 759660657c105963b543b4e331d46e2f6767e27a809743e0b771e5e82e00abd0. Revisione indipendente e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 0bea3e3b4af0ac2f3c1c2c0bd310cf352de915ec82be9fe176009aaf789ca33b. Package file SHA256 fc5ac8b2d91b134f1abf52dded424611d4a739fd6e0e6747558539af78600908. Binding file SHA256 53fb3cb8f362247c80587fc913cb571c7febea44c33c723df9042075f4544886. Prova strutturale SHA256 0842812552d83ed91a75803ee80a856dca341e01b1a0cc71ac388cf320c9b08b. Asset-only manifest SHA256 0231749a767a97610e7755dd9af3cd28c156b6faf725f894f29206080cbabbf0.

Le coordinate intrinseche dell’SVG documentano proporzioni geometriche nella sorgente, non una misura in pixel fisici dopo ridimensionamento. I testi visibili usano soltanto grandezze fisiche e valori pertinenti. Le origini e le etichette sono separate dagli assi; la direzione di ciascuna freccia è letta insieme alla sua didascalia.

## Geometria e conversioni

Le viste del filo e della sezione sono schematiche su scale indipendenti, dichiarato anche nel disegno e nella didascalia: non si ricava l’area dalla dimensione apparente del cerchio e non si confronta il diametro disegnato con100 m. Il grafico centrale usa area2 mm², lunghezza100 e200 m alle ascisse330 e530, resistenza1 e2 Ω alle ordinate730 e610. Le scale sono2 coordinate/m e120 coordinate/Ω. Il punto di origine è vuoto per indicare il limite L→0; le prove del modello hanno L>0.

Le barre finali1,4,5/2 Ω sono larghe80,320,200, con origine130 e scala comune80 coordinate/Ω. La prova B cambia sezione a1 mm² ed è esplicitamente separata dalla retta centrale a2 mm². Lo zero a104 è lontano dall’asse. Coordinate e proporzioni sono documentazione tecnica, non metriche visibili allo studente. Il render nativo completo è stato realmente letto; nessuna UI prodotto o propria approvazione scientifica.
