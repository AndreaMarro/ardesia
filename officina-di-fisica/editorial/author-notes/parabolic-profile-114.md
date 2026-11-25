# parabolic-profile-114 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U3-04.json. Letti individualmente tutti gli 80 originali 112–116 prima della scrittura, comprese le varianti concettuali 114-03, 115-03, 116-03 e l’analisi dimensionale 116-08. Riletti i testi reali delle lezioni C2-L007/L008/L009 e le loro dipendenze. Stesso assemble_family, course C2, unit u3.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Nessun verificatore o firma scientifica dell’autore; nessuna pubblicazione. Queste sono note di calcolo per un revisore distinto.

Profilo newtoniano stazionario sviluppato con aderenza alla parete ferma: u = s/R è una distanza relativa. I quesiti numerici impongono 0 < u < 1, mentre 03 usa esplicitamente i valori limite su asse e parete. La velocità locale è distinta dalla media d’area. 12: media 11/2 cm/s distinta da 1547/288 cm/s agli ingressi medi. 16: sostituire v_max = (8 cm/s)u dà la cubica fattorizzata (2u−1)(4u²+2u−3) = 0. Restano due radici interne distinte: 1/2 e (√13−1)/4; l’altra è negativa. La disuguaglianza 3 < √13 < 4 prova a mano la seconda ammissibilità. SVG: grafico con scale 300 px/unità di u e 60 px/(cm/s), pura conta del fattore 3/4 e separazione del diverso vincolo fra prove.

SVG completo letto in XML e rendering nativo. Ogni quantità rappresentata ha scala dichiarata; le grandezze con unità diverse non vengono confrontate con la stessa scala. Frecce su path separati, formule suddivise con law_steps. Nessun CSS, renderer o gate modificato.

## 01 — A metà raggio non si dimezza la velocità

A metà raggio il quadrato della distanza relativa vale un quarto. Rimangono tre quarti della velocità sull’asse, non un mezzo. Moltiplicare quattro per tre quarti cancella il denominatore e dà tre cm/s: un valore inferiore al massimo e positivo nel punto interno.

Passaggi: `u^2=\frac14\qquad 1-u^2=\frac34\qquad v=(4\,\mathrm{cm/s})\frac34\qquad v=3\,\mathrm{cm/s}`

Errori e controllo: Due cm/s seguirebbe una riduzione lineare 1−u, non il profilo assegnato. Quattro ignorerebbe la distanza dall’asse e zero collocherebbe il punto alla parete.

## 02 — La coordinata relativa non cambia unità

s e R sono lunghezze nella stessa unità: il loro rapporto u è puro. Anche 1−u² è adimensionale, quindi la velocità locale conserva l’unità di v_max. Il centimetro al secondo può essere convertito in m/s senza cambiare la natura della grandezza.

Passaggi: `u=\frac{s}{R}\qquad [u]=1\qquad [v]=[v_{max}]\qquad [v]=L/T\qquad 1\,\mathrm{cm/s}=10^{-2}\,\mathrm{m/s}`

Errori e controllo: cm è lunghezza, 1 sarebbe adatto a u, s/cm è velocità inversa e cm²/s ha una lunghezza di troppo. La parola “locale” non cambia l’unità fisica.

## 03 — Asse e parete come valori limite

Sull’asse s=0 e dunque u=0: il fattore del profilo è uno. Alla parete s=R e u=1: il fattore è zero, coerente con l’aderenza a una parete ferma. Questi sono i due valori limite del modello; le altre domande lavorano invece con punti strettamente interni.

Passaggi: `v(0)=v_{max}(1-0^2)\qquad v(0)=v_{max}\qquad v(1)=v_{max}(1-1^2)\qquad v(1)=0`

Errori e controllo: Invertire asse e parete contraddice il profilo e l’aderenza. Valori uguali ai due estremi descriverebbero un profilo piatto, non parabolico. v_max/2 è la media d’area di questo profilo, non la velocità sull’asse; non si scambia una media con il valore in un punto.

## 04 — Cambiare la velocità sull’asse

La posizione relativa non cambia e il fattore del profilo rimane tre quarti. La prima velocità è tre cm/s; la seconda è nove per tre quarti, ventisette quarti cm/s. Si tratta di due prove stazionarie diverse, non dell’accelerazione temporale di una particella.

Passaggi: `1-u^2=\frac34\qquad v_A=3\,\mathrm{cm/s}\qquad v_B=\frac{27}{4}\,\mathrm{cm/s}`

Errori e controllo: Quattro terzi applica il rapporto inverso 4/9 a tre. Nove copia il nuovo massimo senza il fattore locale; invariata o nulla ignora le condizioni assegnate.

## 05 — Risalire dalla velocità locale al massimo

La misura locale rappresenta tre quarti del massimo. Per ricostruirlo dividiamo tre per tre quarti, cioè moltiplichiamo per quattro terzi. I fattori tre si cancellano e resta quattro cm/s, maggiore della velocità locale come richiesto per un punto interno.

Passaggi: `v_{max}=\frac{v}{1-u^2}\qquad v_{max}=\frac{3}{3/4}\,\mathrm{cm/s}\qquad v_{max}=4\,\mathrm{cm/s}`

Errori e controllo: Moltiplicare ancora per tre quarti darebbe 9/4 cm/s, minore della misura locale: non potrebbe essere il massimo del profilo. Il denominatore è positivo perché u<1.

## 06 — La distanza relativa dalla misura

Il rapporto v/v_max è tre quarti. Sottraendolo da uno rimane u²=1/4; la radice positiva dà u=1/2. Questa è una distanza relativa dall’asse, non una coordinata cartesiana con segno: il ramo negativo non rappresenta s/R.

Passaggi: `u^2=1-\frac{v}{v_{max}}\qquad u^2=\frac14\qquad u=\frac12\qquad 0<u<1`

Errori e controllo: Un quarto è il quadrato della distanza relativa. Per ottenere s in centimetri o metri servirebbe anche R; qui si chiede soltanto il rapporto puro u.

## 07 — Avvicinare il punto all’asse

Il punto B è più vicino all’asse e conserva otto noni del massimo. La velocità è trentadue noni cm/s, da dividere per i tre cm/s di A. Il risultato trentadue ventisettesimi è maggiore di uno, coerente con la crescita della velocità verso l’asse.

Passaggi: `v_A=3\,\mathrm{cm/s}\qquad v_B=4\frac89\,\mathrm{cm/s}\qquad v_B=\frac{32}{9}\,\mathrm{cm/s}\qquad \frac{v_B}{v_A}=\frac{32}{27}`

Errori e controllo: Ventisette trentaduesimi è il reciproco. Otto noni è il fattore locale di B, non il confronto con A; due terzi segue la distanza invece del profilo e uno ignora lo spostamento radiale.

## 08 — Una velocità oltre il massimo assegnato

Il valore corretto è tre cm/s e lo scarto sei meno tre è più tre cm/s. La proposta fallisce già un controllo fisico: in un punto interno il fattore 1−u² è fra zero e uno, quindi v deve essere minore di quattro cm/s, non sei.

Passaggi: `v=3\,\mathrm{cm/s}\qquad e=(6-3)\,\mathrm{cm/s}\qquad e=3\,\mathrm{cm/s}`

Errori e controllo: Meno tre inverte la differenza, sei copia la proposta, zero la accetta e tre mezzi dimezza lo scarto. Un’unità di velocità corretta non garantisce che il valore rispetti il profilo.

## 09 — L’inversa non perde la parentesi

Il massimo è moltiplicato per l’intera parentesi 1−u². Dividiamo per questa quantità, positiva nei punti interni. Non serve estrarre una radice: il massimo compare alla prima potenza, mentre il quadrato riguarda soltanto la coordinata relativa.

Passaggi: `v=v_{max}(1-u^2)\qquad v_{max}=\frac{v}{1-u^2}\qquad 1-u^2>0`

Errori e controllo: Moltiplicare ripeterebbe la riduzione locale. Omettere il quadrato o il termine uno cambia il profilo. La radice finale avrebbe dimensione di radice di velocità, estranea alla richiesta.

## 10 — Due scalature con punti ancora interni

La nuova posizione entra al quadrato: (κ₂u_A)²=κ₂²u_A². Il nuovo fattore locale è D e il vecchio è U. Il massimo fornisce inoltre il fattore κ₁, così il rapporto completo è κ₁D/U. Entrambe le parentesi restano positive nel dominio dichiarato.

Passaggi: `v_A=v_{max,A}U\qquad v_B=\kappa_1v_{max,A}D\qquad \frac{v_B}{v_A}=\frac{\kappa_1D}{U}`

Errori e controllo: U/D rovescia il fattore geometrico; i semplici prodotti o quozienti di κ₂ ignorano il termine uno del profilo. D/U da solo omette il cambiamento del massimo. Una scalatura che portasse u_B≥1 uscirebbe dal dominio dei punti interni.

## 11 — Un massimo maggiore e un punto più centrale

Il massimo B è nove e il fattore locale otto noni: il nove si cancella, lasciando otto cm/s. In A erano tre cm/s, perciò il rapporto è otto terzi. Entrambi i cambiamenti aumentano la velocità locale.

Passaggi: `v_A=3\,\mathrm{cm/s}\qquad v_B=(9\,\mathrm{cm/s})\frac89\qquad v_B=8\,\mathrm{cm/s}\qquad v_B/v_A=\frac83`

Errori e controllo: Tre ottavi inverte gli stati, nove quarti segue soltanto i massimi e trentadue ventisettesimi soltanto i fattori locali. Otto è la velocità numerica di B, non il rapporto richiesto.

## 12 — La media di due misure locali

Le velocità locali sono tre e otto cm/s. La loro somma undici, divisa per due, dà undici mezzi cm/s. Non si tratta della media su una sezione del tubo, ma della media statistica di due misure in prove e punti differenti.

Passaggi: `\overline v=\frac{3+8}{2}\,\mathrm{cm/s}\qquad \overline v=\frac{11}{2}\,\mathrm{cm/s}`

Errori e controllo: Undici è la somma, undici quarti dimezza ancora e cinque è la differenza. Le medie degli ingressi sono v_max=13/2 cm/s e u=5/12: il modello darebbe (13/2)(119/144)=1547/288 cm/s, inferiore alla media delle uscite di 37/288 cm/s. Sono due operazioni diverse.

## 13 — Scegliere la distanza per il bersaglio

Il bersaglio è otto cm/s. Su un massimo di nove significa 1−u_B²=8/9, dunque u_B²=1/9 e u_B=1/3 nel ramo della distanza positiva. Il rapporto con un mezzo è due terzi. Il punto resta interno e più vicino all’asse.

Passaggi: `v_B=8\,\mathrm{cm/s}\qquad u_B^2=\frac19\qquad u_B=\frac13\qquad \frac{u_B}{u_A}=\frac{1/3}{1/2}\qquad \frac{u_B}{u_A}=\frac23`

Errori e controllo: Tre mezzi è reciproco, un terzo è la nuova coordinata e non il rapporto, otto terzi copia il bersaglio della velocità. Quattro noni sarebbe il quadrato del rapporto delle coordinate.

## 14 — Il display ricostruisce il massimo

Il riferimento ha velocità locale tre cm/s, quindi q=3 s/cm. La nuova lettura ventiquattro equivale a otto cm/s. A un terzo di raggio il fattore locale è otto noni: otto diviso otto noni restituisce un massimo di nove cm/s.

Passaggi: `q=3\,\mathrm{s/cm}\qquad v_B=8\,\mathrm{cm/s}\qquad v_{max,B}=\frac{8}{8/9}\,\mathrm{cm/s}\qquad v_{max,B}=9\,\mathrm{cm/s}`

Errori e controllo: La lettura non è direttamente una velocità. Dopo la taratura si ottiene il valore locale, ancora da dividere per il fattore del profilo; otto non è il massimo.

## 15 — Due riferimenti e una misura decentrata

Le velocità di riferimento sono tre e otto cm/s. La pendenza del display è (17−7)/(8−3)=2 s/cm e l’offset è uno. La lettura C dà v_C=(29/2−1)/2=27/4 cm/s. Dividendo per tre quarti si trova v_max,C=9 cm/s.

Passaggi: `q=2\,\mathrm{s/cm}\qquad z=1\qquad v_C=\frac{27}{4}\,\mathrm{cm/s}\qquad v_{max,C}=\frac{27/4}{3/4}\,\mathrm{cm/s}\qquad v_{max,C}=9\,\mathrm{cm/s}`

Errori e controllo: Ai massimi 4,8,27/4,18 cm/s corrispondono, con u=1/2, letture 7,13,89/8,28. Nessuna vale 29/2; soltanto nove restituisce 29/2. La frazione 27/4 è la velocità locale, non il massimo.

## 16 — Due punti interni soddisfano il vincolo

Sostituendo il vincolo, la velocità numerica in cm/s è 8u(1−u²). Eguagliarla a tre produce una cubica. Si riconosce u=1/2 e si fattorizza: l’altro fattore è un’equazione quadratica. Non basta trovare il primo valore plausibile: bisogna leggere e filtrare tutti i rami.

Passaggi: `8u(1-u^2)=3\qquad 8u^3-8u+3=0\qquad (2u-1)(4u^2+2u-3)=0\qquad u_a=\frac12\qquad u_b=\frac{\sqrt{13}-1}{4}\qquad u_c=\frac{-1-\sqrt{13}}4`

Errori e controllo: Il ramo u_c è negativo. Poiché 9<13<16, si ha 3<√13<4: quindi 1/2<u_b<3/4. u_a e u_b sono distinti e interni, e producono entrambi un massimo positivo e v=3 cm/s. Restano due soluzioni fisiche, non tre algebriche né una soltanto. Il vincolo collega prove, non il valore temporale della velocità di una particella.
