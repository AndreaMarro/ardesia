# cric-c2-l009 — dieci problemi Cric distinti

Fonte Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, officina-di-fisica/content/C2.json, SHA7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23. Letti individualmente soltanto enunciati e metadati allowlist, insieme alle lezioni C2-L006–L010 e ai loro prerequisiti reali. Nessuna risposta, opzione, soluzione o figura originale usata per derivare le nuove risposte.

Primarie reciproche prima dei candidati: B sui cinquanta A001–050, commit9dc54dba, SHA34c7a33d1257ffa080cb94d8f36f0ebb753cf03134665b4b440153cc2f3a8237; A sui cinquanta B051–100, commit026127465e30476b3e8bdb874d9bd98520a0b8d2, SHAa51ecd2856370b38a67fd59f09b4dbce23eda319c27e5d379428b9fd67b1dc92. La primaria A è stata ricevuta soltanto come hash/percorso e non aperta durante l’autoria. Modello B per futura review A congelato in e37686eb, SHA02b2341e89122709fcddfb6a48318d3d87ded5385cbbfada9e69edaad05007dc, prima di aprire qualunque candidato A C2.

Sono dieci problemi differenti, non sedici variazioni di una famiglia artificiale. ID, corso, skill, famiglia, difficoltà, prerequisiti, ordine, flag exam e versione individuale originali conservati. Nuova version=baseVersion+1. Procedura manuale esatta, ipotesi fisiche e distrattori scritti per ciascun compito.

Unico assembler/importatore canonico; nessuna seconda ETL. Dipendenza esterna congelata {"commit": "23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5", "path": "officina-di-fisica/tools/corpus_engineering/vector_geometry_authoring.py", "sha256": "0062a1e8b70ca767818105fcf1204e983fe2ef08b06fa379a2d68d26456dc22c"}. Il file helper è copiato byte-esatto per l’esecuzione e non attribuito a questa autoria.

Due assembly effettive identiche e import canonico entro il budget originale60 s: dieci salvati DRAFT, poi zero salvati/dieci invariati in SQLite temporaneo. I991 pubblicati e tutti i live head storici restano byte-invariati. Operazioni reali terminali0/null signal sotto mutex e guardia ≥2 GiB. Il PNG nativo completo è stato aperto e letto insieme all’XML: prova asset-only, non UI prodotto. Nessuna propria review scientifica, approvazione umana o pubblicazione: SCI/UI prodotto/human NOT_RUN, DRAFT.

## C2-Q081 — Tre tratti attraversati dalla stessa portata

Versione 2, base 1; famiglia tre-tubi-in-fila; difficoltà 2.

Modello e passaggi: Ogni volume attraversa tutti e tre i segmenti, quindi Q è comune. Le cadute si sommano: R_eq=2+5+1=8 kPa·s/mL. Moltiplico per 3/2 mL/s e ottengo 12 kPa. L’unità mL/s si cancella con s/mL nella resistenza.

Leggi e calcolo manuale: R_{\rm eq}=(2+5+1)\,\mathrm{kPa\,s/mL};  R_{\rm eq}=8\,\mathrm{kPa\,s/mL};  \Delta p=R_{\rm eq}Q;  \Delta p=12\,\mathrm{kPa}

Risposta d’autore proposta: 12 kPa.

Distrattori e limiti: Otto è il coefficiente della resistenza, non la caduta di pressione. Usare la legge del parallelo assegnerebbe portate diverse a tratti che qui sono uno dopo l’altro. Dividere per Q darebbe unità diverse dalla pressione.

## C2-Q082 — Quattro passaggi alternativi identici

Versione 2, base 1; famiglia quattro-rami-identici; difficoltà 2.

Modello e passaggi: La stessa differenza di pressione spinge ciascun ramo. La portata totale è quattro volte Δp/R, perciò la conduttanza totale è 4/R e la resistenza equivalente R/4=5 kPa·s/mL. Il risultato è minore di 20, come deve essere aggiungendo passaggi paralleli.

Leggi e calcolo manuale: Q_{\rm tot}=4\frac{\Delta p}{R};  \frac1{R_{\rm eq}}=\frac4R;  R_{\rm eq}=\frac{20}{4}\,\mathrm{kPa\,s/mL};  R_{\rm eq}=5\,\mathrm{kPa\,s/mL}

Risposta d’autore proposta: 5 kPa·s/mL.

Distrattori e limiti: 80 kPa·s/mL sommerebbe le resistenze come in serie. Venti ignorerebbe tre rami. Un quarto è il rapporto R_eq/R, non il valore della resistenza nell’unità richiesta.

## C2-Q083 — Chiudere un ramo a pressione imposta

Versione 2, base 1; famiglia un-ramo-si-chiude-a-p-fissata; difficoltà 2.

Modello e passaggi: Il ramo aperto continua ad avere gli stessi estremi di pressione e la stessa resistenza. La sua legge Q_aperto=Δp/R_aperto dà quindi la stessa portata. Diminuisce invece la portata totale, perché il contributo del ramo chiuso scompare. La pompa qui controlla la differenza di pressione, non il totale dei flussi.

Leggi e calcolo manuale: Q_{\rm aperto}=\frac{\Delta p}{R_{\rm aperto}};  \Delta p_B=\Delta p_A;  R_{{\rm aperto},B}=R_{{\rm aperto},A};  Q_{{\rm aperto},B}=Q_{{\rm aperto},A}

Risposta d’autore proposta: Resta invariata.

Distrattori e limiti: Raddoppiare la portata del ramo richiederebbe raddoppiare Δp se R è fissa. Dimezzamento, arresto e inversione non seguono dagli estremi di pressione assegnati. L’effetto sarebbe diverso con portata totale imposta.

## C2-Q084 — Chiudere un ramo a portata imposta

Versione 2, base 1; famiglia il-caso-a-portata-imposta; difficoltà 2.

Modello e passaggi: Inizialmente ciascun ramo porta 4 mL/s e R_eq=R/2. Dopo la chiusura tutti gli 8 mL/s passano per un solo R. A Q totale fissa, Δp=R_eqQ richiede quindi una caduta doppia. Non si può usare la conclusione del caso a pressione imposta: qui la pompa cambia pressione per rispettare il controllo.

Leggi e calcolo manuale: R_{{\rm eq},A}=\frac R2;  R_{{\rm eq},B}=R;  \frac{\Delta p_B}{\Delta p_A}=\frac{R}{R/2};  \frac{\Delta p_B}{\Delta p_A}=2

Risposta d’autore proposta: Raddoppia.

Distrattori e limiti: La caduta non resta uguale perché la resistenza equivalente è cresciuta. Dimezzarla diminuirebbe la portata invece di mantenerla. Quattro confonde il raddoppio della portata nel singolo ramo con una dipendenza quadratica non presente nella legge lineare.

## C2-Q085 — Ridurre una rete mista

Versione 2, base 1; famiglia una-rete-mista; difficoltà 3.

Modello e passaggi: Riduco prima la coppia che condivide i nodi: due resistenze da 6 in parallelo valgono 3 kPa·s/mL. Aggiungo il tratto iniziale in serie, ottenendo R_eq=5 kPa·s/mL. La portata iniziale è la totale: 20/5=4 mL/s. In seguito si divide in due contributi uguali da 2 mL/s.

Leggi e calcolo manuale: R_{\parallel}=3\,\mathrm{kPa\,s/mL};  R_{\rm eq}=(2+3)\,\mathrm{kPa\,s/mL};  Q=\frac{20}{5}\,\mathrm{mL/s};  Q=4\,\mathrm{mL/s}

Risposta d’autore proposta: 4 mL/s.

Distrattori e limiti: 20/14 mL/s tratterebbe tutti i tratti come serie. Dieci mL/s ignorerebbe la coppia finale; 2 mL/s è la portata di ciascun ramo, non quella nel tratto iniziale.

## C2-Q086 — Stessi nodi, percorsi differenti

Versione 2, base 1; famiglia diagrammi-con-la-stessa-coppia-di-nodi; difficoltà 2.

Modello e passaggi: La topologia dipende dai collegamenti, non dalla posizione del disegno. Entrambi i condotti incontrano la stessa pressione in A e la stessa pressione in B: hanno Δp comune e sono in parallelo. Le portate possono essere diverse se le resistenze sono differenti.

Leggi e calcolo manuale: \Delta p_1=p_A-p_B;  \Delta p_2=p_A-p_B;  Q_{\rm tot}=Q_1+Q_2

Risposta d’autore proposta: In parallelo.

Distrattori e limiti: In serie ogni volume attraverserebbe successivamente entrambi i tratti. La disposizione grafica e l’uguaglianza dei raggi o delle resistenze non sono criteri necessari per il parallelo.

## C2-Q087 — La resistenza del ramo incognito

Versione 2, base 1; famiglia il-ramo-incognito; difficoltà 3.

Modello e passaggi: Sottraggo le conduttanze: 1/R₂=1/3−1/4=1/12, nelle unità inverse comuni. Il reciproco dà R₂=12 kPa·s/mL. Il dato R_eq=3 è minore di entrambi i rami, controllo compatibile con un parallelo di resistenze positive.

Leggi e calcolo manuale: \frac1{R_2}=\frac1{R_{\rm eq}}-\frac1{R_1};  \frac1{R_2}=\frac1{12}\,\mathrm{mL/(kPa\,s)};  R_2=12\,\mathrm{kPa\,s/mL}

Risposta d’autore proposta: 12 kPa·s/mL.

Distrattori e limiti: Uno e sette sottraggono o sommano resistenze come in serie. 4/3 e 3/4 non soddisfano la somma dei reciproci richiesta. Verificando 4·12/(4+12) si ritrova esattamente 3.

## C2-Q088 — Il reciproco utile al parallelo

Versione 2, base 1; famiglia il-reciproco-della-resistenza; difficoltà 1.

Modello e passaggi: Poiché Q=Δp/R_h, il rapporto Q/Δp è 1/R_h: la conduttanza idraulica. In parallelo Δp è comune, quindi sommando le portate si sommano anche le conduttanze. In SI la sua unità è m³/(Pa·s).

Leggi e calcolo manuale: G=\frac Q{\Delta p};  G=\frac1{R_h};  G_{\rm tot}=G_1+G_2

Risposta d’autore proposta: Conduttanza idraulica.

Distrattori e limiti: La resistenza è il rapporto inverso. La viscosità è una proprietà del materiale e non include da sola la geometria; densità e potenza hanno altre dimensioni e altre definizioni.

## C2-Q089 — In serie conta la stessa portata

Versione 3, base 2; famiglia due-tratti-diversi-in-serie; difficoltà 2.

Modello e passaggi: In serie la conservazione del volume impone la stessa Q. Dalla relazione Δp_i=R_iQ segue Δp₂/Δp₁=R₂/R₁=2. L’uguaglianza delle portate non implica uguaglianza delle cadute: ciascun tratto richiede pressione in proporzione alla propria resistenza.

Leggi e calcolo manuale: Q_1=Q_2; Q_2=Q;  \Delta p_i=R_iQ;  \frac{\Delta p_2}{\Delta p_1}=\frac{R_2}{R_1};  \frac{\Delta p_2}{\Delta p_1}=2

Risposta d’autore proposta: Il secondo, con caduta doppia.

Distrattori e limiti: Cadute uguali caratterizzano rami paralleli fra gli stessi nodi, non serie. Una caduta minore nel tratto più resistente richiederebbe una portata diversa, esclusa dalla stazionarietà incomprimibile senza rami.

## C2-Q090 — Quanto flusso passa nel ramo stretto

Versione 2, base 1; famiglia due-rami-di-raggio-diverso; difficoltà 3.

Modello e passaggi: A Δp,η,L comuni la portata è proporzionale a r⁴. Se il ramo stretto porta Q₀, quello largo porta 16Q₀. Il totale è 17Q₀ e la frazione del ramo stretto è 1/17. La normalizzazione usa il totale, non soltanto la portata dell’altro ramo.

Leggi e calcolo manuale: \frac{Q_{2r}}{Q_r}=2^4;  Q_{2r}=16Q_r;  Q_{\rm tot}=17Q_r;  \frac{Q_r}{Q_{\rm tot}}=\frac1{17}

Risposta d’autore proposta: 1/17.

Distrattori e limiti: 1/16 confronta i due rami, non il ramo con il totale. 1/5 userebbe la sola area, che cresce di quattro. 1/2 presupporrebbe rami uguali; 16/17 è la frazione del ramo largo.
