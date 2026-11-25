# wave-displacement-projection-147 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U4-02.json. Letti individualmente tutti gli 48 originali assegnati 145–147 prima della scrittura. Famiglie e ID effettivi confermati. Riletta la lezione reale C5-L01/L02/L03/L05 e le fondazioni reali C1-L001/L005/L006/L008. Stesso assemble_family, course C5, unit u4.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Nessun verificatore o firma scientifica dell’autore; nessuna pubblicazione. Seguono calcoli e limiti da sottoporre a un revisore distinto.

Le leggi e le ipotesi sono sviluppate dai testi sorgente e dalle lezioni reali rilette. I due casi Doppler sono mantenuti distinti dalla differenza fra frequenze dei battimenti. Le disuguaglianze dei rami e il limite del coseno sono espliciti. Nessuna chiave originaria viene usata come verifica scientifica; queste note espongono il ragionamento dell’autore per la revisione distinta.

SVG letto integralmente in XML e rendering nativo. Scale dichiarate e geometria controllata dall’autore; il rendering nativo può omettere le punte dei marker, lette separatamente in XML. Formule suddivise con law_steps. Le anteprime verificano il lettore esistente, senza modifiche a CSS, renderer o gate. Questi controlli tecnici non costituiscono una revisione scientifica indipendente.

## 01 — Uno spostamento minore dell’ampiezza

Il coseno assegnato dimezza l’ampiezza: quattro millimetri per un mezzo danno due millimetri. Il punto non è al massimo allontanamento, perché c_φ non è uno. La proiezione geometrica in figura rappresenta la fase; non è una traiettoria circolare del punto materiale.

Passaggi: `s=A c_\varphi\qquad s=4\,\mathrm{mm}\cdot\frac12\qquad s=2\,\mathrm{mm}\qquad 0<s\le A`

Errori e controllo: Quattro confonde ampiezza e spostamento in ogni fase; otto divide per il coseno anziché moltiplicare. Un mezzo è puro, non una lunghezza. Il dato assegnato evita di stimare una funzione trigonometrica con la calcolatrice.

## 02 — L’unità di una coordinata locale

Uno spostamento ha dimensione di lunghezza, e il coseno è puro. Moltiplicare A per c_φ mantiene millimetri. Il carattere orientato della coordinata ne cambia eventualmente il segno, non l’unità.

Passaggi: `[s]=[A][c_\varphi]\qquad [s]=L\cdot1=L`

Errori e controllo: Hz esprime frequenza, mm/s velocità, rad una fase e mm² area. Non si usa la fase come unità della coordinata soltanto perché il coseno la collega allo spostamento.

## 03 — La legge con il coseno già assegnato

Nella legge armonica la fase entra come argomento del coseno e l’ampiezza ne moltiplica il valore. Il simbolo c_φ contiene già il risultato del coseno: non bisogna applicare un secondo coseno né elevare il valore al quadrato.

Passaggi: `s=A\cos\varphi\qquad c_\varphi=\cos\varphi\qquad s=A c_\varphi`

Errori e controllo: A/c_φ supera A quando c_φ<1, contro il limite armonico. c_φ/A ha unità di lunghezza inversa; A+c_φ somma dimensioni diverse. Il quadrato altera la legge e perderebbe anche informazioni di segno fuori dal ramo positivo.

## 04 — Cambiare ampiezza alla stessa fase

Alla stessa fase il fattore di proiezione resta un mezzo. Il nuovo spostamento è metà di sei, tre millimetri. Ampiezza e spostamento crescono entrambi del fattore tre mezzi; non stiamo descrivendo l’evoluzione temporale della stessa prova, ma confrontando due ampiezze.

Passaggi: `s_A=2\,\mathrm{mm}\qquad s_B=3\,\mathrm{mm}\qquad s_B/s_A=\frac32`

Errori e controllo: Sei copia l’ampiezza, quattro terzi inverte il fattore, due ignora la modifica e nove mezzi quadra il fattore di ampiezza. La fase fissata impedisce un secondo cambiamento indipendente del coseno.

## 05 — Ricostruire l’ampiezza

Per rimuovere il fattore un mezzo dividiamo lo spostamento per esso: A=s/c_φ=4 mm. Dividere per un numero minore di uno aumenta il valore e ricostruisce un’ampiezza non inferiore al modulo dello spostamento.

Passaggi: `A=\frac{s}{c_\varphi}\qquad A=\frac2{1/2}\,\mathrm{mm}\qquad A=4\,\mathrm{mm}`

Errori e controllo: Uno moltiplica nuovamente per un mezzo. Due confonde s con A come se il coseno fosse uno. La positività del coseno evita una divisione per zero e seleziona il ramo dello spostamento qui dichiarato.

## 06 — Verificare un coseno fisicamente ammesso

Il rapporto c_φ=s/A elimina le unità: due diviso quattro dà un mezzo. È compreso fra zero escluso e uno incluso, quindi è ammissibile. Questo valore del coseno non fissa da solo una sola fase assoluta: fasi opposte e giri completi possono dare lo stesso coseno.

Passaggi: `c_\varphi=\frac sA\qquad c_\varphi=\frac12\qquad 0<c_\varphi\le1`

Errori e controllo: Due è il reciproco e non è il coseno di una fase reale; otto conserva unità di area invece di un rapporto puro. Non occorre riportare un angolo in gradi quando si chiede soltanto il coseno.

## 07 — Raggiungere il massimo positivo

Il coseno passa da un mezzo al massimo ammesso uno. Gli spostamenti sono due e quattro millimetri, rapporto due. In B lo spostamento coincide con l’ampiezza; un coseno maggiore di uno non sarebbe una possibile ulteriore fase.

Passaggi: `s_A=2\,\mathrm{mm}\qquad s_B=4\,\mathrm{mm}\qquad s_B/s_A=2`

Errori e controllo: Un mezzo inverte gli stati, uno ignora la nuova fase, quattro è il numero di mm finale e un quarto quadra il reciproco. Non si sta raddoppiando l’ampiezza del moto.

## 08 — Uno scarto nella coordinata

Il corretto spostamento è due millimetri. Quattro meno due dà uno scarto positivo di due millimetri. La proposta è un’ampiezza possibile, ma non lo spostamento nella fase assegnata: il controllo s≤A da solo non basta.

Passaggi: `s=2\,\mathrm{mm}\qquad e=(4-2)\,\mathrm{mm}\qquad e=2\,\mathrm{mm}`

Errori e controllo: Meno due scambia l’ordine, quattro conserva la proposta, sei somma e zero la accetta. Non bisogna cambiare il coseno per far combaciare la proposta con i dati fissati.

## 09 — L’inversa e il suo dominio

Dividiamo entrambi i membri per c_φ>0. Si ottiene A=s/c_φ; il divisore puro lascia le unità di s. Con c_φ≤1 segue anche A≥s, un controllo fisico dell’inversa. Se c_φ fosse zero, lo spostamento nullo non permetterebbe questa divisione e non determinerebbe A.

Passaggi: `A=\frac{s}{c_\varphi}\qquad [A]=L\qquad A\ge s>0`

Errori e controllo: s c_φ applica la proiezione una seconda volta. c_φ/s è una lunghezza inversa; il coseno al quadrato inventa una legge diversa e la somma mescola lunghezza e numero puro.

## 10 — Due fattori entro il limite del coseno

La nuova ampiezza e il nuovo coseno entrano entrambi nel prodotto. Il rapporto degli spostamenti è κ₁κ₂. I fattori non sono però arbitrari: il nuovo coseno deve restare al massimo uno, altrimenti l’algebra descriverebbe un punto fuori dal modello armonico reale.

Passaggi: `s_B=\kappa_1\kappa_2 A_Ac_{\varphi,A}\qquad s_B/s_A=\kappa_1\kappa_2\qquad 0<\kappa_2c_{\varphi,A}\le1`

Errori e controllo: I quozienti invertono dipendenze dirette; il quadrato di κ₂ non è nella legge. La somma darebbe due per prove identiche. La sola positività dei fattori non garantisce il limite del coseno.

## 11 — Ampiezza minore, proiezione maggiore

A produce due millimetri, B tre. Il rapporto è tre mezzi: l’ampiezza più piccola non obbliga uno spostamento locale più piccolo, perché B è al suo massimo positivo mentre A non lo è.

Passaggi: `s_A=2\,\mathrm{mm}\qquad s_B=3\,\mathrm{mm}\qquad s_B/s_A=\frac32`

Errori e controllo: Due terzi capovolge gli stati, tre quarti segue solo A e due soltanto il coseno. Tre è il numero di millimetri finale, non il rapporto puro.

## 12 — Una media di coordinate locali

I due spostamenti sono due e tre millimetri; la semisomma vale cinque mezzi millimetri. Usare invece A medio 7/2 mm e coseno medio 3/4 darebbe 21/8 mm, maggiore di un ottavo. Entrambe le procedure hanno unità di lunghezza, ma sono operazioni diverse.

Passaggi: `\overline s=\frac{2+3}{2}\,\mathrm{mm}\qquad \overline s=\frac52\,\mathrm{mm}`

Errori e controllo: Cinque è la somma, un mezzo la semidifferenza e tre la sola B. Ventuno ottavi usa gli ingressi medi del prodotto: non è la media delle due letture richiesta. Il coseno medio non viene qui interpretato come una fase media univoca.

## 13 — Un target al massimo coseno

Il target è tre millimetri. Con ampiezza tre millimetri, deve essere c_φ,B=1. Il rapporto con il mezzo iniziale è due: la nuova fase raggiunge il bordo del dominio. Un target ancora maggiore di tre millimetri, con questa ampiezza, non sarebbe ottenibile cambiando soltanto la fase.

Passaggi: `s_B=3\,\mathrm{mm}\qquad c_{\varphi,B}=\frac{s_B}{A_B}=1\qquad c_{\varphi,B}/c_{\varphi,A}=2`

Errori e controllo: Un mezzo inverte il rapporto, tre mezzi copia il target e tre quarti segue l’ampiezza. Quattro porterebbe c_φ,B a due e violerebbe il limite di un coseno.

## 14 — Taratura e ampiezza al massimo

Il riferimento ha s=2 mm e q=3 mm⁻¹. La lettura nove rappresenta s=3 mm. Nella nuova prova il coseno è uno, dunque s coincide con l’ampiezza: A_B=3 mm. Questa coincidenza dipende dalla fase B e non valeva nel riferimento.

Passaggi: `q=3\,\mathrm{mm^{-1}}\qquad s_B=3\,\mathrm{mm}\qquad A_B=s_B/c_{\varphi,B}\qquad A_B=3\,\mathrm{mm}`

Errori e controllo: Nove copia la lettura adimensionale e quattro l’ampiezza di riferimento. La taratura deve essere applicata anche quando il nuovo coseno è uno.

## 15 — Un offset prima della fase

I riferimenti s_A=2 mm e s_B=3 mm fissano q=2 mm⁻¹ e b=1. La lettura tre dà s_C=(3−1)/2=1 mm. Poiché il nuovo coseno vale uno, l’ampiezza è anch’essa un millimetro.

Passaggi: `q=2\,\mathrm{mm^{-1}}\qquad b=1\qquad s_C=1\,\mathrm{mm}\qquad A_C=1\,\mathrm{mm}`

Errori e controllo: Tre copia la lettura, due e quattro ampiezze delle prove precedenti. Mezzo darebbe S=2 con c_φ=1; soltanto uno ricostruisce S=3. Non si sottrae l’offset dopo aver già diviso e dimenticato la sua unità strumentale.

## 16 — Un vincolo sul coseno e sull’ampiezza

Sostituendo il vincolo si ottiene s=b c_φ². Il rapporto due mm su otto mm dà c_φ²=1/4. Il ramo positivo seleziona un mezzo, che non supera uno. L’ampiezza ricostruita è quattro millimetri; sostituendo si ritrova s=2 mm.

Passaggi: `s=b c_\varphi^2\qquad c_\varphi^2=\frac14\qquad c_\varphi=\frac12\qquad A=4\,\mathrm{mm}`

Errori e controllo: Meno un mezzo viola il ramo, un quarto è il quadrato e due supera il massimo di un coseno reale. Uno produrrebbe s=8 mm. Il coefficiente b è una lunghezza, non un numero puro; la radice è presa su un rapporto adimensionale.

## Dominio e figura

Tutti i dati originali sono mantenuti; le inverse impongono c_φ>0 e verificano c_φ≤1, compreso il bordo superiore. La proiezione geometrica non è una traiettoria del punto. Il raggio e il triangolo hanno coordinate SVG arrotondate al millesimo di pixel per rappresentare una costruzione esatta, con raggio 160 px e proiezione 80 px; nessun risultato didattico è approssimato. Il grafico normalizzato distingue zero escluso e uno incluso, e le barre degli spostamenti usano una diversa scala dichiarata.
