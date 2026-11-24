# Note d’autore — cinematica 010–012

48 nuove riscritture, tutte DRAFT. Le righe seguenti sono calcoli e scelte
dell’autore da sottoporre alla review: non costituiscono una verifica scientifica
indipendente e non assegnano PASS o firme. Approvazione umana NOT_RUN.

Sorgente: commit immutabile `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`,
`packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-01.json`.
Letti individualmente i48 sorgenti assegnati: consegna, risposta e compito cognitivo.
Nomi effettivi conformi al mandato: `u2-uniform-displacement-01..16`,
`u2-uniform-position-01..16`, `u2-mean-velocity-01..16`. I nuovi ID sono
`AR-<sourceId>` e ogni binding conserva le SHA di sorgente, candidato, provenienza
e asset effettivamente collegati alla scheda.

Il catalogo C1 corrente è stato letto: la competenza cinematica è C1-L003,
«Leggere il movimento nel tempo». I prerequisiti usano solo lezioni già esistenti;
la velocità orientata riusa anche C1-L002. L’eccezione displacement03 sul principio
di inerzia è collegata a C1-L005, «Isolare un corpo e disegnare le forze».
C6 resta collegato come riuso per la lettura dei moti. Nessuna nuova competenza
fittizia, authority o pipeline è stata introdotta.

L’helper di assembly già usato per007–009 è stato reso parametrico per unità,
percorso sorgente, lezione, prerequisiti e metadati della famiglia. I valori
default preservano esattamente tutti i byte dei precedenti pacchetti e binding U1;
il controllo di rigenerazione è stato ripetuto per tutti e sei i lotti d’autore.
L’ETL, i digest e l’importazione restano quelli canonici.

## Spostamento uniforme — uniform-displacement-010

La velocità è costante durante ogni singola prova. Il verso positivo è dichiarato;
D=vΔt è uno spostamento con segno. Gli intervalli usati nelle inverse e nei rapporti
sono positivi. La figura collega l’incremento di posizione al rettangolo nel grafico
velocità-tempo, senza imporre all’esercizio un’origine non assegnata.

| ID sorgente | Calcolo d’autore / punto da controllare |
| --- | --- |
| u2-uniform-displacement-01 | (+2m/s)(2s)=+4m; la figura sceglie x₀=0 solo per visualizzare lo spostamento. |
| u2-uniform-displacement-02 | (m/s)s=m; distingue spostamento, velocità e accelerazione. |
| u2-uniform-displacement-03 | Velocità vettoriale costante ⇒ a=0; in riferimento inerziale e per massa costante positiva F_ris=ma=0. Non equivale ad assenza di ogni singola forza. |
| u2-uniform-displacement-04 | Tempo2s fisso: D da4m a8m, fattore2; segno positivo conservato. |
| u2-uniform-displacement-05 | v=D/Δt=4m/2s=2m/s; denominatorepositivo. |
| u2-uniform-displacement-06 | Δt=D/v=4m/(2m/s)=2s; segni compatibili, v≠0. |
| u2-uniform-displacement-07 | A velocità comune D₂/D₁=Δt₂/Δt₁=4/2=2; D₁≠0. |
| u2-uniform-displacement-08 | 5m/s·(1km/1000m)·(3600s/1h)=18km/h; entrambi i fattori di unità sono espliciti, controllo inverso18·1000/3600=5. |
| u2-uniform-displacement-09 | v=D/Δt perΔt>0; valida anche perDnegativo, il segno indica il verso. |
| u2-uniform-displacement-10 | D₂/D₁=κ₁κ₂; velocità costante dentro ciascuna prova, non necessariamente uguale fra prove. |
| u2-uniform-displacement-11 | D₁=4m,D₂=16m; rapporto4. Non viene inferita accelerazione durante una prova. |
| u2-uniform-displacement-12 | Media con pesi uguali (4m+16m)/2=10m; prodotto ingressi medi3m/s·3s=9m è diverso. |
| u2-uniform-displacement-13 | 4=2(Δt₂/Δt₁) ⇒ rapporto2 e Δt₂=4s. |
| u2-uniform-displacement-14 | g=12/(4m)=3m⁻¹; D=48/g=16m; v=D/4s=4m/s. |
| u2-uniform-displacement-15 | g=(33−9)/(16m−4m)=2m⁻¹,d=1; D=(17−1)/g=8m; v=4m/s. |
| u2-uniform-displacement-16 | Vincolo dimensionalmente esplicito v=(1m/s²)Δt; D=(1m/s²)(Δt)²=4m ⇒ Δt=2s positivo. Il vincolo lega la scelta dei dati tra prove uniformi, NON definisce una velocità crescente durante la singola prova. |

## Posizione uniforme — uniform-position-011

La legge x=x₀+vt usa un’origine fissa e t≥0 contato dalla partenza della prova.
La velocità delle prove è +2m/s. Si distinguono coordinata iniziale, spostamento e
coordinata finale, con le unità dei coefficienti sempre esplicite. I rapporti fra
coordinate sono dichiarati rispetto alla medesima origine: non vengono presentati
come invarianti per traslazione dell’origine.

| ID sorgente | Calcolo d’autore / punto da controllare |
| --- | --- |
| u2-uniform-position-01 | Δx=4m, x=2m+4m=6m. Distinguere arrivo6 da spostamento4. |
| u2-uniform-position-02 | [x₀]=L e[vt]=L; la somma ha unitàm. Il segno di una coordinata non ne modifica l’unità. |
| u2-uniform-position-03 | Retta per(0s,3m),(2s,7m):x₀=3m,v=(7−3)m/(2−0)s=2m/s. Non usare7/2 ignorando l’intercetta. |
| u2-uniform-position-04 | x₀ da2m a4m, incremento4m fisso: x da6m a8m, rapporto4/3. |
| u2-uniform-position-05 | x₀=x−vt=6m−4m=2m; la positività è conseguenza dei dati, non una legge generale sulle coordinate. |
| u2-uniform-position-06 | t=(x−x₀)/v=(6−2)m/(2m/s)=2s; non dividere la sola coordinata6m perv. |
| u2-uniform-position-07 | x₁=6m,x₂=10m ⇒ rapporto5/3; quello degli spostamenti è invece8/4=2. Dipendenza dall’origine esplicitata. |
| u2-uniform-position-08 | x=6m; scarto proposto12m meno corretto6m=+6m, non uno spostamento del punto. |
| u2-uniform-position-09 | Definito u=2m/s: x₀=x−ut. Non si scrive x−2t senza dimensione del coefficiente. Nessuna divisione per t, quindi t=0 lecito. |
| u2-uniform-position-10 | Conu=2m/s rapporto=(κ₁x₀+uκ₂t)/(x₀+ut). Addendi omogenei; perx₀,t>0 è media pesata dei fattori. |
| u2-uniform-position-11 | x₁=6m,x₂=12m ⇒ rapporto2; i due addendi raddoppiano, non si moltiplicano fra loro. |
| u2-uniform-position-12 | Media(6m+12m)/2=9m. Legge lineare negli ingressi a u fissata: anche3m+u·3s=9m. |
| u2-uniform-position-13 | Obiettivo x₂=12m; t₂=(12−4)m/(2m/s)=4s; t₂/t₁=2. |
| u2-uniform-position-14 | g=18/(6m)=3m⁻¹; x=36/g=12m; x₀=12m−8m=4m. Taratura sulla coordinata, non sullo spostamento. |
| u2-uniform-position-15 | g=(25−13)/(12m−6m)=2m⁻¹,d=1; x=(17−1)/g=8m; x₀=8m−4m=4m. Offset in tacche diverso da x₀ in metri. |
| u2-uniform-position-16 | Vincolo x₀=(1m/s)t; x=(1m/s)t+(2m/s)t=(3m/s)t=6m ⇒ t=2s. Il coefficiente3m/s deriva dal vincolo fra dati, NON è la velocità del singolo moto, che resta2m/s. |

La figura tratta esplicitamente due esempi distinti: le prime due tappe hanno
x₀=2m e arrivo6m, mentre il grafico dell’ultima tappa conserva l’eccezione03 con
x₀=3m e arrivo7m. Le coordinate sull’asse spaziale usano50px/m; il grafico ha
100px/s sull’asse orizzontale e35px/m sul verticale. Non si misura la velocità
tramite l’angolo grafico senza considerare le scale degli assi.

## Velocità media — mean-velocity-012

La definizione V=Δx/Δt richiede Δt>0 e non richiede un moto uniforme. Il segno di V
è quello dello spostamento, con orientazione fissata. Distanza percorsa e modulo
dello spostamento sono separati nell’eccezione03. L’ID08 è stato riscritto con una
velocità negativa per rendere operativo il controllo del segno: conserva il
compito sorgente di diagnosi dello scarto e la risposta numerica1.

| ID sorgente | Calcolo d’autore / punto da controllare |
| --- | --- |
| u2-mean-velocity-01 | +2m/2s=+1m/s; la media non descrive il valore istantaneo in ciascun secondo. |
| u2-mean-velocity-02 | [V]=L/T, unitàm/s; media non significa numero puro né divisione per il numero delle rilevazioni. |
| u2-mean-velocity-03 | Andata+6m ritorno−6m: Δx=0, distanza12m. In4s |V|=0m/s, rapidità=3m/s, anche senza durate separate dei tratti. |
| u2-mean-velocity-04 | Stessa durata2s, spostamento da2m a4m: media da1m/s a2m/s. Non inferire raddoppio di ogni velocità istantanea. |
| u2-mean-velocity-05 | Δx=VΔt=1m/s·2s=+2m; non necessariamente uguale alla distanza in presenza di ritorni. |
| u2-mean-velocity-06 | Δt=Δx/V=2m/(1m/s)=2s; se entrambi i dati sono negativi la durata resta positiva. V=0 non consente l’inversa. |
| u2-mean-velocity-07 | A spostamento costante e durata doppia V₂/V₁=1/2. |
| u2-mean-velocity-08 | Nuovi dati espliciti x_i=+2m,x_f=0m,Δt=2s ⇒ V=−1m/s; proposta0m/s ⇒ scarto0−(−1)=+1m/s. Raggiungere la coordinatazero non implica mediazero. |
| u2-mean-velocity-09 | Δx=VΔt; identità della media sull’intervallo, non ipotesi di moto uniforme. |
| u2-mean-velocity-10 | V₂/V₁=κ₁/κ₂ nel dominio positivo dichiarato; se i fattori sono uguali la media non cambia. |
| u2-mean-velocity-11 | V₁=1m/s,V₂=6m/4s=3/2m/s; rapporto3/2. |
| u2-mean-velocity-12 | Letture indipendenti e ugualmente pesate: (1+3/2)m/s diviso2=5/4m/s. Il viaggio concatenato avrebbe invece(2+6)m/(2+4)s=4/3m/s: il diverso peso è dichiarato. |
| u2-mean-velocity-13 | Dettor=Δt₂/Δt₁: 3/2=3/r ⇒ r=2, nuova durata4s. |
| u2-mean-velocity-14 | g=3/(1m/s)=3s/m; V=(9/2)/g=3/2m/s; Δx=V·4s=6m. |
| u2-mean-velocity-15 | g=(4−3)/[(3/2−1)m/s]=2s/m,d=1; V=(5−1)/g=2m/s; Δx=V·2s=4m. |
| u2-mean-velocity-16 | Δt=τ>0,Δx=(1m/s)τ ⇒ V=1m/s perogniτ. Infinite coppie: il vincolo e la misura non forniscono due informazioni indipendenti. |

La figura di03 usa frecce di uguale lunghezza per6m di andata e6m di ritorno,
con versi opposti e scala60px/m. La media vettoriale nulla non viene confusa con
assenza di movimento o con la rapidità media nulla.

## Verifiche tecniche, riproduzione e limiti

`motion-b-010-012-structural.json` registra soltanto rigenerazione e binding,
importazione tramite l’adapter canonico e isolamento delle bozze in un SQLite
temporaneo. Per tutti i sei lotti007–012:96ID unici,16bozze create per lotto,
seconda importazione0revisioni e16invariati per lotto, nessuna nuova versione live.
I991 materiali pubblicati conservano identici byte normalizzati prima e dopo:
`99c8d805004c82ba63a19f7ad8c0825666ca813d4f15471b8df4db5657b7c9ee`.

I tre comandi authoring sono gli stessi già usati per i vettori, cambiando modulo:
`uniform_displacement_authoring`, `uniform_position_authoring`,
`mean_velocity_authoring`, con `--repo`, `--source-ref` e `--destination` espliciti.
Si usa il venv condiviso con i requisiti canonici. Nessun database utenti aperto,
nessuna modifica a registro/checkpoint, nessuna pubblicazione o push dell’autore.

Questa consegna non prova review scientifica indipendente, accessibilità reale,
uso con studenti o approvazione umana. Le note evitano di attribuire a verifiche
tecniche il valore di una firma scientifica. Le correzioni eventualmente richieste
dal reviewer dovranno rigenerare pacchetti e binding prima di congelare le prove.

Prossimi passi del coordinatore/reviewer:

1. Risolvere i48 ID in modo indipendente e controllare soprattutto i vincoli tra
   prove nei due16, il segno nell’08mean e il diverso peso delle medie nel12mean.
2. Integrare i soli commit assegnati, poi ripetere i controlli complessivi con gli
   altri autori; accettazione: ID unici, SHA esatte e import idempotente.
3. Leggere formule e figure nel consumer canonico a320px e controllare i collegamenti
   C1-L003/C1-L005; nessuna ipotesi deve sparire con il cambio di rappresentazione.
4. Mantenere DRAFT e approvazione umana NOT_RUN finché le rispettive fasi non siano
   state eseguite: la presente consegna non autorizza una promozione editoriale.
