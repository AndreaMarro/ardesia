# Energia delle onde, intensità e suono

## `SIM-C5-L04-01` · Energia e potenza di un’onda meccanica in un mezzo elastico

Confronta due onde sulla stessa corda. La densità lineare, la tensione e la frequenza sono fissate, così la velocità di propagazione e la pulsazione restano uguali. Nel modello lineare una maggiore ampiezza aumenta dello stesso fattore la velocità trasversale dei punti. L’energia associata al moto dipende dal quadrato della velocità.

$$P_{\rm media}=\tfrac12\mu v\omega^2 A^2$$

Dividi la potenza nuova per quella di riferimento. Tutti i fattori fissati si cancellano e resta il quadrato del rapporto delle ampiezze. Raddoppiando l’ampiezza ottieni un rapporto di 4. Con ampiezza 3/2 della precedente, il quadrato dà 9/4, cioè 2,25.

$$\frac{P}{P_0}=\left(\frac{A}{A_0}\right)^2$$

Se conosci il rapporto delle potenze, prendi la radice positiva per tornare al rapporto delle ampiezze. Quattro volte la potenza significano due volte l’ampiezza a parità di corda e frequenza. La lettura è un fattore adimensionale.

## `SIM-C5-L04-02` · Intensità come energia per area e tempo

Immagina un ricevitore piatto perpendicolare alla direzione dell’onda. L’intensità costante di 10 W/m² indica quanta energia passa ogni secondo per metro quadrato. Moltiplicando per l’area trovi la potenza intercettata, poi moltiplicando per il tempo trovi l’energia.

$$E=IAt$$

Se a conta i centimetri quadrati, l’area fisica vale a/10 000 m². Per 2 s, il prodotto è 20a/10 000 J, cioè 2a/1000 J. Un millijoule è un millesimo di joule. Ogni centimetro quadrato raccoglie così 2 mJ nel tempo dato.

$$E=(2a)\,\mathrm{mJ}$$

Con 4 cm² ottieni 8 mJ. Con 3 cm² ottieni 6 mJ. Se misuri 6 mJ puoi risalire a 3 cm² dividendo per la raccolta per unità di area. Il modello assume intensità uniforme sulla piccola superficie normale al fronte.

## `SIM-C5-L04-03` · Legge dell’inverso del quadrato della distanza

Disegna due sfere concentriche intorno alla sorgente puntiforme. In assenza di assorbimento e riflessioni, la stessa potenza attraversa entrambe. Poiché la sorgente è isotropa, quella potenza si distribuisce uniformemente sull’area 4πr² di ogni sfera.

$$I=\frac{P}{4\pi r^2}$$

Con P = 4π W puoi semplificare 4π subito. A 4 m rimane 1/16 W/m². Dimezza quattro volte l’unità, passando per 0,5, 0,25 e 0,125. Ottieni 0,0625 W/m². A 3 m il risultato esatto è 1/9 W/m². La divisione in colonna ripete sempre la cifra 1, perciò puoi inserire 0,1111 W/m².

$$r=\sqrt{\frac{P}{4\pi I}}$$

La relazione inversa restituisce il raggio quando la potenza è nota e l’intensità è positiva. A distanza doppia la superficie è quattro volte più grande, quindi per unità di area passa un quarto della potenza.

## `SIM-C5-L05-01` · Velocità del suono nei mezzi

Indica il tempo tra l’emissione e la ricezione sul tratto orizzontale di 150 m. La distanza è il prodotto della velocità per il tempo. I valori indicati per aria, acqua e acciaio rappresentano condizioni fissate del modello. Confronta il tragitto di sola andata.

$$t=\frac{L}{v}$$

Nell’acciaio, dividi 150 per 5000: ottieni 3/100 s. Moltiplica per 1000 per ottenere 30 ms. In aria, moltiplica prima 150 per 1000 e dividi per 340, cioè 7500/17 ms dopo la semplificazione. Poiché 17 per 441 fa 7497, il risultato è 441 ms più 3/17 ms. Dividi 30 per 17 e ottieni la prima cifra 1 con resto 13. Poi dividi 130 per 17 e ottieni 7. A un decimale puoi scrivere 441,2 ms.

$$v=\frac{L}{t}$$

Per ricavare la velocità da 30 ms, converti in 3/100 s e dividi 150 m per 3/100 s. Ritrovi 5000 m/s. Un’eco che percorra lo stesso tratto al ritorno impiegherebbe due volte il tempo di andata.

## `SIM-C5-L05-02` · Intensità, percezione e livello sonoro in decibel

Il livello confronta l’intensità I con un’intensità di riferimento. Entrambe hanno le stesse unità, così il rapporto è un numero puro. Nel banco il rapporto è già scritto come una potenza di dieci. Il logaritmo in base dieci restituisce l’esponente.

$$L=10\log_{10}\left(\frac{I}{I_0}\right)=10n$$

Con esponente 6 moltiplica 10 per 6 e ottieni 60 dB. Con esponente 4 ottieni 40 dB. In senso inverso, da 40 dB ricavi n = 4 dividendo per 10. Il rapporto di intensità vale quindi diecimila.

$$\frac{I}{I_0}=10^{L/10}$$

Un aumento di 10 dB moltiplica per dieci l’intensità, dato che corrisponde a un esponente maggiore di uno. Il livello è una misura fisica. La percezione dipende anche dalla frequenza e dall’ascoltatore.

## `SIM-C5-L05-03` · Effetto Doppler qualitativo

Segna due posizioni consecutive della sorgente quando emette le creste. Nel periodo T₀ la prima cresta avanza di vT₀. La sorgente si è spostata di uT₀ verso il ricevitore, dove u ha segno positivo in avvicinamento. La nuova distanza tra le creste è quindi (v−u)T₀. Il ricevitore fermo nel mezzo riceve le creste alla velocità v.

$$f_{\rm ric}=f_0\,\frac{v}{v-u}$$

Con v = 300 m/s e u = +30 m/s il rapporto è 300/270 = 10/9. Moltiplicando per 300 Hz ottieni 1000/3 Hz. La divisione dà 333 con resto uno, quindi 333,3 Hz è una lettura decimale. Con u = −20 m/s il denominatore diventa 320 m/s. Semplifica 90 000 diviso 320 a 9000/32. Dividi sopra e sotto per 8 e ottieni 1125/4 Hz, cioè 281,25 Hz esatti.

$$u=v\left(1-\frac{f_0}{f_{\rm ric}}\right)$$

In senso inverso puoi dedurre la velocità con segno dal rapporto tra frequenza emessa e ricevuta. Quando la sorgente si allontana, le creste arrivano più distanziate e la frequenza scende sotto 300 Hz. Il modello usa una sorgente subsonica e un ricevitore fermo rispetto al mezzo.

## Edizione originale del Doppler

Il secondo compito pubblicato usa −5 m/s. Si ottiene 90 000/305 = 18 000/61 Hz. Poiché 61 per 295 dà 17 995, rimane 5/61 Hz. Il risultato 295,1 Hz approssima il valore. Il nuovo controllo −20 m/s conserva il confronto con l’allontanamento e porta a un decimale esatto.
