# cric-c1-l007 — autoria di dieci problemi distinti

Nuove edizioni degli ID Cric originali, senza produrre varianti Ardesia. Ogni problema è stato letto dal solo enunciato e risolto individualmente; nessuna chiave, opzione, soluzione, hint o figura originale è stata aperta per ricavarne la risposta.

Fonte Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, officina-di-fisica/content/C1.json, SHA 0a79b1212adbef650733d655d1de2d5ffd7af5eb2be2bde50710a0a1721ab0cf. Lezioni C1-L006–L010 effettive lette integralmente, con prerequisiti e contenuto reali. Famiglia, difficoltà, prerequisiti, identità, ordine, corso, skill ed eventuale flag exam sono conservati per ciascun ID. baseVersion è la versione individuale della fonte e version=baseVersion+1.

Primarie reciproche congelate prima dei candidati: B sui cinquanta A001–050 commit a157b41b, SHA 2e0ac86f9b57804387b68ccdcdbde945bed65b26ee5de6449323f25c3540707a; A sui cinquanta B051–100 commit 227d4a08, SHA 1abe1f80465386a32abc613e31dc2d6c8fc41d4a8f24a2e77aea025e2773b3d1. La primaria A è stata ricevuta solo come hash/percorso e non letta durante l’autoria.

Una sola pipeline: assemble_family originale esteso dal Root, non un nuovo importatore. Dipendenza esterna congelata {"commit": "23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5", "path": "officina-di-fisica/tools/corpus_engineering/vector_geometry_authoring.py", "sha256": "0062a1e8b70ca767818105fcf1204e983fe2ef08b06fa379a2d68d26456dc22c"}. Il file è copiato byte-esatto per riprodurre l’assembly locale e non attribuito a questa autoria. Due assembly identiche, importatore canonico con budget originale 60 s, SQLite temporaneo: dieci nuove edizioni DRAFT, poi zero nuove/dieci invariate; tutti i 991 pubblicati e i live head storici restano invariati.

Le tre operazioni effettive sono terminali 0/null signal sotto mutex e guardia ≥2 GiB. Il PNG nativo completo è stato aperto e letto dall’autore insieme all’XML: evidenza asset-only, non UI del prodotto. Nessuna review scientifica propria o approvazione umana; tutto DRAFT, SCI/UI prodotto/human NOT_RUN.

## C1-Q061 — La componente che trasferisce energia

Versione 2, base 1; famiglia forza-obliqua-e-lavoro; difficoltà 2.

Scelta del modello e procedura: Il lavoro dipende dalla componente della forza lungo lo spostamento. La proiezione vale 16 cos60°=8 N, concorde al moto; moltiplico per 5 m e ottengo +40 J. La componente perpendicolare non contribuisce al prodotto scalare, anche se il modulo della forza è maggiore di 8 N.

Passaggi manuali: W=Fd\cos\alpha;  W=16\cdot5\cdot\frac12\,\mathrm J;  W=40\,\mathrm J

Risposta proposta: 40 J.

Confutazioni proposte: 80 J omette il coseno; −40 J attribuirebbe un angolo ottuso o il verso opposto. Otto newton è la componente parallela, non il lavoro: manca ancora lo spostamento.

## C1-Q062 — Una tensione che cambia la direzione

Versione 2, base 1; famiglia traiettoria-circolare-e-lavoro; difficoltà 2.

Scelta del modello e procedura: In ogni punto la tensione è radiale e la velocità tangente al cerchio. Il piccolo spostamento lungo la traiettoria è perpendicolare alla forza, quindi ogni contributo T·dr è nullo e lo è anche la loro somma. Una forza può così cambiare la direzione della velocità senza cambiare l’energia cinetica.

Passaggi manuali: \vec T\perp d\vec r;  dW=\vec T\cdot d\vec r;  dW=0;  W_T=0

Risposta proposta: La tensione è perpendicolare allo spostamento istantaneo.

Confutazioni proposte: La tensione non deve essere nulla: fornisce l’accelerazione centripeta. La pallina cambia posizione e il solo modulo costante di una forza non basta a rendere nullo il lavoro. Se fosse parallela alla velocità, il prodotto scalare non sarebbe nullo.

## C1-Q063 — Il freno compie lavoro resistente

Versione 2, base 1; famiglia un-freno-sottrae-energia; difficoltà 2.

Scelta del modello e procedura: La forza resistente è opposta allo spostamento locale del punto su cui agisce. Ogni contributo ha segno negativo; con modulo costante basta moltiplicare −8 N per i 6 m percorsi. Il lavoro è −48 J: riguarda il trasferimento dovuto al freno, non una misura positiva della distanza.

Passaggi manuali: \cos180^\circ=-1;  W=-Fs;  W=-8\cdot6\,\mathrm J;  W=-48\,\mathrm J

Risposta proposta: -48 J.

Confutazioni proposte: +48 J conserverebbe soltanto il modulo e perderebbe il verso resistente. Zero confonderebbe questa forza tangenziale con una forza centripeta; 4/3 o 3/4 derivano da divisioni fra i dati e non hanno la dimensione del lavoro.

## C1-Q064 — Un’area trapezoidale

Versione 3, base 2; famiglia area-sotto-una-forza-variabile; difficoltà 2.

Scelta del modello e procedura: La forza varia, quindi non uso soltanto uno dei due estremi. Nel grafico forza–posizione il lavoro è l’area del trapezio: la forza media spaziale è (2+10)/2=6 N. Moltiplico per 0,40=2/5 m e ottengo 12/5 J. Il fattore un mezzo deriva dalla variazione lineare, non da una formula valida per qualunque profilo.

Passaggi manuali: F_{\rm media\ spaziale}=\frac{2+10}{2}\,\mathrm N;  F_{\rm media\ spaziale}=6\,\mathrm N;  W=6\cdot\frac25\,\mathrm J;  W=\frac{12}{5}\,\mathrm J

Risposta proposta: 12/5 J.

Confutazioni proposte: 4 J usa soltanto la forza finale e 4/5 J quella iniziale. 16/5 J considera la sola variazione di forza senza la corretta area; 12 J somma i valori numerici estremi senza la distanza e la media.

## C1-Q065 — Aumento di energia e valore finale

Versione 2, base 1; famiglia doppia-velocita-e-stessa-massa; difficoltà 2.

Scelta del modello e procedura: Nell’energia cinetica la rapidità è elevata al quadrato: raddoppiarla porta K_f a quattro volte K_i. La domanda chiede però l’aumento, non il nuovo valore. Sottraggo K_i dal valore finale 4K_i e ottengo ΔK=3K_i, cioè un aumento del 300% del valore iniziale.

Passaggi manuali: K_i=\frac12mv_i^2;  K_f=\frac12m(2v_i)^2;  K_f=4K_i;  \Delta K=K_f-K_i;  \Delta K=3K_i

Risposta proposta: Di 3 K_i; il valore finale è 4 K_i.

Confutazioni proposte: Quattro K_i è il valore finale, non l’aumento. Un aumento di K_i tratterebbe la dipendenza dalla rapidità come lineare; zero ignorerebbe il raddoppio e K_i/2 non segue dal quadrato.

## C1-Q066 — I lavori si sommano con il segno

Versione 2, base 1; famiglia due-trazioni-in-competizione; difficoltà 2.

Scelta del modello e procedura: Il teorema dell’energia cinetica usa la somma algebrica dei lavori di tutte le forze. Il lavoro totale è 18−6=12 J, quindi l’energia cinetica cresce di 12 J. Al valore iniziale 5 J aggiungo questa variazione: K_f=17 J. Il lavoro resistente non si somma come modulo positivo.

Passaggi manuali: W_{\rm tot}=18\,\mathrm J-6\,\mathrm J;  W_{\rm tot}=12\,\mathrm J;  K_f=K_i+W_{\rm tot};  K_f=5\,\mathrm J+12\,\mathrm J;  K_f=17\,\mathrm J

Risposta proposta: 17 J.

Confutazioni proposte: 12 J è la variazione, non l’energia finale. 29 J sommerebbe i moduli dei due lavori; 23 J ignorerebbe il contributo resistente. Cinque joule presupporrebbe un lavoro totale nullo, che qui non c’è.

## C1-Q067 — La potenza in quell’istante

Versione 3, base 2; famiglia potenza-istantanea-dalla-trazione; difficoltà 2.

Scelta del modello e procedura: La potenza istantanea di una forza è il prodotto scalare fra forza e velocità del punto di applicazione. Qui i vettori sono concordi e il coseno vale uno: 25·0,80=25·4/5=20 W. Non occorre conoscere un intervallo di tempo o lo spostamento totale per trovare questo valore istantaneo.

Passaggi manuali: P=\vec F\cdot\vec v;  P=Fv;  P=25\cdot\frac45\,\mathrm W;  P=20\,\mathrm W

Risposta proposta: 20 W.

Confutazioni proposte: 125/4 dividerebbe la forza per la rapidità, con dimensione diversa dalla potenza. 25 copia una forza, 4/5 copia una rapidità e −20 W darebbe il verso resistente anziché quello concorde dichiarato.

## C1-Q068 — Dare un nome a N·m nel lavoro

Versione 2, base 1; famiglia unita-del-trasferimento-energetico; difficoltà 1.

Scelta del modello e procedura: Il lavoro trasferisce energia e si misura in joule. Una forza di un newton che agisce concordemente per un metro compie un joule: 1 J=1 N·m. L’equivalenza dimensionale non elimina la distinzione fisica fra lavoro e momento di una forza, per il quale si mantiene la scrittura N·m.

Passaggi manuali: 1\,\mathrm J=1\,\mathrm{N\,m};  1\,\mathrm J=1\,\mathrm{kg\,m^2/s^2}

Risposta proposta: joule.

Confutazioni proposte: Il watt è un joule al secondo, quindi misura potenza. Il pascal misura pressione, il newton forza e il coulomb carica elettrica: non sono nomi dell’unità di lavoro.

## C1-Q069 — Stessa energia, durata più breve

Versione 2, base 1; famiglia stesso-lavoro-tempi-differenti; difficoltà 2.

Scelta del modello e procedura: Le potenze medie sono W/t_A e W/t_B. Nel rapporto si cancella la stessa energia: rimane t_B/t_A. Poiché t_A=t_B/3, il rapporto vale tre. Il confronto riguarda le medie sull’intero trasferimento e non impone una legge per le potenze istantanee.

Passaggi manuali: \frac{P_A}{P_B}=\frac{W/t_A}{W/t_B};  \frac{P_A}{P_B}=\frac{t_B}{t_A};  t_A=\frac{t_B}{3};  \frac{P_A}{P_B}=3

Risposta proposta: 3 1.

Confutazioni proposte: Un terzo usa il rapporto delle durate nel verso diretto anziché inverso. Uno considera soltanto l’energia uguale e nove quadra un fattore che nella durata compare una sola volta. Il risultato è puro, non una potenza in watt.

## C1-Q070 — La distanza fino al primo arresto

Versione 2, base 1; famiglia distanza-minima-per-arrestarsi; difficoltà 3.

Scelta del modello e procedura: L’energia cinetica iniziale è (1/2)·4·3²=18 J. All’arresto K_f=0; il lavoro resistente vale −6s e deve essere −18 J. Ricavo s=18/6=3 m. La distanza è positiva benché il lavoro sia negativo, e il bilancio termina al primo arresto.

Passaggi manuali: K_i=\frac12\cdot4\cdot3^2\,\mathrm J;  K_i=18\,\mathrm J;  -Fs=-K_i;  s=\frac{18\,\mathrm J}{6\,\mathrm N};  s=3\,\mathrm m

Risposta proposta: 3 m.

Confutazioni proposte: Sei metri ometterebbe il fattore un mezzo nell’energia iniziale. Meno tre confonderebbe il segno del lavoro con quello della distanza; diciotto è il valore numerico dell’energia, da dividere ancora per la forza.

## Rilettura distinta e followup autore

Correzioni puntuali richieste dal revisore A: tassonomia del diario errori, ipotesi meccaniche, distinzione massa/peso e unità della controprova. Le chiavi e tutte le formule restano identiche ai byte archiviati. SVG e precedente native asset-only sono byte-identici e restano prove della sola figura. Cinque nuovi doppi assembly e import canonici reali, ciascuno 10→0/10, con tutti i 991 pubblicati invariati. SCI propria, UI prodotto e human NOT_RUN.
