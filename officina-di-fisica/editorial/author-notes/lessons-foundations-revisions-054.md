# Due nuove lezioni, fonte storica preservata

Autore root; fonteCric5d1dc8dc/C1.json, C1-L002 e C1-L003 lette integralmente.
Le versioni1 restano pubblicate; si preparano versioni2/base1 senza answerkey.
Il revisore distinto ha classificato L002P2 per segno della proiezione e L003P3
per gli estremi nulli descritti impropriamente come positivi. Non si attribuisce
al secondo caso un errore nella direzione del moto o nella formula della velocità.

L002 distingue concordi/discordi, proiezione con segno/modulo, prodotti scalare e
vettoriale e vettori nulli. I controlli0,π/2,π sono esatti; esempio3–4–5 distinto
dalla figura originale, nessuna inversa trigonometrica decimale richiesta. Formule
scisse in blocchi per piccoli schermi. La nuova figura ha tre pannelli alla stessa
scala120px per unità: origini coincidenti e frecce con punta in entrambi i versi.
Un primo rendering dell'autore aveva mostrato che marker-end su un path composto
compariva solo nell'ultimo sottopercorso: separati i path prima della consegna.
Riletto il rendering finale, ora tutte le frecce sono effettivamente rappresentate.

L003 conserva entrambi i grafici storici, letti inXML e rendering: sono esplicitamente
esempi di moti diversi. Il primo dà spostamento2m,distanza10m e pendenze3,0,−2m/s.
Il secondo dà area18m, velocità media3m/s e accelerazioni2/−2m/s² nei due tratti;
accelerazione media0 e vertice non derivabile a3s sono distinti dall'immobilità.
Gli estremi v=0 e la positività interna sono espliciti. Tutti i conti sono frazioni,
prodotti piccoli, aree di triangoli; nessuna approssimazione numerica richiesta.

Controlli autore: import2nuovebozze, ripetizione0scritture/2invariate e991pubblicati/
live/storico invariati inSQLite temporaneo. Le prime6anteprime passavano già; dopo
il fix preventivo della figura si eseguono nuovamente6casi1440/768/320. Revisione
indipendente e approvazione umana NOT_RUN alla consegna, nessuna pubblicazione.

Due finding prima del freeze del reviewer: lo splitter delle uguaglianze non è
adatto a elenchi di più assegnazioni separati da virgola/quad o da condizioni
α=0. Quei passaggi sono ora formule autonome esplicite o condizioni in prosa;
nessuna falsa catena resta nel candidato. Una scansione di tutti i blocchi formula
dei640quesiti registrati non ha trovato analoghi pattern virgola-quad/colon-quad:
non si estende il finding a record senza evidenza concreta. Le tre figure storiche
sono ora incluse nel pacchetto come copie byte-identiche daGit5d1d, con hashasset e
binding per ogni figura; gli originali statici restano invariati. Il collegamento
/asset consente anche l'isolamento della bozza e il controllo stretto delle figure
nel contratto della review. Nuovi import e6anteprime sul pacchetto finale.

Ultimo collaudo:6/6 PASS terminale sullo strumento che raggiunge ogni immagine
lazy prima di decodificarla. Due run precedenti si sono fermati sull'immagine sotto
fold e sono stati abortiti con i soli processi root identificati: non sono PASS.
Il registro delle immagini, i checksum e il timeout restano controllati per ogni
figura; nessun file statico originale o impostazione globale del browser è cambiato.
