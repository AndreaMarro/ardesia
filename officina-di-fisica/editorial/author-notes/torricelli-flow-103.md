# torricelli-flow-103 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U3-03.json. Tutti gli 80 originali 100–104 letti individualmente prima della scrittura, comprese le varianti 101-03 e 104-06. ID effettivi confermati. Riletti C2-L005 e C2-L006 nel catalogo; assemble_family canonico, course C2, unit u3.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Nessun verificatore o firma scientifica propria; nessuna pubblicazione. Queste sono note di calcolo dell’autore per una revisione distinta.

Modello istantaneo quasi stazionario, serbatoio grande e piccolo foro; coefficienti ideali e pressione coerente. Conversione esatta mm²·m/s → mL/s esplicitata: i due fattori 10^−6 si compensano. Nessuna perdita o contrazione aggiunta senza dichiarazione.

SVG completo letto in XML e rendering nativo. Ogni quantità rappresentata ha scala dichiarata e riferimento esplicito. Frecce su path separati; le formule usano law_steps e blocchi brevi. Nessun CSS, renderer o gate modificato.

## 01 — Un millimetro quadrato sotto cinque metri

Torricelli dà velocità√(2gH)=10 m/s. Moltiplicandola per1 mm² otteniamo10·10⁻⁶ m³/s. Poiché1 mL=10⁻⁶ m³,la portata è10 mL/s: la coincidenza dei numeri discende dalle due conversioni esatte,non dall’uguaglianza fra area e volume.

Passaggi: `v=10\,\mathrm{m/s}\qquad A=10^{-6}\,\mathrm{m^2}\qquad Q=10\cdot10^{-6}\,\mathrm{m^3/s}\qquad 1\,\mathrm{mL}=10^{-6}\,\mathrm{m^3}\qquad Q=10\,\mathrm{mL/s}`

Errori e controllo: Dieci mL/s è un volume per tempo,non una velocità. Dimenticare la conversione dell’area darebbe un valore un milione di volte troppo grande in m³/s. Il modello non include un coefficiente sperimentale di efflusso minore di uno.

## 02 — L’unità di una portata del getto

Il prodotto area per velocità ha dimensione di volume per tempo. Il millilitro è una misura di volume;non è una lunghezza da moltiplicare ancora per un’area. Per questa scelta di unità,1 mm²·1 m/s equivale esattamente a1 mL/s.

Passaggi: `[Q]=L^3/T\qquad 1\,\mathrm{mm^2}\cdot1\,\mathrm{m/s}=10^{-6}\,\mathrm{m^3/s}\qquad 10^{-6}\,\mathrm{m^3/s}=1\,\mathrm{mL/s}`

Errori e controllo: m/s è velocità,mm² area,mL volume senza tempo e kg/s portata massica. Per passare a massa al secondo occorrerebbe moltiplicare Q per la densità del liquido.

## 03 — Dalla velocità di Torricelli alla portata

Nel modello di piccolo foro la velocità è√(2gH). La portata è il volume che attraversa l’area per secondo:Q=Av. Moltiplichiamo quindi l’area per il modulo della velocità uniforme. La pressione comune elimina un contributo energetico differenziale,non l’area di efflusso.

Passaggi: `v=\sqrt{2gH}\qquad Q=Av\qquad Q=A\sqrt{2gH}`

Errori e controllo: Dividere perA inverte la dipendenza geometrica e altera le dimensioni. A·2gH usa v² invece di v;√(gH) perde il fattore due energetico e il doppio esterno non deriva da alcun foro aggiuntivo.

## 04 — Area doppia allo stesso battente

Alla stessa profondità la velocità rimane10 m/s. Il foro più grande lascia passare il doppio volume per secondo:Q cresce da10 a20 mL/s. La scala assegnata è quella delle aree già calcolate,non di un raggio da elevare al quadrato.

Passaggi: `v_A=v_B=10\,\mathrm{m/s}\qquad Q_B/Q_A=A_B/A_A=2\qquad Q_B=20\,\mathrm{mL/s}`

Errori e controllo: √2 applicherebbe la radice all’area anziché al battente;quaranta conta due volte il raddoppio. Cinque inverte l’effetto e dieci ignora il nuovo foro. Entrambi i fori restano piccoli rispetto al serbatoio nel modello.

## 05 — L’area del foro dalla portata

Il battente assegna v=10 m/s. Dividendo la portata per la velocità si ricava un’area:10 mL/s corrispondono a10·10⁻⁶ m³/s,quindi A=10⁻⁶ m²=1 mm². Il rapporto fra numeri vale uno perché le unità sono state convertite coerentemente.

Passaggi: `A=Q/v\qquad v=10\,\mathrm{m/s}\qquad A=10^{-6}\,\mathrm{m^2}\qquad A=1\,\mathrm{mm^2}`

Errori e controllo: Qv non è un’area e il reciproco v/Q è area inversa. Il valore1 non può essere seguito da m²:quella diversa unità cambierebbe l’area di un milione.

## 06 — Il battente dalla portata di un foro noto

Dal rapporto Q/A ricaviamo v=10 m/s,usando le conversioni esatte di mL e mm². Poi H=v²/(2g)=100/20=5 m. L’area deve essere nota:una sola portata senza area non identifica il battente.

Passaggi: `v=Q/A=10\,\mathrm{m/s}\qquad H=\frac{v^2}{2g}\qquad H=\frac{100}{20}\,\mathrm m\qquad H=5\,\mathrm m`

Errori e controllo: Usare v/(2g) fallirebbe il controllo dimensionale e dimenticare il due darebbe10 m. Il valore ricostruito è il battente verticale istantaneo,non una distanza lungo il tubo.

## 07 — Battente quadruplo, stessa area

La velocità passa da10 a20 m/s perché il battente quadruplica. Alla stessa area le portate passano da10 a20 mL/s e il rapporto è due. La portata è lineare in A,ma cresce con la radice di H.

Passaggi: `Q_A=10\,\mathrm{mL/s}\qquad Q_B=20\,\mathrm{mL/s}\qquad Q_B/Q_A=2`

Errori e controllo: Quattro tratta Q come proporzionale aH;un mezzo e un quarto invertono il confronto. Venti è il numero della portata B,non il suo rapporto aQ_A.

## 08 — Una portata proposta eccessiva

La velocità10 m/s e l’area1 mm² danno10 mL/s. La proposta ne aggiunge altrettanti:lo scarto è+10 mL/s. Per ottenere20 mL/s con la stessa area servirebbe velocità20 m/s e battente20 m,non5 m.

Passaggi: `Q=10\,\mathrm{mL/s}\qquad e=(20-10)\,\mathrm{mL/s}\qquad e=10\,\mathrm{mL/s}`

Errori e controllo: Il meno scambia l’ordine;venti copia la proposta,zero la accetta e cinque dimezza lo scarto. Non si sommano due volte i volumi di ingresso e uscita nello stesso bilancio di portata.

## 09 — L’inversa simbolica dell’area

Il fattore√(2gH) è una velocità positiva. Dividere Q per esso lascia un’area,come richiede l’incognita. L’equazione è fisica e vale con qualsiasi insieme coerente di unità;il risultato può poi essere convertito in mm².

Passaggi: `Q=A\sqrt{2gH}\qquad A=\frac{Q}{\sqrt{2gH}}\qquad [A]=(L^3/T)/(L/T)=L^2`

Errori e controllo: Moltiplicare per la velocità o prendere il reciproco fallisce le dimensioni di un’area. Dividere per2gH userebbe v²,non v;il doppio finale modifica la portata senza un fattore dato.

## 10 — Area e battente scalati insieme

L’area compare come fattore lineare fuori dalla radice,il battente dentro la radice. Sostituendo e dividendo perQ_A si ottieneκ₁√κ₂. Il coefficiente ideale di efflusso resta lo stesso e vale uno in entrambe le prove.

Passaggi: `Q_B=\kappa_1A_A\sqrt{2g\kappa_2H_A}\qquad Q_B/Q_A=\kappa_1\sqrt{\kappa_2}`

Errori e controllo: κ₁κ₂ perde la radice suH;√(κ₁κ₂) applica la radice anche all’area. Il quoziente rende inversa la dipendenza daH e il quadrato diκ₁ scambia un’area con un raggio.

## 11 — Due volte l’area e quattro volte il battente

La velocità raddoppia e l’area raddoppia,perciò la portata quadruplica. I valori sono10 e40 mL/s;il rapporto è quattro. Il fattore otto moltiplicherebbe erroneamente per quattro anche la velocità.

Passaggi: `v_B=20\,\mathrm{m/s}\qquad Q_B=40\,\mathrm{mL/s}\qquad Q_B/Q_A=4`

Errori e controllo: Due segue soltanto una delle due variazioni,otto trattaH linearmente,un quarto inverte gli stati. Quaranta è il numero della portata B in mL/s,non il rapporto puro.

## 12 — Media delle due portate ideali

Le portate sono10 e40 mL/s. Sommate danno50 mL/s e la semisomma è25 mL/s. Non si sta descrivendo lo svuotamento di un singolo serbatoio nel tempo:è una media di risultati di due prove.

Passaggi: `\overline Q=\frac{10+40}{2}\,\mathrm{mL/s}\qquad \overline Q=25\,\mathrm{mL/s}`

Errori e controllo: Cinquanta è la somma,25/2 divide ancora e trenta è la differenza. Area media3/2 mm² e battente medio25/2 m darebbero15√10/2 mL/s. Il quadrato di quel numero è1125/2,diverso da625=25²,quindi non è la media richiesta senza dover approssimare√10.

## 13 — Il battente per quadruplicare la portata

Il bersaglio è40 mL/s. L’area doppia richiede velocità20 m/s,il doppio del riferimento. Per raddoppiare la velocità occorre quadruplicare il battente:da5 a20 m,rapporto quattro.

Passaggi: `Q_B=40\,\mathrm{mL/s}\qquad v_B=20\,\mathrm{m/s}\qquad H_B=20\,\mathrm m\qquad H_B/H_A=4`

Errori e controllo: Due segue la velocità invece del suo quadrato;un quarto inverte gli stati. Otto moltiplica ancora per l’area già inserita e venti è il battente B come numero in m,non il rapporto.

## 14 — Tarare Q per trovare l’area del foro

Il riferimento10 mL/s fissa q=3 s/mL. La lettura120 rappresenta40 mL/s. Il battente20 m dà velocità20 m/s e quindi area2 mm²,grazie alla conversione esatta fra mm²·m/s e mL/s.

Passaggi: `q=3\,\mathrm{s/mL}\qquad Q_B=40\,\mathrm{mL/s}\qquad v_B=20\,\mathrm{m/s}\qquad A_B=2\,\mathrm{mm^2}`

Errori e controllo: Interpretare120 come portata fisica darebbe6 mm²,incorporando il guadagno nell’area. Il numero2 si riferisce a mm²:non a un lato del foro da elevare ancora al quadrato.

## 15 — Due tarature e una portata intermedia

Le portate di riferimento10 e40 mL/s danno q=(81−21)/(40−10)=2 s/mL e z=1. La lettura41 significa Q_C=20 mL/s. Con velocità10 m/s,l’area è2 mm².

Passaggi: `q=2\,\mathrm{s/mL}\qquad z=1\qquad Q_C=20\,\mathrm{mL/s}\qquad v_C=10\,\mathrm{m/s}\qquad A_C=2\,\mathrm{mm^2}`

Errori e controllo: Al battente5 m,aree1,3,4,1/2 mm² darebbero letture21,61,81,11. Solo2 mm² restituisce41. L’offset va rimosso prima della divisione perq,e la conversione delle unità resta parte dell’inversa.

## 16 — Un vincolo che porta a un cubo perfetto

Poniamo x=H/(1 m)>0 e a=A/(1 mm²). Il vincolo diventa a=x/5. Con le unità dichiarate il numero della portata valea√(20x). Elevando al quadrato una quantità positiva,100=(x²/25)20x=(4/5)x³. Ne segue x³=125,cioè x=5 senza approssimazioni.

Passaggi: `x=H/(1\,\mathrm m)\qquad a=x/5\qquad 100=\frac45x^3\qquad x^3=125\qquad x=5\qquad H=5\,\mathrm m`

Errori e controllo: Il vincolo mantiene le unità di c:area per lunghezza,non un numero puro. H5 m dàA1 mm² e riproduceQ10 mL/s. Nel dominio positivo il cubo è strettamente crescente:non ci sono due battenti fisici né un ramo negativo da conservare.
