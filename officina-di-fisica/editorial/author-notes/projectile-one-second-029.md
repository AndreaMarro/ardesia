# Note d’autore — projectile-one-second-029

Tutti i sedici sorgenti letti individualmente in U2-02.json, commit
5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, ID u2-projectile-one-second-01..16.
Riutilizzati assembly/pipeline, astra/1 e prerequisiti C1-L001..L004 presenti.
Note di calcolo dell’autore, non revisione indipendente né PASS. Tutto DRAFT,
independentReview e humanApproval NOT_RUN.

L’istante di osservazione è sempre τ=1s dal lancio. Si mantengono le componenti
verso l’alto positive e l’accelerazione orientata−g con campo uniforme costante,
assenza di aria e riferimento inerziale. H=y(τ)−y(0)>0 è un guadagno di quota,
non quota assoluta o necessariamente quota massima. Il dominio w>gτ/2 non implica
w>gτ: è ammesso osservare un corpo ancora sopra il lancio ma già in discesa.
Nessun moto viene interrotto da un ostacolo prima dell’istante richiesto.

I valori didattici g2 e4m/s² del sorgente sono mantenuti esattamente. I fattori
τ eτ² sono espliciti anche quando il valore numerico in secondi è uno, evitando
di sottrarre grandezze dimensionalmente diverse nella formula tra simboli.

| ID | Calcolo e cautela proposti |
| --- | --- |
| 01 | w4,g2: wτ4m, perdita1m, H3m; v_finale2m/s, media temporale3m/s. |
| 02 | [wτ]=[gτ²]=L, quindi unitàm. La scorciatoia w−g/2 vale solo per valori numerici in SI. |
| 03 | H=wτ−gτ²/2; positivo non significa necessariamente ancora in salita. |
| 04 | g2→4 con w4: H3→2m; in B v_finale0 all’apice, quota non zero. |
| 05 | g=2(wτ−H)/τ²=2m/s²; H<wτ assicura g positivo. |
| 06 | w=H/τ+gτ/2=4m/s, maggiore della media3. |
| 07 | w4→6,g2: H3→5m; rapporto5/3, diverso da6/4. |
| 08 | Proposta6m meno corretto3m⇒+3m. La proposta è wτ+gτ² e sbaglia segno e metà. |
| 09 | g=2(wτ−H)/τ²; inverse alternative con errore di segno/fattore/dimensione. |
| 10 | H_B/H_A=(κ₂wτ−κ₁gτ²/2)/(wτ−gτ²/2); entrambi i guadagni positivi. κ₁=κ₂=k⇒rapporto k. |
| 11 | (g,w)=(2,4)→(4,6): H3→4m; rapporto4/3. |
| 12 | Media(3+4)/2=7/2m. Dati medi(g3,w5) danno ancora7/2 perché a τ fisso la legge è lineare nei due ingressi; non affermare falsamente che qui differiscano. |
| 13 | TargetH4m,g4⇒w6m/s; w_B/w_A3/2. |
| 14 | c9/(3m)=3m⁻¹;S12⇒H4m;w6⇒g4m/s². H4m è minore di wτ6m. |
| 15 | H_A3,H_B4m;c2m⁻¹,d1;S5⇒H_C2m;w4⇒g_C4m/s². Distrattore g8 dà H0, fuori dominio. |
| 16 | Vincolo g=w/(2s): H=(3/4)w(1s). H3m⇒w4m/s,g2m/s², unica soluzione positiva. |

SVG originale in tre tappe collegato01: vᵧ=4−2t nel solo intervallo[0,1s],
scale200px/s e40px/(m/s), trapezio100,300–100,140–300,220–300,300 con area3m.
Quota reale H=4t−t² con scala200px/s e40px/m: Bézier M100,700 Q200,620 300,580;
riferimento uniforme tratteggiato M100,700 L300,540, perdita verticale40px=1m.
Barre finali4m160px,3m120px,perdita1m40px, stessa scala40px/m. Si dichiara
che l’apice della prova avverrebbe a2s, oltre il tratto rappresentato. Nessuna
etichetta di arrivo viene attraversata dalle linee di riferimento.

Rilievo del revisore separato su12/13: il simbolo τ appariva rispettivamente
nella spiegazione della linearità e nell’inversa senza una definizione locale.
In entrambi è stata aggiunta prima del suo impiego la definizione esplicita
τ=1s come intervallo dal lancio. Chiavi, dati, formule e asset non cambiano;
package/binding e nota strutturale sono rigenerati. Il revisore separato deve
rileggere i nuovi byte: questa correzione d’autore non rinnova alcuna firma.
