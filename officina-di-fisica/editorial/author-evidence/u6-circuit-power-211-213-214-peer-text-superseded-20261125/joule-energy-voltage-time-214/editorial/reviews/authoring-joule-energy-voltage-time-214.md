# Authoring DRAFT — joule-energy-voltage-time-214

Letti individualmente tutti i 16 prompt del presente lotto e completate separatamente le 80 derivazioni primarie B215–219 della fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U6-03 SHA256 0bd13e1748174df8c30e06641ad153b8e44ab98df47f31c9f1aba7f925f88077. I compiti e gli ID originali sono conservati e si rendono espliciti segni, domini, conversioni e svolgimenti. Riletti i testi reali C4-L05/L06/L07 per corrente, legge di Ohm, topologia dei nodi e distinzione da capacità ed energia elettrostatica. Prima dei candidati A, il revisore distinto B ha confermato primaria prompt-only 80 SHA256 5a11a0eae02cb2aaf503d979af679d9a586f1dc8572134ca7523f895ca07e509; quella primaria non è stata aperta dall’autore. La primaria A dei futuri 80 B215–219 è congelata separatamente SHA256 4c49ff1e2020d073891686e5289e263561531a9b81e84e2f0fa9c8648dc90f4b, senza esposizione U6 a chiavi altrui.

Autore soltanto: DRAFT; revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica.

Due assemblaggi in processi separati dell’assembler unico producono gli stessi byte package e binding. Importatore canonico ROOT su SQLite temporaneo: 16 nuovi, poi 0 nuovi e 16 invariati; tutti i 991 pubblicati e le versioni storiche rimangono invariati. Questo è collaudo tecnico strutturale e non giudizio scientifico.

UI prodotto NOT_RUN: per mandato dell’integratore non si avvia il browser dell’app durante il vincolo operativo sui replay locali. Non è stato creato o riusato alcun marker UI. Il diagramma SVG è stato letto come XML e sono state controllate le proporzioni intrinseche dei dati. La resa nativa Quick Look a piena altezza è stata realmente prodotta e letta, con log e PNG conservati: è asset-only, non un replay dell’app o una prova di layout a 320 px. Nessun CSS, runtime, registro, checkpoint o file candidato ROOT modificato.

## AR-u6-joule-energy-voltage-time-01 — Energia dopo tre secondi

Un resistore ohmico ha R=2 Ω, mantenuta costante. In ogni prova si applica una caduta positiva V costante per una durata T>0 finita; il tempo interno τ va da 0 a T. L’energia E assorbita elettricamente e convertita termicamente nell’intervallo è E=(V²/R)T. La corrente V/R e la potenza V²/R restano costanti durante la prova. Fra prove V e T possono cambiare; non si assume che l’energia resti accumulata nel resistore o che ne determini da sola l’aumento di temperatura. Con V=2 V e T=3 s, quanto vale E in J?

Procedimento d’autore: La potenza è P=V²/R=4 V²/(2 Ω)=2 W. Rimane tale per tre secondi, perciò E=PT=2 W·3 s=6 J. Due è il valore numerico della potenza, non l’energia totale. L’intervallo inizia con energia cumulata E(0)=0.

Passaggi: P=\frac{V^2}{R};  P=2\,\mathrm W;  E=PT;  E=6\,\mathrm J.

Distrattori: Dodici J omette la divisione per R=2 Ω nella sostituzione numerica. Due J copia il numero della potenza; tre copia la durata; 2/3 rende inversa la dipendenza dal tempo. Il prodotto W·s deve dare joule.

Hint: Trova prima la potenza costante e poi moltiplicala per la durata.

Fonte canonica SHA256 6a6a9271a25a7a1dbd245db855e8899a7c73404d43a5caa1228fb9b3e412a99a. Candidato SHA256 cc112892bcd3b5e99fc4b12525f8dc5ced3149bd1c505a88dfff7be50b7cae8e. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-energy-voltage-time-02 — Joule, non watt

Un resistore ohmico ha R=2 Ω, mantenuta costante. In ogni prova si applica una caduta positiva V costante per una durata T>0 finita; il tempo interno τ va da 0 a T. L’energia E assorbita elettricamente e convertita termicamente nell’intervallo è E=(V²/R)T. La corrente V/R e la potenza V²/R restano costanti durante la prova. Fra prove V e T possono cambiare; non si assume che l’energia resti accumulata nel resistore o che ne determini da sola l’aumento di temperatura. Quale unità esprime E?

Procedimento d’autore: L’energia dissipata nell’intero intervallo ha unità joule. P si misura in W=J/s; moltiplicare per T in s restituisce J. La durata è un dato necessario per passare dalla potenza all’energia.

Passaggi: E=PT;  [E]=\mathrm W\cdot\mathrm s;  [E]=\mathrm J.

Distrattori: Il watt misura potenza, il volt una differenza di potenziale, il secondo una durata e l’ohm una resistenza. Nessuno di questi da solo esprime l’energia richiesta.

Hint: Individua se la domanda riguarda un ritmo o il totale nell’intervallo.

Fonte canonica SHA256 8182473971e678aacaab1b3be918d1f425ceb6b86836876f0ddbc8e6625167e8. Candidato SHA256 d343f61178e0da658b38419a4f6b4e044ed846a757656fc2296878427a4c0305. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-energy-voltage-time-03 — Integrare una potenza costante

Un resistore ohmico ha R=2 Ω, mantenuta costante. In ogni prova si applica una caduta positiva V costante per una durata T>0 finita; il tempo interno τ va da 0 a T. L’energia E assorbita elettricamente e convertita termicamente nell’intervallo è E=(V²/R)T. La corrente V/R e la potenza V²/R restano costanti durante la prova. Fra prove V e T possono cambiare; non si assume che l’energia resti accumulata nel resistore o che ne determini da sola l’aumento di temperatura. Quale legge fisica dà E, usando anche R=2 Ω esplicita?

Procedimento d’autore: Nel resistore I=V/R e P=VI=V²/R. Poiché V e R non cambiano durante la prova, integrare P da τ=0 a T equivale a moltiplicare per T. La durata compare una volta sola e al numeratore. Il valore R=2 Ω si sostituisce conservando le unità.

Passaggi: P=\frac{V^2}{R};  E=\int_0^T P\,d\tau;  E=\frac{V^2T}{R}.

Distrattori: VT/R non ha unità di energia e perde un fattore V. Dividere per T rende inverso il tempo; moltiplicare per R inverte la legge della potenza a tensione fissata. T² descriverebbe un’altra dipendenza temporale, non una potenza costante.

Hint: Il rettangolo sotto P(τ) ha altezza P e larghezza T.

Fonte canonica SHA256 47399c810fe1d388d0398eec706bafa26d2ff049ab333389c524b8c3e3ab9642. Candidato SHA256 39be24c692ceafde19f2f2f00fc5c0060746ec394c712a68d2ecace3b8830204. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-energy-voltage-time-04 — Metà tensione per la stessa durata

Un resistore ohmico ha R=2 Ω, mantenuta costante. In ogni prova si applica una caduta positiva V costante per una durata T>0 finita; il tempo interno τ va da 0 a T. L’energia E assorbita elettricamente e convertita termicamente nell’intervallo è E=(V²/R)T. La corrente V/R e la potenza V²/R restano costanti durante la prova. Fra prove V e T possono cambiare; non si assume che l’energia resti accumulata nel resistore o che ne determini da sola l’aumento di temperatura. V passa da 2 a 1 V, mentre T resta 3 s. Come cambia E?

Procedimento d’autore: L’energia iniziale è 6 J. Con metà tensione la potenza si riduce a un quarto: P_B=1²/(2 Ω)=1/2 W. Per tre secondi l’energia finale è (1/2)·3=3/2 J. La resistenza non è cambiata.

Passaggi: P_B=\frac12\,\mathrm W;  E_B=\frac12\cdot3\,\mathrm J;  E_B=\frac32\,\mathrm J.

Distrattori: Tre J usa una legge lineare in V. Sei ignora la modifica; dodici o ventiquattro rendono inverso il cambiamento della tensione, mentre a R fissata la potenza dipende direttamente da V².

Hint: Prima considera il quadrato del rapporto delle tensioni.

Fonte canonica SHA256 ce10458b38b47000d0ed90b4d8cae5e6b00bd4ff2ee7ba99118f5352875ccf99. Candidato SHA256 fd05ceb337bc2bf93baf80b4f3e6f72a854a79a07ad38346db963bf9ebb59528. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-energy-voltage-time-05 — Tensione dall’energia

Un resistore ohmico ha R=2 Ω, mantenuta costante. In ogni prova si applica una caduta positiva V costante per una durata T>0 finita; il tempo interno τ va da 0 a T. L’energia E assorbita elettricamente e convertita termicamente nell’intervallo è E=(V²/R)T. La corrente V/R e la potenza V²/R restano costanti durante la prova. Fra prove V e T possono cambiare; non si assume che l’energia resti accumulata nel resistore o che ne determini da sola l’aumento di temperatura. Si misura E=6 J e si conosce T=3 s. Quanto vale V in volt?

Procedimento d’autore: Da E=V²T/R si moltiplica per R e si divide per T>0: V²=ER/T. Con 6 J, 2 Ω e 3 s si ottiene 4 V². La radice positiva è 2 V, come richiesto dal dominio della caduta applicata.

Passaggi: V^2=\frac{ER}{T};  V^2=4\,\mathrm{V^2};  V=2\,\mathrm V.

Distrattori: Quattro V copia V² e darebbe 24 J. −2 V non è la caduta positiva chiesta, anche se il quadrato produrrebbe la stessa energia. Sei V darebbe 54 J. Il ramo positivo e le unità della radice sono entrambi necessari.

Hint: Ricava prima V² con energia, resistenza e durata coerenti.

Fonte canonica SHA256 cd3dc5a63326776d4e265781c952adc771cd5f30ffafe3086bc3ec10a85be711. Candidato SHA256 4c662180a7f3fbbd80fc28bce564480740b0aabbf8192f99b71d78c1dca14276. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-energy-voltage-time-06 — Durata dall’energia

Un resistore ohmico ha R=2 Ω, mantenuta costante. In ogni prova si applica una caduta positiva V costante per una durata T>0 finita; il tempo interno τ va da 0 a T. L’energia E assorbita elettricamente e convertita termicamente nell’intervallo è E=(V²/R)T. La corrente V/R e la potenza V²/R restano costanti durante la prova. Fra prove V e T possono cambiare; non si assume che l’energia resti accumulata nel resistore o che ne determini da sola l’aumento di temperatura. Si misura E=6 J con V=2 V. Quanto vale T in s?

Procedimento d’autore: La potenza è 2 W. Dalla relazione E=PT si ricava T=E/P=6 J/(2 W)=3 s. In forma equivalente T=ER/V². L’energia positiva e la tensione non nulla danno una durata positiva finita.

Passaggi: T=\frac{ER}{V^2};  T=\frac{6\cdot2}{4}\,\mathrm s;  T=3\,\mathrm s.

Distrattori: Sei s raddoppia la durata corretta e darebbe 12 J. 3/2 s omette il fattore R nell’inversa e darebbe 3 J. Due s copia il valore numerico della potenza e darebbe 4 J.

Hint: L’energia divisa per una potenza costante dà il tempo.

Fonte canonica SHA256 dc931cd79bc2074854053e182b3348ad8f27543abf30983055807a9dbc514170. Candidato SHA256 cb83e4b07287b193b4b5342e0629e55c0f66bd8abe7ca7fd13a2036ab72dd608. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-energy-voltage-time-07 — Più tempo alla stessa tensione

Un resistore ohmico ha R=2 Ω, mantenuta costante. In ogni prova si applica una caduta positiva V costante per una durata T>0 finita; il tempo interno τ va da 0 a T. L’energia E assorbita elettricamente e convertita termicamente nell’intervallo è E=(V²/R)T. La corrente V/R e la potenza V²/R restano costanti durante la prova. Fra prove V e T possono cambiare; non si assume che l’energia resti accumulata nel resistore o che ne determini da sola l’aumento di temperatura. A usa V=2 V e T_A=3 s. B mantiene V e usa T_B=5 s. Quanto vale E_B/E_A?

Procedimento d’autore: La potenza è la stessa, 2 W. Le energie sono E_A=6 J ed E_B=10 J, quindi E_B/E_A=10/6=5/3. La dipendenza dal tempo è lineare perché la tensione rimane costante all’interno di entrambi gli intervalli.

Passaggi: E_A=6\,\mathrm J;  E_B=10\,\mathrm J;  \frac{E_B}{E_A}=\frac53.

Distrattori: 3/5 inverte il confronto. 25/9 eleva al quadrato il rapporto dei tempi invece di quello delle tensioni. Uno ignora il tempo aggiunto e due non coincide con il rapporto delle durate assegnate.

Hint: Con la stessa potenza, il rapporto delle energie è quello delle durate.

Fonte canonica SHA256 9c924b53fb5329ce9198d12fcfc38ec73a822a356a5a275b161ecebd9e9bddef. Candidato SHA256 8e338b0867832c839b482065b5b2bd11ffcfa30b141658d996d2205a0dc3160d. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-energy-voltage-time-08 — Lo scarto della proposta energetica

Un resistore ohmico ha R=2 Ω, mantenuta costante. In ogni prova si applica una caduta positiva V costante per una durata T>0 finita; il tempo interno τ va da 0 a T. L’energia E assorbita elettricamente e convertita termicamente nell’intervallo è E=(V²/R)T. La corrente V/R e la potenza V²/R restano costanti durante la prova. Fra prove V e T possono cambiare; non si assume che l’energia resti accumulata nel resistore o che ne determini da sola l’aumento di temperatura. Con V=2 V e T=3 s si propone E=12 J. Quanto vale proposta meno corretto?

Procedimento d’autore: Il valore corretto è 6 J. La differenza richiesta è 12−6=+6 J. La proposta avrebbe dimenticato il divisore numerico due dovuto alla resistenza assegnata; non è necessario approssimare alcun valore.

Passaggi: E=6\,\mathrm J;  e=(12-6)\,\mathrm J;  e=6\,\mathrm J.

Distrattori: −6 inverte l’ordine. Dodici copia la proposta, zero la accetta e due è il rapporto senza unità proposta/corretto, non una differenza di energie.

Hint: Mantieni R=2 Ω anche nel calcolo del valore con cui confronti la proposta.

Fonte canonica SHA256 ef93be59a3d435959369b0663e31dfdd3d640381d85eac0cc46a02d6b2973412. Candidato SHA256 ec0fcc98474e7ab45402018f826b9dac84dda2e6e84d54b45a7e92320485c18a. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-energy-voltage-time-09 — La formula inversa della tensione

Un resistore ohmico ha R=2 Ω, mantenuta costante. In ogni prova si applica una caduta positiva V costante per una durata T>0 finita; il tempo interno τ va da 0 a T. L’energia E assorbita elettricamente e convertita termicamente nell’intervallo è E=(V²/R)T. La corrente V/R e la potenza V²/R restano costanti durante la prova. Fra prove V e T possono cambiare; non si assume che l’energia resti accumulata nel resistore o che ne determini da sola l’aumento di temperatura. Sono noti E, T e R. Quale formula ricava la caduta positiva V?

Procedimento d’autore: E=V²T/R implica ER=V²T. Si divide per T>0 e si prende la radice positiva: V=√(ER/T). Il contenuto della radice ha unità J·Ω/s=W·Ω=V². Senza la convenzione di segno l’energia non distinguerebbe due tensioni opposte.

Passaggi: ER=V^2T;  V^2=\frac{ER}{T};  V=\sqrt{\frac{ER}{T}}.

Distrattori: ER/T è il quadrato della tensione e non la tensione. ET/R avrebbe unità C² e ricaverebbe una grandezza con dimensione di carica, non una tensione. L’altra radice con R/(ET) ha dimensioni inverse di carica; la radice negativa non è nel dominio dichiarato.

Hint: Controlla l’unità sotto radice prima di scegliere il ramo positivo.

Fonte canonica SHA256 81804c6f99e84b0d1f906edc99a3341c3e9dc77e5d7a206c92bc020a5ecfc31d. Candidato SHA256 a457da2538c973df8514c66281c59162992155a33b3de72dd6444abdd27f2a8f. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-energy-voltage-time-10 — Scalare tensione e durata

Un resistore ohmico ha R=2 Ω, mantenuta costante. In ogni prova si applica una caduta positiva V costante per una durata T>0 finita; il tempo interno τ va da 0 a T. L’energia E assorbita elettricamente e convertita termicamente nell’intervallo è E=(V²/R)T. La corrente V/R e la potenza V²/R restano costanti durante la prova. Fra prove V e T possono cambiare; non si assume che l’energia resti accumulata nel resistore o che ne determini da sola l’aumento di temperatura. B usa V_B=κ₁V_A e T_B=κ₂T_A, con fattori positivi. Quanto vale E_B/E_A?

Procedimento d’autore: La stessa R si cancella. Il nuovo valore V_B² contiene κ₁², mentre la durata contiene κ₂ una sola volta. Quindi E_B/E_A=κ₁²κ₂. Ogni tensione resta costante durante la propria prova, anche se cambia fra le preparazioni.

Passaggi: E_B=\frac{\kappa_1^2V_A^2}{R}\kappa_2T_A;  \frac{E_B}{E_A}=\kappa_1^2\kappa_2.

Distrattori: κ₁κ₂ dimentica il quadrato della tensione; κ₁²/κ₂ rende inverso il tempo. κ₂² attribuisce alla durata il quadrato non presente nel prodotto con una potenza costante. L’ultimo rapporto inverte l’effetto della tensione.

Hint: Il quadrato riguarda V, non T.

Fonte canonica SHA256 81d8aecb1ec8d71400c45245f11d02b0c290933ffabee2c181d227ba39a9d860. Candidato SHA256 aac98ef865b94387c048a3614d5ca2e5a3b779103de172b135d32bb04876e4cf. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-energy-voltage-time-11 — Tensione doppia e intervallo minore

Un resistore ohmico ha R=2 Ω, mantenuta costante. In ogni prova si applica una caduta positiva V costante per una durata T>0 finita; il tempo interno τ va da 0 a T. L’energia E assorbita elettricamente e convertita termicamente nell’intervallo è E=(V²/R)T. La corrente V/R e la potenza V²/R restano costanti durante la prova. Fra prove V e T possono cambiare; non si assume che l’energia resti accumulata nel resistore o che ne determini da sola l’aumento di temperatura. A usa V=2 V e T=3 s. B usa V=4 V e T=2 s. Quanto vale E_B/E_A?

Procedimento d’autore: A ha potenza 2 W ed energia 6 J. B ha potenza 4²/2=8 W ed energia 16 J. Il rapporto è 16/6=8/3, che combina il fattore quattro della potenza con il fattore 2/3 del tempo.

Passaggi: E_A=6\,\mathrm J;  E_B=16\,\mathrm J;  \frac{E_B}{E_A}=\frac83.

Distrattori: 3/8 è il reciproco. 4/3 usa V linearmente; 2/3 segue soltanto T; quattro segue soltanto V² e ignora il nuovo intervallo. I due effetti non si sommano.

Hint: Calcola la nuova potenza e moltiplicala per il nuovo tempo.

Fonte canonica SHA256 74f3f1edd3e35fdb20113385b7e2e1a2ae643db5f223f5dfc9ad406bcbdb4421. Candidato SHA256 e026e3c40fb4ef003539e7a9b317d483820cb9810da4ee1bd2531d03ae6bc846. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-energy-voltage-time-12 — Media delle due energie

Un resistore ohmico ha R=2 Ω, mantenuta costante. In ogni prova si applica una caduta positiva V costante per una durata T>0 finita; il tempo interno τ va da 0 a T. L’energia E assorbita elettricamente e convertita termicamente nell’intervallo è E=(V²/R)T. La corrente V/R e la potenza V²/R restano costanti durante la prova. Fra prove V e T possono cambiare; non si assume che l’energia resti accumulata nel resistore o che ne determini da sola l’aumento di temperatura. A usa V=2 V, T=3 s; B usa V=4 V, T=2 s. Qual è la media aritmetica delle due E?

Procedimento d’autore: Le energie sono 6 e 16 J; la loro media è 11 J. Ai dati medi V=3 V e T=5/2 s, invece, il modello darebbe (9/2)(5/2)=45/4 J. Tale valore supera di 1/4 J la media richiesta. Non occorre trasformare le frazioni in decimali.

Passaggi: \overline E=\frac{6+16}{2}\,\mathrm J;  \overline E=11\,\mathrm J;  E_{\rm dati\ medi}=\frac{45}{4}\,\mathrm J.

Distrattori: 45/4 J applica il modello agli ingressi medi. Ventidue non dimezza; cinque è metà della differenza; sedici ripete B. Le preparazioni hanno uguale peso statistico, non un tempo medio da inserire automaticamente nella legge.

Hint: Trova le energie dei due intervalli separatamente prima della media.

Fonte canonica SHA256 e6aad21b7cd751c9d96ea9c4cd00198437e472c668cc3d6932403f1fb1fd3bc4. Candidato SHA256 4e6ca653e1f1580f41805b513724feaeecdfb82ce67c18dd5adea140a2e2d868. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-energy-voltage-time-13 — Il tempo per il bersaglio

Un resistore ohmico ha R=2 Ω, mantenuta costante. In ogni prova si applica una caduta positiva V costante per una durata T>0 finita; il tempo interno τ va da 0 a T. L’energia E assorbita elettricamente e convertita termicamente nell’intervallo è E=(V²/R)T. La corrente V/R e la potenza V²/R restano costanti durante la prova. Fra prove V e T possono cambiare; non si assume che l’energia resti accumulata nel resistore o che ne determini da sola l’aumento di temperatura. A usa V=2 V e T=3 s. B usa V=4 V e deve dare E_B=(8/3)E_A. Quanto vale T_B/T_A?

Procedimento d’autore: Il bersaglio è (8/3)·6=16 J. A 4 V la potenza è 8 W, quindi T_B=16/8=2 s. Dividendo per T_A=3 s si ottiene 2/3. La durata è positiva e ogni tensione resta costante nel proprio intervallo.

Passaggi: E_B=16\,\mathrm J;  P_B=8\,\mathrm W;  T_B=2\,\mathrm s;  \frac{T_B}{T_A}=\frac23.

Distrattori: 3/2 inverte il confronto. 8/3 copia il rapporto delle energie senza rimuovere il fattore della potenza; quattro copia il rapporto delle potenze. Un terzo darebbe un secondo e solo 8 J.

Hint: Dividi l’energia bersaglio per la potenza della prova B.

Fonte canonica SHA256 8867954b6db785782314988375408e9d584ca02e79273ea94b8cb0eb7e0eb005. Candidato SHA256 a61bd048a7a40eec0899c7ff1b5d4347bd5c34c2fe01db9dd0150a42b1b5a826. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-energy-voltage-time-14 — Dalla lettura alla radice esatta

Un resistore ohmico ha R=2 Ω, mantenuta costante. In ogni prova si applica una caduta positiva V costante per una durata T>0 finita; il tempo interno τ va da 0 a T. L’energia E assorbita elettricamente e convertita termicamente nell’intervallo è E=(V²/R)T. La corrente V/R e la potenza V²/R restano costanti durante la prova. Fra prove V e T possono cambiare; non si assume che l’energia resti accumulata nel resistore o che ne determini da sola l’aumento di temperatura. D=a_cal E è continuo e adimensionale, a_cal>0, senza offset. A con V=2 V e T=3 s dà D=18. C dà D=48 e dura T=2 s. Quanto vale V_C in volt?

Procedimento d’autore: Il riferimento ha E_A=6 J, perciò a_cal=18/(6 J)=3 J⁻¹. C ha E_C=48/(3 J⁻¹)=16 J. Dall’inversa V_C²=E_CR/T_C=16 V² segue la caduta positiva V_C=4 V.

Passaggi: a_{\rm cal}=3\,\mathrm J^{-1};  E_C=16\,\mathrm J;  V_C^2=16\,\mathrm{V^2};  V_C=4\,\mathrm V.

Distrattori: Sedici V copia V² e darebbe 256 J nell’intervallo. Due V darebbe 4 J e D=12; otto V darebbe 64 J e D=192. Usare D come joule non rimuove il guadagno del display.

Hint: Rimuovi la taratura e poi usa V²=ER/T.

Fonte canonica SHA256 ca971099e833ac82b8fe43e6e47d6bbcbd80ecdbbcf989d6aee6936072ee5754. Candidato SHA256 0e8e08f44d4d60fb91b00ed86a37979fef6a525a8a0278707f5c2825a191e535. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-energy-voltage-time-15 — Offset prima dell’energia

Un resistore ohmico ha R=2 Ω, mantenuta costante. In ogni prova si applica una caduta positiva V costante per una durata T>0 finita; il tempo interno τ va da 0 a T. L’energia E assorbita elettricamente e convertita termicamente nell’intervallo è E=(V²/R)T. La corrente V/R e la potenza V²/R restano costanti durante la prova. Fra prove V e T possono cambiare; non si assume che l’energia resti accumulata nel resistore o che ne determini da sola l’aumento di temperatura. D=a_cal E+b è continuo e adimensionale. A: V=2 V, T=3 s, D=13. B: V=4 V, T=2 s, D=33. C: T=1 s, D=37. Quanto vale V_C?

Procedimento d’autore: Le energie di riferimento sono 6 e 16 J. Guadagno a_cal=(33−13)/(16−6) J⁻¹=2 J⁻¹, offset b=1. C ha E_C=(37−1)/2=18 J. Con R=2 Ω e T=1 s si trova V_C²=36 V²; il modulo positivo è 6 V.

Passaggi: a_{\rm cal}=2\,\mathrm J^{-1};  b=1;  E_C=18\,\mathrm J;  V_C=6\,\mathrm V.

Distrattori: √37 V omette l’offset: produrrebbe E=37/2 J e D=38, non 37. Diciotto copia il numero dell’energia; trentasei copia quello di V². Tre V darebbe E=9/2 J e D=10. Il controllo del display può essere fatto con quadrati esatti, senza calcolare √37 in decimali.

Hint: Sottrai b e dividi per a_cal prima di estrarre la radice.

Fonte canonica SHA256 5bcb2d0be9f1ea60b6f8bbce7e74706969711d9ef42c4e33ebec10efd5eaeb1f. Candidato SHA256 100e48d6dffe1148afdcde2106e48101c2a1acdd6f0458e7c1523a9770c3ed45. Revisione indipendente e human NOT_RUN.

## AR-u6-joule-energy-voltage-time-16 — Durate preparate, non una rampa

Un resistore ohmico ha R=2 Ω, mantenuta costante. In ogni prova si applica una caduta positiva V costante per una durata T>0 finita; il tempo interno τ va da 0 a T. L’energia E assorbita elettricamente e convertita termicamente nell’intervallo è E=(V²/R)T. La corrente V/R e la potenza V²/R restano costanti durante la prova. Fra prove V e T possono cambiare; non si assume che l’energia resti accumulata nel resistore o che ne determini da sola l’aumento di temperatura. Fra prove si impone V=αT, con α=(2/3) V/s. La tensione così preparata resta costante per tutto il proprio intervallo. Si misura E=6 J. Quanto vale T?

Procedimento d’autore: Definiamo x=T/(1 s)>0. Il vincolo di preparazione dà V/(1 V)=2x/3. Sostituendo nell’energia totale si ottiene E/(1 J)=2x³/9. La misura 6 J impone x³=27 e quindi T=3 s; la tensione della prova è 2 V. Non si deve inserire V(τ)=ατ: sarebbe una rampa, diversa dal controllo costante dichiarato.

Passaggi: x=\frac T{1\,\mathrm s};  6=\frac29x^3;  x^3=27;  T=3\,\mathrm s.

Distrattori: Ventisette copia x³ e due copia il valore numerico della tensione risultante. −3 s viola la durata positiva. La cubica cresce strettamente per x>0 e seleziona un solo intervallo; non c’è una scala libera residua.

Hint: Sostituisci il valore di V preparato in funzione della durata, mantenendolo costante nel tempo interno.

Fonte canonica SHA256 500869edf938e1d343be703f53e894e3df0a9d978539d967942954a4b0161478. Candidato SHA256 3796e9b99029d113d4aab2b298e27f8f6d4cd02c9468ab8b18866b27aaed8833. Revisione indipendente e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 37e533b95cced8a2fed91ff364d281288cc6ac300291fcc4638f97f145978318. Package file SHA256 77fa034a70f36507957f3a6940210f5ed5f6b9c8eddde66a38e389add9b4ce8b. Binding file SHA256 6ed238cee70a0b419256d145ff9d6efbd31090642a6af3d049032b6f9ebd4565. Prova strutturale SHA256 d55720754875d94e18e40be429b28d1a52b575f07c4c3c17f4c1154a1bc0c9ec. Asset-only manifest SHA256 92e5df4d185fd3d2bcdffbea6556162ea1de2c140ef8c10f0e641ba5803127da.

Le coordinate intrinseche dell’SVG documentano proporzioni geometriche nella sorgente, non una misura in pixel fisici dopo ridimensionamento. I testi visibili usano soltanto grandezze fisiche e valori pertinenti. Le origini e le etichette sono separate dagli assi; la direzione di ciascuna freccia è letta insieme alla sua didascalia.

Il tempo sorgente t è rinominato durata T per distinguerlo dal tempo interno τ; nessun compito o dato cambia. Nel primo pannello le scale intrinseche sono 100 coordinate/s e 60 coordinate/W: il rettangolo 300×120 rappresenta 3 s per 2 W. Nel secondo E(τ)=2 W·τ usa x=100+100τ e y=880−40E, da (100,880) a (400,640). Le barre finali 6,16,11 J hanno larghezze 120,320,220 (20 coordinate/J), origine comune 150. Le coordinate documentano la costruzione, non sono pixel fisici richiesti al lettore.
