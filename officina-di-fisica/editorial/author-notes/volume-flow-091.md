# volume-flow-091 — note dell’autore

Fonte5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U3-02.json. Tutti80 originali089–093 letti prima dell’authoring, con varianti dimensionali02 e profilo09103 separatamente. ID effettivi confermati; stesso assembler canonico courseC2/unitu3 e competenze esistenti rilette nel catalogo C2.

DRAFT; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN. Nessun verificatore o firma scientifica dell’autore. Note di calcolo per il revisore separato.

Velocità sempre media areale della componente normale, non massimo.03 profilo newtoniano parabolico con u=s²/R², corona dA=Adu e triangolo normalizzato di area1/2; derivazione manuale senza calcolatrice.16 A=cv,c2/3cm·s collega apparati, non evoluzione temporale: v²9cm²/s², due radici in blocchi separati, solo+3cm/s dà area positiva.

SVG XML e rendering nativo completo letti dall’autore. Ogni grandezza ha la propria scala esplicita; vettori su path separati con marker-end, origini e riferimenti indicati. Le formule sono scomposte con il helper law_steps esistente; nessun CSS o renderer modificato.

## 01 — Sei centimetri cubi in un secondo

Per una velocità uniforme, in un secondo attraversa il piano una colonna lunga 3 cm: moltiplicata per 2 cm² dà 6 cm³. Se il profilo non è uniforme, la definizione di media areale rende ancora valida Q=Av: non occorre supporre tutte le particelle ugualmente veloci.

Passaggi: `Q=A v\qquad Q=(2\,\mathrm{cm^2})(3\,\mathrm{cm/s})\qquad Q=6\,\mathrm{cm^3/s}`

Errori e controllo: Il prodotto ha tre potenze di lunghezza per tempo, non velocità né area. Un valore 3 copierebbe v e 2 copierebbe A. In un secondo transita esattamente 6 cm³, pari a 6 mL.

## 02 — Un volume per unità di tempo

La portata conta il volume transitato, non la lunghezza percorsa da una singola particella. Area per velocità fornisce L²·L/T=L³/T. Il centimetro cubo coincide con il millilitro, perciò cm³/s e mL/s esprimono la stessa dimensione e scala.

Passaggi: `[Q]=L^3/T\qquad \mathrm{cm^2}\cdot\mathrm{cm/s}=\mathrm{cm^3/s}\qquad 1\,\mathrm{cm^3}=1\,\mathrm{mL}`

Errori e controllo: cm/s è velocità, cm²/s ha una potenza di lunghezza in meno, cm³ è volume senza tempo e kg/s è portata massica. Quest’ultima richiederebbe anche la densità.

## 03 — Il massimo sull’asse non è la media

La velocità massima riguarda soltanto l’asse, mentre vicino alla parete tende a zero. Per mediare correttamente pesiamo ogni corona con la sua area. Ponendo u=s²/R², una frazione du dell’area totale porta velocità v_max(1−u). Il grafico in u è un segmento e l’area sottesa è un triangolo di area 1/2: la media è v_max/2.

Passaggi: `u=s^2/R^2\qquad dA=A\,du\qquad \int_0^1(1-u)\,du=\frac12\qquad \overline v=v_{max}/2\qquad Q=A v_{max}/2`

Errori e controllo: Usare A v_max attribuirebbe a tutta la sezione la velocità del solo asse e raddoppierebbe Q. Il quarto non è la media areale di questo profilo; zero è la velocità alla sola parete, non quella di tutto il fluido. Il risultato dipende dal profilo parabolico dichiarato.

## 04 — Area maggiore con velocità mantenuta

A velocità media fissata, ogni centimetro quadrato trasporta lo stesso volume per secondo. Aumentare l’area di un fattore 3/2 porta quindi Q da 6 a 9 cm³/s. Non è il confronto fra due sezioni dello stesso tubo con Q già imposta: qui v è il dato controllato in prove diverse.

Passaggi: `Q_A=2\cdot3\,\mathrm{cm^3/s}=6\,\mathrm{cm^3/s}\qquad Q_B=3\cdot3\,\mathrm{cm^3/s}\qquad Q_B=9\,\mathrm{cm^3/s}`

Errori e controllo: Quattro usa un effetto inverso dell’area; sei imporrebbe un vincolo di portata non dato. Dodici raddoppia invece di moltiplicare per 3/2; zero è incompatibile con area e velocità positive.

## 05 — L’area attraversata dalla portata

Dividendo il volume al secondo per la lunghezza al secondo rimane l’area del fascio che lo trasporta. A=Q/v=2 cm²; il tempo si cancella fra numeratore e denominatore.

Passaggi: `A=Q/v\qquad A=\frac{6\,\mathrm{cm^3/s}}{3\,\mathrm{cm/s}}\qquad A=2\,\mathrm{cm^2}`

Errori e controllo: Qv avrebbe dimensioni L⁴/T² e non area; v/Q sarebbe area inversa. Per ricavare un raggio servirebbe anche la forma della sezione, mentre qui basta l’area.

## 06 — La velocità media da volume e area

Ogni centimetro di avanzamento attraverso 2 cm² trasporta 2 cm³. Per trasportarne 6 ogni secondo occorrono 3 cm/s di velocità normale media. Il valore non stabilisce il massimo locale di un profilo non uniforme.

Passaggi: `v=Q/A\qquad v=\frac{6\,\mathrm{cm^3/s}}{2\,\mathrm{cm^2}}\qquad v=3\,\mathrm{cm/s}`

Errori e controllo: Il prodotto QA non ha dimensioni di velocità; l’inverso A/Q è un tempo per lunghezza. Se il profilo fosse quello parabolico del caso03, il massimo sarebbe 6 cm/s, ma tale profilo non è necessario per questa inversa.

## 07 — Accelerare la media a sezione fissa

Con la stessa sezione, le portate sono 6 e 8 cm³/s. Il loro rapporto 8/6=4/3 coincide con quello delle velocità medie perché A si cancella. Non stiamo confrontando velocità massime.

Passaggi: `Q_A=6\,\mathrm{cm^3/s}\qquad Q_B=8\,\mathrm{cm^3/s}\qquad Q_B/Q_A=\frac43`

Errori e controllo: Tre quarti inverte gli stati; due raddoppia senza dato; un terzo è il solo incremento relativo e uno ignora il cambiamento.

## 08 — Un volume al secondo raddoppiato per errore

Il prodotto Av dà 6 cm³/s. La proposta dodici include un fattore due non previsto e sovrastima di 6 cm³/s. Non si sommano automaticamente ingresso e uscita: attraversare un piano è un unico conteggio del volume.

Passaggi: `Q=6\,\mathrm{cm^3/s}\qquad e=(12-6)\,\mathrm{cm^3/s}\qquad e=6\,\mathrm{cm^3/s}`

Errori e controllo: Il segno negativo inverte l’ordine; dodici ripete il dato errato, zero lo conferma e tre dimezza la differenza. Un fattore 1/2 riguarda soltanto il passaggio da massimo a media per il profilo specifico, non questa v già media.

## 09 — Isolare l’area senza cambiare il flusso

La relazione Q=Av contiene A come fattore lineare. Dividendo entrambi i membri per v>0 si ottiene A=Q/v. Nessuna ipotesi sulla pressione è necessaria per questa identità cinematica.

Passaggi: `Q=A v\qquad Q/v=A\qquad A=Q/v`

Errori e controllo: Il prodotto Qv e il reciproco v/Q falliscono il controllo dimensionale. Doppio e metà attribuiscono una correzione di profilo a una velocità già definita come media.

## 10 — Due fattori diretti nella portata

Ogni variazione entra in un fattore del prodotto Av. Sostituendo i due dati scalati, Q_B=κ₁κ₂A_Av_A e il rapporto con Q_A elimina le grandezze iniziali. L’area è già l’area, non un raggio da elevare al quadrato.

Passaggi: `Q_B=(\kappa_1 A_A)(\kappa_2 v_A)\qquad Q_B/Q_A=\kappa_1\kappa_2`

Errori e controllo: I quozienti rendono inversa una dipendenza diretta; κ₁² conta due volte la scalatura dell’area. La somma vale due per stati identici e non può essere un rapporto che deve valere uno.

## 11 — Sezione e velocità entrambe maggiori

A trasporta 6 cm³/s e B ne trasporta 12. Le scalature 3/2 per l’area e 4/3 per la velocità si moltiplicano e si semplificano a due. Il confronto è fra portate, non fra volumi contenuti nei tubi.

Passaggi: `Q_A=6\,\mathrm{cm^3/s}\qquad Q_B=12\,\mathrm{cm^3/s}\qquad Q_B/Q_A=2`

Errori e controllo: Un mezzo inverte gli stati, 3/2 e 4/3 considerano un solo cambiamento. Dodici è il numero di Q_B in cm³/s e non il rapporto adimensionale.

## 12 — Media di due portate indipendenti

I prodotti dei due stati sono 6 e 12 cm³/s. La loro semisomma è 9 cm³/s. Si mediano risultati separati; non è stato descritto un unico tubo che cambia simultaneamente area e profilo nel tempo.

Passaggi: `\overline Q=\frac{6+12}{2}\,\mathrm{cm^3/s}\qquad \overline Q=9\,\mathrm{cm^3/s}`

Errori e controllo: Diciotto è la somma, 9/2 divide due volte e sei è solo la prima prova. Area media5/2 cm² e velocità media7/2 cm/s darebbero35/4 cm³/s, inferiore di1/4: il prodotto non commuta in generale con la media.

## 13 — La velocità necessaria per il bersaglio

La portata bersaglio è 12 cm³/s. Con sezione 3 cm² si ottiene v_B=4 cm/s, e il rapporto con 3 cm/s è 4/3. L’area maggiore realizza già una parte dell’aumento richiesto, così non occorre raddoppiare anche la velocità.

Passaggi: `Q_B=12\,\mathrm{cm^3/s}\qquad v_B=Q_B/A_B\qquad v_B=4\,\mathrm{cm/s}\qquad v_B/v_A=\frac43`

Errori e controllo: Due, insieme all’area aumentata di3/2, triplicherebbe Q. Quattro è il numero della velocità finale, non il suo rapporto; 3/4 inverte il risultato.

## 14 — La taratura di una misura di portata

Il riferimento Q_A=6 cm³/s determina q=3 s/cm³. La lettura 36 equivale a Q_B=12 cm³/s. Dividendo per v_B=4 cm/s otteniamo l’area 3 cm², che ricostruisce il prodotto richiesto.

Passaggi: `q=3\,\mathrm{s/cm^3}\qquad Q_B=12\,\mathrm{cm^3/s}\qquad A_B=Q_B/v_B\qquad A_B=3\,\mathrm{cm^2}`

Errori e controllo: Trattare 36 come portata darebbe9 cm², conservando erroneamente il guadagno. Lo strumento non misura direttamente l’area, che è ottenuta da un’inversa dopo la decodifica.

## 15 — L’area dopo due riferimenti strumentali

I riferimenti Q=6 e 12 cm³/s portano a q=(25−13)/(12−6)=2 s/cm³ e z=1. C ha portata (19−1)/2=9 cm³/s. Il rapporto con 3 cm/s dà un’area di 3 cm².

Passaggi: `q=2\,\mathrm{s/cm^3}\qquad z=1\qquad Q_C=9\,\mathrm{cm^3/s}\qquad A_C=9/3\,\mathrm{cm^2}\qquad A_C=3\,\mathrm{cm^2}`

Errori e controllo: Aree2,4,1,6 cm² a3 cm/s darebbero S13,25,7,37. Solo3 dà19. Dividere direttamente la lettura per la velocità mescolerebbe un numero strumentale con una grandezza fisica.

## 16 — Un vincolo area-velocità e due radici

Il coefficiente ha dimensioni di lunghezza per tempo, così cv è un’area. Sostituendo in Q=Av si ottiene Q=cv²: il quadrato della velocità è 9 cm²/s². I due segni algebrici v=±3 cm/s vanno considerati separatamente, ma solo quello positivo mantiene anche A positiva.

Passaggi: `Q=cv^2\qquad v^2=Q/c\qquad v^2=9\,\mathrm{cm^2/s^2}\qquad v_+=3\,\mathrm{cm/s}\qquad v_-=-3\,\mathrm{cm/s}`

Errori e controllo: La radice negativa violerebbe il verso di flusso assegnato e darebbe A<0 nel vincolo. La soluzione fisica v3 cm/s implica A2 cm² e riproduce Q6 cm³/s. Non si tratta di una dipendenza temporale A(t): il vincolo collega prove diverse.

