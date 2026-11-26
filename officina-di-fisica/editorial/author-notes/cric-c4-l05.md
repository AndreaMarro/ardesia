# cric-c4-l05

Dieci problemi Cric distinti; nessuna espansione in varianti. Fonte immutabile `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C4.json`. ID, famiglia, difficoltà e metadati protetti originali conservati; versione nuova = originale + 1, baseVersion originale.

Competenza e prerequisiti riletti nella lezione reale del medesimo pin. Assembler canonico unico, dipendenza esterna congelata 23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5; nessun secondo ETL.

Doppia assembly byte-identica e importatore canonico su SQLite temporaneo: 10 salvati, ripetizione 0/10, dieci live originali e 991 pubblicati/storico invariati. Immagine SVG-only completa letta dopo processo reale exit 0; non è un collaudo del prodotto. Review scientifica propria, approvazione umana e UI prodotto NOT_RUN; pubblicazione NONE.

## C4-Q041

Compito: Una corrente vale +3 mA per 4 s e poi +1 mA per altri 6 s, sempre nello stesso verso positivo. Quanti mC attraversano complessivamente la sezione?

Procedimento: Per una corrente costante in ciascun tratto, la carica è corrente per durata. Il primo intervallo trasferisce 3×4=12 mC e il secondo 1×6=6 mC, perché mA·s=mC. I due contributi hanno lo stesso segno e si sommano: totale +18 mC. Nel grafico I(t) è la somma delle due aree rettangolari.

Passaggi esatti: `\Delta q=I_1\Delta t_1+I_2\Delta t_2\qquad \Delta q=18\,\mathrm{mC}`.

Distrattori: 12 mC considera soltanto il primo intervallo; 6 mC soltanto il secondo. 40 mC userebbe la somma delle correnti per la durata complessiva come se entrambe scorressero contemporaneamente. Le durate sono invece successive.

Aiuto: Calcola separatamente le due cariche e poi somma con il segno.

Famiglia: `carica-dal-tracciato-di-corrente`; difficoltà 1; versione 2/base 1.

## C4-Q042

Compito: In un tratto metallico la corrente convenzionale è diretta verso destra. Qual è il verso della deriva media degli elettroni?

Procedimento: La corrente convenzionale segue il trasporto di carica positiva equivalente. Gli elettroni hanno carica negativa, quindi la loro deriva media è in verso opposto: verso sinistra. Si parla di moto medio ordinato, sovrapposto ai moti microscopici; non si afferma che ogni singolo elettrone percorra sempre una linea retta verso sinistra.

Passaggi esatti: `q_e=-e`.

Distrattori: Una deriva concorde di portatori negativi darebbe corrente convenzionale opposta a quella assegnata. L’agitazione microscopica non annulla per forza la deriva media che sostiene la corrente. Il verso verticale non è indicato dai dati.

Aiuto: Usa il segno negativo dei portatori e distingui deriva media da moto microscopico.

Famiglia: `moto-degli-elettroni-in-un-filo`; difficoltà 1; versione 2/base 1.

## C4-Q043

Compito: Quale grandezza viene mantenuta fissa da un generatore ideale di tensione ai suoi morsetti, nelle condizioni di funzionamento ammesse? Rispondi con il nome della differenza fra i due punti.

Procedimento: Il generatore ideale di tensione impone la differenza di potenziale fra i morsetti. Se cambia il carico, la corrente necessaria a rispettare quel vincolo può cambiare. Non impone perciò in generale la stessa corrente, potenza o quantità di carica trasferita per tutti i carichi.

Passaggi esatti: `V_{\rm morsetti}=V_0`.

Distrattori: Un generatore ideale di corrente avrebbe un vincolo diverso. La resistenza appartiene al carico e non è fissata dalla sola tensione. Carica e potenza dipendono anche dalla corrente e, per la carica trasferita, dalla durata.

Aiuto: Identifica il vincolo che compare nel nome del generatore.

Famiglia: `energia-per-carica-al-generatore`; difficoltà 1; versione 2/base 1.

## C4-Q044

Compito: Un segnale mantiene una corrente costante di 0,40 mA e trasferisce 8,0 μC nel verso positivo. Per quanti millisecondi dura?

Procedimento: Dalla definizione I=Δq/Δt ricavo Δt=Δq/I. Una corrente di 0,40 mA equivale a 400 μC/s, quindi il tempo è 8,0/400 s=0,020 s. Con 1000 ms in un secondo ottengo 20 ms. Controllo: (0,40 mA)(0,020 s)=0,0080 mC=8,0 μC.

Passaggi esatti: `\Delta t=\frac{\Delta q}{I}\qquad \Delta t=20\,\mathrm{ms}`.

Distrattori: 2 ms trasferirebbero 0,8 μC e 200 ms trasferirebbero 80 μC. Moltiplicare corrente e carica non darebbe un tempo. I prefissi micro e milli non possono essere trattati come uguali.

Aiuto: Porta carica e corrente a prefissi coerenti, poi dividi.

Famiglia: `durata-di-un-trasferimento`; difficoltà 2; versione 3/base 2.

## C4-Q045

Compito: In un grafico con I in ordinata e V in ascissa, due resistori ohmici a temperatura fissata danno rette per l’origine con pendenze positive diverse. Quale ha resistenza più alta?

Procedimento: Per un resistore ohmico I=V/R, quindi la pendenza del grafico I(V) è 1/R. Una pendenza minore corrisponde a resistenza maggiore. Alla stessa tensione positiva quel resistore lascia passare meno corrente. Occorre leggere gli assi: nel grafico opposto V(I) la pendenza sarebbe invece R.

Passaggi esatti: `I=V/R`.

Distrattori: La regola “maggiore pendenza, maggiore resistenza” vale per V in ordinata e I in ascissa, non per gli assi di questa domanda. Passare per l’origine non fissa il valore della pendenza. Una corrente maggiore alla stessa tensione implica resistenza minore.

Aiuto: Scrivi la legge nella forma della variabile che si trova in ordinata.

Famiglia: `confrontare-due-curve-ohmiche`; difficoltà 2; versione 2/base 1.

## C4-Q046

Compito: Un filo uniforme ha lunghezza e sezione iniziali positive, resistività positiva e invariata. Viene stirato fino a lunghezza doppia conservando il volume del materiale. Quanto vale il rapporto R_f/R_i?

Procedimento: Il volume vale Aℓ. Se la lunghezza raddoppia senza perdita di volume, la sezione si dimezza. La legge R=ρℓ/A fornisce quindi un fattore due dalla lunghezza e un altro fattore due dal reciproco della sezione. Il rapporto complessivo è quattro. È il modello ideale a resistività invariata dichiarato, non una legge per qualunque deformazione reale.

Passaggi esatti: `A_f=A_i/2\qquad \frac{R_f}{R_i}=\frac{2}{1/2}=4`.

Distrattori: Due considera soltanto la lunghezza e trascura la sezione. Un mezzo scambia la dipendenza inversa dall’area. Otto conterebbe un ulteriore fattore due non presente nei vincoli assegnati.

Aiuto: Usa prima il volume costante per ricavare come cambia la sezione.

Famiglia: `filo-stirato-a-volume-costante`; difficoltà 2; versione 2/base 1.

## C4-Q047

Compito: Quale grandezza, indicata usualmente con ρ, ha unità Ω·m nella relazione per la resistenza di un filo omogeneo?

Procedimento: La grandezza è la resistività. Nella legge R=ρℓ/A, il rapporto ℓ/A ha unità m⁻¹: per ottenere R in ohm, ρ deve avere unità ohm moltiplicato per metro, cioè Ω·m. La resistività dipende dal materiale e dalle condizioni, per esempio dalla temperatura.

Passaggi esatti: `\rho=\frac{RA}{\ell}`.

Distrattori: La resistenza ha unità Ω, la conduttanza Ω⁻¹ e la corrente A. La stessa lettera greca ρ può rappresentare una densità in altri contesti, ma qui legge e unità identificano la resistività.

Aiuto: Ricava ρ dalla legge del filo e controlla le unità.

Famiglia: `resistenza-di-un-dato-materiale`; difficoltà 1; versione 2/base 1.

## C4-Q048

Compito: Una pista uniforme lunga 0,20 m ha larghezza 2,0 mm e spessore 0,10 mm. Alla temperatura considerata la resistività è 2,0×10⁻⁸ Ω·m. Trova la resistenza fra gli estremi lungo la lunghezza.

Procedimento: L’area trasversale è larghezza per spessore: (2,0×10⁻³ m)(1,0×10⁻⁴ m)=2,0×10⁻⁷ m². Il prodotto ρℓ vale 4,0×10⁻⁹ Ω·m². Dividendo per l’area ottengo R=2,0×10⁻² Ω=0,020 Ω. L’area richiesta non è la superficie estesa della faccia della pista.

Passaggi esatti: `A=2{,}0\cdot10^{-7}\,\mathrm{m^2}\qquad R=0{,}020\,\Omega`.

Distrattori: 0,0020 Ω richiederebbe una sezione dieci volte maggiore; 0,20 Ω una dieci volte minore, a parità degli altri dati. 2,0 Ω e 20 Ω non soddisfano la sostituzione SI. Due lunghezze in millimetri formano un’area con fattore 10⁻⁶ rispetto al metro quadrato.

Aiuto: Calcola la sezione perpendicolare alla corrente, poi usa R=ρℓ/A.

Famiglia: `lama-metallica-a-sezione-rettangolare`; difficoltà 2; versione 2/base 1.

## C4-Q049

Compito: Per lo stesso componente si misurano 1 V con 1 mA e 3 V con 2 mA. Quale conclusione segue direttamente dai due dati?

Procedimento: Nel primo punto V/I=1 V/(0,001 A)=1000 Ω. Nel secondo V/I=3 V/(0,002 A)=1500 Ω. I due rapporti sono diversi: i dati non seguono un’unica legge V=RI con lo stesso R in entrambe le condizioni. Questa conclusione non identifica da sola la causa del cambiamento o l’intera curva del componente.

Passaggi esatti: `R_1=1000\,\Omega\qquad R_2=1500\,\Omega`.

Distrattori: Il rapporto fra le differenze vale 2 kΩ, ma è la pendenza della secante fra i due punti, non un valore di R che soddisfi V=RI per entrambi. Non si può dedurre dai soli dati che il componente sia un generatore o che la corrente sia nulla.

Aiuto: Calcola separatamente V/I in ciascuna misura prima di confrontarli.

Famiglia: `analizzare-un-componente-non-lineare`; difficoltà 2; versione 3/base 2.

## C4-Q050

Compito: In 5 s attraversano una sezione 12 C di carica positiva equivalente verso destra e 2 C verso sinistra. Calcola la corrente media in A scegliendo destra come verso positivo.

Procedimento: Il transito algebrico verso destra è +12 C−2 C=+10 C. Divido per l’intero intervallo di 5 s e ottengo I_media=+2 A. La media conta la carica netta orientata, non la somma dei moduli dei transiti nei due versi.

Passaggi esatti: `\Delta q=10\,\mathrm C\qquad I_{\rm medio}=2\,\mathrm A`.

Distrattori: 14/5 A somma i moduli e perde l’inversione del verso. 12/5 A ignora la carica che passa verso sinistra. −2 A userebbe il riferimento opposto a quello assegnato.

Aiuto: Attribuisci prima un segno ai due transiti, poi dividi la somma per la durata.

Famiglia: `corrente-media-con-uninversione`; difficoltà 2; versione 2/base 1.
