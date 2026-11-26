# Review indipendente della proposta anchor 054/073

Revisore A distinto dall’autore ROOT. Ho letto integralmente i tre paragrafi prima e dopo, l’intero contesto delle due lezioni modificate, il diff e il manifest; ho confrontato integralmente i due package proposti con quelli registrati, compresi lunghezze degli array, ID, ogni campo dei record, formule, didascalie, asset incorporati e binding. Nessun finding scientifico residuo nella proposta letta. Questo esito riguarda la proposta e non sostituisce la rilettura dei byte realmente applicati o il loro replay successivo.

La prova riproducibile è `independent-check-a.py`, eseguita con il runtime Python di recupero dalla ROOT. Il risultato effettivo è salvato in `independent-proof-a.json`. Usa il loader del catalogo e il controllo di compatibilità già esistenti; nessun nuovo importatore, pubblicazione, scrittura sui pacchetti registrati o cambiamento dei pin dei verificatori 011/015. I file registrati e i due consumer mantengono gli stessi SHA256 prima e dopo la prova.

## C1-L002, paragrafo 5

La frase del triangolo rettangolo passa all’inizio del paragrafo, ripristinando il prefisso originale «Nel triangolo rettangolo il coseno è cateto». Il contenuto precedente resta presente: vettore non nullo, modulo positivo, componenti con segno, tangente utilizzabile solo con A_x diverso da zero, distinzione dei quadranti e trattamento della direzione verticale. L’angolo orientato θ resta definito nel primo paragrafo; il rapporto dei cateti appartiene al triangolo rettangolo, mentre le componenti con segno descrivono la direzione rispetto agli assi.

Verifica indipendente: (A cosθ)²+(A sinθ)²=A²; per componenti 3 m e 4 m il modulo è 5 m, cosθ=3/5 e sinθ=4/5 nel primo quadrante, senza trigonometria inversa numerica. La modifica non altera nessuna formula. SIM-C1-L002-01 conserva così il proprio ingresso nel paragrafo pertinente alla proiezione di un’asta; ho confrontato ID, skill, anchor e record originale al pin 5d1dc8dc7b601aef959d10d564c75462be74708d.

## C1-L002, paragrafo 15

Il nuovo incipit ripristina «Il prodotto scalare misura quanto un vettore», conservando espressamente il segno della proiezione. Il significato non viene ridotto al modulo della proiezione: A·B=A(B cosα). Il lavoro di una forza rimane un esempio pertinente. La parte sul prodotto vettoriale è invariata: area del parallelogramma, normale al piano per vettori non paralleli, mano destra e prodotto nullo senza direzione propria nel caso parallelo. I paragrafi successivi conservano α fra 0 e π, i due segni per paralleli concordi e discordi e l’angolo non definito con il vettore nullo.

Verifica indipendente per i moduli 3 m e 2 m dell’esperienza originale: prodotto scalare 6, 0, −6 m² per α=0, π/2, π; modulo del vettoriale 0, 6, 0 m². La direzione dipende dall’ordine e dalla mano destra; il segno del prodotto scalare non scompare. SIM-C1-L002-04 torna al paragrafo corretto senza modificare il suo record o le sue formule.

## C2-L007, paragrafo 10

Il prefisso «In un tubo diritto e circolare un» torna all’inizio, seguito da «diverso modello»: resta chiaro il passaggio dal precedente modello fra piastre al tubo. Restano tutte le ipotesi che rendono pertinente il profilo parabolico: tubo orizzontale di raggio R>0, pareti ferme e aderenza, fluido newtoniano incomprimibile con densità e viscosità positive costanti, differenza di pressione motrice, moto laminare, stazionario e pienamente sviluppato, esclusione dell’ingresso e delle estremità, asse lungo il moto e velocità centrale positiva.

Verifica indipendente: v(r)=v_max[1−(r/R)²] dà v(0)=v_max, v(R)=0 e v(R/2)=3v_max/4. La media d’area con peso 2πr dr è v_max/2, senza valutare π. Pertanto i riferimenti dei due ingressi originali danno 8·3/4=6 cm/s e 12·3/4=9 cm/s. Stazionario non significa particelle ferme: una velocità euleriana costante può accompagnare spostamento dei traccianti. La distinzione da un avviamento laminare non stazionario resta nel testo successivo, invariato. Per il contesto precedente fra piastre, 4 mm/s diviso 2 mm dà 2 s⁻¹ e con η=2 Pa·s lo sforzo vale 4 Pa; Reynolds conserva dimensione pura. SIM-C2-L007-02 e SIM-C2-L007-05 hanno lo stesso prefisso originale e si collegano al medesimo paragrafo appropriato, senza cambiare esperimenti o condizioni del profilo.

## Integrità e compatibilità realmente provate

I soli blocchi modificati sono C1-L002[5], C1-L002[15] e C2-L007[10], tutti di tipo testo. C1-L003 è integralmente identica. Ogni altro campo, formula, figura e didascalia dei due package è identico; tutti e cinque gli asset incorporati conservano bytes, ID e SHA256. I binding cambiano soltanto il candidato dei due record modificati: fonte originale e checksum degli asset restano identici e i nuovi candidateSha256 sono stati ricalcolati indipendentemente.

Il catalogo originale contiene 991 record e 181 esperimenti: tutti hanno l’anchor originale. Con le attuali lezioni DRAFT si riproducono esattamente i quattro ingressi mancanti del manifest. Sovrapponendo soltanto in memoria i due package proposti, tutti i 181 ingressi tornano presenti; ciascuno dei quattro segnalati identifica un solo paragrafo. La verifica usa la stessa semantica del consumer reale, `el.textContent.startsWith(topic.anchor)`, e del validatore, `b["text"].startswith(anchor)`: nessun anchor o selettore è stato cambiato per aggirare il problema.

L’esito positivo qui è della review AI indipendente dei tre paragrafi e della compatibilità del catalogo in memoria. Il preflight SQLite di coesistenza consegnato dall’integratore è una prova tecnica distinta e non viene attribuito a questa esecuzione. Prima dei nuovi pin serviranno applicazione dell’autore, confronto dei byte finali e replay canonici: nessun risultato storico viene ritaggato. Zero nuovi ID accreditati; human NOT_RUN e publicationAction NONE.
