# Revisione indipendente AI — accelerated-final-speed-014

24 novembre 2026. Revisore `/root/author_vectors_b`, distinto dall’autore
`/root/author_vectors_a` dei 16 ID qui recensiti. Lettura individuale di testi,
opzioni, formule, spiegazioni, indizi, feedback e SVG. Soluzioni ricavate senza
importare codice authoring e confrontate con i sorgenti Git e i binding.
**16/16 PASS, nessun finding residuo. DRAFT; humanApproval NOT_RUN.**

Edizione candidata: `159c3c791029cd61c7f22fa6fd34559053edd235`.
Sorgente: `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`,
`packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-01.json`.
Il verificatore rilegge da Git gli originali e controlla gli hash di ciascun record,
oltre a conservare firme statiche dell’edizione letta. Nessuna approvazione umana,
pubblicazione, prova browser o integrazione è dedotta da questa review.

| Artefatto | SHA-256 |
| --- | --- |
| Pacchetto, JSON canonico | `c6fe1806cdd67af610e89ae69f79c8c04533eda458d690a76325582b4ba6efe3` |
| Binding, JSON canonico | `560733ac76aa98c19794b04369ec63888cbe86a77ac2ab181526e7f17b10bc61` |
| SVG | `d2d3c5b08b7784f3ba31b2993109e2a8ad40056cf94ed2bffa046c03e084a241` |
| Verificatore | `b30f038f4a8d7a1a13fc104ea497b813424aaa1026f7aa93fd065795d6bbb598` |
| Contratto comune | `00211f6ea0ede79ed107463286ef85e78a0b885ce3f819d0158aae5ba4ed215a` |
| Rapporto scientifico, file | `6f2dadfc49a181dda92060c75c8be161738779b9a42880e0f2d73f83fb27c230` |
| Rapporto mutation test, file | `11e252760301fae8b0086c6c886128e35bf4628720f343a0a6c29436a131ddb2` |

## Risoluzioni e review per ID

Prefisso completo `AR-u2-accelerated-final-speed-`. In questa famiglia l’accelerazione
è davvero costante durante ciascuna prova. Integriamo dv/dτ=a con condizione iniziale
v(0)=v₀: v(t)=v₀+∫₀ᵗa dτ=v₀+at. Le ipotesi v₀>0,a=+2 m/s²,t≥0 rendono la componente
finale positiva e coincidente numericamente con il modulo; non viene applicato
un valore assoluto a componenti arbitrarie. La condizione iniziale è conservata
anche per t=0.

| ID | Chiave | Derivazione e controllo dei distrattori |
| --- | --- | --- |
| 01 | 6 m/s | Integrale di 2 m/s² per 2 s: incremento 4 m/s; iniziale 2 più incremento 4 dà finale 6. Quattro non è la finale. Nel grafico si legge un’ordinata, non un’area che avrebbe unità di spostamento. |
| 02 | m/s | (L/T²)T=L/T; velocità iniziale e incremento sono omogenei. m è lunghezza, m/s² accelerazione, kg massa e s durata: unità incompatibili con la velocità finale. |
| 03 | V=v₀+at | La soluzione dell’equazione differenziale conserva v₀. A t=0 restituisce v₀, a differenza di at e della semisomma. a/t è L/T³ e non si somma a v₀; il segno meno corrisponderebbe ad accelerazione opposta. |
| 04 | Aumenta da 6 a 8 m/s | Stesso incremento 4 m/s, iniziale 2→4: finale 6→8. Raddoppiare un solo addendo non raddoppia la somma; le alternative invariata, diminuita o nulla contraddicono il cambiamento dell’iniziale. |
| 05 | 2 m/s | v₀=V−at=6−4=2 m/s. Sommare di nuovo l’incremento darebbe iniziale 10 e predirebbe finale 14, non 6. Positività del risultato controllata. |
| 06 | 2 s | t=(V−v₀)/a=(6−2)m/s /(2m/s²)=2 s. Il target V≥v₀ è necessario per una durata futura con a>0; la semplice divisione V/a=3 s dimentica l’iniziale. |
| 07 | 5/3 | Finali 2+2·2=6 e 2+2·4=10 m/s: rapporto 10/6=5/3. Due confronta incrementi o durate; 3/5 inverte, 5/6 dimezza e 10/3 raddoppia il rapporto corretto. Le cinque opzioni numeriche sono distinte. |
| 08 | +6 m/s | Corretto 6, proposta 12: proposto meno corretto +6 m/s. −6 inverte la sottrazione; 12 ripete la proposta; 5 e 7 non sono la differenza. Il rapporto 2 e l’accelerazione media sarebbero altre grandezze. |
| 09 | v₀=V−at | Sottrarre lo stesso addendo sui due membri. Il dominio v₀>0 impone V>at. V/(at) è adimensionale e non una velocità; dividere per 2 è ingiustificato; at−V cambia segno e la somma applica l’incremento due volte. |
| 10 | (κ₁v₀+aκ₂t)/(v₀+at) | Trasformare separatamente i due addendi conservando a; denominatore positivo. Il rapporto è una media pesata dei fattori. Con κ₁=κ₂=κ si ottiene κ, non κ² o 2κ; il segno meno altera il moto e il denominatore doppio dimezza il confronto. |
| 11 | 2 | Nella seconda prova raddoppiano entrambi gli addendi: 6→12 m/s. Rapporto 2; moltiplicare due raddoppi come se gli ingressi fossero fattori darebbe 4, sbagliando struttura della legge. |
| 12 | 9 m/s | Media con uguale peso dei due finali 6 e 12: 18/2=9. Diciotto omette la divisione, nove mezzi la ripete; otto e dieci non sono la semisomma. Non si tratta della media temporale durante un moto. A comune rende qui equivalente il calcolo sugli ingressi medi 3+2·3=9. |
| 13 | 2 | Obiettivo finale 12 m/s; nuova iniziale 4: incremento richiesto 8 m/s, durata 8/(2m/s²)=4 s. Rapporto con 2 s iniziali 2. La durata futura è ammessa; non si generalizza l’uguaglianza fra fattore del tempo e fattore della finale. |
| 14 | 4 m/s | Riferimento finale 6, g=18/(6m/s)=3 s/m. Lettura 36 dà finale 12 m/s; togliere incremento 8 dà iniziale 4. Controllo completo 3 s/m·[4m/s+(2m/s²)(4s)]=36. Tacche e velocità non vengono scambiate. |
| 15 | 4 m/s | Riferimenti finali 6,12: g=(25−13)/(12−6)=2 s/m, offset 1. Finale ignota (17−1)/g=8 m/s; iniziale 8−4=4 m/s. Otto si ferma alla finale; iniziali 3,5 darebbero letture 15,19 e non 17. Due riusa un riferimento senza soddisfare il nuovo dato. |
| 16 | 2 s | La durata totale T seleziona v₀=(1m/s²)T prima della prova. Nel tempo interno τ, v(τ)=(1m/s²)T+(2m/s²)τ e la derivata resta 2m/s². All’estremo τ=T, V=(3m/s²)T=6m/s ⇒ T=2s. Durate 4,1,3 darebbero 12,3,9m/s; −2 è escluso. Il coefficiente della selezione non diventa un’accelerazione fisica aggiuntiva. |

## Figura, unità e controprove

SVG e Base64 corrispondono. Nei tre grafici gli assi hanno stessa scala: 120 px/s
orizzontali e 40 px/(m/s) verticali. Il punto iniziale è 80 px sopra lo zero, il
punto intermedio a un secondo è 160 px sopra, la finale a due secondi 240 px sopra:
2,4,6 m/s. Nel secondo pannello il tratteggio a gradini mostra incrementi uguali;
la retta fisica è continua e ha pendenza costante. Nel terzo si legge l’altezza
finale, non l’area del trapezio. Non è stato confuso questo grafico con la secante
sufficiente per il precedente lotto sull’accelerazione media.

SymPy controlla integrale, condizione a t=0, inverse, rapporto simbolico dei fattori,
taratura affine e vincolo tra dati di prove. Pint esatto controlla at in m/s e il
guadagno in s/m. Il modello del vincolo 16 usa due variabili temporali distinte;
la derivata rispetto al tempo interno vale a, senza aggiungere il coefficiente
che seleziona v₀.

22 mutation test tramite `mutation_audit()`:

- tutte le 16 chiavi errate sono rifiutate anche dopo ribinding e sostituzione
  deliberata di firme e token globali nel solo contesto di test: resta il controllo
  dell’oracolo indipendente;
- chiave corretta con una falsa spiegazione plausibile che elimina v₀ dalla
  velocità finale: payload ribindato rifiutato dalla firma della lettura;
- falsa spiegazione dello scarto 08 con chiave invariata: rifiutata;
- lotti vuoto, parziale, duplicato e SHA sorgente alterata: rifiutati.

Le firme sono statiche sulla sola edizione sopra. Le sostituzioni nei test vengono
ripristinate e non autorizzano una nuova edizione senza lettura. Nessun esito
empirico con studenti o certificazione di accessibilità è rivendicato; browser,
importazione, CI, registro e pubblicazione restano al coordinatore.
