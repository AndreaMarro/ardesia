# mass-flow-092 — note dell’autore

Fonte5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U3-02.json. Tutti80 originali089–093 letti prima dell’authoring, con varianti dimensionali02 e profilo09103 separatamente. ID effettivi confermati; stesso assembler canonico courseC2/unitu3 e competenze esistenti rilette nel catalogo C2.

DRAFT; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN. Nessun verificatore o firma scientifica dell’autore. Note di calcolo per il revisore separato.

Densità uniforme sulla sezione e costante in ciascuna prova: ṁ=ρQ è portata massica, non massa finita.ρ inkg/L eQ inL/s cancellanoL esattamente.16ρ=cQ,c1/4kg·s/L² fra prove, Q²16L²/s²; radice positiva4L/s, negativa esclusa. Nessuna incomprimibilità assunta per identificare una portata locale seρèuniforme; non si impone stessaQsu sezioni di densità differenti.

SVG XML e rendering nativo completo letti dall’autore. Ogni grandezza ha la propria scala esplicita; vettori su path separati con marker-end, origini e riferimenti indicati. Le formule sono scomposte con il helper law_steps esistente; nessun CSS o renderer modificato.

## 01 — Quattro litri al secondo, quattro chilogrammi al secondo

Ogni litro trasporta un chilogrammo e ne attraversano quattro ogni secondo. Moltiplichiamo quindi massa per litro e litri per secondo: l’unità litro si cancella, lasciando kg/s. Non servono né il peso né la gravità per contare questa massa.

Passaggi: `\dot m=\rho Q\qquad \dot m=(1\,\mathrm{kg/L})(4\,\mathrm{L/s})\qquad \dot m=4\,\mathrm{kg/s}`

Errori e controllo: Quattro kg/s non è una massa finita: in un intervallo di 2 s, se la prova resta stazionaria, passano 8 kg. Dividere Q per ρ cambierebbe anche le dimensioni.

## 02 — La massa trasportata per tempo

La grandezza è un tasso di trasporto di massa. Il prodotto ρQ cancella il volume e lascia massa per tempo; in SI la stessa conclusione segue da kg/m³ per m³/s.

Passaggi: `[\dot m]=M/T\qquad \mathrm{kg/L}\cdot\mathrm{L/s}=\mathrm{kg/s}`

Errori e controllo: L/s è portata volumetrica, kg una massa senza tempo, N/s variazione di forza per tempo e kg/L densità. La conversione kg/s→g/s moltiplicherebbe il numero per mille senza cambiare dimensione.

## 03 — Dal volume alla massa senza una forza

Durante un piccolo intervallo Δt passa volume ΔV=QΔt e, poiché la densità è uniforme nella sezione, massa Δm=ρΔV. Dividendo per Δt si ottiene ṁ=ρQ. La relazione è locale: non impone da sola che Q resti uguale altrove se la densità cambia.

Passaggi: `\Delta m=\rho\Delta V\qquad \Delta V=Q\Delta t\qquad \dot m=\Delta m/\Delta t\qquad \dot m=\rho Q`

Errori e controllo: Q/ρ e ρ/Q non hanno dimensione M/T. Doppio e metà non corrispondono ad alcuna frazione di volume assegnata. Non compare g: una portata massica è distinta da una portata di peso.

## 04 — Un liquido meno denso alla stessa portata

Passa lo stesso volume ogni secondo, ma ogni litro contiene soltanto 4/5 della massa iniziale. La portata massica diminuisce quindi dello stesso fattore, da 4 a 16/5 kg/s. Si conserva la frazione esatta, senza una stima decimale.

Passaggi: `\dot m_A=4\,\mathrm{kg/s}\qquad \dot m_B=\frac45\cdot4\,\mathrm{kg/s}\qquad \dot m_B=\frac{16}{5}\,\mathrm{kg/s}`

Errori e controllo: Cinque inverte l’effetto della densità; quattro la ignora; 4/5 ripete la densità senza moltiplicare per Q e otto introduce un raddoppio assente. Q fissata non significa ṁ fissata fra fluidi diversi.

## 05 — La densità da due portate

Ogni secondo la massa osservata è 4 kg e il volume osservato 4 L. Il loro rapporto dà 1 kg/L; i secondi si cancellano. Il risultato è una proprietà dello stato del fluido, non un’area del condotto.

Passaggi: `\rho=\dot m/Q\qquad \rho=\frac{4\,\mathrm{kg/s}}{4\,\mathrm{L/s}}\qquad \rho=1\,\mathrm{kg/L}`

Errori e controllo: Il prodotto ṁQ avrebbe unità kg·L/s²; l’inverso Q/ṁ sarebbe volume per massa. In SI la densità corretta equivale esattamente a 1000 kg/m³.

## 06 — Il volume al secondo dalla massa

Ogni litro vale 1 kg; occorrono quindi quattro litri ogni secondo per trasportare la massa assegnata. Dividere ṁ per ρ cancella i chilogrammi e lascia litri al secondo.

Passaggi: `Q=\dot m/\rho\qquad Q=\frac{4\,\mathrm{kg/s}}{1\,\mathrm{kg/L}}\qquad Q=4\,\mathrm{L/s}`

Errori e controllo: Il numero quattro non autorizza a esprimere il risultato in kg/s: l’unità richiesta è volumetrica. Un intervallo temporale servirebbe per il volume totale, mentre la portata si ricava già da questi dati.

## 07 — Aumentare soltanto il volume per secondo

La densità uguale si cancella nel confronto. Le portate massiche sono 4 e 5 kg/s, quindi il rapporto è 5/4. L’incremento relativo è invece 1/4: non coincide con la frazione finale rispetto all’iniziale.

Passaggi: `\dot m_A=4\,\mathrm{kg/s}\qquad \dot m_B=5\,\mathrm{kg/s}\qquad \dot m_B/\dot m_A=\frac54`

Errori e controllo: Quattro quinti inverte gli stati; cinque è la nuova portata numerica e un quarto il solo incremento. Uno trascurerebbe il volume aggiuntivo trasportato ogni secondo.

## 08 — L’errore di una portata massica doppia

Il prodotto dà 4 kg/s. La proposta otto contiene un fattore due ingiustificato e supera di 4 kg/s la massa realmente trasportata. Il segno è positivo perché si sottrae il risultato corretto alla proposta.

Passaggi: `\dot m=4\,\mathrm{kg/s}\qquad e=(8-4)\,\mathrm{kg/s}\qquad e=4\,\mathrm{kg/s}`

Errori e controllo: −4 scambia l’ordine, otto ripete la proposta, zero la accetta e due dimezza lo scarto. La differenza non è in kg finché non la si integra su un tempo assegnato.

## 09 — L’inversa per una densità positiva

La portata volumetrica è un fattore positivo della relazione ṁ=ρQ. Dividere per Q isola ρ e mantiene il significato di massa per volume, poiché i due tassi hanno lo stesso denominatore temporale.

Passaggi: `\dot m=\rho Q\qquad \rho=\dot m/Q`

Errori e controllo: Moltiplicare le portate non cancella il tempo; Q/ṁ dà il volume specifico, reciproco della densità. Le formule con fattore due non ricostruiscono la portata massica assegnata.

## 10 — Scalare densità e portata volumetrica

La massa al secondo cresce direttamente sia con i chilogrammi per litro sia con i litri per secondo. Sostituendo i fattori nel prodotto, la portata iniziale si raccoglie e rimane κ₁κ₂.

Passaggi: `\dot m_B=(\kappa_1\rho_A)(\kappa_2Q_A)\qquad \dot m_B/\dot m_A=\kappa_1\kappa_2`

Errori e controllo: I quozienti introdurrebbero una dipendenza inversa assente; il quadrato conterebbe due volte la densità. La somma vale due quando entrambi i fattori valgono uno, quindi fallisce già il controllo di stati identici.

## 11 — Meno denso e meno volume al secondo

In B ogni secondo passa massa (4/5)·3=12/5 kg. Confrontandola con 4 kg/s, il fattore è (12/5)/4=3/5. I due cambiamenti riducono entrambi la portata massica.

Passaggi: `\dot m_B=\frac{12}{5}\,\mathrm{kg/s}\qquad \dot m_A=4\,\mathrm{kg/s}\qquad \dot m_B/\dot m_A=\frac35`

Errori e controllo: Cinque terzi inverte il confronto;4/5 segue soltanto la densità e3/4 soltanto il volume al secondo.12/5 è il numero della portata B, non un rapporto puro.

## 12 — Media di due portate massiche

Le due portate sono 4 e 12/5 kg/s. La loro somma è 32/5 kg/s e, divisa per due, dà 16/5 kg/s. La media ha la stessa unità dei due risultati e non rappresenta una massa accumulata.

Passaggi: `\overline{\dot m}=\frac{4+12/5}{2}\,\mathrm{kg/s}\qquad \overline{\dot m}=\frac{16}{5}\,\mathrm{kg/s}`

Errori e controllo: 32/5 somma senza dividere;8/5 divide due volte;quattro usa solo A. Le medie degli ingressi sonoρ9/10 kg/L eQ7/2 L/s: il loro prodotto63/20 kg/s differisce di1/20 dalla media richiesta.

## 13 — Una portata volumetrica per il bersaglio

La massa bersaglio è (3/5)4=12/5 kg/s. A densità4/5 kg/L corrisponde Q_B=(12/5)/(4/5)=3 L/s. Rispetto a4 L/s il fattore è3/4.

Passaggi: `\dot m_B=\frac{12}{5}\,\mathrm{kg/s}\qquad Q_B=3\,\mathrm{L/s}\qquad Q_B/Q_A=\frac34`

Errori e controllo: 3/5 è il fattore della massa al secondo, non del volume, perché la densità cambia.4/5 segue la sola densità;tre è il numero della portata finale e4/3 il reciproco del rapporto richiesto.

## 14 — La densità dopo una taratura senza offset

Il riferimento determina q=3 s/kg. Dividendo36/5 per3 otteniamo ṁ_B=12/5 kg/s. La densità è questa portata massica divisa per3 L/s, cioè4/5 kg/L.

Passaggi: `q=3\,\mathrm{s/kg}\qquad \dot m_B=\frac{12}{5}\,\mathrm{kg/s}\qquad \rho_B=\frac{12/5}{3}\,\mathrm{kg/L}\qquad \rho_B=\frac45\,\mathrm{kg/L}`

Errori e controllo: 12/5 è la densità errata che si otterrebbe usando la lettura grezza come portata massica prima di dividere perQ. Uno ignorerebbe la nuova misura,3/5 darebbe S=27/5 e5/4 invertirebbe il valore numerico senza ricostruire i dati.

## 15 — L’offset in una misura di massa al secondo

La variazione di portata massica è12/5−4=−8/5 kg/s e quella di lettura29/5−9=−16/5, quindi q=2 s/kg, positivo. L’offset è1. C ha ṁ_C=(37/5−1)/2=16/5 kg/s, da dividere per4 L/s.

Passaggi: `q=\frac{-16/5}{-8/5}\,\mathrm{s/kg}\qquad q=2\,\mathrm{s/kg}\qquad z=1\qquad \dot m_C=\frac{16}{5}\,\mathrm{kg/s}\qquad \rho_C=\frac45\,\mathrm{kg/L}`

Errori e controllo: ConQ4 L/s, densità1,3/5,2/5,6/5 kg/L produrrebberoS9,29/5,21/5,53/5. Solo4/5 dà37/5. Due differenze negative non implicano guadagno negativo: il loro rapporto è positivo.

## 16 — Una densità vincolata alla portata

Il coefficiente collega una densità a una portata volumetrica e conserva le sue unità: cQ è in kg/L. Nel prodotto ṁ=ρQ il vincolo porta ṁ=cQ². Dividendo per c si trova Q²=16 L²/s² e si considerano separatamente i due segni.

Passaggi: `\dot m=cQ^2\qquad Q^2=\dot m/c\qquad Q^2=16\,\mathrm{L^2/s^2}\qquad Q_+=4\,\mathrm{L/s}\qquad Q_-=-4\,\mathrm{L/s}`

Errori e controllo: SoloQ=4 L/s è compatibile con portata e densità positive; alloraρ=1 kg/L. La radice negativa darebbe anche densità negativa nel vincolo, esclusa. Non si è affermato che un fluido cambi densità conQ lungo lo stesso tubo: il vincolo seleziona prove diverse.
