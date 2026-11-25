# Authoring DRAFT — voltage-divider-211

Letti individualmente tutti i 16 prompt del presente lotto e completate separatamente le 80 derivazioni primarie B215–219 della fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U6-03 SHA256 0bd13e1748174df8c30e06641ad153b8e44ab98df47f31c9f1aba7f925f88077. I compiti e gli ID originali sono conservati e si rendono espliciti segni, domini, conversioni e svolgimenti. Riletti i testi reali C4-L05/L06/L07 per corrente, legge di Ohm, topologia dei nodi e distinzione da capacità ed energia elettrostatica. Prima dei candidati A, il revisore distinto B ha confermato primaria prompt-only 80 SHA256 5a11a0eae02cb2aaf503d979af679d9a586f1dc8572134ca7523f895ca07e509; quella primaria non è stata aperta dall’autore. La primaria A dei futuri 80 B215–219 è congelata separatamente SHA256 4c49ff1e2020d073891686e5289e263561531a9b81e84e2f0fa9c8648dc90f4b, senza esposizione U6 a chiavi altrui.

Autore soltanto: DRAFT; revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica.

Due assemblaggi in processi separati dell’assembler unico producono gli stessi byte package e binding. Importatore canonico ROOT su SQLite temporaneo: 16 nuovi, poi 0 nuovi e 16 invariati; tutti i 991 pubblicati e le versioni storiche rimangono invariati. Questo è collaudo tecnico strutturale e non giudizio scientifico.

UI prodotto NOT_RUN: per mandato dell’integratore non si avvia il browser dell’app durante il vincolo operativo sui replay locali. Non è stato creato o riusato alcun marker UI. Il diagramma SVG è stato letto come XML e sono state controllate le proporzioni intrinseche dei dati. La resa nativa Quick Look a piena altezza è stata realmente prodotta e letta, con log e PNG conservati: è asset-only, non un replay dell’app o una prova di layout a 320 px. Nessun CSS, runtime, registro, checkpoint o file candidato ROOT modificato.

## AR-u6-voltage-divider-01 — L’uscita sul secondo resistore

Un generatore ideale mantiene E=12 V fra i nodi A e B. Due resistori ohmici R₁>0 e R₂>0 finiti sono in serie: R₁ fra A e M, R₂ fra M e B. Dal nodo M non parte alcun altro carico; un eventuale voltmetro è ideale. La corrente è comune e orientata da A verso B. L’uscita U=V_M−V_B è la caduta positiva sul secondo resistore: U=E R₂/(R₁+R₂), con 0<U<E. Temperatura e valore del generatore restano fissati entro ogni prova. Con R₁=2 Ω e R₂=2 Ω, quanto vale U in V?

Procedimento d’autore: Il totale è 4 Ω e la corrente comune vale E/(R₁+R₂)=12 V/(4 Ω)=3 A. La caduta sul secondo elemento è U=IR₂=3 A·2 Ω=6 V. L’altra caduta vale anch’essa 6 V e la loro somma ricostruisce i 12 V del generatore.

Passaggi: I=\frac{12\,\mathrm V}{4\,\Omega};  I=3\,\mathrm A;  U=IR_2;  U=6\,\mathrm V.

Distrattori: Dodici V assegna tutta la tensione al secondo elemento e lascia zero al primo positivo. Tre copia il valore numerico della corrente in A senza moltiplicare per R₂. Quattro copia il totale in Ω e due copia un resistore: nessuno è la caduta richiesta.

Hint: Trova la corrente di serie e moltiplicala per il solo R₂.

Fonte canonica SHA256 d68ce4309649fd8d1d6cab3b0035bfcaaa06bb571e7f7056586e9d01e3798364. Candidato SHA256 def5dfeb89561c336f09fc4835fba3fca43e89426fc6a3f84c51b6ae0be5b607. Revisione indipendente e human NOT_RUN.

## AR-u6-voltage-divider-02 — Una caduta di potenziale

Un generatore ideale mantiene E=12 V fra i nodi A e B. Due resistori ohmici R₁>0 e R₂>0 finiti sono in serie: R₁ fra A e M, R₂ fra M e B. Dal nodo M non parte alcun altro carico; un eventuale voltmetro è ideale. La corrente è comune e orientata da A verso B. L’uscita U=V_M−V_B è la caduta positiva sul secondo resistore: U=E R₂/(R₁+R₂), con 0<U<E. Temperatura e valore del generatore restano fissati entro ogni prova. Quale unità esprime U?

Procedimento d’autore: U è una differenza di potenziale. Dal prodotto IR₂ si ottiene A·Ω=V. Anche nella formula del partitore il rapporto R₂/(R₁+R₂) è adimensionale, mentre E conserva l’unità volt.

Passaggi: U=IR_2;  [U]=\mathrm A\cdot\Omega;  [U]=\mathrm V.

Distrattori: Ampere misura corrente, ohm resistenza e watt potenza. Il rapporto delle resistenze è puro, ma il prodotto con E non lo è: perciò 1 non è l’unità dell’uscita.

Hint: Il rapporto delle resistenze moltiplica una tensione.

Fonte canonica SHA256 9ceffa0abd7de9993d3c5c94d7a58a19bb1af9f7b874ab0b14eb434cca135d69. Candidato SHA256 221e19274dc7fb25837b7eaa1bc27d49ab816b629be64677dfc37fb9bf22967d. Revisione indipendente e human NOT_RUN.

## AR-u6-voltage-divider-03 — La formula del partitore aperto

Un generatore ideale mantiene E=12 V fra i nodi A e B. Due resistori ohmici R₁>0 e R₂>0 finiti sono in serie: R₁ fra A e M, R₂ fra M e B. Dal nodo M non parte alcun altro carico; un eventuale voltmetro è ideale. La corrente è comune e orientata da A verso B. L’uscita U=V_M−V_B è la caduta positiva sul secondo resistore: U=E R₂/(R₁+R₂), con 0<U<E. Temperatura e valore del generatore restano fissati entro ogni prova. Quale relazione dà U?

Procedimento d’autore: La corrente comune è I=E/(R₁+R₂). Moltiplicando per R₂ si ricava U=E R₂/(R₁+R₂). L’assenza di carico al nodo M è essenziale: un resistore aggiuntivo verso B cambierebbe il blocco inferiore e quindi il partitore.

Passaggi: I=\frac E{R_1+R_2};  U=IR_2;  U=E\frac{R_2}{R_1+R_2}.

Distrattori: R₁ al numeratore dà l’altra caduta. Invertire il rapporto produce U>E e viola il dominio; dividere per il solo R₁ omette R₂ nel totale. ER₁R₂ ha unità V·Ω², non V.

Hint: Usa la resistenza dell’uscita al numeratore e la somma al denominatore.

Fonte canonica SHA256 5cc0e56f935081767852c3a53fe7bc36771a9169008184727b3b9c677d92d165. Candidato SHA256 9eaf684c63a5bc4a723f47993692bee48db3345fb77c61181387b53f79910127. Revisione indipendente e human NOT_RUN.

## AR-u6-voltage-divider-04 — Diminuisce la resistenza superiore

Un generatore ideale mantiene E=12 V fra i nodi A e B. Due resistori ohmici R₁>0 e R₂>0 finiti sono in serie: R₁ fra A e M, R₂ fra M e B. Dal nodo M non parte alcun altro carico; un eventuale voltmetro è ideale. La corrente è comune e orientata da A verso B. L’uscita U=V_M−V_B è la caduta positiva sul secondo resistore: U=E R₂/(R₁+R₂), con 0<U<E. Temperatura e valore del generatore restano fissati entro ogni prova. R₁ passa da 2 a 1 Ω, mentre R₂ resta 2 Ω. Come cambia U?

Procedimento d’autore: Prima I_A=12/4=3 A e U_A=6 V. Dopo il totale è 3 Ω, quindi I_B=12/3=4 A e U_B=4·2=8 V. Il generatore mantiene la tensione, non la corrente: riducendo R₁ cresce la corrente e aumenta la caduta sul R₂ invariato.

Passaggi: U_A=6\,\mathrm V;  I_B=4\,\mathrm A;  U_B=8\,\mathrm V.

Distrattori: Tre V dimezza l’uscita come se fosse direttamente proporzionale a R₁. Sei la conserva come se I fosse fissata. Dodici eliminerebbe del tutto la caduta sul primo resistore; quattro è la caduta finale su R₁, non su R₂.

Hint: Il denominatore del partitore diminuisce, il numeratore resta uguale.

Fonte canonica SHA256 e7b1ff9cc82323e1ffc729ed3810ef3eb7921fbcdf8eeff34974d6514aa2d2bf. Candidato SHA256 ed654408dd887f39a17e92b7fff60ddc3619c664a86bdffca6046055b2d9b15d. Revisione indipendente e human NOT_RUN.

## AR-u6-voltage-divider-05 — Ricostruire R₁

Un generatore ideale mantiene E=12 V fra i nodi A e B. Due resistori ohmici R₁>0 e R₂>0 finiti sono in serie: R₁ fra A e M, R₂ fra M e B. Dal nodo M non parte alcun altro carico; un eventuale voltmetro è ideale. La corrente è comune e orientata da A verso B. L’uscita U=V_M−V_B è la caduta positiva sul secondo resistore: U=E R₂/(R₁+R₂), con 0<U<E. Temperatura e valore del generatore restano fissati entro ogni prova. Si misura U=6 V e si conosce R₂=2 Ω. Quanto vale R₁ in Ω?

Procedimento d’autore: Da U(R₁+R₂)=ER₂ segue UR₁=(E−U)R₂. Dividendo per U si trova R₁=R₂(E−U)/U. Con i dati: 2 Ω·(12−6)/6=2 Ω. Il dominio 0<U<E assicura una resistenza positiva.

Passaggi: UR_1=(E-U)R_2;  R_1=R_2\frac{E-U}{U};  R_1=2\,\Omega.

Distrattori: Sei Ω darebbe U=3 V; quattro Ω darebbe U=4 V. Sottrarre direttamente 6 V da 2 Ω mescola grandezze incompatibili. La divisione per U non è ammessa al confine U=0.

Hint: Porta il termine UR₂ a destra prima di dividere per U.

Fonte canonica SHA256 7537e5f8cae60e2be5c4f9d0afc78868ce70c901968d111021803956fe46d913. Candidato SHA256 000ae646dee346c2682db9c7f9294da4efecf24270aba46e929c4fe1d4db5c83. Revisione indipendente e human NOT_RUN.

## AR-u6-voltage-divider-06 — Ricostruire R₂

Un generatore ideale mantiene E=12 V fra i nodi A e B. Due resistori ohmici R₁>0 e R₂>0 finiti sono in serie: R₁ fra A e M, R₂ fra M e B. Dal nodo M non parte alcun altro carico; un eventuale voltmetro è ideale. La corrente è comune e orientata da A verso B. L’uscita U=V_M−V_B è la caduta positiva sul secondo resistore: U=E R₂/(R₁+R₂), con 0<U<E. Temperatura e valore del generatore restano fissati entro ogni prova. Si misura U=6 V e si conosce R₁=2 Ω. Quanto vale R₂ in Ω?

Procedimento d’autore: La stessa equazione può essere raccolta nell’altra incognita: UR₁=(E−U)R₂. Si divide per E−U>0 e si ottiene R₂=UR₁/(E−U). Con 6 V, 2 Ω e 12 V: R₂=12/6 Ω=2 Ω.

Passaggi: UR_1=(E-U)R_2;  R_2=\frac{UR_1}{E-U};  R_2=2\,\Omega.

Distrattori: Quattro Ω darebbe U=8 V; un Ω darebbe U=4 V. Sommare E e U al denominatore non deriva dall’equazione e darebbe 2/3 Ω. Il confine U=E non permette R₁>0 con R₂ finita.

Hint: Per l’inversa inferiore il divisore è E−U, non U.

Fonte canonica SHA256 08b905c92b8650916c8a6148c9692b354ff40a9c2b418ffa1d62c3704cf0292c. Candidato SHA256 086a69ab399868b8082906c2a9793a9d620a67a4d59984a0458ac57cf30c274c. Revisione indipendente e human NOT_RUN.

## AR-u6-voltage-divider-07 — Aumenta R₂ a generatore fisso

Un generatore ideale mantiene E=12 V fra i nodi A e B. Due resistori ohmici R₁>0 e R₂>0 finiti sono in serie: R₁ fra A e M, R₂ fra M e B. Dal nodo M non parte alcun altro carico; un eventuale voltmetro è ideale. La corrente è comune e orientata da A verso B. L’uscita U=V_M−V_B è la caduta positiva sul secondo resistore: U=E R₂/(R₁+R₂), con 0<U<E. Temperatura e valore del generatore restano fissati entro ogni prova. A ha R₁=2 Ω, R₂=2 Ω. B mantiene R₁ e ha R₂=4 Ω. Quanto vale U_B/U_A?

Procedimento d’autore: A dà 6 V. B ha totale 6 Ω, corrente 2 A e uscita U_B=2·4=8 V. Il rapporto 8/6 è 4/3. Raddoppiare R₂ non raddoppia U perché aumenta anche la resistenza totale e diminuisce I.

Passaggi: U_A=6\,\mathrm V;  U_B=8\,\mathrm V;  \frac{U_B}{U_A}=\frac43.

Distrattori: 3/4 è il reciproco. Due segue solo R₂ senza il totale; un mezzo ne inverte l’effetto; uno ignora la modifica. La nuova uscita deve restare minore dei 12 V del generatore.

Hint: Valuta sia il numeratore sia il denominatore della nuova prova.

Fonte canonica SHA256 beeb372d35b6791121c85de55ae6b5e9b0714b651c67a41224a462340cbb81bf. Candidato SHA256 cb60bc7c9c16cea503f2c12c38a73590cb2660796f9fee04536698734f36f35e. Revisione indipendente e human NOT_RUN.

## AR-u6-voltage-divider-08 — Lo scarto non è un rapporto

Un generatore ideale mantiene E=12 V fra i nodi A e B. Due resistori ohmici R₁>0 e R₂>0 finiti sono in serie: R₁ fra A e M, R₂ fra M e B. Dal nodo M non parte alcun altro carico; un eventuale voltmetro è ideale. La corrente è comune e orientata da A verso B. L’uscita U=V_M−V_B è la caduta positiva sul secondo resistore: U=E R₂/(R₁+R₂), con 0<U<E. Temperatura e valore del generatore restano fissati entro ogni prova. Con R₁=R₂=2 Ω si propone U=12 V. Quanto vale proposta meno corretto?

Procedimento d’autore: La corretta caduta inferiore è 6 V. La proposta la supera di 12−6=6 V. Il numero puro due è invece il rapporto tra proposta e corretto. La differenza deve mantenere l’unità volt.

Passaggi: U=6\,\mathrm V;  e=(12-6)\,\mathrm V;  e=6\,\mathrm V.

Distrattori: −6 inverte l’ordine; dodici copia la proposta; zero la accetta. Due non è uno scarto di tensione e manca dell’unità pertinente.

Hint: Dividi prima la tensione fra i due resistori uguali.

Fonte canonica SHA256 06cdaa07f14a349eba8d29784f95204f3242b300392ba31831cf6549c0ef8d68. Candidato SHA256 4b17e33d33f19e0752d4fe348cdb00d3ce6b0f3310c07aec8305c2933cfac3db. Revisione indipendente e human NOT_RUN.

## AR-u6-voltage-divider-09 — La formula inversa superiore

Un generatore ideale mantiene E=12 V fra i nodi A e B. Due resistori ohmici R₁>0 e R₂>0 finiti sono in serie: R₁ fra A e M, R₂ fra M e B. Dal nodo M non parte alcun altro carico; un eventuale voltmetro è ideale. La corrente è comune e orientata da A verso B. L’uscita U=V_M−V_B è la caduta positiva sul secondo resistore: U=E R₂/(R₁+R₂), con 0<U<E. Temperatura e valore del generatore restano fissati entro ogni prova. Sono noti U, E e R₂. Quale formula isola R₁?

Procedimento d’autore: Moltiplichiamo per il totale: U(R₁+R₂)=ER₂. Sottraendo UR₂ e dividendo per U>0 si ottiene R₁=R₂(E−U)/U. Il rapporto delle tensioni è puro, quindi l’unità rimane Ω; E−U è positivo nel dominio.

Passaggi: U(R_1+R_2)=ER_2;  UR_1=(E-U)R_2;  R_1=R_2\frac{E-U}{U}.

Distrattori: Il più al posto del meno non isola il termine. UR₂/(E−U) è l’inversa per R₂ quando il noto è R₁: non risolve questa incognita. U/R₂ misura corrente e R₂−U sottrae Ω e V.

Hint: Controlla insieme l’algebra e il dominio 0<U<E.

Fonte canonica SHA256 01abbac9a128a217e0002ad1c43a0f0aa113402d5f46b61141216ab1080c03da. Candidato SHA256 651e31c65d2d83d7623bd6cc30acbffef86fc9d72f0e8871cbf53a17ea876194. Revisione indipendente e human NOT_RUN.

## AR-u6-voltage-divider-10 — Un rapporto con somme definite

Un generatore ideale mantiene E=12 V fra i nodi A e B. Due resistori ohmici R₁>0 e R₂>0 finiti sono in serie: R₁ fra A e M, R₂ fra M e B. Dal nodo M non parte alcun altro carico; un eventuale voltmetro è ideale. La corrente è comune e orientata da A verso B. L’uscita U=V_M−V_B è la caduta positiva sul secondo resistore: U=E R₂/(R₁+R₂), con 0<U<E. Temperatura e valore del generatore restano fissati entro ogni prova. B usa R₁,B=κ₁R₁ e R₂,B=κ₂R₂, con fattori positivi. Definiamo S=R₁+R₂ e S_B=κ₁R₁+κ₂R₂, entrambe resistenze totali. Quanto vale U_B/U_A?

Procedimento d’autore: Il generatore E resta lo stesso e si cancella nel rapporto. Il numeratore inferiore porta κ₂, mentre il totale passa da S a S_B. Pertanto U_B/U_A=κ₂S/S_B. Con κ₁=κ₂ le due resistenze sono scalate insieme e l’uscita non cambia.

Passaggi: U_A=E\frac{R_2}{S};  U_B=E\frac{\kappa_2R_2}{S_B};  \frac{U_B}{U_A}=\frac{\kappa_2S}{S_B}.

Distrattori: κ₁ davanti a S scala la resistenza sbagliata al numeratore. Il prodotto dei fattori omette i pesi del totale; S_B/(κ₂S) inverte il confronto. κ₂/κ₁ non descrive una somma di resistenze al denominatore.

Hint: Distingui il fattore dell’elemento inferiore dalla variazione del totale.

Fonte canonica SHA256 ccd66a40c96ecb427581606005478f9d472664693428276d8b6d9b3f8f98c3f7. Candidato SHA256 2697c7384eb3cb728302a580628d60fa5de1e4edd2ecbcf9f00d98fc00f6ee1d. Revisione indipendente e human NOT_RUN.

## AR-u6-voltage-divider-11 — Una nuova ripartizione

Un generatore ideale mantiene E=12 V fra i nodi A e B. Due resistori ohmici R₁>0 e R₂>0 finiti sono in serie: R₁ fra A e M, R₂ fra M e B. Dal nodo M non parte alcun altro carico; un eventuale voltmetro è ideale. La corrente è comune e orientata da A verso B. L’uscita U=V_M−V_B è la caduta positiva sul secondo resistore: U=E R₂/(R₁+R₂), con 0<U<E. Temperatura e valore del generatore restano fissati entro ogni prova. A ha R₁=2 Ω e R₂=2 Ω. B ha R₁=3 Ω e R₂=1 Ω. Quanto vale U_B/U_A?

Procedimento d’autore: Entrambe le prove hanno resistenza totale 4 Ω e corrente 3 A. Le cadute inferiori sono 6 V per A e 3 V per B. Il rapporto è 1/2. La somma uguale rende qui il rapporto delle uscite uguale a quello dei soli R₂.

Passaggi: U_A=6\,\mathrm V;  U_B=3\,\mathrm V;  \frac{U_B}{U_A}=\frac12.

Distrattori: Due inverte il rapporto. 3/2 segue soltanto R₁ e un terzo usa il rapporto R₂,B/R₁,B, che non è la frazione della tensione totale. Uno riconosce il totale uguale ma ignora che cambia il suo riparto.

Hint: Calcola la frazione inferiore in ciascuna prova.

Fonte canonica SHA256 70e710e191f6c8235954d0223fe3d009c3a67d301cffbca18a30dbd876cc7c89. Candidato SHA256 7c91e1d0e00f8a835fbd4e777a2ae5fd254f6011b6fe10c4f4c22cc847ec56c9. Revisione indipendente e human NOT_RUN.

## AR-u6-voltage-divider-12 — Una coincidenza delle medie

Un generatore ideale mantiene E=12 V fra i nodi A e B. Due resistori ohmici R₁>0 e R₂>0 finiti sono in serie: R₁ fra A e M, R₂ fra M e B. Dal nodo M non parte alcun altro carico; un eventuale voltmetro è ideale. La corrente è comune e orientata da A verso B. L’uscita U=V_M−V_B è la caduta positiva sul secondo resistore: U=E R₂/(R₁+R₂), con 0<U<E. Temperatura e valore del generatore restano fissati entro ogni prova. A usa R₁=2 Ω, R₂=2 Ω; B usa R₁=3 Ω, R₂=1 Ω. Qual è la media aritmetica delle due U con uguale peso?

Procedimento d’autore: Le uscite sono 6 e 3 V, quindi la loro media è 9/2 V. Per questi dati anche il modello sulle medie R₁=5/2 Ω e R₂=3/2 Ω dà 12·(3/2)/4=9/2 V. La coincidenza deriva dal totale identico 4 Ω nelle due prove: non è una proprietà generale del partitore.

Passaggi: \overline U=\frac{6+3}{2}\,\mathrm V;  \overline U=\frac92\,\mathrm V;  U_{\rm dati\ medi}=\frac92\,\mathrm V.

Distrattori: Nove V omette la divisione per due; 3/2 V è metà della differenza. Sei e tre ripetono una singola prova. Qui non serve distinguere numericamente le due medie coincidenti, ma va motivato perché coincidono.

Hint: Media le due tensioni già calcolate e controlla il totale comune.

Fonte canonica SHA256 216fb633e9b8dbb3641056ddd8fa6aa149afc95b0333eb17fa726ba0a1ef1f26. Candidato SHA256 dc1cfc5bcfe448e58cddd062ca35b7c7fc700b7281ed37a3dc75c33c0d20312a. Revisione indipendente e human NOT_RUN.

## AR-u6-voltage-divider-13 — R₂ per dimezzare l’uscita

Un generatore ideale mantiene E=12 V fra i nodi A e B. Due resistori ohmici R₁>0 e R₂>0 finiti sono in serie: R₁ fra A e M, R₂ fra M e B. Dal nodo M non parte alcun altro carico; un eventuale voltmetro è ideale. La corrente è comune e orientata da A verso B. L’uscita U=V_M−V_B è la caduta positiva sul secondo resistore: U=E R₂/(R₁+R₂), con 0<U<E. Temperatura e valore del generatore restano fissati entro ogni prova. A ha R₁=R₂=2 Ω. B usa R₁=3 Ω e deve dare U_B=U_A/2. Quanto vale R₂,B/R₂,A?

Procedimento d’autore: Il bersaglio è 3 V. Dall’inversa inferiore R₂,B=U_BR₁,B/(E−U_B)=3·3/(12−3) Ω=1 Ω. Il rapporto con R₂,A=2 Ω è 1/2. La tensione bersaglio è positiva e minore di E, quindi l’inversa è nel dominio.

Passaggi: U_B=3\,\mathrm V;  R_{2,B}=1\,\Omega;  \frac{R_{2,B}}{R_{2,A}}=\frac12.

Distrattori: Due inverte il rapporto. Un terzo confonde il rapporto dei due resistori nella prova B con quello di R₂ fra prove. 3/2 segue R₁ e uno non cambia R₂: nessuno ricostruisce l’uscita 3 V con R₁=3 Ω.

Hint: Fissa la tensione bersaglio prima di invertire la legge.

Fonte canonica SHA256 38195b7d448c76156d81cbed09c95b185d4ffd09ae746668dc9d67259d4113ec. Candidato SHA256 a4bcdd37cdb77e8df5d4ae40a0eab99db63d4af8e8c714975e679c1b1a0f7019. Revisione indipendente e human NOT_RUN.

## AR-u6-voltage-divider-14 — Un display proporzionale

Un generatore ideale mantiene E=12 V fra i nodi A e B. Due resistori ohmici R₁>0 e R₂>0 finiti sono in serie: R₁ fra A e M, R₂ fra M e B. Dal nodo M non parte alcun altro carico; un eventuale voltmetro è ideale. La corrente è comune e orientata da A verso B. L’uscita U=V_M−V_B è la caduta positiva sul secondo resistore: U=E R₂/(R₁+R₂), con 0<U<E. Temperatura e valore del generatore restano fissati entro ogni prova. D=a_cal U è continuo e adimensionale, a_cal>0, senza offset. A con R₁=R₂=2 Ω dà D=18. C dà D=9 e ha R₂=1 Ω. Quanto vale R₁,C in Ω?

Procedimento d’autore: Il riferimento ha U_A=6 V, perciò a_cal=18/(6 V)=3 V⁻¹. La lettura 9 significa U_C=3 V. L’inversa superiore dà R₁,C=1 Ω·(12−3)/3=3 Ω. Non si interpreta 9 come volt senza rimuovere la taratura.

Passaggi: a_{\rm cal}=3\,\mathrm V^{-1};  U_C=3\,\mathrm V;  R_{1,C}=3\,\Omega.

Distrattori: 1/3 Ω usa D=9 direttamente come tensione e darebbe un’uscita 9 V. Uno Ω darebbe U=6 V; nove Ω darebbe 6/5 V. Il risultato tre Ω restituisce invece U=3 V e D=9.

Hint: Decodifica la tensione prima dell’inversa di R₁.

Fonte canonica SHA256 4368c9cd7f38ed959a07183cfc644e702d5d15f693485f34625a26baeac615d5. Candidato SHA256 a0824a7446b26edd3295a42d193f3f48882b4f8240bbc7a3983f14da7e7d527e. Revisione indipendente e human NOT_RUN.

## AR-u6-voltage-divider-15 — Guadagno e offset prima dell’inversa

Un generatore ideale mantiene E=12 V fra i nodi A e B. Due resistori ohmici R₁>0 e R₂>0 finiti sono in serie: R₁ fra A e M, R₂ fra M e B. Dal nodo M non parte alcun altro carico; un eventuale voltmetro è ideale. La corrente è comune e orientata da A verso B. L’uscita U=V_M−V_B è la caduta positiva sul secondo resistore: U=E R₂/(R₁+R₂), con 0<U<E. Temperatura e valore del generatore restano fissati entro ogni prova. D=a_cal U+b è continuo e adimensionale. A: R₁=2 Ω, R₂=2 Ω, D=13. B: R₁=3 Ω, R₂=1 Ω, D=7. C: R₂=2 Ω, D=17. Quanto vale R₁,C?

Procedimento d’autore: I riferimenti danno U_A=6 V e U_B=3 V. Guadagno a_cal=(13−7)/(6−3) V⁻¹=2 V⁻¹ e b=1. C ha U_C=(17−1)/2 V=8 V, ancora fra zero e 12 V. R₁,C=2 Ω·(12−8)/8=1 Ω.

Passaggi: a_{\rm cal}=2\,\mathrm V^{-1};  b=1;  U_C=8\,\mathrm V;  R_{1,C}=1\,\Omega.

Distrattori: 14/17 Ω omette l’offset e usa U=17/2 V: ricostruisce D=18, non 17. Due Ω dà D=13; quattro Ω dà D=9; otto Ω dà D=29/5. Solo uno Ω riproduce la lettura assegnata.

Hint: Sottrai b prima di dividere per a_cal, poi controlla U<E.

Fonte canonica SHA256 e86cb86b590dbafc551822433fc5c259454c7f06ffbda94677c7f5f3ea61cef3. Candidato SHA256 033324551fc4698ec306969a89598ba6704f61240e2e3b105a5c1deaaa3049bc. Revisione indipendente e human NOT_RUN.

## AR-u6-voltage-divider-16 — La misura non fissa la scala

Un generatore ideale mantiene E=12 V fra i nodi A e B. Due resistori ohmici R₁>0 e R₂>0 finiti sono in serie: R₁ fra A e M, R₂ fra M e B. Dal nodo M non parte alcun altro carico; un eventuale voltmetro è ideale. La corrente è comune e orientata da A verso B. L’uscita U=V_M−V_B è la caduta positiva sul secondo resistore: U=E R₂/(R₁+R₂), con 0<U<E. Temperatura e valore del generatore restano fissati entro ogni prova. Fra preparazioni vale R₁=R₂. Si misura inoltre U=6 V. Quante coppie positive (R₁,R₂) sono determinate?

Procedimento d’autore: Il vincolo rende la frazione inferiore R₂/(R₁+R₂)=1/2, quindi U=E/2=6 V per ogni resistenza comune x>0 finita. La misura è ridondante e non fissa x. Esempi sono 1 e 1 Ω oppure 2 e 2 Ω; le correnti differiscono, mentre il rapporto delle cadute resta uguale.

Passaggi: R_1=R_2; R_2=x;  U=E\frac{x}{2x};  U=\frac E2;  U=6\,\mathrm V.

Distrattori: Le coppie singole sono esempi, non soluzioni uniche. Nessuna è esclusa dagli esempi espliciti. Non tutte le coppie positive sono ammesse: occorre l’uguaglianza imposta. Una misura di corrente fornirebbe una nuova informazione di scala, ma non è data.

Hint: Sostituisci il vincolo e verifica se resta una resistenza libera.

Fonte canonica SHA256 292852ec181a7a16b426a5a454261d327d238e99ca07bea8c1902c9502648fd2. Candidato SHA256 3538ed510450f9016ef58e08fe91688b4fafe48b7429a60c6d06b209ec070a85. Revisione indipendente e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 d217764d45745831f6e2d2b1af3a4f27a59bc04cb2950461eb27392cc628e6b4. Package file SHA256 289d684c2f85b40230942cddcae194763ce64ec7b8cc0939996cf0e3a317f767. Binding file SHA256 ffdd2cbaf0e1a0236f8df7b31da3f10202159d534b9e3ffdbfa48ce6f03e42b6. Prova strutturale SHA256 8469e92635ee6eb734da8395c484f1bb7ae5a165179af405aa23d0ed1bcc35de. Asset-only manifest SHA256 eb557825154eb39dd23ac36975f07445a04360bee284e395edc681354b8f3f4e.

Le coordinate intrinseche dell’SVG documentano proporzioni geometriche nella sorgente, non una misura in pixel fisici dopo ridimensionamento. I testi visibili usano soltanto grandezze fisiche e valori pertinenti. Le origini e le etichette sono separate dagli assi; la direzione di ciascuna freccia è letta insieme alla sua didascalia.

Proporzioni tecniche della figura: nel pannello centrale le due somme di cadute hanno ampiezza comune 360 coordinate per 12 V (30 coordinate/V), con segmenti 180+180 e 120+240. Nel pannello finale 6, 3, 9/2 V hanno barre 240, 120, 180 (40 coordinate/V). Il circuito superiore ha un’uscita aperta e nessun carico aggiunto; i simboli resistivi sono schematici. Queste coordinate non sono pixel fisici richiesti allo studente.
