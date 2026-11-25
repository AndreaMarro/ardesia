# dielectric-connected-charge-226 — note dell’autore

Fonte immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605: packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-04.json. Raw SHA256 179bf1cacfb83482e32bb41e99cb78296990faafba1fe9ce3b0e3cbc3a6a09cf. Tutti gli 80 prompt B225–229 letti prima di questi candidati tramite allowlist id/prompt/familyId/lawFamily; nessuna opzione, chiave, soluzione o hint originali. Snapshot allowlist160 SHA256 4aec8d0bacfbd7c9d3b712a5d0d9de7e24a80e66b38bf53ca16cbf484a90f466.

Primarie indipendenti congelate prima delle candidature: propria primaria A220–224 commit 6951ab79682aa638f53cd6e00e5eb14458c63742 SHA 08e1a184ade8bd85a9d6d8f4b919b18105877f0c2007729ba514f0f48f36eb58; primaria del revisore A B225–229 commit 47cb9cbefc0def9db276d2ba106e3f2491b60e7f SHA 1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a. L’autore non ha aperto le risposte della primaria A, né candidati A220–224.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C4.json SHA256 19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c. Rilette le lezioni reali C4-L04 (polarizzazione e cariche legate), C4-L07 (capacità, dielettrici, energia e vincoli collegato/isolato), C4-L09 (prodotto vettoriale e lavoro magnetico nullo); fondazioni C1 e C4 già esistenti. Nessuna competenza inventata.

Stessa pipeline assemble_family/astra1, course C4 e unit u6, ID AR-<sourceId>, reuse C6. DRAFT; revisione scientifica indipendente NOT_RUN, humanApproval NOT_RUN, nessuna pubblicazione. Queste sono soluzioni e note dell’autore, non certificazioni indipendenti.

Tecnico reale: due assembly identici, hash source/candidate/provenance e opzioni letterali distinte; import canonico in SQLite temporaneo con 16 nuove bozze, poi 0 nuove e 16 invariate, 991 pubblicati byte-identici, nessuna nuova testa live. Operazioni sotto flock comune e guardia interna almeno 2 GiB liberi. Nessun registro, ledger, runtime o checkpoint modificato.

Render nativo SVG-only realmente terminato exit0 e immagine completa letta; PNG, risultato geometrico e checksum conservati in author-evidence/dielectric-connected-charge-226-asset-only. Non è UI del prodotto: axe, formule e overflow a 320 nel lettore NOT_RUN. Non esistono marker sintetici o nuovi giudizi scientifici ricavati dal render.

Geometria per il revisore, in coordinate intrinseche SVG: Primo pannello: due piastre con dielettrico completo e fili fino al generatore, polo positivo a sinistra coerente con armatura positiva, tensione2V. Sezione schematica, non scala spaziale dei campi. Barre A8μC/B6μC/media7μC da x150, lunghezze320/240/280, scala40coordinate/μC. Retta Q(C₀) aκ2 eV_g2V da(150,1300) a(470,1140), ossia(0,0)→(2μF,8μC), scale160coordinate/μF e20coordinate/μC. Le due scale non sono confrontabili come una sola quantità; labelorigine a sinistra, nessuna intersezione visiva.

## 01 — Il generatore mantiene la tensione

Il dielettrico porta la capacità a κC₀=4 μF. Il generatore mantiene due volt, quindi Q=CV_g=8 μC. A differenza del caso isolato, la carica libera può essere trasferita attraverso il circuito esterno: non deve rimanere quella iniziale.

Passaggi: `C=\kappa C_0\qquad C=4\,\mu\mathrm F\qquad Q=CV_g\qquad Q=8\,\mu\mathrm C`

Distrattori: Quattro μC è la carica prima dell’inserimento e ignora la capacità finale. Due μC dividerebbe per κ; sedici μC conterebbe insieme i moduli su entrambe le armature, cambiando la grandezza richiesta.

## 02 — Coulomb, non farad

La carica si misura in coulomb. La capacità ha unità farad, pari a coulomb per volt; moltiplicando la capacità per la tensione si ritrova il coulomb. Il prefisso micro non cambia questa dimensione.

Passaggi: `[Q]=\mathrm F\cdot\mathrm V\qquad [Q]=\mathrm C`

Distrattori: F indica capacità, V tensione, J energia e T campo magnetico. Nessuna di queste unità da sola esprime la carica richiesta.

## 03 — Collegato non significa carica fissata

Il generatore mantiene la differenza di potenziale. Il dielettrico aumenta la capacità e, per Q=CV_g, aumenta il modulo della carica libera su ciascuna armatura. Il materiale si polarizza; la carica libera aggiuntiva è trasferita dal circuito, non creata dalla polarizzazione.

Passaggi: `V_f=V_i=V_g\qquad C_f=\kappa C_0\qquad Q_f=\kappa Q_i`

Distrattori: Carica costante e tensione ridotta descrivono il condensatore isolato. L’energia del campo cambia e il suo bilancio va distinto da quello completo con generatore e lavoro meccanico. Per κ=1 soltanto, la capacità non cambia.

## 04 — Capacità iniziale raddoppiata

κ e la tensione sono uguali nelle due preparazioni. La capacità finale raddoppia da 4 a 8 μF e così la carica da 8 a 16 μC. La carica finale è lineare in C₀ a generatore mantenuto.

Passaggi: `Q_A=8\,\mu\mathrm C\qquad Q_B=16\,\mu\mathrm C\qquad Q_B/Q_A=2`

Distrattori: Quattro μC inverte l’effetto di C₀. Trentadue μC lo eleva al quadrato; otto μC imporrebbe una carica conservata non prevista dal circuito collegato.

## 05 — Ritrovare la capacità senza dielettrico

Isolo C₀=Q/(κV_g). Il denominatore è 2·2 V=4 V; otto μC diviso quattro volt dà 2 μF. Questa è la capacità prima dell’inserimento, non la capacità finale di 4 μF.

Passaggi: `C_0=\frac{Q}{\kappa V_g}\qquad C_0=\frac{8\,\mu\mathrm C}{4\,\mathrm V}\qquad C_0=2\,\mu\mathrm F`

Distrattori: Quattro μF divide soltanto per la tensione e restituisce C finale. Otto copia il numero della carica; un mezzo μF darebbe Q=2 μC invece degli otto misurati.

## 06 — κ da una misura di carica

La carica prima dell’inserimento sarebbe C₀V_g=4 μC. Il rapporto Q/(C₀V_g)=8/4=2 misura κ. È un numero puro almeno uguale a uno, non una carica espressa in microcoulomb.

Passaggi: `\kappa=\frac{Q}{C_0V_g}\qquad \kappa=\frac{8\,\mu\mathrm C}{4\,\mu\mathrm C}\qquad \kappa=2`

Distrattori: Un mezzo inverte il confronto e cade sotto il dominio ammesso. Quattro copia la capacità finale in μF come se fosse κ; sedici moltiplica ingressi che devono formare un rapporto.

## 07 — Il caso limite κ uguale a uno

B ha capacità 2 μF e carica 4 μC, mentre A ha 8 μC. Il rapporto è 1/2. Il caso κ=1 non annulla né la capacità né la carica: recupera il riferimento iniziale a due volt.

Passaggi: `Q_A=8\,\mu\mathrm C\qquad Q_B=4\,\mu\mathrm C\qquad Q_B/Q_A=\frac12`

Distrattori: Due inverte B/A. Un quarto applica un quadrato che non compare in Q=CV; zero tratta κ=1 come assenza del condensatore. Uno ignora la variazione della capacità.

## 08 — Differenza fra proposta e carica corretta

La carica corretta su una sola armatura è 8 μC. La proposta la supera di 16−8=8 μC. Il rapporto fra i due valori sarebbe due, ma lo scarto conserva l’unità di carica.

Passaggi: `Q=8\,\mu\mathrm C\qquad \delta Q=(16-8)\,\mu\mathrm C\qquad \delta Q=8\,\mu\mathrm C`

Distrattori: −8 μC scambia l’ordine. Sedici μC copia la proposta e zero non verifica la legge. Due puro è un rapporto, non la differenza richiesta.

## 09 — Invertire la legge della carica finale

Q=κC₀V_g contiene C₀ moltiplicata per due fattori positivi noti. Divido per entrambi: C₀=Q/(κV_g). Il rapporto ha unità coulomb per volt, dunque farad.

Passaggi: `Q=\kappa C_0V_g\qquad C_0=\frac{Q}{\kappa V_g}\qquad [C_0]=\mathrm{C/V}`

Distrattori: Moltiplicare per κ non annulla il suo effetto. QV_g è un’energia; κV_g/Q è una capacità inversa. Q/V_g ricava la capacità finale, non quella iniziale.

## 10 — Due variazioni che si moltiplicano

Il generatore mantiene due volt in entrambe le prove. Nella carica finale si moltiplicano capacità iniziale e costante relativa, quindi il rapporto è κ₁κ₂. Anche dopo la scalatura deve rimanere κ_B≥1.

Passaggi: `Q_B=(\kappa_2\kappa_A)(\kappa_1C_{0,A})V_g\qquad Q_B/Q_A=\kappa_1\kappa_2`

Distrattori: I quozienti invertono una dipendenza diretta. Il quadrato di κ₂ aggiunge una potenza non presente; la somma darebbe due anche per preparazioni identiche.

## 11 — Capacità minore e κ maggiore

Le cariche finali sono 8 e 6 μC. Il rapporto B/A è 3/4: il fattore 1/2 della capacità iniziale e il fattore 3/2 di κ si moltiplicano. L’aumento di κ non compensa completamente il dimezzamento di C₀.

Passaggi: `Q_A=8\,\mu\mathrm C\qquad Q_B=6\,\mu\mathrm C\qquad Q_B/Q_A=\frac34`

Distrattori: 4/3 inverte il confronto, 1/2 segue soltanto C₀ e 3/2 soltanto κ. Uno presumerebbe una compensazione esatta assente dai dati.

## 12 — Media delle uscite, non degli ingressi

La media di 8 e 6 μC è 7 μC. Ai valori medi C₀=3/2 μF e κ=5/2 corrisponderebbe invece Q=15/2 μC. Il prodotto degli ingressi non commuta in generale con la media; si stanno confrontando prove distinte.

Passaggi: `\overline Q=\frac{8+6}{2}\,\mu\mathrm C\qquad \overline Q=7\,\mu\mathrm C\qquad Q_{\rm dati\ medi}=\frac{15}{2}\,\mu\mathrm C`

Distrattori: 15/2 μC usa gli ingressi medi. Quattordici somma senza dividere per due; uno μC è la semidifferenza. Zero considera la carica netta delle due armature, non il modulo richiesto.

## 13 — Quale aumento di κ compensa la capacità?

Il bersaglio è 6 μC. Con C₀,B=1 μF e due volt, Q_B=(2 μC)κ_B, quindi κ_B=3. Rispetto al valore iniziale due occorre il fattore 3/2.

Passaggi: `Q_B=6\,\mu\mathrm C\qquad \kappa_B=3\qquad \kappa_B/\kappa_A=\frac32`

Distrattori: 2/3 inverte il fattore cercato. Tre quarti copia il rapporto delle cariche senza tener conto di C₀ dimezzata. Due imporrebbe κ_B=4 e Q_B=8 μC, fuori bersaglio.

## 14 — Tarare una misura di carica

Il riferimento ha Q_A=8 μC, dunque a_cal=3 μC⁻¹. La nuova lettura indica Q_B=6 μC. Divido per κ_BV_g=6 V: la capacità senza il dielettrico è 1 μF.

Passaggi: `a_{\rm cal}=3\,(\mu\mathrm C)^{-1}\qquad Q_B=6\,\mu\mathrm C\qquad C_{0,B}=1\,\mu\mathrm F`

Distrattori: Tre μF tratterebbe D=18 come 18 μC. Due μF dividerebbe Q solo per κ e salterebbe i due volt. Sei μF copia il numero di Q senza una divisione fisica.

## 15 — Offset, carica e capacità iniziale

I riferimenti hanno 8 e 6 μC. La pendenza è due per μC e l’offset uno. D_C=33 significa Q_C=(33−1)/2=16 μC. Dividendo per κ_CV_g=4 V ottengo C₀,C=4 μF.

Passaggi: `a_{\rm cal}=2\,(\mu\mathrm C)^{-1}\qquad b_{\rm cal}=1\qquad Q_C=16\,\mu\mathrm C\qquad C_{0,C}=4\,\mu\mathrm F`

Distrattori: 33/8 μF ignora l’offset e darebbe D=34. Otto μF salta il fattore due della tensione. Sedici μF copia la carica decodificata come se avesse unità di capacità.

## 16 — Un vincolo con una radice fisica

Il vincolo porta Q=(2 μC)κ². La misura otto impone κ²=4. Il dominio κ≥1 seleziona κ=2 e quindi C₀=2 μF: una sola preparazione ammissibile.

Passaggi: `Q=(2\,\mu\mathrm C)\kappa^2\qquad \kappa^2=4\qquad \kappa=2`

Distrattori: −2 è la radice algebrica esclusa anche dalla capacità positiva. Quattro omette la radice; otto copia il numero della carica. Non restano infinite coppie perché la misura non è ridondante.
