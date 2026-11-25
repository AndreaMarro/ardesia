# horizontal-jet-range-104 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U3-03.json. Tutti gli 80 originali 100–104 letti individualmente prima della scrittura, comprese le varianti 101-03 e 104-06. ID effettivi confermati. Riletti C2-L005 e C2-L006 nel catalogo; assemble_family canonico, course C2, unit u3.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Nessun verificatore o firma scientifica propria; nessuna pubblicazione. Queste sono note di calcolo dell’autore per una revisione distinta.

Nella nuova redazione h è il battente sopra il foro e H la quota del foro sul suolo: i simboli sorgente erano scambiati. Numeri e compiti sono trasposti coerentemente; provenienza resta sul record originale. Efflusso quasi stazionario e moto parabolico del singolo elemento di getto trattati separatamente. Aria trascurata, g uniforme e positiva; gittata R = 2√(hH), g si cancella. La geometria richiede superficie a quota h + H, foro sopra il suolo e spazio libero fino all’impatto.

SVG completo letto in XML e rendering nativo. Ogni quantità rappresentata ha scala dichiarata e riferimento esplicito. Frecce su path separati; le formule usano law_steps e blocchi brevi. Nessun CSS, renderer o gate modificato.

## 01 — Un metro di battente e quattro metri di caduta

Il battente determina la velocità iniziale v₀=√(2gh),mentre la quota del foro determina il tempo di caduta t=√(2H/g). Il moto orizzontale è uniforme e R=v₀t. Moltiplicando le due radici, g si cancella e rimane2√(hH)=4 m.

Passaggi: `v_0=\sqrt{2gh}\qquad t=\sqrt{2H/g}\qquad R=v_0t\qquad R=2\sqrt{hH}\qquad R=4\,\mathrm m`

Errori e controllo: Il battente h non è l’altezza di caduta H. Sommare le due quote darebbe la quota della superficie,non R. Il valore non richiede conoscere numericamente g perché la stessa gravità regola efflusso e caduta.

## 02 — Il prodotto delle radici dà una lunghezza

R è il prodotto di una velocità per un tempo. Anche2√(hH) ha dimensione di lunghezza: sotto la radice c’è il prodotto di due lunghezze e il fattore due è puro.

Passaggi: `[R]=[v_0t]=L\qquad [\sqrt{hH}]=\sqrt{L^2}=L`

Errori e controllo: m/s è velocità,s un tempo,m² un’area e1 un numero puro. La cancellazione di g non rende la gittata adimensionale:restano le due quote geometriche.

## 03 — Efflusso e caduta nella stessa gravità

Poniamo l’origine verticale al suolo e il tempo zero all’uscita. Poiché la componente verticale iniziale è nulla,il punto raggiunge il suolo quando H−gt²/2=0. Con il tempo positivo e la velocità orizzontale di Torricelli,la distanza è2√(hH). Il calcolo usa la stessa g nelle due fasi.

Passaggi: `y(t)=H-gt^2/2\qquad t=\sqrt{2H/g}\qquad x(t)=v_0t\qquad R=\sqrt{2gh}\sqrt{2H/g}\qquad R=2\sqrt{hH}`

Errori e controllo: √(2gh) è soltanto la velocità all’uscita,non una gittata. Un fattore g residuo altera le dimensioni;2hH è un’area. La radice senza il due perde un fattore proveniente dalle due leggi del moto.

## 04 — Battente quadruplo con la stessa quota del foro

La velocità iniziale raddoppia perché h quadruplica;il tempo di caduta resta uguale perché il foro è ancora a quota4 m. La distanza raddoppia da4 a8 m. Le superfici dei due serbatoi stanno a quote5 e8 m:non si impone una quota totale fissa fra queste prove.

Passaggi: `R_A=2\sqrt{1\cdot4}\,\mathrm m=4\,\mathrm m\qquad R_B=2\sqrt{4\cdot4}\,\mathrm m\qquad R_B=8\,\mathrm m`

Errori e controllo: Sedici tratta la gittata come lineare nel battente;due ne inverte l’effetto e quattro ignora la velocità nuova.4√2 corrisponderebbe a un battente soltanto doppio.

## 05 — Il battente dalla gittata misurata

Quadrando la distanza otteniamo R²=4hH. Dividendo per4H si trova h=16 m²/(16 m)=1 m. Il battente così ricostruito pone la superficie a5 m dal suolo,un metro sopra il foro.

Passaggi: `R^2=4hH\qquad h=\frac{R^2}{4H}\qquad h=1\,\mathrm m`

Errori e controllo: Il rapporto R/(4H) sarebbe puro e non una quota. Dividere perH senza il quattro darebbe4 m,che produrrebbe una gittata8 m. La geometria finale mantiene h>0 e H>0.

## 06 — Due fori simmetrici rispetto alla metà della quota

A ha battente8 m e quota di caduta2 m;B ha battente2 m e quota8 m. I prodotti hH sono entrambi16 m²,perciò le gittate valgono8 m. Le velocità non sono uguali:la radice del rapporto dei battenti8/2 dà v_A/v_B=2. Il tempo di caduta di A è invece metà di quello di B,e il prodotto velocità per tempo coincide.

Passaggi: `h_A=8\,\mathrm m\qquad h_B=2\,\mathrm m\qquad R_A=R_B=2\sqrt{16}\,\mathrm m\qquad R_A=R_B=8\,\mathrm m\qquad v_A/v_B=2\qquad t_A/t_B=1/2`

Errori e controllo: La stessa gittata non implica la stessa velocità,perché i tempi di volo differiscono. Guardare solo il battente farebbe ignorare la quota di caduta;guardare solo l’altezza del foro perderebbe il diverso efflusso. Entrambi i fori sono sotto la superficie e sopra il suolo.

## 07 — Abbassare il foro mantenendo il battente

La velocità iniziale resta uguale perché il battente non cambia. La quota di caduta si riduce a un quarto,quindi il tempo di volo e la gittata si dimezzano. Le distanze sono4 e2 m,rapporto un mezzo.

Passaggi: `R_A=4\,\mathrm m\qquad R_B=2\,\mathrm m\qquad R_B/R_A=1/2`

Errori e controllo: Due inverte gli stati,un quarto tratta il tempo come lineare nell’altezza. Uno trascura il tempo di volo minore e un segno negativo non confronta distanze positive. La quota della superficie cambia insieme al foro per mantenere h.

## 08 — Lo scarto di una gittata doppia

Il modello dà R=4 m. La proposta otto eccede di4 m. A quota del foro uguale,ottenere8 m richiederebbe battente4 m e velocità iniziale doppia,non il battente1 m assegnato.

Passaggi: `R=4\,\mathrm m\qquad e=(8-4)\,\mathrm m\qquad e=4\,\mathrm m`

Errori e controllo: −4 inverte la sottrazione;otto ripete la proposta,zero la accetta e due dimezza lo scarto. Non si può raddoppiare il tempo di caduta mantenendo la stessa H e la stessa g.

## 09 — Isolare il battente con le unità

Dalla relazione positiva R=2√(hH) si ottiene R²=4hH. Dividiamo per4H>0 per isolare il battente. Una lunghezza al quadrato divisa per una lunghezza restituisce una lunghezza,coerente con h.

Passaggi: `R^2=4hH\qquad h=\frac{R^2}{4H}`

Errori e controllo: R/(4H) è puro;4R²/H ha un fattore sedici in più rispetto alla formula corretta.4H/R² è inverso di una lunghezza e R²H/4 è un volume. La gravità non deve essere reinserita dopo essersi cancellata.

## 10 — Scalare separatamente le due quote

La distanza al quadrato è4hH. Le due quote moltiplicano R² con il prodotto dei fattori;il rapporto delle distanze positive è quindi√(κ₁κ₂). I simboli distinguono il battente dalla caduta anche se il prodotto finale è simmetrico.

Passaggi: `R_B^2/R_A^2=\kappa_1\kappa_2\qquad R_B/R_A=\sqrt{\kappa_1\kappa_2}`

Errori e controllo: Il prodotto senza radice riguarda R²;il quoziente assegna un effetto inverso alla quota del foro. La somma darebbe due per stati uguali. Il risultato non richiede né una g numerica né una pressione differenziale aggiuntiva.

## 11 — Battente quattro e caduta otto metri

A ha gittata4 m. Per B il prodotto hH vale32 m² e la distanza è2√32=8√2 m. Il rapporto con4 m si semplifica a2√2. Il prodotto delle scalature è4·2=8 per R²,non per R.

Passaggi: `R_B=2\sqrt{32}\,\mathrm m\qquad R_B=8\sqrt2\,\mathrm m\qquad R_B/R_A=2\sqrt2`

Errori e controllo: Otto omette la radice;√2 segue solo la caduta e quattro non combina correttamente i due fattori. Il reciproco1/(2√2) inverte gli stati. Il radicale resta esatto.

## 12 — Media esatta di due gittate

Le gittate sono4 e8√2 m. La loro semisomma è2+4√2 m,senza approssimare√2. Gli ingressi medi definirebbero un’altra coppia di quote,non la media di queste due distanze.

Passaggi: `\overline R=\frac{4+8\sqrt2}{2}\,\mathrm m\qquad \overline R=(2+4\sqrt2)\,\mathrm m`

Errori e controllo: 4+8√2 è la somma,1+2√2 dimezza due volte e2√2 ripete il rapporto fra gittate. Gli ingressi medi h5/2 m,H6 m darebbero2√15 m. Il quadrato della media corretta è36+16√2,strettamente minore di60 perché√2<3/2:le due risposte sono distinte senza decimali.

## 13 — La quota di caduta per un bersaglio

Il bersaglio è8√2 m e il suo quadrato128 m². Isolando H_B=R_B²/(4h_B) troviamo128/16=8 m. Rispetto ai4 m di A il rapporto è due. La superficie di B si trova allora a12 m dal suolo.

Passaggi: `R_B=8\sqrt2\,\mathrm m\qquad R_B^2=128\,\mathrm{m^2}\qquad H_B=8\,\mathrm m\qquad H_B/H_A=2`

Errori e controllo: Otto è la quota finale numerica,non il rapporto.2√2 è il bersaglio delle distanze,quattro segue il battente e un mezzo inverte gli stati. Il bersaglio conserva H>0 e h>0.

## 14 — Tarare la gittata per trovare il battente

La distanza A4 m fissa q=3 m⁻¹. La lettura24√2 rappresenta8√2 m. Il suo quadrato128 m²,diviso per4H_B=32 m,dà battente4 m. La superficie è dunque sopra il foro,come richiede l’efflusso.

Passaggi: `q=3\,\mathrm{m^{-1}}\qquad R_B=8\sqrt2\,\mathrm m\qquad h_B=\frac{128\,\mathrm{m^2}}{32\,\mathrm m}\qquad h_B=4\,\mathrm m`

Errori e controllo: Usare la lettura come distanza darebbe36 m di battente perché il guadagno verrebbe elevato al quadrato. Il fattoreq va rimosso prima di quadrare R. La quota H_B8 m resta un dato della caduta,non il battente da ricostruire.

## 15 — Una taratura con riferimento radicale

Le gittate note sono4 e8√2 m. La differenza delle letture è2(8√2−4),quindiq=2 m⁻¹ e z=1. C ha R_C=(17−1)/2=8 m. ConH_C4 m il battente vale64/(4·4)=4 m.

Passaggi: `q=\frac{2(8\sqrt2-4)}{8\sqrt2-4}\,\mathrm{m^{-1}}\qquad q=2\,\mathrm{m^{-1}}\qquad z=1\qquad R_C=8\,\mathrm m\qquad h_C=4\,\mathrm m`

Errori e controllo: Il denominatore della taratura è non nullo:8√2>4. A H4 m,i battenti1,2,8,16 m darebbero letture9,1+8√2,1+16√2,33;nessuna è17. L’offset va sottratto prima del guadagno e del quadrato.

## 16 — Un battente pari a un quarto della quota

Sostituendo nel prodotto geometrico,R=2√(H²/4)=√(H²)=|H|. La quota è positiva per ipotesi,quindi R=H. La misura4 m fissa H4 m e battente h1 m,con superficie a quota5 m.

Passaggi: `h=H/4\qquad R=2\sqrt{H^2/4}\qquad R=|H|\qquad H>0\qquad H=4\,\mathrm m`

Errori e controllo: La radice diH² è il valore assoluto,non automaticamente H su tutti i reali:il dominio positivo seleziona qui la quota corretta. Un’altezza negativa non descrive un foro sopra il suolo. Il vincolo è geometrico fra apparati e determina una sola coppia positiva.
