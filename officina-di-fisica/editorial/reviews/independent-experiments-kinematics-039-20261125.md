# Rivalidazione indipendente039 sul profilo b963

Questa è una nuova esecuzione degli stessi sei ID storici, senza nuovo credito. Sono stati riletti individualmente gli originali completi dal pin Cric5d1dc8dc e rideterminate le leggi riportate sotto; gli oracoli recuperati erano già noti, quindi non si descrive questa attività come prima lettura cieca. La fonte completa ha SHA25684d13bd2658be3b0ce2a55bf7dc698d64ceae151b09deafeabd71507a41d70e3.

La snapshot5405 conserva byte per byte i vecchi verificatore, protocollo, test, report, nota e immagini. Le precedenti snapshot f897 e0e208 rimangono immutate. Il controllo iniziale sui18 test039/040 ha dato i6 fallimenti attesi perché le vecchie impronte rifiutavano il nuovo runtime: quel run non è positivo.

Sono state rilette le tre dipendenze cambiate: confronti corregge la potenza media a intervallo nullo per L00702; legende chiarisce peso/normale e fulcro; meccanica espone le forze di piano, molla e leva. I rami binario, volo, i modelli L003, i clock e i grafici di questi sei ID sono invariati. Tutte le22 dipendenze esplicite e il profilo globale rimangono vincolati prima e dopo l’esecuzione. Le funzioni degli oracoli e del confronto geometrico sono byte identiche alla snapshot5405: nessuna asserzione è stata allentata.

Il profilo b963 è positivo per questi sei ID soltanto. Il nuovo rilievo visivo di040 è separato e non viene approvato da questo report; un’eventuale nuova modifica del runtime invaliderà anche il presente replay039 e richiederà un’esecuzione autentica ulteriore.

## Derivazioni e letture per ID


### SIM-C1-L003-01 — Posizione e spostamento

Il via è fissato a 2 m, distinto dall’origine della rotaia. Δx=x_f−2 m: i riferimenti x_f=0 e 5 m danno −2 e +3 m; il trasferimento effettivo a 2 m dà zero. Il dominio −2..6 m con passo mezzo metro richiede soltanto sottrazioni esatte. Una posizione positiva minore di 2 m produce spostamento negativo. Il corpo va disegnato alla coordinata finale, non al valore dello spostamento; la tacca del via resta fissa. Nessun cronometro è previsto per questo confronto di posizioni.

Fonte SHA256 5e2e0856674e2faeab10fb23ec0770bd42268aa694d6e4e8fb43b08c8c9b6b10, versione 1. Confronto attuale: 17 configurazioni di controllo, 0 osservazioni del clock. Le osservazioni ripetute su finestre diverse non sono nuovi ID o altre attività.

### SIM-C1-L003-02 — Traiettoria e legge oraria

Con v₀x=3 m/s, v₀y=10 m/s e g=10 m/s² assegnato, x=3t e y=10t−5t². L’apice è a 1 s e 5 m; il ritorno alla quota di lancio è a 2 s, con gittata 6 m. Il trasferimento a 1,1 s usa 11/10: y=11−121/20=99/20 m=4,95 m. È aritmetica finita, senza trigonometria. La codifica binary64 4,949999999999999 è conformità software allo stesso risultato, non un diverso dato fisico. Clock e corpo condividono t fra 0 e 2 s; scala comune 0,32 per le coordinate, nessuna continuazione dopo il ritorno.

Fonte SHA256 573673a59d997610dad354b2ea255409cbb57936fc7f9bb1ee887f04962dcc2d, versione 1. Confronto attuale: 21 configurazioni di controllo, 63 osservazioni del clock. Le osservazioni ripetute su finestre diverse non sono nuovi ID o altre attività.

### SIM-C1-L003-03 — Velocità media e istantanea

Da s(t)=k t² con k=1 m/s² e t₀=1 s, la secante dà [s(t₀+D)−s(t₀)]/D=k(2t₀+D). I riferimenti D=1 e 2 s danno 3 e 4 m/s; D=7/4 s dà 15/4 m/s=3,75 m/s. D è positivo; il limite per D→0⁺ vale 2 m/s. Nel grafico strumentale il tempo è trascorso dalla prima misura: gli estremi sono (0,1 m) e (D,(1+D)² m). Il carrello animato segue (1+t)², mentre la lettura media resta associata alla finestra D. La quarta lettura è una posizione che cambia, non una velocità media che dovrebbe seguire il clock.

Fonte SHA256 3cff2c0ef18a1f98cd66167f3e25abd99c6aae7b67b244deb1070b9e6d6fb4a7, versione 2. Confronto attuale: 12 configurazioni di controllo, 36 osservazioni del clock. Le osservazioni ripetute su finestre diverse non sono nuovi ID o altre attività.

### SIM-C1-L003-04 — Accelerazione media e istantanea

La legge ora è v(t)=k t² con k=1 m/s³. La stessa algebra produce [v(t₀+D)−v(t₀)]/D=k(2t₀+D), ma le unità sono m/s². I risultati 3, 4 e 15/4 sono quindi accelerazioni. La derivata dà 2 m/s² a 1 s. La posizione integrata è k t³/3 nell’origine scelta; l’animazione usa (1+t)³/3 e la freccia rappresenta velocità proporzionale a (1+t)². La secante nel secondo grafico collega letture di velocità, non di posizione. Non si attribuisce una distanza alla lunghezza della freccia, che ha scala propria.

Fonte SHA256 f475c471a8cf4bb33890a1642ae16f49988d8180d5ade06b1753017e4d1ea4a6, versione 2. Confronto attuale: 12 configurazioni di controllo, 36 osservazioni del clock. Le osservazioni ripetute su finestre diverse non sono nuovi ID o altre attività.

### SIM-C1-L003-05 — Moto rettilineo uniforme

x=−1 m+(2 m/s)t implica velocità costante +2 m/s e accelerazione nulla. A 1 e 3 s le posizioni sono 1 e 5 m; al trasferimento effettivo 5/2 s sono 4 m. Ogni secondo aggiunge 2 m. La posizione iniziale negativa non significa velocità negativa. Il clock copre 0..5 s sulla stessa legge uniforme e la freccia conserva verso positivo.

Fonte SHA256 7ace68920b58c5ec04db0caea277cda7b95574de483c5a072b6976242f9655b6, versione 1. Confronto attuale: 21 configurazioni di controllo, 63 osservazioni del clock. Le osservazioni ripetute su finestre diverse non sono nuovi ID o altre attività.

### SIM-C1-L003-06 — Grafici cinematici e cuspide

x=2t fino a 2 s, poi x=8−2t, in metri. Le due espressioni coincidono a 2 s con x=4 m, ma le derivate laterali sono +2 e −2 m/s: la velocità istantanea unica non esiste alla cuspide. La dicitura Inversione e l’assenza di una freccia di velocità in quell’istante non affermano una derivata nulla. I riferimenti 1 e 3 s danno entrambi 2 m, il trasferimento a 2 s dà 4 m e il ritorno a 4 s dà zero. Il percorso totale è 8 m, la rapidità media 2 m/s, la velocità media zero. La manovra istantanea è dichiarata idealizzazione; il grafico conserva l’angolo, senza smussarlo falsamente.

Fonte SHA256 6787e3a853e7d23107c36e07be2de2a2b948e4b4abb6701cca121e4a644cfa93, versione 2. Confronto attuale: 17 configurazioni di controllo, 51 osservazioni del clock. Le osservazioni ripetute su finestre diverse non sono nuovi ID o altre attività.

## Replay e limiti effettivi

Il nuovo protocollo canonico039 ha eseguito66 casi reali in Chrome nativo e fallback, con SQLite/sessione demo privati e richieste esterne bloccate. Processo realmente terminato con exit0; nessun page error. Le risposte sbagliate sono state rifiutate e i risultati ricavati indipendentemente sono stati accettati. Il campo scientificApproval=false è ora emesso direttamente dal protocollo prima dell’esecuzione, non aggiunto al report dopo il run.

Sono stati confrontati100 valori della griglia e249 campioni temporali con SymPy/Pint/Fraction e geometria indipendente, incluse secanti con origine temporale coerente, intervalli strettamente positivi e cuspide con velocità non definita. Tutte le66 immagini nuove sono state effettivamente guardate nelle sei tavole di contatto, con immagini originali conservate separatamente; sono stati riletti i grafici e le unità. Il controllo riguarda le viste predefinite del protocollo a1280px, non tutte le rotazioni manuali né ogni dispositivo.

I nove test esistenti sono tutti PASS, exit0 in18.468s. Restano le controprove su legge, segni, unità, grafici, componenti dei vettori, clock, provenienza sconosciuta, prova browser alterata, drift del runtime e falsa approvazione umana. Fresh e saved coincidono e soddisfano l’identità del contratto.

Human NOT_RUN; publicationAction NONE; originalEditionRetained true. Nessun file di produzione, candidato, registro o Git ROOT è stato mutato. La presente è rivalidazione degli stessi sei ID, senza nuovo incremento di copertura.

## Impronte correnti

- Runtime: b963060675f372b28d79823f92e3a781b32856779fe1dd6a6fbb3feaba30686f.
- Verifier: 90e5706757c843b240f4664439a46e440fc9177b5b144b121d2a18569778a27f.
- Protocollo: 865cc74dc62bbda08a8b1f1927a826e9b7fec97346ed7263306feb2b3b6b8634.
- Prova browser: d943d2e7fca0deb046f78e4b1bac0870c3431cf7942db9fa195bb1e12865e365.
- Report: 51c9a5140cc7b302a9a32c51ae1dbea0d5be5424f6dfbe247fccea00d59311da.
- Test: 50a496c2c6812ba06d27503f8abee64ac872990913ba5748b2733eba9dc2bda5.
- Trascritto: 3968f86ab9081ab0cc476d86d1b44518c7fd8222dbc452d816e5415c3e25cea4.
