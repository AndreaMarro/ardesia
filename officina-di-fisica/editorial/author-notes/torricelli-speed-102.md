# torricelli-speed-102 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U3-03.json. Tutti gli 80 originali 100–104 letti individualmente prima della scrittura, comprese le varianti 101-03 e 104-06. ID effettivi confermati. Riletti C2-L005 e C2-L006 nel catalogo; assemble_family canonico, course C2, unit u3.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Nessun verificatore o firma scientifica propria; nessuna pubblicazione. Queste sono note di calcolo dell’autore per una revisione distinta.

Modello istantaneo quasi stazionario di grande serbatoio, velocità superficiale trascurata; stessa pressione esterna alla superficie e nel getto, fluido incomprimibile ideale. Radici esatte e segni fisici espliciti. Nessuna approssimazione numerica richiesta.

SVG completo letto in XML e rendering nativo. Ogni quantità rappresentata ha scala dichiarata e riferimento esplicito. Frecce su path separati; le formule usano law_steps e blocchi brevi. Nessun CSS, renderer o gate modificato.

## 01 — Un battente di cinque metri

Bernoulli fra la superficie quasi ferma e il getto elimina la pressione comune: l’energia di quota per massa gH diventa v²/2. Il prodotto2gH vale100 m²/s² e la radice positiva è10 m/s. Non occorre la densità perché compare in entrambi i contributi e si cancella.

Passaggi: `gH=v^2/2\qquad v^2=2gH\qquad v^2=100\,\mathrm{m^2/s^2}\qquad v=10\,\mathrm{m/s}`

Errori e controllo: Cento è il quadrato della velocità,non la velocità. Venti aggiungerebbe un fattore due dopo la radice. La formula è istantanea: se il serbatoio si svuota e H diminuisce,non si mantiene automaticamente10 m/s per tutto il processo.

## 02 — La radice di un’energia per massa

gH ha dimensioni L²/T²; la radice quadrata restituisce L/T. Il fattore due è puro e non cambia la dimensione. Il risultato è una velocità di efflusso e si può esprimere in metri al secondo.

Passaggi: `[gH]=L^2/T^2\qquad [\sqrt{2gH}]=L/T\qquad [v]=\mathrm{m/s}`

Errori e controllo: m²/s² è l’unità di v², m una lunghezza, s un tempo e Pa una pressione. La presenza di g non impone un risultato in m/s²,dato che viene moltiplicata per H prima della radice.

## 03 — Torricelli nel modello di grande serbatoio

Scegliamo il foro come quota zero e la superficie a quota H. Bernoulli con pressioni uguali e velocità superficiale trascurata dà gH=v²/2. Isolando il quadrato e scegliendo il modulo positivo si ottiene v=√(2gH). La piccola area del foro è la ragione per cui il moto della superficie è trascurabile.

Passaggi: `gH=v^2/2\qquad v^2=2gH\qquad v=\sqrt{2gH}`

Errori e controllo: 2gH è v²;√(gH) perde il fattore due,√(2g/H) ha dimensione inversa di tempo e il segno negativo non è un modulo. Con un rapporto di aree non piccolo occorrerebbe mantenere anche l’energia cinetica alla superficie.

## 04 — Gravità diversa allo stesso battente

La velocità al quadrato passa da100 a20 m²/s². Scriviamo20=4·5 ed estraiamo soltanto il quadrato perfetto4: v_B=2√5 m/s. La radice resta esatta e non richiede una valutazione decimale.

Passaggi: `v_A=10\,\mathrm{m/s}\qquad v_B^2=20\,\mathrm{m^2/s^2}\qquad v_B=\sqrt{4\cdot5}\,\mathrm{m/s}\qquad v_B=2\sqrt5\,\mathrm{m/s}`

Errori e controllo: Due m/s applicherebbe a v il fattore1/5 di g,invece della sua radice. Cinquanta inverte quell’effetto;dieci ignora la gravità nuova e venti rende maggiore una velocità che deve diminuire.

## 05 — Ricavare g dalla velocità e dal battente

Eleviamo al quadrato la velocità misurata e dividiamo per2H. Il numeratore100 m²/s²,diviso per10 m,dà10 m/s². La radice della legge diretta non introduce due valori di g: l’inversa è lineare in g.

Passaggi: `g=\frac{v^2}{2H}\qquad g=\frac{100\,\mathrm{m^2/s^2}}{10\,\mathrm m}\qquad g=10\,\mathrm{m/s^2}`

Errori e controllo: v/(2H) avrebbe unità s⁻¹ e non accelerazione. Dimenticare il due darebbe20 m/s². Il controllo2·10·5=100 ricostruisce il quadrato osservato.

## 06 — Il battente necessario per la velocità

La velocità assegnata corrisponde a un’energia cinetica per massa v²/2=50 m²/s². Dividendo per g si ricava H=5 m. Il battente è la distanza verticale fra superficie e foro,non la quota assoluta del foro rispetto al suolo.

Passaggi: `H=\frac{v^2}{2g}\qquad H=\frac{100\,\mathrm{m^2/s^2}}{20\,\mathrm{m/s^2}}\qquad H=5\,\mathrm m`

Errori e controllo: Dieci metri ometterebbero il fattore due. La quota del suolo non serve per il modulo iniziale di efflusso,ma servirebbe per descrivere la successiva caduta del getto.

## 07 — Quattro volte il battente

Il battente quadruplica e con esso v². Le velocità sono10 e20 m/s,quindi il rapporto è due. L’efflusso dipende dalla radice del battente,non dal battente al primo grado.

Passaggi: `v_A=10\,\mathrm{m/s}\qquad v_B^2=400\,\mathrm{m^2/s^2}\qquad v_B=20\,\mathrm{m/s}\qquad v_B/v_A=2`

Errori e controllo: Quattro è il fattore dei quadrati;un mezzo e un quarto invertono il confronto. Venti è il numero della velocità B in m/s,non il rapporto adimensionale.

## 08 — Una velocità proposta doppia

La velocità corretta è10 m/s e lo scarto è20−10=+10 m/s. La proposta avrebbe energia cinetica per massa200 m²/s²,quattro volte i50 m²/s² forniti dal battente. Il controllo energetico individua l’eccesso prima della sottrazione.

Passaggi: `v=10\,\mathrm{m/s}\qquad e=(20-10)\,\mathrm{m/s}\qquad e=10\,\mathrm{m/s}`

Errori e controllo: −10 scambia l’ordine;venti copia la proposta,zero la conferma e cinque dimezza la differenza. La pressione comune non fornisce un lavoro differenziale extra da usare per giustificare la proposta.

## 09 — L’inversa simbolica per la gravità

Dato v>0,possiamo quadrare la legge senza perdere la sua soluzione fisica. Dividere v²=2gH per2H>0 isola g. L’unità L²/T² divisa per L è quella di un’accelerazione.

Passaggi: `v^2=2gH\qquad g=\frac{v^2}{2H}`

Errori e controllo: v/(2H) non è un’accelerazione;2v²/H introduce un fattore quattro rispetto all’inversa corretta. H/(2v²) ha dimensione inversa di accelerazione e v²H/2 contiene una lunghezza in più al quadrato rispetto a g.

## 10 — Scalare gravità e battente

I due fattori moltiplicano v²,perciò il rapporto dei quadrati èκ₁κ₂. Poiché entrambe le velocità sono moduli positivi,il rapporto richiesto è la radice positiva del prodotto. La densità e la pressione comune non entrano nella scalatura.

Passaggi: `\frac{v_B^2}{v_A^2}=\kappa_1\kappa_2\qquad v_B/v_A=\sqrt{\kappa_1\kappa_2}`

Errori e controllo: Il prodotto senza radice riguarda v²,non v. I quozienti rendono inversa la dipendenza dal battente;la somma fallisce per prove identiche. Se i fattori sono entrambi4,la velocità cresce di4 e non di16.

## 11 — Gravità minore e battente maggiore

B ha v_B²=80 m²/s²,quindi v_B=4√5 m/s. Il confronto con10 m/s dà2√5/5. La gravità ridotta a un quinto e il battente quadruplicato moltiplicano v² per4/5,la cui radice resta esatta.

Passaggi: `v_B=4\sqrt5\,\mathrm{m/s}\qquad v_A=10\,\mathrm{m/s}\qquad v_B/v_A=\frac{2\sqrt5}{5}`

Errori e controllo: Quattro quinti è il rapporto dei quadrati;√5/5 segue soltanto g;due segue soltanto H. Il reciproco5/(2√5) scambia B e A. La risposta corretta è minore di uno perché il suo quadrato è4/5.

## 12 — Media esatta di due velocità

Le velocità sono10 e4√5 m/s. La semisomma si semplifica a5+2√5 m/s. Manteniamo il radicale esatto: non occorre calcolare√5 per sommare i due termini con coefficienti interi.

Passaggi: `\overline v=\frac{10+4\sqrt5}{2}\,\mathrm{m/s}\qquad \overline v=(5+2\sqrt5)\,\mathrm{m/s}`

Errori e controllo: 10+4√5 è la somma e la divisione aggiuntiva per due dimezza ancora. Gli ingressi medi g6 m/s²,H25/2 m darebbero√150=5√6 m/s,non la media richiesta. Quest’ultima è minore di10 poiché√5<5/2,mentre5√6>10: la distinzione si prova senza decimali.

## 13 — Il battente per una velocità bersaglio radicale

Il bersaglio è4√5 m/s e il suo quadrato è80 m²/s². Dividendo per2g_B=4 m/s² si ricava H_B=20 m. Il rapporto con5 m è quattro,anche se la velocità bersaglio è leggermente minore di quella iniziale.

Passaggi: `v_B=4\sqrt5\,\mathrm{m/s}\qquad v_B^2=80\,\mathrm{m^2/s^2}\qquad H_B=20\,\mathrm m\qquad H_B/H_A=4`

Errori e controllo: Due segue la radice del battente anziché il rapporto di battenti;un quarto inverte gli stati.4/5 è il rapporto di v² e venti il battente B come numero in metri. Il minor g richiede un battente maggiore per il bersaglio assegnato.

## 14 — Tarare una velocità senza approssimare

A ha velocità10 m/s e fissa q=3 s/m. La lettura12√5 rappresenta4√5 m/s. Il suo quadrato80 m²/s²,diviso per2H=40 m,restituisce g_B=2 m/s²: il radicale scompare esattamente.

Passaggi: `q=3\,\mathrm{s/m}\qquad v_B=4\sqrt5\,\mathrm{m/s}\qquad v_B^2=80\,\mathrm{m^2/s^2}\qquad g_B=2\,\mathrm{m/s^2}`

Errori e controllo: Trattare12√5 come velocità fisica moltiplicherebbe v² per9 e darebbe g18 m/s². Il guadagno va eliminato prima del quadrato,non dopo averlo perso nel dato.

## 15 — Due riferimenti radicali e un offset

Le velocità di riferimento sono10 e4√5 m/s. La differenza delle letture è2(4√5−10),quindi q=2 s/m e z=1. C dàv_C=2√5 m/s e v_C²=20 m²/s². Con H5 m segue g_C=2 m/s².

Passaggi: `q=\frac{2(4\sqrt5-10)}{4\sqrt5-10}\,\mathrm{s/m}\qquad q=2\,\mathrm{s/m}\qquad z=1\qquad v_C=2\sqrt5\,\mathrm{m/s}\qquad g_C=2\,\mathrm{m/s^2}`

Errori e controllo: Il fattore comune non è nullo:4√5=10 richiederebbe80=100 dopo il quadrato. Le alternative g10,4,1,8 m/s² darebbero letture21,1+4√10,1+2√10,1+8√5,non quella di C. Sottrarre l’offset prima del rapporto conserva il significato della taratura.

## 16 — Una gravità proporzionale al battente fra prove

Sostituiamo il vincolo prima di estrarre la radice: v²=2cH². Dividendo100 m²/s² per4 s⁻² troviamo H²=25 m². I due segni algebrici danno±5 m,ma solo quello positivo conserva anche g=cH>0.

Passaggi: `v^2=2cH^2\qquad H^2=25\,\mathrm{m^2}\qquad H_+=5\,\mathrm m\qquad H_-=-5\,\mathrm m`

Errori e controllo: Venticinque è H²,non H. La scelta negativa implica anche gravità orientata fuori dal modello g>0. H5 m dàg10 m/s² e ricostruisce v10 m/s. Il vincolo collega configurazioni,non una gravità che varia durante lo svuotamento.
