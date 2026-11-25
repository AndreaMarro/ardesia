# Authoring DRAFT — identical-parallel-resistors-210

Letti individualmente tutti i 16 prompt del presente lotto A210 e completate separatamente le 80 derivazioni primarie B215–219 della fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U6-03 SHA256 0bd13e1748174df8c30e06641ad153b8e44ab98df47f31c9f1aba7f925f88077. I compiti e gli ID originali sono conservati e si rendono espliciti segni, domini, conversioni e svolgimenti. Riletti i testi reali C4-L05/L06/L07 per corrente, legge di Ohm, topologia dei nodi e distinzione da capacità ed energia elettrostatica. Prima dei candidati A, il revisore distinto B ha confermato primaria prompt-only 80 SHA256 5a11a0eae02cb2aaf503d979af679d9a586f1dc8572134ca7523f895ca07e509; quella primaria non è stata aperta dall’autore. La primaria A dei futuri 80 B215–219 è congelata separatamente SHA256 4c49ff1e2020d073891686e5289e263561531a9b81e84e2f0fa9c8648dc90f4b, senza esposizione U6 a chiavi altrui.

Autore soltanto: DRAFT; revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica.

Due assemblaggi in processi separati dell’assembler unico producono gli stessi byte package e binding. Importatore canonico ROOT su SQLite temporaneo: 16 nuovi, poi 0 nuovi e 16 invariati; tutti i 991 pubblicati e le versioni storiche rimangono invariati. Questo è collaudo tecnico strutturale e non giudizio scientifico.

UI prodotto NOT_RUN: per mandato dell’integratore non si avvia il browser dell’app durante il vincolo operativo sui replay locali. Non è stato creato o riusato alcun marker UI. Il diagramma SVG è stato letto come XML e sono state controllate le proporzioni intrinseche dei dati. La resa nativa Quick Look a piena altezza è stata realmente prodotta e letta, con log e PNG conservati: è asset-only, non un replay dell’app o una prova di layout a 320 px. Nessun CSS, runtime, registro, checkpoint o file candidato ROOT modificato.

## AR-u6-identical-parallel-resistors-01 — Tre rami fra due nodi

N resistori ohmici identici, ciascuno di resistenza r>0 finita, sono collegati fra gli stessi due nodi A e B con fili ideali. La temperatura è fissata e il regime è stazionario. N è un intero positivo, anche N=1 è ammesso. La resistenza equivalente R è il coefficiente nella legge V_AB=RI_T: per V_AB non nulla, ogni ramo porta V_AB/r e I_T=N V_AB/r. Resta quindi R=r/N, anche come coefficiente al limite di tensione nulla. Fra prove possono cambiare r e N senza cambiare questa topologia. Ogni ramo ha r=12 Ω e N=3. Quanto vale R in Ω?

Procedimento d’autore: I tre rami ricevono la stessa tensione orientata da A a B; non sono attraversati in successione. La corrente totale somma tre contributi V_AB/(12 Ω). Da I_T=V_AB/(4 Ω) segue R=4 Ω. Il risultato è minore di 12 Ω perché sono disponibili tre percorsi in parallelo.

Passaggi: I_T=3\frac{V_{AB}}{12\,\Omega};  R=\frac{12}{3}\,\Omega;  R=4\,\Omega.

Distrattori: 36 Ω sarebbe la serie dei tre elementi. Dodici Ω conserva soltanto un ramo; 1/4 Ω è il reciproco numerico del risultato, ma il reciproco fisico è una conduttanza di 1/4 S. Due Ω conterebbe sei rami da 12 Ω, non tre.

Hint: Somma le correnti dei rami, mantenendo comune la tensione.

Fonte canonica SHA256 41ff202fc0ad12ec62edf0a727cbf126c22be80598432992f925b4449eb73724. Candidato SHA256 e2e881783a11748a3bc3672bb6a99112b061cda23b62f5af7a0b64d0bab79cbb. Revisione indipendente e human NOT_RUN.

## AR-u6-identical-parallel-resistors-02 — Il conteggio non cambia l’unità

N resistori ohmici identici, ciascuno di resistenza r>0 finita, sono collegati fra gli stessi due nodi A e B con fili ideali. La temperatura è fissata e il regime è stazionario. N è un intero positivo, anche N=1 è ammesso. La resistenza equivalente R è il coefficiente nella legge V_AB=RI_T: per V_AB non nulla, ogni ramo porta V_AB/r e I_T=N V_AB/r. Resta quindi R=r/N, anche come coefficiente al limite di tensione nulla. Fra prove possono cambiare r e N senza cambiare questa topologia. Quale unità esprime la resistenza equivalente R?

Procedimento d’autore: N conta i rami ed è adimensionale. Dividere una resistenza r per N mantiene l’unità Ω. Dalla definizione del coefficiente equivalente si ottiene anche V/A=Ω; non si sta chiedendo il numero di rami.

Passaggi: R=\frac rN;  [N]=1;  [R]=\Omega.

Distrattori: 1 è l’unità del conteggio, non di R. S misura il reciproco di una resistenza; A misura corrente e V tensione. Il fatto che N non porti unità non rende adimensionale il quoziente r/N.

Hint: Controlla l’unità del numeratore e quella del conteggio.

Fonte canonica SHA256 b6b8c0b850bd6fc67463989713c4a83e69cb311de00b816e8207c95202e4b9dd. Candidato SHA256 258fa681a5d5094744a40731fd80d269e6661a70b466f6289c72e0534fc172e0. Revisione indipendente e human NOT_RUN.

## AR-u6-identical-parallel-resistors-03 — La legge dai rami identici

N resistori ohmici identici, ciascuno di resistenza r>0 finita, sono collegati fra gli stessi due nodi A e B con fili ideali. La temperatura è fissata e il regime è stazionario. N è un intero positivo, anche N=1 è ammesso. La resistenza equivalente R è il coefficiente nella legge V_AB=RI_T: per V_AB non nulla, ogni ramo porta V_AB/r e I_T=N V_AB/r. Resta quindi R=r/N, anche come coefficiente al limite di tensione nulla. Fra prove possono cambiare r e N senza cambiare questa topologia. Quale formula dà R in funzione di r e N?

Procedimento d’autore: Ogni ramo ha conduttanza 1/r. Le N conduttanze si sommano perché i morsetti di tutti i rami coincidono: G_T=N/r. L’equivalente resistivo è il suo reciproco, R=r/N. Con un solo ramo si ritrova R=r, un controllo utile sul confine N=1.

Passaggi: G_T=\frac Nr;  R=\frac1{G_T};  R=\frac rN.

Distrattori: Nr è la serie, mentre N/r è già la conduttanza e ha unità S. r+N somma Ω e un numero puro. N² introdurrebbe un fattore di conteggio ulteriore che non nasce dalla somma delle correnti.

Hint: Somma prima le conduttanze e prendi il reciproco una sola volta.

Fonte canonica SHA256 1d030a93db26c1d49881a58c3e876f9e4c97e32bfdafc3e3c7ce69166b56443e. Candidato SHA256 59f9bcb8c90ed6bcd401ea3763d2212bae8e360fc9fa3ec38b86ff9a1d661de1. Revisione indipendente e human NOT_RUN.

## AR-u6-identical-parallel-resistors-04 — Si dimezza ogni resistenza

N resistori ohmici identici, ciascuno di resistenza r>0 finita, sono collegati fra gli stessi due nodi A e B con fili ideali. La temperatura è fissata e il regime è stazionario. N è un intero positivo, anche N=1 è ammesso. La resistenza equivalente R è il coefficiente nella legge V_AB=RI_T: per V_AB non nulla, ogni ramo porta V_AB/r e I_T=N V_AB/r. Resta quindi R=r/N, anche come coefficiente al limite di tensione nulla. Fra prove possono cambiare r e N senza cambiare questa topologia. N resta 3. Il valore di ciascun ramo passa da 12 a 6 Ω. Come cambia R?

Procedimento d’autore: Il numero di rami non cambia. Inizialmente R_A=12/3=4 Ω; dopo la modifica R_B=6/3=2 Ω. R dipende linearmente dalla resistenza del singolo ramo, perciò si dimezza insieme a essa.

Passaggi: R_A=4\,\Omega;  R_B=\frac63\,\Omega;  R_B=2\,\Omega.

Distrattori: Otto Ω inverte la dipendenza da r. Quattro ignora il cambiamento; sei copia il singolo ramo senza dividerlo per tre; uno dimezza due volte. Non è cambiato N.

Hint: Mantieni il divisore N mentre cambia r.

Fonte canonica SHA256 29b86316fa8758be54fb375a66809ccec2ab69be44c7a953aeacdb4d590d28bb. Candidato SHA256 2ac6006de2dd778fea850d0b783d21ae453ef12689ea05bbbdcb67df042c1afb. Revisione indipendente e human NOT_RUN.

## AR-u6-identical-parallel-resistors-05 — La resistenza di ciascun ramo

N resistori ohmici identici, ciascuno di resistenza r>0 finita, sono collegati fra gli stessi due nodi A e B con fili ideali. La temperatura è fissata e il regime è stazionario. N è un intero positivo, anche N=1 è ammesso. La resistenza equivalente R è il coefficiente nella legge V_AB=RI_T: per V_AB non nulla, ogni ramo porta V_AB/r e I_T=N V_AB/r. Resta quindi R=r/N, anche come coefficiente al limite di tensione nulla. Fra prove possono cambiare r e N senza cambiare questa topologia. Si misura R=4 Ω e si contano N=3 rami. Quanto vale r in Ω?

Procedimento d’autore: Da R=r/N moltiplichiamo entrambi i membri per N: r=NR. Con tre rami si trova r=3·4 Ω=12 Ω. Ricomponendo il parallelo, 12 Ω divisi per tre restituiscono esattamente la misura 4 Ω.

Passaggi: r=NR;  r=3\cdot4\,\Omega;  r=12\,\Omega.

Distrattori: 4/3 Ω divide ancora per N invece di invertire la relazione e darebbe un equivalente 4/9 Ω. Quattro Ω copia il totale e darebbe 4/3 Ω. Trentasei Ω darebbe 12 Ω, non 4 Ω.

Hint: Rimuovi la divisione per N moltiplicando entrambi i membri.

Fonte canonica SHA256 7dc3994782545d7312cf52da73d4dd8107cd8d3a15c801255239431022edc190. Candidato SHA256 5bb2d5ac4f0ce3aed406d194b25a744df730640dfef4c6fc68e7a38cc997a3c1. Revisione indipendente e human NOT_RUN.

## AR-u6-identical-parallel-resistors-06 — Quanti rami sono presenti?

N resistori ohmici identici, ciascuno di resistenza r>0 finita, sono collegati fra gli stessi due nodi A e B con fili ideali. La temperatura è fissata e il regime è stazionario. N è un intero positivo, anche N=1 è ammesso. La resistenza equivalente R è il coefficiente nella legge V_AB=RI_T: per V_AB non nulla, ogni ramo porta V_AB/r e I_T=N V_AB/r. Resta quindi R=r/N, anche come coefficiente al limite di tensione nulla. Fra prove possono cambiare r e N senza cambiare questa topologia. Si misura R=4 Ω e ogni elemento ha r=12 Ω. Quanto vale N?

Procedimento d’autore: Da RN=r ricaviamo N=r/R=12/4=3. Il risultato è un intero positivo, quindi descrive una rete ammessa. Se r/R non fosse intero, i dati non descriverebbero esattamente un parallelo di elementi identici nel modello: non si dovrebbe arrotondare il conteggio.

Passaggi: N=\frac rR;  N=\frac{12}{4};  N=3.

Distrattori: 1/3 inverte il rapporto ed è anche un conteggio non ammesso. Quarantotto moltiplica i valori anziché dividerli e dodici copia r senza confrontarlo con R. Zero non rappresenta una rete con almeno un ramo.

Hint: Dividi il valore di un ramo per l’equivalente e controlla l’integrità.

Fonte canonica SHA256 078e977cf34bcaaa48f78034dae7ebfa70628c7a5c549f729e56b2f7ffd036be. Candidato SHA256 cea6441fabdce47817db66ff44ac1c48c2ce1291cf63b8691148d2f41909ebf5. Revisione indipendente e human NOT_RUN.

## AR-u6-identical-parallel-resistors-07 — Resta un solo ramo

N resistori ohmici identici, ciascuno di resistenza r>0 finita, sono collegati fra gli stessi due nodi A e B con fili ideali. La temperatura è fissata e il regime è stazionario. N è un intero positivo, anche N=1 è ammesso. La resistenza equivalente R è il coefficiente nella legge V_AB=RI_T: per V_AB non nulla, ogni ramo porta V_AB/r e I_T=N V_AB/r. Resta quindi R=r/N, anche come coefficiente al limite di tensione nulla. Fra prove possono cambiare r e N senza cambiare questa topologia. A ha r=12 Ω e N_A=3. B mantiene r e ha N_B=1. Quanto vale R_B/R_A?

Procedimento d’autore: A ha equivalente 4 Ω. Con un solo ramo B ha R_B=r=12 Ω. Il rapporto è 12/4=3: eliminare due percorsi aumenta l’equivalente. N=1 è un caso fisico ammesso, non una divisione per zero.

Passaggi: R_A=4\,\Omega;  R_B=12\,\Omega;  \frac{R_B}{R_A}=3.

Distrattori: Un terzo usa N_B/N_A anziché il suo reciproco. Uno ignora la rimozione; nove e un nono elevano al quadrato un fattore che nella legge R=r/N compare una sola volta.

Hint: Con N=1 l’equivalente coincide con il solo resistore rimasto.

Fonte canonica SHA256 5159b6f78b33c04d955cbc886e437587cbcb7272b96ac29a1b7bc36889db78a5. Candidato SHA256 ee949d4170f29b3b882adf12236b176daa344e6dfd4e0fefe1fdc24cb0ce567a. Revisione indipendente e human NOT_RUN.

## AR-u6-identical-parallel-resistors-08 — Lo scarto della proposta

N resistori ohmici identici, ciascuno di resistenza r>0 finita, sono collegati fra gli stessi due nodi A e B con fili ideali. La temperatura è fissata e il regime è stazionario. N è un intero positivo, anche N=1 è ammesso. La resistenza equivalente R è il coefficiente nella legge V_AB=RI_T: per V_AB non nulla, ogni ramo porta V_AB/r e I_T=N V_AB/r. Resta quindi R=r/N, anche come coefficiente al limite di tensione nulla. Fra prove possono cambiare r e N senza cambiare questa topologia. Con r=12 Ω e N=3 si propone R=8 Ω. Quanto vale proposta meno corretto?

Procedimento d’autore: Il corretto è 12/3=4 Ω. Lo scarto con l’ordine richiesto è 8−4=+4 Ω. Il numero due senza unità è invece il rapporto fra proposta e valore corretto, una quantità diversa dalla differenza.

Passaggi: R=4\,\Omega;  e=(8-4)\,\Omega;  e=4\,\Omega.

Distrattori: −4 Ω inverte l’ordine; 8 Ω copia la proposta e zero la accetta. Il rapporto puro due non porta l’unità della resistenza e non risponde alla domanda sullo scarto.

Hint: Calcola prima l’equivalente e poi conserva l’ordine della sottrazione.

Fonte canonica SHA256 843616111c3de52c0782d926b59dfb5184a326a88d7e941350a172f6d67d768c. Candidato SHA256 65da1a1b74633377ecee9fadc8c6b619598402c47eb5af5faea78ec5716ae2b5. Revisione indipendente e human NOT_RUN.

## AR-u6-identical-parallel-resistors-09 — Isolare il valore del ramo

N resistori ohmici identici, ciascuno di resistenza r>0 finita, sono collegati fra gli stessi due nodi A e B con fili ideali. La temperatura è fissata e il regime è stazionario. N è un intero positivo, anche N=1 è ammesso. La resistenza equivalente R è il coefficiente nella legge V_AB=RI_T: per V_AB non nulla, ogni ramo porta V_AB/r e I_T=N V_AB/r. Resta quindi R=r/N, anche come coefficiente al limite di tensione nulla. Fra prove possono cambiare r e N senza cambiare questa topologia. Sono noti R e N. Quale formula ricava r?

Procedimento d’autore: Partiamo da R=r/N. Moltiplicare per N>0 dà NR=r. Poiché N è adimensionale, il risultato mantiene Ω. La formula vale per ogni conteggio intero positivo, non soltanto per i tre rami dell’esempio.

Passaggi: RN=r;  r=NR;  [r]=\Omega.

Distrattori: R/N ripete la divisione invece di invertirla. N/R ha unità S, R−N sottrae grandezze incompatibili e N²R moltiplica per un fattore N in più. Con R=4 Ω e N=3, solo NR restituisce 12 Ω.

Hint: L’incognita è il numeratore di un quoziente noto.

Fonte canonica SHA256 872be07773a048625eb3bacb728b7d20b438fd8c0e246e1be4ad09f2aa7a9089. Candidato SHA256 539dae6425e790311d5554b68a5fcc11a0c7a591960441c4cf68a5756553ad29. Revisione indipendente e human NOT_RUN.

## AR-u6-identical-parallel-resistors-10 — Due fattori, conteggi ammessi

N resistori ohmici identici, ciascuno di resistenza r>0 finita, sono collegati fra gli stessi due nodi A e B con fili ideali. La temperatura è fissata e il regime è stazionario. N è un intero positivo, anche N=1 è ammesso. La resistenza equivalente R è il coefficiente nella legge V_AB=RI_T: per V_AB non nulla, ogni ramo porta V_AB/r e I_T=N V_AB/r. Resta quindi R=r/N, anche come coefficiente al limite di tensione nulla. Fra prove possono cambiare r e N senza cambiare questa topologia. B usa r_B=κ₁r_A e N_B=κ₂N_A. I fattori sono positivi; N_A e N_B sono interi positivi. Quanto vale R_B/R_A?

Procedimento d’autore: Sostituendo nella legge, R_B=(κ₁/κ₂)(r_A/N_A). Il rapporto cercato è κ₁/κ₂. Il fattore κ₂ non deve essere di per sé intero: basta che il prodotto κ₂N_A lo sia. Per esempio un passaggio da tre a cinque rami ha κ₂=5/3.

Passaggi: R_B=\frac{\kappa_1r_A}{\kappa_2N_A};  \frac{R_B}{R_A}=\frac{\kappa_1}{\kappa_2}.

Distrattori: Il prodotto rende diretto l’effetto del numero di percorsi. Il reciproco scambia B/A. I quadrati dei fattori non compaiono nella legge del parallelo identico. La positività non sostituisce il vincolo discreto sui due conteggi.

Hint: Scala il numeratore e il divisore separatamente, conservando N intero.

Fonte canonica SHA256 894a24ad8dc6aa3c6d7b6670f6af03a6303642f941bd17c8008e976d2b20b5aa. Candidato SHA256 c64cb5df747466dd8a31812e1af81bdfed848287a99dd0f8f29280bb45c6031d. Revisione indipendente e human NOT_RUN.

## AR-u6-identical-parallel-resistors-11 — Cambiano valore e numero

N resistori ohmici identici, ciascuno di resistenza r>0 finita, sono collegati fra gli stessi due nodi A e B con fili ideali. La temperatura è fissata e il regime è stazionario. N è un intero positivo, anche N=1 è ammesso. La resistenza equivalente R è il coefficiente nella legge V_AB=RI_T: per V_AB non nulla, ogni ramo porta V_AB/r e I_T=N V_AB/r. Resta quindi R=r/N, anche come coefficiente al limite di tensione nulla. Fra prove possono cambiare r e N senza cambiare questa topologia. A ha r=12 Ω e N=3; B ha r=15 Ω e N=5. Quanto vale R_B/R_A?

Procedimento d’autore: A dà 12/3=4 Ω; B dà 15/5=3 Ω. Il rapporto è 3/4. Il valore di ciascun resistore cresce, ma l’aggiunta di due rami prevale: l’equivalente diminuisce. I due conteggi sono entrambi interi positivi.

Passaggi: R_A=4\,\Omega;  R_B=3\,\Omega;  \frac{R_B}{R_A}=\frac34.

Distrattori: 4/3 è il reciproco. 5/4 segue soltanto r_B/r_A; 3/5 segue soltanto N_A/N_B; 25/12 moltiplica i due fattori diretti invece di dividere per quello del conteggio.

Hint: Calcola i due equivalenti oppure combina (15/12)/(5/3).

Fonte canonica SHA256 cbbd23eefc5e8f719df3f57f0de7841f7904bd6be05458e241f152e9632ca99b. Candidato SHA256 a791b40ac6ee997e528a9eebf51ab9db3dd41de8004ab4bbc6d438d14ba01a73. Revisione indipendente e human NOT_RUN.

## AR-u6-identical-parallel-resistors-12 — Media delle reti preparate

N resistori ohmici identici, ciascuno di resistenza r>0 finita, sono collegati fra gli stessi due nodi A e B con fili ideali. La temperatura è fissata e il regime è stazionario. N è un intero positivo, anche N=1 è ammesso. La resistenza equivalente R è il coefficiente nella legge V_AB=RI_T: per V_AB non nulla, ogni ramo porta V_AB/r e I_T=N V_AB/r. Resta quindi R=r/N, anche come coefficiente al limite di tensione nulla. Fra prove possono cambiare r e N senza cambiare questa topologia. A usa r=12 Ω e N=3; B usa r=15 Ω e N=5. Qual è la media aritmetica delle due R, con uguale peso?

Procedimento d’autore: Le uscite sono 4 e 3 Ω: la media è 7/2 Ω. Ai dati medi r=27/2 Ω e N=4, anch’esso conteggio ammissibile, si avrebbe invece (27/2)/4=27/8 Ω. La differenza fra media delle uscite e uscita ai dati medi è 1/8 Ω. Sono due domande distinte.

Passaggi: \overline R=\frac{4+3}{2}\,\Omega;  \overline R=\frac72\,\Omega;  R_{\rm dati\ medi}=\frac{27}{8}\,\Omega.

Distrattori: 27/8 Ω applica la legge ai dati medi. Sette Ω non dimezza la somma; un mezzo è metà della differenza; tre copia B. La media non rappresenta un collegamento in serie o in parallelo fra le due reti.

Hint: Calcola ogni uscita prima di applicare i pesi statistici.

Fonte canonica SHA256 5846a7296d70fc393287587dde2590857d2f93594e8a796332602e2cf7308996. Candidato SHA256 291517a5b652e1cbf7821b4447dd0f4ba38245e026cdad8423a3422d87d6e63e. Revisione indipendente e human NOT_RUN.

## AR-u6-identical-parallel-resistors-13 — Il conteggio per il bersaglio

N resistori ohmici identici, ciascuno di resistenza r>0 finita, sono collegati fra gli stessi due nodi A e B con fili ideali. La temperatura è fissata e il regime è stazionario. N è un intero positivo, anche N=1 è ammesso. La resistenza equivalente R è il coefficiente nella legge V_AB=RI_T: per V_AB non nulla, ogni ramo porta V_AB/r e I_T=N V_AB/r. Resta quindi R=r/N, anche come coefficiente al limite di tensione nulla. Fra prove possono cambiare r e N senza cambiare questa topologia. A ha r_A=12 Ω e N_A=3. B usa r_B=15 Ω e deve dare R_B=(3/4)R_A. Quanto vale N_B/N_A?

Procedimento d’autore: Il bersaglio è (3/4)·4=3 Ω. Da N_B=r_B/R_B si ottiene N_B=15/3=5, intero ammesso. Il rapporto con i tre rami iniziali è 5/3; un rapporto fra conteggi interi può essere frazionario.

Passaggi: R_B=3\,\Omega;  N_B=\frac{15}{3};  N_B=5;  \frac{N_B}{N_A}=\frac53.

Distrattori: 3/5 inverte il rapporto. 3/4 copia il bersaglio delle resistenze e 5/4 quello dei valori di ramo. Cinque è soltanto N_B: manca la divisione per N_A. Nessuno di questi rapporti sostituisce il controllo che N_B sia intero.

Hint: Ricava prima il numero finale, poi confrontalo con il numero iniziale.

Fonte canonica SHA256 4212e89d4f9a095c0b02f618e0b69a70f38e8abad6bd93b5000a52ba66a42bff. Candidato SHA256 0564842e031a7727dcd925bae839393e5043368e7b61f7105588e0c3ed838762. Revisione indipendente e human NOT_RUN.

## AR-u6-identical-parallel-resistors-14 — Dal display al singolo ramo

N resistori ohmici identici, ciascuno di resistenza r>0 finita, sono collegati fra gli stessi due nodi A e B con fili ideali. La temperatura è fissata e il regime è stazionario. N è un intero positivo, anche N=1 è ammesso. La resistenza equivalente R è il coefficiente nella legge V_AB=RI_T: per V_AB non nulla, ogni ramo porta V_AB/r e I_T=N V_AB/r. Resta quindi R=r/N, anche come coefficiente al limite di tensione nulla. Fra prove possono cambiare r e N senza cambiare questa topologia. D=a_cal R è un’uscita continua adimensionale, a_cal>0, senza offset. A con r=12 Ω e N=3 dà D=12. C dà D=9 e ha N=5. Quanto vale r_C in Ω?

Procedimento d’autore: Il riferimento ha R_A=4 Ω, perciò a_cal=12/(4 Ω)=3 Ω⁻¹. La nuova lettura dà R_C=9/(3 Ω⁻¹)=3 Ω. Il singolo ramo deve avere r_C=N_CR_C=5·3 Ω=15 Ω. D non conta rami e non è direttamente una resistenza.

Passaggi: a_{\rm cal}=3\,\Omega^{-1};  R_C=3\,\Omega;  r_C=5\cdot3\,\Omega;  r_C=15\,\Omega.

Distrattori: Quarantacinque Ω usa D come equivalente e dimentica il guadagno. Tre Ω copia l’equivalente anziché ricavare il ramo. 3/5 Ω divide per N invece di moltiplicare. Dodici Ω copia il riferimento senza usare la nuova lettura.

Hint: Rimuovi la taratura, poi inverti il parallelo.

Fonte canonica SHA256 134a724cc6e0f6eeaaa92decc29aa658083ebeb419d8556e5914e56ab7eaf18b. Candidato SHA256 bc60c7d4f96c46ab17317d016b954164c0daa118006837d22c349677feae7056. Revisione indipendente e human NOT_RUN.

## AR-u6-identical-parallel-resistors-15 — Il piccolo valore oltre l’offset

N resistori ohmici identici, ciascuno di resistenza r>0 finita, sono collegati fra gli stessi due nodi A e B con fili ideali. La temperatura è fissata e il regime è stazionario. N è un intero positivo, anche N=1 è ammesso. La resistenza equivalente R è il coefficiente nella legge V_AB=RI_T: per V_AB non nulla, ogni ramo porta V_AB/r e I_T=N V_AB/r. Resta quindi R=r/N, anche come coefficiente al limite di tensione nulla. Fra prove possono cambiare r e N senza cambiare questa topologia. D=a_cal R+b è continuo e adimensionale, a_cal>0. A: r=12 Ω, N=3, D=9. B: r=15 Ω, N=5, D=7. C: N=3, D=5. Quanto vale r_C?

Procedimento d’autore: I riferimenti hanno R_A=4 Ω e R_B=3 Ω. Guadagno a_cal=(9−7)/[(4−3) Ω]=2 Ω⁻¹ e b=1. C ha R_C=(5−1)/2 Ω=2 Ω. Con N_C=3 il valore di ogni ramo è r_C=3·2 Ω=6 Ω. L’offset va rimosso prima di dividere per il guadagno.

Passaggi: a_{\rm cal}=2\,\Omega^{-1};  b=1;  R_C=2\,\Omega;  r_C=6\,\Omega.

Distrattori: 15/2 Ω omette l’offset e ricostruisce D=6, non 5. Due Ω copia l’equivalente; quindici Ω ricostruisce D=11 e tre Ω ricostruisce D=3. Solo sei restituisce la lettura assegnata con tre rami.

Hint: Usa le due R di riferimento per trovare prima guadagno e offset.

Fonte canonica SHA256 1d97cd291ad5908b2ff8bbfb7e40b15a602659c54cf51b951ed587cf6d0f56f9. Candidato SHA256 80ba078948ccd240a6b6f428360b2d2cfc9d72683cba7d19ec122c1c74e1d51a. Revisione indipendente e human NOT_RUN.

## AR-u6-identical-parallel-resistors-16 — Una misura ridondante

N resistori ohmici identici, ciascuno di resistenza r>0 finita, sono collegati fra gli stessi due nodi A e B con fili ideali. La temperatura è fissata e il regime è stazionario. N è un intero positivo, anche N=1 è ammesso. La resistenza equivalente R è il coefficiente nella legge V_AB=RI_T: per V_AB non nulla, ogni ramo porta V_AB/r e I_T=N V_AB/r. Resta quindi R=r/N, anche come coefficiente al limite di tensione nulla. Fra prove possono cambiare r e N senza cambiare questa topologia. Fra preparazioni si impone r=βN, con β=4 Ω. Si misura inoltre R=4 Ω. Quante coppie (r,N) sono determinate?

Procedimento d’autore: Sostituendo il vincolo si ottiene R=βN/N=β=4 Ω per ogni N intero positivo. La misura non aggiunge un vincolo indipendente. Per N=1 si ha r=4 Ω; per N=2, r=8 Ω; per N=3, r=12 Ω, e così via. Le soluzioni sono infinite ma discrete nel conteggio, non tutti i valori reali di N.

Passaggi: r=\beta N;  R=\frac{\beta N}{N};  R=\beta;  R=4\,\Omega.

Distrattori: Le coppie singole sono esempi e non esauriscono l’insieme. Nessuna è falso perché ne abbiamo costruite tre. r e N non sono liberi indipendentemente: r deve crescere come 4 Ω per ciascun ramo aggiunto fra preparazioni.

Hint: Sostituisci il vincolo e verifica se la misura fissa ancora il conteggio.

Fonte canonica SHA256 f797f306f89b56dfc402f35900d47554ac1ad5ac7462a86a2f3fc623f3e85442. Candidato SHA256 5cd1fab7b951ad91a654f019d368c4467d6d6b9534bd3bdc59fb46a6f917909f. Revisione indipendente e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 bd0dadae8cf887aba7c06e3974f67b69551ef188c5037e5de05960d12e5bcc3e. Package file SHA256 3a57467bf31e60c8fd4513743f0d4ca4bef21c4f5ad6a81d642866bb43998218. Binding file SHA256 0fbf2baedb1f1e021fb9f294d60624c8d59a2a25914a89cd12caea01a5800f36. Prova strutturale SHA256 59e34249470239ede4e6776b95b79f2ea34747729ab79a49fdf266fae87a6dea. Asset-only manifest SHA256 d36f3fa7d0a872214a62cc3a6b211976254284810a899c5e4aabedd906d79dfc.

Le coordinate intrinseche dell’SVG documentano proporzioni geometriche nella sorgente, non una misura in pixel fisici dopo ridimensionamento. I testi visibili usano soltanto grandezze fisiche e valori pertinenti. Le origini e le etichette sono separate dagli assi; la direzione di ciascuna freccia è letta insieme alla sua didascalia.

## Tentativi precedenti conservati

Il primo import canonico è stato rifiutato perché il mio SVG conteneva uno style incorporato. Il controllo è rimasto invariato; ho sostituito lo style con attributi di presentazione equivalenti. Payload, binding e asset rifiutati sono archiviati con manifest. La prima anteprima nativa terminò con exit 0 ma era ritagliata per gli attributi intrinseci width/height: è conservata come prova negativa di completezza e non viene conteggiata come lettura integrale. Ho rimosso soltanto quei due attributi dalla radice, conservando viewBox e tutte le coordinate, e ho realmente ripetuto due assembly, import e rendering. Il PNG finale è stato visto per intero, fino alle barre e alla chiusura del terzo pannello. Nessun tentativo precedente è spacciato per replay UI del prodotto.

Le proporzioni intrinseche sono: pannello 2, larghezze 80 e 240 per 4 e 12 Ω (20 coordinate/Ω); pannello 3, larghezze 160, 120, 140 per 4, 3, 7/2 Ω (40 coordinate/Ω). Queste misure sono solo documentazione tecnica d’autore, non pixel fisici visibili allo studente.
