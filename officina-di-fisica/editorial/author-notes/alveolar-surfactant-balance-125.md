# alveolar-surfactant-balance-125 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U3-05.json. Letti individualmente tutti gli 80 originali assegnati 125–129 prima della scrittura. Famiglie e ID effettivi confermati. Riletta la lezione reale C2-L010 e i suoi prerequisiti C2-L001/L002/L004. Stesso assemble_family, course C2, unit u3.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Nessun verificatore o firma scientifica dell’autore; nessuna pubblicazione. Seguono calcoli e limiti da sottoporre a un revisore distinto.

Verifica bibliografica dei concetti fisici: [OpenStax, College Physics 2e, 11.8](https://openstax.org/books/college-physics-2e/pages/11-8-cohesion-and-adhesion-in-liquids-surface-tension-and-capillary-action). Consultati il conteggio delle superfici di un film e la proiezione verticale nella capillarità. Testi, esercizi, derivazioni e SVG nuovi sono autonomi; nessuna figura o frase del libro è riprodotta. I modelli di cavità sono fisici idealizzati e non danno indicazioni cliniche.

SVG letto integralmente in XML e rendering nativo. Scale dichiarate e geometria controllata dall’autore; il rendering nativo può omettere le punte dei marker, lette separatamente in XML. Formule suddivise con law_steps. Le anteprime verificano il lettore esistente, senza modifiche a CSS, renderer o gate. Questi controlli tecnici non costituiscono una revisione scientifica indipendente.

## 01 — Una cavità più piccola alla stessa pressione

La pressione esterna comune si sottrae dai due bilanci. Uguagliare le sovrapressioni impone lo stesso rapporto tensione/raggio. Il raggio piccolo è metà del grande: anche la sua tensione deve essere metà. Quaranta diviso due dà venti mN/m.

Passaggi: `\frac{2\gamma_p}{R_p}=\frac{2\gamma_g}{R_g}\qquad \gamma_p=\gamma_g\frac{R_p}{R_g}\qquad \gamma_p=20\,\mathrm{mN/m}`

Errori e controllo: Mantenere 40 mN/m in entrambe darebbe nella cavità piccola una sovrapressione doppia. Ottanta inverte il rapporto geometrico. Il risultato riguarda la tensione richiesta a due raggi assegnati, senza dimostrare come cambi la tensione durante una perturbazione.

## 02 — L’unità della tensione di interfaccia

La definizione divide una forza per una lunghezza. Il prefisso milli riduce il newton di mille, lasciando inalterata la dimensione forza su lunghezza. Anche energia per area ha la stessa dimensione, perché un joule è un newton per metro.

Passaggi: `[\gamma]=\mathrm{N/m}\qquad \mathrm{J/m^2}=\mathrm{N/m}\qquad 1\,\mathrm{mN/m}=10^{-3}\,\mathrm{N/m}`

Errori e controllo: Pa è forza per area e misura pressione; mN è una forza, m una lunghezza e J un’energia. Il fattore di curvatura 1/R trasforma la tensione in pressione nella legge di Laplace.

## 03 — Contare l’interfaccia prima di uguagliare le pressioni

Ogni cavità ha una sola interfaccia: il salto è 2γ/R. I fattori due si cancellano nell’uguaglianza, insieme alla pressione esterna comune. Moltiplicando per R_p rimane γ_p=γ_g u. Un film sottile di sapone in aria avrebbe due interfacce e richiederebbe un conteggio diverso del salto.

Passaggi: `p_p=p_g\qquad \frac{\gamma_p}{R_p}=\frac{\gamma_g}{R_g}\qquad \gamma_p=\gamma_g u\qquad 0<\gamma_p<\gamma_g`

Errori e controllo: Dividere per u renderebbe maggiore la tensione della cavità piccola, aggravando la differenza di pressione. Il due aggiuntivo conta due volte un’interfaccia; u² scambia la curvatura con un rapporto di aree e γ_g ignora la differenza di raggi.

## 04 — Diminuire la tensione della cavità grande

Il rapporto dei raggi rimane lo stesso nelle due prove. La tensione piccola segue quindi linearmente quella grande: la metà di quaranta è venti, la metà di trenta è quindici. Il fattore fra le uscite è tre quarti.

Passaggi: `\gamma_{p,A}=20\,\mathrm{mN/m}\qquad \gamma_{p,B}=15\,\mathrm{mN/m}\qquad \gamma_{p,B}/\gamma_{p,A}=\frac34`

Errori e controllo: Trenta copia la tensione grande finale, quaranta raddoppia l’uscita iniziale e venti trascura il cambiamento. Dieci non è la metà di trenta: corrisponderebbe a un altro rapporto dei raggi.

## 05 — Risalire alla tensione della cavità grande

Il dato della cavità piccola rappresenta metà della tensione cercata. Dividiamo venti per un mezzo, cioè moltiplichiamo per due. Si ottengono quaranta mN/m e il controllo restituisce venti moltiplicando ancora per un mezzo.

Passaggi: `\gamma_g=\frac{\gamma_p}{u}\qquad \gamma_g=\frac{20}{1/2}\,\mathrm{mN/m}\qquad \gamma_g=40\,\mathrm{mN/m}`

Errori e controllo: Dieci moltiplica per u nel passaggio inverso; venti confonde le due cavità. L’inversa è lecita perché u è positivo e non nullo, e dà γ_g>γ_p come richiesto dai raggi.

## 06 — Ricostruire il rapporto dei raggi

Le tensioni sono espresse nella stessa unità, che si cancella nel rapporto. Venti su quaranta si riduce a un mezzo. È un rapporto positivo inferiore a uno, coerente con il nome cavità piccola.

Passaggi: `u=\frac{\gamma_p}{\gamma_g}\qquad u=\frac{20}{40}\qquad u=\frac12`

Errori e controllo: Due è il reciproco e contraddice R_p<R_g; un quarto eleva al quadrato un rapporto di lunghezze già ottenuto. Uno descriverebbe raggi uguali e venti conserva il numero della tensione senza normalizzarlo.

## 07 — Ridurre ulteriormente il raggio relativo

La tensione grande comune si cancella. Il rapporto delle tensioni piccole è quindi (1/3)/(1/2), pari a due terzi. Le due tensioni valgono venti e quaranta terzi mN/m; la seconda è minore.

Passaggi: `\frac{\gamma_{p,B}}{\gamma_{p,A}}=\frac{1/3}{1/2}\qquad \frac{\gamma_{p,B}}{\gamma_{p,A}}=\frac23`

Errori e controllo: Tre mezzi scambia A e B. Un terzo o un mezzo copia un singolo u, mentre uno ignora la variazione. Anche in B la tensione resta positiva, senza far tendere il raggio a zero.

## 08 — Lo scarto di una tensione troppo alta

L’uguaglianza dei salti richiede venti mN/m. La proposta quaranta supera quel valore di venti: lo scarto è positivo. Il segno si riferisce alla sottrazione fra tensioni, non al verso di una forza nello spazio.

Passaggi: `\gamma_{p,\mathrm{corretta}}=20\,\mathrm{mN/m}\qquad e=(40-20)\,\mathrm{mN/m}\qquad e=20\,\mathrm{mN/m}`

Errori e controllo: Meno venti rovescia la sottrazione, quaranta copia la proposta e zero la considera corretta. Dieci dimezza ancora lo scarto senza motivo.

## 09 — L’inversa con il rapporto esplicito

Da γ_p=γ_g u dividiamo entrambi i membri per u, strettamente positivo. Essendo u adimensionale, il risultato mantiene l’unità N/m. L’inversa deve produrre una tensione maggiore di γ_p, perché si divide per un numero minore di uno.

Passaggi: `\gamma_p=\gamma_g u\qquad \gamma_g=\frac{\gamma_p}{u}\qquad [\gamma_g]=\mathrm{N/m}`

Errori e controllo: Moltiplicare per u renderebbe la tensione ancora più piccola. u/γ_p è una tensione inversa; u² introduce una potenza assente e sottrarre u da una tensione somma dimensioni incompatibili.

## 10 — Due cambiamenti compatibili con i raggi

La tensione richiesta è il prodotto dei due ingressi. Sostituendo i fattori di B e dividendo per il prodotto di A rimane κ₁κ₂. Il vincolo su κ₂u_A mantiene la cavità designata piccola anche nella seconda prova.

Passaggi: `\gamma_{p,B}=\kappa_1\gamma_{g,A}\kappa_2u_A\qquad \frac{\gamma_{p,B}}{\gamma_{p,A}}=\kappa_1\kappa_2`

Errori e controllo: Le frazioni rendono inversa una dipendenza diretta; il quadrato di κ₂ introduce un’area estranea alla curvatura. La somma varrebbe due per prove identiche, quando il rapporto deve valere uno.

## 11 — Cambiare tensione e rapporto geometrico

In A la tensione piccola è venti mN/m. In B trenta per un terzo dà dieci mN/m. Il rapporto dieci su venti vale un mezzo. Equivalentemente si moltiplicano tre quarti, variazione di γ_g, e due terzi, variazione di u.

Passaggi: `\gamma_{p,A}=20\,\mathrm{mN/m}\qquad \gamma_{p,B}=10\,\mathrm{mN/m}\qquad \frac{\gamma_{p,B}}{\gamma_{p,A}}=\frac12`

Errori e controllo: Tre quarti segue solo γ_g e due terzi solo u; due è il reciproco del rapporto richiesto. Un quarto riduce l’uscita più del prodotto dei due fattori effettivi.

## 12 — Media di due tensioni richieste

Le uscite sono venti e dieci mN/m: la loro semisomma è quindici. Non si stanno mediando raggi durante un moto. Se si mediassero prima gli ingressi si avrebbero γ_g medio trentacinque e u medio cinque dodicesimi: il prodotto sarebbe 175/12 mN/m, diverso di 5/12 dalla media richiesta.

Passaggi: `\overline{\gamma_p}=\frac{20+10}{2}\,\mathrm{mN/m}\qquad \overline{\gamma_p}=15\,\mathrm{mN/m}`

Errori e controllo: Trenta è la somma e dieci o venti copia una sola prova. 175/12 è la risposta agli ingressi medi: un prodotto non conserva in generale la media aritmetica dei risultati.

## 13 — Compensare una diminuzione della tensione grande

Il bersaglio è dieci mN/m. Con γ_g,B=30 mN/m questo richiede u_B=1/3. Dividendo per u_A=1/2 si ottiene due terzi. Il nuovo rapporto resta nel dominio fra zero e uno.

Passaggi: `\gamma_{p,B}=10\,\mathrm{mN/m}\qquad u_B=\frac{10}{30}=\frac13\qquad u_B/u_A=\frac23`

Errori e controllo: Un mezzo segue il solo bersaglio ignorando il cambiamento di γ_g; tre quarti segue il solo ingresso noto. Un terzo è u_B stesso, non il suo rapporto con u_A; tre mezzi lo capovolge.

## 14 — Decodificare una lettura senza offset

Il riferimento ha γ_p=20 mN/m, quindi il guadagno vale tre per mN/m. La nuova lettura corrisponde a dieci mN/m nella cavità piccola. Dividere per il nuovo u, un terzo, restituisce trenta mN/m nella grande.

Passaggi: `q=3\,\mathrm{m/mN}\qquad \gamma_{p,B}=10\,\mathrm{mN/m}\qquad \gamma_{g,B}=\frac{10}{1/3}\,\mathrm{mN/m}\qquad \gamma_{g,B}=30\,\mathrm{mN/m}`

Errori e controllo: Usare S=30 come tensione piccola darebbe novanta mN/m nella grande. Una lettura dimezzata non impone γ_g dimezzata, perché cambia anche u. Il display non è un conteggio di cavità.

## 15 — Rimuovere l’offset dal display

Le tensioni piccole note sono venti e dieci mN/m. La differenza delle letture, venti, divisa per la differenza delle tensioni, dieci, dà q=2 m/mN; poi z=1. C corrisponde a quindici mN/m. Poiché u_C è un mezzo, la tensione grande è trenta mN/m.

Passaggi: `q=2\,\mathrm{m/mN}\qquad z=1\qquad \gamma_{p,C}=15\,\mathrm{mN/m}\qquad \gamma_{g,C}=30\,\mathrm{mN/m}`

Errori e controllo: Quindici è la tensione piccola, venti e quaranta riciclano un riferimento e trentuno conserva l’offset e la scala strumentale. Il rapporto fra letture grezze non elimina z.

## 16 — Un vincolo dimensionato fra le prove

Sostituire il vincolo nel bilancio dà γ_p=c u². Il rapporto fra venti e ottanta è un quarto; la radice positiva è un mezzo. Il ramo negativo non è un rapporto di raggi positivi. Risulta γ_g=40 mN/m, e la tensione piccola torna venti.

Passaggi: `\gamma_p=cu^2\qquad u^2=\frac{20}{80}=\frac14\qquad u=\frac12\qquad \gamma_g=40\,\mathrm{mN/m}`

Errori e controllo: Un quarto è u², due è il reciproco della radice e uno non riproduce la misura. c conserva l’unità di tensione perché u è adimensionale: il vincolo riguarda prove assegnate, senza costituire una legge universale di surfattante.
