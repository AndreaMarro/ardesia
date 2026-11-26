# cric-c1-l009 — autoria di dieci problemi distinti

Nuove edizioni degli ID Cric originali, senza produrre varianti Ardesia. Ogni problema è stato letto dal solo enunciato e risolto individualmente; nessuna chiave, opzione, soluzione, hint o figura originale è stata aperta per ricavarne la risposta.

Fonte Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, officina-di-fisica/content/C1.json, SHA 0a79b1212adbef650733d655d1de2d5ffd7af5eb2be2bde50710a0a1721ab0cf. Lezioni C1-L006–L010 effettive lette integralmente, con prerequisiti e contenuto reali. Famiglia, difficoltà, prerequisiti, identità, ordine, corso, skill ed eventuale flag exam sono conservati per ciascun ID. baseVersion è la versione individuale della fonte e version=baseVersion+1.

Primarie reciproche congelate prima dei candidati: B sui cinquanta A001–050 commit a157b41b, SHA 2e0ac86f9b57804387b68ccdcdbde945bed65b26ee5de6449323f25c3540707a; A sui cinquanta B051–100 commit 227d4a08, SHA 1abe1f80465386a32abc613e31dc2d6c8fc41d4a8f24a2e77aea025e2773b3d1. La primaria A è stata ricevuta solo come hash/percorso e non letta durante l’autoria.

Una sola pipeline: assemble_family originale esteso dal Root, non un nuovo importatore. Dipendenza esterna congelata {"commit": "23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5", "path": "officina-di-fisica/tools/corpus_engineering/vector_geometry_authoring.py", "sha256": "0062a1e8b70ca767818105fcf1204e983fe2ef08b06fa379a2d68d26456dc22c"}. Il file è copiato byte-esatto per riprodurre l’assembly locale e non attribuito a questa autoria. Due assembly identiche, importatore canonico con budget originale 60 s, SQLite temporaneo: dieci nuove edizioni DRAFT, poi zero nuove/dieci invariate; tutti i 991 pubblicati e i live head storici restano invariati.

Le tre operazioni effettive sono terminali 0/null signal sotto mutex e guardia ≥2 GiB. Il PNG nativo completo è stato aperto e letto dall’autore insieme all’XML: evidenza asset-only, non UI del prodotto. Nessuna review scientifica propria o approvazione umana; tutto DRAFT, SCI/UI prodotto/human NOT_RUN.

## C1-Q081 — Il rimbalzo cambia anche il segno

Versione 2, base 1; famiglia un-rimbalzo-lungo-un-asse; difficoltà 2.

Scelta del modello e procedura: L’impulso è la variazione della quantità di moto, non la variazione del solo modulo della velocità. Sottraggo v_i da v_f: −3−4=−7 m/s. Moltiplicando per 1/10 kg ottengo −7/10 kg·m/s, equivalente a −7/10 N·s. Il segno indica un impulso verso x negativo, coerente con il rimbalzo.

Passaggi manuali: J_x=m(v_f-v_i);  J_x=\frac1{10}(-3-4)\,\mathrm{kg\,m/s};  J_x=-\frac7{10}\,\mathrm{N\,s}

Risposta proposta: −7/10 N·s.

Confutazioni proposte: +7/10 perde il verso dell’impulso. +1/10 confronta i moduli 4 e 3 invece delle velocità orientate; −3/10 è soltanto la quantità di moto finale. −7 N confonde una differenza di velocità con una forza e manca la durata dell’urto.

## C1-Q082 — Lo stesso arresto dura il doppio

Versione 2, base 1; famiglia stessa-variazione-contatto-piu-lungo; difficoltà 2.

Scelta del modello e procedura: Nei due arresti la quantità di moto cambia della stessa quantità: il carrello passa dalla stessa velocità a zero. L’impulso è dunque uguale, mentre la forza media vale impulso diviso durata. Raddoppiare la durata dimezza il suo modulo. Questo confronto non determina il picco della forza né l’intera forma del suo andamento.

Passaggi manuali: |\overline F|=\frac{|\Delta p|}{\Delta t};  \Delta t_B=2\Delta t_A;  \frac{|\overline F_B|}{|\overline F_A|}=\frac12

Risposta proposta: Si dimezza.

Confutazioni proposte: Raddoppiare seguirebbe la durata nel verso sbagliato. Uguale ignorerebbe il tempo diverso; un quarto ne userebbe il quadrato. Zero non potrebbe fornire l’impulso necessario all’arresto.

## C1-Q083 — Una molla interna separa due pattini

Versione 3, base 2; famiglia spinta-reciproca-su-una-guida; difficoltà 2.

Scelta del modello e procedura: Per il sistema dei due pattini e della molla le spinte interne si compensano e la quantità di moto orizzontale totale resta zero. Il primo pattino ha +12 kg·m/s; il secondo deve averne −12. Dividendo per 6 kg ottengo v_2=−2 m/s. Le velocità non hanno uguale modulo perché le masse sono diverse.

Passaggi manuali: p_{x,i}=0;  m_1v_1+m_2v_2=0;  p_{x,2}=-12\,\mathrm{kg\,m/s};  v_2=p_{x,2}/m_2;  v_2=-2\,\mathrm{m/s}

Risposta proposta: -2 m/s.

Confutazioni proposte: +2 m/s darebbe quantità di moto totale positiva, non zero. −3 m/s imporrebbe uguali velocità invece di uguali moduli delle quantità di moto. Zero ignorerebbe la spinta della molla sul secondo pattino.

## C1-Q084 — Una cattura conserva solo la componente utile

Versione 2, base 1; famiglia catturare-un-piccolo-peso; difficoltà 3.

Scelta del modello e procedura: Prima dell’urto il corpo in caduta non porta quantità di moto orizzontale; il vassoio ne porta 1,5·2=3 kg·m/s. Dopo, la massa comune è 2 kg: la velocità è 3/2 m/s. Si conserva la componente orizzontale del sistema, non necessariamente quella verticale, perché la guida può esercitare un impulso verticale. La cattura non richiede conservazione dell’energia cinetica.

Passaggi manuali: p_{x,i}=\frac32\cdot2\,\mathrm{kg\,m/s};  p_{x,i}=3\,\mathrm{kg\,m/s};  M=2\,\mathrm{kg};  v_f=\frac32\,\mathrm{m/s}

Risposta proposta: 3/2 m/s.

Confutazioni proposte: Due m/s ignorerebbe la massa catturata. Tre copia la quantità di moto come velocità; un mezzo e zero non ricostruiscono i 3 kg·m/s iniziali. Conservare tutta l’energia cinetica imporrebbe una condizione non valida per questa cattura.

## C1-Q085 — Stessa quantità di moto, masse diverse

Versione 3, base 2; famiglia energia-di-due-quantita-di-moto-uguali; difficoltà 2.

Scelta del modello e procedura: Elimino la rapidità usando p=mv: K=(1/2)m(p/m)²=p²/(2m). A p fissato l’energia è inversamente proporzionale alla massa: il corpo più leggero deve muoversi più rapidamente e ha più energia cinetica. Il valore non dipende dal verso della velocità, ma il vincolo p>0 evita il caso in cui entrambe le energie sarebbero zero.

Passaggi manuali: v=\frac pm;  K=\frac{p^2}{2m};  p>0

Risposta proposta: Quello di massa minore.

Confutazioni proposte: Massa maggiore darebbe energia maggiore a rapidità uguale, che è un altro confronto. Energie uguali non seguono da p uguale quando cambia m. Il segno e le direzioni non entrano nel quadrato del modulo.

## C1-Q086 — Il nome di una conservazione in più

Versione 2, base 1; famiglia urto-con-energia-cinetica-conservata; difficoltà 1.

Scelta del modello e procedura: La conservazione dell’energia cinetica totale fra prima e dopo definisce l’urto elastico. L’isolamento garantisce anche la conservazione della quantità di moto del sistema. Le forze interne durante il contatto possono cambiare entrambe le velocità e immagazzinare energia temporaneamente, purché il bilancio cinetico finale torni uguale a quello iniziale.

Passaggi manuali: K_{\rm tot,f}=K_{\rm tot,i};  \vec p_{\rm tot,f}=\vec p_{\rm tot,i}

Risposta proposta: Elastico.

Confutazioni proposte: Completamente anelastico implica invece velocità finale comune e in generale riduzione dell’energia cinetica. Forze di contatto possono esserci eccome; nessuna delle due conservazioni impone che ogni singolo corpo mantenga la velocità iniziale.

## C1-Q087 — Un impulso negativo non annulla sempre il moto

Versione 2, base 1; famiglia una-forza-media-negativa; difficoltà 2.

Scelta del modello e procedura: L’impulso è −3·0,60=−1,8 N·s. Lo sommo alla quantità di moto iniziale: 2,5−1,8=0,7 kg·m/s, ancora positiva. Il corpo ha perso quantità di moto positiva ma i dati non ne impongono l’inversione: il segno della forza media da solo non coincide con il segno della velocità finale.

Passaggi manuali: J_x=-3\cdot\frac35\,\mathrm{N\,s};  J_x=-\frac95\,\mathrm{N\,s};  p_{x,f}=\left(\frac52-\frac95\right)\,\mathrm{kg\,m/s};  p_{x,f}=\frac7{10}\,\mathrm{kg\,m/s}

Risposta proposta: +7/10 kg·m/s.

Confutazioni proposte: −7/10 attribuisce al risultato il segno della forza senza completare il bilancio. −9/5 è soltanto l’impulso; +43/10 somma il suo modulo nel verso sbagliato. Zero richiederebbe un impulso esattamente −2,5 N·s.

## C1-Q088 — Quale sistema si isola nell’urto?

Versione 2, base 1; famiglia scegliere-il-sistema-nellurto; difficoltà 2.

Scelta del modello e procedura: La forza che una biglia esercita sull’altra è esterna al sistema formato da una sola biglia, ma interna al sistema delle due. Le due forze interne sono opposte e la loro somma non cambia la quantità di moto totale. Peso e normale sono verticali, quindi l’ipotesi d’isolamento orizzontale è coerente col tavolo liscio.

Passaggi manuali: \vec F_{12}+\vec F_{21}=0;  \Delta\vec p_{{\rm tot},\parallel}=0

Risposta proposta: Il sistema formato da entrambe le biglie.

Confutazioni proposte: Ogni biglia può cambiare la propria quantità di moto: è proprio l’effetto dell’urto. La conservazione del totale non sceglie un corpo in base alla massa o alla quiete iniziale, e le forze interne non la impediscono.

## C1-Q089 — Cambiare direzione richiede un impulso vettoriale

Versione 2, base 1; famiglia forza-media-da-un-cambio-di-direzione; difficoltà 3.

Scelta del modello e procedura: Sottraggo i vettori velocità, non le rapidità: Δv=(−2,+2) m/s. La quantità di moto cambia di (−1,+1) kg·m/s e la forza media è (−2,+2) N. Il modulo è la radice della somma dei quadrati delle componenti: √8=2√2 N. Le rapidità iniziale e finale uguali non annullano il cambiamento di direzione.

Passaggi manuali: \Delta\vec v=(-2,2)\,\mathrm{m/s};  \Delta\vec p=(-1,1)\,\mathrm{kg\,m/s};  \overline{\vec F}=(-2,2)\,\mathrm N;  |\overline{\vec F}|=2\sqrt2\,\mathrm N

Risposta proposta: 2√2 N.

Confutazioni proposte: Due newton considera una sola componente, √2 N copia soltanto il valore numerico del modulo della variazione di quantità di moto, espresso in kg·m/s, senza dividerlo per 0,5 s. Quattro somma i moduli delle componenti invece di applicare Pitagora; zero confronta soltanto le rapidità.

## C1-Q090 — La pendenza di p_x nel tempo

Versione 2, base 1; famiglia trovare-la-forza-in-un-grafico-pt; difficoltà 2.

Scelta del modello e procedura: La seconda legge nella forma generale è F_x=dp_x/dt. Una retta crescente ha pendenza costante positiva, quindi la risultante lungo x è costante positiva. Su un intervallo, la variazione Δp_x è invece l’impulso: non è la stessa quantità della pendenza, che divide ancora per la durata.

Passaggi manuali: F_x=\frac{dp_x}{dt};  F_x=\frac{\Delta p_x}{\Delta t};  [F_x]=\mathrm N

Risposta proposta: La componente x della risultante, costante e positiva.

Confutazioni proposte: Posizione e velocità sono grandezze diverse da una forza; per ricavare v da p occorrerebbe la massa, non la sola pendenza. L’impulso ha unità N·s e l’energia J: la pendenza qui ha unità N.

## Rilettura distinta e followup autore

Correzioni puntuali richieste dal revisore A: tassonomia del diario errori, ipotesi meccaniche, distinzione massa/peso e unità della controprova. Le chiavi e tutte le formule restano identiche ai byte archiviati. Il nuovo SVG L009 sposta soltanto le due frecce sotto i pattini: stesso asse, lunghezze 100 e 150, verso e scala; nuovo native completo realmente terminale 0, aperto e letto per intero. Cinque nuovi doppi assembly e import canonici reali, ciascuno 10→0/10, con tutti i 991 pubblicati invariati. SCI propria, UI prodotto e human NOT_RUN.
