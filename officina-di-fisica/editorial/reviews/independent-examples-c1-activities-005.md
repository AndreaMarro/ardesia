# Verifica indipendente — C1-E017..020 e C2-E001..004

Revisore AI distinto dall’autore originale. Fonte fissata: `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C1.json`, SHA256 del file `0a79b1212adbef650733d655d1de2d5ffd7af5eb2be2bde50710a0a1721ab0cf`. Letti individualmente prompt e tutti i blocchi degli otto esempi; letti i sette SVG dal medesimo commit e visionate anteprime renderizzate. Anche `officina-di-fisica/content/C2.json` è fissato alla stessa SHA, con SHA256 file `7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23`. Hash delle singole righe e figure nel modulo e nei report. Nessun import di moduli d’autore, nessuna alterazione delle fonti o degli asset storici.

Il lotto comprende gli otto ID effettivi assegnati dal coordinatore: C1-E017..020 e C2-E001..004. Report: **otto originali verificati, otto accettati, zero edizioni scientificamente fallite**. Ogni record riporta il proprio sourcePath, e i report fissano entrambi i file sorgenti.

Tutti e otto i record richiedono un calcolo numerico autonomo e hanno `calculationScope=EXACT_MANUAL_CALCULATION`. Oracoli autonomi SymPy per equazioni e integrali, Fraction per aritmetica razionale, Pint per conversioni e dimensioni. `humanApproval=NOT_RUN`, `publicationAction=NONE`, `originalEditionRetained=True`. L’esito è una revisione AI dell’edizione originale, non un’approvazione umana o una pubblicazione.

## C1-E017 — Leggere una pulsazione di forza, versione 2

Il prompt definisce la forza **netta** orizzontale: non occorre aggiungere un’altra forza d’attrito o contare due volte forze reali. Assumiamo il riferimento inerziale del laboratorio e massa costante 2 kg. Il carrello parte fermo; asse positivo concorde alla spinta. I tratti crescono e decrescono linearmente, ma entrambi hanno forza non negativa.

Derivazione indipendente: con t in secondi, il tratto crescente è F=400t e quello decrescente F=80−400t; integrati rispettivamente su [0,1/10] e [1/10,1/5], danno entrambi 2 N·s. Il procedimento manuale equivalente è l’area di ciascun triangolo: (1/2)(1/10 s)(40 N)=2 N·s. Somma 4 N·s, impulso uguale alla variazione della quantità di moto. Dalla partenza ferma 2 kg·vf=4 kg·m/s, quindi vf=+2 m/s. Il segno è quello dell’asse dichiarato.

Il controllo della forza media è 4/(1/5)=20 N; 20 N per 1/5 s restituisce 4 N·s. Usare il picco 40 N lungo tutto il tempo darebbe 8 N·s e vf=4 m/s, esattamente il doppio: il distrattore implicito finale è corretto. La discesa del grafico non produce impulso negativo; descrive una forza positiva di modulo decrescente. Impulso non è lavoro: dimensioni N·s=kg·m/s e divisione per massa→m/s verificate con Pint.

Figura `C1-impulso.svg`: estremi x84 e436, vertice x260, con due basi uguali176px per0,10s. Picco etichettato40N, a0,10s; zeri a0e0,20s; area ombreggiata interamente sopra il tempo. La base del tracciato y165 rispetto all’asse y167 differisce di2px, entro il tratto grafico e senza suggerire un offset fisico; non si ricava un valore diverso misurando il bordo dello stroke. Figura coerente con i dati espliciti. Nessuna revisione richiesta.

## C1-E018 — Due carrelli si agganciano, versione 1

Sistema: entrambi i carrelli, masse costanti 2 e1kg; impulso esterno orizzontale trascurabile durante l’urto; riferimento inerziale e destra positiva. La guida può esercitare forze verticali senza invalidare la conservazione della quantità di moto orizzontale. L’aggancio impone una velocità traslazionale finale comune. Non implica conservazione dell’energia cinetica.

Quantità di moto iniziale: 2·3+1·(−1)=6−1=5 kg·m/s. Con massa totale3kg, vf=5/3 m/s, positiva. Energia iniziale: (1/2)2·3²+(1/2)1·(−1)²=9+1/2=19/2 J. Energia finale: (1/2)3·(5/3)²=25/6 J. Perdita Ki−Kf=57/6−25/6=32/6=16/3 J. Controcontrollo autonomo con massa ridotta μ=2/3kg e rapidità relativa4m/s: (1/2)μ·4²=16/3J. Pint conferma che il quadrato di una velocità orientata porta unità energetiche e valore positivo.

La fonte dà il valore esatto 16/3 prima dell’approssimazione esplicita ≃5,33: non richiede di ottenere un decimale non elementare. Il conto manuale 16/3=5+1/3=5,333… rende l’arrotondamento immediato. Prova con interi senza divisione lunga: 5,325=213/40<16/3 perché639<640; 16/3<1067/200=5,335 perché3200<3201. L’errore 16/3−533/100 è esattamente1/300J, minore di mezzo centesimo1/200J. Il decimale secondario è quindi fattibile manualmente e corretto.

Errore implicito controllato: sommare i moduli della quantità di moto darebbe7/3m/s e non conserverebbe il valore iniziale5kg·m/s; porre Ki=Kf sarebbe incompatibile con l’aggancio. La frase sull’energia trasferita ad altre forme non afferma scomparsa dell’energia totale.

Figura `C1-aggancio.svg`: carrello2kg a sinistra, velocità verso destra+3m/s; carrello1kg a destra, verso sinistra−1m/s. I corpi convergono; frecce64e22px mostrano correttamente il rapporto qualitativo circa3:1 senza dichiarare una scala metrica. Dopo, rettangoli adiacenti e dicitura «un’unica velocità» coerenti con l’aggancio. Nessuna revisione richiesta.

## C1-E019 — Un avambraccio in equilibrio, versione 1

Modello statico bidimensionale: avambraccio rigido orizzontale di peso trascurabile, muscolo verticale verso l’alto e carico18N verso il basso. Il gomito è un giunto che può esercitare reazione di entrambi i versi verticali, non un appoggio unilaterale che possa soltanto spingere in alto. Nessuna coppia vincolare aggiuntiva è assegnata. Le distanze dal gomito sono i bracci perché le forze sono verticali e l’avambraccio orizzontale.

Prendiamo polo O e antiorario positivo. Il carico ha momento −18·(3/10)=−27/5=−5,4N·m. Il muscolo ha +Fm·(9/200), perché0,045=9/200m. La reazione passa per il polo e ha momento nullo, senza per questo essere una forza nulla. Equilibrio: Fm(9/200)=27/5; Fm=(27/5)(200/9)=(27·40)/9=120N. Pint verifica N·m diviso m→N.

Per le forze, alto positivo: Ry+120−18=0, quindi Ry=−102N, cioè102N verso il basso. Controlli: momento muscolare120·(9/200)=27/5N·m e risultante−102+120−18=0. Porre Fm=18N bilancerebbe i moduli delle due forze isolate ma non i momenti, perché i bracci sono diversi. Porre Ry=0 perché assente dalla prima equazione sarebbe un errore distinto. Il grande modulo muscolare è coerente con il braccio corto.

Figura `C1-leva.svg`: forza muscolare verso l’alto vicino aO e carico verso il basso lontano daO producono i versi indicati. Il simbolo del gomito indica il giunto; non impone una reazione unilaterale contraria al modello anatomico. La caption dichiara i bracci schematici: distanze e lunghezze delle frecce non sono una scala quantitativa da cui stimare momenti o forze. La reazione non è disegnata come freccia aggiuntiva, ma è esplicitamente calcolata nel testo. Nessuna revisione richiesta.

## C1-E020 — Dov’è il punto di equilibrio?, versione 1

Masse puntiformi3kg e1kg fissate a un’asta di massa trascurabile, coordinate orientate dalla medesima origine. Gravità uniforme: il fattore g è comune e il peso totale può essere applicato al centro di massa per il momento gravitazionale. Si cerca un equilibrio orizzontale, senza affermare stabilità o momento restaurativo sotto perturbazioni.

Primo momento di massa: 3·(−1/5)+1·(3/5)=−3/5+3/5=0kg·m. Massa totale4kg: xCM=0/4=0m. Sostegno nell’origine per annullare il momento gravitazionale. Con g10m/s² i pesi sono30N e10N; momenti orientati rispettivamente +(30)(1/5)=+6N·m e−(10)(3/5)=−6N·m. Si cancellano. Il sostegno deve contemporaneamente fornire40N verso l’alto; la fonte ricorda esplicitamente anche questa condizione di equilibrio delle forze. L’ubicazione del sostegno è indipendente dal valore di un g uniforme.

Distrattori impliciti: media semplice delle coordinate=+0,20m sarebbe adatta a masse uguali, non a queste; cancellare i segni prima della somma porterebbe a un primo momento errato. Il centro sta tre volte più vicino alla massa maggiore (0,20m contro0,60m), coerentemente con i momenti dei pesi.

Figura `C1-cdm.svg`: origine x216px, massa sinistra x146, destra x426: distanze70 e210px, rapporto esatto1:3 e stessa scala350px/m. Segni e valori delle coordinate corretti. Le diverse dimensioni dei dischi distinguono simbolicamente le masse puntiformi, senza introdurre raggi fisici o una dimensione dell’asta da aggiungere ai bracci. Nessuna revisione richiesta.

## C2-E001 — Dal campione al materiale, versione 1

Il liquido è omogeneo e il recipiente è lo stesso nella tara e nella misura piena. Il volume30mL si riferisce al solo liquido. Non si assume una densità nota a priori né si identifica un materiale univocamente dalla sua densità. Le condizioni di misura sono quelle del campione.

Massa pertinente:49,5−24,0=25,5g=51/2000kg. Volume30mL=30·10⁻⁶m³=3/100000m³. Divisione esatta: (51/2000)/(3/100000)=(51·50)/3=850kg/m³. Manualmente si semplifica51/3=17 e17·50=850. Nelle unità iniziali25,5/30=255/300=17/20=0,850g/mL, equivalente per il fattore1000 fra g/mL e kg/m³. Pint verifica entrambe le conversioni e il controllo inverso:850·(3/100000)m³=25,5g; aggiungendo la tara si ritrovano49,5g.

Usare tutta la massa49,5g darebbe1650kg/m³ e includerebbe indebitamente il recipiente. Dimenticare che1mL=10⁻⁶m³ produrrebbe un errore di scala. Il confronto qualitativo con acqua ordinaria a temperatura ambiente è corretto:0,850g/mL è inferiore a circa1g/mL; il valore preciso dell’acqua non entra nel calcolo. Il testo non deduce dalla densità un’identificazione univoca della sostanza. Nessuna figura. Nessuna revisione richiesta.

## C2-E002 — Una membrana fra due camere, versione 1

Pressioni assolute uniformi104e100kPa sulle due facce opposte della medesima area piana6cm². Si chiede soltanto la risultante dovuta alle pressioni; non la forza complessiva includendo vincoli o elasticità della membrana. Ogni spinta è normale alla faccia e i versi sono opposti.

Area:6cm²=6(1/100m)²=6/10000m²=3/5000m². Differenza: (104−100)kPa=4000Pa. Risultante:4000·(3/5000)=12/5=2,4N. Controcontrollo separato con le due forze:104000·(3/5000)=62,4N, contro100000·(3/5000)=60N; differenza2,4N. Il verso va dalla camera a104kPa verso quella a100kPa. L’unità Pa·m²=N è confermata con Pint.

Il contributo comune di pressione atmosferica si cancellerebbe anche se entrambi i dati fossero espressi come pressioni relative alla medesima atmosfera. Sommare le due forze darebbe122,4N; usarne una sola darebbe62,4o60N, tutti valori sbagliati per la risultante. Convertire6cm² in6·10⁻²m² invece di6·10⁻⁴m² darebbe un errore100: il fattore sulla lunghezza va elevato al quadrato.

Figura `C2-membrana.svg`:104kPa a sinistra,100kPa a destra, membrana verticale e frecce orizzontali verso le facce opposte. La caption dichiara i versi, senza scala metrica delle frecce:77e71px non servono a ricostruire quantitativamente il rapporto104/100. L’area è esplicitamente6cm². Nessuna revisione richiesta.

## C2-E003 — La lettura nei due rami, versione 1

Acqua connessa in quiete, densità1000kg/m³ e g9,8m/s² uniformi. Si trascurano salti capillari e contributi delle colonne di gas; la pressione del gas è quella sulla sua interfaccia liquida. I12cm sono la differenza totale delle quote delle due superfici, non uno spostamento per ciascun ramo. La pressione relativa è pgas−patm.

Dalla superficie atmosferica si scende di h fino alla quota dell’interfaccia sinistra. L’equazione idrostatica dp/dh=ρg, con h positivo verso il basso, integrata su h, dà l’aumentoρgh. Alla medesima quota nello stesso liquido connesso la pressione è uguale. Quindi pgas−patm=+ρgh: il gas ha pressione maggiore, coerentemente con la sua superficie più bassa.

Manuale:12cm=3/25m e9,8=49/5m/s²;1000·(49/5)·(3/25)=8·147=1176Pa. Pint verifica kg/m³·m/s²·m→Pa. In kPa1176/1000=147/125=1,176 esatto. La fonte scrive prima1176Pa e poi l’approssimazione esplicita1,18kPa. Il criterio al centesimo usa soli interi:1175<1176<1185, equivalente a1,175<1,176<1,185. L’errore1,18−1,176=0,004kPa è minore di0,005kPa. Non è richiesto un calcolo trigonometrico o una ricerca numerica.

Figura `C2-manometro.svg`: liquido comune connesso; gas a sinistra, atmosfera a destra. Superficie sinistra a y104 e destra a y64, quindi gas depresso; linee di quota e Δh illustrano una singola differenza verticale40px. Il diagramma non impone due colonne separate da sommare né una seconda densità. Il verso e il percorso suggeriti dalla caption sono corretti. Nessuna revisione richiesta.

## C2-E004 — Un fondo sotto due strati, versione 1

Vaso aperto all’atmosfera; olio e acqua immiscibili in quiete, omogenei, con densità costanti800e1000kg/m³; g10m/s² uniforme. Olio sopra acqua coerentemente con la densità minore. La fonte trascura esplicitamente gli effetti capillari all’interfaccia piana, per cui la pressione è continua quando si passa da uno strato all’altro.

Percorso dalla superficie al fondo: nello strato d’olio si scende1/10m, accumulando800·10·(1/10)=800Pa. Da quella pressione si scende ancora1/4m nell’acqua:1000·10·(1/4)=2500Pa. La somma è3300Pa=33/10kPa=3,3kPa, pressione relativa. Le integrazioni separate di dp/dh=ρg e una somma di quantità Pint confermano il risultato e le dimensioni. Entrambi gli incrementi sono positivi; aggiungere patm al numero richiesto darebbe pressione assoluta, altra grandezza.

Usare la densità dell’acqua su tutti35cm darebbe3500Pa; solo quella dell’olio darebbe2800Pa. La critica della fonte è a una densità unica arbitraria: una densità efficace opportunamente ponderata sugli spessori sarebbe un altro calcolo valido, senza contraddire la spiegazione. Figura `C2-strati.svg`: contenitore aperto, olio superiore10cm, acqua inferiore25cm, interfaccia comune; spessori grafici40e98px circa nel rapporto1:2,5, senza dichiarazione di scala quantitativa. Si usano le quote numeriche del prompt, non il bordo degli stroke. Nessuna revisione richiesta.

## Prove del contratto

49 controlli matematici/dimensionali indipendenti, tutti veri sugli otto originali. Invalidazione tecnica verificata separatamente su entrambi i corsi: mutazioni del testo e del kind cambiano l’hash e rifiutano il record; un originale mancante interrompe la verifica; un byte aggiunto a uno SVG temporaneo rifiuta soltanto il record dipendente; aggiungere un riferimento a figura nel record senza figura è rifiutato. File sorgenti e sette asset storici restano immutati. I due report005 sono la stessa review degli originali, senza edizioni nuove auto-verificate.
