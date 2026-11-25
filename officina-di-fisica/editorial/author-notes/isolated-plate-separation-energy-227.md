# isolated-plate-separation-energy-227 — note dell’autore

Fonte immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605: packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-04.json. Raw SHA256 179bf1cacfb83482e32bb41e99cb78296990faafba1fe9ce3b0e3cbc3a6a09cf. Tutti gli 80 prompt B225–229 letti prima di questi candidati tramite allowlist id/prompt/familyId/lawFamily; nessuna opzione, chiave, soluzione o hint originali. Snapshot allowlist160 SHA256 4aec8d0bacfbd7c9d3b712a5d0d9de7e24a80e66b38bf53ca16cbf484a90f466.

Primarie indipendenti congelate prima delle candidature: propria primaria A220–224 commit 6951ab79682aa638f53cd6e00e5eb14458c63742 SHA 08e1a184ade8bd85a9d6d8f4b919b18105877f0c2007729ba514f0f48f36eb58; primaria del revisore A B225–229 commit 47cb9cbefc0def9db276d2ba106e3f2491b60e7f SHA 1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a. L’autore non ha aperto le risposte della primaria A, né candidati A220–224.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C4.json SHA256 19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c. Rilette le lezioni reali C4-L04 (polarizzazione e cariche legate), C4-L07 (capacità, dielettrici, energia e vincoli collegato/isolato), C4-L09 (prodotto vettoriale e lavoro magnetico nullo); fondazioni C1 e C4 già esistenti. Nessuna competenza inventata.

Stessa pipeline assemble_family/astra1, course C4 e unit u6, ID AR-<sourceId>, reuse C6. DRAFT; revisione scientifica indipendente NOT_RUN, humanApproval NOT_RUN, nessuna pubblicazione. Queste sono soluzioni e note dell’autore, non certificazioni indipendenti.

Tecnico reale: due assembly identici, hash source/candidate/provenance e opzioni letterali distinte; import canonico in SQLite temporaneo con 16 nuove bozze, poi 0 nuove e 16 invariate, 991 pubblicati byte-identici, nessuna nuova testa live. Operazioni sotto flock comune e guardia interna almeno 2 GiB liberi. Nessun registro, ledger, runtime o checkpoint modificato.

Render nativo SVG-only realmente terminato exit0 e immagine completa letta; PNG, risultato geometrico e checksum conservati in author-evidence/isolated-plate-separation-energy-227-asset-only. Non è UI del prodotto: axe, formule e overflow a 320 nel lettore NOT_RUN. Non esistono marker sintetici o nuovi giudizi scientifici ricavati dal render.

Geometria per il revisore, in coordinate intrinseche SVG: Sezioni con facce interne a110/160 e380/480: distanze50 e100, rapporto2, area laterale schematica e Q invariata. Nessun generatore. Barre U_A4/U_B9/media13/2μJ da x150 con lunghezze128/288/208, scala32coordinate/μJ. Retta aU₀2μJ rappresentata solo fra s1 es3: punti(250,1260) e(450,1180), assi con origine(150,1300), scale100coordinate/s e20coordinate/μJ. Punto iniziale incluso, nessuna estensione grafica nel dominio s<1. La crescita dell’energia del campo non è descritta come creazione di energia.

## 01 — Allontanare le piastre a carica fissata

La capacità è inversa alla distanza: C=C₀/s. L’isolamento conserva il modulo Q della carica libera su ciascuna armatura. Usando U=Q²/(2C), dividere C per s moltiplica l’energia per s: U=sU₀=4 μJ. L’aumento non nasce dal nulla: separare le piastre richiede apporto meccanico.

Passaggi: `C=C_0/s\qquad U=\frac{Q^2}{2C}\qquad U=sU_0\qquad U=4\,\mu\mathrm J`

Distrattori: Un μJ userebbe la dipendenza a tensione mantenuta, incompatibile con l’isolamento. Due μJ imporrebbe energia del campo costante. Otto μJ applicherebbe s² invece di s.

## 02 — Energia, non tensione

L’energia si misura in joule. Nella relazione U=Q²/(2C), coulomb al quadrato divisi per farad danno C·V=J. Il prefisso micro corrisponde a un milionesimo di joule.

Passaggi: `[U]=\mathrm{C^2/F}\qquad [U]=\mathrm{C\cdot V}\qquad [U]=\mathrm J`

Distrattori: V misura tensione, C carica, F capacità. W è potenza, cioè energia divisa per tempo, e non energia da sola.

## 03 — La legge dopo il vincolo di isolamento

La geometria dà C₀/C=s. Poiché Q è lo stesso nei due stati, il rapporto delle energie Q²/(2C) è proprio C₀/C. Quindi U=sU₀: una capacità minore trattiene la stessa carica a tensione e a energia maggiori.

Passaggi: `\frac{U}{U_0}=\frac{C_0}{C}\qquad \frac{C_0}{C}=s\qquad U=sU_0`

Distrattori: U₀/s applica erroneamente la legge a V costante. Le potenze s² e 1/s² ignorano che la capacità varia già come 1/s e Q resta fissata; U=U₀ omette il lavoro meccanico possibile.

## 04 — Preparare un’energia iniziale doppia

Le due preparazioni iniziali sono distinte. L’allontanamento moltiplica per due entrambe le energie iniziali: A dà 4 μJ, B dà 8 μJ. La carica resta fissa durante ciascun allontanamento, ma non è imposto lo stesso Q fra le due preparazioni.

Passaggi: `U_A=2\cdot2\,\mu\mathrm J\qquad U_B=2\cdot4\,\mu\mathrm J\qquad U_B=8\,\mu\mathrm J`

Distrattori: Due μJ dividerebbe per s. Sedici μJ introdurrebbe un altro fattore due senza vincolo aggiuntivo. Quattro μJ ignorerebbe la diversa energia iniziale.

## 05 — Ricostruire l’energia iniziale

L’inversa è U₀=U/s. Quattro microjoule divisi per due danno 2 μJ. Poiché s≥1, l’energia iniziale non supera quella finale nel modello a carica fissata.

Passaggi: `U_0=U/s\qquad U_0=2\,\mu\mathrm J`

Distrattori: Otto μJ moltiplica invece di dividere e non ricostruisce U=4 μJ. Quattro μJ trascura l’allontanamento. Un mezzo μJ darebbe U=1 μJ, non il valore misurato.

## 06 — Un fattore geometrico senza unità

Dal rapporto delle energie segue s=U/U₀=2. Le unità si cancellano. Il risultato è compatibile con un allontanamento; un valore sotto uno indicherebbe avvicinamento, escluso da questo quesito.

Passaggi: `s=\frac{U}{U_0}\qquad s=2\qquad d=2d_0`

Distrattori: Un mezzo inverte finale e iniziale e viola s≥1. Otto moltiplica le energie; quattro copia il numero dell’energia finale come fattore.

## 07 — Il riferimento senza separazione aggiuntiva

A termina con 4 μJ. In B s=1 lascia la distanza iniziale e quindi U_B=2 μJ. Il rapporto B/A è 1/2; nessuna energia finale si annulla solo perché non si allontanano le piastre.

Passaggi: `U_A=4\,\mu\mathrm J\qquad U_B=2\,\mu\mathrm J\qquad U_B/U_A=\frac12`

Distrattori: Due inverte il confronto. Uno ignora il diverso s, un quarto introduce un quadrato e zero confonde variazione di energia nulla con energia finale nulla.

## 08 — Proposta ed energia finale

La legge dà 4 μJ. Lo scarto richiesto è 8−4=+4 μJ, mentre due sarebbe il rapporto della proposta alla soluzione. La variazione corretta rispetto a U₀ è un’altra differenza, pari a 2 μJ.

Passaggi: `U=4\,\mu\mathrm J\qquad \delta U=(8-4)\,\mu\mathrm J\qquad \delta U=4\,\mu\mathrm J`

Distrattori: −4 μJ scambia l’ordine. Otto μJ copia la proposta e zero non la confronta col modello. Due puro non ha l’unità di uno scarto energetico.

## 09 — Isolare U₀ nella legge fisica

U=sU₀ contiene un fattore geometrico positivo e adimensionale. Dividendo per s si ottiene U₀=U/s. L’inversa mantiene la dimensione di energia e richiede U>0 e s≥1.

Passaggi: `U=sU_0\qquad U_0=\frac Us\qquad 0<U_0\le U`

Distrattori: sU ripete la trasformazione diretta. s/U ha unità di energia inversa; U−s sottrae un numero puro da un’energia. Il quadrato non segue dalla geometria di questo processo.

## 10 — Due scalature ammissibili

U dipende linearmente sia dall’energia iniziale sia dal fattore di separazione. Le due scalature si moltiplicano: U_B/U_A=κ₁κ₂. Devono restare validi s≥1 e il regime geometrico a bordi trascurabili in entrambe le prove.

Passaggi: `U_B=(\kappa_2s_A)(\kappa_1U_{0,A})\qquad U_B/U_A=\kappa_1\kappa_2`

Distrattori: I quozienti invertono una dipendenza diretta. Il quadrato di κ₂ trasferisce una legge diversa; la somma vale due per fattori unitari e non supera la prova delle preparazioni identiche.

## 11 — Preparazioni diverse, stesso modello

A dà 4 μJ e B dà 9 μJ. Il rapporto è 9/4. In questo caso entrambi gli ingressi crescono del fattore 3/2 e il loro prodotto vale 9/4; non è una legge quadratica in s a U₀ fissata.

Passaggi: `U_A=4\,\mu\mathrm J\qquad U_B=9\,\mu\mathrm J\qquad U_B/U_A=\frac94`

Distrattori: 4/9 inverte B/A. 3/2 considera un solo ingresso; 9/2 divide per il numero iniziale U₀,A invece che per l’uscita U_A. Uno trascura il confronto.

## 12 — Media delle energie dopo l’allontanamento

La media delle uscite 4 e 9 μJ è 13/2 μJ. Agli ingressi medi U₀=5/2 μJ e s=5/2 si otterrebbero 25/4 μJ, inferiori di 1/4 μJ. Il prodotto di due ingressi variabili non è una funzione lineare congiunta.

Passaggi: `\overline U=\frac{4+9}{2}\,\mu\mathrm J\qquad \overline U=\frac{13}{2}\,\mu\mathrm J\qquad U_{\rm dati\ medi}=\frac{25}{4}\,\mu\mathrm J`

Distrattori: 25/4 μJ usa gli ingressi medi. Tredici μJ non divide per due; 5/2 μJ è la semidifferenza. Zero non rappresenta una media di due energie positive.

## 13 — Il fattore di separazione richiesto

Il bersaglio è (9/4)4 μJ=9 μJ. Divido per U₀,B=3 μJ e ricavo s_B=3. Il rapporto geometrico cercato è 3/2, con entrambi i fattori almeno uno.

Passaggi: `U_B=9\,\mu\mathrm J\qquad s_B=3\qquad s_B/s_A=\frac32`

Distrattori: 2/3 inverte il confronto. 9/4 copia il rapporto energetico senza compensare U₀ diversa. Due darebbe s_B=4 e U_B=12 μJ, oltre il bersaglio.

## 14 — Dalla lettura all’energia iniziale

A ha energia finale 4 μJ, perciò a_cal=3 μJ⁻¹. D_B=27 indica U_B=9 μJ. Dividendo per s_B=3 ottengo U₀,B=3 μJ; la taratura riguarda U, non direttamente U₀.

Passaggi: `a_{\rm cal}=3\,(\mu\mathrm J)^{-1}\qquad U_B=9\,\mu\mathrm J\qquad U_{0,B}=3\,\mu\mathrm J`

Distrattori: Nove μJ salta la divisione fisica per s dopo la taratura. Ventisette μJ copia D come un’energia e salta entrambi i passaggi. Un μJ darebbe U_B=3 μJ e D=9.

## 15 — L’offset non è energia iniziale

I riferimenti danno U_A=4 e U_B=9 μJ. La pendenza vale due per μJ e l’offset uno. D_C=17 decodifica U_C=8 μJ; con s_C=2 l’energia iniziale era 4 μJ.

Passaggi: `a_{\rm cal}=2\,(\mu\mathrm J)^{-1}\qquad b_{\rm cal}=1\qquad U_C=8\,\mu\mathrm J\qquad U_{0,C}=4\,\mu\mathrm J`

Distrattori: 17/4 μJ omette l’offset e predice D=18. Otto μJ copia l’energia finale senza dividere per s. Sedici μJ darebbe U_C=32 μJ e D=65.

## 16 — Un vincolo quadratico nella separazione

Sostituendo il vincolo si ottiene U=(1 μJ)s². Il dato finale quattro impone s²=4. Il dominio s≥1 seleziona s=2, con U₀=2 μJ: una sola coppia ammessa.

Passaggi: `U=(1\,\mu\mathrm J)s^2\qquad s^2=4\qquad s=2`

Distrattori: −2 è la radice algebrica incompatibile con una distanza positiva. Quattro omette la radice; un mezzo descriverebbe avvicinamento e non soddisfa la misura. Il vincolo non rende U costante.
