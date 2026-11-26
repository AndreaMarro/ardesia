# connected-plate-separation-charge-228 — note dell’autore

Fonte immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605: packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-04.json. Raw SHA256 179bf1cacfb83482e32bb41e99cb78296990faafba1fe9ce3b0e3cbc3a6a09cf. Tutti gli 80 prompt B225–229 letti prima di questi candidati tramite allowlist id/prompt/familyId/lawFamily; nessuna opzione, chiave, soluzione o hint originali. Snapshot allowlist160 SHA256 4aec8d0bacfbd7c9d3b712a5d0d9de7e24a80e66b38bf53ca16cbf484a90f466.

Primarie indipendenti congelate prima delle candidature: propria primaria A220–224 commit 6951ab79682aa638f53cd6e00e5eb14458c63742 SHA 08e1a184ade8bd85a9d6d8f4b919b18105877f0c2007729ba514f0f48f36eb58; primaria del revisore A B225–229 commit 47cb9cbefc0def9db276d2ba106e3f2491b60e7f SHA 1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a. L’autore non ha aperto le risposte della primaria A, né candidati A220–224.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C4.json SHA256 19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c. Rilette le lezioni reali C4-L04 (polarizzazione e cariche legate), C4-L07 (capacità, dielettrici, energia e vincoli collegato/isolato), C4-L09 (prodotto vettoriale e lavoro magnetico nullo); fondazioni C1 e C4 già esistenti. Nessuna competenza inventata.

Stessa pipeline assemble_family/astra1, course C4 e unit u6, ID AR-<sourceId>, reuse C6. DRAFT; revisione scientifica indipendente NOT_RUN, humanApproval NOT_RUN, nessuna pubblicazione. Queste sono soluzioni e note dell’autore, non certificazioni indipendenti.

Tecnico reale: due assembly identici, hash source/candidate/provenance e opzioni letterali distinte; import canonico in SQLite temporaneo con 16 nuove bozze, poi 0 nuove e 16 invariate, 991 pubblicati byte-identici, nessuna nuova testa live. Operazioni sotto flock comune e guardia interna almeno 2 GiB liberi. Nessun registro, ledger, runtime o checkpoint modificato.

Render nativo SVG-only realmente terminato exit0 e immagine completa letta; PNG, risultato geometrico e checksum conservati in author-evidence/connected-plate-separation-charge-228-asset-only. Non è UI del prodotto: axe, formule e overflow a 320 nel lettore NOT_RUN. Non esistono marker sintetici o nuovi giudizi scientifici ricavati dal render.

Geometria per il revisore, in coordinate intrinseche SVG: Due stati della stessa trasformazione con generatore a 2 V, piastre a carica libera iniziale 12 μC e finale 6 μC. Facce interne a 110/160 e 380/480: distanze 50 e 100 in rapporto due; dimensioni laterali schematiche. Poli positivi dei generatori collegati alle armature positive. Barre A 6 μC, B 3 μC e media 9/2 μC da x150, lunghezze 240/120/180 e scala 40 coordinate/μC. Terzo pannello: solo Q₀=12 μC, assi con origine (150,1320), punti esatti (s,Q)=(1,12),(2,6),(3,4) alle coordinate (250,1080),(350,1200),(450,1240). Scale 100 coordinate per unità di s e 20 coordinate/μC, punti distinti senza interpolazione lineare. V_g è costante entro una prova, non imposta uguale fra tutte le preparazioni con Q₀ differente.

## 01 — Il generatore mantiene V, non Q

La capacità passa da C₀ a C₀/s. Poiché il generatore mantiene V_g, Q=CV_g=(C₀V_g)/s=Q₀/s. La distanza doppia dimezza il modulo della carica: Q=6 μC. Il circuito collegato permette il ritorno di carica al generatore.

Passaggi: `C=C_0/s\qquad Q=CV_g\qquad Q=Q_0/s\qquad Q=6\,\mu\mathrm C`

Distrattori: Ventiquattro μC moltiplica per s. Dodici μC imporrebbe isolamento delle armature, assente qui. Tre μC dividerebbe due volte per s invece di una.

## 02 — Un modulo di carica

Q ha unità coulomb. Il fattore geometrico s=d/d₀ è puro, quindi Q₀/s conserva l’unità della carica iniziale. Un microcoulomb è un milionesimo di coulomb.

Passaggi: `[s]=1\qquad [Q]=[Q_0]=\mathrm C`

Distrattori: F è capacità, V differenza di potenziale, J energia e A corrente. La carica non è una corrente senza specificare anche un intervallo temporale.

## 03 — La legge con generatore collegato

La geometria impone C/C₀=1/s. A tensione mantenuta Q/Q₀=C/C₀, quindi Q=Q₀/s. La stessa separazione con generatore scollegato avrebbe invece Q invariata: la geometria da sola non decide il vincolo elettrico.

Passaggi: `\frac{Q}{Q_0}=\frac{C}{C_0}\qquad \frac{C}{C_0}=\frac1s\qquad Q=Q_0/s`

Distrattori: sQ₀ invertirebbe la dipendenza dalla distanza. Q=Q₀ imporrebbe un altro circuito; i quadrati non derivano dalla legge C=εA/d a tensione fissa.

## 04 — Preparazione con carica iniziale minore

In ogni prova la tensione del proprio generatore resta costante durante l’allontanamento. A dà 12/2=6 μC; B dà 1/2 μC. Si confrontano preparazioni iniziali distinte, senza imporre la stessa capacità o tensione iniziale fra le prove oltre ai dati dichiarati.

Passaggi: `Q_A=6\,\mu\mathrm C\qquad Q_B=\frac12\,\mu\mathrm C\qquad Q_B/Q_A=\frac1{12}`

Distrattori: Due μC moltiplicherebbe il nuovo Q₀ per s. Un μC ignorerebbe l’allontanamento; sei μC copierebbe l’uscita A. Dodici μC non segue il nuovo stato iniziale.

## 05 — Ricostruire la carica prima dell’allontanamento

Moltiplico Q=Q₀/s per s. La carica iniziale era Q₀=sQ=12 μC. Con s≥1 deve essere almeno pari al modulo finale, perché la capacità diminuisce durante l’allontanamento a tensione mantenuta.

Passaggi: `Q_0=sQ\qquad Q_0=12\,\mu\mathrm C`

Distrattori: Tre μC ripete la divisione per s anziché invertirla. Sei μC trascura la variazione geometrica; ventiquattro μC darebbe Q=12 μC, non sei.

## 06 — Dalle cariche al fattore di distanza

L’inversa s=Q₀/Q confronta due moduli di carica. Il rapporto vale due e non ha unità. Un valore minore di uno descriverebbe avvicinamento, fuori dal dominio dell’allontanamento dichiarato.

Passaggi: `s=\frac{Q_0}{Q}\qquad s=2\qquad d=2d_0`

Distrattori: Un mezzo scambia finale e iniziale. Sei copia un numero con unità di carica; settantadue moltiplica due cariche invece di formare un rapporto.

## 07 — Confrontare s uguale a due e a uno

A termina a 6 μC. B non cambia la distanza e rimane a 12 μC. Quindi Q_B/Q_A=2. Non aver variato la geometria non significa avere carica finale nulla.

Passaggi: `Q_A=6\,\mu\mathrm C\qquad Q_B=12\,\mu\mathrm C\qquad Q_B/Q_A=2`

Distrattori: Un mezzo inverte il confronto. Uno ignora i diversi s; quattro usa un quadrato non previsto. Zero confonde variazione nulla di Q con modulo Q nullo.

## 08 — Lo scarto della proposta

La carica corretta è 6 μC. Lo scarto richiesto è 12−6=+6 μC. La carica netta del condensatore completo resta nulla, ma non è la quantità proposta o richiesta.

Passaggi: `Q=6\,\mu\mathrm C\qquad \delta Q=(12-6)\,\mu\mathrm C\qquad \delta Q=6\,\mu\mathrm C`

Distrattori: −6 μC inverte l’ordine; dodici copia la proposta. Due puro è un rapporto e zero sostituisce alla carica su un’armatura quella netta delle due armature.

## 09 — Un’inversa con fattore geometrico

Nella legge Q=Q₀/s la carica iniziale è divisa per il fattore positivo s. Moltiplicando entrambi i membri per s si ricava Q₀=sQ. Il risultato ha unità di carica, perché s è adimensionale.

Passaggi: `Q=\frac{Q_0}{s}\qquad Q_0=sQ\qquad Q_0\ge Q>0`

Distrattori: Q/s applica ancora la trasformazione diretta. s/Q è una carica inversa, s²Q inserisce una potenza aggiuntiva e Q−s sottrae quantità di dimensioni differenti.

## 10 — Due fattori fra prove

Sostituisco nella legge di ciascuna prova: Q_B=κ₁Q₀,A/(κ₂s_A). Il rapporto delle uscite è κ₁/κ₂. La maggiore separazione relativa riduce la carica finale a parità della preparazione iniziale.

Passaggi: `Q_B=\frac{\kappa_1Q_{0,A}}{\kappa_2s_A}\qquad Q_B/Q_A=\kappa_1/\kappa_2`

Distrattori: Il prodotto rende diretto l’effetto di s. L’inverso scambia i ruoli dei due ingressi; il quadrato non compare nella legge. La somma fallisce già per due fattori unitari.

## 11 — Cambiano entrambi gli ingressi

Le uscite sono Q_A=6 μC e Q_B=3 μC. Il rapporto B/A vale 1/2. Il fattore 3/4 della carica iniziale va diviso per il fattore 3/2 della separazione.

Passaggi: `Q_A=6\,\mu\mathrm C\qquad Q_B=3\,\mu\mathrm C\qquad Q_B/Q_A=\frac12`

Distrattori: Due inverte il confronto, 3/4 considera soltanto Q₀ e 3/2 copia il fattore della separazione. Uno non descrive la combinazione dei due cambiamenti.

## 12 — Due uscite positive da mediare

La media di 6 e 3 μC è 9/2 μC. Gli ingressi medi Q₀=21/2 μC e s=5/2 darebbero invece 21/5 μC, non la media richiesta. La differenza fra queste due operazioni è 3/10 μC.

Passaggi: `\overline Q=\frac{6+3}{2}\,\mu\mathrm C\qquad \overline Q=\frac92\,\mu\mathrm C\qquad Q_{\rm dati\ medi}=\frac{21}{5}\,\mu\mathrm C`

Distrattori: 21/5 μC applica il modello alle medie degli ingressi. Nove somma le uscite; 3/2 è la semidifferenza. Zero fa la somma algebrica delle armature, non la media dei moduli.

## 13 — Separazione relativa per una carica bersaglio

Il bersaglio è Q_B=3 μC. La legge inversa impone s_B=Q₀,B/Q_B=9/3=3. Il rapporto cercato rispetto a s_A=2 è 3/2; non coincide con il fattore della carica finale.

Passaggi: `Q_B=3\,\mu\mathrm C\qquad s_B=3\qquad s_B/s_A=\frac32`

Distrattori: 2/3 inverte il confronto, un mezzo copia il bersaglio della carica e 3/4 segue solo la preparazione iniziale. Due darebbe s_B=4 e Q_B=9/4 μC.

## 14 — Leggere Q e ritrovare Q₀

La carica finale del riferimento è 6 μC e il guadagno vale 3 μC⁻¹. D_B=9 indica Q_B=3 μC. Moltiplicando per s_B=3 ricavo Q₀,B=9 μC.

Passaggi: `a_{\rm cal}=3\,(\mu\mathrm C)^{-1}\qquad Q_B=3\,\mu\mathrm C\qquad Q_{0,B}=9\,\mu\mathrm C`

Distrattori: Ventisette μC tratterebbe D=9 come una carica. Un μC dividerebbe Q_B per s invece di ricostruire Q₀. Tre μC copia la carica dopo l’allontanamento.

## 15 — Rimuovere l’offset prima del vincolo fisico

Le cariche finali di riferimento sono 6 e 3 μC. La pendenza è 2 μC⁻¹ e l’offset uno. La lettura cinque decodifica Q_C=(5−1)/2=2 μC; la carica prima dell’allontanamento era Q₀,C=4·2=8 μC.

Passaggi: `a_{\rm cal}=2\,(\mu\mathrm C)^{-1}\qquad b_{\rm cal}=1\qquad Q_C=2\,\mu\mathrm C\qquad Q_{0,C}=8\,\mu\mathrm C`

Distrattori: Dieci μC omette l’offset e predice D=6. Sedici μC sottrae b ma non divide per a. Due μC si ferma al valore finale senza risalire a Q₀.

## 16 — Un’intera famiglia di preparazioni

Il vincolo sostituito nella legge dà Q=(6 μC)s/s=6 μC. La misura ripete il vincolo, perciò non determina s. Restano infinite coppie continue con s≥1 che rispettino anche il regime di piastre grandi; per esempio s=1 e s=2 richiedono Q₀=6 e 12 μC.

Passaggi: `Q=\frac{(6\,\mu\mathrm C)s}{s}\qquad Q=6\,\mu\mathrm C\qquad s\ge1`

Distrattori: Non esiste una radice da scegliere perché la variabile si cancella. s è un rapporto di distanze, non un conteggio intero. Scegliere due senza un ulteriore dato sarebbe arbitrario.
