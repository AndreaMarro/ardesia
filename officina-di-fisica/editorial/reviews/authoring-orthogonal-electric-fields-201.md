# Authoring DRAFT — orthogonal-electric-fields-201

Letti individualmente tutti gli 80 prompt A200–204 della fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U6-02 SHA256 fc81a187db9ee2f6d17bf299b333defd87a754ad04fc7efaddd2c40737ecc24d. I compiti e gli ID originali sono conservati e si rendono espliciti segni, domini, conversioni e svolgimenti. Riletti i testi reali C4-L02/L05/L06/L09 per campo vettoriale, corrente, leggi di Ohm, resistività e campo magnetico del filo. Prima dei candidati A, il revisore distinto B ha confermato primaria prompt-only 80 SHA256 d7ebcced2248cb67371054303db64193683455aecc7acf34a27196c23ba8afb6; quella primaria non è stata aperta dall’autore. La primaria A dei futuri 80 B205–209 è congelata separatamente SHA256 e8b27ab57d7cae8ac419227900fbb28282555d33ba3c3265e0e55199e19378bd, senza esposizione U6 a chiavi altrui.

Autore soltanto: DRAFT; revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica.

Due assemblaggi in processi separati dell’assembler unico producono gli stessi byte package e binding. Importatore canonico ROOT su SQLite temporaneo: 16 nuovi, poi 0 nuovi e 16 invariati; tutti i 991 pubblicati e le versioni storiche rimangono invariati. Questo è collaudo tecnico strutturale e non giudizio scientifico.

UI prodotto NOT_RUN: per mandato dell’integratore non si avvia il browser dell’app durante il collaudo globale congelato. Non è stato creato o riusato alcun marker UI. Il diagramma SVG è stato letto come XML e sono state controllate le proporzioni intrinseche dei dati. La resa nativa Quick Look a piena altezza è stata realmente prodotta e letta, con log e PNG conservati: è asset-only, non un replay dell’app o una prova di layout a 320 px. Nessun CSS, runtime, registro, checkpoint o file candidato ROOT modificato.

## AR-u6-orthogonal-electric-fields-01 — Tre, quattro e la diagonale

Nel punto P si sovrappongono due contributi di campo elettrico esattamente perpendicolari, di moduli E₁>0 ed E₂>0 in N/C. Scegliamo +x lungo il primo e +y lungo il secondo. E>0 indica il modulo del campo risultante, non una forza su una carica. Vale E²=E₁²+E₂². Ogni confronto riguarda configurazioni statiche assegnate; non si sommano moduli di prove diverse. Con E₁=3 N/C ed E₂=4 N/C, quanto vale E in N/C?

Procedimento d’autore: Le componenti sono perpendicolari, quindi il prodotto scalare incrociato è zero. Il quadrato del modulo è 3²+4²=9+16=25 nelle unità (N/C)². La radice positiva vale 5 N/C. La somma 3+4 darebbe sette solo per contributi concordi sulla stessa retta.

Passaggi: E^2=E_1^2+E_2^2;  E^2=25\,\mathrm{(N/C)^2};  E=5\,\mathrm{N/C}.

Distrattori: Sette N/C somma i moduli ignorando l’angolo. Un N/C sottrae moduli come se i campi fossero opposti. Venticinque è il valore di E² nelle unità dichiarate, non di E; dodici moltiplica i dati senza una legge vettoriale.

Hint: Disegna il triangolo delle componenti e applica Pitagora prima della radice.

Fonte canonica SHA256 3b98ecc9736540a98bb3189907968ece089c6ee90db5e5d933b207d566a08259. Candidato SHA256 b099c0aa5d5ea36f82ab979ac7260d73752867a5e88940327a70f643076faef7. Revisione indipendente e human NOT_RUN.

## AR-u6-orthogonal-electric-fields-02 — Un campo resta un campo

Nel punto P si sovrappongono due contributi di campo elettrico esattamente perpendicolari, di moduli E₁>0 ed E₂>0 in N/C. Scegliamo +x lungo il primo e +y lungo il secondo. E>0 indica il modulo del campo risultante, non una forza su una carica. Vale E²=E₁²+E₂². Ogni confronto riguarda configurazioni statiche assegnate; non si sommano moduli di prove diverse. Quale unità è dimensionalmente compatibile con E?

Procedimento d’autore: La somma vettoriale di due campi è ancora un campo. E₁² ed E₂² hanno entrambe dimensione (N/C)²; la radice della loro somma ha N/C. Non si introduce una carica di prova nel calcolo del modulo della risultante.

Passaggi: [E^2]=\mathrm{(N/C)^2};  [E]=\mathrm{N/C}.

Distrattori: N è forza e richiederebbe una carica per F=qE. C è carica, J energia, V potenziale: un’unità equivalente al campo sarebbe V/m, non V da solo.

Hint: Distingui il campo elettrico dalla forza che eserciterebbe su una carica.

Fonte canonica SHA256 679fa9ba56b06d795c446ea96b43374046a9952bb11fff80a366f318e0999b77. Candidato SHA256 5822f8d572bd333cb70d67c13bfa616b782d4e8502d9bf86919784d7d4c73d2b. Revisione indipendente e human NOT_RUN.

## AR-u6-orthogonal-electric-fields-03 — La somma dei quadrati

Nel punto P si sovrappongono due contributi di campo elettrico esattamente perpendicolari, di moduli E₁>0 ed E₂>0 in N/C. Scegliamo +x lungo il primo e +y lungo il secondo. E>0 indica il modulo del campo risultante, non una forza su una carica. Vale E²=E₁²+E₂². Ogni confronto riguarda configurazioni statiche assegnate; non si sommano moduli di prove diverse. Quale legge fornisce E?

Procedimento d’autore: Per due vettori ortogonali il modulo al quadrato della somma è la somma dei quadrati dei moduli. Per ottenere E, e non E², si estrae la radice positiva. Il fatto che entrambi i moduli siano positivi non permette di sommarli scalarmente.

Passaggi: \vec E=\vec E_1+\vec E_2;  E^2=E_1^2+E_2^2;  E=\sqrt{E_1^2+E_2^2}.

Distrattori: Somma e differenza dei moduli appartengono a casi collineari, non a un angolo retto. E₁²+E₂² senza radice ha unità di campo al quadrato. La media geometrica √(E₁E₂) non è il modulo del vettore somma.

Hint: Prima somma i vettori mediante componenti, poi ricava il loro modulo.

Fonte canonica SHA256 936470bbb0d148a7e3cd3de948eaf9740ba288b30b1cec3e9a2d9616852b3760. Candidato SHA256 216eda4a72afc7cf1959a8b32b6cd35fcad9d98ea6f4daa7fe4d19cb12d73f3c. Revisione indipendente e human NOT_RUN.

## AR-u6-orthogonal-electric-fields-04 — Un contributo più piccolo

Nel punto P si sovrappongono due contributi di campo elettrico esattamente perpendicolari, di moduli E₁>0 ed E₂>0 in N/C. Scegliamo +x lungo il primo e +y lungo il secondo. E>0 indica il modulo del campo risultante, non una forza su una carica. Vale E²=E₁²+E₂². Ogni confronto riguarda configurazioni statiche assegnate; non si sommano moduli di prove diverse. E₂ resta 4 N/C. E₁ passa da 3 a 1 N/C. Come cambia E?

Procedimento d’autore: All’inizio la terna 3,4,5 dà E_A=5 N/C. Alla fine il quadrato è 1²+4²=17 nelle unità (N/C)²: il modulo è √17 N/C. Il radicale esatto è una risposta completa; non occorre una sua approssimazione decimale. Poiché 16<17<25, il nuovo modulo sta tra 4 e 5 N/C.

Passaggi: E_A=5\,\mathrm{N/C};  E_B^2=17\,\mathrm{(N/C)^2};  E_B=\sqrt{17}\,\mathrm{N/C}.

Distrattori: 5/3 riduce tutta la risultante come E₁, ma E₂ resta invariato. Cinque ignora il cambiamento; tre sottrae i moduli e diciassette dimentica la radice.

Hint: Ricalcola il quadrato della risultante: può essere corretto lasciarlo sotto radice.

Fonte canonica SHA256 16dd326fddcd75a557216b18697dfdbe389006993b4b4b01de2380045879e471. Candidato SHA256 8f4fda0c3d07b6350481f4040f0f97895c60c4a436374bd3f22ee86524ee2f5c. Revisione indipendente e human NOT_RUN.

## AR-u6-orthogonal-electric-fields-05 — Il cateto dall’ipotenusa

Nel punto P si sovrappongono due contributi di campo elettrico esattamente perpendicolari, di moduli E₁>0 ed E₂>0 in N/C. Scegliamo +x lungo il primo e +y lungo il secondo. E>0 indica il modulo del campo risultante, non una forza su una carica. Vale E²=E₁²+E₂². Ogni confronto riguarda configurazioni statiche assegnate; non si sommano moduli di prove diverse. Si misura E=5 N/C e si conosce E₂=4 N/C. Quanto vale E₁ in N/C?

Procedimento d’autore: Sottraiamo E₂² da E²: E₁²=25−16=9 nelle unità (N/C)². La radice positiva dà E₁=3 N/C. Il dato E deve essere strettamente maggiore di E₂ per ricostruire un primo contributo positivo.

Passaggi: E_1^2=E^2-E_2^2;  E_1^2=9\,\mathrm{(N/C)^2};  E_1=3\,\mathrm{N/C}.

Distrattori: Uno N/C sottrae direttamente 5−4. Nove N/C copia il quadrato senza radice; √41 N/C somma i quadrati invece di usare l’inversa. La radice negativa non è un modulo.

Hint: Isola il quadrato del contributo prima della radice positiva.

Fonte canonica SHA256 b39318c726f2ad3b95eaef8cce515bfccbf573f5a369a20276ebf5e0f9d34d2c. Candidato SHA256 6c0c940cdcf76a2e77d3e4826b9dafdcfc32cd0f97961d6172bb9b54839582ba. Revisione indipendente e human NOT_RUN.

## AR-u6-orthogonal-electric-fields-06 — Due contributi uguali

Nel punto P si sovrappongono due contributi di campo elettrico esattamente perpendicolari, di moduli E₁>0 ed E₂>0 in N/C. Scegliamo +x lungo il primo e +y lungo il secondo. E>0 indica il modulo del campo risultante, non una forza su una carica. Vale E²=E₁²+E₂². Ogni confronto riguarda configurazioni statiche assegnate; non si sommano moduli di prove diverse. Nel caso presente E₁=E₂=3 N/C. Il primo è lungo +x e il secondo lungo +y. Qual è l’angolo della risultante rispetto a +x, misurato verso +y?

Procedimento d’autore: Le due componenti positive sono uguali, quindi il triangolo rettangolo è isoscele. La risultante giace nel primo quadrante sulla bisettrice dell’angolo retto. I due angoli acuti uguali sommano 90° e valgono 45° ciascuno: non serve valutare una funzione trigonometrica con la calcolatrice.

Passaggi: E_x=E_y; E_y=3\,\mathrm{N/C};  \theta+\theta=90^\circ;  \theta=45^\circ.

Distrattori: Zero e novanta gradi ignorano una delle componenti non nulle. Centottanta punterebbe nel verso −x, incompatibile con entrambe le componenti positive. Trenta gradi non divide in parti uguali l’angolo retto.

Hint: Usa la simmetria delle componenti uguali e il quadrante indicato.

Fonte canonica SHA256 12d410b22de3e94f7b5fed37162375ed35a20af9a9ec8029a590cca297708e55. Candidato SHA256 f3ae698344ca271307769afa84e3ae00a5ae5ae83450a0633430a1fe314163bc. Revisione indipendente e human NOT_RUN.

## AR-u6-orthogonal-electric-fields-07 — Il confronto conserva la radice

Nel punto P si sovrappongono due contributi di campo elettrico esattamente perpendicolari, di moduli E₁>0 ed E₂>0 in N/C. Scegliamo +x lungo il primo e +y lungo il secondo. E>0 indica il modulo del campo risultante, non una forza su una carica. Vale E²=E₁²+E₂². Ogni confronto riguarda configurazioni statiche assegnate; non si sommano moduli di prove diverse. A usa E₁=3 N/C, E₂=4 N/C. B mantiene E₁ e usa E₂=1 N/C. Quanto vale E_B/E_A?

Procedimento d’autore: A ha modulo 5 N/C. B ha quadrato 3²+1²=10 e modulo √10 N/C. Il rapporto è √10/5, puro. Non occorre un valore decimale: elevandolo al quadrato si ottiene 10/25=2/5, controllo esatto della frazione sotto radice.

Passaggi: E_A=5\,\mathrm{N/C};  E_B=\sqrt{10}\,\mathrm{N/C};  \frac{E_B}{E_A}=\frac{\sqrt{10}}5.

Distrattori: 1/5 scarta la componente 3. Un mezzo non ha quadrato 2/5; due è maggiore di uno mentre B ha campo minore di A. 5/√10 inverte l’ordine B/A.

Hint: Ricava separatamente i due moduli e non perdere la radice nel rapporto.

Fonte canonica SHA256 75e82c4c44556d045b5e4b70306e11818f5c2c4f2585c13166ff3dadf4e51afc. Candidato SHA256 6a8cb6e29cad9543a261e5619813200d18af0dfa53fac561922b26388496cb89. Revisione indipendente e human NOT_RUN.

## AR-u6-orthogonal-electric-fields-08 — Scarto dimensionato del modulo

Nel punto P si sovrappongono due contributi di campo elettrico esattamente perpendicolari, di moduli E₁>0 ed E₂>0 in N/C. Scegliamo +x lungo il primo e +y lungo il secondo. E>0 indica il modulo del campo risultante, non una forza su una carica. Vale E²=E₁²+E₂². Ogni confronto riguarda configurazioni statiche assegnate; non si sommano moduli di prove diverse. Con E₁=3 N/C ed E₂=4 N/C si propone E=10 N/C. Quanto vale proposta meno risultato corretto?

Procedimento d’autore: Pitagora restituisce 5 N/C. La proposta 10 N/C supera il valore corretto di 10−5=5 N/C. Il rapporto proposta/corretto sarebbe il numero puro due, che non ha l’unità della differenza richiesta.

Passaggi: E=5\,\mathrm{N/C};  e=(10-5)\,\mathrm{N/C};  e=5\,\mathrm{N/C}.

Distrattori: −5 N/C inverte la sottrazione; dieci copia la proposta, zero la accetta. Due senza unità è un rapporto e non uno scarto fra moduli di campo.

Hint: Usa il corretto modulo vettoriale prima di sottrarre la proposta.

Fonte canonica SHA256 af4d3b5dcd8bfbc811063850473f6b81202da82649902f66ee4b4850504447d4. Candidato SHA256 97d0e8ee25751f6a860bb537f2f75944138bd65e6150c2525137324fc0b9f525. Revisione indipendente e human NOT_RUN.

## AR-u6-orthogonal-electric-fields-09 — L’inversa richiede una differenza

Nel punto P si sovrappongono due contributi di campo elettrico esattamente perpendicolari, di moduli E₁>0 ed E₂>0 in N/C. Scegliamo +x lungo il primo e +y lungo il secondo. E>0 indica il modulo del campo risultante, non una forza su una carica. Vale E²=E₁²+E₂². Ogni confronto riguarda configurazioni statiche assegnate; non si sommano moduli di prove diverse. Sono noti E ed E₂, con E>E₂>0. Quale formula ricava E₁?

Procedimento d’autore: Eleviamo al quadrato E=√(E₁²+E₂²) e sottraiamo E₂². Poi scegliamo la radice positiva. La condizione E>E₂ rende positivo il radicando; l’uguaglianza E=E₂ produrrebbe E₁=0, escluso dal dominio di questo quesito.

Passaggi: E^2=E_1^2+E_2^2;  E_1^2=E^2-E_2^2;  E_1=\sqrt{E^2-E_2^2}.

Distrattori: E−E₂ è un’inversa scalare per campi concordi, non per campi perpendicolari. La somma dei quadrati non isola il cateto. Senza radice rimangono unità (N/C)²; E₂/E è adimensionale.

Hint: Controlla il dominio del radicando prima di estrarre la radice.

Fonte canonica SHA256 542b28734e44d72b842eaf9197a6921b56649de8f5459b15083c783795a21b41. Candidato SHA256 fe073154021b089851b40f873c95c36157f4bbd01ee2baaf9e917f64abe1b585. Revisione indipendente e human NOT_RUN.

## AR-u6-orthogonal-electric-fields-10 — Fattori sui due cateti

Nel punto P si sovrappongono due contributi di campo elettrico esattamente perpendicolari, di moduli E₁>0 ed E₂>0 in N/C. Scegliamo +x lungo il primo e +y lungo il secondo. E>0 indica il modulo del campo risultante, non una forza su una carica. Vale E²=E₁²+E₂². Ogni confronto riguarda configurazioni statiche assegnate; non si sommano moduli di prove diverse. B ha E₁,B=κ₁E₁,A ed E₂,B=κ₂E₂,A, con κ₁,κ₂>0. Per scrivere risposte brevi definiamo a=E₁,A/E_A e b=E₂,A/E_A: sono puri e a²+b²=1. Quale legge generale dà E_B/E_A?

Procedimento d’autore: Nel quadrato del modulo B si trovano κ₁²E₁,A² e κ₂²E₂,A². Dividendo per E_A² si ottiene κ₁²a²+κ₂²b². Il rapporto dei moduli è la radice positiva di questa somma. I due nuovi simboli rappresentano solo le componenti iniziali normalizzate; non modificano il problema fisico.

Passaggi: E_B^2=\kappa_1^2E_{1,A}^2+\kappa_2^2E_{2,A}^2;  \left(\frac{E_B}{E_A}\right)^2=\kappa_1^2a^2+\kappa_2^2b^2.

Distrattori: La somma κ₁a+κ₂b somma moduli invece di componenti ortogonali. I fattori κ vanno anch’essi al quadrato prima della radice; il segno meno non è Pitagora. Scambiare κ₁ e κ₂ assegna le variazioni ai cateti sbagliati, e non è una legge generale anche se coincide in casi simmetrici particolari.

Hint: Normalizza i quadrati dei due contributi prima della radice finale.

Fonte canonica SHA256 6bf0258fcbb1fc97ec24390973a34f36c3c78977ba13d6f069d1efbd25027906. Candidato SHA256 4d6aea067320d1edfde4274750ca9477df025bb1c30dfb32840e1f693c9e7030. Revisione indipendente e human NOT_RUN.

## AR-u6-orthogonal-electric-fields-11 — Due terne pitagoriche

Nel punto P si sovrappongono due contributi di campo elettrico esattamente perpendicolari, di moduli E₁>0 ed E₂>0 in N/C. Scegliamo +x lungo il primo e +y lungo il secondo. E>0 indica il modulo del campo risultante, non una forza su una carica. Vale E²=E₁²+E₂². Ogni confronto riguarda configurazioni statiche assegnate; non si sommano moduli di prove diverse. A usa E₁=3 N/C, E₂=4 N/C. B usa E₁=5 N/C, E₂=12 N/C. Quanto vale E_B/E_A?

Procedimento d’autore: A dà √25=5 N/C. In B i quadrati sono 25 e 144, somma 169=13². Quindi E_B=13 N/C e il rapporto puro è 13/5. Entrambi i contributi cambiano: non basta il fattore di un singolo cateto.

Passaggi: E_A=5\,\mathrm{N/C};  E_B^2=169\,\mathrm{(N/C)^2};  E_B=13\,\mathrm{N/C};  \frac{E_B}{E_A}=\frac{13}5.

Distrattori: 5/13 inverte B/A. 5/3 segue solo E₁ e tre solo E₂. 169/25 è il rapporto dei quadrati, non quello dei moduli.

Hint: Riconosci le terne 3-4-5 e 5-12-13 dopo aver controllato i quadrati.

Fonte canonica SHA256 979fca42dcfac189b80df35356d13c2c59b0e0df898932d5ef463e7443fcbc4b. Candidato SHA256 31f0432079cf219dae0c08132728a90b4f3ea2abdba060f373942a498cefbe37. Revisione indipendente e human NOT_RUN.

## AR-u6-orthogonal-electric-fields-12 — La media non è un altro vettore

Nel punto P si sovrappongono due contributi di campo elettrico esattamente perpendicolari, di moduli E₁>0 ed E₂>0 in N/C. Scegliamo +x lungo il primo e +y lungo il secondo. E>0 indica il modulo del campo risultante, non una forza su una carica. Vale E²=E₁²+E₂². Ogni confronto riguarda configurazioni statiche assegnate; non si sommano moduli di prove diverse. A usa E₁=3 N/C, E₂=4 N/C; B usa E₁=5 N/C, E₂=12 N/C. Qual è la media aritmetica dei due moduli E con uguale peso?

Procedimento d’autore: I moduli sono 5 e 13 N/C: la media è (5+13)/2=9 N/C. Le componenti medie sarebbero 4 e 8 N/C e il loro modulo √80=4√5 N/C. Non coincide: il quadrato di 9 è 81, mentre quello di 4√5 è 80. Il confronto è esatto senza decimali.

Passaggi: \overline E=\frac{5+13}{2}\,\mathrm{N/C};  \overline E=9\,\mathrm{N/C};  E_{\rm dati\ medi}=4\sqrt5\,\mathrm{N/C}.

Distrattori: 4√5 N/C usa le componenti medie. Diciotto non dimezza; quattro è metà della differenza e tredici copia B. La media statistica dei moduli non è la somma fisica dei vettori delle due configurazioni.

Hint: Calcola i due moduli prima della media, mantenendo separata ogni configurazione.

Fonte canonica SHA256 9dd20aa200159b817a085c2e74759d92b9f16c8ff5c9371b047ba4c9cf99e382. Candidato SHA256 11d55bd6aa601c050cfe12a212ae5ffbfca3209baa7f9999e336e3218da1aa8d. Revisione indipendente e human NOT_RUN.

## AR-u6-orthogonal-electric-fields-13 — Il nuovo cateto per il bersaglio

Nel punto P si sovrappongono due contributi di campo elettrico esattamente perpendicolari, di moduli E₁>0 ed E₂>0 in N/C. Scegliamo +x lungo il primo e +y lungo il secondo. E>0 indica il modulo del campo risultante, non una forza su una carica. Vale E²=E₁²+E₂². Ogni confronto riguarda configurazioni statiche assegnate; non si sommano moduli di prove diverse. A ha E₁=3 N/C, E₂=4 N/C. B usa E₁=5 N/C e deve dare E_B=(13/5)E_A. Quanto vale E₂,B/E₂,A?

Procedimento d’autore: Il bersaglio è 13 N/C. Sottraiamo il quadrato del primo cateto B: E₂,B²=13²−5²=169−25=144. Il modulo positivo è 12 N/C. Il rapporto con 4 N/C iniziali è tre.

Passaggi: E_B=13\,\mathrm{N/C};  E_{2,B}^2=144\,\mathrm{(N/C)^2};  E_{2,B}=12\,\mathrm{N/C};  \frac{E_{2,B}}{E_{2,A}}=3.

Distrattori: Un terzo inverte il confronto; nove è il rapporto dei quadrati dei cateti. 13/5 copia il bersaglio dei moduli, mentre dodici è il solo valore di E₂,B nelle unità N/C.

Hint: Ricostruisci il cateto B e solo dopo confrontalo con il cateto iniziale.

Fonte canonica SHA256 46d95e706ec3203292e1244a59b0b904706061d0e3e73c4c3c9f2db9c30124f0. Candidato SHA256 3fa2a26fe82cd0b55585f241fc67511249c0e2089e5da9b3642e5603c903286f. Revisione indipendente e human NOT_RUN.

## AR-u6-orthogonal-electric-fields-14 — Un display proporzionale al modulo

Nel punto P si sovrappongono due contributi di campo elettrico esattamente perpendicolari, di moduli E₁>0 ed E₂>0 in N/C. Scegliamo +x lungo il primo e +y lungo il secondo. E>0 indica il modulo del campo risultante, non una forza su una carica. Vale E²=E₁²+E₂². Ogni confronto riguarda configurazioni statiche assegnate; non si sommano moduli di prove diverse. D=aE è continuo e adimensionale, a>0. A con E₁=3 N/C, E₂=4 N/C dà D=15. C ha E₂=12 N/C e D=39. Quanto vale E₁,C in N/C?

Procedimento d’autore: Il modulo di riferimento è 5 N/C, quindi a=3 C/N. D=39 indica E_C=13 N/C. L’inversa per il primo cateto dà √(13²−12²)=√25=5 N/C. La lettura non è direttamente un campo.

Passaggi: a=3\,\mathrm{C/N};  E_C=13\,\mathrm{N/C};  E_{1,C}^2=25\,\mathrm{(N/C)^2};  E_{1,C}=5\,\mathrm{N/C}.

Distrattori: Un N/C sottrae 13−12 senza quadrati. Venticinque N/C dimentica la radice. Usare 39 come E lascerebbe nella ricostruzione il guadagno strumentale e non riprodurrebbe il display.

Hint: Rimuovi la taratura, poi usa la differenza dei quadrati dei campi.

Fonte canonica SHA256 eb77b5954c05eb996c8ab8c05ce4f69e1a7e0f059d6b7f8deb2c685d00d66b7c. Candidato SHA256 63eb350121261d5b2a8e3372d7bb1523a9f9894cf1de73ff62a212bd976d1d65. Revisione indipendente e human NOT_RUN.

## AR-u6-orthogonal-electric-fields-15 — Offset prima del teorema

Nel punto P si sovrappongono due contributi di campo elettrico esattamente perpendicolari, di moduli E₁>0 ed E₂>0 in N/C. Scegliamo +x lungo il primo e +y lungo il secondo. E>0 indica il modulo del campo risultante, non una forza su una carica. Vale E²=E₁²+E₂². Ogni confronto riguarda configurazioni statiche assegnate; non si sommano moduli di prove diverse. Il display continuo adimensionale è D=aE+b, a>0. A: E₁=3 N/C, E₂=4 N/C, D=11. B: E₁=5 N/C, E₂=12 N/C, D=27. C: E₂=8 N/C, D=21. Quanto vale E₁,C?

Procedimento d’autore: I riferimenti hanno moduli 5 e 13 N/C. a=(27−11)/(13−5)=2 C/N e b=1. C dà E_C=(21−1)/2=10 N/C. Quindi E₁,C²=100−64=36 nelle unità (N/C)², e il modulo positivo è 6 N/C.

Passaggi: a=2\,\mathrm{C/N};  b=1;  E_C=10\,\mathrm{N/C};  E_{1,C}^2=36\,\mathrm{(N/C)^2};  E_{1,C}=6\,\mathrm{N/C}.

Distrattori: Due N/C sottrae direttamente 10−8. Dieci copia il modulo totale; trentasei non estrae la radice. √57 N/C darebbe E_C=11 N/C e D=23, non 21: la sostituzione confuta il distrattore senza approssimare il radicale.

Hint: Trova a e b dai due moduli, non dai singoli cateti; poi decodifica C.

Fonte canonica SHA256 6fc011cac0ac6aca643aa77eddf15eedc231f055ecf248029cd04129663a754a. Candidato SHA256 a28d38d59e300f08a6aabe8851448773f23c35ec6b67535acf9c8eddab25498b. Revisione indipendente e human NOT_RUN.

## AR-u6-orthogonal-electric-fields-16 — Un vincolo fra componenti

Nel punto P si sovrappongono due contributi di campo elettrico esattamente perpendicolari, di moduli E₁>0 ed E₂>0 in N/C. Scegliamo +x lungo il primo e +y lungo il secondo. E>0 indica il modulo del campo risultante, non una forza su una carica. Vale E²=E₁²+E₂². Ogni confronto riguarda configurazioni statiche assegnate; non si sommano moduli di prove diverse. Si impone E₁=(3/4)E₂ e si misura E=5 N/C. Quanto vale E₂?

Procedimento d’autore: Sostituiamo il vincolo: E²=(9/16)E₂²+E₂²=(25/16)E₂². La misura 25 nelle unità (N/C)² impone E₂²=16, quindi E₂=4 N/C e E₁=3 N/C. La misura del modulo fissa la scala che il solo rapporto non fissava.

Passaggi: E^2=\frac{25}{16}E_2^2;  E_2^2=16\,\mathrm{(N/C)^2};  E_2=4\,\mathrm{N/C}.

Distrattori: Tre N/C è l’altro cateto della terna. Cinque copia il modulo totale e −4 non è un modulo positivo. Non restano infinite coppie: per un rapporto fissato il modulo cresce con la scala delle componenti.

Hint: Sostituisci il rapporto fra componenti prima di cercare la scala positiva.

Fonte canonica SHA256 02d674723a3b5be6a1476d6b4af683355ed8a610e8175a8527078d373845ef40. Candidato SHA256 fdbd97082c832bad5ee9e272f47a3b58efe7cf82dafcbbbcd813de0c1c669dc9. Revisione indipendente e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 2b3a795b30f86f3951bbc0cdcd78ad41f1f09922c16da1d0b02d4020a931ab64. Package file SHA256 fe6f301fa593ff8f0f7739e9139302fec32462859f339ae5c881101ab2574979. Binding file SHA256 9297aa7512da10ad472f14a05b245d832c1f726cc92d58ad875dd5ed8fa8a13f. Prova strutturale SHA256 7ec02a73b0d082add08c84c97dfed8e639c30507f675f5416ec4359dd9d9cd42. Asset-only manifest SHA256 7e87d21be8e4b13d44482713b96d47f741860c87f18bcecfd4c5fbe606fc3251.

Le coordinate intrinseche dell’SVG documentano proporzioni geometriche nella sorgente, non una misura in pixel fisici dopo ridimensionamento. I testi visibili usano soltanto grandezze fisiche e valori pertinenti. Le origini e le etichette sono separate dagli assi; la direzione di ciascuna freccia è letta insieme alla sua didascalia.

## Scelte editoriali e controllo d’autore

Il caso 04 conserva il radicale √17 e il 07 √10/5: nessuna approssimazione decimale o valutazione trigonometrica richiesta. Nel 10 le componenti iniziali sono normalizzate con a=E₁,A/E_A e b=E₂,A/E_A, definiti nel prompt: questo accorcia la legge generale senza cambiare la dipendenza dai due fattori. Il caso 06 dell’angolo è autonomo e usa la simmetria del triangolo isoscele nel primo quadrante.

Nel primo preflight il valore esatto 13/5 del 11 era stato assegnato come stringa a una risposta numeric: il validatore canonico lo ha rifiutato prima della consegna. L’edizione finale usa una scelta con cinque alternative, preservando esattamente il compito e il valore. Solo i successivi due assemblaggi e l’import finale idempotente hanno esito positivo; nessun credito viene dal tentativo rifiutato.

Geometria intrinseca: primo triangolo con componenti240 e320 coordinate e diagonale400, scala comune80 coordinate per N/C. Secondo triangolo con componenti210 e210 e diagonale210√2; la sua scala è70 coordinate per N/C, diversa dal primo pannello, senza confrontare lunghezze tra pannelli. L’arco45° va dall’asse+x alla diagonale. Barre finali5,13,9 N/C larghe120,312,216, origine130 e scala comune24 coordinate per N/C. Lo zero è a104, separato dall’asse. Tutte le punte sono interamente visibili nel rendering nativo letto. Queste sono coordinate tecniche, non pixel fisici nell’app responsive, e non sono stampate nel percorso studente. Nessun verdetto scientifico dell’autore.
