# drop-detachment-128 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U3-05.json. Letti individualmente tutti gli 80 originali assegnati 125–129 prima della scrittura. Famiglie e ID effettivi confermati. Riletta la lezione reale C2-L010 e i suoi prerequisiti C2-L001/L002/L004. Stesso assemble_family, course C2, unit u3.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Nessun verificatore o firma scientifica dell’autore; nessuna pubblicazione. Seguono calcoli e limiti da sottoporre a un revisore distinto.

Verifica bibliografica dei concetti fisici: [OpenStax, College Physics 2e, 11.8](https://openstax.org/books/college-physics-2e/pages/11-8-cohesion-and-adhesion-in-liquids-surface-tension-and-capillary-action). Consultati il conteggio delle superfici di un film e la proiezione verticale nella capillarità. Testi, esercizi, derivazioni e SVG nuovi sono autonomi; nessuna figura o frase del libro è riprodotta. I modelli di cavità sono fisici idealizzati e non danno indicazioni cliniche.

SVG letto integralmente in XML e rendering nativo. Scale dichiarate e geometria controllata dall’autore; il rendering nativo può omettere le punte dei marker, lette separatamente in XML. Formule suddivise con law_steps. Le anteprime verificano il lettore esistente, senza modifiche a CSS, renderer o gate. Questi controlli tecnici non costituiscono una revisione scientifica indipendente.

## 01 — Il volume limite da un bilancio di forze

Convertiamo r in un millesimo di metro e γ in un cinquantesimo N/m. La forza massima è 4π per dieci alla meno cinque N. Dividendo per ρg=10⁴ N/m³ si ottengono 4π per dieci alla meno nove m³. Un µL è 10⁻⁹ m³: il volume limite è 4π µL, senza approssimare π.

Passaggi: `r=10^{-3}\,\mathrm m\qquad \gamma=\frac1{50}\,\mathrm{N/m}\qquad F_{\max}=4\pi\,10^{-5}\,\mathrm N\qquad V_{\lim}=\frac{2\pi r\gamma}{\rho g}\qquad V_{\lim}=4\pi\,\mathrm{\mu L}`

Errori e controllo: 8π raddoppia la forza assegnata come se il bordo fosse tirato da due interfacce; 2π omette il due della circonferenza. Quattro perde π e π/4 rovescia il fattore numerico. Si calcola la soglia del modello, senza assumere una goccia sferica di raggio r.

## 02 — L’unità di un volume limite

Un volume ha dimensione cubica di lunghezza. Un litro è 10⁻³ m³ e un microlitro è 10⁻⁶ litri: dunque 10⁻⁹ m³, che coincide con un millimetro cubo. La forza divisa per ρg restituisce proprio un volume.

Passaggi: `1\,\mathrm{\mu L}=10^{-9}\,\mathrm{m^3}\qquad 1\,\mathrm{\mu L}=1\,\mathrm{mm^3}\qquad [F/(\rho g)]=\mathrm{m^3}`

Errori e controllo: mm è lunghezza, mm² area, mN forza e Pa pressione. Il peso in newton non può essere usato direttamente come volume senza densità e gravità.

## 03 — Una soglia di sostegno dichiarata

Il limite è il punto in cui il peso e la forza massima prevista sono uguali. Non occorre una formula per il volume di una sfera, perché la geometria della goccia non è assegnata. La forza di interfaccia agisce lungo il contatto; la componente verticale adottata è già contenuta in F_max.

Passaggi: `\rho gV_{\lim}=2\pi r\gamma\qquad V_{\lim}=\frac{2\pi r\gamma}{\rho g}`

Errori e controllo: Raddoppiare ancora il numeratore modifica il modello. r² scambia la circonferenza con un’area e dà dimensioni errate; il reciproco è un volume inverso. Il solo 2πrγ è una forza, non il volume. La soglia non è una legge universale di ogni gocciolatore.

## 04 — Un bordo di raggio doppio

La circonferenza di contatto raddoppia e, con la stessa γ, raddoppia la forza massima prescritta. A densità invariata raddoppia anche il volume sostenuto. La legge è lineare nel raggio del bordo: non è il volume di una sfera con quel raggio.

Passaggi: `\frac{V_{\lim,B}}{V_{\lim,A}}=\frac{r_B}{r_A}=2\qquad V_{\lim,B}=8\pi\,\mathrm{\mu L}`

Errori e controllo: 16π usa un’area e 32π un volume sferico proporzionale a r³. 2π inverte la dipendenza e 4π ignora il bordo più lungo.

## 05 — Misurare il raggio del bordo

Isoliamo r dividendo il peso limite per 2πγ. I fattori π si cancellano esattamente: il rapporto fra 4π per dieci alla meno cinque N e 4π per dieci alla meno due N/m dà un millesimo di metro. Il raggio cercato è un mm.

Passaggi: `r=\frac{\rho gV_{\lim}}{2\pi\gamma}\qquad r=10^{-3}\,\mathrm m\qquad r=1\,\mathrm{mm}`

Errori e controllo: La misura è un raggio del sostegno. Ricavare un raggio equivalente di sfera dal volume risolverebbe un altro problema e richiederebbe un’ipotesi geometrica assente.

## 06 — Ricavare la tensione dal limite

Dal bilancio γ=ρgV_lim/(2πr). Peso e circonferenza contengono entrambi π, che si cancella; il risultato è 1/50 N/m. Moltiplicando per mille per passare ai millinewton si ottengono venti mN/m.

Passaggi: `\gamma=\frac{\rho gV_{\lim}}{2\pi r}\qquad \gamma=\frac1{50}\,\mathrm{N/m}\qquad \gamma=20\,\mathrm{mN/m}`

Errori e controllo: Omettere π nel denominatore lo lascerebbe erroneamente nel risultato. Dividere per un’area anziché per la circonferenza restituirebbe una pressione, non una tensione superficiale.

## 07 — Una tensione maggiore sullo stesso bordo

Il bordo e il peso per unità di volume sono invariati. Il limite cresce come γ, quindi il rapporto è venticinque ventesimi, cinque quarti. I due volumi sono 4π e 5π µL.

Passaggi: `V_{\lim,A}=4\pi\,\mathrm{\mu L}\qquad V_{\lim,B}=5\pi\,\mathrm{\mu L}\qquad \frac{V_{\lim,B}}{V_{\lim,A}}=\frac54`

Errori e controllo: Quattro quinti inverte le prove; venticinque copia la tensione nuova senza dividerla per la vecchia. Cinque mezzi introduce anche un raddoppio del bordo che qui non avviene.

## 08 — Lo scarto di una soglia sovrastimata

La soglia corretta è 4π µL. Otto π meno quattro π lascia quattro π, con segno positivo. Per un volume di 8π µL il peso sarebbe doppio della forza massima assegnata.

Passaggi: `V_{\lim}=4\pi\,\mathrm{\mu L}\qquad e=(8\pi-4\pi)\,\mathrm{\mu L}\qquad e=4\pi\,\mathrm{\mu L}`

Errori e controllo: Meno quattro π scambia l’ordine, otto π conserva la proposta e dodici π somma i volumi. Zero accetta un peso superiore al sostegno massimo del modello.

## 09 — L’inversa per un bordo circolare

Dividiamo ρgV_lim=2πrγ per 2πγ, positivo. Al numeratore c’è una forza, al denominatore una tensione in N/m: il quoziente è una lunghezza. Non si estrae alcuna radice perché il raggio del bordo entra una volta sola.

Passaggi: `r=\frac{\rho gV_{\lim}}{2\pi\gamma}\qquad [r]=\frac{\mathrm N}{\mathrm{N/m}}\qquad [r]=\mathrm m`

Errori e controllo: Scambiare numeratore e denominatore dà una lunghezza inversa. Omettere 2π perde la circonferenza; mettere V al denominatore o togliere g cambia le dimensioni e non ricostruisce il peso.

## 10 — Due fattori nella forza di sostegno

Nel limite assegnato compare il prodotto rγ. Il fattore comune 2π/(ρg) si cancella nel rapporto e rimangono i due fattori diretti κ₁κ₂. Il quadrato del raggio non compare, perché si considera la lunghezza del contatto.

Passaggi: `\frac{V_{\lim,B}}{V_{\lim,A}}=\frac{\kappa_1r_A\kappa_2\gamma_A}{r_A\gamma_A}\qquad \frac{V_{\lim,B}}{V_{\lim,A}}=\kappa_1\kappa_2`

Errori e controllo: I quozienti rendono inversa una dipendenza diretta. κ₁² segue un’area del bordo al posto della sua circonferenza; la somma darebbe due per prove identiche, invece di uno.

## 11 — Bordo più largo e tensione maggiore

Il raggio raddoppia e γ cresce di cinque quarti. Il prodotto vale cinque mezzi: il volume passa da 4π a 10π µL. π si cancella nel rapporto, che deve essere adimensionale.

Passaggi: `V_{\lim,A}=4\pi\,\mathrm{\mu L}\qquad V_{\lim,B}=10\pi\,\mathrm{\mu L}\qquad \frac{V_{\lim,B}}{V_{\lim,A}}=\frac52`

Errori e controllo: Due quinti è il reciproco; due segue solo il raggio e cinque quarti solo γ. 10π è il numero del volume finale nelle unità assegnate, non il rapporto.

## 12 — Media di due soglie ideali

I due limiti sono 4π e 10π µL. La semisomma è 7π µL. Il modello applicato agli ingressi medi r=3/2 mm e γ=45/2 mN/m darebbe invece 27π/4 µL, inferiore di π/4 µL: mediare un prodotto non equivale in generale a moltiplicare le medie.

Passaggi: `\overline V_{\lim}=\frac{4\pi+10\pi}{2}\,\mathrm{\mu L}\qquad \overline V_{\lim}=7\pi\,\mathrm{\mu L}`

Errori e controllo: 14π è la somma, 3π la semidifferenza e 10π copia B. 27π/4 è il risultato di altri ingressi, non la media delle due soglie calcolate.

## 13 — La tensione per un limite fissato

Il raddoppio del bordo fornisce già un fattore due. Per raggiungere cinque mezzi deve restare un fattore cinque quarti dalla tensione: γ_B=25 mN/m. Tutte le quantità restano positive nel modello.

Passaggi: `\frac52=2\frac{\gamma_B}{\gamma_A}\qquad \gamma_B/\gamma_A=\frac54\qquad \gamma_B=25\,\mathrm{mN/m}`

Errori e controllo: Cinque mezzi ignora il contributo del bordo; due copia il suo raddoppio e quattro quinti capovolge la compensazione. Un mezzo manterrebbe il volume uguale ad A anziché aumentarlo.

## 14 — Leggere un volume da un display

A sostiene 4π µL, quindi q=3 µL⁻¹. B corrisponde a 10π µL. L’inversa del bilancio con γ=25 mN/m restituisce r_B=2 mm; i fattori π si cancellano prima di qualsiasi operazione numerica.

Passaggi: `q=3\,\mathrm{\mu L^{-1}}\qquad V_{\lim,B}=10\pi\,\mathrm{\mu L}\qquad r_B=\frac{\rho gV_{\lim,B}}{2\pi\gamma_B}\qquad r_B=2\,\mathrm{mm}`

Errori e controllo: La lettura non è un conteggio intero di gocce e può contenere π. Il rapporto fra letture dà il rapporto dei volumi, ma per risalire al bordo occorre tener conto anche della tensione cambiata.

## 15 — Taratura affine prima del raggio

Le soglie note sono 4π e 10π µL. Dividendo 12π per 6π µL troviamo q=2 µL⁻¹, poi z=1. C corrisponde a 8π µL, doppio del limite A con la stessa γ: r_C=2 mm.

Passaggi: `q=2\,\mathrm{\mu L^{-1}}\qquad z=1\qquad V_{\lim,C}=8\pi\,\mathrm{\mu L}\qquad r_C=2\,\mathrm{mm}`

Errori e controllo: Uno riproduce A; quattro darebbe S=1+32π, un mezzo S=1+4π e cinque mezzi S=1+20π. Nessuna di queste alternative riproduce la lettura C.

## 16 — Un vincolo dimensionato fra bordo e tensione

Il vincolo rende il volume proporzionale a γ²: V_lim=2πcγ²/(ρg). L’inversa dà γ²=1/2500 N²/m². La radice positiva è 1/50 N/m, cioè venti mN/m; ne segue un bordo da un mm. La radice negativa violerebbe anche r>0.

Passaggi: `V_{\lim}=\frac{2\pi c\gamma^2}{\rho g}\qquad \gamma^2=\frac1{2500}\,\mathrm{N^2/m^2}\qquad \gamma=\frac1{50}\,\mathrm{N/m}\qquad \gamma=20\,\mathrm{mN/m}\qquad r=1\,\mathrm{mm}`

Errori e controllo: Il coefficiente c porta dimensioni lunghezza/tensione, non è un numero puro. La relazione fra prove non è una legge costitutiva del bordo; nel modello serve a rendere determinata l’inversa quadratica.
