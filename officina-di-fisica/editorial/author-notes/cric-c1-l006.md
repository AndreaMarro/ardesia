# cric-c1-l006 — autoria di dieci problemi distinti

Nuove edizioni degli ID Cric originali, senza produrre varianti Ardesia. Ogni problema è stato letto dal solo enunciato e risolto individualmente; nessuna chiave, opzione, soluzione, hint o figura originale è stata aperta per ricavarne la risposta.

Fonte Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, officina-di-fisica/content/C1.json, SHA 0a79b1212adbef650733d655d1de2d5ffd7af5eb2be2bde50710a0a1721ab0cf. Lezioni C1-L006–L010 effettive lette integralmente, con prerequisiti e contenuto reali. Famiglia, difficoltà, prerequisiti, identità, ordine, corso, skill ed eventuale flag exam sono conservati per ciascun ID. baseVersion è la versione individuale della fonte e version=baseVersion+1.

Primarie reciproche congelate prima dei candidati: B sui cinquanta A001–050 commit a157b41b, SHA 2e0ac86f9b57804387b68ccdcdbde945bed65b26ee5de6449323f25c3540707a; A sui cinquanta B051–100 commit 227d4a08, SHA 1abe1f80465386a32abc613e31dc2d6c8fc41d4a8f24a2e77aea025e2773b3d1. La primaria A è stata ricevuta solo come hash/percorso e non letta durante l’autoria.

Una sola pipeline: assemble_family originale esteso dal Root, non un nuovo importatore. Dipendenza esterna congelata {"commit": "23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5", "path": "officina-di-fisica/tools/corpus_engineering/vector_geometry_authoring.py", "sha256": "0062a1e8b70ca767818105fcf1204e983fe2ef08b06fa379a2d68d26456dc22c"}. Il file è copiato byte-esatto per riprodurre l’assembly locale e non attribuito a questa autoria. Due assembly identiche, importatore canonico con budget originale 60 s, SQLite temporaneo: dieci nuove edizioni DRAFT, poi zero nuove/dieci invariate; tutti i 991 pubblicati e i live head storici restano invariati.

Le tre operazioni effettive sono terminali 0/null signal sotto mutex e guardia ≥2 GiB. Il PNG nativo completo è stato aperto e letto dall’autore insieme all’XML: evidenza asset-only, non UI del prodotto. Nessuna review scientifica propria o approvazione umana; tutto DRAFT, SCI/UI prodotto/human NOT_RUN.

## C1-Q051 — La soglia è il massimo statico

Versione 3, base 2; famiglia soglia-di-scorrimento; difficoltà 2.

Scelta del modello e procedura: Finché la scatola resta ferma, l’attrito si adatta alla trazione necessaria all’equilibrio. Soltanto alla soglia il suo modulo raggiunge μ_sN: qui è 18 N. Divido la soglia per la normale, 18/60=3/10. Il coefficiente non ha unità perché è un rapporto fra forze.

Passaggi manuali: |f_s|\le\mu_sN;  f_{s,\max}=18\,\mathrm N;  \mu_s=\frac{18\,\mathrm N}{60\,\mathrm N};  \mu_s=\frac3{10}

Risposta proposta: 3/10.

Confutazioni proposte: 10/3 inverte il rapporto; 18 e 60 copiano i valori numerici di due forze. Zero escluderebbe la forza statica osservata. Prima della soglia, imporre sempre f_s=μ_sN sovrastimerebbe l’attrito richiesto.

## C1-Q052 — Una decelerazione durante lo scorrimento

Versione 2, base 1; famiglia frenata-per-attrito-radente; difficoltà 2.

Scelta del modello e procedura: La normale equilibra il peso, N=mg. L’attrito dinamico ha modulo μ_dmg e si oppone alla velocità relativa: dividendo la seconda legge per m, il modulo dell’accelerazione è μ_dg. Per calcolarlo a mano scrivo 9,8=49/5 e moltiplico per 1/5: 49/25 m/s², equivalente a 1,96 m/s². La legge vale fino al primo arresto, senza prolungare automaticamente il verso dell’attrito oltre quel momento.

Passaggi manuali: N=mg;  |f_d|=\mu_dmg;  |a|=\mu_dg;  |a|=\frac15\cdot\frac{49}{5}\,\mathrm{m/s^2};  |a|=\frac{49}{25}\,\mathrm{m/s^2}

Risposta proposta: 49/25 m/s².

Confutazioni proposte: 49/5 copia g senza il coefficiente; 1/5 copia il coefficiente puro come se fosse un’accelerazione. 25/49 inverte il risultato numerico e zero ignorerebbe l’attrito già attivo. Il segno dell’accelerazione dipende dall’asse; il modulo richiesto resta positivo.

## C1-Q053 — L’attrito può accelerare un pacco

Versione 2, base 1; famiglia un-nastro-trascina-un-pacco; difficoltà 3.

Scelta del modello e procedura: Senza una forza orizzontale il pacco conserverebbe la velocità precedente e resterebbe indietro rispetto al nastro accelerato. Il contatto deve quindi fornirgli un’accelerazione verso destra. Poiché non c’è scorrimento relativo, si tratta di attrito statico: il suo verso contrasta la tendenza a slittare rispetto al nastro, non il moto rispetto al pavimento.

Passaggi manuali: a_x>0;  f_{s,x}=ma_x>0;  |f_s|\le\mu_sN

Risposta proposta: Verso destra, ed è attrito statico.

Confutazioni proposte: Verso sinistra confonde il moto del pacco nel laboratorio con lo scorrimento relativo. Forza nulla non potrebbe accelerarlo; dinamico richiederebbe slittamento. Peso e normale sono verticali e non sostituiscono la forza orizzontale richiesta.

## C1-Q054 — Massa e distanza si compensano

Versione 2, base 1; famiglia confronto-fra-masse-gravitazionali; difficoltà 2.

Scelta del modello e procedura: La massa modificata compare una sola volta al numeratore; la distanza compare al quadrato nel denominatore. Il fattore quattro della massa è quindi diviso per il fattore quattro della distanza al quadrato. La forza rimane attrattiva e con lo stesso modulo, anche se la geometria della configurazione cambia.

Passaggi manuali: F=G\frac{m_1m_2}{r^2};  \frac{F_B}{F_A}=\frac4{2^2};  \frac{F_B}{F_A}=1

Risposta proposta: Resta uguale.

Confutazioni proposte: Quattro considera soltanto la massa; un quarto soltanto la distanza. Due tratta la distanza come un fattore lineare, mentre un mezzo non combina i due cambiamenti nella legge assegnata. Non si sommano i fattori di scala.

## C1-Q055 — La quota non è la distanza dal centro

Versione 2, base 1; famiglia altezza-pari-al-raggio-planetario; difficoltà 2.

Scelta del modello e procedura: La formula esterna g=GM/r² usa la distanza r dal centro del pianeta. Sulla superficie r=R; alla quota richiesta r=R+R=2R. Il campo diventa perciò un quarto di quello superficiale: otto diviso quattro dà 2 m/s². Non si usa la quota da sola come raggio gravitazionale.

Passaggi manuali: r_A=R;  r_B=2R;  g_B=g_A\left(\frac{R}{2R}\right)^2;  g_B=\frac84\,\mathrm{m/s^2};  g_B=2\,\mathrm{m/s^2}

Risposta proposta: 2 m/s².

Confutazioni proposte: Quattro m/s² dimezzerebbe il campo anziché dividerlo per il quadrato. Otto confonderebbe la quota con la distanza dal centro; zero richiederebbe il limite di distanza infinita nel modello. La massa del pianeta non cambia fra le due posizioni.

## C1-Q056 — Separare lunghezza e deformazione

Versione 3, base 2; famiglia lunghezza-di-riposo-ignota; difficoltà 2.

Scelta del modello e procedura: La trazione equilibrata misura il modulo del richiamo elastico, kx. L’allungamento è dunque x=F/k=6/200 m=3/100 m=3 cm. La lunghezza osservata comprende sia la lunghezza a riposo sia l’allungamento: sottraggo 3 cm da 14 cm e ottengo 11 cm. Il dato non è una compressione, perché la molla è tirata.

Passaggi manuali: x=\frac Fk;  x=\frac{6}{200}\,\mathrm m;  x=3\,\mathrm{cm};  \ell=\ell_0+x;  \ell_0=14\,\mathrm{cm}-3\,\mathrm{cm};  \ell_0=11\,\mathrm{cm}

Risposta proposta: 11 cm.

Confutazioni proposte: Tre centimetri è soltanto l’allungamento. Diciassette lo aggiungerebbe alla lunghezza già allungata; quattordici ignorerebbe la deformazione. Sottrarre 0,03 direttamente da 14 confonderebbe metri e centimetri.

## C1-Q057 — La pendenza della prova elastica

Versione 2, base 1; famiglia pendenza-di-una-prova-elastica; difficoltà 2.

Scelta del modello e procedura: Per l’allungamento positivo il modulo della forza è F=kx. Dividendo una variazione di forza per la corrispondente variazione di allungamento ricavo k. La pendenza ha quindi unità N/m. Il segno meno della legge orientata F_x=−kx non rende negativa la pendenza di questo grafico dei moduli.

Passaggi manuali: F=kx;  \frac{\Delta F}{\Delta x}=k;  [k]=\mathrm{N/m}

Risposta proposta: La costante elastica k, in N/m.

Confutazioni proposte: La lunghezza a riposo non è una pendenza e x è la coordinata orizzontale. L’energia corrisponde invece a un’area sotto la curva F–x. Il reciproco k⁻¹ sarebbe la pendenza nel grafico con gli assi scambiati.

## C1-Q058 — Il regime dopo l’inizio dello slittamento

Versione 2, base 1; famiglia lattrito-durante-lo-slittamento; difficoltà 1.

Scelta del modello e procedura: L’informazione decisiva è lo scorrimento relativo già presente. Si parla allora di attrito dinamico o cinetico: la forza tangenziale si oppone alla velocità relativa dei due corpi. Il nome non dipende dal fatto che il moto nel laboratorio sia uniforme oppure accelerato.

Passaggi manuali: |f_d|=\mu_dN

Risposta proposta: Attrito dinamico, o cinetico.

Confutazioni proposte: Statico indica contatto senza slittamento relativo. Il rotolamento puro è un’altra condizione cinematica; elasticità e gravitazione descrivono interazioni diverse, non un regime di attrito radente.

## C1-Q059 — Il segno del richiamo elastico

Versione 2, base 1; famiglia una-molla-comprimibile; difficoltà 2.

Scelta del modello e procedura: La forza orientata è F_x=−kx: è opposta allo spostamento dal riposo. Con x negativo, il richiamo è quindi positivo, verso destra. Per il calcolo manuale uso 0,025=1/40: ottanta diviso quaranta vale due. Il modulo è 2 N e la componente richiesta è +2 N.

Passaggi manuali: x=-\frac1{40}\,\mathrm m;  F_x=-kx;  F_x=-80\left(-\frac1{40}\right)\,\mathrm N;  F_x=+2\,\mathrm N

Risposta proposta: 2 N.

Confutazioni proposte: Meno due conserverebbe il verso della deformazione anziché invertirlo. Zero ignorerebbe lo spostamento dal riposo e 80 copierebbe il valore numerico di k senza moltiplicarlo per una lunghezza. La costante k resta positiva.

## C1-Q060 — Due molle sulla stessa traversa

Versione 2, base 1; famiglia due-molle-uguali-affiancate; difficoltà 3.

Scelta del modello e procedura: La traversa impone il medesimo allungamento a ogni molla. Ciascuna esercita un richiamo di modulo kx; le due forze hanno lo stesso verso e si sommano. Il modulo totale è quindi 2kx e la costante equivalente è 2k. Non sono molle in serie: qui la deformazione non si divide fra elementi successivi.

Passaggi manuali: F_1=kx;  F_2=kx;  F_{\rm tot}=F_1+F_2;  F_{\rm tot}=2kx

Risposta proposta: 2 k x.

Confutazioni proposte: kx dimentica una molla; kx/2 usa la costante di due molle uguali in serie. 2k/x ha dimensione N/m² e kx² ha dimensione N·m, quindi nessuna delle due esprime una forza.

## Rilettura distinta e followup autore

Correzioni puntuali richieste dal revisore A: tassonomia del diario errori, ipotesi meccaniche, distinzione massa/peso e unità della controprova. Le chiavi e tutte le formule restano identiche ai byte archiviati. SVG e precedente native asset-only sono byte-identici e restano prove della sola figura. Cinque nuovi doppi assembly e import canonici reali, ciascuno 10→0/10, con tutti i 991 pubblicati invariati. SCI propria, UI prodotto e human NOT_RUN.
