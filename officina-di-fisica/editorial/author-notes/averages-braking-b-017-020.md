# Note d’autore — medie e frenate 017–020

64 riscritture individuali, quattro famiglie complete da16ID. Tutte restano DRAFT;
revisione scientifica indipendente e approvazione umana NOT_RUN nei file d’autore.
Queste note espongono calcoli proposti e scelte da sottoporre al reviewer: non
assegnano PASS scientifici, non sono una firma indipendente e non pubblicano nulla.

Fonte immutabile letta per tutti i64ID: `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`,
`packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-01.json`.
I nomi effettivi coincidono con il mandato: equal-time-average, roundtrip-average,
stopping-time e stopping-distance, ciascuno01..16. Consegne, risposte e compiti
cognitivi letti individualmente, comprese le eccezioni sulle quote di spazio/tempo,
il ritorno e l’identificabilità. Le provenienze conservano il compito sorgente.

Si riusano `pipeline`, `units_authoring` e l’helper di assembly già esistente.
Nessuna seconda ETL o importazione, nessun nuovo motore di pubblicazione. Le
competenze e i prerequisiti sono quelli del catalogo corrente: C1-L003 per medie,
C1-L004 per frenate, con C1-L001/L002/L003 come prerequisiti pertinenti. C6 resta
collegato come riuso per i moti. Registro e checkpoint appartengono al coordinatore.

## Intervalli di uguale durata — equal-time-average-017

In due intervalli consecutivi di durata comune τ>0, la media orientata è
(v₁τ+v₂τ)/(2τ)=(v₁+v₂)/2. La semisomma vale grazie ai pesi temporali uguali;
non deriva da distanze uguali. I segni delle componenti sono conservati.

| ID sorgente | Calcolo d’autore / punto da controllare |
| --- | --- |
| u2-equal-time-average-01 | Due velocità+2m/s su tempi uguali danno V=2m/s; il tempo totale è2τ. |
| u2-equal-time-average-02 | La media conserva L/T; il divisore2 conta gli intervalli e non è una durata in secondi. |
| u2-equal-time-average-03 | Formula generale con componenti anche di segno diverso: V=(v₁+v₂)/2; rapidità media usa invece i moduli nei due tratti uniformi. Se v₂=−v₁≠0, V=0 e rapidità positiva. |
| u2-equal-time-average-04 | Coppie(2,2)→(4,2)m/s: medie2→3m/s, non4. Un solo addendo raddoppia. |
| u2-equal-time-average-05 | 2V=v₁+v₂ ⇒ v₁=2V−v₂=2m/s. Nel dominio positivo serve2V>v₂. |
| u2-equal-time-average-06 | Distanze2τ e6τ nelle rispettive unità: quota secondo6/(2+6)=3/4, non metà del tempo. |
| u2-equal-time-average-07 | Medie2e3m/s: rapporto3/2, non rapporto delle sole seconde velocità. |
| u2-equal-time-average-08 | Variante con medie dei due intervalli+2e−2m/s: spostamenti opposti, V=0; proposta+2m/s ⇒ scarto+2m/s. Le velocità sono medie interne, così non si impone un’inversione istantanea. Compito sorgente di diagnosi e risposta numerica2 conservati. |
| u2-equal-time-average-09 | v₁=2V−v₂; operazioni prima×2 poi−v₂; dimensione velocità. |
| u2-equal-time-average-10 | Rapporto=(κ₁v₁+κ₂v₂)/(v₁+v₂), pesato dalle velocità positive; semisomma dei soli fattori soltanto se v₁=v₂. |
| u2-equal-time-average-11 | Coppie(2,2)→(4,4)m/s: V₁=2,V₂=4m/s; rapporto2. V₁,V₂ definiti nel prompt come medie complessive. |
| u2-equal-time-average-12 | Media statistica delle letture2e4m/s:3m/s. Legge lineare negli ingressi con pesi temporali fissati. |
| u2-equal-time-average-13 | Obiettivo nuova media4m/s e primo contributo4: secondo=2·4−4=4m/s, rapporto4/2=2. |
| u2-equal-time-average-14 | g=6/(2m/s)=3s/m;V=12/g=4m/s;v₁=2·4−4=4m/s. V definita come media orientata completa nel prompt. |
| u2-equal-time-average-15 | Riferimenti V2,4m/s: g=2s/m,c=1;S7→V3m/s;v₁=2·3−2=4m/s. |
| u2-equal-time-average-16 | v₁=v₂>0 ⇒ V=v₂=2m/s. Senza vincolo molte coppie positive possono avere la stessa semisomma. |

Il reviewer ha rilevato due ambiguità prima del congelamento: l’esempio di ritorno
nel03 richiedeva la clausola non nulla per affermare rapidità positiva; nei prompt
11/14/15 i simboli delle medie non erano definiti esplicitamente. Correzione
8b894b2c successiva all’authoring14ef88ee: aggiunta la clausola v₁≠0 alla sola frase
e definite le medie nei prompt. Chiavi invariate, binding rigenerati.

L’asset sceglie τ=1s solo per il disegno. Pannello v–t:100px/s e30px/(m/s), due
rettangoli di uguale base con altezze2e6m/s. Barre di distanza:40px/m, lunghezze80e240px
per2e6m. Il secondo tratto occupa3/4 dello spazio ma1/2 del tempo.

## Distanze uguali nel ritorno — roundtrip-average-018

Modello di due tratti uniformi rettilinei di uguale lunghezza d>0, senza soste e
con tempo d’inversione trascurato. Le rapidità v₁,v₂ sono positive. La rapidità media
è2d/(d/v₁+d/v₂)=2v₁v₂/(v₁+v₂); la velocità media vettoriale dell’intero ritorno è
invece zero. Il tratto lento ha peso temporale maggiore.

| ID sorgente | Calcolo d’autore / punto da controllare |
| --- | --- |
| u2-roundtrip-average-01 | Rapidità uguali2m/s: media2m/s anche invertendo il verso; vettoriale0 distinta dalla rapidità. |
| u2-roundtrip-average-02 | Distanza totale/tempo totale ha dimensione L/T; non usare lo spostamento netto al numeratore. |
| u2-roundtrip-average-03 | t₁=d/v₁,t₂=d/v₂; cancellare d>0 e sommare reciproci ⇒ media armonica2v₁v₂/(v₁+v₂). |
| u2-roundtrip-average-04 | Coppie(2,2)→(4,2): V2→8/3m/s, non semisomma3. Si dimezza solo il tempo di andata. |
| u2-roundtrip-average-05 | Eliminare denominatore, raccogliere v₁: v₁=Vv₂/(2v₂−V)=2m/s. La falsa inversa aritmetica coincide qui solo per i dati simmetrici. |
| u2-roundtrip-average-06 | Due6m con rapidità3e2m/s: tempi2e3s; quota ritorno3/5. Rapidità totale12/5m/s, vettoriale0. |
| u2-roundtrip-average-07 | V₁=2,V₂=8/3m/s ⇒ rapporto4/3, non3/2 della media aritmetica. |
| u2-roundtrip-average-08 | Due rapidità2m/s ⇒ V2m/s; proposta4⇒scarto+2m/s. Non confrontare la proposta di rapidità con la vettoriale0. |
| u2-roundtrip-average-09 | v₁=Vv₂/(2v₂−V); dominio esplicito0<V<2v₂ per rapidità finita positiva. Limite superiore non raggiungibile con v₁ finita. |
| u2-roundtrip-average-10 | Rapportoκ₁κ₂(v₁+v₂)/(κ₁v₁+κ₂v₂). Passaggi leggibili con P=κ₁κ₂,S₁=v₁+v₂,S₂=κ₁v₁+κ₂v₂ e rapporto=P S₁/S₂. |
| u2-roundtrip-average-11 | Coppie(2,2)→(4,4): medie2→4m/s, rapporto2. Entrambi i tempi si dimezzano a distanza fissata. |
| u2-roundtrip-average-12 | Media statistica delle uscite2e4m/s=3m/s. Gli ingressi medi coincidono qui perché le coppie sono proporzionali, non per linearità generale; controesempio(2,4),(4,2) dà8/3contro3. |
| u2-roundtrip-average-13 | Nuova media W4m/s, prima rapidità u4m/s: secondaWu/(2u−W)=4m/s; rapporto2. Simboli ausiliari espliciti per formula breve. |
| u2-roundtrip-average-14 | g=3s/m;S12→V4m/s;v₂4m/s ⇒ v₁=16/(8−4)m/s=4m/s. |
| u2-roundtrip-average-15 | g=2s/m,c=1;S19/3→V8/3m/s;2v₂−V=4/3m/s;v₁=(16/3)/(4/3)m/s=4m/s. Tutte frazioni esatte. |
| u2-roundtrip-average-16 | v₁=v₂>0 ⇒ V=2v₂²/(2v₂)=v₂=2m/s; d rimane libero. |

Finding grafico ricevuto prima della firma: un solo elemento path con due
sottopercorsi e marker-end disegnava la punta solo sul ritorno. Correzione50d18b60
successiva a3a52e90b: due elementi path separati, ciascuno con la punta, senza
cambiare lunghezze o scale; asset, pacchetto e binding rigenerati. Chiavi e testi
invariati. Nel disegno le frecce sono entrambe360px per6m, scala60px/m. La timeline
usa60px/s, con120px per2s e180px per3s. I tempi non sono presentati come uguali.

## Tempo fino al primo arresto — stopping-time-019

+x coincide col verso della velocità iniziale. v>0 è la rapidità iniziale, b>0 il
modulo della decelerazione; la componente dell’accelerazione è aₓ=−b. Il tempo zero
è l’inizio della frenata e T è il primo istante successivo con u(T)=0. La legge
u(t)=v−bt viene usata soltanto da0 aT; non è prolungata come legge di frenata dopo
lo zero. La reazione non è inclusa.

| ID sorgente | Calcolo d’autore / punto da controllare |
| --- | --- |
| u2-stopping-time-01 | u=2−2t inSI; primo zeroT=v/b=1s. Modulo b positivo e componente negativa distinti. |
| u2-stopping-time-02 | (L/T)/(L/T²)=T, unitàs. Il modulo del freno non cambia il segno della durata futura. |
| u2-stopping-time-03 | 0=v−bT ⇒ T=v/b>0; usando la componente aₓ sarebbe−v/aₓ, stessa durata. v²/(2b) è distanza e non tempo. |
| u2-stopping-time-04 | v2→4m/s a b2m/s² fisso: T1→2s. Distanza, non tempo, quadruplicherebbe. |
| u2-stopping-time-05 | v=bT=2m/s; per tempi precedenti1s la velocità è positiva, quindi è il primo zero. |
| u2-stopping-time-06 | b=v/T=2m/s²; componente aₓ=−2m/s², non risposta negativa al modulo richiesto. |
| u2-stopping-time-07 | b2→4m/s² con v2m/s: tempi1e1/2s; rapporto1/2 positivo. |
| u2-stopping-time-08 | Tcorretto1s, proposto2s ⇒ scarto+1s. A2s il prolungamento algebrico darebbe velocità negativa, zero già attraversato. |
| u2-stopping-time-09 | Inversa v=bT, con b,T>0; dimensione L/T. Non introdurre radice o segno meno nel modulo. |
| u2-stopping-time-10 | T₂/T₁=κ₁/κ₂. Se i fattori sono uguali il tempo resta uguale, non il loro prodotto. |
| u2-stopping-time-11 | (v,b)=(2,2)→(6,4)nelle unitàSI: tempi1e3/2s, rapporto3/2. |
| u2-stopping-time-12 | Media delle durate1e3/2s=5/4s. Dividere gli ingressi medi4m/s e3m/s² darebbe4/3s, operazione diversa. |
| u2-stopping-time-13 | Nuovo tempo3/2s e v6m/s ⇒ b4m/s²; rapporto b₂/b₁=2. |
| u2-stopping-time-14 | g=3s⁻¹;S9/2→T3/2s; b4m/s² ⇒ v6m/s. |
| u2-stopping-time-15 | Tempi riferimenti1e3/2s,letture3e4: g=2s⁻¹,c=1;S5→T2s; b2m/s² ⇒ v4m/s. |
| u2-stopping-time-16 | Vincolo v=(1s)b implica giàT1s: infinite coppie positive. Esempi b2/v2 e b4/v4 nelle rispettive unità; il coefficiente temporale è necessario per le dimensioni. |

L’asset usa160px/s e80px/(m/s) in tre pannelli. Velocità iniziale2m/s, zero a1s;
a mezzo secondo velocità1m/s ancora positiva. Le rette terminano al primo arresto;
nessun tratto di velocità negativa viene etichettato come ulteriore frenata.

## Distanza di frenata — stopping-distance-020

Stesse convenzioni v>0,b>0,aₓ=−b e primo arresto. D è la distanza dalla posizione
all’inizio della frenata, senza reazione. Fino all’arresto non ci sono inversioni:
D coincide con lo spostamento positivo e con l’area del triangolo v–t. La relazione
D=(v/2)T eT=v/b dàD=v²/(2b).

| ID sorgente | Calcolo d’autore / punto da controllare |
| --- | --- |
| u2-stopping-distance-01 | v2,b2 nelle unitàSI: T1s,triangoloD=(1/2)2·1=1m. Rettangolo inizialevT darebbe2m errati. |
| u2-stopping-distance-02 | [(m/s)²]/[m/s²]=m, il fattore2 è puro. |
| u2-stopping-distance-03 | Media della rapidità durante la frenata v/2, tempo v/b ⇒ D=v²/(2b). Necessarie costanza della decelerazione e fine al primo zero. |
| u2-stopping-distance-04 | v2→4 a b2 fisso ⇒ distanze1→4m: quadruplica perché raddoppiano tempo e rapidità media. |
| u2-stopping-distance-05 | v²=2bD=4m²/s² ⇒ v=+2m/s; radice negativa esclusa perché si chiede rapidità. Radice esatta. |
| u2-stopping-distance-06 | b=v²/(2D)=2m/s²; aₓ=−2m/s² distinta dal modulo. |
| u2-stopping-distance-07 | b2→4,v2fisso ⇒ distanze1e1/2m; rapporto1/2, b non è al quadrato. |
| u2-stopping-distance-08 | Proposta2m,corretto1m⇒scarto+1m. La proposta usa la rapidità iniziale mantenuta per tuttoT e raddoppia l’area. |
| u2-stopping-distance-09 | v=√(2bD)>0;2bD ha dimensioneL²/T². √(2D/b) è un tempo di un altro modello, non questa rapidità. |
| u2-stopping-distance-10 | D₂/D₁=κ₁²/κ₂. Il fattore senza quadratoκ₁/κ₂ riguarderebbe il tempo di arresto. |
| u2-stopping-distance-11 | (v,b)=(2,2)→(4,4)nelle unitàSI: distanze1→2m, rapporto2. Tempi uguali1s ma rapidità medie diverse. |
| u2-stopping-distance-12 | Media delle distanze1e2m=3/2m. Gli ingressi medi3e3 producono qui anch’essi3/2 per scala comune; nessuna falsa linearità generale.9/4m mescolerebbe vmedio3 e primo b2. |
| u2-stopping-distance-13 | v doppia dàfattore4; uscita desideratafattore2 ⇒ modulo b doppio, b₂/b₁=2. |
| u2-stopping-distance-14 | g=3m⁻¹;S6→D2m;b4⇒v²=16m²/s²⇒v4m/s. Radice perfetta e segno positivo. |
| u2-stopping-distance-15 | RiferimentiD1,2m,letture3,5⇒g2m⁻¹,c1;S9→D4m;b2⇒v²16⇒v4m/s. |
| u2-stopping-distance-16 | Vincolo v=cb,c=1s: D=c²b/2;D1m⇒b=2D/c²=2m/s². Qui la distanza determina la scala, mentre nel01916 il solo tempo la lasciava libera. |

SVG alla stessa scala100px/s e50px/(m/s) nei tre pannelli. Primo triangolo con
v2m/s,T1s,D1m; ultimo con solo rapidità iniziale raddoppiata v4m/s,T2s,D4m, stesso
modulo b2m/s². Raddoppiano base e altezza, quindi area quadrupla. Le rette si
fermano ai rispettivi primi zeri e nessuna distanza di reazione è disegnata.

## Controlli tecnici d’autore e limiti

`averages-braking-b-017-020-structural.json` contiene soltanto controlli di identità,
assembly e importazione canonica. Tutti i64ID sono unici ed esattamente quelli
assegnati;16per famiglia. Rigenerazione identica per pacchetti e binding. Hash
sorgente, candidato, provenienza e allegati corrispondenti. Nessun verificatore
scientifico dei propri quesiti è stato creato o eseguito con pretesa d’indipendenza.

L’importazione usa esclusivamente l’adapter esistente in un SQLite temporaneo:
16bozze create per lotto, seconda importazione0revisioni con16invariate per lotto,
tutti i64nuovi head senza versione live. I991 materiali pubblicati conservano gli
stessi byte normalizzati prima e dopo, digest
`99c8d805004c82ba63a19f7ad8c0825666ca813d4f15471b8df4db5657b7c9ee`.

La guardia comune di identità dei letterali nelle scelte è stata usata in sola
lettura sui43record a scelta: nessuna equivalenza numerica riconosciuta duplicata.
È un controllo limitato, non una comprensione semantica di formule o distrattori.
Le verifiche di calcolo e ragionamento del reviewer restano separate.

Per riprodurre i file si usano i quattro moduli authoring con i soliti argomenti
`--repo`, `--source-ref` e `--destination`, nel venv condiviso con requisiti
canonici. Nessun database utenti aperto, nessun push o merge dell’autore. La
precedente attività da reviewer riguardava solo i48ID di autoreA, non questi64;
non viene riusata come auto-certificazione.

Prossimi passi del coordinatore/reviewer:

1. Completare la risoluzione indipendente dei64ID e congelare soltanto gli hash
   finali, rileggendo le correzioni017/018 qui conservate.
2. Verificare consumer a320px per formule, figure e indizi; eventuali correzioni
   richiedono nuovi binding e nuova lettura della presentazione modificata.
3. Integrare i soli commit assegnati e ripetere importazione complessiva e gate
   sulla SHA risultante, lasciando DRAFT e tentativi storici invariati.
4. Mantenere esplicite le fasi umane e la validazione reale con studenti: non
   discendono dai controlli tecnici di questo documento e rimangono NOT_RUN.
