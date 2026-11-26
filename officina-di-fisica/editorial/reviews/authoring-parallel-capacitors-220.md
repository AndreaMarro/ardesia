# Authoring DRAFT — parallel-capacitors-220

Letti individualmente tutti gli 80 prompt originali assegnati A220–224 prima di scrivere il primo candidato. Fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U6-04 SHA256 179bf1cacfb83482e32bb41e99cb78296990faafba1fe9ce3b0e3cbc3a6a09cf. Compiti e ID conservati, incluse eccezioni: 22006 polarità opposte e transitorio esaurito; 22106 capacità delle due topologie, senza falsa conservazione di una commutazione. Rilette integralmente le lezioni reali C4-L07 e C4-L08: L07 definisce il singolo condensatore e resta prerequisito; L08 tratta reti, tensioni in serie, carica dei nodi e dissipazione nella condivisione ed è la competenza primaria corretta dei presenti quesiti. Prerequisiti reali C4-L01/L03/L04/L07/L08 e C1-L001. Nessuna nuova lezione inventata.

Prima di candidature U604 entrambi i revisori avevano congelato la propria primaria: B per A220–224 SHA08e1a184ade8bd85a9d6d8f4b919b18105877f0c2007729ba514f0f48f36eb58 (non aperta dall’autore); A per B225–229 SHA1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a, lettura solo allowlist id/prompt senza opzioni o chiavi altrui.

Autore soltanto: DRAFT, revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica. Due processi separati dell’assembler unico producono byte identici. L’import positivo 16→0/16 con 991 pubblicati invariati appartiene alla precedente edizione, preservata in archivio. Per i presenti byte con nuova mappatura, import PENDING_ROOT_REMOTE; non si trasferisce il precedente esito.

Figura realmente prodotta nel browser soltanto come SVG inline a piena altezza, sotto mutex e guardia ≥2 GiB, processo terminale exit0. XML integrale e PNG intero sono stati letti; dimensioni e bounding box esatti nel manifest. Nessuna pagina dell’app aperta, nessun marker di UI prodotto creato o riusato. UI prodotto e layout a 320px NOT_RUN; collaudo canonico riservato all’integratore. I testi visibili usano grandezze fisiche, non metriche dell’implementazione.

## AR-u6-parallel-capacitors-01 — Due cariche alla stessa tensione

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. Con C₁=2 μF e C₂=3 μF, quanto vale S in μF?

Procedimento d’autore: La tensione comune permette di sommare le cariche: Q_A=C₁V+C₂V=(C₁+C₂)V. Il coefficiente cercato è quindi S=C₁+C₂=5 μF. Per esempio, a 2 V le cariche sono 4 e 6 μC e la somma 10 μC: divisa per 2 V restituisce proprio 5 μF.

Passaggi: Q_A=Q_1+Q_2;  Q_A=(C_1+C_2)V;  S=C_1+C_2;  S=5\,\mu\mathrm F.

Distrattori: 6/5 μF usa la legge della serie. Sei copia il prodotto dei numeri senza una divisione che ne ripristini l’unità; due e tre ignorano una capacità. L’equivalente in parallelo è maggiore di ciascun componente positivo.

Hint: Somma le cariche corrispondenti alla stessa tensione.

Fonte canonica SHA256 4165a3af87c1c08f79fbb50751f8951fb772ce2ce3324b118304102c81fa1cc6. Candidato SHA256 9f68eee1e0003218c30e1e4ab0608dee551e445a2f4e9fc4bab9f7b04ee6c0d5. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-02 — La capacità non è una carica

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. Quale unità è adatta a S?

Procedimento d’autore: Il rapporto fra carica e tensione ha unità C/V, chiamata farad. Un μF è un milionesimo di farad: il prefisso cambia la scala e non la grandezza. Anche la somma C₁+C₂ conserva l’unità di capacità.

Passaggi: [S]=\mathrm{C/V};  [S]=\mathrm F.

Distrattori: C è coulomb, unità di carica, mentre C₁ e C₂ sono simboli di capacità. V misura tensione, J energia e 1 una quantità pura: nessuno di questi è l’unità di S.

Hint: Dividi una carica per una differenza di potenziale.

Fonte canonica SHA256 5732f8477e174d63c2615be84ed03fbd3aa424f4315a5511b915a294303a784a. Candidato SHA256 61b464f05fcae8f97c98d2e0ae3df3410308595ac7aac6a7813836a302274f24. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-03 — La legge del parallelo

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. Quale relazione dà S?

Procedimento d’autore: La connessione ai medesimi nodi rende uguali le tensioni. Sommando Q₁=C₁V e Q₂=C₂V si ottiene Q_A=(C₁+C₂)V. Il confronto con Q_A=SV identifica S=C₁+C₂. Non occorre assumere uguali le cariche dei due condensatori.

Passaggi: Q_1=C_1V;  Q_2=C_2V;  Q_A=(C_1+C_2)V;  S=C_1+C_2.

Distrattori: Il prodotto diviso la somma è la capacità di due elementi in serie con nodo intermedio neutro. La differenza può essere negativa; la somma dei reciproci ha F⁻¹ e il prodotto F². Nel parallelo si sommano le cariche a tensione comune.

Hint: Chiediti quale grandezza rende comune la topologia dei nodi.

Fonte canonica SHA256 ddbfd1b6d8baca5793822cba2c8e17c1f59d0eb940543267281edc7577190d31. Candidato SHA256 835a1beff936287908caa9d490eac3f6c87f2d00d1f5c82ebc2c59d365546c41. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-04 — Si riduce soltanto C₁

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. C₁ passa da 2 a 1 μF; C₂ resta 3 μF. Come cambia S?

Procedimento d’autore: Prima S_A=2+3=5 μF. Dopo S_B=1+3=4 μF. La riduzione è un μF, uguale alla riduzione di C₁, perché l’altro addendo resta invariato. Dimezzare un componente non dimezza tutta la somma.

Passaggi: S_A=5\,\mu\mathrm F;  S_B=(1+3)\,\mu\mathrm F;  S_B=4\,\mu\mathrm F.

Distrattori: 5/2 μF dimezza erroneamente entrambi gli addendi. Cinque ignora il cambio, sei rende inversa la diminuzione e uno copia il solo C₁ nuovo. La topologia rimane parallela.

Hint: Mantieni invariato l’addendo da 3 μF.

Fonte canonica SHA256 b0ad5c5409ae5f528950fc7153f342a68bdb25965d45418b475ddcdfc067a972. Candidato SHA256 d1dd0e6075a8ff2af72e45888a832643bf6bd9c7de79407a7fbcb68780bb4afa. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-05 — L’addendo mancante

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. Si misura S=5 μF e si conosce C₂=3 μF. Quanto vale C₁ in μF?

Procedimento d’autore: Dalla somma S=C₁+C₂ si sottrae C₂: C₁=S−C₂=2 μF. L’inversa passiva richiede S>C₂; qui 5>3. Reinserendo 2+3 si recupera la misura di 5 μF.

Passaggi: C_1=S-C_2;  C_1=(5-3)\,\mu\mathrm F;  C_1=2\,\mu\mathrm F.

Distrattori: Otto μF aggiunge il noto e darebbe un totale di 11 μF. Cinque μF copia S e darebbe 8 μF. Il confine S=C₂ richiederebbe C₁=0, escluso; S<C₂ darebbe una capacità negativa fuori dal modello.

Hint: Isola l’addendo e verifica che sia strettamente positivo.

Fonte canonica SHA256 980b1cbea69a7501aa92b23f53c3bd6f8620739d91d680b5dcfd42c60095ed74. Candidato SHA256 534dc73da1a02d921738cfec25954e4f736259ee1a991ad2728731cfe1188e5d. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-06 — Polarità opposte: conservare il segno

Caso autonomo: C_a=1 μF è carico a 6 V e C_b=2 μF a 3 V. I generatori sono scollegati. L’armatura positiva di C_a viene unita alla negativa di C_b nel nodo A; le altre due formano B. Una piccola resistenza positiva nel collegamento permette al transitorio di esaurirsi; nessuna carica entra nei due nodi dall’esterno. Si chiede la tensione finale V_f=V_A−V_B, non quella istantanea durante il collegamento. Quanto vale?

Procedimento d’autore: Prima del contatto le armature che formeranno A portano +C_a·6 V=+6 μC e −C_b·3 V=−6 μC. La somma conservata è zero. Alla fine i condensatori sono in parallelo e Q_A=(C_a+C_b)V_f: con capacità totale 3 μF, V_f=0 V. La capacità equivalente non è zero; sono le cariche orientate iniziali a compensarsi.

Passaggi: Q_A=(6-6)\,\mu\mathrm C;  Q_A=0;  C_a+C_b=3\,\mu\mathrm F;  V_f=0\,\mathrm V.

Distrattori: Quattro V somma i due moduli e divide 12 μC per 3 μF, ignorando le polarità opposte; meno quattro inverte quella somma errata. Tre e sei copiano tensioni iniziali. L’energia iniziale può dissiparsi nella resistenza: non si impone la conservazione dell’energia del solo campo.

Hint: Assegna il segno alle cariche delle armature che formeranno lo stesso nodo.

Fonte canonica SHA256 80944fb512f5b542b2f9417342ae73193299658e5d5a9a014095a82e09fae8b3. Candidato SHA256 e90bba7ff534873fd8993aeaefb159f7aed98ffbcece603be74ab69eff553ec1. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-07 — Il rapporto delle somme

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. A usa C₁=2 μF, C₂=3 μF. B mantiene C₁ e usa C₂=1 μF. Quanto vale S_B/S_A?

Procedimento d’autore: L’equivalente A è 5 μF e B è 3 μF. Il rapporto è 3/5, puro: ogni capacità entra nell’uscita attraverso la somma. Il rapporto 1/3 delle sole C₂ non è il rapporto delle uscite perché C₁ non è stata eliminata.

Passaggi: S_A=5\,\mu\mathrm F;  S_B=3\,\mu\mathrm F;  S_B/S_A=\frac35.

Distrattori: 5/3 è il reciproco; 1/3 segue il solo C₂; tre copia il numero dell’equivalente B in μF. Uno ignora la modifica. Entrambi gli equivalenti restano maggiori delle rispettive capacità singole.

Hint: Calcola entrambe le somme prima di confrontarle.

Fonte canonica SHA256 14265b7165556573e8602dc2fee4b6dea8d8a34369626e54d561123f25b16cee. Candidato SHA256 395d6958a4dc3e7c18f643e533643d99a098225abf37af4272620717732c3d6f. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-08 — Uno scarto con unità

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. Con C₁=2 μF e C₂=3 μF si propone S=10 μF. Quanto vale proposta meno corretto?

Procedimento d’autore: La somma corretta è 5 μF. La proposta la supera di 10−5=5 μF. Il numero puro due è il rapporto e non mantiene l’unità dello scarto richiesto.

Passaggi: S=5\,\mu\mathrm F;  e=(10-5)\,\mu\mathrm F;  e=5\,\mu\mathrm F.

Distrattori: −5 μF scambia l’ordine, dieci copia la proposta e zero la accetta. Due confronta per divisione; una differenza di capacità deve invece essere espressa in un’unità di capacità.

Hint: Sottrai il corretto dalla proposta nello stesso ordine del testo.

Fonte canonica SHA256 3270a103ba161343ee2715718c44aeeff8a048eb0c4ba5e2076fce18c542e819. Candidato SHA256 9405d830d7d954749030a566bdffc2694466ce19776f933e32ade7ea3f65206e. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-09 — L’inversa del parallelo

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. S e C₂ sono noti. Quale formula isola C₁?

Procedimento d’autore: Sottraendo lo stesso addendo C₂ dai due membri della somma si ottiene C₁=S−C₂. Il dato S deve essere maggiore di C₂ per rientrare nel modello con entrambi i componenti positivi. La differenza conserva l’unità farad.

Passaggi: S=C_1+C_2;  C_1=S-C_2;  S>C_2.

Distrattori: Il più non isola l’addendo; C₂−S dà un valore negativo nel dominio. S/C₂ è puro. La differenza dei reciproci ha F⁻¹ e appartiene a un’altra manipolazione, non all’inversa della somma.

Hint: Controlla sia l’algebra sia la positività dell’incognita.

Fonte canonica SHA256 27b1e1f9a0784f5782bb28907cf15d490578e0a7f68a5d189b5ba43b04191996. Candidato SHA256 d50ecdc854a9404c262a4816b767714b9eeddc7dbaa69eff790193595e13382b. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-10 — Scalature con pesi diversi

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. B usa C₁,B=κ₁C₁ e C₂,B=κ₂C₂, con fattori positivi. Definiamo S_B=κ₁C₁+κ₂C₂. Quanto vale S_B/S?

Procedimento d’autore: Ciascun addendo conserva il proprio fattore. La somma nuova è S_B=κ₁C₁+κ₂C₂ e si divide per S=C₁+C₂. Una scalatura comune κ₁=κ₂=κ dà S_B/S=κ, non κ²; i pesi delle due capacità non vanno persi.

Passaggi: S_B=\kappa_1C_1+\kappa_2C_2;  \frac{S_B}{S}=\frac{\kappa_1C_1+\kappa_2C_2}{S}.

Distrattori: Il prodotto ignora che si somma e non si moltiplica. Il quoziente dei soli fattori perde i pesi; S/S_B inverte il confronto. La somma κ₁+κ₂ darebbe due anche per prove identiche.

Hint: Scala separatamente ciascun addendo, poi dividi per la somma originale.

Fonte canonica SHA256 c7eebad30fddebdaf6cad34449633d2f5bbae1c5874ff4a23838d77d20905299. Candidato SHA256 85ad79be6ad344d7c9c811601fc745e4c2190442a4048d1f92aa49e8ea50bfee. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-11 — Entrambe le capacità cambiano

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. A usa C₁=2 μF, C₂=3 μF. B usa C₁=3 μF, C₂=5 μF. Quanto vale S_B/S_A?

Procedimento d’autore: A ha S_A=5 μF; B ha S_B=8 μF. Il rapporto è 8/5. I fattori 3/2 e 5/3 dei singoli componenti non sono uguali: nessuno dei due può essere applicato indistintamente alla somma.

Passaggi: S_A=5\,\mu\mathrm F;  S_B=8\,\mu\mathrm F;  S_B/S_A=\frac85.

Distrattori: 5/8 inverte il confronto; 3/2 segue solo C₁ e 5/3 solo C₂. Due darebbe un equivalente di 10 μF e non gli 8 μF ricavati dalla nuova somma.

Hint: Non scegliere il fattore di un solo componente quando cambiano entrambi.

Fonte canonica SHA256 11093bb50024798825f5a8dd554c337d20836c7c3bd6eafb21ff675a3a39662f. Candidato SHA256 d0e873c9f1cd490bbaed81dded1b18e84b5f12c4a875fc17eb78f8ce7e6675f0. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-12 — La media coincide per linearità

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. A usa 2 e 3 μF; B usa 3 e 5 μF. Qual è la media aritmetica delle due S con uguale peso?

Procedimento d’autore: Le uscite sono 5 e 8 μF. La media vale 13/2 μF. Anche le capacità medie 5/2 e 4 μF danno 13/2 μF: la coincidenza è una conseguenza della linearità S=C₁+C₂, non una regola da trasferire a qualunque rete.

Passaggi: \overline S=\frac{5+8}{2}\,\mu\mathrm F;  \overline S=\frac{13}{2}\,\mu\mathrm F;  \frac52+4=\frac{13}{2}.

Distrattori: Tredici non divide per due; 3/2 è metà della differenza. Cinque e otto ripetono una sola uscita. Qui il modello ai dati medi coincide con la media richiesta e va spiegato perché.

Hint: Media le due somme e riconosci la linearità.

Fonte canonica SHA256 1e24e7fc20e42f1f8d0908b89ca02473558ff9509c2da1357a79cf753e0fe99f. Candidato SHA256 72b49c7e755a32fdd9fbb1cbe7ac66323eef38f1a2a23e8d296c888585e67253. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-13 — C₂ per il bersaglio

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. A ha C₁=2 μF, C₂=3 μF. B usa C₁=3 μF e deve avere S_B=(8/5)S_A. Quanto vale C₂,B/C₂,A?

Procedimento d’autore: Il bersaglio è S_B=(8/5)·5 μF=8 μF. Sottraendo il nuovo C₁=3 μF si ottiene C₂,B=5 μF. Il rapporto con C₂,A=3 μF è 5/3, non il fattore dell’intera somma.

Passaggi: S_B=8\,\mu\mathrm F;  C_{2,B}=(8-3)\,\mu\mathrm F;  \frac{C_{2,B}}{C_{2,A}}=\frac53.

Distrattori: 3/5 inverte il confronto, 8/5 copia il rapporto delle somme, 3/2 segue C₁. Uno manterrebbe C₂=3 μF e darebbe S_B=6 μF, inferiore al bersaglio.

Hint: Trova prima la somma bersaglio e poi l’addendo mancante.

Fonte canonica SHA256 e226414ed01566e44ebc2d11943b18d49cb4a8e9fa22ac2f33284d993db94ebd. Candidato SHA256 49a4b079b81ae2c2b8e53b440eb0305936e471e6f126bc7cdaffde08064a3c2c. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-14 — Rimuovere il guadagno

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. D=a_cal S è continuo e adimensionale, a_cal>0. A con C₁=2 μF, C₂=3 μF dà D=15. B legge D=24 e ha C₂=5 μF. Quanto vale C₁,B in μF?

Procedimento d’autore: Il riferimento ha S_A=5 μF, quindi a_cal=15/(5 μF)=3 μF⁻¹. La lettura 24 indica S_B=8 μF. Sottraendo C₂=5 μF si trova C₁,B=3 μF. Ricomponendo il totale si torna alla lettura 24.

Passaggi: a_{\rm cal}=3\,(\mu\mathrm F)^{-1};  S_B=8\,\mu\mathrm F;  C_{1,B}=3\,\mu\mathrm F.

Distrattori: Diciannove μF usa D=24 come capacità totale e predirebbe una lettura 72. Otto μF copia il totale senza sottrarre il noto; cinque copia C₂. Il guadagno non è una capacità aggiunta al circuito.

Hint: Decodifica la capacità equivalente prima di sottrarre C₂.

Fonte canonica SHA256 bc2aaa5879b8a4652863bb44218146c512afcee806d6fb81f96a3110647ed575. Candidato SHA256 942a569f52dc72aa57a1b194e6c613ef05048f29a39f91a6879ac65956766a81. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-15 — Prima l’offset, poi la somma

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. D=a_cal S+b è continuo. A: C₁=2 μF, C₂=3 μF, D=11. B: C₁=3 μF, C₂=5 μF, D=17. C: C₂=1 μF, D=5. Quanto vale C₁,C?

Procedimento d’autore: Le somme dei riferimenti sono 5 e 8 μF. Il guadagno è (17−11)/(8−5)=2 μF⁻¹ e l’offset vale 1. Lettura 5 dà S_C=(5−1)/2 μF=2 μF. Tolto C₂=1 μF resta C₁,C=1 μF, strettamente positivo.

Passaggi: a_{\rm cal}=2\,(\mu\mathrm F)^{-1};  b=1;  S_C=2\,\mu\mathrm F;  C_{1,C}=1\,\mu\mathrm F.

Distrattori: 3/2 μF omette l’offset e ricostruisce D=6. Due μF copia l’equivalente e dà D=7; quattro μF dà una somma di 5 μF e ricostruisce D=11; cinque usa D come se fosse l’incognita e dà D=13.

Hint: Sottrai b, dividi per il guadagno e infine togli l’addendo noto.

Fonte canonica SHA256 1fe83405d3b4009dcc79ba5c81cb91d0b3db3f6e4abc31b240b798231a49927f. Candidato SHA256 98b17ed15820878b21606cbef3dd08b9825f96be145143e18d4ad834bfcdc311. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-16 — Il vincolo fissa la scala

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. Fra preparazioni vale C₁=(2/3)C₂. Si misura S=5 μF. Quanto vale C₂?

Procedimento d’autore: Sostituendo il vincolo nella somma: S=(2/3)C₂+C₂=(5/3)C₂. La misura 5 μF implica C₂=(3/5)·5 μF=3 μF e C₁=2 μF. A differenza del solo rapporto delle capacità, l’equivalente misurato fornisce qui una scala assoluta.

Passaggi: S=\frac53C_2;  C_2=\frac35S;  C_2=3\,\mu\mathrm F.

Distrattori: Due μF è C₁, non C₂. Cinque copia il totale. Il valore negativo viola la passività; infinite capacità ignorerebbe l’informazione della misura S, che elimina la scala libera del solo rapporto.

Hint: Inserisci il vincolo nella legge prima di decidere se la misura è ridondante.

Fonte canonica SHA256 dc034612d8cba9f3e98e3b774e0febbbcd0cdacebad4e9c44c1911e73381aa05. Candidato SHA256 d9405eca8dacb0e3386fdbe780be69e0826591c211170792898e027ef117bb14. Revisione indipendente e human NOT_RUN.

## Lettura geometrica d’autore

Pannello 1: stessi nodi verticali A/B uniscono due condensatori schematici, senza nodo intermedio in serie. A 2 V le cariche 4/6 μC sommano 10 μC. Pannello 2 autonomo: barre orientate +6 e −6 μC lunghe entrambe 120 coordinate dall’origine orizzontale y740; scala20 coordinate/μC comune, zero146 separato dall’asse180. Capacità totale3 μF e tensione0 sono distinti. Pannello 3: barre200/320/260 per5/8/13/2 μF, origine150 e scala40 coordinate/μF comune; zero118 libero. Nessuna coordinata intrinseca è proposta come misura di pixel fisici responsive. Tutte le etichette viste libere nel PNG640×1500.

## Provenienza tecnica

Asset SHA256 02c6619b2df62e021cdeb7b0f5f0f954f1a289a402b6a60c680f6ec5632283f6. Package file SHA256 26b3c0dcb54f85d2815f405dfdfc33f6bd5b2354750c76d0df2bd0512fada9b8. Binding file SHA256 72502761c473fa50694f544da49584fa17355b611af2d4d83380e34be0a37e15. Prova strutturale SHA256 34e98bf337cd71cc75387a7961451085fd37e964d3e3ce5460b6f029427a6f35. Manifest asset-only SHA256 e5092e2b78158eeeac9223f1e7b241ffb5e95c6958e6a9e3cdbb2954cbf6f32d.

Nessun runtime, registry, ledger, checkpoint, candidato o Git ROOT modificato. Revisore distinto B assegnato; le sue derivazioni non sono state aperte dall’autore.

## Finding distinto sulla notazione delle unità

Nel terzo pannello le somme numeriche sono ora racchiuse fra parentesi prima di μF, così l’unità si applica a entrambi gli addendi. Assert XML: tutti tag e attributi geometrici/stilistici identici; il solo testo cambia. Strictdiff package: record01/06/12 cambiano soltanto il riferimento all’asset, altri13 record e tutte le chiavi/formule/caption identici. Binding delle tre figure rigenerati. Precedenti byte e vero native preservati con checksum nell’archivio peer-svg-units-superseded. Due nuove assembly/import16→0/16 e nuovo render browser-native completo640×1500 reale exit0, interamente visto. Non si attribuisce alla nuova versione il vecchio PNG; UI prodotto e nuova SCI distinta NOT_RUN.

## Correzione di mappatura didattica dopo review distinta

La lezione originale C4-L08 «Mettere insieme i condensatori», riletta nel pin Cric5d1d, è il riferimento primario per questa famiglia. Aggiornati soltanto skill, error.target e aggiunta della competenza esistente L08 ai prerequisiti, conservando L07. Ogni altro campo dei sedici record, tutte le formule e le scelte e ogni byte SVG sono identici per confronto strutturale. Due nuove assembly effettive exit0 e identiche; nessun nuovo render necessario per asset immutato. I precedenti import/report SCI sono conservati nell’archivio con checksum e restano storici sulle vecchie firme. Import finale PENDING_ROOT_REMOTE; nessun nuovo DB locale, come autorizzato dall’integratore. Revisione scientifica distinta delle nuove associazioni e human NOT_RUN, DRAFT e publicationAction NONE.
