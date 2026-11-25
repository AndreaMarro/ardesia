# venturi-area-ratio-101 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U3-03.json. Tutti gli 80 originali 100–104 letti individualmente prima della scrittura, comprese le varianti 101-03 e 104-06. ID effettivi confermati. Riletti C2-L005 e C2-L006 nel catalogo; assemble_family canonico, course C2, unit u3.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Nessun verificatore o firma scientifica propria; nessuna pubblicazione. Queste sono note di calcolo dell’autore per una revisione distinta.

Area ratio r > 1 distinto da rapporto di raggi. Continuità e Bernoulli usano profili uniformi nel modello ideale stazionario incomprimibile; stessa quota e linea di corrente, senza perdite o macchine. Pressione stretta p₂ = 100 kPa assoluti e p₁ = p₂ + Δp: nessuna pressione sotto vapore viene imposta dai dati. 12: media delle uscite 35 kPa, mentre modello agli ingressi medi 189/8 kPa. 16: r = cv₁, c = 1 s/m; x = v₁/(1 m/s), u = x². Le alternative u = 4 e u = −3 sono separate; u < 0 escluso per velocità reale, x = −2 escluso da v₁ > 0 e r > 1.

SVG completo letto in XML e rendering nativo. Ogni quantità rappresentata ha scala dichiarata e riferimento esplicito. Frecce su path separati; le formule usano law_steps e blocchi brevi. Nessun CSS, renderer o gate modificato.

## 01 — Il restringimento accelera l’acqua

La continuità impone v₂=rv₁=4 m/s. Alla stessa quota Bernoulli uguaglia pressione statica più energia cinetica per volume: la perdita di pressione statica è ρ(v₂²−v₁²)/2. I quadrati sono16 e4 m²/s², quindi la differenza richiesta è6 kPa. Le pressioni assolute sono p₁106 kPa e p₂100 kPa.

Passaggi: `v_2=rv_1=4\,\mathrm{m/s}\qquad \Delta p=\frac\rho2(v_2^2-v_1^2)\qquad v_2^2-v_1^2=12\,\mathrm{m^2/s^2}\qquad \Delta p=6\,\mathrm{kPa}`

Errori e controllo: Due kPa è il solo contributo cinetico della sezione larga e otto quello della stretta: serve la loro differenza. Dodici dimentica il fattore1/2. Un aumento di velocità non è di per sé una dissipazione nel modello ideale.

## 02 — La pressione statica ha unità di pressione

La differenza ρ(v₂²−v₁²)/2 è energia per unità di volume, equivalente a una pressione. Il rapporto r è puro, ma la velocità al quadrato e la densità restituiscono Pa, non un numero adimensionale.

Passaggi: `[\rho v_1^2]=M/(LT^2)\qquad [r^2-1]=1\qquad [\Delta p]=\mathrm{Pa}`

Errori e controllo: m/s è velocità,m²/s² è energia per massa,N è forza e1 un numero puro. La pressione dinamica è una grandezza con dimensioni di pressione e non coincide con il quadrato della velocità da solo.

## 03 — La pressione statica si trasforma in contributo cinetico

Poiché A₂<A₁ e la portata resta comune, v₂>v₁. Alla stessa quota l’aumento di energia cinetica per volume è compensato da una diminuzione della pressione statica, mentre p+ρv²/2 resta costante sulla linea di corrente. La diminuzione locale di p non prova una perdita irreversibile.

Passaggi: `A_1v_1=A_2v_2\qquad p_1+\rho v_1^2/2=p_2+\rho v_2^2/2\qquad \Delta p=\rho(v_2^2-v_1^2)/2`

Errori e controllo: L’attrito è escluso dal modello dato; una portata diversa violerebbe la continuità stazionaria. La quota è uguale e la velocità aumenta, mentre la somma ideale non si annulla. Un condotto reale richiederebbe termini di perdita aggiuntivi.

## 04 — Cambiare il rapporto di aree

Con la stessa velocità larga, la velocità stretta passa da4 a6 m/s. La differenza dei quadrati passa da12 a32 m²/s², così Δp sale da6 a16 kPa. Il termine r²−1 conserva il contributo cinetico non nullo all’ingresso.

Passaggi: `v_{2,A}=4\,\mathrm{m/s}\qquad v_{2,B}=6\,\mathrm{m/s}\qquad \Delta p_B=\frac{1000}{2}(36-4)\,\mathrm{Pa}\qquad \Delta p_B=16\,\mathrm{kPa}`

Errori e controllo: Nove scala linearmente con r;27/2 scala con r² ma dimentica il meno uno. Sei ignora il rapporto nuovo e quattro rende inversa la caduta di pressione rispetto al restringimento.

## 05 — Il rapporto di aree da pressione e velocità

Isoliamo r²=1+2Δp/(ρv₁²). I6 kPa diventano6000 Pa e il rapporto aggiunto vale3: r²=4. La radice positiva r=2 supera uno e descrive la sezione stretta assegnata.

Passaggi: `r^2=1+\frac{2\Delta p}{\rho v_1^2}\qquad r^2=1+3=4\qquad r_+=2\qquad r_-=-2`

Errori e controllo: Il ramo negativo non è un rapporto di aree positive;quattro è r². Omettere il termine uno confonderebbe il contributo cinetico finale con l’aumento rispetto all’ingresso.

## 06 — La velocità nella sezione larga

Nel bilancio Δp=(ρ/2)v₁²(r²−1), il coefficiente r²−1 vale3. Isolando v₁² si trova4 m²/s². La radice positiva dà2 m/s;la velocità stretta è poi4 m/s, distinta dall’incognita richiesta.

Passaggi: `v_1^2=\frac{2\Delta p}{\rho(r^2-1)}\qquad v_1^2=4\,\mathrm{m^2/s^2}\qquad v_{1,+}=2\,\mathrm{m/s}\qquad v_{1,-}=-2\,\mathrm{m/s}`

Errori e controllo: Quattro m/s sarebbe v₂, non v₁. Il rapporto r>1 assicura un denominatore positivo e la differenza misurata è positiva. La radice negativa contraddice il verso di flusso dichiarato.

## 07 — Una velocità larga doppia

Con rapporto di aree costante entrambe le velocità raddoppiano. Tutti i contributi cinetici quadruplicano, quindi anche la loro differenza: Δp passa da6 a24 kPa e il rapporto è quattro.

Passaggi: `\Delta p_A=6\,\mathrm{kPa}\qquad \Delta p_B=24\,\mathrm{kPa}\qquad \Delta p_B/\Delta p_A=4`

Errori e controllo: Due segue v₁ al primo grado;un quarto inverte gli stati,un mezzo applica insieme linearità e inversione. Uno ignora la velocità. La pressione assoluta p₁ cambia da106 a124 kPa, mentre p₂ resta100 kPa.

## 08 — L’errore di perdere il fattore un mezzo

La differenza dei quadrati vale12 m²/s², ma nella pressione compare il fattoreρ/2. La pressione corretta è6 kPa e la proposta dodici eccede di6 kPa. Si conserva l’ordine proposta meno corretta.

Passaggi: `\Delta p=6\,\mathrm{kPa}\qquad e=(12-6)\,\mathrm{kPa}\qquad e=6\,\mathrm{kPa}`

Errori e controllo: Il meno scambia la sottrazione;dodici ripete la proposta,zero la accetta e tre dimezza lo scarto. Una differenza di pressioni non è la somma dei contributi cinetici delle due sezioni.

## 09 — L’inversa simbolica del rapporto di aree

Dividiamo perρv₁²/2, poi aggiungiamo uno: r²=1+2Δp/(ρv₁²). Il rapporto interno è puro e positivo, perciò la radice positiva è maggiore di uno. La formula individua direttamente il rapporto delle aree, non quello dei raggi.

Passaggi: `r^2-1=\frac{2\Delta p}{\rho v_1^2}\qquad r^2=1+\frac{2\Delta p}{\rho v_1^2}\qquad r=\sqrt{1+\frac{2\Delta p}{\rho v_1^2}}`

Errori e controllo: La radice senza uno ignora la velocità iniziale;senza radice si restituisce r². Il meno non deriva dal bilancio e può uscire dal dominio reale;la radice negativa viola r>1.

## 10 — Scalature con la differenza r² meno uno

La velocità contribuisce con il suo quadratoκ₂². La parte geometrica richiede invece di ricalcolareD_B: il termine uno resta fisso e non scala con r. Dividendo le due leggi otteniamoκ₂²D_B/D_A.

Passaggi: `\Delta p_A=\rho v_{1,A}^2D_A/2\qquad \Delta p_B=\rho\kappa_2^2v_{1,A}^2D_B/2\qquad R=\kappa_2^2D_B/D_A`

Errori e controllo: κ₁²κ₂² scalerebbe anche il termine sottratto uno;κ₂ al primo grado perde il quadrato. Il reciproco scambia gli stati eκ₁/κ₂ tratta una differenza quadratica come un semplice quoziente. Anche D_B resta positivo nel dominio.

## 11 — Rapporto tre e velocità quattro

La differenza A è6 kPa. Per B il contributo inizialeρv₁²/2 vale8 kPa e il fattore r²−1 vale8, quindi Δp_B=64 kPa. Il rapporto64/6 è32/3, mantenuto esatto.

Passaggi: `\Delta p_A=6\,\mathrm{kPa}\qquad \Delta p_B=8\cdot8\,\mathrm{kPa}\qquad \Delta p_B=64\,\mathrm{kPa}\qquad \Delta p_B/\Delta p_A=\frac{32}{3}`

Errori e controllo: Tre trentaduesimi inverte gli stati;quattro segue la sola velocità e8/3 il solo fattore geometrico. Sessantaquattro è il numero di Δp_B in kPa,non il rapporto puro.

## 12 — Media delle differenze statiche

Le due differenze sono6 e64 kPa;la semisomma è35 kPa. Il risultato richiede due applicazioni separate del modello, prima di qualunque media. Una media dei rapporti geometrici e delle velocità definirebbe un terzo apparato.

Passaggi: `\overline{\Delta p}=\frac{6+64}{2}\,\mathrm{kPa}\qquad \overline{\Delta p}=35\,\mathrm{kPa}`

Errori e controllo: Settanta è la somma,35/2 dimezza due volte e58 è la differenza. Gli ingressi medi r5/2,v₁3 m/s darebbero(9/2)(21/4)=189/8 kPa: la doppia non linearità impedisce di scambiare queste operazioni.

## 13 — La velocità per la caduta di pressione bersaglio

Il bersaglio è64 kPa. Con r=3 il fattore r²−1 vale8,quindiρv₁,B²/2 deve valere8 kPa. Ciò dà v₁,B²=16 m²/s² e v₁,B=4 m/s,il doppio del riferimento.

Passaggi: `\Delta p_B=64\,\mathrm{kPa}\qquad v_{1,B}^2=16\,\mathrm{m^2/s^2}\qquad v_{1,B}=4\,\mathrm{m/s}\qquad v_{1,B}/v_{1,A}=2`

Errori e controllo: Quattro è il fattore dei quadrati,non delle velocità.32/3 ripete la pressione bersaglio e8/3 segue il solo cambiamento geometrico. La radice positiva conserva il verso del flusso.

## 14 — Tarare la caduta per ricavare la geometria

Il riferimento6 kPa fissa q=3 kPa⁻¹. La nuova lettura192 equivale a64 kPa. Per v₁4 m/s,ρv₁²/2 vale8 kPa: r_B²−1=64/8=8 e r_B=3 nel dominio positivo.

Passaggi: `q=3\,\mathrm{kPa^{-1}}\qquad \Delta p_B=64\,\mathrm{kPa}\qquad r_B^2=1+64/8=9\qquad r_B=3`

Errori e controllo: Usare192 come kPa darebbe r²25 e r5,conservando il guadagno nel dato fisico. La ricostruzione corretta mantiene p₂100 kPa e p₁164 kPa assoluti,senza imporre pressione negativa al restringimento.

## 15 — Un offset e una geometria nuova

I riferimenti6 e64 kPa danno q=(129−13)/(64−6)=2 kPa⁻¹ e z=1. La lettura33 rappresenta16 kPa. A v₁2 m/s il coefficienteρv₁²/2 vale2 kPa,così r_C²=1+16/2=9 e r_C=3.

Passaggi: `q=2\,\mathrm{kPa^{-1}}\qquad z=1\qquad \Delta p_C=16\,\mathrm{kPa}\qquad r_C^2=9\qquad r_C=3`

Errori e controllo: A v₁2 m/s,rapporti2,4,5 darebbero letture13,61,97. Uno è il limite senza restringimento e senza differenza statica,escluso da r>1. Solo3 dà33.

## 16 — Un vincolo che conduce a un quadrato di v₁²

Poniamo x=v₁/(1 m/s),così r=x e x>1. La pressione numerica in kPa èx²(x²−1)/2. Eguagliandola a6 otteniamo x⁴−x²−12=0. Con u=x²≥0 si fattorizza(u−4)(u+3)=0;u=−3 è impossibile per un quadrato reale.

Passaggi: `x^4-x^2-12=0\qquad u=x^2\qquad (u-4)(u+3)=0\qquad u_1=4\qquad u_2=-3\qquad x_+=2\qquad x_-=-2`

Errori e controllo: Il solo ramo x=2 soddisfa insieme v₁>0 e r=x>1. Allora v₁2 m/s,r2 ricostruiscono6 kPa. La radice−2 non è un rapporto di aree ammissibile;u−3 non genera velocità reali. Il vincolo collega apparati distinti.
