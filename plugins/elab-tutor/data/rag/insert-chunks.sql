-- ELAB RAG Chunks — Auto-generated
-- Esegui in Supabase SQL Editor


-- Step 1: Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Create table
CREATE TABLE IF NOT EXISTS volume_chunks (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    volume      INTEGER NOT NULL,
    chapter     TEXT NOT NULL,
    section     TEXT,
    content     TEXT NOT NULL,
    page_number INTEGER,
    token_count INTEGER,
    embedding   vector(3072),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON volume_chunks
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);
CREATE INDEX IF NOT EXISTS idx_chunks_volume ON volume_chunks(volume);

-- Step 4: Create search function
CREATE OR REPLACE FUNCTION search_chunks(
    query_embedding vector(3072),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 3
)
RETURNS TABLE (
    id UUID,
    volume INTEGER,
    chapter TEXT,
    section TEXT,
    content TEXT,
    page_number INTEGER,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        vc.id,
        vc.volume,
        vc.chapter,
        vc.section,
        vc.content,
        vc.page_number,
        1 - (vc.embedding <=> query_embedding) AS similarity
    FROM volume_chunks vc
    WHERE 1 - (vc.embedding <=> query_embedding) > match_threshold
    ORDER BY vc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Step 5: Insert chunks (senza embeddings — troppo grandi per SQL diretto)
-- Usa lo script Python con SUPABASE_SERVICE_KEY per caricare embeddings

INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'Volume 1', 'ESPERIMENTO 3', 'LABORATORIO DI ELETTRONICA
I M P A R A E S P E R I M E N TA
VOLUME 1
ELAB
COS’È IL DIODO LED?
ESPERIMENTO 3
Per rendere il led più luminoso, ci basta partire dal circuito che abbiamo
realizzato! Basta cambiare il resistore da 470 Ohm con uno da 220 Ohm!
Ti ricordi i colori delle resistenze?
Con un resistore più basso, passa più corrente quindi il LED si illumina di più.
Rendiamo il LED meno luminoso
Per rendere il led meno luminoso, ci basta partire dal circuito che abbiamo
realizzato! Basta cambiare il resistore da 220 Ohm con uno da 1 kOhm!
Ti ricordi i colori?
Prova ora a cambiare il valore del resistore, ma NON scendere mai sotto
i 100 Ohm.
Laboratorio di elettronica: Impara e sperimenta 33
© 2025 ELAB. Tutti i diritti riservati.
Nessuna parte di questo libro può essere riprodotta o distribuita in qualsiasi forma o con qualsiasi
mezzo, elettronico o meccanico, senza il permesso scritto dell''autore.', 1, 228);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'Capitolo 1', NULL, 'Indice
Capitolo 1 - La Storia dell’Elettronica: Un Viaggio nel Tempo ................................. 05
Capitolo 2 - Le grandezze elettriche e la legge di Ohm ......................................... 09
Capitolo 3 - Cos’è un resistore? ........................................................................... 13
Capitolo 4 - Cos’è la breadboard? ........................................................................ 21
Capitolo 5 - Cosa sono le batterie? ....................................................................... 25
Capitolo 6 - Cos’è il diodo LED? ............................................................................ 27
Capitolo 7 - Cos’è il LED RGB? ............................................................................... 35
Capitolo 8 - Cos’è un pulsante? ........................................................................... 43
Capitolo 9 - Cos’è un potenziometro? ................................................................... 57
Capitolo 10 - Cos’è un fotoresistore ..................................................................... 81
Capitolo 11 - Cos’è un cicalino? ............................................................................ 93
Capitolo 12 - L’interruttore magnetico ................................................................. 97
Capitolo 13 - Cos’è l’elettropongo? ..................................................................... 103
Capitolo 14 - Costruiamo il nostro primo robot .................................................... 107
Non è finita qui! ................................................................................................... 112
COMPONENTI DEL KIT
• 1x Breadboard 830 punti
• Cavi di differenti lunghezze
• 1x Clip Batteria intestata con header
• Resistori 4 Bande:
10x 100 Ohm
10x 220 Ohm
10x 330 Ohm
10x 470 Ohm
10x 1 kOhm
• LEDs:
5x Blu
5x Rosso
5x Verde
5x Giallo
5x Bianco
5x RGB catodo comune
• 5x Pulsanti
• 3x Trimmer con alberino 10 kOhm
• 3x Fotoresistore 10 kOhm', 3, 499);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'Capitolo 1', NULL, '• 1x Cicalino
• 1x Interruttore Magnetico + 1x Magnete
• 1x Robot ELAB
4 Laboratorio di elettronica: Impara e sperimenta', 4, 30);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 1', NULL, 'CAPITOLO 1
LA STORIA DELL’ELETTRONICA:
UN VIAGGIO NEL TEMPO
Riesci ad immaginare un mondo senza computer,
senza smartphone, telefono, videogiochi o televisori?
Quasi sicuramente la tua risposta è no, ma come ben saprai
cento anni fa tutto ciò non esisteva.
Gli apparecchi succitati, e che rientrano ormai nella nostra
routine quotidiana, sono frutto di ricerca e ingegno di grandi
scienziati, molti dei quali orgogliosamente italiani.
L’Elettronica di cui disponiamo è nata solo nell’ultimo Secolo.
Vediamo come tutto è iniziato! REV
I PRIMI PASSI: L’ELETTRICITÀ
E I SEGRETI DELLA NATURA
La storia dell’Elettronica inizia con la nascita della prima
batteria. Lo scienziato italiano Alessandro Volta ne costruì il
primo esemplare che ne ereditò il suo nome “pila di Volta”.
Questa invenzione dimostrò che si poteva creare energia
elettrica in modo controllato. Alessandro Volta diede il via ad
altre scoperte poiché, altri scienziati incuriositi dalla sua
ricerca cominciarono ad approfondire il tema. Michael
Faraday, scoprì infatti che si poteva generare elettricità con il
movimento dando vita così al principio del generatore
elettrico.
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 5', 5, 309);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 1', NULL, 'CAPITOLO 1
NASCE L’ELETTRONICA: I PRIMI CIRCUITI L’ERA DEI TRANSISTOR:
PIÙ PICCOLO, PIÙ POTENTE
Intorno alla fine del 1800 la lampadina
di Thomas Edison aprì la strada ad Quarantatré anni dopo il mondo fu
una nuova fase. Con l’invenzione di segnato da una nuova invenzione. Era
Edison, infatti, ebbe inizio l’era 1947 quando un oggetto riuscì a
dell’energia elettrica che di lì a poco stravolgere la vita di tutti: nacque il
illuminò tutte le città. La curiosità transistor. Più piccolo, economico e
spinse ricercatori e studiosi a pensare resistente delle valvole, iI transistor
che l''elettricità potesse essere consentì di costruire radio, televisori e
utilizzata non solo per illuminare, ma computer dalle dimensioni ridotte e
per trasmettere anche suoni e segnali. più potenti. Immagina che ora il tuo
Poco dopo, più precisamente nel nel computer occupa parte della scrivania
1904, si segnò la grande svolta grazie della tua stanza, addirittura il posto in
alla scoperta della valvola termoionica, uno zainetto se trattasi di un personal
una sorta di “interruttore elettronico” computer, i primi computer, come ad
che era in grado di controllare le esempio l’ENIAC, occupavano intere
correnti elettriche. Fu proprio questa stanze e consumavano alte quantità di
invenzione a dare il via alla nascita energia. Ecco che grazie all''invenzione
delle prime radio: si scoprì così che era dei transistor, i computer iniziarono a
possibile ascoltare notizie e musica a diventare più accessibili.
distanza.
6 Laboratorio di elettronica: Impara e sperimenta
LA STORIA DELL’ELETTRONICA: UN VIAGGIO NEL TEMPO
L’INVENZIONE DEI MICROCHIP
Negli anni Sessanta i transistor
furono miniaturizzati e montati
insieme su piccole schede chiamate
‘microchip’. Con l’assemblaggio
di numerosi microchip si arrivò
alla nascita dei moderni computer,
dei telefoni cellulari e di tante altri
piccoli e grandi apparecchi
elettronici che usiamo ogni giorno.
La storia dell’Elettronica è fatta di', 6, 491);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 1', NULL, 'scoperte geniali e di invenzioni
sorprendenti che hanno cambiato la
vita di ognuno di noi.
E se un giorno fossi proprio tu ad
inventare qualcosa di straordinario
che cambierà, semplificherà o
salverà la vita delle persone?
Te lo sei mai chiesto? L’elettronica
potrebbe appassionarti così tanto
da stimolarti a tal punto da voler
dare il tuo contributo al mondo.
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 7
NOTE
8 Laboratorio di elettronica: Impara e sperimenta', 7, 128);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 2', NULL, 'CAPITOLO 2
LE GRANDEZZE ELETTRICHE
E LA LEGGE DI OHM
Per descrivere il fenomeno TENSIONE (VOLT)
dell’elettricità usiamo tre grandezze
principali: Immagina una pompa d’acqua che
spinge l’acqua attraverso un tubo.
(cid:3282)(cid:5) (cid:57)(cid:74)(cid:83)(cid:88)(cid:78)(cid:84)(cid:83)(cid:74)(cid:5)(cid:13)(cid:59)(cid:84)(cid:81)(cid:89)(cid:14)
(cid:3282)(cid:5) (cid:40)(cid:84)(cid:87)(cid:87)(cid:74)(cid:83)(cid:89)(cid:74)(cid:5)(cid:13)(cid:38)(cid:82)(cid:85)(cid:74)(cid:87)(cid:74)(cid:14) (cid:3282)(cid:5) La tensione è come la (cid:75)(cid:84)(cid:87)(cid:95)(cid:70)
(cid:3282)(cid:5) (cid:55)(cid:74)(cid:88)(cid:78)(cid:88)(cid:89)(cid:74)(cid:83)(cid:95)(cid:70)(cid:5)(cid:13)(cid:52)(cid:77)(cid:82)(cid:14) con cui la pompa spinge l’acqua. (cid:3282)(cid:5)
Più alta è la tensione, più
Queste unità di grandezza sono forte è la spinta e quindi più
come gli ingredienti di una ricetta. acqua
Zucchero, uova e farina da soli (corrente) può fluire.
servono a poco, ma insieme danno
vita a golose torte. Ecco che, la
TENSIONE, la CORRENTE e la
RESISTENZA messe insieme
lavorano per far funzionare
l’elettricità.
Per capire meglio immaginiamo un
sistema di tubi pieni d’acqua.
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 9', 9, 323);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 2', NULL, 'CAPITOLO 2
Per esempio, se hai una cascata RESISTENZA (OHM)
alta, l’acqua cade con più energia,
proprio come una batteria con alta
Ora pensa al tubo stesso:
tensione spinge più forte
l’elettricità. CORRENTE (AMPERE (cid:3282)(cid:5) La (cid:87)(cid:74)(cid:88)(cid:78)(cid:88)(cid:89)(cid:74)(cid:83)(cid:95)(cid:70) è come il (cid:73)(cid:78)(cid:70)(cid:82)(cid:74)(cid:89)(cid:87)(cid:84)(cid:5)
(cid:73)(cid:74)(cid:81)(cid:5)(cid:89)(cid:90)(cid:71)(cid:84).
(cid:3282)(cid:5) Un tubo stretto rende difficile il
passaggio dell’acqua, mentre
La corrente è come il (cid:1835)(cid:90)(cid:88)(cid:88)(cid:84)(cid:5)(cid:73)(cid:1123)(cid:70)(cid:72)(cid:86)(cid:90)(cid:70)
un tubo largo la lascia scorrere
che scorre attraverso il tubo.
facilmente.
(cid:3282)(cid:5) Allo stesso modo, nei circuiti
(cid:3282)(cid:5) È la quantità di acqua che passa
elettrici, i materiali con alta
ogni secondo, proprio come
resistenza rallentano il flusso
la corrente è la quantità di
della corrente.
elettroni che fluiscono in un
circuito.
Esempio: una cannuccia stretta
(cid:3282)(cid:5) Se la pompa spinge più forte (più
tensione), può fluire più oppone più resistenza al passaggio
acqua e quindi aumenta dell’acqua rispetto a un tubo largo.
la corrente.
10 Laboratorio di elettronica: Impara e sperimenta
LE GRANDEZZE ELETTRICHE E LA LEGGE DI OHM
LA LEGGE DI OHM: COME SONO LEGATE?
La relazione tra queste tre grandezze
è illustrata dalla Legge di Ohm:
(cid:59)(cid:34)(cid:46)(cid:3282)
(cid:3282)(cid:5) V è la tensione (in Volt),
(cid:3282)(cid:5) I è la corrente (in Ampere),
(cid:3282)(cid:5) (cid:53)(cid:74)(cid:87)(cid:5)(cid:89)(cid:87)(cid:84)(cid:91)(cid:70)(cid:87)(cid:74)(cid:5)(cid:81)(cid:70)(cid:5)(cid:89)(cid:74)(cid:83)(cid:88)(cid:78)(cid:84)(cid:83)(cid:74)(cid:5)(cid:13)(cid:59)(cid:14)(cid:31) Copri
(cid:81)(cid:70)(cid:5)(cid:1126)(cid:59)(cid:1127)(cid:19)(cid:5)(cid:55)(cid:78)(cid:82)(cid:70)(cid:83)(cid:74) (cid:46)(cid:5)(cid:131)(cid:5)(cid:55). Quindi la', 10, 495);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 2', NULL, '(cid:3282)(cid:5) (cid:55)(cid:5)(cid:2316)(cid:5)(cid:81)(cid:70)(cid:5)(cid:87)(cid:74)(cid:88)(cid:78)(cid:88)(cid:89)(cid:74)(cid:83)(cid:95)(cid:70)(cid:5)(cid:13)(cid:78)(cid:83)(cid:5)(cid:52)(cid:77)(cid:82)(cid:5)(cid:84)(cid:5)(cid:569)(cid:14)(cid:19)
Tensione è uguale alla Corrente
moltiplicata per la Resistenza.
Ricorriamo all''esempio
dell’acqua: (cid:3282)(cid:5) (cid:53)(cid:74)(cid:87)(cid:5)(cid:89)(cid:87)(cid:84)(cid:91)(cid:70)(cid:87)(cid:74)(cid:5)(cid:81)(cid:70)(cid:5)C(cid:84)(cid:87)(cid:87)(cid:74)(cid:83)(cid:89)(cid:74)(cid:5)(cid:13)(cid:46)(cid:14)(cid:31) Copri
(cid:81)(cid:70)(cid:5)(cid:1126)(cid:46)(cid:1127)(cid:19)(cid:5)(cid:55)(cid:78)(cid:82)(cid:70)(cid:83)(cid:74)(cid:5)(cid:59)(cid:5)(cid:137)(cid:5)(cid:55). Quindi la
Corrente è uguale alla
(cid:3282)(cid:5) Se vuoi più acqua (corrente)
attraverso un tubo stretto (alta Tensione divisa per la
resistenza), devi spingere più forte Resistenza.
(tensione più alta). (cid:3282)(cid:5) (cid:53)(cid:74)(cid:87)(cid:5)(cid:89)(cid:87)(cid:84)(cid:91)(cid:70)(cid:87)(cid:74)(cid:5)(cid:81)(cid:70)(cid:5)(cid:87)(cid:74)(cid:88)(cid:78)(cid:88)(cid:89)(cid:74)(cid:83)(cid:95)(cid:70)(cid:5)(cid:13)(cid:55)(cid:14)(cid:31)
(cid:3282)(cid:5) Se il tubo è largo (bassa (cid:40)(cid:84)(cid:85)(cid:87)(cid:78)(cid:5)(cid:81)(cid:70)(cid:5)(cid:1126)(cid:55)(cid:1127)(cid:19)(cid:5)(cid:55)(cid:78)(cid:82)(cid:70)(cid:83)(cid:74)(cid:5)(cid:59)(cid:5)(cid:137)(cid:5)(cid:46). Quindi
resistenza), puoi far fluire più la Resistenza è uguale alla
acqua senza aumentare la forza Tensione divisa per la Corrente.
della pompa (tensione). Immaginiamo una torcia elettrica:
(cid:3282)(cid:5) La batteria ha una T(cid:74)(cid:83)(cid:88)(cid:78)(cid:84)(cid:83)(cid:74)(cid:5)(cid:13)(cid:59)(cid:14) di 6V
IL TRIANGOLO DI OHM', 11, 454);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 2', NULL, '(cid:3282)(cid:5) La lampadina ha una R(cid:74)(cid:88)(cid:78)(cid:88)(cid:89)(cid:74)(cid:83)(cid:95)(cid:70)(cid:5)(cid:13)(cid:55)(cid:14) (cid:73)(cid:78)(cid:5)(cid:23)(cid:569)
Per trovare quanta Corrente ((cid:46)) passa nella
Il (cid:89)(cid:87)(cid:78)(cid:70)(cid:83)(cid:76)(cid:84)(cid:81)(cid:84)(cid:5)(cid:73)(cid:78)(cid:5)(cid:52)(cid:77)(cid:82) è un modo
lampadina usiamo il triangolo:
semplice per ricordare la relazione
tra tre grandezze fondamentali
dell’elettricità: T(cid:74)(cid:83)(cid:88)(cid:78)(cid:84)(cid:83)(cid:74)(cid:5)(cid:13)(cid:59)(cid:14),
Corrente (cid:13)(cid:46)(cid:14) e R(cid:74)(cid:88)(cid:78)(cid:88)(cid:89)(cid:74)(cid:83)(cid:95)(cid:70)(cid:5)(cid:13)(cid:55)(cid:14)
(cid:46)(cid:34)(cid:59)(cid:137)(cid:55)(cid:34)(cid:27)(cid:59)(cid:137)(cid:23)(cid:569)(cid:34)(cid:24)(cid:38)
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 11
NOTE
12 Laboratorio di elettronica: Impara e sperimenta', 11, 248);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 3', NULL, 'CAPITOLO 3
COS’È UN RESISTORE?
Un resistore è un componente che va (le lucine colorate). I resistori -
montato sui circuiti elettrici e serve a chiamati erroneamente resistenze,
controllare il passaggio dell’elettricità. hanno il ruolo di guardiani nei circuiti:
Immaginalo come un autovelox aiutano a mantenere tutto al sicuro e a
installato su una strada: la sua far funzionare le cose al meglio!
presenza aiuta a controllare la Piccola curiosità: la resistenza è la
velocità delle auto (in questo caso proprietà (cid:1834)(cid:88)(cid:78)(cid:72)(cid:70)(cid:5)dei resistori, non
l’elettricità) affinché non spingano cadiamo in questa confusione!
troppo sull’acceleratore!
COME LO DISEGNIAMO?
Come tutti i componenti elettronici
i resistori hanno un loro simbolo che
viene utilizzato in disegni tecnici
chiamati schemi elettrici. Nel caso del
resistore il simbolo può essere uno dei
A COSA SERVE UN RESISTORE? due (cid:73)(cid:74)(cid:81)(cid:81)(cid:70)(cid:5)(cid:1834)(cid:76)(cid:90)(cid:87)(cid:70)(cid:5)(cid:88)(cid:84)(cid:89)(cid:89)(cid:84)
I resistori aiutano a tenere sotto
controllo la quantità di elettricità
che attraversi i circuiti. E'' un
compito di grande responsabilità
affinché non si danneggino i
componenti delicati come i LED
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 13', 13, 337);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 3', NULL, 'CAPITOLO 3
Sul resistore si utilizza il simbolo a
zig-zag che ha sempre tre punte (cid:30)(cid:5)(cid:72)(cid:84)(cid:81)(cid:84)(cid:87)(cid:78)(cid:5)(cid:73)(cid:74)(cid:81)(cid:81)(cid:1123)(cid:70)(cid:87)(cid:72)(cid:84)(cid:71)(cid:70)(cid:81)(cid:74)(cid:83)(cid:84),(cid:5)(cid:82)(cid:74)(cid:83)(cid:89)(cid:87)(cid:74)(cid:5)(cid:81)(cid:74)(cid:5)
rispettivamente rivolte verso l''alto e
(cid:70)(cid:81)(cid:89)(cid:87)(cid:74)(cid:5)(cid:23)(cid:5)(cid:85)(cid:84)(cid:88)(cid:88)(cid:84)(cid:83)(cid:84)(cid:5)(cid:70)(cid:91)(cid:74)(cid:87)(cid:74)(cid:5)(cid:88)(cid:84)(cid:81)(cid:84)(cid:5)(cid:28)(cid:5)(cid:72)(cid:84)(cid:81)(cid:84)(cid:87)(cid:78)(cid:5)
verso il basso, queste si identificano
(cid:13)(cid:78)(cid:81)(cid:5)(cid:82)(cid:84)(cid:81)(cid:89)(cid:78)(cid:85)(cid:81)(cid:78)(cid:72)(cid:70)(cid:89)(cid:84)(cid:87)(cid:74)(cid:14)(cid:5)(cid:84)(cid:5)(cid:25)(cid:5)(cid:72)(cid:84)(cid:81)(cid:84)(cid:87)(cid:78)(cid:5)(cid:13)(cid:81)(cid:70)(cid:5)
con la lettera R.(cid:5) tolleranza).
IL CODICE COLORI DEI RESISTORI
COME SI LEGGE IL CODICE COLORI?
Sui resistori vengono stampate delle Per leggere il codice colori bisogna
linee colorate (bande) che indicano la mettere il colore della tolleranza a
(cid:87)(cid:74)(cid:88)(cid:78)(cid:88)(cid:89)(cid:74)(cid:83)(cid:95)(cid:70) contenuta. Le linee destra e poi guardare le altre 3.
indicano un codice che ci dice la
quantità di elettricità che controllano. (cid:3282)(cid:5) Il primo colore, quello più a sinistra,
Il valore di resistenza si indica le decine
(cid:82)(cid:78)(cid:88)(cid:90)(cid:87)(cid:70)(cid:5)(cid:78)(cid:83)(cid:5)(cid:52)(cid:77)(cid:82)(cid:5)(cid:13)(cid:569)(cid:14)(cid:19) (cid:3282)(cid:5) Il secondo colore indica le unità (cid:3282)
Il terzo colore invece indica il
numero di zeri da aggiungere!
Facciamo un esempio!
Il codice più comune è il codice (cid:3282)(cid:5) 3 decine', 14, 477);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 3', NULL, '(cid:72)(cid:77)(cid:78)(cid:70)(cid:82)(cid:70)(cid:89)(cid:84)(cid:5)(cid:70)(cid:5)(cid:25)(cid:5)(cid:71)(cid:70)(cid:83)(cid:73)(cid:74)(cid:19)(cid:5)(cid:40)(cid:78)(cid:5)(cid:88)(cid:84)(cid:83)(cid:84)(cid:5)(cid:78)(cid:83)(cid:75)(cid:70)(cid:89)(cid:89)(cid:78)(cid:5) (cid:3282)(cid:5) 6 unità
(cid:25)(cid:5)(cid:71)(cid:70)(cid:83)(cid:73)(cid:74)(cid:17)(cid:5)(cid:23)(cid:5)(cid:85)(cid:84)(cid:88)(cid:88)(cid:84)(cid:83)(cid:84)(cid:5)(cid:70)(cid:91)(cid:74)(cid:87)(cid:74)(cid:5)(cid:90)(cid:83)(cid:84)(cid:5)(cid:73)(cid:74)(cid:78)(cid:5) (cid:3282)(cid:5) 2 zeri
14 Laboratorio di elettronica: Impara e sperimenta
COS’È UN RESISTORE?
(cid:40)(cid:84)(cid:83)(cid:5)(cid:86)(cid:90)(cid:74)(cid:88)(cid:89)(cid:78)(cid:5)(cid:83)(cid:90)(cid:82)(cid:74)(cid:87)(cid:78)(cid:5)(cid:84)(cid:89)(cid:89)(cid:74)(cid:83)(cid:78)(cid:70)(cid:82)(cid:84)(cid:5)(cid:24)(cid:27)(cid:21)(cid:21)(cid:5)(cid:569)(cid:19)(cid:5) Se un resistore non ha il valore che ci
Considerato che il colore della si aspetta, potrebbe causare problemi
tolleranza è nel circuito e farlo funzionare in modo
(cid:84)(cid:87)(cid:84)(cid:17)(cid:5)(cid:70)(cid:71)(cid:71)(cid:78)(cid:70)(cid:82)(cid:84)(cid:5)(cid:90)(cid:83)(cid:70)(cid:5)(cid:89)(cid:84)(cid:81)(cid:81)(cid:74)(cid:87)(cid:70)(cid:83)(cid:95)(cid:70)(cid:5)(cid:73)(cid:74)(cid:81)(cid:5)(cid:26)(cid:10)(cid:19) errato. Conoscere la tolleranza ci
aiuta a progettare circuiti più sicuri
(cid:74)(cid:5)(cid:70)(cid:75)(cid:1834)(cid:73)(cid:70)(cid:71)(cid:78)(cid:81)(cid:78)(cid:19)
COS’È LA TOLLERANZA DI UN RESISTORE?
Immaginate di avere un resistore da COME RICORDIAMO IL CODICE COLORI?
(cid:22)(cid:21)(cid:21)(cid:5)(cid:51)(cid:77)(cid:82)(cid:19)(cid:5)(cid:53)(cid:84)(cid:89)(cid:87)(cid:74)(cid:88)(cid:89)(cid:74)(cid:5)(cid:85)(cid:74)(cid:83)(cid:88)(cid:70)(cid:87)(cid:74)(cid:5)(cid:72)(cid:77)(cid:74)(cid:5)(cid:88)(cid:78)(cid:70)(cid:5)', 14, 482);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 3', NULL, '(cid:74)(cid:88)(cid:70)(cid:89)(cid:89)(cid:70)(cid:82)(cid:74)(cid:83)(cid:89)(cid:74)(cid:5)(cid:22)(cid:21)(cid:21)(cid:5)(cid:51)(cid:77)(cid:82)(cid:17)(cid:5)(cid:82)(cid:70)(cid:5)(cid:78)(cid:83)(cid:5)(cid:87)(cid:74)(cid:70)(cid:81)(cid:89)(cid:2308)(cid:5) Abbiamo detto che il codice
(cid:72)(cid:1123)(cid:2316)(cid:5)un piccolo segreto da considerare: colori utilizza l’ordine dei colori
la Tolleranza. La tolleranza è un dell’arcobaleno, ma chi ricorda l’ordine
margine di errore che ci dice quanto il esatto dei colori dell’arcobaleno?
valore reale del resistore può variare Nessuno! Non preoccuparti però c’è
rispetto al valore nominale. (cid:90)(cid:83)(cid:70)(cid:5)(cid:88)(cid:74)(cid:82)(cid:85)(cid:81)(cid:78)(cid:72)(cid:74)(cid:5)(cid:1834)(cid:81)(cid:70)(cid:88)(cid:89)(cid:87)(cid:84)(cid:72)(cid:72)(cid:70)(cid:5)(cid:85)(cid:74)(cid:87)(cid:5)(cid:87)(cid:78)(cid:72)(cid:84)(cid:87)(cid:73)(cid:70)(cid:87)(cid:81)(cid:70)(cid:5)
molto più semplicemente.
Ad esempio, se un resistore ha una
(cid:89)(cid:84)(cid:81)(cid:81)(cid:74)(cid:87)(cid:70)(cid:83)(cid:95)(cid:70)(cid:5)(cid:73)(cid:74)(cid:81)(cid:5)(cid:26)(cid:10)(cid:5)(cid:88)(cid:78)(cid:76)(cid:83)(cid:78)(cid:1834)(cid:72)(cid:70)(cid:5)(cid:72)(cid:77)(cid:74)(cid:5)(cid:78)(cid:81)(cid:5) valore Non Metterti (cid:55)ubicondo Alla Guida
reale del resistore può essere un po’ Vino (e) Birra Van (cid:43)iù Bene
più alto o un po’ più basso
(cid:73)(cid:78)(cid:5)(cid:22)(cid:21)(cid:21)(cid:5)(cid:51)(cid:77)(cid:82)(cid:19)(cid:5)(cid:46)(cid:83)(cid:5)(cid:86)(cid:90)(cid:74)(cid:88)(cid:89)(cid:84)(cid:5)(cid:72)(cid:70)(cid:88)(cid:84)(cid:5)(cid:78)(cid:81)(cid:5)(cid:88)(cid:90)(cid:84)(cid:5) Proviamo ora a scriverla in verticale', 15, 436);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 3', NULL, '(cid:91)(cid:70)(cid:81)(cid:84)(cid:87)(cid:74)(cid:5)(cid:85)(cid:84)(cid:89)(cid:87)(cid:74)(cid:71)(cid:71)(cid:74)(cid:5)(cid:91)(cid:70)(cid:87)(cid:78)(cid:70)(cid:87)(cid:74)(cid:5)(cid:73)(cid:70)(cid:5)(cid:30)(cid:26)(cid:5)(cid:51)(cid:77)(cid:82)(cid:5)(cid:70)(cid:5)
(cid:22)(cid:21)(cid:26)(cid:5)(cid:51)(cid:77)(cid:82)(cid:19)(cid:5)(cid:54)(cid:90)(cid:78)(cid:83)(cid:73)(cid:78)(cid:17)(cid:5)(cid:70)(cid:83)(cid:72)(cid:77)(cid:74)(cid:5)(cid:88)(cid:74)(cid:5)(cid:78)(cid:81)(cid:5)(cid:83)(cid:84)(cid:88)(cid:89)(cid:87)(cid:84)(cid:5) Non
(cid:87)(cid:74)(cid:88)(cid:78)(cid:88)(cid:89)(cid:84)(cid:87)(cid:74)(cid:5)(cid:2316)(cid:5)(cid:74)(cid:89)(cid:78)(cid:72)(cid:77)(cid:74)(cid:89)(cid:89)(cid:70)(cid:89)(cid:84)(cid:5)(cid:72)(cid:84)(cid:82)(cid:74)(cid:5)(cid:22)(cid:21)(cid:21)(cid:5)(cid:51)(cid:77)(cid:82)(cid:17)(cid:5) Metterti
non sempre sarà esattamente così. (cid:55)ubicondo
Alla
Ma perché è così importante capire la Guida
tolleranza? Quando si progettano Vino
circuiti elettronici, gli ingegneri devono Birra
essere sicuri che i componenti Van
funzionino bene anche se hanno Giù
piccole variazioni nei loro valori. Bene
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 15', 15, 318);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 3', NULL, 'CAPITOLO 3
La lettera iniziale di ogni parola
(cid:73)(cid:74)(cid:81)(cid:81)(cid:70)(cid:5)(cid:1834)(cid:81)(cid:70)(cid:88)(cid:89)(cid:87)(cid:84)(cid:72)(cid:72)(cid:70)(cid:17)(cid:5)(cid:78)(cid:83)(cid:73)(cid:78)(cid:72)(cid:70)(cid:5)(cid:90)(cid:83)(cid:5)(cid:72)(cid:84)(cid:81)(cid:84)(cid:87)(cid:74)(cid:5)
dell’arcobaleno!
(cid:51)(cid:84)(cid:83)(cid:5) (cid:34)(cid:5) (cid:51)(cid:74)(cid:87)(cid:84)(cid:5) (cid:34)(cid:5) (cid:21)
(cid:50)(cid:74)(cid:89)(cid:89)(cid:74)(cid:87)(cid:89)(cid:78)(cid:5) (cid:34)(cid:5) (cid:50)(cid:70)(cid:87)(cid:87)(cid:84)(cid:83)(cid:74)(cid:5) (cid:34)(cid:5) (cid:22)
(cid:55)(cid:90)(cid:71)(cid:78)(cid:72)(cid:84)(cid:83)(cid:73)(cid:84)(cid:5) (cid:34)(cid:5) (cid:55)(cid:84)(cid:88)(cid:88)(cid:84)(cid:5) (cid:34)(cid:5) (cid:23)
Alla = Arancione = 3
(cid:44)(cid:90)(cid:78)(cid:73)(cid:70)(cid:5) (cid:34)(cid:5) (cid:44)(cid:78)(cid:70)(cid:81)(cid:81)(cid:84)(cid:5) (cid:34)(cid:5) (cid:25)
(cid:59)(cid:78)(cid:83)(cid:84)(cid:5) (cid:34)(cid:5) (cid:59)(cid:74)(cid:87)(cid:73)(cid:74)(cid:5) (cid:34)(cid:5) (cid:26)
Birra = Blu = 6
(cid:59)(cid:70)(cid:83)(cid:5) (cid:34)(cid:5) (cid:59)(cid:78)(cid:84)(cid:81)(cid:70)(cid:5) (cid:34)(cid:5) (cid:28)
(cid:44)(cid:78)(cid:2330)(cid:5) (cid:34)(cid:5) (cid:44)(cid:87)(cid:78)(cid:76)(cid:78)(cid:84)(cid:5) (cid:34)(cid:5) (cid:29)
(cid:39)(cid:74)(cid:83)(cid:74)(cid:5) (cid:34)(cid:5) (cid:39)(cid:78)(cid:70)(cid:83)(cid:72)(cid:84)(cid:5) (cid:34)(cid:5) (cid:30)
Facile no?
ESERCIZI
Per verificare se hai capito come utilizzare la filastrocca e il codice
colori proviamo ora a fare qualche esercizio.
Scrivi accanto ad ogni resistore quanto vale il suo valore di resistenza e
la sua tolleranza.
16 Laboratorio di elettronica: Impara e sperimenta
COS’È UN RESISTORE?
R = _____________ (cid:49) ± _____ %
R = _____________ (cid:49) ± _____ %
R = _____________ (cid:49) ± _____ %
R = _____________ (cid:49) ± _____ %
R = _____________ (cid:49) ± _____ %', 16, 496);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 3', NULL, 'R = _____________ (cid:49) ± _____ %
Scrivi qui i tuoi appunti
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 17', 17, 40);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 3', NULL, 'CAPITOLO 3
COSA FARE QUANDO CI SONO TROPPI MA COME SI LEGGONO?
ZERI?
(cid:3282)(cid:5)La lettera k serve per
Alcuni valori di resistenza hanno (cid:78)(cid:83)(cid:73)(cid:78)(cid:72)(cid:70)(cid:87)(cid:74)(cid:5)(cid:22)(cid:21)(cid:21)(cid:21)(cid:5) e va letta kilo.
(cid:73)(cid:70)(cid:91)(cid:91)(cid:74)(cid:87)(cid:84)(cid:5)(cid:89)(cid:87)(cid:84)(cid:85)(cid:85)(cid:78)(cid:5)(cid:95)(cid:74)(cid:87)(cid:78)(cid:6)(cid:5)(cid:22)(cid:21)(cid:5)(cid:21)(cid:21)(cid:21)(cid:5)(cid:52)(cid:77)(cid:82),(cid:5) U(cid:83)(cid:5)(cid:87)(cid:74)(cid:88)(cid:78)(cid:88)(cid:89)(cid:84)(cid:87)(cid:74)(cid:5)(cid:73)(cid:70)(cid:5)(cid:5)(cid:22)(cid:21)(cid:19)(cid:21)(cid:21)(cid:21)(cid:5)(cid:52)(cid:77)(cid:82)(cid:5)è(cid:5)(cid:72)(cid:77)(cid:78)(cid:70)(cid:82)
(cid:22)(cid:5)(cid:21)(cid:21)(cid:21)(cid:5)(cid:21)(cid:21)(cid:21)(cid:5)(cid:52)(cid:77)(cid:82),(cid:5)(cid:82)(cid:70)(cid:5)(cid:86)(cid:90)(cid:70)(cid:83)(cid:89)(cid:78)(cid:5)(cid:88)(cid:84)(cid:83)(cid:84)(cid:36)(cid:5) (cid:70)(cid:89)(cid:84)(cid:5)(cid:87)(cid:74)(cid:88)(cid:78)(cid:88)(cid:89)(cid:84)(cid:87)(cid:74)(cid:5)(cid:73)(cid:70)(cid:5)(cid:22)(cid:21)(cid:5)(cid:80)(cid:78)(cid:81)(cid:84)(cid:5)(cid:52)(cid:77)(cid:82)(cid:5)
(cid:3282)(cid:5) La lettera M serve per
(cid:54)(cid:90)(cid:70)(cid:83)(cid:73)(cid:84)(cid:5)(cid:72)(cid:78)(cid:5)(cid:88)(cid:84)(cid:83)(cid:84)(cid:5)(cid:24)(cid:17)(cid:5)(cid:27)(cid:5)(cid:84)(cid:5)(cid:70)(cid:73)(cid:73)(cid:78)(cid:87)(cid:78)(cid:89)(cid:89)(cid:90)(cid:87)(cid:70)(cid:5)(cid:30)(cid:5)(cid:95)(cid:74)(cid:87)(cid:78)(cid:5) (cid:78)(cid:83)(cid:73)(cid:78)(cid:72)(cid:70)(cid:87)(cid:74)(cid:5)(cid:22)(cid:19)(cid:21)(cid:21)(cid:21)(cid:19)(cid:21)(cid:21)(cid:21)(cid:5) e va letta', 18, 441);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 3', NULL, 'si utilizzano delle abbreviazioni per mega. U(cid:83)(cid:5)(cid:87)(cid:74)(cid:88)(cid:78)(cid:88)(cid:89)(cid:84)(cid:87)(cid:74)(cid:5)(cid:73)(cid:70)(cid:5)(cid:22)(cid:5)(cid:82)(cid:78)(cid:81)(cid:78)(cid:84)(cid:83)(cid:74)(cid:5)
evitare di scrivere numeri enormi. di Ohm è chiamato
(cid:87)(cid:74)(cid:88)(cid:78)(cid:88)(cid:89)(cid:84)(cid:87)(cid:74)(cid:5)(cid:73)(cid:70)(cid:5)(cid:22)(cid:5)(cid:82)(cid:74)(cid:76)(cid:70)(cid:5)(cid:52)(cid:77)(cid:82)
Se abbiamo 3 zeri utilizziamo la lettera (cid:3282)(cid:5) La lettera G serve
k (minuscolo perché con la lettera K (cid:85)(cid:74)(cid:87)(cid:5)(cid:78)(cid:83)(cid:73)(cid:78)(cid:72)(cid:70)(cid:87)(cid:74)(cid:5)(cid:22)(cid:19)(cid:21)(cid:21)(cid:21)(cid:19)(cid:21)(cid:21)(cid:21)(cid:19)(cid:21)(cid:21)(cid:21)(cid:5)(cid:13)(cid:90)(cid:83)(cid:5)
si nomina Lord Kelvin!) se sono 6 la miliardo)e va letta giga. Un
lettera M(cid:5)(cid:74)(cid:5)(cid:88)(cid:74)(cid:5)(cid:88)(cid:84)(cid:83)(cid:84)(cid:5)(cid:30)(cid:5)(cid:81)(cid:70)(cid:5)(cid:81)(cid:74)(cid:89)(cid:89)(cid:74)(cid:87)(cid:70)(cid:5)G. resistore da (cid:22)(cid:5)(cid:82)(cid:78)(cid:81)(cid:78)(cid:70)(cid:87)(cid:73)(cid:84)(cid:5)(cid:73)(cid:78)(cid:5)(cid:52)(cid:77)(cid:82)(cid:5)è(cid:5)
(cid:72)(cid:77)(cid:78)(cid:70)(cid:82)(cid:70)(cid:89)(cid:84)(cid:5)(cid:87)(cid:74)(cid:88)(cid:78)(cid:88)(cid:89)(cid:84)(cid:87)(cid:74)(cid:5)(cid:73)(cid:70)(cid:5)(cid:22)(cid:5)(cid:76)(cid:78)(cid:76)(cid:70)(cid:5)(cid:52)(cid:77)
(cid:82).
ESERCIZI
Ripeti ora l’esercizio utilizzando le lettere k M e G
R = _____________ (cid:49) ± _____ %
R = _____________ (cid:49) ± _____ %
18 Laboratorio di elettronica: Impara e sperimenta
COS’È UN RESISTORE?
R = _____________ (cid:49) ± _____ %
R = _____________ (cid:49) ± _____ %
R = _____________ (cid:49) ± _____ %
R = _____________ (cid:49) ± _____ %
Scrivi qui i tuoi appunti
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 19
NOTE', 18, 499);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 3', NULL, '20 Laboratorio di elettronica: Impara e sperimenta', 20, 12);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 4', NULL, 'CAPITOLO 4
COS’È LA BREADBOARD?
Una breadboard è una scheda con COME FUNZIONA?
tanti piccoli fori e connessioni interne
che permettono di inserire numerosi
(cid:22)(cid:19) (cid:56)(cid:89)(cid:87)(cid:90)(cid:89)(cid:89)(cid:90)(cid:87)(cid:70): La breadboard ha linee
componenti elettronici da collegare tra orizzontali e verticali che sono
di loro senza usare il saldatore (che è collegate internamente. Le linee
uno strumento potenzialmente sul lato lungo della breadboard
pericoloso). È utilizzata sono usate principalmente
principalmente per prototipare per alimentazione (positivo
(cid:72)(cid:78)(cid:87)(cid:72)(cid:90)(cid:78)(cid:89)(cid:78)(cid:17)(cid:5)ciò(cid:5)(cid:88)(cid:78)(cid:76)(cid:83)(cid:78)(cid:1834)(cid:72)(cid:70)(cid:5)(cid:72)(cid:77)(cid:74)(cid:5)(cid:85)(cid:90)(cid:84)(cid:78)(cid:5)(cid:72)(cid:87)(cid:74)(cid:70)(cid:87)(cid:74)(cid:5) e negativo), mentre le linee centrali
un circuito per testarlo senza fare sono utilizzate per inserire i
collegamenti permanenti. componenti. (cid:38)(cid:57)(cid:57)(cid:42)(cid:51)(cid:63)(cid:46)(cid:52)(cid:51)(cid:42)! Ci
sono i simboli + e - ma le linee non
sanno di essere colorate! Questa è
solo uno stratagemma che si usa
per capire dove finiscono i fili, una
cosiddetta (cid:72)(cid:84)(cid:83)(cid:91)(cid:74)(cid:83)(cid:95)(cid:78)(cid:84)(cid:83)(cid:74).
2. (cid:40)(cid:84)(cid:81)(cid:81)(cid:74)(cid:76)(cid:70)(cid:82)(cid:74)(cid:83)(cid:89)(cid:84): Quando inserisci
un componente in uno dei fori è
collegato automaticamente ai fori
adiacenti sulla stessa riga/linea.
Questo
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 21', 21, 417);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 4', NULL, 'CAPITOLO 4
significa che i componenti sulla fai puoi farlo come se fosse il gioco
stessa riga possono comunicare della battaglia navale!
tra loro.
USIAMO LA BREADBOARD!
Vediamo ora come usare la
breadboard per collegare un resistore
(cid:73)(cid:70)(cid:5)(cid:23)(cid:23)(cid:21)(cid:5)(cid:52)(cid:77)(cid:82)(cid:5)(cid:13)(cid:89)(cid:78)(cid:5)(cid:87)(cid:78)(cid:72)(cid:84)(cid:87)(cid:73)(cid:78)(cid:5)(cid:72)(cid:77)(cid:74)(cid:5)(cid:72)(cid:84)(cid:81)(cid:84)(cid:87)(cid:78)(cid:5)
dovrebbe avere?)
Guarda le righe blu per capire come
sono fatti i collegamenti della
breadboard!
Nelle righe superiori e inferiori i
buchetti sono collegati tra di loro
in (cid:84)(cid:87)(cid:78)(cid:95)(cid:95)(cid:84)(cid:83)(cid:89)(cid:70)(cid:81)(cid:74), mentre nella parte
inferiore in (cid:91)(cid:74)(cid:87)(cid:89)(cid:78)(cid:72)(cid:70)(cid:81)(cid:74). Questo è
(cid:91)(cid:74)(cid:87)(cid:84)(cid:5)(cid:1834)(cid:83)(cid:84)(cid:5)(cid:70)(cid:81)(cid:5)(cid:72)(cid:70)(cid:83)(cid:70)(cid:81)(cid:74)(cid:89)(cid:89)(cid:84)(cid:5)al centro(cid:5)de(cid:81)(cid:81)(cid:70)(cid:5)
breadboard dove il collegamento viene
interrotto per poi riprendere
(cid:88)(cid:90)(cid:71)(cid:78)(cid:89)(cid:84)(cid:5)(cid:73)(cid:84)(cid:85)(cid:84)(cid:5)(cid:81)(cid:70)(cid:5)(cid:88)(cid:90)(cid:70)(cid:5)(cid:1834)(cid:83)(cid:74)(cid:19)(cid:5)(cid:54)(cid:90)(cid:74)(cid:88)(cid:89)a
operazione(cid:5) consente di collegare i
componenti che hanno pin sia da un
lato che dall’altro senza collegare tra
di loro pin che non dovrebbero esserlo!
Oppure semplicemente avere la
possibilità di inserire più prototipi sulla
stessa breadboard. Entrambi i modi vanno bene perché i
due piedini del resistore sono collegati
Osserva attentamente la breadboard: in due fori non connessi tra di loro
ci sono delle lettere e dei numeri, se dalla breadboard. Che succede se
vuoi prendere appunti su quello che invece lo colleghi così?
22 Laboratorio di elettronica: Impara e sperimenta', 22, 495);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 4', NULL, 'COS’È LA BREADBOARD?
Le due gambette del resistore sono
connesse tra di loro dai collegamenti
interni della breadboard. La corrente
è pigra e sceglie sempre il percorso a
resistenza più bassa per fare meno
fatica a passare e quindi il nostro
(cid:87)(cid:74)(cid:88)(cid:78)(cid:88)(cid:89)(cid:84)(cid:87)(cid:74)(cid:5)(cid:73)(cid:70)(cid:5)(cid:23)(cid:23)(cid:21)(cid:5)(cid:52)(cid:77)(cid:82)(cid:5)(cid:2316)(cid:5)(cid:73)(cid:78)(cid:91)(cid:74)(cid:83)(cid:89)(cid:70)(cid:89)(cid:84)(cid:5)(cid:90)(cid:83)(cid:5)
(cid:87)(cid:74)(cid:88)(cid:78)(cid:88)(cid:89)(cid:84)(cid:87)(cid:74)(cid:5)(cid:73)(cid:70)(cid:5)(cid:21)(cid:5)(cid:52)(cid:77)(cid:82)(cid:5)(cid:72)(cid:77)(cid:78)(cid:70)(cid:82)(cid:70)(cid:89)(cid:84)(cid:5)(cid:70)(cid:83)(cid:72)(cid:77)(cid:74)(cid:5)
(cid:72)(cid:84)(cid:87)(cid:89)(cid:84)(cid:5)(cid:72)(cid:78)(cid:87)(cid:72)(cid:90)(cid:78)(cid:89)(cid:84).
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 23
NOTE
24 Laboratorio di elettronica: Impara e sperimenta', 23, 265);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 5', NULL, 'CAPITOLO 5
COSA SONO LE BATTERIE?
Le batterie sono i nostri esperimenti. Muovendosi
delle piccole “scatole magiche” che lungo il percorso le cariche generano
accumulano energia. Quando le quindi qualcosa come calore o luce!
usiamo l''energia accumulata serve
Immaginate la vostra lampada da
per far funzionare oggetti come torce,
notte: in quel caso l’energia della
telefoni, giocattoli e tanto altro.
batteria (o della presa della luce)
viene utilizzata per generare luce.
COME FUNZIONANO? Invece, nel caso dell''asciugacapelli
l’energia viene usata per generare
Una parte della batteria è fatta calore e asciugare i capelli.
di un materiale che “vuole” liberarsi di
energia ((cid:85)(cid:84)(cid:81)(cid:84)(cid:5)(cid:83)(cid:74)(cid:76)(cid:70)(cid:89)(cid:78)(cid:91)(cid:84)) e un’altra
parte che vuole catturare questa
energia ((cid:85)(cid:84)(cid:81)(cid:84)(cid:5)(cid:85)(cid:84)(cid:88)(cid:78)(cid:89)(cid:78)(cid:91)(cid:84)). Tra queste
due parti c’è una sostanza liquida
(elettrolita) che aiuta le cariche a
muoversi.
Per spostarsi dal polo negativo al polo
positivo, le cariche hanno bisogno di
un percorso obbligato, come se fosse
una pista. Questo percorso è fatto di
circuiti che costruiremo durante
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 25', 25, 329);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 5', NULL, 'CAPITOLO 5
Per gli esperimenti di questo corso Per collegare la clip alla
(cid:90)(cid:89)(cid:78)(cid:81)(cid:78)(cid:95)(cid:95)(cid:74)(cid:87)(cid:74)(cid:82)(cid:84)(cid:5) (cid:90)(cid:83)(cid:70)(cid:5) (cid:71)(cid:70)(cid:89)(cid:89)(cid:74)(cid:87)(cid:78)(cid:70)(cid:5) (cid:70)(cid:5) (cid:30)(cid:59)(cid:5) batteria fai combaciare i
(cid:72)(cid:84)(cid:82)(cid:74)(cid:5)questa nell''immagine: connettori in questo modo
Una volta collegati, il cavo rosso
indica il positivo, mentre quello nero il
negativo. Per comodità inseriremo il
(cid:72)(cid:70)(cid:91)(cid:84)(cid:5)(cid:83)(cid:74)(cid:87)(cid:84) nella (cid:88)(cid:89)(cid:87)(cid:78)(cid:88)(cid:72)(cid:78)(cid:70)(cid:5)(cid:82)(cid:73)(cid:86)(cid:69) della
breadboard e il (cid:72)(cid:70)(cid:91)(cid:84)(cid:5) (cid:87)(cid:84)(cid:88)(cid:88)(cid:84) nella
striscia rossa della breadboard.
Per collegarla alla breadboard invece (cid:55)(cid:78)(cid:72)(cid:84)(cid:87)(cid:73)(cid:70)(cid:31) l(cid:73)(cid:4) (cid:87)(cid:88)(cid:86)(cid:77)(cid:87)(cid:71)(cid:73)(cid:4) (cid:71)(cid:83)(cid:80)(cid:83)(cid:86)(cid:69)(cid:88)(cid:73)(cid:4) (cid:87)(cid:83)(cid:82)(cid:83)(cid:4)
utilizzeremo una clip per (cid:87)(cid:83)(cid:80)(cid:83)(cid:4) (cid:89)(cid:82)(cid:4) (cid:69)(cid:89)(cid:87)(cid:77)(cid:80)(cid:77)(cid:83)(cid:4) (cid:90)(cid:77)(cid:87)(cid:77)(cid:90)(cid:83)(cid:16)(cid:4) (cid:82)(cid:83)(cid:82)(cid:4) (cid:76)(cid:69)(cid:82)(cid:82)(cid:83)(cid:4)
batteria come questa (cid:69)(cid:80)(cid:71)(cid:89)(cid:82)(cid:69)(cid:4)(cid:74)(cid:89)(cid:82)(cid:94)(cid:77)(cid:83)(cid:82)(cid:73)(cid:4)(cid:73)(cid:80)(cid:73)(cid:88)(cid:88)(cid:86)(cid:77)(cid:71)(cid:69)(cid:18)
nell''immagine:
Siamo ora pronti a realizzare i
nostri primi esperimenti perché
possiamo dare energia ai circuiti.
26 Laboratorio di elettronica: Impara e sperimenta', 26, 464);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 6', NULL, 'CAPITOLO 6
COS’È IL DIODO LED?
notare infatti il LED ha una gambetta
Un diodo LED (che è l''acronimo di Light più lunga e una più corta, questo non
Emitting Diode) o diodo a emissione di perché gli piace zoppicare, ma perché
luce in italiano, la (cid:76)(cid:70)(cid:82)(cid:71)(cid:74)(cid:89)(cid:89)(cid:70)(cid:5)(cid:81)(cid:90)(cid:83)(cid:76)(cid:70) indica il (cid:85)(cid:84)(cid:88)(cid:78)(cid:89)(cid:78)(cid:91)(cid:84),
è un piccolo dispositivo elettronico che mentre la (cid:76)(cid:70)(cid:82)(cid:71)(cid:74)(cid:89)(cid:89)(cid:70)(cid:5)(cid:72)(cid:84)(cid:87)(cid:89)(cid:70) il (cid:83)(cid:74)(cid:76)(cid:70)(cid:89)(cid:78)(cid:91)(cid:84).
produce luce quando viene attraversato Il nome del (cid:85)(cid:84)(cid:88)(cid:78)(cid:89)(cid:78)(cid:91)(cid:84) è (cid:38)(cid:51)(cid:52)(cid:41)(cid:52)
da corrente elettrica. Puoi pensarlo mentre quello del (cid:83)(cid:74)(cid:76)(cid:70)(cid:89)(cid:78)(cid:91)(cid:84) è
come una minuscola (cid:40)(cid:38)(cid:57)(cid:52)(cid:41)(cid:52). Cosa succede se invece
(cid:81)(cid:70)(cid:82)(cid:85)(cid:70)(cid:73)(cid:78)(cid:83)(cid:70)(cid:5)(cid:82)(cid:84)(cid:81)(cid:89)(cid:84)(cid:5)(cid:74)(cid:75)(cid:1834)(cid:72)(cid:78)(cid:74)(cid:83)(cid:89)(cid:74)(cid:19) tagliamo le gambette al povero LED?
Come
(cid:78)(cid:73)(cid:74)(cid:83)(cid:89)(cid:78)(cid:1834)(cid:72)(cid:77)(cid:78)(cid:70)(cid:82)(cid:84)(cid:5)(cid:78)(cid:81)(cid:5)(cid:85)(cid:84)(cid:88)(cid:78)(cid:89)(cid:78)(cid:91)(cid:84)(cid:5)(cid:74)(cid:5)(cid:78)(cid:81)(cid:5)(cid:83)(cid:74)(cid:76)(cid:70)(cid:89)(cid:78)(cid:91)(cid:84)(cid:36)
A differenza dei resistori il led (cid:51)(cid:52)(cid:51)
può essere inserito nella breadboard In corrispondenza della gambetta
in qualunque verso perché è un corta c’è anche un taglio sulla testa
componente (cid:85)(cid:84)(cid:81)(cid:70)(cid:87)(cid:78)(cid:95)(cid:95)(cid:70)(cid:89)(cid:84). Come puoi del LED. Questo taglietto serve proprio', 27, 488);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 6', NULL, 'Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 27', 27, 24);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 6', NULL, 'CAPITOLO 6
(cid:70)(cid:73)(cid:5)(cid:78)(cid:73)(cid:74)(cid:83)(cid:89)(cid:78)(cid:1834)(cid:72)(cid:70)(cid:87)(cid:74)(cid:5)(cid:78)(cid:81)(cid:5)(cid:83)(cid:74)(cid:76)(cid:70)(cid:89)(cid:78)(cid:91)(cid:84)(cid:5)(cid:83)(cid:74)(cid:81)(cid:5)(cid:72)(cid:70)(cid:88)(cid:84)(cid:5)(cid:78)(cid:83)(cid:5) a quello del diodo classico ma
cui le gambette siano lunghe uguali! con una piccola aggiunta.
COME FUNZIONA?
Innanzitutto dobbiamo chiederci: cos’è
un diodo?
I diodi sono i sensi unici dell’elettronica.
Questo vuol dire che fanno Le freccette che escono dal diodo
attraversare la corrente solo in un indicano l’emissione di luce.
verso tant’è che il loro simbolo
elettronico è una freccia.
COME FA AD EMETTERE LUCE?
Quando la corrente (nel verso
giusto) attraversa il LED, essendo(cid:5)
(cid:91)(cid:74)(cid:81)(cid:84)(cid:72)(cid:78)(cid:88)(cid:88)(cid:78)(cid:82)(cid:70)(cid:5)(cid:72)(cid:84)(cid:82)(cid:74)(cid:5)(cid:42)(cid:80)(cid:70)(cid:88)(cid:77)(cid:17)(cid:5)(cid:73)(cid:78)(cid:91)(cid:74)(cid:83)(cid:89)(cid:70)(cid:5)
luminosa e poichè la testa del LED è
colorata
Il diodo consente il passaggio di (cid:83)(cid:4)(cid:88)(cid:86)(cid:69)(cid:87)(cid:84)(cid:69)(cid:86)(cid:73)(cid:82)(cid:88)(cid:73)(cid:16)(cid:4)(cid:86)(cid:77)(cid:89)(cid:87)(cid:71)(cid:77)(cid:69)(cid:81)(cid:83)(cid:4)(cid:69)(cid:4)(cid:90)(cid:73)(cid:72)(cid:73)(cid:86)(cid:73)(cid:4)(cid:77)(cid:4)
corrente solo dal positivo verso il (cid:72)(cid:77)(cid:90)(cid:73)(cid:86)(cid:87)(cid:77)(cid:4)(cid:71)(cid:83)(cid:80)(cid:83)(cid:86)(cid:77).
negativo, mentre lo blocca nell’altro
verso. È un passaggio obbligato per
la corrente che può scorrere solo
in un verso.
Ma torniamo ora al nostro LED.
Essendo comunque un diodo, ci in
indica un senso unico ed è per
questo che è polarizzato. Poiché fa
Diversi colori? Quello dell’immagine è
luce ma è un diodo, il suo simbolo
rosso! Lo so che lo hai pensato!
è simile
28 Laboratorio di elettronica: Impara e sperimenta', 28, 497);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 6', 'ESPERIMENTO 1', 'COS’È IL DIODO LED?
I led esistono in tantissimi DOVE LO TROVIAMO?
colori e di diverse dimensioni
Troviamo i diodi LED in tutti i
dispositivi elettronici e questo ci
indica banalmente che sono vivi.
Pensa al televisore quando è spento,
la lucina led è accesa per dirti che la
presa è collegata e che il televisore è
in attesa (Stanby). Troviamo i LED
anche nelle lucine di Natale
oin quelle tastiere da gaming che ti
Pensa che addirittura esiste un LED (lo piacciono tanto. Come già detto sono
vedremo più avanti) che ti consente di ovunque!
creare il tuo colore preferito!
ESPERIMENTO 1
Tutto bellissimo, tante parole, ma ora siamo arrivati alla domanda che ti stai
ponendo dall’inizio: come lo accendo?
Per accendere il LED e fare il nostro primo esperimento abbiamo bisogno di:
• Un LED, sceglilo del colore che ti piace di più!
• Una breadboard
• Una batteria 9V
• La clip per la batteria 9V
• Un resistore da 470 Ohm: spiegheremo dopo perché. Ti ricordi i
colori?(Giallo Viola Marrone)
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 29', 29, 272);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 6', NULL, 'CAPITOLO 6
Costruiamo passo passo il nostro primo circuito!
Collega la clip della batteria alla batteria
Collega il positivo della batteria alla striscia rossa superiore della breadboard
Collega il resistore da 470 Ohm tra un punto qualsiasi della striscia
rossa e un punto qualsiasi della zona sotto
Collega la gambetta lunga del LED verso il resistore e la gambetta corta
in un punto qualsiasi della parte sotto dopo la divisione centrale
30 Laboratorio di elettronica: Impara e sperimenta
COS’È IL DIODO LED?
Collega il negativo della batteria in un punto qualsiasi della stessa colonna
della gambetta corta del LED e … MAGIA!
Il LED si è acceso! Bellissimo vero? Prova adesso a cambiare il LED con
uno di un colore diverso!
Quale ti piace di più?
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 31', 30, 212);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 6', 'ESPERIMENTO 2', 'CAPITOLO 6
ESPERIMENTO 2
Il nostro circuito include un resistore, ma perché? Abbiamo detto che
i resistori servono per limitare la corrente te lo ricordi? Ogni LED può
sopportare una corrente massima che non deve essere superata altrimenti il
led si rompe. Il resistore serve proprio ad evitare di rompere il led perché
limita la corrente.
Se infatti colleghi per errore il LED direttamente alla batteria, il LED si
brucia e potrebbe addirittura esplodere!
Questo succede perché gli elettroni (delle particelle minuscole di cui è
fatta la corrente) acquistano troppa energia e vanno a scontrarsi
fortissimo contro la superficie del LED rompendolo!
RICORDA: NON collegare MAI il LED direttamente alla batteria, ma inserisci
sempre un resistore al centro!
32 Laboratorio di elettronica: Impara e sperimenta', 32, 201);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 6', 'ESPERIMENTO 3', 'LABORATORIO DI ELETTRONICA
I M P A R A E S P E R I M E N TA
VOLUME 1
ELAB
COS’È IL DIODO LED?
ESPERIMENTO 3
Per rendere il led più luminoso ci basta partire dal circuito che abbiamo
realizzato. Basta cambiare il resistore da 470 Ohm con uno da 220
Ohm. Ti ricordi i colori delle resistenze?
Con un resistore più basso, passa più corrente quindi il LED si illumina di più.
Rendiamo il LED meno luminoso
Per rendere il led meno luminoso, ci basta partire dal circuito che abbiamo
realizzato. Basta cambiare il resistore da 220 Ohm con uno da 1 kOhm.
Ti ricordi i colori?
Prova ora a cambiare il valore del resistore, ma NON scendere mai al
di sotto dei 100 Ohm.
Laboratorio di elettronica: Impara e sperimenta 33
NOTE
34 Laboratorio di elettronica: Impara e sperimenta', 33, 191);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 7', NULL, 'CAPITOLO 7
COS’È IL LED RGB?
(cid:46)(cid:81)(cid:5)(cid:49)(cid:42)(cid:41)(cid:5)(cid:55)(cid:44)(cid:39)(cid:5)(cid:13)(cid:55)ed Green Blue) è un LED
led nello stesso involucro per evitare di
speciale perché consente di creare il
avere troppi piedini da collegare si può
colore che più ti piace.
scegliere di metterne uno in comune
tra tutti, per comodità ad esempio il
(cid:58)(cid:83)(cid:5)(cid:49)(cid:42)(cid:41)(cid:5)(cid:55)(cid:44)(cid:39)(cid:5)(cid:2316)(cid:5)(cid:78)(cid:83)(cid:75)(cid:70)(cid:89)(cid:89)(cid:78)(cid:5)(cid:75)(cid:84)(cid:87)(cid:82)(cid:70)(cid:89)(cid:84)(cid:5)(cid:73)(cid:70)(cid:5)(cid:89)(cid:87)(cid:74)(cid:5)
(cid:72)(cid:70)(cid:89)(cid:84)(cid:73)(cid:84)(cid:17)(cid:5)(cid:84)(cid:89)(cid:89)(cid:74)(cid:83)(cid:74)(cid:83)(cid:73)(cid:84)(cid:5)(cid:72)(cid:84)(cid:88)(cid:2320)(cid:5)(cid:78)(cid:81)(cid:5)(cid:49)(cid:42)(cid:41)(cid:5)(cid:55)(cid:44)(cid:39)(cid:5)(cid:70)(cid:5)
diversi LED (uno rosso, uno verde e
catodo comune.
uno blu), dentro lo stesso involucro
trasparente e quindi a seconda dei
colori che scegliamo di accendere
possiamo unirli e crearne di nuovi!
COME FUNZIONA?
Innanzitutto bisogna dire che esistono
(cid:73)(cid:90)(cid:74)(cid:5)(cid:73)(cid:78)(cid:91)(cid:74)(cid:87)(cid:88)(cid:74)(cid:5)(cid:89)(cid:78)(cid:85)(cid:84)(cid:81)(cid:84)(cid:76)(cid:78)(cid:74)(cid:5)(cid:73)(cid:78)(cid:5)(cid:49)(cid:42)(cid:41)(cid:5)(cid:55)(cid:44)(cid:39)(cid:5)(cid:72)(cid:78)(cid:84)(cid:2316)(cid:5)
quelli a (cid:72)(cid:70)(cid:89)(cid:84)(cid:73)(cid:84)(cid:5)(cid:72)(cid:84)(cid:82)(cid:90)(cid:83)(cid:74) e quelli ad
(cid:70)(cid:83)(cid:84)(cid:73)(cid:84)(cid:5)(cid:72)(cid:84)(cid:82)(cid:90)(cid:83)(cid:74). In questo kit sono
presenti quelli a catodo comune. Ma', 35, 441);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 7', NULL, 'cosa vuol dire? Abbiamo detto che i (cid:40)(cid:84)(cid:82)(cid:74)(cid:5)(cid:85)(cid:90)(cid:84)(cid:78)(cid:5)(cid:91)(cid:74)(cid:73)(cid:74)(cid:87)(cid:74)(cid:5)(cid:78)(cid:83)(cid:75)(cid:70)(cid:89)(cid:89)(cid:78)(cid:5)(cid:78)(cid:81)(cid:5)(cid:49)(cid:42)(cid:41)(cid:5)(cid:55)(cid:44)(cid:39)(cid:5)
LED hanno due pin, uno lungo ha quattro piedini tutti di lunghezze
(l’anodo) e uno corto (il catodo), se diverse. Il piedino più lungo di tutti è il
mettiamo tre catodo comune a tutti e tre i led
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 35', 35, 153);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 7', 'ESPERIMENTO 1', 'CAPITOLO 7
(cid:12)(cid:86)(cid:83)(cid:87)(cid:87)(cid:83)(cid:4)(cid:55), verde G, blu B), quello Non dimentichiamo però che stiamo
accanto solo soletto nell’angolo è parlando comunque di LED e quindi
sempre il rosso, nell’angolo opposto vale tutto quello che abbiamo detto
c’è sempre il blu e il rimanente è il prima, quindi tieni a mente che per
verde! non bruciarlo dobbiamo usare i
resistori!
ESPERIMENTO 1
Accendiamo il LED rosso! Per questo esperimento abbiamo bisogno di:
• Un LED RGB
• Una breadboard
• Una batteria 9V
• La clip per la batteria 9V
• Un resistore da 470 Ohm
• Un filo colorato
Collega la clip della batteria alla batteria
Collega il positivo della batteria alla striscia rossa della breadboard
36 Laboratorio di elettronica: Impara e sperimenta
COS’È IL LED RGB?
Collega il resistore da 470 Ohm tra un punto qualsiasi della
striscia rossa e un punto qualsiasi della zona sotto
Posiziona il LED RGB in modo che il led rosso sia collegato all’altro lato
del resistore da 470 Ohm (ricorda che la gambetta più lunga è il catodo)
Collega il negativo della batteria alla striscia nera della breadboard
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 37', 36, 305);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 7', 'ESPERIMENTO 2', 'CAPITOLO 7
Collega il catodo (la gambetta lunga) al negativo della batteria con un filo e …
magia!
ESPERIMENTO 2
Scollega il resistore da 470 Ohm dal rosso e collegalo al verde
38 Laboratorio di elettronica: Impara e sperimenta', 38, 56);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 7', 'ESPERIMENTO 3', 'COS’È IL LED RGB?
ESPERIMENTO 3
Scollega il resistore da 470 Ohm dal rosso e collegalo al blu
ESPERIMENTO 4
Abbiamo a disposizione tre colori dentro lo stesso involucro quindi è arrivato
il momento di unirli.
Prendi un altro resistore da 470 Ohm e prova ad accendere insieme due colori
che preferisci per creare un colore nuovo. Utilizza l’immagine sotto per
avere qualche spunto. Proviamo ad esempio a mettere insieme il rosso e
il blu.
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 39', 39, 134);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 7', NULL, 'CAPITOLO 7
Abbiamo ottenuto il viola!
40 Laboratorio di elettronica: Impara e sperimenta
COS’È UN POTENZIOMETRO?
Inserisci il primo potenziometro nella breadboard
Inserisci una resistenza da 470 Ohm tra il positivo della batteria e il piedino
del potenziometro, come nel disegno
Inserisci il secondo potenziometro nella breadboard
Laboratorio di elettronica: Impara e sperimenta 73', 40, 95);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 7', 'ESPERIMENTO 5', 'COS’È IL LED RGB?
ESPERIMENTO 5
Prendi un altro resistore da 470 Ohm per accendere
tutti i colori contemporaneamente
Accendendo tutti i colori contemporaneamente, dovresti in teoria ottenere il
bianco! Molto probabilmente il colore che ottieni risulta leggermente
azzurrino, questo perché per ottenere un bel bianco hai bisogno che il rosso
sia più luminoso del verde e del blu!
Come facciamo? Basta abbassare la resistenza del LED rosso! Prova a
modificare il resistore del LED rosso abbassandolo prima a 330 Ohm e poi a
220 Ohm. Ti ricordi i colori? Se non li ricordi torna un attimo al capitolo sui
resistori!
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 41
COS’È UN POTENZIOMETRO?
Inserisci il primo potenziometro nella breadboard
Inserisci una resistenza da 470 Ohm tra il positivo della batteria e il piedino
del potenziometro, come nel disegno
Inserisci il secondo potenziometro nella breadboard
Laboratorio di elettronica: Impara e sperimenta 73', 41, 251);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 7', 'ESPERIMENTO 6', 'ESPERIMENTO 6
Ora dovresti aver capito che puoi anche cambiare quanto è luminoso il singolo
colore del LED RGB, quindi prova a giocare con i valori di resistenza dei colori
per creare il colore che più ti piace!
NOTE
42 Laboratorio di elettronica: Impara e sperimenta', 42, 66);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 8', NULL, 'CAPITOLO 8
COS’È UN PULSANTE?
Finora gli esperimenti realizzati COME FUNZIONA?
rimangono accesi e quindi continuano
(cid:70)(cid:5)(cid:1126)(cid:72)(cid:84)(cid:83)(cid:88)(cid:90)(cid:82)(cid:70)(cid:87)(cid:74)(cid:1127)(cid:5)(cid:81)(cid:70)(cid:5)(cid:71)(cid:70)(cid:89)(cid:89)(cid:74)(cid:87)(cid:78)(cid:70)(cid:5)(cid:1834)(cid:83)(cid:84)(cid:5)(cid:70)(cid:5)
Il pulsante è formato da due contatti
(cid:86)(cid:90)(cid:70)(cid:83)(cid:73)(cid:84)(cid:5)(cid:83)(cid:84)(cid:83)(cid:5)(cid:88)(cid:72)(cid:84)(cid:81)(cid:81)(cid:74)(cid:76)(cid:77)(cid:78)(cid:70)(cid:82)(cid:84)(cid:5)(cid:90)(cid:83)(cid:5)(cid:1834)(cid:81)(cid:84)(cid:5) dalla
metallici che vengono tenuti separati
breadboard. Ma come possiamo
da una molla. Quando premiamo il
accendere il LED solo quando vogliamo
cerchietto nero, la molla si comprime
noi? Possiamo usare un pulsante!
e i due contatti metallici si toccano.
Un pulsante è un contatto metallico
(cid:72)(cid:77)(cid:74)(cid:5)(cid:70)(cid:72)(cid:72)(cid:74)(cid:83)(cid:73)(cid:74)(cid:5)(cid:78)(cid:81)(cid:5)(cid:72)(cid:78)(cid:87)(cid:72)(cid:90)(cid:78)(cid:89)(cid:84)(cid:5)(cid:1834)(cid:83)(cid:84)(cid:5)(cid:70)(cid:5)(cid:86)(cid:90)(cid:70)(cid:83)(cid:73)(cid:84)(cid:5)
viene tenuto premuto e smette di farlo
non appena smettiamo di premere.
I pulsanti presenti nel kit sono i
"cioccolatini" neri con quattro gambette
(cid:72)(cid:84)(cid:82)(cid:74)(cid:5)(cid:86)(cid:90)(cid:74)(cid:81)(cid:81)(cid:84)(cid:5)(cid:78)(cid:83)(cid:5)(cid:1834)(cid:76)(cid:90)(cid:87)(cid:70).
Quindi i quattro piedini è come se in
realtà fossero solo due! Come vedi
dall’immagine sono due coppie di
contatti (la coppia rossa e la coppia
blu), quando premi la parte centrale', 43, 432);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 8', NULL, '(cid:72)(cid:84)(cid:81)(cid:81)(cid:74)(cid:76)(cid:77)(cid:78)(cid:5)(cid:90)(cid:83)(cid:5)(cid:1834)(cid:81)(cid:84)(cid:5)(cid:89)(cid:87)(cid:70)(cid:5)(cid:81)(cid:70)(cid:5)(cid:72)(cid:84)(cid:85)(cid:85)(cid:78)(cid:70)(cid:5)(cid:87)(cid:84)(cid:88)(cid:88)(cid:70)(cid:5)(cid:74)(cid:5)
la coppia blu, questo è il motivo per
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 43', 43, 108);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 8', 'ESPERIMENTO 1', 'CAPITOLO 8
cui il simbolo elettrico del pulsante Sono rappresentati i due lati del
è questo che vedi nell''immagine pulsante (quello rosso e quello blu
(cid:73)(cid:74)(cid:81)(cid:81)(cid:70)(cid:5)(cid:1834)(cid:76)(cid:90)(cid:87)(cid:70)(cid:5)(cid:85)(cid:87)(cid:74)(cid:72)(cid:74)(cid:73)(cid:74)(cid:83)(cid:89)(cid:74)(cid:14)(cid:5)(cid:74)(cid:5)(cid:78)(cid:81)(cid:5)(cid:72)(cid:84)(cid:83)(cid:89)(cid:70)(cid:89)(cid:89)(cid:84)(cid:5)
metallico che va giù quando lo premi
per collegarli insieme.
ESPERIMENTO 1
In questo esperimento ripeteremo quanto fatto con il LED singolo ma
aggiungeremo un pulsante per accendere il LED solo quando vogliamo noi.
Per questo esperimento abbiamo bisogno di:
• Un LED.Sceglilo del colore che ti piace di
più!
• Una breadboard
• Una batteria 9V
• La clip per la batteria 9V
• Un resistore da 470 Ohm
• Un pulsante
Collega la clip della batteria alla batteria
44 Laboratorio di elettronica: Impara e sperimenta
COS’È UN PULSANTE?
Collega il positivo della batteria alla striscia rossa della breadboard
Collega il resistore da 470 Ohm a cavallo della striscia centrale della
breadbord e collega lil resistore con un filo alla linea rossa del positivo
Collega la gambetta lunga del LED verso il resistore e la gambetta
corta in un foro qualsiasi
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 45', 44, 347);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 8', NULL, 'CAPITOLO 8
Inserisci il pulsante con un lato verso la gambetta corta del LED e l’altro verso
lo spazio libero alla destra del LED. Prova a copiare esattamente l’immagine
altrimenti diventa complicato inserire il pulsante e farlo funzionare.
Inserisci ora il negativo della batteria nella striscia nera e con un filo
collegalo al pulsante come mostrato in figura
Prova ora a premere il pulsante!
Non appena lo rilasci il LED si spegne!
46 Laboratorio di elettronica: Impara e sperimenta', 46, 121);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 8', 'ESPERIMENTO 2', 'COS’È UN PULSANTE?
ESPERIMENTO 2
Partendo dall’esperimento appena finito, cambia colore del LED o
valore del resistore per rendere il LED più o meno luminoso.
ESPERIMENTO 3
Proviamo a sostituire il LED monocolore con uno RGB. L’idea è quella di usare
un solo pulsante per accendere o spegnere i colori che preferisci del LED.
Diciamo che vogliamo accendere insieme il blu e il rosso per fare un led viola.
Per questo esperimento abbiamo bisogno di:
• Un LED RGB
• Una breadboard
• Una batteria 9V
• La clip per la batteria 9V
• Due resistori da 470 Ohm
• Un pulsante
• Due fili colorati
Collega la clip della batteria alla batteria
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 47', 47, 182);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 8', NULL, 'CAPITOLO 8
Collega il positivo della batteria alla striscia rossa della breadboard
Collega il resistore da 470 Ohm tra un punto qualsiasi della striscia
rossa e un punto qualsiasi della breadbord
Posiziona il LED RGB in modo che il led rosso sia collegato all’altro lato
del resistore da 470 Ohm (ricorda che la gambetta più lunga è il catodo).
48 Laboratorio di elettronica: Impara e sperimenta
COS’È UN PULSANTE?
Collega il negativo della batteria alla striscia nera della breadboard
(quella sotto la rossa)
Collega un altro resistore da 470 Ohm tra il positivo e il LED blu
Collega il pulsante accanto al LED a cavallo della striscia divisoria centrale
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 49', 48, 188);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 8', NULL, 'CAPITOLO 8
Collega un filo tra il catodo del LED RGB e i contatti di sinistra del pulsante
Collega un filo tra i contatti di destra del pulsante e il negativo della batteria
Premi il pulsante!
50 Laboratorio di elettronica: Impara e sperimenta', 50, 60);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 8', 'ESPERIMENTO 4', 'COS’È UN PULSANTE?
ESPERIMENTO 4
Proviamo ora ad utilizzare tre pulsanti diversi ognuno per ogni colore
del LED RGB.
Per questo esperimento abbiamo bisogno di:
• Un LED RGB
• Una breadboard
• Una batteria 9V
• La clip per la batteria 9V
• Tre resistori da 470 Ohm
• Tre pulsanti
• Quattro fili colorati
Collega la clip della batteria alla batteria.
Collega il positivo della batteria alla striscia rossa superiore della breadboard
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 51', 51, 132);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 8', NULL, 'CAPITOLO 8
Collega il negativo alla breadboard
Posiziona tre pulsanti a cavallo della striscia centrale della breadboard
come in figura
Posiziona il LED RGB dall’altro lato della breadboard
52 Laboratorio di elettronica: Impara e sperimenta
COS’È UN PULSANTE?
Collega il catodo del LED RGB (la gambetta lunga) al negativo della batteria
con un filo
Collega i tre resistori da 470 Ohm ai contatti dei tre pulsanti come in figura
e al positivo della batteria
Collega il pulsante più in basso al LED blu
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 53', 52, 149);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 8', NULL, 'CAPITOLO 8
Collega il pulsante centrale al LED verde
Collega il pulsante più in alto al LED rosso
Premi il pulsante collegato al LED blu
54 Laboratorio di elettronica: Impara e sperimenta
COS’È UN PULSANTE?
Premi il pulsante collegato al LED verde
Premi il pulsante collegato al LED rosso
Prova ora a giocare con i pulsanti e ad unire i colori!
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 55', 54, 110);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 8', 'ESPERIMENTO 5', 'ESPERIMENTO 5
Giocando con l’esperimento 4 prova a cambiare i valori di resistenza
dei vari colori così da ottenere colori diversi quando premi più pulsanti
contemporaneamente!
RICORDA: non scendere mai sotto i 100 Ohm altrimenti rischi di bruciare il LED!
NOTE
56 Laboratorio di elettronica: Impara e sperimenta', 56, 78);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 9', NULL, 'CAPITOLO 9
COS’È UN POTENZIOMETRO?
in numeri sul suo corpo. In questo
Un potenziometro è un componente
kit sono presenti dei potenziometri
elettronico a tre piedini simile a quelli
(cid:73)(cid:74)(cid:81)(cid:5)(cid:91)(cid:70)(cid:81)(cid:84)(cid:87)(cid:74)(cid:5)(cid:73)(cid:78)(cid:5)(cid:22)(cid:21)(cid:5)(cid:80)(cid:52)(cid:77)(cid:82)(cid:19)(cid:5)(cid:57)(cid:87)(cid:70)(cid:5)(cid:78)(cid:5)(cid:85)(cid:78)(cid:83)(cid:5)(cid:22)(cid:5)
(cid:78)(cid:83)(cid:5)(cid:1834)(cid:76)(cid:90)(cid:87)(cid:70)(cid:19)
e 3 abbiamo sempre il valore del
potenziometro, nel nostro caso
(cid:22)(cid:21)(cid:5)(cid:80)(cid:52)(cid:77)(cid:82)(cid:19)(cid:5)(cid:58)(cid:89)(cid:78)(cid:81)(cid:78)(cid:95)(cid:95)(cid:70)(cid:83)(cid:73)(cid:84)(cid:5)(cid:86)(cid:90)(cid:78)(cid:83)(cid:73)(cid:78)(cid:5)(cid:78)(cid:81)(cid:5)
potenziometro collegando solo i pin
(cid:22)(cid:5)(cid:74)(cid:5)(cid:24)(cid:5)(cid:2316)(cid:5)(cid:72)(cid:84)(cid:82)(cid:74)(cid:5)(cid:88)(cid:74)(cid:5)(cid:88)(cid:89)(cid:74)(cid:88)(cid:88)(cid:78)(cid:82)(cid:84)(cid:5)(cid:72)(cid:84)(cid:81)(cid:81)(cid:74)(cid:76)(cid:70)(cid:83)(cid:73)(cid:84)(cid:5)
(cid:85)(cid:87)(cid:84)(cid:85)(cid:87)(cid:78)(cid:84)(cid:5)(cid:90)(cid:83)(cid:5)(cid:87)(cid:74)(cid:88)(cid:78)(cid:88)(cid:89)(cid:84)(cid:87)(cid:74)(cid:5)(cid:73)(cid:70)(cid:5)(cid:22)(cid:21)(cid:5)(cid:80)(cid:52)(cid:77)(cid:82)(cid:19)(cid:5)(cid:50)(cid:70)(cid:5)
c’è un trucco! Il pin 2 è collegato ad un
All’interno c’è un disco resistivo
piccolo componente metallico che
fatto proprio così:
tocca il disco in qualunque punto
quindi ci permette di “prelevare” un
valore di resistenza intermedio.
Praticamente quando il cursore
rotativo è tutto girato verso', 57, 432);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 9', NULL, '(cid:78)(cid:81)(cid:5)(cid:85)(cid:78)(cid:83)(cid:5)(cid:22)(cid:5)(cid:89)(cid:87)(cid:70)(cid:5)(cid:78)(cid:5)(cid:85)(cid:78)(cid:83)(cid:5)(cid:22)(cid:5)(cid:74)(cid:5)(cid:23)(cid:5)(cid:70)(cid:71)(cid:71)(cid:78)(cid:70)(cid:82)(cid:84)(cid:5)(cid:21)(cid:5)(cid:52)(cid:77)(cid:82)(cid:5)
(cid:74)(cid:5)(cid:89)(cid:87)(cid:70)(cid:5)(cid:78)(cid:5)(cid:85)(cid:78)(cid:83)(cid:5)(cid:23)(cid:5)(cid:74)(cid:5)(cid:24)(cid:5)(cid:70)(cid:71)(cid:71)(cid:78)(cid:70)(cid:82)(cid:84)(cid:5)(cid:22)(cid:21)(cid:5)(cid:80)(cid:52)(cid:77)(cid:82)(cid:19)(cid:5)
Via via che che ruotiamo il cursore, la
(cid:87)(cid:74)(cid:88)(cid:78)(cid:88)(cid:89)(cid:74)(cid:83)(cid:95)(cid:70)(cid:5)(cid:89)(cid:87)(cid:70)(cid:5)(cid:78)(cid:5)(cid:85)(cid:78)(cid:83)(cid:5)(cid:22)(cid:5)(cid:74)(cid:5)(cid:23)(cid:5)(cid:70)(cid:90)(cid:82)(cid:74)(cid:83)(cid:89)(cid:70)(cid:5)(cid:74)(cid:5)
(cid:86)(cid:90)(cid:74)(cid:81)(cid:81)(cid:70)(cid:5)(cid:89)(cid:87)(cid:70)(cid:5)(cid:78)(cid:5)(cid:85)(cid:78)(cid:83)(cid:5)(cid:23)(cid:5)(cid:74)(cid:5)(cid:24)(cid:5)(cid:73)(cid:78)(cid:82)(cid:78)(cid:83)(cid:90)(cid:78)(cid:88)(cid:72)(cid:74)(cid:5)(cid:1834)(cid:83)(cid:84)(cid:5)
ad arrivare al punto in cui il pin 2
Il potenziometro ha un valore di
coincide con il pin 3. In questo caso
resistenza che viene indicato scritto
(cid:70)(cid:71)(cid:71)(cid:78)(cid:70)(cid:82)(cid:84)(cid:5)(cid:72)(cid:77)(cid:74)(cid:5)(cid:81)(cid:70)(cid:5)(cid:87)(cid:74)(cid:88)(cid:78)(cid:88)(cid:89)(cid:74)(cid:83)(cid:95)(cid:70)(cid:5)(cid:89)(cid:87)(cid:70)(cid:5)(cid:78)(cid:5)(cid:85)(cid:78)(cid:83)(cid:5)(cid:22)(cid:5)
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 57', 57, 434);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 9', 'ESPERIMENTO 1', 'CAPITOLO 9
(cid:74)(cid:5)(cid:23)(cid:5)(cid:91)(cid:70)(cid:81)(cid:74)(cid:5)(cid:22)(cid:21)(cid:5)(cid:80)(cid:52)(cid:77)(cid:82)(cid:5)(cid:74)(cid:5)(cid:86)(cid:90)(cid:74)(cid:81)(cid:81)(cid:70)(cid:5)(cid:89)(cid:87)(cid:70)(cid:5)(cid:78)(cid:5)(cid:85)(cid:78)(cid:83)(cid:5)(cid:23)(cid:5) (cid:56)(cid:74)(cid:5)(cid:90)(cid:89)(cid:78)(cid:81)(cid:78)(cid:95)(cid:95)(cid:78)(cid:70)(cid:82)(cid:84)(cid:5)(cid:88)(cid:84)(cid:81)(cid:84)(cid:5)(cid:78)(cid:5)(cid:85)(cid:78)(cid:83)(cid:5)(cid:22)(cid:5)(cid:74)(cid:5)(cid:23)(cid:5)(cid:70)(cid:71)(cid:71)(cid:78)(cid:70)(cid:82)(cid:84)(cid:5)
(cid:74)(cid:5)(cid:24)(cid:5)(cid:91)(cid:70)(cid:81)(cid:74)(cid:5)(cid:21)(cid:5)(cid:52)(cid:77)(cid:82)(cid:19)(cid:5)(cid:46)(cid:83)(cid:5)(cid:71)(cid:90)(cid:84)(cid:83)(cid:70)(cid:5)(cid:88)(cid:84)(cid:88)(cid:89)(cid:70)(cid:83)(cid:95)(cid:70)(cid:5)(cid:81)(cid:70)(cid:5) praticamente creato un resistore di
loro somma fa sempre il valore del valore variabile che passa da un valore
(cid:85)(cid:84)(cid:89)(cid:74)(cid:83)(cid:95)(cid:78)(cid:84)(cid:82)(cid:74)(cid:89)(cid:87)(cid:84)(cid:17)(cid:5)(cid:83)(cid:74)(cid:81)(cid:5)(cid:83)(cid:84)(cid:88)(cid:89)(cid:87)(cid:84)(cid:5)(cid:72)(cid:70)(cid:88)(cid:84)(cid:5)(cid:22)(cid:21)(cid:5) (cid:73)(cid:78)(cid:5)(cid:21)(cid:5)(cid:52)(cid:77)(cid:82)(cid:5)(cid:86)(cid:90)(cid:70)(cid:83)(cid:73)(cid:84)(cid:5)(cid:2316)(cid:5)(cid:89)(cid:90)(cid:89)(cid:89)(cid:84)(cid:5)(cid:70)(cid:5)(cid:88)(cid:78)(cid:83)(cid:78)(cid:88)(cid:89)(cid:87)(cid:70)(cid:5)
kOhm! (cid:70)(cid:73)(cid:5)(cid:90)(cid:83)(cid:5)(cid:91)(cid:70)(cid:81)(cid:84)(cid:87)(cid:74)(cid:5)(cid:73)(cid:78)(cid:5)(cid:22)(cid:21)(cid:5)(cid:80)(cid:52)(cid:77)(cid:82)(cid:5)(cid:86)(cid:90)(cid:70)(cid:83)(cid:73)(cid:84)(cid:5)(cid:2316)(cid:5)
Quando il cursore si trova al centro, tra tutto a destra, per questo motivo,', 58, 475);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 9', 'ESPERIMENTO 1', '(cid:78)(cid:5)(cid:85)(cid:78)(cid:83)(cid:5)(cid:22)(cid:5)(cid:74)(cid:5)(cid:23)(cid:5)(cid:74)(cid:5)(cid:89)(cid:87)(cid:70)(cid:5)(cid:78)(cid:5)(cid:85)(cid:78)(cid:83)(cid:5)(cid:23)(cid:5)(cid:74)(cid:5)(cid:24)(cid:5)(cid:70)(cid:71)(cid:71)(cid:78)(cid:70)(cid:82)(cid:84)(cid:5)(cid:81)(cid:84)(cid:5) se usato come resistore variabile il
(cid:88)(cid:89)(cid:74)(cid:88)(cid:88)(cid:84)(cid:5)(cid:91)(cid:70)(cid:81)(cid:84)(cid:87)(cid:74)(cid:5)(cid:73)(cid:78)(cid:5)(cid:87)(cid:74)(cid:88)(cid:78)(cid:88)(cid:89)(cid:74)(cid:83)(cid:95)(cid:70)(cid:5)(cid:73)(cid:78)(cid:5)(cid:26)(cid:5)(cid:80)(cid:52)(cid:77)(cid:82)(cid:5) potenziometro ha questo simbolo
considerato che la loro somma fa
sempre (cid:22)(cid:21)(cid:5)(cid:80)(cid:52)(cid:77)(cid:82)(cid:6)
Per quanto detto il simbolo elettrico
del potenziometro è questo nella figura
ESPERIMENTO 1
In questo esperimento useremo il potenziometro come resistore variabile
per cambiare l’intensità luminosa di un LED per renderlo più o meno luminoso
semplicemente ruotando l’alberino del potenziometro.
Per questo esperimento abbiamo bisogno di:
58 Laboratorio di elettronica: Impara e sperimenta
COS’È UN POTENZIOMETRO?
• Un LED: sceglilo del colore che ti piace di più!
• Una breadboard
• Una batteria 9V
• La clip per la batteria 9V
• Un resistore da 470 Ohm
• Un potenziometro da 10 kOhm
• Due fili colorati
Collega la clip della batteria alla batteria.
Collega il positivo della batteria alla striscia rossa della breadboard
Collega il resistore da 470 Ohm tra un punto qualsiasi della striscia rossa
e un punto qualsiasi della zona sotto
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 59', 58, 429);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 9', NULL, 'CAPITOLO 9
Collega la gambetta lunga del LED verso il resistore e la gambetta corta
nel foro subito dopo la divisione centrale
Inserisci il potenziometro nella breadboard
Collega il catodo del LED al pin 2 del potenziometro con un filo
60 Laboratorio di elettronica: Impara e sperimenta
COS’È UN POTENZIOMETRO?
Collega il pin 1 del potenziometro alla striscia nera della breadboard
Collega il negativo della batteria alla striscia nera della breadboard.
Il led dovrebbe accendersi al massimo della sua luminosità!
Ruota ora il cursore del potenziometro via via verso destra, l’intensità
luminosa del LED diminuisce
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 61', 60, 178);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 9', 'ESPERIMENTO 2', 'CAPITOLO 9
ESPERIMENTO 2
Nell’esperimento 1 l’intensità luminosa diminuisce ruotando verso destra, come
facciamo invece a farla aumentare? Facile! Basta
. In questo modo la resistenza parte alta e
diminuisce man mano che giri verso destra quindi il LED diventa più luminoso
62 Laboratorio di elettronica: Impara e sperimenta', 62, 81);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 9', 'ESPERIMENTO 3', 'COS’È UN POTENZIOMETRO?
ESPERIMENTO 3
Cambia colore del LED, noti differenze di luminosità man mano che giri
il cursore?
ESPERIMENTO 4
Modifichiamo l’intensità luminosa di un LED RGB utilizzando un potenziometro
Per questo esperimento abbiamo bisogno di:
• Un LED RGB
• Una breadboard
• Una batteria 9V
• La clip per la batteria 9V
• Un resistore da 470 Ohm
• Un potenziometro da 10 kOhm
• Tre fili colorati
Collega la clip della batteria alla batteria.
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 63', 63, 138);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 9', NULL, 'CAPITOLO 9
Collega il positivo della batteria alla striscia rossa della breadboard
Collega il negativo della batteria alla striscia nera della breadboard
Inserisci il LED RGB nella breadboard ,attento a dove metti il catodo
(pin più lungo)!
64 Laboratorio di elettronica: Impara e sperimenta
COS’È UN POTENZIOMETRO?
Collega il resistore da 470 Ohm tra il catodo del LED RGB e un punto qualsiasi
della breadboard
Collega il LED blu al positivo della batteria
Collega il LED verde al positivo della batteria
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 65', 64, 151);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 9', NULL, 'CAPITOLO 9
Inserisci il potenziometro nella breadboard collegando il pin 2 all’altro capo
del resistore da 470 Ohm
Collega il pin 3 del potenziometro al negativo della batteria e il LED dovrebbe
diventare azzurrino
Ruota il potenziometro verso destra e sinistra e osserva come cambia
la luminosità del LED RGB
66 Laboratorio di elettronica: Impara e sperimenta', 66, 90);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 9', 'ESPERIMENTO 5', 'COS’È UN POTENZIOMETRO?
ESPERIMENTO 5
In questo esperimento utilizzeremo tutti i pin del potenziometro per sfruttare
il principio secondo cui la resistenza tra il pin 2 e gli altri due aumenta o
diminuisce a seconda del verso di rotazione. Questo ci consentirà di avere il
LED RGB colorato di BLU quando il potenziometro è tutto girato verso sinistra
e di ROSSO quando è girato verso destra. E in mezzo? Blu e rosso
si uniscono!
Per questo esperimento abbiamo bisogno di:
• Un LED RGB
• Una breadboard
• Una batteria 9V
• La clip per la batteria 9V
• Un resistore da 470 Ohm
• Un potenziometro da 10 kOhm
• Tre fili colorati
Collega la clip della batteria alla batteria
Collega il positivo della batteria alla striscia rossa della breadboard
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 67', 67, 210);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 9', NULL, 'CAPITOLO 9
Collega il negativo della batteria alla striscia nera della breadboard
Inserisci il LED RGB nella breadboard
Collega il resistore da 470 Ohm tra il catodo del LED RGB e il negativo
della batteria , come sul disegno aggiungi un filo per collegare il
resistore al catodo del LED RGB
68 Laboratorio di elettronica: Impara e sperimenta
COS’È UN POTENZIOMETRO?
Inserisci il potenziometro nella breadboard
Collega il LED blu del LED RGB al pin 1 del potenziometro
Collega il LED rosso del LED RGB al pin 3 del potenziometro
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 69', 68, 156);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 9', NULL, 'CAPITOLO 9
Collega il pin 2 del potenziometro al positivo della batteria. Cosa succede?
Se il cursore si trova in una posizione intermedia vedrai una tonalità di viola!
Ruota ora il cursore verso sinistra e destra per vedere come si passa dal blu
al rosso e viceversa!
70 Laboratorio di elettronica: Impara e sperimenta', 70, 79);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 9', 'ESPERIMENTO 6', 'COS’È UN POTENZIOMETRO?
ESPERIMENTO 6
Costruiamo una lampada avendo la possibilità di poter scegliere abbastanza
facilmente quanto colore aggiungere per ogni luce colorata presente nel
LED RGB.
Per questo esperimento abbiamo bisogno di:
• Un LED RGB
• Una breadboard
• Una batteria 9V
• La clip per la batteria 9V
• Tre resistori da 470 Ohm
• Tre potenziometri da 10 kOhm
• Sette fili colorati
Collega la clip della batteria alla batteria.
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 71', 71, 134);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 9', NULL, 'CAPITOLO 9
Collega il negativo della batteria alla striscia nera della breadboard
Inserisci il LED RGB nella breadboard
Collega il catodo del LED RGB (la gambetta lunga) al negativo della batteria
con un filo
72 Laboratorio di elettronica: Impara e sperimenta', 72, 64);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 7', 'ESPERIMENTO 5', 'CAPITOLO 7 COS’È IL LED RGB?
ESPERIMENTO 5
Prendi un altro resistore da 470 Ohm e accendere tutti i colori
contemporaneamente
Accendendo tutti i colori contemporaneamente, dovresti in teoria ottenere
il bianco! Molto, ma molto probabilmente il colore che ottieni risulta
leggermente azzurrino, questo perché per ottenere un bel bianco hai bisogno
Abbiamo ottenuto il viola!
che il rosso sia più luminoso del verde e del blu!
Come facciamo? Basta abbassare la resistenza del LED rosso! Prova a
modificare il resistore del LED rosso abbassandolo prima a 330 Ohm e poi a
220 Ohm. Ti ricordi i colori? Se non li ricordi torna un attimo al capitolo sui
resistori!
40 Laboratorio di elettroLnaibcao:r aImtoprairoa d ei eslpeettrrimoneinctaa: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 41
COS’È UN POTENZIOMETRO?
Inserisci il primo potenziometro nella breadboard
Inserisci una resistenza da 470 Ohm tra il positivo della batteria e il
piedino del potenziometro come nel disegno
Inserisci il secondo potenziometro nella breadboard
Laboratorio di elettronica: Impara e sperimenta 73', 73, 274);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 9', NULL, 'CAPITOLO 9
Inserisci un’altra resistenza da 470 Ohm allineata al terzo piedino del
secondo potenziometro come hai fatto prima
Inserisci il 3° potenzometro con la sua resistenza da 470r
74 Laboratorio di elettronica: Impara e sperimenta
COS’È UN POTENZIOMETRO?
Collega il positivo della batteria alla linea rossa della Breardboard
Collega il pin 2 del terzo potenziometro al LED blu del LED RGB.
Se ruoti la manopola regoli la sua intensità luminosa
Laboratorio di elettronica: Impara e sperimenta 75', 74, 124);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 9', NULL, 'CAPITOLO 9
Se ruoti la manopola dalla parte opposta il LED si spegne
Collega il pin 2 del secondo potenziometro al LED verde del LED RGB.
Se ruoti la manopola regoli la sua intensità luminosa
76 Laboratorio di elettronica: Impara e sperimenta
COS’È UN POTENZIOMETRO?
Collega il pin 2 del primo potenziometro al LED rosso del LED RGB.
Se ruoti la manopola regoli la sua intensità luminosa
LED
Laboratorio di elettronica: Impara e sperimenta 77
COSTRUIAMO IL NOSTRO PRIMO ROBOT
5° PASSO:
Ora inserisci il nostro amico ELAB
sulla breadboard
centrando i due verdi.
Se hai collegato tutto correttamente ora puoi inserire il RGB nei quattro
fori sulla pancia di ELAB. RICORDATI anche il L RGBè polarizzato, quindi il
piedino più lungo devi inserirlo su g-25 di conseguenza gli altri tre andranno
su (g-24),(g-26) e (g-27).
Una volta inserito il L RGB piegalo sulla mano di ELAB e collega la batteria.
Appoggiando il magnete sul nostro amico gli si illumineranno gli occhi
dalla felicità e con i potenziometri potrai variare i colori al suo scettro.
Laboratorio di elettronica: Impara e sperimenta 111', 76, 273);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 9', 'ESPERIMENTO 7', 'Gioca ora con le regolazioni e crea il colore che ti piace di più!
Prova a chiedere un bicchierino del caffé (pulito) di plastica bianco e
poggialo sopra al LED RGB: diffonderà la luce! A proposito prova questo
esperimento al buio!
ESPERIMENTO 7
Vuoi provare ad aggiungere qualche pulsante?
78 Laboratorio di elettronica: Impara e sperimenta
COSTRUIAMO IL NOSTRO PRIMO ROBOT
5° PASSO:
Ora inserisci il nostro amico ELAB
sulla breadboard
centrando i due verdi.
Se hai collegato tutto correttamente ora puoi inserire il RGB nei quattro
fori sulla pancia di ELAB. RICORDATI anche il L RGBè polarizzato, quindi il
piedino più lungo devi inserirlo su g-25 di conseguenza gli altri tre andranno
su (g-24),(g-26) e (g-27).
Una volta inserito il L RGB piegalo sulla mano di ELAB e collega la batteria.
Appoggiando il magnete sul nostro amico gli si illumineranno gli occhi
dalla felicità e con i potenziometri potrai variare i colori al suo scettro.
Laboratorio di elettronica: Impara e sperimenta 111', 78, 248);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 9', 'ESPERIMENTO 8', 'ESPERIMENTO 8
Prova a fare insieme l’esperimento 6 e l’esperimento 5
ESPERIMENTO 9
Aggiungi un pulsante per accendere e spegnere il LED all’esperimento 8!
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 79
NOTE
80 Laboratorio di elettronica: Impara e sperimenta', 79, 77);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 10', NULL, 'CAPITOLO 10
COS’È UN FOTORESISTORE?
Un fotoresistore è un resistore che La sua resistenza diminuisce
cambia il suo valore di resistenza in all’aumentare della luce.
base a quanto viene illuminato. Ha due
(cid:91)(cid:70)(cid:81)(cid:84)(cid:87)(cid:78)(cid:5)(cid:73)(cid:78)(cid:5)(cid:87)(cid:74)(cid:88)(cid:78)(cid:88)(cid:89)(cid:74)(cid:83)(cid:95)(cid:70)(cid:5)(cid:1834)(cid:88)(cid:88)(cid:78)(cid:5)(cid:72)(cid:77)(cid:74)(cid:5)(cid:78)(cid:83)(cid:73)(cid:78)(cid:72)(cid:70)(cid:83)(cid:84)(cid:5) (cid:46)(cid:83)(cid:5)(cid:78)(cid:83)(cid:76)(cid:81)(cid:74)(cid:88)(cid:74)(cid:5)(cid:91)(cid:78)(cid:74)(cid:83)(cid:74)(cid:5)(cid:72)(cid:77)(cid:78)(cid:70)(cid:82)(cid:70)(cid:89)(cid:84)(cid:5)(cid:49)(cid:41)(cid:55)(cid:5)(cid:72)(cid:77)(cid:74)(cid:5)
quanto vale al buio completo e quanto è un acronimo che sta per Light
quando viene colpito da tanta luce, (cid:41)ependent (cid:55)esistor e il suo simbolo
ad esempio una torcia! elettrico è questo
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 81', 81, 269);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 10', 'ESPERIMENTO 1', 'CAPITOLO 10
ESPERIMENTO 1
Proviamo ad accendere un LED utilizzando un fotoresistore. Vogliamo che
il LED sia spento se facciamo ombra al fotoresistore e acceso se invece
è esposto alla luce.
Per questo esperimento abbiamo bisogno di:
• Un LED. Sceglilo del colore che ti piace di
più!
• Una breadboard
• Una batteria 9V
• La clip per la batteria 9V
• Un fotoresistore
Collega la clip della batteria alla batteria.
Collega il positivo e il negativo della batteria alla breadboard
82 Laboratorio di elettronica: Impara e sperimenta
COS’È UN FOTORESISTORE?
Collega il fotoresistore a cavallo della divisione centrale e usa un filo per
collegare il piedino al positivo
Collega l’anodo del LED con l’altro piedino della fotoresistenza e il catodo
del LED dopo la divisione centrale
Collega il negativo della batteria al catodo del LED
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 83', 82, 232);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 10', 'ESPERIMENTO 2', 'CAPITOLO 10
Prova ad illuminare il fotoresistore
In questo circuito non c’è bisogno di inserire un resistore in serie al LED
perché il fotoresistore anche quando illuminato ha una resistenza
abbastanza elevata da non bruciare il LED.
ESPERIMENTO 2
Prova adesso a cambiare il LED con uno di un colore diverso e osserva
come cambia il comportamento!
84 Laboratorio di elettronica: Impara e sperimenta', 84, 99);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 10', 'ESPERIMENTO 3', 'COS’È UN FOTORESISTORE?
ESPERIMENTO 3
In questo esperimento utilizzeremo un LED RGB e tre
fotoresistori per far cambiare con la luce il colore generato dal
LED RGB.
Per questo esperimento abbiamo bisogno di:
• Un LED RGB
• Una breadboard
• Una batteria 9V
• La clip per la batteria 9V
• Tre fotoresistori
• Tre fili colorati
Collega la clip della batteria alla batteria.
Collega il positivo della batteria alla striscia rossa della breadboard
Laboratorio di elettronica: Impara e sperimenta 85', 85, 123);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 10', NULL, 'CAPITOLO 10
Collega il negativo della batteria alla striscia nera della breadboard
Collega il catodo del LED RGB al negativo della batteria
Inserisci i tre fotoresistori nella breadboard con un piedino nella striscia
rossa e l’altro piedino in un punto qualunque della breadboard
86 Laboratorio di elettronica: Impara e sperimenta
COS’È UN FOTORESISTORE?
Collega il primo fotoresistore al LED blu del LED RGB
Collega il secondo fotoresistore al LED verde del LED RGB
Collega il terzo fotoresistore al LED rosso del LED RGB
Utilizzando una torcia o coprendo col dito i fotoresistori e osserva come
cambia il colore del LED RGB!
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 87', 86, 181);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 10', 'ESPERIMENTO 4', 'CAPITOLO 10
ESPERIMENTO 4
In questo esperimento useremo un LED bianco per illuminare un fotoresistore
e quindi cambiare la luminosità di un LED blu collegato al fotoresistore
Per questo esperimento abbiamo bisogno di:
• Una breadboard
• Una batteria 9V
• La clip per la batteria 9V
• Un LED bianco
• Un LED blu
• Un fotoresistore
• Un resistore da 470 Ohm
• Due fili colorati
Collega la clip della batteria alla batteria.
Collega il positivo della batteria alla striscia rossa e il negativo
della batteria alla striscia nera della breadboard
88 Laboratorio di elettronica: Impara e sperimenta
COS’È UN FOTORESISTORE?
Collega il fotoresistore tra il positivo della batteria e un punto qualunque
della breadboard
Collega il LED blu con l’anodo verso il fotoresistore e il catodo dopo la divisione
centrale della breadboard
Collega il catodo del LED blu al negativo della batteria con un filo
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 89', 88, 247);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 10', NULL, 'CAPITOLO 10
Collega il LED bianco vicino al fotoresistore con l’anodo connesso al positivo
della batteria
Collega il catodo del LED bianco ad un resistore da 470 Ohm e l’altro piedino
del resistore in un punto qualsiasi dopo la divisione centrale della breadboard
Collega il piedino libero del resistore al negativo della batteria
90 Laboratorio di elettronica: Impara e sperimenta', 90, 95);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 10', 'ESPERIMENTO 5', 'COS’È UN FOTORESISTORE?
Prova ad orientare la base del fotoresistore verso la testa del LED
e osserva come cambia la luminosità del LED blu.
Prova anche ad inserire un pezzetto di carta tra il fotoresistore e il
LED e osserva come cambia la luminosità del LED blu.
ESPERIMENTO 5
Partendo dall’esperimento 4 aggiungiamo un potenziometro per
cambiare l’intensità luminosa del LED bianco.
Prova a cambiare l’inclinazione del LED e del fotoresistore per
avere più luminosità.
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 91', 91, 142);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 10', 'ESPERIMENTO 6', 'ESPERIMENTO 6
Partendo dall’esperimento 4 aggiungiamo un pulsante per cambiare
l’intensità luminosa del LED blu solo quando premiamo il pulsante.
Prova a cambiare l’inclinazione del LED e del fotoresistore per
avere più luminosità.
NOTE
92 Laboratorio di elettronica: Impara e sperimenta', 92, 71);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 11', NULL, 'CAPITOLO 11
COS’È UN CICALINO?
Un cicalino è un componente
elettronico polarizzato (quindi che
ha un positivo e un negativo) che se
collegato ad una tensione suona. Nel
kit è presente un cicalino come questo
Un cicalino non ha bisogno di
resistori ma basta collegarlo
direttamente alla batteria per farlo
suonare.
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 93', 93, 103);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 11', 'ESPERIMENTO 1', 'CAPITOLO 11
ESPERIMENTO 1
Per questo esperimento abbiamo bisogno di:
• Un cicalino
• Una breadboard
• Una batteria 9V
• La clip per la batteria 9V
Collega la clip della batteria alla batteria.
Collega il positivo e il negativo della batteria alla striscia rossa e nera
della breadboard
94 Laboratorio di elettronica: Impara e sperimenta', 94, 84);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 11', 'ESPERIMENTO 2', 'COS’È UN FOTORESISTORE?
Collega ora il cicalino alla batteria collegando nero con nero e rosso con rosso
nel kit puoi tovare anche un cicalino con due piedini uno lungo (negativo) e uno
corto (positivo)
ESPERIMENTO 2
Prova ora a realizzare un circuito in cui il cicalino suona solo se premi
un pulsante. Ti ricordi come fare?
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 95
NOTE
96 Laboratorio di elettronica: Impara e sperimenta', 95, 120);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 12', NULL, 'CAPITOLO 12
L’INTERRUTTORE MAGNETICO
COS’È UN INTERRUTTORE MAGNETICO? Come suggerisce il suo simbolo,
dentro l’interruttore magnetico
( reed switch in inglese) ci sono due
Un interruttore magnetico è un
piccole particelle metalliche che non
componente che ha lo stesso principio
si toccano tra di loro, quindi quando
di funzionamento del pulsante, ma
non c’è il magnete vicino si comporta
anziché essere azionato con le dita,
come un circuito aperto e non scorre
viene attivato da un piccolo magnete!
corrente.
Quando invece avviciniamo il
COME FUNZIONA?
magnetino all’interruttore, le due
lamelline si toccano e quindi si chiude
Il funzionamento è molto semplice!
il circuito facendo scorrere corrente!
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 97', 97, 200);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 12', 'ESPERIMENTO 1', 'CAPITOLO 12
ESPERIMENTO 1
In questo esperimento applicheremo quanto fatto prima, ma anziché utilizzare
il pulsante, utilizzeremo un interruttore magnetico.
Per questo esperimento abbiamo bisogno di:
• Un LED, sceglilo del colore che ti piace di
più!
• Una breadboard
• Una batteria 9V
• La clip per la batteria 9V
• Un resistore da 470 Ohm
• Un interruttore magnetico
Collega la clip della batteria alla batteria.
Collega il positivo della batteria alla striscia rossa della breadboard
98 Laboratorio di elettronica: Impara e sperimenta
L’INTERRUTTORE AD INCLINAZIONE
Collega il resistore da 470 Ohm tra un punto qualsiasi della striscia rossa
e un punto qualsiasi della breadbord
Collega la gambetta lunga del LED verso il resistore e la gambetta corta
nel foro subito dopo la divisione centrale
Inserisci l’interruttore magnetico tra il catodo del LED e la striscia nera
inferiore della breadboard
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 99', 98, 249);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 12', 'ESPERIMENTO 2', 'CAPITOLO 12
Collega il negativo della batteria alla striscia nera della breadboard
Avvicina il magnete all’interruttore magnetico: il LED si accenderà!
ESPERIMENTO 2
Come fatto con il pulsante, prova a sperimentare con i valori di resistenza
per rendere più o meno luminoso il LED.
100 Laboratorio di elettronica: Impara e sperimenta', 100, 83);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 12', 'ESPERIMENTO 3', 'L’INTERRUTTORE AD INCLINAZIONE
ESPERIMENTO 3
Prova a realizzare un circuito che accenda un LED RGB del colore
che preferisci utilizzando un interruttore magnetico
ESPERIMENTO 4
Prova ad utilizzare insieme potenziometri, LED RGB e un interruttore
magnetico
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 101
NOTE
102 Laboratorio di elettronica: Impara e sperimenta', 101, 103);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 13', NULL, 'CAPITOLO 13
COS’È L’ELETTROPONGO?
L’elettropongo è una tipologia di PROCEDIMENTO
plastilina che però è conduttiva. (cid:22)(cid:19) (cid:50)(cid:74)(cid:89)(cid:89)(cid:78)(cid:5)(cid:78)(cid:81)(cid:5)(cid:88)(cid:70)(cid:81)(cid:74)(cid:5)(cid:78)(cid:83)(cid:5)(cid:90)(cid:83)(cid:70)(cid:5)(cid:85)(cid:74)(cid:83)(cid:89)(cid:84)(cid:81)(cid:70)
Possiamo quindi usarla per 2. Aggiungi l’acqua
modellare oggetti in grado di 3. Porta ad ebollizione per far
condurre elettricità. dissolvere parzialmente il sale
(cid:25)(cid:19) (cid:38)(cid:71)(cid:71)(cid:70)(cid:88)(cid:88)(cid:70)(cid:5)(cid:81)(cid:70)(cid:5)(cid:75)(cid:78)(cid:70)(cid:82)(cid:82)(cid:70)(cid:5)(cid:88)(cid:74)(cid:5)(cid:89)(cid:87)(cid:84)(cid:85)(cid:85)(cid:84)(cid:5)(cid:70)(cid:81)(cid:89)(cid:70)
(cid:26)(cid:19) (cid:38)(cid:76)(cid:76)(cid:78)(cid:90)(cid:83)(cid:76)(cid:78)(cid:5)(cid:81)(cid:1123)(cid:84)(cid:81)(cid:78)(cid:84)
LA RICETTA 6. Aggiungi il (cid:71)(cid:86)(cid:73)(cid:81)(cid:83)(cid:86)(cid:4)(cid:88)(cid:69)(cid:86)(cid:88)(cid:69)(cid:86)(cid:83) o il
succo(cid:4)di limone
(cid:28)(cid:19) (cid:38)(cid:76)(cid:76)(cid:78)(cid:90)(cid:83)(cid:76)(cid:78)(cid:5)(cid:85)(cid:78)(cid:70)(cid:83)(cid:5)(cid:85)(cid:78)(cid:70)(cid:83)(cid:84)(cid:5)(cid:81)(cid:70)(cid:5)(cid:75)(cid:70)(cid:87)(cid:78)(cid:83)(cid:70)(cid:4)e
INGREDIENTI
mescola continuamente
(cid:3282)(cid:5) (cid:23)(cid:24)(cid:21)(cid:82)(cid:81)(cid:5)(cid:73)(cid:78)(cid:5)(cid:70)(cid:72)(cid:86)(cid:90)(cid:70) con(cid:4)un cucchiaio da cucina
(cid:3282)(cid:5) (cid:22)(cid:27)(cid:21)(cid:76)(cid:5)(cid:73)(cid:78)(cid:5)(cid:75)(cid:70)(cid:87)(cid:78)(cid:83)(cid:70)(cid:5)(cid:21)(cid:5)(cid:84)(cid:5)(cid:21)(cid:21) fino ad(cid:4) ottenere una palla', 103, 438);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 13', NULL, '(cid:3282)(cid:5) (cid:22)(cid:27)(cid:21)(cid:76)(cid:5)(cid:73)(cid:78)(cid:5)(cid:88)(cid:70)(cid:81)(cid:74) (cid:29)(cid:19) u (cid:56) n (cid:85) i (cid:74) fo (cid:76) r (cid:83) m (cid:78)(cid:5)(cid:78) e (cid:81)(cid:5)(cid:75)(cid:90)(cid:84)(cid:72)(cid:84)
(cid:3282)(cid:5) (cid:22)(cid:27)(cid:76)(cid:5)(cid:73)(cid:78)(cid:5)(cid:71)(cid:86)(cid:73)(cid:81)(cid:83)(cid:86)(cid:4)(cid:88)(cid:69)(cid:86)(cid:88)(cid:69)(cid:86)(cid:83)(cid:5)(cid:84)(cid:5)(cid:22)(cid:29)(cid:5) (cid:30)(cid:19) (cid:49)(cid:70)(cid:88)(cid:72)(cid:78)(cid:70)(cid:5)(cid:87)(cid:70)(cid:75)(cid:75)(cid:87)(cid:74)(cid:73)(cid:73)(cid:70)(cid:87)(cid:74)
(cid:72)(cid:90)(cid:72)(cid:72)(cid:77)(cid:78)(cid:70)(cid:78)(cid:5)di succo di limone (cid:22)(cid:21)(cid:19)(cid:5)(cid:58)(cid:83)(cid:70)(cid:5)(cid:91)(cid:84)(cid:81)(cid:89)(cid:70)(cid:5)(cid:75)(cid:87)(cid:74)(cid:73)(cid:73)(cid:84)(cid:5)(cid:78)(cid:82)(cid:85)(cid:70)(cid:88)(cid:89)(cid:70)(cid:5)(cid:70)(cid:83)(cid:72)(cid:84)(cid:87)(cid:70)
(cid:3282)(cid:5) 2 cucchiai di olio vegetale un po’ per dare uniformità
(cid:3282)(cid:5) opzionale il colorante alimentare (cid:22)(cid:22)(cid:19)(cid:5)(cid:57)(cid:84)(cid:76)(cid:81)(cid:78)(cid:5)(cid:81)(cid:70)(cid:5)(cid:86)(cid:90)(cid:70)(cid:83)(cid:89)(cid:78)(cid:89)(cid:2308)(cid:5)(cid:73)(cid:70)(cid:5)(cid:72)(cid:84)(cid:81)(cid:84)(cid:87)(cid:70)(cid:87)(cid:74)(cid:5)(cid:74)
aggiungi il colorante alimentare
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 103', 103, 390);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 13', 'ESPERIMENTO 1', 'CAPITOLO 13
COME LO USIAMO?
Dopo aver seguito la ricetta, crea
Cerca di non creare pezzi troppo
la forma che preferisci. Puoi anche
grossi altrimenti è come avere una
utilizzare delle formine per biscotti in
resistenza più elevata e quindi i LED
modo da poter fare un animaletto,
che collegheremo si accenderanno
una stella, un cuore o quello che ti
poco.
piace di più!
ESPERIMENTO 1
Questo esperimento serve per capire il principio di funzionamento base
dell’elettropongo.
Per questo esperimento abbiamo bisogno di:
• Un LED, sceglilo del colore che ti piace di
più!
• Una batteria 9V
• L’elettropongo
Stacca due pezzettini di elettropongo, forma due striscettine e appoggiale
sul tavolo
Allarga le gambette del LED che hai scelto per infilare e inserisci ail LED nelle
due striscette di elettropongo
Avvicina la batteria (puoi anche usare la clip della pila se vuoi) alle due
striscette mettendo il positivo della batteria sull’anodo e il negativo sul catodo
Il LED si accenderà!
104 Laboratorio di elettronica: Impara e sperimenta', 104, 258);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 13', 'ESPERIMENTO 2', 'COS’È L’ELETTROPONGO?
ESPERIMENTO 2
Dai sfogo alla tua fantasia e prova a creare un circuiti artistico
utilizzando l’elettropongo e i LED!
Non è obbligatorio, ma i risultati migliori si ottengono utilizzando LED dello
stesso colore e scegliendo una zona in cui colleghi sempre il negativo e una
in cui colleghi sempre il positivo.
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 105
Qui sotto c’è qualche idea!
NOTE
106 Laboratorio di elettronica: Impara e sperimenta', 105, 128);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 14', NULL, 'CAPITOLO 14
COSTRUIAMO IL NOSTRO PRIMO ROBOT
1° PASSO:
Prendiamo la nostra breadboard e inseriamo tre potenziometri
seguendo la numerazione sulla breadboard, per indicarti il foro giusto
useremo in orizzontale i numeri da 1 a 30, in verticale le lettere da “a” a
“J”
1. potenziometro n°1 Pin e-1
2. potenziometro n°2 Pin e-5
3. potenziometro n°1 Pin e-9
e colleghiamo i pin dei potenziometri con tre resistenze da 220 Ohm
sulla linea del positivo
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 107', 107, 136);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 14', NULL, 'CAPITOLO 14
COLLEGHIAMO DUE LED:
Prendiamo due LED verdi, ricordati che il LED è polarizzato.
(Fatti aiutare ad accorciare i pin dei led in maniera che il led rimanga quasi
a filo delle breadboard).
1. Led1 gambetta lunga su g-15
2. Led1 gambetta corta su g-16
3. Led2 gambetta lunga su d-15
4. Led2 gambetta corta su d-16
Ora colleghiamo con due fili il punto f-15 con e-15 e f-16 con e-16 Inseriamo
una resistenza da 220 Ohm dal pin a-15 verso la linea del positivo
108 Laboratorio di elettronica: Impara e sperimenta
COSTRUIAMO IL NOSTRO PRIMO ROBOT
3° PASSO:
Colleghiamo i potenziometri.
Ora prendi tre fili lunghi e colleghiamoli come nella foto sottostante,anche qui,
fatti aiutare ad accorciare i fili in maniera che rimangano ben ordinati sulla
breadboard.
5. piedino potenziometro j-2 con punto j-27
6. piedino potenziometro j-6 con punto j-26
7. piedino potenziometro j-10 con punto j-24
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 109', 108, 249);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 14', NULL, 'CAPITOLO 14
4° PASSO:
Inseriamo l''interruttore magnetico
Ora inseriamo l''interruttore magnetico sulla breadboard
8. un piedino su g-18
9. un piedino su d-18
Ora colleghiamo i LED verdi al l''interruttore con un filo da j-16 a j-18
Colleghiamo anche i-18 con j-25
e infine, con un terzo cavo, colleghiamo c-16 con la linea del negativo
110 Laboratorio di elettronica: Impara e sperimenta', 110, 96);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 14', 'ESPERIMENTO 7', 'COS’È UN POTENZIOMETRO?
Collega il pin 2 del primo potenziometro al LED rosso del LED RGB.
Se ruoti la manopola regoli la sua intensità luminosa!
Gioca ora con le regolazioni e crea il colore che ti piace di più!
LED
Prova a chiedere un bicchierino del caffé (pulito) di plastica bianco e
poggialo sopra al LED RGB: diffonderà la luce! A proposito prova questo
esperimento al buio!
ESPERIMENTO 7
Vuoi provare ad aggiungere qualche pulsante?
Laboratorio di elettronica: Impara e sperimenta 77
78 Laboratorio di elettronica: Impara e sperimenta
COSTRUIAMO IL NOSTRO PRIMO ROBOT
5° PASSO:
Ora inserisci il nostro amico ELAB
sulla breadboard
centrando i due verdi.
Se hai collegato tutto correttamente ora puoi inserire il RGB nei quattro fori
sulla pancia di ELAB. RICORDA che anche il L RGB è polarizzato, quindi il
piedino più lungo devi inserirlo su g-25 di conseguenza gli altri tre andranno su
(g-24),(g-26) e (g-27).
Una volta inserito il L RGB piegalo sulla mano di ELAB e collega la batteria
Appoggiando il magnete sul nostro amico gli si illumineranno gli occhi
dalla felicità e con i potenziometri potrai variare i colori al suo scettro!
Laboratorio di elettronica: Impara e sperimenta 111
NON È FINITA QUI!
Speriamo davvero che ti sia divertito con questi esperimenti per avvicinarti
al mondo dell’elettronica!
Nei prossimi volumi approfondiremo i concetti illustrati in questo libro
entrando maggiormente nel dettaglio del funzionamento. Utilizzeremo nuovi
componenti e soprattutto inizieremo ad addentrarci nel magico mondo della
programmazione utilizzando il linguaggio Arduino e le sue schede elettroniche.
Grazie per averci seguito in questa prima avventura e speriamo di
accompagnarti anche nelle prossime tappe del
viaggio verso il mondo fantastico dell''Elettronica!
112 Laboratorio di elettronica: Impara e sperimenta
© 2024 ELAB. Tutti i diritti riservati.', 111, 468);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (1, 'CAPITOLO 14', 'ESPERIMENTO 7', 'Laboratorio di elettronica: Impara e sperimenta Nessuna parte di questo libro può essere riprodotta o distribuita in qualsiasi forma o con qualsiasi
mezzo, elettronico o meccanico, senza il permesso scritto dell''autore.
ELAB', 113, 56);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'Volume 2', NULL, 'LABORATORIO DI ELETTRONICA
II MM PP AA RR AA EE SS PP EE RR II MM EE NN TTAA
VOLUME 2
ELAB
© 2025 ELAB. Tutti i diritti riservati.
Nessuna parte di questo libro può essere riprodotta o distribuita in qualsiasi forma o con
qualsiasi mezzo, elettronico o meccanico, senza il permesso scritto dell''autore.', 1, 75);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'Capitolo 1', NULL, 'Indice
Capitolo 1- Altri cenni di storia dell’elettronica ..................................................... 05
Capitolo 2 - Cos’è l’elettricità? ............................................................................ 09
Capitolo 3 - Il Multimetro ...................................................................................... 13
Capitolo 4 - Approfondiamo le resistenze ............................................................. 37
Capitolo 5 - Approfondiamo le Batterie ................................................................. 47
Capitolo 6 - Approfondiamo i Led .......................................................................... 53
Capitolo 7 - Cosa sono i condensatori? ................................................................ 63
Capitolo 8 - Cosa sono i Transistor? ..................................................................... 75
Capitolo 9 - Cosa sono i fototransistor? ............................................................... 85
Capitolo 10 - Il motore a corrente continua .......................................................... 93
Capitolo 11 - I diodi ............................................................................................... 99
Capitolo 12 -Costruiamo il nostro primo Robot marciante! .................................. 103
Non è finita qui! ................................................................................................... 114
COMPONENTI DEL KIT
1x Breadboard 830 punti
1x Multimetro + puntalini a coccodrillo
Cavi di differenti lunghezze
1x Clip Batteria intestata con header
Resistori 4 Bande:
10x 100 Ohm
10x 220 Ohm
10x 330 Ohm
10x 470 Ohm
10x 1 kOhm
LEDs:
5x Blu
5x Rosso
5x Verde
5x Giallo
5x Bianco
5x RGB catodo comune
5x Pulsanti
4x Transistor
4x Diodi
4x Fotosensori
4x Condensatori da 1000uF
2x Motori a corrente continua
2x Ruote
4 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 3, 488);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 1', NULL, 'CAPITOLO 1
ALTRI CENNI DI STORIA
DELL’ELETTRONICA
L’Elettronica è una delle scoperte più
importanti nella storia dell’umanità. Ogni
giorno, in modo del tutto automatico,
utilizziamo dispositivi elettronici; lo
smartphone, i computer, le automobili,
i videogiochi. Possiamo affermare che
l''elettronica muove le nostre azioni. Ma
come ci siamo arrivati? Per capirlo,
dobbiamo tornare indietro nel tempo.
LA LEGGE DI OHM:
LE BASI DELL’ELETTRICITÀ.
Nel 1827, il fisico tedesco
Georg Simon Ohm studiò
il comportamento della corrente
elettrica nei circuiti e formulò una
legge fondamentale dell’elettricità. La
legge di Ohm - che prese il suo nome
- spiega la relazione tra tensione (V),
corrente (I) e resistenza (R)
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 5', 5, 202);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 1', NULL, 'CAPITOLO 1
Abbiamo già parlato della legge di L’INVENZIONE DEL MICROCHIP
Ohm nel primo volume di “Laboratorio
di Elettronica: Impara e Sperimenta”e Nel 1947 i tre scienziati americani
possiamo affermare che questa William Shockley, John Bardeen
scoperta è stata fondamentale per lo e Walter Brattain inventarono il
sviluppo della tecnologia elettrica ed transistor, un piccolo componente che
elettronica. svolgeva la stessa funzione delle
valvole, ma in modo più efficiente e
DALLA VALVOLA AL TRANSISTOR compatto. Questa invenzione
rivoluzionò la tecnologia e aprì la
Con la scoperta della legge di Ohm, strada all’elettronica moderna. Grazie
molti scienziati iniziarono a studiare alla creazione del transistor,
diversi modi per controllare l’elettricità. l’elettronica ebbe un gran successo
All’inizio del 900 furono inventate tanto da favorirne la diffusione.
le valvole termoioniche, componenti
che permettevano di amplificare e
controllare i segnali elettrici, ma ci
accorse - una volta installate nei primi
computer e nelle radio, che occupavano
molto spazio e consumavano molta
energia. Fu necessario quindi trovare
una soluzione per creare componenti
meno ingombranti affinché i dispositivi
fossero più piccoli e leggeri per essere
E IN FUTURO?
trasportati.
Ogni scoperta ha portato a nuove
invenzioni, che hanno cambiato
il mondo e il nostro stile di vita. Chissà
quali altre incredibili scoperte ci
riserverà il futuro!
6 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
ALTRI CENNI DI STORIA DELL’ELETTRONICA
NOTE
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 7
NOTE
8 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 6, 443);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 2', NULL, 'CAPITOLO 2
CHE COS’È L’ELETTRICITÀ
Finora abbiamo realizzato i circuiti
che funzionano con l’elettricità ma
non abbiamo ben spiegato cos’è.
La usiamo tutti i giorni senza
accorgercene; per accendere le luci,
far funzionare i videogiochi, ma non
possiamo né vederla né toccarla. Non
possiamo vederla perché è composta
da delle particelle molto piccoli che
non sono visibili ad occhio nudo.
Bentornati, sono Elab, il vostro
compagno di avventure!
In questo secondo volume
analizzeremo quanto visto
precedentemente e impareremo cose
nuove. Cominciamo ad approfondire il
tema dell''Elettricità.
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 9', 9, 171);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 2', NULL, 'CAPITOLO 2
Tutto ciò che ci circonda è fatto Questo fenomeno avviene perché gli
dalle stesse particelle invisibili elettroni si sono accumulati in un
chiamate atomi. posto e poi sono saltati via per
andare da un’altra parte.
Ogni atomo è poi composto da altre Praticamente le cariche si sono
particelle ancora più piccole, accumulate in un punto e poi
potremmo immaginare un sistema improvvisamente si sono spostate in
solare ma in miniatura: un altro punto sprigionando molta
energia.
•Al centro c’è il “sole” (il nucleo).
•Intorno al “sole” girano i “pianeti”
L’ELETTRICITÀ CHE USIAMO:
super veloci e invisibili che si
GLI ELETTRONI IN VIAGGIO!
chiamano elettroni.
L’elettricità che fa funzionare la
Gli elettroni hanno una carica
TV o un robot non è “ferma”, ma in
elettrica negativa. Hai presente i
movimento. Pensa ad un fiume e
magneti che attacchiamo al
immagina che l’acqua che scorre
frigorifero? Ecco, gli elettroni hanno la
rappresenti gli elettroni che si
funzione di attrarre o respingere.
muovono. L’elettricità che sfruttiamo
è proprio questo: un flusso di
L’ELETTRICITÀ STATICA: LA MAGIA CHE
elettroni che si spostano in una
PUOI SENTIRE (E VEDERE!)
direzione specifica. Questo flusso è
chiamato corrente elettrica.
A volte, gli elettroni possono essere
“strappati” da un oggetto
e portati su un altro. Hai mai provato a
strofinare un palloncino sui capelli e
poi attaccarlo al muro? Hai mai preso
una piccola scossa sulla maniglia
della porta dopo aver camminato sul
tappeto? Bene, questo succede per
via dell’elettricità statica!
10 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 10, 411);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, '1. L', NULL, 'CHE COS’È L’ELETTRICITÀ
DA DOVE VIENE QUESTA “SPINTA”
PER FAR MUOVERE GLI ELETTRONI?
Per far muovere l’acqua nel fiume
serve una pendenza, giusto? Per gli
elettroni, serve una “spinta” o una
“pressione”. Questa spinta è data da Prima di fare qualsiasi esperimento
una fonte di energia come: con l’elettricità:
• Una batteria (la nostra
“pompa” portatile che spinge gli
1. Lavoriamo solo con batterie o
elettroni);
alimentatori a bassa tensione!
• Una presa domestica (l’energia
Sono sicuri per i nostri
che arriva dalla centrale elettrica,
esperimenti.
che è una pompa gigante).
Possiamo dire in sintesi che:
L’elettricità è il movimento degli
2. Facciamo i nostri esperimenti lontano
dall''acqua!
elettroni. Queste piccolissime
particelle cariche viaggiano L’acqua è un buon conduttore e
attraverso dei materiali che li rende l’elettricità molto più
lasciano passare (come i fili di pericolosa.
rame) per portare energia da un
punto all’altro e far funzionare gli
oggetti che usiamo. In questo kit, come
nel precedente, utilizziamo batterie a
bassa tensione, questo ci consente
3. Chiedi sempre aiuto a un
di non correre alcun pericolo anche adulto se hai il dubbio di
se le tocchiamo. L’elettricità però non non essere al sicuro.
va sottovalutata poiché il nostro
corpo è come un grande resistore.
Cosa significa? Significa che contiene
una grande quantità di energia e può
far scorrere corrente!
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 11
NOTE
12 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 11, 400);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 3', NULL, 'CAPITOLO 3
IL
MULTIMETRO
CHE COS’È IL
MULTIMETRO?
• un Ohmmetro: per misurare la
Il multimetro, come dice la parola stessa, è resistenza
un multi-misuratore . E'' lo strumento grazie • un Amperometro: per misurare la
al quale con un unico apparecchio corrente
possiamo
misurare le diverse
grandezze
• un Voltmetro: per misurare la
elettriche. tensione
!
Nel corso di questo libro
raffigureremo il multimetro anche in
questo modo per semplicità.
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 13', 13, 135);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 3', NULL, 'CAPITOLO 3
COME FAR FUNZIONARE IL MULTIMETRO COLLEGA I PUNTALI:
Per poter utilizzare il multimetro Per utilizzare il multimetro e le sue
dobbiamo eseguire dei passaggi funzioni abbiamo bisogno dei puntali
affinché funzioni correttamente. che vanno inseriti nel posto giusto!
INSERISCI LA BATTERIA I puntali sono sempre uno rosso e
uno nero. Nel multimetro ci sono tre
Il multimetro, come tutti i circuiti fori in cui poterli inserire.
elettronici, ha bisogno di essere
alimentato da energia, proprio come i
circuiti che abbiamo realizzato finora.
Per mettere in funzione il multimetro
dovrai inserire una batteria da 9V.
Giralo! Ecco, sul sul retro c''è uno
sportellino, è proprio lì che aprendolo,
dovrai inserire con cura la tua
Il morsetto “COM” (Nero): nel
batteria da 9V.
morsetto COM va sempre inserito
il puntalino NERO.
Presta attenzione ai simboli + e - ed
• Il morsetto “VΩmA” (Rosso - per
inserisci la batteria nello stesso verso
Volt, Ohm e milliAmpere): è il
facendo combaciare i simboli con
morsetto più utilizzato, quello per
quelli presenti sulla batteria. Richiudi
misurare la tensione (Volt), la
lo sportellino, ora il tuo multimetro è
resistenza (Ohm) e la corrente
pronto per essere utilizzato.
piccola (milliAmpere).
Qui va inserito il cavo ROSSO per
quasi tutte le misure.
• Il morsetto “10A” (per Correnti
Grandi): il morsetto 10A, si
utilizza solo per misurare
correnti molto elevate, fino a 10
Ampere.
14 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
IL MULTIMETRO
Per gli esercizi di questo kit NON
useremo MAI questo connettore,
quindi i puntalini andranno sempre
inseriti come indicato in figura.
FUNZIONI DISPONIBILI
Guarda il tuo multimetro. Il tuo
LE PINZE A COCCODRILLO:
multimentro ha un selettore rotativo
al centro e tanti numeri e simboli tutti
Normalmente i multimetri hanno
intorno. Questa manopola ti permette
puntali con punte sottili e appuntite. I
di selezionare cosa vuoi che il', 14, 492);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 3', NULL, 'puntali sono però scomodi da
multimetro misuri.
utilizzare perché non sono stabili, ma
con le pinze a coccodrillo invece riesci
Puoi ruotarla in qualsiasi
a “mordere” (da qui il nome
direzione. Posizionandola
coccodrillo) i punti in cui vuoi che il
esattamente al centro, punterà verso
multimetro venga posizionato senza
la scritta OFF.
dover lottare per tenere i puntali fermi.
Questo ti consente di essere più
In questa posizione il multimetro
concentrato sull’utilizzo del
è spento.
multimetro e poter leggere più
comodamente le misure che stai
È molto importante ricordare di
effettuando. Quindi non preoccuparti
posizionare sempre la manopola su
se online trovi del materiale didattico
OFF quando hai terminato il tuo
con i puntali standard, i tuoi sono
lavoro. In questo modo la batteria del
semplicemente più comodi da
multimetro non si scaricherà
utilizzare!
inutilmente!
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 15', 15, 244);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 3', NULL, 'CAPITOLO 3
MISURIAMO LA TENSIONE DELLE
BATTERIE: TENSIONE CONTINUA (DC)
Quando ruoti la manopola verso
sinistra (guarda la zona gialla nella
foto), trovi la sezione per misurare le
tensioni continue. Queste sono le
tensioni che trovi nella maggior parte
dei circuiti elettronici o delle varie
batterie che li alimentano. Le tensioni
continue sono spesso abbreviate con
la sigla DC (in inglese Direct Current).
Le tensioni spesso sono Per il multimetro è uguale!
impropriamente dette Voltaggio, ma
questo termine è solo una traduzione Regola d’oro: scegli un numero che
errata dall’inglese (Voltage). Voltaggio sia appena più grande del valore che ti
in Italia è solo un paese in provincia di aspetti di misurare.
Alessandria!
Se misuri una batteria da 1.5 Volt
(come una AA o AAA), ruota la
SCEGLI LA SCALA GIUSTA:
manopola su 2V. Se misuri una
IL “FONDO SCALA”
batteria da 9 Volt ruota invece la
manopola su 20V.
Vicino alla “V” (che indica Volt) vedrai
diversi numeri: 0.2, 2, 20, 200, 600 e
così via. Questi numeri indicano il
“fondo scala” dello strumento, cioè il
valore massimo di tensione che il
multimetro può misurare in quel
momento. Se volessi misurare
l’altezza di un tuo amico, useresti un
metro da sarto
oun metro da muratore? Quello da
sarto arriva a 1,5 metri, mentre quello
da muratore fino a 100 metri. Troppo
grande e poco preciso vero?
16 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 16, 363);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 3', 'ESPERIMENTO 1', 'IL MULTIMETRO
ESPERIMENTO 1
Controlliamo la carica della tua batteria da 9V!
Oggi usiamo il multimetro per scoprire quanta carica c’è in una batteria da 9V.
È come dare un’occhiata dentro per vedere se è ancora “piena” o se sta per
“esaurirsi”!
Cosa ti serve:
Il multimetro
Una batteria da 9 Volt
Preparazione del multimetro:
Prendi il cavo nero e inseriscilo nella porta COM
Prendi il cavo rosso e inseriscilo nella porta contrassegnata con VΩmA
Guarda il selettore rotativo del multimetro. Trova la sezione con la lettera “V”
e una linea dritta sopra e una linea tratteggiata sotto (o a volte solo “DCV” o
“VDC”). Questo simbolo indica la Tensione Continua, quella delle batterie.
Ora, dobbiamo scegliere la scala giusta. La batteria è da 9 Volt, quindi
dobbiamo scegliere una scala che sia appena più grande di 9V. Sul tuo
multimetro, cerca il numero 20V in quella sezione.
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 17', 17, 243);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 3', NULL, 'CAPITOLO 3
Ruota la manopola esattamente su 20V.
Misuriamo la Batteria da 9V:
Identifica i poli della batteria:
Guarda i bottoncini sulla batteria da 9V. Uno è più grande (esagonale) e
l’altro più piccolo (rotondo). Il bottoncino più grande è il negativo (-),
quello più piccolo è il positivo (+)
Inserisci la clip della batteria 9V così da
poter pinzare con i puntali con i coccodrilli le
terminazioni della clip
Aggancia il coccodrillo del cavo rosso
sul positivo (+) della batteria.
Aggancia il coccodrillo del cavo nero
sul negativo (-) della batteria. Guarda il
numero che appare sul display del
multimetro.
Se vedi circa “9.XX” (es. 9.30, 9.15, 9.00)
Ottimo! La tua batteria è carica e pronta all’uso! Le batterie nuove
spesso misurano anche un po’ più di 9V (tipo 9.30V o 9.6V)
Se vedi un numero più basso (es. 7.50, 6.00, 5.00, 0.50)
La tua batteria è quasi o completamente scarica
È ora di cambiarla!
18 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
IL MULTIMETRO
Se vedi un numero con un segno meno davanti (es. “-9.25” o “-8.80”)
Nessun problema, significa solo che hai collegato i coccodrilli al contrario.
Il cavo rosso è sul negativo della batteria e il cavo nero è sul positivo.
Basta invertire i coccodrilli (rosso sul positivo e nero sul negativo)
e vedrai il numero giusto senza il meno.
Vedi “OL” o “1.” sul display
Significato: Over Load (sovraccarico) o il multimetro non può leggere
su questa scala perché è sbagliata.
Molto probabilmente hai posizionato la manopola su una scala troppo
piccola
(es. 2V anziché 20V). Ricontrolla e assicurati che sia su 20V. Se lo hai
posizionato su una scala per la corrente o la resistenza, il multimetro
non capisce cosa misurare.
Bene, ora sai come misurare le batterie!
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 19', 18, 469);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 3', 'ESPERIMENTO 2', 'CAPITOLO 3
ESPERIMENTO 2
Ora che hai imparato ad utilizzare il multimetro, passiamo
dalla teoria alla pratica: misuriamo la tua batteria da 9V
presente nel Kit!
Ogni volta che userai il kit e misurerai la batteria, segna qui sotto la data e
il valore in Volt che leggi sul multimetro. Così potrai tenerne d’occhio la
carica e capire quando è il momento di sostituirla. Se hai una
batteria ricaricabile, potrai anche controllare lo stato di
avanzamento della sua carica.!
Data_________Misura________ Data_________Misura________
Data_________Misura________ Data_________Misura________
Data_________Misura________ Data_________Misura________
Data_________Misura________ Data_________Misura________
Data_________Misura________ Data_________Misura________
Data_________Misura________ Data_________Misura________
Data_________Misura________ Data_________Misura________
Data_________Misura________ Data_________Misura________
Data_________Misura________ Data_________Misura________
Data_________Misura________ Data_________Misura________
20 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
IL MULTIMETRO
COME MISURARE LE RESISTENZE Se il display mostra “OL” o “1.”
(come per le batterie), significa che la
Continuando a ruotare il selettore resistenza è troppo alta per la scala
rotativo verso sinistra, arriviamo sul che hai scelto.Ruota la manopola su
simbolo degli Ohm (Ω). Guarda una scala più grande!
l’immagine sotto per chiarezza. Se il display mostra “0.00” o un valore
molto vicino allo zero, significa che la
resistenza è molto piccola. Ruota la
manopola su una scala più piccola
per avere una lettura più precisa.
controllare l''immagine come fondo
scala 200kohm invece di 2-20M
Anche qui, in base a ciò che
dobbiamo misurare, va selezionato il
fondo scala più adeguato:
Scegli sempre la scala appena più
grande di resistenza che ti aspetti di
trovare. Non sai il valore della
resistenza?
Non preoccuparti! Puoi iniziare dalla', 20, 494);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 3', 'ESPERIMENTO 2', 'scala più alta (tipo 2M o 20M Ω) e
poi scendere gradualmente fino ad
ottenere una misura più precisa.
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 21', 21, 50);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 3', 'ESPERIMENTO 3', 'CAPITOLO 3
ESPERIMENTO 3
Misuriamo una Resistenza da 330 Ohm!
Ora mettiamo in pratica quello che abbiamo imparato e misuriamo una vera
resistenza. Useremo il nostro multimetro per scoprire se quella resistenza ha
davvero il valore che ci aspettiamo: 330 Ohm!
Per questo esperimento hai bisogno di:
-Il multimetro
-Un resistore da 330 Ohm. Aiutati con
l’immagine accanto se non ricordi i
colori!
Assicurati che il cavo nero sia inserito nella porta (COM) e che il cavo rosso
sia inserito nella porta con il simbolo (V ΩmA)
Ruota il selettore fino a selezionare la scala più appropriata. Il valore atteso è
intorno ai 330 Ohm, quale pensi sia quella giusta?
Ricorda: per misurare una resistenza guarda il selettore del multimetro nella
sezione dell’Omega (Ω). Cerca i numeri come 200, 2k, 20k, 200k
22 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
IL MULTIMETRO
Per una resistenza da 330 Ohm, la scala migliore da scegliere è quella più
piccola ma comunque superiore a 330 Ohm.
La prima scala più vicina a 330 è 2k. Ruota quindi la manopola su 2k
Prendi il tuo resistore e aggancia i coccodrilli alle due estremità.
Considerando che i resistori non sono componenti polarizzati, non
importa come colleghi i coccodrilli!
Cosa leggi sul display?
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 23', 22, 347);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 3', NULL, 'CAPITOLO 3
Mentre misuri potresti vedere diversi risultati!
Ad esempio 314, 326, 340
Fantastico! Hai misurato correttamente la resistenza.
Il numero è vicino a 330 Ohm. I resistori reali non sono mai esattamente
precisi, quindi un valore leggermente diverso è normale.
La piccola differenza è dovuta alla tolleranza della resistenza. Ricorda che i
resistori di questo kit hanno una tolleranza del 5%, quindi i valori che leggi
hanno questo scarto!
Se vedi OL o 1
Esattamente come visto per le batterie, significa Over Load (sovraccarico).
Il multimetro non riesce a leggere un valore su quella scala. Il resistore che
stai cercando di misurare è più grande del fondo scala. Questo può
accadere se hai messo la manopola su una scala troppo piccola (es. 200
anziché 2k).
Se vedi 0.0 o un numero molto vicino a zero (es. “0.1” o “0.2”)
Probabilmente hai scelto una scala troppo grande oppure i puntali si
stanno toccando tra di loro causando un corto circuito. Un cortocircuito ha
una resistenza molto piccola ecco perché vedi un valore così vicino allo zero.
24 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
IL MULTIMETRO
Se vedi un numero che cambia continuamente significa che il contatto tra
i puntali e la resistenza non è stabile. Stai toccando i terminali in modo leggero
o instabile, Prova a riposizionare i coccodrilli in modo che mordano
correttamente i terminali del resistore. Puoi anche provare a piegarli
leggermente in modo che tocchino anche la parte esterna del coccodrillo!
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 25', 24, 409);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 3', NULL, 'CAPITOLO 3
MISURIAMO LA CORRENTE (AMPERE):
Ora che abbiamo misurato le
tensioni (Volt) e le resistenze
(Ohm), è il momento di misurare la
corrente (Ampere)! Questa è forse la
misurazione più delicata, ma anche la
più affascinante perché è in grado di
COME IMPOSTARE IL MULTIMETRO PER
dirci per quanto tempo possono
MISURARE LA CORRENTE.
funzionare i nostri circuiti. Come già
detto, la tensione è come la pressione
Negli esercizi di questo kit
dell’acqua in un tubo e la resistenza il
misureremo sempre correnti piccole
suo diametro, mentre la corrente
(qualche decina di mA). Per questo
è la quantità di acqua che scorre
motivo non useremo mai la porta del
effettivamente da quel rubinetto.
multimetro con scritto 10A, ma la
stessa che abbiamo già utilizzato per
misurare tensioni e resistenze. I fondo
scala disponibili sul multimetro sono
diversi e come al solito vanno usati in
base al contesto di misurazione.
Quelli disponibili sono:
• 2000μA (cioè 2mA): una corrente
davvero molto piccola che può
essere letta solo con resistori
Misurare la corrente è diverso. Per molto elevati;
misurare la tensione si posizionano i • 20mA: una corrente che troveremo
puntali sul circuito, mentre per la nei circuiti in cui sono presenti i
corrente il multimetro deve diventare LED e useremo questo fondo
una parte del circuito stesso, come scala!
un pezzo del tubo dove scorre • 200mA: una corrente che
l’acqua. possiamo leggere se ci sono dei
motorini.
26 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
IL MULTIMETRO
Prima di lanciarci a capofitto nel Utilizzando la figura possiamo
nostro esperimento di misura della invocare il grande potere del Triangolo
corrente, proviamo a cercare con la di Ohm che abbiamo studiato nel
teoria il risultato che vedremo sul Volume 1. Abbiamo sia la tensione
multimetro. Lo so che sembra noioso, (9V) che il valore della resistenza
ma prima di fare una misura è sempre (1000Ohm) quindi per ottenere la', 26, 495);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 3', NULL, 'bene accertarsi di avere almeno una resistenza attesa ci basta dividere la
vaga idea di quello che ci troveremo tensione per la corrente.
davanti. Vogliamo misurare la I = V÷R = 9V / 1kOhm = 9mA
corrente che scorre in un resistore da Considerato che la corrente attesa è
1000Ohm (quindi 1 kOhm) collegato di 9mA, il fondo scala più appropriato
ad una batteria da 9V. Una misura sarà 20mA!
davvero semplice! Per capire cosa ci
dobbiamo aspettare, possiamo
utilizzare la Legge di Ohm. Ricordi
come trovare la corrente?
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 27', 27, 153);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 3', 'ESPERIMENTO 4', 'CAPITOLO 3
ESPERIMENTO 4
Fantastico! Ora che il multimetro è impostato correttamente per misurare la
corrente, vediamo come fare praticamente la misurazione sul circuito con
il resistore e la batteria 9V.
Costruiamo insieme il circuito di base e poi capiremo come
inserire il multimetro.
Collega la clip della batteria alla batteria
Collega il positivo della batteria
Collega il positivo della batteria alla striscia rossa superiore della
breadboard
Collega il resistore da 1 kOhm tra un punto qualsiasi della striscia rossa e
un punto qualsiasi della zona al di sotto
28 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
IL MULTIMETRO
Con il coccodrillo rosso mordi un reoforo del resistore che hai appena
inserito, mentre con quello nero il cavetto nero della batteria.
Praticamente hai inserito il multimetro in serie al resistore. Come abbiamo
già detto, per effettuare una misura di corrente il multimetro deve
diventare un pezzo del circuito. In buona sostanza si comporta da cavetto
speciale: mette in comunicazione due punti e inoltre ci restituisce il valore
di corrente che lo attraversa!
Sul display leggerai circa 9mA, ma potresti anche leggere un
valore leggermente più alto (resistenza più bassa) o leggermente più basso
(resistenza più alta). I resistori hanno una
tolleranza ricordi? I resistori che utilizziamo hanno una tolleranza del 5% ,ciò
vuol dire che il nostro resistore può valere al massimo:
1000 Ohm + 5% = 1050 Ohm
1000 Ohm - 5% = 950 Ohm
Proviamo a fare i calcoli per trovare la corrente massima e quella minima che
puoi leggere! Chiameremo il valore di 1050 Ohm RMAX, mentre il valore di 950
Ohm Rmin.
Per calcolare la corrente massima dobbiamo utilizzare la resistenza minima
(perché se è più bassa fa passare più corrente):
IMAX = V/Rmin = 9V/950 Ohm = 9.47 mA
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 29', 28, 484);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 3', NULL, 'CAPITOLO 3
Per calcolare invece la corrente minima dobbiamo usare la resistenza
massima (perché fa passare meno corrente):
Imin = V/RMAX = 9V/1050 Ohm = 8.57 mA
Ovviamente per fare questi calcoli abbiamo assunto che il valore della batteria
sia di 9V esatti, ma sappiamo che non è così! Misura la tua batteria, misura la
tua resistenza e successivamente applica la legge di Ohm. Il tuo multimetro
legge quello che ti aspetti con il calcolo con i valori reali dei componenti che
stai utilizzando?
Annota qui i risultati che hai ottenuto:
___________________________________________________
___________________________________________________
___________________________________________________
___________________________________________________
___________________________________________________
___________________________________________________
___________________________________________________
___________________________________________________
___________________________________________________
___________________________________________________
30 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
IL MULTIMETRO
Prova ora ad invertire il coccodrillo rosso con coccodrillo nero
del multimetro. Cosa ti aspetti che succeda?
Collegando i coccodrilli “al contrario” rispetto a quanto fatto prima, ottieni lo
stesso risultato, ma col il segno negativo! Questo succede perché il
multimetro misura secondo “convenzione”. La convenzione
è un modo di fare le cose. Nel caso del multimetro ci dice che il coccodrillo
rosso deve essere collegato verso il punto
più positivo del circuito, mentre quello nero verso il punto più negativo.
Praticamente il coccodrillo rosso deve puntare verso il positivo della batteria,
mentre il coccodrillo nero verso il negativo della batteria. Prova adesso a
modificare il circuito aumentando o diminuendo il valore dl resistore. Prima
odopo aver effettuato la misura, controlla con il multimetro i valori reali e', 30, 498);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 3', NULL, 'applica la legge di Ohm per controllare se hai effettuato i calcoli in maniera
corretta. Padroneggiare la legge di Ohm vi consentirà di diventare maghi
dell’elettronica!
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 31', 31, 67);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 3', NULL, 'CAPITOLO 3
NOTE
32 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
IL MULTIMETRO
COME IMPOSTARE IL MULTIMETRO
PER MISURARE LA CONTINUITÀ: DUE
PUNTI SONO CONNESSI?
Innanzitutto ruota il selettore sul
simbolo corretto, quello con l''icona del
diodo e di un’onda(sonora).
La continuità ci consente di capire se
due punti sono collegati tra di loro.
Per utilizzare questa funzione il
circuito da controllare deve però CONTROLLARE UN FILO: IL FILO È ROTTO?
essere spento, quindi prima di
utilizzare questa funzione rimuovi la Poiché un filo è un cortocircuito, ma i
batteria dal tuo circuito! fili si possono spezzare, con la
continuità possiamo verificare che il
Se due punti sono connessi tra di loro, filo non sia interrotto. Prova a
quindi con un cortocircuito, il prendere uno dei fili colorati del kit e a
multimetro emetterà un beep che pinzare i due estremi. Se il filo non è
indica la corretta connessione. rotto il multimetro emetterà il
beeeeeeep!
Per provare molto velocemente
questa funzione prova, dopo aver
selezionato col selettore la corretta
funzione, a far toccare tra di loro
i due coccodrilli: il tester suonerà!
Puoi giocare a suonare una melodia
facendo toccare tra loro i coccodrilli,
ma potrebbe diventare fastidioso!
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 33', 32, 345);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 3', NULL, 'CAPITOLO 3
CONTROLLARE IL CORRETTO Utilizzando la funzione continuità del
multimetro possiamo ora provare il
FUNZIONAMENTO DI UN PULSANTE
corretto funzionamento del pulsante.
Nel Volume 1 di "Laboratorio di
Per prima cosa controlliamo le due
Elettronica: Impara e Sperimenta",
coppie di piedini che sono sempre
abbiamo già utilizzato dei pulsanti
collegate tra di loro.
come quello della figura
sottostante.
Per farlo, dopo aver impostato il
multimetro in continuità, pinza con i
coccodrilli i due lati del pulsante
come mostrato nella figura
sottostante.
Abbiamo detto che anche se ha
quattro pin, due coppie sono sempre
collegate tra di loro e quando viene
premuto invece vengono messe in
comunicazione le altre perché un
Se i piedini del pulsante non sono
pezzettino metallico si sovrappone
interrotti, perché si sono danneggiati
su di loro. In particolare quando il
durante l’utilizzo, il tuo multimetro
pulsante NON è premuto, i due
dovrebbe emettere il famigerato
piedini rossi sono sempre in
comunicazione con un cortocircuito, beep!
mentre quando viene premuto si
mette in comunicazione il lato rosso Ripeti adesso la stessa operazione
con il lato blu. per le altre due coppie dal lato
opposto!
34 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
IL MULTIMETRO
Ora controlliamo che quando il La funzionalità di continuità del tester
pulsante viene premuto, è uno strumento utilissimo per ogni
i due lati opposti si collegano tra di giovane esploratore dell’elettronica.
loro attraverso la lamella che viene
messa giù dalla molla. Per fare Permette di capire se due punti sono
questo, pinza con i coccodrilli i due collegati tra loro senza dover
lati opposti del pulsante come smontare tutto o perdere tempo.
mostrato dalla figura sottostante
È come avere un super potere per
“vedere” dentro i fili e le piste dei
circuiti!
Pu aiutarti a trovare fili interrotti,
controllare se un interruttore funziona,
verificare se un circuito è chiuso e', 34, 498);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 3', NULL, 'pronto a far passare la corrente.
Usare la funzionalità di continuità del
tester è semplice e ti permette di
Se il pulsante funziona correttamente
scoprire tantissimo: proprio come un
quando non è premuto il multimetro
detective dell’elettricità!
non deve emettere alcun suono,
mentre appena lo premi emette un
Ricorda però di utilizzarla sempre
beeeep!
dopo aver rimosso l’alimentazione dal
circuito da analizzare, noi utilizziamo
la batteria da 9V negli esercizi della
nostra collana.
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 35
NOTE
36 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 35, 172);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 4', NULL, 'CAPITOLO 4
APPROFONDIAMO LE RESISTENZE
LA SERIE STANDARD E12
In questo capitolo approfondiremo
quanto visto nel Volume 1 di
"Laboratorio di Elettronica: Impara e
Sperimenta".
I valori standard o normalizzati per i
Abbiamo già parlato dei resistori e resistori sono stabiliti in base alla
abbiamo capito a cosa servono e norma IEC 60063, che fissa delle
come sono fatti, ma era solo tabelle da utilizzare a seconda della
un’introduzione da approfondire. tolleranza In base ad essa si può
conoscere quali valori di resistori sono
Abbiamo appreso che le resistenze
disponibili in commercio.
sono come dei “rubinetti” che
rallentano l’elettricità, giusto? E
abbiamo imparato a leggerne il valore È come se avessero detto: “Ok, non
dai colori. possiamo avere tutti i valori, ma
scegliamo alcuni valori ‘giusti’ che ci
Ora immagina di dover costruire molti permettano di coprire quasi tutte le
circuiti diversi tra loro. Ti aspetti che i necessità.”
negozi di elettronica vendano
resistenze con ogni valore possibile Ricordi la nozione sulla tolleranza dei
(tipo 1 Ohm, 1.1 Ohm, 1.2 Ohm, 1.3 resistori? Ecco, sfruttando questo
Ohm, e così via all’infinito)? Non è concetto si possono scegliere i valori
così, sarebbe un caos! della serie E12.
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 37', 37, 333);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 4', NULL, 'CAPITOLO 4
Questi 12 numeri sono solo la
La Serie E12 è una lista di “valori
base. Per ottenere i valori reali delle
scelti con cura”. È una delle serie più
resistenze, moltiplichiamo questi
comuni e utili, soprattutto per chi
numeri per 10, 100, 1000, 10000e
come te inizia ad esplorare il mondo
così via.
dell’elettronica.
Il “12” nella Serie E12 sta ad indicare Valori da “dieci” a “cento” Ohm:
che per ogni “gruppo” di valori (come i
10 Ohm
valori tra 10 e 100 Ohm, o tra 100 e
12 Ohm
1000 Ohm), ci sono 12 valori diversi
15
che puoi trovare.
...per arrivare fino ad 82 Ohm.
Perché sono importanti questi 12
Valori da “cento” a “mille” Ohm:
valori?
100 Ohm
120 Ohm
Se si prende un resistore di un valore
150 Ohm
presente nella Serie E12 e il suo
...fino a 820 Ohm.
valore subito successivo, non c’è un
divario di valori troppo elevato tra di
Valori da “mille” a “diecimila” Ohm:
loro. Questo ci consente di coprire
oapprossimare quasi tutti i valori di 1 kOhm
resistenza senza dover inventare un 1.2 kOhm
resistore di valore assurdo. 1.5 kOhm
...fino a 8.2 kOhm
ECCO I 12 “NUMERI BASE” DELLA SERIE E12:
1. 1.0 7. 3.3
2. 1.2 8. 3.9
3. 1.5 9. 4.7
4. 1.8 10. 5.6
5. 2.2 11. 6.8
6. 2.7 12. 8.2
38 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
APPROFONDIAMO LE RESISTENZE ?
Quando acquisti i resistori per i tuoi
progetti o quando li trovi in un kit COLLEGAMENTO SERIE
come questo che stai utilizzando, la
maggior parte delle resistenze ha
Si parla di collegamento serie quando
valori che rientrano in questa serie
colleghiamo tra di loro due (o più)
standard. Raramente troverai una
resistori in fila indiana. Proprio come
resistenza da 1.6 kOhm
quando colleghiamo un piedino di un
o1.7 kOhm, perché non rientrano resistore col piedino di un altro
nella Serie E12. Ovviamente esistono resistore. In questo caso i valori di
delle applicazioni in cui si necessita resistenza si sommano! Se mettiamo', 38, 486);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 4', NULL, 'di un singolo valore di resistenza più i resistori in serie in un circuito la
specifico, per questo motivo si corrente che li attraversa è la stessa.
possono utilizzare i concetti che
verranno esposti nel capitolo oppure Immaginiamo di voler creare il
utilizzare delle serie di valori più resistore da 1.6 kΩ di cui parlavamo
estesi come la E24 (24 valori) o la poco fa. Poiché possiamo sommare il
E36 (36 valori). valore di resistenza con un
COSA FACCIAMO SE NON collegamento serie, ci basta collegare
ABBIAMO IL VALORE DI CUI insieme un resistore da 1.5 kΩ e un
ABBIAMO BISOGNO NELLA SERIE resistore da 100 Ω.
E12?
Ricordi la fila indiana? Ecco che i
resistori si devono ''tenere la mano in
La Serie E12 è comoda, ma si potrà
fila indiana'', quindi il collegamento da
verificare l''eventualità si aver
effettuare è questo:
bisogno di quel valore che non c’è.
Niente paura! E'' possibile “creare” una
resistenza con un valore diverso
utilizzando uno
opiù valori di resistenza tra quelli che
abbiamo a disposizione nel nostro kit.
Esattamente come facciamo con gli
ingredienti di una ricetta, possiamo
utilizzare i resistori per creare
qualcosa di nuovo, peccato che non
sarà un dolce!
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 39', 39, 320);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 4', NULL, 'CAPITOLO 4
COLLEGAMENTO PARALLELO
Si parla di collegamento parallelo
quando due (o più) resistori si tengono
entrambe le mani e si guardano,
quindi quando entrambi i pin dei
resistori sono collegati a coppie nello
stesso punto. In questo caso
la faccenda del valore di resistenza
equivalente si complica perché
abbiamo una divisione della corrente In ogni resistore per la legge di Ohm
tra i resistori. scorre:
Esattamente come succede in un
tubo in cui ad un certo punto c’è un
I = V/R = 9V/330Ω = 0.03 A = 3 mA
bivio e l’acqua si divide, anche per i
resistori succede la stessa cosa con la Poiché in ogni resistore scorrono 3
corrente. mA la corrente totale in uscita dalla
batteria sarà 6 mA!
Ma un attimo, sempre utilizzando la
legge di Ohm questo vuol dire che
è come se la resistenza equivalente
connessa alla batteria fosse di 165 Ω!
Due resistori identici collegati in
parallelo equivalgono ad un resistore
con valore dimezzato.
La corrente totale sarà quindi la
somma delle due correnti che
Se invece i due resistori collegati
scorrono dai due rami.
insieme non hanno lo stesso valore, si
può utilizzare la seguente formula:
Proviamo a fare un esempio.
Immaginiamo di avere una batteria
Req = (R1 * R2) / (R1 + R2)
da 9V collegata a 2 resistori da 330 Ω
collegati in parallelo.
40 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
APPROFONDIAMO LE RESISTENZE ?
Req è il resistore equivalente, mentre
R1 ed R2 sono i due resistori messi in
parallelo. In sostanza dobbiamo
calcolare il prodotto dei due valori di
resistori diviso la loro somma. La
dimostrazione di questa formula esula
dallo scopo di questo libro, ma si può
trovare con la legge di Ohm!
Utilizzando il multimetro, come
spiegato in precedenza, prova ad
effettuare il collegamento serie e
parallelo delle due immagini proposte
in questo capitolo e controlla il
risultato che ottieni. Ricorda, c’è
sempre la tolleranza di mezzo!', 40, 486);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 4', NULL, 'Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 41', 41, 24);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 4', 'Esercizio 1', 'CAPITOLO 4
Esercizio 1
Utilizzando due resistori della serie E12 come realizzeresti un resistore
equivalente da 75kΩ?
___________________________________________________
___________________________________________________
Esercizio 2
Utilizzando due resistori della serie E12 come realizzeresti un resistore
equivalente da 4.4kΩ?
___________________________________________________
___________________________________________________
42 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 42, 133);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 4', 'ESPERIMENTO 1', 'APPROFONDIAMO LE RESISTENZE ?
Esercizio 3
Quanti resistori della serie E12 utilizzeresti per creare un resistore
equivalente da 3kΩ? Come li collegheresti?
___________________________________________________
___________________________________________________
ESPERIMENTO 1
Utilizzando la breadboard metti in parallelo due resistori da 1kΩ.
Che valore deve avere il resistore equivalente?Utilizza il
multimetro per controllare qual è il vero valore!
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 43', 43, 137);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 4', 'ESPERIMENTO 2', 'CAPITOLO 4
ESPERIMENTO 2
Utilizzando la breadboard metti in serie tre resistori da 1kΩ.
Che valore deve avere il resistore equivalente?Utilizza il
multimetro per controllare qual è il vero valore!
Ora misura ogni resistore singolarmente e prendi nota del valore di
ognuno. Sono molto simili o differenti? Scrivi qui i loro valori
Valore 1:
---------------------------------
Valore 2:
---------------------------------
Valore 3:
---------------------------------
44 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 44, 140);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 4', 'ESPERIMENTO 3', 'APPROFONDIAMO LE RESISTENZE ?
ESPERIMENTO 3
Sulla base del circuito dell’esperimento 2, aggiungi la batteria come
indicato in figura. Posiziona il coccodrillo nero sul negativo della batteria
e il coccodrillo rosso nei punti: J9, J5, J1
Prendi nota della tre tensioni:
V (J1):
___________________
V (J5):
___________________
V (J9):
___________________
Succede quello che ti aspettavi? Applica la legge di Ohm
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 45
NOTE
46 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 45, 153);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 5', NULL, 'CAPITOLO 5
APPROFONDIAMO LE BATTERIE
In questo capitolo approfondiremo In questo tipo di giocattoli di solito
quanto visto nel Volume 1 di ci sono quattro batterie AA o AAA.
"Laboratorio di Elettronica: Impara e Ogni batteria ha una tensione di 1.5V
Sperimenta". ed esattamente come i resistori, le
Abbiamo già parlato delle batterie, ma batterie possono essere messe in
finora abbiamo utilizzato solo quella serie per avere un valore più alto.
da 9V. Siamo abituati però ad esempio
ad inserire più di una batteria nei Collegando infatti il positivo di
telecomandi, nei giocattoli o in altri una batteria con il negativo della
dispositivi elettronici. Ma sai il perché? successiva in modo da avere un solo
positivo e un solo negativo libero
COLLEGAMENTO SERIE (esattamente come nell’immagine)
abbiamo:
Alcuni dispositivi elettronici hanno
bisogno di più tensione (quindi più V) 1.5V + 1.5V + 1.5V + 1.5V = 6V
per funzionare correttamente.
Prendiamo l’esempio di una Abbiamo quindi costruito una batteria
macchinina radiocomandata. equivalente da 6V!
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 47', 47, 287);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 5', NULL, 'CAPITOLO 5
COLLEGAMENTO PARALLELO Facciamo un esempio con la batteria
da 1.5V 2.5Ah. Per la legge di Ohm
Le batterie possono anche essere se abbiamo tensione e corrente
collegate in parallelo, in questo caso possiamo ricavare la resistenza:
la tensione totale è la stessa, ma
perché lo facciamo? R = V/I = 1.5V/2.5Ah = 0.6Ω
Quindi se colleghiamo un resistore da
0.6Ω ad una batteria da 1.5V, la
corrente scorrerà per 1 ora prima che
la batteria si scarichi del tutto.
Se invece vogliamo fare la stessa
cosa, ma alimentare lo stesso circuito
per 4 ore alla stessa tensione di 1.5V,
Le batterie vengono collegate in ci basta collegare 4 batterie in
parallelo quando abbiamo bisogno di parallelo.
più corrente. Esattamente come la
corrente si ripartisce tra due resistori
collegati in parallelo, nel caso delle
batterie, la corrente che viene erogata
2.5Ah + 2.5Ah + 2.5Ah + 2.5Ah = 10Ah
per alimentare un circuito viene
prelevata in piccole parti da ogni Ecco perché la batteria dura
batteria! quattro volte di più. Ovviamente più
batterie in parallelo
Sulle batterie infatti troviamo una aggiungeremo, più aumenterà la
scritta (come quella dell’immagine) durata!
che dice ad esempio 2.5Ah. Questa
dicitura ci indica che se il nostro
circuito assorbe 2.5Ah, la batteria
sarà in grado di alimentarlo per 1 ora
(ora in inglese si dice hour quindi si
usa la h).
48 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 48, 363);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, '1. P', 'ESPERIMENTO 1', 'APPROFONDIAMO LE BATTERIE?
ESPERIMENTO 1
Batterie in Serie (Più “Spinta”!)
Obiettivo: Capire come le batterie in serie aumentano la tensione (i Volt)
e misurarla con il multimetro.
Cosa ti serve:
• 3 o 4 batterie AA/AAA (quelle da 1.5V)
• Il tuo multimetro
Passo 1: Misuriamo una singola batteria
1. Prendi il tuo multimetro
2. Ruota la manopola sul simbolo “V” con la linea dritta e i tre puntini
(V), e impostalo su una scala tipo “20V” (o “DCV 20”)
3. Prendi una sola batteria
4. Tocca il puntale rosso del multimetro sul polo positivo (+) della batteria
5. Tocca il puntale nero del multimetro sul polo negativo (-) della batteria
6. Cosa leggi? Vedi sul dispaly un valore vicino a 1.5V (es. 1.55V,
1.48V). Questo è il “voltaggio” o la “spinta” di una singola batteria.
Passo 2: Colleghiamo due batterie in Serie
1. Prendi due batterie
2. Collega il polo positivo (+) di una batteria al polo negativo (-) dell’altra
batteria. Puoi usare un cavetto jumper o semplicemente tenerle vicine
3. Ora hai un polo negativo libero da una parte e un polo positivo libero
dall’altra. Questi sono i tuoi nuovi “poli” combinati!
4. Con il multimetro (sempre impostato su 20V DC):
•Puntale rosso sul polo positivo libero
•Puntale nero sul polo negativo libero
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 49', 49, 336);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 5', NULL, 'CAPITOLO 5
5. Cosa leggi ora? Ti comparirà un valore vicino a 3V (es. 3.05V, 2.9V).
• Spiegazione: 1.5V (prima batteria) + 1.5V (seconda batteria) = 3V! Hai
raddoppiato la “spinta”!
Passo 3: Colleghiamo tre (o quattro) batterie in Serie
1. Ora aggiungi una terza (o quarta) batteria alla “catena”, sempre
collegando il positivo di quella precedente al negativo di quella nuova
2. Avrai sempre un polo positivo libero all’inizio e un polo negativo libero alla
fine della catena
3. Misura la tensione tra questi due poli liberi con il multimetro.
4. Cosa leggi?
•Con 3 batterie: Dovresti leggere circa 4.5V (1.5V x 3)
•Con 4 batterie: Dovresti leggere circa 6V (1.5V x 4)
Esattamente, come detto nella parte teorica di questo capitolo, abbiamo visto
che collegando due o più batterie in serie tra di loro, possiamo ottenere
tensioni più alte di quelle che avremmo utilizzando una sola batteria. Questo
torna molto utile in una varietà di applicazioni che hanno ad esempio dei
motorini (come le macchinine radiocomandate) poiché necessitano di tensioni
più alte e anche di più corrente per durare più a lungo. Se infatti
usassimo una batteria da 9V per alimentare una macchinina radiocomandata,
probabilmente potremmo giocare solo per 5 minuti! Questo accade perché
le batterie da 9V hanno una quantità di mAh nettamente inferiore alle batterie
oAAA AA.
50 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 50, 362);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 5', 'ESPERIMENTO 2', 'APPROFONDIAMO LE BATTERIE?
ESPERIMENTO 2
Abbiamo detto che le batterie in serie si sommano e abbiamo anche effettuato
un esperimento per dimostrarlo. Ma cosa succede se anziché collegare il
positivo di una batteria con il negativo della successiva lo collegassimo con
il positivo?
Se colleghiamo il tester invertendo il positivo e il negativo sulla batteria
otteniamo una lettura negativa. Effettuando questo collegamento facciamo
esattamente la stessa cosa!
Il risultato è
V = 1.5V - 1.5V = 0V
Praticamente una batteria prova a spingere in una direzione e l’altra nel senso
opposto! Quindi la tensione totale diminuisce. Se le batterie hanno esattamente
la stessa tensione leggerai 0V sul multimetro altrimenti un valore poco più
positivo di 0V (ad esempio 0.2V) o poco più negativo di 0V (ad esempio -0.3V).
Questo tipo di collegamento tra le batterie (o tra i componenti elettronici
polarizzati in generale) è chiamato ANTISERIE.
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 51', 51, 257);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 8', NULL, 'CAPITOLO 8
NOTE
52 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 52, 28);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 6', NULL, 'CAPITOLO 6
APPROFONDIAMO I LED
In questo capitolo approfondiremo Questi due valori inoltre cambiano
quanto visto nel Volume 1 di per ogni costruttore e per ogni
"Laboratorio di Elettronica: Impara e colore di LED. Ovviamente ci sono
Sperimenta". dei valori usuali, ad esempio nel
caso del LED verde Vf = 2V e If =
Abbiamo detto che per non 0.025A (quindi 25mA).
danneggiare i LED dobbiamo
utilizzare dei resistori per limitare la Per calcolare il resistore da
corrente che li attraversa. Ma come posizionare in serie al LED per avere
facciamo a calcolare un valore di la If, possiamo utilizzare la legge di
resistenza che faccia scorrere proprio Ohm e quanto visto per le batterie.
la quantità di corrente che vogliamo? Sappiamo che il LED deve avere
applicata ai suoi capi una tensione di
Un LED ha una tensione (chiamata 2V, per il calcolo del resistore può
Vf) che permette di essere considerato come una
far scorrere la massima corrente piccola batteria!
(chiamata If) che può sopportare
e quindi avere il massimo della
luminosità. Questa tensione, e di
conseguenza la corrente, vengono
indicate nel documento tecnico del
componente (chiamato datasheet).
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 53', 53, 314);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 6', 'esperimento 2', 'CAPITOLO 6
Se mettessimo un resistore da 270Ω
invece passerebbe più corrente
sempre per la legge di Ohm:
I = Vbatteria/R = 7V/270Ω = 26mA
che è maggiore di quella massima
sopportabile dal LED.
Scegliamo quindi il valore standard
successivo di 330Ω ottenendo una
corrente di:
I = Vbatteria/R = 7V/330Ω = 21mA
Se consideriamo il LED come una
batteria da 2V, considerato che il suo
la corrente è leggermente più bassa di
lato negativo (il catodo) è rivolto
quella massima quindi non lo
verso
danneggerà e sarà abbastanza
il negativo della batteria da 9V, la
luminoso.
batteria equivalente è una batteria da:
NOTA:
Vbatteria = 9V - 2V = 7V
Esattamente come nell’esperimento 2
Se vogliamo far scorrere 25mA
del capitolo 5 in cui abbiamo
possiamo utilizzare la legge di Ohm
effettuato la sottrazione tra le due
per calcolare il resistore necessario.
batterie, anche in questo caso
dobbiamo sottrarre la tensione Vf del
R = Vbatteria / I = 7V/0.025A = 280Ω LED dalla batteria. Questo accade
perché se modelliamo il LED come
In base a quanto detto nel capitolo 2
una batteria, quest''ultima spinge nel
di approfondimento sui resistori,
verso contrario. Ecco perché è
questi ultimi della serie standard E12
necessario sottrarre!
non comprendono il valore 280Ω e
non sarebbe comodo fare una serie
di due resistori per crearne uno da
280Ω.
54 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
APPROFONDIAMO I LED?
Quando costruiamo un circuito con un Ricorda:
LED, non possiamo semplicemente
collegarlo alla batteria e sperare che In elettronica spesso si fa un
funzioni, ma dobbiamo capire quanta compromesso tra teoria e pratica.
tensione e quanta corrente gli servono I calcoli ci guidano, ma la scelta
per accendersi senza bruciarsi. Il LED finale deve anche tener conto della
si comporta come una piccola batteria sicurezza e della disponibilità dei
al contrario, che “ruba” una parte della componenti. E, proprio come', 54, 489);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 6', 'esperimento 2', 'tensione. Se la nostra batteria è da 9 abbiamo visto negli esperimenti
V e il LED ha una caduta di tensione precedenti, quando due tensioni si
di 2 V, al resto del circuito restano oppongono bisogna sempre fare la
solo 7 V da gestire. È su questi 7 V sottrazione: è la regola che ci salva
che dobbiamo calcolare il resistore, i componenti e… la pazienza!
applicando la legge di Ohm.
Ricordiamo che nella pratica non
sempre esiste il resistore con il valore
esatto dato dal risultato dei calcoli.
Per questo esistono delle serie
standard, come la E12, che
contengono solo determinati valori.
Se il calcolo ci dice che è opportuno
utilizzare un resistore da 280 Ω,
dobbiamo scegliere il valore più vicino
che mantenga il LED al sicuro. In
questo caso, meglio salire a 330 Ω: la
corrente sarà leggermente più bassa,
il LED durerà più a lungo e la
differenza di luminosità sarà quasi
invisibile.
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 55', 55, 247);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 6', 'ESPERIMENTO 1', 'CAPITOLO 6
ESPERIMENTO 1
In questo esperimento vedremo come utilizzare più LED in serie avendo
un solo resistore di protezione del LED.
Per questo esperimento abbiamo bisogno di:
• una breadboard
• la clip per la batteria 9V e la batteria
• un resistore da 330 Ω
• due LED del colore che preferisci
Collega il positivo della batteria alla parte superiore della breadboard
e il negativo nella parte inferiore
Collega un resistore da 330 Ω tra il positivo della batteria e un punto
qualsiasi della breadboard
56 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
APPROFONDIAMO I LED?
Inserisci un LED con l’anodo rivolto verso il lato libero del resistore e il catodo
dopo la divisione centrale della breadboard
Inserisci il secondo LED con l'' anodo rivolto verso il catodo del primo LED e il
catodo verso il negativo della batteria
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 57', 56, 243);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 6', 'ESPERIMENTO 2', 'CAPITOLO 6
ESPERIMENTO 2
Sulla base dell’esperimento 1, prova a modificare il colore del secondo LED
(ad esempio utilizzandone uno blu) per apprezzare come cambia l’intensità
luminosa
Ti sembra che il LED rosso sia meno luminoso?
Prova a modificare i colori di entrambi i LED e tenere traccia di come si
modifica l’intensità luminosa a seconda del colore del LED che stai
utilizzando
COLORI UTILIZZATI:
LED1: __________ LED2: __________ NOTE: __________
LED1: __________ LED2: __________ NOTE: __________
LED1: __________ LED2: __________ NOTE: __________
58 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 58, 163);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 6', 'ESPERIMENTO 3', 'APPROFONDIAMO I LED?
ESPERIMENTO 3
Proviamo ora ad aggiungere ancora un LED per averne tre collegati in serie.
Per fare questo, partendo dall’esperimento 2, rimuovi il resistore
Posiziona un LED di un altro colore (usiamo il giallo) con il catodo rivolto
verso l’anodo del LED rosso e il suo anodo collegato in un punto qualsiasi
della breadboard
Collega ora il resistore da 330 Ω tra il positivo della batteria e l’anodo del
LED giallo
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 59', 59, 133);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 6', 'ESPERIMENTO 4', 'CAPITOLO 6
Poiché abbiamo posizionato ben tre LED in serie, se ricordi quanto
visto nella parte di teoria di questo capitolo, la corrente è via via diminuita
aggiungendo LED. Prova ora a modificare il valore di resistenza da 330 Ω
a 220 Ω e osserva come cambia la luminosità dei LED!
ESPERIMENTO 4
Abbiamo detto che il multimetro ha la funzione prova diodi e continuità.
Come dice il nome della funzione, può essere usato per provare i diodi (per
vedere se sono funzionanti o rotti) e come bonus ci dice quanto vale la sua Vf.
Sapendo qual è la Vf esatta del nostro diodo, siamo in grado di
individuare il valore esatto di resistenza di cui abbiamo bisogno per
avere il massimo della luminosità. Ruota il selettore delle funzionalità fino ad
arrivare alla funzione prova diodi e continuità.
60 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
APPROFONDIAMO I LED?
Prendi un diodo qualunque, usiamone uno
verde. Con il coccodrillo nero tocca il catodo
del LED e con il coccodrillo rosso tocca
l’anodo del LED
Sullo schermo comparirà quanto vale la Vf del diodo che hai scelto.
Se si tratta di un diodo verde comparirà intorno ai 2V, ma se sullo
display non compare nulla, ci sono tre opzioni:
• hai invertito i puntalini!
• il diodo è rotto o difettoso
• il diodo ha una Vf troppo elevata e il multimetro
non riesce a misurarla correttamente
Utilizzando questa funzionalità, come abbiamo già detto, possiamo selezionare
il valore perfetto di resistenza da mettere in serie al LED per renderlo il
più luminoso possibile. Se vuoi prova a rifare i calcoli della parte teorica
scegliendo un LED e misurando la sua Vf!
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 61
NOTE
62 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 60, 465);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 7', NULL, 'CAPITOLO 7
COSA SONO I CONDENSATORI?
I condensatori (detti anche capacitori) L’unità di misura del condensatore
sono dei componenti elettronici che è il Farad e si indica con la lettera F.
funzionano come delle piccole A seconda del loro valore, i condensatori
batterie. Sono infatti capaci possono essere di due tipologie:
(da qui il loro nome) di immagazzinare • non polarizzati
la tensione che gli viene applicata e • polarizzati
liberare energia quando serve.
Hai presente quando stacchi la spina
ad un dispositivo elettronico e
qualche LED rimane acceso per un
pochino? Bene, quell’effetto è causato
dai condensatori che tengono le cose
accese ino a quando non si
scaricano.
Esattamente come le batterie,
i condensatori non possono
immagazzinare l’energia per sempre,
ma solo per un periodo di tempo
limitato!
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 63', 63, 228);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 7', NULL, 'CAPITOLO 7
Per valori di capacità elevati (di solito Sui condensatori elettrolitici, oltre
dai 100uF in su) i condensatori sono all’indicazione del valore di capacità,
sempre polarizzati. Quelli polarizzati troviamo anche il valore di tensione
vengono anche chiamati elettrolitici massima a cui possono essere
perché per realizzarli serve una sottoposti. Anche in questo cas, se
sostanza chimica chiamata elettrolita. non rispettata ne consegue la
rottura del componente!
I condensatori elettrolitici, essendo
polarizzati, devono essere inseriti
correttamente in un circuito altrimenti
il componente si danneggia e
potrebbe addirittura esplodere!
Nel caso del condensatore
rappresentato nell''immagine
leggiamo che il suo valore di capacità
è 3300uF e che la sua massima
tensione è 35V.
Inoltre è presente una striscia laterale
che indica qual è il pin negativo e,
proprio come i LED, i pin sono uno più
lungo ed uno più corto. Quello più
lungo è il positivo!
64 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
CHE COSA SONO I CONDENSATORI?
Esattamente come per i resistori, Un condensatore da 1 Farad sarebbe
anche per i condensatori esiste talmente grande da risultare
un codice che indica il valore di ingombrante e poco pratico per i
capacità. In questo caso il codice è normali circuiti elettronici. Per questo
solo numerico e serve per motivo i valori che troviamo più
rappresentare grandezze molto spesso nei dispositivi elettronici sono
piccole. Infatti i condensatori sono compresi tra pochi pF e qualche
componenti che possono centinaio di μF.
immagazzinare cariche elettriche, ma
la quantità che riescono a contenere Un condensatore da 100 pF è
è davvero minuscola se confrontata installato nei circuiti delle radio
con un’unità intera di misura chiamata poiché servono valori piccolissimi.
Farad (F).
Un condensatore da 100 nF si trova
Per questo motivo si usano quasi quasi in tutte schede elettroniche', 64, 490);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 7', NULL, 'sempre i sottomultipli del Farad, cioè come “ iltro” per eliminare piccoli
unità di misura più piccole: disturbi.
• pF, si legge pico Farad ed equivale Un condensatore da 100 μF può
a un trilionesimo di Farad essere utilizzato negli alimentatori,
(1/1.000.000.000.000). per rendere più stabile la tensione
• nF si legge nano Farad ed equivale poiché viene sfruttato l’effetto
a un miliardesimo di Farad “batteria”.
(1/1.000.000.000).
• μF (o uF) si legge micro Farad ed In questo modo, oltre a conoscere
equivale a un milionesimo di Farad i simboli, puoi iniziare a intuire anche
(1/1.000.000). a cosa servono i diversi tipi di
condensatori nei circuiti.
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 65', 65, 188);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 7', NULL, 'CAPITOLO 7
66 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 66, 27);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 7', 'ESPERIMENTO 1', 'CHE COSA SONO I CONDENSATORI?
ESPERIMENTO 1
In questo esperimento osserveremo l’effetto di scarica del condensatore
elettrolitico. Abbiamo bisogno di:
• un condensatore da 1000uF
• un pulsante
• il multimetro
• un filo colorato
• un resistore da 1kΩ
Imposta il multimetro su 20V in continua come fondo scala
Inserisci il condensatore a cavallo della separazione centrale della breadboard
e collega il multimetro con il cavo nero sul negativo e il rosso sul positivo del
condensatore
Inserisci il pulsante accanto al condensatore sempre a cavallo
della separazione centrale
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 67', 67, 167);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 7', NULL, 'CAPITOLO 7
Collega un lato del pulsante al positivo del condensatore con il filo
colorato e premi il pulsante. Il multimetro deve indicare circa 9V
(cioè la tensione di batteria)
Rilascia il pulsante e osserva cosa succede alla tensione ai capi del
condensatore
Il condensatore si comporta come una batteria momentanea e si scarica
lentamente all’interno del multimetro. I puntali infatti si comportano come
un resistore di valore molto elevato (richiedendo quindi poca corrente) e
quindi la “batteria” si scarica lentamente
68 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 68, 155);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 7', 'ESPERIMENTO 2', 'CHE COSA SONO I CONDENSATORI?
ESPERIMENTO 2
In questo esperimento continueremo ad osservare l’effetto di scarica del
condensatore. Per questo esperimento abbiamo bisogno di:
• un condensatore da 1000uF
• un pulsante
• un LED rosso
• il multimetro
• tre fili colorati
• un resistore da 1kΩ
Inserisci il pulsante a cavallo della divisione centrale della
breadboard e collega la batteria come mostrato in figura
Inserisci il condensatore accanto al pulsante con il negativo rivolto
verso il basso e collega il positivo all’altro lato del pulsante
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 69', 69, 160);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 7', NULL, 'CAPITOLO 7
Inserisci il condensatore accanto al pulsante con il negativo rivolto
verso il basso e collega il positivo all’altro lato del pulsante
Collega il negativo del condensatore al negativo della batteria con un filo
Collega il resistore tra il positivo del condensatore e un punto qualsiasi
della breadboard
70 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
CHE COSA SONO I CONDENSATORI?
Collega il positivo del LED con il lato libero del resistore e il negativo del LED
in un punto qualsiasi della breadboard dopo la divisione centrale
Collega il negativo del LED al negativo della batteria con un filo
Collega il multimetro col cavo rosso sul positivo del condensatore
e il cavo nero sul negativo del condensatore
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 71', 70, 217);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 7', 'ESPERIMENTO 3', 'CAPITOLO 7
Premi ora il pulsante e osserva cosa accade!
Questa volta l’effetto di scarica del condensatore è visibile sia sul LED
guardando come si spegne, sia sul multimetro guardando come diminuisce il
valore letto.
Come possiamo fare ad aumentare la durata dell’accensione del LED?
Aggiungendo capacità in parallelo creiamo una batteria più capiente
e quindi il LED può rimanere acceso per più tempo.
ESPERIMENTO 3
Nel kit sono presenti 3 condensatori da 1000uF 25V.
Al contrario di quanto visto per i resistori, per sommare la capacità dei
condensatori bisogna connetterli in parallelo. Così facendo, proprio come
visto per le batterie, riescono a rimanere carichi per più tempo osservando
una scarica più lenta.
Ora prova ad aggiungere prima solo un condensatore in parallelo al
circuito costruito durante l’esperimento 2 e successivamente un terzo.
Sarai sorpreso nel vedere come cambia l’effetto di scarica del
condensatore!
72 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 72, 257);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 7', 'ESPERIMENTO 4', 'CHE COSA SONO I CONDENSATORI?
ESPERIMENTO 4
Sulla base dell’esperimento 2 prova ora a cambiare il valore di resistenza
aumentandolo o diminuendolo e osserva come cambia la scarica del
condensatore.
Prova a fare la stessa cosa anche sulla base dell’esperimento 3.
Vedrai che con valori di capacità più alti e con valori di resistenza più alti,
la scarica del condensatore è più lenta!
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 73
NOTE
74 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 73, 146);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 8', NULL, 'CAPITOLO 8
CHE COSA SONO I TRANSITOR?
Un transistor è un piccolo I transistor possono anche
componente elettronico che può essere usati per costruire circuiti
attivare o disattivare il passaggio di amplificazione del segnale,
della corrente, un po’ come fa un esattamente come quelli presenti
interruttore della luce. all’interno delle casse bluetooth o di
qualunque dispositivo di riproduzione
La cosa particolare è che non audio ma, poiché la spiegazione
si aziona con una mano, come un matematica di questo funzionamento
normale interruttore, ma con un è abbastanza complessa,
affronteremo l''argomento nelle
segnale elettrico! Per questo si
pagine seguenti.
chiama anche interruttore elettronico.
Utilizzati come semplici interruttori
comandati (chiamati anche
interruttori digitali),
i transistor possono già regalare
molta soddisfazione e permetterci di
costruire delle piccole automazioni.
La spiegazione che utilizzeremo per
descrivere il funzionamento dei
transistor è semplificata, ma serve a
capirne il funzionamento di base.
Sarà spiegata più approfonditamente
nei volumi successivi!
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 75', 75, 298);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 8', NULL, 'CAPITOLO 8
Il transistor ha un funzionamento Per via della loro facilità di utilizzo, ci
simile a quello dell’interruttore concentreremo ora sull’utilizzo dei
magnetico: proprio come il magnete MOSFET, nello specifico a canale N.
tira la lamella e mette in contatto i
due terminali e ha un terminale di I BJT NPN e i MOSFET a canale N
hanno un comportamento analogo e
controllo (chiamato Base o Gate a
vengono utilizzati come interruttore
seconda della tipologia di transistor)
che “chiude il negativo” detto anche
a cui si applica una tensione per
interruttore low side. Mentre i BJT
chiudere gli altri due terminali. Il
PNP e i MOSFET a canale P vengono
transistor è quindi un dispositivo
utilizzati come interruttore “che
elettronico due categorie principali di
chiude il positivo”, detto anche
transistor:
interruttore high side.
Giusto qualche altra breve nozione e
• i BJT (Bipolar Junction Transistor)
inizieremo con i nostri esperimenti!
• i MOSFET (Metal Oxide Field Diamo solo dei nomi ai tre terminali
Effect Transistor) dei transistor. Nel caso dei BJT
A loro volta ci sono altre due abbiamo:
sottocategorie:
• BJT
• NPN
• PNP
• MOSFET
• canale N • C: Collector (Collettore)
• canale P • B: Base
• E: Emitter (Emettitore)
Le cariche elettriche (quindi la
corrente) vengono tirate dal Collettore
verso l’Emettitore quando
applichiamo una tensione sulla
base.Proprio come quando
accendiamo una luce in casa
spostando l’interruttore da OFF in ON.
76 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
CHE COSA SONO I TRANSISTOR?
Pensate ad un computer o ad uno
Per il MOSFET invece:
smartphone. Al loro interno ci sono
• D: Drain
miliardi di transistor che lavorano
• G: Gate
• S: Source insieme, aprono e chiudono correnti
Per il MOSFET non abbiamo una in modo velocissimo. È proprio grazie
diretta traduzione in italiano per i a loro che i dispositivi elettronici
terminali, ma quando applichiamo possono “pensare”, fare calcoli,', 76, 496);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 8', NULL, 'una tensione di comando sul gate, accendere schermi, riprodurre musica
la corrente scorre dal Drain verso il e collegarsi a internet.
Source.
Ultimissimo concetto: i transistor non Nei nostri esperimenti, anche se
sono dei veri e propri interruttori useremo solo pochi transistor,
(come quelli meccanici) vedremo quanto sono potenti. Vedrai
semplicemente perché devono che con un semplice segnale
essere collegati correttamente, sono possiamo accendere una lampadina,
dei componenti polarizzati come i muovere un motorino o controllare
diodi. una parte del circuito. È un po’ come
avere il superpotere di accendere e
Nei nostri esperimenti collegheremo spegnere la luce della propria stanza
sempre: senza alzarsi dal letto, solo
• il Source al negativo della batteria schioccando le dita!
• il Drain al punto del circuito di cui
vogliamo staccare il negativo I transistor sono quindi la base di tutta
• il Gate alla tensione di controllo l’elettronica moderna: piccoli, veloci e
intelligenti. Imparare ad usarli
Possiamo quindi immaginare il
significa avere in mano una chiave per
transistor come un piccolo guardiano
capire come funzionano quasi tutti gli
elettronico: decide quando far passare
oggetti tecnologici che usiamo ogni
la corrente e quando bloccarla,
giorno.
proprio come un vigile che regola il
traffico ad un incrocio. A differenza di
un normale interruttore però non
serve la mano per spostarlo, basta
una minuscola tensione di comando.
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 77', 77, 387);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 8', 'ESPERIMENTO 1', 'CAPITOLO 8
ESPERIMENTO 1
In questo esperimento vedremo come utilizzare il MOSFET come interruttore
comandato da una tensione. Per farlo abbiamo bisogno di:
• 1 transistor
• 1 LED: sceglilo del colore che ti piace di più)
• Una breadboard
• Una batteria 9V
• La clip per la pila 9V
• 1 resistore da 470 Ohm
• 4 fili colorati
Collega la clip alla batteria, poi connetti il cavo rosso alla striscia rossa e il
cavo nero alla striscia nera della breadboard.
Posiziona il transistor come indicato in figura. Così facendo il piedino più a
sinistra è il gate, quello in mezzo il drain e quello più a destra è la source
78 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
CHE COSA SONO I TRANSISTOR?
Collega il source (piedino più a destra) al negativo della batteria
utilizzando un cavetto
Posiziona il LED accanto al transistor rivolgendo l’anodo verso destra
Collega il catodo del LED al drain (pin centrale del transistor)
utilizzando un cavetto
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 79', 78, 271);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 8', NULL, 'CAPITOLO 8
Collega un resistore da 470 Ω tra l’anodo del LED e un punto qualsiasi dopo la
divisione centrale della breadboard
Collega il source del MOSFET al negativo della batteria utilizzando un cavetto
Collega il gate del MOSFET al positivo della
batteria. Il LED si accenderà!
80 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 80, 94);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 8', 'ESPERIMENTO 2', 'CHE COSA SONO I TRANSISTOR?
ESPERIMENTO 2
Sulla base dell’esperimento 1 scollega il lato collegato al positivo della batteria
del cavetto connesso sul gate del MOSFET e collegalo al negativo della batteria.
Questo spegne il circuito perché scarica il gate. Ora solleva il cavetto e prova
a toccare l’estremità col dito: la carica del tuo corpo consente al MOSFET di
accendersi e quindi di conseguenza accendere il LED!
ESPERIMENTO 2
Abbiamo detto che sia il MOSFET che il BJT hanno bisogno di una tensione di
comando sul Gate o sulla Base per accendersi. Non abbiamo però detto che
questa tensione deve avere un valore minimo. Questo valore si chiama tensione
di soglia Vth (perché in inglese soglia si dice threshold) e vale circa 1V per i
BJT e 2V per i MOSFET utilizzati in questo kit. In questo esperimento vedremo il
comportamento del MOSFET all’approcciarsi della tensione di soglia. Per farlo
abbiamo bisogno di:
• 1 transistor
• 1 LED: sceglilo del colore che ti piace di più
• Una breadboard • Una batteria 9V
• La clip per la pila 9V
• 1 resistore da 470 Ohm
• 1 potenziometro con alberino
• •il multimetro
• • 8 fili colorati
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 81', 81, 308);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 8', 'esperimento 1', 'CAPITOLO 8
Per questo esperimento partiremo con quanto fatto nell’esperimento 1.
Scollega solo il cavetto connesso al gate. Dovresti trovarti in questa
situazione
Posiziona ora il potenziometro a cavallo della divisione centrale
accanto al resistore da 470Ω
Collega ora il pin 1 del potenziometro al negativo della batteria
e il piedino 3 al positivo
82 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
CHE COSA SONO I TRANSISTOR?
Connetti il pin 2 del potenziometro al gate del transistor e il multimetro
tra il gate e il negativo della batteria
Ruota piano l’alberino del potenziometro verso destra. Questo fa aumentare la
tensione sul gate. Osserva cosa succede al LED man mano che ruoti
l’alberino
Più ruoti l’alberino verso destra, più la tensione sul gate sale e il
transistor si accende meglio! In pratica il transistor si
comporta come un resistore variabile a seconda di quanto vale la
tensione di gate: più è alta più basso è il suo valore di resistenza!
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 83
NOTE
84 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 82, 303);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 9', NULL, 'CAPITOLO 9
COSA SONO I FOTOTRANSISTOR?
Come ci suggerisce il nome stesso
il fototransistor è un transistor,
ma comandato dalla luce. Il suo
comportamento di interruttore chiuso
oaperto dipende quindi dalla presenza
odall’assenza di luce. Sui
fototransistor, a seconda della Sperimentiamo!
tipologia di transistor su cui sono
basati, vedremo il simbolo elettrico Il comportamento del fototransistor
come in figura. I più diffusi sono BJT può essere confrontato con quello del
NPN. fotoresistore utilizzato nel Volume 1
di "Laboratorio di Elettronica: Impara
e Sperimenta", ma c’è una differenza
fondamentale: in questo volume
useremo il fotoresistore come
sensore per avere un’uscita in
tensione proporzionale alla quantità
di luce che lo colpisce.
Da lontano un fototransistor somiglia
molto ad un LED con il corpo
Tutto quello che abbiamo detto per
trasparente.
i transistor nel capitolo precedente
vale anche per i fototransistor.
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 85', 85, 257);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 9', 'ESPERIMENTO 1', 'CAPITOLO 9
Esattamente come i LED, anche i
fototransistor hanno un piedino più
lungo e uno più corto, ma il corpo
superiore è più corto e di solito anche
piatto per consentire alla luce di
colpire perpendicolarmente la base.
Nel caso del fototransistor, il pin lungo
è il Collettore, mentre quello corto è
l’Emettitore.
ESPERIMENTO 1
In questo esperimento utilizzeremo un fotoresistore come sensore
controllando con il multimetro quanto vale la tensione ai capi di una resistenza
in base a quanta luce colpisce il fotoresistore.
86 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
COSA SONO I FOTOTRANSISTOR?
Per realizzare l''esperimento abbiamo bisogno di:
• Una breadboard
• Una batteria 9V
• La clip per la pila 9V
• 1 resistore da 10 kOhm
• 1 fototransistor
• il multimetro
Collega il fototransistor in due punti qualunque a cavallo della divisione
centrale della breadboard con l’emettitore (pin corto) rivolto verso il basso
Collega un resistore da 10 kOhm tra l’emettitore del fototransistor
e la striscia nera inferiore della breadboard
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 87', 86, 297);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 9', NULL, 'CAPITOLO 9
Collega il multimetro impostato su fondoscala 20V ai capi del resistore da 10 kOhm
Collega il positivo della batteria sul collettore del fototransistor e il negativo
nella striscia nera in cui è inserito il resistore da 10 kOhm. Vedrai un
valore di tensione sul multimetro proporzionale alla quantità di luce. Aiutandoti
con una lucina e illumina il corpo del fototransistor e osserva come varia la
lettura sul multimetro. Se punti la luce direttamente sul corpo leggerai
quasi 9V!
Prova a tenere al buio il fototransistor coprendolo con le mani, la
lettura sul multimetro sarà vicina a 0V.
Abbiamo creato un sensore di luce!
88 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 88, 183);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 9', 'ESPERIMENTO 2', 'COSA SONO I FOTOTRANSISTOR?
ESPERIMENTO 2
In questo esperimento useremo un fototransistor per accendere una luce
quando è buio e spegnerla quando c’è luce. Per farlo abbiamo bisogno di:
• Una breadboard
• Una batteria 9V
• La clip per la pila 9V
• 4 resistori da 10 kOhm
• 1 resistore da 470 Ohm
• 1 fototransistor
• 1 LED (del colore che preferisci)
• 1 Transistor MOSFET
• 4 fili colorati
Collega la clip della batteria alla batteria e connetti il positivo alla striscia
rossa e il negativo alla striscia nera della breadboard, poi effettua la
serie dei 4 resistori per crearne uno da 40kOhm
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 89', 89, 173);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 9', NULL, 'CAPITOLO 9
Connetti il fototransistor tra l''ultimo resistore e il negativo della batteria
Inserisci il MOSFET nella breadboard accanto all''ultimo resistore
Connetti il gate del MOSFET al collettore del fototransistor utilizzando un filo
90 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
COSA SONO I FOTOTRANSISTOR?
Connetti il source del MOSFET al negativo della batteria utilizzando un filo
Posiziona il LED accanto al MOSFET tenendo l’anodo verso destra
Connetti il catodo del LED al drain del MOSFET utilizzando un filo
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 91
Collega il resistore da 470 Ohm tra il positivo della batteria e lâ€™anodo del LED
Copri con le mani il fototransistor per simulare il buio: il LED si accenderà!
92 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 90, 232);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 10', NULL, 'CAPITOLO 10
IL MOTORE A CORRENTE CONTINUA
Il motore a corrente continua è un Corrente elettrica: Quando colleghi
oggetto in grado di trasformare il motore a una batteria, la corrente
l’energia elettrica in movimento. elettrica inizia a fluire attraverso fili
di rame avvolti all’interno del motore
COME FUNZIONA? detti avvolgimenti (o coils in inglese)
Pensa a due magneti uno con il polo Campo magnetico: Questa corrente
nord e l’altro con il polo sud. Se metti crea un campo magnetico attorno ai
un corpo di metallo tra di loro e fai fili.
passare corrente elettrica attraverso
di esso, succede qualcosa di Interazione magnetica: Il campo
magico: il metallo inizia a girare! magnetico dei fili interagisce con
Questo fenomeno è regolato dalla quello dei magneti fissi nel motore,
Legge di Lenz. causando una forza che fa girare il
motore.
Rotazione continua: Un
componente chiamato
“commutatore” cambia la direzione
della corrente ogni mezzo giro,
assicurando che il motore continui a
girare nella stessa direzione.
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 93', 93, 279);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 10', NULL, 'CAPITOLO 10
I motori a corrente continua sono un
elemento quasi fondamentale per la
creazione di robot, infatti nel kit ce
ne sono due che useremo per
costruire il nostro primo robot che si
muove!
I motori presenti nel kit sono come
quelli della figura. Questi motori
possono essere alimentati ad una
tensione massima di 9V quindi
cerca di non esagerare facendo
esperimenti strani con le batterie
altrimenti rischi di bruciarlo!
Nel kit sono anche presenti le ruote
che verranno per il robot del progetto
finale. Per gli esperimenti di questo
capitolo non utilizzarle.
94 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 94, 166);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 10', 'ESPERIMENTO 1', 'IL MOTORE A CORRENTE CONTINUA
ESPERIMENTO 1
In questo semplice esperimento vedremo come far girare il motore presente
all’interno del kit. Per farlo abbiamo bisogno di:
• Una breadboard
• Una batteria 9V
• La clip per la pila 9V
• Un motore
Utilizzando la breadboard solo per effettuare i collegamenti, connetti il filo
rosso del motore al positivo della batteria e il filo nero al negativo della
batteria. Osserva in che verso gira il motore
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 95', 95, 135);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 10', 'ESPERIMENTO 2', 'CAPITOLO 10
ESPERIMENTO 2
Prova a invertire il filo rosso e il filo nero, puoi farlo anche con i fili della batteria
oquelli del motore. In che verso gira ora il motore?
ESPERIMENTO 3
Prova a inserire un pulsante per comandare il motore acceso e spento
ESPERIMENTO 4
Prova a inserire un pulsante per comandare il motore aggiungendo
anche una resistenza e un led in modo che quando il motore inizia a
girare il led si accenda.
96 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
IL MOTORE A CORRENTE CONTINUA
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 97
NOTE
98 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 96, 189);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 11', NULL, 'CAPITOLO 11
I DIODI
Scopriamo un componente
elettronico molto utile che si trova
in tanti circuiti: il diodo.
Abbiamo già sentito questo nome
COME LO RICONOSCIAMO?
per i LED, sono infatti parenti: i diodi
“normali”, al contrario di quelli LED,
Esattamente come il LED (abbiamo
non emettono luce.
detto che sono parenti) anche i diodi
classici hanno due terminali chiamati
COSA SONO I DIODI
ANODO e CATODO. Considerando
che non hanno la testa luminosa, nel
Immaginate una strada a senso unico.
diodo standard il catodo è
Le macchine possono andare solo in
identificato da una striscia sul corpo.
una direzione e non possono tornare
Questa striscia può essere sia
indietro, giusto? Ecco, un diodo
colorata oppure incavata nel corpo.
funziona proprio come una strada a
Alcuni esempi sono visibili
senso unico per l’elettricità!
nell’immagine qui sotto.
• Il compito principale di un diodo
è permettere alla corrente
elettrica di scorrere solo in una
direzione.
Se la corrente prova ad andare nella
direzione opposta, il diodo la blocca.
È come un “vigile del traffico” super
efficiente per gli elettroni!
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 99', 99, 300);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 11', NULL, 'CAPITOLO 11
Oltre a funzionare come strade a Le bobine fanno la stessa cosa:
senso unico, i diodi hanno un altro rilasciano la loro energia in un colpo
compito molto importante ovvero solo e questo può creare una specie di
proteggere i circuiti. “schiaffo elettrico” che rischia di
rompere i componenti del circuito.
Immagina di avere un robot o una
radio alimentata a batteria. Se per Per evitare questo problema, si
distrazione colleghi la batteria al inserisce vicino al motore un diodo
contrario (più con meno, meno con di flyback (di ricircolo in italiano).
più), la corrente proverebbe a passare Questo diodo funziona come
nella direzione sbagliata e rischierebbe un’uscita di emergenza: quando il
di bruciare i componenti. motore
si spegne e la bobina butta fuori
Con un diodo messo nel punto giusto, l’energia, il diodo apre un passaggio
invece, questo non accade: il diodo si sicuro e lascia sfogare quella corrente
comporta come un portiere che senza danni.
chiude la porta in faccia alla corrente
sbagliata. Così il circuito rimane al Così i componenti delicati, come i
sicuro anche se hai fatto un piccolo transistor che possiamo utilizzare per
errore di collegamento. pilotare il motore (ti anticipo che lo
vedremo nel capitolo successivo) non
Un altro caso in cui i diodi sono si rompono per accumulo di energia
indispensabili è quando si usano che non trova una via per esaurirsi!
motori o bobine. I motori elettrici
funzionano grazie a delle bobine di Insomma, i diodi non sono solo “vigili
filo che creano campi magnetici. urbani” che regolano il traffico degli
Quando il motore gira, queste bobine elettroni, ma diventano anche scudi
si riempiono di energia, un po’ come protettivi che salvano i circuiti e
una molla che si carica. Ora immagina valvole di sicurezza e che
di spegnere il motore di colpo: la molla impediscono agli “schiaffi elettrici”
vuole scaricarsi tutta insieme! delle bobine di fare disastri (e quindi
pongono subito il nostro
divertimento!).', 100, 495);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 11', NULL, '100 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
I DIODI
Nel caso dei motori (e di tutte le
bobine in generale) il diodo di ricircolo
si collega sempre con il CATODO
verso il POSITIVO e l’ANODO verso il
NEGATIVO.
Questo succede perché quando il
motore non viene più pilotato (da
un pulsante o da un transistor) la
bobina presente all’interno cerca di
funzionare come un serbatoio per la
corrente. Il principio di funzionamento
è analogo a quello visto sul capitolo
dei condensatori, gli avvolgimenti però
(bobine) anziché essere dei serbatoi di
tensione sono dei serbatoi di corrente.
Quando non è più presente la tensione
di pilotaggio, l’avvolgimento aumenta
la tensione ai suoi capi e il negativo
del motore diventa più positivo del
vero positivo. A questo punto,
considerato che il diodo ha una
tensione più positiva sull’anodo
comincia a condurre
e la corrente si esaurisce in un
cortocircuito causato dal diodo!
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 101
NOTE
102 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 100, 293);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 12', NULL, 'CAPITOLO 12
COSTRUIAMO IL ROBOT SEGUI LUCE
In questo capitolo metteremo insieme un po’ tutti i concetti acquisiti in questo
volume per costruire un semplice robot che segue la luce!
Per costruire il nostro robot abbiamo bisogno di:
Una breadboard
Sei cavi colorati
Una batteria 9V
La clip per la pila 9V
Due transistor
Due resistori da 10KOhm
Due diodi
Due motori
Due ruote
Due fotoresistori
Il supporto batteria
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 103', 103, 128);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 12', NULL, 'CAPITOLO 12
Iniziamo subito ad assemblare la meccanica della tua macchinina!
Montaggio dei Motoriduttori e delle Ruote:
1. Prepara i Motoriduttori e le Ruote: prendi in mano uno dei motoriduttori e
una delle ruote
2. Osserva l’Albero del Motoriduttore. Noterai che l’albero (il perno rotante
che esce dal motoriduttore) non è perfettamente cilindrico ma che ha
una parte piana (una sezione appiattita) lungo un lato
3. Osserva il Foro della Ruota, al suo interno, dove l’albero deve essere
inserito, vedrai una sagoma che corrisponde esattamente a quella
dell’albero: un foro circolare a mezza luna
Una volta innestate, le ruote devono essere ben salde e girare insieme
all’albero del motoriduttore. Ripeti lo stesso procedimento per l’altro
motoriduttore e l’altra ruota
Fase di Preparazione e Incollaggio della Breadboard e dei Motori:
Avvertenze Fondamentali:
• Massima Attenzione: Questa operazione richiede estrema cautela. L’adesivo
sotto la breadboard è molto forte.
• Irreversibilità: Una volta che la breadboard e i motori sono stati incollati,
rimuoverli è un’operazione rischiosa. Potresti danneggiare la breadboard
stessa o la base del tuo progetto.
• Fallo una sola volta: Cerca di posizionare i componenti correttamente al
primo tentativo per evitare problemi. Prendi il tuo tempo, allinea bene e solo
quando sei sicuro, premi per incollare.
104 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 104, 363);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, '1. P', NULL, 'COSTRUIAMO IL ROBOT SEGUI LUCE
1. Prendi la Breadboard: rimuovi con attenzione la pellicola protettiva che
copre la parte adesiva situata sotto
2. Prepara i Motori per l’Incollaggio:
Prima di incollare i motori assicurati di averli orientati correttamente
Molto importante: i cavi dei motori devono essere posizionati in modo da rimanere
nella parte interna, proprio al centro. Questo eviterà che i cavi si
impiglino nelle ruote o si danneggino durante il movimento del robot
3. Incolla i Motori:
Appoggia con delicatezza i motori sulla base del breadboard. Sii estremamente
preciso in questo passaggio. Cerca di posizionarli esattamente come mostrato
nella figura di riferimento
4. Incolla il porta batteria, anche qui guarda bene la figura
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 105', 105, 210);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 12', NULL, 'CAPITOLO 12
Prendi la breadboard e iniziamo inserendo due diodi.
Ricorda che i diodi sono componenti polarizzati!
Guarda bene il diodo: vedrai una piccola banda grigia su un lato.
Quel lato è il catodo del diodo. Inserisci il piedino con la riga grigia
in una delle file nere della breadboard
Prendi i MOSFET. Fai attenzione a come li posizioni!
106 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta', 106, 111);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, '1. P', NULL, 'COSTRUIAMO IL ROBOT SEGUI LUCE
Bene! Ora diamo gli “occhi” alla nostra macchinina! Dobbiamo inserire i
fototransistor sulla breadboard.
Sono proprio questi fototransistor che daranno il segnale ai MOSFET per
accendere i motori e far muovere la macchina. Ma dobbiamo usare un
trucchetto per farla girare poichè non ha uno sterzo:
• Se vuoi girare a destra, devi far girare la ruota sinistra e tenere ferma
quella di destra
• Se vuoi girare a sinistra, devi far girare la ruota destra e tenere ferma
quella di sinistra
1. Posiziona i due fototransistor sulla breadboard con il collettore inserito
nella striscia rossa della breadboard
2. Prendi due cavetti per collegare i fototransistor ai MOSFET.
3. Ora, facciamo l’incrocio:
• Il fototransistor di destra piloterà il motore sinistro
• Il fototransistor di sinistra piloterà il motore destro
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 107', 107, 235);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 12', NULL, 'CAPITOLO 12
Ora posizioniamo dei resistori da 10kΩ sull’emettitore del fototransistor.
Questi resistori hanno la doppia funzionalità: polarizzare correttamente il
fototransistor garantendo il passaggio di corrente quando c’è luce e “tirare
giù” verso 0V il gate del MOSFET quando non c’è la luce. Per questo motivo
vengono chiamati anche resistori di “pull-down”
Come puoi notare, stiamo utilizzando la breadboard in maniera simmetrica
rispetto alla divisione centrale. Questo risulta molto comodo quando il circuito
da realizzare è gemello!
Poichè la nostra macchinina sarà alimentata da una sola batteria (la nostra è
da 9V), dobbiamo collegare insieme le strisce di alimentazione positive su un
lato della breadboard con quelle positive sull’altro lato. E, allo stesso modo,
dobbiamo collegare insieme le strisce di alimentazioni negative su un lato con
quelle negative sull’altro lato
108 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
COSTRUIAMO IL ROBOT SEGUI LUCE
Fantastico! Ci siamo quasi, la tua macchinina sta per prendere vita! Ora
colleghiamo i motori.
Fai molta attenzione anche qui perché c’è un trucchetto importante!
Ricordi che i due motori sulla tua macchinina sono montati in modo simmetrico?
Beh, se li collegassimo entrambi nello stesso modo, quando diamo corrente i
motori girerebbero uno in un senso e l’altro nel senso opposto. La tua
macchinina non andrebbe dritta, ma farebbe un giro su se stessa!
Quindi, quando li colleghiamo, dobbiamo essere attenti alla rotazione per farli
girare entrambi nella stessa direzione.
A tale scopo un motore sarà collegato con il positivo nella striscia rossa, mentre
l’altro al contrario”
Come visto invece nel capitolo sui transistor, il source di entrambi i MOSFET sarà
collegato al negativo della batteria. Il drain invece fornirà il comando al motore
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 109', 108, 491);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 12', NULL, 'CAPITOLO 12
In questo modo, quando darai corrente, entrambi i motori gireranno
nella stessa direzione e la tua macchinina potrà andare dritta
Se hai seguito correttamente tutti i passaggi, la tua macchinina sarà
simile a questa nell''immagine!
110 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
COSTRUIAMO IL ROBOT SEGUI LUCE
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 111', 110, 118);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (2, 'CAPITOLO 12', NULL, 'CAPITOLO 12
Perfetto, abbiamo completato il montaggio della nostra macchina
con tutti i componenti al loro posto!
Ora prendi la batteria e inseriscila con cura nel suo alloggio, quindi
collegala alle strisce della breadboard
Procurati uno smartphone con il flash acceso o una piccola torcia
Ora, viene il bello: avvicina la luce ai fototransistor e vedrai i motori
muoversi. Prova ad alternare la luce a destra o a sinistra.
La macchinina seguirà la luce!
112 Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta
COSTRUIAMO IL ROBOT SEGUI LUCE
NOTE
Laboratorio di elettronica: Impara e sperimenta Laboratorio di elettronica: Impara e sperimenta 113
NON È FINITA QUI!
Speriamo davvero che ti sia divertito con questi esperimenti per avvicinarti al mondo
dell’elettronica!
Nei prossimi volumi approfondiremo i concetti trattati nei primi due volumi,
ci concentreremo nel dettaglio sul funzionamento e utilizzeremo anche
altri componenti, ma soprattutto inizieremo ad addentrarci nel magico mondo
della programmazione utilizzando il linguaggio Arduino e le sue schede elettroniche!
Grazie per averci seguito in questa prima avventura e speriamo che gradirai
anche le successive!
114 Laboratorio di elettronica: Impara e sperimenta
© 2024 ELAB. Tutti i diritti riservati.
Nessuna parte di questo libro puÃ† essere riprodotta o distribuita in qualsiasi forma o con
qualsiasi mezzo, elettronico o meccanico, senza il permesso scritto dell''autore.
ELAB', 112, 372);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'Volume 3', NULL, 'LABORATORIO DI ELETTRONICA
II MM PP AA RR AA EE SS PP EE RR II MM EE NN TTAA
VOLUME (cid:197)
ELAB', 1, 24);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'Capitolo 1', NULL, 'Indice
Capitolo 1- Un viaggio nella storia della programmazione ...................................... 05
Capitolo 2 - Cos’è la Programmazione?....................................................................09
Capitolo 3 - Ardware e Software: cosa cambia? ......................................................13
Capitolo 4 - Il collegamento tra te e Arduino (IDE).................................................... 37
Capitolo 5 - Come è fatto un programma Arduino?................................................ 47
Capitolo 6 - I pin digitali : le dita di Arduino............................................................. 53
Capitolo 7 - I pin imput e output............................................................................ 63
Capitolo 8 - I PIN ANALOGICI: ARDUINO I(cid:51)PARA A SENTIRE LE (cid:72)UANTIT(cid:19)................... 75
Capitolo 9 - ......................................................................................................... 85
Capitolo 10 - ........................................................................................................ 93
Capitolo 11 - ....................................................................................................... 103
Capitolo 12 - ........................................................................................................ 109
Non è finita qui! ................................................................................................... 114
COMPONENTI DEL KIT
1x Breadboard 830 punti
1x Multimetro + puntalini a coccodrillo
Cavi di differenti lunghezze
1x Clip Batteria intestata con header
Resistori 4 Bande:
10x 100 Ohm
10x 220 Ohm
10x 330 Ohm
10x 470 Ohm
10x 1 kOhm
LEDs:
5x Blu
5x Rosso
5x Verde
5x Giallo
5x Bianco
5x RGB catodo comune
5x Pulsanti
4x Transistor
4x Diodi
4x Fotosensori
4x Condensatori da 1000uF
2x Motori a corrente continua
2x Ruote
4 Laboratorio di elettronica: Impara e sperimenta', 3, 483);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 1', NULL, 'CAPITOLO 1
Un viaggio nella storia della programmazione
(cid:38)entornati, giovani esploratori(cid:5) (cid:51)ggi vi porter(cid:683) a scoprire uno dei poteri più
incredibili dell’essere umano: il linguaggio con cui d(cid:666) ordini alle macchine.(cid:124)
Programmare significa spiegare a una macchina cosa deve fare, passo
dopo passo. Ma prima di ini(cid:94)iare a scrivere codice, facciamo un salto
indietro nel tempo per capire come tutto è cominciato.
Prima dei computer: le idee geniali.
(cid:55)iamo a met(cid:666) dell’(cid:51)ttocento. Non esistono
computer, non esiste l’elettricit(cid:666) domestica e molte
inven(cid:94)ioni moderne devono ancora nascere. Eppure
una giovane matematica inglese, Ada (cid:48)ovelace,
immagina che una macchina possa seguire istru(cid:94)ioni
per eseguire calcoli complessi. (cid:647) la prima persona a
descrivere (cid:85)uello che oggi chiamiamo algoritmo: una
se(cid:85)uen(cid:94)a di passi chiara e ordinata che permette a
una macchina di fare (cid:85)ualcosa.
(cid:647) come se avesse visto il
futuro un secolo prima(cid:5)
(cid:53)ualche anno prima, nel 1(cid:28)(cid:20)4, (cid:46)oseph (cid:46)ac(cid:85)uard
aveva gi(cid:666) costruito un telaio che fun(cid:94)ionava
tramite schede forate. (cid:51)gni scheda diceva alla
macchina come muovere i fili per creare un certo
disegno. Anche se era solo un meccanismo,
possiamo considerarlo uno dei primi esempi di
(cid:392)programma(cid:393).
Laboratorio di elettronica: Impara e sperimenta 5', 5, 372);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 1', NULL, 'CAPITOLO 1
I primi computer: giganti lenti e
rumorosi
Molto tempo dopo, durante la seconda
guerra mondiale, nascono i primi
computer elettronici.
Erano enormi, lenti, rumorosi e pieni di
valvole che si scaldavano subito. Uno
dei più famosi è ENIAC, costruito nel
Altro che tastiera(cid:399)
1946: era grande come un’aula
programmare allora
scolastica. Per programmarlo non si voleva dire diventare
usava una tastiera, ma bisognava elettricisti(cid:5)
collegare cavi, spostare interruttori e
modificare interi pannelli.
(cid:42)(cid:51)(cid:54)(cid:56)(cid:54)AN viene usato per la
matematica, C(cid:51)(cid:38)(cid:51)(cid:48) per il mondo
Il linguaggio macchina delle a(cid:94)iende e (cid:38)A(cid:55)IC per chi vuole
imparare a programmare. Per la
Con l’arrivo dei primi sistemi più
prima volta è possibile scrivere
avan(cid:94)ati, i programmatori ini(cid:94)iano a
comandi simili all’inglese, molto
scrivere se(cid:85)uen(cid:94)e di numeri (cid:12)(cid:20) e 1(cid:13) che
più facili da ricordare e da leggere.
rappresentano istru(cid:94)ioni per il
computer.
(cid:647) il livello più (cid:392)puro(cid:393) e difficile della
Il boom del personal computer
programma(cid:94)ione.
Da (cid:194) e (cid:195) alle parole vere
Ogni scoperta ha portato a nuove
Negli anni ’(cid:25)(cid:20) e ’6(cid:20) succede (cid:85)ualcosa invenzioni, che hanno cambiato
di rivolu(cid:94)ionario: nascono i primi il mondo e il nostro modo di vivere.
linguaggi di programma(cid:94)ione leggibili E chissà quali altre incredibili
dalle persone. scoperte ci riserverà il futuro!
6 Laboratorio di elettronica: Impara e sperimenta
ALTRI CENNI DI STORIA DELL’ELETTRONICA
Programmare oggi: da Arduino all’intelligenza artificiale
(cid:51)ggi programmare è alla portata di tutti. Anche una piccola scheda come
Arduino permette di creare luci intelligenti, piccoli robot, sistemi di allarme
e giochi interattivi. Nei prossimi capitoli imparerai a usarla passo dopo
passo.
Programmare non significa solo', 6, 494);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 1', NULL, 'parlare a un computer: significa
creare (cid:85)ualcosa che prima non
esisteva.
NOTE
• Una istru(cid:94)ione è un comando dato a una macchina.
• Un programma è un insieme ordinato di istru(cid:94)ioni.
• I linguaggi di programma(cid:94)ione servono per facilitare la
comunica(cid:94)ione tra noi e il computer, sen(cid:94)a usare (cid:20) e 1.
Laboratorio di elettronica: Impara e sperimenta 7
NOTE
8 Laboratorio di elettronica: Impara e sperimenta', 7, 112);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 2', NULL, 'CAPITOLO 2
Cos’è la programmazione? I linguaggi di
programmazione
(cid:48)a programma(cid:94)ione è il modo in cui
comunichiamo con i dispositivi
I dispositivi elettronici programmabili,
elettronici programmabili per dir loro
proprio come gli esseri umani,
cosa devono fare. (cid:647) un po’ come
comunicano attraverso linguaggi
scrivere una ricetta che deve essere
diversi. Nel loro caso si chiamano
seguita passo dopo passo.
linguaggi di programma(cid:94)ione.
Immagina di voler preparare una
torta: hai una lista di ingredienti e una
serie di passaggi da seguire E come (cid:85)ualun(cid:85)ue lingua, hanno delle
nell’ordine corretto. regole grammaticali ben precise: se
non le rispettiamo, la macchina non
capisce e il programma non
(cid:55)e rispetti ogni passaggio, la torta
fun(cid:94)iona.
verr(cid:666) fuori(cid:5)
(cid:48)a programma(cid:94)ione fun(cid:94)iona Prova a leggere (cid:85)uesta frase:
esattamente allo stesso modo: se
riusciamo a dire, in modo chiaro e Io pu(cid:683) volere andare ma se io volere
preciso, cosa deve fare l’oggetto che andare come fare per volere andare
vogliamo programmare, possiamo ad andare(cid:35)
creare cose meravigliose. Anche i
videogiochi, le app sullo smartphone
e i soft(cid:91)are che usi ogni giorno
sono programmati(cid:5)
Laboratorio di elettronica: Impara e sperimenta 9', 9, 332);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 2', NULL, 'CAPITOLO 2
Per esempio, se dovessimo
Confusa(cid:206) vero?
programmare un robot per farlo
muovere, potremmo scrivere:
(cid:48)o stesso succede (cid:85)uando si scrive
male un programma. • (cid:58)ai avanti di (cid:23) passi
Nel mondo della programma(cid:94)ione, ad • (cid:43)irati a destra
(cid:392)esaminare(cid:393) se ci(cid:683) che abbiamo • (cid:55)aluta
scritto è corretto, c’è una sorta di E il robot eseguir(cid:666) (cid:85)ueste a(cid:94)ioni
professore molto severo: esattamente nel loro ordine.
il compilatore.
Un esempio pratico
Il suo compito è controllare se il
codice rispetta le regole del
Prova a fare un piccolo esperimento
linguaggio. (cid:55)e è corretto (cid:392)ti d(cid:666) la
con un tuo amico. Immagina di
sufficien(cid:94)a(cid:393) e fa partire il programma(cid:31)
doverlo guidare all’uscita della scuola.
se invece ci sono errori, non ti lascia
(cid:55)crivi tutte le istru(cid:94)ioni, una per una:
proseguire e non compila.
Nei linguaggi di programma(cid:94)ione non
1. Al(cid:94)ati dalla sedia
usiamo frasi, ma istru(cid:94)ioni, chiamate
anche linee di codice. (cid:22). (cid:42)ai un passo in avanti.
(cid:51)gni linea di codice corrisponde a (cid:23). (cid:43)irati di 9(cid:20) gradi a destra.
un’a(cid:94)ione.
Per esempio, se dovessimo (cid:55)e il tuo compagno riesce davvero ad
programmare un robot per farlo arrivare all’uscita seguendo solo le tue
muovere, potremmo scrivere: istru(cid:94)ioni, significa che hai scritto un
buon programma(cid:5)
(cid:55)e invece rimane bloccato contro un
muro o non sa cosa fare(cid:399) allora c’è
un problema, (cid:85)uello che in gergo si
chiama bug.
10 Laboratorio di elettronica: Impara e sperimenta', 10, 421);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, '1. M', NULL, 'Cos’è la programmazione?
Perch(cid:123) si chiama bug? Perch(cid:123) si chiama bug?
Il termine (cid:392)bug(cid:393) ha una storia Anche se il termine era gi(cid:666) usato in
curiosa che risale al 194(cid:27). ingegneria per indicare difetti o guasti,
(cid:55)i racconta che un gruppo di tecnici (cid:85)uesto episodio è entrato nella storia
che lavorava al computer Mar(cid:79) II dell’informatica e ha contribuito a
dell’Universit(cid:666) di (cid:44)arvard trov(cid:683) un renderlo famoso in tutto il mondo.
vero insetto (cid:386) una falena (cid:386)
ALGORIT(cid:51)I: LE RICETTE DELLA
incastrato in un componente, che
causava un malfun(cid:94)ionamento(cid:5) TECNOLOGIA
(cid:43)race (cid:44)opper, una pioniera Un algoritmo è semplicemente una
dell’informatica che faceva parte del lista di istru(cid:94)ioni, scritte in un ordine
team, document(cid:683) l’episodio preciso, che serve per raggiungere un
incollando la falena sul registro di risultato.Non è (cid:85)ualcosa di misterioso
bordo e scrivendo: ocomplicato: è un procedimento, un
(cid:392)(cid:42)irst actual case of bug being metodo, un (cid:392)come si fa(cid:393).
found.(cid:393)(cid:40)a (cid:85)uel momento, la parola
(cid:392)bug(cid:393) è diventata il termine più usato Per capirlo meglio, pensa a una ricetta
per indicare errori o problemi nei di cucina:
programmi.
1. Metti la farina
(cid:22). Aggiungi l’ac(cid:85)ua
(cid:23). Mescola
4. Inforna
(cid:55)e segui tutti i passaggi
correttamente, il dolce verr(cid:666)(cid:5)
Ma se sbagli l’ordine(cid:399) addio torta(cid:5)
Prima la metti nel forno e poi la
mescoli(cid:35) Impossibile.
(cid:48)a stessa cosa succede (cid:85)uando
programmi un computer:
Laboratorio di elettronica: Impara e sperimenta 11
Cos’è la programmazione?
L’ordine delle istruzioni è fondamentale.
• Creare videogiochi, dai più
Un algoritmo deve essere chiaro, semplici ai più complessi
ordinato e sen(cid:94)a confusione, perch(cid:675) la', 11, 486);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, '1. M', NULL, 'macchina eseguir(cid:666) esattamente ci(cid:683) • Costruire sistemi intelligenti,
che hai scritto, n(cid:675) più n(cid:675) meno. come allarmi, automa(cid:94)ioni o
piccoli assistenti
PE(cid:54)C(cid:44)(cid:648) P(cid:54)(cid:51)(cid:43)(cid:54)AMMA(cid:54)E (cid:647) C(cid:51)(cid:55)(cid:651)
E non solo(cid:5)
IMP(cid:51)(cid:54)(cid:56)AN(cid:56)E(cid:35)
Programmare significa prendere
(cid:43)ra(cid:94)ie alla programma(cid:94)ione puoi:
un’idea e trasformarla in (cid:85)ualcosa di
reale.
• progettare strumenti utili
• dare vita ai tuoi progetti
(cid:647) un superpotere moderno: ti permette
tecnologici
di far fare alle macchine tutto ci(cid:683) che
• imparare come ragionano le
vuoi, purch(cid:675) tu glielo sappia spiegare.
macchine
• sviluppare un metodo logico e
Con il codice puoi:
creativo
• Accendere un (cid:48)E(cid:40) con un
semplice comando
Programmare non è solo (cid:392)scrivere
• Controllare un robot, facendolo
codice(cid:393):
camminare, girare, evitare
ostacoli
è trasformare la tua immagina(cid:94)ione in
• (cid:48)eggere un sensore, per sapere la
(cid:85)ualcosa che fun(cid:94)iona davvero.
temperatura, la luce, il movimento
12 Laboratorio di elettronica: Impara e sperimenta', 12, 304);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 3', NULL, 'CAPITOLO 3
(cid:41)ARD(cid:90)ARE E SO(cid:39)T(cid:90)ARE: COSA CA(cid:51)(cid:22)IA?
(cid:41)ARD(cid:90)ARE: IL CORPO DEL SISTE(cid:51)A
Adesso che hai capito cos’è la
programma(cid:94)ione, possiamo fare un (cid:48)’hard(cid:91)are è tutto ci(cid:683) che puoi
passo avanti verso il nostro toccare fisicamente.
obiettivo:
imparare a usare Arduino nel (cid:647) fatto di plastica, metallo, cavi,
componenti elettronici.
(cid:647) la parte che reagisce al mondo
modogiusto
esterno, che si muove, si accende,
misura, emette suoni.
Per farlo, dobbiamo distinguere due
(cid:392)mondi(cid:393) che lavorano sempre
Esempi di hard(cid:91)are:
insieme.
• (cid:48)a scheda Arduino Nano (cid:54)4
(cid:55)ono come due met(cid:666) della stessa • un (cid:48)E(cid:40)
mela:
• un pulsante
• una batteria
(cid:44)ard(cid:91)are (cid:33) il corpo
• un sensore di temperatura
(cid:55)oft(cid:91)are (cid:33) la mente • i fili (cid:78)umper
(cid:55)en(cid:94)a uno dei due(cid:399) nulla pu(cid:683)
fun(cid:94)ionare davvero(cid:5)
misura, emette suoni. Esempi di
hard(cid:91)are:
Laboratorio di elettronica: Impara e sperimenta 13', 13, 279);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 3', NULL, 'CAPITOLO 3
(cid:51)a attenzione: E allo stesso tempo(cid:399)
sen(cid:94)a hard(cid:91)are, il soft(cid:91)are non pu(cid:683)
l’hard(cid:91)are da solo non fa fare nulla.
assolutamente nulla.
Non puoi far accendere un (cid:48)E(cid:40) se il
(cid:48)E(cid:40) non esiste(cid:5)
SO(cid:39)T(cid:90)ARE: LA (cid:51)ENTE C(cid:41)E CO(cid:51)ANDA
PERC(cid:41)(cid:28) LA(cid:89)ORANO INSIE(cid:51)E?
Il soft(cid:91)are è la parte invisibile ma
intelligente. (cid:647) ci(cid:683) che decide cosa deve Immagina una lampada intelligente.
fare l’hard(cid:91)are.
(cid:55)erve:
Esempi di soft(cid:91)are che usi ogni giorno:
• l’app della calcolatrice • hard(cid:91)are → la lampada, il (cid:48)E(cid:40), i
cavi
• (cid:61)ou(cid:56)ube
• soft(cid:91)are → il programma che dice
• un videogioco
(cid:85)uando deve accendersi o
• un messaggio sul telefono spegnersi
• e presto(cid:399) il codice che scriverai
nell’Arduino I(cid:40)E. (cid:55)e uno dei due manca, la lampada
non fun(cid:94)iona.
Il soft(cid:91)are è formato da istru(cid:94)ioni,
scritte in un linguaggio che la macchina
(cid:48)a stessa cosa succede in Arduino:
pu(cid:683) comprendere.
tu scrivi il programma (cid:12)soft(cid:91)are(cid:13) e la
(cid:55)en(cid:94)a soft(cid:91)are:
scheda esegue ci(cid:683) che hai scritto
(cid:12)hard(cid:91)are(cid:13)
• Arduino non sa (cid:85)uali pin accendere
• un sensore non sa (cid:85)uando inviare
dati
• un robot non sa muoversi
14 Laboratorio di elettronica: Impara e sperimenta
(cid:41)ARD(cid:90)ARE E SO(cid:39)T(cid:90)ARE: COSA CA(cid:51)(cid:22)IA?
IL (cid:51)ICROCONTROLLORE: IL CER(cid:89)ELLO DI
ARDUINO
(cid:40)entro la tua Arduino Nano (cid:54)4 c’è un
piccolo componente nero molto
importante:
il microcontrollore, cioè il (cid:392)cervello(cid:393)
della scheda.
(cid:647) molto più semplice di un computer,
ma anche più veloce in alcune cose:
FUNZIONI DISPONIBILI
esegue miliardi di opera(cid:94)ioni al
secondo ed è progettato per
Guarda il tuo multimetro: ha un', 14, 496);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 3', NULL, 'controllare dispositivi elettronici.
selettore rotativo al centro e tanti
numeri e simboli tutti intorno. Questa
Un microcontrollore pu(cid:683):
manopola ti permette di selezionare
• leggere ci(cid:683) che arriva dai sensori cosa vuoi che il multimetro misuri.
• accendere e spegnere (cid:48)E(cid:40)
• pilotare motori Puoi girarla in qualsiasi direzione.
• prendere decisioni con if Se la metti esattamente al centro,
• ripetere comandi molto di solito punterà verso la scritta OFF.
velocemente
• comunicare con il computer In questa posizione, il multimetro
tramite U(cid:55)(cid:38) è spento.
• memori(cid:94)(cid:94)are il tuo programma al
suo interno È super importante ricordarsi di
(cid:53)uando carichi uno s(cid:79)etch, è proprio il rimettere sempre la manopola su OFF
microcontrollore che lo esegue, quando hai finito di usarlo, così la
istru(cid:94)ione dopo istru(cid:94)ione. batteria del multimetro non si scarica
inutilmente!
(cid:647) gra(cid:94)ie a lui se Arduino (cid:392)vive(cid:393).
Laboratorio di elettronica: Impara e sperimenta 15', 15, 265);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 3', NULL, 'CAPITOLO 3
NOTE
(cid:195)(cid:200) Laboratorio di elettronica: Impara e sperimenta', 16, 20);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 4', NULL, 'CAPITOLO 4
IL COLLEGA(cid:51)ENTO TRA TE E ARDUINO
Che cos’è Arduino?
(cid:53)uando scriveremo i primi
programmi, succeder(cid:666) (cid:85)uesto:
• (cid:56)u scrivi il codice nell’Arduino
Al contrario di (cid:85)uello che si pensa,
I(cid:40)E (cid:12)soft(cid:91)are(cid:13).
Arduino non è solo una scheda
• Premi Carica.
elettronica.
• Il compilatore controlla che il
codice sia corretto.
(cid:647) molto di più: è una piattaforma
• Il programma viene inviato ad
completa che permette a
Arduino.
chiun(cid:85)ue , anche ai principianti, di
• Il microcontrollore lo
creare progetti elettronici e
memori(cid:94)(cid:94)a.
interattivi.
• (cid:48)’hard(cid:91)are risponde ai tuoi
Arduino è formato principalmente
comandi.
da tre elementi fondamentali, che
• In poche parole:
lavorano insieme come un’unica
s(cid:85)uadra:
(cid:56)u dai le istru(cid:94)ioni, Arduino
obbedisce.
Laboratorio di elettronica: Impara e sperimenta (cid:195)7', 17, 233);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 4', NULL, 'CAPITOLO 4
La scheda elettronica da programmare L’ambiente di sviluppo (Arduino IDE)
(cid:647) la parte fisica, (cid:85)uella che puoi
Per far fun(cid:94)ionare Arduino serve un
toccare.
posto in cui scrivere il codice,
(cid:48)a più famosa è Arduino UN(cid:51), ma ne
modificarlo e inviarlo alla scheda.
esistono moltissime varianti, ognuna
(cid:53)uesto posto è chiamato I(cid:40)E, cioè
con caratteristiche diverse.
Integrated (cid:40)evelopment
Environment.
Nel nostro percorso useremo una
Arduino mette a disposi(cid:94)ione due
Arduino Nano (cid:54)4, una scheda
I(cid:40)E diversi:
compatta e moderna, perfetta per
ini(cid:94)iare a programmare e per
I(cid:40)E (cid:22) (cid:40)es(cid:79)top
costruire prototipi.
(cid:647) un programma da installare sul tuo
computer.
(cid:647) stabile, veloce e molto usato da chi
lavora a progetti complessi.
(cid:48)a scheda contiene:
• un microcontrollore (cid:12)il
(cid:392)cervello(cid:393)(cid:13),
• i pin di input e output,
• il collegamento U(cid:55)(cid:38),
• alcuni componenti integrati,
come il (cid:48)E(cid:40) sulla scheda.
(cid:195)(cid:202) Laboratorio di elettronica: Impara e sperimenta
IL COLLEGA(cid:51)ENTO TRA TE E ARDUINO
(cid:59)eb I(cid:40)E (cid:53)uesta scelta ha creato nel tempo
una communit(cid:93) gigantesca di
(cid:42)un(cid:94)iona direttamente dal bro(cid:91)ser, appassionati, studenti, insegnanti,
sen(cid:94)a installare nulla. inventori, sviluppatori professionisti.
(cid:38)asta un account Arduino e puoi
programmare la scheda anche da (cid:51)gni giorno la communit(cid:93)
un’altra posta(cid:94)ione. contribuisce a migliorare Arduino:
In entrambi i casi, l’I(cid:40)E ti permette di:
• scrivere il codice, • crea librerie nuove,
• verificare se ci sono errori, • risolve problemi,
• caricare il programma sulla • pubblica tutorial,
scheda, • condivide progetti,
• usare esempi gi(cid:666) pronti, • risponde alle domande dei
• gestire librerie aggiuntive. principianti.', 18, 489);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 4', NULL, 'La communit(cid:187): il vero cuore di Arduino
(cid:647) proprio gra(cid:94)ie a (cid:85)uesta comunit(cid:666)
che Arduino è diventato lo strumento
Arduino è una piattaforma (cid:51)pen educativo n(cid:113)1 al mondo per imparare
(cid:55)ource. la programma(cid:94)ione e l’elettronica.
(cid:55)ignifica che:
• i progetti,
• la documenta(cid:94)ione,
• i file delle schede,
• l’ambiente di sviluppo
sono pubblici e accessibili a tutti.
Nessun brevetto segreto, nessun
blocco artificiale: chiun(cid:85)ue pu(cid:683)
studiare, migliorare e condividere.
Laboratorio di elettronica: Impara e sperimenta (cid:195)9', 19, 152);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 4', NULL, 'CAPITOLO 4
Come installare Arduino IDE
• Aprire un bro(cid:91)ser (cid:85)ualsiasi sul PC e inserire come indiri(cid:94)(cid:94)o
(cid:91)(cid:91)(cid:91).arduino.cc
• Nella homepage cliccare su documenta(cid:94)ione poi su soft(cid:91)are
• (cid:40)opo aver cliccato sar(cid:666) possibile scegliere
• per (cid:85)uale sistema operativo effettuare il do(cid:91)nload. (cid:55)cegli (cid:85)uello giusto per
il computer che stai utili(cid:94)(cid:94)ando nella lista (cid:40)(cid:51)(cid:59)N(cid:48)(cid:51)A(cid:40)(cid:55) (cid:51)P(cid:56)I(cid:51)N(cid:55).
• Una volta finito il do(cid:91)nload lancia il programma Arduino I(cid:40)E
• Appena avviato per la prima volta Arduino I(cid:40)E installa dei pacchetti
necessari al suo fun(cid:94)ionamento in maniera autonoma(cid:5)
(cid:196)0 Laboratorio di elettronica: Impara e sperimenta', 20, 210);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, '1. C', NULL, 'IL COLLEGA(cid:51)ENTO TRA TE E ARDUINO
Il nostro primo programma Arduino
Adesso scriveremo e capiremo insieme il nostro primissimo programma su
Arduino(cid:5)
(cid:53)uesto programma si chiama (cid:38)lin(cid:79), che in inglese significa fare l’occhiolino.
Ed è proprio (cid:85)uello che faremo fare a un (cid:48)E(cid:40):
accendersi e spegnersi da solo.
PASSO (cid:195) (cid:227) Collegare Arduino al computer
(cid:56)i serve:
(cid:397) la tua Arduino Nano (cid:54)4
(cid:397) un cavo U(cid:55)(cid:38)(cid:17)C
(cid:397) un computer con l’Arduino I(cid:40)E
Procedi cos(cid:678):
1. Collega il cavo U(cid:55)(cid:38) alla scheda Arduino.
(cid:22). Collega l’altra estremit(cid:666) al computer.
(cid:23). (cid:40)ovresti vedere accendersi un (cid:48)E(cid:40) sulla
scheda: significa che ha ricevuto corrente.
(cid:55)e non la sele(cid:94)ioni, Arduino non sapr(cid:666) dove inviare il
programma.
PASSO (cid:197) (cid:227) Aprire l’esempio (cid:22)link
(cid:48)’esempio (cid:38)lin(cid:79) è gi(cid:666) dentro l’I(cid:40)E, pronto per essere
usato:
(cid:58)ai su (cid:42)ile → Esempi → (cid:20)1.(cid:38)asics → (cid:38)lin(cid:79).
(cid:55)i aprir(cid:666) una nuova finestra con il programma gi(cid:666)
scritto.
(cid:53)uesto è il codice più famoso del mondo Arduino.
Laboratorio di elettronica: Impara e sperimenta (cid:196)1
NOTE
(cid:196)(cid:196) Laboratorio di elettronica: Impara e sperimenta', 21, 352);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 5', NULL, 'CAPITOLO 5
Come è fatto un programma Arduino?
Un programma Arduino ha (cid:168)uasi
Anali(cid:94)(cid:94)iamo il programma più
famoso e semplice di Arduino: sempre (cid:196) parti importanti:
void setup(cid:12)(cid:13) (cid:95) setup(cid:12)(cid:13)
pinMode(cid:12)(cid:48)E(cid:40)(cid:67)(cid:38)UI(cid:48)(cid:56)IN, (cid:51)U(cid:56)PU(cid:56)(cid:13)(cid:31) (cid:647) la prepara(cid:94)ione.
(cid:97) (cid:58)iene eseguita una sola volta,
void loop(cid:12)(cid:13) (cid:95) (cid:85)uando Arduino si accende o si
digital(cid:59)rite(cid:12)(cid:48)E(cid:40)(cid:67)(cid:38)UI(cid:48)(cid:56)IN, (cid:44)I(cid:43)(cid:44)(cid:13)(cid:31) resetta.
dela(cid:93)(cid:12)1(cid:20)(cid:20)(cid:20)(cid:13)(cid:31) (cid:53)ui diciamo ad Arduino come deve
digital(cid:59)rite(cid:12)(cid:48)E(cid:40)(cid:67)(cid:38)UI(cid:48)(cid:56)IN, (cid:48)(cid:51)(cid:59)(cid:13)(cid:31) essere usato l’hard(cid:91)are (cid:12)pin,
dela(cid:93)(cid:12)1(cid:20)(cid:20)(cid:20)(cid:13)(cid:31) sensori, ecc.(cid:13).
(cid:97)
Un programma Arduino ha (cid:85)uasi loop(cid:12)(cid:13)
sempre (cid:22) parti importanti: (cid:647) il ciclo che si ripete.
Il codice dentro loop(cid:12)(cid:13) viene eseguito
all’infinito, in tondo: (cid:85)uando arriva
alla fine, ricomincia dall’ini(cid:94)io.
Puoi immaginare:
setup(cid:12)(cid:13) (cid:33) (cid:392)sistemiamo le cose prima
di ini(cid:94)iare a giocare(cid:393)
loop(cid:12)(cid:13) (cid:33) (cid:392)il gioco vero e proprio che
ripetiamo in continua(cid:94)ione(cid:393)
Laboratorio di elettronica: Impara e sperimenta (cid:196)(cid:197)', 24, 394);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 5', NULL, 'CAPITOLO 5
Spiegazione parola per parola
(cid:54)I(cid:43)A 1:
void setup(cid:12)(cid:13) (cid:95)
void . In inglese significa (cid:392)vuoto(cid:393).
(cid:53)ui vuol dire: (cid:85)uesta fun(cid:94)ione non
restituisce niente (cid:12)non ti d(cid:666) un
numero o un risultato da usare dopo(cid:13).
(cid:647) solo un gruppo di comandi da
eseguire.
(cid:54)I(cid:43)A (cid:22):
(cid:6) pinMode(cid:12)(cid:48)E(cid:40)(cid:67)(cid:38)UI(cid:48)(cid:56)IN, (cid:51)U(cid:56)PU(cid:56)(cid:13)(cid:31)
(cid:97) (cid:6)
pinMode
(cid:647) una fun(cid:94)ione(cid:19)comando.
(cid:392)Pin(cid:393) (cid:33) piedino di Arduino (cid:12)uno dei
buchini numerati(cid:13).
(cid:392)Mode(cid:393) (cid:33) modalit(cid:666).
(cid:53)uindi pinMode serve per dire:
setup
come useremo (cid:85)uel pin(cid:35) Come
ingresso o come uscita(cid:35)
(cid:55)ignifica prepara(cid:94)ione.
(cid:6) (cid:12) (cid:6) (cid:12)Parentesi chiusa(cid:13)
(cid:647) il nome speciale della fun(cid:94)ione che
Arduino cerca sempre all’ini(cid:94)io. Ini(cid:94)ia la lista delle informa(cid:94)ioni che
la fun(cid:94)ione pinMode deve usare.
(cid:12) (cid:13) (cid:12)Parentesi aperta e chiusa(cid:13)
(cid:48)E(cid:40)(cid:67)(cid:38)UI(cid:48)(cid:56)IN
(cid:48)e parentesi tonde.
(cid:55)ervono per dire se la fun(cid:94)ione ha (cid:48)E(cid:40) (cid:33) la lucina.
bisogno di (cid:85)ualche dato in ingresso.
(cid:38)UI(cid:48)(cid:56)IN (cid:33) (cid:392)incorporato(cid:393), cioè gi(cid:666)
(cid:53)ui sono vuote → setup non ha
montato sulla scheda.
bisogno di informa(cid:94)ioni in ingresso.
(cid:196)(cid:198) Laboratorio di elettronica: Impara e sperimenta
Come è fatto un programma Arduino?
(cid:647) come se dicessimo: (cid:392)usa la lucina
interna della scheda(cid:393).
(cid:6) , (cid:6) (cid:12)virgola(cid:13)
(cid:55)epara il primo dato (cid:12)(cid:85)uale pin(cid:13) dal
secondo dato (cid:12)come lo useremo(cid:13).
(cid:6)(cid:51)U(cid:56)PU(cid:56)(cid:6) (cid:55)ignifica uscita.', 25, 494);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 5', NULL, '(cid:58)uol dire: (cid:392)da (cid:85)uesto pin usciranno (cid:54)I(cid:43)A (cid:23):
segnali(cid:393), cioè Arduino user(cid:666) il pin per (cid:6) void loop(cid:12)(cid:13) (cid:95)
mandare corrente (cid:12)accendere cose,
(cid:6) void (cid:6)
come il (cid:48)E(cid:40)(cid:13).
(cid:647) come prima: fun(cid:94)ione che non
(cid:6) (cid:13) (cid:6) (cid:12)Parentesi chiusa(cid:13)
restituisce un valore.
Chiude la lista di informa(cid:94)ioni della
(cid:6) loop (cid:6)
fun(cid:94)ione.
In inglese significa (cid:392)giro(cid:393) (cid:19) (cid:392)ciclo(cid:393).
(cid:6) (cid:31) (cid:6) (cid:12)punto e virgola(cid:13)
(cid:647) il nome speciale della fun(cid:94)ione
(cid:647) come il punto alla fine di una frase. che Arduino ripete all’infinito.
(cid:40)ice ad Arduino: (cid:392)(cid:85)uesta istru(cid:94)ione è
(cid:6) (cid:12)(cid:13) (cid:6) (cid:12)Parentesi aperta e chiusa(cid:13)
finita, passa alla prossima(cid:393).
Come prima: parentesi tonde, (cid:85)ui
vuote perch(cid:675) la fun(cid:94)ione non ha
(cid:6) (cid:97) (cid:6) (cid:12)Parentesi graffa chiusa.(cid:13)
bisogno di dati in ingresso.
(cid:58)uol dire: (cid:392)(cid:85)ui finisce il blocco di
(cid:6) (cid:95) (cid:6) (cid:12)Parentesi graffa aperta(cid:13)
comandi di setup(cid:393).
(cid:53)uindi setup ha solo una riga di
Ini(cid:94)io del blocco di comandi che
comandi, (cid:85)uella con pinMode.
appartiene a loop.
Laboratorio di elettronica: Impara e sperimenta (cid:196)(cid:199)', 26, 368);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 5', NULL, 'CAPITOLO 5
(cid:6) , (cid:6) (cid:12)virgola(cid:13)
(cid:55)eparatore tra primo dato (cid:12)il pin(cid:13) e
secondo dato (cid:12)il valore(cid:13).
(cid:44)I(cid:43)(cid:44) (cid:6)In inglese (cid:392)alto(cid:393).
Per Arduino vuol dire: accendi, manda
corrente, metti (cid:85)uel pin a 1.
(cid:6) (cid:13) (cid:6) (cid:12)Chiusa parentesi(cid:13)
(cid:42)ine dei dati per digital(cid:59)rite.
(cid:54)I(cid:43)A (cid:27):
digital(cid:59)rite(cid:12)(cid:48)E(cid:40)(cid:67)(cid:38)UI(cid:48)(cid:56)IN, (cid:44)I(cid:43)(cid:44)(cid:13)(cid:31)
(cid:6) (cid:31) (cid:6) (cid:12)Punto e virgola(cid:13)
digital(cid:59)rite
(cid:42)ine dell’istru(cid:94)ione.
(cid:55)piega(cid:94)ione logica della scritta:
(cid:392)digital(cid:393) (cid:33) che pu(cid:683) valere solo (cid:20) o 1,
(cid:392)Accendi il (cid:48)E(cid:40) interno della scheda(cid:393).
spento o acceso.
(cid:392)(cid:91)rite(cid:393) (cid:33) scrivere.
Insieme: scrivere un valore digitale
su un pin, cioè dire ad Arduino se
(cid:85)uel pin deve essere spento (cid:12)(cid:20)(cid:13) o
acceso (cid:12)1(cid:13).
(cid:6) (cid:12) (cid:6) (cid:12)Parentesi chiusa(cid:13)
Ini(cid:94)io dei dati da passare alla
fun(cid:94)ione.
(cid:48)E(cid:40)(cid:67)(cid:38)UI(cid:48)(cid:56)IN
(cid:40)i nuovo, il (cid:48)E(cid:40) interno alla scheda.
(cid:196)(cid:200) Laboratorio di elettronica: Impara e sperimenta
Come è fatto un programma Arduino?
(cid:54)I(cid:43)A (cid:28)(cid:19)1(cid:20): dela(cid:93)(cid:12)1(cid:20)(cid:20)(cid:20)(cid:13)(cid:31) (cid:54)I(cid:43)A 9: digital(cid:91)rite(cid:12)(cid:48)E(cid:40)(cid:67)(cid:38)U(cid:48)(cid:40)IN(cid:43), (cid:48)(cid:51)(cid:59)(cid:13)(cid:31)
dela(cid:93) (cid:647) come la riga (cid:25), ma:
(cid:55)ignifica (cid:392)pausa (cid:19) ritardo(cid:393). (cid:397) (cid:48)(cid:51)(cid:59)
(cid:40)ice ad Arduino di aspettare un po’ o In inglese (cid:392)basso(cid:393).
prima di fare (cid:6) il prossimo
o (cid:58)uol dire: spegni, niente corrente,
comando.', 27, 496);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 5', NULL, 'metti (cid:85)uel pin a (cid:20).
(cid:6) (cid:12) (cid:6) (cid:12) aperta parentesi (cid:13)
Ini(cid:94)io del numero che indica (cid:85)uanto
(cid:55)piega(cid:94)ione logica della scritta:
tempo aspettare.
(cid:392)(cid:55)pegni il (cid:48)E(cid:40) interno della scheda.(cid:393)
1(cid:20)(cid:20)(cid:20)
Numero di millisecondi.
1(cid:20)(cid:20)(cid:20) millisecondi (cid:33) 1 secondo.
(cid:53)uindi: (cid:392)aspetta 1 secondo(cid:393).
(cid:6) (cid:13) (cid:6) (cid:12) Chiusa parentesi (cid:13)
(cid:42)ine del tempo specificato.
(cid:6) (cid:31) (cid:6) (cid:12) punto e virgola(cid:13)
(cid:42)ine dell’istru(cid:94)ione.
(cid:55)piega(cid:94)ione logica della scritta:
(cid:392)(cid:51)ra aspetta 1 secondo sen(cid:94)a fare
altro.(cid:393)
Laboratorio di elettronica: Impara e sperimenta (cid:196)(cid:201)
Come è fatto un programma Arduino?
(cid:54)I(cid:43)A (cid:28)(cid:19)1(cid:20): dela(cid:93)(cid:12)1(cid:20)(cid:20)(cid:20)(cid:13)(cid:31)
(cid:647) identica alla riga (cid:27):
di nuovo aspetta 1 secondo.
(cid:55)piega(cid:94)ione logica della scritta:
(cid:392)(cid:51)ra aspetta 1 secondo sen(cid:94)a fare
altro.(cid:393)
Cosa succede davvero passo passo
• All’accensione Arduino esegue setup(cid:12)(cid:13):
• imposta il (cid:48)E(cid:40) interno come uscita pinMode(cid:12)(cid:48)E(cid:40)(cid:67)(cid:38)UI(cid:48)(cid:56)IN, (cid:51)U(cid:56)PU(cid:56)(cid:13)(cid:31)
• (cid:97)
• Poi entra in loop(cid:12)(cid:13) e fa sempre gli stessi passi:
• digital(cid:59)rite(cid:12)(cid:48)E(cid:40)(cid:67)(cid:38)UI(cid:48)(cid:56)IN, (cid:44)I(cid:43)(cid:44)(cid:13)(cid:31) → accende il (cid:48)E(cid:40).
• dela(cid:93)(cid:12)1(cid:20)(cid:20)(cid:20)(cid:13)(cid:31) → aspetta 1 secondo.
• digital(cid:59)rite(cid:12)(cid:48)E(cid:40)(cid:67)(cid:38)UI(cid:48)(cid:56)IN, (cid:48)(cid:51)(cid:59)(cid:13)(cid:31) → spegne il (cid:48)E(cid:40).
• dela(cid:93)(cid:12)1(cid:20)(cid:20)(cid:20)(cid:13)(cid:31) → aspetta 1 secondo.', 28, 491);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 5', NULL, '• (cid:56)orna all’ini(cid:94)io di loop(cid:12)(cid:13) e ricomincia. (cid:97)
• (cid:97)
•
(cid:54)isultato: la lucina sulla scheda Arduino lampeggia: 1 secondo accesa, 1 secondo
spenta, all’infinito
Laboratorio di elettronica: Impara e sperimenta (cid:196)(cid:201)', 29, 67);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'Capitolo 5', NULL, 'Come è fatto un programma Arduino?
CAPITOL
O 5
Promemoria dei termini
NOTE DI ELAB – Da tenere a portata di mano
GLOSSARIO RAPIDO –
Capitolo 5
1.Sketch / Programma — L’insieme di istruzioni che Arduino esegue.
2.Istruzione (riga di codice) — Un comando singolo che Arduino deve fare.
3.setup() — La fase di preparazione: si esegue una sola volta all’avvio o al reset.
4.loop() — Il ciclo: si ripete all’infinito.
5.void — Significa “vuoto”: la funzione non restituisce un risultato, esegue solo
comandi.
6.Funzione — Un gruppo di comandi con un nome (es. setup, loop, delay…).
7.( ) (parentesi tonde) — Contengono i dati usati da una funzione (es.
delay(1000)).
8.{ } (parentesi graffe) — Indicano inizio e fine di un blocco di comandi.
9.pinMode(pin, modalità) — Dice ad Arduino come usare un pin.
10. OUTPUT — Il pin è un’uscita: Arduino può accendere o spegnere qualcosa.
11. LED_BUILTIN — La lucina già presente sulla scheda (LED interno).
12. digitalWrite(pin, valore) — Scrive su un pin digitale: acceso/spento.
13. HIGH — “Alto”: acceso, corrente presente (1).
14. LOW — “Basso”: spento, niente corrente (0).
15. delay(tempo) — Fa una pausa prima del comando successivo.
16. Millisecondi (ms) — 1000 ms = 1 secondo.
17. , (virgola) — Separa i dati dentro una funzione.
18. ; (punto e virgola) — Fine di un’istruzione (come il punto a fine frase).
19. Compilatore — Controlla se il codice è scritto bene; se trova errori non
carica il programma.
20. Reset — Riavvio della scheda: setup() riparte da capo.
Laboratorio di elettronica: Impara e sperimenta (cid:196)(cid:201)
CAPITOLO (cid:199)
NOTE
(cid:196)(cid:203) Laboratorio di elettronica: Impara e sperimenta', 30, 417);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 6', NULL, 'CAPITOLO 6
I PIN DIGITALI: LE DITA DI ARDUINO
(cid:109)(cid:38)entornati, giovani esploratori(cid:5) I pin digitali: cosa sono davvero?
(cid:43)uarda la tua Arduino Nano (cid:54)4.
(cid:42)ino a ora Arduino ha acceso e Ai lati della scheda vedi tanti buchini
spento una lucina sulla sua pancia(cid:399) numerati:
ma oggi scopriremo una cosa (cid:40)(cid:22), (cid:40)(cid:23), (cid:40)4(cid:399) (cid:40)1(cid:23).
incredibile: Arduino ha tante dita e con (cid:53)uelli che ini(cid:94)iano con la lettera (cid:40) si
ognuna può accendere e spegnere chiamano: pin digitali
qualcosa nel mondo reale! Un pin digitale è un punto da cui
Obiettivo del capitolo Arduino pu(cid:683):
In (cid:85)uesto capitolo imparerai: • far uscire corrente
• cosa sono i pin digitali • oppure non far uscire nulla
• cosa significano (cid:44)I(cid:43)(cid:44) e (cid:48)(cid:51)(cid:59) Non esistono vie di me(cid:94)(cid:94)o, solo due
possibilit(cid:666). Un pin digitale pu(cid:683) avere
• perch(cid:675) i pin fun(cid:94)ionano come
solo due stati:
interruttori
• ACCE(cid:55)(cid:51)
• come Arduino accende e spegne
• (cid:55)PEN(cid:56)(cid:51)
componenti esterni
• a creare giochi di luce sempre Proprio come:
più interessanti • un interruttore della luce
Alla fine del capitolo, Arduino non • un pulsante (cid:51)N (cid:19) (cid:51)(cid:42)(cid:42)
• una porta aperta o chiusa
controller(cid:666) più solo una lucina sulla
scheda(cid:399) ma componenti veri
nota E(cid:48)A(cid:38)
collegati fuori, come un vero cervello • Un pin digitale non è complicato:
elettronico. ofa passare corrente, oppure no.
Laboratorio di elettronica: Impara e sperimenta (cid:197)(cid:194)', 32, 413);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 6', NULL, 'CAPITOLO 6
HIGH e LOW: il linguaggio segreto dei OUTPUT: (cid:85)uando Arduino comanda
pin
Arduino non usa le parole (cid:392)acceso(cid:393) e (cid:53)uando vogliamo che Arduino
(cid:392)spento(cid:393). accenda o spenga (cid:85)ualcosa, usiamo il
Usa due parole speciali in inglese: pin come:
(cid:51)U(cid:56)PU(cid:56) (cid:12)uscita(cid:13)
HIGH , significa alto ,vuol dire:
• accendi
Per (cid:85)uesto, prima di usarlo, dobbiamo
• manda corrente
sempre dire:
• s(cid:678)
LOW, significa basso , vuol dire:
pinMode(cid:12)numero(cid:67)pin, (cid:51)U(cid:56)PU(cid:56)(cid:13)(cid:31)
• spegni
• niente corrente
È come dire ad Arduino:
• no
“Questo pin lo userai per dare ordini.”
Esempio pratico
Le due funzioni magiche
• (cid:48)E(cid:40) acceso → pin in (cid:44)I(cid:43)(cid:44)
Per controllare i pin digitali useremo
• (cid:48)E(cid:40) spento → pin in (cid:48)(cid:51)(cid:59)
sempre due fun(cid:94)ioni.
Arduino parla cos(cid:678) con l’elettronica. pinMode() – preparo il pin
(cid:55)erve per dire ad Arduino come
I pin digitali come interruttori (cid:51)ra
useremo un pin.
arriva una delle idee più importanti
Esempio:
di tutto Arduino.
pinMode(cid:12)1(cid:23), (cid:51)U(cid:56)PU(cid:56)(cid:13)(cid:31)
· Un pin digitale è come un (cid:55)ignifica:
interruttore elettronico. (cid:392)Il pin 1(cid:23) sar(cid:666) un’uscita.(cid:393)
(cid:48)a differen(cid:94)a è che:
digitalWrite() – accendo o spengo
• non lo premi con il dito
Esempio:
• lo comandi con il codice
digital(cid:59)rite(cid:12)1(cid:23), (cid:44)I(cid:43)(cid:44)(cid:13)(cid:31)
(cid:53)uando scrivi un programma, è come (cid:55)ignifica: (cid:392)Accendi il pin 1(cid:23).(cid:393)
se dicessi:
digital(cid:59)rite(cid:12)1(cid:23), (cid:48)(cid:51)(cid:59)(cid:13)(cid:31)
• (cid:392)Accendi (cid:85)uesto interruttore(cid:393) (cid:55)ignifica: (cid:392)(cid:55)pegni il pin 1(cid:23).(cid:393)
• (cid:392)(cid:55)pegni (cid:85)uest’altro(cid:393)', 33, 483);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 6', NULL, '(cid:197)(cid:195) Laboratorio di elettronica: Impara e sperimenta
I PIN DIGITALI: LE DITA DI ARDUINO
Premessa: Come fun(cid:94)iona ora:
(alimentazione breadboard)
(cid:48)a breadboard prende la corrente
dalla scheda Arduino.
(cid:54)aga(cid:94)(cid:94)i, nei (cid:58)olumi 1 e (cid:22) abbiamo
(cid:85)uasi sempre alimentato la Il positivo (cid:12)(cid:15)(cid:13) lo prendiamo dal pin
breadboard usando una batteria da (cid:25)(cid:58) dell’Arduino (cid:12)(cid:85)uello indicato
9(cid:58) (cid:12)con il suo cavetto(cid:19)clip(cid:13), (cid:85)uindi la proprio come (cid:25)(cid:58)(cid:13).
corrente arrivava alla breadboard
Il negativo (cid:12)(cid:431)(cid:13) lo prendiamo da uno
direttamente dalla batteria.
dei pin GND (cid:12)massa(cid:13) indicati sulla
scheda.
(cid:40)a adesso, con Arduino Nano (cid:54)4,
cambiamo metodo: non usiamo più
la 9(cid:58) per alimentare la breadboard,
perch(cid:675) l’alimenta(cid:94)ione pu(cid:683) arrivare
direttamente dalla scheda Arduino
collegando il cavo usbC al PC.
•
Laboratorio di elettronica: Impara e sperimenta (cid:197)(cid:196)
breadboard
Così tutta la breadboard è alimentata
in modo ordinato: tutti i componenti
useranno lo stesso 5V e la stessa
massa (GND).', 33, 305);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 6', 'ESPERIMENTO 1', 'I PIN DIGITALI: LE DITA DI ARDUINO
ESPERIMENTO 1: Colleghiamo la resistenza
• Materiale necessario (cid:48)a resisten(cid:94)a deve andare in serie al
• 1 Arduino Nano (cid:54)4 led .(cid:53)uindi metti un capo della
resisten(cid:94)a nella stessa fila della gamba
• 1 breadboard (cid:12)4(cid:20)(cid:20) punti(cid:13)
corta del (cid:48)E(cid:40).
• 1 (cid:48)E(cid:40) (cid:12)rosso o verde(cid:13)
(cid:48)’altro capo lo mettiamo nella colonna
• 1 resisten(cid:94)a 4(cid:27)(cid:20) (cid:186) del gnd della nostra NAN(cid:51)
• 1 cavetto (cid:78)umper
• Cavo U(cid:55)(cid:38)(cid:17)C
Posizioniamo Arduino Nano sulla
breadboard
Prendi la breadboard.
Inserisci la Arduino Nano in modo che:
i pin di sinistra stiano su una riga (cid:6)a(cid:6),
i pin di destra sulla riga (cid:6)g(cid:6) Collegamenti elettrici con Arduino Nano
(cid:48)a Nano rimane a cavalo della rigache D13 → gamba lunga del (cid:48)E(cid:40) (cid:12)anodo(cid:13)
separa le breadbord, cos(cid:678) ogni pin resta
(cid:12)useremo (cid:40)1(cid:23) perch(cid:675) è (cid:85)uello che
separato. in (cid:85)uesto modo puoi usare
controlla il (cid:48)E(cid:40) interno, cos(cid:678) il codice
facilmente i pin (cid:40)(cid:22), (cid:40)(cid:23), (cid:40)4(cid:399) (cid:40)1(cid:23) e i pin
resta identico(cid:13)
(cid:43)N(cid:40), (cid:25)v
GND → resisten(cid:94)a → gamba corta del
Spostiamo il LED sulla breadboard (cid:48)E(cid:40) (cid:12)catodo(cid:13)
Useremo un (cid:48)E(cid:40) verde per riprodurre lo
stesso effetto del (cid:48)E(cid:40)(cid:67)(cid:38)UI(cid:48)(cid:56)IN, ma
(cid:85)uesta volta fuori dalla scheda.
 (cid:48)unga (cid:33) anodo (cid:12)(cid:15)(cid:13)
 Corta (cid:33) catodo (cid:12)(cid:385)(cid:13)
Laboratorio di elettronica: Impara e sperimenta (cid:197)(cid:197)', 35, 442);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'capitolo 5', 'ESPERIMENTO 2', 'I PIN DIGITALI: LE DITA DI ARDUINO
Codice da caricare (lo stesso del ESPERIMENTO 2:
capitolo 5 l’unica differenza che invece
Cambia il numero di pin sia sul codice che
di usare il termine “LED_BUILTIN” lo sulla (cid:38)readbord
sostituiamo con “13 “
Modifica il pin:
Prova a usare:
pinMode(cid:12)(cid:25), (cid:51)U(cid:56)PU(cid:56)(cid:13)(cid:31)
digital(cid:59)rite(cid:12)(cid:25), (cid:44)I(cid:43)(cid:44)(cid:13)(cid:31)
digital(cid:59)rite(cid:12)(cid:25), (cid:48)(cid:51)(cid:59)(cid:13)(cid:31)
ESPERIMENTO 3:
(cid:42)ai un (cid:55)(cid:51)(cid:55) in codice Morse
Modifica il codice aggiungi comandi:
Prova a usare:
void loop(cid:12)(cid:13) (cid:95)
Nota: su Arduino Nano è meglio usare il digital(cid:59)rite(cid:12)1(cid:23), (cid:44)I(cid:43)(cid:44)(cid:13)(cid:31)
numero del pin (cid:12)1(cid:23)(cid:13) invece di
dela(cid:93)(cid:12)1(cid:20)(cid:20)(cid:20)(cid:13)(cid:31)
(cid:48)E(cid:40)(cid:67)(cid:38)UI(cid:48)(cid:56)IN, per essere più chiari nella
digital(cid:59)rite(cid:12)1(cid:23), (cid:48)(cid:51)(cid:59)(cid:13)(cid:31)
pratica.
dela(cid:93)(cid:12)(cid:22)(cid:20)(cid:20)(cid:13)(cid:31)
Esperimenti aggiuntivi (per approfondire) digital(cid:59)rite(cid:12)1(cid:23), (cid:44)I(cid:43)(cid:44)(cid:31)
Cambia la velocit(cid:666) del lampeggio dela(cid:93)(cid:12)(cid:22)(cid:20)(cid:20)(cid:13)(cid:31)
digital(cid:59)rite(cid:12)1(cid:23), (cid:48)(cid:51)(cid:59)(cid:13)(cid:31)
Modifica il delay:
dela(cid:93)(cid:12)(cid:22)(cid:20)(cid:20)(cid:20)(cid:13)(cid:31)
(cid:397) (cid:22)(cid:20)(cid:20) ms → lampeggio veloce (cid:97)
(cid:397) (cid:22)(cid:20)(cid:20)(cid:20) ms → lampeggio lento
Laboratorio di elettronica: Impara e sperimenta (cid:197)(cid:198)', 36, 427);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'capitolo 5', 'ESPERIMENTO 4', 'Come è fatto un programma Arduino?
ESPERIMENTO 4 :
PROGRAMMA LUCI LAMPEGGIANTE STILE
SIRENATO 2 :
Due LED: effetto “polizia”
Prova a usare:
• (cid:48)E(cid:40) 1 → pin (cid:28)
Collega:
• (cid:48)E(cid:40) (cid:22) → pin 9
Programma: • uno acceso
• l’altro spento
• poi si scambiano
(cid:54)isultato: luci lampeggianti stile sirena(cid:5)
In (cid:85)uesto modo possiamo scrivere
tutte le annota(cid:94)ioni che vogliamo
direttamente sulla riga interessata
(cid:12)oanche su più righe(cid:13), sen(cid:94)a
modificare il comportamento del
codice: i commenti infatti non
vengono eseguiti e (cid:85)uindi non
interferiscono con il programma
scritto nell’I(cid:40)E.
Nota di elab
Nella figura affianco abbiamo inserito
delle scritte di spiega(cid:94)ione per chiarire il
significato e il fun(cid:94)ionamento di ogni
singola stringa(cid:19)istru(cid:94)ione del programma.
(cid:53)ueste spiega(cid:94)ioni sono state aggiunte
sotto forma di commenti, riconoscibili
perch(cid:675) prima del testo compaiono due
barre:
// esempio di nota
Laboratorio di elettronica: Impara e sperimenta (cid:197)(cid:198)', 37, 274);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'capitolo 5', 'ESPERIMENTO 5', 'I PIN DIGITALI: LE DITA DI ARDUINO
Note utili Prova a scriverlo da solo poi controlli le
stringe con (cid:85)uesto esempio.
Usa i commenti per: spiegare
cosa fa una riga, chiarire
passaggi complessi, indicare
valori importanti, o ricordare
scelte fatte durante lo sviluppo.
Mantieni i commenti brevi e
chiari, cos(cid:678) il codice resta
leggibile.
(cid:55)e cambi il codice, aggiorna
anche i commenti: devono
sempre
(cid:392)seguire(cid:393) il programma per
evitare
ESPERIMENTO 5: Il semaforo
Un semaforo è solo: un (cid:38)link
con più fasi
LED:
Verde → pin (cid:25)
(cid:43)iallo → pin 6
Rosso → pin 7
S(cid:70)q(cid:86)(cid:70)(cid:79)z(cid:66)(cid:27)
V(cid:70)(cid:83)(cid:69)(cid:70)(cid:1)(cid:9)3(cid:1)(cid:84)(cid:10)
(cid:40)(cid:74)(cid:66)(cid:77)(cid:77)(cid:80)(cid:1)(cid:9)1(cid:1)(cid:84)(cid:10)
(cid:83)(cid:80)(cid:84)(cid:84)(cid:80)(cid:1)(cid:9)3(cid:1)(cid:84)(cid:10)
R(cid:74)(cid:81)(cid:70)(cid:85)(cid:74)
Laboratorio di elettronica: Impara e sperimenta (cid:197)(cid:197)(cid:198)(cid:199)
I PIN DIGITALI: LE DITA DI ARDUINO
(cid:44)ai appena reali(cid:94)(cid:94)ato:
• il primo circuito fisico con Arduino Nano,
• il primo programma che controlla un componente esterno,
• il collegamento tra soft(cid:91)are (cid:12)codice(cid:13) e hard(cid:91)are (cid:12)(cid:48)E(cid:40) (cid:15) breadboard(cid:13).
Errori tipici (diventa un detective)
(cid:55)e il (cid:48)E(cid:40) non si accende, controlla:
Chec(cid:79)list:
• (cid:48)E(cid:40) girato nel verso giusto(cid:35)
• (cid:54)esisten(cid:94)a collegata bene(cid:35)
• (cid:43)N(cid:40) presente(cid:35)
• Numero del pin corretto sia sulla breadbord che nel codice(cid:35)
Nota ELAB
Un buon programmatore controlla sempre anche i fili.
Laboratorio di elettronica: Impara e sperimenta (cid:197)(cid:199)
I PIN DIGITALI: LE DITA DI ARDUINO
NOTE DI ELAB - Promemoria dei termini (Capitolo 6)
TERMINE', 38, 471);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'capitolo 5', 'ESPERIMENTO 5', 'Pin digitali (cid:12)(cid:40)(cid:22), (cid:40)(cid:23)... (cid:40)1(cid:23)(cid:13) Piedini che possono stare solo in due
(cid:44)I(cid:43)(cid:44) (cid:55)tato (cid:11)acceso(cid:11): il pin vale 1 e manda corrente.
(cid:48)(cid:51)(cid:59) (cid:55)tato (cid:11)spento(cid:11): il pin vale (cid:20) e non manda corrente.
Interruttore elettronico Un pin digitale e(cid:11) come un interruttore: lo accendi o
lo spegni con il codice.
(cid:51)U(cid:56)PU(cid:56) Modalita(cid:11) per comandare (cid:85)ualcosa: Arduino usa il
pin per far uscire un segnale.
pinMode(cid:12)pin, (cid:51)U(cid:56)PU(cid:56)(cid:13) (cid:40)ice ad Arduino: (cid:11)(cid:85)uesto pin lo usero(cid:11) come uscita(cid:11).
digital(cid:59)rite(cid:12)pin, (cid:44)I(cid:43)(cid:44)(cid:19)(cid:48)(cid:51)(cid:59)(cid:13) Accende o spegne un pin digitale (cid:12)e (cid:85)uindi un (cid:48)E(cid:40)
collegato
(cid:48)E(cid:40) (cid:12)anodo e catodo(cid:13) (cid:43)amba lunga (cid:33) anodo (cid:12)(cid:15)(cid:13). (cid:43)amba corta (cid:33) catodo (cid:12)(cid:17)(cid:13).
(cid:54)esisten(cid:94)a in serie (cid:12)(cid:22)(cid:22)(cid:20)(cid:17)4(cid:27)(cid:20) (cid:48)imita la corrente per proteggere il (cid:48)E(cid:40): va messa in
ohm(cid:13) serie al (cid:48)E(cid:40).
(cid:43)N(cid:40) Massa(cid:19)(cid:94)ero volt: e(cid:11) il ritorno della corrente (cid:12)il
(cid:11)negativo(cid:11)(cid:13).
(cid:25)(cid:58) Alimenta(cid:94)ione positiva dalla scheda (cid:12)il (cid:11)positivo(cid:11)(cid:13).
(cid:40)1(cid:23) e (cid:48)E(cid:40)(cid:67)(cid:38)UI(cid:48)(cid:56)IN (cid:40)1(cid:23) e(cid:11) il pin collegato alla lucina interna. Per un (cid:48)E(cid:40)
esterno puoi usare anche il numero 1(cid:23).
dela(cid:93)(cid:12)ms(cid:13) Pausa: ferma Arduino per un tempo in millisecondi
(cid:12)1(cid:20)(cid:20)(cid:20) ms (cid:33) 1 secondo(cid:13).
Millisecondo (cid:12)ms(cid:13) Pausa: ferma Arduino per un tempo in millisecondi', 40, 484);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'capitolo 5', 'ESPERIMENTO 5', '(cid:12)1(cid:20)(cid:20)(cid:20) ms (cid:33) 1 secondo(cid:13).
Unita(cid:11) di tempo: 1(cid:20)(cid:20)(cid:20) ms (cid:33) 1 secondo.
Commenti (cid:19)(cid:19) Note per gli umani: Arduino le ignora. (cid:55)ervono per
ricordare e spiegare il codice.
(cid:55)e(cid:85)uen(cid:94)a (cid:19) fasi Una se(cid:85)uen(cid:94)a e(cid:11) una serie di accensioni con tempi
diversi (cid:12)es. semaforo: verde, giallo, rosso(cid:13).
(cid:40)ebug (cid:12)chec(cid:79)list(cid:13) (cid:55)e non fun(cid:94)iona: (cid:48)E(cid:40) nel verso giusto(cid:35) resisten(cid:94)a
presente(cid:35) (cid:43)N(cid:40) collegato(cid:35) pin giusto nel codice(cid:35)
Laboratorio di elettronica: Impara e sperimenta (cid:197)(cid:199)
I PIN DIGITALI: LE DITA DI ARDUINO
NOTE
(cid:197)(cid:200) Laboratorio di elettronica: Impara e sperimenta', 40, 205);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 7', NULL, 'CAPITOLO 7
I PIN DI INPUT: ARDUINO ASCOLTA E DECIDE
«Giovani esploratori, fino a questo Arduino mette un pin in (cid:44)(cid:45)(cid:43)(cid:44) → esce
momento Arduino è stato un (cid:392)energia(cid:393) → (cid:48)E(cid:40) si accende
ottimo esecutore. Arduino mette un pin in (cid:48)(cid:51)(cid:59) → non esce
Ha acceso luci, le ha spente, ha energia → (cid:48)E(cid:40) si spegne
fatto lampeggiare LED come un
vero mago dell’elettronica. (cid:53)uindi:
(cid:51)(cid:57)(cid:56)(cid:52)(cid:57)(cid:56) (cid:33) (cid:37)rduino comanda
Ma c’è una domanda importante
da farsi:
Arduino può reagire a quello
che facciamo noi?
La risposta è sì.
(cid:51)ra invece vogliamo che Arduino riceva
E oggi Arduino impara una nuova
un’informa(cid:94)ione dall’esterno.
abilità: ascoltare.»
Per esempio: (cid:392)(cid:53)ualcuno sta premendo un
pulsante(cid:35)(cid:393)
(cid:45)(cid:50)(cid:52)(cid:57)(cid:56) (cid:33) (cid:37)rduino asco(cid:80)ta
7.1 INPUT e OUTPUT:
Arduino parla e Arduino
ascolta
Nel Capitolo 6 abbiamo usato i pin
digitali come OUTPUT (uscita). Cosa
vuol dire? (cid:647) come dire:
(cid:51)U(cid:56)PU(cid:56) → Arduino usa la bocca
INPU(cid:56) → Arduino usa le orecchie
Laboratorio di elettronica: Impara e sperimenta 63', 42, 308);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 7', NULL, 'CAPITOLO 7
7.2 Il pulsante: come (cid:53)uesta modalit(cid:666): rende la lettura stabile
funziona davvero riduce i collegamenti evita falsi valori
(cid:392)strani(cid:393)
Un pulsante è un componente
Ma c’è un effetto curioso
semplice ma geniale.
Quando NON premi
Con INPUT_PULLUP:
Il circuito è aperto → non passa
corrente.
pulsante N(cid:51)N premuto → (cid:44)I(cid:43)(cid:44)
Quando premi pulsante premuto → (cid:48)(cid:51)(cid:59)
Il circuito si chiude → passa corrente. Sì: è “al contrario”.
(cid:53)uindi il pulsante manda ad Arduino un
Ma è normale: basta ricordarselo.
messaggio che ha solo due possibilit(cid:666):
• s(cid:678) (cid:19) no Perch(cid:675) non basta scrivere INPU(cid:56)(cid:35)
• acceso (cid:19) spento (cid:53)uando scrivi: pinMode(cid:12)(cid:22), INPU(cid:56)(cid:13)(cid:31)
• (cid:44)I(cid:43)(cid:44) (cid:19) (cid:48)(cid:51)(cid:59)
Arduino dice:
Come ti ricorderai nel volume uno di Elab (cid:392)(cid:51)(cid:79), il pin (cid:22) adesso deve ascoltare.(cid:393)
abbiamo visto come collegare il pulsante, MA(cid:399) c’è un problema grosso:
ricordati il pulsante va sempre inserito a Un pin in INPU(cid:56) è come un orecchio
cavallo della riga centrale della breadbord. super sensibile.(cid:55)e non gli dai un
riferimento, il pin resta (cid:392)in aria(cid:393), cioè non
7.3 INPUT_PULLUP: la
è collegato n(cid:675) a (cid:25)(cid:58) n(cid:675) a (cid:43)N(cid:40).
scorciatoia più utile per E un pin (cid:392)in aria(cid:393) pu(cid:683):
leggere (cid:44)I(cid:43)(cid:44) anche se non tocchi niente
iniziare
leggere (cid:48)(cid:51)(cid:59) a caso cambiare valore
(cid:51)ra arriva un trucco utilissimo.
solo perch(cid:675) muovi un filo o avvicini la
In teoria, per far fun(cid:94)ionare bene un
mano
pulsante, servirebbe una resisten(cid:94)a (cid:392)di
(cid:53)uesto si chiama pin fluttuante
aiuto(cid:393).
(cid:12)floating(cid:13).
Ma Arduino ce l’ha gi(cid:666) dentro(cid:5)
(cid:647) come chiedere a (cid:85)ualcuno:', 43, 492);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 7', NULL, '(cid:53)uindi invece di scrivere:
(cid:392)(cid:44)ai sentito un rumore(cid:35)(cid:393)
pinMode(2, INPUT);
ma stai in una stan(cid:94)a piena di eco:
noi useremo:
sentir(cid:666) (cid:392)(cid:85)ualcosa(cid:393) anche se non c’è.
pinMode(2, INPUT_PULLUP);
64 Laboratorio di elettronica: Impara e sperimenta', 43, 77);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 7', 'ESERCIZIO 7', 'CHE COSA SONO I CONDENSATORI?
Quindi a cosa serve INPUT_PULLUP? ESERCIZIO 7.3 –
Quando scrivi: Collegamento del pulsante
pinMode(2, INPUT_PULLUP);
con INPUT_PULLUP (super
Arduino fa due cose insieme: mette il pin
semplice)
in INPUT (ascolta) attiva una resistenza
interna che lo “tira su” verso HIGH
Obiettivo: collegare il pulsante
usando solo 1 filo + GND. Scegliamo
Cosa significa “tira su”?
il pin di lettura:
useremo D2. Collega un cavetto da
Significa che Arduino dice al pin:
D2 a un lato del pulsante.
“Se nessuno ti sta dicendo nulla, tu stai su
Collega l’altro lato del pulsante a
HIGH, in modo stabile.”
GND.Fatto.
Questa resistenza interna si chiama pull-
up.
Così il pin non resta più “in aria”
Con INPUT_PULLUP succede questo:
Quando NON premi il pulsante
il pulsante è aperto (non collega niente)
il pin NON resta nel vuoto
la resistenza interna lo tiene su → HIGH
stabile
In questo modo:
Quando PREMI il pulsante
il pulsante collega il pin a GND se premi → D2 si collega a GND →
quindi il pin va a 0V → LOW Arduino legge LOW
Ecco perché “premuto = se non premi → Arduino legge HIGH
LOW” (sembra al contrario ma è (grazie al pullup interno)
normale).
Laboratorio di elettronica: Impara e sperimenta 65', 44, 304);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 7', NULL, 'CAPITOLO 7
7.4 (cid:37)rd(cid:89)ino le(cid:75)(cid:75)e “pre(cid:81)(cid:89)to (cid:51) non pre(cid:81)(cid:89)to” di(cid:75)ital(cid:54)ead():
(cid:51)ra Arduino deve leggere lo stato del pulsante. Nel capitolo precedente per accendere i
led abbiamo usato digital(cid:59)rite(cid:12)(cid:22), ....(cid:13) (cid:85)uindi diciamo noi se scceso o spento, ora
dobbiamo leggere il valore del pulsante (cid:85)uindi la fun(cid:94)ione è: digital(cid:54)ead(cid:12)(cid:22), ....(cid:13)
(cid:53)uesta fun(cid:94)ione restituisce: (cid:44)I(cid:43)(cid:44) o (cid:48)(cid:51)(cid:59)
Ecome chiedere: il Pin (cid:22), mi stai dicendo (cid:44)I(cid:43)(cid:44) o (cid:48)(cid:51)W?
7.(cid:26) Arduino decide: if, else
e perch(cid:623) usiamo (cid:6) == (cid:6)
(cid:51)ra arriva la magia vera della programma(cid:94)ione.
Arduino non deve solo leggere: deve decidere.
Usiamo:
if (condizione) int pulsante (cid:33) (cid:22)(cid:31)
int led (cid:33) (cid:28)(cid:31) (cid:19)(cid:19) fai (cid:85)uesto
else { (cid:97) (cid:19)(cid:19) altrimenti fai (cid:85)uest(cid:11)altro
(cid:55)E succede una cosa → fai A A(cid:48)(cid:56)(cid:54)IMEN(cid:56)I → fai (cid:38)
Nel nostro caso:
(cid:55)e il pulsante è premuto
(cid:12)(cid:48)(cid:51)(cid:59)(cid:13) → accendi (cid:48)E(cid:40) A(cid:48)(cid:56)(cid:54)IMEN(cid:56)I
→spegni (cid:48)E(cid:40)
(cid:6)int(cid:6) e (cid:6) (cid:33)(cid:33) (cid:6)
Abbiamo aggiunto un altro
termine al programma nella
pagina successiva ti spiego tutto(cid:5)
66 Laboratorio di elettronica: Impara e sperimenta
CHE COSA SONO I CONDENSATORI?
7.7 Le “scatoline” dei numeri: (cid:6) int (cid:6)
(cid:53)uando scriviamo:
int pulsante (cid:33) (cid:22)(cid:31)
int led (cid:33) (cid:28)(cid:31)
stiamo dicendo ad Arduino:
(cid:392)Mi serve una scatolina dove conservare un numero.(cid:393)
int significa: numero intero (cid:12)cioè un numero sen(cid:94)a virgola: (cid:20), 1, (cid:22), (cid:28), 1(cid:23), (cid:25)(cid:20)(cid:20)(cid:399)(cid:13)
(cid:53)uindi:', 45, 496);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 7', NULL, 'pulsante (cid:33)(cid:33) è una scatolina che contiene il numero (cid:22)
led (cid:33)(cid:33) è una scatolina che contiene il numero (cid:28)
Perch(cid:675) lo facciamo(cid:35)
Perch(cid:675) invece di scrivere sempre:
pinMode(cid:12)(cid:28), (cid:51)U(cid:56)PU(cid:56)(cid:13)(cid:31)
pinMode(cid:12)(cid:22), INPU(cid:56)(cid:67)PU(cid:48)(cid:48)UP(cid:13)(cid:31)
digital(cid:54)ead(cid:12)(cid:22)(cid:13)(cid:31)
digital(cid:59)rite(cid:12)(cid:28), (cid:44)I(cid:43)(cid:44)(cid:13)(cid:31)
Possiamo scrivere:
pinMode(cid:12)led, (cid:51)U(cid:56)PU(cid:56)(cid:13)(cid:31)
pinMode(cid:12)pulsante, INPU(cid:56)(cid:67)PU(cid:48)(cid:48)UP(cid:13)(cid:31)
digital(cid:54)ead(cid:12)pulsante(cid:13)(cid:31)
digital(cid:59)rite(cid:12)led, (cid:44)I(cid:43)(cid:44)(cid:13)(cid:31)
(cid:39)o(cid:87)ì il pro(cid:75)ra(cid:81)(cid:81)a è pi(cid:636) c(cid:76)iaro, perc(cid:76)(cid:623) le(cid:75)(cid:75)endo capi(cid:87)ci (cid:87)(cid:89)(cid:70)ito:
(cid:85)uale pin è il pulsante
(cid:85)uale pin è il (cid:48)E(cid:40)
E(cid:55)E(cid:54)CI(cid:62)I(cid:51) (cid:385) Cambia un numero, cambia il circuito
(cid:55)posta il filo del (cid:48)E(cid:40) da (cid:40)(cid:28) a (cid:40)9
Cambia solo (cid:85)uesta riga:
int led (cid:33) (cid:28)(cid:31) (cid:33)(cid:33)(cid:34) cambialo con int led (cid:33) 9(cid:31)
(cid:55)e fun(cid:94)iona, hai capito cos’è una variabile:
hai cambiato un solo numero e hai cambiato il comportamento del programma.
Laboratorio di elettronica: Impara e sperimenta 67', 46, 377);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 7', NULL, 'CAPITOLO 7
Esempio super chiaro con frasi
7.7 Perch(cid:623) si scrive (cid:6) == (cid:6)
(due uguali)?
if (cid:12)digital(cid:54)ead(cid:12)pulsante(cid:13) (cid:33)(cid:33) (cid:48)(cid:51)(cid:59)(cid:13) (cid:95) (cid:55)i
legge cosa:
In Arduino (cid:12)e in (cid:85)uasi tutti i linguaggi(cid:13):
(cid:392)(cid:55)E il pulsante è premuto (cid:12)cioè (cid:48)(cid:51)(cid:59)(cid:13),
(cid:6)=(cid:6) (cid:12)uno uguale(cid:13) significa assegna.
allora(cid:399)(cid:393)
Cioè: (cid:392)metti dentro(cid:393).
Errore tipico da evitare (cid:53)uesto è
Esempio:
sbagliato:
int led (cid:33) (cid:28); vuol dire: metti il numero (cid:28)
if (cid:12)digital(cid:54)ead(cid:12)pulsante(cid:13) (cid:33) (cid:48)(cid:51)(cid:59)(cid:13)
nella scatolina chiamata led.
Perch(cid:675) (cid:33) non fa una domanda: prova ad
(cid:392)assegnare(cid:393) (cid:48)(cid:51)(cid:59) (cid:12)e crea
come dire: (cid:392)led prende valore (cid:28)(cid:393).
confusione(cid:47)errori(cid:13).
In Arduino (cid:12)e in (cid:85)uasi tutti i linguaggi(cid:13): (cid:6)(cid:33)(cid:33)
(cid:53)uello giusto è:
(cid:6) (cid:12)due uguali(cid:13) significa confronta if (cid:12)digital(cid:54)ead(cid:12)pulsante(cid:13) (cid:33)(cid:33) (cid:48)(cid:51)(cid:59)(cid:13)
Cioè: (cid:392)è uguale a(cid:399)(cid:35)(cid:393)
(cid:6) (cid:33) (cid:6) e (cid:6) (cid:33)(cid:33) (cid:6) non sono la stessa cosa
Esempio:
di(cid:75)ital(cid:54)ead(p(cid:89)l(cid:87)ante) (cid:33)(cid:33) L(cid:51)(cid:59) (cid:33) significa assegna
(cid:12)metti un valore in una variabile(cid:13)
vuol dire: (cid:392)(cid:53)uello che leggo dal pulsante è
(cid:33)(cid:33) significa confronta (cid:12)sono uguali(cid:35)(cid:13)
uguale a (cid:48)(cid:51)(cid:59)(cid:35)(cid:393)
(cid:40)entro if(cid:12)...(cid:13) si usa (cid:85)uasi sempre (cid:33)(cid:33)
una domanda a cui Arduino risponde con:
perch(cid:675) stiamo facendo una domanda.
si (cid:12)vero(cid:13)
no (cid:12)falso(cid:13)', 47, 487);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 7', NULL, 'E poi, gra(cid:94)ie a (cid:6) if (cid:6), decide cosa fare.
68 Laboratorio di elettronica: Impara e sperimenta
CHE COSA SONO I CONDENSATORI?
7.7 Debug guidato (se non funziona)
(cid:55)e il (cid:48)E(cid:40) non risponde:
o Il (cid:48)E(cid:40) è girato bene(cid:35) (cid:12)gamba lunga verso il pin, corta verso resisten(cid:94)a(cid:19)
(cid:43)N(cid:40)(cid:13)
o (cid:48)a resisten(cid:94)a è collegata davvero in serie(cid:35)
o Il pulsante attraversa la fessura centrale(cid:35)
o Il pulsante è collegato tra (cid:40)(cid:22) e (cid:43)N(cid:40)(cid:35)
o Nel codice:
o pulsante (cid:33)
o led (cid:33)
o INPU(cid:56)(cid:67)PU(cid:48)(cid:48)UP scritto giusti
o confronto con (cid:33)(cid:33) (cid:12)due uguali(cid:13)
7.(cid:28) Mini-progetto: Due LED, un pulsante (Arduino
sceglie)
(cid:51)biettivo
se premi → (cid:48)E(cid:40) verde acceso
se non premi → (cid:48)E(cid:40) rosso acceso
Collegamenti
(cid:48)E(cid:40) verde → (cid:40)(cid:28)
(cid:48)E(cid:40) rosso → (cid:40)9
pulsante → (cid:40)(cid:22) e (cid:43)N(cid:40)
Codice
INPU(cid:56)(cid:67)PU(cid:48)(cid:48)UP scritto giusto
confronto con (cid:33)(cid:33) (cid:12)due uguali(cid:13)
Laboratorio di elettronica: Impara e sperimenta 69', 47, 302);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 7', NULL, 'CAPITOLO 7
programma:
70 Laboratorio di elettronica: Impara e sperimenta
CHE COSA SONO I CONDENSATORI?
Scema di assemblaggio sulla breadbord:
70 Laboratorio di elettronica: Impara e sperimenta
CHE COSA SONO I CONDENSATORI?
(cid:54)esisten(cid:94)a interna che tiene il pin su (cid:44)I(cid:43)(cid:44) (cid:85)uando non
Pull(cid:17)up interno
premi.
N(cid:51)N premuto (cid:33) (cid:44)I(cid:43)(cid:44) (cid:397) P(cid:54)EMU(cid:56)(cid:51) (cid:33) (cid:48)(cid:51)(cid:59) (cid:12)perch(cid:675) va a
(cid:54)egola INPU(cid:56)(cid:67)PU(cid:48)(cid:48)UP
(cid:43)N(cid:40)(cid:13).
(cid:48)egge un pin digitale e restituisce (cid:44)I(cid:43)(cid:44) oppure (cid:48)(cid:51)(cid:59).
digital(cid:54)ead(cid:12)pin(cid:13)
(cid:55)crive su un pin: lo mette (cid:44)I(cid:43)(cid:44) (cid:12)accende(cid:13) o (cid:48)(cid:51)(cid:59) (cid:12)spegne(cid:13).
digital(cid:59)rite(cid:12)pin, (cid:399)(cid:13)
if (cid:392)(cid:55)E(cid:393): controlla una condi(cid:94)ione e decide se fare un’a(cid:94)ione.
else (cid:392)A(cid:48)(cid:56)(cid:54)IMEN(cid:56)I(cid:393): cosa fare (cid:85)uando la condi(cid:94)ione dell’if è falsa.
Condi(cid:94)ione Una domanda vera(cid:19)falsa (cid:12)es. (cid:392)pulsante premuto(cid:35)(cid:393)(cid:13).
int Numero intero: crea una (cid:392)scatolina(cid:393) per conservare un
numero (cid:12)es. pin (cid:22), (cid:28), 9(cid:13).
(cid:58)ariabile Una scatolina con un nome (cid:12)es. pulsante, verde(cid:13) che
contiene un valore.
(cid:33) (cid:12)un uguale(cid:13) Assegna: mette un valore in una variabile (cid:12)es. int led (cid:33) (cid:28)(cid:31)(cid:13).
(cid:33)(cid:33) (cid:12)due uguali(cid:13) Confronta: chiede (cid:392)è uguale a(cid:399)(cid:35)(cid:393) (cid:12)si usa dentro if(cid:13).
70 Laboratorio di elettronica: Impara e sperimenta
NOTE
74 Laboratorio di elettronica: Impara e sperimenta', 49, 464);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 8', NULL, 'CAPITOLO 8
I PIN ANALOGICI: ARDUINO I(cid:51)PARA A
SENTIRE LE (cid:72)UANTIT(cid:19)
(cid:106)Giovani esploratori, nel Capitolo 7 (cid:28)(cid:18)(cid:20) (cid:51)(cid:70)ietti(cid:90)o de(cid:80) capito(cid:80)o
Arduino ha imparato a fare una cosa
da (cid:392)cervello(cid:393):ascoltare e decidere con
In (cid:85)uesto capitolo imparerai:
SE(cid:121) ALLORA(cid:121)
• cos’è un segnale analogico
Per(cid:683) ascoltava solo messaggi molto
semplici: • cosa sono i pin A(cid:20), A1, A(cid:22)(cid:399)
• s(cid:678) (cid:19) no • come usare la fun(cid:94)ione
• acceso (cid:19) spento
• analog(cid:54)ead(cid:12)(cid:13)
• I(cid:43)(cid:44) (cid:19) (cid:48)(cid:51)(cid:59)
• cosa significa leggere un valore
Ma il mondo reale è più ricco.
da (cid:20) a 1(cid:20)(cid:22)(cid:23)
• come trasformare un numero in
(cid:48)a luce non è solo (cid:392)c’è (cid:19) non c’è(cid:393): pu(cid:683)
un’a(cid:94)ione con if
essere poca, media, tanta.
E il volume non è solo (cid:392)muto (cid:19) alto(cid:393): • mini(cid:17)progetti con (cid:48)E(cid:40) controllati
pu(cid:683) crescere piano piano. da una (cid:392)manopola(cid:393)
(cid:51)(cid:75)(cid:75)i (cid:37)rduino impara a sentire (cid:80)e
(cid:85)uantit(cid:614)(cid:18)(cid:124)(cid:18)
Laboratorio di elettronica: Impara e sperimenta 75', 53, 324);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 8', NULL, 'CAPITOLO 8
(cid:28)(cid:18)(cid:21) (cid:40)i(cid:75)ita(cid:80)e (cid:90)s (cid:37)na(cid:80)o(cid:75)ico (cid:12)spie(cid:75)ato E(cid:55)E(cid:54)CI(cid:62)I(cid:51) (cid:28).(cid:22) (cid:385) (cid:56)rova A(cid:20) e segnalo
(cid:70)ene(cid:13)
I pin (cid:40)igitali li abbiamo visti nel Prendi la scheda e cerca il pin A(cid:20).
capitolo precedente, è come una
risposta secca: (cid:28)(cid:18)(cid:23) (cid:45)(cid:80) poten(cid:94)iometro: (cid:80)a manopo(cid:80)a
c(cid:76)e cam(cid:70)ia (cid:90)a(cid:80)ore (cid:12) l(cid:83) a(cid:70)(cid:70)ia(cid:81)(cid:83) gi(cid:615)
• (cid:55)(cid:651) (cid:19) N(cid:51)
(cid:89)(cid:87)at(cid:83) n(cid:73)l (cid:90)(cid:83)l(cid:89)(cid:81)(cid:73) (cid:21) di (cid:41)(cid:48)(cid:37)(cid:38)(cid:13)
• (cid:51)N (cid:19) (cid:51)(cid:42)(cid:42)
• (cid:44)I(cid:43)(cid:44) (cid:19) (cid:48)(cid:51)(cid:59)
Per far capire l’analogico serve
Esempio: qualcosa che cambi “piano piano”.
pulsante premuto(cid:35) s(cid:678)(cid:19)no Il componente perfetto è il
(cid:45)(cid:80) (cid:52)in (cid:37)na(cid:80)o(cid:75)ico potenziometro (una manopola).
(cid:647) come una (cid:85)uantit(cid:666) che pu(cid:683)
cambiare: (cid:44)a (cid:23) piedini:
poco (cid:19) medio (cid:19) tanto
(cid:20)(cid:399) 1(cid:399) (cid:22)(cid:399) (cid:23)(cid:399) fino a tantissimi valori un estremo va a 5V
l’altro estremo va a GND
Esempio:
(cid:85)uanto stai girando una manopola(cid:35) quello in mezzo (centrale) manda un
valore “variabile” ad Arduino
(cid:85)uanta luce c’è(cid:35)
(cid:85)uanta temperatura c’è(cid:35)
Il piedino centrale è il più importante: è
quello che “parla” con A0.
Arduino pu(cid:683) leggere (cid:85)ueste (cid:85)uantit(cid:666)
con i pin analogici.
(cid:41)(cid:55)(cid:41)(cid:54)(cid:39)(cid:45)(cid:62)(cid:45)(cid:51) (cid:28)(cid:18)(cid:23) (cid:361) (cid:39)o(cid:80)(cid:80)e(cid:75)are i(cid:80)', 54, 469);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 8', NULL, '(cid:28)(cid:18)(cid:22) (cid:40)o(cid:90)e sono i pin ana(cid:80)o(cid:75)ici (cid:12)(cid:37)(cid:20)(cid:16) poten(cid:94)iometro (cid:12)passo(cid:17)passo(cid:13)
(cid:37)(cid:21)(cid:16) (cid:375)(cid:13)
Materiale:
Sulla scheda Arduino Nano R4 trovi
Arduino Nano (cid:54)4
dei pin con scritto:
(cid:37)(cid:20)(cid:18)(cid:18)(cid:18)(cid:18)(cid:37)(cid:21)(cid:18)(cid:18)(cid:18)(cid:18)(cid:37)(cid:22)(cid:375) breadboard
1 poten(cid:94)iometro
Questi pin sono speciali perché
(cid:23) cavetti (cid:78)umper
Arduino può usarli come “sensori”:
leggono un numero che cambia.
Oggi useremo (cid:6)A(cid:20)(cid:6) perché è il primo
e più comodo.
76 Laboratorio di elettronica: Impara e sperimenta
CHE COSA SONO I TRANSISTOR?
(cid:52)repariamo (cid:80)a nostra (cid:70)read(cid:70)ord
• Inserisci la nostra (cid:37)rduino (cid:50)ano
(cid:54)(cid:24) sulla breadboard, come
mostrato nell’immagine.
• Alimenta la breadboard
collegando il pin (cid:25)(cid:58) e i(cid:80) pin (cid:43)(cid:50)(cid:40)
della scheda alle rispettive linee di
alimenta(cid:94)ione (cid:12)positivo e
negativo(cid:13) della breadboard.
(cid:52)assa(cid:75)(cid:75)i
• Per facilitare i collegamenti, usa
• Inserisci il poten(cid:94)iometro
due cavetti (cid:12)(cid:78)umper(cid:13) per collegare
nella breadboard (cid:12)i (cid:23) piedini
tra loro le due linee di
in (cid:23) righe diverse(cid:13). mettilo a
alimenta(cid:94)ione opposte della
cavallo della linea centrale
breadboard:
• Collega un piedino esterno a
• (cid:25)(cid:58) (cid:12)linea (cid:15)(cid:13) da un lato → (cid:25)(cid:58) (cid:12)linea
(cid:25)(cid:58) di Arduino.
(cid:15)(cid:13) dall’altro lato
• Collega l’altro piedino esterno
• (cid:43)N(cid:40) (cid:12)linea (cid:431)(cid:13) da un lato → (cid:43)N(cid:40)
a (cid:43)N(cid:40).
(cid:12)linea (cid:431)(cid:13) dall’altro lato
In (cid:85)uesto modo avrai (cid:25)(cid:58) e (cid:43)N(cid:40) • Collega il piedino centrale a
disponibili su entrambi i lati della A(cid:20).
breadboard.', 54, 499);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 8', NULL, '• (cid:40)a (cid:85)uesto momento in poi,
mantieni sempre (cid:85)uesti
collegamenti anche negli eserci(cid:94)i
successivi: è un metodo pratico
per avere la breadboard sempre
alimentata e collegata
correttamente. correttamente
Laboratorio di elettronica: Impara e sperimenta 77', 55, 69);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 8', NULL, 'CAPITOLO 8
(cid:28)(cid:18)(cid:24) (cid:48)a fun(cid:94)ione nuo(cid:90)a: ana(cid:80)o(cid:75)(cid:54)ead(cid:12)(cid:13)
(cid:51)ra Arduino deve (cid:392)sentire(cid:393) la manopola.
(cid:48)a fun(cid:94)ione è: ana(cid:80)o(cid:75)(cid:54)ead(cid:12)(cid:37)(cid:20)(cid:13)
(cid:53)uesta fun(cid:94)ione restituisce un numero:
• (cid:6)(cid:20) (cid:6)(cid:85)uando il segnale è bassissimo (cid:12)verso (cid:43)N(cid:40)(cid:13)
• (cid:6)(cid:21)(cid:20)(cid:22)(cid:23) (cid:6)(cid:85)uando il segnale è altissimo (cid:12)verso (cid:25)(cid:58)(cid:13)
(cid:53)uindi Arduino non riceve (cid:392)s(cid:678)(cid:19)no(cid:393), riceve un numero.
(cid:41)(cid:55)(cid:41)(cid:54)(cid:39)(cid:45)(cid:62)(cid:45)(cid:51) (cid:28)(cid:18)(cid:24) (cid:361) (cid:52)rimo pro(cid:75)ramma: (cid:80)e(cid:75)(cid:75)o un numero e (cid:80)o
sa(cid:80)(cid:90)o in una scato(cid:80)ina (cid:12)int(cid:13)
78 Laboratorio di elettronica: Impara e sperimenta
CHE COSA SONO I TRANSISTOR?
(cid:54)(cid:45)(cid:43)(cid:37) (cid:21): int (cid:90)a(cid:80)ore (cid:33) (cid:20)(cid:31)
(cid:6)int(cid:6)
Come abbiamo gia visto significa: numero intero (cid:12)sen(cid:94)a virgola(cid:13).
(cid:55)erve per creare una (cid:392)scatolina(cid:393) capace di contenere numeri come (cid:20),
1, (cid:22)(cid:25), (cid:25)(cid:20)(cid:20), 1(cid:20)(cid:22)(cid:23)(cid:399) In pratica: sto dicendo ad Arduino: (cid:392)mi serve una
scatola per numeri(cid:393).
(cid:6)(cid:90)a(cid:80)ore(cid:6) : (cid:647) il nome della scatolina. (cid:48)’abbiamo chiamata (cid:392)valore(cid:393) perch(cid:675)
dentro metteremo il valore letto dal pin analogico. Potevi anche
chiamarla numero, lettura, pot, ma (cid:392)valore(cid:393) è chiaro.
(cid:6)(cid:33) (cid:6) (cid:12)un uguale(cid:13) (cid:55)ignifica assegna. (cid:58)uol dire: (cid:392)metti dentro la scatolina
(cid:85)uello che scrivo dopo(cid:393).
(cid:6)(cid:20)(cid:6) (cid:647) il numero che mettiamo dentro all’ini(cid:94)io.Non è obbligatorio per', 56, 498);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 8', NULL, 'for(cid:94)a, ma è utile perch(cid:675): cos(cid:678) la scatolina parte (cid:392)pulita(cid:393)e non contiene
numeri casuali
(cid:55)piega(cid:94)ione logica della riga 1:
(cid:392)Creo una scatolina per numeri chiamata valore e ci metto dentro (cid:20).(cid:393)
(cid:38)(cid:48)(cid:51)(cid:39)(cid:39)(cid:51): (cid:90)oid setup(cid:12)(cid:13) (cid:95) (cid:18)(cid:18)(cid:18) (cid:97)
(cid:6)(cid:90)oid(cid:6) significa (cid:392)vuoto(cid:393)la fun(cid:94)ione non restituisce un risultato: contiene
solo comandi.
(cid:6)setup(cid:6)è la fun(cid:94)ione di prepara(cid:94)ione, Arduino la esegue una sola volta
(cid:85)uando si accende o si resetta.
(cid:55)pie(cid:75)a(cid:94)ione lo(cid:75)ica di setup:
(cid:392)(cid:53)ui preparo le cose prima che Arduino ini(cid:94)i a ripetere il programma.(cid:393)
Laboratorio di elettronica: Impara e sperimenta 79', 57, 217);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 8', NULL, 'CAPITOLO 8
(cid:54)(cid:45)(cid:43)(cid:37) dentro setup: (cid:55)eria(cid:80)(cid:18)(cid:70)e(cid:75)in(cid:12)(cid:29)(cid:26)(cid:20)(cid:20)(cid:13)(cid:31)
(cid:6)(cid:55)eria(cid:80)(cid:6)
(cid:647) il nome di un (cid:392)canale(cid:393) che Arduino usa per parlare con il computer.
Passa attraverso il cavo U(cid:55)(cid:38). (cid:647) come un (cid:91)al(cid:79)ie(cid:17)tal(cid:79)ie:
Arduino parla il PC ascolta nel Monitor (cid:55)eriale
(cid:6)(cid:18)(cid:70)e(cid:75)in(cid:6) : begin significa (cid:392)ini(cid:94)ia(cid:393).(cid:53)uindi: (cid:392)ini(cid:94)ia la comunica(cid:94)ione seriale(cid:393).
(cid:6)(cid:12)(cid:29)(cid:26)(cid:20)(cid:20)(cid:13)(cid:6) (cid:647) la velocit(cid:666) della comunica(cid:94)ione.
96(cid:20)(cid:20) è un valore standard molto usato.
Importantissimo:
se nel codice hai (cid:55)eria(cid:80)(cid:18)(cid:70)e(cid:75)in(cid:12)(cid:29)(cid:26)(cid:20)(cid:20)(cid:13) nel Monitor (cid:55)eriale devi sele(cid:94)ionare 96(cid:20)(cid:20)
baud altrimenti vedrai caratteri strani o niente.
(cid:55)pie(cid:75)a(cid:94)ione lo(cid:75)ica di setup:
(cid:392)Arduino, apri il canale per parlare con il PC a velocit(cid:666) 96(cid:20)(cid:20).(cid:393)
(cid:38)(cid:48)(cid:51)(cid:39)(cid:39)(cid:51): (cid:90)oid (cid:80)oop(cid:12)(cid:13) (cid:95) (cid:18)(cid:18)(cid:18) (cid:97)(cid:31)
(cid:6)(cid:80)oop(cid:6) è la fun(cid:94)ione che Arduino ripete per sempre finisce e ricomincia.
(cid:55)piega(cid:94)ione logica di setup:
(cid:368)(cid:53)(cid:89)(cid:73)(cid:87)ti (cid:71)(cid:83)(cid:81)andi li (cid:86)ip(cid:73)t(cid:83) all(cid:365)in(cid:74)init(cid:83)(cid:18)(cid:369)
(cid:54)(cid:45)(cid:43)(cid:37): (cid:90)a(cid:80)ore (cid:33) ana(cid:80)o(cid:75)(cid:54)ead(cid:12)(cid:37)(cid:20)(cid:13)(cid:31)
(cid:53)ui Arduino (cid:392)sente(cid:393) l’analogico.
(cid:6)(cid:90)a(cid:80)ore(cid:6) la scatolina che abbiamè il pin analogico dove hai collegato il piedino
centrale del poten(cid:94)iometro.o creato prima', 58, 498);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 8', NULL, '(cid:6)(cid:33) (cid:6) assegna: (cid:392)metti dentro valore il risultato di(cid:399)(cid:393)
(cid:6)ana(cid:80)o(cid:75)(cid:54)ead(cid:12)(cid:37)(cid:20)(cid:13)(cid:6) è una fun(cid:94)ione che legge un pin analogico (cid:12)A(cid:20)(cid:13).
(cid:6)(cid:37)(cid:20)(cid:6) è il pin analogico dove hai collegato il piedino centraè il pin analogico
dove hai collegato il piedino centrale del poten(cid:94)iometro.le del poten(cid:94)iometro.
80 Laboratorio di elettronica: Impara e sperimenta
CHE COSA SONO I TRANSISTOR?
Cosa restituisce analogRead?
Uun numero tra:
(cid:6) (cid:20) (cid:6) (cid:12)manopola verso (cid:43)N(cid:40)(cid:13)
(cid:6) 1(cid:20)23 (cid:6) (cid:12)manopola verso (cid:25)(cid:58)(cid:13)
(cid:55)piega(cid:94)ione logica della riga:
(cid:6)(cid:48)eggo la manopola su A(cid:20) e salvo il numero dentro valore.(cid:393)
RIGA: Serial.println(valore)(cid:31)
(cid:51)ra Arduino (cid:392)dice(cid:393) al PC (cid:85)uel numero.
(cid:6) Serial (cid:6) stesso canale di prima (cid:12)Arduino ↔ PC(cid:13)
(cid:6) println (cid:6)
• (cid:392)print(cid:393) (cid:33) scrivi
• (cid:392)ln(cid:393) (cid:33) (cid:392)line(cid:393) → vai a capo
(cid:53)uindi:
(cid:6)(cid:90)alore(cid:6) significa: (cid:392)scrivi (cid:85)uello che c’è dentro la scatolina valore(cid:393).
(cid:55)piega(cid:94)ione logica della riga:
(cid:6)(cid:55)crivo sul Monitor (cid:55)eriale il numero che ho letto.(cid:6)
RIGA: delay(2(cid:20)(cid:20))(cid:31)
(cid:6) delay (cid:6) fai una pausa
(cid:6) (2(cid:20)(cid:20)) (cid:6) (cid:22)(cid:20)(cid:20) millisecondi (cid:33) (cid:20),(cid:22) secondi
perch(cid:675) serve(cid:35)
Perch(cid:675) sen(cid:94)a pausa Arduino stamperebbe migliaia di numeri al secondo e il
monitor scorrerebbe troppo veloce.
(cid:55)piega(cid:94)ione logica della riga:
(cid:392)Aspetto un pochino prima di leggere e stampare di nuovo.(cid:393)
Laboratorio di elettronica: Impara e sperimenta 81
RIGA: delay(2(cid:20)(cid:20))(cid:31)', 58, 491);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 8', NULL, '(cid:6) delay (cid:6) fai una pausa
(cid:6) (2(cid:20)(cid:20)) (cid:6) (cid:22)(cid:20)(cid:20) millisecondi (cid:33) (cid:20),(cid:22) secondi
perch(cid:675) serve(cid:35)
Perch(cid:675) sen(cid:94)a pausa Arduino stamperebbe migliaia di numeri al secondo e il
monitor scorrerebbe troppo veloce.
(cid:55)piega(cid:94)ione logica della riga:
(cid:392)Aspetto un pochino prima di leggere e stampare di nuovo.(cid:393)
Cosa fare sul PC
Carica lo s(cid:79)etch.
Apri (cid:55)trumenti → Monitor (cid:55)eriale.
Imposta in basso a destra 96(cid:20)(cid:20) baud.
Cosa vedi(cid:35) Numeri che cambiano mentre giri la manopola.
82 Laboratorio di elettronica: Impara e sperimenta
CHE COSA SONO I TRANSISTOR?
Laboratorio di elettronica: Impara e sperimenta 83
NOTE
84 Laboratorio di elettronica: Impara e sperimenta', 60, 201);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 9', NULL, 'CAPITOLO 9
COSA SONO I FOTOTRANSISTOR?
Laboratorio di elettronica: Impara e sperimenta 85', 63, 22);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 9', NULL, 'CAPITOLO 9
86 Laboratorio di elettronica: Impara e sperimenta
COSA SONO I FOTOTRANSISTOR?
Laboratorio di elettronica: Impara e sperimenta 87', 64, 35);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 9', NULL, 'CAPITOLO 9
88 Laboratorio di elettronica: Impara e sperimenta
COSA SONO I FOTOTRANSISTOR?
Laboratorio di elettronica: Impara e sperimenta 89', 66, 35);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 9', NULL, 'CAPITOLO 9
90 Laboratorio di elettronica: Impara e sperimenta
COSA SONO I FOTOTRANSISTOR?
Laboratorio di elettronica: Impara e sperimenta 91
92 Laboratorio di elettronica: Impara e sperimenta', 68, 47);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 10', NULL, 'CAPITOLO 10
Laboratorio di elettronica: Impara e sperimenta 93', 71, 15);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 10', NULL, 'CAPITOLO 10
94 Laboratorio di elettronica: Impara e sperimenta
IL MOTORE A CORRENTE CONTINUA
Laboratorio di elettronica: Impara e sperimenta 95', 72, 35);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 10', NULL, 'CAPITOLO 10
96 Laboratorio di elettronica: Impara e sperimenta
IL MOTORE A CORRENTE CONTINUA
Laboratorio di elettronica: Impara e sperimenta 97
NOTE
98 Laboratorio di elettronica: Impara e sperimenta', 74, 49);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 11', NULL, 'CAPITOLO 11
Laboratorio di elettronica: Impara e sperimenta 99', 77, 15);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 11', NULL, 'CAPITOLO 11
100 Laboratorio di elettronica: Impara e sperimenta
I DIODI
Laboratorio di elettronica: Impara e sperimenta 101
NOTE
102 Laboratorio di elettronica: Impara e sperimenta', 78, 45);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 12', NULL, 'CAPITOLO 12
COSTRUIAMO IL ROBOT SEGUI LUCE
Laboratorio di elettronica: Impara e sperimenta 103', 81, 23);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 12', NULL, 'CAPITOLO 12
104 Laboratorio di elettronica: Impara e sperimenta
COSTRUIAMO IL ROBOT SEGUI LUCE
Laboratorio di elettronica: Impara e sperimenta 105', 82, 36);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 12', NULL, 'CAPITOLO 12
106 Laboratorio di elettronica: Impara e sperimenta
COSTRUIAMO IL ROBOT SEGUI LUCE
Laboratorio di elettronica: Impara e sperimenta 107', 84, 36);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 12', NULL, 'CAPITOLO 12
108 Laboratorio di elettronica: Impara e sperimenta
COSTRUIAMO IL ROBOT SEGUI LUCE
Laboratorio di elettronica: Impara e sperimenta 109', 86, 36);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 12', NULL, 'CAPITOLO 12
110 Laboratorio di elettronica: Impara e sperimenta
COSTRUIAMO IL ROBOT SEGUI LUCE
Laboratorio di elettronica: Impara e sperimenta 111', 88, 36);
INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES (3, 'CAPITOLO 12', NULL, 'CAPITOLO 12
112 Laboratorio di elettronica: Impara e sperimenta
COSTRUIAMO IL ROBOT SEGUI LUCE
NOTE
Laboratorio di elettronica: Impara e sperimenta 113
NON È FINITA QUI!
Speriamo davvero che ti sia divertito con questi esperimenti per avvicinarti al mondo
dell’elettronica!
Nei prossimi volumi espanderemo i concetti visti nei primi due volumi, maggiormente
nel dettaglio del funzionamento, utilizzeremo anche altri componenti e soprattutto
inizieremo ad addentrarci nel magico mondo della programmazione utilizzando il
linguaggio Arduino e le sue schede elettroniche!
Grazie per averci seguito in questa prima avventura e speriamo che gradirete
anche le successive!
114 Laboratorio di elettronica: Impara e sperimenta
ELAB', 90, 180);
