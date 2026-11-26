# cric-c1-l008 — autoria di dieci problemi distinti

Nuove edizioni degli ID Cric originali, senza produrre varianti Ardesia. Ogni problema è stato letto dal solo enunciato e risolto individualmente; nessuna chiave, opzione, soluzione, hint o figura originale è stata aperta per ricavarne la risposta.

Fonte Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, officina-di-fisica/content/C1.json, SHA 0a79b1212adbef650733d655d1de2d5ffd7af5eb2be2bde50710a0a1721ab0cf. Lezioni C1-L006–L010 effettive lette integralmente, con prerequisiti e contenuto reali. Famiglia, difficoltà, prerequisiti, identità, ordine, corso, skill ed eventuale flag exam sono conservati per ciascun ID. baseVersion è la versione individuale della fonte e version=baseVersion+1.

Primarie reciproche congelate prima dei candidati: B sui cinquanta A001–050 commit a157b41b, SHA 2e0ac86f9b57804387b68ccdcdbde945bed65b26ee5de6449323f25c3540707a; A sui cinquanta B051–100 commit 227d4a08, SHA 1abe1f80465386a32abc613e31dc2d6c8fc41d4a8f24a2e77aea025e2773b3d1. La primaria A è stata ricevuta solo come hash/percorso e non letta durante l’autoria.

Una sola pipeline: assemble_family originale esteso dal Root, non un nuovo importatore. Dipendenza esterna congelata {"commit": "23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5", "path": "officina-di-fisica/tools/corpus_engineering/vector_geometry_authoring.py", "sha256": "0062a1e8b70ca767818105fcf1204e983fe2ef08b06fa379a2d68d26456dc22c"}. Il file è copiato byte-esatto per riprodurre l’assembly locale e non attribuito a questa autoria. Due assembly identiche, importatore canonico con budget originale 60 s, SQLite temporaneo: dieci nuove edizioni DRAFT, poi zero nuove/dieci invariate; tutti i 991 pubblicati e i live head storici restano invariati.

Le tre operazioni effettive sono terminali 0/null signal sotto mutex e guardia ≥2 GiB. Il PNG nativo completo è stato aperto e letto dall’autore insieme all’XML: evidenza asset-only, non UI del prodotto. Nessuna review scientifica propria o approvazione umana; tutto DRAFT, SCI/UI prodotto/human NOT_RUN.

## C1-Q071 — Tornare alla configurazione iniziale

Versione 2, base 1; famiglia un-giro-chiuso; difficoltà 2.

Scelta del modello e procedura: Per una forza conservativa il lavoro fra due configurazioni è U_i−U_f. Alla fine di un percorso chiuso la configurazione e l’energia potenziale sono tornate al valore iniziale, quindi la differenza è zero. Il lavoro può essere diverso da zero su ciascun tratto: è la somma sull’intero giro a essere nulla.

Passaggi manuali: W_{\rm cons}=U_i-U_f;  U_f=U_i;  W_{\rm chiuso}=0

Risposta proposta: È nullo.

Confutazioni proposte: Un lavoro sempre positivo o sempre negativo non si annullerebbe invertendo il cammino. La lunghezza del percorso non ha unità di energia e la durata non entra nella differenza di potenziale per la forza conservativa assegnata.

## C1-Q072 — La quota da un aumento di potenziale

Versione 2, base 1; famiglia quota-di-una-piccola-sfera; difficoltà 2.

Scelta del modello e procedura: Nella differenza di potenziale il livello zero si elimina: ΔU=mgΔz. Il peso è 0,20·10=2 N; dividendo 3 J per 2 N ricavo Δz=3/2 m. Il segno positivo dell’aumento indica una salita e non assegna da solo la quota assoluta della sfera.

Passaggi manuali: \Delta U=mg\Delta z;  mg=2\,\mathrm N;  \Delta z=\frac{3\,\mathrm J}{2\,\mathrm N};  \Delta z=\frac32\,\mathrm m

Risposta proposta: 3/2 m.

Confutazioni proposte: Tre metri omette il peso di 2 N; sei moltiplica invece di dividere. 3/5 m non ricostruisce l’aumento di 3 J, mentre il valore negativo descriverebbe una discesa nel verso dell’asse scelto.

## C1-Q073 — L’energia cresce con il quadrato

Versione 2, base 1; famiglia confronto-fra-due-deformazioni; difficoltà 2.

Scelta del modello e procedura: Per una molla con k costante U=(1/2)kx². Nel rapporto fra le due energie si cancella k: rimane il quadrato del rapporto delle deformazioni. Converto 0,8 in 4/5 e uso (5/2)²=25/4; il prodotto dà 5 J. Poiché le due deformazioni sono nella stessa unità, non serve calcolare k per questo confronto.

Passaggi manuali: \frac{U_B}{U_A}=\left(\frac{x_B}{x_A}\right)^2;  \frac{U_B}{U_A}=\frac{25}{4};  U_B=\frac45\cdot\frac{25}{4}\,\mathrm J;  U_B=5\,\mathrm J

Risposta proposta: 5 J.

Confutazioni proposte: Due joule userebbe la dipendenza lineare da x anziché quella quadratica. Un’energia negativa non segue da una compressione, perché x² è positivo. Il valore 0,8 J ignorerebbe la nuova deformazione.

## C1-Q074 — Abbassare soltanto lo zero

Versione 2, base 1; famiglia spostare-il-livello-zero; difficoltà 2.

Scelta del modello e procedura: Il nuovo zero più in basso aumenta di 2 m entrambe le coordinate: z_i′=z_i+2 m e z_f′=z_f+2 m. Ciascun potenziale aumenta della stessa costante 2mg·m, ma la differenza finale meno iniziale non cambia. Il lavoro gravitazionale della stessa discesa resta quindi lo stesso.

Passaggi manuali: \Delta U=mg(z_f-z_i);  z_f^\prime-z_i^\prime=z_f-z_i;  \Delta U^\prime=\Delta U

Risposta proposta: Non cambia.

Confutazioni proposte: Due metri non sono due joule: per una variazione di energia servirebbe anche il peso. Cambiare il riferimento non annulla il dislivello fisico e non inverte il verso della discesa. Sono i valori assoluti di U a cambiare della stessa costante.

## C1-Q075 — Dal moto all’energia interna

Versione 2, base 1; famiglia quanta-energia-diventa-interna; difficoltà 2.

Scelta del modello e procedura: Scelgo come sistema sia il blocco sia il piano, così il trasferimento per attrito resta interno. La diminuzione di energia meccanica è 20−7=13 J; per l’isolamento, questa energia compare come aumento dell’energia interna complessiva. Non si può attribuire tutta la quota al solo blocco senza altri dati sulla ripartizione termica.

Passaggi manuali: \Delta K=7\,\mathrm J-20\,\mathrm J;  \Delta K=-13\,\mathrm J;  \Delta U_{\rm int}=-\Delta K;  \Delta U_{\rm int}=+13\,\mathrm J

Risposta proposta: 13 J.

Confutazioni proposte: Meno tredici è la variazione di energia cinetica, non quella interna. Sette è l’energia cinetica rimasta e venti quella iniziale; ventisette somma due stati invece di confrontarli. L’energia totale del sistema isolato non viene distrutta.

## C1-Q076 — Due piste, due tempi possibili

Versione 2, base 1; famiglia due-piste-senza-attrito; difficoltà 2.

Scelta del modello e procedura: Le reazioni ideali di una pista fissa sono perpendicolari allo spostamento e non compiono lavoro. Il bilancio fra cima e fondo dipende quindi solo dal dislivello comune: (1/2)mv_f²=mgΔh. Le due rapidità finali sono uguali, anche se la geometria può cambiare i tempi e le direzioni delle tangenti.

Passaggi manuali: \frac12mv_f^2=mg\Delta h;  v_f=\sqrt{2g\Delta h}

Risposta proposta: Il modulo della velocità al fondo.

Confutazioni proposte: Il tempo dipende dal moto lungo l’intera pista. La direzione finale dipende dalla tangente al fondo; normale e accelerazione dipendono anche dalla curvatura locale. L’uguaglianza di energia non le rende uguali.

## C1-Q077 — La salita lascia energia cinetica

Versione 3, base 2; famiglia un-oggetto-ancora-in-salita; difficoltà 2.

Scelta del modello e procedura: La crescita di potenziale riduce l’energia cinetica: dividendo il bilancio per la massa, v_f²=v_i²−2gΔh. Con i dati ottengo 25−16=9 m²/s²; scelgo la radice positiva perché si chiede una rapidità. La quota è raggiungibile, dato che resta energia cinetica positiva.

Passaggi manuali: \frac12v_f^2+g\Delta h=\frac12v_i^2;  v_f^2=(25-16)\,\mathrm{m^2/s^2};  v_f^2=9\,\mathrm{m^2/s^2};  v_f=3\,\mathrm{m/s}

Risposta proposta: 3 m/s.

Confutazioni proposte: Nove è il valore numerico del quadrato della rapidità, con unità diverse. Meno tre non è un modulo; cinque ignorerebbe la salita. Aggiungere 16 a 25 descriverebbe invece un guadagno di energia cinetica.

## C1-Q078 — Il giro non restituisce il lavoro d’attrito

Versione 3, base 2; famiglia una-forza-che-dipende-dal-cammino; difficoltà 1.

Scelta del modello e procedura: Durante ciascuno scorrimento l’attrito dinamico è opposto alla velocità relativa. Quando si inverte il moto si inverte anche la forza, così il prodotto scalare resta negativo: i due lavori non si cancellano. Su un percorso chiuso con scorrimento non nullo la somma è negativa, perciò non si può descrivere questo attrito con una sola energia potenziale di posizione.

Passaggi manuali: W_{A\to B}<0;  W_{B\to A}<0;  W_{\rm giro}<0

Risposta proposta: Non conservativo: compie lavoro negativo su entrambi i tratti.

Confutazioni proposte: Tornare allo stesso punto annulla il lavoro solo per una forza conservativa, non per qualunque forza. Il ritorno non elimina il contatto ruvido e non rende nullo l’attrito. Un potenziale di sola posizione darebbe invece differenza zero sul giro.

## C1-Q079 — Il lavoro motore deve coprire due costi

Versione 2, base 1; famiglia energia-necessaria-a-una-risalita; difficoltà 3.

Scelta del modello e procedura: La rapidità uguale agli estremi implica ΔK=0. Il lavoro del peso è −mgΔh=−60 J e quello dell’attrito −5 J. Il lavoro motore deve compensare entrambi: W_m−60−5=0, quindi W_m=65 J. La sola crescita di potenziale non coprirebbe la dissipazione aggiuntiva.

Passaggi manuali: \Delta K=0;  W_g=-mg\Delta h;  W_g=-60\,\mathrm J;  W_m-60\,\mathrm J-5\,\mathrm J=0;  W_m=65\,\mathrm J

Risposta proposta: 65 J.

Confutazioni proposte: Sessanta joule ignora l’attrito; cinquantacinque sottrae il costo dissipativo invece di aggiungerlo. Cinque considera solo l’attrito e zero confonde energia cinetica costante con lavori individuali nulli.

## C1-Q080 — Energia prima, forza radiale dopo

Versione 3, base 2; famiglia trovare-la-tensione-del-filo; difficoltà 3.

Scelta del modello e procedura: L’energia determina prima la rapidità al fondo: il calo mgh diventa (1/2)mv². Per trovare la tensione serve poi la seconda legge radiale, con verso positivo verso il centro: T−mg=mv²/ℓ. Ne segue T=mg(1+2h/ℓ). Il lavoro nullo della tensione non implica forza nulla; la geometria e il filo teso sono condizioni necessarie per applicare il modello.

Passaggi manuali: \frac12mv^2=mgh;  v^2=2gh;  T-mg=\frac{mv^2}{\ell};  T=mg\left(1+\frac{2h}{\ell}\right)

Risposta proposta: Ricavare v²=2gh con l’energia, poi usare T−mg=mv²/ℓ.

Confutazioni proposte: T=mg trascurerebbe l’accelerazione centripeta. T=mv²/ℓ attribuirebbe alla sola tensione la risultante senza sottrarre il peso; mgh è un’energia e non una forza. Lavoro nullo significa forza perpendicolare al moto, non necessariamente forza nulla.
