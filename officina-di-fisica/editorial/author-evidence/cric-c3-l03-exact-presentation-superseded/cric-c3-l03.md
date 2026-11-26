# cric-c3-l03

Dieci problemi Cric distinti; nessuna espansione in varianti. Fonte immutabile `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C3.json`. ID, famiglia, difficoltà e metadati protetti originali conservati; versione nuova = originale + 1, baseVersion originale.

Competenza e prerequisiti riletti nella lezione reale del medesimo pin. Assembler canonico unico, dipendenza esterna congelata 23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5; nessun secondo ETL.

Doppia assembly byte-identica e importatore canonico su SQLite temporaneo: 10 salvati, ripetizione 0/10, dieci live originali e 991 pubblicati/storico invariati. Immagine SVG-only completa letta dopo processo reale exit 0; non è un collaudo del prodotto. Review scientifica propria, approvazione umana e UI prodotto NOT_RUN; pubblicazione NONE.

## C3-Q021

Compito: Un blocchetto di 200 g assorbe 540 J e si scalda di 6,0 K senza cambiare fase. Il calore specifico è costante nell’intervallo. Calcolalo in J/(kg·K).

Procedimento: La massa va espressa in chilogrammi: 200 g=0,200 kg. Dalla legge Q=mcΔT ottengo c=Q/(mΔT). Il denominatore vale 0,200·6=1,2 kg·K; 540/1,2=450 J/(kg·K). La capacità del campione intero sarebbe invece 90 J/K.

Passaggi esatti: `m=0{,}200\,\mathrm{kg}\qquad c=\frac{Q}{m\Delta T}\qquad c=\frac{540}{1{,}2}\,\mathrm{J/(kg\,K)}\qquad c=450\,\mathrm{J/(kg\,K)}`.

Distrattori: 90 J/K descrive Q/ΔT, cioè la capacità totale, non quella per chilogrammo. Inserire 200 come massa in kg darebbe 0,45 e perderebbe il fattore mille. Moltiplicare per ΔT anziché dividerlo non isola c.

Aiuto: Converti prima i grammi in chilogrammi e distingui C da c.

Famiglia: `estrarre-il-calore-specifico`; difficoltà 1; versione 2/base 1.

## C3-Q022

Compito: Due campioni ricevono la stessa potenza termica costante, senza perdite né cambiamenti di fase; ciascuno ha capacità termica costante. Nel grafico T contro t la retta di A sale più rapidamente. Quale grandezza è minore in A?

Procedimento: In un intervallo Δt entra Q=PΔt, mentre Q=CΔT. La pendenza è quindi ΔT/Δt=P/C. Con la stessa potenza, una pendenza maggiore indica una capacità totale minore. Non si può separare C=mc in massa e calore specifico senza ulteriori dati.

Passaggi esatti: `\frac{\Delta T}{\Delta t}=\frac PC\qquad \left(\frac{\Delta T}{\Delta t}\right)_A>\left(\frac{\Delta T}{\Delta t}\right)_B\qquad C_A<C_B`.

Distrattori: Una massa minore o un calore specifico minore possono contribuire a C minore, ma nessuno dei due è deducibile da solo. La potenza è già uguale per ipotesi. Una pendenza maggiore non determina l’ordine delle temperature senza conoscere anche i valori iniziali.

Aiuto: Esprimi la pendenza con la potenza comune e la capacità del campione.

Famiglia: `confrontare-pendenze-di-riscaldamento`; difficoltà 2; versione 2/base 1.

## C3-Q023

Compito: La capacità termica C di un campione, in J/K, viene divisa per la massa m in kg. Quale proprietà del materiale si ottiene?

Procedimento: La capacità termica totale misura il calore necessario per variare di un kelvin la temperatura del campione nel percorso assegnato. Dividendo per la massa si ottiene il calore specifico c, con unità J/(kg·K). Per un gas va anche dichiarato il vincolo, per esempio volume o pressione costante.

Passaggi esatti: `c=\frac Cm\qquad [c]=\mathrm{J/(kg\,K)}`.

Distrattori: Il calore latente specifico ha unità J/kg e riguarda un cambiamento di fase. La conducibilità ha unità W/(m·K), la densità kg/m³ e la potenza W. Le unità separano queste proprietà.

Aiuto: Dividi anche le unità di C per quelle della massa.

Famiglia: `come-si-chiama-c-diviso-m`; difficoltà 1; versione 2/base 1.

## C3-Q024

Compito: Un metallo con capacità termica costante C=75 J/K si raffredda da 48 a 32 °C senza cambiare fase. Esprimi in joule il calore Q del metallo, positivo se entra.

Procedimento: La variazione finale meno iniziale è 32−48=−16 K. Moltiplicando per C ottengo Q=75·(−16)=−1200 J. Il segno indica calore uscente dal metallo. Il modulo dell’energia ceduta è 1200 J, ma non è il Q con segno richiesto.

Passaggi esatti: `\Delta T=-16\,\mathrm K\qquad Q=C\Delta T\qquad Q=-1200\,\mathrm J`.

Distrattori: 1200 J cambia la convenzione usando il modulo. 16 è il solo valore numerico dell’intervallo termico, non un calore. Aggiungere 273,15 alle differenze non serve: l’offset si cancella.

Aiuto: Mantieni il segno di temperatura finale meno iniziale.

Famiglia: `energia-ceduta-da-una-massa-calda`; difficoltà 1; versione 2/base 1.

## C3-Q025

Compito: Un campione a 70 °C viene immerso in acqua con capacità totale 300 J/K a 20 °C. In isolamento si raggiungono 30 °C. Non ci sono cambi di fase o lavoro apprezzabile e si trascura il recipiente. Trova la capacità costante del campione in J/K.

Procedimento: L’acqua assorbe 300·(30−20)=3000 J. Il campione cede lo stesso modulo, raffreddandosi di 70−30=40 K. La sua capacità è quindi 3000/40=75 J/K. Il risultato riguarda l’intero campione, non il suo calore specifico.

Passaggi esatti: `Q_{\rm acqua}=3000\,\mathrm J\qquad C_{\rm campione}(30-70)\,\mathrm K=-3000\,\mathrm J\qquad C_{\rm campione}=75\,\mathrm{J/K}`.

Distrattori: 300 J/K copia la capacità dell’acqua. 30 o 40 da soli sono letture o intervalli, non capacità. Sommare i moduli dei due calori come se entrambi entrassero violerebbe l’isolamento del sistema complessivo.

Aiuto: Prima trova il calore assorbito dall’acqua, poi il calo termico del campione.

Famiglia: `una-capacita-ignota-dal-mescolamento`; difficoltà 2; versione 2/base 1.

## C3-Q026

Compito: Si mescolano acqua calda e fredda in isolamento, senza cambi di fase e con capacità positive costanti. Un calcolo trascura il recipiente, inizialmente alla temperatura dell’acqua fredda. Includendo la sua capacità positiva, come cambia la temperatura finale reale?

Procedimento: Il recipiente parte freddo e si scalda insieme all’acqua fredda: richiede una parte dell’energia ceduta dall’acqua calda. Nel bilancio si aggiunge un termine C_r(T_f−T_c)>0. A parità degli altri dati la temperatura comune si sposta verso la lettura fredda, senza uscire dall’intervallo delle due letture iniziali.

Passaggi esatti: `C_h(T_f-T_h)+(C_c+C_r)(T_f-T_c)=0\qquad C_r>0`.

Distrattori: Il recipiente non crea energia. Trascurarlo può essere un’approssimazione, ma non rende il risultato esattamente invariato per capacità positiva. Un valore sotto il freddo o sopra il caldo contraddirebbe il bilancio con sole capacità positive e nessun altro scambio.

Aiuto: Aggiungi il recipiente al lato che deve assorbire calore.

Famiglia: `deviazione-causata-dal-recipiente`; difficoltà 2; versione 2/base 1.

## C3-Q027

Compito: Una mole dello stesso gas perfetto viene scaldata di 15 K, una volta a pressione costante e una a volume costante. Nei due percorsi agisce solo lavoro di espansione. Di quanti joule il calore isobaro supera quello isocoro? Usa R=8,314 J/(mol·K).

Procedimento: Per il gas perfetto C_p−C_V=R per mole. La differenza dei calori per lo stesso incremento termico è quindi nRΔT. Con una mole e 15 K calcolo 8,314·15=8,314·(10+5)=83,14+41,57=124,71 J. È il contributo aggiuntivo legato al lavoro di espansione isobaro.

Passaggi esatti: `Q_p-Q_V=nR\Delta T\qquad Q_p-Q_V=124{,}71\,\mathrm J`.

Distrattori: La differenza non è zero: i due vincoli richiedono calori diversi per lo stesso aumento di energia interna. Il solo 8,314 copia il valore numerico di R senza moltiplicare per n e ΔT. Il risultato non richiede di assumere che il gas sia monoatomico.

Aiuto: Sottrai prima le due leggi e usa la differenza delle capacità molari.

Famiglia: `quanto-conta-il-vincolo-del-pistone`; difficoltà 2; versione 2/base 1.

## C3-Q028

Compito: Un gas perfetto chiuso scambia calore e può compiere soltanto lavoro pV, senza altre forme di lavoro. Quale grandezza deve restare costante per scrivere Q=nC_VΔT, con C_V costante nell’intervallo?

Procedimento: Il pedice V si riferisce al volume costante. Se la parete non si sposta il lavoro pV è nullo e il calore coincide con la variazione di energia interna, nC_VΔT. Sono state escluse altre forme di lavoro: un albero motore potrebbe trasferire energia anche in un recipiente rigido.

Passaggi esatti: `V=\text{costante}\qquad W_{pV}=0\qquad Q=nC_V\Delta T`.

Distrattori: A pressione costante il calore sarebbe nC_pΔT nelle stesse ipotesi. Temperatura costante rende ΔT nullo ma non definisce la misura di C_V. Il prodotto pV costante descrive invece un’isoterma del gas perfetto chiuso.

Aiuto: Interpreta il pedice V e controlla se il confine può compiere lavoro.

Famiglia: `vincolo-per-misurare-cv`; difficoltà 1; versione 2/base 1.

## C3-Q029

Compito: Due corpi a 15 e 45 °C sono isolati insieme e scambiano soltanto calore. Non cambiano fase e hanno capacità termiche positive. Un calcolo propone 51 °C come temperatura comune finale. Qual è la verifica più immediata?

Procedimento: Con capacità positive la temperatura comune è una media pesata delle temperature iniziali. Può avvicinarsi al valore del corpo con capacità maggiore, ma non superare il massimo né scendere sotto il minimo. Perciò 51 °C è escluso già prima di rifare i conti.

Passaggi esatti: `15\,{}^\circ\mathrm C<T_f<45\,{}^\circ\mathrm C`.

Distrattori: La massa maggiore può cambiare il peso della media, non spostarla fuori dall’intervallo. Convertire entrambe le letture in kelvin mantiene lo stesso ordinamento. Sommare le temperature non conserva l’energia dei due corpi.

Aiuto: Controlla prima i limiti fisici della media pesata.

Famiglia: `una-temperatura-finale-impossibile`; difficoltà 1; versione 2/base 1.

## C3-Q030

Compito: Una resistenza trasferisce 500 J a un campione con capacità termica costante 80 J/K. Il campione si scalda di 5 K senza cambiare fase né compiere lavoro apprezzabile. Quanta energia è passata all’esterno, come modulo in joule?

Procedimento: L’aumento energetico del campione è CΔT=80·5=400 J. Dei 500 J trasferiti dalla resistenza, 400 restano nel campione e 100 passano all’esterno. Il modulo della perdita è 500−400=100 J.

Passaggi esatti: `\Delta U=400\,\mathrm J\qquad E_{\rm perdita}=500\,\mathrm J-400\,\mathrm J\qquad E_{\rm perdita}=100\,\mathrm J`.

Distrattori: 400 J è l’energia rimasta, non la perdita. 500 J è l’intero ingresso. Un valore negativo sarebbe incompatibile con il modulo richiesto e con il bilancio dato. La capacità totale non va moltiplicata ancora per una massa.

Aiuto: Confronta l’energia fornita con quella necessaria per l’aumento di temperatura misurato.

Famiglia: `energia-dispersa-durante-la-misura`; difficoltà 2; versione 2/base 1.
