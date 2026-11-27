# Primaria distinta: sette attività C4 materia/circuiti

Autore delle candidate: Root. Revisore: author_vectors_b. Fonte967e45d1f25b11f4e28423527d813fa040fed8d2. Prima della lettura dei blocks candidati, del manuale Root, dei binding numerici e dei valori assessment. I task sono stati estratti dal consumer effettivo dello stesso commit filtrando soltanto prompt e unità; il contesto proviene dalla descrizione originale, controllo e consegna di trasferimento. Nessun confronto positivo è ancora dichiarato.

Disclosure: conosco già la fisica e il runtime generale C4 per altri incarichi e ho scritto annotazioni sui soli L02-03/L03-02/L03-03. Nessuno di questi sette ID è una mia correzione. Il primo estrattore ha prodotto in un raw non aperto anche la legge visibile originale; tale campo è stato eliminato dal JSON prima della lettura. Non rivendico riscoperta cieca delle leggi della fisica o dell’interpretazione già fornita dallo stimolo. Non ho aperto i sette blocks nuovi né il manuale Root.

## SIM-C4-L04-01

Il campione è metallico e si attende equilibrio elettrostatico. Una componente del campo nel materiale diversa da zero farebbe muovere le cariche libere; l’equilibrio richiede quindi E_interno=0. Le cariche superficiali si ridistribuiscono; ciò non significa campo esterno nullo né cariche legate assenti. Compito1: campo esterno2kV/m, risultato0kV/m. Compito2:8kV/m esterno, ancora0kV/m. Vale per ogni ingresso del banco0…10kV/m. Non estendere a una cavità con carica interna, né a un transitorio non terminato. Operazione manuale: classificazione del regime, senza divisioni.

## SIM-C4-L04-02

Grandi piastre, carica libera fissata, materiale lineare omogeneo con ε_r=3. D è fissato dalla carica libera e E=D/(ε₀ε_r); rispetto al campo senza dielettrico E₀ si ha E=E₀/3. Primo dato3kV/m:3/3=1kV/m. Trasferimento9kV/m:9/3=3kV/m. Il generatore è scollegato: non sostituire la condizione di tensione fissata. La riduzione non è l’annullamento proprio del conduttore, salvo E₀=0. ε_r è puro; le unità rimangono kV/m. Entrambi i calcoli sono divisioni per tre su interi.

## SIM-C4-L05-01

La corrente convenzionale stazionaria è2A=2C/s. La carica cumulata è Q=It, non I/t. Primo tempo1s:2C/s×1s=2C. Trasferimento4s:2×4=8C. La deriva degli elettroni nel metallo ha verso opposto alla corrente convenzionale, senza cambiare il modulo richiesto. Il banco usa durate positive0,5…5s; corrente e tempo devono restare costanti nel singolo intervallo descritto. Non confondere carica cumulata con corrente istantanea.

## SIM-C4-L05-02

Batteria ideale12V, resistore positivo e circuito chiuso: I=V/R. R3Ω dà12/3=4A; R6Ω dà12/6=2A. Il generatore mantiene tensione, non corrente, ai morsetti. Il dominio2…12Ω esclude cortocircuito e la singolarità R=0; nessuna resistenza interna da inventare. Per il modello ohmico la potenza assorbita è positiva, ma non è la grandezza chiesta. Unità V/Ω=A.

## SIM-C4-L05-03

Resistore4Ω a temperatura fissata, verso di riferimento del banco: I=V/4Ω. Primo dato−4V:−4/4=−1A. Trasferimento+8V:8/4=+2A. Lo zero attraversa l’origine; inversione della tensione inverte la corrente. La resistenza resta positiva e il segno viene dalla convenzione della tensione, non da una resistenza negativa. Il dominio comprende−8…8V e non introduce divisioni per V, quindi V=0 è ammesso.

## SIM-C4-L05-04

Materiale e sezione fissi, resistenza lineare2Ω/m. R=(2Ω/m)L, poi I=4V/R=(2A·m)/L. Primo L1m: R2Ω, I2A. Trasferimento L2m: R4Ω, I1A. Non usare lunghezza come se fosse direttamente resistenza numerica senza il coefficiente2Ω/m. L>0 nel dominio0,5…4m; il filo non viene stirato a volume conservato, ma si confrontano lunghezze con sezione mantenuta. I due punti assegnati richiedono soltanto moltiplicazioni e divisioni intere.

## SIM-C4-L05-05

Filo lungo2m, sezione1mm²=10⁻⁶m², temperatura invariata. Se ρ=αµΩ·m=α×10⁻⁶Ω·m, R=ρL/A=(α×10⁻⁶×2)/(10⁻⁶)Ω=2αΩ. Primo α0,2:0,4Ω=2/5Ω. Trasferimento α0,8:1,6Ω=8/5Ω. I due fattori10⁻⁶ si cancellano perché uno viene dalla resistività e l’altro dall’area; non convertire mm² in10⁻³m². Le letture sono decimali esatte a mano, non richiedono calcolatrice. Il modello non varia temperatura, lunghezza o sezione insieme al materiale.

Questa primaria sigilla14risoluzioni manuali sui soli dati e prompt. Verifica dei blocks, delle unità dei risultati, della corrispondenza coi punti serviti e del codice effettivo ancora PENDING. UI/human NOT_RUN; publicationActionNONE; credito0.
