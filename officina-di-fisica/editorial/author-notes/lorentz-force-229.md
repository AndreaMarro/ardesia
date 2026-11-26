# lorentz-force-229 — note dell’autore

Fonte immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605: packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-04.json. Raw SHA256 179bf1cacfb83482e32bb41e99cb78296990faafba1fe9ce3b0e3cbc3a6a09cf. Tutti gli 80 prompt B225–229 letti prima di questi candidati tramite allowlist id/prompt/familyId/lawFamily; nessuna opzione, chiave, soluzione o hint originali. Snapshot allowlist160 SHA256 4aec8d0bacfbd7c9d3b712a5d0d9de7e24a80e66b38bf53ca16cbf484a90f466.

Primarie indipendenti congelate prima delle candidature: propria primaria A220–224 commit 6951ab79682aa638f53cd6e00e5eb14458c63742 SHA 08e1a184ade8bd85a9d6d8f4b919b18105877f0c2007729ba514f0f48f36eb58; primaria del revisore A B225–229 commit 47cb9cbefc0def9db276d2ba106e3f2491b60e7f SHA 1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a. L’autore non ha aperto le risposte della primaria A, né candidati A220–224.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C4.json SHA256 19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c. Rilette le lezioni reali C4-L04 (polarizzazione e cariche legate), C4-L07 (capacità, dielettrici, energia e vincoli collegato/isolato), C4-L09 (prodotto vettoriale e lavoro magnetico nullo); fondazioni C1 e C4 già esistenti. Nessuna competenza inventata.

Stessa pipeline assemble_family/astra1, course C4 e unit u6, ID AR-<sourceId>, reuse C6. DRAFT; revisione scientifica indipendente NOT_RUN, humanApproval NOT_RUN, nessuna pubblicazione. Queste sono soluzioni e note dell’autore, non certificazioni indipendenti.

Tecnico reale: due assembly identici, hash source/candidate/provenance e opzioni letterali distinte; import canonico in SQLite temporaneo con 16 nuove bozze, poi 0 nuove e 16 invariate, 991 pubblicati byte-identici, nessuna nuova testa live. Operazioni sotto flock comune e guardia interna almeno 2 GiB liberi. Nessun registro, ledger, runtime o checkpoint modificato.

Render nativo SVG-only realmente terminato exit0 e immagine completa letta; PNG, risultato geometrico e checksum conservati in author-evidence/lorentz-force-229-asset-only. Non è UI del prodotto: axe, formule e overflow a 320 nel lettore NOT_RUN. Non esistono marker sintetici o nuovi giudizi scientifici ricavati dal render.

Geometria per il revisore, in coordinate intrinseche SVG: Primo pannello: q positiva al punto (300,300), v verso destra, B entrante indicato da croce, F_B verso l’alto; prodotto vettoriale corretto e simbolo di angolo retto. Frecce schematiche di grandezze con unità diverse, nessun confronto quantitativo fra le loro lunghezze. Barre 6/4/5 μN lunghe 300/200/250 dal comune x150, scala 50 coordinate/μN. Retta finale a B=3 mT e q=1 μC da (150,1310) a (470,1130): v=0→2 km/s e F_B=0→6 μN, scale 160 coordinate/(km/s) e 30 coordinate/μN. Origine aperta come limite, fuori dal dominio v>0. Il primo pannello mostra direzioni istantanee e non una traiettoria.

## 01 — I prefissi si compensano

Per velocità perpendicolare al campo, il seno dell’angolo è uno e F_B=|q|vB. Il fattore mille di km/s cancella il millesimo di mT. Con q=1 μC, il prodotto dei numeri 2·3 dà perciò sei μN. La forza è perpendicolare alla velocità: il suo modulo non ne assegna il lavoro.

Passaggi: `F_B=|q|vB\qquad 1\,\mathrm{km/s}=10^3\,\mathrm{m/s}\qquad 1\,\mathrm{mT}=10^{-3}\,\mathrm T\qquad F_B=6\,\mu\mathrm N`

Distrattori: Dodici μN aggiunge un fattore due non previsto. Tre μN trascura il valore numerico della rapidità. Sei N, invece di sei μN, tratterebbe la carica microcoulomb come un coulomb.

## 02 — L’unità della forza magnetica

Una forza ha unità newton. Il tesla è definito in modo che C·(m/s)·T dia N. La provenienza magnetica della forza non ne cambia la dimensione rispetto a una forza meccanica.

Passaggi: `[F_B]=\mathrm{C\cdot(m/s)\cdot T}\qquad [F_B]=\mathrm N`

Distrattori: T misura il campo, C la carica, J il lavoro e V la differenza di potenziale. La forza e il campo non hanno la stessa unità, anche se sono proporzionali a v e q fissati.

## 03 — Una forza che cambia la direzione

La forza q(vettore v × vettore B) è ortogonale alla velocità, perciò la potenza istantanea è nulla. L’energia cinetica e il modulo della velocità restano costanti. La direzione può cambiare: con componente perpendicolare al campo il moto curva, mentre una componente parallela resta invariata.

Passaggi: `\vec F_B\cdot\vec v=0\qquad \frac{dK}{dt}=0\qquad |\vec v|=\text{costante}`

Distrattori: Il vettore velocità non è in generale costante perché la forza lo devia. Posizione e accelerazione vettoriale non sono invarianti generali. Il caso particolare v parallela a B non autorizza a estendere una traiettoria rettilinea a tutti gli ingressi.

## 04 — Una rapidità dimezzata

A carica, campo e angolo fissati, il modulo magnetico è lineare nella rapidità. Dimezzare v dimezza F_B da sei a tre μN. Non è il quadrato di v che entra nella legge di Lorentz, anche se compare in un’espressione centripeta con r da determinare.

Passaggi: `F_{B,A}=6\,\mu\mathrm N\qquad F_{B,2}=3\,\mu\mathrm N\qquad F_{B,2}/F_{B,A}=\frac12`

Distrattori: Dodici μN inverte la proporzionalità. 3/2 μN usa un quadrato improprio. Zero richiederebbe v nulla oppure v parallela al campo, nessuna delle due condizioni dichiarata.

## 05 — Isolare la rapidità

L’inversa fisica è v=F_B/(|q|B). Con la carica fissata, la combinazione delle unità dichiarate rende il valore numerico v=6/3=2 km/s. I fattori micro non si cancellano da soli senza considerare anche il millesimo di tesla.

Passaggi: `v=\frac{F_B}{|q|B}\qquad v=2\,\mathrm{km/s}`

Distrattori: Diciotto moltiplica i numeri di forza e campo; un mezzo ne prende il rapporto inverso. Sei copia la forza come una velocità senza dividere per il campo.

## 06 — Ricostruire il campo magnetico

Ricavo B=F_B/(|q|v). Nelle unità assegnate il valore numerico è 6/2=3 mT. Il campo ricavato è positivo perché si è misurato un modulo e l’angolo retto è noto; la sola misura del modulo non ne determina il verso nello spazio.

Passaggi: `B=\frac{F_B}{|q|v}\qquad B=3\,\mathrm{mT}`

Distrattori: Dodici moltiplica forza e rapidità, 1/3 inverte il rapporto corretto. Sei copia la forza senza normalizzarla. Un segno negativo non si deduce dal modulo F_B misurato.

## 07 — Un campo tre volte minore

Le forze hanno moduli sei e due μN. Il rapporto è 1/3, uguale al rapporto dei campi. La carica e la rapidità non cambiano, e la velocità resta perpendicolare al campo in entrambe le prove.

Passaggi: `F_{B,A}=6\,\mu\mathrm N\qquad F_{B,2}=2\,\mu\mathrm N\qquad F_{B,2}/F_{B,A}=\frac13`

Distrattori: Tre inverte il confronto. Un nono e nove importano un quadrato assente; uno ignora la riduzione del campo.

## 08 — Scarto con segno della proposta

Il modulo corretto è 6 μN. La proposta supera il risultato di 12−6=6 μN. Il fatto che la forza sia perpendicolare al moto non rende nullo il suo modulo né questo scarto.

Passaggi: `F_B=6\,\mu\mathrm N\qquad \delta F=(12-6)\,\mu\mathrm N\qquad \delta F=6\,\mu\mathrm N`

Distrattori: −6 μN cambia l’ordine. Due è il rapporto puro, dodici copia la proposta e zero confonde lavoro magnetico nullo con forza nulla.

## 09 — L’inversa simbolica non perde q

Divido F_B=|q|vB per i due fattori positivi noti. v=F_B/(|q|B) ha unità m/s. Il modulo di q evita di attribuire alla rapidità un segno: per una carica negativa cambierebbe il verso della forza, non questa legge del modulo.

Passaggi: `F_B=|q|vB\qquad v=\frac{F_B}{|q|B}\qquad [v]=\mathrm{m/s}`

Distrattori: L’inverso ha dimensione di rapidità inversa. Moltiplicare per B o elevarlo al quadrato modifica le dimensioni. F_B/B omette q e ha unità C·m/s, non m/s.

## 10 — Fattori su rapidità e campo

Sostituendo nella legge del modulo, i due fattori si moltiplicano. La carica fissata e il seno uguale a uno si cancellano nel rapporto. Il verso vettoriale richiederebbe anche le direzioni dei campi e delle velocità, qui non richieste dal confronto dei moduli.

Passaggi: `F_{B,2}=|q|(\kappa_1v_A)(\kappa_2B_A)\qquad F_{B,2}/F_{B,A}=\kappa_1\kappa_2`

Distrattori: I quozienti rendono inversa una dipendenza diretta. Il quadrato di κ₁ non appartiene alla legge; la somma darebbe due per prove identiche.

## 11 — Rapidità minore, campo maggiore

Il primo modulo è 6 μN, il secondo 4 μN. Il rapporto vale 2/3: il fattore 1/2 della rapidità moltiplica 4/3 del campo. Il maggiore campo non compensa completamente la riduzione di v.

Passaggi: `F_{B,A}=6\,\mu\mathrm N\qquad F_{B,2}=4\,\mu\mathrm N\qquad F_{B,2}/F_{B,A}=\frac23`

Distrattori: 3/2 inverte il rapporto, 1/2 segue soltanto la rapidità e 4/3 soltanto il campo. Uno imporrebbe una compensazione esatta non presente nei dati.

## 12 — Media di due moduli magnetici

I due moduli sono 6 e 4 μN: la loro media è 5 μN. Ai valori medi v=3/2 km/s e B=7/2 mT si otterrebbero invece 21/4 μN. La differenza è −1/4 μN; una legge bilineare non commuta in generale con la media degli ingressi.

Passaggi: `\overline F_B=\frac{6+4}{2}\,\mu\mathrm N\qquad \overline F_B=5\,\mu\mathrm N\qquad F_{B,\rm dati\ medi}=\frac{21}{4}\,\mu\mathrm N`

Distrattori: 21/4 μN usa gli ingressi medi; dieci μN somma senza dimezzare. Un μN è la semidifferenza e zero confonde media dei moduli con possibile cancellazione di vettori diversi.

## 13 — Il campo necessario a un bersaglio

Il bersaglio è 4 μN. Con v=1 km/s serve B_2=4 mT. Il fattore rispetto ai 3 mT iniziali è 4/3. Il fattore della forza non coincide con quello del campo perché cambia anche la rapidità.

Passaggi: `F_{B,2}=4\,\mu\mathrm N\qquad B_2=4\,\mathrm{mT}\qquad B_2/B_A=\frac43`

Distrattori: 3/4 inverte il confronto. Due terzi copia il bersaglio della forza e un mezzo segue solo v. Due darebbe B_2=6 mT e forza 6 μN, non quattro.

## 14 — Taratura proporzionale del sensore

Il riferimento vale 6 μN, perciò a_cal=3 μN⁻¹. La lettura dodici indica un modulo di 4 μN. Con q e le unità dichiarate, v=4/4=1 km/s. La lettura non misura direttamente la rapidità.

Passaggi: `a_{\rm cal}=3\,(\mu\mathrm N)^{-1}\qquad F_B=4\,\mu\mathrm N\qquad v=1\,\mathrm{km/s}`

Distrattori: Tre km/s tratta D=12 come dodici μN. Quattro km/s copia il modulo della forza; 1/4 km/s darebbe una forza di 1 μN e lettura tre.

## 15 — Guadagno e offset prima della rapidità

I riferimenti hanno moduli 6 e 4 μN: a_cal=(13−9)/(6−4)=2 μN⁻¹, b_cal=1. La nuova forza è (41−1)/2=20 μN. Dividendo il valore numerico per B=5 mT si ottiene v=4 km/s.

Passaggi: `a_{\rm cal}=2\,(\mu\mathrm N)^{-1}\qquad b_{\rm cal}=1\qquad F_B=20\,\mu\mathrm N\qquad v=4\,\mathrm{km/s}`

Distrattori: 41/10 km/s omette l’offset e predirebbe D=42. Otto km/s sottrae b ma salta il guadagno. Venti km/s copia il numero della forza senza dividerlo per il campo.

## 16 — Il vincolo seleziona un campo positivo

Pongo β=B/(1 mT)>0. Il vincolo dà v/(1 km/s)=(2/3)β, quindi F_B/(1 μN)=(2/3)β². Il valore sei impone β²=9; scelgo β=3 perché si cerca il modulo positivo del campo. La rapidità è allora 2 km/s.

Passaggi: `\beta=\frac{B}{1\,\mathrm{mT}}\qquad \beta^2=9\qquad B=3\,\mathrm{mT}\qquad v=2\,\mathrm{km/s}`

Distrattori: −3 è la radice algebrica esclusa dai moduli positivi e dal vincolo sulla rapidità. Nove omette la radice, due copia v. Non restano infinite coppie dopo la misura del quadrato.
