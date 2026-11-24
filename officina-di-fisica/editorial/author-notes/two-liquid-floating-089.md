# two-liquid-floating-089 — note dell’autore

Fonte Git5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U3-02.json. Tutti80 sorgenti089–093 letti individualmente prima della scrittura; le ipotesi comuni sono state confrontate e la variante09103 letta separatamente. ID effettivi u3-two-liquid-floating-01..16 confermati. Assembler canonico, courseC2/unitu3; riferimenti C2-L001/L002/L004 esistenti riletti.

DRAFT; revisione scientifica indipendente NOT_RUN; approvazione umana NOT_RUN. Queste sono note di calcolo dell’autore, non firme o PASS scientifici. Nessuna pubblicazione.

Densità assegnate allo stato termodinamico mantenuto, liquidi immiscibili con strato inferiore più denso, corpo libero interamente sommerso fra i due liquidi; nessun contatto o tensione interfacciale. Il caso16 richiedeρ_b>1kg/L e restituisce3/2. Nessun coefficiente puramente numerico sostituisce una densità:ρ_t mantiene unitàkg/L. Frazioni esatte; i campi numeric0.75/1.5 rappresentano3/4 e3/2 senza approssimazione.

SVG XML e rendering nativo completo letti: corpo prismatico160px, porzioni120/40px; frecce separate75/75/150px a20px/N; barre150+50px a200px/L. Le scale di volume e forza sono distinte. Le punte sono riferimenti marker-end su path separati.

## 01 — Un quarto del volume nello strato denso

La parte superiore sposta già liquido e contribuisce al sostegno. Il peso ρ_cgV è equilibrato dalla somma delle spinte ρ_tg(1−f)V e ρ_bgfV. Dividendo per gV>0, il problema dipende soltanto dalle densità e non dalla dimensione del corpo.

Passaggi: `\rho_c=\rho_t(1-f)+\rho_bf\qquad f=\frac{\rho_c-\rho_t}{\rho_b-\rho_t}\qquad f=\frac{3/4-1/2}{3/2-1/2}\qquad f=\frac14`

Errori e controllo: Il rapporto ρ_c/ρ_b=1/2 dimentica la spinta sul volume nello strato superiore. Tre quarti è invece la frazione superiore 1−f, non quella richiesta; quattro è il reciproco e supera il volume totale. Un terzo non soddisfa il bilancio delle densità.

## 02 — Una frazione priva di unità

f confronta due volumi misurati con la stessa unità. Litri su litri si cancellano: il risultato è un numero puro. Il vincolo geometrico lo restringe fra zero e uno, ma non gli assegna dimensioni di volume.

Passaggi: `f=V_b/V\qquad [f]=L^3/L^3=1`

Errori e controllo: L è un volume, kg/L una densità, N una forza e m² un’area. La percentuale sarebbe un’altra scala per la stessa grandezza pura: 1/4 equivale esattamente a 25%.

## 03 — Conservare entrambe le spinte

Le porzioni di volume sono fV e (1−f)V, perciò non possono essere trattate come due corpi di volume V ciascuno. L’equilibrio verticale porta a una combinazione delle densità pesata con le rispettive frazioni; sottrarre ρ_t a entrambi i membri permette di isolare f.

Passaggi: `\rho_c=\rho_t+(\rho_b-\rho_t)f\qquad \rho_c-\rho_t=(\rho_b-\rho_t)f\qquad f=\frac{\rho_c-\rho_t}{\rho_b-\rho_t}`

Errori e controllo: Il solo rapporto ρ_c/ρ_b sarebbe adatto a un fluido superiore di spinta trascurabile, non a ρ_t=1/2 kg/L. I reciproci possono superare uno; la differenza di densità da sola non è adimensionale.

## 04 — Un corpo più denso scende nell’interfaccia

A parità di liquidi, il denominatore ρ_b−ρ_t rimane 1 kg/L. Raddoppia invece l’eccesso di densità del corpo rispetto al fluido superiore: da 1/4 a 1/2 kg/L. Deve quindi raddoppiare la frazione sostenuta dal liquido denso, restando inferiore a uno.

Passaggi: `f_A=\frac{1/4}{1}=\frac14\qquad f_B=\frac{1-1/2}{1}=\frac12`

Errori e controllo: Un terzo seguirebbe il rapporto delle densità del corpo, trascurando il termine ρ_t. Uno porrebbe tutto il corpo sotto l’interfaccia benché ρ_c<ρ_b; un ottavo assegna un effetto inverso alla densità del corpo.

## 05 — Ricostruire la densità del corpo

La densità del corpo è la media delle densità dei liquidi pesata con le frazioni di volume spostato. Tre quarti del volume sono nello strato da 1/2 kg/L e un quarto in quello da 3/2 kg/L: i contributi sono 3/8 e 3/8 kg/L.

Passaggi: `\rho_c=\rho_t(1-f)+\rho_bf\qquad \rho_c=\left(\frac38+\frac38\right)\,\mathrm{kg/L}\qquad \rho_c=\frac34\,\mathrm{kg/L}`

Errori e controllo: Il risultato è strettamente compreso fra 1/2 e 3/2 kg/L, come richiede l’equilibrio all’interfaccia. Usare soltanto ρ_bf darebbe 3/8 kg/L, meno della densità superiore e incompatibile con il modello.

## 06 — La densità dello strato inferiore

La parte di sostegno che eccede quella del solo liquido superiore vale ρ_c−ρ_t=1/4 kg/L. Dividendo per f otteniamo l’eccesso della densità inferiore, pari a 1 kg/L; occorre poi riaggiungere ρ_t.

Passaggi: `\rho_b=\rho_t+\frac{\rho_c-\rho_t}{f}\qquad \rho_b=\left(\frac12+\frac{1/4}{1/4}\right)\,\mathrm{kg/L}\qquad \rho_b=\frac32\,\mathrm{kg/L}`

Errori e controllo: Dimenticare il termine ρ_t darebbe 1 kg/L: sostituendolo nel bilancio si otterrebbe ρ_c=5/8 kg/L, non 3/4. Il valore ricostruito supera la densità del corpo e mantiene stabile la stratificazione.

## 07 — Ridurre il contrasto fra i liquidi

L’eccesso di densità del corpo resta 1/4 kg/L. Il contrasto fra i due liquidi si dimezza da 1 a 1/2 kg/L, così occorre il doppio volume nello strato inferiore. Entrambi gli equilibri restano interni perché ρ_c<1 kg/L.

Passaggi: `f_A=\frac14\qquad f_B=\frac{1/4}{1/2}=\frac12\qquad f_B/f_A=2`

Errori e controllo: Un mezzo inverte il confronto; 3/2 confronta le densità inferiori senza sottrarre ρ_t; uno ignora il cambio e quattro introduce una seconda duplicazione.

## 08 — Uno scarto positivo della frazione

L’equilibrio dà f=1/4. La proposta 1/2 sovrastima il volume inferiore di un quarto del volume totale. Per controllarla basta ricostruire la densità che essa sosterrebbe: ρ_t/2+ρ_b/2=1 kg/L, più del corpo assegnato.

Passaggi: `f_{corretta}=\frac14\qquad e=\frac12-\frac14\qquad e=\frac14`

Errori e controllo: Il segno negativo invertirebbe l’ordine dello scarto. Un mezzo ripete la proposta, zero la accetta e un ottavo divide due volte la differenza. Lo scarto resta puro, come f.

## 09 — L’inversa come media pesata

Moltiplichiamo f per il contrasto di densità e aggiungiamo la densità dello strato superiore. Il risultato è equivalente alla somma ρ_t(1−f)+ρ_bf e restituisce automaticamente una densità interna all’intervallo quando 0<f<1.

Passaggi: `f(\rho_b-\rho_t)=\rho_c-\rho_t\qquad \rho_c=\rho_t+f(\rho_b-\rho_t)`

Errori e controllo: fρ_b perde il sostegno superiore; dividere per f anziché moltiplicare può superare ρ_b. L’ultima espressione ha dimensioni inverse di una densità, perciò non può rappresentare ρ_c.

## 10 — Scalature con uno sfondo non nullo

La densità superiore resta fissata e non viene moltiplicata dai fattori. Pertanto le differenze X e Y non scalano semplicemente come ρ_c e ρ_b. Scriviamo separatamente f_A=X/Y e f_B=X_B/Y_B, poi dividiamo i due risultati.

Passaggi: `f_A=X/Y\qquad f_B=X_B/Y_B\qquad \frac{f_B}{f_A}=\frac{X_BY}{Y_BX}`

Errori e controllo: κ₁/κ₂ sarebbe corretto per un semplice rapporto senza lo sfondo ρ_t. Il prodotto non segue dall’equilibrio; il rapporto scambiato è il reciproco e X_B/X segue soltanto il numeratore. Tutte le differenze utilizzate sono positive nel dominio assegnato.

## 11 — Cambiare corpo e liquido inferiore

In A la frazione è 1/4; in B l’eccesso del corpo è 1/2 kg/L e quello del liquido inferiore 3/2 kg/L, quindi f_B=1/3. Pur aumentando entrambe le densità, il contributo superiore fisso impedisce di cancellare semplicemente le loro scalature.

Passaggi: `f_A=\frac14\qquad f_B=\frac{1/2}{3/2}=\frac13\qquad \frac{f_B}{f_A}=\frac43`

Errori e controllo: Tre quarti è il reciproco; due segue soltanto l’eccesso del corpo; un terzo è f_B, non il rapporto. Uno tratterebbe erroneamente ρ_t come se scalasse con gli altri dati.

## 12 — Media di due frazioni di volume

I due equilibri danno 1/4 e 1/3. Portiamo le frazioni al denominatore comune 12, sommiamo 3/12 e 4/12 e dividiamo per due. La media richiesta è 7/24, senza fondere fisicamente i due liquidi o i due corpi.

Passaggi: `\overline f=\frac{1/4+1/3}{2}\qquad \overline f=\frac{7}{24}`

Errori e controllo: 7/12 è la somma, 7/48 divide due volte e 1/12 è la differenza. Le densità medie 7/8 e 7/4 kg/L darebbero invece (3/8)/(5/4)=3/10: differisce da 7/24 di 1/120, quindi il quoziente non commuta con la media.

## 13 — Il liquido necessario per una frazione bersaglio

Il bersaglio è f_B=1/3. Isoliamo ρ_b,B dalla media pesata: 1/2+(1−1/2)/(1/3)=2 kg/L. Il confronto con 3/2 kg/L produce 4/3; la nuova densità supera quella del corpo.

Passaggi: `f_B=\frac13\qquad \rho_{b,B}=\left(\frac12+\frac{1/2}{1/3}\right)\,\mathrm{kg/L}\qquad \rho_{b,B}=2\,\mathrm{kg/L}\qquad \rho_{b,B}/\rho_{b,A}=\frac43`

Errori e controllo: Due è il valore di ρ_b,B in kg/L, non il rapporto puro. Tre quarti lo inverte; uno conserverebbe f_B=1/2 e non 1/3. L’equilibrio interno impone ρ_b,B>1 kg/L, qui verificato.

## 14 — Tarare una frazione per misurare densità

La frazione di riferimento 1/4 determina q=3. La lettura uno significa perciò f_B=1/3, non immersione totale. Con densità inferiore 2 kg/L, la media pesata restituisce ρ_c,B=1/2+(1/3)(3/2)=1 kg/L.

Passaggi: `q=\frac{3/4}{1/4}=3\qquad f_B=1/3\qquad \rho_{c,B}=\left(\frac12+\frac13\cdot\frac32\right)\,\mathrm{kg/L}\qquad \rho_{c,B}=1\,\mathrm{kg/L}`

Errori e controllo: Interpretare S=1 come f=1 confonderebbe lo strumento con il volume relativo e porterebbe alla densità del liquido inferiore. La densità corretta resta fra 1/2 e 2 kg/L.

## 15 — Togliere l’offset prima dell’equilibrio

I riferimenti f_A=1/4 e f_B=1/3 differiscono di 1/12, mentre le letture differiscono di 1/6: q=2 e z=1. La prova C ha f_C=(2−1)/2=1/2 e quindi densità 1 kg/L.

Passaggi: `q=\frac{1/6}{1/12}=2\qquad z=\frac32-2\cdot\frac14=1\qquad f_C=\frac{2-1}{2}=\frac12\qquad \rho_{c,C}=1\,\mathrm{kg/L}`

Errori e controllo: Con ρ_b=3/2 kg/L, le densità 3/4 e 5/4 darebbero S=3/2 e 5/2. 3/2 porrebbe f=1, al bordo escluso, e 2 supererebbe il liquido inferiore. Sottrarre z è necessario anche se il display è puro.

## 16 — Un vincolo che fissa il contrasto

Il vincolo non rende la misura ridondante perché ρ_t resta un valore fisso non nullo. Sostituendo ρ_c=ρ_b/2, moltiplichiamo per il denominatore positivo e raccogliamo i termini in ρ_b. L’unica soluzione è 3/2 kg/L, con ρ_c=3/4 kg/L.

Passaggi: `\frac14=\frac{\rho_b/2-\rho_t}{\rho_b-\rho_t}\qquad \rho_b-\rho_t=2\rho_b-4\rho_t\qquad \rho_b=3\rho_t\qquad \rho_b=\frac32\,\mathrm{kg/L}`

Errori e controllo: Non si può cancellare ρ_b fra differenze con un termine costante. Il dominio del vincolo richiede ρ_b>1 kg/L; 3/2 lo soddisfa e ricostruisce f=1/4. Non compare una seconda radice né una coppia nulla ammissibile.

