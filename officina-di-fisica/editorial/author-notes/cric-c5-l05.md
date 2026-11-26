# cric-c5-l05

Dieci problemi Cric distinti; nessuna espansione in varianti. Fonte immutabile `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C5.json`. ID, famiglia, difficoltà e metadati protetti originali conservati; versione nuova = originale + 1, baseVersion originale.

Competenza e prerequisiti riletti nella lezione reale del medesimo pin. Assembler canonico unico, dipendenza esterna congelata 23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5; nessun secondo ETL.

Doppia assembly byte-identica e importatore canonico su SQLite temporaneo: 10 salvati, ripetizione 0/10, dieci live originali e 991 pubblicati/storico invariati. Immagine SVG-only completa letta dopo processo reale exit 0; non è un collaudo del prodotto. Review scientifica propria, approvazione umana e UI prodotto NOT_RUN; pubblicazione NONE.

## C5-Q041

Compito: Il livello di intensità è L=10 log₁₀(I/I₀) dB e il riferimento è I₀=10⁻¹² W/m². A 50 dB quale intensità corrisponde, in microwatt al metro quadrato?

Procedimento: Divido il coefficiente del livello per dieci: log₁₀(I/I₀)=5. Significa che I/I₀=10⁵. Moltiplico 10⁵ per 10⁻¹² W/m² e ottengo 10⁻⁷ W/m². Poiché un microwatt è 10⁻⁶ W, il valore è 10⁻¹ μW/m², ossia 0,10 μW/m². Ogni passaggio usa soltanto potenze di dieci.

Passaggi esatti: `\log_{10}(I/I_0)=5\qquad I=10^{-7}\,\mathrm{W/m^2}\qquad I=\frac1{10}\,\mu\mathrm{W/m^2}`.

Distrattori: 10 μW/m² corrisponde a un rapporto 10⁷ dal riferimento e quindi a 70 dB, non 50 dB. 50 copia il coefficiente del livello senza invertire il logaritmo. Il prefisso micro moltiplica l’unità watt per 10⁻⁶.

Aiuto: Il logaritmo vale cinque: ricostruisci prima il rapporto, poi converti il prefisso.

Famiglia: `intensita-dal-livello-sonoro`; difficoltà 1; versione 3/base 2.

## C5-Q042

Compito: Nel livello L=10 log₁₀(I/I₀) dB, il riferimento I₀ è positivo. Quale intensità fisica corrisponde a L=0 dB?

Procedimento: Il logaritmo deve valere zero e 10⁰=1. Dunque I/I₀=1 e I=I₀>0. Lo zero della scala di livello è un riferimento convenzionale, non assenza di onda. Per intensità positive inferiori a I₀ il livello può essere negativo senza che sia negativa l’intensità fisica.

Passaggi esatti: `\log_{10}(I/I_0)=0\qquad I/I_0=1\qquad I=I_0`.

Distrattori: Intensità nulla non appartiene al dominio del logaritmo reale di questa formula: il livello tende a meno infinito quando I tende a zero da valori positivi. Un’intensità negativa non è ammessa nel modello del livello.

Aiuto: Quale numero positivo ha logaritmo decimale uguale a zero?

Famiglia: `il-significato-di-zero-decibel`; difficoltà 1; versione 2/base 1.

## C5-Q043

Compito: Un filtro acustico porta un’intensità positiva I_i a I_f=I_i/100. Usa ΔL=10 log₁₀(I_f/I_i) dB. Qual è la variazione finale meno iniziale, in decibel?

Procedimento: Il rapporto finale su iniziale è 1/100=10⁻². Il suo logaritmo decimale è −2; moltiplicando per dieci ottengo −20 dB. Il segno negativo corrisponde alla diminuzione dell’intensità. Non devo conoscere il livello iniziale per trovare questa differenza.

Passaggi esatti: `\frac{I_f}{I_i}=10^{-2}\qquad \Delta L=-20\,\mathrm{dB}`.

Distrattori: +20 dB inverte l’ordine del rapporto e descriverebbe un aumento di cento volte. −2 dB dimentica il fattore dieci della definizione. −100 dB non è il logaritmo del fattore cento.

Aiuto: Scrivi un centesimo come una potenza di dieci.

Famiglia: `decibel-dopo-attenuazione`; difficoltà 2; versione 2/base 1.

## C5-Q044

Compito: Due toni hanno la stessa intensità fisica positiva al ricevitore e frequenze diverse. Senza altre informazioni sull’udito dell’ascoltatore, si può dedurre che siano percepiti ugualmente forti?

Procedimento: La stessa intensità dà lo stesso livello riferito allo stesso I₀. La sensazione dipende però anche dalla frequenza e dalla risposta dell’ascoltatore. Il solo dato fisico assegnato non consente quindi di concludere uguale sensazione. Non serve negare l’uguaglianza delle intensità per riconoscere questo limite.

Passaggi esatti: `I_1=I_2\qquad L_1=L_2`.

Distrattori: Cambiare l’unità con cui si esprime I non cambia la percezione. Una frequenza maggiore non impone un’intensità fisica maggiore. Il livello di intensità non costituisce da solo una scala universale della sensazione sonora.

Aiuto: Distingui la grandezza rilevata dal microfono dalla risposta dell’orecchio.

Famiglia: `due-suoni-alla-stessa-intensita`; difficoltà 2; versione 2/base 1.

## C5-Q045

Compito: Una sorgente e un microfono sono nello stesso punto, a 51 m da una parete ferma. Il suono viaggia alla stessa velocità costante all’andata e al ritorno; l’eco arriva dopo 0,30 s, trascurando altri ritardi. Qual è la velocità in metri al secondo?

Procedimento: L’eco percorre 51 m fino alla parete e altri 51 m per ritornare al microfono. Il cammino totale è 102 m. Divido per 0,30 s e, moltiplicando numeratore e denominatore per dieci, ottengo 1020/3=340 m/s. Il controllo 340×0,30=102 m ricostruisce entrambe le tratte.

Passaggi esatti: `s_{\rm tot}=2d\qquad s_{\rm tot}=102\,\mathrm m\qquad v=340\,\mathrm{m/s}`.

Distrattori: 170 m/s divide soltanto la distanza della parete per il tempo di andata e ritorno. 680 m/s conterebbe quattro tratte uguali. Il fattore due viene dalla geometria dell’eco, non da una variazione della velocità alla riflessione.

Aiuto: Disegna separatamente la freccia di andata e quella di ritorno.

Famiglia: `velocita-del-suono-da-uneco`; difficoltà 2; versione 2/base 1.

## C5-Q046

Compito: Una sorgente sonora subsonica mantiene la frequenza emessa in aria immobile. Rispetto a un ricevitore fermo passa da un tratto radiale di avvicinamento a uno di allontanamento, con velocità radiali non nulle. Come si confrontano le frequenze ricevute con quella emessa?

Procedimento: In avvicinamento le emissioni successive partono da posizioni più vicine al ricevitore: i fronti davanti alla sorgente sono più ravvicinati e arrivano più spesso. In allontanamento i fronti arrivano più distanziati e la frequenza ricevuta è minore di quella emessa. La sorgente mantiene il suo ritmo proprio; cambia il ritmo di arrivo nel mezzo.

Passaggi esatti: `f_{\rm avv}>f_{\rm emessa}\qquad f_{\rm all}<f_{\rm emessa}`.

Distrattori: Essere fermo non impedisce al ricevitore di rilevare un Doppler dovuto alla sorgente. Variare soltanto l’intensità non descrive la diversa separazione dei fronti. Il modello dichiarato è subsonico, non il caso di fronti d’urto.

Aiuto: Conta quanti fronti raggiungono il punto fisso in un secondo.

Famiglia: `sorgente-che-supera-losservatore`; difficoltà 2; versione 2/base 1.

## C5-Q047

Compito: Una sorgente sonora resta ferma in aria immobile. Un ascoltatore si muove verso la sorgente con velocità positiva minore di quella del suono. Che cosa cambia al suo orecchio?

Procedimento: La sorgente ferma mantiene il ritmo di emissione e la distanza fra i fronti nell’aria. L’ascoltatore va incontro ai fronti e li incrocia più spesso di un ricevitore fermo. La frequenza ricevuta aumenta senza bisogno di cambiare la frequenza della sorgente o la velocità del suono rispetto al mezzo.

Passaggi esatti: `f_{\rm ricevuta}>f_{\rm emessa}`.

Distrattori: Il movimento del ricevitore non modifica automaticamente le onde già emesse nel mezzo. Non raddoppia la loro distanza e non accelera il suono rispetto all’aria. Il ritmo degli incontri può cambiare anche se il ritmo della sorgente resta invariato.

Aiuto: Immagina di camminare incontro a una successione regolare di fronti.

Famiglia: `ricevitore-in-moto`; difficoltà 2; versione 2/base 1.

## C5-Q048

Compito: Un suono monocromatico di 1,00 kHz passa normalmente dall’aria all’acqua attraverso un’interfaccia fissa e lineare. Nell’acqua la velocità assegnata è 1480 m/s. Qual è la lunghezza d’onda trasmessa?

Procedimento: L’interfaccia fissa conserva la frequenza di 1,00 kHz=1000 Hz. Nell’acqua λ=v/f=1480/1000 m=1,48 m. Il nuovo mezzo cambia la velocità e quindi la distanza fra fronti, ma non il ritmo temporale imposto dalla sorgente. La divisione per mille si esegue spostando la virgola di tre posizioni.

Passaggi esatti: `f=1000\,\mathrm{Hz}\qquad \lambda=\frac{v}{f}\qquad \lambda=1{,}48\,\mathrm m`.

Distrattori: 1480 m usa 1 Hz anziché 1 kHz. 0,00148 m conterebbe il fattore mille due volte. Invertire v/f produce un numero con dimensione inversa di una lunghezza; non è la λ richiesta.

Aiuto: Conserva la frequenza e usa la velocità del mezzo di arrivo.

Famiglia: `frequenza-oltre-uninterfaccia`; difficoltà 2; versione 2/base 1.

## C5-Q049

Compito: Come si chiama l’unità con simbolo dB usata per il livello di intensità sonora?

Procedimento: Il nome è decibel. Il livello è dieci volte il logaritmo decimale di un rapporto di intensità e si esprime in dB. L’intensità fisica si misura invece in W/m²: una grandezza e il suo livello logaritmico non hanno la stessa unità di presentazione.

Passaggi esatti: `L=10\log_{10}(I/I_0)\,\mathrm{dB}`.

Distrattori: Hertz misura frequenza, pascal pressione e joule energia. Watt al metro quadrato è l’unità di I, non il nome dell’unità del suo livello. Il rapporto nell’argomento del logaritmo deve essere adimensionale.

Aiuto: Leggi per esteso il simbolo dB.

Famiglia: `soglia-convenzionale`; difficoltà 1; versione 2/base 1.

## C5-Q050

Compito: Tre sorgenti mutuamente incoerenti producono ciascuna la stessa intensità media positiva I al microfono. I termini d’interferenza hanno media nulla. Quanto aumenta il livello rispetto a una sola? Scegli l’espressione esatta positiva, senza approssimare il logaritmo.

Procedimento: Per sorgenti incoerenti si sommano le intensità medie: I_tot=I+I+I=3I. La differenza dei livelli dipende dal rapporto 3I/I=3. È quindi 10 log₁₀(3) dB, positivo perché 3>1. Questa forma è già esatta e selezionabile: non occorre calcolare a mente le cifre decimali del logaritmo.

Passaggi esatti: `I_{\rm tot}=3I\qquad \Delta L=10\log_{10}(3)\,\mathrm{dB}`.

Distrattori: 30 dB richiederebbe un rapporto d’intensità 1000, non 3. 3 dB confonde il numero delle sorgenti con un livello. Il fattore 20 si applica a rapporti di ampiezze nelle condizioni appropriate, non al rapporto d’intensità qui assegnato. Il rapporto inverso darebbe una variazione negativa.

Aiuto: Somma prima le intensità, poi confronta il totale con quella di una sola sorgente.

Famiglia: `tre-sorgenti-incoerenti`; difficoltà 3; versione 2/base 1.
