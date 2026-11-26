# Revisione indipendente cric-c1-l002

Dieci problemi distinti: primaria prompt-only di tutti i cinquanta A congelata in a157b41b, SHA 2e0ac86f9b57804387b68ccdcdbde945bed65b26ee5de6449323f25c3540707a; modello realmente eseguito prima dei candidati in 7a2a3784421f346b4784a581e275760a623b4adf, SHA f7e59ee2a8652933cccd27248b6798c5a6a75c66c8f9f111efe81b20a10fd88c. Le due funzioni originali del modello restano identiche nell’AST. Nessuna chiave originale o candidata ha fornito la derivazione primaria.

Tutti i dieci record finali f7b7abe30068318bbaefef8eb2a137b96da60a41 letti integralmente: prompt, risposte, opzioni, hint, passaggi, formule e feedback; lezione reale C1-L002 al pin Cric e prerequisiti letti. Ciascuna famiglia, difficoltà, versione e flag exam originale è preservata e controllata anche dopo retoken ostile.

XML e nuovo PNG indipendente640×1740 letti per intero. Forza12N da(335,400) a(215,192.154): scala comune20coordinate/N, componente orizzontale−6N lunga120, seconda componente6√3N lunga207.846. Nel piano posizioni, scala40/m sui due assi: A(2,−3),B(5,1), differenza(3,4), diagonale200coordinate=5m. Filo2,4m inclinato30° dalla verticale: cateti138.564 e240, ipotenusa277.128, proiezione orizzontale1,2m nella stessa scala. Testi e angoli leggibili, nessun taglio o contatto residuo rilevato.

Il decoder canonico conserva i lessemi decimali e la virgola viene normalizzata senza float binari. Le opzioni numeriche sono controllate con dimensioni e segni; eventuali concetti restano AI_CONCEPTUAL, separati dall’oracolo esatto. Le controprove rinnovano candidati, binding, token e pin di test senza alterare le firme definitive. Nessuna importazione del modulo autore.

Resa nativa soltanto asset-only: vera conclusione 0 e lettura integrale. Nessuna UI prodotto o approvazione umana; tutto DRAFT e human NOT_RUN. Il manifest Git con snapshot verbatim conserva il modello storico per CI.

## C1-Q011

Ipotesi: Forza di modulo12 N, angolo orientato120° da+x, assi cartesiani ortonormali. Si chiede una componente con segno.

Derivazione manuale: La componente orizzontale è 12 cos120°=−6 N. Il segno segue il secondo quadrante; 6√3 N è la componente verticale positiva, non quella richiesta.

Distrattori: +6 N omette il segno del coseno;−12 N non proietta;6√3 N usa la componente verticale;zero impone un angolo retto non assegnato.

Didattica: Angolo orientato e proiezione con segno distinti dal modulo della forza.

Modalità distinta: EXACT_ORACLE; esito True. Firma fead61e3514f999a58af0097706eb5df243b80b3a2a86d6bb77850fc12b7217d.

## C1-Q012

Ipotesi: Due spostamenti successivi collineari:7 m a ovest e11 m a est; est scelto positivo, nessuna richiesta di distanza cumulativa.

Derivazione manuale: Con est positivo, Δx=−7+11=+4 m. Il risultato è a est. La distanza percorsa è invece 7+11=18 m; quattro a ovest avrebbe componente negativa.

Distrattori: 18 m somma le lunghezze;4 m a ovest inverte il verso;zero suppone erroneamente uguali tratte;7 m copia la prima tratta.

Didattica: Spostamento orientato e distanza percorsa confrontati esplicitamente.

Modalità distinta: EXACT_ORACLE; esito True. Firma 30313a76e581e53be440065bd2c2785a661e1648cba9ad725d34479278111e16.

## C1-Q013

Ipotesi: Posizioni A=(2,−3)m,B=(5,1)m nello stesso riferimento e nella stessa base. Differenza finale meno iniziale, non somma di posizioni.

Derivazione manuale: B−A=(5−2,1−(−3))=(3,4) m: il modulo è 5 m per Pitagora. L’errata differenza (3,−2) avrebbe √13 m; la somma (7,−2) avrebbe √53 m.

Distrattori: √13 m appartiene all’errata differenza(3,−2),√53 m alla somma(7,−2);3 e4 sono solo componenti.

Didattica: Differenza di coordinate seguita da triade3–4–5; errore della componente y ricalcolato prima del freeze finale.

Modalità distinta: EXACT_ORACLE; esito True. Firma 8673168ad03b34acc802ecdfbf97a7c5974910fde5c5dea5a78847cd941ec7a8.

## C1-Q014

Ipotesi: Due vettori entrambi non nulli, prodotto scalare euclideo zero. Nessuna ipotesi di forza o lavoro necessaria.

Derivazione manuale: Con moduli non nulli, A·B=ab cosθ=0 impone cosθ=0 e angolo90°. Il vincolo non nullo evita il vettore zero, che non definisce una direzione.

Distrattori: Paralleli concordi danno ab>0, discordi−ab<0. Un angolo non definito richiederebbe un vettore nullo, escluso.

Didattica: Ipotesi non nullo necessaria prima di dedurre l’ortogonalità.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma b16b3b0dab958014c9ec0a011e49970244a77d767e00c24a517ffc7d803af5b0.

## C1-Q015

Ipotesi: Base ortonormale destrorsa assegnata, ordine e_x poi e_y mantenuto. Operazione vettoriale distinta dal prodotto scalare.

Derivazione manuale: Nella base ortonormale destrorsa e_x×e_y=e_z. Scambiare i fattori inverte il segno; il prodotto vettoriale è ortogonale al piano e non è uno scalare.

Distrattori: −z corrisponde all’ordine invertito;±x,±y restano nel piano e non possono essere ortogonali a entrambi i fattori.

Didattica: Base destrorsa e ordine dei fattori motivano il verso.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma dd1e574be1945e37de40744ec0d8b0fecbd939e5ee480bc5cde6b8efb4871815.

## C1-Q016

Ipotesi: Filo rettilineo teso lungo2,4 m, inclinato30° rispetto alla verticale. Proiezione orizzontale come modulo positivo.

Derivazione manuale: Il filo fa30° con la verticale: lo spostamento orizzontale è ℓsin30°=(12/5)(1/2)=6/5 m. Il coseno darebbe la proiezione verticale,6√3/5 m.

Distrattori: 1,2√3 m è la proiezione verticale;2,4 m è tutta la fune;4,8 m e0,8 m non sono il cateto orizzontale a30°.

Didattica: Angolo rispetto alla verticale: scelta del seno spiegata prima dei numeri.

Modalità distinta: EXACT_ORACLE; esito True. Firma b1741f6bff8eccd0b3cf8d4865f60a20698a0e077e9f75a91a03a1732d538759.

## C1-Q017

Ipotesi: Moduli dei due vettori fissati e strettamente positivi, angolo libero fra0 eπ; si massimizza il prodotto scalare.

Derivazione manuale: A moduli positivi fissi, A·B=ab cosθ raggiunge ab per cosθ=1: paralleli concordi. Antiparalleli danno−ab, perpendicolari0.

Distrattori: Perpendicolari producono0, antiparalleli−ab; l’uguaglianza dei moduli non è richiesta e non fissa l’angolo.

Didattica: Massimo del coseno nel dominio fisico, senza condizioni superflue sui moduli.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma cac5b506644400075c15deb293c03d700d7dee973e732b05806f245ff23addfb.

## C1-Q018

Ipotesi: Geometria rettangola con cateto verticale0,45 m e orizzontale3 m: rapporto tangente adimensionale.

Derivazione manuale: La tangente del piccolo angolo geometrico è0,45/3=45/300=3/20, numero puro. Non si chiede né l’angolo in gradi né il rapporto inverso20/3.

Distrattori: 20/3 inverte i cateti;3/2,9/20 e3/5 non ricostruiscono il rapporto0,45/3.

Didattica: Decimale trasformato in frazione esatta e unità cancellate.

Modalità distinta: EXACT_ORACLE; esito True. Firma 0957776518b11d24d30ede4b77773ac250acc5b61b936e118d60b917ea506f38.

## C1-Q019

Ipotesi: Forza costante(3,4)N e spostamento(2,−1)m nella stessa base ortonormale; lavoro della sola forza assegnata.

Derivazione manuale: Il prodotto scalare è3·2+4·(−1)=6−4=2 N·m=2 J. Il prodotto dei soli moduli ignorerebbe l’angolo e la componente negativa dello spostamento.

Distrattori: 10 J somma moduli dei contributi6 e4;5√5 J usa il prodotto dei moduli senza coseno;−2 J inverte il segno;6 J omette la componente y.

Didattica: Prodotto scalare come lavoro con controllo N·m=J.

Modalità distinta: EXACT_ORACLE; esito True. Firma 28e230a6bbeccbff4ca0df8788cd25558b34403e1c77d2c3fbce3548bb7d3c60.

## C1-Q020

Ipotesi: Componenti x e y uguali e negative, angolo antiorario misurato da+x e intervallo0≤θ<360°.

Derivazione manuale: Le due componenti uguali negative individuano il terzo quadrante. L’angolo di riferimento45° dà180°+45°=225° nel dominio[0°,360°);45° ha componenti positive.

Distrattori: 45° ha entrambi segni positivi;135° ha y positivo;315° ha x positivo;180° ha componente y nulla anziché negativa.

Didattica: Quadrante risolto dai segni prima dell’angolo notevole.

Modalità distinta: EXACT_ORACLE; esito True. Firma ff121a5bfd3038b07db67f30443610e6673e0d62baafeed54fea276c404216a1.
