# Authoring DRAFT — gas-density-150

Tutti i 16 prompt originali di questa famiglia U5-01 letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605 prima della riscrittura. Le consegne sono autonome e le unità dichiarate; risultati esatti e procedure manuali esplicite, con scale, rapporti e coefficienti dichiarati. Lezioni reali C3-L01/L02/L06/L07 rilette; corso C3 e competenze esistenti, nessun ID inventato.

Autore soltanto. Review scientifica indipendente NOT_RUN, human NOT_RUN, publication DRAFT/NONE. Le note di calcolo seguenti aiutano il revisore e non costituiscono un oracolo indipendente o un’autofirma.

Controlli tecnici: due assembly identiche sui record e sui binding; importatore canonico ROOT con package assoluto A in SQLite temporaneo, 16 nuovi poi 0 nuovi/16 invariati. Tutti i 991 pubblicati, live heads e versioni storiche conservati. SVG XML e rendering completo letti dall’autore. Snapshot privata del runtime ROOT con fingerprint 54054f7ac463ef52f7c4c881d50ee071713315d891812696f18e39d9ad45ab3d identica prima del run; medesimo harness b77d90368c3fa4d7fee43db65b402804615e0ba353f6514d699864e2cbd46372: 48/48 anteprime con exit 0, nessuna violazione di overflow, formule o axe. Questo non sostituisce il replay dell’integratore né certifica l’esperienza umana o l’apprendimento. Nessun registro o codice prodotto modificato.

## AR-u5-gas-density-01 — La massa distribuita nel volume

Il rapporto M/R vale numericamente quattro con le unità indicate. Quattro per ottanta diviso trecentoventi dà uno g/L. Le moli si cancellano fra massa molare e quantità di sostanza per volume. Lo stesso risultato è uno kg/m³, perché un grammo e un litro portano entrambi il fattore un millesimo rispetto a kg e m³.

Controllo didattico d’autore: Un quarto dimentica M/R=4. Quattro segue soltanto il coefficiente, ottanta copia la pressione. Mille g/L inserirebbe un fattore mille non necessario: i prefissi sono già coerenti con kPa·L=J.

Source SHA256 05db2c311c0d1d51235b7f32f53975e33acf2c6f01ceb75fdc4ef818926e8b99; candidato SHA256 50dce880c3a3f47ca897bc54305d772ababff03f2fd5a987bed67fd1fdcf5f2c. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-gas-density-02 — L’unità della densità di massa

La densità è massa divisa per volume. g/L è quindi adatta e corrisponde dimensionalmente a kg/m³. La densità molare n/V è invece una quantità di sostanza per volume: mol/L non è una densità di massa finché non viene moltiplicata per M.

Controllo didattico d’autore: g·L moltiplica anziché dividere per il volume; g è soltanto massa. mol/L conta moli, K temperatura. La stessa parola densità deve sempre essere accompagnata dalla grandezza che viene distribuita.

Source SHA256 96dc4f910d7a563d7b7943b7ebaac8b0381e2e743c95a8a48705d0033ef4644a; candidato SHA256 b32c2bf5a397d9b5a652219126eff074c39d027f865d1d143c35d85e6615d418. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-gas-density-03 — Dalle moli alla densità

L’equazione di stato fornisce n/V=p/(RT). Moltiplicando per M si converte il numero di moli per volume nella massa per volume: ρ=(n/V)M=pM/(RT). La temperatura è al denominatore e la massa molare al numeratore.

Controllo didattico d’autore: Scambiare M e R perde la conversione moli→massa. RT/(pM) è il reciproco della densità. T al numeratore inverte la dipendenza termica, mentre dividere ancora per M produce la conversione opposta a quella necessaria.

Source SHA256 8dfdb75b97478db64b49bb898b324a4e754c1ed75abc2d252550d757c5d246e5; candidato SHA256 1b263a2c857f6582a37f97b6c8f72c915bdeb0c3947f0bbd2543a32dc8ed2323. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-gas-density-04 — Pressione doppia, stessa temperatura

A temperatura e composizione fissate la densità è direttamente proporzionale alla pressione. Il quoziente p/T raddoppia e la densità passa da uno a due g/L. Il confronto può descrivere stati dello stesso campione a volume diverso, senza cambiare M.

Controllo didattico d’autore: Quattro quadra il fattore di pressione, un mezzo ne inverte l’effetto. Centosessanta copia p e uno ignora la variazione. La legge non richiede che la massa totale del recipiente raddoppi.

Source SHA256 51170f91fdf8d34c8499e898d9313ed7e3d50bf29a8a72d02cb3b482d089b718; candidato SHA256 f6d27bb17741675fe69854d62a34594908621cdd99bfcbb93814ab4c0ff17891. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-gas-density-05 — La pressione dalla densità

Isoliamo p=ρRT/M. Con M/R numericamente quattro nelle unità date, p ha valore numerico ρT/4. Uno per trecentoventi diviso quattro dà ottanta kPa. La moltiplicazione inversa 4·80/320 restituisce la densità misurata.

Controllo didattico d’autore: Milleduecentottanta moltiplica per quattro invece di dividere. Trecentoventi perde M/R; un ottantesimo inverte il quoziente. La pressione è assoluta, perché tale è p nell’equazione di stato.

Source SHA256 31fe95959d9c6ab8877c703ed3b8e94a69db4ddcdd756db2bcd4f4200da20679; candidato SHA256 daf64dc0fe366b54b616cfb17c17cc90d6e0c22766b01dfc39d4210c59d2c2e0. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-gas-density-06 — La temperatura assoluta dalla densità

Dalla legge generale T=pM/(Rρ). Nelle unità assegnate il numero è 4·80/1=320. Si ottengono kelvin, non gradi Celsius: la conversione a una lettura Celsius sarebbe un’operazione successiva e non richiesta.

Controllo didattico d’autore: Ottanta omette il fattore quattro e uno copia la densità. Trecentoventi °C non rappresenta questa T. Nel dominio positivo l’inversa è lecita perché ρ non è zero.

Source SHA256 933ab77ff784da3cf2f1784485b9380d06c30cfd1d29006f822d7d9147890f22; candidato SHA256 ccad4bcfa551d3cb088415deb42d53d157e1011facb2e6a9eca9f2b9f15803ca. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-gas-density-07 — Raffreddare alla stessa pressione

La temperatura assoluta si dimezza. A pressione fissata il numero di moli per volume e la densità raddoppiano: A vale uno g/L, B due g/L. È una dipendenza inversa da T, non una proporzione con le letture Celsius.

Controllo didattico d’autore: Un mezzo segue T direttamente, quattro aggiunge un quadrato e uno ignora il raffreddamento. Un quarto combina entrambe le inversioni errate. Non serve cambiare massa molare per ottenere la nuova densità.

Source SHA256 4071e047589db94cff9ecea843003afe3c1a3b6199f92b7ac00303cda4fbae5f; candidato SHA256 2be5d40ba70dd5779928a7c45d2bbcd7927e19a3d963e2a95b7fb4c723487ae4. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-gas-density-08 — Una legge microscopica fornita, altro quesito

La stessa costante (3/2)k_B moltiplica entrambe le temperature e si cancella nel rapporto. Rimane 900/300=3. Si sta confrontando l’energia cinetica media traslazionale per molecola, non la densità, il calore scambiato o l’intera energia interna di una molecola con eventuali moti interni.

Controllo didattico d’autore: Nove quadra un rapporto già lineare; √3 riguarderebbe una scala di velocità quadratica media, non l’energia. Un terzo inverte le prove e uno ignora la crescita termica. La legge necessaria è fornita, senza richiedere una nuova formula da memorizzare.

Source SHA256 19e9fa660bdd125d63d6d561f468f6604cfe294bedbaa912d3defdf6f0827015; candidato SHA256 195cc9a9da432cb7e455c95aa55532ab90ad7efd497052ac5fa4519493b06b4f. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-gas-density-09 — L’inversa generale per p

Moltiplichiamo ρ=pM/(RT) per RT e dividiamo per M. Si ricava p=ρRT/M. Con ρ in g/L, R in kPa·L/(mol·K), T in K e M in g/mol, si cancellano grammi, litri, kelvin e moli, lasciando kPa.

Controllo didattico d’autore: ρM/(RT) riapplica il fattore della legge diretta anziché invertirlo. I reciproci rendono inversa la dipendenza dalla densità; T al denominatore contraddice l’inversa. Le dimensioni eliminano questi candidati prima ancora dei numeri.

Source SHA256 b7d8ce60775b15bd3b59d07d0285d87b2f20bd7acbdb0e7b8ad64ce2c05f51c9; candidato SHA256 5c410beb3eae1d4d18265560bc9e7b7e3e7a6c9028090f48116c6fb977b17636. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-gas-density-10 — Due fattori nello stato del gas

M e R si cancellano perché si confronta lo stesso gas nello stesso modello. La pressione porta κ₁ direttamente, la temperatura assoluta porta κ₂ al denominatore. Il rapporto è κ₁/κ₂, puro.

Controllo didattico d’autore: Prodotto rende T diretta, quoziente inverso scambia stati, quadrato aggiunge un esponente e somma dà due per stati identici. Un cambiamento di specie altererebbe M e non è compreso in queste ipotesi.

Source SHA256 9ccb22ddf0e1bb66f4ff123d336f998227887a7ca1d49b58cecc244dded62338; candidato SHA256 883b63c6aad532e4eba433c5c4d50e05a30cd971f6dccae247564a6075086f76. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-gas-density-11 — Compressione e raffreddamento nei dati

La pressione raddoppia e la temperatura si dimezza: i due effetti aumentano entrambi la densità. A vale uno g/L, B vale quattro g/L, quindi il rapporto è quattro. È il prodotto del due della pressione e del due dovuto all’inverso della temperatura.

Controllo didattico d’autore: Due considera un effetto soltanto; un mezzo segue solo T e un quarto inverte il rapporto completo. Uno farebbe cancellare due dipendenze che qui agiscono nello stesso verso.

Source SHA256 a5acc5610ca0164db25584a7d208a80ddb0266d83f4dd7d015e005e8df365bd7; candidato SHA256 6fe454b9edbf82e3ca9b23ef7ce465a1ba3c8616e3ab15d65c13b532349b3318. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-gas-density-12 — Media di due densità

Le densità uno e quattro g/L hanno semisomma cinque mezzi g/L. Usare prima p medio 120 kPa e T media 240 K darebbe invece due g/L. La risposta del quoziente agli ingressi medi è più bassa di mezzo g/L rispetto alla media delle due densità.

Controllo didattico d’autore: Cinque è la somma, tre mezzi la semidifferenza e quattro la sola B. Due è la densità dello stato con ingressi medi, non la media richiesta. Non si suppone un esperimento di mescolamento dei due campioni.

Source SHA256 0f422de95e481525ed2c5ace6df26ff7efb805cda1d8ea0acd212d7aa82643c1; candidato SHA256 07b5f7cbd7446650cf4d4d359d33361fa4e65c41627a03b63f51bc9e14408c7d. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-gas-density-13 — Temperatura richiesta da un bersaglio

La densità target è quattro g/L. Con pressione centosessanta kPa, T_B ha valore 4·160/4=160 K. Il rapporto con 320 K è un mezzo. Il fattore due di pressione deve essere accompagnato da un ulteriore fattore due nell’inverso della temperatura.

Controllo didattico d’autore: Due inverte il rapporto, quattro copia il target e un quarto ignora la pressione raddoppiata. Uno darebbe solo un raddoppio della densità. I due valori della temperatura sono assoluti.

Source SHA256 cbe7f744d5a785cbabdf17912387866c69b3748f89a4bb8cb6f2c519f8e3c936; candidato SHA256 6149003496c269301f5dfb58916e258815f78b8fabf8df51e633bb9d671093eb. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-gas-density-14 — Un display della densità

Il riferimento ha densità uno g/L, perciò q=3 L/g. La lettura dodici dà quattro g/L. Applicando l’inversa p=ρRT/M si trova il numero 4·160/4=160 kPa. La lettura numerica del display non è una densità senza la taratura.

Controllo didattico d’autore: Quattrocentottanta usa S=12 come densità al posto di quattro. Quattro è soltanto il numero di ρ_B e ottanta ripete la pressione iniziale. Il guadagno ha unità di volume su massa.

Source SHA256 d624d29db93a3b32c6c6980467c10665e9075b8f236332682be02315d9d5fc66; candidato SHA256 7a1b49a507bb48061f127b303bcc246e1791733617fdd9db7dd60179f2477f61. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-gas-density-15 — Guadagno, offset e pressione

I riferimenti hanno densità uno e quattro g/L. La differenza sei delle letture divisa per tre g/L dà q=2 L/g; b=1. C ha densità (5−1)/2=2 g/L. Con T=320 K, l’inversa dà p_C=2·320/4=160 kPa.

Controllo didattico d’autore: Ottanta ignora la densità maggiore; trecentoventi copia la temperatura numerica. Duecento dimentica b e usa ρ=5/2; quattrocento usa S=5 come densità. Solo centosessanta ricostruisce S=2·2+1=5.

Source SHA256 fe7cbca41c067c3ac33edce8d979803d0bc195f56e259810564a98e71682fe95; candidato SHA256 ddfc6d9b0959896ec1300c116cdf29264b99d2662910e5fd5235fb4e6274068a. Nessun giudizio scientifico indipendente attribuito all’autore.

## AR-u5-gas-density-16 — Il vincolo lascia libera la scala

Sostituendo p=kT si ottiene ρ=kM/R: T si cancella. Nelle unità dichiarate il numero è quattro per un quarto, uno g/L. La misura ripete quindi il vincolo di stato. Per esempio 80 kPa con 320 K e 100 kPa con 400 K sono due fra le infinite coppie del modello.

Controllo didattico d’autore: Una sola coppia confonde una relazione ridondante con una misura di scala. Due esempi non esauriscono le soluzioni; la coppia nulla viola i denominatori positivi. Il coefficiente k porta unità kPa/K e non è una costante pura.

Source SHA256 590a0723626cdd51ffc071a180b4abc1134cf2cb706806ce23214cc7386c3a61; candidato SHA256 bde8aad2b8ad6a3ef7b7ba99871fb7cbbe14bee0653f8edf9d941df796362e9d. Nessun giudizio scientifico indipendente attribuito all’autore.

## Scelte specifiche del modello

R=8 J/(mol·K) è l’approssimazione prescritta, non una nuova costante esatta. M=32 g/mol resta invariata: usando p in kPa e V in L si ottiene direttamente ρ in g/L; 1 g/L=1 kg/m³ perché i due fattori mille si cancellano. Le temperature dei rapporti sono assolute. Il caso 08 è separato: la legge dell’energia traslazionale media per molecola è fornita esplicitamente e non richiede di ricavare una capacità termica totale o di ricordare una formula assente dalla lezione. Le ultime barre SVG rappresentano solo quel rapporto energetico, con una scala diversa dalle barre di densità. Nel 12 la media dei risultati è distinta dal modello sugli ingressi medi; nel 16 la misura fissa il rapporto p/T ma non la scala comune degli stati.
