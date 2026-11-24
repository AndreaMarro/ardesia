# Revisione indipendente circular-speed-024

Autore A, revisore AI integratore separato. Letti tutti i sedici originali della
fonte Ardesia fissata, i sedici candidati, opzioni, soluzioni, hint, feedback e SVG.
Nessun import dal generatore autore e nessun uso della chiave sorgente come prova.
Firme congelate dopo la lettura; rilette le modifiche autore 7d4d5170 agli ID14/15.
Esito16/16 PASS_AI, approvazione umana NOT_RUN, contenuti DRAFT. Importazione e
rendering privato hanno report separati e non sono attestati da questa nota.

Derivazione indipendente: differenziare la posizione cartesiana sulla circonferenza
produce una velocità tangente di modulo2πr/T. Integrando il modulo su un periodo
si ritrova2πr, mentre lo spostamento vettoriale in un giro è zero. Raggio e periodo
positivi e costanti dentro ogni prova, sistema inerziale, nessuna approssimazione
diπ. Pint controlla L/T e le unità inverse del guadagno; SymPy controlla inverse,
rapporti, calibrazione affine e rango del sistema indeterminato.

| ID | Risoluzione manuale e giudizio individuale |
|---|---|
|01|2π·1/π=2m/s; cancellazione esatta, non valutazione decimale.|
|02|Una circonferenza è lunghezza: dividere per periodo dà m/s. Le altre unità proposte non sono L/T.|
|03|Un giro percorre2πr; l'unica identità generale è V=2πr/T. I distrattori alterano raggio, tempo o fattore2π.|
|04|A T=πs, r da1a2m dà V da2a4m/s. Raddoppiare il raggio raddoppia il modulo, non il periodo.|
|05|VT=2πr, poi divisione per2π≠0: r=2π/(2π)=1m.|
|06|VT=2πr, poi divisione perV>0: T=2π/2=πs.|
|07|Stesso raggio, periodo doppio: rapporto1/2. Distinti reciproco e fattori quadratici.|
|08|Con periodoπ, rapidità4−2=+2m/s; differenza di moduli tra prove, non sottrazione di vettori in punti diversi.|
|09|r=VT/(2π), dimensioneL. Gli altri inversi non soddisfano la relazione per tutti i dati positivi.|
|10|Nel rapporto si cancellano2πr/T, restaκ₁/κ₂. Le coincidenze di distrattori per dati speciali non sono leggi generali.|
|11|Seconda prova r2m e T1s: V₂=4πm/s; V₂/V₁=2π. Nessun decimale necessario.|
|12|Media aritmetica di due rapidità assegnate con uguale peso: (2+4π)/2=1+2πm/s. Non è velocità vettoriale media di un giro.|
|13|T₂=2π·2/(4π)=1s; rapporto T₂/T₁=1/π. Numeratore e denominatore sono periodi, rapporto puro.|
|14|S=gV, primo punto g=6/2=3s/m; V=12π/3=4πm/s; r=VT/(2π)=2m. S è lettura continua adimensionale.|
|15|g=(8π−4)/(4π−2)=2s/m, offset1; dalla lettura9, V=(9−1)/2=4m/s e r=2m. Letture e offset sono adimensionali.|
|16|r=T/π sostituito nella legge dà V=2m/s per ogniT>0. Il rango è1: infinite coppie positive, non una coppia unica.|

Controllati segni, unità di risposta, unicità delle cinque opzioni quando presenti,
ipotesi, inversi e passaggi manuali per ciascun ID. Gli SVG distinguono lunghezza
del giro e vettore velocità; frecce e didascalie non identificano rapidità con
spostamento. Il test avversario modifica e rifirma intenzionalmente la risposta di
ogni ID: l'oracolo deve rifiutarla anche se i soli hash vengono riallineati.

Finding chiuso dall'autore: i due display di calibrazione non devono suggerire
conteggi interi, perché i dati contengonoπ. Gli ID14/15 ora dichiarano letture
continue adimensionali. Non è richiesta valutazione trigonometrica o decimale.
La revisione AI non equivale a certificazione umana, test su studenti o conformità
WCAG/UDL dell'intero prodotto.
