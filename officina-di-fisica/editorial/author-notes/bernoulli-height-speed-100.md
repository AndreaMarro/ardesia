# bernoulli-height-speed-100 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U3-03.json. Tutti gli 80 originali 100–104 letti individualmente prima della scrittura, comprese le varianti 101-03 e 104-06. ID effettivi confermati. Riletti C2-L005 e C2-L006 nel catalogo; assemble_family canonico, course C2, unit u3.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Nessun verificatore o firma scientifica propria; nessuna pubblicazione. Queste sono note di calcolo dell’autore per una revisione distinta.

Si mantengono i numeri originari: h = 1 m, v = 2 m/s danno 12 kPa, e h = 2 m, v = 4 m/s danno 28 kPa. Due pressioni assolute coerenti: p_j = 100 kPa e p_s = 100 kPa + Δp; acqua liquida nel modello. Stazionarietà ideale, incomprimibilità, stessa linea di corrente, perdite e macchine assenti. Il serbatoio è grande e la velocità superficiale è trascurata esplicitamente. Il vincolo 16 ha c = 1/2 s: le radici pure 2 e −12 sono mostrate in blocchi separati, solo 2 dà quota e velocità positive. La prima anteprima 100 ha completato 48 casi ma è rimasta in teardown senza figli o socket: terminato soltanto il proprio PID 78235, exit 143. Non è una prova terminale valida. La prova allegata successiva è l’esecuzione finale completa exit 0.

SVG completo letto in XML e rendering nativo. Ogni quantità rappresentata ha scala dichiarata e riferimento esplicito. Frecce su path separati; le formule usano law_steps e blocchi brevi. Nessun CSS, renderer o gate modificato.

## 01 — Pressione per salire e per accelerare

La pressione nel serbatoio fornisce sia l’aumento di energia potenziale sia l’energia cinetica del getto. Bernoulli fra superficie e uscita dà Δp=ρgh+ρv²/2. Il primo contributo vale 10 kPa, il secondo 2 kPa: la differenza necessaria è 12 kPa e la pressione assoluta del serbatoio è 112 kPa.

Passaggi: `p_s=p_j+\rho gh+\rho v^2/2\qquad \rho gh=10\,\mathrm{kPa}\qquad \rho v^2/2=2\,\mathrm{kPa}\qquad \Delta p=12\,\mathrm{kPa}`

Errori e controllo: Due kPa basterebbero solo per la velocità alla stessa quota; dieci per la sola quota senza velocità di uscita. Ventiquattro raddoppia entrambi senza motivo. La differenza positiva non è la pressione assoluta p_s: il riferimento del getto resta 100 kPa.

## 02 — Due energie per volume, una pressione

In Bernoulli ogni termine è un’energia per unità di volume. ρgh e ρv² hanno unità kg/(m·s²), uguali a N/m² e dunque a Pa. Il prefisso kilo cambia soltanto la scala, con 1 kPa=1000 Pa.

Passaggi: `[\rho gh]=M/(LT^2)\qquad [\rho v^2]=M/(LT^2)\qquad 1\,\mathrm{Pa}=1\,\mathrm{N/m^2}`

Errori e controllo: m/s è velocità, m²/s² energia per massa, N forza e kg/m³ densità. Un termine gh da solo non è una pressione: va moltiplicato per la densità.

## 03 — Il segno dell’energia di quota

Poniamo z_s=0 e z_j=h, con l’asse verticale verso l’alto. Il fluido deve acquistare entrambi i contributi positivi: quota e velocità. Poiché alla superficie il termine cinetico è trascurato, la diminuzione della pressione statica fornisce la loro somma.

Passaggi: `p_s+\rho g\,0=p_j+\rho gh+\rho v^2/2\qquad \Delta p=\rho gh+\rho v^2/2`

Errori e controllo: Sottrarre il termine cinetico tratterebbe l’accelerazione come una fonte di energia; sottrarre la quota descriverebbe un’uscita più bassa, diversa da quella assegnata. Omettere un termine trascura una richiesta energetica esplicita.

## 04 — Un metro in più alla stessa velocità

Il contributo cinetico resta 2 kPa; quello di quota raddoppia da 10 a 20 kPa. La somma sale quindi da 12 a 22 kPa. Non raddoppia tutta la differenza perché soltanto una delle sue due parti è cambiata.

Passaggi: `\Delta p_A=(10+2)\,\mathrm{kPa}\qquad \Delta p_B=(20+2)\,\mathrm{kPa}\qquad \Delta p_B=22\,\mathrm{kPa}`

Errori e controllo: Ventiquattro scalerebbe anche la velocità, sei invertirebbe la dipendenza dalla quota e dodici ignorerebbe il dislivello nuovo. Quattordici aggiunge il solo valore cinetico invece dei 10 kPa richiesti dal metro in più.

## 05 — La quota dal bilancio residuo

Della differenza totale 12 kPa, due sono già necessari per accelerare il getto. Restano 10 kPa per la quota; dividendo per ρg=10 kPa/m si ottiene 1 m. L’inversa richiede Δp>ρv²/2, affinché il getto sia davvero più alto della superficie.

Passaggi: `h=\frac{\Delta p-\rho v^2/2}{\rho g}\qquad \Delta p-\rho v^2/2=10\,\mathrm{kPa}\qquad h=\frac{10\,\mathrm{kPa}}{10\,\mathrm{kPa/m}}\qquad h=1\,\mathrm m`

Errori e controllo: Usare Δp/(ρg) senza sottrarre il contributo cinetico darebbe 6/5 m. Aggiungerlo invece di sottrarlo darebbe 7/5 m. Il controllo 10+2=12 kPa ricostruisce il dato assegnato.

## 06 — La velocità dalla parte cinetica

La quota usa 10 kPa e lascia 2 kPa al termine ρv²/2. Moltiplichiamo per due e dividiamo per la densità: v²=4 m²/s². I segni algebrici sono ±2 m/s; la grandezza richiesta è la velocità positiva di efflusso nel verso assegnato.

Passaggi: `\rho v^2/2=2\,\mathrm{kPa}\qquad v^2=4\,\mathrm{m^2/s^2}\qquad v_+=2\,\mathrm{m/s}\qquad v_-=-2\,\mathrm{m/s}`

Errori e controllo: Quattro è il numero del quadrato, non della velocità. La radice negativa non rappresenta il verso del getto dichiarato; per v>0 è necessario Δp>ρgh. Il getto a 100 kPa ha pressione assegnata, non una pressione negativa ricavata dall’inversa.

## 07 — Raddoppiare la velocità, non la quota

Il contributo di quota resta 10 kPa. Quello cinetico quadruplica da 2 a 8 kPa perché dipende da v². Le differenze totali sono 12 e 18 kPa, e il rapporto è 18/12=3/2.

Passaggi: `\Delta p_A=12\,\mathrm{kPa}\qquad \Delta p_B=(10+8)\,\mathrm{kPa}\qquad \Delta p_B=18\,\mathrm{kPa}\qquad \Delta p_B/\Delta p_A=\frac32`

Errori e controllo: Due segue la velocità come se la pressione fosse lineare in v; quattro scala tutta la differenza col termine cinetico; due terzi inverte il rapporto e uno ignora il cambiamento.

## 08 — Una pressione differenziale doppia per errore

La differenza corretta è 10+2=12 kPa. La proposta 24 kPa supera il necessario di 12 kPa. A quota e velocità assegnate una pressione differenziale doppia non soddisfa la stessa equazione di Bernoulli senza introdurre altri termini, qui esclusi.

Passaggi: `\Delta p=12\,\mathrm{kPa}\qquad e=(24-12)\,\mathrm{kPa}\qquad e=12\,\mathrm{kPa}`

Errori e controllo: −12 scambia l’ordine dello scarto, ventiquattro ripete la proposta, zero la accetta e sei divide due volte. Non si confronta qui Δp con la pressione atmosferica: si confrontano due valori della stessa differenza p_s−p_j.

## 09 — L’inversa simbolica della quota

Togliamo dal bilancio la parte cinetica, poi dividiamo per il coefficiente positivo ρg. Il numeratore è una pressione; il denominatore una pressione per lunghezza, quindi il risultato è una quota. La disuguaglianza del prompt garantisce h>0.

Passaggi: `\rho gh=\Delta p-\rho v^2/2\qquad h=\frac{\Delta p-\rho v^2/2}{\rho g}`

Errori e controllo: Il più conterebbe l’energia cinetica due volte; ometterla darebbe una quota eccessiva. La differenza invertita diventa negativa nel dominio; moltiplicare per ρg non produce una lunghezza.

## 10 — Scalare un contributo lineare e uno quadratico

La quota entra al primo grado e la velocità al secondo. Il nuovo contributo di quota è κ₁U, quello cinetico κ₂²W. Dividiamo la loro somma per U+W, mantenendo il peso relativo dei due termini iniziali.

Passaggi: `\Delta p_A=U+W\qquad \Delta p_B=\kappa_1U+\kappa_2^2W\qquad R=\frac{\kappa_1U+\kappa_2^2W}{U+W}`

Errori e controllo: Il prodotto dei fattori non descrive una somma. Usare κ₂ anziché κ₂² perde il quadrato della velocità; il reciproco scambia gli stati e la somma dei fattori omette le pressioni che li pesano. Il rapporto vale uno per κ₁=κ₂=1.

## 11 — Quota doppia e velocità doppia

A richiede 12 kPa. B richiede 20 kPa per la quota e 8 kPa per la velocità, in totale 28 kPa. Il rapporto 28/12 si semplifica a 7/3: i due termini non hanno lo stesso fattore di crescita.

Passaggi: `\Delta p_A=12\,\mathrm{kPa}\qquad \Delta p_B=28\,\mathrm{kPa}\qquad \Delta p_B/\Delta p_A=\frac73`

Errori e controllo: Due segue soltanto la quota, quattro soltanto la parte cinetica e tre settimi inverte il confronto. Ventotto è il valore numerico della differenza B in kPa, non il rapporto puro.

## 12 — Media di due differenze di pressione

Le differenze sono 12 e 28 kPa. La loro semisomma è 20 kPa. Il termine di quota si conserva mediando h, ma quello cinetico richiede la media di v², non il quadrato della media di v.

Passaggi: `\overline{\Delta p}=\frac{12+28}{2}\,\mathrm{kPa}\qquad \overline{\Delta p}=20\,\mathrm{kPa}`

Errori e controllo: Quaranta è la somma, dieci divide ancora e sedici è la differenza. h medio3/2 m e v media3 m/s darebbero15+9/2=39/2 kPa, inferiore di1/2 kPa alla media delle uscite.

## 13 — La velocità per un bersaglio di pressione

Il bersaglio è 28 kPa. La quota B ne richiede 20 e lascia 8 kPa per l’energia cinetica. Ne segue v_B²=16 m²/s² e quindi v_B=4 m/s nel ramo positivo; il rapporto a2 m/s è due.

Passaggi: `\Delta p_B=28\,\mathrm{kPa}\qquad \rho v_B^2/2=8\,\mathrm{kPa}\qquad v_B=4\,\mathrm{m/s}\qquad v_B/v_A=2`

Errori e controllo: Quattro confonde il fattore dei quadrati con quello delle velocità;7/3 ripete il bersaglio della pressione. Un mezzo inverte il rapporto, mentre4/3 non restituisce la pressione richiesta. La parte cinetica residua è positiva.

## 14 — Tarare una differenza per trovare la quota

La pressione differenziale di riferimento è12 kPa e determina q=3 kPa⁻¹. La lettura84 equivale a28 kPa. Detratti gli8 kPa cinetici della velocità4 m/s, restano20 kPa per la quota: h_B=2 m.

Passaggi: `q=3\,\mathrm{kPa^{-1}}\qquad \Delta p_B=28\,\mathrm{kPa}\qquad \rho gh_B=20\,\mathrm{kPa}\qquad h_B=2\,\mathrm m`

Errori e controllo: Usare84 come kPa darebbe38/5 m, incorporando il guadagno nella legge fisica. La ricostruzione corretta fornisce p_s=128 kPa assoluti e p_j=100 kPa, coerenti con la differenza e col verso del bilancio.

## 15 — L’offset nella pressione ricostruita

Le pressioni di riferimento12 e28 kPa danno q=(57−25)/(28−12)=2 kPa⁻¹ e z=1. La lettura45 significa Δp_C=(45−1)/2=22 kPa. A v=2 m/s la parte cinetica vale2 kPa, quindi h_C=(22−2)/10=2 m.

Passaggi: `q=2\,\mathrm{kPa^{-1}}\qquad z=1\qquad \Delta p_C=22\,\mathrm{kPa}\qquad h_C=2\,\mathrm m`

Errori e controllo: Con v=2 m/s, quote1,3/2,5/2,3 m produrrebbero letture25,35,55,65. Solo2 m dà45. L’offset è un numero del display, mentre il termine cinetico è una pressione: si rimuovono in passaggi distinti.

## 16 — Quota vincolata alla velocità fra apparati

Il coefficiente c ha dimensione di tempo e rende cv una quota. Poniamo x=v/(1 m/s), puro: il vincolo dà h=(x/2)m. La pressione in kPa vale5x+x²/2. Eguagliandola a12 otteniamo x²+10x−24=0, che si fattorizza senza formule approssimate.

Passaggi: `x=\frac{v}{1\,\mathrm{m/s}}\qquad x^2+10x-24=0\qquad (x-2)(x+12)=0\qquad x_+=2\qquad x_-=-12`

Errori e controllo: Solo x=2 dà v=2 m/s e h=1 m, entrambi positivi. x=−12 darebbe anche quota negativa e viola il modello. La seconda radice non si elimina perché piccola o grande: si elimina per il dominio fisico. Il vincolo collega apparati, non una traiettoria h(t).
