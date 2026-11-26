# Authoring DRAFT — point-electric-potential-192

Letti individualmente tutti gli 80 prompt A190–194 della fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U6-01 SHA256 a981cd7c03f402ee7b2f66e1de79e9f2cea686ffe3178cd19bcb8d17b66c122a. I compiti e gli ID originali sono conservati e si rendono espliciti segni, domini, conversioni e svolgimenti. Riletti i testi reali C4-L01/L02/L03 per Coulomb, campo vettoriale e potenziale scalare. Prima dei candidati A, il revisore distinto B ha confermato primaria prompt-only 80 SHA256 12031f00b348d12feff99b677c4031308ed67876612eec5d77fb98df866b037a; quella primaria non è stata aperta dall’autore. La primaria A dei futuri 80 B195–199 è congelata separatamente SHA256 3531bf38e7970d52ba36b9193b48827d0a59b7f8d5c364705e0ff60809e268e9, senza esposizione U6 a chiavi altrui.

Autore soltanto: DRAFT; revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica.

Due assemblaggi in processi separati dell’assembler unico producono gli stessi byte package e binding. Importatore canonico ROOT su SQLite temporaneo: 16 nuovi, poi 0 nuovi e 16 invariati; tutti i 991 pubblicati e le versioni storiche rimangono invariati. Questo è collaudo tecnico strutturale e non giudizio scientifico.

UI prodotto NOT_RUN: per mandato dell’integratore non si avvia il browser dell’app durante il collaudo globale congelato. Non è stato creato o riusato alcun marker UI. Il diagramma SVG è stato letto come XML e sono state controllate le proporzioni intrinseche dei dati. La resa nativa Quick Look a piena altezza è stata realmente prodotta e letta, con log e PNG conservati: è asset-only, non un replay dell’app o una prova di layout a 320 px. Nessun CSS, runtime, registro, checkpoint o file candidato ROOT modificato.

## AR-u6-point-electric-potential-01 — Il potenziale riferito all’infinito

Una sorgente puntiforme positiva Q è mantenuta fissa nel vuoto. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e si sceglie V=0 all’infinito. A distanza r>0 il potenziale scalare è V=k_eQ/r>0. Poniamo u=Q/(1 nC), ρ=r/(1 m) e v=V/(1 V), tutti puri: nelle unità dichiarate v=9u/ρ. Il potenziale non è il campo vettoriale e non è l’energia di una carica di prova. Con Q=1 nC e r=3 m, quanto vale V in volt?

Procedimento d’autore: Un nanocoulomb è 10⁻⁹ C, quindi k_eQ=9 N·m²/C. Dividere per 3 m dà 3 N·m/C=3 J/C=3 V. Il risultato è positivo perché la sorgente è positiva e lo zero è all’infinito. Non si divide per r²: quello darebbe il campo, con unità diverse.

Passaggi: k_eQ=9\,\mathrm{N\,m^2/C};  V=\frac{9}{3}\,\mathrm{J/C};  V=3\,\mathrm V.

Distrattori: Un N/C sarebbe il campo a questa distanza, non il potenziale. Nove V omette la distanza e un V usa il suo quadrato nella relazione numerica. Senza una carica di prova non si sta calcolando un’energia in joule.

Hint: Usa la prima potenza della distanza e lo zero assegnato all’infinito.

Fonte canonica SHA256 fa0a0e1b1465be14f4de8281a2d391a71c4bc5ec148c61d55bb0a91d89d7636a. Candidato SHA256 eebbcb1ae9ed25721c3e9366f95db87fcc02a85f5eb5215473dae57e9653df93. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-potential-02 — Energia per unità di carica

Il potenziale elettrico V è energia potenziale per unità di carica di prova. Quale unità esprime V?

Procedimento d’autore: L’energia potenziale di una prova q è U=qV. Dividendo joule per coulomb si ottiene il volt, quindi [V]=J/C. Il potenziale è scalare; una differenza di potenziale può produrre lavoro, ma non coincide con il lavoro stesso.

Passaggi: U=qV;  [V]=\mathrm{J/C};  1\,\mathrm V=1\,\mathrm{J/C}.

Distrattori: N/C esprime il campo, J energia, C carica e N forza. L’uguaglianza V=J/C non autorizza a sommare volt e joule: occorre la carica per passare dall’uno all’altra.

Hint: Ricava le unità dividendo l’energia per la carica.

Fonte canonica SHA256 155e9036f360c497ebaca162997ad660363bd4a9cf578deb60938bccb7f6d8f2. Candidato SHA256 6a54e98465370b2c072a614bcf014bd573fcba4b69d905f04a21adcb567cc502. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-potential-03 — La prima potenza della distanza

Una sorgente puntiforme positiva Q è mantenuta fissa nel vuoto. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e si sceglie V=0 all’infinito. A distanza r>0 il potenziale scalare è V=k_eQ/r>0. Poniamo u=Q/(1 nC), ρ=r/(1 m) e v=V/(1 V), tutti puri: nelle unità dichiarate v=9u/ρ. Il potenziale non è il campo vettoriale e non è l’energia di una carica di prova. Quale relazione dà v usando u e ρ?

Procedimento d’autore: Per una sorgente puntiforme il potenziale con zero all’infinito è k_eQ/r. Sostituendo Q=u·10⁻⁹ C e r=ρ·1 m, il fattore numerico è nove. Si ottiene v=9u/ρ, una dipendenza inversa dalla distanza alla prima potenza. Il quadrato compare invece nel campo.

Passaggi: V=\frac{k_eQ}{r};  v=\frac{9u}{\rho};  V=v\cdot1\,\mathrm V.

Distrattori: ρ² darebbe la dipendenza del campo anziché del potenziale. Moltiplicare per ρ fa crescere V allontanandosi; mettere u al denominatore inverte la dipendenza da Q. Dividere per nove capovolge il coefficiente di conversione.

Hint: Controlla quale legge riguarda il potenziale e quale il campo.

Fonte canonica SHA256 c95e78a052c031c3eff871ea4fe1ad8b0e05f3943d4112bd1bf7a26eee772631. Candidato SHA256 b0f8ffc12cbe904640e588c2dff3a0f3c11180f851c79d4f5ed76c4e92cb1ae9. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-potential-04 — Una sorgente doppia

Una sorgente puntiforme positiva Q è mantenuta fissa nel vuoto. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e si sceglie V=0 all’infinito. A distanza r>0 il potenziale scalare è V=k_eQ/r>0. Poniamo u=Q/(1 nC), ρ=r/(1 m) e v=V/(1 V), tutti puri: nelle unità dichiarate v=9u/ρ. Il potenziale non è il campo vettoriale e non è l’energia di una carica di prova. A ha Q=1 nC, C ha Q=2 nC; entrambe hanno r=3 m. Come cambia V?

Procedimento d’autore: A distanza uguale, il potenziale è proporzionale a Q. A dà 9/3=3 V; C dà 18/3=6 V. Il riferimento all’infinito è lo stesso nelle due configurazioni, quindi i valori possono essere confrontati senza aggiungere una costante diversa.

Passaggi: V_A=3\,\mathrm V;  V_C=6\,\mathrm V;  V_C/V_A=2.

Distrattori: 3/2 V rende inversa la sorgente. Dodici V usa un quadrato di Q, mentre tre V ignora il cambio. Zero sarebbe un diverso dato fisico o riferimento, non l’effetto di raddoppiare una carica positiva.

Hint: Mantieni uguali r e il riferimento dello zero, poi scala Q.

Fonte canonica SHA256 32ee811d93af05e7c64eba048405d5817abd76552e36d7ba5d877390a8f290be. Candidato SHA256 f7247a54093eea233c3020e31b876541050fa5418eed363f742986dc29ac98f8. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-potential-05 — La carica dal potenziale

Una sorgente puntiforme positiva Q è mantenuta fissa nel vuoto. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e si sceglie V=0 all’infinito. A distanza r>0 il potenziale scalare è V=k_eQ/r>0. Poniamo u=Q/(1 nC), ρ=r/(1 m) e v=V/(1 V), tutti puri: nelle unità dichiarate v=9u/ρ. Il potenziale non è il campo vettoriale e non è l’energia di una carica di prova. Si misura V=3 V a r=3 m. Quanto vale Q in nC?

Procedimento d’autore: Isolando u=vρ/9 si ottiene u=3·3/9=1. Quindi la sorgente vale 1 nC. La misura è significativa con lo stesso zero all’infinito usato nella formula: una costante aggiunta arbitrariamente al potenziale andrebbe prima rimossa.

Passaggi: u=\frac{v\rho}{9};  u=1;  Q=1\,\mathrm{nC}.

Distrattori: Tre nC moltiplicherebbe anche per una distanza in più e darebbe 9 V. Un terzo nC darebbe 1 V. Il numero tre del potenziale non è direttamente una carica in nC.

Hint: Moltiplica il potenziale per la distanza e dividi per la costante del modello.

Fonte canonica SHA256 9065434c98a25a6c24e080db5ec6675d38029158100f8ac4b7e75c26ce5785a2. Candidato SHA256 6f3b52c535c2f5f25b7a976c52b347e6400ff74174aff32047ab4d0f5da26bed. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-potential-06 — La distanza da una sorgente nota

Una sorgente puntiforme positiva Q è mantenuta fissa nel vuoto. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e si sceglie V=0 all’infinito. A distanza r>0 il potenziale scalare è V=k_eQ/r>0. Poniamo u=Q/(1 nC), ρ=r/(1 m) e v=V/(1 V), tutti puri: nelle unità dichiarate v=9u/ρ. Il potenziale non è il campo vettoriale e non è l’energia di una carica di prova. Si misura V=3 V e si conosce Q=1 nC. Quanto vale r in m?

Procedimento d’autore: Dalla relazione v=9u/ρ segue ρ=9u/v=9/3=3. La distanza è 3 m. In questo caso non si prende una radice, perché r compare alla prima potenza nel potenziale. V>0 e Q>0 garantiscono il ramo r>0.

Passaggi: \rho=\frac{9u}{v};  \rho=3;  r=3\,\mathrm m.

Distrattori: √3 m introdurrebbe una radice che la legge del potenziale non richiede. Nove m darebbe 1 V; un metro darebbe 9 V. La distanza negativa è esclusa dal modello geometrico.

Hint: Isola r dalla prima potenza, senza importare il quadrato della legge del campo.

Fonte canonica SHA256 e6559917d1c0059721a018fa7515d348fc39a7c61833e27996cc4798add7b050. Candidato SHA256 076f2619a75a966e480094c506a755d6a6c36073bb574365d9f30eb90a93198a. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-potential-07 — Più vicino alla stessa sorgente

Una sorgente puntiforme positiva Q è mantenuta fissa nel vuoto. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e si sceglie V=0 all’infinito. A distanza r>0 il potenziale scalare è V=k_eQ/r>0. Poniamo u=Q/(1 nC), ρ=r/(1 m) e v=V/(1 V), tutti puri: nelle unità dichiarate v=9u/ρ. Il potenziale non è il campo vettoriale e non è l’energia di una carica di prova. Q resta 1 nC. A ha r_A=3 m e C ha r_C=1 m. Quanto vale V_C/V_A?

Procedimento d’autore: Il numeratore è comune e il potenziale è inversamente proporzionale a r. A dà 3 V e C dà 9 V; il rapporto è tre. Nove sarebbe invece il rapporto dei campi nelle stesse posizioni.

Passaggi: V_A=3\,\mathrm V;  V_C=9\,\mathrm V;  V_C/V_A=3.

Distrattori: Nove applica il quadrato della distanza del campo. 1/3 e 1/9 fanno diminuire il potenziale avvicinandosi a una sorgente positiva; uno ignora il nuovo punto di osservazione.

Hint: Con Q fisso, confronta l’inverso delle distanze alla prima potenza.

Fonte canonica SHA256 6109617388cf20effc5f381f12a6505841c6b89ef9f0875ca38841ed4fa32202. Candidato SHA256 410b320d19984114226b99f00a67d94c4bde965a09dac6e8e17ceeaf4a6ff9b6. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-potential-08 — Una superficie equipotenziale nello spazio

Una carica puntiforme positiva isolata genera V(d)=k_eQ/d, con zero all’infinito e d distanza dalla sorgente. Alla distanza r>0 il potenziale è 12 V. Quale insieme di punti ha potenziale 6 V?

Procedimento d’autore: Da k_eQ/r=12 V e k_eQ/d=6 V, il rapporto dà r/d=1/2, dunque d=2r. Il potenziale dipende soltanto dalla distanza, non dalla direzione: tutti i punti a quella distanza formano una superficie sferica centrata sulla carica. Non si sta descrivendo una circonferenza nello spazio tridimensionale; nel disegno se ne può vedere una sezione.

Passaggi: \frac{V(d)}{V(r)}=\frac rd;  \frac6{12}=\frac rd;  d=2r.

Distrattori: A r/2 il potenziale sarebbe 24 V, non sei. Piani e cilindri contengono punti a distanze diverse dalla carica e non sono qui equipotenziali. Un solo punto soddisfa il valore ma non è l’intero insieme chiesto.

Hint: Trova prima la distanza e poi l’insieme tridimensionale dei punti equidistanti.

Fonte canonica SHA256 054580bc86411670aae8e1640467377d7c59cf0639b3988026d33bfefab8a12c. Candidato SHA256 0ea48fb2e7078c849cbdee489987928d1b8871c1b42a7ebd32d64bcc11f97afc. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-potential-09 — Isolare la sorgente nella legge fisica

Una sorgente puntiforme positiva Q è mantenuta fissa nel vuoto. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e si sceglie V=0 all’infinito. A distanza r>0 il potenziale scalare è V=k_eQ/r>0. Poniamo u=Q/(1 nC), ρ=r/(1 m) e v=V/(1 V), tutti puri: nelle unità dichiarate v=9u/ρ. Il potenziale non è il campo vettoriale e non è l’energia di una carica di prova. Quale formula fisica restituisce Q da V e r?

Procedimento d’autore: Moltiplichiamo V=k_eQ/r per r e dividiamo per k_e: Q=Vr/k_e. In SI il prodotto V·m diviso N·m²/C² dà C, perché V=N·m/C. Il riferimento del potenziale resta quello dichiarato, all’infinito.

Passaggi: Vr=k_eQ;  Q=\frac{Vr}{k_e};  [Q]=\mathrm C.

Distrattori: Il quadrato aggiunge una lunghezza estranea; il reciproco ha unità C⁻¹. Tenere r al denominatore non inverte la legge e il due dimezzerebbe arbitrariamente la sorgente. Le unità di V restano volt e non N/C.

Hint: Elimina prima il denominatore r e poi il fattore k_e.

Fonte canonica SHA256 a415f3bfafa207983efca7911d73d13c25964c2fbfcc0a8ae5c01ac0b3751312. Candidato SHA256 09746e62100394fe45091aad351980d3f14f74bf33a9d640551eeb8827cb5bfe. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-potential-10 — Fattori nella relazione inversa semplice

Una sorgente puntiforme positiva Q è mantenuta fissa nel vuoto. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e si sceglie V=0 all’infinito. A distanza r>0 il potenziale scalare è V=k_eQ/r>0. Poniamo u=Q/(1 nC), ρ=r/(1 m) e v=V/(1 V), tutti puri: nelle unità dichiarate v=9u/ρ. Il potenziale non è il campo vettoriale e non è l’energia di una carica di prova. C ha Q_C=κ₁Q_A e r_C=κ₂r_A, con fattori positivi. Quale legge generale dà V_C/V_A?

Procedimento d’autore: Sostituiamo nella legge V_C=k_eκ₁Q_A/(κ₂r_A). Nel rapporto con V_A si cancellano k_e, Q_A e r_A e rimane κ₁/κ₂. Aumentare la sorgente e aumentare la distanza hanno effetti opposti sul potenziale.

Passaggi: V_C=\frac{k_e\kappa_1Q_A}{\kappa_2r_A};  V_C/V_A=\kappa_1/\kappa_2.

Distrattori: κ₂² introduce la dipendenza del campo. Il prodotto rende diretto r, il reciproco scambia C/A e κ₁² eleva la sorgente al quadrato senza ragione fisica.

Hint: Conserva la prima potenza di r mentre inserisci i fattori.

Fonte canonica SHA256 2762be33f2f1468afb4311cbd0e535743054ad3fb717074ce6db5123fe981f54. Candidato SHA256 cfdcc75bf22b6bfccb8080b5fcc133ace1f4171b1fab7af6302715eaca77d46c. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-potential-11 — Due cambiamenti per un potenziale sei volte maggiore

Una sorgente puntiforme positiva Q è mantenuta fissa nel vuoto. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e si sceglie V=0 all’infinito. A distanza r>0 il potenziale scalare è V=k_eQ/r>0. Poniamo u=Q/(1 nC), ρ=r/(1 m) e v=V/(1 V), tutti puri: nelle unità dichiarate v=9u/ρ. Il potenziale non è il campo vettoriale e non è l’energia di una carica di prova. A ha Q=1 nC, r=3 m. C ha Q=4 nC, r=2 m. Quanto vale V_C/V_A?

Procedimento d’autore: A dà 3 V; C dà 9·4/2=18 V. Il rapporto è 18/3=6. Equivale al fattore quattro della sorgente moltiplicato per 3/2, l’inverso del fattore della distanza. Non compare il quadrato di 3/2.

Passaggi: V_A=3\,\mathrm V;  V_C=18\,\mathrm V;  V_C/V_A=6.

Distrattori: Quattro segue soltanto Q, 3/2 soltanto r. Nove userebbe il quadrato della distanza e 1/6 capovolge il rapporto. Diciotto è il numero dei volt in C, non il rapporto puro.

Hint: Valuta i due potenziali con lo stesso zero e poi dividili.

Fonte canonica SHA256 b298ee99f70e876401b80b1d464ae0aacfb3f124d64bf57161423d93656b7f0b. Candidato SHA256 cdfe477dfdf530f5453b56c2f1a4b3ff80f9211719e8b95a65545f348ff53e24. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-potential-12 — Media di due letture di potenziale

Una sorgente puntiforme positiva Q è mantenuta fissa nel vuoto. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e si sceglie V=0 all’infinito. A distanza r>0 il potenziale scalare è V=k_eQ/r>0. Poniamo u=Q/(1 nC), ρ=r/(1 m) e v=V/(1 V), tutti puri: nelle unità dichiarate v=9u/ρ. Il potenziale non è il campo vettoriale e non è l’energia di una carica di prova. A usa Q=1 nC, r=3 m; C usa Q=4 nC, r=2 m. Qual è la media aritmetica delle due V con uguale peso?

Procedimento d’autore: Le letture sono 3 e 18 V, quindi la media è (3+18)/2=21/2 V. Con gli ingressi medi Q=5/2 nC e r=5/2 m si otterrebbe invece 9 V. La divisione Q/r non conserva in generale le medie di entrambi gli ingressi.

Passaggi: \overline V=\frac{3+18}{2}\,\mathrm V;  \overline V=\frac{21}{2}\,\mathrm V;  V_{\rm dati\ medi}=9\,\mathrm V.

Distrattori: Nove V usa i dati medi; ventuno V non dimezza la somma; 15/2 V è metà della differenza e tre V ignora C. Una media di letture non è una somma di potenziali di due sorgenti presenti insieme.

Hint: Calcola ogni lettura prima di eseguire la media statistica.

Fonte canonica SHA256 5eb12f48f9ef5403ef44da6eabb93d46272c990cd2b087b3967bf4b739d718f0. Candidato SHA256 25882254eb5d041f861a4be254f51519158dc4fe4fdee082bcebd71b6e683455. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-potential-13 — Il rapporto delle distanze per un bersaglio

Una sorgente puntiforme positiva Q è mantenuta fissa nel vuoto. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e si sceglie V=0 all’infinito. A distanza r>0 il potenziale scalare è V=k_eQ/r>0. Poniamo u=Q/(1 nC), ρ=r/(1 m) e v=V/(1 V), tutti puri: nelle unità dichiarate v=9u/ρ. Il potenziale non è il campo vettoriale e non è l’energia di una carica di prova. A ha Q=1 nC e r_A=3 m. C ha Q=4 nC e deve avere V_C=6V_A. Quanto vale r_C/r_A?

Procedimento d’autore: Il bersaglio è 18 V. Con u_C=4, la distanza normalizzata deve essere ρ_C=9·4/18=2, quindi r_C=2 m. Il rapporto richiesto è 2/3. Il parametro del potenziale è cambiato sia con Q sia con r.

Passaggi: V_C=18\,\mathrm V;  \rho_C=2;  r_C=2\,\mathrm m;  r_C/r_A=\frac23.

Distrattori: 3/2 inverte il confronto; quattro e sei copiano i fattori di sorgente e potenziale. 4/9 è il quadrato del rapporto delle distanze e apparterrebbe a una domanda diversa.

Hint: Usa la legge inversa per la nuova distanza prima di dividerla per quella iniziale.

Fonte canonica SHA256 f817077526d7c9e1097c04d969c320d7bf825e0bf95fe52d3592be0b70345e9e. Candidato SHA256 aeb2c8d48644dc80efe5fc85ec05d0f111883eca08118175b7c4903ad11fb647. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-potential-14 — Dai volt letti alla sorgente

Una sorgente puntiforme positiva Q è mantenuta fissa nel vuoto. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e si sceglie V=0 all’infinito. A distanza r>0 il potenziale scalare è V=k_eQ/r>0. Poniamo u=Q/(1 nC), ρ=r/(1 m) e v=V/(1 V), tutti puri: nelle unità dichiarate v=9u/ρ. Il potenziale non è il campo vettoriale e non è l’energia di una carica di prova. Il display continuo adimensionale è D=aV, a>0. A con Q=1 nC e r=3 m dà D=9. C ha r=2 m e D=54. Quanto vale Q_C in nC?

Procedimento d’autore: A ha potenziale 3 V, quindi il guadagno è a=3 V⁻¹. La lettura C significa V_C=54/3=18 V. Con ρ_C=2 si ricava u_C=18·2/9=4 e Q_C=4 nC. Il display non modifica il riferimento all’infinito della legge fisica.

Passaggi: a=3\,\mathrm{V^{-1}};  V_C=18\,\mathrm V;  u_C=4;  Q_C=4\,\mathrm{nC}.

Distrattori: Dodici nC tratta il display come volt e trascura a. Sei nC copia il rapporto dei potenziali senza la distanza cambiata. Uno nC darebbe 9/2 V alla nuova distanza, quindi D=27/2 e non 54.

Hint: Togli il guadagno prima di applicare Q=Vr/k_e.

Fonte canonica SHA256 6b9e65d68a509a61495c1b0d4041903d3608cddaab0aef0729e56236466bdf38. Candidato SHA256 7f93013c006631a8659dad43177444351fe4e1068e2c868cf709daa9a0786c59. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-potential-15 — Un offset del display non cambia lo zero fisico

Una sorgente puntiforme positiva Q è mantenuta fissa nel vuoto. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e si sceglie V=0 all’infinito. A distanza r>0 il potenziale scalare è V=k_eQ/r>0. Poniamo u=Q/(1 nC), ρ=r/(1 m) e v=V/(1 V), tutti puri: nelle unità dichiarate v=9u/ρ. Il potenziale non è il campo vettoriale e non è l’energia di una carica di prova. D=aV+b è un display continuo adimensionale, a>0. A: Q=1 nC, r=3 m, D=7. C: Q=4 nC, r=2 m, D=37. Prova G: r=3 m, D=13. Quanto vale Q_G?

Procedimento d’autore: I potenziali dei riferimenti sono 3 e 18 V. Il guadagno vale (37−7)/(18−3)=2 V⁻¹ e b=1. D=13 dà V_G=(13−1)/a=6 V. Alla distanza 3 m vale v_G=3u_G: Q_G=2 nC. b è l’offset dello strumento, mentre lo zero del potenziale fisico resta all’infinito.

Passaggi: a=2\,\mathrm{V^{-1}};  b=1;  V_G=6\,\mathrm V;  Q_G=2\,\mathrm{nC}.

Distrattori: 13/6 nC omette b e predice D=14. Uno nC torna ad A; quattro nC sottrae b senza dividere per a e predice D=25. Sei nC copia i volt come se fossero nanocoulomb e predice D=37.

Hint: Separa l’offset numerico dello strumento dal riferimento del potenziale.

Fonte canonica SHA256 d0743ae0235942d1554bc8e12ef76e17e51128024417a17415fffaae12ae0baf. Candidato SHA256 619513383ce93067831591da02e2ea0dc3f1e56609194ed9ac2666e0bf36bd9f. Revisione indipendente e human NOT_RUN.

## AR-u6-point-electric-potential-16 — Un vincolo che lascia libera la scala

Una sorgente puntiforme positiva Q è mantenuta fissa nel vuoto. Si usa k_e=9×10⁹ N·m²/C² come valore di modello e si sceglie V=0 all’infinito. A distanza r>0 il potenziale scalare è V=k_eQ/r>0. Poniamo u=Q/(1 nC), ρ=r/(1 m) e v=V/(1 V), tutti puri: nelle unità dichiarate v=9u/ρ. Il potenziale non è il campo vettoriale e non è l’energia di una carica di prova. Fra prove si impone Q=γr, con γ=(1/3) nC/m, cioè u=ρ/3. Si misura V=3 V. Quante coppie positive (Q,r) sono compatibili?

Procedimento d’autore: Sostituendo il vincolo, v=9(ρ/3)/ρ=3 per ogni ρ>0. La misura ripete l’informazione già contenuta nel vincolo e non fissa la scala. Q=1 nC a r=3 m e Q=2 nC a r=6 m sono due esempi distinti della stessa famiglia continua, ciascuno con sorgente fissata nella propria prova.

Passaggi: u=\rho/3;  v=\frac{9(\rho/3)}{\rho};  v=3;  \rho>0.

Distrattori: La coppia del riferimento è solo un esempio, non l’unica. Due esempi non limitano a due soluzioni la variabile continua r. r=0 è escluso e renderebbe il potenziale puntiforme non definito.

Hint: Sostituisci il vincolo e verifica se rimane una dipendenza dalla scala r.

Fonte canonica SHA256 d2859d20cc8faacdbfcd23cd5a589b791b22e0d60ec4500e9bc4f98177e89f35. Candidato SHA256 7b356224ee1e111fa27ba2bfdc51419d3e189900eed0677534ba95452084f60c. Revisione indipendente e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 9d0b974c95e7f5d552105928409a891ec91be9c4a65dbb001816c9ab7226256f. Package file SHA256 9da6ddd08d0787de21f16d7be79b5100636b928d9eb0b4ac07124b631694f142. Binding file SHA256 2af5bb0551c5380ccb3f3ede765b28b4535b7143729531ba8d74707a0409f273. Prova strutturale SHA256 3197a8aadf0124716450f5a36fe9ac832748ed342f66d7dcff6835039c5a416e. Asset-only manifest SHA256 f3e67bb6bdda5c04f2fa09afe28b6466675867f6c2d071caf2a8537e16fbbcff.

Le coordinate intrinseche dell’SVG documentano proporzioni geometriche nella sorgente, non una misura in pixel fisici dopo ridimensionamento. I testi visibili usano soltanto grandezze fisiche e valori pertinenti. Le origini e le etichette sono separate dagli assi; la direzione di ciascuna freccia è letta insieme alla sua didascalia.
