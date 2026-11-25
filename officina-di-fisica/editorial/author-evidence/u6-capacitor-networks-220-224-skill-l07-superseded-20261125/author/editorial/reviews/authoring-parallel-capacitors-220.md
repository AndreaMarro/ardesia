# Authoring DRAFT — parallel-capacitors-220

Letti individualmente tutti gli 80 prompt originali assegnati A220–224 prima di scrivere il primo candidato. Fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U6-04 SHA256 179bf1cacfb83482e32bb41e99cb78296990faafba1fe9ce3b0e3cbc3a6a09cf. Compiti e ID conservati, incluse eccezioni: 22006 polarità opposte e transitorio esaurito; 22106 capacità delle due topologie, senza falsa conservazione di una commutazione. Riletta integralmente la lezione reale C4-L07, capacità come Q/V, geometria piana, lavoro di carica e distinzione fra condensatore isolato e collegato; prerequisiti reali C4-L01/L03/L04 e C1-L001. Nessuna nuova lezione inventata.

Prima di candidature U604 entrambi i revisori avevano congelato la propria primaria: B per A220–224 SHA08e1a184ade8bd85a9d6d8f4b919b18105877f0c2007729ba514f0f48f36eb58 (non aperta dall’autore); A per B225–229 SHA1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a, lettura solo allowlist id/prompt senza opzioni o chiavi altrui.

Autore soltanto: DRAFT, revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica. Due processi separati dell’assembler unico producono byte identici. Importatore canonico ROOT read-only su SQLite temporaneo: 16 nuovi, poi 0 nuovi e 16 invariati, 991 pubblicati e relativo storico invariati. Sono prove tecniche, senza accredito d’integrazione.

Figura realmente prodotta nel browser soltanto come SVG inline a piena altezza, sotto mutex e guardia ≥2 GiB, processo terminale exit0. XML integrale e PNG intero sono stati letti; dimensioni e bounding box esatti nel manifest. Nessuna pagina dell’app aperta, nessun marker di UI prodotto creato o riusato. UI prodotto e layout a 320px NOT_RUN; collaudo canonico riservato all’integratore. I testi visibili usano grandezze fisiche, non metriche dell’implementazione.

## AR-u6-parallel-capacitors-01 — Due cariche alla stessa tensione

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. Con C₁=2 μF e C₂=3 μF, quanto vale S in μF?

Procedimento d’autore: La tensione comune permette di sommare le cariche: Q_A=C₁V+C₂V=(C₁+C₂)V. Il coefficiente cercato è quindi S=C₁+C₂=5 μF. Per esempio, a 2 V le cariche sono 4 e 6 μC e la somma 10 μC: divisa per 2 V restituisce proprio 5 μF.

Passaggi: Q_A=Q_1+Q_2;  Q_A=(C_1+C_2)V;  S=C_1+C_2;  S=5\,\mu\mathrm F.

Distrattori: 6/5 μF usa la legge della serie. Sei copia il prodotto dei numeri senza una divisione che ne ripristini l’unità; due e tre ignorano una capacità. L’equivalente in parallelo è maggiore di ciascun componente positivo.

Hint: Somma le cariche corrispondenti alla stessa tensione.

Fonte canonica SHA256 4165a3af87c1c08f79fbb50751f8951fb772ce2ce3324b118304102c81fa1cc6. Candidato SHA256 7449df8c63bb59c032af6d8481c591d818a9138075c4f82f43f9f2b4bd90574b. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-02 — La capacità non è una carica

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. Quale unità è adatta a S?

Procedimento d’autore: Il rapporto fra carica e tensione ha unità C/V, chiamata farad. Un μF è un milionesimo di farad: il prefisso cambia la scala e non la grandezza. Anche la somma C₁+C₂ conserva l’unità di capacità.

Passaggi: [S]=\mathrm{C/V};  [S]=\mathrm F.

Distrattori: C è coulomb, unità di carica, mentre C₁ e C₂ sono simboli di capacità. V misura tensione, J energia e 1 una quantità pura: nessuno di questi è l’unità di S.

Hint: Dividi una carica per una differenza di potenziale.

Fonte canonica SHA256 5732f8477e174d63c2615be84ed03fbd3aa424f4315a5511b915a294303a784a. Candidato SHA256 35f2a89ac83f53481016884aedd4924c6de8eee38fcb091ee21d3fad4f146168. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-03 — La legge del parallelo

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. Quale relazione dà S?

Procedimento d’autore: La connessione ai medesimi nodi rende uguali le tensioni. Sommando Q₁=C₁V e Q₂=C₂V si ottiene Q_A=(C₁+C₂)V. Il confronto con Q_A=SV identifica S=C₁+C₂. Non occorre assumere uguali le cariche dei due condensatori.

Passaggi: Q_1=C_1V;  Q_2=C_2V;  Q_A=(C_1+C_2)V;  S=C_1+C_2.

Distrattori: Il prodotto diviso la somma è la capacità di due elementi in serie con nodo intermedio neutro. La differenza può essere negativa; la somma dei reciproci ha F⁻¹ e il prodotto F². Nel parallelo si sommano le cariche a tensione comune.

Hint: Chiediti quale grandezza rende comune la topologia dei nodi.

Fonte canonica SHA256 ddbfd1b6d8baca5793822cba2c8e17c1f59d0eb940543267281edc7577190d31. Candidato SHA256 0755a7e68493bfd7b15c9d429fa090c59cfcad0474fc8db62acbf61579e92d56. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-04 — Si riduce soltanto C₁

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. C₁ passa da 2 a 1 μF; C₂ resta 3 μF. Come cambia S?

Procedimento d’autore: Prima S_A=2+3=5 μF. Dopo S_B=1+3=4 μF. La riduzione è un μF, uguale alla riduzione di C₁, perché l’altro addendo resta invariato. Dimezzare un componente non dimezza tutta la somma.

Passaggi: S_A=5\,\mu\mathrm F;  S_B=(1+3)\,\mu\mathrm F;  S_B=4\,\mu\mathrm F.

Distrattori: 5/2 μF dimezza erroneamente entrambi gli addendi. Cinque ignora il cambio, sei rende inversa la diminuzione e uno copia il solo C₁ nuovo. La topologia rimane parallela.

Hint: Mantieni invariato l’addendo da 3 μF.

Fonte canonica SHA256 b0ad5c5409ae5f528950fc7153f342a68bdb25965d45418b475ddcdfc067a972. Candidato SHA256 b7ab892008b03378c213490331166e43f96cbbd37388a7378acf40e706728d5d. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-05 — L’addendo mancante

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. Si misura S=5 μF e si conosce C₂=3 μF. Quanto vale C₁ in μF?

Procedimento d’autore: Dalla somma S=C₁+C₂ si sottrae C₂: C₁=S−C₂=2 μF. L’inversa passiva richiede S>C₂; qui 5>3. Reinserendo 2+3 si recupera la misura di 5 μF.

Passaggi: C_1=S-C_2;  C_1=(5-3)\,\mu\mathrm F;  C_1=2\,\mu\mathrm F.

Distrattori: Otto μF aggiunge il noto e darebbe un totale di 11 μF. Cinque μF copia S e darebbe 8 μF. Il confine S=C₂ richiederebbe C₁=0, escluso; S<C₂ darebbe una capacità negativa fuori dal modello.

Hint: Isola l’addendo e verifica che sia strettamente positivo.

Fonte canonica SHA256 980b1cbea69a7501aa92b23f53c3bd6f8620739d91d680b5dcfd42c60095ed74. Candidato SHA256 040074f654185ece42a025968702004461c2e95fdbe2fef55d8acc89b96a8fbc. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-06 — Polarità opposte: conservare il segno

Caso autonomo: C_a=1 μF è carico a 6 V e C_b=2 μF a 3 V. I generatori sono scollegati. L’armatura positiva di C_a viene unita alla negativa di C_b nel nodo A; le altre due formano B. Una piccola resistenza positiva nel collegamento permette al transitorio di esaurirsi; nessuna carica entra nei due nodi dall’esterno. Si chiede la tensione finale V_f=V_A−V_B, non quella istantanea durante il collegamento. Quanto vale?

Procedimento d’autore: Prima del contatto le armature che formeranno A portano +C_a·6 V=+6 μC e −C_b·3 V=−6 μC. La somma conservata è zero. Alla fine i condensatori sono in parallelo e Q_A=(C_a+C_b)V_f: con capacità totale 3 μF, V_f=0 V. La capacità equivalente non è zero; sono le cariche orientate iniziali a compensarsi.

Passaggi: Q_A=(6-6)\,\mu\mathrm C;  Q_A=0;  C_a+C_b=3\,\mu\mathrm F;  V_f=0\,\mathrm V.

Distrattori: Quattro V somma i due moduli e divide 12 μC per 3 μF, ignorando le polarità opposte; meno quattro inverte quella somma errata. Tre e sei copiano tensioni iniziali. L’energia iniziale può dissiparsi nella resistenza: non si impone la conservazione dell’energia del solo campo.

Hint: Assegna il segno alle cariche delle armature che formeranno lo stesso nodo.

Fonte canonica SHA256 80944fb512f5b542b2f9417342ae73193299658e5d5a9a014095a82e09fae8b3. Candidato SHA256 76a6029ca3f52f9981012b918772023f1693a5ae593d9a07996435584779c707. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-07 — Il rapporto delle somme

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. A usa C₁=2 μF, C₂=3 μF. B mantiene C₁ e usa C₂=1 μF. Quanto vale S_B/S_A?

Procedimento d’autore: L’equivalente A è 5 μF e B è 3 μF. Il rapporto è 3/5, puro: ogni capacità entra nell’uscita attraverso la somma. Il rapporto 1/3 delle sole C₂ non è il rapporto delle uscite perché C₁ non è stata eliminata.

Passaggi: S_A=5\,\mu\mathrm F;  S_B=3\,\mu\mathrm F;  S_B/S_A=\frac35.

Distrattori: 5/3 è il reciproco; 1/3 segue il solo C₂; tre copia il numero dell’equivalente B in μF. Uno ignora la modifica. Entrambi gli equivalenti restano maggiori delle rispettive capacità singole.

Hint: Calcola entrambe le somme prima di confrontarle.

Fonte canonica SHA256 14265b7165556573e8602dc2fee4b6dea8d8a34369626e54d561123f25b16cee. Candidato SHA256 5c4a2510f14f5c6cff92dedb9438f5d031c2304c6f5057f6e36c89e016196270. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-08 — Uno scarto con unità

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. Con C₁=2 μF e C₂=3 μF si propone S=10 μF. Quanto vale proposta meno corretto?

Procedimento d’autore: La somma corretta è 5 μF. La proposta la supera di 10−5=5 μF. Il numero puro due è il rapporto e non mantiene l’unità dello scarto richiesto.

Passaggi: S=5\,\mu\mathrm F;  e=(10-5)\,\mu\mathrm F;  e=5\,\mu\mathrm F.

Distrattori: −5 μF scambia l’ordine, dieci copia la proposta e zero la accetta. Due confronta per divisione; una differenza di capacità deve invece essere espressa in un’unità di capacità.

Hint: Sottrai il corretto dalla proposta nello stesso ordine del testo.

Fonte canonica SHA256 3270a103ba161343ee2715718c44aeeff8a048eb0c4ba5e2076fce18c542e819. Candidato SHA256 3b3fc1bd3a8a2ed07f5f5e04dc7f7eb1cd02beb47fe8d0a7fdb36e2f1da8f35f. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-09 — L’inversa del parallelo

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. S e C₂ sono noti. Quale formula isola C₁?

Procedimento d’autore: Sottraendo lo stesso addendo C₂ dai due membri della somma si ottiene C₁=S−C₂. Il dato S deve essere maggiore di C₂ per rientrare nel modello con entrambi i componenti positivi. La differenza conserva l’unità farad.

Passaggi: S=C_1+C_2;  C_1=S-C_2;  S>C_2.

Distrattori: Il più non isola l’addendo; C₂−S dà un valore negativo nel dominio. S/C₂ è puro. La differenza dei reciproci ha F⁻¹ e appartiene a un’altra manipolazione, non all’inversa della somma.

Hint: Controlla sia l’algebra sia la positività dell’incognita.

Fonte canonica SHA256 27b1e1f9a0784f5782bb28907cf15d490578e0a7f68a5d189b5ba43b04191996. Candidato SHA256 6c78905a5428306da9bd47b17cee7aa8617f8d0949957bdf42ac62722949b27d. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-10 — Scalature con pesi diversi

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. B usa C₁,B=κ₁C₁ e C₂,B=κ₂C₂, con fattori positivi. Definiamo S_B=κ₁C₁+κ₂C₂. Quanto vale S_B/S?

Procedimento d’autore: Ciascun addendo conserva il proprio fattore. La somma nuova è S_B=κ₁C₁+κ₂C₂ e si divide per S=C₁+C₂. Una scalatura comune κ₁=κ₂=κ dà S_B/S=κ, non κ²; i pesi delle due capacità non vanno persi.

Passaggi: S_B=\kappa_1C_1+\kappa_2C_2;  \frac{S_B}{S}=\frac{\kappa_1C_1+\kappa_2C_2}{S}.

Distrattori: Il prodotto ignora che si somma e non si moltiplica. Il quoziente dei soli fattori perde i pesi; S/S_B inverte il confronto. La somma κ₁+κ₂ darebbe due anche per prove identiche.

Hint: Scala separatamente ciascun addendo, poi dividi per la somma originale.

Fonte canonica SHA256 c7eebad30fddebdaf6cad34449633d2f5bbae1c5874ff4a23838d77d20905299. Candidato SHA256 1287602bcfdac1f51de61379899ea7e22390c51a905b80e0eec659699fce4a13. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-11 — Entrambe le capacità cambiano

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. A usa C₁=2 μF, C₂=3 μF. B usa C₁=3 μF, C₂=5 μF. Quanto vale S_B/S_A?

Procedimento d’autore: A ha S_A=5 μF; B ha S_B=8 μF. Il rapporto è 8/5. I fattori 3/2 e 5/3 dei singoli componenti non sono uguali: nessuno dei due può essere applicato indistintamente alla somma.

Passaggi: S_A=5\,\mu\mathrm F;  S_B=8\,\mu\mathrm F;  S_B/S_A=\frac85.

Distrattori: 5/8 inverte il confronto; 3/2 segue solo C₁ e 5/3 solo C₂. Due darebbe un equivalente di 10 μF e non gli 8 μF ricavati dalla nuova somma.

Hint: Non scegliere il fattore di un solo componente quando cambiano entrambi.

Fonte canonica SHA256 11093bb50024798825f5a8dd554c337d20836c7c3bd6eafb21ff675a3a39662f. Candidato SHA256 0c7459dd17e5e77864a65bcff24133a00be86f8e145a30c37b37af086a20a9ec. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-12 — La media coincide per linearità

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. A usa 2 e 3 μF; B usa 3 e 5 μF. Qual è la media aritmetica delle due S con uguale peso?

Procedimento d’autore: Le uscite sono 5 e 8 μF. La media vale 13/2 μF. Anche le capacità medie 5/2 e 4 μF danno 13/2 μF: la coincidenza è una conseguenza della linearità S=C₁+C₂, non una regola da trasferire a qualunque rete.

Passaggi: \overline S=\frac{5+8}{2}\,\mu\mathrm F;  \overline S=\frac{13}{2}\,\mu\mathrm F;  \frac52+4=\frac{13}{2}.

Distrattori: Tredici non divide per due; 3/2 è metà della differenza. Cinque e otto ripetono una sola uscita. Qui il modello ai dati medi coincide con la media richiesta e va spiegato perché.

Hint: Media le due somme e riconosci la linearità.

Fonte canonica SHA256 1e24e7fc20e42f1f8d0908b89ca02473558ff9509c2da1357a79cf753e0fe99f. Candidato SHA256 d2179b3073fe0aba56dce30048c586eccee12246924abcd4a66169b38e1877d5. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-13 — C₂ per il bersaglio

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. A ha C₁=2 μF, C₂=3 μF. B usa C₁=3 μF e deve avere S_B=(8/5)S_A. Quanto vale C₂,B/C₂,A?

Procedimento d’autore: Il bersaglio è S_B=(8/5)·5 μF=8 μF. Sottraendo il nuovo C₁=3 μF si ottiene C₂,B=5 μF. Il rapporto con C₂,A=3 μF è 5/3, non il fattore dell’intera somma.

Passaggi: S_B=8\,\mu\mathrm F;  C_{2,B}=(8-3)\,\mu\mathrm F;  \frac{C_{2,B}}{C_{2,A}}=\frac53.

Distrattori: 3/5 inverte il confronto, 8/5 copia il rapporto delle somme, 3/2 segue C₁. Uno manterrebbe C₂=3 μF e darebbe S_B=6 μF, inferiore al bersaglio.

Hint: Trova prima la somma bersaglio e poi l’addendo mancante.

Fonte canonica SHA256 e226414ed01566e44ebc2d11943b18d49cb4a8e9fa22ac2f33284d993db94ebd. Candidato SHA256 941e4e6ca520f81e439d341a74ea8e7fdef8b7e9c8970fe8fc2641395c996b99. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-14 — Rimuovere il guadagno

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. D=a_cal S è continuo e adimensionale, a_cal>0. A con C₁=2 μF, C₂=3 μF dà D=15. B legge D=24 e ha C₂=5 μF. Quanto vale C₁,B in μF?

Procedimento d’autore: Il riferimento ha S_A=5 μF, quindi a_cal=15/(5 μF)=3 μF⁻¹. La lettura 24 indica S_B=8 μF. Sottraendo C₂=5 μF si trova C₁,B=3 μF. Ricomponendo il totale si torna alla lettura 24.

Passaggi: a_{\rm cal}=3\,(\mu\mathrm F)^{-1};  S_B=8\,\mu\mathrm F;  C_{1,B}=3\,\mu\mathrm F.

Distrattori: Diciannove μF usa D=24 come capacità totale e predirebbe una lettura 72. Otto μF copia il totale senza sottrarre il noto; cinque copia C₂. Il guadagno non è una capacità aggiunta al circuito.

Hint: Decodifica la capacità equivalente prima di sottrarre C₂.

Fonte canonica SHA256 bc2aaa5879b8a4652863bb44218146c512afcee806d6fb81f96a3110647ed575. Candidato SHA256 7beb0206ef680a57b925f20a320c09fc1e64f235fee185807a263adb03f24127. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-15 — Prima l’offset, poi la somma

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. D=a_cal S+b è continuo. A: C₁=2 μF, C₂=3 μF, D=11. B: C₁=3 μF, C₂=5 μF, D=17. C: C₂=1 μF, D=5. Quanto vale C₁,C?

Procedimento d’autore: Le somme dei riferimenti sono 5 e 8 μF. Il guadagno è (17−11)/(8−5)=2 μF⁻¹ e l’offset vale 1. Lettura 5 dà S_C=(5−1)/2 μF=2 μF. Tolto C₂=1 μF resta C₁,C=1 μF, strettamente positivo.

Passaggi: a_{\rm cal}=2\,(\mu\mathrm F)^{-1};  b=1;  S_C=2\,\mu\mathrm F;  C_{1,C}=1\,\mu\mathrm F.

Distrattori: 3/2 μF omette l’offset e ricostruisce D=6. Due μF copia l’equivalente e dà D=7; quattro μF dà una somma di 5 μF e ricostruisce D=11; cinque usa D come se fosse l’incognita e dà D=13.

Hint: Sottrai b, dividi per il guadagno e infine togli l’addendo noto.

Fonte canonica SHA256 1fe83405d3b4009dcc79ba5c81cb91d0b3db3f6e4abc31b240b798231a49927f. Candidato SHA256 4ae6f19b1df59c0f2abfc8475b691969c23cf6c03286c517188552e253945994. Revisione indipendente e human NOT_RUN.

## AR-u6-parallel-capacitors-16 — Il vincolo fissa la scala

Due condensatori lineari ideali, con capacità finite positive C₁ e C₂, sono collegati fra la stessa coppia di nodi A e B. V=V_A−V_B>0 è comune alle due coppie di armature. Q₁ e Q₂ sono i moduli sulle armature connesse ad A; Q_A=Q₁+Q₂ è la carica di quel nodo, non la carica netta di entrambe le armature. La capacità equivalente S è definita da Q_A=SV. Si confrontano preparazioni in regime elettrostatico; i valori di capacità non cambiano entro una prova. Fra preparazioni vale C₁=(2/3)C₂. Si misura S=5 μF. Quanto vale C₂?

Procedimento d’autore: Sostituendo il vincolo nella somma: S=(2/3)C₂+C₂=(5/3)C₂. La misura 5 μF implica C₂=(3/5)·5 μF=3 μF e C₁=2 μF. A differenza del solo rapporto delle capacità, l’equivalente misurato fornisce qui una scala assoluta.

Passaggi: S=\frac53C_2;  C_2=\frac35S;  C_2=3\,\mu\mathrm F.

Distrattori: Due μF è C₁, non C₂. Cinque copia il totale. Il valore negativo viola la passività; infinite capacità ignorerebbe l’informazione della misura S, che elimina la scala libera del solo rapporto.

Hint: Inserisci il vincolo nella legge prima di decidere se la misura è ridondante.

Fonte canonica SHA256 dc034612d8cba9f3e98e3b774e0febbbcd0cdacebad4e9c44c1911e73381aa05. Candidato SHA256 1c90e3d9b161ad9c40238ba0a6107e37c6594349a5554b8538941bbe13e2b397. Revisione indipendente e human NOT_RUN.

## Lettura geometrica d’autore

Pannello 1: stessi nodi verticali A/B uniscono due condensatori schematici, senza nodo intermedio in serie. A 2 V le cariche 4/6 μC sommano 10 μC. Pannello 2 autonomo: barre orientate +6 e −6 μC lunghe entrambe 120 coordinate dall’origine orizzontale y740; scala20 coordinate/μC comune, zero146 separato dall’asse180. Capacità totale3 μF e tensione0 sono distinti. Pannello 3: barre200/320/260 per5/8/13/2 μF, origine150 e scala40 coordinate/μF comune; zero118 libero. Nessuna coordinata intrinseca è proposta come misura di pixel fisici responsive. Tutte le etichette viste libere nel PNG640×1500.

## Provenienza tecnica

Asset SHA256 02c6619b2df62e021cdeb7b0f5f0f954f1a289a402b6a60c680f6ec5632283f6. Package file SHA256 88356b6e37fc7ad784b4c3159725bbb11d456887c2ec2e19bb205abc92aa563d. Binding file SHA256 c496b6bf67d4fb74fed0cc375664edb4fd6754f73ff19517ef18bfeea9c92fb1. Prova strutturale SHA256 ccf1beaeae057e8620dbfc05cfddb8033bbd2459ea5e441ca6f10c7e1221e952. Manifest asset-only SHA256 e5092e2b78158eeeac9223f1e7b241ffb5e95c6958e6a9e3cdbb2954cbf6f32d.

Nessun runtime, registry, ledger, checkpoint, candidato o Git ROOT modificato. Revisore distinto B assegnato; le sue derivazioni non sono state aperte dall’autore.

## Finding distinto sulla notazione delle unità

Nel terzo pannello le somme numeriche sono ora racchiuse fra parentesi prima di μF, così l’unità si applica a entrambi gli addendi. Assert XML: tutti tag e attributi geometrici/stilistici identici; il solo testo cambia. Strictdiff package: record01/06/12 cambiano soltanto il riferimento all’asset, altri13 record e tutte le chiavi/formule/caption identici. Binding delle tre figure rigenerati. Precedenti byte e vero native preservati con checksum nell’archivio peer-svg-units-superseded. Due nuove assembly/import16→0/16 e nuovo render browser-native completo640×1500 reale exit0, interamente visto. Non si attribuisce alla nuova versione il vecchio PNG; UI prodotto e nuova SCI distinta NOT_RUN.
