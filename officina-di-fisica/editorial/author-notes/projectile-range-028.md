# Note d’autore — projectile-range-028

Letti tutti i sedici sorgenti u2-projectile-range-01..16 nel commit
5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U2-02.json. Pacchetto astra/1
e binding riusano l’assembly e il percorso parametrico esistenti, con lezioni
C1-L001..L004 già presenti. Le seguenti sono proposte d’autore, non firme né
PASS scientifici. Stato DRAFT; revisione indipendente e approvazione umana NOT_RUN.

Si conserva g=10m/s² assegnato esattamente dal sorgente, senza presentarlo come
misura esatta terrestre. Riferimento inerziale, aria assente, g verticale uniforme
e costante, aₓ=0; componenti iniziali u,w positive. La gittata è fino al primo
ritorno alla quota iniziale: T=2w/g, R=uT. Eccezione intenzionale06: il sorgente
chiede la distanza orizzontale fino all’apice, quindi tempo w/g e risultato2m,
non gittata4m. Nessuna sostituzione del compito cognitivo con l’inversa generica.

I sorgenti sono formulati con componenti indipendenti, non con modulo e angolo.
Fissare l’angolo mentre si cambia una sola componente (04,07) contraddirebbe i dati:
si dichiara il cambio di direzione invece di inventare trigonometria. Nei confronti
con entrambe le componenti scalate ugualmente la direzione è effettivamente fissa.
Non si usa V²sin(2θ)/g senza un angolo e i suoi vincoli espliciti.

| ID | Calcolo proposto / punto fisico |
| --- | --- |
| 01 | u=w2⇒T2/5s,R4/5m;2/5m è distanza al solo apice. |
| 02 | [uw/g]=(L²/T²)/(L/T²)=L, unitàm. |
| 03 | Zero futuro verticale2w/g; moto orizzontale uniformeR2uw/g. |
| 04 | u2→4,w2 costante⇒T invariato2/5s,R4/5→8/5m. Direzione cambia. |
| 05 | u=gR/(2w)=2m/s, no radice quando w è noto. |
| 06 | u4,w5,g10⇒t_apice1/2s,Δx2m, quota5/4m. Velocità totale all’apice non nulla. |
| 07 | w2→4,u2⇒T doppio,R_B/R_A2; quota massima invece quadrupla. |
| 08 | Proposta8/5 meno corretto4/5⇒+4/5m. |
| 09 | gR=2uw⇒u=gR/(2w), w non nullo. |
| 10 | R_B/R_A=κ₁κ₂; direzione uguale solo seκ₁=κ₂. |
| 11 | u,w2→4⇒R4/5→16/5m, rapporto4; direzione fissa per proporzionalità. |
| 12 | Media(4/5+16/5)/2=2m; prodotto degli ingressi medi darebbe9/5m. |
| 13 | R×4,u×2⇒w×2; w_B4m/s. |
| 14 | c=(12/5)/(4/5m)=3m⁻¹; S48/5⇒R16/5m;w4⇒u4m/s. |
| 15 | R_A4/5,R_B16/5m; c2m⁻¹,d1;S21/5⇒R8/5m;w2⇒u4m/s. Distrattori1,2,3,8 danno S9/5,13/5,17/5,37/5. |
| 16 | u=w>0⇒w²=gR/2=4m²/s²⇒w2m/s; ramo negativo escluso. |

SVG progressivo originale collegato06: componenti su scala comune20px/(m/s),
freccia orizzontale80px e verticale100px. Traiettoria su scala comune80px/m:
origine100,550, apice260,450 (x2m,y5/4m), arrivo420,550 (x4m,y0).
Bézier M100,550 Q260,350 420,550 rappresenta esattamente y=5t−5t² con x=4t,
t∈[0,1s]. Linea temporale80..480 con400px/s, apice280 e ritorno480.
Ogni durata è riferita al medesimo t0 al lancio; etichette di quota sotto la
linea di riferimento, frecce separate per le componenti. Nessun angolo inferito
dal disegno sostituisce un dato. La curva non prosegue sotto il livello d’arrivo.
