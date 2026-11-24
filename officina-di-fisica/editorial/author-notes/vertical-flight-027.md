# Note d’autore — vertical-flight-027

Fonte letta individualmente: tutti i sedici u2-vertical-flight-01..16 nel file
U2-02.json del commit 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605. Percorso completo
nei binding; compiti cognitivi mantenuti. Riutilizzati assembly, law_steps,
validatore e importatore astra/1 esistenti. Lezioni C1-L001..L004 già nel catalogo.
Questo documento propone calcoli d’autore: revisione indipendente e approvazione
umana NOT_RUN, nessun PASS scientifico; tutti i candidati restano DRAFT.

Modello: riferimento inerziale, +y verso l’alto, t=0 e y=0 al lancio; campo
uniforme costante, aria assente, v₀,g positivi, arrivo alla stessa quota. Gli
esatti campi didattici sorgente 2 e 4 m/s² sono mantenuti. La radice t=0 della
posizione è esclusa dal ritorno richiesto T>0; T=2v₀/g. Il punto all’apice è
vᵧ=0 con accelerazione ancora −g, a T/2.

| ID | Calcolo e cautela proposti |
| --- | --- |
| 01 | v₀2,g2 nelle unità SI: T2s, apice1s,H1m; al ritorno vᵧ−2m/s. |
| 02 | (L/T)/(L/T²)=T; unità s, non frequenza o s². |
| 03 | Fattorizzazione t(v₀−gt/2)=0; zero futuro2v₀/g. Distrattore v₀/g è sola salita; v₀²/(2g) è quota. |
| 04 | v₀2→4 a g2: T2→4s, proporzionalità lineare diversa dalla quota quadratica. |
| 05 | v₀=gT/2=2m/s; gT conterebbe tutto il volo come salita. |
| 06 | g=2v₀/T=2m/s²; componente dell’accelerazione−g. |
| 07 | g2→4,v₀2: T2→1s, rapporto1/2 positivo. |
| 08 | proposta4s meno corretto2s: scarto+2s. |
| 09 | gT=2v₀, quindi v₀=gT/2. Dimensioni e ramo positivo espliciti. |
| 10 | T_B/T_A=κ₁/κ₂, non κ₁²/κ₂ che è rapporto delle quote. |
| 11 | (v₀,g)=(2,2)→(6,4): T2→3s, rapporto3/2. |
| 12 | Media delle durate(2+3)/2=5/2s; ingressi medi danno8/3s. |
| 13 | TargetT3s,v₀6⇒g4, rapporto campi2. |
| 14 | c=6/(2s)=3s⁻¹;S9⇒T3s;g4⇒v₀6m/s. |
| 15 | T_A2,T_B3s; c=(7−5)/(3−2)s⁻¹=2s⁻¹,d1; S9⇒T4s;g2⇒v₀4m/s. |
| 16 | v₀=(1s)g implica giàT2s; infinite coppie continue con g>0. Non (0,0). |

Figura originale progressiva allegata solo a01: quota y=2t−t² da t0 a2s;
scala120px/s e120px/m, Bézier M100,520 Q220,280 340,520, apice220,400.
Componente vᵧ=2−2t con120px/s e50px/(m/s), estremi100,720 e340,920;
triangoli di area fisica+1m e−1m. La linea di riferimento spaziale y0 è210,
apice90 (120px/m); le due frecce separano salita e discesa. Nessun grafico
oltre il primo ritorno; asse e istante iniziale dichiarati, etichette fuori
dalle linee di quota. Ogni formula lunga è suddivisa tramite law_steps.
